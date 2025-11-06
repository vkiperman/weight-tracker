import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { CanvasJSChart } from '@canvasjs/angular-charts';
import { StatsComponent } from './stats.component';

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;
  let canvasJsChart: CanvasJSChart;
  let canvasJsChartFixture: ComponentFixture<CanvasJSChart>;
  const data = [
    { x: new Date('2025-01-01T00:00:00.000Z'), y: 150 },
    { x: new Date('2025-01-02T00:00:00.000Z'), y: 149 },
    { x: new Date('2025-01-03T00:00:00.000Z'), y: 147 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    canvasJsChartFixture = TestBed.createComponent(CanvasJSChart);
    canvasJsChart = canvasJsChartFixture.componentInstance;

    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('canvasJSChart', canvasJsChart);

    canvasJsChart.options = component.data();
    canvasJsChart.chart = {
      toolTip: {
        showAtX: jasmine.createSpy(),
        hide: jasmine.createSpy(),
      },
      destroy: jasmine.createSpy(),
    };
  });

  it('should show a tooltip', () => {
    component.handleShowTooltip(data[0].y);
    expect(component.canvasJSChart().chart.toolTip.showAtX).toHaveBeenCalledWith(data[0].x);
  });

  it('should hide a tooltip', () => {
    component.handleHideTooltip();
    expect(component.canvasJSChart().chart.toolTip.hide).toHaveBeenCalled();
  });
});
