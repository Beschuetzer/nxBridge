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

export function getValueFromLocalStorage(value: string) {
  return JSON.parse(localStorage.getItem(value) as string);
}

export function setValueInLocalStorage(value: string, valueToSet: any) {
  return localStorage.setItem(value,  JSON.stringify(valueToSet));
}

export function toggleClassOnList(items: HTMLElement[], classListToToggle: string) {
  console.log('toggling------------------------------------------------');
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    item?.classList?.toggle(classListToToggle);
  }
}

export function toggleInnerHTML(element: HTMLElement, choices: [string, string]) {
  if (!element || !choices) return;
  if (element.innerHTML.match(choices[0])) element.innerHTML = choices[1];
  else element.innerHTML = choices[0];
}