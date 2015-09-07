/**
 * This module is in charge of controlling inputs for locations.
 */
(function() {

  "use strict";

  var DEFAULT_CONFIG = {
    position: 'LEFT_TOP',
    chooseRouteCallback: jQuery.noop
  };

  var ID = 0;

  define(['fg-arv/utils', 'fg-arv/components/infoJourney', 'fg-arv/libs/mustache', 'fg-arv/components/time', 'fg-arv/google-helper'], function(utils, infoJourney, Mustache, time, googleHelper) {
    var resizeTimeout, journeyPanels = [],
      componentElement;
    var module = {
      createComponent: function(config) {
        var container = utils.getPropertyValue(config, 'container');

        if (container) {
          var id = createDomID();
          var conf = jQuery.extend({
            id: id
          }, DEFAULT_CONFIG, config);
          var template = createTemplate(conf);
          var map = conf.widget.getMap();
          var controls = map.controls[google.maps.ControlPosition[conf.position]].getArray();
          if (jQuery.inArray(container, controls) !== -1) {
            container = controls[jQuery.inArray(container, controls)];
          } else {
            var panelControl = container;
            jQuery(panelControl).addClass('map-control');
            map.controls[google.maps.ControlPosition[conf.position]].push(panelControl);
          }


          template = Mustache.render(template, config);

          container.innerHTML = template;
          componentElement = jQuery('#' + id);
          var component;

          journeyPanels = [];

          var listRoutes = conf.routes;

          component = {
            getID: function() {
              return id;
            },

            createSingleJourneyPanels: function(routes) {
              var timeDepartureImpossible = 0;
              // config.widget.widgetElement.find('.form').css('display', 'none');

              function makeHidePanelCb() {
                return function() {
                  component.deletePanel();
                };
              }

              function makeShowPanelCb() {
                return function() {
                  container.innerHTML = template;
                  openJourney = this.index;
                  componentElement = jQuery(container);
                  component.createSingleJourneyPanels(listRoutes);
                  componentElement.css('max-height', calculateHeight(conf, container));
                  jQuery(container).find('.close-panel').click(function() {
                    component.closePanel();
                  });
                };
              }

              function makeCollapsePanelsCb() {
                return function() {
                  for (var jp = 0; jp < journeyPanels.length; jp++) {
                    journeyPanels[jp].collapse();
                  }
                };
              }

              function makeRecalculateSizeCb() {
                return function() {
                  conf.mapViewComponent.calculateSize();
                };
              }

              function deselectPanels() {
                return function() {
                  componentElement.find('.panel-route').removeClass('selected');
                };
              }


              setTimeout(function() {
                for (var rt = 0; rt < routes.length; rt++) {
                  if (routes[rt].legs[0].departure_time && (routes[rt].legs[0].departure_time.value < new Date())) {
                    timeDepartureImpossible++;
                    continue;
                  }
                  var journeyPanel = infoJourney.createComponent({
                    container: componentElement.find('.panel-body'),
                    heading: componentElement.find('.panel-heading').html(),
                    route: routes[rt],
                    index: rt,
                    widget: config.widget,
                    mainContainer: container,
                    mapView: conf.mapViewComponent,
                    departureTime: config.departureTime,
                    arrivalTime: config.arrivalTime,
                    recalculateSize: makeRecalculateSizeCb(),
                    clickCallback: deselectPanels()

                  });
                  if (rt === 0) {
                    deselectPanels();
                    journeyPanel.clickOnRoute();
                  }
                  if (rt < routes.length - 1) {
                    componentElement.find('.panel-body').append(createSeparatedDiv());
                  }
                  journeyPanels.push(journeyPanel);

                }
                if (timeDepartureImpossible === routes.length) {
                  module.createComponent({
                    container: container,
                    widget: conf.widget,
                    message: 'There are not routes for this data'
                  });
                }
              }, 100);

            },
            clearSingleRoutesPanel: function() {
              componentElement.find('.panel-body')[0].innerHTML = "";

            },

            getRoutes: function() {
              return listRoutes;
            },

            deletePanel: function() {
              componentElement = conf.widget.widgetElement.find('.info-journey-panel');
              componentElement.hide();
            },
            closePanel: function() {
              component.deletePanel();
              config.widget.widgetElement.find('.form').css('display', 'block');

            },
            calculateSize: function() {
              var maxHeight = calculateHeight(conf, container);
              jQuery(container).css('max-height', maxHeight + 'px');

            },
            addPanelFormTemplate: function() {
              componentElement.find('.leave-arrive').prepend(component.createLeaveArriveButton());
              componentElement.find('.sort').append(component.createSortButton());
              time.createComponent({
                getWidget: function() {
                  return conf.widget;
                },
                container: componentElement.find(".panel-form .timepicker"),
                date: conf.widget.dateComponent.getDate()
              });
              componentElement.find('.timepicker button').addClass('btn-sm');
            },
            createLeaveArriveButton: function() {
              var opt = [{
                text: 'Leave before',
                value: 'departureTime'
              }, {
                text: 'Arrive before',
                value: 'arriveTime'
              }];
              var callback = function(btn) {
                // alert(btn.value);
              };
              var btn = module.createOptButton(opt, callback);

              return btn;

            },

            createSortButton: function() {
              var opt = [{
                text: 'Fastest',
                value: 'fast'
              }, {
                text: 'Fewer transfers',
                value: 'fewer'
              }, {
                text: 'Less walking',
                value: 'less'
              }];
              var callback = function(btn) {
                /*component.clearSingleRoutesPanel();
                conf.mapViewComponent.clearRoutes();
                listRoutes = getJourney(conf);
                component.createSingleJourneyPanels(listRoutes);
                conf.mapViewComponent.init(listRoutes);*/
              };
              var btn = module.createOptButton(opt, callback);

              return btn;
            },
            resizeListener: function() {
              jQuery(window).resize(function() {
                if (resizeTimeout) {
                  clearTimeout(resizeTimeout);
                }

                resizeTimeout = setTimeout(function() {
                  component.calculateSize();
                }, 10);
              });
              component.calculateSize();
            },
            closeListener: function() {
              jQuery(container).find('.close-panel').click(function() {
                component.closePanel();
              });
            }

          };

          if (listRoutes) {
            component.createSingleJourneyPanels(listRoutes);
            component.addPanelFormTemplate();
          }
          component.closeListener();
          component.resizeListener();

          return component;
        }
      },
      createOptButton: function(opt, callback) {
        var div = document.createElement('div');

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-secundary btn-sm btn-opt';
        var i = 0;
        btn.innerHTML = opt[i].text;
        btn.value = opt[i].value;

        var span = document.createElement('span');
        span.style.float = 'right';
        var up = document.createElement('a');
        up.className = 'zmdi zmdi-caret-up';
        up.onclick = function() {
          i--;
          if (!opt[i]) {
            i = opt.length - 1;
          }

          btn.innerHTML = opt[i].text;
          btn.value = opt[i].value;
          btn.appendChild(span);
          callback(btn);
        };
        var down = document.createElement('a');
        down.className = 'zmdi zmdi-caret-down';
        down.onclick = function() {
          i++;
          if (!opt[i]) {
            i = 0;
          }

          btn.innerHTML = opt[i].text;
          btn.value = opt[i].value;
          btn.appendChild(span);
          callback(btn);
        };
        span.appendChild(up);
        span.appendChild(down);
        btn.appendChild(span);
        div.appendChild(btn);

        return div;



      },


      getPanelByRoute: function(route) {
        for (var jp in journeyPanels) {
          if (journeyPanels[jp].getRoute() === route) {
            return journeyPanels[jp];
          }
        }
      },
      focusOnRoutePanel: function(route) {
        var routePanel = this.getPanelByRoute(route);
        routePanel.focusOnRoute();
      },
      leaveRoutePanel: function(route) {
        var routePanel = this.getPanelByRoute(route);
        routePanel.leaveRoute();
      },
      clickOnRoutePanel: function(route) {
        componentElement.find('.panel-route').removeClass('selected');
        var routePanel = this.getPanelByRoute(route);
        routePanel.clickOnRoute();

      }


    };

    return module;

    //*********************************************************

    function createTemplate(config) {
      return "<div id='" + config.id + "' class='panel panel-default info-journey-panel list-routes-panel'>" +
        "<a class='close-panel' href='#'>x</a>" +
        "<div class='panel-heading'>" +
        "{{#message}}<div class='messagge-error alert alert-danger alert-dismissible' role='alert'>" +
        "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" +
        "{{message}}</div>{{/message}}" +
        "<table class='panel-form'>" +
        "<tr>" +
        "<td><div class='leave-arrive choose-opt'></div></td>" +
        "<td><div class='timepicker form-input'></div></td>" +

        "<td class='right'><div>Sort by: </div></td>" +
        "<td class='right'><div class='sort choose-opt'></div></td>" +
        "</tr>" +
        "</table>" +

        // "<div class='{{#message}}col-xs-10{{/message}} message left'>{{message}}</div>" +
        // "{{#departureDirection}}<div class='head-info col-xs-11 row'><div class='head-direction col-xs-7 row'><div class='ellipsis col-xs-11' title='{{departureDirection}}'>{{departureDirection}}</div><div class='col-xs-1 dash'>-</div></div>" +
        //"<div class='head-direction ellipsis col-xs-5' title='{{arrivalDirection}}'>{{arrivalDirection}}</div></div>{{/departureDirection}}" +
        //"<div class='close-panel right {{#departureDirection}}col-xs-1{{/departureDirection}} col-xs-1'><button type='button' class='btn btn-secondary'>Change</button></div>" +
        "</div>" +
        "<div class='journeys-separated'></div>" +
        "<div class='panel-body'>" +
        "</div>" +
        "</div>";
    }

    function createSeparatedDiv() {
      return "<div class='journeys-separated'></div>";
    }

    function createDomID() {
      var i = ++ID;
      return "fg-arv-journeys-panel-" + i;
    }

    function calculateHeight(config, container) {
      if (jQuery(container).innerWidth() < 300) {
        jQuery(container).find('.panel-body').css('overflow-x', 'auto');
      } else {
        jQuery(container).find('.panel-body').css('overflow-x', 'hidden');
      }

      var map = config.widget.getMap();
      var heightWidget = config.widget.widgetElement.height();
      var heightForm = config.widget.widgetElement.find('.form').height();

      var height = heightWidget - heightForm - 20;

      if (jQuery('html').hasClass('ie8')) {
        jQuery(container).find('.info-journey-panel').css('max-height', height + 'px');
      } else {
        jQuery(container).find('.info-journey-panel').css('max-height', height - 30 + 'px');
      }
      var heightHeader = jQuery(container).find('.panel-heading').height();
      jQuery(container).find('.panel-body').css('max-height', height - heightHeader - 40 + 'px');
      jQuery(container).find('.info-journey-panel').css('position', 'relative');
      jQuery(container).find('.info-journey-panel').css('top', heightForm + 'px');
      jQuery(container).find('.panel-body').css('overflow-y', 'auto');
      return height;
    }

    function getJourney(conf) {

      var deferred = jQuery.Deferred();
      var routes;
      var widget = conf.widget;
      var from = widget.fromComponent.getValue().name;
      var to = widget.toComponent.getValue().name;
      var dateDeparture = widget.dateComponent.getDate();
      var timeDeparture = widget.timeComponent;
      var travelDate = new Date(dateDeparture.getFullYear(), dateDeparture.getMonth(), dateDeparture.getDate(), timeDeparture.getHours(), timeDeparture.getMinutes());

      var opt = {
        departureTime: utils.isDate(travelDate) ? travelDate : false,
        arrivalTime: false,
        departureDirection: from,
        arrivalDirection: to
      };

      if (from !== '' && to !== '') {

        googleHelper.getJourney(from, to, opt).done(function(response) {
          routes = response;

        });
      }
      deferred.resolve(routes);
      return deferred.promise();

    }

  });

})();
