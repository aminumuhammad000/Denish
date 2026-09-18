const cron = require('node-cron');
const Vendor = require('../models/Vendor');
const Driver = require('../models/Driver');
const Payout = require('../models/Payout');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const { 
  resolveBankCode, 
  verifyPayoutAccount, 
  initiatePayoutTransfer, 
  checkTransferStatus 
} = require('./payoutService');

// Concurrency locks to prevent overlapping executions
let isVendorPayoutRunning = false;
let isDriverPayoutRunning = false;
let isReconciliationRunning = false;

// In-memory execution state for admin telemetry
let lastVendorRun = null;
let lastDriverRun = null;
let lastReconcileRun = null;
let vendorCronJob = null;
let driverCronJob = null;
let reconcileCronJob = null;

/**
 * Release Matured Driver Earnings (7-Day Holding Rule)
 * Checks driver.earnings.unpaidEarnings for entries where eligibleAt <= now.
 * Transfers matured funds from pendingBalance to availableBalance.
 */
const releaseMaturedDriverEarnings = async () => {
  try {
    const now = new Date();
    const drivers = await Driver.find({
      'earnings.unpaidEarnings': { $elemMatch: { status: 'pending', eligibleAt: { $lte: now } } }
    });

    let totalMaturedCount = 0;
    let totalMaturedAmount = 0;

    for (const driver of drivers) {
      if (!driver.earnings?.unpaidEarnings || !Array.isArray(driver.earnings.unpaidEarnings)) continue;

      let maturedForDriver = 0;
      for (const entry of driver.earnings.unpaidEarnings) {
        if (entry.status === 'pending' && entry.eligibleAt && entry.eligibleAt <= now) {
          entry.status = 'eligible';
          maturedForDriver += Number(entry.amount || 0);
          totalMaturedCount++;
        }
      }

      if (maturedForDriver > 0) {
        driver.earnings.availableBalance = (driver.earnings.availableBalance || 0) + maturedForDriver;
        driver.earnings.pendingBalance = Math.max(0, (driver.earnings.pendingBalance || 0) - maturedForDriver);
        driver.markModified('earnings');
        await driver.save();
        totalMaturedAmount += maturedForDriver;
      }
    }

    if (totalMaturedCount > 0) {
      console.log(`[PayoutScheduler] Released ₦${totalMaturedAmount.toLocaleString()} across ${totalMaturedCount} matured driver delivery earnings (>= 7 days).`);
    }
  } catch (err) {
    console.error('[PayoutScheduler] releaseMaturedDriverEarnings error:', err.message);
  }
};

/**
 * Process Daily 24-Hour Vendor Payouts
 * Timezone: Africa/Lagos (WAT)
 * Scheduled at 18:00 (6:00 PM WAT) every 24 hours (Daily).
 * 
 * Safety Guarantees:
 * - Concurrency lock prevents concurrent runs.
 * - Idempotency reference VND_24H_{vendorId}_{dateKey} prevents double payment.
 * - Account verification before transfer.
 * - Balance deducted atomically.
 * - Never marked as SUCCESSFUL until Flutterwave confirms it.
 * - If Flutterwave fails, balance is automatically refunded.
 * - If uncertain (network timeout), status is kept PROCESSING (no duplicate retry).
 */
const processDailyVendorPayouts = async ({ isManual = false, initiatedBy = 'system' } = {}) => {
  if (isVendorPayoutRunning) {
    console.warn('[PayoutScheduler] Vendor payout is already running. Skipping concurrent trigger.');
    return { success: false, message: 'Vendor payout job is already in progress' };
  }

  isVendorPayoutRunning = true;
  const startTime = new Date();
  const dateKey = startTime.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  console.log(`[PayoutScheduler] Starting Daily 24-Hour Vendor Payout (Date: ${dateKey}, Type: ${isManual ? 'MANUAL: ' + initiatedBy : 'SCHEDULED'})...`);

  try {
    const settings = await Settings.findOne();
    const minThreshold = Number(settings?.payments?.vendorMinThreshold || 5000);

    // 1. Gather all approved vendors whose available balance >= minThreshold
    const eligibleVendors = await Vendor.find({
      status: { $in: ['Approved', 'approved', 'Active', 'active'] },
      'earnings.availableBalance': { $gte: minThreshold },
    });

    console.log(`[PayoutScheduler] Found ${eligibleVendors.length} vendors with availableBalance >= ₦${minThreshold.toLocaleString()}`);

    const results = [];
    let totalPaidOut = 0;

    for (const vendor of eligibleVendors) {
      const balance = Number(vendor.earnings?.availableBalance || 0);
      if (balance < minThreshold) continue;

      const vendorName = vendor.businessName || vendor.name || 'Vendor';
      const reference = `VND_24H_${vendor._id.toString()}_${dateKey}`;

      // A. Check for existing Payout with this reference or legacy format (Idempotency)
      const existingPayout = await Payout.findOne({ 
        $or: [
          { reference },
          { reference: `VND_NIGHT_${vendor._id.toString()}_${dateKey}` }
        ]
      });
      if (existingPayout && ['SUCCESSFUL', 'PROCESSING'].includes(existingPayout.status)) {
        console.log(`[PayoutScheduler] Payout ${reference} already exists with status ${existingPayout.status}. Skipping.`);
        results.push({
          vendorId: vendor._id,
          vendorName,
          amount: balance,
          status: `Skipped - Already ${existingPayout.status}`,
          reference,
          success: existingPayout.status === 'SUCCESSFUL',
        });
        continue;
      }

      // B. Check if another payout is currently in PROCESSING for this vendor
      const activePending = await Payout.findOne({
        providerId: vendor._id,
        status: 'PROCESSING',
      });
      if (activePending) {
        console.warn(`[PayoutScheduler] Vendor ${vendorName} has an ongoing PROCESSING payout (${activePending.reference}). Skipping.`);
        results.push({
          vendorId: vendor._id,
          vendorName,
          amount: balance,
          status: 'Skipped - Active Payout In Progress',
          reference: activePending.reference,
          success: false,
        });
        continue;
      }

      // C. Validate Bank Details
      const accountNumber = vendor.payoutAccount?.accountNumber;
      const bankName = vendor.payoutAccount?.bank || 'Access Bank';
      const bankCode = resolveBankCode(bankName, vendor.payoutAccount?.bankCode);

      if (!accountNumber || String(accountNumber).trim().length < 10) {
        console.warn(`[PayoutScheduler] Vendor ${vendorName} has invalid account number (${accountNumber}). Skipping.`);
        results.push({
          vendorId: vendor._id,
          vendorName,
          amount: balance,
          status: 'Failed - Invalid Account Number',
          success: false,
        });
        continue;
      }

      // D. Verify bank account with Flutterwave
      const verification = await verifyPayoutAccount({ accountNumber, bankCode });
      if (!verification.valid) {
        console.warn(`[PayoutScheduler] Bank account verification failed for ${vendorName}: ${verification.message}`);
        results.push({
          vendorId: vendor._id,
          vendorName,
          amount: balance,
          status: `Failed - Bank Verification: ${verification.message}`,
          success: false,
        });
        continue;
      }

      const accountName = verification.accountName || vendor.payoutAccount?.accountName || vendorName;

      // E. Atomically deduct available balance to prevent concurrent spend
      const updatedVendor = await Vendor.findOneAndUpdate(
        {
          _id: vendor._id,
          'earnings.availableBalance': { $gte: balance },
        },
        {
          $inc: { 'earnings.availableBalance': -balance },
        },
        { new: true }
      );

      if (!updatedVendor) {
        console.warn(`[PayoutScheduler] Vendor ${vendorName} balance changed concurrently. Skipping.`);
        continue;
      }

      // F. Create initial Payout record in PENDING state
      let payoutRecord = await Payout.create({
        providerType: 'Vendor',
        providerId: vendor._id,
        providerName: vendorName,
        amount: balance,
        currency: 'NGN',
        bank: {
          name: bankName,
          code: bankCode,
          accountNumber,
          accountName,
        },
        reference,
        status: 'PENDING',
        narration: `Connecta 24h Vendor Payout - ${vendorName}`,
        cycle: 'daily_vendor',
        initiatedBy,
        processedAt: new Date(),
      });

      // G. Submit transfer to Flutterwave Transfer API
      const transferResult = await initiatePayoutTransfer({
        accountBank: bankCode,
        accountNumber,
        amount: balance,
        narration: `Connecta Payout - ${vendorName}`,
        reference,
        recipientName: accountName,
      });

      // H. Update Payout and Transaction based on Flutterwave result
      payoutRecord.flwTransferId = transferResult.transferId || null;
      payoutRecord.fee = transferResult.fee || 0;
      payoutRecord.flwResponse = transferResult.raw || transferResult.rawError || null;

      if (transferResult.status === 'SUCCESSFUL') {
        // Direct Success
        payoutRecord.status = 'SUCCESSFUL';
        payoutRecord.completedAt = new Date();
        await payoutRecord.save();

        await Transaction.create({
          type: 'Vendor Payout',
          from: 'Connecta Platform Wallet',
          to: `${vendorName} (${bankName} - ${accountNumber})`,
          amount: balance,
          method: 'Bank Transfer',
          status: 'Completed',
          reference,
        });

        try {
          await Notification.create({
            title: 'Daily Payout Successful 🎉',
            message: `Your 24-hour payout of ₦${balance.toLocaleString()} has been sent to your ${bankName} account (${accountNumber}). Ref: ${reference}`,
            type: 'payout',
            recipient: 'vendor',
            read: false,
          });
        } catch (nErr) { /* non-fatal */ }

        totalPaidOut += balance;
        results.push({
          vendorId: vendor._id,
          vendorName,
          amount: balance,
          reference,
          status: 'SUCCESSFUL',
          success: true,
        });

      } else if (transferResult.status === 'PROCESSING') {
        // Queued or Uncertain (Network timeout) -> Awaiting Webhook or Poll
        payoutRecord.status = 'PROCESSING';
        if (transferResult.isUncertain) {
          payoutRecord.failureReason = transferResult.failureReason;
        }
        await payoutRecord.save();

        await Transaction.create({
          type: 'Vendor Payout',
          from: 'Connecta Platform Wallet',
          to: `${vendorName} (${bankName} - ${accountNumber})`,
          amount: balance,
          method: 'Bank Transfer',
          status: 'Pending',
          reference,
        });

        results.push({
          vendorId: vendor._id,
          vendorName,
          amount: balance,
          reference,
          status: 'PROCESSING (Queued on Flutterwave)',
          success: true,
        });

      } else {
        // Explicit Failure from Flutterwave -> Immediately REFUND Provider Balance
        console.warn(`[PayoutScheduler] Flutterwave transfer failed for ${vendorName}: ${transferResult.failureReason}. Refunding balance.`);
        payoutRecord.status = 'FAILED';
        payoutRecord.failureReason = transferResult.failureReason || 'Flutterwave rejected transfer';
        await payoutRecord.save();

        // Refund availableBalance back to vendor
        await Vendor.findByIdAndUpdate(vendor._id, {
          $inc: { 'earnings.availableBalance': balance },
        });

        await Transaction.create({
          type: 'Vendor Payout',
          from: 'Connecta Platform Wallet',
          to: `${vendorName} (${bankName} - ${accountNumber})`,
          amount: balance,
          method: 'Bank Transfer',
          status: 'Failed',
          reference,
        });

        try {
          await Notification.create({
            title: 'Payout Failed & Refunded ⚠️',
            message: `Your payout of ₦${balance.toLocaleString()} could not be processed (${transferResult.failureReason || 'Transfer declined'}). Your balance of ₦${balance.toLocaleString()} was restored.`,
            type: 'payout',
            recipient: 'vendor',
            read: false,
          });
        } catch (nErr) { /* non-fatal */ }

        results.push({
          vendorId: vendor._id,
          vendorName,
          amount: balance,
          reference,
          status: 'FAILED (Balance Refunded)',
          failureReason: transferResult.failureReason,
          success: false,
        });
      }
    }

    lastVendorRun = {
      timestamp: startTime,
      durationMs: Date.now() - startTime.getTime(),
      eligibleCount: eligibleVendors.length,
      processedCount: results.filter(r => r.success).length,
      totalPaidOut,
      isManual,
      initiatedBy,
      results,
    };

    console.log(`[PayoutScheduler] Daily 24-Hour Vendor Payout complete: ${lastVendorRun.processedCount} processed, ₦${totalPaidOut.toLocaleString()} sent.`);
    return {
      success: true,
      cycle: 'daily_vendor',
      dateKey,
      ...lastVendorRun,
    };
  } catch (err) {
    console.error('[PayoutScheduler] Fatal error in processDailyVendorPayouts:', err);
    lastVendorRun = {
      timestamp: startTime,
      durationMs: Date.now() - startTime.getTime(),
      error: err.message,
      success: false,
      isManual,
      initiatedBy,
    };
    return { success: false, cycle: 'daily_vendor', error: err.message };
  } finally {
    isVendorPayoutRunning = false;
  }
};

const processNightlyVendorPayouts = processDailyVendorPayouts;

/**
 * Process Weekly Driver Payouts
 * Timezone: Africa/Lagos (WAT)
 * Scheduled at 23:59 (11:59 PM WAT) every Sunday.
 * 
 * Safety Guarantees:
 * - Releases 7-day matured earnings first.
 * - Concurrency lock prevents duplicate runs.
 * - Idempotency reference DRV_WEEK_{driverId}_{weekKey}.
 * - Bank verification before transfer.
 * - Balance deducted atomically.
 * - Never marked as SUCCESSFUL until Flutterwave confirms it.
 * - If transfer fails, balance is refunded back immediately.
 */
const processWeeklyRiderPayouts = async ({ isManual = false, initiatedBy = 'system' } = {}) => {
  if (isDriverPayoutRunning) {
    console.warn('[PayoutScheduler] Driver payout is already running. Skipping concurrent trigger.');
    return { success: false, message: 'Driver payout job is already in progress' };
  }

  isDriverPayoutRunning = true;
  const startTime = new Date();
  
  // Calculate ISO week identifier (e.g. 2026W38)
  const d = new Date(Date.UTC(startTime.getFullYear(), startTime.getMonth(), startTime.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  const weekKey = `${d.getUTCFullYear()}W${String(weekNo).padStart(2, '0')}`;

  console.log(`[PayoutScheduler] Starting Weekly Driver Payout (Week: ${weekKey}, Type: ${isManual ? 'MANUAL: ' + initiatedBy : 'SCHEDULED'})...`);

  try {
    // 1. Release any 7-day matured earnings from pending to available
    await releaseMaturedDriverEarnings();

    const settings = await Settings.findOne();
    const minThreshold = Number(settings?.payments?.riderMinThreshold || 1000);

    // 2. Find active drivers with eligible availableBalance >= minThreshold
    const eligibleDrivers = await Driver.find({
      status: { $in: ['Active', 'active'] },
      'earnings.availableBalance': { $gte: minThreshold },
    });

    console.log(`[PayoutScheduler] Found ${eligibleDrivers.length} drivers with matured availableBalance >= ₦${minThreshold.toLocaleString()}`);

    const results = [];
    let totalPaidOut = 0;

    for (const driver of eligibleDrivers) {
      const balance = Number(driver.earnings?.availableBalance || 0);
      if (balance < minThreshold) continue;

      const driverName = driver.name || 'Driver';
      const reference = `DRV_WEEK_${driver._id.toString()}_${weekKey}`;

      // A. Check Idempotency for this week
      const existingPayout = await Payout.findOne({ reference });
      if (existingPayout && ['SUCCESSFUL', 'PROCESSING'].includes(existingPayout.status)) {
        console.log(`[PayoutScheduler] Driver payout ${reference} already exists (${existingPayout.status}). Skipping.`);
        results.push({
          driverId: driver._id,
          driverName,
          amount: balance,
          status: `Skipped - Already ${existingPayout.status}`,
          reference,
          success: existingPayout.status === 'SUCCESSFUL',
        });
        continue;
      }

      // B. Check for active PROCESSING payout
      const activePending = await Payout.findOne({
        providerId: driver._id,
        status: 'PROCESSING',
      });
      if (activePending) {
        console.warn(`[PayoutScheduler] Driver ${driverName} has ongoing PROCESSING payout (${activePending.reference}). Skipping.`);
        results.push({
          driverId: driver._id,
          driverName,
          amount: balance,
          status: 'Skipped - Active Payout In Progress',
          reference: activePending.reference,
          success: false,
        });
        continue;
      }

      // C. Validate Bank Details
      const accountNumber = driver.bank?.accountNumber;
      const bankName = driver.bank?.name || 'GTBank';
      const bankCode = resolveBankCode(bankName, driver.bank?.bankCode || driver.bank?.code);

      if (!accountNumber || String(accountNumber).trim().length < 10) {
        console.warn(`[PayoutScheduler] Driver ${driverName} has invalid account number (${accountNumber}). Skipping.`);
        results.push({
          driverId: driver._id,
          driverName,
          amount: balance,
          status: 'Failed - Invalid Account Number',
          success: false,
        });
        continue;
      }

      // D. Verify bank account with Flutterwave
      const verification = await verifyPayoutAccount({ accountNumber, bankCode });
      if (!verification.valid) {
        console.warn(`[PayoutScheduler] Bank verification failed for ${driverName}: ${verification.message}`);
        results.push({
          driverId: driver._id,
          driverName,
          amount: balance,
          status: `Failed - Bank Verification: ${verification.message}`,
          success: false,
        });
        continue;
      }

      const accountName = verification.accountName || driver.bank?.accountName || driverName;

      // E. Atomically deduct available balance
      const updatedDriver = await Driver.findOneAndUpdate(
        {
          _id: driver._id,
          'earnings.availableBalance': { $gte: balance },
        },
        {
          $inc: { 'earnings.availableBalance': -balance },
          $set: { 'earnings.lastPayoutAt': new Date() },
        },
        { new: true }
      );

      if (!updatedDriver) {
        console.warn(`[PayoutScheduler] Driver ${driverName} balance changed concurrently. Skipping.`);
        continue;
      }

      // F. Create initial Payout record in PENDING state
      let payoutRecord = await Payout.create({
        providerType: 'Driver',
        providerId: driver._id,
        providerName: driverName,
        amount: balance,
        currency: 'NGN',
        bank: {
          name: bankName,
          code: bankCode,
          accountNumber,
          accountName,
        },
        reference,
        status: 'PENDING',
        narration: `Connecta Weekly Driver Payout - ${driverName}`,
        cycle: 'weekly_driver',
        initiatedBy,
        processedAt: new Date(),
      });

      // G. Submit transfer to Flutterwave Transfer API
      const transferResult = await initiatePayoutTransfer({
        accountBank: bankCode,
        accountNumber,
        amount: balance,
        narration: `Connecta Rider Payout - ${driverName}`,
        reference,
        recipientName: accountName,
      });

      // H. Update Payout and Transaction
      payoutRecord.flwTransferId = transferResult.transferId || null;
      payoutRecord.fee = transferResult.fee || 0;
      payoutRecord.flwResponse = transferResult.raw || transferResult.rawError || null;

      if (transferResult.status === 'SUCCESSFUL') {
        payoutRecord.status = 'SUCCESSFUL';
        payoutRecord.completedAt = new Date();
        await payoutRecord.save();

        // Mark any eligible unpaidEarnings as paid
        await Driver.updateOne(
          { _id: driver._id },
          { $set: { 'earnings.unpaidEarnings.$[elem].status': 'paid' } },
          { arrayFilters: [{ 'elem.status': 'eligible' }] }
        );

        await Transaction.create({
          type: 'Driver Payout',
          from: 'Connecta Platform Wallet',
          to: `${driverName} (${bankName} - ${accountNumber})`,
          amount: balance,
          method: 'Bank Transfer',
          status: 'Completed',
          reference,
        });

        try {
          await Notification.create({
            title: 'Weekly Payout Successful 🎉',
            message: `Your weekly payout of ₦${balance.toLocaleString()} has been sent to your ${bankName} account (${accountNumber}). Ref: ${reference}`,
            type: 'payout',
            recipient: 'driver',
            read: false,
          });
        } catch (nErr) { /* non-fatal */ }

        totalPaidOut += balance;
        results.push({
          driverId: driver._id,
          driverName,
          amount: balance,
          reference,
          status: 'SUCCESSFUL',
          success: true,
        });

      } else if (transferResult.status === 'PROCESSING') {
        payoutRecord.status = 'PROCESSING';
        if (transferResult.isUncertain) {
          payoutRecord.failureReason = transferResult.failureReason;
        }
        await payoutRecord.save();

        await Transaction.create({
          type: 'Driver Payout',
          from: 'Connecta Platform Wallet',
          to: `${driverName} (${bankName} - ${accountNumber})`,
          amount: balance,
          method: 'Bank Transfer',
          status: 'Pending',
          reference,
        });

        results.push({
          driverId: driver._id,
          driverName,
          amount: balance,
          reference,
          status: 'PROCESSING (Queued on Flutterwave)',
          success: true,
        });

      } else {
        console.warn(`[PayoutScheduler] Driver payout failed for ${driverName}: ${transferResult.failureReason}. Refunding balance.`);
        payoutRecord.status = 'FAILED';
        payoutRecord.failureReason = transferResult.failureReason || 'Flutterwave rejected transfer';
        await payoutRecord.save();

        // REFUND availableBalance back to driver
        await Driver.findByIdAndUpdate(driver._id, {
          $inc: { 'earnings.availableBalance': balance },
        });

        await Transaction.create({
          type: 'Driver Payout',
          from: 'Connecta Platform Wallet',
          to: `${driverName} (${bankName} - ${accountNumber})`,
          amount: balance,
          method: 'Bank Transfer',
          status: 'Failed',
          reference,
        });

        try {
          await Notification.create({
            title: 'Payout Failed & Balance Restored ⚠️',
            message: `Your weekly payout of ₦${balance.toLocaleString()} could not be processed (${transferResult.failureReason}). Your balance was restored.`,
            type: 'payout',
            recipient: 'driver',
            read: false,
          });
        } catch (nErr) { /* non-fatal */ }

        results.push({
          driverId: driver._id,
          driverName,
          amount: balance,
          reference,
          status: 'FAILED (Balance Refunded)',
          failureReason: transferResult.failureReason,
          success: false,
        });
      }
    }

    lastDriverRun = {
      timestamp: startTime,
      durationMs: Date.now() - startTime.getTime(),
      eligibleCount: eligibleDrivers.length,
      processedCount: results.filter(r => r.success).length,
      totalPaidOut,
      isManual,
      initiatedBy,
      results,
    };

    console.log(`[PayoutScheduler] Weekly Driver Payout complete: ${lastDriverRun.processedCount} processed, ₦${totalPaidOut.toLocaleString()} sent.`);
    return {
      success: true,
      cycle: 'weekly_driver',
      weekKey,
      ...lastDriverRun,
    };
  } catch (err) {
    console.error('[PayoutScheduler] Fatal error in processWeeklyRiderPayouts:', err);
    lastDriverRun = {
      timestamp: startTime,
      durationMs: Date.now() - startTime.getTime(),
      error: err.message,
      success: false,
      isManual,
      initiatedBy,
    };
    return { success: false, cycle: 'weekly_driver', error: err.message };
  } finally {
    isDriverPayoutRunning = false;
  }
};

/**
 * Reconciles Payouts stuck in PROCESSING or PENDING state
 * Queries Flutterwave Transfer status and applies confirmation or refund.
 */
const reconcilePendingPayouts = async () => {
  if (isReconciliationRunning) return { success: false, message: 'Reconciliation already running' };
  isReconciliationRunning = true;
  const startTime = new Date();

  try {
    const pendingPayouts = await Payout.find({
      status: 'PROCESSING',
      flwTransferId: { $ne: null },
    }).limit(50);

    let updatedCount = 0;

    for (const payout of pendingPayouts) {
      const flwStatusRes = await checkTransferStatus(payout.flwTransferId);
      if (!flwStatusRes) continue;

      if (flwStatusRes.status === 'SUCCESSFUL') {
        payout.status = 'SUCCESSFUL';
        payout.completedAt = new Date();
        await payout.save();

        await Transaction.findOneAndUpdate(
          { reference: payout.reference },
          { status: 'Completed' }
        );

        updatedCount++;
        console.log(`[PayoutScheduler] Reconciled payout ${payout.reference} as SUCCESSFUL.`);
      } else if (flwStatusRes.status === 'FAILED') {
        payout.status = 'FAILED';
        payout.failureReason = flwStatusRes.completeMessage || 'Flutterwave confirmed failure during reconciliation';
        await payout.save();

        // Refund provider balance
        if (payout.providerType === 'Vendor') {
          await Vendor.findByIdAndUpdate(payout.providerId, {
            $inc: { 'earnings.availableBalance': payout.amount },
          });
        } else if (payout.providerType === 'Driver') {
          await Driver.findByIdAndUpdate(payout.providerId, {
            $inc: { 'earnings.availableBalance': payout.amount },
          });
        }

        await Transaction.findOneAndUpdate(
          { reference: payout.reference },
          { status: 'Failed' }
        );

        updatedCount++;
        console.log(`[PayoutScheduler] Reconciled payout ${payout.reference} as FAILED. Refunded ₦${payout.amount.toLocaleString()}.`);
      }
    }

    lastReconcileRun = {
      timestamp: startTime,
      checkedCount: pendingPayouts.length,
      updatedCount,
    };

    return { success: true, ...lastReconcileRun };
  } catch (err) {
    console.error('[PayoutScheduler] reconcilePendingPayouts error:', err.message);
    return { success: false, error: err.message };
  } finally {
    isReconciliationRunning = false;
  }
};

/**
 * Handle Flutterwave Webhook for transfer.completed
 */
const handleFlutterwaveTransferWebhook = async (webhookPayload) => {
  const data = webhookPayload?.data;
  if (!data) return { success: false, message: 'No data in webhook' };

  const transferId = data.id;
  const reference = data.reference;
  const status = String(data.status || '').toUpperCase(); // SUCCESSFUL, FAILED, REVERSED
  const reason = data.complete_message || data.narration || '';

  console.log(`[PayoutScheduler] Processing transfer webhook for ref ${reference} (Status: ${status}, ID: ${transferId})`);

  const payout = await Payout.findOne({
    $or: [{ reference }, { flwTransferId: transferId }]
  });

  if (!payout) {
    console.warn(`[PayoutScheduler] No payout record found matching reference ${reference} / ID ${transferId}`);
    return { success: false, message: 'Payout not found' };
  }

  // Idempotency check: if already in target status, ignore duplicate webhook
  if (payout.status === status) {
    return { success: true, message: 'Already processed' };
  }

  if (status === 'SUCCESSFUL') {
    payout.status = 'SUCCESSFUL';
    payout.completedAt = new Date();
    await payout.save();

    await Transaction.findOneAndUpdate(
      { reference: payout.reference },
      { status: 'Completed' }
    );

    try {
      await Notification.create({
        title: 'Payout Confirmed 🎉',
        message: `Your payout of ₦${payout.amount.toLocaleString()} has been confirmed and delivered to your bank account. Ref: ${payout.reference}`,
        type: 'payout',
        recipient: payout.providerType.toLowerCase(),
        read: false,
      });
    } catch (e) { /* non-fatal */ }

    return { success: true, status: 'SUCCESSFUL' };

  } else if (status === 'FAILED' || status === 'REVERSED') {
    const previousStatus = payout.status;
    const wasAlreadyRefunded = previousStatus === 'FAILED' || previousStatus === 'REVERSED';

    payout.status = status === 'REVERSED' ? 'REVERSED' : 'FAILED';
    payout.failureReason = reason || `Transfer was ${status.toLowerCase()} by Flutterwave`;
    await payout.save();

    // If balance wasn't already refunded, refund it back to provider
    if (!wasAlreadyRefunded) {
      if (payout.providerType === 'Vendor') {
        await Vendor.findByIdAndUpdate(payout.providerId, {
          $inc: { 'earnings.availableBalance': payout.amount }
        });
      } else if (payout.providerType === 'Driver') {
        await Driver.findByIdAndUpdate(payout.providerId, {
          $inc: { 'earnings.availableBalance': payout.amount }
        });
      }
    }

    await Transaction.findOneAndUpdate(
      { reference: payout.reference },
      { status: 'Failed' }
    );

    try {
      await Notification.create({
        title: `Payout ${status === 'REVERSED' ? 'Reversed' : 'Failed'} ⚠️`,
        message: `Your payout of ₦${payout.amount.toLocaleString()} was ${status.toLowerCase()} by the bank (${reason}). Your balance was refunded back to your account.`,
        type: 'payout',
        recipient: payout.providerType.toLowerCase(),
        read: false,
      });
    } catch (e) { /* non-fatal */ }

    return { success: true, status };
  }

  return { success: true, status: payout.status };
};

/**
 * Returns telemetry and live status of payout schedules and eligibility
 */
const getPayoutScheduleStatus = async () => {
  await releaseMaturedDriverEarnings();

  const settings = await Settings.findOne();
  const vendorThreshold = Number(settings?.payments?.vendorMinThreshold || 5000);
  const riderThreshold = Number(settings?.payments?.riderMinThreshold || 1000);

  const eligibleVendors = await Vendor.find({
    status: { $in: ['Approved', 'approved', 'Active', 'active'] },
    'earnings.availableBalance': { $gte: vendorThreshold },
  });
  const pendingVendorsTotal = eligibleVendors.reduce((sum, v) => sum + (v.earnings?.availableBalance || 0), 0);

  const eligibleDrivers = await Driver.find({
    status: { $in: ['Active', 'active'] },
    'earnings.availableBalance': { $gte: riderThreshold },
  });
  const pendingDriversTotal = eligibleDrivers.reduce((sum, d) => sum + (d.earnings?.availableBalance || 0), 0);

  const recentPayouts = await Payout.find().sort({ createdAt: -1 }).limit(10);

  return {
    timezone: 'Africa/Lagos',
    vendorPayout: {
      cycle: '24_hours',
      scheduleText: 'Every day at 6:00 PM WAT (24-Hour Daily Settlement)',
      cronExpression: '0 18 * * *',
      minThreshold: vendorThreshold,
      eligibleCount: eligibleVendors.length,
      pendingTotalAmount: pendingVendorsTotal,
      lastRun: lastVendorRun,
    },
    riderPayout: {
      cycle: 'weekly',
      scheduleText: 'Every Sunday at 11:59 PM WAT (7-day holding maturity rule)',
      cronExpression: '59 23 * * 0',
      minThreshold: riderThreshold,
      eligibleCount: eligibleDrivers.length,
      pendingTotalAmount: pendingDriversTotal,
      lastRun: lastDriverRun,
    },
    reconciliation: {
      intervalText: 'Every 30 minutes',
      lastRun: lastReconcileRun,
    },
    autoPayoutEnabled: settings?.payments?.autoPayoutEnabled ?? true,
    recentPayouts,
  };
};

/**
 * Initialize Payout Scheduler with node-cron in Africa/Lagos timezone
 */
const initPayoutScheduler = () => {
  console.log('[PayoutScheduler] Initializing automated payout cron jobs (Timezone: Africa/Lagos)...');

  // 1. Vendor 24-Hour Payout: 18:00 (6:00 PM WAT) every day
  if (vendorCronJob) vendorCronJob.stop();
  vendorCronJob = cron.schedule(
    '0 18 * * *',
    async () => {
      console.log('[PayoutScheduler] Cron triggered: Running Daily 24-Hour Vendor Payout (6:00 PM WAT)...');
      await processDailyVendorPayouts({ isManual: false, initiatedBy: 'cron_24h_daily' });
    },
    { scheduled: true, timezone: 'Africa/Lagos' }
  );
  console.log('[PayoutScheduler] ✓ Daily 24-Hour Vendor Payout scheduled (18:00 / 6:00 PM WAT Daily)');

  // 2. Rider Weekly Payout: 23:59 WAT every Sunday
  if (driverCronJob) driverCronJob.stop();
  driverCronJob = cron.schedule(
    '59 23 * * 0',
    async () => {
      console.log('[PayoutScheduler] Cron triggered: Running Weekly Rider Payout (7-day matured earnings)...');
      await processWeeklyRiderPayouts({ isManual: false, initiatedBy: 'cron_weekly' });
    },
    { scheduled: true, timezone: 'Africa/Lagos' }
  );
  console.log('[PayoutScheduler] ✓ Weekly Rider Payout scheduled (23:59 WAT Every Sunday)');

  // 3. Automated Reconciliation Job: Every 30 minutes
  if (reconcileCronJob) reconcileCronJob.stop();
  reconcileCronJob = cron.schedule(
    '*/30 * * * *',
    async () => {
      console.log('[PayoutScheduler] Cron triggered: Running Payout Reconciliation...');
      await reconcilePendingPayouts();
    },
    { scheduled: true, timezone: 'Africa/Lagos' }
  );
  console.log('[PayoutScheduler] ✓ Payout Reconciliation scheduled (Every 30 minutes)');
};

module.exports = {
  releaseMaturedDriverEarnings,
  processDailyVendorPayouts,
  processNightlyVendorPayouts,
  processWeeklyRiderPayouts,
  reconcilePendingPayouts,
  handleFlutterwaveTransferWebhook,
  getPayoutScheduleStatus,
  initPayoutScheduler,
};
