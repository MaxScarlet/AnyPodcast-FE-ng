import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-user-profile',
  templateUrl: `./profile.component.html`,
})
export class UserProfileComponent {
  constructor(public auth: AuthService) {}
}
