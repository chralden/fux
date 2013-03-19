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

			},
			alto: {

			},
			tenor: {

			},
			bass: {

			}
		},

		//Event listeners to track mouse position and mouse clicks within the notation canvas
		onMouseMove = function(e) {
			mouse.x = e.clientX - theCanvas.offsetLeft;
			mouse.y = e.clientY - theCanvas.offsetTop;
		},

		onMouseClick = function(staffObject){
			
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
			pitches: {
				a: 48
			},
			noteImages: {
				whole: 'images/whole-note.png'
			},
			pitch: 'a',

			//Dimensions of the note image, defaults to whole note image dimensions
			width: 36,
			height: 52,

			create: function(pitch, duration, position){
				this.pitch = pitch;
				this.duration = duration;

				this.render(position);
			},
			render: function(position){
				var self = this,
				noteImage = new Image();

				//Set note background image path
				noteImage.src = self.noteImages[self.duration];

				//Render staff background image
				noteImage.onload = function() {
					context.drawImage(noteImage, position, self.pitches[self.pitch]);
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

			//Initialize a staff with given, x, y, width, and measure numbers, then render
			create: function(x, y, width, measureLength){
				var i, startOfMeasure, measureOffset;

				this.x = x;
				this.y = y;
				this.width = width;
				this.measureLength = measureLength;

				measureOffset = this.x;

				//Initialize all the measure objects
				if(this.measureLength > 0){
					for(i = 0; i < (this.measureLength); i++){
						startOfMeasure = measureOffset;
						measureOffset += this.width/this.measureLength;
						this.measures[i] = {
							start: startOfMeasure,
							end: measureOffset,
							width: this.width/this.measureLength,
							//Time signature value = 4 quarter notes, as all exercises are in common time
							value: 4
						};
					}
				}

				this.render();
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
				};

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
			},

			addNote: function(n){
				var thisNote = object(note),
				thisMeasure = this.measures[this.currentPosition.measure];

				//Place the note to center given the position in the current measure
				notePosition = (thisMeasure.start + (thisMeasure.width/2)) - (thisNote.width/2);

				thisNote.create(n.pitch,n.duration, notePosition);
				this.currentPosition.measure++;
			}
		};
		
		//return the notation object with public methods	
		return {

			init: function(){
				var s1;

				setup();

				s1 = object(staff);
				s1.create(20, 20, 960, 4);

				theCanvas.addEventListener("mousemove", onMouseMove, false);
				theCanvas.addEventListener("click", onMouseClick, false);

				s1.addNote({
					pitch: 'a',
					duration: 'whole'
				});

				s1.addNote({
					pitch: 'a',
					duration: 'whole'
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
