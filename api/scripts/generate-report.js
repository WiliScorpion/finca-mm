/**
 * Weekly Booking Report Generator
 * Generates a weekly-booking-report.html every Monday automatically
 */

const fs = require('fs');
const path = require('path');

function generateReport(bookings, studios) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Filter bookings from the past week
  const weeklyBookings = bookings.filter(b => {
    const created = new Date(b.createdAt);
    return created >= weekAgo && created <= now;
  });

  const confirmed  = weeklyBookings.filter(b => b.status === 'confirmed');
  const cancelled  = weeklyBookings.filter(b => b.status === 'cancelled');
  const completed  = weeklyBookings.filter(b => b.status === 'completed');
  const revenue    = [...confirmed, ...completed].reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // Per studio breakdown
  const studioStats = studios.map(s => {
    const sb = weeklyBookings.filter(b => b.studioId === s.id);
    const sRevenue = sb.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    return { ...s, bookings: sb.length, revenue: sRevenue };
  }).sort((a, b) => b.revenue - a.revenue);

  const dateRange = `${weekAgo.toLocaleDateString()} – ${now.toLocaleDateString()}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Finca M&amp;M — Weekly Booking Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f4e4c1; color: #8b4513; padding: 40px; }
    h1 { font-size: 32px; font-weight: bold; color: #000; margin-bottom: 4px; }
    .subtitle { font-size: 15px; color: #666; margin-bottom: 6px; }
    .nav { margin-bottom: 30px; }
    .nav a { color: #6200ee; text-decoration: none; margin-right: 24px; font-size: 15px; }
    .nav a:hover { text-decoration: underline; }
    h2 { font-size: 20px; font-weight: bold; color: #000; margin: 30px 0 15px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 10px; }
    .stat-card { background: #fff; border-radius: 10px; padding: 20px; text-align: center; border: 2px solid #d4a574; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
    .stat-card .number { font-size: 38px; font-weight: bold; color: #cd853f; }
    .stat-card .label { font-size: 13px; color: #a0522d; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; border: 2px solid #d4a574; }
    th { background: #8b4513; color: #fff; padding: 12px 16px; text-align: left; font-size: 14px; }
    td { padding: 11px 16px; border-bottom: 1px solid #e8d4a8; font-size: 14px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fef9f0; }
    .badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: bold; }
    .confirmed { background: #c8f7c5; color: #2e7d32; }
    .cancelled  { background: #ffd6d6; color: #c62828; }
    .completed  { background: #cce5ff; color: #004085; }
    .footer { margin-top: 40px; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <h1>Finca M&amp;M — Weekly Booking Report</h1>
  <p class="subtitle">Period: ${dateRange} &nbsp;|&nbsp; Generated: ${now.toLocaleString()}</p>

  <div class="nav">
    <a href="/status">Service Status</a>
    <a href="/docs">Swagger UI</a>
    <a href="/dashboard">Live Dashboard</a>
    <a href="/documentation">Documentation</a>
  </div>

  <h2>📊 Weekly Summary</h2>
  <div class="stats">
    <div class="stat-card"><div class="number">${weeklyBookings.length}</div><div class="label">Total Bookings</div></div>
    <div class="stat-card"><div class="number">${confirmed.length + completed.length}</div><div class="label">Confirmed</div></div>
    <div class="stat-card"><div class="number">${cancelled.length}</div><div class="label">Cancelled</div></div>
    <div class="stat-card"><div class="number">$${revenue}</div><div class="label">Total Revenue</div></div>
  </div>

  <h2>🏠 Studio Performance</h2>
  <table>
    <thead>
      <tr><th>Studio</th><th>Bookings</th><th>Revenue</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${studioStats.map(s => `
      <tr>
        <td>${s.name}</td>
        <td>${s.bookings}</td>
        <td>$${s.revenue}</td>
        <td><span class="badge ${s.available ? 'confirmed' : 'cancelled'}">${s.available ? 'Available' : 'Booked'}</span></td>
      </tr>`).join('')}
    </tbody>
  </table>

  <h2>📋 Booking Details</h2>
  ${weeklyBookings.length === 0
    ? '<p style="color:#aaa;padding:20px;">No bookings this week.</p>'
    : `<table>
        <thead>
          <tr><th>#</th><th>Guest</th><th>Studio</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${weeklyBookings.map(b => `
          <tr>
            <td>${b.id}</td>
            <td>${b.guestName}<br><small style="color:#999">${b.guestEmail}</small></td>
            <td>Studio #${b.studioId}</td>
            <td>${b.checkIn}</td>
            <td>${b.checkOut}</td>
            <td>${b.guests}</td>
            <td>$${b.totalPrice || 0}</td>
            <td><span class="badge ${b.status}">${b.status}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>`}

  <div class="footer">
    🏛️ Finca M&amp;M Booking System &nbsp;|&nbsp; Auto-generated every Monday
  </div>
</body>
</html>`;

  const reportPath = path.join(__dirname, '..', 'docs-html', 'weekly-booking-report.html');
  fs.writeFileSync(reportPath, html);
  console.log(`📊 Weekly report generated: ${reportPath}`);
  return reportPath;
}

module.exports = { generateReport };
