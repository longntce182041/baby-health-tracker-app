const { PayOS } = require("@payos/node");
const config = require('./Config');

const payOS = new PayOS(
  config.PAYOS_CLIENT_ID,
  config.PAYOS_API_KEY,
  config.PAYOS_CHECKSUM_KEY,
);

module.exports = payOS;
