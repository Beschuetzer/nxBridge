import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Game } from '@nx-bridge/interfaces-and-types';
import { HIDDEN_CLASSNAME, DEALS_LIST_CLASSNAME } from '@nx-bridge/constants';

@Component({
  selector: 'nx-bridge-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss']
})
export class GameDetailComponent implements OnInit {
  public DEALS_LIST_CLASSNAME = `${HIDDEN_CLASSNAME} ${DEALS_LIST_CLASSNAME}`;
  @Input() game: Game | null = null;
  public dealsList: HTMLElement | null = null;


  constructor(
    private elRef: ElementRef
  ) { }

  ngOnInit(): void {
  }

  onShowDealsClick() {
    if (!this.dealsList) this.dealsList = this.elRef.nativeElement.querySelector(`.${DEALS_LIST_CLASSNAME}`);
    this.dealsList?.classList?.toggle(HIDDEN_CLASSNAME)
  }

}
