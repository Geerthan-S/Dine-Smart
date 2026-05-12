const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Table = require('../models/Table');
const { searchRestaurants } = require('../services/osmService');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getRestaurants = async (req, res) => {
  try {
    const { cuisine, location, area, priceRange, isVeg, minRating, search, featured, trending, tag } = req.query;
    const andClauses = [];

    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      andClauses.push({
        $or: [
          { name: rx },
          { description: rx },
          { searchText: rx },
          { tags: rx },
          { 'menu.name': rx },
        ],
      });
    }

    if (cuisine) {
      const rx = new RegExp(escapeRegex(cuisine), 'i');
      andClauses.push({
        $or: [
          { cuisine: rx },
          { types: rx },
          { name: rx },
        ],
      });
    }

    if (location || area) {
      const loc = location || area;
      const rx = new RegExp(escapeRegex(loc), 'i');
      andClauses.push({
        $or: [
          { area: rx },
          { location: rx },
          { address: rx },
          { city: rx },
        ],
      });
    }

    if (priceRange) {
      andClauses.push({ priceRange });
    }

    if (isVeg === 'true') {
      andClauses.push({ isVeg: true });
    }

    if (minRating) {
      andClauses.push({ rating: { $gte: parseFloat(minRating) } });
    }
    if (featured === 'true') andClauses.push({ featured: true });
    if (trending === 'true') andClauses.push({ trending: true });
    if (tag) {
      const rx = new RegExp(escapeRegex(tag), 'i');
      andClauses.push({ $or: [{ tags: rx }, { ambienceTags: rx }, { types: rx }] });
    }

    const filter = andClauses.length > 0 ? { $and: andClauses } : {};
    const restaurants = await Restaurant.find(filter).sort({ featured: -1, trending: -1, rating: -1, numReviews: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRestaurantMeta = async (req, res) => {
  try {
    const [areas, cuisines, priceRanges, ambienceTags, stats] = await Promise.all([
      Restaurant.distinct('area'),
      Restaurant.distinct('cuisine'),
      Restaurant.distinct('priceRange'),
      Restaurant.distinct('ambienceTags'),
      Restaurant.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' },
            avgCostForTwo: { $avg: '$avgCostForTwo' },
            openNow: { $sum: { $cond: ['$isOpenNow', 1, 0] } },
          },
        },
      ]),
    ]);

    res.json({
      areas: areas.filter(Boolean).sort((a, b) => a.localeCompare(b)),
      cuisines: cuisines.filter(Boolean).sort((a, b) => a.localeCompare(b)),
      priceRanges: priceRanges.filter(Boolean).sort(),
      ambienceTags: ambienceTags.filter(Boolean).sort((a, b) => a.localeCompare(b)),
      stats: stats[0] || { count: 0, avgRating: 0, avgCostForTwo: 0, openNow: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      location,
      area,
      city,
      cuisine,
      priceRange,
      description,
      rating,
      image,
      avgCostForTwo,
      isVeg,
      tags,
      openingHours,
      address,
      lat,
      lng,
    } = req.body;

    const cuisineArr = Array.isArray(cuisine) ? cuisine : (cuisine ? [cuisine] : ['Various']);

    const restaurant = await Restaurant.create({
      name,
      location: location || area || city || '',
      area: area || location || '',
      city: city || 'Chennai',
      address: address || location || '',
      cuisine: cuisineArr,
      priceRange: priceRange || 'medium',
      description,
      rating,
      image,
      avgCostForTwo: avgCostForTwo || 0,
      isVeg: isVeg || false,
      tags: tags || [],
      openingHours: openingHours || '',
      lat: lat || 0,
      lng: lng || 0,
      source: 'local',
      createdBy: req.user._id,
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const allowed = [
      'name', 'brand', 'location', 'area', 'city', 'address', 'cuisine', 'priceRange',
      'description', 'rating', 'image', 'avgCostForTwo', 'isVeg', 'tags', 'ambienceTags',
      'openingHours', 'isOpenNow', 'lat', 'lng', 'menu', 'tables', 'featured', 'trending',
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
    });
    if (typeof updates.cuisine === 'string') updates.cuisine = updates.cuisine.split(',').map((item) => item.trim()).filter(Boolean);
    if (typeof updates.tags === 'string') updates.tags = updates.tags.split(',').map((item) => item.trim()).filter(Boolean);
    if (typeof updates.ambienceTags === 'string') updates.ambienceTags = updates.ambienceTags.split(',').map((item) => item.trim()).filter(Boolean);

    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    const user = await User.findById(req.user._id);
    const id = restaurant._id.toString();
    const favoriteIds = (user.favorites || []).map((favorite) => favorite.toString());
    const isFavorite = favoriteIds.includes(id);
    user.favorites = isFavorite
      ? user.favorites.filter((favorite) => favorite.toString() !== id)
      : [...(user.favorites || []), restaurant._id];
    await user.save();
    await user.populate('favorites');
    res.json({ favorite: !isFavorite, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user?.favorites || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addReview = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    const review = {
      userId: req.user._id,
      userName: req.user.name,
      rating: Number(req.body.rating) || 5,
      ambience: Number(req.body.ambience) || Number(req.body.rating) || 5,
      food: Number(req.body.food) || Number(req.body.rating) || 5,
      service: Number(req.body.service) || Number(req.body.rating) || 5,
      value: Number(req.body.value) || Number(req.body.rating) || 5,
      comment: req.body.comment || '',
    };
    restaurant.reviews.push(review);
    const reviewCount = restaurant.reviews.length;
    const total = restaurant.reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    restaurant.rating = Number((total / reviewCount).toFixed(1));
    restaurant.numReviews = Math.max(Number(restaurant.numReviews || 0), reviewCount);
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchMenu = async (req, res) => {
  try {
    const { q = '', isVeg, maxPrice } = req.query;
    const rx = new RegExp(escapeRegex(q), 'i');
    const restaurants = await Restaurant.find(q ? { 'menu.name': rx } : { menu: { $exists: true, $ne: [] } }).limit(80);
    const results = [];
    restaurants.forEach((restaurant) => {
      (restaurant.menu || []).forEach((item) => {
        const matchesQuery = !q || rx.test(item.name) || rx.test(item.category);
        const matchesVeg = isVeg !== 'true' || item.isVeg;
        const matchesPrice = !maxPrice || Number(item.price) <= Number(maxPrice);
        if (matchesQuery && matchesVeg && matchesPrice) {
          results.push({
            restaurant: {
              _id: restaurant._id,
              name: restaurant.name,
              area: restaurant.area,
              rating: restaurant.rating,
              image: restaurant.image,
            },
            item,
          });
        }
      });
    });
    res.json(results.sort((a, b) => b.restaurant.rating - a.restaurant.rating).slice(0, 60));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const OpenAI = require('openai');

const buildItinerary = async (req, res) => {
  try {
    const { area, occasion = 'evening', budget } = req.query;

    const filter = {};
    if (area) {
      const rx = new RegExp(escapeRegex(area), 'i');
      filter.$or = [{ area: rx }, { address: rx }, { city: rx }];
    }
    if (budget) filter.priceRange = budget;

    const candidates = await Restaurant.find(filter)
      .sort({ featured: -1, rating: -1, numReviews: -1 })
      .limit(40);

    // ── Categorise candidates ──────────────────────────────────────
    const isType = (r, pattern) =>
      pattern.test(
        `${r.cuisine?.join(' ')} ${r.tags?.join(' ')} ${r.ambienceTags?.join(' ')} ${r.searchText} ${r.name}`
      );

    const dinner = candidates.find(
      (r) => !isType(r, /cafe|coffee|bakery|dessert|ice|sweet|bar|lounge/i)
    ) || candidates[0];

    const dessertCafe = candidates.find(
      (r) =>
        r._id?.toString() !== dinner?._id?.toString() &&
        isType(r, /cafe|coffee|dessert|bakery|ice cream|sweet|patisserie/i)
    ) || candidates.find((r) => r._id?.toString() !== dinner?._id?.toString() && r !== dinner);

    const rooftopOrLounge = candidates.find(
      (r) =>
        r._id?.toString() !== dinner?._id?.toString() &&
        r._id?.toString() !== dessertCafe?._id?.toString() &&
        isType(r, /rooftop|lounge|bar|terrace|view|sky|pool/i)
    );

    // ── Static experience stops based on area ─────────────────────
    const areaName = area || dinner?.area || 'Chennai';

    const experienceStops = {
      'ECR': [
        { type: 'experience', title: 'Sunset at the Beach', time: '17:30', place: 'East Coast Road Shoreline', description: 'Watch the golden hour light hit the Bay of Bengal. Perfect for a short walk and photos.', icon: '🌅', tip: 'The stretch near Kovalam village is quieter.' },
        { type: 'experience', title: 'Explore Dakshinachitra', time: '16:30', place: 'DakshinaChitra Museum, ECR', description: 'Heritage museum showcasing South Indian art, craft and architecture. Great pre-dinner cultural experience.', icon: '🎨', tip: 'Closes at 6PM — arrive by 4:30.' },
      ],
      'Adyar': [
        { type: 'experience', title: 'Adyar River Walk', time: '17:30', place: 'Adyar Eco Park', description: 'A calm riverside stroll through the mangrove-lined estuary. Peaceful before a dinner out.', icon: '🌿', tip: 'Free entry, best at dusk.' },
        { type: 'experience', title: 'Theosophical Society Gardens', time: '17:00', place: 'Theosophical Society, Adyar', description: 'Stroll through centuries-old tree canopies. One of Chennai\'s hidden green gems.', icon: '🌳', tip: 'Entry by foot only, closes at 5:30PM.' },
      ],
      'Anna Nagar': [
        { type: 'experience', title: 'Sunset at Anna Nagar Tower Park', time: '17:45', place: 'Anna Nagar Tower Park', description: 'Iconic park with a clock tower. Great for evening walks and a quick breather before dinner.', icon: '🌆', tip: 'The 2nd Avenue food street is walking distance away.' },
      ],
      'T Nagar': [
        { type: 'experience', title: 'Walk Pondy Bazaar', time: '18:00', place: 'Pondy Bazaar, T Nagar', description: 'Experience Chennai\'s most iconic pedestrian shopping street. Great energy and street food to kick things off.', icon: '🛍️', tip: 'Try the roadside chaats before your main dinner.' },
      ],
      'Besant Nagar': [
        { type: 'experience', title: 'Elliott\'s Beach Evening', time: '17:30', place: 'Elliott\'s Beach (Bessie Beach)', description: 'Walk along Chennai\'s finest beach at sunset. The promenade is lively with food stalls and local life.', icon: '🏖️', tip: 'Try the sundal (spiced chickpeas) from beach vendors.' },
      ],
      'Nungambakkam': [
        { type: 'experience', title: 'Art Gallery Walk', time: '17:30', place: 'Nungambakkam Art Cluster', description: 'Several indie galleries along Cathedral Road host evening exhibitions. Great cultural start.', icon: '🖼️', tip: 'Check Apparao Galleries — often open till 7PM.' },
      ],
      'Mylapore': [
        { type: 'experience', title: 'Kapaleeshwarar Temple Evening', time: '17:30', place: 'Kapaleeshwarar Temple, Mylapore', description: 'One of Chennai\'s most revered temples comes alive at dusk with evening prayers and the scent of jasmine.', icon: '🛕', tip: 'The flower market lanes nearby are perfect for a sensory stroll.' },
        { type: 'experience', title: 'San Thome Beach Walk', time: '18:30', place: 'San Thome Beach Promenade', description: 'A quiet, less-crowded beach stretch with the historic San Thome Basilica as a backdrop.', icon: '⛪', tip: 'Best experienced after 6PM when the breeze picks up.' },
      ],
      'Velachery': [
        { type: 'experience', title: 'Phoenix Market City Stroll', time: '17:00', place: 'Phoenix Market City, Velachery', description: 'Chennai\'s premium mall for a window-shopping walkthrough, light snack, and pre-dinner vibe.', icon: '🛒', tip: 'The food court on the top floor has great quick bites before your main meal.' },
      ],
      'OMR': [
        { type: 'experience', title: 'Sholinganallur Lake Walk', time: '17:30', place: 'Sholinganallur Marsh Reserve', description: 'A peaceful lakeside walk through one of Chennai\'s largest marshes. Great for birdwatching at dusk.', icon: '🦢', tip: 'Carry water and comfortable shoes — the trail is about 2km.' },
      ],
      'Guindy': [
        { type: 'experience', title: 'Guindy National Park Sunset', time: '17:00', place: 'Guindy National Park', description: 'One of the few national parks inside a city in India. Spot spotted deer and blackbucks at dusk.', icon: '🦌', tip: 'Closes at 5:30PM — plan accordingly. Worth the early start.' },
      ],
      'Porur': [
        { type: 'experience', title: 'Porur Lake Lakefront', time: '17:30', place: 'Porur Lake Front Park', description: 'A scenic lake with a walking track and evening breeze. Popular with families and joggers at dusk.', icon: '🌅', tip: 'The western bank gets the best sunset views.' },
      ],
    };

    // Async function to generate experiences via AI for unknown areas
    const aiApiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    const generateAIExperiences = async (area, occasion) => {
      if (!aiApiKey) return null;
      try {
        const openai = new OpenAI({
          apiKey: aiApiKey,
          baseURL: process.env.OPENROUTER_API_KEY ? (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1') : undefined,
          defaultHeaders: process.env.OPENROUTER_API_KEY
            ? { 'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000', 'X-Title': 'DineSmart Evening Planner' }
            : undefined,
        });
        const completion = await openai.chat.completions.create({
          model: process.env.AI_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content: 'You are a Chennai local expert and evening itinerary planner. Return ONLY valid JSON.',
            },
            {
              role: 'user',
              content: `Generate 2 real, specific local evening experiences for someone spending an evening in "${area}", Chennai.
The occasion is "${occasion}". Think: parks, viewpoints, temples, markets, beaches, art galleries, heritage walks.
Return this exact JSON:
[{"title": "string", "place": "exact place name, area", "description": "2-3 sentences", "icon": "1 emoji", "tip": "1 practical insider tip"}]`,
            },
          ],
        });
        const content = completion.choices[0].message.content.trim();
        const match = content.match(/\[[\s\S]*\]/);
        if (!match) return null;
        const parsed = JSON.parse(match[0]);
        return parsed.map((exp) => ({ type: 'experience', ...exp }));
      } catch (err) {
        console.error('AI experience generation failed:', err.message);
        return null;
      }
    };

    // Find the best matching area experiences, with AI fallback
    const areaKey = Object.keys(experienceStops).find((k) =>
      new RegExp(k, 'i').test(areaName)
    );

    let areaExperiences;
    if (areaKey) {
      areaExperiences = experienceStops[areaKey];
    } else {
      // Try AI-generated experiences for unknown areas
      const aiExperiences = await generateAIExperiences(areaName, occasion);
      if (aiExperiences && aiExperiences.length > 0) {
        areaExperiences = aiExperiences;
      } else {
        // Final static fallback
        areaExperiences = [
          {
            type: 'experience',
            title: `Evening in ${areaName}`,
            time: '18:00',
            place: `${areaName} neighbourhood, Chennai`,
            description: `Explore the local streets and culture of ${areaName} before your dinner. Chennai's neighbourhoods come alive in the evening with street food, markets and local life.`,
            icon: '🚶',
            tip: 'Ask locals for hidden street food gems along the way.',
          },
        ];
      }
    }

    // ── Build the full stops timeline ─────────────────────────────
    const occasionTimings = {
      evening: { preExp: '17:30', preDrink: '18:30', dinner: '19:30', dessert: '21:15', nightcap: '22:15' },
      dinner: { preExp: '18:30', preDrink: '19:00', dinner: '19:30', dessert: '21:00', nightcap: '22:00' },
      date: { preExp: '17:00', preDrink: '18:30', dinner: '19:30', dessert: '21:30', nightcap: '22:30' },
      family: { preExp: '17:00', preDrink: null, dinner: '19:00', dessert: '20:30', nightcap: null },
    };
    const timings = occasionTimings[occasion] || occasionTimings.evening;

    const stops = [
      // Pre-dinner experience
      areaExperiences[0] && {
        type: 'experience',
        title: areaExperiences[0].title,
        time: timings.preExp,
        place: areaExperiences[0].place,
        description: areaExperiences[0].description,
        icon: areaExperiences[0].icon,
        tip: areaExperiences[0].tip,
        reason: 'Sets the mood before the evening begins.',
      },

      // Optional pre-dinner drinks (from rooftop/lounge candidate)
      rooftopOrLounge && timings.preDrink && {
        type: 'restaurant',
        title: 'Pre-dinner drinks & bites',
        time: timings.preDrink,
        restaurant: rooftopOrLounge,
        reason: 'A rooftop or lounge setting for a relaxed pre-dinner drink. Great for appetisers and the city view.',
        tip: 'Arrive early for the best seats.',
      },

      // Main dinner
      dinner && {
        type: 'restaurant',
        title: occasion === 'date' ? 'Romantic dinner' : occasion === 'family' ? 'Family dinner' : 'Main dinner',
        time: timings.dinner,
        restaurant: dinner,
        reason: 'The centrepiece of the evening — curated for your area and budget.',
        tip: 'Book ahead to secure a preferred table.',
      },

      // Second area experience if available
      areaExperiences[1] && {
        type: 'experience',
        title: areaExperiences[1].title,
        time: '21:00',
        place: areaExperiences[1].place,
        description: areaExperiences[1].description,
        icon: areaExperiences[1].icon,
        tip: areaExperiences[1].tip,
        reason: 'A local cultural or natural experience to enrich the evening.',
      },

      // Dessert & coffee stop
      dessertCafe && {
        type: 'restaurant',
        title: 'Dessert & coffee',
        time: timings.dessert,
        restaurant: dessertCafe,
        reason: 'End the meal on a sweet note — a café or dessert spot to linger over the evening.',
        tip: 'Try the chef\'s special dessert.',
      },

      // Nightcap suggestion (static)
      timings.nightcap && {
        type: 'experience',
        title: 'Night walk & wind-down',
        time: timings.nightcap,
        place: areaName,
        description: `A gentle evening stroll around ${areaName} to close the night. Chennai is safe and vibrant even late.`,
        icon: '🌙',
        tip: 'Great time for a quiet conversation and enjoying the city lights.',
        reason: 'The perfect soft close to a polished evening.',
      },
    ].filter(Boolean);

    res.json({
      occasion,
      area: areaName,
      summary: dinner
        ? `A complete ${occasion} itinerary around ${areaName} — from pre-dinner experiences to dinner, dessert, and a relaxed close.`
        : `No restaurants found for ${areaName}. Try a different area or broaden your filters.`,
      stops,
      meta: {
        totalStops: stops.length,
        restaurantStops: stops.filter((s) => s.type === 'restaurant').length,
        experienceStops: stops.filter((s) => s.type === 'experience').length,
        estimatedDuration: '5–6 hours',
        startTime: stops[0]?.time || '17:30',
        endTime: stops[stops.length - 1]?.time || '22:30',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminAnalytics = async (req, res) => {
  try {
    const [restaurantCount, bookingCount, confirmedCount, userCount, revenueProxy, topRestaurants] = await Promise.all([
      Restaurant.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      User.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $lookup: { from: 'restaurants', localField: 'restaurantId', foreignField: '_id', as: 'restaurant' } },
        { $unwind: '$restaurant' },
        { $group: { _id: null, value: { $sum: '$restaurant.avgCostForTwo' } } },
      ]),
      Booking.aggregate([
        { $group: { _id: '$restaurantId', bookings: { $sum: 1 } } },
        { $sort: { bookings: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'restaurant' } },
        { $unwind: '$restaurant' },
        { $project: { bookings: 1, name: '$restaurant.name', area: '$restaurant.area' } },
      ]),
    ]);
    res.json({
      restaurantCount,
      bookingCount,
      confirmedCount,
      userCount,
      revenueProxy: revenueProxy[0]?.value || 0,
      topRestaurants,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fetchAndStoreFromGoogle = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const osmRestaurants = await searchRestaurants(query);
    const savedRestaurants = [];

    for (const rest of osmRestaurants) {
      try {
        let cuisine = ['Various'];
        if (rest.types && rest.types.length > 0) {
          const mainType = rest.types.find((type) =>
            !['restaurant', 'food', 'point_of_interest', 'establishment', 'yes'].includes(type)
          );
          if (mainType) {
            cuisine = [mainType.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())];
          }
        }

        const areaName = rest.address.split(',')[0] || 'Unknown';
        const updated = await Restaurant.findOneAndUpdate(
          { name: rest.name, address: rest.address },
          {
            name: rest.name,
            address: rest.address,
            location: areaName,
            area: areaName,
            lat: rest.lat,
            lng: rest.lng,
            rating: rest.rating,
            types: rest.types,
            cuisine,
            source: 'osm',
          },
          { new: true, upsert: true, runValidators: false }
        );
        savedRestaurants.push(updated);
      } catch (err) {
        console.error(`Error saving ${rest.name}:`, err.message);
      }
    }

    res.json(savedRestaurants);
  } catch (error) {
    console.error('Fetch OSM error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantMeta,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleFavorite,
  getFavorites,
  addReview,
  searchMenu,
  buildItinerary,
  getAdminAnalytics,
  fetchAndStoreFromGoogle,
};
