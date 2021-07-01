import { Component, HostBinding, OnInit } from '@angular/core';
import {
  DEAL_PLAYER_CLASSNAME,
  VISIBLE_CLASSNAME,
  DISPLAY_NONE_CLASSNAME,
} from '@nx-bridge/constants';

import { Store } from '@ngrx/store';
import { AppState } from '@nx-bridge/store';
import { Deal } from '@nx-bridge/interfaces-and-types';
import * as paper from 'paper';
import { Path, Project, Raster } from 'paper/dist/paper-core';

@Component({
  selector: 'nx-bridge-deal-player',
  templateUrl: './deal-player.component.html',
  styleUrls: ['./deal-player.component.scss'],
})
export class DealPlayerComponent implements OnInit {
  @HostBinding(`class.${DEAL_PLAYER_CLASSNAME}`) get classname() {
    return true;
  }
  public DEAL_PLAYER_CLASSNAME = DEAL_PLAYER_CLASSNAME;
  public DISPLAY_NONE_CLASSNAME = DISPLAY_NONE_CLASSNAME;
  public deal: Deal | null = null;
  public isPlaying = false;
  public scope: paper.PaperScope | null = null;
  public project: paper.Project | null = null;
  public isMobile = window.innerWidth <= 655;
  private cards: any[] = [];
  private cardsLoaded = 0;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    

    this.store.select('deals').subscribe((dealState) => {
      this.deal = dealState.currentlyViewingDeal;
      if (Object.keys(this.deal).length <= 0) return;

      this.project = new Project(
        document.querySelector(
          `#${DEAL_PLAYER_CLASSNAME}-canvas`
        ) as HTMLCanvasElement
      );
  
      const path = new Path.Circle({
        center: [Math.random() * window.innerWidth, Math.random() * 100],
        radius: Math.random() * 100,
        strokeColor: 'black',
      });
      // console.log('this.deal =', this.deal);
      // // this.cardsLoaded = 0;
      // // this.cards = [];
      // if (this.cards.length < 52) this.loadCards();
      // else {
      //   this.renderHands();
      // }
    });
  }

  onClose() {
    document
      .querySelector(`.${DEAL_PLAYER_CLASSNAME}`)
      ?.classList.remove(VISIBLE_CLASSNAME);
  }

  private loadCards() {
    for (let i = 0; i < 52; i++) {
      console.log('i =', i);
      const newRaster = new Raster(`card-${i}`);
      newRaster.onLoad = this.onCardLoad.bind(this);
      this.cards.push(newRaster);
    }
  }

  private onCardLoad() {
    console.log('this.cardsLoaded =', this.cardsLoaded);
    this.cardsLoaded += 1;
    if (this.cardsLoaded >= 52) {
      this.renderHands();
    }
  }

  private renderHands() {
    debugger;
    const path = new Path.Circle({
      center: [Math.random() * 100, Math.random() * 100],
      radius: Math.random() * 100,
      strokeColor: 'black',
    });
  }
}
