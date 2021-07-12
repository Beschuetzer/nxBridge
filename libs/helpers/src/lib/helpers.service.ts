import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Deal, Game, GetUserResponse, UserIds } from '@nx-bridge/interfaces-and-types';
import * as ngrxStore from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import {
  GET_GAMES_URL,
  GET_USER_URL,
  GET_USERS_URL,
  USER_ID_STRING,
  EMAIL_STRING,
  USERNAME_STRING,
  USERS_STRING,
  GET_GAME_COUNT_URL,
  GET_GAMES_LAST_STRING,
  DEALS_STRING,
  GET_DEALS_URL,
} from '@nx-bridge/constants';

@Injectable({ providedIn: 'root' })
export class HelpersService {
  constructor(
    private http: HttpClient,
    private store: Store<ngrxStore.AppState>,
    private router: Router,
  ) {}

  getDeals(deals: string[]) {
    return this.http.post<Deal[]>(`${GET_DEALS_URL}`, {deals});
  }

  getGameCount(userId: string) {
    const queryStringToUse = `${USER_ID_STRING}=${userId}`;
    return this.http.get<number>(`${GET_GAME_COUNT_URL}?${queryStringToUse}`);
  }

  getGames(userId: string, numberOfGamesToGet?: number) {
    const queryStringToUse = `${USER_ID_STRING}=${userId}&${GET_GAMES_LAST_STRING}=${numberOfGamesToGet}`;
    return this.http.get<Game[]>(`${GET_GAMES_URL}?${queryStringToUse}`);
  }

  getUser(usernameValue: string, emailValue: string) {
    return this.http.post<GetUserResponse>(`${GET_USER_URL}`, {
      [`${EMAIL_STRING}`]: emailValue,
      [`${USERNAME_STRING}`]: usernameValue,
    });
  }

  getUsers(users: string[]) {
    if (!users || users.length <= 0) return;
    return this.http.post<UserIds>(`${GET_USERS_URL}`, {
      [`${USERS_STRING}`]: users,
    });
  }

  getDealsAsStrings(games: Game[]) {
    const deals: string[] = [];
    if (!games) return deals;
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      if (!game || !game.deals) continue;
      for (let j = 0; j < game.deals.length; j++) {
        const deal = game.deals[j];
        deals.push(deal);
      }
    }
    return deals;
  }
}
