! function(e, o) {
    e.ReactIntlLocaleData = e.ReactIntlLocaleData || {}, e.ReactIntlLocaleData.it = o()
}(this, function() {
    "use strict";
    return [{
        locale: "it",
        pluralRuleFunction: function(e, o) {
            var t = !String(e).split(".")[1];
            return o ? 11 == e || 8 == e || 80 == e || 800 == e ? "many" : "other" : 1 == e && t ? "one" : "other"
        },
    }, {
        locale: "it_CH",
        parentLocale: "it"
    }, {
        locale: "it_SM",
        parentLocale: "it"
    }, {
        locale: "it_VA",
        parentLocale: "it"
    }]
});