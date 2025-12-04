import { CommonModule } from '@angular/common';
import { Component, inject, input, numberAttribute, OnInit } from '@angular/core';
import { ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'projection-input',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './projection-input.html',
  styleUrl: './projection-input.scss',
})
export class ProjectionInput implements OnInit {
  private controlContainer = inject(ControlContainer);
  public min = input(2, { transform: numberAttribute });
  public max = input(14, { transform: numberAttribute });
  public label = input('');
  public rangevalues: number[] = [];

  public formGroup!: FormGroup;

  public ngOnInit(): void {
    this.formGroup = this.controlContainer.control as FormGroup;

    this.rangevalues = [...Array(this.max() + 1)]
      .map((_, i) => i)
      .slice(this.min())
      .filter((v) => v % 2 === 0);
  }
}
