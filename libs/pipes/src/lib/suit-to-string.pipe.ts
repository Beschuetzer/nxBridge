import { Pipe, PipeTransform } from '@angular/core';
import {
  getSuitAsStringFromArray,
} from '@nx-bridge/constants';

@Pipe({
  name: 'suitToString',
})
export class SuitToStringPipe implements PipeTransform {
  transform(suit: number[]): string | null {
    return getSuitAsStringFromArray(suit)
  }
}
