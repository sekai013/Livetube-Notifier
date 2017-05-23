/* @flow */
class Storage {
  _storage: Object;
  set: (obj: Object, cb: func) => void;
  get: (query: string, cb: func) => void;
  constructor(): void {
    this._storage = {};
    this.get = (query: string, cb: func): void => {
      if (typeof cb === 'function') {
        cb({[query]: this.storage[query]});
      }
    };
    this.set = (obj: Object, cb: func): void => {
      this.storage = Object.assign({}, this.storage, obj);
      if (typeof cb === 'function') {
        cb();
      }
    };
  }

  get storage(): Object {
    return Object.assign({}, this._storage);
  }

  set storage(storage): void {
    this._storage = Object.assign(this.storage, storage);
  }
}

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

type NotificationItem = {
  id: string,
  type: NotificationType,
  iconUrl: string,
  title: string,
  message: string,
}

class Notifications {
  _notification: Object;
  create: (id: string, notification: Notification, cb: func) => void;
  clear: (id: string, cb: func) => void;
  constructor() {
    this._notification = {};
    this.create = (id: string, notification: Notification, cb: func): void => {
      const queueItem = Object.assign({}, {id}, notification);
      this.push(queueItem);
      if (typeof cb === 'function') {
        cb(id);
      }
    };
    this.clear = (id: string, cb: func): void => {
      this.remove(id);
      if (typeof cb === 'function') {
        cb();
      }
    };
  }

  push(item: NotificationItem): void {
    this._notification[item.id] = item;
  }

  remove(id: string): void {
    delete this._notification[id];
  }
}

type PeriodInMinutes =
| 1 | 3 | 5 | 10

type Alarm = {
  periodInMinutes: PeriodInMinutes,
}

class OnMessage {
  _listener: Object;
  addListener: (listener: func) => void;
  constructor() {
    this._listener = {};
    this.addListener = (listener: func) => {
      this._listener[listener.name] = listener;
    };
  }
}

class Alarms {
  _alarm: Object;
  create: (name: string, alarm: Alarm) => void;
  clear: (name: string, cb: func) => void;
  onAlarm: OnMessage;
  constructor() {
    this._alarm = {};
    this.create = (name: string, alarm: alarm): void => {
      const item = Object.assign({}, alarm);
      this.push(name, item);
    };
    this.clear = (name: string, cb: func): void => {
      this.remove(name);
      if (typeof cb === 'function') {
        cb();
      }
    };
    this.onAlarm = new OnMessage();
  }

  push(name: string, item: Alarm): void {
    this._alarm[name] = item;
  }

  remove(name: string): void {
    delete this._alarm[name];
  }
}

class BrowserAction {
  _badgeText: string;
  _badgeBackgroundColor: string;
  setBadgeText: (option: {text: string, tabId: number}) => void;
  setBadgeBackgroundColor: (option: {color: string, tabId: number}) => void;
  constructor() {
    this._badgeText = '';
    this._badgeBackgroundColor = '';
    this.setBadgeText = (option: {text: string, tabId: number}): void => {
      this._badgeText = option.text.toString();
    };
    this.setBadgeBackgroundColor = (option: {
      color: string,
      tabId: number,
    }): void => {
      this._badgeBackgroundColor = option.color.toString();
    };
  }
}

class Chrome {
  storage: {sync: Storage};
  notifications: Notifications;
  alarms: Alarms;
  browserAction: BrowserAction;
  runtime: {onMessage: OnMessage};
  constructor() {
    this.storage = {sync: new Storage()};
    this.notifications = new Notifications();
    this.alarms = new Alarms();
    this.browserAction = new BrowserAction();
    this.runtime = {onMessage: new OnMessage()};
  }
}

export default Chrome;
