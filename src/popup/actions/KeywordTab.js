export const KEYWORD_TAB_ACTION = {
  UPDATE_KEYWORD_TAB: 'UPDATE_KEYWORD_TAB',
};

export const updateKeywordTab = (tab) => {
  return {
    type: KEYWORD_TAB_ACTION.UPDATE_KEYWORD_TAB,
    tab,
  };
};
