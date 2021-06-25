import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'nx-bridge-deals-list',
  templateUrl: './deals-list.component.html',
  styleUrls: ['./deals-list.component.scss']
})
export class DealsListComponent implements OnInit {
  @Input() deals: string[] | undefined = [];

  constructor() { }

  ngOnInit(): void {
  }

}
