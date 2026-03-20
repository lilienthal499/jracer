/**
 * @author Jan
 */
importScripts('thread_lib.js','thread_lib2.js');

onmessage = function(e){
    postMessage("From Browser: "+e.data + dosomething());
}

