const GAMEFACE_VIEW = 'hud';

let global_hud_view_active = false;

//This forces the browser to load in and cache the images
/*
var weapon_svgs = [
    'images/weapon_bl.svg#Layer_1',
    'images/weapon_sh.svg#Layer_1',
    'images/weapon_rl.svg#Layer_1',
    'images/weapon_shaft.svg#Layer_1',
    'images/weapon_pncr.svg#Layer_1',
    'images/weapon_mac.svg#Layer_1',
    'images/weapon_gl.svg#Layer_1',
    'images/weapon_cb.svg#Layer_1',
    'images/weapon_w9.svg#Layer_1',
    'images/weapon_mg.svg#Layer_1',
    'images/weapon_fg.svg#Layer_1',
    'images/weapon_st.svg#Layer_1',
    'images/weapon_hw.svg#Layer_1',
    'images/weapon_bw.svg#Layer_1',
    'images/weapon_iw.svg#Layer_1',
    'images/weapon_sw.svg#Layer_1',
    'images/weapon_smw.svg#Layer_1',
    'images/weapon_melee.svg#Layer_1',
];


var svgCache = {};
var counter = 0;
var total = weapon_svgs.length;

for( var i=0; i < total; i++){
    var img = new Image();

    // cache it
    svgCache[weapon_svgs[i]] = img;
    img.src = weapon_svgs[i];
}
*/

class Match {
    constructor() {
        this.match_id = -1;
        this.map = '';
        this.mode = '';
        this.mm_mode = '';
        this.clients = {};
        this.confirmation_frag_time = false;
        this.game_time_for_chat = "00:00";

        this.create_ts = Date.now();
    }

    // Currently only gets the initial manifest clients
    setManifest(m) {
        this.match_id = m.match_id;

        for (let c of m.clients) {
            this.clients[c.user_id] = {
                "party": c.party,
                "admin": c.admin
            };
        }
    }

    updateClients(clients) {
        for (let c of clients) {
            this.clients[c.user_id] = {
                "party": c.party,
                "admin": c.admin
            };
        }
    }
}

var current_match = new Match([]);

let match_data = {};
function cleanup_match_data() {
    for (let match_id in match_data) {
        if (match_id == current_match.match_id) continue;

        if ((Date.now() - match_data[match_id].create_ts) > (1800 * 1000)) {
            delete match_data[match_id];
        }
    }
}

var mask_containers = [];
var zoom_crosshair_containers = [];
var crosshair_containers = [];
let hud_containers = [];
let game_hud_special = undefined;
let real_hud_container = undefined;
let real_hud_element = undefined;
let spec_hud_element = undefined;
let preview_hud_element = undefined;
function initialize_references() {
    hud_containers = [_id("real_hud"), _id("hud_preview")];
    game_hud_special = _id("game_hud_special");
    real_hud_container = _id("real_hud_container");
    real_hud_element = _id("real_hud");
    spec_hud_element = _id("spec_hud");
    preview_hud_element = _id("hud_preview");

    crosshair_containers = [];
    zoom_crosshair_containers = [];
    mask_containers = [_id("game_masks_container"), _id("game_masks_container_zoom")];
    _for_each_in_class("game_crosshairs_container", function(el) { crosshair_containers.push(el); });
    _for_each_in_class("game_zoom_crosshairs_container", function(el) { zoom_crosshair_containers.push(el); });
    //_for_each_in_class("crosshair_preview_container", function(el) { crosshair_containers.push(el); });
}


var global_hud_is_visible = false;
var global_show_rank_change = false;

let global_hud_references = {
    "time_limit": [],
    "game_timer": [],
    "system_clock": [],
    "chat_messages": [],
    "chat_container": [],
    "fraglog": [],
    "you_fragged": [],
    "editing_info": [],
    "game_report_chat_messages": undefined,
    "game_report_chat_input": undefined,
};

// Current battlepass stored in the hud view for access in the game report
var global_hud_battlepass_rewards = {};

// Party leader status for use in the game report
var bool_am_i_leader = true;

var currently_held_weapon_index = undefined; //currently held weapons index

let currently_active_crosshair_index = undefined;

function set_hud_weapon_crosshair(settings_weapon_crosshair_index) {

    if (currently_active_crosshair_index == undefined){
        for (let idx in global_crosshair_map) global_crosshair_map[idx].style.display = "none";

        for (let idx in global_crosshair_hitmarker_map) global_crosshair_hitmarker_map[idx].style.display = "none";

        for (let idx in global_mask_map) global_mask_map[idx].style.display = "none";
    }
    if (currently_active_crosshair_index == settings_weapon_crosshair_index) return;
    
    // Set the normal crosshair/hitstyle/mask for this weapon:
    if (currently_active_crosshair_index != settings_weapon_crosshair_index) {
        if (currently_active_crosshair_index != undefined && currently_active_crosshair_index in global_crosshair_map) global_crosshair_map[currently_active_crosshair_index].style.display = "none";
        if (settings_weapon_crosshair_index in global_crosshair_map) global_crosshair_map[settings_weapon_crosshair_index].style.display = "flex";

        if (currently_active_crosshair_index != undefined && currently_active_crosshair_index in global_crosshair_hitmarker_map) global_crosshair_hitmarker_map[currently_active_crosshair_index].style.display = "none";
        if (settings_weapon_crosshair_index in global_crosshair_hitmarker_map) global_crosshair_hitmarker_map[settings_weapon_crosshair_index].style.display = "flex";

        if (currently_active_crosshair_index != undefined && currently_active_crosshair_index in global_mask_map) global_mask_map[currently_active_crosshair_index].style.display = "none";
        if (settings_weapon_crosshair_index in global_mask_map) global_mask_map[settings_weapon_crosshair_index].style.display = "flex";
    }

    currently_active_crosshair_index = settings_weapon_crosshair_index;
}

let currently_active_crosshair_zoom_index = undefined;

function set_hud_zoom_weapon_crosshair(settings_zoom_weapon_crosshair_index) {

    if (currently_active_crosshair_zoom_index == undefined) {
        for (let idx in global_crosshair_zoom_map) global_crosshair_zoom_map[idx].style.display = "none";

        for (let idx in global_crosshair_hitmarker_zoom_map) global_crosshair_hitmarker_zoom_map[idx].style.display = "none";

        for (let idx in global_mask_zoom_map) global_mask_zoom_map[idx].style.display = "none";
    }
    if (currently_active_crosshair_zoom_index == settings_zoom_weapon_crosshair_index) return;
    
    // Set the zoom crosshair/hitstyle/mask for this weapon:
    if (currently_active_crosshair_zoom_index != settings_zoom_weapon_crosshair_index) {
        if (currently_active_crosshair_zoom_index != undefined && currently_active_crosshair_zoom_index in global_crosshair_zoom_map) global_crosshair_zoom_map[currently_active_crosshair_zoom_index].style.display = "none";
        if (settings_zoom_weapon_crosshair_index in global_crosshair_zoom_map) global_crosshair_zoom_map[settings_zoom_weapon_crosshair_index].style.display = "flex";

        if (currently_active_crosshair_zoom_index != undefined && currently_active_crosshair_zoom_index in global_crosshair_hitmarker_zoom_map) global_crosshair_hitmarker_zoom_map[currently_active_crosshair_zoom_index].style.display = "none";
        if (settings_zoom_weapon_crosshair_index in global_crosshair_hitmarker_zoom_map) global_crosshair_hitmarker_zoom_map[settings_zoom_weapon_crosshair_index].style.display = "flex";

        if (currently_active_crosshair_zoom_index != undefined && currently_active_crosshair_zoom_index in global_mask_map) global_mask_zoom_map[currently_active_crosshair_zoom_index].style.display = "none";
        if (settings_zoom_weapon_crosshair_index in global_mask_zoom_map) global_mask_zoom_map[settings_zoom_weapon_crosshair_index].style.display = "flex";
    }

    currently_active_crosshair_zoom_index = settings_zoom_weapon_crosshair_index;
}

function handlePostMatchUpdates(data) {
    //console.log("post-match-updates", _dump(data));
    if (current_match.match_id == data.match_id) {
        if ("mmr_updates" in data && data.mmr_updates.ranked) {
            global_show_rank_change = true;
            renderRankScreen(data.mmr_updates);

            let mmr_data = data.mmr_updates;
            if (mmr_data.mode in global_self.mmr) {
                global_self.mmr[mmr_data.mode].rank_tier = mmr_data.to.rank_tier;
                global_self.mmr[mmr_data.mode].rank_position = mmr_data.to.rank_position;
            } else {
                global_self.mmr[mmr_data.mode] = {
                    "rating": null,
                    "rank_tier": mmr_data.to.rank_tier,
                    "rank_position": mmr_data.to.rank_position,
                }
            }

            updateGameReportRank(mmr_data.mode);
        }

        // clear the previous progression update
        clear_battle_pass_progression();

        // Update game report with battle pass and achievement progression
        if ("progression_updates" in data) {
            
            if ("achievement_rewards" in data.progression_updates) {
                set_achievement_rewards(data.progression_updates.achievement_rewards);
            } else {
                set_achievement_rewards();
            }

            if ("battlepass_update" in data.progression_updates) {
                set_battle_pass_rewards(data.progression_updates.battlepass_rewards);
                set_battle_pass_progression(data.progression_updates.battlepass_update);
            } else {
                set_battle_pass_rewards();
            }

            // Add rewards to the progression update
            set_progression_reward_unlocks();
        }

        if ("rematch_enabled" in data) {
            global_game_report_rematch_enabled = data.rematch_enabled;
        } else {
            global_game_report_rematch_enabled = false;
        }
        game_report_reset_rematch_option();
    }
}

window.addEventListener("load", function(){

    console.log("load");

    // This preloads and renders the images of items
    /*
    let global_preload_trick_container = _id("preload_trick_container");
    for (let item of Object.keys(global_item_name_map)) {
        if (global_item_name_map[item][2] == undefined || global_item_name_map[item][2].length == 0) continue;
        _loadImage(global_preload_trick_container, global_item_name_map[item][2]+"?color="+global_item_name_map[item][0]);
    }
    */

    initialize_references();

    if (!window.jsrender){
        //Glue for when Jquery is present, do not delete, needed for GT/GAMEFACE interoperability
        window.jsrender = {views: $.views, templates: $.templates};
    }
    window.jsrender.views.settings.delimiters("[[", "]]");
    window.jsrender.views.converters("encode_url", function(val) {
        val = encodeURIComponent(val);
        val = val.replace("(", "%28");
        val = val.replace(")", "%29");
        return val;
    });
    window.jsrender.views.converters("number", function(val) {
        if (typeof val == "string") {
            return Number(val);
        }
        return val;
    });

    // Set the watermark
    //_id("watermark").textContent = battle_data.self.user_id.substring(battle_data.self.user_id.length / 2, battle_data.self.user_id.length - 2);


    // Load all the hud element definitions
    init_hud_elements();

    element_chat_setup();

    //Generate crosshair canvases
    initializeCanvasCrosshairMaps();

    // NOTE: map_unloaded is also fired after "on_connected" but before "on_map_loaded"
    bind_event('map_unloaded', function() {
        global_hud_view_active = false;

        // Stop all tracked (ui_sound_tracked) sounds
        engine.call("ui_stop_sounds");

        // Reset the match id 
        current_match.match_id = -1;
    });

    bind_event('view_data_received', function(string) {
        // data from another view received
        let data = parse_view_data(string);

        if (data.action == "set-battlepass-rewards") {
            global_hud_battlepass_rewards = data.data.rewards;
        }

        if (data.action == "party-leader") bool_am_i_leader = true;
        if (data.action == "party-member") bool_am_i_leader = false;
        if (data.action == "aim-restart") on_aim_report_restart();
    });

    bind_event('process_server_json_data', function (string) {
        let type = string.charAt(0);
        let data = string.trim().substring(2);

        if (type == "j") {
            var json_data = '';
            try {
                json_data = JSON.parse(data);
            } catch (e) {
                console.log("Error parsing server JSON. err=" + e);
            }
            if (!json_data.action) return;
            
            if (json_data.action == "vote-counts") {
                game_report_update_vote_counts(json_data);
            }

            if (json_data.action == "match-abort-user-reconnect-msg") addServerChatMessage(localize_ext("match_cancel_msg", {"count": Number(json_data.minutes)}));
            if (json_data.action == "match-user-reconnect-msg")       addServerChatMessage(localize_ext("match_penalty_msg", {"count": Number(json_data.minutes)}));
            if (json_data.action == "match-no-penalty-abandon")       addServerChatMessage(localize("match_penalty_removed_msg"));
            if (json_data.action == "match-user-abandoned")           addServerChatMessage(localize_ext("match_user_abandoned", {"name": json_data.name}));
            if (json_data.action == "match-auto-balance")             addServerChatMessage(localize("match_auto_balance_teams"));

            if (json_data.action == "post-match-updates") {
                handlePostMatchUpdates(json_data.data);
            }

            if (json_data.action == "rematch-status") {
                game_report_handle_rematch_update(json_data);
            }


            if (json_data.action == "party-status") {
                global_self.user_id = json_data['user-id'];
            }

            if (json_data.action == "get-ranked-mmrs") {
                global_self.mmr = json_data.data;
            }

            if (json_data.action == "update-match-client-data") {
                if (current_match.match_id == json_data.match_id) {
                    current_match.updateClients(json_data.clients);
                } else {
                    match_data[json_data.match_id] = new Match();
                    match_data[json_data.match_id].updateClients(json_data.clients);
                }
            }

        }
        if (type == "s") {
            let action = data.substr(0,data.indexOf(' '));
            let action_data = data.substr(data.indexOf(' ')+1);
            if (data.indexOf(' ') == -1) {
                action = data;
                action_data = "";
            }

            //...
        }

        //engine.call("echo", "Received JSON Data, action=" + json_data.action);
    });
    
    bind_event('hud_changed', function (type, jsonStr) {
        //console.log("hud_changed", type);
        try {
            editing_hud_data = JSON.parse(jsonStr);
        } catch (err) {
            console.log("Unable to parse hud definition, definition string may have been too long when it was saved and got cut off");
            engine.call("echo", "Unable to parse hud definition, definition string may have been too long when it was saved and got cut off");
        }
        if (type == HUD_PLAYING) {
            make_hud_in_element("real_hud", false, false);
        }
        if (type == HUD_SPECTATING) {
            make_hud_in_element("spec_hud", false, true);
        }
        setup_hud_references();
        gameface_strafe_prefetch_check();
    });

    engine.call('get_hud_json', HUD_PLAYING).then(function (jsonStr) {
        //console.log("post_load_setup_hud_editor 3");
        try {
            editing_hud_data = JSON.parse(jsonStr);
        } catch (err) {
            console.log("Unable to parse hud definition, definition string may have been too long when it was saved and got cut off");
            engine.call("echo", "Unable to parse hud definition, definition string may have been too long  when it was saved and got cut off");
        }

        // Check hud version
        hud_version_check(editing_hud_data, HUD_PLAYING);

        make_hud_in_element("real_hud", false, false);
        setup_hud_references();
    });

    engine.call('get_hud_json', HUD_SPECTATING).then(function (jsonStr) {
        //console.log("post_load_setup_hud_editor 3");
        try {
            editing_hud_data = JSON.parse(jsonStr);
        } catch (err) {
            console.log("Unable to parse hud definition, definition string may have been too long when it was saved and got cut off");
            engine.call("echo", "Unable to parse hud definition, definition string may have been too long  when it was saved and got cut off");
        }

        // Check hud version
        hud_version_check(editing_hud_data, HUD_SPECTATING);

        make_hud_in_element("spec_hud", false, true);
        setup_hud_references();
    });

    function setup_hud_references() {
        // Reset previous references
        global_hud_references.chat_messages.length = 0;
        global_hud_references.chat_container.length = 0;
        global_hud_references.game_report_chat_messages = _id("game_report_cont").querySelector(".chat_messages");
        global_hud_references.game_report_chat_input = _id("game_report_cont").querySelector(".chat_input");
        _for_each_with_class_in_parent(game_hud_special, "chat_messages", el => global_hud_references.chat_messages.push(el));
        _for_each_with_class_in_parent(game_hud_special, "chat_container", el => global_hud_references.chat_container.push(el));
        global_hud_references.fraglog.length = 0;
        global_hud_references.you_fragged.length = 0;
        _for_each_with_class_in_parent(real_hud_container, "fraglog", el => global_hud_references.fraglog.push(el));
        _for_each_with_class_in_parent(real_hud_container, "elem_you_fragged", el => global_hud_references.you_fragged.push(el));

        global_hud_references.editing_info.length = 0;
        _for_each_with_class_in_parent(game_hud_special, "elem_editing_info", el => global_hud_references.editing_info.push(el));
    }

    bind_event('set_checkbox', function (variable, value) {

    });
    
    // Called after connecting to a server, usually before map loading in normal cases, we reset the hud state back to its default here
    let global_on_after_connected = false;
    bind_event('on_connected', function() {
        console.log("on_connected");

        global_hud_view_active = true;

        engine.call("hud_mouse_control", false);
        console.log("hud_mouse_control false #1");
        engine.call('set_chat_enabled', false);
        global_game_report_active = false;

        _id("play_of_the_game").style.display = "none";
        _id("game_loading_message").style.display = "none";
        _id("game_intro_screen").style.display = "none";
        _id("join_menu").style.display = "none";
        _id("game_over_screen").style.display = "none";
        _id("game_report_cont").style.display = "none";
        _id("game_report").style.display = "none";
        _id("aim_report").style.display = "none";
        _id("rank_screen").style.display = "none";

        // clear the previous progression update
        clear_battle_pass_progression();

        anim_show(game_hud_special, 0);

        // Clear the chat history
        _for_each_with_class_in_parent(game_hud_special, "chat_messages", el => { _empty(el); });
        _for_each_with_class_in_parent(_id("game_report_cont"), "chat_messages", el => { _empty(el); });

        current_match = new Match([]);

        global_on_after_connected = true;
    });

    bind_event('on_map_loaded', function () {
        console.log("on_map_loaded");
        global_hud_view_active = true;
    });

    // game_manifest is sent after connecting / loading the map
    bind_event("game_manifest", function(manifest) {
        //console.log("game_manifest");

        global_show_rank_change = false;

        if (manifest) {
            var mani = JSON.parse(manifest);
            //console.log("manifest",_dump(mani));

            if (mani.match_id in match_data) {
                current_match = match_data[mani.match_id];
            }
            current_match.map = mani.map;
            current_match.match_type = mani.match_type;
            current_match.mode = mani.mode;
            current_match.mm_mode = mani.mm_mode;
            current_match.setManifest(mani);
            cleanup_match_data();

            // Reset any previous intervals, otherwise the countdown time would continue to be lowered again after being set here
            if (global_game_report_countdown_interval) clearInterval(global_game_report_countdown_interval);

            if ("lingering_time" in mani) global_game_report_countdown = Number(mani.lingering_time);

            _id("game_intro_mode").textContent = localize(global_game_mode_map[mani.mode].i18n);
            _id("game_intro_map").textContent = _format_map_name(mani.map);

            let server = '';
            if (mani.location in global_region_map) {
                server += localize(global_region_map[mani.location].i18n);
                if (global_region_map[mani.location].provider.length) server += " - "+global_region_map[mani.location].provider;
            }
            _id("game_intro_server").textContent = server;
  
            if (!global_hud_is_visible) {
                anim_show(_id("game_intro_screen"));
            }
        }

        //_id("game_loading_message").style.display = "block";
    });

    bind_event("change_pause_state", function(paused, player_id) {
        let name = false;
        for (let i=0; i<game_data.teams.length; i++) {
            for (let y=0; y<game_data.teams[i].players.length; y++) {
                if (parseInt(game_data.teams[i].players[y].player_id) == player_id) {
                    name = game_data.teams[i].players[y].name;
                    break;
                }
            }
            if (name) break;
        }

        if (!name) {
            for (let y=0; y<game_data.spectators[i].length; y++) {
                if (game_data.spectators[i].player_id == player_id) {
                    name = game_data.spectators[i].name;
                    break;
                }
            }
        }

        if (paused) {
            _id("paused_message").style.display = "flex";

            if (name) addServerChatMessage(localize_ext("ingame_chat_msg_client_match_paused", {"name": name}));
            else addServerChatMessage(localize("ingame_chat_msg_match_paused"));

        } else {
            _id("paused_message").style.display = "none";

            if (name) addServerChatMessage(localize_ext("ingame_chat_msg_client_match_unpaused", {"name": name}));
            else addServerChatMessage(localize("ingame_chat_msg_match_unpaused"));
        }
    });

    bind_event("server_log_message", function(key, value1, value2) {
        if (key == "connecting") {
            addServerChatMessage(localize_ext("ingame_chat_msg_client_connecting", {"name": value1}));
        } else if (key == "disconnected") {
            addServerChatMessage(localize_ext("ingame_chat_msg_client_disconnected", {"name": value1}));
        } else if (key == "join_team") {
            addServerChatMessage(localize_ext("ingame_chat_msg_client_joined_team", {"name": value1, "team": value2}));
        } else if (key == "join_spec") {
            addServerChatMessage(localize_ext("ingame_chat_msg_client_joined_spec", {"name": value1}));
        }
    });

    bind_event('show_score', function (visible) {
        /* replaced with native scoreboard
        if (visible){
            _id("scoreboard").style.display = "flex";            
        } else {
            _id("scoreboard").style.display = "none";
        }
        */
    });

    bind_event("show_game_over", show_game_over);

    bind_event('set_respawn_timer', function (time_ms) {
        //console.log("respawning in time_seconds " + time_ms);
        /*
        var el = _id("respawn_timer");
        if (el) {
            if (time_ms == -1) {
                el.style.display = "none";
            } else {
                _html(el, Math.round(time_ms / 1000));
                el.style.display = "flex";
            }
        }
        */

        if (!game_data.show_respawn_timers) return;

        let seconds = Math.round(time_ms/1000);
        if (seconds == 0) return;

        let div = _createElement("div");
        div.appendChild(_createElement("div", "text", localize("ingame_message_respawning_in")));
        div.appendChild(_createElement("div", ["countdown", "medium"], seconds));
        showAnnounce(div, 1, 1000, 1000);
    });

    /* replaced by player_name hud element
    bind_event('following_state_changed', function (name, target_id, color) { // color currently not a thing yet, need frog
        var el = _id("following_label");
        if (name.length) {
            _html(el, "Following " + (color?"<span style='color:" + color + "'>" + name + "</span>":name));
            el.style.display = "flex";
        } else {
            _empty(el);
            el.style.display = "none";
        }
    });
    */

    bind_event('reset_shop', function () {
        console.log("reset_shop");
    });

    bind_event('show_ingame_hud', function (visible) {
        console.log("show_ingame_hud " + visible);
        engine.call("hud_mouse_control", false);
        console.log("hud_mouse_control false #2");

        if (visible) {
            _id("game_intro_screen").style.display = "none";
            _id("game_loading_message").style.display = "none";

            if (global_on_after_connected) {
                global_on_after_connected = false;
                
                // The model doesn't seem to be filled yet when show_ingame_hud is called?
                /* Commented because it hasn't really worked yet
                if (game_data && game_data.spectator && game_data.game_stage > 0 && game_data.team_switching > 0) {
                    join_menu_visible(true);
                    return;
                }
                */
            }
            anim_show(_id("game_hud"));
            global_hud_is_visible = true;
        } else {
            _id("paused_message").style.display = "none";
            anim_hide(_id("game_hud"));
            global_hud_is_visible = false;
        }
    });

    bind_event('show_non_editing_game_hud', function (visible) {
        console.log("show_non_editing_game_hud " + visible);
        if (visible) {
            anim_show(_id("non_editing_hud_container"));
        } else {
            anim_hide(_id("non_editing_hud_container"));
        }
    });


    bind_event("show_respawn_message", function (keybind, enabled){
        console.log("show_respawn_message", enabled);
        //keybind not used atm, since it's attack to respawn.

        // Hack to make sure the intro message goes away when you initially spawn
        if (enabled == false && global_hud_is_visible) {
            _id("game_intro_screen").style.display = "none";
            _id("game_loading_message").style.display = "none";
        }

        if(enabled)
            anim_show(_id("respawn_message"));
        else
            anim_hide(_id("respawn_message"));
    });

    bind_event("set_player_respawn_timer", function (player_id, time_ms){
        /*
        var player_icon = _id("player_icon_" + player_id);
        if (player_icon){
            var player_icon_respawn_timer = player_icon.getElementsByClassName("player_respawn_timer")[0];
           
            if(player_icon_respawn_timer){
                _html(player_icon_respawn_timer, Math.round(time_ms / 1000));
            }
        }
        */
    });


    bind_event("fragged_by", function(player_name){
        showAnnounce(localize_ext("ingame_message_fragged_by", {"name": player_name}), false, 2000, 0, false);
    });

    bind_event("self_frag", function(){
        showAnnounce(localize("ingame_message_fragged_self"), false, 2000, 0, false);
    });

    bind_event('announce', function(text, large, fade_out_ms, duration_ms, clear_before) {
        console.log("================== announce", text);
        showAnnounce(text, (large ? 1 : 0), fade_out_ms, duration_ms);
    });


    bind_event('self_respawn', function() {

    });


    

    function showAnnounce(text, large, fade_out_ms, duration_ms){
        if (!text) return;

        var container = _id("announcements");
        _empty(container);
        
        var new_line = _createElement("div", "inner");
        if (large == 1) new_line.classList.add("large");
        if (large == 2) new_line.classList.add("larger");

        if (text.nodeType == undefined) {
            // Text
            _html(new_line, text);
        } else if (text.nodeType == 1 || text.nodeType == 11) {
            // Element Node
            new_line.appendChild(text);
        }

        container.insertBefore(new_line, container.firstChild);
        anim_start({
            element: new_line,
            delay: duration_ms,
            opacity: [1, 0],
            duration: fade_out_ms,
            remove: true
        });
    };

    bind_event('announce_message', function(key, value) {
        if (key == "countdown") {
            showAnnounce(value, 2, 1000, 0);
        } else if (key == "round_countdown") {
            let cont = _createElement("div");
            cont.appendChild(_createElement("div", "text", localize("ingame_message_round_begins_in")));
            cont.appendChild(_createElement("div", "countdown", value));
            showAnnounce(cont, 1, 1000, 1000);
        } else if (key == "respawn_countdown") {
            let cont = _createElement("div");
            cont.appendChild(_createElement("div", "text", localize("ingame_message_respawning_in")));
            cont.appendChild(_createElement("div", ["countdown", "medium"], Math.round(value/1000)));
            showAnnounce(cont, 1, 1000, 1000);
        } else if (key == "pre_countdown") {
            let cont = _createElement("div");
            cont.appendChild(_createElement("div", ["text", "upper"], localize("ingame_message_get_ready")));
            cont.appendChild(_createElement("div", ["text", "small"], localize_ext("ingame_message_start_countdown", {"seconds": value })));
            showAnnounce(cont, 0, value == 0?300:0, 1100);
        } else if (key == "overtime") {
            let cont = _createElement("div");
            cont.appendChild(_createElement("div", ["text", "upper"], localize("ingame_message_overtime")));
            cont.appendChild(_createElement("div", ["text", "small"], localize_ext("ingame_message_overtime_seconds", {"seconds": value })));
            showAnnounce(cont, 1, 1000, 1000);
        } else if (key == "score_overtime") {
            let cont = _createElement("div");
            cont.appendChild(_createElement("div", ["text", "upper"], localize("ingame_message_overtime")));
            cont.appendChild(_createElement("div", ["text", "small"], localize_ext("ingame_message_overtime_fraglimit", {"score": value })));
            showAnnounce(cont, 1, 1000, 1000);
        } else if (key == "fight") {
            showAnnounce(localize("ingame_message_fight"), 2, 500, 900);
        } else if (key == "saved_map") {
            showAnnounce(localize_ext("editor_saved_map", {"name": value }), 0, 300, 2000);
        } else if (key == "baked_map") {
            showAnnounce(localize_ext("editor_baked_map", {"seconds": value/1000 }), 0, 300, 2000);
        } else if (key == "bake_map_failed") {
            showAnnounce(localize("editor_map_bake_failed"), 0, 300, 2000);
        }
    });

    bind_event('set_time', function (time, warmup, game_mode, round, extraDataJSON) {

        /* 
        // REPLACED WITH SNAFU ELEMENTS

        var extraData = JSON.parse(extraDataJSON);
        //console.log("==============");
        //console.log("set_time", time,warmup,game_mode,round);
        //console.log(_dump(extraData));
       
        var time_limit = parseInt(extraData[0]);
        var overtime_seconds = parseInt(extraData[1]);
        var tide_time_offset = parseInt(extraData[2]);
        var in_overtime_frag_mode = extraData[3];
        var dynamic_overtime_frag_limit = parseInt(extraData[4]);

        current_match.game_time_for_chat = _seconds_to_digital(time);  // hacky shoehorning timestamp for chat msg

        var game_state = '';
        if (warmup) {
            // Warmup
            game_state = localize("ingame_message_warmup");
        } else {
            if (CUSTOM_ROUND_BASED_MODES.includes(game_mode)) {
                // Round X
                game_state = localize_ext("ingame_message_round", {"round": (round + 1) });
            } else {
                var limit_overtime = time_limit + overtime_seconds + tide_time_offset;

                if (overtime_seconds) {
                    // XX:XX Overtime
                    game_state = _seconds_to_digital(limit_overtime)+" "+localize("ingame_message_overtime");
                } else {

                    if (time_limit !== 0) {
                        if (current_match.confirmation_frag_time) {
                            // Golden Frag
                            game_state = localize("ingame_message_golden_frag");
                        } else if (in_overtime_frag_mode === true) {
                            game_state = localize_ext("ingame_message_overtime_fraglimit", {"score": dynamic_overtime_frag_limit });
                        } else {
                            // XX:XX
                            game_state = _seconds_to_digital(limit_overtime);
                        }    
                    }

                }
            }
        }

        for (let el of global_hud_references.time_limit) {
            el.textContent = game_state;
        }

        var timeLeft = (time_limit + overtime_seconds + tide_time_offset) - time;
        if (timeLeft < 0) timeLeft = 0;

        var minutes = Math.floor(time / 60);
        var seconds = time % 60;

        var time_left_minutes = Math.floor(timeLeft / 60);
        var time_left_seconds = timeLeft % 60;

        for (let el of global_hud_references.game_timer) {
            if (el.dataset.analog == 1) {
                if(el.dataset.countdown == 1){
                    el.children[0].children[0].style.transform = "rotate("+(time_left_seconds*6)+"deg)";
                    el.children[0].children[1].style.transform = "rotate("+(time_left_minutes*30+time_left_seconds/2)+"deg)";
                } else {
                    el.children[0].children[0].style.transform = "rotate("+(seconds*6)+"deg)";      
                    el.children[0].children[1].style.transform = "rotate("+(minutes*30+seconds/2)+"deg)";   
                }
            } else {
                if (el.dataset.countdown == 1){
                    el.textContent = _seconds_to_digital(timeLeft);
                } else {
                    el.textContent = _seconds_to_digital(time);
                }
            }
        }
        
        // hacky experimental piggybacking for a system clock element, should be moved elsewhere when finalized so that seconds update aren't synced to game time
        var piggyback_today = new Date();
        var piggyback_local_hour = piggyback_today.getHours();
        var piggyback_local_min  = piggyback_today.getMinutes();
        var piggyback_local_sec  = piggyback_today.getSeconds();
        var piggyback_local_time = piggyback_local_hour + ":" + (piggyback_local_min<10?"0"+piggyback_local_min:piggyback_local_min) + ":" + (piggyback_local_sec<10?"0"+piggyback_local_sec:piggyback_local_sec);
        for (let el of global_hud_references.system_clock) {
            if (el.dataset.analog == 1) {
                el.children[0].children[0].style.transform = "rotate("+(piggyback_local_min*6 + piggyback_local_sec/10)+"deg)";
                el.children[0].children[1].style.transform = "rotate("+(piggyback_local_hour*30 + piggyback_local_min/2 + piggyback_local_sec/120)+"deg)";      
            } else {
                el.textContent = piggyback_local_time;
            }
        }
        */
    });




    bind_event("player_needs_confirmation_frag", function (player_id) {
        current_match.confirmation_frag_time = true;
    });

    bind_event('set_hud_game_mode', function (mode) {
        //engine.call("echo", 'set_hud_game_mode ' + mode.toUpperCase());
/*
        
        _for_each_with_class_in_parent(real_hud_container, "scoreboard_gamemode_name", el => {
            el.textContent = mode.toUpperCase();
        });
        
        
        anim_show(_id("teamscore_container"));

        {
            let el = _id("teams_scoreboard");
            if (el) el.style.display = "none";
        }
        */
    });
    
    bind_event('set_zoom', function (enabled) {
        crosshair_containers[0].style.display      = enabled ? "none" : "flex"; // crosshair
        crosshair_containers[1].style.display      = enabled ? "none" : "flex"; // hitmarker

        zoom_crosshair_containers[0].style.display = enabled ? "flex" : "none"; // crosshair
        zoom_crosshair_containers[1].style.display = enabled ? "flex" : "none"; // hitmarker

        mask_containers[0].style.display           = enabled ? "none" : "flex"; // normal mask
        mask_containers[1].style.display           = enabled ? "flex" : "none"; // zoomed mask
    });

    bind_event('set_hud_weapon', function (settings_weapon_crosshair_index, settings_zoom_weapon_crosshair_index, weapon_index) {
        currently_held_weapon_index = weapon_index;
        set_hud_weapon_crosshair(settings_weapon_crosshair_index);
        set_hud_zoom_weapon_crosshair(settings_zoom_weapon_crosshair_index);
    });

    bind_event("show_play_of_the_game", function (show, player_name) {
        return;
        if (show) {

            _id("play_of_the_game_player").textContent = player_name
            
            _id("play_of_the_game").style.transform = "translateX(-50vh)";
            anim_show(_id("play_of_the_game"), 100, "flex")
            anim_start({
                element: _id("play_of_the_game"),
                translateX: [-50, 30, "vh"],
                duration: 300,
                easing: easing_functions.easeOutQuad,
            });
        } else {
            anim_hide(_id("play_of_the_game"));
        }
    });

    // load callbacks from other files
    init_hud_screen_game_report();
    init_hud_screen_aim_report();

    // load shared code between menu and hud views
    init_shared();

    setupMenuSoundListeners();

    init_debug_listeners();

    window.requestAnimationFrame(anim_update);


    engine.call("hud_view_loaded");
});


////////////////////
// TEST FUNCTIONS //
////////////////////
function init_debug_listeners() {

    // /devop ui_call test_rank <id>
    bind_event("test_rank", function(id) {
        let mmr_updates = null;
        let timeout = 0;
        if (id == "0") {
            mmr_updates = {
                "from": {
                    "rating": 1500,
                    "rank_tier": 25,
                    "rank_position": 1,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "to": {
                    "rating": 1520,
                    "rank_tier": 25,
                    "rank_position": 1,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "mode": "r_duel",
                "match_type": 2,
                "placement_match": 0,
                "ranked": true
            };
            timeout = 10000;
        }
        if (id == "1") {
            mmr_updates = {
                "from": {
                    "rating": 1547.7387406072,
                    "rank_tier": 25,
                    "rank_position": null,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "to": {
                    "rating": 1573.6258831622672,
                    "rank_tier": 40,
                    "rank_position": 7,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "mode": "r_duel",
                "match_type": 2,
                "placement_match": 0,
                "ranked": true
            };
            timeout = 12000;
        }
        if (id == "2") {
            mmr_updates = {
                "from": {
                    "rating": 1547.7387406072,
                    "rank_tier": 32,
                    "rank_position": null,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "to": {
                    "rating": 1500.6258831622672,
                    "rank_tier": 31,
                    "rank_position": null,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "mode": "r_duel",
                "match_type": 2,
                "placement_match": 0,
                "ranked": true
            };
            timeout = 10000;
        }
        if (id == "3") {
            mmr_updates = {
                "from": {
                    "rank_tier": null,
                    "rank_position": null,
                    "cur_tier_req": 0,
                    "next_tier_req": 0,
                    "placement_matches": "1010111"
                },
                "to": {
                    "rank_tier": null,
                    "rank_position": null,
                    "cur_tier_req": 0,
                    "next_tier_req": 0,
                    "placement_matches": "10101110"
                },
                "mode": "r_solo",
                "match_type": 2,
                "placement_matches": 10,
                "placement_match": 1,
                "ranked": true
            };
            timeout = 10000;
        }
        if (id == "4") {
            mmr_updates = {
                "from": {
                    "rank_tier": null,
                    "rank_position": null,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650,
                    "placement_matches": "101011101"
                },
                "to": {
                    "rating": 1693,
                    "rank_tier": 31,
                    "rank_position": null,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650,
                    "placement_matches": "1010111011"
                },
                "mode": "r_duel",
                "match_type": 2,
                "placement_matches": 10,
                "placement_match": 1,
                "ranked": true
            };
            timeout = 18000;
        }
        if (id == "5") {
            mmr_updates = {
                "from": {
                    "rating": 1500,
                    "rank_tier": 25,
                    "rank_position": null,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "to": {
                    "rating": 1520,
                    "rank_tier": 25,
                    "rank_position": null,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "mode": "r_duel",
                "match_type": 3,
                "placement_match": 0,
                "ranked": true
            };
            timeout = 10000;
        }
        if (id == "6") {
            mmr_updates = {
                "from": {
                    "rating": 1547.7387406072,
                    "rank_tier": 25,
                    "rank_position": null,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "to": {
                    "rating": 1573.6258831622672,
                    "rank_tier": 26,
                    "rank_position": null,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "mode": "r_duel",
                "match_type": 3,
                "placement_match": 0,
                "ranked": true
            };
            timeout = 10000;
        }
        if (id == "7") {
            mmr_updates = {
                "from": {
                    "rating": 1547.7387406072,
                    "rank_tier": 34,
                    "rank_position": 115,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "to": {
                    "rating": 1600.6258831622672,
                    "rank_tier": 33,
                    "rank_position": 50,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "mode": "r_duel",
                "match_type": 3,
                "placement_match": 0,
                "ranked": true
            };
            timeout = 13000;
        }
        if (id == "8") {
            mmr_updates = {
                "from": {
                    "rating": null,
                    "rank_tier": 0,
                    "rank_position": null,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "to": {
                    "rating": 370,
                    "rank_tier": 2,
                    "rank_position": null,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "mode": "r_duel",
                "match_type": 3,
                "placement_match": 0,
                "ranked": true
            };
            timeout = 10000;
        }

        if (mmr_updates) hudUITestRankScreen(mmr_updates, timeout);
    });
}

function hudUITestRankScreen(mmr_updates, delay) {
    global_show_rank_change = true;
    global_hud_view_active = true;
    renderRankScreen(mmr_updates);
    
    anim_show(_id("game_report"), 500, "flex");

    if (global_show_rank_change) {
        showRankScreen(null, true);

        anim_show(_id("game_report_cont"), 500, "flex");
        global_show_rank_change = false;

        setTimeout(function() {
            anim_hide(_id("game_report"));
            anim_hide(_id("game_report_cont"));
        }, delay)
    }
}

function play_tracked_sound(sound_key) {
    if (!global_hud_view_active) return;
    engine.call('ui_sound_tracked', sound_key);
}

function show_game_over(show, placement, team_count) {
    //console.log("show_game_over", show, placement, team_count);

    _id("game_over_screen").style.display = show ? 'block' : 'none';

    let el_victory = _id("game_over_victory");
    let el_defeat = _id("game_over_defeat");
    let el_placement = _id("game_over_placement");

    let sound = "";
    let music = "";
    let anim = "";

    if (show) {
        anim = "v";
        if (team_count <= 2) {
            if (placement == 0) {
                el_victory.style.display = "flex";
                el_defeat.style.display = "none";
                el_placement.style.display = "none";
                anim = "v";
                sound = "announcer_common_game_win";
                music = "music_victory";
            } else {
                el_victory.style.display = "none";
                el_defeat.style.display = "flex";
                el_placement.style.display = "none";
                anim = "d";
                sound = "announcer_common_game_loss";
                music = "music_defeat";
            }
        } else {
            if (placement == 0) {
                el_victory.style.display = "flex";
                el_defeat.style.display = "none";
                el_placement.style.display = "none";
                anim = "v";
                sound = "announcer_common_game_win";
                music = "music_victory";
            } else {
                if (placement == 1)       { el_placement.textContent = localize("ingame_placement_2"); sound = "announcer_common_place_02"; }
                else if (placement == 2)  { el_placement.textContent = localize("ingame_placement_3"); sound = "announcer_common_place_03"; }
                else if (placement == 3)  { el_placement.textContent = localize("ingame_placement_4"); sound = "announcer_common_place_04"; }
                else if (placement == 4)  { el_placement.textContent = localize("ingame_placement_5"); sound = "announcer_common_place_05"; }
                else if (placement == 5)  { el_placement.textContent = localize("ingame_placement_6"); sound = "announcer_common_place_06"; }
                else if (placement == 6)  { el_placement.textContent = localize("ingame_placement_7"); sound = "announcer_common_place_07"; }
                else if (placement == 7)  { el_placement.textContent = localize("ingame_placement_8"); sound = "announcer_common_place_08"; }
                else if (placement == 8)  { el_placement.textContent = localize("ingame_placement_9"); sound = "announcer_common_place_09"; }
                else if (placement == 9)  { el_placement.textContent = localize("ingame_placement_10"); sound = "announcer_common_place_10"; }
                else if (placement == 10) { el_placement.textContent = localize("ingame_placement_11"); sound = "announcer_common_place_11"; }
                else if (placement == 11) { el_placement.textContent = localize("ingame_placement_12"); sound = "announcer_common_place_12"; }
                else if (placement == 12) { el_placement.textContent = localize("ingame_placement_13"); sound = "announcer_common_game_loss"; }
                else if (placement == 13) { el_placement.textContent = localize("ingame_placement_14"); sound = "announcer_common_game_loss"; }
                else if (placement == 14) { el_placement.textContent = localize("ingame_placement_15"); sound = "announcer_common_game_loss"; }
                else if (placement == 15) { el_placement.textContent = localize("ingame_placement_16"); sound = "announcer_common_game_loss"; }
                else if (placement == 16) { el_placement.textContent = localize("ingame_placement_17"); sound = "announcer_common_game_loss"; }
                else if (placement == 17) { el_placement.textContent = localize("ingame_placement_18"); sound = "announcer_common_game_loss"; }
                else if (placement == 18) { el_placement.textContent = localize("ingame_placement_19"); sound = "announcer_common_game_loss"; }
                else if (placement == 19) { el_placement.textContent = localize("ingame_placement_20"); sound = "announcer_common_game_loss"; }

                el_victory.style.display = "none";
                el_defeat.style.display = "none";
                el_placement.style.display = "flex";
                anim = "p";
                music = "music_defeat";
            }
            
        }

        engine.call("sound_clear_queue");
        if (sound.length) setTimeout( function() { engine.call("ui_sound_queue", sound); }, 200);

        if (music.length) engine.call("ui_sound", music);

        setTimeout( function () { start_animation("game_over_effect", 25, 15, 0, 0) }, 400);

        if (anim == "v") play_anim("game_over_victory", "game_over_anim");
        else if (anim == "d") play_anim("game_over_defeat", "game_over_anim");
        else if (anim == "p") play_anim("game_over_placement", "game_over_anim");

    } else {
        el_victory.style.display = "none";
        el_defeat.style.display = "none";
        el_placement.style.display = "none";
    }
}