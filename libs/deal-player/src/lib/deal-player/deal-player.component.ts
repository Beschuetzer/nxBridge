import { Component, HostBinding, OnInit } from '@angular/core';
import {
  DEAL_PLAYER_CLASSNAME,
  VISIBLE_CLASSNAME,
  DISPLAY_NONE_CLASSNAME,
  flatten,
  getDirectionFromSeating,
  cardinalDirections,
  numberOfCardsInDeck,
} from '@nx-bridge/constants';

import { Store } from '@ngrx/store';
import { AppState } from '@nx-bridge/store';
import { Deal, Hand, Seating } from '@nx-bridge/interfaces-and-types';
import * as paper from 'paper';
import { Project, Raster } from 'paper/dist/paper-core';

@Component({
  selector: 'nx-bridge-deal-player',
  templateUrl: './deal-player.component.html',
  styleUrls: ['./deal-player.component.scss'],
})
export class DealPlayerComponent implements OnInit {
  @HostBinding(`class.${DEAL_PLAYER_CLASSNAME}`) get classname() {
    return true;
  }
  public DEAL_PLAYER_CLASSNAME = DEAL_PLAYER_CLASSNAME;
  public DISPLAY_NONE_CLASSNAME = DISPLAY_NONE_CLASSNAME;
  public deal: Deal | null = null;
  public seating: Seating | null = null;
  public isPlaying = false;
  public scope: paper.PaperScope | null = null;
  public project: paper.Project | null = null;
  public isMobile = window.innerWidth <= 655;
  private cards: any[] = [];
  private cardsLoaded = 0;
  private cardWidth = -1;
  private cardHeight = -1;
  private cardVisibleOffset = -1;
  private cardSpacingIncrement = -1;
  private defaultCardPosition = -1000;
  private canvasHeight: number | undefined;
  private canvasWidth: number | undefined;
  //todo: need to dynamically change this based on viewport
  private cardScaleAmount = .4;
  private error = '';

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.select('games').subscribe((gameState) => {
      this.seating = gameState.currentlyViewingGameSeating;
    })

    this.store.select('deals').subscribe((dealState) => {
      if (dealState.currentlyViewingDeal) {
        this.deal = dealState.currentlyViewingDeal;
        if (Object.keys(this.deal).length <= 0) return;

        this.project = new Project(
          document.querySelector(
            `#${DEAL_PLAYER_CLASSNAME}-canvas`
          ) as HTMLCanvasElement
        );
    
        if (this.cards.length < numberOfCardsInDeck) this.loadCards();
        else {
          this.resetCards();
          this.renderHands();
        }
      }
    });


  }

  onClose() {
    document
      .querySelector(`.${DEAL_PLAYER_CLASSNAME}`)
      ?.classList.remove(VISIBLE_CLASSNAME);
    this.resetCards();
  }

  private loadCards() {
    this.cards = [];
    for (let i = 0; i < numberOfCardsInDeck; i++) {
      const newRaster = new Raster(`card-${i}`);
      newRaster.position.x = this.defaultCardPosition;
      newRaster.scale(this.cardScaleAmount);
      newRaster.onLoad = this.onCardLoad.bind(this);
      this.cards.push(newRaster);
    }
  }

  private onCardLoad() {
    this.cardsLoaded += 1;
    if (this.cardsLoaded >= numberOfCardsInDeck) {
      this.renderHands();
    }
  }

  private setCanvasBounds() {
    const canvasEl = document.getElementById(`${DEAL_PLAYER_CLASSNAME}-canvas`);
    const canvasBounds = canvasEl?.getBoundingClientRect();
    this.canvasHeight = canvasBounds?.height;
    this.canvasWidth = canvasBounds?.width;
  }

  private renderHands() {
    this.cardWidth = (this.cards[0] as paper.Raster).bounds.width;
    this.cardHeight = (this.cards[0] as paper.Raster).bounds.height;
    this.cardVisibleOffset = this.cardHeight / 5;
    this.cardSpacingIncrement = this.cardWidth / 6;
    this.setCanvasBounds();

    for (const username in this.deal?.hands) {
      if (Object.prototype.hasOwnProperty.call(this.deal?.hands, username)) {
        const usersHand = this.deal?.hands[username];
        try {
          const usersDirection = getDirectionFromSeating(this.seating as Seating, username);
          this.renderHand(usersHand as Hand, usersDirection);
        } catch(err) {

          this.error = err;
          this.resetCards();
          console.log('err =', err);
        }
      }
    }
  }

  private renderHand(hand: Hand, direction: string) {
    
    
    const flatHand = flatten(hand);
    const startingPosition = this.getStartingPosition(flatHand.length, direction);
    const correctlyArrangedHand = this.getCorrectlyArrangedHand(flatHand, direction);
    const cardsInHand = [];

    for (let i = 0; i < correctlyArrangedHand.length; i++) {
      const cardAsNumber = correctlyArrangedHand[i];
      const cardAsRaster = this.cards.find((card: paper.Raster) => {
        const indexOfDash = card.image.id.indexOf('-');
        const digits = card.image.id.slice(indexOfDash + 1);
        return(digits).match(cardAsNumber as any);
      });

      console.log('this.cardWidth =', this.cardWidth);
      console.log('this.cardSpacingIncrement =', this.cardSpacingIncrement);
      cardsInHand.push(cardAsRaster);

      if (direction === cardinalDirections[0]) this.setNorthCards(cardAsRaster, i, direction, startingPosition);
      else if (direction === cardinalDirections[1]) this.setEastCards(cardAsRaster, i, direction, startingPosition);
      else if (direction === cardinalDirections[2]) this.setSouthCards(cardAsRaster, i, direction, startingPosition);
      else if (direction === cardinalDirections[3]) this.setWestCards(cardAsRaster, i, direction, startingPosition);

      this.project?.activeLayer.addChild(cardAsRaster);
    }

    if (direction === cardinalDirections[0] || direction === cardinalDirections[1]) this.reverseHandLayering(cardsInHand);
  }

  private setNorthCards(cardAsRaster: paper.Raster, nthCard: number, direction: string, startingPosition: number) {
    cardAsRaster.position.x = startingPosition + this.cardWidth / 2 + this.cardSpacingIncrement * nthCard;
    cardAsRaster.position.y = -this.cardVisibleOffset;
  }

  private setSouthCards(cardAsRaster: paper.Raster, nthCard: number, direction: string, startingPosition: number) {
    cardAsRaster.position.x = startingPosition + this.cardWidth / 2 + this.cardSpacingIncrement * nthCard;
    cardAsRaster.position.y = this.canvasHeight as number + this.cardVisibleOffset;
  }

  private setEastCards(cardAsRaster: paper.Raster, nthCard: number, direction: string, startingPosition: number) {
    cardAsRaster.position.y = startingPosition + this.cardWidth / 2 + this.cardSpacingIncrement * nthCard;
    cardAsRaster.position.x = this.canvasWidth as number + this.cardVisibleOffset;
    cardAsRaster.rotate(-90);
  }

  private setWestCards(cardAsRaster: paper.Raster, nthCard: number, direction: string, startingPosition: number) {
    cardAsRaster.position.y = startingPosition + this.cardWidth / 2 + this.cardSpacingIncrement * nthCard;
    cardAsRaster.position.x = -this.cardVisibleOffset;
    cardAsRaster.rotate(90);
  }

  private getCorrectlyArrangedHand(hand: number[], direction: string) {
    if (direction === cardinalDirections[0] || direction === cardinalDirections[1]) return hand.reverse();
    return hand;
  }

  private reverseHandLayering(cards: paper.Raster[]) {
    for (let i = cards.length - 1; i >= 0 ; i--) {
      const card = cards[i];
      this.project?.activeLayer.addChild(card);
    }
  }


  //TODO: this can be deleted when finished
  // private getStartingPosition(numberOfCardsInHand: number, direction: string) {
  //   const lengthOfHand = (this.cardWidth + (numberOfCardsInHand - 1) * this.cardSpacingIncrement);
  //   const southStartingPosition = (this.canvasWidth as number - lengthOfHand) / 2;

  //   if (direction === cardinalDirections[0]) {
  //     return southStartingPosition + lengthOfHand;
  //   } 
  //   else if (direction === cardinalDirections[1]) {
  //     return -1;
  //   } 
  //   else if (direction === cardinalDirections[2]) {
  //     return southStartingPosition;
  //   } 
  //   else if (direction === cardinalDirections[3]) {
  //     return -1;
  //   } 

  //   return -1;
  // }

  private getStartingPosition(numberOfCardsInHand: number, direction: string) {
    const lengthOfHand = (this.cardWidth + (numberOfCardsInHand - 1) * this.cardSpacingIncrement);
    // const southStartingPosition = (this.canvasWidth as number - lengthOfHand) / 2;

    let dimensionToUse = this.canvasHeight;
    if (direction === cardinalDirections[0] || direction === cardinalDirections[2]) dimensionToUse = this.canvasWidth;
    
    return (dimensionToUse as number - lengthOfHand) / 2;
  }

  private resetCards() {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      card.position.x = this.defaultCardPosition;
      card.rotation = 0;
    }
  }
}
