let global_default_powerup_music = 'mu_pu_devilish';
let global_default_spray = 'sp_smileyblue';

let global_customization_preview_area = undefined;
let global_customization_active_category = undefined;
let global_customization_active_ctype = undefined;
let global_customization_selected = undefined;
let global_customization_selected_attachment = {
    "stattracker": "disabled",
    "attachment": "",
};

let global_customization_data = [];
let global_customization_data_map = {};

let customize_saved_page = {};

class CustomizationType {
    /**
     * @param {String} type main type name like "avatar", "country", "sticker" etc.
     * @param {String} sub_type sub type name, can be empty
     */
    constructor(type, sub_type) {
        this.type = type;
        this.sub_type = sub_type;
        this.page_id = type+"_"+sub_type;

        if (this.type in global_customization_type_id_map) {
            this.type_id = global_customization_type_id_map[this.type];
            this.type_i18n = global_customization_type_map[global_customization_type_id_map[this.type]].i18n;
        } else {
            this.type_id = '';
            this.type_i18n = "unknown";
        }
    }
}

let global_customization_options_map = {
    "profile": [
        new CustomizationType("avatar", ""),
        new CustomizationType("country", ""),
    ],
    "character": [
        new CustomizationType("shell", ""),
        new CustomizationType("shoes", ""),
    ],
    "sticker": [
        //new CustomizationType("sticker", ""),
        new CustomizationType("sticker", "eyes"),
        new CustomizationType("sticker", "mouths"),
        new CustomizationType("sticker", "acces"),
        new CustomizationType("sticker", "misc"),
        new CustomizationType("sticker", "logos"),
    ],
    "music": [
        new CustomizationType("music", "pu"),
        //new CustomizationType("music", "menu"),
    ],
    "emote": [
        new CustomizationType("emote", "greeting"),
        new CustomizationType("emote", "taunt"),
    ],
    "spray": [
        new CustomizationType("spray", ""),
    ],
    "weapon": [
        //new CustomizationType("weapon", "melee"),
        // weapon options are added dynamically
    ],
    "weapon_attachment": [
        //new CustomizationType("weapon_attachment", "melee"),
        // weapon options are added dynamically
    ],
};

// customization types that need to be confirmed when selecting
let global_customization_confirm_types = {
    "weapon": true,
    "weapon_attachment": true,
    "shell": true,
    "shoes": true,
};
let global_customization_disable_types = {
    "avatar": true,
    "weapon": true,
    "shell": true,
    "shoes": true,
};
let global_customization_audio_types = {
    "music": true,
};

function init_screen_customize() {
    
    // Create weapon and weapon attachment ctypes
    for (let type of ["weapon", "weapon_attachment"]) {
        for (let wid of global_weapons_with_skins) {

            // TEMPORARILY HIDE MELEE because its entirely white and offscreen
            if (wid == 0) continue;

            let ctype = new CustomizationType(
                type,  
                global_weapon_idx_name_map2[wid].substring(6)
            );
            global_customization_options_map[type].push(ctype);
        }
    }

    // When the user changes a customization the MS sends back an updated client template object with all the currently set customizations
    // type_id and sub_type are for the customization that has been changed
    bind_event('set_client_info', function(type_id, sub_type, json_data) {
        if (type_id == -1) return;
        if (!(type_id in global_customization_type_map)) return;

        try {
            let data = JSON.parse(json_data);
            let type_name = global_customization_type_map[type_id].name;

            if (sub_type !== "no_sub_type" && typeof data.customizations[type_name] == "object") {
                if (sub_type in data.customizations[type_name]) {
                    customization_set_validated({
                        "type": type_id,
                        "sub_type": sub_type,
                        "id": data.customizations[type_name][sub_type],
                    });
                }
            } else {
                customization_set_validated({
                    "type": type_id,
                    "sub_type": "",
                    "id": data.customizations[type_name],
                });
            }
        } catch(e) {
            console.log("ERROR parsing client info json");
        }
    });
    
    global_customization_preview_area = _id("customize_model_preview_area");
    // Mwheel view zoom on character
    global_customization_preview_area.addEventListener("wheel", function(e) {
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

    global_customization_preview_area.addEventListener("mousedown", function(e) {
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

    global_customization_preview_area.addEventListener("mousemove", function(e) {
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

    global_customization_preview_area.addEventListener("mouseenter", function(e) {
        engine.call("skins_eggbot_hovered", true);
    });
    global_customization_preview_area.addEventListener("mouseleave", function(e) {
        engine.call("skins_eggbot_hovered", false);
    });

    global_customization_preview_area.addEventListener("click", function(e) {
        if (e.button == 0) {
            engine.call("decal_click", e.clientX, e.clientY);
        }
    });

    // Set the initial view to eggbot screen
    engine.call("on_show_customization_screen_eggbot");
}

function load_user_info(cb) {
    api_request("GET", "/user", {}, function(data) {
        global_user_info = data && data.user ? data : undefined;
        if (cb) cb(global_user_info);
    });
}

/**
 * Loads all available user customizations from the API and pre-renders the customization category lists
 * @param {Function} cb callback function, can be null
 */
function load_user_customizations(cb) {
    api_request("GET", "/user/customization", {}, function(data) {
        // Add user customizations
        if (data) global_customization_data = unflattenCustomizations(data["customization"]);

        global_customization_data_map = {};
        let type_options = {};
        for (let c of global_customization_data) {
            global_customization_data_map[c.customization_id] = c;

            // Gather the customization types to update the options
            if (!(c.customization_type in type_options)) type_options[c.customization_type] = {};
            type_options[c.customization_type][c.customization_sub_type] = true;
        }
        update_customization_options(type_options);

        customization_pre_render_categories(true);

        if (typeof cb === "function") cb();
    });
}

function unflattenCustomizations(data) {
    if (!data || data.length <= 1) return [];

    let customizations = [];

    let i=0;
    let y=0;
    let properties = data[0].length;

    for (i=1; i<data.length; i++) {
        let tmp = {};
        for (y=0; y<properties; y++) {
            tmp[data[0][y]] = data[i][y];
        }
        customizations.push(tmp);
    }

    return customizations;
}

/**
 * Updates the global_customization_options_map with the MS received customization type options
 */
function update_customization_options(type_options) {
    for (let type_id in type_options) {
        if (!(type_id in global_customization_type_map)) continue;
        let type_name = global_customization_type_map[type_id].name;
        let type_group = global_customization_type_map[type_id].group;

        // Create the category group entry if it doesn't exist yet
        if (!(type_group in global_customization_options_map)) global_customization_options_map[type_group] = [];

        for (let sub_type in type_options[type_id]) {
            if (!global_customization_options_map[type_group].length) {
                global_customization_options_map[type_group].push(new CustomizationType(type_name, sub_type));
            } else {
                let found = false;
                for (let ctype of global_customization_options_map[type_group]) {
                    if (ctype.type == type_name && ctype.sub_type == sub_type) {
                        found = true;
                        break;
                    }
                }
                if (!found) global_customization_options_map[type_group].push(new CustomizationType(type_name, sub_type));
            }

        }
    }
}

/**
 * Adds new customizations to the locally cached list, e.g. after purchasing a new item
 * @param {Object} customizations customization object
 */
function add_user_customizations(customizations) {
    let type_options = {};
    for (let c of customizations) {
        // Skip currency rewards
        if (c.customization_type in global_customization_type_map && global_customization_type_map[c.customization_type].name == "currency") continue;

        // Skip any customizations that we should already have
        if (c.customization_id in global_customization_data_map) continue;

        global_customization_data.push(c);
        global_customization_data_map[c.customization_id] = c;

        // Gather the customization types to update the options
        if (!(c.customization_type in type_options)) type_options[c.customization_type] = {};
        type_options[c.customization_type][c.customization_sub_type] = true;
    }

    update_customization_options(type_options);

    // Re-render the categories that have new items
    for (let type_id in type_options) {
        if (!(type_id in global_customization_type_map)) continue;

        let type_name = global_customization_type_map[type_id].name;
        for (let sub_type in type_options[type_id]) {
            for (let saved in customize_saved_page) {
                if (saved == type_name+"_"+sub_type) {
                    _remove_node(customize_saved_page[saved]);
                    delete customize_saved_page[saved];
                }
            }
        }
    }

    customization_pre_render_categories(false);
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
                "seen": true,
            });
        }
    }
    return data;
}

let global_set_stickers_from_server = true;
/**
 * Sets client customizations coming from the MS
 * @param {Object} data MS client data object
 * @param {Boolean} init if its the first time being called or not after connecting to the MS
 */
function set_customize_data(data) {

    // Set Character Stickers
    global_set_stickers_from_server = true;
    if (data.customizations && data.customizations.sticker) update_variable("string", "game_decals", data.customizations.sticker);
    else update_variable("string", "game_decals", "");
    global_set_stickers_from_server = false;

}

// Create all the customization item lists and cache them
function customization_pre_render_categories(clear) {
    let content = _id("customization_window_content_inner");
    if (clear) {
        _empty(content);
        customize_saved_page = {};
    }
    for (let category in global_customization_options_map) {
        for (let ctype of global_customization_options_map[category]) {
            customization_render_category_content(content, ctype);
        }
    }
}

/**
 * On category menu button click callback, open a specific customization category
 * @param {HTMLElement} btn clicked on button
 * @param {String} category Customization page category
 * @param {CustomizationType} ctype
 */
function customization_load_category(btn, category, ctype) {
    if (btn) {
        let prev = btn.parentElement.querySelector(".selected");
        if (prev) prev.classList.remove("selected");
        btn.classList.add("selected");
    }

    customization_render_category(category, ctype);
    customization_show_category(category, global_customization_active_ctype);

    let customization_content = _id("customize_content");
    if (customization_content) customization_content.style.display = "flex";
}

/**
 * Render a customization category and its option menu
 * @param {String} category Customization page category
 * @param {CustomizationType} selected_ctype
 */
function customization_render_category(category, selected_ctype) {
    //console.log("customization_render_category", category, _dump(selected_ctype));

    if (!(category in global_customization_options_map)) return;

    let ctypes = global_customization_options_map[category];
    if (selected_ctype) {
        global_customization_active_ctype = selected_ctype;
    } else if (ctypes.length) {
        global_customization_active_ctype = ctypes[0];
    }

    let group = '';
    if (global_customization_active_ctype.type in global_customization_type_id_map) {
        if (global_customization_type_id_map[global_customization_active_ctype.type] in global_customization_type_map) {
            group = global_customization_type_map[global_customization_type_id_map[global_customization_active_ctype.type]].group;
        }
    }

    let cont = _id("customize_content");

    let menu = cont.querySelector(".menu");
    let bottom = _id("customization_bottom");
    let bottom_color = _id("customization_bottom_color");
    let bottom_equip = _id("customization_bottom_equip");
    let bottom_music = _id("customization_bottom_music");
    
    let show_bottom = false;

    if (category == "character" || category == "sticker") {
        bottom_color.style.display = "flex";
        show_bottom = true;
    } else {
        bottom_color.style.display = "none";
    }

    if (global_customization_active_ctype.type in global_customization_confirm_types && global_customization_confirm_types[global_customization_active_ctype.type]) {
        bottom_equip.style.display = "flex";
        show_bottom = true;
    } else {
        bottom_equip.style.display = "none";
    }

    if (global_customization_active_ctype.type in global_customization_audio_types && global_customization_audio_types[global_customization_active_ctype.type]) {
        bottom_music.style.display = "flex";
        show_bottom = true;
    } else {
        bottom_music.style.display = "none";
    }

    if (show_bottom) bottom.style.display = "flex";
    else bottom.style.display = "none";

    // hide sticker tools
    _id("customize_screen_stickers").style.display = "none";
    // disable active sticker tools
    customize_set_tool("none");

    _empty(menu);

    for (let ctype of ctypes) {
        let option = _createElement("div","option");

        if (category == "weapon" || category == "weapon_attachment") {

            if (ctype.sub_type.length == 0) continue;
            
            if ("weapon"+ctype.sub_type in global_item_name_map) {
                let w_data = global_item_name_map["weapon"+ctype.sub_type];
                option.style.backgroundImage = "url("+w_data[2]+")";
                option.classList.add("weapon");
    
                // Tooltip
                option.dataset.msgId = w_data[1];
                add_tooltip2_listeners(option);
            }

        } else if (category == "sticker") {
            if (ctype.sub_type.length) {
                let tooltip = false;
                if (ctype.sub_type == "eyes") {
                    option.style.backgroundImage = "url(../resources/asset_thumbnails/textures_customization_st_circular_unfazed_eye.png.dds)";
                    tooltip = true;
                } else if (ctype.sub_type == "mouths") {
                    option.style.backgroundImage = "url(../resources/asset_thumbnails/textures_customization_st_tasty_mouth.png.dds)";
                    tooltip = true;
                } else if (ctype.sub_type == "acces") { 
                    option.style.backgroundImage = "url(../resources/asset_thumbnails/textures_customization_st_heart_pink_bow.png.dds)";
                    tooltip = true;
                } else if (ctype.sub_type == "misc") {
                    option.textContent = localize("customize_"+ctype.page_id);
                } else if (ctype.sub_type == "logos") {
                    option.textContent = localize("customize_"+ctype.page_id);
                }

                // Tooltip
                if (tooltip) {
                    option.dataset.msgId = "customize_"+ctype.page_id;
                    add_tooltip2_listeners(option);
                }
            } else {
                option.textContent = localize("customize_"+ctype.type);
            }
        } else {
            if (ctype.sub_type.length) {
                option.textContent = localize("customize_"+ctype.page_id);
            } else {
                option.textContent = localize("customize_"+ctype.type);
            }
        }

        // Initial selection
        if (selected_ctype) {
            if (selected_ctype.type == ctype.type && selected_ctype.sub_type == ctype.sub_type) {
                option.classList.add("active");
                global_customization_active_ctype = ctype;
            }
        } else if (ctypes[0].type == ctype.type && ctypes[0].sub_type == ctype.sub_type) {
            option.classList.add("active");
            global_customization_active_ctype = ctype;
        }
        _addButtonSounds(option, 1);
        menu.appendChild(option);

        option.addEventListener("click", function() { on_option_selected(option, ctype); });
    }

    function on_option_selected(option, ctype) {
        let prev = menu.querySelector(".active");
        if (prev) prev.classList.remove("active");
        option.classList.add("active");
        global_customization_active_ctype = ctype;
        customization_show_category(category, ctype);
    }
}

/**
 * Make selected customization category content visible
 * @param {String} category Customization page category
 * @param {CustomizationType} ctype 
 */
function customization_show_category(category, ctype) {
    //console.log("customization_show_category", category, _dump(ctype));
    historyPushState({"page": "customize_screen", "category": category, "type": ctype});
    global_customization_active_category = category;

    // Reset character selections
    reset_customization_previews();

    // Stop any audio previews
    customize_pause_selected_music();

    let cont = _id("customization_window_content_inner");

    if (global_customization_confirm_types[ctype.type]) {
        // Set equip button inactive
        _id("customization_equip_button").classList.remove("active");
    }

    let current_customization_id = get_current_customization(ctype);
    let current_customization = {};
    if (category == "weapon_attachment") {
        global_customization_selected_attachment = get_current_customization_attachments(ctype.sub_type);
        if (global_customization_selected_attachment.attachment in global_customization_data_map) current_customization = global_customization_data_map[global_customization_selected_attachment.attachment];
        current_customization_id = create_attachment_customization_string(global_customization_selected_attachment);
    } else {
        if (current_customization_id in global_customization_data_map) current_customization = global_customization_data_map[current_customization_id];
    }

    if (ctype.type == "sticker") {
        // Since this is the editor we don't actually want to show a big preview of the sticker but the eggbot to place the sticker on
        engine.call("on_show_customization_screen", true);
        engine.call("on_show_customization_screen_eggbot");

        _empty(global_customization_preview_area);
        _id("customize_screen_stickers").style.display = "flex";
        set_blur(false);
    } else {
        // Show big 2D or 3D Preview
        show_customization_preview_scene("customize", ctype, current_customization_id, current_customization, global_customization_preview_area);

        _id("customize_screen_stickers").style.display = "none";
        customize_set_tool("none");
    }


    cleanup_floating_containers();

    if (!customize_saved_page[ctype.page_id]) {
        customization_render_category_content(cont, ctype);
    }

    // Reset the item selection for types that require confirmation
    if (global_customization_confirm_types[ctype.type] || ctype.type == "sticker") {
        if (ctype.type == "weapon_attachment") {
            reset_customization_category_stattracker_selection(customize_saved_page[ctype.page_id], global_customization_selected_attachment.stattracker);
            reset_customization_category_selection(customize_saved_page[ctype.page_id], global_customization_selected_attachment.attachment);
        } else {
            reset_customization_category_selection(customize_saved_page[ctype.page_id], current_customization_id);
        }
    }

    for (let key of Object.keys(customize_saved_page)) {
        customize_saved_page[key].style.display = "none";
    }

    if (customize_saved_page[ctype.page_id]) {
        // load images        
        _load_lazy_all(customize_saved_page[ctype.page_id]);
        
        customize_saved_page[ctype.page_id].style.display = "flex";

        refreshScrollbar(cont.parentElement);
        resetScrollbar(cont.parentElement);
        return;
    }
}

/**
 * For customization types that require an extra "equip" action this function resets the element highlighting back to the currently set value
 * @param {HTMLElement} content container for the customization item elements
 * @param {String} current_customization_id the currently set customization id
 */
function reset_customization_category_selection(content, current_customization_id) {
    if (content && content.children.length) {
        for (let i=0; i<content.children.length; i++) {
            if (!content.children[i].classList.contains("customization_item")) continue;

            if (content.children[i].classList.contains("selected"))         content.children[i].classList.remove("selected");
            if (content.children[i].classList.contains("active"))           content.children[i].classList.remove("active");
            if (content.children[i].dataset.id == current_customization_id) content.children[i].classList.add("selected");
        }
    }
}

/**
 * Reset the character 3d previews from the on_show_customization_screen_eggbot view back to the actual selection
 */
function reset_customization_previews() {
    // Shell
    let current_shell = get_current_customization(new CustomizationType("shell", ""));
    engine.call("set_preview_shell", current_shell);
    reset_customization_category_selection(customize_saved_page["shell_"], current_shell);

    // Shoes
    let current_shoes = get_current_customization(new CustomizationType("shoes", ""));
    engine.call("set_preview_shoes", current_shoes);
    reset_customization_category_selection(customize_saved_page["shoes_"], current_shoes);
}

/**
 * Resets the stat tracker select list back to the currently set value
 * @param {HTMLElement} content container for the customization item elements
 * @param {String} current_stattracker_value the currently set customization value for the stat tracker
 */
function reset_customization_category_stattracker_selection(content, current_stattracker_value) {
    let select = content.querySelector(".stat_tracker_cont .select-field");
    if (select) {
        select.dataset.value = current_stattracker_value;
        update_select(select);
    }
}

/**
 * Retrieves the list of customizations by type and sub_type, ordered by descending rarity
 * @param {CustomizationType} ctype 
 * @param {Boolean} match_empty_sub_group Whether to include customization items with empty sub_types in the result or not (e.g. attachments that can be applied to all weapons)
 */
function get_customization_category_content_data(ctype, match_empty_sub_group) {
    let data = global_customization_data.filter(function(c) {
        if (c.customization_type == global_customization_type_id_map[ctype.type]) {
            if (ctype.sub_type.length) {
                if (ctype.sub_type == c.customization_sub_type || (c.customization_sub_type.length == 0 && match_empty_sub_group === true)) return true;
            } else {
                return true;  
            }
        }
        return false;
    });

    data.sort(customization_sort_func);

    return data;
}
function customization_sort_func(a, b) {
    if (a.rarity > b.rarity) return -1;
    else if (a.rarity < b.rarity) return 1;
    else return a.customization_id.localeCompare(b.customization_id);
}

/**
 * Renders the customization category content/list into the container div if it wasn't already
 * @param {HTMLElement} cont container div
 * @param {CustomizationType} ctype
 */
function customization_render_category_content(cont, ctype) {

    // Check if this category was already rendered
    if (customize_saved_page[ctype.page_id]) return;

    let get_empty_sub_group = false;
    if (ctype.type == "weapon_attachment") get_empty_sub_group = true;
    let data = get_customization_category_content_data(ctype, get_empty_sub_group);
    
    let fragment = _createElement("div",["customization_type_items", ctype.type]);
    fragment.appendChild(_createElement("div", "separator"));

    // Default disable button
    let disable = _createElement("div", ["customization_item", "disable"]);
    disable.addEventListener("click", customization_on_select);
    disable.dataset.id = "";
    _addButtonSounds(disable, 1);

    let option_count = 0;
    let default_sel = "";

    if (ctype.type == "country") {
        if (!global_self.data.customizations.country) disable.classList.add("selected");
        fragment.appendChild(disable);
        data = GLOBAL_AVAILABLE_COUNTRY_FLAGS;
        option_count++;
    } else if (ctype.type == "weapon_attachment") {
        let stat_tracker = false;
        if (data && data.length) {
            for (let c of data) {
                if (c.customization_id.endsWith("_stattracker")) {
                    stat_tracker = true;
                    break;
                }
            }
        }

        let selected = get_current_customization_attachments(ctype.sub_type);
        if (stat_tracker) {
            let stat_tracker_cont = _createElement("div", "stat_tracker_cont");
            stat_tracker_cont.appendChild(_createElement("div", "label", localize("customization_type_stattracker")));

            let stat_tracker_select = _createElement("div", "select-field");
            stat_tracker_select.dataset.theme = "customize";
            stat_tracker_cont.appendChild(stat_tracker_select);
            
            for (let stat of ["disabled",  "frags", "dmg_done"]) {
                let short = stat;
                if (stat == "frags") short = GLOBAL_ABBR.STATS_KEY_FRAGS;
                if (stat == "dmg_done") short = GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED;

                let opt = _createElement("div");
                if (stat == "disabled") {
                    opt.dataset.value = stat;
                    opt.textContent = localize(stat);
                    if (selected.stattracker == "disabled") opt.dataset.selected = 1;
                } else {
                    opt.dataset.value = short;
                    opt.textContent = localize("stats_"+stat);
                    if (selected.stattracker == short) opt.dataset.selected = 1;
                }

                stat_tracker_select.appendChild(opt);
            }

            ui_setup_select(stat_tracker_select, stattracker_on_select);

            fragment.appendChild(stat_tracker_cont);
        }

        if (selected.attachment == "") disable.classList.add("selected"); 
        fragment.appendChild(disable);
        option_count++;

    } else if (ctype.type == "music" && ctype.sub_type == "pu") {

        // Default music selection if none is selected
        if ("music" in global_self.data.customizations && "pu" in global_self.data.customizations.music) default_sel = global_self.data.customizations.music.pu;
        if (default_sel.trim().length == 0) default_sel = global_default_powerup_music;

    } else if (ctype.type == "spray") {

        if ("spray" in global_self.data.customizations) default_sel = global_self.data.customizations.spray;
        if (default_sel.trim().length == 0) default_sel = global_default_spray;

    } else if (ctype.type in global_customization_disable_types && global_customization_disable_types[ctype.type]) {

        let customization = get_current_customization(ctype);
        if (!customization || customization.trim().length == 0) disable.classList.add("selected");
        fragment.appendChild(disable);
        option_count++;

    }

    /*
    if (ctype.type == "avatar") {
        if (!global_self.data.customizations.avatar) disable.classList.add("selected");
        fragment.appendChild(disable);
        option_count++;
    }
    if (ctype.type == "shell") {
        if (!global_self.data.customizations.shell) disable.classList.add("selected");
        fragment.appendChild(disable);
        option_count++;
    }
    if (ctype.type == "shoes") {
        if (!global_self.data.customizations.shoes) disable.classList.add("selected");
        fragment.appendChild(disable);
        option_count++;
    }
    if (ctype.type == "weapon") {
        if (current_customization == "") disable.classList.add("selected"); 
        fragment.appendChild(disable);
        option_count++;
    }
    */

    if (data && data.length) {
        let duplicate_tracker = {};
        for (let c of data) {

            let item = _createElement("div", "customization_item");
            item.addEventListener("click", customization_on_select);
            _addButtonSounds(item, 1);

            // FLAGS 
            if (ctype.type == "country") {
                if (c == global_self.data.customizations.country) { item.classList.add("selected"); }

                item.classList.add("flag");
                item.classList.add("rarity_bg_0");
                item.dataset.id = c;

                let inner = _createElement("div", "country_flag");
                inner.style.backgroundImage = "url("+_flagUrl(c)+")";
                item.appendChild(inner);

                item.dataset.msg = localize_country(c);
                add_tooltip2_listeners(item);
            } else {
                if (ctype.type == "weapon_attachment" && c.customization_id.endsWith("_stattracker")) continue;
                if (c.customization_id in duplicate_tracker) continue;
                duplicate_tracker[c.customization_id] = true;
                
                if (!("seen" in c) || c.seen == false) {
                    let new_div = _createElement("div", "new", "!");
                    item.appendChild(new_div);
                    item.dataset.new = 1;
                }

                item.dataset.msgHtmlId = "customization_item";
                item.dataset.id = c.customization_id;
                item.dataset.type = c.customization_type;
                item.dataset.rarity = c.rarity;
                add_tooltip2_listeners(item);

                item.classList.add(ctype.type);
                item.classList.add("rarity_bg_"+c.rarity);

                item.appendChild(renderCustomizationInner(c.customization_type, c.customization_id, true));
            }

            // Add selected class for types that don't require an equip confirmation
            if (ctype.type == "avatar" && c.customization_id == global_self.data.customizations.avatar) item.classList.add("selected");
            if (ctype.type == "music" && ctype.sub_type == "pu" && c.customization_id == default_sel) item.classList.add("selected");
            if (ctype.type == "spray" && c.customization_id == default_sel) item.classList.add("selected");

            fragment.appendChild(item);
            option_count++;
        }    
    }

    if (option_count == 0) {
        // Show no customization options available
        let no_options = _createElement("div", "no_options", localize("customization_no_options_avail"));
        fragment.appendChild(no_options);
    }

    fragment.appendChild(_createElement("div", "separator"));

    cont.appendChild(fragment);

    customize_saved_page[ctype.page_id] = fragment;

    refreshScrollbar(cont.parentElement);
    resetScrollbar(cont.parentElement);
}

/**
 * On stat tracker select list selection callback function
 * @param {HTMLElement} opt 
 * @param {HTMLElement} field 
 */
function stattracker_on_select(opt, field) {
    global_customization_selected_attachment.stattracker = field.dataset.value;
    let current_customization = {};
    if (global_customization_selected_attachment.attachment in global_customization_data_map) current_customization = global_customization_data_map[global_customization_selected_attachment.attachment];
    let current_customization_id = create_attachment_customization_string(global_customization_selected_attachment);

    show_customization_preview_scene("customize", global_customization_active_ctype, current_customization_id, current_customization, global_customization_preview_area);

    set_customization_equip_btn_state(global_customization_active_ctype);
}

/**
 * On item selection callback function
 * @param {Object} e click event object from clicking on the customization_item element
 */
function customization_on_select(e) {
    if (!global_customization_active_ctype) return;
    
    let prev = e.currentTarget.parentElement.querySelector(".selected");
    let prev_active = e.currentTarget.parentElement.querySelector(".active");


    let current_customization_id = e.currentTarget.dataset.id;
    let current_customization = {};
    if (global_customization_active_ctype.type == "weapon_attachment") {
        global_customization_selected_attachment.attachment = e.currentTarget.dataset.id;
        if (global_customization_selected_attachment.attachment in global_customization_data_map) current_customization = global_customization_data_map[global_customization_selected_attachment.attachment];
        current_customization_id = create_attachment_customization_string(global_customization_selected_attachment);
    } else {
        if (current_customization_id in global_customization_data_map) current_customization = global_customization_data_map[current_customization_id];
    }

    if (global_customization_active_ctype.type == "sticker") {
        // Since this is the editor we don't actually want to show a big preview of the sticker but the eggbot to place the sticker on
        engine.call("on_show_customization_screen", true);
        engine.call("on_show_customization_screen_eggbot");
    } else {
        // Show big 2D or 3D Preview
        show_customization_preview_scene("customize", global_customization_active_ctype, current_customization_id, current_customization, global_customization_preview_area);
    }

    // Flag
    if (global_customization_active_ctype.type == "country") {
        if (prev) prev.classList.remove("selected");
        e.currentTarget.classList.add("selected");
        send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map["country"]+"::"+e.currentTarget.dataset.id);
        clear_profile_data_cache_id(global_self.data.user_id);
    }

    // Avatar
    if (global_customization_active_ctype.type == "avatar") {
        if (prev) prev.classList.remove("selected");
        e.currentTarget.classList.add("selected");
        send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map["avatar"]+"::"+e.currentTarget.dataset.id);
        clear_profile_data_cache_id(global_self.data.user_id);
    }

    // Sticker
    if (global_customization_active_ctype.type == "sticker") {
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

    // Music
    if (global_customization_active_ctype.type == "music") {
        if (prev) prev.classList.remove("selected");
        e.currentTarget.classList.add("selected");
        send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map["music"]+":"+global_customization_active_ctype.sub_type+":"+e.currentTarget.dataset.id);
    }

    // Spray
    if (global_customization_active_ctype.type == "spray") {
        if (prev) prev.classList.remove("selected");
        e.currentTarget.classList.add("selected");
        send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map["spray"]+"::"+e.currentTarget.dataset.id);
    }

    // Hide / Show the equip button if the current item type needs confirmation
    if (global_customization_confirm_types[global_customization_active_ctype.type]) {

        global_customization_selected = e.currentTarget;

        if (prev_active) prev_active.classList.remove("active");
        if (!e.currentTarget.classList.contains("selected")) e.currentTarget.classList.add("active");

        set_customization_equip_btn_state(global_customization_active_ctype);
    }

    // Reset the "seen" item state on selection
    if ("new" in e.currentTarget.dataset && e.currentTarget.dataset.new == "1") {
        api_request("POST", "/user/customization/"+e.currentTarget.dataset.id+"/seen");
        global_customization_data_map[e.currentTarget.dataset.id].seen = true;

        let new_div = e.currentTarget.querySelector(".new");
        if (new_div) _remove_node(new_div);
    }
}

/**
 * Updates the equip button state
 * @param {CustomizationType} ctype
 */
function set_customization_equip_btn_state(ctype) {
    if (ctype.type == "weapon_attachment") {
        let current_item = get_current_customization_attachments(ctype.sub_type);
        if (current_item.attachment == global_customization_selected_attachment.attachment && current_item.stattracker == global_customization_selected_attachment.stattracker) {
            _id("customization_equip_button").classList.remove("active");
        } else {
            _id("customization_equip_button").classList.add("active");
        }
    } else {
        let current_item = get_current_customization(ctype);
        if (global_customization_selected.dataset.id == current_item) {
            _id("customization_equip_button").classList.remove("active");
        } else {
            _id("customization_equip_button").classList.add("active");
        }
    }
}

/**
 * Get currently set customization by type and subtype
 * @param {CustomizationType} ctype
 */
function get_current_customization(ctype) {

    let ret = "";
    if (global_self.data && ctype.type in global_self.data.customizations) {
        if (ctype.sub_type && typeof global_self.data.customizations[ctype.type] == "object") {
            if (ctype.sub_type in global_self.data.customizations[ctype.type]) ret = global_self.data.customizations[ctype.type][ctype.sub_type]
        } else {
            if (ctype.type in global_self.data.customizations) ret = global_self.data.customizations[ctype.type];
        }
    }

    if (!ret || ret.trim().length == 0) {
        if (ctype.type == "music" && ctype.sub_type == "pu") {
            return global_default_powerup_music;
        } else if (ctype.type == "spray") {
            return global_default_spray;
        }
    }

    return ret;
}

/**
 * Get the currently set attachment configuration for a weapon as an object with stattracker and attachment properties
 * @param {String} weapon rl, pncr, shaft etc.
 */
function get_current_customization_attachments(weapon) {
    let string = '';
    if (_check_nested(global_self, "data", "customizations", "weapon_attachment", weapon)) string = global_self.data.customizations.weapon_attachment[weapon];
    
    return get_customization_attachments(string);
}

/**
 * Formats the single line attachment string coming from the MS into an object with stattracker and attachment properties
 * @param {String} attachment_string 
 */
function get_customization_attachments(attachment_string) {
    // example weapon_attach_string:
    // "stat:damage!wa_shaft_bobblehead"

    let ret = {
        "stattracker": "disabled",
        "attachment": "",
    };
    let parts = attachment_string.split("!");
    for (let p of parts) {
        if (p.startsWith("stat:")) ret.stattracker = p.split(":")[1];
        else ret.attachment = p;
    }
    return ret;
}

/**
 * Creates the MS compatible attachment string from the attachment Object
 * @param {Object} data Attachment object with stattracker and attachment properties
 */
function create_attachment_customization_string(data) {
    let parts = [];
    if ("stattracker" in data && data.stattracker != "disabled") parts.push("stat:"+data.stattracker);
    if ("attachment" in data && data.attachment != "") parts.push(data.attachment);
    return parts.join("!");
}

/**
 * Sends the current customization selection to the MS for verification and storing
 */
function equip_customize_selection() {
    if (!global_customization_active_ctype) return;
    if (!global_customization_confirm_types[global_customization_active_ctype.type]) return;

    // send equip request to MS
    if (global_customization_active_ctype.type == "weapon_attachment") {
        let attachment_string = create_attachment_customization_string(global_customization_selected_attachment);
        send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map[global_customization_active_ctype.type]+":"+global_customization_active_ctype.sub_type+":"+attachment_string);
    } else {
        send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map[global_customization_active_ctype.type]+":"+global_customization_active_ctype.sub_type+":"+global_customization_selected.dataset.id);

        global_customization_selected.classList.remove("active");
        global_customization_selected.classList.add("selected");
        global_customization_selected = null;
    }

    // Set equip button inactive again
    _id("customization_equip_button").classList.remove("active");
}

/**
 * Updates the client customization setup
 * EDIT: doesn't update the customization setup anymore, just resets the ui selection now for customizations that need equip confirmation
 * @param {Object} customization customization with type, sub_type and id from the MS
 */
function customization_set_validated(customization) {
    if (!(customization.type in global_customization_type_map)) return;

    let type_name = global_customization_type_map[customization.type].name;

    let reset_selection = false;
    if (type_name in global_customization_confirm_types && global_customization_confirm_types[type_name]) reset_selection = true;

    let cache_key = type_name+"_"+customization.sub_type;
    if (reset_selection && cache_key in customize_saved_page) {
        if (type_name == "weapon_attachment") {
            reset_customization_category_selection(customize_saved_page[cache_key], get_customization_attachments(customization.id).attachment);
        } else {
            reset_customization_category_selection(customize_saved_page[cache_key], customization.id)
        }
    }
}

/**
 * Removes all stickers from your character
 */
function customize_clear_stickers() {
    genericModal(localize("customize_remove_all_stickers"), localize("customize_remove_all_stickers_question"), localize("menu_button_cancel"), null, localize("menu_button_confirm"), function() {
        engine.call("set_string_variable", "game_decals", "");
    });
}


function customize_set_sticker_tool_select(element) {
    if (element.classList.contains("tool_selected")) {
        customize_set_tool("none", element);
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

        // Show the usage box
        anim_show(_id("add_decal_shortcuts"));
    } else {
        // Hide the usage box
        anim_hide(_id("add_decal_shortcuts"));
    }

    if (tool == "select") {
        // Show the usage box
        anim_show(_id("select_shortcuts"));
        _id("select_tool_icon").classList.add("tool_selected");

        if (global_customize_selected_decal) {
            global_customize_selected_decal.classList.remove("selected");
            global_customize_selected_decal = undefined;
        }
    } else {
        // Hide the usage box
        anim_hide(_id("select_shortcuts"));
    }

    if (tool == "add_shell") {}
    
    engine.call("update_character_preview");
}

let customization_audio_playing = "";
function customize_play_selected_music() {
    // Pause in case another track is already playing
    customize_pause_selected_music();

    customization_audio_playing = get_current_customization(global_customization_active_ctype);
    //customization_audio_playing = "music_db_markie_bytemaster";
    engine.call("ui_sound_tracked", customization_audio_playing);
    engine.call("set_music_post_volume", 0);
}

function customize_pause_selected_music() {
    if (customization_audio_playing.length) engine.call("ui_stop_sound", customization_audio_playing);
    engine.call("set_music_post_volume", 1);
    customization_audio_playing = "";
}







/** ===============================================================
 * SHOW Customization Preview Scene / Image
 * @param {CustomizationType} ctype 
 * @param {String} id customization_id
 * @param {HTMLElement} cont reference of the div which receives html item previews (avatars, music image etc.) rather than 3d ones
 */
let global_customization_blur_active = false;
function show_customization_preview_scene(screen, ctype, id, customization, cont) {
    if (!ctype.type.length) return;

    //console.log("show_customization_preview_scene", screen, id, _dump(ctype));

    let show_desc = 0;
    if (screen == "customize") show_desc = 1;

    let show_name = true;

    let fragment = new DocumentFragment();
    
    if (ctype.type == "weapon") {

        // Show the background scene with the desired weapon
        engine.call("on_show_customization_screen", true);
        engine.call("on_show_customization_screen_weapon");
        engine.call("weapon_customization_select_weapon", ctype.sub_type);
        engine.call("set_preview_weapon_skin", ctype.sub_type, id);
        global_customization_blur_active = false;
    
    } else if (ctype.type == "weapon_attachment") {

        // Show the background scene with the desired weapon + active skin
        let active_skin_id = get_current_customization(new CustomizationType("weapon", ctype.sub_type));

        engine.call("on_show_customization_screen", true);
        engine.call("on_show_customization_screen_weapon");
        engine.call("weapon_customization_select_weapon", ctype.sub_type);
        engine.call("set_preview_weapon_skin", ctype.sub_type, active_skin_id);
        engine.call("set_preview_weapon_attachment", ctype.sub_type, id);
        global_customization_blur_active = false;

    } else if (ctype.type == "shell") {

        engine.call("on_show_customization_screen", true);
        engine.call("on_show_customization_screen_eggbot");
        engine.call("set_preview_shell", id);
        global_customization_blur_active = false;
    
    } else if (ctype.type == "shoes") {

        engine.call("on_show_customization_screen", true);
        engine.call("on_show_customization_screen_eggbot");
        engine.call("set_preview_shoes", id);
        global_customization_blur_active = false;
    
    } else if (ctype.type == "music") {
        
        engine.call("on_show_customization_screen", false);
        global_customization_blur_active = true;
    
    } else if (ctype.type == "sticker") {

        engine.call("on_show_customization_screen", true);
        global_customization_blur_active = true;

    } else if (ctype.type == "avatar") {

        engine.call("on_show_customization_screen", false);
        global_customization_blur_active = true;
        show_name = false;

    } else if (ctype.type == "spray") {

        engine.call("on_show_customization_screen", false);
        global_customization_blur_active = true;
        
    } else {

        engine.call("on_show_customization_screen", false);
        global_customization_blur_active = false;

    }

    // Enabled / Disable the background blur
    set_blur(global_customization_blur_active);

    _empty(cont);

    // Don't show a preview for country flags
    if (ctype.type == "country") return;

    if (!customization.hasOwnProperty("customization_id")) {
        customization = {
            "customization_id": "default",
            "customization_type": ctype.type_id,
            "customization_sub_type": "",
            "customization_set_id": null,
            "rarity": 0,
            "amount": 1
        };
    }

    if (show_desc) {
        let customization_desc = _createElement("div", "customization_desc");
        customization_desc.style.setProperty("--item_rarity_color", "var(--rarity_"+customization.rarity+")");
        customization_desc.appendChild(createCustomizationInfo(customization, show_name));
        fragment.appendChild(customization_desc);
    }

    fragment.appendChild(createCustomizationPreview(customization));

    cont.appendChild(fragment);

}