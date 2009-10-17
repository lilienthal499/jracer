window.onload = function(){
    var j = 0;
    var support = [{
        fn: function(){
            if (typeof(window["Worker"]) !== "undefined") {
                return true;
            }
            return false;
        },
        msg: "Browser doesn't support Web Workers.",
        link: "http://www.whatwg.org/specs/web-workers/current-work/"
    }, {
        fn: function(){
            try {
                document.createElement('canvas').getContext('2d');
                return true;
            } 
            catch (e) {
            }
            return false;
        },
        msg: "Browser doesn't support the Canvas-Element.",
        link: "http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html"
    }, {
        fn: function(){
            if (typeof(document["addEventListener"]) !== "undefined") {
                return true;
            }
            return false;
        },
        msg: "Browser doesn't support Method 'addEventListener'.",
        link: "http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Registration-interfaces"
    }, {
        fn: function(){
            if (typeof(window["Iterator"]) !== "undefined") {
                return true;
            }
            return false;
        },
        msg: "Browser doesn't support Iterators.",
        link: "https://developer.mozilla.org/En/Core_JavaScript_1.5_Guide/Iterators_and_Generators"
    }]
    for (var i = 0; i <
    support.length; i++) {
        if (support[i].fn()) {
            j++;
            if (i == support.length - 1 && i + 1 == j) 
                location.href = "index.xhtml";
        }
        else {
            var li = document.createElement("li");
            var text = document.createTextNode(support[i].msg);
            li.appendChild(text);
            document.getElementsByTagName("ul")[0].appendChild(li);
            var a = document.createElement("a");
            text = document.createTextNode(" (");
            li.appendChild(text);
            a.setAttribute("href", support[i].link);
            text = document.createTextNode("Link");
            a.appendChild(text);
            li.appendChild(a);
            text = document.createTextNode(")");
            li.appendChild(text);
        }
    }
}
