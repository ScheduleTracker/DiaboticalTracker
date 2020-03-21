function _get_status_label(tournament_status) {
    if (tournament_status == TOURNAMENT_STATE_UPCOMING) {
        return "<span class='tournament_status tournament_status_upcoming'>Upcoming</span>";
    } else if (tournament_status == TOURNAMENT_STATE_REGISTRATION_OPEN) {
        return "<span class='tournament_status tournament_status_registration_open'>Registration open</span>";
    } else if (tournament_status == TOURNAMENT_STATE_REGISTRATION_CLOSED) {
        return "<span class='tournament_status tournament_status_registration_closed'>Registration closed</span>";
    } else if (tournament_status == TOURNAMENT_STATE_STARTED) {
        return "<span class='tournament_status tournament_status_started'>Started</span>";
    } else if (tournament_status == TOURNAMENT_STATE_ENDED) {
        return "<span class='tournament_status tournament_status_ended'>Ended</span>";
    } else if (tournament_status == TOURNAMENT_STATE_CANCELED) {
        return "<span class='tournament_status tournament_status_ended'>Canceled</span>";
    } else {
        return "N/A";
    }
}

function setup_section_play() {


}
