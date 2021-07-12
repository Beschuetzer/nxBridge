import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AppState,
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
  gameDetailHeightAboveBreakpointCssPropName,
  gameDetailHeightBelowBreakpointCssPropName,
  gameDetailSummaryHeightPercentageCssPropName,
  getNewBatchNumber,
  getNewTotalNumberOfPages,
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
  public sizeOptions = SIZE_OPTIONS;
  public sortOptions = SORT_OPTIONS;
  public resultsPerPageOptions = RESULTS_PER_PAGE_OPTIONS;
  public resultsPerPage = this.DEFAULT_RESULTS_PER_PAGE;
  public totalNumberOfPages = -1;
  public currentBatch = 0;
  public totalGames = -1;
  public preferences: GameDetailDisplayPreferences = {} as GameDetailDisplayPreferences;

  getArrayUpToNumber(number: number) {
    if (!number || number <= 0) return;
    return Array(number).map((x, i) => i + 1);
  }

  constructor(
    private store: Store<AppState>,
    private localStorageManager: LocalStorageManagerService,
    private searchService: SearchService
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

    this.setDefaultResultsPerPage();
    this.preferences = this.localStorageManager.getPreferences();
    this.setOptionElementsPerPreferences();
    this.changeSize(this.preferences.size);
  }

  onCurrentPageChange(e: Event) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    this.currentBatch = +option.value;
    this.store.dispatch(new SetBatchNumber(this.currentBatch));
    this.searchService.setCurrentlyDisplayingGames();
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
      this.currentBatch === 0
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
}
