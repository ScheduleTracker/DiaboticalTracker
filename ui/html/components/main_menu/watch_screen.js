let watch_screen_load_ts = null;
function init_watch_screen() {
    load_watch_screen();
}

function load_watch_screen() {

    if (watch_screen_load_ts == null || ((Date.now() - watch_screen_load_ts) > (60 * 1000))) {
        watch_screen_load_ts = Date.now();

        let list_cont = _id("twitch_reward_streams_list");
        _empty(list_cont);

        api_request("GET", "/twitch/streamers", {}, function(streams) {
            list_cont.appendChild(render_twitch_reward_stream_list(streams));

            refreshScrollbar(_id("twitch_reward_streams").querySelector(".scroll-outer"));
        });
    } else {
        refreshScrollbar(_id("twitch_reward_streams").querySelector(".scroll-outer"));
    }
}

function render_twitch_reward_stream_list(streams) {
    let fragment = new DocumentFragment();

    if (!streams || Object.keys(streams).length === 0) {
        fragment.appendChild(_createElement("div", "no_streams", localize("twitch_no_streams_live")));
        return fragment;
    }

    for (let twitch_id of Object.keys(streams)) {
        const s = streams[twitch_id];

        let stream = _createElement("div", "stream");
        fragment.appendChild(stream);

        let reward = _createElement("div", "reward");
        stream.appendChild(reward);


        let item = _createElement("div", ["customization_item", "rarity_bg_"+s.rarity]);
        reward.appendChild(item);

        let img = renderCustomizationInner("watch", s.customization_type, s.customization_id, s.amount);
        item.appendChild(img);

        item.dataset.msgHtmlId = "customization_item";
        item.dataset.id = s.customization_id;
        item.dataset.type = s.customization_type;
        item.dataset.rarity = s.rarity;
        add_tooltip2_listeners(item);
        
        let content = _createElement("div", "content");
        stream.appendChild(content);
        content.appendChild(_createElement("div", "name", s.user_name));
        content.appendChild(_createElement("div", "viewers", s.viewer_count));

        let buttons = _createElement("div", "buttons");
        stream.appendChild(buttons);
        let watch = _createElement("div", ["db-btn", "twitch"], localize("watch"));
        _addButtonSounds(watch, 1);
        buttons.appendChild(watch);

        watch.addEventListener("click", function() {
            engine.call("open_browser", "https://twitch.tv/" + s.user_name);
        });

    }

    for (let i=0; i<(Object.keys(streams).length % 3); i++) {
        fragment.appendChild(_createElement("div", "spacer"));
    }


    return fragment;
}

function update_twitch_list_link_state(linked) {
    let cont = _id("twitch_list_account_link");

    _empty(cont);

    let buttons = _createElement("div", "buttons");

    if (!linked) {
        let btn_link = _createElement("div", ["db-btn", "plain"], localize("settings_connections_twitch_link"));
        btn_link.addEventListener("click", function() {
            settingsTwitchAccount(false);
        });
        _addButtonSounds(btn_link, 1);
        buttons.appendChild(btn_link);
    }

    let btn_learn = _createElement("div", ["db-btn", "plain"], localize("learn_more"));
    btn_learn.addEventListener("click", function() {
        engine.call("open_browser", "https://www.diabotical.com/faq_twitch");
    });
    _addButtonSounds(btn_learn, 1);
    buttons.appendChild(btn_learn);

    let desc = _createElement("div", "desc");
    if (!linked) {
        desc.textContent = localize("twitch_desc_link_watch");
    } else {
        desc.textContent = localize("twitch_desc_watch");
    }

    cont.appendChild(buttons);
    cont.appendChild(desc);
}
