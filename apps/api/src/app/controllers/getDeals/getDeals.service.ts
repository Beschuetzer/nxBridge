import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { DealModel } from '@nx-bridge/api-mongoose-models';
import { Model } from 'mongoose';
import { ControllerResponse, Deal, DealRelevant, DealRequest, ErrorMessage } from '@nx-bridge/interfaces-and-types';
import { getMongooseObjsFromRequestedDeals } from '@nx-bridge/constants';

@Injectable({ providedIn: 'root'})
export class GetDealsService {
  private shouldReturnScoringDefault = true;

  constructor(
    @InjectModel('Deal') private DealsModel: Model<DealModel>,
  ) {}

  async getDeals(userId: string): ControllerResponse<DealRelevant> {
    if (!userId) {
      return new Promise((res, rej) => {
        res({message: "Invalid user id given in getDeals", status: 400} as ErrorMessage);
      }) 
    } else {
      const deals = await this.DealsModel.find({players: userId});
      return this.removeUnnecessaryDataFromDeals(deals, null);
    }
  }

  async getDeal(requestedDeal: string): ControllerResponse<DealRelevant> {
    if (!requestedDeal) {
      return new Promise((res, rej) => {
        res({message: "Invalid deal id given in getDeal", status: 400} as ErrorMessage);
      }) 
    } else {
      const deal = await this.DealsModel.findOne({_id: requestedDeal});
      return this.getNewDeal(deal);
    }
  }

  async getDealsInfo(requestedDeals: DealRequest): ControllerResponse<DealRelevant> {
    try {
      console.log('requestedDeals =', requestedDeals);
      if (!requestedDeals) return this.getErrorResponse();
      const dealsAsStrings = Object.keys(requestedDeals);
      const mongooseObjs = getMongooseObjsFromRequestedDeals(dealsAsStrings);
      console.log('mongooseObjs =', mongooseObjs);
      const dealsToReturn = await this.DealsModel.find({_id: {$in: mongooseObjs}});
      return this.removeUnnecessaryDataFromDeals(dealsToReturn, requestedDeals);
    } catch (err) {
      return this.getErrorResponse();
    }
  }

  private getErrorResponse(): Promise<ErrorMessage> { 
    return new Promise((res, rej) => {
      res({message: "Error in getDealsInfo", status: 400} as ErrorMessage);
    }) 
  }

  private getNewDeal(deal: DealModel | Deal, shouldAddScoring = this.shouldReturnScoringDefault) {
    const newDeal: DealRelevant = {
      bids: deal.bids,
      contract: deal.contract,
      cardPlayOrder: deal.cardPlayOrder,
      dealer: deal.dealer,
      declarer: deal.declarer,
      doubleValue: deal.doubleValue,
      hands: deal.hands,
      roundWinners: deal.roundWinners,
      _id: deal._id,
    }

    console.log('shouldAddScoring inside=', shouldAddScoring);
    if (shouldAddScoring) {
      newDeal['northSouth'] = deal.northSouth;
      newDeal['eastWest'] = deal.eastWest;
    }

    return newDeal;
  }

  private removeUnnecessaryDataFromDeals(deals: Deal[], requestedDeals: DealRequest | null) {
    const toReturn: DealRelevant = {} as DealRelevant;

    for (let i = 0; i < deals.length; i++) {
      const deal = deals[i];
      const shouldAddScoring = requestedDeals[deal._id];
      const newDeal = this.getNewDeal(deal, shouldAddScoring);
      toReturn[deal._id] = newDeal;
    }

    return toReturn;
  }
}
