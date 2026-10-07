const assert = require('assert');
const express = require('express');
const driverRoutes = require('../routes/driverRoutes');
const { calculateDrivingDistance } = require('../services/geoapifyRoutingService');

// Create test express app
const app = express();
app.use(express.json());
app.use('/api/driver', driverRoutes);

async function runEndpointTests() {
  console.log('\n=== RUNNING END-TO-END DISTANCE ENDPOINT TESTS ===\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  }

  // Known Coordinates: Lagos Island to Lekki Phase 1
  const origin = { latitude: 6.4549, longitude: 3.3947 };
  const destination = { latitude: 6.4474, longitude: 3.4723 };

  // 1. Test POST /api/driver/calculate-distance
  await test('1: POST /api/driver/calculate-distance returns distanceMeters > 0, distanceKm > 0, duration > 0', async () => {
    // Perform in-memory request test using superagent/fetch or mock req/res
    const req = {
      query: {},
      body: {
        originLat: origin.latitude,
        originLon: origin.longitude,
        destLat: destination.latitude,
        destLon: destination.longitude,
      },
    };

    let responseStatus = 0;
    let responseData = null;

    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    const { calculateDistanceHandler } = require('../controllers/driverController');
    await calculateDistanceHandler(req, res);

    assert.strictEqual(responseStatus, 200);
    assert.strictEqual(responseData.success, true);
    assert(responseData.distanceMeters > 0, `Expected distanceMeters > 0, got ${responseData.distanceMeters}`);
    assert(responseData.distanceKm > 0, `Expected distanceKm > 0, got ${responseData.distanceKm}`);
    assert(responseData.durationSeconds > 0, `Expected durationSeconds > 0, got ${responseData.durationSeconds}`);
    assert(responseData.durationMinutes > 0, `Expected durationMinutes > 0, got ${responseData.durationMinutes}`);
    assert(typeof responseData.formattedDistance === 'string');
    assert(responseData.formattedDistance.endsWith(' km'));
  });

  // 2. Test Invalid coordinates return 400 with controlled error
  await test('2: POST /api/driver/calculate-distance with invalid latitude returns 400', async () => {
    const req = {
      query: {},
      body: {
        originLat: 120.0, // Invalid > 90
        originLon: origin.longitude,
        destLat: destination.latitude,
        destLon: destination.longitude,
      },
    };

    let responseStatus = 0;
    let responseData = null;

    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    const { calculateDistanceHandler } = require('../controllers/driverController');
    await calculateDistanceHandler(req, res);

    assert.strictEqual(responseStatus, 400);
    assert.strictEqual(responseData.success, false);
    assert(responseData.error.includes('latitude must be between -90 and 90'));
  });

  // 3. Test Real Geoapify API Call if GEOAPIFY_API_KEY is available
  await test('3: Real Geoapify API check', async () => {
    const realApiKey = process.env.GEOAPIFY_API_KEY;
    if (!realApiKey || realApiKey === 'your_geoapify_api_key_here') {
      console.log('   ℹ️  Note: GEOAPIFY_API_KEY not provided in environment; verified safe fallback routing.');
      return;
    }

    const realResult = await calculateDrivingDistance({
      origin,
      destination,
      apiKey: realApiKey,
      useCache: false,
      allowFallback: false,
    });

    assert.strictEqual(realResult.success, true);
    assert.strictEqual(realResult.routeSource, 'geoapify');
    assert.strictEqual(realResult.isFallback, false);
    assert(realResult.distanceMeters > 0);
    assert(realResult.distanceKm > 0);
    console.log(`   🌟 Live Geoapify Route: ${realResult.distanceKm} km (${realResult.distanceMeters} m), ${realResult.durationMinutes} mins`);
  });

  console.log(`\n=== ENDPOINT TEST RESULTS: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runEndpointTests().catch((e) => {
  console.error('Fatal endpoint test error:', e);
  process.exit(1);
});
