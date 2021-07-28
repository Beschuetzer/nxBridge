import { DealRelevant } from './both-types';
import { Observable } from 'rxjs';
import { UrlTree } from "@angular/router";


export interface CanComponentDeactivate {
  canDeactivate: () => CanDeactivateOutputTypes;
}
export interface CanSkipFilters {
  all: boolean;
  afterDate: boolean;
  beforeDate: boolean;
  contract: boolean;
  dealResult: boolean;
  declarer: boolean;
  double: boolean;
  gameName: boolean;
  openingBid: boolean;
  playerHasCard: boolean;
  playerInGame: boolean;
  wonBy: boolean;
}
//#region Interfaces
export interface DateObj {
  date: Date | null;
}
export interface Deal extends DealCore {
  [key: string]: any;
  players: ObjectId[];
  redealCount: number;
  dealSummary: DealSummary;
}
export interface DealCore {
  cardPlayOrder: number[];
  hands: Hands;
  roundWinners: string[][];
  declarer: ObjectId;
  dealer: ObjectId;
  bids: Bid[];
  contract: string;
  doubleValue: number;
  northSouth?: DealScoring;
  eastWest?: DealScoring;
}
export interface DealGameIncomplete extends DealCore {
  agreeWithClaim: AgreeWithClaim;
  acceptedClaims: AcceptedClaim[];
}
export interface DealResult {
  type: DealResultType;
  amount: number;
}
export interface ErrorMessage {
  message: string;
  status: number;
}
export interface FetchedDeals {
  [key: string]: DealRelevant;
}
export interface Filters {
  [key: string]: any;
}
export interface FilterItem {
  message: string;
  error: string;
  elementsToReset: any[];
  date?: Date;
  isDateInvalid?: boolean;
  username?: string;
  card?: number;
}
export interface FilterItemDeletion {
  key: string;
  resetAction: any;
  username?: string;
  card?: number;
}
export interface FilterItems {
  [key: string]: FilterItem;
}
export interface Game {
  deals: ObjectId[];
  room: Room;
  gameRoundEndingScores: GameRoundEndingScores;
  startDate: number;
  completionDate: number;
  players: ObjectId[];
  points: Points;
}
export interface GameIncomplete {
  gameRoundEndingScores: GameRoundEndingScores;
  hasMadeBid: { northSouth: boolean; eastWest: boolean };
  hasSentIsAllowedToPlay: boolean;
  isGameOver: boolean;
  userObjs: UserObj[];
  deals: DealGameIncomplete[];
  name: string;
  startDate: number;
  usernames: string[];
  pencilInStart: null | number;
  originalSocketIds: { [key: string]: string };
  seating: Seating;
  gameState: string;
  room: Room;
  undoRequest: UndoRequest;
  roundWinSounds: { [key: string]: string };
  points: Points;
  users: { [key: string]: string };
  usersReadyToContinue: { [key: string]: boolean };
}
export interface GameRoundEndingScores {
  northSouth: number[];
  eastWest: number[];
}
export interface Room {
  name: string;
  password: string;
  users: string[];
  usersWhoMadeSeatingChoice: string[];
  usersReady: string[];
  seating: Seating;
  biddingTimerDurationValue: number | 'none';
  cardPlayTimerDurationValue: number | 'none';
  roundEndAnimationCompletion: { [key: string]: number };
  cardPlayAnimationCompletion: { [key: string]: number };
  turnStartTime: number | null;
  usernameOfCurrentPlayer: string | null;
  usernameOfCurrentBidder: string | null;
  shouldCountHonors: boolean;
  northSouthAbove: number;
  northSouthBelow: number;
  northSouthVulnerable: boolean;
  eastWestAbove: number;
  eastWestBelow: number;
  eastWestVulnerable: boolean;
  dealer: string | null;
  continueFromIncomplete: boolean;
  timesUpComplete: boolean;
}
export interface PlayerHasCard {
  [key: string]: number[];
}
export interface Preferences {
  sound: {
    isEnabled: boolean;
    defaultVolume: number;
    shotgunLoad: string;
    isYourTurnHand: string;
    isYourTurnExposed: string;
    userPlaysCard: string;
    cardPlayDuring: string;
    roundEndAnimation: string;
    roundWon: string;
    dealSummaryWon: string;
    dealSummaryLost: string;
    gameSummaryWon: string;
    gameSummaryLost: string;
  };
  cardSortPreference: string;
  suitSortPreference: string;
  trumpOnLeftHand: boolean;
  trumpOnLeftExposedHand: boolean;
  shouldAnimateThinkingForSelf: boolean;
  shouldAnimateCardPlay: boolean;
  shouldAnimateRoundEnd: boolean;
  pointCountingConvention: string;
  cardBackPreference: number;
  colorTheme: string;
  setHonorsAutomatically: boolean;
}
export interface Stats {
  totalPoints: {
    distribution: number;
    highCard: number;
  };
  maximums: {
    distribution: number;
    highCard: number;
    combined: {
      highCard: number;
      distribution: number;
    };
  };
  gamesPlayed: number;
  gamesWon: number;
  dealsPlayed: number;
  dealsPlayedAsDeclarer: number;
  dealsPlayedAsDefense: number;
  dealsWon: number;
  dealsWonAsDeclarer: number;
  dealsWonAsDefense: number;
  dealsDoubled: number;
  dealsWonDoubled: number;
  ties: number;
}
export interface TeamScoring {
  northSouth: number;
  eastWest: number;
}
export interface User {
  // _id: any;
  username: string;
  password: string;
  email: string | null;
  preferences: Preferences;
  date: Date;
  emailValidated: boolean;
  hasPaid: boolean;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  stats: Stats;
  zipCode?: number;
  hash: string | null;
  salt: string | null;
}
export interface UserIds {
  [key: string]: string;
}
export interface WonBy {
  type: WonByType;
  amount: number;
}
//#endregion


//#region Types
export type AcceptedClaim = {
  claimAmount: number;
  cardsClaimed: number[];
};
export type AgreeWithClaim = {
  claimAmount: number | null;
  isClaimingAll: boolean;
  socketIds: { [key: string]: string };
  claimingCards: number[];
  otherHandCards: number[];
  throwInCards: { [key: string]: number[] };
  claimSomeCardPlayOrder: number[];
  endInHand: null | boolean;
};
export type Bid = [string, string];
export type CanDeactivateOutputTypes = Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
export type CardinalDirection =
  | 'North'
  | 'South'
  | 'East'
  | 'West'
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'N/A';
export type CardValuesAsString =
  | 'Ace'
  | 'King'
  | 'Queen'
  | 'Jack'
  | 'Ten'
  | 'Nine'
  | 'Eight'
  | 'Seven'
  | 'Six'
  | 'Five'
  | 'Four'
  | 'Three'
  | 'Two';
export type Contract = {
  prefix: string;
  htmlEntity: string;
  doubleMultiplier: number;
};
export type DealResultType = WonByType | 'equal';
export type DealScoring = {
  [key: string]: any;
  aboveTheLine: number;
  belowTheLine: number;
  totalBelowTheLineScore: number;
  isVulnerable: boolean;
  vulnerableTransitionIndex: number;
};
export type DealSummary = {
  contractPoints: number;
  overTrickPoints: number;
  underTrickPoints: number;
  rubberBonus: number;
  honorPoints: number;
};
export type Hand = [number[], number[], number[], number[]];
export type Hands = { [key: string]: Hand };
export type HandsForConsumption = [string, Hand][] | null | undefined;
export type GameDetailDisplayPreferences = {
  sort: string;
  size: string;
  resultsPerPage: string;
};
export type ObjectId = string;
export type PlayerInGame = string[];
export type Points = { [key: string]: Point };
export type Point = {
  distributionPoints: number[];
  highCardPoints: number[];
};
export type Seating = {
  [key: string]: string;
  north: string;
  south: string;
  east: string;
  west: string;
};
export type Suit = 'Club' | 'Diamond' | 'Heart' | 'Spade' | 'No Trump';
export type Team = 'EW' | 'NS' | '';
export type TeamFull = 'eastWest' | 'northSouth';
export type UndoRequest = {
  active: boolean;
  responses: { [key: string]: boolean };
  alreadyAsked: { [key: string]: 0 | 1 };
  numberOfResponsesNeeded: number | null;
};
export type UserObj = {
  socketId: string;
  username: string;
  room: string;
  status: string;
  preferences: Preferences;
};
export type WonByType = 'less' | 'more' | '-1';
//#endregion

//#region Enums
export enum DateType {
  before,
  after,
}
export enum GameDetailSizes {
  small = 'small',
  medium = 'medium',
  large = 'large',
}
export enum ReducerNames {
  deals = 'deals',
  games = 'games',
  users = 'users',
  filters = 'filters',
  general = 'general',
}
export enum SortOptions {
  ascending = 'ascending',
  descending = 'descending',
}
export enum ToggleDealDetailButtonBehavior {
  toggle,
  open,
  close,
}
//#endregion
