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
      strokeColor: '#000'
    }
  };

  define(['fg-arv/utils', 'fg-arv/google-helper', 'fg-arv/components/journeys'], function(utils, googleHelper, journeys) {
    var _routes = [],
      routeSelected = [],
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

            var _route = new google.maps.Polyline({
              map: map,
              path: path,
              strokeColor: '#939393',
              strokeOpacity: 1,
              editable: false,
              geodesic: true,
              zIndex: 500
            });

            google.maps.event.addListener(_route, 'mouseover', function(h) {
              journeys.focusOnRoutePanel(route);
            });
            google.maps.event.addListener(_route, 'mouseout', function(h) {
              journeys.leaveRoutePanel(route);
            });
            google.maps.event.addListener(_route, 'click', function(h) {
              journeys.clickOnRoutePanel(route);
            });

            var bounds = route.bounds;
            map.fitBounds(bounds);
            _routes.push(_route);
          },
          drawSelectedRoute: function(route) {
            var path = route.overview_path;
            var steps = route.legs[0].steps;
            for (var s = 0; s < steps.length; s++) {
              var step = new google.maps.Polyline({
                map: map,
                path: steps[s].path,
                /** START - ONLY FOR TESTING SPRINT 1 **/
                globalPath: path
                /** END - ONLY FOR TESTING SPRINT 1 **/
              });
              step.setOptions(STYLES[steps[s].travel_mode]);
              step.setOptions({
                strokeOpacity: 1.0,
                editable: false,
                geodesic: true,
                zIndex: 1000
              });
              if (steps[s].transit) {
                if (steps[s].transit.line.color) {
                  step.setOptions({
                    strokeColor: steps[s].transit.line.color,
                  });
                }
              }

              routeSelected.push(step);
            }
            var bounds = route.bounds;
            map.fitBounds(bounds);
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
              _routes[i].setMap(null);
              if (JSON.stringify(_routes[i].getPath().getArray()) === JSON.stringify(route.overview_path)) {
                component.drawSelectedRoute(route);
              } else {
                _routes[i].setMap(map);
              }

            }
          },
          focusOnRoute: function(route) {
            for (var i in _routes) {
              if (JSON.stringify(_routes[i].getPath().getArray()) === JSON.stringify(route.overview_path)) {
                _routes[i].setOptions({
                  strokeColor: '#616161',
                  zIndex: 900
                });
              } else {
                _routes[i].setOptions({
                  strokeColor: '#939393',
                  zIndex: 500
                });
              }

            }
          },
          leaveRoute: function() {
            for (var i in _routes) {
              _routes[i].setOptions({
                strokeColor: '#939393',
                zIndex: 500
              });
            }

          },
          clearRoutes: function() {
            if (routeSelected) {
              component.deleteSelectedRoute();
            }
            for (var i in _routes) {
              component.deleteSimpleRoute(_routes[i]);
            }
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
