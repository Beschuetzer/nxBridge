import { DateObj, Deal, Game, SortOptions } from '@nx-bridge/interfaces-and-types';
import * as mongoose from 'mongoose';
import { getIsBidPlayable } from './playing/functions';
import { MATCHED_DEAL_CLASSNAME } from '@nx-bridge/constants';

export function capitalize(str: string) {
  return str
    .split(' ')
    .map((word: string) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function getMongooseObjsFromStrings(items: string[]) {
  const mongooseObjs = [];

  for (let i = 0; i < items.length; i++) {
    const deal = items[i];
    console.log('deal =', deal);
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

export function getDeclarerFromDeal(deal: Deal) {
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

export function sortDescending(games: Game[]) {
  //todo: look up which sorting algorithm to use
  games.reverse();
}

export function sortAscending(games: Game[]) {
  //todo: look up which sorting algorithm to use
  // games.reverse();
}

export function paginateGames(
  games: Game[],
  sortPreference: string,
  batchNumber: number,
  numberPerBatch: number
) {
  //note: batchNumber starts at 0
  if (!games || games.length <= 0) return [];
  const batchStart = numberPerBatch * batchNumber;
  const batchEnd = batchStart + numberPerBatch;
  let toReturnGames: Game[] = [];
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
      const newMinResult =  i * newResultsPerPage;
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
  if (!filterName?.date) return 'N/A';
  const date = filterName.date.toLocaleDateString();
  const shortDate =
    date.substr(0, date.length - 4) +
    date.substr(date.length - 2, date.length);
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