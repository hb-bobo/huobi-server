const crypto = require('crypto');
const config = require('config');
const  User  = require('./index');
const dbEvent = require('../../db/event');

const sign = config.get('sign');
const defaultUser = config.get('admin');

