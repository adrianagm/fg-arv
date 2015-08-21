/**
 * Module with several utility google functions.
 */
(function() {

  "use strict";

  var TRAVELMODE = {
    transit: google.maps.TravelMode.TRANSIT,
    driving: google.maps.TravelMode.DRIVING
  };
  var OK = google.maps.DirectionsStatus.OK;

  define(function() {
    var module = {
      //------------------------------------------------------------------------------------------------------------------------------
      /**
       * Returns a journey from Google directions API.
       * @param {string} from The origin address to calculate the journey.
       * @param {string} to The destination address to calculate the journey.
       * @param {object} options Extra parameters to calculate the journey.
       * @returns The promise to handler the result.
       */
      getJourney: function(from, to, options) {
        var deferredObject = jQuery.Deferred();
        var directionsService = new google.maps.DirectionsService();
        // Defaults parameters
        var directionsRequest = {
          origin: null,
          destination: null,
          travelMode: null
        };
        if (!!from && !!to) {
          directionsRequest.origin = from;
          directionsRequest.destination = to;
          directionsRequest.travelMode = TRAVELMODE.transit;
          directionsRequest.provideRouteAlternatives = true;
          directionsRequest.region = 'uk';
          directionsRequest.unitSystem = google.maps.UnitSystem.IMPERIAL;
        }
        // Optional parameters
        if (options) {
          var transitOptions = {};

          if (options.departureTime) {
            transitOptions.departureTime = options.departureTime;
          }
          if (options.modes) {
            transitOptions.modes = options.modes;
          }
          if (options.routingPreference) {
            transitOptions.routingPreference = options.routingPreference;
          }
          directionsRequest.transitOptions = transitOptions;
        }
        //Transit mode
        directionsService.route(directionsRequest, function(resultTransit, statusTransit) {
          var routes = [];
          if (statusTransit == OK) {
            routes = resultTransit.routes;
            //Driving mode
            directionsRequest.travelMode = TRAVELMODE.driving;
            directionsRequest.transitOptions = {};
            directionsService.route(directionsRequest, function(resultDriving, statusDriving) {
              if (statusDriving == OK) {
                deferredObject.resolve(routes.concat(resultDriving.routes));
              } else {
                deferredObject.reject(statusDriving);
              }
            });
          } else {
            deferredObject.reject(statusTransit);
          }
        });
        return deferredObject.promise();
      }
    };
    return module;
  });
})();
