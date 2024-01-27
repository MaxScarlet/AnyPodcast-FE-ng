import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent {
  constructor(
    public auth: AuthService,
    public dialog: MatDialog,
  ) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(PopupComponent, {
      width: '250px',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
    });
  }
}
