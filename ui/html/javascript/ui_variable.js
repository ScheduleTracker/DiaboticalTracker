class VariableHandler {
    constructor() {
        this.updates = {};
    }

    addResponseHandler(type, variable, callback) {
        let key = type+"-"+variable;
        if (!(key in this.updates)) {
            this.updates[key] = [];
        }
        this.updates[key] = {
            "ts": Date.now(),
            "cb": callback
        };
    }

    handleResponse(type, variable, value) {
        let now = Date.now();
        let key = type+"-"+variable;
        if (key in this.updates) {
            let callback = this.updates[key];
            delete this.updates[key];

            if ((now - callback.ts) > 1000) return; 
            callback.cb(variable, value);            
        }
    }
}