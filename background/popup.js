$(function() {
	chrome.storage.sync.get('state', function(value) {
		if(!value.state) {
			var newValue = value;
			newValue.state = { getting: 0, h: 0, autoOpen: 0, interval: 1 };
			chrome.storage.sync.set(newValue, function(){});
		} else {
			if(value.state.getting) {
				$('#toggle').removeClass('toStart').text('配信取得停止');
				chrome.runtime.sendMessage(chrome.runtime.id, { type: 'popupOpened' });
			}
			if(value.state.h) {
				$('#hServer')[0].checked = 'checked';
			}
			if(value.state.autoOpen) {
				$('#autoOpen')[0].checked = 'checked';
			}
			$('#min' + value.state.interval)[0].selected = true;
		}
	});

	var toggleClickHandler = function() {
		if( $(this).is('.toStart') ) {
			$(this).removeClass('toStart').text('配信取得停止');
			chrome.runtime.sendMessage(chrome.runtime.id, { type: 'start' });
		} else {
			$(this).addClass('toStart').text('配信取得開始');
			chrome.runtime.sendMessage(chrome.runtime.id, { type: 'stop' });
		}
	};

	$('#toggle').on('click', toggleClickHandler);

	var serverChangeHandler = function(e) {
		chrome.storage.sync.get('state', function(value) {
			var newValue = value;
			if( e.target.checked ) {
				newValue.state.h = 1;
			} else {
				newValue.state.h = 0;
			}
			chrome.storage.sync.set(newValue, function(){});
		});
	};

	$('#hServer').on('change', serverChangeHandler);

	var autoOpenChangeHandler = function(e) {
		chrome.storage.sync.get('state', function(value) {
			var newValue = value;
			if( e.target.checked ) {
				newValue.state.autoOpen = 1;
			} else {
				newValue.state.autoOpen = 0;
			}
			chrome.storage.sync.set(newValue, function(){});
		});
	};

	$('#autoOpen').on('change', autoOpenChangeHandler);

	var intervalChangeHandler = function(e) {
		chrome.storage.sync.get('state', function(value) {
			var newValue = value;
			newValue.state.interval = e.target.value;
			chrome.storage.sync.set(newValue, function(){});
		});
	};

	$('#intervalSelector').on('change', intervalChangeHandler);

	chrome.runtime.onMessage.addListener(function(message, sender, response) {
		if(message.type === 'update') {
			var movies = message.movies;
			$('#movieList').find('div').remove();
			movies.forEach(function(movie) {
				var div = $('<div>');
				if( $('#hServer')[0].checked ) {
					var url = 'http://h.livetube.cc/';
				} else {
					var url = 'http://livetube.cc/';
				}
				var title = $('<span>').html('配信名: <a href=' + url + movie.link + ' target="_blank">' + movie.title + '</a>');
				var author = $('<span>').html('配信者名: <a href=' + url + encodeURI(movie.author) + ' target="_blank">' + movie.author + '</a>');
				for(var i in movie.tags) {
					movie.tags[i] = '<a href=' + url + 'tag.' + encodeURI(movie.tags[i]) + ' target="_blank">' + movie.tags[i] + '</a>';
				}
				var tags = $('<span>').html('タグ: ' + movie.tags.join(','));
				div.append(title).append('<br>').append(author).append('<br>').append(tags);
				$('#movieList').append(div);
			});
		}
	});

	var typeObj= { title: '配信名', author: '配信者名', tags: 'タグ' }

	var deleteWord = function() {
	 var type = this.id.split('_')[0];
	 var index = this.id.split('_')[1];
	 chrome.storage.sync.get('words', function(value) {
		 var newValue = value;
		 var word = newValue.words[type][index];
		 newValue.words[type].splice(index,1);
		 chrome.storage.sync.set(newValue, function() {
			 var spans = $('#' + type).find('span');
			 $('#' + type).find('span')[index].remove();
			 var spans = $('#' + type).find('span');
			 for(var i = index; i < spans.length; i++) {
				 spans[i].id = type + '_' + i;
			 }
		 });
		 chrome.runtime.sendMessage(chrome.runtime.id, {
			 type: 'deleted',
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

 $('#register').on('click', function() {
	 if( $('#word').val() ) {
		 chrome.storage.sync.get('words', function(value) {
			 var newValue = value;
			 newValue.words = newValue.words || { title: [], author: [], tags: [] };
			 var type = $('#typeSelector').val();
			 var idNum = newValue.words[type].length;
			 newValue.words[type].push( $('#word').val() );
			 chrome.storage.sync.set(newValue, function() {
				 var elem = $('<span>').prop('id', type + '_' + idNum).text( $('#word').val() + ' ').on('click', deleteWord);
				 $('#' + type).append(elem);
				 $('#word').val('');
			 });
			 chrome.runtime.sendMessage(chrome.runtime.id, { 
				 type: 'registered',
				 word: $('#word').val(),
				 wordType: typeObj[type]
			 });
		 });
	 }
 });
})
