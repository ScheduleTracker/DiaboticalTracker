
var custom_teamColors = [
    "#23c841",
    "#8438f6",
    "#ff8800",
    "#18c7ff",
    "#ffa1ce",
    "#f3f723",
    "#ff1c1c",
    "#7a874e",
    "#f62fff",
    "#ffffff",
];

var custom_teamNames = [
    "Team 1",
    "Team 2",
    "Team 3",
    "Team 4",
    "Team 5",
    "Team 6",
    "Team 7",
    "Team 8",
    "Team 9",
    "Team 10",
];

window.MAX_PLAYER_SLOTS = 16;

var global_lobby_id = -1;
var global_party = {
    "id": -1,
    "size": 0,
    "user_id": 0,
    "privacy": false,

    // user_id -> info map
    "members": {},

    // currently selected modes
    "modes": [],

    // currently selected roles
    "roles": {},

    // role player requirements
    "role-reqs": {},

    // modes that you can queue for based on party size filled by masterserver
    "valid-modes": [],
};
var bool_am_i_host = false;
var bool_am_i_leader = false;
var global_gameSlotList = [];
var global_specSlotList = [];
var global_customTeams = [];
var global_customTeamNames = [];
var global_teamContainers = [];
var global_teamColorList = [];
var global_playerColorList = [];
var global_customSettingsMap = {};
var global_customSettingElements = {};
var global_send_region_selection = false;
var custom_lobby_map_selected = false;
var global_lobby_selected_map = '';
var global_lobby_init_mode = '';
var global_lobby_admins = [];
let global_party_leader_elements = [];

function init_custom_modes() {
    // Add all the modes to the filter select list
    let modes = [];
    for (let mode in global_game_mode_map) modes.push(global_game_mode_map[mode]);
    modes.sort(function(a,b) {
        return a.name.localeCompare(b.name);
    });

    for (let mode of modes) {
        if (!mode.enabled) continue;
        if (!global_lobby_init_mode.length) global_lobby_init_mode = mode.mode;
        
        let opt = _createElement("div", "i18n");
        opt.dataset.i18n = mode.i18n;
        opt.dataset.value = mode.mode;
        opt.textContent = localize(mode.i18n);
        _id("custom_game_setting_mode").appendChild(opt);
    }
}

function init_custom_game_references() {
        // Elements only visible to the party leader
        global_party_leader_elements = [
            _id("quick_play_queue_button"),
            _id("ranked_play_queue_button"),        
            //_id("quick_play_warmup_alignment"),
            //_id("ranked_play_warmup_alignment"),
            _id("custom_play_create_lobby_button"),
            _id("custom_play_link_join_lobby_button"),
            _id("customlist_bottom"),
            _id("region_select_btn_qp"),
            _id("region_select_btn_ranked"),
        ]
    
        global_customSettingElements = {
            "visibility":                _id("custom_game_setting_visibility"),
            "name":                      _id("custom_game_setting_name"),
            "mode":                      _id("custom_game_setting_mode"),
            "map":                       _id("custom_game_setting_map"),
            "location":                  _id("custom_game_setting_location"),
            "time_limit":                _id("custom_game_setting_time_limit"),
            "score_limit":               _id("custom_game_setting_score_limit"),
            "team_count":                _id("custom_game_setting_team_count"),
            "team_size":                 _id("custom_game_setting_team_size"),
            "continuous":                _id("custom_game_setting_continuous"),
            "auto_balance":              _id("custom_game_setting_auto_balance"),
            "intro":                     _id("custom_game_setting_intro"),
            "team_switching":            _id("custom_game_setting_team_switching"),
            "physics":                   _id("custom_game_setting_physics"),
            "instagib":                  _id("custom_game_setting_instagib"),
            "ready_percentage":          _id("custom_game_setting_ready_percentage"),
            "warmup_time":               _id("custom_game_setting_warmup_time"),
            "min_players":               _id("custom_game_setting_min_players"),
            "max_clients":               _id("custom_game_setting_max_clients"),
            "join_key":                  _id("custom_lobby_join_link_input"),
            "model":                     _id("custom_game_setting_model"),
            "commands":                  _id("custom_game_setting_commands"),
            "netcode":                   _id("custom_game_setting_netcode"),
            "spawn_farthest_chance":     _id("custom_game_spawn_farthest_chance"),
            "spawn_farthest_foe_chance": _id("custom_game_spawn_farthest_foe_chance"),
            "spawn_farthest_threshold":  _id("custom_game_spawn_farthest_threshold"),
            "spawn_random_chance":       _id("custom_game_spawn_random_chance"),
            "spawn_safety_radius":       _id("custom_game_spawn_safety_radius"),
        };
    
        global_gameSlotList = [
            _id("custom_game_player_slot_0"),
            _id("custom_game_player_slot_1"),
            _id("custom_game_player_slot_2"),
            _id("custom_game_player_slot_3"),
            _id("custom_game_player_slot_4"),
            _id("custom_game_player_slot_5"),
            _id("custom_game_player_slot_6"),
            _id("custom_game_player_slot_7"),
            _id("custom_game_player_slot_8"),
            _id("custom_game_player_slot_9"),
            _id("custom_game_player_slot_10"),
            _id("custom_game_player_slot_11"),
            _id("custom_game_player_slot_12"),
            _id("custom_game_player_slot_13"),
            _id("custom_game_player_slot_14"),
            _id("custom_game_player_slot_15"),
        ];
    
        global_specSlotList = Array.from(_id("custom_screen_spectators_box").children);
    
        global_teamContainers = [
            document.querySelector("#custom_team_0 > .custom_team_players"),
            document.querySelector("#custom_team_1 > .custom_team_players"),
            document.querySelector("#custom_team_2 > .custom_team_players"),
            document.querySelector("#custom_team_3 > .custom_team_players"),
            document.querySelector("#custom_team_4 > .custom_team_players"),
            document.querySelector("#custom_team_5 > .custom_team_players"),
            document.querySelector("#custom_team_6 > .custom_team_players"),
            document.querySelector("#custom_team_7 > .custom_team_players"),
            document.querySelector("#custom_team_8 > .custom_team_players"),
            document.querySelector("#custom_team_9 > .custom_team_players")
        ];
    
        global_teamColorList = [
            _id("custom_team_color_0"),
            _id("custom_team_color_1"),
            _id("custom_team_color_2"),
            _id("custom_team_color_3"),
            _id("custom_team_color_4"),
            _id("custom_team_color_5"),
            _id("custom_team_color_6"),
            _id("custom_team_color_7"),
            _id("custom_team_color_8"),
            _id("custom_team_color_9"),
        ];
}

function init_screen_custom() {

    _for_each_with_class_in_parent(_id("custom_game_player_slots"), "custom_team_group", function(el) {
        global_customTeams.push(el);
        global_customTeamNames.push(el.firstElementChild.children[1]);
    });
    
    /***************************
     * SETUP CUSTOM GAME OPTIONS
     */
    for (let i=0; i<global_customTeamNames.length; i++) {
        // Set default team name
        global_customTeamNames[i].value = custom_teamNames[i];
        global_input_debouncers['custom_game_team_name_'+i] = new InputDebouncer(function() {
            if (bool_am_i_host) custom_game_settings_changed();
        }, 600);
    }
    global_input_debouncers['custom_game_setting_name'] = new InputDebouncer(function() {
        if (bool_am_i_host) custom_game_settings_changed();
    }, 600);

    // Commands textarea
    global_input_debouncers['custom_game_setting_commands'] = new InputDebouncer(function() {
        if (bool_am_i_host) custom_game_settings_changed();
    }, 1000);
    global_customSettingElements["commands"].addEventListener("focus", function() {
        global_customSettingElements["commands"].classList.add("focused");
    });
    global_customSettingElements["commands"].addEventListener("blur", function() {
        global_customSettingElements["commands"].classList.remove("focused");
        if (bool_am_i_host) {
            update_variable("string", "lobby_custom_commands", global_customSettingElements["commands"].value.replace(/[\s\n\r]+/g, '').trim());
            custom_game_settings_changed();
        }
    });
    ui_setup_select(global_customSettingElements["visibility"], function(opt, field) {
        if (bool_am_i_host) {
            update_variable("string", field.dataset.variable, opt.dataset.value);

            if (opt.dataset.value == "0") {
                global_customSettingElements["auto_balance"].dataset.value = "1";
            } else {
                global_customSettingElements["auto_balance"].dataset.value = "0";
            }
            update_select(global_customSettingElements["auto_balance"]);

            update_custom_game_visibility();
            custom_lobby_setting_updated(field.dataset.variable, opt.dataset.value);
        }
    });
    ui_setup_select(global_customSettingElements["mode"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["team_count"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["team_size"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["time_limit"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["score_limit"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["continuous"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["instagib"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["intro"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["auto_balance"], function() {
        if (bool_am_i_host) custom_game_settings_changed();
    });
    // Select fields should already be initialized with the correct values at this point
    if (global_customSettingElements["visibility"].dataset.value == "0") {
        global_customSettingElements["auto_balance"].dataset.value = "1";
    } else {
        global_customSettingElements["auto_balance"].dataset.value = "0";
    }
    update_select(global_customSettingElements["auto_balance"]);

    ui_setup_select(global_customSettingElements["team_switching"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["physics"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["ready_percentage"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["warmup_time"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["min_players"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["max_clients"], custom_update_variable_if_host);
    ui_setup_select(global_customSettingElements["model"], function() {
        if (bool_am_i_host) custom_game_settings_changed();
    });
    ui_setup_select(global_customSettingElements["netcode"], function() {
        if (bool_am_i_host) custom_game_settings_changed();
    });
    ui_setup_select(global_customSettingElements["spawn_farthest_chance"], function() {
        if (bool_am_i_host) custom_game_settings_changed();
    });
    ui_setup_select(global_customSettingElements["spawn_farthest_foe_chance"], function() {
        if (bool_am_i_host) custom_game_settings_changed();
    });
    ui_setup_select(global_customSettingElements["spawn_farthest_threshold"], function() {
        if (bool_am_i_host) custom_game_settings_changed();
    });
    ui_setup_select(global_customSettingElements["spawn_random_chance"], function() {
        if (bool_am_i_host) custom_game_settings_changed();
    });
    global_input_debouncers['custom_game_spawn_safety_radius'] = new InputDebouncer(function() {
        if (bool_am_i_host) custom_game_settings_changed();
    }, 1000);
    

    // Checkbox logic here is independent of other checkboxes which are saved
    _for_each_in_class("checkbox_logic", function(el){
        el.addEventListener("click", function(){
            if (el.classList.contains("disabled")) return;
            
            if (el.dataset.enabled == 1) {
                el.dataset.enabled = 0;
                el.classList.remove("checkbox_enabled");
                el.firstElementChild.classList.remove("inner_checkbox_enabled");
                engine.call('ui_sound', 'ui_uncheck_box');
            } else {
                el.dataset.enabled = 1;
                el.classList.add("checkbox_enabled");
                el.firstElementChild.classList.add("inner_checkbox_enabled");
                engine.call('ui_sound', 'ui_check_box');
            }
        });
    });

    // Updates the datacenter selection list
    bind_event('set_server_menu_content', function (code) {
        let tmp = _createElement("div");
        let fragment = new DocumentFragment();
        tmp.innerHTML = code;

        var locs = tmp.childNodes;
        var locs_arr = [];
        for (let i=0; i<locs.length; i++) {
            if (locs[i].nodeType == 1) {
                locs_arr.push(locs[i]);

                if (locs[i].dataset.value.startsWith("ip_")) {
                    global_self.lan_ip = locs[i].dataset.value.substring(3);
                    locs[i].dataset.value = "lan";
                    locs[i].textContent = "Direct/LAN";
                }
            }
        }

        locs_arr.sort(function(a, b) { 
            if (a.textContent.startsWith("Direct")) { return 1; }
            if (b.textContent.startsWith("Direct")) { return -1; }
            return a.textContent == b.textContent ? 0 : (a.textContent > b.textContent ? 1 : -1); 
        });
          
        for (let i=0; i<locs_arr.length; i++) {
            // Hide non functional LAN option for now
            //if (locs_arr[i].textContent.startsWith("Direct")) continue;
            fragment.appendChild(locs_arr[i]);
        }

        _empty(global_customSettingElements["location"]);
        global_customSettingElements["location"].appendChild(fragment);

        delete tmp;
        delete fragment;

        ui_setup_select(global_customSettingElements["location"], function(opt, field) {
            if (bool_am_i_host) {
                update_variable("string", field.dataset.variable, opt.dataset.value);
                custom_game_settings_changed();
            }
        });
    });

    // Add color change listener
    _for_each_with_class_in_parent(_id("custom_screen_content"), "color-picker-new", function(el, i){
        el.onchange = function(){ 
            let team_idx = Number(this.closest(".custom_team_group").dataset.team);
            teamColorChanged(team_idx, "#" + el.value);
            custom_game_settings_changed();
        };
    });
    
    // Updates the maplist choices (triggered by "on_custom_game_mode_changed")
    bind_event("set_map_choices", function (maps_json, selected) {      
        let maps = [];  
        try {
            maps = JSON.parse(maps_json);
        } catch(e) {
            console.log("Error parsing maps_json", e.message);
        }

        if (selected.length == 0 && global_lobby_selected_map.length != 0) {
            selected = global_lobby_selected_map;
        }

        let fragment = new DocumentFragment();
        maps.sort();

        for (let m of maps) {
            let map = _createElement("div", "map");
            map.style.backgroundImage = 'url(map_thumbnails/'+m+'.png)';
            map.addEventListener("click", function() {
                map_selected(map, m);
            });
            map.appendChild(_createElement("div", "text", _format_map_name(m)));
            
            if (m == selected) {
                map.classList.add("thumb_selected");
                map.children[0].classList.add("selected");
            }

            fragment.appendChild(map);
        }
        fragment.appendChild(_createElement("div", "spacer"));

        let cont = _id("map_choice_container_inner");
        _empty(cont);
        cont.appendChild(fragment);
    });

    _for_each_in_class("custom_component", function (element) {
        var current_variable = element.dataset.variable;
        if (current_variable) {
            engine.call("initialize_custom_component_value", current_variable);
        }
    });

    for (var i = 0; i < window.MAX_PLAYER_SLOTS; i++){
        var copied_index = i;
        (function(index){
            dropElement(_id("custom_game_player_slot_" + index), function(ev, clone){
                engine.call('ui_sound', 'ui_drop1');

                let max_slots = parseInt(global_customSettingElements["team_size"].dataset.value);
                let from = {};
                let to = slotIDXToTeamSlot(index, max_slots);
                if (parseInt(clone.dataset.type) == -1) {
                    // Origin is a spec slot
                    from = {"team": -1, "slot": parseInt(clone.dataset.slot) };
                } else if (parseInt(clone.dataset.type) == 0) {
                    // Origin is a team slot
                    from = slotIDXToTeamSlot(parseInt(clone.dataset.slot), max_slots);
                }
                send_json_data({"action": "lobby-swap", "from": from, "to": to});
            });

        }(copied_index));
    }

    dropElement(_id("custom_screen_spectators_box"), function(ev, clone){
        engine.call('ui_sound', 'ui_drop1');

        let max_slots = parseInt(global_customSettingElements["team_size"].dataset.value);
        let from = {};
        if (parseInt(clone.dataset.type) == -1) {
            from = {"team": -1, "slot": parseInt(clone.dataset.slot) };
        } else {
            from = slotIDXToTeamSlot(parseInt(clone.dataset.slot), max_slots);
        }
        
        send_json_data({"action": "lobby-swap", "from": from, "to": {"team": -1, "slot": 0} });
    });
}

function custom_update_variable_if_host(opt, field) {
    if (bool_am_i_host) {
        update_variable("string", field.dataset.variable, opt.dataset.value);
        custom_lobby_setting_updated(field.dataset.variable, opt.dataset.value);
    }
}

// Set the map selection
// set_lobby_custom_map is called when host selects a different map or switches to a different mode that doesn't include the current map in its map list
function set_lobby_custom_map(value) {
    _for_each_in_class("custom_component",function(el) {
        
        if (el.dataset.variable == "lobby_custom_map") {
            el.dataset.value = value;

            global_lobby_selected_map = value;
            _html(el, "<div>"+_format_map_name(value)+"</div>");
            el.style.backgroundImage = "url('map_thumbnails/" + value + ".png')";

            // Only send update when the user selected the map manually, not when e.g. the mode is changed and the map with it, to prevent double updates
            if (custom_lobby_map_selected) {
                custom_game_settings_changed();
                custom_lobby_map_selected = false;
            }
        }
        
    });
}

function set_lobby_custom_commands(value) {
    _for_each_in_class("custom_component",function(el) {
        if (el.dataset.variable == "lobby_custom_commands") {
            let commands_str = '';
            let commands_list = value.split(';');
            for (let c of commands_list) {
                if (!c.trim().length) continue;
        
                let pair = c.split(":");
                if (pair.length != 2) continue;
        
                commands_str += update_custom_command(pair[0], pair[1]);
            }
            el.value = commands_str;
        }            
    });
}

function set_lobby_datacenter(value) {
    if (value.trim().length == 0 || value.trim() == '""' || value.trim() == "''") {
        let best_regions = get_best_regions_by_ping();
        if (best_regions.length) {
            update_variable("string", "lobby_custom_datacenter", best_regions[0]);
            value = best_regions[0];
        } else {
            update_variable("string", "lobby_custom_datacenter", "lan");
            value = "lan";
        }
    }

    if (global_customSettingElements["location"]) {
        let found = false;
        let options = global_customSettingElements["location"].querySelectorAll(".select-option");
        for (let i=0; i<options.length; i++) {
            if (options[i].dataset.value == value) {
                found = true;
                break;
            }
        }

        if (!found) value = "lan";
    }

    return value;
}

function lobby_join_key_hide() {
    let el = _id("custom_lobby_join_link");
    el.querySelector(".hide").style.display = "none";
    el.querySelector(".show").style.display = "flex";
    _id("custom_lobby_join_link_input").style.display = "none";
    _id("custom_lobby_join_link_hidden").style.display = "flex";
    cleanup_floating_containers();
}
function lobby_join_key_show() {
    let el = _id("custom_lobby_join_link");
    el.querySelector(".hide").style.display = "flex";
    el.querySelector(".show").style.display = "none";
    _id("custom_lobby_join_link_input").style.display = "flex";
    _id("custom_lobby_join_link_hidden").style.display = "none";
    cleanup_floating_containers();
}

function lobby_copy_key() {
    engine.call("copy_text",global_customSettingElements["join_key"].textContent);
}

function lobby_password_edit() {
    if (bool_am_i_host) {
        let input = _id("custom_game_setting_password");
        input.value = "";
        input.style.display = "flex";
        input.focus();
        _id("custom_game_password_set").style.display = "none";
    }
}

function lobby_password_blur(e) {
    set_lobby_password(e.currentTarget.value);
    e.preventDefault();
}

function lobby_password_keydown(e) {
    if (e.keyCode == 13) { //return
        e.currentTarget.blur();
    }
}

function set_lobby_password(password) {
    send_string(CLIENT_COMMAND_LOBBY_UPDATE_PASSWORD, password);

    if (bool_am_i_host) {
        _id("custom_game_setting_password").style.display = "none";
        _id("custom_game_password_set").style.display = "flex";
    }
}

function custom_lobby_setting_updated(variable, value) {
    //console.log("### custom lobby setting changed", variable, value);

    if (bool_am_i_host) {
        if (variable == "lobby_custom_mode") {
            custom_game_mode_changed(true);
        } else if (variable == "lobby_custom_teams") {
            custom_game_number_of_teams_changed(parseInt(global_customSettingElements["team_count"].dataset.value), true);
        } else if (variable == "lobby_custom_team_size") {
            custom_game_number_of_teams_changed(parseInt(global_customSettingElements["team_count"].dataset.value), true);
        } else {
            custom_game_settings_changed();
        }
    }
}

function create_custom_lobby() {
    if (global_lobby_id == -1 && bool_am_i_leader) {
        // Set default team name
        for (let i=0; i<global_customTeamNames.length; i++) {
            global_customTeamNames[i].value = custom_teamNames[i];
        }

        send_json_data({"action": "lobby-create", "settings": get_lobby_settings() });
        open_play("play_screen_custom");
    }
}

function leave_custom_lobby_action() {
    open_play("play_screen_custom");
}

function open_lobby() {
    open_play("play_screen_custom");
}

function leave_custom_lobby() {
    if (bool_am_i_leader) {
        global_lobby_id = -1;
        send_json_data({"action": "lobby-leave"});
        //leave_custom_lobby_action();
        update_friend_lobby_invite_button();
    } else {
        genericModal(localize("modal_leave_lobby_and_party_title"), localize("modal_leave_lobby_and_party_text"), localize("menu_button_cancel"), undefined, localize("menu_button_confirm"), function() {
            global_lobby_id = -1;
            send_json_data({"action": "lobby-leave"});
            //leave_custom_lobby_action();
            update_friend_lobby_invite_button();
        });
    }
}

function update_friend_lobby_invite_button() {
    _for_each_with_class_in_parent(_id("friends_list_container_inthegame"), "invite_contact", function(el) {
        if (global_lobby_id == -1) {
            el.style.display = "none";
        } else {
            el.style.display = "flex";
        }
    });
    _for_each_with_class_in_parent(_id("friends_list_container_online"), "invite_contact", function(el) {
        if (global_lobby_id == -1) {
            el.style.display = "none";
        } else {
            el.style.display = "flex";
        }
    });
}

function teamColorChanged(team_idx, newColor) {
    custom_teamColors[team_idx] = newColor;

    global_teamColorList[team_idx].jscolor.fromString(newColor);

    global_teamContainers[team_idx].parentElement.style.setProperty("--team_color", newColor);
}

function start_custom_game(btn) {
    if (btn.classList.contains("locked")) return;
    
    send_json_data({"action": "lobby-start"});
}

function custom_game_settings_changed(send_only) {
    // Don't send anything if we aren't actually in a lobby
    if (global_lobby_id == -1) return;

    let settings = get_lobby_settings();

    // Make sure the values get stored in the engine
    if (bool_am_i_host) {
        if (!send_only) {
            update_variable("string", "lobby_custom_team_size", global_customSettingElements["team_size"].dataset.value);
            update_variable("string", "lobby_custom_teams", global_customSettingElements["team_count"].dataset.value);
        }

        send_lobby_settings(settings);
    }
    
}

// Buffered lobby settings update
let global_send_lobby_settings_timeout = undefined;
function send_lobby_settings(settings) {
    if (global_send_lobby_settings_timeout !== undefined) {
        clearTimeout(global_send_lobby_settings_timeout);
        global_send_lobby_settings_timeout = undefined;
    }

    global_send_lobby_settings_timeout = setTimeout(() => {
        send_json_data({"action": "lobby-settings", "settings": settings });
        global_send_lobby_settings_timeout = undefined;
    }, 1);
}

function custom_game_mode_changed(send_update) {
    var mode = global_customSettingElements["mode"].dataset.value;
    let container_team_count = _id("custom_setting_team_count");
    let container_team_size = _id("custom_setting_team_size");
    let container_time_limit = _id("custom_setting_time_limit");
    let container_score_limit = _id("custom_setting_score_limit");

    // Update team size option
    if (CUSTOM_SOLO_MODES.includes(mode)) {
        global_customSettingElements["team_size"].dataset.value = 1;
        update_select(global_customSettingElements["team_size"]);
        container_team_size.style.display = "none";
    } else {
        container_team_size.style.display = "flex";
    }

    // Update team count option
    if (CUSTOM_MULTI_TEAM_MODES.includes(mode)) {
        container_team_count.style.display = "flex";
    } else {
        global_customSettingElements["team_count"].dataset.value = 2;
        update_select(global_customSettingElements["team_count"]);
        container_team_count.style.display = "none";
    }

    // Update time limit & score limit options
    if (CUSTOM_ROUND_BASED_MODES.includes(mode)) {
        container_time_limit.style.display = "none";
        container_score_limit.querySelector(".setting_title").textContent = localize("custom_game_settings_round_limit");
        custom_update_score_limit_options(CUSTOM_ROUND_LIMITS);
    } else {
        container_time_limit.style.display = "flex";
        if (mode == "ctf") {
            container_score_limit.querySelector(".setting_title").textContent = localize("custom_game_settings_capture_limit");
            custom_update_score_limit_options(CUSTOM_CAPTURE_LIMITS);
        } else {
            container_score_limit.querySelector(".setting_title").textContent = localize("custom_game_settings_score_limit");
            custom_update_score_limit_options(CUSTOM_FRAG_LIMITS);
        }
    }

    // Update score limit option for special modes
    if (CUSTOM_TIMELIMIT_ONLY_MODES.includes(mode)) {
        container_score_limit.style.display = "none";
    } else {
        container_score_limit.style.display = "flex";
    }

    custom_game_number_of_teams_changed(parseInt(global_customSettingElements["team_count"].dataset.value), false);

    /*
    if (mode == "race") {
        let refNode = _id('custom_setting_location');
        let parentNode = refNode.parentNode;
        _id("custom_game_setting_physics").classList.remove("theme_modal");
        parentNode.insertBefore(_id('custom_setting_physics'),refNode);
    } else {
        let refNode = _id('custom_setting_instagib');
        let parentNode = refNode.parentNode;
        _id("custom_game_setting_physics").classList.add("theme_modal");
        parentNode.insertBefore(_id('custom_setting_physics'),refNode);
    }
    */
    
    // Trigger map selection list update and map choice update
    engine.call("on_custom_game_mode_changed", mode, global_customSettingElements["map"].dataset.value || "");

    if (send_update) {
        custom_game_settings_changed();
    }
}

function custom_update_score_limit_options(options) {
    let score_limit_select = _id("custom_game_setting_score_limit");
    _empty(score_limit_select);

    let score_limit_changed = false;
    let changed_opt = undefined;
    if (!options.includes(Number(global_customSettingElements["score_limit"].dataset.value))) {
        global_customSettingElements["score_limit"].dataset.value = options[0];
        score_limit_changed = true;
    }

    for (let limit of options) {
        let opt = _createElement("div");
        opt.dataset.value = limit;
        if (limit == 0) {
            opt.textContent = localize("score_unlimited");
        } else {
            opt.textContent = limit;
        }

        if (limit == global_customSettingElements["score_limit"].dataset.value) {
            opt.dataset.selected = 1;
            changed_opt = opt;
        }
        score_limit_select.appendChild(opt);
    }

    ui_setup_select(global_customSettingElements["score_limit"], custom_update_variable_if_host);
    if (score_limit_changed) {
        custom_update_variable_if_host(changed_opt, global_customSettingElements["score_limit"]);
    }
}

function custom_game_number_of_teams_changed(numOfTeams, sendUpdate) {
    //console.log("custom_game_number_of_teams_changed", numOfTeams);
    var teamSize = parseInt(global_customSettingElements["team_size"].dataset.value);

    var mode = global_customSettingElements["mode"].dataset.value;

    var totalPlayers = numOfTeams * teamSize;
    var maxPlayers = 16;

    if (!CUSTOM_MULTI_TEAM_MODES.includes(mode)) {
        numOfTeams = 2;
    } else if (totalPlayers > maxPlayers) {
        teamSize = Math.floor(maxPlayers / numOfTeams)
        global_customSettingElements["team_size"].dataset.value = teamSize;
        update_select(global_customSettingElements["team_size"]);
    }

    if (CUSTOM_SOLO_MODES.includes(mode)) {
        teamSize = 1;
    }

    if (teamSize == 1) {
        _for_each_with_class_in_parent(_id("custom_game_player_slots"), "custom_team_name", function(el) { el.classList.add("solo"); });
        for (let team of global_customTeams) {
            team.classList.add("solo");
            team.firstElementChild.classList.add("solo");
        }
    } else {
        _for_each_with_class_in_parent(_id("custom_game_player_slots"), "custom_team_name", function(el) { el.classList.remove("solo"); });
        for (let team of global_customTeams) {
            team.classList.remove("solo");
            team.firstElementChild.classList.remove("solo");
        }
    }

    for (let team of global_customTeams) {
        team.style.display = "none";
    }
    /*
    _for_each_with_class_in_parent(_id("custom_game_player_slots"), "custom_team_group", function(el) {
        el.style.display = "none";
    });
    */

    moveSlotToRightTeam(teamSize, numOfTeams);
            
    for (let i=0; i < numOfTeams; i++) {
        global_customTeams[i].style.display = "flex";
        //_id("custom_team_"+i).style.display = "flex";
    }

    if (sendUpdate) {
        custom_game_settings_changed();
    }
}

function moveSlotToRightTeam(teamSize, numOfTeams) {
    if (numOfTeams === 1) {
        for (i=0; i<global_gameSlotList.length; i++) {
            if (i < teamSize) {
                global_teamContainers[0].appendChild(global_gameSlotList[i]);
            } else {
                _id("custom_no_team_slot").appendChild(global_gameSlotList[i]);
                _empty(global_gameSlotList[i].firstElementChild);
            }
        }
    } else {
        for (i=0; i<global_gameSlotList.length; i++) {
            if (i < teamSize * 1) {
                global_teamContainers[0].appendChild(global_gameSlotList[i]);
            } else if (i < teamSize * 2 && numOfTeams >= 2) {
                global_teamContainers[1].appendChild(global_gameSlotList[i]);
            } else if (i < teamSize * 3 && numOfTeams >= 3) {
                global_teamContainers[2].appendChild(global_gameSlotList[i]);
            } else if (i < teamSize * 4 && numOfTeams >= 4) {
                global_teamContainers[3].appendChild(global_gameSlotList[i]);
            } else if (i < teamSize * 5 && numOfTeams >= 5) {
                global_teamContainers[4].appendChild(global_gameSlotList[i]);
            } else if (i < teamSize * 6 && numOfTeams >= 6) {
                global_teamContainers[5].appendChild(global_gameSlotList[i]);
            } else if (i < teamSize * 7 && numOfTeams >= 7) {
                global_teamContainers[6].appendChild(global_gameSlotList[i]);
            } else if (i < teamSize * 8 && numOfTeams >= 8) {
                global_teamContainers[7].appendChild(global_gameSlotList[i]);
            } else if (i < teamSize * 9 && numOfTeams >= 9) {
                global_teamContainers[8].appendChild(global_gameSlotList[i]);
            } else if (i < teamSize * 10 && numOfTeams >= 10) {
                global_teamContainers[9].appendChild(global_gameSlotList[i]);
            } else {
                _id("custom_no_team_slot").appendChild(global_gameSlotList[i]);
                _empty(global_gameSlotList[i].firstElementChild);
            }
        }
    }
}

function thumbnail_button_map(element) {
    engine.call("set_modal", true);

    open_modal_screen("map_choice_modal_screen", function() {
        
        refreshScrollbar(_id("map_choice_container"));
        /*
        resetScrollbar(_id("map_choice_container"));
        */
    });
}

function map_selected(element, map_name) {
    if (bool_am_i_host) {
        custom_lobby_map_selected = true;
        engine.call("custom_game_map_selected", map_name);
        _for_each_with_class_in_parent(element.parentElement, 'thumb_selected', function(el) {
            el.classList.remove('thumb_selected');
            el.children[0].classList.remove('selected');
        });
        element.classList.add('thumb_selected');
        element.children[0].classList.add('selected');
        close_modal_screen_by_selector('map_choice_modal_screen');
    }
}

function handle_invite_event(data) {
    //console.log("== handle_invite_event",data.action, _dump(data));
    if (data.action == "invite-list") {
        update_friendlist_invites(data.list);
    }

    if (data.action == "invite-add") {
        if (data.type == "lobby" && global_lobby_id == data['type-id']) return;
        if (data.type == "party" && global_party.id == data['type-id']) return;
        
        let title = '';
        let text = data['from-name']+" ";
        if (data.type == "lobby") {
            title = localize("friends_list_title_lobby_invite");
            text += localize("friends_list_state_lobby_invite_in");
        }
        if (data.type == "party") {
            title = localize("friends_list_title_party_invite");
            text += localize("friends_list_state_party_invite_in");
        }

        queue_dialog_msg({
            "title": title,
            "msg": text,
            "duration": 20000,
            "options": [
                {
                    "button": "accept",
                    "label": localize("friends_list_action_accept"),
                    "callback": function() {
                        send_invite_accept(data['type'], data['type-id']);
                    }
                }, 
                {
                    "button": "decline",
                    "label": localize("friends_list_action_decline"),
                    "callback": function() {
                        send_invite_decline(data['type'], data['type-id']);
                    }
                }, 
            ]
        });
    }
}
function handle_party_event(data) {
    //console.log("== handle_party_event",data.action, _dump(data));
    if (data.action == "party-status") {
        let init = false;
        if (global_party.id == -1) init = true;

        if (global_party.id != data['party-id']) {
            main_chat_reset("party");
        }

        global_self.user_id = data['user-id'];

        global_party.id = data['party-id'];
        global_party.privacy = data['privacy'];
        global_party.size = Object.keys(data.data.members).length;

        // Set the watermark
        //_id("watermark").textContent = global_self.user_id.substring(global_self.user_id.length / 2, global_self.user_id.length - 2);

        update_party_leader_status(data['leader']);
        update_party(data);
        update_friendlist_party(data);

        if ((init || data.init == true) && bool_am_i_leader) {
            global_send_region_selection = true;
            engine.call("initialize_select_value", "lobby_region");
        } else {            
            if ("locations" in data) {
                set_region_selection(false, data.locations);
            }
        }

        if (data.init == true) {
            process_queue_msg("all", "stop");
        }

        global_party["modes"] = data.data["modes"];
        global_party["roles"] = data.data["roles"];
        global_party["role-reqs"] = data.data["role-reqs"];
        update_queue_mode_selection();
        update_role_selection();
        update_warmup_buttons();

        if (global_lobby_id != data['lobby-id']) {
            send_json_data({"action": "lobby-status"});
        }

        return;

    } else if (data.action == "party-update-modes") {

        global_party["modes"] = data.data["modes"];
        global_party["roles"] = data.data["roles"];
        global_party["role-reqs"] = data.data["role-reqs"];
        update_queue_mode_selection();
        update_role_selection();
        return;

    } else if (data.action == "party-queue-action") {

        process_queue_msg(data.type, data.msg);
        return;

    }
}

function update_party_leader_status(leader) {
    let leader_status_changed = false;
    if (bool_am_i_leader != leader) {
        leader_status_changed = true;
        bool_am_i_leader = leader;

        if (bool_am_i_leader) send_view_data("hud", "string", "party-leader");
        else send_view_data("hud", "string", "party-member");
    }

    if (bool_am_i_leader) {
        for (let el of global_party_leader_elements) el.style.display = "flex";
    } else {
        for (let el of global_party_leader_elements) el.style.display = "none";
    }

    // Change search_nearby and region selection in the party to the new leaders settings
    if (leader_status_changed && bool_am_i_leader) {
        global_send_region_selection = true;
        engine.call("initialize_checkbox_value","lobby_region_search_nearby");
        engine.call("initialize_select_value","lobby_region");
    }
}
function handle_lobby_event(data) {
    //console.log("== handle_lobby_event",data.action, _dump(data));

    if (data.action == "lobby-status") {

        let promoted = set_lobby_host(data.host);
        
        if (data.data.admins) global_lobby_admins = data.data.admins;
        else global_lobby_admins = [];

        let init = false;
        if (global_lobby_id < 0 || data['lobby-action'] == "join") {
            init = true;
        }

        if (global_lobby_id != data['lobby-id']) {
            main_chat_reset("lobby");
        }
        global_lobby_id = data['lobby-id'];

        update_custom_game_settings(data.data.settings, init);
        update_custom_game_teams(data['user-id'], data.data.teams, data.data.settings.team_count, data.data.settings.team_size);

        if (data['lobby-action'] == "join") {
            update_friend_lobby_invite_button();

            open_play("play_screen_custom");
        }

        if (promoted) {
            lobby_join_key_hide();
            custom_game_settings_changed();
        }
    }

    if (data.action == "lobby-start-error") {
        let msg = new DocumentFragment();
        msg.appendChild(_createElement("div", "", localize(data.msg)));
        if (data.blocking_users) {
            msg.appendChild(_createElement("div", "", data.blocking_users.join(", ")));
        }
        queue_dialog_msg({
            //"title": localize("title_info"),
            "msg": msg,
        });
    }

    if (data.action == "lobby-gone") {
        if (global_lobby_id >= 0) {
            global_lobby_id = -1;
            main_chat_reset("lobby");

            if (global_menu_page == "play_panel" && (global_play_menu_page == "play_screen_customlist" || global_play_menu_page == "play_screen_custom")) {
                leave_custom_lobby_action();
            } else {
                if (global_play_menu_page == "play_screen_customlist" || global_play_menu_page == "play_screen_custom") {
                    // Change custom screen in the background
                    play_screen_open_custom(false, "play_screen_customlist");
                }
            }
        }
        update_friend_lobby_invite_button();

        lobby_hide_loading_overlay();

        setTimeout(() => { reset_lobby_settings(); },250);
    }

    if (data.action == "lobby-leave") {
        global_lobby_id = -1;
        main_chat_reset("lobby");
        if (global_menu_page == "play_panel" && (global_play_menu_page == "play_screen_customlist" || global_play_menu_page == "play_screen_custom")) {
            leave_custom_lobby_action();
        } else {
            if (global_play_menu_page == "play_screen_customlist" || global_play_menu_page == "play_screen_custom") {
                // Change custom screen in the background
                play_screen_open_custom(false, "play_screen_customlist");
            }
        }
        update_friend_lobby_invite_button();

        lobby_hide_loading_overlay();

        lobby_join_key_hide();

        setTimeout(() => { reset_lobby_settings(); },250);
    }

    if (data.action == "lobby-match-requested") {
        let overlay = _id("match_loading_overlay");
        overlay.querySelector(".spinner-icon").classList.add("running");
        let btn = _id("custom_game_button_startrem");
        anim_show(overlay, 10);
        btn.classList.add("locked");
    }
    if (data.action == "lobby-match-confirmed") {
        lobby_hide_loading_overlay();
    }
    if (data.action == "lobby-match-error") {
        lobby_hide_loading_overlay();
        set_draft_visible(false);
        handle_mm_match_cancelled();
    }
    
    if (global_lobby_id < 0) {
        _id("open_lobby_button").style.display = "none";
        main_chat_lobby_visibility(false);
    } else {
        _id("open_lobby_button").style.display = "flex";
        main_chat_lobby_visibility(true);
    }
}

// Resets lobby settings back to whats stored in our own config
function reset_lobby_settings() {
    engine.call("initialize_select_value", "lobby_visibility");
    engine.call("initialize_select_value", "lobby_custom_mode");
    engine.call("initialize_select_value", "lobby_custom_teams");
    engine.call("initialize_select_value", "lobby_custom_team_size");
    engine.call("initialize_select_value", "lobby_custom_duration");
    engine.call("initialize_select_value", "lobby_custom_score_limit");
    engine.call("initialize_select_value", "lobby_custom_datacenter");

    engine.call("initialize_select_value", "lobby_custom_intro");
    engine.call("initialize_select_value", "lobby_custom_physics");
    engine.call("initialize_select_value", "lobby_custom_continuous");
    engine.call("initialize_select_value", "lobby_custom_warmup_time");
    engine.call("initialize_select_value", "lobby_custom_team_switching");
    engine.call("initialize_select_value", "lobby_custom_min_players");
    engine.call("initialize_select_value", "lobby_custom_max_clients");
    engine.call("initialize_select_value", "lobby_custom_ready_percentage");

    // Reset variable-less options back to their defaults
    if (global_customSettingElements["visibility"].dataset.value == "0") {
        global_customSettingElements["auto_balance"].dataset.value = "1";
    } else {
        global_customSettingElements["auto_balance"].dataset.value = "0";
    }
    update_select(global_customSettingElements["auto_balance"]);
    global_customSettingElements["model"].dataset.value = "0";
    update_select(global_customSettingElements["model"]);
    global_customSettingElements["netcode"].dataset.value = "2";
    update_select(global_customSettingElements["netcode"]);
    global_customSettingElements["spawn_farthest_chance"].dataset.value = "0";
    update_select(global_customSettingElements["spawn_farthest_chance"]);
    global_customSettingElements["spawn_farthest_foe_chance"].dataset.value = "1";
    update_select(global_customSettingElements["spawn_farthest_foe_chance"]);
    global_customSettingElements["spawn_farthest_threshold"].dataset.value = "3";
    update_select(global_customSettingElements["spawn_farthest_threshold"]);
    global_customSettingElements["spawn_random_chance"].dataset.value = "0";
    update_select(global_customSettingElements["spawn_random_chance"]);
    global_customSettingElements["spawn_safety_radius"].value = "0";
    global_customSettingElements["commands"].value = "";

    custom_game_mode_changed(false);
}

// Reset lobby "more settings" back to the game default values
function lobby_reset_settings_default() {

    update_variable("string", "lobby_custom_intro", "0");
    update_variable("string", "lobby_custom_physics", "0");
    update_variable("string", "lobby_custom_warmup_time", "-1");
    update_variable("string", "lobby_custom_min_players", "2");
    update_variable("string", "lobby_custom_max_clients", "16");
    update_variable("string", "lobby_custom_ready_percentage", "1");
    update_variable("string", "lobby_custom_commands", "");

    if (global_customSettingElements["visibility"].dataset.value == "0") {
        global_customSettingElements["auto_balance"].dataset.value = "1";
    } else {
        global_customSettingElements["auto_balance"].dataset.value = "0";
    }
    update_select(global_customSettingElements["auto_balance"]);
    global_customSettingElements["model"].dataset.value = "0";
    update_select(global_customSettingElements["model"]);
    global_customSettingElements["netcode"].dataset.value = "2";
    update_select(global_customSettingElements["netcode"]);
    global_customSettingElements["spawn_farthest_chance"].dataset.value = "0";
    update_select(global_customSettingElements["spawn_farthest_chance"]);
    global_customSettingElements["spawn_farthest_foe_chance"].dataset.value = "1";
    update_select(global_customSettingElements["spawn_farthest_foe_chance"]);
    global_customSettingElements["spawn_farthest_threshold"].dataset.value = "3";
    update_select(global_customSettingElements["spawn_farthest_threshold"]);
    global_customSettingElements["spawn_random_chance"].dataset.value = "0";
    update_select(global_customSettingElements["spawn_random_chance"]);
    global_customSettingElements["spawn_safety_radius"].value = "0";
    global_customSettingElements["commands"].value = "";

    custom_game_mode_changed(true);
}


function lobby_hide_loading_overlay() {
    let overlay = _id("match_loading_overlay");
    let btn = _id("custom_game_button_startrem");
    anim_hide(overlay, 200, () => {
        overlay.querySelector(".spinner-icon").classList.remove("running");
    });

    // Wait an extra second before unlocking the start match button again
    setTimeout(function() {
        btn.classList.remove("locked");
    }, 1000);
}

function send_invite_decline(type,type_id) {
    send_json_data({"action": "invite-decline", "type": type, "type-id": type_id});
    //hide_dialog();
}

function send_invite_accept(type,type_id) {
    if (type == "lobby") {
        send_json_data({"action": "lobby-join", "lobby-id": type_id});
    }
    if (type == "party") {
        send_json_data({"action": "party-join", "party-id": type_id});
    }
    //hide_dialog();
}

function invite_user(button, user_id, type) {
    if (button.classList.contains("active")) {
        return;
    }

    engine.call('ui_sound', 'ui_click1');

    button.style.opacity = 0.2;
    button.classList.add("active");
    setTimeout(function() {
        button.classList.remove("active");
        button.style.opacity = 1;
    },1000);

    send_json_data({"action": "invite-add", "type": type, "user-id": user_id});
}

function get_lobby_settings() {
    let mode = global_customSettingElements["mode"].dataset.value;
    let visibility = Number(global_customSettingElements["visibility"].dataset.value);
    let team_count = parseInt(global_customSettingElements["team_count"].dataset.value);
    let colors = [];
    if (CUSTOM_MULTI_TEAM_MODES.includes(mode)) {
        for (let i=0; i<team_count; i++) {
            colors.push(custom_teamColors[i]);
        }
    } else {
        colors = [
            custom_teamColors[0],
            custom_teamColors[1]
        ];
    }

    let team_names = [];
    for (let i=0; i<team_count; i++) {
        team_names.push(global_customTeamNames[i].value);
    }

    let commands = [];
    let commands_list = global_customSettingElements["commands"].value.split(';');
    for (let c of commands_list) {
        if (!c.trim().length) continue;

        let pair = c.split(":");
        if (pair.length != 2) continue;

        commands.push({
            "key": pair[0].trim(),
            "value": pair[1].trim(),
        });
    }

	return {
        // Strings:
        private:    (visibility) ? true : false,        
        name:       global_customSettingElements["name"].value,
		mode:       mode,
		map:        global_customSettingElements["map"].dataset.value,
        datacenter: global_customSettingElements["location"].dataset.value,
        lan_ip:     global_self.lan_ip,

        // Array of strings (hex color codes without hash):
        colors: colors,

        // Array of team names (array index = team idx)
        team_names: team_names,

		// Unsigned ints, the conversions to int are critical:
		time_limit:     parseInt(global_customSettingElements["time_limit"].dataset.value),
		score_limit:    parseInt(global_customSettingElements["score_limit"].dataset.value),
		team_count:     team_count,
        team_size:      parseInt(global_customSettingElements["team_size"].dataset.value),
        instagib:       parseInt(global_customSettingElements["instagib"].dataset.value),
        continuous:     parseInt(global_customSettingElements["continuous"].dataset.value),
        auto_balance:   parseInt(global_customSettingElements["auto_balance"].dataset.value),
        intro:          parseInt(global_customSettingElements["intro"].dataset.value),
        team_switching: parseInt(global_customSettingElements["team_switching"].dataset.value),
		physics:        parseInt(global_customSettingElements["physics"].dataset.value),
        warmup_time:    parseInt(global_customSettingElements["warmup_time"].dataset.value),
        min_players:    parseInt(global_customSettingElements["min_players"].dataset.value),
        max_clients:    parseInt(global_customSettingElements["max_clients"].dataset.value),
        model:          parseInt(global_customSettingElements["model"].dataset.value),
        netcode:        parseInt(global_customSettingElements["netcode"].dataset.value),
        spawn_farthest_chance:     Number(global_customSettingElements["spawn_farthest_chance"].dataset.value),
        spawn_farthest_foe_chance: Number(global_customSettingElements["spawn_farthest_foe_chance"].dataset.value),
        spawn_farthest_threshold:  parseInt(global_customSettingElements["spawn_farthest_threshold"].dataset.value),
        spawn_random_chance:       Number(global_customSettingElements["spawn_random_chance"].dataset.value),
        spawn_safety_radius:       Number(global_customSettingElements["spawn_safety_radius"].value),

        // Float
        ready_percentage:  Number(global_customSettingElements["ready_percentage"].dataset.value),

        // Boolean example
        //...:    (parseInt(global_customSettingElements["..."].dataset.enabled) == 1) ? true : false,

        // List of command key/value pairs
        commands: commands
    }
}

function set_lobby_host(host) {
    let became_host = false;
    if (!bool_am_i_host && host) became_host = true;

    bool_am_i_host = host;

    if (bool_am_i_host) {
        _id("custom_game_button_startrem").style.display = 'flex';
        //_id("custom_game_button_inviterem").style.display = 'flex';

        _for_each_with_selector_in_parent(_id("main_menu"), ".custom_game_setting .select-field", function(el) {
            el.classList.remove("disabled");
        });
        _for_each_with_selector_in_parent(_id("main_menu"), ".custom_game_setting input", function(el) {
            _enableInput(el);
        });
        _for_each_with_class_in_parent(_id("custom_screen_content"), "custom_team_name", function(el) {
            if (global_customSettingElements["visibility"].dataset.value == "1") _enableInput(el);
            else _disableInput(el);
        });

        _enableInput(_id("custom_game_setting_commands"));

        _for_each_with_class_in_parent(_id("main_menu"), "custom_game_checkbox", function(el) {
            el.classList.remove("disabled");
        });

        _for_each_with_class_in_parent(_id("custom_screen_content"), "color-picker-new", function(el, i){
            el.classList.remove("jscolor_disabled");
        });

        _id("custom_game_password_set").querySelector(".edit_password").style.display = "block";
        _id("custom_lobby_join_link").style.display = "flex";
    } else {
        _id("custom_game_button_startrem").style.display = 'none';
        //_id("custom_game_button_inviterem").style.display = 'none';
                    
        _for_each_with_selector_in_parent(_id("main_menu"), ".custom_game_setting .select-field", function(el) {
            el.classList.add("disabled");
        });
        _for_each_with_selector_in_parent(_id("main_menu"), ".custom_game_setting input", function(el) {
            _disableInput(el);
        });
        _for_each_with_class_in_parent(_id("custom_screen_content"), "custom_team_name", function(el) {
            _disableInput(el);
        });

        _disableInput(_id("custom_game_setting_commands"));

        _for_each_with_class_in_parent(_id("main_menu"), "custom_game_checkbox", function(el) {
            el.classList.add("disabled");
        });

        _for_each_with_class_in_parent(_id("custom_screen_content"), "color-picker-new", function(el, i){
            el.classList.add("jscolor_disabled");
        });

        _id("custom_game_password_set").querySelector(".edit_password").style.display = "none";
        _id("custom_lobby_join_link").style.display = "none";
    }

    update_custom_game_visibility();

    return became_host;
}

function update_custom_game_visibility() {
    let setting_name = _id("custom_setting_name");
    let setting_password = _id("custom_setting_password");
    if (global_customSettingElements["visibility"].dataset.value == "1") {
        setting_name.style.display = "none";
        setting_password.style.display = "none";
        
        if (bool_am_i_host) {
            global_customSettingElements["continuous"].classList.remove("disabled");
            global_customSettingElements["intro"].classList.remove("disabled");
            global_customSettingElements["team_switching"].classList.remove("disabled");
        }
    } else {
        setting_name.style.display = "flex";
        setting_password.style.display = "flex";

        if (bool_am_i_host) {
            global_customSettingElements["continuous"].classList.add("disabled");
            global_customSettingElements["intro"].classList.add("disabled");
            global_customSettingElements["team_switching"].classList.add("disabled");
        }

        // Set default team name
        for (let i=0; i<global_customTeamNames.length; i++) {
            global_customTeamNames[i].value = custom_teamNames[i];
        }
    }

    update_custom_game_continuous();
}

function update_custom_game_continuous() {
    if (bool_am_i_host) {
        if (global_customSettingElements["continuous"].dataset.value == "1") {
            global_customSettingElements["auto_balance"].classList.remove("disabled");
        } else {
            global_customSettingElements["auto_balance"].classList.add("disabled");
        }
    }
}

let custom_lobby_local_var_update = false;
function update_custom_game_settings(settings, init) {
    //console.log("update_custom_game_settings", _dump(settings));

    let update_teams = false;
    let update_mode = false;
    let update_score = false;

    let visibility = (settings.private) ? 1 : 0;
    if (global_customSettingElements["visibility"].dataset.value != visibility || init) {
        global_customSettingElements["visibility"].dataset.value = visibility;
        update_select(global_customSettingElements["visibility"]);
        update_custom_game_visibility();
    }

    if (global_customSettingElements["name"].value != settings.name) {
        if (!bool_am_i_host || init) {
            global_customSettingElements["name"].value = settings.name;
        }
    }

    if (settings.password) {
        _id("custom_game_password_set").querySelector(".password_icon").classList.add("locked");
    } else {
        _id("custom_game_password_set").querySelector(".password_icon").classList.remove("locked");
    }

    if (global_customSettingElements["mode"].dataset.value != settings.mode) {
        global_customSettingElements["mode"].dataset.value = settings.mode;
        update_select(global_customSettingElements["mode"]);
        update_mode = true;
    }

    if (global_customSettingElements["location"].dataset.value != settings.datacenter) {
        global_customSettingElements["location"].dataset.value = settings.datacenter;
        update_select(global_customSettingElements["location"]);
    }

    if (parseInt(global_customSettingElements["team_count"].dataset.value) != settings.team_count) {
        global_customSettingElements["team_count"].dataset.value = settings.team_count;
        update_select(global_customSettingElements["team_count"]);
        update_teams = true;
    }

    if (parseInt(global_customSettingElements["team_size"].dataset.value) != settings.team_size) {
        global_customSettingElements["team_size"].dataset.value = settings.team_size;
        update_select(global_customSettingElements["team_size"]);
        update_teams = true;
    }

    if (typeof settings.team_names == "object" && settings.team_names.length) {
        for (let i=0; i<settings.team_names.length; i++) {
            global_customTeamNames[i].value = settings.team_names[i];
        }
    }

    if (parseInt(global_customSettingElements["time_limit"].dataset.value) != settings.time_limit) {
        global_customSettingElements["time_limit"].dataset.value = settings.time_limit;
        update_select(global_customSettingElements["time_limit"]);
    }

    if (parseInt(global_customSettingElements["score_limit"].dataset.value) != settings.score_limit) {
        global_customSettingElements["score_limit"].dataset.value = settings.score_limit;
        update_select(global_customSettingElements["score_limit"]);
        update_score = true;
    }
    
    if (parseInt(global_customSettingElements["instagib"].dataset.value) != settings.instagib) {
        global_customSettingElements["instagib"].dataset.value = settings.instagib;
        update_select(global_customSettingElements["instagib"]);
    }

    if (parseInt(global_customSettingElements["continuous"].dataset.value) != settings.continuous) {
        global_customSettingElements["continuous"].dataset.value = settings.continuous;
        update_select(global_customSettingElements["continuous"]);
    }

    if (parseInt(global_customSettingElements["auto_balance"].dataset.value) != settings.auto_balance) {
        global_customSettingElements["auto_balance"].dataset.value = settings.auto_balance;
        update_select(global_customSettingElements["auto_balance"]);
    }

    if (parseInt(global_customSettingElements["intro"].dataset.value) != settings.intro) {
        global_customSettingElements["intro"].dataset.value = settings.intro;
        update_select(global_customSettingElements["intro"]);
    }

    if (parseInt(global_customSettingElements["team_switching"].dataset.value) != settings.team_switching) {
        global_customSettingElements["team_switching"].dataset.value = settings.team_switching;
        update_select(global_customSettingElements["team_switching"]);
    }

    if (parseInt(global_customSettingElements["physics"].dataset.value) != settings.physics) {
        global_customSettingElements["physics"].dataset.value = settings.physics;
        update_select(global_customSettingElements["physics"]);
    }

    if (Number(global_customSettingElements["ready_percentage"].dataset.value) != settings.ready_percentage) {
        global_customSettingElements["ready_percentage"].dataset.value = settings.ready_percentage;
        update_select(global_customSettingElements["ready_percentage"]);
    }

    if (parseInt(global_customSettingElements["warmup_time"].dataset.value) != settings.warmup_time) {
        global_customSettingElements["warmup_time"].dataset.value = settings.warmup_time;
        update_select(global_customSettingElements["warmup_time"]);
    }

    if (parseInt(global_customSettingElements["min_players"].dataset.value) != settings.min_players) {
        global_customSettingElements["min_players"].dataset.value = settings.min_players;
        update_select(global_customSettingElements["min_players"]);
    }

    if (parseInt(global_customSettingElements["max_clients"].dataset.value) != settings.max_clients) {
        global_customSettingElements["max_clients"].dataset.value = settings.max_clients;
        update_select(global_customSettingElements["max_clients"]);
    }

    if (parseInt(global_customSettingElements["model"].dataset.value) != settings.model) {
        global_customSettingElements["model"].dataset.value = settings.model;
        update_select(global_customSettingElements["model"]);
    }

    if (parseInt(global_customSettingElements["netcode"].dataset.value) != settings.netcode) {
        global_customSettingElements["netcode"].dataset.value = settings.netcode;
        update_select(global_customSettingElements["netcode"]);
    }

    if (Number(global_customSettingElements["spawn_farthest_chance"].dataset.value) != settings.spawn_farthest_chance) {
        global_customSettingElements["spawn_farthest_chance"].dataset.value = settings.spawn_farthest_chance;
        update_select(global_customSettingElements["spawn_farthest_chance"]);
    }

    if (Number(global_customSettingElements["spawn_farthest_foe_chance"].dataset.value) != settings.spawn_farthest_foe_chance) {
        global_customSettingElements["spawn_farthest_foe_chance"].dataset.value = settings.spawn_farthest_foe_chance;
        update_select(global_customSettingElements["spawn_farthest_foe_chance"]);
    }
    
    if (parseInt(global_customSettingElements["spawn_farthest_threshold"].dataset.value) != settings.spawn_farthest_threshold) {
        global_customSettingElements["spawn_farthest_threshold"].dataset.value = settings.spawn_farthest_threshold;
        update_select(global_customSettingElements["spawn_farthest_threshold"]);
    }

    if (Number(global_customSettingElements["spawn_random_chance"].dataset.value) != settings.spawn_random_chance) {
        global_customSettingElements["spawn_random_chance"].dataset.value = settings.spawn_random_chance;
        update_select(global_customSettingElements["spawn_random_chance"]);
    }

    if (Number(global_customSettingElements["spawn_safety_radius"].value) != settings.spawn_safety_radius) {
        global_customSettingElements["spawn_safety_radius"].value = settings.spawn_safety_radius;
    }

    if (Array.isArray(settings.commands)) {
        let commands_str = '';
        for (let c of settings.commands) {
            commands_str += update_custom_command(c.key, c.value);
        }

        if (!(bool_am_i_host && global_customSettingElements["commands"].classList.contains("focused"))) {
            global_customSettingElements["commands"].value = commands_str;
        }
    }

    global_customSettingElements["join_key"].textContent = settings.join_key;

    if (update_mode || init) {
        custom_game_mode_changed(false);
    }
    if (update_teams || init) {
        if (!update_mode) {
            custom_game_number_of_teams_changed(settings.team_count, false);
        }
    }

    if (update_score) {
        if (bool_am_i_host) {
            custom_lobby_local_var_update = true;
            update_variable("string", "lobby_custom_score_limit", global_customSettingElements["score_limit"].dataset.value);
            update_select(global_customSettingElements["score_limit"]);
            custom_lobby_local_var_update = false;
        }
    }

    if (global_customSettingElements["map"].dataset.value != settings.map) {
        if (settings.map) {
            global_lobby_selected_map = settings.map;
            global_customSettingElements["map"].dataset.value = settings.map;
            _html(global_customSettingElements["map"], "<div>"+_format_map_name(settings.map)+"</div>");
            global_customSettingElements["map"].style.backgroundImage = "url('map_thumbnails/" + settings.map + ".png')";
        } else {
            global_lobby_selected_map = "";
            global_customSettingElements["map"].dataset.value = "";
            _html(global_customSettingElements["map"], "<div>"+_format_map_name("")+"</div>");
            global_customSettingElements["map"].style.backgroundImage = "none";
        }
    }

    for (let t=0; t<settings.colors.length && t<settings.team_count; t++) {
        teamColorChanged(t, settings.colors[t]);
    }

    update_custom_game_continuous();
}

function update_custom_command(key, value) {
    let commands_str = '';
    commands_str += key+': '+value+";\n";
    return commands_str;
}

function update_custom_game_teams(user_id, teams, team_count, team_size) {
    let is_it_me = false;
    for (var t=-1; t<team_count; t++) {
        if (teams.hasOwnProperty(t)) {
            for (let i=0; i<teams[t].length; i++) {
                if (teams[t][i] == undefined) {
                    set_lobby_slot_empty(t, i);
                } else {
                    is_it_me = false;
                    if (user_id == teams[t][i].user_id) {
                        is_it_me = true;
                    }
                    set_lobby_slot_player(teams[t][i].user_id, t, i, teams[t][i].name, teams[t][i].avatar, teams[t][i].host, is_it_me);
                }
            }
        }
    }
}

function set_lobby_slot_empty(team, slot) {
    //console.log("set_lobby_slot_empty", team, slot);
    let slot_elem = undefined;

    if (team == -1) {
        // Spec slot
        slot_elem = global_specSlotList[slot];

        _empty(slot_elem);
    } else if (team >= 0) {
        // Regular team slot
        let slot_idx = teamSlotToSlotIDX(team, slot, global_customSettingElements["team_size"].dataset.value);
        slot_elem = global_gameSlotList[slot_idx];
        _for_first_with_class_in_parent(slot_elem, 'slot_content', function(sc) {
            _html(sc, "&nbsp;");
        });

        slot_elem.classList.add("empty_slot");
    }

    if (slot_elem == undefined) return;

    dragElementRemove(slot_elem);
    slot_elem.removeEventListener("mousedown", customPlayerContextMenu);
    slot_elem.contextOptions = [];
    slot_elem.classList.remove("action");
}

function set_lobby_slot_player(user_id, team, slot, name, avatar, host, is_it_me) {
    //console.log("set_lobby_slot_player", user_id, team, slot, name, "bool_am_i_host", bool_am_i_host);
    let slot_elem = undefined;

    if (team == -1) {
        // Spec slot
        slot_elem = global_specSlotList[slot];

        let spectator = _createElement("div", "spectator_name", name);
        if (host) spectator.appendChild(_createElement("div", "privilege", "H"));
        if (global_lobby_admins.includes(user_id)) spectator.appendChild(_createElement("div", "privilege", "A"));

        _empty(slot_elem);
        slot_elem.appendChild(spectator);

    } else if (team >= 0) {
        // Team slot
        let slot_idx = teamSlotToSlotIDX(team, slot, global_customSettingElements["team_size"].dataset.value);
        slot_elem = global_gameSlotList[slot_idx];

        _for_first_with_class_in_parent(slot_elem, 'slot_content', function(sc) {
            let html = "<div class=slot_avatar style='background-image:url(\""+_avatarUrl(avatar)+"\")'></div>";
            html +=  "<div class=slot_name>"+name+"</div>";
            if (host) { html += "<span class=slot_avatar_privilege>"+localize("lobby_host")+"</span>"; }
            if (global_lobby_admins.includes(user_id)) { html += "<span class=slot_avatar_privilege>"+localize("lobby_admin")+"</span>"; }

            _html(sc, html);
        });

        slot_elem.classList.remove("empty_slot");
    }

    if (slot_elem == undefined) return;

    dragElementRemove(slot_elem);
    slot_elem.removeEventListener("mousedown", customPlayerContextMenu);
    slot_elem.contextOptions = [];
    slot_elem.classList.remove("action");

    slot_elem.contextOptions.push({
        "text": localize("custom_game_view_profile"),
        "callback": () => { open_player_profile(user_id); },
    });

    if (bool_am_i_host) {
        dragElement(slot_elem, null, onMouseDown = function(){
            //engine.call('ui_sound', 'ui_drag1'); 
        });

        if (!is_it_me) {
            slot_elem.user_id = user_id;
            slot_elem.contextOptions.push({
                "text": localize("custom_game_make_host"),
                "callback": () => { makePlayerLobbyHost(user_id); },
            });

            if (global_lobby_admins.includes(user_id)) {
                slot_elem.contextOptions.push({
                    "text": localize("custom_game_revoke_admin"),
                    "callback": () => { revokePlayerLobbyAdmin(user_id); },
                });
            } else {
                slot_elem.contextOptions.push({
                    "text": localize("custom_game_make_admin"),
                    "callback": () => { makePlayerLobbyAdmin(user_id); },
                });
            }

            slot_elem.contextOptions.push({
                "text": localize("custom_game_remove_player"),
                "callback": () => { removePlayerFromLobby(user_id); },
            });
        }
    }
    
    slot_elem.classList.add("action");
    slot_elem.addEventListener("mousedown", customPlayerContextMenu);
}

function makePlayerLobbyHost(user_id) {
    send_json_data({"action": "lobby-makehost", "user-id": user_id});
}

function removePlayerFromLobby(user_id) {
    send_json_data({"action": "lobby-remove", "user-id": user_id});
}

function makePlayerLobbyAdmin(user_id) {
    send_string(CLIENT_COMMAND_LOBBY_MAKE_ADMIN, user_id);
}

function revokePlayerLobbyAdmin(user_id) {
    send_string(CLIENT_COMMAND_LOBBY_REVOKE_ADMIN, user_id);
}

function customPlayerContextMenu(e) {
    if (e.button != 2) return;
    e.preventDefault();

    context_menu(e, this.contextOptions);
}

// Convert e.g. "global" slot index 5 -> team 2/slot 3 (max 3 slots per team)
function slotIDXToTeamSlot(slot_idx, max_slots) {
    let team_idx = Math.floor(slot_idx / max_slots);
    let team_slot_idx = slot_idx - (team_idx * max_slots);

    return { 
        "team": team_idx,
        "slot": team_slot_idx
    };
}

// Convert e.g. team 2/slot 3 (max 4 slots per team) -> global slot index 11 (every index is zero based)
function teamSlotToSlotIDX(team, slot, max_slots) {
    return team * max_slots + slot;
}