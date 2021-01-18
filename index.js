const bot = require('./src/bot.js');

const express = require('express')
const app = express();
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('I\'m don pedrobot and i\'m happy!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})