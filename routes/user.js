var User = require('../models/User');

//Create a new user
exports.createUser = function(req, res){

	var userinfo = {
		email: req.body.email,
		password: req.body.passwd
	};

	User.create(userinfo, function(err, thisuser){
		if(err){
			if(11000 === err.code || 11001 === err.code){ 
				res.end('in use'); 
			}else{
				res.end('error'); 
			}
		}else{
			req.session.userid = thisuser._id;
			res.end('success');
		}

	});

};

exports.login = function(req, res){

	var userinfo = {
		email: req.body.logemail,
		password: req.body.logpasswd
	};

	User.findOne({ email: userinfo.email }, function(err, user) {
        if(err){ 
        	res.end('email not recognized'); 
       	}else{
       		
       		if(user){
       			user.comparePassword(userinfo.password, function(err, isMatch) {
		            if(err){ 
		            	res.end('error');
		            }else{
		            	if(isMatch){
		            		req.session.userid = user._id;
		            		res.end('success');
		            	}else{
		            		res.end('password not recognized');
		            	}
		            }
		        });

       		}else{
       			res.end('email not recognized');
       		}
       		
       	}

    });

};