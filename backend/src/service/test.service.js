const Dispute = require('../model/dispute.model');

async function getDisputes () {
  const disputes = await Dispute.findAll();
  console.log(disputes.every(user => user instanceof Dispute)); // true
  console.log("All Disputes:", JSON.stringify(disputes, null, 2));
}

module.exports = {
  getDisputes
}