//Musical notation module
var FUX = (function (fux) {
	
	var notation = function(){
		
		//The canvas element
		var theCanvas,

		//the canvas "context"
		context,

		//The dimensions of the canvas element
		cWidth,
		cHeight,

		//objects for rendering staves and notes
		staff,
		note,

		//Setup the Canvas
		setup = function(){
			theCanvas = document.getElementById("fux-notation");
			context = theCanvas.getContext("2d");

			cWidth = theCanvas.width;
			cHeight = theCanvas.height;
		};

		//an object to render a staff to the page
		staff = {
			//Default X position, Y position, width, and height for a musical staff
			x: 0,
			y: 0,
			width: 500,
			height: 90,

			//Default number of measures 
			measures: 4,

			//Default images for staff background an measure bars
			image: 'images/stave1.jpg',
			measureBar: 'images/measure-delim.png',

			//Initialize a staff with given, x, y, width, and measure numbers, then render
			create: function(x, y, width, measures){
				this.x = x;
				this.y = y;
				this.width = width;
				this.measures = measures;

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
					var i,
					measureOffset = self.x;

					//Render opening bar
					context.drawImage(measureBarImage, self.x, self.y);

					//If the staff contains measures, display the correct number of bar lines
					if(self.measures > 0){
						for(i = 0; i < (self.measures - 1); i++){
							measureOffset += self.width/self.measures;
							context.drawImage(measureBarImage, measureOffset, self.y + 1);
						}
					}

					//Render closing bar
					context.drawImage(measureBarImage, self.x + self.width , self.y+2, 4, 88);
				};

				
				
			}
		};

		
		//return the notation object with public methods	
		return {

			init: function(){
				var s1,s2;

				setup();

				s1 = object(staff);
				s1.create(20, 20, 960, 5);
			}
		}
		
		
	};

	fux.notation = notation();

	return fux;
}(FUX));

$(function(){
	FUX.notation.init();
});
