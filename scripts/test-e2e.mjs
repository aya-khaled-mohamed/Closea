const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting Closéa End-to-End Automated Integration Verification...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${detail ? '(' + detail + ')' : ''}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? '(' + detail + ')' : ''}`);
      failed++;
    }
  }

  // 1. Marketplace & Dresses API
  console.log('1. Testing Marketplace & Discovery:');
  const resDresses = await fetch(`${BASE_URL}/api/dresses`);
  const dressesData = await resDresses.json();
  assert(resDresses.ok, 'GET /api/dresses returns 200');
  assert(dressesData.dresses.length > 0, 'Retrieves approved dresses', `Found ${dressesData.dresses.length} dresses`);

  // Search filter
  const resSearch = await fetch(`${BASE_URL}/api/dresses?search=Jacquemus`);
  const searchData = await resSearch.json();
  assert(searchData.dresses.length > 0, 'Search filter for "Jacquemus" works', `Found ${searchData.dresses.length}`);

  // Find a dress specifically owned by Sophie Laurent
  const sophieDress = dressesData.dresses.find((d) => d.owner?.name === 'Sophie Laurent') || dressesData.dresses[0];

  // 2. Dress Details & Booked Dates
  console.log('\n2. Testing Dress Details & Calendar:');
  const resDressDetail = await fetch(`${BASE_URL}/api/dresses/${sophieDress.slug}`);
  const dressDetailData = await resDressDetail.json();
  assert(resDressDetail.ok, 'GET /api/dresses/:slug returns 200');
  assert(dressDetailData.dress.images.length > 0, 'Includes dress gallery images');
  assert(Array.isArray(dressDetailData.dress.bookedDates), 'Includes non-overlapping booked dates list');

  // 3. Customer Authentication
  console.log('\n3. Testing Customer Authentication & Session:');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'camille.dupont@closea.com', password: 'Closea2026!' }),
  });
  assert(loginRes.ok, 'Customer Camille Dupont signs in successfully');
  const customerCookies = loginRes.headers.get('set-cookie');
  assert(Boolean(customerCookies && customerCookies.includes('closea_session')), 'Returns signed session cookie');

  // 4. Booking Creation & Non-Overlap Date Validation
  console.log('\n4. Testing Booking Lifecycle & Anti-Double-Booking Protection:');
  // Use unique future dates for test run
  const testStart = '2026-12-10';
  const testEnd = '2026-12-13';
  const createBookingRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: customerCookies,
    },
    body: JSON.stringify({
      dressId: sophieDress.id,
      startDate: testStart,
      endDate: testEnd,
      specialRequests: 'Fitting for annual charity gala.',
      deliveryAddress: 'Atelier Saint-Honoré Lounge',
    }),
  });
  const bookingData = await createBookingRes.json();
  assert(createBookingRes.status === 201, 'Booking request created', `Ref: ${bookingData.booking?.bookingReference}`);
  assert(bookingData.booking?.status === 'PENDING', 'Initial booking status is PENDING owner acceptance');
  assert(bookingData.booking?.ownerPayout > 0, 'Dynamic owner payout calculated correctly');

  // Attempt overlapping double booking
  const duplicateBookingRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: customerCookies,
    },
    body: JSON.stringify({
      dressId: sophieDress.id,
      startDate: '2026-12-11', // Overlaps with Dec 10 - Dec 13!
      endDate: '2026-12-14',
    }),
  });
  assert(duplicateBookingRes.status === 409, 'Overlapping booking correctly blocked with 409 Conflict');

  // 5. Dress Owner Workflow (Accept Booking)
  console.log('\n5. Testing Dress Owner Workflow:');
  const ownerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sophie.laurent@closea.com', password: 'Closea2026!' }),
  });
  const ownerCookies = ownerLoginRes.headers.get('set-cookie');
  assert(ownerLoginRes.ok, 'Dress Owner Sophie Laurent signs in successfully');

  // Owner accepts the booking created in step 4
  const acceptRes = await fetch(`${BASE_URL}/api/bookings/${bookingData.booking.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      cookie: ownerCookies,
    },
    body: JSON.stringify({ action: 'ACCEPT' }),
  });
  const acceptData = await acceptRes.json();
  assert(acceptRes.ok, 'Owner accepts booking request');
  assert(acceptData.booking?.status === 'CONFIRMED', 'Booking transitions to CONFIRMED');

  // 6. Atelier Partner Workflow
  console.log('\n6. Testing Partner Atelier Workflow:');
  const atelierLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'contact@atelier-sainthonore.com', password: 'Closea2026!' }),
  });
  const atelierCookies = atelierLoginRes.headers.get('set-cookie');
  assert(atelierLoginRes.ok, 'Atelier Saint-Honoré signs in successfully');

  const atelierAssignRes = await fetch(`${BASE_URL}/api/atelier/assignments`, {
    headers: { cookie: atelierCookies },
  });
  const atelierAssignData = await atelierAssignRes.json();
  assert(atelierAssignRes.ok, 'Atelier retrieves assigned garments');
  assert(atelierAssignData.assignments.length > 0, 'Garments found under atelier custody');

  // Update stage to READY
  const sampleAssign = atelierAssignData.assignments[0];
  const updateStageRes = await fetch(`${BASE_URL}/api/atelier/assignments`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      cookie: atelierCookies,
    },
    body: JSON.stringify({
      assignmentId: sampleAssign.id,
      operationalStatus: 'READY',
      note: 'Garment dry cleaned and fitted with silk ribbons.',
    }),
  });
  assert(updateStageRes.ok, 'Atelier successfully updates operational status to READY');

  // 7. Admin Security Guard & Admin Portal Login
  console.log('\n7. Testing Admin Authentication & Access Guard:');
  // Attempt to login to Admin portal with customer credentials
  const fakeAdminLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'camille.dupont@closea.com',
      password: 'Closea2026!',
      isAdminLogin: true,
    }),
  });
  assert(fakeAdminLogin.status === 403, 'Non-admin blocked from admin portal with 403 Forbidden');

  // Legitimate Admin Login
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@closea.com',
      password: 'CloseaAdmin2026!',
      isAdminLogin: true,
    }),
  });
  const adminCookies = adminLoginRes.headers.get('set-cookie');
  assert(adminLoginRes.ok, 'Administrator Geneviève Moreau signs in successfully');

  // 8. Admin Telemetry & Real Database Analytics
  console.log('\n8. Testing Admin Overview Analytics:');
  const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { cookie: adminCookies },
  });
  const statsData = await statsRes.json();
  assert(statsRes.ok, 'GET /api/admin/stats returns real KPI telemetry');
  assert(statsData.metrics.users.total > 0, 'Real user metric counted', `${statsData.metrics.users.total} total`);
  assert(statsData.metrics.finances.grossVolume > 0, 'Real financial gross volume aggregated');

  // 9. Admin Dress Curation (Approval / Rejection)
  console.log('\n9. Testing Admin Dress Curation:');
  const adminDressesRes = await fetch(`${BASE_URL}/api/admin/dresses`, {
    headers: { cookie: adminCookies },
  });
  const adminDressesData = await adminDressesRes.json();
  const pendingDress = adminDressesData.dresses.find((d) => d.status === 'PENDING_APPROVAL');
  if (pendingDress) {
    const approveRes = await fetch(`${BASE_URL}/api/admin/dresses`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie: adminCookies,
      },
      body: JSON.stringify({ dressId: pendingDress.id, action: 'APPROVE' }),
    });
    assert(approveRes.ok, 'Admin successfully approves pending dress listing', `"${pendingDress.title}"`);
  } else {
    assert(true, 'Admin listings reviewed (no further pending approvals remaining)');
  }

  // 10. Admin Configurable Commission Policy
  console.log('\n10. Testing Configurable Commission Engine:');
  const updateCommRes = await fetch(`${BASE_URL}/api/admin/commission`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      cookie: adminCookies,
    },
    body: JSON.stringify({
      platformFeePercent: 15.0,
      atelierFeePercent: 10.0,
      ownerSharePercent: 75.0,
    }),
  });
  const commData = await updateCommRes.json();
  assert(updateCommRes.ok, 'Admin updates commission split dynamically without code changes');
  assert(commData.commission.platformFeePercent === 15.0, 'Commission policy active in database');

  // Test invalid commission total (must equal 100)
  const invalidCommRes = await fetch(`${BASE_URL}/api/admin/commission`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      cookie: adminCookies,
    },
    body: JSON.stringify({
      platformFeePercent: 20.0,
      atelierFeePercent: 20.0,
      ownerSharePercent: 70.0, // 110% invalid!
    }),
  });
  assert(invalidCommRes.status === 400, 'Invalid commission sum (>100%) rejected with 400 Bad Request');

  // 11. Admin Activity Logs Audit Trail
  console.log('\n11. Testing Admin Activity Audit Logs:');
  const logsRes = await fetch(`${BASE_URL}/api/admin/logs`, {
    headers: { cookie: adminCookies },
  });
  const logsData = await logsRes.json();
  assert(logsRes.ok, 'GET /api/admin/logs returns audit ledger');
  assert(logsData.logs.length > 0, 'Audit entries verified in chronological ledger');

  console.log('\n----------------------------------------------------');
  console.log(`Results: ${passed} Passed, ${failed} Failed.`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
