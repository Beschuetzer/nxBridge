import { NgModule, Renderer2, RendererFactory2 } from '@angular/core';
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
import { GamesListViewComponent } from './views/games-list-view/games-list-view.component';
import { GridModule } from '@nx-bridge/grid';
import { SpinnersModule } from '@nx-bridge/spinners';
import { PipesModule } from '@nx-bridge/pipes';
import { DealPlayerModule } from '@nx-bridge/deal-player';
import { FilterManagerComponent } from './components/filter-manager/filter-manager.component';
import { FilterManagerItemComponent } from './components/filter-manager-item/filter-manager-item.component';
@NgModule({
  declarations: [
    LandingPageComponent,
    GamesListComponent,
    SearchComponent,
    GameDetailComponent,
    DealsListComponent,
    DealDetailComponent,
    GamesListViewComponent,
    FilterManagerComponent,
    FilterManagerItemComponent,
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forChild([
      {path: '', component: LandingPageComponent},
      {path: 'games', component: GamesListViewComponent} 
    ]),
    HeaderModule,
    GridModule,
    SpinnersModule,
    PipesModule,
    DealPlayerModule,
  ],
})
export class ReplayViewerModule {}
