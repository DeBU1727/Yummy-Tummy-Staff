export const printOrderBill = (order) => {
    const printWindow = window.open('', '_blank');
    
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0;">
                <span style="font-weight: 600; display: block; color: #2d3436;">${item.name}</span>
            </td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #636e72;">${item.quantity}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #636e72;">₹${item.price.toFixed(2)}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #2d3436;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const discountHtml = order.discountAmount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #eb4d4b; font-weight: 500;">
            <span>Discount (${order.couponCode}):</span>
            <span>- ₹${order.discountAmount.toFixed(2)}</span>
        </div>
    ` : '';

    const content = `
        <html>
            <head>
                <title>Invoice - Order #${order.id}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
                    body { 
                        font-family: 'Inter', -apple-system, sans-serif; 
                        padding: 40px; 
                        color: #2d3436; 
                        line-height: 1.5;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 40px; 
                    }
                    .brand-name { 
                        font-size: 28px; 
                        font-weight: 800; 
                        color: #eb4d4b; 
                        margin: 0; 
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .brand-tagline { 
                        font-size: 14px; 
                        color: #f0932b; 
                        margin: 5px 0 0 0; 
                        font-weight: 600;
                    }
                    .meta-info { 
                        display: flex; 
                        justify-content: space-between; 
                        padding: 20px 0;
                        border-top: 1px solid #eee;
                        border-bottom: 1px solid #eee;
                        margin-bottom: 30px;
                        font-size: 14px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-bottom: 30px; 
                    }
                    th { 
                        text-align: left; 
                        padding: 12px 8px; 
                        border-bottom: 2px solid #2d3436; 
                        font-size: 13px;
                        text-transform: uppercase;
                        color: #636e72;
                    }
                    .summary-container { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: flex-start;
                        gap: 40px;
                    }
                    .payment-info { 
                        background: #fffaf0;
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px dashed #f0932b;
                        min-width: 200px;
                    }
                    .payment-info h3 { margin: 0 0 10px 0; font-size: 14px; color: #f0932b; }
                    .totals-box { width: 320px; }
                    .total-row {
                        display: flex; 
                        justify-content: space-between; 
                        margin-bottom: 8px;
                        font-size: 15px;
                    }
                    .final-total {
                        margin-top: 15px;
                        padding-top: 15px;
                        border-top: 2px solid #eb4d4b;
                        font-size: 20px;
                        font-weight: 800;
                        color: #eb4d4b;
                    }
                    .footer { 
                        text-align: center; 
                        margin-top: 60px; 
                        font-size: 12px; 
                        color: #b2bec3;
                        border-top: 1px solid #eee;
                        padding-top: 20px;
                    }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="brand-name">Yummy-Tummy</h1>
                    <p class="brand-tagline">Deliciously Yours!</p>
                </div>
                
                <div class="meta-info">
                    <div>
                        <div style="margin-bottom: 4px;"><strong>ORDER ID:</strong> #${order.id}</div>
                        <div><strong>DATE:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="margin-bottom: 4px;"><strong>CUSTOMER:</strong> ${order.customerName || 'Walk-in Guest'}</div>
                        <div><strong>TYPE:</strong> ${order.orderType}</div>
                    </div>
                </div>

                ${order.orderType === 'DELIVERY' ? `
                    <div style="margin-top: -20px; margin-bottom: 30px; font-size: 14px; padding: 10px; background: #f9f9f9; border-radius: 4px;">
                        <strong>Delivery Address:</strong> ${order.deliveryAddress}
                    </div>
                ` : ''}

                <table>
                    <thead>
                        <tr>
                            <th>Item Description</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="summary-container">
                    <div class="payment-info">
                        <h3>Payment Details</h3>
                        <div style="font-size: 13px; margin-bottom: 4px;"><strong>Method:</strong> ${order.paymentMethod}</div>
                        <div style="font-size: 13px;"><strong>Status:</strong> ${order.paymentStatus}</div>
                    </div>

                    <div class="totals-box">
                        <div class="total-row">
                            <span>Subtotal</span>
                            <span>₹${order.subtotal.toFixed(2)}</span>
                        </div>
                        ${discountHtml}
                        <div class="total-row">
                            <span>GST (18%)</span>
                            <span>₹${order.gstAmount.toFixed(2)}</span>
                        </div>
                        <div class="total-row final-total">
                            <span>Grand Total</span>
                            <span>₹${order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>Thank you for dining with us!</p>
                    <p>Keep this receipt for your records. | Computer Generated Invoice</p>
                </div>

                <script>
                    window.onload = function() { 
                        window.print(); 
                        setTimeout(() => { window.close(); }, 500);
                    }
                </script>
            </body>
        </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
};