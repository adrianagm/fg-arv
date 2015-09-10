/*!
 * FG_ARV @version 0.0.1
 */
/*
 * First Group Alternative Routes Viewer.
 */
/**
 * The widget interaction object reference;
 */
var FG_ARV;
(function() {

	"use strict";

	var VERSION = "@version 0.0.1";

	/*
	 * Creates a queue meanwhile modules initialisation.
	 */
	FG_ARV = {
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

	FG_ARV.contextReq = requirejs.config({
		baseUrl: '..',
		paths: {
			'fg-arv': 'src/js/fg-arv'
		}
	});

  requirejs(['fg-arv/builder'], function(jpBuilder) {
    var old_FG_ARV = FG_ARV;
    FG_ARV = jpBuilder.createInteractionObject();
    FG_ARV.contextReq = old_FG_ARV.contextReq;
    FG_ARV.version = old_FG_ARV.version;
    if (old_FG_ARV.queue.length > 0) {
      for (var x = 0; x < old_FG_ARV.queue.length; x++) {
        FG_ARV.init(old_FG_ARV.queue[x]);
      }
    }
  });

})();
