import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppState } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { DEALS_LIST_CLASSNAME, DISPLAY_NONE_CLASSNAME, GET_DEALS_URL, HIDDEN_CLASSNAME } from '@nx-bridge/constants';
import { Deal } from '@nx-bridge/interfaces-and-types';

@Component({
  selector: 'nx-bridge-deals-list',
  templateUrl: './deals-list.component.html',
  styleUrls: ['./deals-list.component.scss']
})
export class DealsListComponent implements OnInit {
  @Input() deals: string[] | undefined = [];
  public DEALS_LIST_ITEM_CLASSNAME = `${DISPLAY_NONE_CLASSNAME} ${DEALS_LIST_CLASSNAME}__item`;
  public dealsListItems: NodeList | null | undefined = null;

  constructor(
    private elRef: ElementRef,
    private http: HttpClient,
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
  }

  onShowDealsClick() {
    let deals;
    // this.store.select('deals').pipe(take(1)).subscribe(dealsState => {
    //   deals = dealsState.deals
    // });

    this.http.post<Deal[]>(GET_DEALS_URL, {deals}).subscribe(response => {
      console.log('response =', response);
      if (!this.dealsListItems) this.dealsListItems = this.elRef.nativeElement.querySelectorAll(`.${DEALS_LIST_CLASSNAME}__item`);
      this.toggleDealsListItems();
    });
  }

  private toggleDealsListItems() {
    if (!this.dealsListItems) return;
    for (let i = 0; i < this.dealsListItems.length; i++) {
      const dealItem = this.dealsListItems[i];
      (dealItem as HTMLElement)?.classList?.toggle(DISPLAY_NONE_CLASSNAME)
    }
  }
}
