import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AuthModule } from '@auth0/auth0-angular';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EpisodesComponent } from './episodes/episodes.component';
import { UserProfileComponent } from './profile/profile.component';
import { NavComponent } from './nav/nav.component';
import { AuthButtonComponent } from './auth/auth.component';
import { EpisodeService } from './services/episode.service';
import { HttpClientModule } from '@angular/common/http';
import { AboutComponent } from './about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DashboardComponent,
    EpisodesComponent,
    UserProfileComponent,
    NavComponent,
    AuthButtonComponent,
    AboutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AuthModule.forRoot({
      domain: 'oxymoron-tech.eu.auth0.com',
      clientId: '3UiN4cnPFhPZ2T29eF6rCjLi3stoJX9e',
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    }),
  ],
  providers: [EpisodeService],
  bootstrap: [AppComponent],
})
export class AppModule {}
