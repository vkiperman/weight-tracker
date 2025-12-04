import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ProjectionInput } from './projection-input';

@Component({
  template: `
    <form [formGroup]="formGroup">
      <projection-input [label]="label" [min]="min" [max]="max" />
    </form>
  `,
  imports: [ReactiveFormsModule, ProjectionInput],
})
class TestHostComponent {
  formGroup = new FormGroup({
    projectionSampleSize: new FormControl<number>(7),
  });
  label = 'Test Label';
  min = 2;
  max = 14;
}

describe('ProjectionInput', () => {
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

  it('should display the label', () => {
    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent).toContain('Test Label');
  });

  it('should use default min and max values', () => {
    const input = fixture.nativeElement.querySelector('input[type="range"]');
    expect(input.min).toBe('2');
    expect(input.max).toBe('14');
  });

  it('should generate even rangevalues between min and max', () => {
    const options = fixture.nativeElement.querySelectorAll('datalist option');
    expect(options.length).toBe(7); // 2, 4, 6, 8, 10, 12, 14
  });

  it('should bind to projectionSampleSize formControlName', () => {
    const input = fixture.nativeElement.querySelector('input[type="range"]');
    expect(input.value).toBe('7');
  });
});
