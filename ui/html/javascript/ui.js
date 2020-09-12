const GAMEFACE = true;
const GAMEFACE_VIEW = 'menu';

var global_ms_connected = false;
var global_ms_connected_count = 0;

var global_ms = new MS();
var global_variable = new VariableHandler();

// id -> debouncer instance map
var global_input_debouncers = {}

var global_range_slider_map = {};

// animationframe timestamp when queue started:
var global_mm_queuetime_ranked = 0;
var global_mm_queuetime_quickplay = 0;
// queue time in seconds:
var global_mm_time_ranked = 0;
var global_mm_time_quickplay = 0;
// queue is currently active:
var global_mm_searching_ranked = false;
var global_mm_searching_quickplay = false;
// queue starts with next animation frame:
var global_mm_start_ranked = false;
var global_mm_start_quickplay = false;

// currently open menu page
var global_menu_page = "home_screen";
var global_play_menu_page = "play_screen_quickplay";

// server region / datacenter info
var global_server_regions_init = true;
var global_server_regions = {};
var global_server_locations = {};
var global_server_selected_locations = [];

var global_user_battlepass = {};
var global_battlepass_list = [];
var global_competitive_season = {};

window.self_egs_id = "";


window.addEventListener("load", function(){

    console.log("LOAD ui.js");

    initialize_references();
    
    verify_script_data();

    // load all the hud element definitions
    init_hud_elements();

    init_friends_list();
    init_main_chat();

    console.log("LOAD001");
    

    //
    //  Initialize JSRender
    //
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
        console.log("CONVERT NUMBER",val)
        if (typeof val == "string") {
            return Number(val);
        }
        return val;
    });

    //FireFrog: this is used for the decal screen
    //FireFrog: if the ui focus is set to false then the binds for flipping, deleting and select tool will work
    function detectFocus() {
        engine.call("set_input_focus", true);
    }
    function detectBlur() {
        engine.call("set_input_focus", false);
    }
    window.addEventListener ? window.addEventListener('focus', detectFocus, true) : window.attachEvent('onfocusout', detectFocus);  
    window.addEventListener ? window.addEventListener('blur', detectBlur, true) : window.attachEvent('onblur', detectBlur);
    
    console.log("LOAD002");

    //
    //  Setup the console
    //
    window.console_view = document.getElementById("console");
    window.console_prompt = document.getElementById("console_prompt");
    window.console_buffer = document.getElementById('console_buffer');

    window.console_view.addEventListener("keydown", function(event){
        if (event.keyCode == 13){ //return
            engine.call('console_return', window.console_prompt.value);
            window.console_prompt.value = "";
            window.console_buffer.style.bottom = "0px";
            event.preventDefault();
        } else if (event.keyCode == 9){ //tabindex
            engine.call('console_complete', window.console_prompt.value).then(function (completion){
                if (completion.length){
                    window.console_prompt.value = completion;
                    window.console_prompt.selectionStart = window.console_prompt.selectionEnd = window.console_prompt.value.length;
                    window.console_buffer.style.bottom = "0px";
                }
            });
            event.preventDefault();
        } else if (event.keyCode == 38){ //arrow up
            engine.call('console_up').then(function (str){
                if (str.length){
                    //TEMP hack while refactoring for GameFace, have trouble binding the previous BoolStringPair
                    if (str[0] == 'T'){
                        window.console_prompt.value = str.substring(1);
                        window.console_prompt.selectionStart = window.console_prompt.selectionEnd = window.console_prompt.value.length;
                    }
                }
            });
            event.preventDefault();
        } else if (event.keyCode == 40){ //arrow down
            engine.call('console_down').then(function (command){
                window.console_prompt.value = command;
                window.console_prompt.selectionStart = window.console_prompt.selectionEnd = window.console_prompt.value.length;
            });
            event.preventDefault();
        } else if (event.keyCode == 33){ //page up
            consoleScroll("up");
            event.preventDefault();
        } else if (event.keyCode == 34){ //page down
            consoleScroll("down");
            event.preventDefault();
        } else if (event.keyCode == 35 && event.ctrlKey){ //end
            //Go end
            window.console_buffer.style.bottom = "0px";
            event.preventDefault();
        } else if (event.keyCode == 36 && event.ctrlKey){ //home
            //Go start
            event.preventDefault();
        }
        event.stopPropagation();
    });

    document.getElementById('console_buffer_wrapper').addEventListener("wheel", function(event){
        if (event.deltaY < 0) {
            consoleScroll("up");
        } else {
            consoleScroll("down");
        }
        event.preventDefault();
    });

    function consoleScroll(direction) {
        if (direction === "up") {
            if (window.console_buffer.getBoundingClientRect().top < 0) {
                var bottom = parseFloat(window.getComputedStyle(window.console_buffer,null).getPropertyValue("bottom"));
                bottom -= 75;
                window.console_buffer.style.bottom = bottom+"px";
            }
        } else if (direction === "down") {
            var bottom = parseFloat(window.getComputedStyle(window.console_buffer,null).getPropertyValue("bottom"));
            bottom += 75;
            if (bottom > 0) bottom = 0;
            window.console_buffer.style.bottom = bottom+"px";
        }
    }

    _id('console').addEventListener("click", function() {
        _id('console_prompt').focus();
    });

    bind_event('clear_console', function (){
        window.console_buffer.innerHTML = '';
        window.console_prompt.value='';
    });

    bind_event('set_console_visible', function (visible) {
        set_console(visible);
    });

    // Press Escape to go up a level 
    document.addEventListener("keydown", function(e){
        var tag = e.target.tagName.toLowerCase();
        if ( e.which === 27 && tag != 'input' && tag != 'textarea') {
            goUpALevel();
        }
    });

    bind_event("set_version", function(version) {
        _id("console_version").textContent = "v"+version;
        _id("game_version").textContent = "v"+version;
    });

    bind_event("set_locations", function(json_loc_data) {
        try {
            data = JSON.parse(json_loc_data);
            //console.log(_dump(data));
            if (global_server_regions_init) {
                for (let ds of data) {
                    if (!(ds.region in global_server_regions)) {
                        global_server_regions[ds.region] = [];
                    }
                    global_server_regions[ds.region].push(ds.code);
                    global_server_locations[ds.code] = {
                        "name": ds.location,
                        "ping": ds.ping,
                    };
                }

                update_server_location_selection();
                engine.call("initialize_select_value", "lobby_region");

                global_server_regions_init = false;
            } else {
                update_server_location_pings(data);
            }
        } catch (e) {
            console.log("Error parsing location JSON. err=" + e);
        }
    });

    // Add leave match button once map has loaded
    bind_event('on_map_loaded', function () {
        /*
        let code = '<div id="mm_disconnect" onclick="open_modal_screen(\'disconnect_dialog_modal_screen\')" class="click-sound menu-disconnect-button" data-i18n="menu_top_disconnect"><span>LEAVE MATCH</span></div>';
        let element = _id("notification_area_code");
        if (element){
            element.innerHTML = code;
        }
        element.style.display = "flex";
        */

    });

    console.log("LOAD010");

    bind_event('update_modding_settings', function (code) {
        _id("modding_settings_content").innerHTML = code;
    });
    
    console.log("LOAD012")

    bind_event('forceconsole', function () {
        window.console_view.style.visibility='visible';
    });


    console.log("LOAD013")

    bind_event('set_masterserver_connection_state', set_masterserver_connection_state);

    bind_event('request_creator_tool', function (tool) {
        console.log("?? What is this: request_creator_tool", tool);
        set_tool(tool);
    });

    bind_event('view_data_received', function(string) {
        // data from another view received
        let data = parse_view_data(string);

        if (data.action == "reset_own_profile_cache") {
            clear_profile_data_cache_id(global_self.user_id);
        }
        if (data.action == "open_battlepass_upgrade") {
            open_battlepass_upgrade();
        }
    });

    bind_event('process_server_json_data', function (string) {
        let type = string.charAt(0);
        let data = string.trim().substring(2);

        // JSON message
        if (type == "j") {
            var json_data = '';
            try {
                json_data = JSON.parse(data);
            } catch (e) {
                console.log("Error parsing server JSON. err=" + e);
            }
            if (!json_data.action) return;

            let action = json_data.action;
            if (json_data.action.startsWith("mm-")) action = "mm-";
            if (json_data.action.startsWith("lobby-")) action = "lobby-";
            if (json_data.action.startsWith("party-")) action = "party-";
            if (json_data.action.startsWith("invite-")) action = "invite-";

            switch(action) {
                case "mm-":
                    handle_mm_match_event(json_data);
                    break;
                case "lobby-":
                    handle_lobby_event(json_data);
                    break;
                case "party-":
                    handle_party_event(json_data);
                    break;
                case "invite-":
                    handle_invite_event(json_data);
                    break;
                case "vote-counts":
                    draft_update_vote_counts(json_data);
                    break;
                case "match-reconnect":
                    handle_match_reconnect(json_data);
                    break;
                case "match-disconnect":
                    button_game_over_quit();
                    break;
                case "queues":
                    global_queue_groups = json_data.queue_groups;
                    parse_modes(json_data.queues);
                    init_queues();
                    init_screen_leaderboards();
                    updateQueueRanks();
                    break;
                case "online-friends-data":
                    handle_friends_in_diabotical_data(json_data.data);
                    break;
                case "competitive-season":
                    global_competitive_season = json_data.data;
                    break;
                case "chat-msg":
                    main_chat_add_incoming_msg(json_data);
                    break;
                case "get-ranked-mmrs":
                    global_self.mmr = json_data.data;
                    updateQueueRanks();
                    break;
                case "warmup-join-error":
                    queue_dialog_msg({
                        "title": localize("title_info"),
                        "msg": localize(json_data.msg),
                    });
                    break;
                case "post-match-updates":
                    if ("mmr_updates" in json_data.data) {
                        if ("mode" in json_data.data.mmr_updates && "to" in json_data.data.mmr_updates) {
                            global_self.mmr[json_data.data.mmr_updates.mode] = json_data.data.mmr_updates.to;
                            updateQueueRanks();
                        }
                    }
                    if ("progression_updates" in json_data.data) {
                        if ("challenges" in json_data.data.progression_updates) {
                            global_user_battlepass.challenges = json_data.data.progression_updates.challenges;
                            updateChallenges();
                        }
                        if ("battlepass_update" in json_data.data.progression_updates) {
                            updateBattlePassProgress(json_data.data.progression_updates.battlepass_update);
                            updateMenuBottomBattlepassLevel();
                        }
                        if ("battlepass_rewards" in json_data.data.progression_updates) {
                            add_user_customizations(json_data.data.progression_updates.battlepass_rewards);
                        }
                        if ("achievement_rewards" in json_data.data.progression_updates) {
                            let rewards = [];
                            for (let r of json_data.data.progression_updates.achievement_rewards) rewards.push(r.reward);
                            add_user_customizations(rewards);
                        }
                    }
                    break;
                case "rerolled-challenge":
                    replaceChallenge(json_data.replaced_challenge_id, json_data.challenge);
                    updateChallenges();
                    break;
                case "set-customization":
                    customization_set_validated(json_data.customization);
                    break;
            }

            // Send to single use registered response handlers
            global_ms.handleResponse(json_data.action, json_data);
        }

        // String message
        if (type == "s") {
            let msg_action = data.substr(0,data.indexOf(' '));
            let msg_data = data.substr(data.indexOf(' ')+1);
            if (data.indexOf(' ') == -1) {
                msg_action = data;
                msg_data = ""; 
            }

            let action = msg_action;
            if (action.startsWith("lobby-")) action = "lobby-";

            switch(action) {
                case "lobby-":
                    handle_lobby_event({ "action": msg_action });
                    break;
                case "mm-match-cancelled":
                    handle_mm_match_cancelled();
                    break;
                case "no-servers-available":
                    queue_dialog_msg({
                        "title": localize("title_info"),
                        "msg": localize("message_no_servers_avail"),
                    });
                    
                    lobby_hide_loading_overlay();
                    set_draft_visible(false);
                    break;
                case "info-msg":
                    queue_dialog_msg({
                        "title": localize("title_info"),
                        "msg": localize(msg_data),
                    });
                    break;
                case "error-msg":
                    queue_dialog_msg({
                        "title": localize("title_error"),
                        "msg": localize(msg_data),
                    });
                    break;
                case "party-locations":
                    set_region_selection(false, msg_data);
                    break;
                case "party-queue-penalty-self":
                    let now = Date.now() / 1000;
                    let seconds_until_penalty_free = Number(msg_data) - now;
                    queue_dialog_msg({
                        "title": localize("title_info"),
                        "msg": localize_ext("party_penalty_msg_self", {
                            "time_left": _seconds_to_string(seconds_until_penalty_free)
                        }),
                    });
                    break;
                case "party-queue-penalty":
                    queue_dialog_msg({
                        "title": localize("title_info"),
                        "msg": localize("party_penalty_msg"),
                    });
                    break;
            }

            // Send to single use registered response handlers
            global_ms.handleResponse(msg_action, msg_data);
        }
    });

    pre_load_setup_hud_editor_new();

    bind_event('set_hit_sound_options', function (code) {
        _id("setting_game_hit_sound").innerHTML = code;
        ui_setup_select(_id("setting_game_hit_sound"));
        _id("setting_game_critical_hit_sound").innerHTML = code;
        ui_setup_select(_id("setting_game_critical_hit_sound"));
    });

    bind_event('set_display_mode_options', function (code) {
        _id("setting_video_display_mode").innerHTML = code;
        ui_setup_select(_id("setting_video_display_mode"));
    });

    bind_event('focus_console_input', function () {
        _id("console_prompt").focus();
    });

    bind_event('console_echo', function (new_score) {
        var new_line = document.createElement("DIV");
        //var new_text = document.createTextNode(new_score);
        //new_line.appendChild(new_text);
        new_line.innerHTML = new_score;
        window.console_buffer.appendChild(new_line);

        if (window.console_buffer.childElementCount > 300){
            window.console_buffer.removeChild(window.console_buffer.childNodes[0]);
        }
    });

    bind_event('menu_enabled', function (enabled) {
        console.log("menu_enabled", enabled, global_menu_page);

        // main menu needs to be hidden, otherwise its visible when opening the console in the hud view
        _id("main_menu").style.display = enabled ? "flex" : "none";

        // Stop / Resume the shop animations
        if (global_menu_page == "shop_screen") {
            if (enabled) shop_set_animation_state(true);
            else shop_set_animation_state(false);
        }

        // Stop / Resume Aim Trainer scenario videos
        if (global_menu_page == "aim_screen") {
            if (enabled) aim_scenario_set_video_play(true);
            else aim_scenario_set_video_play(false);
        }

        // Note: All of this below is outdated from the time before the 2 separate hud and menu views?
        
        //If we are going into the game, let's remove any focus from any input
        //element. This is a problem for example with selectmenus, if they are
        //focused and you press space in game, the menu would drop down.
        if (!enabled) {
            if (document.activeElement) {
                document.activeElement.blur();
            }
        }
    });


    window.draft_visible = false;

    bind_event('set_self_egs_id', function (self_egs_id) {
        window.self_egs_id = self_egs_id;
    });

    /// GENERAL
    bind_event('messagebox', function (msg_key) {
        queue_dialog_msg({
            "title": localize("title_info"),
            "msg": localize(msg_key),
        });

        if (msg_key == "message_no_servers_avail") {
            set_draft_visible(false);
        }
    });

    bind_event('cancellable_messagebox', function (msg_key) {
        if (msg_key == "egs_auth_error") {
            show_sticky_dialog({
                "title": localize("egs_auth_error_title"),
                "msg": localize("egs_auth_error_msg"),
            });
        } else {
            show_sticky_dialog({"msg": localize(msg_key)});
        }
    });

    bind_event('close_messagebox', function () {
        hide_sticky_dialog();

        if (global_keybinding_active) {
            global_keybinding_active = false;
        }
    });

    bind_event('on_masterclient_ghosted',    function() { set_logged_out_screen(true, "ghosted"); });
    bind_event('on_masterclient_outdated',   function() { set_logged_out_screen(true, "version"); });
    bind_event('on_masterclient_unverified', function() { set_logged_out_screen(true, "unverified"); });
    bind_event('on_masterclient_down',       function() { set_logged_out_screen(true, "service_down"); });
    bind_event('on_masterclient_disabled',   function() { set_logged_out_screen(true, "disabled"); });

    bind_event('on_anticheat_error',   function(code) { set_logged_out_screen(true, "anticheat", code); });

    bind_event('global_event', function(event_name, value) {

        if (event_name == "disconnected") {
            /*
            event_name == "disconnected":
                    #define ERROR_OUTDATED_CLIENT_VERSION 1
                    #define ERROR_OUTDATED_SERVER_VERSION 2
                    #define ERROR_PROTOCOL_BREACH 4  -> 'protocol breach, dont call it that, call it "protocol error"'
                    #define ERROR_BANNED 6
                    #define ERROR_SERVER_FULL 7
                    #define ERROR_BAD_AUTH 8
                    #define ERROR_INACTIVITY_KICK 9
                    #define REASON_SERVER_SHUTTING_DOWN 10
                    #define ERROR_BAD_MAP 12
                    #define ERROR_BANNED_WHILE_IN_GAME 13
                    #define REASON_SERVER_GAME_CANCELLED 14
                    #define REASON_TUTORIAL_ENDED 15
                30: Server disconnected us unexpectedly.
                31: Abnormal connection error 1
                32: Connection attempt failed.
                33: No free incoming connections.
                34: Abnormal connection error 2
                35: Connection to the server lost.
                [12:57 AM] FireFrog: so the ones above are intentional ones by the server
                [12:57 AM] FireFrog: the other ones are things that can happen during transport
                [12:57 AM] FireFrog: 31 and 34 should not happen so just put that in so we know
                [12:58 AM] FireFrog: 30 should not happen either, if 30 happesn we should have an intentional code that I can show you
                [12:58 AM] FireFrog: 35 is your regular timeout
            */
            engine.call("echo","Disconnected from server, code:"+value);
            if (value == 10 || value == 15) {
                // Check if state == 4 == GAME_STATE_ENDED
                
                /* commented for now because game_state isn't realibly set to 4 here when we get disconnected for some reason
                if (menu_game_data.game_stage && menu_game_data.game_stage != 4) {
                    console.log("GAME STAGE", menu_game_data.game_stage);
                    queue_dialog_msg({
                        "title": localize("title_error"),
                        "msg": localize("disconnected_error_"+value),
                    });
                }
                */
            } else if (value == 6 || value == 13) {

                // handle ban
                set_logged_out_screen(true, "disabled");

            } else {
            //if ([5,6,7,8].includes(value)) {
                if ([7,12,14,30,31,32,34,35].includes(value)) {
                    send_string(CLIENT_COMMAND_DISCONNECTED, "unexpected-disconnection");
                }
                queue_dialog_msg({
                    "title": localize("title_error"),
                    "msg": localize("disconnected_error_"+value),
                });
            //} else {
                /*
                queue_dialog_msg({
                    "title": localize("title_error"),
                    "msg": localize("disconnected_error_generic"),
                });
                */
            }
        }

    });

    let expand_search_timeout = null;
    bind_event('set_checkbox', function (variable, value) {

        if (variable == "lobby_tutorial_launched") {
            home_screen_show_hide_tutorial_button(value);
            return;
        }

        if (variable == "lobby_region_search_nearby") {
            if (expand_search_timeout != null) clearTimeout(expand_search_timeout);
            expand_search_timeout = setTimeout(() => {
                send_string(CLIENT_COMMAND_SET_PARTY_EXPAND_SEARCH, ""+value);
                expand_search_timeout = null;
            },10);
        }

        if (variable.startsWith("lobby_custom_")) {

            // Only update the custom lobby checkbox if you are the host or you are not in a lobby
            if (bool_am_i_host || global_lobby_id == -1) {
                _for_each_in_class("checkbox_component", function(element) {
                    if (element.dataset.variable == variable) {
                        element.dataset.enabled = value ? "true": "false";
                        update_checkbox(element);
                    }
                });
            }

        } else {
            _for_each_in_class("checkbox_component", function(element) {
                if (element.dataset.variable == variable) {
                    element.dataset.enabled = value ? "true": "false";
                    update_checkbox(element);
                }
            });
        }

        // Update the lobby settings on the MS if you are in a lobby and are the host
        if (variable.startsWith("lobby_custom_")) {
            if (bool_am_i_host && global_lobby_id != -1) {
                custom_game_settings_changed(true);
            }
        }

        // Call the response handler for any queued callbacks
        global_variable.handleResponse("checkbox", variable, value);
    });

    bind_event('add_video_mode', function (video_mode, video_mode_caption, selected) {
        add_auto_detect_video_mode();

        let option = _createElement("div", "", video_mode_caption);
        option.dataset.value = video_mode;
        if (selected) option.dataset.selected = 1;

        _id("video_modes").appendChild(option);

        ui_setup_select(_id("video_modes"));
    });

    bind_event("set_shop_offers", function(data) {
        try {
            const dataOffers = JSON.parse(data);
            handle_coin_offers_update(dataOffers.offers);
            global_shop_is_rendered = false;
        } catch (e) {
            console.log("set_coin_offers: Error parsing JSON. err=" + e);
        }
    });   

    let auto_detect_video_mode_added = false;
    function add_auto_detect_video_mode() {
        if (auto_detect_video_mode_added) return;

        auto_detect_video_mode_added = true;
        let option = _createElement("div", "", localize("auto_detect"));
        option.dataset.value = "";

        _id("video_modes").appendChild(option);
    }

    engine.call('get_egs_state').then(function (egs_enabled) {
        if (!egs_enabled){
            document.getElementById('player_plate_offline').style.display = 'flex';
            //document.getElementById('player_plate_content').style.display = 'none';
        }
    });

    console.log("LOAD015");


    //engine.call('ui_view_loaded');


    console.log("LOAD017");

    /*
     *  Leaving this here just for moment / humanize reference 
     *
    function _humanize(diff_seconds, short_mode) {
        if (short_mode) {
            return humanizeDuration(diff_seconds, { round: true, units: ['y', 'mo', 'w', 'd', 'h', 'm'] });
        } else {
            if (diff_seconds < 0) {
                return "<span class=time_humanized>" + humanizeDuration(diff_seconds, { round: true, units: ['y', 'mo', 'w', 'd', 'h', 'm'] }) + (diff_seconds < 0 ? " from now" : " ago") + "</span>";
            } else {
                return "<span class=time_warning>Note: Supplied time is in the past</span>"
            }
        }
    }
    function _update_dates() {
        if (!$("#add_tournament_start_date").val().length) {
            $("#add_tournament_start_date").val(moment(new Date()).add(1, 'hours').format('MM/DD/YYYY'));
        }
        if (!$("#add_tournament_start_time").val().length) {
            $(_id("add_tournament_start_time")).val(moment(new Date()).add(1, 'hours').format('HH:mm'));
        }
        var joined_date = $(_id("add_tournament_start_date")).val() + " " + $(_id("add_tournament_start_time")).val();
        var diff_seconds = moment().diff(moment(joined_date, "MM/DD/YYYY HH:mm"));
        $(_id("add_tournament_start_time_humanized")).html(_humanize(diff_seconds, false));
    }
    */
    
    //_update_dates(); //TEMP

    console.log("LOAD018");

    /// SETTINGS: Bindings
    let global_keybinding_active = false;
    _for_each_in_class("controls_value", function (element) {
        let data = element.dataset['dbBinding'];
        let mode = element.dataset['dbBindingMode'];
        if (data) {
            element.addEventListener("click", function() {
                engine.call("capture_bind", data, mode);
                global_keybinding_active = true;
                element.classList.add("active");
            });
        }
    });

    bind_event('set_binding_list', function (mode, command, code) {
        _for_each_in_class("controls_value", function(el) {
            if (el != null && el.dataset['dbBinding'] == command && el.dataset['dbBindingMode'] == mode) {
                while (el.hasChildNodes()) {
                    el.removeChild(el.firstChild);
                }
                el.innerHTML = code;
                if (el.classList.contains("active")) el.classList.remove("active");
            }
        });
    });

    bind_event('set_screen_aspect_ratio', function (numerator, denominator) {
        let html = '<span class="info"></span> '+localize_ext("settings_video_screen_aspect_ratio", { "ratio": numerator+":"+denominator});
        _html(_id("aspect_ratio_info"), html);
    });

    bind_event('set_select', function (variable, value) {
        if (variable.startsWith("game_decals") && !global_set_customizations_from_server) {
            send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map["sticker"]+"::"+value);
            clear_profile_data_cache_id(global_self.data.user_id);
            return;
        }
        /*
        if (variable.startsWith("hud_crosshair_type")) {
            if (variable.startsWith("hud_crosshair_type:")) {
                _id("setting_hud_crosshair_layer_enabled").dataset.enabled = (value == 0 || value == "0") ? false : true;
                update_checkbox(_id("setting_hud_crosshair_layer_enabled"));
                _id("setting_hud_crosshair_type").dataset.value = value;                
                update_crosshair_selection(_id("setting_hud_crosshair_type"));
            }
            if (variable.startsWith("hud_crosshair_type2:")) {
                _id("setting_hud_crosshair_layer_enabled2").dataset.enabled = (value == 0 || value == "0") ? false : true;
                update_checkbox(_id("setting_hud_crosshair_layer_enabled2"));
                _id("setting_hud_crosshair_type2").dataset.value = value;
                update_crosshair_selection(_id("setting_hud_crosshair_type2"));
            }
            if (variable.startsWith("hud_crosshair_type3:")) {
                _id("setting_hud_crosshair_layer_enabled3").dataset.enabled = (value == 0 || value == "0") ? false : true;
                update_checkbox(_id("setting_hud_crosshair_layer_enabled3"));
                _id("setting_hud_crosshair_type3").dataset.value = value;
                update_crosshair_selection(_id("setting_hud_crosshair_type3"));
            }
            on_updated_crosshair_type_selection();
            return;
        }

        if (variable.startsWith("hud_zoom_crosshair_type")) {
            if (variable.startsWith("hud_zoom_crosshair_type:")) {    
                _id("setting_hud_zoom_crosshair_layer_enabled").dataset.enabled = (value == 0 || value == "0") ? false : true;
                update_checkbox(_id("setting_hud_zoom_crosshair_layer_enabled"));
                _id("setting_hud_zoom_crosshair_type").dataset.value = value;                
                update_crosshair_selection(_id("setting_hud_zoom_crosshair_type"));
            }
            if (variable.startsWith("hud_zoom_crosshair_type2:")) {
                _id("setting_hud_zoom_crosshair_layer_enabled2").dataset.enabled = (value == 0 || value == "0") ? false : true;
                update_checkbox(_id("setting_hud_zoom_crosshair_layer_enabled2"));
                _id("setting_hud_zoom_crosshair_type2").dataset.value = value;
                update_crosshair_selection(_id("setting_hud_zoom_crosshair_type2"));
            }
            if (variable.startsWith("hud_zoom_crosshair_type3:")) {
                _id("setting_hud_zoom_crosshair_layer_enabled3").dataset.enabled = (value == 0 || value == "0") ? false : true;
                update_checkbox(_id("setting_hud_zoom_crosshair_layer_enabled3"));
                _id("setting_hud_zoom_crosshair_type3").dataset.value = value;
                update_crosshair_selection(_id("setting_hud_zoom_crosshair_type3"));
            }
            on_updated_crosshair_type_selection();
            return;
        }
        */
        if (variable.startsWith("hud_crosshair_mask_aperture") || variable.startsWith("hud_zoom_crosshair_mask_aperture")) {
            on_updated_mask_type_selection();
        }

        if (variable == "lobby_custom_mode") {
            if (!value.length) {
                engine.call("set_string_variable", "lobby_custom_mode", global_lobby_init_mode);
                value = global_lobby_init_mode;
            }
            engine.call("on_custom_game_mode_changed", value, global_customSettingElements["map"].dataset.value || "");
        }

        if (variable == "lobby_region") {
            set_region_selection(true, value);
        }

        if (variable == "lobby_search") {
            set_queue_selection(value);
            return;
        }

        if (variable == "lobby_custom_datacenter") {
            value = set_lobby_datacenter(value);
        }

        /********************
         * MAIN SELECT FIELDS
         */
        if (variable.startsWith("lobby_custom_")) {

            // Only update the custom lobby select fields if you are the host or you are not in a lobby
            if (bool_am_i_host || global_lobby_id == -1) {
                _for_each_in_class("select-field", function(el) {
                    if (el.dataset.variable == variable) {
                        el.dataset.value = value;
                        update_select(el);
                    }
                });
            }

        } else {
            _for_each_in_class("select-field", function(el) {
                if (el.dataset.variable == variable) {
                    el.dataset.value = value;
                    update_select(el);
                }
            });
        }

        // Update the lobby settings on the MS if you are in a lobby and are the host
        if (variable.startsWith("lobby_custom_")) {
            if (bool_am_i_host && global_lobby_id != -1) {
                if (!custom_lobby_local_var_update) {
                    custom_game_settings_changed(true);
                }
            }
        }

        // Call the response handler for any queued callbacks
        global_variable.handleResponse("select", variable, value);

        if (variable.startsWith("mouse_accel_type")) {
            update_accel_options(_id("setting_mouse_accel_type"));
        }
    });

    bind_event('set_color', function (variable, value) {
        if (variable == "game_skin_color") {
            if (global_set_customizations_from_server) {
                // Set the initial color
                customization_update_color_picker(value);
            } else {
                customization_set_shell_color(value);
            }
            return;
        }

        _for_each_with_class_in_parent(_id("main_menu"), "color-picker-new", function(el) {
            if (el.dataset.variable == variable) {
                               
                el.jscolor.fromString(value);

                if ("finechange" in el.dataset && el.dataset.finechange == 1) {
                    el.jscolor.onFineChange = function(value) {
                        colorPickerValueUpdated(el, el.jscolor)
                    };
                }
            }
        });

        // Call the response handler for any queued callbacks
        global_variable.handleResponse("color", variable, value);
    });

    bind_event('set_custom_component', function (variable, value) {

        //console.log("set_custom_component", variable, value);

        if (variable == "lobby_custom_map") set_lobby_custom_map(value);
        if (variable == "lobby_custom_commands") set_lobby_custom_commands(value);
        
        if (variable.startsWith('hud_zoom_crosshair_definition:') && variable.substr(30) != currentCrosshairCreatorZoomWeaponIndex) {            
            initialize_crosshair_creator(true, generateFullCrosshairDefinition(value), variable, 'none');
            currentCrosshairCreatorZoomWeaponIndex = variable.substr(30); //so we dont initialize every time the engine_variable gets updated
        }
        if (variable.startsWith('hud_crosshair_definition:') && variable.substr(25) != currentCrosshairCreatorWeaponIndex) {
            initialize_crosshair_creator(false, generateFullCrosshairDefinition(value), variable, 'none');
            currentCrosshairCreatorWeaponIndex = variable.substr(25);   //so we dont initialize every time the engine_variable gets updated
        }


        // Call the response handler for any queued callbacks
        global_variable.handleResponse("custom_component", variable, value);
    });

    _for_each_in_class("color-picker-new", function(el) {
        var current_variable = el.dataset.variable;
        if (current_variable && current_variable.length) {
            engine.call("initialize_color_value", current_variable);
        }
    });
    
    bind_event('set_range', function (variable, value) {

        if (variable == "video_max_fps" || variable == "video_lobby_max_fps") {
            let cb = undefined;
            if (variable == "video_max_fps") cb = _id("setting_video_max_fps_cb");
            if (variable == "video_lobby_max_fps") cb = _id("setting_lobby_video_max_fps_cb");

            if (cb) {
                if (value == 0) {
                    cb.classList.remove("checkbox_enabled");
                    cb.firstChild.classList.remove("inner_checkbox_enabled");
                } else {
                    cb.classList.add("checkbox_enabled");
                    cb.firstChild.classList.add("inner_checkbox_enabled");
                }
            }
        }

        if (global_range_slider_map.hasOwnProperty(variable)) {
            global_range_slider_map[variable].setValue(value);
        }

        if (variable.startsWith("game_fov") || variable.startsWith("game_zoom_fov")) {
            update_fov_preview();
        }
        if (variable.includes("post_scale")) {
            update_physical_sens(variable,true)
        }
        if (variable.startsWith("mouse_accel_")) {
            update_accel_chart();
        }

        // Call the response handler for any queued callbacks
        global_variable.handleResponse("range", variable, value);
    });

    /*
    _id('enable_direction_hints').addEventListener("click", function() {
        let checkbox = _id('enable_direction_hints');
        let value = false;
        let data_value = checkbox.dataset.enabled;
        if (data_value && (data_value === "true" || data_value === true)) {
            value = true;
        }
        if (!value) {
            checkbox.dataset.enabled = true;
            checkbox.classList.add("checkbox_enabled");
            engine.call('ui_sound', 'ui_check_box');
            checkbox.firstElementChild.classList.add("inner_checkbox_enabled");
            write_misc_hud_preference('dirhint','1');
        } else {
            checkbox.dataset.enabled = false;
            checkbox.classList.remove("checkbox_enabled");
            engine.call('ui_sound', 'ui_uncheck_box');
            checkbox.firstElementChild.classList.remove("inner_checkbox_enabled");
            write_misc_hud_preference('dirhint','0');
        }
        place_direction_hints_element(value);
        
        // include/exclude element in default hud according to explicit user intent
        //place_direction_hints_element(value, window.experimental_default_hud_definition_json, true);
    });
    */
    

    // Setup crosshair option selection
    _for_each_with_class_in_parent(_id("lobby_container"), "crosshair_layer_checkbox", function(el) {
        el.addEventListener("click", function() {
            if (el.dataset.enabled == "true") {
                engine.call("set_string_variable", el.dataset.variable, "1");
            } else {
                engine.call("set_string_variable", el.dataset.variable, "0");
            }
        });
    });
    
    bind_event("set_restart_required", function (restart_required) {
        if (restart_required) {
            _id("settings_message_container").style.display = "flex";
            //anim_show(_id("settings_message_container"), 50);
        } else {
            _id("settings_message_container").style.display = "none";
            //anim_hide(_id("settings_message_container"), 50);
        }
    });

    bind_event("reveal_ui", function () {
        console.log("reveal_ui");

        anim_show(document.body, 350);
    });

    bind_event("update_user_info", function() {
        load_user_info(function(user) {
            if (user && user.social_profiles.find(c => c.type === "twitch")) {
                _id("settings_connections_twitch_unlink").style.display = "flex";
                _id("settings_connections_twitch_link").style.display = "none";
                update_twitch_list_link_state(true);
            } else {
                _id("settings_connections_twitch_unlink").style.display = "none";
                _id("settings_connections_twitch_link").style.display = "flex";
                update_twitch_list_link_state(false);
            }
        });
    });
    bind_event("start_redeem", function(payload) {
        /* Game requested to redeem some pending entitlements */
        /* It usually happens when players redeemed a coin pack */
        /* using a code in the Epic website or through EOS overlay */
        const data = JSON.parse(payload);
        const toBeRedemeed = data
            .entitlements
            .filter(ent => !ent.isRedeemed).map(ent => ent.id);

        if (toBeRedemeed && toBeRedemeed.length) {           
            queue_dialog_msg({
                "title": localize("toast_title_updating_wallet"),
                "msg": localize("toast_msg_updating_wallet")
            });
            api_request(
                "POST",
                "/redeem",
                {
                    "entitlements": toBeRedemeed,
                    "epic_id": data.epic_id,
                    "epic_token": data.epic_token
                },
                function (data) {
                    if (data.coins || data.items) {
                        const content = update_after_purchase(data);
                        if (content) {
                            openBasicModal(basicGenericModal(localize("shop_purchase_success"),
                                           content,
                                           localize("modal_close")));
                        }

                        // Set shop and coin shop to not rendered so they get recreated next time they are opened
                        global_shop_is_rendered = false;
                        global_coin_shop_is_rendered = false;

                        // Check if any of these pages are currently open and render them again
                        if (global_menu_page == "shop_screen") {
                            load_shop();
                        } else if (global_menu_page == "coin_shop_screen") {
                            load_coin_shop();
                        } else if (global_menu_page == "shop_item_screen") {
                            // load the same shop item again or fallback to the shop... just in case
                            if (global_active_shop_item_group !== null && global_active_shop_item_group_index !== null) {
                                render_shop_item(global_active_shop_item_group, global_active_shop_item_group_index);
                            } else {
                                open_shop();
                            }
                        }
                        
                    } else {
                        queue_dialog_msg({
                            "title": localize("toast_title_wallet_error"),
                            "msg": localize("toast_msg_wallet_error"),
                        });
                        console.error("Invalid data: " + JSON.stringify(data));
                    }
                }
            );
        }
    });

    console.log("LOAD200");
    
    bind_event('on_post_load', function () {
        console.log("POSTLOAD000");

        _for_each_in_class("checkbox_component", function (element) {
            element.addEventListener("click", function() {
                var variable = element.dataset.variable;
                if (variable) {
                    var value = false;
                    var data_value = element.dataset.enabled;
                    if (data_value && (data_value === "true" || data_value === true)) {
                        value = true;
                    }
                    value = !value;
                    //engine.call("echo", "set_bool_variable " + variable + " = " + value);
                    engine.call("set_bool_variable", variable, value);
                    if (value) {
                        engine.call('ui_sound', 'ui_check_box');
                    } else {
                        engine.call('ui_sound', 'ui_uncheck_box');
                    }
                }
            });
            var current_variable = element.dataset.variable;
            if (current_variable) {
                engine.call("initialize_checkbox_value",current_variable);
            }
        });

        // Setup crosshair preview container background scrolling
        //solution from https://stackoverflow.com/a/34655348
        var inc_X_by = 0, inc_Y_by = 0, total_X = 0, total_Y = 0, X_prev = 0, Y_prev = 0;
        _for_each_with_class_in_parent(_id("crosshair_previews_containers"), "crosshair_previews_container", function(container) {
            container.addEventListener("mousedown", function(e) {
                let offset_left = container.getBoundingClientRect().left;
                mouse_X = (e.clientX - offset_left);
                container.dataset.scrolling = true;
                X_prev = mouse_X;
            });
            container.addEventListener("mouseup", function(e) {
                container.dataset.scrolling = false;
            });
            container.addEventListener("mouseleave", function(e) {
                container.dataset.scrolling = false;
            });
            container.addEventListener("mousemove", function(e) {
                if (container.dataset.scrolling == "true") {
                    let offset_left = container.getBoundingClientRect().left;
                    mouse_X = (e.clientX - offset_left);

                    inc_X_by = mouse_X - X_prev;
                    let string = container.style.backgroundPosition;
                    if (string != undefined) {
                        pos = Number(string.split("px 50")[0]);
                    } else {
                        pos = 0;
                    }
                    
                    container.style.backgroundPosition = (pos + inc_X_by)+"px 50%";

                    X_prev = mouse_X;

                    total_X = total_X + inc_X_by;
                }
            });
        });

        console.log("POSTLOAD001");

        //Must do this after the engine has had an opportunity to send setting values like hit sounds.
        settings_combat_update(0);        

        // Temporary solution to get list all the stickers available, see customize_screen.js -> set_asset_browser_content
        //engine.call("request_character_browser_update", "decals");

        post_load_setup_hud_editor();
        init_hud_editor_elements();

        init_screen_learn();
        init_screen_aim();
        init_screen_practice();

        engine.call("update_friends_list");
        
        set_logged_out_screen(false);

        engine.call("post_load_finished");
        console.log("POSLOAD100");

    });

    window.requestAnimationFrame(anim_update);
    window.requestAnimationFrame(anim_misc);
    
    // add double click selection for all the input fields initially already in the dom
    // dynamically added ones need to have the listener added manually or have this in the tag: ondblclick="this.setSelectionRange(0, this.value.length);"
    _for_each_in_tag("input", function(el) {
        el.addEventListener("dblclick", function() {
            this.setSelectionRange(0, this.value.length);
        })
    });

    console.log("LOAD201");

    // This only allows for a single slider to be set for a variable, dunno if that can be an issue
    _for_each_with_class_in_parent(_id("main_menu"), "range-slider", function(el) {
        let variable = el.dataset.variable ? el.dataset.variable : null;
        if (variable != null) {
            global_range_slider_map[variable] = new rangeSlider(el, true);
        }
    });

    // Initialize range sliders
    _for_each_with_class_in_parent(_id("main_menu"), "range-slider", function(el) {
        var variable = el.dataset.variable;
        if (variable) {
            engine.call("initialize_range_value", variable);
        }
    });

    console.log("LOAD202");

    // Initialize character sticker decals variable
    engine.call("initialize_select_value", "game_decals");

    init_custom_game_references();

    init_custom_modes();

    //Initialize canvas crosshair creator preview maps and crosshair preset options
    createCanvasCrosshairPreviewMaps();
    initialize_canvas_crosshair_presets();

    // Select list setup, initialize just adds the "click outside to hide list" listeners
    initialize_select(_id("main_menu"));
    _for_each_with_class_in_parent(_id("main_menu"), "settings_modal_dialog", function(el) { initialize_select(el); });
    _for_each_with_class_in_parent(_id("main_menu"), "generic_modal_dialog", function(el) { initialize_select(el); });
    initialize_select_fields();

    initialize_tooltip_hovers();
    initialize_tooltip_type2();
    initialize_tooltip2_cleanup_listener();

    _for_each_in_class("select_setting", function (element) {
        addListener(element, function(opt, field) {
            update_selectmenu(element, false);
        });
    });

    console.log("LOAD208");

    // load shared code between menu and hud views
    init_shared();

    init_screen_ingame_menu();
    init_screen_home();
    init_screen_customize();
    init_screen_battlepass_list();
    init_screen_battlepass();
    init_screen_create();
    init_screen_play_customlist();
    init_screen_play();
    init_screen_custom();
    init_watch_screen();
    init_legal();

    console.log("LOAD209");

    initialize_scrollbars();
    
    setupMenuSoundListeners();
    setupVariousListeners();

    init_notifications();
    init_shop_item_debug_listeners();

    set_masterserver_connection_state(false, true);

    console.log("LOAD210");
    engine.call('menu_view_loaded');
});

function set_masterserver_connection_state(connected, initial) {

    global_ms_connected = connected;

    if (!initial) {
        _id("connecting_masterserver").style.display = "none";
    }

    if(connected) {
        console.log("POSTMSAUTH000");

        global_ms_connected_count++;

        // =============================
        // Request data from MS and API
        // =============================

        // Request initial invite and party infos
        send_string(CLIENT_COMMAND_GET_INVITE_LIST);
        send_string(CLIENT_COMMAND_PARTY, "party-status");

        send_string(CLIENT_COMMAND_GET_RANKED_MMRS);

        // Request API token
        send_string(CLIENT_COMMAND_GET_API_TOKEN, "", "apitoken", function(token) {
            apiHandler().updateToken(token);

            // Request the general user information
            load_user_info(function(user) {
                if (user.social_profiles.find(c => c.type === "twitch")) {
                    _id("settings_connections_twitch_unlink").style.display = "flex";
                    update_twitch_list_link_state(true);
                } else {
                    _id("settings_connections_twitch_link").style.display = "flex";
                    update_twitch_list_link_state(false);
                }

                if (user) {
                    global_self.private.coins = user.user.coins
                    global_self.private.challenge_reroll_ts = (user.user.challenge_reroll_ts == null) ? null : new Date(user.user.challenge_reroll_ts);
                    update_wallet(global_self.private.coins);
                }
            });

            // Only request these things the first time around to avoid any extra hickups when reconnecting during gameplay
            if (global_ms_connected_count <= 1) {
                // Request the users customization item list
                load_user_customizations();

                // Get the list of saved huds
                load_user_hud_list();

                // Request battlepass data
                load_battlepass_data(load_battlepass_rewards_data);

                // Shop
                load_shop_data();
            }

            console.log("POSTAPIAUTH100");
        });

        // Only request these things the first time around to avoid any extra hickups when reconnecting during gameplay
        if (global_ms_connected_count <= 1) {
            // Requeust queues
            send_string(CLIENT_COMMAND_GET_QUEUES);
        }

        // Request competitive season info
        send_string(CLIENT_COMMAND_GET_COMP_SEASON);

        // Request and show user notifications
        send_string(CLIENT_COMMAND_GET_NOTIFICATIONS, "", "get-notifications", function(data) {
            if (data.notifs.length) {
                for (let n of data.notifs) {
                    if (n.notif_id) global_notifs.addNotification(n);
                }
                setTimeout(function() {
                    load_notifications();
                },1000);
            }
        });

        // Request match reconnect informations
        send_string(CLIENT_COMMAND_GET_RECONNECTS);

        // =============================
        // Show/Hide ui containers
        // =============================

        // Hide not connected indicator
        _id("masterserver_warning").style.display = "none";

        _id("play_screen_content").style.display = "flex";
        _id("play_screen_unavailable").style.display = "none";

        _id("customize_menu").style.display = "flex";
        _id("customize_content").style.display = "flex";
        _id("customize_offline_msg").style.display = "none";

        console.log("POSTMSAUTH100");

    } else {

        // Show not connected indicator
        if (!initial) {
            _id("masterserver_warning").style.display = "flex";
        }

        _id("play_screen_content").style.display = "none";
        _id("play_screen_unavailable").style.display = "flex";

        _id("customize_menu").style.display = "none";
        _id("customize_content").style.display = "none";
        _id("customize_offline_msg").style.display = "flex";

        // Remove the queues
        clear_queues();

        // Stop searching
        process_queue_msg("all", "stop");

    }
}

function update_variable(type, variable, value, callback_type, callback) {
    /* type: 
     *   string / bool / real
     * callback type
     *   select / color / range / checkbox / custom_component
     * 
     * Note: engine.calls are synchronous, so if an engine.call calls a js event then the engine.call will wait for that event to finish before being "done"
     */
    if (callback_type != undefined && callback != undefined && typeof callback == "function") {
        global_variable.addResponseHandler(callback_type, variable, callback);
    }

    if (type == "string") engine.call("set_string_variable", variable, value);
    if (type == "bool")   engine.call("set_bool_variable", variable, value);
    if (type == "real")   engine.call("set_real_variable", variable, value);
}

function parse_modes(modes) {
    global_queues = {};

    for (let name in modes) {
        let vs = '';
        let i18n = 'game_mode_';
        let mode = '';
        var modifier = '';

        if (modes[name].modes.length == 0) continue;
        else if (modes[name].modes.length == 1) {
            if (modes[name].modes[0].instagib && modes[name].modes[0].mode_name != "ghosthunt") modifier += localize("game_mode_type_instagib")+" ";
            i18n += modes[name].modes[0].mode_name;
            mode = modes[name].modes[0].mode_name;
        } else {
            if (modes[name].players_per_team == 1) {
                i18n += "circuit";
                mode = "solo_mix";
            } else {
                if (modes[name].max_party_size == 1) {
                    i18n += "pickup";
                } else {
                    i18n += "circuit";
                }
                mode = "team_mix";
            }
        }

        if (modes[name].teams == 2) {
            vs += modes[name].players_per_team+localize("game_mode_type_vs_short")+modes[name].players_per_team;
        } else {
            if (modes[name].players_per_team == 1) vs += localize("game_mode_type_ffa");
            else vs += Array(modes[name].teams).fill(modes[name].players_per_team).join(localize("game_mode_type_vs_short"));
        }

        let queue_name = '';
        if (mode == "ffa") {
            queue_name = vs+" "+modifier.toUpperCase();
        } else {
            queue_name = vs+" "+localize(i18n).toUpperCase()+" "+modifier.toUpperCase();
        }

        let roles = [];
        for (let role in modes[name].roles) {
            roles.push({
                "name": role,
                "i18n": "role_"+role,
                "players": modes[name].roles[role]
            });
        }

        global_queues[name] = {
            "i18n": i18n,
            "match_type": modes[name].type,
            "vs": vs,
            "queue_name": queue_name,
            "team_size": modes[name].players_per_team,
            "modes": modes[name].modes,
            "roles": roles,
            "locked": modes[name].enabled ? false : true,
            "leaderboard": modes[name].leaderboard,
            "ranked": modes[name].ranked,
        };
    }
}

function handle_match_reconnect(data) {
    let dialog_object = {
        //"dialog_type": "sticky",
        "duration": 120000,
        "title": localize("title_reconnect"),
        "msg": localize_ext("message_reconnect", {
            "type": localize(MATCH_TYPE[data.match_type].i18n),
            "mode": localize(global_game_mode_map[data.match_mode].i18n),
        }),
        "options": [
            {   
                "label": localize("menu_button_join"),
                "callback": function() {
                    send_string(CLIENT_COMMAND_RECONNECT);
                }
            }
        ]
    };

    if (data.penalty == true) {
        dialog_object.msg = localize_ext("message_reconnect_abandon", {
            "type": localize(MATCH_TYPE[data.match_type].i18n),
            "mode": localize(global_game_mode_map[data.match_mode].i18n),
        });
        dialog_object.options.push({
            "label": localize("menu_button_abandon"),
            "callback": function() {
                send_string(CLIENT_COMMAND_ABANDON);
            },
            "style": "negative",
        });
    } else {
        dialog_object.options.push({   
            "label": localize("menu_button_dismiss"),
            "callback": function() {
                send_string(CLIENT_COMMAND_DISMISS_RECONNECT);
            },
        });
    }

    queue_dialog_msg(dialog_object);
}


function set_console(visible) {
    if (visible) {
        window.console_prompt.value='';
        window.console_buffer.style.bottom = "0px";
        window.console_view.style.display='flex';
        window.console_prompt.focus();
    } else {
        window.console_prompt.value='';
        window.console_view.style.display='none';
        window.console_prompt.blur();
    }
}

// animationFrame loop for misc purposes to not mix it with the anim library, currently only used for the queue timer (replaced anime.js)
_last_anim_misc = performance.now();
function anim_misc(timestamp) {
    _last_anim_misc = timestamp;

    if (global_mm_start_ranked) {
        global_mm_queuetime_ranked = timestamp;
        global_mm_start_ranked = false;
        global_mm_searching_ranked = true;
    }
    if (global_mm_start_quickplay) {
        global_mm_queuetime_quickplay = timestamp;
        global_mm_start_quickplay = false;
        global_mm_searching_quickplay = true;
    }

    if (global_mm_searching_ranked) {
        let time = Math.floor((timestamp - global_mm_queuetime_ranked) / 1000);
        if (time != global_mm_time_ranked) {
            global_mm_time_ranked = time;
            let queueTimerDOM = _get_first_with_class_in_parent(_id("queue_mm_box"), 'queue_queue_time');
            let minutes = Math.floor(time / 60);
            let seconds = time % 60;
            let formattedMinutes = ("0" + minutes).slice(-2);
            let formattedSeconds = ("0" + seconds).slice(-2);

            _html(queueTimerDOM, formattedMinutes + ":" + formattedSeconds);
        }
    }
    if (global_mm_searching_quickplay) {
        let time = Math.floor((timestamp - global_mm_queuetime_quickplay) / 1000);
        if (time != global_mm_time_quickplay) {
            global_mm_time_quickplay = time;
            let queueTimerDOM = _get_first_with_class_in_parent(_id("queue_quickplay_box"), 'queue_queue_time');
            let minutes = Math.floor(time / 60);
            let seconds = Math.floor(time % 60);

            let formattedMinutes = ("0" + minutes).slice(-2);
            let formattedSeconds = ("0" + seconds).slice(-2);

            _html(queueTimerDOM, formattedMinutes + ":" + formattedSeconds);
        }
    }

    window.requestAnimationFrame(anim_misc);
}

function open_modal_screen(id, cb, lock_modal) {
    // Prevent modal from being closed for lock_modal time (or unlimited if -1)
    if (lock_modal !== undefined) {
        if (lock_modal == -1) {
            global_manual_modal_close_disabled = true;
        } else if (lock_modal > 0) {
            global_manual_modal_close_disabled = true;
            setTimeout(function() {
                global_manual_modal_close_disabled = false;
            }, lock_modal);
        }
    }

    _id("modal_dialogs").style.display = "block";

    engine.call("ui_sound", "ui_window_open");
    engine.call("set_modal", true);
    anim_show(_id(id), 100, "flex", cb);
}

var global_manual_modal_close_disabled = false;
function close_modal_screen(e, selector, instant) {
    if (global_manual_modal_close_disabled) return;

    let el = undefined;
    if (selector !== undefined) {
        el = _id(selector);
    } else {
        el = e.currentTarget;
        e.stopPropagation();
    }

    let style = window.getComputedStyle(el);
    if (style.getPropertyValue('display') == "none") return;

    if (instant && instant === true) {
        el.style.display = "none";
    } else {
        engine.call("ui_sound", "ui_window_close");
        anim_hide(el,100);
    }

    // Close any open select lists
    _click_outside_handler();

    engine.call("set_modal", false);

    // Update the Matchlist if we are currently looking at it
    if (el.id == "region_select_modal_screen" && global_menu_page == "play_panel" && global_play_menu_page == "play_screen_customlist") {
        renderMatchList();
    }

    _id("modal_dialogs").style.display = "none";
}

function close_modal_screen_by_selector(id, instant) {
    close_modal_screen(null, id, instant);
    return false;
}

var mask_containers = [];
var crosshair_containers = [];
var zoom_crosshair_containers = [];
function initialize_references(){
    //References for quick access. Intentionally not using var or "window." here so that
    //it's easier to migrate to Closusre/Advanced in the future. (See closure compiler documentation)
    //for limitations regarding global variables).
    hud_containers = [_id("real_hud"), _id("hud_preview")];
    game_hud_special = _id("game_hud_special");
    real_hud_container = _id("real_hud_container");
    real_hud_element = _id("real_hud");
    preview_hud_element = _id("hud_preview");
    mask_containers = [_id("game_masks_container"), _id("game_masks_container_zoom")];
    crosshair_containers = [];
    zoom_crosshair_containers = [];
    _for_each_in_class("game_crosshairs_container", function(el) { crosshair_containers.push(el); });
    _for_each_in_class("game_zoom_crosshairs_container", function(el) { zoom_crosshair_containers.push(el); });
    //_for_each_in_class("crosshair_preview_container", function(el) { crosshair_containers.push(el); });
}

function goUpALevel(){
    close_modal_screen_by_selector('battlepass_rewards_modal_screen');
    close_modal_screen_by_selector('quit_dialog_modal_screen');
    close_modal_screen_by_selector('disconnect_dialog_modal_screen');
    close_modal_screen_by_selector('reset_hud_modal');
    close_modal_screen_by_selector('map_choice_modal_screen');
    close_modal_screen_by_selector('hud_editor_delete_modal_screen');
    close_modal_screen_by_selector('custom_game_settings_modal_screen');
    close_modal_screen_by_selector('region_select_modal_screen');
    close_modal_screen_by_selector('generic_modal');
    close_modal_screen_by_selector('basic_modal');
    close_modal_screen_by_selector('customlist_filter_modal_screen');
    close_modal_screen_by_selector('advanced_mouse_settings_screen');
    close_modal_screen_by_selector('field_of_view_conversion_screen');
    close_modal_screen_by_selector('mask_editor_screen');
    close_modal_screen_by_selector('zoom_mask_editor_screen');
    close_modal_screen_by_selector('crosshair_canvas_editor_screen');
    close_modal_screen_by_selector('crosshair_canvas_zoom_editor_screen');
}

function colorPickerValueUpdated(element, jscolor){
    var color = String(jscolor);
    engine.call("set_string_variable", element.dataset.variable, color);
}

function setupVariousListeners() {

    let prevent_sound_hack = false;

    let menu_bottom_bp = _id("menu_background_bottom").querySelector(".menu_bottom_battlepass_open");
    let menu_bottom_challenges = _id("menu_background_bottom").querySelector(".menu_bottom_battlepass_daily");

    menu_bottom_bp.addEventListener("mouseenter", function() {
        // Hack to stop mouseover sound from being played when clicking on this item (since click replaces the content, forces a redraw -> re-triggers mouseenter)
        if (!prevent_sound_hack) {
            engine.call("ui_sound", "ui_mouseover2");
        } else {
            prevent_sound_hack = false;
        }
        let menu_bottom_label = menu_bottom_bp.querySelector(".menu_bottom_battlepass_label");
        if (menu_bottom_label) menu_bottom_label.classList.add("hover");
        let menu_bottom_level_icon = menu_bottom_bp.querySelector(".bp_level_icon");
        if (menu_bottom_level_icon) menu_bottom_level_icon.classList.add("hover");
    });
    menu_bottom_bp.addEventListener("mouseleave", function() {
        let menu_bottom_label = menu_bottom_bp.querySelector(".menu_bottom_battlepass_label");
        if (menu_bottom_label) menu_bottom_label.classList.remove("hover");
        let menu_bottom_level_icon = menu_bottom_bp.querySelector(".bp_level_icon");
        if (menu_bottom_level_icon) menu_bottom_level_icon.classList.remove("hover");
    });
    menu_bottom_bp.addEventListener("click", function() {
        engine.call("ui_sound", "ui_click1");
        prevent_sound_hack = true;
        open_battlepass();
    });
    menu_bottom_challenges.addEventListener("mouseenter", function() {
        let label = menu_bottom_challenges.querySelector(".label");
        if (label) label.classList.add("hover");
    });
    menu_bottom_challenges.addEventListener("mouseleave", function() {
        let label = menu_bottom_challenges.querySelector(".label");
        if (label) label.classList.remove("hover");
    });
    /*
    menu_bottom_challenges.addEventListener("click", function() {
        engine.call("ui_sound", "ui_click1");
        open_battlepass();
    });
    */

    /*
    _id("custom_lobby_join_link").querySelector(".copy").addEventListener("click", function() {
        let input = _id("custom_lobby_join_link").querySelector("input");
    });
    */

    // Keybinding hover to show the delete button
    _for_each_with_class_in_parent(_id("settings_screen_controls"), "controls_value", function(el) {
        el.addEventListener("mouseenter", function() { if (el.firstElementChild) el.firstElementChild.classList.add("hover"); });
        el.addEventListener("mouseleave", function() { if (el.firstElementChild) el.firstElementChild.classList.remove("hover"); });
    });

    _id("custom_game_button_inviterem").addEventListener("click", function(e) {
        e.stopPropagation();
        invite_friends();
    });

    // Setup number only input fields
    let number_inputs = document.querySelectorAll("input.number");
    for (let i=0; i<number_inputs.length; i++) {
        _numberInput(number_inputs[i]);
    }

    // Max fps setting checkbox handlers
    let video_max_fps_cb = _id("setting_video_max_fps_cb");
    video_max_fps_cb.addEventListener("click", function() {
        if (video_max_fps_cb.classList.contains("checkbox_enabled")) {
            video_max_fps_cb.classList.remove("checkbox_enabled");
            video_max_fps_cb.firstChild.classList.remove("inner_checkbox_enabled");            
            update_variable("real", "video_max_fps", 0);
        } else {
            video_max_fps_cb.classList.add("checkbox_enabled");
            video_max_fps_cb.firstChild.classList.add("inner_checkbox_enabled");
            update_variable("real", "video_max_fps", 250);
        }
    });

    let video_lobby_max_fps_cb = _id("setting_lobby_video_max_fps_cb");
    video_lobby_max_fps_cb.addEventListener("click", function() {
        if (video_lobby_max_fps_cb.classList.contains("checkbox_enabled")) {
            video_lobby_max_fps_cb.classList.remove("checkbox_enabled");
            video_lobby_max_fps_cb.firstChild.classList.remove("inner_checkbox_enabled");
            update_variable("real", "video_lobby_max_fps", 0);
        } else {
            video_lobby_max_fps_cb.classList.add("checkbox_enabled");
            video_lobby_max_fps_cb.firstChild.classList.add("inner_checkbox_enabled");
            update_variable("real", "video_lobby_max_fps", 125);
        }
    });
    

    // ============================================================================
    // Enable text selection across the whole ui for elements with user-select:text
    (function() {
        // State variables
        var anchorCaretPosition = null;

        document.addEventListener('mousedown', (event) => {
            // Reset any current selection
            document.getSelection().empty();

            // Get the anchor node and offset
            if (event.button == 0 && !event.target.select && !anchorCaretPosition) {
                anchorCaretPosition = document.caretPositionFromPoint(event.x, event.y);
            }
        });

        document.addEventListener('mousemove', (event) => {
            // Get the focus node and offset and make a selection
            try {
                if ((event.buttons & 1) === 1 && !event.target.select && anchorCaretPosition) {
                    var focusCaretPosition = document.caretPositionFromPoint(event.x, event.y);
                    document.getSelection().setBaseAndExtent(
                        anchorCaretPosition.offsetNode, anchorCaretPosition.offset,
                        focusCaretPosition.offsetNode, focusCaretPosition.offset);
                }
            } catch(err) {
                console.log("Error", err);
            }
        });

        document.addEventListener('mouseup', (event) => {
            // Reset state
            anchorCaretPosition = null;
        });
    })();

    // /devop ui_call open_profile <id>
    bind_event("open_profile", function(id) {
        open_player_profile(id);
    });

    // /devop ui_call open_match <id>
    bind_event("open_match", function(id) {
        open_match(id);
    });
}


function genericModal(title, text, btn_negative, cb_negative, btn_positive, cb_positive) {
    let modal = _id("generic_modal");

    _for_first_with_class_in_parent(modal, "generic_modal_dialog_header", function(el) {
        if (title !== undefined) {
            el.style.display = "flex";
            _html(el, title);
        } else {
            el.style.display = "none";
        }
    });

    _for_first_with_class_in_parent(modal, "generic_modal_dialog_text", function(el) {
        if (text.nodeType == undefined) {
            // Text
            _html(el, text);
        } else if (text.nodeType == 1 || text.nodeType == 11) {
            // Element Node
            _empty(el);
            el.appendChild(text);
        }
    });

    _for_first_with_class_in_parent(modal, "negative", function(el) {
        if (btn_negative) {
            _html(el, btn_negative);
        } else {
            _empty(el);
        }

        el.onclick = function() {
            close_modal_screen_by_selector('generic_modal');

            if (typeof cb_negative == "function") {
                cb_negative();
            }
        };
    });

    _for_first_with_class_in_parent(modal, "positive", function(el) {
        if (btn_positive) {
            _html(el, btn_positive);
        } else {
            _empty(el);
        }

        el.onclick = function() {
            close_modal_screen_by_selector('generic_modal');

            if (typeof cb_positive == "function") {
                cb_positive();
            }
        };
    });

    open_modal_screen("generic_modal");
}
function basicGenericModal(title, content, button, cb) {
    let fragment = _createElement("div");

    if (title) {
        if (typeof title === "string") {
            let header = _createElement("div", "generic_modal_dialog_header", title);
            fragment.appendChild(header);
        } else if (title.nodeType != undefined && title.nodeType == 1 || title.nodeType == 11) {
            let header = _createElement("div", "generic_modal_dialog_header");
            header.appendChild(title);
            fragment.appendChild(header);
        }
    }

    if (content) {
        let content_cont = _createElement("div", "generic_modal_dialog_text");
        if (content.nodeType == undefined) {
            // Text
            content_cont.textContent = content;
        } else if (content.nodeType == 1 || content.nodeType == 11) {
            // Element Node
            content_cont.appendChild(content);
        }
        fragment.appendChild(content_cont);
    }

    if (button) {
        let btn_cont = _createElement("div", "generic_modal_dialog_action");
        if (typeof button === "string") {
            // Text
            let btn = _createElement("div", "dialog_button", button);
            _addButtonSounds(btn, 1);
            btn.addEventListener("click", function() {
                closeBasicModal();

                if (typeof cb === "function") cb();
            });
            btn_cont.appendChild(btn);
        } else if (button.nodeType != undefined && button.nodeType == 1 || button.nodeType == 11) {
            // Element Node
            btn_cont.appendChild(button);
        }
        fragment.appendChild(btn_cont);
    }

    return fragment;
}

function updateBasicModalContent(content) {
    let modal = _id("basic_modal");

    _for_first_with_class_in_parent(modal, "generic_modal_dialog_container", function(el) {
        _empty(el);

        if (content.nodeType == undefined) {
            // Text
            el.textContent = content;
        } else if (content.nodeType == 1 || content.nodeType == 11) {
            // Element Node
            el.appendChild(content);
        }
    });
}

function openBasicModal(content) {
    updateBasicModalContent(content);
    open_modal_screen("basic_modal");

    setTimeout(() => {
        refreshScrollbars(_id("basic_modal"));
    }, 100);
}

function closeBasicModal(instant) {
    // instant == true, close without animation/delay
    close_modal_screen_by_selector('basic_modal', instant);   
}

function settingsTwitchAccount(isLinked) {
    engine.call("open_browser",
                isLinked ?
                "https://www.diabotical.com/twitch/unlink" :
                "https://www.diabotical.com/twitch/link");
}

function preload_image(url) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.src=url;
    img.onload = function () {
      resolve();
    }
    img.onerror = function() {
      // Works as intended. Do not handle errors
      resolve();
    }
  });
}

function replay_css_anim(element) {
  element.getAnimations().map(function (anim) {
    anim.currentTime = 0;
    anim.play();
  });
}


function update_styles(el, styles) {
    Object.keys(styles).forEach(style => {
        el.style[style] = styles[style];
    });
}

function verify_script_data() { //backup if script_data.js is not present
    //Generated 29th July 2020
    if(typeof global_weapon_data === 'undefined'){
        window.global_weapon_data = {"sword":{"weapon_tag":"melee","bind_group":"9","color":"888888","damage":"50","knockback":"250","ground_knockback":"250","rate":"700","speed":"0","can_destroy":"1","unlimited_ammo":"true","distance":"38","hit_radius":"25","allow_during_bolt":"true","melee_reward":"true","shot_particles":"railtest","shot_particles_attached":"rail_attached","impact_particles":"rail_impact","equip_particles_attached":"sword_equip","melee_animation":"true","model":"weapon_sword","model_position":"6.2 -7 8.7","model_scale":"0.10 0.10 0.10","model_camera_scale":"0.3","model_rotation":"175 -4 0","muzzle":"4.5 -6 20","fov":"59","shot_sound":"m_fire1 m_fire2 m_fire3 m_fire4 m_fire5","impact_sound":"m_impact1 m_impact2 m_impact3 m_impact4 m_impact5","hit_sound":"testhit1","equip_sound":"m_equip"},"blaster":{"respawn_time":"9","weapon_tag":"bl","color":"7c62d1","speed":"2200","rate":"100","damage":"20","default_ammo_pickup_ammo":"50","default_weapon_pickup_ammo":"75","max_ammo":"150","category":"1","bind_group":"1","splash_radius":"20","center_of_mass_offset":"0","center_of_mass_offset_self":"0","knockback":"17.5","knockback_self":"20","ground_knockback":"17.5","ground_knockback_self":"20","hit_radius":"1.5","combo_rate":["machinegun 100"," super_shotgun 100","shaft 100","rocket_launcher 100","pncr  100","grenade_launcher 100"],"decal":["decal_plasma 30 3 3.561 false false alpha 5","decal_glow_blue 25 1.75 3.561 false false alpha 40"],"loop_animation":"true","upgrade_animation":"true","muzzle_offset":"8 -9 0","model":"weaponbl","model_scale":"0.06","model_position":"2.5 -3.35 3.55","model_camera_scale":"0.6","can_destroy":"1","muzzle":"10 -8 16","fov":"30","model_scale_third_person":"1.1","model_position_third_person":"5 -11 12","detached_shot_particles":["false","false"],"shot_particles":"empty_system","shot_particles_attached":"plasma_muzzle_tier_1","missile_particles":"plasma_bullet_tier_1","impact_particles":"plasma_impact_tier_1","shot_sound":"bl_fire1 bl_fire2 bl_fire3 bl_fire4 bl_fire5","end_sound":"bl_fire_release1 bl_fire_release2 bl_fire_release3 bl_fire_release4 bl_fire_release5","missile_loop_sound":"bl_airbound","impact_sound":"bl_impact1 bl_impact2 bl_impact3 bl_impact4","equip_sound":"bl_equip","hit_sound":"hit_sound_hit1","out_of_ammo_sound":"bl_ooa","animation_suffix":"_stage2"},"super_shotgun":{"respawn_time":"9","weapon_tag":"ss","color":"9bc44d","default_ammo_pickup_ammo":"10","default_weapon_pickup_ammo":"15","max_ammo":"40","charge_animation":"1","shots_per_round":"20","spread":"4.6 4.6","spread_radius":"3","rate":"1000","damage":"5 5","max_damage_distance":"200","min_damage_distance":"800","min_hits":"2","bounce":"0","spread_ring":"0 6 6","knockback":"4.5","ground_knockback":"4.5","parallel_knockback":"true","impact_particles_distance_delay":"0.12","independent_upgrade_model":"true","hit_radius":"1.5 0","category":"2","bind_group":"2","group_damage":"true","max_damage_reward":"true","combo_rate":["machinegun 850","shaft 850","rocket_launcher 850","pncr 850","blaster 850","grenade_launcher 850"],"shot_particles":"empty_system","shot_particles_attached":"sg_tier_2_muzzle","missile_particles":"sg_projectile","impact_particles":"sg_impact_v2","decal":["decal 7 3 3.561 false false alpha 7","decal_glow_red 16 3 3.561 false false alpha 30","decal_glow 10 3 3.561 false false alpha 50"],"model":"weaponss","model_position":"2.5 -3 3.1","model_camera_scale":"0.5","can_destroy":"1","model_scale":"0.075","muzzle":"2.6 -2.7 4.7","fov":"40","model_scale_third_person":"1","model_position_third_person":"-3.2 0 6","shot_sound":"ss_fire1 ss_fire2 ss_fire3 ss_fire4","equip_sound":"ss_equip","out_of_ammo_sound":"ss_ooa","hit_sound":"hit_sound_hit1","detached_shot_particles":"false","multi_round_particles":"false","unlimited_ammo":"false"},"shaft":{"respawn_time":"9","weapon_tag":"shaft","color":"cdb200","rate":"50","damage":"6 6","min_damage_distance":"674","max_damage_distance":"675","category":"4","bind_group":"4","hit_radius":"2.2 0","knockback":"9.6","ground_knockback":"9","distance":"768","default_ammo_pickup_ammo":"50","default_weapon_pickup_ammo":"100","max_ammo":"150","min_ammo_gain":"10","speed":"0","orb":"true","orb_lag":"0.00","friendly_name":"Shaft","description":"Powerful medium-range sustained-damage weapon.","combo_rate":["machinegun 100"," super_shotgun 100","rocket_launcher 100","pncr 100","blaster 100","grenade_launcher 100"],"missile_particles":"vc_bullet","impact_particles":"shaft_impact","tracking_particles":"shaft_beam_particles","pfx":"shaft_filament muzzle","decal":["decal_shaft_back_connector 1.7 20 3.561 true false min","decal_shaft_connector 2 5 3.561 true false max","decal_shaft_back 1.7 20 3.561 true true min","decal_shaft 2 5 3.561 true true max"],"model":"weaponshaft","loop_animation":"true","model_scale":"0.060","model_position":"2.5 -3 3.6","model_camera_scale":"0.7","model_scale_third_person":"0.9","model_position_third_person":"-3.5 3.5 6","muzzle":"10.0 -11 41.0","fov":"45","parallel_knockback":"true","loop_sound":"shaft_loop1 shaft_loop2 shaft_loop3 shaft_loop4","start_sound":"shaft_ini1 shaft_ini2 shaft_ini3 shaft_ini4","end_sound":"shaft_release1 shaft_release2 shaft_release3 shaft_release4","equip_sound":"shaft_equip","hit_sound":"hit_sound_hit1","proximity_loop_sound":"shaft_idle_loop","out_of_ammo_sound":"shaft_ooa","impact_sound":"shaft_impact1 shaft_impact2 shaft_impact3 shaft_impact4 shaft_impact5 shaft_impact6 shaft_impact7 shaft_impact8","detached_shot_particles":"false"},"rocket_launcher":{"respawn_time":"9","weapon_tag":"rl","color":"df1f2d","speed":"1000","rate":"800","damage":"100","min_splash_damage":"10","splash_damage":"84","splash_hemisphere_offset":"20","splash_hemisphere_offset_damage_multiplier":"0.30","default_ammo_pickup_ammo":"5","default_weapon_pickup_ammo":"10","max_ammo":"25","category":"3","bind_group":"3","hit_radius":"1","friendly_name":"Rocket Launcher","description":"A rocket launcher.","charge_animation":"6","splash_radius":"125","knockback":"100","knockback_self":"110","ground_knockback":"70","ground_knockback_self":"110","center_of_mass_offset":"0","center_of_mass_offset_self":"0","combo_rate":["machinegun 750"," super_shotgun 750","shaft 750","pncr 750","blaster 750","grenade_launcher 750"],"shot_particles":"empty_system","shot_particles_attached":"rl_muzzle_v2","missile_particles":"rl_bullet","impact_particles":"rl_impact_v2","decal":["decal_explosion 340 3 3.561 false false alpha 5","decal_plasma 320 4 3.561 false false alpha 3","decal_glow_explosion 140 2 3.561 false false alpha 25"],"model":"weaponrl","model_scale":"0.07","model_position":"2.5 -3 3.28","model_camera_scale":"0.5","can_destroy":"1","muzzle":"3 -4.5 20","muzzle_offset":"2.5 -3 0","fov":"40","model_scale_third_person":"1","model_position_third_person":"0 4.5 4","shot_sound":"rl_fire1 rl_fire2 rl_fire3 rl_fire4 rl_fire5","missile_loop_sound":"rl_airbound","impact_sound":"rl_impact1 rl_impact2 rl_impact3 rl_impact4","equip_sound":"rl_equip","hit_sound":"hit_sound_hit1","hit_sound_min_pitch":"0.75","out_of_ammo_sound":"rl_ooa","detached_shot_particles":"false"},"crossbow":{"respawn_time":"9","weapon_tag":"cb","color":"1d89cc","speed":"5236.3636363636363636363636363636","rate":"1000","penetrating":"true","damage":"70 90","max_damage_distance":"1250","min_damage_distance":"500","gravity":"400","gravity_pitch_offset":"0","default_ammo_pickup_ammo":"10","default_weapon_pickup_ammo":"15","max_ammo":"25","category":"5","bind_group":"5","splash_radius":"1","center_of_mass_offset":"4","center_of_mass_offset_self":"20","knockback":"25","ground_knockback":"25","hit_radius":"3 2","friendly_name":"Void Cannon","description":"Pew pew pew","combo_rate":["machinegun 800"," super_shotgun 800","shaft 800","rocket_launcher 800","pncr  800","blaster 800","grenade_launcher 800"],"shot_particles":"empty_system","shot_particles_attached":"crossbow_muzzle","missile_particles":"crossbow_projectile","impact_particles":"crossbow_impact","missile_trail_particles":"crossbow_bolt_dynamic_trail","decal":["decal_plasma 30 3 3.561 false false alpha 5","decal_glow_blue 30 3 3.561 false false alpha 5","decal_glow_blue 15 3 3.561 false false alpha 5"],"muzzle_offset":"2.5 -3.22 0","model":"weaponcb","model_scale":"0.0625","model_position":"2.5 -3.22 2.5","model_camera_scale":"0.6","can_destroy":"1","muzzle":"10 -8 16","fov":"40","model_scale_third_person":"1","model_position_third_person":"3 2 12","shot_sound":"cb_fire1 cb_fire2 cb_fire3 cb_fire4 cb_fire5","missile_loop_sound":"cb_airbound","impact_sound":"cb_impact1 cb_impact2 cb_impact3 cb_impact4 cb_impact5","equip_sound":"cb_equip","hit_sound":"hit_sound_hit1","out_of_ammo_sound":"cb_ooa","detached_shot_particles":"false"},"pncr":{"respawn_time":"9","category":"5","bind_group":"5","weapon_tag":"pncr","color":"1fa8b6","damage":"70","bonus_consecutive_damage":"5","max_bonus_consecutive_damage_instances":"6","knockback":"62.5","ground_knockback":"57.5","default_ammo_pickup_ammo":"5","default_weapon_pickup_ammo":"10","max_ammo":"25","penetrating":"true","friendly_name":"PNCR","description":"Point N'Click Rifle","hit_radius":"1 0","charge_animation":"6","charge_animation_bonus":"true","rate":"1450","combo_rate":["machinegun 1450"," super_shotgun 1450","shaft 1450","rocket_launcher 1450","blaster 1450","grenade_launcher 1450"],"shot_particles":"pncr_projectile_particles","shot_particles_attached":"pncr_muzzle_particles","impact_particles":"pncr_impact_particles","pfx":["pncr_lightning_bolt_slot_01 slot_particle_center_01","pncr_lightning_bolt_slot_02 slot_particle_center_02","pncr_lightning_bolt_slot_03 slot_particle_center_03","pncr_lightning_bolt_slot_04 slot_particle_center_04","pncr_lightning_bolt_slot_05 slot_particle_center_05","pncr_lightning_bolt_slot_06 slot_particle_center_06","pncr_lightning_bolt_slot_07 slot_particle_center_07","pncr_muzzle_filament muzzle"],"decal":["decal 8","decal_glow_red 16 3 3.561 false false alpha 2.5","decal_glow_blue 24 3 3.561 false false alpha 5"],"model":"weaponpncr","model_scale":"0.055","model_position":"2.5 -3 2.35","model_scale_third_person":["0.9","0.85"],"model_pivot":"0 0.24 0","model_position_third_person":["0 0 0","-4 14.5 12"],"model_camera_scale":"0.55","can_destroy":"1","muzzle":"2.5 -3.5 6","fov":"50","impressive_reward":"true","parallel_knockback":"true","shot_sound":"pncr_fire1_default_t1","shot_sound_t2":"pncr_fire1_default_t2","shot_sound_t3":"pncr_fire1_default_t3","equip_sound":"pncr_equip","hit_sound":"hit_sound_hit1","proximity_loop_sound":"pncr_idle_loop","out_of_ammo_sound":"pncr_ooa","impact_sound":"pncr_impact_default1 pncr_impact_default2 pncr_impact_default3 pncr_impact_default4"},"machinegun":{"respawn_time":"9","weapon_tag":"mac","default_ammo":"100","default_ammo_pickup_ammo":"50","default_weapon_pickup_ammo":"100","max_ammo":"200","color":"cc791d","bind_group":"6","rate":"100","damage":"5","spread":"0","knockback":"4","ground_knockback":"4","charge_animation":"1","hit_radius":"2 0","combo_rate":[" super_shotgun 50","shaft 50","rocket_launcher 50","pncr  50","blaster 50","grenade_launcher 50"],"loop_animation":"true","shot_particles":"empty_system","shot_particles_attached":"machinegun_muzzle","impact_particles":"machinegun_impact","decal":["decal 10 3 3.561 false false alpha 1","decal_glow_red 16 3 3.561 false false alpha 30","decal_glow 10 3 3.561 false false alpha 20"],"model":"weaponmac","model_position":"2.25 -3 0.01","model_scale":"0.11","model_pivot":"0 -0.22 0","model_camera_scale":"0.5","fov":"40","muzzle":"2.7 -2.8 14","model_scale_third_person":"1.1","model_position_third_person":"6.5 2 2","shot_sound":"mac_fire1 mac_fire2 mac_fire3 mac_fire4 mac_fire5","end_sound":"mac_fire_release1 mac_fire_release2 mac_fire_release3 mac_fire_release4","equip_sound":"mac_equip","hit_sound":"hit_sound_hit1","out_of_ammo_sound":"mac_ooa","impact_sound":"mg_impact_default1 mg_impact_default2 mg_impact_default3 mg_impact_default4 mg_impact_default1 mg_impact_default5 mg_impact_default6 mg_impact_default7 mg_impact_default8 mg_impact_default9 mg_impact_default10","detached_shot_particles":"false","multi_round_particles":"false"},"grenade_launcher":{"respawn_time":"9","weapon_tag":"gl","color":"9d3329","speed":"1000","rate":"800","damage":"100","splash_damage":"90","bounce":"24","duration":"3000","splash_hemisphere_offset":"20","default_ammo_pickup_ammo":"5","default_weapon_pickup_ammo":"10","max_ammo":"25","target_indicator":"true","bind_group":"7","hit_radius":"1","gravity":"450","gravity_pitch_offset":"0.1","bounce_friction":"0.74","splash_radius":"120","knockback":"160","knockback_self":"160","ground_knockback":"160","ground_knockback_self":"160","center_of_mass_offset":"4","center_of_mass_offset_self":"0","combo_rate":["machinegun 875"," super_shotgun 875","shaft 875","pncr 875","blaster 875","grenade_launcher 875"],"shot_particles":"empty_system","shot_particles_attached":"gl_muzzle","missile_particles":"gl_bullet","impact_particles":"gl_impact_v2","missile_trail_particles":"gl_bullet_dynamic_trail","decal":["decal_explosion 100 3 3.561 false false alpha 10","decal_plasma 100 3 3.561 false false alpha 3","decal_plasma 175 3 3.561 false false alpha 3","decal_glow_red 60 3 3.561 false false alpha 25","decal_glow 35 3 3.561 false false alpha 20"],"model_camera_scale":["0.5","0.6"],"model":"weapongl","model_scale":"0.1","model_position":"2.5 -3 3.15","model_pivot":"0 -0.4 0","can_destroy":"1","muzzle":"3 -4.5 20","fov":"40","model_scale_third_person":"1.1","model_position_third_person":"7 -4 28","shot_sound":"gl_fire1 gl_fire2 gl_fire3 gl_fire4","impact_sound":"gl_impact1 gl_impact2 gl_impact3 gl_impact4","bounce_sound":"gl_bounce1 gl_bounce2 gl_bounce3 gl_bounce4 gl_bounce5","equip_sound":"gl_equip","single_missile_sound":"gl_airbound1 gl_airbound2 gl_airbound3 gl_airbound4","hit_sound":"hit_sound_hit1","hit_sound_min_pitch":"0.75","out_of_ammo_sound":"gl_ooa","detached_shot_particles":"false"}};
        console.log("Using backup global_weapon_data");
    }
    if (typeof global_gamemode_data === 'undefined'){
        window.global_gamemode_data = {"default":{"game_enable_items":"1","game_enable_drop":"0","game_initial_item_time":"0","game_truce_time":"0","game_team_mode":"0","game_draft_time":"0","game_rounds":"1","game_tide_bonus":"0","game_confirmation_frag":"0","game_time_limit":"0","game_score_limit":"0","game_maximum_respawn_time_ms":"5000","game_minimum_respawn_time_ms":"1500","game_hp":"125","game_stable_hp":"100","game_ghost_limit_hp":"100","game_max_hp":"200","game_armor":"0","game_stable_armor":"100","game_max_armor":"200","game_medium_armor":"150","game_self_damage":"1","game_wipe_out_mode":"0","game_friendly_fire":"1","game_weapon_respawn_time":"0","game_overtime":"120","game_overtime_score_limit":"0","game_overtime_score_threshold":"0","game_mercy_limit":"0","game_spawn_random_chance":"0","game_spawn_farthest_chance":"0","game_spawn_farthest_foe_chance":"1","game_spawn_farthest_threshold":"3","game_spawn_safety_radius":"0","game_full_charge":"0","game_warmup_time":"90","game_countdown":"5","game_round_countdown":"5","game_double_damage_invulnerability":"0","game_freeze_time":["0","0"],"game_freeze_save_time":["0","0"],"game_classes":"0","game_camera_offset":"0","game_camera_hor_offset":"0","game_player_view_height":"26","game_player_col_radius_hor":"15","game_player_col_radius_ver_bottom":"24","game_model":"0","game_player_hitbox_height":"61","game_player_hitbox_hover_offset":"-0.25","game_lifesteal":"0","game_life_count":"0","game_inventory_slots":"0","game_deposit_coins":"0","game_freeze_save_radius":"0","phy_kinetic_accel":"0","phy_wall_jumping":"0","phy_jump_speedup":"0","phy_sprint_max":"30","phy_sprint_rate":"0","phy_vertical_smoothing_factor":"0.965","phy_strafe_cycles":"1","phy_scale":"1","phy_ramp_impulse_up":"150","phy_target_tickrate":"125","phy_gravity":"800","phy_jump_impulse":"275","phy_lateral_speed_multiplier":"1.0","phy_back_speed_multiplier":"1.0","phy_max_ground_speed":"0","phy_max_hor_speed":"0","phy_crouch_speed":"210","phy_speed":"320","phy_accel_ground":"10","phy_deceleration_ground":"100","phy_surface_friction":"6","phy_air_speed":"320","phy_accel_air":"1","phy_air_speed_anisotropy":"1","phy_accel_air_anisotropy":"1","phy_auto_jump":"1","phy_strafe_jumping":"1","phy_double_jump":"0","phy_double_jump_impulse":"400","phy_decel":"0.3","phy_air_steering_torque":"0","phy_air_steering_torque_anisotropy":"0","phy_air_steering_dottenuation":"1","phy_air_steering_bonus":"0","phy_bolt_type":"1","phy_bolt_cooldown":"3","phy_bolt_cooldown_recovery":"0","phy_bolt_minimum_ground_time":"0.0697941","phy_bolt_base_speed":"482","phy_bolt_extra_speed":"0.1","phy_bolt_extra_accel":"0","phy_bolt_extra_accel_time":"0","phy_bolt_pitch":"22.5","phy_bolt_kinetic_energy":"51200","phy_bolt_ascent_impulse":"200","phy_bolt_activation_time":"0","phy_slide":"0","phy_slide_accel":"10","phy_slide_friction":"0.5","phy_slide_duration_eigenvalue":"2","phy_slide_duration_max":"2","phy_slide_duration_gamma":"1","phy_multi_jump":"0","phy_multi_jump_time":"0.4","phy_step_up":"0","phy_ramp_rel_impulse_up":"0","phy_ramp_up_speed":"0","phy_ramp_down_speed":"0","phy_strafe_mode":"1","phy_triple_jump":"0","net_server_hitscan":"0","net_max_backwards_reconciliation_ping":"0"},"edit":{"game_enable_items":"1","game_self_damage":"0","game_friendly_fire":"0","game_warmup_time":"0","game_draft_time":"0","game_countdown":"0","game_time_limit":"0","game_score_limit":"0","weapon":["sword 999","machinegun 999","blaster 999 true","super_shotgun 999","rocket_launcher 999","shaft 999","crossbow 999","pncr 999","grenade_launcher 999","healing_weeble 999","smoke_weeble 999","implosive_weeble 999","slowfield_weeble 999","explosive_weeble 999"]},"practice":{"game_warmup_time":"0","game_draft_time":"0","game_countdown":"0","game_time_limit":"0","game_weapon_respawn_time":"2","game_hp":"125","game_stable_hp":"100","phy_fly":"0","map":"practice","weapon":["sword 999","machinegun 999","blaster 999 true","super_shotgun 999","rocket_launcher 999","shaft 999","crossbow 999","pncr 999","grenade_launcher 999","healing_weeble 999","smoke_weeble 999","implosive_weeble 999","slowfield_weeble 999","explosive_weeble 999"]},"warmup":{"game_team_mode":"1","game_friendly_fire":"0","game_weapon_respawn_time":"2","game_hp":"125","game_stable_hp":"100","game_ghost_limit_hp":["125","125"],"game_max_hp":"200","game_armor":"100","game_stable_armor":"100","game_max_armor":"200","game_time_limit":"480","game_score_limit":"0","map":["b_crystal_cove","b_furnace","b_refinery","b_wellspring","b_oxide","b_icefall","b_marina","b_sunken"],"weapon":["sword 999","machinegun 100","blaster 250 true","super_shotgun 50","rocket_launcher 50","shaft 250","pncr 50","grenade_launcher 5"]},"brawl":{"game_team_mode":"1","game_friendly_fire":"0","game_weapon_respawn_time":"2","game_hp":"125","game_stable_hp":"100","game_ghost_limit_hp":["125","125"],"game_max_hp":"200","game_armor":"0","game_stable_armor":"100","game_max_armor":"200","game_time_limit":"480","game_score_limit":"0","map":["b_crystal_cove","b_furnace","b_refinery","b_wellspring","b_oxide","b_icefall","b_marina","b_sunken"],"weapon":["sword 999","machinegun 100","blaster 250 true","super_shotgun 50","rocket_launcher 50","shaft 250","pncr 50","grenade_launcher 5"]},"aim_pncr_flickshots":{"game_initial_item_time":"0","game_truce_time":"0","game_hp":"1","game_time_limit":"60","game_spawn_random_chance":"1","game_spawn_farthest_foe_chance":"1","game_maximum_respawn_time_ms":"0","game_minimum_respawn_time_ms":"0","game_bot_respawn_time_ms":"1450","map":"aim1_obstacles","weapon":"pncr 999"},"aim_shaft_close":{"game_initial_item_time":"0","game_truce_time":"0","game_hp":"300","game_time_limit":"60","game_spawn_random_chance":"1","game_spawn_farthest_foe_chance":"1","game_maximum_respawn_time_ms":"0","game_minimum_respawn_time_ms":"0","game_bot_respawn_time_ms":"0","game_bot_desired_distance":"80","map":"aim_shaft","weapon":"shaft 999"},"aim_shaft_mid":{"game_initial_item_time":"0","game_truce_time":"0","game_hp":"300","game_time_limit":"60","game_spawn_random_chance":"1","game_spawn_farthest_foe_chance":"1","game_maximum_respawn_time_ms":"0","game_minimum_respawn_time_ms":"0","game_bot_respawn_time_ms":"0","game_bot_desired_distance":"180","map":"aim_shaft","weapon":"shaft 999"},"aim_shaft_far":{"game_initial_item_time":"0","game_truce_time":"0","game_hp":"300","game_time_limit":"60","game_spawn_random_chance":"1","game_spawn_farthest_foe_chance":"1","game_maximum_respawn_time_ms":"0","game_minimum_respawn_time_ms":"0","game_bot_respawn_time_ms":"0","game_bot_desired_distance":"280","map":"aim_shaft","weapon":"shaft 999"},"duel":{"game_initial_item_time":"0","game_truce_time":"0","game_tide_bonus":"30","game_confirmation_frag":"1","game_time_limit":"720","game_weapon_respawn_time":"5","game_mercy_limit":"15","map":["duel_bioplant","duel_f1sks_house","duel_frontier","duel_kasbah","duel_outpost_dunia","duel_perilous","duel_skybreak"],"weapon":["sword 999","machinegun 100"]},"ca":{"map":["a_barrows_gate","a_bazaar","a_heikam","a_junktion"],"game_truce_time":"7","game_enable_items":"0","game_team_mode":"1","game_rounds":"10","game_score_limit":"3","game_life_count":"2","game_hp":"200","game_stable_hp":"200","game_ghost_limit_hp":"200","game_max_hp":"200","game_armor":"100","game_stable_armor":"100","game_max_armor":"100","game_self_damage":"0","game_wipe_out_mode":"1","game_friendly_fire":"0","weapon":["sword 999","machinegun 100","blaster 250 true","super_shotgun 50","rocket_launcher 50","shaft 250","pncr 50","grenade_launcher 5"]},"rocket_arena":{"map":["a_barrows_gate","a_bazaar","a_heikam","a_junktion"],"game_truce_time":"7","game_enable_items":"0","game_team_mode":"1","game_rounds":"10","game_score_limit":"4","game_life_count":"2","game_hp":"200","game_stable_hp":"200","game_ghost_limit_hp":"200","game_max_hp":"200","game_armor":"100","game_stable_armor":"100","game_max_armor":"100","game_self_damage":"0","game_wipe_out_mode":"1","game_lifesteal":"0.5","game_friendly_fire":"0","weapon":["sword 999","rocket_launcher 999"]},"shaft_arena":{"map":["a_barrows_gate","a_bazaar","a_heikam","a_junktion"],"game_truce_time":"7","game_enable_items":"0","game_team_mode":"1","game_rounds":"10","game_score_limit":"3","game_life_count":"2","game_hp":"200","game_stable_hp":"200","game_ghost_limit_hp":"200","game_max_hp":"200","game_armor":"100","game_stable_armor":"100","game_max_armor":"100","game_self_damage":"0","game_wipe_out_mode":"1","game_lifesteal":"0.5","game_friendly_fire":"0","weapon":["sword 999","shaft 999"]},"wipeout":{"map":["wo_furnace","wo_refinery","wo_wellspring","wo_crystal_cove"],"game_truce_time":"7","game_enable_items":"0","game_team_mode":"1","game_rounds":"10","game_score_limit":"3","game_hp":"200","game_stable_hp":"200","game_ghost_limit_hp":"200","game_max_hp":"200","game_armor":"100","game_stable_armor":"100","game_max_armor":"100","game_self_damage":"0","game_wipe_out_mode":"2","game_friendly_fire":"0","weapon":["sword 999","machinegun 100","blaster 150 true","super_shotgun 50","rocket_launcher 50","shaft 200","pncr 50","grenade_launcher 5","healing_weeble 1"]},"ffa":{"game_team_mode":"1","game_friendly_fire":"0","game_weapon_respawn_time":"2","game_hp":"125","game_stable_hp":"100","game_ghost_limit_hp":"125","game_time_limit":"480","game_score_limit":"0","map":["b_crystal_cove","b_furnace","b_refinery","b_wellspring","b_oxide","b_icefall","b_marina","b_sunken","b_nounoustar_02"],"weapon":["sword 999","machinegun 100"]},"ctf":{"game_team_mode":"1","game_friendly_fire":"0","game_weapon_respawn_time":"2","game_frag_limit":"5","game_time_limit":"960","game_self_damage":"0","map":["ctf_cathedral","ctf_dojo","ctf_waterworks","ctf_quarry"],"weapon":["sword 999","machinegun 100","blaster 100 true","super_shotgun 15","rocket_launcher 15","shaft 50","pncr 5","grenade_launcher 5"]},"macguffin":{"game_team_mode":"1","game_weapon_respawn_time":"2","game_friendly_fire":"0","game_score_limit":"2","game_spawn_farthest_threshold":"4","game_round_countdown":"15","game_maximum_respawn_time_ms":"2500","game_minimum_respawn_time_ms":"2500","map":["mg_sunken","mg_marina"],"weapon":["sword 999","machinegun 100"]},"instagib":{"game_full_charge":"1","game_enable_items":"1","game_self_damage":"0","map":["wo_furnace","wo_refinery","wo_wellspring","wo_crystal_cove"],"weapon":["sword 999","crossbow 999"]},"instagib_brawl":{"game_full_charge":"1","game_enable_items":"1","game_self_damage":"0","map":["wo_furnace","wo_refinery","wo_wellspring","wo_crystal_cove"],"weapon":["sword 999","pncr 999"]},"ghosthunt":{"game_team_mode":"1","game_friendly_fire":"0","game_hp":"100","game_stable_hp":"100","game_full_charge":"1","game_enable_items":"1","game_self_damage":"0","game_time_limit":"360","game_score_limit":"0","game_overtime":"60","map":["ig_coastline","ig_egg-plant","ig_stronghold","ig_terminal"],"weapon":["sword 999","crossbow 999"]},"coinrun":{"game_team_mode":"1","game_friendly_fire":"0","game_hp":"100","game_stable_hp":"100","game_full_charge":"1","game_enable_items":"1","game_self_damage":"0","game_time_limit":"360","game_score_limit":"0","game_overtime":"60","game_deposit_coins":"1","map":["gr_cliffside_canyons","gr_qunai_peaks","gr_titans_crossing"],"weapon":["sword 999","crossbow 999"]},"tdm":{"game_team_mode":"1","game_friendly_fire":"0","game_weapon_respawn_time":"15","game_hp":"125","game_time_limit":"720","game_overtime_score_limit":"10","game_overtime_score_threshold":"10","game_mercy_limit":"30","map":["tdm_icefall","tdm_oxide"],"weapon":["sword 999","machinegun 100"]},"extinction":{"game_friendly_fire":"0","game_team_mode":"1","game_hp":"125","game_score_limit":"2","game_life_count":"3","game_weapon_respawn_time":"5","map":["tdm_icefall","tdm_oxide"],"weapon":["sword 999","machinegun 100"]},"ft":{"map":["b_furnace","b_refinery","b_wellspring","b_crystal_cove","b_oxide","b_icefall","b_marina","b_sunken"],"game_truce_time":"0","game_enable_items":"1","game_team_mode":"1","game_rounds":"10","game_score_limit":"3","game_hp":"125","game_stable_hp":"100","game_ghost_limit_hp":"100","game_max_hp":"200","game_armor":"75","game_stable_armor":"100","game_max_armor":"200","game_self_damage":"0","game_freeze_time":"10000000","game_freeze_save_time":"3","game_freeze_save_radius":"150","game_friendly_fire":"0","weapon":["sword 999","machinegun 50","blaster 75 true","super_shotgun 15","rocket_launcher 10","shaft 50","pncr 5","grenade_launcher 3","healing_weeble 1"]}};
        console.log("Using backup global_gamemode_data");
    }
}