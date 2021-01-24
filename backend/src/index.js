const express = require('express')
const app = express();
const port = process.env.PORT || 3000;
const payController = require('./controller/pay.controller');
const testService = require('./service/test.service');

app.use('/pay', payController);

app.get('/', (req, res) => {
  res.send('I\'m don pedrobot and i\'m happy!')
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

testService.getDisputes().then(data => console.log(data))