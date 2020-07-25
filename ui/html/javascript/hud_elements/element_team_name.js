function init_element_team_name() {

    const hud_elem = new HUD_element('team_name', true,
    { //Dfault values
        "pivot": "top-left",
        "fontSize": "3",
        "font": "montserrat-bold",
        "team": "own",
        "shadow": "0",
    },      
    [       //Editor settings
        {"inputType": "list", "type": "team", "text": "Team", "listValues":
            [
                {"name": "Own Team", "value": "own"},
                {"name": "Enemy Team", "value": "enemy"},
            ]
        },
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
    ]
    , "");  //Template Name
    hud_elements.push(hud_elem);
}