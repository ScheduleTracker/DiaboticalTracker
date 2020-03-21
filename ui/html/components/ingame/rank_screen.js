
let global_rank_screen_queue = [];

function renderRankScreen(data) {
    console.log("renderRankScreen", _dump(data));

    _id("rank_screen").querySelector(".placement_progression").style.display = "none";
    _id("rank_screen").querySelector(".rank_progression").style.display = "none";

    global_rank_screen_queue = [];

    if ("placement_match" in data && Number(data.placement_match) == 1 && data.to.placement_matches && data.to.placement_matches.length) {
        // Show placement matches screen
        renderPlacementMatches(data);

        global_rank_screen_queue.push({
            "type": "placement",
            "time": (data.to.placement_matches.length * 0.55) + 3
        });

        if (data.to.placement_matches.length == Number(data.placement_matches)) {
            renderPlacementRank(data);

            global_rank_screen_queue.push({
                "type": "placement-rank",
                "time": 5
            });
        }
    } else {
        renderRankUpdate(data);

        let type = "rank";
        let time = 5.5;
        if (data.from.rank_tier != null) {
            if (data.from.rank_tier < data.to.rank_tier) {
                type = "rank-up";
                time = 7;
            }
            if (data.from.rank_tier > data.to.rank_tier) {
                type = "rank-down";
                time = 7;
            }
            if (data.from.rank_position != null && data.to.rank_position != null) {
                if (data.from.rank_position > data.to.rank_position) {
                    type = "rank-up";
                    time = 7;
                }
                if (data.from.rank_position < data.to.rank_position) {
                    type = "rank-down";
                    time = 7;
                }
            }
            if (data.from.rank_position == null && data.to.rank_position != null) {
                type = "rank-up";
                time = 7;
            }
            if (data.from.rank_position != null && data.to.rank_position == null) {
                type = "rank-down";
                time = 7;
            }
        }

        global_rank_screen_queue.push({
            "type": type,
            "time": time
        });
    }
}

function renderPlacementMatches(data) {
    // title
    // placement matches list
    // some desc text maybe

    let match_count = 10;
    if ("placement_matches" in data) match_count = Number(data.placement_matches);

    let fragment = new DocumentFragment();
    fragment.appendChild(_createElement("div", "title", localize("placement_matches")));

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
                engine.call('ui_sound', "ui_match_found_tick");
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

    fragment.appendChild(match_list);

    let cont = _id("rank_screen").querySelector(".placement_progression");
    _empty(cont);

    cont.appendChild(fragment);
}


function renderPlacementRank(data) {
    let fragment = new DocumentFragment();

    let title = _createElement("div", "title", localize("placement_matches_completed"));
    fragment.appendChild(title);

    let rank_icon_cont = _createElement("div", "rank_icon_cont");

    let team_size = 1;
    if (data.mode in global_queue_modes) team_size = global_queue_modes[data.mode].team_size;

    let rank = renderRankIcon(data.to.rank_tier, data.to.rank_position, team_size);
    rank_icon_cont.appendChild(rank);
    /*
    let rank_icon = _createElement("video", "rank_video");
    rank_icon.src = "/html/images/...webm";
    rank_icon_cont.appendChild(rank_icon);
    */
    fragment.appendChild(rank_icon_cont);

    let rank_name_cont = _createElement("div", "rank_name_cont");
    let rank_name = _createElement("div", "rank_name", getRankName(data.to.rank_tier, data.to.rank_position));
    rank_name_cont.appendChild(rank_name);
    fragment.appendChild(rank_name_cont);

    /*
    let progress_cont = _createElement("div", "progress_cont");
    
    let progress = _createElement("div", "progress");
    let value = _createElement("div", "value");
    value.textContent = Math.floor(data.to.rating);
    let unit = _createElement("div", "unit");
    if (data.match_type == 2) {
        // Competitive
        unit.textContent = "SR";
    } else if (data.match_type == 3) {
        // Quickplay
        unit.textContent = "Points";
    }
    progress.appendChild(value);
    progress.appendChild(unit);
    progress_cont.appendChild(progress);
    fragment.appendChild(progress_cont);
    */

    let cont = _id("rank_screen").querySelector(".placement_rank");
    _empty(cont);

    cont.appendChild(fragment);
}


function renderRankUpdate(data) {
    let fragment = new DocumentFragment();

    let rank_icon_cont = _createElement("div", "rank_icon_cont");

    let team_size = 1;
    if (data.mode in global_queue_modes) team_size = global_queue_modes[data.mode].team_size;

    let prev_rank = renderRankIcon(data.from.rank_tier, data.from.rank_position, team_size);
    prev_rank.classList.add("prev");
    rank_icon_cont.appendChild(prev_rank);
    let next_rank = renderRankIcon(data.to.rank_tier, data.to.rank_position, team_size);
    next_rank.classList.add("next");
    rank_icon_cont.appendChild(next_rank);
/*    
    let rank_icon = _createElement("video", "rank_video");
    rank_icon.src = "/html/images/....webm";
    rank_icon_cont.appendChild(rank_icon);
*/    
    fragment.appendChild(rank_icon_cont);


    let rank_name_cont = _createElement("div", "rank_name_cont");
    let prev_rank_name = _createElement("div", "rank_name", getRankName(data.from.rank_tier, data.from.rank_position));
    prev_rank_name.classList.add("prev");
    rank_name_cont.appendChild(prev_rank_name);
    let next_rank_name = _createElement("div", "rank_name", getRankName(data.to.rank_tier, data.to.rank_position));
    next_rank_name.classList.add("next");
    rank_name_cont.appendChild(next_rank_name);
    fragment.appendChild(rank_name_cont);


    let progress_cont = _createElement("div", "progress_cont");
    let progress = _createElement("div", "progress");
    let change_icon = _createElement("div", "icon");
    let prefix = _createElement("div", "prefix");
    let win = 1;
    if (data.from.rating > data.to.rating) {
        win = 0;
        prefix.textContent = "-";
        change_icon.style.backgroundImage = "url(/html/ranks/200x200/weeball_loser.png)";
    } else {
        win = 1;
        prefix.textContent = "+";
        change_icon.style.backgroundImage = "url(/html/ranks/200x200/weeball_winner.png)";
    }

    let value = _createElement("div", "value");
    progress.dataset.win = win;
    value.dataset.from = 0;
    value.dataset.to = Math.floor(Math.abs(data.to.rating - data.from.rating));
    value.textContent = 0;
    
    /*
    value.dataset.from = Math.floor(data.to.rating);
    value.dataset.to = Math.floor(data.to.rating);
    value.textContent = Math.floor(data.from.rating);
    */
    let unit = _createElement("div", "unit");
    if (data.match_type == 2) {
        // Competitive
        unit.textContent = "SR";
    } else if (data.match_type == 3) {
        // Quickplay
        unit.textContent = "Points";
    }
    progress.appendChild(change_icon);
    if (win == 1) {
        progress.appendChild(prefix);
        progress.appendChild(value);
        progress.appendChild(unit);
    }
    progress_cont.appendChild(progress);
    fragment.appendChild(progress_cont);

    let cont = _id("rank_screen").querySelector(".rank_progression");
    _empty(cont);

    cont.appendChild(fragment);
}

function showRankScreen(cb, initial) {
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

    if (first.type == "rank") {
        current = rank_screen;
        anim_show(rank_screen, 500, "flex", function() {
            setTimeout(function() {
                let win = Number(rank_screen.querySelector(".progress").dataset.win);
                if (win == 1) {
                    let value = rank_screen.querySelector(".progress_cont .value");
                    let from = value.dataset.from;
                    let to = value.dataset.to;
                    anim_start({
                        "element": value,
                        "duration": 3000,
                        "delay": 0,
                        "number": [from, to],
                        "easing": easing_functions.easeOutQuart,
                        "completion": function() {}
                    });
                }
            }, 700);
        });
    }

    if (first.type == "rank-up") {
        current = rank_screen;
        anim_show(rank_screen, 500, "flex", function() {
            setTimeout(function() {
                let win = Number(rank_screen.querySelector(".progress").dataset.win);
                if (win == 1) {
                    let value = rank_screen.querySelector(".progress_cont .value");
                    let from = value.dataset.from;
                    let to = value.dataset.to;
                    anim_start({
                        "element": value,
                        "duration": 3000,
                        "delay": 0,
                        "number": [from, to],
                        "easing": easing_functions.easeOutQuart,
                        "completion": function() {}
                    });
                }

                let prev = rank_screen.querySelector(".rank_icon.prev");
                let next = rank_screen.querySelector(".rank_icon.next");
                let prev_name = rank_screen.querySelector(".rank_name.prev");
                let next_name = rank_screen.querySelector(".rank_name.next");
                setTimeout(function() {
                    anim_hide(prev, 900);
                    anim_hide(prev_name, 900);
                    setTimeout(function() {
                        anim_show(next, 900);
                        anim_show(next_name, 900);

                        engine.call('ui_sound', "ui_ranked_rank_up");
                    },200);
                },3500);
            }, 700);
        });
    }

    if (first.type == "rank-down") {
        current = rank_screen;
        anim_show(rank_screen, 500, "flex", function() {
            setTimeout(function() {
                let win = Number(rank_screen.querySelector(".progress").dataset.win);
                if (win == 1) {
                    /*
                    let value = rank_screen.querySelector(".progress_cont .value");
                    let from = Number(value.dataset.from);
                    let to = Number(value.dataset.to);
                    
                    anim_start({
                        "element": value,
                        "duration": 3000,
                        "delay": 0,
                        "number": [from, to],
                        "easing": easing_functions.easeOutQuart,
                        "completion": function() {}
                    });
                    */
                }

                let prev = rank_screen.querySelector(".rank_icon.prev");
                let next = rank_screen.querySelector(".rank_icon.next");
                let prev_name = rank_screen.querySelector(".rank_name.prev");
                let next_name = rank_screen.querySelector(".rank_name.next");
                setTimeout(function() {
                    anim_hide(prev, 900);
                    anim_hide(prev_name, 900);
                    setTimeout(function() {
                        anim_show(next, 900);
                        anim_show(next_name, 900);
                    },400);
                },3500);
            }, 700);
        });
    }

    if (first.type == "placement-rank") {
        current = placement_rank_screen;
        anim_show(placement_rank_screen, 500, "flex", function() {
            setTimeout(function() {
                // trigger showing the value and icon animations
                _for_each_with_class_in_parent(placement_rank_screen, 'rank_icon', function(el) { el.classList.add("visible"); });
                _for_each_with_class_in_parent(placement_rank_screen, 'rank_name', function(el) { el.classList.add("visible"); });
                _for_each_with_class_in_parent(placement_rank_screen, 'progress', function(el) { el.classList.add("visible"); });
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

