window.hud_editor_preview_downscale_factor = 0.5;

window.hud_editor_preview_default_downscale_factor = 0.5;
window.hud_editor_preview_fullscreen_downscale_factor = 0.75;
window.hud_editor_preview_fullscreen = false;

let global_user_huds = [];
let global_user_hud_slots = 6; // max hud slots the server allows (hud_index 0-5)
let global_active_hud_type = HUD_PLAYING;
let editing_hud_data = {};

const MAX_HUD_DEFINITION_LENGTH = 16384;


const d = {
    "width": 10,
    "height": 6,
    "fontSize": 3
};


function init_hud_editor_elements() {
    let cont = _id('hud_editor_elements');

    global_scrollboosters['hud_element_list'] = new ScrollBooster({
        viewport: cont.parentElement,
        content: cont,
        pointerMode: "mouse",
        friction: 0.05,
        bounceForce: 0.2,
        direction: "horizontal",
        scrollMode: "transform",
        emulateScroll: true,
    });

    document.getElementById('hud_editor_elements_left_arrow').addEventListener("click", function () {
        if (global_scrollboosters['hud_element_list']) {
            global_scrollboosters['hud_element_list'].scrollToArrow(-1, 70);
        }
    });
    document.getElementById('hud_editor_elements_right_arrow').addEventListener("click", function() {
        if (global_scrollboosters['hud_element_list']) {
            global_scrollboosters['hud_element_list'].scrollToArrow(1, 70);
        }
    });
}

function post_load_setup_hud_editor() {
    ui_setup_select(_id("hud_editor_type_select"), function(field, opt) {
        global_active_hud_type = Number(field.dataset.value);
        load_hud();
    });

    bind_event("set_hud_element_size", set_hud_element_size);

    load_hud();
}

function hud_editor_visible(bool, wait) {
    if (bool) {
        let wait_frames = 2;
        if (wait) wait_frames = wait;
        req_anim_frame(function(){ 
            let rect = preview_hud_element.getBoundingClientRect();
            engine.call("set_hud_editor", true, rect.x, rect.y, rect.width, rect.height);
            req_anim_frame(() => {
                if (global_scrollboosters['hud_element_list']) global_scrollboosters['hud_element_list'].updateMetrics();
            },5);
        }, 2);
    } else {
        engine.call("set_hud_editor", false, 0, 0, 0, 0);
    }
}

function reset_hud(){
    engine.call('reset_hud', global_active_hud_type);
    engine.call('get_hud_json', global_active_hud_type).then(function (str) {
        try {
            editing_hud_data = JSON.parse(str);
            //hud_version_check(editing_hud_data, global_active_hud_type);
            write_misc_hud_preference('hudaspect', 'default');
            write_misc_hud_preference('fl', '1');
            refresh_preview_hud();
        } catch (err) {
            echo("Error parsing HUD definition (Maybe it was too long so it got clamped.)");
        }
    });
}

window.addEventListener("keydown", function(event){
    if(_id("settings_screen_hud").style.display == "flex" && this.document.activeElement.tagName.toLowerCase() == "body") {

        var speed = 1;
        var command = "move";
        if (event.ctrlKey) speed = 0.1;
        if (event.shiftKey) command = "resize";

        // A or left arrow
        if(event.keyCode == 37 || event.keyCode == 65){
            if (command == "move") moveElement(-speed, 0);
            if (command == "resize") resizeElement(-speed, 0);
        }

        // D or right arrow
        if(event.keyCode == 39 || event.keyCode == 68){
            if (command == "move") moveElement(speed, 0);
            if (command == "resize") resizeElement(speed, 0);
        }

        // W or up arrow
        if(event.keyCode == 38 || event.keyCode == 87){    
            if (command == "move") moveElement(0, -speed);
            if (command == "resize") resizeElement(0, speed);
        }

        // S or down arrow
        if(event.keyCode == 40 || event.keyCode == 83){
            if (command == "move") moveElement(0, speed);
            if (command == "resize") resizeElement(0, -speed);
        }
    } 
});

function moveElement(x, y) {
    if (window.hud_editor_selected_element != undefined && (window.hud_editor_selected_element.offsetParent !== null)) {

        var id = parseInt(window.hud_editor_selected_element.dataset.id)
        //console.log(editing_hud_data.elements[id].x, editing_hud_data.elements[id].y);

        if (window.hud_editor_selected_type == "group") {
            var xValue = parseFloat(editing_hud_data.groups[id].x);
            var yValue = parseFloat(editing_hud_data.groups[id].y);

            editing_hud_data.groups[id].x = _clamp(xValue + x, 0, 100);
            editing_hud_data.groups[id].y = _clamp(yValue + y, 0, 100);
    
            window.hud_editor_selected_element.style.left = (editing_hud_data.groups[id].x) + "%";
            window.hud_editor_selected_element.style.top  = (editing_hud_data.groups[id].y) + "%";
        } else {
            var xValue = parseFloat(editing_hud_data.elements[id].x);
            var yValue = parseFloat(editing_hud_data.elements[id].y);

            editing_hud_data.elements[id].x = _clamp(xValue + x, 0, 100);
            editing_hud_data.elements[id].y = _clamp(yValue + y, 0, 100);
    
            window.hud_editor_selected_element.style.left = (editing_hud_data.elements[id].x) + "%";
            window.hud_editor_selected_element.style.top  = (editing_hud_data.elements[id].y) + "%";
        }
  
        hud_set_default_false();
        send_sanitized_hud_definition_to_engine();
        _id("hud_preview_container").style.setProperty('--ratio',window.hud_editor_preview_downscale_factor);
        
        reset_hud_properties();
        preview_hud_select(window.hud_editor_selected_element.id);
    }
}

function resizeElement(width, height) {
    if (window.hud_editor_selected_element != undefined && (window.hud_editor_selected_element.offsetParent !== null)) {

        var id = parseInt(window.hud_editor_selected_element.dataset.id)

        if (window.hud_editor_selected_type == "group") {
            var widthValue = parseFloat(editing_hud_data.groups[id].width);
            var heightValue = parseFloat(editing_hud_data.groups[id].height);

            editing_hud_data.groups[id].width = widthValue + width;
            editing_hud_data.groups[id].height = heightValue + height;
    
            window.hud_editor_selected_element.style.width  = vh_size_string_at_least_1px(editing_hud_data.groups[id].width * window.hud_editor_preview_downscale_factor);
            window.hud_editor_selected_element.style.height = vh_size_string_at_least_1px(editing_hud_data.groups[id].height * window.hud_editor_preview_downscale_factor);
        } else {
            // Check if element has width/height properties...
            let resize_width = false;
            let resize_height = false;
            for (let el of hud_elements) {
                if (el.type == window.hud_editor_selected_type) {
                    for (let property of el.hudEditCode) {
                        if (property.type == "width") resize_width = true;
                        if (property.type == "height") resize_height = true;

                        if (resize_width && resize_height) break;
                    }
                    break;
                }
            }

            if (!resize_width && !resize_height) return;

            if (resize_width) {
                var widthValue = parseFloat(editing_hud_data.elements[id].width);
                editing_hud_data.elements[id].width = widthValue + width;
                window.hud_editor_selected_element.style.width = vh_size_string_at_least_1px(editing_hud_data.elements[id].width * window.hud_editor_preview_downscale_factor);
            }

            if (resize_height) {
                var heightValue = parseFloat(editing_hud_data.elements[id].height);
                editing_hud_data.elements[id].height = heightValue + height;
                window.hud_editor_selected_element.style.height = vh_size_string_at_least_1px(editing_hud_data.elements[id].height * window.hud_editor_preview_downscale_factor);
            }
        }
  
        hud_set_default_false();
        send_sanitized_hud_definition_to_engine();
        _id("hud_preview_container").style.setProperty('--ratio',window.hud_editor_preview_downscale_factor);
        
        reset_hud_properties();
        preview_hud_select(window.hud_editor_selected_element.id);
    }
}

function pre_load_setup_hud_editor_new() {    
    
    preview_hud_element.addEventListener("click", function (e) {
        preview_hud_clear_properties();
    });

    _for_each_in_class("hud_editor_element", el => {
        // Make available hud elements types draggable (in the top list)
        dragElement(el, null);
    });

    dropElement(_id("hud_preview"), function(ev, clone){
        //console.log("Good drop", clone);

        let hud_preview = _id("hud_preview");

        //console.log("dropped element with id " + clone.id + " and name " + clone.dataset.name + " data= " + JSON.stringify(clone.dataset));
        var hud_rect = hud_preview.getBoundingClientRect();

        // cursor drop point in px relative to the hud preview container
        var pos_x = ev.clientX - hud_rect.left;
        var pos_y = ev.clientY - hud_rect.top;

        if (!clone.dataset.id) {
            // Add new item  
            hud_editor_add_element(clone.dataset.name, pos_x, pos_y);
            engine.call('ui_sound', 'ui_drop1');
        } else {
            //Moving existing item
            //PITFALL: We used to use clean_float here but it caused an annoying 1 pixel offset when moving things

            let native = false;

            if (clone.dataset.type != "group") {
                if (Number(clone.dataset.id) in editing_hud_data.elements) {
                    if (clone.dataset.native == 1) {
                        native = true;
                    }

                    if (editing_hud_data.elements[Number(clone.dataset.id)].gid > -1) {
                        hud_group_preview = _id("group_"+editing_hud_data.elements[Number(clone.dataset.id)].gid+"_preview");
                        hud_rect = hud_group_preview.getBoundingClientRect();

                        let evX = _clamp(ev.clientX, hud_rect.x, hud_rect.x + hud_rect.width);
                        let evY = _clamp(ev.clientY, hud_rect.y, hud_rect.y + hud_rect.height);

                        // cursor drop point in px relative to the group
                        pos_x = evX - hud_rect.left;
                        pos_y = evY - hud_rect.top;
                    }
                }
            }

            // Top left position in px of the dropped element relative to the hud preview container
            var left = pos_x + draggableStartOffset.x;
            var top = pos_y + draggableStartOffset.y;

            var xPosPercent = 0;
            var yPosPercent = 0;

            if (native) {
                
                let one_vh = window.outerHeight / 100;

                // get pixel values
                let offset_x = Number(clone.dataset.nativeX) * one_vh;
                let offset_y = Number(clone.dataset.nativeY) * one_vh;

                xPosPercent = ((left - offset_x) / hud_rect.width) * 100;
                yPosPercent = ((top - offset_y) / hud_rect.height) * 100;

            } else {
            
                var halfWidth  = clone.getBoundingClientRect().width  / 2;
                var halfHeight = clone.getBoundingClientRect().height / 2;

                // pivot: Center
                var xPos = (left + halfWidth) / hud_rect.width;
                var yPos = (top + halfHeight) / hud_rect.height;
    
                if(clone.dataset.pivot == "top-left"){
                    xPos = (left)  / hud_rect.width;
                    yPos = (top )  / hud_rect.height;
                } else if(clone.dataset.pivot == "top-right"){
                    xPos = (left+ halfWidth  * 2)  / hud_rect.width;
                    yPos = (top )  / hud_rect.height;
                } else if(clone.dataset.pivot == "top-edge"){
                    xPos = (left + halfWidth ) / hud_rect.width;
                    yPos = (top )  / hud_rect.height;
                } else if(clone.dataset.pivot == "bottom-left"){
                    xPos = (left)  / hud_rect.width;
                    yPos = (top + halfHeight * 2)  / hud_rect.height;
                } else if(clone.dataset.pivot == "bottom-right"){
                    xPos = (left+ halfWidth  * 2)  / hud_rect.width;
                    yPos = (top + halfHeight * 2)  / hud_rect.height;
                } else if(clone.dataset.pivot == "bottom-edge"){
                    xPos = (left + halfWidth ) / hud_rect.width;
                    yPos = (top + halfHeight * 2)  / hud_rect.height;
                } else if(clone.dataset.pivot == "left-edge"){
                    xPos = (left)  / hud_rect.width;
                    yPos = (top  + halfHeight) / hud_rect.height;
                } else if(clone.dataset.pivot == "right-edge"){
                    xPos = (left+ halfWidth  * 2)  / hud_rect.width;
                    yPos = (top  + halfHeight) / hud_rect.height;
                }

                xPosPercent = 100 * xPos;
                yPosPercent = 100 * yPos;

            }

            if (window.hud_editor_snap_to_grid_enabled) {
                xPosPercent = Math.round(xPosPercent);
                yPosPercent = Math.round(yPosPercent);
            }

            hud_editor_set_x(clone.dataset.type, clone.dataset.id, xPosPercent);
            hud_editor_set_y(clone.dataset.type, clone.dataset.id, yPosPercent);
            
            refresh_preview_element(clone.dataset.type, clone.dataset.id);
            preview_hud_select(clone.dataset.sourceId);
        }
    });

    _id("hud_editor").style.setProperty('--ratio',window.hud_editor_preview_downscale_factor);
}

/**
 * Set and store the position and size of an element in the hud editor
 * @param {*} index Element index
 * @param {*} x X Offset from the pivot point in vh
 * @param {*} y Y Offset from the pivot point in vh
 * @param {*} w Element width in vh
 * @param {*} h Element height in vh
 */
function set_hud_element_size(index, x, y, w, h) {
    //console.log("=== set_hud_element_size", index, x, y, w, h);

    x = x * hud_editor_preview_downscale_factor;
    y = y * hud_editor_preview_downscale_factor;
    w = w * hud_editor_preview_downscale_factor;
    h = h * hud_editor_preview_downscale_factor;

    let el = _id("elem_"+index+"_preview");
    if (el) {
        x = x.toFixed(8);
        y = y.toFixed(8);
        w = w.toFixed(8);
        h = h.toFixed(8);

        if (w < 0.5) w = 0.5;
        if (h < 0.5) h = 0.5;
        el.style.width = w+"vh";
        el.style.height = h+"vh";
        el.style.transform = "translateX("+x+"vh) translateY("+y+"vh)";
        
        el.dataset.nativeX = x;
        el.dataset.nativeY = y;
        el.dataset.nativeW = w;
        el.dataset.nativeH = h;
    }
}

// Should be called whenever anything gets modified in the hud
function hud_set_default_false() {
    editing_hud_data.default = false;
}

function load_hud() {
    engine.call('get_hud_json', global_active_hud_type).then(function (str) {
        try {
            editing_hud_data = JSON.parse(str);
            hud_version_check(editing_hud_data, global_active_hud_type);
            refresh_preview_hud();
        } catch (err) {
            echo("Error parsing HUD definition (Maybe it was too long so it got clamped.)");
        }        
    });
}

function preview_to_screen_coord_x(v) {
    return v / _id("hud_preview").getBoundingClientRect().width;
}

function preview_to_screen_coord_y(v) {
    return v / _id("hud_preview").getBoundingClientRect().height;
}

function hud_editor_add_element(name, preview_pos_x, preview_pos_y) {
    console.log("ADDING HUD ELEMENT YALL", name, preview_pos_x, preview_pos_y);

    var hud = editing_hud_data;

    var x = preview_to_screen_coord_x(preview_pos_x);
    var y = preview_to_screen_coord_y(preview_pos_y);
    
    if (name == "group") {
        
        if (!hud.groups) {
            hud.groups = [];
        }

        let group_id = 0;
        for (let i=0; i<hud.groups.length; i++) {
            if (Number(hud.groups[i].gid) >= group_id) {
                group_id = Number(hud.groups[i].gid) + 1;
            }
        }

        var new_group = {
            gid: group_id,
            x: _clean_float(x * 100),
            y: _clean_float(y * 100),
        };
        
        hud_group.setDefaultValues(new_group);

        hud.groups.push(new_group);

    } else {

        if (!hud.elements) {
            hud.elements = [];
        }
    
        var new_element = {
            t: name,
            gid: -1,
            x: _clean_float(x * 100),
            y: _clean_float(y * 100),
        };
    
        var result = hud_elements.filter(obj => {
            return obj.type === name
        });
    
        if (result.length > 0) {
            result[0].setDefaultValues(new_element);
        }
    
        hud.elements.push(new_element);
    }

    hud_set_default_false();
    refresh_preview_hud();
}

function hud_editor_unshift_element(name, preview_pos_x, preview_pos_y) {
    console.log("UNSHIFTING HUD ELEMENT YALL", name, preview_pos_x, preview_pos_y);

    var hud = editing_hud_data;
    if (!hud.elements) {
        hud.elements = [];
    }
    var x = preview_to_screen_coord_x(preview_pos_x);
    var y = preview_to_screen_coord_y(preview_pos_y);
    var new_element = {
        t: name,
        x: _clean_float(x * 100),
        y: _clean_float(y * 100),
    };

    var result = hud_elements.filter(obj => {
        return obj.type === name
      });

    if (result.length > 0) {

        result[0].setDefaultValues(new_element);
    }


    hud.elements.unshift(new_element);
    preview_hud_clear_properties();
    hud_set_default_false(); 
    refresh_preview_hud();
    //_dump(hud);
}

window.hud_editor_selected_item = -1;
window.hud_editor_selected_type = undefined;
window.hud_editor_selected_element = undefined;

/*
function editorCreateAdvanced(element, id, type, idx) {
    let html = '';
    html += '<div class="hud_editor_option_row row_advanced">';
    html +=  '<div class="option">';
    html +=   '<div class="button" data-idx="'+idx+'" data-type="'+type+'">Advanced</div>';
    html +=  '</div>';
    html += '</div>';

    return html;
}
*/
function editorCreateToggle(element, id, key, name, idx) {
    var data = {
        isOn: (element.dataset[key] == 1 || element.dataset[key] == "true") ? true: false,
        id: id, 
        key: key,
        name: name,
        idx: idx,
    };

    var output = getTemplateRender("hud_editor_toggle", data);

    if(output === ""){
        console.warn(element, "This shold not be empty");
    }

    return output;
}

function editorCreateInput(element, id, key, title, idx) {
    //moving elements with arrow keys only updates editing_hud_data and changes element style left/top directly (moveElement), so read from editing_hud_data for x/y
    if (key == "x" || key == "y"){
        if (element.dataset.type == "group") {
            var elem = editing_hud_data.groups[idx];
        } else {
            var elem = editing_hud_data.elements[idx];
        }
        var val = elem[key];
    } else {
        var val = element.dataset[key];
    }

    var data = {
        value: _clean_float(val),
        id: id,
        key: key,
        title: title,
        idx: idx,
    };

    var output = getTemplateRender("hud_editor_input", data);

    if(output === ""){
        console.warn(element, "This shold not be empty");
    }

    return output;
}

function editorCreateInputText(element, id, key, title, maxLength, idx) {   
    var charLim = parseFloat(maxLength);
    var val = element.dataset[key].substring(0,charLim); //keeps input box working if hud_definition value is longer than max length, (only clamps value for input box, not general use)
    var valHTML = _escape_html(val);
    var data = {
        value: valHTML, 
        id: id,
        key: key,
        title: title,
        maxLength: charLim,
        idx: idx,
    };

    var output = getTemplateRender("hud_editor_input_text", data);

    return output;
}

function editorCreateColor(element, id, key, name){
    var data = {
        id: id,
        key: key,
        name: name,
        color: element.dataset[key]
    };

    var output = getTemplateRender("hud_editor_color", data);

    if(output === ""){
        console.warn(element, "This shold not be empty");
    }

    return output;
}

function editorCreateList(element, id, key, name, list, idx) {

    var data = {
        value: list,
        id: id,
        title: name,
        key: key,
        idx: idx,
    };

    var output = getTemplateRender("hud_editor_list", data);

    if (output === "") {
        console.warn(element, "This shold not be empty");
    }

    return output;
}



function preview_hud_select(element_id) {
    if (document.activeElement) {
        document.activeElement.blur();
    }

    element = _id(element_id);
    
    _for_each_with_class_in_parent(_id("hud_preview"), "selected_hud_editor_element", function(el) {
        el.classList.remove("selected_hud_editor_element");
    });
    element.classList.add("selected_hud_editor_element");

    var buf = "";

    buf += "<div class='properties_panel' id='properties_panel'>";

    let id = parseInt(element.dataset.id);
    window.hud_editor_selected_item = id;
    window.hud_editor_selected_type = element.dataset.type;
    window.hud_editor_selected_element = element;
    

    buf += "<div class='hud_editor_option_row'>";
    buf +=  '<div class="option">';
    buf +=   "<div class='element_name'>"+fetchFriendlyElementName(element.dataset.type)+"</div>";
    if (element.dataset.type != "group") {
        buf +=   "<div class='action_button clone tooltip2' data-msg-id='hud_editor_clone_element' onclick='hud_editor_clone_current_item(" + id + ")'><div></div></div>";
        buf +=   "<div class='action_button surface tooltip2' data-msg-id='hud_editor_surface_element' onclick='hud_editor_surface_current_item(" + id + ")'><div></div></div>";
        buf +=   "<div class='action_button sink tooltip2' data-msg-id='hud_editor_sink_element' onclick='hud_editor_sink_current_item(" + id + ")'><div></div></div>";
        if (editing_hud_data.elements[id].gid > -1) {
            buf +=   "<div class='action_button ungroup tooltip2' data-msg-id='hud_editor_ungroup_element' onclick='hud_editor_ungroup_current_item(" + id + ")'><div></div></div>";
        }
    }
    buf +=   "<div class='action_button delete tooltip2' data-msg-id='hud_editor_delete_element' onclick='preview_hud_delete_element_confirm(\"" + element.dataset.type + "\"," + id + ")'><div></div></div>";
    buf +=  "</div>";
    buf += "</div>";

    var type = element.dataset.type;

    if (type == "group") {
        buf += hud_group.getHudEditCode(element);
    } else {
        var result = hud_elements.filter(obj => {
            return obj.type === type
        });

        if (result.length > 0) {
            buf += result[0].getHudEditCode(element);
        }
    }

    buf += "</div>";

    _html(_id("hud_properties_list"), buf);

    _for_each_with_class_in_parent(_id("hud_properties_list"),'tooltip2', function(el) {
        add_tooltip2_listeners(el);
    });

    // Init color pickers
    var colorPickers = _id("hud_properties_list").querySelectorAll(".color-picker-new");
    refreshScrollbar(_id("hud_properties"));
    resetScrollbar(_id("hud_properties"));

    for(var i = 0; i < colorPickers.length; i++){
        new jscolor(colorPickers[i], null, null, true);
        colorPickers[i].addEventListener("keydown", function(e) {
            e.stopPropagation();
        })
        colorPickers[i].setAttribute("onchange", "colorChanged('"+element.dataset.type+"', "+id+", this)");
    }

    // Init advanced modal
    /*
    var advanced = _id("hud_properties_list").querySelector(".hud_editor_option_row.row_advanced .option .button");
    if (advanced) {
        advanced.addEventListener("click", editorOpenAdvancedModal);
    }
    */

    if (type == "group") {
        hud_group.afterCreatedCode(id);
    } else {
        if (result.length > 0) {
            result[0].afterCreatedCode(id);
        }
    }

    hud_editor_change_tab("hud_properties");
}

/*
function editorOpenAdvancedModal() {
    let idx = this.dataset.idx;
    let type = this.dataset.type;
    
    if (typeof editing_hud_data.elements[idx] === 'undefined') {
        return false;
    }

    let cont = document.createElement("div");
    cont.classList.add("editor_advanced_modal");

    let title = document.createElement("div");
    title.classList.add("title");
    title.innerHTML = "Advanced CSS Styles";
    cont.appendChild(title);
    
    let textarea = document.createElement("textarea");
    cont.appendChild(textarea);

    textarea.addEventListener("keydown", function(e) {
        e.stopPropagation();
    });

    let note = document.createElement("div");
    note.classList.add("note");
    note.innerHTML = "Note: these styles are applied to the container of the hud element. Allowed properties: "+editor_valid_advanced_rules.join(", ");
    cont.appendChild(note);

    let text = '';
    let el_settings = undefined;
    if (type == "group") {
        el_settings = editing_hud_data.groups[idx];
    } else {
        el_settings = editing_hud_data.elements[idx];
    }
    if ("advanced" in el_settings) {
        for (let rule of el_settings.advanced) {
            text += rule[0]+':'+rule[1]+";\n";
        }
    }
    textarea.value = text;

    genericModal(undefined, cont, localize("menu_button_cancel"), undefined, localize("menu_button_confirm"), function() {
        let res = [];
        let rules = textarea.value.split(';');

        for (let rule of rules) {
            if (!rule.includes(":")) continue;

            let split = rule.trim().split(':');
            if (split.length != 2) continue;

            let current_rule = split[0].trim().toLowerCase();
            if (editor_valid_advanced_rules.includes(current_rule) || current_rule.startsWith("border-")) {
                if (current_rule == "background-image") {
                    if (split[1].includes("url")) {
                        console.log(split[1], "contains url");
                        // Don't allow background image linking, just want gradients
                        continue;
                    }
                }
                if (current_rule == "filter") {
                    if (split[1].includes("blur")) {
                        console.log(split[1], "contains blur filter");
                        // Don't allow blur filter due to performance and crash concerns when sharing huds
                        continue;
                    }
                }
                if (split[1].includes("var(")) {
                    console.log(split[1], "contains var()");
                    // using var() causes game to crash
                    continue;
                }
                res.push([current_rule, split[1].trim()]);
            }
        }

        if (type == "group") {
            editing_hud_data.groups[idx].advanced = res;
        } else {
            editing_hud_data.elements[idx].advanced = res;
        }
        refresh_preview_element(type, idx);
    });
}
*/

function colorChanged(type, id, elem) {
    hud_editor_set_value(type, id, elem.dataset.key, "#" + elem.value);
    refresh_preview_element(type, id);
}

var hud_editor_input_timeout = undefined;
function valueOnChange(type, target) {

    _id(target).addEventListener("input", function(e) {
        let _this = this;
        if (hud_editor_input_timeout != undefined) {
            clearTimeout(hud_editor_input_timeout);
            hud_editor_input_timeout = undefined;
        }

        hud_editor_input_timeout = setTimeout(function() {
            if (_this.parentElement != null) {
                hud_editor_set_value(type, _this.dataset.idx, _this.dataset.key, _this.value);
                refresh_preview_element(type, _this.dataset.idx);
            }
            hud_editor_input_timeout = undefined;
        },400);
    });

    _id(target).addEventListener("keydown", function(e) {
        e.stopPropagation();

        if (e.keyCode == 13) {
            if (hud_editor_input_timeout != undefined) {
                clearTimeout(hud_editor_input_timeout);
                hud_editor_input_timeout = undefined;
            }
            hud_editor_set_value(type, this.dataset.idx, this.dataset.key, this.value);
            refresh_preview_element(type, this.dataset.idx);
        }
    });
}

function listOnChange(type, captured_id, target, key) {
    setup_select(_id(target), function(opt, field) {
        hud_editor_set_value(type, field.dataset.idx, field.dataset.key, opt.dataset.value);
        refresh_preview_element(type, field.dataset.idx);
    });

    var val = "";
    if (type == "group") {
        val = editing_hud_data.groups[captured_id][key];
    } else {
        val = editing_hud_data.elements[captured_id][key];
    }

    _id(target).dataset.value = val;
    
    update_select(_id(target));
}

function editorToggleButton(type, target){
    _id(target).addEventListener("click",function() {
        if (this.dataset.enabled == "true") {
            this.dataset.enabled = false;
            this.firstElementChild.classList.remove("inner_checkbox_enabled");
        } else {
            this.dataset.enabled = true;
            this.firstElementChild.classList.add("inner_checkbox_enabled");
        }
        
        hud_editor_set_bool(type, this.dataset.idx, this.dataset.key, (this.dataset.enabled == 'true'));
        refresh_preview_element(type, this.dataset.idx);
    });
}


function preview_hud_clear_properties() {
    // Empty the property list when no element is selected
    _empty(_id("hud_properties_list"));
    _for_each_with_class_in_parent(_id("hud_preview"), "selected_hud_editor_element", function(el) {
        el.classList.remove("selected_hud_editor_element");
    });
    window.hud_editor_selected_item = -1;
    window.hud_editor_selected_type = undefined;
    window.hud_editor_selected_element = undefined;
    refreshScrollbar(_id("hud_properties"));
    resetScrollbar(_id("hud_properties"));
}

function reset_hud_properties() {
    global_hud_need_strafe_calculations = false;
    global_hud_need_pitch_calculations = false;
    global_hud_direction_hints_enabled = false;
    if (editing_hud_data.elements) {
        var elements = editing_hud_data.elements;
        for (var i = 0; i < elements.length; i++) {
            if (strafe_hud(elements[i].t)) {
                if (elements[i].t == "g_meter") {
                    global_hud_need_strafe_calculations = true;
                    global_hud_direction_hints_enabled = true;
                } else if (elements[i].t == "throttle") {
                    global_hud_need_strafe_calculations = true;
               	} else {
                    elements.splice(i,1);
                    refresh_preview_hud();
                    i--;
                }
            }
            
            element_property_override_filter(elements[i]);
        }
    }

    /*
    var checkbox = _id('enable_direction_hints');
    if (global_hud_direction_hints_enabled){
        checkbox.dataset.enabled = true;
        checkbox.classList.add("checkbox_enabled");
        checkbox.firstElementChild.classList.add("inner_checkbox_enabled");
    } else {
        checkbox.dataset.enabled = false;
        checkbox.classList.remove("checkbox_enabled");
        checkbox.firstElementChild.classList.remove("inner_checkbox_enabled");
    }
    */
}

function refresh_preview_element(type, idx) {
    // Rerender a single element in the hud editor rather than the whole hud
    // Note: with the on_hud_edited call below the HUD View will still always rerender the whole hud

    //console.log("refresh_preview_element",type, idx, _dump(editing_hud_data));

    hud_set_default_false();

    if (type == "group") {
        refresh_preview_hud();
        return;
    }

    reset_hud_properties();
    send_sanitized_hud_definition_to_engine();

    refresh_hud_element_preview(idx);
}

//This renders the hud but also sends the new JSON to the engine
function refresh_preview_hud() {
    // clean the hud from invalid elements before saving
    if (editing_hud_data.elements) {
        for (let i=editing_hud_data.elements.length-1; i>=0; i--) {
            let el = getFirstMatchingElement(hud_elements, editing_hud_data.elements[i].t)
            if (!el) {
                //console.log("remove invalid element from elements", _dump(editing_hud_data.elements[i]));
                editing_hud_data.elements.splice(i,1);
            }
        }
        read_misc_hud_preference();
    }
    send_sanitized_hud_definition_to_engine();
    _id("hud_preview_container").style.setProperty('--ratio',window.hud_editor_preview_downscale_factor);
    update_preview_aspect_state(global_misc_hud_preference["hudaspect"]);
    make_hud_in_element("hud_preview", true, false);
    reset_hud_properties();
}

function send_sanitized_hud_definition_to_engine() {
    // Don't save the hud if its larger than what the variable allows to prevent the loss of the rest of the hud (unparseable json)
    let json = JSON.stringify(editing_hud_data);
    if (json.length <= MAX_HUD_DEFINITION_LENGTH) {
        // Save the hud
        engine.call("set_hud_json", global_active_hud_type, json);
    } else {
        // TODO, inform the user about the issue
    }
    // Let the engine know that the hud changed so it can call a hud refresh in the hud view as well
    engine.call("on_hud_edited", global_active_hud_type);
}

function convert_group_coord_to_hud_coord(gid,element,hud_to_group) {
    var hud = editing_hud_data;
    var found = false;
    for (let j=0; j<hud.groups.length; j++) {
        if (hud.groups[j].gid==gid){
            var group = hud.groups[j];
            found=true;
            break;
        }
    }
    if (!found) return;

    if (!group.pivot) group.pivot = "center";
    
    // get hud editor aspect ratio
    var aspect = onevw_float/onevh_float;
    var hudaspect_str = global_misc_hud_preference['hudaspect'];
    if (hudaspect_str) {
	    var asp = hudaspect_str.split(":",2);
	    var asp_w = parseInt(asp[0],10);
	    var asp_h = parseInt(asp[1],10);
	    if (asp_w && asp_h) {
	        aspect = asp_w/asp_h;
	    }
    }
    
    var group_rad_x = Number(group.width)/2 / aspect;
    var group_rad_y = Number(group.height)/2;
    var offset_x = Number(group.x) - group_rad_x;
    var offset_y = Number(group.y) - group_rad_y;
    var scale_x = group_rad_x/50;
    var scale_y = group_rad_y/50;
    if (group.pivot.includes('left'))   offset_x += group_rad_x;
    if (group.pivot.includes('right'))  offset_x -= group_rad_x;
    if (group.pivot.includes('top'))    offset_y += group_rad_y;
    if (group.pivot.includes('bottom')) offset_y -= group_rad_y;
    if (hud_to_group) {
    	var coord_x = (Number(element.x)-offset_x)/scale_x;
    	var coord_y = (Number(element.y)-offset_y)/scale_y;
    } else {
	    var coord_x = Number(element.x)*scale_x + offset_x;
	    var coord_y = Number(element.y)*scale_y + offset_y;
    }
	element.x = _clamp(coord_x, 0, 100);
	element.y = _clamp(coord_y, 0, 100);
	element.gid = hud_to_group ? group.gid : -1;
}

function hud_editor_set_aspect(aspect_str) {
    update_preview_aspect_state(aspect_str);
    write_misc_hud_preference('hudaspect', aspect_str);
    refresh_preview_hud();
}

function update_preview_aspect_state(aspect_str){
    // SNAFU currently does not support this feature
    return;

    // update the visibility of the aspect buttons
    var scr = onevw_float/onevh_float;
    _id('aspect_button_16_9').style.display  = ( scr >= (16/9)  ) ? 'flex':'none';
    _id('aspect_button_16_10').style.display = ( scr >= (16/10) ) ? 'flex':'none';
    _id('aspect_button_4_3').style.display   = ( scr >= (4/3)   ) ? 'flex':'none';
    _id('aspect_button_5_4').style.display   = ( scr >= (5/4)   ) ? 'flex':'none';
    _id('aspect_button_1_1').style.display   = ( scr >= (1/1)   ) ? 'flex':'none';
    
    // highlight selected aspect
    _id('aspect_button_default').classList.remove("toggle_enabled");
    _id('aspect_button_16_9').classList.remove("toggle_enabled");
    _id('aspect_button_16_10').classList.remove("toggle_enabled");
    _id('aspect_button_4_3').classList.remove("toggle_enabled");
    _id('aspect_button_5_4').classList.remove("toggle_enabled");
    _id('aspect_button_1_1').classList.remove("toggle_enabled");
    if (aspect_str == "default") _id('aspect_button_default').classList.add("toggle_enabled");
    if (aspect_str == "16:9")    _id('aspect_button_16_9').classList.add("toggle_enabled");
    if (aspect_str == "16:10")   _id('aspect_button_16_10').classList.add("toggle_enabled");
    if (aspect_str == "4:3")     _id('aspect_button_4_3').classList.add("toggle_enabled");
    if (aspect_str == "5:4")     _id('aspect_button_5_4').classList.add("toggle_enabled");
    if (aspect_str == "1:1")     _id('aspect_button_1_1').classList.add("toggle_enabled");    
    
    // update the aspect dimensions of the hud preview
    var asp = aspect_str.split(":",2);
    var asp_w = parseInt(asp[0],10);
    var asp_h = parseInt(asp[1],10);
    if (asp_w && asp_h) {
        var width_string = (100 * (asp_w / asp_h)) + "vh";
        _id("hud_preview_container").style.setProperty('--hud_preview_aspect_vw', width_string);
    } else {
        var width_string = "100vw";
        _id("hud_preview_container").style.setProperty('--hud_preview_aspect_vw', width_string);
    }    
}

function fetchFriendlyElementName(type_string, debug){
    var friendlyname = type_string;
    try {
        friendlyname = _get_first_with_class_in_parent( _id("hud_editor_elements") , "element_label_" + type_string ).textContent;
    } catch(error) {
        friendlyname = (debug == 1) ? false : type_string;
    }
    return friendlyname;
}

/*
function place_direction_hints_element(value, data, noupdate){ 
    if (!data) data = editing_hud_data;
    if (!(value||global_hud_direction_hints_enabled)||noupdate) {        
        if (!data.elements) {
             data.elements = [];
        }  
        var new_element = {
            t: 'g_meter',
            gid: -1,
            x: 0,
            y: 0,
        };
        var result = hud_elements.filter(obj => {
            return obj.type === 'g_meter';
        });
        if (result.length > 0) {
            result[0].setDefaultValues(new_element);
        } 
        data.elements.push(new_element);
    }
    let elements = data.elements;
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].t === "g_meter") {
            if (value) {
                elements.splice(i,1);
                i--;
            } else {
                elements[i].x="50";
                elements[i].y="77";
                elements[i].showSpeed="2";
                value=true;
                write_misc_hud_preference('dirhint','1');
            }
        } else if (elements[i].t === "coins"){
                elements[i].y="20";
        }
    }
    if (noupdate) return;
    refresh_preview_hud();
}
*/

let global_misc_hud_preference = {
    "hudaspect":'default',
    "fl":'1',
    "film":'vML?1?vML?1',
    "fovbkg":'depot',
};

function callback_on_misc_hud_preference_read(misc){
    //if (misc["fl"] != '1') misc_fl_trigger(misc["fl"]);
    if (misc["film"]) {
        var film_string = misc["film"];
        var val = film_string.split("?");
        _id('film_fov_measurement').dataset.value = val[0];
        _id('film_fov_notation_prefix').dataset.value = val[1];
        _id('film_fov_notation_type').dataset.value = val[2];
        _id('film_fov_notation_suffix').dataset.value = val[3];
        update_select(_id('film_fov_measurement'));
    }
    if (misc["fovbkg"]&&global_fov_preview_images[misc["fovbkg"]]) fov_preview_background_series = misc["fovbkg"];
}

function read_misc_hud_preference() {
    // Copy saved values into the local cache
    if ("misc" in editing_hud_data) {
        for (let key of Object.keys(editing_hud_data["misc"])) {
            global_misc_hud_preference[key] = editing_hud_data["misc"][key];
        }
    } else {
        editing_hud_data["misc"] = global_misc_hud_preference;
    }
    callback_on_misc_hud_preference_read(editing_hud_data["misc"]);
}


function write_misc_hud_preference(key, value, forceupdate) {
    // Update in local working cache
    global_misc_hud_preference[key] = value;

    // Update in the editing data
    editing_hud_data.misc = global_misc_hud_preference;

    // Send to engine if needed
    if (forceupdate) send_sanitized_hud_definition_to_engine();
}

function preview_hud_delete_element_confirm(type, id) {
    console.log("delete?", type, id);
    window.hud_editor_current_item = id;
    window.hud_editor_current_type = type;

    open_modal_screen("hud_editor_delete_modal_screen");
}

function hud_editor_delete_current_item() {
    var hud = editing_hud_data;
    if (window.hud_editor_current_type == "group") {
        if (hud.groups) {
            for (var i = 0; i < hud.groups.length; i++) {
                if (i == window.hud_editor_current_item) {

                    // remove gid from any elements currently associated with this group (keep the elements though?)
                    for (let j=0; j<hud.elements.length; j++) {
                        if (hud.elements[j].gid == hud.groups[i].gid) {
			                convert_group_coord_to_hud_coord(hud.elements[j].gid,hud.elements[j]);
                            hud.elements[j].gid = -1;
                        }
                    }

                    hud.groups.splice(i,1);
                    preview_hud_clear_properties();
                    hud_set_default_false();
                    refresh_preview_hud();
                    return true;
                }
            }
        }
    } else {
        if (hud.elements) {
            for (var i = 0; i < hud.elements.length; i++) {
                if (i == window.hud_editor_current_item) {
                    hud.elements.splice(i,1);
                    preview_hud_clear_properties();
                    hud_set_default_false();
                    refresh_preview_hud();
                    return true;
                }
            }
        }
    }

    refresh_preview_hud();
    return false;
}

function hud_editor_restore_current_item() {
    refresh_preview_hud();
}

function hud_editor_clone_current_item(id) {
    window.hud_editor_current_item = id;
    var hud = editing_hud_data;
    if (hud.elements) {
        for (var i = 0; i < hud.elements.length; i++) {
            if (i == window.hud_editor_current_item) {
                var clonedElement = Object.assign({}, hud.elements[i]);
                clonedElement.x = (parseInt(clonedElement.x)>50?parseInt(clonedElement.x)-1:parseInt(clonedElement.x)+1);
                clonedElement.y = (parseInt(clonedElement.y)>50?parseInt(clonedElement.y)-1:parseInt(clonedElement.y)+1);
                hud.elements.push(clonedElement);
                preview_hud_clear_properties();
                hud_set_default_false();
                refresh_preview_hud();
                return false;
            }
        }
    }
    refresh_preview_hud();
    return false;
}

function hud_editor_surface_current_item(id) {
    window.hud_editor_current_item = id;
    var hud = editing_hud_data;
    if (hud.elements) {
        for (var i = 0; i < hud.elements.length; i++) {
            if (i == window.hud_editor_current_item) {
                var clonedElement = Object.assign({}, hud.elements[i]);
                hud.elements.splice(i,1);
                hud.elements.push(clonedElement);
                preview_hud_clear_properties(); // workaround for now since the displayed properties does not point to the correct element after splice and push
                hud_set_default_false();
                refresh_preview_hud();
                return false;
            }
        }
    }
    refresh_preview_hud();
    return false;
}

function hud_editor_sink_current_item(id) {
    window.hud_editor_current_item = id;
    var hud = editing_hud_data;
    if (hud.elements) {
        for (var i = 0; i < hud.elements.length; i++) {
            if (i == window.hud_editor_current_item) {
                var clonedElement = Object.assign({}, hud.elements[i]);
                hud.elements.splice(i,1);
                hud.elements.unshift(clonedElement);
                preview_hud_clear_properties(); // workaround for now since the displayed properties does not point to the correct element after splice and push
                hud_set_default_false();
                refresh_preview_hud();
                return false;
            }
        }
    }
    refresh_preview_hud();
    return false;
}

function hud_editor_ungroup_current_item(id) {
    var hud = editing_hud_data;
    if (hud.elements) {
        for (var i = 0; i < hud.elements.length; i++) {
            if (i == id) {
                convert_group_coord_to_hud_coord(hud.elements[i].gid,hud.elements[i]);
                hud.elements[i].gid = -1;
                preview_hud_clear_properties();
                hud_set_default_false();
                refresh_preview_hud();
                return false;
            }
        }
    }
}

function hud_editor_set_x(type, id, value) {
    if (type == "group") {
        if (editing_hud_data.groups) {
            if (editing_hud_data.groups[id]) {
                editing_hud_data.groups[id].x = value;
            }
        }
    } else {
        if (editing_hud_data.elements) {
            if (editing_hud_data.elements[id]) {
                editing_hud_data.elements[id].x = value;
            }
        }
    }
}

function hud_editor_set_y(type, id, value) {
    if (type == "group") {
        if (editing_hud_data.groups) {
            if (editing_hud_data.groups[id]) {
                editing_hud_data.groups[id].y = value;
            }
        }
    } else {
        if (editing_hud_data.elements) {
            if (editing_hud_data.elements[id]) {
                editing_hud_data.elements[id].y = value;
            }
        }
    }
}

function hud_editor_set_value(type, id, key, value) {
    if (type == "group") {
        if (editing_hud_data.groups) {
            if (editing_hud_data.groups[id]) {
                editing_hud_data.groups[id][key] = value;
            }
        }
    } else {
        if (editing_hud_data.elements) {
            if (editing_hud_data.elements[id]) {
                editing_hud_data.elements[id][key] = value;
            }
        }
    }
}

function hud_editor_set_bool(type, id, key, value) {
    if (type == "group") {
        if (editing_hud_data.groups) {
            if (editing_hud_data.groups[id]) {
                editing_hud_data.groups[id][key] = value ? 1 : 0;
            }
        }
    } else {
        if (editing_hud_data.elements) {
            if (editing_hud_data.elements[id]) {
                editing_hud_data.elements[id][key] = value ? 1 : 0;
            }
        }
    }
}


function hud_editor_set_guides(visible) {
    if (visible){
        anim_show(_id("hud_editor_guides_vertical"), window.fade_time);
        anim_show(_id("hud_editor_guides_horizontal"), window.fade_time);
    } else {
        anim_hide(_id("hud_editor_guides_vertical"), window.fade_time);
        anim_hide(_id("hud_editor_guides_horizontal"), window.fade_time);
    }
}

window.hud_editor_snap_to_grid_enabled = true;

function hud_editor_set_snap(enabled) {
    window.hud_editor_snap_to_grid_enabled = enabled;
}

function hud_editor_fullscreen(new_state) {
    let toggle = _id("hud_editor_fullscreen_button");
    if (new_state === (toggle.dataset.enabled === 'true')) {
        return;
    }
    if (new_state) {
        toggle.classList.add("toggle_enabled");
        toggle.dataset.enabled = "true";
        window.hud_editor_preview_downscale_factor = window.hud_editor_preview_fullscreen_downscale_factor;
        window.hud_editor_preview_fullscreen = true;
        _id("hud_editor").style.setProperty('--ratio',window.hud_editor_preview_downscale_factor);
        _id("hud_editor").classList.add("fullscreen");
        _id("settings_screen_window").classList.add("fullscreen");
        _id("hud_editor_elements_holder").classList.add("fullscreen");
        _id("settings_screen_menu").style.display = "none";

        hud_editor_visible(true);

        update_preview_aspect_state(global_misc_hud_preference["hudaspect"]);
        refresh_preview_hud();
    } else {
        toggle.classList.remove("toggle_enabled");
        toggle.dataset.enabled = "false";
        window.hud_editor_preview_downscale_factor = window.hud_editor_preview_default_downscale_factor; 
        window.hud_editor_preview_fullscreen = false;
        _id("hud_editor").style.setProperty('--ratio',window.hud_editor_preview_downscale_factor);
        _id("hud_editor").classList.remove("fullscreen");
        _id("settings_screen_window").classList.remove("fullscreen");
        _id("hud_editor_elements_holder").classList.remove("fullscreen");
        _id("settings_screen_menu").style.display = "flex";

        if (global_menu_page == "settings_screen" && global_current_settings_section == "hud") {
            hud_editor_visible(true);
        } else {
            hud_editor_visible(false);
        }

        update_preview_aspect_state(global_misc_hud_preference["hudaspect"]);
        refresh_preview_hud();
    }
}

function hud_editor_toggle_fullscreen(toggle) {
    if (toggle.dataset.enabled == "true") {
        hud_editor_fullscreen(false);
    } else {
        hud_editor_fullscreen(true);
    }
}

function hud_editor_toggle_background(toggle) {
    let hud_preview_container = _id("hud_preview_container");
    if (toggle.dataset.enabled == "true") {
        hud_preview_container.classList.remove("background_enabled");
        toggle.dataset.enabled = "false";
        toggle.classList.remove("toggle_enabled");
    } else {
        hud_preview_container.classList.add("background_enabled");
        toggle.dataset.enabled = "true";
        toggle.classList.add("toggle_enabled");
    }
}

function hud_editor_toggle_weapon(toggle) {
    let hud_preview_weapon_container = _id("hud_preview_weapon");
    if (toggle.dataset.enabled == "true") {
        hud_preview_weapon_container.classList.remove("background_enabled");
        toggle.dataset.enabled = "false";
        toggle.classList.remove("toggle_enabled");
    } else {
        hud_preview_weapon_container.classList.add("background_enabled");
        toggle.dataset.enabled = "true";
        toggle.classList.add("toggle_enabled");
    }
}

function hud_editor_toggle_show_guides(toggle) {
    //toggle = _id("hud_editor_show_guides_button");
    if (toggle.dataset.enabled == "true") {
        toggle.classList.remove("toggle_enabled");
        toggle.dataset.enabled = "false";
        hud_editor_set_guides(false);
    } else {
        toggle.classList.add("toggle_enabled");
        toggle.dataset.enabled = "true";
        hud_editor_set_guides(true);
    }
}

function hud_editor_toggle_snap_to_grid(toggle) {
    //toggle = _id("hud_editor_snap_to_grid_button");
    if (toggle.dataset.enabled == "true") {
        toggle.classList.remove("toggle_enabled");
        toggle.dataset.enabled = "false";
        hud_editor_set_snap(false);
    } else {
        toggle.classList.add("toggle_enabled");
        toggle.dataset.enabled = "true";
        hud_editor_set_snap(true);
    }
}

function hud_editor_change_tab(id){

    if(id === "hud_properties") {
        _id("hud_editor_list_view").style.display = "none";
        _id("hud_panel_button_properties").classList.add("selected");
        _id("hud_panel_button_list").classList.remove("selected");
    } else {
        _id("hud_properties").style.display = "none";
        _id("hud_panel_button_properties").classList.remove("selected");
        _id("hud_panel_button_list").classList.add("selected");
    }   

    anim_show(_id(id), 200, "flex", function() {
        if (id === "hud_properties") {
            refreshScrollbar(_id("hud_properties"));
        } else {
            refreshScrollbar(_id("hud_editor_list_view"));
        }
    });
}

function hud_editor_save_dialog() {
    let selected_index = null;
    let slots = [];

    let cont = _createElement("div", "hud_dialog");
    cont.appendChild(_createElement("div", "generic_modal_dialog_header", (global_active_hud_type == HUD_PLAYING) ? localize("hud_type_play_save") : localize("hud_type_spec_save")));

    let hud_list = _createElement("div", "hud_list");
    hud_list.appendChild(_createElement("div", "title", localize("hud_select_slot")));

    let action_cont = _createElement("div", "generic_modal_dialog_action");
    let save_btn = _createElement("div", ["dialog_button", "positive", "locked"], localize("menu_button_save"));
    let close_btn = _createElement("div", ["dialog_button", "negative"], localize("menu_button_cancel"));
    action_cont.appendChild(save_btn);
    action_cont.appendChild(close_btn);

    close_btn.addEventListener("click", function() {
        closeBasicModal();
    });
    save_btn.addEventListener("click", function() {
        if (selected_index == null) return;

        // Store the hud with the current global version
        update_hud_version(editing_hud_data);

        let params = {
            "title": slots[selected_index].input.value,
            "type": global_active_hud_type,
            "hud": editing_hud_data,
        };
        api_request("POST", "/user/hud/"+selected_index, params, function(data) {
            load_user_hud_list();
            closeBasicModal();
        });
    });
    
    for (let i=0; i<global_user_hud_slots; i++) {
        let title = localize("hud_slot_empty");
        let type = localize("play");
        let unused = true;
        if (i in global_user_huds) {
            title = global_user_huds[i].hud_title;
            unused = false;
        }
        if (title == null) title = "";
        let hud_slot = _createElement("div", "hud_slot");
        let hud_index = _createElement("div", "hud_index", i + 1);
        let hud_title = _createElement("div", "hud_title", title);
        let hud_title_input =_createElement("input", ["hud_title", "hud_title_input"]);
        hud_title_input.maxLength = 255;
        hud_title_input.type = "text";
        hud_title_input.value = title;
        let hud_id = _createElement("div", "hud_id");
        if (i in global_user_huds) {
            hud_id.classList.add("has_id");
            hud_id.dataset.id = global_user_huds[i].hud_id;
            hud_id.dataset.msgId="hud_copy_key";
            add_tooltip2_listeners(hud_id);
        }
        

        hud_slot.appendChild(hud_index);
        hud_slot.appendChild(hud_title);
        hud_slot.appendChild(hud_title_input);
        if (!unused) hud_slot.appendChild(_createElement("div", ["hud_type", "type_"+global_user_huds[i].hud_type]));
        hud_slot.appendChild(hud_id);
        hud_list.appendChild(hud_slot);

        hud_slot.addEventListener("click", function() {
            if (hud_index.classList.contains("selected")) return;

            for (let slot of slots) {
                if (slot.index.classList.contains("selected")) slot.index.classList.remove("selected");
                slot.title.style.display = "block";
                slot.input.style.display = "none";
            }

            hud_title.style.display = "none";
            hud_index.classList.add("selected");
            if (unused) hud_title_input.value = '';
            else hud_title_input.value = title;
            hud_title_input.style.display = "block";
            hud_title_input.focus();
            hud_title_input.selectionStart = hud_title_input.selectionEnd = hud_title_input.value.length;
            selected_index = i;

            save_btn.classList.remove("locked");
        });

        hud_id.addEventListener("click", function(e) {
            e.stopPropagation();
            _play_click1();
            engine.call("copy_text", hud_id.dataset.id);
        });

        slots.push({
            "slot": hud_slot,
            "index": hud_index,
            "title": hud_title,
            "input": hud_title_input,
        });
    }
    cont.appendChild(hud_list);
    cont.appendChild(action_cont);

    openBasicModal(cont);
}

function hud_editor_load_dialog() {
    let selected_hud_id = null;
    let slots = [];

    let cont = _createElement("div", "hud_dialog");
    cont.appendChild(_createElement("div", "generic_modal_dialog_header", (global_active_hud_type == HUD_PLAYING) ? localize("hud_type_play_load") : localize("hud_type_spec_load")));

    let hud_list = _createElement("div", "hud_list");
    hud_list.appendChild(_createElement("div", "title", localize("hud_select")));

    let action_cont = _createElement("div", "generic_modal_dialog_action");
    let load_btn = _createElement("div", ["dialog_button", "positive", "locked"], localize("menu_button_load"));
    let close_btn = _createElement("div", ["dialog_button", "negative"], localize("menu_button_cancel"));
    action_cont.appendChild(load_btn);
    action_cont.appendChild(close_btn);

    let load_key_cont = _createElement("div", "load_key_cont");
    load_key_cont.appendChild(_createElement("div", "load_key_title", localize("hud_load_key_title")));
    let load_key_input = _createElement("input", "load_key_input");
    load_key_input.addEventListener("focus", function() {
        for (let slot of slots) {
            if (slot.index.classList.contains("selected")) slot.index.classList.remove("selected");
        }
        selected_hud_id = null;

        load_btn.classList.add("locked");
    });
    load_key_input.addEventListener("keyup", function() {
        let val = load_key_input.value.trim();
        if (val.length) {
            load_btn.classList.remove("locked");
            selected_hud_id = val;
        } else {
            load_btn.classList.add("locked");
            selected_hud_id = null;
        }
    });
    load_key_cont.appendChild(load_key_input);

    close_btn.addEventListener("click", function() {
        closeBasicModal();
    });
    load_btn.addEventListener("click", function() {
        if (selected_hud_id == null) return;
        
        api_request("GET", "/user/hud/"+selected_hud_id, {}, function(data) {
            if (data != null && "hud" in data && "hud" in data.hud) {
                try {
                    let hud = JSON.parse(data.hud.hud);
                    editing_hud_data = hud;
                    update_hud_version(editing_hud_data);
                    send_sanitized_hud_definition_to_engine();
                    refresh_preview_hud();
                } catch(e) {
                    console.log("error parsing saved hud", e.message);
                    queue_dialog_msg({
                        "title": localize("title_error"),
                        "msg": localize("hud_parsing_error"),
                    });
                }
            } else {
                queue_dialog_msg({
                    "title": localize("title_error"),
                    "msg": localize("hud_not_found"),
                });
            }
            closeBasicModal();
        });
    });

    let hud_count = 0;
    for (let i=0; i<global_user_hud_slots; i++) {
        let title = localize("hud_slot_empty");
        let unused = true;
        if (i in global_user_huds) {
            title = global_user_huds[i].hud_title;
            unused = false;
        } else {
            continue;
        }
        hud_count++;
        if (title == null) title = "";
        let hud_slot = _createElement("div", "hud_slot");
        let hud_index = _createElement("div", "hud_index", i + 1);
        let hud_title = _createElement("div", "hud_title", title);
        hud_slot.appendChild(hud_index);
        hud_slot.appendChild(hud_title);
        if (!unused) hud_slot.appendChild(_createElement("div", ["hud_type", "type_"+global_user_huds[i].hud_type]));
        let hud_id = _createElement("div", "hud_id");
        if (i in global_user_huds) {
            hud_id.classList.add("has_id");
            hud_id.dataset.id = global_user_huds[i].hud_id;
            hud_id.dataset.msgId="hud_copy_key";
            add_tooltip2_listeners(hud_id);
        }
        hud_slot.appendChild(hud_id);
        hud_list.appendChild(hud_slot);

        hud_slot.addEventListener("click", function() {
            if (hud_index.classList.contains("selected")) return;

            for (let slot of slots) {
                if (slot.index.classList.contains("selected")) slot.index.classList.remove("selected");
            }
            hud_index.classList.add("selected");
            selected_hud_id = global_user_huds[i].hud_id;
            load_key_input.value = "";

            load_btn.classList.remove("locked");
        });

        hud_id.addEventListener("click", function(e) {
            e.stopPropagation();
            _play_click1();
            engine.call("copy_text", hud_id.dataset.id);
        });

        slots.push({
            "index": hud_index,
        });
    }
    if (hud_count == 0) {
        hud_list.appendChild(_createElement("div", "no_huds", localize("hud_no_huds_found")));
    }

    cont.appendChild(hud_list);
    cont.appendChild(load_key_cont);
    cont.appendChild(action_cont);

    openBasicModal(cont);
}

function load_user_hud_list() {
    api_request("GET", "/user/huds", {}, function(data) {
        global_user_huds = {};
        if ("huds" in data) {
            for (let hud of data.huds) {
                global_user_huds[hud.hud_index] = hud;
            }
        }
    });
}