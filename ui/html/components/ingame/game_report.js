

let global_game_report_active = false;
let global_game_report_countdown_interval = false;
let global_game_report_countdown = 45;
function init_hud_screen_game_report() {

    _id("game_report_cont").querySelector(".chat_input").addEventListener("blur", function() {
        engine.call('set_chat_enabled', false);
    });

    bind_event('set_game_report', function (json_game_status, model_data) {
        //console.log("set_game_report");
        if (!json_game_status)  return;

        var game_status = JSON.parse(json_game_status);
        // data == "server_status" update
        // gameData == "data model"
        //console.log("data", _dump(game_status));
        //console.log("gameData", _dump(model_data));

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

        engine.call('set_chat_enabled', false);
        global_game_report_active = true;


        // sort all clients by score (independent of team)
        game_status.clients.sort((a, b) => (a.stats.s < b.stats.s) ? 1 : -1);

        // Get my own user_id from the model... i could in theory also just get the info from the MS party messages but this works too
        var myUserId = -1;
        for (var i = 0; i < model_data.own_team.players.length; i++) {
            if (model_data.own_team.players[i].is_self == true) {
                myUserId = model_data.own_team.players[i].user_id;
                break;
            }
        }

        // Organize players into team arrays within the server_status object
        for (var i = 0; i < game_status.clients.length; i++) {
            var teamId = game_status.clients[i].team;
            if (teamId >= 0 && teamId < 200) {
                if (myUserId == game_status.clients[i].user_id) {
                    game_status.clients[i].self = true;
                }

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
                for (let team of model_data.teams) {
                    if (teamId == team.team_id) {
                        game_status.teams[teamId].color = team.color;
                        break;
                    }
                }
            }
        }

        // Make sure there is an entry for at least own and enemy team
        if (!(model_data.own_team.team_id in game_status.teams))   game_status.teams[model_data.own_team.team_id] = { "score": 0 };
        if (!(model_data.enemy_team.team_id in game_status.teams)) game_status.teams[model_data.enemy_team.team_id] = { "score": 0 };

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

        create_game_report(game_status, model_data);
    });

    bind_event('show_game_report', function (visible) {
        //console.log("show_game_report", visible);
        if (visible) {

            anim_show(_id("game_report"), 500, "flex");

            if (global_show_rank_change) {
                showRankScreen(null, true);

                anim_show(_id("game_report_cont"), 500, "flex");
                global_show_rank_change = false;
            } else {
                anim_show(_id("game_report_cont"), 100, "flex");
            }

            
            //anim_hide(_id("game_hud"), 100); //Just in case, seems like show_ingame_hud gets called sometimes when it shouldn't :S

            // Hide the chat elements since game_report has integrated chat
            anim_hide(_id("hud_load_during_loading"), 100);
            

            //_id("game_report_xp_bar_prefill").style.width = "50%";
            //_id("game_report_xp_bar_fill").style.width = "100%";
        } else {
            anim_hide(_id("game_report_cont"), 100);
            anim_hide(_id("game_report"), 100);
            //_id("game_report_xp_bar_fill").style.width = "0%";
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
}


function create_game_report(game_status, model_data) {
    //console.log("game_status", _dump(game_status));
    //console.log("model_data", _dump(model_data));

    let game_report = _id("game_report_cont");
    let head = game_report.querySelector(".head")
    let scoreboard = game_report.querySelector(".report_scoreboard")
    _empty(head);
    _empty(scoreboard);

    let player_lookup = {};
    let team_lookup = {};
    let placement_lookup = {};
    for (let t of model_data.teams) {
        team_lookup[t.team_id] = t;

        if (t.team_id in game_status.teams) {
            placement_lookup[game_status.teams[t.team_id].placement] = t;
        }
        for (let p of t.players) {
            player_lookup[p.user_id] = p;
        }
    }

    // Create a single array of teams
    var teams = Object.keys(game_status.teams).map(function(key) { return game_status.teams[key]; });

    // Sort the new teams array by their placement (this refers to game_status.teams[idx].placement), lower number means better placement
    teams.sort((a, b) => {
        // -1 == forfeit, put those at the end
        if (a.placement == -1) return -1;
        return (a.placement > b.placement) ? 1 : -1
    });

    let victory = false;
    if (game_status.teams[model_data.own_team.team_id].placement == 0) victory = true;

    //======//
    // HEAD //
    //======//

    let result_text = (victory) ? localize("ingame_victory") : localize("ingame_defeat");
    if (model_data.spectating) result_text = "";

    let head_fragment = new DocumentFragment();
    head_fragment.appendChild(_createElement("div", ["head_side", "result_text"], result_text));

    let head_center = _createElement("div", "head_center");

    // TODO, change team_count & team_size to actually use the server setting team_count & team_size
    if (["brawl","race"].includes(game_status.mode) && model_data.team_size == 1) {
        let single_winner = _createElement("div", "winner");
        if (placement_lookup["0"]) {
            single_winner.appendChild(_createElement("div", "name", placement_lookup["0"].players[0].name));
            single_winner.appendChild(_createElement("div", "label", localize("ingame_winner")));
        }
        head_center.appendChild(single_winner);
        single_winner.style.setProperty("--team_color", placement_lookup[0].color);
    } else if (["brawl","race"].includes(game_status.mode) && model_data.team_count > 2) {
        let single_winner = _createElement("div", "winner");
        if (placement_lookup["0"]) {
            single_winner.appendChild(_createElement("div", "name", placement_lookup["0"].team_name));
            single_winner.appendChild(_createElement("div", "label", localize("ingame_winner")));
        }
        head_center.appendChild(single_winner);
        single_winner.style.setProperty("--team_color", placement_lookup[0].color);
    } else {
        let score_left = _createElement("div", ["score_cont", "left"]);
        score_left.style.setProperty("--team_color", model_data.own_team.color);
        if (game_status.mode == "duel" || (model_data.team_count == 2 && model_data.team_size == 1)) {
            let name_left = _createElement("div", "name");
            if (model_data.own_team && model_data.own_team.players && model_data.own_team.players.length) {
                name_left.textContent = model_data.own_team.players[0].name;
            }
            score_left.appendChild(name_left);
        } else {
            score_left.appendChild(_createElement("div", "name", model_data.own_team.team_name));
        }
        score_left.appendChild(_createElement("div", "value", game_status.teams[model_data.own_team.team_id].score));
        head_center.appendChild(score_left);

        head_center.appendChild(_createElement("div","separator"));

        let score_right = _createElement("div", ["score_cont", "right"]);
        score_right.style.setProperty("--team_color", model_data.enemy_team.color);
        score_right.appendChild(_createElement("div", "value", game_status.teams[model_data.enemy_team.team_id].score));
        if (game_status.mode == "duel" || (model_data.team_count == 2 && model_data.team_size == 1)) {
            let name_right = _createElement("div", "name");
            if (model_data.enemy_team && model_data.enemy_team.players && model_data.enemy_team.players.length) {
                name_right.textContent = model_data.enemy_team.players[0].name;
            }
            score_right.appendChild(name_right);
        } else {
            score_right.appendChild(_createElement("div", "name", model_data.enemy_team.team_name));
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
    
    //=================//
    // MAIN SCOREBOARD //
    //=================//

    let show_team_names = true;
    if (model_data.team_size == 1) {
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
        for (let team_id in teams) {
            if (team_id < 0) continue;
            if (!teams[team_id] || !teams[team_id].players || !teams[team_id].players.length) continue;
            
            let t = teams[team_id];
            let team = _createElement("div", "team");
            if (team_id in team_lookup) {
                team.style.setProperty("--team_color", team_lookup[team_id].color);
                team.style.setProperty("--team_color2", team_lookup[team_id].color_dark);
            }
       
            if (show_team_names || !header_row_rendered) {
                let head_row = _createElement("div", "head_row");

                let team_name = t.name;
                if (!show_team_names) team_name = "";
                head_row.appendChild(_createElement("div","team_name", team_name));

                if (!header_row_rendered) {
                    if (model_data.ranked == 1) {
                        head_row.appendChild(_createElement("div","label", localize("stats_rank")));
                    }
                    if (game_status.mode == "race") {
                        head_row.appendChild(_createElement("div","label", localize("stats_best_time")));
                    } else {
                        if (game_status.mode == "ctf" || game_status.mode == "macguffin") {
                            head_row.appendChild(_createElement("div","label", localize("stats_captures")));
                        } else {
                            head_row.appendChild(_createElement("div","label", localize("stats_score")));
                        }
                        head_row.appendChild(_createElement("div","label", localize("stats_frags")));
                        head_row.appendChild(_createElement("div","label", localize("stats_deaths")));
                        if (model_data.team_size > 1) {
                            //head_row.appendChild(_createElement("div","label", localize("stats_assists")));
                        }
                        head_row.appendChild(_createElement("div","label", localize("stats_dmg_done")));
                        head_row.appendChild(_createElement("div","label", localize("stats_dmg_taken")));
                        //head_row.appendChild(_createElement("div","label", localize("stats_time")));
                        //head_row.appendChild(_createElement("div","label", localize("stats_acc")));
                        header_row_rendered = true;
                    }
                }
                team.appendChild(head_row);
            }

            // Reset the odd/even row colors if each team has more than one player
            if (model_data.team_size > 1) {
                player_rows = 0;
            }

            if ("players" in t && t.players.length) {
                for (let p of t.players) {
                    player_rows++;

                    let player_row = _createElement("div", "player_row");
                    if (player_rows % 2 == 0) player_row.classList.add("even");
                    
                    if (p.self) {
                        player_row.classList.add("self");
                        self_stats = p.stats;
                    }

                    let avatar = _createElement("div", "avatar");
                    avatar.style.backgroundImage = "url("+_avatarUrl(player_lookup[p.user_id].avatar)+")";
                    player_row.appendChild(avatar);
                    player_row.appendChild(_createElement("div","name", p.name));

                    if (model_data.ranked == 1) {
                        let rank_icon_cont = _createElement("div", "rank");
                        if (p.user_id == global_self.user_id && current_match.mm_mode && current_match.mm_mode in global_self.mmr) {
                            rank_icon_cont.appendChild(renderRankIcon(global_self.mmr[current_match.mm_mode].rank_tier, global_self.mmr[current_match.mm_mode].rank_position, model_data.team_size, "small"));
                        } else {
                            rank_icon_cont.appendChild(renderRankIcon(player_lookup[p.user_id].rank_tier, player_lookup[p.user_id].rank_position, model_data.team_size, "small"));
                        }
                        player_row.appendChild(rank_icon_cont);
                    }

                    if (game_status.mode == "race") {
                        player_row.appendChild(_createElement("div","stat", player_lookup[p.user_id].best_time));
                    } else {
                        player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_SCORE]));
                        player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_FRAGS]));
                        player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_DEATHS]));
                        if (model_data.team_size > 1) {
                            //player_row.appendChild(_createElement("div","stat", "--"));
                        }
                        player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED]));
                        player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN]));
                        //player_row.appendChild(_createElement("div","stat", "--"));
                        //player_row.appendChild(_createElement("div","stat", "--"));
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

            if (model_data.team_size > 1) {
                scoreboard_fragment.appendChild(_createElement("div", "separator"));
            }
        }
    //}
    scoreboard.appendChild(scoreboard_fragment);

    if (self_stats) selectPlayer(self_stats, false);

    if (game_data.continuous == 1) {
        renderMapVote();
        game_report_show_map_vote();
    } else {
        game_report_show_stats();
    }
}

function updateGameReportRank(mode) {
    if (!(mode in global_self.mmr)) return;
    if (!(mode in global_queue_modes)) return;

    let self_rank = _id("game_report_cont").querySelector(".player_row.self .rank");
    if (self_rank) {
        _empty(self_rank);
        self_rank.appendChild(renderRankIcon(global_self.mmr[mode].rank_tier, global_self.mmr[mode].rank_position, global_queue_modes[mode].team_size, "small"));
    }
}

function selectPlayer(stats, show) {
    let cont = _id("game_report_stats");

    let stats_cont = _createElement("div", "stats");

    let legend = _createElement("div", "legend");
    legend.appendChild(_createElement("div", "placeholder"));
    legend.appendChild(_createElement("div", "label", "Frags / Deaths"));
    legend.appendChild(_createElement("div", "label", "Dmg Done"));
    legend.appendChild(_createElement("div", "label", "Dmg Taken"));
    legend.appendChild(_createElement("div", "label", "Hits / Shots"));
    legend.appendChild(_createElement("div", "label", "Accuracy"));
    stats_cont.appendChild(legend);

    if ("weapons" in stats) {
        for (let s of stats.weapons) {
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
            if (w_data) icon.style.backgroundImage = "url("+w_data[2]+")";
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
    let map_vote_cont = _id("game_report_map_vote");
    _empty(map_vote_cont);

    let maps = [];
    if (game_data.map_list.length) maps = game_data.map_list.split(":");

    let valid_maps = [];
    for (let map of maps) {
        if (map != game_data.map) valid_maps.push(map);
    }

    if (valid_maps.length > 4) {
        valid_maps = getRandomElementsFromArray(vaid_maps, 4);
    }

    let container = _createElement("div", "map_vote_cont");
    container.appendChild(_createElement("div", "title", localize("vote_next_map")));

    let map_list = _createElement("div", "map_list");
    for (let map of valid_maps) {
        let map_div = _createElement("div", "map");
        map_div.dataset.map = map;
        map_div.style.backgroundImage = "url("+_mapUrl(map)+")";
        map_div.appendChild(_createElement("div","name",_format_map_name(map)));

        map_div.addEventListener("click", function() {
            _play_click1();

            let prev = map_list.querySelector(".selected");
            if (prev) prev.classList.remove("selected");

            map_div.classList.add("selected");

            engine.call("draft_select_map", map_div.dataset.map);
        });

        map_list.appendChild(map_div);
    }
    container.appendChild(map_list);

    map_vote_cont.appendChild(container);
}

function game_report_show_map_vote(click) {
    if (click) _play_click1();
    game_report_switch_bottom_content(_id("game_report_cont").querySelector(".bottom .menu .btn.map_vote"), _id("game_report_map_vote"));
}

function game_report_show_progression(click) {
    if (click) _play_click1();
    game_report_switch_bottom_content(_id("game_report_cont").querySelector(".bottom .menu .btn.progress"), _id("game_report_progression"));
}

function game_report_show_stats(click) {
    if (click) _play_click1();
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