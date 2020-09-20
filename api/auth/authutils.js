const tokenUtil = require('./token')
const { Users } = require('../models/models')
const TOKEN_HEADER_NAME = 'authorization'
const AUTH_ERROR_MSG = 'Not Authorized'
async function getUser(req) {
  if (!req) {
    // return null
    throw new Error(AUTH_ERROR_MSG)
  }
  const tokenHeader = req.get(TOKEN_HEADER_NAME)
  //console.log('tokenHeader:', tokenHeader)
  if (!tokenHeader) {
    return null
    //throw new Error(AUTH_ERROR_MSG)
  }
  try {
    const decodedToken = await tokenUtil.getDecodedToken(tokenHeader)
    //console.log('decoded Token:', decodedToken)
    const user = await Users.findOne({ _id: decodedToken.userid, isactive: true });
    // const user = await User.findById(decodedToken.userid)
    //console.log('User DB object:', user);
    if (!user || !user.id) {
      throw new Error(AUTH_ERROR_MSG)
    }
    return user
  } catch (error) {
    return null
    // console.log('Error in getUser', error)
    //throw new Error(AUTH_ERROR_MSG)
  }
}

module.exports = {
  getUser
}
