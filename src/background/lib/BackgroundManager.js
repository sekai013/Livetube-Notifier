/* @flow */
import ChromePromise from 'chrome-promise';
import getGlobal from 'get-global';
import fetchStreamingData from './fetchStreamingData.js';

const isObject = (obj: any): boolean => {
  return obj.constructor === Object;
};

const COMPARE = {
  include: 'include',
  equal: 'equal',
};

const NOTIFICATION_TYPE = {
  basic: 'basic',
  image: 'image',
  list: 'list',
  progress: 'progress',
};

const ICON_URL = {
  icon128: 'icons/icon128.png',
};

const TITLE = {
  startGettingStreamingList: 'Start Getting Streaming!',
  stopGettingStreamingList: 'Stop Getting Streaming',
  updateStreamingList: 'New Streaming has been started!',
};

const MESSAGE = {
  startGettingStreamingList: '動画の取得を開始しました',
  stopGettingStreamingList: '動画の取得を終了しました',
  updateStreamingList: '新しい配信が開始しました',
};

const NOTIFICATION_INTERVAL = {
  startGettingStreamingList: 2000,
  stopGettingStreamingList: 2000,
  updateStreamingList: 4000,
};

type Settings = {
  autoOpen: boolean,
  useHighServer: boolean,
  updateStreamingInterval: number,
};

// type Compare =
// | 'include'
// | 'equal'

type Keywords = {
  titles: Array<any>,  // Array<{text: string}>
  authors: Array<any>, // Array<{text: string, compare: Compare}>
  tags: Array<any>,    // Array<{text: string}>
};

type KeywordType =
| 'titles'
| 'authors'
| 'tags'

type KeywordInfo = {
  type: KeywordType,
  value: any,
  index: number,
};

type NotificationType =
| 'basic'
| 'image'
| 'list'
| 'progress'

type Notification = {
  type: NotificationType,
  iconUrl: string,
  title: string,
  message: string,
}

type Streaming = {
  id: string,
  link: string,
  author: string,
  title: string,
  viewing: number,
  view: number,
  comments: number,
  created: string,
  tags: Array<string>,
};

class BackgroundManager {
  chrome: Object;
  originalChrome: Object;
  _storage: {
    gettingStreamingList: boolean,
    settings: Settings,
    keywords: Keywords,
  };
  _targetStreamingList: Array<Streaming>;
  constructor(option: { chrome: Object }): void {
    const global = getGlobal();
    const chrome = option.chrome || global.chrome;
    if (!chrome) throw new Error('chrome is not defined');
    this.chrome = new ChromePromise({chrome: chrome});
    this.originalChrome = chrome;
    this._storage = {
      gettingStreamingList: false,
      settings: {
        autoOpen: false,
        useHighServer: false,
        updateStreamingInterval: 5,
      },
      keywords: {
        titles: [],
        authors: [],
        tags: [],
      },
    };
    this._targetStreamingList = [];
  }

  get gettingStreamingList(): boolean {
    return this._storage.gettingStreamingList;
  }

  set gettingStreamingList(gettingStreamingList: boolean): void {
    this._storage.gettingStreamingList = gettingStreamingList;
  }

  get settings(): Settings {
    return Object.assign({}, this._storage.settings);
  }

  set settings(settings: Settings): void {
    this._storage.settings = settings;
  }

  get keywords(): Keywords {
    return Object.assign({}, this._storage.keywords);
  }

  set keywords(keywords: Keywords): void {
    this._storage.keywords = keywords;
  }

  get targetStreamingList(): Array<Streaming> {
    return [...this._targetStreamingList];
  }

  set targetStreamingList(streamingList: Array<Streaming>): void {
    this._targetStreamingList = streamingList;
  }

  async updateStorage(key: string, value: any): Promise<void> {
    if (isObject(this._storage[key]) && isObject(value)) {
      const newValue = Object.assign({}, this._storage[key], value);
      this._storage[key] = newValue;
      await this.chrome.storage.sync.set({[key]: newValue});
    } else {
      this._storage[key] = value;
      await this.chrome.storage.sync.set({[key]: value});
    }
  }

  async initializeStorage(key: string, defaultValue: any): Promise<void> {
    const storedValue = (await this.chrome.storage.sync.get(key))[key];
    if (key === 'gettingStreamingList' && storedValue === true) {
      await this.startGettingStreamingList(true);
    }
    if (typeof storedValue !== 'undefined') {
      this._storage[key] = storedValue;
      console.log(key, 'existed:', storedValue);
      return;
    } else {
      console.log(key, 'not existed');
    }
    await this.updateStorage(key, defaultValue);
  }

  async initialize(): Promise<void> {
    await this.initializeStorage('settings', {
      autoOpen: false,
      useHighServer: false,
      updateStreamingInterval: 5,
    });
    await this.initializeStorage('keywords', {
      titles: [],
      authors: [],
      tags: [],
    });
    await this.initializeStorage('gettingStreamingList', false);

    const messageListener = async (request, sender, sendResponse) => {
      const actions = {
        initializePopup: async () => {
          if (this.gettingStreamingList) {
            this.sendStreamingListUpdateRequest();
            await this.updateStreamingList();
            this.sendStreamingListUpdateRequest();
          }
        },
        startGettingStreamingList: async () => {
          await this.startGettingStreamingList();
        },
        stopGettingStreamingList: async () => {
          await this.stopGettingStreamingList();
        },
        addKeyword: async () => {
          await this.addKeyword(request.keyword);
        },
        deleteKeyword: async () => {
          await this.deleteKeyword(request.keyword);
        },
        editKeyword: async () => {
          await this.editKeyword(request.keyword);
        },
        updateSettings: async () => {
          const newSettings = Object.assign({}, this.settings, {
            [request.settingType]: request.value,
          });
          await this.updateSettings(newSettings);
          if (request.settingType === 'updateStreamingInterval') {
            this.createAlarms();
          }
        },
      };

      if (Object.keys(actions).includes(request.type)) {
        await actions[request.type]();
      }
    };

    this.originalChrome.runtime.onMessage.addListener(messageListener);

    const alarmListener = async (alarm) => {
      const actions = {
        updateStreamingList: async () => {
          await this.updateStreamingList();
        },
      };

      if (alarm.name in actions) {
        await actions[alarm.name]();
      }
    };

    this.originalChrome.alarms.onAlarm.addListener(alarmListener);
  }

  async updateStreamingList(): Promise<void> {
    const newStreamingList =
      this.extractTargetStreamingList(await fetchStreamingData());
    const listDiff =
      this.getStreamingListDiff(this.targetStreamingList, newStreamingList);
    this.originalChrome.browserAction.setBadgeText({
      text: `${newStreamingList.length}`,
    });
    this.originalChrome.browserAction.setBadgeBackgroundColor({color: '#47A'});
    this.targetStreamingList = newStreamingList;

    if (listDiff.length > 0) {
      const promises = listDiff.map((d) => {
        return this.createNotification({
          type: NOTIFICATION_TYPE.basic,
          iconUrl: ICON_URL.icon128,
          title: TITLE.updateStreamingList,
          message: `${MESSAGE.updateStreamingList}: ${d.author}/${d.title}`,
        });
      });
      const notificationIdList = await Promise.all(promises);
      setTimeout(() => {
        notificationIdList.map((id) => this.clearNotification(id));
      }, NOTIFICATION_INTERVAL.updateStreamingList);

      const global = getGlobal();
      if (this.settings.autoOpen && global && global.open) {
        const hostURL = this.getHostURL();
        listDiff.map((d) => global.open(`${hostURL}${d.link}`));
      }
    }
  }

  async startGettingStreamingList(): Promise<void> {
    await this.updateStorage('gettingStreamingList', true);
    const notificationId = await this.createNotification({
      type: NOTIFICATION_TYPE.basic,
      iconUrl: ICON_URL.icon128,
      title: TITLE.startGettingStreamingList,
      message: MESSAGE.startGettingStreamingList,
    });
    setTimeout(async () => {
      await this.clearNotification(notificationId);
    }, NOTIFICATION_INTERVAL.startGettingStreamingList);
    await this.updateStreamingList();
    this.sendStreamingListUpdateRequest();
    this.createAlarms();
  }

  async stopGettingStreamingList(): Promise<void> {
    await this.updateStorage('gettingStreamingList', false);
    const notificationId = await this.createNotification({
      type: NOTIFICATION_TYPE.basic,
      iconUrl: ICON_URL.icon128,
      title: TITLE.stopGettingStreamingList,
      message: MESSAGE.stopGettingStreamingList,
    });
    setTimeout(async () => {
      await this.clearNotification(notificationId);
    }, NOTIFICATION_INTERVAL.stopGettingStreamingList);
    this.targetStreamingList = [];
    this.originalChrome.browserAction.setBadgeText({text: ''});
    await this.chrome.alarms.clear('updateStreamingList');
    this.sendStreamingListUpdateRequest();
  }

  async updateSettings(settings: Settings): Promise<void> {
    await this.updateStorage('settings', settings);
  }

  async updateKeywords(keywords: Keywords): Promise<void> {
    await this.updateStorage('keywords', keywords);
  }

  async addKeyword(info: KeywordInfo): Promise<void> {
    const keywords = this.keywords;
    keywords[info.type].push(info.value);
    await this.updateKeywords(keywords);
  }

  async deleteKeyword(info: KeywordInfo): Promise<void> {
    const keywords = this.keywords;
    keywords[info.type].splice(info.index, 1);
    await this.updateKeywords(keywords);
  }

  async editKeyword(info: KeywordInfo): Promise<void> {
    const keywords = this.keywords;
    keywords[info.type].splice(info.index, 1, info.value);
    await this.updateKeywords(keywords);
  }

  async createNotification(option: Notification): Promise<string> {
    const id = `LTN_${Date.now()}`;
    return await this.chrome.notifications.create(id, option);
  }

  async clearNotification(id: string): Promise<void> {
    await this.chrome.notifications.clear(id);
  }

  getStreamingListDiff(
    streamingList: Array<Streaming>,
    newStreamingList: Array<Streaming>
  ): Array<Streaming> {
    const ids = streamingList.map((streaming) => streaming.id);
    return newStreamingList.filter((streaming) => !ids.includes(streaming.id));
  }

  extractTargetStreamingList(
    streamingList: Array<Streaming>
  ): Array<Streaming> {
    const testStreaming = (streaming: Streaming): boolean => {
      const {titles, authors, tags} = this.keywords;

      const testTitle = (title) => {
        return streaming.title.toUpperCase().includes(title.text.toUpperCase());
      };

      const testAuthor = (author) => {
        return author.compare === COMPARE.include
            ? streaming.author.includes(author.text)
            : streaming.author === author.text;
      };

      const testTag = (tag) => {
        const tags = streaming.tags.map((tag) => tag.toUpperCase());
        return tags.includes(tag.text.toUpperCase());
      };

      return titles.filter(testTitle).length > 0
          || authors.filter(testAuthor).length > 0
          || tags.filter(testTag).length > 0;
    };

    return streamingList.filter(testStreaming);
  }

  getHostURL(): string {
    return this.settings.useHighServer
        ? 'http://h.livetube.cc/'
        : 'http://livetube.cc/';
  }

  sendStreamingListUpdateRequest(): void {
    this.originalChrome.runtime.sendMessage({
      type: 'updateStreamingList',
      streamingList: this.targetStreamingList,
    });
  }

  createAlarms(): void {
    this.originalChrome.alarms.create(
      'updateStreamingList',
      {periodInMinutes: this.settings.updateStreamingInterval}
    );
  }
}

export default BackgroundManager;
