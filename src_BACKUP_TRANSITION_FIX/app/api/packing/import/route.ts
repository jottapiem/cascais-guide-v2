import { NextRequest, NextResponse } from "next/server";
import { classifyItem } from "@/lib/packing-classifier";
import type { Situation } from "@/lib/types";

export const runtime = "nodejs";

const SITUATION_KEYWORDS: Record<string, Situation[]> = {
  bikini: ["Strand", "Zwembad"], handdoek: ["Strand", "Zwembad", "Picknick"],
  zonnebrand: ["Strand", "Zwembad", "Hiking"], zonnebril: ["Strand", "Stad", "Roadtrip"],
  powerbank: ["Festival", "Uitgaan", "Roadtrip"], paspoort: ["Vliegtuig", "Hotel"],
  airpods: ["Vliegtuig", "Uitgaan", "Hotel"], koptelefoon: ["Vliegtuig", "Hotel"],
  water: ["Strand", "Hiking", "Sport"], snacks: ["Strand", "Hiking", "Roadtrip"],
};

function getSituations(name: string): Situation[] {
  const lower = name.toLowerCase();
  const situations = new Set<Situation>();
  for (const [kw, sits] of Object.entries(SITUATION_KEYWORDS)) {
    if (lower.includes(kw)) sits.forEach((s) => situations.add(s));
  }
  return Array.from(situations);
}

export async function POST(req: NextRequest) {
  try {
    const { text, existing } = (await req.json()) as { text: string; existing?: string[] };
    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, error: "Lege invoer" }, { status: 400 });
    }

    const tokens = text.split(/[\n,;•|\-\t]+/).map((t) => t.trim()).filter((t) => t.length > 1 && t.length < 40);
    const seen = new Set<string>();
    const existingNorm = (existing ?? []).map((e) => e.toLowerCase());

    const items = tokens.map((tok) => {
      const name = tok.charAt(0).toUpperCase() + tok.slice(1);
      const norm = name.toLowerCase();
      const isDup = seen.has(norm) || existingNorm.includes(norm);
      seen.add(norm);
      return { name, category: classifyItem(name), situations: getSituations(name), duplicate: isDup };
    });

    return NextResponse.json({ success: true, items, usedLLM: false });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Onbekende fout" }, { status: 500 });
  }
}
