// Single access point for the SNP summary demo data.
// Values are precomputed from real NCBI/Ensembl/PubMed lookups (see data file
// comments in the BIBI_Bioinformatics_hackathon research doc) — this page
// makes no live API calls, unlike the original Streamlit + Gemini app.
import variants from "@/data/snp-summary/variants.json";

export type Citation = {
  pmid: string;
  title: string;
  journal: string;
  year: number;
  note?: string;
};

export type PopulationFrequency = { population: string; pct: number };

export type SnpVariant = {
  rsId: string;
  /** How many publications dbSNP itself links to this rsID (not just the curated citations[] shown below). */
  dbsnpCitationCount: number;
  gene: {
    symbol: string;
    name: string;
    ensemblId: string;
    consequence: string;
  };
  location: {
    chromosome: string;
    grch38Position: number;
    alleles: string;
    ancestralAllele: string;
  };
  alias: string;
  clinicalSignificance: string[];
  clinicalSignificanceNote: string;
  alleleFrequency: {
    headline: string;
    byPopulation: PopulationFrequency[];
  };
  externalIds: {
    omim: string | null;
    clinvar: string[];
    pharmgkb: string | null;
  };
  summary: string;
  dataSources: string[];
  citations: Citation[];
};

export const VARIANTS = variants as Record<string, SnpVariant>;

export const EXAMPLE_RS_IDS = Object.keys(VARIANTS);

export function getVariant(rsId: string): SnpVariant | undefined {
  return VARIANTS[rsId];
}

/** The three "jump to the original record" links — always real, live URLs. */
export function sourceLinks(rsId: string) {
  const bare = rsId.replace(/^rs/i, "");
  return [
    {
      label: "NCBI",
      url: `https://www.ncbi.nlm.nih.gov/snp/?term=rs${bare}`,
    },
    {
      label: "Ensembl",
      url: `https://www.ensembl.org/Homo_sapiens/Variation/Explore?db=core;v=rs${bare};vdb=variation`,
    },
    {
      label: "ClinVar",
      url: `https://www.ncbi.nlm.nih.gov/clinvar/?term=rs${bare}`,
    },
  ];
}

export function pubmedUrl(pmid: string): string {
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
}
