let global_coin_shop_offers_loaded = false;
let global_coin_shop_offers = {};
let global_coin_shop_is_rendered = false;

const global_coin_packs = {
    // Coins Level 1 500
    "9fd5168913d04eb2b9afdd722cfe7929": {
        "extra": 0,
        "image": "/html/images/coins/coin_option_1.png.dds",
    },
    // Coins Level 2 1700
    "9bccc75b097e47c5b49e3fb8bd78652b": {
        "extra": 13,
        "image": "/html/images/coins/coin_option_2.png.dds",
    },
    // Coins Level 3 3750
    "480a137bf2214faeb233be6aefa92599": {
        "extra": 25,
        "image": "/html/images/coins/coin_option_3.png.dds",
    },
    // Coins Level 4 8100
    "9bfa21b7b6994da59f74e8a816fcd026": {
        "extra": 35,
        "image": "/html/images/coins/coin_option_4.png.dds",
    },
};

// Coin pack offer id -> Item pack offer id mapping
// The coin shop shows these item pack offerings that cost the same amount as the equivalent coin packs, give the same coins but also add items on top, these can only be bought once
// After buying an item pack offer here its not going to be listed anymore and the coin pack is shown instead
const global_coin_pack_map = {
    // 500 Coin Pack -> Starter Pack
    "9fd5168913d04eb2b9afdd722cfe7929": "ab206b19926347b1b2b4daeb301d23f5",
    // 1700 Coin Pack -> Standard Pack
    "9bccc75b097e47c5b49e3fb8bd78652b": "299df8725b6a47518493bf0325f402e7",
    // 3750 Coin Pack -> Big Pack
    "480a137bf2214faeb233be6aefa92599": "9cbd99d29eda471a83cf4654a69f2468",
    // 8100 Coin Pack -> Fan Pack
    "9bfa21b7b6994da59f74e8a816fcd026": "f13ea94a77d0401f93b5569eea33c32f",
};

// The list of eos real money offer item packs that should not show up in the item shop because they are exclusively for the coin shop
// These shouldn't really ever change, same as the coin options
const global_coin_item_packs = [
    "ab206b19926347b1b2b4daeb301d23f5", // Starter Pack
    "299df8725b6a47518493bf0325f402e7", // Standard Pack
    "9cbd99d29eda471a83cf4654a69f2468", // Big Pack
    "f13ea94a77d0401f93b5569eea33c32f", // Fan Pack
];

function handle_coin_offers_update(offers) {
    global_coin_shop_offers = offers;
    global_coin_shop_offers_loaded = true;
}

function load_coin_shop() {
    let fetch_shop = false;
    if (global_shop_raw_data === null) {
        fetch_shop = true;
    }

    // The shop data is currently being requested
    if (global_shop_is_loading) {
        // Try again in 100ms
        setTimeout(load_coin_shop, 100);
        return;
    }
    
    if (fetch_shop) {
        load_shop_data(load_coin_shop);
    } else {
        if (!global_coin_shop_is_rendered && global_coin_shop_offers_loaded) {
            render_coin_shop();
        }
    }
}

// Item pack eos offer id -> shop item pack object map
let coin_shop_item_pack_lookup = {};
function render_coin_shop() {
    global_coin_shop_is_rendered = true;

    let cont = _id("coin_shop_options");
    _empty(cont);

    if (global_shop_raw_data.hasOwnProperty("packs")) {
        for (let pack of global_shop_raw_data.packs) {
            if (pack.eos_offer_id in global_coin_shop_offers) {
                coin_shop_item_pack_lookup[pack.eos_offer_id] = pack;
            }
        }
    }

    const sortedKeyOffers = Object.keys(global_coin_shop_offers).sort(
        (i, j) => global_coin_shop_offers[i].current_price - global_coin_shop_offers[j].current_price
    );

    let shop_group = _createElement("div", "shop_group");
    let container = _createElement("div", "container");
    shop_group.appendChild(container);
    cont.appendChild(shop_group);

    for (let offerKey of sortedKeyOffers) {
        const offer = global_coin_shop_offers[offerKey];

        // Filter out packs different of coin packs using the purchase_limit
        // as criteriar. purchase_limit equals 1 are durable
        if (offer.purchase_limit === 1) continue;

        let item_pack = false;
        // Check if there is a linked item pack for this Coin Pack
        if (offerKey in global_coin_pack_map) {

            // Check if we have shop data for this item pack
            if (global_coin_pack_map[offerKey] in coin_shop_item_pack_lookup) {

                // Check if we already own this item pack
                if (!is_shop_item_owned(coin_shop_item_pack_lookup[global_coin_pack_map[offerKey]])) {
                    // set item pack to be rendered
                    item_pack = coin_shop_item_pack_lookup[global_coin_pack_map[offerKey]];
                }
            }
        }

        // Uncomment to test coin packs only
        //item_pack = false;

        // Uncomment to test item packs only
        //item_pack = coin_shop_item_pack_lookup[global_coin_pack_map[offerKey]];

        if (item_pack !== false) {
            // Render an item pack
            container.appendChild(new ShopGroup([item_pack], "coin_shop").container);
        } else {
            // Render a coin pack
            container.appendChild(render_coin_offer(offerKey, offer));
        }
    }

}


function render_coin_offer(offerKey, offer) {
    let fragment = new DocumentFragment();

    let option = _createElement("div", "option");
    _addButtonSounds(option, 1);

    let bg = _createElement("div", "bg");
    bg.appendChild(_createElement("div", "inner_bg"));
    option.appendChild(bg);

    let top = _createElement("div", ["top", "category_" + offer.title]);
    let image = null;
    if (offerKey in global_coin_packs && global_coin_packs[offerKey].image.length) {
        image = _createElement("div", "image");
        image.style.backgroundImage = "url("+global_coin_packs[offerKey].image+")";
        top.appendChild(image);
    }
    
    let amount_cont = _createElement("div", "amount_cont");
    //amount_cont.appendChild(_createElement("div", "amount", _format_number(offer)));
    amount_cont.appendChild(_createElement("div", "label", offer.title));
    top.appendChild(amount_cont);
    option.appendChild(top);

    let bottom = _createElement("div", "bottom");
    bottom.appendChild(
        _createElement("div", "price", _format_number(offer.current_price, "currency", {
            currency_code: offer.currency_code,
            areCents: true
        }))
    );
    option.appendChild(bottom);

    if (offerKey in global_coin_packs) {
        if (global_coin_packs[offerKey].extra > 0) {
            option.appendChild(_createElement("div", "tag", localize_ext("shop_coins_extra", {"count": global_coin_packs[offerKey].extra})));
        }
    }

    option.addEventListener("mouseenter", function() {
        if (image !== null) image.classList.add("hover");
    });
    option.addEventListener("mouseleave", function() {
        if (image !== null) image.classList.remove("hover");
    });
    option.addEventListener("click", function() {
        engine.call("eos_checkout", offerKey);
    });

    fragment.appendChild(option);

    return fragment;
}