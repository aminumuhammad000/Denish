const axios = require('axios');

/**
 * In-memory TTL cache for Geoapify routing queries to optimize costs and prevent repeated calls.
 */
class RoutingCache {
  constructor(ttlMs = 30 * 60 * 1000, maxSize = 1000) {
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  _getKey(originLat, originLon, destLat, destLon, mode = 'drive') {
    return `${Number(originLat).toFixed(5)},${Number(originLon).toFixed(5)}->${Number(destLat).toFixed(5)},${Number(destLon).toFixed(5)}:${mode}`;
  }

  get(originLat, originLon, destLat, destLon, mode = 'drive') {
    const key = this._getKey(originLat, originLon, destLat, destLon, mode);
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(originLat, originLon, destLat, destLon, data, mode = 'drive') {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const key = this._getKey(originLat, originLon, destLat, destLon, mode);
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

const routingCache = new RoutingCache();

/**
 * Validates coordinate pair.
 * Latitude must be between -90 and 90.
 * Longitude must be between -180 and 180.
 *
 * @param {any} lat - Latitude
 * @param {any} lon - Longitude
 * @param {string} label - Name of the coordinate pair for error messaging
 * @returns {{ valid: boolean, error?: string, parsed?: { latitude: number, longitude: number } }}
 */
function validateCoordinates(lat, lon, label = 'Coordinate') {
  if (lat === null || lat === undefined || lat === '' || lon === null || lon === undefined || lon === '') {
    return {
      valid: false,
      error: `${label} is missing: both latitude and longitude are required.`,
    };
  }

  const parsedLat = typeof lat === 'number' ? lat : parseFloat(String(lat).trim());
  const parsedLon = typeof lon === 'number' ? lon : parseFloat(String(lon).trim());

  if (Number.isNaN(parsedLat) || !Number.isFinite(parsedLat)) {
    return {
      valid: false,
      error: `${label} latitude must be a valid finite number. Received: ${lat}`,
    };
  }

  if (Number.isNaN(parsedLon) || !Number.isFinite(parsedLon)) {
    return {
      valid: false,
      error: `${label} longitude must be a valid finite number. Received: ${lon}`,
    };
  }

  if (parsedLat < -90 || parsedLat > 90) {
    return {
      valid: false,
      error: `${label} latitude must be between -90 and 90 degrees. Received: ${parsedLat}`,
    };
  }

  if (parsedLon < -180 || parsedLon > 180) {
    return {
      valid: false,
      error: `${label} longitude must be between -180 and 180 degrees. Received: ${parsedLon}`,
    };
  }

  return {
    valid: true,
    parsed: {
      latitude: parsedLat,
      longitude: parsedLon,
    },
  };
}

/**
 * Calculates Haversine straight-line distance in meters between two points.
 * Used strictly as an identified fallback when road routing is unavailable.
 */
function calculateHaversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Normalizes input coordinates from various possible input formats:
 * - { originLat, originLon, destLat, destLon }
 * - { origin: { latitude/lat, longitude/lon/lng }, destination: { ... } }
 * - { fromLat, fromLng, toLat, toLng }
 */
function extractCoordinatePairs(params = {}) {
  let originLat = params.originLat ?? params.fromLat ?? params.origin?.latitude ?? params.origin?.lat ?? params.origin?.y;
  let originLon = params.originLon ?? params.originLng ?? params.fromLon ?? params.fromLng ?? params.origin?.longitude ?? params.origin?.lon ?? params.origin?.lng ?? params.origin?.x;

  let destLat = params.destLat ?? params.destinationLat ?? params.toLat ?? params.destination?.latitude ?? params.destination?.lat ?? params.destination?.y;
  let destLon = params.destLon ?? params.destLng ?? params.destinationLon ?? params.destinationLng ?? params.toLon ?? params.toLng ?? params.destination?.longitude ?? params.destination?.lon ?? params.destination?.lng ?? params.destination?.x;

  return { originLat, originLon, destLat, destLon };
}

/**
 * Calculates actual driving road distance using Geoapify Routing API.
 *
 * @param {Object} options
 * @param {number|string} [options.originLat]
 * @param {number|string} [options.originLon]
 * @param {number|string} [options.destLat]
 * @param {number|string} [options.destLon]
 * @param {Object} [options.origin]
 * @param {Object} [options.destination]
 * @param {string} [options.apiKey] - Optional override for process.env.GEOAPIFY_API_KEY
 * @param {string} [options.mode] - Routing mode, defaults to 'drive'
 * @param {boolean} [options.useCache=true] - Whether to use in-memory caching
 * @param {boolean} [options.allowFallback=true] - Whether to fallback to Haversine if API fails
 * @param {number} [options.timeout=8000] - Request timeout in ms
 * @returns {Promise<{
 *   success: boolean,
 *   distanceMeters: number,
 *   distanceKm: number,
 *   durationSeconds: number,
 *   durationMinutes: number,
 *   formattedDistance: string,
 *   formattedDuration: string,
 *   mode: string,
 *   routeSource: 'geoapify'|'cache'|'haversine_straight_line_fallback',
 *   isFallback: boolean,
 *   fallbackWarning?: string,
 *   coordinates: { origin: { latitude: number, longitude: number }, destination: { latitude: number, longitude: number } },
 *   geometry?: any,
 *   cached?: boolean,
 *   error?: string
 * }>}
 */
async function calculateDrivingDistance(options = {}) {
  const { originLat, originLon, destLat, destLon } = extractCoordinatePairs(options);
  const mode = options.mode || 'drive';
  const useCache = options.useCache !== false;
  const allowFallback = options.allowFallback !== false;
  const timeout = options.timeout || 8000;
  const apiKey = options.apiKey || process.env.GEOAPIFY_API_KEY;

  // 1. Validate Origin Coordinates
  const originValidation = validateCoordinates(originLat, originLon, 'Origin');
  if (!originValidation.valid) {
    return {
      success: false,
      error: originValidation.error,
      code: 'INVALID_ORIGIN_COORDINATES',
      isFallback: false,
    };
  }

  // 2. Validate Destination Coordinates
  const destValidation = validateCoordinates(destLat, destLon, 'Destination');
  if (!destValidation.valid) {
    return {
      success: false,
      error: destValidation.error,
      code: 'INVALID_DESTINATION_COORDINATES',
      isFallback: false,
    };
  }

  const origin = originValidation.parsed;
  const destination = destValidation.parsed;

  // Check identical coordinates (0 distance)
  if (origin.latitude === destination.latitude && origin.longitude === destination.longitude) {
    return {
      success: true,
      distanceMeters: 0,
      distanceKm: 0,
      durationSeconds: 0,
      durationMinutes: 0,
      formattedDistance: '0.00 km',
      formattedDuration: '0 mins',
      mode,
      routeSource: 'identical_points',
      isFallback: false,
      coordinates: { origin, destination },
      cached: false,
    };
  }

  // 3. Check Cache
  if (useCache) {
    const cachedData = routingCache.get(origin.latitude, origin.longitude, destination.latitude, destination.longitude, mode);
    if (cachedData) {
      return {
        ...cachedData,
        cached: true,
        routeSource: 'cache',
      };
    }
  }

  // 4. Verify API Key
  if (!apiKey || !apiKey.trim()) {
    if (allowFallback) {
      const fallbackMeters = calculateHaversineDistanceMeters(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );
      const fallbackKm = parseFloat((fallbackMeters / 1000).toFixed(2));
      // Estimate driving duration at ~30 km/h average speed in urban traffic
      const estimatedSeconds = Math.round((fallbackMeters / (30 * 1000 / 3600)));
      const estimatedMinutes = Math.max(1, Math.round(estimatedSeconds / 60));

      return {
        success: true,
        distanceMeters: fallbackMeters,
        distanceKm: fallbackKm,
        durationSeconds: estimatedSeconds,
        durationMinutes: estimatedMinutes,
        formattedDistance: `${fallbackKm.toFixed(2)} km`,
        formattedDuration: `${estimatedMinutes} mins`,
        mode,
        routeSource: 'haversine_straight_line_fallback',
        isFallback: true,
        fallbackWarning: 'GEOAPIFY_API_KEY environment variable is not configured. Straight-line distance calculated as fallback.',
        coordinates: { origin, destination },
      };
    }

    return {
      success: false,
      error: 'Geoapify API key is missing. Set GEOAPIFY_API_KEY environment variable.',
      code: 'MISSING_API_KEY',
      isFallback: false,
    };
  }

  // 5. Call Geoapify Routing API
  try {
    const waypointsParam = `${origin.latitude},${origin.longitude}|${destination.latitude},${destination.longitude}`;
    const url = `https://api.geoapify.com/v1/routing?waypoints=${waypointsParam}&mode=${encodeURIComponent(mode)}&apiKey=${encodeURIComponent(apiKey.trim())}`;

    const response = await axios.get(url, {
      timeout,
      headers: {
        Accept: 'application/json',
      },
    });

    const data = response.data;

    if (!data || !Array.isArray(data.features) || data.features.length === 0) {
      throw new Error('Geoapify returned no routing features for the given waypoints.');
    }

    const feature = data.features[0];
    const properties = feature?.properties;

    if (!properties || typeof properties.distance !== 'number') {
      throw new Error('Geoapify response is missing route properties or distance metric.');
    }

    const distanceMeters = Math.round(properties.distance);
    const distanceKm = parseFloat((distanceMeters / 1000).toFixed(2));
    const durationSeconds = Math.round(properties.time || 0);
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

    const result = {
      success: true,
      distanceMeters,
      distanceKm,
      durationSeconds,
      durationMinutes,
      formattedDistance: `${distanceKm.toFixed(2)} km`,
      formattedDuration: `${durationMinutes} mins`,
      mode,
      routeSource: 'geoapify',
      isFallback: false,
      coordinates: { origin, destination },
      geometry: feature.geometry || null,
      cached: false,
    };

    // Save in cache
    if (useCache) {
      routingCache.set(origin.latitude, origin.longitude, destination.latitude, destination.longitude, result, mode);
    }

    return result;
  } catch (error) {
    const status = error.response?.status;
    const errorData = error.response?.data;
    const errorMessage = errorData?.message || error.message || 'Error communicating with Geoapify Routing API';

    console.warn(`[GeoapifyRoutingService] API call failed (${status || 'NETWORK_ERROR'}): ${errorMessage}`);

    if (allowFallback) {
      const fallbackMeters = calculateHaversineDistanceMeters(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );
      const fallbackKm = parseFloat((fallbackMeters / 1000).toFixed(2));
      const estimatedSeconds = Math.round(fallbackMeters / (30 * 1000 / 3600));
      const estimatedMinutes = Math.max(1, Math.round(estimatedSeconds / 60));

      return {
        success: true,
        distanceMeters: fallbackMeters,
        distanceKm: fallbackKm,
        durationSeconds: estimatedSeconds,
        durationMinutes: estimatedMinutes,
        formattedDistance: `${fallbackKm.toFixed(2)} km`,
        formattedDuration: `${estimatedMinutes} mins`,
        mode,
        routeSource: 'haversine_straight_line_fallback',
        isFallback: true,
        fallbackWarning: `Road routing failed (${errorMessage}). Straight-line distance calculated as fallback.`,
        coordinates: { origin, destination },
        apiError: {
          status,
          message: errorMessage,
        },
      };
    }

    return {
      success: false,
      error: `Geoapify Routing API error: ${errorMessage}`,
      code: status === 429 ? 'RATE_LIMIT_EXCEEDED' : status === 401 || status === 403 ? 'UNAUTHORIZED' : 'ROUTING_FAILED',
      httpStatus: status,
      isFallback: false,
    };
  }
}

module.exports = {
  calculateDrivingDistance,
  validateCoordinates,
  calculateHaversineDistanceMeters,
  extractCoordinatePairs,
  routingCache,
};
