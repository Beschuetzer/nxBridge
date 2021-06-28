import { Injectable, Renderer2 } from '@angular/core';
import { DEAL_DETAIL_CLASSNAME, getSuitAsStringFromHand as getSuitAsStringFromArray, suitsAsCapitalizedStrings, suitsHtmlEntities } from '@nx-bridge/constants';
import { Hand, HandsForConsumption as HandForConsumption } from '@nx-bridge/interfaces-and-types';

@Injectable({
  providedIn: 'root'
})
export class ReplayViewerDealService {

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private renderer: Renderer2) {}

  getHandAsTable(hands: HandForConsumption[]) {
    // this.
    //todo: how to append div after another div?
    const table = this.getNewElement('div');
    this.renderer.addClass(table, `${DEAL_DETAIL_CLASSNAME}__hands-table`);

    //todo: need the initial column then four others
    this.renderer.appendChild(table, this.getSuitColumn());

    let i = 2;
    for (const username in hands) {
      if (Object.prototype.hasOwnProperty.call(hands, username)) {
        const hand = hands[username];
        debugger;
        const userColumnDiv = this.getNewElement('div');
        this.renderer.addClass(userColumnDiv, `${DEAL_DETAIL_CLASSNAME}__hands-column-${i}`)

        const usernameDiv = this.getNewElement('div');
        this.renderer.setProperty(usernameDiv, 'innerHTML', username);
        this.renderer.appendChild(userColumnDiv, usernameDiv);

        for (let j = 0; j < hand.length; j++) {
          const suit = hand[j];
          const suitString = getSuitAsStringFromArray(suit);
          const suitDiv = this.getNewElement('div');
          this.renderer.setProperty(suitDiv, 'innerHTML', suitString);
          this.renderer.appendChild(userColumnDiv, suitDiv);
        }
      }
      i++;
    }

    this.renderer.appendChild(table, document.querySelector(`.${DEAL_DETAIL_CLASSNAME}__hands`));
  }

  getUserColumn(hand: HandForConsumption, username: string) {

  }

  getSuitColumn() {
    const suitColumn = this.renderer.createElement('div');
    this.renderer.addClass(suitColumn, `${DEAL_DETAIL_CLASSNAME}__hands-column-1`)
    this.renderer.appendChild(suitColumn, this.getNewElement('div'));
    for (let i = 0; i < suitsHtmlEntities.length; i++) {
      const htmlEntity = suitsHtmlEntities[i];
      const suitDiv = this.getNewElement('div');
      this.renderer.setProperty(suitDiv, 'innerHTML', htmlEntity);
      this.renderer.appendChild(suitColumn, suitDiv);
    }
    return suitColumn;
  }


  getNewElement(elementType: string) {
    return this.renderer.createElement(elementType)
  }
  
}