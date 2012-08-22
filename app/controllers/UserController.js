module.exports = function (app, config) {
  return app.getController("Application", true).extend()
  .methods({
    index: function (req, res) {
      var T = this;
      new app.getModel('User', false).where({}, function(err, docs){
        if (err) throw err;
        T.render(res, 'user/index', { users: docs});
      });
    },
    create: function(req, res) {
      var tools = "node.js, Scala, C, MongoDB, Redis";
      var newUser = new app.getModel('User', false).create("David Byrd", "david@untitled.dev", true, true, tools, "Shoptiques Metrics", "http://byrdhou.se/davidProfilePicture.jpg", function(err){ if (err) throw err; });
      res.send("Hello World");
    },
    show: function(req, res) {
      var T = this;
      new app.getModel('User', false).find({email: req.params.email}, function(err, doc){
        if(err) throw err;
        var p ='not sure yet ...';
        if(doc.isDeveloper && doc.isDesigner){
          p = "<abbr title='mythical design/dev hybrid'>unicorn</abbr>";
        } else if (doc.isDeveloper){
          p = "developer";
        } else if (doc.isDesigner){
          p = "designer";
        }
        var user = {
          name: doc.name,
          email: doc.email,
          power: p,
          tools: doc.favoriteTools,
          best: doc.bestWork,
          imgURL: doc.imgURL
        };
        T.render(res, 'user/show', {user: user});
      });
    }
  });
};