/**
 * @author Jan
 */
//importScripts('collection.js'); 
Thread = {};

onmessage = function(event){
    var data = event.data;
    if (data.configuration) {
        Thread.Config = data;
        return;
		
    }
    console.log("Unidentified Message from Thread: " + data);
}

console = {
    log: function(data){
        postMessage({
            log: data
        });
    },
    dir: function(data){
        postMessage({
            dir: data
        });
    }
};
