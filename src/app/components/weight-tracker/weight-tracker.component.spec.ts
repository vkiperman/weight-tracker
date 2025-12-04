import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { weightTrackerConfigReducer as weightTrackerConfig } from '../../store/weight-tracker-config/weight-tracker-config.reducer';
import { storageItemName, WeightTrackerComponent } from './weight-tracker.component';

describe('WeightTrackerComponent', () => {
  let component: WeightTrackerComponent;
  let fixture: ComponentFixture<WeightTrackerComponent>;

  const data = [
    { x: new Date('2025-01-01T00:00:00.000Z'), y: 150 },
    { x: new Date('2025-01-02T00:00:00.000Z'), y: 149 },
    { x: new Date('2025-01-03T00:00:00.000Z'), y: 147 },
    { x: new Date('2025-01-04T00:00:00.000Z'), y: 149 },
    { x: new Date('2025-01-05T00:00:00.000Z'), y: 149 },
  ];

  beforeEach(async () => {
    localStorage.setItem(storageItemName, JSON.stringify(data));
    await TestBed.configureTestingModule({
      imports: [WeightTrackerComponent, StoreModule.forRoot({ weightTrackerConfig })],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(WeightTrackerComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    component.canvasJSChart().options = component.data();

    component.configForm.get('projectionSampleSize')?.setValue(8);
  });

  afterEach(() => {
    localStorage.removeItem(storageItemName);
  });

  it('should updateWeights and return void due to error', () => {
    spyOn(component.canvasJSChart().chart, 'render');
    component.form.get('y')?.setErrors({ tooHigh: true });
    const dialog = document.createElement('dialog');
    expect(component.updateWeights(dialog)).toBeUndefined();
    expect(component.canvasJSChart().chart.render).not.toHaveBeenCalled();
    // expect(component.todayIsRecorded()).toBeFalse();
    expect(component.dynamicRange.get('range')?.value).toEqual(data.length);
    expect(dialog.open).toBeFalse();
  });

  it('should updateWeights', () => {
    spyOn(component.canvasJSChart().chart, 'render');
    const dialog = document.createElement('dialog');
    expect(component.updateWeights(dialog)).toBeUndefined();
    expect(component.canvasJSChart().chart.render).toHaveBeenCalled();
    // expect(component.todayIsRecorded()).toBeTrue();
    expect(component.dynamicRange.get('range')?.value).toEqual(data.length);
    expect(dialog.open).toBeFalse();
  });

  it('should stop validation if last entry was two weeks ago', () => {
    component.form.get('y')?.setValue(100);
    expect(component.form.get('y')?.errors).toEqual({ tooLow: true });
  });

  it('should do weight validation when weight is too low', () => {
    component.form.get('x')?.setValue(new Date('2025-01-05T00:00:00.000Z'));
    component.form.get('y')?.setValue(100);
    expect(component.form.get('y')?.errors).toEqual({ tooLow: true });
  });

  it('should do weight validation when weight is too high', () => {
    component.form.get('x')?.setValue(new Date('2025-01-05T00:00:00.000Z'));
    component.form.get('y')?.setValue(200);
    expect(component.form.get('y')?.errors).toEqual({ tooHigh: true });
  });

  it('should handleShowTooltip', () => {
    spyOn(component.canvasJSChart().chart.toolTip, 'showAtX');
    component.handleShowTooltip(data[0].y);
    expect(component.canvasJSChart().chart.toolTip.showAtX).toHaveBeenCalledWith(data[0].x);
  });

  it('should hide a tooltip', () => {
    spyOn(component.canvasJSChart().chart.toolTip, 'hide');
    component.handleHideTooltip();
    expect(component.canvasJSChart().chart.toolTip.hide).toHaveBeenCalled();
  });

  it('should getDiff with date', () => {
    const diff = component.getDiff(new Date('2025-01-03T00:00:00.000Z').getDate());
    expect(diff.value).toEqual('2.00');
    expect(diff.className).toEqual('up');
  });

  it('should getDiff without date', () => {
    jasmine.clock().install().mockDate(new Date('2025-01-03T00:00:00.000Z'));

    const diff = component.getDiff();
    expect(diff.value).toEqual('0.00');
    expect(diff.className).toEqual('down');
    jasmine.clock().uninstall();
  });
});
