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

  define(['fg-arv/utils', 'fg-arv/google-helper', 'fg-arv/components/journeys', 'fg-arv/libs/mustache', 'fg-arv/libs/richmarker', 'fg-arv/libs/richmarkerPosition', 'fg-arv/libs/infobubble'], function(utils, googleHelper, journeys, Mustache, RichMarker, RichMarkerPosition) {
    var _routes = [],
      routeSelected = [],
      routeMarkers = [],
      routeFocus = [],
      markerSteps = [],
      toEnd = true,
      indexPoint = 2,
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
            for (var i in routes) {
              component.drawSimpleRoute(routes[i]);
              component.addRouteMarker(routes[i], i);
              component.fitBounds(routes[i].bounds);
              _routes.push(routes[i]);
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
                zIndex: 999
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
                zIndex: 998
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
                component.selectRouteMarker(route);
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
          selectRouteMarker: function(route) {
            for (var i in _routes) {
              var path = _routes[i].overview_path;
              var routeMarker = jQuery('#routemarker-' + parseInt(i));
              if (JSON.stringify(path) === JSON.stringify(route.overview_path)) {
                _routes[i].selected = true;
                routeMarker.addClass('selected');
                google.maps.event.trigger(map, 'resize');

              } else {
                routeMarker.removeClass('selected');
                _routes[i].selected = false;
                //component.openInfowindow(routes[i], i, config);
              }
            }
          },
          focusOnInfowindow: function(route) {
            for (var i in _routes) {
              var routeMarker = jQuery('#routemarker-' + parseInt(i));
              var path = _routes[i].overview_path;
              if (JSON.stringify(path) === JSON.stringify(route.overview_path)) {
                if (!_routes[i].selected) {
                  routeMarker.addClass('focused');
                  //component.openInfowindow(routes[i], i, config, false, true);
                  break;
                }
              }
            }
          },
          leaveInfowindow: function() {
            for (var i in _routes) {
              var routeMarker = jQuery('#routemarker-' + parseInt(i));
              if (!routes[i].selected) {
                routeMarker.removeClass('focused');
                //component.openInfowindow(routes[i], i, config, false, false);
              }
            }
          },
          drawMarker: function(route, index, markerPoint) {
            var data = {
              index: parseInt(index) + 1,
              color: config.colors[index]
            };
            var templateRendered = Mustache.render(createRouteMarkerTemplate(index), data);
            routeMarkers[index] = new RichMarker({
              position: markerPoint,
              content: templateRendered,
              flat: true,
              anchor: RichMarkerPosition.BOTTOM,
              height: '15px',
              draggable: false,
              map: map
            });

            routeMarkers[index].setZIndex(1000);

            google.maps.event.addListener(routeMarkers[index], 'click', function(event) {
              event.stopPropagation();
              journeys.clickOnRoutePanel(route);
            });

          },
          addRouteMarker: function(route, index) {
            //Search best step to add marker
            if (!routeMarkers[index]) {
              var arrSteps = route.legs[0].steps;
              var indexMiddleStep = Math.floor(arrSteps.length / 2);
              var middleSteps = arrSteps[indexMiddleStep];
              if (!stepUsed(middleSteps)) {
                var markerPoint = null;
                if (middleSteps.travel_mode !== 'WALKING') {
                  markerPoint = getStepPoint(middleSteps);
                  component.drawMarker(route, index, markerPoint);
                  markerSteps.push(middleSteps.encoded_lat_lngs.replace(/[^\w\s]/gi, ''));
                } else {
                  var nextStep = findNextStep(arrSteps, indexMiddleStep);
                  if (nextStep === null) {
                    markerPoint = getRoutePoint(route);
                  } else {
                    markerPoint = getStepPoint(nextStep);
                    markerSteps.push(nextStep.encoded_lat_lngs.replace(/[^\w\s]/gi, ''));
                  }
                  component.drawMarker(route, index, markerPoint);
                }
              } else {
                var nextStep = findNextStep(arrSteps, indexMiddleStep);
                if (nextStep === null) {
                  markerPoint = getRoutePoint(route);
                } else {
                  markerSteps.push(nextStep.encoded_lat_lngs.replace(/[^\w\s]/gi, ''));
                  markerPoint = getStepPoint(nextStep);
                }
                component.drawMarker(route, index, markerPoint);
              }
            }
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

    function createRouteMarkerTemplate(index) {
      return "<div id='routemarker-" + index + "' class='route-marker'>" +
        "<span class='id-route'>{{index}}</span>" +
        "</div>";
    }

    function stepUsed(middleStep) {
      var key = middleStep.encoded_lat_lngs.replace(/[^\w\s]/gi, '');
      var enc = false;
      for (var i in markerSteps) {
        if (key === markerSteps[i]) {
          enc = true;
          break;
        }
      }
      return enc;
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

    function findNextStep(arrSteps, indexMiddleStep) {
      if (toEnd) {
        for (var i = indexMiddleStep; i < arrSteps.length; i++) {
          if (!stepUsed(arrSteps[i])) {
            //Next time loop before step's middle
            toEnd = false;
            return arrSteps[i];
          }
        }
        for (var i = indexMiddleStep; i >= 0; i--) {
          if (!stepUsed(arrSteps[i])) {
            //Next time loop before step's middle
            toEnd = true;
            return arrSteps[i];
          }
        }
      } else {
        for (var i = indexMiddleStep; i >= 0; i--) {
          if (!stepUsed(arrSteps[i])) {
            //Next time loop before step's middle
            toEnd = true;
            return arrSteps[i];
          }
        }
        for (var i = indexMiddleStep; i < arrSteps.length; i++) {
          if (!stepUsed(arrSteps[i])) {
            //Next time loop before step's middle
            toEnd = false;
            return arrSteps[i];
          }
        }
      }
      return null;
    }

    function getRoutePoint(route) {
      var arr = route.overview_path;
      var middlePoint = arr[Math.floor(arr.length / indexPoint)];
      for (var i in routeMarkers) {
        if (middlePoint.equals(routeMarkers[i].getPosition())) {
          indexPoint++;
          middlePoint = arr[Math.floor(arr.length / indexPoint)];
        }
      }
      indexPoint++;
      return middlePoint;
    }

    function getStepPoint(step) {
      var arr = step.path;
      var middle = arr[Math.floor(arr.length / indexPoint)];
      for (var i in routeMarkers) {
        if (middle.equals(routeMarkers[i].getPosition())) {
          indexPoint++;
          middle = arr[Math.floor(arr.length / indexPoint)];
        }
      }
      indexPoint++;
      return middle;
    }

  });

})();