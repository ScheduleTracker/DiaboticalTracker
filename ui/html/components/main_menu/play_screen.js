// global vars
let global_queue_mode_checkboxes = [];

// on load

function init_screen_play() {
    renderQuickPlayCards();
    renderRankedCards();

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




// ====================
// DATACENTER SELECTION
// ====================

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
    console.log(_dump(global_datacenter_map));

    let best_regions = [];
    for (let region of regions) {
        if (global_datacenter_map[region].ping == -1 || global_datacenter_map[region].ping == "-1") continue;

        // Add regions under 60ms
        if (Number(global_datacenter_map[region].ping) >= 0 && Number(global_datacenter_map[region].ping) < 0.06) {
            best_regions.push(region);
        }
    }
    if (best_regions.length < 2) {
        for (let region of regions) {
            if (global_datacenter_map[region].ping == -1 || global_datacenter_map[region].ping == "-1") continue;

            // Add regions under 90ms
            if (Number(global_datacenter_map[region].ping) >= 0 && Number(global_datacenter_map[region].ping) < 0.09) {
                best_regions.push(region);
            }
        }
    }
    if (best_regions.length == 0) {
        for (let region of regions) {
            if (global_datacenter_map[region].ping == -1 || global_datacenter_map[region].ping == "-1") continue;

            // Add regions under 120ms
            if (Number(global_datacenter_map[region].ping) >= 0 && Number(global_datacenter_map[region].ping) < 0.12) {
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


function renderQuickPlayCards() {
    let screen = _id("play_screen_quickplay");
    let container = screen.querySelector(".play_cards_container");

    let cards = [
        {
            "type": "quickplay",
            "title": "game_modes_arcade",
            "card_style": "ARCADE",
            "queue_modes": ["qp_ffa", "qp_instagib_ffa", "qp_coinrun_5", "qp_instagib_5"],
            "locked": false,
        },
        {
            "type": "quickplay",
            "title": "game_mode_wipeout",
            "card_style": "WIPEOUT",
            "queue_modes": ["qp_wo_4"],
            "locked": false,
        },
        {
            "type": "quickplay",
            "title": "game_mode_arena",
            "card_style": "ARENA",
            "queue_modes": ["qp_rocket_arena_1", "qp_ca_1", "qp_ca_2"],
            "locked": false,
        }
    ];

    for (let card of cards) {
        container.appendChild(renderPlayCard(card));
    }
    _for_each_with_class_in_parent(container, 'tooltip2', function(el) {
        add_tooltip2_listeners(el);
    });

    _for_each_with_class_in_parent(container, 'card_checkbox', function(el) {
        let variable = el.dataset.variable;
        if (variable) engine.call("initialize_checkbox_value", variable);
    });
}

function renderRankedCards() {
    let screen = _id("play_screen_ranked");
    let container = screen.querySelector(".play_cards_container");

    let cards_ranked = [
        /*
        {
            "type": "ranked",
            "title": "game_mode_capture_the_flag",
            "card_style": "CTF",
            "queue_modes": ["r_ctf_5"],
            "locked": false,
        },
        {
            "type": "ranked",
            "title": "game_mode_tdm",
            "card_style": "BRAWL",
            "queue_modes": ["r_tdm_3"],
            "locked": false,
        },
        */
        {
            "type": "ranked",
            "title": "game_mode_duel",
            "card_style": "ARENA",
            "queue_modes": ["r_duel"],
            "locked": false,
        },
        /*
        {
            "type": "ranked",
            "title": "game_mode_macguffin",
            "card_style": "MCGUFFIN",
            "queue_modes": ["r_macguffin_3"],
            "locked": false,
        },
        */
    ];


    for (let card of cards_ranked) {
        container.appendChild(renderPlayCard(card));
    }

    _for_each_with_class_in_parent(container, 'tooltip2', function(el) {
        add_tooltip2_listeners(el);
    });

    _for_each_with_class_in_parent(container, 'card_checkbox', function(el) {
        let variable = el.dataset.variable;
        if (variable) engine.call("initialize_checkbox_value", variable);
    });
}


let play_card_index = 0;
let play_card_lookup = {}; 
let play_card_checkboxes = {};
function renderPlayCard(data) {

    let base_modes = [];
    if (data.queue_modes) {
        for (let queue of data.queue_modes) {
            if (!(global_queue_modes[queue])) continue;
            if (!base_modes.includes(global_queue_modes[queue].mode)) base_modes.push(global_queue_modes[queue].mode);
        }
    } else {
        data.queue_modes = [];
    }

    let card_flex = _createElement("div", ["card_flex"]);
    let tt = false;
    if (data.queue_modes.length) {
        card_flex.dataset.msgHtmlId = "mode_description";
        card_flex.dataset.mode = base_modes.join(":");
        tt = true;
    } else if (data.tooltip) {
        card_flex.dataset.msgHtmlId = "card_tooltip";
        card_flex.dataset.mode = data.tooltip;
        tt = true;
    }
    if (tt) card_flex.classList.add("tooltip2");
    card_flex.dataset.card_idx = play_card_index;
    card_flex.dataset.currently_active = "false";
    
    let play_card_video = new PlayCardVideo(data.card_style);
    card_flex.appendChild(play_card_video.card);
    play_card_lookup[play_card_index] = play_card_video;
    play_card_index++;

    if (data.locked) {
        card_flex.classList.add("locked");
        let card_locked = _createElement("div", "card_locked");
        card_locked.appendChild(_createElement("div", "icon"));
        card_locked.appendChild(_createElement("div", "text", localize("coming_soon")));
        card_flex.appendChild(card_locked);
    }

    let card_top = _createElement("div", "card_top", localize(data.title));
    let card_best_rank = _createElement("div", "card_best_rank");
    card_top.appendChild(card_best_rank);
    card_flex.appendChild(card_top);

    let card_bottom = _createElement("div", "card_bottom");
    card_flex.appendChild(card_bottom);

    if (data.hover_button) {
        var card_text = _createElement("div","card_text");
        if (data.hover_button == "play") {
            card_text.appendChild(_createElement("div", "card_play", localize("play")));
        }
        card_bottom.appendChild(card_text);
    }

    let card_checkboxes = [];

    for (let queue of data.queue_modes) {
        if (!(global_queue_modes[queue])) continue;

        let card_checkbox = _createElement("div", "card_checkbox");
        card_checkbox.dataset.mode = queue;
        card_checkbox.dataset.variable = global_queue_modes[queue].variable;
        card_checkbox.dataset.locked = data.locked;
        card_checkbox.dataset.type = data.type;
        card_bottom.appendChild(card_checkbox);
        card_checkboxes.push(card_checkbox);
        global_queue_mode_checkboxes.push(card_checkbox);

        play_card_checkboxes[queue] = card_checkbox;

        let checkbox_box = _createElement("div", "checkbox_box");

        if (data.locked) {
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

        let label = localize(global_queue_modes[queue].i18n);
        let checkbox_label = _createElement("div", "checkbox_label");
        checkbox_label.appendChild(_createElement("span", "", label));
        checkbox_label.appendChild(_createElement("span", "", localize(global_queue_modes[queue].vs)));
        card_checkbox.appendChild(checkbox_label);

        let checkbox_rank = _createElement("div", "checkbox_rank");
        card_checkbox.appendChild(checkbox_rank);

        if (global_queue_modes[queue].roles) {
            let card_roles = _createElement("div", "card_roles");
            let card_roles_inner = _createElement("div", "card_roles_inner");
            card_roles.appendChild(card_roles_inner);
            card_bottom.appendChild(card_roles);

            card_roles.addEventListener("click", function(ev) {
                ev.stopPropagation();
            });

            for (let role of global_queue_modes[queue].roles) {
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

    if (!data.locked) {
        card_flex.addEventListener("mouseenter", function() {
            card_flex.classList.add("hover");
            if (data.hover_button && card_text) card_text.classList.add("hover");
            _play_mouseover4();

            if (card_flex.dataset.currently_active == "false") {
                play_card_video.play();
            }
        });
        card_flex.addEventListener("mouseleave", function() {
            card_flex.classList.remove("hover");
            if (data.hover_button && card_text) card_text.classList.remove("hover");

            if (card_flex.dataset.currently_active == "false") {
                play_card_video.pause();
            }
        });
        
        card_flex.addEventListener("click", function() {
   
            let set_all_enabled = false;
            let first = true;

            if (!data.locked && data.on_click) {
                data.on_click();
            }
       
            for (let cb of card_checkboxes) {
                if (cb.classList.contains("disabled")) continue;
                if (cb.classList.contains("party_disabled")) continue;
                if (!bool_am_i_leader) continue;
                if (data.type == "quickplay" && global_mm_searching_quickplay) continue;
                if (data.type == "ranked" && global_mm_searching_ranked) continue;
                  
                let variable = cb.dataset.variable;

                if (first) {
                    if (!variable) continue;
                    let value = false;
                    let data_value = cb.dataset.enabled;
                    if (data_value && (data_value === "true" || data_value === true)) value = true;
                    value = !value;
                    set_all_enabled = value;
                    first = false;
                    
                    (set_all_enabled) ? _play_cb_check() : _play_cb_uncheck();
                }
                
                engine.call("set_bool_variable", variable, set_all_enabled);
            }
        
        });

        for (let cb of card_checkboxes) {
            let variable = cb.dataset.variable;
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

                engine.call("set_bool_variable", variable, value);
            });
        }

    }

    return card_flex;
}

class PlayCardVideo {
    constructor(style) {
        this.card = _createElement("div", "card_video");
        this.start_image = _createElement("img",   ["card_video_preview", "start"]);
        this.start_video = _createElement("video", ["card_video_clip", "start"]);
        this.loop_image  = _createElement("img",   ["card_video_preview", "loop"]);
        this.loop_video  = _createElement("video", ["card_video_clip", "loop"]);
        this.start_image.src = "/html/images/gamemode_cards/"+style+"_intro.jpg";
        this.start_video.src = "/html/images/gamemode_cards/"+style+"_intro.webm";
        this.start_video.currentTime = 1;
        this.loop_image.src  = "/html/images/gamemode_cards/"+style+"_loop.jpg";
        this.loop_video.src  = "/html/images/gamemode_cards/"+style+"_loop.webm";
        this.loop_video.currentTime = 1;
        this.loop_video.loop = true;

        this.card.appendChild(this.loop_video);
        this.card.appendChild(this.loop_image);
        this.card.appendChild(this.start_video);
        this.card.appendChild(this.start_image);

        this.state = 0;
        this.playing = false;

        this.setupListeners();
    }

    play() {
        this.playing = true;
        this.card.classList.add("playing");
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
        this.playing = false;
        this.card.classList.remove("playing");
        if (this.state == 1) {
            this.start_video.pause();
        }
        if (this.state == 2) {
            this.loop_video.pause();
        }
    }

    reset() {
        this.state = 0;
        this.start_video.style.display = "block";
        this.start_image.style.visibility = "visible";
        this.loop_image.style.visibility = "visible";
        this.start_video.currentTime = 0;
        this.loop_video.currentTime = 0;
        this.start_video.pause();
        this.loop_video.pause();
        this.playing = false;
    }

    isPlaying() {
        return this.playing;
    }

    setupListeners() {
        this.start_video.addEventListener("ended", () => {
            this.start_video.style.display = "none";
            this.state = 2;
            this.play();
        });
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
            if (is_playing) video.play();
        }
    });
}


let global_update_queue_modes_timeout = null;
function play_screen_update_cb(variable, value) {
    for (let cb of global_queue_mode_checkboxes) {

        if (cb.dataset.variable == variable) {
            cb.dataset.enabled = value ? "true" : "false";
            (cb.dataset.enabled == "true") ? enable_mode_checkbox(cb) : disable_mode_checkbox(cb);
        
            if (bool_am_i_leader) {
                // timeout in case user clicked on the card and it changes selection of multiple modes at once, don't send an update for each individual mode
                if (global_update_queue_modes_timeout != null) clearTimeout(global_update_queue_modes_timeout);
                global_update_queue_modes_timeout = setTimeout(function() {
                    update_queue_modes();
                },50);
            }

            break;
        }

    }
}

function update_queue_modes() {
    let requested_modes = [];

    for (let cb of global_queue_mode_checkboxes) {
        if (cb.dataset.locked == "false" && cb.dataset.mode.length && cb.dataset.enabled == "true") {
            requested_modes.push(cb.dataset.mode);
        }
    }

    //console.log("send party-set-modes",_dump(requested_modes));
    send_json_data({"action": "party-set-modes", "modes": requested_modes });
}

function update_queue_modes_availability() {
    for (let cb of global_queue_mode_checkboxes) {
        if (cb.classList.contains("disabled")) return;

        let cb_times =  cb.querySelector(".checkbox_times");
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
        if (global_party["modes"].includes(cb.dataset.mode)) {
            enable_mode_checkbox(cb);
            if (cb.dataset.type == "quickplay") qp_count++;
            if (cb.dataset.type == "ranked") ranked_count++;

            if ((global_mm_searching_quickplay && cb.dataset.type == "quickplay") || 
                (global_mm_searching_ranked && cb.dataset.type == "ranked")) {
                let card = cb.closest(".card_flex");
                card.dataset.currently_active = true;
                play_card_lookup[card.dataset.card_idx].play();
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

    if (data.action == "mm-match-found") {
        if (data.type == "quickplay") {
            process_queue_msg("quickplay", "found");
            process_queue_msg("ranked", "stop");
        }
        if (data.type == "ranked") {
            process_queue_msg("quickplay", "stop");
            process_queue_msg("ranked", "found");
        }
    } else if (data.action == "mm-join-match-found") {
        process_queue_msg("quickplay", "found");
        process_queue_msg("ranked", "stop");
    }
        
    if (data.maps && data.maps.length) {

        let cont = _id("draft_maps_container");
        _empty(cont);

        if (data.maps.length <= 3) {
            cont.style.setProperty("--map_row_count", 3);
        } else if (data.maps.length == 4) {
            cont.style.setProperty("--map_row_count", 2);
        } else if (data.maps.length > 4) {
            cont.style.setProperty("--map_row_count", 3);
        }

        let fragment = new DocumentFragment();
        for (let map of data.maps) {
            let map_thumbnail = _createElement("div", "map_thumbnail");
            map_thumbnail.style.backgroundImage = "url(map_thumbnails/"+map+".png)";
            map_thumbnail.dataset.map = map;

            let map_thumbnail_name = _createElement("div", "map_thumbnail_name", _format_map_name(map));
            map_thumbnail.appendChild(map_thumbnail_name);

            map_thumbnail.addEventListener("click", function() {
                _play_click1();
                _for_each_with_class_in_parent(cont, "active", function(el) {
                    el.classList.remove("active");
                });
                map_thumbnail.classList.add("active");
                map_thumbnail_name.classList.add("active");

                engine.call("draft_select_map", map);
            });
            map_thumbnail.addEventListener("mouseenter", function() {
                _play_mouseover4();
            });

            fragment.appendChild(map_thumbnail);
        }

        cont.appendChild(fragment);
    } 

    if (data.mode && data.mode in global_game_mode_map && data.mm_mode && data.mm_mode in global_queue_modes) {
        let icon_cont = _id("draft_screen_mode_icon");
        let title_cont = _id("draft_screen_mode_name");
        let text_cont = _id("draft_screen_mode_text");

        icon_cont.style.backgroundImage = "url(/html/images/gamemodes/"+data.mode+".jpg)";
        title_cont.textContent = localize(global_game_mode_map[data.mode].i18n)+" "+localize(global_queue_modes[data.mm_mode].vs);
        text_cont.textContent = localize(global_game_mode_map[data.mode].desc_i18n);
    }

    mm_match_found_overlay(data);
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

    if (data.action == "mm-match-found") cancel.dataset.type = "new-match";
    if (data.action == "mm-join-match-found") cancel.dataset.type = "join-match";

    if (data.type == "quickplay") type.textContent = localize("match_found_quickplay");
    else if (data.type == "ranked") type.textContent = localize("match_found_ranked");
    else type.textContent = localize("match_found");


    mode.textContent = localize(global_queue_modes[data.mm_mode].i18n)+" "+localize(global_queue_modes[data.mm_mode].vs);

    splash.style.display = "flex";
    
    mm_cancel_timeout = setTimeout(function() {

        if (data.action == "mm-match-found") {
            set_draft_visible(true, data);
        }
        splash.classList.add("out");
        
    }, Number(data.cancel_time) * 1000);
}

function mm_cancel_found_match(ev) {
    if (ev.currentTarget.dataset.type == "new-match") {
        send_string("party-cancel-match");
    }
    if (ev.currentTarget.dataset.type == "join-match") {
        send_string("party-cancel-join-match");
    }    
}

function handle_mm_match_cancelled() {
    if (mm_cancel_timeout) clearTimeout(mm_cancel_timeout);
    if (draft_screen_queued) clearTimeout(draft_screen_queued);
    if (countdown_interval) clearInterval(countdown_interval);
    _id("match_found_splash").classList.add("out");
    set_draft_visible(false);
}

let draft_screen_queued = undefined;
let countdown_interval = undefined;
function set_draft_visible(visible, data) {
    //console.log("set_draft_visible", visible);

    let countdown = 10;
    
    if (visible) {
        anim_show(_id("draft_screen_countdown"));
        _id("draft_screen_backbutton").style.display = "none";

        engine.call('ui_sound', "ui_transition_mapvote");

        draft_screen_queued = setTimeout(function() {
            engine.call("show_draft", true);
            set_blur(true);
            anim_show(_id("draft_screen"), window.fade_time);
            anim_hide(_id("lobby_container"), window.fade_time);

            if (data && data.mode && data.mode in global_game_mode_map && global_game_mode_map[data.mode].announce.length) {
                engine.call('ui_sound_queue', global_game_mode_map[data.mode].announce);
            }
            engine.call('ui_sound_queue', "announcer_common_menu_mapvote");

            set_draft_countdown(countdown);
            countdown--;

            countdown_interval = setInterval(function() {
                if (countdown < 0) {
                    clearInterval(countdown_interval);

                    setTimeout(function() {
                        anim_hide(_id("draft_screen_countdown"), 200, function() {
                            anim_show(_id("draft_screen_backbutton"));
                        });
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
    _html(_id("draft_screen_countdown"),countdown);
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
        if (mode in global_queue_modes) team_size = global_queue_modes[mode].team_size;

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
        let icon = renderRankIcon(best_rank, best_position, team_size, "");
        icon.addEventListener("click", function(e) {
            e.stopPropagation();
            showRankOverview();
        });
        best_cont.appendChild(icon);
    }
}

function showRankOverview() {
    open_modal_screen("rank_overview_modal_screen");
}