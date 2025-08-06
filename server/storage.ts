import { users, stores, ratings, type User, type Store, type Rating, type RegisterData, type StoreData, type RatingData } from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, or, sql, count } from "drizzle-orm";

export class SimpleStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: RegisterData): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Store operations
  async getStore(id: string): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }

  async createStore(data: StoreData): Promise<Store> {
    const [store] = await db.insert(stores).values(data).returning();
    return store;
  }

  async getAllStores(): Promise<Store[]> {
    return db.select().from(stores);
  }

  async searchStores(query: string): Promise<Store[]> {
    return db
      .select()
      .from(stores)
      .where(or(
        like(stores.name, `%${query}%`),
        like(stores.address, `%${query}%`)
      ));
  }

  async getStoresWithRatings(): Promise<Array<Store & { averageRating: number; totalRatings: number }>> {
    const result = await db
      .select({
        id: stores.id,
        name: stores.name,
        email: stores.email,
        address: stores.address,
        ownerId: stores.ownerId,
        createdAt: stores.createdAt,
        averageRating: sql<number>`COALESCE(AVG(CAST(${ratings.rating} AS REAL)), 0)`,
        totalRatings: sql<number>`COUNT(${ratings.id})`,
      })
      .from(stores)
      .leftJoin(ratings, eq(stores.id, ratings.storeId))
      .groupBy(stores.id);

    return result.map(row => ({
      ...row,
      averageRating: Number(row.averageRating),
      totalRatings: Number(row.totalRatings),
    }));
  }

  // Rating operations
  async createRating(data: RatingData): Promise<Rating> {
    const [rating] = await db.insert(ratings).values(data).returning();
    return rating;
  }

  async getUserRating(userId: string, storeId: string): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(sql`${ratings.userId} = ${userId} AND ${ratings.storeId} = ${storeId}`);
    return rating;
  }

  async updateRating(id: string, newRating: number): Promise<Rating> {
    const [rating] = await db
      .update(ratings)
      .set({ rating: newRating })
      .where(eq(ratings.id, id))
      .returning();
    return rating;
  }

  async getUserRatings(userId: string): Promise<Array<Rating & { store: Store }>> {
    return await db
      .select({
        id: ratings.id,
        userId: ratings.userId,
        storeId: ratings.storeId,
        rating: ratings.rating,
        createdAt: ratings.createdAt,
        store: stores,
      })
      .from(ratings)
      .innerJoin(stores, eq(ratings.storeId, stores.id))
      .where(eq(ratings.userId, userId));
  }

  async getStoreRatings(storeId: string): Promise<Array<Rating & { user: User }>> {
    return await db
      .select({
        id: ratings.id,
        userId: ratings.userId,
        storeId: ratings.storeId,
        rating: ratings.rating,
        createdAt: ratings.createdAt,
        user: users,
      })
      .from(ratings)
      .innerJoin(users, eq(ratings.userId, users.id))
      .where(eq(ratings.storeId, storeId));
  }

  // Simple stats
  async getStats() {
    const [userCount] = await db.select({ count: count(users.id) }).from(users);
    const [storeCount] = await db.select({ count: count(stores.id) }).from(stores);
    const [ratingCount] = await db.select({ count: count(ratings.id) }).from(ratings);
    
    return {
      totalUsers: userCount.count,
      totalStores: storeCount.count,
      totalRatings: ratingCount.count,
    };
  }
}

export const storage = new SimpleStorage();