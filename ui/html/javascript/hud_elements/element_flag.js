function init_element_flag() {

    const hud_elem = new HUD_element('flag', true,
    { //Dfault values
        "fontSize": "3",
        "team": "own",
        "size": "5",
        "bRadius": "0.6",
        //"cCode": "15",
        "bgC": "#00000086",
        "hide_dead": "1",
    },      
    [       //Editor settings
        {"inputType": "list",   "type": "team", "text": "Team", "listValues":
            [
                {"name": "Own Team", "value": "own"},
                {"name": "Enemy Team", "value": "enemy"},
            ]
        },
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float", "type": "size", "text": "Size"},
        {"inputType": "float", "type": "bRadius", "text": "Icon Corner Radius"},
        //{"inputType": "float", "type": "cCode", "text": "Icon Corner Bitmask"},
        {"inputType": "color", "type": "bgC", "text": "Background Color"},
        {"inputType": "toggle", "type": "hide_dead", "text": "Hide on death"},
    ]
    , "#hud_flag");  //Template Name
    hud_elements.push(hud_elem);
}