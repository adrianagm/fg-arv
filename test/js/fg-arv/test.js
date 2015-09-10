/**
 * This module is in charge of building the main widget structure for testing.
 */
(function() {

  "use strict";
  var COLORS = ['#BE81F7', '#48b5e9', '#81F7BE', '#FA5882', '#FACC2E', '#04B4AE', '#F79F81', '#8181F7', '#5FB404'];
  define(['fg-arv/components/mapView', 'fg-arv/google-helper', 'fg-arv/widget', 'fg-arv/components/journeys'], function(mapView, googleHelper, widget, journeys) {

    var rootElement = jQuery('#test-buttons');
    var date = new Date().addHours(4);


    rootElement.find("button.route1").click(function() {


      var from = 'London';
      var to = 'Southampton';

      var opt = {
        departureTime: date,
        arrivalTime: false,
        departureDirection: from,
        arrivalDirection: to
      };

      window.widget.getJourney(from, to, opt);
    });

    rootElement.find("button.route2").click(function() {


      var from = 'Lancaster Gate, London';
      var to = 'Bristol';

      var opt = {
        departureTime: date,
        arrivalTime: false,
        departureDirection: from,
        arrivalDirection: to
      };

      window.widget.getJourney(from, to, opt);
    });

    rootElement.find("button.route3").click(function() {



      var from = 'London';
      var to = 'Crawley';

      var opt = {
        departureTime: date,
        arrivalTime: false,
        departureDirection: from,
        arrivalDirection: to
      };

      window.widget.getJourney(from, to, opt);

    });

    rootElement.find("button.route4").click(function() {



      var from = 'Reading';
      var to = 'Southampton';

      var opt = {
        departureTime: date,
        arrivalTime: false,
        departureDirection: from,
        arrivalDirection: to
      };

      window.widget.getJourney(from, to, opt);

    });

  });


})();
