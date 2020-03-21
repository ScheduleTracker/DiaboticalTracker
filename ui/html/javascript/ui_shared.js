let onevw_float = window.outerWidth / 100;
let onevh_float = window.outerHeight / 100;
let onevw = Math.floor(onevw_float);
let onevh = Math.floor(onevh_float);
document.documentElement.style.setProperty('--onevw', Math.floor(window.outerWidth / 100));
document.documentElement.style.setProperty('--onevh', Math.floor(window.outerHeight / 100));
document.documentElement.style.setProperty('--zero-onevw', (onevw / 10));
document.documentElement.style.setProperty('--zero-onevh', (onevh / 10));
document.documentElement.style.setProperty('--zero-onevw-rounded', ((onevw / 10) < 1) ? 1 : Math.floor(onevw / 10));
document.documentElement.style.setProperty('--zero-onevh-rounded', ((onevh / 10) < 1) ? 1 : Math.floor(onevh / 10));

let editor_valid_advanced_rules = ["background-color", "background-image", "transform", "color", "border", "outline", "box-shadow", "text-shadow", "opacity", "filter"];

let global_arguments = [];

let global_language = "en";
let global_translations = {};
let global_countries = {};

let global_crosshair_map = {};
let global_crosshair_zoom_map = {};
let global_crosshair_hitmarker_map = {};
let global_crosshair_hitmarker_zoom_map = {};
let global_mask_map = {};
let global_mask_zoom_map = {};

// CUSTOM DATA BINDING HANDLER FOR BORDER COLOR
class BorderColorHandler {
    init(element, value) {
        /// This will be executed only once per element when the attribute attached to it is bound with a model.
        /// Set up any initial state, event handlers, etc. here.
        element.style.borderColor = value;
    }
    deinit(element) {
        /// This will be executed only once per element when the element is detached from the DOM.
        /// Clean up state, event handlers, etc. here.
    }
    update(element, value) {
        /// This will be executed everytime that the model which the attribute is attached to is synchronized.
        element.style.borderColor = value;
    }
}

// More dynamic translations with variables for data-bind-if elements (elements or children of elements that aren't always in the DOM)
// <span data-bind-i18n="'ingame_status_unready:'+{{battle_data.ready_key}}"></span>
// NOTE: this actually really only works if the value has a model property in it, otherwise it would never get updated because they only ever get updated with a model change
let global_ready_key = undefined;
class i18nHandler {
    init(element, value) {
        this.handler(element, value);
    }
    deinit(element) { }
    update(element, value) {
        this.handler(element, value);
    }

    handler(element, value) {
        if (value.indexOf(':') > -1) {
            let res = value.split(':');
            let bind = res[1];

            // Bit of a hack to translate a data bound string like "Press <bind> to ready up" where other languages might have the key in different positions, and the key needs to be highlighted
            if (res[0] == "ingame_status_unready") {

                if (element.hasChildNodes() && bind == global_ready_key) return;
                global_ready_key = bind;

                let msg = localize_ext(res[0], { "value": bind });
                let pos = msg.indexOf(bind);
                
                let fragment = new DocumentFragment();
                if (pos > 0) fragment.appendChild(_createElement("span","",msg.substring(0,pos).trim()));
                fragment.appendChild(_createElement("span","hl",bind));
                if (msg.length > pos+bind.length) fragment.appendChild(_createElement("span","",msg.substring(pos+bind.length).trim()));

                _empty(element);
                element.appendChild(fragment);
                
            } else {
                element.textContent = localize_ext(res[0], { "value": res[1] });
            }
        } else {
            element.textContent = localize(value);
        }
    }
}


// CUSTOM DATA BINDING HANDLER TO SET ELEMENT PROPERTIES
class PropertyHandler {
    init(element, value) {
        let data = value.split(":");
        if (data.length == 2) { element.style.setProperty(data[0], data[1]); }
    }
    deinit(element) {}
    update(element, value) {
        let data = value.split(":");
        if (data.length == 2) { element.style.setProperty(data[0], data[1]); }
    }
}

class DatasetHandler {
    init(element, value) {
        let data = value.split(":");
        if (data.length == 2) { element.dataset[data[0]] = data[1]; }
    }
    deinit(element) {}
    update(element, value) {
        let data = value.split(":");
        if (data.length == 2) { element.dataset[data[0]] = data[1]; }
    }
}

bind_event("Ready", function() {
    engine.registerBindingAttribute("border-color", BorderColorHandler);
    engine.registerBindingAttribute("i18n", i18nHandler);
    engine.registerBindingAttribute("property", PropertyHandler);
    engine.registerBindingAttribute("dataset", DatasetHandler);
});


global_shared_onload_callbacks.push(function() {

    bind_event('set_arguments', function (json) {
        try {
            global_arguments = JSON.parse(json);
        } catch(e) {
            console.log("Error parsing arguments JSON. err=" + e);
        }
    });

    bind_event("set_crosshair", function (zoom, weapon_index, crosshair, type, extra) {
        //console.log("set_crosshair event", zoom, weapon_index, crosshair, type, extra);
        let extra_arr = JSON.parse(extra);
        let color = extra_arr[0];
        let size = extra_arr[1];
        let stroke_color = extra_arr[2];
        let stroke_width = extra_arr[3];
        let hit_style = extra_arr[7];
        let hit_color = extra_arr[8];
        let opacity = 1;
        let stroke_opacity = 1;
        if (color.length == 8) {
            opacity = Math.round((parseInt(color.substring(6, 8), 16) / 255) * 100) / 100;
            color = color.substring(0, 6);
        }
        if (stroke_color.length == 8) {
            stroke_opacity = Math.round((parseInt(stroke_color.substring(6, 8), 16) / 255) * 100) / 100;
            stroke_color = stroke_color.substring(0, 6);
        }

        var preview = weapon_index == -1;
        var zoom_suffix = zoom ? "_zoom" : "";

        var selector = "";
        var selector_hitmarkers = "";
        if (preview) {
            selector =
                "#editing_crosshairs_content" + zoom_suffix + " .crosshair" + crosshair + ", " +
                "#preview_crosshairs_content" + zoom_suffix + " .crosshair" + crosshair;
        } else {
            // If the crosshairs for this weapon id don't exist yet, create them.
            let crosshairs_container = _id("game_crosshair_box_" + weapon_index + zoom_suffix);
            if (!crosshairs_container) {
                let new_div = _createElement("div", "game_crosshair_box" + zoom_suffix);
                new_div.style.display = "none";
                new_div.id = "game_crosshair_box_" + weapon_index + zoom_suffix;
                new_div.appendChild(_createElement("div", ["crosshair1", "crosshair"]));
                new_div.appendChild(_createElement("div", ["crosshair2", "crosshair"]));
                new_div.appendChild(_createElement("div", ["crosshair3", "crosshair"]));

                // Add the crosshairs to the container
                let container = _id("game_crosshairs_container" + zoom_suffix);
                if (container) {
                    container.appendChild(new_div);
                    if (zoom) global_crosshair_zoom_map[weapon_index] = new_div;
                    else global_crosshair_map[weapon_index] = new_div;
                }
                // Add the hitmarker crosshairs to the container
                let container_hitmarker = _id("game_crosshairs_container_hitmarker" + zoom_suffix);
                if (container_hitmarker) {
                    let hitmarker = new_div.cloneNode(true);
                    hitmarker.classList.add("hitmarker");
                    container_hitmarker.appendChild(hitmarker);
                    if (zoom) global_crosshair_hitmarker_zoom_map[weapon_index] = hitmarker;
                    else global_crosshair_hitmarker_map[weapon_index] = hitmarker;
                }
            }
            selector = "#game_crosshair_box_" + weapon_index + zoom_suffix + " .crosshair" + crosshair;
            selector_hitmarkers = "#game_crosshair_box_" + weapon_index + zoom_suffix + " .crosshair" + crosshair;
        }

        var elements = document.querySelectorAll(selector, selector_hitmarkers);
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            //NOTE that type 0 means no crosshair
            if (type) {
                let fill = _format_color_for_url(color);
                let show_hitmarker = false;
                if (element.parentElement.classList.contains("hitmarker")) {
                    if (hit_color.length == 8) hit_color = hit_color.substring(6) + hit_color.substring(0,6); //bandaid for hitcolor being read as AARRGGBB
                    fill = _format_color_for_url(hit_color);
                    stroke_opacity = 1;
                    opacity = 1;
                    show_hitmarker = true;
                }

                let render_crosshair = true;
                if (show_hitmarker && hit_style == "0") render_crosshair = false;

                if (render_crosshair) {
                    let cross_string = '/html/images/crosshairs/ch_'+type+'.svg?fill='+fill+
                                                                            '&stroke='+_format_color_for_url(stroke_color)+
                                                                            '&stroke-width='+stroke_width+
                                                                            '&stroke-opacity='+stroke_opacity+
                                                                            '&fill-opacity='+opacity+
                                                                            '&paint-order=stroke%20fill';
                    if (element.children.length) {
                        element.children[0].src = cross_string;
                        element.children[0].style.transform = 'scale('+size.toFixed(2)+')';
                    } else {
                        let img = _createElement("img");
                        img.src = cross_string;
                        img.style.transform = 'scale('+size.toFixed(2)+')';
                        _empty(element);
                        element.appendChild(img);
                    }
                    element.style.display = "flex";
                    element.style.width = "100%";
                } else {
                    if (element.children.length) {
                        _empty(element);
                    }
                }
            } else {
                element.style.display = "none";
            }
        }
        
        {
            let mask = undefined;
            if (zoom && weapon_index in global_mask_zoom_map) 
                mask = global_mask_zoom_map[weapon_index];
            else if (!zoom && weapon_index in global_mask_map) 
                mask = global_mask_map[weapon_index];
            
	        if (!mask) {
                let new_div = _createElement("div");
	            let container = _id("game_masks_container" + zoom_suffix);
	            if (container) {
                    container.appendChild(new_div);
                    if (zoom) { 
                        global_mask_zoom_map[weapon_index] = new_div;
                        mask = global_mask_zoom_map[weapon_index];
                    } else {
                        global_mask_map[weapon_index] = new_div;
                        mask = global_mask_map[weapon_index];
                    }
	            }
            }
            
            function make_side_shade_boxes(el) {
                _empty(el);
                var box_one = _createElement("div", ["box", "box1"]);
                var box_two = _createElement("div", ["box", "box2"]);
                el.appendChild(box_one);
                el.appendChild(box_two);                
            }
            
	        if (mask && extra_arr.length >= 7) {
                let mask_color    = "#" + extra_arr[5];
                let mask_diameter = extra_arr[6] + "vh";
                let mask_shade    = (extra_arr[4]=="pillarbox") ? Math.max(0,(50-0.5*extra_arr[6]*window.innerHeight/window.innerWidth)) + "vw" : Math.max(0,(50-0.5*extra_arr[6])) + "vh";

                mask.className = "mask_"+extra_arr[4];
                mask.style.setProperty('--game_mask_colour'           , mask_color);
                mask.style.setProperty('--game_mask_aperture_diameter', mask_diameter);
                mask.style.setProperty('--sidemask_shade_size'        , mask_shade);
                mask.style.setProperty('--game_mask_custom_aperture'  , 'url("/html/images/custom_mask/' + weapon_index + zoom_suffix + '.png")');
                make_side_shade_boxes(mask);
            }
            
	    }
        
    });


    bind_event("set_egs_language", function(locale) {
        console.log("set language", locale);
        engine.call("echo", "Language: " + locale);

        var langCodes = {
            "en-gb": "en",
            "en-us": "en",
            "en-au": "en",
            "zh-tw": "zh_TW",
            "zh-cn": "zh_CN",
            "zh-hans": "zh_CN",
            "zh-hant": "zh_TW",
            "it": "it",
            "ja": "ja",
            "ru": "ru",
            "es-es": "es_ES",
            "es-mx": "es_MX",
            "fr": "fr",
            "pt-br": "pt_BR",
            "de": "de"
        };

        let global_language = "en";
        if (locale.toLowerCase() in langCodes) global_language = langCodes[locale.toLowerCase()];

        if (global_language == "zh_TW") {
            global_translations = TRANSLATION_zh_TW;
            global_countries = COUNTRIES_tw;
            numeral.locale('chs');
        } else if (global_language == "zh_CN") { 
            global_translations = TRANSLATION_zh_CN;
            global_countries = COUNTRIES_cn;
            numeral.locale('chs');
        } else if (global_language == "ja") { 
            global_translations = TRANSLATION_ja;
            global_countries = COUNTRIES_ja;
            numeral.locale('ja');
        } else if (global_language == "it") { 
            global_translations = TRANSLATION_it;
            global_countries = COUNTRIES_it;
            numeral.locale('it');
        } else if (global_language == "ru") { 
            global_translations = TRANSLATION_ru;
            global_countries = COUNTRIES_ru;
            numeral.locale('ru');
        } else if (global_language == "es_ES") { 
            global_translations = TRANSLATION_es_ES;
            global_countries = COUNTRIES_es;
            numeral.locale('es');
        } else if (global_language == "es_MX") { 
            global_translations = TRANSLATION_es_MX;
            global_countries = COUNTRIES_es;
            numeral.locale('es');
        } else if (global_language == "fr") { 
            global_translations = TRANSLATION_fr;
            global_countries = COUNTRIES_fr;
            numeral.locale('fr');
        } else if (global_language == "pt_BR") { 
            global_translations = TRANSLATION_pt_BR;
            global_countries = COUNTRIES_br;
            numeral.locale('br');
        } else if (global_language == "de") { 
            global_translations = TRANSLATION_de;
            global_countries = COUNTRIES_de;
            numeral.locale('de');
        } else { 
            global_translations = TRANSLATION_en;
            global_countries = COUNTRIES_en;
            // Use default number locale
            //numeral.locale('en-gb');
        }

        // change the main font variable in :root (documentElement) for some language to avoid baseline issues when mixed fonts are used
        if (["zh_TW", "zh_CN", "ja"].includes(global_language)) {
            let noto = getComputedStyle(document.documentElement).getPropertyValue('--noto-font');
            document.documentElement.style.setProperty('--main-font', noto);
        }

        i18next.init(
            {
                lng: global_language,
                fallbackLng: "en",
                resources: {
                    en:    { translation: TRANSLATION_en },
                    zh_TW: { translation: TRANSLATION_zh_TW },
                    zh_CN: { translation: TRANSLATION_zh_CN },
                    ja:    { translation: TRANSLATION_ja },
                    it:    { translation: TRANSLATION_it },
                    ru:    { translation: TRANSLATION_ru },
                    es_ES: { translation: TRANSLATION_es_ES },
                    es_MX: { translation: TRANSLATION_es_MX },
                    fr:    { translation: TRANSLATION_fr },
                    pt_BR: { translation: TRANSLATION_pt_BR },
                    de:    { translation: TRANSLATION_de }
                },
                saveMissing: true, 
                parseMissingKeyHandler: function(key) {
                    console.log("missing language key",key);
                    return key;
                },
            },
            function (err, t) {
                // https://github.com/mthh/loc-i18next
                // the loc-i18n library was modified to search for all child elements with the class i18n as gameface doesn't support querySelectorAll with data attributes ([data-i18n])
                
                const localize_all = locI18next.init(i18next, {
                    useOptionsAttr: true,
                    parseDefaultValueFromContent: false
                });
                localize_all("body");
            }
        );
    });
});

function localize_country(country) {
    if (country in global_countries) return global_countries[country];
    console.log("missing country localization "+country);

    // Fallback to english
    if (country in COUNTRIES_en) return COUNTRIES_en[country];
    return country
}

function localize(key) {
    if (key in global_translations) return global_translations[key];
    console.log("missing language key "+key);

    // Fallback to english
    if (key in TRANSLATION_en) return TRANSLATION_en[key];
    return key;
}

function localize_ext(key, params) {
    params["interpolation"] = { "escapeValue": false };
    return i18next.t(key, params);
}



function button_game_over_quit() {
    engine.call("game_over_quit");
}

function renderCustomizationInner(type, id) {
    let inner = _createElement("div", ["customization_preview", type]);

    if (type == "sticker") {
        inner.style.backgroundImage = "url("+_stickerUrl(id)+")";
    } else {
        inner.style.backgroundImage = "url("+_customizationUrl(type, id)+")";
    }

    return inner;
}

function setupMenuSoundListeners() {
    _for_each_in_class("click-sound", function(el){
        el.addEventListener("mousedown", _play_click1);
    });
    _for_each_in_class("click-sound2", function(el){
        el.addEventListener("mousedown", _play_click1);
    });
    _for_each_in_class("button", function(el){
        el.addEventListener("mousedown", _play_click1);
    });
    _for_each_in_class("box", function(el){
        el.addEventListener("mousedown", _play_click1);
    });
    _for_each_in_class("click-back1", function(el){
        el.addEventListener("mousedown", _play_click_back);
    });
    _for_each_in_class("back", function (el) {
        el.addEventListener("mousedown", _play_click_back);
    });
    _for_each_in_class("box", function (el) {
        el.addEventListener("mouseenter", _play_mouseover2);
    });
    _for_each_in_class("click-sound2", function (el) {
        el.addEventListener("mouseenter", _play_mouseover3);
    });
    _for_each_in_class("checkbox_component", function (el) {
        el.addEventListener("mouseenter", _play_mouseover4);
    });
    _for_each_in_class("mouseover-sound1", function (el) {
        el.addEventListener("mouseenter", _play_mouseover1);
    });
    _for_each_in_class("mouseover-sound2", function (el) {
        el.addEventListener("mouseenter", _play_mouseover2);
    });
    _for_each_in_class("mouseover-sound3", function (el) {
        el.addEventListener("mouseenter", _play_mouseover3);
    });
    _for_each_in_class("mouseover-sound4", function (el) {
        el.addEventListener("mouseenter", function() {
            if (el.classList.contains("disabled")) return;
            _play_mouseover4();
        });
    });
}

function get_fairest_team_id(data) {
    let team_id = -1;

    // find team with least players, if multiple, find team with least score out of those if the match is ongoing
    if (data.teams && data.teams.length) {
        let least_players = 100;
        for (let i=0; i<data.teams.length; i++) {
            // Skip full teams
            if (data.teams[i].players.length >= data.team_size) continue;
            if (data.teams[i].players.length < least_players) least_players = data.teams[i].players.length;
        }

        let teams_least_players = [];
        for (let i=0; i<data.teams.length; i++) {
            if (data.teams[i].players.length == least_players) teams_least_players.push(data.teams[i]);
        }

        if (teams_least_players.length) {
            if (data.game_stage <= 1) {
                team_id = teams_least_players[0].team_id;
            } else {
                let least_score = 10000;
                for (let team of teams_least_players) {
                    if (team.team_score < least_score) { 
                        least_score = team.team_score;
                        team_id = team.team_id;
                    }
                }
            }
        }
    }

    return team_id;
}

// Sorts the teams data model
function sort_game_data_teams(teams, order) {
    let new_teams = [];
    for (let i=0; i<teams.length; i++) {
        new_teams.push(teams[i]);
    }
    if (order == 'id') {
        new_teams.sort(function(a,b) {
            return (a.team_id <= b.team_id) ? -1 : 1;
        });
    }
    if (order == 'score') {
        new_teams.sort(function(a,b) {
            if (a.team_score > b.team_score) return -1;
            if (a.team_score < b.team_score) return 1;
            if (a.team_score == b.team_score) {
                return (a.team_id <= b.team_id) ? -1 : 1;
            }
        });
    }

    return new_teams;
}

function count_to_empty_array(count) {
    return new Array(count);
}