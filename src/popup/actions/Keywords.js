export const KEYWORD_ACTION = {
  ADD_KEYWORD: 'ADD_KEYWORD',
  DELETE_KEYWORD: 'DELETE_KEYWORD',
  EDIT_KEYWORD: 'EDIT_KEYWORD',
};

export const addKeyword = (keywordType, keywordValue) => {
  return {
    type: KEYWORD_ACTION.ADD_KEYWORD,
    keyword: {
      type: keywordType,
      value: keywordValue,
    },
  };
};

export const deleteKeyword = (keywordType, keywordIndex) => {
  return {
    type: KEYWORD_ACTION.DELETE_KEYWORD,
    keyword: {
      type: keywordType,
      index: keywordIndex,
    },
  };
};

export const editKeyword = (keywordType, keywordValue, keywordIndex) => {
  return {
    type: KEYWORD_ACTION.EDIT_KEYWORD,
    keyword: {
      type: keywordType,
      value: keywordValue,
      index: keywordIndex,
    },
  };
};
