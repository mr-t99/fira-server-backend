const express = require('express');
const user = require('../controllers/userController');
const router = express.Router();

router.post('/login', (req, res) => {
  user.login(req, res);
});
router.get('/getInfo', (req, res) => {
  if (req.session.username) {
    return res.send(req.session.username);
  }
  res.send('1');
});
router.post('/settoken', (req, res)=>{
  user.setToken(req, res);
})
router.get('/checkevent/:id', (req, res)=>{
  user.checkEventTheWeek(req, res);
})
module.exports = router;
