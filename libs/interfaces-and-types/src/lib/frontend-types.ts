export interface Deal extends DealCore {
  //have to use JS types not TS types
  players: ObjectId[];
}

export interface DealGameIncomplete extends DealCore {
  agreeWithClaim: AgreeWithClaim;
  acceptedClaims: AcceptedClaim[];
}

export interface ErrorMessage {
  message: string;
  status: number;
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

export interface User {
  username: string;
  password: string;
  email: string;
  preferences: Preferences;
  date: Date;
  emailValidated: boolean;
  hasPaid: boolean;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  stats: Stats;
  zipCode?: number;
  hash: string;
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

export interface GameRoundEndingScores {
  northSouth: number[];
  eastWest: number[];
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

type DealCore = {
  cardPlayOrder: number[];
  hands: Hands;
  roundWinners: string[][];
  declarer: ObjectId;
  dealer: ObjectId;
  bids: Bid[];
  contract: string;
  northSouth: DealScoring;
  eastWest: DealScoring;
  redealCount: number;
  dealSummary: DealSummary;
  doubleValue: number;
};

export type UserObj = {
  socketId: string;
  username: string;
  room: string;
  status: string;
  preferences: Preferences;
};

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

export type UndoRequest = {
  active: boolean;
  responses: { [key: string]: boolean };
  alreadyAsked: { [key: string]: 0 | 1 };
  numberOfResponsesNeeded: number | null;
};

export type Seating = {
  north: string;
  south: string;
  east: string;
  west: string;
};
export type ObjectId = string;
export type Bid = [string, string];
export type Hands = { [key: string]: Hand };
export type Hand = [number[], number[], number[], number[]];
export type Points = { [key: string]: Point };
export type Point = {
  distributionPoints: number[];
  highCardPoints: number[];
};

export type DealScoring = {
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
