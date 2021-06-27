import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { CardValuesAsString, Deal, Hand, Suits } from '@nx-bridge/interfaces-and-types';
import { DEAL_DETAIL_CLASSNAME, getCharValueFromCardValueString, getHtmlEntityFromSuitOrCardAsNumber, getIsBidPlayable, suitsHtmlEntities } from '@nx-bridge/constants';

type HandsForConsumption = [string, Hand][] | null | undefined;

@Component({
  selector: 'nx-bridge-deal-detail',
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss'],
})
export class DealDetailComponent implements OnInit {
  @HostBinding('class.deal-detail') get classname() {
    return true;
  }
  @Input() deal: Deal | null = null;
  public hands: HandsForConsumption = null;
  public declarer = '';
  public dealer = '';
  public dealSummaryMessagePrefix = '';
  public dealSummaryMessageContract = '';
  public dealSummaryMessageSuffix = '';
  public contract = {prefix: '', htmlEntity: ''};
  public DEAL_DETAIL_CLASSNAME = ` ${DEAL_DETAIL_CLASSNAME}`;

  constructor() {}

  ngOnInit(): void {
    this.setHands();
    this.setDealer();
    this.setDeclarer();
    this.setContract();
    this.setDealSummaryPrefix();
    this.setDealSummarySuffix();
  }

  setDealSummaryPrefix() {
    this.dealSummaryMessagePrefix = `${this.declarer} played `; 
  }
  
  setDealSummarySuffix() {
    //todo: need to get 'went down/up 1/2/3 etc.'
    this.dealSummaryMessageSuffix = ` and ${this.dealSummaryMessageSuffix}` 
  }

  setContract() {
    const splitContract = this.deal?.contract.split(' ');
    if (!splitContract) return;
    const prefix = getCharValueFromCardValueString(splitContract[0] as CardValuesAsString);

    const htmlEntity = getHtmlEntityFromSuitOrCardAsNumber(splitContract?.slice(1).join(' ') as Suits)
    this.contract = {prefix, htmlEntity};
  }

  setDealer() {
    const dealer = this.deal?.bids[0][0];
    this.dealer = dealer ? dealer : '';
  }

  setDeclarer() {
    const declarer = 'N/A';
    
    if (this.deal) {
      for (let i = this.deal?.bids.length - 1; i >= 0 ; i--) {
        const bid = this.deal?.bids[i][1];
        if (getIsBidPlayable(bid)) {
          this.declarer = this.deal?.bids[i][0];
          break;
        }
      }
    }
    else this.declarer = declarer;
  }

  setHands() {
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
