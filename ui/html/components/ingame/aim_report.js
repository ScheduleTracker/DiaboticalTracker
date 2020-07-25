
function init_hud_screen_aim_report() {
    
    let aim_report = _id("aim_report");
    let el_score = _id("aim_report_score");
    let el_acc = _id("aim_report_acc");
    let el_time = _id("aim_report_time");
    
    bind_event('set_aim_report', function(kills, accuracy, reaction_time) {
        el_score.textContent = kills;
        el_acc.textContent = _clean_float((accuracy * 100), 2) + "%";
        el_time.textContent = Math.floor(reaction_time * 1000) + "ms";

        anim_show(aim_report);
    });
}

function on_aim_report_restart() {
    // Restart aim map call
    //engine.call("");
    anim_hide(_id("aim_report"));
}

function on_aim_report_leave() {
    button_game_over_quit();
    anim_hide(_id("aim_report"));
}
