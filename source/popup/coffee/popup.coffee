  chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
    actions =
      updatePopup: ->
        $('#videoContainer').empty()
        for video in request.videos
          div = $('<div class="video">')
          host =
            if $('#hServer')[0].checked
              'http://h.livetube.cc/'
            else
              'http://livetube.cc/'
          title = $('<span>').html('配信名: <a href=' + host + video.link + ' target="_blank">' + video.title + '</a>')
          author = $('<span>').html('配信者名: <a href=' + host + encodeURI(video.author) + ' target="_blank">' + video.author + '</a>')
          tags = video.tags.map (tag) ->
            '<a href=' + host + 'tag.' + encodeURI(tag) + ' target="_blank">' + tag + '</a>'

          tags = $('<span>').html('タグ: ' + tags.join(','))
          div.append(title).append('<br>').append(author).append('<br>').append(tags)
          $('#videoContainer').append(div)

    if request.action of actions
      actions[request.action]()

  updateStatus = (propertyName, newValue) ->
    chrome.runtime.sendMessage chrome.runtime.id,
      action  : "updateStatus"
      property: propertyName
      newValue: newValue

  $('#mainContainer').on 'click', '#videoToggle', (e) ->
    if $(e.target).hasClass 'getting'
      $(e.target).removeClass('getting').text('配信取得開始')
      chrome.runtime.sendMessage chrome.runtime.id,
        action: 'stopGettingVideos'
    else
      $(e.target).addClass('getting').text('配信取得停止')
      chrome.runtime.sendMessage chrome.runtime.id,
        action: 'startGettingVideos'

  $('#mainContainer').on 'change', '#updateIntervalSelector', (e) ->
    updateStatus 'updateIntervalInMinutes', e.target.value

  $('#mainContainer').on 'change', '#hServer', (e) ->
    updateStatus 'useHServer', e.target.checked

    if e.target.checked is true
      replaced = 'http://'
      newValue = 'http://h.'
    else
      replaced = 'http://h.'
      newValue = 'http://'

    $('#videoContainer').find('a').each (index, anchor) ->
      anchor.href = anchor.href.replace(replaced, newValue)

  $('#mainContainer').on 'change', '#autoOpen', (e) ->
    updateStatus 'autoOpen', e.target.checked

  $('#mainContainer').on 'click', '#registerButton', ->
    return if (text = $('#word').val()) is ''
    type = $('#wordTypeSelector').val()

    word =
      type: type
      text: text
      id  : Date.now().toString()

    deleteButton = $('<button>')
      .addClass('btn btn-default btn-xs deleteButton')
      .attr('id', "#{word.id}_delete")
      .html('<span class="glyphicon glyphicon-remove"></span>')
    elem = $('<span>')
      .attr('id', word.id)
      .text(word.text)

    chrome.runtime.sendMessage chrome.runtime.id,
      action: 'registerWord'
      word  : word

    $("##{word.type}Container").append(deleteButton).append(elem)
    $('#word').val ''

  $('#mainContainer').on 'click', '.deleteButton', (e) ->
    [id] = this.id.split '_'

    $("##{id}").remove()
    $(this).remove()

    chrome.runtime.sendMessage chrome.runtime.id,
      action: 'deleteWord'
      id    : id
