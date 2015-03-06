  $('.tab-menu').on 'click', ->
    $('.tab-menus').children().removeClass 'active'
    $(this).addClass 'active'

  setTab = ->
    $mainContainer = $('#mainContainer')

    tabs =
      '#videos': ->
        chrome.runtime.getBackgroundPage (bg) ->
          status = bg.storage['status'].status
          template = $('#videosTemplate').html()

          $mainContainer.html template

          if status.gettingVideos
            $('#videoToggle').addClass('getting').text('配信取得停止')
            chrome.runtime.sendMessage chrome.runtime.id,
              action: 'updateVideos'
          $('#hServer').prop 'checked', status.useHServer
          $('#autoOpen').prop 'checked', status.autoOpen
          $("#min#{status.updateIntervalInMinutes}")[0].selected = true

      '#words': ->
        chrome.runtime.getBackgroundPage (bg) ->
          words = bg.storage['words'].words
          template = $('#wordsTemplate').html()

          $mainContainer.html template

          for word in words
            deleteButton = $('<button>')
              .addClass('btn btn-default btn-xs deleteButton')
              .attr('id', "#{word.id}_delete")
              .html('<span class="glyphicon glyphicon-remove"></span>')
            elem = $('<span>')
              .attr('id', word.id)
              .text(word.text)

            $("##{word.type}Container").append(deleteButton).append(elem)

    id = window.location.hash

    if id of tabs
      tabs[id]()
    else
      window.location.hash = '#videos'

  window.onhashchange = setTab
  do setTab
