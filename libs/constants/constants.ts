import { GameDetailSizes, SortOptions } from '@nx-bridge/interfaces-and-types';

export const GET_DEALS_CONTROLLER_STRING = 'getDeals';
export const GET_GAMES_CONTROLLER_STRING = 'getGames';
export const GET_GAME_COUNT_CONTROLLER_STRING = 'getGameCount';
export const GET_USER_CONTROLLER_STRING = 'getUser';
export const GET_USERS_CONTROLLER_STRING = 'getUsers';

export const USER_ID_STRING = 'userId';
export const GET_GAMES_LAST_STRING = 'last';
export const DEALS_STRING = 'deals';
export const USERNAME_STRING = 'username';
export const EMAIL_STRING = 'email';
export const USERS_STRING = 'users';

export const GET_DEALS_URL = `/api/${GET_DEALS_CONTROLLER_STRING}`;
export const GET_GAMES_URL = `/api/${GET_GAMES_CONTROLLER_STRING}`;
export const GET_GAME_COUNT_URL = `/api/${GET_GAME_COUNT_CONTROLLER_STRING}`;
export const GET_USER_URL = `/api/${GET_USER_CONTROLLER_STRING}`;
export const GET_USERS_URL = `/api/${GET_USERS_CONTROLLER_STRING}`;

export const OVERFLOW_Y_SCROLL_CLASSNAME = 'overflow-y-scroll';
export const HEIGHT_AUTO_CLASSNAME = 'h-auto';
export const HIDDEN_CLASSNAME = 'hidden';
export const VISIBLE_CLASSNAME = 'visible';
export const DISPLAY_NONE_CLASSNAME = 'd-none';
export const DEALS_LIST_CLASSNAME = 'deals-list';
export const DEAL_DETAIL_CLASSNAME = 'deal-detail';
export const GAME_DETAIL_CLASSNAME = 'game-detail';
export const GAMES_VIEW_CLASSNAME = 'games-view';
export const DEAL_PLAYER_CLASSNAME = 'deal-player';
export const FULL_SIZE_CLASSNAME = 'full-size';
export const COLOR_RED_CLASSNAME = 'color-red';
export const COLOR_BLACK_CLASSNAME = 'color-black';
export const HEADER_CLASSNAME = 'navbar';

export const dealsListDealsButtonChoices: [string, string] = ['Open', '&#10006;'];
export const dealsListDetailsButtonChoices: [string, string] = ['Show All', 'Hide All'];
export const dealDetailButtonChoices: [string, string] = ['Show', 'Hide'];

export const MOBILE_START_WIDTH = 655;
export const ANIMATION_DURATION = 500;


export const gameDetailHeightAboveBreakpointCssPropName =  '--game-detail-height-above-breakpoint';
export const gameDetailHeightBelowBreakpointCssPropName =  '--game-detail-height-below-breakpoint';
export const gameDetailSummaryHeightPercentageCssPropName =  '--game-detail-summary-height-percentage';

export const SIZE_OPTIONS = {
  [GameDetailSizes.small]: GameDetailSizes.small,
  [GameDetailSizes.medium]: GameDetailSizes.medium,
  [GameDetailSizes.large]: GameDetailSizes.large,
}
export const SORT_OPTIONS = {
  [SortOptions.ascending]: SortOptions.ascending,
  [SortOptions.descending]: SortOptions.descending,
}


