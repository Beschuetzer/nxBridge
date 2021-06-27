import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'nx-bridge-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
  @HostBinding('class.main-grid') get classname() {return true};
  constructor() { }

  ngOnInit(): void {
  }

}
