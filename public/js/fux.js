var FUX = {

	//module for canvas based musical notation system
	notation: { 
		init: function(){
			console.log('Error: notation module not defined');
		}
	},

	//module for rendering and functionality of exercise tools
	tools: {
		init: function(){
			console.log('Error: tools module not defined');
		}
	},

	//module for managing assets required for notation and playback
	assetmanager: {
		init: function(){
			console.log('Error: asset manager module not defined');
		}
	},

	//Initialize the frontend FUX app based on the config JSON
	init: function(config){
		
		var self = this,
		options = $.parseJSON(config) || false,

		//Get all required assets from the config
		notes = options.noteValues || false, 
		clefs = options.clefs || false,
		instruments = options.instruments || false,
		id = options.id || false,

		//Get the staves for notation from config
		staves = options.staves || false,

		assetOptions;


		if(notes && clefs && instruments){
			assetOptions = {
				images: clefs.concat(notes),
				sounds: instruments
			};

			self.assetmanager.init(assetOptions, function(){
				self.notation.init({ currentNoteValue: notes[0], staves: staves, id: id });
				self.tools.init();
			});	
		}
		
	}

};