'use strict';

(function($){

	var svgNamespace = 'http://www.w3.org/2000/svg';

	function createSVGElement(tag) {
		return document.createElementNS(svgNamespace, tag);
	}

	function createSvgTextElement(text, x, y) {
		var MAXIMUM_CHARS_PER_LINE = 16,
    		LINE_HEIGHT = 16;

		var textEl = createSVGElement('text');
		textEl.setAttributeNS(null, 'style', 'text-anchor: middle;');
		textEl.setAttributeNS(null, 'font-size', 12);
		textEl.setAttributeNS(null, 'font-family', 'Open Sans');
		textEl.setAttributeNS(null, 'font-weight', 300);
		textEl.setAttributeNS(null, 'fill', '#434649');
		textEl.setAttributeNS(null, 'x', x);
		textEl.setAttributeNS(null, 'y', y);

		var words = text.split(' ');
    var line = '';

    for (var i = 0; i < words.length; i++) {
      var testLine = line + words[i] + ' ';
      if (testLine.length + 1 > MAXIMUM_CHARS_PER_LINE) {
        var svgTSpan = createSVGElement('tspan');
        svgTSpan.setAttributeNS(null, 'x', x);
        svgTSpan.setAttributeNS(null, 'y', y);
        svgTSpan.appendChild(document.createTextNode(line));
        textEl.appendChild(svgTSpan);

        line = words[i];
        y += LINE_HEIGHT;
      } else {
        line = testLine;
      }
  	}

  	var svgTSpan = createSVGElement('tspan');
    svgTSpan.setAttributeNS(null, 'x', x);
    svgTSpan.setAttributeNS(null, 'y', y);
    svgTSpan.appendChild(document.createTextNode(line));
    textEl.appendChild(svgTSpan);

    return textEl;
	}

	function renderTreeElement(data, container) {
		var shape, text, childContainer;
		var x = 0;
		var y = 0;

		if (data.name) {
			shape = createSVGElement('circle');
			shape.setAttributeNS(null, 'cx', 50);
			shape.setAttributeNS(null, 'cy', 50);
			shape.setAttributeNS(null, 'r',  50);
			shape.setAttributeNS(null, 'fill', '#e9ebec');
			container.appendChild(shape);

			text = createSvgTextElement(data.name, 50, 50);
			container.appendChild(text);
				
			if (data.children && data.children.length > 0) {
				childContainer = createSVGElement('svg');
				container.appendChild(childContainer);
				for (var i = 0; i < data.children.length; i++) {
					var child = createSVGElement('svg');
					childContainer.appendChild(child);
					renderTreeElement(data.children[i], child);
					child.setAttributeNS(null, 'x', x);
					child.setAttributeNS(null, 'y', y);
					x = childContainer.getBBox().width + 25;
				}
				x += childContainer.getBBox().width;
				childContainer.setAttributeNS(null, 'x', 0);
				childContainer.setAttributeNS(null, 'y', y + 150);
				console.info(data.name + ': ' + childContainer.getBBox().width);
			}
		}

		container.setAttributeNS(null, 'x', x);
		container.setAttributeNS(null, 'y', y);

		//return container;
	}

	function renderSvg(data) {
		var container = document.getElementById('treeviewr');
		var svg = createSVGElement('svg');
		var el;
		var margin = 50;
		container.appendChild(svg);

		var x = margin;
		var y = margin;
		var maxH = 0;
		var elBBox;

		if (data.nodes) {
			for (var key in data.nodes) {
				el = createSVGElement('svg');
				svg.appendChild(el);
				renderTreeElement(data.nodes[key], el);
				el.setAttributeNS(null, 'x', x);
				el.setAttributeNS(null, 'y', y);

				elBBox = el.getBBox();
				x += elBBox.width + 100;
				if (elBBox.height > maxH) {
					maxH = elBBox.height;
				}
			}
		}	else {
			console.error('Incorrect JSON input: no "nodes" element defined on root level.');
		}

		svg.setAttribute('width', x);
		svg.setAttribute('height', maxH + (2 * margin));
		svg.setAttribute('style', 'vertical-align: top;');
		
	}

	function parseData(data) {
		$('body').append(renderSvg(data));
	}

	function jsonLoadDone(data) {
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
