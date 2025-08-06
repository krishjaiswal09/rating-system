import express from "express";
import session from "express-session";
import { setupRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { db, executeSql } from "./db";
import { users, stores, ratings } from "@shared/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());

// Simple session setup
app.use(session({
  secret: process.env.SESSION_SECRET || "simple-secret-key-for-dev",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Setup routes
setupRoutes(app);

// Initialize database with test data for development
async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log("Initializing in-memory database with test data...");
    
    // Create tables
    const createTables = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        address TEXT,
        created_at INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS stores (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        owner_id TEXT,
        created_at INTEGER,
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS ratings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        store_id TEXT NOT NULL,
        rating INTEGER NOT NULL,
        created_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (store_id) REFERENCES stores(id)
      )`
    ];
    
    // Execute all table creation statements
    createTables.forEach(sql => executeSql(sql));
    
    // Insert test data
    const hashedPassword = await bcrypt.hash("password123A!", 12);
    const now = new Date();
    
    // Create test users
    const testUsers = [
      {
        id: "admin-001",
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        address: "123 Admin St",
        createdAt: now
      },
      {
        id: "user-001", 
        name: "John Doe",
        email: "user@example.com",
        password: hashedPassword,
        role: "user",
        address: "456 User Ave",
        createdAt: now
      },
      {
        id: "owner-001",
        name: "Jane Smith", 
        email: "owner@example.com",
        password: hashedPassword,
        role: "store_owner",
        address: "789 Owner Blvd",
        createdAt: now
      }
    ];
    
    // Create test stores
    const testStores = [
      {
        id: "store-001",
        name: "Tech Store",
        email: "contact@techstore.com", 
        address: "100 Tech Plaza",
        ownerId: "owner-001",
        createdAt: now
      },
      {
        id: "store-002",
        name: "Book Haven",
        email: "info@bookhaven.com",
        address: "200 Reading Rd", 
        ownerId: "owner-001",
        createdAt: now
      }
    ];
    
    // Create test ratings
    const testRatings = [
      {
        id: "rating-001",
        userId: "user-001",
        storeId: "store-001", 
        rating: 5,
        createdAt: now
      },
      {
        id: "rating-002",
        userId: "user-001",
        storeId: "store-002",
        rating: 4,
        createdAt: now
      }
    ];
    
    // Insert all test data
    await db.insert(users).values(testUsers);
    await db.insert(stores).values(testStores);
    await db.insert(ratings).values(testRatings);
    
    console.log("Database initialized with test data!");
  }
}

(async () => {
  // Initialize database
  await initializeDatabase();
  
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, app);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Application available at: http://localhost:${PORT}`);
  });
})();