import { Component } from '@angular/core';
import { GlobalService } from './services/global.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'AnyPodcast';
  public isLoading = true;

  constructor(public globalService: GlobalService) {}
  async ngOnInit() {
    this.isLoading = false;
  }
}
