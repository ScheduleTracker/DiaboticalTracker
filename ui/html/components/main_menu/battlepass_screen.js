let battlepass_rewards_drag_scroll = undefined;
let global_battlepass_rewards_cache = {};
function init_screen_battlepass() {
    _for_each_with_selector_in_parent(_id("battlepass_screen"), ".rewards_arrow", function(el) {
        if (el.classList.contains("prev")) {
            el.addEventListener("click", function(e) { 
                if (!battlepass_rewards_drag_scroll) return;
                battlepass_rewards_drag_scroll.scrollTo(false, 0.1); 
            });
        }
        if (el.classList.contains("next")) {
            el.addEventListener("click", function(e) { 
                if (!battlepass_rewards_drag_scroll) return;
                battlepass_rewards_drag_scroll.scrollTo(true, 0.1); 
            });
        }
    });

    _id("battlepass_screen").querySelector(".battlepass_rewards").addEventListener("wheel", function(e) {
        if (!battlepass_rewards_drag_scroll) return;

        if (e.deltaY < 0) {
            battlepass_rewards_drag_scroll.scrollTo(false, 0.05);
        } else {
            battlepass_rewards_drag_scroll.scrollTo(true, 0.05);
        }
    });
}

function load_battlepass() {
    //console.log("load_battlepass",_dump(global_user_battlepass));

    if (!global_user_battlepass.battlepass_id) {
        // TODO handle the "no battlepass" case? even if it should never actually occur
        return;
    }

    // Class for battlepass colors
    let screen = _id("battlepass_screen");
    if (global_user_battlepass.battlepass_id in global_battlepass_data) _set_battle_pass_colors(screen, global_battlepass_data[global_user_battlepass.battlepass_id].colors);
    
    
    render_battlepass(global_user_battlepass);

    let c_cont = _id("battlepass_daily_challenges");
    render_daily_challenges(c_cont, global_user_battlepass.challenges);

    let bp_rewards = screen.querySelector(".battlepass_rewards");

    if (global_user_battlepass.battlepass_id in global_battlepass_rewards_cache) {
        render_battlepass_rewards(screen, global_user_battlepass, global_battlepass_rewards_cache[global_user_battlepass.battlepass_id], showRewardPreview);
        battlepass_rewards_drag_scroll = new Dragscroll(bp_rewards);
    } else {

        // Show spinner while loading
        _empty(bp_rewards);
        bp_rewards.appendChild(_createSpinner());

        // Hide arrows during loading
        _for_each_with_selector_in_parent(_id("battlepass_screen"), ".rewards_arrow", function(el) {
            el.style.display = "none";
        });

        send_string(CLIENT_COMMAND_GET_BATTLEPASS_REWARDS, global_user_battlepass.battlepass_id, "battlepass-rewards", function(data) {
            global_battlepass_rewards_cache[global_user_battlepass.battlepass_id] = data.data;
            render_battlepass_rewards(screen, global_user_battlepass, data.data, showRewardPreview);
            battlepass_rewards_drag_scroll = new Dragscroll(bp_rewards);
        });
    }
}

function render_daily_challenges(c_cont, challenges) {
    _empty(c_cont);
    
    let reset_time = untilMidnight();

    let fragment = new DocumentFragment();

    let count = 0;
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
        then.setHours(24, 0, 0, 0);
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

    let title = prog_box.querySelector(".head");
    title.innerHTML = localize(global_battlepass_data[bp.battlepass_id].title);

    let left = prog_box.querySelector(".progression .left");
    _empty(left);
    
    let pass_tag = _createElement("div", "tag");
    if (bp.battlepass.owned) {
        pass_tag.innerHTML = localize("battlepass_version_paid")
    } else {
        pass_tag.innerHTML = localize("battlepass_version_free");
        pass_tag.classList.add("free");
    }
    left.appendChild(pass_tag);
    
    let level_icon = _createElement("div", "bp_level_icon");
    level_icon.innerHTML = bp.battlepass.level;
    if (bp.battlepass.owned) {
        level_icon.style.backgroundImage = "url("+global_battlepass_data[bp.battlepass_id]['level-image']+")";
    }
    left.appendChild(level_icon);

    let bar_inner = prog_box.querySelector(".progression .right .bar .inner");
    let perc_to_next_level = ((bp.battlepass.xp - bp.progression.cur_level_req) / (bp.progression.next_level_req - bp.progression.cur_level_req)) * 100;
    bar_inner.style.width = perc_to_next_level + '%';

    let xp_to_next_level = bp.progression.next_level_req - bp.battlepass.xp;
    let xp_number = prog_box.querySelector(".progression .right .xp .number");
    _html(xp_number, xp_to_next_level);
    


    
    
    /*
    let desc_box = _id("battlepass_description_box");
    let tag = desc_box.querySelector(".tag");
    _html(tag, localize(global_battlepass_data[bp.battlepass_id].tag));

    let title = desc_box.querySelector(".title div");
    _html(title, localize(global_battlepass_data[bp.battlepass_id].title));

    let desc = desc_box.querySelector(".desc");
    _html(desc, localize(global_battlepass_data[bp.battlepass_id].description));
    */
}

function render_battlepass_rewards(cont, bp, rewards, select_cb) {
    
    let bp_rewards = cont.querySelector(".battlepass_rewards");
    _empty(bp_rewards);

    emptyRewardPreview(cont);

    if (!rewards.length) return;

    // Show arrows again
    _for_each_with_selector_in_parent(cont, ".rewards_arrow", function(el) {
        el.style.display = "flex";
    });

    let fragment = new DocumentFragment();

    let count = 0;
    let last_unlock = undefined;
    let last_unlock_data = undefined;
    let first_reward = undefined;
    let first_reward_data = undefined;
    for (let r of rewards) {
        let reward = _createElement("div", "reward");

        let top = _createElement("div", "top");
        reward.appendChild(top);

        let image_cont = _createElement("div", "image_cont");
        top.appendChild(image_cont);

        let image = _createElement("div", ["image", "rarity_bg_"+r.rarity]);
        image_cont.appendChild(image);

        let img = _createElement("img");
        if (r.customization_type == "0") {
            // Currency
            img.src = "/html/images/replaceme/Coins_Icon_256.png";
            img.classList.add("currency");
        }
        if (r.customization_type == "1") {
            // Decal
            img.src = _stickerUrl(r.customization_id);
        }
        image.appendChild(img);

        if (r.amount > 1) {
            let amount = _createElement("div", "amount");
            amount.innerHTML = r.amount;
            image.appendChild(amount);
        }

        if (bp.battlepass.level >= r.battlepass_reward_level && !bp.battlepass.owned && !r.free) {
            let state = _createElement("div", ["state", "locked"]);
            image_cont.appendChild(state);
            image.classList.add("locked");
        }
        if (bp.battlepass.level >= r.battlepass_reward_level && (bp.battlepass.owned || r.free)) {
            let state = _createElement("div", ["state", "unlocked"]);
            image_cont.appendChild(state);
            last_unlock = reward;
            last_unlock_data = r;
        }

        if (bp.battlepass.level < r.battlepass_reward_level) {
            let free = _createElement("div", "free");
            if (r.free) free.innerHTML = "free";
            image_cont.appendChild(free);
        }

        let level_cont = _createElement("div", "level_cont");
        reward.appendChild(level_cont);
        if (bp.battlepass.level >= r.battlepass_reward_level) {
            level_cont.classList.add("unlocked");
        }

        let level = _createElement("div", "level");
        level.innerHTML = r.battlepass_reward_level;
        level_cont.appendChild(level);

        if (count != 0) {
            let connect_bar = _createElement("div", "connect_bar");
            let connect_bar_inner = _createElement("div", "connect_bar_inner");

            if (bp.battlepass.level >= r.battlepass_reward_level) {
                connect_bar_inner.style.width = "100%";
            } else {
                if (bp.battlepass.level + 1 == r.battlepass_reward_level) {
                    let perc_to_next_level = ((bp.battlepass.xp - bp.progression.cur_level_req) / (bp.progression.next_level_req - bp.progression.cur_level_req)) * 100;
                    connect_bar_inner.style.width = perc_to_next_level+"%";
                } else {
                    connect_bar_inner.style.width = "0%";
                }
            }          

            connect_bar.appendChild(connect_bar_inner);
            reward.appendChild(connect_bar);
        }
        
        reward.addEventListener("mouseenter", function() {
            image.classList.add("hover");
            engine.call('ui_sound', 'ui_mouseover4');
        });
        reward.addEventListener("mouseleave", function() {
            image.classList.remove("hover");
        });
        reward.addEventListener("click", function() {
            engine.call('ui_sound', 'ui_click1');
            
            _for_each_with_selector_in_parent(bp_rewards, ".reward.selected", function(el) {
                el.classList.remove("selected");
                el.firstElementChild.firstElementChild.firstElementChild.classList.remove("selected");
            });

            reward.classList.add("selected");
            reward.firstElementChild.firstElementChild.firstElementChild.classList.add("selected");

            select_cb(cont, r);
        });

        if (first_reward == undefined) {
            first_reward = reward;
            first_reward_data = r;
        }

        fragment.appendChild(reward);
        count++;
    }

    bp_rewards.appendChild(fragment);
    
    // initially highlight the last item you unlocked
    if (last_unlock != undefined) {
        last_unlock.classList.add("selected");
        last_unlock.firstElementChild.firstElementChild.firstElementChild.classList.add("selected");

        select_cb(cont, last_unlock_data);
    } else {
        first_reward.classList.add("selected");
        first_reward.firstElementChild.firstElementChild.firstElementChild.classList.add("selected");
        
        select_cb(cont, first_reward_data);
    }
    
    let parent_rect = bp_rewards.parentElement.getBoundingClientRect();

    let reward_width_vh = 10.5;
    let reward_width_px = (window.outerHeight / 100) * reward_width_vh;

    let offset = (bp.battlepass.level - 1) * reward_width_px;
    let max_offset = (reward_width_px * rewards.length) - parent_rect.width;

    let centered_offset = offset - (parent_rect.width / 2) + (reward_width_px / 2);
    if (centered_offset < 0) centered_offset = 0;
    if (centered_offset > max_offset) centered_offset = max_offset;

    bp_rewards.style.transform = "translateX(" + (centered_offset * -1) + "px)";
}

function emptyRewardPreview(cont) {
    let desc_cont = cont.querySelector(".battlepass_reward_preview .reward_info .customization_info");
    _empty(desc_cont);
}
function showRewardPreview(cont, reward) {
    let desc_cont = cont.querySelector(".battlepass_reward_preview .reward_info .customization_info");
    _empty(desc_cont);

    let div_type = _createElement("div", ["type","rarity_bg_"+reward.rarity]);
    div_type.appendChild(_createElement("div", "rarity",localize(global_rarity_map[reward.rarity].i18n)));
    div_type.appendChild(_createElement("div", "separator", "/"));
    div_type.appendChild(_createElement("div", "item_type", localize(global_customization_type_map[reward.customization_type].i18n)));
    desc_cont.appendChild(div_type);
    desc_cont.appendChild(_createElement("div", "name", localize("customization_"+reward.customization_id)));
}