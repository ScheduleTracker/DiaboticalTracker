let battlepass_modal_rewards_drag_scroll = undefined;
function init_screen_battlepass_list() {
    _for_each_with_selector_in_parent(_id("battlepass_rewards_modal_screen"), ".rewards_arrow", function(el) {

        if (el.classList.contains("prev")) {
            el.addEventListener("click", function(e) { 
                if (global_scrollboosters['bp_modal_rewards']) {
                    global_scrollboosters['bp_modal_rewards'].scrollToArrow(-1, 70);
                }
            });
        }
        if (el.classList.contains("next")) {
            el.addEventListener("click", function(e) { 
                if (global_scrollboosters['bp_modal_rewards']) {
                    global_scrollboosters['bp_modal_rewards'].scrollToArrow(1, 70);
                }
            });
        }
    });
}

function load_battlepass_list(cb) {
    if (!global_battlepass_list.length) {
        send_string(CLIENT_COMMAND_GET_BATTLEPASS_LIST, "", "battlepass-list", function(data) {
            global_battlepass_list = data.data;

            // Store data in the lookup map
            for (let bp of global_battlepass_list) {    
                global_battlepass_map[bp.battlepass_id] = bp;
            }

            if (typeof cb === "function") cb();
        });
    } else {
        if (typeof cb === "function") cb();
    }
}

function render_battlepass_list() {
    let list = _id("battlepass_list_screen");
    let content = _id("battlepass_list_content");

    _empty(content);
    let fragment = new DocumentFragment();

    // The currently active battlepass for the user
    let main_bp = false;
    if (global_user_battlepass && global_user_battlepass.battlepass_id in global_battlepass_data) {
        let main_box = _createElement("div", ["bp_box", "main"]);
        let title = _createElement("div", "title", localize("battlepass_list_title_active"));
        main_box.appendChild(title);
        main_box.appendChild(createBattlepassBox(global_user_battlepass, true));
        fragment.appendChild(main_box);
        main_bp = true;
    }

    if (global_user_battlepass && !(global_user_battlepass.battlepass_id in global_battlepass_data)) {
        console.log("Battle Pass List Error #1 - Missing battlepass_data entry.");
    }

    let count_extra = 0;
    for (let bp of global_battlepass_list) {
        // Skip the currently active bp
        if (bp.battlepass_id == global_user_battlepass.battlepass_id) continue;

        count_extra++;
    }

    if (count_extra) {
        let list_box = _createElement("div", "bp_box");
        let title = _createElement("div", "title", localize("battlepass_list_title_my"));
        list_box.appendChild(title);

        for (let bp of global_battlepass_list) {
            // Skip the currently active bp
            if (bp.battlepass_id == global_user_battlepass.battlepass_id) continue;

            if (!(bp.battlepass_id in global_battlepass_data)) {
                console.log("Battle Pass List Error #2 - Missing battlepass_data entry.");
                continue;
            }
            list_box.appendChild(createBattlepassBox(bp), false);
        }

        fragment.appendChild(list_box);
    }

    if (count_extra == 0 && !main_bp) {
        let no_bp = _createElement("div", "no_battlepass_avail");
        no_bp.innerHTML = localize("battlepass_list_no_bp_avail");
        fragment.appendChild(no_bp);
    }

    content.appendChild(fragment);

    refreshScrollbar(list);
    resetScrollbar(list);
}

function createBattlepassBox(data, user_active) {
    //console.log("createBattlepassBox",_dump(data));

    let cont = _createElement("div", "bp");
    if (user_active) cont.classList.add("user_active");

    let title = _createElement("div", "title");
    title.innerHTML = localize(global_battlepass_data[data.battlepass_id].title);
    cont.appendChild(title);

    let perc_to_next_level = ((data.battlepass.xp - data.progression.cur_level_req) / (data.progression.next_level_req - data.progression.cur_level_req)) * 100;
    let xp_to_next_level = data.progression.next_level_req - data.battlepass.xp;

    let progress_text = _createElement("div", "progress_text");
    cont.appendChild(progress_text);
    progress_text.appendChild(_createElement("div", "text", localize("battlepass_xp_to_next_level")));
    progress_text.appendChild(_createElement("div", "number", xp_to_next_level));

    let progress_bar = _createElement("div", "progress_bar");
    cont.appendChild(progress_bar);
    let progress_bar_inner = _createElement("div", "progress_bar_inner");
    progress_bar_inner.style.width = perc_to_next_level + '%';
    progress_bar.appendChild(progress_bar_inner);

    let buttons = _createElement("div", "buttons");
    cont.appendChild(buttons);

    let button_rewards = _createElement("div", ["db-btn","plain"]);
    button_rewards.innerHTML = localize("battlepass_button_view_battlepass");
    button_rewards.addEventListener("click", function() {
        battlepass_list_view_battlepass(data);
    });
    buttons.appendChild(button_rewards);
    _addButtonSounds(button_rewards, 1);

    if (data.battlepass_id != global_user_battlepass.battlepass_id) {
        let button_activate = _createElement("div", ["db-btn","plain"]);
        button_activate.innerHTML = localize("battlepass_button_set_active");
        buttons.appendChild(button_activate);
        _addButtonSounds(button_activate, 1);

        button_activate.addEventListener("click", () => { battlepass_set_active(data.battlepass_id); });
    }

    /*
    let button_gift = _createElement("div", ["db-btn","plain"]);
    button_gift.innerHTML = localize("battlepass_button_gift");
    buttons.appendChild(button_gift);
    _addButtonSounds(button_gift, 1);
    */

    let status = _createElement("div", "status");
    cont.appendChild(status);
    
    let pass_tag = _createElement("div", "tag");
    if (data.battlepass.owned) {
        pass_tag.innerHTML = localize("battlepass_version_paid")
    } else {
        pass_tag.innerHTML = localize("battlepass_version_free");
        pass_tag.classList.add("free");
    }
    status.appendChild(pass_tag);
    
    let level_icon = _createElement("div", "bp_level_icon", data.battlepass.level);
    level_icon.style.backgroundImage = "url("+_bp_icon(data.battlepass.battlepass_id, data.battlepass.owned)+")";
    status.appendChild(level_icon);

    return cont;
}

function battlepass_list_view_battlepass(bp) {
    //console.log("battlepass_list_view_battlepass", _dump(bp));

    if (bp.battlepass_id == global_user_battlepass.battlepass_id) {
        open_battlepass();
    } else {
        open_battlepass(bp.battlepass_id);
    }
}

function battlepass_set_active(battlepass_id) {
    //console.log("set battlpass active:", battlepass_id);

    send_string(CLIENT_COMMAND_SET_ACTIVE_BATTLEPASS, battlepass_id, "battlepass-activated", function() {

        // Fetch the bp list again
        global_battlepass_list.length = 0;

        load_active_battlepass_data(() => {
            load_battlepass_rewards_data(battlepass_id, () => {
                if (global_menu_page == "battlepass_screen") {
                    open_battlepass();
                } else {
                    open_battlepass_list();
                }
            });
        });

    });
}