
let global_custom_list_selected_match = -1;
let global_custom_list_data = [];
let global_custom_list_data_ts = undefined;
let global_custom_list_search = '';

function init_screen_play_customlist() {

    global_input_debouncers['customlist_filter_input'] = new InputDebouncer(function(){ onCustomListFilter(); });
    
    function onCustomListFilter() {
        global_custom_list_search = _id("customlist_filter_input").value.trim();
        renderMatchList();
    }

    _id("customlist_play_refresh_button").addEventListener("click", function() {
        updateCustomMatchList();
    });

    _id("custom_list_join_button").addEventListener("click", function(e) {
        let btn = e.currentTarget;
        if (btn.classList.contains("disabled")) return;
        if (global_custom_list_selected_match == -1) return;
        
        let require_pw = false;
        if (global_custom_list_data && global_custom_list_data.length) {
            for (let match of global_custom_list_data) {
                if (match.session_id == global_custom_list_selected_match) {
                    if ("password" in match && match.password) require_pw = true;
                }
            }
        }

        if (require_pw) {
            let cont = _createElement("div","custom_password_prompt");
            let input = _createElement("input","custom_password_prompt_input");
            input.setAttribute('type','password');
            cont.appendChild(input);
            input.focus();

            input.addEventListener("keydown", function(e) {
                if (e.keyCode == 13) { //return
                    e.preventDefault();

                    joinSession(global_custom_list_selected_match, input.value);

                    // close modal
                    close_modal_screen_by_selector('generic_modal');
                }
            });

            genericModal(localize("custom_game_settings_password"), cont, localize("menu_button_cancel"), null, localize("menu_button_join"), function() {
                joinSession(global_custom_list_selected_match, input.value);
            });
        } else {
            joinSession(global_custom_list_selected_match, null);
        }
    });

    function joinSession(session_id, password) {
        if (!bool_am_i_leader) return;
        if (!session_id || session_id == -1) return;
        
        send_string(CLIENT_COMMAND_PARTY_JOIN_SESSION, session_id+" "+password);
    }

    // Add gamemodes checkboxes to filter list
    let mode_filters = _id("customlist_filter_modal_mode_filters");
    let modes = Object.keys(global_game_mode_map);
    let fragment = new DocumentFragment();
    for (let mode of modes) {
        if (!global_game_mode_map[mode].enabled) continue;
        
        let filter = _createElement("div", "filter");

        let cb = _createElement("div", "small_checkbox");
        cb.dataset.filter = "mode";
        cb.dataset.value = mode;
        let cb_inner = _createElement("div");
        cb.appendChild(cb_inner);
        filter.appendChild(cb);

        let name = _createElement("div", ["name", "i18n"]);
        name.dataset.i18n = global_game_mode_map[mode].i18n;
        name.innerHTML = global_game_mode_map[mode].name;
        filter.appendChild(name);

        fragment.appendChild(filter);
    }
    mode_filters.appendChild(fragment);
}

function lobby_join_with_key() {
    let cont = _createElement("div","custom_password_prompt");
    let input = _createElement("input","custom_password_prompt_input");
    input.setAttribute("type", "password");
    cont.appendChild(input);
    input.focus();

    input.addEventListener("keydown", function(e) {
        if (e.keyCode == 13) { //return
            e.preventDefault();

            join_game(input.value.trim());

            // close modal
            close_modal_screen_by_selector('generic_modal');
        }
    });

    genericModal(localize("customlist_join_with_key"), cont, localize("menu_button_cancel"), null, localize("menu_button_join"), function() {
        join_game(input.value);
    });

    function join_game(key) {
        if (!bool_am_i_leader) return;
        if (key.trim().length == 0) return;
        
        send_string(CLIENT_COMMAND_PARTY_JOIN_LOBBY_KEY, key);
    }
}

function updateCustomMatchList() {
    if (!global_custom_list_data_ts || (Date.now() - global_custom_list_data_ts) > 3000) {
        send_string(CLIENT_COMMAND_GET_CUSTOM_MATCH_LIST, "", "get-custom-list", function(data) {
            global_custom_list_data_ts = Date.now();
            global_custom_list_data = data.data.matches;
            renderMatchList();
        });
    } else {
        renderMatchList();
    }
}

function renderMatchList() {
    let list = _id("customlist_table_content");
    _empty(list);

    // Sort by ping and client_count asc
    global_custom_list_data.sort(function(a, b) {
        if (global_server_locations[a.location].ping < global_server_locations[b.location].ping) return -1;
        if (a.location == b.location) {
            if (a.client_count > b.client_count)
                return -1;
            else 
                return 0;
        }
        return 1;
    });

    let fragment = new DocumentFragment();
    let count_visible = 0;
    for (let match of global_custom_list_data) {
        if (global_server_selected_locations.indexOf(match.location) == -1) continue;
        if (global_custom_list_search.trim().length) {
            if (!match.name.toLowerCase().includes(global_custom_list_search.trim().toLowerCase())) continue;
        }

        count_visible++;

        let row = _createElement("div", "row");
        row.dataset.sessionId = match.session_id;
        if (global_custom_list_selected_match == match.session_id) row.classList.add("selected");

        let tr_pass = _createElement("div", ["tr", "tr_password"]);
        if ("password" in match && match.password) {
            let lock = _createElement("div", "icon_lock");
            tr_pass.appendChild(lock);
        }
        row.appendChild(tr_pass);

        let tr_title = _createElement("div", ["tr", "tr_title"]);
        tr_title.innerHTML = match.name;
        row.appendChild(tr_title);
        
        let tr_region = _createElement("div", ["tr", "tr_region"]);
        if (match.location in global_region_map) {
            let flag = _createElement("img");
            if (GLOBAL_AVAILABLE_COUNTRY_FLAGS.includes(global_region_map[match.location].flag)) {
                flag.src = _flagUrl(global_region_map[match.location].flag);
            }
            let dc = _createElement("span");
            dc.innerHTML = localize("datacenter_"+match.location.toLowerCase());

            tr_region.appendChild(flag);
            tr_region.appendChild(dc);
        }
        row.appendChild(tr_region);

        let tr_mode = _createElement("div", ["tr", "tr_mode"]);
        tr_mode.innerHTML = localize(global_game_mode_map[match.mode].i18n);
        row.appendChild(tr_mode);
            
        // TODO... add hover box info for the match settings
        let tr_settings = _createElement("div", ["tr", "tr_settings"]);        
        let settings_icon = _createElement("div", "settings_icon");
        tr_settings.appendChild(settings_icon);
        tr_settings.dataset.sessionId = match.session_id;
        tr_settings.dataset.msgHtmlId = "custom_match_info";
        add_tooltip2_listeners(tr_settings);
        row.appendChild(tr_settings);

        let tr_map = _createElement("div", ["tr", "tr_map"]);
        tr_map.innerHTML = _format_map_name(match.map);
        row.appendChild(tr_map);

        let tr_players = _createElement("div", ["tr", "tr_players"]);
        tr_players.innerHTML = match.client_count+"/"+match.max_clients;
        row.appendChild(tr_players);

        let tr_status = _createElement("div", ["tr", "tr_status"]);
        if (match.state == 0 || match.state == 1) {
            let state = _createElement("span", "warmup");
            state.innerHTML = localize("game_state_warmup");
            tr_status.appendChild(state);
        } else if (match.state == 2 || match.state == 3 || match.state == 4) {
            let state = _createElement("span", "live");
            state.innerHTML = localize("game_state_live");
            tr_status.appendChild(state);
        }
        row.appendChild(tr_status);

        let ping_ms = global_server_locations[match.location].ping;
        let ping_str = '';
        if (ping_ms == -1) {
            ping_str = 'N/A';
        } else {
            ping_ms = Math.floor(Number(ping_ms) * 1000);
            ping_str = ping_ms+"ms";
        }

        let tr_latency = _createElement("div", ["tr", "tr_latency"]);
        let ping_icon = _createElement("div", "ping_icon");
        if (ping_ms < 40)  ping_icon.classList.add("good");
        if (ping_ms > 120) ping_icon.classList.add("bad");
        tr_latency.appendChild(ping_icon);
        let ping = _createElement("div", "ping");
        ping.textContent = ping_str;
        tr_latency.appendChild(ping);
        row.appendChild(tr_latency);

        fragment.appendChild(row);

        // Event Listeners
        row.addEventListener("click", function() {
            engine.call('ui_sound', 'ui_click1');

            if (row.classList.contains("selected")) {
                row.classList.remove("selected");
                customListSelectServer(-1);
            } else {
                let prev = list.querySelector(".row.selected");
                if (prev) prev.classList.remove("selected");
                row.classList.add("selected");
                customListSelectServer(row.dataset.sessionId);
            }
        });
    }

    if (count_visible == 0) {
        let no_matches = _createElement("div", "no_matches");
        no_matches.innerHTML = localize("message_no_custom_matches_found");
        fragment.appendChild(no_matches);
    }

    list.appendChild(fragment);

    let outer_table = _id("customlist_table");

    // Hack so the window is only as big as the content, unless its too big and needs a scrollbar
    //  without this hack the window would always be max-height because the content pushes it to 100% height, think its a GameFace oddity
    let inner_px_height = (global_custom_list_data.length * (3 * (window.outerHeight / 100) + 4));
    let max_px_height = 48 * (window.outerHeight / 100);

    if (inner_px_height <= max_px_height) {
        outer_table.style.maxHeight = "auto";
    } else {
        outer_table.style.maxHeight = "48vh";
    }

    refreshScrollbar(outer_table);
    resetScrollbar(outer_table);
}

function customListSelectServer(session_id) {
    global_custom_list_selected_match = session_id;
    
    let btn = _id("custom_list_join_button");
    if (global_custom_list_selected_match == -1) {
        _html(btn, localize("menu_select_match"));
        btn.classList.add("disabled");
    } else {
        _html(btn, localize("menu_join_game"));
        btn.classList.remove("disabled");
    }
}