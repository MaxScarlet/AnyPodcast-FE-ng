import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PopupSettings } from 'src/app/services/popup.service';

@Component({
  selector: 'app-popup-msg',
  templateUrl: './popup-msg.component.html',
  styleUrls: ['./popup-msg.component.css'],
})
export class PopupMsgComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: PopupSettings) {}

  updateMessage(msg: string) {
    this.data.message = msg;
  }
}
