import { GameDetailSizes } from "@nx-bridge/interfaces-and-types";

export const computedStyle = getComputedStyle(document.documentElement);

//note: this number has to match $default-font-size sass variable to work properly (in rem);
export const defaultFontSizeNumber = 1.6;

export const gameDetailSizes: {[key: string]: any} = {
  [GameDetailSizes.small]: {
    summaryHeightPercent: '100%',
    gameDetailHeight: {
      aboveBreakpoint: `${defaultFontSizeNumber * 2}rem`,
      belowBreakpoint: `${defaultFontSizeNumber * 2}rem`,
    },         
    playerLabelsDisplayType: "flex",
    playerNamesDisplayType: "grid",
    dealsListButtonFontSize: `${defaultFontSizeNumber * 1}rem`,
  },
  [GameDetailSizes.medium]: {
    summaryHeightPercent: '50%',
    gameDetailHeight: {
      aboveBreakpoint: `${Math.round(defaultFontSizeNumber * 3.625 * 100) / 100}rem`,
      belowBreakpoint: `${defaultFontSizeNumber * 3.625}rem`,
    },           
    playerLabelsDisplayType: "none",
    playerNamesDisplayType: "none",
    dealsListButtonFontSize: `${defaultFontSizeNumber * 2}rem`,
  },
  [GameDetailSizes.large]: {
    summaryHeightPercent: '80%',
    gameDetailHeight: {
      aboveBreakpoint: `${Math.round(defaultFontSizeNumber * 7 * 100) / 100}rem`,
      belowBreakpoint: `${defaultFontSizeNumber * 7.5}rem`,
    },             
    playerLabelsDisplayType: "flex",
    playerNamesDisplayType: "grid",
    dealsListButtonFontSize: `${defaultFontSizeNumber * 2}rem`,
  },
}