import { Component, Input, OnInit } from '@angular/core';
import { Deal, Hands } from '@nx-bridge/interfaces-and-types';
import { DEAL_DETAIL_CLASSNAME } from '@nx-bridge/constants';

@Component({
  selector: 'nx-bridge-deal-detail',
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss']
})
export class DealDetailComponent implements OnInit {
  @Input() deal: Deal | null = null;
  public hands: Hands | null = null;
  public declarer = '';
  public dealer = '';
  public DEAL_DETAIL_CLASSNAME = ` ${DEAL_DETAIL_CLASSNAME}`;

  get getDeclarer() {
    //todo: can get this from bidding array
    return 'declarer here'

  }

  get getDealer() {
    //todo: can get this from bidding array
    return 'dealer here'

  }

  constructor() { }

  ngOnInit(): void {
    this.hands = (this.deal?.hands as Hands);
  }

}
