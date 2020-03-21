global_onload_callbacks.push(function(){

    const hud_elem = new HUD_element('flag', //Name
    "", //Edior Text
    { //Dfault values
        "fontSize": "3",
        "team": "own",
        "size": "5",
        "bRadius": "0",
        "cCode": "15",
        "iC": "default",
        "iCCustom": "#ffffff",
        "bgC": "custom",
        "bgCCustom": "#0000004d",
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
        {"inputType": "float", "type": "cCode", "text": "Icon Corner Bitmask"},
        {"inputType": "list",  "type": "iC", "text": "Icon Color", "listValues":
            [
                {"name": "Default", "value": "default"},
                {"name": "Custom", "value": "custom"},
            ]
        },
        {"inputType": "color", "type": "iCCustom", "text": "Icon Color Custom"},
        {"inputType": "list",  "type": "bgC", "text": "Background Color", "listValues":
            [
                {"name": "Team Color", "value": "team"},
                {"name": "Custom", "value": "custom"},
            ]
        },
        {"inputType": "color", "type": "bgCCustom", "text": "Background Color Custom"},
        {"inputType": "toggle", "type": "hide_dead", "text": "Hide on death"},
    ]
    , "#hud_flag");  //Template Name
    hud_elements.push(hud_elem);
});