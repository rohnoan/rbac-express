import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { clerkMiddleware, requireAuth } from "@clerk/express";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(clerkMiddleware());

app.get('/',(req,res)=>{
  res.send("yoyo");
})

// Test route (protected)
app.get("/protected", requireAuth(), (req, res) => {
  res.json({ message: "You are authenticated", user: req.auth });
});

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
