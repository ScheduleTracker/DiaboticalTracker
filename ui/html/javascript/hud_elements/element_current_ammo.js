function init_element_current_ammo() {

    const element = new HUD_element('current_ammo', //Editor name
    "", //Default content
    {
        "fontSize": "5",
        "align": "center",
        "font": "furore",
        "aC": "custom",
        "aCCustom": "#FFFFFF",
        "threshold": "0.16",
        "lowAC": "custom",
        "lowACCustom": "#FF0000",
        "shadow": "1",
        "advanced": "",
    },
    [   //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        {"inputType": "list",   "type": "aC", "text": "Ammo Color", "listValues":
        [
            {"name": "Custom", "value": "custom"},
            {"name": "Weapon Color", "value": "weapon"},
        ]
        },
        {"inputType": "color", "type": "aCCustom", "text": "Ammo Color Custom"},  
        {"inputType": "float", "type": "threshold", "text": "Low Ammo Multiplier"},
        {"inputType": "list",   "type": "lowAC", "text": "Low Ammo Color", "listValues":
        [
            {"name": "Custom", "value": "custom"},
            {"name": "Weapon Color", "value": "weapon"},
        ]
        },
        {"inputType": "color", "type": "lowACCustom", "text": "Low Ammo Color Custom"},    
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "advanced", "type": "advanced"},
    ]
    , "#hud_current_ammo"); //Template name

    hud_elements.push(element);
}
