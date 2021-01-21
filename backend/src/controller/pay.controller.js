const express = require('express');
const app = express();
const md5 = require('md5');
const fetch = require('node-fetch');
const PAY_TO_ME_API_KEY = process.env.PAY_TO_ME_API_KEY;
const PAY_TO_ME_SECRET_KEY = process.env.PAY_TO_ME_SECRET_KEY;

if (!PAY_TO_ME_API_KEY) {
  console.error('ERROR: PAY_TO_ME_API_KEY env prop required!');
}

if (!PAY_TO_ME_SECRET_KEY) {
  console.error('ERROR: PAY_TO_ME_SECRET_KEY env prop required!');
}

const callback = (req, res) => {
  try {
    console.group('[pay.controller] -> callback')
    const params = req.body;
    log('params: ', params);
    // res.json('ok');
    res.status(200).send('ok');
  } catch (e) {
    const message = e.message;
    log('ERROR! ', message);
    res.status(500).send(message);
  } finally {
    console.groupEnd();
  }
}

// {"object_id":"d1b37865adb69477d2abe678bd28186c",
//     "status":"canceled",
//     "create_date":"2019-05-23T12:48:47.34Z",
//     "expire_date":"2020-05-17T12:48:47.34Z",
//     "signature":"18e275a4d7697f60dd0b14a43ed7d3b1",
//     "order_amount":"10",
//     "update_date":"2019-05-23T12:48:47.34Z",
//     "redirect":"https://api.pay2me.world/api/v3/deals/d1b37865adb69477d2abe678bd28186c/",
//     "order_desc":"Покупка промокода ID 19",
//     "order_fulldesc":"Покупка промокода ID 19",
//     "order_id":"19-0-0-1558615726520"
// }
// {"create_date":"2021-01-21T18:55:47.773Z","order_amount":10,"object_id":"32ad2fa96dda3f8fe45f2acba5a88400","order_id":1611255345894,"id":609925,"expire_date":"2022-01-16T18:55:47.773Z","update_date":"2021-01-21T18:55:48.174Z","order_fulldesc":"findpromo.ru","redirect":"https://api.paytodo.ru/api/v3/deals/32ad2fa96dda3f8fe45f2acba5a88400/","phone":"188000590109","status":"created","order_desc":"findpromo.ru"}
const create = async (req, res) => {
  try {
    console.group('[pay.controller] -> create')
    const params = req.body;
    const paymentParams = {
      order_id: Date.now(),
      order_desc: '',
      order_amount: 10
    }
    const paymentOptions = {
      method: 'POST',
      headers: {
        'X-API-KEY': PAY_TO_ME_API_KEY,
        'charset': 'utf-8',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...paymentParams,
        signature: getSignature(paymentParams)
      }),
      // json: {
      //   ...paymentParams,
      //   signature: getSignature(paymentParams)
      // }
    };

    const payment = await fetch(`https://api.paytodo.ru/api/v3/deals`, paymentOptions)
        .then(res => res.json());
    res.json(payment);
  } catch (e) {
    log('ERROR! ', e.message);
    res.send(e.message);
  } finally {
    console.groupEnd();
  }
}

const success = async (req, res) => {
  try {
    console.group('[pay.controller] -> success')
    const params = req.body;
    res.send('success');
  } catch (e) {
    log('ERROR! ', e.message);
    res.send(e.message);
  } finally {
    console.groupEnd();
  }
}

const failed = async (req, res) => {
  try {
    console.group('[pay.controller] -> failed')
    const params = req.body;
    res.send('failed');
  } catch (e) {
    log('ERROR! ', e.message);
    res.send(e.message);
  } finally {
    console.groupEnd();
  }
}

const getSignature = (params) => {
  const sortedParams = Object.entries(params).sort();
  const concatedParams = sortedParams.reduce((acc, el) => `${acc}${el[1]}`, []);
  return md5(`${concatedParams}${PAY_TO_ME_SECRET_KEY}`);
};

app.post('/callback', callback);
app.get('/create', create);
app.get('/success', success);
app.get('/failed', failed);

function log (text, obj = '') {
  console.log(`[pay.controller] ${text}`, obj);
}

module.exports = app;