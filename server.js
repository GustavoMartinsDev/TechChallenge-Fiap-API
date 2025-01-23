const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());

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

  // Insert default account data if not exists
  const defaultAccount = {
    fullName: "Joana da Silva Oliveira",
    firstName: "Joana",
    balance: 2500,
    currency: "R$",
  };

  try {
    const existingAccount = await Account.findOne({
      fullName: defaultAccount.fullName,
    });
    if (!existingAccount) {
      const newAccount = new Account(defaultAccount);
      await newAccount.save();
      console.log("Default account data inserted");
    }
  } catch (err) {
    console.error("Error inserting default account data:", err);
  }

  // Account routes
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

  app.get("/accounts", async (req, res) => {
    try {
      const accounts = await Account.find();
      res.json(accounts);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/accounts/:id", async (req, res) => {
    try {
      const updatedAccount = await Account.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json(updatedAccount);
    } catch (err) {
      console.error("Error updating account:", err);
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/accounts/:id", async (req, res) => {
    try {
      await Account.findByIdAndDelete(req.params.id);
      res.json({ message: "Account deleted" });
    } catch (err) {
      console.error("Error deleting account:", err);
      res.status(500).json({ message: err.message });
    }
  });

  // Transaction routes
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

  app.get("/transactions", async (req, res) => {
    try {
      const transactions = await Transaction.find();
      res.json(transactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/transactions/:id", async (req, res) => {
    try {
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json(updatedTransaction);
    } catch (err) {
      console.error("Error updating transaction:", err);
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/transactions/:id", async (req, res) => {
    try {
      await Transaction.findByIdAndDelete(req.params.id);
      res.json({ message: "Transaction deleted" });
    } catch (err) {
      console.error("Error deleting transaction:", err);
      res.status(500).json({ message: err.message });
    }
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
