import * as mongoose from "mongoose";
import video from "../models/video";
import { Utils } from "../utils/utils";

const videoData = [
  {
    title: "Jan Party Vision 2025 - Our Mission and Goals",
    description: "A comprehensive overview of Jan Party's vision for 2025, highlighting our commitment to social welfare, economic development, and community empowerment. Learn about our key initiatives and long-term objectives.",
    videoUrl: "https://www.youtube.com/watch?v=example1",
    thumbnailUrl: "https://img.youtube.com/vi/example1/maxresdefault.jpg",
    duration: "15:30",
    tags: ["vision", "mission", "goals", "jan-party"],
    views: 1250,
    created_by: null, // Will be set to first admin user found
  },
  {
    title: "Digital Literacy Program - Empowering Communities",
    description: "Explore our digital literacy initiatives that are transforming lives across rural and urban communities. See real stories of individuals who have benefited from our technology education programs.",
    videoUrl: "https://www.youtube.com/watch?v=example2",
    thumbnailUrl: "https://img.youtube.com/vi/example2/maxresdefault.jpg",
    duration: "12:45",
    tags: ["digital-literacy", "education", "technology", "community"],
    views: 890,
    created_by: null,
  },
  {
    title: "Healthcare Awareness Campaign Documentary",
    description: "An in-depth documentary showcasing our healthcare awareness campaigns that have reached thousands of families. Witness the impact of our preventive healthcare initiatives.",
    videoUrl: "https://www.youtube.com/watch?v=example3",
    thumbnailUrl: "https://img.youtube.com/vi/example3/maxresdefault.jpg",
    duration: "22:15",
    tags: ["healthcare", "awareness", "documentary", "preventive-care"],
    views: 2100,
    created_by: null,
  },
  {
    title: "Farmers' Rights and Agricultural Reforms",
    description: "A detailed discussion on farmers' rights, agricultural reforms, and our initiatives to support sustainable farming practices and fair pricing for agricultural produce.",
    videoUrl: "https://www.youtube.com/watch?v=example4",
    thumbnailUrl: "https://img.youtube.com/vi/example4/maxresdefault.jpg",
    duration: "18:20",
    tags: ["farmers", "agriculture", "reforms", "sustainable-farming"],
    views: 1450,
    created_by: null,
  },
  {
    title: "Women's Empowerment Summit Highlights",
    description: "Key highlights from our Women's Empowerment Summit featuring inspiring stories, expert discussions, and actionable plans for gender equality and women's economic participation.",
    videoUrl: "https://www.youtube.com/watch?v=example5",
    thumbnailUrl: "https://img.youtube.com/vi/example5/maxresdefault.jpg",
    duration: "25:10",
    tags: ["women-empowerment", "gender-equality", "summit", "inspiration"],
    views: 3200,
    created_by: null,
  },
  {
    title: "Environmental Conservation Initiatives",
    description: "Discover our environmental conservation projects including tree plantation drives, waste management programs, and community-led sustainability efforts.",
    videoUrl: "https://www.youtube.com/watch?v=example6",
    thumbnailUrl: "https://img.youtube.com/vi/example6/maxresdefault.jpg",
    duration: "16:55",
    tags: ["environment", "conservation", "sustainability", "tree-plantation"],
    views: 980,
    created_by: null,
  },
  {
    title: "Youth Leadership Development Program",
    description: "A comprehensive look at our youth leadership development program that equips young leaders with skills, knowledge, and networks to drive positive change in their communities.",
    videoUrl: "https://www.youtube.com/watch?v=example7",
    thumbnailUrl: "https://img.youtube.com/vi/example7/maxresdefault.jpg",
    duration: "20:30",
    tags: ["youth", "leadership", "development", "community"],
    views: 1670,
    created_by: null,
  },
  {
    title: "Education Reform Panel Discussion",
    description: "An engaging panel discussion with educators, policymakers, and community leaders discussing challenges in education and innovative solutions for quality learning.",
    videoUrl: "https://www.youtube.com/watch?v=example8",
    thumbnailUrl: "https://img.youtube.com/vi/example8/maxresdefault.jpg",
    duration: "28:45",
    tags: ["education", "reform", "panel-discussion", "policy"],
    views: 1850,
    created_by: null,
  },
  {
    title: "Skill Development Workshop Series",
    description: "Showcase of our skill development workshops covering digital skills, vocational training, and entrepreneurship programs that empower individuals for better career opportunities.",
    videoUrl: "https://www.youtube.com/watch?v=example9",
    thumbnailUrl: "https://img.youtube.com/vi/example9/maxresdefault.jpg",
    duration: "14:20",
    tags: ["skill-development", "workshops", "vocational-training", "entrepreneurship"],
    views: 1150,
    created_by: null,
  },
  {
    title: "Community Development Success Stories",
    description: "Heartwarming stories of community transformation through our various development programs. Real testimonials from beneficiaries who have experienced positive change.",
    videoUrl: "https://www.youtube.com/watch?v=example10",
    thumbnailUrl: "https://img.youtube.com/vi/example10/maxresdefault.jpg",
    duration: "19:40",
    tags: ["community-development", "success-stories", "testimonials", "transformation"],
    views: 2750,
    created_by: null,
  },
  {
    title: "Cultural Heritage Preservation Project",
    description: "Explore our efforts to preserve and promote cultural heritage through art exhibitions, traditional performances, and documentation of cultural practices.",
    videoUrl: "https://www.youtube.com/watch?v=example11",
    thumbnailUrl: "https://img.youtube.com/vi/example11/maxresdefault.jpg",
    duration: "17:25",
    tags: ["cultural-heritage", "preservation", "art", "tradition"],
    views: 920,
    created_by: null,
  },
  {
    title: "Sports and Youth Fitness Initiative",
    description: "Our sports programs and fitness initiatives that promote physical health, teamwork, and healthy competition among youth while building leadership skills.",
    videoUrl: "https://www.youtube.com/watch?v=example12",
    thumbnailUrl: "https://img.youtube.com/vi/example12/maxresdefault.jpg",
    duration: "13:50",
    tags: ["sports", "youth", "fitness", "leadership"],
    views: 1340,
    created_by: null,
  }
];

export const seedVideos = async () => {
  try {
    console.log("🎬 Seeding Videos...");

    // Find an admin user to use as created_by
    const User = mongoose.model('user', new mongoose.Schema({}, { strict: false }));
    const adminUser = await User.findOne({ userType: { $exists: true } });

    if (!adminUser) {
      console.log("❌ No admin user found. Please create an admin user first.");
      return;
    }

    console.log(`📝 Using admin user: ${(adminUser as any).firstName} ${(adminUser as any).lastName} (${adminUser._id})`);

    // Set created_by for all videos
    videoData.forEach(videoItem => {
      videoItem.created_by = adminUser._id;
    });

    // Clear existing videos
    await video.deleteMany({});
    console.log("🗑️ Cleared existing videos");

    // Insert new videos
    const createdVideos = await video.insertMany(videoData);
    console.log(`✅ Successfully seeded ${createdVideos.length} videos`);

    // Log created videos
    createdVideos.forEach((videoItem: any, index) => {
      console.log(`${index + 1}. ${videoItem.title} - ${videoItem.views} views (${videoItem.duration})`);
    });

  } catch (error) {
    console.error("❌ Error seeding videos:", error);
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
    await seedVideos();
    console.log("🎉 Video seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
}
