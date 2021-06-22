import * as mongoose from 'mongoose';

const DealSchema = new mongoose.Schema({
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

//Telling TS that Product is inheriting from mongoose's Document Interface
// export interface Product extends mongoose.Document {
//   id: string;
//   title: string;
//   description: string;
//   price: number;
// }