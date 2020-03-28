
function init_screen_ingame_menu() {
    bind_event("set_in_game", function(bool) {
        if (bool) {
            // show menu screen
            open_ingame_menu(true);
        } else {
            // hide menu screen
            if (global_menu_page == "ingame_menu_screen") {
                //open_home(true);
                open_play(undefined, true);
            }
        }
    });
}

function ingame_menu_close_menu() {
    engine.call("set_menu_view", false);
}

function ingame_menu_open_section(event) {
    let btn = event.currentTarget;
    if (btn.classList.contains("selected")) return;

    _for_each_with_class_in_parent(btn.parentElement, "selected", function(el) {
        el.classList.remove("selected");
    });
    btn.classList.add("selected");

    _for_each_with_class_in_parent(_id("ingame_menu_inner"), "content_section", function(el) {
        if (el.classList.contains("active")) anim_hide(el);
    });
    if (btn.dataset.id == "main") {
        let content = _id("ingame_menu_section_match");
        anim_show(content);
        content.classList.add("active");
    }
    if (btn.dataset.id == "vote") {
        let content = _id("ingame_menu_section_vote");
        anim_show(content);
        content.classList.add("active");
    }
    if (btn.dataset.id == "players") {
        let content = _id("ingame_menu_section_players");
        anim_show(content);
        content.classList.add("active");
    }
}

function ingame_toggle_mute(user_id, muted) {
    _play_click1();
    let mute = (muted == true) ? false : true;

    engine.call("set_user_muted", mute, user_id);
}

function ingame_open_profile(user_id) {
    _play_click1();
    open_player_profile(user_id);
}

function ingame_menu_spectate() {
    engine.call("join_team", -1);
    engine.call("set_menu_view", false);
}

function ingame_menu_join_team(team_id) {
    let player_count = undefined;
    team_id = Number(team_id);

    if (menu_game_data.own_team_id == team_id) {
        engine.call("set_menu_view", false);
        return;
    }
    
    if (team_id != -1 && team_id != 255) {
        for (let i=0; i<menu_game_data.teams.length; i++) {
            if (menu_game_data.teams[i].team_id == team_id) {
                if ("players" in menu_game_data.teams[i]) {
                    player_count = menu_game_data.teams[i].players.length;
                } else {
                    player_count = 0;
                }
                break;
            }
        }

        if (player_count != undefined && player_count >= menu_game_data.team_size) {
            queue_dialog_msg({
                "title": localize("title_info"),
                "msg": localize("message_team_already_full"),
            });
            return;
        }
    }

    if (menu_game_data.spectator) {
        // Switching from spectating into a team
        let allowed_team_ids = [];
        let lowest_player_count = 100;
        for (let i=0; i<menu_game_data.teams.length; i++) {
            if (menu_game_data.teams[i].players) {
                if (menu_game_data.teams[i].players.length < lowest_player_count) lowest_player_count = menu_game_data.teams[i].players.length;
            } else {
                lowest_player_count = 0;
                break;
            }
        }
        for (let i=0; i<menu_game_data.teams.length; i++) {
            if (!menu_game_data.teams[i].players || menu_game_data.teams[i].players.length == lowest_player_count) {
                allowed_team_ids.push(menu_game_data.teams[i].team_id);
            }
        }
        if (!allowed_team_ids.includes(team_id)) {
            queue_dialog_msg({
                "title": localize("title_info"),
                "msg": localize("message_team_join_uneven"),
            });
            return;
        }
    } else {
        // Switching from one team to another
        let prev_team_count = menu_game_data.own_team.players.length;
        let next_team_count = player_count;
        let diff_before = Math.abs(next_team_count - prev_team_count);
        prev_team_count--;
        next_team_count++;
        let diff_after = Math.abs(next_team_count - prev_team_count);
        if (diff_after > diff_before) {
            queue_dialog_msg({
                "title": localize("title_info"),
                "msg": localize("message_team_join_uneven"),
            });
            return;
        };
    }

    engine.call("join_team", team_id);
    engine.call("set_menu_view", false);
}

function ingame_menu_join_match() {
    let team_id = get_fairest_team_id(menu_game_data);

    engine.call("join_team", team_id);
    engine.call("set_menu_view", false);
}