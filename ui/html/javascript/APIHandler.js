/* apiHandler singleton */
function apiHandler() {
    class APIHandler {
        constructor(api_url, auth_required) {
            this.api_url = api_url;
            this.token = window.DEV_API_TOKEN || undefined;
            this.token_time = window.DEV_API_TOKEN_TIME || 0;
            this.auth_required = false;

            if (auth_required) this.auth_required = auth_required;

            if (this.api_url[this.api_url.length - 1] != '/') {
                this.api_url + '/';
            }
        }

        updateToken(token) {
            this.token = token;
            this.token_time = performance.now();
        }

        getToken() {
            return this.token;
        }

        get(target, params, callback) {

            if (target.startsWith('/')) {
                target = target.substr(1);
            }

            let path = this.api_url + target;

            if (params && Object.keys(params).length) {
                path += "?";

                for (let param in params) {
                    if (!path.endsWith("?") && !path.endsWith("&")) path += "&";
                    path += param + "=" + params[param];
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

            xhr.onload = function () {
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
                    let data = {};
                    try {
                        data = JSON.parse(xhr.response);
                    } catch (err) {
                        callback(500, {});
                    }

                    if (data && "statusCode" in data && data["statusCode"] !== 200) {
                        callback(data["statusCode"], {});
                    } else {
                        callback(200, data);
                    }
                }
            };
        }

        post(target, params, callback) {

            if (target.startsWith('/')) {
                target = target.substr(1);
            }

            let path = this.api_url + target;

            let xhr = new XMLHttpRequest();

            xhr.open("POST", path);
            if (this.auth_required) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
            }
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

            //console.log("ajax request: ",path);
            //console.log("ajax req token:", this.token);

            xhr.onload = function () {
               /*
                console.log("path: ",path);
                console.log("response: ",xhr.response, xhr.responseText);
                console.log("status: ",xhr.status);
               */
                if (xhr.status != 200) {
                    callback(xhr.status, {});
                } else {

                    try {
                        let data = JSON.parse(xhr.response);
                        if (data && "statusCode" in data && data["statusCode"] !== 200) {
                            callback(data["statusCode"], {});
                        } else {
                            callback(200, data);
                        }
                    } catch (err) {
                        console.error(err);
                        callback(500, {});
                    }
                }
            };

            if (params) xhr.send(JSON.stringify(params));
            else xhr.send();
        }
    }

    if (!this._apiHandler) {
        this._apiHandler = new APIHandler(window.DEV_API_URL || "https://www.diabotical.com/api/v0/", true);
    }

    return this._apiHandler;
}


function api_request(type, target, params, callback) {
    let now = performance.now();
    let token_age = (now - apiHandler().token_time) / 1000;

    /* Refresh token when it is older than 23h or request a new one if */
    /* it does not exist */
    if (apiHandler().auth_required && (token_age > 82800000 || apiHandler().token === undefined)) {
        send_string(CLIENT_COMMAND_GET_API_TOKEN, "", "apitoken", function (token) {
            apiHandler().updateToken(token);
            send_api_request(type, target, params, callback);
        });
    } else {
        send_api_request(type, target, params, callback);
    }
}

function send_api_request(type, target, params, callback, secondtry) {
    if (type == "GET") apiHandler().get(target, params, api_request_callback);
    if (type == "POST") apiHandler().post(target, params, api_request_callback);

    function api_request_callback(status, data) {

        if (status == 200) {
            /*
            // For testing on_delay
            setTimeout(function() {
                callback(data);    
            },3000);
            */
            if (typeof callback === "function") callback(data);

        } else if (status == 404) {

            console.log("API Request 404 not found", target, status);
            if (typeof callback === "function") callback(null);

        } else if (status == 401) {

            if (apiHandler().auth_required == false || (secondtry !== undefined && secondtry)) {
                // If this request doesn't require an auth token OR has already failed twice then stop trying again
                engine.call("echo_error", "API_REQUEST_ERROR");
                console.log("API Request failed, Auth Error", target, status);
                if (typeof callback === "function") callback(null);
            } else {
                // Token seems to be invalid, request new one and try again
                send_string(CLIENT_COMMAND_GET_API_TOKEN, "", "apitoken", function (token) {
                    apiHandler().updateToken(token);
                    send_api_request("GET", target, params, callback, true);
                });
            }

        } else if (status == 500) {

            // returned data couldn't be parsed, don't bother trying again
            engine.call("echo_error", "API_REQUEST_ERROR");
            console.log("API Request failed, Error 500");
            if (typeof callback === "function") callback(null);

        } else if (status == 408) {

            // request timed out
            engine.call("echo_error", "API_REQUEST_ERROR");
            console.log("API Request failed, Error 408");
            if (typeof callback === "function") callback(null);

        } else {

            // End point doesn't exist
            engine.call("echo_error", "API_REQUEST_ERROR");
            console.log("API Request failed, Error 4");
            if (typeof callback === "function") callback(null);

        }
    }
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
        api_request("GET", r.path, r.params, function (data) {
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
    let wait = undefined;
    let req_started = Date.now();
    if (recv_count == req_count) {
        on_success(res);
    } else {
        wait = setInterval(checkResult, 25);
    }

    function checkResult() {
        if (global_menu_page != page) {
            // User has switched away from the page
            wait = clearInterval(wait);
            on_pagechange();
            return;
        }

        // If the request is taking more than 1 second, call on_delay once
        if (!delay && ((Date.now() - req_started) / 1000) > 1) {
            delay = true;
            on_delay();
        }

        if (recv_count == req_count) {
            wait = clearInterval(wait);
            on_success(res);
        }

        if (((Date.now() - req_started) / 1000) > 5) {
            wait = clearInterval(wait);
            on_timeout();
        }
    }
}
