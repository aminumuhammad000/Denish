import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Order {
  id: string;
  customer: string;
  address: string;
  items: number;
  total: string;
  commission: string;
  vendor: string;
  status: string;
  date: string;
}

export interface Driver {
  id: string;
  name: string;
  location: string;
  phone: string;
  vehicle: string;
  deliveries: number;
  rating: number;
  completion: string;
  status: "Online" | "Delivering" | "Offline";
  earnings: string;
  isWarned?: boolean;
  isSuspended?: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  status: "approved" | "suspended" | "pending";
  orders: number;
  revenue: string;
  rating: number;
  image: string;
  commissionRate?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Customer" | "Vendor" | "Driver";
  status: "Active" | "Suspended";
  orders: number;
  spentEarned: string;
  rating: number;
  complaints: number;
  lastActive: string;
  isWarned?: boolean;
}

export interface Dispute {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "escalated" | "resolved" | "closed";
  complaintId: string;
  orderId: string;
  from: string;
  against: string;
  messageCount: number;
}

export interface Transaction {
  id: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  method: string;
  status: "Completed" | "Pending" | "Failed";
  date: string;
}

// Initial Datasets
const initialOrders: Order[] = [
  { id: "ORD-001", customer: "Aisha Mohammed", address: "12 Marina Road, Lagos", items: 2, total: "₦8,000", commission: "₦1,200", vendor: "Mama's Kitchen", status: "preparing", date: "10/04/2026" },
  { id: "ORD-002", customer: "Babajide Sanwo", address: "45 Bourdillon Road, Ikoyi", items: 3, total: "₦12,500", commission: "₦1,875", vendor: "Mama's Kitchen", status: "pending", date: "10/04/2026" },
  { id: "ORD-003", customer: "Chioma Nwachukwu", address: "88 Allen Avenue, Ikeja", items: 1, total: "₦4,500", commission: "₦675", vendor: "Mama's Kitchen", status: "confirmed", date: "10/04/2026" },
  { id: "ORD-004", customer: "Danjuma Garba", address: "55 Gwarinpa Estate, Abuja", items: 4, total: "₦18,000", commission: "₦2,700", vendor: "Mama's Kitchen", status: "picked up", date: "10/04/2026" },
  { id: "ORD-005", customer: "Fatimah Yusuf", address: "10 Yakubu Gowon Way, Kano", items: 2, total: "₦6,400", commission: "₦960", vendor: "Mama's Kitchen", status: "ready", date: "10/04/2026" },
  { id: "ORD-006", customer: "Emeka Okafor", address: "14 Asajon Way, Sangotedo", items: 2, total: "₦9,000", commission: "₦1,350", vendor: "Mama's Kitchen", status: "delivered", date: "10/04/2026" },
  { id: "ORD-007", customer: "Yusuf Isa", address: "102 Airport Road, Ilorin", items: 1, total: "₦3,200", commission: "₦480", vendor: "Mama's Kitchen", status: "cancelled", date: "10/04/2026" }
];

const initialDrivers: Driver[] = [
  { id: "DRV-001", name: "Bayo Adeyemi", location: "Lagos Island", phone: "08137284828", vehicle: "Motorcycle", deliveries: 342, rating: 4.8, completion: "96%", status: "Online", earnings: "₦825,000" },
  { id: "DRV-002", name: "Emeka Nwosu", location: "Lagos Island", phone: "08137284828", vehicle: "Motorcycle", deliveries: 342, rating: 4.8, completion: "96%", status: "Delivering", earnings: "₦825,000" },
  { id: "DRV-003", name: "Ibrahim Suleiman", location: "Lagos Island", phone: "08137284828", vehicle: "Motorcycle", deliveries: 342, rating: 4.8, completion: "96%", status: "Offline", earnings: "₦825,000" },
  { id: "DRV-004", name: "Bisi Akande", location: "Lagos Island", phone: "08137284828", vehicle: "Motorcycle", deliveries: 342, rating: 4.8, completion: "96%", status: "Online", earnings: "₦825,000" },
  { id: "DRV-005", name: "Chinedu Obi", location: "Lagos Island", phone: "08137284828", vehicle: "Motorcycle", deliveries: 342, rating: 4.8, completion: "96%", status: "Delivering", earnings: "₦825,000" },
  { id: "DRV-006", name: "Musa Garba", location: "Lagos Island", phone: "08137284828", vehicle: "Motorcycle", deliveries: 342, rating: 4.8, completion: "96%", status: "Offline", earnings: "₦825,000" },
  { id: "DRV-007", name: "Tunde Bakare", location: "Lagos Island", phone: "08137284828", vehicle: "Motorcycle", deliveries: 342, rating: 4.8, completion: "96%", status: "Online", earnings: "₦825,000" },
  { id: "DRV-008", name: "Uche Okoye", location: "Lagos Island", phone: "08137284828", vehicle: "Motorcycle", deliveries: 342, rating: 4.8, completion: "96%", status: "Delivering", earnings: "₦825,000" }
];

const initialVendors: Vendor[] = [
  { id: "V-001", name: "Mama's Kitchen", category: "Local Dishes", status: "approved", orders: 180, revenue: "₦113k", rating: 4.8, image: "/images/Vendor_management_images/mama's kitchen.png", commissionRate: 15 },
  { id: "V-002", name: "Green Farm", category: "Fresh Farm Foods", status: "approved", orders: 180, revenue: "₦113k", rating: 4.8, image: "/images/Vendor_management_images/green_farm.png", commissionRate: 15 },
  { id: "V-003", name: "Fresh Bites", category: "Healthy Bowls", status: "approved", orders: 180, revenue: "₦113k", rating: 4.8, image: "/images/Vendor_management_images/fresh_bites.png", commissionRate: 15 },
  { id: "V-004", name: "The Juice Bar", category: "Fresh Fruit", status: "approved", orders: 180, revenue: "₦113k", rating: 4.8, image: "/images/Vendor_management_images/the_juice_bar.png", commissionRate: 15 },
  { id: "V-005", name: "Giant Farm", category: "Fresh Farm Foods", status: "approved", orders: 180, revenue: "₦113k", rating: 4.8, image: "/images/Vendor_management_images/giant_farm.png", commissionRate: 15 },
  { id: "V-006", name: "Hash Provisions", category: "Grocery Store", status: "approved", orders: 180, revenue: "₦113k", rating: 4.8, image: "/images/Vendor_management_images/hash_provisions.png", commissionRate: 15 }
];

const initialUsers: User[] = [
  { id: "USR-001", name: "Aisha Mohammed", email: "aisha@email.com", phone: "+2348123345532", role: "Customer", status: "Active", orders: 34, spentEarned: "₦135,000", rating: 4.8, complaints: 0, lastActive: "Today" },
  { id: "USR-002", name: "Chidi Okafor", email: "chidi@email.com", phone: "+2348123345532", role: "Customer", status: "Active", orders: 34, spentEarned: "₦135,000", rating: 4.8, complaints: 1, lastActive: "Apr 5" },
  { id: "USR-003", name: "Fatima o", email: "fatima@email.com", phone: "+2348123345532", role: "Customer", status: "Suspended", orders: 34, spentEarned: "₦135,000", rating: 4.8, complaints: 0, lastActive: "Apr 4" },
  { id: "USR-004", name: "Mama's Kitchen", email: "mamas@email.com", phone: "+2348123345532", role: "Vendor", status: "Active", orders: 34, spentEarned: "₦135,000", rating: 4.8, complaints: 4, lastActive: "Thur" },
  { id: "USR-005", name: "Bayo Adeyemi", email: "bayo@email.com", phone: "+2348123345532", role: "Driver", status: "Active", orders: 34, spentEarned: "-", rating: 4.8, complaints: 0, lastActive: "Mon" },
  { id: "USR-006", name: "Bayo Adeyemi", email: "bayo2@email.com", phone: "+2348123345532", role: "Driver", status: "Active", orders: 34, spentEarned: "-", rating: 4.8, complaints: 0, lastActive: "Mon" }
];

const initialDisputes: Dispute[] = [
  { id: "1", title: "Cold food Received", priority: "high", status: "investigating", description: "My jollof was completely cold when it arrived. The delivery took over 1 hour.", complaintId: "CMP-001", orderId: "ORD-001", from: "Aisha Mohammed (customer)", against: "Mama's Kitchen", messageCount: 3 },
  { id: "2", title: "Missing suya sides", priority: "medium", status: "open", description: "I ordered suya platter with extra onions and pepper. The sides were missing.", complaintId: "CMP-002", orderId: "ORD-002", from: "Chidi Okafor (customer)", against: "Grill House", messageCount: 1 },
  { id: "3", title: "Rude delivery driver", priority: "high", status: "open", description: "The driver was very rude and refused to come to my door.", complaintId: "CMP-003", orderId: "ORD-003", from: "Kola Adeleke (customer)", against: "Bayo Adeyemi", messageCount: 1 },
  { id: "4", title: "Charged more than listed price", priority: "low", status: "resolved", description: "The fried rice was listed at N2,200 but I was charged N2,500", complaintId: "CMP-004", orderId: "ORD-004", from: "Fatima Bello (customer)", against: "Mama's Kitchen", messageCount: 2 },
  { id: "5", title: "Driver delayed pickup", priority: "critical", status: "escalated", description: "Driver arrived 45 minutes late to pick up the order, causing customer complaint", complaintId: "CMP-005", orderId: "ORD-005", from: "Fresh Bites (customer)", against: "Emeka Nwosu", messageCount: 2 }
];

const initialTransactions: Transaction[] = [
  { id: "TXN-001", type: "Order Payment", from: "Aisha Mohammed", to: "Platform", amount: "₦12,000", method: "Card", status: "Completed", date: "2026-04-10" },
  { id: "TXN-002", type: "Vendor Payout", from: "Platform", to: "Mama's Kitchen", amount: "₦8,500", method: "Bank Transfer", status: "Completed", date: "2026-04-10" },
  { id: "TXN-003", type: "Driver Payout", from: "Platform", to: "Bayo Adeyemi", amount: "₦1,500", method: "Bank Transfer", status: "Pending", date: "2026-04-10" },
  { id: "TXN-004", type: "Order Payment", from: "Chidi Okafor", to: "Platform", amount: "₦4,500", method: "Card", status: "Failed", date: "2026-04-10" },
  { id: "TXN-005", type: "Order Payment", from: "Chidi Okafor", to: "Platform", amount: "₦4,500", method: "Card", status: "Failed", date: "2026-04-10" }
];

interface AdminState {
  orders: Order[];
  drivers: Driver[];
  vendors: Vendor[];
  users: User[];
  disputes: Dispute[];
  transactions: Transaction[];
  banners: any[];
  promotions: any[];

  // Setters/Updaters
  setOrders: (orders: Order[]) => void;
  updateOrder: (updatedOrder: Order) => void;
  setDrivers: (drivers: Driver[]) => void;
  updateDriver: (updatedDriver: Driver) => void;
  setVendors: (vendors: Vendor[]) => void;
  updateVendor: (updatedVendor: Vendor) => void;
  setUsers: (users: User[]) => void;
  updateUser: (updatedUser: User) => void;
  setDisputes: (disputes: Dispute[]) => void;
  updateDispute: (updatedDispute: Dispute) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (newTransaction: Transaction) => void;

  // Async Fetchers
  fetchStats: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchDrivers: () => Promise<void>;
  fetchVendors: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchDisputes: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchAllData: () => Promise<void>;

  // Async Updaters

  updateVendorOnServer: (id: string, updatedData: Partial<Vendor>) => Promise<void>;
  updateVendorStatusOnServer: (id: string, status: string) => Promise<void>;

  updateDriverStatusOnServer: (id: string, status: string) => Promise<void>;
  updateUserStatusOnServer: (id: string, status: string) => Promise<void>;
  updateDisputeStatusOnServer: (id: string, status: string) => Promise<void>;
  addTransactionOnServer: (transaction: Transaction) => Promise<void>;
  updateOrderOnServer: (id: string, updatedData: Partial<Order>) => Promise<void>;
  updateSettingsOnServer: (updatedSettings: any) => Promise<void>;
  addBannerOnServer: (bannerData: any) => Promise<void>;
  updateBannerOnServer: (id: string, bannerData: any) => Promise<void>;
  deleteBannerOnServer: (id: string) => Promise<void>;
  addPromotionOnServer: (promoData: any) => Promise<void>;
  updatePromotionOnServer: (id: string, promoData: any) => Promise<void>;
  deletePromotionOnServer: (id: string) => Promise<void>;
  updateProfileOnServer: (profileData: any) => Promise<void>;
  admin: { name: string; email: string; image: string } | null;
  fetchAdminProfile: () => Promise<void>;
}


const API_BASE_URL = "https://denish-production.up.railway.app/api/admin";


export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      orders: initialOrders,
      drivers: initialDrivers,
      vendors: initialVendors,
      users: initialUsers,
      disputes: initialDisputes,
      transactions: initialTransactions,
      banners: [],
      promotions: [],

      setOrders: (orders) => set({ orders }),
      updateOrder: (updatedOrder) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
        })),
      setDrivers: (drivers) => set({ drivers }),
      updateDriver: (updatedDriver) =>
        set((state) => ({
          drivers: state.drivers.map((d) => (d.id === updatedDriver.id ? updatedDriver : d)),
        })),
      setVendors: (vendors) => set({ vendors }),
      updateVendor: (updatedVendor) =>
        set((state) => ({
          vendors: state.vendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)),
        })),
      setUsers: (users) => set({ users }),
      updateUser: (updatedUser) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        })),
      setDisputes: (disputes) => set({ disputes }),
      updateDispute: (updatedDispute) =>
        set((state) => ({
          disputes: state.disputes.map((d) => (d.id === updatedDispute.id ? updatedDispute : d)),
        })),
      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (newTransaction) =>
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        })),

      // Async Fetchers implementation
      fetchStats: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/stats`);
          const data = await response.json();
          if (data.success) {
            // Stats are used directly from the data properties in the component
            // We could store them in the state if needed, but the components currently compute them from the lists
          }
        } catch (error) {
          console.error("Failed to fetch stats:", error);
        }
      },
      fetchOrders: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/orders`);
          const data = await response.json();
          if (data.success) {
            const formattedOrders: Order[] = data.orders.map((o: any) => ({
              id: o._id,
              customer: o.customerName || "Unknown",
              address: o.address || "N/A",
              items: o.items?.length || 0,
              total: "₦" + (o.total || 0).toLocaleString(),
              commission: "₦" + ((o.total || 0) * 0.1).toLocaleString(), // Example 10%
              vendor: o.vendorName || "Unknown",
              status: o.status || "pending",
              date: new Date(o.createdAt).toLocaleDateString(),
            }));
            set({ orders: formattedOrders });
          }
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        }
      },
      fetchDrivers: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/drivers`);
          const data = await response.json();
          if (data.success) {
            const formattedDrivers: Driver[] = data.drivers.map((d: any) => ({
              id: d._id,
              name: d.name,
              location: d.location || "Lagos",
              phone: d.phone,
              vehicle: d.vehicleType || "Motorcycle",
              deliveries: d.deliveriesCount || 0,
              rating: d.rating || 0,
              completion: "100%",
              status: d.status || "Offline",
              earnings: "₦" + (d.earnings || 0).toLocaleString(),
            }));
            set({ drivers: formattedDrivers });
          }
        } catch (error) {
          console.error("Failed to fetch drivers:", error);
        }
      },
      fetchVendors: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/vendors`);
          const data = await response.json();
          if (data.success) {
            const formattedVendors: Vendor[] = data.vendors.map((v: any) => ({
              id: v._id,
              name: v.businessName || v.name,
              category: v.category || "General",
              status: v.status || "pending",
              orders: v.ordersCount || 0,
              revenue: "₦" + (v.revenue || 0).toLocaleString(),
              rating: v.rating || 0,
              image: v.image || "/images/Vendor_management_images/mama's kitchen.png",
              commissionRate: v.commissionRate || 15,
            }));
            set({ vendors: formattedVendors });
          }
        } catch (error) {
          console.error("Failed to fetch vendors:", error);
        }
      },
      fetchUsers: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/users`);
          const data = await response.json();
          if (data.success) {
            const formattedUsers: User[] = data.users.map((u: any) => ({
              id: u._id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              role: "Customer",
              status: u.status || "Active",
              orders: u.ordersCount || 0,
              spentEarned: "₦" + (u.totalSpent || 0).toLocaleString(),
              rating: u.rating || 5,
              complaints: 0,
              lastActive: "Today",
            }));
            set({ users: formattedUsers });
          }
        } catch (error) {
          console.error("Failed to fetch users:", error);
        }
      },
      fetchDisputes: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/disputes`);
          const data = await response.json();
          if (data.success) {
            set({
              disputes: data.disputes.map((d: any) => ({
                id: d._id,
                ...d
              }))
            });
          }
        } catch (error) {
          console.error("Failed to fetch disputes:", error);
        }
      },
      fetchTransactions: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/transactions`);
          const data = await response.json();
          if (data.success) {
            set({
              transactions: data.transactions.map((t: any) => ({
                id: t._id,
                ...t,
                amount: "₦" + t.amount.toLocaleString(),
                date: new Date(t.createdAt).toLocaleDateString(),
              }))
            });
          }
        } catch (error) {
          console.error("Failed to fetch transactions:", error);
        }
      },
      fetchAllData: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/all-data`);
          const data = await response.json();
          if (data.success) {
            const { orders, vendors, drivers, users, transactions, disputes, banners, promotions } = data.data;

            // Format orders
            const formattedOrders: Order[] = orders.map((o: any) => ({
              id: o._id,
              customer: o.customerName || "Unknown",
              address: o.address || "N/A",
              items: o.items?.length || 0,
              total: "₦" + (o.total || 0).toLocaleString(),
              commission: "₦" + ((o.total || 0) * 0.1).toLocaleString(),
              vendor: o.vendorName || "Unknown",
              status: o.status || "pending",
              date: new Date(o.createdAt).toLocaleDateString(),
            }));

            // Format drivers
            const formattedDrivers: Driver[] = drivers.map((d: any) => ({
              id: d._id,
              name: d.name,
              location: d.location || "Lagos",
              phone: d.phone,
              vehicle: d.vehicleType || "Motorcycle",
              deliveries: d.deliveriesCount || 0,
              rating: d.rating || 0,
              completion: "100%",
              status: d.status || "Offline",
              earnings: "₦" + (d.earnings || 0).toLocaleString(),
            }));

            // Format vendors
            const formattedVendors: Vendor[] = vendors.map((v: any) => ({
              id: v._id,
              name: v.businessName || v.name,
              category: v.category || "General",
              status: v.status || "pending",
              orders: v.ordersCount || 0,
              revenue: "₦" + (v.revenue || 0).toLocaleString(),
              rating: v.rating || 0,
              image: v.image || "/images/Vendor_management_images/mama's kitchen.png",
              commissionRate: v.commissionRate || 15,
            }));

            // Format users
            const formattedUsers: User[] = users.map((u: any) => ({
              id: u._id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              role: (u.role || "Customer") as User["role"],
              status: (u.status || "Active") as User["status"],
              orders: u.ordersCount || 0,
              spentEarned: "₦" + (u.totalSpent || 0).toLocaleString(),
              rating: u.rating || 5,
              complaints: 0,
              lastActive: "Today",
            }));


            set({
              orders: formattedOrders,
              drivers: formattedDrivers,
              vendors: formattedVendors,
              users: formattedUsers,
              transactions: transactions.map((t: any) => ({ id: t._id, ...t })),
              disputes: disputes.map((d: any) => ({ id: d._id, ...d })),
              banners: (banners || []).map((b: any) => ({ id: b._id, ...b })),
              promotions: (promotions || []).map((p: any) => ({ id: p._id, ...p })),
            });
          }
        } catch (error) {
          console.error("Failed to fetch all data:", error);
        }
      },


      updateVendorStatusOnServer: async (id, status) => {
        try {
          const response = await fetch(`${API_BASE_URL}/vendors/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
          if (response.ok) {
            get().fetchVendors();
          }
        } catch (error) {
          console.error("Failed to update vendor status:", error);
        }
      },
      updateDriverStatusOnServer: async (id, status) => {
        try {
          const response = await fetch(`${API_BASE_URL}/drivers/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
          if (response.ok) {
            get().fetchDrivers();
          }
        } catch (error) {
          console.error("Failed to update driver status:", error);
        }
      },
      updateUserStatusOnServer: async (id: string, status: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/user/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
          if (response.ok) {
            set((state) => ({
              users: state.users.map((u) => (u.id === id ? { ...u, status: status as User["status"] } : u)),
            }));
          }
        } catch (error) {
          console.error("Error updating user status:", error);
        }
      },
      updateVendorOnServer: async (id: string, updatedData: Partial<Vendor>) => {
        try {
          const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
          });
          if (response.ok) {
            set((state) => ({
              vendors: state.vendors.map((v) =>
                v.id === id ? { ...v, ...updatedData } : v,
              ),
            }));
          }
        } catch (err) {
          console.error("Failed to update vendor:", err);
        }
      },

      updateDisputeStatusOnServer: async (id: string, status: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/dispute/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
          if (response.ok) {
            set((state) => ({
              disputes: state.disputes.map((d) => (d.id === id ? { ...d, status: status as Dispute["status"] } : d)),
            }));
          }
        } catch (error) {
          console.error("Error updating dispute status:", error);
        }
      },
      addTransactionOnServer: async (transaction: Transaction) => {
        try {
          const response = await fetch(`${API_BASE_URL}/transaction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transaction),
          });
          if (response.ok) {
            const newTxn = await response.json();
            set((state) => ({
              transactions: [newTxn, ...state.transactions],
            }));
          }
        } catch (error) {
          console.error("Error adding transaction:", error);
        }
      },
      updateOrderOnServer: async (id: string, updatedData: Partial<Order>) => {
        try {
          const response = await fetch(`${API_BASE_URL}/order/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
          });
          if (response.ok) {
            set((state) => ({
              orders: state.orders.map((o) => (o.id === id ? { ...o, ...updatedData } : o)),
            }));
          }
        } catch (error) {
          console.error("Error updating order:", error);
        }
      },
      updateSettingsOnServer: async (updatedSettings: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/settings`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedSettings),
          });
          if (response.ok) {
            // Update local state if needed (usually handled by re-fetching all data)
          }
        } catch (error) {
          console.error("Error updating settings:", error);
        }
      },
      addBannerOnServer: async (bannerData: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/banners`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bannerData),
          });
          if (response.ok) {
            // Refetch or update local
          }
        } catch (error) {
          console.error("Error adding banner:", error);
        }
      },
      updateBannerOnServer: async (id: string, bannerData: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bannerData),
          });
          if (response.ok) {
            // Refetch or update local
          }
        } catch (error) {
          console.error("Error updating banner:", error);
        }
      },
      deleteBannerOnServer: async (id: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            // Refetch or update local
          }
        } catch (error) {
          console.error("Error deleting banner:", error);
        }
      },
      addPromotionOnServer: async (promoData: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/promotions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(promoData),
          });
          if (response.ok) {
            // Refetch or update local
          }
        } catch (error) {
          console.error("Error adding promotion:", error);
        }
      },
      updatePromotionOnServer: async (id: string, promoData: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(promoData),
          });
          if (response.ok) {
            // Refetch or update local
          }
        } catch (error) {
          console.error("Error updating promotion:", error);
        }
      },
      deletePromotionOnServer: async (id: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            // Refetch or update local
          }
        } catch (error) {
          console.error("Error deleting promotion:", error);
        }
      },
      updateProfileOnServer: async (profileData: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData),
          });
          if (response.ok) {
            // Refetch data to sync
            get().fetchAdminProfile();
            get().fetchAllData();
          }
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      },
      admin: null,
      fetchAdminProfile: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/profile`);
          if (response.ok) {
            const data = await response.json();
            set({ admin: data.admin });
          }
        } catch (error) {
          console.error("Error fetching admin profile:", error);
        }
      },
    }),



    {
      name: "denish-admin-store",
    }
  )
);

