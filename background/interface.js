var BG = {};
	
BG.createVideos = function(arrayOfVideos) {
	var videos = arrayOfVideos || [];

	videos.include = function(video) {
		return this.some(function(item) {
			if(item.id === video.id) {
				return true;
			}
		});
	};

	videos.sendToPopup = function() {
		chrome.runtime.sendMessage(chrome.runtime.id, {
			type: 'updatePopup',
			videos: this
		});

		chrome.browserAction.setBadgeText({text: this.length.toString()});
		chrome.browserAction.setBadgeBackgroundColor({color: '#47A'});
	};

	return videos;
}
