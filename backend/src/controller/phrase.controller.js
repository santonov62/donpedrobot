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
    res.status(500).json({error:e.message})
  } finally {
    console.groupEnd();
  }
}

async function all(req, res) {
  try {
    console.group('[phrase.controller] -> all');
    const phrases = await phraseService.search();
    res.json(phrases);
  } catch (e) {
    log(`ERROR: `, e.message);
    res.status(500).json({error:e.message})
  } finally {
    console.groupEnd();
  }
}

function log (text, obj = '') {
  console.log(`[phrase.controller] ${text}`, obj);
}

app.post('/', add);
app.get('/', all);

module.exports = app;