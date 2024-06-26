import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AuthModule } from '@auth0/auth0-angular';
import { AppRoutingModule } from './app-routing.module';

import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environment';
import { AppComponent } from './app.component';
import { AboutComponent } from './components/about/about.component';
import { AuthButtonComponent } from './components/auth/auth.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EpisodeFormComponent } from './components/episode-form/episode-form.component';
import { EpisodesComponent } from './components/episodes/episodes.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { HomeComponent } from './components/home/home.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { NavComponent } from './components/nav/nav.component';
import { PodcastInfoComponent } from './components/podcast-info/podcast-info.component';
import { PopupMsgComponent } from './components/popup-msg/popup-msg.component';
import { PopupComponent } from './components/popup/popup.component';
import { UserProfileComponent } from './components/profile/profile.component';
import { ToggleSliderComponent } from './components/toggle-slider/toggle-slider.component';
import { EpisodeService } from './services/episode.service';
import { GlobalService } from './services/global.service';
import { LoggerService } from './services/logger.service';
import { PodcastService } from './services/podcast.service';
import { PopupService } from './services/popup.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AppHeaderComponent } from './components/app-header/app-header.component';

export function initializeGlobalService(
  globalService: GlobalService
): () => Promise<any> {
  return () => globalService.init();
}

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
    PopupComponent,
    PopupMsgComponent,
    PodcastInfoComponent,
    FileUploadComponent,
    ToggleSliderComponent,
    ImageUploadComponent,
    AppHeaderComponent,
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    AuthModule.forRoot({
      domain: environment.auth0.domain,
      clientId: environment.auth0.id,
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    }),
    BrowserAnimationsModule,
    MatDialogModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    FullCalendarModule,
  ],
  providers: [
    EpisodeService,
    CookieService,
    PodcastService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeGlobalService,
      deps: [GlobalService],
      multi: true,
    },
    GlobalService,
    PopupService,
    LoggerService,
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
