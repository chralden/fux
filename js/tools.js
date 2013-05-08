//Musical notation module
var FUX = (function (fux) {
	
	var notation = fux.notation,
	soundmanager = fux.soundmanager,
	tools = function(){

		var setup = function(){
			var toolsLink = $('.tool-link'),
			toolsEl = $('.tools'),
			contentEl = $('.center-column');

			toolsLink.on('click', function(){
				toolsEl.animate({
					width: 'toggle',
					}, 800, function() {
				});
				contentEl.toggleClass('twoCol', 800);
			});
		},

		notationTools = {

			setup: function(){
				var self = this,
				toolButtons = $('.notation-tools a');

				toolButtons.on('click', self.routeClicks);
			},

			//Rout the click events to the appropriate notation changes
			routeClicks: function(){
				var button = $(this);

				if(button.hasClass('notation-note-select')) notation.setNoteValue(button.attr('data-notetype'));
			}


		},

		playbackTools = {

			setup: function(){
				var self = this,
				playbackButtons = $('.playback-tools a'),
				volumeSlider = $('#volume-slider');

				playbackButtons.on('click', self.routeClicks);

				volumeSlider.slider({
			      orientation: "vertical",
			      range: "min",
			      min: 0,
			      max: 100,
			      value: 60,
			      slide: function( event, ui ) {
			        soundmanager.setVolume(ui.value);
			      }
			    });


			},

			routeClicks: function(){
				var button = $(this);

				if(button.hasClass('transport')) soundmanager.controlPlayback(button.attr('data-transport'));
			}

		};
		
		//return the notation object with public methods	
		return {

			init: function(options){
				setup();
				notationTools.setup();
				playbackTools.setup();
			}
		}
		
		
	};

	fux.tools = tools();

	return fux;
}(FUX));