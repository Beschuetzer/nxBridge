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
  getCharacterFromCardAsNumber,
  getHtmlEntityFromSuitOrCardAsNumber,
  getUserWhoPlayedCard,
  suitsHtmlEntities,
  COLOR_RED_CLASSNAME,
  COLOR_BLACK_CLASSNAME,
} from '@nx-bridge/constants';

import { Store } from '@ngrx/store';
import { AppState, SetCurrentlyViewingDeal } from '@nx-bridge/store';
import { Contract, Deal, Hand, Hands, Seating } from '@nx-bridge/interfaces-and-types';
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
  public contract: Contract | null = null;
  public handsToRender: Hands | null = null;
  public playCount = 0;
  public trickNumber = 0;
  public cardsPlayed: number[] = [];
  public cardPlayWaitDuration = 2500;
  public seating: Seating | null = null;
  public isPlaying = false;
  public scope: paper.PaperScope | null = null;
  public project: paper.Project | null = null;
  private mobileWidthStart = 655;
  public isMobile = window.innerWidth <= this.mobileWidthStart;
  private hasLoadedDeal = false;
  private shouldChangePlaySpeed = false;
  private firstCardPlayed = -1;
  private firstCardPlayer = '';
  private cardPlayerOrder: [string, string, string, string] | null = null;
  private cards: any[] = [];
  private cardsLoaded = 0;
  private cardWidth = -1;
  private cardHeight = -1;
  private cardVisibleOffset = -1;
  private cardSpacingIncrement = -1;
  private DEFAULT_CARD_POSITION = -1000;
  private canvasHeight = -1;
  private canvasWidth = -1;
  private SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH = 1350;
  private MAX_SCALE_AMOUNT_BELOW_THRESHOLD = 0.7;
  private MAX_SCALE_AMOUNT_ABOVE_THRESHOLD = 0.75;
  private MIN_SCALE_AMOUNT_MOBILE = .7;
  private MIN_SCALE_AMOUNT_NORMAL = .5;
  private MIN_TARGET_VIEW_PORT_WIDTH = 600;
  private MAX_TARGET_VIEW_PORT_WIDTH = 1800;
  private CARD_MOBILE_PIXEL_WIDTH = 233;
  private CARD_FULL_PIXEL_WIDTH = 360;
  private cardScaleAmount = -1;
  private redrawTimeout: any;
  private playInterval: any;
  private error = '';

  constructor(
    private store: Store<AppState>,
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  draw () {
    this.setCardScaleAmount();        
    this.setCardsSize();
    this.setCanvasMetrics();
    this.setCardMetrics();
    this.renderHands();
  }

  ngOnInit(): void {
    this.store.select('games').subscribe((gameState) => {
      this.seating = gameState.currentlyViewingGameSeating;
    });

    this.store.select('deals').subscribe((dealState) => {
      if (dealState.currentlyViewingDeal?.bids && !this.hasLoadedDeal) {
        console.log('loading deal------------------------------------------------');
        this.deal = dealState.currentlyViewingDeal;
        if (Object.keys(this.deal).length <= 0) return;

        this.handsToRender = this.deal?.hands;
        this.project = new Project(
          document.querySelector(
            `#${DEAL_PLAYER_CLASSNAME}-canvas`
          ) as HTMLCanvasElement
        );
        this.project.view.onResize = this.onResize.bind(this);

        if (this.cards.length < cardsPerDeck) this.loadCards();
        else {
          this.setCardsSize();
          this.renderHands();
        }
        
        this.renderer.addClass(this.elRef.nativeElement, VISIBLE_CLASSNAME);
        this.hasLoadedDeal = true;
        
      } else if (dealState.currentlyViewingDeal?.bids) {
        this.renderer.addClass(this.elRef.nativeElement, VISIBLE_CLASSNAME);
      }

      if (dealState.currentlyViewingDealContract?.prefix) {
        this.contract = dealState.currentlyViewingDealContract;
      }
    });
  }

  onClose() {
    this.hasLoadedDeal = false;
    this.onPause();
    this.resetCardsPlayed();
    this.resetTable();
    this.renderer.removeClass(this.elRef.nativeElement, VISIBLE_CLASSNAME);
    this.resetCardsRotationAndPosition();
    this.store.dispatch(new SetCurrentlyViewingDeal({} as Deal));
  }

  onNext() {
    this.resetTable();
    this.playCard();
    this.onPause();
  }

  onNextFive() {
    this.resetTable();
    this.playCard(this.playCount + 4);
    this.onPause();
  }

  onPause() {
    this.isPlaying = false;
    clearInterval(this.playInterval);
  }

  onPlay() {
    this.isPlaying = true;
    this.playCard();
    this.playInterval = setInterval(() => {
      if (this.shouldChangePlaySpeed) {
        clearInterval(this.playInterval);
        return this.onPlay();
      }
      this.playCard();
      if (this.playCount === cardsPerDeck) clearInterval(this.playInterval);
    }, this.cardPlayWaitDuration);
  }

  onPrevious() {
    this.onPause();
    this.resetTable();
    this.playCard(this.playCount - 2);
  }

  onPreviousFive() {
    this.onPause();
    this.resetTable();
    this.playCard(this.playCount - 6);
  }

  onSpeedChange(e: Event) {
    
    // debugger;
    // console.log('this.deal =', this.deal);
    // console.log('this.cardSpacingIncrement =', this.cardSpacingIncrement);

    this.cardPlayWaitDuration = +(e.target as HTMLInputElement)?.value * 1000;
    console.log('this.cardPlayWaitDuration =', this.cardPlayWaitDuration);
    if (this.isPlaying) this.shouldChangePlaySpeed = true;
    // clearInterval(this.playInterval);
    // this.onPlay()
  }

  onStop() {
    this.onPause();
    this.resetTable();
    this.onPause();
    this.resetCardsPlayed();
  }

  private playCard(nthCard = this.playCount) {
    const cardPlayOrder = this.deal?.cardPlayOrder;
    if (!this.deal || !cardPlayOrder || cardPlayOrder.length < cardsPerDeck) return;

    if (nthCard >= cardsPerDeck) return this.onPause();
    if (nthCard === -2 || nthCard === 51) this.cardsPlayed = flatten(cardPlayOrder);
    else if (nthCard < -2) this.cardsPlayed = flatten(cardPlayOrder.slice(0, nthCard + 2) as number[]);
    else this.cardsPlayed = flatten(cardPlayOrder.slice(0, nthCard + 1) as number[]);

    this.playCount = nthCard + 1;
    this.displayCardsInTable();
    
    console.log('nthCard =', nthCard);
    console.log('this.cardsPlayed =', this.cardsPlayed);
  }

  private displayCardsInTable() {
    this.setFirstCardPlayedAndPlayer();
    this.setCardPlayOrderAsDirections();

    if ((this.cardsPlayed.length - 1) % 4 === 0) this.resetTable();

    const currentTrick = this.getCurrentTrick();
    console.log('this.deal.cardPlayerOrder =', this.deal?.cardPlayerOrder);
    console.log('currentTrick =', currentTrick);

    let cardsDisplayed = 0;
    for (let i = currentTrick.length -1; i >= 0; i--) {
      if (cardsDisplayed === 4) break;
      const card = currentTrick[i];
      this.displayCardInTable(card);
      cardsDisplayed++;
    }
  }

  private getCurrentTrick() {
    const numberOfCardsPlayed = this.cardsPlayed.length;
    this.trickNumber = Math.floor((numberOfCardsPlayed - 1) / 4) + 1;
    const startIndex = (this.trickNumber - 1) * 4;
    const endIndex = startIndex + 4;

    if (endIndex > numberOfCardsPlayed - 1) return this.cardsPlayed.slice(startIndex);
    else return this.cardsPlayed.slice(startIndex, endIndex);
    return this.cardsPlayed.slice(startIndex, endIndex);
  }

  private displayCardInTable(cardAsNumber: number) {
    const numberToUse = getCharacterFromCardAsNumber(cardAsNumber);
    const suitHtmlEntity = getHtmlEntityFromSuitOrCardAsNumber(cardAsNumber);
    const userWhoPlayedCard = getUserWhoPlayedCard(this.deal?.hands as Hands, cardAsNumber);
    const directionToUse = getDirectionFromSeating(this.seating as Seating, userWhoPlayedCard);

    this.setDirectionContent(numberToUse, suitHtmlEntity, directionToUse);
  }

  private setFirstCardPlayedAndPlayer() {
    if (this.firstCardPlayed === -1) this.firstCardPlayed = flatten(this.deal?.cardPlayOrder)[0];
    this.firstCardPlayer = getUserWhoPlayedCard(this.deal?.hands as Hands, this.firstCardPlayed);
  }

  private setCardPlayOrderAsDirections() {
    const directionOfPersonWhoPlayedFirst = getDirectionFromSeating(this.seating as Seating, this.firstCardPlayer);
    const index = cardinalDirections.indexOf(directionOfPersonWhoPlayedFirst);
    this.cardPlayerOrder = [...cardinalDirections.slice(index), ...cardinalDirections.slice(0, index)] as [string, string, string, string];
  }

  private setDirectionContent(number: string | number, suitHtmlEntity: string, direction: string) {
    const numberElement = document.querySelector(`.${DEAL_PLAYER_CLASSNAME}__played-${direction}-number`);
    const suitEntityElement = document.querySelector(`.${DEAL_PLAYER_CLASSNAME}__played-${direction}-suit`);
    
    if (!numberElement || !suitEntityElement) return;

    let colorClass = COLOR_RED_CLASSNAME;
    if (suitHtmlEntity === suitsHtmlEntities[0] || suitHtmlEntity === suitsHtmlEntities[3]) colorClass = COLOR_BLACK_CLASSNAME;
    this.renderer.removeClass(numberElement, COLOR_BLACK_CLASSNAME);
    this.renderer.removeClass(suitEntityElement, COLOR_BLACK_CLASSNAME);
    this.renderer.removeClass(numberElement, COLOR_RED_CLASSNAME);
    this.renderer.removeClass(suitEntityElement, COLOR_RED_CLASSNAME);
    this.renderer.addClass(numberElement, colorClass)
    this.renderer.addClass(suitEntityElement, colorClass)
    this.renderer.setProperty(numberElement, 'innerHTML', number);
    this.renderer.setProperty(suitEntityElement, 'innerHTML', suitHtmlEntity);
  }

  private resetTable() {
    for (let i = 0; i < cardinalDirections.length; i++) {
      const direction = cardinalDirections[i];
      this.setDirectionContent('', '', direction);
    }
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
      this.draw();
      this.cardsLoaded = 0;
    }
  }

  private setCardMetrics() {
    const cardZero = this.cards[0] as paper.Raster;
    if (cardZero?.rotation === undefined) return;
    const roundedRotation = Math.round(cardZero.rotation);
    this.cardWidth =
      roundedRotation === 0 || roundedRotation === 180
        ? cardZero.bounds.width
        : cardZero.bounds.height;
    this.cardHeight = this.cardWidth * 1.5;
    this.cardVisibleOffset = this.cardHeight / 4 - 2.5;
    this.cardSpacingIncrement = this.cardWidth / 6;
  }

  private setCanvasMetrics() {
    const canvasEl = document.getElementById(`${DEAL_PLAYER_CLASSNAME}-canvas`);
    const canvasBounds = canvasEl?.getBoundingClientRect() as DOMRect;
    this.canvasHeight = canvasBounds.height as number;
    this.canvasWidth = canvasBounds.width as number;
  }

  private renderHands() {
    const handsWithDirectionAsKey: Hands = {};

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

          handsWithDirectionAsKey[usersDirection] = usersHand;
        } catch (err) {
          this.error = err;
          this.resetCardsRotationAndPosition();
          console.error('err =', err);
        }
      }
    }

    if (handsWithDirectionAsKey.east)
      this.renderHand(handsWithDirectionAsKey.east, cardinalDirections[1]);
    if (handsWithDirectionAsKey.west)
      this.renderHand(handsWithDirectionAsKey.west, cardinalDirections[3]);
    if (handsWithDirectionAsKey.north)
      this.renderHand(handsWithDirectionAsKey.north, cardinalDirections[0]);
    if (handsWithDirectionAsKey.south)
      this.renderHand(handsWithDirectionAsKey.south, cardinalDirections[2]);
  }

  private renderHand(hand: Hand, direction: string) {
    if (this.cardSpacingIncrement === -1) return;
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
        this.setNorthCard(cardAsRaster, i, startingPosition);
      else if (direction === cardinalDirections[1])
        this.setEastCard(cardAsRaster, i, startingPosition);
      else if (direction === cardinalDirections[2])
        this.setSouthCard(cardAsRaster, i, startingPosition);
      else if (direction === cardinalDirections[3])
        this.setWestCard(cardAsRaster, i, startingPosition);

      this.project?.activeLayer.addChild(cardAsRaster);
    }

    if (
      direction === cardinalDirections[0] ||
      direction === cardinalDirections[1]
    )
      this.reverseHandLayering(cardsInHand);
  }

  private setNorthCard(
    cardAsRaster: paper.Raster,
    nthCard: number,
    startingPosition: number
  ) {
    cardAsRaster.position.x =
      startingPosition +
      this.cardWidth / 2 +
      this.cardSpacingIncrement * nthCard;
    cardAsRaster.position.y = -this.cardVisibleOffset;
  }

  private setSouthCard(
    cardAsRaster: paper.Raster,
    nthCard: number,
    startingPosition: number
  ) {
    cardAsRaster.position.x =
      startingPosition +
      this.cardWidth / 2 +
      this.cardSpacingIncrement * nthCard;
    cardAsRaster.position.y =
      (this.canvasHeight as number) + this.cardVisibleOffset;
  }

  private setEastCard(
    cardAsRaster: paper.Raster,
    nthCard: number,
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

  private setWestCard(
    cardAsRaster: paper.Raster,
    nthCard: number,
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
      this.draw();
    }, 250);
  }

  private getStartingPosition(numberOfCardsInHand: number, direction: string) {
    let lengthOfHand =
      this.cardWidth + (numberOfCardsInHand - 1) * this.cardSpacingIncrement;

    let dimensionToUse = this.canvasWidth;
    let spaceUsedByTopAndBottomHands = 0;
    let usableSpace = this.canvasWidth;

    if (
      direction === cardinalDirections[1] ||
      direction === cardinalDirections[3]
    ) {
      dimensionToUse = this.canvasHeight;
      spaceUsedByTopAndBottomHands = this.cardVisibleOffset * 2;
      usableSpace = dimensionToUse - spaceUsedByTopAndBottomHands;
    }

    let usedSpace = spaceUsedByTopAndBottomHands + lengthOfHand;
    if (usableSpace >= lengthOfHand)
      if (direction === cardinalDirections[0] || direction === cardinalDirections[2]) return (
        ((dimensionToUse as number) - usedSpace) / 2
        
      );
      else return this.cardVisibleOffset + ((dimensionToUse as number) - usedSpace) / 2;
    else {
      lengthOfHand = numberOfCardsInHand * this.cardSpacingIncrement;
      usedSpace = this.cardVisibleOffset * 2 + lengthOfHand;
      if (
        direction === cardinalDirections[0] ||
        direction === cardinalDirections[1]
      ) {
        return (
          this.cardVisibleOffset +
          ((dimensionToUse as number) - usedSpace) / 2 -
          (this.cardWidth - this.cardSpacingIncrement)
        );
      } else if (
        direction === cardinalDirections[2] ||
        direction === cardinalDirections[3]
      ) {
        return (
          this.cardVisibleOffset + ((dimensionToUse as number) - usedSpace) / 2
        );
      }
    }

    throw new Error('Invalid direction in getCalculatedStart');
  }

  private resetCardsRotationAndPosition() {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i] as paper.Raster;
      card.position.x = this.DEFAULT_CARD_POSITION;
      card.rotation = 0;
    }
  }

  private setCardsSize(desiredWidth = this.isMobile
    ? this.CARD_MOBILE_PIXEL_WIDTH
    : this.CARD_FULL_PIXEL_WIDTH) {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i] as paper.Raster;
      let currentWidth = card.bounds.width;
      if (
        (card.rotation > 89 && card.rotation <= 91) ||
        (card.rotation < -89 && card.rotation > -91)
      )
        currentWidth = card.bounds.height;
     
      card.scale(desiredWidth / currentWidth);
      card.scale(this.cardScaleAmount);
    }
  }

  private setCardScaleAmount() {
    //two dimensions
    let smallerDimension = this.canvasWidth;
    const heightDimension = this.canvasHeight - 2 * this.cardVisibleOffset;
    if (heightDimension < smallerDimension) smallerDimension = heightDimension;


    const desiredCardwith = 6/13 * smallerDimension;
    // this.setCardsSize()

    this.cardScaleAmount = .7;
  }
}
