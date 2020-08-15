/* show new items icon/indicator in the bottom bar too to get to this screen
    when should this screen / the indicator be visible:
        - when a user upgrades his battlepass and unlocks new items
        - when a user buys tiers and unlocks new items
        - when a user buys items in the shop?
        - when a user gets a shop item gifted
        - when a user gets the battlepass gifted
*/

function init_notifications() {
    // /devop ui_call test_battlepass_upgrade_notif
    bind_event("test_battlepass_upgrade_notif", function() {
        global_notifs.addNotification({
            "notif_id": 181,
            "notif_type": 0,
            "from_user_id": null,
            "message": null,
            "items": []
        });
        load_notifications();
    });

    // /devop ui_call test_item_unlock_notif
    bind_event("test_item_unlock_notif", function() {
        global_notifs.addNotification({
            "notif_id": 182,
            "notif_type": 1,
            "from_user_id": null,
            "message": null,
            "items": [
                {
                    "notif_id": 182,
                    "customization_id": "av_smileyblue",
                    "customization_type": 2,
                    "customization_sub_type": "",
                    "customization_set_id": null,
                    "rarity": 0,
                    "amount": 1
                },
                {
                    "notif_id": 183,
                    "customization_id": "av_smileyred",
                    "customization_type": 2,
                    "customization_sub_type": "",
                    "customization_set_id": null,
                    "rarity": 0,
                    "amount": 1
                },
                {
                    "notif_id": 184,
                    "customization_id": "av_smileyorange",
                    "customization_type": 2,
                    "customization_sub_type": "",
                    "customization_set_id": null,
                    "rarity": 0,
                    "amount": 1
                }
            ]
        });
        load_notifications();
    });
}

function load_notifications() {
    let notif = global_notifs.getNotification();
    if (!notif) return;

    // Hide the menu
    let menu = _id("lobby_container");
    anim_hide(menu, 100);

    console.log(_dump(notif), _dump(global_user_battlepass));
    let content = _createElement("div", "notif_content");

    let title = '';
    if (notif.notif_type in NOTIFICATION_TYPE) {
        
        if (NOTIFICATION_TYPE[notif.notif_type] == "battlepass" || NOTIFICATION_TYPE[notif.notif_type] == "gift_battlepass") {
            title = localize("notification_title_battlepass");
        } else if (NOTIFICATION_TYPE[notif.notif_type] == "battlepass_items" || NOTIFICATION_TYPE[notif.notif_type] == "gift_item") {
            title = localize("notification_title_battlepass_items");
        } else {
            title = localize("notification_title_"+NOTIFICATION_TYPE[notif.notif_type]);
        }
        
    }

    let title_div = _createElement("div", "notif_title", title);
    content.appendChild(title_div);

    if (notif.notif_type in NOTIFICATION_TYPE) {
        if (NOTIFICATION_TYPE[notif.notif_type] == "twitch_drop") {
            // "Thank you for watching Diabotical!" message
            let message = _createElement("div", "notif_message", localize("notification_msg_twitch_drop"));
            content.appendChild(message);
        }
        /*
        if (notif.message != null && ['gift_battlepass', 'gift_item'].includes(NOTIFICATION_TYPE[notif.notif_type])) {
            let message = _createElement("div", "notif_message", notif.message);
            content.appendChild(message);
        }
        */
    }

    let item_preview = _createElement("div", "item_preview");
    content.appendChild(item_preview);

    let notif_video = null;

    let item_desc = _createElement("div", "item_desc");
    content.appendChild(item_desc);

    if (notif.notif_type in NOTIFICATION_TYPE) {
        if (['battlepass', 'gift_battlepass'].includes(NOTIFICATION_TYPE[notif.notif_type])) {
            notif_video = _createElement("video", "battlepass_upgrade");
            notif_video.src = "/html/animations/battlepass_upgrade.webm";
            item_preview.appendChild(notif_video);

            if (global_user_battlepass.battlepass_id && global_user_battlepass.battlepass_id in global_battlepass_data) {
                item_desc.classList.remove("item");
                item_desc.appendChild(_createElement("div", "battlepass_name", localize(global_battlepass_data[global_user_battlepass.battlepass_id].title)));
            }
            
        }
        if (['gift_item', 'battlepass_items', 'twitch_drop'].includes(NOTIFICATION_TYPE[notif.notif_type])) {
            if (notif.items) render_item(notif.items.shift());
        }
    }
    

    let buttons = _createElement("div", "buttons");
    let btn_confirm = _createElement("div", ["db-btn", "plain"], localize("menu_button_confirm"));
    buttons.appendChild(btn_confirm);
    _addButtonSounds(btn_confirm, 1);

    let btn_confirm_all = undefined;

    if (notif.items && notif.items.length > 0) {
        btn_confirm_all = _createElement("div", ["db-btn", "plain"], localize("menu_button_confirm_all"));
        buttons.appendChild(btn_confirm_all);
        _addButtonSounds(btn_confirm_all, 1);

        btn_confirm.addEventListener("click", confirm_next);
        btn_confirm_all.addEventListener("click", confirm_done);
    } else {
        btn_confirm.addEventListener("click", confirm_done);
    }
    content.appendChild(buttons);

    let count = _createElement("div", "count");
    if (notif.items && notif.items.length > 0) {
        let item_count = _createElement("div", "item_count");
        item_count.appendChild(_createElement("div", "remaining", localize("items_remaining")));
        item_count.appendChild(count);
        count.textContent = notif.items.length;
        content.appendChild(item_count);
    }

    let delayed_anim = null;

    function render_item(item) {
        if (!item) return;

        // show 3d or 2d preview of item
        _empty(item_preview);
        //item_preview.appendChild(createCustomizationPreview(item));
        let ctype = new CustomizationType(global_customization_type_map[item.customization_type].name, item.customization_sub_type);
        show_customization_preview_scene("notification", ctype, item.customization_id, item, item_preview);
        
        // show customization info as the item description
        _empty(item_desc);
        item_desc.style.setProperty("--rarity", "var(--rarity_"+item.rarity+")");
        item_desc.classList.add("item");
        item_desc.appendChild(createCustomizationInfo(item));

        //engine.call('ui_sound', "ui_shop_purchase_successful");
    }

    function confirm_next() {
        if (delayed_anim !== null) clearTimeout(delayed_anim);

        if (notif.items && notif.items.length) {
            render_item(notif.items.shift());

            if (notif.items.length > 0) {
                count.textContent = notif.items.length;
            } else {
                count.parentElement.style.opacity = 0;
                if (btn_confirm_all) btn_confirm_all.style.display = "none";
            }
        } else {
            confirm_done();
        }
    }

    function confirm_done() {
        if (delayed_anim !== null) clearTimeout(delayed_anim);

        send_string(CLIENT_COMMAND_DEL_NOTIFICATION, notif.notif_id);

        if (global_notifs.getNotificationCount() > 0) {
            // load the next notification
            load_notifications();
        } else {
            // Show the menu again
            anim_show(menu, 100);

            // notification screen doesn't add a history entry, so this should move us back to the previously active page
            historyOnPopState(global_history.current());

        }
    }

    let notif_screen = _id("notification_screen");
    _empty(notif_screen);
    notif_screen.appendChild(content);

    open_notifications();

    if (notif_video != null) {
        delayed_anim = setTimeout(function() {

            if (['battlepass', 'gift_battlepass'].includes(NOTIFICATION_TYPE[notif.notif_type])) {
                engine.call('ui_sound', "ui_battlepass_upgrade");
            }

            notif_video.play();

        }, 500);
    }
}

class NotificationQueue {
    constructor() {
        this.queue = [];
    }

    addNotification(notif) {
        this.queue.push(notif);
    }

    getNotification() {
        return this.queue.shift();
    }

    getNotificationCount() {
        return this.queue.length;
    }
}

var global_notifs = new NotificationQueue();