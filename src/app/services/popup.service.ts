import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { PopupMsgComponent } from '../components/popup-msg/popup-msg.component';

export class PopupSettings {
  title: string = 'Popup Title';
  message: string = 'Popup message';
  confirmButtonText?: string = 'OK';
  cancelButtonText?: string = 'Close';
  showConfirmButton?: boolean = false;
  showCancelButton?: boolean = false;
}

@Injectable({ providedIn: 'root' })
export class PopupService {
  constructor(private dialog: MatDialog) {}

  private dialogRef: any;

  openPopup(settings: PopupSettings): Observable<boolean> {
    if (settings.hasOwnProperty('confirmButtonText')) {
      settings.confirmButtonText = settings.confirmButtonText;
      settings.showConfirmButton = true;
    }
    if (settings.hasOwnProperty('cancelButtonText')) {
      settings.cancelButtonText = settings.cancelButtonText;
      settings.showCancelButton = true;
    }
    this.dialogRef = this.dialog.open(PopupMsgComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container',
      data: settings,
    });

    return this.dialogRef.afterClosed();
  }

  updateMessage(newMessage: string): void {
    if (this.dialogRef && this.dialogRef.componentInstance) {
      this.dialogRef.componentInstance.data.message = newMessage;
    }
  }
}
