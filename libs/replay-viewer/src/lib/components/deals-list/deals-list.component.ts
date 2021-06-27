import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  DEAL_DETAIL_CLASSNAME,
  DISPLAY_NONE_CLASSNAME,
  FULL_SIZE_CLASSNAME,
  GET_DEALS_URL,
  DEALS_STRING,
  toggleClassOnList,
  toggleInnerHTML,
  GAME_DETAIL_CLASSNAME,
} from '@nx-bridge/constants';
import { Deal } from '@nx-bridge/interfaces-and-types';
import { AddFetchedDeals as AddFetchedDeals, AppState } from '@nx-bridge/store';
import { Store } from '@ngrx/store';

@Component({
  selector: 'nx-bridge-deals-list',
  templateUrl: './deals-list.component.html',
  styleUrls: ['./deals-list.component.scss'],
})
export class DealsListComponent implements OnInit {
  @HostBinding('class.deals-list') get classname() {
    return true;
  }
  @Input() dealsAsStrings: string[] | undefined = [];
  public deals: Deal[] = [];
  public dealsListItems: NodeList | null | undefined = null;
  public isLoading = false;
  private buttonChoices: [string, string] = ['Show Deals', 'Hide Deals'];

  constructor(
    private elRef: ElementRef,
    private http: HttpClient,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {}

  onDealsButtonClick(e: Event) {
    const items = this.elRef.nativeElement.querySelectorAll(
      `.${DEAL_DETAIL_CLASSNAME}`
    );

    if (!items || items.length <= 0) {
      this.getItemsFromDB();
    } else {
      toggleClassOnList(items, DISPLAY_NONE_CLASSNAME);
    }

    toggleClassOnList(
      [this.elRef.nativeElement.closest(`.${GAME_DETAIL_CLASSNAME}`) as HTMLElement],
      FULL_SIZE_CLASSNAME
    );

    const button = (e.currentTarget || e.target) as HTMLElement;
    toggleInnerHTML(button, this.buttonChoices);
  }

  private getItemsFromDB() {
    const itemsToGet = this.getDealsToGet();
    this.isLoading = true;
    this.http
      .post<Deal[]>(GET_DEALS_URL, { [`${DEALS_STRING}`]: itemsToGet })
      .subscribe((deals) => {
        this.handleGetDealsFromDBResponse(deals);
      });
  }

  private getDealsToGet() {
    //todo: this can be optimized later to only get Deals not in localStorage already
    return this.dealsAsStrings;
  }

  private handleGetDealsFromDBResponse(deals: Deal[]) {
    this.deals = deals;
    this.store.dispatch(new AddFetchedDeals(deals));
    this.isLoading = false;
  }
}
