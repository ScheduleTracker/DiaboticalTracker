! function(e, a) {
    e.ReactIntlLocaleData = e.ReactIntlLocaleData || {}, e.ReactIntlLocaleData.ru = a()
}(this, function() {
    "use strict";
    return [{
        locale: "ru",
        pluralRuleFunction: function(e, a) {
            var t = String(e).split("."),
                r = t[0],
                o = !t[1],
                n = r.slice(-1),
                l = r.slice(-2);
            return a ? "other" : o && 1 == n && 11 != l ? "one" : o && n >= 2 && n <= 4 && (l < 12 || l > 14) ? "few" : o && 0 == n || o && n >= 5 && n <= 9 || o && l >= 11 && l <= 14 ? "many" : "other"
        },
    }, {
        locale: "ru_BY",
        parentLocale: "ru"
    }, {
        locale: "ru_KG",
        parentLocale: "ru"
    }, {
        locale: "ru_KZ",
        parentLocale: "ru"
    }, {
        locale: "ru_MD",
        parentLocale: "ru"
    }, {
        locale: "ru_UA",
        parentLocale: "ru"
    }]
});