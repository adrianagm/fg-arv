/**
 * This module is in charge of controlling combobox visual components.
 */
(function() {

  "use strict";

  var DEFAULT_CONFIG = {
    type: 'range',
    maxRange: 24,
    minRange: 0,
    interval: 1,
    options: [],
    value: '',
    changeCallback: jQuery.noop
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
          var component = {
            getOptions: function() {
              if (conf.options) {
                return conf.options;
              }
            },
            getID: function() {
              return id;
            },
            setOptions: function(config) {
              var dropdownContent = "",
                i, value;
              switch (config.type) {
                case 'range':

                  for (var i = 0; i <= config.maxRange; i += config.interval) {
                    value = i;
                    if (i < 10) {
                      value = '0' + i;
                    }
                    if (i >= config.minRange) {
                      dropdownContent += "<li><a href='#' role='menuitem'><span class='combo-value'>" + value + "</span></a></li>";
                    }

                  }
                  break;
                case 'codedValues':
                  for (var i = 0; i < config.options.length; i++) {
                    value = config.options[i];
                    if (utils.isPropertyDefined(value, 'text')) {
                      dropdownContent += "<li><a href='#' role='menuitem'><span class='img " + value.text.split(' ')[0].toLowerCase() + "'></span><span class='combo-value'>" + value.text + "</span></a></li>";

                    } else {
                      dropdownContent += "<li><a href='#' role='menuitem'><span class='combo-value'>" + value + "</span></a></li>";
                    }
                  }
                  break;
              }
              var dropdown = container.find(".dropdown-" + conf.id);
              dropdown.html(dropdownContent);

              this.setValue(config.value);
              container.find(".dropdown-menu li a").click(function() {
                component.setValue(jQuery('.combo-value', this).html());
                conf.changeCallback();
              });
            },
            setContent: function(value) {
              var content = value;
              if (typeof(value) === 'string') {
                value = value.split(' ')[0].toLowerCase();
              }
              var imgValue = container.find('.' + value);
              if (imgValue.length > 0) {
                content = imgValue.clone();
                if (imgValue.length > 1) {
                  content = imgValue[0];
                }
              }

              var btnDropdown = container.find("#btn-" + conf.id + " .dropdownLabel").html(content);

              btnDropdown.html(content);

            },
            setValue: function(value) {
              if (value === '') {
                value = container.find(".dropdown-menu li a .combo-value")[0].innerHTML;
              }
              if (typeof(value) === 'number' && value < 10) {
                value = '0' + value;
              }
              component.setContent(value);
              conf.value = value;
            },
            getValue: function() {
              return conf.value;
            }
          };
          component.setOptions(conf);


          return component;
        }
      }
    };

    return module;

    //*********************************************************

    function createTemplate(config) {
      return "<div class='dropdown'><button id='btn-" + config.id + "' class='btn  dropdown-toggle' type='button' data-toggle='dropdown' aria-expanded='false'>" +
        "<div class='icon-box icon'></div>" +
        "<span class='dropdownLabel'></span>" +
        "<div class='icon-box clickable'>" +
        "<span class='glyphicon glyphicon-menu-down'></span>" +
        "</div>" +
        "</button>" +
        "<ul class='dropdown-menu btn-block dropdown-" + config.id + "' role='menu'></ul></div>";

    }

    function createDomID() {
      var i = ++ID;
      return "fg-arv-combobox-" + i;
    }

  });

})();