function renderExercise(exercise, res){
	var exerciseFound = true,
		staves = [],
		config,
		tools;

	//If an exercise is found pass the configuration along to views
	if(exercise !== null){
		
		config = {
			noteValues: exercise.noteValues,
			clefs: exercise.clefs,
			instruments: exercise.instruments,
			staves: exercise.staves
		};

		exercise.staves.forEach(function(stave){
			staves.push({ clef: stave.clef, name: stave.name });
		});

		tools = {
			noteTypes: exercise.noteValues,
			ties: (exercise.species === 'fourthspecies' || exercise.species === 'fifthspecies'),
			instruments: exercise.instruments,
			staves: staves
		};
	
	//If not found alert views
	}else{
		exerciseFound = false;
		config = {};
		tools = {};
	}
	
	res.render('exercise', { title: 'To Parnassus: Exercise', exerciseFound: exerciseFound, config: JSON.stringify(config), tools: tools });
}


exports.initExercise = function(req, res){
	
	//Get the topic and and exercise details from request
	var Exercise = require('../models/Exercise'),
		topic = req.params.topic.split('-'),
		exercise = req.params.exercise.split('-'),
		voices = topic[0],
		species = topic[1],
		mode = exercise[0],
		firmusVoice = exercise[1];

	//Search for a matching exercise in DB
	Exercise.findOne({ mode: mode, voices: voices, species: species, firmusVoice: parseInt(firmusVoice, 10) }, function(err, exercise){
		if(err){ next(err); }

		renderExercise(exercise, res);
	});
};

exports.initUserExercise = function(req, res){
	
	var Exercise = require('../models/Exercise'),
		id = req.params.id;

	Exercise.findById(id, function(err, exercise){
		
		if(err){ next(err); }

		renderExercise(exercise, res);
	});

};

exports.listExercisesByTopic = function(req, res){
	var Topic = require('../models/Topic');

	Topic.find({}, function(err, alltopics){
		var topics = [],
		modes = ["dorian"];

		if(err) { next(err); }

		if(alltopics !== null){
			alltopics.forEach(function(topic){
				topics.push(topic);
			});
		}
		
		res.render('exercises', { title: 'To Parnassus: Exercises', topics: topics, modes: modes });
	});
	
	
};