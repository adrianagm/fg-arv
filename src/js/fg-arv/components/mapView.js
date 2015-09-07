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

  define(['fg-arv/utils', 'fg-arv/google-helper', 'fg-arv/components/journeys'], function(utils, googleHelper, journeys) {
    var _routes = [],
      routeSelected = [],
      routeFocus = [],
      routes,
      map;

    var module = {
      createComponent: function(config) {
        var component;
        map = config.map;
        routes = config.routes;

        component = {
          init: function(routes) {
            for (var i in routes) {
              component.drawSimpleRoute(routes[i]);
            }
          },
          drawSimpleRoute: function(route) {
            var path = route.overview_path;
            var steps = route.legs[0].steps;
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
              var clickLine = new google.maps.Polyline({
                map: config.map,
                path: steps[s].path
              });
              clickLine.setOptions({
                strokeOpacity: 0.01,
                strokeWeight: 15,
                zIndex: 1000
              });
              google.maps.event.addListener(clickLine, 'click', function(h) {
                journeys.clickOnRoutePanel(route);
              });
              google.maps.event.addListener(clickLine, 'mouseover', function(h) {
                journeys.focusOnRoutePanel(route);
              });
              google.maps.event.addListener(clickLine, 'mouseout', function(h) {
                journeys.leaveRoutePanel(route);
              });
            }
            component.fitBounds(route.bounds);
            _routes.push(route);

          },
          drawSelectedRoute: function(route, selected) {
            var path = route.overview_path;
            var steps = route.legs[0].steps;
            for (var s = 0; s < steps.length; s++) {
              //Selected line bigger than focus line
              var weight = selected ? 6 : 4;
              var step = new google.maps.Polyline({
                map: map,
                path: steps[s].path
              });
              step.setOptions(STYLES[steps[s].travel_mode]);
              step.setOptions({
                strokeOpacity: 1.0,
                strokeWeight: weight,
                editable: false,
                geodesic: true,
                zIndex: 999
              });
              if (steps[s].transit) {
                if (steps[s].transit.line.color) {
                  step.setOptions({
                    strokeColor: steps[s].transit.line.color,
                  });
                }
              }
              selected ? routeSelected.push(step) : routeFocus.push(step);
            }
          },
          deleteSelectedRoute: function() {
            for (var step = 0; step < routeSelected.length; step++) {
              routeSelected[step].setMap(null);
            }
            routeSelected = [];
          },
          deleteSimpleRoute: function(route) {
            for (var i in _routes) {
              if (_routes[i] === route) {
                _routes[i].setMap(null);
                _routes.splice(i, 1);
              }
            }
          },
          selectRoute: function(route) {
            if (routeSelected) {
              component.deleteSelectedRoute();
            }
            for (var i in _routes) {
              var path = _routes[i].overview_path;
              if (JSON.stringify(path) === JSON.stringify(route.overview_path)) {
                //Draw
                component.drawSelectedRoute(route, true);
                //Bound
                component.fitBounds(route.bounds);
                break;
              }
            }
          },
          focusOnRoute: function(route) {
            for (var i in _routes) {
              var path = _routes[i].overview_path;
              if (JSON.stringify(path) === JSON.stringify(route.overview_path)) {
                component.drawSelectedRoute(route, false);
                break;
              }
            }
          },
          leaveRoute: function() {
            for (var step = 0; step < routeFocus.length; step++) {
              routeFocus[step].setMap(null);
            }
            routeFocus = [];
          },
          clearRoutes: function() {
            if (routeSelected) {
              component.deleteSelectedRoute();
            }
            for (var i in _routes) {
              component.deleteSimpleRoute(_routes[i]);
            }
          },
          fitBounds: function(bounds) {
            map.fitBounds(bounds);
            //Move map center 200 pixels right
            map.panBy(-200, 0);
          }
        };
        component.init(routes);
        return component;
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