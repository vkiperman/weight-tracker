import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { WeightEntryForm } from './weight-entry-form';

@Component({
  template: `
    <div [formGroup]="formGroup">
      <weight-entry-form (submitted)="onSubmit()" (cancelled)="onCancel()">
        <select id="test-select"></select>
      </weight-entry-form>
    </div>
  `,
  imports: [ReactiveFormsModule, WeightEntryForm],
})
class TestHostComponent {
  formGroup = new FormGroup({
    x: new FormControl<Date>(new Date()),
    y: new FormControl<number | null>(175.5),
    message: new FormControl<string | null>('test message'),
  });
  submitted = false;
  cancelled = false;

  onSubmit(): void {
    this.submitted = true;
  }

  onCancel(): void {
    this.cancelled = true;
  }
}

describe('WeightEntryForm', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the h2 title', () => {
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2.textContent).toContain('Enter Weight');
  });

  it('should project ng-content for date select', () => {
    const select = fixture.nativeElement.querySelector('#test-select');
    expect(select).toBeTruthy();
  });

  it('should emit submitted when form is submitted', () => {
    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    expect(component.submitted).toBeTrue();
  });

  it('should emit cancelled when cancel button is clicked', () => {
    const cancelButton = fixture.nativeElement.querySelector('button[type="button"]');
    cancelButton.click();
    expect(component.cancelled).toBeTrue();
  });

  it('should bind to y formControlName for weight input', () => {
    const input = fixture.nativeElement.querySelector('input[type="number"]');
    expect(input.value).toBe('175.5');
  });

  it('should bind to message formControlName for textarea', () => {
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.value).toBe('test message');
  });

  it('should disable save button when form is invalid', () => {
    component.formGroup.get('y')?.setErrors({ tooLow: true });
    fixture.detectChanges();
    const saveButton = fixture.nativeElement.querySelector('button:not([type="button"])');
    expect(saveButton.disabled).toBeTrue();
  });

  it('should display error message when weight is too low', () => {
    component.formGroup.get('y')?.setErrors({ tooLow: true });
    fixture.detectChanges();
    const errorSpan = fixture.nativeElement.querySelector('.error');
    expect(errorSpan.textContent).toContain('Weight seems too low.');
  });

  it('should display error message when weight is too high', () => {
    component.formGroup.get('y')?.setErrors({ tooHigh: true });
    fixture.detectChanges();
    const errorSpan = fixture.nativeElement.querySelector('.error');
    expect(errorSpan.textContent).toContain('Weight seems too high.');
  });
});
