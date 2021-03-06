const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const axios = require('axios').default;
const db = require('../db/db');
const cn = db.createConnection('remind_db');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'token.json';

function authorize(credentials, token, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    scope: SCOPES,
    token_type: 'Bearer',
    expiry_date: token.expiry_date,
  });
  // callback(oAuth2Client, token);
  return {
    oAuth2Client: oAuth2Client,
    token: token
  }
  // fs.readFile(TOKEN_PATH, (err, token) => {
  //   if (err) return getAccessToken(oAuth2Client, callback);
  //   oAuth2Client.setCredentials(JSON.parse(token));
  //
  // });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function pushEvents(auth, token) {
  const calendar = google.calendar({ version: 'v3', auth });
  axios
    .get(`https://bdu-api-tkb.herokuapp.com/api/schedule/${token.m_gv}`)
    .then((res) => {
      const { data } = res;
      const schedule = data.schedule;
      schedule.map((s) => {
        const startTime = new Date(Date.parse(s.date));
        const endTime = new Date(Date.parse(s.date));

        // chưa đúng trong một số trường hợp
        if (s.startSlot == 1) {
          startTime.setHours(7);
          endTime.setHours(7);
        } else if (s.startSlot == 7) {
          startTime.setHours(13);
          endTime.setHours(13);
        }

        endTime.setMinutes(0);
        endTime.setMinutes(s.numbersOfSlots * 45);

        setTimeout(() => {
          var event = {
            summary: `Tên môn học: ${s.subjectName}`,
            location: `Phòng: ${s.room}`,
            description: `Tiết bắt đầu: ${s.startSlot} \n Số tiết:  ${s.numbersOfSlots}`,
            start: {
              dateTime: startTime,
              timeZone: 'Asia/Ho_Chi_Minh',
            },
            end: {
              dateTime: endTime,
              timeZone: 'Asia/Ho_Chi_Minh',
            },
          };

          calendar.events.insert(
            {
              auth: auth,
              calendarId: 'primary',
              resource: event,
            },
            function (err, event) {
              if (err) {
                console.log(
                  'There was an error contacting the Calendar service: ' + err
                );
                return;
              }
              console.log('Event created!');
            }
          );
        }, 4000);
      });
    });
}

function listEvents(auth) {
  var day = new Date();
  const sotru = day.getDay() - 1;
  day.setDate(day.getDate() - sotru);
  const results = new Promise(tv => {
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
      calendarId: 'primary',
      timeMin: (day).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const events = res.data.items;
      if (events.length) {
        tv(true);
      } else {
        tv(false);
      }
    });
  })
  return results;
}
async function checkEvent(token) {
  var results = await new Promise(tv => {
    fs.readFile('./g-calendar/credentials.json', async (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      const author = authorize(JSON.parse(content), token);
      tv(await listEvents(author.oAuth2Client));
    });
  })
  // console.log(results)
  if (results === false) {
    return false;
  }
  else {
    return true;
  }
};

function run(token) {
  console.log(token);
  fs.readFile('./g-calendar/credentials.json', async (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    const author = await authorize(JSON.parse(content), token);
    pushEvents(author.oAuth2Client, author.token);
    // authorize(JSON.parse(content), token, pushEvents);
  });
}

module.exports = {
  run, checkEvent
};
