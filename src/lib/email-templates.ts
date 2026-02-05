/**
 * Email Templates - HTML email templates for order notifications
 */

import { formatPrice } from '@/config/site';
import { siteSettings } from '@/config/site-settings';

export interface OrderEmailData {
  orderNumber: string;
  email: string;
  items: {
    name: string;
    sku: string;
    variant?: string | null;
    size?: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
  subtotal: number;
  discount: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shippingAddress: {
    full_name: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  coupon_code?: string | null;
}

export interface ShippingEmailData extends OrderEmailData {
  trackingNumber?: string;
  trackingUrl?: string;
}

const companyName = siteSettings.siteName;

function baseLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
  <!-- Header -->
  <tr><td style="background:#18181b;padding:24px 32px;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${companyName}</h1>
  </td></tr>
  <!-- Title -->
  <tr><td style="padding:32px 32px 0;">
    <h2 style="margin:0;color:#18181b;font-size:22px;font-weight:700;">${title}</h2>
  </td></tr>
  <!-- Content -->
  <tr><td style="padding:16px 32px 32px;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e4e4e7;">
    <p style="margin:0;color:#71717a;font-size:12px;text-align:center;">
      ${companyName} &bull; ${siteSettings.contact.email}
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function itemsTable(items: OrderEmailData['items']): string {
  const rows = items.map(item => {
    const details = [item.variant, item.size].filter(Boolean).join(' / ');
    return `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;">
        <span style="color:#18181b;font-size:14px;">${item.name}</span>
        ${details ? `<br><span style="color:#71717a;font-size:12px;">${details}</span>` : ''}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;text-align:center;color:#52525b;font-size:14px;">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;text-align:right;color:#18181b;font-size:14px;">${formatPrice(item.line_total)}</td>
    </tr>`;
  }).join('');

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr style="border-bottom:2px solid #e4e4e7;">
      <th style="text-align:left;padding:8px 0;color:#71717a;font-size:12px;font-weight:600;text-transform:uppercase;">Item</th>
      <th style="text-align:center;padding:8px 0;color:#71717a;font-size:12px;font-weight:600;text-transform:uppercase;">Qty</th>
      <th style="text-align:right;padding:8px 0;color:#71717a;font-size:12px;font-weight:600;text-transform:uppercase;">Price</th>
    </tr>
    ${rows}
  </table>`;
}

function priceSummary(data: OrderEmailData): string {
  let html = `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
    <tr><td style="padding:4px 0;color:#52525b;font-size:14px;">Subtotal</td>
        <td style="padding:4px 0;text-align:right;color:#18181b;font-size:14px;">${formatPrice(data.subtotal)}</td></tr>`;

  if (data.discount > 0) {
    html += `<tr><td style="padding:4px 0;color:#16a34a;font-size:14px;">Discount${data.coupon_code ? ` (${data.coupon_code})` : ''}</td>
        <td style="padding:4px 0;text-align:right;color:#16a34a;font-size:14px;">-${formatPrice(data.discount)}</td></tr>`;
  }

  html += `<tr><td style="padding:4px 0;color:#52525b;font-size:14px;">Shipping</td>
      <td style="padding:4px 0;text-align:right;color:#18181b;font-size:14px;">${data.shipping_cost > 0 ? formatPrice(data.shipping_cost) : 'FREE'}</td></tr>`;

  if (data.tax > 0) {
    html += `<tr><td style="padding:4px 0;color:#52525b;font-size:14px;">Tax</td>
        <td style="padding:4px 0;text-align:right;color:#18181b;font-size:14px;">${formatPrice(data.tax)}</td></tr>`;
  }

  html += `<tr><td style="padding:12px 0 0;color:#18181b;font-size:18px;font-weight:700;border-top:2px solid #e4e4e7;">Total</td>
      <td style="padding:12px 0 0;text-align:right;color:#18181b;font-size:18px;font-weight:700;border-top:2px solid #e4e4e7;">${formatPrice(data.total)}</td></tr>
  </table>`;

  return html;
}

function addressBlock(addr: OrderEmailData['shippingAddress']): string {
  return `<div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:6px;">
    <h3 style="margin:0 0 8px;color:#18181b;font-size:14px;font-weight:600;">Shipping Address</h3>
    <p style="margin:0;color:#52525b;font-size:14px;line-height:1.6;">
      ${addr.full_name}<br>
      ${addr.address_line1}<br>
      ${addr.address_line2 ? addr.address_line2 + '<br>' : ''}
      ${addr.city}, ${addr.state} ${addr.postal_code}<br>
      ${addr.country}
    </p>
  </div>`;
}

/**
 * 订单确认邮件模板
 */
export function orderConfirmationTemplate(data: OrderEmailData): string {
  const content = `
    <p style="color:#52525b;font-size:14px;line-height:1.6;margin:16px 0;">
      Thank you for your order! Your order <strong style="color:#18181b;">#${data.orderNumber}</strong> has been confirmed and is being processed.
    </p>
    ${itemsTable(data.items)}
    ${priceSummary(data)}
    ${addressBlock(data.shippingAddress)}
    <p style="color:#71717a;font-size:13px;margin-top:24px;">
      If you have any questions, contact us at <a href="mailto:${siteSettings.contact.email}" style="color:#2563eb;">${siteSettings.contact.email}</a>.
    </p>`;

  return baseLayout('Order Confirmed', content);
}

/**
 * 发货通知邮件模板
 */
export function shippingNotificationTemplate(data: ShippingEmailData): string {
  const trackingHtml = data.trackingNumber
    ? `<div style="margin:16px 0;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;">
        <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">Tracking Number: ${data.trackingNumber}</p>
        ${data.trackingUrl ? `<p style="margin:8px 0 0;"><a href="${data.trackingUrl}" style="color:#2563eb;font-size:14px;">Track your package &rarr;</a></p>` : ''}
      </div>`
    : '';

  const content = `
    <p style="color:#52525b;font-size:14px;line-height:1.6;margin:16px 0;">
      Great news! Your order <strong style="color:#18181b;">#${data.orderNumber}</strong> has been shipped.
    </p>
    ${trackingHtml}
    ${itemsTable(data.items)}
    ${addressBlock(data.shippingAddress)}
    <p style="color:#71717a;font-size:13px;margin-top:24px;">
      If you have any questions, contact us at <a href="mailto:${siteSettings.contact.email}" style="color:#2563eb;">${siteSettings.contact.email}</a>.
    </p>`;

  return baseLayout('Your Order Has Shipped', content);
}
