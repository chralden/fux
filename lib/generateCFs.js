/* Fill the DB with all the Canti Firmi from configuration JSON files */
var Exercise = require('../models/Exercise'),
	Topic = require('../models/Topic'),
	fs = require('fs'),
	cfs = 'cfs/';

function getTopicIDForExercise(exercise, cb){

	Topic.find({ voices: exercise.voices, species: exercise.species }, function(err, topic){

		if(err){ return false; }

		console.log(topic._id);
		return topic._id;

	});

};

fs.readdir(cfs, function(err, files){
	if(err){ throw err; }

	files.forEach(function(file){
		var extension = file.split('.')[1];

		if(extension === 'json'){
			fs.readFile(cfs+file, 'utf8', function (err, data){
				var cantusfirmus;

				if(err){ throw err; }
				
				cantusfirmus = JSON.parse(data);

				//Find existing topics and connect an exercise to a topic
				Topic.findOne({ voices: cantusfirmus.voices, species: cantusfirmus.species }, function(err, topic){

					if(err){ throw err; }

					cantusfirmus.topic = topic._id;

					Exercise.create(cantusfirmus, function(err, exercise){
						console.log('cantus created');
					});

				});
				
			});
		} 
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