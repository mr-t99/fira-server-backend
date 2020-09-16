const express = require('express');
const router = express.Router();
const uploadFiles = require('../controllers/uploadController');

router.post('/', (req, res) => {
  uploadFiles.uploadFiles(req, res);
});

router.get('/', (req, res)=>{
  uploadFiles.creatDatabase();
})

module.exports = router;