const axios = require('axios');

const searchRestaurants = async (query) => {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: query,
          format: 'jsonv2',
          addressdetails: 1,
          extratags: 1,
          limit: 15,
        },
        headers: {
          'User-Agent': 'DineSmart-AI/1.0',
        },
      }
    );

    const places = response.data || [];

    // Normalize response data
    return places.map(place => {
      // Extract cuisine from extratags if available
      let types = [];
      if (place.extratags && place.extratags.cuisine) {
        types = place.extratags.cuisine.split(/[;,]/).map(t => t.trim().toLowerCase());
      }

      // Generate a random rating between 3.8 and 4.9 since OSM doesn't provide ratings
      const randomRating = (Math.random() * (4.9 - 3.8) + 3.8).toFixed(1);

      return {
        name: place.name || place.display_name.split(',')[0],
        address: place.display_name,
        rating: parseFloat(randomRating),
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        types: types,
        source: 'osm',
      };
    });
  } catch (error) {
    console.error('OSM Nominatim API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch data from OpenStreetMap');
  }
};

module.exports = {
  searchRestaurants,
};
