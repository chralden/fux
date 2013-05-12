//Musical notation module
var FUX = (function (fux) {
	
	var assetmanager = fux.assetmanager,
	assets = assetmanager.getSoundFiles(),
	soundmanager = function(){

		//Timer object to manage timed playback of scored elements
		var timer = {

			//Current beat of timer
			beat: 0,

			//Current measure of timer
			measure: 0,
			startmeasure: 0,

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
				beatsPerSecondInterval = Math.round(1000/(self.bpm/60)/100)*100,
				thisNote;

				//If there are still measures to play through, read through the score
				if(self.measure < player.scoreLength){

					//Match current time to BPM interval
					if(self.time % beatsPerSecondInterval === 0){

						//Go through each score and check for the note at the current beat, sound the note if it has a pitch and is not flagged silent
						$.each(player.score, function(name, score){
							
							if(!score.mute){
								score = score.score;
								thisNote = score[self.measure][self.beat];
								
								if(thisNote && thisNote.pitch && !thisNote.silent){
									
									//If note has an accidental play back with accidental
									if(thisNote.accidental && thisNote.accidental !== 'natural'){
										player.play(thisNote.pitch+thisNote.accidental, beatsPerSecondInterval*thisNote.value);
									}else{
										player.play(thisNote.pitch, beatsPerSecondInterval*thisNote.value);
									}
									
								} 
							}
							
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

				self.measure = self.startmeasure;

				self.interval = setInterval(function(){
					self.updateTimer(1);
				}, self.intervalTime);
			},

			//Stop the timer and reset time
			stopTimer: function(){
				var self = this;

				clearInterval(self.interval);
				self.measure = self.startmeasure;
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
				currentAssets = assets[self.instrument],
				currentInstrument = self.sounds[self.instrument] = {};

				//Go through current instruments pitches and create sound objects with that file
				$.each(currentAssets, function(pitch, file){
					currentInstrument[pitch] = assetmanager.getSound(file);
				});
			},

			//Play a sounds
			play: function(pitch, duration){
				var self = this,
				duration = duration || 500,
				currentInstrument = self.sounds[self.instrument];

				if(pitch.indexOf('flat') !== -1) pitch = self.getEnharmonic(pitch);

				//Stop sound in case this pitch has not finished playing yet
				currentInstrument[pitch].stop();

				//Play sound
				if(self.instrument === 'organ'){
					currentInstrument[pitch].fadeIn((duration/4), function(){
						currentInstrument[pitch].fadeOut((3*duration)/4);
					});
					
				}else{
					currentInstrument[pitch].play();
				}
				
			},

			//Set the global volume by looping through all sounds
			setVolume: function(volume){
				var self = this;

				$.each(self.sounds, function(instrument, instrumentSounds){
					$.each(instrumentSounds, function(pitch, sound){
						sound.setVolume(volume);
					});
				});
			},

			//Set the players instrument
			setInstrument: function(instrument){
				var self = this;

				self.instrument = instrument;

				//If the players sound library doesn't already contain sounds for this instrument, call the setup to create them
				if(!self.sounds[self.instrument]) self.setup();
			},

			toggleMute: function(staff){
				var self = this;

				self.score[staff].mute = !self.score[staff].mute;
			},

			//Get enharmonics for flat pitches to share soundfiles
			getEnharmonic: function(pitch){
				var self = this,
				enharmonics = {
					dflat: 'c',
					eflat: 'd',
					gflat: 'f',
					aflat: 'g',
					bflat: 'a'
				},
				thispitch = pitch.substr(0,1),
				thisnumber = pitch.substr(1,1),
				enharmonic = false;

				enharmonic = enharmonics[thispitch+'flat']+thisnumber+'sharp';

				return enharmonic;

			}

		};
		
		//return the soundmanager object with public methods	
		return {
			
			//Initialize the sound manager
			init: function(options){
				player.setup();
			},

			//Add a staff score to the players score object
			addScore: function(name, score){
				player.score[name] = { score: score, mute: false };

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
			},

			//Set the measure that playback should begin from
			playFromMeasure: function(measure){
				if(measure < player.scoreLength && measure > 0) timer.startmeasure = measure-1;
			},

			setInstrument: function(instrument){
				player.setInstrument(instrument);
			},

			//Return current measure length
			getMeasures: function(){
				return player.scoreLength;
			},

			toggleMute: function(staff){
				player.toggleMute(staff);
			}
		}
		
		
	};

	fux.soundmanager = soundmanager();

	return fux;
}(FUX));