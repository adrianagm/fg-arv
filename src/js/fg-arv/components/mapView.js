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
    /** START - ONLY FOR TESTING SPRINT 1 **/
    var routeSelected;
    /** END - ONLY FOR TESTING SPRINT 1 **/
    var module = {
      createComponent: function(config) {
        /** START - ONLY FOR TESTING SPRINT 1 **/
        if (routeSelected) {
          routeSelected.setMap(null);
        }
        /** END - ONLY FOR TESTING SPRINT 1 **/
        module.drawRoute(config);
      },
      drawRoute: function(config) {
        var path = config.route.overview_path;
        var steps = config.route.legs[0].steps;
        for (var s = 0; s < steps.length; s++) {
          var step = new google.maps.Polyline({
            map: config.map,
            path: steps[s].path,
            /** START - ONLY FOR TESTING SPRINT 1 **/
            globalPath: path
              /** END - ONLY FOR TESTING SPRINT 1 **/
          });
          step.setOptions(STYLES[steps[s].travel_mode]);
          if (steps[s].transit) {
            if (steps[s].transit.line.color) {
              step.setOptions({
                strokeColor: steps[s].transit.line.color
              });
            }
          }

          /** START - ONLY FOR TESTING SPRINT 1 **/
          google.maps.event.addListener(step, 'click', function(h) {
            if (routeSelected) {
              routeSelected.setMap(null);
            }
            var optionsLine = {
              strokeColor: 'red',
              strokeOpacity: 1.0,
              strokeWeight: 7,
              editable: false,
              geodesic: true,
              zIndex: 1000
            };
            routeSelected = new google.maps.Polyline({
              map: config.map,
              path: step.globalPath
            });
            routeSelected.setOptions(optionsLine);
          });

          /** END - ONLY FOR TESTING SPRINT 1 **/
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