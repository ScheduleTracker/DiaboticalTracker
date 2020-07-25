function rangeSlider(el, updateVar, callback, onFineChangeCallback) {
    // example element:
    // <div id="setting_mouse_accel_post_scale_x" class="range-slider" data-min="0" data-max="10" data-step="0.0001" data-hide-slider="false"></div>
    // Add data-variable to initialize right away or set dataset.variable later and initialize after
    // Slider type data-type = linear/log/log-spinner

    _empty(el);

    let mouse_down = false;
    let snapDefault = false;
    let contRect;

    // 2vh to px
    let thumbWidth = 0.014 * window.innerHeight;

    let hideSlider = el.dataset.hideSlider ? Boolean(el.dataset.hideSlider) : false;

    let min_val;
    let min_val_log;
    let max_val;
    let max_val_log;
	let def_val;
	let sig_fig;
    let step;
    let step_log;
    let type;
    let decimals;
    let decimals_slider;
    let slider_trailing_zeros;
    let display_shift;
    let stops;
    readSettings()
    
    let cont = document.createElement("div");
    cont.classList.add("slider");

    let cont_overflow = document.createElement("div");
    cont_overflow.classList.add("slider_overflow");

    if (hideSlider) {
        cont.style.display = "none";
        cont_overflow.style.display = "none";
        el.classList.add("no-slider");
    }

    let bg = document.createElement("div");
    bg.classList.add("background");

    let thumb = document.createElement("div");
    thumb.classList.add("thumb");
    
    let tick = document.createElement("div"); 
    tick.classList.add("tick");
				    
    let input = document.createElement("input");
    input.classList.add("input");
    input.ondblclick = function() {
        this.setSelectionRange(0, this.value.length);
    };

    
    input.addEventListener("keypress",function(e) {
        // only allow numbers , . - backspace, tab, enter ("keypress" doesn't register arrow keys, so no need to include them)
        // TODO consider ctrl+c/v
        if (![8,9,13,44,45,46,48,49,50,51,52,53,54,55,56,57].includes(e.keyCode)) {
            e.preventDefault();
            return false;
        }
    });

    input.addEventListener("keydown",function(e) {    
        readSettings();
        if (e.keyCode == 38) { // uparrow
            let new_val = (type.includes("log")) ? Number(el.dataset.value) * Math.pow(2, step_log/1200) : Number(el.dataset.value) + step;
            if (new_val <= max_val) {
                validateValue(new_val);
            }
        } else if (e.keyCode == 40) { // downarrow
            let new_val = (type.includes("log")) ? Number(el.dataset.value) * Math.pow(0.5, step_log/1200) : Number(el.dataset.value) - step;
            if (new_val >= min_val) {
                validateValue(new_val);
            }
        }
    });

    ["keyup", "focusout"].forEach(function(event) { 
        input.addEventListener(event, function(e) {
            if ((event == "keyup" && e.keyCode == 13) || event == "focusout" ) {
                validateValue(Number(input.value) / display_shift);
            }
        });
    });
    
    tick.addEventListener("mousedown", function(e) {
        snapDefault = true;
        e.stopPropagation();
    });

    cont.addEventListener("mousedown", function(e) {
        contRect = cont.getBoundingClientRect();
        mouse_down = true;
        let valueChanged = updateSlider(e);
        if (valueChanged && typeof onFineChangeCallback == "function"){
            onFineChangeCallback(el.dataset.variable, Number(el.dataset.value));
        }
        return false;
    });

    cont_overflow.addEventListener("mousedown", function(e) {
        contRect = cont.getBoundingClientRect();
        mouse_down = true;
        updateSlider(e);
        return false;
    });

    document.addEventListener("mousemove", function(e) {
        if (snapDefault == true) return;
        if (mouse_down) {
            let valueChanged = updateSlider(e);
            if (valueChanged && typeof onFineChangeCallback == "function"){
                onFineChangeCallback(el.dataset.variable, Number(el.dataset.value));
            }
        }
    });

    document.addEventListener("mouseup", function(e) {
        if (mouse_down) {
            runOnUpdate();
        }

        if (mouse_down && updateVar) {
            engine.call("set_real_variable", el.dataset.variable, Number(el.dataset.value));
        }
        if (mouse_down && typeof callback == "function") {
            callback(el.dataset.variable, Number(el.dataset.value));
        }
        if (snapDefault) {
            setSlider(def_val);
            el.dataset.value = def_val;
            input.value = parseFloat((Number(def_val) * display_shift).toFixed(decimals));

            if (updateVar) {
                engine.call("set_real_variable", el.dataset.variable, Number(el.dataset.value));
            }
            if (typeof callback == "function") {
                callback(el.dataset.variable, Number(el.dataset.value));
            }
            sound_click();
        }

        mouse_down = false;
        snapDefault = false;
    });

    cont.appendChild(bg);
    cont.appendChild(thumb);
    cont.appendChild(tick);
    
    el.appendChild(input);
    el.appendChild(cont);
    el.appendChild(cont_overflow);

    function readSettings() {
        let step_string = el.dataset.step ? el.dataset.step : "0.1";
        min_val = el.dataset.min ? Number(el.dataset.min) : 0;
        max_val = el.dataset.max ? Number(el.dataset.max) : 1;
	    def_val = ((min_val<=Number(el.dataset.def)) && (Number(el.dataset.def)<=max_val)) ? Number(el.dataset.def) : null;
	    sig_fig = el.dataset.fig ? Math.max(1,Number(el.dataset.fig)) : null;
        step = Number(step_string);
        min_val_log = Math.log(min_val+step);
        max_val_log = Math.log(max_val);
        step_log = el.dataset.steplog ? Number(el.dataset.steplog): 100;
        decimals = countDecimals(el.dataset.step);
        decimals_slider = countStepDecimals(el.dataset.step);
        display_shift = el.dataset.shift ? Number(el.dataset.shift) : 1;
        stops = el.dataset.stops ? JSON.parse(el.dataset.stops) : [];
        slider_trailing_zeros = '';
        for (let i=0; i<(decimals - decimals_slider); i++) {
            slider_trailing_zeros += '0';
        }
        type = el.dataset.type ? el.dataset.type : "linear";
    }

    function countDecimals(value) {
        let split = value.toString().split(".");
        if (split.length > 1) return split[1].length;
        return 0;
    }

    function countStepDecimals(value) {
        let split = value.toString().split(".");
        if (split.length > 1) {
            let decimals = split[1];
            while (decimals.charAt(decimals.length - 1) == "0") {
                decimals = decimals.slice(0, -1);
            }
            return decimals.length;
        }
        return 0;
    }
    
    function padTrailingZeroes(value) {
        let decimals_value = countStepDecimals(value);
        let pad_trailing_zeros = '';
        for (let i=0; i<(decimals - decimals_value); i++) {
            pad_trailing_zeros += '0';
        }
        let new_val = value;
        if (new_val.indexOf('.') == -1 && pad_trailing_zeros.length > 0) {
            new_val += "."+pad_trailing_zeros;
        } else if (new_val.indexOf('.') > -1 && pad_trailing_zeros.length > 0) {
            new_val += pad_trailing_zeros;
        }
        return new_val;
    }

    function validateValue(value, updateVarNow = true) {
        readSettings();

        if (type.includes("log")) {
            el.dataset.value = padTrailingZeroes(String(value));
        } else {
            el.dataset.value = sig_fig ? padTrailingZeroes(value.toPrecision(sig_fig).replace(/\.?0+$/,"")) : value.toFixed(decimals);
        }
        input.value = (sig_fig||type.includes("log")||stops.length>0) ? Number(el.dataset.value)*display_shift : parseFloat((Number(el.dataset.value) * display_shift).toFixed(decimals));
        
        contRect = cont.getBoundingClientRect();
        setSlider(el.dataset.value);

        if (updateVarNow) {
            runOnUpdate();
        }

        if (updateVar && updateVarNow) {
            engine.call("set_real_variable", el.dataset.variable, Number(el.dataset.value));
        }
        if (typeof callback == "function" && updateVarNow) {
            callback(el.dataset.variable, Number(el.dataset.value));
        }
    }

    function runOnUpdate() {
        if (typeof processSliderUpdate == "function") {
            processSliderUpdate(el);
        }
    }

    function setSlider(val) {
        readSettings();
        if (val > max_val) val = max_val;
        if (val < min_val) val = min_val;
        let currentPerc = null;
        let defaultPerc = null;

        if (type == "log") { // only if explicitly log, not includes
            let minv = min_val_log;
            let maxv = max_val_log;
            currentPerc = (Math.log(val)-minv) / ((maxv-minv) / 100);
            if (def_val) defaultPerc = (Math.log(def_val)-minv) / ((maxv-minv) / 100);
        } else {
            currentPerc = ((val - min_val) * 100) / (max_val - min_val);
            if (def_val) defaultPerc = ((def_val - min_val) * 100) / (max_val - min_val);
        }

        if (currentPerc < 0) currentPerc = 0;
        if (currentPerc > 100) currentPerc = 100;
        
        _for_each_with_class_in_parent(el, "background", function(t) {
            t.style.width = (currentPerc+1) + '%';
        });
        _for_each_with_class_in_parent(el, "thumb", function(t) {
            t.style.left = currentPerc + '%';
        });

        if (defaultPerc) {
            if (defaultPerc < 0) defaultPerc = 0;
            if (defaultPerc > 100) defaultPerc = 100;
            _for_each_with_class_in_parent(el, "tick", function(t) {
                t.style.display = 'flex';
                t.style.left = defaultPerc + '%';
            });
        } else {
            tick.style.display = 'none';
        }
    }

    function updateSlider(e) {
        readSettings();
        let update = false;
        let currentPerc = null;
        let initial_val = el.dataset.value;
        if (e.screenX >= (contRect.left + (thumbWidth/2)) && e.screenX <= (contRect.left + contRect.width + (thumbWidth/2))) {
            currentPerc = ((e.screenX - contRect.left - (thumbWidth/2)) / contRect.width) * 100;
            bg.style.width = (currentPerc+1) + '%';
            thumb.style.left = currentPerc + '%';
            update = true;
        }
        if (e.screenX < (contRect.left + (thumbWidth/2)) && currentPerc != 0) {
            currentPerc = 0;
            bg.style.width = '0%';
            thumb.style.left = '0%';
            update = true;
        }
        if (e.screenX > (contRect.left + contRect.width + (thumbWidth/2)) && currentPerc != 100) { 
            currentPerc = 100;
            bg.style.width = '100%';
            thumb.style.left = '100%';
            update = true;
        }
        if (update && currentPerc != null) {
            let value = null;
            if (type == "log") {
                let minv = min_val_log;
                let maxv = max_val_log;
                value = Math.exp(minv + ((maxv-minv) / 100) * currentPerc);
            } else {
                value = (currentPerc * (max_val - min_val) / 100) + min_val;
            }
            if (stops.length>0) value = snapToStops(value);
            let new_val = (type.includes("log")||stops.length>0) ? String(value) : value.toFixed(decimals_slider);
            if (!type.includes("log")) {
	            if (new_val.indexOf('.') == -1 && slider_trailing_zeros.length > 0) {
	                new_val += "."+slider_trailing_zeros;
	            } else if (new_val.indexOf('.') > -1 && slider_trailing_zeros.length > 0) {
	                new_val += slider_trailing_zeros;
	            }
            }
            if (sig_fig&&!mouse_down) new_val = type.includes("log") ? padTrailingZeroes(String(value)) : padTrailingZeroes(value.toPrecision(sig_fig).replace(/\.?0+$/,""));
            el.dataset.value = (snapDefault == true) ? def_val : new_val;
            input.value = (sig_fig||type.includes("log")||stops.length>0) ? Number(el.dataset.value)*display_shift : parseFloat((Number(el.dataset.value) * display_shift).toFixed(decimals));
        }
        return initial_val != el.dataset.value; //true if value changed, false if not 
    }
    
    function snapToStops(val) {
        let result = val;
        let last_dev = null;
        for (i=0;i<stops.length;i++) {
            let dev = val-stops[i];
            if (last_dev==null||Math.abs(dev)<Math.abs(last_dev)) {
                result = stops[i];
                last_dev = dev;
            }
        }
        return result;
    }

    this.element = function() {
        return el;
    };

    this.setValue = function(value) {
        validateValue(Number(value),false);
    };

    this.variable = function() {
        return el.dataset.variable;
    };

    return this;
}