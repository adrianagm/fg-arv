/**
 * This module is in charge of controlling switch visual components.
 */
(function() {

  "use strict";


  var ID = 0;


  define(['fg-arv/utils', 'fg-arv/google-helper', 'fg-arv/libs/mustache'], function(utils, googleHelper, Mustache) {
    var resizeStepPanelTimeout;
    var module = {
      createComponent: function(config) {
        var container = utils.getPropertyValue(config, 'container');
        if (container) {
          var id = createDomID();
          var conf = jQuery.extend({
            id: id
          }, config);
          /* var template = createTemplate(conf);
          container.innerHTML = template;
          var componentElement = jQuery('#' + id);
          componentElement.html("<div class='info-journey-steps'>" + conf.template + "</div>");
          var buttonsTemplateRendered = Mustache.render(createButtonsTemplate(), {
            enableBook: conf.data.enableBook
          });

          jQuery(container).find('.panel-heading').html(conf.heading);*/
          var stepTemplate = Mustache.render(createStepsTemplate(), conf.data);
          jQuery(container).html(stepTemplate);



          var component = {
            getID: function() {
              return id;
            },
            calculateSize: function() {
              var stepPanel = jQuery(container).find('.steps-panel');
              var widthStep = stepPanel.innerWidth() - stepPanel.find('.time-info').innerWidth() - 70;
              stepPanel.find('.step-detail').css('width', widthStep + 'px');

              stepPanel.css('overflow-x', 'hidden');

            }

          };

          jQuery(window).resize(function() {
            if (resizeStepPanelTimeout) {
              clearTimeout(resizeStepPanelTimeout);
            }
            resizeStepPanelTimeout = setTimeout(function() {
              component.calculateSize();
            }, 100);
          });
          component.calculateSize();

          jQuery(container).find('.close-panel').click(function() {
            // conf.closePanel();
            componentElement.html('');
          });

          return component;
        }
      }


    };


    return module;


    //*********************************************************

    function createTemplate(config) {
      return "<div class='panel panel-default info-journey-panel'>" +
        //"<div class='panel-heading row'></div>" +
        "<a class='close-panel' href='#'>x</a>" +
        "<div id = '" + config.id + "' class='stepByStep-panel panel-body '></div></div>";
    }

    function createButtonsTemplate() {
      return "<i class='info-journey-button zmdi zmdi-favorite-outline zmdi-hc-3x  favorite-button'></i>" +
        "<i class='info-journey-button zmdi zmdi-caret-up zmdi-hc-3x back-button'></i>";
    }

    function createStepsTemplate() {
      return "<div class=' panel-default steps-panel'>" +

        "{{#transbords}}" +
        "<div class='row'>" +
        "<div class='col-xs-2 right time-info'>" +
        "<div class='step-time bold'>{{departure_time}}</div>" +
        "<div class='step-icon'>{{^onlyOneMode}}<img src={{icon}}>{{/onlyOneMode}}{{#onlyOneMode}}<span class='icon-turn {{maneuver}}'></span>{{/onlyOneMode}}</div>" +
        "</div>" +

        "<div class='col-xs-10 row step-squema'>" +
        "<div class='transit-stop-circle'></div>" +
        "<div class='col-xs-1 step-line {{^color}}walk-line{{/color}}' {{#color}} style='background-color: {{color}}; border-right:solid 1px {{text_color}}; border-left:solid 1px {{text_color}};' {{/color}}></div>" +
        "<div class='col-xs-11 step-info'>" +
        "<div class='step-detail {{#onlyOneMode}}one-mode{{/onlyOneMode}}'>" +
        "<div class='stop-departure bold ellipsis title='{{departure_station}}'>{{departure_station}}</div>" +
        "</div>" +
        "<div class='step-detail step-description'>" +
        "<div class='step-instruction row'>" +
        "{{#enableStepBook}}<div class='col-xs-10'>{{#line}}<span class='line' style='background-color:{{color}};color:{{text_color}}'>{{line}}</span>{{/line}} <div class='instructions' title='{{{instructions}}}'> {{{instructions}}}</div></div>" +
        "{{#timezoneChanged}}<div>Time zone change: {{timezoneChanged}}</div>{{/timezoneChanged}}" +
        "<div class='step-duration'>{{step_duration}}, {{step_distance}} </div>" +
        "<div class='col-xs-2 button-book right '><button type='button' class='info-journey-button btn btn-primary book-single-button'  value='{{enableStepBook}}' >Book</button></div>{{/enableStepBook}}" +
        "{{^enableStepBook}}<div>{{#line}}<span class='line' style='background-color:{{color}};color:{{text_color}}'>{{line}} </span>{{/line}} <div class='instructions' title='{{{instructions}}}''> {{{instructions}}}</div></div>" +
        "{{#timezoneChanged}}<div>Time zone change: {{timezoneChanged}}</div>{{/timezoneChanged}}" +
        "<div class='step-duration'>{{step_duration}}, {{step_distance}} </div>{{/enableStepBook}}" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "{{/transbords}}" +

        "<div class='row right time-info'>" +
        "<div class='col-xs-2'>" +
        "<div class='step-time bold'>{{end_time.date}}</div>" +
        "</div>" +

        "<div class='col-xs-10 row step-squema'>" +
        "<div class='transit-stop-circle'></div>" +

        "<div class='col-xs-11 step-info'>" +
        "<div class='step step-detail stop-end'>" +
        "<div class='stop-departure bold ellipsis' title='{{end_address}}'>{{end_address}}</div>" +
        "</div>" +
        "</div>" +
        "</div>" +


        "</div>";
    }



    function createDomID() {
      var i = ++ID;
      return "fg-arv-map-view-journey-" + i;
    }

    function calculateHeight(config) {
      var map = config.widget.getMap();
      var heightWidget = config.widget.widgetElement.height();
      var heightInfoJourney = config.widget.widgetElement.find('.fg-arv_info-journey-component').find('.info-journey-steps').innerHeight();
      var heightPanelHeading = config.widget.widgetElement.find('.fg-arv_info-journey-component').find('.panel-heading').innerHeight();
      var newHeight = heightWidget - heightInfoJourney - heightPanelHeading - 50;

      return newHeight;
    }



  });

})();
