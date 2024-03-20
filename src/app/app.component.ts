import { Component } from '@angular/core';
import { GlobalService } from './services/global.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'rewrite-any-podcast';
  constructor(private globalService: GlobalService) {
    this.globalService.logWriter('app-component');
  }
  async ngOnInit() {
    this.globalService.logWriter('ngOnInit app component');
  }
}
