function load_battlepass_upgrade() {
    let bp_buttons = _id("battlepass_upgrade_buttons");
    bp_buttons.style.display = "none";

    let bp_icon = _id("battlepass_upgrade_icon");

    // Hack: re-insert the element to reset the animation
    var elm = bp_icon;
    var newone = elm.cloneNode(true);
    elm.parentNode.replaceChild(newone, elm);

    setTimeout(function() {
        anim_show(bp_buttons, 600);
    }, 300);
}

function updateBattlepassUpgrade(bp) {
    if (!(bp.battlepass_id in global_battlepass_data)) return;

    let background = _id("battlepass_upgrade_background");
    if (global_battlepass_data[bp.battlepass_id]["fullscreen-image"].length) background.style.backgroundImage = "url("+global_battlepass_data[bp.battlepass_id]["fullscreen-image"]+")";

    let bp_icon = _id("battlepass_upgrade_icon");
    bp_icon.style.backgroundImage = "url("+_bp_icon(bp.battlepass.battlepass_id, true)+")";
    
    if (bp && bp.price_basic) global_battlepass_data[bp.battlepass_id].price_basic = bp.price_basic;
    if (bp && bp.price_basic) global_battlepass_data[bp.battlepass_id].price_bundle = bp.price_bundle;

    let btn_basic = _id("battlepass_buy_basic");
    let btn_bundle = _id("battlepass_buy_bundle");

    _empty(btn_basic);
    _empty(btn_bundle);

    let price_basic_el = _createElement("div", "price");
    price_basic_el.appendChild(_createElement("div", ["icon", "reborn-coin"]));
    price_basic_el.appendChild(_createElement("div", "value", _format_number(global_battlepass_data[bp.battlepass_id].price_basic)));
    btn_basic.appendChild(price_basic_el);

    let price_bundle_el = _createElement("div", "price");
    price_bundle_el.appendChild(_createElement("div", ["icon", "reborn-coin"]));
    price_bundle_el.appendChild(_createElement("div", "value", _format_number(global_battlepass_data[bp.battlepass_id].price_bundle)));
    btn_bundle.appendChild(price_bundle_el);

    let orig_bundle_price = global_battlepass_data[bp.battlepass_id].price_level * 25 + global_battlepass_data[bp.battlepass_id].price_basic;
    let price_bundle_el_orig = _createElement("div", "orig_price");
    price_bundle_el_orig.appendChild(_createElement("div", "value", _format_number(orig_bundle_price)));
    price_bundle_el_orig.appendChild(_createElement("div", "strikethrough"));
    btn_bundle.appendChild(price_bundle_el_orig);

    let option_basic = _id("battlepass_upgrade_buy_basic");
    let option_bundle = _id("battlepass_upgrade_buy_bundle");

    if (global_battlepass_data[bp.battlepass_id].hasOwnProperty("bp-color") && global_battlepass_data[bp.battlepass_id]["bp-color"].length) {
        option_basic.style.backgroundColor = global_battlepass_data[bp.battlepass_id]["bp-color"];
        option_bundle.style.backgroundColor = global_battlepass_data[bp.battlepass_id]["bp-color"];
    }

    option_basic.addEventListener("click", function() {
        if (global_self.private.coins >= global_battlepass_data[bp.battlepass_id].price_basic) {
            battlepass_buy_modal("basic");
        } else {
            genericModal(localize("shop_insufficient_funds"), localize("shop_error_insufficient_funds"), localize("menu_button_cancel"), undefined, localize("shop_get_coins"), open_coin_shop);
        }
    });
    option_bundle.addEventListener("click", function() {
        if (global_self.private.coins >= global_battlepass_data[bp.battlepass_id].price_bundle) {
            battlepass_buy_modal("bundle");
        } else {
            genericModal(localize("shop_insufficient_funds"), localize("shop_error_insufficient_funds"), localize("menu_button_cancel"), undefined, localize("shop_get_coins"), open_coin_shop);
        }
    });

    function battlepass_buy_modal(type) {
        let summary = _createElement("div", "battlepass_purchase_summary");
        if (type == "basic")  summary.appendChild(_createElement("div", "desc", localize("shop_battlepass")));
        if (type == "bundle") summary.appendChild(_createElement("div", "desc", localize("shop_battlepass_bundle")));
        let level_icon = _createElement("div", ["bp_level_icon", "paid"]);
        level_icon.style.backgroundImage = "url("+_bp_icon(bp.battlepass_id, true)+")";
        summary.appendChild(level_icon);
        if (type == "basic")  summary.appendChild(price_basic_el.cloneNode(true));
        if (type == "bundle") summary.appendChild(price_bundle_el.cloneNode(true));

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
            
            api_request("POST", `/shop/battlepass/${type}/purchase`, {}, battlepass_purchase_callback);

        });
        btn_cancel.addEventListener("click", closeBasicModal);
        btn_cont.appendChild(btn_confirm);
        btn_cont.appendChild(btn_cancel);

        openBasicModal(basicGenericModal(localize("shop_confirm_purchase"), summary, btn_cont));
    }

    function battlepass_purchase_callback(data) {
        global_manual_modal_close_disabled = false;

        //console.log("battlepass_purchase_callback", _dump(data));
        if (data === null) {
            updateBasicModalContent(basicGenericModal(localize("title_error"), localize("shop_error_generic"), localize("modal_close")));
            return;
        }

        if (data.success == false) {
            updateBasicModalContent(basicGenericModal(localize("title_error"), localize("shop_error_"+data.reason), localize("modal_close")));
            return;

            // shop_error_no_active_bp_found
            // shop_error_bp_already_owned
            // shop_error_bp_not_available
            // shop_error_insufficient_funds
            // shop_error_transaction_error
        }

        if (data.success == true) {
            closeBasicModal();

            global_self.private.coins = data.coins;

            update_wallet(global_self.private.coins);

            global_user_battlepass.battlepass.owned = true;
            global_user_battlepass.battlepass.level = data.level;
            global_user_battlepass.battlepass.xp    = data.xp;
            global_user_battlepass.battlepass.seen  = true;
            global_user_battlepass.progression      = data.progression;

            updateMenuBottomBattlepass(global_user_battlepass);

            if (data.notifs.length) {
                for (let n of data.notifs) {
                    global_notifs.addNotification(n);

                    if (n.items && n.items.length) {
                        add_user_customizations(n.items);
                    }
                }

                load_notifications();
            } else {
                // This should never actually occur... but just in case
                open_battlepass();
            }
        }
    }
}
