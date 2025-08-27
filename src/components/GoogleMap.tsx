import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

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
  }>;
  onLocationSelect?: (lat: number, lng: number) => void;
  clickable?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  lat = 33.5138, // Damascus default
  lng = 36.2765,
  zoom = 12,
  height = '400px',
  markers = [],
  onLocationSelect,
  clickable = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        console.log('Fetching Google Maps API key...');
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        console.log('API key response:', { data, error });
        if (error) throw error;
        if (!data?.apiKey) {
          throw new Error('API key not found in response');
        }
        console.log('API key fetched successfully');
        setApiKey(data.apiKey);
      } catch (err) {
        console.error('Failed to fetch Google Maps API key:', err);
        setError('Failed to load map configuration');
        setLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    const initMap = async () => {
      try {
        console.log('Initializing map with API key:', apiKey ? 'present' : 'missing');
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        console.log('Loading Google Maps...');
        await loader.load();
        console.log('Google Maps loaded successfully');

        if (!mapRef.current) {
          console.error('Map container ref is null');
          setError('Map container not found');
          setLoading(false);
          return;
        }

        console.log('Creating map instance...');
        const map = new google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        console.log('Map instance created successfully');
        mapInstanceRef.current = map;

        // Add markers
        markers.forEach(marker => {
          const mapMarker = new google.maps.Marker({
            position: { lat: marker.lat, lng: marker.lng },
            map,
            title: marker.title,
          });

          if (marker.onClick) {
            mapMarker.addListener('click', marker.onClick);
          }
        });

        // Add click listener if clickable
        if (clickable && onLocationSelect) {
          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              const clickedLat = event.latLng.lat();
              const clickedLng = event.latLng.lng();
              console.log('Map clicked at:', clickedLat, clickedLng);
              onLocationSelect(clickedLat, clickedLng);
            }
          });
        }

        console.log('Map initialization complete');
        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load map');
        setLoading(false);
      }
    };

    initMap();
  }, [apiKey, lat, lng, zoom, markers, onLocationSelect, clickable]);

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full rounded-lg"
      style={{ height }}
    />
  );
};

export default GoogleMap;