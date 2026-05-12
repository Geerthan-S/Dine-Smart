require('dotenv').config({ path: '.env' });
const { searchRestaurants } = require('./services/googlePlacesService');
(async () => {
  try {
    const res = await searchRestaurants('pizza in chennai');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
