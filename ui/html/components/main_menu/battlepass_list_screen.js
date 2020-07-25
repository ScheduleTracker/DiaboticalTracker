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

function load_battlepass_list() {
    let list = _id("battlepass_list_screen");
    let content = _id("battlepass_list_content");

    _empty(content);
    let fragment = new DocumentFragment();

    // The currently active battlepass for the user
    if (global_user_battlepass && global_user_battlepass.battlepass_id in global_battlepass_data) {
        let title = _createElement("div", "title");
        title.innerHTML = localize("battlepass_list_title_active");
        fragment.appendChild(title);
        fragment.appendChild(createBattlepassBox(global_user_battlepass, true));
        fragment.appendChild(_createElement("div","separator"));
    }

    if (global_user_battlepass && !(global_user_battlepass.battlepass_id in global_battlepass_data)) {
        console.log("Battle Pass List Error #1 - Missing battlepass_data entry.");
    }

    // Battlepasses available to the user (currently free or owned)
    let user_bps = global_battlepass_list.filter(bp => (bp.battlepass.active || bp.battlepass.owned) && bp.battlepass_id != global_user_battlepass.battlepass_id);
    if (user_bps.length) {
        let title = _createElement("div", "title");
        title.innerHTML = localize("battlepass_list_title_my");
        fragment.appendChild(title);
        for (let bp of user_bps) {
            if (!(bp.battlepass_id in global_battlepass_data)) {
                console.log("Battle Pass List Error #2 - Missing battlepass_data entry.");
                continue;
            }
            fragment.appendChild(createBattlepassBox(bp), false);
        }
        fragment.appendChild(_createElement("div","separator"));
    }

    // Battlepasses the user doesn't own yet but can be purchased
    let other_bps = global_battlepass_list.filter(bp => !bp.battlepass.active && !bp.battlepass.owned && bp.battlepass_id != global_user_battlepass.battlepass_id);
    if (other_bps.length) {
        let title = _createElement("div", "title");
        title.innerHTML = localize("battlepass_list_title_other");
        fragment.appendChild(title);
        for (let bp of other_bps) {
            if (!(bp.battlepass_id in global_battlepass_data)) {
                console.log("Battle Pass List Error #3 - Missing battlepass_data entry.");
                continue;
            }
            fragment.appendChild(createBattlepassBox(bp), false);
        }
    }

    // If for some reason we don't have any battlepasses at all, show a no Battlepass avail message (should never really happen)
    if (!global_battlepass_list.length && !global_user_battlepass.battlepass_id) {
        let no_bp = _createElement("div", "no_battlepass_avail");
        no_bp.innerHTML = localize("battlepass_list_no_bp_avail");
        fragment.appendChild(no_bp);
    }

    content.appendChild(fragment);

    refreshScrollbar(list);
    resetScrollbar(list);
}

function createBattlepassBox(data, user_active) {
    //console.log("bp",_dump(data));

    let cont = _createElement("div", "bp");
    if (user_active) cont.classList.add("user_active");

    let title = _createElement("div", "title");
    title.innerHTML = localize(global_battlepass_data[data.battlepass_id].title);
    cont.appendChild(title);

    let buttons = _createElement("div", "buttons");
    cont.appendChild(buttons);

    if (!data.battlepass.owned) {
        let button_buy = _createElement("div", ["db-btn","upgrade"]);
        button_buy.innerHTML = localize("battlepass_button_buy");
        buttons.appendChild(button_buy);
        _addButtonSounds(button_buy, 1);
    }

    if ((data.battlepass.owned || data.battlepass.active) && (data.battlepass_id != global_user_battlepass.battlepass_id)) {
        let button_activate = _createElement("div", ["db-btn","normal"]);
        button_activate.innerHTML = localize("battlepass_button_set_active");
        buttons.appendChild(button_activate);
        _addButtonSounds(button_activate, 1);

        button_activate.addEventListener("click", function() {
            
            send_string(CLIENT_COMMAND_SET_ACTIVE_BATTLEPASS, data.battlepass_id, "battlepass-data", function(data) {
                global_user_battlepass = data.data;
                open_battlepass();
            });
        });
    }

    let button_gift = _createElement("div", ["db-btn","normal"]);
    button_gift.innerHTML = localize("battlepass_button_gift");
    buttons.appendChild(button_gift);
    _addButtonSounds(button_gift, 1);

    let button_rewards = _createElement("div", ["db-btn","normal"]);
    button_rewards.innerHTML = localize("battlepass_button_view_rewards");
    button_rewards.addEventListener("click", function() {
        battlepass_list_show_rewards(data);
    });
    buttons.appendChild(button_rewards);
    _addButtonSounds(button_rewards, 1);

    if (data.battlepass.owned || data.battlepass.level > 1 || data.battlepass_id == global_user_battlepass.battlepass_id) {
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
        
        let level_icon = _createElement("div", "bp_level_icon");
        level_icon.innerHTML = data.battlepass.level;
        if (data.battlepass.owned) {
            level_icon.classList.add("paid");
        }
        status.appendChild(level_icon);
    }

    return cont;
}

function battlepass_list_show_rewards(bp) {
    
    let screen = _id("battlepass_rewards_modal_screen");

    let bp_rewards = screen.querySelector(".battlepass_rewards");        
    _empty(bp_rewards);
    emptyRewardPreview(screen);

    // Show spinner while loading
    bp_rewards.appendChild(_createSpinner());

    open_modal_screen("battlepass_rewards_modal_screen");

    // In a set Timeout because we need to do a redraw after showing the modal to calculate the rewards container width for the initial reward scroll position
    setTimeout(function() {
        if (bp.battlepass_id in global_battlepass_rewards_cache) {
            let { pos } = render_battlepass_rewards(screen, bp, global_battlepass_rewards_cache[bp.battlepass_id], showRewardPreview);
            if (!global_scrollboosters['bp_modal_rewards']) setup_battlepass_reward_scroll('bp_modal_rewards', bp_rewards, pos);
            else global_scrollboosters['bp_modal_rewards'].setPosition({"x": pos, "y":0 });
        } else {
            // Hide arrows during loading
            _for_each_with_selector_in_parent(screen, ".rewards_arrow", function(el) {
                el.style.display = "none";
            });

            send_string(CLIENT_COMMAND_GET_BATTLEPASS_REWARDS, bp.battlepass_id, "battlepass-rewards", function(data) {
                bp_rewards.style.opacity = 0;

                global_battlepass_rewards_cache[bp.battlepass_id] = format_battlepass_rewards(data.data);
                let { pos } = render_battlepass_rewards(screen, bp, global_battlepass_rewards_cache[bp.battlepass_id], showRewardPreview);

                if (global_scrollboosters['bp_modal_rewards']) global_scrollboosters['bp_modal_rewards'].destroy();
                setup_battlepass_reward_scroll('bp_modal_rewards', bp_rewards, pos);
                req_anim_frame(function() { 
                    anim_start({
                        element: bp_rewards,
                        opacity: [0, 1],
                        duration: 200,
                        easing: easing_functions.easeOutQuad,
                    });
                },4);
            });
        }
    });
}