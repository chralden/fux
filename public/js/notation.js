//Musical notation module
var FUX = (function (fux) {
	
	//Put this module in ECMAScript 5 strict mode
	"use strict";

	var soundmanager = fux.soundmanager,
	assetmanager = fux.assetmanager,
	assets = assetmanager.getImageFiles(),
	notation = function(){

		//The current note type for the tooltip
		var currentNoteValue = 'whole',

		//Default asset type for tooltip image
		tooltipImage = 'whole',

		//Exercise ID
		id = false,

		//Is Exercise a base cantus firmus
		basefirmus = true,

		userScore = [],

		//Set the tooltip image for the mouse based on note type and mouse position
		setTooltipImage = function(){
			
			//Background image positioning offsets based on note image
			var cursorOffsets = {
				'whole': 0,
				'halfUp': 60,
				'halfDown': 10,
				'quarterUp': 60,
				'quarterDown': 0,
				'eighthUp': 60,
				'eighthDown': 1,
				'eraser': 0,
				'tieDown': 0,
				'tieUp': 0,
				'sharp': 0,
				'flat': 0,
				'natural': 0
			};


			//Set cursor background based on current tooltip
			$('#fux-notation').css('cursor', 'url('+assets[tooltipImage]+') 0 '+cursorOffsets[tooltipImage]+', default');
		},

		//Mappings of Y positions for notes on staff based on clef
		pitchMappings = {
			treble: {
				'C4': 120,
				'D4': 110,
				'E4': 100,
				'F4': 90,
				'G4': 80,
				'A4': 70,
				'B4': 60,
				'C5': 50,
				'D5': 40,
				'E5': 30,
				'F5': 20,
				'G5': 10,
				'A5': 0
			},
			alto: {
				'D3': 120,
				'E3': 110,
				'F3': 100,
				'G3': 90,
				'A3': 80,
				'B3': 70,
				'C4': 60,
				'D4': 50,
				'E4': 40,
				'F4': 30,
				'G4': 20,
				'A4': 10,
				'B4': 0
			},
			tenor: {
				'B2': 120,
				'C3': 110,
				'D3': 100,
				'E3': 90,
				'F3': 80,
				'G3': 70,
				'A3': 60,
				'B3': 50,
				'C4': 40,
				'D4': 30,
				'E4': 20,
				'F4': 10,
				'G4': 0
			},
			bass: {
				'E2': 120,
				'F2': 110,
				'G2': 100,
				'A2': 90,
				'B2': 80,
				'C3': 70,
				'D3': 60,
				'E3': 50,
				'F3': 40,
				'G3': 30,
				'A3': 20,
				'B3': 10,
				'C4': 0
			}
		},

		//Pixel position for middle of staff, for stem positioning
		staffMiddle = 60,

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

		},

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

			create: function(initoptions){
				var self = this,
				options = initoptions || false;

				//If passed as options reset object default properties
				if(options && options.duration !== undefined){ self.duration = options.duration; } 
				if(options && options.beat !== undefined){ self.beat = options.beat; } 
				
				self.value = self.values[self.duration];
				self.width = rests[self.duration].width;
			},

			render: function(context, position){
				var self = this,
				thisRest = rests[self.duration],
				restImage = thisRest.img;
				
				//render rest image
				context.drawImage(assetmanager.getImage(restImage), position, thisRest.offset.y);
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

			staffLineImage: {
				src: assets.staffLine,
				x: 13,
				y: 23
			},

			accidentalImages: {
				sharp: { src: assets.sharp, x: -35, y: 6 },
				flat: { src: assets.flat, x: -30, y: -36 },
				natural: { src: assets.natural, x: -25, y: -10 }
			},

			tieImages: {
				tieUp: { src: assets.tieUp, x: 35, y: 30 },
				tieDown: { src: assets.tieDown, x: 35, y: -5 }
			},
			
			//Default pitch and duration
			pitch: 'A4',
			duration: 'whole',

			//Is note sharp or flat
			accidental: false,
			
			//Default beat for note 
			beat: 0,

			//Is note tied
			tied: false,
			
			//If note should not sound in playback, for second note in tie, for example
			silent: false,
			
			//Duration text to numeric value mapping
			values: { whole: 4, half: 2, quarter: 1, eighth: 0.5 },

			//Dimensions of the note image, defaults to whole note image dimensions
			width: 33,
			height: 48,

			//Initialize and render the note
			create: function(createoptions){

				var self = this,
				options = createoptions || false;

				//If passed as options reset object default properties
				if(options && options.pitch !== undefined){ self.pitch = options.pitch; } 
				if(options && options.duration !== undefined){ self.duration = options.duration; } 
				if(options && options.beat !== undefined){ self.beat = options.beat; } 
				self.value = self.values[self.duration];

			},

			//Render the note in it's position in the appropriate measure
			render: function(context, position, clef){
				var self = this,
				
				//If not a whole note, get stem direction based on position on staff
				stemDirection = (self.duration !== 'whole') ? getStemDirection(self.pitch, clef) : '',
				noteImage, tieImage, accidentalImage;

				//set note image
				noteImage = self.noteImages[self.duration+stemDirection];

				//If note requires a staff line, render it
				if(self.hasStaffline(clef)){
					context.drawImage(assetmanager.getImage(self.staffLineImage.src), position-self.staffLineImage.x, pitchMappings[clef][self.pitch]+self.staffLineImage.y);
				} 

				//render note image
				context.drawImage(assetmanager.getImage(noteImage.src), position, pitchMappings[clef][self.pitch]-noteImage.offset);

				//If note is tied, render tie
				if(self.tied){
					tieImage = self.tieImages['tie'+stemDirection];
					context.drawImage(assetmanager.getImage(tieImage.src), position+tieImage.x, pitchMappings[clef][self.pitch]+tieImage.y);
				}

				if(self.accidental){
					accidentalImage = self.accidentalImages[self.accidental];
					context.drawImage(assetmanager.getImage(accidentalImage.src), position+accidentalImage.x, pitchMappings[clef][self.pitch]+accidentalImage.y);
				} 
				
			},

			//Determine wether note, given position on clef, requires a staff line
			hasStaffline: function(clef){
				var self = this;

				if(pitchMappings[clef][self.pitch] === 120 || pitchMappings[clef][self.pitch] === 0){
					return true;
				}else{
					return false;
				}

				
			}

		},

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

			//The score for this staff, stored as an array of measure objects
			score: false,

			//Does staff have a cantus firmus to turn into a score
			cantusfirmus: false,

			//If disabled, score is displayed, but notes can neither be added or removed (for the cantus firmus)
			disabled: false,

			//The current measure and beat position on the staff
			currentMeasure: 0,

			//Default images for staff background an measure bars
			image: assets.staff,
			measureBar: assets.measure,

			//Which element of user score is this staff
			scorePos: false,

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
						});
						return;
					} 
				});

				return { measure: measurePosition, beat: beatPosition };

			},

			//Event listener to add note when user clicks on staff
			onMouseClick: function(self){
				var thisPitch = self.getPitchFromPosition(self.clef),
				currentPosition = self.getMeasureAndBeatFromPosition(),
				thisBeat = (currentPosition.beat !== false) ? currentPosition.beat : self.measures[self.currentMeasure].currentBeat,
				thisBeatValue, currentNote, nextNote, writeMeasure;
				
				if(currentPosition.measure !== false){ self.currentMeasure = currentPosition.measure; } 
				currentNote = self.measures[self.currentMeasure].beats[thisBeat];
				
				//Check current tooltip type and respond to click accordingly

				//If an eraser, swap out current note for rest of same value
				if(currentNoteValue === 'eraser'){
					
					thisBeatValue = self.measures[self.currentMeasure].beats[thisBeat].value;	
					self.addRest(self.measures[self.currentMeasure], thisBeat, thisBeatValue);
					
					currentNote = self.measures[self.currentMeasure].beats[thisBeat];
					thisPitch = false;
				
				//If a 'tie', add tie to current note 
				}else if(currentNoteValue === 'tie'){
					
					if(currentNote){
						
						//Determine whether start of the next note would fall in same measure or next measure, then get note in that position
						if(parseInt(currentNote.beat, 10) + parseInt(currentNote.value, 10) < self.measures[self.currentMeasure].value){
							nextNote = self.measures[self.currentMeasure].beats[parseInt(currentNote.beat, 10)+parseInt(currentNote.value, 10)];
						}else{
							nextNote = self.measures[self.currentMeasure+1].beats[(parseInt(currentNote.beat, 10)+parseInt(currentNote.value, 10))-self.measures[self.currentMeasure].value];
						}	
						
						//If there is a next note, and two notes to be tied have the same pitch creat the tie and silence the second note
						if(nextNote && currentNote.pitch === nextNote.pitch){
							currentNote.tied = !currentNote.tied;
							nextNote.silent = !nextNote.silent;
						} 
					}
					

				//If an accidental update the current note to have selected accidental
				}else if(currentNoteValue === 'sharp' || currentNoteValue === 'flat' || currentNoteValue === 'natural'){
					
					if((currentNoteValue === 'sharp' && currentNote.pitch.indexOf('e') === -1 && currentNote.pitch.indexOf('b')) || (currentNoteValue === 'flat' && currentNote.pitch.indexOf('c') === -1 && currentNote.pitch.indexOf('f')) || currentNoteValue === 'natural'){
						if(currentNote){ currentNote.accidental = currentNoteValue; } 

						if(currentNoteValue !== 'natural'){
							soundmanager.play(currentNote.pitch+currentNote.accidental);
						}else{
							soundmanager.play(currentNote.pitch);
						}
					}	
					
				//If a note add note to measure, play sound, and add to score
				}else if(self.currentMeasure < self.measures.length && thisPitch){
					self.addNote({
						pitch: thisPitch,
						duration: currentNoteValue,
						beat: thisBeat
					});	

					//Update current note to newly added note
					currentNote = self.measures[self.currentMeasure].beats[thisBeat];
				
					soundmanager.play(thisPitch);

				}

				if(userScore[self.scorePos].score[self.currentMeasure]){
					userScore[self.scorePos].score[self.currentMeasure].measure.forEach(function(measure, i){
					
						if(parseFloat(measure.beat) === parseFloat(thisBeat)){			
							measure.note.pitch = thisPitch;
							measure.note.duration = currentNoteValue;
						} 
					});
				}else{
					userScore[self.scorePos].score[self.currentMeasure] = { "measure": [{ "beat": parseFloat(thisBeat), "note": { "duration": currentNoteValue, "pitch": thisPitch } }] };
					self.score[self.currentMeasure] = {};
				}

				self.score[self.currentMeasure][thisBeat] = currentNote;
				soundmanager.addScore(self.name, self.score);

				//If the current exercise is one of the base exercises initialize a new user exercise
				if(basefirmus){
					$.post('/exercise/create/'+id, { staves: userScore }, function(response){
						
						id = JSON.parse(response).id;
						basefirmus = false;

						//Once the new user exercise is created navigate to that page
						history.pushState(null, null, location.href+id);
					});

				//If on a user execise update the exercise score
				}else{
					$.post('/exercise/save/'+id, { staves: userScore });
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
		        if(currentNoteValue !== 'whole' && currentNoteValue !== 'eraser' && currentNoteValue !== 'sharp' && currentNoteValue !== 'flat' && currentNoteValue !== 'natural'){
		        	if(self.mouse.y-26 >= staffMiddle && tooltipImage.search('Up') === -1){
		        		tooltipImage = currentNoteValue+'Up';
		        		setTooltipImage();
		        	}else if(self.mouse.y-26 < staffMiddle && tooltipImage.search('Down') === -1){
		        		tooltipImage = currentNoteValue+'Down';
		        		setTooltipImage();
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

				self.theCanvas.width = self.width+30;
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
			create: function(createoptions){

				var self = this,
				options = createoptions || false,
				measures = [],
				score = [],
				clefWidth, startOfMeasure, measureOffset, firmusMeasure, i, j;

				//If passed as options reset default object properties
				if(options && options.x){ self.x = options.x; } 
				if(options && options.y){ self.y = options.y; } 
				if(options && options.width){ self.width = options.width; } 
				if(options && options.height){ self.width = options.height; } 
				if(options && options.measureLength){ self.measureLength = options.measureLength; } 
				if(options && options.target){ self.target = options.target; } 
				if(options && options.name){ self.name = options.name; } 
				if(options && options.clef){ self.clef = options.clef; } 
				if(options && options.cantusfirmus){ self.cantusfirmus = options.cantusfirmus; } 
				if(options && options.disabled){ self.disabled = options.disabled; } 
				if(options && options.scorePos !== false){ self.scorePos = options.scorePos; }

				//Get the width for the clef symbol and initialize the first measure to render after the clef
				clefWidth = clefs[self.clef].width;
				measureOffset = self.x + clefWidth;
				
				//If a target element has been set, setup canvas and create measures and render
				if(self.target && self.name){

					//Setup the canvas element for this staff
					self.setup();

					//Add all necessary event listeners to staff object as long as staff is not disabled
					if(!self.disabled){ self.bindEvents(); } 

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

					//If there is a cantus firmus, loop through it and enter notes and add to score, send score to sound manager
					if(self.cantusfirmus.length > 0){

						for(i = 0; i < self.cantusfirmus.length; i++){
							self.currentMeasure = i;
							firmusMeasure = self.cantusfirmus[i].measure;

							for(j = 0; j < firmusMeasure.length; j++){
								self.addNote({
									beat: firmusMeasure[j].beat,
									pitch: firmusMeasure[j].note.pitch,
									duration: firmusMeasure[j].note.duration
								});
							}

							score[i] = self.measures[i].beats;
						}
	
					//If no cantus firmus initialize an empty score
					}else{
						for(i = 0; i < self.measureLength; i++){
							score[i] = {};
						}
					}

					self.score = score;
					soundmanager.addScore(self.name, self.score);

					//Set the initial value for the tooltip, default to a down stem for non-whole notes
					if(currentNoteValue !== 'whole' && currentNoteValue !== 'eraser' && currentNoteValue !== 'sharp' && currentNoteValue !== 'flat' && currentNoteValue !== 'natural'){
						tooltipImage = currentNoteValue+'Down';
					}else{
						tooltipImage = currentNoteValue;
					}
				}
				
			},

			//Render the staff images to the canvas
			render: function(){
				var self = this,
				staffImage = assetmanager.getImage(self.image),
				measureBarImage = assetmanager.getImage(self.measureBar),
				clefImage = assetmanager.getImage(clefs[self.clef].img),
				clefOffset = clefs[self.clef].offset,
				thisMeasure, notePosition, i;

				//Render clearing background
				self.context.clearRect(0, 0, self.theCanvas.width, self.theCanvas.height);

				//Render staff background image
				self.context.drawImage(staffImage, self.x, self.y, self.width, 90);

				//Render opening bar
				self.context.drawImage(measureBarImage, self.x, self.y);

				//Set initial tooltip style
				setTooltipImage();

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
					if(thisNote.beat === thisMeasure.currentBeat){ thisMeasure.currentBeat += thisNote.value; } 

					//Fill out measure with rests if no notes are present
					self.restFillOut(thisMeasure, thisNote.beat, thisNote.value);

				}
		
			},

			//Take a measures list of beat objects and return an array of sorted beats
			sortBeats: function(measure){
				var sortedBeats = [];

				//For if beat corresponds to an object (note or rest), add it to the array to be sorted
				$.each(measure.beats, function(beat, object){
					if(object){ sortedBeats.push(beat); } 
				});

				//Sort numerically ascending
				sortedBeats.sort(function(a,b){ return a-b; });

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
						if(!measure.beats[i-2]){ self.addRest(measure, i-2, 2); } 
						i -= 2;

					//If space is large enough to hold quarter rest, add quarter rest
					}else if(remainingSpace >= 1){
						if(!measure.beats[i-1]){ self.addRest(measure, i-1, 1); } 
						i -= 1;

					//If space is large enough to hold eighth rest, add eighth rest
					}else if(remainingSpace/0.5 >= 1){
						if(!measure.beats[i-0.5]){ self.addRest(measure, i-0.5, 0.5); } 
						i -= 0.5;
					}

				}

			}
		};
		
		//return the notation object with public methods	
		return {

			init: function(initoptions){
				var options = initoptions || false,
				staves = options.staves || false, 
				target = (options && options.target) ? options.target : $('#fux-notation'),
				i, thisStaff, staffOptions;

				if(options && options.currentNoteValue){ currentNoteValue = options.currentNoteValue; } 

				soundmanager.init();

				id = options.id;
				basefirmus = options.basefirmus;

				if(staves){

					//Create and render staves 
					for(i = 0; i < staves.length; i++){

						userScore[i] = staves[i];

						thisStaff = object(staff);
						staffOptions = { clef: staves[i].clef, name: staves[i].name, target: target, width: (219 * staves[i].length), measureLength: staves[i].length, scorePos: i };
						
						if(staves[i].score){ staffOptions.cantusfirmus = staves[i].score; } 
						if(staves[i].disabled){ staffOptions.disabled = staves[i].disabled; } 

						thisStaff.create(staffOptions);

						thisStaff.render();
					}
				}
				
			},
			setNoteValue: function(noteValue){

				currentNoteValue = noteValue;

				//Reset the tooltip image based on new note value
				if(currentNoteValue !== 'whole' && currentNoteValue !== 'eraser'  && currentNoteValue !== 'sharp'  && currentNoteValue !== 'flat'  && currentNoteValue !== 'natural'){
					tooltipImage = currentNoteValue+'Down';
				}else{
					tooltipImage = currentNoteValue;
				}

				setTooltipImage();
			}
		};
		
		
	};

	fux.notation = notation();

	return fux;
}(FUX));
