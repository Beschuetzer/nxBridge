import { Pipe, PipeTransform } from '@angular/core';
import { getCharacterFromCardAsNumber, getHtmlEntityFromSuitOrCardAsNumber } from '@nx-bridge/constants';
@Pipe({
  name: 'cardAsNumberToCardHtmlEntityString'
})
export class CardAsNumberToCardHtmlEntityStringPipe implements PipeTransform {

  transform(cardAsNumber: number | string): string {
    const number = +cardAsNumber;
    if (isNaN(number)) return cardAsNumber as string;
    const htmlEntity = getHtmlEntityFromSuitOrCardAsNumber(number);
    const char = getCharacterFromCardAsNumber(number, true);
    return `${char}${htmlEntity}`;
  }

}
