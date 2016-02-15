'use strict';

(function($){
	function jsonToList(data) {
		var list = document.createElement('ul');
		var listItem;
		var title;
		var children;

		for (var key in data) {
			if (typeof(data[key]) === 'object') {
				if (data[key]['name']) {
					listItem = list.appendChild(document.createElement('li'));
					title = listItem.appendChild(document.createElement('span'));
					title.appendChild(document.createTextNode(data[key]['name']));

					if (data[key]['children']) {
						listItem.appendChild(jsonToList(data[key]));
					}
					
				}
				else {
					list = jsonToList(data[key]);
				}				
			}
		}

		return list;
	}

	function jsonToTable(data) {
		var table = document.createElement('table');
		var row;
		var titleCell;
		var contentCell;

		for (var key in data) {
			if (typeof(data[key]) === 'object') {
				if (data[key]['name']) {
					row = table.appendChild(document.createElement('tr'));
					titleCell = row.appendChild(document.createElement('td'));
					titleCell.appendChild(document.createTextNode(data[key]['name']));

					if (data[key]['children']) {
						contentCell = row.appendChild(document.createElement('td'));
						contentCell.appendChild(jsonToTable(data[key]));
					}
					
				}
				else {
					table = jsonToTable(data[key]);
				}				
			}
		}

		return table;
	}

	function parseData(data) {
		$('body').append(jsonToTable(data));
	}

	function jsonLoadDone(data) {
		console.log(data);
		parseData(data);
	}

	function jsonLoadFail(error) {
		console.error(error);
	}

	function jsonLoadAlways() {
		console.info('getJSON call executed');
	}

	function loadTree() {
		$.getJSON('tree.json')
			.done(function(data) { jsonLoadDone(data); })
			.fail(function(jqXHR, textStatus, error) { jsonLoadFail(error); })
			.always(function() { jsonLoadAlways(); });
	}

	function init() {
		loadTree();
	}

  $(function(){
    init();
  });
})(jQuery);
