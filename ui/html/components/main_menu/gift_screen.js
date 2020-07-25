
function load_gift(shop_item) {
    
    let friends = [];
    for (let user_id in global_friends_list_map) {
        friends.push({ "user_id": user_id, "name": global_friends_list_map[user_id] });
    }

    friends.sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0));

    // list list of friends
    // text input field for user message
    // show the selected item
}