import { Component, OnInit } from '@angular/core';
import { AppState, SetUsers } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { Game, User } from '@nx-bridge/interfaces-and-types';
import { HelpersService } from '@nx-bridge/helpers';

@Component({
  selector: 'nx-bridge-games-list',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.scss']
})
export class GamesListComponent implements OnInit {
  public games: Game[] = [];
  public userIds: string[] = [];

  constructor(
    private store: Store<AppState>,
    private helpers: HelpersService,
  ) { }

  ngOnInit(): void {
    const usersInLocalStorage = JSON.parse(localStorage.getItem('users') as string);
    if (!usersInLocalStorage) {
      this.store.select('games').subscribe(gamesState => {
        this.games = gamesState.games;
        this.populateUserIds();
        if (this.userIds) {
            console.log('getting users');
            this.helpers.getUsers(this.userIds)?.subscribe(users => {
            
              let usersInStore: User[] | null = null;
              this.store.select('users').pipe(take(1)).subscribe(usersState => {
                usersInStore = usersState.users;
                if (!usersInStore || usersInStore.length <= 0){
                  this.store.dispatch(new SetUsers(users));
                }
              })
              this.setUsersInLocalStorage(users);
            });
        }
      });
    } else {
      this.store.dispatch(new SetUsers(usersInLocalStorage));
    }
  }

  private populateUserIds() {
    //this grabs all of the user objs for every game and stores it in localstorage/ngrx store so GameDetail can grab
    //todo: need to optimize with caching

    for (let i = 0; i < this.games.length; i++) {
      const game = this.games[i];
      for (let j = 0; j < game.players.length; j++) {
        const playerId = game.players[j];
        if (this.userIds.findIndex(id => id === playerId) === -1) this.userIds.push(playerId);
      }
    }
  }

  private setUsersInLocalStorage(users: User[]) {
    const currentValueInStorage = JSON.parse(localStorage.getItem('users') as string);
    const toSet: {[key: string]: User} = {};

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      toSet[user.username] = user;
    }
    console.log('toSet =', toSet);
    localStorage.setItem('users', JSON.stringify({...currentValueInStorage, ...toSet}));
  }
}
