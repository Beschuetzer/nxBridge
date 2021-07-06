import { Component, HostBinding, OnInit } from '@angular/core';
import { AppState, SetIsViewingGame } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { Game } from '@nx-bridge/interfaces-and-types';
import { HelpersService } from '@nx-bridge/helpers';
import { dealsListDealsButtonChoices, DEALS_LIST_CLASSNAME, DEAL_DETAIL_CLASSNAME, DISPLAY_NONE_CLASSNAME, FULL_SIZE_CLASSNAME, toggleClassOnList, toggleInnerHTML } from '@nx-bridge/constants';

@Component({
  selector: 'nx-bridge-games-list',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.scss'],
})
export class GamesListComponent implements OnInit {
  @HostBinding('class.games-list') get classname() {
    return true;
  }
  public games: Game[] = [];

  constructor(
    private store: Store<AppState>,
  ) {}

  ngOnInit(): void {
    this.store.select('users').subscribe((userState) => {
      this.games = userState.currentlyViewingUser.games;
    });
  }

  onClick(e: Event) {
    const target = e.target as any;
    if ((target)?.classList.contains(FULL_SIZE_CLASSNAME)) {
      const items = target.querySelectorAll(`.${DEAL_DETAIL_CLASSNAME}`);
      if (items && items.length > 0) toggleClassOnList(items, DISPLAY_NONE_CLASSNAME);

      const summary = target.querySelector(`.${DEALS_LIST_CLASSNAME}__summary`);
      toggleClassOnList([summary], DISPLAY_NONE_CLASSNAME);

      const button = target.querySelector(`.${DEALS_LIST_CLASSNAME}__button-deals`);
      toggleInnerHTML(button, dealsListDealsButtonChoices);
      
      target.classList.remove(FULL_SIZE_CLASSNAME);
      this.store.dispatch(new SetIsViewingGame(false));
    }
  }

  // private getAndStoreUsers () {
  //   // this.helpers.getUsers(this.usernames)?.subscribe(users => {

  //     let usersInStore: User[] | null = null;
  //     this.store.select('users').pipe(take(1)).subscribe(usersState => {
  //       usersInStore = usersState.users;
  //       if (!usersInStore || usersInStore.length <= 0){
  //         this.store.dispatch(new SetUsers(users));
  //       }
  //     })
  //     this.setUsersInLocalStorage(users);
  //   // });
  // }

  // private setUsersInLocalStorage(users: User[]) {
  //   const currentValueInStorage = getValueFromLocalStorage('users')
  //   console.log('currentValueInStorage =', currentValueInStorage);
  //   const toSet: {[key: string]: User} = {};

  //   for (let i = 0; i < users.length; i++) {
  //     const user = users[i];
  //     toSet[user.username] = user;
  //   }
  //   localStorage.setItem('users', JSON.stringify({...currentValueInStorage, ...toSet}));
  // }
}
