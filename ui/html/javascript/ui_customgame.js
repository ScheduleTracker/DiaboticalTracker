
var custom_teamColors = [
    "23c841",
    "8438f6",
    "ff8800",
    "18c7ff",
    "ffa1ce",
    "f3f723",
    "ff1c1c",
    "7a874e",
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
const CUSTOM_MULTI_TEAM_MODES = ["brawl","instagib","ghosthunt", "ffa"];
const CUSTOM_ROUND_BASED_MODES = ["ca","wipeout","macguffin"];
var global_gameSlotList = [];
var global_specSlotList = [];
var global_teamContainers = [];
var global_playerColorList = [];
var global_customSettingsMap = {};
var global_customSettingElements = {};
var global_send_region_selection = false;
var custom_lobby_map_selected = false;
var global_lobby_init_mode = '';

global_onload_callbacks_other.push(function(){

    global_customSettingElements = {
        "visibility":       _id("custom_game_setting_visibility"),
        "name":             _id("custom_game_setting_name"),
        "mode":             _id("custom_game_setting_mode"),
        "map":              _id("custom_game_setting_map"),
        "location":         _id("custom_game_setting_location"),
		"time_limit":       _id("custom_game_setting_time_limit"),
		"score_limit":      _id("custom_game_setting_frag_limit"),
		"team_count":       _id("custom_game_setting_team_count"),
		"team_size":        _id("custom_game_setting_team_size"),
        "continuous":       _id("custom_game_setting_continuous"),
        "intro":            _id("custom_game_setting_intro"),
        "team_switching":   _id("custom_game_setting_team_switching"),
		"physics":          _id("custom_game_setting_physics"),
        "spawn_logic":      _id("custom_game_setting_spawn_logic"),
        "instagib":         _id("custom_game_setting_instagib"),
        "ready_percentage": _id("custom_game_setting_ready_percentage"),
        "warmup_time":      _id("custom_game_setting_warmup_time"),
        "min_players":      _id("custom_game_setting_min_players"),
        "max_clients":      _id("custom_game_setting_max_clients"),
        "join_key":         _id("custom_lobby_join_link_input"),
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
        document.querySelector("#custom_team_7 > .custom_team_players")
    ];

    global_playerColorList = [
        _id("custom_player_color_0"),
        _id("custom_player_color_1"),
        _id("custom_player_color_2"),
        _id("custom_player_color_3"),
        _id("custom_player_color_4"),
        _id("custom_player_color_5"),
        _id("custom_player_color_6"),
        _id("custom_player_color_7"),
        _id("custom_player_color_8"),
        _id("custom_player_color_9"),
        _id("custom_player_color_10"),
        _id("custom_player_color_11"),
        _id("custom_player_color_12"),
        _id("custom_player_color_13"),
        _id("custom_player_color_14"),
        _id("custom_player_color_15"),
    ];
    
    // Add all the modes to the filter select list
    let modes = Object.keys(global_game_mode_map);
    for (let mode of modes) {
        if (!global_game_mode_map[mode].enabled) continue;
        if (!global_lobby_init_mode.length) global_lobby_init_mode = mode;
        
        let opt = _createElement("div", "i18n");
        opt.dataset.i18n = global_game_mode_map[mode].i18n;
        opt.dataset.value = mode;
        opt.innerHTML = global_game_mode_map[mode].name;
        global_customSettingElements["mode"].appendChild(opt);
    }
    engine.call("initialize_select_value", "lobby_custom_mode");


    /***************************
     * SETUP CUSTOM GAME OPTIONS
     */
    global_input_debouncers['custom_game_setting_name'] = new InputDebouncer(function() {
        if (bool_am_i_host) {
            custom_game_settings_changed();
        }
    }, 600);
    ui_setup_select(global_customSettingElements["visibility"], function(opt, field) {
        if (bool_am_i_host) {
            update_variable("string", field.dataset.variable, opt.dataset.value);
            update_custom_game_visibility();
            custom_lobby_setting_updated(field.dataset.variable, opt.dataset.value);
        }
    });
    ui_setup_select(global_customSettingElements["mode"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["team_count"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["team_size"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["time_limit"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["score_limit"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["continuous"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["intro"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["team_switching"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["physics"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["spawn_logic"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["ready_percentage"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["warmup_time"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["min_players"], update_variable_if_host);
    ui_setup_select(global_customSettingElements["max_clients"], update_variable_if_host);

    function update_variable_if_host(opt, field) {
        if (bool_am_i_host) {
            update_variable("string", field.dataset.variable, opt.dataset.value);
            custom_lobby_setting_updated(field.dataset.variable, opt.dataset.value);
        }
    }

    // Instagib setting is currently not saved in a variable across restarts
    // logic here is independent of other checkboxes which are saved
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

            if (el.id == "custom_game_setting_instagib") {
                custom_game_settings_changed();
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
            teamColorChanged(this.parentElement.parentElement.dataset.slot, "#" + el.value);
            custom_game_settings_changed();
        };
    });
    
    // Updates the maplist choices (triggered by "on_custom_game_mode_changed")
    bind_event("set_map_choices", function (html_code) {
        let cont = _id("map_choice_container");
        _html(cont, html_code);
    });

    // currently only used to set the map selector in the custom game lobby
    bind_event('set_custom_component', function (variable, value) {

        _for_each_in_class("custom_component",function(el) {
            // Set the map selection
            if (el.dataset.variable == variable) {
                el.dataset.value = value;

                // set_custom_component with lobby_custom_map is called when host selects a different map or switches to a different mode that doesn't include the current map in its map list
                if (variable == "lobby_custom_map") {
                    _html(el, "<div>"+value+"</div>");
                    el.style.backgroundImage = "url('map_thumbnails/" + value + ".png')";

                    // Only send update when the user selected the map manually, not when e.g. the mode is changed and the map with it, to prevent double updates
                    if (custom_lobby_map_selected) {
                        custom_game_settings_changed();
                        custom_lobby_map_selected = false;
                    }
                }
            }            
        });

        // Call the response handler for any queued callbacks
        global_variable.handleResponse("custom_component", variable, value);
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

    // DEBUG TESTS FUNCTIONS
/*
    _for_each_with_class_in_parent(_id("home_screen"), "party_invite", function(el) {
        el.style.backgroundColor = "black";
        el.style.color = "white";
        el.style.marginBottom = "1vh";
        el.style.padding = "1vh";
        el.addEventListener("click", function() {
            send_json_data({"action": "invite-add", "type": "party", "user-id": Number(this.dataset.id) });
        });
    });

    _for_each_with_class_in_parent(_id("home_screen"), "lobby_invite", function(el) {
        el.style.backgroundColor = "black";
        el.style.color = "white";
        el.style.marginBottom = "1vh";
        el.style.padding = "1vh";
        el.addEventListener("click", function() {
            send_json_data({"action": "invite-add", "type": "lobby", "user-id": Number(this.dataset.id) });
        });
    });

    <!-- buttons used for party & lobby debugging purposes
                <div class="party_invite" data-id="0">PARTY Invite 0</div>
                <div class="party_invite" data-id="1">PARTY Invite 1</div>
                <div class="party_invite" data-id="2">PARTY Invite 2</div>
                <div class="party_invite" data-id="3">PARTY Invite 3</div>
                <div class="lobby_invite" data-id="0">LOBBY Invite 0</div>
                <div class="lobby_invite" data-id="1">LOBBY Invite 1</div>
                <div class="lobby_invite" data-id="2">LOBBY Invite 2</div>
                <div class="lobby_invite" data-id="3">LOBBY Invite 3</div>
-->
*/
});

function set_lobby_datacenter(value) {
    if (value.trim().length == 0 || value.trim() == '""' || value.trim() == "''") {
        update_variable("string", "lobby_custom_datacenter", "lan");
        value = "lan";
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
    send_string("lobby-update-password "+password);

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
        send_json_data({"action": "lobby-create", "settings": get_lobby_settings() });
        open_play("custom");
    }
}

function leave_custom_lobby_action() {
    open_play("custom");
}

function open_lobby() {
    open_play("custom");
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

function teamColorChanged(playerNumber, newColor){

    var team_size = parseInt(global_customSettingElements["team_size"].dataset.value);

    var playerTeam = Math.floor(parseInt(playerNumber) / team_size);

    custom_teamColors[playerTeam] = newColor;
    
    for (let i=0; i<team_size; i++) {
        global_playerColorList[playerTeam * team_size + i].jscolor.fromString(newColor);
    }
}

function start_custom_game(btn) {
    if (btn.classList.contains("locked")) return;
    
    send_json_data({"action": "lobby-start"});
}

function custom_game_settings_changed() {
    // Don't send anything if we aren't actually in a lobby
    if (global_lobby_id == -1) return;

    let info = get_lobby_settings();

    // Make sure the values get stored in the engine
    if (bool_am_i_host) {
        update_variable("string", "lobby_custom_team_size", global_customSettingElements["team_size"].dataset.value);
        update_variable("string", "lobby_custom_teams", global_customSettingElements["team_count"].dataset.value);

        send_json_data({"action": "lobby-settings", "settings": info });
    }

    
}

function custom_game_mode_changed(send_update) {
    var mode = global_customSettingElements["mode"].dataset.value;
    let container_team_count = _id("custom_setting_team_count");
    let container_team_size = _id("custom_setting_team_size");
    let container_time_limit = _id("custom_setting_time_limit");
    let container_score_limit = _id("custom_setting_frag_limit");

    if (CUSTOM_MULTI_TEAM_MODES.includes(mode)) {

        custom_game_number_of_teams_changed(parseInt(global_customSettingElements["team_count"].dataset.value), false);
        container_team_count.style.display = "flex";
        container_team_size.style.display = "flex";

    } else {
        if (mode == "duel") {

            global_customSettingElements["team_count"].dataset.value = 2;
            global_customSettingElements["team_size"].dataset.value = 1;
            update_select(global_customSettingElements["team_count"]);
            update_select(global_customSettingElements["team_size"]);
            container_team_count.style.display = "none";
            container_team_size.style.display = "none";

        } else if (mode == "ffa") {

            global_customSettingElements["team_size"].dataset.value = 1;
            update_select(global_customSettingElements["team_size"]);
            container_team_count.style.display = "flex";
            container_team_size.style.display = "none";

        } else {

            global_customSettingElements["team_count"].dataset.value = 2;
            update_select(global_customSettingElements["team_count"]);
            container_team_count.style.display = "none";
            container_team_size.style.display = "flex";

        }

        custom_game_number_of_teams_changed(parseInt(global_customSettingElements["team_count"].dataset.value), false);
    }

    if (CUSTOM_ROUND_BASED_MODES.includes(mode)) {
        container_time_limit.style.display = "none";
    } else {
        container_time_limit.style.display = "flex";
    }

    if (mode == "duel") {
        custom_game_number_of_teams_changed(2, false);
        container_score_limit.style.display = "none";

        for (let i=2; i<global_gameSlotList.length; i++) {
            global_gameSlotList[i].style.display = "none";
        }        
    } else {
        container_score_limit.style.display = "flex";
        for (let i=2; i<global_gameSlotList.length; i++) {
            global_gameSlotList[i].style.display = "flex";
        }
    }
       
    if (mode == "race") {
        let refNode = _id('custom_setting_location');
        let parentNode = refNode.parentNode;
        parentNode.insertBefore(_id('custom_setting_physics'),refNode);
    } else {
        let refNode = _id('custom_setting_instagib');
        let parentNode = refNode.parentNode;
        parentNode.insertBefore(_id('custom_setting_physics'),refNode);
    }
    
    // Trigger map selection list update and map choice update
    engine.call("on_custom_game_mode_changed", mode, global_customSettingElements["map"].dataset.value || "");

    if (send_update) {
        custom_game_settings_changed();
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

    if (mode === "duel") {
        teamSize = 1;
        numOfTeams = 2;
    }

    _for_each_with_class_in_parent(_id("custom_game_player_slots"), "custom_team_group", function(el) {
        el.style.display = "none";
    });

    moveSlotToRightTeam(teamSize, numOfTeams);
            
    for (let i=0; i < numOfTeams; i++) {
        _id("custom_team_"+i).style.display = "flex";
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
            }
        }
    } else {
        for (i=0; i<global_gameSlotList.length; i++) {
            if (i < teamSize * 1) {
                global_teamContainers[0].appendChild(global_gameSlotList[i]);
                global_gameSlotList[i].firstElementChild.firstElementChild.jscolor.fromString(custom_teamColors[0]);
            } else if (i < teamSize * 2 && numOfTeams >= 2) {
                global_teamContainers[1].appendChild(global_gameSlotList[i]);
                global_gameSlotList[i].firstElementChild.firstElementChild.jscolor.fromString(custom_teamColors[1]);
            } else if (i < teamSize * 3 && numOfTeams >= 3) {
                global_teamContainers[2].appendChild(global_gameSlotList[i]);
                global_gameSlotList[i].firstElementChild.firstElementChild.jscolor.fromString(custom_teamColors[2]);
            } else if (i < teamSize * 4 && numOfTeams >= 4) {
                global_teamContainers[3].appendChild(global_gameSlotList[i]);
                global_gameSlotList[i].firstElementChild.firstElementChild.jscolor.fromString(custom_teamColors[3]);
            } else if (i < teamSize * 5 && numOfTeams >= 5) {
                global_teamContainers[4].appendChild(global_gameSlotList[i]);
                global_gameSlotList[i].firstElementChild.firstElementChild.jscolor.fromString(custom_teamColors[4]);
            } else if (i < teamSize * 6 && numOfTeams >= 6) {
                global_teamContainers[5].appendChild(global_gameSlotList[i]);
                global_gameSlotList[i].firstElementChild.firstElementChild.jscolor.fromString(custom_teamColors[5]);
            } else if (i < teamSize * 7 && numOfTeams >= 7) {
                global_teamContainers[6].appendChild(global_gameSlotList[i]);
                global_gameSlotList[i].firstElementChild.firstElementChild.jscolor.fromString(custom_teamColors[6]);
            } else if (i < teamSize * 8 && numOfTeams >= 8) {
                global_teamContainers[7].appendChild(global_gameSlotList[i]);
                global_gameSlotList[i].firstElementChild.firstElementChild.jscolor.fromString(custom_teamColors[7]);
            } else {
                _id("custom_no_team_slot").appendChild(global_gameSlotList[i]);
            }
        }
    }
}

function thumbnail_button_map(element) {
    engine.call("set_modal", true);
    anim_show(_id("map_choice_modal_screen"));
}

function map_selected(element) {
    if (bool_am_i_host) {
        custom_lobby_map_selected = true;
        engine.call("custom_game_map_selected", element.dataset.value);
        _for_each_with_class_in_parent(element.parentElement, 'thumb_selected', function(el) {
            el.classList.remove('thumb_selected');
        });
        element.classList.add('thumb_selected');
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
            "duration": 10000,
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
            update_queue_modes();
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
    }

    if (bool_am_i_leader) {
        _id("quick_play_queue_button").style.display = "flex";
        _id("ranked_play_queue_button").style.display = "flex";
        _id("custom_play_create_lobby_button").style.display = "flex";
        _id("custom_play_link_join_lobby_button").style.display = "flex";
        _id("customlist_bottom").style.display = "flex";
    } else {
        // TODO, don't hide but replace with a text explaining that only the party leader can do those actions
        _id("quick_play_queue_button").style.display = "none";
        _id("ranked_play_queue_button").style.display = "none";
        _id("custom_play_create_lobby_button").style.display = "none";
        _id("custom_play_link_join_lobby_button").style.display = "none";
        _id("customlist_bottom").style.display = "none";
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

            open_play("custom");
        }

        if (promoted) {
            lobby_join_key_hide();
            custom_game_settings_changed();
        }
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
                    play_screen_open_custom(false);
                }
            }
        }
        update_friend_lobby_invite_button();

        lobby_hide_loading_overlay()
    }

    if (data.action == "lobby-leave") {
        global_lobby_id = -1;
        main_chat_reset("lobby");
        if (global_menu_page == "play_panel" && (global_play_menu_page == "play_screen_customlist" || global_play_menu_page == "play_screen_custom")) {
            leave_custom_lobby_action();
        } else {
            if (global_play_menu_page == "play_screen_customlist" || global_play_menu_page == "play_screen_custom") {
                // Change custom screen in the background
                play_screen_open_custom(false);
            }
        }
        update_friend_lobby_invite_button();

        lobby_hide_loading_overlay();

        lobby_join_key_hide();
    }

    if (data.action == "lobby-match-requested") {
        let overlay = _id("match_loading_overlay");
        let btn = _id("custom_game_button_startrem");
        anim_show(overlay);
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

function lobby_hide_loading_overlay() {
    let overlay = _id("match_loading_overlay");
    let btn = _id("custom_game_button_startrem");
    anim_hide(overlay);
    btn.classList.remove("locked");
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
    let colors;
    if (CUSTOM_MULTI_TEAM_MODES.includes(mode)) {
        colors = [
            custom_teamColors[0],
            custom_teamColors[1],
            custom_teamColors[2],
            custom_teamColors[3],
            custom_teamColors[4],
            custom_teamColors[5],
            custom_teamColors[6],
            custom_teamColors[7]
        ];
    } else {
        colors = [
            custom_teamColors[0],
            custom_teamColors[1]
        ];
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

		// Unsigned ints, the conversions to int are critical:
		time_limit:     parseInt(global_customSettingElements["time_limit"].dataset.value),
		score_limit:    parseInt(global_customSettingElements["score_limit"].dataset.value),
		team_count:     parseInt(global_customSettingElements["team_count"].dataset.value),
        team_size:      parseInt(global_customSettingElements["team_size"].dataset.value),
        continuous:     parseInt(global_customSettingElements["continuous"].dataset.value),
        intro:          parseInt(global_customSettingElements["intro"].dataset.value),
        team_switching: parseInt(global_customSettingElements["team_switching"].dataset.value),
		physics:        parseInt(global_customSettingElements["physics"].dataset.value),
        spawn_logic:    parseInt(global_customSettingElements["spawn_logic"].dataset.value),
        warmup_time:    parseInt(global_customSettingElements["warmup_time"].dataset.value),
        min_players:    parseInt(global_customSettingElements["min_players"].dataset.value),
        max_clients:    parseInt(global_customSettingElements["max_clients"].dataset.value),

        // float
        ready_percentage:  Number(global_customSettingElements["ready_percentage"].dataset.value),

        // Boolean:
        instagib:    (parseInt(global_customSettingElements["instagib"].dataset.enabled) == 1) ? true : false,
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
        _for_each_with_selector_in_parent(_id("main_menu"), ".custom_game_setting .custom_game_setting_input", function(el) {
            _enableInput(el);
        });

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
        _for_each_with_selector_in_parent(_id("main_menu"), ".custom_game_setting .custom_game_setting_input", function(el) {
            _disableInput(el);
        });

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
    }
}

function update_custom_game_settings(settings, init) {
    //console.log("update_custom_game_settings", _dump(settings));

    let update_teams = false;
    let update_mode = false;

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

    if (parseInt(global_customSettingElements["time_limit"].dataset.value) != settings.time_limit) {
        global_customSettingElements["time_limit"].dataset.value = settings.time_limit;
        update_select(global_customSettingElements["time_limit"]);
    }

    if (parseInt(global_customSettingElements["score_limit"].dataset.value) != settings.score_limit) {
        global_customSettingElements["score_limit"].dataset.value = settings.score_limit;
        update_select(global_customSettingElements["score_limit"]);
    }
    
    if(settings.instagib) {
        global_customSettingElements["instagib"].dataset.enabled = 1;
        global_customSettingElements["instagib"].classList.add("checkbox_enabled");
        global_customSettingElements["instagib"].firstElementChild.classList.add("inner_checkbox_enabled");
    } else {
        global_customSettingElements["instagib"].dataset.enabled = 0;
        global_customSettingElements["instagib"].classList.remove("checkbox_enabled");
        global_customSettingElements["instagib"].firstElementChild.classList.remove("inner_checkbox_enabled");
    }

    if (parseInt(global_customSettingElements["continuous"].dataset.value) != settings.continuous) {
        global_customSettingElements["continuous"].dataset.value = settings.continuous;
        update_select(global_customSettingElements["continuous"]);
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

    if (parseInt(global_customSettingElements["spawn_logic"].dataset.value) != settings.spawn_logic) {
        global_customSettingElements["spawn_logic"].dataset.value = settings.spawn_logic;
        update_select(global_customSettingElements["spawn_logic"]);
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

    global_customSettingElements["join_key"].textContent = settings.join_key;

    if (update_mode || init) {
        custom_game_mode_changed(false);
    }
    if (update_teams || init) {
        if (!update_mode) {
            custom_game_number_of_teams_changed(settings.team_count, false);
        }
    }

    if (global_customSettingElements["map"].dataset.value != settings.map) {
        global_customSettingElements["map"].dataset.value = settings.map;
        _html(global_customSettingElements["map"], "<div>"+settings.map+"</div>");
        global_customSettingElements["map"].style.backgroundImage = "url('map_thumbnails/" + settings.map + ".png')";
    }

    for (let t=0; t<settings.colors.length && t<settings.team_count; t++) {
        teamColorChanged(t*settings.team_size, settings.colors[t]);
    }
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

        let host_class = '';
        if (host) host_class = ' host';
        _html(slot_elem, '<div class="spectator_name'+host_class+'">'+name+'</div>');

    } else if (team >= 0) {
        // Team slot
        let slot_idx = teamSlotToSlotIDX(team, slot, global_customSettingElements["team_size"].dataset.value);
        slot_elem = global_gameSlotList[slot_idx];

        _for_first_with_class_in_parent(slot_elem, 'slot_content', function(sc) {
            let html = "<div class=slot_avatar style='background-image:url(\""+_avatarUrl(avatar)+"\")'></div>";
            html +=  "<div class=slot_name>"+name+"</div>";
            if (host) { html += "<span class=slot_avatar_host>HOST</span>"; }

            _html(sc, html);
        });

        slot_elem.classList.remove("empty_slot");
    }

    if (slot_elem == undefined) return;

    dragElementRemove(slot_elem);
    slot_elem.removeEventListener("mousedown", customPlayerContextMenu);
    slot_elem.contextOptions = [];
    slot_elem.classList.remove("action");

    if (bool_am_i_host) {
        dragElement(slot_elem, null, onMouseDown = function(){
            //engine.call('ui_sound', 'ui_drag1'); 
        });

        if (!is_it_me) {
            slot_elem.addEventListener("mousedown", customPlayerContextMenu);
            slot_elem.user_id = user_id;
            slot_elem.contextOptions = [
                {
                    "text": "Make Host",
                    "callback": () => { makePlayerLobbyHost(user_id) },
                },
                {
                    "text": "Remove Player",
                    "callback": () => { removePlayerFromLobby(user_id) },
                },
            ];
        }

        slot_elem.classList.add("action");
    }
}

function makePlayerLobbyHost(user_id) {
    send_json_data({"action": "lobby-makehost", "user-id": user_id});
}

function removePlayerFromLobby(user_id) {
    send_json_data({"action": "lobby-remove", "user-id": user_id});
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