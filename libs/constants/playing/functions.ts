import { CardValuesAsString, Suits } from '@nx-bridge/interfaces-and-types';
import { debug } from 'node:console';
import {
  cardsPerSuit,
  cardValuesAsStrings,
  maxCardValue,
  minCardValue,
  suits,
  suitsAsCapitalizedStrings,
  suitsHtmlEntities,
} from './constants';

export function getCardStringFromNumber(cardAsNumber: number) {
  if (cardAsNumber === undefined || cardAsNumber === null) return '';
  if (cardAsNumber < minCardValue || cardAsNumber > maxCardValue)
    throw new Error(`Error converting ${cardAsNumber} to card string`);

  const cardValue = cardValuesAsStrings[cardAsNumber % cardsPerSuit];
  const index = Math.floor(cardAsNumber / cardsPerSuit);
  const suit = suitsAsCapitalizedStrings[index];
  return cardValue + ' of ' + suit;
}

export function getSuitFromNumber(cardAsNumber: number) {
  if (cardAsNumber === null || cardAsNumber === undefined)
    throw new Error(`Error getting suit for cardAsNumber: ${cardAsNumber}.`);

  const index = Math.floor(cardAsNumber / 13);
  return suitsAsCapitalizedStrings[index].toLowerCase();
}

export function getCharacterFromCardAsNumber(cardAsNumber: number) {
  switch (cardAsNumber) {
    case 0:
      return '2';
    case 1:
      return '3';
    case 2:
      return '4';
    case 3:
      return '5';
    case 4:
      return '6';
    case 5:
      return '7';
    case 6:
      return '8';
    case 7:
      return '9';
    case 8:
      return '10';
    case 9:
      return 'J';
    case 10:
      return 'Q';
    case 11:
      return 'K';
    case 12:
      return 'A';
    default:
      return '';
  }
}

export function getCharValueFromCardValueString(str: CardValuesAsString) {
  switch (str) {
    case 'Ace':
      return 'A';
    case 'King':
      return 'K';
    case 'Queen':
      return 'Q';
    case 'Jack':
      return 'J';
    case 'Ten':
      return '10';
    case 'Nine':
      return '9';
    case 'Eight':
      return '8';
    case 'Seven':
      return '7';
    case 'Six':
      return '6';
    case 'Five':
      return '5';
    case 'Four':
      return '4';
    case 'Three':
      return '3';
    case 'Two':
      return '2';
    default:
      return '';
  }
}

export function getHtmlEntityFromSuitOrCardAsNumber(value: Suits | number) {
  if (typeof value === 'number') {
    const suitAsString = getSuitFromNumber(value);
    const htmlEntityToUse = suitsHtmlEntities[suitsAsCapitalizedStrings.findIndex(str => str.toLowerCase() === suitAsString.toLowerCase())];

    return htmlEntityToUse ? htmlEntityToUse : "NT";
  } 

  const index = suitsAsCapitalizedStrings.findIndex(s => {
    return s.slice(0, s.length - 1).toLowerCase() === value.toLowerCase()
  })
  return index !== -1 ? suitsHtmlEntities[index] : "NT"

}

export function getIsBidPlayable(bid: string) {
  if (!bid.match(/double/i) && !bid.match(/pass/i)) return true;
  return false;
}
