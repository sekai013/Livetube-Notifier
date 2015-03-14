/*! Livetube Notifier v1.4.0 Github repo: https://github.com/sekai013/Livetube-Notifier */
$(function(){"use strict";var a,b;chrome.runtime.onMessage.addListener(function(a){var b;return b={updatePopup:function(){var b,c,d,e,f,g,h,i,j,k;for($("#videoContainer").empty(),j=a.videos,k=[],h=0,i=j.length;i>h;h++)g=j[h],c=$('<div class="video">'),d=$("#hServer")[0].checked?"http://h.livetube.cc/":"http://livetube.cc/",f=$("<span>").html("配信名: <a href="+d+g.link+' target="_blank">'+g.title+"</a>"),b=$("<span>").html("配信者名: <a href="+d+encodeURI(g.author)+' target="_blank">'+g.author+"</a>"),e=g.tags.map(function(a){return"<a href="+d+"tag."+encodeURI(a)+' target="_blank">'+a+"</a>"}),e=$("<span>").html("タグ: "+e.join(",")),c.append(f).append("<br>").append(b).append("<br>").append(e),k.push($("#videoContainer").append(c));return k}},a.action in b?b[a.action]():void 0}),b=function(a,b){return chrome.runtime.sendMessage(chrome.runtime.id,{action:"updateStatus",property:a,newValue:b})},$("#mainContainer").on("click","#videoToggle",function(a){return $(a.target).hasClass("getting")?($(a.target).removeClass("getting").text("配信取得開始"),chrome.runtime.sendMessage(chrome.runtime.id,{action:"stopGettingVideos"})):($(a.target).addClass("getting").text("配信取得停止"),chrome.runtime.sendMessage(chrome.runtime.id,{action:"startGettingVideos"}))}),$("#mainContainer").on("change","#updateIntervalSelector",function(a){return b("updateIntervalInMinutes",a.target.value)}),$("#mainContainer").on("change","#hServer",function(a){var c,d;return b("useHServer",a.target.checked),a.target.checked===!0?(d="http://",c="http://h."):(d="http://h.",c="http://"),$("#videoContainer").find("a").each(function(a,b){return b.href=b.href.replace(d,c)})}),$("#mainContainer").on("change","#autoOpen",function(a){return b("autoOpen",a.target.checked)}),$("#mainContainer").on("click","#registerButton",function(){var a,b,c;if(""!==(a=$("#word").val()))return b=$("#wordTypeSelector").val(),c={type:b,text:a,id:Date.now().toString()},chrome.runtime.getBackgroundPage(function(a){var b,d,e,f;return f=a.storage.status.status.useHServer?"http://h.livetube.cc/":"http://livetube.cc/",e={title:function(a){return $("<span>").attr("id",a.id).text(a.text)},author:function(a){return $("<a>").attr("id",a.id).attr("href",""+f+encodeURI(a.text)).attr("target","_blank").text(a.text)},tags:function(a){return $("<a>").attr("id",a.id).attr("href",""+f+"tag."+encodeURI(a.text)).attr("target","_blank").text(a.text)}},b=$("<button>").addClass("btn btn-default btn-xs deleteButton").attr("id",""+c.id+"_delete").html('<span class="glyphicon glyphicon-remove"></span>'),d=e[c.type](c),chrome.runtime.sendMessage(chrome.runtime.id,{action:"registerWord",word:c}),$("#"+c.type+"Container").append(b).append(d),$("#word").val("")})}),$("#mainContainer").on("click",".deleteButton",function(){var a;return a=this.id.split("_")[0],$("#"+a).remove(),$(this).remove(),chrome.runtime.sendMessage(chrome.runtime.id,{action:"deleteWord",id:a})}),$(".tab-menu").on("click",function(){return $(".tab-menus").children().removeClass("active"),$(this).addClass("active")}),a=function(){var a,b,c;return a=$("#mainContainer"),c={"#videos":function(){return chrome.runtime.getBackgroundPage(function(b){var c,d;return c=b.storage.status.status,d=$("#videosTemplate").html(),a.html(d),c.gettingVideos&&($("#videoToggle").addClass("getting").text("配信取得停止"),chrome.runtime.sendMessage(chrome.runtime.id,{action:"updateVideos"})),$("#hServer").prop("checked",c.useHServer),$("#autoOpen").prop("checked",c.autoOpen),$("#min"+c.updateIntervalInMinutes)[0].selected=!0})},"#words":function(){return chrome.runtime.getBackgroundPage(function(b){var c,d,e,f,g,h,i,j,k,l;for(i=b.storage.words.words,g=$("#wordsTemplate").html(),a.html(g),f=b.storage.status.status.useHServer?"http://h.livetube.cc/":"http://livetube.cc/",e={title:function(a){return $("<span>").attr("id",a.id).text(a.text)},author:function(a){return $("<a>").attr("id",a.id).attr("href",""+f+encodeURI(a.text)).attr("target","_blank").text(a.text)},tags:function(a){return $("<a>").attr("id",a.id).attr("href",""+f+"tag."+encodeURI(a.text)).attr("target","_blank").text(a.text)}},l=[],j=0,k=i.length;k>j;j++)h=i[j],c=$("<button>").addClass("btn btn-default btn-xs deleteButton").attr("id",""+h.id+"_delete").html('<span class="glyphicon glyphicon-remove"></span>'),d=e[h.type](h),l.push($("#"+h.type+"Container").append(c).append(d));return l})}},b=window.location.hash,b in c?c[b]():window.location.hash="#videos"},window.onhashchange=a,a()});