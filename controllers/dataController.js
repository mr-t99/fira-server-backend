const { createConnection } = require('../db/db');
const cn = createConnection();


function listRoom(req, res){
    const query = "select * from phong";
    cn.query(query, (err, result)=>{
        if(err) return res.status(400).send(err.message);
        res.send(result);
    })
}
function listTeacher(res, res){
    const query = "select * from g_vien";
    cn.query(query, (err, result)=>{
        if(err) return res.status(400).send(err.message);
        res.send(result);
    })
}
function listsChedule(res, res){
    const query = "select * from tkb";
    cn.query(query, (err, result)=>{
        if(err) return res.status(400).send(err.message);
        res.send(result);
    })
}
module.exports={
    listRoom,
    listTeacher,
    listsChedule
};