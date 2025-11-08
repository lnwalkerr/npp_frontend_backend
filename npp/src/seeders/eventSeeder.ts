import * as mongoose from "mongoose";
import event from "../models/event";
import { Utils } from "../utils/utils";

const eventData = [
  {
    title: "Jan Party Annual Conference 2025",
    description: "Annual conference discussing key issues affecting our community and planning for the future. Join us for an inspiring day of discussions, networking, and strategic planning.",
    date: new Date("2025-02-15T09:00:00.000Z"),
    location: "Grand Convention Center, Mumbai",
    status: "Upcoming",
    created_by: null, // Will be set to first admin user found
  },
  {
    title: "Youth Leadership Workshop",
    description: "Empowering the next generation of leaders through interactive workshops, mentorship sessions, and skill-building activities focused on community development.",
    date: new Date("2025-01-25T14:00:00.000Z"),
    location: "Community Hall, Delhi",
    status: "Upcoming",
    created_by: null,
  },
  {
    title: "Healthcare Awareness Campaign",
    description: "Comprehensive healthcare awareness program reaching rural communities with free medical checkups, health education sessions, and preventive care initiatives.",
    date: new Date("2025-03-10T10:00:00.000Z"),
    location: "Rural Health Center, Pune",
    status: "Upcoming",
    created_by: null,
  },
  {
    title: "Digital Literacy Drive 2024",
    description: "Empowering citizens with digital skills through hands-on training sessions, online safety workshops, and access to technology resources.",
    date: new Date("2024-12-20T11:00:00.000Z"),
    location: "Tech Hub, Bangalore",
    status: "Past",
    created_by: null,
  },
  {
    title: "Environmental Protection Initiative",
    description: "Community-led environmental conservation project focusing on tree plantation, waste management, and sustainable development practices.",
    date: new Date("2024-11-30T08:00:00.000Z"),
    location: "Green Park, Chennai",
    status: "Past",
    created_by: null,
  },
  {
    title: "Women's Empowerment Summit",
    description: "Celebrating women's achievements and discussing strategies for gender equality, economic empowerment, and social inclusion in our communities.",
    date: new Date("2025-04-05T13:00:00.000Z"),
    location: "Women's Center, Kolkata",
    status: "Upcoming",
    created_by: null,
  },
  {
    title: "Education Reform Dialogue",
    description: "Roundtable discussion with educators, policymakers, and community leaders to address challenges in education and develop actionable solutions.",
    date: new Date("2024-10-18T15:00:00.000Z"),
    location: "Education Ministry Hall, New Delhi",
    status: "Past",
    created_by: null,
  },
  {
    title: "Farmers' Rights Awareness Program",
    description: "Supporting farmers' rights through legal aid, policy advocacy, and community mobilization to ensure fair prices and sustainable agriculture.",
    date: new Date("2025-05-20T09:30:00.000Z"),
    location: "Agricultural College, Jaipur",
    status: "Upcoming",
    created_by: null,
  },
  {
    title: "Cultural Heritage Preservation",
    description: "Documenting and preserving our rich cultural heritage through art exhibitions, traditional music performances, and cultural exchange programs.",
    date: new Date("2024-09-15T16:00:00.000Z"),
    location: "Heritage Museum, Hyderabad",
    status: "Past",
    created_by: null,
  },
  {
    title: "Youth Sports Championship",
    description: "Inter-district youth sports championship promoting physical fitness, teamwork, and healthy competition among young participants.",
    date: new Date("2025-06-12T07:00:00.000Z"),
    location: "Sports Complex, Ahmedabad",
    status: "Upcoming",
    created_by: null,
  },
  {
    title: "Senior Citizens Welfare Program",
    description: "Comprehensive support program for senior citizens including healthcare services, social activities, and financial assistance initiatives.",
    date: new Date("2024-08-28T10:30:00.000Z"),
    location: "Senior Center, Lucknow",
    status: "Cancelled",
    created_by: null,
  },
  {
    title: "Skill Development Workshop Series",
    description: "Multi-part workshop series covering essential skills for employment including digital literacy, communication skills, and vocational training.",
    date: new Date("2025-07-08T12:00:00.000Z"),
    location: "Skill Development Center, Chandigarh",
    status: "Upcoming",
    created_by: null,
  }
];

export const seedEvents = async () => {
  try {
    console.log("🌱 Seeding Events...");

    // Find an admin user to use as created_by
    const User = mongoose.model('user', new mongoose.Schema({}, { strict: false }));
    const adminUser = await User.findOne({ userType: { $exists: true } });

    if (!adminUser) {
      console.log("❌ No admin user found. Please create an admin user first.");
      return;
    }

    console.log(`📝 Using admin user: ${(adminUser as any).firstName} ${(adminUser as any).lastName} (${adminUser._id})`);

    // Set created_by for all events
    eventData.forEach(eventItem => {
      eventItem.created_by = adminUser._id;
    });

    // Clear existing events
    await event.deleteMany({});
    console.log("🗑️ Cleared existing events");

    // Insert new events
    const createdEvents = await event.insertMany(eventData);
    console.log(`✅ Successfully seeded ${createdEvents.length} events`);

    // Log created events
    createdEvents.forEach((eventItem: any, index) => {
      console.log(`${index + 1}. ${eventItem.title} - ${eventItem.status} (${new Date(eventItem.date).toDateString()})`);
    });

  } catch (error) {
    console.error("❌ Error seeding events:", error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  require('dotenv').config();

  mongoose.connect(process.env.DB_URL as string, {
    maxPoolSize: 500,
    minPoolSize: 250,
    socketTimeoutMS: 60000,
    serverSelectionTimeoutMS: 30000,
    waitQueueTimeoutMS: 30000,
  })
  .then(async () => {
    console.log("🔌 Connected to MongoDB");
    await seedEvents();
    console.log("🎉 Event seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
}
