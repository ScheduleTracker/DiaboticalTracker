function init_element_score() {

    const hud_elem = new HUD_element('score', //Name
    "", //Edior Text
    { //Dfault values
        "width": "6",
        "height": "4",
        "fontSize": "3",
        "team": "own",
        "sType": "score",
        "shadow": "0",
        "bRadius": "0",
        "cCode": "15",
        "align": "center",
        "sC": "custom",
        "sCCustom": "#ffffff",
        "bgC": "team",
        "bgCCustom": "blue",
        "hide_dead": "1",
    },      
    [       //Editor settings
        {"inputType": "list",   "type": "team", "text": "Team", "listValues":
            [
                {"name": "Own Team", "value": "own"},
                {"name": "Enemy Team", "value": "enemy"},
            ]
        },
        {"inputType": "list",   "type": "sType", "text": "Score Type", "listValues":
            [
                {"name": "Main", "value": "score"},
                {"name": "Rounds", "value": "round"},
            ]
        },
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
        defaultFontSize,
        defaultFontFamily,
        {"inputType": "float", "type": "bRadius", "text": "Icon Corner Radius"},
        {"inputType": "float", "type": "cCode", "text": "Icon Corner Bitmask"},
        {"inputType": "list", "type": "align", "text": "Align", "listValues":
            [
                {"name": "Left", "value": "flex-start"},
                {"name": "Center", "value": "center"},
                {"name": "Right", "value": "flex-end"},
            ]
        },
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "list",   "type": "sC", "text": "Text Color", "listValues":
            [
                {"name": "Custom", "value": "custom"},
                {"name": "Team Color", "value": "team"},
            ]
        },
        {"inputType": "color",  "type": "sCCustom", "text": "Text Color Custom"},
        {"inputType": "list",   "type": "bgC", "text": "Background Color", "listValues":
            [
                {"name": "Custom", "value": "custom"},
                {"name": "Team Color", "value": "team"},
            ]
        },
        {"inputType": "color",  "type": "bgCCustom", "text": "Background Color Custom"},
        {"inputType": "toggle", "type": "hide_dead", "text": "Hide on death"},
    ]
    , "#hud_score");  //Template Name
    hud_elements.push(hud_elem);
}