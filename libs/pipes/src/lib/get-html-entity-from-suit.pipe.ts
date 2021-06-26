import { Pipe, PipeTransform } from '@angular/core';
import { getSuitFromNumber, suitsAsCapitalizedStrings, suitsHtmlEntities } from '@nx-bridge/constants';

@Pipe({
  name: 'getHtmlEntityFromSuit'
})
export class GetHtmlEntityFromSuitPipe implements PipeTransform {

  transform(suit: number[], ...args: unknown[]): string {
    const suitAsString = getSuitFromNumber(suit[0]);
    const htmlEntityToUse = suitsHtmlEntities[suitsAsCapitalizedStrings.findIndex(str => str.toLowerCase() === suitAsString.toLowerCase())];

    return htmlEntityToUse;
  }

}
