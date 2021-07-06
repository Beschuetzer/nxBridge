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
  getCharacterFromCardAsNumber,
  getHtmlEntityFromSuitOrCardAsNumber,
  getUserWhoPlayedCard,
  suitsHtmlEntities,
  COLOR_RED_CLASSNAME,
  COLOR_BLACK_CLASSNAME,
  createHandArrayFromFlatArray,
  MOBILE_START_WIDTH,
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
  public biddingTable = '';
  public summaryPre = '';
  public summaryNumber = '';
  public summaryPost = '';
  public error = '';
  private hasLoadedDeal = false;
  private shouldChangePlaySpeed = false;
  private firstCardPlayed = -1;
  private firstCardPlayer = '';
  private playInterval: any;
  public isMobile = window.innerWidth <= MOBILE_START_WIDTH;

  constructor(
    private store: Store<AppState>,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private dealPlayerService: DealPlayerService,
  ) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.dealPlayerService.onResize.bind(this.dealPlayerService));

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
        this.dealPlayerService.project = new Project(
          document.querySelector(
            `#${DEAL_PLAYER_CLASSNAME}-canvas`
          ) as HTMLCanvasElement
        );

        if (this.dealPlayerService.cards.length < cardsPerDeck) this.dealPlayerService.loadCards();
        else {
          this.dealPlayerService.positionHands();
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
    this.dealPlayerService.resetCardsPlayed();
    this.resetTable();
    this.renderer.removeClass(this.elRef.nativeElement, VISIBLE_CLASSNAME);
    console.log('onClose------------------------------------------------');
    this.dealPlayerService.setCardsRotationAndPosition();
    this.store.dispatch(
      new SetCurrentlyViewingDeal({} as CurrentlyViewingDeal)
    );
    this.resetVariables();
  }

  onNext() {
    this.resetTable();
    this.dealPlayerService.playCard();
    this.onPause();
  }

  onNextFour() {
    this.resetTable();
    this.dealPlayerService.playCard(this.playCount + 3);
    this.onPause();
  }

  onPause() {
    this.isPlaying = false;
    clearInterval(this.playInterval);
  }

  onPlay() {
    this.isPlaying = true;
    this.dealPlayerService.playCard();
    this.playInterval = setInterval(() => {
      if (this.shouldChangePlaySpeed) {
        clearInterval(this.playInterval);
        return this.onPlay();
      }
      this.dealPlayerService.playCard();
      if (this.playCount === cardsPerDeck) clearInterval(this.playInterval);
    }, this.cardPlayWaitDuration);
  }

  onPrevious() {
    this.onPause();
    this.resetTable();
    this.dealPlayerService.playCard(this.playCount - 2);
  }

  onPreviousFour() {
    this.onPause();
    this.resetTable();
    this.dealPlayerService.playCard(this.playCount - 5);
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
    this.dealPlayerService.resetCardsPlayed();
    this.trickNumber = 0;
  }

  

  displayCardsInTable() {
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
    this.dealPlayerService.cardPlayerOrder = [
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
