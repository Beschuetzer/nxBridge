import { Component, ElementRef, HostBinding, Input, OnInit, Renderer2 } from '@angular/core';
import { CardinalDirection, CardValuesAsString, Deal, HandsForConsumption, Seating, Suits } from '@nx-bridge/interfaces-and-types';
import { dealDetailButtonChoices, DEAL_DETAIL_CLASSNAME, DISPLAY_NONE_CLASSNAME, getCharValueFromCardValueString, getDirectionFromSeating, getHtmlEntityFromSuitOrCardAsNumber, getIsBidPlayable, getPartnerFromDirection, getSuitAsStringFromArray, suitsHtmlEntities, toggleClassOnList, toggleInnerHTML, tricksInABook } from '@nx-bridge/constants';
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
  public dealSummaryMessagePrefix = '';
  public dealSummaryMessageContract = '';
  public dealSummaryMessageSuffix = '';
  public contract = {prefix: '', htmlEntity: ''};
  public DEAL_DETAIL_CLASSNAME = ` ${DEAL_DETAIL_CLASSNAME}`;
  public DISPLAY_NONE_CLASSNAME = ` ${DISPLAY_NONE_CLASSNAME}`;
  public buttonChoices: [string, string] = dealDetailButtonChoices;

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
  ) {}

  // get getDealNumber() {
  //   if (!this.dealIndex || this.dealIndex <= 0) return "N/A";
  //   else if (this.dealIndex === 1) return "1st";
  // }

  ngOnInit(): void {
    this.setHands();
    this.setDealer();
    this.setDeclarer();
    this.setContract();
    this.setDealSummaryPrefix();
    this.setDealSummarySuffix();
    this.setTable();
  }

  setDealSummaryPrefix() {
    this.dealSummaryMessagePrefix = `'${this.declarer}' played `; 
  }
  
  setDealSummarySuffix() {
    //todo: need to get 'went down/up 1/2/3 etc.'
    const madeAmount = this.getMadeAmountString();
    this.dealSummaryMessageSuffix = ` and ${madeAmount}.` 
  }

  setContract() {
    const splitContract = this.deal?.contract.split(' ');
    if (!splitContract) return;
    const prefix = getCharValueFromCardValueString(splitContract[0] as CardValuesAsString, true);

    const htmlEntity = getHtmlEntityFromSuitOrCardAsNumber(splitContract?.slice(1).join(' ') as Suits)
    this.contract = {prefix, htmlEntity};
  }

  setDealer() {
    const dealer = this.deal?.bids[0][0];
    this.dealer = dealer ? dealer : '';
  }

  setDeclarer() {
    const declarer = 'N/A';
    
    if (this.deal) {
      for (let i = this.deal?.bids.length - 1; i >= 0 ; i--) {
        const bid = this.deal?.bids[i][1];
        if (getIsBidPlayable(bid)) {
          this.declarer = this.deal?.bids[i][0];
          break;
        }
      }
    }
    else this.declarer = declarer;
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

  onDetailClick(e: Event) {
    const item = this.elRef.nativeElement.querySelector(`.${DEAL_DETAIL_CLASSNAME}__details-more`);
    toggleClassOnList([item] , DISPLAY_NONE_CLASSNAME);
    toggleInnerHTML((e.currentTarget || e.target) as HTMLElement, this.buttonChoices);
  }

  private setTable() {
    const handAsTable = this.getHandAsTable(this.hands);
    const flatTable = this.flattenTable(handAsTable, 5);
    const target = this.elRef.nativeElement.querySelector(`.${DEAL_DETAIL_CLASSNAME}__hands`);
    this.renderer.appendChild(target, flatTable);
  }

  private getMadeAmountString() {
    const playingPlayers: string[] = this.getPlayingPlayers();
    const amountNeeded = +this.contract.prefix + tricksInABook;
    const amountMade = this.deal?.roundWinners.reduce((count, roundWinner) => {
      if (playingPlayers.includes(roundWinner[0])) return count + 1;
      return count;
    }, 0);
    
    if (!amountMade) return "Error in getMadeAmountString()";
    const difference = Math.abs(amountMade - amountNeeded);

    let result = this.getMadeItString();
    if (amountMade < amountNeeded) result = `went down ${difference}`;
    else if (amountMade > amountNeeded) result = `made ${difference} ${difference === 1 ? "overtrick" : "overtricks"}`;

    return result;
  }
  
  private getPlayingPlayers() {
    //return the declarer and the declarer's partner as an array of strings
    if (!this.seating) throw new Error('Problem with this.seating in deal-detail');
    const declarersDirection = getDirectionFromSeating(this.seating, this.declarer);
    const declarersPartner = getPartnerFromDirection(this.seating, declarersDirection as CardinalDirection);
    return [this.declarer, declarersPartner];
  }

  private getMadeItString() {
    const options = [
      'JUST made it',
      'BARELY made it',
      'almost lost the contract'
    ]

    //returns a random integer from lower_bound_inclusive to upper_bound_exclusive
    const randomInt = 0 + Math.floor(Math.random() * (options.length - .00001));
    return options[randomInt];
  }

  private getHandAsTable(hands: HandsForConsumption): HTMLElement | null {
    // this.
    //todo: how to append div after another div?
    const table = this.getNewElement('div');

    //todo: need the initial column then four others
    this.renderer.appendChild(table, this.getSuitColumn());


    if (!hands) return null;
    for (let i = 0; i < hands.length; i++) {
      const hand = (hands[i])[1];
      const username = (hands[i])[0];
      const userColumnDiv = this.getNewElement('div');
      this.renderer.addClass(userColumnDiv, `${DEAL_DETAIL_CLASSNAME}__hands-column-${i + 2}`)

      const usernameDiv = this.getNewElement('div');
      this.renderer.setProperty(usernameDiv, 'innerHTML', username);
      this.renderer.appendChild(userColumnDiv, usernameDiv);

      if (hand !== null) {
        for (let j = 0; j < hand?.length; j++) {
          const suit = hand[j];
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
        const grandChildHTML = this.addQuotationsToUsernames(grandChildren, i);

        this.renderer.setProperty(newTableCell, 'innerHTML', grandChildHTML);
        this.renderer.appendChild(flatTable, newTableCell);
      }
    }

    this.renderer.addClass(flatTable, `${DEAL_DETAIL_CLASSNAME}__hands-table`);
    return flatTable;
  }

  private addQuotationsToUsernames(elements: HTMLCollection, nthChildToUse: number) {
    let result = elements[nthChildToUse].innerHTML;
    if (nthChildToUse === 0 && result !== '&nbsp;') {
      result = `'${elements[nthChildToUse].innerHTML}'`;
    }
    return result;
  }

  // getUserColumn(hand: HandForConsumption, username: string) {

  // }

  private getSuitColumn() {
    const suitColumn = this.renderer.createElement('div');
    const emptyDiv = this.getNewElement('div');
    this.renderer.setProperty(emptyDiv, 'innerHTML', '&nbsp');
    this.renderer.addClass(suitColumn, `${DEAL_DETAIL_CLASSNAME}__hands-column-1`)
    this.renderer.appendChild(suitColumn, emptyDiv);
    for (let i = 0; i < suitsHtmlEntities.length; i++) {
      const htmlEntity = suitsHtmlEntities[i];
      const suitDiv = this.getNewElement('div');
      this.renderer.setProperty(suitDiv, 'innerHTML', htmlEntity);
      this.renderer.appendChild(suitColumn, suitDiv);
    }
    return suitColumn;
  }


  private getNewElement(elementType: string) {
    return this.renderer.createElement(elementType)
  }
  

  
}
