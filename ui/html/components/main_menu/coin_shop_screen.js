function init_screen_coin_shop() {

    coin_shop_render_options();

}


function coin_shop_render_options() {
    let cont = _id("coin_shop_options");

    let options = [
        {
            "category": 0,
            "price": "9.99",
            "amount": 1000,
            "bonus": "",
        },
        {
            "category": 1,
            "price": "24.99",
            "amount": 2800,
            "bonus": "12% Bonus",
        },
        {
            "category": 2,
            "price": "39.99",
            "amount": 5000,
            "bonus": "25% Bonus",
        },
        {
            "category": 3,
            "price": "99.99",
            "amount": 13500,
            "bonus": "35% Bonus",
        },
    ];

    
    let fragment = new DocumentFragment();

    for (let o of options) {
        

        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", "bg"));

        let top = _createElement("div", ["top", "category_"+o.category]);
        
        let amount_cont = _createElement("div", "amount_cont");
        amount_cont.appendChild(_createElement("div", "amount", _format_number(o.amount)));
        amount_cont.appendChild(_createElement("div", "label", "Coins"));
        top.appendChild(amount_cont);
        option.appendChild(top);

        let bottom = _createElement("div", "bottom");
        bottom.appendChild(_createElement("div", "price", _format_number(o.price,"currency")));
        option.appendChild(bottom);

        option.addEventListener("mouseenter", function() {
            bottom.classList.add("hover");
        });
        option.addEventListener("mouseleave", function() {
            bottom.classList.remove("hover");
        });

        fragment.appendChild(option);
    }

    _empty(cont);
    cont.appendChild(fragment);
}