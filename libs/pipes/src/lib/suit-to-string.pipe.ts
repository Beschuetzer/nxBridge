import { Pipe, PipeTransform } from '@angular/core';
import {
  cardsPerSuit,
  getCharacterFromCardAsNumber,
} from '@nx-bridge/constants';

@Pipe({
  name: 'suitToString',
})
export class SuitToStringPipe implements PipeTransform {
  transform(suitsLocal: number[], ...args: unknown[]): unknown {
    if (suitsLocal && suitsLocal.length > 0) {
      const cardsAsChar = [];


      for (let i = 0; i < suitsLocal.length; i++) {
        const cardAsNumber = suitsLocal[i];
        cardsAsChar.push(getCharacterFromCardAsNumber(cardAsNumber % cardsPerSuit));
      }

      return cardsAsChar.join(',');
    }
    return null;
  }
}
