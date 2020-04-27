const express       = require('express');
const session       = require('express-session');
const mongoose      = require('mongoose');
const passport      = require('passport');
const MongoStore    = require('connect-mongo')(session);
const bodyParser    = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const mongoURI = "mongodb+srv://Numberfitmain:numberfit1234@COMP0067G12-16fzq.azure.mongodb.net/NumberfitDB?retryWrites=true&w=majority";

// Use body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Add headers
// app.use(require('./config/headers').headers);

// Putting it all together
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => { console.log('MongoDB connected to ', mongoURI); })
.catch(err => console.log('Failed to connect: ', err))

app.use(require('cors')())

require('./config/passport')
app.use(passport.initialize());
app.use(passport.session());

// Create and use Express session
app.use(require('express-session')({
  secret: 'tifrebmuN',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection : mongoose.connection})
}));

app.use(passport.session({
  secret: 'tifrebmuN',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection : mongoose.connection})
}));

app.use(express.static(__dirname + '/public'));

app.get('/test', function(req, res){
  res.send('Test Success');
});

// REQUESTS HERE
// POST REQUESTS
// Login request
app.post('/login', require('./requests/login').login)

// Register request
app.post('/register', require('./requests/register').register)

// Save game
app.post('/saveGame', require('./requests/save-game').saveGame)


// GET REQUESTS
// Logout request
app.get('/logout', function(req, res){
  req.logout();
  req.session.destroy();
  res.send("OK");
});

// Get user's details
app.get('/myDetails', require('./requests/myDetails').myDetails);

// Get leaderboard from the database
app.get('/leaderboard', require('./requests/leaderboard').leaderboard);

// Add new School - done via web page
app.get('/progress', require('./requests/progress').progress)

// Add new School - done via web page
app.get('/addSchool', require('./requests/addSchool').addSchool)

// Get 3 random video URLs from the database
app.get('/getTeachers', require('./requests/getTeachers').getTeachers);

// Add new School - done via web page
app.get('/getSchools', require('./requests/getSchools').getSchools)

// Add new School - done via web page
app.get('/getVideo', require('./requests/getVideo').getVideo)

// Listen on PORT
app.listen(PORT, () => {
  console.log('server listening on port ', PORT)
});
