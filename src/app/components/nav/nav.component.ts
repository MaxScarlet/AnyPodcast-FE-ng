import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { PopupComponent } from '../popup/popup.component';
import { TokenService } from 'src/app/services/token.service';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent {
  constructor(
    public auth: AuthService,
    public dialog: MatDialog,
    private tokenService: TokenService,
    public globalService: GlobalService
  ) {}
  public user: any;
  public isAuthenticated: boolean = false;

  ngOnInit(): void {
    this.auth.user$.subscribe((userSub) => {
      if (userSub && userSub.sub) {
        this.user = userSub;
        this.isAuthenticated = true;
        // this.tokenService.getExpiration(); // TODO: check if this is needed
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PopupComponent, {
      width: '250px',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
}
