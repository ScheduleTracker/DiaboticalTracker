
function init_hud_screen_aim_report() {    
    bind_event('set_aim_report', set_aim_report);
}

function set_aim_report(kills, accuracy, reaction_time) {
    let aim_report = _id("aim_report");
    let cont = _id("aim_report_content");
    _empty(cont);

    let stats = ["acc", "score", "time"];
    for (let stat of stats) {
        let stat_cont = _createElement("div", "stat_cont");
        stat_cont.classList.add(stat);

        stat_cont.appendChild(_createElement("div", "bg"));
        stat_cont.appendChild(_createElement("div", "icon"));

        let stat_val = _createElement("div", "stat");
        stat_cont.appendChild(stat_val);

        let stat_label = _createElement("div", "label");
        stat_cont.appendChild(stat_label);

        if (stat == "acc") {
            stat_val.textContent = _clean_float((accuracy * 100), 2) + "%";
            stat_label.textContent = localize("aim_report_accuracy");
        }
        if (stat == "score") {
            stat_val.textContent = kills;
            stat_label.textContent = localize("aim_report_final_score");
        }
        if (stat == "time") {
            stat_val.textContent = Math.floor(reaction_time * 1000) + "ms";
            stat_label.textContent = localize("aim_report_reaction_time");
        }

        cont.appendChild(stat_cont);
    }

    anim_show(aim_report);
}

function on_aim_report_restart() {
    // Restart aim map call
    engine.call("aim_report_restart");
    _id("aim_report").style.display = "none";
}

function on_aim_report_leave() {
    button_game_over_quit();
    anim_hide(_id("aim_report"));
}
