var userManager = (function(){

	var signup = function(){

		var signUpModal = $('#signupModal'),
			signupForm = $('form#signup'),
			userBar = $('.userbar'),
			profileBar = $('.profile'),
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
						userBar.hide();
						profileBar.show();
					}else{

					}
				});	
			}
			
		});
	};

	return {
		signup: signup
	};

}());

$(function(){
	userManager.signup();
});