import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { DiffComponent } from './diff.component';

describe('DiffComponent', () => {
  let component: DiffComponent;
  let fixture: ComponentFixture<DiffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiffComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
