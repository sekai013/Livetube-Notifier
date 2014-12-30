var checkNewVideos = (function() {
	var formerVideos = BG.createVideos();

	return function(currentVideos) {
		var newVideos = BG.createVideos();

		for(var i = 0; i < currentVideos.length; i++) {
			if(!formerVideos.include(currentVideos[i])) {
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

var autoOpenNewVideos = function(newVideos) {
	chrome.storage.sync.get('state', function(value) {
		if(value.state.autoOpen) {
			var host = (value.state.h)? 'http://h.livetube.cc' : 'http://livetube.cc';

			for(var i = 0; i < newVideos.length; i++) {
				open(host + '/' + newVideos[i].link, null);
			}
		}
	});
};

var refreshVideos = function() {
	$.ajax({
		url: 'http://livetube.cc/index.live.json',
		type: 'get',
		success: function(json) {
			chrome.storage.sync.get('words', function(value) {
				var words         = value.words;
				var types         = Object.keys(words);
				var currentVideos = BG.createVideos();

				for(var i = 0; i < json.length; i++) {
					check: for(j = 0; j < types.length; j++) {
						for(var k = 0; k < words[types[j]].length; k++) {
							if(json[i][types[j]].indexOf(words[types[j]][k]) !== -1) {
								// if json[i] includes a registered word
								currentVideos.push(json[i]);
								break check;
							}
						}
					}
				}

				var newVideos = checkNewVideos(currentVideos);

				currentVideos.sendToPopup();
				if(newVideos.length !== 0) {
					autoOpenNewVideos(newVideos);
				}
			});
		}
	});
};

chrome.runtime.onMessage.addListener(function(message, sender, response) {
	var actions = {
		popupOpened: function() {
			refreshVideos();
		},

		startGettingVideos: function() {
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
		},

		stopGettingVideos: function() {
			chrome.alarms.clear('refreshVideos', function(){});

			chrome.storage.sync.get('state', function(value) {
				var newValue = value;

				newValue.state.gettingVideos = false;
				chrome.storage.sync.set(newValue, function(){});
			});

			chrome.notifications.create('LTN_' + Date.now(), {
				type   : 'basic',
				iconUrl: '../img/icon128.png',
				title  : 'Stop Getting Videos',
				message: '動画の取得を停止しました'
			}, function(id) {
				setTimeout(function() {
					chrome.notifications.clear(id, function() {});
				}, 2000);
			});

			chrome.browserAction.setBadgeText({text: ''});
		},

		changeUpdateInterval: function() {
			// if an alarm with the same name already exists, it is replaced by new one
			chrome.alarms.create('refreshVideos', {periodInMinutes: message.intervalInMinutes});
		},

		wordDeleted: function() {
			chrome.notifications.create('LTN_' + Date.now(), {
				type   : 'basic',
				iconUrl: '../img/icon128.png',
				title  : 'Deleted',
				message: 'ワードを削除しました: ' + message.wordType + ' - ' + message.word
			}, function(id) {
				setTimeout(function() {
					chrome.notifications.clear(id, function() {});
				}, 2000);
			});
		},

		wordRegistered: function() {
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
		}
	};

	if(message.type in actions) {
		actions[message.type]();
	}
});

chrome.alarms.onAlarm.addListener(function(alarm) {
	var actions = {
		refreshVideos: function() {
			refreshVideos();
		}
	};

	if(alarm.name in actions) {
		actions[alarm.name]();
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
