import { Component, Input, OnInit } from '@angular/core';
import { Deal } from '@nx-bridge/interfaces-and-types';

@Component({
  selector: 'nx-bridge-deals-list',
  templateUrl: './deals-list.component.html',
  styleUrls: ['./deals-list.component.scss']
})
export class DealsListComponent implements OnInit {
  @Input() deals: Deal[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
