import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Game } from '@nx-bridge/interfaces-and-types';

@Component({
  selector: 'nx-bridge-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss']
})
export class GameDetailComponent implements OnInit {
  @ViewChild('dealsList') dealsList: HTMLElement | null = null;
  @Input() game: any;

  constructor() { }

  ngOnInit(): void {
    
  }

  onShowDealsClick() {
    debugger;
    this.dealsList?.classList.toggle(HIDDEN_CLASSNAME)
  }

}
