import { Component, HostBinding, OnInit } from '@angular/core';
import { AppState, SetUsers } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { Game, User } from '@nx-bridge/interfaces-and-types';
import { HelpersService } from '@nx-bridge/helpers';
import { dealsListDealsButtonChoices, DEALS_LIST_CLASSNAME, DEAL_DETAIL_CLASSNAME, DISPLAY_NONE_CLASSNAME, FULL_SIZE_CLASSNAME, getValueFromLocalStorage, toggleClassOnList, toggleInnerHTML } from '@nx-bridge/constants';

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
    private helpers: HelpersService
  ) {}

  ngOnInit(): void {
    // const usersInLocalStorage = JSON.parse(localStorage.getItem('users') as string);
    // if (!usersInLocalStorage) {
    this.store.select('games').subscribe((gamesState) => {
      this.games = gamesState.games;
      // this.populateUsernames();
      // if (this.usernames) this.getAndStoreUsers();
    });
    // } else {
    //   this.store.dispatch(new SetUsers(usersInLocalStorage));
    // }
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
