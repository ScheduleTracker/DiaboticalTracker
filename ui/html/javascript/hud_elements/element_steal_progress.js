function init_element_steal_progress() {

    var hud_elem = new HUD_element('steal_progress', true,
    {//Default values
        "height": "2.4",
        "width": "30",
    },      
        
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
    ]
    , "#hud_steal_progress");  //Template Name

    hud_elements.push(hud_elem);

}