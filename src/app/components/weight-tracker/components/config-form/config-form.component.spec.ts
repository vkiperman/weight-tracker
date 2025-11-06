import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { weightTrackerConfigReducer as weightTrackerConfig } from '../../store/weight-tracker-config.reducer';
import { WeightTrackerConfigStore } from '../../store/weight-tracker-config.store';
import { ConfigFormComponent } from './config-form.component';

describe('ConfigFormComponent', () => {
  let component: ConfigFormComponent;
  let fixture: ComponentFixture<ConfigFormComponent>;
  let store: WeightTrackerConfigStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigFormComponent, StoreModule.forRoot({ weightTrackerConfig })],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigFormComponent);
    component = fixture.componentInstance;

    store = TestBed.inject(WeightTrackerConfigStore);

    fixture.detectChanges();
  });

  it('should save config', () => {
    spyOn(store, 'setState');
    spyOn(component.saved, 'emit');
    component.saveConfig();
    expect(store.setState).toHaveBeenCalledWith({ units: 0 });
    expect(component.saved.emit).toHaveBeenCalled();
  });
});
