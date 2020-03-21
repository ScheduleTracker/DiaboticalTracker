function init_element_dodge() {

    var hud_elem = new HUD_element('dodge', //Name
    "",     //Editor Text
    {//Default values
        "fontSize": "1.5",
        "iSize": "5",
        "mC": "white",
        "icon_inactive_opacity": 0.15,
        "bRadius": "0.8",
        "cCode": "15",
        "bWidth": 0,
        "bgC": "#00000000",
        "aT": "2",
    },      
        
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "list",  "type": "aT", "text": "Style", "listValues":
	        [
	            {"name": "Mono", "value": "0"},
	            {"name": "Chevrons", "value": "1"},
	            {"name": "Triplane", "value": "2"},
	        ]
	    },
        defaultFontFamily,
        defaultFontSize,
        {"inputType": "float", "type": "iSize", "text": "Icon Size"},
        {"inputType": "color", "type": "mC", "text": "Icon Color"},
        {"inputType": "float", "type": "icon_inactive_opacity", "text": "Icon Inactive Opacity"},
        {"inputType": "color", "type": "bgC", "text": "Background Color"},
        {"inputType": "float", "type": "bRadius", "text": "Icon Corner Radius"},
        {"inputType": "float", "type": "cCode", "text": "Icon Corner Bitmask"},
        {"inputType": "float", "type": "bWidth", "text": "Border Width" },
    ]
    , "#hud_dodge");  //Template Name

    hud_elements.push(hud_elem);

}