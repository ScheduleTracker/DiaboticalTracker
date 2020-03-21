global_onload_callbacks_hud.push(function() {

});

function join_menu_visible(visible) {
    if (visible) {
        engine.call("hud_mouse_control", true);
        console.log("hud_mouse_control TRUE");
        anim_show(_id("join_menu"));

    } else {
        engine.call("hud_mouse_control", false);
        console.log("hud_mouse_control false #3");
        anim_hide(_id("join_menu"));
        anim_show(_id("game_hud"));
    }
}

function join_menu_join_team(team_id) {
    engine.call("join_team", team_id);
    join_menu_visible(false);
}

function join_menu_join_match() {
    let team_id = get_fairest_team_id(game_data);
    
    engine.call("join_team", team_id);
    join_menu_visible(false);
}
function join_menu_join_spectate() {
    engine.call("join_team", -1);
    join_menu_visible(false);
}