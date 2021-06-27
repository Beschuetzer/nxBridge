import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { GAME_DETAIL_CLASSNAME } from '@nx-bridge/constants';
import { Game, Seating } from '@nx-bridge/interfaces-and-types';

type Winner = "EW" | "NS" | '';

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
  public summaryScoreMessage = 'Score Summary Here';

  private winner: Winner = '';
  private northSouthScore: number | undefined = -1;
  private eastWestScore: number | undefined = -1;

  constructor(

  ) { }

  ngOnInit(): void {
    this.usernames = this.getUsersnamesFromGame(this.game as Game);
    this.userIds = this.getUserIdsFromGame(this.game as Game);
    this.seating = this.game?.room.seating as Seating;
    this.setSummaryScoreMessage();
    this.setWinners();
  }

  private getUserIdsFromGame (game: Game) {
    return game.players;
  }

  private getUsersnamesFromGame(game: Game) {
    if (!game) return [];
    return Object.keys(game.points);
  }

  private setWinners() {
    let winner = "NS";
    this.northSouthScore = this.game?.gameRoundEndingScores?.northSouth.reduce((prev, current) => {
      return prev + current;
    }, 0);
    this.eastWestScore = this.game?.gameRoundEndingScores?.eastWest.reduce((prev, current) => {
      return prev + current;
    }, 0);
    
    if (this.eastWestScore && this.northSouthScore && this.eastWestScore > this.northSouthScore) winner = "EW";
    this.winner = winner as Winner;
  }

  private setSummaryScoreMessage() {
    
  }

}
