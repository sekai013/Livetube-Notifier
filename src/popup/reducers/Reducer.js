import {combineReducers} from 'redux';
import gettingStreamingList from './GettingStreamingList.js';
import keywords from './Keywords.js';
import keywordTab from './KeywordTab.js';
import mainTab from './MainTab.js';
import settings from './Settings.js';
import streamingList from './StreamingList.js';

export default combineReducers({
  gettingStreamingList,
  keywords,
  keywordTab,
  mainTab,
  settings,
  streamingList,
});
