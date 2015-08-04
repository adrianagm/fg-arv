/**
 * This module is in charge of building the main widget structure.
 */
(function() {

  "use strict";

  define(['fg-arv/utils', 'fg-arv/widget'], function(utils, widget) {

    var widgets = {}; // Widgets map

    return {
      createInteractionObject: function() {
        /**
         * The widget interaction object;
         */
        return {
          init: function(apiObject) {
            if (apiObject) { // Do only if apiObject is defined.
              var elementID = apiObject.getDOMElementID();
              if (elementID) { // Do only if a root element ID is provided.
                if (widgets.hasOwnProperty(elementID)) { // If the widget for the root element already exists.
                  widgets[elementID].reinitialise(apiObject);
                } else {
                  var widget = createWidget(apiObject);
                  if (widget) {
                    widgets[elementID] = widget;
                  }
                }
              }
            }
          },
          reset: function() {
            if (widgets) {
              jQuery.each(widgets, function(property, widget) {
                widget.close();
              });
              widgets = {};
            }
          }
        };
      }
    };

    //------------------------------------------------------------------------------------------------------------------------------
    /**
     * Creates a new fg-arv widget.
     * @param apiObject The portal API object.
     * @returns An object with the widget data.
     */
    function createWidget(apiObject) {
      widget.createWidget(apiObject);
    }

  });

})();