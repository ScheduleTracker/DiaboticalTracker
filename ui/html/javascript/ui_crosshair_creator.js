var canvasCrosshairMap = {};
var ctxCrosshairMap = {};
var canvasCrosshairPreviewMap = {};
var ctxCrosshairPreviewMap = {};
var currentCrosshairCreatorWeaponIndex = -1; //have to use these as engine.call(set_custom_component,...) fires every time variable changes, and we want only when menu tab changes
var currentCrosshairCreatorZoomWeaponIndex = -1;

//use this instead of --onevh because its a smoother and more precise function, that is always even (this is important for crosshair being visibly sharp)
document.documentElement.style.setProperty('--crosshair-canvas-size', (Math.ceil(0.1*window.innerHeight) * 2));

var crosshairLayers = ['layer1', 'layer2', 'layer3']; //loop over this instead of actual crosshair definitions to avoid looping extra layers / other keys if people add them manually
var crosshairLayerTypes = [
    'none',
    'cross',
    'dot',
    'circle',
    'pointer'
];

function initializeCanvasCrosshairMaps(){
    for (let zoom of ['normal', 'zoom']){
        canvasCrosshairMap[zoom] = {};
        ctxCrosshairMap[zoom] = {};
        for (let hit of ['default', 'hit']){
            canvasCrosshairMap[zoom][hit] = {};
            ctxCrosshairMap[zoom][hit] = {};
        }
    }
}

function createLiveCrosshairCanvas(zoom, idx){
    var canvasCrosshairSize = Math.ceil(0.1*window.innerHeight) * 2;

    for (let hit of ['default', 'hit']){
        canvasCrosshairMap[zoom][hit][idx] = document.createElement("canvas");
        canvasCrosshairMap[zoom][hit][idx].width = canvasCrosshairSize;
        canvasCrosshairMap[zoom][hit][idx].height = canvasCrosshairSize;
    
        ctxCrosshairMap[zoom][hit][idx] = canvasCrosshairMap[zoom][hit][idx].getContext("2d");
        ctxCrosshairMap[zoom][hit][idx].translate(canvasCrosshairSize/2, canvasCrosshairSize/2); //centre canvas (0,0) to make rotations easier when used

        var zoom_suffix = (zoom == 'zoom') ? "_zoom" : "";
        var new_div = _createElement("div", "crosshair");
        new_div.style.display = "none";
        new_div.appendChild(canvasCrosshairMap[zoom][hit][idx]);
        var target_container = false;

        if(hit == 'default'){
            target_container = _id("game_crosshairs_container" + zoom_suffix); 
            target_container.appendChild(new_div);
            if(zoom == 'normal'){
                global_crosshair_map[idx] = new_div;
            }
            else{
                global_crosshair_zoom_map[idx] = new_div;
            }
        }
        else{
            target_container = _id("game_crosshairs_container_hitmarker" + zoom_suffix);
            new_div.classList.add("hitmarker");
            target_container.appendChild(new_div);
            if(zoom == 'normal'){
                global_crosshair_hitmarker_map[idx] = new_div;
            }
            else{
                global_crosshair_hitmarker_zoom_map[idx] = new_div;
            }
        }
    }    
}

function removeLiveCrosshairCanvas(zoom, idx){
    var zoom_suffix = (zoom == 'zoom') ? "_zoom" : "";
    for (let hit of ['default', 'hit']){
        if(hit == 'default'){
            var target_container = _id("game_crosshairs_container" + zoom_suffix); 
            if(zoom == 'normal'){
                var old_div = global_crosshair_map[idx];
            }
            else{
                var old_div =  global_crosshair_zoom_map[idx];
            }
        }
        else{
            var target_container = _id("game_crosshairs_container_hitmarker" + zoom_suffix);
            if(zoom == 'normal'){
                var old_div =  global_crosshair_hitmarker_map[idx];
            }
            else{
                var old_div = global_crosshair_hitmarker_zoom_map[idx];
            }
        }
        old_div.removeChild(canvasCrosshairMap[zoom][hit][idx]);
        target_container.removeChild(old_div);
        delete canvasCrosshairMap[zoom][hit][idx];
        delete ctxCrosshairMap[zoom][hit][idx];
    }
}

function createCanvasCrosshairPreviewMaps(){
    var canvasCrosshairPreviewSize = (Math.ceil(0.1*window.innerHeight) * 2)
    for (let zoom of ['normal', 'zoom']){
        canvasCrosshairPreviewMap[zoom] = {};
        ctxCrosshairPreviewMap[zoom] = {};
        for (let type of ['default', 'hit', 'menu']){
            canvasCrosshairPreviewMap[zoom][type] = document.createElement("canvas");
            canvasCrosshairPreviewMap[zoom][type].width = canvasCrosshairPreviewSize;
            canvasCrosshairPreviewMap[zoom][type].height = canvasCrosshairPreviewSize;

            ctxCrosshairPreviewMap[zoom][type] = canvasCrosshairPreviewMap[zoom][type].getContext("2d");

            var zoom_suffix = (zoom == 'zoom') ? "_zoom" : "";
            
            if(type == 'menu'){//just so we can keep old crosshair code just in case, eventually can hard code this into html         
                var new_div = _createElement("div", "crosshair");
                new_div.appendChild(canvasCrosshairPreviewMap[zoom][type]);

                var crosshairMenuPreviewContainer = _id("preview_crosshairs_content" + zoom_suffix);
                _empty(crosshairMenuPreviewContainer);

                crosshairMenuPreviewContainer.appendChild(new_div);
            }
            else{
                ctxCrosshairPreviewMap[zoom][type].translate(canvasCrosshairPreviewSize/2, canvasCrosshairPreviewSize/2);

                var hit_suffix = (type == 'hit') ? "_hit" : "";            
                var canvasCrosshairPreviewContainer = _id("crosshair_canvas" + zoom_suffix + hit_suffix + "_preview");
                canvasCrosshairPreviewContainer.appendChild(canvasCrosshairPreviewMap[zoom][type]);
            }
        }
    }
}

function initialize_canvas_crosshair_presets() {
    var preset_canvas_crosshair_definitions = [
        //we need to have fully correct definitions without missing values here as these get sent to draw crosshair directly
        {
            layer1: {type: "cross", crTop: 1, crRig: 1, crBot: 1, crLef: 1, crHCE: 0, crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: 8, crThi: 2, crGap: 4, crRot: 0, crOTh: 1, crOSt: 'persistent'},
            layer2: {type: "none"},
            layer3: {type: "none"},
            designVh: '1080'
        },
        {
            layer1: {type: 'cross', crTop: 1, crRig: 1, crBot: 1, crLef: 1, crHCE: 0, crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: '10', crThi: 2, crGap: '0', crRot: '0', crOTh: 2, crOSt: 'persistent'},
            layer2: {type: 'none'},
            layer3: {type: 'none'},
            designVh: '1080'
        },
        {
            layer1: {type: 'cross', crTop: 1, crRig: 1, crBot: 1, crLef: 1, crHCE: 0, crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: '3', crThi: '10', crGap: '8', crRot: '0', crOTh: 1, crOSt: 'persistent'},
            layer2: {type: 'none'},
            layer3: {type: 'none'},
            designVh: 1080
        },
        {
            layer1: {type: 'dot', dHCE: 0, dCol: 'FFFFFF', dOCo: '000000', dHCo: 'FF0000', dThi: 3, dOTh: 2, dTyp: 'round', dOSt: 'persistent'},
            layer2: {type: 'none'},
            layer3: {type: 'none'},
            designVh: '1080'
        },
        {
            layer1: {type: 'cross', crTop: 1, crRig: 1, crBot: 1, crLef: 1, crHCE: 0, crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: 10, crThi: 2, crGap: 4, crRot: 0, crOTh: 1, crOSt: 'adaptive'},
            layer2: {type: 'circle', ciHCE: 0, ciCol: 'FFFFFF', ciOCo: '000000', ciHCo: 'FF0000', ciSeg: '1', ciRad: '7', ciThi: 2, ciGap: 0, ciRot: 0, ciOTh: '1', ciOSt: 'persistent'},
            layer3: {type: 'none'},
            designVh: '1080'
        },
        {
            layer1: {type: 'cross', crTop: 1, crRig: 1, crBot: 1, crLef: 1, crHCE: 0, crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: 8, crThi: 2, crGap: 6, crRot: 0, crOTh: 1, crOSt: 'adaptive'},
            layer2: {type: 'dot', dHCE: 0, dCol: 'FFFFFF', dOCo: '000000', dHCo: 'FF0000', dThi: 2, dOTh: 1, dTyp: 'square', dOSt: 'persistent'},
            layer3: {type: 'none'},
            designVh: '1080'
        },
        {
            layer1: {type: 'cross', crTop: '1', crRig: '0', crBot: '1', crLef: '0', crHCE: '0', crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: '8', crThi: '2', crGap: '0', crRot: '0', crOTh: '1', crOSt: 'adaptive' },
            layer2: {type: 'cross', crTop: '0', crRig: '1', crBot: '0', crLef: '1', crHCE: '0', crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: '12', crThi: '2', crGap: '0', crRot: '0', crOTh: '1', crOSt: 'persistent' },
            layer3: {type: 'none'},
            designVh: '1080'
        },
        {
            layer1: {type: 'cross', crTop: '1', crRig: '1', crBot: '1', crLef: '1', crHCE: '0', crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: '8', crThi: '4', crGap: '6', crRot: '45', crOTh: '1', crOSt: 'persistent'},
            layer2: {type: 'none'},
            layer3: {type: 'none'},
            designVh: '1080'
        },
        {
            layer1: {type: 'circle', ciHCE: '0', ciCol: 'FFFFFF', ciOCo: '000000', ciHCo: 'FF0000', ciSeg: '4', ciRad: '10', ciThi: '2', ciGap: '30', ciRot: '0', ciOTh: '1', ciOSt: 'persistent'},
            layer2: { type: 'none'},
            layer3: {type: 'none'},
            designVh: 1080
        },
        {
            layer1: {type: 'cross', crTop: '0', crRig: '1', crBot: '0', crLef: '1', crHCE: '0', crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: 14, crThi: 2, crGap: 8, crRot: 0, crOTh: 1, crOSt: 'adaptive'},
            layer2: {type: 'circle', ciHCE: '0', ciCol: 'FFFFFF', ciOCo: '000000', ciHCo: 'FF0000', ciSeg: '2', ciRad: 8, ciThi: 2, ciGap: '30', ciRot: 0, ciOTh: '1', ciOSt: 'persistent'},
            layer3: {type: 'dot', dHCE: '0', dCol: 'FFFFFF', dOCo: '000000', dHCo: 'FF0000', dThi: 2, dOTh: 1, dTyp: 'square', dOSt: 'persistent'},
            designVh: '1080'
        },
        {
            layer1: {type: 'cross', crTop: 1, crRig: 1, crBot: 1, crLef: 1, crHCE: 0, crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: 5, crThi: 2, crGap: 0, crRot: 0, crOTh: 1, crOSt: 'persistent'},
            layer2: {type: 'circle', ciHCE: '0', ciCol: 'FFFFFF', ciOCo: '000000', ciHCo: 'FF0000', ciSeg: '1', ciRad: '18', ciThi: '2', ciGap: '0', ciRot: '0', ciOTh: '1', ciOSt: 'persistent'},
            layer3: {type: 'none'},
            designVh: '1080'
        },
        {
            layer1: {type: 'circle', ciHCE: '0', ciCol: 'FFFFFF', ciOCo: '000000', ciHCo: 'FF0000', ciSeg: '3', ciRad: 18, ciThi: 2, ciGap: '25', ciRot: 0, ciOTh: '1', ciOSt: 'persistent'},
            layer2: {type: 'dot', dHCE: '0', dCol: 'FFFFFF', dOCo: '000000', dHCo: 'FF0000', dThi: 2, dOTh: '1', dTyp: 'round', dOSt: 'persistent'},
            layer3: {type: 'none'},
            designVh: '1080'
        },
        {
            layer1: {type: 'pointer', poTL: '0', poTR: '0', poBR: '1', poBL: '0', poHCE: '0', poCol: 'FFFFFF', poOCo: '000000', poHCo: 'FF0000', poLen: '12', poThi: '2', poGap: '0', poRot: '45', poOTh: '1', poOSt: 'persistent'},
            layer2: {type: 'none'},
            layer3: {type: 'none'},
            designVh: 1080
        },
        {
            layer1: {type: 'pointer', poTL: '1', poTR: '1', poBR: '1', poBL: '1', poHCE: '0', poCol: 'FFFFFF', poOCo: '000000', poHCo: 'FF0000', poLen: '8', poThi: '2', poGap: '1', poRot: '0', poOTh: '1', poOSt: 'persistent'},
            layer2: {type: 'none'},
            layer3: {type: 'none'},
            designVh: 1080
        },
        {
            layer1: {type: 'cross', crTop: 1, crRig: 1, crBot: 1, crLef: 1, crHCE: 0, crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: '2', crThi: '12', crGap: '11', crRot: '45', crOTh: '1', crOSt: 'persistent'},
            layer2: {type: 'pointer', poTL: '1', poTR: '1', poBR: '1', poBL: '1', poHCE: '0', poCol: 'FFFFFF', poOCo: '000000', poHCo: 'FF0000', poLen: '3', poThi: '3', poGap: '1', poRot: '0', poOTh: '1', poOSt: 'persistent'},
            layer3: {type: 'none'},
            designVh: 1080
        },
        {
            layer1: {type: 'pointer', poTL: '0', poTR: '0', poBR: '1', poBL: '0', poHCE: '0', poCol: 'FFFFFF', poOCo: '000000', poHCo: 'FF0000', poLen: '12', poThi: '2', poGap: '0', poRot: '0', poOTh: '1', poOSt: 'adaptive'},
            layer2: {type: 'cross', crTop: '0', crRig: '1', crBot: '0', crLef: '0', crHCE: '0', crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: '16', crThi: '2', crGap: '3', crRot: '45', crOTh: '1', crOSt: 'persistent'},
            layer3: {type: 'none'},
            designVh: 1080
        },
        {
            layer1: {type: 'cross', crTop: '0', crRig: '1', crBot: '0', crLef: '1', crHCE: '0', crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: '16', crThi: '2', crGap: '2', crRot: '0', crOTh: '1', crOSt: 'persistent' },
            layer2: {type: 'cross', crTop: '0', crRig: '0', crBot: '1', crLef: '0', crHCE: '0', crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: '2', crThi: '18', crGap: '12', crRot: '0', crOTh: '1', crOSt: 'persistent'},
            layer3: {type: 'cross', crTop: '0', crRig: '0', crBot: '1', crLef: '0', crHCE: '0', crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: '2', crThi: '6', crGap: '24', crRot: '0', crOTh: '1', crOSt: 'persistent'},
            designVh: 1080
        },
        //square
        {
            layer1: {type: 'cross', crTop: 1, crRig: 1, crBot: 1, crLef: 1, crHCE: 0, crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: '4', crThi: '24', crGap: '8', crRot: 0, crOTh: '2', crOSt: 'persistent'},
            layer2: {type: 'none'},
            layer3: {type: 'none'},
            designVh: '1080'
        },
        // logo
        {
            layer1: {type: 'circle', ciHCE: '0', ciCol: 'FFFFFF', ciOCo: '000000', ciHCo: 'FF0000', ciSeg: '1', ciRad: '13', ciThi: '8', ciGap: '0', ciRot: '0', ciOTh: '0', ciOSt: 'persistent'},
            layer2: {type: 'circle', ciHCE: '0', ciCol: '01B7ED', ciOCo: '000000', ciHCo: 'FF0000', ciSeg: '1', ciRad: '5', ciThi: '5', ciGap: '50', ciRot: '0', ciOTh: '0', ciOSt: 'persistent'},
            layer3: {type: 'none'},
            designVh: 1080
        },
        //smiley face
        {
            layer1: {type: 'cross', crTop: 1, crRig: 0, crBot: 0, crLef: 1, crHCE: '1', crCol: 'FFC600', crOCo: '000000', crHCo: 'FF0000', crLen: 14, crThi: 4, crGap: 8, crRot: 45, crOTh: 3, crOSt: 'persistent'},
            layer2: {type: 'circle', ciHCE: '0', ciCol: '000000', ciOCo: '000000', ciHCo: 'FF0000', ciSeg: '1', ciRad: '10', ciThi: '3', ciGap: '75', ciRot: '0', ciOTh: '0', ciOSt: 'persistent'},
            layer3: {type: 'dot', dHCE: '0', dCol: '00A5FF88', dOCo: '000000', dHCo: 'FF0000', dThi: 18, dOTh: 3, dTyp: 'round', dOSt: 'persistent'},
            designVh: '1080'
        }
    ]

    for (let zoom of [false, true]){
        let zoom_suffix = zoom ? "_zoom" : "";
        let container = _id("crosshair" + zoom_suffix + "_preset_container");
        _empty(container);
    
        for (let definition of preset_canvas_crosshair_definitions){
            scaleCrosshairDefinition(definition);
            let new_div = _createElement("div", "crosshair-preset");
            let optionCanvas = document.createElement("canvas");
            let optionCanvasSize = Math.ceil(0.05*window.innerHeight);
            optionCanvas.width =  optionCanvasSize;
            optionCanvas.height = optionCanvasSize;
            let ctx = optionCanvas.getContext("2d");
            ctx.translate(optionCanvasSize/2, optionCanvasSize/2);
            drawCrosshair(false, definition, ctx);
            new_div.appendChild(optionCanvas);
            container.appendChild(new_div);

            new_div.addEventListener("click", function() {
                load_preset_canvas_crosshair(definition, container.dataset.enginevar, zoom);
            })
        }
    }
}

function updateCrosshairPreview(zoom, crosshair_definition){
        //draw crosshair to editor preview
        drawCrosshair(zoom, crosshair_definition);
        //copy drawing to menu preview
        var zoom_key = zoom ? 'zoom' : 'normal';
        //ctxCrosshairPreviewMap[zoom_key].menu does not have shifted co-ordinates so slightly different clearReact()
        ctxCrosshairPreviewMap[zoom_key].menu.clearRect(0, 0, ctxCrosshairPreviewMap[zoom_key].menu.canvas.width, ctxCrosshairPreviewMap[zoom_key].menu.canvas.height);
        ctxCrosshairPreviewMap[zoom_key].menu.beginPath();
        ctxCrosshairPreviewMap[zoom_key].menu.drawImage((canvasCrosshairPreviewMap[zoom_key].default), 0, 0);
    }

function updateEngineCrosshairDefinition(zoom, engine_variable, crosshair_definition){
    var crosshair_string = generateShortCrosshairString(crosshair_definition);
    engine.call("set_string_variable", engine_variable, crosshair_string);
    var copyButton = _id(zoom?"crosshair_canvas_zoom_copy_button":"crosshair_canvas_copy_button");
    copyButton.dataset.crossdef = JSON.stringify(crosshair_definition); //the string we send to the engine is short version, the dataset uses long version
}

function get_crosshair_draw_list(crosshair_string, hit_mode, draw_id){
    let crosshair_definition = cleanCrosshairDefinition(generateFullCrosshairDefinition(crosshair_string));
    if(hit_mode){
        var crosshair_draw_list = drawCrosshair(false, crosshair_definition, "logicalHit");
    }
    else{
        var crosshair_draw_list = drawCrosshair(false, crosshair_definition, "logicalDefault");
    }
    engine.call("get_crosshair_draw_list_return", crosshair_draw_list, draw_id);
}

function drawCrosshair(zoom, crosshair_definition, target){
    var drawHitCross = true;
    if (typeof target === 'undefined'){ //Preview - leave target field empty
        if (zoom){
            var ctxCross = ctxCrosshairPreviewMap.zoom.default;
            var ctxHitCross = ctxCrosshairPreviewMap.zoom.hit;
        }
        else{
            var ctxCross = ctxCrosshairPreviewMap.normal.default;
            var ctxHitCross = ctxCrosshairPreviewMap.normal.hit;
        }
    }
    
    else if (target instanceof CanvasRenderingContext2D){ //Presets, directly draw to this canvas
        var ctxCross = target;
        drawHitCross = false;
    }

    else if (target == "logicalDefault" || target == "logicalHit"){//only interested in instruction set
        var ctxCross = "returnString";
        var ctxHitCross = "returnString";
    }

    else { //Live Game Crosshairs, target is weapon_index
        if (zoom){
            var ctxCross = ctxCrosshairMap.zoom.default[target];
            var ctxHitCross = ctxCrosshairMap.zoom.hit[target];
        }
        else{
            var ctxCross = ctxCrosshairMap.normal.default[target];
            var ctxHitCross = ctxCrosshairMap.normal.hit[target];
        }
    }

    //clear canvas before redrawing
    if(ctxCross != "returnString") clearCross(ctxCross);
    if(drawHitCross && ctxHitCross != "returnString"){clearCross(ctxHitCross);}

    //these 3 variables used when sending instruction set to engine to draw in game crosshairs
    var crosshairInstructionString = "";
    var hitCrosshairInstructionString = "";
    var usesHitColor = false;

    var linesArray = [];
    var adaptiveOutlinesArray = []; //these 'adaptive' arrays are used to allow us to render certain outlines first regardless of layer so they 'merge' with others
    var hitLinesArray = [];
    var adaptiveHitOutlinesArray = [];

    //.bind() allows us to control the order in which we render lines and outlines
    //.push() lines and outlines to relevant arrays, and then reverse loop so that layer 3 gets drawn first, and layer 2 ontop, and so on, with lines before outlines

    for (let layer of crosshairLayers) {
        if(crosshair_definition[layer].type == 'cross') {
            var gap = validatedParseInt(crosshair_definition[layer].crGap, 4);
            var length = validatedParseInt(crosshair_definition[layer].crLen, 8);
            var thickness = validatedParseInt(crosshair_definition[layer].crThi, 2);
            var color = "#" + crosshair_definition[layer].crCol;
            var outlineColor = "#" + crosshair_definition[layer].crOCo;
            var outlineThickness = validatedParseInt(crosshair_definition[layer].crOTh, 1);
            var rotation = validatedParseInt(crosshair_definition[layer].crRot, 0);
            var outlineStyle = crosshair_definition[layer].crOSt;
            var enabledSides = {
                "top" : crosshair_definition[layer].crTop,
                "right" : crosshair_definition[layer].crRig,
                "bottom" : crosshair_definition[layer].crBot,
                "left" : crosshair_definition[layer].crLef
            };
            var hitColorEnabled = crosshair_definition[layer].crHCE;
            var hitColor = '#' + (hitColorEnabled == 1 ? crosshair_definition[layer].crHCo : crosshair_definition[layer].crCol);
            if(hitColorEnabled == 1){usesHitColor = true}; 
            
            var outlinesArray = ((outlineStyle == 'persistent') ? linesArray : adaptiveOutlinesArray);
            var hitOutlinesArray = ((outlineStyle == 'persistent') ? hitLinesArray : adaptiveHitOutlinesArray);

            linesArray.push(drawRectangles.bind(null, ctxCross, /*segments,*/ enabledSides, gap, length, thickness, color, outlineThickness, rotation, 0));
            outlinesArray.push(drawRectangles.bind(null, ctxCross, /*segments,*/ enabledSides, gap, length, thickness, outlineColor, outlineThickness, rotation, 1));   

            if(drawHitCross){
                hitLinesArray.push(drawRectangles.bind(null, ctxHitCross, /*segments,*/ enabledSides, gap, length, thickness, hitColor, outlineThickness, rotation, 0));
                hitOutlinesArray.push(drawRectangles.bind(null, ctxHitCross, /*segments,*/ enabledSides, gap, length, thickness, outlineColor, outlineThickness, rotation, 1));                
            }
        }
        else if(crosshair_definition[layer].type == 'circle') {
            var circleRadius = validatedParseInt(crosshair_definition[layer].ciRad, 18);
            var circleThickness = validatedParseInt(crosshair_definition[layer].ciThi, 2);
            var circleGapAngle = validatedParseInt(crosshair_definition[layer].ciGap, 20);
            var circleOutlineThickness = validatedParseInt(crosshair_definition[layer].ciOTh, 1);
            var circleColor = "#" + crosshair_definition[layer].ciCol;
            var circleOutlineColor = '#' + crosshair_definition[layer].ciOCo;
            var circleRotation = validatedParseInt(crosshair_definition[layer].ciRot, 0);
            var outlineStyle = crosshair_definition[layer].ciOSt;
            var segments = validatedParseInt(crosshair_definition[layer].ciSeg, 4);
            if(segments>8){segments=8};
            var hitColorEnabled = crosshair_definition[layer].ciHCE;
            var hitColor = '#' + (hitColorEnabled == 1 ? crosshair_definition[layer].ciHCo : crosshair_definition[layer].ciCol);
            if(hitColorEnabled == 1){usesHitColor = true}; 
            //for layers without a hit color we still need to draw normal color in case other layers have it enabled

            var outlinesArray = ((outlineStyle == 'persistent') ? linesArray : adaptiveOutlinesArray);
            var hitOutlinesArray = ((outlineStyle == 'persistent') ? hitLinesArray : adaptiveHitOutlinesArray);
            
            linesArray.push(drawArcs.bind(null, ctxCross, segments, circleRadius, circleThickness, circleOutlineThickness, circleColor, circleGapAngle, circleRotation, 0));
            outlinesArray.push(drawArcs.bind(null, ctxCross, segments, circleRadius, circleThickness, circleOutlineThickness, circleOutlineColor, circleGapAngle, circleRotation, 1));

            if(drawHitCross) {
                hitLinesArray.push(drawArcs.bind(null, ctxHitCross, segments, circleRadius, circleThickness, circleOutlineThickness, hitColor, circleGapAngle, circleRotation, 0));
                hitOutlinesArray.push(drawArcs.bind(null, ctxHitCross, segments, circleRadius, circleThickness, circleOutlineThickness, circleOutlineColor, circleGapAngle, circleRotation, 1));
            }
        }
        else if(crosshair_definition[layer].type == 'dot'){
            var dotType = crosshair_definition[layer].dTyp;
            var dotThickness = validatedParseInt(crosshair_definition[layer].dThi, 2);
            var outlineStyle = crosshair_definition[layer].dOSt;
            var dotOutlineThickness = validatedParseInt(crosshair_definition[layer].dOTh, 1);
            var dotRotation = validatedParseInt(crosshair_definition[layer].dRot, 0);
            var dotColor = '#' + crosshair_definition[layer].dCol;
            var dotOutlineColor = '#' + crosshair_definition[layer].dOCo;

            var hitColorEnabled = crosshair_definition[layer].dHCE;
            var hitColor = '#' + (hitColorEnabled == 1 ? crosshair_definition[layer].dHCo : crosshair_definition[layer].dCol);
            if(hitColorEnabled == 1){usesHitColor = true}; 

            var outlinesArray = ((outlineStyle == 'persistent') ? linesArray : adaptiveOutlinesArray);
            var hitOutlinesArray = ((outlineStyle == 'persistent') ? hitLinesArray : adaptiveHitOutlinesArray);

            linesArray.push(drawDot.bind(null, ctxCross, dotType, dotThickness, dotOutlineThickness, dotRotation, dotColor, 0));
            outlinesArray.push(drawDot.bind(null, ctxCross, dotType, dotThickness, dotOutlineThickness, dotRotation,dotOutlineColor, 1));

            if(drawHitCross){
                hitLinesArray.push(drawDot.bind(null, ctxHitCross, dotType, dotThickness, dotOutlineThickness, dotRotation, hitColor, 0));
                hitOutlinesArray.push(drawDot.bind(null, ctxHitCross, dotType, dotThickness, dotOutlineThickness, dotRotation, dotOutlineColor, 1));
            }
        } 
        else if(crosshair_definition[layer].type == 'pointer') {
            var gap = validatedParseInt(crosshair_definition[layer].poGap, 0);
            var length = validatedParseInt(crosshair_definition[layer].poLen, 12);
            var thickness = validatedParseInt(crosshair_definition[layer].poThi, 2);
            var color = "#" + crosshair_definition[layer].poCol;
            var outlineColor = "#" + crosshair_definition[layer].poOCo;
            var outlineThickness = validatedParseInt(crosshair_definition[layer].poOTh, 1);
            var rotation = validatedParseInt(crosshair_definition[layer].poRot, 0);
            var outlineStyle = crosshair_definition[layer].poOSt;
            var enabledSides = {
                "topleft" : crosshair_definition[layer].poTL,
                "topright" : crosshair_definition[layer].poTR,
                "bottomright" : crosshair_definition[layer].poBR,
                "bottomleft" : crosshair_definition[layer].poBL
            };
            var hitColorEnabled = crosshair_definition[layer].poHCE;
            var hitColor = '#' + (hitColorEnabled == 1 ? crosshair_definition[layer].poHCo : crosshair_definition[layer].poCol);
            if(hitColorEnabled == 1){usesHitColor = true}; 
            
            var outlinesArray = ((outlineStyle == 'persistent') ? linesArray : adaptiveOutlinesArray);
            var hitOutlinesArray = ((outlineStyle == 'persistent') ? hitLinesArray : adaptiveHitOutlinesArray);

            linesArray.push(drawPointers.bind(null, ctxCross, enabledSides, length, thickness, outlineThickness, color, gap, rotation, 0));
            outlinesArray.push(drawPointers.bind(null, ctxCross, enabledSides, length, thickness, outlineThickness, outlineColor, gap, rotation, 1));   

            if(drawHitCross){
                hitLinesArray.push(drawPointers.bind(null, ctxHitCross, enabledSides, length, thickness, outlineThickness, hitColor, gap, rotation, 0));
                hitOutlinesArray.push(drawPointers.bind(null, ctxHitCross, enabledSides, length, thickness, outlineThickness, outlineColor, gap, rotation, 1));                
            }
        }
    }

    //reverse looping so layer 1 appears on 'top', first things here appear at back of crosshair
    if (adaptiveOutlinesArray.length > 0){
        for (let i = adaptiveOutlinesArray.length - 1; i >= 0; i--){
            crosshairInstructionString += adaptiveOutlinesArray[i].call();
            if(drawHitCross){hitCrosshairInstructionString += adaptiveHitOutlinesArray[i].call();}
        }
    }
    for (let i = linesArray.length - 1; i >= 0; i--){
        crosshairInstructionString += linesArray[i].call();
        if(drawHitCross){hitCrosshairInstructionString += hitLinesArray[i].call();}
    }

    function validatedParseInt(input, defVal){
        if(isNaN(parseInt(input))){return defVal;}
        else{return parseInt(input);}
    }

    //function validatedParseFloat(input, defVal){
    //    if(isNaN(parseFloat(input))){return defVal;}
    //    else{return parseFloat(input);}
    //}
    if(target == "logicalDefault"){
        return crosshairInstructionString
    }
    else if(target == "logicalHit"){
        if(!usesHitColor){hitCrosshairInstructionString = ""}
        return hitCrosshairInstructionString
    }
}


function clearCross(ctxCross){
    //clear all pixels (assumes canvas is translated 50%,50%)
    ctxCross.clearRect(-1*(ctxCross.canvas.width/2), -1*(ctxCross.canvas.height/2), ctxCross.canvas.width, ctxCross.canvas.height);
    //beginPath() starts a new path so we dont redraw rectangles
    ctxCross.beginPath();
}

function drawRectangles(ctxCross, /*segments,*/ enabledSides, gap, length, thickness, color, outlineThickness, rotation, outline){
    let instructionString = "";

    if(ctxCross !== "returnString"){
        ctxCross.fillStyle = color;
        ctxCross.save();
        ctxCross.rotate((Math.PI/180)*rotation);
    }
    else{
        instructionString += "fillStyle " + color + "\n";
        instructionString += "save\n";
        instructionString += "rotate " + ((Math.PI/180)*rotation) + "\n";
    }
    /*test
    ctxCross.rotate((Math.PI/180)*rotation - Math.PI/2); //Makes 0deg at north by default, so segments start from there
    var width = length;
    var height = thickness;
    var x = gap;
    var y = -height/2;
    for (var i=0; i<=segments; i++){
        ctxCross.save();
        ctxCross.rotate((i/segments)*Math.PI*2);
        if (outline == 0){
            ctxCross.beginPath();
            ctxCross.fillRect(x, y, width, height);
        }
        else {
            ctxCross.beginPath();
            ctxCross.fillRect(x - outlineThickness, y - outlineThickness, width + (outlineThickness*2), outlineThickness); //top side
            ctxCross.fillRect(x - outlineThickness, y + height, width + (outlineThickness*2), outlineThickness); //bottom side
            ctxCross.fillRect(x - outlineThickness, y , outlineThickness, height); //left side
            ctxCross.fillRect(x + width, y, outlineThickness, height); //right side
        }
        ctxCross.restore();
    }
    */
    for (var i=0; i<=3; i++){
        if(i == 0){ //left
            if(enabledSides.left == 0){continue}
            var width = length;
            var height = thickness;
            var x = -gap - width;
            var y = -height/2;
        }
        else if(i==1){ //top
            if(enabledSides.top == 0){continue}
            var width = thickness;
            var height = length;
            var x = -width/2;
            var y = -gap - height;
        }
        else if(i==2){ //right
            if(enabledSides.right == 0){continue}
            var width = length;
            var height = thickness;
            var x = gap;
            var y = -height/2;
        }
        else{ //bottom 
            if(enabledSides.bottom == 0){continue}
            var width = thickness;
            var height = length;
            var x = -width/2;
            var y = gap;
        }

        if(outline==0){
            if(ctxCross !== "returnString"){
                ctxCross.beginPath();
                ctxCross.fillRect(x, y, width, height);
            }
            else{
                instructionString += "beginPath\n";
                instructionString += "fillRect " + x + " " + y + " " + width + " " + height + "\n";
            }
        }
        else{
            if(ctxCross !== "returnString"){
                ctxCross.beginPath();
                ctxCross.fillRect(x - outlineThickness, y - outlineThickness, width + (outlineThickness*2), outlineThickness); //top side
                ctxCross.fillRect(x - outlineThickness, y + height, width + (outlineThickness*2), outlineThickness); //bottom side
                ctxCross.fillRect(x - outlineThickness, y , outlineThickness, height); //left side
                ctxCross.fillRect(x + width, y, outlineThickness, height); //right side
            }
            else{
                instructionString += "beginPath\n";
                instructionString += "fillRect " + (x - outlineThickness) + " " + (y - outlineThickness) + " " + (width + (outlineThickness*2)) + " " + outlineThickness + "\n";
                instructionString += "fillRect " + (x - outlineThickness) + " " + (y + height) + " " + (width + (outlineThickness*2)) + " " + outlineThickness + "\n";
                instructionString += "fillRect " + (x - outlineThickness) + " " + y + " " + outlineThickness + " " + height + "\n";
                instructionString += "fillRect " + (x + width) + " " + y + " " + outlineThickness + " " + height + "\n";
            }
        }
    }
    if(ctxCross !== "returnString"){
        ctxCross.restore();
    }
    else{
        instructionString += "restore\n"
    }
    return instructionString;
}

function drawDot(ctxCross, dotType, thickness, outlineThickness, rotation, color, outline){
    let instructionString = "";
    
    if(thickness == 0){
        return;
    }

    var fillRule = 'nonzero'

    if(ctxCross !== "returnString"){
        ctxCross.fillStyle = color;
        ctxCross.save();
        ctxCross.rotate((Math.PI/180)*rotation);
    }
    else{
        instructionString += "fillStyle " + color + "\n";
        instructionString += "save\n";
        instructionString += "rotate " + ((Math.PI/180)*rotation) + "\n";
    }

    if(ctxCross !== "returnString"){
        ctxCross.beginPath()
    }
    else{
        instructionString += "beginPath\n";
    }

    if(dotType == 'round'){ //Round dot
        var x = 0;
        var y = 0;
        if (outline==0){
            if(ctxCross !== "returnString"){
                ctxCross.arc(x, y, thickness, 0, 2*Math.PI);
            }
            else{
                instructionString += "arc " + x + " " + y + " " + thickness + " " + (2*Math.PI) + "\n";
            }
        }
        else{            
            fillRule = 'evenodd';
            if(ctxCross !== "returnString"){
                ctxCross.arc(x, y, thickness, 0, 2*Math.PI);       
                ctxCross.moveTo(x + thickness + outlineThickness, y);
                ctxCross.arc(x, y, thickness + outlineThickness, 0, 2*Math.PI);
            }
            else{
                instructionString += "arc " + x + " " + y + " " + thickness + " " + 0 + " " + (2*Math.PI) + "\n";
                instructionString += "moveTo " + (x + thickness + outlineThickness) + " " + y + "\n";
                instructionString += "arc " + x + " " + y + " " + (thickness + outlineThickness) + " " + 0 + " " + (2*Math.PI) + "\n";
            }
        }
    }
    else{ //Square dot
        if(rotation == 0){
            var x = 0 - Math.ceil(thickness/2);
            var y = 0 - Math.ceil(thickness/2);
        }
        else{
            var x = -thickness/2;
            var y = -thickness/2;
        }
        if(outline==0){
            if(ctxCross !== "returnString"){
                ctxCross.rect(x, y, thickness, thickness);
            }
            else{
                instructionString += "rect " + x + " " + y + " " + thickness + " " + thickness + "\n";
            }
        }
        else{
            if(ctxCross !== "returnString"){
                ctxCross.rect(x - outlineThickness, y - outlineThickness, thickness + (outlineThickness*2), outlineThickness); //top
                ctxCross.rect(x - outlineThickness, y + thickness, thickness + (outlineThickness*2), outlineThickness); //bottom
                ctxCross.rect(x - outlineThickness, y , outlineThickness, thickness); //left
                ctxCross.rect(x + thickness, y, outlineThickness, thickness); //right
            }
            else{
                instructionString += "rect " + (x - outlineThickness) + " " + (y - outlineThickness) + " " + (thickness + (outlineThickness*2)) + " " + outlineThickness + "\n";
                instructionString += "rect " + (x - outlineThickness) + " " + (y + thickness) + " " + (thickness + (outlineThickness*2)) + " " + outlineThickness + "\n";
                instructionString += "rect " + (x - outlineThickness) + " " + y + " " + outlineThickness + " " + thickness + "\n";
                instructionString += "rect " + (x + thickness) + " " + y + " " + outlineThickness + " " + thickness + "\n";
            }
        }
    }
    if(ctxCross !== "returnString"){
        ctxCross.fill(fillRule);
        ctxCross.restore();
    }
    else{
        instructionString += "fill " + fillRule + "\n";
        instructionString += "restore\n";
    }

    return instructionString;
}

function drawArcs(ctxCross, segments, radius, thickness, outlineThickness, color, gapPct, rotation, outline){
    let instructionString = "";

    if(ctxCross !== "returnString"){
        ctxCross.strokeStyle = color;
        ctxCross.fillStyle = color;
        ctxCross.save();
        ctxCross.rotate((Math.PI/180)*rotation - Math.PI/2); //Makes 0deg at north by default, so segments start from there
    }
    else{
        instructionString += "strokeStyle " + color + "\n";
        instructionString += "fillStyle " + color + "\n";
        instructionString += "save\n";
        instructionString += "rotate " + ((Math.PI/180)*rotation - Math.PI/2) + "\n";
    }

    if(outlineThickness != 0){outlineThickness += 0.2}; //for whatever reason, this seems to more closely match the thickness on the cross, maybe some aliasing thing
    var x = 0;
    var y = 0;
    radius = Math.max(radius, 0);
    var gapRad = (2*Math.PI/segments) * (gapPct/100);
    var outlineGapRad = Math.max(gapRad - (2*outlineThickness/radius),0); //this increases arc length of outline at radius distance by 2*outline thickness, thanks radians
    if(segments==1){
        //for some reason it looks far better for a full circle to be made of 2 parts, gameface things I guess, so we draw it with 2 segments with different gap rules
        if (outline == 0){
            if(ctxCross !== "returnString"){
                ctxCross.beginPath();
                ctxCross.arc(x, y, radius, 0 + gapRad/2, Math.PI, false);
                ctxCross.arc(x, y, radius + thickness, Math.PI, 0 + gapRad/2, true);
                ctxCross.closePath();
                ctxCross.fill();

                ctxCross.beginPath();
                ctxCross.arc(x, y, radius, Math.PI, 0 - gapRad/2, false);
                ctxCross.arc(x, y, radius + thickness, 0 - gapRad/2, Math.PI, true);
                ctxCross.closePath();
                ctxCross.fill();
            }
            else{
                instructionString += "beginPath\n";
                instructionString += "arc " + x + " " + y + " " + radius + " " + (0 + gapRad/2) + " " + (Math.PI) + " false\n";
                instructionString += "arc " + x + " " + y + " " + (radius + thickness) + " " + (Math.PI) + " " + (0 + gapRad/2) + " true\n";
                instructionString += "closePath\n";
                instructionString += "fill\n";

                instructionString += "beginPath\n";
                instructionString += "arc " + x + " " + y + " " + radius + " " + (Math.PI) + " " + (0 - gapRad/2) + " false\n";
                instructionString += "arc " + x + " " + y + " " + (radius + thickness) + " " + (0 - gapRad/2) + " " + (Math.PI) + " true\n";
                instructionString += "closePath\n";
                instructionString += "fill\n";
            }
        }
        else {
            if(ctxCross !== "returnString"){
                ctxCross.beginPath();
                ctxCross.arc(x, y, radius, 0 + gapRad/2, Math.PI, false);
                ctxCross.arc(x, y, radius + thickness, Math.PI, 0 + gapRad/2, true);
                ctxCross.closePath();
                ctxCross.moveTo(radius * Math.cos(0 + outlineGapRad/2), radius * Math.sin(0 + outlineGapRad/2));
                ctxCross.arc(x, y, radius - outlineThickness, 0 + outlineGapRad/2, Math.PI, false);
                ctxCross.arc(x, y, radius + thickness + outlineThickness, Math.PI, 0 + outlineGapRad/2, true);
                ctxCross.closePath();
                ctxCross.fill('evenodd');

                ctxCross.beginPath();
                ctxCross.arc(x, y, radius, Math.PI, 0 - gapRad/2, false);
                ctxCross.arc(x, y, radius + thickness, 0 - gapRad/2, Math.PI, true);
                ctxCross.closePath();
                ctxCross.moveTo(radius * Math.cos(Math.PI), radius * Math.sin(Math.PI));
                ctxCross.arc(x, y, radius - outlineThickness, Math.PI, 0 - outlineGapRad/2, false);
                ctxCross.arc(x, y, radius + thickness + outlineThickness, 0 - outlineGapRad/2, Math.PI, true);
                ctxCross.closePath();
                ctxCross.fill('evenodd');
            }
            else{
                instructionString += "beginPath\n";
                instructionString += "arc " + x + " " + y + " " + radius + " " + (0 + gapRad/2) + " " + (Math.PI) + " false\n";
                instructionString += "arc " + x + " " + y + " " + (radius + thickness) + " " + (Math.PI) + " " + (0 + gapRad/2) + " true\n";
                instructionString += "closePath\n";
                instructionString += "moveTo " + (radius * Math.cos(0 + outlineGapRad/2)) + " " + (radius * Math.sin(0 + outlineGapRad/2)) + "\n";
                instructionString += "arc " + x + " " + y + " " + (radius - outlineThickness) + " " + (0 + outlineGapRad/2) + " " + (Math.PI) + " false\n";
                instructionString += "arc " + x + " " + y + " " + (radius + thickness + outlineThickness) + " " + (Math.PI) + " " + (0 + outlineGapRad/2) + " true\n";
                instructionString += "closePath\n";
                instructionString += "fill evenodd\n";

                instructionString += "beginPath\n";
                instructionString += "arc " + x + " " + y + " " + radius + " " + (Math.PI) + " " + (0 - gapRad/2) + " false\n";
                instructionString += "arc " + x + " " + y + " " + (radius + thickness) + " " + (0 - gapRad/2) + " " + (Math.PI) + " true\n";
                instructionString += "closePath\n";
                instructionString += "moveTo " + (radius * Math.cos(Math.PI)) + " " + (radius * Math.sin(Math.PI)) + "\n";
                instructionString += "arc " + x + " " + y + " " + (radius - outlineThickness) + " " + (Math.PI) + " " + ( 0 - outlineGapRad/2) + " false\n";
                instructionString += "arc " + x + " " + y + " " + (radius + thickness + outlineThickness) + " " + (0 - outlineGapRad/2) + " " + (Math.PI) + " true\n";
                instructionString += "closePath\n";
                instructionString += "fill evenodd\n";
            }
        }
    }
    else{
        for (var i=0; i<segments; i++){
            if (outline == 0){
                if(ctxCross !== "returnString"){
                    ctxCross.beginPath();
                    ctxCross.arc(x, y, radius, (i/segments)*2*Math.PI + gapRad/2, ((i+1)/segments)*2*Math.PI - gapRad/2, false);
                    ctxCross.arc(x, y, radius + thickness, ((i+1)/segments)*2*Math.PI - gapRad/2, (i/segments)*2*Math.PI + gapRad/2, true);
                    ctxCross.closePath();
                    ctxCross.fill();
                }
                else{
                    instructionString += "beginPath\n";
                    instructionString += "arc " + x + " " + y + " " + radius + " " + ((i/segments)*2*Math.PI + gapRad/2) + " " + (((i+1)/segments)*2*Math.PI - gapRad/2) + " false\n";
                    instructionString += "arc " + x + " " + y + " " + (radius + thickness) + " " + (((i+1)/segments)*2*Math.PI - gapRad/2) + " " + ((i/segments)*2*Math.PI + gapRad/2) + " true\n";
                    instructionString += "closePath\n";
                    instructionString += "fill\n";
                }
            }
            else {
                if(ctxCross !== "returnString"){
                    ctxCross.beginPath();
                    //outlines 'inner border' is the same as main lines 'outer border'
                    ctxCross.arc(x, y, radius, (i/segments)*2*Math.PI + gapRad/2, ((i+1)/segments)*2*Math.PI - gapRad/2, false);
                    ctxCross.arc(x, y, radius + thickness, ((i+1)/segments)*2*Math.PI - gapRad/2, (i/segments)*2*Math.PI + gapRad/2, true);
                    ctxCross.closePath();
                    //now draw 'outline border'
                    ctxCross.moveTo(radius * Math.cos((i/segments)*2*Math.PI + outlineGapRad/2), radius * Math.sin((i/segments)*2*Math.PI + outlineGapRad/2));
                    ctxCross.arc(x, y, radius - outlineThickness, (i/segments)*2*Math.PI + outlineGapRad/2, ((i+1)/segments)*2*Math.PI - outlineGapRad/2, false);
                    ctxCross.arc(x, y, radius + thickness + outlineThickness, ((i+1)/segments)*2*Math.PI - outlineGapRad/2, (i/segments)*2*Math.PI + outlineGapRad/2, true);
                    ctxCross.closePath();
                    ctxCross.fill('evenodd');
                }
                else{
                    instructionString += "beginPath\n";
                    instructionString += "arc " + x + " " + y + " " + radius + " " + ((i/segments)*2*Math.PI + gapRad/2) + " " + (((i+1)/segments)*2*Math.PI - gapRad/2) + " false\n";
                    instructionString += "arc " + x + " " + y + " " + (radius + thickness) + " " + (((i+1)/segments)*2*Math.PI - gapRad/2) + " " + ((i/segments)*2*Math.PI + gapRad/2) + " true\n";
                    instructionString += "closePath\n";
                    instructionString += "moveTo " + (radius * Math.cos((i/segments)*2*Math.PI + outlineGapRad/2)) + " " + (radius * Math.sin((i/segments)*2*Math.PI + outlineGapRad/2)) + "\n";
                    instructionString += "arc " + x + " " + y + " " + (radius - outlineThickness) + " " + ((i/segments)*2*Math.PI + outlineGapRad/2) + " " + (((i+1)/segments)*2*Math.PI - outlineGapRad/2) + " false\n";
                    instructionString += "arc " + x + " " + y + " " + (radius + thickness + outlineThickness) + " " + (((i+1)/segments)*2*Math.PI - outlineGapRad/2) + " " + ((i/segments)*2*Math.PI + outlineGapRad/2) + " true\n";
                    instructionString += "closePath\n";
                    instructionString += "fill evenodd\n";
                }
            }
        }
    }
    if(ctxCross !== "returnString"){
        ctxCross.restore();
    }
    else{
        instructionString += "restore\n";
    }
    return instructionString;
}

function drawPointers(ctxCross, enabledSides, length, thickness, outlineThickness, color, gap, rotation, outline){
    let instructionString = "";
    if(ctxCross !== "returnString"){
        ctxCross.fillStyle = color;
        ctxCross.save();
        ctxCross.rotate((Math.PI/180)*rotation);
    }
    else{
        instructionString += "fillStyle " + color + "\n";
        instructionString += "save\n";
        instructionString += "rotate " + ((Math.PI/180)*rotation) + "\n";
    }
    if (thickness > length){thickness = length}
    let x = gap;
    let y = gap;
    for(let i=0; i<=3; i++){
        if (i==0){ //bottom right
            if(enabledSides.bottomright == 0){continue}
            if (outline==0){
                if(ctxCross !== "returnString"){
                    ctxCross.beginPath();
                    ctxCross.rect(x + outlineThickness, y + outlineThickness, length, thickness);
                    ctxCross.rect(x + outlineThickness, y + outlineThickness + thickness, thickness, length - thickness); //so theres no overlap between lines
                }
                else{
                    instructionString += "beginPath\n";
                    instructionString += "rect " + (x + outlineThickness) + " " + (y + outlineThickness) + " " + length + " " + thickness + "\n";
                    instructionString += "rect " + (x + outlineThickness) + " " + (y + outlineThickness + thickness) + " " + thickness + " " + (length - thickness) + "\n";
                }
            }
            else{ //outline
                if(ctxCross !== "returnString"){
                    ctxCross.beginPath();
                    ctxCross.rect(x, y, length + 2*outlineThickness, outlineThickness); //top long line
                    ctxCross.rect(x, y + outlineThickness, outlineThickness, length + outlineThickness); //left long line
                    ctxCross.rect(x + outlineThickness, y + outlineThickness + length, thickness, outlineThickness); //bottom short line
                    ctxCross.rect(x + outlineThickness + thickness, y + outlineThickness + thickness, length - thickness, outlineThickness); //bottom long line
                    ctxCross.rect(x + outlineThickness + thickness, y + 2*outlineThickness + thickness, outlineThickness, length - thickness); //right long line
                    ctxCross.rect(x + outlineThickness + length, y + outlineThickness, outlineThickness, thickness + outlineThickness); //right short line
                }
                else{
                    instructionString += "beginPath\n";
                    instructionString += "rect " + x + " " + y + " " + (length + 2*outlineThickness) + " " + outlineThickness + "\n";
                    instructionString += "rect " + x + " " + (y + outlineThickness) + " " + outlineThickness + " " + (length + outlineThickness) + "\n";
                    instructionString += "rect " + (x + outlineThickness) + " " + (y + outlineThickness + length) + " " + thickness + " " + outlineThickness + "\n";
                    instructionString += "rect " + (x + outlineThickness + thickness) + " " + (y + outlineThickness + thickness) + " " + (length - thickness) + " " + outlineThickness + "\n";
                    instructionString += "rect " + (x + outlineThickness + thickness) + " " + (y + 2*outlineThickness + thickness) + " " + outlineThickness + " " + (length - thickness) + "\n";
                    instructionString += "rect " + (x + outlineThickness + length) + " " + (y + outlineThickness) + " " + outlineThickness + " " + (thickness + outlineThickness) + "\n";
                }
            }
        }
        if (i==1){ //top right (negative y from bottom right)
            if(enabledSides.topright == 0){continue}
            if (outline==0){
                if(ctxCross !== "returnString"){
                    ctxCross.beginPath();
                    ctxCross.rect(x + outlineThickness, -(y + outlineThickness), length, -(thickness));
                    ctxCross.rect(x + outlineThickness, -(y + outlineThickness + thickness), thickness, -(length - thickness)); 
                }
                else{
                    instructionString += "beginPath\n";
                    instructionString += "rect " + (x + outlineThickness) + " " + (-(y + outlineThickness)) + " " + length + " " + (-thickness) + "\n";
                    instructionString += "rect " + (x + outlineThickness) + " " + (-(y + outlineThickness + thickness)) + " " + thickness + " " + (-(length - thickness)) + "\n";
                }
            }
            else{ //outline  
                if(ctxCross !== "returnString"){
                    ctxCross.beginPath();
                    ctxCross.rect(x, -(y), length + 2*outlineThickness, -(outlineThickness)); 
                    ctxCross.rect(x, -(y + outlineThickness), outlineThickness, -(length + outlineThickness)); 
                    ctxCross.rect(x + outlineThickness, -(y + outlineThickness + length), thickness, -(outlineThickness)); 
                    ctxCross.rect(x + outlineThickness + thickness, -(y + outlineThickness + thickness), length - thickness, -(outlineThickness));
                    ctxCross.rect(x + outlineThickness + thickness, -(y + 2*outlineThickness + thickness), outlineThickness, -(length - thickness)); 
                    ctxCross.rect(x + outlineThickness + length, -(y + outlineThickness), outlineThickness, -(thickness + outlineThickness));
                }
                else{                
                    instructionString += "beginPath\n";
                    instructionString += "rect " + x + " " + (-y) + " " + (length + 2*outlineThickness) + " " + (-outlineThickness) + "\n";
                    instructionString += "rect " + x + " " + (-(y + outlineThickness)) + " " + outlineThickness + " " + (-(length + outlineThickness)) + "\n";
                    instructionString += "rect " + (x + outlineThickness) + " " + (-(y + outlineThickness + length)) + " " + thickness + " " + (-outlineThickness) + "\n";
                    instructionString += "rect " + (x + outlineThickness + thickness) + " " + (-(y + outlineThickness + thickness)) + " " + (length - thickness) + " " + (-outlineThickness) + "\n";
                    instructionString += "rect " + (x + outlineThickness + thickness) + " " + (-(y + 2*outlineThickness + thickness)) + " " + outlineThickness + " " + (-(length - thickness)) + "\n";
                    instructionString += "rect " + (x + outlineThickness + length) + " " + (-(y + outlineThickness)) + " " + outlineThickness + " " + (-(thickness + outlineThickness)) + "\n";
                }
            }
        }
        if (i==2){ //bottom left (negative x from bottom right)
            if(enabledSides.bottomleft == 0){continue}
            if (outline==0){
                if(ctxCross !== "returnString"){
                    ctxCross.beginPath();
                    ctxCross.rect(-(x + outlineThickness), y + outlineThickness, -(length), thickness);
                    ctxCross.rect(-(x + outlineThickness), y + outlineThickness + thickness, -(thickness), length - thickness);
                }
                else{
                    instructionString += "beginPath\n";
                    instructionString += "rect " + (-(x + outlineThickness)) + " " + (y + outlineThickness) + " " + (-length) + " " + thickness + "\n";
                    instructionString += "rect " + (-(x + outlineThickness)) + " " + (y + outlineThickness + thickness) + " " + (-thickness) + " " + (length - thickness) + "\n";
                }
            }
            else{ //outline
                if(ctxCross !== "returnString"){
                    ctxCross.beginPath();
                    ctxCross.rect(-(x), y, -(length + 2*outlineThickness), outlineThickness);
                    ctxCross.rect(-(x), y + outlineThickness, -(outlineThickness), length + outlineThickness);
                    ctxCross.rect(-(x + outlineThickness), y + outlineThickness + length, -(thickness), outlineThickness);
                    ctxCross.rect(-(x + outlineThickness + thickness), y + outlineThickness + thickness, -(length - thickness), outlineThickness);
                    ctxCross.rect(-(x + outlineThickness + thickness), y + 2*outlineThickness + thickness, -(outlineThickness), length - thickness);
                    ctxCross.rect(-(x + outlineThickness + length), y + outlineThickness, -(outlineThickness), thickness + outlineThickness);
                }
                else{
                    instructionString += "beginPath\n";
                    instructionString += "rect " + (-x) + " " + y + " " + (-(length + 2*outlineThickness)) + " " + outlineThickness + "\n";
                    instructionString += "rect " + (-x) + " " + (y + outlineThickness) + " " + (-outlineThickness) + " " + (length + outlineThickness) + "\n";
                    instructionString += "rect " + (-(x + outlineThickness)) + " " + (y + outlineThickness + length) + " " + (-thickness) + " " + outlineThickness + "\n";
                    instructionString += "rect " + (-(x + outlineThickness + thickness)) + " " + (y + outlineThickness + thickness) + " " + (-(length - thickness)) + " " + outlineThickness + "\n";
                    instructionString += "rect " + (-(x + outlineThickness + thickness)) + " " + (y + 2*outlineThickness + thickness) + " " + (-outlineThickness) + " " + (length - thickness) + "\n";
                    instructionString += "rect " + (-(x + outlineThickness + length)) + " " + (y + outlineThickness) + " " + (-outlineThickness) + " " + (thickness + outlineThickness) + "\n";
                }
            }
        }
        if (i==3){ //top left (negative x and y from bottom right)
            if(enabledSides.topleft == 0){continue}
            if (outline==0){
                if(ctxCross !== "returnString"){
                    ctxCross.beginPath();
                    ctxCross.rect(-(x + outlineThickness), -(y + outlineThickness), -(length), -(thickness));
                    ctxCross.rect(-(x + outlineThickness), -(y + outlineThickness + thickness), -(thickness), -(length - thickness));
                }
                else{
                    instructionString += "beginPath\n";
                    instructionString += "rect " + (-(x + outlineThickness)) + " " + (-(y + outlineThickness)) + " " + (-length) + " " + (-thickness) + "\n";
                    instructionString += "rect " + (-(x + outlineThickness)) + " " + (-(y + outlineThickness + thickness)) + " " + (-thickness) + " " + (-(length - thickness)) + "\n";
                }
            }
            else{ //outline
                if(ctxCross !== "returnString"){
                    ctxCross.beginPath();
                    ctxCross.rect(-(x), -(y), -(length + 2*outlineThickness), -(outlineThickness));
                    ctxCross.rect(-(x), -(y + outlineThickness), -(outlineThickness), -(length + outlineThickness));
                    ctxCross.rect(-(x + outlineThickness), -(y + outlineThickness + length), -(thickness), -(outlineThickness));
                    ctxCross.rect(-(x + outlineThickness + thickness), -(y + outlineThickness + thickness), -(length - thickness), -(outlineThickness));
                    ctxCross.rect(-(x + outlineThickness + thickness), -(y + 2*outlineThickness + thickness), -(outlineThickness), -(length - thickness));
                    ctxCross.rect(-(x + outlineThickness + length), -(y + outlineThickness), -(outlineThickness), -(thickness + outlineThickness));
                }
                else{
                    instructionString += "beginPath\n";
                    instructionString += "rect " + (-x) + " " + (-y) + " " + (-(length + 2*outlineThickness)) + " " + (-outlineThickness) + "\n";
                    instructionString += "rect " + (-x) + " " + (-(y + outlineThickness)) + " " + (-outlineThickness) + " " + (-(length + outlineThickness)) + "\n";
                    instructionString += "rect " + (-(x + outlineThickness)) + " " + (-(y + outlineThickness + length)) + " " + (-thickness) + " " + (-outlineThickness) + "\n";
                    instructionString += "rect " + (-(x + outlineThickness + thickness)) + " " + (-(y + outlineThickness + thickness)) + " " + (-(length - thickness)) + " " + (-outlineThickness) + "\n";
                    instructionString += "rect " + (-(x + outlineThickness + thickness)) + " " + (-(y + 2*outlineThickness + thickness)) + " " + (-outlineThickness) + " " + (-(length - thickness)) + "\n";
                    instructionString += "rect " + (-(x + outlineThickness + length)) + " " + (-(y + outlineThickness)) + " " + (-outlineThickness) + " " + (-(thickness + outlineThickness)) + "\n";
                }
            }
        }
        if(ctxCross !== "returnString"){
            ctxCross.fill();
        }
        else{
            instructionString += "fill\n";
        }
    }
    if(ctxCross !== "returnString"){
        ctxCross.restore();
    }
    else{
        instructionString += "restore\n";
    }

    return instructionString;
}

function initialize_crosshair_creator(zoom, crosshair_definition, engine_variable, layer_display){
    
    cleanCrosshairDefinition(crosshair_definition); //set default crosshair if we have received empty definition

    initializeCrosshairPasteInput(zoom, crosshair_definition, engine_variable);

    zoom_suffix = zoom ? "_zoom":"";

    var layerContainer = _id(zoom ? "canvas_crosshair_zoom_layer_container" : "canvas_crosshair_layer_container");
    layerContainer.style.display = "block";
    
    for (let layer of crosshairLayers){
        let el = zoom ? _id("canvas_cross_zoom_" + layer + "_setting") : _id("canvas_cross_" + layer + "_setting");
        _empty(el);

        //if definition is pasted in with invalid type correct it
        if(!crosshairLayerTypes.includes(crosshair_definition[layer].type)){
            crosshair_definition[layer].type = "none";
        }

        for (let type of crosshairLayerTypes) {
            let opt = _createElement("div");
            opt.dataset.value = type;
            opt.textContent = localize("settings_crosshair_layer_type_" + type);
            if (opt.dataset.value == crosshair_definition[layer].type){
                opt.dataset.selected = 1;
            }
            el.appendChild(opt);
        }

        set_crosshair_creator_layer_type(layer, crosshair_definition[layer].type, zoom, crosshair_definition, engine_variable, layer_display);

        ui_setup_select(el, function(opt, field) {
            crosshair_definition[layer].type = field.dataset.value;
            set_crosshair_creator_layer_type(layer, crosshair_definition[layer].type, zoom, crosshair_definition, engine_variable, 'block');
            removeCrosshairScaleWarning(zoom, crosshair_definition);
            updateCrosshairPreview(zoom, crosshair_definition);
            updateEngineCrosshairDefinition(zoom, engine_variable, crosshair_definition);
        });
    }
    updateCrosshairPreview(zoom, crosshair_definition); 

    //update necessary data-* to point to the correct engine variable and crosshair_definition

    //used in load_preset_canvas_crosshair
    let presetContainer = _id(zoom?"crosshair_zoom_preset_container":"crosshair_preset_container");
    presetContainer.dataset.enginevar = engine_variable;

    //used to copy definition code
    var copyButton = _id(zoom?"crosshair_canvas_zoom_copy_button":"crosshair_canvas_copy_button");
    copyButton.dataset.crossdef = JSON.stringify(crosshair_definition);

    //used in scale warnings
    let scaleWarningContainer = _id(zoom?"crosshair_canvas_zoom_preview_scale_warning":"crosshair_canvas_preview_scale_warning");
    scaleWarningContainer.dataset.enginevar = engine_variable;
    scaleWarningContainer.dataset.crossdef = JSON.stringify(crosshair_definition);

    var scaleWarning = _id(zoom?"crosshair_canvas_zoom_preview_scale_warning":"crosshair_canvas_preview_scale_warning");
    if(crosshair_definition.designVh == window.innerHeight){
        scaleWarning.style.display = "none";
    }
    else{
        scaleWarning.style.display = "block";
    }
}

function cleanCrosshairDefinition(obj){
    for (let layer of crosshairLayers) {
        if (!(obj.hasOwnProperty(layer))){
            if(layer == 'layer1'){
                //default crosshair
                obj[layer] = {type: 'cross', crTop: '1', crRig: '1', crBot: '1', crLef: '1', crHCE: '0', crCol: 'FFFFFF', crOCo: '000000', crHCo: 'FF0000', crLen: '8', crThi: '2', crGap: '4', crRot: '0', crOTh: '1' }; //'default crosshair'
            }
            else{
                obj[layer] = {type: "none"};
            }
        }
    }
    if (!obj.hasOwnProperty('designVh')){
        obj.designVh = window.innerHeight;
    }
    else if(isNaN(parseInt(obj.designVh))){
        obj.designVh = window.innerHeight;
    }
    else if(obj.designVh <= 0){
        obj.designVh = window.innerHeight;
    }
    return obj;
}

function set_crosshair_creator_layer_type(layer, type, zoom, crosshair_definition, engine_variable, display){
    var zoom_suffix = zoom ? "_zoom" : "";
    var el = _id("canvas_cross" + zoom_suffix + "_" + layer + "_options")
    var header = _id("canvas_cross" + zoom_suffix + "_"+ layer + "_header");
    var temp = "canvas_crosshair_" + type + "_template";
    var viewScale = window.innerHeight / 1080; //our slider inputs are designed to be reasonable for 1080p so scale relative to that
    function scaleToRes(val){
        return (Math.ceil(parseInt(val)*viewScale));
    }
    var data = {
        layer: layer,
        zoom: zoom_suffix,
    }
    var helpers = {
        scale: scaleToRes,
        localize: localize
    }    
    if(type=='none'){
        display = 'none';
    }
    el.style.display = display;
    header.style.backgroundImage = (display == 'none') ? "url(/html/images/icons/fa/caret-right.svg)" : "url(/html/images/icons/fa/caret-down.svg)";
    var template = window.jsrender.templates(_id(temp).textContent);
    _html((el), template.render(data, helpers));

    reinitializeCrosshairOptions(el, layer, type, zoom, crosshair_definition, engine_variable);
    var modal = zoom ? _id("crosshair_canvas_zoom_editor_screen") : _id("crosshair_canvas_editor_screen");
    refreshScrollbar(modal.querySelector(".crosshair_scroll"));
}

function reinitializeCrosshairOptions(parent, layer, type, zoom, crosshair_definition, engine_variable){
    var layer_definition = {}
    layer_definition.type = type;
    //checkboxes
    _for_each_with_class_in_parent(parent, "checkbox", function(el) {
        var val = el.dataset.default;
        if (crosshair_definition.hasOwnProperty(layer)) {
            if (crosshair_definition[layer].hasOwnProperty(el.dataset.key)) {
                val = crosshair_definition[layer][el.dataset.key];
                let validCheckbox = (val == 0 || val == 1);
                if(!validCheckbox){val = el.dataset.default};
            }
        }
        el.dataset.enabled = val;
        updateCrosshairCheckbox(el);
        layer_definition[el.dataset.key] = val;

        el.addEventListener("click", function(){
            if (el.classList.contains("disabled")) return;
            
            if (el.dataset.enabled == 1) {
                el.dataset.enabled = 0;
                el.classList.remove("checkbox_enabled");
                el.firstElementChild.classList.remove("inner_checkbox_enabled");
                engine.call('ui_sound', 'ui_uncheck_box');
            } else {
                el.dataset.enabled = 1;
                el.classList.add("checkbox_enabled");
                el.firstElementChild.classList.add("inner_checkbox_enabled");
                engine.call('ui_sound', 'ui_check_box');
            }
            updateCrosshairDefinitionValue(zoom, layer, el.dataset.key, el.dataset.enabled, crosshair_definition);
            updateCrosshairPreview(zoom, crosshair_definition);
            updateEngineCrosshairDefinition(zoom, engine_variable, crosshair_definition);
        });
    })
    //color pickers
    _for_each_with_class_in_parent(parent, "jscolor", function(el) {
        var val = el.dataset.default;
        if (crosshair_definition.hasOwnProperty(layer)) {
            if (crosshair_definition[layer].hasOwnProperty(el.dataset.key)) {
                val = crosshair_definition[layer][el.dataset.key];
                if(typeof val != 'string'){val = el.dataset.default} //jscolor expects a string
            }
        }
        var opts = {value:val}
        var picker = new jscolor(el, opts, null, true);
        picker.onFineChange = function() {
            updateCrosshairDefinitionValue(zoom, layer, el.dataset.key, el.value, crosshair_definition);
            updateCrosshairPreview(zoom, crosshair_definition);
        }
        el.onchange = function(){ //onchange fires before onFineChange so we need to update definition value here too so it is ready for updating engine definition
            updateCrosshairDefinitionValue(zoom, layer, el.dataset.key, el.value, crosshair_definition);
            updateEngineCrosshairDefinition(zoom, engine_variable, crosshair_definition);
        }
        el.addEventListener("keydown", function(e) {
            e.stopPropagation();
        })
        layer_definition[el.dataset.key] = el.value; // let jscolor deal with input formatting so set this after
    })
    //range sliders
    _for_each_with_class_in_parent(parent, "range-slider", function(el) {
        var val = el.dataset.default;
        if (crosshair_definition.hasOwnProperty(layer)) {
            if (crosshair_definition[layer].hasOwnProperty(el.dataset.key)) {
                val = parseInt(crosshair_definition[layer][el.dataset.key]);
                if(isNaN(val)) {val = el.dataset.default}
                if(val > parseInt(el.dataset.max) * Math.ceil(crosshair_definition.designVh/window.innerHeight)) {val = parseInt(el.dataset.max) * Math.ceil(crosshair_definition.designVh/window.innerHeight)}
                if(val < parseInt(el.dataset.min)) {val = parseInt(el.dataset.min)}
            }
        }
        layer_definition[el.dataset.key] = val;
        var slider = new rangeSlider(el, false, function() {
            var inputValue = parseInt(el.dataset.value);
            if(inputValue > parseInt(el.dataset.max)) {slider.setValue(el.dataset.max);}
            if(inputValue < parseInt(el.dataset.min)) {slider.setValue(el.dataset.min);}
            updateCrosshairDefinitionValue(zoom, layer, el.dataset.key, el.dataset.value, crosshair_definition);//called here and on finechange so text input works
            updateCrosshairPreview(zoom, crosshair_definition);//called here and on finechange so text input works
            updateEngineCrosshairDefinition(zoom, engine_variable, crosshair_definition);
            crosshairCreatorWarning(el.dataset.key, layer, zoom, crosshair_definition);
        }, function(){
            updateCrosshairDefinitionValue(zoom, layer, el.dataset.key, el.dataset.value, crosshair_definition);
            updateCrosshairPreview(zoom, crosshair_definition);
            crosshairCreatorWarning(el.dataset.key, layer, zoom, crosshair_definition);
        });
        //onFineChange update preview, but dont update engine variable until onchange (mouseup basically)
        slider.setValue(val);
    })
    //select fields
    _for_each_with_class_in_parent(parent, "select-field", function(el) {
        _empty(el);
        var val = el.dataset.default;
        if (crosshair_definition.hasOwnProperty(layer)) {
            if (crosshair_definition[layer].hasOwnProperty(el.dataset.key)) {
                val = crosshair_definition[layer][el.dataset.key];
                let validSelect = el.dataset.opts.split(",").map(function(o){return o.toLowerCase();}).includes(val);
                if(!validSelect){val = el.dataset.default};
            }
        }
        layer_definition[el.dataset.key] = val;
        el.dataset.opts.split(",").forEach(function(type) {
            let opt= _createElement("div");
            opt.dataset.value = type.toLowerCase();
            opt.textContent = localize("settings_crosshair_option_" + type.toLowerCase());
            if (opt.dataset.value == val){
                opt.dataset.selected = 1; 
            }
            el.appendChild(opt);
        })

        ui_setup_select(el, function(opt, field) {
            updateCrosshairDefinitionValue(zoom, layer, el.dataset.key, field.dataset.value, crosshair_definition);
            updateCrosshairPreview(zoom, crosshair_definition);
            updateEngineCrosshairDefinition(zoom, engine_variable, crosshair_definition);
            crosshairCreatorWarning(el.dataset.key, layer, zoom, crosshair_definition);
        });
    });
    //tooltips
    _for_each_with_class_in_parent(parent,'tooltip2', function(el) {
        add_tooltip2_listeners(el);
    });

    updateCrosshairDefinitionLayer(zoom, layer, layer_definition, crosshair_definition);

    //loop over sliders again after all values have been initialized so check for warnings
    _for_each_with_class_in_parent(parent, "range-slider", function(el) {
        crosshairCreatorWarning(el.dataset.key, layer, zoom, crosshair_definition);
    })
}

function updateCrosshairCheckbox(el){
    if (el.dataset.enabled == 0){
        el.classList.remove("checkbox_enabled");
        el.firstElementChild.classList.remove("inner_checkbox_enabled");
    }
    else {
        el.classList.add("checkbox_enabled");
        el.firstElementChild.classList.add("inner_checkbox_enabled");
    }
}

function updateCrosshairDefinitionLayer(zoom, layer, layer_definition, crosshair_definition){
    crosshair_definition[layer] = layer_definition;  
}

function updateCrosshairDefinitionValue(zoom, layer, key, value, crosshair_definition){
    crosshair_definition[layer][key] = value;
    removeCrosshairScaleWarning(zoom, crosshair_definition);
}

function load_preset_canvas_crosshair(preset_crosshair_definition, engine_variable, zoom){
    //So that we dont modify the values in the presets array (e.g. select preset -> change value -> try to use preset again keeps changed value if we dont 'deep clone' definition)
    var crosshair_definition = JSON.parse(JSON.stringify(preset_crosshair_definition)); 
    //fully reinitialize so that layer type select fields point to the new crosshair_definition
    initialize_crosshair_creator(zoom, crosshair_definition, engine_variable, 'block');
    updateEngineCrosshairDefinition(zoom, engine_variable, crosshair_definition);
}

function toggleCrosshairCreatorLayerView(id, header, modal){
    el = _id(id);
    if (el.style.display === "none") {
        el.style.display = "block";
        header.style.backgroundImage = "url(/html/images/icons/fa/caret-down.svg)";
    } else {
        el.style.display = "none";
        header.style.backgroundImage = "url(/html/images/icons/fa/caret-right.svg)";
    }
    refreshScrollbar(_id(modal).querySelector(".crosshair_scroll"));
}

function crosshairCreatorWarning(key, layer, zoom, crosshair_definition){
    var zoom_suffix = zoom ? "_zoom":"";
    if(key=='crThi' || key=='crRot'){
        var warningEl = _id("canvas_crosshair_" + layer + zoom_suffix + "_cross_thickness_warning");
        if(crosshair_definition[layer].crThi%2==1 && crosshair_definition[layer].crRot == 0){warningEl.style.display = "block";}        
        else{warningEl.style.display = "none";}
    }
    else if(key=='dTyp' || key=='dThi' || key=='dRot'){
        var warningEl = _id("canvas_crosshair_" + layer + zoom_suffix + "_dot_thickness_warning");
        if(crosshair_definition[layer].dThi%2==1 && crosshair_definition[layer].dTyp == 'square' && crosshair_definition[layer].dRot == 0){warningEl.style.display = "block";}        
        else{warningEl.style.display = "none";}
    }
    else if(key=='ciSeg' || key=='ciGap'){
        var warningEl = _id("canvas_crosshair_" + layer + zoom_suffix + "_circle_segments_warning");
        if(crosshair_definition[layer].ciSeg != 1 && crosshair_definition[layer].ciGap == 0){warningEl.style.display = "block";}        
        else{warningEl.style.display = "none";}
    }
    else if(key=='poThi' || key=='poLen'){
        var warningEl = _id("canvas_crosshair_" + layer + zoom_suffix + "_pointer_thickness_warning");
        if(parseInt(crosshair_definition[layer].poThi) > parseInt(crosshair_definition[layer].poLen)){
            warningEl.style.display = "block";
        }        
        else{warningEl.style.display = "none";}
    }
}

function copyCrosshairDefinition(crosshair_string){
    let copy_string = generateShortCrosshairString(crosshair_string);
    engine.call("copy_text", copy_string);    
}

function generateShortCrosshairString(cross_def){
    if(typeof cross_def == 'string'){
        var crosshair_definition = JSON.parse(cross_def);
    }
    else{
        var crosshair_definition = cross_def;
    }
    let short_definition = {};

    let layer_name_map = {"layer1":"1", "layer2":"2", "layer3":"3"};
    //maintain this order when adding new properties so old crosshair paste codes don't break
    let cross_type_index_map = ["type", "crTop", "crRig", "crBot", "crLef", "crHCE", "crCol", "crOCo", "crHCo", "crLen", "crThi", "crGap", "crRot", "crOTh", "crOSt"];
    let circle_type_index_map = ["type", "ciHCE", "ciCol", "ciOCo", "ciHCo", "ciSeg", "ciRad", "ciThi", "ciGap", "ciRot", "ciOTh", "ciOSt"];
    let dot_type_index_map = ["type", "dHCE", "dCol", "dOCo", "dHCo", "dThi", "dOTh", "dTyp", "dOSt", "dRot"];
    let pointer_type_index_map = ["type", "poTL", "poTR", "poBR", "poBL", "poHCE", "poCol", "poOCo", "poHCo", "poLen", "poThi", "poGap", "poRot", "poOTh", "poOSt"];

    for (let layer of crosshairLayers){
        if (crosshair_definition.hasOwnProperty(layer)){
            let layerArr = [];
            let type_index_map = ["type"]; //essentially for type: none
            if(crosshair_definition[layer].type == 'cross'){type_index_map = cross_type_index_map}
            else if(crosshair_definition[layer].type == 'circle'){type_index_map = circle_type_index_map}
            else if(crosshair_definition[layer].type == 'dot'){type_index_map = dot_type_index_map}
            else if(crosshair_definition[layer].type == 'pointer'){type_index_map = pointer_type_index_map}

            for(let i=0; i<=type_index_map.length; i++){
                if(crosshair_definition[layer].hasOwnProperty(type_index_map[i])){
                    layerArr[i] = crosshair_definition[layer][type_index_map[i]];
                }
            }
            short_definition[layer_name_map[layer]] = layerArr;
        }
        if (crosshair_definition.hasOwnProperty('designVh')){
            short_definition['d'] = crosshair_definition.designVh;
        }
    }

    let short_string = JSON.stringify(short_definition);

    return short_string
}

function generateFullCrosshairDefinition(short_string){
    try {
        var short_definition = JSON.parse(short_string);
    } catch (e) {
        var short_definition = {}
    }    

    let full_definition = {};

    let layer_name_map = {"layer1":"1", "layer2":"2", "layer3":"3"};
    //maintain this order when adding new properties so old crosshair paste codes don't break
    let cross_type_index_map = ["type", "crTop", "crRig", "crBot", "crLef", "crHCE", "crCol", "crOCo", "crHCo", "crLen", "crThi", "crGap", "crRot", "crOTh", "crOSt"];
    let circle_type_index_map = ["type", "ciHCE", "ciCol", "ciOCo", "ciHCo", "ciSeg", "ciRad", "ciThi", "ciGap", "ciRot", "ciOTh", "ciOSt"];
    let dot_type_index_map = ["type", "dHCE", "dCol", "dOCo", "dHCo", "dThi", "dOTh", "dTyp", "dOSt", "dRot"];
    let pointer_type_index_map = ["type", "poTL", "poTR", "poBR", "poBL", "poHCE", "poCol", "poOCo", "poHCo", "poLen", "poThi", "poGap", "poRot", "poOTh", "poOSt"];

    for (let layer of crosshairLayers){
        if (short_definition.hasOwnProperty(layer_name_map[layer])){
            let layerObj = {};
            let type_index_map = ["type"]; //essentially for type: none, or misinput of type
            if(short_definition[layer_name_map[layer]][0] == 'cross'){type_index_map = cross_type_index_map}
            else if(short_definition[layer_name_map[layer]][0] == 'circle'){type_index_map = circle_type_index_map}
            else if(short_definition[layer_name_map[layer]][0] == 'dot'){type_index_map = dot_type_index_map}
            else if(short_definition[layer_name_map[layer]][0] == 'pointer'){type_index_map = pointer_type_index_map}

            if(!Array.isArray(short_definition[layer_name_map[layer]])){
                layerObj = {"type": 'none'};
            }
            else{
                for(let i=0; i<=short_definition[layer_name_map[layer]].length; i++){
                    layerObj[type_index_map[i]] = short_definition[layer_name_map[layer]][i];
                }
            }
            full_definition[layer] = layerObj;
        }
    }

    if (short_definition.hasOwnProperty('d')){
        full_definition['designVh'] = short_definition.d;
    }

    return full_definition
}

function initializeCrosshairPasteInput(zoom, current_crosshair_definition, engine_variable){
    zoom_suffix = zoom ? "_zoom" : "";
    var layerContainer = _id("canvas_crosshair" + zoom_suffix + "_layer_container");
    var inputContainer = _id("canvas_crosshair" + zoom_suffix + "_paste_input_container");

    _empty(inputContainer);
    var inputPasteTemplate = window.jsrender.templates(_id("canvas_crosshair_paste_input_template").textContent);
    _html((inputContainer), inputPasteTemplate.render({zoom:zoom_suffix}, {localize:localize}));

    inputContainer.style.display = "none";

    var confirmButton = _id("crosshair" + zoom_suffix + "_paste_input_confirm");
    var cancelButton = _id("crosshair" + zoom_suffix + "_paste_input_cancel");

    let input = _id("crosshair" + zoom_suffix + "_paste_input");
    input.dataset.valid = 'false';
    var inputValue;
    var new_crosshair_definition;

    var inputPasteWarning = _id("crosshair" + zoom_suffix + "_paste_input_warning");
    inputPasteWarning.style.display = 'none';

    input.addEventListener("input", function(e) {
        e.target.value = e.target.value.trimStart();
        inputValue = e.target.value;

        if (isValidJson(inputValue)){
            let fullInputDefinition = generateFullCrosshairDefinition(inputValue);
            if(isValidCrosshairDefinition(fullInputDefinition)){
                new_crosshair_definition = fullInputDefinition;
                updateCrosshairPreview(zoom, new_crosshair_definition);
                input.dataset.valid = 'true';
                inputPasteWarning.style.display = 'none';
            }
            else {
                updateCrosshairPreview(zoom, current_crosshair_definition);
                input.dataset.valid = 'false';
                inputPasteWarning.style.display = 'block';  
            }
        }
        else {
            updateCrosshairPreview(zoom, current_crosshair_definition);
            input.dataset.valid = 'false';
            inputPasteWarning.style.display = 'block';            
        }
    });

    input.addEventListener("dblclick", function() {
        this.setSelectionRange(0, this.value.length);
    });
    
    confirmButton.addEventListener("click", function() {
        if (input.dataset.valid == 'true'){
            initialize_crosshair_creator(zoom, new_crosshair_definition, engine_variable, 'none');
            updateEngineCrosshairDefinition(zoom, engine_variable, new_crosshair_definition);
        }
    })

    cancelButton.addEventListener("click", function() {
        inputContainer.style.display = "none";
        layerContainer.style.display = "block";
        updateCrosshairPreview(zoom, current_crosshair_definition);
        input.dataset.valid = 'false';
        input.value = "";
        inputPasteWarning.style.display = 'none';  
    })

    function isValidJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    function isValidCrosshairDefinition(obj){
        for (let layer of crosshairLayers) {
            if (!(obj.hasOwnProperty(layer))){
                return false;
            }
        }
        if (!obj.hasOwnProperty('designVh')){
            obj.designVh == window.innerHeight;
        }
        else if(isNaN(parseInt(obj.designVh))){
            obj.designVh = window.innerHeight;
        }
        else if(obj.designVh <= 0){
            obj.designVh = window.innerHeight;
        }
        return true;
    }
    
}

function openCrosshairPasteInput(zoom){
    zoom_suffix = zoom ? "_zoom" : "";
    var inputContainer = _id("canvas_crosshair" + zoom_suffix + "_paste_input_container");
    inputContainer.style.display = "block";
    var layerContainer = _id("canvas_crosshair" + zoom_suffix + "_layer_container");
    layerContainer.style.display = "none";
    let input = _id("crosshair" + zoom_suffix + "_paste_input");
    input.focus();
}

function scaleCrosshairDefinition(crosshair_definition){
    if(parseInt(crosshair_definition.designVh) != window.innerHeight){
        var scaleFactor = window.innerHeight / parseInt(crosshair_definition.designVh);
        for (let layer of crosshairLayers) {
            if(crosshair_definition[layer].type == 'cross'){
                let scaleableKeys = ['crLen','crThi','crGap','crOTh'];
                for (let key of scaleableKeys){
                    scaleCrosshairValue(crosshair_definition, layer, key, scaleFactor);
                }                
            }
            else if(crosshair_definition[layer].type == 'circle'){
                let scaleableKeys = ['ciRad','ciThi', 'ciOTh'];
                for (let key of scaleableKeys){
                    scaleCrosshairValue(crosshair_definition, layer, key, scaleFactor);
                }                
            }
            else if(crosshair_definition[layer].type == 'dot'){
                let scaleableKeys = ['dThi', 'dOTh'];
                for (let key of scaleableKeys){
                    scaleCrosshairValue(crosshair_definition, layer, key, scaleFactor);
                }                
            }
            else if(crosshair_definition[layer].type == 'pointer'){
                let scaleableKeys = ['poLen', 'poThi', 'poGap', 'poOth'];
                for (let key of scaleableKeys){
                    scaleCrosshairValue(crosshair_definition, layer, key, scaleFactor);
                }                
            }
        }
        crosshair_definition.designVh = window.innerHeight;
    }
}

function scaleCrosshairValue(crosshair_definition, layer, key, scaleFactor){
    //if the original crosshair did not present a warning, make sure the scaled does not either
    if((crosshair_definition[layer].crThi%2==0 && crosshair_definition[layer].crRot == 0) ||
    (crosshair_definition[layer].dThi%2==0 && crosshair_definition[layer].dTyp == 'square' && crosshair_definition[layer].dRot == 0)){
        crosshair_definition[layer][key] = 2 * Math.ceil(parseInt(crosshair_definition[layer][key]) * scaleFactor / 2);
    } 
    else{
        crosshair_definition[layer][key] = Math.ceil(parseInt(crosshair_definition[layer][key]) * scaleFactor);
    }
}

function scaleCrosshairToRes(zoom, crosshair_string, engine_variable){
    crosshair_definition = JSON.parse(crosshair_string);
    scaleCrosshairDefinition(crosshair_definition);
    initialize_crosshair_creator(zoom, crosshair_definition, engine_variable, 'block');
    updateEngineCrosshairDefinition(zoom, engine_variable, crosshair_definition);
}

function removeCrosshairScaleWarning(zoom, crosshair_definition){
    if (typeof crosshair_definition == 'string'){
        crosshair_definition = JSON.parse(crosshair_definition);
    }
    crosshair_definition.designVh = window.innerHeight;
    var scaleWarning = _id(zoom?"crosshair_canvas_zoom_preview_scale_warning":"crosshair_canvas_preview_scale_warning");
    scaleWarning.style.display = "none";
}
function closeCrosshairEditorScreen(zoom){
    zoom_suffix = zoom ? "_zoom":"";
    let layerContainer = _id("canvas_crosshair" + zoom_suffix + "_layer_container");
    let inputContainer = _id("canvas_crosshair" + zoom_suffix + "_paste_input_container");
    let input = _id("crosshair" + zoom_suffix + "_paste_input");
    let copyButton = _id(zoom?"crosshair_canvas_zoom_copy_button":"crosshair_canvas_copy_button");
    let inputPasteWarning = _id("crosshair" + zoom_suffix + "_paste_input_warning");
    inputContainer.style.display = "none";
    layerContainer.style.display = "block";
    input.dataset.valid = 'false';
    input.value = "";
    inputPasteWarning.style.display = 'none';
    close_modal_screen_by_selector("crosshair_canvas" + zoom_suffix + "_editor_screen");
    updateCrosshairPreview(zoom, JSON.parse(copyButton.dataset.crossdef));
}

// NOTES//

//When adding new keys, add input to js-templates, add parameter to relevant draw function and drawCrosshair,
//check if warning needed for certain values, add to ScaleCrosshairValue if required.

//have to be careful whether we are using the short crosshair string or the full definition, in certain places
//such as copy button we use a stringified full definition