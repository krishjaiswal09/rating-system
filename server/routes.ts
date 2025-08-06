import type { Express } from "express";
import bcrypt from "bcrypt";
import { loginSchema, registerSchema, storeSchema, ratingSchema, updatePasswordSchema } from "@shared/schema";
import { storage } from "./storage";

export function setupRoutes(app: Express) {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      
      if (!user || !await bcrypt.compare(data.password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ message: "Login successful", user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      data.password = await bcrypt.hash(data.password, 12);
      
      const user = await storage.createUser(data);
      req.session.userId = user.id;
      
      res.status(201).json({ message: "Registration successful", user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({ id: user.id, email: user.email, role: user.role, name: user.name });
  });

  // Middleware for auth
  const requireAuth = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // User routes
  app.get("/api/users", requireAuth, requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post("/api/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      data.password = await bcrypt.hash(data.password, 12);
      const user = await storage.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Store routes
  app.get("/api/stores", requireAuth, async (req, res) => {
    const stores = await storage.getStoresWithRatings();
    res.json(stores);
  });

  app.post("/api/stores", requireAuth, requireAdmin, async (req, res) => {
    try {
      const data = storeSchema.parse(req.body);
      const store = await storage.createStore(data);
      res.status(201).json(store);
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get("/api/stores/:id/stats", requireAuth, async (req, res) => {
    const storeId = req.params.id;
    const store = await storage.getStore(storeId);
    
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Check if user owns the store or is admin
    if (req.user.role !== "admin" && store.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const storeRatings = await storage.getStoreRatings(storeId);
    const averageRating = storeRatings.length > 0 
      ? storeRatings.reduce((sum, r) => sum + r.rating, 0) / storeRatings.length 
      : 0;

    res.json({
      store,
      averageRating: Number(averageRating.toFixed(1)),
      totalRatings: storeRatings.length,
      ratings: storeRatings
    });
  });

  // Rating routes
  app.post("/api/ratings", requireAuth, async (req, res) => {
    try {
      const data = ratingSchema.parse({ ...req.body, userId: req.user.id });
      
      // Check if user already rated this store
      const existingRating = await storage.getUserRating(req.user.id, data.storeId);
      
      if (existingRating) {
        // Update existing rating
        const updatedRating = await storage.updateRating(existingRating.id, data.rating);
        res.json(updatedRating);
      } else {
        // Create new rating
        const rating = await storage.createRating(data);
        res.status(201).json(rating);
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get("/api/ratings/user", requireAuth, async (req, res) => {
    const ratings = await storage.getUserRatings(req.user.id);
    res.json(ratings);
  });

  app.get("/api/ratings/store/:storeId", requireAuth, async (req, res) => {
    const ratings = await storage.getStoreRatings(req.params.storeId);
    res.json(ratings);
  });

  // Password update route
  app.post("/api/auth/update-password", requireAuth, async (req, res) => {
    try {
      const data = updatePasswordSchema.parse(req.body);
      const user = await storage.getUser(req.user.id);
      
      if (!user || !await bcrypt.compare(data.currentPassword, user.password)) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 12);
      await storage.updateUserPassword(req.user.id, hashedPassword);
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Stats route
  app.get("/api/stats", requireAuth, requireAdmin, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });
}