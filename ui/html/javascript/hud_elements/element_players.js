function init_element_players() {


    const hud_elem = new HUD_element('own_players', true,
    {      //Default values
        "pivot": "top-right",
        "nWidth": "20",
        "height": "5", 
        "align": "center",
        "font": "montserrat-bold",
        "fontSize": "2.4",
        "direction": "horizontal",
        "name_bg_opacity": "BF",
        "stockIcon": "0",
        "sL": "1"
    },
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float", "type": "nWidth", "text": "Name Width"},
        defaultHeight,
        defaultFontFamily,
        defaultFontSize,
        defaultAlign,
        {"inputType": "list",   "type": "direction", "text": "Order", "listValues":
            [
                {"name": "Normal", "value": "horizontal"},
                {"name": "Reverse", "value": "horizontal reverse"},
            ]
        },
        {"inputType": "list",   "type": "name_bg_opacity", "text": "Name Background Opacity", 
            "listValues": [
                {"name": "Transparent", "value": "00"},
                {"name": "25%", "value": "33"},
                {"name": "33%", "value": "55"},
                {"name": "50%", "value": "7F"},
                {"name": "75%", "value": "BF"},
                {"name": "Full color", "value": "FF"},
            ]
        },
        {"inputType": "toggle", "type": "sL", "text": "Show Player Lives"},
    ]
    , "#hud_players");  //Template Name
    hud_elements.push(hud_elem);

    const hud_elem2 = new HUD_element('enemy_players', true,
    {      //Default values
        "pivot": "top-left",
        "nWidth": "20",
        "height": "5", 
        "align": "center",
        "font": "montserrat-bold",
        "fontSize": "2.4",
        "direction": "horizontal reverse",
        "name_bg_opacity": "BF",
        "stockIcon": "0",
        "sL": "1"
    },
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float", "type": "nWidth", "text": "Name Width"},
        defaultHeight,
        defaultFontFamily,
        defaultFontSize,
        defaultAlign,
        {"inputType": "list",   "type": "direction", "text": "Order", "listValues":
            [
                {"name": "Normal", "value": "horizontal"},
                {"name": "Reverse", "value": "horizontal reverse"},
            ]
        },
        {"inputType": "list",   "type": "name_bg_opacity", "text": "Name Background Opacity", 
            "listValues": [
                {"name": "Transparent", "value": "00"},
                {"name": "25%", "value": "33"},
                {"name": "33%", "value": "55"},
                {"name": "50%", "value": "7F"},
                {"name": "75%", "value": "BF"},
                {"name": "Full color", "value": "FF"},
            ]
        },
        {"inputType": "toggle", "type": "sL", "text": "Show Player Lives"},
    ]
    , "#hud_players");  //Template Name
    hud_elements.push(hud_elem2);

}