import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { GOOGLE_MAPS_API_KEY } from '../constants/Config';

/**
 * Builds Google Maps Directions universal URL for turn-by-turn navigation.
 */
export const buildGoogleMapsDirectionsUrl = (origin, destination) => {
  const originStr = typeof origin === 'string'
    ? encodeURIComponent(origin)
    : (origin?.latitude && origin?.longitude ? `${origin.latitude},${origin.longitude}` : '');

  const destStr = typeof destination === 'string'
    ? encodeURIComponent(destination)
    : (destination?.latitude && destination?.longitude ? `${destination.latitude},${destination.longitude}` : '');

  if (originStr && destStr) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=driving`;
  }
  if (destStr) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destStr}&travelmode=driving`;
  }
  return 'https://maps.google.com';
};

/**
 * Builds Google Maps Static Map image URL.
 */
export const buildGoogleStaticMapUrl = ({
  origin,
  destination,
  driverLocation,
  apiKey = GOOGLE_MAPS_API_KEY,
  width = 600,
  height = 300,
  zoom = 13,
}) => {
  if (!apiKey) return null;

  const params = [
    `size=${width}x${height}`,
    'scale=2',
    'maptype=roadmap',
    `key=${encodeURIComponent(apiKey.trim())}`,
  ];

  if (origin?.latitude && origin?.longitude) {
    params.push(`markers=color:orange%7Clabel:P%7C${origin.latitude},${origin.longitude}`);
  }
  if (destination?.latitude && destination?.longitude) {
    params.push(`markers=color:green%7Clabel:D%7C${destination.latitude},${destination.longitude}`);
  }
  if (driverLocation?.latitude && driverLocation?.longitude) {
    params.push(`markers=color:blue%7Clabel:🚗%7C${driverLocation.latitude},${driverLocation.longitude}`);
  }

  // If only one point is given, set center and zoom
  if (origin?.latitude && !destination?.latitude) {
    params.push(`center=${origin.latitude},${origin.longitude}`);
    params.push(`zoom=${zoom}`);
  } else if (!origin?.latitude && destination?.latitude) {
    params.push(`center=${destination.latitude},${destination.longitude}`);
    params.push(`zoom=${zoom}`);
  }

  return `https://maps.googleapis.com/maps/api/staticmap?${params.join('&')}`;
};

/**
 * GoogleMapView component
 * Renders a Google Maps visual (using Static API when key is configured, or stylized fallback map)
 * with a quick "Open in Google Maps" action for live turn-by-turn navigation.
 */
const GoogleMapView = ({
  origin,
  destination,
  driverLocation,
  distanceText,
  durationText,
  height = 240,
  style,
  showNavigationButton = true,
  navigationButtonLabel = 'Open in Google Maps',
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const staticMapUrl = buildGoogleStaticMapUrl({
    origin,
    destination,
    driverLocation,
    width: 600,
    height: Math.round(height),
  });

  const handleOpenGoogleMaps = async () => {
    try {
      const url = buildGoogleMapsDirectionsUrl(origin, destination);
      const supported = await Linking.canOpenURL(url);
      if (supported || Platform.OS === 'web') {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(`https://maps.google.com/?q=${destination?.latitude || ''},${destination?.longitude || ''}`);
      }
    } catch (err) {
      console.warn('Could not launch Google Maps:', err);
    }
  };

  const hasStaticMap = Boolean(staticMapUrl && !imageError);

  return (
    <View style={[styles.container, { height }, style]}>
      {hasStaticMap ? (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: staticMapUrl }}
            style={styles.mapImage}
            resizeMode="cover"
            onLoadEnd={() => setLoading(false)}
            onError={() => setImageError(true)}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.stylizedMap}>
          {/* Grid lines simulating a real road map */}
          <View style={[styles.gridRoadH, { top: '30%' }]} />
          <View style={[styles.gridRoadH, { top: '65%' }]} />
          <View style={[styles.gridRoadV, { left: '35%' }]} />
          <View style={[styles.gridRoadV, { left: '70%' }]} />

          {/* Dotted Route connecting points */}
          <View style={styles.dashedRouteLine} />

          {/* Origin Marker (Pickup) */}
          <View style={[styles.markerBadge, styles.pickupMarker, { top: '25%', left: '30%' }]}>
            <Ionicons name="restaurant" size={14} color="#FFF" />
          </View>

          {/* Destination Marker (Dropoff) */}
          <View style={[styles.markerBadge, styles.dropoffMarker, { top: '60%', left: '68%' }]}>
            <Ionicons name="location" size={16} color="#FFF" />
          </View>

          {/* Driver Marker if present */}
          {Boolean(driverLocation?.latitude) && (
            <View style={[styles.markerBadge, styles.driverMarker, { top: '42%', left: '49%' }]}>
              <Ionicons name="car" size={14} color="#FFF" />
            </View>
          )}

          {/* Distance overlay pill */}
          {(distanceText || durationText) && (
            <View style={styles.metricsPill}>
              <Ionicons name="navigate-circle" size={16} color={Colors.primary} />
              <Text style={styles.metricsText}>
                {[distanceText, durationText].filter(Boolean).join(' • ')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Google Maps Logo & Navigation CTA */}
      {showNavigationButton && (
        <TouchableOpacity
          style={styles.openMapsBtn}
          onPress={handleOpenGoogleMaps}
          activeOpacity={0.85}
        >
          <Ionicons name="map" size={14} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.openMapsText}>{navigationButtonLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E8ECF2',
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(232, 236, 242, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stylizedMap: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E9F0',
    position: 'relative',
    overflow: 'hidden',
  },
  gridRoadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D8DEE9',
  },
  gridRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#D8DEE9',
  },
  dashedRouteLine: {
    position: 'absolute',
    top: '28%',
    left: '33%',
    width: '40%',
    height: '35%',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#FF8C00',
    borderRadius: 8,
  },
  markerBadge: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  pickupMarker: {
    backgroundColor: '#FF7D01',
  },
  dropoffMarker: {
    backgroundColor: '#10B981',
  },
  driverMarker: {
    backgroundColor: '#2563EB',
  },
  metricsPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    gap: 5,
  },
  metricsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  openMapsBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  openMapsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default GoogleMapView;
