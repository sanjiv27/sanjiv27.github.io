export interface ResearchEntry {
  /** Keep this ID unchanged when editing the title so analytics stays comparable. */
  id: string;
  title: string;
  summary: string;
  driveUrl?: string;
  codeUrl?: string;
  subtitle?: string;
  /** Exact phrases in the summary to emphasize; plain text only. */
  highlights?: readonly string[];
}

// Add verified research entries here. See docs/RESEARCH_AND_ANALYTICS.md.
export const RESEARCH: readonly ResearchEntry[] = [
  {
    id: "insider-threat-detection",
    title: "Insider Threat Detection",
    subtitle: "Detecting insider threats through behavioral graphs.",
    highlights: ["graph convolutions with LSTM layers", "92.44–94.62% test accuracy"],
    summary:
      "Investigated insider threat detection using employee activity and psychometric data from CMU CERT r4.2. Combined graph convolutions with LSTM layers to capture relationships and behavior over time, reporting 92.44–94.62% test accuracy across four dataset partitions against GCN and Capsule GNN baselines.",
    driveUrl:
      "https://drive.google.com/file/d/1bCHEtN4vZW8GLe8qGNPjO_21LSFXwIm1/view?usp=sharing",
  },
  {
    id: "overtool",
    codeUrl: "https://github.com/ChetanMadadi/MCP-Attacks-Overtool",
    title: "OverTool",
    subtitle: "Slowdown attacks on tool-using LLM agents.",
    highlights: ["decoy prompts", "evaluation metrics and execution-trace analysis"],
    summary:
      "Studied how decoy prompts induce redundant reasoning and tool calls in MCP-based LLM agents, using an environment with 246 tools across 26 servers. Contributed evaluation metrics and execution-trace analysis to assess runtime, token usage, and task completion, revealing both costly tool misuse and misleading success scores when smaller models skipped execution.",
    driveUrl: "https://drive.google.com/file/d/1tKXF70R1HJinx8r8Y9_GqekZke-GYqHJ/view?usp=sharing",
  },
  {
    id: "lro-mrag",
    codeUrl: "https://github.com/sanjiv27/LRO-mRAG",
    title: "LRO-mRAG",
    subtitle: "Lightweight reflective optimization for multi-agent RAG.",
    highlights: ["reflective advice without model retraining", "source-matching accuracy from 60% to 66%"],
    summary:
      "Explored improving multi-agent RAG by turning execution traces into reflective advice without model retraining. Ran baseline benchmarks and analyzed failure modes to inform the advice given to the coordinating agent. On 325 MSRS Story questions, the reflective approach improved source-matching accuracy from 60% to 66% and token F1 from 0.94 to 0.95 over the standard 7B baseline.",
    driveUrl: "https://drive.google.com/file/d/1bYiksk7tN0UK490huL8ldYkvkhUDZ9_J/view?usp=sharing",
  },
  {
    id: "asset-recommendation-system",
    title: "Asset Recommendation System",
    subtitle: "Hybrid asset ranking from transactions, features, and investor profiles.",
    highlights: ["SVD-based collaborative filtering", "generates recommendations asynchronously"],
    summary:
      "Built a financial asset recommendation prototype using FAR-Trans data. Blends SVD-based collaborative filtering, asset similarity, and investor profiles to rank recommendations, with recent interactions used as an additional scoring signal. A Kafka worker generates recommendations asynchronously behind a FastAPI service, with PostgreSQL storage and a Streamlit interface for browsing assets and managing watchlists.",
    codeUrl: "https://github.com/sanjiv27/asset-recommendation-system",
  },
  {
    id: "imagination-reward-hacking",
    title: "Imagination Reward Hacking",
    subtitle: "Reward misspecification in DreamerV3 world-model learning.",
    highlights: ["scalar and achievement-augmented experiments", "independent measures of task performance"],
    summary:
      "Investigated how a wood-collection reward bonus can inflate DreamerV3's training score without improving native Crafter behavior. Ran scalar and achievement-augmented experiments and analyzed reward and health traces as part of a comparison with multi-objective learning. The single-seed study highlights why optimized reward must be checked against independent measures of task performance.",
    codeUrl: "https://github.com/sanjiv27/dreamerv3",
  },
  {
    id: "cachegen",
    title: "CacheGen Verification",
    subtitle: "KV cache compression and its trade-offs in LLM serving.",
    highlights: ["3.29× compression", "reconstruction overhead"],
    summary:
      "Evaluated a CacheGen-style pipeline for compressing and reconstructing LLM key-value caches using quantization, delta encoding, and Zstandard. The offline GPT-2/WikiText-2 study reported 3.29× compression with negligible perplexity change. Single-A100 vLLM experiments did not reproduce a latency speedup, highlighting how reconstruction overhead can outweigh transfer savings in the tested serving setup.",
    driveUrl: "https://drive.google.com/file/d/11nbdDFe0aaR-4daBzA0U8eNez042cVjg/view?usp=sharing",
    codeUrl: "https://github.com/sanjiv27/cachegen",
  },
];
