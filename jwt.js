const jwt = require('jsonwebtoken');
const COOKIE_NAME = 'gemora_admin';
const maxAge = 60*60*24*7;

function getSecret(){
  if(process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET){
    throw new Error('JWT_SECRET must be set in production');
  }
  return process.env.JWT_SECRET || 'dev_secret_change_me';
}

function sign(payload){
  return jwt.sign(payload, getSecret(), { expiresIn: maxAge });
}

function verify(token){
  try { 
    return jwt.verify(token, getSecret()); 
  } catch { 
    return null; 
  }
}

module.exports = { sign, verify, COOKIE_NAME, maxAge };
