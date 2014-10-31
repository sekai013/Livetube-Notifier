function included(video, videoArray) {
	// if videoArray includes video, return true, else return false
	return videoArray.some(function(item) {
		if(item.id === video.id) {
			return true;
		}
	});
}

function sendVideosToPopup(videos) {
	chrome.runtime.sendMessage(chrome.runtime.id, {
		type: 'updatePopup',
		videos: videos
	});
}

var checkNewVideos = (function() {
	var formerVideos = [];

	return function(currentVideos) {
		var newVideos = [];

		for(var i = 0; i < currentVideos.length; i++) {
			if(!included(currentVideos[i], formerVideos)) {
				newVideos.push(currentVideos[i]);

				chrome.notifications.create('LTN_' + Date.now(), {
					type: 'basic',
					iconUrl: '../img/icon128.png',
					title: 'New video has been started!',
					message: '新しい配信が開始しました: ' + currentVideos[i].author + '/' + currentVideos[i].title
				}, function(id) {
					setTimeout(function() {
						chrome.notifications.clear(id, function() {});
					}, 4000);
				});
			}
		}

		formerVideos = currentVideos;

		return newVideos;
	};
})();

function autoOpenNewVideos(newVideos) {
	chrome.storage.sync.get('state', function(value) {
		if(value.state.autoOpen) {
			var host = (value.state.h)? 'http://h.livetube.cc' : 'http://livetube.cc';
			for(var i = 0; i < newVideos.length; i++) {
				open(host + '/' + newVideos[i].link, null);
			}
		}
	});
}

function extractTargetVideos(json) {
	chrome.storage.sync.get('words', function(value) {
		var words = value.words;
		var videos = [];

		Object.keys(words).forEach(function(type) {
			if(words[type].length === 0) {
			} else {
				for(var i = 0; i < json.length; i++) {
					for(var j = 0; j < words[type].length; j++) {
						if(json[i][type].indexOf(words[type][j]) !== -1) { 
							// if json[i] includes a registered word
							videos.push(json[i]);
							break;
						}
					}
				}
			}
		});

		chrome.browserAction.setBadgeText({text: videos.length.toString()});
		chrome.browserAction.setBadgeBackgroundColor({color: '#47A'});

		sendVideosToPopup(videos);
		var newVideos = checkNewVideos(videos);
		if(newVideos) {
			autoOpenNewVideos(newVideos);
		}

	});
}

function refreshVideos() {
	$.ajax({
		url: 'http://livetube.cc/index.live.json',
		type: 'get',
		success: function(json) {
			extractTargetVideos(json);
		}
	});
}

chrome.runtime.onMessage.addListener(function(message, sender, response) {
	switch(message.type) {
		case 'popupOpened':
			refreshVideos();
			break;

		case 'startGettingVideos':
			refreshVideos();

			chrome.storage.sync.get('state', function(value) {
				var newValue = value;
				newValue.state.gettingVideos = true;

				chrome.alarms.create('refreshVideos', {
					periodInMinutes: value.state.intervalInMinutes
				});

				chrome.storage.sync.set(newValue, function(){});
			});

			chrome.notifications.create('LTN_' + Date.now(), {
				type: 'basic',
				iconUrl: '../img/icon128.png',
				title: 'Start Getting Videos!',
				message: '動画の取得を開始しました'
			}, function(id) {
				setTimeout(function() {
					chrome.notifications.clear(id, function() {});
				}, 2000);
			});
			break;

		case 'stopGettingVideos':
			chrome.alarms.clear('refreshVideos', function(){});
				
			chrome.storage.sync.get('state', function(value) {
				var newValue = value;
				newValue.state.gettingVideos = false;
				chrome.storage.sync.set(newValue, function(){});
			});

			chrome.notifications.create('LTN_' + Date.now(), {
				type: 'basic',
				iconUrl: '../img/icon128.png',
				title: 'Start Getting Videos!',
				message: '動画の取得を開始しました'
			}, function(id) {
				setTimeout(function() {
					chrome.notifications.clear(id, function() {});
				}, 2000);
			});

			chrome.browserAction.setBadgeText({text: ''});
			break;

		case 'changeUpdateInterval':
			// if an alarm with the same name already exists, it is replaced by new one
			chrome.alarms.create('refreshVideos', {periodInMinutes: message.intervalInMinutes});
			break;

		case 'wordDeleted':
			chrome.notifications.create('LTN_' + Date.now(), {
				type: 'basic',
				iconUrl: '../img/icon128.png',
				title: 'Deleted',
				message: 'ワードを削除しました: ' + message.wordType + ' - ' + message.word
			}, function(id) {
				setTimeout(function() {
					chrome.notifications.clear(id, function() {});
				}, 2000);
			});
			break;

		case 'wordRegistered':
			chrome.notifications.create('LTN_' + Date.now(), {
				type: 'basic',
				iconUrl: '../img/icon128.png',
				title: 'Registered!',
				message: 'ワードを登録しました: ' + message.wordType + ' - ' + message.word
			}, function(id) {
				setTimeout(function() {
					chrome.notifications.clear(id, function() {});
				}, 2000);
			});
			break;
	}
});

chrome.alarms.onAlarm.addListener(function(alarm) {
	if(alarm.name === 'refreshVideos') {
		refreshVideos();
	}
});

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.get('state', function(value) {
		var newValue = value;
		newValue.state = {
			gettingVideos:     false,
			h:                 false,
			autoOpen:          false,
			intervalInMinutes: 1
		};
		chrome.storage.sync.set(newValue, function(){});
	});
});
