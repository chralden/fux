//Musical notation module
var FUX = (function (fux) {
	
	soundmanager = function(){

		var assets = {
			harp: {
				c2: "audio/harp/harpC2",
				d2: "audio/harp/harpD2",
				e2: "audio/harp/harpE2",
				f2: "audio/harp/harpF2",
				g2: "audio/harp/harpG2",
				a2: "audio/harp/harpA2",
				b2: "audio/harp/harpB2",
				c3: "audio/harp/harpC3",
				d3: "audio/harp/harpD3",
				e3: "audio/harp/harpE3",
				f3: "audio/harp/harpF3",
				g3: "audio/harp/harpG3",
				a3: "audio/harp/harpA3",
				b3: "audio/harp/harpB3",
				c4: "audio/harp/harpC4",
				d4: "audio/harp/harpD4",
				e4: "audio/harp/harpE4",
				f4: "audio/harp/harpF4",
				g4: "audio/harp/harpG4",
				a4: "audio/harp/harpA4",
				b4: "audio/harp/harpB4",
				c5: "audio/harp/harpC5",
				d5: "audio/harp/harpD5",
				e5: "audio/harp/harpE5",
				f5: "audio/harp/harpF5",
				g5: "audio/harp/harpG5",
				a5: "audio/harp/harpA5",
				b5: "audio/harp/harpB5",
			}

		},

		//Timer object to manage timed playback of scored elements
		timer = {

			//Current beat of timer
			beat: 0,

			//Current measure of timer
			measure: 0,

			//Raw time
			time: 0,

			//The actual interval
			interval: false,
			intervalTime: 100,

			//Beats per minute for timer
			bpm: 120, 

			//Update the timer and play any scored notes that are present for current time
			updateTimer: function(seconds){
				var self = this,
				beatsPerSecondInterval = Math.round(1000/(self.bpm/60)/100)*100;

				//If there are still measures to play through, read through the score
				if(self.measure < player.scoreLength){

					//Match current time to BPM interval
					if(self.time % beatsPerSecondInterval === 0){

						//Go through each score and check for the note at the current beat, sound the note if it has a pitch and is not flagged silent
						$.each(player.score, function(name, score){
							if(score && score[self.measure][self.beat] && score[self.measure][self.beat].pitch && !score[self.measure][self.beat].silent) player.play(score[self.measure][self.beat].pitch);
						});

						if(self.beat === 3){
							self.beat = 0;
							self.measure++;

						}else{
							self.beat++;
						}

					}

					self.time += self.intervalTime;

				}else{
					self.stopTimer();
				}
				
			},

			//Start the timer and set the interval
			startTimer: function(){
				var self = this;

				self.interval = setInterval(function(){
					self.updateTimer(1);
				}, self.intervalTime);
			},

			//Stop the timer and reset time
			stopTimer: function(){
				var self = this;

				clearInterval(self.interval);
				self.measure = 0;
				self.beat = 0;
			},

			//Stop the timer interval but maintain current time value
			pauseTimer: function(){
				var self = this;

				clearInterval(self.interval);
			}

		},

		//Player object to create and manage sound objects
		player = {

			//The players current instrument, default to harp
			instrument: 'harp',

			//Object that contains current sounds
			sounds: {},

			//Object to contain the score of notes for timed playback
			score: {},
			scoreLength: 0,

			//Setup the player with current and currently required sounds
			setup: function(){
				var self = this,
				currentInstrument = assets[self.instrument];

				//Go through current instruments pitches and create sound objects with that file
				$.each(currentInstrument, function(pitch, file){
					self.sounds[pitch] = new buzz.sound(file, {
						formats: [ "wav" ],
						preload: true,
						loop: false
					});
				});
			},

			play: function(pitch){
				var self = this;

				//Stop sound in case this pitch has not finished playing yet
				self.sounds[pitch].stop();

				//Play sound
				self.sounds[pitch].play();
			},

			setVolume: function(volume){
				var self = this;

				$.each(self.sounds, function(pitch, sound){
					sound.setVolume(volume);
				});
			}

		};
		
		//return the notation object with public methods	
		return {
			
			//Initialize the sound manager
			init: function(options){
				player.setup();
			},

			//Add a staff score to the players score object
			addScore: function(name, score){
				player.score[name] = score;

				//Set player score length to length of longest score
				if(score.length > player.scoreLength) player.scoreLength = score.length;
			},
			
			//trigger playback of a single pitch
			play: function(pitch){
				player.play(pitch);
			},

			//Route transport control of score playback
			controlPlayback: function(command){
				if(command === 'play'){
					timer.startTimer();
				}else if(command === 'stop'){
					timer.stopTimer();
				}else if(command === 'pause'){
					timer.pauseTimer();
				}
			},

			//Set the players volume
			setVolume: function(volume){
				player.setVolume(volume);
			}
		}
		
		
	};

	fux.soundmanager = soundmanager();

	return fux;
}(FUX));