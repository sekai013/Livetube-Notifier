export const STREAMING_LIST_ACTION = {
  UPDATE_STREAMING_LIST: 'UPDATE_STREAMING_LIST',
};

export const updateStreamingList = (streamingList) => {
  return {
    type: STREAMING_LIST_ACTION.UPDATE_STREAMING_LIST,
    streamingList,
  };
};
