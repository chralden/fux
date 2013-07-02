//Send exercise configuration settings to the exercise view
function renderExercise(req, exercise, res, id, basefirmus){
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
	
	res.render('exercise', { title: 'To Parnassus: Exercise', exerciseFound: exerciseFound, config: JSON.stringify(config), tools: tools, user: req.session.userid });
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

		renderExercise(req, exercise, res, exercise.id, true);
	});
};

//Initialize an exercise based on a user generated score - get score from id
exports.initUserExercise = function(req, res){
	
	var Exercise = require('../models/Exercise'),
		User = require('../models/User')
		userid = req.session.userid;
		id = req.params.id;

	if(userid){

		User.find({ _id: userid, 'exercises': { $in: [id] } }, function(err, user){

			if(err){ renderExercise(req, null, res, id, false); }

			Exercise.findById(id, function(err, exercise){
	
				if(err){ renderExercise(req, null, res, id, false); }

				renderExercise(req, exercise, res, id, false);
			});

		});

	}else{

		renderExercise(req, null, res, id, false);
		
	}

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
		
		res.render('exercises', { title: 'To Parnassus: Exercises', topics: topics, modes: modes, user: req.session.userid });
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
		User = require('../models/User'),
		id = req.params.id,
		userStaves = req.body.staves,
		userid = req.session.userid;

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
			
			if(err) { res.end('error') }; 

			response = { id: thisExercise._id };
			
			if(userID){
				User.update({ _id: userid }, { $push: { exercises: thisExercise._id }}, function(err){
					if(err) { res.end('unable to save to user'); }

					res.end(JSON.stringify(response));
				});	
			}else{
				res.end(JSON.stringify(response));
			}

		});
		
	});	
	
};
