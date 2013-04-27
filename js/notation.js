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

		//All assets utilized by notation system
		assets = {
			//Staff and Measure assets
			staff: 'images/stave1.jpg',
			measure: 'images/measure-delim.png',

			//Note assets
			whole: 'images/whole-note.png',
			halfUp: 'images/half-note-up.png',
			halfDown: 'images/half-note-down.png',
			quarterUp: 'images/quarter-note-up.png',
			quarterDown: 'images/quarter-note-down.png',
			eighthUp: 'images/eighth-note-up.png',
			eighthDown: 'images/eighth-note-down.png',

			//Eraser Tooltip
			eraser: 'images/eraser-x.png',

			//Clef assets
			treble: 'images/trebleclef.png',
			alto: 'images/altoclef.png',
			tenor: 'images/tenorclef.png',
			bass: 'images/bassclef.png',

			//Rest assets
			wholeRest: 'images/whole-rest.png',
			quarterRest: 'images/quarter-rest.png',
			eighthRest: 'images/eighth-rest.png'

		},

		//Pixel position for middle of staff, for stem positioning
		staffMiddle = 60,

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

		//Mapping of different clef type assets, as well as asset attributes - positioning offsets and width
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

		//Mapping of rest type assets, as well as asset attributes - positioning offsets and width
		rests = {
			whole: {
				img: assets.wholeRest,
				offset: { x: 0, y: 64 },
				width: 33
			},
			half: {
				img: assets.wholeRest,
				offset: { x: 0, y: 74 },
				width: 33
			},
			quarter: {
				img: assets.quarterRest,
				offset: { x: 0, y: 55 },
				width: 20
			},
			eighth: {
				img: assets.eighthRest,
				offset: { x: 0, y: 67 },
				width: 28
			}

		}

		//Get the direction for the note stem based on pitch and clef
		getStemDirection = function(pitch, clef){
			var direction = '';

			//If the current note is on or above the middle staff line set stem as down, otherwise set as up
			if(pitchMappings[clef][pitch] <= staffMiddle){
				direction = 'Down';
			}else{
				direction = 'Up';
			}

			return direction;

		},

		//Rest object to contain rest data and handle rendering a rest
		rest = {
			//Default values for duration and beat for rest object
			duration: 'whole',
			beat: 0,
			width: 33,

			//Duration text to numeric value mapping
			values: { whole: 4, half: 2, quarter: 1, eighth: 0.5 },

			create: function(options){
				var self = this,
				options = options || false;

				//If passed as options reset object default properties
				if(options && options.duration !== undefined) self.duration = options.duration;
				if(options && options.beat !== undefined) self.beat = options.beat;
				
				self.value = self.values[self.duration];
				self.width = rests[self.duration].width;
			},

			render: function(context, position){
				var self = this,
				thisRest = rests[self.duration],
				restImage = thisRest.img;
				
				//render rest image
				context.drawImage(assetManager.getAsset(restImage), position, thisRest.offset.y);
			}
		},

		//Note object to contain note data as well as take care of rendering note object
		note = {
			
			//Mapping note image assets as well as their positining offsets to fit properly on staff lines
			noteImages: {
				whole: { src: assets.whole, offset: '0' },
				halfUp: { src: assets.halfUp, offset: '58' }, 
				halfDown: { src: assets.halfDown, offset: '9' }, 
				quarterUp: { src: assets.quarterUp, offset: '59' }, 
				quarterDown: { src: assets.quarterDown, offset: '-2' },
				eighthUp: { src: assets.eighthUp, offset: '55' },
				eighthDown: { src: assets.eighthDown, offset: '5' } 
			},
			
			//Default pitch and duration
			pitch: 'a4',
			duration: 'whole',
			
			//Default beat for note 
			beat: 0,
			
			//Duration text to numeric value mapping
			values: { whole: 4, half: 2, quarter: 1, eighth: 0.5 },

			//Dimensions of the note image, defaults to whole note image dimensions
			width: 33,
			height: 48,

			//Initialize and render the note
			create: function(options){

				var self = this,
				options = options || false;

				//If passed as options reset object default properties
				if(options && options.pitch !== undefined) self.pitch = options.pitch;
				if(options && options.duration !== undefined) self.duration = options.duration;
				if(options && options.beat !== undefined) self.beat = options.beat;
				self.value = self.values[self.duration];

			},

			//Render the note in it's position in the appropriate measure
			render: function(context, position, clef){
				var self = this,
				
				//If not a whole note, get stem direction based on position on staff
				stemDirection = (self.duration !== 'whole') ? getStemDirection(self.pitch, clef) : '',
				noteImage;

				//set note image
				noteImage = self.noteImages[self.duration+stemDirection];
				
				//render note image
				context.drawImage(assetManager.getAsset(noteImage.src), position, pitchMappings[clef][self.pitch]-noteImage.offset);
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

			score: false,

			//The current measure and beat position on the staff
			currentMeasure: 0,

			//Default images for staff background an measure bars
			image: assets.staff,
			measureBar: assets.measure,

			//Default asset type for tooltip image
			tooltipImage: 'whole',

			//Set the tooltip image for the mouse based on note type and mouse position
			setTooltipImage: function(){
				var self = this,

				//Background image positioning offsets based on note image
				cursorOffsets = {
					'whole': 0,
					'halfUp': 60,
					'halfDown': 10,
					'quarterUp': 60,
					'quarterDown': 0,
					'eighthUp': 60,
					'eighthDown': 1,
					'eraser': 0
				};


				//Set cursor background based on current tooltip
				self.target.css('cursor', 'url('+assets[self.tooltipImage]+') 0 '+cursorOffsets[self.tooltipImage]+', default');
			},

			//Get pitch user is selecting based on mouse position and clef
			getPitchFromPosition: function(clef){
				var self = this,
				thisPitch = false,
				staffOffset = 23;

				//Loop through pitch mappings for this clef to find pitch currently selected by user
				$.each(pitchMappings[clef], function(pitch, position){
					
					//If mouse position falls within pitches position +-5 pixels, set as current pitch
					if(self.mouse.y >=  staffOffset + position - 5 && self.mouse.y <= staffOffset + position + 5){
						thisPitch = pitch;
					}
				});

				return thisPitch;

			},

			//Method to return measure and beat user has clicked on
			getMeasureAndBeatFromPosition: function(){
				var self = this,
				measurePosition = false,
				beatPosition = false;

				//Loop through measures to find measure currently selected by user
				$.each(self.measures, function(measureNum){

					//If the mouse position is between measure start and end, set this measure to current measure
					if(self.mouse.x >= this.start && self.mouse.x <= this.end){
						measurePosition = measureNum;

						//Loop through the current measures beats to find beat currently selected by user
						$.each(this.beats, function(beat){
							
							//If the mouse position is between beat start and end, set this beat as current beat
							if(self.mouse.x >= this.start && self.mouse.x <= this.end){
								beatPosition = beat;
							}
						})
						return;
					} 
				});

				return { measure: measurePosition, beat: beatPosition };

			},

			//Event listener to add note when user clicks on staff
			onMouseClick: function(self){
				var thisPitch = self.getPitchFromPosition(self.clef),
				currentPosition = self.getMeasureAndBeatFromPosition(),
				thisMeasure = (currentPosition.measure !== false) ? currentPosition.measure : self.currentMeasure,
				thisBeat = (currentPosition.beat !== false) ? currentPosition.beat : self.measures[thisMeasure].currentBeat,
				thisBeatValue;

				if(thisMeasure !== false) self.currentMeasure = thisMeasure;
				
				if(currentNoteValue === 'eraser'){
					
					thisBeatValue = self.measures[self.currentMeasure].beats[thisBeat].value;	
					self.addRest(self.measures[self.currentMeasure], thisBeat, thisBeatValue);
				
				//If note falls within the staff length, add note to staff
				}else if(self.currentMeasure < self.measures.length && thisPitch){
					self.addNote({
						pitch: thisPitch,
						duration: currentNoteValue,
						beat: thisBeat
					});	
				}

				//Re-render staff with new note
				self.render();
			},

			//Event listeners to track mouse position within the staff
			onMouseMove: function(self, e){
				var rect = self.theCanvas.getBoundingClientRect();

		        //Assign current client mouse position, relative to this staff canvas object, to staff mouse tracker object
		        self.mouse.x = e.clientX - rect.left;
		        self.mouse.y = (e.clientY+24) - rect.top;

		        //Update the stem position of the tooltip based on current mouse position
		        if(currentNoteValue !== 'whole' && currentNoteValue !== 'eraser'){
		        	if(self.mouse.y-26 >= staffMiddle && self.tooltipImage.search('Up') === -1){
		        		self.tooltipImage = currentNoteValue+'Up';
		        		self.setTooltipImage();
		        	}else if(self.mouse.y-26 < staffMiddle && self.tooltipImage.search('Down') === -1){
		        		self.tooltipImage = currentNoteValue+'Down';
		        		self.setTooltipImage();
		        	}

		        }
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
				if(options && options.score) self.score = options.score;

				//Get the width for the clef symbol and initialize the first measure to render after the clef
				clefWidth = clefs[self.clef].width;
				measureOffset = self.x + clefWidth;
				
				//If a target element has been set, setup canvas and create measures and render
				if(self.target && self.name){

					//Setup the canvas element for this staff
					self.setup();

					//Add all necessary event listeners to staff object
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
								currentBeat: 0,
								beats: {}
							};

							//Default fill with whole rests
							self.addRest(measures[i], 0, 4);
						}
					}
					self.measures = measures;

					//If there is a score, loop through score and enter notes
					for(i = 0; i < self.score.length; i++){
						self.currentMeasure = i;
						$.each(self.score[i], function(beat, note){
							self.addNote({
								beat: beat,
								pitch: note.pitch,
								duration: note.duration
							});
						});
					}

					//Set the initial value for the tooltip, default to a down stem for non-whole notes
					if(currentNoteValue !== 'whole' && currentNoteValue !== 'eraser'){
						self.tooltipImage = currentNoteValue+'Down';
					}else{
						self.tooltipImage = currentNoteValue;
					}
				}
				
			},

			//Render the staff images to the canvas
			render: function(){
				var self = this,
				staffImage = assetManager.getAsset(self.image),
				measureBarImage = assetManager.getAsset(self.measureBar),
				clefImage = assetManager.getAsset(clefs[self.clef].img),
				clefOffset = clefs[self.clef].offset,
				thisMeasure, thisNote, thisRest,
				notePosition, restPosition,
				i;

				//Render clearing background
				self.context.fillStyle = "#FFF";
				self.context.fillRect(0, 0, self.theCanvas.width, self.theCanvas.height);

				//Render staff background image
				self.context.drawImage(staffImage, self.x, self.y, self.width, 90);

				//Render opening bar
				self.context.drawImage(measureBarImage, self.x, self.y);

				//Set initial tooltip style
				self.setTooltipImage();

				//If the staff contains measures, display the correct number of bar lines and create measure data objects
				for(i = 0; i < self.measures.length; i++){
					thisMeasure = self.measures[i];

					self.context.drawImage(measureBarImage, thisMeasure.end, self.y + 1);
					
					//Render any objects for this measure
					$.each(thisMeasure.beats, function(beat, object){
						//If object is defined
						if(object){
							
							//Place the object (note or rest) to center given the position in the current measure
							notePosition = object.start + (((object.end - object.start)/2) - (object.width/2));
							object.render(self.context, notePosition, self.clef);

						}
						
					});	
					
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
				thisMeasure = self.measures[self.currentMeasure],
				paddedWidth = thisMeasure.width-20,
				measuresDivisor;

				//Create the note object
				thisNote.create(n);

				//A note or rest can only be overwritten by a note or rest of equal or lesser value
				if(thisMeasure.beats[thisNote.beat] && thisNote.value > thisMeasure.beats[thisNote.beat].value){
					return;
				}

				//Percentage of the current measure a the current note will occupy based on note value
				measuresDivisor = thisMeasure.value/thisNote.value;

				//Calculate note start and end points based on note value and beat
				thisNote.start = (thisMeasure.start + 15) + (  (paddedWidth/measuresDivisor) * (thisNote.beat/thisNote.value) );
				thisNote.end = thisNote.start +  (paddedWidth/measuresDivisor);

				//Add note to currently selected measure at currently selected beat
				if(thisMeasure.currentBeat <= thisMeasure.value){
					
					thisMeasure.beats[thisNote.beat] = thisNote;
					if(thisNote.beat === thisMeasure.currentBeat) thisMeasure.currentBeat += thisNote.value;

					//Fill out measure with rests if no notes are present
					self.restFillOut(thisMeasure, thisNote.beat, thisNote.value);

				}
		
			},

			//Take a measures list of beat objects and return an array of sorted beats
			sortBeats: function(measure){
				var sortedBeats = [];

				//For if beat corresponds to an object (note or rest), add it to the array to be sorted
				$.each(measure.beats, function(beat, object){
					if(object) sortedBeats.push(beat);
				});

				//Sort numerically ascending
				sortedBeats.sort(function(a,b){return a-b});

				return sortedBeats;
			},

			//Function to add a rest object to a measure
			addRest: function(measure, beat, value){
				var self = this,
				paddedWidth = measure.width -20,
				newRest;

				//Function to create a rest object given the measure position, beat position, and rest value
				function createRest(measure, beat, value){
					var rests = { 4: 'whole', 2: 'half', 1: 'quarter', 0.5 : 'eighth' },
					thisRest = object(rest),
					measuresDivisor;

					thisRest.create({ duration: rests[value], beat: beat });

					//Percentage of the current measure a the current note will occupy based on note value
					measuresDivisor = measure.value/value;

					//Calculate note start and end points based on note value and beat
					thisRest.start = (measure.start + 10) + ( (paddedWidth/measuresDivisor) * (beat/value) );
					thisRest.end = thisRest.start +  (paddedWidth/measuresDivisor);

					return thisRest;
				}

				//Take the initial rest to be added, and check if it can be consolidated with any neighboring rests
				function consolidateRests(rest){
					//Variable to hold the consolidated rest, first set to rest that was added
					var consolidatedRest = rest;

					//Take in a rest and check if it's nearest neighbors are rests
					function checkRests(checkRest){
						var measureObjects = self.sortBeats(measure),
						thisBeat = checkRest.beat,
						thisValue = checkRest.value,
						thisIndex = measureObjects.indexOf(thisBeat.toString()),
						
						//If not the first object in the measure, get the previous object
						prevBeat = (thisIndex > 0) ? measure.beats[measureObjects[thisIndex-1]] : false,
						
						//If not the last object in the measure, get the next object
						nextBeat = (thisIndex < measureObjects.length-1) ? measure.beats[measureObjects[thisIndex+1]] : false,
						consolidatedValue;

						//If next beat is a rest, add the rest values together
						if(nextBeat && nextBeat.duration && !nextBeat.pitch){
							consolidatedValue = parseFloat(thisValue) + parseFloat(nextBeat.value);

							//If the sum of the rests is equal to a possible rest duration, consolidate them
							if((thisValue === 0.5 && consolidatedValue % 1 === 0) || consolidatedValue % 2 === 0){
								//Create consolidated rest and delete rest it is replacing
								consolidatedRest = createRest(measure, thisBeat, consolidatedValue);
								measure.beats[nextBeat.beat] = false;
								
								//Check if newly consolidated rest can also be consolidated with any neighbors
								checkRests(consolidatedRest);
								return;
							}

						//If the previous beat is a rest, add the rest values together
						}

						if(prevBeat && prevBeat.duration && !prevBeat.pitch){
							consolidatedValue = parseFloat(thisValue) + parseFloat(prevBeat.value);
							
							//If the sum of the rests is equal to a possible rest duration, consolidate them
							if((thisValue === 0.5 && consolidatedValue % 1 === 0) || consolidatedValue % 2 === 0){
								//Create consolidated rest and delete rest it is replacing
								consolidatedRest = createRest(measure, prevBeat.beat, consolidatedValue);
								measure.beats[thisBeat] = false;
								
								//Check if newly consolidated rest can also be consolidated with any neighbors
								checkRests(consolidatedRest);
								return;
							}
						//If no neighboring rests return
						}
							
						return;

					}

					checkRests(rest);
					measure.beats[consolidatedRest.beat] = consolidatedRest;
				}

				//Create the new rest, than run to see if new rest can be consolidated with neighboring rests
				newRest = createRest(measure, beat, value);
				consolidateRests(newRest);
			},

			//Fill out the remaining beats in a measure with rests of appropriate size
			restFillOut: function(measure, beat, value){
				var self = this,
				noteFootprint = parseFloat(beat) + parseFloat(value),
				i = measure.value,
				remainingSpace;

				//Start from the end of the measure and work backwards until you hit where notes have been added
				while(i > noteFootprint){
					remainingSpace = i - noteFootprint;

					//If space is large enough to hold half rest, add half rest
					if(remainingSpace/2 >= 1){
						if(!measure.beats[i-2]) self.addRest(measure, i-2, 2);
						i -= 2;

					//If space is large enough to hold quarter rest, add quarter rest
					}else if(remainingSpace/1 >= 1){
						if(!measure.beats[i-1]) self.addRest(measure, i-1, 1);
						i -= 1;

					//If space is large enough to hold eighth rest, add eighth rest
					}else if(remainingSpace/0.5 >= 1){
						if(!measure.beats[i-0.5]) self.addRest(measure, i-0.5, 0.5);
						i -= 0.5;
					}

				}

			}
		};
		
		//return the notation object with public methods	
		return {

			init: function(options){
				var options = options || false,
				target = (options && options.target) ? options.target : $('#fux-notation'),
				staves = ['treble'], 
				count = 0, 
				i, thisStaff, testScore;

				if(options && options.currentNoteValue) currentNoteValue = options.currentNoteValue;

				//Add all assets to the asset cue CHANGE THIS TO ONLY ADD REQUIRED ASSETS TO QUEUE!!!
				$.each(assets, function(asset, path){
					assetManager.queueDownload(path);
				});

				testScore = [
					{ 
						0: { duration: 'half', pitch: 'a4' },
						2: { duration: 'quarter', pitch: 'c5' },
						3: { duration: 'quarter', pitch: 'b4' }
					},
					{ 
						0: { duration: 'eighth', pitch: 'a4' },
						0.5: { duration: 'eighth', pitch: 'g4' },
						2: { duration: 'quarter', pitch: 'g4' }
					}
				];

				//Create and render staves once all required assets have loaded
				assetManager.downloadAll(function(){
					for(i = 0; i < staves.length; i++){
						thisStaff = object(staff);
						thisStaff.create({ clef: staves[i], name: staves[i]+i, target: target, width: 1000, measureLength: 4, score: testScore });

						thisStaff.render();
					}
				});
				
			},
			setNoteValue: function(noteValue){
				currentNoteValue = noteValue;
			}
		}
		
		
	};

	fux.notation = notation();

	return fux;
}(FUX));
