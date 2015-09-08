/**
 * This module handles widget HTML templates.
 */
(function() {

  "use strict";

  define(function() {
    return {

      //------------------------------------------------------------------------------------------------------------------------------
      /**
       * Creates the HTML template for a specific fg-arv widget.
       * @param {string} mapElementID The ID of the element for the map.
       * @returns The HTML template for a specficic fg-arv widget.
       */
      createWidgetTemplate: function(mapElementID) {
        return "<div class='fg-arv-widget'><div id='" + mapElementID + "' class='map'></div>" + this.createFormTemplate() + "</div>";
      },
      //------------------------------------------------------------------------------------------------------------------------------
      /**
       * Creates the HTML template for the widget form.
       * @returns The HTML template for the widget form.
       */
      createFormTemplate: function() {
        return '' +
          "<div style='display:none'>" +
          "<form>" +
          "<div class='form col-xs-12 col-sm-12 col-md-12'>" +
          "<div class='form-components-container'>" +
          "<div class='col-xs-12 col-sm-5 col-md-3 form-component from-component'></div>" +
          "<div class='col-xs-12 col-sm-5 col-md-3 form-component to-component'></div>" +
          "<div class='col-xs-12 col-sm-3 col-md-2 form-component complete-form-only fg-arv_date-component'></div>" +
          "<div class='xxs-screen col-xs-6 col-sm-3 col-md-2 form-component complete-form-only fg-arv_time-component' title='Time selector.'></div>" +
          //"<div class='col-xs-12 col-sm-2 col-md-2 form-component complete-form-only fg-arv_criteria-component' title='Criteria.'></div>" +
          "<div class='col-xs-12 col-sm-2 col-md-2 form-component go-component'>" +
          "<div class='form-input'><button type='button' class='form-control btn btn-primary go' title='Go with these options.'>" +
          "Go<span class='glyphicon glyphicon-menu-right' aria-hidden='true'></span>" +
          "</button></div>" +
          "</div>" +
          "</div>" +
          "</div>" +
          "</form>" +
          "<div class='fg-arv_info-journey-component col-xs-12 col-sm-8 col-md-4'>" +
          "</div>" +
          "</div>";
      }
    };
  });

})();