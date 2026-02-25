import { type Dog, type InsertDog, dogs } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getDogs(): Promise<Dog[]>;
  getDog(id: number): Promise<Dog | undefined>;
  createDog(dog: InsertDog): Promise<Dog>;
  deleteDog(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getDogs(): Promise<Dog[]> {
    return await db.select().from(dogs);
  }

  async getDog(id: number): Promise<Dog | undefined> {
    const [dog] = await db.select().from(dogs).where(eq(dogs.id, id));
    return dog;
  }

  async createDog(dog: InsertDog): Promise<Dog> {
    const [created] = await db.insert(dogs).values(dog).returning();
    return created;
  }

  async deleteDog(id: number): Promise<void> {
    await db.delete(dogs).where(eq(dogs.id, id));
  }
}

export const storage = new DatabaseStorage();
