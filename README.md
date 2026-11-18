# Guess the Breed Mix

A dog-breed quiz app. Add dogs with photos and Embark breed percentages, browse the dog collection, or play a quiz and see your score.

## Requirements

- Node.js 20 or newer
- npm (included with Node.js)
- PostgreSQL

## Set up on a new computer

1. Clone the repository and enter the project folder:

   ```sh
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install the dependencies:

   ```sh
   npm ci
   ```

3. Create a PostgreSQL database for the app. Keep the database URL private; do not commit it to Git.

4. Set `DATABASE_URL` in the terminal where you will run the app. Replace the example values with your PostgreSQL connection details.

   macOS or Linux:

   ```sh
   export DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
   ```

   Windows PowerShell:

   ```powershell
   $env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST:5432/DATABASE"
   ```

   This setting applies to the current terminal session. Set it again in a new terminal before running database or app commands.

5. Create or update the database tables:

   ```sh
   npm run db:push
   ```

6. Start the development server:

   ```sh
   npm run dev
   ```

7. Open [http://localhost:5000](http://localhost:5000) in your browser.

The app adds five example dogs automatically when it starts with an empty database.

## Useful commands

```sh
npm run check  # Type-check the project
npm run build  # Build the production app
npm run start  # Run the production build
```

Run `npm run build` before `npm run start`.

## Data and uploaded photos

Dog details and breed results are stored in PostgreSQL. Uploaded photos are saved in `client/public/uploads` on the computer running the app. That folder is separate from the database, so back it up along with the database if you need to preserve the full dog collection when moving computers.
