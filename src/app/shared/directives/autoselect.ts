import { AfterViewInit, Directive, ElementRef, inject, input } from '@angular/core';

export type AutoselectMode = 'start' | 'end' | 'all' | '';

@Directive({
  selector: 'input[autoselect], textarea[autoselect]',
  host: {
    '(focus)': 'onFocus()',
  },
})
export class Autoselect implements AfterViewInit {
  private readonly el = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);

  private static undefinedToEmpty(value: AutoselectMode | undefined): AutoselectMode {
    return value ?? '';
  }

  /** Mode: 'start' places cursor at start, 'end' at end, 'all' selects all text */
  public readonly autoselect = input<AutoselectMode, AutoselectMode | undefined>(undefined, {
    transform: Autoselect.undefinedToEmpty,
  });

  /** Custom start position for selection (overrides mode) */
  public readonly start = input<number | undefined>(undefined);

  /** Custom end position for selection (overrides mode) */
  public readonly end = input<number | undefined>(undefined);

  public ngAfterViewInit(): void {
    this.applySelection();
  }

  public onFocus(): void {
    this.applySelection();
  }

  private applySelection(): void {
    const element = this.el.nativeElement;
    const value = element.value ?? '';
    const { length } = value;

    const customStart = this.start();
    const customEnd = this.end();

    // For number inputs, setSelectionRange doesn't work in most browsers
    // Use select() for full selection, which works on all input types
    const isNumberInput = element instanceof HTMLInputElement && element.type === 'number';

    // If custom start/end are provided, use them
    if (customStart !== undefined || customEnd !== undefined) {
      const selStart = customStart ?? 0;
      const selEnd = customEnd ?? length;

      isNumberInput ? element.select() : element.setSelectionRange(selStart, selEnd);
      return;
    }

    // Otherwise, use the mode
    switch (this.autoselect()) {
      case 'start':
        if (!isNumberInput) {
          element.setSelectionRange(0, 0);
        }
        break;
      case 'end':
        if (!isNumberInput) {
          element.setSelectionRange(length, length);
        }
        break;
      case 'all':
      case '':
      default:
        element.select();
        break;
    }
  }
}
