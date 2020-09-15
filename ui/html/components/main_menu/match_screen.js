function load_match(match_id) {
    let cont = _id("match_screen");
    _empty(cont);

    api_request("GET", "/match/"+match_id, {}, function(data) {
        if (data !== null && Object.keys(data).length !== 0) renderMatchScreen(data.match);
    });
}

function renderMatchScreen(match) {
    console.log(_dump(match));
    let cont = _id("match_screen");
    _empty(cont);
    
    let ffa = false;
    if (match.team_size == 1 && match.team_count > 2) ffa = true;

    let data = prepareMatchTeamData(match);
    let top_stats = prepareMatchTopStats(match);

    let match_cont = _createElement("div", "match");
    match_cont.style.filter = "opacity(0)";
    
    match_cont.style.setProperty("--wstat_count", data.weapons.length);
    match_cont.style.setProperty("--rstat_count", data.rounds);

    // Back button
    let top = _createElement("div", "top");
    match_cont.appendChild(top);

    let back = _createElement("div", ["db-btn", "plain", "back"]);
    _addButtonSounds(back, 2);
    back.addEventListener("click", historyBack);
    top.appendChild(back);

    let match_id = _createElement("div", "match_id", match.match_id);
    match_id.addEventListener("click", function() { engine.call("copy_text", match.match_id); });
    top.appendChild(match_id);

    // ====== //
    // HEADER //
    // ====== //
    let match_head = _createElement("div", "head");
    match_cont.appendChild(match_head);

    let mode_icon = _createElement("div", "mode_icon");
    mode_icon.style.backgroundImage = "url("+global_game_mode_map[match.match_mode].icon+"?s=6)";
    match_head.appendChild(mode_icon);

    let head_left = _createElement("div", "block");
    match_head.appendChild(head_left);
    head_left.appendChild(_createElement("div", "mode", localize(global_game_mode_map[match.match_mode].i18n)));
    let mode_name = '';
    if (match.match_type == MATCH_TYPE_CUSTOM)     mode_name = localize("match_type_custom");
    if (match.match_type == MATCH_TYPE_TOURNAMENT) mode_name = localize("match_type_tournament");
    if (match.match_type == MATCH_TYPE_RANKED)     mode_name = localize("match_type_ranked");
    if (match.match_type == MATCH_TYPE_QUICKPLAY)  mode_name = localize("match_type_quickplay");
    head_left.appendChild(_createElement("div", "match_type", mode_name));

    let head_right = _createElement("div", ["block", "right"]);
    match_head.appendChild(head_right);

    {
        let row = _createElement("div", "row");
        row.appendChild(_createElement("div", "label", localize("match_date")+":"));
        row.appendChild(_createElement("div", "value", _to_readable_timestamp(match.create_ts)));
        head_right.appendChild(row);
    }
    {
        let row = _createElement("div", "row");
        row.appendChild(_createElement("div", "label", localize("match_duration")+":"));
        row.appendChild(_createElement("div", "value", _seconds_to_digital(match.match_time)));
        head_right.appendChild(row);
    }
    {
        let row = _createElement("div", "row");
        row.appendChild(_createElement("div", "label", localize("match_location")+":"));
        row.appendChild(_createElement("div", "value", localize(global_region_map[match.location].i18n)));
        head_right.appendChild(row);
    }

    let map_img = _createElement("div", "map_img");
    map_img.style.backgroundImage = 'url(map_thumbnails/'+match.match_map+'.png)';
    match_head.appendChild(map_img);

    let map_name = _createElement("div", "name", _format_map_name(match.match_map));
    map_img.appendChild(map_name);

    // ==== //
    // TABS //
    // ==== //
    let match_tabs = _createElement("div", "tabs");
    match_cont.appendChild(match_tabs);

    // Scroll area
    let scroll_cont = _createElement("div", ["results", "scroll-outer"]);
    scroll_cont.dataset.sbHideEmpty = true;
    match_cont.appendChild(scroll_cont);

    let scroll_bar = _createElement("div", "scroll-bar");
    scroll_bar.appendChild(_createElement("div", "scroll-thumb"));
    scroll_cont.appendChild(scroll_bar);

    let scroll_inner = _createElement("div", ["scroll-inner"]);
    scroll_cont.appendChild(scroll_inner);

    // ============ //
    // TEAM SUMMARY //
    // ============ //

    if (match.team_size > 1) {
        // data.teams_summary
        let summary_cont = _createElement("div", ["team", "summary"]);
        scroll_inner.appendChild(summary_cont);
        let team_head = _createElement("div", ["row","team_head"]);
        summary_cont.appendChild(team_head);
        team_head.appendChild(_createElement("div", "separator"));
        team_head.appendChild(_createElement("div", "label", localize("stats_score")));
        team_head.appendChild(_createElement("div", "label", localize("stats_frags")));
        team_head.appendChild(_createElement("div", "label", localize("stats_deaths")));
        team_head.appendChild(_createElement("div", "label", localize("stats_assists")));
        team_head.appendChild(_createElement("div", "label", localize("stats_dmg_done")));
        team_head.appendChild(_createElement("div", "label", localize("stats_dmg_taken")));
        team_head.appendChild(_createElement("div", "label", localize("stats_acc")));

        let team_count = 0;
        for (let t of data.teams) {
            if (t.players.length == 0 && t.switched.length == 0) continue;
            
            team_count++;

            let victory = '';
            if (t && t.placement == 0) victory = " - "+localize("ingame_victory");

            let team = _createElement("div", ["row"]);
            summary_cont.appendChild(team);
            if (team_count % 2) team.classList.add("odd");

            let acc = "--";
            if (data.teams_summary[t.team_idx][GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] > 0) acc = Math.round(data.teams_summary[t.team_idx][GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] / data.teams_summary[t.team_idx][GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] * 100) + '%';

            let name = _createElement("div", "name", t.name+victory);
            team.appendChild(name);
            team.appendChild(_createElement("div","stat", data.teams_summary[t.team_idx][GLOBAL_ABBR.STATS_KEY_SCORE]));
            team.appendChild(_createElement("div","stat", data.teams_summary[t.team_idx][GLOBAL_ABBR.STATS_KEY_FRAGS]));
            team.appendChild(_createElement("div","stat", data.teams_summary[t.team_idx][GLOBAL_ABBR.STATS_KEY_DEATHS]));
            team.appendChild(_createElement("div","stat", data.teams_summary[t.team_idx][GLOBAL_ABBR.STATS_KEY_ASSISTS]));
            team.appendChild(_createElement("div","stat", data.teams_summary[t.team_idx][GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED]));
            team.appendChild(_createElement("div","stat", data.teams_summary[t.team_idx][GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN]));
            team.appendChild(_createElement("div","stat", acc));
        }
    }

    // ======= //
    // RESULTS //
    // ======= //

    let tabs = ["scoreboard", "frags", "deaths", "accuracy", "damage", "shots"];
    if (CUSTOM_ROUND_BASED_MODES.includes(match.match_mode)) {
        tabs.push("rounds");
    }
    let tab_elements = [];
    let tab_cont_elements = [];
    for (let current_tab of tabs) {
        let tab = _createElement("div", "tab", localize("match_tab_"+current_tab));
        tab_elements.push(tab);
        match_tabs.appendChild(tab);

        let tab_cont = _createElement("div", ["tab_cont", "tab_cont_"+current_tab]);
        tab_cont_elements.push(tab_cont);
        scroll_inner.appendChild(tab_cont);

        if (current_tab == 'scoreboard') {
            tab.classList.add("active");
            tab_cont.classList.add("active");
        }

        tab.addEventListener("click", function() {
            if (tab.classList.contains("active")) return;
            for (let tmp of tab_elements) tmp.classList.remove("active");
            tab.classList.add("active");

            for (let tmp of tab_cont_elements) tmp.classList.remove("active");
            tab_cont.classList.add("active");

            refreshScrollbar(scroll_cont);
            resetScrollbar(scroll_cont);
        });
        _addButtonSounds(tab, 1);

        let player_count = 0;
        let header_rendered = false;
        for (let t of data.teams) {
            if (t.players.length == 0 && t.switched.length == 0) continue;

            let team_cont = _createElement("div", "team");
            tab_cont.appendChild(team_cont);

            if (match.team_size > 1 && current_tab != "rounds") {
                team_cont.appendChild(renderHeaderRow(current_tab, data.weapons, t));
            } else {
                team_cont.classList.add("solo");
                if (!header_rendered) {
                    team_cont.appendChild(renderHeaderRow(current_tab, data.weapons, t));
                    header_rendered = true;
                }
            }

            if (current_tab == "rounds") {
                let player = null;
                if (t.players.length) player = t.players[0];
                else if (t.switched.length) player = t.switched[0];
                team_cont.appendChild(renderDataRow("rounds", t, player, player_count, current_tab));
                player_count++;
            } else {
                for (let p of t.players) {
                    team_cont.appendChild(renderDataRow("player", t, p, player_count, current_tab, data.weapons));
                    player_count++;
                }

                if (!ffa && t.switched.length > 0 && t.team_idx in data.switched_summary) {
                    team_cont.appendChild(renderDataRow("summary", t, data.switched_summary[t.team_idx], player_count, current_tab, data.weapons));
                    let switched_cont = _createElement("div", "switched_cont");
                    for (let p of t.switched) {
                        switched_cont.appendChild(renderDataRow("player", t, p, player_count, current_tab, data.weapons));
                        player_count++;
                    }
                    team_cont.appendChild(switched_cont);
                }
            }
        }

        // Render players that quit in ffa games
        if (ffa && data.teams[0].switched.length > 0 && 0 in data.switched_summary) {
            let t = {
                "placement": 254,
                "name": "",
                "team_idx": 254,
                "score": 0,
            };
            let team_cont = _createElement("div", "team");
            tab_cont.appendChild(team_cont);
            team_cont.appendChild(renderDataRow("summary", t, data.switched_summary[0], player_count, current_tab, data.weapons));
            let switched_cont = _createElement("div", "switched_cont");
            for (let p of data.teams[0].switched) {
                switched_cont.appendChild(renderDataRow("player", t, p, player_count, current_tab, data.weapons));
                player_count++;
            }
            team_cont.appendChild(switched_cont);
        }
    }

    cont.appendChild(match_cont);

    req_anim_frame(() => {
        initialize_scrollbar(scroll_cont);
        req_anim_frame(() => {
            anim_show(match_cont);
        });
    });

    function renderHeaderRow(current_tab, weapons, t) {
        let victory = '';
        if (t && t.placement == 0) victory = " - "+localize("ingame_victory");

        let team_head = _createElement("div", ["row","team_head"]);

        if (current_tab == "scoreboard") {
            if (match.team_size > 1 && t) {
                team_head.appendChild(_createElement("div", "team_name", t.name+victory));
                if (victory.length) team_head.classList.add("win");
            }
            team_head.appendChild(_createElement("div", "separator"));

            if (match.team_size == 1 && CUSTOM_ROUND_BASED_MODES.includes(match.match_mode)) {
                team_head.appendChild(_createElement("div", "label", localize("stats_rounds")));
            } else {
                team_head.appendChild(_createElement("div", "label", localize("stats_score")));
            }
            team_head.appendChild(_createElement("div", "label", localize("stats_frags")));
            team_head.appendChild(_createElement("div", "label", localize("stats_deaths")));
            team_head.appendChild(_createElement("div", "label", localize("stats_assists")));
            team_head.appendChild(_createElement("div", "label", localize("stats_dmg_done")));
            team_head.appendChild(_createElement("div", "label", localize("stats_dmg_taken")));
            team_head.appendChild(_createElement("div", "label", localize("stats_time")));
            team_head.appendChild(_createElement("div", "label", localize("stats_acc")));
        } else if (current_tab == "rounds") {
            team_head.appendChild(_createElement("div", "", localize("match_tab_rounds")));
            team_head.appendChild(_createElement("div", "separator"));

            if (match.match_mode == "macguffin") {
                team_head.appendChild(_createElement("div", "desc"));
            }

            if (t && t.hasOwnProperty("stats") && t.stats.hasOwnProperty(GLOBAL_ABBR.STATS_KEY_ROUNDS)) {
                for (let r in t.stats[GLOBAL_ABBR.STATS_KEY_ROUNDS]) {
                    team_head.appendChild(_createElement("div", "r_label", Number(r)+1));
                }
            }
        } else {
            if (match.team_size > 1 && t) {
                team_head.appendChild(_createElement("div", "team_name", t.name+victory));
                if (victory.length) team_head.classList.add("win");
            }
            team_head.appendChild(_createElement("div", "separator"));

            if (current_tab == "damage" || current_tab == "shots" || current_tab == "deaths") {
                team_head.appendChild(_createElement("div", "desc"));
            }

            for (let idx of weapons) {
                if (!(idx in global_weapon_idx_name_map2)) continue;
                if (!(global_weapon_idx_name_map2[idx] in global_item_name_map)) continue;

                let weapon_icon = _createElement("div", ["w_label", "icon"]);
                weapon_icon.style.backgroundImage = "url("+global_item_name_map[global_weapon_idx_name_map2[idx]][2]+"?fill="+global_item_name_map[global_weapon_idx_name_map2[idx]][0]+")";
                team_head.appendChild(weapon_icon);
            }
        }

        return team_head;
    }

    function renderDataRow(type, team, p, player_count, tab, weapons) {
        let row = undefined;
        if (type == "summary") row = _createElement("div", ["row", "player", "summary"]);
        if (type == "player") row = _createElement("div", ["row", "player"]);
        if (type == "rounds") row = _createElement("div", ["row", "player", "rounds"]);
        if (!row) return new DocumentFragment();

        if (type == "rounds") {
            if (player_count % 2) row.classList.add("odd");

            let victory = '';
            if (team && team.placement == 0) victory = " - "+localize("ingame_victory");
            if (victory.length) row.classList.add("win");

            if (match.team_size > 1 || !p) {

                let name = _createElement("div", "name", team.name+victory);
                row.appendChild(name);

            } else {
                let country = _createElement("div", "country");
                row.appendChild(country);
                let flag = _createElement("img", "flag");
                flag.src = _flagUrl(p.country);
                country.appendChild(flag);
    
                let avatar = _createElement("div", "avatar");
                avatar.style.backgroundImage = "url("+_avatarUrl(p.avatar)+")";
                row.appendChild(avatar);
                row.appendChild(_createElement("div", "name", p.name+victory));
            }
        }

        if (type == "summary") {
            let arrow = _createElement("div", "arrow");
            arrow.dataset.team = team.team_idx;
            row.appendChild(arrow);
            let name = _createElement("div", "name", localize("match_switched_quit"));
            row.appendChild(name);

            row.addEventListener("click", function() {

                let scroll_cont = row.closest(".scroll-inner");
                if (!scroll_cont) return;

                _for_each_with_class_in_parent(scroll_cont, "arrow", function(el) {
                    if (el.dataset.team != team.team_idx) return;

                    let container = el.closest(".team").querySelector(".switched_cont");
                    if (!container) return;

                    if (el.classList.contains("open")) {
                        el.classList.remove("open");
                        container.classList.remove("open");
                    } else {
                        el.classList.add("open");
                        container.classList.add("open");
                    }
                })

                _play_click1();
            });
        }

        if (type == "player") {
            row.addEventListener("click", function() {
                open_player_profile(p.user_id);
            });
            
            if (player_count % 2) row.classList.add("odd");
            
            let country = _createElement("div", "country");
            row.appendChild(country);
            let flag = _createElement("img", "flag");
            flag.src = _flagUrl(p.country)
            country.appendChild(flag);

            let avatar = _createElement("div", "avatar");
            avatar.style.backgroundImage = "url("+_avatarUrl(p.avatar)+")";
            row.appendChild(avatar);

            let victory = '';
            if (match.team_size == 1 && team && team.placement == 0) {
                victory = " - "+localize("ingame_victory");
                row.classList.add("win");
            }

            let name = _createElement("div", "name", p.name + victory);
            row.appendChild(name);
        }

        if (tab == "scoreboard") {

            let acc = "--";
            if (p.shots_fired > 0) acc = Math.round(p.shots_hit / p.shots_fired * 100) + '%';
            if (match.team_size == 1 && CUSTOM_ROUND_BASED_MODES.includes(match.match_mode)) {
                row.appendChild(_createElement("div","stat", team.score));
            } else {
                row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_SCORE]));
            }
            row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_FRAGS]));
            row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_DEATHS]));
            row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_ASSISTS]));
            row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED]));
            row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN]));
            row.appendChild(_createElement("div","stat", _seconds_to_digital(p.time_played)));
            row.appendChild(_createElement("div","stat", acc));

        } else if (tab == "rounds") {

            if (match.match_mode == "macguffin") {
                let stat_desc = _createElement("div",["desc", "double"]);
                stat_desc.appendChild(_createElement("div", "", localize("stats_score")));
                stat_desc.appendChild(_createElement("div", "", localize("stats_base")));
                row.appendChild(stat_desc);
            }

            if (team && team.hasOwnProperty("stats") && team.stats.hasOwnProperty(GLOBAL_ABBR.STATS_KEY_ROUNDS)) {
                for (let r in team.stats[GLOBAL_ABBR.STATS_KEY_ROUNDS]) {
                    let w_stat = _createElement("div",["r_stat", "double"]);
                    w_stat.appendChild(_createElement("div", "", team.stats[GLOBAL_ABBR.STATS_KEY_ROUNDS][r][GLOBAL_ABBR.STATS_KEY_SCORE]));

                    if (match.match_mode == "macguffin") {
                        let base = "";
                        if (team.stats[GLOBAL_ABBR.STATS_KEY_ROUNDS][r][GLOBAL_ABBR.STATS_KEY_BASE] == 0) base = "A";
                        if (team.stats[GLOBAL_ABBR.STATS_KEY_ROUNDS][r][GLOBAL_ABBR.STATS_KEY_BASE] == 1) base = "B";
                        w_stat.appendChild(_createElement("div", "", base));
                    }

                    row.appendChild(w_stat);
                }
            }

        } else {

            if (tab == "damage" || tab == "shots" || tab == "deaths") {
                let stat_desc = _createElement("div",["desc", "double"]);
                if (tab == "deaths") {
                    stat_desc.appendChild(_createElement("div", "", localize("stats_deaths_from")));
                    stat_desc.appendChild(_createElement("div", "", localize("stats_deaths_while_equipped")));
                }
                if (tab == "damage") {
                    stat_desc.appendChild(_createElement("div", "", localize("stats_done")));
                    stat_desc.appendChild(_createElement("div", "", localize("stats_taken")));
                }
                if (tab == "shots") {
                    stat_desc.appendChild(_createElement("div", "", localize("stats_hit")));
                    stat_desc.appendChild(_createElement("div", "", localize("stats_fired")));
                }
                row.appendChild(stat_desc);
            }

            for (let idx of weapons) {
                if (!(idx in global_weapon_idx_name_map2)) continue;
                if (!(global_weapon_idx_name_map2[idx] in global_item_name_map)) continue;

                let no_data = false;
                if (!("weapon_stats" in p) || !(idx in p.weapon_stats)) no_data = true;
                
                if (no_data) {
                    if (tab == "damage" || tab == "shots") {
                        let w_stat = _createElement("div",["w_stat", "double"]);
                        w_stat.appendChild(_createElement("div", "", "--"));
                        w_stat.appendChild(_createElement("div", "", "--"));
                        row.appendChild(w_stat);
                    } else {
                        row.appendChild(_createElement("div","w_stat", "--"));
                    }
                    continue;
                }
                
                if (tab == "frags") {
                    if (p.weapon_stats[idx][GLOBAL_ABBR.STATS_KEY_FRAGS] == top_stats["weapons"][idx][GLOBAL_ABBR.STATS_KEY_FRAGS]) hl = 'highlight';
                    if (GLOBAL_ABBR.STATS_KEY_FRAGS in p.weapon_stats[idx]) {
                        row.appendChild(_createElement("div",["w_stat", valueHighlight(idx, GLOBAL_ABBR.STATS_KEY_FRAGS, p.weapon_stats, top_stats["weapons"])], p.weapon_stats[idx][GLOBAL_ABBR.STATS_KEY_FRAGS]));
                    } else {
                        row.appendChild(_createElement("div","w_stat", "--"));
                    }
                }
                if (tab == "deaths") {
                    let w_stat = _createElement("div",["w_stat", "double"]);
                    if (GLOBAL_ABBR.STATS_KEY_DEATHS_FROM in p.weapon_stats[idx]) {
                        w_stat.appendChild(_createElement("div", valueHighlight(idx, GLOBAL_ABBR.STATS_KEY_DEATHS_FROM, p.weapon_stats, top_stats["weapons"]), p.weapon_stats[idx][GLOBAL_ABBR.STATS_KEY_DEATHS_FROM]));
                    } else {
                        w_stat.appendChild(_createElement("div","", "--"));
                    }
                    if (GLOBAL_ABBR.STATS_KEY_DEATHS_WHILE_HELD in p.weapon_stats[idx]) {
                        w_stat.appendChild(_createElement("div", valueHighlight(idx, GLOBAL_ABBR.STATS_KEY_DEATHS_WHILE_HELD, p.weapon_stats, top_stats["weapons"]), p.weapon_stats[idx][GLOBAL_ABBR.STATS_KEY_DEATHS_WHILE_HELD]));
                    } else {
                        w_stat.appendChild(_createElement("div","", "--"));
                    }
                    row.appendChild(w_stat);
                }
                if (tab == "accuracy") {
                    if (GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED in p.weapon_stats[idx]) {                        
                        let hit = p.weapon_stats[idx][GLOBAL_ABBR.STATS_KEY_SHOTS_HIT];
                        let fired = p.weapon_stats[idx][GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED];
                        if (fired == 0) {
                            acc = 0;
                        } else {
                            acc = Math.round(hit / fired * 100);
                        }
                        let print_acc = acc+"%";
                        let hl = '';
                        if (acc == top_stats["weapons"][idx]["acc"]) hl = 'highlight';
                        row.appendChild(_createElement("div",["w_stat", hl], print_acc));
                    } else {
                        row.appendChild(_createElement("div","w_stat", "--"));
                    }
                }
                if (tab == "damage") {
                    let w_stat = _createElement("div",["w_stat", "double"]);
                    if (GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED in p.weapon_stats[idx]) {
                        w_stat.appendChild(_createElement("div", valueHighlight(idx, GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED, p.weapon_stats, top_stats["weapons"]), p.weapon_stats[idx][GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED]));
                    } else {
                        w_stat.appendChild(_createElement("div", "", "--"));
                    }
                    if (GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN in p.weapon_stats[idx]) {
                        w_stat.appendChild(_createElement("div", valueHighlight(idx, GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN, p.weapon_stats, top_stats["weapons"]), p.weapon_stats[idx][GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN]));
                    } else {
                        w_stat.appendChild(_createElement("div", "", "--"));
                    }
                    row.appendChild(w_stat);
                }
                if (tab == "shots") {
                    let w_stat = _createElement("div",["w_stat", "double"]);
                    if (GLOBAL_ABBR.STATS_KEY_SHOTS_HIT in p.weapon_stats[idx]) {
                        w_stat.appendChild(_createElement("div", valueHighlight(idx, GLOBAL_ABBR.STATS_KEY_SHOTS_HIT, p.weapon_stats, top_stats["weapons"]), p.weapon_stats[idx][GLOBAL_ABBR.STATS_KEY_SHOTS_HIT]));
                    } else {
                        w_stat.appendChild(_createElement("div", "", "--"));
                    }
                    if (GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED in p.weapon_stats[idx]) {
                        w_stat.appendChild(_createElement("div", valueHighlight(idx, GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED, p.weapon_stats, top_stats["weapons"]), p.weapon_stats[idx][GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED]));
                    } else {
                        w_stat.appendChild(_createElement("div", "", "--"));
                    }
                    row.appendChild(w_stat);
                }
            }

        }

        return row;
    }

    function valueHighlight(idx, key, stats, top) {
        if (!(idx in top)) return '';
        if (!(key in top[idx])) return '';
        if (stats[idx][key] == top[idx][key]) return 'highlight';
        return '';
    }
}

function prepareMatchTopStats(match) {
    let top_stats = {
        "weapons": {}
    };

    for (let c of match.clients) {
        for (let key in c.stats) {
            if (key == GLOBAL_ABBR.STATS_KEY_WEAPONS) {
                for (let w of c.stats[GLOBAL_ABBR.STATS_KEY_WEAPONS]) {

                    let w_idx = w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX];
                    if (!(w_idx in top_stats["weapons"])) top_stats["weapons"][w_idx] = {};

                    if (!("acc" in top_stats["weapons"][w_idx])) top_stats["weapons"][w_idx]["acc"] = 0;

                    let hit = 0;
                    let fired = 0;
                    let acc = 0;
                    if (GLOBAL_ABBR.STATS_KEY_SHOTS_HIT in w) hit = w[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT];
                    if (GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED in w) fired = w[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED];
                    if (fired == 0) {
                        acc = 0;
                    } else {
                        acc = Math.round(hit / fired * 100);
                    }
                    if (acc > top_stats["weapons"][w_idx]["acc"]) top_stats["weapons"][w_idx]["acc"] = acc;

                    for (let w_key in w) {
                        if (!(w_key in top_stats["weapons"][w_idx])) top_stats["weapons"][w_idx][w_key] = w[w_key];
                        if (w_key == GLOBAL_ABBR.STATS_KEY_FRAGS && w[w_key] > top_stats["weapons"][w_idx][w_key]) top_stats["weapons"][w_idx][w_key] = w[w_key];
                        if (w_key == GLOBAL_ABBR.STATS_KEY_ASSISTS && w[w_key] > top_stats["weapons"][w_idx][w_key]) top_stats["weapons"][w_idx][w_key] = w[w_key];
                        if (w_key == GLOBAL_ABBR.STATS_KEY_DEATHS_FROM && w[w_key] < top_stats["weapons"][w_idx][w_key]) top_stats["weapons"][w_idx][w_key] = w[w_key];
                        if (w_key == GLOBAL_ABBR.STATS_KEY_DEATHS_WHILE_HELD && w[w_key] < top_stats["weapons"][w_idx][w_key]) top_stats["weapons"][w_idx][w_key] = w[w_key];
                        if (w_key == GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN && w[w_key] < top_stats["weapons"][w_idx][w_key]) top_stats["weapons"][w_idx][w_key] = w[w_key];
                        if (w_key == GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED && w[w_key] > top_stats["weapons"][w_idx][w_key]) top_stats["weapons"][w_idx][w_key] = w[w_key];
                        if (w_key == GLOBAL_ABBR.STATS_KEY_SHOTS_HIT && w[w_key] > top_stats["weapons"][w_idx][w_key]) top_stats["weapons"][w_idx][w_key] = w[w_key];
                        if (w_key == GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED && w[w_key] > top_stats["weapons"][w_idx][w_key]) top_stats["weapons"][w_idx][w_key] = w[w_key];
                    }
                }
            } else {
                if (!(key in top_stats)) top_stats[key] = c.stats[key];
                if (key == GLOBAL_ABBR.STATS_KEY_SCORE && c.stats[key] > top_stats[key]) top_stats[key] = c.stats[key];
                if (key == GLOBAL_ABBR.STATS_KEY_FRAGS && c.stats[key] > top_stats[key]) top_stats[key] = c.stats[key];
                if (key == GLOBAL_ABBR.STATS_KEY_ASSISTS && c.stats[key] > top_stats[key]) top_stats[key] = c.stats[key];
                if (key == GLOBAL_ABBR.STATS_KEY_DEATHS && c.stats[key] < top_stats[key]) top_stats[key] = c.stats[key];
                if (key == GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN && c.stats[key] < top_stats[key]) top_stats[key] = c.stats[key];
                if (key == GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED && c.stats[key] > top_stats[key]) top_stats[key] = c.stats[key];
            }
        }
    }

    return top_stats;
}

function prepareMatchTeamData(match) {
    let match_teams = {};
    for (let team of match.teams) {
        match_teams[team.team_idx] = team;
    }

    let teams = [];
    let teams_summary = {};
    let switched_summary = {};
    let rounds = 0;
    for (let i=0; i<match.team_count; i++) {
        let team = {
            "score": 0,
            "name": "Team "+(i+1),
            "stats": {},
            "placement": 254,
            "team_idx": i,
        };
        if (i in match_teams) team = match_teams[i];

        team.players = [];
        team.switched = [];
        teams.push(team);

        teams_summary[i] = {};
        teams_summary[i][GLOBAL_ABBR.STATS_KEY_SCORE] = 0;
        teams_summary[i][GLOBAL_ABBR.STATS_KEY_FRAGS] = 0;
        teams_summary[i][GLOBAL_ABBR.STATS_KEY_ASSISTS] = 0;
        teams_summary[i][GLOBAL_ABBR.STATS_KEY_DEATHS] = 0;
        teams_summary[i][GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] = 0;
        teams_summary[i][GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] = 0;
        teams_summary[i][GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] = 0;
        teams_summary[i][GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] = 0;

        switched_summary[i] = {};
        switched_summary[i].time_played = 0;
        switched_summary[i].stats = {};
        switched_summary[i].stats[GLOBAL_ABBR.STATS_KEY_SCORE] = 0;
        switched_summary[i].stats[GLOBAL_ABBR.STATS_KEY_FRAGS] = 0;
        switched_summary[i].stats[GLOBAL_ABBR.STATS_KEY_ASSISTS] = 0;
        switched_summary[i].stats[GLOBAL_ABBR.STATS_KEY_DEATHS] = 0;
        switched_summary[i].stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] = 0;
        switched_summary[i].stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] = 0;
        switched_summary[i].shots_fired = 0;
        switched_summary[i].shots_hit = 0;
        
        switched_summary[i].weapon_stats = {};

        if (team.hasOwnProperty("stats") && team.stats.hasOwnProperty(GLOBAL_ABBR.STATS_KEY_ROUNDS)) rounds = Object.keys(team.stats[GLOBAL_ABBR.STATS_KEY_ROUNDS]).length;
    }

    let weapons_included = {};
    for (let i=0; i<match.clients.length; i++) {
        if (match.clients[i].team_idx >= 0 && match.clients[i].team_idx < match.team_count) {
            let tidx = match.clients[i].team_idx;
            let switched_tidx = match.clients[i].team_idx;

            // If ffa mode we collect switched/quit players in team idx 0
            if (match.team_count > 2 && match.team_size == 1) switched_tidx = 0;

            let switched = false;
            if (match.clients[i].last_entry && match.clients[i].finished) {
                teams[tidx].players.push(match.clients[i]);
            } else {
                switched = true;
                teams[switched_tidx].switched.push(match.clients[i]);
                switched_summary[switched_tidx].time_played += match.clients[i].time_played;
            }

            if (!match.clients[i].stats) {
                match.clients[i].stats = {};
                continue;
            }

            if (GLOBAL_ABBR.STATS_KEY_WEAPONS in match.clients[i].stats) {
                match.clients[i].weapon_stats = {};
                match.clients[i].shots_fired = 0;
                match.clients[i].shots_hit = 0;
                for (let w of match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_WEAPONS]) {
                    if (!global_weapons_in_scoreboard.includes(w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX])) continue;

                    weapons_included[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]] = true;
                    match.clients[i].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]] = w;

                    if (GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED in w) {
                        match.clients[i].shots_fired += w[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED];
                        teams_summary[tidx][GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] += w[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED];
                        if (switched) switched_summary[switched_tidx].stats[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] += w[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED];
                    }
                    if (GLOBAL_ABBR.STATS_KEY_SHOTS_HIT in w) {
                        match.clients[i].shots_hit += w[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT];
                        teams_summary[tidx][GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] += w[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT];
                        if (switched) switched_summary[switched_tidx].stats[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] += w[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT];
                    }

                    if (switched) {
                        if (!(w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX] in switched_summary[switched_tidx].weapon_stats)) {
                            switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]] = {};
                            switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_FRAGS] = 0;
                            switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_ASSISTS] = 0;
                            switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_DEATHS] = 0;
                            switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] = 0;
                            switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] = 0;
                            switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] = 0;
                            switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] = 0;
                        }
                        if (GLOBAL_ABBR.STATS_KEY_FRAGS in w)            switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_FRAGS] += w[GLOBAL_ABBR.STATS_KEY_FRAGS];
                        if (GLOBAL_ABBR.STATS_KEY_ASSISTS in w)          switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_ASSISTS] += w[GLOBAL_ABBR.STATS_KEY_ASSISTS];
                        if (GLOBAL_ABBR.STATS_KEY_DEATHS in w)           switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_DEATHS] += w[GLOBAL_ABBR.STATS_KEY_DEATHS];
                        if (GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN in w)     switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] += w[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN];
                        if (GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED in w) switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] += w[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED];
                        if (GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED in w) {
                            switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] += w[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED];
                            switched_summary[switched_tidx].shots_fired += w[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED];
                        }
                        if (GLOBAL_ABBR.STATS_KEY_SHOTS_HIT in w) {
                            switched_summary[switched_tidx].weapon_stats[w[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]][GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] += w[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT];
                            switched_summary[switched_tidx].shots_hit += w[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT];
                        }
                    }
                }
            }

            if (GLOBAL_ABBR.STATS_KEY_SCORE in match.clients[i].stats) {
                teams_summary[tidx][GLOBAL_ABBR.STATS_KEY_SCORE] += match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_SCORE];
                if (switched) switched_summary[switched_tidx].stats[GLOBAL_ABBR.STATS_KEY_SCORE] += match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_SCORE];
            }
            if (GLOBAL_ABBR.STATS_KEY_FRAGS in match.clients[i].stats) {
                teams_summary[tidx][GLOBAL_ABBR.STATS_KEY_FRAGS] += match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_FRAGS];
                if (switched) switched_summary[switched_tidx].stats[GLOBAL_ABBR.STATS_KEY_FRAGS] += match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_FRAGS];
            }
            if (GLOBAL_ABBR.STATS_KEY_ASSISTS in match.clients[i].stats) {
                teams_summary[tidx][GLOBAL_ABBR.STATS_KEY_ASSISTS] += match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_ASSISTS];
                if (switched) switched_summary[switched_tidx].stats[GLOBAL_ABBR.STATS_KEY_ASSISTS] += match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_ASSISTS];
            }
            if (GLOBAL_ABBR.STATS_KEY_DEATHS in match.clients[i].stats) {
                teams_summary[tidx][GLOBAL_ABBR.STATS_KEY_DEATHS] += match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_DEATHS];
                if (switched) switched_summary[switched_tidx].stats[GLOBAL_ABBR.STATS_KEY_DEATHS] += match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_DEATHS];
            }
            if (GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN in match.clients[i].stats) {
                teams_summary[tidx][GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] += match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN];
                if (switched) switched_summary[switched_tidx].stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] += match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN];
            }
            if (GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED in match.clients[i].stats) {
                teams_summary[tidx][GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] += match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED];
                if (switched) switched_summary[switched_tidx].stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] += match.clients[i].stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED];
            }
        }
    }

    for (let t of teams) {
        t.players.sort(sortPlayersByStats);
        t.switched.sort(sortPlayersByStats);
    }

    teams.sort(function(a, b) { return a.placement - b.placement; });

    let weapons = [];
    for (let idx in weapons_included) weapons.push(Number(idx));
    weapons.sort(function(a ,b) { return a - b; });

    return {
        "teams": teams,
        "teams_summary": teams_summary,
        "switched_summary": switched_summary,
        "weapons": weapons,
        "rounds": rounds,
    };
}