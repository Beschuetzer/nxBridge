import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  Bid,
  CardinalDirection,
  CardValuesAsString,
  Contract,
  Deal,
  HandsForConsumption,
  ReducerNames,
  Seating,
  Suit,
  UserIds,
} from '@nx-bridge/interfaces-and-types';
import {
  capitalize,
  COLOR_BLACK_CLASSNAME,
  COLOR_RED_CLASSNAME,
  dealDetailButtonChoices,
  DEAL_DETAIL_CLASSNAME,
  MATCHED_DEAL_CLASSNAME,
  DISPLAY_NONE_CLASSNAME,
  GAME_DETAIL_CLASSNAME,
  getCharValueFromCardValueString,
  getDirectionFromSeating,
  getHtmlEntityFromSuitOrCardAsNumber,
  getIsBidPlayable,
  getPartnerFromDirection,
  getSuitAsStringFromArray,
  scrollToSection,
  sortHand,
  suitsHtmlEntities,
  toggleClassOnList,
  toggleInnerHTML,
  tricksInABook,
  NOT_AVAILABLE_STRING,
} from '@nx-bridge/constants';
import { Store } from '@ngrx/store';
import {
  AppState,
  CurrentlyViewingDeal,
  SetCurrentlyViewingDeal,
  SetCurrentlyViewingDealContract,
} from '@nx-bridge/store';
import { exhaustMap, switchMap, take } from 'rxjs/operators';
import { ReplayViewerDealService } from '../../services/replay-viewer.deal.service';
import { rename } from 'node:fs';
import { threadId } from 'node:worker_threads';
@Component({
  selector: 'nx-bridge-deal-detail',
  templateUrl: './deal-detail.component.html',
  styleUrls: ['./deal-detail.component.scss'],
})
export class DealDetailComponent implements OnInit {
  @HostBinding('class.deal-detail') get classname() {
    return true;
  }
  @Input() deal: Deal | null = null;
  @Input() dealIndex: number | null = null;
  @Input() seating: Seating | null = null;
  public hands: HandsForConsumption = null;
  public declarer = '';
  public dealer = '';
  public dealSummaryUsername = '';
  public dealSummaryMessageContract = '';
  public dealSummaryMessageSuffixPre = '';
  public dealSummaryMessageSuffixNumber = '';
  public dealSummaryMessageSuffixPost = '';
  public contract: Contract = { prefix: '', htmlEntity: '' };
  public buttonChoices: [string, string] = dealDetailButtonChoices;
  public DEAL_DETAIL_CLASSNAME = DEAL_DETAIL_CLASSNAME;
  public DISPLAY_NONE_CLASSNAME = DISPLAY_NONE_CLASSNAME;
  private MATCHED_DEAL_CLASSNAME = MATCHED_DEAL_CLASSNAME;
  private users: UserIds | null = null;

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private store: Store<AppState>,
    private replayViewDealService: ReplayViewerDealService
  ) {}

  ngOnInit(): void {
    this.store.select(ReducerNames.users).subscribe(userState => {
      this.users = userState.userIds;
    })

    this.setHands();
    this.setDealer();
    this.setDeclarer();
    this.setContract();
    this.setDealSummaryPrefix();
    this.setDealSummarySuffix();
    this.setHandsTable();
    this.setBiddingTable();

    let matchedDeals: string[] = [];
    this.store
      .select(ReducerNames.filters)
      .pipe(
        switchMap((filterState) => {
          matchedDeals = filterState.dealsThatMatchFilters;
          return this.store.select(ReducerNames.games)
        })
      )
      .subscribe((gameState) => {
        const dealId = (this.deal as any)._id;
        if (matchedDeals.includes(dealId)) {
          const dealDetail = this.elRef.nativeElement;
          const dealDetailSummary = dealDetail.querySelector(
            `.${DEAL_DETAIL_CLASSNAME}__summary`
          );
          this.renderer.addClass(dealDetailSummary, MATCHED_DEAL_CLASSNAME);
        }
      });
  }

  onDetailClick(e: Event) {
    const button = (e.currentTarget || e.target) as HTMLElement;
    const buttonSibling = button.nextElementSibling as HTMLElement;
    this.replayViewDealService.toggleButtonBottomBorder([
      button,
      buttonSibling,
    ]);

    const item = this.elRef.nativeElement.querySelector(
      `.${DEAL_DETAIL_CLASSNAME}__tables`
    );

    toggleClassOnList([item], DISPLAY_NONE_CLASSNAME);
    toggleInnerHTML(button, this.buttonChoices);

    if (button.innerHTML.match(this.buttonChoices[1])) {
      const gameDetail = button.closest(`.${GAME_DETAIL_CLASSNAME}`);
      const gameDetailSummary = gameDetail?.querySelector(
        `.${GAME_DETAIL_CLASSNAME}__summary`
      );
      const gameDetailSummaryClientRect = gameDetailSummary?.getBoundingClientRect();
      const gameDetailSummaryBottom =
        (gameDetailSummaryClientRect?.bottom as number) +
        window.innerHeight / 6;
      const scrollAmount = scrollToSection(
        button,
        gameDetailSummaryBottom ? gameDetailSummaryBottom : 0,
        true
      );
      if (gameDetail) gameDetail.scrollTop = scrollAmount as number;
    }
  }

  onWatchClick(e: Event) {
    this.store.dispatch(
      new SetCurrentlyViewingDealContract(this.contract as Contract)
    );

    const button = (e.currentTarget || e.target) as HTMLButtonElement;
    const dealDetailSummary = button.closest(
      `.${DEAL_DETAIL_CLASSNAME}__summary`
    );
    const dealNumber = dealDetailSummary
      ?.querySelector(`.${DEAL_DETAIL_CLASSNAME}__summary-number`)
      ?.innerHTML.match(/\d+/i);

    this.store.dispatch(
      new SetCurrentlyViewingDeal({
        ...this.deal,
        dealNumber: dealNumber ? dealNumber[0] : -1,
        declarer: this.declarer,
        biddingTable: this.elRef.nativeElement.querySelector(
          `.${DEAL_DETAIL_CLASSNAME}__bids`
        )?.innerHTML,
        summaryPre: this.dealSummaryMessageSuffixPre,
        summaryNumber: this.dealSummaryMessageSuffixNumber,
        summaryPost: this.dealSummaryMessageSuffixPost,
      } as CurrentlyViewingDeal)
    );
  }

  setBiddingTable() {
    const biddingAsTable = this.getBiddingAsTable(this.deal?.bids);
    const target = this.elRef.nativeElement.querySelector(
      `.${DEAL_DETAIL_CLASSNAME}__bids`
    );
    this.renderer.appendChild(target, biddingAsTable);
  }

  setContract() {
    if (!this.deal?.contract)
      return (this.contract = { prefix: '', htmlEntity: '' });
    const splitContract = this.deal?.contract.split(' ');
    if (!splitContract) return;
    const prefix = getCharValueFromCardValueString(
      splitContract[0] as CardValuesAsString,
      true
    );

    const htmlEntity = getHtmlEntityFromSuitOrCardAsNumber(
      splitContract?.slice(1).join(' ') as Suit
    );
    return (this.contract = { prefix, htmlEntity });
  }

  setDealer() {
    const dealer = this.deal?.dealer;

    if (dealer && this.users) this.dealer = this.users[dealer];
    else this.dealer = NOT_AVAILABLE_STRING;
  }

  setDealSummaryPrefix() {
    if (!this.declarer) {
      this.dealSummaryUsername = '';
    } else this.dealSummaryUsername = `'${this.declarer}'`;
  }

  setDealSummarySuffix() {
    const [entireString, difference] = this.getMadeAmountString();

    if (difference > 0) {
      const differenceAsString = `${difference}`;
      const indexOfDifference = entireString.indexOf(differenceAsString);
      const pre = entireString.substr(0, indexOfDifference);

      if (entireString.length > indexOfDifference) {
        this.dealSummaryMessageSuffixPost = entireString.substr(
          indexOfDifference + 1
        );
      }

      this.dealSummaryMessageSuffixPre = pre;
      this.dealSummaryMessageSuffixNumber = differenceAsString;
    } else this.setDealSummaryPreOnly(entireString);
  }

  setDeclarer() {
    const declarer = this.deal?.declarer;

    if (declarer && this.users) this.declarer = this.users[declarer];
    else this.declarer = NOT_AVAILABLE_STRING;
  }

  setHands() {
    const result: HandsForConsumption = [];
    const hands = this.deal?.hands;
    if (hands) {
      for (const username in hands) {
        if (Object.prototype.hasOwnProperty.call(hands, username)) {
          const hand = hands[username];
          result.push([username, hand]);
        }
      }
      this.hands = result;
    }
  }

  setHandsTable() {
    const handAsTable = this.getHandAsTable(this.hands);
    const flatTable = this.flattenTable(handAsTable, 5);
    const target = this.elRef.nativeElement.querySelector(
      `.${DEAL_DETAIL_CLASSNAME}__hands`
    );
    this.renderer.appendChild(target, flatTable);
  }

  private setDealSummaryPreOnly(str: string) {
    this.dealSummaryMessageSuffixPre = `${str}`;
    this.dealSummaryMessageSuffixNumber = ``;
    this.dealSummaryMessageSuffixPost = ``;
  }

  private getMadeAmountString(): [string, number] {
    const playingPlayers: [string, string] = this.getPlayingPlayers();
    if (!playingPlayers[0]) return ['Deal passed out', -1];

    const amountNeeded = +this.contract.prefix + tricksInABook;
    const amountMade = this.deal?.roundWinners.reduce((count, roundWinner) => {
      if (playingPlayers.includes(roundWinner[0])) return count + 1;
      return count;
    }, 0);

    if (!amountMade) throw new Error('Error in getMadeAmountString()');
    const difference = Math.abs(amountMade - amountNeeded);

    let result = this.getMadeItString();
    if (amountMade < amountNeeded) result = `went down ${difference}`;
    else if (amountMade > amountNeeded)
      result = `made ${difference} ${
        difference === 1 ? 'overtrick' : 'overtricks'
      }`;

    return [result, difference];
  }

  //#region setBiddingTable Helpers
  private getBiddingAsTable(bids: Bid[] | undefined) {
    //returns table as element
    if (!bids || bids.length < 0) return this.getNewElement('div');
    const biddingTable = this.getNewElement('div');
    this.renderer.addClass(
      biddingTable,
      `${DEAL_DETAIL_CLASSNAME}__bids-table`
    );

    const lengthOfTable = 4;
    const initialBids = [];

    for (let i = 0; i < bids.length; i++) {
      const bid = bids[i];
      if (i < lengthOfTable) {
        initialBids.push(bid[1]);
      }

      let shouldAddColor = false;
      let toAdd = `${bid[0]}`;
      if (i >= lengthOfTable) {
        toAdd = this.getInnerHTMLOfBid(bid[1]);
        shouldAddColor = true;
      }

      this.addBidToTable(toAdd, biddingTable, shouldAddColor);

      if (i === lengthOfTable - 1) {
        for (let j = 0; j < initialBids.length; j++) {
          const innerHTML = this.getInnerHTMLOfBid(initialBids[j]);
          this.addBidToTable(innerHTML, biddingTable, true);
        }
      }
    }

    return biddingTable;
  }

  private getInnerHTMLOfBid(bid: string) {
    if (getIsBidPlayable(bid)) {
      const split = bid.split(' ');
      const numberAsString = getCharValueFromCardValueString(
        split[0] as CardValuesAsString
      );
      const htmlEntity = getHtmlEntityFromSuitOrCardAsNumber(split[1] as Suit);
      // const isRed = htmlEntity === suitsHtmlEntities[1] || htmlEntity === suitsHtmlEntities[2] ? true : false;
      return `${numberAsString}${htmlEntity}`;
    }
    return capitalize(bid);
  }

  private addBidToTable(
    innerHTML: string,
    tableRef: HTMLElement,
    shouldAddColor = false
  ) {
    const newDiv = this.getNewElement('div');
    this.renderer.setProperty(newDiv, 'innerHTML', innerHTML);

    if (shouldAddColor) {
      const isRed =
        innerHTML.match(suitsHtmlEntities[1]) ||
        innerHTML.match(suitsHtmlEntities[2]);
      let classToAdd = COLOR_BLACK_CLASSNAME;
      if (isRed) classToAdd = COLOR_RED_CLASSNAME;
      this.renderer.addClass(newDiv, classToAdd);
    }

    this.renderer.appendChild(tableRef, newDiv);
  }

  //#endregion

  //#region setHandsTable Helpers
  private getHandAsTable(hands: HandsForConsumption): HTMLElement | null {
    const table = this.getNewElement('div');
    this.renderer.appendChild(table, this.getSuitColumn());

    if (!hands) return null;
    for (let i = 0; i < hands.length; i++) {
      const hand = hands[i][1];
      const username = hands[i][0];
      const userColumnDiv = this.getNewElement('div');
      this.renderer.addClass(
        userColumnDiv,
        `${DEAL_DETAIL_CLASSNAME}__hands-column-${i + 2}`
      );

      const usernameDiv = this.getNewElement('div');
      this.renderer.setProperty(usernameDiv, 'innerHTML', username);
      this.renderer.appendChild(userColumnDiv, usernameDiv);

      if (hand !== null) {
        const sortedHand = sortHand(hand);
        for (let j = 0; j < sortedHand?.length; j++) {
          const suit = sortedHand[j];
          const suitString = getSuitAsStringFromArray(suit);
          const suitDiv = this.getNewElement('div');
          this.renderer.setProperty(suitDiv, 'innerHTML', suitString);
          this.renderer.appendChild(userColumnDiv, suitDiv);
        }
      }
      this.renderer.appendChild(table, userColumnDiv);
    }
    return table;
  }

  private flattenTable(table: HTMLElement | null, tableHeight: number) {
    if (!table) return null;
    const flatTable = this.getNewElement('div');
    const tableChildren = table.children;

    for (let i = 0; i < tableHeight; i++) {
      for (let index = 0; index < tableChildren.length; index++) {
        const child = tableChildren[index];
        const grandChildren = child.children;
        const newTableCell = this.getNewElement('div');
        const grandChildHTML = grandChildren[i].innerHTML;

        this.renderer.setProperty(newTableCell, 'innerHTML', grandChildHTML);
        this.renderer.appendChild(flatTable, newTableCell);
      }
    }

    this.renderer.addClass(flatTable, `${DEAL_DETAIL_CLASSNAME}__hands-table`);
    return flatTable;
  }

  // getUserColumn(hand: HandForConsumption, username: string) {

  // }

  private getSuitColumn() {
    const suitColumn = this.renderer.createElement('div');
    const emptyDiv = this.getNewElement('div');
    this.renderer.setProperty(emptyDiv, 'innerHTML', '&nbsp');
    this.renderer.addClass(
      suitColumn,
      `${DEAL_DETAIL_CLASSNAME}__hands-column-1`
    );
    this.renderer.appendChild(suitColumn, emptyDiv);
    for (let i = 0; i < suitsHtmlEntities.length; i++) {
      const htmlEntity = suitsHtmlEntities[i];
      const suitDiv = this.getNewElement('div');
      this.renderer.setProperty(suitDiv, 'innerHTML', htmlEntity);
      this.renderer.appendChild(suitColumn, suitDiv);
    }
    return suitColumn;
  }

  //#endregion

  //#region Misc
  private addQuotationsToUsernames(
    elements: HTMLCollection,
    nthChildToUse: number
  ) {
    let result = elements[nthChildToUse].innerHTML;
    if (nthChildToUse === 0 && result !== '&nbsp;') {
      result = `'${elements[nthChildToUse].innerHTML}'`;
    }
    return result;
  }

  private getPlayingPlayers(): [string, string] {
    //return the declarer and the declarer's partner as an array of strings
    if (!this.seating)
      throw new Error('Problem with this.seating in deal-detail');
    try {
      const declarersDirection = getDirectionFromSeating(
        this.seating,
        this.declarer
      );
      const declarersPartner = getPartnerFromDirection(
        this.seating,
        declarersDirection as CardinalDirection
      );
      return [this.declarer, declarersPartner];
    } catch (err) {
      console.log('err =', err);
      return ['', ''];
    }
  }

  private getMadeItString() {
    const options = [
      'JUST made it',
      'BARELY made it',
      'almost lost the contract',
    ];

    //returns a random integer from lower_bound_inclusive to upper_bound_exclusive
    const randomInt =
      0 + Math.floor(Math.random() * (options.length - 0.00001));
    return options[randomInt];
  }

  private getNewElement(elementType: string) {
    return this.renderer.createElement(elementType);
  }

  //#endregion
}
