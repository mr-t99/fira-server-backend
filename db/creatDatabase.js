const db = require('./db');
const data = require('../utils/readFileEcxel');
const mh = require('../utils/cryptographer');
const { createConnection } = require('./db');
const { text } = require('body-parser');
const DATABASE = process.env.DATABASENAME || 'db_remind'
const con = db.createConnection(DATABASE);
const cn = db.createConnectionNoDatabase();
const moment = require('moment');
const { data_mon } = require('../utils/readFileEcxel');
const cvtToDateStr = require('../utils/time');

function creatDatabase(name) {
    const a = queryUsermh();
    cn.query("CREATE DATABASE IF NOT EXISTS " + name + " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", (err, result, cb) => {
        if (err) throw err;
        const gv = "CREATE TABLE IF NOT EXISTS `db_remind`.`g_vien` ( `id` INT NOT NULL AUTO_INCREMENT , `m_gvien` TEXT NOT NULL , `t_gvien` VARCHAR(50) NOT NULL , `n_sinh` TEXT NOT NULL, `phai` VARCHAR(5) NOT NULL, `khoa` VARCHAR(100) NOT NULL , `t_do` VARCHAR(20) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;"
        const tkb = "CREATE TABLE IF NOT EXISTS `db_remind`.`tkb` ( `id` INT NOT NULL AUTO_INCREMENT , `thu` INT NOT NULL , `t_bdau` INT NOT NULL , `s_tiet` INT NOT NULL , `m_mon` TEXT NOT NULL , `t_mon` VARCHAR(500) NOT NULL , `m_gvien` TEXT NOT NULL , `phong` TEXT NOT NULL , `lop` TEXT NOT NULL , `n_bdau` DATE NOT NULL , `n_kthuc` DATE NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;";
        const phong = "CREATE TABLE IF NOT EXISTS `db_remind`.`phong` ( `id` INT NOT NULL AUTO_INCREMENT , `t_phong` TEXT NOT NULL , `khu` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;";
        const user =    "CREATE TABLE IF NOT EXISTS `db_remind`.`user` ( `id` INT NOT NULL AUTO_INCREMENT , `username` TEXT NOT NULL , `password` TEXT NULL , `password_status` BOOLEAN NOT NULL , `access_token` TEXT NULL , `refresh_token` TEXT NULL , `expiry_date` TEXT NULL , `type` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;";
        const tkb_gvien = "CREATE TABLE IF NOT EXISTS `db_remind`.`tkb_gvien` ( `id` INT NOT NULL AUTO_INCREMENT , `m_gvien` TEXT NOT NULL , `lop` TEXT NOT NULL, `phong` TEXT NOT NULL, `s_so` INT NOT NULL, `thu` INT NOT NULL , `m_mon` TEXT NOT NULL , `t_mon` VARCHAR(500) NOT NULL , `t_bdau` INT NOT NULL , `s_tiet` INT NOT NULL , `ngay` DATE NOT NULL , `tuan` INT NOT NULL, `t_thai` VARCHAR(10) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;";
        const m_hoc = "CREATE TABLE IF NOT EXISTS `db_remind`.`m_hoc` ( `id` INT NOT NULL AUTO_INCREMENT , `m_mon` TEXT NOT NULL , `t_mon` VARCHAR(500) NOT NULL , `s_tiet` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;";
        const s_vien = "CREATE TABLE IF NOT EXISTS `db_remind`.`s_vien` ( `id` INT NOT NULL AUTO_INCREMENT , `m_svien` TEXT NOT NULL , `t_svien` VARCHAR(50) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;";
        const tkb_svien = "CREATE TABLE IF NOT EXISTS `db_remind`.`tkb_svien` ( `id` INT NOT NULL AUTO_INCREMENT , `m_svien` TEXT NOT NULL , `m_gvien` TEXT NOT NULL , `m_mon` TEXT NOT NULL , `lop` TEXT NOT NULL, `thu` INT NOT NULL , `n_hoc` DATE NOT NULL , `t_bdau` INT NOT NULL , `s_tiet` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;";
        const thanhtra = "CREATE TABLE IF NOT EXISTS `db_remind`.`thanhtra` ( `id` INT NOT NULL AUTO_INCREMENT , `m_ttra` TEXT NULL , `giovipham` TEXT NULL , `sisothucte` INT NULL , `gv_botiet` BOOLEAN NOT NULL , `gv_ditre` BOOLEAN NOT NULL , `gv_nghisom` BOOLEAN NOT NULL , `gv_saiten` BOOLEAN NOT NULL , `gv_daykhongthongbao` BOOLEAN NOT NULL, `nghihoc` BOOLEAN NOT NULL , `chitiet` VARCHAR(1000) NULL , `id_tkb` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;";
        const p_sdung = "CREATE TABLE IF NOT EXISTS `db_remind`.`p_sdung` ( `id` INT NOT NULL AUTO_INCREMENT , `t_phong` TEXT NOT NULL , `ngay` DATE NOT NULL , `m_dich` VARCHAR(1000) NOT NULL , `b_sang` BOOLEAN NOT NULL , `b_chieu` BOOLEAN NOT NULL , `b_toi` BOOLEAN NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;";
        creatTable(gv);
        creatTable(tkb_gvien);
        creatTable(tkb);
        creatTable(phong);
        creatTable(user);
        creatTable(m_hoc);
        creatTable(s_vien);
        creatTable(tkb_svien)
        creatTable(thanhtra);
        creatTable(p_sdung);
        importValue();
        a.then(test => {
            test.forEach(element => {
                creatTable(element);
            })
        })
    });
}

function creatTable(sql) {
    con.query(sql, (err, result, cb) => {
        if (err) throw err;
        console.log("complete");
    });
}
async function importValue() {
    const dataGv = data.data_gv()
    dataGv.forEach(element => {
        var sql = "INSERT INTO g_vien (m_gvien, t_gvien, n_sinh, phai, khoa, t_do) VALUES ('"
            + element.m_gvien + "','" + element.ten + "','" + element.n_sinh + "','" + element.phai + "','"
            + element.khoa + "','" + element.t_do + "')";
        con.query(sql, (err, result) => {
            if (err) throw err;
            console.log('thêm giảng viên');
        })
    });
    const dataTkb = data.data_tkb();
    dataTkb.forEach(element => {
        var sql = "INSERT INTO tkb (thu, t_bdau, s_tiet, m_mon, t_mon, m_gvien, phong, lop, n_bdau, n_kthuc) VALUES ('"
            + element.thu + "', '" + element.t_bdau + "', '"
            + element.s_tiet + "', '" + element.m_mon + "', '"
            + element.t_mon + "', '" + element.m_gvien + "', '"
            + element.phong + "', '" + element.lop + "', '"
            + element.n_bdau + "', '" + element.n_kthuc + "')";
        con.query(sql, (err, result) => {
            if (err) throw err;
            console.log('thêm thời khóa biểu');
        })
    });
    const dataPhong = data.data_phong();
    dataPhong.forEach(element => {
        var sql = "INSERT INTO phong (t_phong, khu) VALUES ('" + element.t_phong + "', '" + element.khu + "')";
        con.query(sql, (err, result) => {
            if (err) throw err;
            console.log('thêm phòng');
        })
    });
    const data_tkb_gv = tkbgv();
    data_tkb_gv.forEach(element => {
        var sql = `INSERT INTO tkb_gvien (id, m_gvien, lop, phong, s_so, thu, m_mon, t_mon, t_bdau, s_tiet, ngay, tuan, t_thai) VALUES (NULL, '${element.m_gvien}', '${element.lop}', '${element.phong}', '${element.s_so}', '${element.thu}', '${element.m_mon}', '${element.t_mon}', '${element.t_bdau}', '${element.s_tiet}', '${element.ngay}', '${element.tuan}', '${element.t_thai}')`;
        con.query(sql, (err, result) => {
            if (err) throw err;
            console.log('thêm thời khóa biểu giảng viên');
        })
    });
    const m_hoc = data.data_mon()
    m_hoc.forEach(element => {
        var sql = `INSERT INTO m_hoc (id, t_mon, m_mon, s_tiet) VALUES (NULL, '${element.t_mhoc}', '${element.m_mhoc}', '${element.s_tiet}')`;
        con.query(sql, (err, result) => {
            if (err) throw err;
            console.log('thêm danh sách môn');
        })
    });
    const idTkb = await getIdTkbGv()
    idTkb.forEach(element => {
        var sql = `INSERT INTO thanhtra (id, m_ttra, giovipham, sisothucte, gv_botiet, gv_ditre, gv_nghisom, gv_saiten, gv_daykhongthongbao,nghihoc, chitiet, id_tkb) VALUES (NULL, NULL, NULL, NULL, '0', '0', '0', '0', '0','0', NULL, '${element}')`
        con.query(sql, (err, result) => {
            if (err) throw err;
            console.log('thêm idtkb');
        })
    })
}
async function queryUsermh() {
    const dataGv = data.data_gv()
    const query = new Array();
    dataGv.forEach(element => {
        const m_gvien = String(element.m_gvien);
        const pass = mh.hash(m_gvien);
        console.log(pass);
        const sql = `INSERT INTO user (username, password, password_status, access_token, refresh_token, expiry_date, type) VALUES ('${m_gvien}', '${pass}', '0', NULL, NULL, NULL, 'TEACHER')`;
        query.push(sql);
    })
    return query;
}
opjectTkbGvien = (opject, ngay) => {
    return {
        m_gvien: opject.m_gvien,
        lop: opject.lop,
        phong: opject.phong,
        s_so: opject.s_so,
        thu: opject.thu,
        m_mon: opject.m_mon,
        t_mon: opject.t_mon,
        t_bdau: opject.t_bdau,
        s_tiet: opject.s_tiet,
        ngay: ngay,
        tuan: moment(ngay).week(),
        t_thai: "Học"
    }
}
function tkbgv() {
    const dl = data.tkb_gvien()
    var n_bdau, n_kthuc, thu;
    const dayMap = {
        2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 0,
    }
    const xulyTkb = new Array();
    const numberMap = {
        1: "01", 2: "02", 3: "03", 4: "04", 5: "05", 6: "06", 7: "07", 8: "08", 9: "09",
    };
    dl.forEach(element => {
        n_bdau = new Date(element.n_bdau);
        n_kthuc = new Date(element.n_kthuc);
        thu = element.thu;
        for (var m = moment(n_bdau); m.diff(n_kthuc, 'days') <= 0; m.add(1, 'days')) {
            const day = new Date(m.format('YYYY-MM-DD'));
            if (day.getDay() === dayMap[thu]) {
                var ngay = `${day.getFullYear()}-${numberMap[day.getMonth() + 1] || day.getMonth() + 1}-${numberMap[day.getDate()] || day.getDate()}`;
                xulyTkb.push(opjectTkbGvien(element, ngay))
            }
        }
    })
    return xulyTkb;
}
async function getIdTkbGv() {
    const sql = `SELECT id FROM tkb_gvien`;
    const data = await new Promise(tv => {
        con.query(sql, (err, results) => {
            tv(results);
        })
    })
    const id = new Array();
    data.forEach(element => {
        id.push(element.id);
    })
    return id;
}

function database(){
    creatDatabase(DATABASE)
}

// importValue()
// tkbgv();
// database();
// tkbgv();
module.exports = database;