import { storage } from "./storage";
import { db } from "./db";
import { dogs } from "@shared/schema";

export async function seedDatabase() {
  const existingDogs = await db.select().from(dogs);
  if (existingDogs.length > 0) return;

  const seedDogs = [
    {
      name: "Luna",
      images: ["/images/mixed_breed_dog_1.jpg"],
      breeds: [
        { breedName: "Labrador Retriever", percentage: 45 },
        { breedName: "German Shepherd", percentage: 30 },
        { breedName: "Golden Retriever", percentage: 15 },
        { breedName: "Supermutt", percentage: 10 },
      ],
    },
    {
      name: "Bear",
      images: ["/images/mixed_breed_dog_2.jpg"],
      breeds: [
        { breedName: "Pit Bull", percentage: 40 },
        { breedName: "Boxer", percentage: 25 },
        { breedName: "Rottweiler", percentage: 20 },
        { breedName: "Supermutt", percentage: 15 },
      ],
    },
    {
      name: "Rosie",
      images: ["/images/mixed_breed_dog_3.jpg"],
      breeds: [
        { breedName: "Beagle", percentage: 35 },
        { breedName: "Dachshund", percentage: 30 },
        { breedName: "Chihuahua", percentage: 20 },
        { breedName: "Jack Russell Terrier", percentage: 15 },
      ],
    },
    {
      name: "Cooper",
      images: ["/images/mixed_breed_dog_4.jpg"],
      breeds: [
        { breedName: "Australian Shepherd", percentage: 50 },
        { breedName: "Border Collie", percentage: 30 },
        { breedName: "Siberian Husky", percentage: 20 },
      ],
    },
    {
      name: "Daisy",
      images: ["/images/mixed_breed_dog_5.jpg"],
      breeds: [
        { breedName: "Poodle", percentage: 40 },
        { breedName: "Cocker Spaniel", percentage: 35 },
        { breedName: "Cavalier King Charles Spaniel", percentage: 25 },
      ],
    },
  ];

  for (const dog of seedDogs) {
    await storage.createDog(dog);
  }

  console.log("Database seeded with 5 dogs");
}
