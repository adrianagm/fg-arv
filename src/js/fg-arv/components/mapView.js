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

  define(['fg-arv/utils', 'fg-arv/google-helper', 'fg-arv/components/journeys', 'fg-arv/libs/mustache'], function(utils, googleHelper, journeys, Mustache) {
    var _routes = [],
      routeSelected = [],
      infowindows = [],
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
                component.selectInfowindow(route);
                break;
              }
            }
          },
          focusOnRoute: function(route) {
            for (var i in _routes) {
              var path = _routes[i].overview_path;
              if (JSON.stringify(path) === JSON.stringify(route.overview_path)) {
                component.drawSelectedRoute(route, false);
                //component.focusOnInfowindow(route);
                break;
              }
            }
          },
          leaveRoute: function() {
            for (var step = 0; step < routeFocus.length; step++) {
              routeFocus[step].setMap(null);
            }
            routeFocus = [];
            component.leaveInfowindow();
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
          },

          selectInfowindow: function(route) {
            for (var i in _routes) {
              var path = _routes[i].overview_path;
              if (JSON.stringify(path) === JSON.stringify(route.overview_path)) {
                _routes[i].selected = true;
                component.openInfowindow(routes[i], i, config, true);

              } else {
                _routes[i].selected = false;
                component.openInfowindow(routes[i], i, config);
              }
            }
          },
          focusOnInfowindow: function(route) {
            for (var i in _routes) {
              var path = _routes[i].overview_path;
              if (JSON.stringify(path) === JSON.stringify(route.overview_path)) {
                if (!_routes[i].selected) {
                  console.log('focus');
                  component.openInfowindow(routes[i], i, config, false, true);
                  break;
                }
              }
            }
          },

          leaveInfowindow: function() {
            for (var i in _routes) {
              if (!routes[i].selected) {
                component.openInfowindow(routes[i], i, config, false, false);
              }
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
              if (index == _routes.length - 1) {
                infowindowlisteners(infowindows[index]);
              }


            }
            var templateRendered = Mustache.render(createInfoWindowTemplate(index), data);
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

    function createInfoWindowTemplate(index) {
      return "<div id='infowindow-" + index + "' class='infowindow {{#selected}}selected{{/selected}} {{#focused}}focused{{/focused}}' >" +
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
        iwOuter.mouseenter(
          function() {
            var iw = this.firstChild.firstChild.firstChild;
            var index = iw.id.split('-')[1];
            journeys.focusOnRoutePanel(routes[index]);


          }
        );
        iwOuter.mouseleave(
          function() {
            var iw = this.firstChild.firstChild.firstChild;
            var index = iw.id.split('-')[1];
            journeys.leaveRoutePanel(routes[index]);

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
