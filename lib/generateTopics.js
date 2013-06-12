/* Fill the DB with all topics from configuration JSON files */
var Topic = require('../models/Topic'),
	fs = require('fs'),
	cfs = 'topics/';

fs.readdir(cfs, function(err, files){
	if(err){ throw err; }

	files.forEach(function(file){
		var extension = file.split('.')[1];

		if(extension === 'json'){
			fs.readFile(cfs+file, 'utf8', function (err, data){
				var topic;

				if(err){ console.log(err); }
				
				topic = JSON.parse(data);

				Topic.create(topic, function(err){
					console.log('topic created');
				});
			});
		} 
	});
});

/*Topic.find({}, function(err, exercises){
	console.log(exercises);
});*/