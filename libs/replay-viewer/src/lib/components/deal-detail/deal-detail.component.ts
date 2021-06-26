import { Component, Input, OnInit } from '@angular/core';
import { Deal } from '@nx-bridge/interfaces-and-types';
import { DEALS_LIST_DETAIL_CLASSNAME } from '@nx-bridge/constants';

@Component({
  selector: 'nx-bridge-deal-detail',
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss']
})
export class DealDetailComponent implements OnInit {
  public declarer = '';
  public dealer = '';
  @Input() deal: Deal | null = null;
  public DEALS_LIST_ITEM_CLASSNAME = ` ${DEALS_LIST_DETAIL_CLASSNAME}`;

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
  }

}
