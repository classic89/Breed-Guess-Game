import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const breedEntrySchema = z.object({
  breedName: z.string().min(1),
  percentage: z.number().min(0).max(100),
});

export type BreedEntry = z.infer<typeof breedEntrySchema>;

export const dogs = pgTable("dogs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  images: text("images").array().notNull(),
  breeds: jsonb("breeds").$type<BreedEntry[]>().notNull(),
});

export const insertDogSchema = createInsertSchema(dogs).omit({ id: true }).extend({
  name: z.string().min(1, "Dog name is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  breeds: z.array(breedEntrySchema).min(1, "At least one breed is required"),
});

export type InsertDog = z.infer<typeof insertDogSchema>;
export type Dog = typeof dogs.$inferSelect;

export const breedInfoMap: Record<string, { description: string; group: string; temperament: string; size: string; lifespan: string }> = {
  "Labrador Retriever": { description: "One of the most popular dog breeds, known for their friendly and outgoing nature.", group: "Sporting", temperament: "Friendly, Active, Outgoing", size: "Large", lifespan: "10-12 years" },
  "German Shepherd": { description: "Intelligent and versatile working dogs known for courage and devotion.", group: "Herding", temperament: "Confident, Courageous, Smart", size: "Large", lifespan: "7-10 years" },
  "Golden Retriever": { description: "Beloved family dogs known for their gentle, tolerant attitude.", group: "Sporting", temperament: "Intelligent, Friendly, Devoted", size: "Large", lifespan: "10-12 years" },
  "French Bulldog": { description: "Small but sturdy companion dogs with a playful, adaptable personality.", group: "Non-Sporting", temperament: "Adaptable, Playful, Smart", size: "Small", lifespan: "10-12 years" },
  "Bulldog": { description: "Calm, courageous dogs with a friendly, dignified demeanor.", group: "Non-Sporting", temperament: "Friendly, Courageous, Calm", size: "Medium", lifespan: "8-10 years" },
  "Poodle": { description: "Exceptionally smart and active dogs that excel in obedience training.", group: "Non-Sporting", temperament: "Intelligent, Active, Alert", size: "Varies", lifespan: "10-18 years" },
  "Beagle": { description: "Merry, friendly hounds that love following their noses.", group: "Hound", temperament: "Friendly, Curious, Merry", size: "Small-Medium", lifespan: "10-15 years" },
  "Rottweiler": { description: "Robust working dogs with a loyal, loving, confident guardian instinct.", group: "Working", temperament: "Loyal, Loving, Confident", size: "Large", lifespan: "9-10 years" },
  "Dachshund": { description: "Clever, lively dogs with a courageous spirit in a small body.", group: "Hound", temperament: "Clever, Stubborn, Devoted", size: "Small", lifespan: "12-16 years" },
  "German Shorthaired Pointer": { description: "Versatile sporting dogs that are enthusiastic workers and loving family pets.", group: "Sporting", temperament: "Friendly, Smart, Willing to Please", size: "Large", lifespan: "12-14 years" },
  "Pembroke Welsh Corgi": { description: "Strong, athletic little dogs with a big personality and herding instinct.", group: "Herding", temperament: "Affectionate, Smart, Alert", size: "Small-Medium", lifespan: "12-13 years" },
  "Australian Shepherd": { description: "Smart working dogs with strong herding and guarding instincts.", group: "Herding", temperament: "Smart, Work-Oriented, Exuberant", size: "Medium", lifespan: "12-15 years" },
  "Yorkshire Terrier": { description: "Feisty, affectionate toy dogs with beautiful silky coats.", group: "Toy", temperament: "Affectionate, Sprightly, Tomboyish", size: "Small", lifespan: "11-15 years" },
  "Boxer": { description: "Fun-loving, bright, active dogs that are great family companions.", group: "Working", temperament: "Fun-Loving, Bright, Active", size: "Large", lifespan: "10-12 years" },
  "Cavalier King Charles Spaniel": { description: "Gentle, graceful toy spaniels with a regal heritage.", group: "Toy", temperament: "Affectionate, Gentle, Graceful", size: "Small", lifespan: "12-15 years" },
  "Doberman Pinscher": { description: "Loyal, fearless dogs known as one of dogkind's finest.", group: "Working", temperament: "Loyal, Fearless, Alert", size: "Large", lifespan: "10-12 years" },
  "Great Dane": { description: "The 'Apollo of Dogs', gentle giants that are dependable and patient.", group: "Working", temperament: "Friendly, Patient, Dependable", size: "Giant", lifespan: "7-10 years" },
  "Miniature Schnauzer": { description: "Friendly, smart, obedient little dogs that adapt well to any living situation.", group: "Terrier", temperament: "Friendly, Smart, Obedient", size: "Small", lifespan: "12-15 years" },
  "Siberian Husky": { description: "Graceful, quick dogs with a mischievous, friendly nature.", group: "Working", temperament: "Loyal, Mischievous, Outgoing", size: "Medium", lifespan: "12-14 years" },
  "Bernese Mountain Dog": { description: "Good-natured, calm, strong dogs originally from Swiss farmland.", group: "Working", temperament: "Good-Natured, Calm, Strong", size: "Large", lifespan: "7-10 years" },
  "Shih Tzu": { description: "Affectionate, playful, outgoing house dogs bred as royal companions.", group: "Toy", temperament: "Affectionate, Playful, Outgoing", size: "Small", lifespan: "10-18 years" },
  "Boston Terrier": { description: "Bright, amusing, adaptable dogs nicknamed 'The American Gentleman'.", group: "Non-Sporting", temperament: "Friendly, Bright, Amusing", size: "Small", lifespan: "11-13 years" },
  "Pomeranian": { description: "Lively, bold toy dogs with a fox-like expression and fluffy coat.", group: "Toy", temperament: "Lively, Bold, Inquisitive", size: "Small", lifespan: "12-16 years" },
  "Havanese": { description: "Smart, outgoing dogs that are the national dog of Cuba.", group: "Toy", temperament: "Intelligent, Outgoing, Funny", size: "Small", lifespan: "14-16 years" },
  "Shetland Sheepdog": { description: "Bright, energetic dogs that are playful and obedient herders.", group: "Herding", temperament: "Playful, Energetic, Bright", size: "Small-Medium", lifespan: "12-14 years" },
  "Border Collie": { description: "Remarkably bright workaholics known as the world's premier herding dog.", group: "Herding", temperament: "Affectionate, Smart, Energetic", size: "Medium", lifespan: "12-15 years" },
  "Cocker Spaniel": { description: "Gentle, smart, happy dogs that make wonderful family companions.", group: "Sporting", temperament: "Gentle, Smart, Happy", size: "Medium", lifespan: "10-14 years" },
  "Chihuahua": { description: "Graceful, charming, sassy dogs with enormous personalities.", group: "Toy", temperament: "Charming, Graceful, Sassy", size: "Small", lifespan: "14-16 years" },
  "Pit Bull": { description: "Athletic, loyal, and intelligent dogs known for their determination and people-oriented nature.", group: "Terrier", temperament: "Loyal, People-Oriented, Determined", size: "Medium-Large", lifespan: "12-14 years" },
  "American Pit Bull Terrier": { description: "Athletic, loyal, and intelligent dogs known for their determination and people-oriented nature.", group: "Terrier", temperament: "Loyal, People-Oriented, Determined", size: "Medium-Large", lifespan: "12-14 years" },
  "Mixed Breed": { description: "Unique combinations of multiple breeds, often with hybrid vigor and diverse traits.", group: "Mixed", temperament: "Varies", size: "Varies", lifespan: "10-15 years" },
  "Supermutt": { description: "Dogs with trace amounts of many different breeds, making them truly unique individuals.", group: "Mixed", temperament: "Varies", size: "Varies", lifespan: "10-15 years" },
  "Staffordshire Bull Terrier": { description: "Brave, tenacious dogs that are also gentle and affectionate with families.", group: "Terrier", temperament: "Brave, Tenacious, Affectionate", size: "Medium", lifespan: "12-14 years" },
  "American Staffordshire Terrier": { description: "Confident, smart, good-natured dogs that make excellent family companions.", group: "Terrier", temperament: "Confident, Smart, Good-Natured", size: "Medium-Large", lifespan: "12-16 years" },
  "Jack Russell Terrier": { description: "Energetic, fearless, and clever dogs with a boundless supply of energy.", group: "Terrier", temperament: "Energetic, Fearless, Clever", size: "Small", lifespan: "13-16 years" },
  "Maltese": { description: "Gentle, playful, charming toy dogs with luxurious white coats.", group: "Toy", temperament: "Gentle, Playful, Charming", size: "Small", lifespan: "12-15 years" },
  "Cane Corso": { description: "Intelligent, majestic, affectionate dogs that are natural protectors.", group: "Working", temperament: "Affectionate, Intelligent, Majestic", size: "Large", lifespan: "9-12 years" },
  "English Springer Spaniel": { description: "Friendly, playful, obedient dogs with a love for outdoor activities.", group: "Sporting", temperament: "Friendly, Playful, Obedient", size: "Medium", lifespan: "12-14 years" },
  "Weimaraner": { description: "Friendly, fearless, obedient dogs with a distinctive silver-gray coat.", group: "Sporting", temperament: "Friendly, Fearless, Obedient", size: "Large", lifespan: "10-13 years" },
  "Collie": { description: "Graceful, devoted, proud dogs famously known through the Lassie stories.", group: "Herding", temperament: "Devoted, Graceful, Proud", size: "Large", lifespan: "12-14 years" },
  "Basset Hound": { description: "Charming, patient, low-key hounds with incredible scenting ability.", group: "Hound", temperament: "Charming, Patient, Low-Key", size: "Medium", lifespan: "12-13 years" },
  "Newfoundland": { description: "Sweet, patient, devoted dogs known for their gentle giant nature.", group: "Working", temperament: "Sweet, Patient, Devoted", size: "Giant", lifespan: "9-10 years" },
  "Belgian Malinois": { description: "Confident, smart, hardworking dogs popular in police and military roles.", group: "Herding", temperament: "Confident, Smart, Hardworking", size: "Large", lifespan: "14-16 years" },
  "Bloodhound": { description: "Friendly, independent, inquisitive dogs with the most powerful nose in the dog world.", group: "Hound", temperament: "Friendly, Independent, Inquisitive", size: "Large", lifespan: "10-12 years" },
  "Akita": { description: "Courageous, dignified, profoundly loyal dogs from Japan.", group: "Working", temperament: "Courageous, Dignified, Loyal", size: "Large", lifespan: "10-13 years" },
  "Dalmatian": { description: "Dignified, smart, outgoing dogs known for their spotted coat.", group: "Non-Sporting", temperament: "Dignified, Smart, Outgoing", size: "Large", lifespan: "11-13 years" },
  "Chow Chow": { description: "Dignified, bright, serious-minded dogs with a lion-like appearance.", group: "Non-Sporting", temperament: "Dignified, Bright, Serious-Minded", size: "Medium", lifespan: "8-12 years" },
  "Alaskan Malamute": { description: "Affectionate, loyal, playful dogs bred for hauling heavy loads.", group: "Working", temperament: "Affectionate, Loyal, Playful", size: "Large", lifespan: "10-14 years" },
  "Whippet": { description: "Calm, affectionate, playful dogs that are the fastest breed of their size.", group: "Hound", temperament: "Calm, Affectionate, Playful", size: "Medium", lifespan: "12-15 years" },
};

export const allBreedNames = Object.keys(breedInfoMap);
