/* @flow */
import ChromePromise from 'chrome-promise';
import BackgroundManager from './lib/BackgroundManager.js';

declare var chrome: any;

let manager = null;

(async () => {
  manager = new BackgroundManager({chrome});
  await manager.initialize();
})();

chrome.runtime.onInstalled.addListener(async (details) => {
  const chromep = new ChromePromise();
  const {status} = await chromep.storage.sync.get('status');

  if (status) {
    const settings = {
      autoOpen: status.autoOpen,
      updateStreamingInterval: +status.updateIntervalInMinutes,
      useHighServer: status.useHServer,
    };
    const gettingStreamingList = status.gettingVideos;
    await chromep.storage.sync.set({settings, gettingStreamingList});
    await chromep.storage.sync.remove('status');

    if (manager !== null) {
      manager.settings = settings;

      if (gettingStreamingList) {
        manager.startGettingStreamingList();
      }
    }
  }

  const {words} = await chromep.storage.sync.get('words');

  if (words) {
    const filterType = (type) => (w) => w.type === type;
    const titles = words.filter(filterType('title')).map((w) => {
      return {text: w.text};
    });
    const authors = words.filter(filterType('author')).map((w) => {
      return {text: w.text, compare: 'include'};
    });
    const tags = words.filter(filterType('tags')).map((w) => {
      return {text: w.text};
    });
    const keywords = {titles, authors, tags};

    await chromep.storage.sync.set({keywords});
    await chromep.storage.sync.remove('words');
    if (manager !== null) {
      manager.keywords = keywords;
    }
  }
});
