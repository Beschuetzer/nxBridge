import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { GamesListComponent } from './games-list/games-list.component';
import { HeaderModule } from '@nx-bridge/header';
@NgModule({
  declarations: [
    LandingPageComponent,
    GamesListComponent,
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forChild([
      {path: '', component: LandingPageComponent},
      {path: 'games', component: GamesListComponent} 
    ]),
    HeaderModule,
  ],
})
export class ReplayViewerModule {}
