import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, User } from '@nx-bridge/interfaces-and-types';
import * as ngrxStore from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { GET_GAMES_URL, GET_USER_URL, GET_USERS_URL, USER_ID_STRING, EMAIL_STRING, USERNAME_STRING, USERS_STRING } from '@nx-bridge/constants';
import * as mongoose from 'mongoose';

@Injectable({ providedIn: 'root' })
export class HelpersService {
  constructor(
    private http: HttpClient,
    private store: Store<ngrxStore.AppState>,
    private router: Router,
  ) {}

  setDeals(games: Game[]) {
    const deals = [];
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      for (let j = 0; j < game.deals.length; j++) {
        const deal = game.deals[j];
        deals.push(deal);
      }
    }

    this.store.dispatch(new ngrxStore.SetDealsAsStrings(deals));
  }

  getGameCount(userId: string) {

  }

  getGames(userId: string) {
    const queryStringToUse = `${USER_ID_STRING}=${userId}`;
    this.http
      .get<Game[]>(`${GET_GAMES_URL}?${queryStringToUse}`)
      .subscribe((games) => {
        console.log('games =', games);
        this.store.dispatch(new ngrxStore.SetGames(games));
        this.setDeals(games);
      });
  }

  getUser(parsed: User | null, usernameValue: string, emailValue: string) {
    this.http
      .post<User>(`${GET_USER_URL}`, {
        [`${EMAIL_STRING}`]: emailValue,
        [`${USERNAME_STRING}`]: usernameValue,
      })
      .subscribe((user) => {

        if (user) {
          localStorage.setItem(
            'user',
            JSON.stringify({
              ...user,
              email: null,
              salt: null,
              hash: null,
              resetPasswordExpires: null,
              resetPasswordToken: null,
            } as User)
          );
          this.getGames((user as any)._id);
        } else {
          localStorage.removeItem('user');

          // this.store.dispatch(new ngrxStore.SetDeals([]));
          // this.store.dispatch(new ngrxStore.SetGames([]));
          this.store.dispatch(
            new ngrxStore.SetLoadingError(
              `There is no user with the ${
                usernameValue ? 'username' : 'email'
              } of '${usernameValue ? usernameValue : emailValue}'.`
            )
          );
        }
        this.store.dispatch(new ngrxStore.SetIsLoading(false));
      });
  }

  getUsers(users: string[]) {
    if (!users || users.length <= 0) return;
    console.log('users =', users);
    return this.http.post<User[]>(`${GET_USERS_URL}`, {[`${USERS_STRING}`]: users});
  }
}
