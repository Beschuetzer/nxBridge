/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { ElementRef, Injectable, OnInit } from '@angular/core';
import { dealsListButtonFontSizeCssPropName, dealsListDealsButtonChoices, DEALS_LIST_CLASSNAME, DEAL_DETAIL_CLASSNAME, DISPLAY_NONE_CLASSNAME, FULL_SIZE_CLASSNAME, gameDetailHeightAboveBreakpointCssPropName, gameDetailHeightBelowBreakpointCssPropName, gameDetailSummaryHeightPercentageCssPropName, GAME_DETAIL_BORDER_BOTTOM_CLASSNAME, GAME_DETAIL_CLASSNAME, LOGIN_CARD_CLASSNAME, playerLabelsDisplayTypeCssPropName, playerNamesDisplayTypeCssPropName } from '@nx-bridge/constants';
import { gameDetailSizes } from '@nx-bridge/computed-styles';
import { Store } from '@ngrx/store';
import { AppState, SetResultsPerPagePreference, SetSortingPreference } from '@nx-bridge/store';


@Injectable({
  providedIn: 'root'
})
export class ReplayViewerGameService implements OnInit{

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private store: Store<AppState>,
  ) {}


  // eslint-disable-next-line @angular-eslint/contextual-lifecycle
  ngOnInit() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }

  changeGameSize(newSize: string) {
    if (!newSize) return;
    document.documentElement.style.setProperty(
      gameDetailHeightAboveBreakpointCssPropName,
      gameDetailSizes[newSize].gameDetailHeight.aboveBreakpoint
    );
    document.documentElement.style.setProperty(
      gameDetailHeightBelowBreakpointCssPropName,
      gameDetailSizes[newSize].gameDetailHeight.belowBreakpoint
    );
    document.documentElement.style.setProperty(
      gameDetailSummaryHeightPercentageCssPropName,
      gameDetailSizes[newSize].summaryHeightPercent
    );
    document.documentElement.style.setProperty(
      playerLabelsDisplayTypeCssPropName,
      gameDetailSizes[newSize].playerLabelsDisplayType
    );
    document.documentElement.style.setProperty(
      playerNamesDisplayTypeCssPropName,
      gameDetailSizes[newSize].playerNamesDisplayType
    );
    document.documentElement.style.setProperty(
      dealsListButtonFontSizeCssPropName,
      gameDetailSizes[newSize].dealsListButtonFontSize
    );
  }

  resetGameDetails(gameDetails: NodeListOf<Element>) {
    if (!gameDetails) return;
    for (let i = 0; i < gameDetails.length; i++) {
      const gameDetail = gameDetails[i];
      gameDetail.classList.remove(FULL_SIZE_CLASSNAME);

      const detailScore = gameDetail.querySelector(
        `.${GAME_DETAIL_CLASSNAME}__score`
      ) as HTMLElement;
      detailScore.classList.remove(GAME_DETAIL_BORDER_BOTTOM_CLASSNAME);

      const dealsListButton = gameDetail.querySelector(
        `.${DEALS_LIST_CLASSNAME}__button-deals`
      ) as HTMLElement;
      if (dealsListButton)
        dealsListButton.innerHTML = dealsListDealsButtonChoices[0];

      const dealsListSummary = gameDetail.querySelector(
        `.${DEALS_LIST_CLASSNAME}__summary`
      ) as HTMLElement;
      if (dealsListSummary) dealsListSummary.classList.add(DISPLAY_NONE_CLASSNAME);

      const dealDetails = gameDetail.querySelectorAll(
        `.${DEAL_DETAIL_CLASSNAME}`
      );
      for (let i = 0; i < dealDetails.length; i++) {
        const dealDetail = dealDetails[i];
        dealDetail.classList.add(DISPLAY_NONE_CLASSNAME);
      }
    }
  }

  selectCurrentPage(newBatchNumber: number, currentPageElRef: ElementRef | undefined) {
    //note: timeout is needed to allow the re-render to take place
    setTimeout(() => {
      const currentPageElement = currentPageElRef?.nativeElement as HTMLElement;
      const currentPageOptionElement = currentPageElement?.children[
        newBatchNumber
      ] as HTMLOptionElement;
      if (currentPageOptionElement) currentPageOptionElement.selected = true;
    }, 50);
  }

  setDefaultResultsPerPage(resultsElRef: ElementRef | undefined) {
    const resultsElement = resultsElRef
      ?.nativeElement as HTMLSelectElement;
    const lastResultOption = resultsElement.children[
      resultsElement.children.length - 1
    ] as HTMLOptionElement;
    if (lastResultOption) lastResultOption.selected = true;
  }

  setSortPreference(newSortPreference: string) {
    this.store.dispatch(new SetSortingPreference(newSortPreference));
  }

  setResultsPerPagePreference(newResultsPerPagePreference: string) {
    this.store.dispatch(
      new SetResultsPerPagePreference(newResultsPerPagePreference)
    );
  }


  showSearchHideButton(gamesListViewElRef: ElementRef | undefined) {
    const gamesListView = gamesListViewElRef?.nativeElement as HTMLElement;
    const loginCardHide = gamesListView.querySelector(`.${LOGIN_CARD_CLASSNAME}__hide`);

    loginCardHide?.classList.remove(DISPLAY_NONE_CLASSNAME);
  }
}