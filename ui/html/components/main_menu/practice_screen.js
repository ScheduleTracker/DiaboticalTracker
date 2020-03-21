global_onload_callbacks_other.push(function() {


});

function practice_start_match(type) {
    console.log("start practice match:", type);
    if (type == "practice_range") {
        engine.call("load_practice_range");
    }
}