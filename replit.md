# Guess the Breed Mix - Dog Breed Quiz

## Overview
A web app where users upload photos of their dogs along with Embark DNA breed test results, then play a quiz game guessing the breed percentages.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js with PostgreSQL (Drizzle ORM)
- **File uploads**: Multer, stored in `client/public/uploads/`

## Key Features
- Upload dog photos with multiple images per dog
- Enter Embark breed percentage results
- Quiz mode: guess breeds and percentages for random dogs
- Configurable quiz length (choose how many dogs)
- Scoring system with grade and detailed breakdown
- Breed information (description, group, temperament, size, lifespan)
- Seed data with 5 example dogs

## Data Model
- `dogs` table: id (serial), name, images (text array), breeds (jsonb of {breedName, percentage}[])

## Routes
- `GET /api/dogs` - list all dogs
- `GET /api/dogs/:id` - get single dog
- `POST /api/dogs` - create dog
- `DELETE /api/dogs/:id` - delete dog
- `POST /api/upload` - upload images (returns URLs)

## Pages
- `/` - Home page with dog pool and quiz start
- `/add-dog` - Add a new dog with photos and breed percentages
- `/quiz?count=N` - Quiz game with N random dogs

## Theme
- Warm orange primary color (hue 25)
- Plus Jakarta Sans font
- Dark mode support via CSS variables
