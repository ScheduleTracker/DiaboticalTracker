function load_advanced_mouse_settings() {
    _id('ultra_advanced_accel_settings').style.display = 'none';
    _id('ultra_advanced_accel_toggle').classList.remove("selected");
    open_modal_screen("advanced_mouse_settings_screen");
    detect_preset_yaw_pitch();
    update_physical_sens('initialize',false);
    update_accel_options(_id('setting_mouse_accel_type'));
}

function swap_zoom_and_hip_fields(mode){
    if (mode) {
        _id('hipButton').classList.add('selected');
        _id('adsButton').classList.remove('selected');
    } else {
        _id('hipButton').classList.remove('selected');
        _id('adsButton').classList.add('selected');
    }
    _id('hip_curvature').style.display=mode?'flex':'none';
    _id('zoom_curvature').style.display=mode?'none':'flex';
    _id('hip_circumference').style.display=mode?'flex':'none';
    _id('zoom_circumference').style.display=mode?'none':'flex';
    _id('setting_incre_container').style.display=mode?'flex':'none';
    _id('setting_incre_zoom_container').style.display=mode?'none':'flex';
}

function reset_ultra_advanced_accel_settings(){
  engine.call("set_real_variable", "mouse_accel_norm", 2);
  engine.call("set_real_variable", "mouse_accel_stigma_x", 1);
  engine.call("set_real_variable", "mouse_accel_stigma_y", 1);
  engine.call("set_real_variable", "mouse_accel_bias_x", 1);
  engine.call("set_real_variable", "mouse_accel_bias_y", 1);
  sound_click();
}

function convert_to_arcmin(value, unit) {
    if (unit=='arcmin') {
        var preset_arcmin = Number(value);
    } else if (unit=='deg') {
        var preset_arcmin = value*60;
    } else if (unit=='mrad') {
        var preset_arcmin = value*10.8/Math.PI;
    } else if (unit=='division') {
        var preset_arcmin = 21600/value;
    } else {
        return;
    }
    return preset_arcmin;
}

function apply_preset_yaw_and_pitch(axis){
	var weap_index = window.current_selected_setting_weapon_number;
    if (axis == 'yaw') {
        var yaw = convert_to_arcmin(_id('setting_kovaak_yaw_num').dataset.value, _id('setting_kovaak_yaw_unit').dataset.value);
        if (!isFinite(yaw)) return;
        
	    engine.call("set_real_variable", "mouse_accel_post_scale_x:"+weap_index, yaw);
    } else if (axis == 'pitch') {
        var pitch = convert_to_arcmin(_id('setting_kovaak_pitch_num').dataset.value, _id('setting_kovaak_pitch_unit').dataset.value);
        if (!isFinite(pitch)) return;
        
	    engine.call("set_real_variable", "mouse_accel_post_scale_y:"+weap_index, pitch);
    } else {
	    var preset_str = _id('setting_kovaak_yaw_pitch_preset').dataset.value;
	    var preset_obj = window.yaw_pitch_preset_index[preset_str];
	    if (!preset_obj) return;
	    var preset_arcmin = convert_to_arcmin(preset_obj.value, preset_obj.unit);
	    if (!preset_arcmin) return;
	    
	    engine.call("set_real_variable", "mouse_accel_post_scale_x:"+weap_index, preset_arcmin);
	    engine.call("set_real_variable", "mouse_accel_post_scale_y:"+weap_index, preset_arcmin);
    }
	update_physical_sens('initialize',false);
}

function detect_preset_yaw_pitch() {
    var yaw   = Number(_id('setting_mouse_accel_post_scale_x').dataset.value);
    var pitch = Number(_id('setting_mouse_accel_post_scale_y').dataset.value);
    var found = false;
    var preset = 'custom';
    for (let key in window.yaw_pitch_preset_index) {
        let val = convert_to_arcmin(window.yaw_pitch_preset_index[key].value, window.yaw_pitch_preset_index[key].unit).toPrecision(6);
        if (yaw==val&&pitch==val) {
            preset=key;
            break;
        }
    }
    _id('setting_kovaak_yaw_pitch_preset').dataset.value = preset;
    update_select(_id('setting_kovaak_yaw_pitch_preset'));
    on_yaw_pitch_preset_select();
}

function on_yaw_pitch_preset_select() {
    var preset = _id('setting_kovaak_yaw_pitch_preset').dataset.value;
    var yaw   = Number(_id('setting_mouse_accel_post_scale_x').dataset.value);
    var pitch = Number(_id('setting_mouse_accel_post_scale_y').dataset.value);
    if (preset=='custom') {
       _id('setting_kovaak_custom_yaw').style.display = "flex";
       _id('setting_kovaak_custom_pitch').style.display = "flex";
       _id('setting_kovaak_apply_preset_button').style.display = "none";
        global_range_slider_map["setting_kovaak_yaw_num"].setValue(yaw);
        global_range_slider_map["setting_kovaak_pitch_num"].setValue(pitch);
	   _id('setting_kovaak_yaw_unit').dataset.value = 'arcmin';
	   _id('setting_kovaak_pitch_unit').dataset.value = 'arcmin';
	    update_select(_id('setting_kovaak_yaw_unit'));
	    update_select(_id('setting_kovaak_pitch_unit'));
    } else {
       _id('setting_kovaak_custom_yaw').style.display = "none";
       _id('setting_kovaak_custom_pitch').style.display = "none";
       _id('setting_kovaak_apply_preset_button').style.display = "flex";
    }
}

window.yaw_pitch_preset_index = {
    'db': {
        'text' : 'Diabotical',
        'unit' : 'arcmin',
        'value': '1',
    },
    'cs': {
        'text' : 'Quake/Source',
        'unit' : 'deg',
        'value': '0.022',
    },
    'ow': {
        'text' : 'Overwatch',
        'unit' : 'deg',
        'value': '0.0066',
    },
    'fn': {
        'text' : 'Fortnite',
        'unit' : 'deg',
        'value': '0.005555',
    },
    'reflex': {
        'text' : 'Reflex',
        'unit' : 'mrad',
        'value': '0.1',
    },
    'qcde': {
        'text' : 'QCDE',
        'unit' : 'division',
        'value': '8192',
    },  
};

window.current_selected_setting_weapon_number = 0;

function update_zoom_sensitivity_tick(span){
    if (!span) {        
        var fovHip  = _id('setting_fov').dataset.value;
        var fovZoom = _id('setting_zoom_fov').dataset.value;
        if (!(fovHip>0&&fovZoom>0&&fovHip<180&&fovZoom<180)) {
            return;
        }
        span = FOV_To_Focal_Length(fovHip)/FOV_To_Focal_Length(fovZoom);
    }
    if (span) {
        _id('setting_zoom_sensitivity').dataset.def = _id('setting_sensitivity').dataset.value * span;
        global_range_slider_map["mouse_zoom_sensitivity:"+window.current_selected_setting_weapon_number].setValue(_id('setting_zoom_sensitivity').dataset.value);
    }
}

function update_accel_chart() {
    //GAMEFACE this doesn't work in gameface so a new chart gizmo will need to be implemented
    
    //console.log("UPDATE DATA");
    //https://stackoverflow.com/questions/37621020/setting-width-and-height

    //NOTE: chart.js 2.6.0 works but 2.7.X didn't show area or lines for scatter charts

    var accel_settings = {
        offset       : _id('setting_mouse_accel_offset').dataset.value,
        type         : _id('setting_mouse_accel_type').dataset.value,
        cap          : _id('setting_mouse_accel_cap').dataset.value,
        toe          : _id('setting_mouse_accel_toe').dataset.value,
        ramp         : _id('setting_mouse_accel_ramp').dataset.value,
        gamma        : _id('setting_mouse_accel_gamma').dataset.value,
        domain       : _id('setting_mouse_accel_domain').dataset.value,
        post_scale_x : _id('setting_mouse_accel_post_scale_x').dataset.value,
        post_scale_y : _id('setting_mouse_accel_post_scale_y').dataset.value,
        stigma_x     : _id('setting_mouse_accel_stigma_x').dataset.value,
        stigma_y     : _id('setting_mouse_accel_stigma_y').dataset.value,
        bias_x       : _id('setting_mouse_accel_bias_x').dataset.value,
        bias_y       : _id('setting_mouse_accel_bias_y').dataset.value,
        norm         : _id('setting_mouse_accel_norm').dataset.value,
    };

    if(accel_settings.type==0){
      return;
    }

    var max_value = 0;

    var data = [];
    var dt_ms = 1;
    var mid   = 0.1;
    var end   = 128;
    if (accel_settings.offset > 0) {
        mid = accel_settings.offset;
        if (end < (mid*2)) {
            end = (mid*2);
        }
    }
    if (!(accel_settings.cap<=1&&accel_settings.type==1)) {
        var nominal_slope=0;
        if (accel_settings.type == 1) {
            nominal_slope = accel_settings.ramp;
        } else if (accel_settings.type == 2) {
            nominal_slope = (accel_settings.cap-1)/accel_settings.domain;
        } else if (accel_settings.type == 3) {
            nominal_slope = (accel_settings.cap-1)*accel_settings.toe;
        }
        if (nominal_slope!=0) {
            end = 2 * ( (accel_settings.cap-1) / nominal_slope );
            if (end < (mid*2)) {
                end = (mid*2);
            }
        }
    }
    var incr  = end/128;
    for (i = 0; i < end; i+=incr) {
        var x = i;
        var data_point = apply_accel(x, 0, dt_ms, accel_settings);
        var val = data_point.x / x;
        data.push({ x: x, y: val });
        if (Number.isFinite(val)) {
            max_value = Math.max(val, max_value);
        }
    }
    for (var max_rate = 1; max_rate<end; max_rate*=2) {}
    //console.log(max_value);

    //console.log(_dump(data));

    // Disable the irritating initial animation
    Chart.defaults.global.animation.duration = 0;
    Chart.defaults.global.defaultFontColor = "#eee";
    Chart.defaults.global.defaultFontSize = 12 * window.innerHeight / 1080;

    var ctx = document.getElementById('accel_chart').getContext('2d');
        
    var scatterChartData = {
        datasets: [
            {
	            label: "multiplier_vs_cpms",
	            xAxisID: "cpms",
	            yAxisID: "multiplier",
	            borderColor: "#4f7a9e",
	            borderWidth: 0,
	            backgroundColor: "#4f7a9e",
	            showLine: true,
	            fill: false,
	            data: data
            },
        ],
    };
        
    if (window.accel_chart_reference) window.accel_chart_reference.destroy(); // re-draw rather than update so that canvas size is rescaled, in case this is run on gameface first load
    window.accel_chart_reference = new Chart(ctx, {
        type: 'scatter',
        data: scatterChartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            legend: { display: false },
            tooltips: { enabled: false },
            hover: { mode: false },
        	scales: {
                xAxes: [
	                {
	                    id: "cpms",
	                    position: "bottom",
	                    scaleLabel: {
                            display: true,
                            padding: {
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0
                            },
                            labelString: "Counts per millisecond (cpms)",
	                    },
	                    gridLines: {
	                   		drawTicks: false,
                            zeroLineColor: "#eee",
                            color:"rgba(255,255,255,0.05)",
	                    },
	                    ticks: {
	                        beginAtZero: true,
	                        max: max_rate,
                            stepSize: max_rate/8,
	                    },
	                },
                ],
                yAxes: [
	                {
	                    id: "multiplier",
	                    position: "left",
	                    display: true,
	                    scaleLabel: {
                            display: true,
                            padding: {
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0
                            },
                            labelString: "x100%",
	                    },
	                    gridLines: {
	                		tickMarkLength: 2,
                            zeroLineColor: "#eee",
                            color:"rgba(255,255,255,0.05)",
	                    }, 
	                    ticks: {
	                        beginAtZero: true, // important because accel starts at 1
	                    },
	                },
//	                {
//	                    position: "right",
//	                    display: true,
//	                    scaleLabel: {
//	                        display: true,
//	                        labelString: "Sensitivity"
//	                    },
//	                    gridLines: {
//	                		tickMarkLength: 0,
//	                        zeroLineColor: "#4f7a9e",
//	                        drawOnChartArea: false,
//	                   		drawTicks: false,
//	                    }, 
//	                    ticks: {
//	                        beginAtZero: true // important because accel starts at 1
//	                    },
//	                },
                ],
            },
	        layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
	        },
        },
    });
        
}


function apply_accel(x, y, dt, settings) {
    return modernized_accel_calculation(x, y, dt, settings);
}

function modernized_accel_calculation(x, y, dt, settings){

      if (!dt) {
          return { x: 0, y: 0 };
      }
      var dx = x;
      var dy = y;

      if (settings.type && dt) {

          // normalize rate
          var offset = settings.offset;
          var domain = settings.domain;
          var gamma  = settings.gamma;
          var norm   = settings.norm;                                           // customizable LP norm, standard is 2, taxicab is 1
          var type   = settings.type;
          var ramp   = settings.ramp;
          var cap    = settings.cap;
          var toe    = settings.toe;
          var rx     = Math.pow(dx * settings.stigma_x, norm);                  // stigma corrects sensor anisotropy causing different accel response per axis
          var ry     = Math.pow(dy * settings.stigma_y, norm);                  // stigma of zero means accel has no dependence on that axial component
          var rate   = Math.pow(rx+ry, 1/norm) / dt;                            // rate normalized to different LP norm

          if (rate > offset) {
              var gain = 0;
              if (type == 1){                                                   // linear accel, the traditional accel that vast majority uses
                  gain = ramp * (rate - offset);                                // calculate gain based on ramp rate with offset
                  if (cap > 0 && gain > cap - 1) {                              // only clamp positive cap
                      gain = cap - 1;                                           // clamp gain to difference of cap and baseline
                  }
              } else if (type == 2){                                            // gamma accel, useful for setting any capped accel by speed range as well as dooi accel
                  gain = cap - 1;                                               // clamp to max increase unless in accel domain
                  rate -= offset;                                               // apply offset
                  if (rate < domain) {                                          // accel domain is fixed interval so unaffected by offset
                      gain *= Math.pow(rate/domain, gamma);                     // relative to cap so ramps down gracefully to lower cap
                  }
              } else if (type == 3){                                            // exp accel, useful for smoothly reaching cap and fully counters high speed inconsistency caused by sensor framerate quantization artifact
                  cap  = cap - 1;                                               // set growth bound to max increase
                  gain = cap * (1 - Math.exp((offset-rate)*toe/Math.abs(cap))); // abs so that lower cap gracefully ramps down
              }
              // apply accel
              dx *= (gain * settings.bias_x + 1);                               // bias is the distribution of resulting accel to each axis
              dy *= (gain * settings.bias_y + 1);                               // bias of zero means accel only applied to that axis
          }

      }

      // //Apply post scale
      // dx *= settings.post_scale_x;
      // dy *= settings.post_scale_y;

      return { x: dx, y: dy };

}

function toggle_ultra_advanced_accel(el) {    
    if (el.classList.contains("selected")) {
        ultra_advanced_accel_visible(false);
    } else {
        ultra_advanced_accel_visible(true);
    }
}

function ultra_advanced_accel_visible(bool) {
    let toggle = _id("ultra_advanced_accel_toggle");
    let ultra_accel = _id("ultra_advanced_accel_settings");
    let accel_chart = _id("accel_chart_cont");

    if (bool) {
        toggle.classList.add("selected");
        accel_chart.style.display = "none";
        ultra_accel.style.display = "flex";
    } else {
        toggle.classList.remove("selected");
        accel_chart.style.display = "flex";
        ultra_accel.style.display = "none";

        req_anim_frame(() => {
            update_accel_chart();
        }, 2);
    }
}

function update_accel_options(element){
    var val=_id('setting_mouse_accel_type').dataset.value;
    if (val=="0") {
        _id('linear_accel_only_settings').style.display='none';
        _id('gamma_accel_only_settings').style.display='none';
        _id('exp_accel_only_settings').style.display='none';
    } else if (val=="1"){
        _id('linear_accel_only_settings').style.display='block';
        _id('gamma_accel_only_settings').style.display='none';
        _id('exp_accel_only_settings').style.display='none';
    } else if (val=="2"){
        _id('linear_accel_only_settings').style.display='none';
        _id('gamma_accel_only_settings').style.display='block';
        _id('exp_accel_only_settings').style.display='none';
    } else if (val=="3"){
        _id('linear_accel_only_settings').style.display='none';
        _id('gamma_accel_only_settings').style.display='none';
        _id('exp_accel_only_settings').style.display='block';
    }

    ultra_advanced_accel_visible(false);

    if (element.dataset.value == "0") {
        //setTimeout(function() { update_accel_chart(); });
        if (window.myScatter) window.myScatter.destroy();
        _for_each_with_class_in_parent(_id("weapon_sheet"), "extra_acceleration_settings", function(el) {
            el.style.display = "none";
            el.style.opacity = 0;
        });
    } else {
        setTimeout(function() { update_accel_chart(); });
        _for_each_with_class_in_parent(_id("weapon_sheet"), "extra_acceleration_settings", function(el) {
            el.style.display = "flex";
            el.style.opacity = 1;
        });
    }
}

/*
function misc_fl_trigger(flag) {
    write_misc_hud_preference('fl', '1');
    place_direction_hints_element(false);
    engine.call("set_real_variable", "lobby_custom_physics", flag);
}
*/

function update_physical_sens(id_str,from_engine){
    var zoom = id_str.includes('zoom');
    var weap_index = window.current_selected_setting_weapon_number;
    var update = false;
    
    
    var yaw   = _id('setting_mouse_accel_post_scale_x').dataset.value;
    var pitch = _id('setting_mouse_accel_post_scale_y').dataset.value;
    update_sensitivity_slider_range(yaw,pitch);
    
    var imp_unit   = _id('setting_imperial').dataset.value=='1'?true:false;
    var cpi_mouse  = _id('setting_mouse_cpi').dataset.value;
    
    
    var hip_incre  = _id('incre_field').dataset.value;
    var hip_curvat = _id('curvat_field').dataset.value;
    var hip_circum = _id('circum_field').dataset.value;
    var ads_incre  = _id('incre_zoom_field').dataset.value;
    var ads_curvat = _id('curvat_zoom_field').dataset.value;
    var ads_circum = _id('circum_zoom_field').dataset.value;
    
    if (id_str == "initialize") {
        hip_incre = _id('setting_sensitivity').dataset.value * yaw;
        ads_incre = _id('setting_zoom_sensitivity').dataset.value * yaw;
        global_range_slider_map["incre_field"].setValue(hip_incre);
        global_range_slider_map["incre_zoom_field"].setValue(ads_incre);
    }
    
    //selectively alter the fields
    if (id_str == "setting_imperial"||id_str == "setting_mouse_cpi"||
        id_str == "initialize"||id_str == "setting_mouse_accel_post_scale_x") {
        hip_curvat = hip_incre * cpi_mouse / (imp_unit?1:1524);
        ads_curvat = ads_incre * cpi_mouse / (imp_unit?1:1524);
        hip_circum = (imp_unit?1:2.54) * 21600 / hip_incre / cpi_mouse;
        ads_circum = (imp_unit?1:2.54) * 21600 / ads_incre / cpi_mouse;
        global_range_slider_map["curvat_field"].setValue(hip_curvat);
        global_range_slider_map["circum_field"].setValue(hip_circum);
        global_range_slider_map["curvat_zoom_field"].setValue(ads_curvat);
        global_range_slider_map["circum_zoom_field"].setValue(ads_circum);
    } else if (id_str.includes('incre')) {
        if (zoom) {
            ads_curvat = ads_incre * cpi_mouse / (imp_unit?1:1524);
            ads_circum = (imp_unit?1:2.54) * 21600 / ads_incre / cpi_mouse;
            global_range_slider_map["curvat_zoom_field"].setValue(ads_curvat);
            global_range_slider_map["circum_zoom_field"].setValue(ads_circum);
        } else {
            hip_curvat = hip_incre * cpi_mouse / (imp_unit?1:1524);
            hip_circum = (imp_unit?1:2.54) * 21600 / hip_incre / cpi_mouse;
            global_range_slider_map["curvat_field"].setValue(hip_curvat);
            global_range_slider_map["circum_field"].setValue(hip_circum);
        }
        update=true;
    } else if (id_str.includes('circum')) {
        if (zoom){
            ads_curvat = (imp_unit?21600:36) / ads_circum;
            ads_incre  = (imp_unit?1:2.54) * 21600 / ads_circum / cpi_mouse;
            global_range_slider_map["curvat_zoom_field"].setValue(ads_curvat);
            global_range_slider_map["incre_zoom_field"].setValue(ads_incre);
        } else {
            hip_curvat = (imp_unit?21600:36) / hip_circum;
            hip_incre  = (imp_unit?1:2.54) * 21600 / hip_circum / cpi_mouse;
            global_range_slider_map["curvat_field"].setValue(hip_curvat);
            global_range_slider_map["incre_field"].setValue(hip_incre);
        }
        update=true;
    } else if (id_str.includes('curvat')) {
        if (zoom) {
            ads_circum = (imp_unit?21600:36) / ads_curvat;
            ads_incre  = (imp_unit?1:1524) * ads_curvat / cpi_mouse;
            global_range_slider_map["incre_zoom_field"].setValue(ads_incre);
            global_range_slider_map["circum_zoom_field"].setValue(ads_circum);
        } else {
            hip_circum = (imp_unit?21600:36) / hip_curvat;
            hip_incre  = (imp_unit?1:1524) * hip_curvat / cpi_mouse;
            global_range_slider_map["incre_field"].setValue(hip_incre);
            global_range_slider_map["circum_field"].setValue(hip_circum);
        }
        update=true;
    }
    
    //always check the unit state since they're both by default hidden
    _id('imperial_circumference_unit').style.display=imp_unit?'flex':'none';
    _id('metric_circumference_unit').style.display=imp_unit?'none':'flex';
    _id('imperial_curvature_unit').style.display=imp_unit?'flex':'none';
    _id('metric_curvature_unit').style.display=imp_unit?'none':'flex';
    
    //only push the change if it's not engine preload
    if (!from_engine&&update) {
    	if (zoom) {
	        engine.call("set_real_variable", "mouse_zoom_sensitivity:"+weap_index, ads_incre/yaw);
    	} else {
	        engine.call("set_real_variable", "mouse_sensitivity:"+weap_index, hip_incre/yaw);
    	}
    	update_zoom_sensitivity_tick(0);
        sound_enter();
    }
    
}

function update_sensitivity_slider_range(yaw, pitch) {
    if(!isFinite(yaw)&&!isFinite(pitch)) return;
    var max = Math.min( Math.ceil( 6 / Math.min(yaw,pitch) ) , 100 );
    _id('setting_sensitivity').dataset.max       = max;
    _id('setting_zoom_sensitivity').dataset.max  = max;
    global_range_slider_map["mouse_sensitivity:"+window.current_selected_setting_weapon_number].setValue(_id('setting_sensitivity').dataset.value);
    global_range_slider_map["mouse_zoom_sensitivity:"+window.current_selected_setting_weapon_number].setValue(_id('setting_zoom_sensitivity').dataset.value);
}