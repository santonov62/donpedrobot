const bot = require('./bot')
const checker = require('./backgroundChecker')
const phraseChecker = require('./phraseChecker')

checker.start();
phraseChecker.start();