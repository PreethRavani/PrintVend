const catalogService = require('../services/catalogService');

const BRANCH_LIST = [
  { code: 'CS', name: 'Computer Science' },
  { code: 'IT', name: 'Information Technology' },
  { code: 'CSEDS', name: 'CSE - Data Science' },
  { code: 'AIDS', name: 'AI & Data Science' },
  { code: 'AIML', name: 'AI & Machine Learning' },
  { code: 'ICB', name: 'IoT & Cyber Security' },
  { code: 'EXTC', name: 'Electronics & Telecom' },
  { code: 'MECH', name: 'Mechanical Engineering' }
];

const YEAR_LIST = [
  { code: 'FY', name: 'First Year (1st)' },
  { code: 'SY', name: 'Second Year (2nd)' },
  { code: 'TY', name: 'Third Year (3rd)' },
  { code: 'BE', name: 'Final Year (4th)' }
];

exports.getCatalog = async (req, res, next) => {
  try {
    const { branch = 'CS', year = 'TY', category } = req.query;

    const documents = catalogService.getCatalogDocuments({
      branch,
      year,
      category
    });

    res.json({
      success: true,
      data: {
        branches: BRANCH_LIST,
        years: YEAR_LIST,
        documents,
        total: documents.length,
        selectedBranch: branch.toUpperCase(),
        selectedYear: year.toUpperCase()
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.addCatalogDocument = async (req, res, next) => {
  try {
    const sessionId = req.body.sessionId || req.params.sessionId || req.headers['x-session-id'];
    const { catalogId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing session ID', code: 'MISSING_SESSION_ID' }
      });
    }

    if (!catalogId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing catalogId', code: 'MISSING_CATALOG_ID' }
      });
    }

    const document = await catalogService.addCatalogDocumentToSession(sessionId, catalogId);

    res.status(201).json({
      success: true,
      message: 'Official college document added to print session',
      data: { document }
    });
  } catch (err) {
    next(err);
  }
};
