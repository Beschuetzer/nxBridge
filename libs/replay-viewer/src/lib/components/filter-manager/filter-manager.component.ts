import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'nx-bridge-filter-manager',
  templateUrl: './filter-manager.component.html',
  styleUrls: ['./filter-manager.component.scss']
})
export class FilterManagerComponent implements OnInit {
  @HostBinding('class.filter-manager') get classname() {return true};
  private appliedFiltersMsgOptions = {
    none: "No Filters applied",
    game: {
      player: ""
    },
    date: {
      before: "",
      after: "",
      between: "",
    }
  }
  public appliedFiltersMsg = `${this.appliedFiltersMsgOptions.none}`;

  constructor() { }

  ngOnInit(): void {
  }

  onDateClick(e: Event) {
  }

  onGameClick(e: Event) {

  }

}
