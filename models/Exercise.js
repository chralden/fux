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

module.exports = db.model('Exercise', schema);