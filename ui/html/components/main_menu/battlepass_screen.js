
let global_battlepass_rewards_cache = {};
function init_screen_battlepass() {
    _for_each_with_selector_in_parent(_id("battlepass_screen"), ".rewards_arrow", function(el) {
        if (el.classList.contains("prev")) {
            el.addEventListener("click", function(e) { 
                if (global_scrollboosters['bp_rewards']) {
                    global_scrollboosters['bp_rewards'].scrollToArrow(-1, 70);
                }
            });
        }
        if (el.classList.contains("next")) {
            el.addEventListener("click", function(e) { 
                if (global_scrollboosters['bp_rewards']) {
                    global_scrollboosters['bp_rewards'].scrollToArrow(1, 70);
                }
            });
        }
    });
}

let global_initial_bp_data_loaded = false;
function load_battlepass_data(cb) {
    api_request("GET", "/user/battlepass", {}, function(data) {
        global_user_battlepass = data;
        updateMenuBottomBattlepass(data);
        updateChallenges();
        updateBattlepassUpgrade(data);

        if (!global_initial_bp_data_loaded) {
            global_initial_bp_data_loaded = true;
            req_anim_frame(() => {
                showMenuBottomBattlepass();
                show_home_challenges();
            }, 4);
        }

        if (typeof cb === "function") cb(global_user_battlepass);
    });
}

function load_battlepass() {
    //console.log("load_battlepass",_dump(global_user_battlepass));

    if (!global_user_battlepass.battlepass_id) {
        // TODO handle the "no battlepass" case? even if it should never actually occur
        return;
    }

    let screen = _id("battlepass_screen");
    
    render_battlepass(global_user_battlepass);

    let bp_rewards = screen.querySelector(".battlepass_rewards");

    if (global_user_battlepass.battlepass_id in global_battlepass_rewards_cache) {
        let { pos, locked_count } = render_battlepass_rewards(screen, global_user_battlepass, global_battlepass_rewards_cache[global_user_battlepass.battlepass_id], showRewardPreview);
        if (!global_scrollboosters['bp_rewards']) setup_battlepass_reward_scroll('bp_rewards', bp_rewards, pos);
        else global_scrollboosters['bp_rewards'].setPosition({"x": pos, "y":0 });
        render_battlepass_buttons(locked_count);
    } else {

        // Show spinner while loading
        _empty(bp_rewards);
        bp_rewards.appendChild(_createSpinner());

        // Hide arrows during loading
        _for_each_with_selector_in_parent(_id("battlepass_screen"), ".rewards_arrow", function(el) {
            el.style.display = "none";
        });

        send_string(CLIENT_COMMAND_GET_BATTLEPASS_REWARDS, global_user_battlepass.battlepass_id, "battlepass-rewards", function(data) {
            bp_rewards.style.filter = "opacity(0)";

            global_battlepass_rewards_cache[global_user_battlepass.battlepass_id] = format_battlepass_rewards(data.data);
            let { pos, locked_count } = render_battlepass_rewards(screen, global_user_battlepass, global_battlepass_rewards_cache[global_user_battlepass.battlepass_id], showRewardPreview);

            if (global_scrollboosters['bp_rewards']) global_scrollboosters['bp_rewards'].destroy();
            setup_battlepass_reward_scroll('bp_rewards', bp_rewards, pos);
            req_anim_frame(() => {
                anim_start({
                    element: bp_rewards,
                    opacity: [0, 1],
                    duration: 200,
                    easing: easing_functions.easeOutQuad,
                });
            },4);

            render_battlepass_buttons(locked_count);
        });
    }
}

function render_battlepass_buttons(locked_count) {

    let buttons_cont = _id("battlepass_buttons");
    _empty(buttons_cont);

    let fragment = new DocumentFragment();
    let btns = _createElement("div", "buttons");
    fragment.appendChild(btns);

    //<div class="db-btn plain click-sound mouseover-sound4" onclick="open_battlepass_list()">Select Battlepass</div>

    if (global_user_battlepass.battlepass.owned == true  
        // Check if you have reached the battlepass limit already
        && global_user_battlepass.battlepass.level < global_user_battlepass.battlepass.levels) {

        let btn_tiers = _createElement("div", ["db-btn", "upgrade"], localize("battlepass_button_buy_tiers"));
        btn_tiers.addEventListener("click", battlepass_buy_levels_modal);
        _addButtonSounds(btn_tiers, 1);
        btns.appendChild(btn_tiers);
    }

    if (global_user_battlepass.battlepass.owned == false) {
        let btn_upgrade = _createElement("div", ["db-btn", "upgrade"], localize("battlepass_button_upgrade"));
        btn_upgrade.addEventListener("click", open_battlepass_upgrade);
        _addButtonSounds(btn_upgrade, 1);
        btns.appendChild(btn_upgrade);
    }

    if (global_user_battlepass.battlepass.owned == false && locked_count > 2) {
        let unlock_msg = _createElement("div", "unlock_msg");
        unlock_msg.textContent = localize_ext("battlepass_unlock_items_msg", {
            "count": locked_count
        });
        fragment.appendChild(unlock_msg);
    }

    /*
    let btn_gift = _createElement("div", ["db-btn", "plain"], localize("battlepass_button_gift"));
    _addButtonSounds(btn_gift, 1);
    btns.appendChild(btn_gift);
    btn_gift.addEventListener("click", open_gift);
    */
    
    buttons_cont.appendChild(fragment);
}

function battlepass_buy_levels_modal() {
    //console.log("BATTLEPASS",_dump(global_user_battlepass.battlepass));
    //console.log("BATTLEPASS REWARDS",_dump(global_battlepass_rewards_cache[global_user_battlepass.battlepass_id]));
    if (!global_user_battlepass.battlepass_id) return;
    if (!global_user_battlepass.battlepass_id in global_battlepass_rewards_cache) return;
    if (!global_user_battlepass.battlepass.owned) return;
    if (global_user_battlepass.battlepass.level >= global_user_battlepass.battlepass.levels) return;

    if (global_scrollboosters["buy_levels"]) {
        global_scrollboosters["buy_levels"].destroy();
        delete global_scrollboosters["buy_levels"];
    }
    if (global_scrollbooster_bars["buy_levels"]) {
        global_scrollbooster_bars["buy_levels"].destroy();
        delete global_scrollbooster_bars["buy_levels"];
    }

    //_empty()

    let buy_levels = 1;
    let level_cost = 150; // 150 coins per level, var here is just for the ui, actual cost is defined on the MS (which should obviously match)

    let rewards = global_battlepass_rewards_cache[global_user_battlepass.battlepass_id];

    let new_level = global_user_battlepass.battlepass.level + buy_levels;
    if (new_level > global_user_battlepass.battlepass.levels) new_level = global_user_battlepass.battlepass.levels;

    // Title
    let title_levels = (global_user_battlepass.battlepass.level+1);
    let title = _createElement("div", "title", localize_ext("battlepass_buy_level", {"count": buy_levels})+" "+title_levels);

    // Reward list and controls
    let content = _createElement("div", "battlepass_buy_levels_cont");
    let reward_list = _createElement("div", "reward_list");
    content.appendChild(reward_list);
    let reward_list_inner = _createElement("div", "reward_list_inner");
    reward_list.appendChild(reward_list_inner);

    // Add the initial reward for the next level
    if (new_level in rewards) {
        reward_list_inner.appendChild(render_level_customization_items(new_level, rewards[new_level]));
    }

    // Rewards scroll
    global_scrollbooster_bars["buy_levels"] = new ScrollBoosterBar(reward_list);
    global_scrollboosters["buy_levels"] = new ScrollBooster({
        viewport: reward_list,
        content: reward_list_inner,
        pointerMode: "mouse",
        friction: 0.05,
        bounceForce: 0.2,
        direction: "horizontal",
        scrollMode: "transform",
        emulateScroll: true,
        onScrollBegin: function() {},
        onScrollEnd: function() {},
        onScroll: function(x,y,viewport,content) {
            global_scrollbooster_bars["buy_levels"].updateThumb(x,y,viewport,content);
        },
    });
    global_scrollbooster_bars["buy_levels"].onScroll = function(pos_x, pos_y) {
        global_scrollboosters["buy_levels"].setPosition({
            "x": pos_x,
            "y": pos_y,
        });
    };

    let controls = _createElement("div", "controls");
    content.appendChild(controls);

    let btn_rem_2 = _createElement("div", ["btn", "rem_2"]);
    let btn_rem = _createElement("div", ["btn", "rem"]);
    let btn_add = _createElement("div", ["btn", "add", "active"]);
    let btn_add_2 = _createElement("div", ["btn", "add_2", "active"]);

    let summary = _createElement("div", "summary");
    let count = _createElement("div", "count", localize_ext("battlepass_level_count", {"count": buy_levels}));
    summary.appendChild(count);
    let price = _createElement("div", "price");
    price.appendChild(_createElement("div", ["icon", "reborn-coin"]));
    let value = _createElement("div", "value", _format_number(level_cost));
    price.appendChild(value);
    summary.appendChild(price);

    controls.appendChild(btn_rem_2);
    controls.appendChild(btn_rem);
    controls.appendChild(summary);
    controls.appendChild(btn_add);
    controls.appendChild(btn_add_2);

    for (let btn of [btn_rem_2, btn_rem, btn_add, btn_add_2]) {
        btn.addEventListener("mouseenter", function() {
            if (btn.classList.contains("active")) {
                _play_mouseover4();
            }
        });
        btn.addEventListener("click", function() {
            if (!btn.classList.contains("active")) return;
            
            _play_click1();

            if (btn.classList.contains("rem")) buy_levels = buy_levels - 1;
            if (btn.classList.contains("rem_2")) buy_levels = buy_levels - 10;
            if (btn.classList.contains("add")) buy_levels = buy_levels + 1;
            if (btn.classList.contains("add_2")) buy_levels = buy_levels + 10;
            if (buy_levels < 1) buy_levels = 1;
            if (buy_levels + global_user_battlepass.battlepass.level > global_user_battlepass.battlepass.levels) buy_levels = global_user_battlepass.battlepass.levels - global_user_battlepass.battlepass.level;
            
            let level_before = new_level;
            new_level = global_user_battlepass.battlepass.level + buy_levels;
            title_levels = (global_user_battlepass.battlepass.level+1);
            if (buy_levels > 1) title_levels = (global_user_battlepass.battlepass.level+1)+" - "+new_level;

            title.textContent = localize_ext("battlepass_buy_level", {"count": buy_levels})+" "+title_levels;
            count.textContent = localize_ext("battlepass_level_count", {"count": buy_levels});
            value.textContent = _format_number(level_cost * buy_levels);

            if (buy_levels > 1) {
                btn_rem.classList.add("active");
                btn_rem_2.classList.add("active");
            } else {
                btn_rem.classList.remove("active");
                btn_rem_2.classList.remove("active");
            }
            if (buy_levels + global_user_battlepass.battlepass.level >= global_user_battlepass.battlepass.levels) {
                btn_add.classList.remove("active");
                btn_add_2.classList.remove("active");
            } else {
                btn_add.classList.add("active");
                btn_add_2.classList.add("active");
            }

            if (level_before > new_level) {
                // decreased
                _for_each_with_class_in_parent(reward_list_inner, "customization_level", function(el) {
                    if (Number(el.dataset.level) > new_level) _remove_node(el);
                });
            } else if (level_before < new_level) {
                // increased
                for (let i = (level_before + 1); i<= new_level; i++) {
                    if (i in rewards && rewards[i].length > 0) reward_list_inner.appendChild(render_level_customization_items(i, rewards[i]));
                }
            }

            req_anim_frame(() => {
                if (global_scrollboosters["buy_levels"]) {
                    global_scrollboosters["buy_levels"].updateMetrics();
                    if (level_before > new_level)      global_scrollboosters["buy_levels"].setPositionEnd();
                    else if (level_before < new_level) global_scrollboosters["buy_levels"].scrollToEnd();
                }
            },2);
        });
    }

    // Buttons
    let btn_cont = _createElement("div", "generic_modal_dialog_action");
    let btn_confirm = _createElement("div", "dialog_button", localize("menu_button_confirm"));
    let btn_cancel = _createElement("div", "dialog_button", localize("menu_button_cancel"));
    _addButtonSounds(btn_confirm, 1);
    _addButtonSounds(btn_cancel, 1);
    btn_cont.appendChild(btn_confirm);
    btn_cont.appendChild(btn_cancel);

    btn_cancel.addEventListener("click", closeBasicModal);
    btn_confirm.addEventListener("click", confirm_buy_levels);

    function render_level_customization_items(level_idx, level_data) {
        let level = _createElement("div", "customization_level");
        level.dataset.level = level_idx;
        for (c of level_data) {
            let c_item = _createElement("div", "customization_item");
            c_item.dataset.msgHtmlId = "customization_item";
            c_item.dataset.id = c.customization_id;
            c_item.dataset.type = c.customization_type;
            c_item.dataset.rarity = c.rarity;
            add_tooltip2_listeners(c_item);

            c_item.classList.add(global_customization_type_map[c.customization_type].name);
            c_item.classList.add("rarity_bg_"+c.rarity);

            c_item.appendChild(renderCustomizationInner(c.customization_type, c.customization_id));

            if (c.amount > 1) {
                c_item.appendChild(_createElement("div", "amount", c.amount));
            }

            level.appendChild(c_item);
        }
        return level;
    }

    openBasicModal(basicGenericModal(title, content, btn_cont));

    function confirm_buy_levels() {
        global_manual_modal_close_disabled = true;

        _empty(btn_cont);

        btn_rem.classList.remove("active");
        btn_rem_2.classList.remove("active");
        btn_add.classList.remove("active");
        btn_add_2.classList.remove("active");

        let processing = _createElement("div", "processing");
        processing.appendChild(_createSpinner());
        processing.appendChild(_createElement("div", "text", localize("processing")));
        btn_cont.appendChild(processing);

        api_request("POST", "/shop/battlepass/tier/purchase", { levels: buy_levels }, purchase_levels_callback);
    }

    function purchase_levels_callback(data) {
        global_manual_modal_close_disabled = false;

        //console.log("purchase_levels_callback", _dump(data));
        if (data.success == false) {
            updateBasicModalContent(basicGenericModal(localize("title_error"), localize("shop_error_"+data.reason), localize("modal_close")));
            engine.call("ui_sound", "ui_window_open");
            return;

            // shop_error_bp_not_available
            // shop_error_missing_bp_ownership
            // shop_error_max_level_reached
            // shop_error_bp_levels_not_available
            // shop_error_insufficient_funds
            // shop_error_transaction_error
        }

        if (data.success == true) {
            closeBasicModal();

            global_self.private.coins = data.coins;

            update_wallet(global_self.private.coins);

            global_user_battlepass.battlepass.level = data.level;
            global_user_battlepass.battlepass.xp    = data.xp;
            global_user_battlepass.progression      = data.progression;

            updateMenuBottomBattlepass(global_user_battlepass);

            if (data.notifs.length) {
                for (let n of data.notifs) {
                    global_notifs.addNotification(n);

                    if (n.items && n.items.length) {
                        add_user_customizations(n.items);
                    }
                }

                load_notifications();
            } else {
                // This should never actually occur... but just in case
                open_battlepass();
            }

            // temp sound?
            engine.call('ui_sound', "ui_shop_purchase_successful");
        }
    }
}

let global_bp_scrolling = false;
function setup_battlepass_reward_scroll(name, content, init_pos) {
    req_anim_frame(function() {
        global_scrollboosters[name] = new ScrollBooster({
            viewport: content.parentElement,
            content: content,
            pointerMode: "mouse",
            friction: 0.05,
            bounceForce: 0.2,
            direction: "horizontal",
            scrollMode: "transform",
            emulateScroll: true,
            onScrollBegin: function() {
                global_bp_scrolling = true;
            },
            onScrollEnd: function() {
                global_bp_scrolling = false;
            }
        });
        global_scrollboosters[name].setPosition({"x": init_pos, "y":0 });
    },2);
}

function format_battlepass_rewards(reward_array) {
    let level_rewards = {};
    for (let r of reward_array) {
        if (!(r.battlepass_reward_level in level_rewards)) level_rewards[r.battlepass_reward_level] = [];
        level_rewards[r.battlepass_reward_level].push(r);
    }
    let rewards = {};

    let levels = Object.keys(level_rewards)
        .map(function(x) { return parseInt(x); })
        .sort(function(a,b) { return a - b; });

    for (let level of levels) {
        rewards[level] = level_rewards[level];
    }
    return rewards;
}

function render_daily_challenges(c_cont, challenges, show_reroll) {
    _empty(c_cont);
    
    let reset_time = untilMidnight();
    //console.log("render_daily_challenges", _dump(challenges), reset_time);

    let fragment = new DocumentFragment();

    // Check if we have a re-roll available
    if (global_self.private.challenge_reroll_ts) {
        let last_reroll_string = global_self.private.challenge_reroll_ts.getUTCDate()+"-"+global_self.private.challenge_reroll_ts.getUTCMonth()+"-"+global_self.private.challenge_reroll_ts.getUTCFullYear();

        let today = new Date();
        let today_string = today.getUTCDate()+"-"+today.getUTCMonth()+"-"+today.getUTCFullYear();

        if (last_reroll_string == today_string) show_reroll = false;
    }

    let count = 0;
    let rerolls = [];
    for (let c of challenges) {
        // Type 0 == daily
        if (c.type != 0) continue;

        count++;

        let challenge = _createElement("div", "challenge");

        if (c.achieved) {
            challenge.classList.add("achieved");
        }

        let left = _createElement("div", "left");
        challenge.appendChild(left);

        if (c.achieved) {
            let check = _createElement("div", "check");
            left.appendChild(check);
        } else {
            let xp = _createElement("div", "xp_icon");
            xp.innerHTML = "XP";
            left.appendChild(xp);

            let xp_number = _createElement("div", "xp_number");
            xp_number.innerHTML = c.xp;
            left.appendChild(xp_number);
        }

        let right = _createElement("div", "right");
        challenge.appendChild(right);

        let desc = _createElement("div", "description");
        desc.innerHTML = localize("challenge_"+c.challenge_id);
        right.appendChild(desc);

        if (c.achieved) {
            let new_quest = _createElement("div", "new_quest");
            new_quest.innerHTML = localize("challenges_new_challenge_in")+" "+reset_time;
            right.appendChild(new_quest);
        } else {
            let progress_cont = _createElement("div", "progress_cont");
            right.appendChild(progress_cont);

            let bar = _createElement("div", "bar");
            progress_cont.appendChild(bar);
            let bar_inner = _createElement("div", "bar_inner");
            bar_inner.style.width = Math.floor(c.progress / c.goal * 100)+"%";
            bar.appendChild(bar_inner);

            let progress = _createElement("div", "progress");
            progress_cont.appendChild(progress);
            let current = _createElement("div", "current");
            current.innerHTML = c.progress;
            progress.appendChild(current);
            let separator = _createElement("div", "separator");
            separator.innerHTML = "/";
            progress.appendChild(separator);
            let goal = _createElement("div", "goal");
            goal.innerHTML = c.goal;
            progress.appendChild(goal);
        }

        if (show_reroll && !c.achieved) {            
            let reroll = _createElement("div", "reroll");
            reroll.addEventListener("click", function() {
                global_self.private.challenge_reroll_ts = new Date();

                send_string(CLIENT_COMMAND_REROLL_CHALLENGE, c.challenge_id);

                // Remove the reroll buttons
                for (let r of rerolls) _remove_node(r);
            });

            _addButtonSounds(reroll, 1);

            reroll.dataset.msgId = "reroll_challenge";
            add_tooltip2_listeners(reroll);

            challenge.appendChild(reroll);
            rerolls.push(reroll);
        }

        fragment.appendChild(challenge);
    }

    if (count == 0) {
        let no_challenges = _createElement("div", "no_challenges");
        no_challenges.innerHTML = localize("challenges_no_challenges");
        fragment.appendChild(no_challenges);
    }

    c_cont.appendChild(fragment);

    function untilMidnight() {
        let now = new Date();
        let then = new Date(now);
        then.setUTCHours(24, 0, 0, 0);
        let total_mins = (then - now) / 6e4;
        let hours = Math.floor(total_mins / 60);
        let minutes = Math.ceil(total_mins % 60);
        if (minutes < 10) minutes = "0" + minutes;
        return hours+"h "+minutes+"m";
    }
}

function render_battlepass(bp) {
    //console.log("render_battlepass",_dump(bp));

    if (!(bp.battlepass_id in global_battlepass_data)) return;

    let prog_box = _id("battlepass_progression_box");

    let head = prog_box.querySelector(".head");
    if (bp.battlepass.owned) head.textContent = localize("battlepass_version_paid");
    else head.textContent = localize("battlepass_version_free");

    let title = prog_box.querySelector(".title");
    title.textContent = localize(global_battlepass_data[bp.battlepass_id].title);


    let left = prog_box.querySelector(".progression .left");
    _empty(left);
    let right = prog_box.querySelector(".progression .right");

    if (bp.battlepass.level == 100)  {
        left.classList.add("completed");
        right.classList.add("completed");
    }
    
    let level_icon = _createElement("div", "bp_level_icon");
    level_icon.innerHTML = bp.battlepass.level;
    if (bp.battlepass.owned) {
        level_icon.classList.add("paid");
    }
    left.appendChild(level_icon);

    let bar_inner = prog_box.querySelector(".progression .right .bar .inner");
    let perc_to_next_level = ((bp.battlepass.xp - bp.progression.cur_level_req) / (bp.progression.next_level_req - bp.progression.cur_level_req)) * 100;
    bar_inner.style.width = perc_to_next_level + '%';

    let xp_to_next_level = bp.progression.next_level_req - bp.battlepass.xp;
    let xp_number = prog_box.querySelector(".progression .right .xp .number");
    xp_number.textContent = xp_to_next_level;


    let season_end = prog_box.querySelector(".season_end");
    season_end.textContent = localize_ext("battlepass_season_ends_in", { "time": _time_until((new Date(bp.battlepass.end_ts) - new Date()) / 1000) });
}

function render_battlepass_rewards(cont, bp, rewards, select_cb) {

    let bp_rewards = cont.querySelector(".battlepass_rewards");
    _empty(bp_rewards);

    emptyRewardPreview(cont);

    if (!bp.battlepass) return;

    // Show arrows again
    _for_each_with_selector_in_parent(cont, ".rewards_arrow", function(el) {
        el.style.display = "flex";
    });

    let fragment = new DocumentFragment();

    let count = 0;
    let locked_count = 0;
    let last_unlock = undefined;
    let last_unlock_data = undefined;
    let first_reward = undefined;
    let first_reward_data = undefined;
    let prev_reward_count = 0;
    for (let current_level=1; current_level<=bp.battlepass.levels; current_level++) {

        let level_rewards = [];
        if (current_level in rewards) level_rewards = rewards[current_level];

        let reward_level = _createElement("div", "reward_level");
        fragment.appendChild(reward_level);

        let top = _createElement("div", "top");
        reward_level.appendChild(top);

        let level_cont = _createElement("div", "level_cont");
        reward_level.appendChild(level_cont);
        if (bp.battlepass.level >= current_level) {
            level_cont.classList.add("unlocked");
        }
        level_cont.addEventListener('mouseenter', function() {
            reward_level.classList.add("hover");
        });
        level_cont.addEventListener('mouseleave', function() {
            reward_level.classList.remove("hover");
        });

        let level = _createElement("div", "level");
        level.innerHTML = current_level;
        level_cont.appendChild(level);

        if (current_level != 1) {
            let connect_bar = _createElement("div", "connect_bar");
            let connect_bar_inner = _createElement("div", "connect_bar_inner");

            connect_bar.style.setProperty("--prev_rewards", (prev_reward_count > 1 ? prev_reward_count : 1));
            connect_bar.style.setProperty("--cur_rewards", (level_rewards.length > 1 ? level_rewards.length : 1));

            if (bp.battlepass.level >= current_level) {
                connect_bar_inner.style.width = "100%";
            } else {
                if (bp.battlepass.level + 1 == current_level) {
                    let perc_to_next_level = ((bp.battlepass.xp - bp.progression.cur_level_req) / (bp.progression.next_level_req - bp.progression.cur_level_req)) * 100;
                    connect_bar_inner.style.width = perc_to_next_level+"%";
                } else {
                    connect_bar_inner.style.width = "0%";
                }
            }          

            connect_bar.appendChild(connect_bar_inner);
            reward_level.appendChild(connect_bar);
        }

        prev_reward_count = level_rewards.length;

        for (let r of level_rewards) {

            let item_cont = _createElement("div", "customization_item_cont");
            top.appendChild(item_cont);

            let item = _createElement("div", ["customization_item", "image", "rarity_bg_"+r.rarity]);
            item_cont.appendChild(item);

            let img = renderCustomizationInner(r.customization_type, r.customization_id);
            item.appendChild(img);

            if (r.amount > 1) {
                item.appendChild(_createElement("div", "amount", r.amount));
            }

            if (bp.battlepass.level >= r.battlepass_reward_level && !bp.battlepass.owned && !r.free) {
                let state = _createElement("div", ["state", "locked"]);
                item_cont.appendChild(state);
                item_cont.classList.add("locked");
                locked_count++;
            }
            if (bp.battlepass.level >= r.battlepass_reward_level && (bp.battlepass.owned || r.free)) {
                let state = _createElement("div", ["state", "unlocked"]);
                let checkmark = _createElement("div", "checkmark");
                state.appendChild(checkmark);
                item_cont.appendChild(state);
                last_unlock = item_cont;
                last_unlock_data = r;
            }

            if (bp.battlepass.level < r.battlepass_reward_level) {
                let free = _createElement("div", "free");
                if (r.free) free.innerHTML = "free";
                item_cont.appendChild(free);
            }
            
            item_cont.addEventListener("mouseenter", function() {
                item_cont.classList.add("hover");
                if (!global_bp_scrolling) _play_mouseover4();
            });
            item_cont.addEventListener("mouseleave", function() {
                item_cont.classList.remove("hover");
            });
            item_cont.addEventListener("click", function() {
                _play_click1();
                
                _for_each_with_selector_in_parent(bp_rewards, ".customization_item_cont.selected", function(el) {
                    el.classList.remove("selected");
                });

                item_cont.classList.add("selected");

                select_cb(cont, r);
            });

            if (first_reward == undefined) {
                first_reward = item_cont;
                first_reward_data = r;
            }

            count++;
        }
    }

    bp_rewards.appendChild(fragment);
    
    // initially highlight the last item you unlocked
    if (last_unlock != undefined) {
        last_unlock.classList.add("selected");
        last_unlock.firstElementChild.firstElementChild.classList.add("selected");

        select_cb(cont, last_unlock_data);
    } else {
        first_reward.classList.add("selected");
        first_reward.firstElementChild.firstElementChild.classList.add("selected");
        
        select_cb(cont, first_reward_data);
    }
    
    let parent_rect = bp_rewards.parentElement.getBoundingClientRect();

    let reward_width_vh = 10.5;
    let reward_width_px = (window.outerHeight / 100) * reward_width_vh;

    let offset = (bp.battlepass.level - 1) * reward_width_px;
    let max_offset = (reward_width_px * count) - parent_rect.width;

    let centered_offset = offset - (parent_rect.width / 2) + (reward_width_px / 2);
    if (centered_offset < 0) centered_offset = 0;
    if (centered_offset > max_offset) centered_offset = max_offset;

    return { pos: centered_offset, locked_count: locked_count };
}

function emptyRewardPreview(cont) {
    let reward_title = cont.querySelector(".battlepass_reward_preview .reward_title");
    _empty(reward_title);
    let desc_cont = cont.querySelector(".battlepass_reward_preview .reward_info");
    _empty(desc_cont);
}
function showRewardPreview(cont, reward) {
    //console.log(_dump(global_user_battlepass));
    //console.log(_dump(reward));

    let preview_cont = cont.querySelector(".battlepass_reward_preview .reward_preview");
    _empty(preview_cont);
    
    // Big Preview
    preview_cont.appendChild(createCustomizationPreview(reward));

    let desc_cont = cont.querySelector(".battlepass_reward_preview .reward_info");
    _empty(desc_cont);

    let reward_title = cont.querySelector(".battlepass_reward_preview .reward_title");
    _empty(reward_title);

    reward_title.appendChild(createCustomizationName(reward));
    
    let fragment = new DocumentFragment();
    fragment.appendChild(createCustomizationInfo(reward, false));

    if (global_user_battlepass.battlepass.level >= reward.battlepass_reward_level && global_user_battlepass.battlepass.owned == false && reward.free == false) {
        let unlock_msg = _createElement("div", "unlock_msg", localize("battlepass_unlock_item_msg"));
        fragment.appendChild(unlock_msg);
    }
    if (reward.battlepass_reward_level > global_user_battlepass.battlepass.level) {
        let msg = localize_ext("battlepass_item_level_requirement_msg", {"level": reward.battlepass_reward_level});
        if (reward.free) msg = localize_ext("battlepass_free_item_level_requirement_msg", {"level": reward.battlepass_reward_level});

        let unlock_msg = _createElement("div", "unlock_msg", msg);
        fragment.appendChild(unlock_msg);
    }

    desc_cont.appendChild(fragment);    
}


function updateBattlePassProgress(progress) {
    if (!("to" in progress)) return;

    global_user_battlepass.battlepass.xp = Number(progress.to.xp);
    global_user_battlepass.battlepass.level = Number(progress.to.level);

    global_user_battlepass.progression.xp = Number(progress.to.xp);
    global_user_battlepass.progression.level = Number(progress.to.level);
    global_user_battlepass.progression.cur_level_req = Number(progress.to.cur_level_req);
    global_user_battlepass.progression.next_level_req = Number(progress.to.next_level_req);
}
