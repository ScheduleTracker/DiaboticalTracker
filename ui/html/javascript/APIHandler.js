class APIHandler {
    constructor(api_url, auth_required) {
        this.api_url = api_url;
        this.token = undefined;
        this.token_time = 0;
        this.auth_required = false;
        
        if (auth_required) this.auth_required = auth_required;

        if (this.api_url[this.api_url.length-1] != '/') {
            this.api_url + '/';
        }
    }

    updateToken(token) {
        this.token = token;
        this.token_time = performance.now();
    }
    
    request(target, params, callback) {

        if (target.startsWith('/')) {
            target = target.substr(1);
        }

        let path = this.api_url + target;

        if (Object.keys(params).length) {
            path += "?";

            for (let param in params) {
                if (!path.endsWith("?") && !path.endsWith("&")) path += "&";
                path += param+"="+params[param];
            }
        }

        //console.log("ajax request: ",path);
        //console.log("ajax req token:", this.token);

        let xhr = new XMLHttpRequest();

        xhr.open('GET', path);
        if (this.auth_required) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
        }
        xhr.send();

        xhr.onload = function() {
            /*
            console.log("path: ",path);
            console.log("response: ",xhr.response);
            console.log("status: ",xhr.status);
            echo("PATH:"+path);
            echo("RESPONSE:"+xhr.response);
            echo("STATUS:"+xhr.status);
            */
            //console.log("response_header",xhr.getResponseHeader("HTTP-Status-Code"));
            if (xhr.status != 200) { // analyze HTTP status of the response
                //console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
                callback(xhr.status, {});
            } else {
                //console.log(`API Request done, got ${xhr.response.length} bytes`); // responseText is the server
                //console.log(xhr.status);
                //console.log(xhr.response);
                
                try {
                    let data = JSON.parse(xhr.response);
                    if ("statusCode" in data && data["statusCode"] !== 200) {
                        callback(data["statusCode"], {});
                    } else {
                        callback(200, data);
                    }
                } catch(err) {
                    callback(500, {});
                }
            }
        };
    }
}

function api_request(api, target, params, callback) {
    let now = performance.now();
    let token_age = (now - api.token_time) / 1000;

    // If the token is older than 23h.. request a new one
    if (api.auth_required && token_age > 82800000) {
        send_string("request-api-token", "apitoken", function(token) {
            api.updateToken(token);
            send_api_request(api, target, params, callback);
        });
    } else {
        send_api_request(api, target, params, callback);
    }
}

function send_api_request(api, target, params, callback, secondtry) {
    api.request(target, params, function(status, data) {

        if (status == 200) {
            /*
            // For testing on_delay
            setTimeout(function() {
                callback(data);    
            },3000);
            */
            callback(data);

        } else if (status == 404) {

            console.log("API Request 404 not found", target, status);
            callback(null);

        } else if (status == 401) {
    
            if (api.auth_required == false || (secondtry !== undefined && secondtry)) {
                // If this request doesn't require an auth token OR has already failed twice then stop trying again
                engine.call("echo", "API Request failed, Auth Error");
                console.log("API Request failed, Auth Error", target, status);
                callback(null);
            } else {
                // Token seems to be invalid, request new one and try again
                send_string("request-api-token", "apitoken", function(token) {
                    api.updateToken(token);
                    send_api_request(api, target, params, callback, true);
                });
            }

        } else if (status == 500) {

            // returned data couldn't be parsed, don't bother trying again
            engine.call("echo", "API Request failed, Error 500");
            console.log("API Request failed, Error 500");
            callback(null);

        } else if (status == 408) {

            // request timed out
            engine.call("echo", "API Request failed, Error 408");
            console.log("API Request failed, Error 408");
            callback(null);

        } else {
            
            // End point doesn't exist
            engine.call("echo", "API Request failed, Error 4");
            console.log("API Request failed, Error 4");
            callback(null);

        }

    });
}



function multi_req_handler(page, requests, on_success, on_delay, on_timeout, on_pagechange) {
    /*
    requests = [
        {
            "api": global_stats_api,
            "path": "/stats/leaderboard",
            "data_key_from": "key" // only copy the key from the returning data (data[key]), leave empty to return all data
            "data_key_to": "key" // key where the resulting data should go
            "params": {...}
        },
    ]
    */

    let req_count = 0;
    let recv_count = 0;

    let res = {};

    for (let r of requests) {
        req_count++;
        api_request(r.api, r.path, r.params, function(data) {
            if (data === null) {
                recv_count++;
                res[r.data_key_to] = null;
                return;
            }
            if ("data_key_from" in r && r["data_key_from"].length && r["data_key_from"] in data) {
                res[r.data_key_to] = data[r["data_key_from"]];
            } else {
                res[r.data_key_to] = data;
            }
            recv_count++;
        });
    }

    let delay = false;
    if (recv_count == req_count) {
        on_success(res);
    } else {
        let req_started = Date.now();
        let wait = setInterval(function() {
            if (global_menu_page != page) {
                // User has switched away from the page
                clearInterval(wait);
                on_pagechange();
                return;
            }

            // If the request is taking more than 1 second, show a loading spinner
            if (!delay && ((Date.now() - req_started) / 1000) > 0.5) {
                delay = true;
                on_delay();
            }

            if (recv_count == req_count) {
                clearInterval(wait);
                on_success(res);
            }

            if (((Date.now() - req_started) / 1000) > 5) {
                clearInterval(wait);
                on_timeout();
            }
        },50);
    }
}