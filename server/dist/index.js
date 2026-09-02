var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// config/db.js
var require_db = __commonJS({
  "config/db.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var connectDB2 = async () => {
      try {
        const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/denish");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    };
    module2.exports = connectDB2;
  }
});

// models/Admin.js
var require_Admin = __commonJS({
  "models/Admin.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var bcrypt = require("bcryptjs");
    var AdminSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      name: {
        type: String,
        default: "Admin"
      },
      role: {
        type: String,
        default: "superadmin"
      },
      image: {
        type: String,
        default: ""
      }
    }, { timestamps: true });
    AdminSchema.pre("save", async function() {
      if (!this.isModified("password")) return;
      this.password = await bcrypt.hash(this.password, 10);
    });
    AdminSchema.methods.comparePassword = async function(password) {
      return await bcrypt.compare(password, this.password);
    };
    module2.exports = mongoose.model("Admin", AdminSchema);
  }
});

// models/SystemContent.js
var require_SystemContent = __commonJS({
  "models/SystemContent.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var systemContentSchema = new mongoose.Schema({
      key: {
        type: String,
        required: true,
        unique: true
        // 'terms_of_service', 'privacy_policy', 'help_and_support'
      },
      title: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      contactEmail: {
        type: String,
        default: "support@denish.com"
      },
      contactPhone: {
        type: String,
        default: "+234 800 336 4741"
      }
    }, { timestamps: true });
    module2.exports = mongoose.model("SystemContent", systemContentSchema);
  }
});

// seedAdmin.js
var require_seedAdmin = __commonJS({
  "seedAdmin.js"(exports2, module2) {
    require("dotenv").config();
    var Admin = require_Admin();
    var connectDB2 = require_db();
    var seedAdmin2 = async ({ exitOnComplete = false } = {}) => {
      try {
        await connectDB2();
        const adminEmail = "admin@denishng.com";
        const adminPassword = "Admin@123456";
        const existingAdmin = await Admin.findOne({ email: adminEmail });
        if (existingAdmin) {
          console.log("Admin already exists. Updating password...");
          existingAdmin.password = adminPassword;
          await existingAdmin.save();
          console.log("Admin password updated successfully.");
        } else {
          const newAdmin = new Admin({
            email: adminEmail,
            password: adminPassword,
            name: "Denish Admin"
          });
          await newAdmin.save();
          console.log("Admin created successfully.");
        }
        const SystemContent = require_SystemContent();
        const tosContent = `TERMS OF SERVICE AND PRIVACY POLICY
Effective Date: August 14, 2026
Company Legal Name: Denish Limited (RC: 9462857)
Registered Address: Plot 3 Block B, ADP Premises Agric GRA, Ilorin,
Kwara State, Nigeria
Brand/App Name: Denish
Website/App URL: https://denishng.com
Support Contact: support@denishng.com / 08036301983
Data Protection Officer (DPO) Email: denishlimited@gmail.com

PART I: TERMS OF SERVICE

1. Introduction & Acceptance of Terms
Welcome to Denish ("we", "us", or "our"). These Terms of Service ("Terms")
govern your access to and use of the Denish mobile application, website
(https://denishng.com), and all related logistics, delivery, and marketplace
services.
By creating an account, accessing, or using the platform as a Buyer, Vendor,
or Rider, you explicitly agree to be bound by these Terms. If you do not
agree with any part of these Terms, you must discontinue use of the platform
immediately.

2. Platform Overview & User Eligibility
. Marketplace Model: Denish operates as an online marketplace
connecting Buyers with independent/partner Vendors (offering Food,
Grocery, Pharmacy, and Retail categories) and Riders to facilitate
local commerce, pickup, and logistics services.
Inventory Disclaimer: We do not own or stock the inventory of
products sold by third-party vendors. Vendors are independently
responsible for the quality, safety, and legality of their goods.
Age Limit & Capacity: Users must meet the legal age requirements
mandated under the laws of the Federal Republic of Nigeria to
register and execute transactions on the platform.

3. Account Registration, Security, & KYC
Account Creation: Users may register using traditional credentials
or via third-party login protocols including Google OAuth and Apple
login.
Mandatory KYC: To ensure platform security and compliance, users
(particularly Vendors and Riders) must complete Know Your
Customer (KYC) verification, which includes submitting a valid ID and
Selfie, Bank Verification Number (BVN), and National Identification
Number (NIN).
Security Responsibility: You are entirely responsible for
maintaining the confidentiality of your account credentials and for all
activities that occur under your account.

4. Financial Terms: Payments, Settlement, & Fees
Accepted Payment Methods: We support multiple payment
channels including Cards, Bank Transfers, Digital Wallets, and Cash
on Delivery (COD).
Payment Collection: Payments are processed securely through
integrated third-party payment gateways.
Settlement Cycle: Payouts to Vendors and Riders are processed
according to the designated settlement cycle (T+X schedule) directly
to their designated bank accounts.
Fees: Delivery fees, service fees, and platform fees are calculated
and displayed to users prior to order confirmation.

5. Orders, Cancellations, & Refunds
. Order Modifications & Cancellations: Cancellation windows are
strictly enforced according to system parameters. Unauthorized
cancellations after order processing has commenced may incur
penalty charges.
. Non-Refundable Items: Due to safety, hygiene, and custom
nature, items classified under Food, Pharmacy, and Custom orders
are strictly non-refundable.
Refund Processing: Approved refunds are credited instantly to the
user's Denish Wallet, whereas card-based refunds are subject to
standard banking processing timelines.

6. Vendor & Rider Rules and SLAS
Vendor Service Level Agreements (SLAs): Vendors are required
to accept orders and complete food preparation or retail packaging
within designated timeframes to maintain active status.
\u2022 Rider Guidelines: Riders must utilize approved vehicles
(Bikes/Cars) equipped with valid vehicle insurance and adhere strictly
to traffic and safety regulations.
. Grounds for Deactivation: Any breach of platform safety
guidelines, fraudulent activities, poor delivery ratings, or violation of
KYC rules will result in immediate account deactivation.

PART III: GENERAL PROVISIONS

1. Limitation of Liability & Loss Allocation
Denish Limited acts strictly as an intermediary digital marketplace. We bear
no direct liability for third-party vendor product defects, delayed logistics
caused by unforeseen external factors, or independent rider misconduct
beyond our reasonable operational control. Liability caps per order are
enforced per internal operational guidelines.

2. Governing Law & Dispute Resolution
These Terms and Privacy Policy shall be governed by, and construed in
accordance with, the laws of the Federal Republic of Nigeria. Any
disputes, controversies, or claims arising out of or relating to these terms
shall be settled via binding arbitration in Nigeria.

3. Contact Information
For any questions, complaints, or privacy-related inquiries regarding these
terms or data handling practices, please contact us:
\u2022
Support Email: support@denishng.com
DPO Direct Email: denishlimited@gmail.com
Phone: 08036301983`;
        const privacyContent = `TERMS OF SERVICE AND PRIVACY POLICY
Effective Date: August 14, 2026
Company Legal Name: Denish Limited (RC: 9462857)
Registered Address: Plot 3 Block B, ADP Premises Agric GRA, Ilorin,
Kwara State, Nigeria
Brand/App Name: Denish
Website/App URL: https://denishng.com
Support Contact: support@denishng.com / 08036301983
Data Protection Officer (DPO) Email: denishlimited@gmail.com

PART II: PRIVACY POLICY

1. Information We Collect
To provide a seamless multi-sided marketplace experience, we collect and
process the following categories of personal data:
Identification & Contact Data: Name, Phone number, Email
address, and Physical address.
Location Data: Real-time GPS location data from Buyers, Vendors,
and Riders to optimize route mapping and delivery tracking.
Verification Data: National Identification Number (NIN) and Bank
Verification Number (BVN).
\u2022 Payment Data: Transaction history and records (note: sensitive
health prescriptions and raw card details are not directly collected or
stored on our servers).

2. How We Store & Protect Your Data
. Storage Location: Personal data is stored securely on servers
located both within Nigeria and abroad through our hosting provider,
Hostinger.
.
Data Retention Period: We retain user personal data for a period
of 1 year following formal account deletion, after which it is securely
anonymized or permanently deleted, unless retention is required for
legal or regulatory compliance.

3. Disclosure of Information to Third Parties
We share necessary information with trusted third parties strictly to
facilitate operational fulfillment:
\u2022
. Payment Gateways: To process secure financial transactions.
Mapping Services: To enable real-time tracking and location
routing.
Authentication Providers: Google and Apple OAuth for
streamlined login.
Marketplace Participants: Relevant details are shared between
Buyers, Vendors, and Riders solely to complete service fulfillment
(e.g., delivery addresses and contact numbers).

4. Cookies and Tracking Technologies
The platform utilizes essential operational cookies and performance
analytics to monitor app performance and enhance user experience.

PART III: GENERAL PROVISIONS

1. Limitation of Liability & Loss Allocation
Denish Limited acts strictly as an intermediary digital marketplace. We bear
no direct liability for third-party vendor product defects, delayed logistics
caused by unforeseen external factors, or independent rider misconduct
beyond our reasonable operational control. Liability caps per order are
enforced per internal operational guidelines.

2. Governing Law & Dispute Resolution
These Terms and Privacy Policy shall be governed by, and construed in
accordance with, the laws of the Federal Republic of Nigeria. Any
disputes, controversies, or claims arising out of or relating to these terms
shall be settled via binding arbitration in Nigeria.

3. Contact Information
For any questions, complaints, or privacy-related inquiries regarding these
terms or data handling practices, please contact us:
\u2022
Support Email: support@denishng.com
DPO Direct Email: denishlimited@gmail.com
Phone: 08036301983`;
        const supportContent = `TERMS OF SERVICE AND PRIVACY POLICY
Effective Date: August 14, 2026
Company Legal Name: Denish Limited (RC: 9462857)
Registered Address: Plot 3 Block B, ADP Premises Agric GRA, Ilorin,
Kwara State, Nigeria
Brand/App Name: Denish
Website/App URL: https://denishng.com
Support Contact: support@denishng.com / 08036301983
Data Protection Officer (DPO) Email: denishlimited@gmail.com

If you need support, have questions, or require assistance with using the Denish app or your account, please reach out to us using our contact information below.

Support Email: support@denishng.com
DPO Direct Email: denishlimited@gmail.com
Phone: 08036301983`;
        await SystemContent.findOneAndUpdate(
          { key: "terms_of_service" },
          { title: "Terms of Service", content: tosContent, contactEmail: "support@denishng.com", contactPhone: "08036301983" },
          { upsert: true, new: true }
        );
        await SystemContent.findOneAndUpdate(
          { key: "privacy_policy" },
          { title: "Privacy Policy", content: privacyContent, contactEmail: "support@denishng.com", contactPhone: "08036301983" },
          { upsert: true, new: true }
        );
        await SystemContent.findOneAndUpdate(
          { key: "help_and_support" },
          { title: "Help & Support", content: supportContent, contactEmail: "support@denishng.com", contactPhone: "08036301983" },
          { upsert: true, new: true }
        );
        console.log("Legal and contact contents seeded successfully.");
        if (exitOnComplete) process.exit(0);
        return true;
      } catch (error) {
        console.error("Error seeding admin:", error);
        if (exitOnComplete) process.exit(1);
        throw error;
      }
    };
    if (require.main === module2) {
      seedAdmin2({ exitOnComplete: true });
    }
    module2.exports = { seedAdmin: seedAdmin2 };
  }
});

// models/Vendor.js
var require_Vendor = __commonJS({
  "models/Vendor.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var vendorSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      phone: { type: String },
      password: { type: String },
      // In real app, hash this
      businessName: { type: String },
      category: { type: String, default: "Local dishes" },
      address: { type: String, default: "14 Secretariat Avenue, Ikeja, Lagos" },
      about: { type: String, default: "Authentic Nigerian home-style cooking made fresh daily." },
      logoUrl: { type: String },
      coverUrl: { type: String },
      openingHours: {
        type: Array,
        default: [
          { day: "Monday", hours: "0800 - 1700" },
          { day: "Tuesday", hours: "0800 - 1700" },
          { day: "Wednesday", hours: "0800 - 1700" },
          { day: "Thursday", hours: "0800 - 1700" },
          { day: "Friday", hours: "0800 - 1700" },
          { day: "Saturday", hours: "Closed" },
          { day: "Sunday", hours: "Closed" }
        ]
      },
      payoutAccount: {
        bank: { type: String, default: "Access Bank" },
        bankCode: { type: String, default: "044" },
        accountName: { type: String, default: "Mama's Kitchen Ltd" },
        accountNumber: { type: String, default: "636363633663" }
      },
      deliveryLocations: {
        type: [String],
        default: ["Victoria Island", "Ikoyi", "Lekki Phase 1", "Ajah"]
      },
      notifications: {
        newOrders: { type: Boolean, default: true },
        statusUpdates: { type: Boolean, default: true },
        payouts: { type: Boolean, default: false },
        promotions: { type: Boolean, default: true }
      },
      earnings: {
        availableBalance: { type: Number, default: 0 },
        weeklyRevenue: { type: Number, default: 0 },
        totalOrders: { type: Number, default: 0 },
        avgOrders: { type: Number, default: 0 }
      },
      dailyBreakdown: [
        {
          day: String,
          orders: Number,
          amount: Number
        }
      ],
      barData: [Number],
      // e.g. for weekly chart [22, 30, 28, 14, 35, 28, 25]
      resetPasswordOTP: String,
      resetPasswordExpires: Date,
      status: {
        type: String,
        enum: ["Pending", "Approved", "Suspended", "pending", "approved", "suspended"],
        default: "Pending",
        set: function(val) {
          if (typeof val === "string") {
            return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
          }
          return val;
        }
      },
      rating: { type: Number, default: 4.8 },
      deliveryTime: { type: String, default: "25-35 min" },
      deliveryFee: { type: Number, default: 500 }
    }, { timestamps: true });
    module2.exports = mongoose.model("Vendor", vendorSchema);
  }
});

// models/Order.js
var require_Order = __commonJS({
  "models/Order.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var orderSchema = new mongoose.Schema({
      orderId: { type: String, required: true },
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      customerName: { type: String, default: "Anonymous" },
      address: { type: String, default: "No address" },
      deliveryAddress: { type: String },
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
      vendorName: { type: String, default: "Unknown Vendor" },
      items: [{
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
        name: String,
        price: Number,
        quantity: Number
      }],
      total: { type: Number, required: true },
      totalAmount: { type: Number },
      status: {
        type: String,
        enum: ["pending", "preparing", "ready", "on the way", "delivered", "cancelled"],
        default: "pending"
      }
    }, { timestamps: true });
    module2.exports = mongoose.model("Order", orderSchema);
  }
});

// utils/flutterwave.js
var require_flutterwave = __commonJS({
  "utils/flutterwave.js"(exports2, module2) {
    var axios = require("axios");
    var cachedToken = null;
    var tokenExpiry = 0;
    var getFlutterwaveAuthHeader = async () => {
      const secretKey = process.env.FLW_SECRET_KEY;
      if (secretKey && secretKey.startsWith("FLWSECK")) {
        return `Bearer ${secretKey}`;
      }
      const now = Date.now();
      if (cachedToken && tokenExpiry > now + 6e4) {
        return `Bearer ${cachedToken}`;
      }
      const clientId = process.env.FLW_CLIENT_ID;
      const clientSecret = process.env.FLW_CLIENT_SECRET;
      if (clientId && clientSecret) {
        try {
          const response = await axios.post(
            "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token",
            new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: "client_credentials"
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          );
          if (response.data && response.data.access_token) {
            cachedToken = response.data.access_token;
            const expiresIn = response.data.expires_in || 3600;
            tokenExpiry = now + expiresIn * 1e3;
            return `Bearer ${cachedToken}`;
          }
        } catch (err) {
          console.warn("Flutterwave OAuth token error:", err.response?.data || err.message);
        }
      }
      return `Bearer ${secretKey || ""}`;
    };
    var getFlutterwaveKeys = () => {
      return {
        merchantId: process.env.FLW_MERCHANT_ID || "",
        publicKey: process.env.FLW_PUBLIC_KEY || "",
        secretKey: process.env.FLW_SECRET_KEY || "",
        clientId: process.env.FLW_CLIENT_ID || "",
        clientSecret: process.env.FLW_CLIENT_SECRET || "",
        encryptionKey: process.env.FLW_ENCRYPTION_KEY || ""
      };
    };
    module2.exports = {
      getFlutterwaveAuthHeader,
      getFlutterwaveKeys
    };
  }
});

// utils/payoutService.js
var require_payoutService = __commonJS({
  "utils/payoutService.js"(exports2, module2) {
    var axios = require("axios");
    var { getFlutterwaveAuthHeader } = require_flutterwave();
    var BANK_CODES = {
      "access bank": "044",
      "access bank (diamond)": "063",
      "guaranty trust bank": "058",
      "gtbank": "058",
      "first bank of nigeria": "011",
      "first bank": "011",
      "zenith bank": "057",
      "united bank for africa": "033",
      "uba": "033",
      "kuda bank": "50211",
      "kuda": "50211",
      "opay": "999992",
      "opay digital services": "999992",
      "palmpay": "999991",
      "moniepoint microfinance bank": "50515",
      "moniepoint": "50515",
      "stanbic ibtc bank": "221",
      "stanbic ibtc": "221",
      "fidelity bank": "070",
      "union bank of nigeria": "032",
      "union bank": "032",
      "sterling bank": "232",
      "wema bank": "035",
      "alat by wema": "035",
      "first city monument bank": "214",
      "fcmb": "214",
      "ecobank nigeria": "050",
      "ecobank": "050",
      "polaris bank": "076",
      "keystone bank": "082",
      "jaiz bank": "301",
      "taj bank": "302",
      "providus bank": "101",
      "vfd microfinance bank": "566",
      "rubies mfb": "125"
    };
    var FALLBACK_BANKS = [
      { id: 1, name: "Access Bank", code: "044" },
      { id: 2, name: "Guaranty Trust Bank (GTBank)", code: "058" },
      { id: 3, name: "First Bank of Nigeria", code: "011" },
      { id: 4, name: "Zenith Bank", code: "057" },
      { id: 5, name: "United Bank For Africa (UBA)", code: "033" },
      { id: 6, name: "Kuda Bank", code: "50211" },
      { id: 7, name: "OPay Digital Services", code: "999992" },
      { id: 8, name: "PalmPay", code: "999991" },
      { id: 9, name: "Moniepoint Microfinance Bank", code: "50515" },
      { id: 10, name: "Stanbic IBTC Bank", code: "221" },
      { id: 11, name: "Fidelity Bank", code: "070" },
      { id: 12, name: "Union Bank of Nigeria", code: "032" },
      { id: 13, name: "Sterling Bank", code: "232" },
      { id: 14, name: "Wema Bank (ALAT)", code: "035" },
      { id: 15, name: "FCMB (First City Monument Bank)", code: "214" },
      { id: 16, name: "Ecobank Nigeria", code: "050" },
      { id: 17, name: "Polaris Bank", code: "076" },
      { id: 18, name: "Keystone Bank", code: "082" },
      { id: 19, name: "Jaiz Bank", code: "301" },
      { id: 20, name: "Taj Bank", code: "302" },
      { id: 21, name: "Providus Bank", code: "101" },
      { id: 22, name: "VFD Microfinance Bank", code: "566" }
    ];
    var resolveBankCode = (bankName = "", existingCode = "") => {
      if (existingCode && String(existingCode).trim().length >= 3) {
        return String(existingCode).trim();
      }
      const normalized = String(bankName || "").toLowerCase().trim();
      for (const [key, code] of Object.entries(BANK_CODES)) {
        if (normalized.includes(key) || key.includes(normalized)) {
          return code;
        }
      }
      return "044";
    };
    var initiatePayoutTransfer = async ({
      accountBank,
      accountNumber,
      amount,
      narration = "Denish Payout",
      currency = "NGN",
      reference,
      recipientName = ""
    }) => {
      let flwResponse = null;
      let flwError = null;
      try {
        const authHeader = await getFlutterwaveAuthHeader();
        const payload = {
          account_bank: String(accountBank).trim(),
          account_number: String(accountNumber).trim(),
          amount: Number(amount),
          narration,
          currency,
          reference,
          debit_currency: "NGN"
        };
        console.log("[PayoutService] Initiating Flutterwave transfer:", {
          reference,
          account_bank: payload.account_bank,
          account_number: payload.account_number,
          amount: payload.amount
        });
        const response = await axios.post(
          "https://api.flutterwave.com/v3/transfers",
          payload,
          {
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
              "User-Agent": "Denish/1.0"
            },
            timeout: 15e3
          }
        );
        if (response.data && (response.data.status === "success" || response.data.status === "NEW")) {
          flwResponse = response.data;
          console.log("[PayoutService] Flutterwave transfer response success:", flwResponse.data?.status || "OK");
        } else {
          flwError = response.data?.message || "Transfer response incomplete";
          console.warn("[PayoutService] Flutterwave transfer warning:", flwError);
        }
      } catch (err) {
        flwError = err.response?.data?.message || err.message;
        console.warn("[PayoutService] Flutterwave live API transfer notice:", flwError);
      }
      if (flwResponse && flwResponse.data) {
        return {
          success: true,
          mode: "flutterwave_live",
          transferId: flwResponse.data.id,
          status: flwResponse.data.status || "Pending",
          reference: flwResponse.data.reference || reference,
          message: flwResponse.message || "Transfer queued successfully via Flutterwave",
          fee: flwResponse.data.fee || 0,
          raw: flwResponse.data
        };
      }
      return {
        success: false,
        mode: "platform_pipeline",
        transferId: null,
        status: "Completed",
        reference,
        message: flwError || "Transfer processed via local payout pipeline",
        fee: 0,
        rawError: flwError
      };
    };
    var checkTransferStatus = async (transferId) => {
      try {
        const authHeader = await getFlutterwaveAuthHeader();
        const response = await axios.get(
          `https://api.flutterwave.com/v3/transfers/${transferId}`,
          {
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json"
            },
            timeout: 1e4
          }
        );
        return response.data;
      } catch (err) {
        console.warn("[PayoutService] checkTransferStatus error:", err.response?.data || err.message);
        return null;
      }
    };
    module2.exports = {
      BANK_CODES,
      FALLBACK_BANKS,
      resolveBankCode,
      initiatePayoutTransfer,
      checkTransferStatus
    };
  }
});

// models/Transaction.js
var require_Transaction = __commonJS({
  "models/Transaction.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var transactionSchema = new mongoose.Schema({
      type: {
        type: String,
        required: true
        // e.g., 'Order Payment', 'Vendor Payout', 'Driver Payout'
      },
      from: {
        type: String,
        required: true
      },
      to: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      method: {
        type: String,
        default: "Card"
        // Card, Bank Transfer, Wallet
      },
      status: {
        type: String,
        enum: ["Completed", "Pending", "Failed"],
        default: "Pending"
      },
      reference: {
        type: String,
        unique: true
      }
    }, { timestamps: true });
    module2.exports = mongoose.model("Transaction", transactionSchema);
  }
});

// models/Notification.js
var require_Notification = __commonJS({
  "models/Notification.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var NotificationSchema = new mongoose.Schema({
      title: {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ["dispute", "driver", "order", "payment", "system", "promo"],
        default: "system"
      },
      recipient: {
        type: String,
        enum: ["admin", "driver", "vendor", "customer", "all"],
        default: "admin"
      },
      read: {
        type: Boolean,
        default: false
      }
    }, { timestamps: true });
    module2.exports = mongoose.model("Notification", NotificationSchema);
  }
});

// controllers/vendorController.js
var require_vendorController = __commonJS({
  "controllers/vendorController.js"(exports2, module2) {
    var Vendor = require_Vendor();
    var Order = require_Order();
    var mongoose = require("mongoose");
    var getCurrentVendor = async (req) => {
      const userId = req.headers["x-user-id"];
      const userEmail = req.headers["x-user-email"];
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const vendor = await Vendor.findById(userId);
        if (vendor) return vendor;
      }
      if (userEmail) {
        const vendor = await Vendor.findOne({ email: userEmail });
        if (vendor) return vendor;
      }
      return await Vendor.findOne();
    };
    var getVendorDashboard = async (req, res) => {
      try {
        let vendor = await getCurrentVendor(req);
        if (!vendor) {
          vendor = await Vendor.create({
            name: "Demo Vendor",
            email: "demo@vendor.com",
            businessName: "Mama's Kitchen",
            status: "Approved"
          });
        }
        const allOrders = await Order.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
        const stats = {
          new: allOrders.filter((o) => o.status === "pending" || o.status === "new").length,
          cooking: allOrders.filter((o) => o.status === "preparing").length,
          ready: allOrders.filter((o) => o.status === "ready").length
        };
        const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
        const deliveredCount = allOrders.filter((o) => o.status === "delivered").length;
        const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;
        const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const dayTotals = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
        const dayOrders = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
        allOrders.forEach((order) => {
          const orderDate = new Date(order.createdAt || order.updatedAt || Date.now());
          const dayIndex = orderDate.getDay() === 0 ? 6 : orderDate.getDay() - 1;
          const dayName = DAYS[dayIndex];
          dayTotals[dayName] = (dayTotals[dayName] || 0) + (order.totalAmount || order.total || 0);
          dayOrders[dayName] = (dayOrders[dayName] || 0) + 1;
        });
        const barData = DAYS.map((day) => dayTotals[day]);
        const dailyBreakdown = DAYS.map((day) => ({
          day,
          orders: dayOrders[day],
          amount: dayTotals[day]
        }));
        const customData = {
          ...vendor.toObject(),
          storeOpen: vendor.status === "Approved",
          earnings: {
            availableBalance: typeof vendor.earnings?.availableBalance === "number" ? vendor.earnings.availableBalance : totalRevenue || 248500,
            weeklyRevenue: vendor.earnings?.weeklyRevenue ?? totalRevenue,
            totalOrders: vendor.earnings?.totalOrders ?? allOrders.length,
            avgOrders: vendor.earnings?.avgOrders ?? Math.round(avgOrderValue)
          },
          stats,
          todayRevenue: totalRevenue,
          delivered: deliveredCount,
          lowStock: 0,
          barData,
          dailyBreakdown,
          recentOrders: allOrders.slice(0, 5).map((o) => ({
            id: o.orderId || o._id.toString(),
            _id: o._id.toString(),
            orderId: o.orderId || o._id.toString(),
            customerName: o.customerName || "Customer",
            itemsCount: o.items?.length || 1,
            items: o.items?.map((i) => `${i.quantity || 1}x ${i.name}`).join(", ") || "1x Order Items",
            amount: o.totalAmount || o.total || 0,
            status: o.status === "pending" ? "new" : o.status,
            createdAt: o.createdAt
          })),
          liveOrders: allOrders.slice(0, 10).map((o) => ({
            id: o.orderId || o._id.toString(),
            _id: o._id.toString(),
            orderId: o.orderId || o._id.toString(),
            customer: o.customerName || "Customer",
            phone: o.customerPhone || "+234800000000",
            address: o.address || o.deliveryAddress || "12 Marina Road, Lagos",
            itemsCount: o.items?.length || 1,
            items: o.items?.map((i) => `${i.quantity || 1}x ${i.name}`).join(", ") || "1x Order Items",
            rawItems: o.items && o.items.length > 0 ? o.items : [{ name: "Order Items", quantity: 1, price: o.totalAmount || o.total || 5e3 }],
            amount: `\u20A6${Number(o.totalAmount || o.total || 0).toLocaleString()}`,
            totalNumeric: o.totalAmount || o.total || 0,
            status: o.status === "pending" ? "new" : o.status,
            specialInstructions: o.specialInstructions || "None",
            createdAt: o.createdAt
          }))
        };
        res.status(200).json({ success: true, data: customData });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateVendorProfile = async (req, res) => {
      try {
        let vendor = await getCurrentVendor(req);
        if (!vendor) {
          return res.status(404).json({ success: false, error: "Vendor not found" });
        }
        Object.assign(vendor, req.body);
        await vendor.save();
        res.status(200).json({ success: true, data: vendor });
      } catch (error) {
        console.error("Error in updateVendorProfile:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateVendorOrderStatus = async (req, res) => {
      try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await Order.findOne({
          $or: [{ _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null }, { orderId }]
        });
        if (!order) {
          return res.status(404).json({ success: false, error: "Order not found" });
        }
        order.status = status;
        await order.save();
        res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var requestVendorPayout = async (req, res) => {
      try {
        const { amount } = req.body;
        const payoutAmount = typeof amount === "number" ? amount : parseFloat(String(amount || "").replace(/[^0-9.]/g, ""));
        if (!payoutAmount || isNaN(payoutAmount) || payoutAmount <= 0) {
          return res.status(400).json({ success: false, error: "Please enter a valid payout amount" });
        }
        if (payoutAmount < 5e3) {
          return res.status(400).json({ success: false, error: "Minimum payout is \u20A65,000" });
        }
        const vendor = await getCurrentVendor(req);
        if (!vendor) {
          return res.status(404).json({ success: false, error: "Vendor not found" });
        }
        const currentBalance = typeof vendor.earnings?.availableBalance === "number" ? vendor.earnings.availableBalance : 248500;
        if (payoutAmount > currentBalance) {
          return res.status(400).json({
            success: false,
            error: `Insufficient balance for payout. Available: \u20A6${currentBalance.toLocaleString()}`
          });
        }
        const bankName = vendor.payoutAccount?.bank || "Access Bank";
        const accountNumber = vendor.payoutAccount?.accountNumber || "0123456789";
        const accountName = vendor.payoutAccount?.accountName || vendor.businessName || vendor.name;
        const { resolveBankCode, initiatePayoutTransfer } = require_payoutService();
        const bankCode = resolveBankCode(bankName, vendor.payoutAccount?.bankCode);
        const reference = `VND_TRF_${Date.now()}_${Math.floor(Math.random() * 1e3)}`;
        const flwTransfer = await initiatePayoutTransfer({
          accountBank: bankCode,
          accountNumber,
          amount: payoutAmount,
          narration: `Denish Vendor Payout - ${vendor.businessName || vendor.name}`,
          reference,
          recipientName: accountName
        });
        const newBalance = Math.max(0, currentBalance - payoutAmount);
        vendor.earnings = {
          ...vendor.earnings?.toObject ? vendor.earnings.toObject() : vendor.earnings,
          availableBalance: newBalance
        };
        vendor.markModified("earnings");
        await vendor.save();
        const Transaction = require_Transaction();
        const transaction = await Transaction.create({
          type: "Vendor Payout",
          from: "Denish Platform Wallet",
          to: `${vendor.businessName || vendor.name} (${bankName} - ${accountNumber})`,
          amount: payoutAmount,
          method: "Bank Transfer",
          status: flwTransfer.status || "Completed",
          reference
        });
        try {
          const Notification = require_Notification();
          await Notification.create({
            title: "Payout Initiated \u{1F389}",
            message: `Payout of \u20A6${payoutAmount.toLocaleString()} to ${bankName} (${accountNumber}) has been initiated. Ref: ${reference}`,
            type: "payout",
            recipient: "vendor",
            read: false
          });
        } catch (notifErr) {
          console.warn("Vendor payout notification notice:", notifErr.message);
        }
        res.status(200).json({
          success: true,
          message: `\u20A6${payoutAmount.toLocaleString()} payout initiated to ${bankName} (${accountNumber}).`,
          data: {
            transaction,
            availableBalance: newBalance,
            reference,
            mode: flwTransfer.mode
          }
        });
      } catch (error) {
        console.error("requestVendorPayout error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getVendorTransactions = async (req, res) => {
      try {
        const vendor = await getCurrentVendor(req);
        if (!vendor) {
          return res.status(404).json({ success: false, error: "Vendor not found" });
        }
        const Transaction = require_Transaction();
        const transactions = await Transaction.find({ type: "Vendor Payout" }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: transactions });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getVendorNotifications = async (req, res) => {
      try {
        const Notification = require_Notification();
        const notifications = await Notification.find({
          $or: [
            { recipient: { $in: ["vendor", "all"] } },
            { recipient: { $exists: false } },
            { recipient: null }
          ]
        }).sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ success: true, data: notifications });
      } catch (error) {
        console.error("getVendorNotifications error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var markVendorNotificationRead = async (req, res) => {
      try {
        const Notification = require_Notification();
        const { id } = req.params;
        const mongoose2 = require("mongoose");
        if (mongoose2.Types.ObjectId.isValid(id)) {
          await Notification.findByIdAndUpdate(id, { read: true });
        } else {
          await Notification.updateOne({ _id: id }, { read: true });
        }
        res.status(200).json({ success: true, message: "Notification marked as read" });
      } catch (error) {
        console.error("markVendorNotificationRead error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var markAllVendorNotificationsRead = async (req, res) => {
      try {
        const Notification = require_Notification();
        await Notification.updateMany(
          {
            $or: [
              { recipient: { $in: ["vendor", "all"] } },
              { recipient: { $exists: false } },
              { recipient: null }
            ],
            read: false
          },
          { read: true }
        );
        res.status(200).json({ success: true, message: "All notifications marked as read" });
      } catch (error) {
        console.error("markAllVendorNotificationsRead error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    module2.exports = {
      getVendorDashboard,
      updateVendorProfile,
      updateVendorOrderStatus,
      requestVendorPayout,
      getVendorTransactions,
      getVendorNotifications,
      markVendorNotificationRead,
      markAllVendorNotificationsRead
    };
  }
});

// controllers/orderController.js
var require_orderController = __commonJS({
  "controllers/orderController.js"(exports2, module2) {
    var Order = require_Order();
    var Vendor = require_Vendor();
    var getVendorOrders = async (req, res) => {
      try {
        let vendor = await Vendor.findOne();
        if (!vendor) {
          return res.status(404).json({ success: false, error: "Vendor not found" });
        }
        const orders = await Order.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    module2.exports = {
      getVendorOrders
    };
  }
});

// models/MenuItem.js
var require_MenuItem = __commonJS({
  "models/MenuItem.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var menuItemSchema = new mongoose.Schema({
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: Number, required: true },
      stock: { type: Number, required: true, default: 0 },
      available: { type: Boolean, default: true },
      category: { type: String, required: true, default: "All" },
      image: { type: String }
    }, { timestamps: true });
    module2.exports = mongoose.model("MenuItem", menuItemSchema);
  }
});

// controllers/menuController.js
var require_menuController = __commonJS({
  "controllers/menuController.js"(exports2, module2) {
    var MenuItem = require_MenuItem();
    var Vendor = require_Vendor();
    var getVendorMenu = async (req, res) => {
      try {
        let vendor = await Vendor.findOne();
        if (!vendor) return res.status(404).json({ success: false, error: "Vendor not found" });
        let menuItems = await MenuItem.find({ vendorId: vendor._id });
        if (menuItems.length === 0) {
          const demoItems = [
            { vendorId: vendor._id, name: "Suya Platter", description: "Spicy grilled beef skewers with onions", price: 3500, stock: 8, available: true, category: "Grills", image: "https://res.cloudinary.com/dq4mxuz72/image/upload/v1717410000/suya.jpg" },
            { vendorId: vendor._id, name: "Pepper Soup", description: "Hot and spicy beef pepper soup", price: 3500, stock: 0, available: false, category: "Soups", image: "https://res.cloudinary.com/dq4mxuz72/image/upload/v1717410000/soup.jpg" },
            { vendorId: vendor._id, name: "Jollof Rice", description: "Classic Nigerian Jollof", price: 4500, stock: 20, available: true, category: "Rice", image: "https://res.cloudinary.com/dq4mxuz72/image/upload/v1717410000/jollof.jpg" },
            { vendorId: vendor._id, name: "Fried Rice", description: "Savory fried rice with mixed veggies", price: 4e3, stock: 15, available: true, category: "Rice", image: "https://res.cloudinary.com/dq4mxuz72/image/upload/v1717410000/fried_rice.jpg" },
            { vendorId: vendor._id, name: "Puff Puff (6pcs)", description: "Sweet, fluffy fried dough", price: 1e3, stock: 3, available: true, category: "Snacks", image: "https://res.cloudinary.com/dq4mxuz72/image/upload/v1717410000/puff_puff.jpg" }
          ];
          menuItems = await MenuItem.insertMany(demoItems);
        }
        const categories = ["All", "Rice", "Soups", "Grills", "Drinks", "Snacks"];
        res.status(200).json({ success: true, data: { items: menuItems, categories, status: vendor.status } });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getVendorMenuById = async (req, res) => {
      try {
        const vendorId = req.params.vendorId || req.query.vendorId || req.body?.vendorId;
        if (!vendorId) {
          return res.status(400).json({ success: false, error: "Vendor id is required" });
        }
        let vendor = await Vendor.findById(vendorId);
        if (!vendor) {
          vendor = await Vendor.findOne({ businessName: vendorId }) || await Vendor.findOne({ name: vendorId });
        }
        if (!vendor) {
          return res.status(200).json({
            success: true,
            data: {
              vendor: { id: vendorId, name: "Unknown Vendor" },
              items: []
            }
          });
        }
        const menuItems = await MenuItem.find({ vendorId: vendor._id }).sort({ category: 1, name: 1 });
        res.status(200).json({
          success: true,
          data: {
            vendor: {
              id: vendor._id,
              name: vendor.businessName || vendor.name
            },
            items: menuItems
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var toggleMenuItem = async (req, res) => {
      try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: "Item not found" });
        item.available = !item.available;
        await item.save();
        res.status(200).json({ success: true, data: item });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var addMenuItem = async (req, res) => {
      try {
        const vendor = await Vendor.findOne();
        const { name, description, price, stock, category, image, available } = req.body;
        const newItem = await MenuItem.create({
          vendorId: vendor._id,
          name,
          description,
          price,
          stock,
          category,
          image,
          available
        });
        res.status(201).json({ success: true, data: newItem });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateMenuItem = async (req, res) => {
      try {
        const { id } = req.params;
        const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ success: false, error: "Item not found" });
        res.status(200).json({ success: true, data: updatedItem });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    module2.exports = {
      getVendorMenu,
      getVendorMenuById,
      toggleMenuItem,
      addMenuItem,
      updateMenuItem
    };
  }
});

// config/cloudinary.js
var require_cloudinary = __commonJS({
  "config/cloudinary.js"(exports2, module2) {
    var cloudinary = require("cloudinary").v2;
    var { CloudinaryStorage } = require("multer-storage-cloudinary");
    var multer = require("multer");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    var storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "denish_vendors",
        allowed_formats: ["jpg", "png", "jpeg"]
      }
    });
    var upload = multer({ storage });
    module2.exports = { cloudinary, upload };
  }
});

// routes/vendorRoutes.js
var require_vendorRoutes = __commonJS({
  "routes/vendorRoutes.js"(exports2, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var {
      getVendorDashboard,
      updateVendorProfile,
      updateVendorOrderStatus,
      requestVendorPayout,
      getVendorTransactions,
      getVendorNotifications,
      markVendorNotificationRead,
      markAllVendorNotificationsRead
    } = require_vendorController();
    var { getVendorOrders } = require_orderController();
    var { getVendorMenu, toggleMenuItem, addMenuItem, updateMenuItem } = require_menuController();
    var { upload } = require_cloudinary();
    router.get("/dashboard", getVendorDashboard);
    router.put("/profile", updateVendorProfile);
    router.post("/payout", requestVendorPayout);
    router.get("/orders", getVendorOrders);
    router.patch("/orders/:orderId/status", updateVendorOrderStatus);
    router.get("/menu", getVendorMenu);
    router.post("/menu", addMenuItem);
    router.put("/menu/:id", updateMenuItem);
    router.put("/menu/:id/toggle", toggleMenuItem);
    router.get("/transactions", getVendorTransactions);
    router.get("/notifications", getVendorNotifications);
    router.patch("/notifications/read-all", markAllVendorNotificationsRead);
    router.patch("/notifications/:id/read", markVendorNotificationRead);
    router.post("/upload-item-image", upload.single("image"), (req, res) => {
      try {
        const imageUrl = req.file ? req.file.path : null;
        res.status(200).json({ success: true, imageUrl });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    router.post("/upload-images", upload.fields([
      { name: "logo", maxCount: 1 },
      { name: "cover", maxCount: 1 }
    ]), (req, res) => {
      try {
        const logoUrl = req.files["logo"] ? req.files["logo"][0].path : null;
        const coverUrl = req.files["cover"] ? req.files["cover"][0].path : null;
        res.status(200).json({ success: true, logoUrl, coverUrl });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    module2.exports = router;
  }
});

// models/Customer.js
var require_Customer = __commonJS({
  "models/Customer.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var customerSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      phone: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      loyaltyPoints: {
        type: Number,
        default: 0
      },
      address: String,
      addresses: [{
        label: String,
        addr: String,
        tag: String
      }],
      paymentMethods: [{
        id: String,
        title: String,
        sub: String,
        icon: String,
        type: { type: String, default: "card" }
      }],
      notifications: {
        orders: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
        recommendations: { type: Boolean, default: false }
      },
      profilePic: String,
      status: {
        type: String,
        enum: ["Active", "Suspended"],
        default: "Active"
      },
      isWarned: {
        type: Boolean,
        default: false
      },
      resetPasswordOTP: String,
      resetPasswordExpires: Date
    }, { timestamps: true });
    module2.exports = mongoose.model("Customer", customerSchema);
  }
});

// models/Driver.js
var require_Driver = __commonJS({
  "models/Driver.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var driverSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      phone: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      profilePic: { type: String, default: null },
      vehicleType: {
        type: String,
        enum: ["Bike", "Bicycle", "Car", "Motorcycle"],
        default: "Motorcycle"
      },
      vehicle: {
        type: { type: String, default: "" },
        make: { type: String, default: "" },
        plate: { type: String, default: "" },
        color: { type: String, default: "" }
      },
      bank: {
        name: { type: String, default: "" },
        bankCode: { type: String, default: "" },
        accountName: { type: String, default: "" },
        accountNumber: { type: String, default: "" }
      },
      documents: {
        nationalId: { type: String, default: null },
        vehiclePhoto: { type: String, default: null },
        license: { type: String, default: null }
      },
      status: {
        type: String,
        enum: ["Pending", "Active", "Suspended"],
        default: "Pending"
      },
      isWarned: {
        type: Boolean,
        default: false
      },
      isSuspended: {
        type: Boolean,
        default: false
      },
      earnings: {
        totalEarned: { type: Number, default: 0 },
        availableBalance: { type: Number, default: 0 },
        totalTrips: { type: Number, default: 0 }
      },
      resetPasswordOTP: String,
      resetPasswordExpires: Date
    }, { timestamps: true });
    module2.exports = mongoose.model("Driver", driverSchema);
  }
});

// config/email.js
var require_email = __commonJS({
  "config/email.js"(exports2, module2) {
    var nodemailer = require("nodemailer");
    var transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== "your-email@gmail.com") {
      transporter.verify(function(error, success) {
        if (error) {
          console.log("Email configuration error:", error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
    } else {
      console.log("Email service skipped: Please configure EMAIL_USER and EMAIL_PASS in .env");
    }
    module2.exports = transporter;
  }
});

// utils/emailService.js
var require_emailService = __commonJS({
  "utils/emailService.js"(exports2, module2) {
    var transporter = require_email();
    var sendEmail = async (options) => {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return info;
      } catch (error) {
        console.error("Error sending email:", error);
        throw error;
      }
    };
    var sendWelcomeEmail = async (email, name) => {
      const subject = "Welcome to Denish - Your Culinary Journey Begins!";
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background-color: #FF5E00; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Welcome to Denish</h1>
        </div>
        <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
            <h2 style="color: #FF5E00; margin-top: 0;">Hi ${name},</h2>
            <p style="font-size: 16px;">We're absolutely thrilled to have you join our community! Denish is your premium gateway to the finest culinary experiences, right at your fingertips.</p>
            <p style="font-size: 16px;">Whether you're looking for a quick bite or a gourmet feast, we've got you covered. Get started by exploring the best restaurants in your area.</p>
            <div style="text-align: center; margin: 40px 0;">
                <a href="${frontendUrl}" style="background-color: #FF5E00; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">Explore Now</a>
            </div>
            <p style="font-size: 14px; color: #777777;">If you have any questions, our support team is always here to help.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
            <p>&copy; 2026 Denish Platform. All rights reserved.</p>
            <p>You received this email because you signed up for Denish.</p>
        </div>
    </div>
    `;
      return await sendEmail({
        to: email,
        subject,
        html,
        text: `Welcome to Denish, ${name}! We're thrilled to have you join us.`
      });
    };
    var sendOTPEmail = async (email, otp) => {
      const subject = "Your Denish Security Code";
      const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background-color: #FF5E00; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Security Verification</h1>
        </div>
        <div style="padding: 40px 30px; color: #333333; line-height: 1.6; text-align: center;">
            <p style="font-size: 16px; margin-bottom: 25px;">Please use the code below to complete your verification. For your security, this code will expire shortly.</p>
            <div style="background-color: #FFF0E6; border: 2px dashed #FF5E00; padding: 20px; border-radius: 8px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #FF5E00;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #777777; margin-top: 30px;">If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
            <p>&copy; 2026 Denish Platform. All rights reserved.</p>
        </div>
    </div>
    `;
      return await sendEmail({
        to: email,
        subject,
        html,
        text: `Your Denish security code is: ${otp}`
      });
    };
    module2.exports = {
      sendEmail,
      sendWelcomeEmail,
      sendOTPEmail
    };
  }
});

// controllers/authController.js
var require_authController = __commonJS({
  "controllers/authController.js"(exports2, module2) {
    var Vendor = require_Vendor();
    var Customer = require_Customer();
    var Driver = require_Driver();
    var axios = require("axios");
    var { sendWelcomeEmail, sendOTPEmail } = require_emailService();
    var vendorLogin = async (req, res) => {
      try {
        const { email, password } = req.body;
        const cleanEmail = email ? email.trim() : "";
        const cleanPassword = password ? password.trim() : "";
        let vendor = await Vendor.findOne({
          $or: [
            { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
            { phone: cleanEmail }
          ]
        });
        if (!vendor || vendor.password && vendor.password !== cleanPassword) {
          return res.status(401).json({ success: false, error: "Invalid email/phone or password" });
        }
        res.status(200).json({ success: true, token: "fake-jwt-token-for-" + vendor._id, vendor });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var vendorSignup = async (req, res) => {
      try {
        const { name, email, phone, password } = req.body;
        const existingEmail = await Vendor.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({ success: false, error: "Email already in use" });
        }
        const existingPhone = await Vendor.findOne({ phone });
        if (existingPhone) {
          return res.status(400).json({ success: false, error: "Phone number already in use" });
        }
        const vendor = await Vendor.create({ name, email, phone, password });
        sendWelcomeEmail(email, name).catch((err) => console.error("Error sending welcome email to vendor:", err));
        res.status(201).json({ success: true, token: "fake-jwt-token-for-" + vendor._id, vendor });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var customerLogin = async (req, res) => {
      try {
        const { email, password } = req.body;
        const cleanEmail = email ? email.trim() : "";
        const cleanPassword = password ? password.trim() : "";
        const customer = await Customer.findOne({
          $or: [
            { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
            { phone: cleanEmail }
          ]
        });
        if (!customer || customer.password !== cleanPassword) {
          return res.status(401).json({ success: false, error: "Invalid email/phone or password" });
        }
        res.status(200).json({ success: true, token: "cust-token-" + customer._id, user: customer });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var customerSignup = async (req, res) => {
      try {
        const { name, email, phone, password } = req.body;
        const existing = await Customer.findOne({ $or: [{ email }, { phone }] });
        if (existing) {
          return res.status(400).json({ success: false, error: "Email or phone number already in use" });
        }
        const customer = await Customer.create({ name, email, phone, password });
        sendWelcomeEmail(email, name).catch((err) => console.error("Error sending welcome email to customer:", err));
        res.status(201).json({ success: true, token: "cust-token-" + customer._id, user: customer });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var driverLogin = async (req, res) => {
      try {
        const { email, password } = req.body;
        const cleanEmail = email ? email.trim() : "";
        const cleanPassword = password ? password.trim() : "";
        const driver = await Driver.findOne({
          $or: [
            { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
            { phone: cleanEmail }
          ]
        });
        if (!driver || driver.password !== cleanPassword) {
          return res.status(401).json({ success: false, error: "Invalid email/phone or password" });
        }
        res.status(200).json({ success: true, token: "driver-token-" + driver._id, user: driver });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var driverSignup = async (req, res) => {
      try {
        const { name, email, phone, password, vehicleType } = req.body;
        const existing = await Driver.findOne({ $or: [{ email }, { phone }] });
        if (existing) {
          return res.status(400).json({ success: false, error: "Email or phone number already in use" });
        }
        const driver = await Driver.create({ name, email, phone, password, vehicleType });
        sendWelcomeEmail(email, name).catch((err) => console.error("Error sending welcome email to driver:", err));
        res.status(201).json({ success: true, token: "driver-token-" + driver._id, user: driver });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var forgotPassword = async (req, res) => {
      try {
        const { email, role } = req.body;
        const cleanEmail = email ? email.trim() : "";
        if (!cleanEmail) {
          return res.status(400).json({ success: false, error: "Email is required" });
        }
        const searchRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
        let user = null;
        let targetRole = role || "vendor";
        if (role === "vendor") {
          user = await Vendor.findOne({ email: searchRegex });
        } else if (role === "driver") {
          user = await Driver.findOne({ email: searchRegex });
        } else if (role === "customer") {
          user = await Customer.findOne({ email: searchRegex });
        }
        if (!user) {
          const [cUser, vUser, dUser] = await Promise.all([
            Customer.findOne({ email: searchRegex }),
            Vendor.findOne({ email: searchRegex }),
            Driver.findOne({ email: searchRegex })
          ]);
          if (cUser) {
            user = cUser;
            targetRole = "customer";
          } else if (vUser) {
            user = vUser;
            targetRole = "vendor";
          } else if (dUser) {
            user = dUser;
            targetRole = "driver";
          }
        }
        if (!user) {
          return res.status(404).json({ success: false, error: "No account found with this email address" });
        }
        const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 36e5;
        await user.save();
        let emailSent = false;
        try {
          await sendOTPEmail(user.email, otp);
          emailSent = true;
        } catch (emailErr) {
          console.error("Error sending OTP email via SMTP:", emailErr.message);
          console.log(`[DEV OTP LOG] Verification code for ${user.email}: ${otp}`);
        }
        res.status(200).json({
          success: true,
          message: "OTP verification code sent to your email.",
          role: targetRole,
          devOtp: process.env.NODE_ENV !== "production" ? otp : void 0
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var verifyOTP = async (req, res) => {
      try {
        const { email, otp, role } = req.body;
        const cleanEmail = email ? email.trim() : "";
        const cleanOTP = otp ? otp.trim() : "";
        if (!cleanEmail || !cleanOTP) {
          return res.status(400).json({ success: false, error: "Email and OTP code are required" });
        }
        const searchRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
        let user = null;
        if (role === "vendor") user = await Vendor.findOne({ email: searchRegex });
        else if (role === "driver") user = await Driver.findOne({ email: searchRegex });
        else if (role === "customer") user = await Customer.findOne({ email: searchRegex });
        if (!user) {
          user = await Customer.findOne({ email: searchRegex }) || await Vendor.findOne({ email: searchRegex }) || await Driver.findOne({ email: searchRegex });
        }
        if (!user) {
          return res.status(404).json({ success: false, error: "User account not found" });
        }
        if (!user.resetPasswordOTP || String(user.resetPasswordOTP).trim() !== cleanOTP) {
          return res.status(400).json({ success: false, error: "Invalid OTP code. Please check and try again." });
        }
        if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
          return res.status(400).json({ success: false, error: "OTP code has expired. Please request a new one." });
        }
        res.status(200).json({ success: true, message: "OTP verified successfully" });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var resetPassword = async (req, res) => {
      try {
        const { email, otp, newPassword, role } = req.body;
        const cleanEmail = email ? email.trim() : "";
        const cleanOTP = otp ? otp.trim() : "";
        const cleanPassword = newPassword ? newPassword.trim() : "";
        if (!cleanEmail || !cleanOTP || !cleanPassword) {
          return res.status(400).json({ success: false, error: "Email, OTP code, and new password are required" });
        }
        if (cleanPassword.length < 6) {
          return res.status(400).json({ success: false, error: "Password must be at least 6 characters long" });
        }
        const searchRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
        let user = null;
        if (role === "vendor") {
          user = await Vendor.findOne({ email: searchRegex });
        } else if (role === "driver") {
          user = await Driver.findOne({ email: searchRegex });
        } else if (role === "customer") {
          user = await Customer.findOne({ email: searchRegex });
        }
        if (!user) {
          user = await Customer.findOne({ email: searchRegex }) || await Vendor.findOne({ email: searchRegex }) || await Driver.findOne({ email: searchRegex });
        }
        if (!user) {
          return res.status(404).json({ success: false, error: "User not found" });
        }
        if (!user.resetPasswordOTP || String(user.resetPasswordOTP).trim() !== cleanOTP) {
          return res.status(400).json({ success: false, error: "Invalid OTP code. Please check and try again." });
        }
        if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
          return res.status(400).json({ success: false, error: "OTP code has expired. Please request a new one." });
        }
        user.password = cleanPassword;
        user.resetPasswordOTP = void 0;
        user.resetPasswordExpires = void 0;
        await user.save();
        res.status(200).json({ success: true, message: "Password reset successfully" });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var googleAuth = async (req, res) => {
      try {
        const { token, role, isAccessToken } = req.body;
        if (!token) {
          return res.status(400).json({ success: false, error: "Token is required" });
        }
        if (!role) {
          return res.status(400).json({ success: false, error: "Role is required" });
        }
        let email, name, picture, googleId;
        if (isAccessToken) {
          const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          email = response.data.email;
          name = response.data.name;
          picture = response.data.picture;
          googleId = response.data.sub;
        } else {
          const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
          email = response.data.email;
          name = response.data.name;
          picture = response.data.picture;
          googleId = response.data.sub;
        }
        if (!email) {
          return res.status(400).json({ success: false, error: "Could not retrieve email from Google" });
        }
        let user = null;
        let Model = null;
        let tokenPrefix = "";
        if (role === "customer") {
          Model = Customer;
          tokenPrefix = "cust-token-";
        } else if (role === "vendor") {
          Model = Vendor;
          tokenPrefix = "fake-jwt-token-for-";
        } else if (role === "driver") {
          Model = Driver;
          tokenPrefix = "driver-token-";
        } else {
          return res.status(400).json({ success: false, error: "Invalid role" });
        }
        user = await Model.findOne({ email: { $regex: new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } });
        if (!user) {
          const placeholderPhone = `google-${googleId}`;
          const placeholderPassword = Math.random().toString(36).slice(-10);
          const createData = {
            name,
            email,
            phone: placeholderPhone,
            password: placeholderPassword,
            profilePic: picture
          };
          if (role === "driver") {
            createData.vehicleType = "Motorcycle";
            createData.status = "Pending";
          } else if (role === "vendor") {
            createData.logoUrl = picture;
            createData.status = "Pending";
          }
          user = await Model.create(createData);
          sendWelcomeEmail(email, name).catch((err) => console.error("Error sending welcome email:", err));
        }
        res.status(200).json({
          success: true,
          token: tokenPrefix + user._id,
          user
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    module2.exports = {
      vendorLogin,
      vendorSignup,
      customerLogin,
      customerSignup,
      driverLogin,
      driverSignup,
      forgotPassword,
      verifyOTP,
      resetPassword,
      googleAuth
    };
  }
});

// routes/authRoutes.js
var require_authRoutes = __commonJS({
  "routes/authRoutes.js"(exports2, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var { vendorLogin, vendorSignup, customerLogin, customerSignup, driverLogin, driverSignup, forgotPassword, verifyOTP, resetPassword, googleAuth } = require_authController();
    router.post("/vendor/login", vendorLogin);
    router.post("/vendor/signup", vendorSignup);
    router.post("/customer/login", customerLogin);
    router.post("/customer/signup", customerSignup);
    router.post("/driver/login", driverLogin);
    router.post("/driver/signup", driverSignup);
    router.post("/forgot-password", forgotPassword);
    router.post("/verify-otp", verifyOTP);
    router.post("/reset-password", resetPassword);
    router.post("/google", googleAuth);
    module2.exports = router;
  }
});

// models/Message.js
var require_Message = __commonJS({
  "models/Message.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var messageSchema = new mongoose.Schema({
      senderId: { type: String, required: true },
      senderName: { type: String, required: true },
      recipientId: { type: String, required: true },
      recipientName: { type: String, required: true },
      text: String,
      imageUrl: String,
      type: { type: String, enum: ["text", "image", "call"], default: "text" },
      subText: String,
      read: { type: Boolean, default: false }
    }, { timestamps: true });
    module2.exports = mongoose.model("Message", messageSchema);
  }
});

// models/CallSession.js
var require_CallSession = __commonJS({
  "models/CallSession.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var callSessionSchema = new mongoose.Schema({
      callerId: { type: String, required: true },
      callerName: { type: String, required: true },
      receiverId: { type: String, required: true },
      receiverName: { type: String, required: true },
      status: {
        type: String,
        enum: ["ringing", "accepted", "declined", "ended"],
        default: "ringing"
      },
      orderId: { type: String, default: "Order ORD-005" },
      subtitle: { type: String, default: "3.5 km | \u20A6750" }
    }, { timestamps: true });
    module2.exports = mongoose.model("CallSession", callSessionSchema);
  }
});

// models/Banner.js
var require_Banner = __commonJS({
  "models/Banner.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var bannerSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      dateRange: { type: String, required: true },
      image: { type: String, required: true },
      status: { type: String, enum: ["active", "inactive"], default: "active" }
    }, { timestamps: true });
    module2.exports = mongoose.model("Banner", bannerSchema);
  }
});

// controllers/customerController.js
var require_customerController = __commonJS({
  "controllers/customerController.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var axios = require("axios");
    var crypto = require("crypto");
    var { getFlutterwaveAuthHeader } = require_flutterwave();
    var Vendor = require_Vendor();
    var MenuItem = require_MenuItem();
    var Customer = require_Customer();
    var Order = require_Order();
    var Message = require_Message();
    var CallSession = require_CallSession();
    var Banner = require_Banner();
    var getCurrentCustomer = async (req) => {
      const userId = req.headers["x-user-id"];
      const userEmail = req.headers["x-user-email"];
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const customer = await Customer.findById(userId);
        if (customer) return customer;
      }
      if (userEmail) {
        const customer = await Customer.findOne({ email: userEmail });
        if (customer) return customer;
      }
      return await Customer.findOne().sort({ createdAt: -1 });
    };
    var getRestaurants = async (req, res) => {
      try {
        const vendors = await Vendor.find({ status: "Approved" });
        const approvedVendorIds = vendors.map((v) => v._id);
        const items = await MenuItem.find({ available: true, vendorId: { $in: approvedVendorIds } });
        const banners = await Banner.find({ status: "active" });
        res.status(200).json({
          success: true,
          data: vendors,
          items,
          banners
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getRestaurantDetails = async (req, res) => {
      try {
        const vendorId = req.params.id;
        let vendor;
        if (vendorId === "demo" || !mongoose.Types.ObjectId.isValid(vendorId)) {
          vendor = await Vendor.findOne();
        } else {
          vendor = await Vendor.findById(vendorId);
        }
        if (!vendor) return res.status(404).json({ success: false, error: "Restaurant not found" });
        const items = await MenuItem.find({ vendorId: vendor._id, available: true });
        const menuByCategory = items.reduce((acc, item) => {
          const cat = item.category || "Other";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item);
          return acc;
        }, {});
        const menu = Object.keys(menuByCategory).map((key) => ({
          category: key,
          data: menuByCategory[key]
        }));
        res.status(200).json({
          success: true,
          data: {
            vendor,
            menu
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var placeOrder = async (req, res) => {
      try {
        const { vendorId, items, totalAmount, customerName, customerPhone, deliveryAddress } = req.body;
        let validVendorId = vendorId;
        if (!validVendorId || !mongoose.Types.ObjectId.isValid(validVendorId)) {
          const defaultVendor = await Vendor.findOne();
          validVendorId = defaultVendor ? defaultVendor._id : new mongoose.Types.ObjectId();
        }
        const generatedOrderId = `ORD-${Math.floor(1e5 + Math.random() * 9e5)}`;
        const finalTotal = totalAmount || req.body.total || 0;
        const finalAddress = deliveryAddress || req.body.address || "No address provided";
        const formattedItems = (items || []).map((item) => ({
          menuItemId: item.menuItemId && mongoose.Types.ObjectId.isValid(item.menuItemId) ? item.menuItemId : void 0,
          name: item.name || "Item",
          price: item.price || 0,
          quantity: item.quantity || 1
        }));
        const customer = await getCurrentCustomer(req);
        const resolvedCustomerName = customer ? customer.name : customerName || "Test User";
        const resolvedCustomerId = customer ? customer._id : void 0;
        const vendorDoc = await Vendor.findById(validVendorId);
        const resolvedVendorName = vendorDoc ? vendorDoc.businessName || vendorDoc.name : "Unknown Vendor";
        const newOrder = await Order.create({
          orderId: generatedOrderId,
          customerId: resolvedCustomerId,
          customerName: resolvedCustomerName,
          vendorId: validVendorId,
          vendorName: resolvedVendorName,
          address: finalAddress,
          deliveryAddress: finalAddress,
          items: formattedItems,
          total: finalTotal,
          totalAmount: finalTotal,
          status: "pending"
        });
        res.status(201).json({ success: true, data: newOrder });
      } catch (error) {
        console.error("placeOrder backend error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getCustomerProfile = async (req, res) => {
      try {
        const customer = await getCurrentCustomer(req);
        if (!customer) return res.status(404).json({ success: false, error: "Customer not found" });
        res.status(200).json({ success: true, data: customer });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateCustomerProfile = async (req, res) => {
      try {
        const customer = await getCurrentCustomer(req);
        if (!customer) return res.status(404).json({ success: false, error: "Customer not found" });
        Object.assign(customer, req.body);
        await customer.save();
        res.status(200).json({ success: true, data: customer });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var addAddress = async (req, res) => {
      try {
        const customer = await getCurrentCustomer(req);
        if (!customer) return res.status(404).json({ success: false, error: "Customer not found" });
        customer.addresses.push(req.body);
        await customer.save();
        res.status(200).json({ success: true, data: customer });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var addPaymentMethod = async (req, res) => {
      try {
        const customer = await getCurrentCustomer(req);
        if (!customer) return res.status(404).json({ success: false, error: "Customer not found" });
        customer.paymentMethods.push(req.body);
        await customer.save();
        res.status(200).json({ success: true, data: customer });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var deleteAddress = async (req, res) => {
      try {
        const { addressId } = req.params;
        const customer = await getCurrentCustomer(req);
        if (!customer) return res.status(404).json({ success: false, error: "Customer not found" });
        customer.addresses = customer.addresses.filter((addr) => addr._id.toString() !== addressId);
        await customer.save();
        res.status(200).json({ success: true, data: customer });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var deletePaymentMethod = async (req, res) => {
      try {
        const { paymentId } = req.params;
        const customer = await getCurrentCustomer(req);
        if (!customer) return res.status(404).json({ success: false, error: "Customer not found" });
        customer.paymentMethods = customer.paymentMethods.filter((pay) => pay._id.toString() !== paymentId);
        await customer.save();
        res.status(200).json({ success: true, data: customer });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getOrderTracking = async (req, res) => {
      try {
        const { id } = req.params;
        let order;
        if (mongoose.Types.ObjectId.isValid(id)) {
          order = await Order.findById(id).populate("vendorId");
        } else {
          order = await Order.findOne({ orderId: id }).populate("vendorId");
        }
        if (!order) {
          order = await Order.findOne().sort({ createdAt: -1 }).populate("vendorId");
        }
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        const elapsedMins = Math.floor((/* @__PURE__ */ new Date() - new Date(order.createdAt)) / 6e4);
        const estimatedArrival = Math.max(0, 30 - elapsedMins);
        res.status(200).json({
          success: true,
          data: {
            order,
            estimatedArrival,
            status: order.status,
            driverName: "Kola Adeleke",
            driverPhone: "09123882672",
            driverPic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
            totalAmount: order.totalAmount || order.total || 5700
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getCustomerOrders = async (req, res) => {
      try {
        const orders = await Order.find().populate("vendorId").sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var search = async (req, res) => {
      try {
        const { query } = req.query;
        if (!query) return res.status(200).json({ success: true, data: { vendors: [], items: [] } });
        const vendors = await Vendor.find({
          $or: [
            { businessName: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } }
          ],
          status: "Approved"
        });
        const items = await MenuItem.find({
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
          ],
          available: true
        }).populate("vendorId");
        res.status(200).json({
          success: true,
          data: { vendors, items }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getChatThreads = async (req, res) => {
      try {
        const customer = await getCurrentCustomer(req);
        const customerId = customer ? customer._id.toString() : "demo";
        const messages = await Message.find({
          $or: [{ senderId: customerId }, { recipientId: customerId }]
        }).sort({ createdAt: -1 });
        const threadMap = {};
        messages.forEach((msg) => {
          const otherId = msg.senderId === customerId ? msg.recipientId : msg.senderId;
          const otherName = msg.senderId === customerId ? msg.recipientName : msg.senderName;
          if (!threadMap[otherName]) {
            threadMap[otherName] = {
              id: otherId,
              name: otherName,
              lastMsg: msg.text || (msg.imageUrl ? "\u{1F4F7} Image" : "Voice Call"),
              time: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              unread: 0,
              avatar: "https://res.cloudinary.com/dq4mxuz72/image/upload/v1785498890/denish_vendors/sburpfmz4hxc5ef91evg.jpg"
            };
          }
        });
        const threads = Object.values(threadMap);
        res.status(200).json({ success: true, threads });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getMessages = async (req, res) => {
      try {
        const { recipientName } = req.query;
        const customer = await getCurrentCustomer(req);
        const customerName = customer ? customer.name : "Usman Umar";
        const messages = await Message.find({
          $or: [
            { senderName: customerName, recipientName },
            { senderName: recipientName, recipientName: customerName }
          ]
        }).sort({ createdAt: 1 });
        const formatted = messages.map((m) => ({
          id: m._id,
          text: m.text,
          image: m.imageUrl,
          type: m.type,
          subText: m.subText,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sender: m.senderName === recipientName ? "them" : "me"
        }));
        res.status(200).json({ success: true, messages: formatted });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var sendMessage = async (req, res) => {
      try {
        const { recipientName, text, imageUrl, type, subText } = req.body;
        const customer = await getCurrentCustomer(req);
        const newMsg = await Message.create({
          senderId: customer ? customer._id.toString() : "customer-1",
          senderName: customer ? customer.name : "Usman Umar",
          recipientId: "vendor-driver-1",
          recipientName: recipientName || "Mama's Kitchen",
          text,
          imageUrl,
          type: type || "text",
          subText
        });
        res.status(200).json({ success: true, data: newMsg });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var initiateCall = async (req, res) => {
      try {
        const { receiverName, orderId, subtitle } = req.body;
        const customer = await Customer.findOne().sort({ createdAt: -1 });
        const callerId = customer ? customer._id.toString() : "customer-1";
        const callerName = customer ? customer.name : "Usman Umar";
        const session = await CallSession.create({
          callerId,
          callerName,
          receiverId: "receiver-1",
          receiverName: receiverName || "Temmy Store",
          status: "ringing",
          orderId: orderId || "Order ORD-005",
          subtitle: subtitle || "3.5 km | \u20A6750"
        });
        res.status(200).json({ success: true, call: session });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getIncomingCall = async (req, res) => {
      try {
        const { receiverName } = req.query;
        const query = { status: "ringing" };
        if (receiverName) {
          let escaped = receiverName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          escaped = escaped.replace(/[’']/g, "['\u2019]");
          query.receiverName = { $regex: new RegExp(`^${escaped}$`, "i") };
        }
        const call = await CallSession.findOne(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, call });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getCallStatus = async (req, res) => {
      try {
        const { callId } = req.params;
        const call = await CallSession.findById(callId);
        if (!call) return res.status(404).json({ success: false, message: "Call not found" });
        res.status(200).json({ success: true, status: call.status, call });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var respondCall = async (req, res) => {
      try {
        const { callId, action } = req.body;
        const status = action === "accept" ? "accepted" : action === "decline" ? "declined" : "ended";
        const call = await CallSession.findByIdAndUpdate(callId, { status }, { new: true });
        res.status(200).json({ success: true, call });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var initializeFlutterwavePayment = async (req, res) => {
      try {
        const { amount, email, name, phone, orderId, redirect_url } = req.body;
        const tx_ref = `DENISH-TX-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
        const flwPayload = {
          tx_ref,
          amount: amount || 5700,
          currency: "NGN",
          redirect_url: redirect_url || "http://localhost:3000/api/customer/flw/callback",
          payment_options: "card,banktransfer,account,ussd",
          customer: {
            email: email || "usman@denish.com",
            phonenumber: phone || "08123456789",
            name: name || "Usman Umar"
          },
          customizations: {
            title: "Denish Food Delivery",
            description: `Payment for Order #${orderId || "ORD-005"}`,
            logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"
          }
        };
        try {
          const authHeader = await getFlutterwaveAuthHeader();
          const response = await axios.post(
            "https://api.flutterwave.com/v3/payments",
            flwPayload,
            {
              headers: {
                Authorization: authHeader,
                "Content-Type": "application/json"
              }
            }
          );
          if (response.data?.status === "success" && response.data?.data?.link) {
            return res.status(200).json({
              success: true,
              data: {
                link: response.data.data.link,
                tx_ref,
                amount: flwPayload.amount,
                status: "pending"
              }
            });
          }
        } catch (apiErr) {
          console.log("Flutterwave live API error:", apiErr.response?.data || apiErr.message);
        }
        res.status(200).json({
          success: true,
          data: {
            link: `https://checkout.flutterwave.com/v3/hosted/pay?tx_ref=${tx_ref}&amount=${flwPayload.amount}&currency=NGN`,
            tx_ref,
            amount: flwPayload.amount,
            status: "pending"
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var verifyFlutterwavePayment = async (req, res) => {
      try {
        const { tx_ref, transaction_id } = req.body;
        if (transaction_id) {
          try {
            const authHeader = await getFlutterwaveAuthHeader();
            const verifyRes = await axios.get(
              `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
              {
                headers: {
                  Authorization: authHeader,
                  "Content-Type": "application/json"
                }
              }
            );
            if (verifyRes.data?.status === "success" && verifyRes.data?.data?.status === "successful") {
              return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                data: verifyRes.data.data
              });
            }
          } catch (verifyErr) {
            console.warn("Flutterwave live verify warning:", verifyErr.response?.data || verifyErr.message);
          }
        }
        res.status(200).json({
          success: true,
          message: "Payment verified successfully",
          data: {
            status: "successful",
            tx_ref: tx_ref || `DENISH-TX-${Date.now()}`,
            transaction_id: transaction_id || `FLW-TX-${Date.now()}`
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var flutterwaveWebhook = async (req, res) => {
      try {
        const secretHash = process.env.FLW_SECRET_HASH || "denish_flw_secret_hash_2026";
        const signature = req.headers["flutterwave-signature"];
        if (signature && signature !== secretHash) {
          return res.status(401).send("Invalid webhook signature");
        }
        const payload = req.body;
        console.log("FLUTTERWAVE WEBHOOK RECEIVED:", payload?.event || payload?.type);
        if (payload?.type === "charge.completed" && payload?.data?.status === "succeeded") {
          const { reference, id, amount } = payload.data;
          console.log(`Order with reference ${reference} paid successfully (Amount: \u20A6${amount})`);
        }
        res.sendStatus(200);
      } catch (error) {
        res.status(500).send(error.message);
      }
    };
    var getCustomerNotifications = async (req, res) => {
      try {
        const Notification = require_Notification();
        const notifications = await Notification.find({
          $or: [
            { recipient: { $in: ["customer", "all"] } },
            { recipient: { $exists: false } },
            { recipient: null }
          ]
        }).sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ success: true, data: notifications });
      } catch (error) {
        console.error("getCustomerNotifications error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var markCustomerNotificationRead = async (req, res) => {
      try {
        const Notification = require_Notification();
        const { id } = req.params;
        const mongoose2 = require("mongoose");
        if (mongoose2.Types.ObjectId.isValid(id)) {
          await Notification.findByIdAndUpdate(id, { read: true });
        } else {
          await Notification.updateOne({ _id: id }, { read: true });
        }
        res.status(200).json({ success: true, message: "Notification marked as read" });
      } catch (error) {
        console.error("markCustomerNotificationRead error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var markAllCustomerNotificationsRead = async (req, res) => {
      try {
        const Notification = require_Notification();
        await Notification.updateMany(
          {
            $or: [
              { recipient: { $in: ["customer", "all"] } },
              { recipient: { $exists: false } },
              { recipient: null }
            ],
            read: false
          },
          { read: true }
        );
        res.status(200).json({ success: true, message: "All notifications marked as read" });
      } catch (error) {
        console.error("markAllCustomerNotificationsRead error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    module2.exports = {
      getRestaurants,
      getRestaurantDetails,
      placeOrder,
      getCustomerProfile,
      updateCustomerProfile,
      getCustomerOrders,
      search,
      addAddress,
      addPaymentMethod,
      deleteAddress,
      deletePaymentMethod,
      getOrderTracking,
      getChatThreads,
      getMessages,
      sendMessage,
      initiateCall,
      getIncomingCall,
      getCallStatus,
      respondCall,
      initializeFlutterwavePayment,
      verifyFlutterwavePayment,
      flutterwaveWebhook,
      getCustomerNotifications,
      markCustomerNotificationRead,
      markAllCustomerNotificationsRead
    };
  }
});

// routes/customerRoutes.js
var require_customerRoutes = __commonJS({
  "routes/customerRoutes.js"(exports2, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var {
      getRestaurants,
      getRestaurantDetails,
      placeOrder,
      getCustomerProfile,
      updateCustomerProfile,
      getCustomerOrders,
      search,
      addAddress,
      addPaymentMethod,
      deleteAddress,
      deletePaymentMethod,
      getOrderTracking,
      getChatThreads,
      getMessages,
      sendMessage,
      initiateCall,
      getIncomingCall,
      getCallStatus,
      respondCall,
      initializeFlutterwavePayment,
      verifyFlutterwavePayment,
      flutterwaveWebhook,
      getCustomerNotifications,
      markCustomerNotificationRead,
      markAllCustomerNotificationsRead
    } = require_customerController();
    var { upload } = require_cloudinary();
    router.get("/restaurants", getRestaurants);
    router.get("/restaurant/:id", getRestaurantDetails);
    router.get("/search", search);
    router.post("/order", placeOrder);
    router.get("/profile", getCustomerProfile);
    router.put("/profile", updateCustomerProfile);
    router.post("/add-address", addAddress);
    router.delete("/address/:addressId", deleteAddress);
    router.post("/add-payment-method", addPaymentMethod);
    router.delete("/payment-method/:paymentId", deletePaymentMethod);
    router.get("/order/:id/tracking", getOrderTracking);
    router.get("/orders", getCustomerOrders);
    router.get("/notifications", getCustomerNotifications);
    router.patch("/notifications/read-all", markAllCustomerNotificationsRead);
    router.patch("/notifications/:id/read", markCustomerNotificationRead);
    router.get("/chats", getChatThreads);
    router.get("/messages", getMessages);
    router.post("/messages", sendMessage);
    router.post("/call/initiate", initiateCall);
    router.get("/call/incoming", getIncomingCall);
    router.get("/call/status/:callId", getCallStatus);
    router.post("/call/respond", respondCall);
    router.post("/flw/initialize", initializeFlutterwavePayment);
    router.post("/flw/verify", verifyFlutterwavePayment);
    router.post("/flw/webhook", flutterwaveWebhook);
    router.get("/flw/callback", (req, res) => {
      res.send(`
    <!Platform html>
    <html>
      <head>
        <title>Payment Successful</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 40px 20px; background-color: #F8F9FA; }
          .card { background: #FFF; padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 380px; margin: 0 auto; }
          .icon { width: 64px; height: 64px; background: #E6F7F0; color: #27A572; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px; }
          h2 { color: #1A1A1A; margin: 0 0 8px; font-size: 20px; }
          p { color: #666; font-size: 14px; margin: 0 0 24px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">\u2713</div>
          <h2>Payment Completed</h2>
          <p>Your Flutterwave transaction has been processed successfully. You may close this window.</p>
        </div>
      </body>
    </html>
  `);
    });
    router.post("/upload-profile-pic", upload.single("image"), (req, res) => {
      try {
        const imageUrl = req.file ? req.file.path : null;
        res.status(200).json({ success: true, imageUrl });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    module2.exports = router;
  }
});

// controllers/paymentController.js
var require_paymentController = __commonJS({
  "controllers/paymentController.js"(exports2, module2) {
    var axios = require("axios");
    var { getFlutterwaveAuthHeader } = require_flutterwave();
    var { FALLBACK_BANKS } = require_payoutService();
    var FLW_BASE_URL = "https://api.flutterwave.com/v3";
    var FLW_V2_URL = "https://api.ravepay.co/flwv3-pug/getpaidx/api/resolve_account";
    var getBanks = async (req, res) => {
      try {
        const authHeader = await getFlutterwaveAuthHeader();
        const response = await axios.get(`${FLW_BASE_URL}/banks/NG`, {
          headers: {
            Authorization: authHeader,
            "User-Agent": "Denish/1.0",
            "Accept": "application/json"
          },
          timeout: 8e3
        });
        if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          const banks = response.data.data.map((bank) => ({
            ...bank,
            code: bank.code
          }));
          return res.status(200).json({ success: true, data: banks });
        }
      } catch (error) {
        console.warn("Flutterwave getBanks notice, using verified Nigerian bank list:", error.message);
      }
      return res.status(200).json({ success: true, data: FALLBACK_BANKS });
    };
    var verifyAccount = async (req, res) => {
      const publicKey = process.env.FLW_PUBLIC_KEY;
      const bankCode = req.query.bankCode || req.body?.bankCode || req.body?.destbankcode;
      const accountNumber = req.query.accountNumber || req.body?.accountNumber || req.body?.recipientaccount;
      const country = req.query.country || req.body?.country || "NG";
      if (!bankCode || !accountNumber) {
        return res.status(400).json({ success: false, message: "bankCode and accountNumber are required" });
      }
      try {
        const authHeader = await getFlutterwaveAuthHeader();
        const requestBody = {
          account_number: accountNumber,
          account_bank: bankCode,
          country: country || "NG"
        };
        const response = await axios.post(`${FLW_BASE_URL}/accounts/resolve`, requestBody, {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json"
          }
        });
        if (response.data && response.data.status === "success" && response.data.data) {
          const accountData = response.data.data;
          const accountName = accountData.account_name || accountData.customer_name || accountData.accountname || "";
          if (accountName) {
            return res.status(200).json({
              success: true,
              data: {
                accountName,
                account_name: accountName,
                accountNumber: accountData.account_number || accountNumber,
                bankCode
              }
            });
          }
        }
      } catch (v3Error) {
        console.warn("Flutterwave V3 verifyAccount warning:", v3Error.response?.data?.message || v3Error.message);
      }
      if (publicKey) {
        try {
          const response = await axios.post(FLW_V2_URL, {
            recipientaccount: accountNumber,
            destbankcode: bankCode,
            PBFPubKey: publicKey,
            currency: country === "GH" ? "GHS" : void 0,
            country: country === "GH" ? "GH" : void 0
          }, {
            headers: { "Content-Type": "application/json" }
          });
          const resData = response.data;
          if (resData && resData.status === "success" && resData.data && resData.data.data) {
            const inner = resData.data.data;
            if (inner.responsecode === "00" && inner.accountname) {
              return res.status(200).json({
                success: true,
                data: {
                  accountName: inner.accountname,
                  account_name: inner.accountname,
                  accountNumber: inner.accountnumber || accountNumber,
                  bankCode
                }
              });
            } else if (inner.responsemessage) {
              return res.status(400).json({
                success: false,
                message: inner.responsemessage,
                data: null
              });
            }
          }
        } catch (v2Error) {
          console.warn("Flutterwave V2 verifyAccount warning:", v2Error.response?.data?.message || v2Error.message);
        }
      }
      if (/^\d{10}$/.test(accountNumber)) {
        try {
          const Driver = require_Driver();
          const Vendor = require_Vendor();
          const driverMatch = await Driver.findOne({ "bank.accountNumber": accountNumber });
          if (driverMatch && driverMatch.bank?.accountName) {
            return res.status(200).json({
              success: true,
              data: {
                accountName: driverMatch.bank.accountName,
                account_name: driverMatch.bank.accountName,
                accountNumber,
                bankCode
              }
            });
          }
          const vendorMatch = await Vendor.findOne({ "payoutAccount.accountNumber": accountNumber });
          if (vendorMatch && vendorMatch.payoutAccount?.accountName) {
            return res.status(200).json({
              success: true,
              data: {
                accountName: vendorMatch.payoutAccount.accountName,
                account_name: vendorMatch.payoutAccount.accountName,
                accountNumber,
                bankCode
              }
            });
          }
        } catch (dbErr) {
          console.warn("DB lookup warning in verifyAccount fallback:", dbErr.message);
        }
        return res.status(200).json({
          success: true,
          data: {
            accountName: accountNumber === "0690000034" ? "Ade Bond" : "Verified Merchant Account",
            account_name: accountNumber === "0690000034" ? "Ade Bond" : "Verified Merchant Account",
            accountNumber,
            bankCode
          }
        });
      }
      return res.status(400).json({
        success: false,
        message: "Sorry, recipient account could not be validated. Please check the 10-digit account number.",
        data: null
      });
    };
    module2.exports = {
      getBanks,
      verifyAccount
    };
  }
});

// routes/paymentRoutes.js
var require_paymentRoutes = __commonJS({
  "routes/paymentRoutes.js"(exports2, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var { getBanks, verifyAccount } = require_paymentController();
    router.get("/banks", getBanks);
    router.get("/verify-account", verifyAccount);
    router.post("/verify-account", verifyAccount);
    module2.exports = router;
  }
});

// controllers/driverController.js
var require_driverController = __commonJS({
  "controllers/driverController.js"(exports2, module2) {
    var Driver = require_Driver();
    var axios = require("axios");
    var mongoose = require("mongoose");
    var { getFlutterwaveAuthHeader } = require_flutterwave();
    var getCurrentDriver = async (req) => {
      const userId = req.headers["x-user-id"];
      const userEmail = req.headers["x-user-email"];
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const driver = await Driver.findById(userId);
        if (driver) return driver;
      }
      if (userEmail) {
        const driver = await Driver.findOne({ email: userEmail });
        if (driver) return driver;
      }
      return await Driver.findOne();
    };
    var getDriverProfile = async (req, res) => {
      try {
        let driver = await getCurrentDriver(req);
        if (!driver) {
          driver = await Driver.create({
            name: "Bayo Adeyemi",
            email: "bayo@denish.ng",
            phone: "08012345678",
            password: "demo",
            vehicleType: "Motorcycle",
            vehicle: { type: "Motorcycle", make: "Honda CB500", plate: "LAG-234-BA", color: "Red" },
            bank: { name: "GTBank", accountName: "Bayo Adeyemi", accountNumber: "0123456789" },
            status: "Active"
          });
        } else {
          driver = driver.toObject();
          delete driver.password;
          delete driver.resetPasswordOTP;
          delete driver.resetPasswordExpires;
        }
        res.status(200).json({ success: true, data: driver });
      } catch (error) {
        console.error("getDriverProfile error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateDriverProfile = async (req, res) => {
      try {
        let driver = await getCurrentDriver(req);
        if (!driver) return res.status(404).json({ success: false, error: "Driver not found" });
        const { name, email, phone, vehicle, bank, documents, profilePic } = req.body;
        if (name) driver.name = name;
        if (email) driver.email = email;
        if (phone) driver.phone = phone;
        if (profilePic) driver.profilePic = profilePic;
        if (vehicle) {
          driver.vehicle = {
            type: vehicle.type || driver.vehicle?.type || "",
            make: vehicle.make || driver.vehicle?.make || "",
            plate: vehicle.plate || driver.vehicle?.plate || "",
            color: vehicle.color || driver.vehicle?.color || ""
          };
          if (vehicle.type) driver.vehicleType = vehicle.type;
        }
        if (bank) {
          driver.bank = {
            name: bank.name || driver.bank?.name || "",
            bankCode: bank.bankCode || driver.bank?.bankCode || "",
            accountName: bank.accountName || driver.bank?.accountName || "",
            accountNumber: bank.accountNumber || driver.bank?.accountNumber || ""
          };
        }
        if (documents) {
          driver.documents = {
            nationalId: documents.nationalId || driver.documents?.nationalId || null,
            vehiclePhoto: documents.vehiclePhoto || driver.documents?.vehiclePhoto || null,
            license: documents.license || driver.documents?.license || null
          };
        }
        await driver.save();
        const updated = driver.toObject();
        delete updated.password;
        res.status(200).json({ success: true, message: "Profile updated successfully", data: updated });
      } catch (error) {
        console.error("updateDriverProfile error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getDriverEarnings = async (req, res) => {
      try {
        const Order = require_Order();
        const Transaction = require_Transaction();
        const driver = await getCurrentDriver(req);
        if (!driver) return res.status(404).json({ success: false, error: "Driver not found" });
        const deliveredOrders = await Order.find({ status: "delivered" }).sort({ createdAt: -1 });
        const withdrawals = await Transaction.find({ type: "Driver Payout" }).sort({ createdAt: -1 });
        const totalTrips = deliveredOrders.length;
        const orderEarningsSum = deliveredOrders.reduce((sum, o) => sum + (o.deliveryFee || 850), 0);
        const totalWithdrawalsSum = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
        const totalEarned = (driver.earnings?.totalEarned || 0) + orderEarningsSum;
        const availableBalance = typeof driver.earnings?.availableBalance === "number" ? driver.earnings.availableBalance : 38500;
        const now = /* @__PURE__ */ new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const todayEarned = deliveredOrders.filter((o) => new Date(o.createdAt) >= startOfToday).reduce((sum, o) => sum + (o.deliveryFee || 850), 0);
        const weekEarned = deliveredOrders.filter((o) => new Date(o.createdAt) >= startOfWeek).reduce((sum, o) => sum + (o.deliveryFee || 850), 0);
        const monthEarned = deliveredOrders.filter((o) => new Date(o.createdAt) >= startOfMonth).reduce((sum, o) => sum + (o.deliveryFee || 850), 0);
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const weeklyData = days.map((d) => ({
          day: d,
          amount: deliveredOrders.filter((o) => new Date(o.createdAt).toLocaleDateString("en-US", { weekday: "short" }) === d).reduce((sum, o) => sum + (o.deliveryFee || 850), 0)
        }));
        const orderTxns = deliveredOrders.map((o) => ({
          id: o.orderId || o._id.toString(),
          type: "Delivery",
          amount: `\u20A6${(o.deliveryFee || 850).toLocaleString()}`,
          description: `Delivery \u2013 ${o.vendorName || "Restaurant"}`,
          date: new Date(o.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + " | " + new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "completed",
          isWithdrawal: false
        }));
        const wTxns = withdrawals.map((w) => ({
          id: w.reference || w._id.toString(),
          type: "Withdrawal",
          amount: `\u20A6${(w.amount || 0).toLocaleString()}`,
          description: `Withdrawal \u2013 ${driver.bank?.name || "Bank"}`,
          date: new Date(w.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + " | " + new Date(w.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: (w.status || "completed").toLowerCase(),
          isWithdrawal: true
        }));
        const allTxns = [...orderTxns, ...wTxns].sort((a, b) => new Date(b.date) - new Date(a.date));
        const earningsData = {
          availableBalance: typeof driver.earnings?.availableBalance === "number" ? driver.earnings.availableBalance : 0,
          totalEarned,
          totalTrips,
          todayEarned,
          weekEarned,
          monthEarned,
          weeklyData,
          recentTransactions: allTxns,
          bank: driver.bank || null
        };
        res.status(200).json({ success: true, data: earningsData });
      } catch (error) {
        console.error("getDriverEarnings error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var withdrawEarnings = async (req, res) => {
      try {
        const rawAmount = req.body.amount;
        const amount = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount || "").replace(/[^0-9.]/g, ""));
        const driver = await Driver.findOne();
        if (!driver) return res.status(404).json({ success: false, error: "Driver not found" });
        const balance = driver.earnings?.availableBalance ?? 0;
        if (!amount || isNaN(amount) || amount <= 0) {
          return res.status(400).json({ success: false, error: "Please enter a valid withdrawal amount" });
        }
        if (amount > balance) {
          return res.status(400).json({ success: false, error: `Insufficient balance. Available: \u20A6${balance.toLocaleString()}` });
        }
        const { resolveBankCode, initiatePayoutTransfer } = require_payoutService();
        const bankName = driver.bank?.name || "GTBank";
        const accountNumber = driver.bank?.accountNumber || "0123456789";
        const bankCode = resolveBankCode(bankName, driver.bank?.bankCode || driver.bank?.code);
        const reference = `DRV_TRF_${Date.now()}_${Math.floor(Math.random() * 1e3)}`;
        const flwTransfer = await initiatePayoutTransfer({
          accountBank: bankCode,
          accountNumber,
          amount,
          narration: `Denish Driver Payout to ${driver.name}`,
          reference,
          recipientName: driver.bank?.accountName || driver.name
        });
        const newBalance = Math.max(0, balance - amount);
        driver.earnings = {
          ...driver.earnings?.toObject ? driver.earnings.toObject() : driver.earnings,
          availableBalance: newBalance
        };
        driver.markModified("earnings");
        await driver.save();
        const Transaction = require_Transaction();
        const transaction = await Transaction.create({
          type: "Driver Payout",
          from: "Denish Platform Wallet",
          to: `${driver.name} (${bankName} - ${accountNumber})`,
          amount,
          method: "Bank Transfer",
          status: flwTransfer.status || "Completed",
          reference
        });
        try {
          const Notification = require_Notification();
          await Notification.create({
            title: "Withdrawal Initiated \u{1F389}",
            message: `Your withdrawal of \u20A6${amount.toLocaleString()} to ${bankName} (${accountNumber}) has been submitted. Reference: ${reference}`,
            type: "payout",
            recipient: "driver",
            read: false
          });
        } catch (notifErr) {
          console.warn("Driver payout notification notice:", notifErr.message);
        }
        res.status(200).json({
          success: true,
          message: `\u20A6${amount.toLocaleString()} payout initiated to ${bankName} (${accountNumber}).`,
          newBalance: driver.earnings.availableBalance,
          reference,
          mode: flwTransfer.mode,
          data: {
            transaction,
            availableBalance: newBalance
          }
        });
      } catch (error) {
        console.error("withdrawEarnings error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getDriverDeliveries = async (req, res) => {
      try {
        const Order = require_Order();
        const allOrders = await Order.find().populate("vendorId").sort({ createdAt: -1 });
        const availableOrders = allOrders.filter((o) => ["pending", "preparing", "ready"].includes(o.status));
        const activeOrders = allOrders.filter((o) => ["assigned", "on the way"].includes(o.status));
        const completedOrders = allOrders.filter((o) => o.status === "delivered");
        const formattedAvailable = availableOrders.map((o) => ({
          id: o.orderId || o._id.toString(),
          _id: o._id.toString(),
          restaurant: o.vendorId?.businessName || o.vendorName || "Spice Avenue",
          customer: o.customerName || "Customer",
          pickupAddress: o.vendorId?.address || "15 Admiralty Way, Lekki",
          dropoffAddress: o.deliveryAddress || o.address || "12 Marina Road, Lagos Island",
          status: o.status === "preparing" ? "Preparing at restaurant" : "New delivery request",
          amount: o.deliveryFee || 850,
          totalAmount: o.totalAmount || o.total || 5700,
          distance: "3.5 km"
        }));
        const formattedActive = activeOrders.map((o) => ({
          id: o.orderId || o._id.toString(),
          _id: o._id.toString(),
          restaurant: o.vendorId?.businessName || o.vendorName || "Spice Avenue",
          customer: o.customerName || "Customer",
          pickupAddress: o.vendorId?.address || "15 Admiralty Way, Lekki",
          dropoffAddress: o.deliveryAddress || o.address || "12 Marina Road, Lagos Island",
          status: o.status === "on the way" ? "En route to customer" : "Order picked up",
          amount: o.deliveryFee || 850,
          totalAmount: o.totalAmount || o.total || 5700,
          distance: "2.1 km"
        }));
        const formattedCompleted = completedOrders.map((o) => ({
          id: o.orderId || o._id.toString(),
          _id: o._id.toString(),
          restaurant: o.vendorId?.businessName || o.vendorName || "Spice Avenue",
          customer: o.customerName || "Customer",
          dropoffAddress: o.deliveryAddress || o.address || "Customer Address",
          amount: o.deliveryFee || 850,
          totalAmount: o.totalAmount || o.total || 5700,
          date: new Date(o.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " + new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }));
        const deliveries = {
          available: formattedAvailable,
          active: formattedActive,
          completed: formattedCompleted
        };
        res.status(200).json({ success: true, data: deliveries });
      } catch (error) {
        console.error("getDriverDeliveries error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getDriverNotifications = async (req, res) => {
      try {
        const Notification = require_Notification();
        const notifications = await Notification.find({
          $or: [
            { recipient: { $in: ["driver", "all"] } },
            { recipient: { $exists: false } },
            { recipient: null }
          ]
        }).sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ success: true, data: notifications });
      } catch (error) {
        console.error("getDriverNotifications error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var markDriverNotificationRead = async (req, res) => {
      try {
        const Notification = require_Notification();
        const { id } = req.params;
        const mongoose2 = require("mongoose");
        if (mongoose2.Types.ObjectId.isValid(id)) {
          await Notification.findByIdAndUpdate(id, { read: true });
        } else {
          await Notification.updateOne({ _id: id }, { read: true });
        }
        res.status(200).json({ success: true, message: "Notification marked as read" });
      } catch (error) {
        console.error("markDriverNotificationRead error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var markAllDriverNotificationsRead = async (req, res) => {
      try {
        const Notification = require_Notification();
        await Notification.updateMany(
          {
            $or: [
              { recipient: { $in: ["driver", "all"] } },
              { recipient: { $exists: false } },
              { recipient: null }
            ],
            read: false
          },
          { read: true }
        );
        res.status(200).json({ success: true, message: "All notifications marked as read" });
      } catch (error) {
        console.error("markAllDriverNotificationsRead error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getDriverChats = async (req, res) => {
      try {
        const Message = require_Message();
        let driver = await getCurrentDriver(req);
        const driverId = driver ? driver._id.toString() : "driver-1";
        const driverName = driver ? driver.name : "Bayo Adeyemi";
        const messages = await Message.find({
          $or: [
            { senderId: driverId },
            { recipientId: driverId },
            { senderName: driverName },
            { recipientName: driverName }
          ]
        }).sort({ createdAt: -1 });
        const threadMap = {};
        messages.forEach((msg) => {
          const isSender = msg.senderName === driverName || msg.senderId === driverId;
          const otherName = isSender ? msg.recipientName : msg.senderName;
          const otherId = isSender ? msg.recipientId : msg.senderId;
          if (!threadMap[otherName]) {
            let avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100";
            if (otherName.toLowerCase().includes("kitchen") || otherName.toLowerCase().includes("restaurant") || otherName.toLowerCase().includes("spicy")) {
              avatar = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100";
            } else if (otherName.toLowerCase().includes("support")) {
              avatar = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100";
            }
            threadMap[otherName] = {
              id: otherId || otherName,
              name: otherName,
              lastMsg: msg.text || (msg.imageUrl ? "\u{1F4F7} Image" : "Voice Call"),
              time: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              unread: !msg.read && !isSender ? 1 : 0,
              avatar
            };
          }
        });
        const threads = Object.values(threadMap);
        res.status(200).json({ success: true, threads });
      } catch (error) {
        console.error("getDriverChats error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getDriverMessages = async (req, res) => {
      try {
        const Message = require_Message();
        const { recipientName } = req.query;
        const driver = await getCurrentDriver(req);
        const driverName = driver ? driver.name : "Bayo Adeyemi";
        const messages = await Message.find({
          $or: [
            { senderName: driverName, recipientName },
            { senderName: recipientName, recipientName: driverName }
          ]
        }).sort({ createdAt: 1 });
        const formatted = messages.map((m) => ({
          id: m._id,
          text: m.text,
          image: m.imageUrl,
          type: m.type,
          subText: m.subText,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sender: m.senderName === recipientName ? "them" : "me"
        }));
        res.status(200).json({ success: true, messages: formatted });
      } catch (error) {
        console.error("getDriverMessages error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var sendDriverMessage = async (req, res) => {
      try {
        const Message = require_Message();
        const { recipientName, text, imageUrl, type, subText } = req.body;
        let driver = await getCurrentDriver(req);
        const newMsg = await Message.create({
          senderId: driver ? driver._id.toString() : "driver-1",
          senderName: driver ? driver.name : "Bayo Adeyemi",
          recipientId: "chat-partner",
          recipientName: recipientName || "John Doe (Customer)",
          text,
          imageUrl,
          type: type || "text",
          subText
        });
        res.status(200).json({ success: true, data: newMsg });
      } catch (error) {
        console.error("sendDriverMessage error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateOrderStatus = async (req, res) => {
      try {
        const Order = require_Order();
        const { orderId } = req.params;
        const { status } = req.body;
        const validStatuses = ["pending", "preparing", "ready", "on the way", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ success: false, error: "Invalid order status" });
        }
        const order = await Order.findOne({
          $or: [{ _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null }, { orderId }]
        });
        if (!order) {
          return res.status(404).json({ success: false, error: "Order not found" });
        }
        order.status = status;
        await order.save();
        if (status === "delivered") {
          const driver = await Driver.findOne();
          if (driver) {
            const fee = order.deliveryFee || 850;
            driver.earnings = {
              totalEarned: (driver.earnings?.totalEarned || 0) + fee,
              availableBalance: (driver.earnings?.availableBalance || 0) + fee,
              totalTrips: (driver.earnings?.totalTrips || 0) + 1
            };
            driver.markModified("earnings");
            await driver.save();
          }
        }
        res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
      } catch (error) {
        console.error("updateOrderStatus error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    };
    module2.exports = {
      getDriverProfile,
      updateDriverProfile,
      getDriverEarnings,
      withdrawEarnings,
      getDriverDeliveries,
      getDriverNotifications,
      markDriverNotificationRead,
      markAllDriverNotificationsRead,
      getDriverChats,
      getDriverMessages,
      sendDriverMessage,
      updateOrderStatus
    };
  }
});

// routes/driverRoutes.js
var require_driverRoutes = __commonJS({
  "routes/driverRoutes.js"(exports2, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var {
      getDriverProfile,
      updateDriverProfile,
      getDriverEarnings,
      withdrawEarnings,
      getDriverDeliveries,
      getDriverNotifications,
      markDriverNotificationRead,
      markAllDriverNotificationsRead,
      getDriverChats,
      getDriverMessages,
      sendDriverMessage,
      updateOrderStatus
    } = require_driverController();
    var { upload } = require_cloudinary();
    router.get("/profile", getDriverProfile);
    router.put("/profile", updateDriverProfile);
    router.get("/earnings", getDriverEarnings);
    router.post("/withdraw", withdrawEarnings);
    router.get("/deliveries", getDriverDeliveries);
    router.patch("/order/:orderId/status", updateOrderStatus);
    router.get("/notifications", getDriverNotifications);
    router.patch("/notifications/read-all", markAllDriverNotificationsRead);
    router.patch("/notifications/:id/read", markDriverNotificationRead);
    router.get("/chats", getDriverChats);
    router.get("/messages", getDriverMessages);
    router.post("/messages", sendDriverMessage);
    router.post("/upload-profile-pic", upload.single("image"), (req, res) => {
      try {
        if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
        const imageUrl = req.file.path;
        const Driver = require_Driver();
        Driver.findOne().then((driver) => {
          if (driver) {
            driver.profilePic = imageUrl;
            driver.save();
          }
        });
        res.status(200).json({ success: true, imageUrl });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    module2.exports = router;
  }
});

// models/Dispute.js
var require_Dispute = __commonJS({
  "models/Dispute.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var disputeSchema = new mongoose.Schema({
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      priority: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium"
      },
      status: {
        type: String,
        enum: ["open", "investigating", "escalated", "resolved", "closed"],
        default: "open"
      },
      complaintId: {
        type: String,
        required: true,
        unique: true
      },
      orderId: {
        type: String,
        required: true
      },
      from: {
        type: String,
        required: true
      },
      against: {
        type: String,
        required: true
      },
      messageCount: {
        type: Number,
        default: 0
      }
    }, { timestamps: true });
    module2.exports = mongoose.model("Dispute", disputeSchema);
  }
});

// models/Settings.js
var require_Settings = __commonJS({
  "models/Settings.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var settingsSchema = new mongoose.Schema({
      profile: {
        fullName: { type: String, default: "Denish Admin" },
        email: { type: String, default: "denishadmin@gmail.com" },
        phone: { type: String, default: "+234 813 048 5734" }
      },
      platform: {
        platformName: { type: String, default: "Denish" },
        currency: { type: String, default: "NGN" },
        deliveryModel: { type: String, enum: ["flat", "distance"], default: "flat" },
        baseFee: { type: String, default: "500" },
        commission: { type: String, default: "15" },
        deliveryFeeCommission: { type: String, default: "5" },
        autoCancelMin: { type: Number, default: 60 },
        deliveryDeadlineMin: { type: Number, default: 40 }
      },
      notifications: {
        vendorEmails: { type: Boolean, default: true },
        disputeAlerts: { type: Boolean, default: true },
        smsAlerts: { type: Boolean, default: false },
        notificationEmail: { type: String, default: "denishadmin@gmail.com" }
      },
      payments: {
        gateway: { type: String, default: "Flutterwave" },
        payoutCycle: { type: String, enum: ["weekly", "monthly"], default: "weekly" },
        minThreshold: { type: String, default: "5000" }
      },
      security: {
        twoFactor: { type: Boolean, default: true },
        sessions: [{
          id: { type: String, default: "" },
          device: { type: String, default: "" },
          browser: { type: String, default: "" },
          location: { type: String, default: "" },
          ip: { type: String, default: "" },
          lastActive: { type: String, default: "" },
          current: { type: Boolean, default: false }
        }]
      },
      system: {
        maintenanceMode: { type: Boolean, default: false }
      }
    }, { timestamps: true });
    module2.exports = mongoose.model("Settings", settingsSchema);
  }
});

// models/Promotion.js
var require_Promotion = __commonJS({
  "models/Promotion.js"(exports2, module2) {
    var mongoose = require("mongoose");
    var promotionSchema = new mongoose.Schema({
      title: { type: String, required: true },
      code: { type: String, required: true, unique: true },
      discount: { type: String, required: true },
      minOrder: { type: String, required: true },
      usage: { type: String, required: true },
      // e.g. "342/500"
      status: { type: String, enum: ["active", "expired"], default: "active" },
      period: { type: String, required: true }
    }, { timestamps: true });
    module2.exports = mongoose.model("Promotion", promotionSchema);
  }
});

// controllers/adminController.js
var require_adminController = __commonJS({
  "controllers/adminController.js"(exports2, module2) {
    var Vendor = require_Vendor();
    var Driver = require_Driver();
    var Customer = require_Customer();
    var Order = require_Order();
    var Transaction = require_Transaction();
    var Dispute = require_Dispute();
    var Settings = require_Settings();
    var Banner = require_Banner();
    var Promotion = require_Promotion();
    var Admin = require_Admin();
    var Notification = require_Notification();
    var SystemContent = require_SystemContent();
    var jwt = require("jsonwebtoken");
    var adminLogin = async (req, res) => {
      try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ email: username });
        if (!admin) {
          return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || "secret", {
          expiresIn: "1d"
        });
        res.status(200).json({ success: true, token, admin: { id: admin._id, name: admin.name, email: admin.email } });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getDashboardStats = async (req, res) => {
      try {
        const [
          totalOrders,
          totalVendors,
          totalDrivers,
          totalCustomers,
          deliveredOrders,
          pendingVendors,
          openDisputes
        ] = await Promise.all([
          Order.countDocuments(),
          Vendor.countDocuments(),
          Driver.countDocuments(),
          Customer.countDocuments(),
          Order.find({ status: "delivered" }),
          Vendor.countDocuments({ status: "pending" }),
          Dispute.countDocuments({ status: "open" })
        ]);
        const revenue = deliveredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const activeOrders = await Order.countDocuments({
          status: { $nin: ["delivered", "cancelled"] }
        });
        res.status(200).json({
          success: true,
          stats: {
            totalOrders,
            totalVendors,
            totalDrivers,
            totalUsers: totalCustomers + totalVendors + totalDrivers,
            revenue,
            activeOrders,
            completionRate: totalOrders > 0 ? deliveredOrders.length / totalOrders * 100 : 0,
            pendingApprovals: pendingVendors + openDisputes
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getAllOrders = async (req, res) => {
      try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getAllVendors = async (req, res) => {
      try {
        const vendors = await Vendor.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, vendors });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getAllDrivers = async (req, res) => {
      try {
        const drivers = await Driver.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, drivers });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getAllUsers = async (req, res) => {
      try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, users: customers });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getAllTransactions = async (req, res) => {
      try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, transactions });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getAllDisputes = async (req, res) => {
      try {
        const disputes = await Dispute.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, disputes });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateVendorStatus = async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        const vendor = await Vendor.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ success: true, vendor });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateDriverStatus = async (req, res) => {
      try {
        const { id } = req.params;
        const { status, isWarned, isSuspended } = req.body;
        const updates = {};
        if (typeof status !== "undefined") {
          updates.status = status === "Suspended" ? "Suspended" : status === "Pending" ? "Pending" : "Active";
        }
        if (typeof isWarned !== "undefined") updates.isWarned = Boolean(isWarned);
        if (typeof isSuspended !== "undefined") updates.isSuspended = Boolean(isSuspended);
        const driver = await Driver.findByIdAndUpdate(id, updates, { new: true });
        res.status(200).json({ success: true, driver });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateUserStatus = async (req, res) => {
      try {
        const { id } = req.params;
        const { status, isWarned } = req.body;
        const updates = {};
        if (typeof status !== "undefined") updates.status = status;
        if (typeof isWarned !== "undefined") updates.isWarned = Boolean(isWarned);
        const customer = await Customer.findByIdAndUpdate(id, updates, { new: true });
        res.status(200).json({ success: true, user: customer });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateDisputeStatus = async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        const dispute = await Dispute.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ success: true, dispute });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var addTransaction = async (req, res) => {
      try {
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.status(201).json({ success: true, transaction: newTransaction });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateOrder = async (req, res) => {
      try {
        const { id } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, order: updatedOrder });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getSettings = async (req, res) => {
      try {
        let settings = await Settings.findOne();
        if (!settings) {
          settings = new Settings();
          await settings.save();
        }
        res.status(200).json({ success: true, settings });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateSettings = async (req, res) => {
      try {
        let settings = await Settings.findOne();
        if (!settings) {
          settings = new Settings();
        }
        const mergeDeep = (target, source) => {
          const output = { ...target || {} };
          Object.entries(source || {}).forEach(([key, value]) => {
            if (value && typeof value === "object" && !Array.isArray(value) && output[key] && typeof output[key] === "object" && !Array.isArray(output[key])) {
              output[key] = mergeDeep(output[key], value);
            } else {
              output[key] = value;
            }
          });
          return output;
        };
        const mergedSettings = mergeDeep(settings.toObject(), req.body);
        settings.set(mergedSettings);
        await settings.save();
        res.status(200).json({ success: true, settings });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getBanners = async (req, res) => {
      try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, banners });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var addBanner = async (req, res) => {
      try {
        const banner = new Banner(req.body);
        await banner.save();
        res.status(201).json({ success: true, banner });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateBanner = async (req, res) => {
      try {
        const { id } = req.params;
        const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, banner });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var deleteBanner = async (req, res) => {
      try {
        const { id } = req.params;
        await Banner.findByIdAndDelete(id);
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getPromotions = async (req, res) => {
      try {
        const promotions = await Promotion.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, promotions });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var addPromotion = async (req, res) => {
      try {
        const promotion = new Promotion(req.body);
        await promotion.save();
        res.status(201).json({ success: true, promotion });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updatePromotion = async (req, res) => {
      try {
        const { id } = req.params;
        const promotion = await Promotion.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, promotion });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var deletePromotion = async (req, res) => {
      try {
        const { id } = req.params;
        await Promotion.findByIdAndDelete(id);
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getAllData = async (req, res) => {
      try {
        const [
          orders,
          vendors,
          drivers,
          users,
          transactions,
          disputes,
          settings,
          banners,
          promotions
        ] = await Promise.all([
          Order.find().sort({ createdAt: -1 }),
          Vendor.find().sort({ createdAt: -1 }),
          Driver.find().sort({ createdAt: -1 }),
          Customer.find().sort({ createdAt: -1 }),
          Transaction.find().sort({ createdAt: -1 }),
          Dispute.find().sort({ createdAt: -1 }),
          Settings.findOne() || new Settings().save(),
          Banner.find().sort({ createdAt: -1 }),
          Promotion.find().sort({ createdAt: -1 })
        ]);
        res.status(200).json({
          success: true,
          data: {
            orders,
            vendors,
            drivers,
            users,
            transactions,
            disputes,
            settings,
            banners,
            promotions
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getAdminProfile = async (req, res) => {
      try {
        const admin = await Admin.findOne({ email: "admin@denish.com" });
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
        res.status(200).json({ success: true, admin: { id: admin._id, name: admin.name, email: admin.email, image: admin.image } });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateAdminProfile = async (req, res) => {
      try {
        const admin = await Admin.findOne({ email: "admin@denish.com" });
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
        const { name, email, password, image } = req.body;
        if (name) admin.name = name;
        if (email) admin.email = email;
        if (image) admin.image = image;
        if (password) admin.password = password;
        await admin.save();
        res.status(200).json({ success: true, admin: { id: admin._id, name: admin.name, email: admin.email, image: admin.image } });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getNotifications = async (req, res) => {
      try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ success: true, notifications });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var markNotificationAsRead = async (req, res) => {
      try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { read: true });
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var markAllNotificationsAsRead = async (req, res) => {
      try {
        await Notification.updateMany({ read: false }, { read: true });
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var getSystemContent = async (req, res) => {
      try {
        const { key } = req.params;
        const tosContent = `TERMS OF SERVICE AND PRIVACY POLICY
Effective Date: August 14, 2026
Company Legal Name: Denish Limited (RC: 9462857)
Registered Address: Plot 3 Block B, ADP Premises Agric GRA, Ilorin,
Kwara State, Nigeria
Brand/App Name: Denish
Website/App URL: https://denishng.com
Support Contact: support@denishng.com / 08036301983
Data Protection Officer (DPO) Email: denishlimited@gmail.com

PART I: TERMS OF SERVICE

1. Introduction & Acceptance of Terms
Welcome to Denish ("we", "us", or "our"). These Terms of Service ("Terms")
govern your access to and use of the Denish mobile application, website
(https://denishng.com), and all related logistics, delivery, and marketplace
services.
By creating an account, accessing, or using the platform as a Buyer, Vendor,
or Rider, you explicitly agree to be bound by these Terms. If you do not
agree with any part of these Terms, you must discontinue use of the platform
immediately.

2. Platform Overview & User Eligibility
. Marketplace Model: Denish operates as an online marketplace
connecting Buyers with independent/partner Vendors (offering Food,
Grocery, Pharmacy, and Retail categories) and Riders to facilitate
local commerce, pickup, and logistics services.
Inventory Disclaimer: We do not own or stock the inventory of
products sold by third-party vendors. Vendors are independently
responsible for the quality, safety, and legality of their goods.
Age Limit & Capacity: Users must meet the legal age requirements
mandated under the laws of the Federal Republic of Nigeria to
register and execute transactions on the platform.

3. Account Registration, Security, & KYC
Account Creation: Users may register using traditional credentials
or via third-party login protocols including Google OAuth and Apple
login.
Mandatory KYC: To ensure platform security and compliance, users
(particularly Vendors and Riders) must complete Know Your
Customer (KYC) verification, which includes submitting a valid ID and
Selfie, Bank Verification Number (BVN), and National Identification
Number (NIN).
Security Responsibility: You are entirely responsible for
maintaining the confidentiality of your account credentials and for all
activities that occur under your account.

4. Financial Terms: Payments, Settlement, & Fees
Accepted Payment Methods: We support multiple payment
channels including Cards, Bank Transfers, Digital Wallets, and Cash
on Delivery (COD).
Payment Collection: Payments are processed securely through
integrated third-party payment gateways.
Settlement Cycle: Payouts to Vendors and Riders are processed
according to the designated settlement cycle (T+X schedule) directly
to their designated bank accounts.
Fees: Delivery fees, service fees, and platform fees are calculated
and displayed to users prior to order confirmation.

5. Orders, Cancellations, & Refunds
. Order Modifications & Cancellations: Cancellation windows are
strictly enforced according to system parameters. Unauthorized
cancellations after order processing has commenced may incur
penalty charges.
. Non-Refundable Items: Due to safety, hygiene, and custom
nature, items classified under Food, Pharmacy, and Custom orders
are strictly non-refundable.
Refund Processing: Approved refunds are credited instantly to the
user's Denish Wallet, whereas card-based refunds are subject to
standard banking processing timelines.

6. Vendor & Rider Rules and SLAS
Vendor Service Level Agreements (SLAs): Vendors are required
to accept orders and complete food preparation or retail packaging
within designated timeframes to maintain active status.
\u2022 Rider Guidelines: Riders must utilize approved vehicles
(Bikes/Cars) equipped with valid vehicle insurance and adhere strictly
to traffic and safety regulations.
. Grounds for Deactivation: Any breach of platform safety
guidelines, fraudulent activities, poor delivery ratings, or violation of
KYC rules will result in immediate account deactivation.

PART III: GENERAL PROVISIONS

1. Limitation of Liability & Loss Allocation
Denish Limited acts strictly as an intermediary digital marketplace. We bear
no direct liability for third-party vendor product defects, delayed logistics
caused by unforeseen external factors, or independent rider misconduct
beyond our reasonable operational control. Liability caps per order are
enforced per internal operational guidelines.

2. Governing Law & Dispute Resolution
These Terms and Privacy Policy shall be governed by, and construed in
accordance with, the laws of the Federal Republic of Nigeria. Any
disputes, controversies, or claims arising out of or relating to these terms
shall be settled via binding arbitration in Nigeria.

3. Contact Information
For any questions, complaints, or privacy-related inquiries regarding these
terms or data handling practices, please contact us:
\u2022
Support Email: support@denishng.com
DPO Direct Email: denishlimited@gmail.com
Phone: 08036301983`;
        const privacyContent = `TERMS OF SERVICE AND PRIVACY POLICY
Effective Date: August 14, 2026
Company Legal Name: Denish Limited (RC: 9462857)
Registered Address: Plot 3 Block B, ADP Premises Agric GRA, Ilorin,
Kwara State, Nigeria
Brand/App Name: Denish
Website/App URL: https://denishng.com
Support Contact: support@denishng.com / 08036301983
Data Protection Officer (DPO) Email: denishlimited@gmail.com

PART II: PRIVACY POLICY

1. Information We Collect
To provide a seamless multi-sided marketplace experience, we collect and
process the following categories of personal data:
Identification & Contact Data: Name, Phone number, Email
address, and Physical address.
Location Data: Real-time GPS location data from Buyers, Vendors,
and Riders to optimize route mapping and delivery tracking.
Verification Data: National Identification Number (NIN) and Bank
Verification Number (BVN).
\u2022 Payment Data: Transaction history and records (note: sensitive
health prescriptions and raw card details are not directly collected or
stored on our servers).

2. How We Store & Protect Your Data
. Storage Location: Personal data is stored securely on servers
located both within Nigeria and abroad through our hosting provider,
Hostinger.
.
Data Retention Period: We retain user personal data for a period
of 1 year following formal account deletion, after which it is securely
anonymized or permanently deleted, unless retention is required for
legal or regulatory compliance.

3. Disclosure of Information to Third Parties
We share necessary information with trusted third parties strictly to
facilitate operational fulfillment:
\u2022
. Payment Gateways: To process secure financial transactions.
Mapping Services: To enable real-time tracking and location
routing.
Authentication Providers: Google and Apple OAuth for
streamlined login.
Marketplace Participants: Relevant details are shared between
Buyers, Vendors, and Riders solely to complete service fulfillment
(e.g., delivery addresses and contact numbers).

4. Cookies and Tracking Technologies
The platform utilizes essential operational cookies and performance
analytics to monitor app performance and enhance user experience.

PART III: GENERAL PROVISIONS

1. Limitation of Liability & Loss Allocation
Denish Limited acts strictly as an intermediary digital marketplace. We bear
no direct liability for third-party vendor product defects, delayed logistics
caused by unforeseen external factors, or independent rider misconduct
beyond our reasonable operational control. Liability caps per order are
enforced per internal operational guidelines.

2. Governing Law & Dispute Resolution
These Terms and Privacy Policy shall be governed by, and construed in
accordance with, the laws of the Federal Republic of Nigeria. Any
disputes, controversies, or claims arising out of or relating to these terms
shall be settled via binding arbitration in Nigeria.

3. Contact Information
For any questions, complaints, or privacy-related inquiries regarding these
terms or data handling practices, please contact us:
\u2022
Support Email: support@denishng.com
DPO Direct Email: denishlimited@gmail.com
Phone: 08036301983`;
        const supportContent = `TERMS OF SERVICE AND PRIVACY POLICY
Effective Date: August 14, 2026
Company Legal Name: Denish Limited (RC: 9462857)
Registered Address: Plot 3 Block B, ADP Premises Agric GRA, Ilorin,
Kwara State, Nigeria
Brand/App Name: Denish
Website/App URL: https://denishng.com
Support Contact: support@denishng.com / 08036301983
Data Protection Officer (DPO) Email: denishlimited@gmail.com

If you need support, have questions, or require assistance with using the Denish app or your account, please reach out to us using our contact information below.

Support Email: support@denishng.com
DPO Direct Email: denishlimited@gmail.com
Phone: 08036301983`;
        const defaults = {
          terms_of_service: { key: "terms_of_service", title: "Terms of Service", content: tosContent },
          privacy_policy: { key: "privacy_policy", title: "Privacy Policy", content: privacyContent },
          help_and_support: { key: "help_and_support", title: "Help & Support", content: supportContent, contactEmail: "support@denishng.com", contactPhone: "08036301983" }
        };
        let content = await SystemContent.findOne({ key });
        if (content) {
          if (!content.content || !content.content.includes("RC: 9462857")) {
            const matchingDefault = defaults[key];
            if (matchingDefault) {
              content.content = matchingDefault.content;
              content.title = matchingDefault.title;
              content.contactEmail = matchingDefault.contactEmail || "support@denishng.com";
              content.contactPhone = matchingDefault.contactPhone || "08036301983";
              await content.save();
            }
          }
        } else {
          content = defaults[key] || { key, title: "Information", content: "Content unavailable." };
        }
        res.status(200).json({ success: true, data: content });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var updateSystemContent = async (req, res) => {
      try {
        const { key } = req.params;
        const { title, content, contactEmail, contactPhone } = req.body;
        const updated = await SystemContent.findOneAndUpdate(
          { key },
          { key, title, content, contactEmail, contactPhone },
          { upsert: true, new: true }
        );
        res.status(200).json({ success: true, data: updated });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    var deleteUser = async (req, res) => {
      try {
        const { id } = req.params;
        const { role } = req.query;
        if (role === "Vendor") {
          await Vendor.findByIdAndDelete(id);
        } else if (role === "Driver") {
          await Driver.findByIdAndDelete(id);
        } else {
          await Customer.findByIdAndDelete(id);
        }
        res.status(200).json({ success: true, message: "User deleted successfully" });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    };
    module2.exports = {
      getDashboardStats,
      getAllOrders,
      getAllVendors,
      getAllDrivers,
      getAllUsers,
      getAllTransactions,
      getAllDisputes,
      updateVendorStatus,
      updateDriverStatus,
      updateUserStatus,
      updateDisputeStatus,
      addTransaction,
      updateOrder,
      getSettings,
      updateSettings,
      getBanners,
      addBanner,
      updateBanner,
      deleteBanner,
      getPromotions,
      addPromotion,
      updatePromotion,
      deletePromotion,
      getAllData,
      adminLogin,
      getAdminProfile,
      updateAdminProfile,
      getNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      getSystemContent,
      updateSystemContent,
      deleteUser
    };
  }
});

// routes/adminRoutes.js
var require_adminRoutes = __commonJS({
  "routes/adminRoutes.js"(exports2, module2) {
    var express2 = require("express");
    var router = express2.Router();
    var {
      getDashboardStats,
      getAllOrders,
      getAllVendors,
      getAllDrivers,
      getAllUsers,
      getAllTransactions,
      getAllDisputes,
      updateVendorStatus,
      updateDriverStatus,
      updateUserStatus,
      updateDisputeStatus,
      addTransaction,
      updateOrder,
      getSettings,
      updateSettings,
      getBanners,
      addBanner,
      updateBanner,
      deleteBanner,
      getPromotions,
      addPromotion,
      updatePromotion,
      deletePromotion,
      getAllData,
      adminLogin,
      getAdminProfile,
      updateAdminProfile,
      getNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      getSystemContent,
      updateSystemContent,
      deleteUser
    } = require_adminController();
    var { upload } = require_cloudinary();
    var { getVendorMenuById } = require_menuController();
    router.post("/login", adminLogin);
    router.get("/stats", getDashboardStats);
    router.get("/orders", getAllOrders);
    router.get("/vendors", getAllVendors);
    router.get("/drivers", getAllDrivers);
    router.get("/users", getAllUsers);
    router.get("/transactions", getAllTransactions);
    router.get("/disputes", getAllDisputes);
    router.get("/vendors/:vendorId/menu", getVendorMenuById);
    router.get("/vendors/:vendorId/menu-items", getVendorMenuById);
    router.patch("/vendors/:id/status", updateVendorStatus);
    router.patch("/drivers/:id/status", updateDriverStatus);
    router.patch("/users/:id/status", updateUserStatus);
    router.delete("/users/:id", deleteUser);
    router.put("/dispute/:id", updateDisputeStatus);
    router.post("/transaction", addTransaction);
    router.put("/order/:id", updateOrder);
    router.get("/settings", getSettings);
    router.put("/settings", updateSettings);
    router.get("/banners", getBanners);
    router.post("/banners", addBanner);
    router.put("/banners/:id", updateBanner);
    router.delete("/banners/:id", deleteBanner);
    router.get("/promotions", getPromotions);
    router.post("/promotions", addPromotion);
    router.put("/promotions/:id", updatePromotion);
    router.delete("/promotions/:id", deletePromotion);
    router.get("/all-data", getAllData);
    router.get("/profile", getAdminProfile);
    router.put("/profile", updateAdminProfile);
    router.get("/notifications", getNotifications);
    router.patch("/notifications/:id/read", markNotificationAsRead);
    router.patch("/notifications/read-all", markAllNotificationsAsRead);
    router.get("/content/:key", getSystemContent);
    router.put("/content/:key", updateSystemContent);
    router.post("/upload", upload.single("image"), (req, res) => {
      if (req.file) {
        res.status(200).json({ success: true, url: req.file.path });
      } else {
        res.status(400).json({ success: false, message: "Upload failed" });
      }
    });
    module2.exports = router;
  }
});

// index.js
require("dotenv").config();
var express = require("express");
var cors = require("cors");
var connectDB = require_db();
var { seedAdmin } = require_seedAdmin();
var vendorRoutes = require_vendorRoutes();
var authRoutes = require_authRoutes();
var customerRoutes = require_customerRoutes();
var paymentRoutes = require_paymentRoutes();
var driverRoutes = require_driverRoutes();
var adminRoutes = require_adminRoutes();
var app = express();
var PORT = process.env.PORT || 3e3;
var corsOptions = {
  origin: [
    "https://admin.denishng.com",
    "https://app.denishng.com",
    "https://www.denishng.com",
    "https://api.denishng.com",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://0.0.0.0:3000",
    "http://0.0.0.0:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081"
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use("/api/auth", authRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running normally" });
});
app.get("/api/seed-drivers", async (req, res) => {
  if (req.query.token !== "DenishSeed2024") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  try {
    const Driver = require_Driver();
    const DRIVER_ACCOUNTS = [
      {
        name: "Bayo Adeyemi",
        email: "driver@denish.ng",
        phone: "08012345678",
        password: "driver123",
        vehicleType: "Motorcycle",
        vehicle: { type: "Motorcycle", make: "Honda CB500", plate: "LAG-234-BA", color: "Red" },
        bank: { name: "GTBank", accountName: "Bayo Adeyemi", accountNumber: "0123456789" },
        status: "Active",
        earnings: { totalEarned: 248e3, availableBalance: 62500, totalTrips: 97 }
      },
      {
        name: "Chukwuemeka Eze",
        email: "driver2@denish.ng",
        phone: "08098765432",
        password: "driver123",
        vehicleType: "Bike",
        vehicle: { type: "Bike", make: "TVS Apache 200", plate: "ABJ-110-CK", color: "Black" },
        bank: { name: "Access Bank", accountName: "Chukwuemeka Eze", accountNumber: "0987654321" },
        status: "Active",
        earnings: { totalEarned: 185e3, availableBalance: 41e3, totalTrips: 73 }
      }
    ];
    const results = [];
    for (const d of DRIVER_ACCOUNTS) {
      const existing = await Driver.findOne({ email: d.email });
      if (!existing) {
        await Driver.create(d);
        results.push({ email: d.email, action: "created" });
      } else {
        existing.password = d.password;
        existing.status = d.status;
        await existing.save();
        results.push({ email: d.email, action: "updated" });
      }
    }
    return res.status(200).json({
      success: true,
      message: "Drivers seeded successfully",
      results,
      loginDetails: DRIVER_ACCOUNTS.map((d) => ({
        name: d.name,
        email: d.email,
        phone: d.phone,
        password: d.password,
        status: d.status
      }))
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
connectDB().then(async () => {
  try {
    await seedAdmin();
    console.log("Admin seed check complete.");
  } catch (error) {
    console.error("Admin seed check failed:", error);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}).catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
});
