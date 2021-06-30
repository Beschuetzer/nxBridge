import { Component, HostBinding, OnInit } from '@angular/core';
import { DEAL_PLAYER_CLASSNAME } from '@nx-bridge/constants';

@Component({
  selector: 'nx-bridge-deal-player',
  templateUrl: './deal-player.component.html',
  styleUrls: ['./deal-player.component.scss']
})
export class DealPlayerComponent implements OnInit {
  @HostBinding(`class.${DEAL_PLAYER_CLASSNAME}`) get classname() {return true}
  public DEAL_PLAYER_CLASSNAME = DEAL_PLAYER_CLASSNAME;
  constructor() { }

  ngOnInit(): void {
  }

}
