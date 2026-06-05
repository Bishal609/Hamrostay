// server/src/utils/seed.js
// Run: node src/utils/seed.js
require("dotenv").config({ path: require("path").join(__dirname, "../../../.env") });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ROOMS = [
  { roomNumber: "101", name: "Classic Standard Room",    type: "STANDARD",     floor: 1, capacity: 2, pricePerNight: 89,   size: 280, bedType: "Queen", description: "A comfortable room with modern amenities perfect for solo travellers or couples.", amenities: ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Safe", "Mini-fridge"], images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"] },
  { roomNumber: "201", name: "Superior Deluxe Room",     type: "DELUXE",       floor: 2, capacity: 2, pricePerNight: 149,  size: 380, bedType: "King",  description: "Spacious deluxe room with premium furnishings and mountain views.", amenities: ["Free Wi-Fi", "King Bed", "Bathtub", "Minibar", "Room Service", "Air Conditioning"], images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80"], isFeatured: true },
  { roomNumber: "301", name: "Executive Suite",          type: "SUITE",        floor: 3, capacity: 3, pricePerNight: 299,  size: 560, bedType: "King",  description: "Luxurious suite with separate living area, premium amenities and panoramic views.", amenities: ["Living Room", "Jacuzzi", "Butler Service", "Premium Minibar", "Espresso Machine", "Pillow Menu"], images: ["https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&q=80"], isFeatured: true },
  { roomNumber: "401", name: "Presidential Suite",       type: "PRESIDENTIAL", floor: 4, capacity: 4, pricePerNight: 699,  size: 1200, bedType: "King", description: "The pinnacle of luxury — our Presidential Suite offers unparalleled opulence.", amenities: ["Private Terrace", "Private Pool", "Personal Butler", "Grand Piano", "Private Dining"], images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80"], isFeatured: true, discount: 10 },
  { roomNumber: "501", name: "Sky Penthouse",            type: "PENTHOUSE",    floor: 5, capacity: 6, pricePerNight: 1299, size: 2200, bedType: "King", description: "360-degree panoramic views, private rooftop terrace — the ultimate luxury experience.", amenities: ["Rooftop Terrace", "Private Pool", "Home Cinema", "Full Kitchen", "Dedicated Staff"], images: ["https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&q=80"], isFeatured: true },
  { roomNumber: "102", name: "Garden View Standard",     type: "STANDARD",     floor: 1, capacity: 2, pricePerNight: 79,   size: 260, bedType: "Twin", description: "Cozy room overlooking our beautiful garden — perfect for nature lovers.", amenities: ["Garden View", "Free Wi-Fi", "Air Conditioning", "Tea/Coffee Maker"], images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"] },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Users
  const adminPw  = await bcrypt.hash("admin123",  12);
  const guestPw  = await bcrypt.hash("guest123",  12);
  const vendorPw = await bcrypt.hash("vendor123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@hamrostay.com" },
    update: { isActive: true },
    create: { name: "Admin User",    email: "admin@hamrostay.com",  password: adminPw,  role: "ADMIN",    isActive: true },
  });

  const guest = await prisma.user.upsert({
    where: { email: "guest@hamrostay.com" },
    update: { isActive: true },
    create: { name: "John Guest",    email: "guest@hamrostay.com",  password: guestPw,  role: "CUSTOMER", isActive: true },
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: "vendor@hamrostay.com" },
    update: { isActive: true },
    create: { name: "Vendor User",   email: "vendor@hamrostay.com", password: vendorPw, role: "VENDOR",   isActive: true },
  });

  // Rooms
  for (const room of ROOMS) {
    await prisma.room.upsert({
      where: { roomNumber: room.roomNumber },
      update: {},
      create: room,
    });
  }

  // Vendor
  await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      businessName: "Fresh Himalayan Produce",
      category: "FOOD_BEVERAGE",
      contactPerson: "Vendor User",
      email: "vendor@hamrostay.com",
      phone: "+977 9812345678",
      address: "Asan, Kathmandu",
      description: "Premium organic produce sourced directly from Himalayan farms.",
      isApproved: true,
    },
  });

  // Hotel settings
  await prisma.hotelSettings.upsert({
    where: { id: { not: undefined } },
    update: {},
    create: {
      hotelName: "HamroStay",
      tagline: "Where Luxury Meets Nepali Heritage",
      address: "Thamel, Kathmandu 44600, Nepal",
      phone: "+977 1 4000000",
      email: "info@hamrostay.com",
      website: "https://hamrostay.com",
      latitude: 27.7172,
      longitude: 85.3131,
      taxRate: 13,
        currency: "NPR",
    },
  }).catch(() => {
    return prisma.hotelSettings.create({
      data: {
        hotelName: "HamroStay",
        tagline: "Where Luxury Meets Nepali Heritage",
        address: "Thamel, Kathmandu 44600, Nepal",
        phone: "+977 1 4000000",
        email: "info@hamrostay.com",
        website: "https://hamrostay.com",
        latitude: 27.7172,
        longitude: 85.3131,
        taxRate: 13,
        currency: "NPR",
      },
    });
  });

  console.log("✅ Seed complete!");
  console.log("   Admin:    admin@hamrostay.com / admin123");
  console.log("   Customer: guest@hamrostay.com / guest123");
  console.log("   Vendor:   vendor@hamrostay.com / vendor123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());