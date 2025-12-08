import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Modal } from '@app/shared/components/modal/modal';
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

  const createMockModal = (): Modal => {
    const modalFixture = TestBed.createComponent(Modal);
    modalFixture.detectChanges();
    return modalFixture.componentInstance;
  };

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
    const renderSpy = spyOn(component.canvasJSChart().chart, 'render');
    component.form.get('y')?.setErrors({ tooHigh: true });
    const modal = createMockModal();
    spyOn(modal, 'close');
    renderSpy.calls.reset();
    expect(component.updateWeights(modal)).toBeUndefined();
    expect(renderSpy).not.toHaveBeenCalled();
    expect(component.dynamicRange.get('range')?.value).toEqual(data.length);
    expect(modal.close).not.toHaveBeenCalled();
  });

  it('should updateWeights', () => {
    spyOn(component.canvasJSChart().chart, 'render');
    const modal = createMockModal();
    spyOn(modal, 'close');
    expect(component.updateWeights(modal)).toBeUndefined();
    expect(component.canvasJSChart().chart.render).toHaveBeenCalled();
    expect(component.dynamicRange.get('range')?.value).toEqual(data.length);
    expect(modal.close).toHaveBeenCalled();
  });

  it('should stop validation if last entry was two weeks ago', () => {
    // The last entry in test data is Jan 5, 2025. Mock today to be more than 2 weeks later.
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2025-01-20T00:00:00.000Z'));

    // Re-trigger form change by setting x to "today" and y to an extreme value
    component.form.get('x')?.setValue(new Date('2025-01-20T00:00:00.000Z'));
    component.form.get('y')?.setValue(100);

    // Since sinceLastEntry >= 14, validation is skipped - no errors should be set
    expect(component.form.get('y')?.errors).toBeNull();

    jasmine.clock().uninstall();
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

  it('should clear errors when weight is valid', () => {
    component.form.get('x')?.setValue(new Date('2025-01-05T00:00:00.000Z'));
    component.form.get('y')?.setValue(150);
    expect(component.form.get('y')?.errors).toBeNull();
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

  it('should showEnterWeightDialog', () => {
    const modal = createMockModal();
    spyOn(modal, 'open');
    component.showEnterWeightDialog(modal);
    expect(modal.open).toHaveBeenCalled();
  });

  it('should hideDialog', () => {
    const modal = createMockModal();
    spyOn(modal, 'close');
    component.hideDialog(modal);
    expect(modal.close).toHaveBeenCalled();
  });

  it('should handleChartReady', () => {
    const mockChart = { render: jasmine.createSpy('render') };
    component.handleChartReady(mockChart as any);
    expect(mockChart.render).toHaveBeenCalled();
  });

  it('should return true for showTodayOption when last entry is not today', () => {
    // The existing data has entries from Jan 1-5 2025, so showTodayOption should be true
    // if "today" is any date after Jan 5
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2025-01-10T00:00:00.000Z'));

    expect(component.showTodayOption()).toBe(true);

    jasmine.clock().uninstall();
  });

  it('should getDedupedStoredData and return empty when localStorage is empty', () => {
    localStorage.removeItem(storageItemName);
    const result = component.getDedupedStoredData();
    expect(result).toEqual([]);
  });
});
