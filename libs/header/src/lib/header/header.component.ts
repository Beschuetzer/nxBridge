import { Component, HostBinding, OnInit } from '@angular/core';
import { HEADER_CLASSNAME } from '@nx-bridge/constants';

@Component({
  selector: 'nx-bridge-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @HostBinding(`class.${HEADER_CLASSNAME}`) get classname() {
    return true;
  }
  constructor() { }

  ngOnInit(): void {
  }

}
