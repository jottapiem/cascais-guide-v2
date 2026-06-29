import { useState, useEffect } from "react";

// Stub hook — gebruikt ingebouwde foto's (geen API keys nodig)
export function usePlacePhotos(placeId: string | null) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [source, setSource] = useState<"builtin" | "google-places" | "apify">("builtin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!placeId) return;
    setPhotos([]);
    setSource("builtin");
    setLoading(false);
  }, [placeId]);

  return { photos, source, loading };
}

export function usePlaceDetails(placeId: string | null) {
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);
  const [source, setSource] = useState<"builtin" | "google-places" | "apify">("builtin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!placeId) return;
    setDetails(null);
    setSource("builtin");
    setLoading(false);
  }, [placeId]);

  return { details, source, loading };
}
