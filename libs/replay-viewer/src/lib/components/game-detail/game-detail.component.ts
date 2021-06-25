import { Component, Input, OnInit } from '@angular/core';
import { Game } from '@nx-bridge/interfaces-and-types';


@Component({
  selector: 'nx-bridge-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss']
})
export class GameDetailComponent implements OnInit {
  @Input() game: Game | null = null;

  constructor(

  ) { }

  ngOnInit(): void {
  }

}
