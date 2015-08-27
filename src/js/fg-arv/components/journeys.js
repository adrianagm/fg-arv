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

  define(['fg-arv/utils', 'fg-arv/components/infoJourney', 'fg-arv/libs/mustache'], function(utils, infoJourney, Mustache) {
    var resizeTimeout;
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
          var componentElement = jQuery('#' + id);
          componentElement.find('.leave-arrive').prepend(createLeaveArriveButton());
          componentElement.find('.sort').append(createSortButton());
          var journeyPanels = [];
          var listRoutes = conf.routes;
          var openJourney = 0;
          var component = {
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
                  component.calculateSize();
                };
              }

              setTimeout(function() {
                for (var rt = 0; rt < routes.length; rt++) {
                  if (routes[rt].legs[0].departure_time && (routes[rt].legs[0].departure_time.value < new Date())) {
                    timeDepartureImpossible++;
                    if (rt == openJourney && openJourney + 1 < routes.length) {
                      openJourney++;
                    }
                    continue;
                  }
                  var journeyPanel = infoJourney.createComponent({
                    container: componentElement.find('.panel-body'),
                    heading: componentElement.find('.panel-heading').html(),
                    route: routes[rt],
                    index: rt,
                    widget: config.widget,
                    mainContainer: container,
                    //isCollapse: rt == openJourney && routes[rt] == listRoutes[rt] ? false : true,
                    isCollapse: false,
                    departureTime: config.departureTime,
                    arrivalTime: config.arrivalTime,
                    hidePanel: makeHidePanelCb(),
                    showPanel: makeShowPanelCb(),
                    collapseAllPanels: makeCollapsePanelsCb(),
                    recalculateSize: makeRecalculateSizeCb()
                  });
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
            getRoutes: function() {
              return conf.routes;
            },
            addNewJourneyPanels: function(routes) {
              componentElement.find('.panel-body').append(createSeparatedDiv());
              listRoutes.push.apply(listRoutes, routes);
              this.createSingleJourneyPanels(routes);
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

            }

          };
          if (config.routes) {
            component.createSingleJourneyPanels(config.routes);
          }
          jQuery(container).find('.close-panel').click(function() {
            component.closePanel();
          });



          jQuery(window).resize(function() {
            if (resizeTimeout) {
              clearTimeout(resizeTimeout);
            }

            resizeTimeout = setTimeout(function() {
              component.calculateSize();
            }, 10);
          });
          component.calculateSize();

          return component;
        }
      }


    };

    return module;

    //*********************************************************

    function createTemplate(config) {
      return "<div id='" + config.id + "' class='panel panel-default info-journey-panel list-routes-panel'>" +
        "<a class='close-panel' href='#'>x</a>" +
        "<div class='panel-heading row'>" +
        "{{#message}}<div class='messagge-error alert alert-danger alert-dismissible' role='alert'>" +
        "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" +
        "{{message}}</div>{{/message}}" +
        "<div class='panel-form row'>" +
        "<div class='col-xs-6  choose-opt  row'>" +
        "<div class='leave-arrive col-xs-12'>" +
        "<input type='text' class='col-xs-5' placeholder='hh:mm'>" +
        "</div>" +
        " </div>" +
        "<div class='col-xs-6 sort choose-opt  row'>" +
        "<span  class='col-xs-5'>Sort by </span>" +
        "</div>" +
        "</div>" +
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

    function createLeaveArriveButton() {
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
      var btn = createOptButton(opt, callback);

      return btn;

    }

    function createSortButton() {
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
        // alert(btn.value);
      };
      var btn = createOptButton(opt, callback);

      return btn;
    }

    function createOptButton(opt, callback) {
      var div = document.createElement('div');
      div.className = 'col-xs-7 row ';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-default btn-sm btn-opt col-xs-8';
      var i = 0;
      btn.innerHTML = opt[i].text;
      btn.value = opt[i].value;
      var upDownBtn = document.createElement('button');
      upDownBtn.type = 'button';
      upDownBtn.className = 'btn btn-default btn-sm col-xs-4';
      var span = document.createElement('span');
      var up = document.createElement('a');
      up.className = 'zmdi zmdi-caret-up';
      up.onclick = function() {
        i--;
        if (!opt[i]) {
          i = opt.length - 1;
        }

        btn.innerHTML = opt[i].text;
        btn.value = opt[i].value;

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

        callback(btn);
      };
      span.appendChild(up);
      span.appendChild(down);
      upDownBtn.appendChild(span);
      div.appendChild(btn);
      div.appendChild(upDownBtn);

      return div;



    }
  });

})();
