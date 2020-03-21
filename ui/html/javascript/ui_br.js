// Old stuff from the BR test, for reference only

/*

    //bind_event('set_current_inventory_slot', function (slot) {
    //    engine.call("echo", "set slot " + slot);
    //    $("#inventory_container > div").removeClass("slot_active");
    //    $("#inv_slot_" + slot).addClass("slot_active");
    //});


bind_event('set_inventory_slots', function (slots) {
      var code = "";
      for (var i = 0; i < slots; i++) {
          code +=
              "<div class='inv_slot_container' id='inv_slot_container_" + i + "' data-slot='" + i + "'>" +
              //"<div class='inv_slot' id='inv_slot_" + i + "' data-slot='" + i + "'>" +
              //"</div>"
              "</div>";
      }
      var element = _id("inventory_container");
      if (element) element.innerHTML = code;
      _register_inventory_slot_events();
  });

function _register_inventory_slot_events() {
    $(".inv_slot").each(function (i) {
        var slot = $(this).data("slot");
        if (slot !== undefined) {
            $(this).draggable({
                start: function (event, ui) {
                    engine.call('ui_sound', 'ui_drag1');
                    ui.helper.data('dropped', false);
                },
                stop: function (event, ui) {
                    if (!ui.helper.data('dropped')) {
                        engine.call("drop_inventory_slot", -1, -1);
                    }
                }
            });
        }
    });
    $(".inv_slot_container").each(function (i) {
        var slot = $(this).data("slot");
        if (slot !== undefined) {
            $(this).droppable(
            {
                classes: {
                    "ui-droppable-hover": "slot_droppable_hover",
                    "ui-droppable-active": "slot_droppable_active"
                },
                drop: function (event, ui) {
                    ui.helper.data('dropped', true);
                    engine.call("drop_inventory_slot", $(this).data("slot"), ui.draggable.data("slot"));
                    engine.call('ui_sound', 'ui_drop1');
                    //_register_inventory_slot_events(); //TEMP
                }
            });
        }
    });

}

function set_active_inventory_slot(inventory_slot) {
    if (inventory_slot != -1) {
        $("#inventory_container > div > div").removeClass("slot_active");
        $("#inv_slot_" + inventory_slot).addClass("slot_active");
    }
}





    bind_event('show_inventory', function (enabled) {
        if (enabled) {
            //_id("crosshairs").style.opacity = "0";  TODO GAMEFACE
            anim_show(_id("inventory_background"));
        } else {
           // _id("crosshairs").style.opacity = "1";  TODO GAMEFACE
            anim_hide(_id("inventory_background"));
        }
    });

    
    bind_event('set_active_inventory_slot', function (inventory_slot) {
        set_active_inventory_slot(inventory_slot);
    });



*/


// INVENTORY CSS
/*
#inventory_background {
    display: none;
    position: absolute;
    width: 50%;
    height: 50%;
    background-image: url('../images/inventory_bg.png');
    background-size: 100% 100%;
    right: 0;
    bottom: 0;
}

#inventory_container {
    right: 7vh;
    bottom: 7vh;
    position: absolute;
}

    #inventory_container > div {
        border: 2px solid rgba(255, 255, 255, 0.3);
        margin-left: 1vh;
        background-color: transparent;
        text-align: center;
        font-size: 4vh;
        vertical-align: top;
    }

        #inventory_container > div, #inventory_container > div > div {
            width: 8vh;
            height: 8vh;
        }

.slot_used {
    border: 2px solid rgba(255, 255, 255, 1.0) !important;
    background-color: rgba(255, 255, 255, 0.3) !important;
}

.slot_active {
    border: 6px solid rgba(255, 255, 255, 1.0) !important;
    background-color: rgba(255, 255, 255, 0.3) !important;
    color: red !important;
}
*/