const { assert } = require('chai');

const { userNameCheck } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('userNameCheck', function() {
  it('should return the object database associated with an email', function() {
    const user = userNameCheck("user@example.com", testUsers)
    const expectedUserID =  {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, expectedUserID)
  });
  it('should return null if username does not exist', function() {
    const user = userNameCheck("usert@example.com", testUsers)
    const expectedUserID =  null
    assert.deepEqual(user, expectedUserID)
  });
});
