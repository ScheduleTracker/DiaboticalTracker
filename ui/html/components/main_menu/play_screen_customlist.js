
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
    global_custom_list_selected_match = -1;
    customListRenderMatchPreview(-1);

    if (!global_custom_list_data_ts || (Date.now() - global_custom_list_data_ts) > 3000) {
        send_string(CLIENT_COMMAND_GET_CUSTOM_MATCH_LIST, "", "get-custom-list", function(data) {
            global_custom_list_data_ts = Date.now();
            global_custom_list_data = data.data;
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

        // Render the row content into the row
        renderMatchListRow(match, row);

        fragment.appendChild(row);

        // Event Listeners
        row.addEventListener("click", function() {
            engine.call('ui_sound', 'ui_click1');

            if (row.classList.contains("selected")) {
                row.classList.remove("selected");

                customListRenderMatchPreview(-1);
                global_custom_list_selected_match = -1;
            } else {
                let prev = list.querySelector(".row.selected");
                if (prev) prev.classList.remove("selected");
                row.classList.add("selected");

                customListRenderMatchPreview(match.session_id);
                global_custom_list_selected_match = match.session_id;

                send_string(CLIENT_COMMAND_GET_MATCH_INFO, match.session_id);
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

    refreshScrollbar(outer_table);
    resetScrollbar(outer_table);
}

function renderMatchListRow(match, row) {
    let map = _createElement("div", "match_map");
    let map_gradient = _createElement("div", "map_gradient");
    map_gradient.style.backgroundImage = 'url(map_thumbnails/'+match.map+'.png)';
    map.appendChild(map_gradient);
    map.appendChild(_createElement("div", "mode_name", localize(global_game_mode_map[match.mode].i18n)));
    map.appendChild(_createElement("div", "map_name", _format_map_name(match.map)));
    row.appendChild(map);


    let row_block = _createElement("div", "row_block");
    row.appendChild(row_block);
    let sub_row_1 = _createElement("div", "sub_row");
    row_block.appendChild(sub_row_1);
    let sub_row_2 = _createElement("div", "sub_row");
    row_block.appendChild(sub_row_2);

    if ("password" in match && match.password) {
        let tr_pass = _createElement("div", "password");
        let lock = _createElement("div", "icon_lock");
        tr_pass.appendChild(lock);
        sub_row_1.appendChild(tr_pass);
    }

    let tr_title = _createElement("div", "title", match.name);
    if (match.match_type == MATCH_TYPE_QUICKPLAY) {
        tr_title.classList.add("bold");
        tr_title.textContent = localize("match_type_quickplay");
    }
    sub_row_1.appendChild(tr_title);
    
    let tr_region = _createElement("div", "region");
    if (match.location in global_region_map) {
        let flag = _createElement("img");
        if (GLOBAL_AVAILABLE_COUNTRY_FLAGS.includes(global_region_map[match.location].flag)) {
            flag.src = _flagUrl(global_region_map[match.location].flag);
        }
        let dc = _createElement("span", "", localize("datacenter_"+match.location.toLowerCase()));

        tr_region.appendChild(flag);
        tr_region.appendChild(dc);
    }
    sub_row_2.appendChild(tr_region);

    let tr_players = _createElement("div", "players");
    tr_players.innerHTML = match.client_count+"/"+(match.team_count * match.team_size);
    row.appendChild(tr_players);

    let ping_ms = global_server_locations[match.location].ping;
    let ping_str = '';
    if (ping_ms == -1) {
        ping_str = 'N/A';
    } else {
        ping_ms = Math.floor(Number(ping_ms) * 1000);
        ping_str = ping_ms+"ms";
    }

    let tr_latency = _createElement("div", "latency");
    let ping_icon = _createElement("div", "ping_icon");
    if (ping_ms < 40)  ping_icon.classList.add("good");
    if (ping_ms > 120) ping_icon.classList.add("bad");
    tr_latency.appendChild(ping_icon);
    let ping = _createElement("div", "ping");
    ping.textContent = ping_str;
    tr_latency.appendChild(ping);
    row.appendChild(tr_latency);
}

function customListRenderMatchPreview(session_id) {
    let preview_cont = _id("customlist_match_preview");
    let preview_placeholder = _id("customlist_match_placeholder");

    _empty(preview_cont);

    if (session_id == -1) {
        preview_cont.style.display = "none";
        preview_placeholder.style.display = "flex";

        return;
    }

    let m = null;
    if (global_custom_list_data && global_custom_list_data.length) {
        for (let match of global_custom_list_data) {
            if (match.session_id == session_id) {
                m = match;
                break;
            }
        }
    }

    if (m === null) {
        customListRenderMatchPreview(-1);
        return;
    }

    let settings_default = true;
    if (m.modifier_instagib == true) settings_default = false;
    if (m.mode !== 'race' && m.modifier_physics != 0) settings_default = false;
    if (m.commands.length > 0) settings_default = false;

    // Map image
    let preview_map = _createElement("div", "map");
    preview_map.style.backgroundImage = 'url(map_thumbnails/'+m.map+'.png)';
    preview_map.appendChild(_createElement("div", "mode_name", localize(global_game_mode_map[m.mode].i18n)));
    preview_map.appendChild(_createElement("div", "map_name", _format_map_name(m.map)));
    preview_cont.appendChild(preview_map);

    // Match summary 
    let name = m.name;
    let qp = false;
    if (m.match_type == MATCH_TYPE_QUICKPLAY) {
        name = localize("match_type_quickplay");
        qp = true;
    }
    let preview_summary = _createElement("div", "summary");
    preview_cont.appendChild(preview_summary);
    let name_div = _createElement("div", "name", name);
    if (qp) name_div.classList.add("bold");
    preview_summary.appendChild(name_div);
    let state = _createElement("div", "state");
    state.appendChild(_createElement("div", "state_label", localize("game_state")+":"));
    if (m.state == 0 || m.state == 1) {
        state.appendChild(_createElement("span", ["state_val", "warmup"], localize("game_state_warmup")));
    } else if (m.state == 2 || m.state == 3 || m.state == 4) {
        state.appendChild(_createElement("span", ["state_val", "live"], localize("game_state_live")));
    }
    preview_summary.appendChild(state);
    if (m.password) {
        let pw = _createElement("div", "password");
        pw.appendChild(_createElement("div", "password_text", localize("game_password_required")));
        pw.appendChild(_createElement("div", "password_icon"));
        preview_summary.appendChild(pw);
    }
    
    // Join button
    if (bool_am_i_leader) {
        let preview_join = _createElement("div", ["db-btn", "join"], localize("menu_join_game"));
        preview_cont.appendChild(preview_join);

        preview_join.addEventListener("click", function(e) {        
            let require_pw = false;
            if ("password" in m && m.password) require_pw = true;
    
            if (require_pw) {
                let cont = _createElement("div","custom_password_prompt");
                let input = _createElement("input","custom_password_prompt_input");
                input.setAttribute('type','password');
                cont.appendChild(input);
                input.focus();
    
                input.addEventListener("keydown", function(e) {
                    if (e.keyCode == 13) { //return
                        e.preventDefault();
    
                        customlist_joinSession(m.session_id, input.value);
    
                        // close modal
                        close_modal_screen_by_selector('generic_modal');
                    }
                });
    
                genericModal(localize("custom_game_settings_password"), cont, localize("menu_button_cancel"), null, localize("menu_button_join"), function() {
                    customlist_joinSession(m.session_id, input.value);
                });
            } else {
                customlist_joinSession(m.session_id, null);
            }
        });
    }

    // Match players
    if (m.clients) {
        let preview_players = _createElement("div", "playerlist");
        preview_cont.appendChild(preview_players);
        preview_players.appendChild(_createElement("div", "title", localize("customlist_table_head_players")));
        let list = _createElement("div", "list");
        preview_players.appendChild(list);
        for (let c of m.clients) {
            list.appendChild(_createElement("div", "player", c[0]));
        }
    }

    // Match settings
    let preview_settings = _createElement("div", "settings");
    preview_cont.appendChild(preview_settings);

    if (!settings_default) {
        preview_settings.appendChild(_createElement("div", "settings_warning", localize("custom_game_settings_customized")));
    }

    let stats = ["location", "timelimit", "scorelimit", "teamcount", "teamsize", "maxcount"];
    if (m.modifier_instagib != 0) stats.push("instagib");
    if (m.modifier_physics != 0) stats.push("physics");
    if (m.commands.length) stats.push("commands");

    for (let stat of stats) {
        let row = _createElement("div", "stat_row");

        let label_txt = '';
        if (stat == "location")   label_txt = localize("custom_game_settings_datacenter");
        if (stat == "timelimit")  label_txt = localize("custom_game_settings_duration");
        if (stat == "scorelimit") label_txt = localize("custom_game_settings_score_limit");
        if (stat == "teamcount")  label_txt = localize("custom_game_settings_teams");
        if (stat == "teamsize")   label_txt = localize("custom_game_settings_team_size");
        if (stat == "maxcount")   label_txt = localize("custom_settings_max_clients");
        if (stat == "instagib")   label_txt = localize("custom_settings_instagib");
        if (stat == "physics")    label_txt = localize("custom_settings_physics");
        if (stat == "commands")   label_txt = localize("custom_settings_commands");

        let value_txt = '';
        if (stat == "location")   value_txt = localize("datacenter_"+m.location.toLowerCase());
        if (stat == "timelimit")  value_txt = (m.time_limit == 0) ? localize("time_unlimited") : _seconds_to_digital(m.time_limit);
        if (stat == "scorelimit") value_txt = (m.score_limit == 0) ? localize("score_unlimited") : m.score_limit;
        if (stat == "teamcount")  value_txt = m.team_count;
        if (stat == "teamsize")   value_txt = m.team_size;
        if (stat == "maxcount")   value_txt = m.max_clients;
        if (stat == "instagib")   value_txt = (m.modifier_instagib) ? localize("enabled") : localize("disabled");
        if (stat == "physics")    value_txt = (m.modifier_physics in global_physics_map) ? localize(global_physics_map[m.modifier_physics].i18n) : localize("unknown");
        
        let label = _createElement("div", "label", label_txt);
        let value = _createElement("div", "value", value_txt);

        if (stat == "commands") {
            for (let c of m.commands) value.appendChild(_createElement("div", "", c.key+": "+c.value));
        }

        row.appendChild(label);
        row.appendChild(value);
        preview_settings.appendChild(row);
    }

    preview_placeholder.style.display = "none";
    preview_cont.style.display = "block";
}

function customlist_joinSession(session_id, password) {
    if (!bool_am_i_leader) return;
    if (!session_id || session_id == -1) return;
    
    send_string(CLIENT_COMMAND_PARTY_JOIN_SESSION, session_id+" "+password);
}

function customlist_update_session_data(session_id, data) {
    for (let i=0; i<global_custom_list_data.length; i++) {
        if (global_custom_list_data[i].session_id == session_id) {
            global_custom_list_data[i] = data;
            break;
        }
    }

    let match_row = _id("customlist_table_content").querySelector('.row[data-session-id="'+session_id+'"]');
    if (match_row) {
        _empty(match_row);
        renderMatchListRow(data, match_row);
    }

    if (global_custom_list_selected_match == session_id) {
        customListRenderMatchPreview(session_id)
    }
}