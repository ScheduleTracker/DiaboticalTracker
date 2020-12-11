// global vars
let global_queue_mode_checkboxes = [];
let global_instant_join_buttons = [];
let global_active_queues = [];
let global_queue_selection = null;
let global_queue_elements = [];

let global_pickup_list_data = [];
let global_custom_list_data = [];
let global_custom_list_data_ts = undefined;

function init_queues() {
    global_queue_mode_checkboxes = [];
    global_instant_join_buttons = [];

    render_instant_quick_play();
    render_ranked_card();

    engine.call("initialize_select_value", "lobby_search");
    update_queue_modes_availability();
    update_queue_ranks();
}

function play_screen_reload_lists() {
    update_play_combined_list(true);

    _id("play_screen_refresh_btn").classList.add("disabled");

    setTimeout(function() {
        _id("play_screen_refresh_btn").classList.remove("disabled");
    }, 1500);
}

function render_instant_quick_play() {
    let container = _id("quickplay_card");
    _empty(container);

    let card = {
        "type": "quickplay",
        "title": "match_type_quickplay",
        "background": "brawl",
        "state": 2,
        "narrow": true,
        "instant": []
    };

    for (let mode_key in global_mode_definitions) {
        if (global_mode_definitions[mode_key].instant) {
            card.instant.push(mode_key);
        }
    }
    card.instant.push("warmup");
    card.instant.push("party_warmup");

    container.appendChild(renderPlayCard(card));
}

function render_ranked_card() {
    let container = _id("ranked_card");
    _empty(container);

    let card = {
        "type": "ranked",
        "title": "match_type_ranked",
        "background": "arcade",
        "state": 2,
        "queues": []
    };

    for (let q of global_active_queues) {
        card.queues.push(q.mode_key);
    }

    container.appendChild(renderPlayCard(card));

    update_queue_mode_selection();
}

let global_updating_match_list = false;
let global_last_match_list_update_ts = null;
let global_match_list_auto_refresh_time = 30; // Refresh the match and pickup lists every 30s 
// param "manual" says whether the function was called automatically or manually by the user
function update_play_combined_list(manual, timestamp) {
    // Only update if we are currently on the play screen
    if (global_menu_page != "play_screen_combined" && global_menu_page != "play_screen_customlist") return;

    // Don't request anything if we arent event connected
    if (!global_ms_connected) return;

    // Check if we are already waiting for an update
    if (global_updating_match_list) return;

    // Don't do anything if the view isnt active
    if (!global_view_active) return;

    let refresh = false;
    if (!manual) {
        let seconds_until_refresh = global_match_list_auto_refresh_time
        // Check when the last update happened, auto refresh every 30 seconds
        if (global_last_match_list_update_ts == null || ((timestamp - global_last_match_list_update_ts) / 1000) > global_match_list_auto_refresh_time) {
            refresh = true;            
        } else {
            seconds_until_refresh = global_match_list_auto_refresh_time - Math.round((timestamp - global_last_match_list_update_ts) / 1000);
        }        
        if (seconds_until_refresh < 0) seconds_until_refresh = 0;
        _id("play_screen_refresh_info").textContent = localize_ext("refresh_lists_in", { "seconds": seconds_until_refresh});
    } else {
        refresh = true;
    }

    if (refresh) {
        global_updating_match_list = true;
        global_last_match_list_update_ts = timestamp;

        send_string(CLIENT_COMMAND_GET_COMBINED_LIST);
    }
}

/*
function update_queue_countdown() {
    //console.log("update_queue_countdown");
    if (!global_view_active) return;

    let first_end_ts = null;
    for (let q of global_active_queues) {
        if (first_end_ts == null) {
            first_end_ts = new Date(q.end_ts);
        } else {
            let date = new Date(q.end_ts);
            if (date.getTime() < first_end_ts.getTime()) first_end_ts = date;
        }
    }

    if (first_end_ts != null) {
        _id("queues_section_desc").textContent = localize_ext("next_queue_update_in", {"time_until": _time_until((first_end_ts.getTime() - Date.now()) / 1000)});
    } else {
        console.log("first_end_ts is null...");
    }
}
*/
/*
function render_queues() {

    //console.log("======== RENDER QUEUES");
    //console.log(_dump(global_active_queues));
    //console.log(_dump(global_queues));

    let cont = _id("queues_container");
    _empty(cont);

    global_queue_elements.length = 0;
    for (let q of global_active_queues) {
        if (!(q.mode_key in global_queues)) continue;
        let qdata = global_queues[q.mode_key];

        let queue = _createElement("div", "queue");
        queue.dataset.mode_key = q.mode_key;
        global_queue_elements.push(queue);

        let background_cont = _createElement("div", "background_cont");
        let background = _createElement("div", "background");
        background_cont.appendChild(background);
        queue.appendChild(background_cont);

        if (global_game_mode_map.hasOwnProperty(qdata.mode_name)) {
            background.style.backgroundImage = "url(/html/images/gamemode_cards/"+global_game_mode_map[qdata.mode_name].image+")";
        }

        queue.appendChild(_createElement("div", "gradient"));

        queue.appendChild(_createElement("div", "name", qdata.queue_name));

        let format = _createElement("div", "format");
        format.appendChild(_createElement("div", "icon"));
        format.appendChild(_createElement("div", "vs", qdata.vs));
        queue.appendChild(format);

        // Skill tier icon
        let mmr_key = null;
        let team_size = 1;
        if (global_mode_definitions.hasOwnProperty(q.mode_key)) {
            mmr_key = global_mode_definitions[q.mode_key].mmr_key;
            team_size = global_mode_definitions[q.mode_key].team_size;
        }

        let rank_cont = _createElement("div", "rank_cont");
        queue.appendChild(rank_cont);
        if (global_self.mmr.hasOwnProperty(mmr_key) && global_self.mmr[mmr_key].rank_tier != null) {
            rank_cont.appendChild(renderRankIcon(global_self.mmr[mmr_key].rank_tier, global_self.mmr[mmr_key].rank_position, team_size, "big"));
        }
        
        let checkbox_box = _createElement("div", "checkbox_box");
        queue.appendChild(checkbox_box);

        if (qdata.locked) {
            let checkbox_locked = _createElement("div", "checkbox_locked");
            checkbox_box.appendChild(checkbox_locked);
        } else {
            let checkbox_times = _createElement("div", ["checkbox_times"]);
            checkbox_box.appendChild(checkbox_times);

            let checkbox_mark = _createElement("div", "checkbox_mark");
            checkbox_box.appendChild(checkbox_mark);
        }

        checkbox_box.dataset.mode = q.mode_key;
        checkbox_box.dataset.locked = qdata.locked

        global_queue_mode_checkboxes.push(checkbox_box);

        queue.addEventListener("mouseenter", function(e) {  
            background.classList.add("hover");
            play_screen_hover_info(e, "queue", queue, qdata);
            _play_mouseover4();
        });
        queue.addEventListener("mouseleave", function(e) {
            background.classList.remove("hover");
            cleanup_hover_info_box(true);
        });

        queue.addEventListener("click", function(ev) {
            ev.stopPropagation();
            if (checkbox_box.classList.contains("disabled")) return;
            if (checkbox_box.classList.contains("party_disabled")) return;
            if (!bool_am_i_leader) return;
            if (global_mm_searching) return;
            
            let value = false;
            let data_value = checkbox_box.dataset.enabled;
            if (data_value && (data_value === "true" || data_value === true)) value = true;
            value = !value;

            (value) ? _play_cb_check() : _play_cb_uncheck();

            set_queue_enabled(q.mode_key, value);
        });


        cont.appendChild(queue);
    }

    update_queue_countdown();
}
*/
function update_queue_ranks() {
    if (Object.keys(global_self.mmr).length == 0) return;

    let top_rank_tier = -1;
    let top_rank_position = 999999;
    for (let q of global_queue_mode_checkboxes) {
        let rank_cont = q.querySelector(".checkbox_rank");
        if (!rank_cont) continue;

        _empty(rank_cont);

        if (!(q.dataset.mode_key in global_mode_definitions)) continue;

        let mmr_key = global_mode_definitions[q.dataset.mode_key].mmr_key;
        if (!global_self.mmr.hasOwnProperty(mmr_key)) continue;
        if (global_self.mmr[mmr_key].rank_tier == null) continue;

        if (global_self.mmr[mmr_key].rank_tier >= top_rank_tier) {
            top_rank_tier = global_self.mmr[mmr_key].rank_tier;

            if (global_self.mmr[mmr_key].rank_position && global_self.mmr[mmr_key].rank_position < top_rank_position) {
                top_rank_position = global_self.mmr[mmr_key].rank_position;
            }
        }
        rank_cont.appendChild(renderRankIcon(global_self.mmr[mmr_key].rank_tier, global_self.mmr[mmr_key].rank_position, global_mode_definitions[q.dataset.mode_key].team_size, "big"));
    }

    let top_rank = _id("top_ranked_tier");
    if (top_rank) {
        _empty(top_rank);

        if (top_rank_tier != null) {
            if (top_rank_position == 999999) top_rank_position = null;
            top_rank.appendChild(renderRankIcon(top_rank_tier, top_rank_position, 1, "big"));
        }
    }
}

function set_queue_enabled(mode, value) {
    if (!global_queues.hasOwnProperty(mode)) return;

    global_queue_selection[mode] = value ? 1 : 0;
    update_variable("string", "lobby_search", JSON.stringify(global_queue_selection));
}

// Callback function when the "lobby_search" variable gets changed
function set_queue_selection(json) {
    global_queue_selection = {};
    try {
        global_queue_selection = JSON.parse(json);
    } catch(e) {
        console.error("ERROR parsing queue selection json", e.message);
    }

    if (global_queue_selection === null) global_queue_selection = {};

    let something_changed = false;
    for (let cb of global_queue_mode_checkboxes) {
        if (cb.classList.contains("party_disabled")) continue;

        let active = (cb.dataset.enabled == "true") ? 1 : 0;

        let changed = false;
        if (global_queue_selection.hasOwnProperty(cb.dataset.mode_key)) {
            if (global_queue_selection[cb.dataset.mode_key] != active) {
                changed = true;
            }
        } else {
            // Initialize new queues disabled
            global_queue_selection[cb.dataset.mode_key] = 0;
            changed = true;
        }

        if (changed) {
            something_changed = true;
            let value = global_queue_selection[cb.dataset.mode_key];

            cb.dataset.enabled = value == 1 ? "true" : "false";
            (cb.dataset.enabled == "true") ? enable_mode_checkbox(cb) : disable_mode_checkbox(cb);
        }
    }

    // remove any currently not active queues
    // if we wanted the client to remember his last selection for rotational modes we would have to check global_mode_definitions instead
    for (let queue in global_queue_selection) {
        if (!global_queues.hasOwnProperty(queue)) delete global_queue_selection[queue];
    }

    if (something_changed && bool_am_i_leader) {
        update_queue_modes();
    }
}

function enable_mode_checkbox(el) {
    el.classList.add("enabled");
    el.dataset.enabled = true;

    let queue = el.closest('.queue');
    if (queue) queue.classList.add("enabled");

    _for_each_with_class_in_parent(el, "checkbox_mark", function(mark) {
        mark.classList.add("enabled");
    });
}
function disable_mode_checkbox(el) {
    el.classList.remove("enabled");
    el.dataset.enabled = false;

    let queue = el.closest('.queue');
    if (queue) queue.classList.remove("enabled");

    _for_each_with_class_in_parent(el, "checkbox_mark", function(mark) {
        mark.classList.remove("enabled");
    });
}


let queue_mode_update_id = 0;
let queue_mode_confirmed_update_id = 0;
function update_queue_modes() {    
    let requested_modes = [];

    for (let cb of global_queue_mode_checkboxes) {
        if (cb.dataset.locked == "false" && cb.dataset.mode_key.length && cb.dataset.enabled == "true") {
            requested_modes.push(cb.dataset.mode_key);
        }
    }

    queue_mode_update_id++;
    send_json_data({"action": "party-set-modes", "modes": requested_modes, "update_id": queue_mode_update_id });
    global_update_queue_modes_timeout = null;
}

function update_queue_modes_availability() {
    for (let cb of global_queue_mode_checkboxes) {
        if (cb.classList.contains("disabled")) continue;

        let cb_times = cb.querySelector(".checkbox_times");
        if (global_party['valid-modes'].includes(cb.dataset.mode_key)) {
            cb.classList.remove("party_disabled");
            if (cb_times) cb_times.classList.remove("party_disabled");
        } else {
            disable_mode_checkbox(cb);

            cb.classList.add("party_disabled");
            if (cb_times) cb_times.classList.add("party_disabled");
        }
    }

    for (let btn of global_instant_join_buttons) {
        let mode_key = btn.dataset.mode_key;
        if (mode_key == "warmup" || mode_key == "party_warmup") continue;

        if (!(mode_key in global_mode_definitions)) {
            btn.classList.add("locked");
            continue;
        }

        if (global_mode_definitions[mode_key].team_size == 1 && global_mode_definitions[mode_key].team_count > 2) {
            if (global_party.size > global_mode_definitions[mode_key].team_count) {
                btn.classList.add("party_disabled");
            } else {
                btn.classList.remove("party_disabled");
            }
        } else {
            if (global_party.size > global_mode_definitions[mode_key].team_size) {
                btn.classList.add("party_disabled");
            } else {
                btn.classList.remove("party_disabled");
            }
        }

    }
}


function update_queue_mode_selection() {
    let count = 0;
    for (let cb of global_queue_mode_checkboxes) {
        if (cb.parentElement == null) continue;
        
        if (global_party["modes"].includes(cb.dataset.mode_key)) {
            enable_mode_checkbox(cb);
            count++;
        } else {
            disable_mode_checkbox(cb);
        }
    }

    let queue_button = _id("ranked_queue_button");
    if (queue_button) {
        if (global_mm_searching) {
            queue_button.classList.remove("disabled");
            queue_button.textContent = localize("menu_cancel_search");
        } else {
            if (count == 0) {
                queue_button.classList.add("disabled");
                queue_button.textContent = localize("menu_select_mode");
            } else {
                queue_button.classList.remove("disabled");
                queue_button.textContent = localize("menu_start_queueing");
            }
        }
    }
}

function play_queue(btn) {
    if (global_mm_searching) {
        cancel_search();
    } else {
        if (btn.classList.contains("disabled")) return;
        send_string(CLIENT_COMMAND_PARTY, "party-queue");
    }
}

// For when no masterserver connection is available
/*
function clear_queues() {
    try {
        _empty(_id("queues_container"));
    } catch(e) {
        console.error("clear_queues() - Error trying to clear queues", e.message);
    }
}
*/

function join_warmup() {
    // Reset the inactivity timer if we are about to join a match
    engine.call("reset_inactivity_timer");
    send_string(CLIENT_COMMAND_JOIN_WARMUP, "s");
}
function join_party_warmup() {
    // Reset the inactivity timer if we are about to join a match
    engine.call("reset_inactivity_timer");
    send_string(CLIENT_COMMAND_JOIN_WARMUP, "p")
}

// ==========================================
// COMBINED QUICKPLAY, CUSTOM and PICKUP LIST
// ==========================================
function render_play_screen_combined_list() {
    //console.log("matches", _dump(global_custom_list_data));
    //console.log("pickups", _dump(global_pickup_list_data));

    if (!global_view_active) return;

    /* MATCH EXAMPLE
    {
        "list_type": "match",
		"session_id": 5337,
		"match_type": 0,
		"name": "Anon's game",
		"password": false,
		"state": 1,
		"mode": "duel",
		"map": "duel_bioplant",
		"location": "rot",
		"time_limit": 600,
		"score_limit": 0,
		"team_count": 2,
		"team_size": 1,
		"modifier_instagib": 0,
		"modifier_physics": 0,
		"client_count": 1,
		"max_clients": 16,
		"match_time": 0,
		"commands": [],
		"mmr": 1706.9937681958,
		"clients": [
			[
				"Anon",
				0
			]
		]
    },
    */

    let pickups = _id("play_combo_own_pickups");
    _empty(pickups);
    let list = _id("play_combo_list_content");
    _empty(list);

    // Prepare pickups
    let own_pickups = [];
    let other_pickups = [];
    for (let p of global_pickup_list_data) {
        if (global_party.pickup_ids && global_party.pickup_ids.includes(p.pickup_id)) {
            p.in_pickup = true;
            own_pickups.push(p);
        } else {
            p.in_pickup = false;
            other_pickups.push(p);
        }
    }

    // Sort pickups
    own_pickups.sort(function(a, b) { return b.user_count - a.user_count; });
    other_pickups.sort(function(a, b) { return b.user_count - a.user_count; });
    
    // Sort matches
    global_custom_list_data.sort(function(a, b) {
        if (a.location != b.location) {
            if (global_server_locations.hasOwnProperty(a.location) && Number(global_server_locations[a.location].ping) < Number(global_server_locations[b.location].ping)) return -1;
        } else {
            if (a.client_count > b.client_count)
                return -1;
            else 
                return 1;
        }
        return 1;
    });

    // Render own pickups separately on top
    if (own_pickups.length) {
        let fragment_p = new DocumentFragment();
        for (let d of own_pickups) {
            fragment_p.appendChild(renderPickupListRow(d));
        }
        pickups.appendChild(fragment_p);
    }


    let fragment = new DocumentFragment();
    let count_visible = 0;
    // Add pickups to the list
    for (let p of other_pickups) {
        if (global_server_selected_locations.indexOf(p.datacenter) == -1) continue;

        fragment.appendChild(renderPickupListRow(p));

        count_visible++;
    }

    // Add matches to the list
    for (let m of global_custom_list_data) {
        if (global_server_selected_locations.indexOf(m.location) == -1) continue;
        if (global_custom_list_search.trim().length) {
            if (!m.name.toLowerCase().includes(global_custom_list_search.trim().toLowerCase())) continue;
        }

        fragment.appendChild(renderMatchListRow(m));

        count_visible++;
    }

    // Add a separator line between own pickups and list if needed
    if (own_pickups.length && count_visible) {
        pickups.appendChild(_createElement("div", "separator"));
    }

    if (!count_visible && !own_pickups.length) {
        fragment.appendChild(_createElement("div", "no_data", localize("no_pickups_or_matches")));
    }

    list.appendChild(fragment);

    let outer_table = _id("play_combo_list_table");

    refreshScrollbar(outer_table);
    resetScrollbar(outer_table);
}

function renderPickupListRow(data) {
    let row = _createElement("div", ["row", "pickup_row"]);
    row.dataset.id = data.pickup_id;

    // Pickup indicator
    let accent = _createElement("div", "accent");
    let label = _createElement("div", "label", localize("match_type_pickup"));
    let arrow = _createElement("div", "arrow");
    row.appendChild(accent);
    row.appendChild(label);
    row.appendChild(arrow);

    if (data.in_pickup) {
        label.textContent = localize("joined_pickup");
        accent.classList.add("joined");
        label.classList.add("joined");
        arrow.classList.add("joined");
    }

    // Mode name and format
    let mode_name = '';
    if (global_mode_definitions.hasOwnProperty(data.mode) && global_game_mode_map.hasOwnProperty(global_mode_definitions[data.mode].mode_name)) {
        let vs = '';
        if (data.team_count == 2) {
            vs += data.team_size + localize("game_mode_type_vs_short") + data.team_size;
        } else if (data.team_count > 2) {
            if (data.team_size > 1) vs += Array(data.team_count).fill(data.team_size).join(localize("game_mode_type_vs_short"));
        }

        if (vs.length) mode_name += vs+" ";
        mode_name += global_mode_definitions[data.mode].name.toUpperCase();
    }
    row.appendChild(_createElement("div", "mode", mode_name));

    // Player counts
    let max_clients = data.team_count * data.team_size;
    let format = _createElement("div", "counts");
    format.appendChild(_createElement("div", "icon"));
    format.appendChild(_createElement("div", "values", data.user_count+"/"+max_clients));
    row.appendChild(format);

    let datacenter = _createElement("div", "datacenter");
    row.appendChild(datacenter);
    if (global_region_map.hasOwnProperty(data.datacenter) && global_server_locations.hasOwnProperty(data.datacenter)) {
        let dc_top = _createElement("div", "top");
        datacenter.appendChild(dc_top);
        let dc_bottom = _createElement("div", "bottom");
        datacenter.appendChild(dc_bottom);

        // Location ping
        let ping_ms = global_server_locations[data.datacenter].ping;
        let ping_str = '';
        if (ping_ms == -1) {
            ping_str = 'N/A';
        } else {
            ping_ms = Math.floor(Number(ping_ms) * 1000);
            ping_str = ping_ms+"ms";
        }

        let ping = _createElement("div", "ping", ping_str);
        if (ping_ms < 40)  ping.classList.add("good");
        if (ping_ms > 120) ping.classList.add("bad");
        dc_top.appendChild(ping);

        // Location flag
        if (GLOBAL_AVAILABLE_COUNTRY_FLAGS.includes(global_region_map[data.datacenter].flag)) {
            let flag = _createElement("img", "flag");
            flag.src = _flagUrl(global_region_map[data.datacenter].flag);
            dc_top.appendChild(flag);
        }

        // Location name
        dc_bottom.appendChild(_createElement("div", null, localize(global_region_map[data.datacenter].i18n)));
    }

    // note that both should only become visible if you are party leader
    let button = _createElement("div", "hover_text");
    if (data.in_pickup) {
        button.textContent = localize("leave");
        row.dataset.action = "leave";
    } else {
        button.textContent = localize("join");
        row.dataset.action = "join";
    }
    row.appendChild(button);

    row.addEventListener("mouseenter", function(e) {
        play_screen_hover_info(e, "pickup", row, data);

        if (!bool_am_i_leader) return;
        button.classList.add("visible");
        _play_mouseover4();
    });

    row.addEventListener("mouseleave", function(e) {
        button.classList.remove("visible");
        cleanup_hover_info_box(true);
    });

    row.addEventListener("click", function(e) {
        if (!bool_am_i_leader) return;

        cleanup_hover_info_box(true);

        if (row.dataset.action == "join") send_string(CLIENT_COMMAND_JOIN_PICKUP, data.pickup_id);
        if (row.dataset.action == "leave") send_string(CLIENT_COMMAND_LEAVE_PICKUP, data.pickup_id);
        _play_click1();
    });

    return row;
}

// =============================
// COMMUNITY MATCHLIST
// =============================
/*
function render_play_screen_matchlist() {
    return;
    //console.log("==== render_play_screen_matchlist", _dump(global_custom_list_data));

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
    
    let cont = _id("play_screen_combined_match_list");
    _empty(cont);
    let fragment = new DocumentFragment();

    let max_count = 12;
    let count_rendered = 0;
    for (let count=0; count<global_custom_list_data.length; count++) {
        if (count >= max_count) break;

        let m = global_custom_list_data[count];
        if (global_server_selected_locations.indexOf(m.location) == -1) continue;

        let settings_default = true;
        if (m.modifier_instagib == true) settings_default = false;
        if (m.mode !== 'race' && m.modifier_physics != 0) settings_default = false;
        if (m.commands.length > 0) settings_default = false;

        let match = _createElement("div", "match");
        
        let background = _createElement("div", "background");
        background.style.backgroundImage = `url("map-thumbnail://${m.map}")`;
        match.appendChild(background);

        match.appendChild(_createElement("div", "gradient"));

        let info = _createElement("div", "info");
        match.appendChild(info);

        let mode = _createElement("div", "mode");
        mdata.appendChild(mode);
        mode.appendChild(_createElement("div", "name", localize(global_game_mode_map[m.mode].i18n)));
        if (!settings_default) {
            mode.appendChild(_createElement("div", "special"));
        }
        mdata.appendChild(_createElement("div", "map_name", _format_map_name(m.map, m.map_name)));

        let max_clients = m.team_size * m.team_count;
        if (m.max_clients < max_clients) max_clients = m.max_clients;
        let format = _createElement("div", "format");
        format.appendChild(_createElement("div", "icon"));
        format.appendChild(_createElement("div", "vs", m.client_count+"/"+max_clients));
        info.appendChild(format);

        let datacenter = _createElement("div", "datacenter");
        info.appendChild(datacenter);

    
        if (global_region_map.hasOwnProperty(m.location) && GLOBAL_AVAILABLE_COUNTRY_FLAGS.includes(global_region_map[m.location].flag)) {
            let flag = _createElement("img", "flag");
            datacenter.appendChild(flag);
            flag.src = _flagUrl(global_region_map[m.location].flag);
        }

        let join = _createElement("div", "join", localize("join"));
        match.appendChild(join);

        match.addEventListener("mouseenter", function(e) {
            play_screen_hover_info(e, "match", match, m);

            if (!bool_am_i_leader) return;
            join.classList.add("visible");
            match.classList.add("hover");
            _play_mouseover4();
        });
        match.addEventListener("mouseleave", function(e) {
            join.classList.remove("visible");
            match.classList.remove("hover");

            cleanup_hover_info_box(true);
        });
        // CLICK ON MATCH
        match.addEventListener("click", function() {
            if (!bool_am_i_leader) return;
    
            cleanup_hover_info_box(true);

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
    
            _play_click1();
        });

        fragment.appendChild(match);
        count_rendered++;
    }

    if (count_rendered == 0) {
        let outer = _createElement("div","no_data_cont");
        outer.appendChild(_createElement("div", "no_matches", localize("message_no_custom_matches_found")));
        fragment.appendChild(outer);
    }

    cont.appendChild(fragment);
}
*/

// =============================
// PICKUPS
// =============================

let global_pickup_selected_pickup_mode = '';
let global_pickup_selected_team_size = 1;
let global_pickup_selected_datacenter = '';
let global_pickup_selected_max_party_size = 1;
let global_pickup_selected_min_skill = -500;
let global_pickup_selected_max_skill = +500;
let global_pickup_selected_min_matches = 0;
function open_create_pickup() {

    if (global_party.size > global_pickup_selected_max_party_size) global_pickup_selected_max_party_size = global_party.size;

    let cont = _createElement("div", "create_pickup");
    
    cont.appendChild(_createElement("div", "head", localize("pickup_new_header")));

    let main = _createElement("div", "main");
    cont.appendChild(main);

    let mode_cont = _createElement("div", "mode_cont");
    main.appendChild(mode_cont);

    let mode_title = _createElement("div", "title", localize("pickup_match_settings"));
    mode_cont.appendChild(mode_title);

    // GAME MODE OPTION
    mode_cont.appendChild(_createElement("div", "label", localize("custom_game_settings_mode")));
    mode_cont.appendChild(_createElement("div", "label_small", localize("pickup_mode_desc")));
    let mode_select = _createElement("div", "select-field");
    mode_cont.appendChild(mode_select);
    mode_select.dataset.theme = "modal";

    if (!global_pickup_selected_pickup_mode.length) {
        let opt_all = _createElement("div");
        opt_all.dataset.value = "unselected";
        opt_all.textContent = "";
        opt_all.dataset.selected = 1;
        mode_select.appendChild(opt_all);
    }

    let mode_list = Object.keys(global_mode_definitions).filter(m => (global_mode_definitions[m].pickup && global_mode_definitions[m].enabled));
    let mode_selected = '';
    for (let mode_key of mode_list) {
        let m = global_mode_definitions[mode_key];

        let opt_mode = _createElement("div", null, m.name);
        opt_mode.dataset.value = m.mode_key;
        if (global_pickup_selected_pickup_mode == m.mode_key) {
            opt_mode.dataset.selected = 1;
            mode_selected = m.mode_key;
        }
        mode_select.appendChild(opt_mode);
    }

    setup_select(mode_select, (field_element, el) => {
        update_pickup_mode(field_element.dataset.value);
    });

    let mode_description = _createElement("div", ["mode_desc", "hidden"]);
    mode_cont.appendChild(mode_description);

    let mode_sr = _createElement("div", "mode_sr");
    mode_cont.appendChild(mode_sr);

    let mode_settings = _createElement("div", ["mode_settings", "disabled"]);
    mode_cont.appendChild(mode_settings);

    // TEAM SIZE OPTION
    mode_settings.appendChild(_createElement("div", "label", localize("custom_game_settings_team_size")));
    let team_size_select = _createElement("div", "select-field");
    team_size_select.dataset.theme = "modal";
    mode_settings.appendChild(team_size_select);

    setup_select(team_size_select, update_team_size);

    // DATACENTER OPTION
    mode_settings.appendChild(_createElement("div", "label", localize("custom_game_settings_datacenter")));
    let datacenter_select = _createElement("div", "select-field");
    datacenter_select.dataset.theme = "modal";
    mode_settings.appendChild(datacenter_select);
    let regions = Object.keys(global_server_regions).sort();
    let default_datacenter = global_default_datacenter;
    if (global_pickup_selected_datacenter.length) default_datacenter = global_pickup_selected_datacenter;
    for (let r of regions) {
        for (let loc of global_server_regions[r]) {
            let opt_loc = _createElement("div", null, r+"/"+localize(global_region_map[loc].i18n));
            opt_loc.dataset.value = loc;
            if (default_datacenter == loc) opt_loc.dataset.selected = 1;
            datacenter_select.appendChild(opt_loc);
        }
    }
    setup_select(datacenter_select, (field_element, el) => {
        global_pickup_selected_datacenter = field_element.dataset.value
    });

    let restrictions_cont = _createElement("div", ["restrictions_cont", "disabled"]);
    main.appendChild(restrictions_cont);

    let join_title = _createElement("div", "title", localize("pickup_join_restrictions"));
    restrictions_cont.appendChild(join_title);

    // MAX PARTY SIZE OPTION
    restrictions_cont.appendChild(_createElement("div", "label", localize("pickup_max_party_size")));
    let party_size_select = _createElement("div", "select-field");
    party_size_select.dataset.theme = "modal";
    restrictions_cont.appendChild(party_size_select);

    setup_select(party_size_select, update_party_size);

    let sr_levels_max = [0, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    let sr_levels_min = [0, -200, -300, -400, -500, -600, -700, -800, -900, -1000];
    let matches_played = [0, 1, 3, 5, 10, 30, 50, 100, 300, 500, 1000];

    // MIN SKILL RATING OPTION
    restrictions_cont.appendChild(_createElement("div", "label", localize("min_skill_rating")));
    restrictions_cont.appendChild(_createElement("div", "label_small", localize("min_skill_rating_desc")));
    let min_skill_select = _createElement("div", "select-field");
    min_skill_select.dataset.theme = "modal";
    restrictions_cont.appendChild(min_skill_select);
    for (let val of sr_levels_min) {
        let name = val;
        if (val == 0) name = localize("no_limit");
        let opt_mode = _createElement("div", null, name);
        opt_mode.dataset.value = val;
        if (val == global_pickup_selected_min_skill) opt_mode.dataset.selected = 1;
        min_skill_select.appendChild(opt_mode);
    }
    setup_select(min_skill_select, (field_element, el) => {
        global_pickup_selected_min_skill = parseInt(field_element.dataset.value);
    });

    // MAX SKILL RATING OPTION
    restrictions_cont.appendChild(_createElement("div", "label", localize("max_skill_rating")));
    restrictions_cont.appendChild(_createElement("div", "label_small", localize("max_skill_rating_desc")));
    let max_skill_select = _createElement("div", "select-field");
    max_skill_select.dataset.theme = "modal";
    restrictions_cont.appendChild(max_skill_select);
    for (let val of sr_levels_max) {
        let name = "+"+val;
        if (val == 0) name = localize("no_limit");
        let opt_mode = _createElement("div", null, name);
        opt_mode.dataset.value = val;
        if (val == global_pickup_selected_max_skill) opt_mode.dataset.selected = 1;
        max_skill_select.appendChild(opt_mode);
    }
    setup_select(max_skill_select, (field_element, el) => {
        global_pickup_selected_max_skill = parseInt(field_element.dataset.value);
    });

    // MIN MATCHES PLAYED OPTION
    restrictions_cont.appendChild(_createElement("div", "label", localize("min_matches_played")));
    restrictions_cont.appendChild(_createElement("div", "label_small", localize("min_matches_played_desc")));
    let min_played_select = _createElement("div", "select-field");
    min_played_select.dataset.theme = "modal";
    restrictions_cont.appendChild(min_played_select);
    for (let val of matches_played) {
        let opt_mode = _createElement("div", null, val);
        opt_mode.dataset.value = val;
        if (val == global_pickup_selected_min_matches) opt_mode.dataset.selected = 1;
        min_played_select.appendChild(opt_mode);
    }
    setup_select(min_played_select, (field_element, el) => {
        global_pickup_selected_min_matches = parseInt(field_element.dataset.value);
    });

    let ctrl_row = _createElement("div", "ctrl_row");
    cont.appendChild(ctrl_row);

    let btn_create = _createElement("div",  ["db-btn", "disabled"], localize("create"));
    _addButtonSounds(btn_create, 1);
    ctrl_row.appendChild(btn_create);
    btn_create.addEventListener("click", function() {
        if (global_pickup_selected_pickup_mode.length == 0 || !global_mode_definitions.hasOwnProperty(global_pickup_selected_pickup_mode)) return;

        let settings = {
            "mode": global_pickup_selected_pickup_mode,
            "team_size": parseInt(team_size_select.dataset.value),
            "party_size": parseInt(party_size_select.dataset.value),
            "min_skill": parseInt(min_skill_select.dataset.value),
            "max_skill": parseInt(max_skill_select.dataset.value),
            "min_played": parseInt(min_played_select.dataset.value),
            "datacenter": datacenter_select.dataset.value
        };
        send_string(CLIENT_COMMAND_CREATE_PICKUP, JSON.stringify(settings));

        closeBasicModal();
    });

    let btn_cancel = _createElement("div", ["db-btn", "plain"], localize("cancel"));
    _addButtonSounds(btn_cancel, 1);
    ctrl_row.appendChild(btn_cancel);
    btn_cancel.addEventListener("click", function() {
        closeBasicModal();
    });
    

    openBasicModal(cont);

    if (mode_selected.length) update_pickup_mode(mode_selected);

    function update_pickup_mode(mode_key) {
        global_pickup_selected_pickup_mode = mode_key;

        if (global_pickup_selected_pickup_mode == "" || !global_mode_definitions.hasOwnProperty(global_pickup_selected_pickup_mode)) {
            // Invalid or no mode selected
            _empty(team_size_select);
            _empty(party_size_select);
            _empty(mode_sr);
            mode_description.textContent = "";
            mode_description.classList.add("hidden");

            mode_settings.classList.add("disabled");
            restrictions_cont.classList.add("disabled");
            btn_create.classList.add("disabled");

        } else {
            // Valid mode selected
            let m = global_mode_definitions[global_pickup_selected_pickup_mode];
            let gm = global_game_mode_map[m.mode_name];

            _empty(mode_sr);
            if (m.mmr_key in global_self.mmr) {
                //if (global_self.mmr[m.mmr_key].placement_matches.length >= 5) {}
                let own_rating = 1500;
                if (global_self.mmr.hasOwnProperty(m.mmr_key)) own_rating = Math.floor(global_self.mmr[m.mmr_key].rating);
                mode_sr.appendChild(_createElement("div", null, localize_ext("current_own_rating", {"mode_name": localize(global_game_mode_map[m.mode_name].i18n)})));
                mode_sr.appendChild(_createElement("div", "value", own_rating));
            } else {
                mode_sr.textContent = "";
            }
            
            mode_description.textContent = localize(gm.desc_i18n);
            mode_description.classList.remove("hidden");

            _empty(team_size_select);
            
            if (m.team_size_min < m.team_size_max) {
                for (let i=m.team_size_min; i<=m.team_size_max; i++) {
                    if (i<global_party.size) continue;

                    let opt_size = _createElement("div", null, i);
                    opt_size.dataset.value = i;
                    if (global_pickup_selected_team_size !== null && global_pickup_selected_team_size >= m.team_size_min && global_pickup_selected_team_size <= m.team_size_max) {
                        if (i == global_pickup_selected_team_size) {
                            opt_size.dataset.selected = 1;
                        }
                    } else {
                        if (i == m.team_size) {
                            opt_size.dataset.selected = 1;
                            global_pickup_selected_team_size = i;
                        }
                    }
                    team_size_select.appendChild(opt_size);
                }
            } else {
                let opt_size = _createElement("div", null, m.team_size);
                opt_size.dataset.value = m.team_size;
                opt_size.dataset.selected = 1;
                global_pickup_selected_team_size = m.team_size;
                team_size_select.appendChild(opt_size);
            }

            if (global_pickup_selected_max_party_size > global_pickup_selected_team_size) global_pickup_selected_max_party_size = global_pickup_selected_team_size;
            _empty(party_size_select);
            for (let i=global_party.size; i<=global_pickup_selected_team_size; i++) {
                let opt_size = _createElement("div", null, i);
                opt_size.dataset.value = i;
                if (i == global_pickup_selected_max_party_size) opt_size.dataset.selected = 1;
                party_size_select.appendChild(opt_size);
            }

            mode_settings.classList.remove("disabled");
            restrictions_cont.classList.remove("disabled");
            btn_create.classList.remove("disabled");
        }

        setup_select(team_size_select, update_team_size);
        setup_select(party_size_select, update_party_size);
    }

    function update_team_size(field_element, el) {
        global_pickup_selected_team_size = parseInt(field_element.dataset.value);
        if (global_pickup_selected_max_party_size > global_pickup_selected_team_size) global_pickup_selected_max_party_size = global_pickup_selected_team_size;

        _empty(party_size_select);
        for (let i=global_party.size; i<=global_pickup_selected_team_size; i++) {
            let opt_size = _createElement("div", null, i);
            opt_size.dataset.value = i;
            if (i == global_pickup_selected_max_party_size) opt_size.dataset.selected = 1;
            party_size_select.appendChild(opt_size);
        }

        setup_select(party_size_select, update_party_size);
    }

    function update_party_size(field_element, el) {
        global_pickup_selected_max_party_size = parseInt(field_element.dataset.value);
    }
}

function leave_pickup(pickup_id) {
    if (global_party.pickup_ids && global_party.pickup_ids.length) {
        let idx = global_party.pickup_ids.indexOf(pickup_id);
        while (idx >= 0) {
            global_party.pickup_ids.splice(idx, 1);
            idx = global_party.pickup_ids.indexOf(pickup_id);
        }
    }

    if (global_menu_page == "play_screen_combined" && global_view_active) update_play_combined_list(true);
}

// specific pickup update messages are only sent for status changes of pickups the party is in
function update_pickup_data(pickup) {
    //console.log("update_pickup_data", _dump(pickup));

    let updated = false;
    for (let i=0; i<global_pickup_list_data.length; i++) {
        if (global_pickup_list_data[i].pickup_id == pickup.pickup_id) {
            global_pickup_list_data[i] = pickup;
            updated = true;
            break;
        }
    }

    if (!updated) {
        global_pickup_list_data.push(pickup);
    }

    // Add to the party pickup id list if its not in there
    let join = false;
    if (!global_party.pickup_ids.includes(pickup.pickup_id)) {
        global_party.pickup_ids.push(pickup.pickup_id);
        join = true;
    }

    if (global_party.pickup_ids && global_party.pickup_ids.includes(pickup.pickup_id)) {
        pickup.in_pickup = true;
    }
    
    // TODO: find the pickup row and update it, if not found, re-render whole combo list
    if (join) {
        render_play_screen_combined_list();
    } else {
        let pickup_rows = _id("play_combo_list").querySelectorAll(".pickup_row");
        let found = false;
        for (let i=0; i<pickup_rows.length; i++) {
            if (pickup_rows[i].dataset.id == pickup.pickup_id) {
                found = true;
                _replaceNode(pickup_rows[i], renderPickupListRow(pickup));
                break;
            }
        }

        if (!found) {
            render_play_screen_combined_list();
        }
    }
}

/*
function render_play_screen_pickups() {
    //console.log("==== RENDER PICKUP LIST");

    let our_pickups = [];
    let other_pickups = [];
    for (let p of global_pickup_list_data) {
        if (global_party.pickup_ids && global_party.pickup_ids.includes(p.pickup_id)) our_pickups.push(p);
        else other_pickups.push(p);
    }

    our_pickups.sort(function(a, b) {
        return b.user_count - a.user_count;
    });
    other_pickups.sort(function(a, b) {
        return b.user_count - a.user_count;
    });

    let cont = _id("play_screen_combined_pickup_list_content");
    _empty(cont);

    let fragment = new DocumentFragment();
    if (our_pickups.length) {
        fragment.appendChild(_createElement("div", "pickups_head", localize("your_pickups")));
    }

    let rendered_pickups = 0;

    for (let p of our_pickups) {
        rendered_pickups++;
        fragment.appendChild(render_pickup(p, true));
    }
    if (our_pickups.length && other_pickups.length) {
        let divider = _createElement("div", "divider");
        divider.appendChild(_createElement("div", "inner"));
        fragment.appendChild(divider);
    }
    for (let p of other_pickups) {
        if (global_server_selected_locations.indexOf(p.datacenter) == -1) continue;
        rendered_pickups++;
        fragment.appendChild(render_pickup(p, false));
    }

    if (rendered_pickups == 0) {
        let outer = _createElement("div","no_data_cont");
        outer.appendChild(_createElement("div", "no_pickups", localize("message_no_pickups_found")));
        fragment.appendChild(outer);
    }

    cont.appendChild(fragment);

    refreshScrollbar(_id("play_screen_combined_pickup_list"));
}
*/
/*
function render_pickup(p, in_pickup) {
    //console.log("render_pickup", _dump(p));
    let pickup = _createElement("div", "pickup");
    if (in_pickup) pickup.classList.add("in_pickup");

    let datacenter = _createElement("div", "datacenter");
    pickup.appendChild(datacenter);

    if (global_region_map.hasOwnProperty(p.datacenter) && GLOBAL_AVAILABLE_COUNTRY_FLAGS.includes(global_region_map[p.datacenter].flag)) {
        let flag = _createElement("img", "flag");
        datacenter.appendChild(flag);
        flag.src = _flagUrl(global_region_map[p.datacenter].flag);

        datacenter.appendChild(_createElement("div", "locname", localize(global_region_map[p.datacenter].i18n)));
    }

    if (global_mode_definitions.hasOwnProperty(p.mode) && global_game_mode_map.hasOwnProperty(global_mode_definitions[p.mode].mode_name)) {
        let vs = '';
        if (p.team_count == 2) {
            vs += p.team_size + localize("game_mode_type_vs_short") + p.team_size;
        } else if (p.team_count > 2) {
            if (p.team_size == 1) vs += localize("game_mode_type_ffa");
            else vs += Array(p.team_count).fill(p.team_size).join(localize("game_mode_type_vs_short"));
        }

        let name = global_mode_definitions[p.mode].name;
        if (vs.length) name += ' '+vs;

        pickup.appendChild(_createElement("div", "mode", name));
    }

    let max_clients = p.team_count * p.team_size;
    let format = _createElement("div", "format");
    format.appendChild(_createElement("div", "icon"));
    format.appendChild(_createElement("div", "vs", p.user_count+"/"+max_clients));
    pickup.appendChild(format);

    // Get the avg rating of all players in the pickup
    let rating_total = 0;
    let rating_count = 0;
    for (let u of p.users) {
        if (u.hasOwnProperty("mmr") && u.mmr.hasOwnProperty("rating")) {
            rating_total += u.mmr.rating;
            rating_count++;
        }
    }

    let avg_rating = 1500;
    if (rating_count) avg_rating = rating_total / rating_count;

    let own_rating = 1500;
    if (global_mode_definitions.hasOwnProperty(p.mode)) {
        let mmr_key = global_mode_definitions[p.mode].mmr_key;
        if (global_self.mmr.hasOwnProperty(mmr_key)) {
            own_rating = global_self.mmr[mmr_key].rating;
        }
    }

    let skill_rating_class = 'sr-match';
    if (own_rating > (avg_rating + 200)) {
        skill_rating_class = 'sr-down';
    } else if (own_rating < (avg_rating - 200)) {
        skill_rating_class = 'sr-up';
    }

    // show up or down arrows even if we are within a 200 rating if we can't even join the pickup due to join restrictions
    if (own_rating < p.min_skill) skill_rating_class = 'sr-up';
    if (own_rating > p.max_skill) skill_rating_class = 'sr-down';

    let skill_rating = _createElement("div", ["skill_rating", skill_rating_class]);
    pickup.appendChild(skill_rating);

    // note that both should only become visible if you are party leader
    let button = _createElement("div", "hover_text");
    if (in_pickup) {
        button.textContent = localize("leave");
        pickup.dataset.action = "leave";
    } else {
        button.textContent = localize("join");
        pickup.dataset.action = "join";
    }
    pickup.appendChild(button);

    pickup.addEventListener("mouseenter", function(e) {
        play_screen_hover_info(e, "pickup", pickup, p);

        if (!bool_am_i_leader) return;
        button.classList.add("visible");
        _play_mouseover4();
    });
    pickup.addEventListener("mouseleave", function(e) {
        button.classList.remove("visible");
        cleanup_hover_info_box(true);
    });
    pickup.addEventListener("click", function() {
        if (!bool_am_i_leader) return;

        cleanup_hover_info_box(true);

        if (pickup.dataset.action == "join") send_string(CLIENT_COMMAND_JOIN_PICKUP, p.pickup_id);
        if (pickup.dataset.action == "leave") send_string(CLIENT_COMMAND_LEAVE_PICKUP, p.pickup_id);
        _play_click1();
    });

    return pickup;
}
*/

let global_hover_info_box_ts = Date.now();
let global_hover_info_box = null;
function initialize_play_screen_cleanup_listener() {
    document.addEventListener("mousemove", cleanup_hover_info_box);
}

function cleanup_hover_info_box(instant) {
    if (global_hover_info_box == null) return;
    
    if (instant === true) {
        _remove_node(global_hover_info_box);
        global_hover_info_box = null;
    } else {
        if ((Date.now() - global_hover_info_box_ts) > 1000) {
            _remove_node(global_hover_info_box);
            global_hover_info_box = null;
        }
    }
}

function play_screen_hover_info(e, type, ref_element, data) {
    global_hover_info_box_ts = Date.now();
    ref_element.addEventListener("mousemove", function(e) {
        global_hover_info_box_ts = Date.now();
    });

    cleanup_hover_info_box(true);

    let info_box = _createElement("div", "hover_info_box");
    let info_box_arrow = _createElement("div", "arrow");
    info_box.appendChild(info_box_arrow);

    let main_menu = _id("main_menu");

    main_menu_rect = main_menu.getBoundingClientRect();
    ref_element_rect = ref_element.getBoundingClientRect();

    if (type == "pickup") {
        info_box.appendChild(info_box_pickup(data));
        info_box.dataset.id = data.pickup_id;
    } else if (type == "match") {
        info_box.appendChild(info_box_match(data));
        info_box.dataset.id = data.session_id;
    } else if (type == "queue") {
        info_box.appendChild(info_box_queue("queue",data));
        info_box.dataset.id = data.mode_key;
    } else if (type == "instant") {
        info_box.appendChild(info_box_queue("instant",data));
        info_box.dataset.id = data.mode_key;
    }

    main_menu.appendChild(info_box);
    global_hover_info_box = info_box;

    // Wait until the info box is rendered (with opacity 0) so we can get its dimensions, then position it correctly and make it visible
    req_anim_frame(() => {
        let info_box_rect = info_box.getBoundingClientRect();
        let info_box_arrow_rect = info_box_arrow.getBoundingClientRect();

        let arrow_left = false;

        // ========
        // Position the info box horizontally left of the reference element unless there is no space to do so
        let info_box_left = ref_element_rect.x - (info_box_rect.width + onevh);
        if ((ref_element_rect.x - (onevh + info_box_rect.width)) < 0) {
            // Doesn't fit to the left, position it to the right
            info_box_left = (ref_element_rect.x + ref_element_rect.width + onevh);
            arrow_left = true;
        }
        info_box.style.left = info_box_left + "px";

        // ========
        // Position the info box vertically centered to the reference element, or in a way so it stays within the view area
        let ref_y_center = ref_element_rect.y + (ref_element_rect.height / 2);
        let info_box_top = ref_y_center - (info_box_rect.height / 2);
        let before_move = info_box_top;
        let top_moved = 0;
        if (info_box_top < (6 * onevh)) {
            // The info box is outside the top view area
            info_box_top = 6 * onevh;
            top_moved = before_move - info_box_top;
        } else if ((info_box_top + info_box_rect.height) > (main_menu_rect.height - (4 * onevh))) {
            // The info box is outside the bottom view area
            info_box_top = main_menu_rect.height - (4 * onevh) - info_box_rect.height;
            top_moved = before_move - info_box_top;
        }

        info_box.style.top = info_box_top + "px";

        // Horizontally position the arrow pointing to the reference element
        if (arrow_left) {
            info_box_arrow.style.left = (0 - info_box_arrow_rect.width) + "px";
            info_box_arrow.classList.add("left");
        } else {
            info_box_arrow.style.left = info_box_rect.width + "px";
            info_box_arrow.classList.add("right");
        }

        // Vertically position the arrow
        info_box_arrow.style.top = (((info_box_rect.height / 2) - (info_box_arrow_rect.height / 2)) + top_moved) + "px";

        // ========
        // Show the element
        info_box.style.opacity = 1;
    }, 2);

    return info_box;
}

function info_box_pickup(data) {

    // Prepare the player parties
    let parties = {};
    for (let user of data.users) {
        if (!parties.hasOwnProperty(user.party)) parties[user.party] = [];
        parties[user.party].push(user);
    }

    let box = _createElement("div", "pickup");

    let m = {};
    if (global_mode_definitions.hasOwnProperty(data.mode)) m = global_mode_definitions[data.mode];

    box.appendChild(_createElement("div", "head", localize_ext("pickup_head", {"mode_name": localize(global_game_mode_map[m.mode_name].i18n)})));

    let total = data.team_count * data.team_size;
    let missing = total - data.users.length;
    box.appendChild(_createElement("div", "desc", localize_ext("pickup_desc", {"count": missing})));

    // Settings
    box.appendChild(_createElement("div", "header", localize("pickup_match_settings")));
    let settings = _createElement("div", ["table", "settings"]);
    box.appendChild(settings);
    for (let s of ["mode", "datacenter", "team_count", "team_size"]) {
        let label = '';
        let value = '';
        if (s == "mode") {
            label = localize("custom_game_settings_mode");
            value = localize(global_game_mode_map[m.mode_name].i18n);
        } else if (s == "datacenter") {
            label = localize("custom_game_settings_datacenter");
            value = localize(global_region_map[data.datacenter].i18n);
        } else if (s == "team_count") {
            label = localize("custom_game_settings_teams");
            value = data.team_count;
        } else if (s == "team_size") {
            label = localize("custom_game_settings_team_size");
            value = data.team_size;
        }

        let row = _createElement("div", "row");
        row.appendChild(_createElement("div", "label", label));
        row.appendChild(_createElement("div", "value", value));
        settings.appendChild(row);
    }

    // Join restrictions
    box.appendChild(_createElement("div", "header", localize("pickup_join_restrictions")));
    let restrictions = _createElement("div", ["table", "restrictions"]);
    box.appendChild(restrictions);
    for (let s of ["matches_played", "min_skill", "max_skill", "max_party_size"]) {
        let label = '';
        let value = '';
        if (s == "matches_played") {
            label = localize("min_matches_played");
            value = data.min_matches_played;
        } else if (s == "min_skill") {
            label = localize("min_skill_rating");
            if (data.min_skill < -5000) value = localize("no_limit");
            else value = Math.floor(data.min_skill);
        } else if (s == "max_skill") {
            label = localize("max_skill_rating");
            if (data.max_skill > 5000) value = localize("no_limit");
            else value = Math.floor(data.max_skill);
        } else if (s == "max_party_size") {
            label = localize("pickup_max_party_size");
            value = data.max_party_size;
        }

        let row = _createElement("div", "row");
        row.appendChild(_createElement("div", "label", label));
        row.appendChild(_createElement("div", "value", value));
        restrictions.appendChild(row);
    }

    let own_rating = "?";
    if (global_self.mmr.hasOwnProperty(m.mmr_key)) own_rating = Math.floor(global_self.mmr[m.mmr_key].rating);

    let own_rating_info = _createElement("div", "own_rating");
    own_rating_info.appendChild(_createElement("div", "label", localize_ext("current_own_rating", {"mode_name": localize(global_game_mode_map[m.mode_name].i18n)})));
    own_rating_info.appendChild(_createElement("div", "value", own_rating));
    box.appendChild(own_rating_info);

    // Player list
    box.appendChild(_createElement("div", "header", localize("pickup_players")));

    for (let idx in parties) {
        let party = _createElement("div", "party");
        box.appendChild(party);

        for (let u of parties[idx]) {
            let row = _createElement("div", "row");
            row.appendChild(_createElement("div", "name", u.name));
            row.appendChild(renderRankIcon(u.mmr.rank_tier, u.mmr.rank_position, data.team_size, "small"));
            party.appendChild(row);
        }
    }

    return box;
}

function info_box_match(m) {
    let box = _createElement("div", "match");

    let settings_default = true;
    if (m.modifier_instagib == true) settings_default = false;
    if (m.mode !== 'race' && m.modifier_physics != 0) settings_default = false;
    if (m.commands.length > 0) settings_default = false;

    // Map image
    let preview_map = _createElement("div", "map");
    
    preview_map.style.backgroundImage = `url("map-thumbnail://${m.map}")`;
    preview_map.appendChild(_createElement("div", "mode_name", localize(global_game_mode_map[m.mode].i18n)));
    preview_map.appendChild(_createElement("div", "map_name", _format_map_name(m.map, m.map_name)));
    box.appendChild(preview_map);

    if (m.hasOwnProperty("map_list") && m.map_list.length && m.match_type == MATCH_TYPE_CUSTOM) {
        let map_list = _createElement("div", "map_list");
        let count = 0;
        for (let map of m.map_list) {
            if (map[0] == m.map) continue;
            count++;

            let preview_map_small = _createElement("div", "map_small");
            preview_map_small.style.backgroundImage = `url("map-thumbnail://${map[0]}")`;
            preview_map_small.appendChild(_createElement("div", "map_name", _format_map_name(map[0], map[1])));
            map_list.appendChild(preview_map_small);
        }
        if (count) {
            box.appendChild(map_list);
        }
    }

    // Match summary 
    let name = m.name;
    let qp = false;
    if (m.match_type == MATCH_TYPE_QUEUE) {
        name = localize("match_type_queue");
        qp = true;
    }
    let preview_summary = _createElement("div", "summary");
    box.appendChild(preview_summary);
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
    
    // Match players
    if (m.clients) {
        let preview_players = _createElement("div", "playerlist");
        box.appendChild(preview_players);
        preview_players.appendChild(_createElement("div", "title", localize("customlist_table_head_players")));
        let list = _createElement("div", "list");
        preview_players.appendChild(list);
        for (let c of m.clients) {
            list.appendChild(_createElement("div", "player", c[0]));
        }
    }

    // Match settings
    let preview_settings = _createElement("div", "settings");
    box.appendChild(preview_settings);

    if (!settings_default) {
        preview_settings.appendChild(_createElement("div", "settings_warning", localize("custom_game_settings_customized")));
    }

    let stats = ["location", "timelimit", "scorelimit", "teamcount", "teamsize", "maxcount"];
    if (m.modifier_instagib != 0) stats.push("instagib");
    if (m.modifier_physics != 0) stats.push("physics");

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

        row.appendChild(label);
        row.appendChild(value);
        preview_settings.appendChild(row);
    }

    if (m.commands.length) {
        let commands_filtered = [];

        // Check for the insta switch settings combination of game_equip_time_ms 0 and game_switch_time_ms 0
        let insta_switch = 0;
        for (let c of m.commands) {
            if (c.key == "game_equip_time_ms" && c.value == 0) insta_switch++;
            if (c.key == "game_switch_time_ms" && c.value == 0) insta_switch++;
        }

        for (let c of m.commands) {
            if (c.key == "game_equip_time_ms" && insta_switch == 2) {
                continue;
            } else if (c.key == "game_switch_time_ms" && insta_switch == 2) {
                continue;
            } else if (c.key == "game_lifesteal") {
                let row = _createElement("div", "stat_row");
                row.appendChild(_createElement("div", "label", localize("custom_settings_lifesteal")));
                row.appendChild(_createElement("div", "value", Math.floor(c.value * 100)+"%"));
                preview_settings.appendChild(row);
            } else {
                commands_filtered.push(c);
            }
        }

        if (insta_switch == 2) {
            let row = _createElement("div", "stat_row");
            row.appendChild(_createElement("div", "label", localize("custom_settings_instaswitch")));
            row.appendChild(_createElement("div", "value", localize("enabled")));
            preview_settings.appendChild(row);
        }

        if (commands_filtered.length) {
            let row = _createElement("div", "stat_row");
            row.appendChild(_createElement("div", "label", localize("custom_settings_commands")));
            row.appendChild(_createElement("div", "value", ""));
            preview_settings.appendChild(row);

            let cmd_row = null;
            for (let i=0; i<commands_filtered.length; i++) {
                if (i % 2 == 0) cmd_row = _createElement("div", ["stat_row", "commands"]);

                if (cmd_row) cmd_row.appendChild(_createElement("div", "value", commands_filtered[i].key+": "+commands_filtered[i].value));

                if (i % 2 == 1) {
                    preview_settings.appendChild(cmd_row);
                    cmd_row = null;
                }
            }

            if (cmd_row !== null) {
                preview_settings.appendChild(cmd_row);
            }
        }
    }

    return box;
}

function info_box_queue(type, data) {
    let m = {};
    if (global_mode_definitions.hasOwnProperty(data.mode_key)) m = global_mode_definitions[data.mode_key];

    let box = _createElement("div", "queue");

    if (type == "queue") box.appendChild(_createElement("div", "mode_name", data.queue_name));
    if (type == "instant") box.appendChild(_createElement("div", "mode_name", data.name));

    let desc = '';
    if (global_game_mode_map.hasOwnProperty(data.mode_name)) {
        if (m.instagib > 0) desc = localize(global_game_mode_map[data.mode_name].desc_instagib_i18n);
        else desc = localize(global_game_mode_map[data.mode_name].desc_i18n);
    }
    if (data.mode_key == "warmup") desc = localize("game_mode_desc_warmup");

    box.appendChild(_createElement("div", "mode_desc", desc));

    if (data.mode_key == "warmup") {
        box.appendChild(_createElement("div", "mode_desc_disclaimer", localize("game_mode_desc_warmup_disclaimer")));
    }

    let settings = _createElement("div", "settings");
    box.appendChild(settings);

    settings.appendChild(_createElement("div", "title", localize("settings")));

    for (let s of ["format", "physics"]) {
        let row = _createElement("div", "row");
        let label = '';
        let value = '';
        if (s == "format") {
            label = localize('queue_settings_label_format');
            if (type == "queue") value = data.vs;
            if (type == "instant") value = getVS(data.team_count, data.team_size);
        }
        if (s == "physics") {
            label = localize('queue_settings_label_physics');
            value = _format_physics(data.physics);
        }
        row.appendChild(_createElement("div", "label", label));
        row.appendChild(_createElement("div", "value", value));
        settings.appendChild(row);
    }

    if (type == "queue") {
        let own_rating = "?";
        if (global_self.mmr.hasOwnProperty(m.mmr_key)) own_rating = Math.floor(global_self.mmr[m.mmr_key].rating);

        let own_rating_info = _createElement("div", "own_rating");
        own_rating_info.appendChild(_createElement("div", "label", localize_ext("current_own_rating", {"mode_name": localize(global_game_mode_map[m.mode_name].i18n)})));
        own_rating_info.appendChild(_createElement("div", "value", own_rating));
        box.appendChild(own_rating_info);

        if (!global_party['valid-modes'].includes(data.mode_key)) {
            box.appendChild(_createElement("div", "incompatible", localize("incompatible_party_size")));
        }
    }

    if (type == "instant") {
        if (data.mode_key != "warmup") {
            if (data.team_size == 1 && data.team_count > 2) {
                if (global_party.size > data.team_count) {
                    box.appendChild(_createElement("div", "incompatible", localize("incompatible_party_size")));
                }
            } else {
                if (global_party.size > data.team_size) {
                    box.appendChild(_createElement("div", "incompatible", localize("incompatible_party_size")));
                }
            }
        }
    }


    /*
	"i18n": "game_mode_duel",
	"match_type": 3,
	"vs": "1v1",
	"queue_name": "Duel",
	"team_size": 1,
	"team_count": 2,
	"mode_name": "duel",
	"locked": false,
    "leaderboard": true
    "physics": 0
    */

    return box;
}