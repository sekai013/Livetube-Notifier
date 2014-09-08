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
			if( !checkVideo(current[i], formerList) ) {
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
	}
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
		checkNewVideos(movies, formerList);
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
	if(message.type === 'popupOpened') {
		updateVideoList();
	}
});

chrome.runtime.onMessage.addListener(function(message, sender, response) {
	if(message.type === 'start') {
		chrome.alarms.create('repeat', { periodInMinutes: 1 });
		updateVideoList();
		chrome.storage.sync.get('getting', function(value) {
			newValue = value;
			newValue.getting = 1;
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
	} else if(message.type === 'stop') {
		chrome.alarms.clear('repeat', function() {});
		chrome.storage.sync.get('getting', function(value) {
			var newValue = value;
			newValue.getting = 0;
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
	}
});

chrome.alarms.onAlarm.addListener(function(alarm) {
	if(alarm.name === 'repeat') {
		updateVideoList();
	}
});
