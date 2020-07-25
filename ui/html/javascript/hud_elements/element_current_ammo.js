function init_element_current_ammo() {

    const element = new HUD_element('current_ammo', true,
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
        "lowAO": "0",
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
        {"inputType": "toggle", "type": "lowAO", "text": "Low Ammo Only"},
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
    ]
    , "#hud_current_ammo"); //Template name

    hud_elements.push(element);
}
