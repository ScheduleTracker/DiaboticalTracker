function init_element_frag_feed() {


    const hud_elem = new HUD_element('frag_feed', false,
    {
        "height": "20",
        "width": "30",
        "fontSize": "1.6",
        "font": "montserrat-bold",
        "v_align": "flex-end",
        "bottomUp": "0",
        "direction": "bottom",
    },      //Default values
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "list", "type": "v_align", "text": "Align", "listValues":
            [
                {"name": "Left", "value": "flex-start"},
                {"name": "Center", "value": "center"},
                {"name": "Right", "value": "flex-end"},
            ]
        },
        {"inputType": "toggle", "type": "bottomUp", "text": "Bottom Up"},
        {"inputType": "list", "type": "direction", "text": "New Line", "listValues":
            [
                {"name": "Top", "value": "top"},
                {"name": "Bottom", "value": "bottom"},
            ]
        },
    ]
    , "#hud_frag_feed");  //Template Name
    hud_elements.push(hud_elem);

    bind_event('fraglog_add', function (str) {
        let data = {};
        try {
            data = JSON.parse(str);
            /* data example {
                "event": "kill",
                "item": "weaponrl",
                "powerup": "tripledamage",
                "username1": "noctan",
                "username2": "2gd",
                "color1": "#00a5ff",
                "color2": "#4bff00"
            }*/
        } catch(e) {
            console.error("Error parsing fraglog json", e.message);
            return;
        }

        let log_line = _createElement("div");

        if (data.event == "kill") {
            let name1 = _createElement("span", "name", data.username1);
            name1.style.color = _backgroundFontColor(data.color1);
            name1.style.backgroundColor = data.color1+"bb";

            let name2 = _createElement("span", "name", data.username2);
            name2.style.color = _backgroundFontColor(data.color2);
            name2.style.backgroundColor = data.color2+"bb";

            let icon_cont = _createElement("span", "icon_cont");
            if (data.powerup.length) {
                let powerup = _createElement("span", "icon");
                if (data.powerup in global_item_name_map) powerup.style.backgroundImage = 'url('+global_item_name_map[data.powerup][2]+'?fill='+global_item_name_map[data.powerup][0]+')';
                icon_cont.appendChild(powerup);
            }
            let weapon = _createElement("span", "icon");
            if (data.item in global_item_name_map) weapon.style.backgroundImage = 'url('+global_item_name_map[data.item][2]+')';
            icon_cont.appendChild(weapon);

            log_line.appendChild(name1);
            log_line.appendChild(icon_cont);
            log_line.appendChild(name2);
        }

        if (data.event == "suicide") {
            let name = _createElement("span", "name", data.username1);
            name.style.color = _backgroundFontColor(data.color1);
            name.style.backgroundColor = data.color1+"bb";
            log_line.appendChild(name);
            log_line.appendChild(_createElement("span", "suicide_message", localize("fraglog_player_suicide")));
        }

        for (let el of global_hud_references.fraglog) {
            let new_line = log_line.cloneNode(true);

            let translateY = el.parentElement.parentElement.dataset.fontSize;

            if (el.parentElement.parentElement.dataset.direction == "bottom") {
                el.appendChild(new_line);
                translateY = translateY * -1;
            } else {
                if (el.children.length) {
                    el.insertBefore(new_line, el.children[0]);
                } else {
                    el.appendChild(new_line);
                }
            }

            setTimeout(function() {
                if (new_line.parentNode) new_line.parentNode.removeChild(new_line);
                
                /*
                if (new_line.classList.contains('remove_me')) {
                    return;
                }
                new_line.classList.add("remove_me");
                anim_start({
                    element: new_line,
                    duration: 250,
                    delay: 0,
                    opacity: [1, 0],
                    //translateY: [0, translateY, "vh"],
                    remove: true,
                });
                */
            },5000);

            if (el.children.length > 5) {
                //for (let child of el.children) {
                if (el.parentElement.parentElement.dataset.direction == "bottom") {
                    for (let i=0; i<el.children.length; i++) {
                        if (el.children[i].parentNode) el.children[i].parentNode.removeChild(el.children[i]);
                        /*
                        if (el.children[i].classList.contains('remove_me')) {
                            continue;
                        }
                        hideFragLogLine(el.children[i], translateY)
                        */
                        break;
                    }
                } else {
                    for (let i=el.children.length-1; i>=0; i--) {
                        if (el.children[i].parentNode) el.children[i].parentNode.removeChild(el.children[i]);
                        /*
                        if (el.children[i].classList.contains('remove_me')) {
                            continue;
                        }
                        hideFragLogLine(el.children[i], translateY)
                        */
                        break;
                    }
                }
            }
        }
    });

    function hideFragLogLine(el, translateY) {
        if (el.parentNode) el.parentNode.removeChild(el);
        /*
        el.classList.add("remove_me");
        anim_start({
            element: el,
            duration: 250,
            delay: 0,
            opacity: [1, 0],
            //translateY: [0, translateY, "vh"],
            remove: true,
        });
        */
    }
}