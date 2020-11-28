
let global_rank_screen_queue = [];

function renderRankScreen(data) {
    //console.log("==== renderRankScreen", _dump(data));

    _id("rank_screen").querySelector(".placement_progression").style.display = "none";
    _id("rank_screen").querySelector(".rank_progression").style.display = "none";

    global_rank_screen_queue = [];

    // We decided to not show placement match progress anymore, ill keep this commented in case we change our mind
    // Also only show rank tier changes when ranking up, not down
    global_show_rank_change = false;

    if ("placement_match" in data && Number(data.placement_match) == 1 && data.to.placement_matches && data.to.placement_matches.length) {
        /*
        // Show placement matches screen
        renderPlacementMatches(data);

        global_rank_screen_queue.push({
            "type": "placement",
            "time": (data.to.placement_matches.length * 0.55) + 3
        });
        */

        if (data.to.placement_matches.length == Number(data.placement_matches)) {
            renderPlacementRank(data);

            let sound = 'ui_ranked_rank_up';
            if (data.to.rank_position !== null && data.to.rank_position !== undefined) {
                if (data.to.rank_position == 1) sound = 'ui_ranked_rank_up_legend';
                else if (data.to.rank_position <= 50) sound = 'ui_ranked_rank_up_high_warlord';
                else if (data.to.rank_position <= 100) sound = 'ui_ranked_rank_up_grandmaster';
                else sound = 'ui_ranked_rank_up_elite';
            }

            global_rank_screen_queue.push({
                "type": "placement-rank",
                "time": 6.3,
                "match_type": data.match_type,
                "sound": sound
            });
            global_show_rank_change = true;
        }
    } else {
        renderRankUpdate(data);

        let type = "";
        let time = 0;
        let sound = '';
        if (data.from.rank_tier != null) {
            if (data.from.rank_tier < data.to.rank_tier) {
                type = "rank-up";
                time = 6;
                sound = 'ui_ranked_rank_up';
            }
            /*
            if (data.from.rank_tier > data.to.rank_tier) {
                type = "rank-down";
                time = 5;
                if (data.match_type == 2) time = 7;
                sound = 'ui_ranked_rank_down';
            }
            */
            if (data.from.rank_position != null && data.to.rank_position != null) {
                if (data.from.rank_position > data.to.rank_position) {
                    type = "rank-up";
                    time = 6;
                    sound = 'ui_ranked_rank_up';
                }
                /*
                if (data.from.rank_position < data.to.rank_position) {
                    type = "rank-down";
                    time = 5;
                    if (data.match_type == 2) time = 7;
                    sound = 'ui_ranked_rank_down';
                }
                */
            }
            /*
            if (data.from.rank_position == null && data.to.rank_position != null) {
                type = "rank-up";
                time = 10;
                sound = 'ui_ranked_rank_up';
            }
            
            if (data.from.rank_position != null && data.to.rank_position == null) {
                type = "rank-down";
                time = 5;
                if (data.match_type == 2) time = 7;
                sound = 'ui_ranked_rank_down';
            }
            */
        } else {
            if (data.to.rank_tier != null) {
                type = "rank-up";
                time = 6;
                sound = 'ui_ranked_rank_up';
            }
        }

        if (type == "rank-up" && data.to.rank_position !== null && data.to.rank_position !== undefined) {
            if (data.to.rank_position == 1) sound = 'ui_ranked_rank_up_legend';
            else if (data.to.rank_position <= 50) sound = 'ui_ranked_rank_up_high_warlord';
            else if (data.to.rank_position <= 100) sound = 'ui_ranked_rank_up_grandmaster';
            else sound = 'ui_ranked_rank_up_elite';
        }

        if (type.length) {
            global_rank_screen_queue.push({
                "type": type,
                "time": time,
                "match_type": data.match_type,
                "sound": sound
            });
            global_show_rank_change = true;
        }
    }
}

/*
function renderPlacementMatches(data) {
    //console.log("==== renderPlacementMatches", _dump(data));

    let match_count = 10;
    if ("placement_matches" in data) match_count = Number(data.placement_matches);

    let cont = _id("rank_screen").querySelector(".placement_progression");
    _empty(cont);

    cont.appendChild(_createElement("div", "title", localize("placement_matches")));

    let match_list = _createElement("div", "match_list");
    match_list.appendChild(_createElement("div", ["dot", "block"]));

    for (let i=0; i<match_count; i++) {

        let result = '';
        if (i < data.to.placement_matches.length) {
            if (data.to.placement_matches.charAt(i) == "1") {
                result = "win";
            } else {
                result = "loss";
            }
        }

        let line = _createElement("div", "line");
        line.style.setProperty("--index", i);

        if (result.length) {
            let line_overlay = _createElement("div", "line_overlay");
            line_overlay.classList.add(result);
            line.appendChild(line_overlay);
            
            line_overlay.addEventListener("animationend", function() {
                play_tracked_sound("ui_match_found_tick");
            });
        }

        match_list.appendChild(line);

        let dot = undefined;
        if (i == 9) {
            dot = _createElement("div", ["dot", "block"]);
        } else {
            dot = _createElement("div", "dot");
        }
        dot.style.setProperty("--index", i);

        if (result.length) {
            let dot_overlay = _createElement("div", "dot_overlay");
            dot_overlay.classList.add(result);
            dot.appendChild(dot_overlay);
        }

        let result_box = _createElement("div", "result_box");
        result_box.style.setProperty("--index", i);
        result_box.classList.add(result);

        let icon = _createElement("div", "icon");
        result_box.appendChild(icon);

        let arrow = _createElement("div", "arrow");
        result_box.appendChild(arrow);

        dot.appendChild(result_box);

        match_list.appendChild(dot);
    }

    cont.appendChild(match_list);
}
*/


function renderPlacementRank(data) {
    //console.log("==== renderPlacementRank");

    let cont = _id("rank_screen").querySelector(".placement_rank");
    _empty(cont);

    let title = _createElement("div", "title", localize("placement_matches_completed"));
    cont.appendChild(title);

    let rank_icon_cont = _createElement("div", "rank_icon_cont");

    let team_size = 1;
    if (data.mode in global_queues) team_size = global_queues[data.mode].team_size;

    let type = 'image';
    let rank = renderRankIcon(data.to.rank_tier, data.to.rank_position, team_size, "big");
    rank_icon_cont.appendChild(rank);

    let video_url = getRankVideoUrl(data.to.rank_tier, data.to.rank_position);
    if (video_url.length) {
        type = 'video';
        let rank_video = _createElement("video", "rank_video");
        rank_video.classList.add("next");
        rank_video.src = video_url;
        rank_icon_cont.appendChild(rank_video);
        if (data.to.rank_position && data.to.rank_position > 1) {
            let rank_video_position = _createElement("div", "rank_video_position", data.to.rank_position);
            rank_icon_cont.appendChild(rank_video_position);
        }
    }

    cont.appendChild(rank_icon_cont);

    let rank_name_cont = _createElement("div", "rank_name_cont");
    let rank_name = _createElement("div", "rank_name");
    rank_name.appendChild(getRankName(data.to.rank_tier, data.to.rank_position));
    rank_name_cont.appendChild(rank_name);
    cont.appendChild(rank_name_cont);

    cont.dataset.to_type = type;

    /*
    if (data.match_type == 2) {
        let progress_cont = _createElement("div", "progress_cont");
        let progress = _createElement("div", "progress");
        progress.dataset.to_type = type;
        let value = _createElement("div", "value");
        value.textContent = Math.floor(data.to.rating);
        let unit = _createElement("div", "unit");
        // Competitive
        unit.textContent = "SR";
        progress.appendChild(value);
        progress.appendChild(unit);
        progress_cont.appendChild(progress);
        cont.appendChild(progress_cont);
    }
    */
}


function renderRankUpdate(data) {
    
    let cont = _id("rank_screen").querySelector(".rank_progression");
    _empty(cont);

    let rank_icon_cont = _createElement("div", "rank_icon_cont");

    let team_size = 1;
    if (data.mode in global_queues) team_size = global_queues[data.mode].team_size;

    let prev_rank = renderRankIcon(data.from.rank_tier, data.from.rank_position, team_size, "big");
    prev_rank.classList.add("prev");
    rank_icon_cont.appendChild(prev_rank);
    let next_rank = renderRankIcon(data.to.rank_tier, data.to.rank_position, team_size, "big");
    next_rank.classList.add("next");
    rank_icon_cont.appendChild(next_rank);
    
    let video_url = getRankVideoUrl(data.to.rank_tier, data.to.rank_position);
    if (video_url.length) {
        let rank_video = _createElement("video", "rank_video");
        rank_video.classList.add("next");
        rank_video.src = video_url;
        rank_icon_cont.appendChild(rank_video);
        if (data.to.rank_position && data.to.rank_position > 1) {
            let rank_video_position = _createElement("div", "rank_video_position", data.to.rank_position);
            rank_icon_cont.appendChild(rank_video_position);
        }
    }
    
    cont.appendChild(rank_icon_cont);

    let rank_name_cont = _createElement("div", "rank_name_cont");
    let prev_rank_name = _createElement("div", "rank_name");
    prev_rank_name.appendChild(getRankName(data.from.rank_tier, data.from.rank_position));
    prev_rank_name.classList.add("prev");
    rank_name_cont.appendChild(prev_rank_name);
    let next_rank_name = _createElement("div", "rank_name");
    next_rank_name.appendChild(getRankName(data.to.rank_tier, data.to.rank_position));
    next_rank_name.classList.add("next");
    rank_name_cont.appendChild(next_rank_name);
    cont.appendChild(rank_name_cont);


    let type = 'image';
    if (data.from.rating > data.to.rating) {
        type = 'image';
    } else {
        if (video_url.length) type = 'video';
    }

    cont.dataset.to_type = type;

    /*
    let progress_cont = _createElement("div", "progress_cont");
    let progress = _createElement("div", "progress");
    let change_icon = _createElement("div", "icon");
    let prefix = _createElement("div", "prefix");
    let win = 1;
    let type = 'image';
    if (data.from.rating > data.to.rating) {
        win = 0;
        type = 'image';
        prefix.textContent = "-";
        change_icon.style.backgroundImage = "url(/html/ranks/weeball_loser.png.dds)";
    } else {
        win = 1;
        if (video_url.length) type = 'video';
        prefix.textContent = "+";
        change_icon.style.backgroundImage = "url(/html/ranks/weeball_winner.png.dds)";
    }

    let value = _createElement("div", "value");
    progress.dataset.win = win;
    progress.dataset.to_type = type;
    if (data.match_type == 2) {
        value.dataset.from = Math.floor(data.from.rating);
        value.dataset.to = Math.floor(data.to.rating);
        value.textContent = Math.floor(data.from.rating);
    } else {
        value.dataset.from = 0;
        value.dataset.to = Math.floor(Math.abs(data.to.rating - data.from.rating));
        value.textContent = 0;
    }
    */
    
    /*
    value.dataset.from = Math.floor(data.to.rating);
    value.dataset.to = Math.floor(data.to.rating);
    value.textContent = Math.floor(data.from.rating);
    */
   /*
    let unit = _createElement("div", "unit");
    if (data.match_type == 2) {
        // Competitive
        unit.textContent = "SR";
    } else if (data.match_type == 3) {
        // Quickplay
        unit.textContent = localize("rank_points");
        unit.classList.add("points");
    }
    progress.appendChild(change_icon);
    if (win == 1) {
        if (data.match_type == 3) {
            progress.appendChild(prefix);
        }
        progress.appendChild(value);
        progress.appendChild(unit);
    } else {
        if (data.match_type == 2) {
            progress.appendChild(value);
            progress.appendChild(unit);
        }
    }
    progress_cont.appendChild(progress);
    cont.appendChild(progress_cont);
    */

}

function showRankScreen(cb, initial) {
    //console.log("===== showRankScreen", initial, global_hud_view_active, global_rank_screen_queue.length);
    if (!global_hud_view_active) {
        if (typeof cb == "function") cb();
        return;
    }

    let cont = _id("rank_screen");

    let placement_screen = cont.querySelector('.placement_progression');
    let rank_screen = cont.querySelector('.rank_progression');
    let placement_rank_screen = cont.querySelector('.placement_rank');

    if (initial && initial == true) {
        anim_hide(placement_screen);
        anim_hide(rank_screen);
        anim_hide(placement_rank_screen);
    }

    if (!global_rank_screen_queue.length) {
        if (typeof cb == "function") cb();
        return;
    }

    anim_show(cont, 500);

    let first = global_rank_screen_queue.shift();

    let current = undefined;

    /*
    if (first.type == "placement") {
        current = placement_screen;
        anim_show(placement_screen, 500, "flex", function() {
            setTimeout(function() {
                _for_each_with_class_in_parent(placement_screen, 'line_overlay', function(el) { el.classList.add("visible"); });
                _for_each_with_class_in_parent(placement_screen, 'dot_overlay', function(el) { el.classList.add("visible"); });
                _for_each_with_class_in_parent(placement_screen, 'result_box', function(el) { el.classList.add("visible"); });
            },500);
        });
    }
    */

    /*
    if (first.type == "rank") {
        current = rank_screen;
        anim_show(rank_screen, 500, "flex", function() {
            setTimeout(function() {
                let win = Number(rank_screen.querySelector(".progress").dataset.win);
                if (win == 1 || first.match_type == 2) {
                    let value = rank_screen.querySelector(".progress_cont .value");
                    let from = value.dataset.from;
                    let to = value.dataset.to;
                    let prev = 0;
                    let play_sound = true;
                    play_tracked_sound("ui_ranked_xp_gain");
                    anim_start({
                        "element": value,
                        "duration": 3000,
                        "delay": 0,
                        "number": [from, to, function(val) {

                            if (prev != val) {
                                if (play_sound == true) {
                                    play_tracked_sound("ui_ranked_xp_gain_tick");
                                    play_sound = false;
                                    setTimeout(function() { play_sound = true; }, 5);
                                }
                                prev = val;
                            }
                
                        }],
                        "easing": easing_functions.easeOutQuart,
                        "completion": function() {}
                    });
                }
            }, 700);
        });
    }
    */

    if (first.type == "rank-up") {
        current = rank_screen;
        anim_show(rank_screen, 500, "flex", function() {
            setTimeout(function() {
                /*
                let win = Number(rank_screen.querySelector(".progress").dataset.win);
                let type = rank_screen.querySelector(".progress").dataset.to_type;
                if (win == 1) {
                    let value = rank_screen.querySelector(".progress_cont .value");
                    let from = value.dataset.from;
                    let to = value.dataset.to;
                    let prev = 0;
                    let play_sound = true;
                    play_tracked_sound("ui_ranked_xp_gain");
                    anim_start({
                        "element": value,
                        "duration": 3000,
                        "delay": 0,
                        "number": [from, to,  function(val) {

                            if (prev != val) {
                                if (play_sound == true) {
                                    play_tracked_sound("ui_ranked_xp_gain_tick");
                                    play_sound = false;
                                    setTimeout(function() { play_sound = true; }, 5);
                                }
                                prev = val;
                            }
                
                        }],
                        "easing": easing_functions.easeOutQuart,
                        "completion": function() {}
                    });
                }
                */

                let type = rank_screen.dataset.to_type;
                let prev = rank_screen.querySelector(".rank_icon.prev");
                let next = '';
                let next_pos = false;
                if (type == "image") next = rank_screen.querySelector(".rank_icon.next");
                if (type == "video") {
                    next = rank_screen.querySelector(".rank_video.next");
                    next_pos = rank_screen.querySelector(".rank_video_position");
                }
                let prev_name = rank_screen.querySelector(".rank_name.prev");
                let next_name = rank_screen.querySelector(".rank_name.next");
                anim_hide(prev, 900);
                anim_hide(prev_name, 900);
                setTimeout(function() {
                    if (type == "image") anim_show(next, 900);
                    if (type == "video") {
                        if (global_view_active) next.play();
                        if (next_pos) setTimeout(function() { anim_show(next_pos, 500); },1500);
                    }
                    anim_show(next_name, 900);

                    play_tracked_sound(first.sound);
                },200);
            }, 500);
        });
    }

    /*
    if (first.type == "rank-down") {
        current = rank_screen;
        anim_show(rank_screen, 500, "flex", function() {
            setTimeout(function() {

                let time = 1000;

                let win = Number(rank_screen.querySelector(".progress").dataset.win);
                if (win == 1 || first.match_type == 2) {

                    time = 3500;

                    let value = rank_screen.querySelector(".progress_cont .value");
                    let from = Number(value.dataset.from);
                    let to = Number(value.dataset.to);
                    let prev = 0;
                    let play_sound = true;
                    anim_start({
                        "element": value,
                        "duration": 3000,
                        "delay": 0,
                        "number": [from, to,  function(val) {

                            if (prev != val) {
                                if (play_sound == true) {
                                    play_tracked_sound("ui_ranked_xp_gain_tick");
                                    play_sound = false;
                                    setTimeout(function() { play_sound = true; }, 5);
                                }
                                prev = val;
                            }
                
                        }],
                        "easing": easing_functions.easeOutQuart,
                        "completion": function() {}
                    });
                }

                let prev = rank_screen.querySelector(".rank_icon.prev");
                let next = rank_screen.querySelector(".rank_icon.next");
                let prev_name = rank_screen.querySelector(".rank_name.prev");
                let next_name = rank_screen.querySelector(".rank_name.next");
                setTimeout(function() {
                    play_tracked_sound(first.sound);
                    anim_hide(prev, 900);
                    anim_hide(prev_name, 900);
                    setTimeout(function() {
                        anim_show(next, 900);
                        anim_show(next_name, 900);
                    },200);
                }, time);
            }, 700);
        });
    }
    */

    if (first.type == "placement-rank") {
        current = placement_rank_screen;
        anim_show(placement_rank_screen, 500, "flex", function() {

            //let progress = placement_rank_screen.querySelector(".progress");
            let type = placement_rank_screen.dataset.to_type;
            let video_pos = placement_rank_screen.querySelector(".rank_video_position");
            setTimeout(function() {
                // trigger showing the value and icon animations
                if (type == "image") _for_each_with_class_in_parent(placement_rank_screen, 'rank_icon', function(el) { el.classList.add("visible"); });
                if (type == "video") {
                    if (global_view_active) _for_each_with_class_in_parent(placement_rank_screen, 'rank_video', function(el) { el.play(); });
                    if (video_pos) setTimeout(function() { anim_show(video_pos, 500); }, 1500);
                }
                _for_each_with_class_in_parent(placement_rank_screen, 'rank_name', function(el) { el.classList.add("visible"); });
                //progress.classList.add("visible");

                play_tracked_sound(first.sound);
            },700);
        });
    }

    if (current) {
        setTimeout(function() {
            anim_hide(current, 500, function() {            
                if (global_rank_screen_queue.length) {
                    showRankScreen(cb);
                } else {
                    anim_hide(cont, 500);
                    if (typeof cb == "function") cb();
                }
            });
        }, first.time * 1000);
    } else {
        if (typeof cb == "function") cb();
    }
}

