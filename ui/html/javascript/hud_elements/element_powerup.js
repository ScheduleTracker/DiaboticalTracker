function init_element_powerup() {

    var hud_elem = new HUD_element('powerup', true,
    {//Default values
        "fontSize": "2",
        "font": "montserrat-bold",
        "iSize": "6",
        "mC": "#ffffff",
        "bRadius": "50",
        //"cCode": "15",
        "bWidth": 0.2,
        "iShadow": "0",
        "iC": "custom",
        "iCCustom": "#ffffff",
        "bgC": "#24232188",
        "style": "default",
        "cP": "3",
    },      
        
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontFamily,
        defaultFontSize,
        {"inputType": "float", "type": "iSize", "text": "Icon Size"},
        {"inputType": "color", "type": "mC", "text": "Main Color"},
        {"inputType": "float", "type": "bRadius", "text": "Icon Corner Radius"},
        //{"inputType": "float", "type": "cCode", "text": "Icon Corner Bitmask"},
        {"inputType": "float", "type": "bWidth", "text": "Border Width" },
        {"inputType": "toggle","type": "iShadow", "text": "Icon Shadow"},
        {"inputType": "list",  "type": "iC", "text": "Icon Color", "listValues":
            [
                {"name": "Powerup", "value": "powerup"},
                {"name": "Custom", "value": "custom"},
            ]
        }, 
        {"inputType": "color", "type": "iCCustom", "text": "Icon Color Custom"},
        {"inputType": "color", "type": "bgC", "text": "Background Color"},
        {"inputType": "list",  "type": "style", "text": "Extra Styling", "listValues":
            [
                {"name": "None", "value": "none"},
                {"name": "Default", "value": "default"},
            ]
        },
        {"inputType": "list",  "type": "cP", "text": "Countdown Position", "listValues":
            [
                {"name": "Center", "value": "0"},
                {"name": "Top", "value": "1"},
                {"name": "Right", "value": "2"},
                {"name": "Bottom", "value": "3"},
                {"name": "Left", "value": "4"}
            ]
        }, 
    ]
    , "#hud_powerup");  //Template Name

    hud_elements.push(hud_elem);
    
}