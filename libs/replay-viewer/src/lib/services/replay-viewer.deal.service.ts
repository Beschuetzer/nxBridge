import { Injectable } from '@angular/core';
import { gameDetailBorderClosed, gameDetailBorderCssPropName, gameDetailBorderOpen } from '@nx-bridge/constants';



@Injectable({
  providedIn: 'root'
})
export class ReplayViewerDealService {

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  setGameDetailBorderToBlack() {
    const newValue = `${gameDetailBorderCssPropName}: ${gameDetailBorderOpen}`;
    document.documentElement.style.cssText += newValue;
  }

  setGameDetailBorderToNormal() {
    const newValue = `${gameDetailBorderCssPropName}: ${gameDetailBorderClosed}`;
    document.documentElement.style.cssText += newValue;
  }
}