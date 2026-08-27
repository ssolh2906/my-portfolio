"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import ModelComparisonChart from "@/components/gene-expression/ModelComparisonChart";
import PredictionScatter from "@/components/gene-expression/PredictionScatter";
import FeatureImportanceChart from "@/components/gene-expression/FeatureImportanceChart";
import { BEST_MODEL } from "@/lib/gene-expression";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "method", label: "Method" },
  { id: "references", label: "References" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProjectTabs() {
  const [active, setActive] = useState<TabId>("overview");
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Roving focus: arrow keys move between tabs, Home/End jump to the ends.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const current = TABS.findIndex((t) => t.id === active);
    let next = current;

    if (e.key === "ArrowRight") next = (current + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (current - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;

    e.preventDefault();
    setActive(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Project sections"
        onKeyDown={onKeyDown}
        className="-mx-6 flex gap-1 overflow-x-auto px-6 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((tab, i) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                selected
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId={reduceMotion ? undefined : `${baseId}-pill`}
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-slate-200/80 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(15,23,42,0.06)]"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            role="tabpanel"
            id={`${baseId}-panel-${active}`}
            aria-labelledby={`${baseId}-tab-${active}`}
            tabIndex={0}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            {active === "overview" && <OverviewPanel />}
            {active === "method" && <MethodPanel />}
            {active === "references" && <ReferencesPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="grid gap-12">
      <p className="max-w-[62ch] text-lg leading-relaxed text-slate-600">
        Do histone marks near a gene&apos;s promoter actually predict how much
        it gets expressed? Short answer: yes &mdash; and mostly from one
        signal.
      </p>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          How strong is the relationship?
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Every dot is a held-out gene the model never trained on. Closer to
          the dashed line = closer prediction.
        </p>
        <div className="mt-6">
          <PredictionScatter />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Where the signal comes from
        </h2>
        <Bullets
          items={[
            <>H3K4me3, +150&ndash;200bp from TSS &mdash; the top feature, 36% of the importance</>,
            <>12&times; the next runner-up</>,
            <>Right where &quot;active promoter&quot; biology predicts</>,
          ]}
        />
        <div className="mt-6">
          <FeatureImportanceChart />
        </div>
      </div>

      <div>
        <span className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
          Bonus check
        </span>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Does it hold across methods?
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          All four land in the same range &mdash; not a one-model fluke.
        </p>
        <div className="mt-6">
          <ModelComparisonChart />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          What this does &mdash; and doesn&apos;t &mdash; explain
        </h2>
        <Bullets
          items={[
            <>
              Best model ({BEST_MODEL.label}): R&sup2; {BEST_MODEL.r2.toFixed(3)}, r{" "}
              {BEST_MODEL.pearson.toFixed(3)} &mdash; about {(BEST_MODEL.r2 * 100).toFixed(0)}% of
              the variance
            </>,
            <>
              The rest: transcription factor binding, enhancer looping, RNA stability,
              other post-transcriptional control
            </>,
            <>Target is 1 ENCODE sample, no replicates &mdash; some of that gap is probably noise, not biology</>,
          ]}
        />
      </div>
    </div>
  );
}

function MethodPanel() {
  return (
    <div className="grid max-w-[68ch] gap-10">
      <Block title="Data">
        <Bullets
          items={[
            <>Cell line: H1-derived neuronal progenitor cells</>,
            <>4 histone marks: H3K4me1, H3K4me3, H3K27ac, H3K27me3 (NIH Roadmap Epigenomics)</>,
            <>Expression: ENCODE RNA-seq, accession ENCFF572SPV</>,
            <>27,251 genes with both histone + expression data</>,
            <>Class project with Heather Ho, San Jose State University</>,
          ]}
        />
      </Block>

      <div>
        <h3 className="text-sm font-medium tracking-wide text-slate-900">
          Preprocessing
        </h3>
        <Bullets
          items={[
            <>FastQC, then Trimmomatic (trim + adapter removal, ~15% of reads kept)</>,
            <>Bowtie2, align to hg38</>,
            <>log2(ChIP / input) ratio</>,
            <>deepTools computeMatrix: 80 bins &times; 50bp, &plusmn;2kb around TSS</>,
          ]}
        />
        <CodeBlock>{`trimmomatic SE -threads 4 -phred33 SRR179594.fastq SRR179594_trim.fastq \\
  HEADCROP:10 LEADING:15 TRAILING:15 SLIDINGWINDOW:4:19 MINLEN:35

bowtie2 --no-unal -p 8 -x hg38_index/hg38 \\
  -U H3K4me3_trim.fastq -S hg38_H3K4me3_output.sam

computeMatrix reference-point -S H3K4me1.log2.bw H3K4me3.log2.bw \\
  H3K27ac.log2.bw H3K27me3.log2.bw -R TSS_refseq_gene.bed \\
  -a 2000 -b 2000 --binSize 50 --skipZeros \\
  --outFileNameMatrix histoneTssMatrix.tab`}</CodeBlock>
      </div>

      <Block title="Feature engineering">
        <Bullets
          items={[
            <>320 raw bins + 6 engineered = 326 features total</>,
            <>Core-TSS mean &times; 4 marks</>,
            <>H3K4me3 &times; H3K27ac (active &times; active)</>,
            <>H3K27me3 / H3K4me3 (repressive : active ratio)</>,
          ]}
        />
      </Block>

      <Block title="Grounded in prior work">
        <Bullets
          items={[
            <>H3K4me3, H3K27ac, H3K4me1 &rarr; &uarr; expression</>,
            <>
              H3K27me3 &rarr; &darr; expression (
              <a
                href="https://doi.org/10.2217/epi.13.13"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
              >
                Dong &amp; Weng, 2013
              </a>
              )
            </>,
            <>
              One exception: H3K4me1 came out elevated in the lowest-expressed genes here, the
              opposite of what that literature predicts
            </>,
          ]}
        />
      </Block>

      <Block title="Target &amp; split">
        <Bullets
          items={[
            <>y = z-score(log2(count + 1))</>,
            <>80/20 split, grouped by chromosome (GroupShuffleSplit, seed 42)</>,
            <>Avoids leaking signal between neighboring, co-regulated genes</>,
          ]}
        />
      </Block>

      <Block title="Models">
        <Bullets
          items={[
            <>Ridge &mdash; RidgeCV, auto alpha</>,
            <>SVR &mdash; RBF, C=3, gamma=0.001, epsilon=0.2 (grid search)</>,
            <>Random Forest &mdash; 300 trees</>,
            <>HistGradientBoosting</>,
            <>All scikit-learn, CPU only</>,
          ]}
        />
      </Block>

      <Block title="Reproduce">
        <Bullets
          items={[
            <>Repo starts post-alignment, from the processed histone matrix</>,
            <>The FASTQ-to-BAM steps above ran outside the repo, not checked in</>,
            <>
              Source:{" "}
              <a
                href="https://github.com/ssolh2906/Predicting-gene-expression-from-histone-modifications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
              >
                ssolh2906/Predicting-gene-expression-from-histone-modifications
              </a>
            </>,
          ]}
        />
      </Block>
    </div>
  );
}

type Reference = { text: React.ReactNode; url: string };

const REFERENCES: Reference[] = [
  {
    text: <>National Human Genome Research Institute, &quot;Histone,&quot; Talking Glossary of Genetic Terms, Genome.gov.</>,
    url: "https://www.genome.gov/genetics-glossary/histone",
  },
  {
    text: <>Biomodal, &quot;How histone modifications impact gene regulation,&quot; Biomodal Blog, 2024.</>,
    url: "https://biomodal.com/blog/how-histone-modifications-impact-gene-regulation/",
  },
  {
    text: <>R. Nakato and T. Sakata, &quot;Methods for ChIP-seq analysis: A practical workflow and advanced applications,&quot; Methods, vol. 187, pp. 44&ndash;53, 2021.</>,
    url: "https://www.sciencedirect.com/science/article/pii/S1046202320300591",
  },
  {
    text: <>&quot;Support Vector Machine (SVM) Algorithm,&quot; GeeksforGeeks, 2025.</>,
    url: "https://www.geeksforgeeks.org/machine-learning/support-vector-machine-algorithm/",
  },
  {
    text: <>&quot;Support Vector Regression (SVR) using Linear and Non-Linear Kernels in Scikit Learn,&quot; GeeksforGeeks, 2025.</>,
    url: "https://www.geeksforgeeks.org/machine-learning/support-vector-regression-svr-using-linear-and-non-linear-kernels-in-scikit-learn/",
  },
  {
    text: <>NIH Roadmap Epigenomics Project, &quot;Data Listings,&quot; GEO.</>,
    url: "https://www.ncbi.nlm.nih.gov/geo/roadmap/epigenomics/",
  },
  {
    text: <>NCBI GEO, GSM818039 &mdash; ChIP-seq, H3K4me1, neural progenitor cells.</>,
    url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM818039",
  },
  {
    text: <>NCBI GEO, GSM767350 &mdash; ChIP-seq, H3K4me3, neural progenitor cells.</>,
    url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM767350",
  },
  {
    text: <>NCBI GEO, GSM818032 &mdash; ChIP-seq, H3K27me3, neural progenitor cells.</>,
    url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM818032",
  },
  {
    text: <>NCBI GEO, GSM753429 &mdash; ChIP-seq, H3K27ac, neural progenitor cells.</>,
    url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM753429",
  },
  {
    text: <>ENCODE Project Consortium, ENCFF572SPV &mdash; RNA-seq aligned BAM (GRCh38, V29 annotation).</>,
    url: "https://www.encodeproject.org/files/ENCFF572SPV/",
  },
  {
    text: <>X. Dong and Z. Weng, &quot;The correlation between histone modifications and gene expression,&quot; Epigenomics, vol. 5, no. 2, pp. 113&ndash;116, 2013.</>,
    url: "https://doi.org/10.2217/epi.13.13",
  },
  {
    text: <>scikit-learn developers, &quot;RBF SVM parameters,&quot; scikit-learn documentation.</>,
    url: "https://scikit-learn.org/stable/auto_examples/svm/plot_rbf_parameters.html",
  },
];

function ReferencesPanel() {
  return (
    <div className="max-w-[68ch]">
      <p className="text-sm text-slate-500">
        From the original project report, written with Heather Ho.
      </p>
      <ol className="mt-6 grid gap-3">
        {REFERENCES.map((ref, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-600">
            <span className="mt-0.5 shrink-0 font-mono text-xs text-slate-400 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              {ref.text}{" "}
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
              >
                link
              </a>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium tracking-wide text-slate-900">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-2 grid gap-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
      <code>{children}</code>
    </pre>
  );
}
