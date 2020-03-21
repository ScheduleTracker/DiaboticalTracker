global_onload_callbacks.push(function(){

    var hud_elem = new HUD_element('item', //Name
    "",     //Editor Text
    {//Default values
        //"fontSize": "1.5",
        "iSize": "3",
        "mC": "white",
        "bRadius": "0.8",
        "cCode": "15",
        "bWidth": 0.2,
        "bgC": "#24232188",
        "flip": "0",
        "keybind": "1",
        "iShadow": "0",
        "iC": "item",
        "iCCustom": "white",
        "style": "none",
    },      
        
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontFamily,
        //defaultFontSize,
        {"inputType": "float", "type": "iSize", "text": "Icon Size"},
        {"inputType": "color", "type": "mC", "text": "Main Color"},
        {"inputType": "color", "type": "bgC", "text": "Background Color"},
        {"inputType": "float", "type": "bRadius", "text": "Icon Corner Radius"},
        {"inputType": "float", "type": "cCode", "text": "Icon Corner Bitmask"},
        {"inputType": "float", "type": "bWidth", "text": "Border Width" },
        {"inputType": "toggle","type": "flip", "text": "Flip layout" },
        {"inputType": "toggle","type": "keybind", "text": "Show Keybind"},
        {"inputType": "toggle","type": "iShadow", "text": "Icon Shadow"},
        {"inputType": "list",  "type": "iC", "text": "Icon Color", "listValues":
            [
                {"name": "Item", "value": "item"},
                {"name": "Custom", "value": "custom"},
            ]
        }, 
        {"inputType": "color", "type": "iCCustom", "text": "Icon Color Custom"},
        {"inputType": "list",  "type": "style", "text": "Extra Styling", "listValues":
            [
                {"name": "None", "value": "none"},
                {"name": "Default", "value": "default"},
            ]
        },  
    ]
    , "#hud_item");  //Template Name

    hud_elements.push(hud_elem);

});