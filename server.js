const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/test";

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
db.once("open", async function () {
  console.log("Connected to MongoDB");

  // Counter schema and model
  const counterSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  });

  const Counter = mongoose.model("Counter", counterSchema);

  // Function to get the next sequence value
  async function getNextSequenceValue(sequenceName) {
    const sequenceDocument = await Counter.findByIdAndUpdate(
      sequenceName,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return sequenceDocument.seq;
  }

  // Account schema and model
  const accountSchema = new mongoose.Schema({
    id: {
      type: Number,
      required: true,
      unique: true,
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
      type: Number,
      required: true,
      unique: true,
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
    currency: {
      type: String,
      required: true,
      default: "R$",
    },
    fileBase64: {
      type: String,
      required: false,
      default: "",
    },
    fileName: {
      type: String,
      required: false,
      default: "",
    },
  });

  const Transaction = mongoose.model("Transaction", transactionSchema);

  // Routes for inserting and querying data

  // Route to create a new account
  app.post("/accounts", async (req, res) => {
    try {
      const newId = await getNextSequenceValue("accountId");
      const newAccount = new Account({ ...req.body, id: newId });
      const savedAccount = await newAccount.save();
      res.status(201).json(savedAccount);
    } catch (err) {
      console.error("Error creating account:", err);
      res.status(400).json({ message: err.message });
    }
  });

  // Route to get all accounts
  app.get("/accounts", async (req, res) => {
    try {
      const accounts = await Account.find();
      res.status(200).json(accounts);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      res.status(500).json({ message: err.message });
    }
  });

  // Route to get a specific account by ID
  app.get("/accounts/:id", async (req, res) => {
    try {
      const account = await Account.findById(req.params.id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.status(200).json(account);
    } catch (err) {
      console.error("Error fetching account:", err);
      res.status(500).json({ message: err.message });
    }
  });

  // Route to create a new transaction
  app.post("/transactions", async (req, res) => {
    try {
      const newId = await getNextSequenceValue("transactionId");
      const newTransaction = new Transaction({ ...req.body, id: newId });
      const savedTransaction = await newTransaction.save();
      res.status(201).json(savedTransaction);
    } catch (err) {
      console.error("Error creating transaction:", err);
      res.status(400).json({ message: err.message });
    }
  });

  // Route to get all transactions
  app.get("/transactions", async (req, res) => {
    try {
      const transactions = await Transaction.find();
      res.status(200).json(transactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      res.status(500).json({ message: err.message });
    }
  });

  // Route to get a specific transaction by ID
  app.get("/transactions/:id", async (req, res) => {
    try {
      const transaction = await Transaction.findById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(200).json(transaction);
    } catch (err) {
      console.error("Error fetching transaction:", err);
      res.status(500).json({ message: err.message });
    }
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
