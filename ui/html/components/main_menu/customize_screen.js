let global_default_powerup_music = 'mu_pu_devilish';
let global_default_spray = 'sp_play_nice';

let global_customization_preview_area = undefined;
let global_customization_active_category = undefined;
let global_customization_active_ctype = undefined;
let global_customization_prev_type = undefined; // type that was active before the current one
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

let global_customization_button_map = {
    /*
    "profile": {
        "category_count_div": <div reference>
        "page_count_divs": {
            "avatar_": <div reference>
            "sticker_eyes": <div reference>
        }
    }
    */
}

let global_customization_options_map = {
    "profile": [
        new CustomizationType("avatar", ""),
        new CustomizationType("country", ""),
    ],
    "character": [
        new CustomizationType("shell", ""),
        new CustomizationType("shoes", "l"),
        new CustomizationType("shoes", "r"),
        //new CustomizationType("shield", ""),
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
        new CustomizationType("weapon", "melee"),
        // weapon options are added dynamically (line ~145)
    ],
    "weapon_attachment": [
        new CustomizationType("weapon_attachment", "melee"),
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

    let menu = _id("customize_menu");

    // Init lookup map for the new count divs
    global_customization_button_map['profile'] = {
        "category_count_div": menu.querySelector(".category.profile .new"),
        "page_count_divs": {},
    };
    global_customization_button_map['sticker'] = {
        "category_count_div": menu.querySelector(".category.sticker .new"),
        "page_count_divs": {},
    };
    global_customization_button_map['character'] = {
        "category_count_div": menu.querySelector(".category.character .new"),
        "page_count_divs": {},
    };
    global_customization_button_map['music'] = {
        "category_count_div": menu.querySelector(".category.music .new"),
        "page_count_divs": {},
    };
    global_customization_button_map['emote'] = {
        "category_count_div": menu.querySelector(".category.emote .new"),
        "page_count_divs": {},
    };
    global_customization_button_map['spray'] = {
        "category_count_div": menu.querySelector(".category.spray .new"),
        "page_count_divs": {},
    };
    global_customization_button_map['weapon'] = {
        "category_count_div": menu.querySelector(".category.weapon .new"),
        "page_count_divs": {},
    };
    global_customization_button_map['weapon_attachment'] = {
        "category_count_div": menu.querySelector(".category.weapon_attachment .new"),
        "page_count_divs": {},
    };

    
    // Create weapon and weapon attachment ctypes
    for (let type of ["weapon", "weapon_attachment"]) {
        for (let wid of global_weapons_with_skins) {

            // Skip the melee because its added manually
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


    global_customization_preview_area.addEventListener("mousedown", function(e) {
        if (e.button == 1) {
            engine.call("start_mmb_dragging");
        }
    });
    global_customization_preview_area.addEventListener("mousemove", function(e) {
        engine.call("set_decals_cursor", e.clientX, e.clientY);
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


    // Setup the shell color picker
    let color_picker = _id("character_color");

    character_jscolor_picker = new jscolor(color_picker, null, null, false);
    character_jscolor_picker.onFineChange = function() { update_variable("string", "game_skin_color", color_picker.value); };

    color_picker.onchange = function() { update_variable("string", "game_skin_color", color_picker.value); };
    color_picker.addEventListener("keydown", function(e) { e.stopPropagation(); });
    
    engine.call("initialize_color_value", "game_skin_color");
}

function load_customization_presets() {
    // Retrieve saved customization presets
    api_request("GET", "/user/presets", {}, function(data) {
        if (data.hasOwnProperty("presets")) {
            customization_render_presets(data.presets);
        } else {
            customization_render_presets([]);
        }
    });
}

const customization_max_presets_count = 5;
let customization_selected_preset = null;
let customize_preset_lookup = {};
function customization_render_presets(data) {
    let cont = _id("customization_presets_content");
    _empty(cont);

    customize_preset_lookup = {};
    for (let p of data) customize_preset_lookup[p.preset_index] = p;

    // render list of existing presets and empty spaces
    for (let i=0; i<customization_max_presets_count; i++) {
        
        let preset = null;
        if (customize_preset_lookup.hasOwnProperty(i)) preset = customize_preset_lookup[i];

        let preset_div = _createElement("div", "preset");
        customization_render_preset(preset_div, preset, i);

        preset_div.addEventListener("click", function() {
            if (customization_selected_preset !== null) customization_selected_preset.classList.remove("selected");

            if (customization_selected_preset === preset_div) {
                customize_preset_deselect();
            } else {
                customization_selected_preset = preset_div;
                customization_selected_preset.classList.add("selected");

                _id("customize_presets_menu").classList.add("active");

                let clicked_preset = null;
                if (customize_preset_lookup.hasOwnProperty(i)) clicked_preset = customize_preset_lookup[i];
                customize_preset_preview(clicked_preset);
            }
        });

        _addButtonSounds(preset_div, 1);

        cont.appendChild(preset_div);
    }

    cont.appendChild(_createElement("div", "presets_padding"));
}

function customize_preset_deselect() {
    if (customization_selected_preset !== null) customization_selected_preset.classList.remove("selected");
    customization_selected_preset = null;

    _id("customize_presets_menu").classList.remove("active");
    customize_preset_preview(null);
}

function customize_preset_preview(preset) {
    if (preset === null) {
        // reset preview to the current normal setup
        reset_customization_previews();
    } else {
        engine.call("reset_locker_agent_rotation");

        let shell_id = '';
        if ("shell" in preset.customizations) shell_id = preset.customizations.shell;

        let customization = {}
        if (shell_id in global_customization_data_map) customization = global_customization_data_map[shell_id];
        
        show_customization_preview_scene("customize", new CustomizationType("shell", ""), shell_id, customization, global_customization_preview_area);
    
        if ("sh_l" in preset.customizations) {
            engine.call("set_preview_shoe", "l", preset.customizations.sh_l);
        } else {
            engine.call("set_preview_shoe", "l", "");
        }
    
        if ("sh_r" in preset.customizations) {
            engine.call("set_preview_shoe", "r", preset.customizations.sh_r);
        } else {
            engine.call("set_preview_shoe", "r", "");
        }
    
        if ("sticker" in preset.customizations) {
            engine.call("set_player_decals_override", true, preset.customizations.sticker);
        } else {
            engine.call("set_player_decals_override", true, "");
        }
    }
}

function customization_update_preset(data) {
    let presets_cont = _id("customization_presets_content");
    let preset_div = null;

    for (let i=0; i<presets_cont.children.length; i++) {
        if (parseInt(presets_cont.children[i].dataset.index) == data.preset_index) {
            preset_div = presets_cont.children[i];
            break;
        }
    }

    if (preset_div != null) {
        _empty(preset_div);
        customization_render_preset(preset_div, data, data.preset_index);
        customize_preset_lookup[data.preset_index] = data;

        if (preset_div.classList.contains("selected")) {
            customize_preset_preview(data);
        }
    }
}

function customization_render_preset(preset_div, preset, index) {
    let disable = _createElement("div", ["customization_item", "disable", "rarity_bg_0"]);
    disable.appendChild(_createElement("div", "times"));

    preset_div.dataset.index = index;

    if (preset) {
        preset_div.dataset.id = preset.preset_id;
        preset_div.dataset.name = preset.preset_name;

        let preset_name = preset.preset_name;
        if (preset_name.length == 0) preset_name = localize_ext("customize_preset", {"count": index+1});
        let name = _createElement("div", "name", preset_name);
        preset_div.appendChild(name);

        let body = _createElement("div", "body");
        preset_div.appendChild(body);

        // Shell
        let big = _createElement("div", "big");
        body.appendChild(big);
        if (preset.customizations.hasOwnProperty("shell") && preset.customizations.shell.length && global_customization_data_map.hasOwnProperty(preset.customizations.shell)) {
            big.appendChild(render_item(global_customization_data_map[preset.customizations.shell]));
        } else {
            big.appendChild(disable.cloneNode(true));
        }

        // Shoes
        if (preset.customizations.hasOwnProperty("sh_l") && preset.customizations.sh_l.length && global_customization_data_map.hasOwnProperty(preset.customizations.sh_l)) {
            let big_sh_l = _createElement("div", "big");
            body.appendChild(big_sh_l);
            big_sh_l.appendChild(render_item(global_customization_data_map[preset.customizations.sh_l]));
        }
        if (preset.customizations.hasOwnProperty("sh_r") && preset.customizations.sh_r.length && global_customization_data_map.hasOwnProperty(preset.customizations.sh_r)) {
            let big_sh_r = _createElement("div", "big");
            body.appendChild(big_sh_r);
            big_sh_r.appendChild(render_item(global_customization_data_map[preset.customizations.sh_r]));
        }

        let stickers = [];
        if (preset.customizations.hasOwnProperty("sticker") && preset.customizations.sticker.length) {
            let parts = preset.customizations.sticker.split("!");
            for (let part of parts) {
                if (stickers.length >= 10) break;
                
                let tmp = part.split(":");
                stickers.push(tmp[11]);
            }
        }

        // Stickers
        let double_st = _createElement("div", "double");
        body.appendChild(double_st);
        for (let st of stickers) {
            if (!global_customization_data_map.hasOwnProperty(st)) continue;
            double_st.appendChild(render_item(global_customization_data_map[st]));
        }

    } else {
        preset_div.dataset.id = "new";
        preset_div.dataset.name = "";
        preset_div.appendChild(_createElement("div", "new"));
    }

    function render_item(c) {
        let item = _createElement("div", "customization_item");
                        
        item.dataset.msgHtmlId = "customization_item";
        item.dataset.id = c.customization_id;
        item.dataset.type = c.customization_type;
        item.dataset.rarity = c.rarity;
        add_tooltip2_listeners(item);

        item.classList.add(global_customization_type_map[c.customization_type].name);
        item.classList.add("rarity_bg_"+c.rarity);
        item.style.setProperty("--rarity", "var(--rarity_dark_"+c.rarity+")");

        item.appendChild(renderCustomizationInner("customize", c.customization_type, c.customization_id, c.amount, false));
        return item;
    }
}

let customize_presets_opened = false;
function customization_load_presets() {
    if (customize_presets_opened) return;
    customize_presets_opened = true;

    // Hide windows from regular categories
    _id("customize_content").style.display = "none";
    global_customization_preview_area.style.opacity = 0;
    _id("customize_screen_stickers").style.display = "none";

    historyPushState({"page": "customize_screen", "category": "presets", "type": null});

    if (customization_selected_preset != null) {
        customization_selected_preset.classList.remove("selected");
        customization_selected_preset = null;
        _id("customize_presets_menu").classList.remove("active");
    }

    // Show eggbot preview
    engine.call("on_show_customization_screen", true);
    engine.call("set_stage_map_camera", ITEM_PREVIEW_CAMERAS.eggbot_locker);

    // Setup character rotation controls
    let preview_container = _createElement("div", "preview_container");
    setup_customization_preview_rotation_listeners(preview_container);
    _empty(global_customization_preview_area);
    global_customization_preview_area.appendChild(preview_container);

    let presets_cont = _id("customize_presets");
    presets_cont.classList.add("active");

    let list_content = _id("customization_presets_content");
    refreshScrollbar(list_content.parentElement);
    resetScrollbar(list_content.parentElement);
}

function customize_presets_save() {
    if (customization_selected_preset == null) return;

    let cont = _createElement("div","preset_name_prompt");
    let input = _createElement("input","preset_name_prompt_input");
    input.setAttribute("type", "text");
    input.focus();
    input.value = customization_selected_preset.dataset.name;
    cont.appendChild(input);
    input.maxLength = 50;

    input.addEventListener("keydown", function(e) {
        if (e.keyCode == 13) { //return
            e.preventDefault();

            save_preset(input.value.trim());

            // close modal
            close_modal_screen_by_selector('generic_modal');
        }
    });

    genericModal(localize("customize_preset_name"), cont, localize("menu_button_cancel"), null, localize("menu_button_save"), function() {
        save_preset(input.value);
    });

    function save_preset(name) {
        send_string(CLIENT_COMMAND_SAVE_CHAR_PRESET, JSON.stringify({ "preset_id": customization_selected_preset.dataset.id, "index": customization_selected_preset.dataset.index, "name": name }));
    }
}

function customize_presets_load() {
    if (customization_selected_preset == null) return;
    if (customization_selected_preset.dataset.id == "new") return;

    send_string(CLIENT_COMMAND_LOAD_CHAR_PRESET, customization_selected_preset.dataset.id);
}

function customize_presets_delete() {
    if (customization_selected_preset == null) return;
    if (customization_selected_preset.dataset.id == "new") return;

    send_string(CLIENT_COMMAND_DEL_CHAR_PRESET, customization_selected_preset.dataset.id);

    _empty(customization_selected_preset);
    customization_selected_preset.dataset.id = "new";
    customization_selected_preset.dataset.name = "";
    customization_selected_preset.appendChild(_createElement("div", "new"));

    customize_preset_preview(null);
    delete customize_preset_lookup[customization_selected_preset.dataset.index];
}

function customization_move_sticker_layer(direction) {
    engine.call("arrange_decal_selection", direction);
}

let character_jscolor_picker = undefined;
let client_buffered_set_color_timeout = null;
function customization_set_shell_color(color) {
    if (client_buffered_set_color_timeout != null) clearTimeout(client_buffered_set_color_timeout);
    client_buffered_set_color_timeout = setTimeout(function() {
        send_string(CLIENT_COMMAND_SET_COLOR, color);
        clear_profile_data_cache_id(global_self.user_id);
        client_buffered_set_color_timeout = null;
    }, 500);
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

        customization_update_new_counts();

        for (let page_id in customize_saved_page) {
            if (global_customization_active_ctype && page_id == global_customization_active_ctype.page_id) {
                customize_saved_page[page_id].style.display = "flex";
            } else {
                customize_saved_page[page_id].style.display = "none";
            }
        }

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
 * Updates the unseen customization counts in the main menu and the customization tabs
 */
function customization_update_new_counts() {
    // Update the counts for the sub menu in customization
    for (let category in global_customization_button_map) {
        if (global_customization_button_map[category].category_count_div) {
            let new_count = customization_get_new_count_category(category);
            global_customization_button_map[category].category_count_div.textContent = new_count;

            if (new_count == 0) global_customization_button_map[category].category_count_div.style.display = "none";
            else global_customization_button_map[category].category_count_div.style.display = "flex";
        }
    }

    // Update the total count in the main menu
    let total_count_div = _id("customize_new_count");
    let total_count = customization_get_new_count_category();
    if (total_count_div) {
        total_count_div.textContent = total_count;
        if (total_count == 0) total_count_div.style.display = "none";
        else total_count_div.style.display = "flex";
    }

    // Update the count of a category if one is open
    if (global_customization_active_category && global_customization_active_category in global_customization_options_map) {

        for (let ctype of global_customization_options_map[global_customization_active_category]) {
            if (!global_customization_button_map.hasOwnProperty(global_customization_active_category)) continue;
            if (!global_customization_button_map[global_customization_active_category].page_count_divs.hasOwnProperty(ctype.page_id)) continue;

            let new_count = customization_get_new_count(ctype);
            let div = global_customization_button_map[global_customization_active_category].page_count_divs[ctype.page_id];
            div.textContent = new_count;
            if (new_count == 0) div.style.display = "none";
            else div.style.display = "flex";
        }
    }
}

/**
 * Get the count of unseen new customization items within a ctype
 * @param {CustomizationType} ctype 
 */
function customization_get_new_count(ctype) {
    let new_count = 0;
    for (let c of global_customization_data) {
        if (c.customization_type != global_customization_type_id_map[ctype.type]) continue;
        if (c.customization_sub_type != ctype.sub_type) continue;
        if (c.seen === false) new_count++;
    }

    return new_count;
}

/**
 * Get the count of unseen new customization items in a category (customization tab) or the combined count
 * @param {String} category can also be an empty string to get the combined count
 */
function customization_get_new_count_category(category) {
    let new_count = 0;
    for (let c of global_customization_data) {
        if (!global_customization_type_map.hasOwnProperty(c.customization_type)) continue;
        if (category && global_customization_type_map[c.customization_type].group != category) continue;
        if (c.seen === false) new_count++;
    }

    return new_count;
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
            if (type_name == "shoes" && sub_type.length == 0) continue;
            if (type_name == "music" && sub_type.length == 0) continue;
            if (type_name == "weapons" && sub_type.length == 0) continue;
            if (type_name == "weapon_attachment" && sub_type.length == 0) continue;

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

        // If we didn't send the "seen" property -> default it to false
        if (!c.hasOwnProperty("seen")) c.seen = false;

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

    // Update the unseen customization count indicator
    customization_update_new_counts();
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

let global_set_customizations_from_server = true;
/**
 * Sets client customizations coming from the MS
 * @param {Object} data MS client data object
 * @param {Boolean} init if its the first time being called or not after connecting to the MS
 */
let hexColorRegex = /^#?([0-9A-F]{3}){1,2}$/i;
function set_customize_data(data) {

    global_set_customizations_from_server = true;

    // Set Character Stickers
    if (data.customizations && data.customizations.sticker) update_variable("string", "game_decals", data.customizations.sticker);
    else update_variable("string", "game_decals", "");

    // Set Character Color
    if (data.customizations && data.customizations.color && hexColorRegex.test(data.customizations.color)) {
        update_variable("string", "game_skin_color", data.customizations.color);
        customization_update_color_picker(data.customizations.color);
    }

    global_set_customizations_from_server = false;
}

function customization_update_color_picker(color) {
    let color_picker = _id("character_color");
    if (color_picker) color_picker.value = color;
    if (character_jscolor_picker) character_jscolor_picker.importColor();
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

    if (customize_presets_opened) {
        customize_presets_opened = false;
        _id("customize_presets").classList.remove("active");
        reset_customization_previews();
    }

    if (global_customization_active_ctype) global_customization_prev_type = global_customization_active_ctype.type;

    let customization_content = _id("customize_content");
    if (customization_content) customization_content.style.display = "flex";

    customization_render_category(category, ctype);
    customization_show_category(category, global_customization_active_ctype);
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

    let cont = _id("customize_content");

    let menu = cont.querySelector(".menu");
    let bottom = _id("customization_bottom");
    let bottom_color = _id("customization_bottom_color");
    let bottom_equip = _id("customization_bottom_equip");
    
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

    if (show_bottom) bottom.style.display = "flex";
    else bottom.style.display = "none";

    // hide sticker tools
    _id("customize_screen_stickers").style.display = "none";
    // disable active sticker tools
    customize_set_tool("none");

    _empty(menu);

    for (let ctype of ctypes) {
        let option = _createElement("div","option");
        let option_inner = _createElement("div", "option_inner");
        option.appendChild(option_inner);

        // Unseen count indicator
        let new_count = customization_get_new_count(ctype);
        let new_div = _createElement("div", "new", new_count);
        option.appendChild(new_div);
        if (new_count == 0) new_div.style.display = "none";

        if (!category in global_customization_button_map) {
            global_customization_button_map[category] = {
                "category_count_div": undefined,
                "page_count_divs": {},
            }
        }
        global_customization_button_map[category]["page_count_divs"][ctype.page_id] = new_div;


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
                    option_inner.textContent = localize("customize_"+ctype.page_id);
                } else if (ctype.sub_type == "logos") {
                    option_inner.textContent = localize("customize_"+ctype.page_id);
                }

                // Tooltip
                if (tooltip) {
                    option.dataset.msgId = "customize_"+ctype.page_id;
                    add_tooltip2_listeners(option);
                }
            } else {
                option_inner.textContent = localize("customize_"+ctype.type);
            }
        } else {
            if (ctype.type == "shoes" && ctype.sub_type.length == 0) continue;

            if (ctype.sub_type.length) {
                option_inner.textContent = localize("customize_"+ctype.page_id);
            } else {
                option_inner.textContent = localize("customize_"+ctype.type);
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

        if (global_customization_active_ctype) global_customization_prev_type = global_customization_active_ctype.type;
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

    // Reset character selections
    reset_customization_previews();

    // Stop any audio previews
    _pause_music_preview();

    global_customization_active_category = category;

    // Reset tool selection when changing category or sub category
    customize_set_tool("none");

    if (category == "presets") {
        customize_presets_opened = false;
        customization_load_presets();
        return;
    }

    historyPushState({"page": "customize_screen", "category": category, "type": ctype});
    global_customization_preview_area.style.opacity = 1;

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
    } else if (global_customization_active_ctype.type == "country") {
        current_customization = {
            "customization_id": current_customization_id,
            "customization_type": 10,
            "customization_sub_type": null,
            "rarity": 0,
        };
    } else {
        if (current_customization_id in global_customization_data_map) current_customization = global_customization_data_map[current_customization_id];
    }

    render_customization_details(global_customization_active_ctype, current_customization_id);

    if (ctype.type == "sticker") {
        if (global_customization_prev_type != global_customization_active_ctype.type) {
            engine.call("on_show_customization_screen", true);
            engine.call("set_stage_map_camera", ITEM_PREVIEW_CAMERAS.eggbot_locker);
            engine.call("reset_locker_agent_rotation");
        }
        _id("customize_screen_stickers").style.display = "flex";
    } else {
        _id("customize_screen_stickers").style.display = "none";
    }

    // Show big 2D or 3D Preview
    show_customization_preview_scene("customize", ctype, current_customization_id, current_customization, global_customization_preview_area);


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

            if (content.children[i].classList.contains("active_item"))      set_customization_inactive(content.children[i]);
            if (content.children[i].classList.contains("preview"))          content.children[i].classList.remove("preview");
            if (content.children[i].dataset.id == current_customization_id) set_customization_active(content.children[i]);
        }
    }
}

/**
 * Reset the character 3d previews of the eggbot back to the actual selection
 */
function reset_customization_previews() {
    // Shell
    let current_shell = get_current_customization(new CustomizationType("shell", ""));
    engine.call("set_preview_shell", current_shell);
    reset_customization_category_selection(customize_saved_page["shell_"], current_shell);

    // Shoe Left
    let current_shoe_l = get_current_customization(new CustomizationType("shoes", "l"));
    engine.call("set_preview_shoe", "l", current_shoe_l);
    reset_customization_category_selection(customize_saved_page["shoes_l"], current_shoe_l);

    // Shoe Right
    let current_shoe_r = get_current_customization(new CustomizationType("shoes", "r"));
    engine.call("set_preview_shoe", "r", current_shoe_r);
    reset_customization_category_selection(customize_saved_page["shoes_r"], current_shoe_r);

    // Stickers
    engine.call("set_player_decals_override", false, "");
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
                if (ctype.type == "weapon_attachment" && ctype.sub_type == "melee" && c.customization_sub_type.length == 0) return false;
                if (ctype.sub_type == c.customization_sub_type || (c.customization_sub_type.length == 0 && match_empty_sub_group === true)) return true;
            } else {
                return true;  
            }
        }
        return false;
    });

    let duplicate_tracker = {};
    let filtered_data = [];
    for (let c of data) {
        if (duplicate_tracker.hasOwnProperty(c.customization_id)) {
            if (c.seen == false) duplicate_tracker[c.customization_id] = c;
            continue;
        }

        duplicate_tracker[c.customization_id] = c;
    }

    for (let c_id in duplicate_tracker) filtered_data.push(duplicate_tracker[c_id]);

    filtered_data.sort(customization_sort_func);

    return filtered_data;
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
    if (ctype.type == "shoes") get_empty_sub_group = true;
    let data = get_customization_category_content_data(ctype, get_empty_sub_group);
    
    let lazy_load = false;
    let fragment = _createElement("div",["customization_type_items", ctype.type]);
    if (!global_customization_active_ctype || global_customization_active_ctype.page_id !== ctype.page_id) {
        fragment.style.display = "none";
        lazy_load = true;
    }
    fragment.appendChild(_createElement("div", "separator"));

    // Default disable button
    let disable = _createElement("div", ["customization_item", "disable", "rarity_bg_0"]);
    disable.addEventListener("click", customization_on_select);
    disable.dataset.id = "";
    _addButtonSounds(disable, 1);
    disable.appendChild(_createElement("div", "times"));

    let option_count = 0;
    let default_sel = "";

    if (ctype.type == "country") {
        if (!global_self.data || !global_self.data.customizations.country) set_customization_active(disable);
        fragment.appendChild(disable);
        data = GLOBAL_AVAILABLE_COUNTRY_FLAGS;
        option_count++;
    } else if (ctype.type == "weapon_attachment") {
        let stat_tracker_seen = true;
        let stat_tracker = false;
        let stat_tracker_id = '';
        if (data && data.length) {
            for (let c of data) {
                if (c.customization_id.endsWith("_stattracker")) {
                    stat_tracker_seen = c.seen;
                    stat_tracker = true;
                    stat_tracker_id = c.customization_id;
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

            // Show a "new" indicator on the stattracker if it hadn't been clicked on before
            if (!stat_tracker_seen) {
                let new_div = _createElement("div", "new", "!");
                stat_tracker_cont.appendChild(new_div);
                stat_tracker_select.dataset.new = 1;
                stat_tracker_select.addEventListener("click", function() {
                    api_request("POST", "/user/customization/"+stat_tracker_id+"/seen");
                    global_customization_data_map[stat_tracker_id].seen = true;
            
                    _remove_node(new_div);
            
                    // Update the count indicators
                    customization_update_new_counts();
                });
            }

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

        if (selected.attachment == "") set_customization_active(disable); 
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
        if (!customization || customization.trim().length == 0) set_customization_active(disable);
        fragment.appendChild(disable);
        option_count++;

    }

    if (data && data.length) {
        for (let c of data) {

            let item = _createElement("div", "customization_item");
            item.addEventListener("click", customization_on_select);
            _addButtonSounds(item, 1);

            // FLAGS 
            if (ctype.type == "country") {
                if (global_self.data && c == global_self.data.customizations.country) { set_customization_active(item); }

                item.classList.add("flag");
                item.classList.add("rarity_bg_0");
                item.style.setProperty("--rarity", "var(--rarity_dark_0)");
                item.dataset.id = c;

                let inner = _createElement("div", "country_flag");
                inner.style.backgroundImage = "url("+_flagUrl(c)+")";
                item.appendChild(inner);

                item.dataset.msg = localize_country(c);
                add_tooltip2_listeners(item);
            } else {
                if (ctype.type == "weapon_attachment" && c.customization_id.endsWith("_stattracker")) continue;
                
                item.dataset.msgHtmlId = "customization_item";
                item.dataset.id = c.customization_id;
                item.dataset.type = c.customization_type;
                item.dataset.rarity = c.rarity;
                add_tooltip2_listeners(item);

                item.classList.add(ctype.type);
                item.classList.add("rarity_bg_"+c.rarity);
                item.style.setProperty("--rarity", "var(--rarity_dark_"+c.rarity+")");

                item.appendChild(renderCustomizationInner("customize", c.customization_type, c.customization_id, c.amount, lazy_load));

                if (!("seen" in c) || c.seen == false) {
                    let new_div = _createElement("div", "new", "!");
                    item.appendChild(new_div);
                    item.dataset.new = 1;
                }

            }

            // Add selected class for types that don't require an equip confirmation
            if (ctype.type == "avatar" && global_self.data && c.customization_id == global_self.data.customizations.avatar) set_customization_active(item);
            if (ctype.type == "music" && ctype.sub_type == "pu" && c.customization_id == default_sel) set_customization_active(item);
            if (ctype.type == "spray" && c.customization_id == default_sel) set_customization_active(item);

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

    // Send updated stattracker selection to the MS directly
    let current_attachments = get_current_customization_attachments(global_customization_active_ctype.sub_type);
    current_attachments.stattracker = field.dataset.value;
    send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map["weapon_attachment"]+":"+global_customization_active_ctype.sub_type+":"+create_attachment_customization_string(current_attachments));
}

/**
 * On item selection callback function
 * @param {Object} e click event object from clicking on the customization_item element
 */
function customization_on_select(e) {
    if (!global_customization_active_ctype) return;
    
    let prev = e.currentTarget.parentElement.querySelector(".active_item");
    let prev_active = e.currentTarget.parentElement.querySelector(".preview");

    if (prev_active && prev_active === e.currentTarget) {
        if (global_customization_active_ctype.type in global_customization_confirm_types) {
            equip_customize_selection();
        }
        return;
    }

    let current_customization_id = e.currentTarget.dataset.id;
    let current_customization = {};

    if (global_customization_active_ctype.type == "weapon_attachment") {

        global_customization_selected_attachment.attachment = e.currentTarget.dataset.id;
        if (global_customization_selected_attachment.attachment in global_customization_data_map) current_customization = global_customization_data_map[global_customization_selected_attachment.attachment];
        current_customization_id = create_attachment_customization_string(global_customization_selected_attachment);

    } else if (global_customization_active_ctype.type == "country") {
        current_customization = {
            "customization_id": current_customization_id,
            "customization_type": 10,
            "customization_sub_type": null,
            "rarity": 0,
        };
    } else {
        if (current_customization_id in global_customization_data_map) current_customization = global_customization_data_map[current_customization_id];
    }

    render_customization_details(global_customization_active_ctype, current_customization_id);

    // Show big 2D or 3D Preview
    show_customization_preview_scene("customize", global_customization_active_ctype, current_customization_id, current_customization, global_customization_preview_area);

    // Flag
    if (global_customization_active_ctype.type == "country") {
        if (prev) set_customization_inactive(prev);
        set_customization_active(e.currentTarget);
        send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map["country"]+"::"+e.currentTarget.dataset.id);
        clear_profile_data_cache_id(global_self.data.user_id);
    }

    // Avatar
    if (global_customization_active_ctype.type == "avatar") {
        if (prev) set_customization_inactive(prev);
        set_customization_active(e.currentTarget);
        send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map["avatar"]+"::"+e.currentTarget.dataset.id);
        clear_profile_data_cache_id(global_self.data.user_id);
    }

    // Sticker
    if (global_customization_active_ctype.type == "sticker") {
        if (e.currentTarget.classList.contains("active_item")) {
            customize_set_tool("none", e.currentTarget);
            set_customization_inactive(e.currentTarget);
            global_customize_selected_decal = undefined;
        } else {
            if (prev) set_customization_inactive(prev);
            customize_set_tool("add_decal", e.currentTarget);
            set_customization_active(e.currentTarget);
        }
    }

    // Music
    if (global_customization_active_ctype.type == "music") {
        if (prev) set_customization_inactive(prev);
        set_customization_active(e.currentTarget);
        send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map["music"]+":"+global_customization_active_ctype.sub_type+":"+e.currentTarget.dataset.id);
    }

    // Spray
    if (global_customization_active_ctype.type == "spray") {
        if (prev) set_customization_inactive(prev);
        set_customization_active(e.currentTarget);
        send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map["spray"]+"::"+e.currentTarget.dataset.id);
    }

    // Hide / Show the equip button if the current item type needs confirmation
    if (global_customization_confirm_types[global_customization_active_ctype.type]) {

        global_customization_selected = e.currentTarget;

        if (prev_active) prev_active.classList.remove("preview");
        if (!e.currentTarget.classList.contains("active_item")) e.currentTarget.classList.add("preview");

        set_customization_equip_btn_state(global_customization_active_ctype);
    }

    // Reset the "seen" item state on selection
    if ("new" in e.currentTarget.dataset && e.currentTarget.dataset.new == "1") {
        api_request("POST", "/user/customization/"+e.currentTarget.dataset.id+"/seen");
        global_customization_data_map[e.currentTarget.dataset.id].seen = true;

        let new_div = e.currentTarget.querySelector(".new");
        if (new_div) _remove_node(new_div);

        // Update the count indicators
        customization_update_new_counts();
    }
}

/**
 * Render details or options for this specific customization item
 * @param {CustomizationType} ctype
 * @param {String} customization_id
 */
function render_customization_details(ctype, customization_id) {
    
    let cont = _id("customization_details");
    _empty(cont);

    if (ctype.type == "weapon_attachment") {

        let attach = get_customization_attachments(customization_id);

        let c = null;
        if (attach.attachment in global_customization_data_map) c = global_customization_data_map[attach.attachment];
        if (c === null) return;
        
        let wa_active_in = get_active_weapon_attachment_list(attach.attachment);
        let remaining_count = c.amount;

        // currently equipped on...
        if (wa_active_in.length) {
            remaining_count = c.amount - wa_active_in.length;
            if (remaining_count < 0) remaining_count = 0;
            
            let equipped_cont = _createElement("div", "equipped_cont");
            for (let w of wa_active_in) {
                if (!global_item_name_map.hasOwnProperty("weapon"+w)) continue;

                let weapon_line = _createElement("div", "weapon");
                weapon_line.appendChild(_createElement("div", "name", localize(global_item_name_map["weapon"+w][1])));
                let remove_btn = _createElement("div", ["db-btn", "plain", "remove"]);
                weapon_line.appendChild(remove_btn);
                equipped_cont.appendChild(weapon_line);

                remove_btn.addEventListener("click", function() {
                    // Remove attachment from this weapon
                    let new_attach = get_current_customization_attachments(w);
                    new_attach.attachment = "";
                    send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map["weapon_attachment"]+":"+w+":"+create_attachment_customization_string(new_attach));
                });
                // Tooltip
                remove_btn.dataset.msg = localize("weapon_attachment_unequip");
                add_tooltip2_listeners(remove_btn);
            }
            cont.appendChild(equipped_cont);
        }

        if (remaining_count > 0) cont.appendChild(_createElement("div", "desc", localize_ext("weapon_attachment_msg_count", {"count": remaining_count})));
        else cont.appendChild(_createElement("div", "desc", localize("weapon_attachment_msg_negative")));
    }
}

/**
 * Get the remaining number of times a weapon attachment can be equipped on different weapons
 * @param {String} attachment_string attachment string part of the weapon attachment, e.g. wa_bobblehead
 */
function get_remaining_wa_use_count(attachment_string) {
    let c = null;
    if (attachment_string in global_customization_data_map) c = global_customization_data_map[attachment_string];
    if (c === null) return 0;

    let wa_active_in = get_active_weapon_attachment_list(attachment_string);
    let remaining_count = c.amount;

    if (wa_active_in.length) {
        remaining_count = c.amount - wa_active_in.length;
        if (remaining_count < 0) remaining_count = 0;
    }

    return remaining_count;
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
            let remaining_count = 1;
            if (global_customization_selected_attachment.attachment.length) remaining_count = get_remaining_wa_use_count(global_customization_selected_attachment.attachment);

            if (remaining_count > 0) {
                _id("customization_equip_button").classList.add("active");
            } else {
                _id("customization_equip_button").classList.remove("active");
            }
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

    // Return the default selection of some types if nothing is selected
    if ((ret && typeof ret == "object" && Object.keys(ret).length == 0) || (!ret || ret.trim().length == 0)) {
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
 * Get the list of weapons where this weapon attachment is currently in use
 * @param {String} customization_id
 */
function get_active_weapon_attachment_list(customization_id) {
    if (!customization_id) return [];
    if (customization_id.trim().length == 0) return [];

    let active_on_weapon_sub_types = [];
    if (_check_nested(global_self, "data", "customizations", "weapon_attachment")) {
        for (let weapon in global_self.data.customizations.weapon_attachment) {
            let wa = global_self.data.customizations.weapon_attachment[weapon];
            if (wa.includes(customization_id)) active_on_weapon_sub_types.push(weapon);
        }
    }

    return active_on_weapon_sub_types;
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

        let prev_active = global_customization_selected.parentElement.querySelector(".active_item");
        if (prev_active) set_customization_inactive(prev_active);

        global_customization_selected.classList.remove("preview");
        set_customization_active(global_customization_selected);
        global_customization_selected = null;

        clear_profile_data_cache_id(global_self.data.user_id);
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

            // Reset the attachment details and button state if they are currently visible
            if (global_customization_active_ctype.type == type_name && global_customization_active_ctype.sub_type.length) {
                if (global_customization_active_ctype.sub_type == customization.sub_type) {
                    global_customization_selected_attachment = get_current_customization_attachments(global_customization_active_ctype.sub_type);
                }

                if (global_customization_selected_attachment.attachment.length) {
                    render_customization_details(global_customization_active_ctype, create_attachment_customization_string(global_customization_selected_attachment));
                } else {
                    render_customization_details(global_customization_active_ctype, get_current_customization(global_customization_active_ctype));
                }
                set_customization_equip_btn_state(global_customization_active_ctype);
            }
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
            set_customization_inactive(global_customize_selected_decal);
            global_customize_selected_decal = undefined;
        }
    } else {
        // Hide the usage box
        anim_hide(_id("select_shortcuts"));
    }

    engine.call("update_character_preview");
}

function set_customization_inactive(el) {
    if (!el) return;
    el.classList.remove("active_item");
    for (var i=0; i<el.childNodes.length; i++) {
        if (el.childNodes[i].classList.contains("active_icon")) el.removeChild(el.childNodes[i]);
    }
}
function set_customization_active(el) {
    if (!el) return;
    el.classList.add("active_item");
    el.appendChild(_createElement("div", "active_icon"));
}


const ITEM_PREVIEW_CAMERAS = {
    "eggbot_locker": 0,
    "weapon_locker": 1,
    "empty": 2,
    "weapon_battlepass": 3,
    "eggbot_battlepass": 4,
    "eggbot_profile": 5,
    "weapon_shop": 6,
    "eggbot_shop": 7,
    "weapon_notification": 8,
    "eggbot_notification": 9,
};

let global_preview_rotate_setup = false;
let global_preview_rotation_position = {};
let global_preview_rotation_dragging = false;
function setup_customization_preview_rotation_listeners(el) {
    el.addEventListener("mousedown", function(e) {
        if (e.button == 2) {
            global_preview_rotation_dragging = true;
        }
    });

    // Only add this listener once
    if (!global_preview_rotate_setup) {
        document.addEventListener("mouseup", function() {
            global_preview_rotation_dragging = false;
        });
        global_preview_rotate_setup = true;
    }

    el.addEventListener("mousemove", function(e) {
        if (global_preview_rotation_dragging) {
            if (typeof (global_preview_rotation_position.x) !== 'undefined') {
                var dx = e.clientX - global_preview_rotation_position.x;
                var dy = global_preview_rotation_position.y - e.clientY;
                engine.call("add_decals_model_rotation", dx, dy);
            }
        }

        global_preview_rotation_position = {
            x: e.clientX,
            y: e.clientY
        };
    });
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

    //console.log("show_customization_preview_scene", screen, id, _dump(customization), _dump(ctype));

    let show_desc = false;
    if (screen == "customize") show_desc = true;

    let show_2d_preview = true;
    if (screen == "customize" && ctype.type == "sticker") {
        show_2d_preview = false;
        show_desc = false;
    }

    let weapon_camera = ITEM_PREVIEW_CAMERAS.weapon_locker;
    let eggbot_camera = ITEM_PREVIEW_CAMERAS.eggbot_locker;
    if (screen == "battlepass") {
        weapon_camera = ITEM_PREVIEW_CAMERAS.weapon_battlepass;
        eggbot_camera = ITEM_PREVIEW_CAMERAS.eggbot_battlepass;
    } else if (screen == "player_profile") {
        eggbot_camera = ITEM_PREVIEW_CAMERAS.eggbot_profile;
    } else if (screen == "shop_item") {
        weapon_camera = ITEM_PREVIEW_CAMERAS.weapon_shop;
        eggbot_camera = ITEM_PREVIEW_CAMERAS.eggbot_shop;
    } else if (screen == "notification") {
        weapon_camera = ITEM_PREVIEW_CAMERAS.weapon_notification;
        eggbot_camera = ITEM_PREVIEW_CAMERAS.eggbot_notification;
    }

    let show_name = true;

    let preview_container = _createElement("div", "preview_container");    
    
    if (ctype.type == "weapon") {

        // Show the background scene with the desired weapon
        engine.call("on_show_customization_screen", true);
        engine.call("set_stage_map_camera", weapon_camera);
        engine.call("weapon_customization_select_weapon", ctype.sub_type);
        engine.call("set_preview_weapon_skin", ctype.sub_type, id);
    
    } else if (ctype.type == "weapon_attachment") {

        // Show the background scene with the desired weapon + active skin
        engine.call("on_show_customization_screen", true);
        engine.call("set_stage_map_camera", weapon_camera);
        engine.call("weapon_customization_select_weapon", ctype.sub_type);
        engine.call("set_preview_weapon_skin", ctype.sub_type, get_current_customization(new CustomizationType("weapon", ctype.sub_type)));
        engine.call("set_preview_weapon_attachment", ctype.sub_type, id);

    } else if (ctype.type == "shell") {

        engine.call("on_show_customization_screen", true);
        engine.call("set_stage_map_camera", eggbot_camera);
        engine.call("set_preview_shell", id);

        setup_customization_preview_rotation_listeners(preview_container);
        if (screen != "customize") engine.call("reset_locker_agent_rotation");
    
    } else if (ctype.type == "shoes") {

        // Show the users active shell in the preview
        let current_shell = get_current_customization(new CustomizationType("shell", ""));
        engine.call("set_preview_shell", current_shell);

        engine.call("on_show_customization_screen", true);
        engine.call("set_stage_map_camera", eggbot_camera);
        
        if (screen == "customize") {
            engine.call("set_preview_shoe", ctype.sub_type, id);
        } else {
            engine.call("set_preview_shoe", "l", id);
            engine.call("set_preview_shoe", "r", id);
        }

        setup_customization_preview_rotation_listeners(preview_container);
        if (screen != "customize") engine.call("reset_locker_agent_rotation");
    
    } else if (ctype.type == "music") {
        
        engine.call("on_show_customization_screen", true);
        engine.call("set_stage_map_camera", ITEM_PREVIEW_CAMERAS.empty);
    
    } else if (ctype.type == "sticker") {

        engine.call("on_show_customization_screen", true);
        if (screen != "customize") engine.call("set_stage_map_camera", ITEM_PREVIEW_CAMERAS.empty);
        else setup_customization_preview_rotation_listeners(preview_container);

    } else if (ctype.type == "avatar") {

        engine.call("on_show_customization_screen", true);
        engine.call("set_stage_map_camera", ITEM_PREVIEW_CAMERAS.empty);

    } else if (ctype.type == "spray") {

        engine.call("on_show_customization_screen", true);
        engine.call("set_stage_map_camera", ITEM_PREVIEW_CAMERAS.empty);
    
    } else if (ctype.type == "country") {

        engine.call("on_show_customization_screen", true);
        engine.call("set_stage_map_camera", ITEM_PREVIEW_CAMERAS.empty);

    } else {

        engine.call("on_show_customization_screen", true);
        engine.call("set_stage_map_camera", ITEM_PREVIEW_CAMERAS.empty);

    }

    global_customization_blur_active = false;
    set_blur(false);

    _empty(cont);


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
        preview_container.appendChild(customization_desc);
    }

    if (show_2d_preview) preview_container.appendChild(createCustomizationPreview(customization));

    cont.appendChild(preview_container);

}