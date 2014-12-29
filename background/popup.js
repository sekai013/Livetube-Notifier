$(function() {
	// initializing
	chrome.storage.sync.get('state', function(value) {
		if(!value.state) {
			var newValue = value;
			newValue.state = {
				gettingVideos:     false,
				h:                 false,
				autoOpen:          false,
				intervalInMinutes: 1
			};
			chrome.storage.sync.set(newValue, function(){});
		} else {
			if(value.state.gettingVideos) {
				$('#toggle').removeClass('toStart').text('配信取得停止');
				chrome.runtime.sendMessage(chrome.runtime.id, {type: 'popupOpened'});
			}
			if(value.state.h) {
				$('#hServer')[0].checked = 'checked';
			}
			if(value.state.autoOpen) {
				$('#autoOpen')[0].checked = 'checked';
			}
			$('#min' + value.state.intervalInMinutes)[0].selected = true;
		}
	});

	// panel 1
	var toggleClickHandler = function() {
		if($(this).is('.toStart')) {
			$(this).removeClass('toStart').text('配信取得停止');
			chrome.runtime.sendMessage(chrome.runtime.id, {type: 'startGettingVideos'});
		} else {
			$(this).addClass('toStart').text('配信取得開始');
			chrome.runtime.sendMessage(chrome.runtime.id, {type: 'stopGettingVideos'});
		}
	};

	$('#toggle').on('click', toggleClickHandler);

	var serverChangeHandler = function(e) {
		chrome.storage.sync.get('state', function(value) {
			var newValue = value;
			if(e.target.checked) {
				newValue.state.h = true;
			} else {
				newValue.state.h = false;
			}
			chrome.storage.sync.set(newValue, function(){});
		});
	};

	$('#hServer').on('change', serverChangeHandler);

	var autoOpenChangeHandler = function(e) {
		chrome.storage.sync.get('state', function(value) {
			var newValue = value;
			if(e.target.checked) {
				newValue.state.autoOpen = true;
			} else {
				newValue.state.autoOpen = false;
			}
			chrome.storage.sync.set(newValue, function(){});
		});
	};

	$('#autoOpen').on('change', autoOpenChangeHandler);

	var intervalChangeHandler = function(e) {
		chrome.storage.sync.get('state', function(value) {
			var newValue = value;
			newValue.state.intervalInMinutes = parseInt(e.target.value);

			if(value.state.gettingVideos) {
				chrome.runtime.sendMessage(chrome.runtime.id, {type: 'changeUpdateInterval', intervalInMinutes: parseInt(e.target.value)});
			}
			chrome.storage.sync.set(newValue, function(){});
		});
	};

	$('#intervalSelector').on('change', intervalChangeHandler);

	chrome.runtime.onMessage.addListener(function(message, sender, response) {
		if(message.type === 'updatePopup') {
			var videos = message.videos;
			$('#videoList').find('div').remove();

			videos.forEach(function(video) {
				var div = $('<div>');
				var host = ($('#hServer')[0].checked)? 'http://h.livetube.cc' : 'http://livetube.cc';
				var title = $('<span>').html('配信名: <a href=' + host + '/' + video.link + ' target="_blank">' + video.title + '</a>');
				var author = $('<span>').html('配信者名: <a href=' + host + '/' + encodeURI(video.author) + ' target="_blank">' + video.author + '</a>');

				for(var i in video.tags) {
					video.tags[i] = '<a href=' + host + '/' + 'tag.' + encodeURI(video.tags[i]) + ' target="_blank">' + video.tags[i] + '</a>';
				}
				var tags = $('<span>').html('タグ: ' + video.tags.join(','));

				div.append(title).append('<br>').append(author).append('<br>').append(tags);
				$('#videoList').append(div);
			});
		}
	});

	// panel 2
	var typeObj= {title: '配信名', author: '配信者名', tags: 'タグ'};

	var deleteWord = function() {
	 var type  = this.id.split('_')[0];
	 var index = this.id.split('_')[1];

	 chrome.storage.sync.get('words', function(value) {
		 var newValue = value;
		 var word = newValue.words[type][index];
		 newValue.words[type].splice(index, 1);

		 chrome.storage.sync.set(newValue, function() {
			 var spans = $('#' + type).find('span');

			 spans[index].remove();
			 spans.splice(index, 1);

			 for(var i = index; i < spans.length; i++) {
				 spans[i].id = type + '_' + i;
			 }
		 });

		 chrome.runtime.sendMessage(chrome.runtime.id, {
			 type: 'wordDeleted',
			 word: word,
			 wordType: typeObj[type]
		 });
	 });
 };

 chrome.storage.sync.get('words', function(value) {
	 var words = value.words;
	 Object.keys(words).forEach(function(type) {
		 for(var i = 0; i < words[type].length; i++) {
			 var elem = $('<span>').prop('id', type + '_' + i).text(words[type][i] + ' ').on('click', deleteWord);
			 $('#' + type).append(elem);
		 }
	 });
 });

 var registerButtonHandler = function() {
	 if($('#word').val()) {
		 chrome.storage.sync.get('words', function(value) {
			 var newValue = value;
			 newValue.words = newValue.words || {title: [], author: [], tags: []};
			 var type = $('#typeSelector').val();
			 var idNum = newValue.words[type].length;

			 newValue.words[type].push($('#word').val());
			 chrome.storage.sync.set(newValue, function() {
				 var elem = $('<span>').prop('id', type + '_' + idNum).text($('#word').val() + ' ').on('click', deleteWord);
				 $('#' + type).append(elem);
				 $('#word').val('');
			 });

			 chrome.runtime.sendMessage(chrome.runtime.id, { 
				 type: 'wordRegistered',
				 word: $('#word').val(),
				 wordType: typeObj[type]
			 });
		 });
	 }
 };

 $('#register').on('click', registerButtonHandler);
})
