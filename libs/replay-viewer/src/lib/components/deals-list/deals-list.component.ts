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
  toggleClassOnList,
  toggleInnerHTML,
  GAME_DETAIL_CLASSNAME,
  DEALS_LIST_CLASSNAME,
  dealsListDealsButtonChoices,
  dealsListDetailsButtonChoices,
  dealDetailButtonChoices,
  teams,
  teamsFull,
  cardinalDirections,
  getCharValueFromCardValueString,
  getPartnerFromDirection,
  getDirectionFromSeating,
  getDeclarerFromDeal,
  ANIMATION_DURATION,
  GAME_DETAIL_BORDER_BOTTOM_CLASSNAME,
} from '@nx-bridge/constants';
import {
  CardinalDirection,
  CardValuesAsString,
  DealRelevant,
  FetchedDeals,
  ReducerNames,
  Seating,
  Team,
  ToggleDealDetailButtonBehavior,
} from '@nx-bridge/interfaces-and-types';
import {
  AppState,
  CurrentlyViewingGame,
  SetCurrentlyViewingGame,
  SetIsViewingGame,
} from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { ReplayViewerDealService } from '../../services/replay-viewer.deal.service';

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
  public deals: DealRelevant[] = [];
  public dealsListItems: NodeList | null | undefined = null;
  public isLoading = false;
  public dealCountMessage = 'DealRelevant Count Here';
  public buttonChoicesDeals: [string, string] = dealsListDealsButtonChoices;
  public buttonChoicesDetails: [string, string] = dealsListDetailsButtonChoices;
  public northSouthPlayers: [string, string] | [] = [];
  public eastWestPlayers: [string, string] | [] = [];
  private isAllowedToClose = false;

  constructor(
    private elRef: ElementRef,
    private http: HttpClient,
    private store: Store<AppState>,
    private replayViewerDealService: ReplayViewerDealService
  ) {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }

  onDealsButtonClick(e: Event) {
    if (this.replayViewerDealService.getIsGameAlreadyOpen() && !this.isAllowedToClose) return;

    const button = (e.currentTarget || e.target) as HTMLElement;
    this.handleDealsButtonLogic(button);
    this.dispatchIsViewingGame(button);
  }

  onShowDetails(e: Event) {
    this.toggleDealButtonsBorderBottoms(e);
    this.toggleDealItems(e);

    toggleInnerHTML(
      (e?.currentTarget || e?.target) as HTMLElement,
      this.buttonChoicesDetails
    );
  }

  private dispatchIsViewingGame(button: HTMLElement) {
    const isFullSize = this.toggleDeals(button);

    if (isFullSize) {
      this.store.dispatch(new SetIsViewingGame(true));
      setTimeout(() => {
        this.isAllowedToClose = true;
      }, ANIMATION_DURATION * 2);
    } else {
      this.isAllowedToClose = false;
      this.store.dispatch(new SetIsViewingGame(false));
    }
  }

  private handleDealsButtonLogic(button: HTMLElement) {
    if (button.innerHTML.match(dealsListDealsButtonChoices[0])) {
      const gameDetail = (this.elRef.nativeElement as HTMLElement).closest(
        `.${GAME_DETAIL_CLASSNAME}`
      );
      const name = gameDetail
        ?.querySelector(`.${GAME_DETAIL_CLASSNAME}__header-room`)
        ?.innerHTML?.trim();
      const date = gameDetail
        ?.querySelector(`.${GAME_DETAIL_CLASSNAME}__header-date`)
        ?.innerHTML?.trim();

      this.store.dispatch(
        new SetCurrentlyViewingGame({
          seating: this.seating,
          name: name,
          date,
          deals: this.dealsAsStrings,
        } as CurrentlyViewingGame)
      );
      this.replayViewerDealService.setGameDetailBorderToBlack();
    } else {
      this.replayViewerDealService.setGameDetailBorderToNormal();
      this.store.dispatch(
        new SetCurrentlyViewingGame({
          seating: {} as Seating,
          name: '',
          date: -1,
          deals: [],
        } as CurrentlyViewingGame)
      );
    }
    this.toggleGameDetailScoreBorder();
  }

  private loadRelevantDeals() {
    this.deals = this.replayViewerDealService.getDealsToGet(this.dealsAsStrings as string[]);
    this.setTeams();
    this.dealCountMessage = this.replayViewerDealService.getDealCountMessage(this.deals, this.seating as Seating);
    this.isLoading = false;
  }

  private setTeams() {
    if (!this.seating)
      throw new Error('Problem with this.seating in deals-list');
    this.northSouthPlayers = [this.seating.north, this.seating.south];
    this.eastWestPlayers = [this.seating.east, this.seating.west];
  }

  private toggleDealButtonsBorderBottoms(e: Event) {
    const button = (e.currentTarget || e.target) as HTMLElement;
    const isOpening = !button.innerHTML.match(/show/i);
    const gameDetail = (this.elRef.nativeElement as HTMLElement)?.closest(
      `.${GAME_DETAIL_CLASSNAME}`
    );
    const dealDetailViewButtons = gameDetail?.querySelectorAll(
      `.${DEAL_DETAIL_CLASSNAME}__view-button`
    );
    const dealWatchDetailButtons = gameDetail?.querySelectorAll(
      `.${DEAL_DETAIL_CLASSNAME}__watch-button`
    );
    this.replayViewerDealService.toggleButtonBottomBorder(
      [...(dealDetailViewButtons as any), ...(dealWatchDetailButtons as any)],
      isOpening
        ? ToggleDealDetailButtonBehavior.open
        : ToggleDealDetailButtonBehavior.close
    );
  }

  private toggleDealItems(e: Event) {
    const itemsToChange = this.elRef.nativeElement.querySelectorAll(
      `.${DEAL_DETAIL_CLASSNAME}__tables`
    );
    const clickedButton = (e.currentTarget || e.target) as HTMLButtonElement;

    let isOpening = false;
    if (clickedButton.innerHTML.trim() === this.buttonChoicesDetails[0])
      isOpening = true;

    for (let i = 0; i < itemsToChange.length; i++) {
      const itemToChange = itemsToChange[i];
      itemToChange.classList.remove(DISPLAY_NONE_CLASSNAME);

      const itemsParent = itemToChange.parentNode;
      const buttonToToggleInnerHTML = itemsParent.querySelector('button');

      if (isOpening) {
        buttonToToggleInnerHTML.innerHTML = dealDetailButtonChoices[1];
      } else {
        itemToChange.classList.add(DISPLAY_NONE_CLASSNAME);
        buttonToToggleInnerHTML.innerHTML = dealDetailButtonChoices[0];
      }
    }
  }

  private toggleDeals(button: HTMLElement) {
    toggleInnerHTML(button, this.buttonChoicesDeals);

    const items = this.elRef.nativeElement.querySelectorAll(
      `.${DEAL_DETAIL_CLASSNAME}`
    );

    if (!items || items.length <= 0) {
      this.loadRelevantDeals();
    } else {
      toggleClassOnList(items, DISPLAY_NONE_CLASSNAME);
    }

    const el = this.elRef.nativeElement.querySelector(
      `.${DEALS_LIST_CLASSNAME}__summary`
    );
    toggleClassOnList([el], DISPLAY_NONE_CLASSNAME);
    return toggleClassOnList(
      [
        this.elRef.nativeElement.closest(
          `.${GAME_DETAIL_CLASSNAME}`
        ) as HTMLElement,
      ],
      FULL_SIZE_CLASSNAME
    );
  }

  private toggleGameDetailScoreBorder() {
    const gameDetail = (this.elRef.nativeElement as HTMLElement).closest(
      `.${GAME_DETAIL_CLASSNAME}`
    ) as HTMLElement;
    const gameDetailScorelement = gameDetail.querySelector(
      `.${GAME_DETAIL_CLASSNAME}__score`
    ) as HTMLElement;
    toggleClassOnList(
      [gameDetailScorelement],
      GAME_DETAIL_BORDER_BOTTOM_CLASSNAME
    );
  }
}
