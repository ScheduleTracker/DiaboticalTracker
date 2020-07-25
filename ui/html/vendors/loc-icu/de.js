! function(e, t) {
    e.ReactIntlLocaleData = e.ReactIntlLocaleData || {}, e.ReactIntlLocaleData.de = t()
}(this, function() {
    "use strict";
    return [{
        locale: "de",
        pluralRuleFunction: function(e, t) {
            var n = !String(e).split(".")[1];
            return t ? "other" : 1 == e && n ? "one" : "other"
        },
    }, {
        locale: "de_AT",
        parentLocale: "de"
    }, {
        locale: "de_BE",
        parentLocale: "de"
    }, {
        locale: "de_CH",
        parentLocale: "de"
    }, {
        locale: "de_IT",
        parentLocale: "de"
    }, {
        locale: "de_LI",
        parentLocale: "de"
    }, {
        locale: "de_LU",
        parentLocale: "de"
    }]
});