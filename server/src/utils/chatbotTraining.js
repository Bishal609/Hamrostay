// server/src/utils/chatbotTraining.js
/**
 * HamroBot Training Data - Self-Trained Knowledge Base
 * Contains comprehensive information about HamroStay hotel operations
 */

const HOTEL_INFO = {
  name: "HamroStay Luxury Hotels",
  location: "Thamel, Kathmandu, Nepal",
  rating: "5-Star",
  description: "Premium luxury hospitality with Nepali cultural touch",
  phone: "+977-1-XXXXXXX",
  email: "info@hamrostay.com",
  website: "www.hamrostay.com",
};

const ROOM_TYPES = {
  deluxe: {
    name: "Deluxe Room",
    capacity: "1-2 guests",
    sqft: "350-400",
    amenities: ["King bed", "Marble bathroom", "City view", "Flat-screen TV", "Minibar", "Work desk"],
    price_range: "NPR 8,000 - 12,000",
  },
  suite: {
    name: "Executive Suite",
    capacity: "2-4 guests",
    sqft: "550-650",
    amenities: ["Separate living area", "Jacuzzi", "Panoramic views", "Premium minibar", "Personal butler", "Dining area"],
    price_range: "NPR 15,000 - 22,000",
  },
  penthouse: {
    name: "Royal Penthouse",
    capacity: "3-6 guests",
    sqft: "1000+",
    amenities: ["Private pool", "Rooftop terrace", "Full kitchen", "360° views", "Concierge service", "Private entrance"],
    price_range: "NPR 35,000 - 50,000",
  },
};

const HOTEL_AMENITIES = [
  "24/7 Concierge Service",
  "Fine Dining Restaurant",
  "Rooftop Bar & Lounge",
  "Spa & Wellness Center",
  "Fitness Center",
  "Swimming Pool",
  "Business Center",
  "Valet Parking",
  "Room Service 24/7",
  "Cultural Program Arrangements",
  "Travel Desk",
  "Currency Exchange",
];

const POLICIES = {
  checkin: "2:00 PM",
  checkout: "12:00 PM",
  early_checkin: "Available at NPR 2,000 surcharge (subject to availability)",
  late_checkout: "Available at NPR 2,000 surcharge (subject to availability)",
  cancellation: "Free cancellation up to 48 hours before arrival. 50% charge for cancellations 24-48 hours before. Full charge for cancellations within 24 hours.",
  pets: "Pets allowed upon request with additional cleaning fee of NPR 1,500",
  smoking: "Non-smoking property. Smoking only in designated outdoor areas. Smoking violation charges apply (NPR 5,000).",
  payment: "Credit cards, debit cards, digital wallets, bank transfers accepted. 13% VAT applied to all bookings.",
};

const LOCAL_ATTRACTIONS = {
  temples: [
    "Pashupatinath Temple (10 mins)",
    "Boudhanath Stupa (15 mins)",
    "Swayambhunath Temple (20 mins)",
    "Kathmandu Durbar Square (5 mins)",
  ],
  activities: [
    "Helicopter tours of Everest",
    "Yoga & Meditation sessions",
    "Nepali cooking classes",
    "Cultural performances",
    "Trekking expeditions",
    "Paragliding",
  ],
  restaurants: [
    "Nepali cuisine at our restaurant",
    "International dining available",
    "Local food tours arranged",
  ],
};

const SPECIAL_SERVICES = {
  honeymoon: "Complimentary room upgrade, champagne, flowers, and couples massage",
  birthday: "Decorations, cake delivery, special dinner arrangements available",
  events: "Conference halls for up to 500 guests with AV facilities",
  meetings: "Business packages with WiFi, printing, conference equipment included",
};

const FAQs = [
  {
    q: "What is the nearest airport?",
    a: "Tribhuvan International Airport (TIA) is approximately 20 minutes away by car. We provide airport transfer services.",
  },
  {
    q: "Do you have WiFi?",
    a: "Yes, complimentary high-speed WiFi throughout the property.",
  },
  {
    q: "Can I extend my stay?",
    a: "Yes, room extensions are available subject to availability. Please contact the front desk.",
  },
  {
    q: "What restaurants are nearby?",
    a: "Many local and international restaurants are within walking distance in Thamel.",
  },
  {
    q: "Do you arrange tours?",
    a: "Yes, our travel desk arranges custom tours, trekking, and adventure activities.",
  },
];

const BOOKING_TIPS = [
  "Book 2+ weeks in advance for better rates and room selection",
  "Weekend rates are 15-20% higher than weekday rates",
  "Loyalty members get 10% discount on room rates",
  "Packages available for honeymoon, corporate, and group bookings",
  "Mid-week stays (Mon-Wed) offer special discounts",
];

const SYSTEM_CONTEXT = `
You are HamroBot, the AI Concierge for HamroStay Luxury Hotels. 
You are trained to provide exceptional, knowledgeable, and warm assistance.

HOTEL KNOWLEDGE:
- Name: HamroStay Luxury Hotels (5-Star)
- Location: Thamel, Kathmandu, Nepal
- Expertise: Premium hospitality with Nepali cultural experience
- Rating: 5 stars with world-class service

YOUR EXPERTISE AREAS:
1. Room Information: Deluxe, Suite, and Penthouse options
2. Amenities & Facilities: Spa, dining, pool, fitness center
3. Policies: Check-in (2 PM), Check-out (12 PM), Cancellation terms
4. Local Attractions: Temples, activities, restaurants nearby
5. Special Services: Honeymoon packages, events, corporate meetings
6. Booking Assistance: Availability, rates, special offers
7. Local Culture: Nepali traditions, customs, festivals

COMMUNICATION STYLE:
- Always professional yet warm and personable
- Use "Namaste" when appropriate
- Provide detailed, helpful information
- Proactively offer solutions
- End conversations by asking "Is there anything else I can help you with?"

SCOPE:
- Answer hotel-related questions comprehensively
- Provide local recommendations
- Assist with bookings and policies
- Suggest relevant services and packages
- For non-hotel questions, politely redirect to hotel topics

TONE: Friendly, knowledgeable, professional, helpful, culturally sensitive
`;

module.exports = {
  HOTEL_INFO,
  ROOM_TYPES,
  HOTEL_AMENITIES,
  POLICIES,
  LOCAL_ATTRACTIONS,
  SPECIAL_SERVICES,
  FAQs,
  BOOKING_TIPS,
  SYSTEM_CONTEXT,
};
