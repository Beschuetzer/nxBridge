import { reducerDefaultValue } from '@nx-bridge/store';
import {
  CardinalDirection,
  CardValuesAsString,
  DateObj,
  DealRelevant,
  GameRelevant,
  ReducerNames,
  Seating,
  SortOptions,
} from '@nx-bridge/interfaces-and-types';
import * as mongoose from 'mongoose';
import {
  getCharacterFromCardAsNumber,
  getCharValueFromCardValueString,
  getDirectionFromSeating,
  getHtmlEntityFromSuitOrCardAsNumber,
  getHtmlEntitySpan,
  getIsBidPlayable,
  getPartnerFromDirection,
} from './playing/functions';
import { MATCHED_DEAL_CLASSNAME } from '@nx-bridge/constants';
import { NOT_AVAILABLE_STRING } from './constants';
import {
  suitsAsCapitalizedStrings,
  suitsHtmlEntities,
  tricksInABook,
} from './playing/constants';

export function capitalize(str: string) {
  return str
    .split(' ')
    .map((word: string) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function getMongooseObjsFromRequestedDeals(requestedDeals: string[]) {
  const mongooseObjs = [];

  for (let i = 0; i < requestedDeals.length; i++) {
    const deal = requestedDeals[i];
    mongooseObjs.push(mongoose.Types.ObjectId(deal));
  }

  return mongooseObjs;
}

export function getValueFromLocalStorage(value: string) {
  return JSON.parse(localStorage.getItem(value) as string);
}

export function setValueInLocalStorage(value: string, valueToSet: any) {
  return localStorage.setItem(value, JSON.stringify(valueToSet));
}

export function toggleClassOnList(
  items: HTMLElement[],
  classListToToggle: string
) {
  let result = null;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    result = item?.classList?.toggle(classListToToggle);
  }
  return result;
}

export function toggleInnerHTML(
  element: HTMLElement,
  choices: [string, string]
) {
  if (!element || !choices) return;
  if (element.innerHTML.match(choices[0])) element.innerHTML = choices[1];
  else element.innerHTML = choices[0];
}

export function getDeclarerFromDeal(deal: DealRelevant) {
  if (!deal.declarer) return NOT_AVAILABLE_STRING;
  for (let i = deal?.bids.length - 1; i >= 0; i--) {
    const bid = deal?.bids[i][1];
    if (getIsBidPlayable(bid)) {
      return deal?.bids[i][0];
    }
  }
  return 'Error in getDeclarerFromDeal()';
}

export function getLinearPercentOfMaxMatchWithinRange(
  currentTrackedValue: number,
  minTrackedValue: number,
  maxTrackedValue: number,
  startOutputValue: number,
  endOutputValue: number
) {
  //returns a value between a given input range that correlates to the value of variable as it changes within a different range.  If the tracked variable goes about the maxCutoff then it assumes the max value possible.  If it goes anywhere below the min value.  Any where inbetween is linearly correlated to the trackedValue.

  if (currentTrackedValue >= maxTrackedValue) return endOutputValue;
  if (currentTrackedValue <= minTrackedValue) return startOutputValue;

  var trackedValueRange = Math.abs(maxTrackedValue - minTrackedValue);
  var outputValueRange = Math.abs(endOutputValue - startOutputValue);
  var amountAboveMin = currentTrackedValue - minTrackedValue;
  var percentOfRange = amountAboveMin / trackedValueRange;

  if (startOutputValue <= endOutputValue)
    return startOutputValue + percentOfRange * outputValueRange;
  else {
    return startOutputValue - percentOfRange * outputValueRange;
  }
}

export const scrollToSection = (
  sectionToScrollTo: HTMLElement,
  headerHeight: number,
  isScrollableContainer = false
) => {
  const topScrollAmount =
    window.scrollY +
    sectionToScrollTo.getBoundingClientRect().top -
    headerHeight;

  if (isScrollableContainer) return topScrollAmount;

  return window.scroll({
    top: topScrollAmount,
    left: 0,
    behavior: 'smooth',
  });
};

export function sortDescending(games: GameRelevant[]) {
  //todo: look up which sorting algorithm to use
  games.reverse();
}

export function sortAscending(games: GameRelevant[]) {
  //todo: look up which sorting algorithm to use
  // games.reverse();
}

export function paginateGames(
  games: GameRelevant[],
  sortPreference: string,
  batchNumber: number,
  numberPerBatch: number
) {
  //note: batchNumber starts at 0
  if (!games || games.length <= 0) return [];
  const batchStart = numberPerBatch * batchNumber;
  const batchEnd = batchStart + numberPerBatch;
  let toReturnGames: GameRelevant[] = [];
  if (sortPreference === SortOptions.descending)
    toReturnGames = games.slice(batchStart, batchEnd);
  else {
    for (let i = 0; i < games.length; i++) {
      const game = games[games.length - 1 - i];
      if (i >= batchStart && i < batchEnd) toReturnGames.push(game);
    }
  }
  return toReturnGames;
}

export function getNewTotalNumberOfPages(
  resultsPerPage: number,
  totalGames: number
) {
  return Math.ceil(totalGames / resultsPerPage);
}

export function getNewBatchNumber(
  currentBatchNumber: number,
  currentResultsPerPage: number,
  newResultsPerPage: number,
  totalGames: number
) {
  const maxNumberOfIterations = Math.ceil(totalGames / newResultsPerPage);
  const currentMinResult = currentBatchNumber * currentResultsPerPage;
  const currentMaxResult = currentMinResult + (currentResultsPerPage - 1);

  if (newResultsPerPage === currentResultsPerPage) return currentBatchNumber;
  // if (newResultsPerPage > currentResultsPerPage) {
  //when going up in resultsPerPage
  for (let i = 0; i < maxNumberOfIterations; i++) {
    const newMinResult = i * newResultsPerPage;
    const newMaxResult = newMinResult + (newResultsPerPage - 1);

    if (currentMinResult >= newMinResult && currentMinResult <= newMaxResult) {
      return i;
    }
  }

  return 0;
  // } else if (newResultsPerPage < currentResultsPerPage) {
  //when going down in resultsPerPage

  // }
}

export function getDateAndTimeString(filterName: DateObj, filterMsg: string) {
  if (!filterName?.date) return NOT_AVAILABLE_STRING;
  const date = filterName.date.toLocaleDateString();
  const shortDate =
    date.substr(0, date.length - 4) + date.substr(date.length - 2, date.length);
  const time = filterName.date.toLocaleTimeString();
  const shortTime = time.replace(/(:\d{2}) .*$/i, '');
  const amOrPm = time.substr(-2, 2);
  return `${filterMsg}${shortTime}${amOrPm} on ${shortDate}`;
}

export function resetMatchedDeals() {
  const matched = document.querySelectorAll(`.${MATCHED_DEAL_CLASSNAME}`);
  for (let i = 0; i < matched.length; i++) {
    const match = matched[i];
    match.classList.remove(MATCHED_DEAL_CLASSNAME);
  }
}

export function getHtmlEntityFromCard(card: number | string) {
  const number = +card;
  if (isNaN(number)) return `${card}`;
  const htmlEntity = getHtmlEntityFromSuitOrCardAsNumber(number);
  const char = getCharacterFromCardAsNumber(number, true);
  return `${char}${htmlEntity}`;
}

export function getHtmlEntityFromContract(contract: string) {
  const clubString = suitsAsCapitalizedStrings[0].substr(
    0,
    suitsAsCapitalizedStrings[0].length - 1
  );
  const diamondString = suitsAsCapitalizedStrings[1].substr(
    0,
    suitsAsCapitalizedStrings[1].length - 1
  );
  const heartString = suitsAsCapitalizedStrings[2].substr(
    0,
    suitsAsCapitalizedStrings[2].length - 1
  );
  const spadeString = suitsAsCapitalizedStrings[3].substr(
    0,
    suitsAsCapitalizedStrings[3].length - 1
  );

  if (contract.match(new RegExp(clubString, 'i'))) return suitsHtmlEntities[0];

  if (contract.match(new RegExp(diamondString, 'i')))
    return suitsHtmlEntities[1];

  if (contract.match(new RegExp(heartString, 'i'))) return suitsHtmlEntities[2];

  if (contract.match(new RegExp(spadeString, 'i'))) return suitsHtmlEntities[3];
  else return 'NT';
}

export function getContractAsHtmlEntityString(contract: string) {
  const split = contract.split(' ');
  const number = +getCharValueFromCardValueString(
    split[0] as CardValuesAsString
  );
  const htmlEntitySpan = getHtmlEntitySpan(split[1], true);
  return `${number}${htmlEntitySpan}`;
}

export function getPlayingPlayers(
  seating: Seating,
  declarer: string
): [string, string] {
  //return the declarer and the declarer's partner as an array of strings
  if (!seating) throw new Error('Problem with seating in deal-detail');
  try {
    const declarersDirection = getDirectionFromSeating(seating, declarer);
    const declarersPartner = getPartnerFromDirection(
      seating,
      declarersDirection as CardinalDirection
    );
    return [declarer, declarersPartner];
  } catch (err) {
    console.log('err =', err);
    return ['', ''];
  }
}

export function getAmountMadeAndNeededFromDeal(
  deal: DealRelevant,
  contractPrefix: number,
  seating: Seating,
  declarer: string
) {
  const error = {
    amountNeeded: NOT_AVAILABLE_STRING,
    amountMade: reducerDefaultValue,
  };

  if (!deal.contract || !deal.declarer) return error;

  const playingPlayers: [string, string] = getPlayingPlayers(
    seating as Seating,
    declarer
  );
  
  if (!playingPlayers[0]) return error;

  const amountNeeded = contractPrefix + tricksInABook;
  const amountMade = deal?.roundWinners.reduce((count, roundWinner) => {
    if (playingPlayers.includes(roundWinner[0])) return count + 1;
    return count;
  }, 0);

  return { amountNeeded, amountMade };
}

export function checkForParentOfType(
	clickedElement: HTMLElement,
	parentType: string,
	classPresent = "",
): boolean {
	try {
		if (
			clickedElement &&
			clickedElement.parentNode &&
			(clickedElement.parentNode as HTMLElement).localName === parentType &&
			(clickedElement.parentNode as HTMLElement).className.search(
				classPresent,
			) !== -1
		)
			return true;

		if ((clickedElement.parentNode as HTMLElement).localName.search(/html/i) !== -1) return false;

		const parent = clickedElement.parentNode as HTMLElement;
		return checkForParentOfType(parent, parentType, classPresent);
	} catch (error) {
		return false;
	}
}