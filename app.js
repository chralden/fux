
// Module dependencies.
var express = require('express'), 
	routes = require('./routes'),
	exercise = require('./routes/exercise'),
	user = require('./routes/user'),
 	http = require('http'),
  	path = require('path'),
	app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('env', 'development');
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '/public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Homepage
app.get('/', routes.index);

//Get all exercises
app.get('/exercises/', exercise.listExercisesByTopic);

//Get base exercise
app.get('/exercise/:topic/:exercise', exercise.initExercise);

//Get exercise saved by user
app.get('/exercise/:topic/:exercise/:id', exercise.initUserExercise);

//Post exercise created by user
app.post('/exercise/save/:id', exercise.updateUserExercise);

//Post exercise created by user from base exercise
app.post('/exercise/create/:id', exercise.createUserExercise);

//Post new title for user exercise
app.post('/exercise/name/:id', exercise.renameUserExercise);

//Post user registration to create new user
app.post('/user/create/', user.createUser);

//Post user login to verify login
app.post('/user/login/', user.login);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
