
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

function ingame_menu_aim_restart() {
    // Restart aim map call in the hud view
    send_view_data("hud", "json", { "action": "aim-restart" });
    ingame_menu_close_menu();
}

function ingame_report_user(user_id, name) {
    // Don't send open modal for yourself
    if (global_self.user_id == user_id) return;

    let report_cont = _createElement("div", "report_cont");

    let select = _createElement("div", "select-field");
    select.dataset.theme = "modal";

    for (let reason of global_report_reasons) {
        let opt = _createElement("div");
        opt.dataset.value = reason.id;
        opt.textContent = localize(reason.i18n);

        if (reason.id == 0) opt.dataset.selected = 1;
        select.appendChild(opt);
    }
    setup_select(select);

    let title = _createElement("div", "", localize("report_title"));

    let table = _createElement("div", "table");
    let left_column = _createElement("div", ["column", "left"]);
    left_column.appendChild(_createElement("div", ["row", "label", "odd"], localize("report_label_player_name")));
    left_column.appendChild(_createElement("div", ["row", "label"], localize("report_label_reason")));
    left_column.appendChild(_createElement("div", ["row", "label", "odd"], localize("report_label_additional_info")));

    let right_column = _createElement("div", ["column", "right"]);
    right_column.appendChild(_createElement("div", ["row", "data", "odd"], name));
    let select_row = _createElement("div", ["row", "data"]);
    select_row.appendChild(select);
    right_column.appendChild(select_row);
    right_column.appendChild(_createElement("div", ["row", "data", "odd"]));

    table.appendChild(left_column);
    table.appendChild(right_column);

    report_cont.appendChild(table);

    let info_text = _createElement("textarea", "info_text");
    info_text.maxLength = 160;
    report_cont.appendChild(info_text);


    let btn_cont = _createElement("div", "generic_modal_dialog_action");
    let btn_send = _createElement("div", "dialog_button", localize("menu_button_send"));
    let btn_cancel = _createElement("div", "dialog_button", localize("menu_button_cancel"));
    _addButtonSounds(btn_send, 1);
    _addButtonSounds(btn_cancel, 1);
    btn_send.addEventListener("click", function() {
        _empty(report_cont);
        _empty(btn_cont);

        title.textContent = localize("report_thank_you");

        btn_close = _createElement("div", "dialog_button", localize("modal_close"));
        btn_close.addEventListener("click", closeBasicModal);
        _addButtonSounds(btn_close, 1);
        btn_cont.appendChild(btn_close);
        
        send_json_data({
            "action": "report-user",
            "reported_user_id": user_id,
            "reason_id": select.dataset.value,
            "reason_text": info_text.value,
        });
    });
    btn_cancel.addEventListener("click", closeBasicModal);
    btn_cont.appendChild(btn_send);
    btn_cont.appendChild(btn_cancel);

    openBasicModal(basicGenericModal(title, report_cont, btn_cont));
}