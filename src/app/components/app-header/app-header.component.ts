import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import * as pluralize from 'pluralize';

@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css'],
})
export class AppHeaderComponent {
  @Input() title: string = '';
  @Input() isLoading: boolean = false;
  @Input() buttonLink: string = '';
  @Input() diameter?: number = 30;
  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();
  public buttonText: string = '';

  constructor(public globalService: GlobalService) {}

  ngOnInit() {
    this.buttonText = pluralize.singular(this.title).toLowerCase();
    console.log(this.buttonLink);
  }
  onButtonClick() {
    this.buttonClick.emit();
  }
}
