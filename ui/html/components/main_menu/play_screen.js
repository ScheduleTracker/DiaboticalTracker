// global vars
var playScreenCardTracker = {};

// on load
window.addEventListener("load", function() {
    play_screen_setup_video_hover();
    play_screen_setup_mode_selection();
    play_screen_setup_card_sliding();
});

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

function play_screen_setup_mode_selection() {
    _for_each_with_class_in_parent(_id('play_panel'), 'card_flex', function(card) {
        if (card.classList.contains("locked")) return;
        
        card.addEventListener("click", function() {
            let set_all_enabled = false;
            let first = true;
            _for_each_with_class_in_parent(this, 'card_checkbox', function(el) {
                if (el.classList.contains("disabled")) return;
                if (el.classList.contains("party_disabled")) return;
                if (global_mm_searching_quickplay && el.classList.contains("_quick_play_checkbox")) return;
                if (global_mm_searching_ranked && el.classList.contains("_comp_play_checkbox")) return;
                if (!bool_am_i_leader) return;
                
                var variable = el.dataset.variable;

                if (first) {
                    if (!variable) return;
                    let value = false;
                    let data_value = el.dataset.enabled;
                    if (data_value && (data_value === "true" || data_value === true)) {
                        value = true;
                    }
                    value = !value;
                    set_all_enabled = value;
                    first = false;
                    
                    // Only play a sound for the first one
                    if (set_all_enabled) {
                        engine.call('ui_sound', 'ui_check_box');
                    } else {
                        engine.call('ui_sound', 'ui_uncheck_box');
                    }
                }

                engine.call("set_bool_variable", variable, set_all_enabled);
            });
        });

        _for_each_with_class_in_parent(card, 'card_checkbox', function(el) {
            el.addEventListener("click", function(ev) {
                ev.stopPropagation();
                if (el.classList.contains("disabled")) return;
                if (el.classList.contains("party_disabled")) return;
                if (global_mm_searching_quickplay && el.classList.contains("_quick_play_checkbox")) return;
                if (global_mm_searching_ranked && el.classList.contains("_comp_play_checkbox")) return;
                if (!bool_am_i_leader) return;

                var variable = el.dataset.variable;
                let value = false;
                let data_value = el.dataset.enabled;
                if (data_value && (data_value === "true" || data_value === true)) {
                    value = true;
                }
                value = !value;

                if (value) {
                    engine.call('ui_sound', 'ui_check_box');
                } else {
                    engine.call('ui_sound', 'ui_uncheck_box');
                }

                engine.call("set_bool_variable", variable, value);
            });

            // Init variables on the client, otherwise checkboxes can't be updated
            var current_variable = el.dataset.variable;
            if (current_variable) {
                engine.call("initialize_checkbox_value", current_variable);
            }
        });

        _for_each_with_class_in_parent(card, 'card_roles', function(el) {
            el.addEventListener("click", function(ev) {
                ev.stopPropagation();
            });
        });

        _for_each_with_class_in_parent(card, 'card_role', function(el) {
            el.addEventListener("click", function(ev) {
                ev.stopPropagation();

                if (!el.parentElement.classList.contains("enabled")) return;
                if (global_mm_searching_quickplay && el.classList.contains("_quick_play_role")) return;
                if (global_mm_searching_ranked && el.classList.contains("_comp_play_role")) return;

                let mode = el.dataset.mode;

                if (el.classList.contains("enabled")) {
                    el.classList.remove("enabled");
                    el.firstElementChild.classList.remove("enabled");
                    el.firstElementChild.firstElementChild.classList.remove("enabled");
                } else {
                    el.classList.add("enabled");
                    el.firstElementChild.classList.add("enabled");
                    el.firstElementChild.firstElementChild.classList.add("enabled");
                }
                
                let roles = [];
                _for_each_with_class_in_parent(el.parentElement, "card_role", function(role) {
                    if (role.dataset.mode == mode && role.classList.contains("enabled")) {
                        roles.push(role.dataset.role);
                    }
                });
                
                send_json_data({"action": "party-set-roles", "mode": el.dataset.mode, "roles": roles});
            });
        });
    });

}

function play_screen_setup_video_hover() {
    let card_id = 0;

    _for_each_with_class_in_parent(_id('main_menu'), 'card_flex', function(card) {
        card_id++;
        card.dataset.card_id = card_id;

        if (card.classList.contains("locked")) return;

        card.addEventListener("mouseenter", function() { 
            play_screen_play_video(card);

            engine.call('ui_sound', 'ui_mouseover4');
            card.classList.add("hover");
            if (card.firstElementChild.classList.contains("card_video")) {
                card.firstElementChild.classList.add("hover");
            }
            _for_first_with_class_in_parent(card, 'card_top_bg', function(el) {
                el.classList.add("hover");
            });
            _for_first_with_class_in_parent(card, 'card_text', function(el) {
                el.classList.add("hover");
            });
        });
        card.addEventListener("mouseleave", function() { 
            play_screen_stop_video(card)
            card.classList.remove("hover");
            if (card.firstElementChild.classList.contains("card_video")) {
                card.firstElementChild.classList.remove("hover");
            }
            _for_first_with_class_in_parent(card, 'card_top_bg', function(el) {
                el.classList.remove("hover");
            });
            _for_first_with_class_in_parent(card, 'card_text', function(el) {
                el.classList.remove("hover");
            });
        });
    });
}

function play_screen_play_video(card) {
    let id = card.dataset.card_id;

    if (!playScreenCardTracker[id]) {
        playScreenCardTracker[id] = {
            "preview_start": null,
            "preview_loop": null,
            "start": null,
            "loop": null,
        }

        _for_each_with_class_in_parent(card, 'card_video_preview', function(el) {
            if (el.classList.contains("start")) { playScreenCardTracker[id].preview_start = el; }
            if (el.classList.contains("loop"))  { playScreenCardTracker[id].preview_loop = el; }
        });

        _for_each_with_class_in_parent(card, 'card_video_clip', function(el) {
            if (el.classList.contains("start")) { playScreenCardTracker[id].start = el; }
            if (el.classList.contains("loop")) { playScreenCardTracker[id].loop = el; }
        });

        if (playScreenCardTracker[id].start != null) {
            playScreenCardTracker[id].start.addEventListener("ended", function() {
                playScreenCardTracker[id].start.parentNode.removeChild(playScreenCardTracker[id].start);
                playScreenCardTracker[id].start = null;
                if (playScreenCardTracker[id].loop != null) {
                    playScreenCardTracker[id].loop.play();
                }
            });
        }
    }

    if (playScreenCardTracker[id].start != null) {
        playScreenCardTracker[id].preview_start.style.visibility = "hidden";
        playScreenCardTracker[id].preview_loop.style.visibility = "visible";
        playScreenCardTracker[id].start.play();
    } else if (playScreenCardTracker[id].loop != null) {
        playScreenCardTracker[id].loop.play();
        if (playScreenCardTracker[id].preview_loop != null) {
            playScreenCardTracker[id].preview_loop.style.visibility = "hidden";
        }
    }
}

function play_screen_stop_video(card) {
    _for_each_with_class_in_parent(card, 'card_video_clip', function(el) {
        el.pause();
    });
}

function quick_play_queue(btn) {
    if (global_mm_searching_quickplay) {
        cancel_search("quickplay");
    } else {
        if (btn.classList.contains("disabled")) return;
        send_string("party-queue-qp");
    }
}

function comp_play_queue(btn) {
    if (global_mm_searching_ranked) {
        cancel_search("ranked");
    } else {
        if (btn.classList.contains("disabled")) return;
        send_string("party-queue-ranked");
    }
}

function update_queue_modes() {
    let requested_modes = [];

    _for_each_in_class("_quick_play_checkbox",function(el) {
        if (el.dataset.mode.length && el.dataset.enabled == "true") {
            requested_modes.push(el.dataset.mode);
        }
    });

    if (!_id("play_menu_tab_ranked").classList.contains("locked")) {
        _for_each_in_class("_comp_play_checkbox",function(el) {
            if (el.dataset.mode.length && el.dataset.enabled == "true") {
                requested_modes.push(el.dataset.mode);
            }
        });
    }

    //console.log("send party-set-modes",_dump(requested_modes));
    send_json_data({"action": "party-set-modes", "modes": requested_modes });
}

function update_queue_modes_availability() {
    global_party['valid-modes']
    _for_each_with_class_in_parent(_id("play_panel"), "card_checkbox", function(el) {
        if (el.classList.contains("disabled")) return;

        let cb =  el.querySelector(".checkbox_times");
        if (global_party['valid-modes'].includes(el.dataset.mode)) {
            el.classList.remove("party_disabled");
            if (cb) cb.classList.remove("party_disabled");
        } else {
            disable_mode_checkbox(el);

            el.classList.add("party_disabled");
            if (cb) cb.classList.add("party_disabled");
        }
    });
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
            //_empty(el);
            update_role_selection();
        });
    }
}

function update_queue_mode_selection() {
    let qp_count = 0;
    let ranked_count = 0;
    _for_each_with_class_in_parent(_id('play_panel'), 'card_checkbox', function(el) {
        if (global_party["modes"].includes(el.dataset.mode)) {
            enable_mode_checkbox(el);
            if (el.classList.contains("_quick_play_checkbox")) qp_count++;
            if (el.classList.contains("_comp_play_checkbox")) ranked_count++;
        } else {
            disable_mode_checkbox(el);
        }
    });

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
                role_player.style.backgroundImage = "url(//app-data/avatar-by-egs-id/"+user_id+".png)";
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


function update_server_location_selection() {

    let cont = document.querySelector("#region_select_modal_screen .body");
    _empty(cont);
    let regions = Object.keys(global_server_regions).sort();
    for (let region of regions) {
        let region_div = document.createElement("div");
        region_div.classList.add("region");

        let region_head = document.createElement("div");
        region_head.classList.add("head");
        region_head.innerHTML = region;
        region_div.appendChild(region_head);

        for (let ds of global_server_regions[region]) {
            let div_ds = document.createElement("div") ;
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

                update_region_selection();
            });

            div_ds.appendChild(cb);
            div_ds.appendChild(name);
            div_ds.appendChild(ping);
            region_div.appendChild(div_ds);
        }

        cont.appendChild(region_div);
    }

    let css_fix = document.createElement("div");
    css_fix.classList.add("empty-region");
    cont.appendChild(css_fix);

    refresh_datacenter_pings();
}

var global_datacenter_map = {};
var initial_server_locations_ready = false;
var initial_server_location_update = true;
function update_server_location_pings(data) {
    if (initial_server_location_update) {
        initial_server_location_update = false;

        // If we aren't ready after 2 seconds then just use what we got
        setTimeout(function() {
            initial_server_locations_ready = true;
        },2000);
    }

    let map = {};
    let valid_count = 0;
    for (let region of data) {
        map[region.code] = region;
        if (region.ping > 0) valid_count++;

        global_server_locations[region.code] = {
            "name": region.location,
            "ping": region.ping,
        };
    }


    if (valid_count == data.length) {
        if (global_ping_update_in_progress) update_region_selection();
        global_ping_update_in_progress = false;
        initial_server_locations_ready = true;
        
    }

    _for_each_with_selector_in_parent(_id("region_select_modal_screen"), ".datacenter", function(el) {
        let ping = 'N/A';
        if (el.dataset.id in map) {
            ping = map[el.dataset.id].ping;
            if (ping == -1) {
                ping = 'N/A';
            } else {
                ping = Math.floor(Number(ping) * 1000);
            }
        }

        let ping_el = el.querySelector('.ping');
        _html(ping_el ,ping+" ms");
        
        if (ping == -1) {
            ping_el.style.color = '#bcbcbc';
        } else if (ping < 45) {
            ping_el.style.color = global_ping_colors['green'];
        } else if (ping < 90) {
            ping_el.style.color = global_ping_colors['yellow'];
        } else if (ping < 130) {
            ping_el.style.color = global_ping_colors['orange'];
        } else {
            ping_el.style.color = global_ping_colors['red'];
        }
    });

    global_datacenter_map = map;
}

let global_ping_update_in_progress = false;
function refresh_datacenter_pings() {
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
    },50);
}

function update_region_selection() {
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
        return global_server_locations[a].ping - global_server_locations[b].ping;
    });
    
    engine.call("set_string_variable", "lobby_region", datacenters.join(':'));

    if (bool_am_i_leader) {
        // send region info to MS
        send_string("party-locations "+datacenters.join(':'));
    }
}

let global_initial_region_selection = true;
function set_region_selection(from_engine, regions) {
    global_server_selected_locations = regions.split(':');

    _for_each_with_selector_in_parent(_id("region_select_modal_screen"), ".small_checkbox", function(el) {
        if (global_server_selected_locations.includes(el.dataset.id)) {
            el.classList.add("checkbox_enabled");
            el.children[0].classList.add("inner_checkbox_enabled");
        } else {
            el.classList.remove("checkbox_enabled");
            el.children[0].classList.remove("inner_checkbox_enabled");
        }
    });

    if (from_engine && global_send_region_selection) {
        if (global_initial_region_selection && regions.trim().length == 0) {

            let start_ts = Date.now();
            let interval = setInterval(function() {
                // Wait for the intial pings to finish and then pick best regions
                if (initial_server_locations_ready) {
                    clearInterval(interval);
                    let datacenters = get_best_regions_by_ping();

                    // sort the locations by ping asc
                    datacenters.sort(function(a, b) {
                        if (!(a in global_server_locations)) return 1;
                        if (!(b in global_server_locations)) return -1;
                        return global_server_locations[a].ping - global_server_locations[b].ping;
                    });
                    send_string("party-locations "+datacenters.join(":"));
                }

                // Abort if nothing happened within 5 seconds
                if (Date.now() - start_ts > 5000) {
                    clearInterval(interval);
                }
            },100);    
        } else {
            // sort the locations by ping asc
            let datacenters = regions.split(":");
            datacenters.sort(function(a, b) {
                if (!(a in global_server_locations)) return 1;
                if (!(b in global_server_locations)) return -1;
                return global_server_locations[a].ping - global_server_locations[b].ping;
            });
            send_string("party-locations "+datacenters.join(":"));
        }

        if (global_initial_region_selection) global_initial_region_selection = false;

        global_send_region_selection = false;
    }
}

function get_best_regions_by_ping() {
    let regions = Object.keys(global_datacenter_map);

    let best_regions = [];
    for (let region of regions) {
        // Add regions under 60ms
        if (Number(global_datacenter_map[region].ping) >= 0 && Number(global_datacenter_map[region].ping) < 0.06) {
            best_regions.push(region);
        }
    }
    if (best_regions.length < 2) {
        for (let region of regions) {
            // Add regions under 90ms
            if (Number(global_datacenter_map[region].ping) >= 0 && Number(global_datacenter_map[region].ping) < 0.09) {
                best_regions.push(region);
            }
        }
    }
    if (best_regions.length == 0) {
        for (let region of regions) {
            // Add regions under 160ms
            if (Number(global_datacenter_map[region].ping) >= 0 && Number(global_datacenter_map[region].ping) < 0.16) {
                console.log("add under 160ms", region);
                best_regions.push(region);
            }
        }
    }

    console.log("Setting best default datacenter locations due to empty initial selection:",best_regions.join(":"));
    return best_regions;
}