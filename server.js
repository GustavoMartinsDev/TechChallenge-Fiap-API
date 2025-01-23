const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors"); // Adicione esta linha
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Adicione esta linha

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:5000/test";

mongoose.connect(mongoUri);

const db = mongoose.connection;
db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
db.once("open", async function () {
  console.log("Connected to MongoDB");

  // Account schema and model
  const accountSchema = new mongoose.Schema({
    id: {
      type: String,
      required: false,
    },
    fullName: {
      type: String,
      required: false,
      default: "",
    },
    firstName: {
      type: String,
      required: false,
      default: "",
    },
    lastName: {
      type: String,
      required: false,
      default: "",
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: false,
      default: "R$",
    },
  });

  const Account = mongoose.model("Account", accountSchema);

  // Transaction schema and model
  const transactionSchema = new mongoose.Schema({
    id: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: true,
      default: "defaultType",
    },
    date: {
      type: String,
      required: true,
      default: new Date().toISOString(),
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    },
  });

  const Transaction = mongoose.model("Transaction", transactionSchema);

  // Defina suas rotas aqui
  app.post("/accounts", async (req, res) => {
    const newAccount = new Account(req.body);
    try {
      const savedAccount = await newAccount.save();
      res.status(201).json(savedAccount);
    } catch (err) {
      console.error("Error creating account:", err);
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/transactions", async (req, res) => {
    const newTransaction = new Transaction(req.body);
    try {
      const savedTransaction = await newTransaction.save();
      res.status(201).json(savedTransaction);
    } catch (err) {
      console.error("Error creating transaction:", err);
      res.status(400).json({ message: err.message });
    }
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
