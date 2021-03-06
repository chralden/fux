//Musical notation module
var FUX = (function (fux) {

	//Put this module in ECMAScript 5 strict mode
	"use strict";
	
	var notation = fux.notation,
	soundmanager = fux.soundmanager,
	id = false,
	tools = function(){

		var setup = function(){
			var toolsLink = $('.tool-link'),
			toolsEl = $('.tools'),
			contentEl = $('.center-column');

			toolsLink.on('click', function(){
				toolsEl.animate({
					width: 'toggle'
					}, 800);

				if(toolsLink.css('right') === '0px'){
					toolsLink.animate({"right": "30%"}, 800);
				}else{
					toolsLink.animate({"right": "0px"}, 800);
				}

				contentEl.toggleClass('twoCol', 800);
			});
		},

		titleEditor = function(){
			var titleInput = $('#exname'),
			updateNameURL = '/exercise/name/'+id;

			if(titleInput.length > 0) titleInput.attr('size', (titleInput.val().length-4));

			titleInput.on('change', function(){
				$.post(updateNameURL, { title: titleInput.val() }, function(response){
					if(response === 'success'){
						titleInput.attr('size', (titleInput.val().length-4));
					}
				});
			});

			titleInput.on('keydown', function(event){
				if(event.keyCode === 13){
					$(this).blur();
				}
			});
		},

		notationTools = {

			setup: function(){
				var self = this,
					toolButtons = $('.notation-tools a'),
					zoomSlider = $('.zoom-select');

				toolButtons.on('click', self.routeClicks);
				
				//Set notation size level with the zoom slider
				zoomSlider.on('change', function(){
					var zoomlabel = $('.zoom-label'),
						zoomValue = $(this).val();
					
					notation.setScale(zoomValue);
					zoomlabel.html('('+(zoomValue*100)+'%)');
				});
			},

			//Rout the click events to the appropriate notation changes
			routeClicks: function(){
				var button = $(this);

				if(button.hasClass('notation-note-select')){
					button.toggleClass('active');
					button.siblings().removeClass('active');
					notation.setNoteValue(button.attr('data-notetype'));
				}
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
			      slide: function(event, ui) {
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

				if(button.hasClass('transport')){ soundmanager.controlPlayback(button.attr('data-transport')); }

				if(button.hasClass('staff')){
					button.toggleClass('active');
					soundmanager.toggleMute(button.attr('data-staff'));
				}
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

			init: function(initoptions){
				var options = initoptions || false;

				id = initoptions.id;

				setup();
				notationTools.setup();
				playbackTools.setup();
				if(id) { titleEditor(); }
			}
		};
		
		
	};

	fux.tools = tools();

	return fux;
}(FUX));