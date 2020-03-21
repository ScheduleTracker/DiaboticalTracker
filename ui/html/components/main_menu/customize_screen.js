let global_customization_list = undefined;
let global_customization_content = undefined;
let global_customization_active_category = undefined;
let global_customization_active_sub_category = undefined;

let global_customization_data = [];
let global_customization_data_map = {};

// customization_id -> thumbnail path
let global_customization_asset_store = {};

function init_screen_customize() {
    global_customization_list = _id("customize_screen").querySelector(".category_list");
    global_customization_content = _id("customize_screen").querySelector(".customization_window");

    bind_event('set_asset_browser_content', function (stickersJSON) {
        let stickers = [];
        try {
            stickers = JSON.parse(stickersJSON);
        } catch (e) {
            console.log("ERROR parsing stickers JSON");
        }
        GLOBAL_DEFAULT_CUSTOMIZATION_OPTIONS["sticker"] = [];
        for (let d of stickers) {
            global_customization_asset_store[d.id] = d.thumbnail_path+".dds";
    
            if (d.thumbnail_path.includes("autodecals")) {
                // Temporarily add all stickers as default so people can use them
                GLOBAL_DEFAULT_CUSTOMIZATION_OPTIONS["sticker"].push(d.id);
            }
        }
    });
    
    // Mwheel view zoom on character
    _id("customize_model_click_area").addEventListener("wheel", function(e) {
        if (e.deltaY < 0) {
            // scroll up
            engine.call("decals_zoom_in");
        } else {
            // scroll down
            engine.call("decals_zoom_out");
        }
    });

    let last_decals_rotation_position = {};
    let decals_rotation_dragging = false;
    //let last_weapon_rotation_position = {};
    //let weapon_rotation_dragging = false;

    _id("customize_model_click_area").addEventListener("mousedown", function(e) {
        if (e.button == 2) {
            decals_rotation_dragging = true;
        } else if (e.button == 1) {
            engine.call("start_mmb_dragging");
        }
    });

    document.addEventListener("mouseup", function() {
        decals_rotation_dragging = false;
        weapon_rotation_dragging = false;
    });

    _id("customize_model_click_area").addEventListener("mousemove", function(e) {
        if (decals_rotation_dragging) {
            if (typeof (last_decals_rotation_position.x) !== 'undefined') {
                var dx = e.clientX - last_decals_rotation_position.x;
                var dy = last_decals_rotation_position.y - e.clientY;
                engine.call("add_decals_model_rotation", dx, dy);
            }
        }
        engine.call("set_decals_cursor", e.clientX, e.clientY);

        last_decals_rotation_position = {
            x: e.clientX,
            y: e.clientY
        };
    });

    _id("customize_model_click_area").addEventListener("mouseenter", function(e) {
        engine.call("skins_eggbot_hovered", true);
    });
    _id("customize_model_click_area").addEventListener("mouseleave", function(e) {
        engine.call("skins_eggbot_hovered", false);
    });

    _id("customize_model_click_area").addEventListener("click", function(e) {
        if (e.button == 0) {
            engine.call("decal_click", e.clientX, e.clientY);
        }
    });


}

// Gather all of the users customization items
function load_user_customizations() {
    api_request(global_stats_api, "/user/customization", {}, function(data) {
        // Add user customizations
        if (data) global_customization_data = data["customization"];

        // Add defaults
        customization_add_defaults("avatar", global_customization_data);
        customization_add_defaults("sticker", global_customization_data);

        for (let c of global_customization_data) {
            global_customization_data_map[c.customization_id] = c;
        }

        customization_pre_render_all_categories();
    });
}

function customization_add_defaults(category, data) {
    if (category in GLOBAL_DEFAULT_CUSTOMIZATION_OPTIONS) {
        for (let id of GLOBAL_DEFAULT_CUSTOMIZATION_OPTIONS[category]) {
            data.push({
                "customization_id": id,
                "customization_type": global_customization_type_id_map[category],
                "customization_sub_type": "",
                "customization_set_id": "",
                "rarity": 0,
                "amount": 1,
            });
        }
    }
    return data;
}

function set_customize_data(data) {
    let avatar = global_customization_list.querySelector(".avatar");
    if (avatar) avatar.style.backgroundImage = "url("+_avatarUrl(data.data.avatar)+")";
    
    let flag = global_customization_list.querySelector(".country_flag");
    if (flag && data.data.country) flag.style.backgroundImage = "url("+_flagUrl(data.data.country)+")";
    else flag.style.backgroundImage = "none";
}

function customization_show_window(window) {
    if (window == "list") {
        global_customization_list.style.display = "flex";
        global_customization_content.style.display = "none";
        global_customization_active_category = undefined;
        global_customization_active_sub_category = undefined;

        engine.call("on_show_customization_screen_eggbot", true);

        // hide sticker tools
        _id("customize_screen_stickers").style.display = "none";  
        // disable active sticker tools
        customize_set_tool("none");
    } else if (window == "content") {
        global_customization_list.style.display = "none";
        global_customization_content.style.display = "flex";
    }
}

// Create all the customization item lists and cache them
function customization_pre_render_all_categories() {
    let options = [];
    options.push(["avatar",""]);
    options.push(["flag",""]);
    options.push(["sticker",""]);
    options.push(["shoes",""]);
    options.push(["music","powerup"]);
    options.push(["music","menu"]);
    options.push(["emote","greeting"]);
    options.push(["emote","taunt"]);
    options.push(["spray",""]);
    options.push(["weapon","melee"]);
    options.push(["weapon_attachment","melee"]);
    
    let content = _id("customization_window_content_inner");
    for (let o of options) {
        customization_render_category_content(content, o, global_customization_data.filter(function(c) {
            if (c.customization_type == global_customization_type_id_map[o[0]]) {
                if (o[1].length) {
                    if (o[1] == c.customization_sub_type) return true;
                } else {
                    return true;  
                }
            }
            return false;
        }));
    }
}

function customization_load_category(e, category) {
    if (e.currentTarget.classList.contains("locked")) return;

    global_customization_active_category = category;

    let options = [];
    if (category == "profile") {
        options.push(["avatar",""]);
        options.push(["flag",""]);
    } else if (category == "character") {
        options.push(["sticker",""]);
        //options.push(["shoes",""]);
    } else if (category == "music") {
        options.push(["music","powerup"]);
        options.push(["music","menu"]);
    } else if (category == "emotes") {
        options.push(["emote","greeting"]);
        options.push(["emote","taunt"]);
    } else if (category == "sprays") {
        options.push(["spray",""]);
    } else if (category == "weapons") {
        options.push(["weapon","melee"]);
    } else if (category == "weapon_attachments") {
        options.push(["weapon_attachment","melee"]);
    }

    if (options.length) global_customization_active_sub_category = options[0];

    let content = _id("customization_window_content_inner");
    customization_render_category(category, options);
    customization_render_category_content(content, options[0], global_customization_data.filter(function(c) {
        if (c.customization_type == global_customization_type_id_map[options[0][0]]) {
            if (options[0][1].length) {
                if (options[0][1] == c.customization_sub_type) return true;
            } else {
                return true;  
            }
        }
        return false;
    }));
    customization_show_window("content", true);
}


function customization_render_category(category, options) {
    let cont = _id("customize_screen").querySelector(".customization_window");

    let title = cont.querySelector(".title");
    let menu = cont.querySelector(".menu");
    let content = _id("customization_window_content_inner");
    let bottom = cont.querySelector(".bottom");

    if (category == "character") bottom.style.display = "flex";
    else bottom.style.display = "none";

    // hide sticker tools
    _id("customize_screen_stickers").style.display = "none";
    // disable active sticker tools
    customize_set_tool("none");

    _html(title, localize("customize_"+category));

    _empty(menu);

    if (options.length > 1) {
        for (let o of options) {
            let option = _createElement("div","option");

            if (category == "weapons" || category == "weapon_attachments") {
                let w_data = global_item_name_map["weapon"+o[0]];
                option.style.backgroundImage = "url("+w_data[2]+")";

                // Tooltip
                option.dataset.msgId = w_data[1];
                add_tooltip2_listeners(option);
            } else {
                if (o[1].length) {
                    option.textContent = localize("customize_"+o[0]+"_"+o[1]);
                } else {
                    option.textContent = localize("customize_"+o[0]);
                }
            }

            if (options[0][0] == o[0] && options[0][1] == o[1]) {
                option.classList.add("active");
                global_customization_active_sub_category = o;
            }
            _addButtonSounds(option, 1);
            menu.appendChild(option);

            option.addEventListener("click", function() {
                menu.querySelector(".active").classList.remove("active");
                option.classList.add("active");
                global_customization_active_sub_category = o;
                customization_render_category_content(content, o, global_customization_data.filter(function(c) {
                    if (c.customization_type == global_customization_type_id_map[o[0]]) {
                        if (o[1].length) {
                            if (o[1] == c.customization_sub_type) return true;
                        } else {
                            return true;  
                        }
                    }
                    return false;
                }));
            });
        }
    }

    if (category == "weapons" || category == "weapon_attachments") {
        engine.call("on_show_customization_screen_weapon", true);
    } else if (category == "music") {
        engine.call("on_show_customization_screen_song", true);
    } else {
        engine.call("on_show_customization_screen_eggbot", true);
    }
}

let customize_saved_page = {};
function customization_render_category_content(cont, type, data) {
    //console.log("render customization options", _dump(data));
    //console.log("own",_dump(global_self.data));

    if (type[0] == "sticker") {
        // show sticker tools
        _id("customize_screen_stickers").style.display = "flex";
    } else {
        // hide sticker tools
        _id("customize_screen_stickers").style.display = "none";
        // disable active sticker tools
        customize_set_tool("none");
    }

    cleanup_floating_containers();

    for (let key of Object.keys(customize_saved_page)) {
        customize_saved_page[key].style.display = "none";
    }

    if (customize_saved_page[type[0]+"_"+type[1]]) {
        customize_saved_page[type[0]+"_"+type[1]].style.display = "flex";

        refreshScrollbar(cont.parentElement);
        resetScrollbar(cont.parentElement);
        return;
    }
    
    //let fragment = new DocumentFragment();
    let fragment = _createElement("div","customization_type_items");
    fragment.appendChild(_createElement("div", "separator"));

    // Default disable button
    let disable = _createElement("div", ["customization_item", "disable"]);
    disable.addEventListener("click", customization_on_select);
    disable.dataset.id = -1;
    _addButtonSounds(disable, 1);

    // Sort the items
    _sort_objects_by_key(data, "rarity", "desc");

    if (type[0] == "flag") {
        if (!global_self.data.data.country) disable.classList.add("selected");
        fragment.appendChild(disable);
        data = GLOBAL_AVAILABLE_COUNTRY_FLAGS;
    }
    if (type[0] == "avatar") {
        if (!global_self.data.data.avatar) disable.classList.add("selected");
        fragment.appendChild(disable);
    }

    if (data) {
        for (let c of data) {
            let item = _createElement("div", "customization_item");
            item.addEventListener("click", customization_on_select);
            _addButtonSounds(item, 1);

            // FLAGS 
            if (type[0] == "flag") {
                if (c == global_self.data.data.country) { item.classList.add("selected"); }

                item.classList.add("flag");
                item.classList.add("rarity_bg_0");
                item.dataset.id = c;

                let inner = _createElement("div", "country_flag");
                inner.style.backgroundImage = "url("+_flagUrl(c)+")";
                item.appendChild(inner);

                item.dataset.msg = localize_country(c);
                add_tooltip2_listeners(item);
            } else {
                item.dataset.msgHtmlId = "customization_item";
                item.dataset.id = c.customization_id;
                item.dataset.type = c.customization_type;
                item.dataset.rarity = c.rarity;
                add_tooltip2_listeners(item);

                item.classList.add(type[0]);
                item.classList.add("rarity_bg_"+c.rarity);

                item.appendChild(renderCustomizationInner(type[0], c.customization_id));
            }

            // AVATARS
            if (type[0] == "avatar" && c.customization_id == global_self.data.data.avatar) item.classList.add("selected");

            fragment.appendChild(item);
        }    
    }

    fragment.appendChild(_createElement("div", "separator"));

    cont.appendChild(fragment);

    customize_saved_page[type[0]+"_"+type[1]] = fragment;

    refreshScrollbar(cont.parentElement);
    resetScrollbar(cont.parentElement);
}

function customization_on_select(e) {
    if (!global_customization_active_sub_category) return;
    
    let prev = e.currentTarget.parentElement.querySelector(".selected");

    console.log("customization_on_select",global_customization_active_category, global_customization_active_sub_category);
    // Flags
    if (global_customization_active_sub_category[0] == "flag") {
        if (prev) prev.classList.remove("selected");
        e.currentTarget.classList.add("selected");
        send_string("set-customization:"+global_customization_type_id_map["flag"]+"::"+e.currentTarget.dataset.id);
        clear_profile_data_cache_id(global_self.data.user_id);
    }
    // Avatars
    if (global_customization_active_sub_category[0] == "avatar") {
        if (prev) prev.classList.remove("selected");
        e.currentTarget.classList.add("selected");
        send_string("set-customization:"+global_customization_type_id_map["avatar"]+"::"+e.currentTarget.dataset.id);
        clear_profile_data_cache_id(global_self.data.user_id);
    }
    // Stickers
    if (global_customization_active_sub_category[0] == "sticker") {
        if (e.currentTarget.classList.contains("selected")) {
            customize_set_tool("none", e.currentTarget);
            e.currentTarget.classList.remove("selected");
            global_customize_selected_decal = undefined;
        } else {
            if (prev) prev.classList.remove("selected");
            customize_set_tool("add_decal", e.currentTarget);
            e.currentTarget.classList.add("selected");
        }
    }
}

function customize_clear_stickers() {
    genericModal(localize("customize_remove_all_stickers"), localize("customize_remove_all_stickers_question"), localize("menu_button_cancel"), null, localize("menu_button_confirm"), function() {
        engine.call("set_string_variable", "game_decals", "");
    });
}


function customize_set_sticker_tool_select(element) {
    if (element.classList.contains("tool_selected")) {
        customize_set_tool("none", element);
        if (global_customize_selected_decal) {
            customize_set_tool("add_decal", global_customize_selected_decal);
        }
    } else {
        customize_set_tool("select", element);
    }
}

let global_customize_tool = "";
var global_customize_selected_decal = undefined;

function customize_set_tool(tool, element) {
    // tool:
    //  "select"
    //  "add_decal"
    //  "add_shell" <- probably not functional/not used atm
    //  "none" disable everything

    engine.call("set_tool", tool);
    global_customize_tool = tool;

    _for_each_with_class_in_parent(_id("customize_screen"), "tool_selected", function(el) {
        el.classList.remove("tool_selected");
    });

    engine.call("set_string_variable", "ui_current_decal", "");

    if (tool == "add_decal") {
        engine.call("set_string_variable", "ui_current_decal", "" + element.dataset.id);

        if (element) global_customize_selected_decal = element;

        // Show the useage box
        anim_show(_id("add_decal_shortcuts"));
    } else {
        // Hide the useage box
        anim_hide(_id("add_decal_shortcuts"));
    }

    if (tool == "select") {
        // Show the useage box
        anim_show(_id("select_shortcuts"));
        _id("select_tool_icon").classList.add("tool_selected");
    } else {
        // Hide the useage box
        anim_hide(_id("select_shortcuts"));
    }

    if (tool == "add_shell") {}
    
    engine.call("update_character_preview");
}