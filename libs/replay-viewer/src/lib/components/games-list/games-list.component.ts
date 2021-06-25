import { Component, OnInit } from '@angular/core';
import { AppState } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { Game } from '@nx-bridge/interfaces-and-types';
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
    this.store.select('games').subscribe(gamesState => {
      this.games = gamesState.games;
      this.populateUserIds();
      if (this.userIds) {
          this.helpers.getUsers(this.userIds)?.subscribe(users => {
          console.log('user objs =', users);
        });
      }
    });
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
}
