
function init_hud_screen_item_shop() {
    bind_event("set_shop_visible", set_shop_visible);
    bind_event("set_shop_money", set_shop_money);

    init_item_shop_references();
}

let global_item_shop_ref = null;
let global_item_shop_coins_ref = null;
let global_item_shop_items_ref = null;
let global_item_shop_item_desc_ref = null;
let global_item_shop_coin_count = 0;
let global_item_shop_is_open = false;
let global_item_shop_items = [];
function init_item_shop_references() {
    if (global_item_shop_ref != null) return;
    
    global_item_shop_ref = _id("ingame_item_shop");
    global_item_shop_coins_ref = _id("item_shop_coin_count");
    global_item_shop_items_ref = _id("item_shop_items");
    global_item_shop_item_desc_ref = _id("item_shop_item_desc");
}

function close_ingame_shop() {
    engine.call("close_shop");
}

function set_shop_money(coins) {
    init_item_shop_references();

    global_item_shop_coin_count = coins;
    global_item_shop_coins_ref.textContent = coins;

    if (global_item_shop_is_open) {
        _empty(global_item_shop_items_ref);
        ingame_shop_render_items(global_item_shop_items);
    }
}

function set_shop_visible(visible, json_data) {
    init_item_shop_references();

    if (!visible) {
        global_item_shop_ref.style.display = "none";
        global_item_shop_is_open = false;
        return;
    }

    global_item_shop_is_open = true;

    let data = {};
    try {
        data = JSON.parse(json_data);
    } catch(e) {
        console.log("Error parsing set_shop_visible json_data", e.message);
    }


    _empty(global_item_shop_items_ref);
    if (data.items && data.items.length) {

        global_item_shop_items = data.items;
        ingame_shop_render_items(data.items);

    } else {
        global_item_shop_items = [];
    }

    global_item_shop_ref.style.display = "block";

}

function ingame_shop_render_items(items) {
    init_item_shop_references();

    let onevw_float = window.outerWidth / 100;
    let onevh_float = window.outerHeight / 100;

    let width = 110 * onevh_float;
    if (width > window.outerWidth) {
        width = 90 * onevw_float;
    }

    let item_width = (width - (onevh_float * 8)) / 4;
    if (items.length > 10) {
        item_width = (width - (onevh_float * 12)) / 6;
    } else if (items.length > 8) {
        item_width = (width - (onevh_float * 10)) / 5;
    }

    let font_size_label = item_width * 0.083;
    let font_size_cost = item_width * 0.12;
    global_item_shop_items_ref.style.setProperty("--label_size", font_size_label+"px");
    global_item_shop_items_ref.style.setProperty("--cost_size", font_size_cost+"px");

    for (let i of items) {
        if (!(i.item in global_ingame_shop_item_map)) continue;

        let item = _createElement("div", "item");

        let affordable = true;
        let out_of_price_range = false;
        if (i.locked) {
            affordable = false;
            item.classList.add("locked");            
        } else if (global_item_shop_coin_count < i.cost) {
            affordable = false;
            out_of_price_range = true;
            item.classList.add("locked");
        }

        item.appendChild(_createElement("div", "name", localize(global_ingame_shop_item_map[i.item][0])));
        let cost_element = _createElement("div", "cost", i.cost);
        if (out_of_price_range){
            cost_element.style.color = "#FF0000";
        } else {
            cost_element.style.color = "#00FF00";
        }
        item.appendChild(cost_element);
        let icon = _createElement("div", "icon");
        icon.style.backgroundImage = "url("+global_ingame_shop_item_map[i.item][2]+"?fill="+global_ingame_shop_item_map[i.item][3]+")";
        item.appendChild(icon);

        item.style.width = item_width+"px";
        item.style.height = item_width+"px";

        item.addEventListener("click", () => {
            if (affordable) {
                engine.call("on_item_bought", i.item);
            }
        });

        item.addEventListener("mouseenter", function() {
            global_item_shop_item_desc_ref.textContent = localize(global_ingame_shop_item_map[i.item][1]);
        });
        item.addEventListener("mouseleave", function() {
            global_item_shop_item_desc_ref.textContent = "";
        });

        if (affordable) _addButtonSounds(item, 1);

        global_item_shop_items_ref.appendChild(item);
    }
}
