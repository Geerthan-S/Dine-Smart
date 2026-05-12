const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { randomUUID } = require('crypto');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Table = require('./models/Table');
const Booking = require('./models/Booking');

dotenv.config();

const seedSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding sample data...');

    // 1. Fetch some existing restaurants to assign owners
    const restaurants = await Restaurant.find().limit(3);
    if (restaurants.length === 0) {
      console.log('No restaurants found. Run npm run seed first.');
      process.exit(1);
    }

    // 2. Create sample owners
    const owners = [
      { name: 'Gordon Ramsay', email: 'gordon@dinesmart.com', role: 'owner' },
      { name: 'Alice Waters', email: 'alice@dinesmart.com', role: 'owner' },
    ];

    const createdOwners = [];
    for (let i = 0; i < owners.length; i++) {
      const existing = await User.findOne({ email: owners[i].email });
      if (existing) {
        await User.findByIdAndDelete(existing._id); // clean up existing for fresh start
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      const owner = await User.create({
        ...owners[i],
        password: hashedPassword,
        ownedRestaurants: [restaurants[i]._id],
      });
      restaurants[i].ownerId = owner._id;
      await restaurants[i].save();
      createdOwners.push(owner);
      console.log(`Created owner: ${owner.name}`);
    }

    // 3. Create a normal user for bookings
    let customer = await User.findOne({ email: 'customer@test.com' });
    if (!customer) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      customer = await User.create({
        name: 'Test Customer',
        email: 'customer@test.com',
        password: hashedPassword,
        role: 'user',
      });
    }

    // 4. Create sample bookings for the first restaurant
    const targetRestaurant = restaurants[0];
    const tables = await Table.find({ restaurantId: targetRestaurant._id });
    if (tables.length === 0) {
      console.log('No tables found for the target restaurant. Skipping bookings.');
      process.exit(0);
    }

    // Clear old sample bookings for this user/restaurant
    await Booking.deleteMany({ userId: customer._id, restaurantId: targetRestaurant._id });

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const mockBookings = [
      {
        userId: customer._id,
        restaurantId: targetRestaurant._id,
        tableId: tables[0]._id,
        date: today,
        time: '19:00',
        numberOfPeople: 2,
        status: 'confirmed',
        qrToken: randomUUID(),
        checkedIn: true,
        checkInTime: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        userId: customer._id,
        restaurantId: targetRestaurant._id,
        tableId: tables[1]._id,
        date: today,
        time: '20:30',
        numberOfPeople: 4,
        status: 'confirmed',
        qrToken: randomUUID(),
      },
      {
        userId: customer._id,
        restaurantId: targetRestaurant._id,
        tableId: tables[0]._id,
        date: yesterday,
        time: '18:00',
        numberOfPeople: 2,
        status: 'cancelled',
        qrToken: randomUUID(),
      },
      {
        userId: customer._id,
        restaurantId: targetRestaurant._id,
        tableId: tables[2]._id,
        date: today,
        time: '21:00',
        numberOfPeople: 6,
        status: 'confirmed',
        qrToken: randomUUID(),
      }
    ];

    await Booking.insertMany(mockBookings);
    console.log(`Inserted ${mockBookings.length} sample bookings for ${targetRestaurant.name}`);

    console.log('Sample data seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedSampleData();
