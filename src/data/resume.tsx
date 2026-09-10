import { Icons } from "@/components/icons";
import { HomeIcon, FlaskConical } from "lucide-react";

export const DATA = {
  name: "Sanjiv Kumaran Mohanraj",
  initials: "SKM",
  resumeUrl: "https://drive.google.com/file/d/1-meTHZpVVUmJj_80qamI8mwn4lzxcH2h/view?usp=sharing",
  url: "https://sanjiv27.github.io",
  location: "Amherst",
  locationLink: "https://www.google.com/maps/place/amherst",
  description:
    "CS grad student. Experienced in building scalable, low-latency systems. Research interests in AI security and alignment.",
  summary:
    "Born and raised in South India where every conversation is a linguistic adventure - you might start in Tamil, switch to English mid-sentence, and throw in some Hindi for good measure. Growing up in this chaos made me obsessed with how humans communicate and understand each other.\n\nThat curiosity somehow led me down the rabbit hole of wondering what happens when machines get really good at understanding us. Now I'm at UMass Amherst trying to figure out how to keep AGI aligned with human values because someone's gotta make sure our future robot overlords are actually friendly.\n\nWhen I'm not pondering existential AI risks, you'll find me hiking New England trails, getting competitive over literally any sport, or destroying people at chess (sorry not sorry). Always down for a good conversation about life, philosophy, or why spicy food is objectively superior.",
  avatarUrl: "/me.jpeg",

  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/research/", icon: FlaskConical, label: "Research" },
  ],
  contact: {
    email: "smohanraj@umass.edu",
    tel: "+1-413-430-9032",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/sanjiv27",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/sanjivkumaran",
        icon: Icons.linkedin,
        navbar: true,
      },

      email: {
        name: "Send Email",
        url: "mailto:sanjivkumaran.work@gmail.com",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  technicalExperience: [
    {
      id: "mathworks",
      company: "MathWorks",
      href: "https://www.mathworks.com/",
      badges: [],
      title: "Software Engineering Intern",
      logoUrl: "/mathworks.png",
      start: "May 2026",
      end: "August 2026",
      bullets: [
        "Extended Simulink's C++ compilation pipeline with compile-time transformations and UI support for Bidirectional Bus Ports, while reducing compile time by 90%.",
        "Built an LLM-powered knowledge graph to query Simulink compilation phases and dependencies."
      ],
    },
    {
      id: "bny-mellon",
      company: "BNY Mellon",
      href: "https://www.bny.com/",
      badges: [],
      location: "Chennai, India",
      title: "Associate",
      logoUrl: "/bnymellon.png",
      start: "July 2023",
      end: "August 2025", // or "Month Year"
      bullets: [
        "General Role: Built 4 command centers for critical ETF applications with neat UIs for querying and manipulating operational data; served as SME for 2 major ETF applications; developed AI tools to improve team efficiency; led cross-team efforts to resolve over 50 production incidents; won multiple AI hackathons.",
        "Built a data transformation framework with a React UI and Kotlin DataFrames, enabling configurable workflows for multiple file formats via a custom DSL built with ANTLR; automated ingestion pipelines integrating databases and Amazon S3 and persisted transformation metadata in MongoDB.",
        "Pioneered a security exception clearance platform simplifying ETF basket creation for 50+ ETF issuers; reduced application load times by 10× through optimized SQL procedures, Angular rendering behavior, and in-memory caching.",
        "Developed a generic distributed Java cache library using Hazelcast with a unified CRUD interface, reducing boilerplate code by 60% and adopted by six teams as a Maven dependency."
      ],
    },
    {
      id: "oracle",
      company: "Oracle",
      href: "https://www.oracle.com/",
      badges: [],
      location: "Chennai, India",
      title: "Summer Intern",
      logoUrl: "/oracle.png",
      start: "June 2022",
      end: "July 2022", // or "Month Year"
      bullets: [
        "Developed a context-aware multilingual AI chatbot; containerized services using Docker and integrated deployments across Slack and Microsoft Teams, reducing manual HR intervention by approximately 70% through automated intent handling and Python-based testing."
      ],
    },
    // Add more work experiences here
  ],
  education: [
    {
      id: "umass-amherst",
      school: "University of Massachusetts - Amherst",
      href: "https://www.umass.edu/",
      degree: "Masters, Computer Science",
      logoUrl: "/umass.png",
      start: "2025",
      end: "2027",
    },
    {
      id: "nit-trichy",
      school: "National Institute of Technology - Tiruchirappalli",
      href: "https://www.nitt.edu/",
      degree: "Bachelor of Technology, Computer Science and Engineering",
      logoUrl: "/nitt.png",
      start: "2019",
      end: "2023",
    },
  ],
  projects: [
    {
      id: "imagination-reward-hacking",
      title: "Imagination Reward Hacking",
      href: "https://github.com/sanjiv27/dreamerv3",
      dates: "2026",
      active: true,
      description:
        "Studied reward misspecification in DreamerV3 on Crafter. Ran scalar and achievement-augmented experiments, comparing training reward with native reward and health to examine when higher scores mask weaker task performance.",
      technologies: ["Python", "JAX", "DreamerV3", "Crafter", "Reinforcement Learning"],
      links: [
        {
          type: "Source",
          href: "https://github.com/sanjiv27/dreamerv3",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      id: "cachegen",
      title: "CacheGen Verification",
      href: "https://github.com/sanjiv27/cachegen",
      dates: "2026",
      active: true,
      description:
        "Evaluated KV cache compression for LLM serving. Reported 3.29× offline compression with negligible perplexity change; single-A100 vLLM experiments showed how reconstruction overhead can outweigh transfer savings.",
      technologies: ["Python", "PyTorch", "vLLM", "Hugging Face", "Zstandard", "LLM Serving"],
      links: [
        {
          type: "Source",
          href: "https://github.com/sanjiv27/cachegen",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      id: "asset-recommendation",
      title: "Asset Recommendation System",
      href: "https://github.com/sanjiv27/asset-recommendation-system",
      dates: "2025",
      active: true,
      description:
        "Built a hybrid ML recommendation engine combining collaborative filtering (SVD), content-based, and demographic analysis. Implemented distributed microservices with FastAPI, Kafka, PostgreSQL achieving under 100ms latency for 1K+ users. Features real-time retraining, model versioning, and containerized deployment.",
      technologies: [
        "Python",
        "FastAPI",
        "Kafka",
        "PostgreSQL",
        "Docker",
        "Scikit-learn",
        "Streamlit",
        "SVD",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/sanjiv27/asset-recommendation-system",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      id: "overtool",
      title: "OverTool - Slowdown Attacks on MCP-based LLM agents",
      href: "https://github.com/ChetanMadadi/MCP-Attacks-Overtool/",
      dates: "2025",
      active: true,
      description:
        "Led a 3-member team to design and benchmark adversarial Slowdown attacks on a full-stack Python/FastMCP tool-using agent pipeline; crafted long-horizon decoy tool-call chains to stress test the request pipeline and context window, causing 3× higher response latency and 20% lower task completion.",
      technologies: [
        "Python",
        "PyTorch",
        "FastAPI",
        "FastMCP",
        "LLM",
        "Adversarial ML",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/ChetanMadadi/MCP-Attacks-Overtool/",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
  ],
  // Retained for future use; only projects above appear in Latest Work.
  archivedProjects: [
    {
      id: "unitrade",
      title: "UniTrade - Campus Marketplace Platform",
      href: "https://github.com/SuyashManiyar/UniTrade-Campus-Marketplace",
      dates: "2025",
      active: true,
      description:
        "Built a campus-exclusive full-stack marketplace with secure JWT-based authentication and role-based access control (RBAC); enabled real-time auctions, messaging, and notifications via Socket.IO, AI-powered semantic search using Google Gemini, and scalable REST APIs with admin moderation to ensure platform safety and reliability.",
      technologies: [
        "Next.js",
        "Node.js",
        "Express",
        "Prisma",
        "PostgreSQL",
        "Socket.IO",
        "JWT",
        "Google Gemini",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/SuyashManiyar/UniTrade-Campus-Marketplace",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      id: "electoral-family-tree",
      title: "Electoral Roll Family Tree System",
      href: "https://github.com/sanjiv27/electoral-family-tree",
      dates: "2023 - 2024",
      active: false,
      description:
        "Built a scalable system to generate detailed family trees from electoral roll data, using OpenCV and Tesseract for extraction, Apache Spark for large-scale processing, and Neo4j for modeling complex relationships.",
      technologies: [
        "Apache Spark",
        "Tesseract",
        "OpenCV",
        "Neo4j",
        "Python",
        "OCR",
        "Graph Database",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/sanjiv27/electoral-family-tree",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
  ],
} as const;
