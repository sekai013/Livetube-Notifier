export const MAIN_TAB_ACTION = {
  UPDATE_MAIN_TAB: 'UPDATE_MAIN_TAB',
};

export const updateMainTab = (tab) => {
  return {
    type: MAIN_TAB_ACTION.UPDATE_MAIN_TAB,
    tab,
  };
};
