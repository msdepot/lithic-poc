const axios = require('axios');

const lithicClient = axios.create({
  baseURL: process.env.LITHIC_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.LITHIC_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

module.exports = lithicClient;
