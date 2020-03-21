global_onload_callbacks.push(function(){

    const element = new HUD_element('player_name', "",
    {
        "fontSize": "2",
        "pivot": "center",
        "color": "#ffffff",
        "shadow": "0",
        "teamColor": "1",
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "toggle", "type": "teamColor", "text": "Team Color"},
    ]
    , "#hud_player_name");

    hud_elements.push(element);

});
