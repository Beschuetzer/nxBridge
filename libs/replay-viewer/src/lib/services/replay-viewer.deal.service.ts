import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ANIMATION_DURATION, DEAL_DETAIL_BUTTON_BORDER_BOTTOM_CLASSNAME, gameDetailBorderClosed, gameDetailBorderCssPropName, gameDetailBorderOpen, NOT_AVAILABLE_STRING } from '@nx-bridge/constants';
import { DealRelevant, ReducerNames, ToggleDealDetailButtonBehaviour } from '@nx-bridge/interfaces-and-types';
import { AppState } from '@nx-bridge/store';
import {take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReplayViewerDealService {

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private store: Store<AppState>,
  ) {}

  getDealFromStore(dealId: string) {
    let deal: DealRelevant = {} as DealRelevant;
    this.store.select(ReducerNames.deals).pipe(take(1)).subscribe(dealState => {
      deal = dealState.fetchedDeals[dealId];
    })

    return deal;
  }

  getDeclarerFromDeal(deal: DealRelevant) {
    if (!deal) return NOT_AVAILABLE_STRING;
    
    const declarer = deal.bids[deal.bids.length - 4][0];
    const declarersBid = deal.bids[deal.bids.length - 4][1];
    return declarersBid.match(/pass/i) ? NOT_AVAILABLE_STRING : declarer;
  }

  getDeclarerFromStore(userId: string) {
    if (!userId) return NOT_AVAILABLE_STRING;

    let declarer = '';
    this.store.select(ReducerNames.users).pipe(take(1)).subscribe(userState => {
      declarer = userState.userIds[userId];
    })

    return declarer ? declarer : NOT_AVAILABLE_STRING;
  }

  setGameDetailBorderToBlack() {
    setTimeout(() => {
      const newValue = `${gameDetailBorderCssPropName}: ${gameDetailBorderOpen}`;
      document.documentElement.style.cssText += newValue;
    }, ANIMATION_DURATION)
  }

  setGameDetailBorderToNormal() {
    const newValue = `${gameDetailBorderCssPropName}: ${gameDetailBorderClosed}`;
    document.documentElement.style.cssText += newValue;
  }

  toggleButtonBottomBorder(buttons: HTMLElement[], behaviour = ToggleDealDetailButtonBehaviour.toggle) {
    if (!buttons) return;
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];

      if (behaviour === ToggleDealDetailButtonBehaviour.toggle) button.classList.toggle(DEAL_DETAIL_BUTTON_BORDER_BOTTOM_CLASSNAME);

      else if (behaviour === ToggleDealDetailButtonBehaviour.open) button.classList.remove(DEAL_DETAIL_BUTTON_BORDER_BOTTOM_CLASSNAME);

      else if (behaviour === ToggleDealDetailButtonBehaviour.close) button.classList.add(DEAL_DETAIL_BUTTON_BORDER_BOTTOM_CLASSNAME);

    }
  }
}