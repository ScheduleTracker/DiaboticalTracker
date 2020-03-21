global_onload_callbacks.push(function(){

    const element = new HUD_element('g_meter', //Editor name
    "", //Default content
    {
        "pivot": "center",
        "fontSize": "4.5",
        "font": "roboto-bold",
        "ringInnerSize": "78",
        "size": "14",
        "opacity": "0.6",
        "showSpeed": "3",
        "cjspeed":"390",
        "previewpitch":"-23.5",
    },
    [
        hiddenPivot,
        {"inputType": "float", "type": "cjspeed", "text": "Circlejump Takeoff Speed (ups)"},
        {"inputType": "list",  "type": "showSpeed", "text": "Display text", "listValues":
            [
                {"name": "None", "value": "4"},
                {"name": "Speed", "value": "1"},
                {"name": "Throttle", "value": "0"},
                {"name": "Speed and Throttle", "value": "3"},
                {"name": "Throttle and Speed", "value": "2"},
            ]
        },
        {"inputType": "toggle", "type": "showIn3D", "text": "3D mode"},
        {"inputType": "toggle", "type": "hideKeypress", "text": "Hide bezel"},
        defaultX,
        defaultY,
        {"inputType": "float", "type": "opacity", "text": "Opacity"},
        {"inputType": "float", "type": "size", "text": "Size"},
        {"inputType": "float", "type": "ringInnerSize", "text": "Inner size (0-90%)"},
        defaultFontSize,
        defaultFontFamily,
    ]
    , "#hud_g_meter");
    hud_elements.push(element);

    const element2 = new HUD_element('throttle', //Editor name
    "", //Default content
    {
        "barHeight": "1",
        "barWidth": "14",
        "fontSize": "5",
        "font": "agencyfb-bold",
        "opacity": "1",
        "shadow":"1",
        "reversed":"1",
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float", "type": "barWidth", "text": "Throttle Bar Width"},
        {"inputType": "float", "type": "barHeight", "text": "Throttle Bar Height"},
        {"inputType": "float", "type": "opacity", "text": "Opacity"},
        defaultFontSize,
        defaultFontFamily,
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "toggle", "type": "hidePercent", "text": "Throttle Bar"},
        {"inputType": "toggle", "type": "reversed", "text": "Invert Scroll"},
    ]
    , "#hud_throttle");
    hud_elements.push(element2);
    
    const element3 = new HUD_element('yaw_ruler', //Editor name
    "", //Default content
    {
        "pivot": "center",
        "x": "50",
        "y": "50",
        "bandColor": "rgba(255,255,255,0.5)",
    },
    [
        hiddenPivot,
        hiddenX,
        hiddenY,
        {"inputType": "color", "type": "bandColor", "text": "Color"},
        {"inputType": "toggle", "type": "crop", "text": "Clip to Vanishing Point"},
    ]
    , "#hud_yaw_ruler");
    hud_elements.push(element3);


    bind_event('set_hud_speed', function (speed_hor, speed_x, speed_y, speed_z, str) {
        if (global_hud_need_strafe_calculations||global_hud_need_pitch_calculations) {
            var input = str.split(",",3);
            var yaw = Number(input[0].replace("[", "")) % (2*Math.PI);
            var pitch = Number(input[1]);
            var mask = Number(input[2]);
            var obj = str.split("{");
            obj = obj[1].split("}");
            obj = '{' + obj[0] + '}';
            obj = JSON.parse(obj);
            var fov_changed   = global_hud_last_fov_cache == obj.fov ? false : true;
            var pitch_changed = global_hud_last_pitch_cache == pitch ? false : true;
            if (fov_changed) {
                 global_hud_last_fov_cache  = obj.fov;
                 global_hud_half_fov_cache  = obj.fov*Math.PI/360;
                 global_hud_fov_sin_cache = Math.sin(global_hud_half_fov_cache);
                 global_hud_fov_cos_cache = Math.cos(global_hud_half_fov_cache);
                 global_hud_3d_focal_length = 50*global_hud_fov_cos_cache/global_hud_fov_sin_cache;
                 real_hud_element.style.perspective = global_hud_3d_focal_length + "vh";
            }
            if (pitch_changed||fov_changed) {
                global_hud_last_pitch_cache = pitch;
	            strafe_data.pitch_deg = pitch*180/Math.PI;
	            if (global_hud_need_pitch_calculations) {
	                var trans_deg = 90 - strafe_data.pitch_deg;
                    for (i = 0; i < global_hud_3d_counts; i++) {
                         global_hud_3d_instance[i].style.transform = "translate(-50%,-50%) rotateX(" + trans_deg + "deg)";
                    }
					var pitch_cos = Math.cos(pitch);
					var pitch_sin = Math.sin(pitch);
					var diam = global_hud_3d_focal_length * pitch_cos * 2;
					var clip = global_hud_3d_focal_length * global_hud_fov_sin_cache / (global_hud_fov_sin_cache*pitch_cos + global_hud_fov_cos_cache*Math.abs(pitch_sin));
					var vani = global_hud_3d_focal_length * pitch_sin/pitch_cos;
					var crop = 100 * Math.abs(vani) / (50 + Math.abs(vani));
					strafe_data.pitch_diam = diam*onevh_float + "px";
					strafe_data.pitch_clip = Math.min(clip,diam)*onevh_float + "px";
					strafe_data.pitch_crop = Math.min(crop*onevw_float,diam*onevh_float) + 'px';
	            }
//	            if (Math.abs(strafe_data.pitch_deg)>45.1) {
//	                var ecce = Math.tan(Math.PI/2-pitch);
//	                strafe_data.semi_major = Math.round(global_hud_3d_focal_length * Math.abs(Math.tan(2*pitch)) * onevh_float) + "px";
//	                strafe_data.semi_minor = Math.round(global_hud_3d_focal_length * Math.abs(Math.tan(2*pitch)) * Math.sqrt(1-ecce*ecce) * onevh_float) + "px";
//                }
            }
            if (global_hud_need_strafe_calculations) {
                refresh_strafe_hud(mask, obj, yaw, speed_x, speed_y, speed_z);
            }
        }
    });

});

let global_hud_fov_sin_cache = 1;
let global_hud_fov_cos_cache = 1;
let global_hud_half_fov_cache = 0;
let global_hud_last_fov_cache = 0;
let global_hud_last_pitch_cache = 0;
let global_hud_3d_focal_length = 0;