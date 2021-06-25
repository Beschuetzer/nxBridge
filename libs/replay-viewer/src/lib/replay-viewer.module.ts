import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { GamesListComponent } from './components/games-list/games-list.component';
import { HeaderModule } from '@nx-bridge/header';
import { SearchComponent } from './components/search/search.component';
import { GameDetailComponent } from './components/game-detail/game-detail.component';
import { DealsListComponent } from './components/deals-list/deals-list.component';
import { DealDetailComponent } from './components/deal-detail/deal-detail.component';
import { ReplayViewComponent } from './views/replay-view/replay-view.component';
import { GamesListViewComponent } from './views/games-list-view/games-list-view.component';
@NgModule({
  declarations: [
    LandingPageComponent,
    GamesListComponent,
    SearchComponent,
    GameDetailComponent,
    DealsListComponent,
    DealDetailComponent,
    ReplayViewComponent,
    GamesListViewComponent,
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forChild([
      {path: '', component: LandingPageComponent},
      {path: 'games', component: GamesListViewComponent} 
    ]),
    HeaderModule,
  ],
})
export class ReplayViewerModule {}
