import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {

  transform(str: string, toReplace: string | string[], replaceWith: string | string[], replaceAll = false): string {
    //user can use three dif ways 
    //1: (toReplace = string and replaceWith = string)
    //2: (toReplace = string[] and replaceWith = string)
    //3: (toReplace = string[] and replaceWith = string[])

    let result = str ? str : '';
    const toReplaceIsArray = Array.isArray(toReplace);
    const replaceWithIsArray = Array.isArray(replaceWith);

    if (!toReplaceIsArray && !replaceWithIsArray) {
      if (!replaceAll) result = this.replaceOne(result, toReplace as string, replaceWith as string);
      else {
        while (result.includes(toReplace as string)) {
          result = this.replaceOne(result, toReplace as string, replaceWith as string);
        }
      }
    }
    else if (toReplaceIsArray && !replaceWithIsArray) {
      if (!replaceAll) result = this.replaceMultipleWithOne(str, toReplace as string[], replaceWith as string)
      else {
        for (let i = 0; i < toReplace.length; i++) {
          const toReplaceString = toReplace[i];
          while (result.includes(toReplaceString)) {
            result = this.replaceMultipleWithOne(result, toReplace as string[], replaceWith as string);
          }
        }
      }
    }
    else if (toReplaceIsArray && replaceWithIsArray) {
      if (!replaceAll) result = this.replaceMultipleWithMultiple(str, toReplace as string[], replaceWith as string[])
      else {
        for (let i = 0; i < toReplace.length; i++) {
          const toReplaceString = toReplace[i];
          while (result.includes(toReplaceString)) {
            result = this.replaceMultipleWithMultiple(result, toReplace as string[], replaceWith as string[]);
          }
        }
      }
    }

    return result;
  }

  replaceOne(str: string, toReplace: string, replaceWith: string) {
    return str.replace(toReplace as string, replaceWith as string);
  }

  replaceMultipleWithOne(str: string, toReplace: string[], replaceWith: string) {
    let result = str;
    for (let i = 0; i < toReplace.length; i++) {
      const toReplaceString = toReplace[i];
      result = this.replaceOne(result, toReplaceString as string, replaceWith as string);
      console.log('result =', result);
    }
    return result;
  }

  replaceMultipleWithMultiple(str: string, toReplace: string[], replaceWith: string[]) {
    if (toReplace.length !== replaceWith.length) throw new Error('toReplace and replaceWith arrays must be the same length to use replaceMultipleWithMultiple()');
    let result = str;
    for (let i = 0; i < toReplace.length; i++) {
      const toReplaceString = toReplace[i];
      const replaceWithString = replaceWith[i]
      result = this.replaceOne(result, toReplaceString, replaceWithString);
    }
    return result;
  }
}


