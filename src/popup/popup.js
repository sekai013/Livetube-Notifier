import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {startGettingStreamingList} from './actions/GettingStreamingList.js';
import {addKeyword} from './actions/Keywords.js';
import {updateSettings} from './actions/Settings.js';
import {updateStreamingList} from './actions/StreamingList.js';
import App from './components/App.js';
import store from './store.js';

chrome.storage.sync.get(
  ['gettingStreamingList', 'settings', 'keywords'],
  (items) => {
    const {gettingStreamingList, settings, keywords} = items;

    if (gettingStreamingList) {
      store.dispatch(startGettingStreamingList());
    }

    store.dispatch(updateSettings(settings));

    Object
      .keys(keywords)
      .forEach((key) => {
        keywords[key].forEach((word) => {
          store.dispatch(addKeyword(key, word));
        });
      });
  }
);

// TODO: chrome.runtime.onMessage.addListener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'updateStreamingList':
      store.dispatch(updateStreamingList(request.streamingList));
      break;
    default:
      return;
  }
});

window.addEventListener('load', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.querySelector('#app-container')
  );

  chrome.runtime.sendMessage(chrome.runtime.id, {type: 'initializePopup'});
});
