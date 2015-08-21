/**
 * This module is in charge of controlling combobox visual components.
 */
(function() {

  "use strict";

  var DEFAULT_CONFIG = {
    value: '00:00',
    date: Date.today()
  };

  var ID = 0;

  define(['fg-arv/constants', 'fg-arv/utils', 'fg-arv/components/combobox'], function(constants, utils, combobox) {

    var module = {
      createComponent: function(config) {
        var container = utils.getPropertyValue(config, 'container');
        if (container) {
          var id = createDomID();
          var conf = jQuery.extend({
            id: id
          }, DEFAULT_CONFIG, config);
          var template = createTemplate(conf);
          container.html(template);
          var componentElement = jQuery('#' + id);

          var hourConfig = {
            container: container.find("#" + conf.id + "-hour"),
            type: 'range',
            maxRange: 23,
            minRange: 0,
            interval: 1,
            changeCallback: function() {
              component.setValue(component.getValue());
            }

          };

          var minConfig = {
            container: container.find("#" + conf.id + "-minutes"),
            type: 'range',
            maxRange: 55,
            minRange: 0,
            interval: 5,

          };
          var hourComponent, minutesComponent;
          var component = {
            getID: function() {
              return id;
            },

            validateTimeValue: function() {
              var date = conf.date;
              var hour = conf.value.split(':')[0];
              var minutes = conf.value.split(':')[1];
              if (!utils.isAfterToday(date)) {
                var nowHour = Date.now().getHours();
                var nowMinutes = Date.now().getMinutes();
                hourConfig.minRange = nowHour;
                minConfig.minRange = 0;

                if (hour <= nowHour) {
                  hour = nowHour;
                  if (nowMinutes % 5 !== 0) {
                    nowMinutes += (5 - nowMinutes % 5);
                  }
                  minConfig.minRange = nowMinutes;
                  if (minutes <= nowMinutes) {
                    if (nowMinutes === 60) {
                      nowMinutes = 0;
                      hour++;
                      hourConfig.minRange++;
                      minConfig.minRange = 0;
                    }
                    minutes = nowMinutes;
                  }
                }

              } else {
                hourConfig.minRange = 0;
                minConfig.minRange = 0;

              }

              hourConfig.value = hour;
              minConfig.value = minutes;


            },
            createTimePicker: function() {
              component.validateTimeValue();
              hourComponent = combobox.createComponent(hourConfig);
              minutesComponent = combobox.createComponent(minConfig);
            },
            setValue: function(value) {
              conf.value = value;
              component.validateTimeValue();
              if (hourComponent && minutesComponent) {
                hourComponent.setOptions(hourConfig);
                minutesComponent.setOptions(minConfig);

              }
            },
            getValue: function() {
              if (hourComponent && minutesComponent) {
                conf.value = hourComponent.getValue() + ':' + minutesComponent.getValue();
              }
              return conf.value;
            },
            getHours: function() {
              return this.getValue().split(':')[0];
            },
            getMinutes: function() {
              return this.getValue().split(':')[1];
            }

          };

          component.createTimePicker();
          //listen to changeDate event
          conf.getWidget().addEventHandler(constants.events.dateChanged, function(newDate) {
            conf.date = newDate;
            component.setValue(component.getValue());
          });

          return component;
        }

      }
    };


    return module;

    //*********************************************************

    function createTemplate(config) {
      return "<div id='" + config.id + "-hour' class='col-xs-7 col-sm-7 main-dropdown form-subcomponent form-input dropdown time-picker'  title='Hour selector.'></div>" +
        "<div id='" + config.id + "-minutes' class='col-xs-5 col-sm-5 second-dropdown form-subcomponent form-input dropdown time-picker'  title='Minutes selector.'></div>";
    }

    function createDomID() {
      var i = ++ID;
      return "fg-arv-time-" + i;
    }

  });

})();
