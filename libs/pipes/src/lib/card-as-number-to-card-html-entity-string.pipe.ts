import { Pipe, PipeTransform } from '@angular/core';
import { getHtmlEntityFromCard } from '@nx-bridge/constants';
@Pipe({
  name: 'cardAsNumberToCardHtmlEntityString'
})
export class CardAsNumberToCardHtmlEntityStringPipe implements PipeTransform {

  transform(cardAsNumber: number | string): string {
    return getHtmlEntityFromCard(cardAsNumber);
  }

}
