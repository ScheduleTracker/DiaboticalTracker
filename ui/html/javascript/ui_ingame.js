const IS_MENU_VIEW = false;

//This forces the browser to load in and cache the images
/*
var weapon_svgs = [
    'images/weapon_bl.svg#Layer_1',
    'images/weapon_sh.svg#Layer_1',
    'images/weapon_rl.svg#Layer_1',
    'images/weapon_df.svg#Layer_1',
    'images/weapon_pncr.svg#Layer_1',
    'images/weapon_mac.svg#Layer_1',
    'images/weapon_gl.svg#Layer_1',
    'images/weapon_cb.svg#Layer_1',
    'images/weapon_bfg.svg#Layer_1',
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

// This preloads and renders the images of items
let global_preload_trick_container = _id("preload_trick_container");
for (let item of Object.keys(global_item_name_map)) {
    var div = document.createElement('div');
    div.style.backgroundImage = "url('"+global_item_name_map[item][2]+"?color="+global_item_name_map[item][0]+"')";
    global_preload_trick_container.appendChild(div);
}


class Match {
    constructor(players, game_mode, time_elapsed) {
        this.players = players;
        this.game_mode = game_mode;
        this.time_elapsed = time_elapsed;
    }
}



var current_match = new Match([]);
var my_player_object;

var currentGameState = -1;

var GameStatesEnum = Object.freeze({
    "WaitingForPlayers": 0, 
    "Warmup": 1, 
    "Playing": 2, 
    "BetweenRounds": 3, 
    "Finished": 4
});
var my_player_id;
var my_team_id;

var global_onload_callbacks = [];
var global_onload_callbacks_hud = [];
var global_shared_onload_callbacks = [];

var mask_containers = [];
var zoom_crosshair_containers = [];
var crosshair_containers = [];
function initialize_references() {
    hud_containers = [_id("real_hud"), _id("hud_preview")];
    real_hud_element = _id("real_hud");
    real_3D_hud_element = _id("real_3D_hud");
    preview_hud_element = _id("hud_preview");

    crosshair_containers = [];
    zoom_crosshair_containers = [];
    mask_containers = [_id("game_masks_container"), _id("game_masks_container_zoom")];
    _for_each_in_class("game_crosshairs_container", function(el) { crosshair_containers.push(el); });
    _for_each_in_class("game_zoom_crosshairs_container", function(el) { zoom_crosshair_containers.push(el); });
    _for_each_in_class("crosshair_preview_container", function(el) { crosshair_containers.push(el); });
}


var global_hud_is_visible = false;
var global_show_rank_change = false;

window.addEventListener("load", function(){

    console.log("load");

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
    for (var i = 0; i < global_onload_callbacks.length; i++){
        global_onload_callbacks[i]();
    }

    bind_event('view_data_received', function(string) {
        // data from another view received
        console.log('view_data_received', string);
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

            if (json_data.action && json_data.action == "post-match-updates") {
                console.log("post-match-updates", _dump(json_data));
                console.log("ranked:",json_data.data.mmr_updates.ranked);
                if ("mmr_updates" in json_data.data && json_data.data.mmr_updates.ranked) {
                    global_show_rank_change = true;
                    renderRankScreen(json_data.data.mmr_updates);
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
    
    bind_event('hud_changed', function (jsonStr) {
        //console.log("post_load_setup_hud_editor 3");
        try {
            editing_hud_data = JSON.parse(jsonStr);
        } catch (err) {
            console.log("Unable to parse hud definition, definition string may have been too long when it was saved and got cut off");
            engine.call("echo", "Unable to parse hud definition, definition string may have been too long when it was saved and got cut off");
        }
        make_hud_in_element("real_hud", false);
        gameface_strafe_prefetch_check();
        element_chat_setup();
    });


    engine.call('get_hud_json').then(function (jsonStr) {
        //console.log("post_load_setup_hud_editor 3");
        try {
            editing_hud_data = JSON.parse(jsonStr);
        } catch (err) {
            console.log("Unable to parse hud definition, definition string may have been too long when it was saved and got cut off");
            engine.call("echo", "Unable to parse hud definition, definition string may have been too long  when it was saved and got cut off");
        }
        make_hud_in_element("real_hud", false);
        element_chat_setup();
    });
    
    bind_event('set_checkbox', function (variable, value) {

    });
    
    // Called after connecting to a server, usually before map loading in normal cases, we reset the hud state back to its default here
    let global_on_after_connected = false;
    bind_event('on_connected', function() {
        console.log("on_connected");

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
        _id("rank_screen").style.display = "none";

        anim_show(_id("hud_load_during_loading"), 0);

        // Clear the chat history
        _for_each_with_class_in_parent(_id("hud_load_during_loading"), "chat_messages", el => { _empty(el); });
        _for_each_with_class_in_parent(_id("game_report_cont"), "chat_messages", el => { _empty(el); });

        current_match = new Match([]);

        global_on_after_connected = true;
    });

    bind_event('on_map_loaded', function () {
        console.log("on_map_loaded");
    });

    // game_manifest is sent after connecting / loading the map
    bind_event("game_manifest", function(manifest) {
        //console.log("game_manifest", manifest);

        if (manifest) {
            var mani = JSON.parse(manifest);

            if ("lingering_time" in mani) global_game_report_countdown = Number(mani.lingering_time);        
            if (Number(mani.continuous) == 0) global_game_report_countdown = global_game_report_countdown + 5;

            _id("game_intro_mode").textContent = localize(global_game_mode_map[mani.mode].i18n);
            _id("game_intro_map").textContent = _format_map_name(mani.map);

            let server = '';
            if (mani.location in global_region_map) {
                server += localize(global_region_map[mani.location].i18n);
                if (global_region_map[mani.location].provider.length) server += " - "+global_region_map[mani.location].provider;
            }
            _id("game_intro_server").textContent = server;
  
            anim_show(_id("game_intro_screen"));
        }

        //_id("game_loading_message").style.display = "block";
    });

    bind_event("change_pause_state", function(paused, player_id){

        if (paused) {
            _id("paused_message").style.display = "flex";
            const player = current_match.players.find(p => p.id === player_id);

            if (player) {
                addServerChatMessage(player.player + " paused the game.");
            } else {
                addServerChatMessage("Spectator paused the game.");
            }
        } else {
            _id("paused_message").style.display = "none";
            const player = current_match.players.find(p => p.id === player_id);

            if (player) {
                addServerChatMessage(player.player + " unpaused the game.");
            } else {
                addServerChatMessage("Spectator unpaused the game.");
            }
        }
    });

    bind_event('show_score', function (visible) {
        console.log("show_score", visible);
        if (visible){
            _id("teams_scoreboard").style.display = "";            
        } else {
            _id("teams_scoreboard").style.display = "none";
        }
    });

   bind_event("show_game_over", function (show, victory) {
        console.log("show_game_over", show);
        _id("game_over_screen").style.display = show ? 'block' : 'none';
        if (show) {
            if (victory) {
                _id("game_over_victory").style.display = "flex";
                _id("game_over_defeat").style.display = "none";
            } else {
                _id("game_over_defeat").style.display = "flex";
                _id("game_over_victory").style.display = "none";
            }
            setTimeout( function () { start_animation("game_over_effect", 25, 15, 0, 0) }, 400);
            if (victory) {
                play_anim("game_over_victory", "game_over_anim");
            } else {
                play_anim("game_over_defeat", "game_over_anim");
            }
        } else {
            _id("game_over_defeat").style.display = "none";
            _id("game_over_victory").style.display = "none";
        }
    });


    bind_event('set_respawn_timer', function (time_ms) {
        //engine.call("echo","time_seconds " + time_seconds);
        var el = _id("respawn_timer");
        if (el) {
            if (time_ms == -1) {
                el.style.display = "none";
            } else {
                _html(el, Math.round(time_ms / 1000));
                el.style.display = "flex";
            }
        }
    });

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
        var player_icon = _id("player_icon_" + player_id);
        if (player_icon){
            var player_icon_respawn_timer = player_icon.getElementsByClassName("player_respawn_timer")[0];
           
            if(player_icon_respawn_timer){
                _html(player_icon_respawn_timer, Math.round(time_ms / 1000));
            }
        }
    });


    bind_event("fragged_by", function(player_name){
        showAnnounce(localize_ext("ingame_message_fragged_by", {"name": player_name}), false, 2000, 0, false);
    });

    bind_event("self_frag", function(){
        showAnnounce(localize("ingame_message_fragged_self"), false, 2000, 0, false);
    });

    bind_event('announce', function(text, large, fade_out_ms, duration_ms, clear_before) {
        console.log("================== announce", text);
        showAnnounce(text, large, fade_out_ms, duration_ms, clear_before);
    });


    bind_event('self_respawn', function() {
        /*_for_each_with_class_in_parent(real_hud_element, "ability_skill2", function (element) {
            var chargeBar = _get_first_with_class_in_parent(element, "powerup_charge_bar");

            anim_start({
                element: chargeBar,
                height: [0, 100],
                duration: 60 * 1000,
                easing: easing_functions.linear,
            });
   
        });*/
    });


    

    function showAnnounce(text, large, fade_out_ms, duration_ms, clear_before){
        var container = _id("announcements");
        if (clear_before) {
            _empty(container);
        }
        
        var new_line = document.createElement("DIV");
        if (large) {
            new_line.classList.add("large_announcement");
        }
        _html(new_line, text);
        container.insertBefore(new_line, container.firstChild);
        anim_start({
            element: new_line,
            delay: duration_ms,
            opacity: [1, 0],
            duration: fade_out_ms,
            remove: true
        });
        return new_line;
    };

    bind_event('announce_message', function(key, value) {
        if(key == "countdown"){
            showAnnounce(value, true, 1000, 0, true);
        }
        else if(key == "round_countdown"){
            showAnnounce(localize_ext("ingame_message_round_begins_in", {"seconds": value }), true, 1000, 0, true);
        }
        else if(key == "pre_countdown"){
            showAnnounce(localize_ext("ingame_message_start_countdown", {"seconds": value }), false, value == 0?300:0, 1100, true);
        }
        else if(key == "overtime"){
            showAnnounce(localize_ext("ingame_message_overtime_seconds", {"seconds": value }), false, 1000, 1000, true);
        }
        else if(key == "fight"){
            showAnnounce(localize("ingame_message_fight"), true, 1000, 1000, true);
        }
    });

    bind_event('set_time', function (time, warmup, game_mode, round, extraDataJSON) {


        var extraData = JSON.parse(extraDataJSON);
        //console.log("==============");
        //console.log(time,warmup,game_mode,round);
        //console.log(_dump(extraData));
       

        var time_limit = parseInt(extraData[0]);
        var overtime_seconds = parseInt(extraData[1]);
        var tide_time_offset = parseInt(extraData[2]);


        var minutes = Math.floor(time / 60);
        var seconds = time % 60;

        var formattedMinutes = ("0" + minutes).slice(-2);
        var formattedSeconds = ("0" + seconds).slice(-2);

        var outputString = formattedMinutes + ":" + formattedSeconds;
        current_match.game_time_for_chat = outputString;  // hacky shoehorning timestamp for chat msg
        var gameStateString = "";

        if (game_mode == "ca") {
            gameStateString += "<p class=label>"+localize_ext("ingame_message_round",{"round": (round + 1) })+"</p>";
        } else if (overtime_seconds) {
            gameStateString += "<p class=label>"+localize("ingame_message_overtime")+"</p>";
        }

        {
            let el = _id("current_gamestate");
            if (el) _html(el, gameStateString);
        }

        if (warmup) {
            _for_each_with_class_in_parent(real_hud_element, 'elem_time_limit', function(el){
                _html(el, localize("ingame_message_warmup"));
            });
        } else {

            if (time_limit !== 0) {
                var limit_overtime = time_limit + overtime_seconds + tide_time_offset;

                if (current_match.confirmation_frag_time) {
                    _for_each_with_class_in_parent(real_hud_element, 'elem_time_limit', function(el){
                        _html(el, localize("ingame_message_golden_frag"));
                    });
                    _for_each_with_class_in_parent(real_hud_element, 'protected', function(el){
                        el.classList.remove("protected");
                    });
                } else {
                    var time_limit_minutes = Math.floor(limit_overtime / 60);
                    var time_limit_seconds = limit_overtime % 60;
    
                    var formatted_time_limit_minutes = ("0" + time_limit_minutes).slice(-2);
                    var formatted_time_limit_seconds = ("0" + time_limit_seconds).slice(-2);
        
                    _for_each_with_class_in_parent(real_hud_element, 'elem_time_limit', function(el){
                        _html(el, formatted_time_limit_minutes + ":" + formatted_time_limit_seconds);
                    }); 
                }    
            } else {
                _for_each_with_class_in_parent(real_hud_element, 'elem_time_limit', function(el){
                    _empty(el);
                });  
            }

        }

        var timeLeft = (time_limit + overtime_seconds + tide_time_offset) - time;

        if (game_mode == "duel" && timeLeft <= 60 && timeLeft > -5 && !warmup && !current_match.confirmation_frag_time) {
            // Show time left bar
            _id("time_left_holder_bar").style.display = "flex";
            _id("time_left_bar").style.width = ((timeLeft / 60) * 100)+ "%";
            _id("tide_bar").style.width = "0%";
        } else {
            // Hide time left bar
            _id("time_left_holder_bar").style.display = "none";
        }

        if (timeLeft < 0) timeLeft = 0;

        var time_left_minutes = Math.floor(timeLeft / 60);
        var time_left_seconds = timeLeft % 60;

        var formatted_time_left_minutes = ("0" + time_left_minutes).slice(-2);
        var formatted_time_left_seconds = ("0" + time_left_seconds).slice(-2);


        _for_each_with_class_in_parent(real_hud_element, 'elem_game_timer', function(el){
            if (el.dataset.analog == 1) {
                if(el.dataset.countdown == 1){
                    el.children[0].children[0].style.transform = "rotate("+(time_left_seconds*6)+"deg)";
                    el.children[0].children[1].style.transform = "rotate("+(time_left_minutes*30+time_left_seconds/2)+"deg)";
                } else {
                    el.children[0].children[0].style.transform = "rotate("+(seconds*6)+"deg)";      
                    el.children[0].children[1].style.transform = "rotate("+(minutes*30+seconds/2)+"deg)";   
                }
            } else {
                //el.innerHTML = formatted_time_limit_minutes + ":" + formatted_time_limit_seconds;
                if(el.dataset.countdown == 1){
                    _html(el, formatted_time_left_minutes + ":" + formatted_time_left_seconds);
                    //el.innerHTML = formatted_time_left_minutes + ":" + formatted_time_left_seconds;
                } else {
                    _html(el, outputString);
                    //el.innerHTML = outputString;                  
                }
            }
        }); 
        
        // hacky experimental piggybacking for a system clock element, should be moved elsewhere when finalized so that seconds update aren't synced to game time
        var piggyback_today = new Date();
        var piggyback_local_hour = piggyback_today.getHours();
        var piggyback_local_min  = piggyback_today.getMinutes();
        var piggyback_local_sec  = piggyback_today.getSeconds();
        var piggyback_local_time = piggyback_local_hour + ":" + (piggyback_local_min<10?"0"+piggyback_local_min:piggyback_local_min) + ":" + (piggyback_local_sec<10?"0"+piggyback_local_sec:piggyback_local_sec);
        _for_each_with_class_in_parent(real_hud_element, 'elem_system_clock', function(el){
            if (el.dataset.analog == 1) {
                el.children[0].children[0].style.transform = "rotate("+(piggyback_local_min*6 + piggyback_local_sec/10)+"deg)";
                el.children[0].children[1].style.transform = "rotate("+(piggyback_local_hour*30 + piggyback_local_min/2 + piggyback_local_sec/120)+"deg)";      
            } else {
                _html(el, piggyback_local_time);
            }
        }); 

    });


    bind_event("player_needs_confirmation_frag", function (player_id) {
//        if (!current_match.confirmation_frag_time) showAnnounce(localize("ingame_message_knockout_phase"), false, 2000, 0, false);
        current_match.confirmation_frag_time = true;
    });

    bind_event('set_hud_game_mode', function (mode) {
        //engine.call("echo", 'set_hud_game_mode ' + mode.toUpperCase());
/*
        current_match.game_mode = mode;

        
        _for_each_with_class_in_parent(real_hud_element, "scoreboard_gamemode_name", el => {
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
        crosshair_containers[0].style.display      = enabled ? "none" : "flex";
        zoom_crosshair_containers[0].style.display = enabled ? "none" : "flex";
        mask_containers[0].style.display           = enabled ? "none" : "flex";
        crosshair_containers[1].style.display      = enabled ? "flex" : "none";
        zoom_crosshair_containers[1].style.display = enabled ? "flex" : "none";
        mask_containers[1].style.display           = enabled ? "flex" : "none";
    });

    let currently_active_crosshair_index = undefined;
    let currently_active_crosshair_zoom_index = undefined;
    bind_event('set_hud_weapon', function (settings_weapon_index, settings_zoom_weapon_index) {
        //console.log("set_hud_weapon", currently_active_crosshair_index+" -> "+settings_weapon_index, currently_active_crosshair_zoom_index+" -> "+settings_zoom_weapon_index);

        if (currently_active_crosshair_index == undefined || currently_active_crosshair_zoom_index == undefined) {
            for (let idx in global_crosshair_map) global_crosshair_map[idx].style.display = "none";
            for (let idx in global_crosshair_zoom_map) global_crosshair_zoom_map[idx].style.display = "none";

            for (let idx in global_crosshair_hitmarker_map) global_crosshair_hitmarker_map[idx].style.display = "none";
            for (let idx in global_crosshair_hitmarker_zoom_map) global_crosshair_hitmarker_zoom_map[idx].style.display = "none";

            for (let idx in global_mask_map) global_mask_map[idx].style.display = "none";
            for (let idx in global_mask_zoom_map) global_mask_zoom_map[idx].style.display = "none";
        }
        if (currently_active_crosshair_index == settings_weapon_index && currently_active_crosshair_zoom_index == settings_zoom_weapon_index) return;
        
        // Set the normal crosshair/hitstyle/mask for this weapon:
        if (currently_active_crosshair_index != settings_weapon_index) {
            if (currently_active_crosshair_index != undefined && currently_active_crosshair_index in global_crosshair_map) global_crosshair_map[currently_active_crosshair_index].style.display = "none";
            if (settings_weapon_index in global_crosshair_map) global_crosshair_map[settings_weapon_index].style.display = "flex";

            if (currently_active_crosshair_index != undefined && currently_active_crosshair_index in global_crosshair_hitmarker_map) global_crosshair_hitmarker_map[currently_active_crosshair_index].style.display = "none";
            if (settings_weapon_index in global_crosshair_hitmarker_map) global_crosshair_hitmarker_map[settings_weapon_index].style.display = "flex";

            if (currently_active_crosshair_index != undefined && currently_active_crosshair_index in global_mask_map) global_mask_map[currently_active_crosshair_index].style.display = "none";
            if (settings_weapon_index in global_mask_map) global_mask_map[settings_weapon_index].style.display = "flex";
        }

        // Set the zoom crosshair/hitstyle/mask for this weapon:
        if (currently_active_crosshair_zoom_index != settings_zoom_weapon_index) {
            if (currently_active_crosshair_zoom_index != undefined && currently_active_crosshair_zoom_index in global_crosshair_zoom_map) global_crosshair_zoom_map[currently_active_crosshair_zoom_index].style.display = "none";
            if (settings_zoom_weapon_index in global_crosshair_zoom_map) global_crosshair_zoom_map[settings_zoom_weapon_index].style.display = "flex";

            if (currently_active_crosshair_zoom_index != undefined && currently_active_crosshair_zoom_index in global_crosshair_hitmarker_zoom_map) global_crosshair_hitmarker_zoom_map[currently_active_crosshair_zoom_index].style.display = "none";
            if (settings_zoom_weapon_index in global_crosshair_hitmarker_zoom_map) global_crosshair_hitmarker_zoom_map[settings_zoom_weapon_index].style.display = "flex";

            if (currently_active_crosshair_zoom_index != undefined && currently_active_crosshair_zoom_index in global_mask_map) global_mask_zoom_map[currently_active_crosshair_zoom_index].style.display = "none";
            if (settings_zoom_weapon_index in global_mask_zoom_map) global_mask_zoom_map[settings_zoom_weapon_index].style.display = "flex";
        }

        currently_active_crosshair_index = settings_weapon_index;
        currently_active_crosshair_zoom_index = settings_zoom_weapon_index;
    });


    /*
    bind_event('set_own_team', function (team) {
        my_team_id = team;
        if(team !== -1){
            if (team == my_team_id) {
                _for_each_with_class_in_parent(real_hud_element, "teamscore_team_1", el => {
                    el.classList.add("highlight_score_self_team");
                });
                _for_each_with_class_in_parent(real_hud_element, "teamscore_team_2", el => {
                    el.classList.remove("highlight_score_self_team");
                });
            } else  {
                _for_each_with_class_in_parent(real_hud_element, "teamscore_team_1", el => {
                    el.classList.remove("highlight_score_self_team");
                });
                _for_each_with_class_in_parent(real_hud_element, "teamscore_team_2", el => {
                    el.classList.add("highlight_score_self_team");
                });
            }
        }
    });

    
    bind_event("claim_reward", function (weapon_id, weapon_tag, weapon_name){
        console.log("claim", weapon_id);
        _for_each_with_class_in_parent(real_hud_element, '.ammo_slot_' + weapon_id, function(el){
            anim_start({
                element: el,
                scale: [1, 1.2],
                duration: 200,
                easing: easing_functions.easeOutQuad,
                alternate: true
            });            
        });
    });
    
    bind_event('set_skills', function (code) {
       // $('#available_skills').html(code); TODO GAMEFACE
    });

    bind_event('set_shop_skills', function (code) {
        //$('#available_shop_skills').html(code); TODO GAMEFACE
    });

    bind_event('set_shop_revenge_items', function (code) {
        //$('#available_revenge_shop_items').html(code); TODO GAMEFACE
    });

    bind_event('show_shop', function (enabled) {
        if (enabled) {
            //_id("crosshairs").style.opacity = "0";  TODO GAMEFACE
           //$("#game_shop_container").css("display", "flex").fadeIn(50); TODO GAMEFACE
        } else {
            //_id("crosshairs").style.opacity = "1";  TODO GAMEFACE
            
           // $("#game_shop_container").fadeOut(50);    TODO GAMEFACE
        }
    });

    bind_event('set_shop_class', function (class_id) {
        anim_show(_id("shop_category_" + class_id));
    });
    */


    bind_event("show_play_of_the_game", function (show, player_name) {
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
    for (var i = 0; i < global_onload_callbacks_hud.length; i++){
        global_onload_callbacks_hud[i]();
    }

    // load shared code between menu and hud views
    for (var i = 0; i < global_shared_onload_callbacks.length; i++){
        global_shared_onload_callbacks[i]();
    }

    setupMenuSoundListeners();

    window.requestAnimationFrame(anim_update);


    engine.call("hud_view_loaded");
});


