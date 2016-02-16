'use strict';

(function(){

	var svgNamespace = 'http://www.w3.org/2000/svg';
	var svgContainer;
	var elementRadius = 36;
	var depth = 1;

	function createSVGElement(tag) {
		return document.createElementNS(svgNamespace, tag);
	}

	function setSVGAttributes(el, attributes) {
		for (var key in attributes) {
			el.setAttributeNS(null, key, attributes[key]);
		}
	}

	function createSvgTextElement(text, x, y) {
		var MAXIMUM_CHARS_PER_LINE = 14,
    		LINE_HEIGHT = 12;

		var textEl = createSVGElement('text');

		setSVGAttributes(textEl, {
			'style': 'text-anchor: middle;',
			'font-size': LINE_HEIGHT,
			'font-family': 'Open Sans',
			'font-weight': 300,
			'fill': '#434649',
			'x': x,
			'y': y
		});

		var originalY = y;

		var words = text.split(' ');
    var line = '';

    for (var i = 0; i < words.length; i++) {
      var testLine = line + words[i] + ' ';
      if (testLine.length + 1 > MAXIMUM_CHARS_PER_LINE) {
        var svgTSpan = createSVGElement('tspan');
        setSVGAttributes(svgTSpan, {
        	'x': x,
        	'y': y
        });
        svgTSpan.appendChild(document.createTextNode(line));
        textEl.appendChild(svgTSpan);

        line = words[i];
        y += LINE_HEIGHT;
      } else {
        line = testLine;
      }
  	}

  	var svgTSpan = createSVGElement('tspan');
    setSVGAttributes(svgTSpan, {
    	'x': x,
    	'y': y
    });
    svgTSpan.appendChild(document.createTextNode(line));
    textEl.appendChild(svgTSpan);

    // Vertical centering
		var lines = textEl.childNodes;
		var numLines = lines.length;
		for (var i = 0; i < numLines; i++) {
			var el = lines[i];
			var elY = el.getAttributeNS(null, 'y');
			setSVGAttributes(el, { 'y': (elY - ((numLines * LINE_HEIGHT) / 2) + (LINE_HEIGHT * 3 / 4)) });
		}

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
		setSVGAttributes(path, {
			'd': 'M0 0',
			'stroke': '#97999B',
			'fill': 'none',
			'stroke-width': '2px'
		});
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

    setSVGAttributes(path, {
    	'd': 'm'  + startX + ' ' + startY +
          ' v' + (((endY - startY) / 2) - delta) +
          ' a' + delta + ' ' +  delta + ' 0 0 ' + arc1 + ' ' + delta + ' ' + delta +
          ' H' + (endX - delta * signum(deltaX)) + 
          ' a' + delta + ' ' +  delta + ' 0 0 ' + arc2 + ' ' + delta + ' ' + delta +
          ' v' + (((endY - startY) / 2) - delta)
    });
	}

	function renderTreeElement(data, container, parent) {
		var bg, text, childContainer;
		var x = 0;
		var y = 0;

		if (data.name) {
			bg = createSVGElement('circle');
			setSVGAttributes(bg, {
				'cx': elementRadius,
				'cy': elementRadius,
				'r': elementRadius,
				'fill': '#0092BC',
				'opacity': 1 / depth
			});
			container.appendChild(bg);

			text = createSvgTextElement(data.name, elementRadius, elementRadius);
			container.appendChild(text);
				
			if (data.children && data.children.length > 0) {
				childContainer = createSVGElement('svg');
				container.appendChild(childContainer);
				var child;
				depth++;
				for (var i = 0; i < data.children.length; i++) {
					child = createSVGElement('svg');
					childContainer.appendChild(child);

					renderTreeElement(data.children[i], child);
					setSVGAttributes(child, {
						'x': x,
						'y': y
					});
					// Add connector to parent
					connect(child, bg, container);

					x = childContainer.getBBox().width + (elementRadius / 2);
				}
				depth--;
				setSVGAttributes(childContainer, {
					'x': 0,
					'y': y + (3 * elementRadius)
				});
			}
		}

		setSVGAttributes(container, {
			'x': x,
			'y': y
		});
	}

	function renderSvg(data) {
		var svg = createSVGElement('svg');
		var el;
		var margin = elementRadius;
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
				setSVGAttributes(el, { 'x': x, 'y': y });

				elBBox = el.getBBox();
				x += elBBox.width + margin;
				if (elBBox.height > maxH) {
					maxH = elBBox.height;
				}
			}
		}	else {
			console.error('Incorrect JSON input: no "nodes" element defined on root level.');
		}

		setSVGAttributes(svg, {
			'width': x,
			'height': maxH + (2 * margin),
			'style': 'vertical-align: top;'
		});
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

	document.addEventListener('DOMContentLoaded', function(event) {
		init();
	});
})();
