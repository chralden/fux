var userManager = (function(){

	var signup = function(){

		var signUpModal = $('#signupModal'),
			signupForm = $('form#signup'),
			signupURL = '/user/create/';


		signupForm.submit(function(event){

			event.preventDefault();

			signupForm.validate({
				rules:{
					email:{
						required: true,
						email: true
					},
					passwd:{
						required: true,
						minlength: 5
					},
					conpasswd:{
						required: true,
						equalTo: "#passwd"
					},
				},
				errorClass: "help-block",
				highlight:function(element, errorClass, validClass){
					$(element).parents('.control-group').addClass('error');
				},

				unhighlight: function(element, errorClass, validClass){
					$(element).parents('.control-group').removeClass('error');
					$(element).parents('.control-group').addClass('success');
				}
			});

			if(signupForm.valid()){
				$.post(signupURL, signupForm.serialize(), function(response){
					if(response === 'success'){
						signUpModal.modal('toggle');
						location.reload();
					}else if(response === 'in use'){

					}else{
						
					}
				});	
			}
			
		});
	},

	login = function(){

		var loginModal = $('#loginModal'),
			loginForm = $('form#login'),
			loginURL = '/user/login/';


		loginForm.submit(function(event){

			event.preventDefault();

			loginForm.validate({
				rules:{
					logemail:{
						required: true,
						email: true
					},
					logpasswd:{
						required: true,
						minlength: 5
					}
				},
				errorClass: "help-block",
				highlight:function(element, errorClass, validClass){
					$(element).parents('.control-group').addClass('error');
				},

				unhighlight: function(element, errorClass, validClass){
					$(element).parents('.control-group').removeClass('error');
					$(element).parents('.control-group').addClass('success');
				}
			});

			if(loginForm.valid()){
				$.post(loginURL, loginForm.serialize(), function(response){
					var emailinput = $('#logemail'),
						passinput = $('#logpasswd'),
						message = $('.messages');

					if(response === 'success'){
						loginModal.modal('toggle');
						location.reload();
					}else{

						if(response === 'email not recognized'){
							emailinput.parents('.control-group').removeClass('success');
							emailinput.parents('.control-group').addClass('error');
							message.html('Email address not recognized as a registered user.');
						}else if(response === 'password not recognized'){
							passinput.parents('.control-group').removeClass('success');
							passinput.parents('.control-group').addClass('error');
							message.html('Incorrect password.');
						}else{

						}
						
					}
				});	
			}
			
		});

	};

	return {
		signup: signup,
		login: login
	};

}());

$(function(){
	userManager.signup();
	userManager.login();
});