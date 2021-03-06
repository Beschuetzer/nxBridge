import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  AppState,
  CurrentlyViewingDeal,
  reducerDefaultValue,
  SetBatchNumber,
  SetCurrentlyViewingDeal,
  SetCurrentlyViewingDealContract,
  SetIsViewingGame,
} from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import {
  LocalStorageUserWithGames,
  GameDetailDisplayPreferences,
  ReducerNames,
  CanDeactivateOutputTypes,
  Deal,
  DealRelevant,
} from '@nx-bridge/interfaces-and-types';
import {
  ANIMATION_DURATION,
  DEAL_PLAYER_CLASSNAME,
  DISPLAY_NONE_CLASSNAME,
  FULL_SIZE_CLASSNAME,
  GAMES_VIEW_CLASSNAME,
  GAME_DETAIL_CLASSNAME,
  getDefaultContract,
  getNewBatchNumber,
  getNewTotalNumberOfPages,
  HEIGHT_AUTO_CLASSNAME,
  NOT_AVAILABLE_STRING,
  OPACITY_NONE_CLASSNAME,
  RESULTS_PER_PAGE_OPTIONS,
  SIZE_OPTIONS,
  SORT_OPTIONS,
  TRANSLATE_LEFT_CLASSNAME,
  TRANSLATE_RIGHT_CLASSNAME,
  VISIBLE_CLASSNAME,
} from '@nx-bridge/constants';
import { LocalStorageManagerService } from '../../services/local-storage-manager.service';
import { SearchService } from '../../services/search.service';
import { ReplayViewerGameService } from '../../services/replay-viewer.game.service';
import { DealPlayerService } from 'libs/deal-player/src/lib/deal-player.service';

@Component({
  selector: 'nx-bridge-games-list-view',
  templateUrl: './games-list-view.component.html',
  styleUrls: ['./games-list-view.component.scss'],
})
export class GamesListViewComponent implements OnInit {
  @ViewChild('size', { static: true }) sizeElement: ElementRef | undefined;
  @ViewChild('sort', { static: true }) sortElement: ElementRef | undefined;
  @ViewChild('results', { static: true }) resultsElement:
    | ElementRef
    | undefined;
  @ViewChild('currentPage') currentPageElement: ElementRef | undefined;
  @HostBinding('class.games-list-view') get classname() {
    return true;
  }
  private DEFAULT_RESULTS_PER_PAGE = 100;
  public currentlyViewingUser: LocalStorageUserWithGames = {} as LocalStorageUserWithGames;
  public NOT_AVAILABLE_STRING = NOT_AVAILABLE_STRING;
  public sizeOptions = SIZE_OPTIONS;
  public sortOptions = SORT_OPTIONS;
  public resultsPerPageOptions = RESULTS_PER_PAGE_OPTIONS;
  public resultsPerPage = this.DEFAULT_RESULTS_PER_PAGE;
  public totalNumberOfPages = -1;
  public totalNumberOfDeals = -1;
  public currentBatch = 0;
  public totalGames = -1;
  public preferences: GameDetailDisplayPreferences = {} as GameDetailDisplayPreferences;
  public numberOfDealsMatchingFilters = -1;

  getArrayUpToNumber(number: number) {
    if (!number || number <= 0) return;
    return Array(number).map((x, i) => i + 1);
  }

  constructor(
    private store: Store<AppState>,
    private localStorageManager: LocalStorageManagerService,
    private searchService: SearchService,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private replayerViewerGameService: ReplayViewerGameService,
    private dealPlayerService: DealPlayerService
  ) {}

  canDeactivate(): CanDeactivateOutputTypes {
    let toReturn = true;
    const dealPlayer = document.querySelector(
      `.${DEAL_PLAYER_CLASSNAME}`
    ) as HTMLElement;
    if (
      dealPlayer.classList.contains(VISIBLE_CLASSNAME) ||
      dealPlayer.classList.contains(HEIGHT_AUTO_CLASSNAME)
    ) {
      dealPlayer.classList.remove(VISIBLE_CLASSNAME);
      dealPlayer.classList.remove(HEIGHT_AUTO_CLASSNAME);
      this.dealPlayerService.hasLoadedDeal = false;

      toReturn = false;
    }

    const gameDetailsFullSize = document.querySelectorAll(
      `.${GAME_DETAIL_CLASSNAME}.${FULL_SIZE_CLASSNAME}`
    );
    if (gameDetailsFullSize.length > 0) {
      this.replayerViewerGameService.resetGameDetails(gameDetailsFullSize);
      toReturn = false;
    }

    if (!toReturn) {
      this.store.dispatch(new SetIsViewingGame(false));
    }
    return toReturn;
  }

  ngOnInit(): void {
    this.store.select(ReducerNames.deals).subscribe((dealState) => {
      this.totalNumberOfDeals = dealState.dealsAsStrings?.length;
    });
    this.store.select(ReducerNames.users).subscribe((userState) => {
      this.currentlyViewingUser = userState.currentlyViewingUser;
    });

    this.store.select(ReducerNames.games).subscribe((gameState) => {
      this.totalGames = gameState.filteredGames?.length;
      this.totalNumberOfPages = Math.ceil(
        this.totalGames / this.resultsPerPage
      );
    });

    this.store.select(ReducerNames.filters).subscribe((filterState) => {
      if (!filterState.dealsThatMatchFilters.includes(`${reducerDefaultValue}`))
        this.numberOfDealsMatchingFilters =
          filterState.dealsThatMatchFilters.length;
      else this.numberOfDealsMatchingFilters = -1;
    });

    this.replayerViewerGameService.setDefaultResultsPerPage(
      this.resultsElement
    );
    this.preferences = this.localStorageManager.getPreferences();
    this.setOptionElementsPerPreferences();
    this.replayerViewerGameService.changeGameSize(this.preferences.size);
    this.replayerViewerGameService.showSearchHideButton(this.elRef);
  }

  onCurrentPageChange(e: Event) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    this.currentBatch = +option.value;
    this.store.dispatch(new SetBatchNumber(this.currentBatch));
    this.searchService.setCurrentlyDisplayingGames();
  }

  onHide() {
    const gamesView = this.elRef.nativeElement as HTMLElement;
    const size = gamesView.querySelector(
      `.${GAMES_VIEW_CLASSNAME}__size`
    ) as HTMLElement;
    const results = gamesView.querySelector(
      `.${GAMES_VIEW_CLASSNAME}__results`
    ) as HTMLElement;
    const button = gamesView.querySelector(
      `.${GAMES_VIEW_CLASSNAME}__hide`
    ) as HTMLElement;

    if (size.classList.contains(OPACITY_NONE_CLASSNAME)) {
      if (size) {
        this.renderer.removeClass(size, DISPLAY_NONE_CLASSNAME);
        setTimeout(() => {
          this.renderer.removeClass(size, OPACITY_NONE_CLASSNAME);
          this.renderer.removeClass(size, TRANSLATE_LEFT_CLASSNAME);
        }, ANIMATION_DURATION / 128);
      }
      if (results) {
        this.renderer.removeClass(results, DISPLAY_NONE_CLASSNAME);
        setTimeout(() => {
          this.renderer.removeClass(results, OPACITY_NONE_CLASSNAME);
          this.renderer.removeClass(results, TRANSLATE_RIGHT_CLASSNAME);
        }, ANIMATION_DURATION / 128);
      }
      button.innerHTML = 'Hide';
    } else {
      if (size) {
        this.renderer.addClass(size, TRANSLATE_LEFT_CLASSNAME);
        this.renderer.addClass(size, OPACITY_NONE_CLASSNAME);
        setTimeout(() => {
          this.renderer.addClass(size, DISPLAY_NONE_CLASSNAME);
        }, ANIMATION_DURATION / 4);
      }
      if (results) {
        this.renderer.addClass(results, TRANSLATE_RIGHT_CLASSNAME);
        this.renderer.addClass(results, OPACITY_NONE_CLASSNAME);
        setTimeout(() => {
          this.renderer.addClass(results, DISPLAY_NONE_CLASSNAME);
        }, ANIMATION_DURATION / 4);
      }
      button.innerHTML = 'Show';
    }
  }

  onResultsPerPageChange(e: Event, shouldSave = true) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    if (shouldSave) {
      this.localStorageManager.saveResultsPerPagePreference(option.value);
    }

    this.currentBatch = getNewBatchNumber(
      this.currentBatch,
      this.resultsPerPage,
      +option.value,
      this.totalGames
    );
    this.store.dispatch(new SetBatchNumber(this.currentBatch));

    this.replayerViewerGameService.setResultsPerPagePreference(option.value);
    this.resultsPerPage = +option.value;
    this.searchService.setCurrentlyDisplayingGames();
    this.totalNumberOfPages = getNewTotalNumberOfPages(
      +option.value,
      this.totalGames
    );

    this.replayerViewerGameService.selectCurrentPage(
      this.currentBatch,
      this.currentPageElement
    );
  }

  onSizeChange(e: Event, shouldSave = true) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    if (shouldSave) this.localStorageManager.saveSizePreference(option.value);
    this.replayerViewerGameService.changeGameSize(option.value);
  }

  onSortChange(e: Event, shouldSave = true) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    if (shouldSave) this.localStorageManager.saveSortPreference(option.value);

    this.replayerViewerGameService.setSortPreference(option.value);

    this.currentBatch =
      this.currentBatch <= 0
        ? this.totalNumberOfPages - 1
        : this.totalNumberOfPages - 1 - this.currentBatch;
    this.store.dispatch(new SetBatchNumber(this.currentBatch));

    this.searchService.setCurrentlyDisplayingGames();
    this.replayerViewerGameService.selectCurrentPage(
      this.currentBatch,
      this.currentPageElement
    );
  }

  setOptionElementsPerPreferences() {
    const sortElement = this.sortElement?.nativeElement;
    const sizeElement = this.sizeElement?.nativeElement;
    const resultsElement = this.resultsElement?.nativeElement;

    if (sortElement) {
      let childIndex = 0;

      if (this.preferences.sort === this.sortOptions.descending) childIndex = 1;

      const childToUse = (sortElement as HTMLSelectElement).children[
        childIndex
      ] as HTMLOptionElement;
      childToUse.selected = true;
      this.onSortChange({ target: childToUse } as any, false);

      let stringToDispatch = this.sortOptions.ascending;
      if (childIndex === 1) stringToDispatch = this.sortOptions.descending;
      this.replayerViewerGameService.setSortPreference(stringToDispatch);
    }
    if (sizeElement) {
      let childIndex = 0;
      let value = this.sizeOptions.small;

      if (this.preferences.size === this.sizeOptions.medium) {
        childIndex = 1;
        value = this.sizeOptions.medium;
      } else if (this.preferences.size === this.sizeOptions.large) {
        childIndex = 2;
        value = this.sizeOptions.large;
      }

      const childToUse = (sizeElement as HTMLSelectElement).children[
        childIndex
      ] as HTMLOptionElement;
      childToUse.selected = true;
      this.onSizeChange({ target: { value } } as any, false);
    }
    if (resultsElement) {
      const childIndex = this.resultsPerPageOptions.findIndex(
        (resultPerPage) => resultPerPage === +this.preferences.resultsPerPage
      );
      const value = this.resultsPerPageOptions[childIndex];

      //note: without timeOut, childToUse is undefined when refreshing /replays/games
      setTimeout(() => {
        const childToUse = (resultsElement as HTMLSelectElement).children[
          childIndex
        ] as HTMLOptionElement;
        if (childToUse) childToUse.selected = true;
        this.onResultsPerPageChange(
          {
            target: { value: value ? value : this.DEFAULT_RESULTS_PER_PAGE },
          } as any,
          false
        );
      }, 50);
    }
  }
}
