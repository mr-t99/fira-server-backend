const express = require('express');
const route = express.Router();
const inspect = require('../controllers/inspectController');

route.get('/list/:day', (req, res)=>{
    inspect.list(req, res);
})
route.post('/evaluate', (req, res)=>{
    inspect.evaluate(req, res);
})
route.get('/statistical', (req, res)=>{
    inspect.statistical(req, res);
})
module.exports = route;