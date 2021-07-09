import { Deal, Game, SortOptions } from '@nx-bridge/interfaces-and-types';
import * as mongoose from 'mongoose';
import { getIsBidPlayable } from './playing/functions';

export function capitalize(str: string) {
  return str.split(" ")
    .map((word: string) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
};

export function getMongooseObjsFromStrings(items: string[]) {
  const mongooseObjs = [];
  
  for (let i = 0; i < items.length; i++) {
    const deal = items[i];
    console.log('deal =', deal);
    mongooseObjs.push(mongoose.Types.ObjectId(deal))
  }

  return mongooseObjs;
}

export function getValueFromLocalStorage(value: string) {
  return JSON.parse(localStorage.getItem(value) as string);
}

export function setValueInLocalStorage(value: string, valueToSet: any) {
  return localStorage.setItem(value,  JSON.stringify(valueToSet));
}

export function toggleClassOnList(items: HTMLElement[], classListToToggle: string) {
  let result = null;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    result = item?.classList?.toggle(classListToToggle);
  }
  return result;
}

export function toggleInnerHTML(element: HTMLElement, choices: [string, string]) {
  if (!element || !choices) return;
  if (element.innerHTML.match(choices[0])) element.innerHTML = choices[1];
  else element.innerHTML = choices[0];
}

export function getDeclarerFromDeal(deal: Deal) {
  for (let i = deal?.bids.length - 1; i >= 0 ; i--) {
    const bid = deal?.bids[i][1];
    if (getIsBidPlayable(bid)) {
      return deal?.bids[i][0];
    }
  }
  return "Error in getDeclarerFromDeal()";
}

export function getLinearPercentOfMaxMatchWithinRange(currentTrackedValue: number, minTrackedValue: number, maxTrackedValue: number, startOutputValue: number, endOutputValue: number) {
  //returns a value between a given input range that correlates to the value of variable as it changes within a different range.  If the tracked variable goes about the maxCutoff then it assumes the max value possible.  If it goes anywhere below the min value.  Any where inbetween is linearly correlated to the trackedValue.


  if (currentTrackedValue >= maxTrackedValue) return endOutputValue;
  if (currentTrackedValue <= minTrackedValue) return startOutputValue;

  var trackedValueRange = Math.abs(maxTrackedValue - minTrackedValue);
  var outputValueRange = Math.abs(endOutputValue - startOutputValue) ;
  var amountAboveMin = currentTrackedValue - minTrackedValue;
  var percentOfRange = amountAboveMin / trackedValueRange;

  if (startOutputValue <= endOutputValue) return startOutputValue + (percentOfRange * outputValueRange);
  else {
    return startOutputValue - (percentOfRange * outputValueRange);
  }
}


export const scrollToSection = (sectionToScrollTo: HTMLElement, headerHeight: number, isScrollableContainer = false) => {
  const topScrollAmount =  window.scrollY + sectionToScrollTo.getBoundingClientRect().top - headerHeight;

  if (isScrollableContainer) return topScrollAmount;

  return window.scroll({
    top: topScrollAmount,
    left: 0, 
    behavior: 'smooth' 
  });
}

export function sortDescending(games: Game[]) {
  //todo: look up which sorting algorithm to use
  games.reverse();
}

export function sortAscending(games: Game[]) {
  //todo: look up which sorting algorithm to use
  // games.reverse();
}

export function paginateGames(games: Game[], sortPreference: string, batchNumber: number, numberPerBatch: number) {
  //batchNumber starts at 0

  const batchStart = numberPerBatch * batchNumber;
  const batchEnd = batchStart + numberPerBatch;
  let toReturnGames: Game[]; 
  if (sortPreference === SortOptions.descending) toReturnGames = games.slice(batchStart, batchEnd);
  else {
    //todo: use a for loop in reverse to 'slice' games into toReturnGames 
    // for (let i = games.length; i < array.length; i++) {
    //   const element = array[i];
      
    // }
    toReturnGames = games.slice(batchStart === 0 ? -1 : -batchStart, -batchEnd);
  }
  return toReturnGames;
}
