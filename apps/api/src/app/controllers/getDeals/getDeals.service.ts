import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { DealModel } from '@nx-bridge/api-mongoose-models';
import { Model } from 'mongoose';
import { ControllerResponse, Deal, DealCore, DealRelevant, ErrorMessage } from '@nx-bridge/interfaces-and-types';
import { getMongooseObjsFromStrings } from '@nx-bridge/constants';

@Injectable({ providedIn: 'root'})
export class GetDealsService {
  constructor(
    @InjectModel('Deal') private DealsModel: Model<DealModel>,
  ) {}

  async getDeals(userId: string): ControllerResponse<DealCore> {
    if (!userId) {
      return new Promise((res, rej) => {
        res({message: "Invalid user id given in getDeals", status: 400} as ErrorMessage);
      }) 
    } else {
      const deals = await this.DealsModel.find({players: userId});
      return this.removeUnnecessaryDataFromDeals(deals);
    }
  }

  async getDeal(dealId: string): ControllerResponse<DealCore> {
    if (!dealId) {
      return new Promise((res, rej) => {
        res({message: "Invalid deal id given in getDeal", status: 400} as ErrorMessage);
      }) 
    } else {
      const deal = await this.DealsModel.findOne({_id: dealId});
      return this.getNewDeal(deal);
    }
  }

  async getDealsInfo(deals: string[]): ControllerResponse<DealCore> {
    try {
      if (!deals || deals.length <= 0) return this.getErrorResponse();
      const mongooseObjs = getMongooseObjsFromStrings(deals);
      const dealsToReturn = await this.DealsModel.find({_id: {$in: mongooseObjs}});
      return this.removeUnnecessaryDataFromDeals(dealsToReturn);
    } catch (err) {
      return this.getErrorResponse();
    }
  }

  private getErrorResponse(): Promise<ErrorMessage> { 
    return new Promise((res, rej) => {
      res({message: "Error in getDealsInfo", status: 400} as ErrorMessage);
    }) 
  }

  private getNewDeal(deal: DealModel | Deal) {
    console.log('deal =', deal);
// -send back relevant deal info (bids, cardPlayerOrder,contract,dealer,declarer,doubleValue,hands, roundWinners, _d) can remove dealSummary, players, and redealCount

    const newDeal: DealRelevant = {
      bids: deal.bids,
      contract: deal.contract,
      cardPlayOrder: deal.cardPlayOrder,
      dealer: deal.dealer,
      declarer: deal.declarer,
      doubleValue: deal.doubleValue,
      hands: deal.hands,
      roundWinners: deal.roundWinners,
      northSouth: deal.northSouth,
      eastWest: deal.eastWest,
      _id: deal._id,
    }

    console.log('newDeal =', newDeal);
    return newDeal;
  }

  private removeUnnecessaryDataFromDeals(deals: Deal[]) {
    const toReturn: DealRelevant[] = [];

    for (let i = 0; i < deals.length; i++) {
      const deal = deals[i];
      const newDeal = this.getNewDeal(deal);
      toReturn.push(newDeal);
    }

    return toReturn;
  }
}
