import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-toggle-slider',
  templateUrl: './toggle-slider.component.html',
  styleUrls: ['./toggle-slider.component.css'],
})
export class ToggleSliderComponent {
  @Input() isChecked!: boolean;
  @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>();

  toggleSlider() {
    this.isChecked = !this.isChecked;
    this.toggle.emit(this.isChecked);
  }
}
