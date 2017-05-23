import {KEYWORD_ACTION} from '../actions/Keywords.js';

const DEFAULT_STATE = {
  titles: [],
  authors: [],
  tags: [],
};

export default function keywords(state = DEFAULT_STATE, action) {
  const {keyword} = action;
  const {type, value, index} = keyword || DEFAULT_STATE;
  switch (action.type) {
    case KEYWORD_ACTION.ADD_KEYWORD:
      return Object.assign({}, state, {[type]: [...state[type], value]});
    case KEYWORD_ACTION.DELETE_KEYWORD:
      return Object.assign({}, state, {
        [type]: state[type].filter((d, i) => i !== index),
      });
    case KEYWORD_ACTION.EDIT_KEYWORD:
      return Object.assign({}, state, {
        [type]: state[type].map((d, i) => i === index ? value : d),
      });
    default:
      return state;
  }
};
