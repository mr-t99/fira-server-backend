const express = require('express');
const router = express.Router();
const roomStatus = require('../controllers/roomController');

//hiển thị
router.get('/roomuse/:day', (req, res)=>{
    roomStatus.roomUse(req, res);
})
router.get('/emptyroom/:day', (req, res)=>{
    roomStatus.emptyRoom(req, res);
})
router.get('/statusroom/:day', (req, res)=>{
    roomStatus.statusRoom(req, res);
})

//xử lý
router.get('/listemptyroom/:day', (req, res)=>{
    roomStatus.listEmptyRoom(req, res);
    //gán giao diện theo link này
})
router.post('/arrangeroom', (req, res)=>{
    roomStatus.arrangeRoom(req, res);
    //chưa xong nhưng dữ liệu đẩy lên:
    // {
    //     "t_phong":"C04",
    //     "ngay":"2020-06-23",
    //     "n_dung":"lam mot casi gi do",
    //     "b_sang":true,
    //     "b_chieu":true,
    //     "b_toi":false
    // }
})
module.exports = router;