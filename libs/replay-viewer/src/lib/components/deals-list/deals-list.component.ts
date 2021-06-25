import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DEALS_LIST_CLASSNAME, DISPLAY_NONE_CLASSNAME, GET_DEALS_URL } from '@nx-bridge/constants';
import { Deal } from '@nx-bridge/interfaces-and-types';

@Component({
  selector: 'nx-bridge-deals-list',
  templateUrl: './deals-list.component.html',
  styleUrls: ['./deals-list.component.scss']
})
export class DealsListComponent implements OnInit {
  @Input() dealsAsStrings: string[] | undefined = [];
  public deals: Deal[] = [];
  public DEALS_LIST_ITEM_CLASSNAME = `${DISPLAY_NONE_CLASSNAME} ${DEALS_LIST_CLASSNAME}__item`;
  public dealsListItems: NodeList | null | undefined = null;
  public isLoading = false;

  constructor(
    private elRef: ElementRef,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
  }

  onShowDealsClick() {
    this.isLoading = true;
    this.http.post<Deal[]>(GET_DEALS_URL, {deals: this.dealsAsStrings}).subscribe(deals => {
      console.log('deals =', deals);
      this.deals = deals;

      if (!this.dealsListItems) this.dealsListItems = this.elRef.nativeElement.querySelectorAll(`.${DEALS_LIST_CLASSNAME}__item`);
      this.toggleDealsListItems();
      this.isLoading = false;
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
