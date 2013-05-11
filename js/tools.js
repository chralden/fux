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
				volumeSlider = $('#volume-slider'),
				measureSelector = $('input#measure'),
				instrumentSelector = $('.instrument-select');

				//Bind click events to transport buttons
				playbackButtons.on('click', self.routeClicks);

				//Create the volume slider and connect to sound manager
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

				//Add change event listener to measure selector and connect to sound manager
			    measureSelector.on('change', function(){
			    	self.setMeasure(this, this.value);
			    });

			    //Add change event listener to instrument selection dropdown, and send new instrument to soundmanager when called
			    instrumentSelector.on('change', function(){
			    	soundmanager.setInstrument(this.value);
			    });


			},

			routeClicks: function(){
				var button = $(this);

				if(button.hasClass('transport')) soundmanager.controlPlayback(button.attr('data-transport'));
			},

			setMeasure: function(element, measure){
				var measureForm = $(element).parent(),
				input = $(element);


				measureForm.validate({
					rules: { 
						measure: {
							required: true,
      						number: true,
      						min: 1,
      						max: soundmanager.getMeasures()
      					}
					}
				});


				if(measureForm.valid()){
					soundmanager.playFromMeasure(measure);
				}else{
					input.effect("shake", { times: 2 }, 50);
				}
				
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