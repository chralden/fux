/* Fill the DB with all the Canti Firmi from configuration JSON files */
var Exercise = require('../models/Exercise'),
	fs = require('fs'),
	cfs = 'cfs/';

fs.readdir(cfs, function(err, files){
	if(err){ throw err; }

	files.forEach(function(file){
		var extension = file.split('.')[1];

		if(extension === 'json'){
			fs.readFile(cfs+file, 'utf8', function (err, data){
				var cantusfirmus;

				if(err){ throw err; }
				
				cantusfirmus = JSON.parse(data);

				Exercise.create(cantusfirmus, function(err){
					console.log('cantus created');
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