import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { dealsListDealsButtonChoices } from '@nx-bridge/constants';
import { debug } from 'node:console';

@Component({
  selector: 'nx-bridge-filter-manager-item',
  templateUrl: './filter-manager-item.component.html',
  styleUrls: ['./filter-manager-item.component.scss']
})
export class FilterManagerItemComponent implements OnInit {
  @Input() message = '';
  @Input() indexOfItem = -1;
  @Output() deletion = new EventEmitter<number>();
  public closeButtonHtmlEntity = dealsListDealsButtonChoices[1]

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void 
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  {
  }

  onDelete() {
    this.deletion.emit(this.indexOfItem);
  }

}
