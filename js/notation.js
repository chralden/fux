//Musical notation module
var FUX = (function (fux) {
	
	var notation = function(){
		
		//The canvas element
		var theCanvas,

		//the canvas "context"
		context,

		//Track the users mouse
		mouse = { x: 0, y: 0 },

		//The dimensions of the canvas element
		cWidth,
		cHeight,

		//objects for rendering staves and notes
		staff,
		note,

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

		getPitchFromPosition = function(clef){
			var thisPitch = false,
			staffOffset = 23;

			$.each(pitchMappings[clef], function(pitch, position){
				if(mouse.y - staffOffset >= position - 5 && mouse.y - staffOffset <= position + 5){
					thisPitch = pitch;
				}
			});

			return thisPitch;
		},

		//Event listeners to track mouse position and mouse clicks within the notation canvas
		onMouseMove = function(e) {
			mouse.x = e.clientX - theCanvas.offsetLeft;
			mouse.y = e.clientY - theCanvas.offsetTop;

		},

		//Setup the Canvas
		setup = function(){
			theCanvas = document.getElementById("fux-notation");
			context = theCanvas.getContext("2d");

			cWidth = theCanvas.width;
			cHeight = theCanvas.height;
		};

		//an object to render a note to the canvas
		note = {
			noteImages: {
				whole: 'images/whole-note.png'
			},
			pitch: 'a4',

			//Dimensions of the note image, defaults to whole note image dimensions
			width: 33,
			height: 48,

			//Initialize and render the note
			create: function(pitch, duration, position, clef){
				this.pitch = pitch;
				this.duration = duration;

				this.render(position, clef);
			},

			//Render the note in it's position in the appropriate measure
			render: function(position, clef){
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
			//Default X position, Y position, width, and height for a musical staff
			x: 0,
			y: 0,
			width: 500,
			height: 90,

			//Clef type of the staff, defaults as treble
			clef: 'treble',

			//Default number of measures 
			measureLength: 4,
			measures: [],

			//The current measure and beat position on the staff
			currentPosition: {
				measure: 0,
				beat: 0
			},

			//Default images for staff background an measure bars
			image: 'images/stave1.jpg',
			measureBar: 'images/measure-delim.png',

			onMouseClick: function(self){
				thisPitch = getPitchFromPosition(self.clef)
				if(self.currentPosition.measure < self.measures.length && thisPitch){
					self.addNote({
						pitch: thisPitch,
						duration: currentNoteValue
					});	
				}
			},

			//Initialize a staff with given, x, y, width, and measure numbers, then render
			create: function(x, y, width, measureLength){
				var self = this,
				i, startOfMeasure, measureOffset;

				self.x = x;
				self.y = y;
				self.width = width;
				self.measureLength = measureLength;

				measureOffset = self.x;

				theCanvas.addEventListener("click", 
											function(){
												self.onMouseClick(self);
											}, 
											false);

				//Initialize all the measure objects
				if(self.measureLength > 0){
					for(i = 0; i < (self.measureLength); i++){
						startOfMeasure = measureOffset;
						measureOffset += self.width/self.measureLength;
						self.measures[i] = {
							start: startOfMeasure,
							end: measureOffset,
							width: self.width/self.measureLength,
							//Time signature value = 4 quarter notes, as all exercises are in common time
							value: 4
						};
					}
				}

				self.render();
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
					context.drawImage(staffImage, self.x, self.y, self.width, self.height);

					//Render bar lines
					measureBarImage.onload = function() {
						var i;

						//Render opening bar
						context.drawImage(measureBarImage, self.x, self.y);

						//If the staff contains measures, display the correct number of bar lines and create measure data objects
						for(i = 0; i < self.measures.length; i++){
							context.drawImage(measureBarImage, self.measures[i].end, self.y + 1);
						}

					};
				};
	
			},

			addNote: function(n){
				var self = this,
				thisNote = object(note),
				thisMeasure = this.measures[self.currentPosition.measure];

				//Place the note to center given the position in the current measure
				notePosition = (thisMeasure.start + (thisMeasure.width/2)) - (thisNote.width/2);

				thisNote.create(n.pitch, n.duration, notePosition, self.clef, self.y);
				self.currentPosition.measure++;
			}
		};
		
		//return the notation object with public methods	
		return {

			init: function(){
				var s1;

				setup();

				s1 = object(staff);
				s1.create(20, 40, 960, 4);

				theCanvas.addEventListener("mousemove", onMouseMove, false);
				
			}
		}
		
		
	};

	fux.notation = notation();

	return fux;
}(FUX));

$(function(){
	FUX.notation.init();
});
