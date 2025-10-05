const { Lithic } = require('@lithic/lithic');

const lithicClient = new Lithic({
  apiKey: process.env.LITHIC_API_KEY,
  environment: process.env.LITHIC_ENVIRONMENT || 'sandbox'
});

module.exports = lithicClient;
