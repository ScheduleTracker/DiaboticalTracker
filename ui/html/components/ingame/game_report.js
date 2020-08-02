

let global_game_report_active = false;
let global_game_report_countdown_interval = false;
let global_game_report_countdown = 45;
let global_game_report_rewards = [];
let global_game_report_achievement_rewards = [];
let global_game_report_progression = false;
let global_game_report_progression_map = {};
let global_game_report_progression_switch = undefined;
let global_game_report_user_switched_view = false;

let global_game_report_rematch_enabled = false;
let global_game_report_rematch_requested = false;

function init_hud_screen_game_report() {

    _id("game_report_cont").querySelector(".chat_input").addEventListener("blur", function() {
        engine.call('set_chat_enabled', false);
    });

    /**
     * json_game_status json server_status update from the gameserver
     * model_data Object gameface data model, should not be used anymore
     * json_snafu_data json Native snafu data model
     */
    bind_event('set_game_report', function (json_game_status, model_data, json_snafu_data) {
        console.error("set_game_report");
        if (!json_game_status)  return;

        send_view_data("menu", "reset_own_profile_cache");

        try {
            var game_status = JSON.parse(json_game_status);
            var snafu_data = JSON.parse(json_snafu_data);
            //console.log("game_status", _dump(game_status));
            //console.log("snafu_data", _dump(snafu_data));
        } catch(e) {
            console.log("game_report json parse error");
            console.error("game_report json parse error #1 ", json_game_status);
            console.error("game_report json parse error #2 ", json_snafu_data);
        }

        let countdown_text = _id("game_report_cont").querySelector(".countdown .text");
        if (game_data.continuous == 0) countdown_text.textContent = localize("report_leaving_game_in");
        if (game_data.continuous == 1) countdown_text.textContent = localize("report_next_map_in");

        console.error("set_game_report #1");
        game_report_reset_rematch_option();

        let game_report_countdown = _id("game_report_countdown");
        if (global_game_report_countdown_interval) clearInterval(global_game_report_countdown_interval);

        game_report_countdown.textContent = global_game_report_countdown;
        global_game_report_countdown_interval = setInterval(function() {
            global_game_report_countdown = global_game_report_countdown - 1;
            if (global_game_report_countdown < 0) { 
                global_game_report_countdown = 0;
                clearInterval(global_game_report_countdown_interval);
            }
            game_report_countdown.textContent = global_game_report_countdown;
        },1000);

        console.error("set_game_report #2");
        engine.call('set_chat_enabled', false);


        // sort all clients by score (independent of team)
        game_status.clients.sort(sortPlayersByStats);

        console.error("set_game_report #3");
        // Organize players into team arrays within the server_status object
        for (var i = 0; i < game_status.clients.length; i++) {
            var teamId = game_status.clients[i].team;
            if (teamId >= 0 && teamId < 200) {
                // Hack to make the game report work again until the server starts pre-filling all team entries rather than just the ones for initially connected players
                if (!game_status.teams[teamId]) game_status.teams[teamId] = {
                    "score": 0,
                    "placement": 999,
                    "name": "Team "+(teamId+1),
                    "color": "#ffffff"
                }

                if (game_status.teams[teamId].players === undefined) {
                    game_status.teams[teamId].players = [];
                }

                game_status.teams[teamId].players.push(game_status.clients[i]);
                
                // get the correct team color from the data model (in case of color overrides being used)
                for (let team of snafu_data.teams) {
                    if (teamId == team.team_id) {
                        game_status.teams[teamId].color = team.color;
                        game_status.teams[teamId].color_dark = team.color_dark;
                        game_status.teams[teamId].color_darker = team.color_darker;
                        break;
                    }
                }
            }
        }

        console.error("set_game_report #4");
        // Make sure there is an entry for at least own and enemy team
        if (!(snafu_data["game_data.own_team.team_id"] in game_status.teams))   game_status.teams[snafu_data["game_data.own_team.team_id"]] = { "score": 0 };
        if (!(snafu_data["game_data.enemy_team.team_id"] in game_status.teams)) game_status.teams[snafu_data["game_data.enemy_team.team_id"]] = { "score": 0 };

        // Create a single array of teams
        var result = Object.keys(game_status.teams).map(function(key) {
            return game_status.teams[key];
        });

        // Sort the new teams array by their placement (this refers to data.teams[idx].placement), lower number means better placement
        result.sort((a, b) => {
            // -1 == forfeit, put those at the end
            if (a.placement == -1) return -1;
            return (a.placement > b.placement) ? 1 : -1
        });

        console.error("set_game_report #5");
        create_game_report(game_status, snafu_data);
    });

    bind_event('show_game_report', function (visible) {
        console.error("show_game_report");
        //console.log("show_game_report", visible);
        global_game_report_active = visible;

        if (visible) {

            // hide / disable the normal chat in case its active so the game report chat responds correctly
            set_chat(false);

            // Set up the bottom view
            game_report_bottom_view();

            anim_show(_id("game_report"), 500, "flex");

            if (global_show_rank_change) {
                showRankScreen(function() {
                    anim_show(_id("game_report_cont").querySelector(".bottom .container"));
                    anim_show(_id("game_report_cont").querySelector(".bottom .menu"));
                    setTimeout(function() {
                        if (global_game_report_progression) {
                            animate_bp_progress();
                        }
                    }, 1000);
                }, true);

                anim_show(_id("game_report_cont"), 500, "flex");
                global_show_rank_change = false;
            } else {
                anim_show(_id("game_report_cont"), 100, "flex", function() {
                    if (global_game_report_progression) {
                        animate_bp_progress();
                    }
                });
            }

            
            //anim_hide(_id("game_hud"), 100); //Just in case, seems like show_ingame_hud gets called sometimes when it shouldn't :S

            // Hide the chat elements since game_report has its own chat ui
            anim_hide(game_hud_special, 100);

            let scoreboard_scroll = _id("game_report_cont").querySelector(".report_scoreboard");
            if (scoreboard_scroll) refreshScrollbar(scoreboard_scroll);

        } else {
            anim_hide(_id("game_report_cont"), 100);
            anim_hide(_id("game_report"), 100);
        }
    });

    /*
    _id("game_report_chat_bar").addEventListener("keydown", function (event) {
        if (event.keyCode == 13) { //return

            if (/\S/.test( _id("game_report_chat_bar").value)) {
                engine.call('game_chat_return', _id("game_report_chat_bar").value);
            }

            _id("game_report_chat_bar").value = "";
        }
    });
    */

    let scoreboard_scroll = _id("game_report_cont").querySelector(".report_scoreboard");
    initialize_scrollbar(scoreboard_scroll);
}


function create_game_report(game_status, snafu_data) {
    //console.log("game_status", _dump(game_status));
    console.error("create_game_report #1");

    let game_report = _id("game_report_cont");
    let head = game_report.querySelector(".head");
    let scoreboard = _id("report_scoreboard");
    _empty(head);
    _empty(scoreboard);

    console.error("create_game_report #1-2");
    
    let player_lookup = {};
    let placement_lookup = {};
    for (let t of snafu_data.teams) {
        t.players = [];
        for (let c of game_status.clients) {
            if (t.team_id == c.team) {
                t.players.push(c);
            }
        }

        if (t.team_id in game_status.teams) {
            game_status.teams[t.team_id].team_id = t.team_id;
            placement_lookup[game_status.teams[t.team_id].placement] = t;
        }
    }

    for (let p of snafu_data.players) {
        player_lookup[p.user_id] = p;
    }

    let first_user_own = undefined;
    let first_user_enemy = undefined;
    if (snafu_data.own_team_players.length) first_user_own = snafu_data.own_team_players[0];
    if (snafu_data.enemy_team_players.length) first_user_enemy = snafu_data.enemy_team_players[0];

    console.error("create_game_report #2");

    //console.log("game_status", _dump(game_status));
    //console.log("snafu_data", _dump(snafu_data));

    let team_size = Number(snafu_data["game_data.team_size"]);
    let team_count = Number(snafu_data["game_data.team_count"]);

    // Create a single array of teams
    var teams = Object.keys(game_status.teams).map(function(key) { return game_status.teams[key]; });

    // Sort the new teams array by their placement (this refers to game_status.teams[idx].placement), lower number means better placement
    teams.sort((a, b) => {
        // -1/255 == forfeit, put those at the end
        if (a.placement == -1 || a.placement == 255) return -1;
        return (a.placement > b.placement) ? 1 : -1
    });

    let victory = false;
    if (game_status.teams[snafu_data["game_data.own_team.team_id"]].placement == 0) victory = true;
    console.error("create_game_report #3");
    //======//
    // HEAD //
    //======//

    let result_text = (victory) ? localize("ingame_victory") : localize("ingame_defeat");
    if (snafu_data["game_data.spectator"] == "true") result_text = "";

    let head_fragment = new DocumentFragment();
    head_fragment.appendChild(_createElement("div", ["head_side", "result_text"], result_text));

    let head_center = _createElement("div", "head_center");

    if (["brawl","race"].includes(game_status.mode) && team_size == 1) {
        let single_winner = _createElement("div", "winner");
        if (placement_lookup["0"] && placement_lookup["0"].players.length) {
            single_winner.appendChild(_createElement("div", "name", placement_lookup["0"].players[0].name));
            single_winner.appendChild(_createElement("div", "label", localize("ingame_winner")));
        }
        head_center.appendChild(single_winner);
        single_winner.style.setProperty("--team_color", placement_lookup[0].color);
    } else if (["brawl","race"].includes(game_status.mode) && team_count > 2) {
        let single_winner = _createElement("div", "winner");
        if (placement_lookup["0"]) {
            single_winner.appendChild(_createElement("div", "name", placement_lookup["0"].team_name));
            single_winner.appendChild(_createElement("div", "label", localize("ingame_winner")));
        }
        head_center.appendChild(single_winner);
        single_winner.style.setProperty("--team_color", placement_lookup[0].color);
    } else {
        let score_left = _createElement("div", ["score_cont", "left"]);
        score_left.style.setProperty("--team_color", snafu_data["game_data.own_team.color"]);
        if (game_status.mode == "duel" || (team_count == 2 && team_size == 1)) {
            let name_left = _createElement("div", "name");
            if (first_user_own) {
                name_left.textContent = first_user_own.name;
            }
            score_left.appendChild(name_left);
        } else {
            score_left.appendChild(_createElement("div", "name", snafu_data["game_data.own_team.team_name"]));
        }
        score_left.appendChild(_createElement("div", "value", game_status.teams[snafu_data["game_data.own_team.team_id"]].score));
        head_center.appendChild(score_left);

        head_center.appendChild(_createElement("div","separator"));

        let score_right = _createElement("div", ["score_cont", "right"]);
        score_right.style.setProperty("--team_color", snafu_data["game_data.enemy_team.color"]);
        score_right.appendChild(_createElement("div", "value", game_status.teams[snafu_data["game_data.enemy_team.team_id"]].score));
        if (game_status.mode == "duel" || (team_count == 2 && team_size == 1)) {
            let name_right = _createElement("div", "name");
            if (first_user_enemy) {
                name_right.textContent = first_user_enemy.name;
            }
            score_right.appendChild(name_right);
        } else {
            score_right.appendChild(_createElement("div", "name", snafu_data["game_data.enemy_team.team_name"]));
        }
        head_center.appendChild(score_right);
    }
    
    head_fragment.appendChild(head_center);

    let head_right = _createElement("div", ["head_side", "mode_map_time"]);
    head_right.appendChild(_createElement("div", "mode", localize(global_game_mode_map[game_status.mode].i18n)));
    head_right.appendChild(_createElement("div", "map", _format_map_name(game_status.map)));
    head_right.appendChild(_createElement("div", "time", _seconds_to_digital(game_status.match_time)));
    head_fragment.appendChild(head_right);

    head.appendChild(head_fragment);
    console.error("create_game_report #4");
    //=================//
    // MAIN SCOREBOARD //
    //=================//

    let show_team_names = true;
    if (team_size == 1) {
        show_team_names = false;
    }

    let self_stats = undefined;

    let scoreboard_fragment = new DocumentFragment();

    /*
    if (game_status.mode == "duel") {
        scoreboard_fragment.appendChild(_createElement("div","duel","TBA"));
    } else {
        */
        let player_rows = 0;
        let header_row_rendered = false;
        for (let t of teams) {
            let team_id = t.team_id;

            if (team_id < 0) continue;
            if (!t.players || !t.players.length) continue;
            
            let team = _createElement("div", "team");
            let team_name = t.name;

            if (team_id in game_status.teams) {
                team.style.setProperty("--team_color", game_status.teams[team_id].color);
                team.style.setProperty("--team_color2", game_status.teams[team_id].color_dark);
                team_name = game_status.teams[team_id].team_name;
            }
       
            if (show_team_names || !header_row_rendered) {
                let head_row = _createElement("div", "head_row");

                if (!show_team_names) team_name = "";
                head_row.appendChild(_createElement("div","team_name", team_name));

                if (!header_row_rendered) {
                    if (snafu_data["game_data.ranked"] == "1") {
                        head_row.appendChild(_createElement("div","label", localize("stats_rank")));
                    }
                    if (game_status.mode == "race") {
                        head_row.appendChild(_createElement("div","label", localize("stats_best_time")));
                    } else {
                        if (game_status.mode == "ctf") {
                            head_row.appendChild(_createElement("div","label", localize("stats_captures")));
                        } else {
                            head_row.appendChild(_createElement("div","label", localize("stats_score")));
                        }
                        head_row.appendChild(_createElement("div","label", localize("stats_frags")));
                        head_row.appendChild(_createElement("div","label", localize("stats_deaths")));
                        //if (team_size > 1) {
                            head_row.appendChild(_createElement("div","label", localize("stats_assists")));
                        //}
                        head_row.appendChild(_createElement("div","label", localize("stats_dmg_done")));
                        head_row.appendChild(_createElement("div","label", localize("stats_dmg_taken")));
                        //head_row.appendChild(_createElement("div","label", localize("stats_time")));
                        //head_row.appendChild(_createElement("div","label", localize("stats_acc")));
                        if (current_match.match_type == MATCH_TYPE_RANKED || current_match.match_type == MATCH_TYPE_QUICKPLAY) {
                            head_row.appendChild(_createElement("div", "label", localize("commend")));
                        }
                        header_row_rendered = true;
                    }
                }
                team.appendChild(head_row);
            }

            // Reset the odd/even row colors if each team has more than one player
            if (team_size > 1) {
                player_rows = 0;
            }

            if ("players" in t && t.players.length) {
                for (let p of t.players) {
                    /*
                    if (!player_lookup[p.user_id]) {
                        console.log("missing player_data", p.user_id, _dump(p));
                        continue;
                    }
                    */
                    if (!p.stats) {
                        console.log("missing player stats", p.user_id, _dump(p));
                        continue;
                    }
                    player_rows++;

                    let player_row = _createElement("div", "player_row");
                    if (player_rows % 2 == 0) player_row.classList.add("even");
                    
                    if (global_self.user_id == p.user_id) {
                        player_row.classList.add("self");
                        self_stats = p.stats;
                    }

                    let avatar = _createElement("div", "avatar");
                    if (player_lookup[p.user_id]) avatar.style.backgroundImage = "url("+_avatarUrl(player_lookup[p.user_id].avatar)+")";
                    player_row.appendChild(avatar);
                    player_row.appendChild(_createElement("div","name", p.name));

                    if (snafu_data["game_data.ranked"] == "1") {
                        let rank_icon_cont = _createElement("div", "rank");
                        if (p.user_id == global_self.user_id && current_match.mm_mode && current_match.mm_mode in global_self.mmr) {
                            rank_icon_cont.appendChild(renderRankIcon(global_self.mmr[current_match.mm_mode].rank_tier, global_self.mmr[current_match.mm_mode].rank_position, team_size, "small"));
                        } else {
                            if (player_lookup[p.user_id]) rank_icon_cont.appendChild(renderRankIcon(player_lookup[p.user_id].rank_tier, player_lookup[p.user_id].rank_position, team_size, "small"));
                        }
                        player_row.appendChild(rank_icon_cont);
                    }

                    if (game_status.mode == "race") {
                        if (player_lookup[p.user_id]) player_row.appendChild(_createElement("div","stat", player_lookup[p.user_id].best_time));
                    } else {
                        player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_SCORE]));
                        player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_FRAGS]));
                        player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_DEATHS]));
                        //if (team_size > 1) {
                            player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_ASSISTS]));
                        //}
                        player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED]));
                        player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN]));
                        //player_row.appendChild(_createElement("div","stat", "--"));
                        //player_row.appendChild(_createElement("div","stat", "--"));

                        if (current_match.match_type == MATCH_TYPE_RANKED || current_match.match_type == MATCH_TYPE_QUICKPLAY) {
                            let commend_cont = _createElement("div", ["stat"]);
                            // Check that the user_id is not in our party
                            if (p.user_id != global_self.user_id && 
                                p.user_id in current_match.clients && 
                                global_self.user_id in current_match.clients && 
                                current_match.clients[p.user_id].party != current_match.clients[global_self.user_id].party) {

                                let commend = _createElement("div", "commend");
                                commend.addEventListener("click", function(e) {
                                    if (commend.classList.contains("commended")) return;

                                    _play_click1();
                                    e.stopPropagation();

                                    commend.classList.add("commended");
                                    send_string(CLIENT_COMMAND_COMMEND, p.user_id);
                                });
                                commend_cont.appendChild(commend);
                            }
                            player_row.appendChild(commend_cont);
                        }
                    }
                    team.appendChild(player_row);

                    player_row.addEventListener("click", function() {
                        _play_click1();

                        let prev_sel = scoreboard.querySelectorAll(".selected");
                        if (prev_sel.length) {
                            for (let i=0; i<prev_sel.length; i++) prev_sel[i].classList.remove("selected");
                        }
                        player_row.classList.add("selected");
                        selectPlayer(p.stats, true);
                    });
                }
            }

            scoreboard_fragment.appendChild(team);

            if (team_size > 1) {
                scoreboard_fragment.appendChild(_createElement("div", "separator"));
            }
        }
    //}
    scoreboard.appendChild(scoreboard_fragment);
    console.error("create_game_report #5");
    if (self_stats) selectPlayer(self_stats, false);
    console.error("create_game_report #6");
    renderMapVote();
    console.error("create_game_report #7");
}

function updateGameReportRank(mode) {
    if (!(mode in global_self.mmr)) return;
    if (!(mode in global_queues)) return;

    let self_rank = _id("game_report_cont").querySelector(".player_row.self .rank");
    if (self_rank) {
        _empty(self_rank);
        self_rank.appendChild(renderRankIcon(global_self.mmr[mode].rank_tier, global_self.mmr[mode].rank_position, global_queues[mode].team_size, "small"));
    }
}

function selectPlayer(stats, show) {
    let cont = _id("game_report_stats");

    let stats_cont = _createElement("div", "stats");

    let legend = _createElement("div", "legend");
    legend.appendChild(_createElement("div", "placeholder"));
    legend.appendChild(_createElement("div", "label", localize("stats_frags")+" / "+localize("stats_deaths")));
    legend.appendChild(_createElement("div", "label", localize("stats_dmg_done")));
    legend.appendChild(_createElement("div", "label", localize("stats_dmg_taken")));
    legend.appendChild(_createElement("div", "label", localize("stats_hit")+" / "+localize("stats_fired")));
    legend.appendChild(_createElement("div", "label", localize("stats_accuracy")));
    stats_cont.appendChild(legend);

    if (GLOBAL_ABBR.STATS_KEY_WEAPONS in stats) {
        for (let s of stats[GLOBAL_ABBR.STATS_KEY_WEAPONS]) {

            // Only show stats of main weapons
            if (!global_weapons_in_scoreboard.includes(s[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX])) continue;

            let weapon = _createElement("div", "weapon");

            let w_data = undefined;
            if (s[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX] in global_weapon_idx_name_map2) {
                w_data = global_item_name_map[global_weapon_idx_name_map2[s[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]]];
            }

            let s_frags = (s[GLOBAL_ABBR.STATS_KEY_FRAGS] !== undefined) ? s[GLOBAL_ABBR.STATS_KEY_FRAGS] : "--";
            let s_deaths = (s[GLOBAL_ABBR.STATS_KEY_DEATHS_FROM] !== undefined) ? s[GLOBAL_ABBR.STATS_KEY_DEATHS_FROM] : "--";
            let s_dmg_i = (s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] !== undefined) ? s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] : "--";
            let s_dmg_t = (s[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] !== undefined) ? s[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] : "--";
            let s_shots_h = (s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] !== undefined) ? s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] : "--";
            let s_shots_f = (s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] !== undefined) ? s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] : "--";
            let s_acc = '--';
            if (s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] !== undefined && s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] !== undefined) {
                if (s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] > 0)
                    s_acc = Math.round(s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] / s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] * 100);
                else
                    s_acc = 0; 
            }
            

            let icon = _createElement("div", "icon");
            if (w_data) icon.style.backgroundImage = "url("+w_data[2]+"?fill="+w_data[0]+")";
            weapon.appendChild(icon);
            weapon.appendChild(_createElement("div", "stat", s_frags+" / "+s_deaths));
            weapon.appendChild(_createElement("div", "stat", s_dmg_i));
            weapon.appendChild(_createElement("div", "stat", s_dmg_t));
            weapon.appendChild(_createElement("div", "stat", s_shots_h+" / "+s_shots_f));
            weapon.appendChild(_createElement("div", "stat", s_acc+"%"));

            stats_cont.appendChild(weapon);
        }
    }

    _empty(cont);
    cont.appendChild(stats_cont);

    if (show) game_report_show_stats();
}

function renderMapVote() {
    console.error("renderMapVote #1");
    let map_vote_cont = _id("game_report_map_vote");
    _empty(map_vote_cont);

    let map_vote_btn = _id("game_report_cont").querySelector(".bottom .menu .btn.map_vote");
    if (game_data.continuous == 1) map_vote_btn.style.display = "block";
    else map_vote_btn.style.display = "none";

    let maps = [];
    if (game_data.map_list.length) maps = game_data.map_list.split(":");

    // Filter out the map that was just played, unless its the only map in the list
    let valid_maps = [];
    if (maps.length > 1) {
        for (let map of maps) {
            if (map != game_data.map) valid_maps.push(map);
        }
    }

    if (valid_maps.length > 4) {
        valid_maps = getRandomElementsFromArray(valid_maps, 4);
    }

    let container = _createElement("div", "map_vote_cont");
    container.appendChild(_createElement("div", "title", localize("vote_next_map")));
    console.error("renderMapVote #2");
    let map_list = _createElement("div", "map_list");
    for (let map of valid_maps) {
        let map_div = _createElement("div", ["map", "vote_option"]);
        map_div.dataset.option = map;
        map_div.style.backgroundImage = "url("+_mapUrl(map)+")";
        map_div.appendChild(_createElement("div","name",_format_map_name(map)));

        map_div.appendChild(_createElement("div", "vote_cont"));

        map_div.addEventListener("click", function() {
            _play_click1();

            let prev = map_list.querySelector(".selected");
            if (prev) prev.classList.remove("selected");

            map_div.classList.add("selected");

            send_string(CLIENT_COMMAND_SELECT_MAP, map);
        });

        map_list.appendChild(map_div);
    }
    container.appendChild(map_list);

    map_vote_cont.appendChild(container);
    console.error("renderMapVote #3");
}

function game_report_update_vote_counts(data) {
    if (!global_game_report_active) return;

    let cont = undefined;
    if (data.type == "map") cont = _id("game_report_map_vote");
    if (data.type == "mode") return;
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

function game_report_show_map_vote(click) {
    if (click) {
        _play_click1();
        global_game_report_user_switched_view = true;
    }
    game_report_switch_bottom_content(_id("game_report_cont").querySelector(".bottom .menu .btn.map_vote"), _id("game_report_map_vote"));
}

function game_report_show_progression(click) {
    if (click) {
        _play_click1();
        global_game_report_user_switched_view = true;
    }
    game_report_switch_bottom_content(_id("game_report_cont").querySelector(".bottom .menu .btn.progress"), _id("game_report_progression"));
}

function game_report_show_stats(click) {
    if (click) {
        _play_click1();
        global_game_report_user_switched_view = true;
    }
    game_report_switch_bottom_content(_id("game_report_cont").querySelector(".bottom .menu .btn.stats"), _id("game_report_stats"));
}

function game_report_switch_bottom_content(new_button, new_content) {
    let gr = _id("game_report_cont");

    let button_prev_active = gr.querySelector(".bottom .menu .btn.active");
    if (new_button === button_prev_active) return;
    if (button_prev_active) button_prev_active.classList.remove("active");
    new_button.classList.add("active");

    let prev_active = gr.querySelector(".bottom .container .cont_box.active");
    if (prev_active) prev_active.classList.remove("active");
    new_content.classList.add("active");
}


function clear_battle_pass_progression() {
    global_game_report_progression = false;
    global_game_report_progression_map = {};
    global_game_report_user_switched_view = false;
    global_game_report_rewards.length = 0;
    global_game_report_achievement_rewards.length = 0;
    _empty(_id("game_report_progression"));
}

function set_battle_pass_rewards(rewards) {
    if (rewards && rewards.length) {
        global_game_report_rewards = rewards;
    } else {
        global_game_report_rewards = [];
    }
}

function set_achievement_rewards(rewards) {
    //console.log("set_achievement_rewards", _dump(rewards));
    if (rewards && rewards.length) {
        global_game_report_achievement_rewards = rewards;
    } else {
        global_game_report_achievement_rewards = [];
    }
    /*
    set_achievement_rewards [
        {
            "achievement_id": "play_games",
            "goal": 1,
            "reward": {
                "customization_id": "av_smileyblue",
                "customization_type": 2,
                "customization_sub_type": "",
                "customization_set_id": null,
                "rarity": 0,
                "amount": 1,
                "free": false,
                "coverage": null
            }
        },
        {
            "achievement_id": "play_games_duel",
            "goal": 1,
            "reward": {
                "customization_id": "av_smileyred",
                "customization_type": 2,
                "customization_sub_type": "",
                "customization_set_id": null,
                "rarity": 0,
                "amount": 1,
                "free": false,
                "coverage": null
            }
        }
    ]
    */
}

function set_battle_pass_progression(update) {
    if (!update) {
        global_game_report_progression = false;
        return;
    }

    global_game_report_progression = true;

    let cont = _id("game_report_progression");

    let fragment = new DocumentFragment();

    let progress_cont = _createElement("div", "progress_cont");

    let level_icon_prev = _createElement("div", "bp_level_icon", update.from.level);
    let level_icon_next = _createElement("div", "bp_level_icon", update.from.level + 1);
    if (update.owned) {
        level_icon_prev.classList.add("paid");
        level_icon_next.classList.add("paid");
    }
    let progress_bar = _createElement("div", "progress_bar");
    let progress_bar_inner = _createElement("div", "inner");
    progress_bar.appendChild(progress_bar_inner);

    let init_width = Math.floor((update.from.xp - update.from.cur_level_req) / (update.from.next_level_req - update.from.cur_level_req) * 100);
    progress_bar.dataset.initWidth = init_width;
    progress_bar_inner.style.width = init_width + '%';

    progress_cont.appendChild(level_icon_prev);
    progress_cont.appendChild(progress_bar);
    progress_cont.appendChild(level_icon_next);

    fragment.appendChild(progress_cont);

    global_game_report_progression_map.level_icon_prev = level_icon_prev;
    global_game_report_progression_map.level_icon_next = level_icon_next;
    global_game_report_progression_map.progress_bar_inner = progress_bar_inner;
    global_game_report_progression_map.from = update.from;
    global_game_report_progression_map.to = update.to;

    cont.appendChild(fragment);
}

function set_progression_reward_unlocks() {
    let cont = _id("game_report_progression");

    if (global_game_report_rewards.length || global_game_report_achievement_rewards.length) {

        let reward_cont_outer = _createElement("div", "reward_cont_outer");

        let reward_count = global_game_report_rewards.length + global_game_report_achievement_rewards.length;
        if (reward_count > 0) global_game_report_progression = true;

        // Battle Pass Rewards
        if (global_game_report_rewards.length) {
            let reward_cont = _createElement("div", "reward_cont");
            reward_cont.appendChild(_createElement("div", "title", localize_ext("battlepass_reward", {"count": global_game_report_rewards.length})));

            let reward_list = _createElement("div", "reward_list");
        
            for (let r of global_game_report_rewards) {
                let item_cont = _createElement("div", "customization_item_cont");

                let item = _createElement("div", ["customization_item", "image", "rarity_bg_"+r.rarity]);
                item_cont.appendChild(item);

                let img = renderCustomizationInner(r.customization_type, r.customization_id);
                item.appendChild(img);

                if (r.amount > 1) {
                    item.appendChild(_createElement("div", "amount", r.amount));
                }

                reward_list.appendChild(item_cont);
            }
            reward_cont.appendChild(reward_list);

            reward_cont_outer.appendChild(reward_cont);
        }

        // Achievement Rewards
        if (global_game_report_achievement_rewards.length) {
            let reward_cont = _createElement("div", "reward_cont");
            reward_cont.appendChild(_createElement("div", "title", localize_ext("achievement_reward", {"count": global_game_report_achievement_rewards.length})));

            let reward_list = _createElement("div", "reward_list");
            
            for (let r of global_game_report_achievement_rewards) {
                let item_cont = _createElement("div", "customization_item_cont");

                let item = _createElement("div", ["customization_item", "image", "rarity_bg_"+r.reward.rarity]);
                item_cont.appendChild(item);

                let img = renderCustomizationInner(r.reward.customization_type, r.reward.customization_id);
                item.appendChild(img);

                if (r.amount > 1) {
                    item.appendChild(_createElement("div", "amount", r.reward.amount));
                }

                reward_list.appendChild(item_cont);
            }
            reward_cont.appendChild(reward_list);

            reward_cont_outer.appendChild(reward_cont);
        }

        cont.appendChild(reward_cont_outer);
    }
}

function animate_bp_progress() {
    if (!("from" in global_game_report_progression_map)) return;
    if (!("to" in global_game_report_progression_map)) return;

    let map = global_game_report_progression_map;
    let animation_steps = [];

    let time_per_full_level = 1500;

    if (map.from.level == map.to.level) {;
        animation_steps.push({
            "from": Math.floor((map.from.xp - map.from.cur_level_req) / (map.from.next_level_req - map.from.cur_level_req) * 100),
            "to": Math.floor((map.to.xp - map.to.cur_level_req) / (map.to.next_level_req - map.to.cur_level_req) * 100),
            "level_prev": map.from.level,
            "level_next": map.from.level + 1,
            "easing": easing_functions.easeInOutQuad,
            "duration": time_per_full_level, 
        });
    } else {
        let levels_gained = map.to.level - map.from.level;

        animation_steps.push({
            "from": Math.floor((map.from.xp - map.from.cur_level_req) / (map.from.next_level_req - map.from.cur_level_req) * 100),
            "to": 100,
            "level_prev": map.from.level,
            "level_next": map.from.level + 1,
            "easing": easing_functions.easeInSine,
            "duration": ((map.from.next_level_req - map.from.xp) / (map.from.next_level_req - map.from.cur_level_req)) * time_per_full_level
        });
        if (levels_gained > 1) {
            for (let i=1; i<levels_gained; i++) {
                animation_steps.push({
                    "from": 0,
                    "to": 100,
                    "level_prev": map.from.level + i,
                    "level_next": map.from.level + i + 1,
                    "easing": easing_functions.linear,
                    "duration": time_per_full_level * 0.7, // make the linear one faster to compensate for it being linear
                });
            }
        }
        animation_steps.push({
            "from": 0,
            "to": Math.floor((map.to.xp - map.to.cur_level_req) / (map.to.next_level_req - map.to.cur_level_req) * 100),
            "level_prev": map.to.level,
            "level_next": map.to.level + 1,
            "easing": easing_functions.easeOutSine,
            "duration": ((map.to.xp - map.to.cur_level_req) / (map.to.next_level_req - map.to.cur_level_req)) * time_per_full_level,
        });
    }

    map.level_icon_prev.textContent = map.to.level;
    map.level_icon_next.textContent = map.to.level + 1;

    run_animation();

    function run_animation() {
        let anim = animation_steps.shift();

        map.level_icon_prev.textContent = anim.level_prev;
        map.level_icon_next.textContent = anim.level_next;

        anim_start({
            "element": map.progress_bar_inner,
            "width": [anim.from, anim.to, '%'],
            "duration": anim.duration,
            "easing": anim.easing,
            "completion": function() {
                req_anim_frame(() => {
                    if (animation_steps.length) {
                        run_animation();
                    } else {
                        // stay on the progression for some seconds, then open map vote tab or statistics, unless the user has already clicked somewhere else manually before that
                        setTimeout(function() {
                            if (!global_game_report_user_switched_view && global_game_report_progression_switch) global_game_report_progression_switch();
                        }, 3000);
                    }
                }, 2);
            }
        })
    }
}

// Set the initial view and what to switch to
function game_report_bottom_view() {
    global_game_report_progression_switch = undefined;
    if (game_data.continuous == 1) {
        if (global_game_report_progression) {
            global_game_report_progression_switch = game_report_show_map_vote;
            game_report_show_progression();
        } else {
            game_report_show_map_vote();
        }
    } else {
        if (global_game_report_progression) {
            global_game_report_progression_switch = game_report_show_stats;
            game_report_show_progression();
        } else {
            game_report_show_stats();
        }
    }

    if (global_game_report_progression) {
        _id("game_report_cont").querySelector(".bottom .menu .progress").style.display = "block";
    } else {
        _id("game_report_cont").querySelector(".bottom .menu .progress").style.display = "none";
    }

    if (global_show_rank_change) {
        _id("game_report_cont").querySelector(".bottom .container").style.display = "none";
        _id("game_report_cont").querySelector(".bottom .menu").style.display = "none";
    }

    let show_stats_button = false;
    if (global_game_report_progression) show_stats_button = true;
    if (global_game_report_rematch_enabled) show_stats_button = true;
    if (game_data.continuous == 1) show_stats_button = true;

    if (show_stats_button) _id("game_report_cont").querySelector(".bottom .menu .stats").style.display = "block";
    else _id("game_report_cont").querySelector(".bottom .menu .stats").style.display = "none";
}



// When the game_report is sent
function game_report_reset_rematch_option() {
    global_game_report_rematch_requested = false;
    let cont = _id("game_report_rematch_cont");

    if (!global_game_report_rematch_enabled) {
        cont.style.display = "none";
    } else {
        
        let btn = cont.querySelector(".rematch");
        btn.classList.remove("requested");
        btn.classList.remove("accepted");
        btn.textContent = localize("request_rematch");
        
        let total_players = game_data.team_count * game_data.team_size;
        game_report_rematch_states(total_players, 0);

        cont.style.display = "flex";
    }
}

function game_report_handle_rematch_update(data) {
    //console.log("game_report_handle_rematch_update", _dump(data));
    game_report_rematch_states(data.required_requests, data.requests);

    let countdown_text = _id("game_report_cont").querySelector(".countdown .text");

    let btn = _id("game_report_rematch_cont").querySelector(".rematch");
    if (data.accepted) {
        btn.classList.add("accepted");
        countdown_text.textContent = localize("report_next_map_in");
        btn.textContent = localize("rematch_accepted");
    } else {
        btn.classList.remove("accepted");
        countdown_text.textContent = localize("report_leaving_game_in");
        if (data.self_requested) {
            btn.classList.add("requested");
            btn.textContent = localize("rematch_requested");
        } else {
            btn.classList.remove("requested");
            btn.textContent = localize("request_rematch");
        }
    }
}

function game_report_rematch_states(total, accepted) {
    let rematch_state = _id("game_report_rematch_cont").querySelector(".rematch_state");
    _empty(rematch_state);

    for (let i=0; i<total; i++) {
        if (i < accepted) {
            rematch_state.appendChild(_createElement("div", ["state", "accepted"]));
        } else {
            rematch_state.appendChild(_createElement("div", "state"));
        }
    }
}

// When the player clicks on the request match button 
function game_report_request_rematch() {
    let btn = _id("game_report_rematch_cont").querySelector(".rematch");
    if (!global_game_report_rematch_requested) {
        global_game_report_rematch_requested = true;
        btn.classList.add("requested");

        send_string(CLIENT_COMMAND_REQUEST_REMATCH);
    }

    global_game_report_user_switched_view = true;
    game_report_switch_bottom_content(btn, _id("game_report_map_vote"));
}

// When 100% of the players accepted the rematch
function game_report_rematch_accepted() {
    let countdown_text = _id("game_report_cont").querySelector(".countdown .text");
    countdown_text.textContent = localize("report_next_map_in");

    let btn = _id("game_report_rematch_cont").querySelector(".rematch");
    btn.classList.add("accepted");
}