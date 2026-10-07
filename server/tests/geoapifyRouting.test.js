const assert = require('assert');
const axios = require('axios');
const {
  calculateDrivingDistance,
  validateCoordinates,
  calculateHaversineDistanceMeters,
  extractCoordinatePairs,
  routingCache,
} = require('../services/geoapifyRoutingService');

// Simple test runner
async function runTests() {
  console.log('\n=== RUNNING GEOAPIFY DRIVER DISTANCE TEST SUITE ===\n');
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

  // Known Coordinates for tests
  // Lagos Island: 6.4549, 3.3947
  // Lekki Phase 1: 6.4474, 3.4723
  const lagosIsland = { latitude: 6.4549, longitude: 3.3947 };
  const lekkiPhase1 = { latitude: 6.4474, longitude: 3.4723 };

  // TEST A: Valid coordinates with Mocked Geoapify API
  await test('A: Valid coordinates road driving calculation returns distanceKm, distanceMeters, duration', async () => {
    routingCache.clear();
    const originalGet = axios.get;
    axios.get = async (url) => {
      assert(url.includes('api.geoapify.com/v1/routing'));
      assert(url.includes('mode=drive'));
      assert(url.includes('waypoints=6.4549,3.3947|6.4474,3.4723'));
      return {
        status: 200,
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                mode: 'drive',
                units: 'metric',
                distance: 9850, // 9.85 km
                time: 1020, // 17 mins
              },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [3.3947, 6.4549],
                  [3.4723, 6.4474],
                ],
              },
            },
          ],
        },
      };
    };

    try {
      const result = await calculateDrivingDistance({
        origin: lagosIsland,
        destination: lekkiPhase1,
        apiKey: 'test_geoapify_key',
        useCache: false,
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.distanceMeters, 9850);
      assert.strictEqual(result.distanceKm, 9.85);
      assert.strictEqual(result.durationSeconds, 1020);
      assert.strictEqual(result.durationMinutes, 17);
      assert.strictEqual(result.formattedDistance, '9.85 km');
      assert.strictEqual(result.formattedDuration, '17 mins');
      assert.strictEqual(result.routeSource, 'geoapify');
      assert.strictEqual(result.isFallback, false);
      assert.strictEqual(result.coordinates.origin.latitude, 6.4549);
      assert.strictEqual(result.coordinates.destination.longitude, 3.4723);
    } finally {
      axios.get = originalGet;
    }
  });

  // TEST B: Invalid latitude
  await test('B: Invalid latitude returns controlled error without crashing', async () => {
    // Latitude > 90
    const res1 = await calculateDrivingDistance({
      originLat: 95.5,
      originLon: 3.3947,
      destLat: 6.4474,
      destLon: 3.4723,
    });
    assert.strictEqual(res1.success, false);
    assert(res1.error.includes('latitude must be between -90 and 90'));

    // Latitude < -90
    const res2 = await calculateDrivingDistance({
      originLat: -92.0,
      originLon: 3.3947,
      destLat: 6.4474,
      destLon: 3.4723,
    });
    assert.strictEqual(res2.success, false);
    assert(res2.error.includes('latitude must be between -90 and 90'));

    // Latitude non-number string
    const res3 = await calculateDrivingDistance({
      originLat: 'invalid_lat',
      originLon: 3.3947,
      destLat: 6.4474,
      destLon: 3.4723,
    });
    assert.strictEqual(res3.success, false);
    assert(res3.error.includes('latitude must be a valid finite number'));
  });

  // TEST C: Invalid longitude
  await test('C: Invalid longitude returns controlled error without crashing', async () => {
    // Longitude > 180
    const res1 = await calculateDrivingDistance({
      originLat: 6.4549,
      originLon: 195.0,
      destLat: 6.4474,
      destLon: 3.4723,
    });
    assert.strictEqual(res1.success, false);
    assert(res1.error.includes('longitude must be between -180 and 180'));

    // Longitude < -180
    const res2 = await calculateDrivingDistance({
      originLat: 6.4549,
      originLon: 3.3947,
      destLat: 6.4474,
      destLon: -200.0,
    });
    assert.strictEqual(res2.success, false);
    assert(res2.error.includes('longitude must be between -180 and 180'));
  });

  // TEST D: Missing coordinates
  await test('D: Missing coordinates returns controlled error', async () => {
    const res1 = await calculateDrivingDistance({
      originLat: null,
      originLon: 3.3947,
      destLat: 6.4474,
      destLon: 3.4723,
    });
    assert.strictEqual(res1.success, false);
    assert(res1.error.includes('Origin is missing'));

    const res2 = await calculateDrivingDistance({});
    assert.strictEqual(res2.success, false);
    assert(res2.error.includes('Origin is missing'));
  });

  // TEST E: Missing API Key
  await test('E1: Missing API key with allowFallback=false returns error', async () => {
    const prevKey = process.env.GEOAPIFY_API_KEY;
    delete process.env.GEOAPIFY_API_KEY;
    try {
      const res = await calculateDrivingDistance({
        origin: lagosIsland,
        destination: lekkiPhase1,
        apiKey: '',
        allowFallback: false,
        useCache: false,
      });
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.code, 'MISSING_API_KEY');
    } finally {
      process.env.GEOAPIFY_API_KEY = prevKey;
    }
  });

  await test('E2: Missing API key with allowFallback=true returns identified fallback', async () => {
    const prevKey = process.env.GEOAPIFY_API_KEY;
    delete process.env.GEOAPIFY_API_KEY;
    try {
      const res = await calculateDrivingDistance({
        origin: lagosIsland,
        destination: lekkiPhase1,
        apiKey: '',
        allowFallback: true,
        useCache: false,
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.isFallback, true);
      assert.strictEqual(res.routeSource, 'haversine_straight_line_fallback');
      assert(res.distanceMeters > 0);
      assert(res.distanceKm > 0);
      assert(res.fallbackWarning.includes('GEOAPIFY_API_KEY'));
    } finally {
      process.env.GEOAPIFY_API_KEY = prevKey;
    }
  });

  // TEST F: Geoapify HTTP failure (e.g. 500 error)
  await test('F: Geoapify HTTP failure handles error gracefully and returns fallback when allowed', async () => {
    const originalGet = axios.get;
    axios.get = async () => {
      const error = new Error('Request failed with status code 500');
      error.response = { status: 500, data: { message: 'Internal Server Error' } };
      throw error;
    };

    try {
      // With fallback
      const fallbackRes = await calculateDrivingDistance({
        origin: lagosIsland,
        destination: lekkiPhase1,
        apiKey: 'test_key',
        allowFallback: true,
        useCache: false,
      });
      assert.strictEqual(fallbackRes.success, true);
      assert.strictEqual(fallbackRes.isFallback, true);
      assert.strictEqual(fallbackRes.routeSource, 'haversine_straight_line_fallback');
      assert(fallbackRes.distanceKm > 0);

      // Without fallback
      const noFallbackRes = await calculateDrivingDistance({
        origin: lagosIsland,
        destination: lekkiPhase1,
        apiKey: 'test_key',
        allowFallback: false,
        useCache: false,
      });
      assert.strictEqual(noFallbackRes.success, false);
      assert.strictEqual(noFallbackRes.code, 'ROUTING_FAILED');
      assert.strictEqual(noFallbackRes.httpStatus, 500);
    } finally {
      axios.get = originalGet;
    }
  });

  // TEST G: No route returned (empty features)
  await test('G: Empty features response is handled properly', async () => {
    const originalGet = axios.get;
    axios.get = async () => ({
      status: 200,
      data: { type: 'FeatureCollection', features: [] },
    });

    try {
      const res = await calculateDrivingDistance({
        origin: lagosIsland,
        destination: lekkiPhase1,
        apiKey: 'test_key',
        allowFallback: true,
        useCache: false,
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.isFallback, true);
    } finally {
      axios.get = originalGet;
    }
  });

  // TEST H: Malformed API response
  await test('H: Malformed API response (missing distance property) handled gracefully', async () => {
    const originalGet = axios.get;
    axios.get = async () => ({
      status: 200,
      data: {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: {} }],
      },
    });

    try {
      const res = await calculateDrivingDistance({
        origin: lagosIsland,
        destination: lekkiPhase1,
        apiKey: 'test_key',
        allowFallback: true,
        useCache: false,
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.isFallback, true);
    } finally {
      axios.get = originalGet;
    }
  });

  // TEST I: Duplicate/repeated calculation behavior (Caching)
  await test('I: Duplicate calculation hits cache and avoids repeated API requests', async () => {
    routingCache.clear();
    let apiCallCount = 0;
    const originalGet = axios.get;
    axios.get = async () => {
      apiCallCount++;
      return {
        status: 200,
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                mode: 'drive',
                distance: 12450,
                time: 720,
              },
            },
          ],
        },
      };
    };

    try {
      // First call -> calls API
      const res1 = await calculateDrivingDistance({
        origin: lagosIsland,
        destination: lekkiPhase1,
        apiKey: 'test_key',
        useCache: true,
      });
      assert.strictEqual(res1.success, true);
      assert.strictEqual(res1.distanceKm, 12.45);
      assert.strictEqual(apiCallCount, 1);
      assert.strictEqual(res1.cached, false);

      // Second call with same coordinates -> hits cache
      const res2 = await calculateDrivingDistance({
        origin: lagosIsland,
        destination: lekkiPhase1,
        apiKey: 'test_key',
        useCache: true,
      });
      assert.strictEqual(res2.success, true);
      assert.strictEqual(res2.distanceKm, 12.45);
      assert.strictEqual(apiCallCount, 1, 'API should not be called again for cached coordinates');
      assert.strictEqual(res2.cached, true);
      assert.strictEqual(res2.routeSource, 'cache');
    } finally {
      axios.get = originalGet;
    }
  });

  // TEST J: Identical points return 0 distance without API call
  await test('J: Identical origin and destination coordinates return 0 km without API call', async () => {
    let apiCallCount = 0;
    const originalGet = axios.get;
    axios.get = async () => {
      apiCallCount++;
    };

    try {
      const res = await calculateDrivingDistance({
        origin: lagosIsland,
        destination: lagosIsland,
        apiKey: 'test_key',
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.distanceKm, 0);
      assert.strictEqual(res.distanceMeters, 0);
      assert.strictEqual(res.formattedDistance, '0.00 km');
      assert.strictEqual(apiCallCount, 0);
    } finally {
      axios.get = originalGet;
    }
  });

  console.log(`\n=== TEST RESULTS: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
