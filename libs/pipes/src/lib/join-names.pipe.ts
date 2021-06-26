import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'joinNames'
})
export class JoinNamesPipe implements PipeTransform {

  transform(strings: string[] | null): unknown {
    let result = '';

    if (!strings || strings.length <= 0) return result;
    if (strings.length === 2) return `${result[0]} and ${result[1]}`

    for (let i = 0; i < strings.length; i++) {
      const string = `'${strings[i]}'`;
      
      if (i === 0) result = string;
      else if (i === strings.length - 1) result += `, and ${string}`;
      else result += `, ${string}`;
    }
    return result;
  }

}
