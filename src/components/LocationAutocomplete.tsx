import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@googlemaps/js-api-loader';

interface LocationAutocompleteProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  }) => void;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  className?: string;
  language?: 'ar' | 'en';
}

interface Prediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onLocationSelect,
  defaultValue = '',
  placeholder = 'البحث عن موقع...',
  label = 'الموقع',
  className = '',
  language = 'ar'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  
  const [value, setValue] = useState(defaultValue);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);

  // Cache for places predictions
  const predictionsCache = useRef<Map<string, Prediction[]>>(new Map());

  const initializeGoogleMaps = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-google-maps-key');
      if (error) throw error;
      if (!data?.apiKey) throw new Error('API key not found');

      const loader = new Loader({
        apiKey: data.apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();
      setIsGoogleMapsReady(true);

      // Initialize places service with a dummy map
      const dummyMap = new google.maps.Map(document.createElement('div'), {
        center: { lat: 33.5138, lng: 36.2765 }
      });
      placesServiceRef.current = new google.maps.places.PlacesService(dummyMap);

    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
    }
  }, []);

  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3 || !placesServiceRef.current) return;

    // Check cache first
    const cacheKey = `${query}_${language}`;
    if (predictionsCache.current.has(cacheKey)) {
      setPredictions(predictionsCache.current.get(cacheKey) || []);
      setShowPredictions(true);
      return;
    }

    setLoading(true);

    const request = {
      input: query,
      language: language,
      region: 'SY', // Bias towards Syria
      types: ['establishment', 'geocode'],
      componentRestrictions: language === 'ar' ? { country: 'SY' } : undefined
    };

    const service = new google.maps.places.AutocompleteService();
    
    service.getPlacePredictions(request, (predictions, status) => {
      setLoading(false);
      
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        const formattedPredictions = predictions.map(prediction => ({
          description: prediction.description,
          place_id: prediction.place_id,
          structured_formatting: {
            main_text: prediction.structured_formatting.main_text,
            secondary_text: prediction.structured_formatting.secondary_text
          }
        }));

        // Cache the results
        predictionsCache.current.set(cacheKey, formattedPredictions);
        setPredictions(formattedPredictions);
        setShowPredictions(true);
      } else {
        setPredictions([]);
        setShowPredictions(false);
      }
    });
  }, [language]);

  const selectPlace = useCallback(async (placeId: string, description: string) => {
    if (!placesServiceRef.current) return;

    setLoading(true);
    setValue(description);
    setShowPredictions(false);

    const request = {
      placeId: placeId,
      fields: ['geometry', 'formatted_address', 'address_components', 'name']
    };

    placesServiceRef.current.getDetails(request, (place, status) => {
      setLoading(false);
      
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        const location = place.geometry?.location;
        if (location) {
          let city = '';
          let country = '';

          // Extract city and country from address components
          if (place.address_components) {
            for (const component of place.address_components) {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('country')) {
                country = component.long_name;
              }
            }
          }

          onLocationSelect({
            address: place.formatted_address || description,
            lat: location.lat(),
            lng: location.lng(),
            city,
            country
          });
        }
      }
    });
  }, [onLocationSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (newValue.length >= 3) {
      searchPlaces(newValue);
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  }, [searchPlaces]);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Reverse geocode to get address
          if (placesServiceRef.current) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat, lng } },
              (results, status) => {
                setLoading(false);
                if (status === 'OK' && results?.[0]) {
                  const address = results[0].formatted_address;
                  setValue(address);
                  
                  let city = '';
                  let country = '';
                  
                  for (const component of results[0].address_components) {
                    if (component.types.includes('locality')) {
                      city = component.long_name;
                    }
                    if (component.types.includes('country')) {
                      country = component.long_name;
                    }
                  }

                  onLocationSelect({
                    address,
                    lat,
                    lng,
                    city,
                    country
                  });
                }
              }
            );
          }
        },
        (error) => {
          setLoading(false);
          console.error('Error getting current location:', error);
        }
      );
    }
  }, [onLocationSelect]);

  useEffect(() => {
    initializeGoogleMaps();
  }, [initializeGoogleMaps]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowPredictions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {label && <Label htmlFor="location-input" className="mb-2 block">{label}</Label>}
      
      <div className="relative">
        <div className="relative flex">
          <Input
            id="location-input"
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pr-20"
            disabled={!isGoogleMapsReady}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={getCurrentLocation}
              disabled={loading || !isGoogleMapsReady}
              className="px-2"
              title="استخدام موقعي الحالي"
            >
              <MapPin className="h-4 w-4" />
            </Button>
            
            {loading && (
              <div className="px-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Predictions dropdown */}
        {showPredictions && predictions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {predictions.map((prediction, index) => (
              <button
                key={prediction.place_id}
                type="button"
                className="w-full px-4 py-3 text-right hover:bg-muted focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
                onClick={() => selectPlace(prediction.place_id, prediction.description)}
              >
                <div className="flex items-start space-x-3 space-x-reverse">
                  <Search className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 text-right">
                    <div className="font-medium text-sm">
                      {prediction.structured_formatting.main_text}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!isGoogleMapsReady && (
          <div className="absolute inset-0 bg-muted/50 rounded-md flex items-center justify-center">
            <div className="text-xs text-muted-foreground">Loading location services...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationAutocomplete;