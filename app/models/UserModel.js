module.exports = function (app, config) {
  return app.getModel('Application', true).extend(function () {
    this.DBModel = this.mongoose.model('User', new this.Schema({
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        isDesigner: { type: Boolean, require: true },
        isDeveloper: { type: Boolean, require: true },
        favoriteTools: {type: String, require: true, lowercase: true },
        bestWork: {type: String, require: true, lowercase: true },
        imgURL: {type: String, require:true, trim: true }
    }));
  })
  .methods({
    create: function (name, email, isDesigner, isDeveloper, favoriteTools, bestWork, imgURL,  callback) {
      var user = new this.DBModel({
          name: name,
          email: email,
          isDesigner: isDesigner,
          isDeveloper: isDeveloper,
          favoriteTools: favoriteTools,
          bestWork: bestWork,
          imgURL: imgURL
      });
      user.save(callback);
    },
    where: function (condition, callback) {
      this.DBModel.find(condition, callback);
    }, 
    find: function (condition, callback) {
      this.DBModel.findOne(condition, callback);
    }
  });
};