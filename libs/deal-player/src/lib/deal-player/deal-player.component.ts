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
  createHandArrayFromFlatArray,
  cardsPerHand,
} from '@nx-bridge/constants';

import { Store } from '@ngrx/store';
import {
  AppState,
  SetCurrentlyViewingDeal,
  CurrentlyViewingDeal,
} from '@nx-bridge/store';
import {
  Contract,
  Deal,
  Hand,
  Hands,
  Seating,
} from '@nx-bridge/interfaces-and-types';
import * as paper from 'paper';
import { Project, Raster } from 'paper/dist/paper-core';
import { DealPlayerService } from '../deal-player.service';

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
  public dealNumber: number | string = -1;
  public contract: Contract | null = null;
  public declarer = '';
  public handsToRender: Hands | null = null;
  public playCount = 0;
  public trickNumber = 0;
  public keepCardsCentered = false;
  public cardsPlayed: number[] = [];
  public cardPlayWaitDuration = 2500;
  public seating: Seating | null = null;
  public name: string | null = null;
  public date: number | string | null = null;
  public isPlaying = false;
  public scope: paper.PaperScope | null = null;
  public project: paper.Project | null = null;
  public biddingTable = '';
  private mobileWidthStart = 655;
  public isMobile = window.innerWidth <= this.mobileWidthStart;
  public summaryPre = '';
  public summaryNumber = '';
  public summaryPost = '';
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
  private MIN_SCALE_AMOUNT_MOBILE = 0.7;
  private MIN_SCALE_AMOUNT_NORMAL = 0.5;
  private MIN_TARGET_VIEW_PORT_WIDTH = 600;
  private MAX_TARGET_VIEW_PORT_WIDTH = 1800;
  private CARD_MOBILE_PIXEL_WIDTH = 233;
  private CARD_FULL_PIXEL_WIDTH = 360;
  private cardScaleAmount = this.isMobile
    ? this.MIN_SCALE_AMOUNT_MOBILE
    : window.innerWidth < this.SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH
    ? getLinearPercentOfMaxMatchWithinRange(
        window.innerWidth as number,
        this.mobileWidthStart,
        this.SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH,
        this.MIN_SCALE_AMOUNT_NORMAL,
        this.MAX_SCALE_AMOUNT_BELOW_THRESHOLD
      )
    : getLinearPercentOfMaxMatchWithinRange(
        window.innerWidth as number,
        this.MIN_TARGET_VIEW_PORT_WIDTH,
        this.MAX_TARGET_VIEW_PORT_WIDTH,
        this.MIN_SCALE_AMOUNT_NORMAL,
        this.MAX_SCALE_AMOUNT_ABOVE_THRESHOLD
      );
  private redrawTimeout: any;
  private playInterval: any;
  private error = '';

  constructor(
    private store: Store<AppState>,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private dealPlayerService: DealPlayerService,
  ) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.onResize.bind(this));

    this.store.select('games').subscribe((gameState) => {
      this.seating = gameState.currentlyViewingGame.seating;
      this.name = gameState.currentlyViewingGame.name;
      this.date = gameState.currentlyViewingGame.date;
    });

    this.store.select('deals').subscribe((dealState) => {
      if (dealState.currentlyViewingDeal?.bids && !this.hasLoadedDeal) {
        this.deal = dealState.currentlyViewingDeal;
        this.declarer = dealState.currentlyViewingDeal.declarer;
        this.dealNumber = dealState.currentlyViewingDeal.dealNumber;
        this.biddingTable = dealState.currentlyViewingDeal.biddingTable;
        this.summaryPre = dealState.currentlyViewingDeal.summaryPre;
        this.summaryNumber = dealState.currentlyViewingDeal.summaryNumber;
        this.summaryPost = dealState.currentlyViewingDeal.summaryPost;

        if (Object.keys(this.deal).length <= 0) return;
        
        this.handsToRender = this.deal?.hands;
        this.project = new Project(
          document.querySelector(
            `#${DEAL_PLAYER_CLASSNAME}-canvas`
          ) as HTMLCanvasElement
        );

        if (this.cards.length < cardsPerDeck) this.loadCards();
        else {
          this.positionHands();
        }

        this.renderer.addClass(this.elRef.nativeElement, VISIBLE_CLASSNAME);
        this.hasLoadedDeal = true;
        this.renderRoundWinnersTable();
      } else if (dealState.currentlyViewingDeal?.bids) {
        this.renderer.addClass(this.elRef.nativeElement, VISIBLE_CLASSNAME);
      }

      if (dealState.currentlyViewingDealContract?.prefix) {
        this.contract = dealState.currentlyViewingDealContract;
        this.changeContractColor();
      }
    });
  }

  onCenteredChange(e: Event) {
    const checkbox = (e.currentTarget || e.target) as HTMLInputElement;
    this.keepCardsCentered = checkbox.checked;
  }

  onClose() {
    this.hasLoadedDeal = false;
    this.onPause();
    this.resetCardsPlayed();
    this.resetTable();
    this.renderer.removeClass(this.elRef.nativeElement, VISIBLE_CLASSNAME);
    console.log('onClose------------------------------------------------');
    this.dealPlayerService.setCardsRotationAndPosition(this.cards);
    this.store.dispatch(
      new SetCurrentlyViewingDeal({} as CurrentlyViewingDeal)
    );
    this.resetVariables();
  }

  onNext() {
    this.resetTable();
    this.playCard();
    this.onPause();
  }

  onNextFour() {
    this.resetTable();
    this.playCard(this.playCount + 3);
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

  onPreviousFour() {
    this.onPause();
    this.resetTable();
    this.playCard(this.playCount - 5);
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

  onRestart() {
    this.onPause();
    this.resetTable();
    this.onPause();
    this.resetCardsPlayed();
    this.trickNumber = 0;
  }

  private playCard(nthCard = this.playCount) {
    const cardPlayOrder = this.deal?.cardPlayOrder;
    if (!this.deal || !cardPlayOrder || cardPlayOrder.length < cardsPerDeck)
      return;

    if (nthCard >= cardsPerDeck) return this.onPause();
    if (nthCard === -2 || nthCard === 51)
      this.cardsPlayed = flatten(cardPlayOrder);
    else if (nthCard < -2)
      this.cardsPlayed = flatten(
        cardPlayOrder.slice(0, nthCard + 2) as number[]
      );
    else
      this.cardsPlayed = flatten(
        cardPlayOrder.slice(0, nthCard + 1) as number[]
      );

    this.playCount = nthCard + 1;
    this.displayCardsInTable();
    this.updateHands();
  }

  private updateHands() {
    let removalCount = 0;
    const cardsRemoved: number[] = [];
    const tempHands: { [key: string]: Hand } = {};
    for (const username in this.handsToRender) {
      if (Object.prototype.hasOwnProperty.call(this.handsToRender, username)) {
        const handCopy = [...(this.deal?.hands[username] as Hand)];

        if (removalCount >= this.cardsPlayed.length) {
          tempHands[username] = handCopy as Hand;
          continue;
        }

        const flatHandCopy = flatten(handCopy);

        let isUpdateNecessary = false;
        for (let j = 0; j < this.cardsPlayed.length; j++) {
          const cardPlayed = this.cardsPlayed[j];
          const index = flatHandCopy.indexOf(cardPlayed);
          if (index !== -1) {
            removalCount++;
            isUpdateNecessary = true;
            cardsRemoved.push(cardPlayed);
            flatHandCopy.splice(index, 1);
          }
        }

        let reconstitutedHand = handCopy;
        if (isUpdateNecessary)
          reconstitutedHand = createHandArrayFromFlatArray(flatHandCopy);

        tempHands[username] = reconstitutedHand as Hand;
      }
    }

    this.hideCards(cardsRemoved);
    this.handsToRender = { ...tempHands };
    this.positionHands();
  }

  private displayCardsInTable() {
    this.setFirstCardPlayedAndPlayer();
    this.setCardPlayOrderAsDirections();
    this.renderRoundWinnersTable();

    if ((this.cardsPlayed.length - 1) % 4 === 0) this.resetTable();

    const currentTrick = this.getCurrentTrick();

    let cardsDisplayed = 0;
    for (let i = currentTrick.length - 1; i >= 0; i--) {
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

    if (endIndex > numberOfCardsPlayed - 1)
      return this.cardsPlayed.slice(startIndex);
    else return this.cardsPlayed.slice(startIndex, endIndex);
    return this.cardsPlayed.slice(startIndex, endIndex);
  }

  private displayCardInTable(cardAsNumber: number) {
    let numberToUse = 'N/A';
    let suitHtmlEntity = '';

    if (cardAsNumber !== ('N/A' as any)) {
      numberToUse = getCharacterFromCardAsNumber(cardAsNumber);
      suitHtmlEntity = getHtmlEntityFromSuitOrCardAsNumber(cardAsNumber);
      const userWhoPlayedCard = getUserWhoPlayedCard(
        this.deal?.hands as Hands,
        cardAsNumber
      );
      const directionToUse = getDirectionFromSeating(
        this.seating as Seating,
        userWhoPlayedCard
      );
      return this.setDirectionContent(
        numberToUse,
        suitHtmlEntity,
        directionToUse
      );
    }

    for (let i = 0; i < cardinalDirections.length; i++) {
      const direction = cardinalDirections[i];
      this.setDirectionContent(numberToUse, suitHtmlEntity, direction);
    }
  }

  private setFirstCardPlayedAndPlayer() {
    if (this.firstCardPlayed === -1)
      this.firstCardPlayed = flatten(this.deal?.cardPlayOrder)[0];
    this.firstCardPlayer = getUserWhoPlayedCard(
      this.deal?.hands as Hands,
      this.firstCardPlayed
    );
  }

  private setCardPlayOrderAsDirections() {
    const directionOfPersonWhoPlayedFirst = getDirectionFromSeating(
      this.seating as Seating,
      this.firstCardPlayer
    );
    const index = cardinalDirections.indexOf(directionOfPersonWhoPlayedFirst);
    this.cardPlayerOrder = [
      ...cardinalDirections.slice(index),
      ...cardinalDirections.slice(0, index),
    ] as [string, string, string, string];
  }

  private setDirectionContent(
    number: string | number,
    suitHtmlEntity: string,
    direction: string
  ) {
    const numberElement = document.querySelector(
      `.${DEAL_PLAYER_CLASSNAME}__${direction}-suit-number`
    );
    const suitEntityElement = document.querySelector(
      `.${DEAL_PLAYER_CLASSNAME}__${direction}-suit-entity`
    );

    if (!numberElement || !suitEntityElement) return;

    let colorClass = COLOR_RED_CLASSNAME;
    if (
      suitHtmlEntity === suitsHtmlEntities[0] ||
      suitHtmlEntity === suitsHtmlEntities[3]
    )
      colorClass = COLOR_BLACK_CLASSNAME;
    this.renderer.removeClass(numberElement, COLOR_BLACK_CLASSNAME);
    this.renderer.removeClass(suitEntityElement, COLOR_BLACK_CLASSNAME);
    this.renderer.removeClass(numberElement, COLOR_RED_CLASSNAME);
    this.renderer.removeClass(suitEntityElement, COLOR_RED_CLASSNAME);
    this.renderer.addClass(numberElement, colorClass);
    this.renderer.addClass(suitEntityElement, colorClass);
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
      newRaster.scale(this.cardScaleAmount);
      newRaster.onLoad = this.onCardLoad.bind(this);
      this.cards.push(newRaster);
    }
  }

  private hideCards(cards: number[]) {
    for (let i = 0; i < cards.length; i++) {
      const cardAsNumber = cards[i];
      const card = this.cards[cardAsNumber] as paper.Raster;
      card.position.x = this.DEFAULT_CARD_POSITION;
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
      this.positionHands();
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

  private positionHands() {
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
          this.dealPlayerService.setCardsRotationAndPosition(this.cards);
          console.error('err =', err);
          return;
        }
      }
    }

    if (handsWithDirectionAsKey.east)
      this.positionHand(handsWithDirectionAsKey.east, cardinalDirections[1]);
    if (handsWithDirectionAsKey.west)
      this.positionHand(handsWithDirectionAsKey.west, cardinalDirections[3]);
    if (handsWithDirectionAsKey.north)
      this.positionHand(handsWithDirectionAsKey.north, cardinalDirections[0]);
    if (handsWithDirectionAsKey.south)
      this.positionHand(handsWithDirectionAsKey.south, cardinalDirections[2]);
  }

  private positionHand(hand: Hand, direction: string) {
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
    setTimeout(() => {
      clearTimeout(this.redrawTimeout);

      this.isMobile = window.innerWidth <= this.mobileWidthStart;
      this.redrawTimeout = setTimeout(() => {
        this.cardScaleAmount = this.isMobile
          ? this.MIN_SCALE_AMOUNT_MOBILE
          : window.innerWidth < this.SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH
          ? getLinearPercentOfMaxMatchWithinRange(
              window.innerWidth as number,
              this.mobileWidthStart,
              this.SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH,
              this.MIN_SCALE_AMOUNT_NORMAL,
              this.MAX_SCALE_AMOUNT_BELOW_THRESHOLD
            )
          : getLinearPercentOfMaxMatchWithinRange(
              window.innerWidth as number,
              this.MIN_TARGET_VIEW_PORT_WIDTH,
              this.MAX_TARGET_VIEW_PORT_WIDTH,
              this.MIN_SCALE_AMOUNT_NORMAL,
              this.MAX_SCALE_AMOUNT_ABOVE_THRESHOLD
            );
            
        this.dealPlayerService.setCardsRotationAndPosition(this.cards);
        this.setCardsSize();
        this.setCanvasMetrics();
        this.setCardMetrics();
        this.positionHands();
      }, 250);
    }, 250);
  }

  private getStartingPosition(numberOfCardsInHand: number, direction: string) {
    // let lengthOfHand = this.cardWidth + (numberOfCardsInHand - 1) * this.cardSpacingIncrement;
    const lengthOfFullHand = this.cardWidth + 12 * this.cardSpacingIncrement;

    let dimensionToUse = this.canvasWidth;
    let spaceUsedByTopAndBottomHands = 0;
    // let usableSpace = this.canvasWidth;

    if (
      direction === cardinalDirections[1] ||
      direction === cardinalDirections[3]
    ) {
      dimensionToUse = this.canvasHeight;
      spaceUsedByTopAndBottomHands = this.cardVisibleOffset * 2;
      // usableSpace = dimensionToUse - spaceUsedByTopAndBottomHands;
    }

    // let usedSpace = spaceUsedByTopAndBottomHands + lengthOfHand;

    //note: removed this as it caused unpleasant jumping
    // if (usableSpace >= lengthOfHand)
    //   if (direction === cardinalDirections[0] || direction === cardinalDirections[2]) return (
    //     ((dimensionToUse as number) - usedSpace) / 2

    //   );
    //   else return this.cardVisibleOffset + ((dimensionToUse as number) - usedSpace) / 2;
    // else {

    // }
    const lengthOfHand = numberOfCardsInHand * this.cardSpacingIncrement;
    const usedSpace = this.cardVisibleOffset * 2 + lengthOfHand;
    const usedSpaceOfFullHand = spaceUsedByTopAndBottomHands + lengthOfFullHand;
    const missingCardAdjustment =
      (cardsPerHand - numberOfCardsInHand) * this.cardSpacingIncrement;

    if (this.keepCardsCentered) {
      if (direction === cardinalDirections[0])
        return (
          this.cardVisibleOffset +
          ((dimensionToUse as number) - usedSpace) / 2 -
          (this.cardWidth - this.cardSpacingIncrement)
        );
      else if (direction === cardinalDirections[1])
        return (
          this.cardVisibleOffset +
          ((dimensionToUse as number) - usedSpace) / 2 -
          (this.cardWidth - this.cardSpacingIncrement)
        );
      else if (direction === cardinalDirections[2])
        return (
          this.cardVisibleOffset + ((dimensionToUse as number) - usedSpace) / 2
        );
      else if (direction === cardinalDirections[3])
        return (
          this.cardVisibleOffset + ((dimensionToUse as number) - usedSpace) / 2
        );
    } else {
      if (direction === cardinalDirections[0])
        return (
          this.cardVisibleOffset +
          ((dimensionToUse as number) - usedSpaceOfFullHand) / 2 -
          (this.cardWidth - this.cardSpacingIncrement) +
          missingCardAdjustment
        );
      else if (direction === cardinalDirections[1])
        return (
          2 * this.cardVisibleOffset +
          ((dimensionToUse as number) - usedSpaceOfFullHand) / 2 -
          (this.cardWidth - this.cardSpacingIncrement) +
          missingCardAdjustment
        );
      else if (direction === cardinalDirections[2])
        return (
          this.cardVisibleOffset +
          ((dimensionToUse as number) - lengthOfFullHand) / 2
        );
      else if (direction === cardinalDirections[3])
        return (
          this.cardVisibleOffset +
          ((dimensionToUse as number) - lengthOfFullHand) / 2
        );
    }

    throw new Error('Invalid direction in getCalculatedStart');
  }

  private setCardsSize() {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i] as paper.Raster;
      let currentWidth = card.bounds.width;
      if (
        (card.rotation > 89 && card.rotation <= 91) ||
        (card.rotation < -89 && card.rotation > -91)
      )
        currentWidth = card.bounds.height;
      const desiredWidth = this.isMobile
        ? this.CARD_MOBILE_PIXEL_WIDTH
        : this.CARD_FULL_PIXEL_WIDTH;
      card.scale(desiredWidth / currentWidth);
      card.scale(this.cardScaleAmount);
    }
  }

  private changeContractColor() {
    const contract = document.querySelector(
      `.${DEAL_PLAYER_CLASSNAME}__contract`
    ) as HTMLElement;

    let classToAdd = COLOR_BLACK_CLASSNAME;
    if (
      this.contract?.htmlEntity === suitsHtmlEntities[1] ||
      this.contract?.htmlEntity === suitsHtmlEntities[2]
    )
      classToAdd = COLOR_RED_CLASSNAME;

    this.renderer.removeClass(contract.children[1], COLOR_BLACK_CLASSNAME);
    this.renderer.removeClass(contract.children[1], COLOR_RED_CLASSNAME);
    this.renderer.addClass(contract.children[1], classToAdd);
  }

  private resetVariables() {
    // this.cardHeight = -1;
    // this.cardWidth = -1;
    // this.canvasWidth = -1;
    // this.canvasHeight = -1;
    // this.cardScaleAmount = -1;
    // this.cardSpacingIncrement = -1;
    // this.cardVisibleOffset = -1;
    // this.playCount = 0;
    // this.trickNumber = 0;
    // this.cardsPlayed = [];
    // this.cardPlayWaitDuration = 2500;
    // this.seating = null;
    // this.name = null;
    // this.date = null;
    // this.isPlaying = false;
    // this.scope = null;
    // this.project = null;
  }

  private renderRoundWinnersTable() {
    const headerLeftContent = 'Trick #';
    const headerRightContent = 'Taker';
    const sectionHeaderContent = 'Trick Takers:';
    const target = document.querySelector(
      `.${DEAL_PLAYER_CLASSNAME}__round-winners`
    ) as HTMLElement;
    const numberOfWinnersToShow = Math.floor(this.cardsPlayed.length / 4);

    this.renderer.setProperty(target, 'innerHTML', '');
    const table = this.renderer.createElement('div');
    const sectionHeader = this.renderer.createElement('div');
    const leftTableHeader = this.renderer.createElement('div');
    const rightTableHeader = this.renderer.createElement('div');

    this.renderer.addClass(
      table,
      `${DEAL_PLAYER_CLASSNAME}__round-winners-table`
    );

    this.renderer.addClass(
      sectionHeader,
      `${DEAL_PLAYER_CLASSNAME}__round-winners-header`
    );
    this.renderer.setProperty(sectionHeader, 'innerHTML', sectionHeaderContent);
    this.renderer.setProperty(leftTableHeader, 'innerHTML', headerLeftContent);
    this.renderer.setProperty(
      rightTableHeader,
      'innerHTML',
      headerRightContent
    );
    this.renderer.appendChild(target, sectionHeader);
    this.renderer.appendChild(table, leftTableHeader);
    this.renderer.appendChild(table, rightTableHeader);

    //this.cardPlayerOrder has names of players in sequence of their playing order

    for (let i = 0; i < 13; i++) {
      const roundWinner = (this.deal?.roundWinners as string[][])[i];
      const newDivNumber = this.renderer.createElement('div');
      const newDivName = this.renderer.createElement('div');

      this.renderer.setProperty(newDivNumber, 'innerHTML', i + 1);
      this.renderer.setProperty(
        newDivName,
        'innerHTML',
        i + 1 <= numberOfWinnersToShow ? roundWinner[0] : ''
      );
      this.renderer.appendChild(table, newDivNumber);
      this.renderer.appendChild(table, newDivName);
    }

    this.renderer.appendChild(target, table);
  }
}
