import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { GamesListComponent } from './games-list/games-list.component';
import { HeaderModule } from '@nx-bridge/header';
import { SearchComponent } from './search/search.component';
import { GameDetailComponent } from './game-detail/game-detail.component';
import { DealsListComponent } from './deals-list/deals-list.component';
import { DealDetailComponent } from './deal-detail/deal-detail.component';
import { ReplayViewComponent } from './replay-view/replay-view.component';
@NgModule({
  declarations: [
    LandingPageComponent,
    GamesListComponent,
    SearchComponent,
    GameDetailComponent,
    DealsListComponent,
    DealDetailComponent,
    ReplayViewComponent,
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
