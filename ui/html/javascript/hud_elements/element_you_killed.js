function init_element_you_fragged() {

    const hud_elem = new HUD_element('you_fragged', false,
    {
        "fontSize": "3",
        "font": "veneer-italic",
        "color": "#ffffff",
        "pivot": "top-edge",
        "align": "center",
        "ha": "0",
    },      
    [       
        defaultPivot,
        defaultX,
        defaultY,
        defaultAlign,
        defaultFontFamily,
        defaultFontSize,
        defaultColor,
        {"inputType": "toggle", "type": "ha", "text": "Hide Assists"},
    ]
    ,"#hud_you_fragged");  
    hud_elements.push(hud_elem);
    
    bind_event('you_assisted', function(username, color) {
        frag_msg_handler("assist", username, color);
    });
    bind_event('you_fragged', function (username, color) {
        frag_msg_handler("frag", username, color);
    });

    function frag_msg_handler(type, username, color) {
        for (let el of global_hud_references.you_fragged) {
            let show_assists = (el.dataset.ha == "1") ? false : true;
            if (type == "assist" && !show_assists) continue;

            let line = _createElement("div", type);

            let text = '';
            if (type == "frag") text = localize("ingame_you_fragged");
            if (type == "assist") text = localize("ingame_assist");

            line.innerHTML = '<span>' + text + '</span><span style="color:'+color+'"> ' + username + '</span>';
            
            if (el.children[0].children.length) {
                el.children[0].insertBefore(line, el.children[0].children[0]);
            } else {
                el.children[0].appendChild(line);
            }
            
            anim_start({
                element: line,
                duration: 0,
                delay: 3000,
                completion: function() {

                    _remove_node(line);

                    /*
                    if (line.classList.contains('remove_me')) {
                        return;
                    }
                    line.classList.add("remove_me");
                    anim_start({
                        element: line,
                        duration: 300,
                        delay: 0,
                        opacity: [1, 0],
                        remove: true,
                    });
                    */
                }
            });

            if (el.children[0].children.length > 3) {
                for (let i=el.children[0].children.length - 1; i >= 0; i--) {
                
                    _remove_node(el.children[0].children[i]);
                    /*
                    if (el.children[0].children[i].classList.contains('remove_me')) {
                        continue;
                    }
                    el.children[0].children[i].classList.add("remove_me");
                    anim_start({
                        element: el.children[0].children[i],
                        duration: 300,
                        delay: 0,
                        opacity: [1, 0],
                        remove: true,
                    });
                    */
                    break;
                }
            }

/*
            setTimeout(function() {
                if (line.classList.contains('fade_out')) {
                    return;
                }
                line.classList.add("fade_out");
                line.addEventListener("animationend", function() {
                    if (line.parentNode == el.children[0]) {
                        el.children[0].removeChild(line);
                    }
                });
            },3000);
            
            if (el.children[0].children.length > 3) {
                for (var i=el.children[0].children.length - 1; i >= 0; i--) {
                    let child = el.children[0].children[i];
                
                    if (child.classList.contains('fade_out')) {
                        continue;
                    }
                    child.classList.add("fade_out");
                    child.addEventListener("animationend", function() {
                        if (child.parentNode == el.children[0]) {
                            el.children[0].removeChild(child);
                        }
                    });
                    break;
                }
            }
            */
        }

    }
}