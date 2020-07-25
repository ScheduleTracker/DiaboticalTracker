! function(e, t) {
    e.ReactIntlLocaleData = e.ReactIntlLocaleData || {}, e.ReactIntlLocaleData.zh = t()
}(this, function() {
    "use strict";
    return [{
        locale: "zh",
        pluralRuleFunction: function(e, t) {
            return "other"
        },
    }, {
        locale: "zh_Hans",
        parentLocale: "zh"
    }, {
        locale: "zh_Hans_HK",
        parentLocale: "zh_Hans",
    }, {
        locale: "zh_Hans_MO",
        parentLocale: "zh_Hans",
    }, {
        locale: "zh_Hans_SG",
        parentLocale: "zh_Hans",
    }, {
        locale: "zh_Hant",
        pluralRuleFunction: function(e, t) {
            return "other"
        },
    }, {
        locale: "zh_Hant_HK",
        parentLocale: "zh_Hant",
    }, {
        locale: "zh_Hant_MO",
        parentLocale: "zh_Hant_HK"
    }, {
        locale: "zh_CN",
        parentLocale: "zh"
    }, {
        locale: "zh_TW",
        parentLocale: "zh"
    }]
});