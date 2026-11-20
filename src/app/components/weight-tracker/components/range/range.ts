import {
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-range',
  imports: [],
  templateUrl: './range.html',
  styleUrl: './range.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Range),
      multi: true,
    },
  ],
})
export class Range implements ControlValueAccessor {
  public min = input(0, { transform: numberAttribute });
  public max = input(100, { transform: numberAttribute });
  public step = input(1, { transform: numberAttribute });
  /** Values at which to draw tick marks (replaces a native <datalist>). */
  public ticks = input<number[]>([]);
  public ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  protected value = signal(0);
  protected disabled = signal(false);
  protected dragging = signal(false);

  private track = viewChild.required<ElementRef<HTMLElement>>('track');

  /** Position of the current value along the track, 0–100. */
  protected percent = computed(() => this.toPercent(this.value()));

  protected tickMarks = computed(() =>
    this.ticks()
      // Hide the stop under the handle, as Material does.
      .filter((t) => t >= this.min() && t <= this.max() && t !== this.value())
      .map((t) => ({ value: t, percent: this.toPercent(t), active: t <= this.value() })),
  );

  private onChange: (value: number) => void = () => {};
  protected onTouched: () => void = () => {};

  public writeValue(value: number | null): void {
    this.value.set(this.clamp(value ?? this.min()));
  }

  public registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.disabled() || event.button !== 0) return;
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    target.focus();
    this.dragging.set(true);
    this.updateFromPointer(event.clientX);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging()) return;
    this.updateFromPointer(event.clientX);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.dragging()) return;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    this.dragging.set(false);
    this.onTouched();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const step = this.step();
    const bigStep = Math.max(step, (this.max() - this.min()) / 10);
    const current = this.value();
    const next: Record<string, number> = {
      ArrowRight: current + step,
      ArrowUp: current + step,
      ArrowLeft: current - step,
      ArrowDown: current - step,
      PageUp: current + bigStep,
      PageDown: current - bigStep,
      Home: this.min(),
      End: this.max(),
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    this.setValue(next[event.key]);
  }

  private updateFromPointer(clientX: number): void {
    const rect = this.track().nativeElement.getBoundingClientRect();
    const ratio = rect.width ? (clientX - rect.left) / rect.width : 0;
    this.setValue(this.min() + ratio * (this.max() - this.min()));
  }

  private setValue(raw: number): void {
    const value = this.clamp(raw);
    if (value === this.value()) return;
    this.value.set(value);
    this.onChange(value);
  }

  /** Clamp to [min, max] and snap to the nearest step. */
  private clamp(raw: number): number {
    const min = this.min();
    const max = this.max();
    const step = this.step() || 1;
    const snapped = min + Math.round((raw - min) / step) * step;
    return Math.min(max, Math.max(min, Number(snapped.toFixed(10))));
  }

  private toPercent(value: number): number {
    const span = this.max() - this.min();
    return span ? ((value - this.min()) / span) * 100 : 0;
  }
}
