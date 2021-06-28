import { Team } from "@nx-bridge/interfaces-and-types";

export const cardsPerSuit = 13;
export const minCardValue = 0;
export const maxCardValue = 51;
export const cardinalDirections = ['north', 'east', 'south', 'west'];
export const locations = ['top', 'right', 'bottom', 'left'];
export const suits = {
  clubs: "clubs",
  diamonds: "diamonds",
  hearts: "hearts",
  spades: "spades",
  noTrump: null,
};

export const suitsHtmlEntities = ["&clubs;", "&diams;", "&hearts;", "&spades;"];
export const suitsAsCapitalizedStrings = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
export const cardValuesAsStrings = [
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Jack',
  'Queen',
  'King',
  'Ace',
];
export const teams: Team[] = ['NS', 'EW'];