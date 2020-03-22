var global_current_player_profile_user_id = 0;
var global_current_player_profile_page = undefined;
var global_profile_data_cache = {};
var global_profile_data_cache_time = 300;

function add_to_profile_data_cache(id, type, data) {
    if (!(id in global_profile_data_cache)) global_profile_data_cache[id] = {};
    global_profile_data_cache[id][type] = {
        "ts": Date.now(),
        "data": data
    };
}
function clear_profile_data_cache() {
    for (let id in global_profile_data_cache) {
        for (let type in global_profile_data_cache[id]) {
            if (((Date.now() - global_profile_data_cache[id][type]["ts"]) / 1000) > global_profile_data_cache_time) {
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
    let cont = _id("player_profile_screen");
    if (global_profile_nav && global_profile_nav.parentNode) {
        global_profile_nav.parentNode.removeChild(global_profile_nav);
        global_profile_nav = undefined;
    }

    _for_each_with_selector_in_parent(cont, ".page", function(page_content) {
        page_content.parentNode.removeChild(page_content);
    });
}

let global_profile_nav = undefined;
function load_player_profile(origin, page, id) {
    echo(origin+" "+page+" "+id);
    clear_profile_data_cache();

    if (!id.length || id.trim().length == 0) {
        console.log("WARNING - tried loading user profile without user_id");
        return;
    }

    if (global_current_player_profile_user_id == id && global_current_player_profile_page == page && id in global_profile_data_cache) return;

    if (origin != "player_profile_screen") {
        clear_player_profile();
    }
    

    let requests = [];
    
    if (!_check_nested(global_profile_data_cache, id, "main")) {
        requests.push({
            "api": global_stats_api,
            "path": "/users/"+id,
            "data_key_to": "main",
            "params": {}
        });
    }

    if (page == "profile") {
        if (!_check_nested(global_profile_data_cache, id, "alltime_stats")) {
            requests.push({
                    "api": global_stats_api,
                    "path": "/users/"+id+"/stats",
                    "data_key_to": "alltime_stats",
                    "params": { "for": "alltime" }
            });
        }
        if (!_check_nested(global_profile_data_cache, id, "mmr")) {
            requests.push({
                    "api": global_stats_api,
                    "path": "/users/"+id+"/rating",
                    "data_key_from": "ratings",
                    "data_key_to": "mmr",
                    "params": {},
            });
        }
        if (!_check_nested(global_profile_data_cache, id, "last_match")) {
            requests.push({
                    "api": global_stats_api,
                    "path": "/users/"+id+"/match",
                    "data_key_to": "last_match",
                    "params": { "for": "last" }
            });
        }
    }

    if (page == "matches") {
        if (!_check_nested(global_profile_data_cache, id, "matches")) {
            requests.push({
                    "api": global_stats_api,
                    "path": "/users/"+id+"/matches",
                    "data_key_from": "matches",
                    "data_key_to": "matches",
                    "params": { "limit": 15 }
            });
        }
    }

    if (page == "stats") {
        // Get stats data
    }

    function on_success(data) {
        for (let key of Object.keys(data)) {
            add_to_profile_data_cache(id, key, data[key]);
        }
        setFullscreenSpinner(false);
        render_player_profile_page(id, page);
    }

    function on_timeout() {
        setFullscreenSpinner(false);
        // TODO show error (on the page, not a popup)
    }

    function on_delay() {
        setFullscreenSpinner(true);
    }

    function on_pagechange() {
        setFullscreenSpinner(false);
    }

    multi_req_handler("player_profile_screen", requests, on_success, on_delay, on_timeout, on_pagechange);
}


function render_player_profile_page(id, page) {
    //console.log(_dump(global_profile_data_cache[id]));

    let cont = _id("player_profile_screen");

    if (global_current_player_profile_user_id != id) {
        global_current_player_profile_user_id = id;

        if (global_profile_nav) {
            global_profile_nav.parentNode.removeChild(global_profile_nav);
            global_profile_nav = undefined;
        }

        _for_each_with_selector_in_parent(cont, ".page", function(page_content) {
            page_content.parentNode.removeChild(page_content);
        });
    }

    if (global_current_player_profile_page != page) {
        global_current_player_profile_page = page;

        if (global_profile_nav) {
            global_profile_nav.parentNode.removeChild(global_profile_nav);
            global_profile_nav = undefined;
        }
    }

    let fragment = new DocumentFragment();

    if (!global_profile_nav) {
        global_profile_nav = player_profile_render_nav(page);
        fragment.appendChild(global_profile_nav);
    }

    if (global_profile_data_cache[id].main.data === null) {
        _for_each_with_selector_in_parent(cont, ".page", function(page_content) {
            page_content.parentNode.removeChild(page_content);
        });
        fragment.appendChild(_createElement("div", ["page", "no_data"], localize("player_profile_no_profile")));
        cont.appendChild(fragment);
        return;
    }

    _for_each_with_selector_in_parent(cont, ".page", function(page_content) {
        page_content.classList.add("anim_out");
        page_content.addEventListener("animationend", function(e) {
            // for some (to me) unknown reason this event fires twice every time
            if (page_content.parentNode) page_content.parentNode.removeChild(page_content);
        });
    });

    if (page == "profile") {
        fragment.appendChild(player_profile_render_main(global_profile_data_cache[id]));
    }
    if (page == "matches") {
        fragment.appendChild(player_profile_render_matches(global_profile_data_cache[id]));
    }
    if (page == "stats") {
        fragment.appendChild(player_profile_render_stats(global_profile_data_cache[id]));
    }
    cont.appendChild(fragment);
}

function player_profile_render_nav(page) {
    let nav = _createElement("div", "nav");

    //let targets = ["profile", "matches", "stats"];
    let targets = ["profile", "matches"];

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
            load_player_profile("player_profile_screen",target, user_id);
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

function player_profile_render_head(data, simple) {

    let head = _createElement("div", "head");
    
    let avatar = _createElement("div", "avatar");
    avatar.style.backgroundImage = "url("+_avatarUrl(data.avatar)+")";
    head.appendChild(avatar);

    let name = _createElement("div", "name");
    name.innerHTML = data.name;
    head.appendChild(name);

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

        if (data.user_id != global_self.user_id && !global_friends_user_ids.includes(data.user_id)) {
            let add_friend = _createElement("div", ["btn","add_friend","tooltip2"]);
            add_friend.dataset.msgId = "friends_list_label_add_friend";
            add_tooltip2_listeners(add_friend);
            head.appendChild(add_friend);
        }
    }

    return head;
}

function player_profile_render_main(data) {

    console.log(_dump(data));

    let alltime_combined = {
        "match_count": 0,
        "match_won": 0,
        "time_played": 0,
    };
    let most_played = false;
    let most_played_count = 0;
    if (_check_nested(data, "alltime_stats", "data") && Array.isArray(data.alltime_stats.data)) {
        for (let stats of data.alltime_stats.data) {
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

    let cont = _createElement("div", ["profile", "page", "anim_in"]);
    cont.appendChild(player_profile_render_head(data.main.data, false));

    let stats = ["games", "wins", "time_played", "level"];
    let summary_top = _createElement("div", "summary_top");

    // For css width of each stat div:
    summary_top.style.setProperty("--stat_count", stats.length);

    for (let i=0; i<stats.length; i++) {
        let summary_stat = _createElement("div", "stat");
        
        if (i != (stats.length - 1)) {
            summary_stat.classList.add("separator");
        }

        let summary_stat_label = _createElement("div", "label");
        if (stats[i] == "games")       summary_stat_label.innerHTML = localize("player_profile_label_games");
        if (stats[i] == "wins")        summary_stat_label.innerHTML = localize("player_profile_label_wins");
        if (stats[i] == "time_played") summary_stat_label.innerHTML = localize("player_profile_label_time_played");
        if (stats[i] == "level")       summary_stat_label.innerHTML = localize("player_profile_label_account_level");
        summary_stat.appendChild(summary_stat_label);

        let summary_stat_value = _createElement("div", "value");
        if (stats[i] == "games")       summary_stat_value.innerHTML = alltime_combined.match_count;
        if (stats[i] == "wins")        summary_stat_value.innerHTML = alltime_combined.match_won;
        if (stats[i] == "time_played") summary_stat_value.innerHTML = _seconds_to_string(alltime_combined.time_played);
        if (stats[i] == "level")       summary_stat_value.innerHTML = data.main.data.level;
        summary_stat.appendChild(summary_stat_value);

        summary_top.appendChild(summary_stat);
    }
    cont.appendChild(summary_top);


    //let featured_topics = ["rank", "battlepass", "trophies"];
    let featured_topics = ["rank"];
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
        if (featured_topics[i] == "rank")       label.innerHTML = localize("player_profile_label_highest_rank");
        if (featured_topics[i] == "battlepass") label.innerHTML = localize("battlepass");
        if (featured_topics[i] == "trophies")   label.innerHTML = localize("player_profile_label_trophies");
        featured.appendChild(label);

        let content = _createElement("div", "content");
        if (featured_topics[i] == "rank") {
            if (highest_rank) {
                // TODO render rank with mode name and games played
                content.appendChild(renderRankIcon(highest_rank_data.rank_tier, highest_rank_data.rank_position));
                let rank_name = _createElement("div", "rank_name");
                rank_name.appendChild(getRankName(highest_rank_data.rank_tier, highest_rank_data.rank_position));
                content.appendChild(rank_name);

                if (highest_rank_data.mode_name in global_queue_modes) {
                    content.appendChild(_createElement("div", "rank_mode_name", localize(global_game_mode_map[global_queue_modes[highest_rank_data.mode_name].mode].i18n)+" "+global_queue_modes[highest_rank_data.mode_name].vs));
                }
            } else {
                // TODO render weeball in a cardboard box without extra info
                content.appendChild(renderRankIcon(0, null));
                content.appendChild(_createElement("div", "rank_name", localize("rank_unranked")));
            }
        }
        if (featured_topics[i] == "battlepass") {
            if (data.main.data.active_battlepass_id) {
                // TODO render battlepass
                let level_icon = _createElement("div", "bp_level_icon");
                level_icon.innerHTML = data.main.data.battlepass_level;
                if (data.main.data.battlepass_owned) {
                    level_icon.style.backgroundImage = "url("+global_battlepass_data[data.main.data.active_battlepass_id]['level-image']+")";
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
    
        let icon = _createElement("div", "icon");
        icon.style.backgroundImage = "url(/html/images/gamemodes/"+most_played.match_mode+".jpg)";
        most_played_mode.appendChild(icon);
        
        let desc = _createElement("div", "desc");
        let label = _createElement("div", "label");
        label.innerHTML = localize("player_profile_label_most_played_mode");
        desc.appendChild(label);

        let mode_name = _createElement("div", "mode_name");
        mode_name.innerHTML = localize(global_game_mode_map[most_played.match_mode].i18n);
        desc.appendChild(mode_name);

        most_played_mode.appendChild(desc);

        let stats_list = ["games", "wins", "kdr", "time_played"];
        let stats = _createElement("div", "stats");
        let row1 = _createElement("div", "row");
        let row2 = _createElement("div", "row");
        for (let i=0; i<stats_list.length; i++) {
            let stat_div = _createElement("div", "stat");
            let stat_label = _createElement("div", "stat_label");
            if (stats_list[i] == "games")       stat_label.innerHTML = localize("player_profile_label_games");
            if (stats_list[i] == "wins")        stat_label.innerHTML = localize("player_profile_label_wins");
            if (stats_list[i] == "kdr")         stat_label.innerHTML = localize("player_profile_label_kdr");
            if (stats_list[i] == "time_played") stat_label.innerHTML = localize("player_profile_label_time_played");
            stat_div.appendChild(stat_label);

            let stat_value = _createElement("div", "stat_value");
            if (stats_list[i] == "games")       stat_value.innerHTML = most_played.match_count;
            if (stats_list[i] == "wins")        stat_value.innerHTML = most_played.match_won;
            if (stats_list[i] == "kdr")         stat_value.innerHTML = (most_played.deaths == 0) ? most_played.frags : _round((most_played.frags / most_played.deaths),1);
            if (stats_list[i] == "time_played") stat_value.innerHTML = _seconds_to_string(most_played.time_played);
            stat_div.appendChild(stat_value);
            if (i < 2) row1.appendChild(stat_div);
            else row2.appendChild(stat_div);
        }
        stats.appendChild(row1);
        stats.appendChild(row2);
        most_played_mode.appendChild(stats);
        cont.appendChild(most_played_mode);
    }
    

    if ("match" in data.last_match.data) {
        let last_match = _createElement("div", "last_match");

        let match = data.last_match.data.match;
        let seconds_since = (new Date - new Date(match.finish_ts)) / 1000;

        let result = "?";
        let placement = -1;
        for (let t of match.teams) {
            if (t.team_idx == match.user_team_idx) {
                placement = t.placement;
                if (placement == 0) {
                    result = localize("match_win");
                } else if (placement == 254) {
                    result = localize("match_forfeit");
                } else {
                    result = (t.placement + 1) +".";
                }
            }
        }

        let head = _createElement("div", "last_match_head");
        let label = _createElement("div", "label");
        label.innerHTML = localize("player_profile_label_last_match");
        head.appendChild(label);

        let time = _createElement("div", "time");
        time.textContent = localize_ext("time_ago", {
            "time": _seconds_to_string(seconds_since)
        })
        head.appendChild(time);

        last_match.appendChild(head);

        let last_match_cont = _createElement("div", "cont");

        let mode_icon = _createElement("div", "mode_icon");
        mode_icon.style.backgroundImage = "url(/html/images/gamemodes/"+match.match_mode+".jpg)";
        last_match_cont.appendChild(mode_icon);

        let match_summary = _createElement("div", "match_summary");
        last_match_cont.appendChild(match_summary);

        let row1 = _createElement("div", "row");
        let row2 = _createElement("div", "row");
        match_summary.appendChild(row1);
        match_summary.appendChild(row2);

        let mode_name = _createElement("div", ["desc_label", "mode_name"]);
        mode_name.innerHTML = localize(global_game_mode_map[match.match_mode].i18n);
        row1.appendChild(mode_name);

        let match_time = _createElement("div", "match_time");
        match_time.innerHTML = _seconds_to_digital(match.match_time);
        row1.appendChild(match_time);

        let kda_label = _createElement("div", ["desc_label", "kda"]);
        kda_label.innerHTML = localize("player_profile_label_kda");
        row2.appendChild(kda_label);

        let kda_values = _createElement("div", "kda_values");
        if (match.stats) {
            kda_values.innerHTML = match.stats.f+" / "+match.stats.d+" / 0";
        }
        row2.appendChild(kda_values);

        let match_result = _createElement("div", "match_result");
        if (placement == 0) match_result.classList.add("win");
        match_result.innerHTML = result;
        last_match_cont.appendChild(match_result);

        last_match.appendChild(last_match_cont);
        
        cont.appendChild(last_match);
    }

    return cont;
}
function player_profile_render_matches(data) {

    let cont = _createElement("div", ["matches", "page", "anim_in"]);
    cont.appendChild(player_profile_render_head(data.main.data, true));

    let matches_head = _createElement("div", "matches_head");
    matches_head.appendChild(_createElement("div", ["td", "td_datetime"], localize("player_profile_label_date")));
    matches_head.appendChild(_createElement("div", ["td", "td_mode"],     localize("player_profile_label_game_mode")));
    matches_head.appendChild(_createElement("div", ["td", "td_map"],      localize("player_profile_label_map")));
    matches_head.appendChild(_createElement("div", ["td", "td_length"],   localize("player_profile_label_length")));
    matches_head.appendChild(_createElement("div", ["td", "td_kda"],      localize("player_profile_label_kda")));
    matches_head.appendChild(_createElement("div", ["td", "td_result"],   localize("player_profile_label_result")));
    cont.appendChild(matches_head);

    for (let i=0; i<data.matches.data.length; i++) {
        let m = data.matches.data[i];
        let match_row = _createElement("div", "row");
        match_row.dataset.matchId = m.match_id;
        if (i % 2 == 0) {
            match_row.classList.add("odd");
        }
        _addButtonSounds(match_row, 1);

        match_row.addEventListener("click", player_profile_on_match_select);

        let th_datetime = _createElement("div", ["td", "td_datetime"]);
        th_datetime.textContent = _to_readable_timestamp(m.finish_ts);
        match_row.appendChild(th_datetime);

        let th_mode = _createElement("div", ["td", "td_mode"]);
        if (m.match_mode in global_game_mode_map) {
            th_mode.textContent = localize(global_game_mode_map[m.match_mode].i18n);
        } else {
            th_mode.textContent = m.match_mode;
        }
        match_row.appendChild(th_mode);

        let th_map = _createElement("div", ["td", "td_map"]);
        th_map.textContent = _format_map_name(m.match_map);
        match_row.appendChild(th_map);

        let th_length = _createElement("div", ["td", "td_length"]);
        th_length.textContent = _seconds_to_digital(m.match_time);
        match_row.appendChild(th_length);

        let th_kda = _createElement("div", ["td", "td_kda"]);
        if (m.stats && "f" in m.stats && "d" in m.stats) {
            th_kda.textContent = m.stats.f+" / "+m.stats.d+" / 0";
        }
        match_row.appendChild(th_kda);

        let th_result = _createElement("div", ["td", "td_result"]);
        if (m.team_placement == 254) {
            th_result.textContent = localize("match_forfeit");
        } else {
            th_result.textContent = (m.team_placement + 1) + ".";
        }
        match_row.appendChild(th_result);

        cont.appendChild(match_row);
    }

    return cont;
}

function player_profile_on_match_select(e) {
    // TODO open match page
    // e.currentTarget.dataset.matchId
}

function player_profile_render_stats(data) {
    let cont = _createElement("div", ["stats", "page", "anim_in"]);
    cont.appendChild(player_profile_render_head(data.main.data, true));
    return cont;
}