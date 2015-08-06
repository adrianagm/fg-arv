/**
 * This module is in charge of controlling switch visual components.
 */
(function() {

  "use strict";


  var ID = 0;
  var STYLES = {
    WALKING: {
      strokeColor: '#009afd',
      strokeOpacity: 0,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#009afd',
          fillOpacity: 1,
          strokeOpacity: 1,
          scale: 2
        },
        offset: '0',
        repeat: '10px'
      }],
    },
    TRANSIT: {
      strokeColor: '#C00'
    },
    DRIVING: {
      strokeColor: '#808080'
    }
  };

  define(['fg-arv/utils', 'fg-arv/google-helper'], function(utils, googleHelper) {
    var route = [];
    var module = {
      createComponent: function(config) {
        module.drawRoute(config);
      },
      drawRoute: function(config) {
        var path = config.route.overview_path;
        var steps = config.route.legs[0].steps;
        for (var s = 0; s < steps.length; s++) {
          var step = new google.maps.Polyline({
            map: config.map,
            path: steps[s].path
          });
          step.setOptions(STYLES[steps[s].travel_mode]);
          if (steps[s].transit) {
            if (steps[s].transit.line.color) {
              step.setOptions({
                strokeColor: steps[s].transit.line.color
              });
            }
          }

          route.push(step);
        }
        var bounds = config.route.bounds;
        config.map.fitBounds(bounds);
      },
      deleteRoute: function() {
        for (var step = 0; step < route.length; step++) {
          route[step].setMap(null);
        }
        route = [];
      }

    };


    return module;


    //*********************************************************

    function createDomID() {
      var i = ++ID;
      return "fg-arv-map-view-journey-" + i;
    }

  });

})();