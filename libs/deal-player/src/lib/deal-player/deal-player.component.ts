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

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.select('deals').subscribe((dealState) => {
      console.log('dealState =', dealState);
      this.deal = dealState.currentlyViewingDeal;
      this.updateCanvas();
    });
  }

  onClose() {
  document
      .querySelector(`.${DEAL_PLAYER_CLASSNAME}`)
      ?.classList.remove(VISIBLE_CLASSNAME);
  }

  private updateCanvas() {
      debugger;
      window['paper'] = paper;
    this.scope = new paper.PaperScope();
    const project1 = new Project(document.querySelector('#cv1') as HTMLCanvasElement);
    const path = new Path.Circle({
      center: [80, 50],
      radius: 30,
      strokeColor: 'black'
    });
    
  }
}
