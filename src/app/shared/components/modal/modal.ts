import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  public readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  public open(): void {
    this.dialogRef().nativeElement.showModal();
  }

  public close(): void {
    this.dialogRef().nativeElement.close();
  }

  protected closeOnBackdropClick(event: PointerEvent): void {
    const dialog = this.dialogRef().nativeElement;
    const { left, right, top, bottom } = dialog.getBoundingClientRect();

    if (
      left > event.clientX ||
      right < event.clientX ||
      top > event.clientY ||
      bottom < event.clientY
    ) {
      this.close();
    }
  }
}
