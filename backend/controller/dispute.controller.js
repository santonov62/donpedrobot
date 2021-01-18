const express = require('express');
const disputeService = require('../service/dispute.service');
const app = express();

app.post('/', add);

async function add(req, res) {
  console.group(`[dispute.controller] [add]`);
  try {
    const {title, expired_at} = req.body;
    if (!title) {
      throw new Error(`title required!`);
    }

    const dispute = await disputeService.add({title, expired_at});
    log(`[add] done`, dispute);
    res.json(dispute);
  } catch (e) {
    res.status(500).json({error: e.message});
  } finally {
    console.groupEnd();
  }
}

function log (text, params) {
  console.log(`[dispute.controller] -> ${text}`, params);
}

module.export = {

}