const db = require('../db/db');
const { query } = require('express');
const cn = db.createConnection();

async function list(req, res) {
    const day = req.params;
    const query = `SELECT * FROM thanhtra, tkb_gvien, g_vien WHERE thanhtra.id_tkb = tkb_gvien.id AND tkb_gvien.m_gvien=g_vien.m_gvien AND tkb_gvien.ngay='${day.day}'`
    const netData = await new Promise(tv=>{
        cn.query(query, (err, results) => {
            if (err) return res.status(400).send(err.message);
            tv(results);
        })
    })
    const dl = new Array();
    netData.forEach(element => {
        dl.push(cvtToEvaluate(element));
    });
    res.send(dl);
}

function evaluate(req, res) {
    const data = req.body;
    const cvt = {
        true: 1, false: 0
    }
    const query = `UPDATE thanhtra SET m_ttra='${data.m_ttra}', giovipham='${data.giovipham}', sisothucte='${data.sisothucte}', gv_botiet='${cvt[data.gv_botiet]}', gv_ditre='${cvt[data.gv_ditre]}', gv_nghisom='${cvt[data.gv_nghisom]}', gv_saiten='${cvt[data.gv_saiten]}', gv_daykhongthongbao='${cvt[data.gv_daykhongthongbao]}', nghihoc='${cvt[data.nghihoc]}', chitiet='${data.chitiet}' WHERE id_tkb='${data.id_tkb}'`;
    cn.query(query, err => {
        if (err) return res.status(400).send(err.message);
        res.send({
            message: "Cập nhật thành công"
        })
    })
}

async function statistical(req, res){
    const query = `SELECT * FROM thanhtra, tkb_gvien, g_vien WHERE thanhtra.id_tkb = tkb_gvien.id AND tkb_gvien.m_gvien=g_vien.m_gvien AND thanhtra.nghihoc=1`;
    const statisticalList = await new Promise(tv=>{
        cn.query(query, (err, results)=>{
            if(err) return res.status(400).send(err.message);
            tv(results);
        })
    })
    const weekBegin = await weekStart();
    const statistical = statisticalList.reduce((arr, element)=>{
        arr.push(cvtReportNh(element,weekBegin));
        return arr;
    }, []);
    res.send(statistical);
}



cvtToEvaluate = (opject) => {
    const cvt = {
        1: true, 0: false
    }
    return {
        id: opject.id,
        m_ttra: opject.m_ttra,
        giovipham: opject.giovipham,
        sisothucte: opject.sisothucte,
        gv_botiet: cvt[opject.gv_botiet],
        gv_ditre: cvt[opject.gv_ditre],
        gv_nghisom: cvt[opject.gv_nghisom],
        gv_saiten: cvt[opject.gv_saiten],
        gv_daykhongthongbao: cvt[opject.gv_daykhongthongbao],
        nghihoc: cvt[opject.nghihoc],
        chitiet: opject.chitiet,
        id_tkb: opject.id_tkb,
        m_gvien: opject.m_gvien,
        t_gvien: opject.t_gvien,
        lop: opject.lop,
        phong: opject.phong,
        s_so: opject.s_so,
        thu: opject.thu,
        m_mon: opject.m_mon ,
        t_mon:opject.t_mon,
        t_bdau: opject.t_bdau,
        s_tiet: opject.s_tiet,
        t_thai: opject.t_thai
    }
}

cvtReportNh = (opject, weekStart)=>{
    return{
        thu:opject.thu,
        t_bdau:opject.t_bdau,
        s_tiet:opject.s_tiet,
        phong:opject.phong,
        lop:opject.lop,
        s_so:opject.s_so,
        sisothucte:opject.sisothucte,
        t_mhoc:opject.t_mon,
        t_gvien:opject.t_gvien,
        ngay:opject.ngay,
        chitiet:opject.chitiet,
        tuan:opject.tuan-weekStart+1,
        nghihoc:"NH"
    }
}

// svtSumReport = (object)=>{
//     return{
//         tuan:object.tuan,
//         nghihoc:
//     }
// }

async function weekStart(){
    const sql='SELECT tuan FROM tkb_gvien';
    const week = await new Promise(tv=>{
        cn.query(sql, (err, results)=>{
            if(err) throw err;
            tv(results);
        })
    })
    var weekBegin = week[0].tuan;
    week.forEach(element=>{
        if(weekBegin>element.tuan){
            weekBegin = element.tuan;
        }
    })
    return weekBegin;
}

module.exports = {
    list, evaluate, statistical
}
