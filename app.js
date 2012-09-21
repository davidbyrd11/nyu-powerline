
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    ejs = require('ejs'),
    http = require('http'),
    mongoose = require('mongoose'),
    path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.enable('jsonp callback');
  app.use(express.static(path.join(__dirname, 'public')));
  mongoose.connect('mongodb://localhost:27017/hackerlist_dev');
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
//template filters
ejs.filters.title = function(str) {
   return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};


//models

var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var VoteSchema = new Schema({
  voterEmail: { type: String, required: true, trim: true },
  applicantEmail: { type: String, required: true, trim: true },
  weightedVote: { type: Number, required: true, min: -2, max: 2 }
});
var Vote = mongoose.model('Vote', VoteSchema);

var UserSchema = new Schema({
  name: { type: String, required: true, trim: true, lowercase: true },
  email: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum:['developer', 'designer', 'hybrid'] },
  githubName: { type: String },
  personalURL: { type: String },
  twitterName: { type: String },
  buzzwords: [],
  isAvailable: { type: Boolean, required: true },
  score: { type: Number },
  isActive: { type: Boolean, required: true, default: false },
  created_at: { type: Date, required: true, default: Date.now }
});

//gets all of the votes for that user
UserSchema.methods.getVotes = function (callback) {
  return this.model('Vote').find({ applicantEmail: this.email }, callback);
};

//gets the score from the votes for that user
UserSchema.methods.getScore = function(callback) {
  return this.model('Vote').find({ applicantEmail: this.email }, function(err, docs){
    if (err) throw err;
    var score = 0;
    for (var i = docs.length - 1; i >= 0; i--) {
      score += docs[i].weightedVote;
    }
    return score;
  });
};

//sets the score from the votes for that user
UserSchema.methods.setScore = function(callback) {
  return this.model('Vote').find({ applicantEmail: this.email }, function(err, docs){
    if (err) throw err;
    var score = 0;
    for (var i = docs.length - 1; i >= 0; i--) {
      score += docs[i].weightedVote;
    }
    this.score = score;
  });
};

var User = mongoose.model('User', UserSchema);








//controllers

app.get('/', function(req, res){
  User.where('isActive', true).sort('-created_at').exec(function(err, docs){

    var groups = {};
    var groupNames = UserSchema.path('type').enumValues;

    for(var i=0, len=groupNames.length; i < len; i++) {
      groups[groupNames[i]] = [];
    }
    console.log(groups);
    for (var j=0, length=docs.length; j < length; j++) {
      console.log(docs[j].type);
      groups[docs[j].type][(groups[docs[j].type]).length] = docs[j];
    }

    res.render('index', { userGroups: groups, title: "NYU HackerList" });
  });
});


app.get('/apply', function(req, res){
  var status = ["applied", "accepted", "unknown"][Math.floor(Math.random() * 3)];
  res.render('application', { title: "HackerList Application", applicationStatus: status });
});

app.post('/apply', function(req, res){
  console.log(req);
  var github = req.body.github;
  var personal = req.body.personal;
  var twitter = req.body.twitter;

  var usr = new User();
  usr.name = req.body.name;
  usr.email = req.body.email;
  usr.type = '';
  if(req.body.developer == 'on') {
    usr.type = 'developer';
    if (req.body.designer == 'on') {
      usr.type = 'hybrid';
    }
  } else if (req.body.designer == 'on') {
    usr.type = 'designer';
  }

  usr.githubName = req.body.github;
  usr.twitterName = req.body.twitter;
  usr.buzzwords = req.body.buzzwords.split(',');
  usr.isAvailable = req.body.available == 'on';
  usr.isActive = true;
  usr.save(function(err){
    if(err) throw err;
    console.log("send out emails to active members");
  });

  res.redirect('/');
});

app.get('/unicornPower', function(req, res){
  User.remove({}, function(err) {
    console.log('collection removed');
  });
  var david = new User();
  david.name = "David Byrd";
  david.email = "david@byrdhou.se";
  david.type = "developer";
  david.githubName = "davidbyrd11";
  david.personalURL = "http://byrdhou.se";
  david.twitterName = "davidbyrd11";
  david.buzzwords = ['Node.js', 'MongoDB', 'Javascript', 'Rails', 'Grails', 'Java', 'Symfony2 (PHP)'];
  david.isAvailable = false;
  david.score = 100;
  david.isActive = true;
  david.save(function(err){
    if(err) throw err;
  });

  var ethan = new User();
  ethan.name = "Ethan Resnick";
  ethan.email = "studip101@gmail.com";
  ethan.type = "hybrid";
  ethan.githubName = "ethanresnick";
  ethan.personalURL = "http://www.ethanresnick.com/";
  ethan.twitterName = "studip101";
  ethan.buzzwords = ['Information Architecture', 'User Research', 'Visual Design', 'Symfony2 (PHP)', 'Javascript', 'Content Strategy'];
  ethan.isAvailable = true;
  ethan.score = 100;
  ethan.isActive = true;
  ethan.save(function(err){
    if(err) throw err;
  });
  
  var cheryl = new User();
  cheryl.name = "Cheryl Wu";
  cheryl.email = "cheryl@wu.com";
  cheryl.type = "designer";
  cheryl.personalURL = "http://grungerabbit.com/";
  cheryl.twitterName = "grungerabbit";
  cheryl.buzzwords = ["neon colors", "fucking rabbits"];
  cheryl.isAvailable = true;
  cheryl.score = 100;
  cheryl.isActive = true;
  cheryl.save(function(err){
    if(err) throw err;
  });

  var conway = new User();
  conway.name = "Cheryl ƒ∆† Anderson";
  conway.email = "conway@anderson.com";
  conway.type = "designer";
  conway.githubName = "visionmedia";
  conway.personalURL = "http://google.com";
  conway.twitterName = "fat";
  conway.buzzwords = ['big', 'fucking', 'deal'];
  conway.isAvailable = true;
  conway.score = 100;
  conway.isActive = true;
  conway.save(function(err){
    if(err) throw err;
  });

  conway = new User();
  conway.name = "Tj Boomerang";
  conway.email = "tj@boom.com";
  conway.type = "developer";
  conway.githubName = "visionmedia";
  conway.personalURL = "http://google.com";
  conway.twitterName = "visionmedia";
  conway.buzzwords = ['bigger', 'fucking', 'deal'];
  conway.isAvailable = true;
  conway.score = 100;
  conway.isActive = true;
  conway.save(function(err){
    if(err) throw err;
  });

  conway = new User();
  conway.name = "Trendy Broseph";
  conway.email = "bro@trend.dy.com";
  conway.type = "developer";
  conway.githubName = "visionmedia";
  conway.personalURL = "http://google.com";
  conway.buzzwords = ['node.js', 'rails', 'coffeescript', 'Backbone.js', 'Django'];
  conway.isAvailable = true;
  conway.score = 100;
  conway.isActive = true;
  conway.save(function(err){
    if(err) throw err;
  });


  res.send("hello world");
});

  



//helpers
function weightVote(user, applicant, vote){
  if(user.isDeveloper && applicant.isDeveloper) {
    return vote * 2;
  } else if (user.isDesigner && user.isDesigner) {
    return vote * 2;
  } else {
    return vote;
  }
}

function isAccepted(){
    User.where('score') //only shows the top 20 applicants
      .sort('-score')
      .limit(20)
      .exec(function(err, docs){
        res.render('index', { users: docs });
      });
}


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});