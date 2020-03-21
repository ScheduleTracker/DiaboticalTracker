global_onload_callbacks.push(function(){

    const element = new HUD_element('item_picked', "", 
    {
        "fontSize": "2.7",
        "shadow": "1",
        "owner": "1",
        "icon": "1",
        "iconWidth": "3",
        "iconBackground": "#0000005F",
    }, 
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "toggle", "type": "icon", "text": "Show Icon"},
        {"inputType": "toggle", "type": "owner", "text": "Previous Owner"},
        {"inputType": "float",  "type": "iconWidth", "text": "Icon Width"},
        {"inputType": "color",  "type": "iconBackground", "text": "Icon Background Color"},
    ]
    , "#hud_itempickup");

    hud_elements.push(element);

    bind_event('item_picked', function(class_name, last_owner) {
        //console.log(class_name, last_owner);

        let is_ammo = false;
        if (class_name.startsWith("ammo")) is_ammo = true;
        
        if (global_item_pickup_ignore.hasOwnProperty(class_name)) {
            return;
        }


        if (global_last_item_pickup_timeout != null && global_last_item_pickup == class_name) {
            if (global_last_item_pickup_multiplier == 0) global_last_item_pickup_multiplier = 1;
            global_last_item_pickup_multiplier += 1;
        } else {
            global_last_item_pickup_multiplier = 0;
        }

        global_last_item_pickup = class_name;

        // Clear previous timer if exists
        if (global_last_item_pickup_timeout != null) {
            clearTimeout(global_last_item_pickup_timeout);
            global_last_item_pickup_timeout = null;
        }

        // Hide again after 3 seconds
        global_last_item_pickup_timeout = setTimeout(function() {
            _for_each_with_class_in_parent(real_hud_element, "elem_item_picked", function(el) {
                anim_hide(el,100);
            });
            global_last_item_pickup_timeout = null;
        },3000);

        
        _for_each_with_class_in_parent(real_hud_element, "elem_item_picked", function(el) {
            
            if (el.children.length == 0) return;

            for (var i=0; i<el.children[0].children.length; i++) {
                let node = el.children[0].children[i];

                let color = global_item_name_map[class_name] ? global_item_name_map[class_name][0] : 'ffffff';

                if (node.classList.contains("icon")) {
                    let img = global_item_name_map[class_name] ? global_item_name_map[class_name][2] : '';
                    node.style.backgroundImage = "url('"+img+"?fill="+color+"')";
                    if (is_ammo) {
                        node.style.borderColor = "transparent";
                        node.style.backgroundSize = "contain";
                    } else {
                        node.style.borderColor = "transparent";
                        node.style.backgroundSize = "contain";
                    }
                }
                if (node.classList.contains("text")) {

                    for (var y=0; y<node.children.length; y++) {
                        let subnode = node.children[y];

                        if (subnode.classList.contains("owner")) {
                            let name = '';
                            if (last_owner.length > 0) name = last_owner;
                            if (name.length) {
                                name += name.endsWith("s") ? "'" : "'s";
                            }
                            //subnode.innerHTML = name;
                            _html(subnode, name);
                        }
                        if (subnode.classList.contains("name")) {
                            let text = global_item_name_map[class_name] ? localize(global_item_name_map[class_name][1]) : class_name;
                            if (global_last_item_pickup_multiplier > 0) {
                                text += " x"+global_last_item_pickup_multiplier;
                            }
                            //subnode.innerHTML = text;
                            _html(subnode, text);
                        }
                    }
                }
            }

            // Remove previous hide animation if one exists
            anim_remove(el);

            // Show Message
            el.style.display = "flex";
            el.style.opacity = 1;
        });
    });
});


