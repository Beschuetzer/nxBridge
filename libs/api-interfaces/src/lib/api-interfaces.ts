export interface Message {
  message: string;
}

export type UserId = string;

export interface ErrorMessage {
  message: string, 
  status: number,
}

export interface Preferences
{
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
    },
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
  },
  maximums: {
      distribution: number;
      highCard: number;
      combined: {
          highCard: number;
          distribution: number;
      }
  },
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
    resetPasswordToken: string,
    resetPasswordExpires: Date,
    stats: Stats;
}

export type Seating = {north: string, south: string, east: string, west: string};

export interface Room {
  name: string;
  password: string;
  users: string[],
  usersWhoMadeSeatingChoice: string[],
  usersReady: string[], 
  seating: Seating;
  biddingTimerDurationValue: number,
  cardPlayTimerDurationValue: number,
  roundEndAnimationCompletion: {[key: string]: number},
  cardPlayAnimationCompletion: {[key: string]: number},
  turnStartTime: number,
  usernameOfCurrentPlayer: string,
  usernameOfCurrentBidder: string,
  shouldCountHonors: boolean,
  northSouthAbove: number,
  northSouthBelow: number,
  northSouthVulnerable: boolean,
  eastWestAbove: number,
  eastWestBelow: number,
  eastWestVulnerable: boolean,
  dealer: string,
  continueFromIncomplete: boolean,
}

export interface Game {
  deals: string[];
  room: Room,
  gameRoundEndingScores: {   
      northSouth: [],
      eastWest: [],
  },
  startDate: Date;
  completionDate: Date;
  players: UserId[];
  points: Points,
}

export interface Points {
  // aboveTheLine: number,
  //TODO: Login to MongoDB atlas and verify these interfaces
}

export type Bid = [string, string];

export interface Deal {  //have to use JS types not TS types
  players: UserId[];
  cardPlayOrder: number[];
  hands: ...//TODO: Finish this;
  roundWinners: string[];
  declarer: string,
  dealer: string,
  bids: Bid[],
  contract: string;
  northSouth: {
      aboveTheLine: number;
      belowTheLine: number;
      totalBelowTheLineScore: number;
      isVulnerable: boolean;
      vulnerableTransitionIndex: number;
  },
  eastWest: {
      aboveTheLine: number;
      belowTheLine: number;
      totalBelowTheLineScore: number;
      isVulnerable: boolean;
      vulnerableTransitionIndex: number;
  },
  redealCount: number;
  dealSummary: {
      contractPoints: number;
      overTrickPoints: number;
      underTrickPoints: number;
      rubberBonus: number;
      honorPoints: number;
  },
  doubleValue: number;
}