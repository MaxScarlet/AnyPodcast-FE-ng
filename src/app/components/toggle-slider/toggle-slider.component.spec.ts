import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleSliderComponent } from './toggle-slider.component';

describe('ToggleSliderComponent', () => {
  let component: ToggleSliderComponent;
  let fixture: ComponentFixture<ToggleSliderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ToggleSliderComponent]
    });
    fixture = TestBed.createComponent(ToggleSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
