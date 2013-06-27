var mongoose = require('mongoose'),
	db = mongoose.createConnection('mongodb://localhost/fux'),
	schema;

var schema = new mongoose.Schema({
	mode: String,
	voices: String,
	species: String,
	firmusVoice: Number,
	noteValues: [String],
	instruments: [String],
	clefs: [String],
	staves: [{
		clef: String,
		name: String,
		length: Number,
		disabled: Boolean,
		score: [
			{ measure: [{ beat: Number, note: { duration: String, pitch: String } }] }
		]
	}]
});

schema.methods.copyExerciseToJSON = function(){
	var oldExercise = this.toJSON(),
	newExercise;

	delete oldExercise._id;
	delete oldExercise.__v;

	oldExercise.staves.forEach(function(staff){
		delete staff._id;

		staff.score.forEach(function(measure){
			delete measure._id;

			measure.measure.forEach(function(beat){
				delete beat._id;
			});
		});
	});

	newExercise = oldExercise;
	return newExercise;

};

module.exports = db.model('Exercise', schema);