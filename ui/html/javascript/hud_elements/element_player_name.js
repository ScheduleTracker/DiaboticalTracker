function init_element_player_name() {

    const element = new HUD_element('player_name', "",
    {
        "fontSize": "2",
        "pivot": "center",
        "color": "#ffffff",
        "shadow": "0",
        "teamColor": "1",
        "pre": "1",
        "vis": "s",
        "uc": "0",
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "toggle", "type": "teamColor", "text": "Team Color Name"},
        {"inputType": "toggle", "type": "pre", "text": "Show Following Text"},
        {"inputType": "toggle", "type": "uc", "text": "Force Uppercase"},
        {"inputType": "list", "type": "vis", "text": "Visibility", "listValues":
            [
                {"name": "All", "value": "a"},
                {"name": "Playing", "value": "p"},
                {"name": "Spectating", "value": "s"},
            ]
        },
    ]
    , "#hud_player_name");

    hud_elements.push(element);

}
