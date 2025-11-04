import * as mongoose from "mongoose";
import news from "../models/news";
import user from "../models/user";
import { Utils } from "../utils/utils";
require("dotenv").config();

const newsData = [
  {
    title: "Government Announces New Economic Reforms to Boost Local Industries",
    description: "The government today unveiled comprehensive economic reforms aimed at revitalizing local industries and creating employment opportunities. The package includes tax incentives, infrastructure development grants, and skill development programs for small and medium enterprises.",
    type: "economy"
  },
  {
    title: "Major Breakthrough in Healthcare Sector with New Medical Technology",
    description: "Local researchers have achieved a significant breakthrough in medical technology, developing an innovative diagnostic tool that promises faster and more accurate disease detection. The technology is expected to revolutionize healthcare delivery in rural areas.",
    type: "health"
  },
  {
    title: "Education Ministry Launches Digital Learning Initiative for Rural Schools",
    description: "In a move to bridge the digital divide, the Education Ministry has launched a comprehensive digital learning initiative targeting over 5,000 rural schools. The program includes smart classrooms, online resources, and teacher training programs.",
    type: "education"
  },
  {
    title: "Parliament Passes Landmark Environmental Protection Bill",
    description: "The parliament today passed a landmark environmental protection bill that introduces stricter regulations on industrial pollution and promotes sustainable development practices. The bill includes provisions for renewable energy incentives and conservation programs.",
    type: "politics"
  },
  {
    title: "Tech Innovation Hub Opens in Capital City to Foster Startup Ecosystem",
    description: "A state-of-the-art technology innovation hub was inaugurated today in the capital city. The facility will provide incubation support, mentorship, and funding opportunities for tech startups, aiming to create 10,000 jobs in the next three years.",
    type: "technology"
  },
  {
    title: "National Sports Academy Achieves Record Success in International Competitions",
    description: "The National Sports Academy has achieved unprecedented success in recent international competitions, securing medals in multiple disciplines. The academy's comprehensive training programs and modern facilities have been instrumental in this achievement.",
    type: "sports"
  },
  {
    title: "Film Industry Celebrates Decade of Growth and Global Recognition",
    description: "The local film industry marked its tenth anniversary with celebrations highlighting remarkable growth and international acclaim. Several productions have received global recognition, opening new avenues for cultural exchange and economic opportunities.",
    type: "entertainment"
  },
  {
    title: "Agricultural Research Center Develops Climate-Resilient Crop Varieties",
    description: "Scientists at the Agricultural Research Center have successfully developed climate-resilient crop varieties that can withstand extreme weather conditions. The new varieties are expected to significantly improve food security and farmer incomes.",
    type: "general"
  },
  {
    title: "Youth Entrepreneurship Program Shows Remarkable Success Rate",
    description: "A government-sponsored youth entrepreneurship program has achieved an impressive 85% success rate among its participants. The program provides comprehensive business training, mentorship, and seed funding to young entrepreneurs.",
    type: "general"
  },
  {
    title: "International Conference on Sustainable Development Held Successfully",
    description: "The three-day international conference on sustainable development concluded successfully today, bringing together experts from around the world to discuss climate change solutions and sustainable development strategies.",
    type: "general"
  },
  {
    title: "New Transportation Policy Aims to Reduce Urban Congestion",
    description: "The Ministry of Transportation unveiled a comprehensive policy to address urban congestion through improved public transportation systems, smart traffic management, and incentives for electric vehicles.",
    type: "general"
  },
  {
    title: "Cultural Heritage Preservation Project Wins International Recognition",
    description: "A local cultural heritage preservation project has received international acclaim for its innovative approach to conserving historical monuments and traditional art forms while promoting tourism.",
    type: "general"
  }
];

async function seedNews() {
  try {
    console.log("📰 Seeding News Articles...");

    // Find an admin user to set as created_by
    const adminUser = await user.findOne({ userType: { $exists: true } });
    if (!adminUser) {
      console.log("❌ No admin user found. Please create an admin user first.");
      return;
    }

    console.log(`📝 Using admin user: ${(adminUser as any).firstName} ${(adminUser as any).lastName} (${adminUser._id})`);

    // Set created_by for all news articles
    const newsWithCreatedBy = newsData.map(newsItem => ({
      ...newsItem,
      created_by: adminUser._id,
    }));

    // Clear existing news
    await news.deleteMany({});
    console.log("🗑️ Cleared existing news articles");

    // Insert new news
    const createdNews = await news.insertMany(newsWithCreatedBy);
    console.log(`✅ Successfully seeded ${createdNews.length} news articles`);

    // Log created news
    createdNews.forEach((newsItem: any, index) => {
      console.log(`${index + 1}. ${newsItem.title} (${newsItem.type})`);
    });

  } catch (error) {
    console.error("❌ Error seeding news:", error);
    throw error;
  }
}

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
    await seedNews();
    console.log("🎉 News seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
}
