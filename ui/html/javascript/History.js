class MenuHistory {
    constructor() {
        // Initialize the history array with the default entry for the home screen
        this.history = [{
            "page": "home_screen",
        }];
        this.current_index = 0;
    }

    push(obj) {
        if (!("page" in obj)) return;

        // This part here is smth that doesn't seem to work (or is not intended) in the History Interface and is why i'm not using it
        if (this.current_index != (this.history.length - 1)) {
            this.history.length = this.current_index + 1;
        }

        this.history.push(obj);
        this.current_index = this.history.length - 1;
    }

    back() {
        if (this.current_index == 0) return null;

        this.current_index--;

        return this.history[this.current_index];
    }

    forward() {
        if (this.current_index == (this.history.length - 1)) return null;

        this.current_index++;

        return this.history[this.current_index];
    }

    current() {
        return this.history[this.current_index];
    }

}

var global_history = new MenuHistory();
var global_popstate = false;

function historyPushState(obj) {
    if (global_popstate) {
        global_popstate = false;
    } else {
        global_history.push(obj);
    }
}

function historyBack() {
    let obj = global_history.back();
    if (obj == null) return;

    historyOnPopState(obj);
}

function historyForward() {
    let obj = global_history.forward();
    if (obj == null) return;

    historyOnPopState(obj);
}

function historyOnPopState(obj) {
    if (obj == null) return;
    if (!("page" in obj)) return;

    global_popstate = true;

    if (obj.page == "player_profile_screen")          open_player_profile(obj.id, obj.subpage);
    else if (obj.page == "match_screen")              open_match(obj.id);
    else if (obj.page == "home_screen")               open_home();
    else if (obj.page == "settings_screen")           open_settings();
    else if (obj.page == "practice_screen")           open_practice();
    else if (obj.page == "create_screen")             open_create();
    else if (obj.page == "leaderboards_screen")       open_leaderboards();
    else if (obj.page == "shop_screen")               open_shop();
    else if (obj.page == "shop_item_screen")          open_shop_item(obj.item_group_data, obj.item_index);
    else if (obj.page == "coin_shop_screen")          open_coin_shop();
    else if (obj.page == "battlepass_screen")         open_battlepass();
    //else if (obj.page == "battlepass_list_screen")    open_battlepass_list();
    else if (obj.page == "battlepass_upgrade_screen") open_battlepass_upgrade();
    else if (obj.page == "play_screen")               open_play(obj.subpage);
    else if (obj.page == "customize_screen")          open_customization(obj.category, obj.type);
    else if (obj.page == "watch_screen")              open_watch();
    else if (obj.page == "learn_screen")              open_learn();
    else if (obj.page == "aim_screen")                open_aim();
    else if (obj.page == "play_screen_combined")      open_play_combined();

    global_popstate = false;
}