const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const httpProxy = require("express-http-proxy");

const app = express();

const authServiceProxy = httpProxy(process.env.AUTH_SERVICE_URL);
const userServiceProxy = httpProxy(process.env.USER_SERVICE_URL, {
  parseReqBody: false,
});
const moodServiceProxy = httpProxy(process.env.MOOD_SERVICE_URL);
const browsingHistoryProxy = httpProxy("http://localhost:5000");
const browsingDomainProxy = httpProxy("http://127.0.0.1:8000");
const chatbotServiceProxy = httpProxy("http://0.0.0.0:9000");

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", (req, res, next) => {
  authServiceProxy(req, res, next);
});

app.use("/api/user", (req, res, next) => {
  userServiceProxy(req, res, next);
});

app.use("/api/mood", (req, res, next) => {
  moodServiceProxy(req, res, next);
});

app.use("/api/chrome-history", (req, res, next) => {
  browsingHistoryProxy(req, res, next);
});

app.use("/api/model", (req, res, next) => {
  browsingDomainProxy(req, res, next);
});

app.use("/api/chat", (req, res, next) => {
  chatbotServiceProxy(req, res, next);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
