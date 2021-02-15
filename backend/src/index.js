const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const payController = require('./controller/pay.controller');
const phraseController = require('./controller/phrase.controller');
const disputeController = require('./controller/dispute.controller');

app.use(bodyParser.json());
app.use('/pay', payController);
app.use('/phrase', phraseController);
app.use('/dispute', disputeController);

app.use('/', express.static(__dirname + '../../../ui/build'));

// app.get('/', (req, res) => {
//   res.send('I\'m don pedrobot and i\'m happy!')
// });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});