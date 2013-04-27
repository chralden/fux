//Musical notation module
var FUX = (function (fux) {
	
	var notation = fux.notation,
	tools = function(){

		var notationTools = {

			setup: function(){
				var self = this,
				toolButtons = $('.notation-tools a');

				toolButtons.on('click', self.routeClicks);
			},

			routeClicks: function(){
				var button = $(this);

				if(button.hasClass('notation-note-select')){
					notation.setNoteValue(button.attr('data-notetype'));
				}
			}


		},

		playbackTools = {


		};
		
		//return the notation object with public methods	
		return {

			init: function(options){
				notationTools.setup();
				
			}
		}
		
		
	};

	fux.tools = tools();

	return fux;
}(FUX));