import { Country, Sector, ProjectPhase, PMOTask, Milestone, SOPArticle, PMOMeeting, SyncConnectionState, DiagnosticPriceItem } from "./types";

export interface TestMenuItem {
  id: string;
  category: string;
  test: string;
  costSAR: number;
  priceSAR: number;
  defaultVolumeY1: number;
  saudiMarketVol: number;
  estimatedMarketShare: number;
}

export interface YearProjection {
  yearName: string;
  revenueM: number;
  ebitdaM: number;
  marginPct: number;
  testsK: number;
  countriesCount: number;
}

export interface RoomData {
  id: string;
  name: string;
  arabicName: string;
  areaM2: number;
  pressure: string; // e.g. "-35 Pa", "Positive"
  temp: string; // e.g. "25°C"
  classType: string; // BSL-3 / BSL-2 / Non-Clinical
  description: string;
  equipment: string[];
  sops: string[];
}

export interface TAWASOL_MENA_Product {
  catalogNo: string;
  productName: string;
  solvent: string;
  concentration: string;
  pkg: string;
}

export interface StaffRoleProp {
  id: string;
  role: string;
  count: number;
  baseSalarySAR: number;
  description: string;
}

// 1. Year 1 Saudi LC-MS/MS Launch Test Menu
export const SAUDI_YEAR1_LAUNCH_MENU: TestMenuItem[] = [
  { id: "tm-1", category: "Immunosuppressive TDM", test: "Tacrolimus", costSAR: 50, priceSAR: 350, defaultVolumeY1: 8000, saudiMarketVol: 350000, estimatedMarketShare: 2.3 },
  { id: "tm-2", category: "Immunosuppressive TDM", test: "Cyclosporine", costSAR: 60, priceSAR: 450, defaultVolumeY1: 2500, saudiMarketVol: 80000, estimatedMarketShare: 3.1 },
  { id: "tm-3", category: "Immunosuppressive TDM", test: "Everolimus", costSAR: 80, priceSAR: 650, defaultVolumeY1: 1200, saudiMarketVol: 35000, estimatedMarketShare: 3.4 },
  { id: "tm-4", category: "Steroid Hormones", test: "Testosterone LC-MS", costSAR: 50, priceSAR: 250, defaultVolumeY1: 12000, saudiMarketVol: 500000, estimatedMarketShare: 2.4 },
  { id: "tm-5", category: "Steroid Hormones", test: "17-OH Progesterone", costSAR: 60, priceSAR: 350, defaultVolumeY1: 3500, saudiMarketVol: 120000, estimatedMarketShare: 2.9 },
  { id: "tm-6", category: "Steroid Hormones", test: "Aldosterone", costSAR: 110, priceSAR: 650, defaultVolumeY1: 2000, saudiMarketVol: 60000, estimatedMarketShare: 3.3 },
  { id: "tm-7", category: "Catecholamines", test: "Plasma Metanephrines", costSAR: 140, priceSAR: 950, defaultVolumeY1: 3000, saudiMarketVol: 100000, estimatedMarketShare: 3.0 },
  { id: "tm-8", category: "Catecholamines", test: "Catecholamines Panel", costSAR: 160, priceSAR: 1200, defaultVolumeY1: 1000, saudiMarketVol: 30000, estimatedMarketShare: 3.3 },
  { id: "tm-9", category: "ICP-MS", test: "Zinc Plasma", costSAR: 40, priceSAR: 250, defaultVolumeY1: 5000, saudiMarketVol: 150000, estimatedMarketShare: 3.3 },
  { id: "tm-10", category: "ICP-MS", test: "Lead", costSAR: 60, priceSAR: 350, defaultVolumeY1: 3000, saudiMarketVol: 80000, estimatedMarketShare: 3.8 },
  { id: "tm-11", category: "Anti-Epileptic TDM", test: "Levetiracetam", costSAR: 50, priceSAR: 350, defaultVolumeY1: 4000, saudiMarketVol: 180000, estimatedMarketShare: 2.2 },
  { id: "tm-12", category: "Anti-Epileptic TDM", test: "Lamotrigine", costSAR: 60, priceSAR: 450, defaultVolumeY1: 2000, saudiMarketVol: 70000, estimatedMarketShare: 2.9 },
  { id: "tm-13", category: "Antifungal TDM", test: "Voriconazole", costSAR: 90, priceSAR: 700, defaultVolumeY1: 1500, saudiMarketVol: 50000, estimatedMarketShare: 3.0 },
  { id: "tm-14", category: "Antifungal TDM", test: "Posaconazole", costSAR: 110, priceSAR: 900, defaultVolumeY1: 700, saudiMarketVol: 20000, estimatedMarketShare: 3.5 },
  
  // Most Profitable Initial Menu (Functional Medicine)
  { id: "tm-prof-1", category: "Functional Medicine", test: "Organic Acids Panel", costSAR: 71, priceSAR: 650, defaultVolumeY1: 5000, saudiMarketVol: 150000, estimatedMarketShare: 3.3 },
  { id: "tm-prof-2", category: "Functional Medicine", test: "SCFA Panel (Short-Chain Fatty Acids)", costSAR: 90, priceSAR: 750, defaultVolumeY1: 5000, saudiMarketVol: 120000, estimatedMarketShare: 4.2 },
  { id: "tm-prof-3", category: "Functional Medicine", test: "Amino Acid Panel", costSAR: 129, priceSAR: 950, defaultVolumeY1: 5000, saudiMarketVol: 100000, estimatedMarketShare: 5.0 },
  { id: "tm-prof-4", category: "Functional Medicine", test: "Tryptophan/Kynurenine Panel", costSAR: 129, priceSAR: 950, defaultVolumeY1: 5000, saudiMarketVol: 80000, estimatedMarketShare: 6.25 },
  { id: "tm-prof-5", category: "Functional Medicine", test: "Lipidomics Panel", costSAR: 154, priceSAR: 1100, defaultVolumeY1: 5000, saudiMarketVol: 90000, estimatedMarketShare: 5.5 },
  { id: "tm-prof-pkg", category: "Functional Medicine Offer", test: "Functional Medicine & Metabolic Health Package", costSAR: 573, priceSAR: 4200, defaultVolumeY1: 5000, saudiMarketVol: 20000, estimatedMarketShare: 25.0 }
];

// 2. 10-Year Macro-Economic Projection P&L
export const TEN_YEARS_PROJECTION: YearProjection[] = [
  { yearName: "2026 (Y1)", revenueM: 23.7, ebitdaM: -0.8, marginPct: -4.1, testsK: 120, countriesCount: 2 },
  { yearName: "2027 (Y2)", revenueM: 50.2, ebitdaM: 11.2, marginPct: 22.3, testsK: 243, countriesCount: 3 },
  { yearName: "2028 (Y3)", revenueM: 90.1, ebitdaM: 27.1, marginPct: 30.1, testsK: 418, countriesCount: 5 },
  { yearName: "2029 (Y4)", revenueM: 137.7, ebitdaM: 48.6, marginPct: 26.3, testsK: 612, countriesCount: 7 },
  { yearName: "2030 (Y5)", revenueM: 190.3, ebitdaM: 76.9, marginPct: 40.4, testsK: 809, countriesCount: 8 },
  { yearName: "2031 (Y6)", revenueM: 238.8, ebitdaM: 106.0, marginPct: 34.2, testsK: 971, countriesCount: 9 },
  { yearName: "2032 (Y7)", revenueM: 285.3, ebitdaM: 136.9, marginPct: 48.0, testsK: 1111, countriesCount: 9 },
  { yearName: "2033 (Y8)", revenueM: 330.7, ebitdaM: 169.0, marginPct: 39.9, testsK: 1232, countriesCount: 9 },
  { yearName: "2034 (Y9)", revenueM: 373.0, ebitdaM: 197.9, marginPct: 41.3, testsK: 1330, countriesCount: 9 },
  { yearName: "2035 (Y10)", revenueM: 412.4, ebitdaM: 225.8, marginPct: 54.7, testsK: 1407, countriesCount: 9 }
];

// 3. Lab Floor Plan Interactive Rooms
export const LAB_ROOMS: RoomData[] = [
  {
    id: "room-command",
    name: "Emergency Command Center",
    arabicName: "مركز القيادة الطارئة",
    areaM2: 19.4,
    pressure: "Ambient",
    temp: "22°C",
    classType: "Non-Clinical",
    description: "Central command room providing physical workspace for lab coordinators, remote telemetry, IT servers, and real-time cold-chain logging displays.",
    equipment: ["Surveillance Display Rails", "LIMS Server Rack", "GPS Transport Tracking Receiver"],
    sops: ["SOP-LAB-COMM-01: Incident Command Response Protocol"]
  },
  {
    id: "room-pcr",
    name: "PCR Amplification Room",
    arabicName: "غرفة تضاعف الـ PCR",
    areaM2: 24.5,
    pressure: "-25 Pa (Negative)",
    temp: "20°C",
    classType: "BSL-3",
    description: "Negative pressure amplification laboratory housing high-throughput thermal cyclers. Restricts biosafety threats from aerosol leakage.",
    equipment: ["BioRad CFX 96 Touch Real-Time PCR", "Thermo Microplates Shakers", "Silicone Sealing Mats"],
    sops: ["SOP-PROC-PCR: Thermal Calibration & Verification Cycles"]
  },
  {
    id: "room-prep",
    name: "Specimen Preparation & Nucleic Acid Isolation",
    arabicName: "تحضير العينات وعزل الأحماض النووية",
    areaM2: 32.2,
    pressure: "-35 Pa (Negative)",
    temp: "21°C",
    classType: "BSL-3",
    description: "Highly restricted BSL-3 laboratory containment zone designed for raw specimen extraction, pipetting, and initial lysis processing.",
    equipment: ["Automatic Magnetic Beads Extractor (96)", "Hamilton Microlab STAR STAR-10", "Diatomaceous Earth SLE vacuum plates"],
    sops: ["SOP-CLIN-BSL3: Containment Protocols & Negative Suction"]
  },
  {
    id: "room-reagent",
    name: "Reagent Storage & Reagent Preparation",
    arabicName: "مخزن وتحضير الكواشف",
    areaM2: 18.0,
    pressure: "+15 Pa (Positive)",
    temp: "19°C",
    classType: "BSL-2 / Cleanroom",
    description: "Positive pressure cleanroom designed specifically to prevent particulate matter and external amplicon contaminants from compromising virgin testing enzymes.",
    equipment: ["Ultra-low Refrigerating Units (-70°C)", "DiSigns IVD Standard Kits Vault", "HLB/WCX extraction beads dispenser"],
    sops: ["SOP-LOG-COLD: Cold chain refrigeration storage and transport logs"]
  },
  {
    id: "room-instruments",
    name: "Clinical Mass Spectrometry Room",
    arabicName: "مختبر الكشف بالطيف الكتلي",
    areaM2: 45.0,
    pressure: "-20 Pa (Negative)",
    temp: "24°C",
    classType: "BSL-3",
    description: "Pratice-changing mass spec analytical wing. Accommodates multi-technology organic and inorganic diagnostic platforms under strict temperature uniformities.",
    equipment: ["2 x SCIEX Citrine Triple Quad MD", "3 x SCIEX 4500MD LC-MS/MS System", "2 x Agilent 7800 ICP-MS", "Centralized N2 Generator (250K)"],
    sops: ["SOP-PROC-CALIB: Mass Spectrometry calibration and tuning protocols"]
  },
  {
    id: "room-microbiology",
    name: "Microbiology & Serology Wing",
    arabicName: "مختبر علم الكائنات الدقيقة والمصلية",
    areaM2: 38.6,
    pressure: "-15 Pa (Negative)",
    temp: "22°C",
    classType: "BSL-2",
    description: "BSL-2 clinical space processing standard fluid pathology, immunology assays, hematology and serological screening workflows.",
    equipment: ["Power Link Automation Beckman Coulter Link", "DxH 800 Hematology Analyzer", "ACL Elite Coagulation system", "Helios Auto IFA Processor"],
    sops: ["SOP-CLIN-BSL2: Standard BSL-2 Biosafety Guidelines"]
  },
  {
    id: "room-accession",
    name: "Sample Receiving & Phlebotomy Areas",
    arabicName: "منطقة استقبال العينات وسحب الدم",
    areaM2: 50.0,
    pressure: "Ambient",
    temp: "23°C",
    classType: "Non-Clinical",
    description: "Primary patient-facing and logistics intake area. Barcode-driven accessioning guarantees robust tracking from the moment a sample arrives.",
    equipment: ["Continuous barcode scanning system", "Digital phlebotomy recliners", "Express Custom Clearance documentation portal"],
    sops: ["SOP-ACC-BARC: Barcoded Sample Accessioning & Verification Chain"]
  },
  {
    id: "cairo-pharmacy",
    name: "National Compound Pharmacy Unit (1st in Egypt)",
    arabicName: "الوحدة الوطنية لتحضير الصيدلاني التركيبي الأول بمصر",
    areaM2: 165.0,
    pressure: "+25 Pa (Strict Positive)",
    temp: "20°C",
    classType: "Cleanroom / Class A",
    description: "First certified clinical hospital-standard sterile medicinal compounding laboratory in Egypt. Engineered for patient-specific gene therapy delivery, sterile oncology drug mixtures, and biochemical dosage synthesis during clinical diagnostic trials.",
    equipment: ["Class-A Aseptic Cytotoxic isolators", "Formulation Mixing Hoods", "HPLC Chemical Purity Analyzers", "Secure Reagent Disperser Module"],
    sops: ["SOP-CAIRO-CP-01: Sterile Clinical Compounding Guidelines & Cleanroom Gown Protocols"]
  },
  {
    id: "cairo-entrance",
    name: "Biomedical Escalator & Grand Reception Lobby",
    arabicName: "ردهة الاستقبال الكبرى والسلالم الكهربائية",
    areaM2: 340.0,
    pressure: "Ambient",
    temp: "22°C",
    classType: "Non-Clinical",
    description: "High-capacity logistics reception, patient onboarding, and administrative coordination lobby. Housing majestic automated mechanical elevators and escalators to connect the 1,300 m² high-precision diagnosis center.",
    equipment: ["Escalator Safety Grid Controllers", "Dual-Channel Patient Registration Rails", "Automated Barcode Printers & Dispensing Terminals"],
    sops: ["SOP-CAIRO-ENT: High-Capacity Public Intake & Security Compliance Protocols"]
  },
  {
    id: "cairo-molecular",
    name: "High-Throughput Molecular Diagnostics (BSL-3)",
    arabicName: "التشخيص الجزيئي فائق الدقة (BSL-3)",
    areaM2: 220.0,
    pressure: "-35 Pa (Negative)",
    temp: "19°C",
    classType: "BSL-3",
    description: "Negative-pressure genetic screening lab. Outfitted with high-throughput biohazard hoods, airlocks, and extraction arrays for infectious pathogens and molecular viral assays.",
    equipment: ["Hamilton Microlab STARlette robotic pipettes", "Roche LightCycler 480 II systems", "Dual-negative containing airlock exhausting ducts"],
    sops: ["SOP-CAIRO-MD-14: BSL-3 Advanced Nucleic Extraction Containment & Safety Standard"]
  },
  {
    id: "cairo-omics",
    name: "Mass Spectrometry & Advanced Omics Center",
    arabicName: "مركز الطيف الكتلي والأوميكس المتقدم",
    areaM2: 290.0,
    pressure: "-20 Pa (Negative)",
    temp: "21°C",
    classType: "BSL-3",
    description: "State-of-the-art analytical core laboratory featuring triple-quadrupole instruments for newborn screening, endocrine research, toxicological profiles, and metabolic assay validations.",
    equipment: ["4 x SCIEX Citrine Triple Quad MD systems", "3 x Agilent 7800 ICP-MS Arrays", "Continuous Liquid Nitrogen Gas Generators"],
    sops: ["SOP-CAIRO-MS-05: Mass Spectrometer Multi-Instrument Tuning & Calibra Protocols"]
  },
  {
    id: "cairo-biobank",
    name: "Sovereign Cryogenic Biobank & Cold-Vault",
    arabicName: "البنك الحيوي السيادي ومخازن التبريد الكبرى",
    areaM2: 155.0,
    pressure: "Ambient",
    temp: "18°C",
    classType: "BSL-2",
    description: "National repository for cryogenic biological sample archival, supporting longitudinal studies and vaccine diagnostic validations. Protected by triple electrical redundancy grids.",
    equipment: ["Liquid Nitrogen Cryostatic Vats (-196°C)", "Intelligent Backup Power Generators", "Continuous GSM Remote Temperature Transmitters"],
    sops: ["SOP-CAIRO-BB-02: Sovereign Cryo-Repository Sample Custody & Retrieval Lifecycle"]
  },
  {
    id: "cairo-pathology",
    name: "Clinical Pathology & Mass Screening Core",
    arabicName: "أمراض الدم والكشف الجماعي للعينات",
    areaM2: 130.0,
    pressure: "-15 Pa (Negative)",
    temp: "22°C",
    classType: "BSL-2",
    description: "Automated high-capacity diagnostic conveyor loop for routine chemistry, lipid profiling, and blood screening, directly synchronized with Egyptian national diagnostic baseloads.",
    equipment: ["Beckman Coulter DXI 800 Immunochemical Analyzer", "Diagnostic Tube Decapping Robot S2", "Modular Automated Track conveyor system"],
    sops: ["SOP-CAIRO-PATH-09: Automated Conveyance Sorting & Centrifuge Operational Rules"]
  }
];

// 4. Featured TAWASOL MENA FirstStandard Reference Materials
export const TAWASOL_MENA_PRODUCTS_PRESET: TAWASOL_MENA_Product[] = [
  { catalogNo: "1ST27010-100B", productName: "70 Pesticides Mix Solution", solvent: "Acetone", concentration: "100μg/mL", pkg: "1mL" },
  { catalogNo: "1ST27012-100B", productName: "12 Organochlorine Pesticides Mix Solution", solvent: "Acetone", concentration: "100μg/mL", pkg: "1mL" },
  { catalogNo: "1ST9220-100M", productName: "45 Steroid Hormones Mix Solution", solvent: "Acetonitrile", concentration: "100μg/mL", pkg: "1mL" },
  { catalogNo: "1ST1188-1000H", productName: "18 Phthalate Mix Solution", solvent: "N-Hexane", concentration: "1000μg/mL", pkg: "1mL" },
  { catalogNo: "1ST9224-1000M", productName: "3 Dichlorobenzene Mix Solution", solvent: "Methanol", concentration: "1000μg/mL", pkg: "1mL" },
  { catalogNo: "1ST9284-100M", productName: "10 Quinolones Mix Solution", solvent: "Methanol", concentration: "100μg/mL", pkg: "1mL" }
];

export const BASAL_PMO_TASKS: PMOTask[] = [];

export const INITIAL_MILESTONES: Milestone[] = [
  { id: "m1", country: "Egypt", phase: "Phase 1: Site Prep & Legal", title: "MoHP Legal Approval & Facility Charter", description: "Secure the official governmental reference charter from Cairo MoHP.", targetDate: "2026-02-15", status: "Achieved" },
  { id: "m2", country: "UAE", phase: "Phase 1: Site Prep & Legal", title: "MOHAP Structural Biosafety Licensing", description: "Obtain structural biosafety license with DHA/DOH approvals.", targetDate: "2026-03-01", status: "Achieved" },
  { id: "m3", country: "Saudi Arabia", phase: "Phase 1: Site Prep & Legal", title: "SFDA Import Permit Approval", description: "Secure SFDA customs clearing allowables for SCIEX analytical platforms.", targetDate: "2026-03-20", status: "Achieved" },
  { id: "m4", country: "Egypt", phase: "Phase 2: Procurement & Logistics", title: "UPA Cold Chain Tender Distribution", description: "Publish bid guidelines in alignment with Egypt UPA regulations.", targetDate: "2026-05-10", status: "Achieved" },
  { id: "m5", country: "UAE", phase: "Phase 2: Procurement & Logistics", title: "Vitek & Illumina Sequencer Commisioning", description: "Host calibration check routines in BSL-3 duba/abudhabi wings.", targetDate: "2026-06-15", status: "Pending" },
  { id: "m6", country: "Saudi Arabia", phase: "Phase 3: HR & Specialized Trainings", title: "Clinical Virologists Onboarding", description: "Onboard lead clinicians with 1-month TAWASOL MENA Hub targeted specialized training.", targetDate: "2026-07-01", status: "Pending" }
];

export const INITIAL_SYNC_CHANNELS: Record<string, SyncConnectionState> = {};

export const INITIAL_PMO_MEETINGS: PMOMeeting[] = [];

export const GENETIC_TEST_MENU: DiagnosticPriceItem[] = [
  { id: "gt-1", name: "NIPTune® C", description: "Non Invasive Prenatal Testing - Trisomy 13, 18, 21, sex chromosome aneuploidies; fetus sex determination option available upon request in TRF", tat: "7 - 10 Working days", price: 9000, currency: "SAR" },
  { id: "gt-2", name: "NIPTune® S", description: "Non Invasive Prenatal Testing - Trisomy 13, 18, 21, sex chromosome aneuploidies, autosomal aneuploidies in all other chromosomes as well; fetus sex determination option available upon request in TRF", tat: "7 - 10 Working days", price: 11000, currency: "SAR" },
  { id: "gt-3", name: "ExoSeq® Comp", description: "Whole exome sequencing - with basic clinical report", tat: "6 weeks", price: 20000, currency: "SAR" },
  { id: "gt-4", name: "ExoSeq® CS", description: "Exome Sequencing - Carrier Screening for pathogenic and likely pathogenic variants (VUS when appropriate)", tat: "4 weeks", price: 22000, currency: "SAR" },
  { id: "gt-5", name: "ExoSeq® Gynae", description: "Exome Sequencing- Women's Health - Covering 180 genes", tat: "6 weeks", price: 22000, currency: "SAR" },
  { id: "gt-6", name: "ExoSeq® MNH", description: "Exome Sequencing- men's Health - Covering 180 genes", tat: "6 weeks", price: 22000, currency: "SAR" },
  { id: "gt-7", name: "ExoSeq® Fertility M", description: "Exome Sequencing- Male Infertility & Comprehensive Inflammatory and Autoinflammatory panel- Covering 432 genes", tat: "6 weeks", price: 22000, currency: "SAR" },
  { id: "gt-8", name: "ExoSeq® Fertility F", description: "Exome Sequencing- Female Infertility & Comprehensive Inflammatory and Autoinflammatory pane Covering 400 genes", tat: "6 weeks", price: 22000, currency: "SAR" },
  { id: "gt-9", name: "Eatwellgx™", description: "Consumer genetics product made up of four panels, namely: Vitamin requirements, mineral requirements, detoxification ability and food intolerance", tat: "2 weeks", price: 8000, currency: "SAR" },
  { id: "gt-10", name: "Fitwellgx™", description: "Consumer genetics product made up of three panels, namely: muscle profile, injury & recovery, recovery nutrition", tat: "2 weeks", price: 8000, currency: "SAR" },
  { id: "gt-11", name: "Immuwellgx™", description: "Consumer genetics product made up of six panels, namely: ACE2 receptor genes, ACE2 enzyme, Severe SARS viral and Covid19 infections, inflammatory markers, blood oxygenation, trace element levels", tat: "2 weeks", price: 8000, currency: "SAR" },
  { id: "gt-12", name: "Skinwellgx™", description: "Consumer genetics product made up of six panels, namely: Skin Health, Sunlight Ageing, Acne risk, Predisposition to Dry Skin, Hair Health, Predisposition to Cellulite and Varicose Vein Development, Skin Oxidation Response, Skin Sensitivity, Optimal Skin Nutrition, Alopecia Risk, Predisposition to Male Pattern Baldness", tat: "2 weeks", price: 8000, currency: "SAR" },
  { id: "gt-13", name: "Treatwellgx™", description: "Consumer genetics product helps to understand how genetics influences your body's response to medications & substance. It also includes traits for hormonal contraceptives and toxicity for analgesics and caffeine.", tat: "2 weeks", price: 8000, currency: "SAR" },
  { id: "gt-14", name: "Sportswellgx™", description: "Consumer Genetics product that helps Professional Athletes/Sports Personnel explore how genetics may influence body’s response to different exercises and training programs.", tat: "2 weeks", price: 8000, currency: "SAR" },
  { id: "gt-15", name: "Tracewellgx", description: "Consumer Genetics product that helps clients trace their ethnicity roots and ancestry DNA analysis", tat: "2 weeks", price: 8000, currency: "SAR" },
  { id: "gt-16", name: "Guardwellgx", description: "Understand how genetics influence risks associated with Endocrinological, Cardiovascular, Metabolic, Immunological and Neurological conditions", tat: "2 weeks", price: 8000, currency: "SAR" },
  { id: "gt-17", name: "OncoSeq C", description: "Read of 12 Genes - BRCA1, BRCA2, BRIP1, CHEK2, ERBB2, APC, MLH1, MSH2, MSH6, MUTYH, PMS2, TP53", tat: "3-4 weeks", price: 10000, currency: "SAR" },
  { id: "gt-18", name: "OncoSeq S", description: "Read of 25 Genes – APC, ATM, BARD1, BRCA1, BRCA2, BRIP1, CDH1, CHEK2, EPCAM, MLH1, MSH2, MSH6, PALB2, PTEN, MUTYH, NF1, NF2, PIK3CA, PMS2, PTCH1, RAD50, RAD51C, RAD51D, STK11, TP53", tat: "3-4 weeks", price: 13000, currency: "SAR" },
  { id: "gt-19", name: "Gut Chex™", description: "Screening of Gut Microbiota by NGS", tat: "10-20 days", price: 16000, currency: "SAR" }
];

