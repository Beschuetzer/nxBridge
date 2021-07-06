import { Component, HostBinding, OnInit } from '@angular/core';
import { AppState } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { LocalStorageUser } from '@nx-bridge/interfaces-and-types';

@Component({
  selector: 'nx-bridge-games-list-view',
  templateUrl: './games-list-view.component.html',
  styleUrls: ['./games-list-view.component.scss']
})
export class GamesListViewComponent implements OnInit {
  @HostBinding('class.games-list-view') get classname() {return true};
  public currentlyViewingUser: LocalStorageUser = {} as LocalStorageUser;

  constructor(
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
     this.store.select('users').subscribe(userState => {
       this.currentlyViewingUser = userState.currentlyViewingUser;
     })

  }

}
