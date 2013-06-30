var mongoose = require('mongoose'),
	db = mongoose.createConnection('mongodb://localhost/fux'),
	schema;


var schema = new mongoose.Schema({
	email: String,
	password: String,
	exercises: [Schema.Types.ObjectId]
});

module.exports = db.model('User', schema);