const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    price:       { type: Number, required: true, min: 0 },
    category:    { type: String, required: true, enum: ['Starter', 'Main Course', 'Dessert', 'Beverage'] },
    isVeg:       { type: Boolean, required: true, default: false },
    description: { type: String, default: '' },
    imageUrl:    { type: String, default: '' },
  },
  { _id: true }
);

const TableConfigSchema = new mongoose.Schema(
  {
    capacity: { type: Number, required: true, enum: [2, 4, 6, 8, 10] },
    count:    { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ReviewReplySchema = new mongoose.Schema(
  {
    text:       { type: String, trim: true, default: '' },
    repliedAt:  { type: Date, default: null },
    repliedBy:  { type: String, default: 'Owner' },
  },
  { _id: false }
);

const ReviewSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, trim: true, default: 'Guest' },
    rating:   { type: Number, min: 1, max: 5, required: true },
    ambience: { type: Number, min: 1, max: 5, default: 5 },
    food:     { type: Number, min: 1, max: 5, default: 5 },
    service:  { type: Number, min: 1, max: 5, default: 5 },
    value:    { type: Number, min: 1, max: 5, default: 5 },
    comment:  { type: String, trim: true, default: '' },
    reply:    { type: ReviewReplySchema, default: null },
  },
  { timestamps: true }
);

const DynamicPricingRuleSchema = new mongoose.Schema(
  {
    label:           { type: String, required: true },
    dayPattern:      { type: String, enum: ['weekday', 'weekend', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'everyday'], default: 'everyday' },
    timeStart:       { type: String, default: '00:00' },
    timeEnd:         { type: String, default: '23:59' },
    type:            { type: String, enum: ['discount', 'surcharge'], default: 'discount' },
    percent:         { type: Number, min: 0, max: 100, default: 10 },
    active:          { type: Boolean, default: true },
  },
  { _id: true }
);

const restaurantSchema = new mongoose.Schema(
  {
    // Identity
    name:    { type: String, required: [true, 'Restaurant name is required'], trim: true },
    brand:   { type: String, trim: true, default: null },

    // Location
    address:  { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    area:     { type: String, trim: true, default: '' },
    city:     { type: String, trim: true, default: 'Chennai' },
    lat:      { type: Number, default: 0 },
    lng:      { type: Number, default: 0 },

    // Classification
    cuisine:       { type: [String], default: [] },
    priceRange:    { type: String, enum: ['low', 'medium', 'high', 'budget', 'mid-range', 'premium', 'luxury'], default: 'medium' },
    avgCostForTwo: { type: Number, default: 0 },
    isVeg:         { type: Boolean, default: false },
    tags:          { type: [String], default: [] },
    types:         { type: [String], default: [] },
    ambienceTags:  { type: [String], default: [] },
    featured:      { type: Boolean, default: false },
    trending:      { type: Boolean, default: false },

    // Ratings
    rating:     { type: Number, default: 4.0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },

    // Operations
    openingHours: { type: String, default: '' },
    isOpenNow:    { type: Boolean, default: true },

    // Menu, Tables, Reviews
    menu:           { type: [MenuItemSchema], default: [] },
    tables:         { type: [TableConfigSchema], default: [] },
    reviews:        { type: [ReviewSchema], default: [] },
    dynamicPricing: { type: [DynamicPricingRuleSchema], default: [] },

    // Media & Meta
    description: { type: String, default: '' },
    image:       { type: String, default: '' },
    source:      { type: String, default: 'local' },
    searchText:  { type: String, default: '' },

    // Auth
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true, collection: 'restaurants' }
);

restaurantSchema.index({ name: 1, address: 1 }, { unique: true });
restaurantSchema.index({ searchText: 'text' }, { default_language: 'none' });
restaurantSchema.index({ cuisine: 1, priceRange: 1, rating: -1 });
restaurantSchema.index({ lat: 1, lng: 1 });
restaurantSchema.index({ area: 1, rating: -1 });
restaurantSchema.index({ isVeg: 1, rating: -1 });
restaurantSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
