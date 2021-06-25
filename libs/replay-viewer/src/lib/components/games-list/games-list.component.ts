import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { Game } from '@nx-bridge/interfaces-and-types';

@Component({
  selector: 'nx-bridge-games-list',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.scss']
})
export class GamesListComponent implements OnInit {
  public games: Game[] = [];

  constructor(
    private router: Router,
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.store.select('games').subscribe(gamesState => {
      this.games = gamesState.games;
    });
  }

  
}
