import { Component, ElementRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { AppState } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { LocalStorageUserWithGames, GameDetailDisplayPreferences } from '@nx-bridge/interfaces-and-types';
import { gameDetailHeightAboveBreakpointCssPropName, gameDetailHeightBelowBreakpointCssPropName, gameDetailSummaryHeightPercentageCssPropName, SIZE_OPTIONS, SORT_OPTIONS } from '@nx-bridge/constants';
import { LocalStorageManagerService } from '../../services/local-storage-manager.service';
import { gameDetailSizes } from '@nx-bridge/computed-styles';
import { debug } from 'node:console';

@Component({
  selector: 'nx-bridge-games-list-view',
  templateUrl: './games-list-view.component.html',
  styleUrls: ['./games-list-view.component.scss']
})
export class GamesListViewComponent implements OnInit {
  @ViewChild('size', { static: true }) sizeElement: ElementRef | undefined;
  @ViewChild('sort', { static: true }) sortElement: ElementRef | undefined;
  @HostBinding('class.games-list-view') get classname() {return true};
  public currentlyViewingUser: LocalStorageUserWithGames = {} as LocalStorageUserWithGames;
  public sizeOptions = SIZE_OPTIONS;
  public sortOptions = SORT_OPTIONS;
  public preferences: GameDetailDisplayPreferences = {} as GameDetailDisplayPreferences;

  constructor(
    private store: Store<AppState>,
    private localStorageManager: LocalStorageManagerService,
  ) { }

  ngOnInit(): void {
     this.store.select('users').subscribe(userState => {
       this.currentlyViewingUser = userState.currentlyViewingUser;
     })

     this.preferences = this.localStorageManager.getPreferences();
     this.setPreferences();
     this.changeSize(this.preferences.size);
  }

  onSizeChange(e: Event, shouldSave = true) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    if (shouldSave) this.localStorageManager.saveSizePreference(option.value);
    this.changeSize(option.value);
  }

  onSortChange(e: Event, shouldSave = true) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    if (shouldSave) this.localStorageManager.saveSortPreference(option.value);

    //todo: need to finish this by dispatching a different value for currentlyDisplayingHands
  }

  setPreferences() {
    const sortElement = this.sortElement?.nativeElement;
    const sizeElement = this.sizeElement?.nativeElement;

    if (sortElement) {
      let childIndex = 0;

      if (this.preferences.sort === this.sortOptions.descending)  childIndex = 1;

      const childToUse = (sortElement as HTMLSelectElement).children[childIndex] as HTMLOptionElement;
      childToUse.selected = true;
      this.onSortChange({target: childToUse} as any, false);
    }
    if (sizeElement) {
      let childIndex = 0;

      if (this.preferences.size === this.sizeOptions.medium)  childIndex = 1;
      else if (this.preferences.size === this.sizeOptions.large) childIndex = 2;

      const childToUse = (sizeElement as HTMLSelectElement).children[childIndex] as HTMLOptionElement;
      childToUse.selected = true;
      this.onSizeChange({target: childToUse} as any, false);
    }
  }

  private changeSize(newSize: string) {
    if (!newSize) return;
    document.documentElement.style.setProperty(gameDetailHeightAboveBreakpointCssPropName, gameDetailSizes[newSize].gameDetailHeight.aboveBreakpoint);
    document.documentElement.style.setProperty(gameDetailHeightBelowBreakpointCssPropName, gameDetailSizes[newSize].gameDetailHeight.belowBreakpoint);
    document.documentElement.style.setProperty(gameDetailSummaryHeightPercentageCssPropName, gameDetailSizes[newSize].summaryHeightPercent);
  }
}
