import { Component, signal } from '@angular/core';
import { WeightTrackerComponent } from './components/weight-tracker/weight-tracker.component';

@Component({
  selector: 'app-root',
  imports: [WeightTrackerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('weight-tracker');
}
