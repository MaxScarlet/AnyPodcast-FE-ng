import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AuthModule } from '@auth0/auth0-angular';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EpisodesComponent } from './components/episodes/episodes.component';
import { UserProfileComponent } from './components/profile/profile.component';
import { NavComponent } from './components/nav/nav.component';
import { AuthButtonComponent } from './components/auth/auth.component';
import { EpisodeService } from './services/episode.service';
import { HttpClientModule } from '@angular/common/http';
import { AboutComponent } from './components/about/about.component';
import { EpisodeFormComponent } from './components/episode-form/episode-form.component';
import { FormsModule } from '@angular/forms';

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
    EpisodeFormComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
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
