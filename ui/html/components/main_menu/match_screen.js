function load_match(origin, match_id) {
    console.log("origin:", origin, "load match:", match_id);

    api_request(global_stats_api, "GET", "/match/"+match_id, {}, function(data) {
        console.log("match:",_dump(data.match));
    });
}