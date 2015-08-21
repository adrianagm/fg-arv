/**
 * This module is in charge of controlling datepicker visual components.
 */
(function() {

  "use strict";

  var TODAY = 'Today';
  var DATE_FORMAT = 'dd/mm/yy';
  var FIRST_DAY = 1;

  var DEFAULT_CONFIG = {
    futureMaxDays: 90,
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
          var inputElement = componentElement.find('input');
          /*          inputElement.datepicker({
                      dateFormat: DATE_FORMAT,
                      firstDay: FIRST_DAY,
                      beforeShow: function(inputEl, inst) {
                        setTimeout(function() {
                          componentElement.parent().append(inst.dpDiv);
                          inst.dpDiv.css({
                            left: 10,
                            top: 48,
                            minWidth: '300px',
                            zIndex: 100
                          });

                          // change width only for mobile, for others check CSS
                          if (window.innerWidth < 768) {
                            inst.dpDiv.css({
                              right: 10
                            });
                          }
                        }, 1);
                      }
                    });
          */
          var component;

          inputElement.change(function() {
            var inputDate = inputElement.datepicker("getDate");
            var today = Date.today();
            if (!utils.isDate(inputDate) || inputDate.getTime() < today.getTime()) {
              inputElement.val(TODAY);
            }
            conf.changeCallback(component.getDate());
          });

          componentElement.find(".clickable").click(function() {
            var today = Date.today();
            var maxDate = Date.today().add(conf.futureMaxDays).days();
            inputElement.datepicker("option", {
              minDate: today,
              maxDate: maxDate
            });
            inputElement.datepicker("show");
            var date = inputElement.datepicker("getDate");
            if (!utils.isDate(date) || date.getTime() < today.getTime()) {
              inputElement.val(TODAY);
            }
          });

          component = {
            getID: function() {
              return id;
            },
            setDate: function(date) {
              var today = Date.today();
              if (utils.isDate(date)) {
                if (date.getTime() < today.getTime()) {
                  component.setDate(TODAY);
                } else {
                  inputElement.datepicker("setDate", date);
                }
              } else {
                inputElement.datepicker("setDate", today);
                inputElement.val(TODAY);
              }
              conf.changeCallback(component.getDate());
            },
            setFutureMaxDays: function(futureMaxDays) {
              conf.futureMaxDays = futureMaxDays;
            },
            getDate: function() {
              var date = inputElement.datepicker("getDate"); //cause an error with the skeleton integration
              var today = Date.today();
              if (!utils.isDate(date) || date.getTime() < today.getTime()) {
                return today;
              }
              return date;
            }
          };

          return component;
        }
      }
    };

    return module;

    //*********************************************************

    function createTemplate(config) {

      return "<div id='" + config.id + "' class='form-input date-picker-box rounded'>" +

        "<div class='icon-box date'></div>" +
        "<div class='date-selector-box'>" +
        "<input class='date-selector' disabled='disabled' type='text' value='Today'>" +
        "</div>" +
        "<div class='icon-box clickable' title='Click here to display calendar.'>" +
        "<span class='glyphicon glyphicon-menu-down'></span>" +
        "</div>" +
        "</div>";
    }

    function createDomID() {
      var i = ++ID;
      return "fg-arv-datepicker-" + i;
    }

  });

})();
