const passport = require('passport');

module.exports.login = function (req, res, next) {
  passport.authenticate('local', function(err, user, info){
    if(err){
      console.log("err 1: ", err)
      return res.status(400).json({ errors:err });
    }
    if(!user){
      console.log("err 2: no user found")
      return res.status(400).json({ errors : "No user found" });
    }
    console.log(user)
    req.login(user, function(err){
      if(err){
        console.log("err 3: ", err)
        return res.status(400).json({ errors : err });
      }
      // user.id (cookie) is passed back on success
      return res.status(200).json({ success : user.id });
    });
  })(req, res, next);
};