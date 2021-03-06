import {
  CardinalDirection,
  CardValuesAsString,
  Contract,
  Hand,
  Hands,
  Seating,
  Suit,
} from '@nx-bridge/interfaces-and-types';
import {
  COLOR_RED_CLASSNAME,
  cardinalDirections,
  cardsPerSuit,
  cardValuesAsStrings,
  maxCardValue,
  minCardValue,
  suits,
  suitsAsCapitalizedStrings,
  suitsHtmlEntities,
  getHtmlEntityFromCard,
} from '@nx-bridge/constants';
import { getHtmlEntityFromContract } from '../functions';
import { NOT_AVAILABLE_STRING } from '../constants';

export function getCardStringFromNumber(cardAsNumber: number) {
  if (cardAsNumber === undefined || cardAsNumber === null) return '';
  if (cardAsNumber < minCardValue || cardAsNumber > maxCardValue)
    throw new Error(`Error converting ${cardAsNumber} to card string`);

  const cardValue = cardValuesAsStrings[cardAsNumber % cardsPerSuit];
  const index = Math.floor(cardAsNumber / cardsPerSuit);
  const suit = suitsAsCapitalizedStrings[index];
  return cardValue + ' of ' + suit;
}

export function getDefaultContract(): Contract {
 return JSON.parse(JSON.stringify({prefix: '', doubleMultiplier: 1, htmlEntity: ''}));
}

export function getSuitFromNumber(cardAsNumber: number) {
  if (cardAsNumber === null || cardAsNumber === undefined)
    throw new Error(`Error getting suit for cardAsNumber: ${cardAsNumber}.`);

  const index = Math.floor(cardAsNumber / 13);
  if (index === -1) return '';
  return suitsAsCapitalizedStrings[index]?.toLowerCase();
}

export function getCharacterFromCardAsNumber(
  cardAsNumber: number,
  getLetterForTen = false
) {
  switch (cardAsNumber % 13) {
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
      if (getLetterForTen) return 'T';
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

export function getCharValueFromCardValueString(
  str: CardValuesAsString | 'One',
  getLetterForTen = false
) {
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
      if (getLetterForTen) return 'T';
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
    case 'One':
      return '1';
    default:
      return '';
  }
}

export function getHtmlEntityFromSuitOrCardAsNumber(
  value: Suit | number
): string {
  if (typeof value === 'number') {
    const suitAsString = getSuitFromNumber(value);
    if (!suitAsString) return '';

    const htmlEntityToUse =
      suitsHtmlEntities[
        suitsAsCapitalizedStrings.findIndex(
          (str) => str.toLowerCase() === suitAsString.toLowerCase()
        )
      ];

    return htmlEntityToUse ? htmlEntityToUse : '';
  }

  const index = suitsAsCapitalizedStrings.findIndex((s) => {
    return s.slice(0, s.length - 1).toLowerCase() === value.toLowerCase();
  });
  return index !== -1 ? suitsHtmlEntities[index] : 'NT';
}

export function getHtmlEntitySpan(numberOrContract: number | string, isContract = false) {
  let colorToUse = 'color-white';
  let htmlEntity = '';
  
  if (isContract) htmlEntity = getHtmlEntityFromContract(numberOrContract as string);
  else htmlEntity = getHtmlEntityFromCard(numberOrContract);

  if (htmlEntity.match(/diam|heart/i))
    colorToUse = `${COLOR_RED_CLASSNAME}-light`;
  
  return `<span class="${colorToUse}">${htmlEntity}</span>`;
}

export function getIsBidPlayable(bid: string) {
  if (!bid.match(/double/i) && !bid.match(/pass/i)) return true;
  return false;
}

export function getDirectionFromSeating(seating: Seating, username: string) {
  if (username === NOT_AVAILABLE_STRING) return NOT_AVAILABLE_STRING;
  for (const direction in seating) {
    if (Object.prototype.hasOwnProperty.call(seating, direction)) {
      const usernameInSeating = seating[direction];
      if (username === usernameInSeating) return direction;
    }
  }
  throw new Error('Invalid username or seating in getDirectionFromSeating()');
}

export function getPartnerFromDirection(
  seating: Seating,
  direction: CardinalDirection
) {
  if (direction === NOT_AVAILABLE_STRING) return NOT_AVAILABLE_STRING;

  if (direction.toLowerCase() === cardinalDirections[0].toLowerCase())
    return seating.south;
  else if (direction.toLowerCase() === cardinalDirections[1].toLowerCase())
    return seating.west;
  else if (direction.toLowerCase() === cardinalDirections[2].toLowerCase())
    return seating.north;
  else if (direction.toLowerCase() === cardinalDirections[3].toLowerCase())
    return seating.east;
  throw new Error('Invalid direction or seating in getPartnerFromDirection()');
}

export function getSuitAsStringFromArray(suit: number[]): string | null {
  if (suit && suit.length > 0) {
    const cardsAsChar = [];

    for (let i = 0; i < suit.length; i++) {
      const cardAsNumber = suit[i];
      cardsAsChar.push(
        getCharacterFromCardAsNumber(cardAsNumber % cardsPerSuit, true)
      );
    }

    return cardsAsChar.join(',');
  }
  return null;
}

export function sortHand(hand: Hand) {
  //Sorts the hand clubs, diams, hearts, then spades (for displaying in replays)
  let clubs: number[] = [],
    diamonds: number[] = [],
    hearts: number[] = [],
    spades: number[] = [];
  for (let i = 0; i < hand.length; i++) {
    const suit = hand[i];
    const suitAsString = getSuitFromNumber(
      suit && suit.length > 0 ? suit[0] : -1
    );

    if (suitAsString === suits.clubs) clubs = suit;
    else if (suitAsString === suits.diamonds) diamonds = suit;
    else if (suitAsString === suits.hearts) hearts = suit;
    else if (suitAsString === suits.spades) spades = suit;
  }

  return [clubs, diamonds, hearts, spades];
}

export function flatten(array: any, depth = 1) {
  return depth > 0
    ? array.reduce(
        (acc: [], val: any) =>
          acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val),
        []
      )
    : array.slice();
}

export function getUserWhoPlayedCard(hands: Hands, card: number) {
  for (const username in hands) {
    if (Object.prototype.hasOwnProperty.call(hands, username)) {
      const hand = hands[username];
      const flatHand = flatten(hand);
      if (flatHand?.includes(card)) {
        return username;
      }
    }
  }
  return '';
}

export function createHandArrayFromFlatArray(flatArray: number[]) {
  const spades = [],
    hearts = [],
    diamonds = [],
    clubs = [];
  for (let i = 0; i < flatArray.length; i++) {
    const cardAsNumber = flatArray[i];
    if (cardAsNumber >= 0 && cardAsNumber <= 12) clubs.push(cardAsNumber);
    else if (cardAsNumber >= 13 && cardAsNumber <= 25)
      diamonds.push(cardAsNumber);
    else if (cardAsNumber >= 26 && cardAsNumber <= 38)
      hearts.push(cardAsNumber);
    else if (cardAsNumber >= 39 && cardAsNumber <= 51)
      spades.push(cardAsNumber);
  }
  return [spades, hearts, clubs, diamonds];
}
