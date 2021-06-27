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
  DEALS_LIST_CLASSNAME,
} from '@nx-bridge/constants';
import { Deal, Seating } from '@nx-bridge/interfaces-and-types';
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
  @Input() seating: Seating | null = null;
  @Input() dealsAsStrings: string[] | undefined = [];
  public DEALS_LIST_CLASSNAME = DEALS_LIST_CLASSNAME;
  public DISPLAY_NONE_CLASSNAME = DISPLAY_NONE_CLASSNAME;
  public DEAL_DETAIL_CLASSNAME = DEAL_DETAIL_CLASSNAME;
  public deals: Deal[] = [];
  public dealsListItems: NodeList | null | undefined = null;
  public isLoading = false;
  public dealCountMessage = 'Deal Count Here';
  private buttonChoices: [string, string] = ['Show Deals', 'Hide Deals'];

  constructor(
    private elRef: ElementRef,
    private http: HttpClient,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.setDealCountMessage();
  }

  onDealsButtonClick(e: Event) {
    const items = this.elRef.nativeElement.querySelectorAll(
      `.${DEAL_DETAIL_CLASSNAME}`
    );

    // let isOpen = true;
    // if (items?.length > 0 && items[0]?.classList?.contains(DISPLAY_NONE_CLASSNAME)) isOpen = false;

    if (!items || items.length <= 0) {
      this.getItemsFromDB();
    } else {
      toggleClassOnList(items, DISPLAY_NONE_CLASSNAME);
    }

    const el = this.elRef.nativeElement.querySelector(`.${DEALS_LIST_CLASSNAME}__summary`);
    toggleClassOnList([el], DISPLAY_NONE_CLASSNAME);
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

  private setDealCountMessage() {
    
    const afterWinners = ' won '
    const betweenPlayed = ' deals to ';
    // let NSDealsPlayed: number;
    // let EWDealsPlayed: number;
    

    // this.dealCountMessage = `${winners}${afterWinners}${NSDealsPlayed}${betweenPlayed}${EWDealsPlayed}`;
  }

  
}
