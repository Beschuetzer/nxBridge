import { Component, Input, OnInit } from '@angular/core';
import { Game } from '@nx-bridge/interfaces-and-types';

@Component({
  selector: 'nx-bridge-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss']
})
export class GameDetailComponent implements OnInit {
  @Input() game: Game | null = null;
  public usernames: string[] | null = null;

  constructor(

  ) { }

  ngOnInit(): void {
    this.usernames = this.getUsersInGame(this.game as Game);
    this.usernames;
  }

  // private populateUsernames() {

  //   const usersInGame = 
  //   console.log('usersInGame =', usersInGame);
    
  //   for (let j = 0; j < usersInGame.length; j++) {
  //     const userInGame = usersInGame[j];
  //     if (  
  //       this.usernames &&
  //       this.usernames.findIndex(username => username === userInGame) === -1
  //     ) this.usernames.push(userInGame);
  //   }
  //   console.log('this.usernames =', this.usernames);
  // }

  private getUsersInGame(game: Game) {
    if (!game) return [];
    return Object.keys(game.points);
  }

}
