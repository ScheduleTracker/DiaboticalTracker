function init_element_round_mvp() {

    const hud_elem = new HUD_element('round_mvp',
    "",
    {
        "accs": "1",
        "ar":"1",
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "toggle","type": "accs", "text": "Top3 Weapon Accuracies"},
        {"inputType": "toggle","type": "ar", "text": "Avatar Row"},
    ]
    , "#hud_round_mvp");
    hud_elements.push(hud_elem);

}