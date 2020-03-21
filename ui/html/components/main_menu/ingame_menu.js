
global_onload_callbacks_other.push(function() {
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
});

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
    if (team_id != -1 && team_id != 255) {
        for (let i=0; i<menu_game_data.teams.length; i++) {
            if (menu_game_data.teams[i].team_id == team_id) {
                player_count = menu_game_data.teams[i].players.length;
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

    engine.call("join_team", team_id);
    engine.call("set_menu_view", false);
}

function ingame_menu_join_match() {
    let team_id = get_fairest_team_id(menu_game_data);

    engine.call("join_team", team_id);
    engine.call("set_menu_view", false);
}