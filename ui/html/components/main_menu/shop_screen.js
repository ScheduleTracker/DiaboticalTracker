

let global_shop_is_rendered = false;
let global_shop_ts_updated = undefined;
let global_shop_id = 0;
let global_shop_data = {
    "special": {},
    "limited": {},
    "normal": {},
};

function load_shop() {
    if (!global_shop_is_rendered) {
        api_request("GET", "/shop", {}, prepare_shop);
    } else {
        let now = new Date();
        let assumed_shop_id = now.getUTCFullYear()+""+now.getUTCMonth()+""+now.getUTCDate();
        if (now.getUTCHours() < global_shop_ts_updated.getUTCHours() && assumed_shop_id != global_shop_id) {
            api_request("GET", "/shop", {}, prepare_shop);
        }
    }
}

let global_item_shop_map = {};
function prepare_shop(data) {
    console.log("prepare_shop",_dump(data));

    // Array of category -> featured -> group -> item
    global_shop_data = {
        "special":    {},
        "limited":    {},
        "normal":     {},
        "battlepass": {},
    };

    // Prepare the data
    for (let i of data.customizations.concat(data.packs)) {
        if (!(i.item_category in global_shop_data)) {
            console.log("WARNING - Missing shop item category");
            continue;
        }

        global_item_shop_map[i.shop_item_id] = i;

        let type = "notfeatured";
        if (i.item_featured) type = "featured";
        
        if (!(type in global_shop_data[i.item_category])) global_shop_data[i.item_category][type] = {};
        
        global_shop_data[i.item_category][type].ts_end = new Date(i.ts_end);

        if (!(i.item_group in global_shop_data[i.item_category][type])) {
            global_shop_data[i.item_category][type][i.item_group] = [i];
        } else {
            global_shop_data[i.item_category][type][i.item_group].push(i);
        }
    }

    render_shop(global_shop_data);

    global_shop_is_rendered = true;
    if (data.shop_id != global_shop_id) {
        global_shop_ts_updated = new Date();
        global_shop_id = data.shop_id;
    }

    req_anim_frame(() => {    
        if (global_scrollboosters["shop"]) global_scrollboosters["shop"].updateMetrics();
    }, 2);
}

let global_shop_scrolling = false;
function render_shop(data) {
    for (let timer of global_shop_timers) { timer.stopCountdown(); }
    global_shop_timers = [];

    let cont = _id("shop_screen").querySelector(".shop_group_container");
    _empty(cont);
    if (Object.keys(data.special).length)     cont.appendChild(render_shop_category("special", data["special"]));
    if (Object.keys(data.limited).length)     cont.appendChild(render_shop_category("limited", data["limited"]));
    if (Object.keys(data.normal).length)      cont.appendChild(render_shop_category("normal", data["normal"]));
    if (Object.keys(data.battlepass).length)  cont.appendChild(render_shop_category("battlepass", data["battlepass"]));


    if (!global_scrollbooster_bars["shop"]) global_scrollbooster_bars["shop"] = new ScrollBoosterBar(cont.parentElement);
    if (!global_scrollboosters["shop"]) global_scrollboosters["shop"] = new ScrollBooster({
        viewport: cont.parentElement,
        content: cont,
        pointerMode: "mouse",
        friction: 0.05,
        bounceForce: 0.2,
        direction: "horizontal",
        scrollMode: "transform",
        emulateScroll: true,
        onScrollBegin: function() {
            global_shop_scrolling = true;
        },
        onScrollEnd: function() {
            global_shop_scrolling = false;
        },
        onScroll: function(x,y,viewport,content) {
            global_scrollbooster_bars["shop"].updateThumb(x,y,viewport,content);
        },
    });
    global_scrollbooster_bars["shop"].onScroll = function(pos_x, pos_y) {
        global_scrollboosters["shop"].setPosition({
            "x": pos_x,
            "y": pos_y,
        });
    };
}

let global_shop_timers = [];
function render_shop_category(category, data) {

    let fragment = new DocumentFragment();

    let title = "";
    if (category == "special")    title = localize("shop_group_title_special");
    if (category == "limited")    title = localize("shop_group_title_limited_time");
    if (category == "battlepass") title = localize("shop_group_title_battlepass");

    let shop_group = _createElement("div", "shop_group");

    let header_rendered = false;
    let outer_container = undefined;
    for (let type of ["featured", "notfeatured"]) {
        if (!(type in data)) continue;

        if (category == "normal") {
            if (type == "featured") title = localize("shop_group_title_featured_items");
            if (type == "notfeatured") title = localize("shop_group_title_daily_items");
            shop_group = _createElement("div", "shop_group");
            shop_group.appendChild(render_shop_category_header(title, data[type].ts_end));
            outer_container = _createElement("div", "outer_container");
        } else {
            if (!header_rendered) {
                shop_group.appendChild(render_shop_category_header(title, data[type].ts_end));
                header_rendered = true;
            }
            if (outer_container == undefined) {
                outer_container = _createElement("div", "outer_container");
            }
        }

        let container = _createElement("div", "container");
        outer_container.appendChild(container);
        if (type == "notfeatured") {
            container.classList.add("two_rows");

            let item_count = 0;
            for (let group_idx in data[type]) {
                if (group_idx == "0") {
                    item_count += data[type][group_idx].length;
                } else if (Number.isInteger(group_idx)) {
                    item_count += 1;
                }
            }

            if (item_count == 0) continue;

            let max_per_row = Math.ceil(item_count/2);
            let row1 = _createElement("div", "row");
            let row2 = _createElement("div", "row");

            let counter = 0;
            for (let group_idx in data[type]) {
                if (isNaN(group_idx)) continue;
                if (group_idx === "0") {
                    for (item of data[type][group_idx]) {
                        if (counter < max_per_row) {
                            row1.appendChild(new ShopGroup([item]).container);
                        } else {
                            row2.appendChild(new ShopGroup([item]).container);
                        }
                        counter++;
                    }
                } else {
                    if (counter < max_per_row) {
                        row1.appendChild(new ShopGroup(data[type][group_idx]).container);
                    } else {
                        row2.appendChild(new ShopGroup(data[type][group_idx]).container);
                    }
                    counter++;
                }
            }
            container.appendChild(row1);
            container.appendChild(row2);

        } else if (type == "featured") {

            for (let group_idx in data[type]) {
                if (isNaN(group_idx)) continue;

                if (group_idx === "0") {
                    for (item of data[type][group_idx]) {
                        container.appendChild(new ShopGroup([item]).container);
                    }
                } else {
                    container.appendChild(new ShopGroup(data[type][group_idx]).container);
                }
            }

        }

        shop_group.appendChild(outer_container);
        if (category == "normal") {
            fragment.appendChild(shop_group);
        }
    }

    if (category != "normal") {
        fragment.appendChild(shop_group);
    }

    return fragment;
}

function render_shop_category_header(title, ts_end) {
    let header = _createElement("div", "header");
    header.appendChild(_createElement("div", "title", title));
    let time_left = _createElement("div", "time_left");
    time_left.appendChild(_createElement("div", "clock"));
    let time = _createElement("div", "time");
    time_left.appendChild(time);
    global_shop_timers.push(new CountdownTimer(ts_end, time));
    header.appendChild(time_left);

    return header;
}

function shop_set_animation_state(running) {
    _for_each_with_class_in_parent(_id("shop_screen"), "progress_bar", function(el) {
        if (running) {
            el.classList.remove("paused");
        } else {
            el.classList.add("paused");
        }
    });
}

class ShopGroup {
    constructor(data) {
        this.data = data;

        this.bg = undefined;
        this.bg_cont = undefined;
        this.bg_cont_outer = undefined;
        this.name = undefined;
        this.price_cont = undefined;
        this.price = undefined;
        this.progress_bar = undefined;
    
        this.current_idx = 0;

        this.renderItemContainer(this.current_idx);
        this.renderItem(this.current_idx);

        if (this.data.length > 1) {
            this.progress_bar.addEventListener("animationend", () => {
                this.progress_bar.classList.remove("running");

                this.fadeOutCurrentItem();
            });

            this.bg.addEventListener("animationend", () => {
                if (this.bg.classList.contains("fadeout")) {
                    this.current_idx++;
                    if (!this.data[this.current_idx]) this.current_idx = 0;
                    this.renderItem(this.current_idx);
                    this.bg.classList.remove("fadeout");
                    this.bg.classList.add("fadein");
                } else if (this.bg.classList.contains("fadein")) {
                    this.bg.classList.remove("fadein");
                    this.startRotation();
                }
            });

            this.startRotation();
        }
    }

    startRotation() {
        setTimeout(() => {
            this.progress_bar.classList.add("running");
        });
    }

    fadeOutCurrentItem() {
        this.bg.classList.add("fadeout");
    }

    renderItemContainer(idx) {
        this.container = _createElement("div", "item_cont");
        if (this.data[idx].item_featured) this.container.classList.add("big");

        let shine_cont = _createElement("div", "shine_cont");
        this.container.appendChild(shine_cont);

        let shine = _createElement("div","shine");
        shine_cont.appendChild(shine);

        this.item_container = _createElement("div", "item");
    
        this.bg_cont_outer = _createElement("div", "bg_cont_outer");
        this.bg_cont = _createElement("div", "bg_cont");
        this.bg = _createElement("div", "bg");
        this.bg_cont.appendChild(this.bg);
        this.bg_cont_outer.appendChild(this.bg_cont);
        this.item_container.appendChild(this.bg_cont_outer);

        this.type = _createElement("div","type");
        this.item_container.appendChild(this.type);

        this.tag = _createElement("div", "tag");
        this.item_container.appendChild(this.tag);

        let bottom = _createElement("div", "bottom");
        this.name = _createElement("div","name");
        bottom.appendChild(this.name);
        this.price_cont = _createElement("div","price_cont");
        this.price_cont.appendChild(_createElement("div", ["icon", "reborn-coin"]));
        this.price = _createElement("div","price");
        this.price_cont.appendChild(this.price);
        bottom.appendChild(this.price_cont);

        this.owned_cont = _createElement("div", "owned");
        this.owned_cont.appendChild(_createElement("div", "label", localize("shop_item_owned")));
        this.owned_cont.appendChild(_createElement("div", "icon"));
        this.owned_cont.style.display = "none";
        bottom.appendChild(this.owned_cont);

        this.item_container.appendChild(bottom);

        if (this.data.length > 1) {
            let counter_cont = _createElement("div", "counter_cont");
            let counter_top = _createElement("div", "top");
            this.counter = _createElement("div", "counter");
            counter_top.appendChild(this.counter);
            counter_top.appendChild(_createElement("div", "separator", "/"));
            counter_top.appendChild(_createElement("div", "total", this.data.length));
            counter_cont.appendChild(counter_top);

            let progress_cont = _createElement("div", "progress_cont");
            this.progress_bar = _createElement("div", "progress_bar");
            progress_cont.appendChild(this.progress_bar);
            counter_cont.appendChild(progress_cont);
            this.item_container.appendChild(counter_cont);
        }

        this.container.appendChild(this.item_container);

        this.container.addEventListener("mouseenter", this.on_mouseenter.bind(this));
        this.container.addEventListener("mouseleave", this.on_mouseleave.bind(this));
        this.container.addEventListener("click", this.on_click.bind(this));
    }

    on_mouseenter(e) {
        this.bg_cont.classList.add("hover");
        _play_mouseover4();
    }

    on_mouseleave(e) {
        this.bg_cont.classList.remove("hover");
    }

    on_click(e) {
        _play_click1();

        if (this.data[this.current_idx].item_type == "b" || this.data[this.current_idx].item_type == "B") {
            open_battlepass_upgrade();
        } else {
            open_shop_item(this.data, this.current_idx);
        }
    }

    renderItem(idx) {

        _empty(this.bg);

        let item_owned = false;

        if (this.data[idx].item_type == "b" || this.data[idx].item_type == "B") {
            // Battle Pass
            this.container.style.setProperty("--item_rarity_color", "var(--rarity_4)");
            if (this.data[idx].item_type == "b") this.name.textContent = localize("shop_battlepass");
            if (this.data[idx].item_type == "B") this.name.textContent = localize("shop_battlepass_bundle");
            this.type.textContent = localize("shop_battlepass");

            if ("battlepass" in global_user_battlepass && global_user_battlepass.battlepass.owned == true) item_owned = true;
        } else if (this.data[idx].item_type == "c") {
            // Customization Item

            this.container.style.setProperty("--item_rarity_color", "var(--rarity_"+this.data[idx].rarity+")");
            this.name.textContent = localize("customization_"+this.data[idx].customization_id);
            this.type.textContent = localize(global_customization_type_map[this.data[idx].customization_type].i18n);

            let id = this.data[idx].customization_id;
            if (this.data[idx].shop_image) id = "shop_"+id;
            this.bg.appendChild(renderCustomizationInner(this.data[idx].customization_type, id));

            if (this.data[idx].customization_id in global_customization_data_map) item_owned = true;
        } else if (this.data[idx].item_type == "p") {
            // Customization Pack

            let items = _sort_customization_items(this.data[idx].customizations);
            let main_item = items[0];

            // Background Color
            if (this.data[idx].customization_pack_color) {
                this.container.style.setProperty("--item_rarity_color", _format_color(this.data[idx].customization_pack_color));
            } else {
                this.container.style.setProperty("--item_rarity_color", "var(--rarity_"+main_item.rarity+")");
            }

            // Name, Image and check for ownership
            if (this.data[idx].customization_pack_name) {
                this.name.textContent = localize("customization_pack_"+this.data[idx].customization_pack_name);
                this.type.textContent = localize("customization_pack");

                let all_found = true;
                for (let c of this.data[idx].customizations) {
                    if (global_customization_type_map[c.customization_type].name == "currency") continue;
                    
                    if (!(c.customization_id in global_customization_data_map)) {
                        all_found = false;
                        break;
                    }
                }
                if (all_found) item_owned = true;

                // TODO set customization pack image
                // ...
                // /html/customization_pack/test_pack.png.dds
                this.bg.appendChild(renderCustomizationPackInner(this.data[idx].customization_pack_id));

            } else {
                this.name.textContent = localize("customization_"+main_item.customization_id);
                this.type.textContent = localize(global_customization_type_map[main_item.customization_type].i18n);
                this.bg.appendChild(renderCustomizationInner(main_item.customization_type, main_item.customization_id));

                if (main_item.customization_id in global_customization_data_map) item_owned = true;
            }
        }

        if (this.data[idx].item_tag !== null && this.data[idx].item_tag.length) {
            this.tag.textContent = localize(this.data[idx].item_tag);
            this.tag.style.display = "flex";
        } else {
            this.tag.style.display = "none";
        }

        if (item_owned) {
            this.price_cont.style.display = "none";
            this.owned_cont.style.display = "flex";
        } else {
            this.price_cont.style.display = "flex";
            this.owned_cont.style.display = "none";
        }

        this.price.textContent = _format_number(this.data[idx].item_price);

        if (this.data.length > 1) {
            this.counter.textContent = idx+1;
        }
    }
}


class CountdownTimer {
    constructor(date_string,element) {
        this.end = new Date(date_string);
        this.element = element;
        this.interval = undefined;

        if (this.element) this.startCountdown();
    }

    startCountdown() {
        this.updateTime();
        this.interval = setInterval(() => {
            if (new Date() >= this.end) {
                stopCountdown();
                return;
            } 

            this.updateTime();
        }, 1000);
    }

    stopCountdown() {
        clearInterval(this.interval);
        this.element.textContent = "";
    }

    updateTime() {
        this.element.textContent =  _time_until((this.end - new Date()) / 1000);
    }
}

function update_wallet(coins) {
    let shop_indicator = _id("shop_screen").querySelector(".shop_currency_info .value");
    if (shop_indicator) shop_indicator.textContent = _format_number(coins);

    let global_indicator = _id("wallet").querySelector(".value");
    if (global_indicator) global_indicator.textContent = _format_number(coins);
}



function shop_redeem_gift_key() {
    // Show modal with input
    let cont = _createElement("div", "redeem_item_cont");
    let text = _createElement("div", "text", localize("shop_redeem_gift_key_text"));
    cont.appendChild(text);
    let input = _createElement("input", "redeem_item_input");
    cont.appendChild(input);
    let error = _createElement("div", "error");
    error.style.display = "none";
    cont.appendChild(error);

    let btn_cont = _createElement("div", "generic_modal_dialog_action");
    let btn_redeem = _createElement("div", "dialog_button", localize("menu_button_redeem"));
    let btn_cancel = _createElement("div", "dialog_button", localize("menu_button_cancel"));
    _addButtonSounds(btn_redeem, 1);
    _addButtonSounds(btn_cancel, 1);
    btn_redeem.addEventListener("click", function() {
        global_manual_modal_close_disabled = true;

        error.style.display = "none";
        error.textContent = '';

        btn_cont.removeChild(btn_redeem);
        btn_cont.removeChild(btn_cancel);

        let processing = _createElement("div", "processing");
        processing.appendChild(_createSpinner());
        processing.appendChild(_createElement("div", "text", localize("processing")));
        btn_cont.appendChild(processing);

        if (input.value.trim().length == 0) {
            shop_redeem_gift_key_callback({"success": false, "reason": "invalid_gift_key" });
            return;
        }

        api_request("POST", `/shop/gift/redeem`, { "code": input.value.trim() }, shop_redeem_gift_key_callback);
    });
    btn_cancel.addEventListener("click", closeBasicModal);
    btn_cont.appendChild(btn_redeem);
    btn_cont.appendChild(btn_cancel);

    openBasicModal(basicGenericModal(localize("shop_redeem_gift_key"), cont, btn_cont));
    input.focus();

    function shop_redeem_gift_key_callback(data) {
        global_manual_modal_close_disabled = false;

        //console.log("shop_redeem_gift_key", _dump(data));
        if (data.success == false) {
            error.textContent = localize("shop_error_"+data.reason);
            error.style.display = "block";

            _empty(btn_cont);
            btn_cont.appendChild(btn_redeem);
            btn_cont.appendChild(btn_cancel);
        }

        if (data.success == true) {
            closeBasicModal();

            if (data.coins) {
                global_self.private.coins = data.coins;
                update_wallet(global_self.private.coins);
            }

            //if (data.item_type == SHOP_ITEM_TYPE.CUSTOMIZATION || data.item_type == SHOP_ITEM_TYPE.PACK) {}
            if (data.item_type == SHOP_ITEM_TYPE.BATTLEPASS_BASIC || data.item_type == SHOP_ITEM_TYPE.BATTLEPASS_BUNDLE) {
                global_user_battlepass.battlepass.owned = true;
                global_user_battlepass.battlepass.level = data.level;
                global_user_battlepass.battlepass.xp    = data.xp;
                global_user_battlepass.battlepass.seen  = true;
                global_user_battlepass.progression      = data.progression;
            }

            updateMenuBottomBattlepass(global_user_battlepass);
        
            if (data.notifs.length) {
                for (let n of data.notifs) {
                    global_notifs.addNotification(n);
    
                    if (n.items && n.items.length) {
                        add_user_customizations(n.items);
                    }
                }
    
                load_notifications();
            }
        }
    }
}

