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


  define(['fg-arv/utils', 'fg-arv/google-helper', 'fg-arv/components/journeys', 'fg-arv/libs/mustache', 'fg-arv/libs/infobubble'], function(utils, googleHelper, journeys, Mustache) {
    var _routes = [],
      routeSelected = [],
      infowindows = [],
      routeFocus = [],
      routes,
      infowindowBubble,
      map;

    var module = {
      createComponent: function(config) {
        var component;
        map = config.map;
        routes = config.routes;


        component = {
          init: function(routes) {
            if (_routes.length > 0) {
              component.clearRoutes();
            }
            for (var i in routes) {
              component.drawSimpleRoute(routes[i]);
              component.fitBounds(routes[i].bounds);

            }
          },
          drawSimpleRoute: function(route) {
            var simpleRoute = [];
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

              simpleRoute.push(step);
            }
            _routes.push(simpleRoute);

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
                //add stops
                if (selected) {
                  if (steps[s - 1] && steps[s - 1].transit) {
                    routeSelected.push(component.addStop(steps[s].transit, 'stop', steps[s - 1].transit));
                  } else {
                    routeSelected.push(component.addStop(steps[s].transit, 'departure'));
                  }
                  if (!steps[s + 1] || !steps[s + 1].transit) {
                    routeSelected.push(component.addStop(steps[s].transit, 'arrival'));
                  }

                }
              }
              selected ? routeSelected.push(step) : routeFocus.push(step);
            }
          },
          addStop: function(stop, type, beforeStop) {
            var stopMarker = new google.maps.Marker({
              map: map,
              position: type == 'arrival' ? stop.arrival_stop.location : stop.departure_stop.location,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                strokeColor: '#000',
                fillColor: '#fff',
                fillOpacity: 1,
                strokeWeight: 2.0,
                zIndex: 1000,
                scale: 5
              },
              title: type == 'arrival' ? stop.arrival_stop.name : stop.departure_stop.name

            });
            var stopInfo = {
              stopName: type == 'arrival' ? stop.arrival_stop.name : stop.departure_stop.name,
              departureTime: type == 'arrival' ? false : stop.departure_time.text,
              arrivalTime: type == 'arrival' ? stop.arrival_time.text : type == 'departure' ? false : beforeStop.arrival_time.text
            };
            component.addStopListeners(stopMarker, stop, stopInfo);
            return stopMarker;
          },
          deleteSelectedRoute: function() {
            for (var step = 0; step < routeSelected.length; step++) {
              routeSelected[step].setMap(null);
            }
            routeSelected = [];
            if (infowindowBubble && infowindowBubble.isOpen) {
              infowindowBubble.close();
            }
          },
          deleteSimpleRoute: function(route) {
            for (var i in _routes) {
              if (_routes[i] === route) {
                for (var step = 0; step < _routes[i].length; step++) {
                  _routes[i][step].setMap(null);
                }
                //_routes.splice(i, 1);
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
            //component.leaveInfowindow();
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
          },

          addStopListeners: function(stopMarker, stop, info) {
            component.focusLeaveStop(stopMarker, stop);
            component.clickOnStop(stopMarker, stop, info);
          },

          focusLeaveStop: function(stopMarker, stop) {
            google.maps.event.addListener(stopMarker, 'mouseover', function() {
              var icon = stopMarker.getIcon();
              icon.scale = 6;
              stopMarker.setIcon(icon);
            });
            google.maps.event.addListener(stopMarker, 'mouseout', function() {
              var icon = stopMarker.getIcon();
              icon.scale = 5;
              stopMarker.setIcon(icon);
            });
          },
          clickOnStop: function(stopMarker, stop, info) {
            stopMarker.iw = component.createIW(stopMarker, stop, info);

            google.maps.event.addListener(stopMarker, 'click', function() {
              if (infowindowBubble) {
                infowindowBubble.close();
              }
              infowindowBubble = stopMarker.iw;
              infowindowBubble.open(map, stopMarker);
            });

          },

          createIW: function(stopMarker, stop, info) {
            var iw = new InfoBubble();
            var stopInfo = {
              stopName: info.stopName,
              departureTime: info.departureTime ? info.departureTime : false,
              arrivalTime: info.arrivalTime ? info.arrivalTime : false,
              line: stop.line,
              headsign: stop.headsign,
              num_stops: stop.num_stops,
              agency: stop.line.agencies ? stop.line.agencies[0].name : false,
              vehicle: stop.line.vehicle ? stop.line.vehicle.name : false

            };

            var tabs = [{
              label: 'Stop info',
              template: Mustache.render(createIWTemplate(), stopInfo)

            }, {
              label: 'Street View',
              template: createSVTemplate()

            }];
            for (var tab in tabs) {
              iw.addTab(tabs[tab].label, tabs[tab].template);
            }

            openStreetTabListener(stopMarker, iw, config.widgetElement);
            return iw;
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

    function createIWTemplate() {
      return "<div class='balloon data-tab content'>" +
        "<h5>{{stopName}}</h5>" +
        "<table>" +
        "{{#arrivalTime}}<tr class='data-item'><td>Arrival: </td><td>{{arrivalTime}}</td></tr>{{/arrivalTime}}" +
        "{{#departureTime}}<tr class='data-item'><td>Departure: </td><td>{{departureTime}}</td></tr>{{/departureTime}}" +
        "{{#departureTime}}<tr class='data-item'><td>Headsign: </td><td>{{headsign}}</td></tr>{{/departureTime}}" +
        "{{#departureTime}}<tr class='data-item'><td>Line: </td><td><img class='icon' src={{line.vehicle.icon}} {{#vehicle}}title='{{vehicle}}'{{/vehicle}}> <span class='line' style='background-color:{{line.color}};color:{{line.text_color}}' {{#agency}}title='{{agency}}'{{/agency}}>{{line.short_name}} </span><span> ({{num_stops}} stops)</span></td></tr>{{/departureTime}}" +
        "</table></div>";

    }

    function createSVTemplate() {
      return '<div class="balloon street-tab content"><div class="pano"></div><div class="map-pano"></div><span class="zmdi zmdi-fullscreen zmdi-hc-2x zmdi-hc-border pull-left fullscreen" title="Fullscreen"></span></span></div>';

    }

    function openStreetTabListener(marker, iw, widget) {
      google.maps.event.addDomListener(iw, 'content_changed', function() {
        google.maps.event.addDomListener(iw, 'domready', function() {
          if (iw.content_.querySelectorAll('.pano')[0]) {
            initializeStreetView(marker, widget);
          }

        });

      });
    }

    function initializeStreetView(marker, widget) {
      var mapPano = marker.iw.content_.querySelectorAll('.map-pano')[0];
      var pano = marker.iw.content_.querySelectorAll('.pano')[0];
      var heading = 90;
      var pitch = 5;
      var panoramaOptions = {
        position: marker.position,
        pov: {
          heading: heading,
          pitch: pitch
        },
        panControl: false
      };

      var sv = new google.maps.StreetViewService();
      sv.getPanoramaByLocation(marker.position, 50, processSVData);

      var overlay = document.createElement('div');
      var fullscreen = marker.iw.content_.querySelectorAll('.fullscreen')[0];
      jQuery(fullscreen).click(function() {

        overlay.className = 'overlay-panel';
        var exit = document.createElement('span');
        exit.className = 'zmdi zmdi-fullscreen-exit zmdi-hc-2x zmdi-hc-border pull-left fullscreen-exit';
        exit.title = 'Exit Fullscreen';
        jQuery(exit).click(function() {
          overlay.parentNode.removeChild(overlay);
        });
        overlay.appendChild(exit);
        widget[0].appendChild(overlay);
        sv.getPanoramaByLocation(marker.position, 50, processSVFullscreennData);
      });

      function processSVData(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var panorama = new google.maps.StreetViewPanorama(pano, panoramaOptions);
          var map = new google.maps.Map(mapPano);
          map.setStreetView(panorama);
        } else {
          pano.innerHTML = 'Street View not available in this position';
          fullscreen.display = 'none';
        }
      }

      function processSVFullscreennData(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var panorama = new google.maps.StreetViewPanorama(overlay, panoramaOptions);
          var map = new google.maps.Map(mapPano);
          map.setStreetView(panorama);
        }
      }
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
