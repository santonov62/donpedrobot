const express = require('express');
const disputeService = require('../service/dispute.service');
const app = express();

app.post('/', add);
app.delete('/', remove);
app.get('/awaitingResults', awaitingResults);

async function remove(req, res) {
  console.group(`[dispute.controller] [remove]`);
  try {
    const {id} = req.query;
    const dispute = await disputeService.remove({id});
    log(`[add] done`, dispute);
    res.json(dispute);
  } catch (e) {
    res.status(500).json({error: e.message});
  } finally {
    console.groupEnd();
  }
}

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
async function awaitingResults(req, res) {
  console.group(`[dispute.controller] [awaitingResults]`);
  try {
    const disputes = await disputeService.getAwaitingResults();
    log(`[add] done`, disputes);
    res.json(disputes);
  } catch (e) {
    res.status(500).json({error: e.message});
  } finally {
    console.groupEnd();
  }
}

function log (text, params) {
  console.log(`[dispute.controller] -> ${text}`, params);
}

module.exports = app;