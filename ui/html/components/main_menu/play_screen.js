// global vars
let global_queue_mode_checkboxes = [];
let global_queue_groups = [];
let global_queue_selection = null;

// on load
function init_screen_play() {
    play_screen_setup_card_sliding();

    
    bind_event("starting_game", function() {
        setTimeout(function() {
            set_draft_visible(false);
        },1000);
    });

    _id("match_found_splash").addEventListener("animationend", function() {
        if (_id("match_found_splash").classList.contains("out")) {
            _id("match_found_splash").style.display = "none";
            _id("match_found_splash").classList.remove("out");
        }
    });
}

function init_queues() {
    global_queue_mode_checkboxes = [];
    renderQuickPlayCards(global_queue_groups.filter(g => g.type == "quickplay"));
    renderRankedCards(global_queue_groups.filter(g => g.type == "ranked"));
    engine.call("initialize_select_value", "lobby_search");
    update_queue_modes_availability();
}


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
        if (global_queue_selection.hasOwnProperty(cb.dataset.mode)) {
            if (global_queue_selection[cb.dataset.mode] != active) {
                changed = true;
            }
        } else {
            global_queue_selection[cb.dataset.mode] = 1;
            changed = true;
        }

        if (changed) {
            something_changed = true;
            let value = global_queue_selection[cb.dataset.mode];

            cb.dataset.enabled = value == 1 ? "true" : "false";
            (cb.dataset.enabled == "true") ? enable_mode_checkbox(cb) : disable_mode_checkbox(cb);
        }
    }

    // cleanup unused queue settings
    for (let queue in global_queue_selection) {
        if (!global_queues.hasOwnProperty(queue)) delete global_queue_selection[queue];
    }

    if (something_changed && bool_am_i_leader) {
        update_queue_modes();
    }
}
function set_queue_enabled(mode, value) {
    if (!global_queues.hasOwnProperty(mode)) return;

    global_queue_selection[mode] = value ? 1 : 0;
    update_variable("string", "lobby_search", JSON.stringify(global_queue_selection));
}
function set_queues_enabled(modes, value) {
    for (let mode of modes) {
        if (!global_queues.hasOwnProperty(mode)) continue;
        global_queue_selection[mode] = value ? 1 : 0;
    }
    update_variable("string", "lobby_search", JSON.stringify(global_queue_selection));
}
function set_queue_modes() {    
    for (let queue in global_queue_selection) {
        if (global_party["modes"].includes(queue)) global_queue_selection[queue] = 1;
        else global_queue_selection[queue] = 0;
    }
    for (let mode of global_party["modes"]) {
        if (!global_queue_selection.hasOwnProperty(mode)) global_queue_selection[mode] = 1;
    }
    update_variable("string", "lobby_search", JSON.stringify(global_queue_selection));

    update_queue_mode_selection();
}

// For when no masterserver connection is available
function clear_queues() {
    try {
        _empty(_id("play_screen_quickplay").querySelector(".play_cards_container"));
        _empty(_id("play_screen_ranked").querySelector(".play_cards_container"));
    } catch(e) {
        console.error("clear_queues() - Error trying to clear play cards!", e.message);
    }
}

// functions
function play_screen_setup_card_sliding() {

    let left_arrow = undefined;
    let right_arrow = undefined;
    let state = 0;
    _for_each_with_class_in_parent(_id("play_screen_ranked"), "card_sliding_arrow", function(el) {
        let staticContainer = _id("play_screen_ranked").querySelector(".play_cards_container");
        let movingContainer = _id("play_screen_ranked").querySelector(".card_page_container");

        if (el.classList.contains("left")) {
            left_arrow = el;
        }
        if (el.classList.contains("right")) {
            right_arrow = el;
        }

        el.addEventListener("mouseenter", function() {
            if (!el.classList.contains("active")) return;
            engine.call('ui_sound', 'ui_mouseover2');
        });

        el.addEventListener("click", function() {
            let rect = staticContainer.getBoundingClientRect();
            if (!el.classList.contains("active")) return;

            engine.call('ui_sound', 'ui_click1');

            if (state == 1) {
                movingContainer.style.transform = "translateX(0px)";
                state = 0;
            } else if (state == 0) {
                movingContainer.style.transform = "translateX(-"+rect.width+"px)";
                state = 1;
            }
        });
    });
}



function quick_play_queue(btn) {
    if (global_mm_searching_quickplay) {
        cancel_search("quickplay");
    } else {
        if (btn.classList.contains("disabled")) return;
        send_string(CLIENT_COMMAND_PARTY, "party-queue-qp");
    }
}

function comp_play_queue(btn) {
    if (global_mm_searching_ranked) {
        cancel_search("ranked");
    } else {
        if (btn.classList.contains("disabled")) return;
        send_string(CLIENT_COMMAND_PARTY, "party-queue-ranked");
    }
}




// ====================
// DATACENTER SELECTION
// ====================

function toggle_datacenter_visibility(btn) {
    let datacenters = _id("region_select_modal_screen").querySelectorAll(".datacenters");

    if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        for (let i=0; i<datacenters.length; i++) datacenters[i].classList.remove("active");
    } else {
        btn.classList.add("active");
        for (let i=0; i<datacenters.length; i++) datacenters[i].classList.add("active");
    }
}

function set_server_locations() {
    let cont = document.querySelector("#region_select_modal_screen .body");
    _empty(cont);

    let regions = Object.keys(global_server_regions).sort();
    let count = 3;
    let row = undefined;
    for (let region of regions) {
        if (count == 3) {
            row = _createElement("div", "row");
            cont.appendChild(row);
            count = 0;
        }

        count++;

        let region_div = document.createElement("div");
        region_div.classList.add("region");
        region_div.dataset.region = region;

        let region_head = _createElement("div", "head");
        region_div.appendChild(region_head);

        let main_cb = _createElement("div", "checkbox");
        main_cb.appendChild(_createElement("div"));

        region_head.appendChild(main_cb);
        region_head.appendChild(_createElement("div", "region_name", region));
        region_head.appendChild(_createElement("div", ["region_ping", "first"], "999 ms"));
        if (global_server_regions[region].length > 1) {
            region_head.appendChild(_createElement("div", "ping_seperator", "-"));
            region_head.appendChild(_createElement("div", ["region_ping", "second"], "999 ms"));
        }

        let datacenters = _createElement("div", "datacenters");
        region_div.appendChild(datacenters);

        region_head.addEventListener("click", function() {
            if (!bool_am_i_leader) return;

            if (main_cb.classList.contains("checkbox_enabled")) {
                _play_cb_uncheck();
                main_cb.classList.remove("checkbox_enabled");
                main_cb.firstElementChild.classList.remove("inner_checkbox_enabled");
                let cbs = datacenters.querySelectorAll(".small_checkbox.checkbox_enabled");
                for (let i=0; i<cbs.length; i++) {
                    cbs[i].classList.remove("checkbox_enabled");
                    cbs[i].firstElementChild.classList.remove("checkbox_enabled");
                }
            } else {
                _play_cb_check();
                main_cb.classList.add("checkbox_enabled");
                main_cb.firstElementChild.classList.add("inner_checkbox_enabled");
                let cbs = datacenters.querySelectorAll(".small_checkbox");
                for (let i=0; i<cbs.length; i++) {
                    cbs[i].classList.add("checkbox_enabled");
                    cbs[i].firstElementChild.classList.add("checkbox_enabled");
                }
            }

            set_region_selection(false, get_selected_server_locations().join(":"));
            update_region_selection();
        });

        for (let ds of global_server_regions[region]) {
            let div_ds = document.createElement("div");
            div_ds.classList.add("datacenter");
            div_ds.dataset.id = ds;

            let cb = document.createElement("div");
            cb.classList.add("small_checkbox");
            cb.dataset.id = ds;

            let cb_inner = document.createElement("div");
            cb.appendChild(cb_inner);

            let name = document.createElement("div");
            name.classList.add("name");
            name.textContent = localize("datacenter_"+ds);

            let ping = document.createElement("div");
            ping.classList.add("ping");

            div_ds.addEventListener("click", function() {
                if (!bool_am_i_leader) return;

                if (cb.classList.contains("checkbox_enabled")) {
                    cb.classList.remove("checkbox_enabled");
                    cb_inner.classList.remove("inner_checkbox_enabled");
                    engine.call('ui_sound', 'ui_uncheck_box');
                } else {
                    cb.classList.add("checkbox_enabled");
                    cb_inner.classList.add("inner_checkbox_enabled");
                    engine.call('ui_sound', 'ui_check_box');
                }

                set_region_selection(false, get_selected_server_locations().join(":"));
                update_region_selection();
            });

            div_ds.appendChild(cb);
            div_ds.appendChild(name);
            div_ds.appendChild(ping);
            datacenters.appendChild(div_ds);
        }

        row.appendChild(region_div);
    }

    let css_fix = document.createElement("div");
    css_fix.classList.add("empty-region");
    if (row) row.appendChild(css_fix);
}

var global_datacenter_map = {};
var initial_server_locations_ready = false;
let global_server_location_ping_timeout = null;
function update_server_location_pings(data) {
    // Update region selection in 2 second intervals during ping updates (3s for the first one)
    if (global_server_location_ping_timeout === null) {
        global_ping_update_in_progress = true;

        let timeout = 1500;
        if (!initial_server_locations_ready) timeout = 3000;

        global_server_location_ping_timeout = setTimeout(function() {
            initial_server_locations_ready = true;
            global_ping_update_in_progress = false;
            global_server_location_ping_timeout = null;

            if (bool_am_i_leader) engine.call("initialize_select_value", "lobby_region");
        }, timeout);
    }

    let map = {};
    for (let region of data) {
        if (region.location.length == 0 && region.region.length == 0) continue;
        map[region.code] = region;

        global_server_locations[region.code] = {
            "name": region.location,
            "ping": region.ping,
        };
    }

    let region_pings = {};

    _for_each_with_selector_in_parent(_id("region_select_modal_screen"), ".datacenter", function(el) {
        let ping_val = -1;
        let ping = 'N/A';
        if (el.dataset.id in map) {
            ping_val = Number(map[el.dataset.id].ping);
            if (ping_val == -1) {
                ping = 'N/A';
            } else {
                ping_val = Math.floor(ping_val * 1000);
                ping = ping_val + "ms";
            }
        }

        let region = el.closest(".region");
        if (region && ping_val != -1) {
            if (!(region.dataset.region in region_pings)) region_pings[region.dataset.region] = [];
            region_pings[region.dataset.region].push(ping_val);
        }

        let ping_el = el.querySelector('.ping');
        if (ping_el) {
            ping_el.textContent = ping;
        
            if (ping_val == -1) {
                ping_el.style.color = '#bcbcbc';
            } else if (ping_val < 45) {
                ping_el.style.color = global_ping_colors['green'];
            } else if (ping_val < 90) {
                ping_el.style.color = global_ping_colors['yellow'];
            } else if (ping_val < 130) {
                ping_el.style.color = global_ping_colors['orange'];
            } else {
                ping_el.style.color = global_ping_colors['red'];
            }
        }
    });

    _for_each_with_selector_in_parent(_id("region_select_modal_screen"), ".region_ping.first", function(el) {
        let region = el.closest(".region");
        if (region.dataset.region in region_pings) {
            let best = 999;
            for (let ping of region_pings[region.dataset.region]) {
                if (ping < best) best = ping;
            }
            el.textContent = best+" ms";
            if (best < 45) el.style.color = global_ping_colors['green'];
            else if (best < 90) el.style.color = global_ping_colors['yellow'];
            else if (best < 130) el.style.color = global_ping_colors['orange'];
            else el.style.color = global_ping_colors['red'];

        } else {
            el.textContent = "N/A";
            el.style.color = global_ping_colors['red'];
        }
    });


    _for_each_with_selector_in_parent(_id("region_select_modal_screen"), ".region_ping.second", function(el) {
        let region = el.closest(".region");
        if (region.dataset.region in region_pings) {
            let worst = 0;
            for (let ping of region_pings[region.dataset.region]) {
                if (ping > worst) worst = ping;
            }
            el.textContent = worst+" ms";
            if (worst < 45) el.style.color = global_ping_colors['green'];
            else if (worst < 90) el.style.color = global_ping_colors['yellow'];
            else if (worst < 130) el.style.color = global_ping_colors['orange'];
            else el.style.color = global_ping_colors['red'];
            
        } else {
            el.textContent = "N/A";
            el.style.color = global_ping_colors['red'];
        }
    });

    global_datacenter_map = map;
}

let global_ping_update_in_progress = false;
function ping_server_locations() {
    let spinner = _id("region_select_modal_screen").querySelector(".top .refresh .inner");

    // Check if an update is already in progress
    if (spinner.classList.contains("active")) return;

    engine.call("request_locations_ping");

    spinner.classList.add("active");
    global_ping_update_in_progress = true;

    let start_ts = Date.now();
    let wait = setInterval(function() {
        if (!global_ping_update_in_progress) {
            clearInterval(wait);
            spinner.classList.remove("active");
        }

        // Stop spinner if we don't have pings for every location after 4 seconds
        if (((Date.now() - start_ts) / 1000) > 4) {
            clearInterval(wait);
            spinner.classList.remove("active");
        }
    },250);
}

function get_selected_server_locations() {
    let datacenters = [];
    _for_each_with_selector_in_parent(_id("region_select_modal_screen"), ".small_checkbox", function(el) {
        if (el.classList.contains("checkbox_enabled")) {
            datacenters.push(el.dataset.id);
        }
    });

    // sort the locations by ping asc
    datacenters.sort(function(a, b) {
        if (!(a in global_server_locations)) return 1;
        if (!(b in global_server_locations)) return -1;
        if (global_server_locations[a].ping == -1) return 1;
        if (global_server_locations[b].ping == -1) return 1;
        return global_server_locations[a].ping - global_server_locations[b].ping;
    });

    return datacenters;
}

let global_process_lobby_region_update = true;
function update_region_selection() {
    let datacenters = get_selected_server_locations();

    // Don't process the variable change after manually changing it (set_string_variable would otherwise trigger a value change callback, see set_select in ui.js for lobby_region)
    global_process_lobby_region_update = false;
    update_variable("string", "lobby_region", datacenters.join(":"));
    global_process_lobby_region_update = true;

    if (bool_am_i_leader) {
        // send region info to MS
        send_string(CLIENT_COMMAND_SET_PARTY_LOCATIONS, datacenters.join(':'));
    }

    // Update the datacenter location in the lobby too
    engine.call("initialize_select_value", "lobby_custom_datacenter");
}

let global_set_region_selection_waiting = false;
function set_region_selection(from_engine, regions) {
    global_server_selected_locations = regions.split(':');

    _for_each_with_selector_in_parent(_id("region_select_modal_screen"), ".body .checkbox", function(el) {
        el.classList.remove("checkbox_enabled");
        el.firstElementChild.classList.remove("inner_checkbox_enabled");
    });

    _for_each_with_selector_in_parent(_id("region_select_modal_screen"), ".body .small_checkbox", function(el) {
        if (global_server_selected_locations.includes(el.dataset.id)) {
            el.classList.add("checkbox_enabled");
            el.children[0].classList.add("inner_checkbox_enabled");

            let region = el.closest(".region");
            if (region) {
                let cb = region.querySelector(".checkbox");
                if (cb) {
                    cb.classList.add("checkbox_enabled");
                    cb.firstElementChild.classList.add("inner_checkbox_enabled");
                }
            }
        } else {
            el.classList.remove("checkbox_enabled");
            el.children[0].classList.remove("inner_checkbox_enabled");
        }
    });

    if (from_engine) {

        if (!global_set_region_selection_waiting) {
            global_set_region_selection_waiting = true;

            if (!initial_server_locations_ready) {
                let start_ts = Date.now();
                // Wait for the intial pings to finish and then pick best regions
                let interval = setInterval(function() {
                    if (initial_server_locations_ready) {
                        global_set_region_selection_waiting = false;
                        clearInterval(interval);

                        let datacenters = regions.split(":");
                        if (regions.trim().length == 0) datacenters = get_best_regions_by_ping();

                        for (let loc in global_server_locations) {
                            if (!global_known_server_locations.includes(loc)) {
                                // Skip regions without valid ping data
                                if (Number(global_server_locations[loc].ping) < 0) continue;

                                // Add new regions to the selection that have lower than 65ms ping
                                if (!datacenters.includes(loc) && Number(global_server_locations[loc].ping) <= 0.065) datacenters.push(loc);
                                global_known_server_locations.push(loc);
                            }
                        }
                        update_variable("string", "lobby_regions_known", global_known_server_locations.join(":"));

                        if (datacenters.length) {
                            set_region_selection(false, datacenters.join(":"));
                            update_region_selection();
                        } else {
                            // Open Region selection if we couldn't find any good regions automatically
                            open_modal_screen('region_select_modal_screen', null, 1000);
                        }
                    }

                    // Abort if nothing happened within 5 seconds
                    if (Date.now() - start_ts > 5000) {
                        clearInterval(interval);
                    }
                },100);

            } else {

                global_set_region_selection_waiting = false;

                let datacenters = regions.split(":");
                if (regions.trim().length == 0) datacenters = get_best_regions_by_ping();

                for (let loc in global_server_locations) {
                    if (!global_known_server_locations.includes(loc)) {
                        // Skip regions without valid ping data
                        if (Number(global_server_locations[loc].ping) < 0) continue;

                        // Add new regions to the selection that have lower than 65ms ping
                        if (!datacenters.includes(loc) && Number(global_server_locations[loc].ping) <= 0.065) datacenters.push(loc);
                        global_known_server_locations.push(loc);
                    }
                }
                update_variable("string", "lobby_regions_known", global_known_server_locations.join(":"));

                if (datacenters.length) {
                    set_region_selection(false, datacenters.join(":"));
                    update_region_selection();
                } else {
                    // Open Region selection if we couldn't find any good regions automatically
                    open_modal_screen('region_select_modal_screen', null, 1000);
                }
            }

        }

    }
}

function get_best_regions_by_ping() {
    let regions = Object.keys(global_datacenter_map);
    //console.log(_dump(global_datacenter_map));

    let best_regions = [];
    for (let region of regions) {
        if (global_datacenter_map[region].ping == -1 || global_datacenter_map[region].ping == "-1") continue;

        // Add regions up to 65ms
        if (Number(global_datacenter_map[region].ping) >= 0 && Number(global_datacenter_map[region].ping) <= 0.065) {
            best_regions.push(region);
        }
    }
    if (best_regions.length < 2) {
        for (let region of regions) {
            if (global_datacenter_map[region].ping == -1 || global_datacenter_map[region].ping == "-1") continue;

            // Add regions up to 90ms
            if (Number(global_datacenter_map[region].ping) >= 0 && Number(global_datacenter_map[region].ping) <= 0.09) {
                best_regions.push(region);
            }
        }
    }
    if (best_regions.length == 0) {
        for (let region of regions) {
            if (global_datacenter_map[region].ping == -1 || global_datacenter_map[region].ping == "-1") continue;

            // Add regions up to 120ms
            if (Number(global_datacenter_map[region].ping) >= 0 && Number(global_datacenter_map[region].ping) <= 0.12) {
                best_regions.push(region);
            }
        }
    }

    console.log("Setting best default datacenter locations due to empty initial selection:",best_regions.join(":"));
    return best_regions;
}




// ================
// QUEUE PLAY CARDS
// ================
function renderQuickPlayCards(cards) {
    let screen = _id("play_screen_quickplay");
    let container = screen.querySelector(".play_cards_container");
    _empty(container);

    let survival_card = null;
    for (let card of cards) {
        if (card.name == "qg_qp_survival") {
            survival_card = card;
            survival_card.limited = localize("limited_time_mode");
        } else {
            container.appendChild(renderPlayCard(card));
        }
    }

    let warmup_card = {
        "name": "warmup",
        "type": "warmup",
        "title": "warmup",
        "background": "brawl",
        "on_click": function() { join_warmup(); },
        "on_click_spinner": true,
        //"hover_button": "join",
        //"tooltip": "practice",
        "state": 2,

        "buttons": [
            {
                "text": localize("join"),
                "on_click": function() { join_warmup(); }
            },
            {
                "id": "warmup_party_join",
                "text": localize("party_join"),
                "on_click": function() { join_party_warmup(); }
            },
        ],
    };

    if (survival_card !== null) {
        let double_container = _createElement("div", "card_double");
        double_container.appendChild(renderPlayCard(survival_card));
        double_container.appendChild(renderPlayCard(warmup_card));
        container.appendChild(double_container);
    } else {
        // Warmup card/button
        container.appendChild(renderPlayCard(warmup_card));
    }

    _for_each_with_class_in_parent(container, 'tooltip2', function(el) {
        add_tooltip2_listeners(el);
    });

    req_anim_frame(() => {
        _for_each_with_class_in_parent(container, 'card_checkbox', function(el) {
            let variable = el.dataset.variable;
            if (variable) engine.call("initialize_checkbox_value", variable);
        });
    });
}

function renderRankedCards(cards) {
    let screen = _id("play_screen_ranked");
    let container = screen.querySelector(".play_cards_container");
    _empty(container);

    for (let card of cards) {
        container.appendChild(renderPlayCard(card));
    }

    _for_each_with_class_in_parent(container, 'tooltip2', function(el) {
        add_tooltip2_listeners(el);
    });

    req_anim_frame(() => {
        _for_each_with_class_in_parent(container, 'card_checkbox', function(el) {
            let variable = el.dataset.variable;
            if (variable) engine.call("initialize_checkbox_value", variable);
        });
    });
}

function update_warmup_buttons() {
    let btn = _id("warmup_party_join");
    if (btn) {
        if (!bool_am_i_leader || global_party.size <= 1) btn.classList.add("hidden");
        else btn.classList.remove("hidden");
    }
}

let play_card_index = 0;
let play_card_lookup = {}; 
let play_card_checkboxes = {};
let global_small_play_cards = ["qg_r_arena", "qg_r_solo", "qg_qp_arcade", "qg_qp_survival", "warmup"];
function renderPlayCard(data) {
    //console.log("renderPlayCard", _dump(data));

    if (!data.queues) data.queues = [];

    let card_flex = _createElement("div", ["card_flex"]);
    card_flex.dataset.card_idx = play_card_index;
    card_flex.dataset.currently_active = "false";

    // Make these cards smaller to make the center team one stand out
    if (global_small_play_cards.includes(data.name)) card_flex.classList.add("small");
    
    let play_card_video = new PlayCardVideo(data.background);
    card_flex.appendChild(play_card_video.card);
    play_card_lookup[play_card_index] = play_card_video;
    play_card_index++;

    if (data.state == 1) {
        card_flex.classList.add("locked");
        let card_locked = _createElement("div", "card_locked");
        card_locked.appendChild(_createElement("div", "icon"));
        card_locked.appendChild(_createElement("div", "text", localize("coming_soon")));
        card_flex.appendChild(card_locked);
    }

    let card_top = _createElement("div", "card_top");
    card_top.appendChild(_createElement("div", "title", localize(data.title)));
    let card_best_rank = _createElement("div", "card_best_rank");
    card_top.appendChild(card_best_rank);
    if (data.type == "ranked") {
        let top_links = _createElement("div", "card_top_links");
        let link_leaderboards = _createElement("div", "link");
        let link_icon = _createElement("div", ["icon", "leaderboard"]);
        link_leaderboards.appendChild(link_icon);
        link_leaderboards.appendChild(_createElement("div", "title", localize("menu_title_leaderboards")));
        _addButtonSounds(link_leaderboards, 1);
        link_leaderboards.addEventListener("click", function(ev) {
            ev.stopPropagation();
            if (data.queues.length) {
                open_leaderboards(data.queues[0]);
            } else {
                open_leaderboards();
            }
        });
        link_leaderboards.addEventListener("mouseenter", function() {
            link_leaderboards.classList.add("hover");
            link_icon.classList.add("hover");
        });
        link_leaderboards.addEventListener("mouseleave", function() {
            link_leaderboards.classList.remove("hover");
            link_icon.classList.remove("hover");
        });
        top_links.appendChild(link_leaderboards);
        card_top.appendChild(top_links);
    }

    if (data.hasOwnProperty("limited") && data.limited.length) {
        let top_desc = _createElement("div", "card_top_desc", data.limited);
        card_top.appendChild(top_desc);
    }

    if (data.type == "warmup") {
        let top_desc = _createElement("div", "card_top_desc", localize("warmup_while_queuing"));
        card_top.appendChild(top_desc);
    }


    card_flex.appendChild(card_top);

    let card_bottom = _createElement("div", "card_bottom");
    card_flex.appendChild(card_bottom);

    let card_texts = [];
    if (data.hover_button) {
        var card_text = _createElement("div","card_text");
        card_text.appendChild(_createElement("div", "card_play", localize(data.hover_button)));
        card_bottom.appendChild(card_text);
        card_texts.push(card_text);
    }

    if (data.buttons && data.buttons.length) {
        
        for (let btn of data.buttons) {
            let card_text = _createElement("div", "card_text");
            card_text.appendChild(_createElement("div", "card_play", btn.text));
            card_bottom.appendChild(card_text);
            card_texts.push(card_text);

            if (btn.hasOwnProperty("id")) {
                card_text.id = btn.id;
                if (btn.id == "warmup_party_join") {
                    if (!bool_am_i_leader || global_party.size <= 1) card_text.classList.add("hidden");
                }
            }

            if (btn.hasOwnProperty("on_click") && typeof btn.on_click == "function") {
                card_text.addEventListener("click", function(e) {
                    e.stopPropagation();
                    card_click_spinner(btn.on_click);
                });
                _addButtonSounds(card_text, 1);
            }
        }
    }

    let card_checkboxes = [];

    for (let queue of data.queues) {
        if (!(global_queues[queue])) continue;

        let match_modes = [];
        let match_mode_names = [];
        if (global_queues[queue]) {
            for (let mode of global_queues[queue].modes) {
                if (!match_mode_names.includes(mode.mode_name)) {
                    match_mode_names.push(mode.mode_name);
                    match_modes.push({
                        "name": mode.mode_name,
                        "instagib": mode.instagib
                    });
                }
            }
        }

        let card_checkbox_outer = _createElement("div", "card_checkbox_outer");
        card_bottom.appendChild(card_checkbox_outer);

        let card_checkbox = _createElement("div", "card_checkbox");
        card_checkbox_outer.appendChild(card_checkbox);

        card_checkbox_outer.addEventListener("click", function(e) {
            e.stopPropagation();
            card_checkbox.dispatchEvent(new Event("click"));
        });

        card_checkbox.dataset.mode = queue;
        card_checkbox.dataset.locked = (data.state == 1) ? true : false;
        card_checkbox.dataset.type = data.type;

        if (match_mode_names.length > 1) {
            card_checkbox.dataset.msgHtmlId = "mode_description";
            card_checkbox.dataset.match_mode = match_mode_names.join(":");
            card_checkbox.dataset.instagib = 0;
            card_checkbox.classList.add("tooltip2");
        } else if (match_mode_names.length == 1) {
            card_checkbox.dataset.msgHtmlId = "card_tooltip";
            card_checkbox.dataset.match_mode = match_modes[0].name;
            card_checkbox.dataset.instagib = match_modes[0].instagib;
            card_checkbox.classList.add("tooltip2");
        }

        card_checkboxes.push(card_checkbox);
        global_queue_mode_checkboxes.push(card_checkbox);

        play_card_checkboxes[queue] = card_checkbox;

        let checkbox_box = _createElement("div", "checkbox_box");

        if (data.state == 1) {
            let checkbox_locked = _createElement("div", "checkbox_locked");
            checkbox_box.appendChild(checkbox_locked);
        } else {
            let checkbox_times = _createElement("div", ["checkbox_times", "tooltip2"]);
            checkbox_times.dataset.msgId = "incompatible_party_size";
            checkbox_box.appendChild(checkbox_times);

            let checkbox_mark = _createElement("div", "checkbox_mark");
            checkbox_box.appendChild(checkbox_mark);
        }
        card_checkbox.appendChild(checkbox_box);

        let checkbox_label = _createElement("div", "checkbox_label");
        checkbox_label.appendChild(_createElement("span", "", global_queues[queue].queue_name));
        card_checkbox.appendChild(checkbox_label);

        let checkbox_rank = _createElement("div", "checkbox_rank");
        card_checkbox.appendChild(checkbox_rank);

        if (global_queues[queue].modes.length > 1) {
            let mode_list = _createElement("div", "mode_list");
            for (let mode of global_queues[queue].modes) {
                mode_list.appendChild(_createElement("div", "mode", localize(global_game_mode_map[mode.mode_name].i18n)));
            }
            card_checkbox.appendChild(mode_list);
        }

        if (global_queues[queue].roles && global_queues[queue].roles.length) {
            let card_roles = _createElement("div", "card_roles");
            let card_roles_inner = _createElement("div", "card_roles_inner");
            card_roles.appendChild(card_roles_inner);
            card_bottom.appendChild(card_roles);

            card_roles.addEventListener("click", function(ev) {
                ev.stopPropagation();
            });

            for (let role of global_queues[queue].roles) {
                let card_role = _createElement("div", ["card_role", "_comp_play_role"]);
                card_role.dataset.mode = queue;
                card_role.dataset.role = role.name;

                let card_role_cb = _createElement("div", "card_role_cb");
                card_role_cb.appendChild(_createElement("div", "mark"));
                card_role.appendChild(card_role_cb);
                card_role.appendChild(_createElement("div", "card_role_label", localize(role.i18n)));
                card_role.appendChild(_createElement("div", "card_role_players"));

                card_roles_inner.appendChild(card_role);

                card_role.addEventListener("click", function(ev) {
                    ev.stopPropagation();

                    if (!card_roles_inner.classList.contains("enabled")) return;
                    if (global_mm_searching_quickplay && data.type == "quickplay") return;
                    if (global_mm_searching_ranked && data.type == "ranked") return;

                    if (card_role.classList.contains("enabled")) {
                        card_role.classList.remove("enabled");
                        card_role.firstElementChild.classList.remove("enabled");
                        card_role_cb.firstElementChild.classList.remove("enabled");
                    } else {
                        card_role.classList.add("enabled");
                        card_role.firstElementChild.classList.add("enabled");
                        card_role_cb.firstElementChild.classList.add("enabled");
                    }
                    
                    let roles = [];
                    _for_each_with_class_in_parent(card_roles_inner, "card_role", function(role) {
                        if (role.dataset.mode == queue && role.classList.contains("enabled")) {
                            roles.push(role.dataset.role);
                        }
                    });
                    
                    send_json_data({"action": "party-set-roles", "mode": queue, "roles": roles});
                });
            }
        }
    }

    let card_spinner = null;
    if (data.on_click_spinner) {
        card_spinner = _createSpinner();
        card_flex.appendChild(card_spinner);
    }

    function card_click_spinner(cb) {
        let initial_delay = 0;
        if (data.on_click_spinner && card_spinner != null) {
            initial_delay = 500;
            card_flex.classList.add("onclickactive");
            card_spinner.classList.add("active");
            setTimeout(function() {
                card_flex.classList.remove("onclickactive");
                card_spinner.classList.remove("active");
            }, 4000);
        }
        setTimeout(function() {
            if (typeof cb == "function") cb();
        }, initial_delay);
    }

    if (data.state > 1) {
        card_flex.addEventListener("mouseenter", function() {
            card_flex.classList.add("hover");
            if (card_texts.length) {
                for (let card_text of card_texts) card_text.classList.add("hover");
            }
            _play_mouseover4();

            if (card_flex.dataset.currently_active == "false") {
                if (global_view_active) play_card_video.play();
            }
        });
        card_flex.addEventListener("mouseleave", function() {
            card_flex.classList.remove("hover");
            if (card_texts.length) {
                for (let card_text of card_texts) card_text.classList.remove("hover");
            }

            if (card_flex.dataset.currently_active == "false") {
                play_card_video.pause();
            }
        });
        
        card_flex.addEventListener("click", function() {
   
            let set_all_enabled = false;
            let first = true;

            if (data.state > 1 && data.on_click) {
                if (card_flex.classList.contains("onclickactive")) return;
                card_click_spinner(data.on_click());
            }
       
            let modes = [];
            for (let cb of card_checkboxes) {
                if (cb.classList.contains("disabled")) continue;
                if (cb.classList.contains("party_disabled")) continue;
                if (!bool_am_i_leader) continue;
                if (data.type == "quickplay" && global_mm_searching_quickplay) continue;
                if (data.type == "ranked" && global_mm_searching_ranked) continue;
                  
                let mode = cb.dataset.mode;

                if (first) {
                    if (!mode) continue;
                    let value = false;
                    let data_value = cb.dataset.enabled;
                    if (data_value && (data_value === "true" || data_value === true)) value = true;
                    value = !value;
                    set_all_enabled = value;
                    first = false;
                    
                    (set_all_enabled) ? _play_cb_check() : _play_cb_uncheck();
                }

                modes.push(mode);
            }

            set_queues_enabled(modes, set_all_enabled);
        
        });

        for (let cb of card_checkboxes) {
            let mode = cb.dataset.mode;
            cb.addEventListener("click", function(ev) {
                ev.stopPropagation();
                if (cb.classList.contains("disabled")) return;
                if (cb.classList.contains("party_disabled")) return;
                if (!bool_am_i_leader) return;
                if (data.type == "quickplay" && global_mm_searching_quickplay) return;
                if (data.type == "ranked" && global_mm_searching_ranked) return;
                
                let value = false;
                let data_value = cb.dataset.enabled;
                if (data_value && (data_value === "true" || data_value === true)) value = true;
                value = !value;

                (value) ? _play_cb_check() : _play_cb_uncheck();

                set_queue_enabled(mode, value);
            });
        }

    }

    return card_flex;
}

class PlayCardVideo {
    constructor(style) {
        // disable video playback until gameface fixes memory leaks
        this.disable_videos = false;

        style = style.toLowerCase();

        this.intro = true;
        this.static_image = false;
        if (style.toLowerCase() == "arena") this.intro = false;
        if (style.toLowerCase() == "survival") {
            this.intro = false;
            this.static_image = true;
        }

        this.card = _createElement("div", "card_video");
        if (this.intro) {
            this.start_image = _createElement("img",   ["card_video_preview", "start"]);
            this.start_video = _createElement("video", ["card_video_clip", "start"]);
            this.start_image.src = "/html/images/gamemode_cards/"+style+"_intro.jpg";
            this.start_video.src = "/html/images/gamemode_cards/"+style+"_intro.webm";
            this.start_video.currentTime = 1;
        }
        if (this.static_image) {
            this.loop_image  = _createElement("img",   ["card_static_image", "loop"]);
            this.loop_image.src  = "/html/images/gamemode_cards/"+style+"_static.jpg";
            this.card.appendChild(this.loop_image);
        } else {
            this.loop_image  = _createElement("img",   ["card_video_preview", "loop"]);
            this.loop_video  = _createElement("video", ["card_video_clip", "loop"]);
            this.loop_image.src  = "/html/images/gamemode_cards/"+style+"_loop.jpg";
            this.loop_video.src  = "/html/images/gamemode_cards/"+style+"_loop.webm";
            this.loop_video.currentTime = 1;
            this.loop_video.loop = true;

            this.card.appendChild(this.loop_video);
            this.card.appendChild(this.loop_image);
            if (this.intro) {
                this.card.appendChild(this.start_video);
                this.card.appendChild(this.start_image);
            }
        }

        if (this.intro) this.state = 0;
        else this.state = 2;
        this.playing = false;

        this.setupListeners();
    }

    play() {
        if (this.disable_videos) return;
        if (this.static_image) return;

        this.playing = true;
        this.card.classList.add("playing");

        if (!global_view_active) return;

        if (this.state == 0) {
            this.state = 1;
            this.start_video.play();
            this.start_image.style.visibility = "hidden";
        }
        if (this.state == 1) {
            this.start_video.play();
        }
        if (this.state == 2) {
            this.loop_video.play();
            this.loop_image.style.visibility = "hidden";
        }
    }

    pause() {
        if (this.disable_videos) return;
        if (this.static_image) return;

        this.playing = false;
        this.card.classList.remove("playing");
        if (this.state == 1) {
            this.start_video.pause();
            if (this.start_video.hasOwnProperty("suspended")) delete this.start_video.suspended;
        }
        if (this.state == 2) {
            this.loop_video.pause();
            if (this.loop_video.hasOwnProperty("suspended")) delete this.loop_video.suspended;
        }
    }

    reset() {
        if (this.disable_videos) return;
        if (this.static_image) return;

        if (this.intro) {
            this.state = 0;
            this.start_video.style.display = "block";
            this.start_image.style.visibility = "visible";
            this.start_video.currentTime = 0;
            this.start_video.pause();
            if (this.start_video.hasOwnProperty("suspended")) delete this.start_video.suspended;
        } else { 
            this.state = 2;
        }
    
        this.loop_image.style.visibility = "visible";
        this.loop_video.currentTime = 0;
        this.loop_video.pause();
        if (this.loop_video.hasOwnProperty("suspended")) delete this.loop_video.suspended;
        this.playing = false;
    }

    isPlaying() {
        return this.playing;
    }

    setupListeners() {
        if (this.disable_videos) return false;
        if (this.static_image) return;

        if (this.intro) {
            this.start_video.addEventListener("ended", () => {
                this.start_video.style.display = "none";
                this.state = 2;
                this.play();
            });
        }
    }
}

function play_screen_reset_cards(type) {
    let cont = undefined;
    if (type == "quickplay") cont = _id("play_screen_quickplay");
    if (type == "ranked") cont = _id("play_screen_ranked");
    if (!cont) return;

    _for_each_with_class_in_parent(cont, "card_flex", function(card) {
        let video = play_card_lookup[card.dataset.card_idx];
        if (video) {
            let is_playing = video.isPlaying();
            video.reset();
            if (is_playing){
                if (global_view_active) video.play();
            }
        }
    });
}

let queue_mode_update_id = 0;
let queue_mode_confirmed_update_id = 0;
function update_queue_modes() {    
    let requested_modes = [];

    for (let cb of global_queue_mode_checkboxes) {
        if (cb.dataset.locked == "false" && cb.dataset.mode.length && cb.dataset.enabled == "true") {
            requested_modes.push(cb.dataset.mode);
        }
    }

    queue_mode_update_id++;
    send_json_data({"action": "party-set-modes", "modes": requested_modes, "update_id": queue_mode_update_id });
    global_update_queue_modes_timeout = null;
}

function update_queue_modes_availability() {
    for (let cb of global_queue_mode_checkboxes) {
        if (cb.classList.contains("disabled")) return;

        let cb_times = cb.querySelector(".checkbox_times");
        if (global_party['valid-modes'].includes(cb.dataset.mode)) {
            cb.classList.remove("party_disabled");
            if (cb_times) cb_times.classList.remove("party_disabled");
        } else {
            disable_mode_checkbox(cb);

            cb.classList.add("party_disabled");
            if (cb_times) cb_times.classList.add("party_disabled");
        }
    }
}

function enable_mode_checkbox(el) {
    el.classList.add("checkbox_enabled");
    el.dataset.enabled = true;

    _for_each_with_class_in_parent(el, "checkbox_box", function(box) {
        box.classList.add("enabled");
        let cb = box.querySelector(".checkbox_mark")
        if (cb) cb.classList.add("enabled");
    });

    if (el.nextSibling != null && el.nextSibling.classList.contains("card_roles")) {
        if (el.nextSibling.firstElementChild != null) {
            el.nextSibling.firstElementChild.classList.add("enabled");
        }
    }
}
function disable_mode_checkbox(el) {
    el.classList.remove("checkbox_enabled");
    el.dataset.enabled = false;

    _for_each_with_class_in_parent(el, "checkbox_box", function(box) {
        box.classList.remove("enabled");
        let cb = box.querySelector(".checkbox_mark")
        if (cb) cb.classList.remove("enabled");
    });
    if (el.nextSibling != null && el.nextSibling.classList.contains("card_roles")) {
        _for_each_with_class_in_parent(el.nextSibling, "enabled", function(el) {
            el.classList.remove("enabled");
        });

        _for_each_with_class_in_parent(el.nextSibling, "card_role_players", function(el) {
            update_role_selection();
        });
    }
}

function update_role_selection() {
    _for_each_with_class_in_parent(_id("play_panel"), "card_role", function(r) {
        let player_cont = r.querySelector(".card_role_players");
        if (!player_cont) return;
        _empty(player_cont);

        if (!(r.dataset.mode in global_party["role-reqs"]) ||
            !(r.dataset.role in global_party["role-reqs"][r.dataset.mode])) 
        {
            return;
        }

        _for_each_with_class_in_parent(r, "enabled", function(el) {
            el.classList.remove("enabled");
        });
        
        let count = 0;
        if (r.dataset.mode in global_party["roles"] && r.dataset.role in global_party["roles"][r.dataset.mode]) {
            let self_active = false;
            global_party["roles"][r.dataset.mode][r.dataset.role].forEach(function(user_id) {
                let role_player = document.createElement("div");
                role_player.classList.add("role_player");
                if (global_party["members"][user_id].data && global_party["members"][user_id].data.avatar) {
                    role_player.style.backgroundImage = 'url('+_avatarUrl(global_party["members"][user_id].data.avatar)+')';
                }
                role_player.dataset.msg = global_party["members"][user_id].name;
                add_tooltip2_listeners(role_player);

                if (count >= global_party['role-reqs'][r.dataset.mode][r.dataset.role]) {
                    role_player.classList.add("extra");
                }

                player_cont.appendChild(role_player);

                if (user_id == global_self.user_id) {
                    self_active = true;
                    r.classList.add("enabled");
                    r.firstElementChild.classList.add("enabled");
                    r.firstElementChild.firstElementChild.classList.add("enabled");
                }

                count++;
            });

            if (!self_active) {
                r.classList.remove("enabled");
                r.firstElementChild.classList.remove("enabled");
                r.firstElementChild.firstElementChild.classList.remove("enabled");
            }
        }

        for (count; count < global_party['role-reqs'][r.dataset.mode][r.dataset.role]; count++) {
            let role_player = document.createElement("div");
            role_player.classList.add("role_player");
            role_player.classList.add("empty");
            player_cont.appendChild(role_player);
        }
    });
}

function update_queue_mode_selection() {

    let qp_count = 0;
    let ranked_count = 0;
    for (let cb of global_queue_mode_checkboxes) {
        if (cb.parentElement == null) continue;
        
        if (global_party["modes"].includes(cb.dataset.mode)) {
            enable_mode_checkbox(cb);
            if (cb.dataset.type == "quickplay") qp_count++;
            if (cb.dataset.type == "ranked") ranked_count++;

            if ((global_mm_searching_quickplay && cb.dataset.type == "quickplay") || 
                (global_mm_searching_ranked && cb.dataset.type == "ranked")) {
                let card = cb.closest(".card_flex");
                card.dataset.currently_active = true;
                if (global_view_active) play_card_lookup[card.dataset.card_idx].play();
            }
        } else {
            disable_mode_checkbox(cb);
        }

        if ((!global_mm_searching_quickplay && cb.dataset.type == "quickplay") || 
            (!global_mm_searching_ranked && cb.dataset.type == "ranked")) {
            let card = cb.closest(".card_flex");
            if (!card.classList.contains("hover")) {
                card.dataset.currently_active = false;
                play_card_lookup[card.dataset.card_idx].pause();
            }
        }
    }

    if (global_mm_searching_quickplay) {
        _html(_id("quick_play_queue_button"), localize("menu_cancel_search"));
        _id("quick_play_queue_button").classList.remove("disabled");
    } else {
        if (qp_count == 0) {
            _id("quick_play_queue_button").classList.add("disabled");
            _html(_id("quick_play_queue_button"), localize("menu_select_mode"));
        } else {
            _id("quick_play_queue_button").classList.remove("disabled");
            _html(_id("quick_play_queue_button"), localize("menu_join_game"));
        }
    }

    if (global_mm_searching_ranked) {
        _html(_id("ranked_play_queue_button"), localize("menu_cancel_search"));
        _id("ranked_play_queue_button").classList.remove("disabled");
    } else {
        if (ranked_count == 0) {
            _id("ranked_play_queue_button").classList.add("disabled");
            _html(_id("ranked_play_queue_button"), localize("menu_select_mode"));
        } else {
            _id("ranked_play_queue_button").classList.remove("disabled");
            _html(_id("ranked_play_queue_button"), localize("menu_find_match"));
        }
    }
}

function handle_mm_match_event(data) {
    //console.log("handle_mm_match_event", _dump(data));

    let delay = 0;
    if (data.action == "mm-match-found") {
        if (data.type == "quickplay") {
            process_queue_msg("quickplay", "found");
            process_queue_msg("ranked", "stop");
        }
        if (data.type == "ranked") {
            process_queue_msg("quickplay", "stop");
            process_queue_msg("ranked", "found");
        }
        engine.call("flash_taskbar");
    } else if (data.action == "mm-join-match-found") {
        process_queue_msg("quickplay", "found");
        process_queue_msg("ranked", "stop");
        engine.call("flash_taskbar");
    } else if (data.action == "mm-map-vote") {
        // mm-map-vote only comes after a mode-vote, so the draft screen is already visible
        delay = 250;
        anim_hide(_id("draft_screen_inner"), 250);
    }

    let icon_cont = _id("draft_screen_mode_icon");
    let title_cont = _id("draft_screen_mode_name");
    let text_cont = _id("draft_screen_mode_text");

    icon_cont.style.display = "none";
    title_cont.style.display = "none";
    text_cont.style.display = "none";

    setTimeout(() => {
        let map_cont = _id("draft_maps_container");
        _empty(map_cont);
        if (data.vote == "map" && data.vote_options && data.vote_options.length) {
            draft_render_map_vote(map_cont, data.vote_options);
        }

        let mode_cont = _id("draft_modes_container");
        _empty(mode_cont);
        if (data.vote ==  "mode" && data.vote_options && data.vote_options.length) {
            draft_render_mode_vote(mode_cont, data.vote_options);
        }

        if (data.vote == "map" && data.mode in global_game_mode_map && data.mm_mode && data.mm_mode in global_queues) {
            icon_cont.style.backgroundImage = "url("+global_game_mode_map[data.mode].icon+"?s=6)";
            title_cont.textContent = localize(global_game_mode_map[data.mode].i18n)+" "+global_queues[data.mm_mode].vs;
            text_cont.textContent = localize(global_game_mode_map[data.mode].desc_i18n);
            icon_cont.style.display = "flex";
            title_cont.style.display = "flex";
            text_cont.style.display = "flex";
        }

        if (data.action == "mm-match-found" || data.action == "mm-join-match-found") {
            mm_match_found_overlay(data);
        } else if (data.action == "mm-map-vote") {
            anim_show(_id("draft_screen_inner"), 250);
            set_draft_visible(true, data);
        }
    }, delay);
}

function draft_render_map_vote(cont, maps) {
    if (maps.length <= 3) {
        cont.style.setProperty("--map_row_count", 3);
    } else if (maps.length == 4) {
        cont.style.setProperty("--map_row_count", 2);
    } else if (maps.length > 4) {
        cont.style.setProperty("--map_row_count", 3);
    }

    _id("draft_vote_header").textContent = localize("pick_your_preferred_map");

    let fragment = new DocumentFragment();
    for (let map of maps) {
        let map_thumbnail = _createElement("div", ["map_thumbnail", "vote_option"]);
        map_thumbnail.style.backgroundImage = "url(map_thumbnails/"+map+".png)";
        map_thumbnail.dataset.option = map;

        let map_thumbnail_name = _createElement("div", "map_thumbnail_name", _format_map_name(map));
        map_thumbnail.appendChild(map_thumbnail_name);

        map_thumbnail.appendChild(_createElement("div", "vote_cont"));

        map_thumbnail.addEventListener("click", function() {
            _play_click1();
            _for_each_with_class_in_parent(cont, "active", function(el) {
                el.classList.remove("active");
            });
            map_thumbnail.classList.add("active");
            map_thumbnail_name.classList.add("active");

            send_string(CLIENT_COMMAND_SELECT_MAP, map);
        });
        map_thumbnail.addEventListener("mouseenter", function() {
            _play_mouseover4();
        });

        fragment.appendChild(map_thumbnail);
    }

    cont.appendChild(fragment);
}

function draft_render_mode_vote(cont, modes) {
    _id("draft_vote_header").textContent = localize("pick_your_preferred_mode");

    let fragment = new DocumentFragment();
    for (let mode of modes) {
        if (!(mode in global_game_mode_map)) continue;
        let mode_div = _createElement("div", ["mode", "vote_option"]);
        mode_div.style.backgroundImage = 'url(/html/images/gamemode_cards/'+global_game_mode_map[mode].image+')';
        mode_div.dataset.option = mode;

        let mode_name = _createElement("div", "name", localize(global_game_mode_map[mode].i18n));
        mode_div.appendChild(mode_name);

        mode_div.appendChild(_createElement("div", "vote_cont"));

        mode_div.addEventListener("click", function() {
            _play_click1();
            _for_each_with_class_in_parent(cont, "active", function(el) {
                el.classList.remove("active");
            });
            mode_div.classList.add("active");
            mode_name.classList.add("active");

            send_string(CLIENT_COMMAND_SELECT_MODE, mode);
        });

        fragment.appendChild(mode_div);
    }

    cont.appendChild(fragment);
}

function draft_update_vote_counts(data) {
    if (!global_draft_is_visible) return;

    let cont = undefined;
    if (data.type == "map") cont = _id("draft_maps_container");
    if (data.type == "mode") cont = _id("draft_modes_container");
    if (!cont) return;

    _for_each_with_class_in_parent(cont, "vote_option", function(opt_el) {
        let vote_cont = _get_first_with_class_in_parent(opt_el, "vote_cont");
        if (!vote_cont) return;

        _empty(vote_cont);
        if (opt_el.dataset.option in data.votes && data.votes[opt_el.dataset.option] > 0) {
            let fragment = new DocumentFragment();
            for (let i=0; i<data.votes[opt_el.dataset.option]; i++) {
                fragment.appendChild(_createElement("div", "vote"));
            }
            vote_cont.appendChild(fragment);
        }
    });
}

let mm_cancel_timeout = undefined;
function mm_match_found_overlay(data) {
    /*
        "action": "mm-match-found",
        "type": "quickplay",
        "cancel_time": 5,
        "mode": "ca",
        "mm_mode": "qp_ca_1",
        "location": "mos",
        "maps": [
            "a_junktion",
            "a_heikam",
            "a_barrows_gate"
        ]
    */
    engine.call('ui_sound', "ui_match_found");
    let splash = _id("match_found_splash");
    let type = splash.querySelector(".type");
    let mode = splash.querySelector(".mode");
    let cancel = splash.querySelector(".btn");
    cancel.style.display = "none";

    if (data.action == "mm-match-found")      cancel.dataset.type = "new-match";
    if (data.action == "mm-join-match-found") cancel.dataset.type = "join-match";

    if (data.type == "quickplay")   type.textContent = localize("match_found_quickplay");
    else if (data.type == "ranked") type.textContent = localize("match_found_ranked");
    else type.textContent = localize("match_found");

    mode.textContent = global_queues[data.mm_mode].queue_name;

    splash.style.display = "flex";
    
    mm_cancel_timeout = setTimeout(function() {

        if (data.action == "mm-match-found" && data.vote.length) {
            set_draft_visible(true, data);
        }
        splash.classList.add("out");
        
    }, Number(data.cancel_time) * 1000);
}

function mm_cancel_found_match(ev) {
    if (ev.currentTarget.dataset.type == "new-match") {
        send_string(CLIENT_COMMAND_PARTY, "party-cancel-match");
    }
    if (ev.currentTarget.dataset.type == "join-match") {
        send_string(CLIENT_COMMAND_PARTY, "party-cancel-join-match");
    }    
}

function handle_mm_match_cancelled() {
    if (mm_cancel_timeout)   clearTimeout(mm_cancel_timeout);
    if (draft_screen_queued) clearTimeout(draft_screen_queued);
    if (countdown_interval)  clearInterval(countdown_interval);
    _id("match_found_splash").classList.add("out");
    set_draft_visible(false);
}

let draft_screen_queued = undefined;
let countdown_interval = undefined;
let show_backbutton_timeout = undefined;
let global_draft_is_visible = false;
function set_draft_visible(visible, data) {
    //console.log("set_draft_visible", visible);
    global_draft_is_visible = visible;

    if (show_backbutton_timeout !== undefined) {
        clearTimeout(show_backbutton_timeout);
        show_backbutton_timeout = undefined;
    }

    if (countdown_interval !== undefined) {
        clearInterval(countdown_interval);
        countdown_interval = undefined;
    }

    let countdown = 10;
    
    if (visible) {
        // Close any open modal windows
        goUpALevel();

        anim_show(_id("draft_screen_countdown"));
        _id("draft_screen_backbutton").style.display = "none";

        engine.call('ui_sound', "ui_transition_mapvote");

        if (draft_screen_queued !== undefined) clearTimeout(draft_screen_queued);
        draft_screen_queued = setTimeout(function() {
            let draft_screen = _id("draft_screen");

            engine.call("show_draft", true);
            set_blur(true);

            let display_computed = getComputedStyle(draft_screen).display;    
            if (display_computed == "none") {
                anim_show(draft_screen, window.fade_time);
                anim_hide(_id("lobby_container"), window.fade_time);
            }

            if (data.vote == "map") {
                
                if (data && data.mode && data.mode in global_game_mode_map && global_game_mode_map[data.mode].announce.length) {
                    engine.call('ui_sound_queue', global_game_mode_map[data.mode].announce);
                }
                engine.call('ui_sound_queue', "announcer_common_menu_mapvote");
            }

            set_draft_countdown(countdown);
            countdown--;

            countdown_interval = setInterval(function() {
                if (countdown < 0) {
                    clearInterval(countdown_interval);

                    show_backbutton_timeout = setTimeout(function() {
                        anim_hide(_id("draft_screen_countdown"), 200, function() {
                            anim_show(_id("draft_screen_backbutton"));
                        });
                        show_backbutton_timeout = undefined;
                    },5000);

                    return;
                }

                engine.call('ui_sound', "ui_match_found_tick");
                set_draft_countdown(countdown);
                countdown--;
            },1000);

        },200);
    } else {
        anim_show(_id("draft_screen_countdown"));
        _id("draft_screen_backbutton").style.display = "none";
        engine.call("show_draft", false);
        if (draft_screen_queued !== undefined) clearTimeout(draft_screen_queued);
        if (getComputedStyle(_id("draft_screen")).display != "none") {
            anim_hide(_id("draft_screen"), window.fade_time);
            anim_show(_id("lobby_container"), window.fade_time);
            set_blur(global_background_blur);
        }
    }
}

function set_draft_countdown(countdown) {
    _id("draft_screen_countdown").textContent = countdown;
}


function updateQueueRanks() {
    if (Object.keys(global_self.mmr).length == 0) return;

    _for_each_with_class_in_parent(_id("play_screen_quickplay"), "card_flex", function(el) {
        let best = el.querySelector('.card_best_rank');
        delete best.dataset.rank;
        delete best.dataset.position;
    });
    _for_each_with_class_in_parent(_id("play_screen_ranked"), "card_flex", function(el) {
        let best = el.querySelector('.card_best_rank');
        delete best.dataset.rank;
        delete best.dataset.position;
    });

    for (let mode of Object.keys(global_self.mmr)) {
        if (!(mode in play_card_checkboxes)) continue;

        let rank_cont = play_card_checkboxes[mode].querySelector('.checkbox_rank');
        _empty(rank_cont);

        if (global_self.mmr[mode].placement_matches != null && global_self.mmr[mode].placement_matches.length < 10) {
            let placement_matches = _createElement("div", "rank_placements");
            placement_matches.textContent = global_self.mmr[mode].placement_matches.length+" / 10";
            rank_cont.appendChild(placement_matches);
        }

        let team_size = 1;
        if (mode in global_queues) team_size = global_queues[mode].team_size;

        rank_cont.appendChild(renderRankIcon(global_self.mmr[mode].rank_tier, global_self.mmr[mode].rank_position, team_size, "small"));

        let best_cont = rank_cont.closest('.card_flex').querySelector('.card_best_rank');

        let best_rank = 0;
        let best_position = 99999999;
        if ("position" in best_cont.dataset && Number(best_cont.dataset.position) > 0) best_position = Number(best_cont.dataset.position);
        if ("rank" in best_cont.dataset && Number(best_cont.dataset.rank) >= 0) best_rank = Number(best_cont.dataset.rank);

        if (global_self.mmr[mode].rank_tier != null && global_self.mmr[mode].rank_tier > best_rank) best_rank = global_self.mmr[mode].rank_tier;
        if (global_self.mmr[mode].rank_position != null && global_self.mmr[mode].rank_position < best_position) best_position = global_self.mmr[mode].rank_position;

        best_cont.dataset.rank = best_rank;
        if (best_position == 99999999) { best_position = null };
        best_cont.dataset.position = best_position;

        _empty(best_cont);
        if (best_rank > 0) {
            let icon = renderRankIcon(best_rank, best_position, team_size, "");
            best_cont.appendChild(icon);
        }
    }
}

function showRankOverview() {
    open_modal_screen("rank_overview_modal_screen");
}

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