import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DealRequest, GameRelevant, GetUserResponse, UserIds, FetchedDeals } from '@nx-bridge/interfaces-and-types';
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
  GET_DEALS_URL,
} from '@nx-bridge/constants';

@Injectable({ providedIn: 'root' })
export class HelpersService {
  constructor(
    private http: HttpClient,
    private store: Store<ngrxStore.AppState>,
    private router: Router,
  ) {}

  getDeals(deals: DealRequest) {
    return this.http.post<FetchedDeals>(`${GET_DEALS_URL}`, {deals});
  }

  getGameCount(userId: string) {
    const queryStringToUse = `${USER_ID_STRING}=${userId}`;
    return this.http.get<number>(`${GET_GAME_COUNT_URL}?${queryStringToUse}`);
  }

  getGames(userId: string, numberOfGamesToGet?: number) {
    const queryStringToUse = `${USER_ID_STRING}=${userId}&${GET_GAMES_LAST_STRING}=${numberOfGamesToGet}`;
    return this.http.get<GameRelevant[]>(`${GET_GAMES_URL}?${queryStringToUse}`);
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

  getNeededDeals(games: GameRelevant[]): [DealRequest, string[]] {
    const deals: DealRequest = {};
    const dealsAsStrings: string[] = [];

    if (!games) return [deals, dealsAsStrings];
    for (let i = 0; i < games.length; i++) {
      let shouldAdd = false;
      const game = games[i];
      if (!game || !game.deals) continue;
      for (let j = 0; j < game.deals.length; j++) {
        const dealId = game.deals[j];
        if (j === game.deals.length - 1) shouldAdd = true;
        deals[dealId] = shouldAdd;
        dealsAsStrings.push(dealId);
      }
    }
    return [deals, dealsAsStrings];
  }
}
