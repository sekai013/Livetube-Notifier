'use strict'

APIs = [
  'http://livetube.cc/index.live.json'
  'http://h.livetube.cc/index.live.json'
  'http://t.livetube.cc/index.live.json'
  'http://z.livetube.cc/index.live.json'
]


Videos = (arrayOfVideos) ->
  videos = arrayOfVideos or []

  videos.include = (item) ->
    @some (video) ->
      true if video.id is item.id

  videos

storage = {}


chrome.storage.sync.get 'status', (value) ->
  storage['status'] = value
chrome.storage.sync.get 'words', (value) ->
  storage['words'] = value


createNotification = ({ title, message, clearIntervalInMSec }) ->
  chrome.notifications.create "LTN_#{Date.now()}",
    type   : 'basic'
    iconUrl: 'icons/icon128.png'
    title  : title
    message: message
    , (id) ->
      setTimeout ->
        chrome.notifications.clear id, ->,
      , clearIntervalInMSec


checkNewVideos = do ->
  formerVideos = new Videos

  (currentVideos) ->
    newVideos = new Videos

    for video in currentVideos
      if formerVideos.include video
        continue
      else
        newVideos.push video
        createNotification
          title  : 'New video has been started!'
          message: "新しい配信が開始しました: #{video.author}/#{video.title}"
          clearIntervalInMSec: 4000

    formerVideos = currentVideos

    newVideos


openVideos = (videos) ->
  host =
    if storage['status'].status.useHServer is true
      'http://h.livetube.cc/'
    else
      'http://livetube.cc/'

  for video in videos
    open host + video.link, null


extractVideos = (videos, words) ->
  result  = new Videos
  indexes = []

  for video in videos
    for word in words
      if video[word.type].indexOf(word.text) isnt -1
        result.push video
        break

  result


sendVideosToPopup = (videos) ->
  chrome.runtime.sendMessage chrome.runtime.id,
    action: 'updatePopup'
    videos: videos

  chrome.browserAction.setBadgeText
    text: videos.length.toString()

  chrome.browserAction.setBadgeBackgroundColor
    color: '#47A'


updateVideos = ->
  randomIndex = Math.floor((Math.random() * APIs.length))
  api = APIs[randomIndex]
  xhr = new XMLHttpRequest
  xhr.open 'GET', api, true
  xhr.onreadystatechange = ->
    if xhr.readyState is 4 and xhr.status is 200
      allVideos     = JSON.parse xhr.responseText
      currentVideos = extractVideos allVideos, storage['words'].words
      newVideos     = checkNewVideos currentVideos
      sendVideosToPopup currentVideos
      openVideos(newVideos) if storage['status'].status.autoOpen
  xhr.send()

updateStatus = (propertyName, newVideos, callback = ->) ->
  storage['status'].status[propertyName] = newVideos
  chrome.storage.sync.set storage['status'], callback


chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
  actions =
    updateVideos: ->
      updateVideos()

    startGettingVideos: ->
      updateStatus 'gettingVideos', true, ->
        updateVideos()
        chrome.alarms.create 'updateVideos',
          periodInMinutes: +storage['status'].status.updateIntervalInMinutes
        createNotification
          title  : 'Start Getting Videos!'
          message: "動画の取得を開始しました"
          clearIntervalInMSec: 2000

    stopGettingVideos: ->
      updateStatus 'gettingVideos', false, ->
        chrome.alarms.clear 'updateVideos', ->
          chrome.browserAction.setBadgeText
            text: ''
          createNotification
            title  : 'Stop Getting Videos'
            message: "動画の取得を停止しました"
            clearIntervalInMSec: 2000

    updateStatus: ->
      updateStatus request.property, request.newValue
      if storage['status'].status.gettingVideos and request.property is 'updateIntervalInMinutes'
        chrome.alarms.create 'updateVideos',
          periodInMinutes: +request.newValue

    registerWord: ->
      storage['words'].words.push request.word
      chrome.storage.sync.set storage['words'], ->

    deleteWord: ->
      for word, index in storage['words'].words
        if word.id is request.id
          storage['words'].words.splice index, 1
          break
      chrome.storage.sync.set storage['words'], ->

  if request.action of actions
    actions[request.action]()


chrome.alarms.onAlarm.addListener (alarm) ->
  actions =
    updateVideos: ->
      updateVideos()

  if alarm.name of actions
    actions[alarm.name]()


# Data initializing
# format old version(<= 1.3.0) data
# from the next update, use code commented out below instead

chrome.runtime.onInstalled.addListener ->
  chrome.storage.sync.get 'state', (value) ->
    if value.state
      status =
        gettingVideos: value.state.gettingVideos
        useHServer   : value.state.h
        autoOpen     : value.state.autoOpen
        updateIntervalInMinutes: value.state.intervalInMinutes

    else
      status =
        gettingVideos: false
        useHServer   : false
        autoOpen     : false
        updateIntervalInMinutes: 5

    value.status = status
    chrome.storage.sync.set value, ->
      chrome.storage.sync.remove 'state'
      storage['status'] = value

  chrome.storage.sync.get 'words', (value) ->
    words = []

    if value.words
      for type, textList of value.words
        for text, index in textList
          word =
            type: type
            text: text
            id  : "#{type}#{index}"

          words.push word

    value.words = words
    chrome.storage.sync.set value, ->
      storage['words'] = value

###
chrome.runtime.onInstalled.addListener ->
  chrome.storage.sync.get 'status', (value) ->
    value.status = value.status or
      gettingVideos: false
      useHServer   : false
      autoOpen     : false
      updateIntervalInMinutes: 5

    chrome.storage.sync.set value, ->
      storage['status'] = value

  chrome.storage.sync.get 'words', (value) ->
    value.words = value.words or []

    chrome.storage.sync.set value, ->
      storage['words'] = value
###
