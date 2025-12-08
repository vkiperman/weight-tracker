import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Modal } from '@app/shared/components/modal/modal';
import { WeightDataStore } from '@app/store/weight-data/weight-data.store';
import { CanvasJSAngularChartsModule, CanvasJSChart } from '@canvasjs/angular-charts';
import { WeightTrackerConfigState } from '@store/weight-tracker-config/weight-tracker-config.reducer';
import { WeightTrackerConfigStore } from '@store/weight-tracker-config/weight-tracker-config.store';
import { fillLinearDaily, lineOfBestFit, slidingProjections } from '@utils/weight-tracker.utils';
import { ChartDataPoint, ChartDataSeriesOptions, ChartEvent, ChartOptions } from 'canvasjs';
import deepEqual from 'deep-equal';
import {
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  Observable,
  startWith,
  tap,
} from 'rxjs';
import { DiffComponent } from './components/diff/diff.component';
import { DynamicRangeInputComponent } from './components/dynamic-range-input/dynamic-range-input.component';
import { ProjectionInput } from './components/projection-input/projection-input';
import { StatsComponent } from './components/stats/stats.component';
import { WeightEntryForm } from './components/weight-entry-form/weight-entry-form';
import { WT_ChartDataPoint } from './weight-tracker.types';

export const storageItemName = 'weight-tracker';

@Component({
  selector: 'weight-tracker',
  imports: [
    CanvasJSAngularChartsModule,
    CommonModule,
    DiffComponent,
    ReactiveFormsModule,
    StatsComponent,
    DynamicRangeInputComponent,
    Modal,
    ProjectionInput,
    WeightEntryForm,
  ],
  templateUrl: './weight-tracker.component.html',
  styleUrl: './weight-tracker.component.scss',
})
export class WeightTrackerComponent implements OnInit {
  private weightDataStore = inject(WeightDataStore);
  private destroyRef = inject(DestroyRef);
  private store = inject(WeightTrackerConfigStore);
  private weightData = signal<WT_ChartDataPoint[]>([]);
  public weightTrackerConfig = signal<WeightTrackerConfigState | null>(null);
  public weightTrackerConfig$!: Observable<WeightTrackerConfigState>;
  public form = new FormGroup({
    x: new FormControl<Date>(new Date(new Date().setHours(0, 0, 0, 0))),
    y: new FormControl<number | null>(null, { updateOn: 'submit' }),
    message: new FormControl<string | null>(null),
  });
  public dynamicRange = new FormGroup({
    range: new FormControl(),
  });

  public configForm!: FormGroup;
  public selectedDate = new FormControl<Date | null>(null);
  public configForm$!: Observable<{ projectionSampleSize: number }>;

  public readonly projected = signal(
    slidingProjections(this.weightData(), this.configForm?.get('projectionSampleSize')?.value!),
  );

  public today = this.form.value.x!;

  public showTodayOption = computed(() => {
    const lastEntry = this.mainData().dataPoints.at(-1);
    if (!lastEntry) return true;
    const lastEntryDate = new Date(new Date(lastEntry.x!).setHours(0, 0, 0, 0));
    return this.today > lastEntryDate;
  });

  public canvasJSChart = viewChild.required<CanvasJSChart>(CanvasJSChart);

  private get weightMultiplier() {
    return this.weightTrackerConfig()?.units ? 0.453592 : 1;
  }

  public ngOnInit(): void {
    this.weightDataStore.getWeights();

    this.weightTrackerConfig$ = this.store.getState().pipe(
      filter((state) => !!state),
      tap((state) => this.weightTrackerConfig.set(state)),
      distinctUntilChanged(deepEqual),
      tap(this.init.bind(this)),
    );

    this.configForm = new FormGroup({
      projectionSampleSize: new FormControl<number>(7, { nonNullable: true }),
    });
    this.configForm$ = this.configForm.valueChanges.pipe(
      distinctUntilKeyChanged('projectionSampleSize'),
      tap(({ projectionSampleSize }) => {
        this.projected.set(slidingProjections(this.weightData(), projectionSampleSize));
        this.canvasJSChart().chart.render();
      }),
      startWith(this.configForm.value),
    );
    setTimeout(() => {
      localStorage.setItem(`${storageItemName}-backup`, localStorage.getItem(storageItemName)!);
    }, 0);
  }

  private init() {
    const dedupedStoredData = this.getDedupedStoredData();
    this.weightData.update(() => dedupedStoredData);

    const lastItem = this.weightData().at(-1)!;
    const lastEntryDate = new Date(new Date(lastItem.x!).setHours(0, 0, 0, 0));
    const displayDate = new Date(Math.max(+this.form.get('x')!.value!, +lastEntryDate));
    const hasTodayEntry = +this.form.get('x')!.value! === +lastEntryDate;

    const setVisibleValues = () => {
      this.form.get('y')?.setValue(+(lastItem.y! * this.weightMultiplier).toFixed(1));
      this.form.get('message')?.setValue(hasTodayEntry ? lastItem.message! : null);
      this.form.get('y')?.enable();
    };
    setVisibleValues();
    this.selectedDate.setValue(displayDate);
    this.selectedDate.valueChanges
      .pipe(
        filter((date) => !!date),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((date) => {
        const entry = this.weightData().find(({ x }) => +x! === +new Date(date))!;
        if (entry) {
          this.form.get('x')?.setValue(new Date(entry?.x!));
          this.form.get('y')?.setValue(+(entry?.y! * this.weightMultiplier).toFixed(1));
          this.form.get('message')?.setValue(entry?.message!);

          +new Date(date) !== +new Date(this.today)
            ? this.form.get('y')?.disable()
            : this.form.get('y')?.enable();
        } else {
          this.form.get('x')?.setValue(this.today);
          setVisibleValues();
        }
      });

    this.dynamicRange.valueChanges
      .pipe(distinctUntilChanged(deepEqual), takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => {
        this.weightData.set(dedupedStoredData.slice(-v.range));

        this.projected.set(
          slidingProjections(
            this.weightData(),
            this.configForm?.get('projectionSampleSize')?.value!,
          ),
        );
      });

    this.dynamicRange.get('range')?.setValue(dedupedStoredData.length);

    this.projected.set(
      slidingProjections(this.weightData(), this.configForm?.get('projectionSampleSize')?.value),
    );

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ x, y }) => {
      const now = new Date(x!);
      const lastItem = this.weightData().at(-1)!;
      const sinceLastEntry = Math.max(1, now.getDate() - new Date(lastItem.x!).getDate());

      if (sinceLastEntry >= 14) return; // skip validation if last entry was 2+ weeks ago
      const prevWeight = lastItem.y!;
      if (y && y < prevWeight - 14 * sinceLastEntry)
        return this.form.get('y')?.setErrors({ tooLow: true });
      if (y && y > prevWeight + 14 * sinceLastEntry)
        return this.form.get('y')?.setErrors({ tooHigh: true });
      this.form.get('y')?.setErrors(null);
    });
  }

  public showEnterWeightDialog(modal: Modal) {
    modal.open();
  }

  public getDedupedStoredData() {
    const seen = new Set<number>();

    return fillLinearDaily(
      [...JSON.parse(localStorage.getItem(storageItemName) || '[]')]
        .map(({ x, y, message }: WT_ChartDataPoint) => ({
          x: new Date(x!),
          y: y! * this.weightMultiplier,
          message,
        }))
        .filter((item: WT_ChartDataPoint) => !seen.has(+item.x!) && seen.add(+item.x!)),
    );
  }

  public hideDialog(modal: Modal) {
    modal.close();
  }

  public handleShowTooltip(wt: number) {
    const { x } = this.weightData().find(({ y }) => wt === y)!;
    this.canvasJSChart().chart.toolTip.showAtX(x);
  }

  public handleHideTooltip() {
    this.canvasJSChart().chart.toolTip.hide();
  }

  public getDiff(dist: number = new Date().getDate() + 1) {
    const { dataPoints } = this.mainData();
    const value = dataPoints.at(-1)?.y! - dataPoints.at(-dist - 1)?.y!;
    return {
      value: Math.abs(value).toFixed(2),
      className: value <= 0 ? 'down' : 'up',
    };
  }

  private visible: boolean[] = [true, true, true, false, false, true];
  private units = this.weightTrackerConfig()?.units ? ' KG' : ' lbs';

  public mainData = computed<ChartDataSeriesOptions>(() => ({
    color: 'rgb(255, 255, 255, .8)',
    name: 'Weight',
    showInLegend: true,
    toolTipContent: `{y} ${this.units}<br>{x}<br>{message}`,
    type: 'line',
    visible: this.visible[5],
    xValueFormatString: 'DDD, MM/DD/YYYY',
    dataPoints: this.weightData(),
    lineThickness: 4,
  }));

  private projectedData = computed<ChartDataSeriesOptions>(() => ({
    visible: this.visible[4],
    type: 'spline',
    name: 'Projected Weight',
    showInLegend: true,
    color: 'hsla(188, 2%, 45%, 0.7)',
    xValueFormatString: 'MM/DD/YYYY',
    toolTipContent: `{y} ${this.units}<br>{x}`,
    dataPoints: this.projected()!,
    lineDashType: 'dash',
  }));
  private lineOfBestFitData = computed<ChartDataSeriesOptions>(() => ({
    visible: this.visible[3],
    type: 'line',
    name: 'Line of best fit',
    showInLegend: true,
    color: 'rgba(200, 200, 200, 0.85)',
    xValueFormatString: 'MM/DD/YYYY',
    toolTipContent: `{n} ${this.units}<br>{x}`,
    dataPoints: lineOfBestFit(this.weightData())!,
    lineDashType: 'dash',
  }));

  private highData = computed<ChartDataSeriesOptions>(() => {
    const high = this.weightData().reduce((acc, cur) => (!acc || cur.y! > acc.y! ? cur : acc));
    return {
      color: 'rgba(255, 90, 90, 1)',
      name: 'High',
      toolTipContent: `High: {y} ${this.units}`,
      type: 'line',
      visible: this.visible[1],
      xValueFormatString: 'DDD, MM/DD/YYYY',
      dataPoints: [
        { ...high, x: this.weightData()[0].x },
        { ...high, x: this.weightData().at(-1)!.x },
      ],
      lineThickness: 2,
      lineDashType: 'shortDot',
      markerType: 'none',
    };
  });
  private lowData = computed<ChartDataSeriesOptions>(() => {
    const low = this.weightData().reduce((acc, cur) => (!acc || cur.y! < acc.y! ? cur : acc));
    return {
      color: 'rgba(0, 255, 0, .6)',
      name: 'Low',
      toolTipContent: `Low: {y} ${this.units}`,
      type: 'line',
      visible: this.visible[0],
      xValueFormatString: 'DDD, MM/DD/YYYY',
      dataPoints: [
        { ...low, x: this.weightData()[0].x },
        { ...low, x: this.weightData().at(-1)!.x },
      ],
      lineThickness: 2,
      lineDashType: 'shortDot',
      markerType: 'none',
    };
  });
  private lastData = computed<ChartDataSeriesOptions>(() => {
    const left = { ...this.weightData().at(-1), x: this.weightData()[0]!.x };
    return {
      color: 'rgba(255, 255, 255, .6)',
      name: 'Low',
      toolTipContent: `Latest: {y} ${this.units}`,
      type: 'line',
      visible: this.visible[2],
      xValueFormatString: 'DDD, MM/DD/YYYY',
      dataPoints: [left, this.weightData().at(-1)!],
      lineThickness: 2,
      lineDashType: 'shortDot',
      markerType: 'none',
    };
  });

  public data = computed<ChartOptions>(() => {
    return {
      animationEnabled: true,
      showInLegend: true,
      zoomEnabled: true,
      theme: 'dark1',
      title: {
        text: 'GlowDown ',
        fontFamily: 'Roboto Condensed, Verdana, Monospace',
        padding: 8,
        dockInsidePlotArea: false,
        textAlign: 'left',
      },
      axisX: {
        valueFormatString: 'DDD M/D/YY',
        interlacedColor: '#0000003A',
      },
      axisY: {
        title: `Weight (in ${this.units})`,
        suffix: this.units,
      },
      legend: {
        cursor: 'pointer',
        fontSize: 12,
        itemclick: this.itemClick.bind(this),
        reversed: true,
      },
      toolTip: {
        shared: false,
      },
      data: [
        this.mainData(),
        this.lowData(),
        this.highData(),
        this.lastData(),
        this.lineOfBestFitData(),
        this.projectedData(),
      ],
    };
  });

  public handleChartReady(chart: CanvasJSChart['chart']) {
    chart.render();
  }

  public updateWeights(modal: Modal) {
    if (this.form.invalid) return;

    const dedupedData = this.getDedupedStoredData();

    this.dynamicRange.get('range')?.setValue(dedupedData.length);

    this.weightData.update(() =>
      [
        ...dedupedData.filter(({ x }) => +x! !== +this.form.value.x!),
        this.form.getRawValue() as ChartDataPoint,
      ].sort((a, b) => +new Date(a.x!) - +new Date(b.x!)),
    );

    const weightData = this.weightData();
    this.projected.set(
      slidingProjections(weightData, this.configForm.get('projectionSampleSize')?.value),
    );
    localStorage.setItem(
      storageItemName,
      JSON.stringify(weightData.filter(({ filledIn }) => !filledIn)),
    );

    modal.close();

    this.canvasJSChart().chart.render();
  }
  /* istanbul ignore next */
  private itemClick(e: ChartEvent) {
    const visible = e.dataSeries.visible === undefined || e.dataSeries.visible;
    this.visible[e.dataSeriesIndex] = !visible;
    e.dataSeries.visible = this.visible[e.dataSeriesIndex];

    e.chart.render();
  }
}
