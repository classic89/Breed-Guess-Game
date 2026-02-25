import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDogSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "client", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/dogs", async (_req, res) => {
    const dogs = await storage.getDogs();
    res.json(dogs);
  });

  app.get("/api/dogs/:id", async (req, res) => {
    const dog = await storage.getDog(parseInt(req.params.id));
    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }
    res.json(dog);
  });

  app.post("/api/dogs", async (req, res) => {
    const parsed = insertDogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    const dog = await storage.createDog(parsed.data);
    res.status(201).json(dog);
  });

  app.delete("/api/dogs/:id", async (req, res) => {
    await storage.deleteDog(parseInt(req.params.id));
    res.status(204).send();
  });

  app.post("/api/upload", upload.array("images", 10), (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    const urls = files.map((f) => `/uploads/${f.filename}`);
    res.json({ urls });
  });

  return httpServer;
}
