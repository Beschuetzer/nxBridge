import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  GAME_DETAIL_CLASSNAME,
  teams,
} from '@nx-bridge/constants';
import {
  DealRelevant,
  GameRelevant,
  ReducerNames,
  Seating,
} from '@nx-bridge/interfaces-and-types';
import { AppState, reducerDefaultValue } from '@nx-bridge/store';

@Component({
  selector: 'nx-bridge-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss'],
})
export class GameDetailComponent implements OnInit {
  @HostBinding('class.game-detail') get className() {
    return true;
  }
  @Input() game: GameRelevant | null = null;
  public usernames: string[] | null = null;
  public userIds: string[] | null = null;
  public GAME_DETAIL_CLASSNAME = GAME_DETAIL_CLASSNAME;
  public seating: Seating | null = null;
  public summaryScoreMessage = 'Score Summary Here';
  public northSouthScore: number | undefined = -1;
  public eastWestScore: number | undefined = -1;
  public nsScoreGreater: number | boolean = -1;
  public teams = teams;

  // private winner: Team = '';

  constructor(
    private store: Store<AppState>
  ) // eslint-disable-next-line @typescript-eslint/no-empty-function
  {}

  ngOnInit(): void {
    this.usernames = this.getUsersnamesFromGame(this.game as GameRelevant);
    this.userIds = this.getUserIdsFromGame(this.game as GameRelevant);
    this.seating = this.game?.room.seating as Seating;

    const lastDeal = this.game?.deals[this.game.deals.length - 1];
    this.store.select(ReducerNames.deals).subscribe((dealState) => {
      const deal = dealState.fetchedDeals[lastDeal as string];
      if (deal) this.setWinnerAndScores(deal);
    });
  }

  private getUserIdsFromGame(game: GameRelevant) {
    if (!game) return null;
    return game.players;
  }

  private getUsersnamesFromGame(game: GameRelevant) {
    if (!game) return [];
    return Object.values(game.room.seating);
  }

  private setWinnerAndScores(deal: DealRelevant) {
    if (!deal) {
      this.eastWestScore = reducerDefaultValue;
      this.northSouthScore = reducerDefaultValue;
      return;
    }

    if (deal.northSouth && deal.eastWest) {
      this.northSouthScore =
        deal.northSouth.aboveTheLine + deal.northSouth.totalBelowTheLineScore;
      this.eastWestScore =
        deal.eastWest.aboveTheLine + deal.eastWest.totalBelowTheLineScore;
    }

    // let winner = "NS";
    // if (this.eastWestScore && this.northSouthScore && this.eastWestScore > this.northSouthScore) winner = "EW";
    // this.winner = winner as Team;

    if (
      this.northSouthScore !== undefined &&
      this.eastWestScore !== undefined
    ) {
      this.nsScoreGreater = this.northSouthScore > this.eastWestScore;
    }
  }
}
