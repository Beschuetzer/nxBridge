import { Team, TeamFull } from '@nx-bridge/interfaces-and-types';

export const cardsPerDeck = 52;
export const cardsPerSuit = 13;
export const cardsPerHand = 13;
export const minCardValue = 0;
export const maxCardValue = 51;
export const tricksInABook = 6;
export const cardinalDirections = ['north', 'east', 'south', 'west'];
export const locations = ['top', 'right', 'bottom', 'left'];
export const suits = {
  clubs: 'clubs',
  diamonds: 'diamonds',
  hearts: 'hearts',
  spades: 'spades',
  noTrump: null,
};
export const sortOrders = {
  Ascending: 'Ascending',
  Descending: 'Descending',
  AscendingAlternatingColors: 'AscendingAlternatingColors',
  DescendingAlternatingColors: 'DescendingAlternatingColors',
};

export const suitsHtmlEntities = ['&clubs;', '&diams;', '&hearts;', '&spades;'];
export const suitsAsCapitalizedStrings = [
  'Clubs',
  'Diamonds',
  'Hearts',
  'Spades',
];
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
export const contracts = [
  'One Club',
  'One Diamond',
  'One Heart',
  'One Spade',
  'One No Trump',
  'Two Club',
  'Two Diamond',
  'Two Heart',
  'Two Spade',
  'Two No Trump',
  'Three Club',
  'Three Diamond',
  'Three Heart',
  'Three Spade',
  'Three No Trump',
  'Four Club',
  'Four Diamond',
  'Four Heart',
  'Four Spade',
  'Four No Trump',
  'Five Club',
  'Five Diamond',
  'Five Heart',
  'Five Spade',
  'Five No Trump',
  'Six Club',
  'Six Diamond',
  'Six Heart',
  'Six Spade',
  'Six No Trump',
  'Seven Club',
  'Seven Diamond',
  'Seven Heart',
  'Seven Spade',
  'Seven No Trump',
];

export const teams: [Team, Team] = ['NS', 'EW'];
export const teamsFull: [TeamFull, TeamFull] = ['northSouth', 'eastWest'];
