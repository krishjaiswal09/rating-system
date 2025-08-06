import bcrypt from "bcrypt";
import { db } from "../server/db";
import { users, stores, ratings } from "../shared/schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(ratings);
  await db.delete(stores);  
  await db.delete(users);

  // Create test users
  const hashedPassword = await bcrypt.hash("password123A!", 12);
  
  const testUsers = [
    {
      id: "admin-001",
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      address: "123 Admin St"
    },
    {
      id: "user-001", 
      name: "John Doe",
      email: "user@example.com",
      password: hashedPassword,
      role: "user",
      address: "456 User Ave"
    },
    {
      id: "owner-001",
      name: "Jane Smith", 
      email: "owner@example.com",
      password: hashedPassword,
      role: "store_owner",
      address: "789 Owner Blvd"
    }
  ];

  await db.insert(users).values(testUsers);

  // Create test stores
  const testStores = [
    {
      id: "store-001",
      name: "Tech Store",
      email: "contact@techstore.com", 
      address: "100 Tech Plaza",
      ownerId: "owner-001"
    },
    {
      id: "store-002",
      name: "Book Haven",
      email: "info@bookhaven.com",
      address: "200 Reading Rd", 
      ownerId: "owner-001"
    }
  ];

  await db.insert(stores).values(testStores);

  // Create test ratings
  const testRatings = [
    {
      id: "rating-001",
      userId: "user-001",
      storeId: "store-001", 
      rating: 5
    },
    {
      id: "rating-002",
      userId: "user-001",
      storeId: "store-002",
      rating: 4
    }
  ];

  await db.insert(ratings).values(testRatings);

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch(console.error);