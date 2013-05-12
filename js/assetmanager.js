//Musical notation module
var FUX = (function (fux) {
	
	assetmanager = function(){

		var requiredImages = ['staff','measure','staffLine','tieUp','tieDown','sharp','flat','natural','eraser','wholeRest','quarterRest','eighthRest'],
		assets = {
			
			images: {
				//Staff and Measure assets
				staff: 'images/staff.png',
				measure: 'images/measure-delim.png',
				staffLine: 'images/staff-line.png',

				//Note assets
				whole: 'images/whole-note.png',
				halfUp: 'images/half-note-up.png',
				halfDown: 'images/half-note-down.png',
				quarterUp: 'images/quarter-note-up.png',
				quarterDown: 'images/quarter-note-down.png',
				eighthUp: 'images/eighth-note-up.png',
				eighthDown: 'images/eighth-note-down.png',

				//Note extras - ties and accidentals
				tieUp: 'images/tie-up.png',
				tieDown: 'images/tie-down.png',
				sharp: 'images/sharp.png',
				flat: 'images/flat.png',
				natural: 'images/natural.png',

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
			sounds: {}

		},

		manager = {
			//The cue of assets to download
			downloadQueue: [],
			backgroundQueue: [],

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

			//Add path to downloadQueue
			queueDownload: function(path){
				this.downloadQueue.push(path);
			},

			//Add path to the background queue
			queueBackgroundDownload: function(path){
				this.backgroundQueue.push(path);
			},

			//Generate the required sound files based on the sound type
			createSoundFiles: function(sound){
				var files = {},
				pitches = ['A','B','C','D','E','F','G'],
				lowpitch = 2,
				highpitch = 5,
				i,j,thisPitch

				for(i = lowpitch; i <= highpitch; i++){
					for(j = 0; j < pitches.length; j++){
						thisPitch = pitches[j];
						files[thisPitch+i] = "audio/"+sound+"/"+sound+thisPitch+i;
						if(thisPitch !== 'B' && thisPitch !== 'E') files[thisPitch+i+'sharp'] = "audio/"+sound+"/"+sound+thisPitch+i+'sharp';
					}
				}

				return files;
			},

			//Go through all assets, add load eventlistener with callback, and create IMG object
			downloadAll: function(downloadCallback){
				var self = this,
				i, path, img, sound;

				//If there are no assets to load execute callback immediately
				if(self.downloadQueue.length === 0) downloadCallback();

				for(i = 0; i < self.downloadQueue.length; i++){
					path = self.downloadQueue[i];
					
					//If asset is not an audio file
					if(path.indexOf('audio') === -1){
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

					}else{
						sound = new buzz.sound(path, {
							formats: [ "wav" ],
							preload: true,
							loop: false
						});

						sound.bind('canplaythrough', function(){
							self.downloadCount++;
							if(self.isDone()){
								downloadCallback();
							}
						});

						self.cache[path] = sound;

					}
					
				}

			},

			backgroundDownload: function(){
				var self = this,
				i, path, img, sound;

				for(i = 0; i < self.backgroundQueue.length; i++){
					path = self.backgroundQueue[i];
					
					//If asset is not an audio file
					if(path.indexOf('audio') === -1){
						img = new Image();
						self.cache[path] = img;

					}else{
						sound = new buzz.sound(path, {
							formats: [ "wav" ],
							preload: true,
							loop: false
						});

						self.cache[path] = sound;

					}
					
				}
			}

		};
		
		//return the assetmanager object with public methods	
		return {
			
			//Initialize the asset manager and execute the callback whenever all assets are downloaded
			init: function(options, callback){
				var options = options || false,
				images = options.images || [],
				sounds = options.sounds || [],
				thisImage, requiredSounds, backgroundSounds, i;

				//Add all base images to download queue
				for(i = 0; i < requiredImages.length; i++){
					manager.queueDownload(assets.images[requiredImages[i]]);
				}

				//Add any images required for this specific excercise to the download queue
				for(i = 0; i < images.length; i++){
					thisImage = images[i];
					if(thisImage === 'half' || thisImage === 'quarter' || thisImage === 'eighth'){
						manager.queueDownload(assets.images[thisImage+'Up']);
						manager.queueDownload(assets.images[thisImage+'Down']);
					}else{
						manager.queueDownload(assets.images[thisImage]);
					}
				}

				//Create all images assets files, and add the default sound to the download queue
				for(i = 0; i < sounds.length; i++){
					assets.sounds[sounds[i]] = manager.createSoundFiles(sounds[i]);

					if(i === 0){
						requiredSounds = assets.sounds[sounds[i]];
					}else{
						backgroundSounds = assets.sounds[sounds[i]];
					}
				}

				//Add all required sounds to the download queue
				$.each(requiredSounds, function(pitch, path){
					manager.queueDownload(path);
				});

				//Load secondary sounds in the background
				$.each(backgroundSounds, function(pitch, path){
					manager.queueBackgroundDownload(path);
				});

				manager.downloadAll(callback);
				manager.backgroundDownload();

			},

			//Return all image file paths
			getImageFiles: function(){
				return assets.images;
			},

			//Return an image object
			getImage: function(src){
				return manager.getAsset(src);
			},

			//Return all sound file paths
			getSoundFiles: function(){
				return assets.sounds;
			},

			//Return a sound object
			getSound: function(src){
				return manager.getAsset(src);
			} 
			
		}
		
		
	};

	fux.assetmanager = assetmanager();

	return fux;
}(FUX));