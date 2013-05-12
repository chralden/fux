//Musical notation module
var FUX = (function (fux) {
	
	soundmanager = function(){

		var assets = {
			harp: {
				c2: "audio/harp/harpC2",
				c2sharp: "audio/harp/harpC2sharp",
				d2: "audio/harp/harpD2",
				d2sharp: "audio/harp/harpD2sharp",
				e2: "audio/harp/harpE2",
				f2: "audio/harp/harpF2",
				f2sharp: "audio/harp/harpF2sharp",
				g2: "audio/harp/harpG2",
				g2sharp: "audio/harp/harpG2sharp",
				a2: "audio/harp/harpA2",
				a2sharp: "audio/harp/harpA2sharp",
				b2: "audio/harp/harpB2",
				c3: "audio/harp/harpC3",
				c3sharp: "audio/harp/harpC3sharp",
				d3: "audio/harp/harpD3",
				d3sharp: "audio/harp/harpD3sharp",
				e3: "audio/harp/harpE3",
				f3: "audio/harp/harpF3",
				f3sharp: "audio/harp/harpF3sharp",
				g3: "audio/harp/harpG3",
				g3sharp: "audio/harp/harpG3sharp",
				a3: "audio/harp/harpA3",
				a3sharp: "audio/harp/harpA3sharp",
				b3: "audio/harp/harpB3",
				c4: "audio/harp/harpC4",
				c4sharp: "audio/harp/harpC4sharp",
				d4: "audio/harp/harpD4",
				d4sharp: "audio/harp/harpD4sharp",
				e4: "audio/harp/harpE4",
				f4: "audio/harp/harpF4",
				f4sharp: "audio/harp/harpF4sharp",
				g4: "audio/harp/harpG4",
				g4sharp: "audio/harp/harpG4sharp",
				a4: "audio/harp/harpA4",
				a4sharp: "audio/harp/harpA4sharp",
				b4: "audio/harp/harpB4",
				c5: "audio/harp/harpC5",
				c5sharp: "audio/harp/harpC5sharp",
				d5: "audio/harp/harpD5",
				d5sharp: "audio/harp/harpD5sharp",
				e5: "audio/harp/harpE5",
				f5: "audio/harp/harpF5",
				f5sharp: "audio/harp/harpF5sharp",
				g5: "audio/harp/harpG5",
				g5sharp: "audio/harp/harpG5sharp",
				a5: "audio/harp/harpA5",
				a5sharp: "audio/harp/harpA5sharp",
				b5: "audio/harp/harpB5"
			},
			organ: {
				c2: "audio/organ/organC2",
				c2sharp: "audio/organ/organC2sharp",
				d2: "audio/organ/organD2",
				d2sharp: "audio/organ/organD2sharp",
				e2: "audio/organ/organE2",
				f2: "audio/organ/organF2",
				f2sharp: "audio/organ/organF2sharp",
				g2: "audio/organ/organG2",
				g2sharp: "audio/organ/organG2sharp",
				a2: "audio/organ/organA2",
				a2sharp: "audio/organ/organA2sharp",
				b2: "audio/organ/organB2",
				c3: "audio/organ/organC3",
				c3sharp: "audio/organ/organC3sharp",
				d3: "audio/organ/organD3",
				d3sharp: "audio/organ/organD3sharp",
				e3: "audio/organ/organE3",
				f3: "audio/organ/organF3",
				f3sharp: "audio/organ/organF3sharp",
				g3: "audio/organ/organG3",
				g3sharp: "audio/organ/organG3sharp",
				a3: "audio/organ/organA3",
				a3sharp: "audio/organ/organA3sharp",
				b3: "audio/organ/organB3",
				c4: "audio/organ/organC4",
				c4sharp: "audio/organ/organC4sharp",
				d4: "audio/organ/organD4",
				d4sharp: "audio/organ/organD4sharp",
				e4: "audio/organ/organE4",
				f4: "audio/organ/organF4",
				f4sharp: "audio/organ/organF4sharp",
				g4: "audio/organ/organG4",
				g4sharp: "audio/organ/organG4sharp",
				a4: "audio/organ/organA4",
				a4sharp: "audio/organ/organA4sharp",
				b4: "audio/organ/organB4",
				c5: "audio/organ/organC5",
				c5sharp: "audio/organ/organC5sharp",
				d5: "audio/organ/organD5",
				d5sharp: "audio/organ/organD5sharp",
				e5: "audio/organ/organE5",
				f5: "audio/organ/organF5",
				f5sharp: "audio/organ/organF5sharp",
				g5: "audio/organ/organG5",
				g5sharp: "audio/organ/organG5sharp",
				a5: "audio/organ/organA5",
				a5sharp: "audio/organ/organA5sharp",
				b5: "audio/organ/organB5"
			}

		},

		//Timer object to manage timed playback of scored elements
		timer = {

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
					currentInstrument[pitch] = new buzz.sound(file, {
						formats: [ "wav" ],
						preload: true,
						loop: false
					});
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
		
		//return the notation object with public methods	
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