let global_leaderboards_data = {
    "game_mode": "r_duel",
    "friends_only": false,
    "page": 1,
    "max_per_page": 15
};

function init_screen_leaderboards() {
    /*
    _id("leaderboards_filter_friends_button").addEventListener("click", function(e) {
        if (global_menu_page != "leaderboards_screen") return;
        e.stopPropagation();

        if (global_leaderboards_data["friends_only"]) {
            global_leaderboards_data["friends_only"] = false;
            _id("leaderboards_filter_friends_button").classList.add("plain");
        } else {
            global_leaderboards_data["friends_only"] = true;
            _id("leaderboards_filter_friends_button").classList.remove("plain");
        }

        // TODO refresh leaderboards list
    });
    */

    let mode_filter = _id("leaderboards_screen_filter_gamemode");
    _empty(mode_filter);

    for (let mode in global_queue_modes) {
        if ("leaderboard" in global_queue_modes[mode] && global_queue_modes[mode].leaderboard == true) {
            let opt = _createElement("div");
            opt.dataset.value = mode;
            opt.textContent = localize(global_game_mode_map[global_queue_modes[mode].mode].i18n)+" "+global_queue_modes[mode].vs;

            if (mode == "r_duel") opt.dataset.selected = 1;
            mode_filter.appendChild(opt);
        }
    }

    ui_setup_select(mode_filter, function(opt, field) {
        global_leaderboards_data.game_mode = field.dataset.value;
        global_leaderboards_data.page = 1;
        load_leaderboard();
    });
}


function load_leaderboard() {
    // TODO
    // # get leaderboard from apiserver
    // - get own leaderboard entry from apiserver
    // # global_leaderboards_filter.game_mode
    // # global_competitive_season.comp_season_id
    let params_all = { 
        "mode": global_leaderboards_data.game_mode, 
        //"season": global_competitive_season.comp_season_id, 
        "season": 1,
        //"limit": global_leaderboards_data['max_per_page'] + 1,
        "offset": (global_leaderboards_data['page'] - 1) * global_leaderboards_data['max_per_page'],
    };
    let params_self = {
        "mode": global_leaderboards_data.game_mode, 
        //"season": global_competitive_season.comp_season_id, 
        "season": 1,
    };

    let first_pos = ((global_leaderboards_data['page'] - 1) * global_leaderboards_data["max_per_page"]) + 1;

    let leaderboards_table = _id("leaderboards_table");
    let leaderboards_bottom = _id("leaderboards_bottom");

    let requests = [
        {
            "api": global_stats_api,
            "path": "/stats/leaderboard",
            "data_key_from": "leaderboard",
            "data_key_to": "leaderboard",
            "params": params_all
        },
        {
            "api": global_stats_api,
            "path": "/users/"+global_self.user_id+"/leaderboard",
            "data_key_from": "leaderboard",
            "data_key_to": "self",
            "params": params_self
        },
    ];

    function on_success(data) {
        render_leaderboard(first_pos, data.leaderboard, data.self);
    }

    function on_timeout() {
        global_leaderboard_controls = undefined;
        _empty(leaderboards_table);
        _empty(leaderboards_bottom);
        // Show an error msg
        leaderboards_table.appendChild(_createElement("div","error",localize("error_retrieving_data")));
    }

    function on_delay() {
        global_leaderboard_controls = undefined;
        _empty(leaderboards_table);
        _empty(leaderboards_bottom);
        
        leaderboards_table.appendChild(_createSpinner());
    }

    function on_pagechange() {
        _empty(leaderboards_table);
    }

    multi_req_handler("leaderboards_screen", requests, on_success, on_delay, on_timeout, on_pagechange);

    /*
    	{
			"user_id": "76561197991305108",
			"name": "Glare",
			"country": null,
			"rating": "1682",
			"match_count": 25,
			"rank_tier": 14,
			"match_won": 23,
			"match_tied": 0,
			"match_lost": 2
        },
    */
}

var global_leaderboard_switching_page = false;
function render_leaderboard(first_pos, data, self) {
    let leaderboards_table = _id("leaderboards_table");
    _empty(leaderboards_table);

    let leaderboards_table_header = _id("leaderboards_table_header");
    let header_fragment = new DocumentFragment();
    header_fragment.appendChild(_createElement("div", ["tr", "tr_position"]));
    header_fragment.appendChild(_createElement("div", ["tr", "tr_image"]));
    let tr_player = _createElement("div", ["tr", "tr_player"]);
    tr_player.appendChild(_createElement("div", "title", localize("leaderboards_table_head_player")));
    header_fragment.appendChild(tr_player);
    let tr_division = _createElement("div", ["tr", "tr_division"]);
    tr_division.appendChild(_createElement("div", "title", localize("leaderboards_table_head_rank")));
    header_fragment.appendChild(tr_division);

    let tr_rating = _createElement("div", ["tr", "tr_rating"]);
    if (data && data.length && data[0].match_type == 3) {
        tr_rating.appendChild(_createElement("div", "title", localize("leaderboards_table_head_points")));
    } else {
        tr_rating.appendChild(_createElement("div", "title", localize("leaderboards_table_head_rating")));
    }
    header_fragment.appendChild(tr_rating);

    let tr_wins = _createElement("div", ["tr", "tr_wins"]);
    tr_wins.appendChild(_createElement("div", "title", localize("leaderboards_table_head_wins")));
    header_fragment.appendChild(tr_wins);
    let tr_matches = _createElement("div", ["tr", "tr_matches"]);
    tr_matches.appendChild(_createElement("div", "title", localize("leaderboards_table_head_matches")));
    header_fragment.appendChild(tr_matches);
    _empty(leaderboards_table_header);
    leaderboards_table_header.appendChild(header_fragment);

    let position = first_pos;
    let self_rendered = false;
    let fragment = new DocumentFragment();
    let count = 0;
    if (data && data.length) {
        for (let row of data) {
            count++;
            if (count > global_leaderboards_data['max_per_page']) break;

            if (self && "user_id" in self && row.user_id == self.user_id) {
                render_leaderboard_row(fragment, position, row, true);
                self_rendered = true;
            } else {
                render_leaderboard_row(fragment, position, row, false);
            }
            position++;
        }
    }

    if (self && "user_id" in self && self_rendered == false) {
        render_leaderboard_row(fragment, self.position, self, true);
    }

    let more_pages = false;
    if (data && data.length > global_leaderboards_data['max_per_page']) more_pages = true;

    render_leaderboard_controls(more_pages);

    leaderboards_table.appendChild(fragment);
    global_leaderboard_switching_page = false;
}

function render_leaderboard_row(target, position, data, self) {
    //console.log(_dump(data));
    let row = _createElement("div", ["row"]);
    row.dataset.userId = data.user_id;
    if (self) { row.classList.add("self"); }

    row.addEventListener("click", leaderboard_on_row_click);
    _addButtonSounds(row, 1);

    let pos = _createElement("div", ["tr", "tr_position"]);
    pos.textContent = position;
    row.appendChild(pos)

    let img = _createElement("div", ["tr", "tr_image"]);
    if (data.country) {
        let flag = _createElement("img", "flag");
        flag.src = _flagUrl(data.country);
        img.appendChild(flag);
    }
    row.appendChild(img);

    let player = _createElement("div", ["tr", "tr_player"]);
    player.textContent = data.name;
    row.appendChild(player);

    let division = _createElement("div", ["tr", "tr_division"]);
    division.appendChild(renderRankIcon(data.rank_tier, data.rank_position, undefined, "small"));
    row.appendChild(division);

    let rating = _createElement("div", ["tr", "tr_rating"]);
    rating.textContent = data.rating;
    row.appendChild(rating);

    let wins = _createElement("div", ["tr", "tr_wins"]);
    wins.textContent = data.match_wins;
    row.appendChild(wins);

    let matches = _createElement("div", ["tr", "tr_matches"]);
    matches.textContent = data.match_count;
    row.appendChild(matches);

    target.appendChild(row);
}

function leaderboard_on_row_click(e) {
    if (global_leaderboard_switching_page) return;
    if (e.currentTarget.classList.contains("self")) {
        open_player_profile("own");
    } else {
        open_player_profile(e.currentTarget.dataset.userId);
    }
}

let global_leaderboard_controls = undefined;
function render_leaderboard_controls(more_pages) {

    //console.log("global_leaderboard_controls",global_leaderboard_controls);
    if (global_leaderboard_controls != undefined) {
        if (global_leaderboards_data['page'] <= 2) {
            global_leaderboard_controls["first"].classList.add("hidden");
        } else {
            global_leaderboard_controls["first"].classList.remove("hidden");
        }
        if (global_leaderboards_data['page'] <= 1) {
            global_leaderboard_controls["prev"].classList.add("hidden");
        } else {
            global_leaderboard_controls["prev"].classList.remove("hidden");
        }
        if (!more_pages) {
            global_leaderboard_controls["next"].classList.add("hidden"); 
        } else {
            global_leaderboard_controls["next"].classList.remove("hidden"); 
        }
        if (global_leaderboards_data['page'] == 1 && !more_pages) {
            global_leaderboard_controls["count"].classList.add("hidden");
        } else {
            global_leaderboard_controls["count"].classList.remove("hidden");
        }
        _html(global_leaderboard_controls["count"], global_leaderboards_data['page']);
        return;
    }

    let cont = _id("leaderboards_bottom");
    global_leaderboard_controls = {};

    let nav = _createElement("div", "navigation");
    let btn_first = _createElement("div", ["db-btn", "plain", "nav", "first"]);
    btn_first.addEventListener("click", function(e) {
        if (!global_leaderboard_switching_page) {
            global_leaderboards_data['page'] = 1;
            load_leaderboard();
            global_leaderboard_switching_page = true;
        }
    });
    _addButtonSounds(btn_first, 1);
    nav.appendChild(btn_first);
    global_leaderboard_controls["first"] = btn_first;
    
    let btn_prev = _createElement("div", ["db-btn", "plain", "nav", "prev"]);
    btn_prev.addEventListener("click", function(e) {
        if (!global_leaderboard_switching_page) {
            global_leaderboards_data['page']--;
            if (global_leaderboards_data['page'] < 1) global_leaderboards_data['page'] = 1;
            load_leaderboard();
            global_leaderboard_switching_page = true;
        }
    });
    _addButtonSounds(btn_prev, 1);
    nav.appendChild(btn_prev);
    global_leaderboard_controls["prev"] = btn_prev;

    let page_count = _createElement("div", "leaderboards_page", global_leaderboards_data['page']);
    nav.appendChild(page_count);
    global_leaderboard_controls["count"] = page_count;

    let btn_next = _createElement("div", ["db-btn", "plain", "nav", "next"]);
    btn_next.addEventListener("click", function(e) {
        if (!global_leaderboard_switching_page) {
            global_leaderboards_data['page']++;
            load_leaderboard();
            global_leaderboard_switching_page = true;
        }
    });
    _addButtonSounds(btn_next, 1);
    nav.appendChild(btn_next);
    global_leaderboard_controls["next"] = btn_next;

    // Really just there so the other buttons are spaced out properly, but not used for now since we don't know the max page number
    let btn_last = _createElement("div", ["db-btn", "plain", "nav", "last", "hidden"]);
    nav.appendChild(btn_last);
    global_leaderboard_controls["last"] = btn_last;
    
    if (global_leaderboards_data['page'] <= 2) btn_first.classList.add("hidden");
    if (global_leaderboards_data['page'] <= 1) btn_prev.classList.add("hidden");
    if (!more_pages) btn_next.classList.add("hidden"); 

    if (global_leaderboards_data['page'] == 1 && !more_pages) page_count.classList.add("hidden");

    cont.appendChild(nav);
}