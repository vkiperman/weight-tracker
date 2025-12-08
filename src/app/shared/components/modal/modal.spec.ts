import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modal } from './modal';

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the dialog', () => {
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    spyOn(dialog, 'showModal');

    component.open();

    expect(dialog.showModal).toHaveBeenCalled();
  });

  it('should close the dialog', () => {
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    spyOn(dialog, 'close');

    component.close();

    expect(dialog.close).toHaveBeenCalled();
  });

  it('should close on backdrop click outside dialog bounds', () => {
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    spyOn(dialog, 'getBoundingClientRect').and.returnValue({
      left: 100,
      right: 300,
      top: 100,
      bottom: 300,
    } as DOMRect);
    spyOn(dialog, 'close');

    const event = new PointerEvent('click', { clientX: 50, clientY: 150 });
    dialog.dispatchEvent(event);

    expect(dialog.close).toHaveBeenCalled();
  });

  it('should not close on click inside dialog bounds', () => {
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    spyOn(dialog, 'getBoundingClientRect').and.returnValue({
      left: 100,
      right: 300,
      top: 100,
      bottom: 300,
    } as DOMRect);
    spyOn(dialog, 'close');

    const event = new PointerEvent('click', { clientX: 200, clientY: 200 });
    dialog.dispatchEvent(event);

    expect(dialog.close).not.toHaveBeenCalled();
  });
});
