function init_element_item() {

    var hud_elem = new HUD_element('item', true,
    {
        "font": "montserrat-bold",
        "iSize": "10",
        "mC": "#ffffff",
        "bRadius": "50",
        //"cCode": "15",
        "bWidth": "0.5",
        "bgC": "#24232188",
        "flip": "0",
        "keybind": "1",
        "iShadow": "0",
        "iC": "custom",
        "iCCustom": "#ffffff",
        "style": "default",
        "name": "1",
    },      
        
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontFamily,
        {"inputType": "float", "type": "iSize", "text": "Icon Size"},
        {"inputType": "color", "type": "mC", "text": "Main Color"},
        {"inputType": "color", "type": "bgC", "text": "Background Color"},
        {"inputType": "float", "type": "bRadius", "text": "Icon Corner Radius"},
        //{"inputType": "float", "type": "cCode", "text": "Icon Corner Bitmask"},
        {"inputType": "float", "type": "bWidth", "text": "Border Width" },
        {"inputType": "toggle","type": "flip", "text": "Flip layout" },
        {"inputType": "toggle","type": "name", "text": "Show Item Name"},
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

}

function format_item_name(id) {
    if (!(id in global_item_name_map)) return '';
    return localize(global_item_name_map[id][1]);
}