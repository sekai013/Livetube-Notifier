var formerList = [];

function checkVideo(video, list) {
	return list.some( function(item) {
		if(video.id === item.id) {
			return true;
		}
	});
}

function checkNewVideos(current, former) {
	var newVideos = [];
	if(former.length) {
		for(var i = 0; i < current.length; i++) {
			if( !checkVideo(current[i], former) ) {
				newVideos.push(current[i]);
			}
		}
	} else {
		newVideos = current;
	}
	if( newVideos.length ) {
		for(var k = 0; k < newVideos.length; k++) {
			chrome.notifications.create('LTN_' + Date.now(), {
				type: 'basic',
				iconUrl: '../img/icon128.png',
				title: 'New video has been started!',
				message: '新しい配信が開始しました: ' + newVideos[k].author + '/' + newVideos[k].title
			}, function(id) {
				setTimeout(function() {
					chrome.notifications.clear(id, function() {});
				}, 4000);
			});
		}
		return newVideos;
	}
}

function autoOpen(videos) {
	chrome.storage.sync.get('state', function(value) {
		if(value.state.h) {
			var url = 'http://h.livetube.cc';
		} else {
			var url = 'http://livetube.cc';
		}
		for(var i in videos) {
			open(url + '/' + videos[i].link, null);
		}
	});
}

function getMovies(json) {
	chrome.storage.sync.get('words', function(value) {
		var movies = [];
		var words = value.words;

		Object.keys(words).forEach(function(type) {
			for(var i = 0; i < json.length; i++) {
				for(var j = 0; j < words[type].length; j++) {
					if(json[i][type].indexOf(words[type][j]) !== -1) {
						movies.push(json[i]);
						break;
					}
				}
			}
		});
		chrome.browserAction.setBadgeText( { text: movies.length.toString() } );
		chrome.browserAction.setBadgeBackgroundColor( { color: '#47A' } );
		chrome.runtime.sendMessage(chrome.runtime.id, { type: 'update', movies: movies });
		var newVideos = checkNewVideos(movies, formerList);
		chrome.storage.sync.get('state', function(value) {
			if(value.state.autoOpen) {
				autoOpen(newVideos);
			}
		});
		formerList = movies;
	});
}

function updateVideoList() {
	$.ajax( {
		url: 'http://livetube.cc/index.live.json',
		type: 'get',
		success: function(res) {
			getMovies(res);
		}
	} );
}

chrome.runtime.onMessage.addListener(function(message, sender, response) {
	switch(message.type) {
		case 'popupOpened':
			updateVideoList();
			break;

		case 'start':
			chrome.storage.sync.get('state', function(value) {
				chrome.alarms.create('repeat', { periodInMinutes: parseInt(value.state.interval) });
				updateVideoList();
				var newValue = value;
				newValue.state.getting = 1;
				chrome.storage.sync.set(newValue, function() {} );
			});
			chrome.notifications.create('LTN_' + Date.now(), {
				type: 'basic',
				iconUrl: '../img/icon128.png',
				title: 'Start getting videos!',
				message: '動画の取得を開始しました'
			}, function(id) {
				setTimeout(function() {
					chrome.notifications.clear(id, function() {});
				}, 2000);
			});
			break;

		case 'stop':
			chrome.alarms.clear('repeat', function() {});
			chrome.storage.sync.get('state', function(value) {
				var newValue = value;
				newValue.state.getting = 0;
				chrome.storage.sync.set(newValue, function() {} );
			});
			chrome.notifications.create('LTN_' + Date.now(), {
				type: 'basic',
				iconUrl: '../img/icon128.png',
				title: 'Stop getting videos',
				message: '動画の取得を停止しました'
			}, function(id) {
				chrome.browserAction.setBadgeText( { text: '' } );
				setTimeout(function() {
					chrome.notifications.clear(id, function() {});
				}, 2000);
			});
			formerList = [];
			break;

		case 'deleted':
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

		case 'registered':
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

		case 'changeInterval':
			chrome.alarms.create('repeat', { periodInMinutes: parseInt(message.interval) });
			break;
	}
});

chrome.alarms.onAlarm.addListener(function(alarm) {
	if(alarm.name === 'repeat') {
		updateVideoList();
	}
});
