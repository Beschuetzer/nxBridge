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
} from '@nx-bridge/constants';
import {
  CardinalDirection,
  CardValuesAsString,
  Deal,
  Seating,
  Team,
} from '@nx-bridge/interfaces-and-types';
import {
  AddFetchedDeals as AddFetchedDeals,
  AppState,
  CurrentlyViewingGame,
  SetCurrentlyViewingGame,
  SetIsViewingGame,
} from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { debug } from 'node:console';

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
  public dealResults: { [key: string]: Team } = {};
  public dealsListItems: NodeList | null | undefined = null;
  public isLoading = false;
  public dealCountMessage = 'Deal Count Here';
  public buttonChoicesDeals: [string, string] = dealsListDealsButtonChoices;
  public buttonChoicesDetails: [string, string] = dealsListDetailsButtonChoices;
  public northSouthPlayers: [string, string] | [] = [];
  public eastWestPlayers: [string, string] | [] = [];

  constructor(
    private elRef: ElementRef,
    private http: HttpClient,
    private store: Store<AppState>
  ) {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }

  onDealsButtonClick(e: Event) {
    if (!this.getShouldContinue()) return;
    const button = (e.currentTarget || e.target) as HTMLElement;
    this.handleDealsButtonLogic(button);
    this.dispatchIsViewingGame(button);
  }

  onShowDetails(e: Event) {
    this.toggleDealItems(e);

    toggleInnerHTML(
      (e?.currentTarget || e?.target) as HTMLElement,
      this.buttonChoicesDetails
    );
  }

  private dispatchIsViewingGame(button: HTMLElement) {
    const isFullSize = this.toggleDeals(button);

    if (isFullSize) this.store.dispatch(new SetIsViewingGame(true));
    else this.store.dispatch(new SetIsViewingGame(false));
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

  private getShouldContinue() {
    let shouldContinue = true;
    this.store.select('games').pipe(take(1)).subscribe(gameState => {
      shouldContinue = !gameState.isViewingGame;
    })
    return shouldContinue;
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
        } as CurrentlyViewingGame)
      );
    } else
      this.store.dispatch(
        new SetCurrentlyViewingGame({
          seating: {} as Seating,
          name: '',
          date: -1,
        } as CurrentlyViewingGame)
      );
  }

  private handleGetDealsFromDBResponse(deals: Deal[]) {
    this.deals = deals;
    this.store.dispatch(new AddFetchedDeals(deals));
    this.isLoading = false;
    this.setTeams();
    this.setDealCountMessage();
  }

  private setDealCountMessage() {
    let winningTeam: Team;
    const afterWinners = ' won ';
    const betweenPlayed = ' deals to ';
    let nsDealsWon = 0;
    let ewDealsWon = 0;
    let winner: Team;

    for (let i = 0; i < this.deals.length; i++) {
      const deal = this.deals[i];
      let nextDeal = null;
      if (i !== this.deals.length - 1) {
        nextDeal = this.deals[i + 1];
        winner = this.getDealWinnerFromScoreDifference(deal, nextDeal, i);
      } else {
        winner = this.getDealWinnerFromPureCalculation(deal);
      }

      if (winner === teams[0]) nsDealsWon++;
      else ewDealsWon++;
    }

    if (nsDealsWon === ewDealsWon) {
      //todo: what to display in case of tie
    } else {
      if (nsDealsWon > ewDealsWon) winningTeam = teams[0];
      else winningTeam = teams[1];

      let larger = nsDealsWon;
      let smaller = ewDealsWon;
      if (ewDealsWon > nsDealsWon) {
        larger = ewDealsWon;
        smaller = nsDealsWon;
      }

      this.dealCountMessage = `${winningTeam}${afterWinners}${larger}${betweenPlayed}${smaller}`;
    }
  }

  private getDealWinnerFromScoreDifference(
    deal: Deal,
    dealAfterDeal: Deal,
    nthDeal?: number
  ): Team {
    const dealNorthSouth = deal[teamsFull[0]];
    const dealAfterDealNorthSouth = dealAfterDeal[teamsFull[0]];
    const dealEastWest = deal[teamsFull[1]];
    const dealAfterDealEastWest = dealAfterDeal[teamsFull[1]];

    if (
      dealNorthSouth.aboveTheLine !== dealAfterDealNorthSouth.aboveTheLine &&
      dealEastWest.aboveTheLine !== dealAfterDealEastWest.aboveTheLine
    ) {
      return this.getDealWinnerFromPureCalculation(deal);
    }

    const keysToCompare = [
      'aboveTheLine',
      'belowTheLine',
      'totalBelowTheLineScore',
    ];
    for (const key of keysToCompare) {
      const nsValue = dealNorthSouth[key];
      const nsAfterValue = dealAfterDealNorthSouth[key];
      const ewValue = dealEastWest[key];
      const ewAfterValue = dealAfterDealEastWest[key];

      if (
        nsValue === undefined ||
        ewValue === undefined ||
        nsAfterValue === undefined ||
        ewAfterValue === undefined
      )
        throw new Error('Invalid key in getDealWinnerFromScoreDifference()');
      if (nsValue !== nsAfterValue && ewValue === ewAfterValue) {
        this.dealResults[`${nthDeal}`] = teams[0];
        return teams[0];
      } else if (nsValue === nsAfterValue && ewValue !== ewAfterValue) {
        this.dealResults[`${nthDeal}`] = teams[1];
        return teams[1];
      }
    }

    return this.getDealWinnerFromPureCalculation(deal);
  }

  private getDealWinnerFromPureCalculation(deal: Deal): Team {
    const declarer = getDeclarerFromDeal(deal);
    const declarersDirection = getDirectionFromSeating(
      this.seating as Seating,
      declarer
    );
    const declarersPartner = getPartnerFromDirection(
      this.seating as Seating,
      declarersDirection as CardinalDirection
    );
    const declaringTeamUsernames = [declarer, declarersPartner];
    const contractPrefixAsNumber = +getCharValueFromCardValueString(
      deal.contract.split(' ')[0] as CardValuesAsString
    );
    const numberTricksNeeded = contractPrefixAsNumber + 6;

    const tricksDeclarerMade = deal.roundWinners.reduce(
      (count, roundWinner) => {
        if (declaringTeamUsernames.includes(roundWinner[0])) count++;
        return count;
      },
      0
    );

    if (tricksDeclarerMade >= numberTricksNeeded) {
      if (
        declarersDirection === cardinalDirections[0] ||
        declarersDirection === cardinalDirections[2]
      )
        return teams[0];
      else return teams[1];
    } else {
      if (
        declarersDirection === cardinalDirections[0] ||
        declarersDirection === cardinalDirections[2]
      )
        return teams[1];
      else return teams[0];
    }
  }

  private setTeams() {
    if (!this.seating)
      throw new Error('Problem with this.seating in deals-list');
    this.northSouthPlayers = [this.seating.north, this.seating.south];
    this.eastWestPlayers = [this.seating.east, this.seating.west];
  }

  private toggleDeals(button: HTMLElement) {
    toggleInnerHTML(button, this.buttonChoicesDeals);

    const items = this.elRef.nativeElement.querySelectorAll(
      `.${DEAL_DETAIL_CLASSNAME}`
    );

    if (!items || items.length <= 0) {
      this.getItemsFromDB();
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
}
