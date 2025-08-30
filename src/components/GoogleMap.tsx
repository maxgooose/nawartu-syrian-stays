import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface GoogleMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  height?: string;
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
    onClick?: () => void;
    icon?: string;
    info?: string;
  }>;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  clickable?: boolean;
  showNearbyPlaces?: boolean;
  showDistanceToMajorCities?: boolean;
  enableGeocoding?: boolean;
}

interface NearbyPlace {
  name: string;
  vicinity: string;
  rating?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface CityDistance {
  city: string;
  distance: string;
  duration: string;
}

// Major Syrian cities coordinates
const MAJOR_SYRIAN_CITIES = [
  { name: 'دمشق', lat: 33.5138, lng: 36.2765 },
  { name: 'حلب', lat: 36.2021, lng: 37.1343 },
  { name: 'حمص', lat: 34.7394, lng: 36.7163 },
  { name: 'حماة', lat: 35.1519, lng: 36.7500 },
  { name: 'اللاذقية', lat: 35.5376, lng: 35.7800 },
  { name: 'طرطوس', lat: 34.8899, lng: 35.8847 }
];

const GoogleMap: React.FC<GoogleMapProps> = ({
  lat = 33.5138, // Damascus default
  lng = 36.2765,
  zoom = 12,
  height = '400px',
  markers = [],
  onLocationSelect,
  clickable = false,
  showNearbyPlaces = false,
  showDistanceToMajorCities = false,
  enableGeocoding = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [cityDistances, setCityDistances] = useState<CityDistance[]>([]);

  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // Cache for geocoding results
  const geocodeCache = useRef<Map<string, google.maps.GeocoderResult[]>>(new Map());
  const placesCache = useRef<Map<string, NearbyPlace[]>>(new Map());

  const fetchApiKey = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-google-maps-key');
      if (error) throw error;
      if (!data?.apiKey) {
        throw new Error('API key not found in response');
      }
      setApiKey(data.apiKey);
    } catch (err) {
      console.error('Failed to fetch Google Maps API key:', err);
      setError(language === 'ar' ? 'فشل في تحميل إعدادات الخريطة' : 'Failed to load map configuration');
      setLoading(false);
    }
  }, [language]);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    if (!geocoderRef.current) return '';
    
    const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (geocodeCache.current.has(cacheKey)) {
      const cached = geocodeCache.current.get(cacheKey);
      return cached?.[0]?.formatted_address || '';
    }

    return new Promise((resolve) => {
      geocoderRef.current!.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            geocodeCache.current.set(cacheKey, results);
            resolve(results[0].formatted_address);
          } else {
            resolve('');
          }
        }
      );
    });
  }, []);

  const searchNearbyPlaces = useCallback(async (center: google.maps.LatLng) => {
    if (!placesServiceRef.current || !mapInstanceRef.current) return;

    const cacheKey = `${center.lat().toFixed(4)},${center.lng().toFixed(4)}`;
    if (placesCache.current.has(cacheKey)) {
      setNearbyPlaces(placesCache.current.get(cacheKey) || []);
      return;
    }

    const request = {
      location: center,
      radius: 2000, // 2km radius
      types: ['restaurant', 'tourist_attraction', 'hospital', 'gas_station', 'bank']
    };

    placesServiceRef.current.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const places = results.slice(0, 10).map(place => ({
          name: place.name || '',
          vicinity: place.vicinity || '',
          rating: place.rating,
          types: place.types || [],
          geometry: {
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }
          }
        }));
        
        placesCache.current.set(cacheKey, places);
        setNearbyPlaces(places);

        // Add markers for nearby places
        places.forEach(place => {
          const marker = new google.maps.Marker({
            position: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
            map: mapInstanceRef.current,
            title: place.name,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new google.maps.Size(32, 32)
            }
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="max-width: 200px;">
                <h4 style="margin: 0 0 5px 0; font-size: 14px;">${place.name}</h4>
                <p style="margin: 0; font-size: 12px; color: #666;">${place.vicinity}</p>
                ${place.rating ? `<p style="margin: 5px 0 0 0; font-size: 12px;">⭐ ${place.rating}</p>` : ''}
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });
        });
      }
    });
  }, []);

  const calculateDistancesToCities = useCallback(async (origin: google.maps.LatLng) => {
    if (!directionsServiceRef.current) return;

    const distances: CityDistance[] = [];
    
    for (const city of MAJOR_SYRIAN_CITIES) {
      try {
        const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
          directionsServiceRef.current!.route(
            {
              origin: origin,
              destination: { lat: city.lat, lng: city.lng },
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === 'OK' && result) {
                resolve(result);
              } else {
                reject(new Error(`Failed to calculate route to ${city.name}`));
              }
            }
          );
        });

        if (result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          distances.push({
            city: city.name,
            distance: leg.distance?.text || '',
            duration: leg.duration?.text || ''
          });
        }
      } catch (error) {
        console.warn(`Could not calculate distance to ${city.name}:`, error);
      }
    }
    
    setCityDistances(distances);
  }, []);

  useEffect(() => {
    if (!apiKey) {
      fetchApiKey();
      return;
    }

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();
        
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;
        geocoderRef.current = new google.maps.Geocoder();
        placesServiceRef.current = new google.maps.places.PlacesService(map);
        directionsServiceRef.current = new google.maps.DirectionsService();

        // Add main marker
        if (lat && lng) {
          new google.maps.Marker({
            position: { lat, lng },
            map,
            title: 'Selected Location',
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new google.maps.Size(32, 32)
            }
          });
        }

        // Add custom markers
        markers.forEach(marker => {
          const mapMarker = new google.maps.Marker({
            position: { lat: marker.lat, lng: marker.lng },
            map,
            title: marker.title,
            icon: marker.icon ? {
              url: marker.icon,
              scaledSize: new google.maps.Size(32, 32)
            } : undefined
          });

          if (marker.info) {
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="max-width: 200px;">
                  <h4 style="margin: 0 0 5px 0; font-size: 14px;">${marker.title || 'Location'}</h4>
                  <p style="margin: 0; font-size: 12px; color: #666;">${marker.info}</p>
                </div>
              `
            });

            mapMarker.addListener('click', () => {
              infoWindow.open(map, mapMarker);
              if (marker.onClick) marker.onClick();
            });
          } else if (marker.onClick) {
            mapMarker.addListener('click', marker.onClick);
          }
        });

        // Add click listener for location selection
        if (clickable && onLocationSelect) {
          map.addListener('click', async (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              const clickedLat = event.latLng.lat();
              const clickedLng = event.latLng.lng();
              
              let address = '';
              if (enableGeocoding) {
                address = await reverseGeocode(clickedLat, clickedLng);
              }
              
              onLocationSelect(clickedLat, clickedLng, address);
            }
          });
        }

        // Search nearby places if enabled
        if (showNearbyPlaces) {
          await searchNearbyPlaces(new google.maps.LatLng(lat, lng));
        }

        // Calculate distances to major cities
        if (showDistanceToMajorCities) {
          await calculateDistancesToCities(new google.maps.LatLng(lat, lng));
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(language === 'ar' ? 'فشل في تحميل الخريطة' : 'Failed to load map');
        setLoading(false);
      }
    };

    initMap();
  }, [apiKey, lat, lng, zoom, markers, onLocationSelect, clickable, showNearbyPlaces, showDistanceToMajorCities, enableGeocoding, reverseGeocode, searchNearbyPlaces, calculateDistancesToCities, language]);

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-lg border"
        style={{ height }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="text-center p-4">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-lg border"
        style={{ height }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'جاري تحميل الخريطة التفاعلية...' : 'Loading interactive map...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <div 
        ref={mapRef} 
        className="w-full rounded-lg border"
        style={{ height }}
      />
      
      {/* Nearby Places Panel */}
      {showNearbyPlaces && nearbyPlaces.length > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs max-h-60 overflow-y-auto">
          <h4 className="font-semibold mb-2 text-sm">
            {language === 'ar' ? 'الأماكن القريبة' : 'Nearby Places'}
          </h4>
          <div className="space-y-2">
            {nearbyPlaces.slice(0, 5).map((place, index) => (
              <div key={index} className="text-xs border-b pb-1">
                <div className="font-medium">{place.name}</div>
                <div className="text-gray-600">{place.vicinity}</div>
                {place.rating && (
                  <div className="text-yellow-600">⭐ {place.rating}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distance to Cities Panel */}
      {showDistanceToMajorCities && cityDistances.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h4 className="font-semibold mb-2 text-sm">
            {language === 'ar' ? 'المسافات للمدن الرئيسية' : 'Distance to Major Cities'}
          </h4>
          <div className="space-y-1">
            {cityDistances.slice(0, 4).map((city, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span>{city.city}</span>
                <span className="text-gray-600">{city.distance} ({city.duration})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;