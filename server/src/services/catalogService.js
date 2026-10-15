const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const PrintSession = require('../models/PrintSession');
const config = require('../config/config');
const logger = require('../utils/logger');

// Comprehensive official college document catalog
const OFFICIAL_COLLEGE_CATALOG = [
  // ===================== UNIVERSAL COLLEGE FORMS (ALL / ALL) =====================
  {
    id: 'form-bonafide-cert',
    branch: 'ALL',
    year: 'ALL',
    category: 'College Form',
    code: 'ADM-01',
    title: 'Bonafide & Character Certificate Application Form',
    subject: 'Academic Administration',
    pageCount: 1,
    fileSizeBytes: 142000,
    description: 'Standard college application form for scholarship, passport, and bank verification.'
  },
  {
    id: 'form-railway-concession',
    branch: 'ALL',
    year: 'ALL',
    category: 'College Form',
    code: 'ADM-02',
    title: 'Railway & Bus Travel Concession Form',
    subject: 'Student Welfare',
    pageCount: 1,
    fileSizeBytes: 128000,
    description: 'Suburban railway and public transit pass discount application form.'
  },
  {
    id: 'form-exam-undertaking',
    branch: 'ALL',
    year: 'ALL',
    category: 'College Form',
    code: 'EXAM-03',
    title: 'Duplicate Hall Ticket & Exam Undertaking Form',
    subject: 'Examination Cell',
    pageCount: 2,
    fileSizeBytes: 195000,
    description: 'Declaration form for lost hall tickets and semester exam entry authorization.'
  },
  {
    id: 'tmpl-journal-frontpage',
    branch: 'ALL',
    year: 'ALL',
    category: 'Submission Template',
    code: 'ACAD-04',
    title: 'Official Laboratory Journal Front Page & Index Sheet',
    subject: 'Academic Submissions',
    pageCount: 2,
    fileSizeBytes: 168000,
    description: 'Mandatory college journal title sheet with faculty sign-off grid and rubric.'
  },
  {
    id: 'form-library-noc',
    branch: 'ALL',
    year: 'ALL',
    category: 'College Form',
    code: 'LIB-05',
    title: 'Central Library No-Dues & Clearance Certificate',
    subject: 'Library Services',
    pageCount: 1,
    fileSizeBytes: 115000,
    description: 'Clearance verification slip required for term-end and final degree convocation.'
  },

  // ===================== CS (Computer Science) =====================
  {
    id: 'cs-fy-cprog-lab',
    branch: 'CS',
    year: 'FY',
    category: 'Lab Manual',
    code: 'CS101L',
    title: 'Structured Programming in C — Lab Manual & Problem Sheets',
    subject: 'Programming Fundamentals',
    pageCount: 6,
    fileSizeBytes: 420000,
    description: 'Experiments 1 through 10 covering pointers, memory allocation, and file I/O.'
  },
  {
    id: 'cs-fy-maths1-assign',
    branch: 'CS',
    year: 'FY',
    category: 'Assignment Sheet',
    code: 'BSC102',
    title: 'Engineering Mathematics-I — Matrix & Calculus Assignment',
    subject: 'Basic Sciences',
    pageCount: 3,
    fileSizeBytes: 210000,
    description: 'Eigenvalues, Taylor series expansion, and multivariable differentiation problems.'
  },
  {
    id: 'cs-sy-dsa-lab',
    branch: 'CS',
    year: 'SY',
    category: 'Lab Manual',
    code: 'CS301L',
    title: 'Data Structures & Algorithms Laboratory Workbook',
    subject: 'Data Structures',
    pageCount: 8,
    fileSizeBytes: 560000,
    description: 'Hands-on specs for AVL trees, Graph Traversals (BFS/DFS), and Dijkstra Algorithm.'
  },
  {
    id: 'cs-sy-dbms-sheet',
    branch: 'CS',
    year: 'SY',
    category: 'Assignment Sheet',
    code: 'CS303',
    title: 'Database Management Systems — SQL Schema & Query Set',
    subject: 'DBMS',
    pageCount: 4,
    fileSizeBytes: 280000,
    description: 'DDL/DML problems, normalization (1NF-BCNF) exercises, and ER modeling.'
  },
  {
    id: 'cs-ty-os-lab',
    branch: 'CS',
    year: 'TY',
    category: 'Lab Manual',
    code: 'CS501L',
    title: 'Operating Systems & Kernel Programming Lab Manual',
    subject: 'Operating Systems',
    pageCount: 7,
    fileSizeBytes: 490000,
    description: 'POSIX thread synchronization, Semaphore implementation, and CPU scheduling.'
  },
  {
    id: 'cs-ty-cn-assign',
    branch: 'CS',
    year: 'TY',
    category: 'Assignment Sheet',
    code: 'CS502',
    title: 'Computer Networks — Socket Programming & Packet Analysis Sheet',
    subject: 'Computer Networks',
    pageCount: 4,
    fileSizeBytes: 310000,
    description: 'Wireshark packet tracing, TCP 3-way handshake analysis, and sliding window protocol.'
  },
  {
    id: 'cs-be-capstone-synopsis',
    branch: 'CS',
    year: 'BE',
    category: 'Submission Template',
    code: 'CS701P',
    title: 'BE Final Year Capstone Project Synopsis & Review-I Template',
    subject: 'Major Project',
    pageCount: 5,
    fileSizeBytes: 340000,
    description: 'Accredited format for project architecture, literature review, and milestone timeline.'
  },
  {
    id: 'cs-be-cloud-lab',
    branch: 'CS',
    year: 'BE',
    category: 'Lab Manual',
    code: 'CS702L',
    title: 'Cloud Computing & Microservices Architecture Lab Sheet',
    subject: 'Cloud Computing',
    pageCount: 6,
    fileSizeBytes: 450000,
    description: 'Docker containerization, Kubernetes cluster deployments, and AWS Lambda serverless.'
  },

  // ===================== IT (Information Technology) =====================
  {
    id: 'it-fy-python-lab',
    branch: 'IT',
    year: 'FY',
    category: 'Lab Manual',
    code: 'IT102L',
    title: 'Python for Computational Problem Solving Lab Manual',
    subject: 'Python Basics',
    pageCount: 5,
    fileSizeBytes: 380000,
    description: 'Exercises on data structures, regex, list comprehensions, and NumPy foundations.'
  },
  {
    id: 'it-sy-webtech-lab',
    branch: 'IT',
    year: 'SY',
    category: 'Lab Manual',
    code: 'IT302L',
    title: 'Full-Stack Web Development Lab Manual (MERN & APIs)',
    subject: 'Web Technologies',
    pageCount: 7,
    fileSizeBytes: 510000,
    description: 'Responsive UI building, REST API endpoints, JWT auth, and state management.'
  },
  {
    id: 'it-sy-oops-assign',
    branch: 'IT',
    year: 'SY',
    category: 'Assignment Sheet',
    code: 'IT304',
    title: 'Object-Oriented Programming in Java — Design Patterns Sheet',
    subject: 'OOP Java',
    pageCount: 3,
    fileSizeBytes: 220000,
    description: 'Polymorphism, Factory/Observer patterns, and exception handling assignments.'
  },
  {
    id: 'it-ty-devops-lab',
    branch: 'IT',
    year: 'TY',
    category: 'Lab Manual',
    code: 'IT501L',
    title: 'DevOps & CI/CD Pipeline Automation Lab Manual',
    subject: 'DevOps',
    pageCount: 6,
    fileSizeBytes: 430000,
    description: 'GitHub Actions, Jenkins pipelines, Terraform scripts, and SonarQube linting.'
  },
  {
    id: 'it-ty-infosec-assign',
    branch: 'IT',
    year: 'TY',
    category: 'Assignment Sheet',
    code: 'IT503',
    title: 'Information Security & Cryptography Tutorial Problem Set',
    subject: 'Information Security',
    pageCount: 4,
    fileSizeBytes: 290000,
    description: 'RSA encryption, AES key schedule, SHA-256 hashing, and digital signature proofs.'
  },
  {
    id: 'it-be-enterprise-lab',
    branch: 'IT',
    year: 'BE',
    category: 'Lab Manual',
    code: 'IT701L',
    title: 'Enterprise Architecture & Cloud Security Lab Experiments',
    subject: 'Enterprise Tech',
    pageCount: 6,
    fileSizeBytes: 440000,
    description: 'OAuth2/SAML flows, microservices zero-trust perimeter, and Kafka event streaming.'
  },

  // ===================== CSEDS (CSE - Data Science) =====================
  {
    id: 'cseds-fy-stat-sheet',
    branch: 'CSEDS',
    year: 'FY',
    category: 'Assignment Sheet',
    code: 'DS101',
    title: 'Descriptive & Inferential Statistics Tutorial Problems',
    subject: 'Statistics',
    pageCount: 4,
    fileSizeBytes: 275000,
    description: 'Probability distributions, central limit theorem, and hypothesis testing (t-test, ANOVA).'
  },
  {
    id: 'cseds-sy-datawrangling-lab',
    branch: 'CSEDS',
    year: 'SY',
    category: 'Lab Manual',
    code: 'DS302L',
    title: 'Data Wrangling, Cleaning & EDA Lab Experiments Guide',
    subject: 'Data Science Core',
    pageCount: 7,
    fileSizeBytes: 520000,
    description: 'Pandas pipelines, missing data imputation, outlier detection, and Seaborn visualization.'
  },
  {
    id: 'cseds-ty-ml-lab',
    branch: 'CSEDS',
    year: 'TY',
    category: 'Lab Manual',
    code: 'DS501L',
    title: 'Machine Learning Engineering Lab Manual & Benchmark Tasks',
    subject: 'Machine Learning',
    pageCount: 8,
    fileSizeBytes: 590000,
    description: 'Cross-validation, hyperparameter tuning, Random Forests, XGBoost, and ROC evaluation.'
  },
  {
    id: 'cseds-be-bigdata-lab',
    branch: 'CSEDS',
    year: 'BE',
    category: 'Lab Manual',
    code: 'DS701L',
    title: 'Big Data Analytics with Apache Spark & Hadoop Lab Guide',
    subject: 'Big Data',
    pageCount: 7,
    fileSizeBytes: 510000,
    description: 'PySpark DataFrames, RDD operations, distributed joins, and real-time streaming.'
  },

  // ===================== AIDS (AI & Data Science) =====================
  {
    id: 'aids-fy-lin-alg',
    branch: 'AIDS',
    year: 'FY',
    category: 'Assignment Sheet',
    code: 'AD102',
    title: 'Linear Algebra for Machine Learning — Problem Set',
    subject: 'Mathematics',
    pageCount: 3,
    fileSizeBytes: 240000,
    description: 'Matrix decompositions, SVD, vector projections, and gradient descent derivation.'
  },
  {
    id: 'aids-sy-ai-search-lab',
    branch: 'AIDS',
    year: 'SY',
    category: 'Lab Manual',
    code: 'AD301L',
    title: 'Artificial Intelligence & Heuristic Search Lab Experiments',
    subject: 'Artificial Intelligence',
    pageCount: 6,
    fileSizeBytes: 460000,
    description: 'A* algorithm, Alpha-Beta minimax pruning, constraint satisfaction, and prolog.'
  },
  {
    id: 'aids-ty-deeplearning-lab',
    branch: 'AIDS',
    year: 'TY',
    category: 'Lab Manual',
    code: 'AD501L',
    title: 'Deep Learning & Neural Networks PyTorch Lab Manual',
    subject: 'Deep Learning',
    pageCount: 8,
    fileSizeBytes: 620000,
    description: 'Backpropagation, CNN image classification, LSTM time-series, and model pruning.'
  },
  {
    id: 'aids-be-nlp-lab',
    branch: 'AIDS',
    year: 'BE',
    category: 'Lab Manual',
    code: 'AD701L',
    title: 'Natural Language Processing & LLM Fine-Tuning Lab Guide',
    subject: 'NLP',
    pageCount: 7,
    fileSizeBytes: 530000,
    description: 'Tokenization, Attention transformers, BERT embeddings, and LoRA instruction tuning.'
  },

  // ===================== AIML (AI & Machine Learning) =====================
  {
    id: 'aiml-fy-python-ai',
    branch: 'AIML',
    year: 'FY',
    category: 'Lab Manual',
    code: 'AL101L',
    title: 'Python for Artificial Intelligence Fundamentals Lab Manual',
    subject: 'Python for AI',
    pageCount: 5,
    fileSizeBytes: 390000,
    description: 'Vectorized computing, matrix operations, and basic probabilistic reasoning.'
  },
  {
    id: 'aiml-sy-pattern-rec-sheet',
    branch: 'AIML',
    year: 'SY',
    category: 'Assignment Sheet',
    code: 'AL302',
    title: 'Pattern Recognition & Feature Extraction Problem Sheet',
    subject: 'Pattern Recognition',
    pageCount: 4,
    fileSizeBytes: 285000,
    description: 'PCA dimension reduction, LDA classification, and clustering distance metrics.'
  },
  {
    id: 'aiml-ty-cv-lab',
    branch: 'AIML',
    year: 'TY',
    category: 'Lab Manual',
    code: 'AL501L',
    title: 'Computer Vision & OpenCV Image Processing Lab Experiments',
    subject: 'Computer Vision',
    pageCount: 7,
    fileSizeBytes: 540000,
    description: 'Edge detection filters, Hough transforms, YOLO object detection, and feature matching.'
  },
  {
    id: 'aiml-be-rl-lab',
    branch: 'AIML',
    year: 'BE',
    category: 'Lab Manual',
    code: 'AL701L',
    title: 'Reinforcement Learning & Autonomous Agents Lab Manual',
    subject: 'Reinforcement Learning',
    pageCount: 7,
    fileSizeBytes: 520000,
    description: 'Q-Learning, Policy Gradients, Gymnasium environments, and Deep Q-Networks (DQN).'
  },

  // ===================== ICB (IoT & Cyber Security inc. Blockchain) =====================
  {
    id: 'icb-fy-iot-basics-lab',
    branch: 'ICB',
    year: 'FY',
    category: 'Lab Manual',
    code: 'IC101L',
    title: 'Introduction to Sensors, Microcontrollers & Arduino Lab',
    subject: 'IoT Hardware',
    pageCount: 5,
    fileSizeBytes: 390000,
    description: 'GPIO programming, ultrasonic sensor interfacing, and serial communication.'
  },
  {
    id: 'icb-sy-crypt-lab',
    branch: 'ICB',
    year: 'SY',
    category: 'Lab Manual',
    code: 'IC301L',
    title: 'Applied Cryptography & Network Security Lab Experiments',
    subject: 'Cyber Security',
    pageCount: 6,
    fileSizeBytes: 460000,
    description: 'Hash chain verification, public-key infrastructure, SSL/TLS handshake emulation.'
  },
  {
    id: 'icb-ty-blockchain-lab',
    branch: 'ICB',
    year: 'TY',
    category: 'Lab Manual',
    code: 'IC501L',
    title: 'Smart Contracts & Ethereum Blockchain Development Manual',
    subject: 'Blockchain',
    pageCount: 8,
    fileSizeBytes: 580000,
    description: 'Solidity contracts, Hardhat compilation, ERC-20 token standard, and MetaMask interaction.'
  },
  {
    id: 'icb-be-pen-test-sheet',
    branch: 'ICB',
    year: 'BE',
    category: 'Assignment Sheet',
    code: 'IC702',
    title: 'Ethical Hacking & Vulnerability Assessment Lab Sheet',
    subject: 'Ethical Hacking',
    pageCount: 5,
    fileSizeBytes: 370000,
    description: 'Nmap vulnerability scanning, Metasploit penetration testing, and OWASP Top 10 exploits.'
  },

  // ===================== EXTC (Electronics & Telecommunication) =====================
  {
    id: 'extc-fy-bee-lab',
    branch: 'EXTC',
    year: 'FY',
    category: 'Lab Manual',
    code: 'EX101L',
    title: 'Basic Electrical & Electronics Circuits Lab Manual',
    subject: 'Basic Electronics',
    pageCount: 5,
    fileSizeBytes: 395000,
    description: 'Thevenin/Norton theorem verification, oscilloscope usage, and diode rectification.'
  },
  {
    id: 'extc-sy-signals-sheet',
    branch: 'EXTC',
    year: 'SY',
    category: 'Assignment Sheet',
    code: 'EX302',
    title: 'Signals & Systems — Fourier & Z-Transform Problem Set',
    subject: 'Signals & Systems',
    pageCount: 4,
    fileSizeBytes: 310000,
    description: 'Convolution integrals, DTFT spectrum calculation, and pole-zero stability analysis.'
  },
  {
    id: 'extc-ty-dsp-lab',
    branch: 'EXTC',
    year: 'TY',
    category: 'Lab Manual',
    code: 'EX501L',
    title: 'Digital Signal Processing (DSP) MATLAB Lab Manual',
    subject: 'DSP',
    pageCount: 7,
    fileSizeBytes: 530000,
    description: 'FFT algorithm implementation, Butterworth/Chebyshev digital filter design.'
  },
  {
    id: 'extc-be-wireless-assign',
    branch: 'EXTC',
    year: 'BE',
    category: 'Assignment Sheet',
    code: 'EX701',
    title: '5G Mobile Wireless Communication & MIMO Systems Sheet',
    subject: 'Wireless Comm',
    pageCount: 4,
    fileSizeBytes: 330000,
    description: 'Beamforming equations, Rayleigh fading model, and OFDM modulation calculation.'
  },

  // ===================== MECH (Mechanical Engineering) =====================
  {
    id: 'mech-fy-engg-drawing',
    branch: 'MECH',
    year: 'FY',
    category: 'Assignment Sheet',
    code: 'ME101',
    title: 'Engineering Graphics & Orthographic Projection Sheet',
    subject: 'Engineering Graphics',
    pageCount: 3,
    fileSizeBytes: 420000,
    description: 'Isometric to orthographic projections, section of solids, and isometric views.'
  },
  {
    id: 'mech-sy-thermo-sheet',
    branch: 'MECH',
    year: 'SY',
    category: 'Assignment Sheet',
    code: 'ME302',
    title: 'Applied Thermodynamics & Heat Power Engineering Problems',
    subject: 'Thermodynamics',
    pageCount: 4,
    fileSizeBytes: 290000,
    description: 'Rankine cycle efficiency, Otto and Diesel cycles, and steam tables calculation.'
  },
  {
    id: 'mech-ty-cadcam-lab',
    branch: 'MECH',
    year: 'TY',
    category: 'Lab Manual',
    code: 'ME501L',
    title: 'CAD / CAM & CNC G-Code Programming Lab Manual',
    subject: 'CAD/CAM',
    pageCount: 7,
    fileSizeBytes: 560000,
    description: 'SolidWorks parametric 3D modeling, G/M code for CNC turning and milling operations.'
  },
  {
    id: 'mech-be-fem-assign',
    branch: 'MECH',
    year: 'BE',
    category: 'Assignment Sheet',
    code: 'ME701',
    title: 'Finite Element Analysis (FEA) Stress Tensor Problem Set',
    subject: 'FEA',
    pageCount: 4,
    fileSizeBytes: 350000,
    description: '1D bar element stiffness matrix, 2D CST element formulation, and ANSYS benchmarks.'
  }
];

class CatalogService {
  /**
   * Get catalog documents filtered by branch, year, and optional category
   */
  getCatalogDocuments({ branch = 'CS', year = 'TY', category = null }) {
    const targetBranch = (branch || '').toUpperCase();
    const targetYear = (year || '').toUpperCase();

    return OFFICIAL_COLLEGE_CATALOG.filter((item) => {
      // Document matches branch if it matches target or is universally applicable ('ALL')
      const branchMatch = item.branch === 'ALL' || item.branch === targetBranch;
      
      // Document matches year if it matches target or is universally applicable ('ALL')
      const yearMatch = item.year === 'ALL' || item.year === targetYear;

      // Optional category filter
      const categoryMatch = !category || item.category.toLowerCase() === category.toLowerCase();

      return branchMatch && yearMatch && categoryMatch;
    });
  }

  /**
   * Find document by unique catalog ID
   */
  getCatalogDocumentById(id) {
    return OFFICIAL_COLLEGE_CATALOG.find((d) => d.id === id) || null;
  }

  /**
   * Attach a catalog document into an active print session
   */
  async addCatalogDocumentToSession(sessionId, catalogId) {
    if (!sessionId) {
      throw new Error('Session ID is required to add catalog document');
    }

    const session = await PrintSession.findOne({ sessionId });
    if (!session || session.isExpired()) {
      throw new Error('Session is invalid or expired');
    }

    const catalogDoc = this.getCatalogDocumentById(catalogId);
    if (!catalogDoc) {
      throw new Error(`Catalog document with ID '${catalogId}' not found`);
    }

    // Check session document count limit
    const existingCount = await Document.countDocuments({
      sessionId,
      cleanupStatus: { $ne: 'CLEANED' }
    });

    if (existingCount >= config.maxFilesPerSession) {
      throw new Error(`Maximum limit of ${config.maxFilesPerSession} files per session reached.`);
    }

    // Ensure storage path on disk
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }

    const safeFilename = `${catalogDoc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    const storageFilename = `catalog_${catalogDoc.id}_${Date.now()}.pdf`;
    const storagePath = path.join(config.uploadDir, storageFilename);

    // Create a real minimal PDF file buffer on disk so file exists for cleanup/reporting
    const minimalPdfBuffer = Buffer.from(
      `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count ${catalogDoc.pageCount}>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Contents 4 0 R>>endobj\n4 0 obj<</Length 55>>stream\nBT /F1 12 Tf 50 750 Td (${catalogDoc.title}) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000125 00000 n \n0000000215 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n320\n%%EOF`
    );
    try {
      fs.writeFileSync(storagePath, minimalPdfBuffer);
    } catch (e) {
      logger.warn(`Could not create mock physical PDF for catalog item: ${e.message}`);
    }

    const newDoc = await Document.create({
      sessionId,
      originalFilename: safeFilename,
      storageFilename,
      storagePath,
      mimeType: 'application/pdf',
      fileSizeBytes: catalogDoc.fileSizeBytes,
      pageCount: catalogDoc.pageCount,
      uploadStatus: 'UPLOADED',
      cleanupStatus: 'RETAINED',
      source: 'COLLEGE_CATALOG',
      branch: catalogDoc.branch,
      year: catalogDoc.year,
      category: catalogDoc.category,
      courseCode: catalogDoc.code
    });

    logger.info(
      `Added official college document '${catalogDoc.title}' (${catalogDoc.id}) to session ${sessionId}`
    );

    return {
      id: newDoc._id,
      _id: newDoc._id,
      filename: newDoc.originalFilename,
      originalFilename: newDoc.originalFilename,
      fileSizeBytes: newDoc.fileSizeBytes,
      mimeType: newDoc.mimeType,
      pageCount: newDoc.pageCount,
      source: newDoc.source,
      branch: newDoc.branch,
      year: newDoc.year,
      category: newDoc.category,
      courseCode: newDoc.courseCode,
      createdAt: newDoc.createdAt
    };
  }
}

module.exports = new CatalogService();
module.exports.OFFICIAL_COLLEGE_CATALOG = OFFICIAL_COLLEGE_CATALOG;
