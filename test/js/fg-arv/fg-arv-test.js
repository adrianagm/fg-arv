/*!
 * FG_ARV @version 0.0.1
 */
/*
 * First Group Alternative Routes Viewer Test.
 */
/**
 * The widget interaction object reference for testing;
 */
var FG_ARV_TEST;
(function() {

  "use strict";

  var VERSION = "@version 0.0.1";

  /*
   * Creates a queue meanwhile modules initialisation.
   */
  FG_ARV_TEST = {
    queue: [],
    init: function(apiObject) {
      if (apiObject) {
        var copy = jQuery.extend({}, apiObject);
        this.queue.push(copy);
      }
    },
    reset: function() {
      this.queue = [];
    },
    version: VERSION
  };

  FG_ARV_TEST.contextReq = requirejs.config({
    baseUrl: '..',
    paths: {
      'fg-arv-test': 'test/js/fg-arv'
    }
  });



  requirejs(['fg-arv-test/test'], function(jpBuilder) {
    var old_FG_ARV = FG_ARV_TEST;
    FG_ARV_TEST.contextReq = old_FG_ARV.contextReq;
    FG_ARV_TEST.version = old_FG_ARV.version;
    if (old_FG_ARV.queue.length > 0) {
      for (var x = 0; x < old_FG_ARV.queue.length; x++) {
        FG_ARV_TEST.init(old_FG_ARV.queue[x]);
      }
    }
  });


})();
