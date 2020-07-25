function init_element_score() {

    const hud_elem = new HUD_element('score', true,
    { //Dfault values
        "pivot": "top-left",
        "width": "8",
        "height": "5",
        "fontSize": "3",
        "font": "montserrat-bold",
        "team": "own",
        "sType": "score",
        "shadow": "0",
        "bRadius": "0",
        //"cCode": "15",
        "align": "center",
        "sC": "custom",
        "sCCustom": "#ffffff",
        "bgC": "team",
        "bgCCustom": "blue",
        "hide_dead": "0",
        "rS": "1",
        "fS": "1",
        "mS": "1",
    },      
    [       //Editor settings
        {"inputType": "list",   "type": "team", "text": "Team", "listValues":
            [
                {"name": "Own Team", "value": "own"},
                {"name": "Enemy Team", "value": "enemy"},
            ]
        },
        {"inputType": "list",   "type": "sType", "text": "Main Score Type", "listValues":
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
        //{"inputType": "float", "type": "cCode", "text": "Icon Corner Bitmask"},
        {"inputType": "list", "type": "align", "text": "Align", "listValues":
            [
                {"name": "Left", "value": "flex-start"},
                {"name": "Center", "value": "center"},
                {"name": "Right", "value": "flex-end"},
            ]
        },
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "list",   "type": "bgC", "text": "Background Color", "listValues":
            [
                {"name": "Custom", "value": "custom"},
                {"name": "Team Color", "value": "team"},
            ]
        },
        {"inputType": "color",  "type": "bgCCustom", "text": "Background Color Custom"},
        {"inputType": "toggle", "type": "hide_dead", "text": "Hide on death"},
        {"inputType": "list",   "type": "direction", "text": "Order", "listValues":
            [
                {"name": "Normal", "value": "horizontal"},
                {"name": "Reverse", "value": "horizontal reverse"},
            ]
        },
        {"inputType": "toggle", "type": "rS", "text": "Show Round Score below"},
        {"inputType": "toggle", "type": "fS", "text": "Show CTF Flag State"},
        {"inputType": "toggle", "type": "mS", "text": "Show MacGuffin State"},
    ]
    , "#hud_score");  //Template Name
    hud_elements.push(hud_elem);
}