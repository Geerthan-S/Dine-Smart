const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const data = require('./chennai_restaurants_enhanced.json');

// Minimal schema matching the JSON exactly
const MenuItemSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    price:    { type: Number, required: true, min: 0 },
    category: { type: String, required: true, enum: ['Starter', 'Main Course', 'Dessert', 'Beverage'] },
    isVeg:    { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const TableConfigSchema = new mongoose.Schema(
  {
    capacity: { type: Number, required: true, enum: [2, 4, 6, 8, 10] },
    count:    { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const RestaurantSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    brand:         { type: String, trim: true, default: null },
    address:       { type: String, required: true, trim: true },
    area:          { type: String, required: true, trim: true },
    city:          { type: String, required: true, default: 'Chennai' },
    lat:           { type: Number, required: true },
    lng:           { type: Number, required: true },
    cuisine:       { type: [String], required: true },
    priceRange:    { type: String, required: true, enum: ['low', 'medium', 'high', 'budget', 'mid-range', 'premium', 'luxury'] },
    avgCostForTwo: { type: Number, default: 0 },
    isVeg:         { type: Boolean, default: false },
    tags:          { type: [String], default: [] },
    rating:        { type: Number, default: 4.0 },
    numReviews:    { type: Number, default: 0 },
    openingHours:  { type: String, default: '10:00 AM - 10:00 PM' },
    isOpenNow:     { type: Boolean, default: true },
    menu:          { type: [MenuItemSchema], default: [] },
    tables:        { type: [TableConfigSchema], default: [] },
    description:   { type: String, default: '' },
    image:         { type: String, default: '' },
    source:        { type: String, default: 'open-data' },
    searchText:    { type: String, default: '' },
    types:         { type: [String], default: [] },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'restaurants' }
);

RestaurantSchema.index({ name: 1, address: 1 }, { unique: true });

async function seed() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!');

    const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

    // Prepare records — map source field
    const records = data.map(r => ({
      ...r,
      source: r.source || 'open-data',
      cuisine: Array.isArray(r.cuisine) ? r.cuisine : [r.cuisine],
    }));

    console.log(`📦 Seeding ${records.length} restaurants...`);

    let inserted = 0;
    let skipped = 0;

    for (const rec of records) {
      try {
        await Restaurant.findOneAndUpdate(
          { name: rec.name, address: rec.address },
          { $set: rec },
          { upsert: true, new: true }
        );
        inserted++;
        process.stdout.write(`\r✅ Processed: ${inserted + skipped}/${records.length}`);
      } catch (err) {
        skipped++;
        console.error(`\n⚠️  Skipped "${rec.name}": ${err.message}`);
      }
    }

    console.log(`\n\n🎉 Done! Inserted/Updated: ${inserted}, Skipped: ${skipped}`);
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
