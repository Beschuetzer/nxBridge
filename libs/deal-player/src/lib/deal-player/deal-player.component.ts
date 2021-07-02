import { Component, ElementRef, HostBinding, OnInit, Renderer2 } from '@angular/core';
import {
  DEAL_PLAYER_CLASSNAME,
  VISIBLE_CLASSNAME,
  DISPLAY_NONE_CLASSNAME,
  flatten,
  getDirectionFromSeating,
  cardinalDirections,
  numberOfCardsInDeck,
  getLinearPercentOfMaxMatchWithinRange,
} from '@nx-bridge/constants';

import { Store } from '@ngrx/store';
import { AppState, SetCurrentlyViewingDeal } from '@nx-bridge/store';
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
  private minScaleAmount = .5875;
  private maxScaleAmount = .6;
  private minTargetViewPortWidth = 340;
  private maxTargetViewPortWidth = 1600;
  private cardScaleAmount = getLinearPercentOfMaxMatchWithinRange(window.innerWidth as number,this.minTargetViewPortWidth, this.maxTargetViewPortWidth, this.maxScaleAmount, this.minScaleAmount)
  private redrawTimeout: any;
  private error = '';

  constructor(private store: Store<AppState>, private elRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.onResize.bind(this));

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
          this.renderer.addClass(this.elRef.nativeElement, VISIBLE_CLASSNAME)
        }
      }
    });


  }

  onClose() {
    this.renderer.removeClass(this.elRef.nativeElement, VISIBLE_CLASSNAME)
    this.resetCards();
    this.store.dispatch(new SetCurrentlyViewingDeal({} as Deal));
  }

  private loadCards() {
    if (this.cards.length > 0) this.removeCards();
    this.cards = [];
    for (let i = 0; i < numberOfCardsInDeck; i++) {
      const newRaster = new Raster(`card-${i}`);
      newRaster.position.x = this.defaultCardPosition;
      newRaster.scale(this.cardScaleAmount);
      newRaster.onLoad = this.onCardLoad.bind(this);
      this.cards.push(newRaster);
    }
  }

  private removeCards() {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i] as paper.Raster;
      card.remove();
    }
  }

  private onCardLoad() {
    this.cardsLoaded += 1;
    if (this.cardsLoaded >= numberOfCardsInDeck) {
      this.renderHands();
    }
  }

  private setCardMetrics() {
    this.cardWidth = (this.cards[0] as paper.Raster).bounds.width;
    this.cardHeight = (this.cards[0] as paper.Raster).bounds.height;
    this.cardVisibleOffset = this.cardHeight / 4 - 2.5;
    this.cardSpacingIncrement = this.canvasWidth as number / 13;
  }

  private setCanvasMetrics() {
    const canvasEl = document.getElementById(`${DEAL_PLAYER_CLASSNAME}-canvas`);
    const canvasBounds = canvasEl?.getBoundingClientRect();
    this.canvasHeight = canvasBounds?.height;
    this.canvasWidth = canvasBounds?.width;
  }

  private renderHands() {
    this.setCanvasMetrics();
    this.setCardMetrics();

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
    if (cardAsRaster.rotation > -89.5 || cardAsRaster.rotation < -90.5) cardAsRaster.rotate(-90);
  }

  private setWestCards(cardAsRaster: paper.Raster, nthCard: number, direction: string, startingPosition: number) {
    cardAsRaster.position.y = startingPosition + this.cardWidth / 2 + this.cardSpacingIncrement * nthCard;
    cardAsRaster.position.x = -this.cardVisibleOffset;
    if (cardAsRaster.rotation < 89.5 || cardAsRaster.rotation > 90.5) cardAsRaster.rotate(90);

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

  private onResize(e: Event) {
    clearTimeout(this.redrawTimeout);
    const dealPlayerEl = document.querySelector(`.${DEAL_PLAYER_CLASSNAME}`) as HTMLElement;
    if (dealPlayerEl.classList.contains(VISIBLE_CLASSNAME)) {
      // this.renderHands();

      this.redrawTimeout = setTimeout(() => {
        this.cardScaleAmount = getLinearPercentOfMaxMatchWithinRange(window.innerWidth as number,this.minTargetViewPortWidth, this.maxTargetViewPortWidth, this.maxScaleAmount, this.minScaleAmount);


        // this.loadCards();
        // this.renderHands();
        console.log('this.cardScaleAmount =', this.cardScaleAmount);
      }, 250)
    };
  }

  private getStartingPosition(numberOfCardsInHand: number, direction: string) {
    const lengthOfHand = (this.cardWidth + (numberOfCardsInHand - 1) * this.cardSpacingIncrement);
    // const southStartingPosition = (this.canvasWidth as number - lengthOfHand) / 2;

    // let dimensionToUse = this.canvasHeight;
    if (direction === cardinalDirections[0]) return -(this.cardWidth - this.cardSpacingIncrement)
    else if (direction === cardinalDirections[2])  return 0;
    // if (direction === cardinalDirections[0] || direction === cardinalDirections[2]) dimensionToUse = this.canvasWidth;
    
    return (this.canvasHeight as number - lengthOfHand) / 2;
  }

  private resetCards() {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      card.position.x = this.defaultCardPosition;
      card.rotation = 0;
    }
  }
}
