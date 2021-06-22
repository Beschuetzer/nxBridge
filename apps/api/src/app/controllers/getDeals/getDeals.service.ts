import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { DealModel } from '@nx-bridge/api-mongoose-models';
import { Model } from 'mongoose';

@Injectable({ providedIn: 'root'})
export class GetDealsService {
  constructor(
    @InjectModel('Deal') private DealsModel: Model<DealModel>,
  ) {}

  async getDeals(userId: string) {
    return await this.DealsModel.find({_id: userId});
  }

  async getDeal(dealId: string) {
    return await this.DealsModel.findOne({_id: dealId});
  }
}
