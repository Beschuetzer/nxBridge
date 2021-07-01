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
  private cardSpacingIncrement = -1;
  private defaultCardPosition = -1000;

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
      this.resetAllCardPositions();
      this.renderHands();
    }
  }

  private renderHands() {
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
    this.cardSpacingIncrement = this.cardWidth / 6;
    const startingPositionX = this.getStartingPositionX(flatHand.length);

    for (let i = 0; i < flatHand.length; i++) {
      const cardAsNumber = flatHand[i];
      const cardAsRaster = this.cards.find((card: paper.Raster) => {
        const indexOfDash = card.image.id.indexOf('-');
        const digits = card.image.id.slice(indexOfDash + 1);
        return(digits).match(cardAsNumber);
      });

      this.setXPositionOfHands(cardAsRaster, i, direction, startingPositionX);
      this.setYPositionOfHands(cardAsRaster, i, direction, startingPositionX)
      this.project?.activeLayer.addChild(cardAsRaster);
    }
  }

  private setXPositionOfHands(cardAsRaster: paper.Raster, nthCard: number, direction: string, startingPositionX: number) {
    if (direction === cardinalDirections[0] || direction === cardinalDirections[2]) {
      cardAsRaster.position.x = startingPositionX + this.cardWidth / 2 + this.cardSpacingIncrement * nthCard;
    }

    else if (direction === cardinalDirections[1]) {
      
    }

    else if (direction === cardinalDirections[3]) {
      
    }
  }

  private setYPositionOfHands(cardAsRaster: paper.Raster, nthCard: number, direction: string, startingPositionY: number) {
    cardAsRaster.position.y = 500;
  }

  private getStartingPositionX(lengthOfHand: number) {
    return (window.innerWidth - (this.cardWidth + (lengthOfHand - 1) * this.cardSpacingIncrement)) / 2;
  }

  private resetAllCardPositions() {
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      card.position.x = this.defaultCardPosition;
    }
  }
}
