const jwt = require('jsonwebtoken');
const create = userid => new Promise((resolve, reject) => {
  jwt.sign({
    userid
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFE_TIME
  }, (error, token) => {
    if (error) {
      return reject(error)
    }
    resolve(token)
  })
});
const getDecodedToken = token => new Promise((resolve, reject) => {
  jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
    if (error) {
      return reject(error)
    }
    if (!decodedToken.exp || !decodedToken.iat) {
      return reject(new Error(`Token had no 'exp' or 'iat' payload`))
    }
    resolve(decodedToken)
  })
});
module.exports = {
  create,
  getDecodedToken
}
