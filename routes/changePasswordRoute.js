const express = require('express');
const route = express.Router();
const changPassword = require('../controllers/changePasswordController');

route.post('/', (req, res) => {
  changPassword.changPassword(req, res);
});
module.exports = route;
