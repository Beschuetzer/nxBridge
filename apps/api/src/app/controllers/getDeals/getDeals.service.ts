import * as mongoose from 'mongoose';
import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { DealModel } from '@nx-bridge/api-mongoose-models';
import { Model } from 'mongoose';
import { ControllerResponse, ErrorMessage } from '@nx-bridge/interfaces-and-types';

@Injectable({ providedIn: 'root'})
export class GetDealsService {
  constructor(
    @InjectModel('Deal') private DealsModel: Model<DealModel>,
  ) {}

  async getDeals(userId: string): ControllerResponse<DealModel> {
    if (!userId) {
      return new Promise((res, rej) => {
        res({message: "Invalid user id given in getDeals", status: 400} as ErrorMessage);
      }) 
    } else {
      return await this.DealsModel.find({players: userId});
    }
  }

  async getDeal(dealId: string): ControllerResponse<DealModel> {
    if (!dealId) {
      return new Promise((res, rej) => {
        res({message: "Invalid deal id given in getDeal", status: 400} as ErrorMessage);
      }) 
    } else {
      return await this.DealsModel.findOne({_id: dealId});
    }
  }

  async getDealsInfo(deals: string[]): ControllerResponse<DealModel> {
    if (!deals || deals.length <= 0) {
      return new Promise((res, rej) => {
        res({message: "No Deals Provided in getDealsInfo", status: 400} as ErrorMessage);
      }) 
    } else {
      const mongooseObjs = [];
      for (let i = 0; i < deals.length; i++) {
        const deal = deals[i];
        mongooseObjs.push(mongoose.Types.ObjectId(deal))
      }

      return await this.DealsModel.find({_id: {$in: mongooseObjs}});
    }
  }
}
