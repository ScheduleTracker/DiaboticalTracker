class Scrollbar {

    constructor(outer, idx, hide_empty) {
        this.outer = outer;
        this.outer.dataset.scrollIdx = idx;
        this.inner = _get_first_with_class_in_parent(this.outer, "scroll-inner");
        this.bar = _get_first_with_class_in_parent(this.outer, "scroll-bar");
        this.thumb = this.bar.children[0];
        this.rect_inner = this.inner.getBoundingClientRect();
        this.max_scroll = this.inner.scrollHeight - this.rect_inner.height;
        this.scrollIsActive = false;
        this.scrollDistanceTop = 0;
        this.hide_empty = false;
        if (hide_empty) this.hide_empty = true;
        this.has_scrolled = false;
        this.scroll_origin = 0;
        /*
        this.use_auto_scroll = false;
        this.auto_scroll = true;
        if ("autoscroll" in this.outer.dataset) this.use_auto_scroll = (this.outer.dataset.autoscroll == "true") ? true : false;
        */

        this.updateThumbSize();
        
        let bar_style = window.getComputedStyle(this.bar);
        this.bar_width = bar_style.getPropertyValue("width");

        let inner_style = window.getComputedStyle(this.inner);
        this.inner_padding = inner_style.getPropertyValue("padding-right");

        this.inner.addEventListener("scroll", () => {
            this.rect_inner = this.inner.getBoundingClientRect();
            
            this.updateThumbSize();

            this.updateThumbPositionFromScroll();
        });
        this.bar.addEventListener("mousedown", (e) => {
            this.updateThumbSize();
            this.max_scroll = this.inner.scrollHeight - this.rect_inner.height;

            let rect_thumb = this.thumb.getBoundingClientRect();
            this.scrollDistanceTop = e.clientY - rect_thumb.y;

            this.updateThumbPosition(e);

            this.scrollIsActive = true;
            this.has_scrolled = false;
            this.scroll_origin = e.clientY;

            e.stopPropagation();
        });

        document.addEventListener("mouseup", () => {
            if (this.scrollIsActive) {
                this.scrollIsActive = false;
                if (this.has_scrolled) setTimeout(() => { this.has_scrolled = false; });
            }
        });
        document.addEventListener("mousemove", (e) => {
            if (!this.scrollIsActive) return;

            if (Math.abs(this.scroll_origin - e.clientY) > 10) {
                this.has_scrolled = true;
            }
            this.updateThumbPosition(e);
        });
        this.thumb.addEventListener("click", (e) => {
            e.stopPropagation();
        });
        this.bar.addEventListener("click", (e) => {
            if (this.has_scrolled) return;
            e.stopPropagation();
            let rect_thumb = this.thumb.getBoundingClientRect();            
            let scroll_distance = window.innerHeight / 100 * 30;
            if (e.clientY > rect_thumb.y) {
                this.inner.scrollTop = this.inner.scrollTop + scroll_distance;
            } else {
                this.inner.scrollTop = this.inner.scrollTop - scroll_distance;
            }
            this.updateThumbPositionFromScroll();
            this.inner.dispatchEvent(new CustomEvent('scroll'));
        });
    }

    updateThumbPositionFromScroll() {
        this.max_scroll = this.inner.scrollHeight - this.rect_inner.height;
        let scroll_perc = this.inner.scrollTop / this.max_scroll;

        this.thumb.style.top = ((this.rect_inner.height - this.thumb_height) * scroll_perc) +'px'; 
    }

    updateThumbPosition(e) {
        let rect_thumb = this.thumb.getBoundingClientRect();
        let rect_bar = this.bar.getBoundingClientRect();

        let pos = e.clientY - rect_bar.y - this.scrollDistanceTop;
        let max_pos = rect_bar.height - rect_thumb.height;
        let perc = pos / max_pos;

        let scroll_perc = 0;
        if (perc <= 0) {
            scroll_perc = 0;
            this.thumb.style.top = 0;
        } else if (perc >= 1) {
            scroll_perc = 1;
            this.thumb.style.top = max_pos+'px';
        } else {
            scroll_perc = perc;
            this.thumb.style.top = pos+'px';
        }

        this.inner.scrollTop = (this.max_scroll * scroll_perc);

        this.inner.dispatchEvent(new CustomEvent('scroll'));
    }

    resetScrollPosition(e) {
        setTimeout(() => {
            this.inner.scrollTop = 0;
            this.thumb.style.top = 0+'px';
        },1);
    }

    bottomScrollPosition(e) {
        this.inner.scrollTop = this.inner.scrollHeight;
        this.updateThumbSize(() => {
            this.inner.scrollTop = this.inner.scrollHeight;
            this.updateThumbPositionFromScroll();
        });
    }

    updateThumbSize(cb) {
        setTimeout(() => {
            this.rect_inner = this.inner.getBoundingClientRect();
            if (Math.ceil(this.rect_inner.height) >= this.inner.scrollHeight) {
                //console.log("no scrollbar required");
                this.thumb.style.height = 0;
                if (this.hide_empty) {
                    this.bar.style.width = 0;
                    this.inner.style.paddingRight = 0;
                    this.resetScrollPosition();
                }
            } else {
                if (this.hide_empty) {
                    this.bar.style.width = this.bar_width;
                    this.inner.style.paddingRight = this.inner_padding;
                }
                this.thumb_height = (Math.floor(this.rect_inner.height)/this.inner.scrollHeight) * this.rect_inner.height;
                this.thumb.style.height = this.thumb_height+'px';
                
                this.updateThumbPositionFromScroll();
            }
            if (cb) cb();
        });
    }
}

let global_scrollbarTracker = []
let global_scrollbarTrackerId = 0;
function initialize_scrollbars() {
    let scrollbars = document.getElementsByClassName("scroll-outer");    
    for (global_scrollbarTrackerId = 0; global_scrollbarTrackerId < scrollbars.length; global_scrollbarTrackerId++) {

        let hide_empty = false;
        if ("sbHideEmpty" in scrollbars[global_scrollbarTrackerId].dataset && scrollbars[global_scrollbarTrackerId].dataset.sbHideEmpty == "true") hide_empty = true;

        global_scrollbarTracker[global_scrollbarTrackerId] = new Scrollbar(scrollbars[global_scrollbarTrackerId],global_scrollbarTrackerId, hide_empty);
    }
}

function refreshScrollbar(el) {
    if (el.classList.contains("scroll-outer")) {
        let scrollbar = global_scrollbarTracker[Number(el.dataset.scrollIdx)];
        let tmp = _createElement("div","forceRedraw");
        tmp.style.height = "1px";
        tmp.style.width = "1px";
        tmp.style.visibility = "hidden";
        scrollbar.inner.appendChild(tmp);
        scrollbar.updateThumbSize();
        scrollbar.inner.removeChild(tmp);
    }
}
function refreshScrollbars(el) {
    _for_each_with_class_in_parent(el, "scroll-outer", function(el) {
        refreshScrollbar(el)
    });
}
function resetScrollbar(el) {
    if (el.classList.contains("scroll-outer")) {
        global_scrollbarTracker[Number(el.dataset.scrollIdx)].resetScrollPosition();
    }
}
function scrollbarScrollBottom(el) {
    if (el.classList.contains("scroll-outer")) {
        let scrollbar = global_scrollbarTracker[Number(el.dataset.scrollIdx)];
        let tmp = _createElement("div","forceRedraw");
        tmp.style.height = "1px";
        tmp.style.width = "1px";
        tmp.style.visibility = "hidden";
        scrollbar.inner.appendChild(tmp);
        scrollbar.bottomScrollPosition();
        scrollbar.inner.removeChild(tmp);
    }
}




/* 
 * Horizontal scrolling container 
 * requires ui_anim.js for scrollTo() support
 */

class Dragscroll {

    constructor(element) {
        this.active = false;
        this.initpos = 0;
        this.element_pos = 0;
        this.element = element;
        this.last_pos = 0;
        this.request = undefined;
        this.delta = 0;
        this.translateX = 0;
        this.ts = 0;
        this.move_ts = 0;
        this.anim_start_ts = 0;
        this.anim_max_age = 1000;

        document.addEventListener("mouseup", (e) => { this.mouseUp(e) }) ;
        this.element.addEventListener("mousedown", (e) => { this.mouseDown(e) });
        document.addEventListener("mousemove", (e) => { this.mouseMove(e) });
    }

    scrollTo(direction, scroll_percent) {
        this.stopAnimation();
    
        let rect = this.element.getBoundingClientRect();
        let parent_rect = this.element.parentElement.getBoundingClientRect();
        let current_pos = (parent_rect.x - rect.x) * -1;
    
        let delta = this.element.scrollWidth * scroll_percent;
    
        let max_move = (this.element.scrollWidth - parent_rect.width) * -1;
        
        let new_pos = current_pos + delta;
        if (direction) new_pos = current_pos - delta;
    
        if (new_pos > 0) new_pos = 0;
        if (new_pos < max_move) new_pos = max_move;
        
        anim_start({
            "element": this.element,
            "duration": 250,
            "translateX": [current_pos, new_pos, "px"],
            "easing": easing_functions.easeOutQuad,
        });
    }

    mouseUp(e) {
        if (this.active && this.delta != 0) {
            this.anim_start_ts = performance.now();
            this.request = requestAnimationFrame(() => { this.animate(); });
        }
        this.active = false;
    }

    mouseDown(e) {
        cancelAnimationFrame(this.request);
        this.request = undefined;

        if (e.button != 2) return;

        let rect = this.element.getBoundingClientRect();
        let parent_rect = this.element.parentElement.getBoundingClientRect();

        this.delta = 0;
        this.initpos = e.screenX;
        this.last_pos = e.screenX;
        this.active = true;
        
        this.element_pos = parent_rect.x - rect.x;
        this.element.style.width = this.element.scrollWidth + "px";
        this.ts = performance.now();
    }

    mouseMove(e) {
        if (!this.active) return;

        anim_remove(this.element);

        let move_ts = performance.now();
        
        this.ts = this.move_ts;
            
        let parent_rect = this.element.parentElement.getBoundingClientRect();
        
        let max_move = (this.element.scrollWidth - parent_rect.width) * -1;

        this.translateX = e.screenX - this.initpos - this.element_pos;
        if (this.translateX > 0) this.translateX = 0;
        if (this.translateX < max_move) this.translateX = max_move;
        

        this.element.style.transform = "translateX(" + this.translateX + "px)";

        if ((move_ts - this.ts) > 100) {
            this.delta = this.last_pos - e.screenX;
            this.last_pos = e.screenX;
        }
    }

    stopAnimation() {
        cancelAnimationFrame(this.request);
        this.request = undefined;
    }

    animate() {
        let age_perc = (performance.now() - this.anim_start_ts) / this.anim_max_age * 100;
        let delta_perc = 100 - age_perc;
        let current_delta = delta_perc / 100 * this.delta;

        this.translateX = this.translateX - current_delta;

        let parent_rect = this.element.parentElement.getBoundingClientRect();
        let max_move = (this.element.scrollWidth - parent_rect.width) * -1;

        if (this.translateX > 0) {
            this.translateX = 0;
            cancelAnimationFrame(this.request);
            this.request = undefined;
        }
        if (this.translateX < max_move) {
            this.translateX = max_move;
            cancelAnimationFrame(this.request);
            this.request = undefined;
        }
        

        this.element.style.transform = "translateX(" + this.translateX + "px)";

        this.request = requestAnimationFrame(() => {this.animate(); });

        if (delta_perc <= 0 || age_perc >= 100) {
            cancelAnimationFrame(this.request);
            this.request = undefined;
        }
    }
        

}