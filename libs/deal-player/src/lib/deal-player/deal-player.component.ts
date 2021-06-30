
import { Component, HostBinding, OnInit } from '@angular/core';
import { DEAL_PLAYER_CLASSNAME, VISIBLE_CLASSNAME } from '@nx-bridge/constants';
import { Store } from '@ngrx/store';
import { AppState } from '@nx-bridge/store';
import { Deal } from '@nx-bridge/interfaces-and-types';
import { debug } from 'node:console';

@Component({
  selector: 'nx-bridge-deal-player',
  templateUrl: './deal-player.component.html',
  styleUrls: ['./deal-player.component.scss']
})
export class DealPlayerComponent implements OnInit {
  @HostBinding(`class.${DEAL_PLAYER_CLASSNAME}`) get classname() {return true}
  public DEAL_PLAYER_CLASSNAME = DEAL_PLAYER_CLASSNAME;
  public deal: Deal | null = null;

  constructor(
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
    this.store.select('deals').subscribe(dealState => {
      this.deal = dealState.currentlyViewingDeal;
      console.log('this.deal =', this.deal);
    })
  }

  onClose() {
    document.querySelector(`.${DEAL_PLAYER_CLASSNAME}`)?.classList.remove(VISIBLE_CLASSNAME)
  }

}
