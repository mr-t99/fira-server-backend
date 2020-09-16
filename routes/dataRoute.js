const express = require('express');
const router = express.Router();
const data = require('../controllers/dataController');

router.get('/teacher', (req, res)=>{
    data.listTeacher(req, res);
})
router.get('/schedule', (req, res)=>{
    data.listsChedule(req, res);
})
router.get('/room', (req, res)=>{
    data.listRoom(req, res);
})

module.exports = router;