const express = require("express");
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Hello from Express backend!");
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
