function init_element_stat() {

    const hud_elem = new HUD_element('stat', true,
    {
        "font": "roboto-bold",
        "fontSize": "2",
        "pivot": "right-edge",
        "color": "#ffffff",
        "stat": "dmg",
        "shadow": "1",
        "hide_dead": "1",
    },
    [ 
    	defaultPivot,
        {"inputType": "list", "type": "stat", "text": "Stat", "listValues":
            [
                {"name": "Total damage done", "value": "dmg"},
                {"name": "Total health collected", "value": "hp"},
                {"name": "Total armor collected", "value": "armor"},
            ]
        },    
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "toggle", "type": "hide_dead", "text": "Hide on death"},
    ]
    , "");

    hud_elements.push(hud_elem);

}