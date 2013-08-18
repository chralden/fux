/* Fill the DB with all the Canti Firmi from configuration JSON files */
var Exercise = require('../models/Exercise'),
	Topic = require('../models/Topic'),
	fs = require('graceful-fs'),
	totalCantusFiles = 0, 
	totalCantiCreated = 0;

function getTopicIDForExercise(exercise, cb){

	Topic.find({ voices: exercise.voices, species: exercise.species }, function(err, topic){

		if(err){ return false; }

		console.log(topic._id);
		return topic._id;

	});

}

function createCantusFirmusesFromPath(path){
	if(path){
		fs.readdir(path, function(err, files){
			if(err){ throw err; }

			files.forEach(function(file){
				var extension = file.split('.')[1];

				if(extension === 'json'){

					//Keep track of all files that should be used to generate a CF
					totalCantusFiles ++;

					fs.readFile(path+file, 'utf8', function (err, data){
						var cantusfirmus;

						if(err){ throw err; }
						
						cantusfirmus = JSON.parse(data);

						//Find existing topics and connect an exercise to a topic
						Topic.findOne({ voices: cantusfirmus.voices, species: cantusfirmus.species }, function(err, topic){

							if(err){ throw err; }

							cantusfirmus.topic = topic._id;

							Exercise.create(cantusfirmus, function(err, exercise){
								//Track number of CFs succesfully created
								totalCantiCreated++;
								
								//If all CFs have been succesfully created, let the world know and end the process
								if(totalCantusFiles === totalCantiCreated){ 
									console.log('All Canti Created!'); 
									process.exit();
								}	
							});

						});
						
					});
				} 
			});
		});
	}
	
}

Topic.find({}, function(err, allTopics){

	if(err){ console.log(err); }

	allTopics.forEach(function(topic){
		var path = 'cfs/'+topic.voices+'-'+topic.species+'/';
		createCantusFirmusesFromPath(path);
	});

});

/*Exercise.create(testJSON, function(err){
	console.log('cantus created');
});*/

//console.log(score);

/*Exercise.find({}, function(err, exercises){
	console.log(exercises);
});*/

/*Exercise.findByIdAndRemove('51b4e8c75012f1cf3a000002', function (err, exercise) {
    console.log(exercise) // null
});*/