import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
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
  getCharacterFromCardAsNumber,
  getHtmlEntityFromSuitOrCardAsNumber,
  getUserWhoPlayedCard,
  suitsHtmlEntities,
  COLOR_RED_CLASSNAME,
  COLOR_BLACK_CLASSNAME,
  MOBILE_START_WIDTH,
  HEIGHT_AUTO_CLASSNAME,
  NOT_AVAILABLE_STRING,
  checkForParentOfType,
} from '@nx-bridge/constants';

import { Store } from '@ngrx/store';
import {
  AppState,
  SetCurrentlyViewingDeal,
  CurrentlyViewingDeal,
  DealState,
  GameState,
} from '@nx-bridge/store';
import {
  Contract,
  Hands,
  ReducerNames,
  Seating,
} from '@nx-bridge/interfaces-and-types';
import { DealPlayerService } from '../deal-player.service';
import { debug } from 'node:console';

@Component({
  selector: 'nx-bridge-deal-player',
  templateUrl: './deal-player.component.html',
  styleUrls: ['./deal-player.component.scss'],
})
export class DealPlayerComponent implements OnInit {
  @HostListener('click', ['$event']) onClick(e: Event) {
    this.onHostClick(e);
  }
  @HostBinding(`class.${DEAL_PLAYER_CLASSNAME}`) get classname() {
    return true;
  }
  public DEAL_PLAYER_CLASSNAME = DEAL_PLAYER_CLASSNAME;
  public DISPLAY_NONE_CLASSNAME = DISPLAY_NONE_CLASSNAME;
  public dealNumber: number | string = -1;
  public contract: Contract | null = null;
  public declarer = '';
  public trickNumber = 0;
  public keepCardsCentered = false;
  public cardPlayWaitDuration = 2500;
  public seating: Seating | null = null;
  public name: string | null = null;
  public date: number | string | null = null;
  public biddingTable = '';
  public summaryPre = '';
  public summaryNumber = '';
  public summaryPost = '';
  public error = '';
  private hasLoadedDeal = false;
  private shouldChangePlaySpeed = false;
  private closeWhenResizedTimeout: any;

  public isMobile = window.innerWidth <= MOBILE_START_WIDTH;
  public isPlaying = false;

  constructor(
    private store: Store<AppState>,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private dealPlayerService: DealPlayerService
  ) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.setHeightAuto.bind(this));
    window.addEventListener(
      'resize',
      this.dealPlayerService.onResize.bind(this.dealPlayerService)
    );

    this.store.select(ReducerNames.games).subscribe((gameState) => {
      this.handleGamesUpdates(gameState);
    });

    this.store.select(ReducerNames.deals).subscribe((dealState) => {
      this.handleDealsUpdates(dealState);
      this.addHeightAuto();
    });
  }

  onCenteredChange(e: Event) {
    const checkbox = (e.currentTarget || e.target) as HTMLInputElement;
    const newValue = checkbox.checked;

    this.keepCardsCentered = newValue;
    this.dealPlayerService.keepCardsCentered = newValue;
  }

  onHostClick(e: Event) {
    const currentTarget = e.target as HTMLElement;

    let isChildClick = true;
    if (currentTarget.localName !== 'svg' && currentTarget.localName !== 'use')
      isChildClick = checkForParentOfType(
        currentTarget,
        'nx-bridge-deal-player',
        DEAL_PLAYER_CLASSNAME
      );

    if (!isChildClick) this.closeWindow();
  }

  onClose() {
    this.closeWindow();
  }

  onNext() {
    this.resetTable();
    this.playCard();
    this.onPause();
  }

  onNextFour() {
    this.resetTable();
    const desiredPlayCount = this.dealPlayerService.playCount + 3;
    this.playCard(desiredPlayCount >= 51 ? 51 : desiredPlayCount);
    this.onPause();
  }

  onPause() {
    this.isPlaying = false;
    clearInterval(this.dealPlayerService.playInterval);
  }

  onPlay() {
    this.isPlaying = true;
    this.playCard();
    this.dealPlayerService.playInterval = setInterval(() => {
      if (this.shouldChangePlaySpeed) {
        clearInterval(this.dealPlayerService.playInterval);
        return this.onPlay();
      }
      this.playCard();
      if (this.dealPlayerService.playCount === cardsPerDeck)
        clearInterval(this.dealPlayerService.playInterval);
    }, this.cardPlayWaitDuration);
  }

  onPrevious() {
    this.onPause();
    this.resetTable();
    this.playCard(this.dealPlayerService.playCount - 2);
  }

  onPreviousFour() {
    this.onPause();
    this.resetTable();
    this.playCard(this.dealPlayerService.playCount - 5);
  }

  onSpeedChange(e: Event) {
    this.cardPlayWaitDuration = +(e.target as HTMLInputElement)?.value * 1000;
    console.log('this.cardPlayWaitDuration =', this.cardPlayWaitDuration);
    if (this.isPlaying) this.shouldChangePlaySpeed = true;
  }

  onRestart() {
    this.resetTable();
    this.onPause();
    this.dealPlayerService.resetCardsPlayed();
    this.trickNumber = 0;
    this.playCard(-1);
  }

  setHeightAuto() {
    if (
      window.innerWidth >=
      this.dealPlayerService.SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH
    )
      this.removeHeightAuto();
  }

  private addHeightAuto() {
    const dealPlayer = this.elRef.nativeElement as HTMLElement;
    if (
      !dealPlayer.classList.contains(VISIBLE_CLASSNAME) ||
      this.dealPlayerService.SCALE_AMOUNT_THRESHOLD_VIEW_PORT_WIDTH <=
        window.innerWidth
    )
      return;

    this.renderer.addClass(dealPlayer, HEIGHT_AUTO_CLASSNAME);
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

    if (!contract?.children[1]) return;
    this.renderer.removeClass(contract.children[1], COLOR_BLACK_CLASSNAME);
    this.renderer.removeClass(contract.children[1], COLOR_RED_CLASSNAME);
    this.renderer.addClass(contract.children[1], classToAdd);
  }

  private closeWindow() {
    this.hasLoadedDeal = false;
    this.onPause();
    this.dealPlayerService.resetCardsPlayed();
    this.resetTable();
    this.renderer.removeClass(this.elRef.nativeElement, VISIBLE_CLASSNAME);
    this.dealPlayerService.setCardsRotationAndPosition();
    this.store.dispatch(
      new SetCurrentlyViewingDeal({} as CurrentlyViewingDeal)
    );
    this.resetVariables();
    this.removeHeightAuto();
  }

  private displayCardInTable(cardAsNumber: number) {
    let numberToUse = NOT_AVAILABLE_STRING;
    let suitHtmlEntity = '';

    if (cardAsNumber !== (NOT_AVAILABLE_STRING as any)) {
      numberToUse = getCharacterFromCardAsNumber(cardAsNumber);
      suitHtmlEntity = getHtmlEntityFromSuitOrCardAsNumber(cardAsNumber);
      const userWhoPlayedCard = getUserWhoPlayedCard(
        this.dealPlayerService.deal?.hands as Hands,
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

  private displayCardsInTable() {
    this.dealPlayerService.setFirstCardPlayedAndPlayer();
    this.dealPlayerService.setCardPlayOrderAsDirections();
    this.renderRoundWinnersTable();

    if ((this.dealPlayerService.cardsPlayed.length - 1) % 4 === 0)
      this.resetTable();

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
    const numberOfCardsPlayed = this.dealPlayerService.cardsPlayed.length;
    this.trickNumber = Math.floor((numberOfCardsPlayed - 1) / 4) + 1;
    const startIndex = (this.trickNumber - 1) * 4;
    const endIndex = startIndex + 4;

    if (endIndex > numberOfCardsPlayed - 1)
      return this.dealPlayerService.cardsPlayed.slice(startIndex);
    else return this.dealPlayerService.cardsPlayed.slice(startIndex, endIndex);
  }

  private handleGamesUpdates(gameState: GameState) {
    this.seating = gameState.currentlyViewingGame.seating;
    this.dealPlayerService.seating = gameState.currentlyViewingGame.seating;
    this.name = gameState.currentlyViewingGame.name;
    this.date = gameState.currentlyViewingGame.date;
  }

  private handleDealsUpdates(dealState: DealState) {
    if (dealState.currentlyViewingDeal?.bids && !this.hasLoadedDeal) {
      this.dealPlayerService.deal = dealState.currentlyViewingDeal;
      this.declarer = dealState.currentlyViewingDeal.declarer;
      this.dealNumber = dealState.currentlyViewingDeal.dealNumber;
      this.biddingTable = dealState.currentlyViewingDeal.biddingTable;
      this.summaryPre = dealState.currentlyViewingDeal.summaryPre;
      this.summaryNumber = dealState.currentlyViewingDeal.summaryNumber;
      this.summaryPost = dealState.currentlyViewingDeal.summaryPost;

      if (Object.keys(this.dealPlayerService.deal).length <= 0) return;

      this.dealPlayerService.handsToRender = this.dealPlayerService.deal?.hands;
      this.dealPlayerService.setupProject();

      if (this.dealPlayerService.cards.length < cardsPerDeck)
        this.dealPlayerService.loadCards();
      else {
        this.dealPlayerService.positionHands();
      }

      this.renderer.addClass(this.elRef.nativeElement, VISIBLE_CLASSNAME);
      this.hasLoadedDeal = true;
      this.renderRoundWinnersTable();
    } else if (dealState.currentlyViewingDeal?.bids) {
      this.dealPlayerService.setCardsRotationAndPosition();
      this.renderer.addClass(this.elRef.nativeElement, VISIBLE_CLASSNAME);
    }

    if (dealState.currentlyViewingDealContract?.prefix) {
      this.contract = dealState.currentlyViewingDealContract;
      this.changeContractColor();
    }
  }

  private playCard(nthCard = this.dealPlayerService.playCount) {
    const cardPlayOrder = this.dealPlayerService.deal?.cardPlayOrder;

    if (
      !this.dealPlayerService.deal ||
      !cardPlayOrder ||
      cardPlayOrder.length < cardsPerDeck
    )
      return;

    if (nthCard >= cardsPerDeck) return this.onPause();
    if (nthCard === -2 || nthCard === 51)
      this.dealPlayerService.cardsPlayed = flatten(cardPlayOrder);
    else if (nthCard < -2)
      this.dealPlayerService.cardsPlayed = flatten(
        cardPlayOrder.slice(0, nthCard + 2) as number[]
      );
    else
      this.dealPlayerService.cardsPlayed = flatten(
        cardPlayOrder.slice(0, nthCard + 1) as number[]
      );

    this.dealPlayerService.playCount = nthCard + 1;
    this.displayCardsInTable();
    this.dealPlayerService.updateHands();
  }

  private removeHeightAuto() {
    const dealPlayer = this.elRef.nativeElement;
    this.renderer.removeClass(dealPlayer, HEIGHT_AUTO_CLASSNAME);
  }

  private resetTable() {
    for (let i = 0; i < cardinalDirections.length; i++) {
      const direction = cardinalDirections[i];
      this.setDirectionContent('', '', direction);
    }
  }

  private resetVariables() {
    // this.cardHeight = -1;
    // this.cardWidth = -1;
    // this.canvasWidth = -1;
    // this.canvasHeight = -1;
    // this.cardScaleAmount = -1;
    // this.cardSpacingIncrement = -1;
    // this.cardVisibleOffset = -1;
    // this.dealPlayerService.playCount = 0;
    // this.trickNumber = 0;
    // this.dealPlayerService.cardsPlayed = [];
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
    const numberOfWinnersToShow = Math.floor(
      this.dealPlayerService.cardsPlayed.length / 4
    );

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
      const roundWinner = (this.dealPlayerService.deal
        ?.roundWinners as string[][])[i];
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
    this.renderer.setProperty(
      numberElement,
      'innerHTML',
      number === '10' || number === 10 ? 'T' : number
    );
    this.renderer.setProperty(suitEntityElement, 'innerHTML', suitHtmlEntity);
  }
}
