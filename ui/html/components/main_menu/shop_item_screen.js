

function render_shop_item(group_items, item_idx) {
    console.log("render shop item",_dump(group_items), item_idx);

    let selected_item = group_items[item_idx];
    let item_references = [];
    let item_name = '';

    let item_box = _id("shop_item_screen").querySelector(".shop_item_box");
    _empty(item_box);

    let item_preview = _id("shop_item_screen").querySelector(".shop_item_preview_area");

    let init_item = selected_item;
    let items = [];

    let item_owned = false;

    if (selected_item.item_type == "c") {
        // Customization Item

        items.push({
            "customization_id": init_item.customization_id,
            "customization_type": init_item.customization_type,
            "customization_sub_type": init_item.customization_sub_type,
            "customization_set_id": init_item.customization_set_id,
            "rarity": init_item.rarity,
            "amount": init_item.amount,
        });

        if (init_item.customization_id in global_customization_data_map) item_owned = true;
    } else if (selected_item.item_type == "p") {
        // Customization Pack

        items = _sort_customization_items(init_item.customizations);
        init_item = items[0];

        let all_found = true;
        for (let c of items) {
            if (global_customization_type_map[c.customization_type].name == "currency") continue;
            
            if (!(c.customization_id in global_customization_data_map)) {
                all_found = false;
                break;
            }
        }
        if (all_found) item_owned = true;
    }

    item_box.style.setProperty("--item_rarity_color", "var(--rarity_"+init_item.rarity+")");

    let fragment = new DocumentFragment();
    
    let div_top = _createElement("div", "top");
    let btn_back = _createElement("div", ["db-btn", "plain", "back"]);
    _addButtonSounds(btn_back, 2);
    btn_back.addEventListener("click", open_shop);
    div_top.appendChild(btn_back);

    item_name = localize("customization_"+init_item.customization_id); 

    // Pack Title
    if (selected_item.customization_pack_name && selected_item.customization_pack_name.length) {
        div_top.appendChild(_createElement("div", "title", localize("customization_pack_"+selected_item.customization_pack_name)));
        item_name = localize("customization_pack_"+selected_item.customization_pack_name);
    }

    fragment.appendChild(div_top);

    let header = _createElement("div", "header");
    header.appendChild(_createElement("div", "background"));
    let customization_info = createCustomizationInfo(init_item);
    header.appendChild(customization_info);
    fragment.appendChild(header);

    let set_name = '';
    if (init_item.customization_set_id && init_item.customization_set_id.length) set_name = localize("customization_set_"+init_item.customization_set_id);

    let div_desc = _createElement("div", "desc");
    let info_set = _createElement("div", "info_set", set_name);
    div_desc.appendChild(info_set);
    let info_intro = _createElement("div", "info_intro", "");
    div_desc.appendChild(info_intro);
    fragment.appendChild(div_desc);
    
    let item_list = _createElement("div", ["item_list", "scroll-outer"]);
    let scroll_bar = _createElement("div", "scroll-bar");
    scroll_bar.appendChild(_createElement("div", "scroll-thumb"));
    item_list.appendChild(scroll_bar);
    let scroll_inner = _createElement("div", "scroll-inner");

    for (let i=0; i<items.length; i++) {
        let type_name = global_customization_type_map[items[i].customization_type].name;
        let c_item = _createElement("div", ["customization_item", type_name, "rarity_bg_"+items[i].rarity]);
        c_item.appendChild(renderCustomizationInner(items[i].customization_type, items[i].customization_id));
        c_item.dataset.idx = i;
        c_item.addEventListener("mouseenter", item_on_mouseenter);

        if (items[i].customization_id == init_item.customization_id) c_item.classList.add("selected");
        scroll_inner.appendChild(c_item);
        item_references.push(c_item);
    }
    item_list.appendChild(scroll_inner);

    fragment.appendChild(item_list);

    let bottom = _createElement("div", "bottom");

    let price = _createElement("div", "price");
    price.appendChild(_createElement("div", ["icon", "reborn-coin"]));
    price.appendChild(_createElement("div", "value", _format_number(selected_item.item_price)));
    bottom.appendChild(price);

    if (item_owned) {
        let owned_cont = _createElement("div", "owned");
        owned_cont.appendChild(_createElement("div", "label", localize("shop_item_owned")));
        owned_cont.appendChild(_createElement("div", "icon"));
        bottom.appendChild(owned_cont);
    }

    if (global_self.private.coins >= selected_item.item_price) {
        if (!item_owned) {
            let buy_btn = _createElement("div", ["big-btn", "main"], localize("shop_purchase"));
            _addButtonSounds(buy_btn, 1);
            bottom.appendChild(buy_btn);
            buy_btn.addEventListener("click", show_purchase_modal);
        }

        /*
        let gift_btn = _createElement("div", ["big-btn"], localize("shop_purchase_gift"));
        _addButtonSounds(gift_btn, 1);
        bottom.appendChild(gift_btn);
        gift_btn.addEventListener("click", show_purchase_gift_modal);
        */
    } else {
        let get_more_btn = _createElement("div", ["big-btn", "main"], localize("shop_get_coins"));
        _addButtonSounds(get_more_btn, 1);
        get_more_btn.addEventListener("click", open_coin_shop);
        bottom.appendChild(get_more_btn);
    }
    
    fragment.appendChild(bottom);

    // shop group next / prev
    let arrow_cont = _createElement("div", "arrow_cont");
    let arrow_prev = _createElement("div", ["arrow", "prev"]);
    let arrow_next = _createElement("div", ["arrow", "next"]);
    arrow_prev.dataset.direction = "prev";
    arrow_next.dataset.direction = "next";
    arrow_prev.addEventListener("click", on_arrow_click.bind(this));
    arrow_next.addEventListener("click", on_arrow_click.bind(this));
    let page_counter = _createElement("div", "page_counter");
    let page_cur = _createElement("div", ["num", "page_cur"]);
    page_cur.textContent = item_idx + 1;
    let page_separator = _createElement("div", "separator", "/");
    let page_max = _createElement("div", ["num", "page_max"]);
    page_max.textContent = group_items.length;
    page_counter.appendChild(page_cur);
    page_counter.appendChild(page_separator);
    page_counter.appendChild(page_max);
    arrow_cont.appendChild(arrow_prev);
    arrow_cont.appendChild(page_counter);
    arrow_cont.appendChild(arrow_next);

    if (group_items.length <= 1) arrow_cont.style.visibility = "hidden";
    fragment.appendChild(arrow_cont);

    item_box.appendChild(fragment);

    new Scrollbar(item_list, global_scrollbarTrackerId++, true);

    show_preview(init_item);

    function show_preview(item) {
        _empty(item_preview);
        if (!(item.customization_type in global_customization_type_map)) return;

        let ctype = new CustomizationType(global_customization_type_map[item.customization_type].name, item.customization_sub_type);
        show_customization_preview_scene("shop_item", ctype, item.customization_id, item, item_preview);
    }
    
    function item_on_mouseenter(e) {
        let c_item = e.currentTarget;
        if (c_item.classList.contains("selected")) return;

        _for_each_with_class_in_parent(c_item.parentElement, "selected", function(el) { el.classList.remove("selected"); });
        c_item.classList.add("selected");

        _play_mouseover4();
        update_shop_item(c_item.dataset.idx);
    }

    function update_shop_item(item_idx) {
        // update the box when hovering over a differnt item within the item list of a pack
        let item = items[item_idx];

        item_box.style.setProperty("--item_rarity_color", "var(--rarity_"+item.rarity+")");

        _remove_node(customization_info);
        customization_info = createCustomizationInfo(item);
        header.appendChild(customization_info);

        let set_name = '';
        if (item.customization_set_id && item.customization_set_id.length) set_name = localize("customization_set_"+item.customization_set_id);
        info_set.textContent = set_name;
        info_intro.textContent = "";

        show_preview(item);
    }

    function on_arrow_click(e) {
        if (e.currentTarget.dataset.direction == "next") {
            item_idx = Number(item_idx) + 1;
            if (!group_items[item_idx]) item_idx = 0;
            _play_click1();
        } else if (e.currentTarget.dataset.direction == "prev") {
            item_idx = Number(item_idx) - 1;
            if (item_idx < 0) item_idx = group_items.length - 1;
            _play_click_back();
        }

        render_shop_item(group_items, item_idx);
    }


    function show_purchase_modal() {

        let summary = _createElement("div", "purchase_summary");
        let items = _createElement("div", "items");
        summary.appendChild(items);
        for (let item of item_references) {
            let clone = item.cloneNode(true);

            // According to the spec, cloneNode shouldn't be copying event listeners... yet it does in gameface apparently
            clone.removeEventListener("mouseenter", item_on_mouseenter);
            items.appendChild(clone);
        }
        let name = _createElement("div", "name", item_name);
        summary.appendChild(name);
        let price_clone = price.cloneNode(true);
        summary.appendChild(price_clone);

        let btn_cont = _createElement("div", "generic_modal_dialog_action");
        let btn_confirm = _createElement("div", "dialog_button", localize("menu_button_confirm"));
        let btn_cancel = _createElement("div", "dialog_button", localize("menu_button_cancel"));
        _addButtonSounds(btn_confirm, 1);
        _addButtonSounds(btn_cancel, 1);
        btn_confirm.addEventListener("click", function() {
            global_manual_modal_close_disabled = true;

            _empty(btn_cont);

            let processing = _createElement("div", "processing");
            processing.appendChild(_createSpinner());
            processing.appendChild(_createElement("div", "text", localize("processing")));
            btn_cont.appendChild(processing);

            api_request("POST", `/shop/item/${selected_item["shop_item_id"]}/purchase`, {}, purchase_callback);
        });
        btn_cancel.addEventListener("click", closeBasicModal);
        btn_cont.appendChild(btn_confirm);
        btn_cont.appendChild(btn_cancel);

        openBasicModal(basicGenericModal(localize("shop_confirm_purchase"), summary, btn_cont));

        function purchase_callback(data) {
            global_manual_modal_close_disabled = false;

            console.log("purchase_callback", _dump(data));
            if (data.success == false) {
                updateBasicModalContent(basicGenericModal(localize("title_error"), localize("shop_error_"+data.reason), localize("modal_close")));
                engine.call("ui_sound", "ui_window_open");
                return;
    
                // shop_error_item_not_found
                // shop_error_insufficient_funds
                // shop_error_items_already_owned
                // shop_error_transaction_error
            }
    
            if (data.success == true) {
                global_self.private.coins = data.coins;
    
                update_wallet(global_self.private.coins);
    
                add_user_customizations(data.items);
    
                let sorted_items = _sort_customization_items(data.items);
    
                render_shop_item(group_items, item_idx);
                render_shop(global_shop_data);
                
                let content = _createElement("div", "purchase_summary");
                let items = _createElement("div", "items");
                content.appendChild(items);
                for (let item of sorted_items) {
    
                    let type_name = global_customization_type_map[item.customization_type].name;
                    let c_item = _createElement("div", ["customization_item", type_name, "rarity_bg_"+item.rarity]);
                    c_item.appendChild(renderCustomizationInner(item.customization_type, item.customization_id));
                    items.appendChild(c_item);
    
                }
                let msg = _createElement("div", "msg", localize("shop_purchase_success_msg"));
                content.appendChild(msg);
    
                engine.call('ui_sound', "ui_shop_purchase_successful");
    
                updateBasicModalContent(basicGenericModal(localize("shop_purchase_success"), content, localize("modal_close")));
            }

        }

    }

    function show_purchase_gift_modal() {
        // TODO...
    }

}
