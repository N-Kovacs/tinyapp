const userNameCheck = function (emailCheck, database) {
  let user = null;
  for (const entry in database) {
    if (database[entry].email === emailCheck) {
      user = database[entry];
    }
  }
  return user
};

const generateRandomString = function () {
  let poschar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += poschar.charAt(Math.floor(Math.random() * poschar.length));
  }
  return result;
};

const urlsForUser = function (id, database, database2) {
  let outputURLS = {};
  for (const url in database) {
    if (database2[id].id === database[url].userID) {
      outputURLS[url] = database[url];
    }
  }
  return outputURLS;

};

module.exports = {userNameCheck, generateRandomString, urlsForUser};