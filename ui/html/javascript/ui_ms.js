class MS {
    constructor() {
        this.messages = {};
    }

    addResponseHandler(expected_message, callback) {
        if (!(expected_message in this.messages)) {
            this.messages[expected_message] = [];
        }
        this.messages[expected_message].push({
            "ts": Date.now(),
            "cb": callback
        });
    }

    handleResponse(type, data) {
        let now = Date.now();
        if (type in this.messages) {
            let callbacks = this.messages[type];
            delete this.messages[type];

            for (let obj of callbacks) {
                if ((now - obj.ts) > 5000) continue; 
                obj.cb(data);
            }
        }
    }
}