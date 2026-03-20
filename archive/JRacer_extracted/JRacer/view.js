/**
 * @author Jan
 */
JRacer.View = {};

JRacer.View.createImageLoader = function(callback){
    delete JRacer.View.createImageLoader;
    
    var map = new JRacer.Collection.Map();
    var loadedImagesCount = 0;
    
    function checkComplete(){
        if (map.size() == loadedImagesCount) {
            callback();
        }
    }
    
    JRacer.View.Images = {
        add: function(filename){
            var image = new Image();
            image.onload = function(){
                ++loadedImagesCount;
                checkComplete();
            }
            
            image.onerror = function(){
                console.warn("Image \"" + filename + "\" not found.");
                ++loadedImagesCount;
            }
            
            image.src = filename;
            map.add(filename, image);
        },
        get: function(filename){
            return map.get(filename);
        }
    };
};

JRacer.loadView = function(){
    delete JRacer.loadView;
    
    JRacer.drawUpdate = function(cars){
    
    }
}
