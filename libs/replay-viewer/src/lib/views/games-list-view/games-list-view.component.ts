import { Component, ElementRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { AppState, SetCurrentlyDisplayingGames, SetResultsPerPagePreference, SetSortingPreference } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { LocalStorageUserWithGames, GameDetailDisplayPreferences, Game } from '@nx-bridge/interfaces-and-types';
import { dealsListButtonFontSizeCssPropName, gameDetailHeightAboveBreakpointCssPropName, gameDetailHeightBelowBreakpointCssPropName, gameDetailSummaryHeightPercentageCssPropName, playerLabelsDisplayTypeCssPropName, playerNamesDisplayTypeCssPropName, RESULTS_PER_PAGE_OPTIONS, SIZE_OPTIONS, SORT_OPTIONS } from '@nx-bridge/constants';
import { LocalStorageManagerService } from '../../services/local-storage-manager.service';
import { gameDetailSizes } from '@nx-bridge/computed-styles';
import { take } from 'rxjs/operators';

@Component({
  selector: 'nx-bridge-games-list-view',
  templateUrl: './games-list-view.component.html',
  styleUrls: ['./games-list-view.component.scss']
})
export class GamesListViewComponent implements OnInit {
  @ViewChild('size', { static: true }) sizeElement: ElementRef | undefined;
  @ViewChild('sort', { static: true }) sortElement: ElementRef | undefined;
  @ViewChild('results', { static: true }) resultsElement: ElementRef | undefined;
  @ViewChild('currentPage', { static: true }) currentPageElement: ElementRef | undefined;
  @HostBinding('class.games-list-view') get classname() {return true};
  public currentlyViewingUser: LocalStorageUserWithGames = {} as LocalStorageUserWithGames;
  public sizeOptions = SIZE_OPTIONS;
  public sortOptions = SORT_OPTIONS;
  public resultsPerPageOptions = RESULTS_PER_PAGE_OPTIONS;
  public resultsPerPage = -1;
  public currentPage = 1;
  public totalGames = -1;
  public preferences: GameDetailDisplayPreferences = {} as GameDetailDisplayPreferences;

  constructor(
    private store: Store<AppState>,
    private localStorageManager: LocalStorageManagerService,
  ) { }

  ngOnInit(): void {
     this.store.select('users').subscribe(userState => {
       this.currentlyViewingUser = userState.currentlyViewingUser;
       this.totalGames = userState.currentlyViewingUser?.games?.length;
      //  this.totalNumberOfPages = this.totalGames / this.resultsPerPageOptions
     })

     this.preferences = this.localStorageManager.getPreferences();
     this.setPreferences();
     this.changeSize(this.preferences.size);
  }

  onCurrentPageChange(e: Event) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    this.currentPage = +option.value;
    this.changeCurrentlyDisplayingGames();
  }

  onResultsPerPageChange(e: Event, shouldSave = true) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    if (shouldSave) {
      this.localStorageManager.saveResultsPerPagePreference(option.value);
    }
    
    this.setResultsPerPagePreference(option.value);
    this.changeCurrentlyDisplayingGames();
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
    this.reverseCurrentlyDisplayingGames();
  }

  setPreferences() {
    const sortElement = this.sortElement?.nativeElement;
    const sizeElement = this.sizeElement?.nativeElement;
    const resultsElement = this.resultsElement?.nativeElement;

    if (sortElement) {
      let childIndex = 0;

      if (this.preferences.sort === this.sortOptions.descending)  childIndex = 1;

      const childToUse = (sortElement as HTMLSelectElement).children[childIndex] as HTMLOptionElement;
      childToUse.selected = true;
      this.onSortChange({target: childToUse} as any, false);

      let stringToDispatch = this.sortOptions.ascending;
      if (childIndex === 1) stringToDispatch = this.sortOptions.descending;
      this.setSortPreference(stringToDispatch);
    }
    if (sizeElement) {
      let childIndex = 0;
      let value = this.sizeOptions.small;

      if (this.preferences.size === this.sizeOptions.medium)  {
        childIndex = 1;
        value = this.sizeOptions.medium;
      }
      else if (this.preferences.size === this.sizeOptions.large) {
        childIndex = 2;
        value = this.sizeOptions.large;
      }

      const childToUse = (sizeElement as HTMLSelectElement).children[childIndex] as HTMLOptionElement;
      childToUse.selected = true;
      this.onSizeChange({target: {value}} as any, false);
    }
    if (resultsElement) {
      const childIndex = this.resultsPerPageOptions.findIndex(resultPerPage => resultPerPage === +this.preferences.resultsPerPage);
      const value = this.resultsPerPageOptions[childIndex];

      const childToUse = (resultsElement as HTMLSelectElement).children[childIndex] as HTMLOptionElement;
      childToUse.selected = true;
      this.onResultsPerPageChange({target: {value}} as any, false);
    }
  }

  private changeCurrentlyDisplayingGames() {
    //todo: use results per page and 
  }

  private changeSize(newSize: string) {
    if (!newSize) return;
    document.documentElement.style.setProperty(gameDetailHeightAboveBreakpointCssPropName, gameDetailSizes[newSize].gameDetailHeight.aboveBreakpoint);
    document.documentElement.style.setProperty(gameDetailHeightBelowBreakpointCssPropName, gameDetailSizes[newSize].gameDetailHeight.belowBreakpoint);
    document.documentElement.style.setProperty(gameDetailSummaryHeightPercentageCssPropName, gameDetailSizes[newSize].summaryHeightPercent);
    document.documentElement.style.setProperty(playerLabelsDisplayTypeCssPropName, gameDetailSizes[newSize].playerLabelsDisplayType);
    document.documentElement.style.setProperty(playerNamesDisplayTypeCssPropName, gameDetailSizes[newSize].playerNamesDisplayType);
    document.documentElement.style.setProperty(dealsListButtonFontSizeCssPropName, gameDetailSizes[newSize].dealsListButtonFontSize);
  }

  private reverseCurrentlyDisplayingGames() {
    let currentlyDisplayingGames: Game[] = [];
    this.store.select('games').pipe(take(1)).subscribe(gameState => {
      currentlyDisplayingGames = JSON.parse(JSON.stringify(gameState.currentlyDisplayingGames));
      currentlyDisplayingGames.reverse();
      this.store.dispatch(new SetCurrentlyDisplayingGames(currentlyDisplayingGames));
    });
  }

  private setSortPreference(newSortPreference: string) {
    this.store.dispatch(new SetSortingPreference(newSortPreference));
  }

  private setResultsPerPagePreference(newResultsPerPagePreference: string) {
    this.store.dispatch(new SetResultsPerPagePreference(newResultsPerPagePreference));
  }
}
