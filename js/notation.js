//Musical notation module
var FUX = (function (fux) {
	
	var notation = function(){

		//objects for rendering staves and notes
		var staff,

		//The current note type for the tooltip
		currentNoteValue = 'whole',

		//Mappings of Y positions for notes on staff based on clef
		pitchMappings = {
			treble: {
				'c4': 120,
				'd4': 110,
				'e4': 100,
				'f4': 90,
				'g4': 80,
				'a4': 70,
				'b4': 60,
				'c5': 50,
				'd5': 40,
				'e5': 30,
				'f5': 20,
				'g5': 10,
				'a5': 0
			},
			alto: {
				'd3': 120,
				'e3': 110,
				'f3': 100,
				'g3': 90,
				'a3': 80,
				'b3': 70,
				'c4': 60,
				'd4': 50,
				'e4': 40,
				'f4': 30,
				'g4': 20,
				'a4': 10,
				'b4': 0
			},
			tenor: {
				'b2': 120,
				'c3': 110,
				'd3': 100,
				'e3': 90,
				'f3': 80,
				'g3': 70,
				'a3': 60,
				'b3': 50,
				'c4': 40,
				'd4': 30,
				'e4': 20,
				'f4': 10,
				'g4': 0
			},
			bass: {
				'e2': 120,
				'f2': 110,
				'g2': 100,
				'a2': 90,
				'b2': 80,
				'c3': 70,
				'd3': 60,
				'e3': 50,
				'f3': 40,
				'g3': 30,
				'a3': 20,
				'b3': 10,
				'c4': 0
			}
		},

		assets = {
			staff: 'images/stave1.jpg',
			measure: 'images/measure-delim.png',
			whole: 'images/whole-note.png',
			treble: 'images/trebleclef.png',
			alto: 'images/altoclef.png',
			tenor: 'images/tenorclef.png',
			bass: 'images/bassclef.png'
		},

		//Object to manage notation image assets
		assetManager = {
			//The cue of assets to download
			downloadQueue: [],

			//The cache of downloaded assets
			cache: {},

			//Count of successful and unsuccesful downloads
			downloadCount: 0,
			errorCount: 0,

			//Return whether all assets have been downloaded
			isDone: function(){
				return (this.downloadQueue.length === this.downloadCount + this.errorCount);
			},

			//Return an IMG object from downloaded assets
			getAsset: function(path){
				return this.cache[path];
			},

			//Add IMG path to downloadQueue
			queueDownload: function(path){
				this.downloadQueue.push(path);
			},

			//Go through all assets, add load eventlistener with callback, and create IMG object
			downloadAll: function(downloadCallback){
				var self = this,
				i, path, img;

				//If there are no assets to load execute callback immediately
				if(self.downloadQueue.length === 0) downloadCallback();

				for(i = 0; i < self.downloadQueue.length; i++){
					path = self.downloadQueue[i];
					img = new Image();
					
					//Add event listeners for load and error
					img.addEventListener("load", function(){
						self.downloadCount++;
						if(self.isDone()){
							downloadCallback();
						}
					}, false);
					img.addEventListener("error", function(){
						self.errorCount++;
						if(self.isDone()){
							downloadCallback();
						}
					}, false);

					//Create IMG object with path and add to cache
					img.src = path;
					self.cache[path] = img;
				}

			}

		},

		clefs = {
			treble: {
				img: assets.treble,
				offset: { x: 10, y: 12 },
				width: 55
			},
			alto: {
				img: assets.alto,
				offset: { x: 18, y: -6 },
				width: 55
			},
			tenor: {
				img: assets.tenor,
				offset: { x: 18, y: -10 },
				width: 55
			},
			bass: {
				img: assets.bass,
				offset: { x: 10, y: 2 },
				width: 55
			}
		},

		//an object to render a note to the canvas
		note = {
			noteImages: {
				whole: assets.whole
			},
			pitch: 'a4',
			duration: 'whole',

			//Dimensions of the note image, defaults to whole note image dimensions
			width: 33,
			height: 48,

			//Initialize and render the note
			create: function(options){

				var self = this,
				options = options || false,
				position = (options && options.position) ? options.position : false,
				clef = (options && options.clef) ? options.clef : false;

				if(options && options.pitch !== undefined) self.pitch = options.pitch;
				if(options && options.duration !== undefined) self.duration = options.duration;
			},

			//Render the note in it's position in the appropriate measure
			render: function(context, position, clef){
				var self = this,
				noteImage = assetManager.getAsset(self.noteImages[self.duration]);

				context.drawImage(noteImage, position, pitchMappings[clef][self.pitch]);
			}

		};

		//an object to render a staff to the canvas
		staff = {
			
			//The canvas element for this staff
			theCanvas: '',

			//The canvas "context" for this staff
			context: '',

			//The target element for the canvas and the staffs name
			target: false,
			name: false,

			//Track the users mouse
			mouse: { x: 0, y: 0 },

			//Default X position, Y position, width, and height for a musical staff canvas
			x: 0,
			y: 40,
			width: 500,
			height: 170,

			//Clef type of the staff, defaults as treble
			clef: 'treble',

			//Default number of measures 
			measureLength: 4,
			measures: [],

			//The current measure and beat position on the staff
			currentMeasure: 0,
			currentBeat: 0,

			//Default images for staff background an measure bars
			image: assets.staff,
			measureBar: assets.measure,

			//Get pitch user is selecting based on mouse position and clef
			getPitchFromPosition: function(clef){
				var self = this,
				thisPitch = false,
				staffOffset = 23;

				$.each(pitchMappings[clef], function(pitch, position){
				
					if(self.mouse.y >=  staffOffset + position - 5 && self.mouse.y <= staffOffset + position + 5){
						thisPitch = pitch;
					}
				});

				return thisPitch;

			},

			getMeasureFromPosition: function(){
				var self = this,
				measurePosition = false;

				$.each(self.measures, function(i){
					if(self.mouse.x >= this.start && self.mouse.x <= this.end){
						measurePosition = i;
						return;
					} 
				});

				return measurePosition;

			},

			//Event listener to add note when user clicks on staff
			onMouseClick: function(self){
				thisPitch = self.getPitchFromPosition(self.clef),
				thisMeasure = self.getMeasureFromPosition();

				if(thisMeasure !== false) self.currentMeasure = thisMeasure;
				
				if(self.currentMeasure < self.measures.length && thisPitch){
					self.addNote({
						pitch: thisPitch,
						duration: currentNoteValue
					});	
				}

				self.render();
			},

			//Event listeners to track mouse position within the staff
			onMouseMove: function(self, e){
				var rect = self.theCanvas.getBoundingClientRect();

		        self.mouse.x = e.clientX - rect.left;
		        self.mouse.y = (e.clientY+24) - rect.top;
			},

			//Setup the Canvas
			setup: function(){
				var self = this;

				//add the staff canvas element to the target element
				self.target.append('<canvas id="'+self.name+'"></canvas>');

				//Initialize the 
				self.theCanvas = document.getElementById(self.name);
				self.context = self.theCanvas.getContext("2d");

				self.theCanvas.width = self.width;
				self.theCanvas.height = self.height;

			},

			//Add Event Listeners to the staff Canvas
			bindEvents: function(){
				var self = this;

				//Add mouse position tracking when user is over this staff
				self.theCanvas.addEventListener("mouseover", function(){
					$(self.theCanvas).bind("mousemove", function(e){
						self.onMouseMove(self, e);
					});
				});

				//Remove mouse position tracking when user has left this staff
				self.theCanvas.addEventListener("mouseout", function(){
					$(self.theCanvas).unbind("mousemove", function(e){
						self.onMouseMove(self, e);
					});
				});

				//Add 'click' event listener on staff for adding notes
				self.theCanvas.addEventListener("click", function(){
					self.onMouseClick(self);
				}, 
				false);
			},

			//Initialize a staff with given, x, y, width, and measure numbers, then render
			create: function(options){

				var self = this,
				options = options || false,
				measures = [],
				clefWidth, i, startOfMeasure, measureOffset;

				//If passed as options reset default object properties
				if(options && options.x) self.x = options.x;
				if(options && options.y) self.y = options.y;
				if(options && options.width) self.width = options.width;
				if(options && options.height) self.width = options.height;
				if(options && options.measureLength) self.measureLength = options.measureLength;
				if(options && options.target) self.target = options.target;
				if(options && options.name) self.name = options.name;
				if(options && options.clef) self.clef = options.clef;

				clefWidth = clefs[self.clef].width;
				measureOffset = self.x + clefWidth;
				
				//If a target element has been set, setup canvas and create measures and render
				if(self.target && self.name){

					self.setup();

					self.bindEvents();

					//Initialize all the measure objects
					if(self.measureLength > 0){
						for(i = 0; i < (self.measureLength); i++){
							startOfMeasure = measureOffset;
							measureOffset += (self.width - clefWidth)/self.measureLength;
							measures[i] = {
								start: startOfMeasure,
								end: measureOffset,
								width: self.width/self.measureLength,
								//Time signature value = 4 quarter notes, as all exercises are in common time
								value: 4,
								pitches: []
							};
						}
					}
					self.measures = measures;
				}
				
			},

			//Render the staff images to the canvas
			render: function(){
				var self = this,
				staffImage = assetManager.getAsset(self.image),
				measureBarImage = assetManager.getAsset(self.measureBar),
				clefImage = assetManager.getAsset(clefs[self.clef].img),
				clefOffset = clefs[self.clef].offset,
				notePosition, thisMeasure, thisNote,
				i,j;

				//Render clearing background
				self.context.fillStyle = "#FFF";
				self.context.fillRect(0, 0, self.theCanvas.width, self.theCanvas.height);

				//Render staff background image
				self.context.drawImage(staffImage, self.x, self.y, self.width, 90);

				//Render opening bar
				self.context.drawImage(measureBarImage, self.x, self.y);

				//If the staff contains measures, display the correct number of bar lines and create measure data objects
				for(i = 0; i < self.measures.length; i++){
					thisMeasure = self.measures[i];

					self.context.drawImage(measureBarImage, thisMeasure.end, self.y + 1);
					
					//Render any pitches for this measure
					for(j = 0; j < thisMeasure.pitches.length; j++){
						if(thisMeasure.pitches[j] !== 'undefined'){
							thisNote = thisMeasure.pitches[j];

							//Place the note to center given the position in the current measure
							notePosition = (thisMeasure.start + (thisMeasure.width/2)) - (thisNote.width/2);
							thisNote.render(self.context, notePosition, self.clef);
						}
					}
				}

				//Render bar line at end of staff
				self.context.drawImage(measureBarImage, self.x + self.width - 4, self.y + 2);

				//Draw the clef symbol
				self.context.drawImage(clefImage, self.x + clefOffset.x, self.y + clefOffset.y);
	
			},

			//Add a note to the current measure
			addNote: function(n){
				var self = this,
				thisNote = object(note),
				thisMeasure = self.measures[self.currentMeasure];

				thisNote.create(n);
				thisMeasure.pitches[self.currentBeat] = thisNote;
				
				self.currentMeasure++;
			}
		};
		
		//return the notation object with public methods	
		return {

			init: function(options){
				var options = options || false,
				currentNoteValue = (options && options.currentNoteValue) ? options.currentNoteValue : 'whole',
				target = (options && options.target) ? options.target : $('#fux-notation'),
				staves = ['treble', 'alto', 'tenor', 'bass'], 
				count = 0, 
				i, thisStaff;

				//Add style for note tooltip
				target.css('cursor', 'url('+assets[currentNoteValue]+'), auto');

				//Add all assets to the asset cue
				$.each(assets, function(asset, path){
					assetManager.queueDownload(path);
				});

				//Create and render staves once all required assets have loaded
				assetManager.downloadAll(function(){
					for(i = 0; i < staves.length; i++){
						thisStaff = object(staff);
						thisStaff.create({ clef: staves[i], name: staves[i]+i, target: target, width: 960, measureLength: 5 });

						thisStaff.render();
					}
				});
				
			}
		}
		
		
	};

	fux.notation = notation();

	return fux;
}(FUX));

$(function(){
	FUX.notation.init();
});
