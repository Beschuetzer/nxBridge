import { Injectable } from '@angular/core';
import * as paper from 'paper';
import {
  cardinalDirections,
  cardsPerDeck,
  cardsPerHand,
  createHandArrayFromFlatArray,
  DEAL_PLAYER_CLASSNAME,
  flatten,
  getDirectionFromSeating,
  getLinearPercentOfMaxMatchWithinRange,
  getUserWhoPlayedCard,
  MOBILE_START_WIDTH,
  suitsAsCapitalizedStrings,
} from '@nx-bridge/constants';
import {
  DealRelevant,
  Hand,
  Hands,
  ReducerNames,
  Seating,
} from '@nx-bridge/interfaces-and-types';
import { Store } from '@ngrx/store';
import { AppState } from '@nx-bridge/store';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DealPlayerService {
  public firstCardPlayed = -1;
  public firstCardPlayer = '';
  public seating: Seating | null = null;
  public playInterval: any;
  public keepCardsCentered = false;
  public deal: DealRelevant | null = null;
  public cardsPlayed: number[] = [];
  public playCount = 0;
  public scope: paper.PaperScope | null = null;
  public project: paper.Project | null = null;
  public cards: paper.Raster[] = [];
  public cardPlayerOrder: [string, string, string, string] | null = null;
  public handsToRender: Hands | null = null;
  public SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH = 1350;
  public hasLoadedDeal = false;

  private cardWidth = -1;
  private cardHeight = -1;
  private cardVisibleOffset = -1;
  private cardSpacingIncrement = -1;
  private canvasHeight = -1;
  private canvasWidth = -1;
  private cardsLoaded = 0;
  private DEFAULT_CARD_POSITION = -1000;
  private CARD_MOBILE_PIXEL_WIDTH = 233;
  private CARD_FULL_PIXEL_WIDTH = 360;
  private MAX_SCALE_AMOUNT_BELOW_THRESHOLD = 0.7;
  private MAX_SCALE_AMOUNT_ABOVE_THRESHOLD = 0.75;
  private MIN_SCALE_AMOUNT_MOBILE = 0.7;
  private MIN_SCALE_AMOUNT_NORMAL = 0.5;
  private MIN_TARGET_VIEW_PORT_WIDTH = 600;
  private MAX_TARGET_VIEW_PORT_WIDTH = 1800;
  private SMALL_VIEWPORT_THRESHOLD = 400;
  private LARGE_VIEWPORT_THRESHOLD = this
    .SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH;
  private SMALL_VIEWPORT_OFFSET = -1;
  private LARGE_VIEWPORT_OFFSET = -1;
  public isMobile = window.innerWidth <= MOBILE_START_WIDTH;
  private cardScaleAmount = this.isMobile
    ? this.MIN_SCALE_AMOUNT_MOBILE
    : window.innerWidth < this.SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH
    ? getLinearPercentOfMaxMatchWithinRange(
        window.innerWidth as number,
        MOBILE_START_WIDTH,
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

  constructor(
    private store: Store<AppState> // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {}

  getCorrectlyArrangedHand(hand: number[], direction: string) {
    if (
      direction === cardinalDirections[0] ||
      direction === cardinalDirections[1]
    )
      return hand.reverse();
    return hand;
  }

  getHandWithTrumpOnLeft(hand: Hand) {
    //note: hand will be in order spades, hearts, clubs, diamonds
    let contract = '';
    this.store
      .select(ReducerNames.deals)
      .pipe(take(1))
      .subscribe((dealState) => {
        contract = dealState.currentlyViewingDeal.contract;
      });

    if (!contract) return hand;

    const possibleContractSuits = [
      ...suitsAsCapitalizedStrings.map((suit) =>
        suit.substr(0, suit.length - 1).toLowerCase()
      ),
      'no trump',
    ];
    const suitIndex = possibleContractSuits.findIndex((suit) => {
      const regExp = new RegExp(suit, 'i');
      return contract?.match(regExp);
    });

    const spades = [...hand[0]];
    const hearts = [...hand[1]];
    const clubs = [...hand[2]];
    const diamonds = [...hand[3]];

    if (suitIndex === 0) {
      //clubs
      if (!hearts || hearts.length === 0)
        return [clubs, diamonds, spades, hearts];
      return [clubs, hearts, spades, diamonds];
    } else if (suitIndex === 1) {
      //diamonds
      if (!spades || spades.length === 0)
        return [diamonds, clubs, hearts, spades];
      return [diamonds, spades, hearts, clubs];
    } else if (suitIndex === 2) {
      //hearts
      if (!spades || spades.length === 0)
        return [hearts, clubs, diamonds, spades];
      return [hearts, spades, diamonds, clubs];
    } else if (suitIndex === 3) {
      if (!hearts || hearts.length === 0)
        return [spades, diamonds, clubs, hearts];
      return hand;
    } else if (suitIndex === 4) {
      if (!hearts || hearts.length === 0)
        return [spades, diamonds, clubs, hearts];
      if (!spades || spades.length === 0)
        return [diamonds, clubs, hearts, spades];
      if (!diamonds || diamonds.length === 0)
        return [spades, hearts, clubs, diamonds];
      if (!clubs || clubs.length === 0)
        return [hearts, spades, diamonds, clubs];
      return hand;
    } else return hand;
  }

  getStartingPosition(numberOfCardsInHand: number, direction: string) {
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

  hideCards(cards: number[]) {
    for (let i = 0; i < cards.length; i++) {
      const cardAsNumber = cards[i];
      const card = this.cards[cardAsNumber] as paper.Raster;
      card.position.x = this.DEFAULT_CARD_POSITION;
    }
  }

  loadCards() {
    this.cardsLoaded = 0;
    if (this.cards.length > 0) this.removeCards();
    this.cards = [];
    for (let i = 0; i < cardsPerDeck; i++) {
      const newRaster = new paper.Raster(`card-${i}`);
      newRaster.position.x = this.DEFAULT_CARD_POSITION;
      newRaster.scale(this.cardScaleAmount);
      newRaster.onLoad = this.onCardLoad.bind(this);
      this.cards.push(newRaster);
    }
  }

  onCardLoad() {
    this.cardsLoaded += 1;
    if (this.cardsLoaded >= cardsPerDeck) {
      this.setCanvasMetrics();
      this.setCardMetrics();
      this.positionHands();
      this.hasLoadedDeal = true;
    }
  }

  onResize(e: Event) {
    // setTimeout(() => {
    clearTimeout(this.redrawTimeout);

    this.isMobile = window.innerWidth <= MOBILE_START_WIDTH;
    this.redrawTimeout = setTimeout(() => {
      this.cardScaleAmount = this.isMobile
        ? this.MIN_SCALE_AMOUNT_MOBILE
        : window.innerWidth < this.SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH
        ? getLinearPercentOfMaxMatchWithinRange(
            window.innerWidth as number,
            MOBILE_START_WIDTH,
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

      this.setCardsSize();
      this.setCanvasMetrics();
      this.setCardMetrics();
      this.positionHands();
    }, 125);
    // }, 250);
  }

  positionHands() {
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
          this.setCardsRotationAndPosition();
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

  positionHand(hand: Hand, direction: string) {
    if (this.cardSpacingIncrement === -1) return;
    const handWithTrumpOnLeft = this.getHandWithTrumpOnLeft(hand);
    const flatHand = flatten(handWithTrumpOnLeft);
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
        this.setNorthCard(cardAsRaster as paper.Raster, i, startingPosition);
      else if (direction === cardinalDirections[1])
        this.setEastCard(cardAsRaster as paper.Raster, i, startingPosition);
      else if (direction === cardinalDirections[2])
        this.setSouthCard(cardAsRaster as paper.Raster, i, startingPosition);
      else if (direction === cardinalDirections[3])
        this.setWestCard(cardAsRaster as paper.Raster, i, startingPosition);

      this.project?.activeLayer.addChild(cardAsRaster as paper.Raster);
    }

    if (
      direction === cardinalDirections[0] ||
      direction === cardinalDirections[1]
    )
      this.reverseHandLayering(cardsInHand as paper.Raster[]);
  }

  resetCardsPlayed() {
    this.cardsPlayed = [];
    this.playCount = 0;
  }

  removeCards() {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i] as paper.Raster;
      card.remove();
    }
  }

  reverseHandLayering(cards: paper.Raster[]) {
    for (let i = cards.length - 1; i >= 0; i--) {
      const card = cards[i];
      this.project?.activeLayer.addChild(card);
    }
  }

  setCardPlayOrderAsDirections() {
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

  setCardsRotationAndPosition(
    positionToSetCardsTo = 0,
    rotationToSetCardsTo = 0
  ) {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i] as paper.Raster;
      card.position.x = positionToSetCardsTo;
      card.rotation = rotationToSetCardsTo;
    }
  }

  setCardMetrics() {
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
    this.SMALL_VIEWPORT_OFFSET =
      window.innerWidth <= this.SMALL_VIEWPORT_THRESHOLD
        ? this.cardWidth / 16
        : 0;
    this.LARGE_VIEWPORT_OFFSET =
      window.innerWidth >= this.LARGE_VIEWPORT_THRESHOLD
        ? this.cardWidth / 16
        : 0;
  }

  setCanvasMetrics() {
    const canvasEl = document.getElementById(`${DEAL_PLAYER_CLASSNAME}-canvas`);
    const canvasBounds = canvasEl?.getBoundingClientRect() as DOMRect;
    if (!canvasBounds) return;
    this.canvasHeight = canvasBounds.height as number;
    this.canvasWidth = canvasBounds.width as number;
  }

  setNorthCard(
    cardAsRaster: paper.Raster,
    nthCard: number,
    startingPosition: number
  ) {
    cardAsRaster.position.x =
      startingPosition +
      this.cardWidth / 2 +
      this.cardSpacingIncrement * nthCard +
      (this.keepCardsCentered ? 0 : this.SMALL_VIEWPORT_OFFSET);
    cardAsRaster.position.y = -this.cardVisibleOffset;
  }

  setSouthCard(
    cardAsRaster: paper.Raster,
    nthCard: number,
    startingPosition: number
  ) {
    cardAsRaster.position.x =
      startingPosition +
      this.cardWidth / 2 +
      this.cardSpacingIncrement * nthCard +
      (this.keepCardsCentered ? 0 : this.SMALL_VIEWPORT_OFFSET);
    cardAsRaster.position.y =
      (this.canvasHeight as number) + this.cardVisibleOffset;
  }

  setEastCard(
    cardAsRaster: paper.Raster,
    nthCard: number,
    startingPosition: number
  ) {
    cardAsRaster.position.y =
      startingPosition +
      this.cardWidth / 2 +
      this.cardSpacingIncrement * nthCard +
      (this.keepCardsCentered ? 0 : this.LARGE_VIEWPORT_OFFSET * 2);

    cardAsRaster.position.x =
      (this.canvasWidth as number) + this.cardVisibleOffset;
    if (cardAsRaster.rotation > -89.5 || cardAsRaster.rotation < -90.5)
      cardAsRaster.rotate(-90);
  }

  setWestCard(
    cardAsRaster: paper.Raster,
    nthCard: number,
    startingPosition: number
  ) {
    cardAsRaster.position.y =
      startingPosition +
      this.cardWidth / 2 +
      this.cardSpacingIncrement * nthCard -
      (this.keepCardsCentered ? 0 : this.LARGE_VIEWPORT_OFFSET * 0.33);

    cardAsRaster.position.x = -this.cardVisibleOffset;
    if (cardAsRaster.rotation < 89.5 || cardAsRaster.rotation > 90.5)
      cardAsRaster.rotate(90);
  }

  setCardsSize() {
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

  setFirstCardPlayedAndPlayer() {
    if (this.firstCardPlayed === -1)
      this.firstCardPlayed = flatten(this.deal?.cardPlayOrder)[0];
    this.firstCardPlayer = getUserWhoPlayedCard(
      this.deal?.hands as Hands,
      this.firstCardPlayed
    );
  }

  setupProject() {
    this.project = new paper.Project(
      document.querySelector(
        `#${DEAL_PLAYER_CLASSNAME}-canvas`
      ) as HTMLCanvasElement
    );
  }

  updateHands() {
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
}
