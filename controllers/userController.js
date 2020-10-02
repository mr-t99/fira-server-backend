const { createConnection } = require('../db/db');
const { compare } = require('../utils/cryptographer');
const cn = createConnection();
const gcalendar = require('../g-calendar/index');
const emaill = require('../utils/email');
const fetch = require('node-fetch');
const { checkEvent } = require('../g-calendar/index');

const cvtToResponse = (user) => {
  return (response = {
    id: user.id,
    username: user.username,
    email: emaill.cvtNameToEmail(user.t_gvien || user.username, '@bdu.edu.vn'),
    type: user.type,
    passwordChanged: user.password_status,
    hasToken: user.access_token ? 1 : 0,
  });
};

function userStudent(username, req, res) {
  return new Promise(tv => {
    const query = `SELECT * FROM user WHERE username='${username}'`;
    cn.query(query, (err, results) => {
      if (err) return res.status(400).send(err.message);
      tv(results[0]);
    })
  })
}

const login = async function login(req, res) {
  const { username, password, type } = req.body;
  if (type == 'STUDENT') {
    const user = await userStudent(username, req, res);
    if (!user) {
      const message = await dataApi(username, res);//chi hoat dong khi co tkb moi
      if (message.message === "ok") {
        const message = await new Promise(tv => {
          cn.query(`INSERT INTO user (id, username, password, password_status, access_token, refresh_token, expiry_date, type) VALUES (NULL, '${username}', NULL, '1', NULL, NULL, NULL, '${type}')`, (err) => {
            if (err) return tv(err.message);
            tv('ok');
          })
        })
        if (message === 'ok') {
          const info = await userStudent(username);
          res.send(cvtToResponse(info));
        }
      }
      else {
        res.send(404).send({ message: "user not found" });
      }
    }else {
      // const info = await userStudent(username);
      // console.log(info)
      console.log("da cahy vao day")
      await checkEventTheWeek(user.id, res, user);
    }
  } else if (type === 'TEACHER') {
    const query = `SELECT g_vien.t_gvien, user.id, user.username, user.password, user.password_status, user.access_token, user.refresh_token, user.expiry_date, user.type FROM g_vien, user WHERE user.username = g_vien.m_gvien AND user.username = '${username}'`;
    cn.query(query, async (err, results) => {
      if (err) return res.status(400).send(err.message);
      const user = results[0];
      if (
        !user ||
        !user.password ||
        !compare(password, user.password) ||
        user.type !== type
      )
        return res.status(404).send({ message: 'user not found' });
      res.send(cvtToResponse(user));
    });
  } else {
    const query = `SELECT * FROM user WHERE username='${username}'`;
    cn.query(query, async (err, results) => {
      if (err) return res.status(400).send(err.message);
      const user = results[0];
      if (
        !user ||
        !user.password ||
        !compare(password, user.password) ||
        user.type !== type
      )
        return res.status(404).send({ message: 'user not found' });
      await checkEventTheWeek(user.id, res, user);
    });
  }
};

async function checkEventTheWeek(id, res, user) {
  const query = `SELECT * FROM user WHERE id='${id} LIMIT 1'`;
  const token = await new Promise(tv => {
    cn.query(query, (err, results) => {
      if (err) return res.status(400).send(err.message);
      tv(results[0]);
    })
  })
  if (!token.access_token) {
    res.send(cvtToResponse(user));
  } else {
    const data = {
      m_gv: token.username,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expiry_date: token.expiry_date,
    };
    console.log(await gcalendar.checkEvent(data))
    if (await gcalendar.checkEvent(data) === false) {
      gcalendar.run(data);
      dataApi(token.username, res);
    }
    res.send(cvtToResponse(user));
  }
}
async function setToken(req, res) {
  const { id, username, access_token, refresh_token, expiry_date } = req.body;
  const query = `UPDATE user SET access_token='${access_token}', refresh_token='${refresh_token}', expiry_date='${expiry_date}' WHERE id=${id};`;
  cn.query(query, (err) => {
    if (err) return res.status(400).send(err.message);
    res.send({
      message: 'update complete',
    });
  });
  const m_gv = new Promise((tv) => {
    cn.query(`SELECT * FROM user WHERE id=${id} LIMIT 1`, (err, result) => {
      if (err) return res.status(400).send(err.message);
      tv(result[0].username);
    });
  });
  const ms = await m_gv;
  const data = {
    m_gv: ms,
    access_token: access_token,
    refresh_token: refresh_token,
    expiry_date: expiry_date,
  };
  gcalendar.run(data);
}

async function dataApi(username, res) {
  const data = await new Promise(tv => {
    fetch(`https://bdu-api-tkb.herokuapp.com/api/schedule/${username}`)
      .then(res => res.json())
      .then(json => tv(json));
  })
  if (data.error === undefined) {
    const sqlS_vien = `INSERT INTO s_vien (id, m_svien, t_svien) VALUES (NULL, '${data.student.id}', '${data.student.name}')`;
    console.log(sqlS_vien)
    cn.query(sqlS_vien, err => {
      if (err) return res.status(400).send(err.message);
    })
    const schedule = data.schedule;
    schedule.forEach(async element => {
      const m_mon = element.subjectCode.split(' ')[0]
      var day = new Date(element.date);
      day = `${day.getFullYear()}/${day.getMonth()}/${day.getDate()}`
      const m_gvien = await msGv(element.class, m_mon);
      const mapDay = { "Thứ Hai": 2, "Thứ Ba": 3, "Thứ Tư": 4, "Thứ Năm": 5, "Thứ Sáu": 6, 'Thứ Bảy': 7, 'Chủ Nhật': 8 }
      const sqlTkbS_vien = `INSERT INTO tkb_svien (id, m_svien, m_gvien, m_mon, lop, thu, n_hoc, t_bdau, s_tiet) VALUES (NULL, '${data.student.id}', '${m_gvien}', '${m_mon}', '${element.class}', '${mapDay[element.weekDay]}', '${day}', '${element.startSlot}', '${element.numbersOfSlots}')`
      cn.query(sqlTkbS_vien, err => {
        if (err) return res.status(400).send(err.message);
      })
    });
    return { message: "ok" }
  }
  else {
    return { message: "Không tồn tại người này" };
  }
}

function msGv(lop, m_mon) {
  return new Promise(tv => {
    // const query = `SELECT * FROM tkb_gvien WHERE lop='${lop}' AND m_mon='${m_mon}'`;
    const query = `SELECT * FROM tkb WHERE lop='${lop}' AND m_mon='${m_mon}'`;
    cn.query(query, (err, results) => {
      if (err) throw res.status(400).send(err.message);
      //tv(results[0].m_gvien);
      // console.log(results);
      if (results[0] == null) {
        console.log('mã môn', m_mon + " Không có trong thời khóa biểu")
      } else {
        console.log(results[0].m_gvien)
        tv(results[0].m_gvien);
      }
    })
  })
}

module.exports = {
  login,
  setToken,
  checkEventTheWeek
};
