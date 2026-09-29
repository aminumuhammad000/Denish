const dotenv = require('dotenv');
dotenv.config();

const { resolveBankCode, verifyPayoutAccount, initiatePayoutTransfer } = require('./utils/payoutService');

async function directPayout({
  accountNumber = '8100015498',
  bankName = 'OPay',
  accountName = 'Aminu Muhammad',
  amount = 1000,
  narration = 'Denish Instant Payout',
} = {}) {
  console.log('==================================================');
  console.log('       DENISH DIRECT & INSTANT PAYOUT TEST        ');
  console.log('==================================================');
  console.log(`Recipient:       ${accountName}`);
  console.log(`Bank:            ${bankName}`);
  console.log(`Account Number:  ${accountNumber}`);
  console.log(`Amount:          ₦${Number(amount).toLocaleString()}`);
  console.log(`Narration:       ${narration}`);
  console.log('--------------------------------------------------');

  const bankCode = resolveBankCode(bankName);
  console.log(`[1] Resolved Bank Code: ${bankCode} (${bankName})`);

  console.log(`[2] Verifying account details with Flutterwave...`);
  const verifyRes = await verifyPayoutAccount({ accountNumber, bankCode });
  console.log('    Verification result:', verifyRes.valid ? '✓ VALID' : '✗ INVALID', `(${verifyRes.accountName || verifyRes.message || 'No name returned'})`);

  const reference = `DENISH_DIRECT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  console.log(`[3] Initiating direct transfer with reference: ${reference}...`);

  const transferResult = await initiatePayoutTransfer({
    accountBank: bankCode,
    accountNumber: accountNumber,
    amount: Number(amount),
    narration: `${narration} - ${accountName}`,
    reference: reference,
    recipientName: accountName,
  });

  console.log('--------------------------------------------------');
  console.log('TRANSFER OUTCOME:');
  console.log(JSON.stringify(transferResult, null, 2));
  console.log('==================================================');

  return transferResult;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const accountNumber = args[0] || '8100015498';
  const bankName = args[1] || 'OPay';
  const accountName = args[2] || 'Aminu Muhammad';
  const amount = Number(args[3]) || 1000;

  directPayout({ accountNumber, bankName, accountName, amount });
}

module.exports = { directPayout };
