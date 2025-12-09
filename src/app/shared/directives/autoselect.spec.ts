import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Autoselect } from './autoselect';

@Component({
  template: `<input type="text" [value]="value" autoselect />`,
  imports: [Autoselect],
})
class TestDefaultComponent {
  value = 'Hello World';
}

@Component({
  template: `<input type="text" [value]="value" autoselect="start" />`,
  imports: [Autoselect],
})
class TestStartComponent {
  value = 'Hello World';
}

@Component({
  template: `<input type="text" [value]="value" autoselect="end" />`,
  imports: [Autoselect],
})
class TestEndComponent {
  value = 'Hello World';
}

@Component({
  template: `<input type="text" [value]="value" autoselect="all" />`,
  imports: [Autoselect],
})
class TestAllComponent {
  value = 'Hello World';
}

@Component({
  template: `<input type="text" [value]="value" autoselect [start]="2" [end]="5" />`,
  imports: [Autoselect],
})
class TestCustomRangeComponent {
  value = 'Hello World';
}

@Component({
  template: `<input type="text" [value]="value" autoselect [start]="3" />`,
  imports: [Autoselect],
})
class TestCustomStartOnlyComponent {
  value = 'Hello World';
}

@Component({
  template: `<input type="text" [value]="value" autoselect [end]="4" />`,
  imports: [Autoselect],
})
class TestCustomEndOnlyComponent {
  value = 'Hello World';
}

@Component({
  template: `<input type="number" [value]="value" autoselect />`,
  imports: [Autoselect],
})
class TestNumberInputComponent {
  value = 12345;
}

@Component({
  template: `<input type="number" [value]="value" autoselect="all" />`,
  imports: [Autoselect],
})
class TestNumberInputAllComponent {
  value = 12345;
}

describe('Autoselect', () => {
  function createFixture<T>(component: new () => T): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [component],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    return fixture;
  }

  function getInput<T>(fixture: ComponentFixture<T>): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  describe('default behavior (no value)', () => {
    it('should select all text', () => {
      const fixture = createFixture(TestDefaultComponent);
      const input = getInput(fixture);
      input.focus();
      fixture.detectChanges();

      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(11);
    });
  });

  describe('mode="start"', () => {
    it('should place cursor at start', () => {
      const fixture = createFixture(TestStartComponent);
      const input = getInput(fixture);
      input.focus();
      fixture.detectChanges();

      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(0);
    });
  });

  describe('mode="end"', () => {
    it('should place cursor at end', () => {
      const fixture = createFixture(TestEndComponent);
      const input = getInput(fixture);
      input.focus();
      fixture.detectChanges();

      expect(input.selectionStart).toBe(11);
      expect(input.selectionEnd).toBe(11);
    });
  });

  describe('mode="all"', () => {
    it('should select all text', () => {
      const fixture = createFixture(TestAllComponent);
      const input = getInput(fixture);
      input.focus();
      fixture.detectChanges();

      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(11);
    });
  });

  describe('custom start and end', () => {
    it('should select custom range when both start and end provided', () => {
      const fixture = createFixture(TestCustomRangeComponent);
      const input = getInput(fixture);
      input.focus();
      fixture.detectChanges();

      expect(input.selectionStart).toBe(2);
      expect(input.selectionEnd).toBe(5);
    });

    it('should use start=provided and end=length when only start provided', () => {
      const fixture = createFixture(TestCustomStartOnlyComponent);
      const input = getInput(fixture);
      input.focus();
      fixture.detectChanges();

      expect(input.selectionStart).toBe(3);
      expect(input.selectionEnd).toBe(11);
    });

    it('should use start=0 and end=provided when only end provided', () => {
      const fixture = createFixture(TestCustomEndOnlyComponent);
      const input = getInput(fixture);
      input.focus();
      fixture.detectChanges();

      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(4);
    });
  });

  describe('number input', () => {
    it('should call select() on number input with default mode', () => {
      const fixture = createFixture(TestNumberInputComponent);
      const input = getInput(fixture);
      const selectSpy = spyOn(input, 'select');
      input.focus();
      fixture.detectChanges();

      expect(selectSpy).toHaveBeenCalled();
    });

    it('should call select() on number input with mode="all"', () => {
      const fixture = createFixture(TestNumberInputAllComponent);
      const input = getInput(fixture);
      const selectSpy = spyOn(input, 'select');
      input.focus();
      fixture.detectChanges();

      expect(selectSpy).toHaveBeenCalled();
    });
  });
});
