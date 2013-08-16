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
		basefirmus = options.basefirmus || false,

		//Get the staves for notation from config
		staves = options.staves || false,

		thisNoteValue = (notes.length === 4) ? notes[notes.length-2] : notes[notes.length-1],

		assetOptions;

		if(notes && clefs && instruments){
			assetOptions = {
				images: clefs.concat(notes),
				sounds: instruments
			};

			//Initialize image assets first to avoid User Interface Lag
			self.assetmanager.initImgs(clefs.concat(notes), function(){
				self.notation.init({ currentNoteValue: thisNoteValue, staves: staves, id: id, basefirmus: basefirmus });
				self.tools.init({ id: id });
				
				//Once images have loaded, load audio files, and initialize the sound manager once audio files have loaded
				self.assetmanager.initAudio(instruments, function(){
					self.soundmanager.init();
				});
			});


		}
		
	}

};