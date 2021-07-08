import { Component, HostBinding, OnInit } from '@angular/core';
import { AppState } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { LocalStorageUserWithGames, GameDetailSizes, SortOptions } from '@nx-bridge/interfaces-and-types';
import { SIZE_OPTIONS, SORT_OPTIONS } from '@nx-bridge/constants';

@Component({
  selector: 'nx-bridge-games-list-view',
  templateUrl: './games-list-view.component.html',
  styleUrls: ['./games-list-view.component.scss']
})
export class GamesListViewComponent implements OnInit {
  @HostBinding('class.games-list-view') get classname() {return true};
  public currentlyViewingUser: LocalStorageUserWithGames = {} as LocalStorageUserWithGames;
  public sizeOptions = SIZE_OPTIONS;
  public sortOptions = SORT_OPTIONS;

  constructor(
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
     this.store.select('users').subscribe(userState => {
       this.currentlyViewingUser = userState.currentlyViewingUser;
     })

  }

  onSizeChange(e: Event) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    console.log('e.target.value =', option.value);
  }

  onSortChange(e: Event) {
    const option = (e.currentTarget || e.target) as HTMLOptionElement;
    console.log('e.value =', option.value);
  }
}
