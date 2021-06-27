import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { GAME_DETAIL_CLASSNAME } from '@nx-bridge/constants';
import { Game, Seating } from '@nx-bridge/interfaces-and-types';

@Component({
  selector: 'nx-bridge-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss'],
})
export class GameDetailComponent implements OnInit {
  @HostBinding('class.game-detail') get className() { return true};
  @Input() game: Game | null = null;
  public usernames: string[] | null = null;
  public userIds: string[] | null = null;
  public GAME_DETAIL_CLASSNAME = GAME_DETAIL_CLASSNAME;
  public seating: Seating | null = null;

  constructor(

  ) { }

  ngOnInit(): void {
    this.usernames = this.getUsersnamesFromGame(this.game as Game);
    this.userIds = this.getUserIdsFromGame(this.game as Game);
    this.seating = this.game?.room.seating as Seating;
  }

  private getUserIdsFromGame (game: Game) {
    return game.players;
  }

  private getUsersnamesFromGame(game: Game) {
    if (!game) return [];
    return Object.keys(game.points);
  }

}