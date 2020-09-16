const db = require('../db/db');
const mh = require('../utils/cryptographer');
const { query } = require('express');
const { use } = require('../routes/changePasswordRoute');
const cn = db.createConnection();

async function changPassword(req, res) {
  const { id, oldpassword, newpassword } = req.body;
  const sql = `SELECT * FROM user WHERE id=${id}`;

  console.log(req.body);

  const data = await new Promise((tv) => {
    cn.query(sql, (err, result) => {
      if (err) return res.status(400).send(err.message);
      tv(result[0]);
    });
  });
  if (newpassword.length === 0) {
    return res.status(400).send({
      err: 'Mật khẩu không được bỏ trống',
    });
  }
  if (!mh.compare(oldpassword, data.password)) {
    return res.status(400).send({
      err: 'Mật khẩu cũ không khớp',
    });
  }
  if (newpassword.length < 8) {
    return res.status(400).send({
      err: 'Mật khẩu phải có ít nhất 8 ký tự',
    });
  } else {
    console.log('chay');
    const query = `UPDATE user SET password='${mh.hash(
      newpassword
    )}', password_status=1 WHERE id=${id}`;
    console.log(query);
    cn.query(query, (err) => {
      if (err) return res.status(400).send(err.message);
      res.send({
        message: 'complete',
      });
    });
  }
}

module.exports = {
  changPassword,
};
