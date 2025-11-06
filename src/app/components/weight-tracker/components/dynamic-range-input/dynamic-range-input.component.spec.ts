import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlContainer, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { appConfig } from '../../../../app.config';
import { DynamicRangeInputComponent } from './dynamic-range-input.component';

describe('DynamicRangeInputComponent', () => {
  let component: DynamicRangeInputComponent;
  let fixture: ComponentFixture<DynamicRangeInputComponent>;

  const formGroupDirective = new FormGroupDirective([], []);
  formGroupDirective.form = new FormGroup({
    range: new FormControl(),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicRangeInputComponent],
      providers: [
        ...appConfig.providers,
        { provide: ControlContainer, useValue: formGroupDirective },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicRangeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
