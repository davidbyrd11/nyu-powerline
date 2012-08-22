module.exports = function (app) {
  return {
    '/': {'get': 'Home.index'},
    '/users': {'get': 'User.index'},
    '/users/:email': {'get': 'User.show'},
    '/users/fixtures': {'get': 'User.create'}
  };
};
