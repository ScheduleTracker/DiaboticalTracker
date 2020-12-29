const RemoteResources = new (function() {
    const global_download_remote_resources = {
        downloaded: new Set(),
        error: new Set(),
        pending: new Set(),
        pendingHandlers: {},
    };

    const global_upload_remote_resources = {
        uploaded: new Set(),
        error: new Set(),
        pending: new Set(),
        pendingHandlers: {},
    }

    function download_remote_resource(key, size, timestamp, folder, handler) {
        global_download_remote_resources.error.delete(key);
        global_download_remote_resources.downloaded.delete(key);
        global_download_remote_resources.pending.add(key);
        global_download_remote_resources.pendingHandlers[key] = handler;

        engine.call("download_remote_resource",
            key,
            size,
            timestamp,
            folder);
    }

    this.load_remote_map = function(map, onSuccess, onError) {
        api_request(
            "GET",
            `/content/maps/${map}`,
            null,
            function (data) {
                if (!data) {
                    engine.call("echo", "Cannot load map");
                    return;
                }
                const pending_resources = new Set(data.files.map(e => e.key));
                const map_file = data.files.map(e => e.key).find(file => file.match(/\.rbe$/i));

                if (data.files.length === 0) {
                    onSuccess && onSuccess(map_file);
                } else {
                    data.files.forEach(entry => {
                        const timestamp = new Date(entry.last_modified).getTime();

                        download_remote_resource(
                            entry.key,
                            entry.size,
                            timestamp,
                            map,
                            (success) => {
                                if (!success) {
                                    onError && onError();
                                    return;
                                }
                                pending_resources.delete(entry.key);

                                if (pending_resources.size === 0) {
                                    onSuccess && onSuccess(map_file);
                                }
                            }
                        );
                    });
                }
            }
        );
    };

    function upload_remote_resource(key, handler) {
        global_upload_remote_resources.error.delete(key);
        global_upload_remote_resources.uploaded.delete(key);
        global_upload_remote_resources.pending.add(key);
        global_upload_remote_resources.pendingHandlers[key] = handler;
    }

    this.upload_remote_map = function(map, onSuccess, onError) {
        // Not found files (e.g. thumbnails) will be ignored and map upload will finish successfully    
        const assets = new Set([ `${map}.rbe`, `${map}-h.png`, `${map}-b.png`, `${map}-t.png`]);

        assets.forEach(entry => {
            // Engine reports maps state using the asset name prefixed with the map name
            const full_entry = map + "/" + entry;
            upload_remote_resource(full_entry, (success) => {
                if (!success) {
                    onError && onError(entry);
                    return;
                }
                assets.delete(entry);
                if (assets.size === 0) {
                    onSuccess && onSuccess(map);
                }
            })
        })

        engine.call("publish_community_map", map, JSON.stringify(Array.from(assets)));
    };

    this.create_remote_map = function(id, name, modes, onDone) {
        console.log(modes);
        api_request("POST",
                    "/content/maps", 
                    { id, name, modes },
                    onDone);
    };

    this.delete_remote_map = function(id, onDone) {
        api_request(
            "POST",
            `/content/delete/maps/${id}`, 
            null,
            onDone);
    };

    this.list_remote_maps = function(onDone) {
        api_request(
            "GET",
            "/content/maps",
            null,
            onDone);
    };

    this.list_remote_maps_paginated = function(page, onDone) {
        api_request(
            "GET",
            `/content/maps?page=${page}`,
            null,
            onDone);
    };

    this.update_remote_map = function(id, name, modes, onDone) {
        api_request(
            "POST",
            `/content/update/maps/${id}`, 
            { name, modes },
            onDone);
    };

    this.list_player_remote_maps_paginated = function(page, onDone) {
        api_request(
            "GET",
            `/content/maps?page=${page}&user_id=${global_self.user_id}`,
            null,
            onDone);
    };

    this.init_remote_resources = function() {
        /* Download event handlers */
        bind_event("download_remote_resource_success", function (key) {
            global_download_remote_resources.error.delete(key);
            global_download_remote_resources.pending.delete(key);
            global_download_remote_resources.downloaded.add(key);

            _id("fullscreen_spinner_message").innerHTML = '';

            if (key in global_download_remote_resources.pendingHandlers) {
                global_download_remote_resources.pendingHandlers[key](true);
                delete global_download_remote_resources.pendingHandlers[key];
            }
        });

        bind_event("download_remote_resource_error", function (key) {
            global_download_remote_resources.pending.delete(key);
            global_download_remote_resources.downloaded.delete(key);
            global_download_remote_resources.error.add(key);

            _id("fullscreen_spinner_message").innerHTML = '';

            if (key in global_download_remote_resources.pendingHandlers) {
                global_download_remote_resources.pendingHandlers[key](false);
                delete global_download_remote_resources.pendingHandlers[key];
            }
        });

        bind_event("download_progress", function (key, progress) {
            _id("fullscreen_spinner_message").innerHTML = `Downloading file ${key} ${Math.round(progress * 100)}%`;
        });

        /* Upload event handlers */
        bind_event("upload_remote_resource_success", function (key) {
            console.log("upload_remote_resource_success: " + key);
            global_upload_remote_resources.error.delete(key);
            global_upload_remote_resources.pending.delete(key);
            global_upload_remote_resources.uploaded.add(key);

            console.log(JSON.stringify(global_upload_remote_resources.pendingHandlers));
            if (key in global_upload_remote_resources.pendingHandlers) {
                global_upload_remote_resources.pendingHandlers[key](true);
                delete global_upload_remote_resources.pendingHandlers[key];
            }
        });

        bind_event("upload_remote_resource_error", function (key) {
            console.log("upload_remote_resource_error: " + key);
            global_upload_remote_resources.pending.delete(key);
            global_upload_remote_resources.uploaded.delete(key);
            global_upload_remote_resources.error.add(key);

            if (key in global_upload_remote_resources.pendingHandlers) {
                global_upload_remote_resources.pendingHandlers[key](false);
                delete global_upload_remote_resources.pendingHandlers[key];
            }
        });
    };
});

window.RemoteResources = RemoteResources;
