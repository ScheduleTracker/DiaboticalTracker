function init_element_team_scores() {


    const hud_elem = new HUD_element('my_team_score', //Name
    "",     //Editor Text
    {      //Default values
        "sWidth": "7",
        "nWidth": "20",
        "height": "5", 
        "align": "center",
        "font": "montserrat-bold",
        "fontSize": "2.4",
        "reverse": "1",
        "players": "1",
        "name_bg_opacity": "BF",
        "sFont": "montserrat-bold",
        "sFontSize": "2.6",
        "sS": "1",
        "stockIcon": "0",
        "tName": "0",
    },
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float", "type": "sWidth", "text": "Score Width"},
        {"inputType": "float", "type": "nWidth", "text": "Name Width"},
        defaultHeight,
        defaultFontFamily,
        defaultFontSize,
        defaultAlign,
        {"inputType": "list", "type": "sFont", "text": "Score Font", "listValues": defaultFontList},
        {"inputType": "float", "type": "sFontSize", "text": "Score Text Size"},
        {"inputType": "toggle", "type": "reverse", "text": "Reverse Order"},
        {"inputType": "toggle", "type": "players", "text": "Show Player(s)"},
        {"inputType": "toggle", "type": "tName", "text": "Show Team Name"},
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
        {"inputType": "toggle", "type": "sS", "text": "Score Shadow"},
        {"inputType": "toggle", "type": "showStocks", "text": "Show Player Stocks"},
        {"inputType": "list",   "type": "stockIcon", "text": "Player Stock Icon", 
            "listValues": [
                {"name": "Hearts", "value": "0"},
                {"name": "Wrench", "value": "1"},
            ]
        },
    ]
    , "#hud_my_team_score");  //Template Name
    hud_elements.push(hud_elem);

    const hud_elem2 = new HUD_element('enemy_team_score', //Name
    "",     //Editor Text
    {       //Default values
        "sWidth": "7",
        "nWidth": "20",
        "height": "5", 
        "align": "center", 
        "font": "montserrat-bold",
        "fontSize": "2.4",
        "reverse": "0",
        "players": "1",
        "name_bg_opacity": "BF",
        "sFont": "montserrat-bold",
        "sFontSize": "2.6",
        "sS": "1",
        "stockIcon": "0",
        "tName": "0",
    },
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float", "type": "sWidth", "text": "Score Width"},
        {"inputType": "float", "type": "nWidth", "text": "Name Width"},
        defaultHeight,
        defaultFontFamily,
        defaultFontSize,
        defaultAlign,
        {"inputType": "list", "type": "sFont", "text": "Score Font", "listValues": defaultFontList},
        {"inputType": "float", "type": "sFontSize", "text": "Score Text Size"},
        {"inputType": "toggle", "type": "reverse", "text": "Reverse Order"},
        {"inputType": "toggle", "type": "players", "text": "Show Player(s)"},
        {"inputType": "toggle", "type": "tName", "text": "Show Team Name"},
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
        {"inputType": "toggle", "type": "sS", "text": "Score Shadow"},
        {"inputType": "toggle", "type": "showStocks", "text": "Show Player Stocks"},
        {"inputType": "list",   "type": "stockIcon", "text": "Player Stock Icon", 
            "listValues": [
                {"name": "Hearts", "value": "0"},
                {"name": "Wrench", "value": "1"},
            ]
        },
    ]
    , "#hud_enemy_team_score");  //Template Name
    hud_elements.push(hud_elem2);
    
    
}