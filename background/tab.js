$(function() {
	var tabset = $('.tabset');
	var tabs = tabset.find('ul li a');
	var initialTab = tabset.find('.selected');
	var panels = tabset.find('div.panels div.panel');
	var initialPanel = $($(initialTab).attr('href'));

	$(panels).hide();
	$(initialPanel).show();

	$(tabs).on('click', function() {
		$(tabs).removeClass('selected');
		$(this).addClass('selected');
		$(panels).hide();
		$($(this).attr('href')).show();
	});
});
