/**
 * This module is in charge of controlling inputs for locations.
 */
(function() {

  "use strict";

  var STATION_SEARCH_RADIUS = 500;

  var DEFAULT_CONFIG = {
    hideOtherPanels: jQuery.noop,
    showPanels: jQuery.noop
  };


  var ID = 0;

  define(['fg-arv/utils', 'fg-arv/components/stepByStep', 'fg-arv/libs/mustache'], function(utils, stepByStep, Mustache) {

    var module = {
      createComponent: function(config) {
        var that = this;
        var mapView = config.mapView;
        var container = utils.getPropertyValue(config, 'container');
        if (container) {
          var id = createDomID();
          var conf = jQuery.extend({
            id: id
          }, DEFAULT_CONFIG, config);

          var template = "<div id='" + id + "' class='panel-route '></div>",
            component, templateCollapse, templateExpand, dataInfoJourney;

          container.append(template);
          var componentElement = jQuery('#' + id);

          component = {
            getID: function() {
              return id;
            },
            getData: function() {
              return dataInfoJourney;
            },
            getRoute: function() {
              return conf.route;
            },
            expand: function() {
              componentElement.removeClass('collapse-route');
              componentElement.addClass('expand-route');
              componentElement.html(templateExpand);
              component.focusOnRouteListen();
              component.clickOnRouteListen();
              componentElement.find('.stepByStep-button').click(function() {
                if (jQuery(this).hasClass('open')) {
                  componentElement.find('.stepByStep-button').removeClass('open');
                  componentElement.find('.stepByStep-button').addClass('zmdi-caret-down');
                  componentElement.find('.stepByStep-button').removeClass('zmdi-caret-up');
                  componentElement.find('.steps-container').html('');
                } else {
                  componentElement.find('.stepByStep-button').addClass('open');
                  componentElement.find('.stepByStep-button').addClass('zmdi-caret-up');
                  componentElement.find('.stepByStep-button').removeClass('zmdi-caret-down');
                  stepByStep.createComponent({
                    container: componentElement.find('.steps-container'),
                    heading: conf.heading,
                    widget: conf.widget,
                    route: conf.route,
                    template: templateExpand,
                    data: component.getData()
                  });
                }
              });
            },
            favouriteRoute: function() {
              componentElement.find('.favorite-button').click(function() {
                if (jQuery(this).hasClass('favourite')) {
                  componentElement.find('.favorite-button').removeClass('favourite');
                  componentElement.find('.favorite-button').removeClass('zmdi-favorite');
                  componentElement.find('.favorite-button').addClass('zmdi-favorite-outline');
                } else {
                  componentElement.find('.favorite-button').removeClass('zdmi-favorite-outline');
                  componentElement.find('.favorite-button').addClass('zmdi-favorite');
                  componentElement.find('.favorite-button').addClass('favourite');
                }
              });
            },
            focusOnRouteListen: function() {
              componentElement.mouseenter(function() {
                component.focusOnRoute();
              });
              componentElement.mouseleave(function() {
                component.leaveRoute();
              });
            },

            focusOnRoute: function() {
              componentElement.addClass('focused');
              mapView.focusOnRoute(conf.route);
            },

            leaveRoute: function() {
              componentElement.removeClass('focused');
              mapView.leaveRoute();
            },

            clickOnRouteListen: function() {
              componentElement.click(function() {
                conf.clickCallback();
                component.clickOnRoute();
              });
            },
            clickOnRoute: function() {
              componentElement.addClass('selected');
              mapView.selectRoute(conf.route);
            }

          };

          module.getInfoRoute(conf).done(function(data) {
            dataInfoJourney = data;
            templateExpand = Mustache.render(createTemplate(conf), dataInfoJourney);
            component.expand();
            component.favouriteRoute();
          });
          return component;
        }
      },


      //prepare data for Mustache template
      getInfoRoute: function(conf) {
        var deferredData = new jQuery.Deferred();
        var route = conf.route.legs[0];
        var time = getInfoRouteGMTTime(conf);
        var infoRoute = {
          index: conf.index + 1,
          color: conf.color,
          summary: conf.route.summary,
          duration: route.duration ? route.duration.text : '',
          distance: route.distance ? route.distance.text : '',
          start_time: time.start_time,
          end_time: time.end_time,
          start_address: route.start_address,
          end_address: route.end_address,
          unique_values: [],
          transbords: []
        };


        var departure_stop_time, departure_stop_station, walking_time = 0,

          nStepsWalking = 0,
          nStepsDriving = 0,
          arrival_time, arrival_station, indexJourneyBook = 1,
          unique_values = {};
        for (var s = 0; s < route.steps.length; s++) {
          var step = route.steps[s];

          var transbord = {
            mode: step.travel_mode,
            step_distance: step.distance.text,
            step_duration: step.duration.text,
            instructions: step.instructions,
            departure_station: s === 0 ? infoRoute.start_address : arrival_station ? arrival_station : '',
            departure_time: s === 0 ? infoRoute.start_time.date : arrival_time ? arrival_time : '',
            isLast: s < route.steps.length - 1 ? false : true
          };

          infoRoute.transbords.push(transbord);
          arrival_time = null;
          arrival_station = null;
          switch (step.travel_mode) {
            case 'WALKING':
              transbord.icon = '/fg-arv/dist/images/walk-mode.png';
              if (!unique_values.walk) {
                unique_values.walk = {
                  icon: transbord.icon
                };
                infoRoute.unique_values.push(unique_values.walk);
              }
              transbord.maneuver = step.maneuver;
              walking_time += step.duration.value;
              nStepsWalking++;

              break;
            case 'TRANSIT':
              var startTimeOffset = getTimeOffset(step.transit.departure_time.value, step.transit.departure_time
                .text);
              var departure_time = normalizeTime(getTimeInLocalGMT(step.transit.departure_time.value,
                startTimeOffset));

              if (!departure_stop_time) {
                departure_stop_time = departure_time;
                departure_stop_station = step.transit.departure_stop ? step.transit.departure_stop.name : '';
              }
              transbord.departure_time = departure_time;
              transbord.departure_station = step.transit.departure_stop ? step.transit.departure_stop.name :
                '';
              var endTimeOffset = getTimeOffset(step.transit.arrival_time.value, step.transit.arrival_time.text);
              if (startTimeOffset !== endTimeOffset) {
                transbord.timezoneChanged = getGMT(endTimeOffset);
              }
              arrival_time = normalizeTime(getTimeInLocalGMT(step.transit.arrival_time.value, endTimeOffset));
              arrival_station = step.transit.arrival_stop ? step.transit.arrival_stop.name : '';
              transbord.mode = step.transit.line.vehicle.type;

              transbord.line = step.transit.line.short_name;
              transbord.color = step.transit.line.color ? step.transit.line.color : '#c00';
              transbord.text_color = step.transit.line.text_color ? step.transit.line.text_color : '#ccc';
              transbord.agency = step.transit.line.agencies[0].name;
              transbord.icon = step.transit.line.vehicle.icon ? step.transit.line.vehicle.icon :
                step.transit.line.vehicle.icon;

              //error in the london bus icon url provided by google
              if (transbord.icon.search('uk-london-bus') !== -1) {
                transbord.icon = 'https://maps.gstatic.com/mapfiles/transit/iw2/6/uk-london-bus.png';
              }
              if (!unique_values[step.transit.line.short_name]) {
                unique_values[step.transit.line.short_name] = {
                  icon: transbord.icon,
                  color: transbord.color,
                  text_color: transbord.text_color,
                  line: transbord.line,
                  agency: transbord.agency
                };
                infoRoute.unique_values.push(unique_values[step.transit.line.short_name]);
              }
              break;
            case 'DRIVING':
              transbord.icon = '/fg-arv/dist/images/car-mode.png';
              transbord.color = '#000';
              if (!unique_values.drive) {
                unique_values.drive = {
                  icon: transbord.icon,
                  color: transbord.color
                };
                infoRoute.unique_values.push(unique_values.drive);
              }
              transbord.maneuver = step.maneuver;
              nStepsDriving++;
              break;

          }

        }
        if (infoRoute.transbords.length === nStepsWalking || infoRoute.transbords.length === nStepsDriving) {
          infoRoute.onlyOneMode = true;
        }

        infoRoute.walking_time = walking_time;
        infoRoute.departure_stop_time = departure_stop_time;
        infoRoute.departure_stop_station = departure_stop_station;
        infoRoute.unique_values[infoRoute.unique_values.length - 1].isLast = true;

        deferredData.resolve(infoRoute);
        return deferredData.promise();
      }


    };

    return module;

    //*********************************************************

    function createTemplate(config) {

      return "<div class='route-info-panel'><div class='row row-head'>" +
        "<div class='col-xs-1'><div class='id-route' style='border-color:{{color}}'><span>{{index}}</span></div></div>" +
        "<div class='right col-xs-11 duration'>{{duration}} / {{distance}}.</div>" +
        "</div>" +
        "<div class='row row-transbord wrap'><div class='col-xs-9 wrap'>" +
        "{{#onlyOneMode}}<div><img src={{transbords.0.icon}}>  {{summary}}</div><div class='distance-info'>{{distance}}.</div> {{/onlyOneMode}}" +
        "{{^onlyOneMode}}{{#transbords}}<div class='pull-left text-center'><div><img src={{icon}}></div>" +
        "<div class='distance-info'>{{step_distance}}.</div></div><div class='pull-left'>{{^isLast}} > {{/isLast}}</div>{{/transbords}}{{/onlyOneMode}}" +
        "</div>" +
        "<div class='panel-journey-buttons col-xs-3 right'>" +
        "<a href='#' class='info-journey-button zmdi zmdi-favorite-outline zmdi-hc-2x favorite-button'></a>" +
        "<a href='#' class='info-journey-button zmdi zmdi-caret-down zmdi-hc-3x stepByStep-button'></a>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<div class='steps-container'></div>";


    }



    function createDomID() {
      var i = ++ID;
      return "fg-arv-jp-info-journey-" + i;
    }



    function getTimeOffset(time, text) {
      var hour = parseInt(text.split(':')[0]);
      if (text.split(':')[1].substring(2, 4) == 'pm' && hour !== 12) {
        hour += 12;
        if (hour === 24) {
          hour = 0;
        }
      }


      return (hour - time.getHours()) * 60;

    }

    function getTimeInLocalGMT(time, timezoneOffset) {
      var newTime = time.valueOf() + timezoneOffset * 60000;
      return new Date(newTime);

    }

    function getGMT(timezoneOffset) {
      var gmt = new Date().toString().substring(28, 30);
      var offset = new Date().getTimezoneOffset() - timezoneOffset;
      return 'GMT' + (gmt - (offset / 60));

    }

    function normalizeTime(time) {
      return time.getHours() + ':' + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes());
    }

    function getInfoRouteGMTTime(conf) {
      var route = conf.route.legs[0];
      var startTime, endTime, timezoneOffsetStart, timezoneOffsetEnd, gmt, gmtEnd, hour;
      timezoneOffsetStart = route.departure_time ? getTimeOffset(route.departure_time.value, route.departure_time
        .text) : 0;
      timezoneOffsetEnd = route.arrival_time ? getTimeOffset(route.arrival_time.value, route.arrival_time.text) :
        0;
      gmt = getGMT(timezoneOffsetStart);
      if (timezoneOffsetStart !== timezoneOffsetEnd) {
        gmtEnd = getGMT(timezoneOffsetEnd);
      }

      if (conf.departureTime) {
        startTime = route.departure_time ? getTimeInLocalGMT(route.departure_time.value, timezoneOffsetStart) :
          getTimeInLocalGMT(conf.departureTime, timezoneOffsetStart);
        endTime = new Date(startTime.getTime() + (route.duration.value * 1000));
        if (gmtEnd) {
          endTime = getTimeInLocalGMT(endTime, (timezoneOffsetEnd - timezoneOffsetStart));
        }
      } else if (conf.arrivalTime) {
        endTime = route.arrival_time ? getTimeInLocalGMT(route.arrival_time.value, timezoneOffsetEnd) :
          getTimeInLocalGMT(conf.arrivalTime, timezoneOffsetEnd);
        startTime = new Date(endTime.getTime() - (route.duration.value * 1000));
        if (gmtEnd) {
          startTime = getTimeInLocalGMT(startTime, (timezoneOffsetStart - timezoneOffsetEnd));
        }
      }


      return {
        start_time: {
          date: normalizeTime(startTime),
          gmt: gmt
        },
        end_time: {
          date: normalizeTime(endTime),
          gmt: gmtEnd ? gmtEnd : false
        }
      };

    }

    function getDistanceBetweenCoordinates(coord1, coord2) {
      var lat1 = coord1.lat(),
        lon1 = coord1.lng(),
        lat2 = coord2.lat,
        lon2 = coord2.lng,
        rad = function(x) {
          return x * Math.PI / 180;
        };

      var R = 6378.137;
      var dLat = rad(lat2 - lat1);
      var dLong = rad(lon2 - lon1);

      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(
        dLong / 2) * Math.sin(dLong / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;

      return d.toFixed(3);
    }
  });

})();