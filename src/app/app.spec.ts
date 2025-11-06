import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { App } from './app';
import { weightTrackerConfigReducer as weightTrackerConfig } from './components/weight-tracker/store/weight-tracker-config.reducer';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, StoreModule.forRoot({ weightTrackerConfig })],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
