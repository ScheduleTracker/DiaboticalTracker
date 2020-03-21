var currentlyDraggedElement;
var currentlyDroppableElement;

var draggableStartOffset;

var haveMoved = false;



function dropElement(element, dropSuccess){

    var onDropSuccess = dropSuccess;

    element.addEventListener("mouseup", function(e){
        element.classList.remove("droppable_border");
        

        if(currentlyDraggedElement && haveMoved){
            onDropSuccess(e, currentlyDraggedElement, draggableStartOffset);
        }        
    });

    element.addEventListener("mousemove", function(e){
        if(currentlyDraggedElement && haveMoved){
            element.classList.add("droppable_border");
            currentlyDroppableElement = element;
        }
    });
    element.addEventListener("mouseout", function(e){
        if(currentlyDraggedElement){
            element.classList.remove("droppable_border");
            currentlyDroppableElement = null;
        }        
    }); 
}

function dragElementRemove(el) {
    el.onmousedown = undefined;
}

function dragElement(elmnt, mouseUpEvent = null, onMouseDown = null, onUnSuccesfullDrop = null) {
    var offsetX = 0;
        offsetY = 0;

    var onMouseUp = mouseUpEvent;

    haveMoved = false;

    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();

        // Dragging with left click only
        if (e.button != 0) return;

        document.addEventListener("mouseup", closeDragElement);
        document.addEventListener("mousemove", elementDrag);

        if (currentlyDraggedElement && currentlyDraggedElement.parentNode)
            currentlyDraggedElement.parentNode.removeChild(currentlyDraggedElement);

        currentlyDraggedElement = elmnt.cloneNode(true);
        //currentlyDraggedElement = document.createElement('div');
        currentlyDraggedElement.classList.add("dragging-clone");

        Object.assign(currentlyDraggedElement.dataset, elmnt.dataset);

        currentlyDraggedElement.dataset.sourceId = elmnt.id;

        var rect = elmnt.getBoundingClientRect();

        offsetX = rect.left - e.clientX;
        offsetY = rect.top - e.clientY;

        draggableStartOffset = {"x": offsetX, "y": offsetY};

        draggableStartOffsetX = offsetX;
        draggableStartOffsetY = offsetY;

        currentlyDraggedElement.style.width = rect.width + "px";
        currentlyDraggedElement.style.height = rect.height + "px";

        currentlyDraggedElement.style.top = (e.clientY + offsetY) + "px";
        currentlyDraggedElement.style.left = (e.clientX + offsetX) + "px";


        _id("main_menu").appendChild(currentlyDraggedElement);


        if(onMouseDown)
            onMouseDown(e);
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        if (currentlyDraggedElement) {

            haveMoved = true;
            // set the element's new position:
            currentlyDraggedElement.style.top = (e.clientY + offsetY) + "px";
            currentlyDraggedElement.style.left = (e.clientX + offsetX) + "px";
        }

    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.removeEventListener("mouseup", closeDragElement);
        document.removeEventListener("mousemove", elementDrag);


        if(haveMoved){
            if(currentlyDroppableElement == null && onUnSuccesfullDrop){
                onUnSuccesfullDrop(currentlyDraggedElement);
            }

            if(onMouseUp)
                onMouseUp();
            
        }



        if (currentlyDraggedElement !== undefined && currentlyDraggedElement.parentNode){
            currentlyDraggedElement.parentNode.removeChild(currentlyDraggedElement);        
            currentlyDraggedElement = null    
        }
        currentlyDroppableElement = null;
    }
}

/*
function synchronizeCssStyles(src, destination, recursively) {

    // Gameface does not support cssText, i would have to create an array with all the style properties i want to copy and set them manually
    //   list of gameface css declaration properties: https://coherent-labs.com/Documentation/cpp-gameface/db/d44/interface_c_s_s_style_declaration.html
    destination.style.cssText = document.defaultView.getComputedStyle(src, "").cssText;

    if (recursively) {
        var vSrcElements = src.getElementsByTagName("*");
        var vDstElements = destination.getElementsByTagName("*");

        console.log("vSrcElements",vSrcElements);
        console.log("vSrcElements.length",vSrcElements.length);
        console.log("vDstElements",vDstElements);
        console.log("vDstElements.length",vDstElements.length);

        for (var i = vSrcElements.length; i--;) {
            var vSrcElement = vSrcElements[i];
            var vDstElement = vDstElements[i];
//          console.log(i + " >> " + vSrcElement + " :: " + vDstElement);
            vDstElement.style.cssText = document.defaultView.getComputedStyle(vSrcElement, "").cssText;
            let styles = getComputedStyle(vSrcElement);
            console.log("styles", styles);
            console.log(_dump(Object.keys(styles)));
        }
    }
}
*/