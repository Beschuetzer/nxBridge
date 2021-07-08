import { GameDetailSizes } from "@nx-bridge/interfaces-and-types";

export const computedStyle = getComputedStyle(document.documentElement);
export const defaultFontSizeNumber = +computedStyle.getPropertyValue('--default-font-size').replace('rem', '');

export const gameDetailSizes: {[key: string]: any} = {
  [GameDetailSizes.small]: {
    summaryHeightPercent: '100%',
    gameDetailHeight: {
      aboveBreakpoint: `${defaultFontSizeNumber * 2}rem`,
      belowBreakpoint: `${defaultFontSizeNumber * 2}rem`,
    },         
    playerLabelsDisplayType: "flex",
    playerNamesDisplayType: "grid",
  },
  [GameDetailSizes.medium]: {
    summaryHeightPercent: '50%',
    gameDetailHeight: {
      aboveBreakpoint: `${Math.round(defaultFontSizeNumber * 3.625 * 100) / 100}rem`,
      belowBreakpoint: `${defaultFontSizeNumber * 3.625}rem`,
    },           
    playerLabelsDisplayType: "none",
    playerNamesDisplayType: "none",
  },
  [GameDetailSizes.large]: {
    summaryHeightPercent: '80%',
    gameDetailHeight: {
      aboveBreakpoint: `${Math.round(defaultFontSizeNumber * 7 * 100) / 100}rem`,
      belowBreakpoint: `${defaultFontSizeNumber * 7.5}rem`,
    },             
    playerLabelsDisplayType: "flex",
    playerNamesDisplayType: "grid",
  },
}