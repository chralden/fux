//Send exercise configuration settings to the exercise view
function renderExercise(exercise, res, id, basefirmus){
	var exerciseFound = true,
		staves = [],
		instruments = ["harp", "organ"],
		config,
		tools;

	//If an exercise is found pass the configuration along to views
	if(exercise !== null){

		config = {
			noteValues: exercise.noteValues,
			clefs: exercise.clefs,
			instruments: instruments,
			staves: exercise.staves,
			id: id,
			basefirmus: basefirmus
		};

		exercise.staves.forEach(function(stave){
			staves.push({ clef: stave.clef, name: stave.name });
		});

		tools = {
			noteTypes: exercise.noteValues,
			ties: (exercise.species === 'fourthspecies' || exercise.species === 'fifthspecies'),
			instruments: instruments,
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

//Initialize a base exercise - get exercise config based on request
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

		renderExercise(exercise, res, exercise.id, true);
	});
};

//Initialize an exercise based on a user generated score - get score from id
exports.initUserExercise = function(req, res){
	
	var Exercise = require('../models/Exercise'),
		id = req.params.id;

	Exercise.findById(id, function(err, exercise){
		
		if(err){ next(err); }

		renderExercise(exercise, res, id, false);
	});

};

//Get all exercises for a topic
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

//Save a users score for an exercise
exports.updateUserExercise = function(req, res){

	var Exercise = require('../models/Exercise'),
		id = req.params.id,
		userStaves = req.body.staves;

	//Update the user exercise with user input
	Exercise.update({ _id: id }, { $set: { staves: userStaves }}, function(err){
		if(err) { res.end('error'); }
		res.end('success');
	});	
	
};

//Save a users score for an exercise
exports.createUserExercise = function(req, res){

	var Exercise = require('../models/Exercise'),
		id = req.params.id,
		userStaves = req.body.staves;

	//Update the user exercise with user input
	Exercise.findById(id, function(err, exercise){
		var thisExercise;

		if(err) { res.end('error') }; 

		thisExercise = exercise.copyExerciseToJSON();

		userStaves.forEach(function(staff){
			delete staff._id;
		});

		thisExercise.staves = userStaves;

		Exercise.create(thisExercise, function(err, thisExercise){
			response = { id: thisExercise._id };
			res.end(JSON.stringify(response));
		});
		
	});	
	
};
