

let global_shop_is_rendered = false;
let global_shop_ts_updated = undefined;
let global_shop_id = 0;
function load_shop() {
    if (!global_shop_is_rendered) {
        send_string(CLIENT_COMMAND_GET_CURRENT_SHOP, "", "get-current-shop", prepare_shop);
    } else {
        let now = new Date();
        let assumed_shop_id = now.getUTCFullYear()+""+now.getUTCMonth()+""+now.getUTCDate();
        if (now.getUTCHours() < global_shop_ts_updated.getUTCHours() && assumed_shop_id != global_shop_id) {
            send_string(CLIENT_COMMAND_GET_CURRENT_SHOP, "", "get-current-shop", prepare_shop);
        }
    }
}

let global_item_shop_map = {};
function prepare_shop(data) {
    console.log("prepare_shop",_dump(data));

    // Array of category -> featured -> group -> item
    let shop_data = {
        "special": {},
        "limited": {},
        "normal": {},
    };

    // Prepare the data
    for (let i of data.data.customizations.concat(data.data.packs)) {
        if (!(i.item_category in shop_data)) {
            console.log("WARNING - Missing shop item category");
            continue;
        }

        global_item_shop_map[i.shop_item_id] = i;

        let type = "normal";
        if (i.item_featured) type = "featured";
        
        if (!(type in shop_data[i.item_category])) shop_data[i.item_category][type] = {};
        
        shop_data[i.item_category][type].ts_end = new Date(i.ts_end);

        if (!(i.item_group in shop_data[i.item_category][type])) {
            shop_data[i.item_category][type][i.item_group] = [i];
        } else {
            shop_data[i.item_category][type][i.item_group].push(i);
        }
    }

    render_shop(shop_data);

    global_shop_is_rendered = true;
    if (data.data.shop_id != global_shop_id) {
        global_shop_ts_updated = new Date();
        global_shop_id = data.data.shop_id;
    }
}

function render_shop(data) {
    for (let timer of global_shop_timers) { timer.stopCountdown(); }
    global_shop_timers = [];

    let cont = _id("shop_screen").querySelector(".shop_group_container");
    _empty(cont);
    if (Object.keys(data.special).length) cont.appendChild(render_shop_category("special", data["special"]));
    if (Object.keys(data.limited).length) cont.appendChild(render_shop_category("limited", data["limited"]));
    if (Object.keys(data.normal).length)  cont.appendChild(render_shop_category("normal", data["normal"]));
}

let global_shop_timers = [];
function render_shop_category(category, data) {

    shop_update_available_coins()

    let fragment = new DocumentFragment();

    for (let type of ["featured", "normal"]) {
        if (!(type in data)) continue;

        let title = "";
        if (category == "normal")  title = localize("shop_group_title_"+type+"_items");
        if (category == "special") title = localize("shop_group_title_special");
        if (category == "limited") title = localize("shop_group_title_limited_time");

        let shop_group = _createElement("div", "shop_group");

        let header = _createElement("div", "header");
        header.appendChild(_createElement("div", "title", title));
        let time_left = _createElement("div", "time_left");
        time_left.appendChild(_createElement("div", "clock"));
        let time = _createElement("div", "time");
        time_left.appendChild(time);
        global_shop_timers.push(new CountdownTimer(data[type].ts_end, time));
        header.appendChild(time_left);
    
        let container = _createElement("div", "container");
        if (category == "normal") container.classList.add("normal");

        let group_ids = Object.keys(data[type]).sort(function(a, b) { return b-a; });
        for (let group of group_ids) {
            if (group == 0) {
                if (data[type][0] && data[type][0].length) {

                    let amount = data[type][0].length;
                    if (category == "normal") {
                        
                        let max_per_row = Math.ceil(amount/2);
                        let row1 = _createElement("div", "row");
                        let row2 = _createElement("div", "row");
                        for (let i=0; i<data[type][group].length; i++) {
                            if (i < max_per_row) {
                                row1.appendChild(new ShopGroup([data[type][group][i]]).container);
                            } else {
                                row2.appendChild(new ShopGroup([data[type][group][i]]).container);
                            }
                        }
                        container.appendChild(row1);
                        container.appendChild(row2);
                        
                    } else {
                        for (let i of data[type][group]) {
                            container.appendChild(new ShopGroup([i]).container);
                        }
                    }
                }
            } else {
                if (data[type][group] && data[type][group].length) {
                    container.appendChild(new ShopGroup(data[type][group]).container);
                }
            }
        }

        shop_group.appendChild(header);
        shop_group.appendChild(container);

        fragment.appendChild(shop_group);
    }

    return fragment;
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

function shop_update_available_coins() {
    _id("shop_screen").querySelector(".shop_currency_info .value").textContent = _format_number(global_self.private.coins);
}


class ShopGroup {
    constructor(data) {
        this.data = data;

        this.bg = undefined;
        this.bg_cont = undefined;
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

        let shine = _createElement("div","shine");
        this.container.appendChild(shine);

        this.item_container = _createElement("div", "item");
    
        this.bg_cont = _createElement("div", "bg_cont");
        this.bg = _createElement("div", "bg");
        this.bg_cont.appendChild(this.bg);
        this.item_container.appendChild(this.bg_cont);

        this.type = _createElement("div","type");
        this.item_container.appendChild(this.type);

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
        render_shop_item(this.data, this.current_idx);
        open_shop_item();
    }

    renderItem(idx) {

        _empty(this.bg);

        let item_owned = false;

        if (this.data[idx].item_type == "c") {
            // Customization Item

            this.container.style.setProperty("--item_rarity_color", "var(--rarity_"+this.data[idx].rarity+")");
            this.name.textContent = localize("customization_"+this.data[idx].customization_id); 
            this.type.textContent = localize(global_customization_type_map[this.data[idx].customization_type].i18n);
            this.bg.appendChild(renderCustomizationInner(global_customization_type_map[this.data[idx].customization_type].name, this.data[idx].customization_id));

            if (this.data[idx].customization_id in global_customization_data_map) item_owned = true;
        } else if (this.data[idx].item_type == "p") {
            // Customization Pack

            let items = _sort_customization_items(this.data[idx].customizations);
            let main_item = items[0];

            if (this.data[idx].customization_pack_name && this.data[idx].customization_pack_color) {
                this.container.style.setProperty("--item_rarity_color", this.data[idx].customization_pack_color);
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

            } else {
                this.container.style.setProperty("--item_rarity_color", "var(--rarity_"+main_item.rarity+")");
                this.name.textContent = localize("customization_"+main_item.customization_id);
                this.type.textContent = localize(global_customization_type_map[main_item.customization_type].i18n);
                this.bg.appendChild(renderCustomizationInner(global_customization_type_map[main_item.customization_type].name, main_item.customization_id));

                if (main_item.customization_id in global_customization_data_map) item_owned = true;
            }
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