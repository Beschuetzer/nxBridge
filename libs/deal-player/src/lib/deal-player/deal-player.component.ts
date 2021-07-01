import { Component, HostBinding, OnInit } from '@angular/core';
import {
  DEAL_PLAYER_CLASSNAME,
  VISIBLE_CLASSNAME,
  DISPLAY_NONE_CLASSNAME,
  flatten,
  getDirectionFromSeating,
  cardinalDirections,
} from '@nx-bridge/constants';

import { Store } from '@ngrx/store';
import { AppState } from '@nx-bridge/store';
import { Deal, Hand, Seating } from '@nx-bridge/interfaces-and-types';
import * as paper from 'paper';
import { Path, Project, Raster } from 'paper/dist/paper-core';

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

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.select('games').subscribe((gameState) => {
      this.seating = gameState.currentlyViewingGameSeating;
    })

    this.store.select('deals').subscribe((dealState) => {
      this.deal = dealState.currentlyViewingDeal;
      if (Object.keys(this.deal).length <= 0) return;

      this.project = new Project(
        document.querySelector(
          `#${DEAL_PLAYER_CLASSNAME}-canvas`
        ) as HTMLCanvasElement
      );
  
      if (this.cards.length < 52) this.loadCards();
      else {
        this.renderHands();
      }
    });
  }

  onClose() {
    document
      .querySelector(`.${DEAL_PLAYER_CLASSNAME}`)
      ?.classList.remove(VISIBLE_CLASSNAME);
    this.resetAllCardPositions();
  }

  private loadCards() {
    for (let i = 0; i < 52; i++) {
      const newRaster = new Raster(`card-${i}`);
      newRaster.position.x = this.defaultCardPosition;
      newRaster.scale(.5);
      newRaster.onLoad = this.onCardLoad.bind(this);
      this.cards.push(newRaster);
    }
  }

  private onCardLoad() {
    this.cardsLoaded += 1;
    if (this.cardsLoaded >= 52) {
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
    this.setCanvasBounds();

    for (const username in this.deal?.hands) {
      if (Object.prototype.hasOwnProperty.call(this.deal?.hands, username)) {
        const usersHand = this.deal?.hands[username];
        const usersDirection = getDirectionFromSeating(this.seating as Seating, username);
        this.renderHand(usersHand as Hand, usersDirection);
      }
    }
  }

  private renderHand(hand: Hand, direction: string) {
    const flatHand = flatten(hand);
    this.cardWidth = (this.cards[0] as paper.Raster).bounds.width;
    this.cardHeight = (this.cards[0] as paper.Raster).bounds.height;
    this.cardVisibleOffset = this.cardHeight / 5;
    this.cardSpacingIncrement = this.cardWidth / 6;
    const startingPosition = this.getStartingPosition(flatHand.length, direction);

    const cardsInHand = []
    for (let i = 0; i < flatHand.length; i++) {
      const cardAsNumber = flatHand[i];
      const cardAsRaster = this.cards.find((card: paper.Raster) => {
        const indexOfDash = card.image.id.indexOf('-');
        const digits = card.image.id.slice(indexOfDash + 1);
        return(digits).match(cardAsNumber);
      });

      cardsInHand.push(cardAsRaster);

      if (direction === cardinalDirections[0]) this.setNorthCards(cardAsRaster, i, direction, startingPosition);
      else if (direction === cardinalDirections[1]) this.setEastCards(cardAsRaster, i, direction, startingPosition);
      else if (direction === cardinalDirections[2]) this.setSouthCards(cardAsRaster, i, direction, startingPosition);
      else if (direction === cardinalDirections[3]) this.setWestCards(cardAsRaster, i, direction, startingPosition);

      this.project?.activeLayer.addChild(cardAsRaster);
    }

    if (direction === cardinalDirections[0]) this.reverseHandLayering(cardsInHand);
  }

  private reverseHandLayering(cards: paper.Raster[]) {
    for (let i = cards.length - 1; i >= 0 ; i--) {
      const card = cards[i];
      this.project?.activeLayer.addChild(card);
    }
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
    // cardAsRaster.position.x = startingPosition + this.cardWidth / 2 + this.cardSpacingIncrement * nthCard;
    // cardAsRaster.position.y = 500;
  }

  private setWestCards(cardAsRaster: paper.Raster, nthCard: number, direction: string, startingPosition: number) {
    // cardAsRaster.position.x = startingPosition + this.cardWidth / 2 + this.cardSpacingIncrement * nthCard;
    // cardAsRaster.position.y = 500;
  }

  private getStartingPosition(lengthOfHand: number, direction: string) {
    let dimensionToUse = this.canvasHeight;
    if (direction === cardinalDirections[0] || direction === cardinalDirections[2]) dimensionToUse = this.canvasWidth;
    
    return (dimensionToUse as number - (this.cardWidth + (lengthOfHand - 1) * this.cardSpacingIncrement)) / 2;
  }

  private resetAllCardPositions() {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      card.position.x = this.defaultCardPosition;
    }
  }
}
