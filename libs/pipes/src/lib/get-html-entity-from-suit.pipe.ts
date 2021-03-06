import { Pipe, PipeTransform } from '@angular/core';
import { getHtmlEntityFromSuitOrCardAsNumber } from '@nx-bridge/constants';

@Pipe({
  name: 'getHtmlEntityFromSuit'
})
export class GetHtmlEntityFromSuitPipe implements PipeTransform {

  transform(suit: number[], ...args: unknown[]): string {
    if (!suit || suit.length <= 0) return '';
    return getHtmlEntityFromSuitOrCardAsNumber(suit[0]);
  }

}
