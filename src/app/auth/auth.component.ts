import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-auth-button',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthButtonComponent {
  public user: any;

  ngOnInit(): void {
    this.auth.user$.subscribe((userSub) => {
      this.user = userSub;
      console.log("User sub");
      
    });
  }

  constructor(
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService
  ) {}
}
