'use strict';

(function($){
	function json2html(data) {
		var i, ret = document.createElement('ul'), li;
    for( i in data) {
        li = ret.appendChild(document.createElement('li'));
        li.appendChild(document.createTextNode(i+": "));
        if( typeof data[i] === "object") li.appendChild(json2html(data[i]));
        else li.firstChild.nodeValue += data[i];
    }
    return ret;
	}

	function parseData(data) {
		$('body').append(json2html(data));
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
