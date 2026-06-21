// modules
const express = require("express");

// routes
const webhookRoutes = require("./routes/webhook.routes");

const app = express();

// middlewares
app.use(express.json());
app.use("/webhook", webhookRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend is Running",
  });
});

module.exports = app;
