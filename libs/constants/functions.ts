import * as mongoose from 'mongoose';

export function getMongooseObjsFromStrings(items: string[]) {
  const mongooseObjs = [];
  
  for (let i = 0; i < items.length; i++) {
    const deal = items[i];
    console.log('deal =', deal);
    mongooseObjs.push(mongoose.Types.ObjectId(deal))
  }

  return mongooseObjs;
}