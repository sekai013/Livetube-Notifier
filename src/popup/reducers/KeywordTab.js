import {KEYWORD_TAB_ACTION} from '../actions/KeywordTab.js';

export default function keywordTab(state = 'titles', action) {
  switch (action.type) {
    case KEYWORD_TAB_ACTION.UPDATE_KEYWORD_TAB:
      return action.tab;
    default:
      return state;
  }
};
