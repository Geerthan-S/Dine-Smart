const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/restaurants?search=dinner');
    console.log('Results:', res.data.length);
    console.log('First:', res.data[0]?.name);
  } catch (err) {
    console.error(err);
  }
}

test();
