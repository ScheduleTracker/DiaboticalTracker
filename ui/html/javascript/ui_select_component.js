var _select_id_counter = 1;
var _living_select_lists_ids = {};
// select id -> array of callbacks
var _select_click_listeners = {};

function select_click_handler(event) {
    //event.target.children.first().style.display = "flex";
    //var list_element = event.target.firstChild;
    
    var list_element = _id(event.target.dataset.list_element_id);
    if (list_element) {

        /* Clone the existing select list and append it to the main menu to avoid any z-index issues in gameface */

        if (!list_element.parentElement.classList.contains("disabled")) {
            let main_menu = _id("main_menu");
            let clone_id = list_element.id + "_clone";
            if (_living_select_lists_ids.hasOwnProperty(clone_id)) {
                main_menu.removeChild(_id(clone_id));
                delete _living_select_lists_ids[clone_id];
            } else {
                let rect = event.target.getBoundingClientRect();

                let clone = list_element.cloneNode(true);

                let one_perc_px = window.innerHeight / 100;
                let max_height = clone.children[1].children[0].children.length * 4 * one_perc_px;
                if (max_height > (29.6 * one_perc_px)) max_height = 29.6 * one_perc_px;
                let client_bottom_pos = rect.y + rect.height + max_height;

                if (client_bottom_pos > window.innerHeight) {
                    clone.style.top = (rect.y - max_height) + "px";
                } else {
                    clone.style.top = (Math.floor(rect.y) + rect.height + 3) + "px";
                }
                
                clone.style.left = Math.ceil(rect.x) + "px";

                clone.style.display = "flex";
                clone.style.width = rect.width + "px";
                clone.id = clone.id + "_clone";
                main_menu.appendChild(clone);
                _click_outside_handler();   
                _living_select_lists_ids[clone.id] = true;

                if (clone.children[1].children[0].children.length > 9) {
                    let sb = new Scrollbar(clone,999);

                    let idx = -1;
                    for (let i=0; i<clone.children[1].children[0].children.length; i++) {
                        if (clone.children[1].children[0].children[i].classList.contains("selected")) {
                            idx = i;
                        }
                    }
                    // Scroll to the selected element if its outside the visible first 10 options
                    if (idx >= 9) {
                        req_anim_frame(() => {
                            let rect_container = clone.getBoundingClientRect();
                            let rect_option = clone.children[1].children[0].children[idx].getBoundingClientRect();
                            clone.children[1].scrollTop = (rect_option.y - rect_container.y);
                            sb.updateThumbPositionFromScroll();
                        },2);
                    }

                } else {
                    clone.children[0].style.display = "none";
                    clone.children[1].style.paddingRight = 0;
                }
            }
        }
        /*
        if (!list_element.parentElement.classList.contains("disabled")) {

            if (list_element.style.display == "flex") {
                list_element.style.display = "none";
                delete _living_select_lists_ids[list_element.id];
            } else {
                //First hide other selects:
                _click_outside_handler();

                //var rect = event.target.getBoundingClientRect();
                //list_element.style.left = rect.left + "px";
                //list_element.style.top = rect.top + "px";

                //list_element.style.left = event.target.offsetLeft + "px";
                //list_element.style.top = event.target.offsetTop + "px";

                list_element.style.display = "flex";
                _living_select_lists_ids[list_element.id] = true;
            }
        }
        */
    }
    event.stopPropagation();
}

function select_set_current(el, field_element) {
    _for_each_with_class_in_parent(el, "select-button", subel => {
        subel.textContent = field_element.textContent;    
    });
    el.dataset.value = field_element.dataset.value;
    var list_element = _id(el.dataset.list_element_id);
    if (list_element) {
        list_element.style.display = "none";
    }
    _for_each_with_class_in_parent(el, 'select-option', function(el) {
        if (field_element.dataset.value == el.dataset.value) {
            el.classList.add("selected");
        } else {
            el.classList.remove("selected");
        }
    });
    
    // call additional callbacks added with addListener
    if (_select_click_listeners[list_element.id] != undefined) {
        for (let i=0; i<_select_click_listeners[list_element.id].length; i++) {
            _select_click_listeners[list_element.id][i](el, field_element);
        }
    }
}

function update_select(el) {
    for (var i = 0; i < el.children.length; i++){
        if (el.children[i].dataset.value !== undefined){
            if (el.children[i].dataset.value.trim() == el.dataset.value.trim()){
                _for_each_with_class_in_parent(el, "select-button", subel => {
                    subel.textContent = el.children[i].textContent;

                    if ("i18n" in el.children[i].dataset && el.children[i].classList.contains("i18n")) {
                        subel.classList.add("i18n");
                        subel.dataset.i18n = el.children[i].dataset.i18n;
                    } else {
                        subel.classList.remove("i18n");
                        delete subel.dataset.i18n;
                    }

                });
                _for_each_with_class_in_parent(el, 'select-option', function(option) {
                    if (el.dataset.value == option.dataset.value) {
                        option.classList.add("selected");
                    } else {
                        option.classList.remove("selected");
                    }
                });
                break;
            }
        }
    }
}

function _click_outside_handler(){
    //Clicked somewhere in the container, so collapse all select lists.
    for (var id in _living_select_lists_ids){
        let el = _id(id);
        if (el){
            //el.style.display = "none";
            _id("main_menu").removeChild(el);
            delete _living_select_lists_ids[id];
        } else {
            //This element doesn't exist anymore, may have been destroyed, that's ok
            //just delete this entry.
            delete _living_select_lists_ids[id];
        }
    }
}

function initialize_select(container){
    //_select_component_container = container;
    container.removeEventListener("click", _click_outside_handler);
    container.addEventListener("click", _click_outside_handler);
}

function setup_select(el, cb, data) {
    
    //No JSON data provided, scrub it from the children of the element then remove those children
    var caption = "";
    var i18n = "";
    if (!data){
        data = [];
        //for (var i = 0; i < el.children.length; i++){
        for (var i = 0; i < el.children.length; i++) {
            if (el.children[i].dataset.selectinternal == "1"){
                //This is a node created by this element in a previous setup, we just delete these because
                //we'll be adding new ones.
                el.removeChild(el.children[i]);
                i--;
            } else {

                var newNode = {};
                newNode.selected = false;
                if (el.children[i].dataset.selected == "1"){
                    el.dataset.value = el.children[i].dataset.value;
                    caption = el.children[i].textContent;
                    if ("i18n" in el.children[i].dataset && el.children[i].classList.contains("i18n")) {
                        i18n = el.children[i].dataset.i18n;
                    }
                    newNode.selected = true;
                }
                
                for (var dataset_key in el.children[i].dataset) {
                    newNode[dataset_key] = el.children[i].dataset[dataset_key];
                }
                newNode.text_content = el.children[i].textContent;
                
                data.push(newNode);


                if (el.children[i].classList.contains("select-category")){

                    var newNode = {};

                    newNode.text_content = el.children[i].textContent;
                    newNode.is_category = true;

                    data.push(newNode);
                    
                } else if (el.children[i].classList.contains("select-divider")){

                    var newNode = {};
                    newNode.text_content = "";
                    newNode.is_divider = true;

                    data.push(newNode);
                    
                }
                el.children[i].style.display = "none";
            }
        }
        //If we didn't encoutner a value, and if the original element hasn't been given a default through markup
        //set the first option as value.
        if ((el.dataset.value === undefined || el.dataset.value === "") && el.children.length){
            el.dataset.value = el.children[0].dataset.value;
            caption = el.children[0].textContent;
        }
        //while (el.firstChild){
        //    el.removeChild(el.firstChild);
        //}
    }

 

    el.classList.add("mouseover-sound4");
    
    var button_element = _createElement("div", "select-button", caption);
    button_element.dataset.selectinternal = "1";
    if (i18n.length) {
        button_element.classList.add("i18n");
        button_element.dataset.i18n = i18n;
    }
    el.appendChild(button_element);
    
    var list_element = _createElement("div", ["select-list", "scroll-outer"]);
    list_element.style.display = "none";
    list_element.dataset.selectinternal = "1";
    var id = _select_id_counter++;
    list_element.id = "select_list_" + id;

    var scrollbar = _createElement("div", "scroll-bar");
    var scrollthumb = _createElement("div", "scroll-thumb");
    scrollbar.appendChild(scrollthumb);
    list_element.appendChild(scrollbar);

    var list_cont = _createElement("div", "scroll-inner");
    var list_cont_inner = _createElement("div", "select-list-inner");
    
   
    for (var i=0;i < data.length; i++) {
        var node = data[i];
        let field_element = document.createElement("div");
        field_element.classList.add("select-option");
        field_element.textContent = node.text_content;
        for (var dataset_key in node){
            field_element.dataset[dataset_key] = node[dataset_key];

            if (dataset_key == "i18n") {
                field_element.classList.add("i18n");
            }
        }
        field_element.dataset.selectinternal = "1";
        field_element.dataset.value = node.value;
        field_element.id = "select_option_" + id + "_" + i;

        if ("selected" in node && node.selected) {
            field_element.classList.add("selected");
        }

        if(!node.is_category){
            field_element.addEventListener("click", function () {
                if (field_element.classList.contains("selected")) return;
                
                select_set_current(el, field_element);
                if (cb){
                    cb(field_element, el);
                }
            });
            field_element.addEventListener("mouseenter", function() {
                _play_mouseover4();
            });
        }
        else{
            field_element.classList.add("select-category");
        }


        if(node.is_divider){
            field_element.classList.add("select-divider");
        }

        list_cont_inner.appendChild(field_element);
    }

    list_cont.appendChild(list_cont_inner);
    list_element.appendChild(list_cont);

    el.appendChild(list_element);

    el.dataset.list_element_id = list_element.id;

    el.addEventListener("click", select_click_handler);
    //update_select(el, data);

    if (el.hasAttribute("data-theme")) {
        el.classList.add("theme_"+el.dataset.theme);
        list_element.classList.add("theme_"+el.dataset.theme);
    }
}

function addListener(element, cb){
    var list_id = null;
    for (var i=0; i<element.children.length; i++) {
        if (element.children[i].classList.contains("select-list")) {
            list_id = element.children[i].id;
        }
    }

    if (list_id != null) {
        if (_select_click_listeners[list_id] == undefined) _select_click_listeners[list_id] = [];
        _select_click_listeners[list_id].push(cb);
    }
}

//From here onwards it's DB-specific stuff that doesn't belong in this file of
//what otherwise'd be a generic component but w/e.
function initialize_select_fields() {
    _for_each_in_class("select-field", el => {
        ui_setup_select(el);
    });
    console.log("Select fields initialization done.");
}

function ui_setup_select(el,cb){
    if (cb) {
        setup_select(el,cb);
    } else {
        setup_select(el, function(opt, field){
            engine.call("set_string_variable", field.dataset.variable, opt.dataset.value);
        });
    }

    if (el.dataset.variable) {
        engine.call("initialize_select_value", el.dataset.variable);
    }
}
