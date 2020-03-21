const hud_elements = [];
var hud_group = null;
var hud_editor_group_map = {};
var hud_editor_group_map_list = {};

function make_hud_in_element(container_id, editing_mode) {
    var container_element = _id(container_id);
   
    //Clear the current hud
    _empty(container_element);
    if (container_id === "real_hud") {
        _empty(_id("hud_load_during_loading"));
    }
    
    var hud = editing_hud_data;

    if(editing_mode){
        _empty(_id("hud_editor_list_view_inner"));
    }

    // Map to the elements
    hud_editor_group_map = {};
    // Map to hud editor element list entries
    hud_editor_group_map_list = {};
    if (hud.groups) {
        // Create all group elements first so we can add the other elements afterwards
        for (var i = 0; i < hud.groups.length; i++) {
            let gid = hud.groups[i].gid;

            var new_group = document.createElement("div");

            new_group.dataset.type = "group";
            new_group.dataset.id = i;
            new_group.dataset.gid = gid;

            if (hud_group) {
                if(hud_group.hudEditCode.length > 0) {

                    for (var j = 0; j < hud_group.hudEditCode.length; j++) {
                        var settingName = hud_group.hudEditCode[j].type;
                        var settingValue = hud.groups[i][settingName];

                        if (settingName == "advanced") continue;

                        if (settingValue != undefined) {
                            new_group.style.setProperty("--" + settingName, settingValue + "");
                            new_group.dataset[settingName] = settingValue;
                        } else {
                            if (hud_group.defaultValues[settingName]) {
                                new_group.style.setProperty("--" + settingName, hud_group.defaultValues[settingName] + "");
                                new_group.dataset[settingName] = hud_group.defaultValues[settingName];
                            }
                        }
                    }
                }
            }

            var id = "group_" + i;
            if (editing_mode) id += "_preview";
            new_group.id = id;
            new_group.dataset.groupIdx = i;
            
            new_group.classList.add("elem_group");

            var downscale = "1";
            if(editing_mode) {
                new_group.classList.add("hud_isPreview");
                downscale = window.hud_editor_preview_downscale_factor; //make sure this is always the same as the #hud_preview height
            }

            // Keep track of the group
            hud_editor_group_map[gid] = new_group;

            new_group.style.position = "absolute";

            hud.groups[i].x = _clamp(hud.groups[i].x,0,100);
            hud.groups[i].y = _clamp(hud.groups[i].y,0,100);
            new_group.style.left = (hud.groups[i].x) + "%";
            new_group.style.top  = (hud.groups[i].y) + "%";

            var pivotTransformStringX = "translateX(-50%)";
            var pivotTransformStringY = "translateY(-50%)";
            if (hud.groups[i].pivot == "top-left") {
                pivotTransformStringX = "translateX(-0%)";
                pivotTransformStringY = "translateY(-0%)";
            } else if (hud.groups[i].pivot == "top-right") {
                pivotTransformStringX = "translateX(-100%)";
                pivotTransformStringY = "translateY(-0%)";
            } else if (hud.groups[i].pivot == "bottom-left") {
                pivotTransformStringX = "translateX(-0%)";
                pivotTransformStringY = "translateY(-100%)";
            } else if (hud.groups[i].pivot == "bottom-right") {
                pivotTransformStringX = "translateX(-100%)";
                pivotTransformStringY = "translateY(-100%)";
            } else if (hud.groups[i].pivot == "top-edge") {
                pivotTransformStringY = "translateY(-0%)";
            } else if (hud.groups[i].pivot == "bottom-edge") {
                pivotTransformStringY = "translateY(-100%)";
            } else if (hud.groups[i].pivot == "left-edge") {
                pivotTransformStringX = "translateX(-0%)";
            } else if(hud.groups[i].pivot == "right-edge") {
                pivotTransformStringX = "translateX(-100%)";
            }
            new_group.style.transform = pivotTransformStringX + " " + pivotTransformStringY;

            if (isFinite(hud.groups[i].width)) {
                hud.groups[i].width = Math.max(hud.groups[i].width,0.1);
                new_group.style.width  = vh_size_string_at_least_1px(downscale * hud.groups[i].width);
            }

            if (isFinite(hud.groups[i].height)) {
                hud.groups[i].height = Math.max(hud.groups[i].height,0.1);
                new_group.style.height = vh_size_string_at_least_1px(downscale * hud.groups[i].height);
            }

            // Advanced css rules
            if (hud.groups[i].advanced) {
                editorAddAdvancedProperties(new_group, hud.groups[i].advanced);
            }


            _id(container_id).appendChild(new_group);

            if (editing_mode) {
                
                if (window.hud_editor_selected_item == i && window.hud_editor_selected_type == "group") {
                    new_group.classList.add("selected_hud_editor_element");
                    window.hud_editor_selected_element = new_group;
                }
         
                new_group.addEventListener("click", function(e) {  
                    //We need to check so it has the class, because of some weird bug where you could press an element before it truly finsihed, and it just bugs out everything
                    if(e.target.classList.contains("hud_isPreview")){
                        preview_hud_select(e.target.id);
                    
                        e.stopPropagation();  
                    }
                });

                var para_cont = document.createElement("div");
                para_cont.classList.add("cont");
                para_cont.classList.add("group");

                var para = document.createElement("div");
                var node = document.createTextNode("Element Group");
                para.appendChild(node);
                para.classList.add("hud_editor_list_element");
                para.id = "hud_list_item_" + i;

                para_cont.appendChild(para);

                hud_editor_group_map_list[gid] = para_cont;
                
                _id("hud_editor_list_view_inner").appendChild(para_cont);

                dropElement(para, function(ev, clone){
                    if (!("groupable" in clone.dataset)) return;
                    if (Number(hud.elements[Number(clone.dataset.id)].gid)>=0) {
                    	convert_group_coord_to_hud_coord( hud.elements[Number(clone.dataset.id)].gid , hud.elements[Number(clone.dataset.id)] );
                    	convert_group_coord_to_hud_coord( gid                                        , hud.elements[Number(clone.dataset.id)] , true);
                    } else {
                    	convert_group_coord_to_hud_coord( gid                                        , hud.elements[Number(clone.dataset.id)] , true);
                    }
                    hud.elements[Number(clone.dataset.id)].gid = gid;
                    setTimeout(function() {
                        refresh_preview_hud();
                    },0);
                });
                
                para.dataset.targetId = id;
                para.addEventListener("click", function(e) {
                    if (_id("hud_editor_list_view").style.display == "flex") {
                        let elem = _id(this.dataset.targetId);
                        if (elem != null) {
                            preview_hud_select(elem.id);
                            hud_editor_change_tab("hud_properties");
                            elem.classList.remove("highlight");
                        }
                    }
                });

                para.addEventListener("mouseenter", function(e) {
                    if (_id("hud_editor_list_view").style.display == "flex") 
                        _id(this.dataset.targetId).classList.add("highlight");
                });
                para.addEventListener("mouseleave", function(e) {
                    if (_id("hud_editor_list_view").style.display == "flex") 
                        _id(this.dataset.targetId).classList.remove("highlight");
                });

            }
        }
    }

    if (hud.elements) {
        // Create all non group elements
        for (var i = 0; i < hud.elements.length; i++) {
            if (hud.elements[i].t == "misc_settings" && hud.elements[i].hudaspect && container_id === "real_hud") {
			    var aspect_ratio = hud.elements[i].hudaspect
			    var res = aspect_ratio.split(":",2);
			    var res_hor      = parseInt(res[0],10);
			    var res_vert     = parseInt(res[1],10);
			    if (res_hor && res_vert) {
                    _id(container_id).style.width = (100 * (res_hor / res_vert)) + "vh";
                    _id("hud_load_during_loading").style.width = (100 * (res_hor / res_vert)) + "vh";
			    } else {
                    _id(container_id).style.width = (100 + "vw");
                    _id("hud_load_during_loading").style.width = (100 + "vw");
			    }
                continue;
            }
            hud.elements[i] = element_property_override_filter(hud.elements[i]);
            var new_element = renderElement(container_id, container_element, editing_mode, hud, i);
            if (!new_element) continue;

            // Show the chat during the loading screen
            if (container_id === "real_hud" && hud.elements[i].t === "chat") {
                _id("hud_load_during_loading").appendChild(new_element);
            } else {
                if (hud.elements[i].gid > -1 && hud.elements[i].gid in hud_editor_group_map) {
                    hud_editor_group_map[hud.elements[i].gid].appendChild(new_element);
                } else {
                    _id(container_id).appendChild(new_element);
                }
            }

            if (editing_mode) {
                
                if (window.hud_editor_selected_item == i && window.hud_editor_selected_type != "group") {
                    new_element.classList.add("selected_hud_editor_element");
                    window.hud_editor_selected_element = new_element;
                }
         
                new_element.addEventListener("click", function(e) { 
                    //We need to check so it has the class, because of some weird bug where you could press an element before it truly finsihed, and it just bugs out everything
                    if(e.target.classList.contains("hud_isPreview")){
                        preview_hud_select(e.target.id);
                    
                        e.stopPropagation();  
                    }
                });

                var friendlyName = fetchFriendlyElementName(hud.elements[i].t, 1);
                if (friendlyName) {
                    var para_cont = document.createElement("div");
                    para_cont.classList.add("cont");

                    var para = document.createElement("div");
                    var node = document.createTextNode(friendlyName);
                    para.appendChild(node);
                    para.classList.add("hud_editor_list_element");
                    para.id = "hud_list_item_" + i;

                    para_cont.appendChild(para);
                    
                    if (hud.elements[i].gid > -1 && hud.elements[i].gid in hud_editor_group_map) {
                        hud_editor_group_map_list[hud.elements[i].gid].appendChild(para_cont);
                    } else {
                        _id("hud_editor_list_view_inner").appendChild(para_cont);
                    }

                    para.dataset.groupable = 1;
                    para.dataset.id = i;
                    dragElement(para);
                    
                    para.dataset.targetId = new_element.id;
                    para.addEventListener("click", function(e) {
                        if (_id("hud_editor_list_view").style.display == "flex") {
                            let elem = _id(this.dataset.targetId);
                            if (elem != null) {
                                preview_hud_select(elem.id);
                                hud_editor_change_tab("hud_properties");
                                elem.classList.remove("highlight");
                            }
                        }
                    });

                    para.addEventListener("mouseenter", function(e) {
                        if (_id("hud_editor_list_view").style.display == "flex") {
                            if (this.dataset.targetId.trim().length) {
                                _id(this.dataset.targetId).classList.add("highlight");
                            }
                        }
                    });
                    para.addEventListener("mouseleave", function(e) {
                        if (_id("hud_editor_list_view").style.display == "flex") {
                            if (this.dataset.targetId.trim().length) {
                                _id(this.dataset.targetId).classList.remove("highlight");
                            }
                        }
                    });
                }
            }
        }

        if (editing_mode) {
            // refresh element list scrollbar
            refreshScrollbar(_id("hud_editor_list_view"));
            resetScrollbar(_id("hud_editor_list_view"));
        }
    }

    if (editing_mode) {
        // Add Element dragging support
        _for_each_with_class_in_parent(_id("hud_preview"), "hud_isPreview", el => {
        //_for_each_child(_id("hud_preview"), el => {
            dragElement(el, null, 
                function(e) {
                    e.stopPropagation();
                },
                // detect element drop outside the preview window
                function(element) {
                    if (element.dataset.id !== undefined) {
                        preview_hud_delete_element_confirm(element.dataset.type, parseInt(element.dataset.id));
                    }
                }
            );
        });
    }

}


function getFirstMatchingElement(elements, type) {
    for (let i=0; i<elements.length; i++) {
        if (type == elements[i].type) {
            return elements[i];
        }
    }

    return false;
}


function _process_hud_element_text(container_element, type, element, isPreview) {
    //console.log("_process_hud_element_text " + type + ":" + jquery_element.get(0).outerHTML);

    if (type == "group") {
        return hud_group.getRenderCode(element, isPreview);
    }

    var result = hud_elements.filter(obj => {   
        return obj.type == type
    });
    if (result.length > 0 && element_property_override_filter(result)) {
        if (result[0].previewCode.isEmpty()) {
            return result[0].getRenderCode(element, isPreview);
        } else {
            return result[0].previewCode;
        }
    }
}

function element_property_override_filter(input) {
    var output = input;
    if (output.type == "misc_settings") {
        return false;
    } else if (output["t"] == "yaw_ruler") {
        output["x"] = "50";
        output["y"] = "50";
        output["pivot"] = "center";
    } else if (strafe_hud(output["t"])) {
        if (output["t"] == "g_meter") {
            output["cjspeed"] = isNaN(output["cjspeed"]) ? "390" : output["cjspeed"];
            output["ringInnerSize"] = _clamp(output["ringInnerSize"], 0, 90);
            if (output["rotateWithKeypress"]==1) {
                output["t"] = "throttle";
                output["barWidth"] = output["size"];
                output["barHeight"] = "1";
                output["reversed"] = "1";
                output["opacity"] = "1";
                output["hidePercent"] = 1;
            }
        } else if (output["t"] == "throttle") {
            output["fontSize"] = _clamp(output["fontSize"], 0, 2*output["height"]);
        } else {output = {};}
    } else if (output["t"] == "fps") {
        engine.call("set_real_variable", "hud_fps", 0);
    }
    return output;
}

function propertyIsValidForElement(element, property) {
    for (let i=0; i<element.hudEditCode.length; i++) {
        if (element.hudEditCode[i].type.toLowerCase() == property.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function refresh_hud_element_preview(idx) {
    let container_id = "hud_preview";
    let container_element = _id(container_id);

    // remove the current element from the preview hud
    
    let current = _id("elem_" + idx + "_preview");
    let parent = current.parentElement;
    let next_el = current.nextElementSibling;

    if (current && current.parentNode) {
        current.parentNode.removeChild(current);
    }

    var hud = editing_hud_data;
    if (hud.elements && idx in hud.elements) {

        var new_element = renderElement(container_id, container_element, true, hud, idx, false);
        if (!new_element) return;

        parent.insertBefore(new_element, next_el);
            
        if (window.hud_editor_selected_item == idx && window.hud_editor_selected_type != "group") {
            new_element.classList.add("selected_hud_editor_element");
            window.hud_editor_selected_element = new_element;
        }
    
        new_element.addEventListener("click", function(e) { 
            //We need to check so it has the class, because of some weird bug where you could press an element before it truly finsihed, and it just bugs out everything
            if(e.target.classList.contains("hud_isPreview")){
                preview_hud_select(e.target.id);
            
                e.stopPropagation();  
            }
        });

        // Add Element dragging support
        dragElement(new_element, null,
            function(e) {
                e.stopPropagation();
            },
            // detect element drop outside the preview window
            function(element) {
                if (element.dataset.id !== undefined) {
                    preview_hud_delete_element_confirm(element.dataset.type, parseInt(element.dataset.id));
                }
            }
        );
    }
}

function renderElement(container_id, container_element, editing_mode, hud, idx) {

    var new_element = document.createElement("div");
    new_element.dataset.groupable = 1;
    new_element.dataset.type = hud.elements[idx].t;
    new_element.dataset.id = idx;

    let hud_element = getFirstMatchingElement(hud_elements, hud.elements[idx].t);            
    if (hud_element) {
        if(hud_element.hudEditCode.length > 0) {
            for (var j = 0; j < hud_element.hudEditCode.length; j++) {
                var settingName = hud_element.hudEditCode[j].type;
                var settingValue = hud.elements[idx][settingName];

                if (settingName == "advanced") continue;

                if (settingValue != undefined) {
                    new_element.style.setProperty("--" + settingName, settingValue + "");
                    new_element.dataset[settingName] = settingValue;
                } else {
                    if (hud_element.defaultValues[settingName]) {
                        new_element.style.setProperty("--" + settingName, hud_element.defaultValues[settingName] + "");
                        new_element.dataset[settingName] = hud_element.defaultValues[settingName];
                    }
                }
            }
        }
    } else {
        return false;
    }

    var id = "elem_" + idx;
    if (editing_mode) id += "_preview";
    new_element.id = id;
    new_element.dataset.elemIdx = idx;

    new_element.classList.add("hud_element");
    new_element.classList.add("elem_" + hud.elements[idx].t);
    var downscale = "1";
    if(editing_mode) {
        new_element.classList.add("hud_isPreview");
        downscale = window.hud_editor_preview_downscale_factor; //make sure this is always the same as the #hud_preview height
    }

    new_element.innerHTML = 
        _process_hud_element_text(
            container_element,
            hud.elements[idx].t,
            new_element,                    
            editing_mode
        );

    new_element.style.setProperty("--ratio", downscale);

    if (propertyIsValidForElement(hud_element, "shadow")) {
        if (hud.elements[idx].shadow && (hud.elements[idx].shadow == true || hud.elements[idx].shadow == 1)) {
            new_element.style.textShadow = "2px 2px 3px rgba(0,0,0,0.9)";
        }
    }

    new_element.style.position = "absolute";

    hud.elements[idx].x = _clamp(hud.elements[idx].x,0,100);
    hud.elements[idx].y = _clamp(hud.elements[idx].y,0,100);
    new_element.style.left = (hud.elements[idx].x) + "%";
    new_element.style.top  = (hud.elements[idx].y) + "%";

    // Hack: override small icon sizes to avoid a GameFace crash for now
    if (propertyIsValidForElement(hud_element, "iSize")) {
        if (Number(hud.elements[idx].iSize) < 1) {
            hud.elements[idx].iSize = 1;
            new_element.style.setProperty("--iSize", hud.elements[idx].iSize+"");
            new_element.dataset["iSize"] = hud.elements[idx].iSize;
        }
    }
    if (propertyIsValidForElement(hud_element, "iWidth")) {
        if (Number(hud.elements[idx].iWidth) < 1) {
            hud.elements[idx].iWidth = 1;
            new_element.style.setProperty("--iWidth", hud.elements[idx].iWidth+"");
            new_element.dataset["iWidth"] = hud.elements[idx].iWidth;
        }
    }
    if (propertyIsValidForElement(hud_element, "iHeight")) {
        if (Number(hud.elements[idx].iHeight) < 1) {
            hud.elements[idx].iHeight = 1;
            new_element.style.setProperty("--iHeight", hud.elements[idx].iHeight+"");
            new_element.dataset["iHeight"] = hud.elements[idx].iHeight;
        }
    }

    if (propertyIsValidForElement(hud_element, "pivot")) {
        var pivotTransformStringX = "translateX(-50%)";
        var pivotTransformStringY = "translateY(-50%)";
        if(hud.elements[idx].pivot == "top-left"){
            pivotTransformStringX = "translateX(-0%)";
            pivotTransformStringY = "translateY(-0%)";
        }
        else if(hud.elements[idx].pivot == "top-right"){
            pivotTransformStringX = "translateX(-100%)";
            pivotTransformStringY = "translateY(-0%)";
        }
        else if(hud.elements[idx].pivot == "bottom-left"){
            pivotTransformStringX = "translateX(-0%)";
            pivotTransformStringY = "translateY(-100%)";
        }
        else if(hud.elements[idx].pivot == "bottom-right"){
            pivotTransformStringX = "translateX(-100%)";
            pivotTransformStringY = "translateY(-100%)";
        }
        else if(hud.elements[idx].pivot == "top-edge"){
            pivotTransformStringY = "translateY(-0%)";
        }
        else if(hud.elements[idx].pivot == "bottom-edge"){
            pivotTransformStringY = "translateY(-100%)";
        }
        else if(hud.elements[idx].pivot == "left-edge"){
            pivotTransformStringX = "translateX(-0%)";
        }
        else if(hud.elements[idx].pivot == "right-edge"){
            pivotTransformStringX = "translateX(-100%)";
        }
        new_element.style.transform = pivotTransformStringX + " " + pivotTransformStringY;
    }

    if (propertyIsValidForElement(hud_element, "background")) {
        if (hud.elements[idx].background) {
            new_element.style.background = hud.elements[idx].background;
        }
    }

    if (propertyIsValidForElement(hud_element, "color")) {
        new_element.style.color = hud.elements[idx].color;
    }

    if (propertyIsValidForElement(hud_element, "font")) {
        if (hud.elements[idx].font != undefined && hud.elements[idx].font != "default") {
            new_element.style.fontFamily = hud.elements[idx].font;
        }
    }

    if (propertyIsValidForElement(hud_element, "v_align")) {
        new_element.style.alignItems = hud.elements[idx].v_align;
    }

    if (propertyIsValidForElement(hud_element, "align")) {
        if (hud.elements[idx].align == "left"){
            new_element.style.justifyContent = "flex-start";
        } else if (hud.elements[idx].align == "right") {
            new_element.style.justifyContent = "flex-end";
        } else if (hud.elements[idx].align == "center") {
            new_element.style.justifyContent = "center";
        }
    }

    if (propertyIsValidForElement(hud_element, "width")) {
        if (isFinite(hud.elements[idx].width)) {
            hud.elements[idx].width = Math.max(hud.elements[idx].width,0.1);
            new_element.style.width = vh_size_string_at_least_1px(downscale * hud.elements[idx].width);
        }
    }

    if (propertyIsValidForElement(hud_element, "height")) {
        if (isFinite(hud.elements[idx].height)) {
            hud.elements[idx].height = Math.max(hud.elements[idx].height,0.1);
            new_element.style.height = vh_size_string_at_least_1px(downscale * hud.elements[idx].height);
        }
    }

    if (propertyIsValidForElement(hud_element, "fontSize")) {
        new_element.style.fontSize =  (downscale * hud.elements[idx].fontSize) + "vh";
    }

    // Border radius support for all elements (container element only)
    if (propertyIsValidForElement(hud_element, "bRadius")) {
        if (hud.elements[idx].cCode && hud.elements[idx].bRadius) {
            if (!isNaN(hud.elements[idx].cCode) && !isNaN(hud.elements[idx].bRadius)) {
                let border_radius_mask =  parseInt(hud.elements[idx].cCode);
                let border_radius_top_right = (border_radius_mask & 1)/1;
                let border_radius_top_left  = (border_radius_mask & 2)/2;
                let border_radius_bot_left  = (border_radius_mask & 4)/4;
                let border_radius_bot_right = (border_radius_mask & 8)/8;
                
                if (border_radius_top_right) {
                    new_element.style.setProperty("--border-top-right-radius", (hud.elements[idx].bRadius * downscale));
                    new_element.style.borderTopRightRadius = (hud.elements[idx].bRadius * downscale) + "vh"; 
                }
                if (border_radius_top_left)  { 
                    new_element.style.setProperty("--border-top-left-radius", (hud.elements[idx].bRadius * downscale)); 
                    new_element.style.borderTopLeftRadius = (hud.elements[idx].bRadius * downscale) + "vh"; 
                }
                if (border_radius_bot_left)  { 
                    new_element.style.setProperty("--border-bottom-left-radius", (hud.elements[idx].bRadius * downscale)); 
                    new_element.style.borderBottomLeftRadius = (hud.elements[idx].bRadius * downscale) + "vh"; 
                }
                if (border_radius_bot_right) { 
                    new_element.style.setProperty("--border-bottom-right-radius", (hud.elements[idx].bRadius * downscale)); 
                    new_element.style.borderBottomRightRadius = (hud.elements[idx].bRadius * downscale) + "vh"; 
                }
            }
        }
    }

    // Advanced css rules
    if (propertyIsValidForElement(hud_element, "advanced")) {
        if (hud.elements[idx].advanced) {
            editorAddAdvancedProperties(new_element, hud.elements[idx].advanced)
        }
    }
    
    // 3D pitch
    if (hud.elements[idx].showIn3D&&hud.elements[idx].previewpitch) {
        new_element.style.transform = new_element.style.transform + " rotateX(" + (90+Number(hud.elements[idx].previewpitch)) + "deg)";
    }

    return new_element;
}

function editorAddAdvancedProperties(element, rule_list) {
    for (let rule of rule_list) {
        if (editor_valid_advanced_rules.includes(rule[0]) || rule[0].startsWith("border-")) {
            let property = rule[0].toLowerCase().trim();

            if (property == "background-color") {
                element.style.backgroundColor = rule[1];
            } else if (property == "box-shadow") {
                element.style.boxShadow = rule[1];
            } else if (property == "text-shadow") {
                element.style.textShadow = rule[1];
            } else if (property == "transform") {
                element.style.transform = element.style.transform + " " + rule[1];
            } else if (property == "background-image") {
                element.style.backgroundImage = rule[1];
            } else if (property.includes("-")) {
                let camelCased = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
                element.style[camelCased] = rule[1]+"";
            } else {
                element.style[property] = rule[1]+"";
            }
        }
    }
}

function vh_size_string_at_least_1px(vh_size) {
    let px_size = onevh_float * vh_size;
    if (px_size < 1) return '1px';
    return vh_size + 'vh';
}