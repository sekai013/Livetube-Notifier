import {GETTING_STREAMING_LIST_ACTION}
from '../actions/GettingStreamingList.js';

export default function streamingList(state = false, action) {
  switch (action.type) {
    case GETTING_STREAMING_LIST_ACTION.START_GETTING_STREAMING_LIST:
      return true;
    case GETTING_STREAMING_LIST_ACTION.STOP_GETTING_STREAMING_LIST:
      return false;
    default:
      return state;
  }
};
