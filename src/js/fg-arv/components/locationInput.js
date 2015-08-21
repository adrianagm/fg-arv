/**
 * This module is in charge of controlling inputs for locations.
 */
(function() {

  "use strict";

  var DEFAULT_CONFIG = {
    placeholder: 'Location',
    classFromTo: 'location',
    geolocated: false,
    title: 'Location',
    changeCallback: jQuery.noop,
    focusCallback: jQuery.noop,
    locationCallback: jQuery.noop
  };

  var ID = 0;

  define(['fg-arv/utils'], function(utils) {

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
          var icon = document.createElement('div');
          icon.className = config.classFromTo + ' marker-icon input-icon';

          container.prepend(icon);
          var component;

          var focusCallback = function() {
            componentElement.parent().addClass("focused");
            conf.focusCallback();
          };

          componentElement.focus(function() {
            jQuery(componentElement).select(); // We select the currently displayed text for easy deletion.
            focusCallback();
          });

          var value = {
            name: ''
          };
          var lastTextValue = componentElement.val();

          var changeHandler = function() {
            if (lastTextValue !== component.getTextValue()) {
              lastTextValue = component.getTextValue();
              delete component.getValue().coordinates;
              if (component.getTextValue() === "") {
                //component.validateValue(true);
              }
            }
            conf.changeCallback();
          };

          componentElement.on("keyup", changeHandler);
          componentElement.on("change", changeHandler);
          componentElement.on("click", changeHandler);
          var locationElement = jQuery('#' + id + '-location');
          locationElement.click(function() {
            focusCallback();
            conf.locationCallback();
          });

          component = {
            getID: function() {
              return id;
            },
            setValue: function(newValue) {
              if (utils.isString(newValue)) {
                componentElement.val(newValue);
                value = {
                  name: textValue
                };
              } else if (utils.isPropertyDefined(newValue, 'name')) {
                var textValue = utils.getPropertyValue(newValue, 'name');
                componentElement.val(textValue);
                value = newValue;
                if (lastTextValue !== textValue) {
                  lastTextValue = textValue;
                  conf.focusCallback();
                  conf.changeCallback();
                }
              } else {
                value = {
                  name: ''
                };
                this.setValue(value);
              }
              //component.validateValue(true);
              conf.changeCallback();
              component.getElement().blur();
            },

            getElement: function() {
              return componentElement;
            },

            getValue: function() {
              value.name = this.getTextValue();
              return value;
            },
            getTextValue: function() {
              return componentElement.val();
            },
            getClass: function() {
              return config.classFromTo;
            },
            /*            validateValue: function(showError) {
                          this.getElement().closeVTJPValidation();
                          var valid = !!this.getValue().coordinates;
                          if (!valid && showError) {
                            $(this.getElement()).openVTJPValidation();
                          }
                          this.valid = valid;
                          return valid;
                        },
            */
            focus: function() {
              //componentElement.focus();
              setTimeout(function() {
                focusCallback();
              }, 100);

            },

            blur: function() {
              componentElement.parent().removeClass("focused");
            }
          };

          return component;
        }
      }
    };

    return module;

    //*********************************************************

    function createTemplate(config) {
      var template = "";
      template +=
        "<input id='" + config.id + "' type='text' placeholder='" + config.placeholder + "' class='form-control " + config.classFromTo + " location-input form-input' title='" + config.title + "'>";

      return template;
    }

    function createDomID() {
      var i = ++ID;
      return "fg-arv-location-" + i;
    }

  });

})();
