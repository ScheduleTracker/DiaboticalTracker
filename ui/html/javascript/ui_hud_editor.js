window.hud_editor_preview_downscale_factor = 0.5; 
window.hud_editor_preview_fullscreen = false;


const MAX_HUD_DEFINITION_LENGTH = 16384;


const d = {"width": 10,
            "height": 6,
            "fontSize": 3}






function reset_hud(){
    engine.call('reset_hud');
    engine.call('get_hud_json').then(function (str) {
        try {
            editing_hud_data = JSON.parse(str);
            write_misc_hud_preference('hudaspect', 'default');
            write_misc_hud_preference('fl', '1');
    		if (global_misc_hud_preference["dirhint"]=='1') {
    		    place_direction_hints_element(false); // include or exclude element in default hud according to explicit user intent
    		} else {
                refresh_preview_hud();
            }
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

            editing_hud_data.groups[id].x = xValue + x;
            editing_hud_data.groups[id].y = yValue + y;
    
            window.hud_editor_selected_element.style.left = (editing_hud_data.groups[id].x) + "%";
            window.hud_editor_selected_element.style.top  = (editing_hud_data.groups[id].y) + "%";
        } else {
            var xValue = parseFloat(editing_hud_data.elements[id].x);
            var yValue = parseFloat(editing_hud_data.elements[id].y);

            editing_hud_data.elements[id].x = xValue + x;
            editing_hud_data.elements[id].y = yValue + y;
    
            window.hud_editor_selected_element.style.left = (editing_hud_data.elements[id].x) + "%";
            window.hud_editor_selected_element.style.top  = (editing_hud_data.elements[id].y) + "%";
        }
  
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
        console.log("Good drop", clone);

        let hud_preview = _id("hud_preview");

        //console.log("dropped element with id " + id + " and name " + clone.dataset.name + " data= " + JSON.stringify(clone.dataset));
        var hud_rect = hud_preview.getBoundingClientRect();
        var pos_x = ev.clientX - hud_rect.left;
        var pos_y = ev.clientY - hud_rect.top;

        if (!clone.dataset.id) {
            // Add new item  
            hud_editor_add_element(clone.dataset.name, pos_x, pos_y);
            engine.call('ui_sound', 'ui_drop1');
        } else {
            //Moving existing item
            //PITFALL: We used to use clean_float here but it caused an annoying 1 pixel offset when moving things

            if (clone.dataset.type != "group") {
                if (Number(clone.dataset.id) in editing_hud_data.elements && editing_hud_data.elements[Number(clone.dataset.id)].gid > -1) {
                    hud_preview = _id("group_"+editing_hud_data.elements[Number(clone.dataset.id)].gid+"_preview");
                    hud_rect = hud_preview.getBoundingClientRect();
                    pos_x = ev.clientX - hud_rect.left;
                    pos_y = ev.clientY - hud_rect.top;
                }
            }

            var left = pos_x + draggableStartOffset.x;
            var top = pos_y + draggableStartOffset.y;
            
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

            var xPosPercent = 100 * xPos;
            var yPosPercent = 100 * yPos;

            if(window.hud_editor_snap_to_grid_enabled){
                xPosPercent = Math.round(xPosPercent);
                yPosPercent = Math.round(yPosPercent);
            }

            hud_editor_set_x(clone.dataset.type, clone.dataset.id, xPosPercent);
            hud_editor_set_y(clone.dataset.type, clone.dataset.id, yPosPercent);
            
            refresh_preview_element(clone.dataset.type, clone.dataset.id);
            preview_hud_select(clone.dataset.sourceId);
            //refresh_preview_hud();
        }
    });

    _id("hud_editor").style.setProperty('--ratio',window.hud_editor_preview_downscale_factor);
}

var editing_hud_data = {};

function post_load_setup_hud_editor() {
    engine.call('get_hud_json').then(function (str) {
        try {
            editing_hud_data = JSON.parse(str);
            hud_version_check(editing_hud_data);
            refresh_preview_hud();
            // if misc setting not present => HUD is default. Sync default definition to HUD_override.js, in case engine definition is out of date.
            /*
            if (!read_misc_hud_preference(editing_hud_data)) {
                reset_hud();
            } else {
                refresh_preview_hud();
            }
            */
        } catch (err) {
            echo("Error parsing HUD definition (Maybe it was too long so it got clamped.)");
        }        
    });
}

let global_hud_version = 1;
function hud_version_check(hud) {
    if (!("version" in hud)) hud.version = 0;
    let add_elements = [];

    let version = Number(hud.version);
    if (version < global_hud_version) {
        if (version < 1) add_elements.push("player_name");
    }
    

    // Add potentially missing elements due to outdated hud version
    for (let add_el of add_elements) {
        let found = false;
        for (let el of hud.elements) {
            if (el.t == add_el) {
                found = true
                break;
            }
        }

        if (!found) {
            if (add_el == "player_name") {
                hud.elements.push({
                    "t":"player_name",
                    "gid":-1,
                    "x":50,
                    "y":30,
                    "fontSize":"4",
                    "pivot":"center",
                    "color":"#FFFFFF",
                    "shadow":1,
                    "teamColor":1,
                    "font":"montserrat-bold",
                    "vis":"s",
                    "pre":1
                });
            }
        }
    }

    hud.version = global_hud_version;
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
    refresh_preview_hud();
    //_dump(hud);
}

window.hud_editor_selected_item = -1;
window.hud_editor_selected_type = undefined;
window.hud_editor_selected_element = undefined;

function editorCreateAdvanced(element, id, type, idx) {
    let html = '';
    html += '<div class="hud_editor_option_row row_advanced">';
    html +=  '<div class="option">';
    html +=   '<div class="button" data-idx="'+idx+'" data-type="'+type+'">Advanced</div>';
    html +=  '</div>';
    html += '</div>';

    return html;
}
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
 /* Unnecessary if val = element.dataset[key] works, needed if we revert to val = elem[key]
    if (element.dataset.type == "group") {
        var elem = editing_hud_data.groups[idx];
    } else {
        var elem = editing_hud_data.elements[idx];
    }
*/    
    var val = element.dataset[key];

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

    // Element selected in the preview window
    console.log("element select", element.dataset.type);
    
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
    var advanced = _id("hud_properties_list").querySelector(".hud_editor_option_row.row_advanced .option .button");
    if (advanced) {
        advanced.addEventListener("click", editorOpenAdvancedModal);
    }

    if (type == "group") {
        hud_group.afterCreatedCode(id);
    } else {
        if (result.length > 0) {
            result[0].afterCreatedCode(id);
        }
    }

    hud_editor_change_tab("hud_properties");
}

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

    var val = editing_hud_data.elements[captured_id][key];
    if (type == "group") {
        val = editing_hud_data.groups[captured_id][key];
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
            } element_property_override_filter(elements[i]);
        }
    }
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
}

function refresh_preview_element(type, idx) {
    // Rerender a single element in the hud editor rather than the whole hud
    // Note: with the on_hud_edited call below the HUD View will still always rerender the whole hud

    //console.log("refresh_preview_element",type, idx, _dump(editing_hud_data));

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
            if (!getFirstMatchingElement(hud_elements, editing_hud_data.elements[i].t)) {
                console.log("remove invalid element from elements", _dump(editing_hud_data.elements[i]));
                editing_hud_data.elements.splice(i,1);
            }
        } read_misc_hud_preference();
    }
    send_sanitized_hud_definition_to_engine();
    _id("hud_preview_container").style.setProperty('--ratio',window.hud_editor_preview_downscale_factor);
    update_preview_aspect_state(global_misc_hud_preference["hudaspect"]);
    make_hud_in_element("hud_preview", true);
    reset_hud_properties();
}

function send_sanitized_hud_definition_to_engine() {
    // Don't save the hud if its larger than what the variable allows to prevent the loss of the rest of the hud (unparseable json)
    let json = JSON.stringify(editing_hud_data);
    if (json.length <= MAX_HUD_DEFINITION_LENGTH) {
        // Save the hud
        engine.call("set_hud_json", json);
    }
    // Let the engine know that the hud changed so it can call a hud refresh in the hud view as well
    engine.call("on_hud_edited");
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

function read_misc_hud_preference(def) {
    var haveMisc = false;
    var misc = def ? {} : global_misc_hud_preference;
    var ref = editing_hud_data;
    if (!def) def = ref;
    var elements = def.elements;
    if (elements) {
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].t == "misc_settings") {
                // Copy each individual "misc_setting" key over instead of overwriting the whole object and thus removing any pre-set default values
                for (let key of Object.keys(elements[i])) {
                    misc[key] = elements[i][key];
                }
                if (misc['fl']) haveMisc = true;
                break;
            }
        }
    }
    callback_on_misc_hud_preference_read(misc);
    return haveMisc;
}


function write_misc_hud_preference(key, value, forceupdate){
    global_misc_hud_preference[key] = value;
    var found = false;
    if (!("elements" in editing_hud_data)) {
        editing_hud_data.elements = [];
    }
    var elements = editing_hud_data.elements;
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].t == "misc_settings") {
            found = true;
            break;
        }
    }
    if (!found) {
        hud_editor_unshift_element("misc_settings", 0, 0);
    }
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].t == "misc_settings") {
            hud_editor_set_value("misc", i, key, value);
        }
    }
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
        window.hud_editor_preview_downscale_factor = 0.75; 
        window.hud_editor_preview_fullscreen = true;
        _id("hud_editor").style.setProperty('--ratio',window.hud_editor_preview_downscale_factor);
        _id("settings_screen_window").classList.add("fullscreen");
        _id("hud_editor_elements_holder").classList.add("fullscreen");
        _id("settings_screen_menu").style.display = "none";
        update_preview_aspect_state(global_misc_hud_preference["hudaspect"]);
        refresh_preview_hud();
    } else {
        toggle.classList.remove("toggle_enabled");
        toggle.dataset.enabled = "false";
        window.hud_editor_preview_downscale_factor = 0.5; 
        window.hud_editor_preview_fullscreen = false;
        _id("hud_editor").style.setProperty('--ratio',window.hud_editor_preview_downscale_factor);
        _id("settings_screen_window").classList.remove("fullscreen");
        _id("hud_editor_elements_holder").classList.remove("fullscreen");
        _id("settings_screen_menu").style.display = "block";
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

let hud_editor_elements_drag_scroll = undefined;
window.addEventListener("load", function() {
    let cont = _id('hud_editor_elements');
    hud_editor_elements_drag_scroll = new Dragscroll(cont);

    cont.addEventListener("wheel", function(e) {        
        if (e.deltaY < 0) {
            hud_editor_elements_drag_scroll.scrollTo(false, 0.2);
        } else {
            hud_editor_elements_drag_scroll.scrollTo(true, 0.2);
        }
        e.preventDefault();
    });

    document.getElementById('hud_editor_elements_left_arrow').addEventListener("click", function () {
        hud_editor_elements_drag_scroll.scrollTo(false, 0.3);
    });
    document.getElementById('hud_editor_elements_right_arrow').addEventListener("click", function() {
        hud_editor_elements_drag_scroll.scrollTo(true, 0.3);
    });
});

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


