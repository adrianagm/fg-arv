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

  define(['fg-arv/utils', 'fg-arv/google-helper', 'fg-arv/components/journeys', 'fg-arv/libs/mustache'], function(utils, googleHelper, journeys, Mustache) {
    var _routes = [],
      routeSelected = [],
      infowindows = [],
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
                _routes[i].selected = true;
                component.openInfowindow(route, i, config, true);

              } else {
                _routes[i].setMap(map);
                component.openInfowindow(routes[i], i, config);
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
                component.openInfowindow(route, i, config, false, true);
              } else {
                _routes[i].setOptions({
                  strokeColor: '#939393',
                  zIndex: 500
                });
                if (!_routes[i].selected) {
                  component.openInfowindow(routes[i], i, config, false, false);
                }
              }
              if (_routes[i].selected) {
                component.openInfowindow(routes[i], i, config, true, false);
              }

            }
          },
          leaveRoute: function() {
            for (var i in _routes) {
              _routes[i].setOptions({
                strokeColor: '#939393',
                zIndex: 500
              });
              if (!_routes[i].selected) {
                component.openInfowindow(routes[i], i, config, false, false);
              } else {
                component.openInfowindow(routes[i], i, config, true, false);
              }
            }

          },
          clearRoutes: function() {
            if (routeSelected) {
              component.deleteSelectedRoute();
            }
            for (var i in _routes) {
              component.deleteSimpleRoute(_routes[i]);
            }
          },

          openInfowindow: function(route, index, conf, selected, focused) {
            var data = {
              index: parseInt(index) + 1,
              duration: route.legs[0].duration.text,
              selected: selected,
              focused: focused,
              color: conf.colors[index]
            };
            if (!infowindows[index]) {
              var arr = route.overview_path;
              var middle = arr[Math.floor(arr.length / 2)];

              for (var i in infowindows) {
                if (middle.equals(infowindows[i].getPosition())) {
                  middle = arr[Math.floor(arr.length / 3)];
                }
              }

              infowindows[index] = new google.maps.InfoWindow();
              infowindows[index].setPosition(middle);
              infowindows[index].setOptions({
                pixelOffset: new google.maps.Size(0, 10)
              });

              infowindowlisteners(infowindows[index]);


            }
            var templateRendered = Mustache.render(createInfoWindowTemplate(), data);
            infowindows[index].setContent(templateRendered);
            if (selected) {
              infowindows[index].setZIndex(200);
            } else {
              infowindows[index].setZIndex(100);
            }

            infowindows[index].open(conf.map);
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

    function createInfoWindowTemplate() {
      return "<div class='infowindow {{#selected}}selected{{/selected}} {{#focused}}focused{{/focused}}' >" +
        "<div class='row row-head'>" +
        "<div class='col-xs-2 left id-route' style='border-color:{{color}}'><span>{{index}}</span></div>" +
        "<div class='col-xs-10 distance-duration right'>{{duration}}</div>" +
        "</div>" +

        "</div>";
    }

    function infowindowlisteners(infowindow) {
      //css
      google.maps.event.addListener(infowindow, 'domready', function() {

        var iwOuter = jQuery('.gm-style-iw');
        iwOuter.css({
          'background-color': 'rgba(230, 230, 230, 0.9)'
        });

        var iwBackground = iwOuter.prev();

        // Remove the background shadow DIV
        iwBackground.children(':nth-child(2)').css({
          'display': 'none'
        });

        // Remove the white background DIV
        iwBackground.children(':nth-child(4)').css({
          'display': 'none'
        });
        iwBackground.children(':nth-child(3)').find('div').children().css({
          'z-index': '1',
          'width': '10px',
          'background-color': 'rgba(230, 230, 230, 0.9)',

        });

        var arrows = iwBackground.children(':nth-child(3)').find('div').children();
        for (var i = 0; i < arrows.length; i++) {
          if (arrows[i].style.transform === 'skewX(22.6deg)') {
            arrows[i].style.transform = 'skewX(35.6deg)';
            arrows[i].style['border-left'] = '1px solid rgba(72, 181, 233, 0.6)';
          } else if (arrows[i].style.transform === 'skewX(-22.6deg)') {
            arrows[i].style.transform = 'skewX(-35.6deg)';
            arrows[i].style['border-right'] = '1px solid rgba(72, 181, 233, 0.6)';
          }
        }
        var iwOuterselected = jQuery('.infowindow.selected').parent().parent().parent();
        if (iwOuterselected) {
          iwOuterselected.css({
            'background-color': 'rgba(255, 255, 255, 1)'
          });
          var iwBackgroundSelected = iwOuterselected.prev();
          iwBackgroundSelected.children(':nth-child(3)').find('div').children().css({
            'background-color': 'rgba(255, 255, 255, 1)',

          });
        }

        var iwOuterfocused = jQuery('.infowindow.focused').parent().parent().parent();
        if (iwOuterfocused) {
          iwOuterfocused.css({
            'background-color': 'rgba(210, 210, 210, 1)'
          });
          var iwBackgroundfocused = iwOuterfocused.prev();
          iwBackgroundfocused.children(':nth-child(3)').find('div').children().css({
            'background-color': 'rgba(210, 210, 210, 1)',

          });
        }

      });


    }

  });

})();
