import * as mongoose from 'mongoose';

import { Game, User, Deal } from '@nx-bridge/interfaces-and-types';

export const DealSchema = new mongoose.Schema({
    players: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    ],
    cardPlayOrder: [
        {type: Array, default: []},
    ],
    hands: {},
    roundWinners: [
        {type: Array, default: []},
    ],
    declarer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    dealer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    bids: [
        {type: Array, default: []},
    ],
    contract: {type: String, default: ""},
    northSouth: {
        aboveTheLine: {type: Number, default: 0},
        belowTheLine: {type: Number, default: 0},
        totalBelowTheLineScore: {type: Number, default: 0},
        isVulnerable: {type: Boolean, default: false},
        vulnerableTransitionIndex: {type: Number, default: null},
    },
    eastWest: {
        aboveTheLine: {type: Number, default: 0},
        belowTheLine: {type: Number, default: 0},
        totalBelowTheLineScore: {type: Number, default: 0},
        isVulnerable: {type: Boolean, default: false},
        vulnerableTransitionIndex: {type: Number, default: null},
    },
    redealCount: {type: Number, default: 0},
    dealSummary: {
        contractPoints: {type: Number, default: 0},
        overTrickPoints: {type: Number, default: 0},
        underTrickPoints: {type: Number, default: 0},
        rubberBonus: {type: Number, default: 0},
        honorPoints: {type: Number, default: null},
    },
    doubleValue: {type: Number, default: null},
});

export const GameSchema = new mongoose.Schema({
  deals: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Deal",
      },
  ],
  room: {},
  //winner is the team whose last item is >= 100 in gameRoundEndingScores
  gameRoundEndingScores: {   
      northSouth: [],
      eastWest: [],
  },
  startDate: {type: Number, default: Date.now()},
  completionDate: {type: Number, default: Date.now()},
  players: [
      {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  ],
  points: {},
});

export const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, unique: false, required: false},
    email: {type: String, unique: true, required: true},
    // zipCode: {type: Number, unique: false, required: false},
    preferences: {
        sound: {
            isEnabled: {type: Boolean, default: false},
            defaultVolume: {type: Number, default: .15},
            shotgunLoad: {type: String, default: 'shotgunLoad'},
            isYourTurnHand: {type: String, default: 'gongFull'},
            isYourTurnExposed: {type: String, default: 'beepFourTimes'},
            userPlaysCard: {type: String, default: 'plop1'},
            cardPlayDuring: {type: String, default: 'boomerang'},
            roundEndAnimation: {type: String, default: 'none'},
            roundWon: {type: String, default: 'laugh1'},
            dealSummaryWon: {type: String, default: 'none'},
            dealSummaryLost: {type: String, default: 'none'},
            gameSummaryWon: {type: String, default: 'none'},
            gameSummaryLost: {type: String, default: 'none'},
            // roundLost: {type: String, default: 'roundLost'},
        },
        cardSortPreference: {type: String, default: "Descending"},
        suitSortPreference: {type: String, default: "Descending"},
        trumpOnLeftHand: {type: Boolean, default: true},
        trumpOnLeftExposedHand: {type: Boolean, default: true},
        shouldAnimateThinkingForSelf: {type: Boolean, default: true},
        shouldAnimateCardPlay: {type: Boolean, default: true},
        shouldAnimateRoundEnd: {type: Boolean, default: true},
        pointCountingConvention: {type: String, default: "HCP"},
        cardBackPreference: {type: Number, default: 4},
        colorTheme: {type: String, default: "darkBlue"},  //add new preferences to the users.js helper object
        setHonorsAutomatically: {type: Boolean, default: false},
    },
    date: {type: Number, default: Date.now()},
    emailValidated: {type: Boolean, default: false},
    hasPaid: {type: Boolean, default: false},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    stats: {
        totalPoints: {
            distribution: {type: Number, default: 0},
            highCard: {type: Number, default: 0},
        },
        maximums: {
            distribution: {type: Number, default: 0},
            highCard: {type: Number, default: 0},
            combined: {
                highCard: {type: Number, default: 0},
                distribution: {type: Number, default: 0},
            }
        },
        gamesPlayed: {type: Number, default: 0},
        gamesWon: {type: Number, default: 0},
        dealsPlayed: {type: Number, default: 0},
        dealsPlayedAsDeclarer: {type: Number, default: 0},
        dealsPlayedAsDefense: {type: Number, default: 0},
        dealsWon: {type: Number, default: 0},
        dealsWonAsDeclarer: {type: Number, default: 0},
        dealsWonAsDefense: {type: Number, default: 0},
        dealsDoubled: {type: Number, default: 0},
        dealsWonDoubled: {type: Number, default: 0},
        ties: {type: Number, default: 0},
    },
});

// Telling TS that Models are inheriting from mongoose's Document Interface
export interface UserModel extends mongoose.Document, User {}
export interface GameModel extends mongoose.Document, Game {}
export interface DealModel extends mongoose.Document, Deal {}