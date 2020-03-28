function _id(id) {
    return document.getElementById(id);
}
 
function _get_first_with_class_in_parent(parent, childClass){
    return parent.getElementsByClassName(childClass)[0];
}

function _for_each_in_class(classname, callback) {
    var elements = document.getElementsByClassName(classname);
    for (var i = 0; i < elements.length; i++) {
        callback(elements.item(i), i);
    }
}

function _for_each_with_class_in_parent(parent, classname, callback) {
    if (!parent) return;
    var elements = parent.getElementsByClassName(classname);
    for (var i = 0; i < elements.length; i++) {
        callback(elements.item(i), i);
    }
}

function _for_first_with_class_in_parent(parent, classname, callback) {
    if (!parent) return;
    var elements = parent.getElementsByClassName(classname);
    if (elements.length > 0) {
        callback(elements[0]);
    }
}

function _for_each_with_selector_in_parent(parent, selector, callback) {
    if (!parent) return;
    var elements = parent.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        callback(elements.item(i), i);
    }
}

function _for_each_with_class_in_parents_arr(parents_arr, classname, callback) {
    if (!parents_arr) return;
    for (var p = 0; p < parents_arr.length; p++){
        var elements = parents_arr[p].getElementsByClassName(classname);
        for (var i = 0; i < elements.length; i++) {
            callback(elements.item(i), i);
        }
    }
}

function _for_each_child_of_element(element, callback) {
    if (!element) return;
    if (!element.hasChildNodes()) return;
    for (var i = 0; i < elements.childNodes.length; i++) {
        callback(elements.childNodes[i], i);
    }
}

function _for_each_in_tag(tagname, callback) {
    var elements = document.getElementsByTagName(tagname);
    for (var i = 0; i < elements.length; i++) {
        callback(elements.item(i), i);
    }
}

function _for_each_with_tag_in_parent(parent, tagname, callback) {
    if (!parent) return;
    var elements = parent.getElementsByTagName(tagname);
    for (var i = 0; i < elements.length; i++) {
        callback(elements.item(i), i);
    }
}

function bind_event(event_name, callback){
    const DEBUG_EVENTS = false;
    if (DEBUG_EVENTS){
        engine.on(event_name, function(){
            //console.log("Event: " + event_name);
            reset_timer();
            callback.apply(this, arguments);
            log_timer_if_not_zero(event_name + " duration");                
        });
    } else {
        engine.on(event_name, callback);
    }
}

function play_anim(element_id, anim_class) {
    //Hack documented here, https://css-tricks.com/restart-css-animation/
    //Note that this requires non-strict mode according to the article.
    //Note also that use jquery selection here doesn't seem to work with the hack.
    $("#" + element_id).removeClass(anim_class);
    var elem = document.getElementById(element_id);
    void elem.offsetWidth;
    $("#" + element_id).addClass(anim_class);
}

function _for_each_child(element, callback) {
    for (var child = element.firstChild; child !== null; child = child.nextSibling) {
        callback(child);
    }
}

function _check_nested(obj, level,  ...rest) {
    if (obj === undefined) return false
    if (rest.length == 0 && obj.hasOwnProperty(level)) return true
    return _check_nested(obj[level], ...rest)
}

//https://www.javascriptcookbook.com/article/traversing-dom-subtrees-with-a-recursive-walk-the-dom-function/
//Usage example:
//_walk(child_element, function (node) {
//    if (node && node.style) node.style.fill = "#ff0000";
//});
function _walk(node, fn) {
    fn(node);
    node = node.firstChild;
    while (node) {
        _walk(node, fn);
        node = node.nextSibling;
    }
}

function _clean_float(value, decimal) {
    if (!isFinite(decimal)){
        decimal = 3;
    }
    return Math.round(Math.pow(10,decimal) * parseFloat(value)) / Math.pow(10,decimal);
}

function _escape_html(str) {
    return str.replace(/[&<>"']/g, function(c) {
      switch (c) {
        case '&':
            return '&amp;';
        case '<':
            return '&lt;';
        case '>':
            return '&gt;';
        case '"':
            return '&quot;';
        default:
            return '&#039;';
      }
    });
};


String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

function echo(str){
    engine.call("echo", ""+str)
}

function lerp(v0, v1, t) {
    return v0*(1-t) + v1*t;
}

//Note that doing it this way appears to be much faster than using Math.min/max
function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

function _clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

function beep(){
    engine.call('ui_sound', 'ui_mouseover2');
}

function _round(num, decimal_count) {
    let bleh = decimal_count * 10;
    return Math.round(num * bleh) / bleh;
}

// Using numeraljs
function _format_number(number, type) {
    let tmp = numeral(number);
    if (type == "currency") return tmp.format('$0,0.00');

    return tmp.format();
}

//Returns a stack trace to where it is called.
function stackTrace() {
    var err = new Error();
    return err.stack;
}

function _empty_node(node){
  while (node.hasChildNodes()) {
    _empty_node(node.firstChild);
  }
  node.parentNode.removeChild(node);
}

function _empty(node) {
    //while (node.firstChild) {
    //    node.removeChild(node.firstChild);
    //}
    while (node.hasChildNodes()) {
       _empty_node(node.firstChild);
    }
}

function _html(node, html) {
    if (!node) return;
    
    _empty(node);
    node.innerHTML = html;
}

function _insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function _dump(obj) {
    return JSON.stringify(obj, null, '\t');
}

function _addButtonSounds(el, sound_idx) {
    if (sound_idx == 1) {
        el.addEventListener("mouseenter", _play_mouseover4);
        el.addEventListener("click", _play_click1);
    }
    if (sound_idx == 2) {
        el.addEventListener("mouseenter", _play_mouseover4);
        el.addEventListener("click", _play_click_back);
    }
}
function _play_mouseover1() { engine.call('ui_sound', "ui_mouseover1"); }
function _play_mouseover2() { engine.call('ui_sound', "ui_mouseover2"); }
function _play_mouseover3() { engine.call('ui_sound', "ui_mouseover3"); }
function _play_mouseover4() { engine.call('ui_sound', "ui_mouseover4"); }
function _play_click1()     { engine.call('ui_sound', "ui_click1"); }
function _play_click_back() { engine.call('ui_sound', "ui_back1"); }
function _play_cb_check()   { engine.call('ui_sound', "ui_check_box"); }
function _play_cb_uncheck() { engine.call('ui_sound', "ui_uncheck_box"); }

function _createElement(type, classes, textContent) {
    let el = document.createElement(type);
    if (typeof classes == "string") {
        el.classList.add(classes);
    }
    if (typeof classes == "object" && Array.isArray(classes)) {
        for (let css_class of classes) {
            el.classList.add(css_class);
        }
    }
    if (typeof textContent != "undefined") {
        if (typeof textContent == "string") {
            el.textContent = textContent;
        } else {typeof textContent == "number"} {
            el.textContent = ""+textContent;
        }
    }
    return el;
}

function _createSpinner() {
    let outer_cont = _createElement("div", "spinner");
    let cont = _createElement("div", "spinner-cont");
    outer_cont.appendChild(cont);
    let spinner = _createElement("div", "spinner-icon");
    cont.appendChild(spinner);

    return outer_cont;
}

function _customizationUrl(type, id) {
    if (id) return "/html/"+type+"/"+id+".png";
    // TODO change this to a more generic fallback
    return "/html/avatar/no_avatar.png";
}

function _avatarUrl(avatar) {
    if (avatar) return "/html/avatar/"+avatar+".png";
    return "/html/avatar/no_avatar.png";
}

function _flagUrl(country) {
    if (country) return "/html/flags/"+country+".png";
    return "/html/flags/no_flag.png";
}

function _mapUrl(map) {
    if (map) return "/html/map_thumbnails/"+map+".png";
    return "";
}

function _stickerUrl(sticker) {
    
    if (sticker && sticker in global_customization_asset_store) {
        return global_customization_asset_store[sticker];
    }
    return "";
}

function _format_color(color) {
    if (color.length > 0 && color.charAt(0) == "#") {
        return color;
    } else {
        return "#" + color;
    }
}

function _format_color_for_css(color) {
    var ret;
    if (color.length > 0 && color.charAt(0) == "#") {
        ret = color;
    } else {
        ret = "#" + color;
    }

    if (ret.length == 9){
        //This must be a #AARRGGBB color now because that's what spectrum.js
        //uses, let's make it #RRGGBBAA instead which is what the standard
        //actually supports
        ret ="#" + ret.substring(3) + ret.substring(1,3);
    }
    return ret;
}

function _format_color_for_url(color) {
    return encodeURIComponent(_format_color_for_css(color));
}

function _format_map_name(name) {
    let parts = name.split("_");
    parts.splice(0,1);
    for (let i=0; i<parts.length; i++) parts[i] = capitalize(parts[i]);
    return parts.join(" ");
}
function _format_game_mode(mode) {
    if (mode in global_game_mode_map) return localize(global_game_mode_map[mode].i18n);
    return localize("unknown");
}
function _format_timelimit(seconds) {
    if (seconds == 0) return localize("time_unlimited");
    return _seconds_to_digital(seconds);
}
function _format_scorelimit(score) {
    if (score == 0) return localize("score_unlimited");
    return score;
}
function _format_team_switching(val) {
    if (val == 0) return localize("disabled");
    if (val == 1) return localize("teamswitching_enabled_nospec");
    if (val == 2) return localize("teamswitching_enabled");
    return '';
}
function _format_physics(id) {
    if (id in global_physics_map) return localize(global_physics_map[id].i18n);
    return localize("unknown");
}
function _format_instagib(int) {
    if (int == 0) return localize("disabled");
    if (int == 1) return localize("enabled");
    return '';
}
function _format_continuous(val) {
    if (val == 0) return localize("custom_settings_one_match");
    return localize("custom_settings_continuous_matches");
}
function _format_datacenter(loc) {
    if (loc in global_region_map) return localize(global_region_map[loc].i18n);
    return localize("unknown");
}

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

//Name of this class taken from this thread, read link to understand its purpose.
//https://ux.stackexchange.com/questions/34360/delay-on-keystroke-when-search-as-you-type

const INPUT_DEBOUNCER_INPUT_DELAY_MS = 200;
const INPUT_DEBOUNCER_ACTION_DELAY_MS = 400;

class InputDebouncer {
    constructor(callback, custom_delay) {
        this.last_action_time = null;
        this.callback = callback;
        this.timeout = null;
        this.input_delay = INPUT_DEBOUNCER_INPUT_DELAY_MS;
        this.action_delay = INPUT_DEBOUNCER_ACTION_DELAY_MS;
        if (custom_delay) {
            this.input_delay = custom_delay;
            this.action_delay = custom_delay + 200;
        }
    }
    execute(callback) {
        var this_time = performance.now();
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.last_action_time !== null && this_time - this.last_action_time < this.action_delay) {
            this.timeout = setTimeout(this.callback,
                Math.max(this.action_delay - (this_time - this.last_action_time),
                    this.input_delay));
        } else {
            this.timeout = setTimeout(this.callback, this.input_delay);
        }
        this.last_action_time = this_time;
    }
}


/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
 //stolen from stackoverflow https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
function hslToRgbString(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")";
}


/* 
 *  Performance functions
 */
window.perf_timer = 0;
function benchmark(cb, times){
    if (!times) times = 10000;
    reset_timer();
    for (var i = 0; i < times; i++){
        cb();
    }
    print_timer(times + " iterations");
}

function reset_timer() {
    window.perf_timer = performance.now();
}

function print_timer(label) {
    var perf = (performance.now() - window.perf_timer);
    engine.call("echo","JSPERF: " + (label ? label : "") + " " + perf + " ms");
}
function log_timer(label) {
    var perf = (performance.now() - window.perf_timer);
    console.log("JSPERF: " + (label ? label : "") + " " + perf + " ms");
}
function log_timer_if_not_zero(label) {
    var perf = (performance.now() - window.perf_timer);
    if (perf) console.log("JSPERF: " + (label ? label : "") + " " + perf + " ms");
}


/*
 *  <input> disabled custom blocking as gameface doesn't support the "disabled" attribute
 */
function _preventInputFunction(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}
function _preventInputFocus(e) {
    e.preventDefault();
    e.stopPropagation();
    //this.blur(); <- crashes the game due to some weird loop with detectBlur() in ui.js
    return false;
}
function _disableInput(input) {
    input.addEventListener("input", _preventInputFunction);
    input.addEventListener("keydown", _preventInputFunction);
    input.addEventListener("keyup", _preventInputFunction);
    input.addEventListener("keypress", _preventInputFunction);
    input.addEventListener("focus",_preventInputFocus);
    input.dataset.disabled = true;
}
function _enableInput(input) {
    input.removeEventListener("input", _preventInputFunction);
    input.removeEventListener("keydown", _preventInputFunction);
    input.removeEventListener("keyup", _preventInputFunction);
    input.removeEventListener("keypress", _preventInputFunction);
    input.removeEventListener("focus",_preventInputFocus);
    input.dataset.disabled = false;
}

function _seconds_to_string(seconds) {
    let numyears = Math.floor(seconds / 31536000);
    let numdays = Math.floor((seconds % 31536000) / 86400); 
    let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    let numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    //let numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
    return ((numyears > 0) ? numyears + "y ":"") + ((numdays > 0) ? numdays + "d ":"") + ((numhours > 0) ? numhours + "h ":"") + ((numminutes > 0) ? numminutes + "m ":"0m");
}

function _time_until(seconds) {
    if (seconds < 43200) return _seconds_to_digital(seconds);
    if (seconds < 172800) return _seconds_to_hours(seconds);
    return _seconds_to_days(seconds);
}

function _seconds_to_hours(seconds) {
    let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    return numhours+" "+localize_plural("hour", numhours);
}

function _seconds_to_days(seconds) {
    let numhours = Math.floor(seconds / (3600*24));
    return numhours+" "+localize_ext("day", {"count": numhours}); 
}

function _seconds_to_digital(seconds) {
    let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    let numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    let numseconds = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);

    let strminutes = numminutes;
    let strseconds = numseconds;

    if (numminutes < 10) {strminutes = "0"+numminutes;}
    if (numseconds < 10) {strseconds = "0"+numseconds;}

    if (numhours > 0) return numhours+":"+strminutes+":"+strseconds;
    if (numminutes > 0) return numminutes+":"+strseconds;
    return numseconds;
}

function _to_readable_timestamp(string, show_sec) {
    let date = new Date(string);

    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    if (show_sec) {
        return date.getFullYear()+"-"+month+"-"+day+" "+hour+":"+min+":"+sec;
    }
    return date.getFullYear()+"-"+month+"-"+day+" "+hour+":"+min;
}

function _current_hour_minute() {
    var date = new Date();
    let hour = date.getHours();
    let min = date.getMinutes();
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;

    return hour+":"+min;
}

function _sort_objects_by_key(array, key, direction) {
    return array.sort(function(a, b) {
        var x = a[key]; 
        var y = b[key];
        if (direction && direction == "desc") 
            return ((y < x) ? -1 : ((y > x) ? 1 : 0));    
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function _set_battle_pass_colors(el, colors) {
    el.style.setProperty("--bp_color", colors["color"]);
    el.style.setProperty("--bp_gradient_1", colors["gradient_1"]);
    el.style.setProperty("--bp_gradient_2", colors["gradient_2"]);
    el.style.setProperty("--bp_gradient_hover_1", colors["gradient_hover_1"]);
    el.style.setProperty("--bp_gradient_hover_2", colors["gradient_hover_2"]);
    el.style.setProperty("--bp_gradient_active_1", colors["gradient_active_1"]);
    el.style.setProperty("--bp_gradient_active_2", colors["gradient_active_2"]);
}

// Sort an array of customization items by the predefined order in "customization_item_order" and by descending rarity
function _sort_customization_items(items) {
    let out = [];
    let temp = {};
    for (let id of customization_item_order) {
        for (let item of items) {
            if (item.customization_type == id) {
                if (!(item.customization_type in temp)) temp[item.customization_type] = [];
                temp[item.customization_type].push(item);
            }
        }
    }
    
    for (let id of customization_item_order) {
        if (id in temp && temp[id].length) {
            temp[id].sort(function(a, b) {
                return b.rarity - a.rarity;
            });
            out = out.concat(temp[id]);
        }
    }
    
    return out;
}

function getRandomElementsFromArray(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len) return arr;
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function getRankVideoUrl(rank, position) {
    let url = '';
    if (position && position > 0) {
        if (position == 1) url = ("top_4" in global_ranks) ? "/html/ranks/animated/"+global_ranks["top_4"].anim : "";
        else if (position <= 50) url = ("top_3" in global_ranks) ? "/html/ranks/animated/"+global_ranks["top_3"].anim : "";
        else if (position <= 100) url = ("top_2" in global_ranks) ? "/html/ranks/animated/"+global_ranks["top_2"].anim : "";
        else url = ("top_1" in global_ranks) ? "/html/ranks/animated/"+global_ranks["top_1"].anim : "";
    } else {
        if (rank in global_ranks) url = "/html/ranks/animated/"+global_ranks[rank].anim;
    }
    return url;
}

function renderRankIcon(rank, position, team_size, size) {
    let div = _createElement("div", "rank_icon");
    if (position && position > 0) {
        if (position == 1) div.classList.add("top_4");
        else if (position <= 50) div.classList.add("top_3");
        else if (position <= 100) div.classList.add("top_2");
        else div.classList.add("top_1");

        if (position > 1) div.appendChild(_createElement("div", "position", position));
    } else {
        if (rank === null || rank === undefined || rank == 0) {
            if (team_size && team_size >= 1) {
                if (team_size <= 4) {
                    div.classList.add("unranked_"+team_size);
                } else {
                    div.classList.add("unranked_4");
                }
            } else {
                div.classList.add("unranked_1");
            }
        } else {
            div.classList.add("rank_"+rank);
        }
    }

    if (size == "small") div.classList.add("small");
    if (size == "big") div.classList.add("big");
    return div;
}

let global_rank_tier_lookup = [
    [0,0],  // spaceholder because tier 0 doesn't exist
    [1,5], 
    [6,10], 
    [11,15], 
    [16,20], 
    [21,25], 
    [26,30], 
    [31,35], 
    [36,40]
];
function getRankName(rank, position) {
    let fragment = new DocumentFragment();
    if (position && position > 0) {

        if (position == 1) fragment.appendChild(_createElement("div", "name", localize("rank_tier_top1")));
        else if (position <= 50) fragment.appendChild(_createElement("div", "name", localize("rank_tier_top50")));
        else if (position <= 100) fragment.appendChild(_createElement("div", "name", localize("rank_tier_top100")));
        else return fragment.appendChild(_createElement("div", "name", localize("rank_tier_top1000")));

    } else {
        if (rank === null || rank === undefined || rank == 0) {

            fragment.appendChild(_createElement("div", "name", localize("rank_unranked")));

        } else {
            
            let tier = 1;
            for (tier; tier<global_rank_tier_lookup.length; tier++) {
                if (Number(rank) >= global_rank_tier_lookup[tier][0] && Number(rank) <= global_rank_tier_lookup[tier][1]) {
                    break;
                }
            }

            try {
                let tier_sub_rank = 5 - (global_rank_tier_lookup[tier][1] - Number(rank));

                let tier_sub_rank_text = "";
                if (tier_sub_rank == 1) tier_sub_rank_text = "I";
                else if (tier_sub_rank == 2) tier_sub_rank_text = "II";
                else if (tier_sub_rank == 3) tier_sub_rank_text = "III";
                else if (tier_sub_rank == 4) tier_sub_rank_text = "IV";
                else if (tier_sub_rank == 5) tier_sub_rank_text = "V";
                fragment.appendChild(_createElement("div", "name", localize("rank_tier_"+tier)));
                fragment.appendChild(_createElement("div", "name-post", tier_sub_rank_text));
            } catch(e) {

            }
        }
    }
    
    return fragment;
}

function send_view_data(view, string) {
    engine.call("send_view_data", view, string)
}
