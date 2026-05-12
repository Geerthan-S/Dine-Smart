const OpenAI = require('openai');
const Restaurant = require('../models/Restaurant');

const AI_MODEL = process.env.AI_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey,
  baseURL: process.env.OPENROUTER_API_KEY ? OPENROUTER_BASE_URL : undefined,
  defaultHeaders: process.env.OPENROUTER_API_KEY
    ? {
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'DineSmart AI',
      }
    : undefined,
});

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseJsonObject = (content = '') => {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found');
    return JSON.parse(match[0]);
  }
};

const asArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

const normalize = (value = '') => String(value).toLowerCase().trim();

const budgetToRange = (budget = '') => {
  const value = normalize(budget);
  const amount = Number((value.match(/\d+/) || [])[0]);

  if (value.includes('cheap') || value.includes('budget') || value.includes('low') || amount <= 500) return 'low';
  if (value.includes('premium') || value.includes('fine') || value.includes('luxury') || amount >= 1800) return 'high';
  if (value.includes('mid') || value.includes('moderate') || amount > 500) return 'medium';
  return null;
};

const findMentionedValues = (query, values) => {
  const text = normalize(query);
  return values.filter((value) => {
    const item = normalize(value);
    return item && new RegExp(`\\b${escapeRegex(item)}\\b`, 'i').test(text);
  });
};

const enrichPreferencesFromCatalog = async (preferences, query) => {
  const [areas, cuisines] = await Promise.all([
    Restaurant.distinct('area'),
    Restaurant.distinct('cuisine'),
  ]);

  const mentionedAreas = findMentionedValues(query, areas);
  const mentionedCuisines = findMentionedValues(query, cuisines);
  const mentionedDishes = ['biryani', 'dosa', 'idli', 'pizza', 'coffee', 'seafood', 'noodles', 'meals', 'thali', 'dessert']
    .filter((dish) => normalize(query).includes(dish));

  return {
    ...preferences,
    location: mentionedAreas[0] || preferences.location || null,
    cuisine: [...new Set([...mentionedCuisines, ...asArray(preferences.cuisine)])],
    dishes: [...new Set([...mentionedDishes, ...asArray(preferences.dishes)])],
    budget: preferences.budget || (budgetToRange(query) ? query : null),
  };
};

const includesAny = (haystack, needles) => {
  const text = normalize(haystack);
  return needles.some((needle) => text.includes(normalize(needle)));
};

const scoreRestaurant = (restaurant, preferences, originalQuery) => {
  const cuisines = asArray(preferences.cuisine);
  const dishes = asArray(preferences.dishes);
  const tags = asArray(preferences.tags);
  const location = preferences.location;
  const desiredPrice = budgetToRange(preferences.budget);
  const diningType = preferences.diningType;
  const queryTerms = normalize(originalQuery).split(/\s+/).filter((word) => word.length > 3);
  const searchBlob = [
    restaurant.name,
    restaurant.brand,
    restaurant.area,
    restaurant.address,
    restaurant.description,
    restaurant.searchText,
    ...(restaurant.cuisine || []),
    ...(restaurant.tags || []),
    ...(restaurant.menu || []).map((item) => item.name),
  ].join(' ');

  let score = Number(restaurant.rating || 0) * 8 + Math.log10(Number(restaurant.numReviews || 0) + 1) * 4;
  const reasons = [];

  if (cuisines.length && includesAny((restaurant.cuisine || []).join(' '), cuisines)) {
    score += 35;
    reasons.push(`matches ${cuisines[0]} cuisine`);
  }

  if (dishes.length && includesAny((restaurant.menu || []).map((item) => item.name).join(' '), dishes)) {
    score += 28;
    reasons.push(`serves ${dishes[0]}`);
  }

  if (location && includesAny(`${restaurant.area} ${restaurant.address} ${restaurant.city}`, [location])) {
    score += 24;
    reasons.push(`located in ${restaurant.area}`);
  }

  if (desiredPrice && restaurant.priceRange === desiredPrice) {
    score += 18;
    reasons.push(`fits the ${desiredPrice} budget`);
  }

  if (typeof preferences.isVeg === 'boolean' && restaurant.isVeg === preferences.isVeg) {
    score += 14;
    reasons.push(preferences.isVeg ? 'pure vegetarian fit' : 'has non-veg options');
  }

  if (diningType && includesAny(`${restaurant.tags?.join(' ')} ${restaurant.searchText}`, [diningType])) {
    score += 14;
    reasons.push(`good for ${diningType} dining`);
  }

  if (tags.length && includesAny(`${restaurant.tags?.join(' ')} ${restaurant.searchText}`, tags)) {
    score += 10;
  }

  const queryHits = queryTerms.filter((term) => normalize(searchBlob).includes(term)).length;
  score += queryHits * 3;

  return {
    restaurant,
    score,
    reasons: reasons.slice(0, 3),
  };
};

const buildCandidateFilter = (preferences) => {
  const clauses = [];
  const cuisines = asArray(preferences.cuisine);
  const dishes = asArray(preferences.dishes);
  const location = preferences.location;

  if (cuisines.length) {
    const regexes = cuisines.map((item) => new RegExp(escapeRegex(item), 'i'));
    clauses.push({ $or: regexes.flatMap((rx) => [{ cuisine: rx }, { searchText: rx }, { tags: rx }]) });
  }

  if (dishes.length) {
    const regexes = dishes.map((item) => new RegExp(escapeRegex(item), 'i'));
    clauses.push({ $or: regexes.flatMap((rx) => [{ 'menu.name': rx }, { searchText: rx }]) });
  }

  if (location) {
    const rx = new RegExp(escapeRegex(location), 'i');
    clauses.push({ $or: [{ area: rx }, { address: rx }, { city: rx }, { location: rx }] });
  }

  if (typeof preferences.isVeg === 'boolean') {
    clauses.push({ isVeg: preferences.isVeg });
  }

  return clauses.length ? { $and: clauses } : {};
};

const buildLocationFilter = (location) => {
  if (!location) return {};
  const rx = new RegExp(escapeRegex(location), 'i');
  return { $or: [{ area: rx }, { address: rx }, { city: rx }, { location: rx }] };
};

const getPreferences = async (query) => {
  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    temperature: 0.15,
    messages: [
      {
        role: 'system',
        content:
          'You are a personal dining adviser for a Chennai restaurant booking app. Extract practical dining preferences. Return only valid JSON.',
      },
      {
        role: 'user',
        content: `
User request: "${query}"

Return only this JSON shape:
{
  "cuisine": ["one or more cuisine names, or empty array"],
  "dishes": ["specific dishes mentioned, or empty array"],
  "budget": "budget phrase or null",
  "location": "Chennai area or null",
  "diningType": "romantic/casual/family/business/fine-dining/quick-bite or null",
  "suggestedTime": "breakfast/lunch/dinner/snack or null",
  "isVeg": true/false/null,
  "partySize": number or null,
  "tags": ["preference tags like spicy, buffet, cafe, rooftop, kid-friendly"]
}
        `.trim(),
      },
    ],
  });

  return parseJsonObject(completion.choices[0].message.content.trim());
};

const fallbackPreferences = (query) => {
  const text = normalize(query);
  return {
    cuisine: ['South Indian', 'North Indian', 'Chinese', 'Biryani', 'Seafood', 'Italian', 'Cafe', 'Chettinad']
      .filter((item) => text.includes(normalize(item))),
    dishes: ['biryani', 'dosa', 'idli', 'pizza', 'coffee', 'seafood', 'noodles', 'meals']
      .filter((item) => text.includes(item)),
    budget: text.includes('cheap') || text.includes('budget') ? 'budget' : null,
    location: null,
    diningType: text.includes('romantic') ? 'romantic' : text.includes('family') ? 'family' : null,
    suggestedTime: text.includes('breakfast') ? 'breakfast' : text.includes('lunch') ? 'lunch' : text.includes('dinner') ? 'dinner' : null,
    isVeg: text.includes('veg') && !text.includes('non veg') ? true : null,
    partySize: null,
    tags: [],
  };
};

const getRecommendations = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });
    if (!apiKey) return res.status(500).json({ message: 'AI API key is not configured' });

    let preferences;
    let usedFallback = false;

    try {
      preferences = await getPreferences(query);
    } catch (error) {
      console.error('AI preference extraction failed:', error.message);
      preferences = fallbackPreferences(query);
      usedFallback = true;
    }

    preferences = await enrichPreferencesFromCatalog(preferences, query);

    const candidateFilter = buildCandidateFilter(preferences);
    let candidates = await Restaurant.find(candidateFilter).limit(80);

    if (candidates.length === 0 && preferences.location) {
      candidates = await Restaurant.find(buildLocationFilter(preferences.location)).sort({ rating: -1, numReviews: -1 }).limit(20);
    }

    if (preferences.location && candidates.length > 0 && candidates.length < 5) {
      const areaMatches = await Restaurant.find(buildLocationFilter(preferences.location)).sort({ rating: -1, numReviews: -1 }).limit(20);
      const existingIds = new Set(candidates.map((restaurant) => restaurant._id.toString()));
      candidates = [...candidates, ...areaMatches.filter((restaurant) => !existingIds.has(restaurant._id.toString()))];
    }

    if (candidates.length === 0) {
      const broader = await Restaurant.find().sort({ rating: -1, numReviews: -1 }).limit(124);
      candidates = broader;
    }

    const ranked = candidates
      .map((restaurant) => scoreRestaurant(restaurant, preferences, query))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const recommendations = ranked.map(({ restaurant }) => restaurant);
    const matchReasons = Object.fromEntries(
      ranked.map(({ restaurant, reasons }) => [restaurant._id.toString(), reasons.length ? reasons : ['strong overall fit']])
    );

    const top = ranked[0]?.restaurant;
    const advisorMessage = top
      ? `I would start with ${top.name} in ${top.area}. It best balances your request with rating, menu fit, budget, and location from the Chennai catalog.`
      : 'I could not find a strong match yet. Try adding an area, cuisine, budget, or occasion.';

    res.json({
      model: AI_MODEL,
      usedFallback,
      preferences,
      advisorMessage,
      matchReasons,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecommendations };
