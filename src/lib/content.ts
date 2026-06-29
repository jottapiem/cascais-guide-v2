import fs from 'fs';
import path from 'path';
import type { Place } from './types';

function loadPlaces(): Place[] {
  const dir = path.join(process.cwd(), 'content', 'places');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  return files.map(file => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const data = JSON.parse(raw) as Place;
    if (!data.id || !data.name) {
      throw new Error(`Ongeldig place bestand: ${file} — id en name zijn verplicht`);
    }
    return data;
  });
}

export function getAllPlaces(): Place[] {
  return loadPlaces();
}

export function getPlaceById(id: string): Place | undefined {
  return loadPlaces().find(p => p.id === id);
}
