/*jslint browser: true*/
/*global jracer,console*/
jracer.browser = {};

jracer.browser.requestAnimationFrame = function (callback) {
	'use strict';

	if (window.requestAnimationFrame) {
		return window.requestAnimationFrame(callback);
	}

	if (window.mozRequestAnimationFrame) {
		return window.mozRequestAnimationFrame(callback);
	}

	if (window.webkitRequestAnimationFrame) {
		return window.webkitRequestAnimationFrame(callback);
	}

};

jracer.browser.cancelAnimationFrame = function (requestID) {
	'use strict';

	if (window.cancelAnimationFrame) {
		window.cancelAnimationFrame(requestID);
	}

	if (window.mozCancelAnimationFrame) {
		window.mozCancelAnimationFrame(requestID);
	}

	if (window.webkitCancelAnimationFrame) {
		window.webkitCancelAnimationFrame(requestID);
	}

};

jracer.browser.transform = (function () {
	'use strict';
	//TODO use only the relevant
	return function (DOMElement, transformFunction) {
		// DOMElement.style.webkitTransform = transformFunction;
		DOMElement.style.transform = transformFunction;
	};
}());