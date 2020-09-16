const db = require('../db/db');
const { query } = require('express');
const sendAllMail = require('../utils/mailer');
const cn = db.createConnection();
const email = require('../utils/email');
const moment = require('moment');

async function listTeacher(req, res) {
    const m_gvien = req.params;
    const query = `SELECT * FROM tkb_gvien WHERE m_gvien='${m_gvien.ms}'`;
    cn.query(query, (err, results) => {
        if (err) return res.status(400).send(err.message);
        if (results[0] == null) {
            return res.status(404).send({
                message: "Giảng viên này không có lịch nào"
            })
        }
        res.send(results);
    })
}

async function changeStatusSchedule(req, res) {
    const { id, status } = req.body;
    const query = `UPDATE tkb_gvien SET t_thai='${status}' WHERE id=${id}`;
    const message = await new Promise(tv => {
        cn.query(query, (err) => {
            if (err) return res.status(400).send(err.message);
            tv({
                message: "Cập nhật thành công",
                status: status
            })
        })
    })
    res.send(message);
    const sql = `SELECT tkb_gvien.m_gvien, tkb_gvien.lop, tkb_gvien.thu, tkb_gvien.t_mon, tkb_gvien.ngay,tkb_gvien.t_thai, g_vien.t_gvien FROM tkb_gvien, g_vien WHERE tkb_gvien.m_gvien = g_vien.m_gvien AND tkb_gvien.id='${id}'`;
    const data = await new Promise(tv => {
        cn.query(sql, (err, results) => {
            if (err) throw err;
            tv(results[0]);
        })
    })
    sendEmail(data);
}
async function sendEmail(data) {
    const query = `SELECT m_svien FROM tkb_svien WHERE m_gvien='${data.m_gvien}' AND lop='${data.lop}'`;
    const textSupject = `Thông báo nghỉ học môn: ${data.t_mon}`
    var cvtDay = new Date(data.ngay);
    cvtDay = `${cvtDay.getDate()}/${cvtDay.getMonth() + 1}/${cvtDay.getFullYear()}`
    const textConten = `Xin chào các bạn. Môn ${data.t_mon} vào thứ ${data.thu} ngày ${cvtDay} vừa cập nhật trạng thái: ${data.t_thai}. Sinh viên chú ý thực hiện. Thầy phụ trách: ${data.t_gvien}`;
    const mssv = await new Promise(tv => {
        cn.query(query, (err, results) => {
            if (err) throw err;
            tv(results);
        })
    })
    const ms = new Array();
    mssv.forEach(element => {
        ms.push(email.cvtNameToEmail(element.m_svien, "@student.bdu.edu.vn"));
    });
    const text = {
        subject: textSupject,
        conten: textConten
    }
    sendAllMail(ms, text);
}

async function weekStart() {
    const week = await new Promise(tv => {
        const sql = `SELECT tuan FROM tkb_gvien`;
        cn.query(sql, (err, results) => {
            if (err) return res.status(400).send(err.message);
            tv(results);
        })
    });
    var min = week[0].tuan;
    week.forEach(element => {
        if (min > element.tuan) {
            min = element.tuan;
        }
    })
    return min;
}
module.exports = {
    listTeacher,
    changeStatusSchedule
}