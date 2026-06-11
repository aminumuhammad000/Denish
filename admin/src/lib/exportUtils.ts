/**
 * Utility functions for exporting data to CSV and printing invoices
 */

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  
  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Format rows
  const rows = data.map(item => {
    return headers.map(header => {
      const val = item[header];
      // Escape strings containing commas, newlines, or double quotes
      const strVal = val === null || val === undefined ? "" : String(val);
      const cleanVal = strVal.replace(/"/g, '""');
      if (cleanVal.includes(",") || cleanVal.includes("\n") || cleanVal.includes('"')) {
        return `"${cleanVal}"`;
      }
      return cleanVal;
    }).join(",");
  });

  // Construct CSV content with UTF-8 BOM to preserve special characters (like ₦)
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printOrderInvoice(order: any) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print invoices.");
    return;
  }

  // Calculate pricing
  const subtotal = order.total;
  const commission = order.commission || "₦1,200";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${order.id}</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #191c1c;
            padding: 40px;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.5;
          }
          .header {
            border-bottom: 2px solid #207951;
            padding-bottom: 20px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #207951;
            letter-spacing: -0.5px;
          }
          .title {
            font-size: 16px;
            font-weight: 700;
            color: #747475;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .info-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 16px;
            margin-bottom: 32px;
            font-size: 14px;
          }
          .info-block {
            display: flex;
            flex-direction: column;
          }
          .label {
            color: #747475;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .val {
            font-weight: 500;
          }
          .customer-name {
            font-weight: 700;
            margin-bottom: 2px;
          }
          .address {
            color: #747475;
            font-size: 12px;
            line-height: 1.3;
          }
          .section-title {
            font-size: 12px;
            font-weight: 700;
            color: #848484;
            text-transform: uppercase;
            margin-bottom: 12px;
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 6px;
          }
          .item-list {
            margin-bottom: 24px;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .pricing {
            border-top: 1px dashed #dcdcdc;
            padding-top: 16px;
            margin-bottom: 32px;
          }
          .price-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .price-row.commission-row {
            color: #29a378;
            font-weight: 500;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-weight: 700;
            font-size: 18px;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #191c1c;
          }
          .footer {
            margin-top: 48px;
            text-align: center;
            font-size: 12px;
            color: #848484;
            border-top: 1px solid #eaeaea;
            padding-top: 24px;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">DENISH</div>
          <div class="title">Order Invoice</div>
        </div>
        
        <div class="info-grid">
          <div class="info-block">
            <span class="label">Order ID</span>
            <span class="val" style="font-family: monospace; font-weight: bold; font-size: 15px;">${order.id}</span>
          </div>
          <div class="info-block">
            <span class="label">Date</span>
            <span class="val">${order.date}</span>
          </div>
          <div class="info-block" style="grid-column: span 2;">
            <span class="label">Deliver To</span>
            <span class="customer-name">${order.customer}</span>
            <span class="address">${order.address || "12 Marina Road, Lagos"}</span>
          </div>
          <div class="info-block">
            <span class="label">Vendor Partner</span>
            <span class="val">${order.vendor}</span>
          </div>
          <div class="info-block">
            <span class="label">Status</span>
            <span class="val" style="text-transform: capitalize; font-weight: bold; color: #207951;">${order.status}</span>
          </div>
        </div>

        <div class="section-title">Order Items</div>
        <div class="item-list">
          <div class="item-row">
            <span>Jollof Rice x 2</span>
            <span>₦5,000</span>
          </div>
          <div class="item-row">
            <span>Egusi Soup x 1</span>
            <span>₦3,000</span>
          </div>
        </div>

        <div class="pricing">
          <div class="price-row">
            <span>Subtotal</span>
            <span>${subtotal}</span>
          </div>
          <div class="price-row commission-row">
            <span>Commission (15%)</span>
            <span>${commission}</span>
          </div>
          <div class="total-row">
            <span>Total Payment</span>
            <span>${subtotal}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for ordering with Denish!</p>
          <p style="font-size: 10px; margin-top: 4px; color: #a0a0a0;">This is a computer-generated invoice simulation.</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
