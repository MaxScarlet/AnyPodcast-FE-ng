import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EpisodesComponent } from './components/episodes/episodes.component';
import { UserProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from '@auth0/auth0-angular';
import { AboutComponent } from './components/about/about.component';
import { EpisodeFormComponent } from './components/episode-form/episode-form.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'episodes', component: EpisodesComponent, canActivate: [AuthGuard] },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'episodes/create',
    component: EpisodeFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'episodes/:_id/edit',
    component: EpisodeFormComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
