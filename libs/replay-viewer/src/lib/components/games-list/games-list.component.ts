import { Component, HostBinding, OnInit, Renderer2 } from '@angular/core';
import { AppState, SetIsViewingGame } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { GameRelevant, ReducerNames } from '@nx-bridge/interfaces-and-types';
import { ANIMATION_DURATION, dealsListDealsButtonChoices, DEALS_LIST_CLASSNAME, DEAL_DETAIL_CLASSNAME, DISPLAY_NONE_CLASSNAME, FULL_SIZE_CLASSNAME, GAMES_VIEW_CLASSNAME, OVERFLOW_Y_SCROLL_CLASSNAME, toggleClassOnList, toggleInnerHTML } from '@nx-bridge/constants';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { DealPlayerService } from 'libs/deal-player/src/lib/deal-player.service';
import { ReplayViewerDealService } from '../../services/replay-viewer.deal.service';
import { FiltermanagerService } from '../../services/filter-manager.service';

@Component({
  selector: 'nx-bridge-games-list',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.scss'],
})
export class GamesListComponent implements OnInit {
  @HostBinding('class.games-list') get classname() {
    return true;
  }

  @HostBinding('class.hidden') get toggleHidden() {
    return !this.isLoaded;
  }

  public games: GameRelevant[] = [];
  public maxDisplayedPerPage = 25;
  public displayedMultiple = 0;  //means displaying games with index maxDisplayedPerPage * displayedMultiple up to but not including maxDisplayedPerPage * (displayedMultiple + 1)
  private isLoaded = false;

  constructor(
    private dealPlayerService: DealPlayerService,
    private store: Store<AppState>,
    private renderer: Renderer2,
    private replayViewerDealService: ReplayViewerDealService,
    private filterManagerService: FiltermanagerService,
  ) {}

  ngOnInit(): void {
    this.store.select(ReducerNames.games).subscribe((gameState) => {
      if (gameState.currentlyDisplayingGames) this.games = gameState.currentlyDisplayingGames;
      else this.games = [];
    });

    this.store.select(ReducerNames.deals).subscribe(dealState => {
      this.isLoaded = Object.keys(dealState.fetchedDeals).length > 0;
    })
  }

  onClick(e: Event) {
    const gamesView = document.querySelector(`.${GAMES_VIEW_CLASSNAME}`) as HTMLElement;

    const target = e.target as any;
    if ((target)?.classList.contains(FULL_SIZE_CLASSNAME)) {
      this.replayViewerDealService.setGameDetailBorderToNormal();

      const items = target.querySelectorAll(`.${DEAL_DETAIL_CLASSNAME}`);
      if (items && items.length > 0) toggleClassOnList(items, DISPLAY_NONE_CLASSNAME);

      const summary = target.querySelector(`.${DEALS_LIST_CLASSNAME}__summary`);
      toggleClassOnList([summary], DISPLAY_NONE_CLASSNAME);

      const button = target.querySelector(`.${DEALS_LIST_CLASSNAME}__button-deals`);
      toggleInnerHTML(button, dealsListDealsButtonChoices);

      
      target.classList.remove(FULL_SIZE_CLASSNAME);
      this.store.dispatch(new SetIsViewingGame(false));

      this.dealPlayerService.setCardsRotationAndPosition();

      this.renderer.removeClass(gamesView, OVERFLOW_Y_SCROLL_CLASSNAME);
    } else {
      setTimeout(() => {
        this.renderer.addClass(gamesView, OVERFLOW_Y_SCROLL_CLASSNAME);
      }, ANIMATION_DURATION * 1.5)
    }
  }
}
