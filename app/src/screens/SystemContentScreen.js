import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchSystemContent } from '../services/api';

const TOS_CONTENT = `TERMS OF SERVICE AND PRIVACY POLICY
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
• Rider Guidelines: Riders must utilize approved vehicles
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
•
Support Email: support@denishng.com
DPO Direct Email: denishlimited@gmail.com
Phone: 08036301983`;

const PRIVACY_CONTENT = `TERMS OF SERVICE AND PRIVACY POLICY
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
• Payment Data: Transaction history and records (note: sensitive
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
•
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
•
Support Email: support@denishng.com
DPO Direct Email: denishlimited@gmail.com
Phone: 08036301983`;

const SUPPORT_CONTENT = `If you need support, have questions, or require assistance with using the Denish app or your account, please reach out to us using our contact information below.

Company Legal Name: Denish Limited (RC: 9462857)
Registered Address: Plot 3 Block B, ADP Premises Agric GRA, Ilorin, Kwara State, Nigeria
Support Contact: support@denishng.com / 08036301983
Data Protection Officer (DPO) Email: denishlimited@gmail.com`;

const SystemContentScreen = ({ navigation, route }) => {
  const { key, title } = route.params;
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let contentStr = "";
    if (key === "terms_of_service") {
      contentStr = TOS_CONTENT;
    } else if (key === "privacy_policy") {
      contentStr = PRIVACY_CONTENT;
    } else {
      contentStr = SUPPORT_CONTENT;
    }

    setContentData({
      title: title,
      content: contentStr,
      contactEmail: "support@denishng.com",
      contactPhone: "08036301983"
    });
  }, [key]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{contentData?.title || title || 'Information'}</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FF7A00" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.contentText}>
              {contentData?.content || 'No content available.'}
            </Text>

            {key === 'help_and_support' && (
              <View style={styles.contactContainer}>
                <Text style={styles.contactHeader}>Contact Us</Text>
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="email-outline" size={22} color="#FF7A00" />
                  <Text style={styles.contactValue}>{contentData?.contactEmail || 'support@denish.com'}</Text>
                </View>
                <View style={styles.contactRow}>
                  <MaterialCommunityIcons name="phone-outline" size={22} color="#FF7A00" />
                  <Text style={styles.contactValue}>{contentData?.contactPhone || '+234 800 336 4741'}</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  backBtn: { padding: 4 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  contentText: { fontSize: 15, color: '#4A4A4A', lineHeight: 24 },
  contactContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#EAEAEA',
  },
  contactHeader: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  contactValue: { fontSize: 15, color: '#1A1A1A', fontWeight: '500' }
});

export default SystemContentScreen;
