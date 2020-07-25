class HUD_element {
    constructor(type, nativeElement, defaultValues, hudEditCode = [], template, content) {

        if (nativeElement) {
            //hudEditCode.unshift({"inputType": "toggle", "type": "native", "text": "Render Native"});
        }
        
        this.type = type;
        this.nativeElement = nativeElement;
        this.defaultValues = defaultValues;
        this.hudEditCode = hudEditCode;
        //If content is provided, we use that for the contents of the element, otherwise
        //we use the template
        this.template = template;
        this.content = content;
        
        for(var i = 0; i < this.hudEditCode.length; i++){
            this.hudEditCode[i].id = "hud_edit_setting_" + hudEditCode[i].type;
        }
    }

    setDefaultValues(element){
        for (var item in this.defaultValues) {
            element[item] = this.defaultValues[item];
        }

        if (this.nativeElement) {
            element["native"] = "1";
        }
    }

    getHudEditCode(element){
        var returnString = "";

        var captured_id = parseInt(element.dataset.id);

        for (var i = 0; i < this.hudEditCode.length; i++) {
            var item = this.hudEditCode[i];

            if (item.inputType == "toggle") {
                returnString += editorCreateToggle(element, item.id, item.type, item.text, captured_id);
            } else if (item.inputType == "color") {
                returnString += editorCreateColor(element, item.id, item.type, item.text);
            } else if (item.inputType == "float") {
                returnString += editorCreateInput(element, item.id, item.type, item.text, captured_id);
            } else if (item.inputType === "text") {
                returnString += editorCreateInputText(element, item.id, item.type, item.text, item.maxLength, captured_id);
            } else if (item.inputType === "list") {
                returnString += editorCreateList(element, item.id, item.type, item.text, item.listValues, captured_id);
            //} else if (item.inputType === "advanced") {
                //returnString += editorCreateAdvanced(element, item.id, this.type, captured_id);
            }
        }

        return returnString;
    }

    afterCreatedCode(captured_id) {
        if(this.hudEditCode) {
            for (var i = 0; i < this.hudEditCode.length; i++) {
                var item = this.hudEditCode[i];

                if (item.inputType == "toggle") {
                    editorToggleButton(this.type, item.id);
                } else if (item.inputType == "float" || item.inputType == "text") {
                    valueOnChange(this.type, item.id);
                } else if (item.inputType == "list") {
                    listOnChange(this.type, captured_id, item.id, item.type);
                }
            }
        }
    }


    getRenderCode(element, isPreview, isSpectating){

        var data = {};
        if (isPreview) data['hudPreview'] = true;
        if (isSpectating) data['hudSpectating'] = true;

        data["elemIdx"] = element.dataset.elemIdx;

        if( this.hudEditCode){
            for (var i = 0; i < this.hudEditCode.length; i++) {
                var item = this.hudEditCode[i];

                if(item.inputType == "toggle"){
                    data[item.type] = element.dataset[item.type];
                }
                else if(item.inputType == "float"){
                    data[item.type] = element.dataset[item.type]
                }
                else if(item.inputType == "text"){
                    data[item.type] = element.dataset[item.type]
                }
                else if(item.inputType == "list"){
                    data[item.type] = element.dataset[item.type]
                }
                else if (item.inputType == "color"){
                    // encode hashes on stroke and fill, can possibly hash all of them though
                    if (item.type == "stroke" || item.type == "fill") {
                        data[item.type] = encodeURIComponent(element.dataset[item.type]);
                    } else {
                        data[item.type] = element.dataset[item.type];
                    }
                }
                else if (item.inputType == "hidden"){
                    data[item.type] = element.dataset[item.type]
                }
            }
        }
        
        var str = (this.template).slice(1);

        var template = window.jsrender.templates(_id(str).textContent);

        if(template == undefined || template == "" || !template){
            console.warn("Can't find template.", str);
        }

        return template.render(data);
    }
}

function getTemplateRender(tagetTemplate, data = null){
    var template = window.jsrender.templates(_id(tagetTemplate).textContent);

    return template.render(data);
}

const defaultFontList = [
    {"name": "Default", "value": "default"},
    {"name": "Roboto", "value": "roboto"},
    {"name": "Roboto-Bold", "value": "roboto-bold"},
    {"name": "Montserrat", "value": "montserrat"},
    {"name": "Montserrat-Bold", "value": "montserrat-bold"},
    {"name": "AgencyFB-Bold", "value": "agencyfb-bold"},
    {"name": "Furore", "value": "furore"},
    {"name": "NotoSans-Regular", "value": "notosans"},
    {"name": "NotoSans-Bold", "value": "notosans-bold"},
    {"name": "Poppins-Medium", "value": "poppins-medium"},
    {"name": "Poppins-Bold", "value": "poppins-bold"},
    {"name": "Veneer", "value": "veneer"},
    {"name": "Veneer Italic", "value": "veneer-italic"},
];

const defaultX =  {"inputType": "float", "type": "x", "text": "X"};
const defaultY =  {"inputType": "float", "type": "y", "text": "Y"};
const defaultWidth =  {"inputType": "float", "type": "width", "text": "Width"};
const defaultHeight =  {"inputType": "float",  "type": "height", "text": "Height"};
const defaultFontSize =  {"inputType": "float",  "type": "fontSize", "text": "Text Size"};
const defaultFontFamily =  {"inputType": "list", "type": "font", "text": "Font", "listValues": defaultFontList};



const defaultAlign =  {"inputType": "list", "type": "align", "text": "Align", "listValues":
    [
        {"name": "Left", "value": "left"},
        {"name": "Center", "value": "center"},
        {"name": "Right", "value": "right"},
    ]
};

const defaultPivot =  {"inputType": "list", "type": "pivot", "text": "Pivot", "listValues":
    [
        {"name": "Center", "value": "center"},
        {"name": "Top Left", "value": "top-left"},
        {"name": "Top Edge", "value": "top-edge"},
        {"name": "Top Right", "value": "top-right"},
        {"name": "Left Edge", "value": "left-edge"},
        {"name": "Right Edge", "value": "right-edge"},
        {"name": "Bottom Left", "value": "bottom-left"},
        {"name": "Bottom Edge", "value": "bottom-edge"},
        {"name": "Bottom Right", "value": "bottom-right"},
    ]
};

const defaultColor =  {"inputType": "color", "type": "color", "text": "Color"};

const hiddenPivot  = {"inputType": "hidden", "type": "pivot"};
const hiddenX      = {"inputType": "hidden", "type": "x"};
const hiddenY      = {"inputType": "hidden", "type": "y"};
const hiddenWidth  = {"inputType": "hidden", "type": "width"};
const hiddenHeight = {"inputType": "hidden", "type": "height"};
const hiddenFont   = {"inputType": "hidden", "type": "font"};


const defautSettings = [
    defaultX,
    defaultY,
    defaultFontSize,
    defaultFontFamily,
    defaultAlign,
    defaultColor,
]
