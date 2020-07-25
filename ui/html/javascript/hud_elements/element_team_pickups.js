function init_element_team_pickups() {

    const element = new HUD_element('team_pickups', false, 
    {
        "height": "20",
        "width": "40",
        "fontSize": "2",
        "bgC": "#00000025",
        "v_align": "flex-start",
        "ia": "1",
        "im": "1",
        "ip": "1",
        "wa": "1",
    }, 
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
        defaultFontSize,
        defaultFontFamily,
        {"inputType": "list", "type": "v_align", "text": "Align", "listValues":
            [
                {"name": "Left", "value": "flex-start"},
                {"name": "Center", "value": "center"},
                {"name": "Right", "value": "flex-end"},
            ]
        },
        {"inputType": "toggle", "type": "bUp", "text": "Bottom Up"},
        {"inputType": "color", "type": "bgC", "text": "Background Color"},

        // Temporary solution until we have a new input type to handle multi selections
        {"inputType": "toggle", "type": "ia", "text": "Show Major Armors"},
        {"inputType": "toggle", "type": "im", "text": "Show Mega Health"},
        {"inputType": "toggle", "type": "ip", "text": "Show Powerups"},
        {"inputType": "toggle", "type": "wa", "text": "Show all Weapons"},

        {"inputType": "toggle", "type": "wbl", "text": "Show Blaster"},
        {"inputType": "toggle", "type": "wsg", "text": "Show Super Shotgun"},
        {"inputType": "toggle", "type": "wrl", "text": "Show Rocket Launcher"},
        {"inputType": "toggle", "type": "wshaft", "text": "Show Shaft"},
        {"inputType": "toggle", "type": "wcb", "text": "Show Crossbow"},
        {"inputType": "toggle", "type": "wpncr", "text": "Show PnCR"},
        {"inputType": "toggle", "type": "wgl", "text": "Show Grenade Launcher"},
        {"inputType": "toggle", "type": "wmac", "text": "Show Machine Gun"},
    ]
    , "#hud_team_pickups");

    hud_elements.push(element);

    let weapons_blaster = ["weaponbl", "weaponsb", "weaponmb"];
    let weapon_shotgun = ["weaponshotgun", "weaponss", "weaponsg"];

    bind_event('item_picked_team', function(item_identifier, username, game_time_seconds) {
        if (!(item_identifier in global_item_name_map)) return;

        // type can be one of: "mode_pickup" "powerup" "weapon" "armor" "health" "ammo" "special"
        let type = global_item_name_map[item_identifier][3];
        
        _for_each_with_class_in_parent(real_hud_container, "elem_team_pickups", function(el) {
            let show_item = false;
            if (type == "armor"   && "ia" in el.dataset && el.dataset.ia == "1" && item_identifier != "armort1") show_item = true;
            if (type == "health"  && "im" in el.dataset && el.dataset.im == "1" && item_identifier == "hpt3") show_item = true;
            if (type == "powerup" && "ip" in el.dataset && el.dataset.ip == "1") show_item = true;
            if (type == "weapon") {
                if ("wa" in el.dataset && el.dataset.wa == "1") show_item = true;
                else if (weapons_blaster.includes(item_identifier) && "wbl" in el.dataset && el.dataset.wbl == "1") show_item = true;
                else if (weapon_shotgun.includes(item_identifier) && "wsg" in el.dataset && el.dataset.wsg == "1") show_item = true;
                else if (item_identifier == "weaponrl"   && "wrl" in el.dataset && el.dataset.wrl == "1") show_item = true;
                else if (item_identifier == "weapondf"   && "wshaft" in el.dataset && el.dataset.wshaft == "1") show_item = true;
                else if (item_identifier == "weaponcb"   && "wcb" in el.dataset && el.dataset.wcb == "1") show_item = true;
                else if (item_identifier == "weaponpncr" && "wpncr" in el.dataset && el.dataset.wpncr == "1") show_item = true;
                else if (item_identifier == "weapongl"   && "wgl" in el.dataset && el.dataset.wgl == "1") show_item = true;
                else if (item_identifier == "weaponmac"  && "wmac" in el.dataset && el.dataset.wmac == "1") show_item = true;
            }

            if (!show_item) return;

            let msg = _createElement("div", "msg");
            msg.appendChild(_createElement("div", "ts", _seconds_to_digital(game_time_seconds)));
            let icon = _createElement("div", "icon");
            icon.style.backgroundImage = "url(/html/"+global_item_name_map[item_identifier][2]+"?fill="+global_item_name_map[item_identifier][0]+")";
            msg.appendChild(icon);
            msg.appendChild(_createElement("div", "name", username));

            el.appendChild(msg);

            anim_start({
                element: msg,
                opacity: [1, 0],
                delay: 3000,
                duration: 250,
                remove: true,
            });
        });
    });
}