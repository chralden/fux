var mongoose = require('mongoose'),
	db = mongoose.createConnection('mongodb://localhost/fux'),
	schema;


var schema = new mongoose.Schema({
	name: String,
	voices: String,
	species: String,
	staves: Number
});

module.exports = db.model('Topic', schema);