var Exercise = require('../models/Exercise');

exports.initExercise = function(req, res){
	
	//Get the topic and and exercise details from request
	var topic = req.params.topic.split('-'),
		exercise = req.params.exercise.split('-'),
		voices = topic[0],
		species = topic[1],
		mode = exercise[0],
		firmusVoice = exercise[1];

	//Search for a matching exercise in DB
	Exercise.findOne({ mode: mode, voices: voices, species: species, firmusVoice: parseInt(firmusVoice, 10) }, function(err, exercise){
		var config, 
		exerciseFound = true;

		if(err){ next(err); }

		//If an exercise is found pass the configuration along to views
		if(exercise !== null){
			config = {
				noteValues: exercise.noteValues,
				clefs: exercise.clefs,
				instruments: exercise.instruments,
				staves: exercise.staves
			};
		
		//If not found alert views
		}else{
			exerciseFound = false;
			config = {};
		}
		
		res.render('exercise', { title: 'To Parnassus: Exercise', exerciseFound: exerciseFound, config: JSON.stringify(config) });
	});
};

exports.initUserExercise = function(req, res){
	
	var id = req.params.id;

	Exercise.findById(id, function(err, exercise){
		var exerciseFound = true,
			config, 
			tools;

		if(err){ next(err); }

		//If an exercise is found pass the configuration along to views
		if(exercise !== null){
			
			config = {
				noteValues: exercise.noteValues,
				clefs: exercise.clefs,
				instruments: exercise.instruments,
				staves: exercise.staves
			};

			tools = {
				noteTypes: exercise.noteValues,
				ties: (exercise.species === 'fourthspecies' || exercise.species === 'fifthspecies'),
				instruments: exercise.instruments,
				staves: exercise.staves.length
			};
		
		//If not found alert views
		}else{
			exerciseFound = false;
			config = {};
			tools = {};
		}
		
		res.render('exercise', { title: 'To Parnassus: Exercise', exerciseFound: exerciseFound, config: JSON.stringify(config), tools: tools });
	});

};