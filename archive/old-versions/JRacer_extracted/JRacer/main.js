/**
 * @author Jan
 */
$(document).ready(function(){
    JRacer.load();
});

JRacer.load = function(){
    delete JRacer.load;
    JRacer.View.createImageLoader(onImagesLoaded);
    JRacer.loadConfig(onConfigLoaded);
    createThreadInterface();
    console.info("Starting JRacer.");
    
    function onConfigLoaded(){
        console.info("Configuration loaded and parsed successfully.");
        
        JRacer.Thread.sendConfig(JRacer.Config);
        JRacer.Thread.sendMessage("Message for thread!");
        
    }
    
    function onImagesLoaded(){
        console.info("All images are ready.");
    }
    
    function createThreadInterface(){
        JRacer.Thread = (function(){
            var worker = new Worker('thread.js');
            
            
            worker.onmessage = function(event){
                var data = event.data;
                if (data.log) {
                    console.log(data.log);
                    return;
                }
                if (data.dir) {
                    console.dir(data.dir);
                    return;
                }
                console.warn("Unidentified Message from Thread: " + data);
            }
            
            return {
                sendConfig: function(config){
                    worker.postMessage({
                        configuration: config
                    });
                    
                },
                sendKeyStroke: function(key){
                
                },
                sendMessage: function(msg){
                    worker.postMessage(msg);
                }
            }
        })();
        
    }
};


JRacer.loadConfig = function(callback){
    delete JRacer.loadConfig;
    var processor, xml;
    
    function parseXMLtoJSON(){
        if (processor && xml) { //Is called twice, but only excuted if both are loaded.
            var fragment = processor.transformToFragment(xml, document);
            
            JRacer.Config = JSON.parse("{" + fragment.childNodes[0].wholeText).Config;
            
            callback();
        }
    }
    
    function parseXML(){
        $(xml).find("Image").each(function(){
            JRacer.View.Images.add($(this).attr("src"));
        });
    }
    
    $.ajax({
        type: "GET",
        url: "xml2json.xsl",
        dataType: "xml",
        complete: function(data){
            processor = new XSLTProcessor();
            processor.importStylesheet(data.responseXML);
            parseXMLtoJSON();
        }
    });
    
    $.ajax({
        type: "GET",
        url: "config.xml",
        dataType: "xml",
        complete: function(data){
            xml = data.responseXML;
            if (xml.documentElement.nodeName !== "Config") {
                console.log(data.responseText)
                throw "Config-XML-File is not well formed."
            }
            parseXML(); //Searching for Images using JQuery
            parseXMLtoJSON();
        }
    });
};
