function init_element_controls() {

    var hud_elem = new HUD_element('controls', true,
    {//Default values
        "height": "8",
        "width": "24",
    },      
        
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
    ]
    , "#hud_controls");  //Template Name

    hud_elements.push(hud_elem);

}