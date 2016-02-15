'use strict';

(function(){

	var svgNamespace = 'http://www.w3.org/2000/svg';
	var svgContainer;
	var elementRadius = 50;

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

	function signum(x) {
    return (x < 0) ? -1 : 1;
	}
	
	function absolute(x) {
    return (x < 0) ? -x : x;
	}

	function connect(childEl, parentEl, container) {
		var path = createSVGElement('path');
		path.setAttributeNS(null, 'd', 'M0 0');
		path.setAttributeNS(null, 'stroke', '#97999B');
		path.setAttributeNS(null, 'fill', 'none');
		path.setAttributeNS(null, 'stroke-width', '2px');
		container.appendChild(path);

		var startX, startY, endX, endY;

		// Calculate positions
		var childElX = parseInt(childEl.getAttributeNS(null, 'x'), 10);
		var parentElX = parseInt(parentEl.getAttributeNS(null, 'x'), 10);
		childElX = isNaN(childElX) ? 0 : childElX;
		parentElX = isNaN(parentElX) ? 0 : parentElX;

		var startX = parentElX + elementRadius;
		var startY = elementRadius * 2;
		var endX = childElX + elementRadius;
		var endY = 3 * elementRadius;

		var deltaX = (endX - startX) * 0.3333;
    var deltaY = (endY - startY) * 0.3333;

    // for further calculations which ever is the shortest distance
    var delta = deltaY < absolute(deltaX) ? deltaY : absolute(deltaX);

    var arc1 = 0; var arc2 = 1;
    if (startX > endX) {
      arc1 = 1;
      arc2 = 0;
    }

    path.setAttributeNS(null, 'd',  'm'  + startX + ' ' + startY +
                    ' v' + (((endY - startY) / 2) - delta) +
                    ' a' + delta + ' ' +  delta + ' 0 0 ' + arc1 + ' ' + delta + ' ' + delta +
                    ' H' + (endX - delta * signum(deltaX)) + 
                    ' a' + delta + ' ' +  delta + ' 0 0 ' + arc2 + ' ' + delta + ' ' + delta +
                    ' v' + (((endY - startY) / 2) - delta));
	}

	function renderTreeElement(data, container, parent) {
		var bg, text, childContainer;
		var x = 0;
		var y = 0;

		if (data.name) {
			bg = createSVGElement('circle');
			bg.setAttributeNS(null, 'cx', elementRadius);
			bg.setAttributeNS(null, 'cy', elementRadius);
			bg.setAttributeNS(null, 'r',  elementRadius);
			bg.setAttributeNS(null, 'fill', '#e9ebec');
			container.appendChild(bg);

			text = createSvgTextElement(data.name, elementRadius, elementRadius);
			container.appendChild(text);
				
			if (data.children && data.children.length > 0) {
				childContainer = createSVGElement('svg');
				container.appendChild(childContainer);
				var child;
				for (var i = 0; i < data.children.length; i++) {
					child = createSVGElement('svg');
					childContainer.appendChild(child);

					renderTreeElement(data.children[i], child);
					child.setAttributeNS(null, 'x', x);
					child.setAttributeNS(null, 'y', y);

					// Add connector to parent
					connect(child, bg, container);

					x = childContainer.getBBox().width + (elementRadius / 2);
				}
				childContainer.setAttributeNS(null, 'x', 0);
				childContainer.setAttributeNS(null, 'y', y + (3 * elementRadius));
			}
		}

		container.setAttributeNS(null, 'x', x);
		container.setAttributeNS(null, 'y', y);
	}

	function renderSvg(data) {
		var svg = createSVGElement('svg');
		var el;
		var margin = 50;
		svgContainer.appendChild(svg);

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

	function jsonLoadDone(data) {
		renderSvg(data);
	}

	function jsonLoadFail(xhr) {
		console.error('Error loading JSON file: ' + xhr.status + ': ' + xhr.statusText);
	}

	function loadTree() {
		var path;
		var xhr = null;

		svgContainer = document.getElementById('treeviewr');
		path = svgContainer.getAttribute('data-file');

    if (window.ActiveXObject) {
    	xhr = new ActiveXObject('Microsoft.XMLHTTP');
    } else if (window.XMLHttpRequest) {
    	xhr = new XMLHttpRequest();
    }

    if (xhr) {
      xhr.onreadystatechange = function() {
      	if (xhr.readyState === XMLHttpRequest.DONE) {
	        if (xhr.status === 200) {
	          jsonLoadDone(JSON.parse(xhr.responseText));
	        } else {
	          jsonLoadFail(xhr);
	        }
	      }
	    };
	    xhr.open('GET', path, true);
	    xhr.send();
    } else {
    	console.error('What?! Your naughty little browser can not handle AJAX requests. Get your shit together and use a real browser!');
    }    
	}

	function init() {
		loadTree();
	}

	document.addEventListener("DOMContentLoaded", function(event) {
		init();
	});
})();
