import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DEALS_LIST_CLASSNAME, DISPLAY_NONE_CLASSNAME, GET_DEALS_URL, DEALS_STRING, toggleClassOnList, toggleInnerHTML } from '@nx-bridge/constants';
import { Deal } from '@nx-bridge/interfaces-and-types';

@Component({
  selector: 'nx-bridge-deals-list',
  templateUrl: './deals-list.component.html',
  styleUrls: ['./deals-list.component.scss']
})
export class DealsListComponent implements OnInit {
  @Input() dealsAsStrings: string[] | undefined = [];
  public deals: Deal[] = [];
  public DEALS_LIST_ITEM_CLASSNAME = ` ${DEALS_LIST_CLASSNAME}__item`;
  public dealsListItems: NodeList | null | undefined = null;
  public isLoading = false;
  private buttonChoices: [string, string] = ['Show Deals', 'Hide Deals'];

  constructor(
    private elRef: ElementRef,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
  }


  onDealsButtonClick(e: Event) {
    const items = this.elRef.nativeElement.querySelectorAll(`.${DEALS_LIST_CLASSNAME}__item`);

    if (!items || items.length <= 0) {
      this.loadItems();
    }
    else {
      toggleClassOnList(items, DISPLAY_NONE_CLASSNAME);
    }

    const button = (e.currentTarget || e.target) as HTMLElement;
    toggleInnerHTML(button, this.buttonChoices);
  }

  private loadItems() {
    this.isLoading = true;
    this.http.post<Deal[]>(GET_DEALS_URL, {[`${DEALS_STRING}`]: this.dealsAsStrings}).subscribe(deals => {
      console.log('deals =', deals);
      this.deals = deals;

      // if (!this.dealsListItems) this.dealsListItems = this.elRef.nativeElement.querySelectorAll(`.${DEALS_LIST_CLASSNAME}__item`);
      // toggleClassOnList(this.dealsListItems as any, DISPLAY_NONE_CLASSNAME)
      this.isLoading = false;
    });
  }

}
