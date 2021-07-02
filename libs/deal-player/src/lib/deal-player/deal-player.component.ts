import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  DEAL_PLAYER_CLASSNAME,
  VISIBLE_CLASSNAME,
  DISPLAY_NONE_CLASSNAME,
  flatten,
  getDirectionFromSeating,
  cardinalDirections,
  cardsPerDeck,
  getLinearPercentOfMaxMatchWithinRange,
  cardsPerSuit,
} from '@nx-bridge/constants';

import { Store } from '@ngrx/store';
import { AppState, SetCurrentlyViewingDeal } from '@nx-bridge/store';
import { Deal, Hand, Hands, Seating } from '@nx-bridge/interfaces-and-types';
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
  public handsToRender: Hands | null = null;
  public playCount = 0;
  public cardsPlayed: number[] = [];
  public cardPlayWaitDuration = 2500;
  public seating: Seating | null = null;
  public isPlaying = false;
  public scope: paper.PaperScope | null = null;
  public project: paper.Project | null = null;
  private mobileWidthStart = 655;
  public isMobile = window.innerWidth <= this.mobileWidthStart;
  private cards: any[] = [];
  private cardsLoaded = 0;
  private cardWidth = -1;
  private cardHeight = -1;
  private cardVisibleOffset = -1;
  private cardSpacingIncrement = -1;
  private DEFAULT_CARD_POSITION = -1000;
  private canvasHeight: number | undefined;
  private canvasWidth: number | undefined;
  private SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH = 1650;
  private MIN_SCALE_AMOUNT_BELOW_THRESHOLD = 0.525;
  private MIN_SCALE_AMOUNT_ABOVE_THRESHOLD = 0.5875;
  private MAX_SCALE_AMOUNT_MOBILE = 0.675;
  private MAX_SCALE_AMOUNT_NORMAL = 0.55;
  private MIN_TARGET_VIEW_PORT_WIDTH = 600;
  private MAX_TARGET_VIEW_PORT_WIDTH = 1800;
  private CARD_MOBILE_PIXEL_WIDTH = 233;
  private CARD_FULL_PIXEL_WIDTH = 360;
  private cardScaleAmount = this.isMobile
    ? this.MAX_SCALE_AMOUNT_MOBILE
    : window.innerWidth < this.SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH
    ? getLinearPercentOfMaxMatchWithinRange(
        window.innerWidth as number,
        this.mobileWidthStart,
        this.SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH,
        this.MAX_SCALE_AMOUNT_NORMAL,
        this.MIN_SCALE_AMOUNT_BELOW_THRESHOLD
      )
    : getLinearPercentOfMaxMatchWithinRange(
        window.innerWidth as number,
        this.MIN_TARGET_VIEW_PORT_WIDTH,
        this.MAX_TARGET_VIEW_PORT_WIDTH,
        this.MAX_SCALE_AMOUNT_NORMAL,
        this.MIN_SCALE_AMOUNT_ABOVE_THRESHOLD
      );
  private redrawTimeout: any;
  private playInterval: any;
  private error = '';

  constructor(
    private store: Store<AppState>,
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.onResize.bind(this));

    this.store.select('games').subscribe((gameState) => {
      this.seating = gameState.currentlyViewingGameSeating;
    });

    this.store.select('deals').subscribe((dealState) => {
      if (dealState.currentlyViewingDeal) {
        this.deal = dealState.currentlyViewingDeal;
        this.handsToRender = this.deal?.hands;

        if (Object.keys(this.deal).length <= 0) return;

        this.project = new Project(
          document.querySelector(
            `#${DEAL_PLAYER_CLASSNAME}-canvas`
          ) as HTMLCanvasElement
        );

        if (this.cards.length < cardsPerDeck) this.loadCards();
        else {
          this.renderHands();
          this.renderer.addClass(this.elRef.nativeElement, VISIBLE_CLASSNAME);
        }
      }
    });
  }

  onClose() {
    this.renderer.removeClass(this.elRef.nativeElement, VISIBLE_CLASSNAME);
    this.resetCardsRotationAndPosition();
    this.store.dispatch(new SetCurrentlyViewingDeal({} as Deal));
  }

  onNext() {
    this.playCard();
  }

  onPause() {
    this.isPlaying = false;
    clearInterval(this.playInterval);
  }

  onPlay() {
    this.isPlaying = true;
    this.playCard(0);
    this.playInterval = setInterval(() => {
       this.playCard();
        if (this. playCount === cardsPerDeck) clearInterval(this.playInterval);
    }, this.cardPlayWaitDuration)
  }

  onPrevious() {

  }

  onStop() {
    this.onPause();
    this.resetCardsPlayed();
  }

  private playCard(nthCard = this.playCount) {
    this.cardsPlayed = flatten(this.deal?.cardPlayOrder.slice(0, nthCard + 1) as number[]);
    this. playCount = nthCard + 1;
    console.log('this.cardsPlayed =', this.cardsPlayed);
  }

  private resetCardsPlayed() {
    this.cardsPlayed = [];
    this.playCount = 0;
  }

  private loadCards() {
    if (this.cards.length > 0) this.removeCards();
    this.cards = [];
    for (let i = 0; i < cardsPerDeck; i++) {
      const newRaster = new Raster(`card-${i}`);
      newRaster.position.x = this.DEFAULT_CARD_POSITION;
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
    if (this.cardsLoaded >= cardsPerDeck) {
      this.setCanvasMetrics();
      this.setCardMetrics();
      this.renderHands();
      this.cardsLoaded = 0;
    }
  }

  private setCardMetrics() {
    const cardZero = this.cards[0] as paper.Raster;
    if (cardZero?.rotation === undefined) return;
    const roundedRotation = Math.round(cardZero.rotation);
    this.cardWidth = roundedRotation === 0 || roundedRotation === 180 ? cardZero.bounds.width : cardZero.bounds.height;
    this.cardHeight = this.cardWidth * 1.5;
    this.cardVisibleOffset = this.cardHeight / 4 - 2.5;
    this.cardSpacingIncrement = (this.canvasWidth as number) / cardsPerSuit;
  }

  private setCanvasMetrics() {
    const canvasEl = document.getElementById(`${DEAL_PLAYER_CLASSNAME}-canvas`);
    const canvasBounds = canvasEl?.getBoundingClientRect();
    this.canvasHeight = canvasBounds?.height;
    this.canvasWidth = canvasBounds?.width;
  }

  private renderHands() {
    for (const username in this.handsToRender) {
      if (Object.prototype.hasOwnProperty.call(this.handsToRender, username)) {
        const usersHand = this.handsToRender[username];
        try {
          const usersDirection = getDirectionFromSeating(
            this.seating as Seating,
            username
          );

          if (isNaN(this.cardWidth) || isNaN(this.cardHeight)) {
            return this.loadCards();
          }

          this.renderHand(usersHand as Hand, usersDirection);
        } catch (err) {
          this.error = err;
          this.resetCardsRotationAndPosition();
          console.log('err =', err);
        }
      }
    }
  }

  private renderHand(hand: Hand, direction: string) {
    const flatHand = flatten(hand);
    const startingPosition = this.getStartingPosition(
      flatHand.length,
      direction
    );
    const correctlyArrangedHand = this.getCorrectlyArrangedHand(
      flatHand,
      direction
    );
    const cardsInHand = [];

    for (let i = 0; i < correctlyArrangedHand.length; i++) {
      const cardAsNumber = correctlyArrangedHand[i];
      const cardAsRaster = this.cards.find((card: paper.Raster) => {
        const indexOfDash = card.image.id.indexOf('-');
        const digits = card.image.id.slice(indexOfDash + 1);
        return digits.match(cardAsNumber as any);
      });

      cardsInHand.push(cardAsRaster);

      if (direction === cardinalDirections[0])
        this.setNorthCards(cardAsRaster, i, direction, startingPosition);
      else if (direction === cardinalDirections[1])
        this.setEastCards(cardAsRaster, i, direction, startingPosition);
      else if (direction === cardinalDirections[2])
        this.setSouthCards(cardAsRaster, i, direction, startingPosition);
      else if (direction === cardinalDirections[3])
        this.setWestCards(cardAsRaster, i, direction, startingPosition);

      this.project?.activeLayer.addChild(cardAsRaster);
    }

    if (
      direction === cardinalDirections[0] ||
      direction === cardinalDirections[1]
    )
      this.reverseHandLayering(cardsInHand);
  }

  private setNorthCards(
    cardAsRaster: paper.Raster,
    nthCard: number,
    direction: string,
    startingPosition: number
  ) {
    cardAsRaster.position.x =
      startingPosition +
      this.cardWidth / 2 +
      this.cardSpacingIncrement * nthCard;
    cardAsRaster.position.y = -this.cardVisibleOffset;
  }

  private setSouthCards(
    cardAsRaster: paper.Raster,
    nthCard: number,
    direction: string,
    startingPosition: number
  ) {
    
    cardAsRaster.position.x =
      startingPosition +
      this.cardWidth / 2 +
      this.cardSpacingIncrement * nthCard;
    cardAsRaster.position.y =
      (this.canvasHeight as number) + this.cardVisibleOffset;
  }

  private setEastCards(
    cardAsRaster: paper.Raster,
    nthCard: number,
    direction: string,
    startingPosition: number
  ) {
    cardAsRaster.position.y =
      startingPosition +
      this.cardWidth / 2 +
      this.cardSpacingIncrement * nthCard;
    cardAsRaster.position.x =
      (this.canvasWidth as number) + this.cardVisibleOffset;
    if (cardAsRaster.rotation > -89.5 || cardAsRaster.rotation < -90.5)
      cardAsRaster.rotate(-90);
  }

  private setWestCards(
    cardAsRaster: paper.Raster,
    nthCard: number,
    direction: string,
    startingPosition: number
  ) {
    cardAsRaster.position.y =
      startingPosition +
      this.cardWidth / 2 +
      this.cardSpacingIncrement * nthCard;
    cardAsRaster.position.x = -this.cardVisibleOffset;
    if (cardAsRaster.rotation < 89.5 || cardAsRaster.rotation > 90.5)
      cardAsRaster.rotate(90);
  }

  private getCorrectlyArrangedHand(hand: number[], direction: string) {
    if (
      direction === cardinalDirections[0] ||
      direction === cardinalDirections[1]
    )
      return hand.reverse();
    return hand;
  }

  private reverseHandLayering(cards: paper.Raster[]) {
    for (let i = cards.length - 1; i >= 0; i--) {
      const card = cards[i];
      this.project?.activeLayer.addChild(card);
    }
  }

  private onResize(e: Event) {
    clearTimeout(this.redrawTimeout);

    this.isMobile = window.innerWidth <= this.mobileWidthStart;
      this.redrawTimeout = setTimeout(() => {
        this.cardScaleAmount = this.isMobile
          ? this.MAX_SCALE_AMOUNT_MOBILE
          : window.innerWidth < this.SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH
          ? getLinearPercentOfMaxMatchWithinRange(
              window.innerWidth as number,
              this.mobileWidthStart,
              this.SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH,
              this.MAX_SCALE_AMOUNT_NORMAL,
              this.MIN_SCALE_AMOUNT_BELOW_THRESHOLD
            )
          : getLinearPercentOfMaxMatchWithinRange(
              window.innerWidth as number,
              this.MIN_TARGET_VIEW_PORT_WIDTH,
              this.MAX_TARGET_VIEW_PORT_WIDTH,
              this.MAX_SCALE_AMOUNT_NORMAL,
              this.MIN_SCALE_AMOUNT_ABOVE_THRESHOLD
            );

        this.setCardsSize();
        this.setCanvasMetrics();
        this.setCardMetrics();
        this.renderHands();
      }, 250);
  }

  private getStartingPosition(numberOfCardsInHand: number, direction: string) {
    const lengthOfHand =
      this.cardWidth + (numberOfCardsInHand - 1) * this.cardSpacingIncrement;
    // const southStartingPosition = (this.canvasWidth as number - lengthOfHand) / 2;

    // let dimensionToUse = this.canvasHeight;
    if (direction === cardinalDirections[0])
      return -(this.cardWidth - this.cardSpacingIncrement);
    else if (direction === cardinalDirections[2]) return 0;
    // if (direction === cardinalDirections[0] || direction === cardinalDirections[2]) dimensionToUse = this.canvasWidth;

    return ((this.canvasHeight as number) - lengthOfHand) / 2;
  }

  private resetCardsRotationAndPosition() {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i] as paper.Raster;
      card.position.x = this.DEFAULT_CARD_POSITION;
      card.rotation = 0;
    }
  }

  private setCardsSize() {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i] as paper.Raster;
      let currentWidth = card.bounds.width;
      if (card.rotation > 89 && card.rotation <= 91 || card.rotation < -89 && card.rotation > -91) currentWidth = card.bounds.height;
      const desiredWidth = this.isMobile
        ? this.CARD_MOBILE_PIXEL_WIDTH
        : this.CARD_FULL_PIXEL_WIDTH;
      card.scale(desiredWidth / currentWidth);
      card.scale(this.cardScaleAmount);
    }
  }
}
