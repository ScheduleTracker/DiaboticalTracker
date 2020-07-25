let global_coin_shop_offers = [];

function init_screen_coin_shop() {
    bind_event("set_coins_offers", function(data) {
        try {
            const dataOffers = JSON.parse(data);
            handle_coin_offers_update(dataOffers.offers);
        } catch (e) {
            console.log("set_coin_offers: Error parsing JSON. err=" + e);
        }
    });   
}

function handle_coin_offers_update(offers) {   
    let fragment = new DocumentFragment();
    let cont = _id("coin_shop_options");

    const sortedKeyOffers = Object.keys(offers).sort(
        (i, j) => offers[i].current_price - offers[j].current_price
    );
    for (let offerKey of sortedKeyOffers) {
        const offer = offers[offerKey];
        
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", "bg"));

        let top = _createElement("div", ["top", "category_" + offer.tite]);
        
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

        option.addEventListener("mouseenter", function() {
            bottom.classList.add("hover");
        });
        option.addEventListener("mouseleave", function() {
            bottom.classList.remove("hover");
        });
        option.addEventListener("click", function() {
            engine.call("shop_checkout", offerKey);
        });

        fragment.appendChild(option);
    }

    _empty(cont);
    cont.appendChild(fragment);
}