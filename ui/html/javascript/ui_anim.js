//Simple animation facility. This was created because anime.js is a bit slow at creating
//animations, anywhere from 0.3ms to 2ms sometimes! This by contrast takes 0 most of the
//times.
//
//Some things to understand:
//1. Note that the same options object that we receive is stored for internal use
//as an optimization, so don't reuse it from the calling code.
//2. We don't bother currently to erase previous animations on an element, instead we rely on
//new animations overriding remaining frames of the previous ones. This will work fine
//as long as durations of all animations on an item are consistent.
//
//Example usage:
//  anim_start({
//      element: el,
//      scale: [1.3, 1],
//  });

_last_anim_update = performance.now();

function anim_update(timestamp){
    let dt = timestamp - _last_anim_update;
    _last_anim_update = timestamp;

    for (var i = 0; i < _animations.length; i++){ 
        let anim = _animations[i];
        let delete_this = false;
        anim.age += dt;
        let t = clamp((anim.age - anim.delay) / anim.duration, 0, 1);
        if (anim.alternate){
           t *= 2; 
           if (t > 1){
               t = 2-t;
           }
        }
        if (anim.easing){
            t = anim.easing(t);
        }
        
        //New parameters can be implemented by adding them here:

        // [from, to, callback]
        if (anim.number){
            let val = Math.floor(lerp(anim.number[0], anim.number[1], t));

            if (typeof anim.number[2] == "function") {
                anim.number[2](val);
            }

            anim.element.textContent = val;
        }
        if (anim.scale){
            let val = lerp(anim.scale[0], anim.scale[1], t);
            anim.element.style.transform = "scale("+val+")";
        }
        if (anim.opacity){
            let val = lerp(anim.opacity[0], anim.opacity[1], t);
            anim.element.style.opacity = val;
        }
        if (anim.translateX){
            let val = lerp(anim.translateX[0], anim.translateX[1], t);
            //Note that the 3rd parameter is the unit, like "px" or "vh".
            anim.element.style.transform = "translateX("+val+anim.translateX[2]+")";
        }
        if (anim.translateY){
            let val = lerp(anim.translateY[0], anim.translateY[1], t);
            //Note that the 3rd parameter is the unit, like "px" or "vh".
            anim.element.style.transform = "translateY("+val+anim.translateY[2]+")";
        }

        if (anim.height){
            let val = lerp(anim.height[0], anim.height[1], t);
            //Note that the 3rd parameter is the unit, like "px", "vh" or "%".
            anim.element.style.height = val + "%";
        }

        if (anim.width){
            let val = lerp(anim.width[0], anim.width[1], t);
            //Note that the 3rd parameter is the unit, like "px", "vh" or "%".
            anim.element.style.width = val + anim.width[2];
        }
        
        if (anim.age >= anim.duration + anim.delay) {
            if (anim.hide){
                anim.element.style.display = "none";
            }
            if (anim.remove){
                let parent = anim.element.parentNode;
                if (parent){
                    parent.removeChild(anim.element);
                }
            }
            if (anim.completion){
                anim.completion();
            }
            _animations.splice(i, 1); 
            i--;
        }
    }
    window.requestAnimationFrame(anim_update);
}

var _animations = [];

function anim_start(options){
    if (!options.element) return;
    if (!options.duration) options.duration = 1000;
    if (!options.delay) options.delay = 0;
    if (options.show){
        //Helpful utility that makes the element visible before we start.
        
        if(options.displayType)
            options.element.style.display = options.displayType;
        else
            options.element.style.display = "flex";

        if (options.opacity){
            //Also take care of the initial opacity when used in combination with "show"
            options.element.style.opacity = options.opacity[0];
        }
        //Also remove the hide attribute on any other ongoing animations on the same object,
        //this avoids the disappearance issue when queuing fading animations quickly.
        for (var i = 0; i < _animations.length; i++){
            if (_animations[i].element == options.element){
                //We could just delete this too...
                _animations[i].hide = false;
            }
        }
    }
    options.creation_time = _last_anim_update;
    options.age = 0;
    _animations.push(options);
}

function anim_remove(element){

    for (var i = 0; i < _animations.length; i++){
        if (_animations[i].element == element){
           
            _animations.splice(i, 1);
            i--;
        }
    }
}

// We took these easing functions from chart.js, which in turn
// were adapted from Robert Penner's easing equations
// http://www.robertpenner.com/easing/
var easing_functions = {
    linear: function(t) {
        return t;
    },
    easeInQuad: function(t) {
        return t * t;
    },
    easeOutQuad: function(t) {
        return -1 * t * (t - 2);
    },
    easeInOutQuad: function(t) {
        if ((t /= 1 / 2) < 1) {
            return 1 / 2 * t * t;
        }
        return -1 / 2 * ((--t) * (t - 2) - 1);
    },
    easeInCubic: function(t) {
        return t * t * t;
    },
    easeOutCubic: function(t) {
        return ((t = t / 1 - 1) * t * t + 1);
    },
    easeInOutCubic: function(t) {
        if ((t /= 1 / 2) < 1) {
            return 1 / 2 * t * t * t;
        }
        return 1 / 2 * ((t -= 2) * t * t + 2);
    },
    easeInQuart: function(t) {
        return t * t * t * t;
    },
    easeOutQuart: function(t) {
        return -1 * ((t = t / 1 - 1) * t * t * t - 1);
    },
    easeInOutQuart: function(t) {
        if ((t /= 1 / 2) < 1) {
            return 1 / 2 * t * t * t * t;
        }
        return -1 / 2 * ((t -= 2) * t * t * t - 2);
    },
    easeInQuint: function(t) {
        return (t /= 1) * t * t * t * t;
    },
    easeOutQuint: function(t) {
        return ((t = t / 1 - 1) * t * t * t * t + 1);
    },
    easeInOutQuint: function(t) {
        if ((t /= 1 / 2) < 1) {
            return 1 / 2 * t * t * t * t * t;
        }
        return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
    },
    easeInSine: function(t) {
        return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
    },
    easeOutSine: function(t) {
        return Math.sin(t / 1 * (Math.PI / 2));
    },
    easeInOutSine: function(t) {
        return -1 / 2 * (Math.cos(Math.PI * t) - 1);
    },
    easeInExpo: function(t) {
        return (t === 0) ? 1 : Math.pow(2, 10 * (t / 1 - 1));
    },
    easeOutExpo: function(t) {
        return (t === 1) ? 1 : (-Math.pow(2, -10 * t) + 1);
    },
    easeInOutExpo: function(t) {
        if (t === 0) {
            return 0;
        }
        if (t === 1) {
            return 1;
        }
        if ((t /= 1 / 2) < 1) {
            return 1 / 2 * Math.pow(2, 10 * (t - 1));
        }
        return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
    },
    easeInCirc: function(t) {
        if (t >= 1) {
            return t;
        }
        return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
    },
    easeOutCirc: function(t) {
        return Math.sqrt(1 - (t = t / 1 - 1) * t);
    },
    easeInOutCirc: function(t) {
        if ((t /= 1 / 2) < 1) {
            return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
        }
        return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
    },
    easeInElastic: function(t) {
        var s = 1.70158;
        var p = 0;
        var a = 1;
        if (t === 0) {
            return 0;
        }
        if ((t /= 1) === 1) {
            return 1;
        }
        if (!p) {
            p = 0.3;
        }
        if (a < Math.abs(1)) {
            a = 1;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(1 / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
    },
    easeOutElastic: function(t) {
        var s = 1.70158;
        var p = 0;
        var a = 1;
        if (t === 0) {
            return 0;
        }
        if ((t /= 1) === 1) {
            return 1;
        }
        if (!p) {
            p = 0.3;
        }
        if (a < Math.abs(1)) {
            a = 1;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(1 / a);
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
    },
    easeInOutElastic: function(t) {
        var s = 1.70158;
        var p = 0;
        var a = 1;
        if (t === 0) {
            return 0;
        }
        if ((t /= 1 / 2) === 2) {
            return 1;
        }
        if (!p) {
            p = (0.3 * 1.5);
        }
        if (a < Math.abs(1)) {
            a = 1;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(1 / a);
        }
        if (t < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
    },
    easeInBack: function(t) {
        var s = 1.70158;
        return (t /= 1) * t * ((s + 1) * t - s);
    },
    easeOutBack: function(t) {
        var s = 1.70158;
        return ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
    },
    easeInOutBack: function(t) {
        var s = 1.70158;
        if ((t /= 1 / 2) < 1) {
            return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
        }
        return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
    },
    easeInBounce: function(t) {
        return 1 - easingEffects.easeOutBounce(1 - t);
    },
    easeOutBounce: function(t) {
        if ((t /= 1) < (1 / 2.75)) {
            return (7.5625 * t * t);
        } else if (t < (2 / 2.75)) {
            return (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
        } else if (t < (2.5 / 2.75)) {
            return (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
        }
        return (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
    },
    easeInOutBounce: function(t) {
        if (t < 1 / 2) {
            return easingEffects.easeInBounce(t * 2) * 0.5;
        }
        return easingEffects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
    }
};


//Simple replacement for jquery.show()
function anim_show(element, duration = 200, displayType = "flex", cb){
    //element.style.display = "flex";
    
    if(element.style.opacity >= 1 && element.style.display == displayType)
        return;

    anim_start({
        element: element,
        opacity: [0, 1],
        duration: duration,
        easing: easing_functions.easeOutQuad,
        show: true,
        displayType: displayType,
        completion: cb
    });
}

//Simple replacement for jquery.hide()
function anim_hide(element, duration = 200, cb){   
    //element.style.display = "none"; 
    anim_start({
        element: element,
        opacity: [1, 0],
        duration: duration,
        easing: easing_functions.easeOutQuad,
        hide: true,
        completion: cb
    });
}


// Used for the Victory and Defeat animation, those could maybe be changed to using anim_start?
function start_animation(element_id, framerate, framecount, x, y){
    var anim = {
        animation_counter: 0,
        animation_last_time: performance.now(),
        elem: _id(element_id),
        anim_x: x,
        anim_y: y,
        framerate: framerate,
        framecount: framecount,
        callback:  function(){
            var now = performance.now();
            var dt = now - this.animation_last_time;
            var frame = Math.floor(this.animation_counter * this.framerate * 0.001);
            if (frame <= this.framecount){
                var off_x = Math.floor(frame % 4) + this.anim_x;
                var off_y = Math.floor(frame / 4) + this.anim_y;
                this.elem.style.backgroundPosition = ('background-position', "-" + ((100) * (off_x) ) + '% -'+(off_y*100)+'%');
                this.animation_counter += dt;
                this.animation_last_time = now;
                window.requestAnimationFrame(function(){
                    anim.callback()
                });
            }
        }
    };
    anim.callback();
}