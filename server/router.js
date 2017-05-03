function run(app, passport, userModel){
	var dataToTemplate = {
	};

	app.use(function(req, res, next){
		dataToTemplate = {
			auth:req.isAuthenticated()
		}
		next();
	});

	app.get("/", function(req, res){
		dataToTemplate.page = "main";
		dataToTemplate.message = req.flash('loginMessage');

		res.render('template',  dataToTemplate);
	})

	app.get("/about", function(req, res){
		dataToTemplate.page = "about";
		res.render('template',  dataToTemplate);
	})

	app.get("/game", isLoggedIn, function(req, res){
		dataToTemplate.page = "game";
		res.render('template', dataToTemplate );
	})

    app.get("/profile", isLoggedIn, function(req, res){
        req.session.user = req.user;
        console.log(req.user);
        dataToTemplate.page = "profile";
        dataToTemplate.user = req.user;
        res.render('template', dataToTemplate );
    })

    //пополняем баланс
    app.post('/topUpBalance', function (req, res) {
        var sessionUser = req.session.user; // для socket

        userModel.findById(req.user._id, function (req, user) {
            user.local.balance += 1000;
            user.save(function (err) {
                if (err) {
                    console.error(err);
                    res.status(500);
                    res.send("");
                    return;
                } else {
                    sessionUser.local.balance = user.local.balance;
                    res.send('' + user.local.balance)
                }

            })
        })
    });


	app.post("/editProfile", function(req,res){
		console.log(req.body);

        var formFiles = req.files;

		userModel.findById(req.user._id, function(err, user){
			if (err) {
				console.error(err); 
				res.status(500); 
				res.send(""); 
				return;
			}


			user.local.fname = req.body.fname;
			user.local.lname = req.body.lname;
			user.local.email = req.body.email;

			//загрузка аватора
            if (formFiles.sampleFile) {
                var sampleFile = formFiles.sampleFile,
                    sampleFileForSave = user._id + sampleFile.name.slice(sampleFile.name.indexOf("."));

                sampleFile.mv(( './public/avatars/' + sampleFileForSave), function (err) {
                    if (err) return res.status(500).send(err);
                    console.log('File uploaded!');
                });
                user.local.sampleFile = '/avatars/' + sampleFileForSave;
            }


			user.save(function(err){
				if (err) {
					console.error(err); 
					res.status(500); 
					res.send(""); 
					return;
				}

			})
		});
        res.redirect('/profile');
	});

	// process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

	app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

	app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

	//загрузка картинки на страницу профайла


	//404
	app.use(function(req, res){
		dataToTemplate.page = "404";
		res.status(404);
		res.render('template', dataToTemplate );
	})

	//500
	app.use(function(err, req, res, next){
		if(err) console.log(err);
		dataToTemplate.page = "500";
		res.status(500);
		res.render('template', dataToTemplate );
	});

	// route middleware to make sure a user is logged in
	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated())
	        return next();

	    // if they aren't redirect them to the home page
	    res.redirect('/');
	}

}



module.exports = run;
