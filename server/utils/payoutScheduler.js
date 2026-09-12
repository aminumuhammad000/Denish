const cron = require('node-cron');
const Vendor = require('../models/Vendor');
const Driver = require('../models/Driver');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const { resolveBankCode, initiatePayoutTransfer } = require('./payoutService');

// In-memory execution logs for status tracking
let lastVendorRun = null;
let lastRiderRun = null;
let vendorCronJob = null;
let riderCronJob = null;

/**
 * Process Nightly Vendor Payouts
 * Runs every night (23:00 WAT) or on manual admin trigger.
 * Gathers all approved vendors with available balance >= minimum threshold,
 * initiates transfers, updates balances, and creates audit records and notifications.
 */
const processNightlyVendorPayouts = async ({ isManual = false, initiatedBy = 'system' } = {}) => {
  console.log(`[PayoutScheduler] Starting Nightly Vendor Payout run (${isManual ? 'MANUAL: ' + initiatedBy : 'SCHEDULED'})...`);
  const startTime = new Date();

  try {
    const settings = await Settings.findOne();
    const minThreshold = Number(settings?.payments?.vendorMinThreshold || settings?.payments?.minThreshold || 5000);

    // Find all approved vendors with balance >= threshold
    const eligibleVendors = await Vendor.find({
      status: { $in: ['Approved', 'approved', 'Active', 'active'] },
      'earnings.availableBalance': { $gte: minThreshold }
    });

    console.log(`[PayoutScheduler] Found ${eligibleVendors.length} eligible vendors with balance >= ₦${minThreshold.toLocaleString()}`);

    const results = [];
    let totalAmount = 0;

    for (const vendor of eligibleVendors) {
      const balance = Number(vendor.earnings?.availableBalance || 0);
      if (balance < minThreshold) continue;

      const bankName = vendor.payoutAccount?.bank || 'Access Bank';
      const accountNumber = vendor.payoutAccount?.accountNumber;

      if (!accountNumber || String(accountNumber).trim().length < 7) {
        console.warn(`[PayoutScheduler] Vendor "${vendor.businessName || vendor.name}" has no valid account number. Skipping.`);
        results.push({
          vendorId: vendor._id,
          vendorName: vendor.businessName || vendor.name,
          amount: balance,
          status: 'Skipped - Missing Account Number',
          success: false,
        });
        continue;
      }

      const bankCode = resolveBankCode(bankName, vendor.payoutAccount?.bankCode);
      const reference = `VND_NIGHT_${Date.now()}_${vendor._id.toString().slice(-4)}`;
      const accountName = vendor.payoutAccount?.accountName || vendor.businessName || vendor.name;

      try {
        const transferResult = await initiatePayoutTransfer({
          accountBank: bankCode,
          accountNumber: accountNumber,
          amount: balance,
          narration: `Denish Nightly Payout - ${vendor.businessName || vendor.name}`,
          reference: reference,
          recipientName: accountName,
        });

        // Deduct available balance
        vendor.earnings = {
          ...(vendor.earnings?.toObject ? vendor.earnings.toObject() : vendor.earnings),
          availableBalance: 0,
        };
        vendor.markModified('earnings');
        await vendor.save();

        // Create transaction record
        const transaction = await Transaction.create({
          type: 'Vendor Payout',
          from: 'Denish Platform Wallet',
          to: `${vendor.businessName || vendor.name} (${bankName} - ${accountNumber})`,
          amount: balance,
          method: 'Bank Transfer',
          status: transferResult.status || 'Completed',
          reference: reference,
        });

        // Create in-app notification
        try {
          await Notification.create({
            title: 'Nightly Payout Processed 🌙',
            message: `Your nightly payout of ₦${balance.toLocaleString()} has been processed and sent to your ${bankName} account (${accountNumber}). Ref: ${reference}`,
            type: 'payout',
            recipient: 'vendor',
            read: false,
          });
        } catch (notifErr) {
          console.warn('[PayoutScheduler] Vendor notification error:', notifErr.message);
        }

        totalAmount += balance;
        results.push({
          vendorId: vendor._id,
          vendorName: vendor.businessName || vendor.name,
          amount: balance,
          bank: `${bankName} (${accountNumber})`,
          reference,
          status: transferResult.status || 'Completed',
          mode: transferResult.mode,
          success: true,
          transactionId: transaction._id,
        });

        console.log(`[PayoutScheduler] Processed nightly payout for "${vendor.businessName || vendor.name}": ₦${balance.toLocaleString()}`);
      } catch (itemErr) {
        console.error(`[PayoutScheduler] Error processing vendor ${vendor._id}:`, itemErr.message);
        results.push({
          vendorId: vendor._id,
          vendorName: vendor.businessName || vendor.name,
          amount: balance,
          status: 'Failed: ' + itemErr.message,
          success: false,
        });
      }
    }

    lastVendorRun = {
      timestamp: startTime,
      durationMs: Date.now() - startTime.getTime(),
      eligibleCount: eligibleVendors.length,
      processedCount: results.filter(r => r.success).length,
      totalAmount,
      isManual,
      initiatedBy,
      results,
    };

    console.log(`[PayoutScheduler] Nightly Vendor Payout complete: ${lastVendorRun.processedCount} processed, ₦${totalAmount.toLocaleString()} paid out.`);

    return {
      success: true,
      cycle: 'nightly',
      processedCount: lastVendorRun.processedCount,
      eligibleCount: eligibleVendors.length,
      totalAmount,
      runDetails: lastVendorRun,
    };
  } catch (err) {
    console.error('[PayoutScheduler] Fatal error in processNightlyVendorPayouts:', err);
    lastVendorRun = {
      timestamp: startTime,
      durationMs: Date.now() - startTime.getTime(),
      error: err.message,
      success: false,
      isManual,
      initiatedBy,
    };
    return {
      success: false,
      cycle: 'nightly',
      error: err.message,
    };
  }
};

/**
 * Process Weekly Rider Payouts
 * Runs weekly on Sunday nights (23:59 WAT) or on manual admin trigger.
 * Gathers all active riders with available balance >= minimum threshold (or > 0),
 * initiates transfers, updates balances, and creates audit records and notifications.
 */
const processWeeklyRiderPayouts = async ({ isManual = false, initiatedBy = 'system' } = {}) => {
  console.log(`[PayoutScheduler] Starting Weekly Rider Payout run (${isManual ? 'MANUAL: ' + initiatedBy : 'SCHEDULED'})...`);
  const startTime = new Date();

  try {
    const settings = await Settings.findOne();
    const minThreshold = Number(settings?.payments?.riderMinThreshold || 1000);

    // Find all active drivers with balance >= threshold
    const eligibleDrivers = await Driver.find({
      status: { $in: ['Active', 'active'] },
      'earnings.availableBalance': { $gte: minThreshold }
    });

    console.log(`[PayoutScheduler] Found ${eligibleDrivers.length} eligible riders with balance >= ₦${minThreshold.toLocaleString()}`);

    const results = [];
    let totalAmount = 0;

    for (const driver of eligibleDrivers) {
      const balance = Number(driver.earnings?.availableBalance || 0);
      if (balance < minThreshold) continue;

      const bankName = driver.bank?.name || 'GTBank';
      const accountNumber = driver.bank?.accountNumber;

      if (!accountNumber || String(accountNumber).trim().length < 7) {
        console.warn(`[PayoutScheduler] Rider "${driver.name}" has no valid account number. Skipping.`);
        results.push({
          driverId: driver._id,
          driverName: driver.name,
          amount: balance,
          status: 'Skipped - Missing Account Number',
          success: false,
        });
        continue;
      }

      const bankCode = resolveBankCode(bankName, driver.bank?.bankCode || driver.bank?.code);
      const reference = `RDR_WEEK_${Date.now()}_${driver._id.toString().slice(-4)}`;
      const accountName = driver.bank?.accountName || driver.name;

      try {
        const transferResult = await initiatePayoutTransfer({
          accountBank: bankCode,
          accountNumber: accountNumber,
          amount: balance,
          narration: `Denish Weekly Rider Payout - ${driver.name}`,
          reference: reference,
          recipientName: accountName,
        });

        // Deduct available balance
        driver.earnings = {
          ...(driver.earnings?.toObject ? driver.earnings.toObject() : driver.earnings),
          availableBalance: 0,
        };
        driver.markModified('earnings');
        await driver.save();

        // Create transaction record
        const transaction = await Transaction.create({
          type: 'Driver Payout',
          from: 'Denish Platform Wallet',
          to: `${driver.name} (${bankName} - ${accountNumber})`,
          amount: balance,
          method: 'Bank Transfer',
          status: transferResult.status || 'Completed',
          reference: reference,
        });

        // Create in-app notification
        try {
          await Notification.create({
            title: 'Weekly Payout Processed 🎉',
            message: `Your weekly payout of ₦${balance.toLocaleString()} has been processed and sent to your ${bankName} account (${accountNumber}). Ref: ${reference}`,
            type: 'payout',
            recipient: 'driver',
            read: false,
          });
        } catch (notifErr) {
          console.warn('[PayoutScheduler] Driver notification error:', notifErr.message);
        }

        totalAmount += balance;
        results.push({
          driverId: driver._id,
          driverName: driver.name,
          amount: balance,
          bank: `${bankName} (${accountNumber})`,
          reference,
          status: transferResult.status || 'Completed',
          mode: transferResult.mode,
          success: true,
          transactionId: transaction._id,
        });

        console.log(`[PayoutScheduler] Processed weekly payout for rider "${driver.name}": ₦${balance.toLocaleString()}`);
      } catch (itemErr) {
        console.error(`[PayoutScheduler] Error processing rider ${driver._id}:`, itemErr.message);
        results.push({
          driverId: driver._id,
          driverName: driver.name,
          amount: balance,
          status: 'Failed: ' + itemErr.message,
          success: false,
        });
      }
    }

    lastRiderRun = {
      timestamp: startTime,
      durationMs: Date.now() - startTime.getTime(),
      eligibleCount: eligibleDrivers.length,
      processedCount: results.filter(r => r.success).length,
      totalAmount,
      isManual,
      initiatedBy,
      results,
    };

    console.log(`[PayoutScheduler] Weekly Rider Payout complete: ${lastRiderRun.processedCount} processed, ₦${totalAmount.toLocaleString()} paid out.`);

    return {
      success: true,
      cycle: 'weekly',
      processedCount: lastRiderRun.processedCount,
      eligibleCount: eligibleDrivers.length,
      totalAmount,
      runDetails: lastRiderRun,
    };
  } catch (err) {
    console.error('[PayoutScheduler] Fatal error in processWeeklyRiderPayouts:', err);
    lastRiderRun = {
      timestamp: startTime,
      durationMs: Date.now() - startTime.getTime(),
      error: err.message,
      success: false,
      isManual,
      initiatedBy,
    };
    return {
      success: false,
      cycle: 'weekly',
      error: err.message,
    };
  }
};

/**
 * Get current Payout Schedules and Live Status
 */
const getPayoutScheduleStatus = async () => {
  const settings = await Settings.findOne();
  const vendorThreshold = Number(settings?.payments?.vendorMinThreshold || 5000);
  const riderThreshold = Number(settings?.payments?.riderMinThreshold || 1000);

  // Pending counts and amounts
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

  return {
    vendorPayout: {
      cycle: 'nightly',
      scheduleText: 'Every night at 11:00 PM WAT (Daily)',
      cronExpression: '0 23 * * *',
      minThreshold: vendorThreshold,
      pendingCount: eligibleVendors.length,
      pendingTotalAmount: pendingVendorsTotal,
      lastRun: lastVendorRun,
    },
    riderPayout: {
      cycle: 'weekly',
      scheduleText: 'Every Sunday at 11:59 PM WAT (Weekly)',
      cronExpression: '59 23 * * 0',
      minThreshold: riderThreshold,
      pendingCount: eligibleDrivers.length,
      pendingTotalAmount: pendingDriversTotal,
      lastRun: lastRiderRun,
    },
    autoPayoutEnabled: settings?.payments?.autoPayoutEnabled ?? true,
    timezone: 'Africa/Lagos',
  };
};

/**
 * Initialize Payout Scheduler with node-cron
 */
const initPayoutScheduler = () => {
  console.log('[PayoutScheduler] Initializing automated payout cron jobs...');

  // 1. Vendor Nightly Payout: 23:00 WAT every day
  // Cron: '0 23 * * *' (Minute 0, Hour 23, everyday)
  if (vendorCronJob) vendorCronJob.stop();
  vendorCronJob = cron.schedule(
    '0 23 * * *',
    async () => {
      console.log('[PayoutScheduler] Cron triggered: Running Nightly Vendor Payout...');
      await processNightlyVendorPayouts({ isManual: false, initiatedBy: 'cron_nightly' });
    },
    {
      scheduled: true,
      timezone: 'Africa/Lagos',
    }
  );
  console.log('[PayoutScheduler] ✓ Nightly Vendor Payout scheduled (Daily at 23:00 WAT / 11:00 PM)');

  // 2. Rider Weekly Payout: 23:59 WAT every Sunday
  // Cron: '59 23 * * 0' (Minute 59, Hour 23, Day 0 = Sunday)
  if (riderCronJob) riderCronJob.stop();
  riderCronJob = cron.schedule(
    '59 23 * * 0',
    async () => {
      console.log('[PayoutScheduler] Cron triggered: Running Weekly Rider Payout...');
      await processWeeklyRiderPayouts({ isManual: false, initiatedBy: 'cron_weekly' });
    },
    {
      scheduled: true,
      timezone: 'Africa/Lagos',
    }
  );
  console.log('[PayoutScheduler] ✓ Weekly Rider Payout scheduled (Every Sunday at 23:59 WAT / 11:59 PM)');
};

module.exports = {
  processNightlyVendorPayouts,
  processWeeklyRiderPayouts,
  getPayoutScheduleStatus,
  initPayoutScheduler,
};
