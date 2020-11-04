var global_current_player_profile_user_id = 0;
var global_current_player_profile_page = undefined;
var global_profile_data_cache = {};
var global_profile_data_cache_time = 300;

var global_profile_stats_main_avg_time_frame = 'alltime';
var global_profile_stats_main_details_avg = 'match';
var global_profile_stats_weapon_details_avg = 'match';
var global_profile_stats_weapon_details_gun = 'gun:3';

function add_to_profile_data_cache(id, type, data) {
    if (!(id in global_profile_data_cache)) global_profile_data_cache[id] = {};
    global_profile_data_cache[id][type] = {
        "ts": Date.now(),
        "data": data
    };
}
function clear_profile_data_cache() {
    let now = Date.now();
    for (let id in global_profile_data_cache) {
        for (let type in global_profile_data_cache[id]) {
            if (((now - global_profile_data_cache[id][type]["ts"]) / 1000) > global_profile_data_cache_time) {
                delete global_profile_data_cache[id][type];
            }
        }

        if (Object.keys(global_profile_data_cache[id]).length == 0) {
            delete global_profile_data_cache[id];
        }
    }
}

function clear_profile_data_cache_id(id) {
    if (id in global_profile_data_cache) {
        delete global_profile_data_cache[id];
    }
}

function clear_player_profile() {
    let cont = _id("player_profile_content");
    if (global_profile_nav && global_profile_nav.parentNode) {
        global_profile_nav.parentNode.removeChild(global_profile_nav);
        global_profile_nav = undefined;
    }

    _for_each_with_selector_in_parent(cont, ".page", function(page_content) {
        page_content.parentNode.removeChild(page_content);
    });
}

function player_profile_load_page(page) {
    load_player_profile("player_profile_screen", page, global_current_player_profile_user_id);
}

function player_profile_set_eggbot_preview(customizations) {
    engine.call("on_show_customization_screen", true);
    engine.call("set_stage_map_camera", ITEM_PREVIEW_CAMERAS.eggbot_profile);
    engine.call("reset_locker_agent_rotation");
    if ("shell" in customizations) {
        engine.call("set_preview_shell", customizations.shell);
    } else {
        engine.call("set_preview_shell", "");
    }

    if ("sh_l" in customizations) {
        engine.call("set_preview_shoe", "l", customizations.sh_l);
    } else {
        engine.call("set_preview_shoe", "l", "");
    }

    if ("sh_r" in customizations) {
        engine.call("set_preview_shoe", "r", customizations.sh_r);
    } else {
        engine.call("set_preview_shoe", "r", "");
    }

    if ("sticker" in customizations) {
        engine.call("set_player_decals_override", true, customizations.sticker);
    } else {
        engine.call("set_player_decals_override", true, "");
    }

    if ("color" in customizations) {
        engine.call("set_player_color_override", true, customizations.color);
    } else {
        engine.call("set_player_color_override", true, "cccccc");
    }
}

let global_profile_nav = undefined;
function load_player_profile(origin, page, id) {
    // Render & show empty page
    // Send API request / Check cache
    // On Success render API data
    // On Error render Error

    clear_profile_data_cache();

    historyPushState({
        "page": "player_profile_screen",
        "subpage": page,
        "id": id
    });

    if (!id.length || id.trim().length == 0) {
        console.log("WARNING - tried loading user profile without user_id");
        return;
    }

    let cont = _id("player_profile_content");

    // If the page has already been loaded, just make sure the eggbot preview gets updated again
    if (global_current_player_profile_user_id == id && global_current_player_profile_page == page && id in global_profile_data_cache) {
        if (page == "profile") {
            if (_check_nested(global_profile_data_cache[id], "main", "data", "customizations")) {
                player_profile_set_eggbot_preview(global_profile_data_cache[id].main.data.customizations);
            } else {
                player_profile_set_eggbot_preview({});
            }
        }
        return;
    }

    // Check if the new user id is different from the previous
    if (global_current_player_profile_user_id != id) {
        global_current_player_profile_user_id = id;

        if (global_profile_nav) {
            _remove_node(global_profile_nav);
            global_profile_nav = undefined;
        }

        _for_each_with_selector_in_parent(cont, ".page", function(page_content) {
            _remove_node(page_content);
        });
    }

    if (global_current_player_profile_page != page) {
        global_current_player_profile_page = page;

        let prev = _id("player_profile_nav").querySelector(".active");
        if (prev) prev.classList.remove("active");

        let newlink = _id("player_profile_nav").querySelector("."+global_current_player_profile_page);
        if (newlink) newlink.classList.add("active");
    }

    _for_each_with_selector_in_parent(cont, ".page", function(page_content) {
        page_content.classList.add("anim_out");
        page_content.addEventListener("animationend", function(e) {
            // for some (to me) unknown reason this event fires twice every time
            if (page_content.parentNode) page_content.parentNode.removeChild(page_content);
        });
    });


    if (origin != "player_profile_screen") {
        clear_player_profile();
    }

    let header_data = { "name": "" };
    if (_check_nested(global_profile_data_cache, id, "main")) {
        header_data = global_profile_data_cache[id].main.data;
    }

    // Render page specific placeholder content so we can immediately switch to the page
    let page_cont = _createElement("div", [page, "page", "anim_in"]);
    let head = player_profile_render_head(header_data, true);
    page_cont.appendChild(head);
    page_cont.appendChild(player_profile_render_placeholder(page));

    cont.appendChild(page_cont);

    engine.call("on_show_customization_screen", true);
    engine.call("set_stage_map_camera", ITEM_PREVIEW_CAMERAS.empty);

    // Fetch the requested data from the API
    let requests = [];
    
    if (!_check_nested(global_profile_data_cache, id, "main")) {
        requests.push({
            "path": "/users/"+id,
            "data_key_to": "main",
            "params": {}
        });
    }

    if (page == "profile") {
        if (!_check_nested(global_profile_data_cache, id, "mainstats")) {
            requests.push({
                    "path": "/users/"+id+"/mainstats",
                    "data_key_to": "mainstats",
                    "params": { "for": "alltime" }
            });
        }
        if (!_check_nested(global_profile_data_cache, id, "mmr")) {
            requests.push({
                    "path": "/users/"+id+"/rating",
                    "data_key_from": "ratings",
                    "data_key_to": "mmr",
                    "params": {},
            });
        }
        if (!_check_nested(global_profile_data_cache, id, "last_match")) {
            requests.push({
                    "path": "/users/"+id+"/match",
                    "data_key_to": "last_match",
                    "params": { "for": "last" }
            });
        }
    }

    if (page == "matches") {
        if (!_check_nested(global_profile_data_cache, id, "matches")) {
            requests.push({
                    "path": "/users/"+id+"/matches",
                    "data_key_from": "matches",
                    "data_key_to": "matches",
                    "params": { "limit": 15 }
            });
        }
    }

    if (page == "stats") {
        if (!_check_nested(global_profile_data_cache, id, "stats")) {
            requests.push({
                    "path": "/users/"+id+"/stats",
                    "data_key_to": "stats",
                    "params": { }
            });
        }
    }

    if (page == "achievements") {
        if (!_check_nested(global_profile_data_cache, id, "achievements")) {
            requests.push({
                    "path": "/users/"+id+"/achievements",
                    "data_key_from": "achievements",
                    "data_key_to": "achievements",
                    "params": { }
            });
        }
    }

    function on_success(data) {
        for (let key of Object.keys(data)) {
            add_to_profile_data_cache(id, key, data[key]);
        }

        render_player_profile_page(id, page, page_cont);

    }

    function on_timeout() {
        // Show error instead of the spinner
        let placeholder = page_cont.querySelector(".placeholder_cont");
        if (placeholder) {
            _empty(placeholder);
            placeholder.appendChild(_createElement("div", ["page", "no_data"], localize("error_retrieving_data")));
        }
    }
    function on_delay() {}
    function on_pagechange() {}

    multi_req_handler("player_profile_screen", requests, on_success, on_delay, on_timeout, on_pagechange);
}



function player_profile_render_placeholder(page) {
    let fragment = new DocumentFragment();
    if (page == "profile") {
        fragment.appendChild(_createElement("div", "summary_top"));
        let profile_spinner = _createElement("div", ["placeholder_cont", "profile_spinner"]);
        profile_spinner.appendChild(_createSpinner());
        fragment.appendChild(profile_spinner);
    }

    if (page == "matches") {
        let matches_spinner = _createElement("div", ["placeholder_cont", "matches_spinner"]);
        matches_spinner.appendChild(_createSpinner());
        fragment.appendChild(matches_spinner);
    }

    if (page == "stats") {
        fragment.appendChild(_createElement("div", "control_bar"));
        let stats_spinner = _createElement("div", ["placeholder_cont", "stats_spinner"]);
        stats_spinner.appendChild(_createSpinner());
        fragment.appendChild(stats_spinner);
    }

    if (page == "achievements") {
        let stats_spinner = _createElement("div", ["placeholder_cont", "achievements_spinner"]);
        stats_spinner.appendChild(_createSpinner());
        fragment.appendChild(stats_spinner);
    }

    return fragment;
}

function render_player_profile_page(id, page, page_cont) {
    // API returned no data for the user, show "User does not yet have a Diabotical profile" message
    if (global_profile_data_cache[id].main.data.user_id === undefined) {
        let placeholder = page_cont.querySelector(".placeholder_cont");
        if (placeholder) {
            _empty(placeholder);
            placeholder.appendChild(_createElement("div", ["page", "no_data"], localize("player_profile_no_profile")));
        }
        return;
    }

    // Render the actual page data
    _empty(page_cont);
    if (page == "profile")      page_cont.appendChild(player_profile_render_main(global_profile_data_cache[id]));
    if (page == "matches")      page_cont.appendChild(player_profile_render_matches(global_profile_data_cache[id]));
    if (page == "stats")        page_cont.appendChild(player_profile_render_stats(global_profile_data_cache[id])); 
    if (page == "achievements") page_cont.appendChild(player_profile_render_achievements(global_profile_data_cache[id])); 
}

/*
function player_profile_render_nav(page) {
    let nav = _createElement("div", "nav");

    let targets = ["profile", "matches", "stats", "achievements"];

    let count = 0;
    for (let target of targets) {
        let link = _createElement("div", "navlink");
        link.innerHTML = localize("player_profile_nav_"+target);
        if (target == page) {
            link.classList.add("active");
        }
        let user_id = global_current_player_profile_user_id;
        link.addEventListener("click", function(e) {
            if (link.classList.contains("active")) return;
            link.closest(".nav").querySelector(".navlink.active").classList.remove("active");
            link.classList.add("active");
            load_player_profile("player_profile_screen", target, user_id);
        });

        _addButtonSounds(link, 1);
        nav.appendChild(link);

        count++;
        if (count < targets.length) {
            let separator = _createElement("div", "separator");
            separator.innerHTML = "/";
            nav.appendChild(separator);
        }
    }

    return nav;
}
*/

function player_profile_render_head(data, simple) {

    let head = _createElement("div", "head");
    
    let avatar = _createElement("div", "avatar");
    avatar.style.backgroundImage = "url("+_avatarUrl(data.avatar)+")";
    head.appendChild(avatar);

    if (data.name) {
        let name = _createElement("div", "name");
        name.textContent = data.name;
        head.appendChild(name);
    }

    if (data.country) {
        let flag = _createElement("img", "flag");
        flag.src = _flagUrl(data.country)
        head.appendChild(flag);
    }

    if (!simple) {
        head.appendChild(_createElement("div", "separator"));

        /*
        if (data.user_id != global_self.user_id && global_friends_user_ids.includes(data.user_id)) {
            let msg_friend = _createElement("div", ["btn","msg_friend","tooltip2"]);
            msg_friend.dataset.msgId = "friends_list_label_msg_friend";
            add_tooltip2_listeners(msg_friend);
            head.appendChild(msg_friend);
        }
        */
        
        let show_add_button = true;
        if (data.user_id == global_self.user_id) show_add_button = false;
        if (global_friends.hasOwnProperty(data.user_id) && global_friends[data.user_id].masterfriend) show_add_button = false;

        if (show_add_button) {
            let add_friend = _createElement("div", ["btn","add_friend","tooltip2"]);
            add_friend.dataset.msgId = "friends_list_action_friend_request";
            add_tooltip2_listeners(add_friend);
            _addButtonSounds(add_friend, 1);
            head.appendChild(add_friend);

            add_friend.addEventListener("click", function() {
                send_string(CLIENT_COMMAND_SEND_FRIEND_REQUEST, data.user_id);
                anim_hide(add_friend);
            });
        }
        
    }

    return head;
}

// ====================================================
// MAIN PROFILE
function player_profile_render_main(data) {

    //console.log("main profile data", _dump(data));

    if (global_current_player_profile_page == "profile") {
        if (_check_nested(data, "main", "data", "customizations")) {
            player_profile_set_eggbot_preview(data.main.data.customizations);
        } else {
            player_profile_set_eggbot_preview({});
        }
    }

    let alltime_combined = {
        "match_count": 0,
        "match_won": 0,
        "time_played": 0,
        "commends": 0,
    };
    let most_played = false;
    let most_played_count = 0;
    if (_check_nested(data, "mainstats", "data") && Array.isArray(data.mainstats.data)) {
        for (let stats of data.mainstats.data) {
            if (stats.match_mode == "") {
                alltime_combined = stats;
                continue;
            }
            if (stats.match_count > parseInt(most_played_count)) {
                most_played = stats;
                most_played_count = parseInt(stats.match_count);
            }
        }
    }

    let highest_rank = false;
    let highest_rank_data = undefined;
    if (_check_nested(data, "mmr", "data") && Array.isArray(data.mmr.data)) {
        if (data.mmr.data.length) {
            highest_rank = true;
            highest_rank_data = data.mmr.data[0];
        }
    }

    let cont = new DocumentFragment();
    cont.appendChild(player_profile_render_head(data.main.data, false));

    let stats = ["games", "commends", "time_played", "level"];
    let summary_top = _createElement("div", "summary_top");

    // For css width of each stat div:
    summary_top.style.setProperty("--stat_count", stats.length);

    for (let i=0; i<stats.length; i++) {
        let summary_stat = _createElement("div", "stat");
        
        if (i != (stats.length - 1)) {
            summary_stat.classList.add("separator");
        }

        let summary_stat_label = _createElement("div", "label");
        if (stats[i] == "games")       summary_stat_label.textContent = localize("player_profile_label_games");
        if (stats[i] == "wins")        summary_stat_label.textContent = localize("player_profile_label_wins");
        if (stats[i] == "time_played") summary_stat_label.textContent = localize("player_profile_label_time_played");
        if (stats[i] == "level")       summary_stat_label.textContent = localize("player_profile_label_account_level");
        if (stats[i] == "commends")    summary_stat_label.textContent = localize("player_profile_label_commends");
        summary_stat.appendChild(summary_stat_label);

        let summary_stat_value = _createElement("div", "value");
        if (stats[i] == "games")       summary_stat_value.textContent = alltime_combined.match_count;
        if (stats[i] == "wins")        summary_stat_value.textContent = alltime_combined.match_won;
        if (stats[i] == "time_played") summary_stat_value.textContent = _seconds_to_string(alltime_combined.time_played);
        if (stats[i] == "level")       summary_stat_value.textContent = data.main.data.level;
        if (stats[i] == "commends")    summary_stat_value.textContent = alltime_combined.commends;
        summary_stat.appendChild(summary_stat_value);

        summary_top.appendChild(summary_stat);
    }
    cont.appendChild(summary_top);


    //let featured_topics = ["rank", "battlepass", "trophies"];
    let featured_topics = ["rank", "battlepass"];
    let summary_featured = _createElement("div", "summary_featured");
    

    // ==========================================================
    // HIDE FOR NOW since nothing in there is currently available
    //summary_featured.style.display = "none";
    // ==========================================================

    
    // For css width of each featured div:
    summary_featured.style.setProperty("--featured_count", featured_topics.length);

    for (let i=0; i<featured_topics.length; i++) {
        let featured = _createElement("div", "featured");
        if (i == 0) featured.classList.add("first");
        if (i == featured_topics.length - 1) featured.classList.add("last");
        let label = _createElement("div", "label");
        if (featured_topics[i] == "rank")       label.textContent = localize("player_profile_label_highest_rank");
        if (featured_topics[i] == "battlepass") label.textContent = localize("battlepass");
        if (featured_topics[i] == "trophies")   label.textContent = localize("player_profile_label_trophies");
        featured.appendChild(label);

        let content = _createElement("div", "content");
        if (featured_topics[i] == "rank") {
            featured.classList.add("rank");
            featured.addEventListener("mouseenter", _play_mouseover4);
            featured.addEventListener("click", function() {
                open_user_ratings_modal(data.main.data.name, global_current_player_profile_user_id);
            });

            if (highest_rank) {
                // render rank with mode name and games played
                content.appendChild(renderRankIcon(highest_rank_data.rank_tier, highest_rank_data.rank_position));
                let rank_name = _createElement("div", "rank_name");
                rank_name.appendChild(getRankName(highest_rank_data.rank_tier, highest_rank_data.rank_position));
                content.appendChild(rank_name);

                if (highest_rank_data.mode_name in global_queues) {
                    content.appendChild(_createElement("div", "rank_mode_name", global_queues[highest_rank_data.mode_name].queue_name));
                }
            } else {
                // render weeball in a cardboard box without extra info
                content.appendChild(renderRankIcon(0, null));
                let rank_name = _createElement("div", "rank_name");
                rank_name.appendChild(_createElement("div", "", localize("rank_unranked")));
                content.appendChild(rank_name);
                
            }
        }
        if (featured_topics[i] == "battlepass") {
            if (data.main.data.active_battlepass_id) {
                // render battlepass
                let level_icon = _createElement("div", "bp_level_icon");
                level_icon.textContent = data.main.data.battlepass_level;
                if (data.main.data.battlepass_owned) {
                    level_icon.classList.add("paid");
                }
                content.appendChild(level_icon);
                content.appendChild(_createElement("div", "bp_title", localize(global_battlepass_data[data.main.data.active_battlepass_id].title)));
            }
        }
        if (featured_topics[i] == "trophies") {}
        
        featured.appendChild(content);

        summary_featured.appendChild(featured);
    }
    cont.appendChild(summary_featured);

    if (most_played) {
        let most_played_mode = _createElement("div", "most_played_mode");
        cont.appendChild(most_played_mode);

        let most_played_head = _createElement("div", "box_head");
        most_played_mode.appendChild(most_played_head);
        most_played_head.appendChild(_createElement("div", "label", localize("player_profile_label_most_played_mode")));

        let most_played_cont = _createElement("div", "box_cont");
        most_played_mode.appendChild(most_played_cont);
    
        let icon = _createElement("div", "mode_icon");
        icon.style.backgroundImage = "url("+global_game_mode_map[most_played.match_mode].icon+"?s=8)";
        most_played_cont.appendChild(icon);
        
        let mode_name = _createElement("div", "mode_name");
        mode_name.textContent = localize(global_game_mode_map[most_played.match_mode].i18n);
        most_played_cont.appendChild(mode_name);

        let stats_list = ["games", "wins", "kdr", "time_played"];
        let stats = _createElement("div", "stats");
        let row1 = _createElement("div", "row");
        let row2 = _createElement("div", "row");
        for (let i=0; i<stats_list.length; i++) {
            let stat_div = _createElement("div", "stat");
            let stat_label = _createElement("div", "stat_label");
            if (stats_list[i] == "games")       stat_label.textContent = localize("player_profile_label_games");
            if (stats_list[i] == "wins")        stat_label.textContent = localize("player_profile_label_wins");
            if (stats_list[i] == "kdr")         stat_label.textContent = localize("player_profile_label_kdr");
            if (stats_list[i] == "time_played") stat_label.textContent = localize("player_profile_label_time_played");
            stat_div.appendChild(stat_label);

            let stat_value = _createElement("div", "stat_value");
            if (stats_list[i] == "games")       stat_value.textContent = most_played.match_count;
            if (stats_list[i] == "wins")        stat_value.textContent = most_played.match_won;
            if (stats_list[i] == "kdr")         stat_value.textContent = (most_played.deaths == 0) ? most_played.frags : _round((most_played.frags / most_played.deaths),1);
            if (stats_list[i] == "time_played") stat_value.textContent = _seconds_to_string(most_played.time_played);
            stat_div.appendChild(stat_value);
            if (i < 2) row1.appendChild(stat_div);
            else row2.appendChild(stat_div);
        }
        stats.appendChild(row1);
        stats.appendChild(row2);
        most_played_cont.appendChild(stats);
    }
    

    if ("match" in data.last_match.data) {
        let last_match = _createElement("div", "last_match");
        last_match.dataset.matchId = data.last_match.data.match.match_id;
        last_match.addEventListener("mouseenter", _play_mouseover4);
        last_match.addEventListener("click", player_profile_on_match_select);

        let match = data.last_match.data.match;
        let seconds_since = (new Date - new Date(match.finish_ts)) / 1000;

        let result = "?";
        let placement = -1;
        for (let t of match.teams) {
            if (t.team_idx == match.user_team_idx) {
                if (match.hasOwnProperty("finished") && match.finished == false) {
                    result = localize("match_forfeit");
                } else if (t.placement == 0) {
                    result = localize("match_win");
                    placement = t.placement;
                } else if (t.placement == 254) {
                    result = localize("match_forfeit");
                } else {
                    placement = t.placement;
                    result = (t.placement + 1) +".";
                }
            }
        }

        let last_match_head = _createElement("div", "box_head");
        last_match.appendChild(last_match_head);
        last_match_head.appendChild(_createElement("div", "label", localize("player_profile_label_last_match")));
        last_match_head.appendChild(_createElement("div", "time", localize_ext("time_ago", { "time": _seconds_to_string(seconds_since)})));

        let last_match_cont = _createElement("div", "box_cont");
        last_match.appendChild(last_match_cont);

        let mode_icon = _createElement("div", "mode_icon");
        if (global_game_mode_map.hasOwnProperty(match.match_mode)) mode_icon.style.backgroundImage = "url("+global_game_mode_map[match.match_mode].icon+"?s=8)";
        last_match_cont.appendChild(mode_icon);

        let mode_name = _createElement("div", "mode_name");
        if (global_game_mode_map.hasOwnProperty(match.match_mode)) mode_name.textContent = localize(global_game_mode_map[match.match_mode].i18n);
        last_match_cont.appendChild(mode_name);

        let avg_acc = 0;
        if (match.hasOwnProperty("stats") && match.stats.hasOwnProperty(GLOBAL_ABBR.STATS_KEY_WEAPONS)) {
            let sf = 0;
            let sh = 0;
            for (let w of match.stats[GLOBAL_ABBR.STATS_KEY_WEAPONS]) {
                if (w.hasOwnProperty(GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED)) sf += w[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED];
                if (w.hasOwnProperty(GLOBAL_ABBR.STATS_KEY_SHOTS_HIT)) sh += w[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT];
            }

            if (sf > 0) {
                avg_acc = Math.round(sh / sf * 100);
            }
        }

        let stats_list = ["kda", "acc", "match_time", "result"];
        let stats = _createElement("div", "stats");
        let row1 = _createElement("div", "row");
        let row2 = _createElement("div", "row");
        for (let i=0; i<stats_list.length; i++) {
            let stat_div = _createElement("div", "stat");
            let stat_label = _createElement("div", "stat_label");
            //if (stats_list[i] == "time")       stat_label.textContent = localize("player_profile_label_date");
            if (stats_list[i] == "kda")        stat_label.textContent = localize("player_profile_label_kda");
            if (stats_list[i] == "acc")        stat_label.textContent = localize("player_profile_label_accuracy");
            if (stats_list[i] == "match_time") stat_label.textContent = localize("player_profile_label_length");
            if (stats_list[i] == "result")     stat_label.textContent = localize("player_profile_label_result");
            stat_div.appendChild(stat_label);

            let stat_value = _createElement("div", "stat_value");
            //if (stats_list[i] == "time")       stat_value.textContent = localize_ext("time_ago", { "time": _seconds_to_string(seconds_since)});            
            if (stats_list[i] == "kda") {
                if (Object.keys(match.stats).length) {
                    stat_value.textContent = match.stats[GLOBAL_ABBR.STATS_KEY_FRAGS]+"/"+match.stats[GLOBAL_ABBR.STATS_KEY_DEATHS]+"/"+match.stats[GLOBAL_ABBR.STATS_KEY_ASSISTS];
                } else {
                    stat_value.textContent = "0/0/0";
                }
            }
            if (stats_list[i] == "acc")        stat_value.textContent = avg_acc + "%";
            if (stats_list[i] == "match_time") stat_value.textContent = _seconds_to_digital(match.match_time);
            if (stats_list[i] == "result") {
                stat_value.textContent = result;
                stat_value.classList.add("result");
                if (placement == 0) stat_value.classList.add("win");
            }
            stat_div.appendChild(stat_value);
            if (i < 2) row1.appendChild(stat_div);
            else row2.appendChild(stat_div);
        }
        stats.appendChild(row1);
        stats.appendChild(row2);
        last_match_cont.appendChild(stats);
        
        cont.appendChild(last_match);
    }

    return cont;
}

function open_user_ratings_modal(name, user_id) {

    let fragment = new DocumentFragment();
    let cont = _createElement("div", "user_ratings");
    cont.appendChild(_createElement("div", "title", localize_ext("player_profile_ranks_title", {"name": name})));
    let rating_cont = _createElement("div", "ratings");
    cont.appendChild(rating_cont);
    fragment.appendChild(cont);

    let buttons = _createElement("div", "generic_modal_dialog_action");
    let close = _createElement("div", "dialog_button", localize("modal_close"));
    close.addEventListener("click", function() {
        closeBasicModal();
    });
    buttons.appendChild(close);
    fragment.appendChild(buttons);

    if (!_check_nested(global_profile_data_cache, user_id, "mmrs")) {
        rating_cont.appendChild(_createSpinner());
        api_request("GET", "/users/"+user_id+"/ratings", {}, function(data) {
            _empty(rating_cont);
            if (data.hasOwnProperty("ratings")) {
                if (!global_profile_data_cache.hasOwnProperty(user_id)) global_profile_data_cache[user_id] = {};
                global_profile_data_cache[user_id]["mmrs"] = data.ratings;

                rating_cont.appendChild(render_user_ratings_content(global_profile_data_cache[user_id].mmrs));                
            } else {
                rating_cont.appendChild(render_user_ratings_content([]));
            }
        });
    } else {
        rating_cont.appendChild(render_user_ratings_content(global_profile_data_cache[user_id].mmrs));
    }

    openBasicModal(fragment);
}

function render_user_ratings_content(ratings) {
    let rating_lookup = {};
    for (let r of ratings) {
        rating_lookup[r.mode_name] = r;
    }

    let esports_queues = [];
    let team_queues = [];
    let arena_queues = [];
    for (let mode in global_queues) {
        if ("ranked" in global_queues[mode] && global_queues[mode].ranked == true) {
            if (global_queues[mode].locked) continue;

            if (mode.startsWith("r_ca") || mode.startsWith("r_rocket_arena") || mode.startsWith("r_shaft_arena")) {
                arena_queues.push(mode);
            } else if (mode === "r_wo") {
                team_queues.push(mode);
            } else {
                esports_queues.push(mode);
            }
        }
    }

    let fragment = new DocumentFragment();

    for (let cat of ["esports", "team", "arena"]) {
        let queues = [];
        if (cat == "esports") queues = esports_queues;
        if (cat == "team") queues = team_queues;
        if (cat == "arena") queues = arena_queues;

        for (let queue of queues) {
            let rating = _createElement("div", "rating");
            rating.appendChild(_createElement("div", "mode_name", global_queues[queue].queue_name));

            if (queue in rating_lookup && rating_lookup[queue].rank_tier !== null) {
                rating.appendChild(renderRankIcon(rating_lookup[queue].rank_tier, rating_lookup[queue].rank_position));
                let rank_name = _createElement("div", "rank_name");
                rank_name.appendChild(getRankName(rating_lookup[queue].rank_tier, rating_lookup[queue].rank_position));
                rating.appendChild(rank_name);

                if (rating_lookup[queue].hasOwnProperty("rating")) {
                    let skill_rating_cont = _createElement("div", "skill_rating_cont");
                    skill_rating_cont.appendChild(_createElement("div", "skill_rating", Math.floor(rating_lookup[queue].rating)));
                    skill_rating_cont.appendChild(_createElement("div", "unit", "SR"));
                    rating.appendChild(skill_rating_cont);
                }
            } else {
                rating.appendChild(renderRankIcon(0, null, global_queues[queue].team_size));
                let rank_name = _createElement("div", "rank_name");
                rank_name.appendChild(_createElement("div", "", localize("rank_unranked")));
                rating.appendChild(rank_name);
            }

            fragment.appendChild(rating);
        }
    }

    return fragment;
}

// ====================================================
// MATCHES
function player_profile_render_matches(data) {

    let cont = new DocumentFragment();
    cont.appendChild(player_profile_render_head(data.main.data, true));

    let matches_head = _createElement("div", "matches_head");
    matches_head.appendChild(_createElement("div", ["td", "td_map"],      localize("player_profile_label_map")));
    matches_head.appendChild(_createElement("div", ["td", "td_datetime"], localize("player_profile_label_date")));
    matches_head.appendChild(_createElement("div", ["td", "td_mode"],     localize("player_profile_label_game_mode")));
    matches_head.appendChild(_createElement("div", ["td", "td_length"],   localize("player_profile_label_length")));
    matches_head.appendChild(_createElement("div", ["td", "td_kda"],      localize("player_profile_label_kda")));
    matches_head.appendChild(_createElement("div", ["td", "td_result"],   localize("player_profile_label_result")));
    cont.appendChild(matches_head);

    // Render content scroll container   
    let scroll_outer = _createElement("div", "scroll-outer");
    let scroll_bar = _createElement("div", "scroll-bar");
    scroll_bar.appendChild(_createElement("div", "scroll-thumb"));
    scroll_outer.appendChild(scroll_bar);
    let scroll_inner = _createElement("div", "scroll-inner");
    scroll_outer.appendChild(scroll_inner);

    new Scrollbar(scroll_outer, global_scrollbarTrackerId++, true);

    cont.appendChild(scroll_outer);

    for (let i=0; i<data.matches.data.length; i++) {
        let m = data.matches.data[i];

        let result_text = '';
        let placement = -1;
        if (m.hasOwnProperty("finished") && m.finished == false) {
            result_text = localize("match_forfeit");
        } else if (m.team_placement == 0) {
            placement = 0;
            result_text = localize("match_win");
        } else if (m.team_placement == 254) {
            result_text = localize("match_forfeit");
        } else {
            placement = m.team_placement;
            result_text = (m.team_placement + 1) + ".";
        }

        let match_row = _createElement("div", "row");
        match_row.dataset.matchId = m.match_id;
        if (i % 2 == 0) {
            match_row.classList.add("odd");
        }
        match_row.addEventListener("mouseenter", _play_mouseover4);
        match_row.addEventListener("click", player_profile_on_match_select);
        if (placement == 0) match_row.classList.add("win");

        let th_map = _createElement("div", ["td", "td_map"]);
        let map_gradient = _createElement("div", "map_gradient");
        map_gradient.style.backgroundImage = 'url(map_thumbnails/'+m.match_map+'.png)';
        th_map.appendChild(map_gradient);
        th_map.appendChild(_createElement("div", "map_name", _format_map_name(m.match_map)));
        match_row.appendChild(th_map);

        let th_datetime = _createElement("div", ["td", "td_datetime"], _to_readable_timestamp(m.finish_ts));
        match_row.appendChild(th_datetime);

        let th_mode = _createElement("div", ["td", "td_mode"]);
        if (m.match_mode in global_game_mode_map) {
            th_mode.textContent = localize(global_game_mode_map[m.match_mode].i18n);
        } else {
            th_mode.textContent = m.match_mode;
        }
        match_row.appendChild(th_mode);

        let th_length = _createElement("div", ["td", "td_length"], _seconds_to_digital(m.match_time));
        match_row.appendChild(th_length);

        let th_kda = _createElement("div", ["td", "td_kda"]);
        if (m.stats && GLOBAL_ABBR.STATS_KEY_FRAGS in m.stats && GLOBAL_ABBR.STATS_KEY_FRAGS in m.stats && GLOBAL_ABBR.STATS_KEY_ASSISTS in m.stats) {
            th_kda.textContent = m.stats[GLOBAL_ABBR.STATS_KEY_FRAGS]+" / "+m.stats[GLOBAL_ABBR.STATS_KEY_DEATHS]+" / "+m.stats[GLOBAL_ABBR.STATS_KEY_ASSISTS];
        }
        match_row.appendChild(th_kda);

        let th_result = _createElement("div", ["td", "td_result"], result_text);
        if (placement == 0) th_result.classList.add("win");
        match_row.appendChild(th_result);

        scroll_inner.appendChild(match_row);
    }

    return cont;
}

let global_profile_match_clicked = false;
function player_profile_on_match_select(e) {
    if (!global_profile_match_clicked) {
        _play_click1();
        open_match(e.currentTarget.dataset.matchId);
        global_profile_match_clicked = true;

        setTimeout(function() {
            global_profile_match_clicked = false;
        },300);
    }
}

// ====================================================
// STATS
function player_profile_render_stats(data) {
    let stats_main = prepareUserStats(data.main.data.name, data.stats.data);
    let stats_compare = null;

    let stats_type = "profile"; // "profile" or "compare"
    let selected_mode = "total";
    let selected_map = "total";

    let cont = new DocumentFragment();
    cont.appendChild(player_profile_render_head(data.main.data, true));

    let ctrl = _createElement("div", "control_bar");
    cont.appendChild(ctrl);

    // ================
    // Mode Select
    // ================

    let ctrl_cont_mode = _createElement("div", "select_cont");
    ctrl.appendChild(ctrl_cont_mode);
    ctrl_cont_mode.appendChild(_createElement("div", "label", localize("mode")));
    let ctrl_mode_select = _createElement("div", "select-field");
    ctrl_mode_select.dataset.theme = "gray2";
    ctrl_cont_mode.appendChild(ctrl_mode_select);

    let opt_all = _createElement("div");
    opt_all.dataset.value = "total";
    opt_all.textContent = localize("all_modes");
    opt_all.dataset.selected = 1;
    ctrl_mode_select.appendChild(opt_all);

    //ctrl_mode_select.appendChild(_createElement("div", "select-category", localize("modes")));
    /*
    for (let mode of Object.keys(global_game_mode_map)) {
        if (!global_game_mode_map[mode].enabled) continue;
        let opt = _createElement("div");
        opt.dataset.value = mode;
        opt.textContent = localize(global_game_mode_map[mode].i18n);
        ctrl_mode_select.appendChild(opt);
    }
    */

    let qp_queues = Object.keys(global_queues).filter(m => global_queues[m].match_type == MATCH_TYPE_QUICKPLAY);
    let r_queues = Object.keys(global_queues).filter(m => global_queues[m].match_type == MATCH_TYPE_RANKED);
    
    for (let match_type of ["quickplay", "ranked"]) {
        let queue_list = [];
        if (match_type == "quickplay") {
            ctrl_mode_select.appendChild(_createElement("div", "select-category", localize("quickplay_queues")));
            queue_list = qp_queues;
        }
        if (match_type == "ranked") {
            ctrl_mode_select.appendChild(_createElement("div", "select-category", localize("ranked_queues")));
            queue_list = r_queues;
        }
        for (let queue of queue_list) {
            if (global_queues[queue].locked) continue;

            if (global_queues[queue].modes.length > 1) {
                for (let mode of global_queues[queue].modes) {
                    let opt = _createElement("div");
                    opt.dataset.value = mode.queue_name+"-"+mode.mode_name;
                    opt.textContent = global_queues[queue].queue_name + " - " + localize(global_game_mode_map[mode.mode_name].i18n);
                    ctrl_mode_select.appendChild(opt);
                }
            } else if (global_queues[queue].modes.length == 1) {
                let opt = _createElement("div");
                opt.dataset.value = global_queues[queue].modes[0].queue_name+"-"+global_queues[queue].modes[0].mode_name;
                opt.textContent = global_queues[queue].queue_name;
                ctrl_mode_select.appendChild(opt);
            }
        }
    }

    // ================
    // Map Select
    // ================

    /*
    let ctrl_cont_map = _createElement("div", "select_cont");
    ctrl.appendChild(ctrl_cont_map);
    ctrl_cont_map.appendChild(_createElement("div", "label", localize("map")));
    let ctrl_map_select = _createElement("div", "select-field");
    ctrl_map_select.dataset.theme = "gray2";
    ctrl_cont_map.appendChild(ctrl_map_select);

    ctrl_cont_map.style.display = "none";
    */

    // ==============================
    // Setup selection list listeners
    // ==============================
    setup_select(ctrl_mode_select, function(field_element, el) {
        selected_mode = field_element.dataset.value;
        player_profile_render_stats_content(scroll_inner, stats_type, selected_mode, selected_map, stats_main, stats_compare);

        /*
        if (selected_mode == "all") {
            // Hide map selection list options
            ctrl_cont_map.style.display = "none";
            selected_map = "all";
        } else {
            // Show and update map selection list options
            let map_list = player_profile_stats_extract_map_list("alltime", selected_mode, stats);

            _empty(ctrl_map_select);

            let opt_all_maps = _createElement("div");
            opt_all_maps.dataset.value = "total";
            opt_all_maps.textContent = localize("all_maps");
            opt_all_maps.dataset.selected = 1;
            ctrl_map_select.appendChild(opt_all_maps);

            for (let map of map_list) {
                let opt_map = _createElement("div");
                opt_map.dataset.value = map;
                opt_map.textContent = _format_map_name(map.substring(4));
                ctrl_map_select.appendChild(opt_map);
            }

            setup_select(ctrl_map_select, map_select_cb);
            ctrl_cont_map.style.display = "flex";
        }
        */
    });
    /*
    setup_select(ctrl_map_select, map_select_cb);

    function map_select_cb(field_element, el) {
        selected_map = field_element.dataset.value;
        player_profile_render_stats_content(scroll_inner, stats_type, selected_mode, selected_map, stats_main, stats_compare);
    }
    */

    // =========================
    // Compare button / input
    // =========================

    
    ctrl.appendChild(_createElement("div", "separator"));
    let compare_input_cont = _createElement("div", "compare_input");
    let compare_input = _createElement("input");
    compare_input_cont.appendChild(compare_input);

    let compare_btn = _createElement("div", ["db-btn", "plain"], localize("compare"));
    _addButtonSounds(compare_btn, 1);
    ctrl.appendChild(compare_input_cont);
    ctrl.appendChild(compare_btn);

    if (global_current_player_profile_user_id != global_self.user_id) {
        let compare_self_btn = _createElement("div", ["db-btn", "plain", "compare_self"]);
        compare_self_btn.appendChild(_createElement("div", "self_icon"));
        compare_self_btn.dataset.msg = localize("stats_compare_self");
        add_tooltip2_listeners(compare_self_btn);
        ctrl.appendChild(compare_self_btn);

        compare_self_btn.addEventListener("click", function() {
            render_compare_with_userid(global_self.user_id, global_self.data.name);
        });
    }

    compare_input_cont.addEventListener("click", function() { compare_input.focus(); });
    compare_input.addEventListener("keydown", function(event){
        if (event.keyCode == 13) player_profile_stats_compare_fetch_compare(compare_input.value);
    });
    compare_btn.addEventListener("click", function() {
        player_profile_stats_compare_fetch_compare(compare_input.value);
    });

    function player_profile_stats_compare_fetch_compare(name) {
        clear_profile_data_cache();

        let stats_spinner = _createElement("div", ["placeholder_cont", "stats_spinner"]);
        stats_spinner.appendChild(_createSpinner());
        _empty(scroll_inner);
        scroll_inner.appendChild(stats_spinner);

        stats_type = "compare";
        stats_compare = null;

        if (name.trim().length == 0) {
            stats_type = "profile";
            stats_compare = null;
            player_profile_render_stats_content(scroll_inner, stats_type, selected_mode, selected_map, stats_main, stats_compare);
            return;
        }

        api_request("GET", "/userlist/"+name, {}, function(userlist) {
            if (userlist.length == 0) {
                queue_dialog_msg({
                    "title": localize("title_info"),
                    "msg": localize("error_username_or_stats_not_found"),
                });
                
                stats_type = "profile";
                player_profile_render_stats_content(scroll_inner, stats_type, selected_mode, selected_map, stats_main, stats_compare);
            } else if (userlist.length >= 1) {
                let user = userlist[0];
                render_compare_with_userid(user.user_id, user.name);
            //} else if (userlist.length > 1) {
                // TODO show modal with a selection list or something
            }
        });
    }

    function render_compare_with_userid(user_id, name) {
        stats_type = "compare";
        stats_compare = null;

        if (!_check_nested(global_profile_data_cache, user_id, "stats")) {
            api_request("GET", "/users/"+user_id+"/stats", {}, function(data) {
                add_to_profile_data_cache(user_id, "stats", data);
                player_profile_stats_compare_to_user(name, global_profile_data_cache[user_id]["stats"].data);
            });
        } else {
            player_profile_stats_compare_to_user(name, global_profile_data_cache[user_id]["stats"].data);
        }
    }
    
    function player_profile_stats_compare_to_user(name, data) {
        stats_compare = prepareUserStats(name, data);
        player_profile_render_stats_content(scroll_inner, stats_type, selected_mode, selected_map, stats_main, stats_compare);
    }

    // ===============
    // Stats
    // ===============

    // Render content scroll container   
    let scroll_outer = _createElement("div", "scroll-outer");
    let scroll_bar = _createElement("div", "scroll-bar");
    scroll_bar.appendChild(_createElement("div", "scroll-thumb"));
    scroll_outer.appendChild(scroll_bar);
    let scroll_inner = _createElement("div", "scroll-inner");
    scroll_outer.appendChild(scroll_inner);

    new Scrollbar(scroll_outer, global_scrollbarTrackerId++, true);

    cont.appendChild(scroll_outer);

    player_profile_render_stats_content(scroll_inner, stats_type, selected_mode, selected_map, stats_main, null);
    return cont;
}



function player_profile_stats_extract_map_list(time_frame, mode, stats) {
    // outdated code, stats format has changed since then
    /* 
    if (!(time_frame in stats)) return [];
    if (!(mode in stats[time_frame]["mode_stats"])) return [];

    let maps = [];
    for (let map in stats[time_frame]["mode_stats"][mode]) {
        if (map.startsWith("map:")) maps.push(map);
    }
    return maps;
    */
}

function player_profile_render_stats_content(cont, type, mode, map, stats_1, stats_2) {
    _empty(cont);

    cont.appendChild(player_profile_render_stats_content_match_avg_summary(mode, map, stats_1));
    cont.appendChild(player_profile_render_stats_content_main_details(type, mode, map, stats_1, stats_2));
    cont.appendChild(player_profile_render_stats_content_weapon_details(type, mode, map, stats_1, stats_2));
}

// =======================================
// MATCH AVG SUMMARY TABLE 
// =======================================
function player_profile_render_stats_content_match_avg_summary(mode, map, stats) {

    let cont = _createElement("div", ["stats_block", "match_avg"]);
    let block_head = _createElement("div", "block_head");
    cont.appendChild(block_head);

    block_head.appendChild(_createElement("div", "block_title", localize("stats_main_title_match_avg_summary")));
    block_head.appendChild(_createElement("div", "line"));

    let table = _createElement("div", "table");

    let time_frame_menu = _createElement("div", "block_menu");
    for (let tf of ["alltime", "season", "week"]) {
        let opt = _createElement("div", "option", localize("stats_title_"+tf));
        time_frame_menu.appendChild(opt);
        _addButtonSounds(opt, 1);
        if (tf == global_profile_stats_main_avg_time_frame) opt.classList.add("selected");

        opt.addEventListener("click", function() {
            time_frame_menu.querySelector(".selected").classList.remove("selected");
            opt.classList.add("selected");

            global_profile_stats_main_avg_time_frame = tf;

            _empty(table);
            if (mode in stats && global_profile_stats_main_avg_time_frame in stats[mode]) player_profile_render_stats_content_match_avg_summary_table(table, stats[mode][global_profile_stats_main_avg_time_frame]);
            else table.appendChild(_createElement("div", "no_stats", localize("no_stats_found")));
        });
    }
    block_head.appendChild(time_frame_menu);

    cont.appendChild(table);

    if (mode in stats && global_profile_stats_main_avg_time_frame in stats[mode]) player_profile_render_stats_content_match_avg_summary_table(table, stats[mode][global_profile_stats_main_avg_time_frame]);
    else table.appendChild(_createElement("div", "no_stats", localize("no_stats_found")));

    return cont;
}

// Stats where lower values are better
const INVERTED_STATS = {
    "match_lost": true,
    "deaths": true,
    "damage_taken": true,
    "damage_self": true,
    "capturetime": true,
};
const MATCH_AVG_SUMMARY_STATS = [
    "frags",
    "deaths",
    "net",
    "damage_done",
    "damage_taken",
    "usage",
    "acc"
];
function player_profile_render_stats_content_match_avg_summary_table(table, data) {
    table.style.setProperty("--col_count", global_weapons_in_scoreboard.length + 1);

    // Header
    let row = _createElement("div", ["row", "header"]);
    table.appendChild(row);
    row.appendChild(_createElement("div", ["cell", "label"]));
    row.appendChild(_createElement("div", ["cell", "stat"], localize("stat_label_total")));
    for (let idx of global_weapons_in_scoreboard) {
        let wlabel = _createElement("div", ["cell", "stat"]);
        let wicon = _createElement("div", "wicon");
        wicon.style.backgroundImage = "url(/html/"+global_item_name_map[global_weapon_idx_name_map2[idx]][2]+"?fill="+global_item_name_map[global_weapon_idx_name_map2[idx]][0]+")";

        wlabel.dataset.msg = localize(global_item_name_map[global_weapon_idx_name_map2[idx]][1]);
        add_tooltip2_listeners(wlabel);

        wlabel.appendChild(wicon);
        row.appendChild(wlabel);
    }

    let mc = data.main["match_count"];
    if (mc == 0) mc = 1;

    let rows = 0;

    // Rows
    for (let stat of MATCH_AVG_SUMMARY_STATS) {
        let row = _createElement("div", "row");
        table.appendChild(row);

        if (rows % 2 == 0) row.classList.add("odd");
        rows++;

        // Label
        row.appendChild(_createElement("div", ["cell", "label"], localize("stat_label_"+stat)));

        let value = 0;
        if (stat == "net") {
            value = _round((data.main["frags"] / mc) - (data.main["deaths"] / mc), 2);
        } else if (stat == "acc") {
            if (data.main["shots_fired"] > 0) value = _round(data.main["shots_hit"] / data.main["shots_fired"] * 100, 2) + "%";
            else value = 0;
        } else if (stat == "usage") {
            value = "-";
        } else if (stat.startsWith("damage_")) {
            value = _format_number(Math.floor(data.main[stat] / mc));
        } else {
            value = _round(data.main[stat] / mc, 2);
        }
        row.appendChild(_createElement("div", ["cell", "stat", "odd"], value));

        let counter = 0;
        for (let idx of global_weapons_in_scoreboard) {
            let value = 0;
            let wkey = "gun:"+idx;
            if ("weapons" in data && wkey in data.weapons) {
                if (stat == "net") {
                    value = _round((data.weapons[wkey]["frags"] / mc) - (data.weapons[wkey]["deaths"] / mc), 2);
                } else if (stat == "acc") {
                    if (data.weapons[wkey]["shots_fired"] > 0) value = _round(data.weapons[wkey]["shots_hit"] / data.weapons[wkey]["shots_fired"] * 100, 2) + "%";
                    else value = 0;
                } else if (stat == "usage") {
                    value = data.weapons[wkey][stat] + "%";
                } else if (stat.startsWith("damage_")) {
                    value = _format_number(Math.floor(data.weapons[wkey][stat] / mc));
                } else {
                    value = _round(data.weapons[wkey][stat] / mc, 2);
                }
            }
            let cell = _createElement("div", ["cell", "stat"], value)
            row.appendChild(cell);

            if (counter % 2 != 0) cell.classList.add("odd");
            counter++;
        }
    }
}

// =======================================
// MAIN DETAILS TABLE 
// =======================================
function player_profile_render_stats_content_main_details(type, mode, map, stats_1, stats_2) {

    let cont = _createElement("div", ["stats_block", "main_details"]);
    let block_head = _createElement("div", "block_head");
    cont.appendChild(block_head);

    block_head.appendChild(_createElement("div", "block_title", localize("stats_main_title_main_details")));
    block_head.appendChild(_createElement("div", "line"));

    let table = _createElement("div", "table");

    let avg_menu = _createElement("div", "block_menu");
    for (let avg of ["total", "match", "minute"]) {
        let opt = _createElement("div", "option", localize("stats_avg_title_"+avg));
        avg_menu.appendChild(opt);
        _addButtonSounds(opt, 1);
        if (avg == global_profile_stats_main_details_avg) opt.classList.add("selected");

        opt.addEventListener("click", function() {
            avg_menu.querySelector(".selected").classList.remove("selected");
            opt.classList.add("selected");

            global_profile_stats_main_details_avg = avg;

            _empty(table);
            render_table();
        });
    }
    block_head.appendChild(avg_menu);

    cont.appendChild(table);

    function render_table() {
        if (type == "profile") {
            if (stats_1 && mode in stats_1) player_profile_render_stats_content_main_details_table(table, type, global_profile_stats_main_details_avg, stats_1[mode]);
            else table.appendChild(_createElement("div", "no_stats", localize("no_stats_found")));
        } else if (type == "compare") {
            let mode_stats_1 = null;
            let mode_stats_2 = null;
            let name_2 = "";
            if (stats_1 && mode in stats_1) mode_stats_1 = stats_1[mode];
            if (stats_2 && mode in stats_2) mode_stats_2 = stats_2[mode];
            if (stats_2) name_2 = stats_2.name;

            player_profile_render_stats_content_main_details_table(table, type, global_profile_stats_main_details_avg, mode_stats_1, mode_stats_2, name_2);
        }
    }

    render_table();

    return cont;
}

const MAIN_DETAILS_STATS_TOTAL = [
    "time_played",
    "match_count",
    "match_won",
    "match_lost"
];
const MAIN_DETAILS_STATS = [
    "frags",
    "assists",
    "deaths",
    "net",
    "damage_done",
    "damage_taken",
    //"damage_per_life",
    //"health",
    //"armor",
    //"movement_speed",
    "commends",
];
function player_profile_render_stats_content_main_details_table(table, type, avg_mode, data_1, data_2, name_2) {
    // Header
    let row = _createElement("div", ["row", "header"]);
    table.appendChild(row);
    if (type == "profile") {
        row.appendChild(_createElement("div", ["cell", "label"]));
        row.appendChild(_createElement("div", ["cell", "stat"], localize("stats_title_alltime")));
        row.appendChild(_createElement("div", ["cell", "stat"], localize("stats_title_season")));
        row.appendChild(_createElement("div", ["cell", "stat"], localize("stats_title_week")));
    } else if (type == "compare") {
        row.appendChild(_createElement("div", ["cell", "label", "double"]));

        row.appendChild(_createElement("div", ["cell", "stat_double", "left"], localize("stats_title_alltime")));
        row.appendChild(_createElement("div", ["cell", "stat_double", "right", "name"], name_2));

        row.appendChild(_createElement("div", ["cell", "stat_double", "left"], localize("stats_title_season")));
        row.appendChild(_createElement("div", ["cell", "stat_double", "right", "name"], name_2));

        row.appendChild(_createElement("div", ["cell", "stat_double", "left"], localize("stats_title_week")));
        row.appendChild(_createElement("div", ["cell", "stat_double", "right", "name"], name_2));
    }
    row.appendChild(_createElement("div", ["cell", "spacer"]));

    let time_frames = ["alltime", "season", "week"];

    let stat_list = MAIN_DETAILS_STATS;
    if (avg_mode == "total") stat_list = MAIN_DETAILS_STATS_TOTAL.concat(MAIN_DETAILS_STATS);

    let rows = 0;

    // Rows
    for (let stat of stat_list) {
        let row = _createElement("div", "row");
        table.appendChild(row);

        if (rows % 2 == 0) row.classList.add("odd");
        rows++;

        if (stat == "match_lost") row.style.marginBottom = "1.4vh";

        // Label
        if (type == "profile") row.appendChild(_createElement("div", ["cell", "label"], localize("stat_label_"+stat)));
        else if (type == "compare") row.appendChild(_createElement("div", ["cell", "label", "double"], localize("stat_label_"+stat)));

        for (let time_frame of time_frames) {
            if (type == "profile") {
                let cell = _createElement("div", ["cell", "stat"]);
                let cell_data = player_profile_render_stats_content_main_details_table_cell(data_1, stat, time_frame, avg_mode);
                cell.textContent = cell_data.display;
                row.appendChild(cell);
            } else if (type == "compare") {
                let cell_left = _createElement("div", ["cell", "stat_double", "left"]);
                let data_left = player_profile_render_stats_content_main_details_table_cell(data_1, stat, time_frame, avg_mode);
                cell_left.textContent = data_left.display;
            
                let cell_right = _createElement("div", ["cell", "stat_double", "right"]);
                let data_right = player_profile_render_stats_content_main_details_table_cell(data_2, stat, time_frame, avg_mode);

                cell_right.textContent = data_right.display;

                if (stat in INVERTED_STATS) {
                    if (data_left.value > data_right.value) { 
                        cell_left.classList.add("dim");
                        cell_right.classList.add("hl");  
                    } else if (data_left.value < data_right.value) {
                        cell_left.classList.add("hl");
                        cell_right.classList.add("dim");                    
                    }
                } else {
                    if (data_left.value < data_right.value) {
                        cell_left.classList.add("dim");
                        cell_right.classList.add("hl");
                    } else if (data_left.value > data_right.value) {
                        cell_left.classList.add("hl");
                        cell_right.classList.add("dim");
                    }
                }

                row.appendChild(cell_left);
                row.appendChild(cell_right);
            }
        }
        row.appendChild(_createElement("div", ["cell", "spacer"]));
    }
}
function player_profile_render_stats_content_main_details_table_cell(data, stat, time_frame, avg_mode) {    
    if (data == null || data == undefined || !(time_frame in data)) {
        return {
            "value": 0,
            "display": "-",
        };
    }

    let value = 0;
    let display = "";

    // Value used to get the average
    let avgc = 1;
    if (avg_mode == "match") {
        avgc = data[time_frame].main["match_count"];
    } else if (avg_mode == "minute") {
        avgc = data[time_frame].main["time_played"] / 60;
    }
    if (avgc == 0) avgc = 1;

    if (stat == "net") {
        value = _round((data[time_frame].main["frags"] / avgc) - (data[time_frame].main["deaths"] / avgc), 2);
        display = value;
    } else if (stat == "damage_per_life") {
        if (data[time_frame].main["spawn_count"] > 0) value = Math.floor(data[time_frame].main["damage_done"] / data[time_frame].main["spawn_count"]);
        display = value;
    } else if (stat == "movement_speed") {
        if (data[time_frame].main["time_alive"] > 0) value = Math.floor(data[time_frame].main["distance_moved"] / data[time_frame].main["time_alive"]);
        else value = 0;
        display = value+" ups";
    } else if (stat == "time_played") {
        value = _seconds_to_string(data[time_frame].main["time_played"]);
        display = value;
    } else if (stat.startsWith("damage_")) {
        value = Math.floor(data[time_frame].main[stat] / avgc);
        display = _format_number(value);
    } else {
        value = _round(data[time_frame].main[stat] / avgc, 2);
        display = value;
    }

    return {
        "value": value,
        "display": display,
    }
}

// =======================================
// WEAPON DETAILS TABLE 
// =======================================
function player_profile_render_stats_content_weapon_details(type, mode, map, stats_1, stats_2) {

    let cont = _createElement("div", ["stats_block", "weapon_details"]);
    let block_head = _createElement("div", "block_head");
    cont.appendChild(block_head);

    block_head.appendChild(_createElement("div", "block_title", localize("stats_main_title_weapon_details")));
    block_head.appendChild(_createElement("div", "line"));
    
    let table = _createElement("div", "table");

    let avg_menu = _createElement("div", "block_menu");
    for (let avg of ["total", "match", "minute"]) {
        let opt = _createElement("div", "option", localize("stats_avg_title_"+avg));
        avg_menu.appendChild(opt);
        _addButtonSounds(opt, 1);
        if (avg == global_profile_stats_weapon_details_avg) opt.classList.add("selected");

        opt.addEventListener("click", function() {
            avg_menu.querySelector(".selected").classList.remove("selected");
            opt.classList.add("selected");

            global_profile_stats_weapon_details_avg = avg;

            _empty(table);
            render_table();
        });
    }
    block_head.appendChild(avg_menu);

    let weapon_menu = _createElement("div", ["block_menu", "weapons"]);
    for (let idx of global_weapons_in_scoreboard) {
        let opt = _createElement("div", "option");
        let wicon = _createElement("div", "wicon");
        opt.appendChild(wicon);

        wicon.style.backgroundImage = "url(/html/"+global_item_name_map[global_weapon_idx_name_map2[idx]][2]+"?fill="+global_item_name_map[global_weapon_idx_name_map2[idx]][0]+")";

        opt.dataset.msg = localize(global_item_name_map[global_weapon_idx_name_map2[idx]][1]);
        add_tooltip2_listeners(opt);

        weapon_menu.appendChild(opt);
        _addButtonSounds(opt, 1);


        if (global_profile_stats_weapon_details_gun == "gun:"+idx) opt.classList.add("selected");

        opt.addEventListener("click", function() {
            weapon_menu.querySelector(".selected").classList.remove("selected");
            opt.classList.add("selected");

            global_profile_stats_weapon_details_gun = "gun:"+idx;

            _empty(table);
            render_table();
        });
    }
    cont.appendChild(weapon_menu);

    cont.appendChild(table);

    function render_table() {
        if (type == "profile") {
            if (stats_1 && mode in stats_1) player_profile_render_stats_content_weapon_details_table(table, type, global_profile_stats_weapon_details_avg, global_profile_stats_weapon_details_gun, stats_1[mode]);
            else table.appendChild(_createElement("div", "no_stats", localize("no_stats_found")));
        } else if (type == "compare") {
            let mode_stats_1 = null;
            let mode_stats_2 = null;
            let name_2 = "";
            if (stats_1 && mode in stats_1) mode_stats_1 = stats_1[mode];
            if (stats_2 && mode in stats_2) mode_stats_2 = stats_2[mode];
            if (stats_2) name_2 = stats_2.name;

            player_profile_render_stats_content_weapon_details_table(table, type, global_profile_stats_weapon_details_avg, global_profile_stats_weapon_details_gun, mode_stats_1, mode_stats_2, name_2);
        }
    }
    render_table();

    return cont;
}

const WEAPON_DETAILS_STATS = [
    "frags",
    "deaths",
    "damage_done",
    "damage_taken",
    "usage",
    "acc",
];
function player_profile_render_stats_content_weapon_details_table(table, type, avg_mode, weapon, data_1, data_2, name_2) {
    // Header
    let row = _createElement("div", ["row", "header"]);
    table.appendChild(row);
    if (type == "profile") {
        row.appendChild(_createElement("div", ["cell", "label"]));
        row.appendChild(_createElement("div", ["cell", "stat"], localize("stats_title_alltime")));
        row.appendChild(_createElement("div", ["cell", "stat"], localize("stats_title_season")));
        row.appendChild(_createElement("div", ["cell", "stat"], localize("stats_title_week")));
    } else if (type == "compare") {
        row.appendChild(_createElement("div", ["cell", "label", "double"]));

        row.appendChild(_createElement("div", ["cell", "stat_double", "left"], localize("stats_title_alltime")));
        row.appendChild(_createElement("div", ["cell", "stat_double", "right", "name"], name_2));

        row.appendChild(_createElement("div", ["cell", "stat_double", "left"], localize("stats_title_season")));
        row.appendChild(_createElement("div", ["cell", "stat_double", "right", "name"], name_2));

        row.appendChild(_createElement("div", ["cell", "stat_double", "left"], localize("stats_title_week")));
        row.appendChild(_createElement("div", ["cell", "stat_double", "right", "name"], name_2));
    }
    row.appendChild(_createElement("div", ["cell", "spacer"]));

    let time_frames = ["alltime", "season", "week"];

    let rows = 0;

    // Rows
    for (let stat of WEAPON_DETAILS_STATS) {
        let row = _createElement("div", "row");
        table.appendChild(row);

        if (rows % 2 == 0) row.classList.add("odd");
        rows++;

        // Label
        if (type == "profile") row.appendChild(_createElement("div", ["cell", "label"], localize("stat_label_"+stat)));
        else if (type == "compare") row.appendChild(_createElement("div", ["cell", "label", "double"], localize("stat_label_"+stat)));

        for (let time_frame of time_frames) {
            if (type == "profile") {
                let cell = _createElement("div", ["cell", "stat"]);
                let cell_data = player_profile_render_stats_content_weapon_details_table_cell(data_1, stat, time_frame, avg_mode, weapon);
                cell.textContent = cell_data.display;
                row.appendChild(cell);
            } else if (type == "compare") {
                let cell_left = _createElement("div", ["cell", "stat_double", "left"]);
                let data_left = player_profile_render_stats_content_weapon_details_table_cell(data_1, stat, time_frame, avg_mode, weapon);
                cell_left.textContent = data_left.display;
            
                let cell_right = _createElement("div", ["cell", "stat_double", "right"]);
                let data_right = player_profile_render_stats_content_weapon_details_table_cell(data_2, stat, time_frame, avg_mode, weapon);
                cell_right.textContent = data_right.display;

                if (stat in INVERTED_STATS) {
                    if (data_left.value > data_right.value) {
                        cell_left.classList.add("dim");
                        cell_right.classList.add("hl");
                    } else if (data_left.value < data_right.value) {
                        cell_left.classList.add("hl");
                        cell_right.classList.add("dim");                    
                    }
                } else {
                    if (data_left.value < data_right.value) {
                        cell_left.classList.add("dim");
                        cell_right.classList.add("hl");
                    } else if (data_left.value > data_right.value) {
                        cell_left.classList.add("hl");
                        cell_right.classList.add("dim");
                    }
                }

                row.appendChild(cell_left);
                row.appendChild(cell_right);
            }
        }
        row.appendChild(_createElement("div", ["cell", "spacer"]));
    }
}
function player_profile_render_stats_content_weapon_details_table_cell(data, stat, time_frame, avg_mode, weapon) {    
    if (data == null || data == undefined || !(time_frame in data) || !("weapons" in data[time_frame]) || !(weapon in data[time_frame].weapons)) {
        return {
            "value": 0,
            "display": "-",
        };
    }

    let value = 0;
    let display = "";

    // Value used to get the average
    let avgc = 1;
    if (avg_mode == "match") {
        avgc = data[time_frame].main["match_count"];
    } else if (avg_mode == "minute") {
        avgc = data[time_frame].main["time_played"] / 60;
    }
    if (avgc == 0) avgc = 1;

    if (stat == "net") {
        value = _round((data[time_frame].weapons[weapon]["frags"] / avgc) - (data[time_frame].weapons[weapon]["deaths"] / avgc), 2);
        display = value;
    } else if (stat == "usage") {
        value = data[time_frame].weapons[weapon][stat];
        display = value+"%";
    } else if (stat == "acc") {
        if (data[time_frame].weapons[weapon]["shots_fired"] > 0) value = _round(data[time_frame].weapons[weapon]["shots_hit"] / data[time_frame].weapons[weapon]["shots_fired"] * 100, 2);
        else value = 0;
        display = value+"%";
    } else if (stat.startsWith("damage_")) {
        value = Math.floor(data[time_frame].weapons[weapon][stat] / avgc);
        display = _format_number(value);
    } else {
        value = _round(data[time_frame].weapons[weapon][stat] / avgc, 2);
        display = value;
    }

    return {
        "value": value,
        "display": display,
    }
}

// Format the flat array coming from the API into something more easily useable
function prepareUserStats(name, data) {
    let stats = {};

    stats.name = name;

    for (let d of data) {
        let mode_key = d.match_mm_mode+"-"+d.match_mode;
        if (d.match_mode == "" && d.match_mm_mode == "") mode_key = "total";

        if (!(mode_key in stats)) stats[mode_key] = {};
        if (!(d.time_frame in stats[mode_key])) stats[mode_key][d.time_frame] = {};

        if (d.filter == "") {
            stats[mode_key][d.time_frame]["main"] = d;
        } else if (d.filter.startsWith("gun:")) {
            if (!("weapons" in stats[mode_key][d.time_frame])) stats[mode_key][d.time_frame]["weapons"] = {};
            stats[mode_key][d.time_frame]["weapons"][d.filter] = {
                "frags": d.frags,
                "deaths": d.deaths,
                "damage_done": d.damage_done,
                "damage_taken": d.damage_taken,
                "damage_self": d.damage_self,
                "shots_fired": d.shots_fired,
                "shots_hit": d.shots_hit,
            };

            
            if (!("usage_total" in stats[mode_key][d.time_frame])) stats[mode_key][d.time_frame]["usage_total"] = 0;
            let idx = d.filter.substring(4);
            if (idx in global_weapon_reload_times) stats[mode_key][d.time_frame]["usage_total"] += d.shots_fired * global_weapon_reload_times[idx];
        }
    }

    for (let mode_key in stats) {
        if (typeof stats[mode_key] != "object") continue;
        
        for (let time_frame in stats[mode_key]) {
            if (!("usage_total" in stats[mode_key][time_frame])) continue;

            for (let filter in stats[mode_key][time_frame]["weapons"]) {
                let idx = filter.substring(4);
                let perc = _round(((stats[mode_key][time_frame]["weapons"][filter].shots_fired * global_weapon_reload_times[idx]) / stats[mode_key][time_frame]["usage_total"]) * 100, 2);
                stats[mode_key][time_frame]["weapons"][filter]["usage"] = perc;
            }
        }
    }

    return stats;
}

// ====================================================
// ACHIEVEMENTS
function player_profile_render_achievements(data) {
    //console.log("render achievements", _dump(data));

    // prepare the data
    let achievements = {};
    for (let i=0; i<data.achievements.data.length; i++) {
        let ach = data.achievements.data[i];
        if (!(ach.achievement_id in achievements)) achievements[ach.achievement_id] = [];
        achievements[ach.achievement_id].push(ach);
    }

    let cont = new DocumentFragment();
    cont.appendChild(player_profile_render_head(data.main.data, true));

    cont.appendChild(_createElement("div", "achievement_head", localize("achievement_msg")));

    if (Object.keys(achievements).length == 0) {
        cont.appendChild(_createElement("div", "coming_soon", localize("coming_soon")));
        return cont;
    }

    let scroll_outer = _createElement("div", "scroll-outer");
    let scroll_bar = _createElement("div", "scroll-bar");
    scroll_bar.appendChild(_createElement("div", "scroll-thumb"));
    scroll_outer.appendChild(scroll_bar);
    let scroll_inner = _createElement("div", "scroll-inner");
    scroll_outer.appendChild(scroll_inner);

    new Scrollbar(scroll_outer, global_scrollbarTrackerId++, true);

    cont.appendChild(scroll_outer);

    for (let achievement_id in achievements) {

        // Get the progress / next goal
        let goal_val = 0;
        let progress_val = 0;
        let progress_perc = 0;
        let next_reward = {};
        let last_reward = {};
        let last_goal = 0;
        let last_ach_idx = 0;
        let next_ach_idx = 0;
        let finished = true;
        for (let ach of achievements[achievement_id]) {
            if (ach.achieved_ts == null) {
                finished = false;
                goal_val = ach.goal;
                next_reward = ach;
                if (ach.progress != null) progress_val = ach.progress;
                if (goal_val > 0) progress_perc = (progress_val / goal_val) * 100;
                break;
            } else {
                last_reward = ach;
                last_goal = ach.goal;
                last_ach_idx = next_ach_idx;
            }
            next_ach_idx++;
        }
        progress_perc = _clamp(progress_perc, 0, 100);

        let achievement = _createElement("div", "achievement");

        if (finished) {
            let finished_icon = _createElement("div", "finished");
            achievement.appendChild(finished_icon);
            next_ach_idx = last_ach_idx;
            goal_val = last_goal;
            progress_val = goal_val;
            progress_perc = 100;
        } else {
            let next_reward_unlock = _createElement("div", ["next_reward", "customization_item"]);
            if (next_reward.customization_id) {
                next_reward_unlock.dataset.msgHtmlId = "customization_item";
                next_reward_unlock.dataset.id = next_reward.customization_id;
                next_reward_unlock.dataset.type = next_reward.customization_type;
                next_reward_unlock.dataset.rarity = next_reward.rarity;
                add_tooltip2_listeners(next_reward_unlock);

                next_reward_unlock.classList.add("rarity_bg_"+next_reward.rarity);

                next_reward_unlock.appendChild(renderCustomizationInner("player_profile", next_reward.customization_type, next_reward.customization_id, next_reward.amount, false));
            }
            achievement.appendChild(next_reward_unlock);
        }

        let body = _createElement("div", "body");
        achievement.appendChild(body);

        let rewards = _createElement("div", "rewards");
        achievement.appendChild(rewards);


        body.appendChild(_createElement("div", "name", localize("achievement_title_"+next_ach_idx+"_"+achievement_id)));
        body.appendChild(_createElement("div", "desc", localize("achievement_"+achievement_id)));
        //body.appendChild(_createElement("div", "progress_title", localize("progress")));
        let progress = _createElement("div", "progress");
        let progress_bar = _createElement("div", "progress_bar");
        let progress_bar_inner = _createElement("div", "progress_bar_inner");
        progress_bar_inner.style.width = progress_perc+"%";
        progress_bar.appendChild(progress_bar_inner);
        progress.appendChild(progress_bar);
        let progress_text = _createElement("div", "progress_text", _format_number(progress_val)+" / "+_format_number(goal_val));
        progress.appendChild(progress_text);

        body.appendChild(progress);


        for (let ach of achievements[achievement_id]) {
            if (!ach.goal) continue;
            let reward = _createElement("div", "reward");

            let item = _createElement("div", "customization_item");
            if (ach.customization_id) {
                item.dataset.msgHtmlId = "customization_item";
                item.dataset.id = ach.customization_id;
                item.dataset.type = ach.customization_type;
                item.dataset.rarity = ach.rarity;
                add_tooltip2_listeners(item);

                item.classList.add("rarity_bg_"+ach.rarity);

                item.appendChild(renderCustomizationInner("player_profile", ach.customization_type, ach.customization_id, ach.amount, false));
            }
            reward.appendChild(item);

            let goal_cont = _createElement("div", "goal_cont");
            goal_cont.appendChild(_createElement("div", "goal", _format_number(ach.goal)));
            reward.appendChild(goal_cont);

            if (ach.achieved_ts != null) {
                reward.classList.add("achieved");

                let icon = _createElement("div", "achieved_icon");
                reward.appendChild(icon);
            }

            rewards.appendChild(reward);
        }
        
        
        scroll_inner.appendChild(achievement);

    }

    return cont;
}