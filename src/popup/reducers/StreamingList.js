import {STREAMING_LIST_ACTION} from '../actions/StreamingList.js';

export default function streamingList(state = [], action) {
  switch (action.type) {
    case STREAMING_LIST_ACTION.UPDATE_STREAMING_LIST:
      return action.streamingList;
    default:
      return state;
  }
};
