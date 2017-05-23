import {MAIN_TAB_ACTION} from '../actions/MainTab.js';

export default function mainTab(state = 'streaming', action) {
  switch (action.type) {
    case MAIN_TAB_ACTION.UPDATE_MAIN_TAB:
      return action.tab;
    default:
      return state;
  }
};
