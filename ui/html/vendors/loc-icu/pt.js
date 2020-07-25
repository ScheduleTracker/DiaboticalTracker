! function(e, t) {
    e.ReactIntlLocaleData = e.ReactIntlLocaleData || {}, e.ReactIntlLocaleData.pt = t()
}(this, function() {
    "use strict";
    return [{
        locale: "pt",
        pluralRuleFunction: function(e, t) {
            var o = String(e).split(".")[0];
            return t ? "other" : 0 == o || 1 == o ? "one" : "other"
        },
    }, {
        locale: "pt_BR",
        pluralRuleFunction: function(e, t) {
            var s = String(n).split('.'), i = s[0];
            if (ord) return 'other';
            return n >= 0 && n < 2 ? 'one' : 'other';
        },
    }, {        
    }, {
        locale: "pt_AO",
        parentLocale: "pt_PT"
    }, {
        locale: "pt_PT",
        parentLocale: "pt",
    }, {
        locale: "pt_CH",
        parentLocale: "pt_PT"
    }, {
        locale: "pt_CV",
        parentLocale: "pt_PT"
    }, {
        locale: "pt_GQ",
        parentLocale: "pt_PT"
    }, {
        locale: "pt_GW",
        parentLocale: "pt_PT"
    }, {
        locale: "pt_LU",
        parentLocale: "pt_PT"
    }, {
        locale: "pt_MO",
        parentLocale: "pt_PT"
    }, {
        locale: "pt_MZ",
        parentLocale: "pt_PT"
    }, {
        locale: "pt_ST",
        parentLocale: "pt_PT"
    }, {
        locale: "pt_TL",
        parentLocale: "pt_PT"
    }]
});