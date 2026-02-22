import express from "express";
import dotenv from "dotenv";
import icuRoutes from "./routes/icuRoutes.js";
import schedulerRoutes from "./routes/schedulerRoutes.js";
dotenv.config();

const app = express();

app.use(express.json());

// Main route prefix
app.use("/icu", icuRoutes);
app.use("/api/schedule", schedulerRoutes);

app.get("/", (req, res) => {
  res.send("ICU Scheduling Engine Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
