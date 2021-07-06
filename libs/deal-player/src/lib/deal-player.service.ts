import { Injectable } from '@angular/core';
import * as paper from 'paper';

@Injectable({
  providedIn: 'root'
})
export class DealPlayerService {

  constructor() { }

  setCardsRotationAndPosition(cards: paper.Raster[], positionToSetCardsTo = 0, rotationToSetCardsTo = 0) {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as paper.Raster;
      card.position.x = positionToSetCardsTo;
      card.rotation = rotationToSetCardsTo;
    }
  }
}
