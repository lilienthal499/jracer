/*! Copyright (c) 2009 Jan Schulte-Rebbelmund
 * Licensed under the MIT license.
 */
JRacer.loadConfig = function(callback) {
	delete JRacer.loadConfig;
	var processor, xml;

	function parseXMLtoJSON() {
		// Is called twice, but only executed if both are loaded and ready.
		if (processor && xml) {
			var fragment = processor.transformToFragment(xml, document);
			JRacer.Config = JSON.parse(fragment.childNodes[0].wholeText).Config;
			preprocessConfig();
			callback();
		}
	}

	function preprocessConfig() {
		JRacer.Config.Cars = new Collection.Map();
		for (var car in JRacer.Config.Car) {
			JRacer.Config.Cars.add(car.playerid, car);
		}
		delete JRacer.Config.Car;
	}

	function preprocessXML() {
		$(xml).find("Image").each(function() {
			JRacer.Display.Images.add($(this).attr("src"));
		});
	}

	$.ajax( {
		type : "GET",
		url : "misc/xml2json.xsl",
		dataType : "xml",
		complete : function(data) {
			processor = new XSLTProcessor();
			processor.importStylesheet(data.responseXML);
			parseXMLtoJSON();
		}
	});

	$.ajax( {
		type : "GET",
		url : "misc/config.xml",
		dataType : "xml",
		complete : function(data) {
			xml = data.responseXML;
			if (xml.documentElement.nodeName !== "Config") {
				console.log(data.responseText);
				throw "Config-XML-File is not well formed.";
			}
			preprocessXML(); // Searching for Images using JQuery
		parseXMLtoJSON();
	}
	});
};
