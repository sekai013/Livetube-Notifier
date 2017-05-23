export const SETTING_ACTION = {
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
};

export const updateSettings = (settings) => {
  return {
    type: SETTING_ACTION.UPDATE_SETTINGS,
    settings,
  };
};
