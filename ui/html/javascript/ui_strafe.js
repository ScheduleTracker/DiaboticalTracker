const HACKY_CONST_BLACK = '#000000';
let global_strafe_timer = 0;
let global_strafe_state = {x:0,y:0,z:0,yaw:0,key:0};
let global_keypress_memory = 0;
let global_strafeEfficiencyBufferLength = 2000;
let global_strafeEfficiencySmoothTime = 100;
let global_strafeEfficiencyIndex = 0;
let global_lastStrafeEfficiency = make_strafe_efficiency_memory(global_strafeEfficiencyBufferLength);
let global_presentedStrafeEfficiency = 0;

let global_hud_3d_counts=0;
let global_hud_3d_instance=[];

let strafe_data = IS_MENU_VIEW == true ? {"efficiency":"80","wallheight":"44.4444%","wallwidth":"45.8%","lineheight":"100%","abovebase":true,"veldir":"0","arrowopa":1,"haskey":true,"keydir":315,"dot_trans":"-40%","color":"rgb(92,255,204)","shadowcolor":"rgb(0,0,0)"} : {"efficiency":"0","shadowcolor":"rgb(0,0,0)"};

function refresh_strafe_hud(intent_mask, obj, yaw, speed_x, speed_y, speed_z){

    var time_snapshot = performance.now();
    var dt = time_snapshot - global_strafe_timer; //only ever used for smoothing, not needed for calculations
    global_strafe_timer = time_snapshot;
    
    if (strafe_state_check(intent_mask, yaw, speed_x, speed_y, speed_z)) {
    
        var keypress_changed = false;
        if (global_keypress_memory != intent_mask) {
            global_keypress_memory  = intent_mask;
            keypress_changed = true;
        }
        var lastEff = global_lastStrafeEfficiency;
        var update_efficiency = true;
        var strEff='0';
        var strPwr='0';
        var strAcc='0';
        var jump  = ((intent_mask & 4)/4) ? true : false;
        var couch = ((intent_mask & 8)/8) ? true : false;
        var z_acc = (intent_mask & 4)/4 - (intent_mask & 8)/8;
        var y_acc = (intent_mask & 2)/2 - (intent_mask & 1);
        var x_acc = (intent_mask & 16)/16 - (intent_mask & 32)/32;
        var speed_zx = Math.sqrt( (speed_z*speed_z) + (speed_x*speed_x) );
        var speed_hor= Math.floor(speed_zx);
        var speed_str= Math.round(speed_zx);
        var base_speed   = obj.base_speed;
        var accel_upss   = obj.base_speed*obj.accel;
        var tickrate     = obj.on_ground==true?500:obj.tickrate;
        var inCircleJump = (obj.on_ground==true&&speed_hor>base_speed&&!jump)?true:false;
        var cos = Math.cos(-yaw);
        var sin = Math.sin(-yaw);
        var vel = [speed_z,-speed_x];
        var efficiency = 0;
        var unsmoothed_efficiency = efficiency;
        var dir = [0,0];
        var nor = Math.sqrt( x_acc*x_acc + y_acc*y_acc );
        
        if (nor > 0 && base_speed) {
        
            dir = [ x_acc/nor , y_acc/nor ];
            var acc           = [ cos*dir[0] - sin*dir[1] , cos*dir[1] + sin*dir[0] ];
            var dot           = acc[0]*vel[0] + acc[1]*vel[1];                              //currently in units of ups, acc is orthonormal
            var attenuation   = Math.max( (base_speed/dot-1)*speed_zx , 0 );                //simultaneously takes care of deadzone and clipping conditions
            var tickaccel     = dot>0 ? attenuation*tickrate : accel_upss;                  //pseudomagnitude mapping of intended accel directions
            var power_output  = Math.min(accel_upss,tickaccel)*dot;                         //in units of u^2/s^3 since dot is actually in upss
            var torque_output = speed_zx > 0 ? power_output/speed_zx : 0;                   //in units of upss
            var maxTorque     = torque_curve( speed_zx, base_speed, accel_upss, tickrate ); //presuming correct normalization, tringular bonus not yet added
            if ( speed_zx > base_speed ) {                                                  //only calculate triangular bonus when greater than base speed
                maxTorque    += torque_bonus( speed_zx, accel_upss,  maxTorque, tickrate ); //always true, proof by triangular inequality
                torque_output+= torque_bonus( speed_zx, Math.min(accel_upss,tickaccel), torque_output, tickrate );
                power_output  = torque_output*speed_zx;
            }                   
            
            
            efficiency = power_output<0 ? torque_output/accel_upss : torque_output/maxTorque;
            
            if (isFinite(efficiency)){
                unsmoothed_efficiency = efficiency;
                if ( speed_zx>base_speed && !keypress_changed) {
                    var frame=Math.round(global_strafeEfficiencySmoothTime/dt);
                    var efficiency_delta = Math.abs(global_presentedStrafeEfficiency-efficiency);
                    if (efficiency_delta>(1/frame)||strEff==100||tickaccel<=accel_upss) {
                        frame=Math.min(frame,global_strafeEfficiencyBufferLength);
                        lastEff[global_strafeEfficiencyIndex] = efficiency;
                        efficiency = smooth_strafe_efficiency(global_strafeEfficiencyIndex,lastEff,frame);
                    }
                }
                strEff=Math.round(100*efficiency);
                strPwr=Math.round(power_output);
                strAcc=Math.round(efficiency*(dot>0?maxTorque:accel_upss));
            } else {
                efficiency = 0;
            }
            
        }
        
        global_lastStrafeEfficiency[global_strafeEfficiencyIndex] = unsmoothed_efficiency;
        global_strafeEfficiencyIndex++;
        if (global_strafeEfficiencyIndex>=global_strafeEfficiencyBufferLength) global_strafeEfficiencyIndex -= global_strafeEfficiencyBufferLength;
        if (global_presentedStrafeEfficiency==efficiency || !isFinite(efficiency)) update_efficiency = false;
        global_presentedStrafeEfficiency=efficiency;
        
        
        


        var wallHeight = 50*base_speed/Math.max(base_speed,speed_zx);
        var innerWidth = Math.sqrt( 10000 - 4*wallHeight*wallHeight );
        var veldir_rad = Math.atan2(vel[1],vel[0])+yaw;
        var keydir_rad = Math.atan2(-y_acc,x_acc);
        strafe_data.wallheight = wallHeight+'%';
        strafe_data.wallwidth  = innerWidth+'%';
        strafe_data.abovebase = (speed_hor>base_speed);
        strafe_data.arrowopa = Math.min(1,speed_hor/base_speed);
        strafe_data.rippleopa = Math.min(1,0.25*speed_hor/base_speed);
        strafe_data.veldir = -veldir_rad*180/Math.PI;
        strafe_data.cj = inCircleJump;
        strafe_data.cjbase = inCircleJump ? base_speed : 320;
		if (keypress_changed) {
            strafe_data.jump   = jump;
            strafe_data.crouch = couch;
            strafe_data.haskey = nor ? true : false;
		    strafe_data.keydir = keydir_rad*180/Math.PI;
		}
        strafe_data.lineheight = strEff<0 ? '100%' : Math.min( 100, Math.abs(2*wallHeight/Math.cos(keydir_rad+veldir_rad) ) ) + '%';
        strafe_data.spin = Math.sin(keydir_rad+veldir_rad) > 0 ? true : false;
        if (update_efficiency) {
	        var eff_color_rgb = 'rgb(255,255,255)';
	        strafe_data.throttle = '0%';
	        if (speed_hor>base_speed) {
	            if (strEff<0) {
	              //eff_color_rgb='rgb(200,50,50)';
	              eff_color_rgb='rgb(255,0,0)';
	              strafe_data.throttle = 75 - 25*unsmoothed_efficiency +'%';
	            } else if (tickaccel>=accel_upss) {
	              eff_color_rgb='rgb(' + _clamp(Math.round(255-255*strEff*strEff/10000),0,255) + ', 255,' + _clamp(Math.round(255*strEff/100),0,255) + ')';
	              strafe_data.throttle = 75 - 25*unsmoothed_efficiency +'%';
	            } else {
	              eff_color_rgb='rgb(' + _clamp(Math.round(255-255*strEff*strEff*strEff/1000000),0,255) + ', 255, 255)';
	              strafe_data.throttle = 50*unsmoothed_efficiency +'%';
	            }
	        }
//	        var scaled_dot_dist = Math.abs(efficiency*99.2773891679)/2;
//	        var scaled_dot_dist = Math.abs(efficiency*50);
	        var scaled_dot_dist = Math.abs(strEff/2);
	        strafe_data.efficiency = strEff;
	        strafe_data.dot_trans  = -scaled_dot_dist+"%";
	        strafe_data.color      = eff_color_rgb;
	        strafe_data.horsepower = strPwr;
	        strafe_data.torque     = strAcc;
	        //element.innerHTML = strPwr+'u²/s³<br>'+strAcc+'upss@'+speed_str+'ups';
	    }
    }
}



function torque_curve(current_speed, rated_speed, rated_accel, physics_rate){
    var torque = rated_accel;
    if (current_speed>rated_speed){
        torque = rated_speed * rated_accel / (current_speed + rated_accel/physics_rate);
    } return torque;
}

function torque_bonus(current_speed, acc_full, acc_proj, physics_rate){
    var delta_speed_full = acc_full/physics_rate;
    var delta_speed_proj = acc_proj/physics_rate;
    var delta_hor = Math.sqrt(delta_speed_full*delta_speed_full - delta_speed_proj*delta_speed_proj);
    var speedproj = current_speed + delta_speed_proj;
    var bonus = Math.sqrt(speedproj*speedproj + delta_hor*delta_hor) - speedproj;
    return bonus*physics_rate;
}

function make_strafe_efficiency_memory(frames){
    var array = new Array(frames);
    for(i=0;i<frames;i++){
      array[i] = 0;
    } return array;
}

function smooth_strafe_efficiency(index,array,frames){
    var weight = 1;
    var sum = array[index]*weight;
    var j = Math.max(frames-1,0);
    var ctr = index-1;
    for(i=0;i<j;i++){
        sum += array[ctr];
        ctr--;
        if (ctr<0) ctr += array.length;
    } return sum/(j+weight);
}

function strafe_state_check(intent_mask, yaw, speed_x, speed_y, speed_z){
    var ref = global_strafe_state;
    var changed = false;
        changed = yaw         == ref.yaw ? changed : true;
        changed = speed_x     == ref.x   ? changed : true;
        changed = speed_y     == ref.y   ? changed : true;
        changed = speed_z     == ref.z   ? changed : true;
        changed = intent_mask == ref.key ? changed : true;
    if (changed) {
        global_strafe_state = {x:speed_x,y:speed_y,z:speed_z,yaw:yaw,key:intent_mask};
    } return changed;
}
 
function gameface_strafe_prefetch_check(){
      global_hud_need_strafe_calculations = real_hud_container.getElementsByClassName("need_strafe_calc")[0] ? true : false;
      global_hud_need_pitch_calculations  = real_hud_container.getElementsByClassName("need_pitch_calc")[0]  ? true : false;
  if (global_hud_need_pitch_calculations) {
      global_hud_3d_instance = [];
     _for_each_with_class_in_parent(real_hud_container, "elem_yaw_ruler", function (element) { if (element.getElementsByClassName("need_pitch_calc")[0]) global_hud_3d_instance.push(element); });
     _for_each_with_class_in_parent(real_hud_container, "elem_g_meter"  , function (element) { if (element.getElementsByClassName("need_pitch_calc")[0]) global_hud_3d_instance.push(element); }); 
      global_hud_3d_counts = global_hud_3d_instance.length;
  }
}

function strafe_cj_opacity(speed, thresh) {
    return (thresh>strafe_data.cjbase) ? _clamp((speed - strafe_data.cjbase)/(thresh - strafe_data.cjbase),0,1) : 1;
}

function duel_stocks(my_score,opponent_score,me_alive){
//    return Math.max((me_alive?0:1), my_score-opponent_score+(me_alive?0:1));
    if (my_score>opponent_score) {
        return my_score-opponent_score;
    } else {
        return 0;
    }
}

function is_stock_protected(my_score,opponent_score,me_alive){
    if (current_match.confirmation_frag_time==true) return false;
    return true;
}

function dummy_stock_array_maker(my_score,opponent_score,me_alive){
    var stocks = duel_stocks(my_score,opponent_score,me_alive);
    var array = [];
    for(i=0;i<stocks;i++){
        array.push('o');
    }
    return array;
}

function operating_eggbot_image(me_alive, icon_index){
    if (me_alive) {
        return '/html/images/diabotical_o.svg?fill=';
    } else {
        if (Number(icon_index)==1) {
            return '/html/images/icons/fa/wrench.svg?fill=';
        } else {
            return '/html/images/icons/fa/heart.svg?fill=';
        }
    }
}
//function is_my_respawn_closest(timer, players_list) {
//echo(JSON.stringify(players_list));
//return timer;
//}