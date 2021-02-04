const express = require('express');
const app = express();
const phraseService = require('../service/phrase.service');

async function add(req, res) {
  try {
    const {text} = req.body;
    console.group('[phrase.controller] -> add');
    const phrase = await phraseService.add({text});
    res.json(phrase);
  } catch (e) {
    log(`ERROR: `, e.message);
  } finally {
    console.groupEnd();
  }
}

function log (text, obj = '') {
  console.log(`[phrase.controller] ${text}`, obj);
}

app.post('/', add);

module.exports = app;