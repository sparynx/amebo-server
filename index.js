const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');


const postRoutes = require("./src/posts/post.route");
const likeRoutes = require("./src/likes/likes.router");
const commentRoutes = require("./src/comments/comment.router");
const userRoutes = require("./src/user/user.route");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
    origin: ["https://ameboapp.vercel.app" ],
    credentials: true
}));

// Routes
app.use("/api/posts", postRoutes);
app.use("/api/posts", likeRoutes);
app.use("/api/posts", commentRoutes);
app.use("/api/auth", userRoutes);

// Add this near your other routes in index.js
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

// Create a schema for subscribers (add this with your other mongoose schemas)
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  subscribeDate: {
    type: Date,
    default: Date.now
  }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// Add the subscribe route
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    // Create new subscriber
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Send welcome email using MailerSend
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });

    const recipients = [new Recipient(email)];
    const sender = new Sender(process.env.EMAIL_SENDER, "Amebo Newsletter");

    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo(recipients)
      .setSubject("Welcome to Amebo Newsletter!")
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; background: #ffffff; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="text-align: center; padding: 20px; background: #1e3a8a; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Welcome to Amebo Newsletter!</h1>
          </div>
      
          <!-- Body -->
          <div style="padding: 20px; color: #333333;">
            <p style="font-size: 16px; line-height: 1.6;">
              Thank you for subscribing to our newsletter. You'll now receive our latest articles and insights directly in your inbox.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Stay tuned for exclusive content, updates, and more!
            </p>
          </div>
      
          <!-- Footer -->
          <div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 0 0 10px 10px;">
            <p style="font-size: 14px; color: #666666; margin: 0;">
              Best regards,<br>
              <strong style="color: #1e3a8a;">The Amebo Team</strong>
            </p>
          </div>
      
          <!-- Call-to-Action Button -->
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://ameboapp.vercel.app" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; background: #1e3a8a; text-decoration: none; border-radius: 5px; transition: background 0.3s;">
              Visit Our Website
            </a>
          </div>
        </div>
      `);

    await mailerSend.email.send(emailParams);

    res.status(200).json({ message: "Subscription successful" });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ error: "Failed to process subscription" });
  }
});


// Connect to MongoDB
async function main() {
    await mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    console.log("MongoDB connected successfully");

    // Default Route
    app.get("/", (req, res) => {
        res.send('Amebo server is listening');
    });
}

main().catch(err => console.log("MongoDB connection error:", err));

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
