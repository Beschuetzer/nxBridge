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
  reducerDefaultValue,
  SetBatchNumber,
  SetResultsPerPagePreference,
  SetSortingPreference,
} from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import {
  LocalStorageUserWithGames,
  GameDetailDisplayPreferences,
  ReducerNames,
} from '@nx-bridge/interfaces-and-types';
import {
  dealsListButtonFontSizeCssPropName,
  DISPLAY_NONE_CLASSNAME,
  gameDetailHeightAboveBreakpointCssPropName,
  gameDetailHeightBelowBreakpointCssPropName,
  gameDetailSummaryHeightPercentageCssPropName,
  GAMES_VIEW_CLASSNAME,
  getNewBatchNumber,
  getNewTotalNumberOfPages,
  LOGIN_CARD_CLASSNAME,
  NOT_AVAILABLE_STRING,
  playerLabelsDisplayTypeCssPropName,
  playerNamesDisplayTypeCssPropName,
  RESULTS_PER_PAGE_OPTIONS,
  SIZE_OPTIONS,
  SORT_OPTIONS,
} from '@nx-bridge/constants';
import { LocalStorageManagerService } from '../../services/local-storage-manager.service';
import { gameDetailSizes } from '@nx-bridge/computed-styles';
import { SearchService } from '../../services/search.service';

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
  ) {}

  ngOnInit(): void {
    this.store.select(ReducerNames.users).subscribe((userState) => {
      this.currentlyViewingUser = userState.currentlyViewingUser;
    });

    this.store.select(ReducerNames.games).subscribe(gameState => {
      this.totalGames = gameState.filteredGames?.length;
      this.totalNumberOfPages = Math.ceil(
        this.totalGames / this.resultsPerPage
      );
    })

    this.store.select(ReducerNames.filters).subscribe((filterState) => {
      if (!filterState.dealsThatMatchFilters.includes(`${reducerDefaultValue}`)) this.numberOfDealsMatchingFilters = filterState.dealsThatMatchFilters.length;
      else this.numberOfDealsMatchingFilters = -1;
    });

    this.setDefaultResultsPerPage();
    this.preferences = this.localStorageManager.getPreferences();
    this.setOptionElementsPerPreferences();
    this.changeSize(this.preferences.size);
    this.showSearchHideButton();
  }

  onCurrentPageChange(e: Event) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    this.currentBatch = +option.value;
    this.store.dispatch(new SetBatchNumber(this.currentBatch));
    this.searchService.setCurrentlyDisplayingGames();
  }

  onHide() {
    const gamesView = this.elRef.nativeElement as HTMLElement;
    const size = gamesView.querySelector(`.${GAMES_VIEW_CLASSNAME}__size`) as HTMLElement;
    const sort = gamesView.querySelector(`.${GAMES_VIEW_CLASSNAME}__sort`) as HTMLElement;
    const results = gamesView.querySelector(`.${GAMES_VIEW_CLASSNAME}__results`) as HTMLElement;
    const page = gamesView.querySelector(`.${GAMES_VIEW_CLASSNAME}__page`) as HTMLElement;
    const button = gamesView.querySelector(`.${GAMES_VIEW_CLASSNAME}__hide`) as HTMLElement;

    if (size.classList.contains(DISPLAY_NONE_CLASSNAME)) {
      this.renderer.removeClass(size, DISPLAY_NONE_CLASSNAME);
      this.renderer.removeClass(results, DISPLAY_NONE_CLASSNAME);
      this.renderer.removeClass(sort, DISPLAY_NONE_CLASSNAME);
      this.renderer.removeClass(page, DISPLAY_NONE_CLASSNAME);
      button.innerHTML = 'Hide';
    } else {
      this.renderer.addClass(size, DISPLAY_NONE_CLASSNAME);
      this.renderer.addClass(results, DISPLAY_NONE_CLASSNAME);
      this.renderer.addClass(sort, DISPLAY_NONE_CLASSNAME);
      this.renderer.addClass(page, DISPLAY_NONE_CLASSNAME);
      button.innerHTML = 'Show Options';
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

    this.setResultsPerPagePreference(option.value);
    this.resultsPerPage = +option.value;
    this.searchService.setCurrentlyDisplayingGames();
    this.totalNumberOfPages = getNewTotalNumberOfPages(
      +option.value,
      this.totalGames
    );
    this.selectCurrentPage(this.currentBatch);
  }

  onSizeChange(e: Event, shouldSave = true) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    if (shouldSave) this.localStorageManager.saveSizePreference(option.value);
    this.changeSize(option.value);
  }

  onSortChange(e: Event, shouldSave = true) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    if (shouldSave) this.localStorageManager.saveSortPreference(option.value);

    this.setSortPreference(option.value);

    this.currentBatch =
      this.currentBatch <= 0
        ? this.totalNumberOfPages - 1
        : this.totalNumberOfPages - 1 - this.currentBatch;
    this.store.dispatch(new SetBatchNumber(this.currentBatch));

    this.searchService.setCurrentlyDisplayingGames();
    this.selectCurrentPage(this.currentBatch);
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
      this.setSortPreference(stringToDispatch);
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

  private changeSize(newSize: string) {
    if (!newSize) return;
    document.documentElement.style.setProperty(
      gameDetailHeightAboveBreakpointCssPropName,
      gameDetailSizes[newSize].gameDetailHeight.aboveBreakpoint
    );
    document.documentElement.style.setProperty(
      gameDetailHeightBelowBreakpointCssPropName,
      gameDetailSizes[newSize].gameDetailHeight.belowBreakpoint
    );
    document.documentElement.style.setProperty(
      gameDetailSummaryHeightPercentageCssPropName,
      gameDetailSizes[newSize].summaryHeightPercent
    );
    document.documentElement.style.setProperty(
      playerLabelsDisplayTypeCssPropName,
      gameDetailSizes[newSize].playerLabelsDisplayType
    );
    document.documentElement.style.setProperty(
      playerNamesDisplayTypeCssPropName,
      gameDetailSizes[newSize].playerNamesDisplayType
    );
    document.documentElement.style.setProperty(
      dealsListButtonFontSizeCssPropName,
      gameDetailSizes[newSize].dealsListButtonFontSize
    );
  }

  private selectCurrentPage(newBatchNumber: number) {
    //note: timeout is needed to allow the re-render to take place
    setTimeout(() => {
      const currentPageElement = this.currentPageElement
        ?.nativeElement as HTMLElement;
      const currentPageOptionElement = currentPageElement?.children[
        newBatchNumber
      ] as HTMLOptionElement;
      if (currentPageOptionElement) currentPageOptionElement.selected = true;
    }, 50);
  }

  private setDefaultResultsPerPage() {
    const resultsElement = this.resultsElement
      ?.nativeElement as HTMLSelectElement;
    const lastResultOption = resultsElement.children[
      resultsElement.children.length - 1
    ] as HTMLOptionElement;
    if (lastResultOption) lastResultOption.selected = true;
  }

  private setSortPreference(newSortPreference: string) {
    this.store.dispatch(new SetSortingPreference(newSortPreference));
  }

  private setResultsPerPagePreference(newResultsPerPagePreference: string) {
    this.store.dispatch(
      new SetResultsPerPagePreference(newResultsPerPagePreference)
    );
  }

  private showSearchHideButton() {
    const gamesListView = this.elRef.nativeElement as HTMLElement;
    const loginCardHide = gamesListView.querySelector(`.${LOGIN_CARD_CLASSNAME}__hide`);

    loginCardHide?.classList.remove(DISPLAY_NONE_CLASSNAME);
  }
}
