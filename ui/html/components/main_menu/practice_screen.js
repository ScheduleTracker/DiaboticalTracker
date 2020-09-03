function init_screen_practice() {
    renderPracticeCards();
}

function practice_start_match(type) {
    if (type == "practice_range") {
        engine.call("load_practice_range");
    }
    if (type == "tutorial") {
        home_screen_update_tutorial_played();
        engine.call("load_tutorial");
    }
}

function renderPracticeCards() {
    let screen = _id("practice_screen");
    let container = screen.querySelector(".play_cards_container");

    let cards = [
        /*
        {
            "type": "tutorial",
            "title": "game_mode_tutorial",
            "background": "rocket",
            "on_click": function() { practice_start_match('tutorial'); },
            "on_click_spinner": true,
            "hover_button": "play",
            //"tooltip": "practice",
            "state": 2,
        },
        */
        {
            "type": "practice",
            "title": "game_mode_practice_range",
            "background": "practice",
            "on_click": function() { practice_start_match('practice_range'); },
            "on_click_spinner": true,
            "hover_button": "play",
            //"tooltip": "practice",
            "state": 2,
        },
        {
            "type": "aim",
            "title": "aim_trainer",
            "background": "aim",
            "on_click": function() { open_aim(); },
            "hover_button": "open",
            //"tooltip": "practice",
            "state": 2,
        },
        /* Commented because it it was hidden before
        {
            "type": "licensecenter",
            "title": "game_mode_license_center",
            "background": "BRAWL",
            "on_click": function() { open_license_center(); },
            //"hover_button": "play",
            //"tooltip": "licensecenter",
            "state": 1,
        },
        */
    ];

    for (let card of cards) {
        container.appendChild(renderPlayCard(card));
    }

    _for_each_with_class_in_parent(container, 'tooltip2', function(el) {
        add_tooltip2_listeners(el);
    });
}

function practice_screen_reset_cards() {
    _for_each_with_class_in_parent(_id("practice_screen"), "card_flex", function(card) {
        let video = play_card_lookup[card.dataset.card_idx];
        if (video) {
            let is_playing = video.isPlaying();
            video.reset();
            if (is_playing) video.play();
        }
    });
}