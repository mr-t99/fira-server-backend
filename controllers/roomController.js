const { createConnection } = require('../db/db');
const cn = createConnection();
const moment = require('moment');
const { query, text } = require('express');

async function roomUse(req, res) {
    var day = req.params.day;
    res.send(await dataUseRoomGd(day, res))
}
async function emptyRoom(req, res) {
    var day = req.params.day;
    res.send(await dataEmptyRoomGD(day, res));
}
async function statusRoom(req, res) {
    var day = req.params;
    day = day.day.replace(/-/g, "/");
    const data = await dataStatusRoom(day, res);
    res.status(200).send(data);
}
// dữ liệu hiển thị

async function dataUseRoomGd(day, res) {
    const data = await new Promise(tv => {
        const query = "select * from tkb";
        cn.query(query, (err, results) => {
            if (err) return res.status(400).send(err.message);
            const tkb = results
            const p_sdung = new Array();
            const ht = new Date(day);
            const dayMap = {
                '0': 8,
                '1': 2,
                '2': 3,
                '3': 4,
                '4': 5,
                '5': 6,
                '6': 7,
            };
            //console.log(ht.getHours());
            tkb.forEach(element => {
                if (element.n_bdau != '0000-00-00') {
                    const ngay_bd = new Date(element.n_bdau);
                    const ngay_kt = new Date(element.n_kthuc);
                    if (ngay_bd < ht && ht <= ngay_kt && element.thu == dayMap[ht.getDay()]) {
                        var abc = {
                            t_phong: element.phong,
                            t_mon: element.t_mon,
                            t_bdau: element.t_bdau,
                            t_kthuc: element.t_bdau + element.s_tiet
                        }
                        p_sdung.push(abc);
                    }
                }
            });
            tv(p_sdung);
        })
    })
    const kq = new Array();
    const sql = `SELECT * FROM p_sdung WHERE ngay='${day}'`
    const dataSql = await new Promise(tv=>{
        cn.query(sql, (err, results)=>{
            if (err) return res.status(400).send(err.message);
            tv(results)
        })
    })
    dataSql.forEach(element=>{
        kq.push(cvtUseRoom(element));
    })
    data.forEach(el=>{
        kq.push(el);
    })
    return kq;
}
function dataEmptyRoomGD(day, res) {
    const data = new Promise(tv => {
        const query = "select * from phong";
        cn.query(query, async (err, results) => {
            if (err) return res.status(400).send(err.message);
            const phong = results;
            const tkb = await dataUseRoom(day, res);
            const stringJson = JSON.stringify(tkb);
            phong.forEach((element, i) => {
                if (stringJson.indexOf(element.t_phong) !== -1) {
                    phong.splice(i, 1);
                }
            });
            tv(phong);
        })
    });
    return data;
}

room = (opject, st) => {
    return {
        id: opject.id,
        t_phong: opject.t_phong,
        khu: opject.khu,
        status: st
    }
}

cvtRoom = (phong, s, c, t,id) => {
    return {
        id:id,
        t_phong: phong,
        b_sang: s,
        b_chieu: c,
        b_toi: t
    }
}

cvtUseRoom = (object)=>{
    var t_bdau;
    if(object.b_sang===1){
        t_bdau = 1;
    }
    else if(object.b_chieu===1){
        t_bdau = 7;
    }else{
        t_bdau = 13;
    }
    return{
        t_phong: object.t_phong,
        t_mon: object.m_dich,
        t_bdau: t_bdau,
        t_kthuc: 6
    }
}
async function dataStatusRoom(day, req, res) {
    const data = await new Promise(tv => {
        const query = "select * from phong";
        cn.query(query, (err, result) => {
            if (err) return res.status(400).send(err.message);
            tv(result);
        });
    });
    var statusInRoom = new Array();
    const empty = await dataEmptyRoom(day, req, res);
    const stringJson = JSON.stringify(empty);
    data.forEach((element, i) => {
        var st;
        if (stringJson.indexOf(element.t_phong) !== -1) {
            st = "EMPTY";
            statusInRoom.push(room(data[i], st));
        } else {
            st = "USING";
            statusInRoom.push(room(data[i], st));
        }
    });
    return statusInRoom;
}

//Dữ liệu dụng xếp phòng

async function listEmptyRoom(req, res){
    res.send(await phongcothedung(req, res))
}

async function arrangeRoom(req, res){
    const{t_phong, ngay, n_dung, b_sang,b_chieu,b_toi} = req.body;
    const cvtTruefalse = {true:1, false:0}
    const sql = `INSERT INTO p_sdung (id, t_phong, ngay, m_dich, b_sang, b_chieu, b_toi) VALUES (NULL, '${t_phong}', '${ngay}', '${n_dung}', '${cvtTruefalse[b_sang]}', '${cvtTruefalse[b_chieu]}', '${cvtTruefalse[b_toi]}')`;
    cn.query(sql, err =>{
        if(err) return res.status(400).send(err.message);
        res.send({
            message:"Đặt phòng hoàn tất"
        })
    })
}

async function phongcothedung(req, res) {
    const day = req.params.day;
    const phongtrong = await dataEmptyRoom(day, res);
    const phongsudung = await dataUseRoom(day, res);
    const phongcothedung = new Array();
    phongsudung.forEach(element => {
        phongcothedung.push(element);
    })
    phongtrong.forEach(element=>{
        phongcothedung.push(cvtRoom(element, false, false, false));
    })
    const kq = new Array();
    phongcothedung.forEach((element,i)=>{
        kq.push(cvtRoom(element.t_phong,element.b_sang, element.b_chieu, element.b_toi,i+1));
    })
    return kq;
}

async function dataUseRoom(day, res) {
    const sql = `SELECT * FROM phong, tkb_gvien WHERE tkb_gvien.phong = phong.t_phong AND tkb_gvien.ngay = '${day}'`;
    const dataRoom = await new Promise(tv => {
        cn.query(sql, (err, results) => {
            if (err) return res.status(400).send(err.message);
            tv(results)
        })
    })
    const query = `SELECT * FROM p_sdung WHERE ngay='${day}'`;
    const dataXepPhong = await new Promise(tv => {
        cn.query(query, (err, results) => {
            if (err) return res.status(400).send(err.message);
            tv(results);
        })
    })
    var useRoom = new Array();
    dataRoom.forEach(element => {
        useRoom.push(element.phong);
    })
    dataXepPhong.forEach(element => {
        useRoom.push(element.t_phong);
    });

    useRoom = useRoom.filter((item, index) => {
        return useRoom.indexOf(item) === index;
    })

    var kethop = new Array()
    useRoom.forEach((element, i) => {
        const m = new Array()
        dataRoom.forEach(el => {
            if (el.phong === element) {
                m.push(el.t_bdau);
            }
        })
        if (m.length === 2) {
            kethop.push(cvtRoom(element, true, true, false));
        } else {
            if (m[0] === 1) {
                kethop.push(cvtRoom(element, true, false, false))
            }
            if (m[0] === 7) {
                kethop.push(cvtRoom(element, false, true, false))
            }
            if (m[0] === 13) {
                kethop.push(cvtRoom(element, false, false, true))
            }
        }
    })
    const mapBoolean = { 1: true, 0: false };
    dataXepPhong.forEach(element => {
        kethop.push(cvtRoom(element.t_phong, mapBoolean[element.b_sang], mapBoolean[element.b_chieu], mapBoolean[element.b_toi]));
    });
    const kq = new Array();
    const tl = new Array();
    kethop.forEach((element, i) => {
        let tam = element.t_phong;
        kethop.forEach((el, j)=>{
            if(tam === el.t_phong && i !== j){
                tl.push(el);
            }
        })
    });
    kethop.forEach((element, i) => {
        let tam = element.t_phong;
        kethop.forEach((el, j)=>{
            if(tam === el.t_phong && i !== j){
                kethop.splice(j,1);
                kethop.splice(i,1);
            }
        })
    });
    tl.forEach((element, i)=>{
        let tam = element;
        tl.forEach((el, j)=>{
            if(tam.t_phong === el.t_phong && i!==j){
                let sang, chieu, toi;
                if(tam.b_sang===el.b_sang){
                    sang = tam.b_sang;
                }else{
                    sang = true;
                }
                if(tam.b_chieu===el.b_chieu){
                    chieu = tam.b_chieu;
                }else{
                    chieu = true;
                }
                if(tam.b_toi===el.b_toi){
                    toi = tam.b_toi;
                }else{
                    toi = true;
                }
                kq.push(cvtRoom(tam.t_phong,sang,chieu,toi))
                tl.splice(j,1);
            }
        })
    })
    kethop.forEach(el=>{
        kq.push(el);
    })
    return kq;
}
async function dataEmptyRoom(day, res) {
    const p_sdung = await dataUseRoomGd(day, res);
    const t_phong = new Array();
    p_sdung.forEach(element => {
        t_phong.push(element.t_phong)
    });
    const dataPhong = await new Promise(tv => {
        const sql = `SELECT * FROM phong`;
        cn.query(sql, (err, results) => {
            if (err) return res.status(400).send(err.message);
            tv(results);
        })
    })
    const room = new Array();
    dataPhong.forEach(element => {
        room.push(element.t_phong);
    })
    // console.log(room);
    t_phong.forEach(element => {
        const vt = room.indexOf(element);
        room.splice(vt, 1);
    })
    return room;
}

//dataStatusRoom();
module.exports = {
    roomUse, emptyRoom, statusRoom, listEmptyRoom, arrangeRoom
}