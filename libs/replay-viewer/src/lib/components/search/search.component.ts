import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'nx-bridge-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @HostBinding('class.search') get classname() {return true};
  constructor() { }

  ngOnInit(): void {
  }

}
