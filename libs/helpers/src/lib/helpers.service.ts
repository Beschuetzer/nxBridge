import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, User } from '@nx-bridge/interfaces-and-types';
import * as ngrxStore from '@nx-bridge/store';
import { Store } from '@ngrx/store';

@Injectable({ providedIn: 'root'})
export class HelpersService {
  constructor(
    private http: HttpClient,
    private store: Store<ngrxStore.AppState>,
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

    this.store.dispatch(new ngrxStore.SetDeals(deals));
  }

  getGames(userId: string) {
    const queryStringToUse = `userId=${userId}`;
    this.http.get<Game[]>(`/api/getGames?${queryStringToUse}`).subscribe(games => {
      console.log('games =', games);
      this.store.dispatch(new ngrxStore.SetGames(games));
      this.setDeals(games);
    })
  }

  getUserId(parsed: User | null, usernameValue: string, emailValue: string) {
    this.http
      .post<User>('/api/getUser', {
        email: emailValue,
        username: usernameValue,
      })
      .subscribe((user) => {
        console.log('user =', user);

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
        }
        else {
          localStorage.removeItem('user');

          this.setError(
            `There is no user with the ${
              usernameValue ? 'username' : 'email'
            } of `,
            `'${usernameValue ? usernameValue : emailValue}'.`
          );
        }
        this.isLoading = false;
      });
  }
}

