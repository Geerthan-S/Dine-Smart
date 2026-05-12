/**
 * ============================================================
 *  RESTAURANT BOOKING + AI RECOMMENDATION SYSTEM
 *  Mongoose Schema · Indexes · Sample Queries
 *  Generated for: Chennai Restaurant Dataset (124 records)
 * ============================================================
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

// ─── SUB-SCHEMAS ─────────────────────────────────────────────────────────────

const MenuItemSchema = new Schema(
  {
    name:     { type: String, required: true, trim: true },
    price:    { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Starter", "Main Course", "Dessert", "Beverage"],
    },
    isVeg:    { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const TableConfigSchema = new Schema(
  {
    capacity: { type: Number, required: true, enum: [2, 4, 6, 8, 10] },
    count:    { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// ─── MAIN SCHEMA ─────────────────────────────────────────────────────────────

const RestaurantSchema = new Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    name:    { type: String, required: true, trim: true },
    brand:   { type: String, trim: true, default: null },   // null = independent

    // ── Location ──────────────────────────────────────────────────────────────
    address: { type: String, required: true, trim: true },
    area:    { type: String, required: true, trim: true },
    city:    { type: String, required: true, default: "Chennai" },
    lat:     { type: Number, required: true, min: 12.7,  max: 13.3  },
    lng:     { type: Number, required: true, min: 79.9,  max: 80.5  },

    // ── Classification ────────────────────────────────────────────────────────
    cuisine:    { type: [String], required: true },
    priceRange: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
    },
    avgCostForTwo: { type: Number, required: true, min: 0 },
    isVeg:         { type: Boolean, required: true, default: false },
    tags:          { type: [String], default: [] },

    // ── Ratings ───────────────────────────────────────────────────────────────
    rating:     { type: Number, min: 3.5, max: 4.8, default: 4.0 },
    numReviews: { type: Number, default: 0, min: 0 },

    // ── Operations ────────────────────────────────────────────────────────────
    openingHours: { type: String, required: true },
    isOpenNow:    { type: Boolean, default: true },

    // ── Menu ──────────────────────────────────────────────────────────────────
    menu: {
      type: [MenuItemSchema],
      validate: {
        validator: (v) => v.length >= 5 && v.length <= 10,
        message: "Menu must have between 5 and 10 items",
      },
    },

    // ── Booking ───────────────────────────────────────────────────────────────
    tables: { type: [TableConfigSchema], default: [] },

    // ── Media & Meta ──────────────────────────────────────────────────────────
    description: { type: String, default: "" },
    image:        { type: String, default: "" },
    source:       { type: String, enum: ["open-data", "synthetic", "partner"], default: "open-data" },

    // ── AI Search ─────────────────────────────────────────────────────────────
    searchText: { type: String, default: "" },
  },
  {
    timestamps: true,  // auto-manages createdAt + updatedAt
    collection: "restaurants",
  }
);

// ─── INDEXES ─────────────────────────────────────────────────────────────────

// 1. Unique constraint: same restaurant can't appear twice at same address
RestaurantSchema.index({ name: 1, address: 1 }, { unique: true });

// 2. Full-text index for AI semantic search
RestaurantSchema.index({ searchText: "text" }, { default_language: "none" });

// 3. Geospatial index (2dsphere) for map-based queries
RestaurantSchema.index({ lat: 1, lng: 1 });

// 4. Compound filter index (most common query pattern)
RestaurantSchema.index({ cuisine: 1, priceRange: 1, rating: -1 });

// 5. Tag-based filtering
RestaurantSchema.index({ tags: 1 });

// 6. Area-level filtering
RestaurantSchema.index({ area: 1, rating: -1 });

// 7. isVeg filter (frequently used in Chennai market)
RestaurantSchema.index({ isVeg: 1, rating: -1 });

// 8. Brand lookups for chain restaurants
RestaurantSchema.index({ brand: 1 });

// ─── VIRTUAL: Total Table Capacity ────────────────────────────────────────────
RestaurantSchema.virtual("totalCapacity").get(function () {
  return this.tables.reduce((sum, t) => sum + t.capacity * t.count, 0);
});

// ─── MODEL ────────────────────────────────────────────────────────────────────
const Restaurant = mongoose.model("Restaurant", RestaurantSchema);
module.exports = { Restaurant, RestaurantSchema };


// ═══════════════════════════════════════════════════════════════════════════════
//  SAMPLE MONGODB QUERIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ─── Q1: Filter by cuisine ───────────────────────────────────────────────────
 * Get all Chettinad restaurants, sorted by rating desc
 */
async function getByCuisine(cuisineName) {
  return Restaurant.find({ cuisine: cuisineName })
    .sort({ rating: -1 })
    .select("name address area rating avgCostForTwo isVeg tags image");
}
// Usage: getByCuisine("Chettinad")
// Usage: getByCuisine("Biryani")


/**
 * ─── Q2: Filter by price range ───────────────────────────────────────────────
 * Get budget restaurants under ₹300 for two, sorted by rating
 */
async function getByPriceRange(range) {
  return Restaurant.find({ priceRange: range })
    .sort({ rating: -1 })
    .select("name area cuisine rating avgCostForTwo isVeg priceRange");
}
// Usage: getByPriceRange("low")   → budget spots
// Usage: getByPriceRange("high")  → fine dining


/**
 * ─── Q3: AI Semantic Search using $text index ─────────────────────────────────
 * Full-text search across searchText field
 */
async function aiTextSearch(query) {
  return Restaurant.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }  // include relevance score
  )
    .sort({ score: { $meta: "textScore" }, rating: -1 })
    .limit(10)
    .select("name area cuisine rating avgCostForTwo tags description image searchText");
}
// Usage: aiTextSearch("spicy family biryani cheap")
// Usage: aiTextSearch("romantic fine dining vegetarian")
// Usage: aiTextSearch("breakfast filter coffee south indian")


/**
 * ─── Q4: Regex Search (fallback / partial keyword match) ──────────────────────
 * Search by name or description using case-insensitive regex
 */
async function regexSearch(keyword) {
  const rx = new RegExp(keyword, "i");
  return Restaurant.find({
    $or: [
      { name: rx },
      { description: rx },
      { searchText: rx },
    ],
  })
    .sort({ rating: -1 })
    .limit(10);
}
// Usage: regexSearch("biryani")
// Usage: regexSearch("coffee")


/**
 * ─── Q5: Combined filter (cuisine + price + veg) ──────────────────────────────
 */
async function advancedFilter({ cuisine, priceRange, isVeg, minRating = 3.5, area }) {
  const query = {};
  if (cuisine)    query.cuisine   = cuisine;
  if (priceRange) query.priceRange = priceRange;
  if (typeof isVeg === "boolean") query.isVeg = isVeg;
  if (minRating)  query.rating    = { $gte: minRating };
  if (area)       query.area      = new RegExp(area, "i");
  return Restaurant.find(query).sort({ rating: -1 });
}
// Usage: advancedFilter({ cuisine: "South Indian", priceRange: "low", isVeg: true })
// Usage: advancedFilter({ cuisine: "Seafood", minRating: 4.2, area: "OMR" })


/**
 * ─── Q6: AI-powered Recommendation (tag-based) ───────────────────────────────
 * Find restaurants matching a set of user preference tags
 */
async function recommendByTags(tags = [], limit = 5) {
  return Restaurant.find({ tags: { $all: tags } })
    .sort({ rating: -1 })
    .limit(limit)
    .select("name area cuisine rating avgCostForTwo tags description image");
}
// Usage: recommendByTags(["family-friendly", "budget"])
// Usage: recommendByTags(["romantic", "fine-dining"])


/**
 * ─── Q7: Table Availability ──────────────────────────────────────────────────
 * Get restaurants that have tables of at least N capacity
 */
async function withTableCapacity(minCapacity = 4) {
  return Restaurant.find({
    tables: { $elemMatch: { capacity: { $gte: minCapacity }, count: { $gt: 0 } } },
  }).sort({ rating: -1 });
}
// Usage: withTableCapacity(6)   → places for groups of 6+


/**
 * ─── Q8: Open Now ────────────────────────────────────────────────────────────
 */
async function getOpenNow(cuisine) {
  const q = { isOpenNow: true };
  if (cuisine) q.cuisine = cuisine;
  return Restaurant.find(q).sort({ rating: -1 }).limit(20);
}


/**
 * ─── Q9: Brand/Chain lookup ──────────────────────────────────────────────────
 */
async function getByBrand(brandName) {
  return Restaurant.find({ brand: new RegExp(brandName, "i") }).sort({ area: 1 });
}
// Usage: getByBrand("Domino's Pizza")   → all Domino's branches


/**
 * ─── Q10: Aggregation – Top Areas by Average Rating ─────────────────────────
 */
async function topAreasByRating() {
  return Restaurant.aggregate([
    { $group: {
        _id: "$area",
        avgRating:   { $avg: "$rating" },
        count:       { $sum: 1 },
        avgCostForTwo: { $avg: "$avgCostForTwo" },
    }},
    { $sort: { avgRating: -1 } },
    { $limit: 10 },
    { $project: { area: "$_id", avgRating: { $round: ["$avgRating", 2] }, count: 1, avgCostForTwo: { $round: ["$avgCostForTwo", 0] }, _id: 0 } },
  ]);
}


/**
 * ─── Q11: Aggregation – Cuisine Popularity ───────────────────────────────────
 */
async function cuisineStats() {
  return Restaurant.aggregate([
    { $unwind: "$cuisine" },
    { $group: {
        _id: "$cuisine",
        count:     { $sum: 1 },
        avgRating: { $avg: "$rating" },
        avgCost:   { $avg: "$avgCostForTwo" },
    }},
    { $sort: { count: -1 } },
    { $project: { cuisine: "$_id", count: 1, avgRating: { $round: ["$avgRating", 2] }, avgCost: { $round: ["$avgCost", 0] }, _id: 0 } },
  ]);
}


/**
 * ─── Q12: Menu-item search (find restaurants serving a dish) ─────────────────
 */
async function findByDish(dishName) {
  return Restaurant.find({
    "menu.name": new RegExp(dishName, "i"),
  })
    .sort({ rating: -1 })
    .select("name area cuisine menu rating avgCostForTwo");
}
// Usage: findByDish("Chicken Biryani")
// Usage: findByDish("Filter Coffee")


// ─── SEEDING HELPER ──────────────────────────────────────────────────────────
/**
 * Seed all records from the enhanced JSON into MongoDB.
 * Run once: node restaurant.schema.js seed
 */
async function seed() {
  const fs = require("fs");
  await mongoose.connect("mongodb://localhost:27017/restaurant_db");
  const data = JSON.parse(fs.readFileSync("./chennai_restaurants_enhanced.json", "utf8"));
  await Restaurant.deleteMany({});
  const result = await Restaurant.insertMany(data, { ordered: false });
  console.log(`✅ Seeded ${result.length} restaurants`);
  await mongoose.disconnect();
}

if (process.argv[2] === "seed") {
  seed().catch(console.error);
}
