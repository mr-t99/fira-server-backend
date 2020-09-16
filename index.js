const express = require('express');
const app = express();
const cors = require('cors');
const uploadRoutes = require('./routes/uploadRoutes');
const dataRoutes = require('./routes/dataRoute');
const roomRoute = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
const changePassword = require('./routes/changePasswordRoute');
const teacher = require('./routes/teacherRoute');
const inspect = require('./routes/inspectRoute');

var bodyParser = require('body-parser');

const PORT = process.env.PORT || 4000;
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(
  session({
    secret: 'tuongmlbnbbabbababbabababab',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
  })
);
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use('/upload', uploadRoutes);
app.use('/data', dataRoutes);
app.use('/room', roomRoute);
app.use('/user', userRoutes);
app.use('/changepass', changePassword);
app.use('/teacher', teacher);
app.use('/inspect', inspect);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
