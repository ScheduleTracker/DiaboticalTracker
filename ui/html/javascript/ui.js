const GAMEFACE = true;
const IS_MENU_VIEW = true;

var global_stats_api = new APIHandler("https://www.diabotical.com/api/v0/", true);
//var global_stats_api = new APIHandler("http://localhost:5000/api/v0/", true);
//var global_prismic_api = new APIHandler("http://www.diabotical.com/smth/smth", false);
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
var global_menu_page = "home";
var global_play_menu_page = "quickplay";

// server region / datacenter info
var global_server_regions_init = true;
var global_server_regions = {};
var global_server_locations = {};
var global_server_selected_locations = [];

var global_user_battlepass = {};
var global_battlepass_list = [];
var global_competitive_season = {};

var global_menu_view_loaded = false;
var global_masterserver_connected = false;

window.self_egs_id = "";

/*
function animate_header(element, visible) {
    console.log(visible);
    if (!visible) {
        anim_start({
            element: element,
            duration: 100,
            delay: 0,
            opacity: [element.style.opacity, 0],
            easing: easing_functions.easeOutSine,
            completion: function() {
                element.style.visibility = 'hidden';
                element.style.display = 'none';
            }
        })
    }
    if (visible) {
        element.style.visibility = 'inherit';
        element.style.display = 'inherit';
            anim_start({
                element: element,
                duration: 100,
                delay: 0,
                opacity: [element.style.opacity , 1],
                easing: easing_functions.easeOutSine,
                completion: function() {
                    element.style.visibility = 'inherit';
                    element.style.display = 'inherit';
                }
            })
    }
}
*/

window.addEventListener("load", function(){

    console.log("LOAD ui.js");

    initialize_references();   

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

    bind_event('set_masterserver_state', function (connected, code) {
        // int code:
        // 0 = normal message
        // 1 = epic online service issue


        // for reference:
        //<div id="masterserver_warning">
        // <img src="/html/images/icons/fa/exclamation-triangle.svg"> &nbsp; <span data-i18n="not_connected_to_master" class="i18n">Not connected to masterserver (Reconnecting...)</span>
        //</div>
        if(connected) {
            _id("masterserver_warning").style.display = "none";
        } else {
            _id("masterserver_warning").style.display = "flex";
        }
    });

    bind_event('request_creator_tool', function (tool) {
        set_tool(tool);
    });

    bind_event("set_participant_slot_data", function (egs_id, user_name, avatar_id) {
        _for_each_in_class("egs_id_" + egs_id, function(el) {  
            _html(el, 
                "<div class=avatar style=\"background-image:url('//app-data/avatar-by-egs-id/"+egs_id+".png');\"></div>"+
                "<span class=player_name>" + user_name + "</span>"
            );
        });
    });

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

            if (json_data.action.startsWith("mm-")) {
                handle_mm_match_event(json_data);
            }
            if (json_data.action.startsWith("lobby-")) {
                handle_lobby_event(json_data);
            }
            if (json_data.action.startsWith("party-")) {
                handle_party_event(json_data);
            }
            if (json_data.action.startsWith("invite-")) {
                handle_invite_event(json_data);
            }

            if (json_data.action == "online-friends-data") {
                handle_friends_in_diabotical_data(json_data.data);
            }

            if (json_data.action == "battlepass-data") {
                updateMenuBottomBattlepass(json_data.data);
            }

            if (json_data.action == "chat-msg") {
                main_chat_add_incoming_msg(json_data);
            }

            if (json_data.action == "get-ranked-mmrs") {
                console.log(_dump(json_data));
                global_self.mmr = json_data.data;
                updateQueueRanks();
            }

            if (json_data.action && json_data.action == "post-match-updates") {
                console.log("post-match-updates", _dump(json_data));
                if ("mmr_updates" in json_data.data) {
                    if ("mode" in json_data.data.mmr_updates && "to" in json_data.data.mmr_updates) {
                        global_self.mmr[json_data.data.mmr_updates.mode] = json_data.data.mmr_updates.to;
                        updateQueueRanks();
                    }
                }
                if ("xp_updates" in json_data.data) {
                    // ...
                }
            }

            global_ms.handleResponse(json_data.action, json_data);
        }
        if (type == "s") {
            let action = data.substr(0,data.indexOf(' '));
            let action_data = data.substr(data.indexOf(' ')+1);
            if (data.indexOf(' ') == -1) {
                action = data;
                action_data = ""; 
            }

            if (action.startsWith("mm_match_cancelled")) {
                handle_mm_match_cancelled();
            }

            if (action.startsWith("no-servers-available")) {
                queue_dialog_msg({
                    "title": localize("title_info"),
                    "msg": localize("message_no_servers_avail"),
                });
                
                lobby_hide_loading_overlay();
                set_draft_visible(false);
            }

            if (action.startsWith("lobby-")) {
                handle_lobby_event({
                    "action": action
                });
            }

            if (action == "info-msg") {
                queue_dialog_msg({
                    "title": localize("title_info"),
                    "msg": localize(action_data),
                });
            }
            if (action == "error-msg") {
                queue_dialog_msg({
                    "title": localize("title_error"),
                    "msg": localize(action_data),
                });
            }

            if (action == "party-locations") {
                set_region_selection(false, action_data);
            }


            global_ms.handleResponse(action, action_data)
        }

        //engine.call("echo", "Received JSON Data, action=" + json_data.action);
    });

    pre_load_setup_hud_editor_new();

    /*
    bind_event('set_avatar_options', function (code) {
        $("#avatar_select").html(code);
        $("#avatar_select").selectmenu("refresh");
    });*/


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
        console.log("menu_enabled", enabled);
        // set_element_visible(document.getElementById("main_menu"), enabled);
        _id("main_menu").style.display = enabled ? "flex" : "none";
        //GAMEFACE-ISSUE1 _id("main_menu").style.opacity = enabled ? 1 : 0;


        //Prevent drop down menus to appear in the game when switching while open.
        //A worse way of doing this is changing the visibility of .ui-selectmenu-menu

        //if (!enabled) {
        //    $("select").selectmenu("close");
        //}

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
        show_sticky_dialog(localize(msg_key));
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
            if (value == 10) {
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
/*
    bind_event('show_skill_selection', function (visible) {
        if (visible) {
            anim_show(_id("skill_selection"));
        } else {
            anim_hide(_id("skill_selection"));
            //$("#score").hide();
        }
        window.draft_visible = visible;
    });

    bind_event('set_skill_selection_round', function (value) {
        $("#skill_selection_round").html(parseInt(value) + 1);
        if (value == 0) {
            //$("#skill_container_0").droppable("option", "disabled", false);
            //$("#skill_container_0").html("Drag an ability here");
            //$("#skill_container_0").removeClass("skill_slot_locked");
            //$("#skill_container_0").addClass("skill_slot_open");
            //$("#skill_container_1").droppable("option", "disabled", true);
            //$("#skill_container_1").html("");
            //$("#skill_container_1").addClass("skill_slot_locked");
            //$("#skill_container_1").removeClass("skill_slot_open");

            $("#skill_container_0").addClass("skill_slot_open");
            $("#skill_container_1").addClass("skill_slot_open");

            $("#accept_skills_button").html("Warmup until next round");
        } else if (value == 1) {
            //$("#skill_container_0").droppable("option", "disabled", true);
            //$("#skill_container_0").html("");
            //$("#skill_container_0").addClass("skill_slot_locked");
            //$("#skill_container_0").removeClass("skill_slot_open");
            //$("#skill_container_1").droppable("option", "disabled", false);
            //$("#skill_container_1").html("Drag an ability here");
            //$("#skill_container_1").removeClass("skill_slot_locked");
            //$("#skill_container_1").addClass("skill_slot_open");

            if ($("#skill_container_0").data("skill") == -1) {
                $("#skill_container_0").addClass("skill_slot_open");
            }
            if ($("#skill_container_1").data("skill") == -1) {
                $("#skill_container_1").addClass("skill_slot_open");
            }
            $("#accept_skills_button").html("Lock in");
        }
        $("#accept_skills_button").addClass("button_disabled");
    });

    bind_event('set_skill_selection_round_time_remaining', function (value) {
        $("#skill_selection_time").html(value);
    });
*/
    bind_event('set_checkbox', function (variable, value) {

        // Quickplay / Matchmaking screen checkboxes are handled a little different
        if (variable.startsWith("lobby_search")) {
            play_screen_update_cb(variable,value);
            return;
        }

        if (variable == "lobby_region_search_nearby") {
            send_string(CLIENT_COMMAND_SET_PARTY_EXPAND_SEARCH, ""+value);
        }

        if (variable == "input_mouse_filtering") {
            if (value == 1) {
                _id("mouse_filter_sad").style.display = "flex";
            } else {
                _id("mouse_filter_sad").style.display = "none";
            }
        }

        //engine.call("echo","JS: set_checkbox " + variable + "=" + value);
        _for_each_in_class("checkbox_component", function(element) {
            if (element.dataset.variable == variable) {
                element.dataset.enabled = value ? "true": "false";
                update_checkbox(element);
            }
        });

        // Call the response handler for any queued callbacks
        global_variable.handleResponse("checkbox", variable, value);
    });

    bind_event('add_video_mode', function (video_mode, video_mode_caption, selected) {
        let option = _createElement("div", "", video_mode_caption);
        option.dataset.value = video_mode;
        if (selected) option.dataset.selected = 1;

        _id("video_modes").appendChild(option);

        ui_setup_select(_id("video_modes"));
    });

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

    bind_event('add_customization_weapon', function (weapon_name, selected) {
        // No idea what this was for, it was empty
        //console.log("add_customization_weapon ... ?", weapon_name, selected);
    });

    bind_event('set_select', function (variable, value) {
        if (variable.startsWith("game_decals")) {
            send_string(CLIENT_COMMAND_SET_CUSTOMIZATION, global_customization_type_id_map["sticker"]+"::"+value);
            return;
        }

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

        if (variable.startsWith("hud_crosshair_mask_aperture") || variable.startsWith("hud_zoom_crosshair_mask_aperture")) {
            on_updated_mask_type_selection();
        }

        if (variable == "lobby_custom_mode") {
            if (!value.length) {
                engine.call("set_string_variable", "lobby_custom_mode", global_lobby_init_mode);
                value = global_lobby_init_mode;
            }
        }

        if (variable == "lobby_region") {
            set_region_selection(true, value);
        }

        if (variable == "lobby_custom_datacenter") {
            value = set_lobby_datacenter(value);
        }

        /********************
         * MAIN SELECT FIELDS
         */
        _for_each_in_class("select-field", function(el) {
            if (el.dataset.variable == variable) {
                el.dataset.value = value;
                update_select(el);
            }
        });

        // Call the response handler for any queued callbacks
        global_variable.handleResponse("select", variable, value);

        if (variable.startsWith("mouse_accel_type")) {
            update_accel_options(_id("setting_mouse_accel_type"));
        }
    });

    bind_event('set_color', function (variable, value) {
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

    _for_each_in_class("color-picker-new", function(el) {
        var current_variable = el.dataset.variable;
        if (current_variable && current_variable.length) {
            engine.call("initialize_color_value", current_variable);
        }
    });
    
    bind_event('set_range', function (variable, value) {
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
    
    _for_each_with_class_in_parent(_id("lobby_container"), "crosshair-option", function(el) {
        el.addEventListener("click", function() {
            el.parentElement.dataset.value = el.dataset.cross;

            _for_each_with_class_in_parent(el.parentElement, "selected", function(sel) {
                sel.classList.remove("selected");
            })
            el.classList.add("selected");

            engine.call("set_string_variable", el.parentElement.dataset.variable, el.parentElement.dataset.value);
        });
    });


    bind_event("set_restart_required", function (restart_required) {
        if (restart_required) {
            anim_show(_id("settings_message_container"), 50);
        } else {
            anim_hide(_id("settings_message_container"), 50);
        }
    });

    bind_event("reveal_ui", function () {
        console.log("reveal_ui");
        anim_show(document.body, 350);
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

        updateMenuBottomBattlepass();

        // Temporary solution to get list all the stickers available, see customize_screen.js -> set_asset_browser_content
        engine.call("request_character_browser_update", "decals");

        post_load_setup_hud_editor();

        engine.call("update_friends_list");
        
        set_logged_out_screen(false);

        engine.call("post_load_finished");
        console.log("POSLOAD100");

        //on_masterserver_auth_success();
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

    bind_event('on_masterserver_auth_success', function() {
        global_masterserver_connected = true;
        on_masterserver_auth_success();
    });

    console.log("LOAD202");

    // Initialize character sticker decals variable
    engine.call("initialize_select_value", "game_decals");

    init_custom_modes();

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

    init_screen_ingame_menu();
    init_screen_home();
    init_screen_coin_shop();
    init_screen_customize();
    init_screen_battlepass_list();
    init_screen_battlepass();
    init_screen_create();
    init_screen_leaderboards();
    init_screen_play_customlist();
    init_screen_play();
    init_screen_practice();
    init_screen_custom();

    console.log("LOAD209");

    // load shared code between menu and hud views
    init_shared();

    initialize_scrollbars();
    
    setupMenuSoundListeners();
    setupVariousListeners();

    console.log("LOAD210");
    engine.call('menu_view_loaded');
    global_menu_view_loaded = true;
});

function on_masterserver_auth_success() {
    if (global_menu_view_loaded == false) {
        setTimeout(function() {
            on_masterserver_auth_success();
        },100);
        return;
    }

    console.log("POSTMSAUTH000");

    // Request initial invite and party infos
    send_string(CLIENT_COMMAND_GET_INVITE_LIST);
    send_string(CLIENT_COMMAND_PARTY, "party-status");
    send_string(CLIENT_COMMAND_GET_RANKED_MMRS);

    // Request API token:
    send_string(CLIENT_COMMAND_GET_API_TOKEN, "", "apitoken", function(token) {
        global_stats_api.updateToken(token);

        // Request the users customization item list
        load_user_customizations();

        // Get the list of saved huds
        load_user_hud_list();
    });

    // Request competitive season info
    send_string(CLIENT_COMMAND_GET_COMP_SEASON, "", "competitive-season", function(data) {
        global_competitive_season = data.data;
    });

    // Request Battlepass data:
    send_string(CLIENT_COMMAND_GET_BATTLEPASS_DATA, "", "battlepass-data", function(data) {
        global_user_battlepass = data.data;
    });

    // Request personal data
    send_string(CLIENT_COMMAND_GET_PERSONAL_DATA, "", "get-personal-data", function(data) {
        global_self.private = data.data;
    });

    console.log("POSTMSAUTH100");
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

function open_modal_screen(id) {
    engine.call("set_modal", true);
    anim_show(_id(id),100);
}

function close_modal_screen(e, selector) {
    let el = undefined;
    if (selector !== undefined) {
        el = _id(selector);
    } else {
        el = e.currentTarget;
        e.stopPropagation();
    }

    let style = window.getComputedStyle(el);
    if (style.getPropertyValue('display') == "none") return;


    anim_hide(el,100);

    // Close any open select lists
    _click_outside_handler();

    engine.call("set_modal", false);

    // Update the Matchlist if we are currently looking at it
    if (el.id == "region_select_modal_screen" && global_menu_page == "play_panel" && global_play_menu_page == "play_screen_customlist") {
        renderMatchList();
    }

}

function close_modal_screen_by_selector(id) {
    close_modal_screen(null, id);
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
    _for_each_in_class("crosshair_preview_container", function(el) { crosshair_containers.push(el); });
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
    close_modal_screen_by_selector('customlist_filter_modal_screen');
    close_modal_screen_by_selector('advanced_mouse_settings_screen');
    close_modal_screen_by_selector('field_of_view_conversion_screen');
    close_modal_screen_by_selector('crosshair_editor_screen');
    close_modal_screen_by_selector('zoom_crosshair_editor_screen');
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
    menu_bottom_challenges.addEventListener("click", function() {
        engine.call("ui_sound", "ui_click1");
        open_battlepass();
    });

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

function openBasicModal(content) {
    let modal = _id("basic_modal");

    _for_first_with_class_in_parent(modal, "generic_modal_dialog_container", function(el) {
        if (content.nodeType == undefined) {
            // Text
            el.textContent = content;
        } else if (content.nodeType == 1 || content.nodeType == 11) {
            // Element Node
            _empty(el);
            el.appendChild(content);
        }
    });
    open_modal_screen("basic_modal");
}

function closeBasicModal() {
    close_modal_screen_by_selector('basic_modal');   
}