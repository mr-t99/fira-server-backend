const express = require('express');
const route = express.Router();
const teacher = require('../controllers/teacherController');

route.get('/listteacher/:ms', (req, res)=>{
    teacher.listTeacher(req, res);
})
route.post("/changeSchedule", (req, res)=>{
    teacher.changeStatusSchedule(req, res);
})

module.exports = route;