import express from "express";
import dotenv from "dotenv";
import { supabase } from "./supabase/supabaseclient.js"; // Adjust the path as necessary

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());

app.get("/", async (req, res) => {
  const { data, error } = await supabase.from("events").select("*").limit(1);

  if (error) {
    console.error("Supabase connection failed:", error.message);
    return res
      .status(500)
      .json({ message: "Supabase not connected", error: error.message });
  }

  res
    .status(200)
    .json({ message: "Supabase connected successfully!", sample: data });

  console.log("Supabase connected successfully");

  // res.status(200).json({
  //   message: "EVMS Backend is running!",
  //   port: PORT,
  //   timestamp: new Date().toISOString(),
  // });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
