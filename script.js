/**
 * TRACE — Intelligent Campus Recovery System (Phase 2)
 * Modular ES6+ Application Architecture:
 *  1. Constants & Initial Demo Dataset
 *  2. State Management
 *  3. LocalStorage Operations
 *  4. Report Creation & Image Upload Processing
 *  5. Smart Matching Algorithm (100-pt Weighted Engine)
 *  6. Search, Filter & Sort
 *  7. Dashboard Analytics Calculations
 *  8. Match Review & Recovery Workflow
 *  9. UI Rendering & Modals
 * 10. Hero 3D Parallax, Counters & Scroll Effects
 * 11. Event Listeners & Form Validation
 */

(() => {
  'use strict';

  const STORAGE_KEY = 'trace_campus_recovery_v2';
  const MATCH_THRESHOLD = 40;
  const MAX_IMAGE_RAW_BYTES = 2 * 1024 * 1024; // 2 MB raw file cap
  const MAX_IMAGE_STORAGE_CHARS = 180000; // ~180 KB data URL budget per image
  const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================================================
     1. CONSTANTS & INITIAL DEMO DATASET
     ======================================================================== */

  const CATEGORY_ICONS = {
    'Electronics': 'bi-headphones',
    'Keys & Access': 'bi-key-fill',
    'Wallets & Cards': 'bi-wallet2',
    'Drinkware': 'bi-cup-straw',
    'Bags & Apparel': 'bi-backpack2',
    'Books & Notes': 'bi-journal-bookmark',
    'Accessories': 'bi-eyeglasses'
  };

  const COLOUR_SWATCHES = {
    'Midnight Black': '#0f172a',
    'Silver / Space Gray': '#94a3b8',
    'Navy Blue': '#1e3a8a',
    'Glacier Cyan': '#06b6d4',
    'Lavender / Lilac': '#a78bfa',
    'Cream / White': '#f1f5f9',
    'Amber / Brass': '#d97706',
    'Crimson Red': '#e11d48',
    'Sage / Olive': '#4d7c0f'
  };

  const COLOUR_FAMILIES = {
    'Midnight Black': 'dark',
    'Navy Blue': 'dark',
    'Silver / Space Gray': 'neutral',
    'Cream / White': 'neutral',
    'Glacier Cyan': 'cool',
    'Lavender / Lilac': 'cool',
    'Amber / Brass': 'warm',
    'Crimson Red': 'warm',
    'Sage / Olive': 'earth'
  };

  const ZONE_PROXIMITY = {
    'Main Library': ['Student Union', 'Engineering Quad', 'Science Hall'],
    'Student Union': ['Main Library', 'Dining Commons', 'West Residence'],
    'Engineering Quad': ['Main Library', 'Science Hall'],
    'Science Hall': ['Engineering Quad', 'Main Library'],
    'Dining Commons': ['Student Union', 'West Residence', 'Athletics Center'],
    'Athletics Center': ['Dining Commons', 'West Residence'],
    'West Residence': ['Student Union', 'Dining Commons', 'Athletics Center']
  };

  const KEYWORD_SYNONYMS = {
    earbuds: 'headphones',
    earphones: 'headphones',
    airpods: 'headphones',
    headset: 'headphones',
    bottle: 'flask',
    hydroflask: 'flask',
    tumbler: 'flask',
    thermos: 'flask',
    keyring: 'keys',
    keychain: 'keys',
    fob: 'keys',
    key: 'keys',
    wallet: 'cardholder',
    sleeve: 'cardholder',
    pouch: 'cardholder',
    holder: 'cardholder',
    notebook: 'journal',
    moleskine: 'journal',
    diary: 'journal',
    stylus: 'pencil',
    glasses: 'eyewear',
    spectacles: 'eyewear',
    specs: 'eyewear',
    backpack: 'bag',
    tote: 'bag',
    satchel: 'bag',
    charger: 'cable',
    adapter: 'cable',
    grey: 'gray',
    charcoal: 'black',
    cyan: 'blue',
    aqua: 'blue'
  };

  const STOP_WORDS = new Set([
    'the', 'and', 'with', 'near', 'from', 'found', 'lost', 'left',
    'this', 'that', 'have', 'has', 'for', 'into', 'around', 'inside',
    'item', 'campus', 'reported', 'small', 'large'
  ]);

  function createSeedData() {
    const now = Date.now();
    const hour = 3600 * 1000;
    const day = 24 * hour;

    return {
      nextIdSeq: 2413,
      matchDecisions: {},
      reports: [
        {
          id: 'TRC-2401',
          type: 'lost',
          name: 'Space Gray AirPods Max Headphones',
          category: 'Electronics',
          colour: 'Silver / Space Gray',
          location: 'Main Library',
          date: '2026-11-24',
          description: 'Left on a 3rd floor silent study desk near the north glass window inside a dark charcoal smart case.',
          custody: 'Owner Inquiry · Verified Student',
          status: 'Lost',
          image: null,
          createdTimestamp: now - 2 * hour
        },
        {
          id: 'TRC-2402',
          type: 'found',
          name: 'Over-Ear Wireless Headphones in Charcoal Case',
          category: 'Electronics',
          colour: 'Silver / Space Gray',
          location: 'Main Library',
          date: '2026-11-24',
          description: 'Found by library staff on Level 3 North Quiet Wing. Space gray aluminum cups inside dark fabric smart case.',
          custody: 'Main Library Info Desk B',
          status: 'Found',
          image: null,
          createdTimestamp: now - 1 * hour
        },
        {
          id: 'TRC-2403',
          type: 'lost',
          name: 'Dorm Keyring with Brass B-402 Tag',
          category: 'Keys & Access',
          colour: 'Amber / Brass',
          location: 'Engineering Quad',
          date: '2026-11-23',
          description: 'Silver split ring holding two dorm keys, one bike U-lock key, and an engraved brass fob marked B-402.',
          custody: 'Owner Inquiry · West Hall',
          status: 'Lost',
          image: null,
          createdTimestamp: now - 5 * hour
        },
        {
          id: 'TRC-2404',
          type: 'found',
          name: 'Three Keys on Ring with Brass Room Fob',
          category: 'Keys & Access',
          colour: 'Amber / Brass',
          location: 'Science Hall',
          date: '2026-11-24',
          description: 'Picked up on the walkway between Engineering Quad and Science Hall atrium. Includes bike U-lock key and brass tag.',
          custody: 'Student Union Desk 104B',
          status: 'Found',
          image: null,
          createdTimestamp: now - 3 * hour
        },
        {
          id: 'TRC-2405',
          type: 'lost',
          name: 'Northridge Student Smart ID & Card Sleeve',
          category: 'Wallets & Cards',
          colour: 'Navy Blue',
          location: 'Student Union',
          date: '2026-11-24',
          description: 'Slim navy leather MagSafe card sleeve containing campus smart ID and transit metro pass near coffee bar.',
          custody: 'Owner Inquiry · Verified Student',
          status: 'Lost',
          image: null,
          createdTimestamp: now - 6 * hour
        },
        {
          id: 'TRC-2406',
          type: 'found',
          name: 'Navy Magnetic Card Holder with Campus ID',
          category: 'Wallets & Cards',
          colour: 'Navy Blue',
          location: 'Student Union',
          date: '2026-11-24',
          description: 'Turned in by barista at Union Espresso Bar. Slim navy card holder with student smart ID and metro card.',
          custody: 'Union Espresso / Desk 104B',
          status: 'Found',
          image: null,
          createdTimestamp: now - 4 * hour
        },
        {
          id: 'TRC-2407',
          type: 'lost',
          name: 'Glacier Cyan Insulated Hydro Flask 32oz',
          category: 'Drinkware',
          colour: 'Glacier Cyan',
          location: 'Athletics Center',
          date: '2026-11-22',
          description: 'Matte light cyan 32oz steel bottle with black straw cap and mountain sticker near the base.',
          custody: 'Owner Inquiry · Intramural Dept',
          status: 'Lost',
          image: null,
          createdTimestamp: now - 26 * hour
        },
        {
          id: 'TRC-2408',
          type: 'found',
          name: 'Light Cyan 32oz Steel Water Bottle',
          category: 'Drinkware',
          colour: 'Glacier Cyan',
          location: 'Dining Commons',
          date: '2026-11-23',
          description: 'Insulated cyan 32oz flask with black loop lid and mountain decal near bottom edge outside Commons.',
          custody: 'Dining Commons Front Desk',
          status: 'Found',
          image: null,
          createdTimestamp: now - 19 * hour
        },
        {
          id: 'TRC-2409',
          type: 'found',
          name: 'Hardcover Moleskine & Apple Pencil',
          category: 'Books & Notes',
          colour: 'Midnight Black',
          location: 'Engineering Quad',
          date: '2026-11-23',
          description: 'Black dotted notebook with Linear Algebra notes and magnetic stylus clipped inside elastic band.',
          custody: 'Engineering Dean Reception',
          status: 'Found',
          image: null,
          createdTimestamp: now - 28 * hour
        },
        {
          id: 'TRC-2410',
          type: 'lost',
          name: 'Lilac Canvas Tote with Lab Goggles',
          category: 'Bags & Apparel',
          colour: 'Lavender / Lilac',
          location: 'Science Hall',
          date: '2026-11-21',
          description: 'Soft lavender canvas tote containing clear chemistry safety goggles and USB-C charging cable.',
          custody: 'Owner Inquiry · Chem 202',
          status: 'Lost',
          image: null,
          createdTimestamp: now - 2 * day
        },
        {
          id: 'TRC-2411',
          type: 'found',
          name: 'Tortoiseshell Prescription Glasses in Case',
          category: 'Accessories',
          colour: 'Amber / Brass',
          location: 'Main Library',
          date: '2026-11-20',
          description: 'Hard cream-colored glasses case containing tortoiseshell eyewear frames from Reading Room B.',
          custody: 'Main Library Info Desk B',
          status: 'Recovered',
          image: null,
          createdTimestamp: now - 3 * day
        },
        {
          id: 'TRC-2412',
          type: 'lost',
          name: 'Tortoiseshell Reading Eyewear & Hard Case',
          category: 'Accessories',
          colour: 'Amber / Brass',
          location: 'Main Library',
          date: '2026-11-20',
          description: 'Lost tortoiseshell glasses in cream hard case after afternoon study session in Reading Room B.',
          custody: 'Owner Inquiry · Verified Student',
          status: 'Recovered',
          image: null,
          createdTimestamp: now - 3 * day - hour
        }
      ],
      activities: [
        {
          type: 'match',
          title: 'Smart Matching Engine initialized across campus',
          detail: 'Evaluating active lost inquiries against verified found desk logs.',
          timestamp: now - 15 * 60 * 1000
        },
        {
          type: 'report',
          title: 'Found log synced: Over-Ear Wireless Headphones',
          detail: 'Main Library Level 3 North Quiet Wing · Info Desk B.',
          timestamp: now - 1 * hour
        },
        {
          type: 'recovered',
          title: 'Verified handoff: Tortoiseshell Glasses (#TRC-2411)',
          detail: 'Returned to owner at Main Library Info Desk B.',
          timestamp: now - 2 * day
        }
      ]
    };
  }

  /* ========================================================================
     2. STATE MANAGEMENT
     ======================================================================== */

  let appState = createSeedData();
  let computedMatches = [];
  let prevKpiSnapshot = {};

  const uiState = {
    reportMode: 'lost',
    matchFilter: 'all',
    browseType: 'all',
    browseCategory: 'all',
    browseLocation: 'all',
    browseStatus: 'all',
    browseSort: 'newest',
    browseSearch: '',
    activeDetailItemId: null,
    activeMatchKey: null,
    pendingConfirmCallback: null,
    uploadedImages: {
      lost: null,
      found: null
    },
    storageRecoveredWarning: false
  };

  /* ========================================================================
     3. LOCALSTORAGE OPERATIONS
     ======================================================================== */

  function isValidReport(r) {
    return (
      r &&
      typeof r.id === 'string' &&
      (r.type === 'lost' || r.type === 'found') &&
      typeof r.name === 'string' &&
      typeof r.category === 'string' &&
      typeof r.colour === 'string' &&
      typeof r.location === 'string' &&
      typeof r.date === 'string' &&
      typeof r.description === 'string' &&
      typeof r.status === 'string'
    );
  }

  function loadStateFromStorage() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        appState = createSeedData();
        saveStateToStorage();
        return;
      }
      const parsed = JSON.parse(raw);
      if (
        !parsed ||
        !Array.isArray(parsed.reports) ||
        !parsed.reports.every(isValidReport) ||
        typeof parsed.matchDecisions !== 'object' ||
        parsed.matchDecisions === null ||
        !Array.isArray(parsed.activities)
      ) {
        throw new Error('Corrupted TRACE storage schema');
      }
      appState = {
        nextIdSeq: Number.isFinite(parsed.nextIdSeq) ? parsed.nextIdSeq : 2500,
        reports: parsed.reports,
        matchDecisions: parsed.matchDecisions,
        activities: parsed.activities
      };
    } catch (err) {
      console.warn('TRACE: Recovering from missing or invalid localStorage data.', err);
      appState = createSeedData();
      uiState.storageRecoveredWarning = true;
      saveStateToStorage();
    }
  }

  function saveStateToStorage() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
      return true;
    } catch (err) {
      // Handle QuotaExceededError gracefully by stripping large embedded images if needed
      try {
        const compactState = {
          ...appState,
          reports: appState.reports.map((r) => ({ ...r, image: null }))
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(compactState));
        showToast(
          'Storage Limit Notice',
          'Browser storage is nearly full. Report metadata was saved, while image previews remain visible for this session only.',
          'warning'
        );
        return false;
      } catch (innerErr) {
        console.error('TRACE: Unable to persist to localStorage.', innerErr);
        return false;
      }
    }
  }

  function resetDemoData() {
    appState = createSeedData();
    uiState.uploadedImages.lost = null;
    uiState.uploadedImages.found = null;
    saveStateToStorage();
    recalculateMatches();
    renderAll();
    showToast('Demo Data Restored', 'All reports, match decisions, and analytics have been reset.', 'info');
  }

  /* ========================================================================
     4. REPORT CREATION & IMAGE UPLOAD PROCESSING
     ======================================================================== */

  function generateReportId() {
    const existingIds = new Set(appState.reports.map((r) => r.id));
    let candidate = `TRC-${appState.nextIdSeq}`;
    while (existingIds.has(candidate)) {
      appState.nextIdSeq += 1;
      candidate = `TRC-${appState.nextIdSeq}`;
    }
    appState.nextIdSeq += 1;
    return candidate;
  }

  function findDuplicateReport(type, name, location, date) {
    const normalized = normalizeString(name);
    return appState.reports.find(
      (r) =>
        r.type === type &&
        r.status !== 'Recovered' &&
        normalizeString(r.name) === normalized &&
        r.location === location &&
        r.date === date
    );
  }

  function createReportRecord({ type, name, category, colour, location, date, description, image }) {
    const id = generateReportId();
    const record = {
      id,
      type,
      name: name.trim(),
      category,
      colour,
      location,
      date,
      description: description.trim(),
      custody: type === 'found' ? `Held by Finder · ${location}` : 'Owner Inquiry · Verified Student',
      status: type === 'lost' ? 'Lost' : 'Found',
      image: image || null,
      createdTimestamp: Date.now()
    };

    appState.reports.unshift(record);
    const newMatches = recalculateMatches();

    const matchedForNew = newMatches.filter(
      (m) => (m.lostId === record.id || m.foundId === record.id) && m.status === 'pending'
    );

    appState.activities.unshift({
      type: matchedForNew.length > 0 ? 'match' : 'report',
      title: `${type === 'lost' ? 'Lost' : 'Found'} report #${record.id}: ${record.name}`,
      detail:
        matchedForNew.length > 0
          ? `${record.location} · ${matchedForNew.length} smart match${matchedForNew.length > 1 ? 'es' : ''} detected (top ${matchedForNew[0].score}%).`
          : `${record.location} · Indexed into Smart Matching Engine.`,
      timestamp: Date.now()
    });

    saveStateToStorage();
    return { record, matchedCount: matchedForNew.length, topScore: matchedForNew[0]?.score || 0 };
  }

  function compressImageDataUrl(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 480;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.76);
        resolve(compressed.length <= MAX_IMAGE_STORAGE_CHARS ? compressed : dataUrl);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  /* ========================================================================
     5. SMART MATCHING ALGORITHM (Weighted 100-Point Deterministic Engine)
        Weights:
          - Category match:          30 pts
          - Name & keyword sim:      30 pts
          - Colour match:            20 pts
          - Location match:          15 pts
          - Date proximity:           5 pts
     ======================================================================== */

  function normalizeString(str) {
    return (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function extractKeywords(text) {
    const rawTokens = normalizeString(text).split(' ').filter(Boolean);
    const tokens = new Set();
    rawTokens.forEach((tok) => {
      if (tok.length < 2 || STOP_WORDS.has(tok)) return;
      const canonical = KEYWORD_SYNONYMS[tok] || tok;
      tokens.add(canonical);
    });
    return tokens;
  }

  function computeKeywordScore(lostItem, foundItem) {
    const lostNameTokens = extractKeywords(lostItem.name);
    const foundNameTokens = extractKeywords(foundItem.name);
    const lostAllTokens = extractKeywords(`${lostItem.name} ${lostItem.description}`);
    const foundAllTokens = extractKeywords(`${foundItem.name} ${foundItem.description}`);

    if (lostAllTokens.size === 0 || foundAllTokens.size === 0) {
      return { points: 0, matchedWords: [] };
    }

    // Direct name token overlap carries extra signal
    const matchedWords = [];
    let nameHits = 0;
    lostNameTokens.forEach((t) => {
      if (foundNameTokens.has(t) || foundAllTokens.has(t)) {
        nameHits += 1;
        matchedWords.push(t);
      }
    });

    let allHits = 0;
    lostAllTokens.forEach((t) => {
      if (foundAllTokens.has(t)) {
        allHits += 1;
        if (!matchedWords.includes(t)) matchedWords.push(t);
      }
    });

    const unionSize = new Set([...lostAllTokens, ...foundAllTokens]).size;
    const jaccard = unionSize > 0 ? allHits / unionSize : 0;
    const nameCoverage =
      Math.max(lostNameTokens.size, foundNameTokens.size) > 0
        ? nameHits / Math.min(lostNameTokens.size || 1, foundNameTokens.size || 1)
        : 0;

    // Combine Jaccard similarity and name coverage smoothly into 0..30 pts
    const rawScore = jaccard * 20 + Math.min(1, nameCoverage) * 14 + Math.min(4, allHits) * 1.5;
    const points = Math.min(30, Math.round(rawScore));
    return { points, matchedWords };
  }

  function computeDateProximityPoints(dateA, dateB) {
    const d1 = new Date(`${dateA}T00:00:00`);
    const d2 = new Date(`${dateB}T00:00:00`);
    if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 0;
    const diffDays = Math.abs((d2 - d1) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0.5) return 5;
    if (diffDays <= 2) return 4;
    if (diffDays <= 5) return 2;
    if (diffDays <= 10) return 1;
    return 0;
  }

  function makePairKey(lostId, foundId) {
    return `${lostId}__${foundId}`;
  }

  function scoreLostFoundPair(lostItem, foundItem) {
    if (!lostItem || !foundItem || lostItem.id === foundItem.id) return null;
    if (lostItem.status === 'Recovered' || foundItem.status === 'Recovered') return null;

    // 1. Category (30 pts)
    let categoryPts = 0;
    if (lostItem.category === foundItem.category) {
      categoryPts = 30;
    } else if (
      (lostItem.category === 'Electronics' && foundItem.category === 'Accessories') ||
      (lostItem.category === 'Accessories' && foundItem.category === 'Electronics')
    ) {
      categoryPts = 10;
    }

    // 2. Name & Keyword Similarity (30 pts)
    const { points: keywordPts, matchedWords } = computeKeywordScore(lostItem, foundItem);

    // 3. Colour Match (20 pts)
    let colourPts = 0;
    if (lostItem.colour === foundItem.colour) {
      colourPts = 20;
    } else if (
      COLOUR_FAMILIES[lostItem.colour] &&
      COLOUR_FAMILIES[lostItem.colour] === COLOUR_FAMILIES[foundItem.colour]
    ) {
      colourPts = 8;
    }

    // 4. Location Match (15 pts)
    let locationPts = 0;
    if (lostItem.location === foundItem.location) {
      locationPts = 15;
    } else if ((ZONE_PROXIMITY[lostItem.location] || []).includes(foundItem.location)) {
      locationPts = 8;
    }

    // 5. Date Proximity (5 pts)
    const datePts = computeDateProximityPoints(lostItem.date, foundItem.date);

    const totalScore = Math.min(100, categoryPts + keywordPts + colourPts + locationPts + datePts);
    if (totalScore < MATCH_THRESHOLD) return null;

    // Matched attribute tags
    const attributes = [];
    if (categoryPts === 30) attributes.push(lostItem.category);
    if (colourPts === 20) attributes.push(lostItem.colour);
    else if (colourPts > 0) attributes.push('Similar Colour');
    if (locationPts === 15) attributes.push(lostItem.location);
    else if (locationPts > 0) attributes.push('Adjacent Campus Zone');
    if (datePts >= 4) attributes.push('Close Date Window');
    if (matchedWords.length > 0) attributes.push(`Keywords: ${matchedWords.slice(0, 2).join(', ')}`);

    // Natural-language explanation grounded in actual matching attributes
    const reasons = [];
    if (matchedWords.length > 0) {
      reasons.push(`both mention ${matchedWords.slice(0, 3).join(', ')}`);
    } else if (categoryPts === 30) {
      reasons.push(`both belong to ${lostItem.category}`);
    }
    if (colourPts === 20) {
      reasons.push(`share a ${lostItem.colour} colour`);
    } else if (colourPts > 0) {
      reasons.push('have similar colour tones');
    }
    if (locationPts === 15) {
      reasons.push(`were reported at ${lostItem.location}`);
    } else if (locationPts > 0) {
      reasons.push(`were reported in adjacent zones (${lostItem.location} & ${foundItem.location})`);
    }
    if (datePts >= 4) {
      reasons.push('occurred within a 48-hour window');
    }

    const explanation =
      reasons.length > 0
        ? `Possible match found! Both reports ${reasons.join(', ')}.`
        : `Possible match found based on ${totalScore}% combined attribute similarity.`;

    return {
      key: makePairKey(lostItem.id, foundItem.id),
      lostId: lostItem.id,
      foundId: foundItem.id,
      score: totalScore,
      breakdown: {
        category: categoryPts,
        keywords: keywordPts,
        colour: colourPts,
        location: locationPts,
        date: datePts
      },
      attributes: attributes.slice(0, 4),
      explanation
    };
  }

  function recalculateMatches() {
    const lostItems = appState.reports.filter((r) => r.type === 'lost' && r.status !== 'Recovered');
    const foundItems = appState.reports.filter((r) => r.type === 'found' && r.status !== 'Recovered');

    const results = [];
    lostItems.forEach((lost) => {
      foundItems.forEach((found) => {
        const pairKey = makePairKey(lost.id, found.id);
        const decision = appState.matchDecisions[pairKey]?.status || 'pending';
        if (decision === 'rejected') return;

        const scored = scoreLostFoundPair(lost, found);
        if (!scored) return;

        results.push({
          ...scored,
          status: decision // 'pending' | 'confirmed'
        });
      });
    });

    results.sort((a, b) => b.score - a.score);
    computedMatches = results;
    return results;
  }

  function getHighestMatchForReport(reportId) {
    let top = 0;
    computedMatches.forEach((m) => {
      if ((m.lostId === reportId || m.foundId === reportId) && m.score > top) {
        top = m.score;
      }
    });
    return top;
  }

  /* ========================================================================
     6. SEARCH, FILTER & SORT
     ======================================================================== */

  function getFilteredAndSortedReports() {
    const query = normalizeString(uiState.browseSearch);

    const filtered = appState.reports.filter((item) => {
      if (uiState.browseType !== 'all' && item.type !== uiState.browseType) return false;
      if (uiState.browseCategory !== 'all' && item.category !== uiState.browseCategory) return false;
      if (uiState.browseLocation !== 'all' && item.location !== uiState.browseLocation) return false;

      if (uiState.browseStatus === 'active' && item.status === 'Recovered') return false;
      if (uiState.browseStatus === 'resolved' && item.status !== 'Recovered') return false;

      if (query) {
        const haystack = normalizeString(
          `${item.id} ${item.name} ${item.category} ${item.colour} ${item.location} ${item.description}`
        );
        const queryTokens = query.split(' ').filter(Boolean);
        const allMatch = queryTokens.every((tok) => haystack.includes(tok));
        if (!allMatch) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (uiState.browseSort === 'oldest') {
      sorted.sort((a, b) => (a.createdTimestamp || 0) - (b.createdTimestamp || 0));
    } else if (uiState.browseSort === 'match') {
      sorted.sort((a, b) => {
        const diff = getHighestMatchForReport(b.id) - getHighestMatchForReport(a.id);
        if (diff !== 0) return diff;
        return (b.createdTimestamp || 0) - (a.createdTimestamp || 0);
      });
    } else {
      sorted.sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0));
    }

    return sorted;
  }

  /* ========================================================================
     7. DASHBOARD ANALYTICS CALCULATIONS (100% Dynamic)
     ======================================================================== */

  function computeDashboardAnalytics() {
    const totalReports = appState.reports.length;
    const lostReports = appState.reports.filter((r) => r.type === 'lost');
    const foundReports = appState.reports.filter((r) => r.type === 'found');
    const activeLost = lostReports.filter((r) => r.status !== 'Recovered').length;
    const activeFound = foundReports.filter((r) => r.status !== 'Recovered').length;
    const recoveredCount = appState.reports.filter((r) => r.status === 'Recovered').length;
    const recoveryRate = totalReports > 0 ? Math.round((recoveredCount / totalReports) * 100) : 0;

    const pendingOrConfirmedMatches = computedMatches.length;
    const pendingMatches = computedMatches.filter((m) => m.status === 'pending').length;
    const avgMatchScore =
      computedMatches.length > 0
        ? Math.round(computedMatches.reduce((sum, m) => sum + m.score, 0) / computedMatches.length)
        : 0;

    // Zone distribution computed directly from reports
    const zoneMap = {};
    Object.keys(ZONE_PROXIMITY).forEach((z) => {
      zoneMap[z] = { total: 0, recovered: 0 };
    });
    appState.reports.forEach((r) => {
      if (!zoneMap[r.location]) zoneMap[r.location] = { total: 0, recovered: 0 };
      zoneMap[r.location].total += 1;
      if (r.status === 'Recovered') zoneMap[r.location].recovered += 1;
    });

    return {
      totalReports,
      totalLost: lostReports.length,
      activeLost,
      totalFound: foundReports.length,
      activeFound,
      potentialMatches: pendingOrConfirmedMatches,
      pendingMatches,
      avgMatchScore,
      recoveredCount,
      recoveryRate,
      zoneMap
    };
  }

  /* ========================================================================
     8. MATCH REVIEW & RECOVERY WORKFLOW
     ======================================================================== */

  function getReportById(id) {
    return appState.reports.find((r) => r.id === id);
  }

  function confirmMatchPair(pairKey) {
    const match = computedMatches.find((m) => m.key === pairKey);
    if (!match) return;

    const lost = getReportById(match.lostId);
    const found = getReportById(match.foundId);
    appState.matchDecisions[pairKey] = { status: 'confirmed', updatedAt: Date.now() };
    if (lost && lost.status !== 'Recovered') lost.status = 'Confirmed';
    if (found && found.status !== 'Recovered') found.status = 'Confirmed';

    appState.activities.unshift({
      type: 'match',
      title: `Match confirmed (${match.score}%): ${lost?.name || match.lostId}`,
      detail: `Paired #${match.lostId} with #${match.foundId}. Ready for handoff & recovery completion.`,
      timestamp: Date.now()
    });

    saveStateToStorage();
    recalculateMatches();
    renderAll();
  }

  function rejectMatchPair(pairKey) {
    const match = computedMatches.find((m) => m.key === pairKey);
    if (!match) return;
    const lost = getReportById(match.lostId);

    appState.matchDecisions[pairKey] = { status: 'rejected', updatedAt: Date.now() };
    appState.activities.unshift({
      type: 'report',
      title: `Match rejected for #${match.lostId} & #${match.foundId}`,
      detail: `Excluded pair (${lost?.name || 'Item'}) from active suggestions.`,
      timestamp: Date.now()
    });

    saveStateToStorage();
    recalculateMatches();
    renderAll();
  }

  function markMatchPairRecovered(pairKey) {
    const match = computedMatches.find((m) => m.key === pairKey);
    const [lostId, foundId] = pairKey.split('__');
    const lost = getReportById(lostId);
    const found = getReportById(foundId);

    appState.matchDecisions[pairKey] = { status: 'confirmed', updatedAt: Date.now() };
    if (lost) lost.status = 'Recovered';
    if (found) found.status = 'Recovered';

    appState.activities.unshift({
      type: 'recovered',
      title: `Item Recovered: ${lost?.name || lostId}`,
      detail: `Resolved #${lostId} & #${foundId}${match ? ` (${match.score}% match)` : ''} at ${found?.location || 'Campus Desk'}.`,
      timestamp: Date.now()
    });

    saveStateToStorage();
    recalculateMatches();
    renderAll();
  }

  function markSingleReportRecovered(reportId) {
    const item = getReportById(reportId);
    if (!item || item.status === 'Recovered') return;

    item.status = 'Recovered';
    appState.activities.unshift({
      type: 'recovered',
      title: `Marked Recovered: ${item.name} (#${item.id})`,
      detail: `Status updated to Recovered / Resolved at ${item.location}.`,
      timestamp: Date.now()
    });

    saveStateToStorage();
    recalculateMatches();
    renderAll();
  }

  /* ========================================================================
     9. UI RENDERING & MODALS
     ======================================================================== */

  const els = {
    topNav: document.getElementById('topNav'),
    navMatchCount: document.getElementById('navMatchCount'),
    sidebarMatchBadge: document.getElementById('sidebarMatchBadge'),
    sidebarActiveCount: document.getElementById('sidebarActiveCount'),
    sidebarMatchedRate: document.getElementById('sidebarMatchedRate'),
    workspaceSidebar: document.getElementById('workspaceSidebar'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),
    mobileSidebarToggle: document.getElementById('mobileSidebarToggle'),
    mobileSidebarClose: document.getElementById('mobileSidebarClose'),
    mobileActiveSectionLabel: document.getElementById('mobileActiveSectionLabel'),
    globalSearchInput: document.getElementById('globalSearchInput'),
    quickSearchDropdown: document.getElementById('quickSearchDropdown'),
    kpiTotalLost: document.getElementById('kpiTotalLost'),
    kpiTotalFound: document.getElementById('kpiTotalFound'),
    kpiPotentialMatches: document.getElementById('kpiPotentialMatches'),
    kpiRecovered: document.getElementById('kpiRecovered'),
    kpiLostTrend: document.getElementById('kpiLostTrend'),
    kpiFoundTrend: document.getElementById('kpiFoundTrend'),
    kpiMatchTrend: document.getElementById('kpiMatchTrend'),
    kpiRecoveryRate: document.getElementById('kpiRecoveryRate'),
    recentReportsList: document.getElementById('recentReportsList'),
    smartMatchesGrid: document.getElementById('smartMatchesGrid'),
    browseGrid: document.getElementById('browseGrid'),
    browseEmptyState: document.getElementById('browseEmptyState'),
    browseSearch: document.getElementById('browseSearch'),
    browseCategory: document.getElementById('browseCategory'),
    browseLocation: document.getElementById('browseLocation'),
    browseStatus: document.getElementById('browseStatus'),
    browseSort: document.getElementById('browseSort'),
    browseResultsSummary: document.getElementById('browseResultsSummary'),
    clearBrowseFiltersBtn: document.getElementById('clearBrowseFiltersBtn'),
    resetBrowseFilters: document.getElementById('resetBrowseFilters'),
    activityFeed: document.getElementById('activityFeed'),
    zoneStatsList: document.getElementById('zoneStatsList'),
    weeklyRecoveryBars: document.getElementById('weeklyRecoveryBars'),
    weeklyRecoverySubtitle: document.getElementById('weeklyRecoverySubtitle'),
    weeklyRecoveryBadge: document.getElementById('weeklyRecoveryBadge'),
    toastRegion: document.getElementById('toastRegion')
  };

  let itemModalInstance = null;
  let matchModalInstance = null;
  let confirmModalInstance = null;

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  function formatDateDisplay(isoDate) {
    if (!isoDate) return 'Today';
    const parsed = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return isoDate;
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatRelativeTime(timestamp) {
    if (!timestamp) return 'Recently';
    const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  }

  function getStatusClass(status, hasMatch = false) {
    if (status === 'Recovered') return 'status-recovered';
    if (status === 'Confirmed') return 'status-confirmed';
    if (hasMatch) return 'status-matched';
    if (status === 'Lost') return 'status-lost';
    if (status === 'Found') return 'status-found';
    return '';
  }

  function getRingColor(score) {
    if (score >= 85) return '#059669';
    if (score >= 65) return '#0284c7';
    return '#7c3aed';
  }

  function showToast(title, message, variant = 'info') {
    if (!els.toastRegion) return;
    const iconMap = {
      success: 'bi-check-circle-fill text-success',
      info: 'bi-stars text-info',
      warning: 'bi-exclamation-triangle-fill text-warning'
    };
    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center border-0 shadow-lg';
    toastEl.style.borderRadius = '16px';
    toastEl.style.background = 'rgba(255,255,255,0.97)';
    toastEl.style.backdropFilter = 'blur(12px)';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    toastEl.innerHTML = `
      <div class="d-flex p-2">
        <div class="toast-body d-flex align-items-start gap-2">
          <i class="bi ${iconMap[variant] || iconMap.info} fs-5 mt-1" aria-hidden="true"></i>
          <div>
            <strong class="d-block text-navy">${escapeHtml(title)}</strong>
            <span class="small text-muted-navy">${escapeHtml(message)}</span>
          </div>
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close notification"></button>
      </div>
    `;
    els.toastRegion.appendChild(toastEl);
    if (window.bootstrap?.Toast) {
      const bsToast = new window.bootstrap.Toast(toastEl, { delay: 4600 });
      bsToast.show();
      toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    } else {
      setTimeout(() => toastEl.remove(), 4600);
    }
  }

  function showConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm }) {
    const titleEl = document.getElementById('confirmActionTitle');
    const msgEl = document.getElementById('confirmActionMessage');
    const btnEl = document.getElementById('confirmActionProceedBtn');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (btnEl) btnEl.textContent = confirmLabel;
    uiState.pendingConfirmCallback = onConfirm;

    if (!confirmModalInstance && window.bootstrap?.Modal) {
      confirmModalInstance = new window.bootstrap.Modal(document.getElementById('confirmActionModal'));
    }
    confirmModalInstance?.show();
  }

  function bumpKpiElement(el, newVal) {
    if (!el) return;
    const key = el.id;
    const changed = prevKpiSnapshot[key] !== undefined && prevKpiSnapshot[key] !== newVal;
    prevKpiSnapshot[key] = newVal;

    el.dataset.target = String(newVal);
    if (el.dataset.animated === 'true') {
      el.textContent = String(newVal);
    }
    if (changed && !prefersReducedMotion) {
      el.classList.remove('stat-bump');
      void el.offsetWidth;
      el.classList.add('stat-bump');
    }
  }

  function renderDashboardAnalytics() {
    const stats = computeDashboardAnalytics();

    bumpKpiElement(els.kpiTotalLost, stats.totalLost);
    bumpKpiElement(els.kpiTotalFound, stats.totalFound);
    bumpKpiElement(els.kpiPotentialMatches, stats.potentialMatches);
    bumpKpiElement(els.kpiRecovered, stats.recoveredCount);

    if (els.kpiLostTrend) els.kpiLostTrend.textContent = `${stats.activeLost} active`;
    if (els.kpiFoundTrend) els.kpiFoundTrend.textContent = `${stats.activeFound} active`;
    if (els.kpiMatchTrend) els.kpiMatchTrend.textContent = `${stats.avgMatchScore}% avg score`;
    if (els.kpiRecoveryRate) els.kpiRecoveryRate.textContent = `${stats.recoveryRate}% rate`;

    if (els.navMatchCount) els.navMatchCount.textContent = String(stats.pendingMatches);
    if (els.sidebarMatchBadge) els.sidebarMatchBadge.textContent = String(stats.pendingMatches);
    if (els.sidebarActiveCount) els.sidebarActiveCount.textContent = String(stats.activeLost + stats.activeFound);
    if (els.sidebarMatchedRate) els.sidebarMatchedRate.textContent = `${stats.recoveryRate}%`;

    // Smart Matching Engine panel live summary
    const topMatch = computedMatches[0];
    const topScoreEl = document.getElementById('engineTopScore');
    const topTitleEl = document.getElementById('engineTopTitle');
    const topMetaEl = document.getElementById('engineTopMeta');
    const topReviewBtn = document.getElementById('engineTopReviewBtn');

    if (topMatch) {
      const lost = getReportById(topMatch.lostId);
      const found = getReportById(topMatch.foundId);
      if (topScoreEl) topScoreEl.textContent = `${topMatch.score}%`;
      if (topTitleEl) topTitleEl.textContent = lost?.name || 'Potential Match';
      if (topMetaEl) topMetaEl.textContent = `${lost?.location || ''} ↔ ${found?.location || ''}`;
      if (topReviewBtn) {
        topReviewBtn.hidden = false;
        topReviewBtn.dataset.reviewMatch = topMatch.key;
        topReviewBtn.href = '#smart-matches';
      }
    } else {
      if (topScoreEl) topScoreEl.textContent = '0%';
      if (topTitleEl) topTitleEl.textContent = 'No pending matches';
      if (topMetaEl) topMetaEl.textContent = 'Submit a Lost or Found report to scan';
      if (topReviewBtn) topReviewBtn.hidden = true;
    }

    // Signal progress bars
    const setBar = (valElId, barElId, pct, text) => {
      const valEl = document.getElementById(valElId);
      const barEl = document.getElementById(barElId);
      if (valEl) valEl.textContent = text;
      if (barEl) {
        barEl.style.width = `${pct}%`;
        barEl.setAttribute('aria-valuenow', String(pct));
      }
    };

    setBar('signalRecoveryPct', 'signalRecoveryBar', stats.recoveryRate, `${stats.recoveryRate}%`);
    setBar('signalMatchAvgPct', 'signalMatchAvgBar', stats.avgMatchScore, `${stats.avgMatchScore}%`);
    setBar(
      'signalResolvedRatio',
      'signalResolvedBar',
      stats.recoveryRate,
      `${stats.recoveredCount} / ${stats.totalReports}`
    );

    // Zone bar chart in Overview
    if (els.weeklyRecoveryBars) {
      const entries = Object.entries(stats.zoneMap);
      const maxZone = Math.max(1, ...entries.map(([, v]) => v.total));
      const shortLabels = {
        'Main Library': 'Lib',
        'Student Union': 'Union',
        'Engineering Quad': 'Eng',
        'Science Hall': 'Sci',
        'Dining Commons': 'Dine',
        'Athletics Center': 'Ath',
        'West Residence': 'West'
      };
      els.weeklyRecoveryBars.innerHTML = entries
        .map(([zone, counts]) => {
          const pct = Math.max(16, Math.round((counts.total / maxZone) * 96));
          const isTop = counts.total === maxZone && counts.total > 0;
          return `
            <div class="r-bar-col" title="${escapeHtml(zone)}: ${counts.total} reports (${counts.recovered} recovered)">
              <div class="r-bar ${isTop ? 'active' : ''}" style="--h: ${pct}%"><span>${counts.total}</span></div>
              <label>${shortLabels[zone] || zone.slice(0, 4)}</label>
            </div>
          `;
        })
        .join('');
    }
    if (els.weeklyRecoverySubtitle) {
      els.weeklyRecoverySubtitle.textContent = `${stats.totalReports} total reports across ${Object.keys(stats.zoneMap).length} campus zones`;
    }
    if (els.weeklyRecoveryBadge) {
      els.weeklyRecoveryBadge.textContent = `${stats.recoveryRate}% recovered`;
    }

    // Zone Breakdown in Activity Section
    if (els.zoneStatsList) {
      const sortedZones = Object.entries(stats.zoneMap).sort((a, b) => b[1].total - a[1].total);
      const maxTotal = Math.max(1, sortedZones[0]?.[1]?.total || 1);
      const barColors = ['bg-cyan-grad', 'bg-lavender-grad', 'bg-navy-grad'];

      els.zoneStatsList.innerHTML = sortedZones
        .slice(0, 5)
        .map(([zone, data], idx) => {
          const widthPct = Math.max(8, Math.round((data.total / maxTotal) * 100));
          return `
            <div class="zone-stat-item">
              <div class="d-flex justify-content-between small fw-semibold mb-1">
                <span>${escapeHtml(zone)}</span>
                <span class="mono-num">${data.total} total · ${data.recovered} recovered</span>
              </div>
              <div class="progress trace-progress">
                <div class="progress-bar ${barColors[idx % barColors.length]}" style="width: ${widthPct}%"></div>
              </div>
            </div>
          `;
        })
        .join('');
    }
  }

  function renderRecentReports() {
    if (!els.recentReportsList) return;
    const recent = [...appState.reports]
      .sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0))
      .slice(0, 5);

    if (recent.length === 0) {
      els.recentReportsList.innerHTML = '<p class="text-muted-navy small mb-0">No reports logged yet.</p>';
      return;
    }

    els.recentReportsList.innerHTML = recent
      .map((item) => {
        const icon = CATEGORY_ICONS[item.category] || 'bi-box2';
        const badgeClass = item.type === 'lost' ? 'badge-lost' : 'badge-found';
        const topMatch = item.status !== 'Recovered' ? getHighestMatchForReport(item.id) : 0;
        const displayStatus =
          item.status === 'Recovered'
            ? 'Recovered'
            : item.status === 'Confirmed'
              ? 'Confirmed'
              : topMatch >= MATCH_THRESHOLD
                ? `${topMatch}% Match`
                : item.status;

        return `
          <div class="recent-report-row" role="button" tabindex="0" data-open-item="${escapeHtml(item.id)}" aria-label="View details for ${escapeHtml(item.name)}">
            <div class="report-thumb-icon" aria-hidden="true">
              <i class="bi ${icon}"></i>
            </div>
            <div class="report-row-body">
              <div class="d-flex align-items-center gap-2">
                <span class="badge-type ${badgeClass}">${escapeHtml(item.type)}</span>
                <span class="report-row-title">${escapeHtml(item.name)}</span>
              </div>
              <div class="report-row-meta mt-1">
                <i class="bi bi-geo-alt me-1" aria-hidden="true"></i>${escapeHtml(item.location)} &middot; ${escapeHtml(item.colour)} &middot; ${formatRelativeTime(item.createdTimestamp)}
              </div>
            </div>
            <span class="status-pill ${getStatusClass(item.status, topMatch >= MATCH_THRESHOLD)} d-none d-sm-inline-block">${escapeHtml(displayStatus)}</span>
          </div>
        `;
      })
      .join('');
  }

  function renderSmartMatches() {
    if (!els.smartMatchesGrid) return;

    const filtered = computedMatches.filter((match) => {
      if (uiState.matchFilter === 'high') return match.score >= 85;
      if (uiState.matchFilter === 'pending') return match.status === 'pending';
      if (uiState.matchFilter === 'confirmed') return match.status === 'confirmed';
      return true;
    });

    if (filtered.length === 0) {
      els.smartMatchesGrid.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-state-orbit" aria-hidden="true"><i class="bi bi-cpu"></i></div>
          <h3 class="h5 fw-bold mt-3">No matching pairs right now</h3>
          <p class="text-muted-navy mb-0">Submit a Lost or Found report, or switch filters to review other pairs.</p>
        </div>
      `;
      return;
    }

    const circumference = 251.3;
    els.smartMatchesGrid.innerHTML = filtered
      .map((match) => {
        const lost = getReportById(match.lostId);
        const found = getReportById(match.foundId);
        if (!lost || !found) return '';

        const offset = circumference - (circumference * match.score) / 100;
        const strokeColor = getRingColor(match.score);
        const isConfirmed = match.status === 'confirmed';

        return `
          <article class="smart-match-card">
            <div class="match-comparison-grid">
              <div class="match-item-pane pane-lost">
                <div class="d-flex align-items-center justify-content-between">
                  <span class="badge-type badge-lost">Lost Report</span>
                  <span class="mono-id small text-muted-navy">#${escapeHtml(lost.id)}</span>
                </div>
                <h3 class="match-item-title">${escapeHtml(lost.name)}</h3>
                <p class="match-item-desc">${escapeHtml(lost.description)}</p>
                <div class="match-item-specs">
                  <span><i class="bi bi-geo-alt me-1" aria-hidden="true"></i>${escapeHtml(lost.location)}</span>
                  <span><span class="colour-dot me-1" style="background:${COLOUR_SWATCHES[lost.colour] || '#94a3b8'}"></span>${escapeHtml(lost.colour)}</span>
                  <span><i class="bi bi-calendar3 me-1" aria-hidden="true"></i>${formatDateDisplay(lost.date)}</span>
                </div>
              </div>

              <div class="match-score-bridge">
                <div class="score-ring-wrap">
                  <svg class="score-ring-svg" viewBox="0 0 96 96" aria-hidden="true">
                    <circle class="ring-track" cx="48" cy="48" r="40"></circle>
                    <circle class="ring-progress" cx="48" cy="48" r="40"
                      style="stroke: ${strokeColor}; --ring-offset: ${offset.toFixed(1)};"></circle>
                  </svg>
                  <div class="score-ring-center">
                    <span class="score-pct">${match.score}%</span>
                    <span class="score-lbl">Match</span>
                  </div>
                </div>
                <div class="match-attr-chips">
                  ${match.attributes.map((attr) => `<span class="attr-chip">${escapeHtml(attr)}</span>`).join('')}
                </div>
              </div>

              <div class="match-item-pane pane-found">
                <div class="d-flex align-items-center justify-content-between">
                  <span class="badge-type badge-found">Found Report</span>
                  <span class="mono-id small text-muted-navy">#${escapeHtml(found.id)}</span>
                </div>
                <h3 class="match-item-title">${escapeHtml(found.name)}</h3>
                <p class="match-item-desc">${escapeHtml(found.description)}</p>
                <div class="match-item-specs">
                  <span><i class="bi bi-geo-alt me-1" aria-hidden="true"></i>${escapeHtml(found.location)}</span>
                  <span><span class="colour-dot me-1" style="background:${COLOUR_SWATCHES[found.colour] || '#94a3b8'}"></span>${escapeHtml(found.colour)}</span>
                  <span><i class="bi bi-calendar3 me-1" aria-hidden="true"></i>${formatDateDisplay(found.date)}</span>
                </div>
              </div>
            </div>

            <div class="match-reasoning-bar">
              <div class="match-reasoning-text">
                <i class="bi bi-stars" aria-hidden="true"></i>
                <span><strong>Why TRACE suggests this:</strong> ${escapeHtml(match.explanation)}</span>
              </div>
              <div class="d-flex flex-wrap align-items-center gap-2">
                ${isConfirmed
                  ? `<span class="status-pill status-confirmed"><i class="bi bi-patch-check-fill me-1"></i>Match Confirmed</span>
                     <button type="button" class="btn trace-btn-primary btn-sm ripple-btn" data-recover-match="${escapeHtml(match.key)}">
                       <i class="bi bi-shield-check me-1" aria-hidden="true"></i>Mark Recovered
                     </button>`
                  : `<button type="button" class="btn trace-btn-primary btn-sm ripple-btn" data-review-match="${escapeHtml(match.key)}">
                       <i class="bi bi-sliders2 me-1" aria-hidden="true"></i>Review Match
                     </button>`}
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function renderBrowseGrid() {
    if (!els.browseGrid) return;
    const items = getFilteredAndSortedReports();

    if (els.browseResultsSummary) {
      els.browseResultsSummary.textContent = `Showing ${items.length} of ${appState.reports.length} campus reports`;
    }

    if (items.length === 0) {
      els.browseGrid.innerHTML = '';
      if (els.browseEmptyState) els.browseEmptyState.hidden = false;
      return;
    }

    if (els.browseEmptyState) els.browseEmptyState.hidden = true;
    els.browseGrid.innerHTML = items
      .map((item) => {
        const icon = CATEGORY_ICONS[item.category] || 'bi-box2';
        const badgeClass = item.type === 'lost' ? 'badge-lost' : 'badge-found';
        const swatch = COLOUR_SWATCHES[item.colour] || '#94a3b8';
        const topMatch = item.status !== 'Recovered' ? getHighestMatchForReport(item.id) : 0;

        const statusLabel =
          item.status === 'Recovered'
            ? 'Resolved'
            : item.status === 'Confirmed'
              ? 'Match Confirmed'
              : topMatch >= MATCH_THRESHOLD
                ? `${topMatch}% Match`
                : 'Active';

        const mediaHtml = item.image
          ? `<img src="${item.image}" alt="${escapeHtml(item.name)}" />`
          : `<div class="item-studio-icon" aria-hidden="true"><i class="bi ${icon}"></i></div>`;

        return `
          <div class="col-md-6 col-xl-4">
            <article class="browse-item-card" role="button" tabindex="0" data-open-item="${escapeHtml(item.id)}" aria-label="Open details for ${escapeHtml(item.name)}">
              <div class="browse-card-media">
                ${mediaHtml}
                <div class="browse-card-badges">
                  <span class="badge-type ${badgeClass}">${escapeHtml(item.type)}</span>
                  <span class="status-pill ${getStatusClass(item.status, topMatch >= MATCH_THRESHOLD)}">${escapeHtml(statusLabel)}</span>
                </div>
              </div>
              <div class="browse-card-body">
                <div class="d-flex align-items-center justify-content-between gap-2">
                  <span class="preview-category">${escapeHtml(item.category)}</span>
                  <span class="preview-colour-pill">
                    <span class="colour-dot" style="background:${swatch}"></span>
                    <span>${escapeHtml(item.colour)}</span>
                  </span>
                </div>
                <h3 class="browse-card-title">${escapeHtml(item.name)}</h3>
                <p class="browse-card-desc">${escapeHtml(item.description)}</p>
                <div class="browse-card-footer">
                  <span><i class="bi bi-geo-alt me-1" aria-hidden="true"></i>${escapeHtml(item.location)}</span>
                  <span>${formatDateDisplay(item.date)}</span>
                </div>
              </div>
            </article>
          </div>
        `;
      })
      .join('');
  }

  function renderActivityFeed() {
    if (!els.activityFeed) return;
    const iconCfg = {
      recovered: { cls: 'act-recovered', icon: 'bi-shield-check' },
      match: { cls: 'act-match', icon: 'bi-cpu' },
      report: { cls: 'act-report', icon: 'bi-plus-circle' }
    };

    els.activityFeed.innerHTML = appState.activities
      .slice(0, 8)
      .map((act) => {
        const cfg = iconCfg[act.type] || iconCfg.report;
        return `
          <li class="activity-item">
            <div class="activity-icon ${cfg.cls}" aria-hidden="true">
              <i class="bi ${cfg.icon}"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex flex-wrap justify-content-between gap-2">
                <strong class="text-navy small">${escapeHtml(act.title)}</strong>
                <span class="activity-time">${formatRelativeTime(act.timestamp)}</span>
              </div>
              <p class="mb-0 small text-muted-navy mt-1">${escapeHtml(act.detail)}</p>
            </div>
          </li>
        `;
      })
      .join('');
  }

  function renderAll() {
    renderDashboardAnalytics();
    renderRecentReports();
    renderSmartMatches();
    renderBrowseGrid();
    renderActivityFeed();
  }

  function openItemDetailModal(itemId) {
    const item = getReportById(itemId);
    if (!item) return;
    uiState.activeDetailItemId = item.id;

    const typeBadge = document.getElementById('detailTypeBadge');
    const statusBadge = document.getElementById('detailStatusBadge');
    const visualBox = document.getElementById('detailVisualBox');
    const topMatch = item.status !== 'Recovered' ? getHighestMatchForReport(item.id) : 0;

    typeBadge.textContent = item.type.toUpperCase();
    typeBadge.className = `badge-type ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`;

    statusBadge.textContent = item.status === 'Recovered' ? 'Recovered / Resolved' : item.status;
    statusBadge.className = `status-pill ${getStatusClass(item.status, topMatch >= MATCH_THRESHOLD)}`;

    document.getElementById('detailIdBadge').textContent = `#${item.id}`;
    document.getElementById('detailCategory').textContent = item.category;
    document.getElementById('itemDetailModalTitle').textContent = item.name;
    document.getElementById('detailDescription').textContent = item.description;
    document.getElementById('detailColour').innerHTML = `<span class="colour-dot me-2" style="background:${COLOUR_SWATCHES[item.colour] || '#94a3b8'}"></span>${escapeHtml(item.colour)}`;
    document.getElementById('detailLocation').textContent = item.location;
    document.getElementById('detailDate').textContent = formatDateDisplay(item.date);
    document.getElementById('detailCustody').textContent = item.custody;

    if (item.image) {
      visualBox.innerHTML = `<img src="${item.image}" alt="${escapeHtml(item.name)}" />`;
    } else {
      const icon = CATEGORY_ICONS[item.category] || 'bi-box2';
      visualBox.innerHTML = `<i class="bi ${icon}" aria-hidden="true"></i>`;
    }

    const markBtn = document.getElementById('detailMarkRecoveredBtn');
    markBtn.disabled = item.status === 'Recovered';
    markBtn.innerHTML =
      item.status === 'Recovered'
        ? '<i class="bi bi-check2-all me-1"></i>Already Resolved'
        : '<i class="bi bi-check2-circle me-1"></i>Mark Recovered';

    if (!itemModalInstance && window.bootstrap?.Modal) {
      itemModalInstance = new window.bootstrap.Modal(document.getElementById('itemDetailModal'));
    }
    itemModalInstance?.show();
  }

  function openMatchReviewModal(pairKey) {
    const match = computedMatches.find((m) => m.key === pairKey);
    if (!match) return;
    const lost = getReportById(match.lostId);
    const found = getReportById(match.foundId);
    if (!lost || !found) return;

    uiState.activeMatchKey = pairKey;

    const body = document.getElementById('matchReviewBody');
    body.innerHTML = `
      <div class="row g-4 align-items-stretch mb-4">
        <div class="col-md-5">
          <div class="match-item-pane pane-lost">
            <span class="badge-type badge-lost mb-2 d-inline-block">Lost Report &middot; #${escapeHtml(lost.id)}</span>
            <h4 class="h5 fw-bold text-navy">${escapeHtml(lost.name)}</h4>
            <p class="small text-muted-navy">${escapeHtml(lost.description)}</p>
            <div class="small text-navy">
              <div><strong>Zone:</strong> ${escapeHtml(lost.location)}</div>
              <div><strong>Colour:</strong> ${escapeHtml(lost.colour)}</div>
              <div><strong>Date:</strong> ${formatDateDisplay(lost.date)}</div>
            </div>
          </div>
        </div>

        <div class="col-md-2 d-flex flex-column align-items-center justify-content-center text-center">
          <div class="display-6 fw-bold mono-num" style="color:${getRingColor(match.score)}">${match.score}%</div>
          <div class="small fw-semibold text-muted-navy mb-2">Match Score</div>
          <span class="badge bg-light text-dark border">${match.status === 'confirmed' ? 'Confirmed' : 'Pending Review'}</span>
        </div>

        <div class="col-md-5">
          <div class="match-item-pane pane-found">
            <span class="badge-type badge-found mb-2 d-inline-block">Found Report &middot; #${escapeHtml(found.id)}</span>
            <h4 class="h5 fw-bold text-navy">${escapeHtml(found.name)}</h4>
            <p class="small text-muted-navy">${escapeHtml(found.description)}</p>
            <div class="small text-navy">
              <div><strong>Zone:</strong> ${escapeHtml(found.location)}</div>
              <div><strong>Colour:</strong> ${escapeHtml(found.colour)}</div>
              <div><strong>Date:</strong> ${formatDateDisplay(found.date)}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 rounded-4 mb-3" style="background: var(--bg-icy); border: 1px solid rgba(14,165,233,0.2);">
        <div class="fw-bold small text-navy mb-1"><i class="bi bi-stars me-1 text-info"></i>Comparison Explanation</div>
        <p class="small text-navy mb-2">${escapeHtml(match.explanation)}</p>
        <div class="row g-2 small">
          <div class="col-6 col-lg">Category: <strong class="mono-num">${match.breakdown.category}/30</strong></div>
          <div class="col-6 col-lg">Keywords: <strong class="mono-num">${match.breakdown.keywords}/30</strong></div>
          <div class="col-6 col-lg">Colour: <strong class="mono-num">${match.breakdown.colour}/20</strong></div>
          <div class="col-6 col-lg">Location: <strong class="mono-num">${match.breakdown.location}/15</strong></div>
          <div class="col-6 col-lg">Date: <strong class="mono-num">${match.breakdown.date}/5</strong></div>
        </div>
      </div>
    `;

    const confirmBtn = document.getElementById('confirmMatchBtn');
    if (confirmBtn) {
      confirmBtn.disabled = match.status === 'confirmed';
      confirmBtn.innerHTML =
        match.status === 'confirmed'
          ? '<i class="bi bi-patch-check-fill me-1"></i>Confirmed'
          : '<i class="bi bi-patch-check me-1"></i>Confirm Match';
    }

    if (!matchModalInstance && window.bootstrap?.Modal) {
      matchModalInstance = new window.bootstrap.Modal(document.getElementById('matchReviewModal'));
    }
    matchModalInstance?.show();
  }

  /* ========================================================================
     10. HERO 3D PARALLAX, PARTICLES, COUNTERS & SCROLL EFFECTS
     ======================================================================== */

  function initHeroParticles() {
    const canvas = document.getElementById('heroParticles');
    if (!canvas || prefersReducedMotion || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const particles = [];
    const COUNT = 34;

    function resize() {
      width = canvas.width = canvas.offsetWidth || 800;
      height = canvas.height = canvas.offsetHeight || 600;
    }

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.5 + Math.random() * 2.4,
        vx: (Math.random() - 0.5) * 0.26,
        vy: (Math.random() - 0.5) * 0.26,
        color: i % 2 === 0 ? 'rgba(14, 165, 233, 0.28)' : 'rgba(139, 92, 246, 0.22)'
      });
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initHero3DParallax() {
    if (prefersReducedMotion) return;
    const hero = document.getElementById('home');
    const stage = document.getElementById('hero3dStage');
    if (!hero || !stage) return;

    let targetRx = 6;
    let targetRy = -9;
    let currentRx = 6;
    let currentRy = -9;
    let rafId = null;

    function updateFrame() {
      currentRx += (targetRx - currentRx) * 0.1;
      currentRy += (targetRy - currentRy) * 0.1;
      stage.style.setProperty('--stage-rx', `${currentRx.toFixed(2)}deg`);
      stage.style.setProperty('--stage-ry', `${currentRy.toFixed(2)}deg`);

      if (Math.abs(targetRx - currentRx) > 0.03 || Math.abs(targetRy - currentRy) > 0.03) {
        rafId = requestAnimationFrame(updateFrame);
      } else {
        rafId = null;
      }
    }

    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || window.innerWidth < 992) return;
      const rect = hero.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetRy = -9 + nx * 16;
      targetRx = 6 - ny * 12;
      if (!rafId) rafId = requestAnimationFrame(updateFrame);
    });

    hero.addEventListener('pointerleave', () => {
      targetRx = 6;
      targetRy = -9;
      if (!rafId) rafId = requestAnimationFrame(updateFrame);
    });
  }

  function initTiltCards() {
    if (prefersReducedMotion) return;
    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  function animateCounters() {
    const counters = document.querySelectorAll('.kpi-value[data-target]');
    const runCounter = (el) => {
      if (el.dataset.animated === 'true') return;
      el.dataset.animated = 'true';
      const target = Number(el.dataset.target || 0);
      if (prefersReducedMotion || typeof requestAnimationFrame !== 'function') {
        el.textContent = String(target);
        return;
      }
      const duration = 700;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(Number(el.dataset.target || 0) * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCounter);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  function initScrollEffects() {
    window.addEventListener(
      'scroll',
      () => {
        els.topNav?.classList.toggle('scrolled', window.scrollY > 24);
      },
      { passive: true }
    );

    const revealEls = document.querySelectorAll('.reveal-item');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const revealObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      revealEls.forEach((el) => revealObs.observe(el));
    }

    if (!('IntersectionObserver' in window)) return;

    const sections = ['home', 'overview', 'report', 'smart-matches', 'browse', 'activity']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const sectionLabels = {
      overview: 'Overview',
      report: 'Report Item',
      'smart-matches': 'Smart Matches',
      browse: 'Browse Reports',
      activity: 'Activity'
    };

    const spyObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;

          document.querySelectorAll('.trace-nav-links .nav-link').forEach((link) => {
            link.classList.toggle('active', link.dataset.navTarget === id);
          });

          document.querySelectorAll('.sidebar-link').forEach((link) => {
            const sec = link.dataset.section;
            const matchesReport = id === 'report' && sec === `report-${uiState.reportMode}`;
            link.classList.toggle('active', sec === id || matchesReport);
          });

          if (els.mobileActiveSectionLabel && sectionLabels[id]) {
            els.mobileActiveSectionLabel.textContent = sectionLabels[id];
          }
        });
      },
      { rootMargin: '-32% 0px -55% 0px' }
    );

    sections.forEach((sec) => spyObs.observe(sec));
  }

  function closeMobileSidebar() {
    els.workspaceSidebar?.classList.remove('open');
    els.sidebarBackdrop?.classList.remove('show');
    els.mobileSidebarToggle?.setAttribute('aria-expanded', 'false');
  }

  /* ========================================================================
     11. EVENT LISTENERS & FORM VALIDATION
     ======================================================================== */

  function setReportMode(mode) {
    uiState.reportMode = mode === 'found' ? 'found' : 'lost';
    const lostTab = document.getElementById('tabReportLost');
    const foundTab = document.getElementById('tabReportFound');
    const lostPanel = document.getElementById('panelReportLost');
    const foundPanel = document.getElementById('panelReportFound');
    if (!lostTab || !foundTab || !lostPanel || !foundPanel) return;

    const isLost = uiState.reportMode === 'lost';
    lostTab.classList.toggle('active', isLost);
    foundTab.classList.toggle('active', !isLost);
    lostTab.setAttribute('aria-selected', String(isLost));
    foundTab.setAttribute('aria-selected', String(!isLost));

    lostPanel.hidden = !isLost;
    foundPanel.hidden = isLost;
    lostPanel.classList.toggle('active', isLost);
    foundPanel.classList.toggle('active', !isLost);

    syncLivePreview();
  }

  function syncLivePreview() {
    const prefix = uiState.reportMode;
    const name = document.getElementById(`${prefix}Name`)?.value.trim();
    const category = document.getElementById(`${prefix}Category`)?.value;
    const colour = document.getElementById(`${prefix}Colour`)?.value;
    const location = document.getElementById(`${prefix}Location`)?.value;
    const date = document.getElementById(`${prefix}Date`)?.value;
    const desc = document.getElementById(`${prefix}Description`)?.value.trim();
    const uploadedImg = uiState.uploadedImages[prefix];

    const typeBadge = document.getElementById('previewTypeBadge');
    if (typeBadge) {
      typeBadge.textContent = prefix.toUpperCase();
      typeBadge.className = `badge-type ${prefix === 'lost' ? 'badge-lost' : 'badge-found'}`;
    }

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('previewCategory', category || 'Category');
    setTxt('previewColourText', colour || 'Colour');
    const dotEl = document.getElementById('previewColourDot');
    if (dotEl) dotEl.style.background = COLOUR_SWATCHES[colour] || '#94a3b8';
    setTxt('previewTitle', name || 'Your item title appears here');
    setTxt(
      'previewDesc',
      desc || 'Start typing distinctive attributes so TRACE can evaluate colour, zone, and semantic matches.'
    );
    setTxt('previewLocation', location || 'Campus Zone');
    setTxt('previewDate', date ? formatDateDisplay(date) : 'Today');

    const previewImg = document.getElementById('previewCardImg');
    const fallbackIcon = document.getElementById('previewFallbackIcon');
    if (previewImg && fallbackIcon) {
      if (uploadedImg) {
        previewImg.src = uploadedImg;
        previewImg.hidden = false;
        fallbackIcon.hidden = true;
      } else {
        previewImg.hidden = true;
        fallbackIcon.hidden = false;
        fallbackIcon.className = `bi ${CATEGORY_ICONS[category] || 'bi-box2'}`;
      }
    }
  }

  function clearImagePreview(prefix) {
    const input = document.getElementById(`${prefix}ImageInput`);
    const placeholder = document.getElementById(`${prefix}UploadPlaceholder`);
    const preview = document.getElementById(`${prefix}UploadPreview`);
    uiState.uploadedImages[prefix] = null;
    if (input) input.value = '';
    if (preview) preview.hidden = true;
    if (placeholder) placeholder.hidden = false;
    syncLivePreview();
  }

  function initImageUploads() {
    ['lost', 'found'].forEach((prefix) => {
      const input = document.getElementById(`${prefix}ImageInput`);
      const dropzone = document.querySelector(`[data-upload-target="${prefix}"]`);
      const placeholder = document.getElementById(`${prefix}UploadPlaceholder`);
      const preview = document.getElementById(`${prefix}UploadPreview`);
      const previewImg = document.getElementById(`${prefix}PreviewImg`);
      const fileNameEl = document.getElementById(`${prefix}FileName`);
      const fileSizeEl = document.getElementById(`${prefix}FileSize`);
      const clearBtn = document.querySelector(`[data-clear-upload="${prefix}"]`);

      if (!input || !dropzone) return;

      const handleFile = (file) => {
        if (!file) return;
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          showToast('Unsupported Format', 'Please choose a PNG, JPG, WEBP, or GIF image.', 'warning');
          input.value = '';
          return;
        }
        if (file.size > MAX_IMAGE_RAW_BYTES) {
          showToast('Image Too Large', 'Please choose an image under 2 MB.', 'warning');
          input.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          const compressed = await compressImageDataUrl(e.target.result);
          uiState.uploadedImages[prefix] = compressed;
          if (previewImg) previewImg.src = compressed;
          if (fileNameEl) fileNameEl.textContent = file.name;
          if (fileSizeEl) fileSizeEl.textContent = `${Math.max(1, Math.round(file.size / 1024))} KB`;
          if (placeholder) placeholder.hidden = true;
          if (preview) preview.hidden = false;
          syncLivePreview();
        };
        reader.readAsDataURL(file);
      };

      input.addEventListener('change', (e) => {
        if (e.target.files?.[0]) handleFile(e.target.files[0]);
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
      });

      clearBtn?.addEventListener('click', () => clearImagePreview(prefix));
    });
  }

  function finalizeFormSubmission(prefix, form, dateInput, charCountEl, payload) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Analyzing Matches...';
    }

    const executeCommit = () => {
      const { record, matchedCount, topScore } = createReportRecord(payload);

      form.reset();
      form.classList.remove('was-validated');
      const today = new Date().toISOString().split('T')[0];
      if (dateInput) dateInput.value = today;
      if (charCountEl) charCountEl.textContent = '0 / 320';
      clearImagePreview(prefix);

      renderAll();
      syncLivePreview();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }

      if (matchedCount > 0) {
        showToast(
          `Report #${record.id} Logged · Match Found!`,
          `Smart Matching detected ${matchedCount} potential match${matchedCount > 1 ? 'es' : ''} (up to ${topScore}%).`,
          'success'
        );
      } else {
        showToast(
          `Report #${record.id} Published`,
          `${record.name} is now live in Browse Reports and indexed for matching.`,
          'success'
        );
      }
    };

    // Brief micro-feedback in real browsers; immediate in fast reduced-motion environments
    if (prefersReducedMotion) {
      executeCommit();
    } else {
      setTimeout(executeCommit, 200);
    }
  }

  function initForms() {
    const today = new Date().toISOString().split('T')[0];
    ['lost', 'found'].forEach((prefix) => {
      const form = document.getElementById(`${prefix}ItemForm`);
      if (!form) return;

      const dateInput = document.getElementById(`${prefix}Date`);
      if (dateInput) {
        dateInput.max = today;
        dateInput.value = today;
      }

      const descEl = document.getElementById(`${prefix}Description`);
      const charCountEl = document.getElementById(`${prefix}CharCount`);

      form.querySelectorAll('input, select, textarea').forEach((field) => {
        field.addEventListener('input', () => {
          if (field === descEl && charCountEl) {
            charCountEl.textContent = `${descEl.value.length} / 320`;
          }
          if (field === dateInput && dateInput.value > today) {
            dateInput.setCustomValidity('Date cannot be in the future.');
          } else if (field === dateInput) {
            dateInput.setCustomValidity('');
          }
          syncLivePreview();
        });
        field.addEventListener('change', syncLivePreview);
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (dateInput && dateInput.value > today) {
          dateInput.setCustomValidity('Date cannot be in the future.');
        } else if (dateInput) {
          dateInput.setCustomValidity('');
        }

        form.classList.add('was-validated');
        if (!form.checkValidity()) {
          showToast('Incomplete Report', 'Please correct the highlighted fields before submitting.', 'warning');
          const firstInvalid = form.querySelector(':invalid');
          firstInvalid?.focus();
          return;
        }

        const payload = {
          type: prefix,
          name: document.getElementById(`${prefix}Name`).value,
          category: document.getElementById(`${prefix}Category`).value,
          colour: document.getElementById(`${prefix}Colour`).value,
          location: document.getElementById(`${prefix}Location`).value,
          date: document.getElementById(`${prefix}Date`).value,
          description: document.getElementById(`${prefix}Description`).value,
          image: uiState.uploadedImages[prefix]
        };

        const duplicate = findDuplicateReport(payload.type, payload.name, payload.location, payload.date);
        if (duplicate) {
          showConfirmDialog({
            title: 'Possible Duplicate Report',
            message: `An active ${payload.type} report "${duplicate.name}" (#${duplicate.id}) already exists for ${payload.location} on ${formatDateDisplay(payload.date)}. Submit anyway?`,
            confirmLabel: 'Submit Anyway',
            onConfirm: () => finalizeFormSubmission(prefix, form, dateInput, charCountEl, payload)
          });
          return;
        }

        finalizeFormSubmission(prefix, form, dateInput, charCountEl, payload);
      });
    });

    syncLivePreview();
  }

  function clearAllBrowseFilters() {
    uiState.browseType = 'all';
    uiState.browseCategory = 'all';
    uiState.browseLocation = 'all';
    uiState.browseStatus = 'all';
    uiState.browseSort = 'newest';
    uiState.browseSearch = '';

    if (els.browseSearch) els.browseSearch.value = '';
    if (els.browseCategory) els.browseCategory.value = 'all';
    if (els.browseLocation) els.browseLocation.value = 'all';
    if (els.browseStatus) els.browseStatus.value = 'all';
    if (els.browseSort) els.browseSort.value = 'newest';

    document.querySelectorAll('[data-browse-type]').forEach((p) => {
      p.classList.toggle('active', p.dataset.browseType === 'all');
    });

    renderBrowseGrid();
  }

  function bindEvents() {
    // Ripple feedback on buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.ripple-btn');
      if (!btn || prefersReducedMotion) return;
      const rect = btn.getBoundingClientRect();
      const wave = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      wave.className = 'ripple-wave';
      wave.style.width = wave.style.height = `${size}px`;
      wave.style.left = `${e.clientX - rect.left - size / 2}px`;
      wave.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(wave);
      setTimeout(() => wave.remove(), 620);
    });

    // Jump to Report Lost / Found
    document.addEventListener('click', (e) => {
      const jumpBtn = e.target.closest('[data-jump-report]');
      if (jumpBtn) {
        setReportMode(jumpBtn.dataset.jumpReport);
        closeMobileSidebar();
        document.getElementById('report')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });

    // Report mode switcher
    document.querySelectorAll('[data-report-mode]').forEach((tab) => {
      tab.addEventListener('click', () => setReportMode(tab.dataset.reportMode));
    });

    // Mobile sidebar drawer
    els.mobileSidebarToggle?.addEventListener('click', () => {
      els.workspaceSidebar?.classList.add('open');
      els.sidebarBackdrop?.classList.add('show');
      els.mobileSidebarToggle?.setAttribute('aria-expanded', 'true');
    });
    els.mobileSidebarClose?.addEventListener('click', closeMobileSidebar);
    els.sidebarBackdrop?.addEventListener('click', closeMobileSidebar);
    document.querySelectorAll('.sidebar-link').forEach((link) => {
      link.addEventListener('click', closeMobileSidebar);
    });

    // Global quick search ('/' keyboard shortcut + live dropdown)
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        els.globalSearchInput?.focus();
      }
    });

    els.globalSearchInput?.addEventListener('input', () => {
      const q = normalizeString(els.globalSearchInput.value);
      if (!q) {
        if (els.quickSearchDropdown) els.quickSearchDropdown.hidden = true;
        return;
      }
      const matches = appState.reports
        .filter((i) =>
          normalizeString(`${i.id} ${i.name} ${i.category} ${i.location} ${i.colour} ${i.description}`).includes(q)
        )
        .slice(0, 6);

      if (matches.length === 0) {
        els.quickSearchDropdown.innerHTML =
          '<div class="p-3 small text-muted-navy text-center">No matching campus reports found.</div>';
      } else {
        els.quickSearchDropdown.innerHTML = matches
          .map(
            (m) => `
          <button type="button" class="quick-search-item" data-open-item="${escapeHtml(m.id)}">
            <div>
              <strong class="d-block small text-navy">${escapeHtml(m.name)}</strong>
              <span class="small text-muted-navy">${escapeHtml(m.location)} &middot; ${escapeHtml(m.colour)} &middot; ${escapeHtml(m.status)}</span>
            </div>
            <span class="badge-type ${m.type === 'lost' ? 'badge-lost' : 'badge-found'}">${escapeHtml(m.type)}</span>
          </button>
        `
          )
          .join('');
      }
      els.quickSearchDropdown.hidden = false;
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.overview-search-wrap') && els.quickSearchDropdown) {
        els.quickSearchDropdown.hidden = true;
      }
    });

    // Smart Matches filters
    document.querySelectorAll('[data-match-filter]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-match-filter]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        uiState.matchFilter = pill.dataset.matchFilter;
        renderSmartMatches();
      });
    });

    // Browse filters & sort
    document.querySelectorAll('[data-browse-type]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-browse-type]').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        uiState.browseType = pill.dataset.browseType;
        renderBrowseGrid();
      });
    });

    els.browseSearch?.addEventListener('input', (e) => {
      uiState.browseSearch = e.target.value;
      renderBrowseGrid();
    });
    els.browseCategory?.addEventListener('change', (e) => {
      uiState.browseCategory = e.target.value;
      renderBrowseGrid();
    });
    els.browseLocation?.addEventListener('change', (e) => {
      uiState.browseLocation = e.target.value;
      renderBrowseGrid();
    });
    els.browseStatus?.addEventListener('change', (e) => {
      uiState.browseStatus = e.target.value;
      renderBrowseGrid();
    });
    els.browseSort?.addEventListener('change', (e) => {
      uiState.browseSort = e.target.value;
      renderBrowseGrid();
    });

    els.clearBrowseFiltersBtn?.addEventListener('click', clearAllBrowseFilters);
    els.resetBrowseFilters?.addEventListener('click', clearAllBrowseFilters);

    // Delegated clicks for item detail, match review, and direct recovery
    document.addEventListener('click', (e) => {
      const itemTrigger = e.target.closest('[data-open-item]');
      if (itemTrigger) {
        if (els.quickSearchDropdown) els.quickSearchDropdown.hidden = true;
        openItemDetailModal(itemTrigger.dataset.openItem);
        return;
      }

      const matchTrigger = e.target.closest('[data-review-match]');
      if (matchTrigger) {
        openMatchReviewModal(matchTrigger.dataset.reviewMatch);
        return;
      }

      const recoverMatchTrigger = e.target.closest('[data-recover-match]');
      if (recoverMatchTrigger) {
        const pairKey = recoverMatchTrigger.dataset.recoverMatch;
        markMatchPairRecovered(pairKey);
        showToast('Items Marked Recovered', 'Both paired reports are now resolved and removed from active matches.', 'success');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const itemCard = e.target.closest('[data-open-item]');
        if (itemCard) {
          e.preventDefault();
          openItemDetailModal(itemCard.dataset.openItem);
        }
      }
    });

    // Item Detail Modal actions
    document.getElementById('detailJumpMatchesBtn')?.addEventListener('click', () => {
      itemModalInstance?.hide();
      document.getElementById('smart-matches')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    document.getElementById('detailMarkRecoveredBtn')?.addEventListener('click', () => {
      const item = getReportById(uiState.activeDetailItemId);
      if (!item || item.status === 'Recovered') return;
      markSingleReportRecovered(item.id);
      itemModalInstance?.hide();
      showToast('Report Resolved', `${item.name} (#${item.id}) marked as Recovered.`, 'success');
    });

    // Match Review Modal actions
    document.getElementById('confirmMatchBtn')?.addEventListener('click', () => {
      if (!uiState.activeMatchKey) return;
      confirmMatchPair(uiState.activeMatchKey);
      matchModalInstance?.hide();
      showToast('Match Confirmed', 'Match confirmed! You can now mark the items as Recovered once handed over.', 'success');
    });

    document.getElementById('markMatchRecoveredBtn')?.addEventListener('click', () => {
      if (!uiState.activeMatchKey) return;
      markMatchPairRecovered(uiState.activeMatchKey);
      matchModalInstance?.hide();
      showToast('Items Recovered!', 'Both reports marked Recovered/Resolved and dashboard analytics updated.', 'success');
    });

    document.getElementById('dismissMatchBtn')?.addEventListener('click', () => {
      if (!uiState.activeMatchKey) return;
      rejectMatchPair(uiState.activeMatchKey);
      matchModalInstance?.hide();
      showToast('Match Rejected', 'This pair has been excluded from Smart Matches.', 'info');
    });

    // Reset Demo Data button with custom confirmation modal
    document.getElementById('resetDemoBtn')?.addEventListener('click', () => {
      showConfirmDialog({
        title: 'Reset Demo Data?',
        message: 'This will clear any reports and match decisions saved in your browser and restore the initial campus demo dataset.',
        confirmLabel: 'Reset Data',
        onConfirm: resetDemoData
      });
    });

    // Confirmation dialog proceed handler
    document.getElementById('confirmActionProceedBtn')?.addEventListener('click', () => {
      const cb = uiState.pendingConfirmCallback;
      uiState.pendingConfirmCallback = null;
      confirmModalInstance?.hide();
      if (typeof cb === 'function') cb();
    });
  }

  /* ========================================================================
     12. BOOTSTRAP INITIALIZATION & SAFE TEST HOOK
     ======================================================================== */

  function initApp() {
    loadStateFromStorage();
    recalculateMatches();
    renderAll();
    initImageUploads();
    initForms();
    bindEvents();
    initHeroParticles();
    initHero3DParallax();
    initTiltCards();
    animateCounters();
    initScrollEffects();

    if (uiState.storageRecoveredWarning) {
      showToast('Storage Reset', 'Stored browser data was invalid and restored safely to defaults.', 'warning');
    }
  }

  // Expose pure internals on a single namespace for deterministic verification without polluting globals
  window.__TRACE_APP__ = {
    scoreLostFoundPair,
    computeDashboardAnalytics,
    getFilteredAndSortedReports,
    recalculateMatches,
    createReportRecord,
    confirmMatchPair,
    rejectMatchPair,
    markMatchPairRecovered,
    resetDemoData,
    getState: () => appState,
    getMatches: () => computedMatches
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
