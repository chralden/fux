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

			},
			tenor: {

			},
			bass: {

			}
		},

		//an object to render a note to the canvas
		note = {
			noteImages: {
				whole: 'images/whole-note.png'
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
				context = (options && options.context) ? options.context : false,
				position = (options && options.position) ? options.position : false,
				clef = (options && options.clef) ? options.clef : false;

				if(options && options.pitch !== undefined) self.pitch = options.pitch;
				if(options && options.duration !== undefined) self.duration = options.duration;

				if(context && position && clef) self.render(context, position, clef);
			},

			//Render the note in it's position in the appropriate measure
			render: function(context, position, clef){
				var self = this,
				noteImage = new Image();

				//Set note background image path
				noteImage.src = self.noteImages[self.duration];

				//Render staff background image
				noteImage.onload = function() {
					context.drawImage(noteImage, position, pitchMappings[clef][self.pitch]);
				};
			},

			renderFree: function(duration, x, y){
				var self = this,
				noteImage = new Image();

				//Set note background image path
				noteImage.src = self.noteImages[duration];

				//Render staff background image
				noteImage.onload = function() {
					context.drawImage(noteImage, x, y);
				};

			}

		};

		//an object to render a staff to the canvas
		staff = {
			
			//The canvas element
			theCanvas: '',

			//The canvas "context"
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
			image: 'images/stave1.jpg',
			measureBar: 'images/measure-delim.png',

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

			onMouseClick: function(self){
				thisPitch = self.getPitchFromPosition(self.clef);
				
				if(self.currentMeasure < self.measures.length && thisPitch){
					self.addNote({
						pitch: thisPitch,
						duration: currentNoteValue
					});	
				}
			},

			//Event listeners to track mouse position and mouse clicks within the notation canvas
			onMouseMove: function(self, e){
				var rect = self.theCanvas.getBoundingClientRect();

		        self.mouse.x = e.clientX - rect.left;
		        self.mouse.y = e.clientY - rect.top;
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

				self.theCanvas.addEventListener("mouseover", function(){
					$(self.theCanvas).bind("mousemove", function(e){
						self.onMouseMove(self, e);
					});
				});

				self.theCanvas.addEventListener("mouseout", function(){
					$(self.theCanvas).unbind("mousemove", function(e){
						self.onMouseMove(self, e);
					});
				});

				//theCanvas.addEventListener("mousemove", onMouseMove, false);
				self.theCanvas.addEventListener("click", 
											function(){
												self.onMouseClick(self);
											}, 
											false);
			},

			//Initialize a staff with given, x, y, width, and measure numbers, then render
			create: function(options){

				var self = this,
				options = options || false,
				measures = [],
				i, startOfMeasure, measureOffset;

				//If passed as options reset default object properties
				if(options && options.x) self.x = options.x;
				if(options && options.y) self.y = options.y;
				if(options && options.width) self.width = options.width;
				if(options && options.height) self.width = options.height;
				if(options && options.measureLength) self.measureLength = options.measureLength;
				if(options && options.target) self.target = options.target;
				if(options && options.name) self.name = options.name;

				measureOffset = self.x;
				
				//If a target element has been set, setup canvas and create measures and render
				if(self.target && self.name){

					self.setup();

					self.bindEvents();

					//Initialize all the measure objects
					if(self.measureLength > 0){
						for(i = 0; i < (self.measureLength); i++){
							startOfMeasure = measureOffset;
							measureOffset += self.width/self.measureLength;
							measures[i] = {
								start: startOfMeasure,
								end: measureOffset,
								width: self.width/self.measureLength,
								//Time signature value = 4 quarter notes, as all exercises are in common time
								value: 4
							};
						}
					}
					self.measures = measures;
					self.render();
				}
				
			},

			//Render the staff images to the canvas
			render: function(){
				var self = this,
				staffImage = new Image(),
				measureBarImage = new Image();

				//Set staff background and bar line image paths
				staffImage.src = self.image;
				measureBarImage.src = self.measureBar;

				//Render staff background image
				staffImage.onload = function() {
					self.context.drawImage(staffImage, self.x, self.y, self.width, 90);

					//Render bar lines
					measureBarImage.onload = function() {
						var i;

						//Render opening bar
						self.context.drawImage(measureBarImage, self.x, self.y);

						//If the staff contains measures, display the correct number of bar lines and create measure data objects
						for(i = 0; i < self.measures.length - 1; i++){
							self.context.drawImage(measureBarImage, self.measures[i].end, self.y + 1);
						}

						self.context.drawImage(measureBarImage, self.x + self.width - 4, self.y + 2);
					};
				};
	
			},

			addNote: function(n){
				var self = this,
				thisNote = object(note),
				thisMeasure = self.measures[self.currentMeasure];

				//Place the note to center given the position in the current measure
				notePosition = (thisMeasure.start + (thisMeasure.width/2)) - (thisNote.width/2);

				thisNote.create({ context: self.context, pitch: n.pitch, duration: n.duration, position: notePosition, clef: self.clef });
				
				self.currentMeasure++;
			}
		};
		
		//return the notation object with public methods	
		return {

			init: function(){
				var s1, s2, s3, s4;

				s1 = object(staff);
				s2 = object(staff);
				s3 = object(staff);

				s1.create({ name: 'treble1', target: $('#fux-notation'), width: 960, measureLength: 5 });
				s2.create({ name: 'treble2', target: $('#fux-notation'), width: 960, measureLength: 5 });
			}
		}
		
		
	};

	fux.notation = notation();

	return fux;
}(FUX));

$(function(){
	FUX.notation.init();
});
