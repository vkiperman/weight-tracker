import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, output } from '@angular/core';
import { ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Autoselect } from '@app/shared/directives/autoselect';

@Component({
  selector: 'weight-entry-form',
  imports: [ReactiveFormsModule, CommonModule, Autoselect],
  templateUrl: './weight-entry-form.html',
  styleUrl: './weight-entry-form.scss',
})
export class WeightEntryForm implements OnInit {
  private controlContainer = inject(ControlContainer);

  public submitted = output<void>();
  public cancelled = output<void>();

  public formGroup!: FormGroup;

  public ngOnInit(): void {
    this.formGroup = this.controlContainer.control as FormGroup;
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.emit();
  }

  public onCancel(): void {
    this.cancelled.emit();
  }
}
