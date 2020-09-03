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

// A sort of setTimeout but with rendered frames count as the wait time param (default 1 frame if param is ommited)
function req_anim_frame(cb, wait_frames) {
    if (wait_frames && wait_frames > 1) {
        wait_frames--;
        requestAnimationFrame(function() {
            req_anim_frame(cb, wait_frames);
        });
    } else {
        requestAnimationFrame(function() {
            cb();
        });
    }
}

function play_anim(element_id, anim_class) {
    //Hack documented here, https://css-tricks.com/restart-css-animation/
    //Note that this requires non-strict mode according to the article.
    //Note also that use jquery selection here doesn't seem to work with the hack.
    let el = _id(element_id);
    el.classList.remove(anim_class);
    void el.offsetWidth;
    el.classList.add(anim_class);
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
function _format_number(number, type, options) {
    if (type == "currency") {
        const amount = number * (options && options.areCents ? 0.01 : 1);
        const formatted = numeral(amount).format('0.00');
        /* Currency code handled manually because numeraljs */
        /* does not support mixed locales */
        switch (options.currency_code) {
            case 'EUR':
                return `€${formatted}`;
            case 'GBP':
                return `£${formatted}`;
            case 'USD':
                return `$${formatted}`;    
            default:
                return `${formatted} ${options.currency_code}`
        }
    } else {
        let tmp = numeral(number);
        return tmp.format();
    }
}

//Returns a stack trace to where it is called.
function stackTrace() {
    var err = new Error();
    return err.stack;
}

// Recursively removes all child nodes and then itself from the DOM
function _remove_node(node){
    if (node === undefined || node === null) return;
    while (node.hasChildNodes()) {
        _remove_node(node.lastChild);
    }
    if (node.parentNode) node.parentNode.removeChild(node);
}

// Recursively removes all child nodes from the node
function _empty(node) {
    //while (node.firstChild) {
    //    node.removeChild(node.firstChild);
    //}
    if (node === undefined || node === null) return;
    while (node.hasChildNodes()) {
        _remove_node(node.lastChild);
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

// Preload image "trick"
function _loadImage(cont, url) {
    var img = document.createElement('img');
    img.onload = function() {
        if (img.parentElement == cont) cont.removeChild(img);
    }
    img.src = url;
    cont.appendChild(img);
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

let ui_sound_buffer = performance.now();
function _play_buffered_ui_sound(type) {
    if (performance.now() - ui_sound_buffer < 50) return;
    ui_sound_buffer = performance.now();

    engine.call('ui_sound', type);
}

function _play_mouseover1() { _play_buffered_ui_sound("ui_mouseover1"); }
function _play_mouseover2() { _play_buffered_ui_sound("ui_mouseover2"); }
function _play_mouseover3() { _play_buffered_ui_sound("ui_mouseover3"); }
function _play_mouseover4() { _play_buffered_ui_sound("ui_mouseover4"); }
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
    let spinner = _createElement("div", ["spinner-icon", "running"]);
    cont.appendChild(spinner);

    return outer_cont;
}

function _avatarUrl(avatar) {
    if (avatar) return global_customization_type_map[global_customization_type_id_map["avatar"]].img_path + avatar + ".png.dds";
    return "/html/customization/avatar/av_no_avatar.png.dds";
}
function _flagUrl(country) {
    if (country) return global_customization_type_map[global_customization_type_id_map["country"]].img_path + country + ".png.dds";
    return "/html/customization/flag/no_flag.png.dds";
}
function _mapUrl(map) {
    if (map) return "/html/map_thumbnails/"+map+".png";
    return "";
}
function _stickerUrl(sticker) {
    if (sticker) return "/resources/asset_thumbnails/textures_customization_" + sticker + ".png.dds";
    return "";
}
function _sprayUrl(spray) {
    if (spray) return "/resources/asset_thumbnails/textures_customization_" + spray + ".png.dds";
    return "";
}
function _musicImageUrl(id) {
    if (id) return "/html/customization/music/"+id+".png.dds";
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
    if (name.trim().length == 0) return localize("unknown");
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
function _format_ping(ping) {
    if (ping == -1) return 999;
    if (ping > 1) return 999;
    return Math.floor(Number(ping) * 1000);
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

/**
 * Parses a hexcolor and returns the light or dark font color that should be used
 * @param {string} hexcolor
 */
// src: https://gomakethings.com/dynamically-changing-the-text-color-based-on-background-color-contrast-with-vanilla-js/
function _backgroundFontColor(hexcolor){

	// If a leading # is provided, remove it
	if (hexcolor.slice(0, 1) === '#') {
		hexcolor = hexcolor.slice(1);
	}

	// If a three-character hexcode, make six-character
	if (hexcolor.length === 3) {
		hexcolor = hexcolor.split('').map(function (hex) {
			return hex + hex;
		}).join('');
	}

	// Convert to RGB value
	var r = parseInt(hexcolor.substr(0,2),16);
	var g = parseInt(hexcolor.substr(2,2),16);
	var b = parseInt(hexcolor.substr(4,2),16);

	// Get YIQ ratio
	var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

	// Check contrast
    //return (yiq >= 128) ? '#1c1c1c' : '#fff';
    return (yiq >= 140) ? '#1c1c1c' : '#fff';
};

/*
* Converts a given hexcolor and alpha value to rgba
*/
function hexToRGBA(hexcolor, alpha) {

    // If a leading # is provided, remove it
	if (hexcolor.slice(0, 1) === '#') {
		hexcolor = hexcolor.slice(1);
	}

    // If a three-character hexcode, make six-character
	if (hexcolor.length === 3) {
		hexcolor = hexcolor.split('').map(function (hex) {
			return hex + hex;
		}).join('');
    }
    
    let r = parseInt(hexcolor.slice(0, 2), 16);
    let g = parseInt(hexcolor.slice(2, 4), 16);
    let b = parseInt(hexcolor.slice(4, 6), 16);

    if (alpha) {
        return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    } else {
        return "rgb(" + r + "," + g + "," + b + ")";
    }
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
    input.classList.add("input_disabled");
}
function _enableInput(input) {
    input.removeEventListener("input", _preventInputFunction);
    input.removeEventListener("keydown", _preventInputFunction);
    input.removeEventListener("keyup", _preventInputFunction);
    input.removeEventListener("keypress", _preventInputFunction);
    input.removeEventListener("focus",_preventInputFocus);
    input.dataset.disabled = false;
    input.classList.remove("input_disabled");
}
function _numberInput(input) {
    input.addEventListener("keypress",function(e) {
        // only allow numbers , . - backspace, tab, enter ("keypress" doesn't register arrow keys, so no need to include them)
        // TODO consider ctrl+c/v
        if (![8,9,13,44,45,46,48,49,50,51,52,53,54,55,56,57].includes(e.keyCode)) {
            e.preventDefault();
            return false;
        }
    });
}

function _seconds_to_string(seconds) {
    let numyears = Math.floor(seconds / 31536000);
    let numdays = Math.floor((seconds % 31536000) / 86400); 
    let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    let numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    //let numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;

    // don't show minutes anymore if timespan is more than 1 day and 1 hour
    if (seconds > 90000) return ((numyears > 0) ? numyears + "y ":"") + ((numdays > 0) ? numdays + "d ":"") + ((numhours > 0) ? numhours + "h":"");
    return ((numyears > 0) ? numyears + "y ":"") + ((numdays > 0) ? numdays + "d ":"") + ((numhours > 0) ? numhours + "h ":"") + ((numminutes > 0) ? numminutes + "m":"0m");
}

function _time_until(seconds) {
    if (seconds < 3600) return _seconds_to_minutes(seconds);
    if (seconds < 172800) return _seconds_to_hours(seconds);
    return _seconds_to_days(seconds);
}

function _seconds_to_minutes(seconds) {
    let numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    return localize_ext("count_minute", {"count": numminutes});
}

function _seconds_to_hours(seconds) {
    let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    return localize_ext("count_hour", {"count": numhours});
}

function _seconds_to_days(seconds) {
    let numdays = Math.floor(seconds / (3600*24));
    return localize_ext("count_day", {"count": numdays}); 
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
    if (numminutes > 0) return strminutes+":"+strseconds;
    return "00:"+strseconds;
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

/*
function _set_battle_pass_colors(el, colors) {
    el.style.setProperty("--bp_color", colors["color"]);
    el.style.setProperty("--bp_color_hover", colors["color_hover"]);
    el.style.setProperty("--bp_color_active", colors["color_active"]);
    el.style.setProperty("--bp_gradient_1", colors["gradient_1"]);
    el.style.setProperty("--bp_gradient_2", colors["gradient_2"]);
}
*/

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
    let fragment = _createElement("div");
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

// Views: "menu", "hud"
function send_view_data(view, type, string) {
    if (type == "string") {
        engine.call("send_view_data", view, "s "+string);
    } else if (type == "json") {
        engine.call("send_view_data", view, "j "+JSON.stringify(string));
    }
}

function parse_view_data(string) {
    let action = '';
    let data = {};
    let char = string.charAt(0);

    if (char === "s") {

        // String
        action = string.substring(2);

    } else if (char === "j") {
        
        // JSON
        let json = string.substring(2);
        
        try {
            data = JSON.parse(json);
            if (data.hasOwnProperty("action")) action = data.action;
        } catch(e) {
            console.error("Error parsing view data json", e.message, string);
        }

    }

    return { "action": action, "data": data };
}

function sortPlayersByStats(a, b) {
    if (a.stats[GLOBAL_ABBR.STATS_KEY_SCORE] == b.stats[GLOBAL_ABBR.STATS_KEY_SCORE]) {
        if (a.stats[GLOBAL_ABBR.STATS_KEY_FRAGS] == b.stats[GLOBAL_ABBR.STATS_KEY_FRAGS]) {
            if (a.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] == b.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED]) {
                return 0;
            } else {
                return b.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] - a.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED];
            }
        } else {
            return b.stats[GLOBAL_ABBR.STATS_KEY_FRAGS] - a.stats[GLOBAL_ABBR.STATS_KEY_FRAGS];
        }
    } else {
        return b.stats[GLOBAL_ABBR.STATS_KEY_SCORE] - a.stats[GLOBAL_ABBR.STATS_KEY_SCORE];
    }
}

function createCustomizationName(item) {
    let name = _createElement("div", "name");
    if (global_customization_type_map[item.customization_type].name == "currency") {
        name.textContent = localize_ext("count_coin", {"count": item.amount});
    } else if (global_customization_type_map[item.customization_type].name == "country") {
        if (!item || item.customization_id.trim().length == 0) name.textContent = localize("customization_default");
        else name.textContent = localize_country(item.customization_id);
    } else if (item.customization_id.trim().length == 0) {
        name.textContent = localize("customization_default");
    } else {
        name.textContent = localize("customization_"+item.customization_id);
    }

    return name;
}
function createCustomizationInfo(item, show_name) {

    let item_type = localize(global_customization_type_map[item.customization_type].i18n);
    if (item.customization_type == global_customization_type_id_map["weapon"] && item.customization_sub_type && item.customization_sub_type.length && "weapon"+item.customization_sub_type in global_item_name_map) {
        item_type += " - "+localize(global_item_name_map["weapon"+item.customization_sub_type][1]);
    } 

    let customization_info = _createElement("div", ["customization_info", "rarity_bg_"+item.rarity]);
    let div_type = _createElement("div", "type");
    customization_info.appendChild(div_type);
    div_type.appendChild(_createElement("div", "rarity", localize(global_rarity_map[item.rarity].i18n)));
    div_type.appendChild(_createElement("div", "separator", "/"));
    div_type.appendChild(_createElement("div", "item_type", item_type));
    customization_info.appendChild(div_type);
    if (show_name === undefined || show_name === true) {
        customization_info.appendChild(createCustomizationName(item));
    }

    return customization_info;
}

function createCustomizationPreview(item) {
    let preview_image = _createElement("div", "customization_preview_image");
    if (global_customization_type_map[item.customization_type].name == "avatar") {

        if (item.customization_id == "default") return preview_image;
        preview_image.classList.add(global_customization_type_map[item.customization_type].name);
        preview_image.style.backgroundImage = "url("+_avatarUrl(item.customization_id)+")";

    } else if (global_customization_type_map[item.customization_type].name == "country") {
        
        if (item.customization_id == "default") return preview_image;
        preview_image.classList.add(global_customization_type_map[item.customization_type].name);
        preview_image.style.backgroundImage = "url(/html/customization/flag/"+item.customization_id+".png.dds)";

    } else if (global_customization_type_map[item.customization_type].name == "currency") {

        preview_image.classList.add(global_customization_type_map[item.customization_type].name);
        preview_image.style.backgroundImage = "url(/html/images/icons/reborn_coin.png.dds)";

    } else if (global_customization_type_map[item.customization_type].name == "music") {

        //preview_image.style.backgroundImage = "url(/html/customization/music/mu_pu_placeholder.png.dds)"; // TEMP until we have proper images for each song?
        preview_image.classList.add(global_customization_type_map[item.customization_type].name);
        preview_image.style.backgroundImage = "url("+_musicImageUrl(item.customization_id)+")";

        let music_controls = _createElement("div", "music_controls");
        preview_image.appendChild(music_controls);
        let play_button = _createElement("div", ["db-btn", "plain", "music_play_button"]);
        music_controls.appendChild(play_button);
        let pause_button = _createElement("div", ["db-btn", "plain", "music_pause_button"]);
        music_controls.appendChild(pause_button);

        _addButtonSounds(play_button, 1);
        _addButtonSounds(pause_button, 1);

        play_button.addEventListener("click", () => _play_music_preview(item.customization_id));
        pause_button.addEventListener("click", _pause_music_preview);

    } else if (global_customization_type_map[item.customization_type].name == "spray") {

        preview_image.classList.add(global_customization_type_map[item.customization_type].name);
        preview_image.appendChild(_createElement("div", "backdrop"));
        let image = _createElement("div", "image");
        image.style.backgroundImage = "url("+_sprayUrl(item.customization_id)+")";
        preview_image.appendChild(image);

    } else if (global_customization_type_map[item.customization_type].name == "sticker") {

        preview_image.classList.add(global_customization_type_map[item.customization_type].name);
        preview_image.style.backgroundImage = "url("+_stickerUrl(item.customization_id)+")";

    }
    return preview_image;
}

let customization_audio_playing = '';
function _play_music_preview(id) {
    _pause_music_preview();
    
    customization_audio_playing = id;
    engine.call("ui_sound_tracked", customization_audio_playing);
    engine.call("set_music_post_volume", 0);
}
function _pause_music_preview() {
    if (customization_audio_playing.length) engine.call("ui_stop_sound", customization_audio_playing);
    engine.call("set_music_post_volume", 1);
    customization_audio_playing = "";
}

function _load_lazy_all(parent) {
    _for_each_with_class_in_parent(parent, "lazy_load", function(el) {
        _load_lazy(el);
    });
}
function _load_lazy(el) {
    if (!el.classList.contains("lazy_load")) return;
    if (!("lazyUrl" in el.dataset)) return;

    // Show the spinner
    el.appendChild(_createElement("div", "lazy_spinner"));

    var img = new Image();
    img.onload = function() {
        for (let i=0; i<el.children.length; i++) {
            if (el.children[i] && el.children[i].classList.contains("lazy_spinner")) el.removeChild(el.children[i]);
        }
        
        el.classList.remove("lazy_load");
    
        if (el.dataset.lazyType == "bg") {
            el.style.backgroundImage = "url("+img.src+")";
        }
        if (el.dataset.lazyType == "src") {
            el.src = img.src;
        }

        delete el.dataset.lazyType;
        delete el.dataset.lazyUrl;

        img = null;
    };
    img.onerror = function() {
        for (let i=0; i<el.children.length; i++) {
            if (el.children[i] && el.children[i].classList.contains("lazy_spinner")) el.removeChild(el.children[i]);
        }

        el.classList.remove("lazy_load");
        delete el.dataset.lazyType;
        delete el.dataset.lazyUrl;
    };
    img.src = el.dataset.lazyUrl;
}
function _add_lazy_load(el, type, url) {
    el.classList.add("lazy_load");
    el.dataset.lazyType = type;
    el.dataset.lazyUrl = url;
}
