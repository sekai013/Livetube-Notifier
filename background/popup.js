$(function() {
	chrome.storage.sync.get('getting', function(value) {
		if(value.getting) {
			$('#toggle').removeClass('toStart').text('配信取得終了');
			chrome.runtime.sendMessage(chrome.runtime.id, { type: 'popupOpened' });
		} else {
		}
	});

	chrome.storage.sync.get('h', function(val) {
		if(val.h) {
			$('#hServer')[0].checked = 'checked';
		}
	});

	var toggleClickHandler = function() {
		if( $(this).is('.toStart') ) {
			$(this).removeClass('toStart').text('配信取得終了');
			chrome.runtime.sendMessage(chrome.runtime.id, { type: 'start' });
		} else {
			$(this).addClass('toStart').text('配信取得開始');
			chrome.runtime.sendMessage(chrome.runtime.id, { type: 'stop' });
		}
	};

	$('#toggle').on('click', toggleClickHandler);

	var checkChangeHandler = function(e) {
		chrome.storage.sync.get('h', function(val) {
			var newVal = val;
			newVal.h = newVal.h || 0;
			if( e.target.checked ) {
				newVal.h = 1;
			} else {
				newVal.h = 0;
			}
			chrome.storage.sync.set(newVal, function(){} );
		});
	};

	$('#hServer').on('change', checkChangeHandler);

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
				var author = $('<span>').text('配信者名: ' + movie.author);
				var tags = $('<span>').text('タグ: ' + movie.tags.join(','));
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
		 chrome.notifications.create('LTN_' + Date.now(), {
			 type: 'basic',
			 iconUrl: '../img/icon128.png',
			 title: 'Deleted',
			 message: 'ワードを削除しました: ' + typeObj[type] + ' - ' + word
		 }, function(id) {
			 setTimeout(function() {
				 chrome.notifications.clear(id, function() {});
			 }, 2000);
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
				 chrome.notifications.create('LTN_' + Date.now(), {
					 type: 'basic',
					 iconUrl: '../img/icon128.png',
					 title: 'Registered!',
					 message: 'ワードを登録しました: ' + typeObj[type] + ' - ' + $('#word').val()
				 }, function(id) {
					 $('#word').val('');
					 setTimeout(function() {
						 chrome.notifications.clear(id, function() {});
					 }, 2000);
				 });
			 });
		 });
	 }
 });
})
