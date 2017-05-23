import {SETTING_ACTION} from '../actions/Settings.js';

const DEFAULT_STATE = {
  autoOpen: false,
  useHighServer: false,
  updateStreamingInterval: 5,
};

export default function settings(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case SETTING_ACTION.UPDATE_SETTINGS:
      return Object.assign({}, state, action.settings);
    default:
      return state;
  }
};
