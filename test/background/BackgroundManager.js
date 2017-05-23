import 'babel-polyfill';
import test from 'ava';
import fetchMock from 'fetch-mock';
import Chrome from 'lib/chrome-mock.js';
import BackgroundManager from 'background/lib/BackgroundManager.js';

const API_REGEXP = /http:\/\/([htz]\.)?livetube\.cc\/index\.live\.json/;
const DUMMY_STREAMING_DATA = [
  {
    id: 'aaaaaaaaaaaaa', /* [a-z0-9]{13} */
    link: '%E3%81%82%E3%81%84%E3%81%86%E3%81%88%E3%81%8A', /* encoded path */
    author: 'sekai013',
    title: 'amagami 01',
    viewing: 100,
    view: 300,
    comments: 500,
    created: 'Thu, 09 Feb 2017 19:32:13 GMT', /* date string */
    tags: [
      'betasaba',
      'game',
    ],
  },
  {
    id: 'aaaaaaaaaaaab',
    link: '%E3%81%82%E3%81%84%E3%81%86%E3%81%88%E3%81%8A',
    author: 'hogehoge',
    title: '111',
    viewing: 100,
    view: 300,
    comments: 500,
    created: 'Thu, 09 Feb 2017 19:32:13 GMT',
    tags: [
      'betasaba',
    ],
  },
  {
    id: 'aaaaaaaaaaaac',
    link: '%E3%81%82%E3%81%84%E3%81%86%E3%81%88%E3%81%8A',
    author: 'aaa',
    title: 'AMAGAMI 01',
    viewing: 100,
    view: 300,
    comments: 500,
    created: 'Thu, 09 Feb 2017 19:32:13 GMT',
    tags: [
      'betasaba',
    ],
  },
  {
    id: 'aaaaaaaaaaaad',
    link: '%E3%81%82%E3%81%84%E3%81%86%E3%81%88%E3%81%8A',
    author: 'abcabc',
    title: '111',
    viewing: 100,
    view: 300,
    comments: 500,
    created: 'Thu, 09 Feb 2017 19:32:13 GMT',
    tags: [
      'betasaba',
      'GAME',
    ],
  },
];

test.before((t) => {
  // NOTE: fetchMock in async function causes "No fallback response" error
  fetchMock.get(API_REGEXP, DUMMY_STREAMING_DATA);
});

test.after((t) => {
  fetchMock.restore();
});

test.beforeEach(async (t) => {
  const chrome = new Chrome();
  chrome.storage.sync.set({
    gettingStreamingList: false,
    settings: {
      autoOpen: false,
      useHighServer: true,
      updateStreamingInterval: 3,
    },
    keywords: {
      titles: ['amagami'],
      authors: [{
        author: 'sekai',
        compare: 'include',
      }, {
        author: 'hoge',
        compare: 'equal',
      }],
      tags: ['game'],
    },
  });
  const manager = new BackgroundManager({chrome});
  await manager.initialize();
  t.context.chrome = chrome;
  t.context.manager = manager;
});

test('on installed', async (t) => {
  const manager = new BackgroundManager({chrome: new Chrome()});
  await manager.initialize();
  t.is(manager.gettingStreamingList, false);
  t.deepEqual(manager.targetStreamingList, []);
  const {settings} = manager;
  t.is(settings.autoOpen, false);
  t.is(settings.useHighServer, false);
  t.is(settings.updateStreamingInterval, 5);
  const {keywords} = manager;
  t.deepEqual(keywords.titles, []);
  t.deepEqual(keywords.authors, []);
  t.deepEqual(keywords.tags, []);
});

test('initialize', (t) => {
  const {manager, chrome} = t.context;
  t.is(manager.gettingStreamingList, false);
  t.deepEqual(manager.targetStreamingList, []);
  const {settings} = manager;
  t.is(settings.autoOpen, false);
  t.is(settings.useHighServer, true);
  t.is(settings.updateStreamingInterval, 3);
  const {keywords} = manager;
  t.deepEqual(keywords.titles, ['amagami']);
  t.deepEqual(keywords.authors, [{
    author: 'sekai',
    compare: 'include',
  }, {
    author: 'hoge',
    compare: 'equal',
  }]);
  t.deepEqual(keywords.tags, ['game']);
  t.is(typeof chrome.runtime.onMessage._listener.messageListener, 'function');
  t.is(typeof chrome.alarms.onAlarm._listener.alarmListener, 'function');
});

test('initialize gettingStreamingList=true', async (t) => {
  const chrome = new Chrome();
  chrome.storage.sync.set({
    gettingStreamingList: true,
    settings: {
      autoOpen: false,
      useHighServer: true,
      updateStreamingInterval: 3,
    },
    keywords: {
      titles: ['amagami'],
      authors: [{
        author: 'sekai',
        compare: 'include',
      }, {
        author: 'hoge',
        compare: 'equal',
      }],
      tags: ['game'],
    },
  });
  const manager = new BackgroundManager({chrome});
  await manager.initialize();
  t.deepEqual(
    manager.targetStreamingList,
    DUMMY_STREAMING_DATA.filter((d, i) => i !== 1)
  );
});

test('update streaming list', async (t) => {
  const {manager, chrome} = t.context;
  t.deepEqual(manager.targetStreamingList, []);
  t.is(chrome.browserAction._badgeText, '');
  t.is(chrome.browserAction._badgeBackgroundColor, '');
  await manager.updateStreamingList();
  t.deepEqual(
    manager.targetStreamingList,
    DUMMY_STREAMING_DATA.filter((d, i) => i !== 1)
  );
  t.is(chrome.browserAction._badgeText, '3');
  t.is(chrome.browserAction._badgeBackgroundColor, '#47A');
});

test('start/stop getting streaming list', async (t) => {
  const {manager, chrome} = t.context;
  t.is(manager.gettingStreamingList, false);
  t.deepEqual(manager.targetStreamingList, []);
  t.deepEqual(chrome.alarms._alarm.updateStreamingList, undefined);
  await manager.startGettingStreamingList();
  t.is(manager.gettingStreamingList, true);
  t.deepEqual(
    manager.targetStreamingList,
    DUMMY_STREAMING_DATA.filter((d, i) => i !== 1)
  );
  t.deepEqual(chrome.alarms._alarm.updateStreamingList, {
    updateStreamingInterval: 3,
  });
  await manager.stopGettingStreamingList();
  t.is(manager.gettingStreamingList, false);
  t.deepEqual(manager.targetStreamingList, []);
  t.is(chrome.alarms._alarm.updateStreamingList, undefined);
});

test('messageListener', async (t) => {
  const {manager, chrome} = t.context;
  const {messageListener} = chrome.runtime.onMessage._listener;
  t.is(manager.gettingStreamingList, false);
  t.deepEqual(manager.targetStreamingList, []);
  t.deepEqual(chrome.alarms._alarm.updateStreamingList, undefined);
  t.deepEqual(manager.keywords.titles, ['amagami']);
  await messageListener({type: 'startGettingStreamingList'}, null, null);
  t.is(manager.gettingStreamingList, true);
  t.deepEqual(
    manager.targetStreamingList,
    DUMMY_STREAMING_DATA.filter((d, i) => i !== 1)
  );
  t.deepEqual(chrome.alarms._alarm.updateStreamingList, {
    updateStreamingInterval: 3,
  });
  await messageListener({type: 'stopGettingStreamingList'}, null, null);
  t.is(manager.gettingStreamingList, false);
  t.deepEqual(manager.targetStreamingList, []);
  t.is(chrome.alarms._alarm.updateStreamingList, undefined);
  await messageListener({
    type: 'addKeyword',
    keyword: {type: 'titles', value: 'kimikiss'},
  }, null, null);
  await messageListener({
    type: 'addKeyword',
    keyword: {type: 'titles', value: 'seiren'},
  }, null, null);
  t.deepEqual(manager.keywords.titles, ['amagami', 'kimikiss', 'seiren']);
  await messageListener({
    type: 'deleteKeyword',
    keyword: {type: 'titles', index: 1},
  }, null, null);
  t.deepEqual(manager.keywords.titles, ['amagami', 'seiren']);
  await messageListener({
    type: 'editKeyword',
    keyword: {type: 'titles', value: 'kimikiss', index: 1},
  }, null, null);
  t.deepEqual(manager.keywords.titles, ['amagami', 'kimikiss']);
});

test('alarmListener', async (t) => {
  const {manager, chrome} = t.context;
  const {alarmListener} = chrome.alarms.onAlarm._listener;
  t.deepEqual(manager.targetStreamingList, []);
  await alarmListener({name: 'updateStreamingList'});
  t.deepEqual(
    manager.targetStreamingList,
    DUMMY_STREAMING_DATA.filter((d, i) => i !== 1)
  );
});

test('update settings', async (t) => {
  const {manager} = t.context;
  t.is(manager.settings.autoOpen, false);
  t.is(manager.settings.useHighServer, true);
  t.is(manager.settings.updateStreamingInterval, 3);
  await manager.updateSettings({autoOpen: true});
  t.is(manager.settings.autoOpen, true);
  t.is(manager.settings.useHighServer, true);
  t.is(manager.settings.updateStreamingInterval, 3);
  await manager.updateSettings({useHighServer: false});
  t.is(manager.settings.autoOpen, true);
  t.is(manager.settings.useHighServer, false);
  t.is(manager.settings.updateStreamingInterval, 3);
  await manager.updateSettings({updateStreamingInterval: 10});
  t.is(manager.settings.autoOpen, true);
  t.is(manager.settings.useHighServer, false);
  t.is(manager.settings.updateStreamingInterval, 10);
  await manager.updateSettings({autoOpen: false, useHighServer: true});
  t.is(manager.settings.autoOpen, false);
  t.is(manager.settings.useHighServer, true);
  t.is(manager.settings.updateStreamingInterval, 10);
  await manager.updateSettings({
    autoOpen: true,
    useHighServer: true,
    updateStreamingInterval: 3,
  });
  t.is(manager.settings.autoOpen, true);
  t.is(manager.settings.useHighServer, true);
  t.is(manager.settings.updateStreamingInterval, 3);
  await manager.updateSettings({autoOpen: false, useHighServer: false});
  await manager.updateSettings({autoOpen: false, useHighServer: true});
  await manager.updateSettings({updateStreamingInterval: 1});
  t.is(manager.settings.autoOpen, false);
  t.is(manager.settings.useHighServer, true);
  t.is(manager.settings.updateStreamingInterval, 1);
});

test('update keywords', async (t) => {
  const {manager} = t.context;
  t.deepEqual(manager.keywords.titles, ['amagami']);
  t.deepEqual(manager.keywords.authors, [{
    author: 'sekai',
    compare: 'include',
  }, {
    author: 'hoge',
    compare: 'equal',
  }]);
  t.deepEqual(manager.keywords.tags, ['game']);
  await manager.updateKeywords({titles: ['amagami', 'kimikiss']});
  t.deepEqual(manager.keywords.titles, ['amagami', 'kimikiss']);
  t.deepEqual(manager.keywords.authors, [{
    author: 'sekai',
    compare: 'include',
  }, {
    author: 'hoge',
    compare: 'equal',
  }]);
  t.deepEqual(manager.keywords.tags, ['game']);
  await manager.updateKeywords({
    authors: [{author: 'sekai', compare: 'include'}],
  });
  t.deepEqual(manager.keywords.titles, ['amagami', 'kimikiss']);
  t.deepEqual(manager.keywords.authors, [{
    author: 'sekai',
    compare: 'include',
  }]);
  t.deepEqual(manager.keywords.tags, ['game']);
  await manager.updateKeywords({tags: ['game', 'amagami']});
  t.deepEqual(manager.keywords.titles, ['amagami', 'kimikiss']);
  t.deepEqual(manager.keywords.authors, [{
    author: 'sekai',
    compare: 'include',
  }]);
  t.deepEqual(manager.keywords.tags, ['game', 'amagami']);
});

test('add/delete/edit keyword', async (t) => {
  const {manager} = t.context;
  const authors = [
    {author: 'sekai', compare: 'include'},
    {author: 'hoge', compare: 'equal'},
  ];
  const authorItem = {authors: 'foo', compare: 'include'};
  t.deepEqual(manager.keywords.titles, ['amagami']);
  t.deepEqual(manager.keywords.authors, authors);
  t.deepEqual(manager.keywords.tags, ['game']);
  await manager.addKeyword({type: 'titles', value: 'kimikiss'});
  t.deepEqual(manager.keywords.titles, ['amagami', 'kimikiss']);
  t.deepEqual(manager.keywords.authors, authors);
  t.deepEqual(manager.keywords.tags, ['game']);
  await manager.addKeyword({type: 'authors', value: authorItem});
  t.deepEqual(manager.keywords.titles, ['amagami', 'kimikiss']);
  t.deepEqual(manager.keywords.authors, [...authors, authorItem]);
  t.deepEqual(manager.keywords.tags, ['game']);
  await manager.addKeyword({type: 'tags', value: 'hoge'});
  t.deepEqual(manager.keywords.titles, ['amagami', 'kimikiss']);
  t.deepEqual(manager.keywords.authors, [...authors, authorItem]);
  t.deepEqual(manager.keywords.tags, ['game', 'hoge']);
  await manager.deleteKeyword({type: 'tags', index: 0});
  t.deepEqual(manager.keywords.titles, ['amagami', 'kimikiss']);
  t.deepEqual(manager.keywords.authors, [...authors, authorItem]);
  t.deepEqual(manager.keywords.tags, ['hoge']);
  await manager.deleteKeyword({type: 'authors', index: 2});
  t.deepEqual(manager.keywords.titles, ['amagami', 'kimikiss']);
  t.deepEqual(manager.keywords.authors, authors);
  t.deepEqual(manager.keywords.tags, ['hoge']);
  await manager.editKeyword({
    type: 'titles',
    value: 'hogehoge',
    index: 0,
  });
  t.deepEqual(manager.keywords.titles, ['hogehoge', 'kimikiss']);
  t.deepEqual(manager.keywords.authors, authors);
  t.deepEqual(manager.keywords.tags, ['hoge']);
  await manager.editKeyword({
    type: 'authors',
    value: {author: 'piyo', compare: 'equal'},
    index: 0,
  });
  t.deepEqual(manager.keywords.titles, ['hogehoge', 'kimikiss']);
  t.deepEqual(manager.keywords.authors, [
    {author: 'piyo', compare: 'equal'},
    {author: 'hoge', compare: 'equal'},
  ]);
  t.deepEqual(manager.keywords.tags, ['hoge']);
  await manager.addKeyword({type: 'titles', value: 'aaaa'});
  await manager.addKeyword({type: 'titles', value: 'bbbb'});
  await manager.addKeyword({type: 'titles', value: 'cccc'});
  t.deepEqual(manager.keywords.titles, [
    'hogehoge', 'kimikiss', 'aaaa', 'bbbb', 'cccc',
  ]);
  t.deepEqual(manager.keywords.authors, [
    {author: 'piyo', compare: 'equal'},
    {author: 'hoge', compare: 'equal'},
  ]);
  t.deepEqual(manager.keywords.tags, ['hoge']);
});

test('create/clear notification', async (t) => {
  const {manager, chrome} = t.context;
  const notification = {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'sample notification',
    message: 'sample message',
  };
  const id = await manager.createNotification(notification);
  t.deepEqual(
    chrome.notifications._notification[id],
    Object.assign({}, {id}, notification)
  );
  manager.clearNotification(id);
  t.is(chrome.notifications._notification[id], undefined);
});

test('get diff of streaming list', (t) => {
  const {manager} = t.context;
  const streamings = [{id: 'hogehoge'}, {id: 'piyopiyo'}];
  const newStreamingList = [
    ...streamings,
    {id: 'aaa123', name: 'recently started streaming'},
  ];
  const diff01 = manager.getStreamingListDiff(streamings, newStreamingList);
  t.deepEqual(diff01, [{id: 'aaa123', name: 'recently started streaming'}]);
  const diff02 = manager.getStreamingListDiff(newStreamingList, streamings);
  t.deepEqual(diff02, []);
});

test('extract target streaming list', (t) => {
  const {manager} = t.context;
  const targetStreaming =
    manager.extractTargetStreamingList(DUMMY_STREAMING_DATA);
  t.deepEqual(targetStreaming, DUMMY_STREAMING_DATA.filter((d, i) => i !== 1));
});

test('get host url', async (t) => {
  const {manager} = t.context;
  t.is(manager.getHostURL(), 'http://h.livetube.cc/');
  await manager.updateSettings({useHighServer: false});
  t.is(manager.getHostURL(), 'http://livetube.cc/');
});
