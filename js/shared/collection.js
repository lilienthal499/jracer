/**
 * @author Jan
 */
Collection = {};

Array.prototype.__iterator__ = function(){
    var i = 0, array = this;
    return {
        next: function(){
            var j = i++;
            if (j >= array.length) 
                throw StopIteration;
            return array[j];
        }
    }
};

Array.prototype.add = function(newElement){
    this.push(newElement);
};

Collection.Set = function(){
    var elements = [];
    
    this.add = function(newElement){
        if (elements.indexOf(newElement) !== -1) {
            throw "DuplicateEntry";
        }
        elements.push(newElement);
    };
    
    this.remove = function(elementToRemove){
        var index = elements.indexOf(elementToRemove);
        
        if (index === -1) {
            throw "ElementNotFound";
        }
        else {
            elements.splice(index, 1);
        }
    };
    
    this.toArray = function(){
        return elements;
    };
    
    this.size = function(){
        return elements.length;
    };
    
    this.__iterator__ = function(){
        var i = 0;
        return {
            next: function(){
                if (i >= elements.length) 
                    throw StopIteration;
                return elements[i++];
            }
        }
    };
};

Collection.Map = function(){

    var keys = [], values = [];
    
    this.add = function(key, value){
        if (keys.indexOf(key) !== -1) {
            throw "DuplicateKey";
        }
        else {
            keys.push(key);
            values.push(value);
        }
    };
    
    this.get = function(key){
        var index = keys.indexOf(key);
        if (index === -1) {
            throw "KeyNotFound";
        }
        else {
            return values[index];
        }
    };
    
    this.set = function(key, value){
        var index = keys.indexOf(key);
        if (index === -1) {
            throw "KeyNotFound";
        }
        else {
            keys[index] = key;
            values[index] = value;
        }
    };
    
    this.remove = function(key){
        var index = keys.indexOf(key);
        if (index === -1) {
            throw "KeyNotFound";
        }
        else {
            keys.splice(index, 1);
            values.splice(index, 1);
        }
    };
    
    this.size = function(){
        return keys.length;
    };
    
    this.__iterator__ = function(){
        var i = 0;
        return {
            next: function(){
                if (i >= values.length) 
                    throw StopIteration;
                return values[i++];
            }
        }
    };
};

/*
 * Queue.js - a function for creating an efficient queue in JavaScript
 *
 * The author of this program, Safalra (Stephen Morley), irrevocably releases
 * all rights to this program, with the intention of it becoming part of the
 * public domain. Because this program is released into the public domain, it
 * comes with no warranty either expressed or implied, to the extent permitted
 * by law.
 *
 * For more public domain JavaScript code by the same author, visit:
 *
 * http://www.safalra.com/web-design/javascript/
 */
/*
 * Creates a new Queue. A Queue is a first-in-first-out (FIFO) data structure.
 * Functions of the Queue object allow elements to be enqueued and dequeued, the
 * first element to be obtained without dequeuing, and for the current size of
 * the Queue and empty/non-empty status to be obtained.
 */
Collection.Queue = function(){

    // the list of elements, initialised to the empty array
    var queue = [];
    
    // the amount of space at the front of the queue, initialised to zero
    var queueSpace = 0;
    
    /*
     * Returns the size of this Queue. The size of a Queue is equal to the
     * number of elements that have been enqueued minus the number of elements
     * that have been dequeued.
     */
    this.getSize = function(){
    
        // return the number of elements in the queue
        return queue.length - queueSpace;
        
    };
    
    /*
     * Returns true if this Queue is empty, and false otherwise. A Queue is
     * empty if the number of elements that have been enqueued equals the number
     * of elements that have been dequeued.
     */
    this.isEmpty = function(){
    
        // return true if the queue is empty, and false otherwise
        return (queue.length == 0);
        
    };
    
    /*
     * Enqueues the specified element in this Queue. The parameter is:
     *
     * element - the element to enqueue
     */
    this.enqueue = function(element){
        queue.push(element);
    };
    
    /*
     * Dequeues an element from this Queue. The oldest element in this Queue is
     * removed and returned. If this Queue is empty then undefined is returned.
     */
    this.dequeue = function(){
    
        // initialise the element to return to be undefined
        var element = undefined;
        
        // check whether the queue is empty
        if (queue.length) {
        
            // fetch the oldest element in the queue
            element = queue[queueSpace];
            
            // update the amount of space and check whether a shift should occur
            if (++queueSpace * 2 >= queue.length) {
            
                // set the queue equal to the non-empty portion of the queue
                queue = queue.slice(queueSpace);
                
                // reset the amount of space at the front of the queue
                queueSpace = 0;
                
            }
            
        }
        
        // return the removed element
        return element;
        
    };
    
    /*
     * Returns the oldest element in this Queue. If this Queue is empty then
     * undefined is returned. This function returns the same value as the
     * dequeue function, but does not remove the returned element from this
     * Queue.
     */
    this.getOldestElement = function(){
    
        // initialise the element to return to be undefined
        var element = undefined;
        
        // if the queue is not element then fetch the oldest element in the
        // queue
        if (queue.length) 
            element = queue[queueSpace];
        
        // return the oldest element
        return element;
        
    };
    
};
