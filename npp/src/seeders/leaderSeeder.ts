import * as mongoose from "mongoose";
import leader from "../models/leader";
import user from "../models/user";
import { Utils } from "../utils/utils";

const leaderData = [
  {
    name: "Rajesh Sharma",
    position: "National President",
    description: "A dedicated leader with over 20 years of experience in public service and community development. Rajesh Sharma has been instrumental in driving the party's vision for inclusive growth and social justice.",
    order: 1,
    contactInfo: {
      phone: "+91-99999-11111",
      email: "rajesh.sharma@janparty.org"
    }
  },
  {
    name: "Priya Patel",
    position: "Vice President",
    description: "A visionary leader committed to women's empowerment and education. Priya Patel has spearheaded multiple initiatives for gender equality and sustainable development across rural and urban India.",
    order: 2,
    contactInfo: {
      phone: "+91-99999-22222",
      email: "priya.patel@janparty.org"
    }
  },
  {
    name: "Amit Kumar",
    position: "General Secretary",
    description: "A young dynamic leader with expertise in technology and innovation. Amit Kumar focuses on modernizing governance and bringing transparency to administrative processes.",
    order: 3,
    contactInfo: {
      phone: "+91-99999-33333",
      email: "amit.kumar@janparty.org"
    }
  },
  {
    name: "Sunita Devi",
    position: "Treasurer",
    description: "A financial expert with a background in economics and public finance. Sunita Devi manages the party's financial operations and ensures transparent fund utilization for public welfare.",
    order: 4,
    contactInfo: {
      phone: "+91-99999-44444",
      email: "sunita.devi@janparty.org"
    }
  },
  {
    name: "Vijay Singh",
    position: "Organizing Secretary",
    description: "A grassroots organizer with extensive experience in mobilizing communities. Vijay Singh has successfully led multiple election campaigns and community outreach programs.",
    order: 5,
    contactInfo: {
      phone: "+91-99999-55555",
      email: "vijay.singh@janparty.org"
    }
  },
  {
    name: "Meera Joshi",
    position: "Media Secretary",
    description: "A communication expert specializing in digital media and public relations. Meera Joshi manages the party's communication strategy and maintains strong media relations.",
    order: 6,
    contactInfo: {
      phone: "+91-99999-66666",
      email: "meera.joshi@janparty.org"
    }
  },
  {
    name: "Rakesh Gupta",
    position: "Youth Wing President",
    description: "A passionate youth leader advocating for student rights and employment opportunities. Rakesh Gupta drives initiatives for youth empowerment and skill development.",
    order: 7,
    contactInfo: {
      phone: "+91-99999-77777",
      email: "rakesh.gupta@janparty.org"
    }
  },
  {
    name: "Anjali Verma",
    position: "Women's Wing President",
    description: "A champion for women's rights and social welfare. Anjali Verma leads programs focused on women's education, health, and economic empowerment across the nation.",
    order: 8,
    contactInfo: {
      phone: "+91-99999-88888",
      email: "anjali.verma@janparty.org"
    }
  },
  {
    name: "Dr. Suresh Reddy",
    position: "Health Minister",
    description: "A medical professional turned politician with expertise in healthcare policy. Dr. Suresh Reddy develops comprehensive healthcare strategies for accessible medical services.",
    order: 9,
    contactInfo: {
      phone: "+91-99999-99999",
      email: "suresh.reddy@janparty.org"
    }
  },
  {
    name: "Kavita Bansal",
    position: "Education Secretary",
    description: "An education reformer dedicated to improving the quality of education in India. Kavita Bansal works on policies for inclusive education and skill development programs.",
    order: 10,
    contactInfo: {
      phone: "+91-88888-11111",
      email: "kavita.bansal@janparty.org"
    }
  },
  {
    name: "Rajendra Prasad",
    position: "Agriculture Minister",
    description: "A farmer-turned-leader with deep understanding of agricultural challenges. Rajendra Prasad advocates for sustainable farming practices and farmer welfare schemes.",
    order: 11,
    contactInfo: {
      phone: "+91-88888-22222",
      email: "rajendra.prasad@janparty.org"
    }
  },
  {
    name: "Lakshmi Narayan",
    position: "Cultural Secretary",
    description: "A cultural preservationist promoting India's rich heritage and traditions. Lakshmi Narayan organizes cultural programs and supports traditional art forms and artists.",
    order: 12,
    contactInfo: {
      phone: "+91-88888-33333",
      email: "lakshmi.narayan@janparty.org"
    }
  }
];

async function seedLeaders() {
  try {
    console.log("👥 Seeding Leaders...");

    // Find an admin user to set as created_by
    const adminUser = await user.findOne({ userType: { $exists: true } });
    if (!adminUser) {
      console.log("❌ No admin user found. Please create an admin user first.");
      return;
    }

    console.log(`📝 Using admin user: ${(adminUser as any).firstName} ${(adminUser as any).lastName} (${adminUser._id})`);

    // Set created_by for all leaders
    const leadersWithCreatedBy = leaderData.map(leaderItem => ({
      ...leaderItem,
      created_by: adminUser._id,
    }));

    // Clear existing leaders
    await leader.deleteMany({});
    console.log("🗑️ Cleared existing leaders");

    // Insert new leaders
    const createdLeaders = await leader.insertMany(leadersWithCreatedBy);
    console.log(`✅ Successfully seeded ${createdLeaders.length} leaders`);

    // Log created leaders
    createdLeaders.forEach((leaderItem: any, index) => {
      console.log(`${index + 1}. ${leaderItem.name} - ${leaderItem.position} (Order: ${leaderItem.order})`);
    });

  } catch (error) {
    console.error("❌ Error seeding leaders:", error);
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
    await seedLeaders();
    console.log("🎉 Leader seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
}
