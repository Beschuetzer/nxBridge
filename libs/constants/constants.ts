import { GameDetailSizes, SortOptions } from '@nx-bridge/interfaces-and-types';

export const rootRoute = 'replays';
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
export const DEAL_PASSED_OUT_MESSAGE ='Deal passed out';

export const GET_DEALS_URL = `/api/${GET_DEALS_CONTROLLER_STRING}`;
export const GET_GAMES_URL = `/api/${GET_GAMES_CONTROLLER_STRING}`;
export const GET_GAME_COUNT_URL = `/api/${GET_GAME_COUNT_CONTROLLER_STRING}`;
export const GET_USER_URL = `/api/${GET_USER_CONTROLLER_STRING}`;
export const GET_USERS_URL = `/api/${GET_USERS_CONTROLLER_STRING}`;

export const OVERFLOW_Y_SCROLL_CLASSNAME = 'overflow-y-auto';
export const HEIGHT_AUTO_CLASSNAME = 'h-auto';
export const HEIGHT_NONE_CLASSNAME = 'h-0';
export const HIDDEN_CLASSNAME = 'hidden';
export const OPACITY_NONE_CLASSNAME = 'opacity-none';
export const SCALE_Y_NONE_CLASSNAME = 'scale-y-none';
export const SCALE_X_NONE_CLASSNAME = 'scale-x-none';
export const TRANSLATE_LEFT_CLASSNAME = 'translate-left';
export const TRANSLATE_RIGHT_CLASSNAME = 'translate-right';
export const TRANSLATE_UP_CLASSNAME = 'translate-up';

export const VISIBLE_CLASSNAME = 'visible';
export const DISPLAY_NONE_CLASSNAME = 'd-none';
export const MATCHED_DEAL_CLASSNAME = 'matched-deal';
export const LOGIN_CARD_CLASSNAME = 'login-card';
export const DEALS_LIST_CLASSNAME = 'deals-list';
export const DEAL_DETAIL_CLASSNAME = 'deal-detail';
export const GAME_DETAIL_CLASSNAME = 'game-detail';
export const GAMES_VIEW_CLASSNAME = 'games-view';
export const DEAL_PLAYER_CLASSNAME = 'deal-player';
export const FILTER_MANAGER_CLASSNAME = 'filter-manager';
export const FULL_SIZE_CLASSNAME = 'full-size';
export const COLOR_RED_CLASSNAME = 'color-red';
export const COLOR_BLACK_CLASSNAME = 'color-black';
export const HEADER_CLASSNAME = 'navbar';
export const GAME_DETAIL_BORDER_BOTTOM_CLASSNAME = 'game-detail-border-bottom';
export const DEAL_DETAIL_BUTTON_BORDER_BOTTOM_CLASSNAME =
  'deal-detail-button-border-bottom';

export const dealsListDealsButtonChoices: [string, string] = [
  'Open',
  '&#10006;',
];
export const dealsListDetailsButtonChoices: [string, string] = [
  'Show All',
  'Hide All',
];
export const dealDetailButtonChoices: [string, string] = ['Show', 'Hide'];

export const MOBILE_START_WIDTH = 561;
export const ANIMATION_DURATION = 500;

export const gameDetailHeightAboveBreakpointCssPropName =
  '--game-detail-height-above-breakpoint';
export const gameDetailHeightBelowBreakpointCssPropName =
  '--game-detail-height-below-breakpoint';
export const gameDetailSummaryHeightPercentageCssPropName =
  '--game-detail-summary-height-percentage';
export const playerLabelsDisplayTypeCssPropName =
  '--player-labels-display-type';
export const playerNamesDisplayTypeCssPropName = '--player-names-display-type';
export const dealsListButtonFontSizeCssPropName =
  '--deals-list-button-font-size';
export const gameDetailBorderCssPropName = '--game-detail-border';

export const colorBlackCssPropName = '--color-black-rgb';
export const colorPrimary1CssPropName = '--color-primary-1-rgb';
export const colorPrimary4CssPropName = '--color-primary-4-rgb';

export const gameDetailBorderOpen = `1px solid rgba(var(${colorBlackCssPropName}), 1)`;
export const gameDetailBorderClosed = `2px solid rgba(var(${colorPrimary4CssPropName}), .25)`;
export const dealDetailButtonBorder = `1px solid rgba(var(${colorPrimary1CssPropName}), 0.5) !important;`;

export const SIZE_OPTIONS = {
  [GameDetailSizes.small]: GameDetailSizes.small,
  [GameDetailSizes.medium]: GameDetailSizes.medium,
  [GameDetailSizes.large]: GameDetailSizes.large,
};
export const SORT_OPTIONS = {
  [SortOptions.ascending]: SortOptions.ascending,
  [SortOptions.descending]: SortOptions.descending,
};
export const RESULTS_PER_PAGE_OPTIONS = [1, 2, 5, 10, 25, 50, 100];
export const NOT_AVAILABLE_STRING = 'N/A';

export const filterManagerContracts = ['Pick a Contract'];
export const filterManagerBids = ['Pick a Bid'];
export const filterManagerCardsAsNumbers = ['Pick a Card', ...Array(52).keys()];
export const filterManagerPlayerNames = ['Pick a Username'];
export const filterManagerGameNames = ['Pick a Game Name'];
export const filterManagerDoubleOptions = ['Pick a Multiplier', 'Once', 'Twice'];
export const COMPARER_HTML_ENTITIES = {
  lessThanEqualTo: "&#8804;",
  greaterThanEqualTo: "&#8805;",
}