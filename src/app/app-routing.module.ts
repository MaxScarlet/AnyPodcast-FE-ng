import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EpisodesComponent } from './components/episodes/episodes.component';
import { UserProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from '@auth0/auth0-angular';
import { AboutComponent } from './components/about/about.component';
import { EpisodeFormComponent } from './components/episode-form/episode-form.component';
import { PodcastInfoComponent } from './components/podcast-info/podcast-info.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'podcast/:podcastID/episode',
    component: EpisodesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'podcast/:podcastID/episode/create',
    component: EpisodeFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'podcast/:podcastID/episode/:episodeID',
    component: EpisodeFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'podcast/create',
    component: PodcastInfoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'podcast/:podcastID',
    component: PodcastInfoComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
