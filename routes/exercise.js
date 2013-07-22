//Send exercise configuration settings to the exercise view
function renderExercise(req, exercise, res, id, basefirmus, disabled){
	var exerciseFound = true,
		isDisabled = disabled || false,
		staves = [],
		instruments = ["harp", "organ"],
		name = false,
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

		name = exercise.name || false;

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
	
	res.render('exercise', { title: 'To Parnassus: Exercise', exerciseFound: exerciseFound, config: JSON.stringify(config), name: name, tools: tools, user: req.session.userid, disabled: isDisabled });
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

	function renderDisabledExercise(){

		Exercise.findById(id, function(err, exercise){
	
			if(err){ renderExercise(req, null, res, id, false); }

			//Disable all staves
			exercise.staves.forEach(function(staff){
				staff.disabled = true;
			});

			renderExercise(req, exercise, res, id, false, true);
		});

	}

	if(userid){

		User.find({ _id: userid, 'exercises': { $in: [id] } }, function(err, user){

			if(err){ 

				renderDisabledExercise();

			}else{

				Exercise.findById(id, function(err, exercise){
	
					if(err){ renderExercise(req, null, res, id, false); }

					renderExercise(req, exercise, res, id, false);
				});
			}

		});

	}else{

		renderDisabledExercise();
		
	}

};

//Get all exercises for a topic
exports.listExercisesByTopic = function(req, res){
	var Topic = require('../models/Topic'),
		Exercise = require('../models/Exercise'), 
		User = require('../models/User'),
		allmodes = ["ionian","dorian","phrygian","lydian","mixolydian","aeolian"];

	function getBaseExercise(topic, index, mode){
		var baseExercise = {},
			voiceNames;

		if(topic.voices === 'twovoices'){
			voiceNames = ['Top', 'Bottom'];
			baseExercise.name = ' Cantus Firmus in '+voiceNames[index]+' Voice ';
		}else if(topic.voices === 'threevoices'){
			voiceNames = ['Top', 'Middle', 'Bottom'];
			baseExercise.name = ' Cantus Firmus in '+voiceNames[index]+' Voice ';
		}else if(topic.voices === 'fourvoices'){
			voiceNames = ['Soprano', 'Alto', 'Tenor', 'Bass'];
			baseExercise.name = ' Cantus Firmus in '+voiceNames[index]+' Voice ';
		}
		
		baseExercise.link = '/exercise/'+topic.voices+'-'+topic.species+'/'+mode+'-'+index+'/';

		return baseExercise;

	}

	function renderExerciseList(topics){
		var voiceOrder = ['Two', 'Three', 'Four'],
			speciesOrder = ['First', 'Second', 'Third', 'Fourth', 'Fifth'], 
			orderedTopics = { 'Two Voices': [], 'Three Voices': [], 'Four Voices': [] },
			i, j;

		for(i = 0; i < voiceOrder.length; i++){
			for(j = 0; j < speciesOrder.length; j++){
				topics.forEach(function(topic, index){
					var thisTopic = voiceOrder[i]+' Voices, '+speciesOrder[j]+' Species';
					if(topic.name === thisTopic){
						orderedTopics[voiceOrder[i]+' Voices'].push(topic);
						topics.splice(index, 1);
					}
				});
			}
		}

		res.render('exercises', { title: 'To Parnassus: Exercises', topics: orderedTopics, user: req.session.userid });
	}

	//If user is logged in, get user exercises and display under correct topics
	if(req.session.userid){
		User.findById(req.session.userid, function(err, user){
			
			if(err){ next(err); }

			//Get all user exercises from DB
			Exercise.find({ _id: { $in: user.exercises }}, function(err, userexcercises){

				//Get all topics
				Topic.find({}, function(err, alltopics){
					var topics = [],
					modes, i;

					if(err) { next(err); }

					if(alltopics !== null){
						alltopics.forEach(function(topic){

							modes = [];

							//Loop through all possible modes
							allmodes.forEach(function(mode){
								
								var thisMode = { mode: mode, exercises: [] },
									thisExercise;
								
								//List all exercises base and user, based on number of staves for this topic
								for(i = 0; i < topic.staves; i++){
									thisExercise = {};

									thisExercise.base =  getBaseExercise(topic, i, mode);
									thisExercise.user = [];

									userexcercises.forEach(function(userexercise, index){

										if(userexercise.topic.equals(topic._id) && userexercise.mode === mode && userexercise.firmusVoice === i){
											thisExercise.user.push({ name: userexercise._id, id: userexercise._id });
											userexcercises.splice(index, 1);
										}
									});

									thisMode.exercises.push(thisExercise);
								}
								
								modes.push(thisMode);

							});

							topics.push({ name: topic.name, modes: modes });
						});
					}
					
					renderExerciseList(topics);
					
				});

			});

		});

	//If not logged in, display all base exercises
	}else{

		Topic.find({}, function(err, alltopics){
			var topics = [],
			modes, i;

			if(err) { next(err); }

			if(alltopics !== null){
				alltopics.forEach(function(topic){
					modes = [];

					allmodes.forEach(function(mode){

						var thisMode = { mode: mode, exercises: [] };

						for(i = 0; i < topic.staves; i++){
							thisMode.exercises.push({ base: getBaseExercise(topic, i, mode) });
						}

						modes.push(thisMode);
						
					});
					topics.push({ name: topic.name, modes: modes });
				});
			}

			renderExerciseList(topics);
		});

	}

	
	
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

exports.renameUserExercise = function(req, res){
	var Exercise = require('../models/Exercise'),
		id = req.params.id,
		exerciseName = req.body.title;

		//Update the user exercise's name
		Exercise.update({ _id: id }, { $set: { name: exerciseName }}, function(err){
			if(err) { res.end('error'); }
			res.end('success');
		});

};

//Save a users score for an exercise
exports.createUserExercise = function(req, res){

	var Exercise = require('../models/Exercise'),
		User = require('../models/User'),
		moment = require('moment'),
		id = req.params.id,
		userStaves = req.body.staves,
		userid = req.session.userid,
		now = moment().format("dddd, MMMM Do YYYY");

	//Update the user exercise with user input
	Exercise.findById(id, function(err, exercise){
		var thisExercise;

		if(err) { res.end('error') }; 

		thisExercise = exercise.copyExerciseToJSON();

		userStaves.forEach(function(staff){
			delete staff._id;
		});

		thisExercise.staves = userStaves;
		thisExercise.name = 'My '+thisExercise.mode.charAt(0).toUpperCase()+thisExercise.mode.slice(1)+' - '+now;

		Exercise.create(thisExercise, function(err, thisExercise){
			
			if(err) { res.end('error') }; 

			response = { id: thisExercise._id };
			
			if(userid){
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
