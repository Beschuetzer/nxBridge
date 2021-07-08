import { GameDetailSizes } from "@nx-bridge/interfaces-and-types";

export const computedStyle = getComputedStyle(document.documentElement);
export const defaultFontSizeNumber = +computedStyle.getPropertyValue('--default-font-size').replace('rem', '');

export const gameDetailSizes = {
  [GameDetailSizes.small]: {
    summaryHeightPercent: '100%',
    gameDetailHeight: {
      aboveBreakpoint: `${defaultFontSizeNumber * 2}rem`,
      belowBreakpoint: `${defaultFontSizeNumber * 2}rem`,
    }             
  },
  [GameDetailSizes.medium]: {
    summaryHeightPercent: '100%',
    gameDetailHeight: {
      aboveBreakpoint: `${Math.round(defaultFontSizeNumber * 7 * 100) / 100}rem`,
      belowBreakpoint: `${defaultFontSizeNumber * 7.5}rem`,
    }               
  },
  [GameDetailSizes.large]: {
    summaryHeightPercent: '80%',
    gameDetailHeight: {
      aboveBreakpoint: `${Math.round(defaultFontSizeNumber * 7 * 100) / 100}rem`,
      belowBreakpoint: `${defaultFontSizeNumber * 7.5}rem`,
    }               
  },
}