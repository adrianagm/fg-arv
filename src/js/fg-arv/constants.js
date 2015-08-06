/**
 * This module holds project constants.
 */
(function() {

  "use strict";

  var CONSTANTS = {
    /**
     * Events constanst.
     * @readonly
     * @enum {number}
     */
    events: {
      formModeChanged: 'form-mode-changed',
      fromToExchange: 'from-to-exchange',
      dateChanged: 'date-changed',
      /**
       * This event should be used when an element on the map is clicked and the location control value should be changed.
       * It's neccesary that you send a payload like this:
       * {
       *  coordinates: {
       *    lat: {number},
       *    lng: {number}
       *  }, name: {string}
       * }
       */
      locationSelected: 'location-selected',
      /**
       * This event should be used when a location control value is changed.
       * It's neccesary that you send a payload like this:
       * {
       *  changedLocation: {
       *    location_control_object
       *  }
       * }
       */
      locationChanged: 'location-changed',
      /**
       * This event should be used when new markers are shown and the location markers should be redraw.
       
       */
      addNewMarkers: 'add-markers'
    }
  };

  define([], function() {

    return CONSTANTS;

  });

})();