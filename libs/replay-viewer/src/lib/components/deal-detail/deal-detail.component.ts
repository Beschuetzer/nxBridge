import { Component, Input, OnInit } from '@angular/core';
import { Deal, Hand } from '@nx-bridge/interfaces-and-types';
import { DEAL_DETAIL_CLASSNAME } from '@nx-bridge/constants';

type HandsForConsumption = [string, Hand][] | null | undefined;

@Component({
  selector: 'nx-bridge-deal-detail',
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss'],
})
export class DealDetailComponent implements OnInit {
  @Input() deal: Deal | null = null;
  public hands: HandsForConsumption = null;
  public declarer = '';
  public dealer = '';
  public dealSummaryMessage = '';
  public contract = '';
  public DEAL_DETAIL_CLASSNAME = ` ${DEAL_DETAIL_CLASSNAME}`;

  get getDealSummary() {
    return `${this.dealer} played ${this.contract} and ${this.dealSummaryMessage}`;
  }

  constructor() {}

  ngOnInit(): void {
    this.getHands();
    this.getDealer();
    this.getDeclarer();
    this.getContract();
    this.getDealSummaryMessage();
  }

  

  getContract() {
    //todo: return html entitity for contract suit
    const contract = 'contract';
    this.contract = contract;
  }

  getDealer() {
    //todo: can get this from bidding array
    const dealer = 'dealer';
    this.dealer = dealer;
  }

  getDealSummaryMessage() {
    const dealSummaryMessage = 'dealSummaryMessage';
    this.dealSummaryMessage = dealSummaryMessage;
  }

  getDeclarer() {
    //todo: can get this from bidding array
    const declarer = 'declarer';
    this.declarer = declarer;
  }

  getHands() {
    const result: HandsForConsumption = [];
    const hands = this.deal?.hands;
    if (hands) {
      for (const username in hands) {
        if (Object.prototype.hasOwnProperty.call(hands, username)) {
          const hand = hands[username];
          result.push([username, hand]);
        }
      }
      this.hands = result;
    }
  }
  
}
