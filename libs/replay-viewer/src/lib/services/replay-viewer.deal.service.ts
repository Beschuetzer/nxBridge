import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ANIMATION_DURATION, cardinalDirections, DEAL_DETAIL_BUTTON_BORDER_BOTTOM_CLASSNAME, gameDetailBorderClosed, gameDetailBorderCssPropName, gameDetailBorderOpen, getAmountMadeAndNeededFromDeal, getCharValueFromCardValueString, getDirectionFromSeating, getPartnerFromDirection, NOT_AVAILABLE_STRING, teams, teamsFull } from '@nx-bridge/constants';
import { CardinalDirection, CardValuesAsString, Deal, DealRelevant, FetchedDeals, ReducerNames, Seating, Team, ToggleDealDetailButtonBehavior } from '@nx-bridge/interfaces-and-types';
import { AppState, reducerDefaultValue } from '@nx-bridge/store';
import {take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReplayViewerDealService {

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private store: Store<AppState>,
  ) {}

  // addQuotationsToUsernames(
  //   elements: HTMLCollection,
  //   nthChildToUse: number
  // ) {
  //   let result = elements[nthChildToUse].innerHTML;
  //   if (nthChildToUse === 0 && result !== '&nbsp;') {
  //     result = `'${elements[nthChildToUse].innerHTML}'`;
  //   }
  //   return result;
  // }

  getDealCountMessage(deals: DealRelevant[], seating: Seating) {
    let winningTeam: Team;
    const afterWinners = ' won ';
    const betweenPlayed = ' deals to ';
    let nsDealsWon = 0;
    let ewDealsWon = 0;
    let winner: Team | null;

    for (let i = 0; i < deals.length; i++) {
      const deal = deals[i];
      if (!deal) continue;
      let nextDeal = null;
      if (i !== deals.length - 1) {
        nextDeal = deals[i + 1];
        winner = this.getDealWinnerFromScoreDifference(deal, nextDeal, seating, i);
      } else {
        winner = this.getDealWinnerFromPureCalculation(deal, seating);
      }

      if (winner === teams[0]) nsDealsWon++;
      else if (winner === teams[1]) ewDealsWon++;
    }

    if (nsDealsWon === ewDealsWon) {
      return `No winners here just players (tied)!`;
    } else {
      if (nsDealsWon > ewDealsWon) winningTeam = teams[0];
      else winningTeam = teams[1];

      let larger = nsDealsWon;
      let smaller = ewDealsWon;
      if (ewDealsWon > nsDealsWon) {
        larger = ewDealsWon;
        smaller = nsDealsWon;
      }

      return `${winningTeam}${afterWinners}${larger}${betweenPlayed}${smaller}`;
    }
  }

  getDealFromStore(dealId: string) {
    let deal: DealRelevant = {} as DealRelevant;
    this.store.select(ReducerNames.deals).pipe(take(1)).subscribe(dealState => {
      deal = dealState.fetchedDeals[dealId];
    })

    return deal;
  }

  getDealsToGet(dealsAsStrings: string[]) {
    if (!dealsAsStrings) return [];

    let fetchedDeals: FetchedDeals = {};
    const dealsToReturn: DealRelevant[] = [];

    this.store
      .select(ReducerNames.deals)
      .pipe(take(1))
      .subscribe((dealState) => {
        fetchedDeals = dealState.fetchedDeals;
      });

    for (let i = 0; i < dealsAsStrings.length; i++) {
      const dealAsString = dealsAsStrings[i];
      dealsToReturn.push(fetchedDeals[dealAsString]);
    }

    return dealsToReturn;
  }

  getDeclarerFromDeal(deal: DealRelevant) {
    if (!deal) return NOT_AVAILABLE_STRING;
    
    const declarer = deal.bids[deal.bids.length - 4][0];
    const declarersBid = deal.bids[deal.bids.length - 4][1];
    return declarersBid.match(/pass/i) ? NOT_AVAILABLE_STRING : declarer;
  }

  getDeclarerFromStore(userId: string) {
    if (!userId) return NOT_AVAILABLE_STRING;

    let declarer = '';
    this.store.select(ReducerNames.users).pipe(take(1)).subscribe(userState => {
      declarer = userState.userIds[userId];
    })

    return declarer ? declarer : NOT_AVAILABLE_STRING;
  }
  
  getDealWinnerFromScoreDifference(
    deal: DealRelevant,
    dealAfterDeal: DealRelevant,
    seating: Seating,
    nthDeal?: number
  ): Team | null {

    if (!deal.declarer) return null;

    const dealNorthSouth = deal[teamsFull[0]];
    const dealAfterDealNorthSouth = dealAfterDeal[teamsFull[0]];
    const dealEastWest = deal[teamsFull[1]];
    const dealAfterDealEastWest = dealAfterDeal[teamsFull[1]];

    if (
      dealNorthSouth === undefined ||
      dealAfterDealNorthSouth === undefined ||
      dealEastWest === undefined ||
      dealAfterDealEastWest === undefined ||
      (dealNorthSouth?.aboveTheLine !== dealAfterDealNorthSouth?.aboveTheLine &&
      dealEastWest?.aboveTheLine !== dealAfterDealEastWest?.aboveTheLine)
    ) {
      return this.getDealWinnerFromPureCalculation(deal, seating);
    }

    const keysToCompare = [
      'aboveTheLine',
      'belowTheLine',
      'totalBelowTheLineScore',
    ];
    for (const key of keysToCompare) {
      if (
        !dealNorthSouth ||
        !dealAfterDealNorthSouth ||
        !dealEastWest ||
        !dealAfterDealEastWest
      )
        return '';
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
        return teams[0];
      } else if (nsValue === nsAfterValue && ewValue !== ewAfterValue) {
        return teams[1];
      }
    }

    return this.getDealWinnerFromPureCalculation(deal, seating);
  }

  getDealWinnerFromPureCalculation(deal: DealRelevant, seating: Seating): Team {
    const declarer = this.getDeclarerFromDeal(deal);
    const declarersDirection = getDirectionFromSeating(
      seating as Seating,
      declarer
    );
    const declarersPartner = getPartnerFromDirection(
      seating as Seating,
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

  getIsGameAlreadyOpen() {
    let isGameAlreadyOpen = false;
    this.store
      .select(ReducerNames.games)
      .pipe(take(1))
      .subscribe((gamesState) => {
        isGameAlreadyOpen = gamesState.isViewingGame;
      });
    return isGameAlreadyOpen;
  }

  getMadeAmountString(deal: DealRelevant, contractPrefix: number, seating: Seating, declarer: string): [string, number] {
    const { amountMade, amountNeeded } = getAmountMadeAndNeededFromDeal(deal as DealRelevant, contractPrefix, seating as Seating, declarer);

    if (amountMade === reducerDefaultValue || typeof amountNeeded !== 'number') return [NOT_AVAILABLE_STRING, 0];
    const difference = Math.abs(amountMade - amountNeeded);

    let result = this.getMadeItString();
    if (amountMade < amountNeeded) result = `went down ${difference}`;
    else if (amountMade > amountNeeded)
      result = `made ${difference} ${
        difference === 1 ? 'overtrick' : 'overtricks'
      }`;

    return [result, difference];
  }

  getMadeItString() {
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

  setGameDetailBorderToBlack() {
    setTimeout(() => {
      const newValue = `${gameDetailBorderCssPropName}: ${gameDetailBorderOpen}`;
      document.documentElement.style.cssText += newValue;
    }, ANIMATION_DURATION)
  }

  setGameDetailBorderToNormal() {
    const newValue = `${gameDetailBorderCssPropName}: ${gameDetailBorderClosed}`;
    document.documentElement.style.cssText += newValue;
  }

  toggleButtonBottomBorder(buttons: HTMLElement[], behaviour = ToggleDealDetailButtonBehavior.toggle) {
    if (!buttons) return;
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];

      if (behaviour === ToggleDealDetailButtonBehavior.toggle) button.classList.toggle(DEAL_DETAIL_BUTTON_BORDER_BOTTOM_CLASSNAME);

      else if (behaviour === ToggleDealDetailButtonBehavior.open) button.classList.remove(DEAL_DETAIL_BUTTON_BORDER_BOTTOM_CLASSNAME);

      else if (behaviour === ToggleDealDetailButtonBehavior.close) button.classList.add(DEAL_DETAIL_BUTTON_BORDER_BOTTOM_CLASSNAME);

    }
  }
}