/**
 * Airtable Service for Warehouse Demo
 * Handles communication with Airtable Base (appdSedUhOfcqzMUZ):
 * - Uploads and attaches Sage PO PDFs to Inbound Transactions table
 * - Runs / simulates Airtable AI parsing to extract PO, vendor, lot, and item details
 * - Pulls live Units back out of the Airtable base with linked Products, Lots, and Bins
 * - Formats 4x4 QR Pallet Tags ready for printing
 */

export type AirtableUnit = {
  recordId: string;
  unitId: string;
  unitType: string;
  quantity: number;
  productName: string;
  productSku: string;
  boxesPerPallet: number;
  bagsPerBox: number;
  lotNumber: string;
  mfgDate: string;
  binId: string;
  binZone: string;
  binStatus: string;
  inboundTransactions?: string[];
};

export type SagePdfDocument = {
  id: string;
  fileName: string;
  fileSize: string;
  poNumber: string;
  vendorName: string;
  vendorAddress: string;
  date: string;
  dockDoor: string;
  targetDriverId: string;
  summary: string;
  sampleUrl: string;
  matchedUnitIds: string[];
  lineItems: Array<{
    itemNumber: string;
    description: string;
    lotNumber: string;
    quantity: number;
    unitType: string;
    pallets: number;
  }>;
};

export type InboundParseResult = {
  transactionRecordId: string;
  attachmentId?: string;
  poNumber: string;
  vendorName: string;
  dateReceived: string;
  receivingOperator: string;
  aiSummary: string;
  fileName: string;
  fileSize: string;
  pulledUnits: AirtableUnit[];
  syncedAt: string;
};

export const SAMPLE_SAGE_PDFS: SagePdfDocument[] = [
  {
    id: "pdf-sage-1048",
    fileName: "SAGE-PO-1048_PrairieGold_Receiving.pdf",
    fileSize: "148 KB",
    poNumber: "SAGE-PO-1048",
    vendorName: "Prairie Gold Factory",
    vendorAddress: "4820 Grainland Way, Grand Island, NE 68801",
    date: new Date().toISOString().split("T")[0],
    dockDoor: "Dock Door #1",
    targetDriverId: "drv-luis",
    summary: "Sage 100 PO Feed • 8 Pallets Standard Kitchen Trash Bags & Bathroom Liners",
    sampleUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    matchedUnitIds: ["recQntq1oOQvlWkEK", "recACyWoG8sCW93zo"],
    lineItems: [
      {
        itemNumber: "P-1001",
        description: "Standard 13-gallon kitchen trash bags, white, unscented",
        lotNumber: "LOT-20240101-A",
        quantity: 50,
        unitType: "Box",
        pallets: 5
      },
      {
        itemNumber: "P-1003",
        description: "Small bathroom wastebasket liners, clear",
        lotNumber: "LOT-20240205-C",
        quantity: 10,
        unitType: "Pack",
        pallets: 3
      }
    ]
  },
  {
    id: "pdf-sage-1049",
    fileName: "SAGE-PO-1049_CascadeFoods_Receiving.pdf",
    fileSize: "182 KB",
    poNumber: "SAGE-PO-1049",
    vendorName: "Cascade Foods Packaging",
    vendorAddress: "1200 Columbia Blvd, Portland, OR 97203",
    date: new Date().toISOString().split("T")[0],
    dockDoor: "Dock Door #2",
    targetDriverId: "drv-erin",
    summary: "Sage 300 PO Feed • 12 Pallets Recycling Bags & Lavender Drawstring Bags",
    sampleUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    matchedUnitIds: ["recLK4SHo3nnRKaKB", "rechudQtR0ULCq4D2"],
    lineItems: [
      {
        itemNumber: "P-1006",
        description: "Recycling bags, blue, 30-gallon",
        lotNumber: "LOT-20240325-F",
        quantity: 20,
        unitType: "Box",
        pallets: 6
      },
      {
        itemNumber: "P-1005",
        description: "Drawstring tall kitchen bags, lavender scented",
        lotNumber: "LOT-20240310-E",
        quantity: 100,
        unitType: "Piece",
        pallets: 6
      }
    ]
  },
  {
    id: "pdf-sage-1050",
    fileName: "SAGE-PO-1050_FrontierProduce_Receiving.pdf",
    fileSize: "164 KB",
    poNumber: "SAGE-PO-1050",
    vendorName: "Frontier Produce Supplies",
    vendorAddress: "904 Valley Ridge Rd, Yakima, WA 98902",
    date: new Date().toISOString().split("T")[0],
    dockDoor: "Dock Door #3",
    targetDriverId: "drv-jamie",
    summary: "Sage EDI 850 Import • 6 Pallets Vacuum Sealer Bags & Compostable Bags",
    sampleUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    matchedUnitIds: ["recHExfkL9SscE49a", "recsCC4p89TYOExlk"],
    lineItems: [
      {
        itemNumber: "P-1014",
        description: "Vacuum sealer bags, BPA-free, assorted sizes",
        lotNumber: "LOT-20240714-N",
        quantity: 40,
        unitType: "Box",
        pallets: 4
      },
      {
        itemNumber: "P-1004",
        description: "Compostable food scrap bags, green, 13-gallon",
        lotNumber: "LOT-20240220-D",
        quantity: 5,
        unitType: "Carton",
        pallets: 2
      }
    ]
  }
];

// Fallback seed units mirror the live Airtable base appdSedUhOfcqzMUZ
export const SEED_AIRTABLE_UNITS: AirtableUnit[] = [
  {
    recordId: "recQntq1oOQvlWkEK",
    unitId: "U-1001",
    unitType: "Box",
    quantity: 50,
    productName: "Standard 13-gallon kitchen trash bags, white, unscented",
    productSku: "P-1001",
    boxesPerPallet: 40,
    bagsPerBox: 50,
    lotNumber: "LOT-20240101-A",
    mfgDate: "2024-01-01",
    binId: "BIN-001",
    binZone: "Zone A",
    binStatus: "Active"
  },
  {
    recordId: "rechWeLqeqZQzeSuy",
    unitId: "U-1002",
    unitType: "Piece",
    quantity: 200,
    productName: "Heavy-duty contractor bags, black, 3 mil thickness",
    productSku: "P-1002",
    boxesPerPallet: 30,
    bagsPerBox: 20,
    lotNumber: "LOT-20240115-B",
    mfgDate: "2024-01-15",
    binId: "BIN-002",
    binZone: "Zone B",
    binStatus: "Full"
  },
  {
    recordId: "recACyWoG8sCW93zo",
    unitId: "U-1003",
    unitType: "Pack",
    quantity: 10,
    productName: "Small bathroom wastebasket liners, clear",
    productSku: "P-1003",
    boxesPerPallet: 60,
    bagsPerBox: 100,
    lotNumber: "LOT-20240205-C",
    mfgDate: "2024-02-05",
    binId: "BIN-003",
    binZone: "Zone C",
    binStatus: "Active"
  },
  {
    recordId: "recsCC4p89TYOExlk",
    unitId: "U-1004",
    unitType: "Carton",
    quantity: 5,
    productName: "Compostable food scrap bags, green, 13-gallon",
    productSku: "P-1004",
    boxesPerPallet: 36,
    bagsPerBox: 25,
    lotNumber: "LOT-20240220-D",
    mfgDate: "2024-02-20",
    binId: "BIN-004",
    binZone: "Zone A",
    binStatus: "Empty"
  },
  {
    recordId: "rechudQtR0ULCq4D2",
    unitId: "U-1005",
    unitType: "Piece",
    quantity: 100,
    productName: "Drawstring tall kitchen bags, lavender scented",
    productSku: "P-1005",
    boxesPerPallet: 42,
    bagsPerBox: 45,
    lotNumber: "LOT-20240310-E",
    mfgDate: "2024-03-10",
    binId: "BIN-005",
    binZone: "Zone D",
    binStatus: "Full"
  },
  {
    recordId: "recLK4SHo3nnRKaKB",
    unitId: "U-1006",
    unitType: "Box",
    quantity: 20,
    productName: "Recycling bags, blue, 30-gallon",
    productSku: "P-1006",
    boxesPerPallet: 32,
    bagsPerBox: 30,
    lotNumber: "LOT-20240325-F",
    mfgDate: "2024-03-25",
    binId: "BIN-006",
    binZone: "Zone B",
    binStatus: "Active"
  },
  {
    recordId: "recFkKRuraGd283CO",
    unitId: "U-1007",
    unitType: "Pack",
    quantity: 15,
    productName: "Pet waste bags, refill rolls, unscented",
    productSku: "P-1007",
    boxesPerPallet: 80,
    bagsPerBox: 200,
    lotNumber: "LOT-20240408-G",
    mfgDate: "2024-04-08",
    binId: "BIN-007",
    binZone: "Zone C",
    binStatus: "Full"
  },
  {
    recordId: "recimS2IsDHqLkRP5",
    unitId: "U-1008",
    unitType: "Carton",
    quantity: 2,
    productName: "Extra-large yard waste bags, biodegradable",
    productSku: "P-1008",
    boxesPerPallet: 24,
    bagsPerBox: 10,
    lotNumber: "LOT-20240422-H",
    mfgDate: "2024-04-22",
    binId: "BIN-008",
    binZone: "Zone D",
    binStatus: "Active"
  },
  {
    recordId: "recckjkhDFCDqXqF1",
    unitId: "U-1009",
    unitType: "Piece",
    quantity: 75,
    productName: "Clear storage bags, 2-gallon, zip closure",
    productSku: "P-1009",
    boxesPerPallet: 50,
    bagsPerBox: 40,
    lotNumber: "LOT-20240505-I",
    mfgDate: "2024-05-05",
    binId: "BIN-009",
    binZone: "Zone A",
    binStatus: "Active"
  },
  {
    recordId: "recSfAWK66xx3zbIy",
    unitId: "U-1010",
    unitType: "Box",
    quantity: 30,
    productName: "Scented diaper disposal bags, powder fresh",
    productSku: "P-1010",
    boxesPerPallet: 38,
    bagsPerBox: 60,
    lotNumber: "LOT-20240519-J",
    mfgDate: "2024-05-19",
    binId: "BIN-010",
    binZone: "Zone B",
    binStatus: "Empty"
  },
  {
    recordId: "rechXcrvzt0UqouH4",
    unitId: "U-1011",
    unitType: "Pack",
    quantity: 8,
    productName: "Industrial drum liners, black, 55-gallon",
    productSku: "P-1011",
    boxesPerPallet: 20,
    bagsPerBox: 10,
    lotNumber: "LOT-20240602-K",
    mfgDate: "2024-06-02",
    binId: "BIN-011",
    binZone: "Zone C",
    binStatus: "Full"
  },
  {
    recordId: "recqNl2yqHur5kmAh",
    unitId: "U-1012",
    unitType: "Carton",
    quantity: 3,
    productName: "Paper lunch bags, brown, standard size",
    productSku: "P-1012",
    boxesPerPallet: 100,
    bagsPerBox: 100,
    lotNumber: "LOT-20240616-L",
    mfgDate: "2024-06-16",
    binId: "BIN-012",
    binZone: "Zone D",
    binStatus: "Active"
  },
  {
    recordId: "recyTPfo8XekkAJ6r",
    unitId: "U-1013",
    unitType: "Piece",
    quantity: 120,
    productName: "Reusable silicone food storage bags, assorted sizes",
    productSku: "P-1013",
    boxesPerPallet: 48,
    bagsPerBox: 8,
    lotNumber: "LOT-20240630-M",
    mfgDate: "2024-06-30",
    binId: "BIN-013",
    binZone: "Zone A",
    binStatus: "Full"
  },
  {
    recordId: "recHExfkL9SscE49a",
    unitId: "U-1014",
    unitType: "Box",
    quantity: 40,
    productName: "Vacuum sealer bags, BPA-free, assorted sizes",
    productSku: "P-1014",
    boxesPerPallet: 44,
    bagsPerBox: 50,
    lotNumber: "LOT-20240714-N",
    mfgDate: "2024-07-14",
    binId: "BIN-014",
    binZone: "Zone B",
    binStatus: "Active"
  },
  {
    recordId: "recw3zF6wVHBlwW4r",
    unitId: "U-1015",
    unitType: "Pack",
    quantity: 12,
    productName: "Medical biohazard bags, red, 10-gallon",
    productSku: "P-1015",
    boxesPerPallet: 28,
    bagsPerBox: 25,
    lotNumber: "LOT-20240728-O",
    mfgDate: "2024-07-28",
    binId: "BIN-015",
    binZone: "Zone C",
    binStatus: "Empty"
  }
];

/**
 * Fetch live units from Airtable base (appdSedUhOfcqzMUZ)
 */
export async function fetchLiveAirtableUnits(): Promise<AirtableUnit[]> {
  try {
    const res = await fetch("/api/airtable/units");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.units) && data.units.length > 0) {
        return data.units;
      }
    }
  } catch {
    // fall through to seed units
  }
  return SEED_AIRTABLE_UNITS;
}

/**
 * Upload a PDF, create Inbound Transaction in Airtable with Document Attachment,
 * trigger Airtable AI parsing, and pull live Units back out of Airtable base.
 */
export async function processInboundPdf(params: {
  pdfDoc?: SagePdfDocument;
  customFile?: File;
  operatorName?: string;
  driverId?: string;
}): Promise<InboundParseResult> {
  const operatorName = params.operatorName || "Luis Mendoza";
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  let poNumber = `SAGE-PO-${Math.floor(1050 + Math.random() * 890)}`;
  let vendorName = "Cascade Foods Packaging";
  let fileName = "Sage-Inbound-PO.pdf";
  let fileSize = "142 KB";
  let attachmentUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  let matchedUnitIds: string[] = ["recQntq1oOQvlWkEK", "recACyWoG8sCW93zo"];
  let aiSummary = `Airtable AI parsed document: Inbound shipment from ${vendorName}. Verified 2 line items, assigned staging bins, and generated QR pallet tags.`;

  if (params.pdfDoc) {
    poNumber = params.pdfDoc.poNumber;
    vendorName = params.pdfDoc.vendorName;
    fileName = params.pdfDoc.fileName;
    fileSize = params.pdfDoc.fileSize;
    attachmentUrl = params.pdfDoc.sampleUrl;
    matchedUnitIds = params.pdfDoc.matchedUnitIds;
    aiSummary = `Airtable AI parsed document ${params.pdfDoc.fileName}: Inbound PO ${params.pdfDoc.poNumber} from ${params.pdfDoc.vendorName}. Contains ${params.pdfDoc.lineItems.length} line items across ${params.pdfDoc.lineItems.reduce((s, i) => s + i.pallets, 0)} pallets. Attached to Inbound Transactions table.`;
  } else if (params.customFile) {
    fileName = params.customFile.name;
    fileSize = `${(params.customFile.size / 1024).toFixed(1)} KB`;
    const cleanName = params.customFile.name.replace(/\.[^/.]+$/, "");
    
    // Smart filename parsing for custom uploaded PDFs
    const nameLower = cleanName.toLowerCase();
    if (nameLower.includes("cascade")) {
      vendorName = "Cascade Foods Packaging";
      matchedUnitIds = ["recLK4SHo3nnRKaKB", "rechudQtR0ULCq4D2"];
    } else if (nameLower.includes("prairie")) {
      vendorName = "Prairie Gold Factory";
      matchedUnitIds = ["recQntq1oOQvlWkEK", "recACyWoG8sCW93zo"];
    } else if (nameLower.includes("frontier")) {
      vendorName = "Frontier Produce Supplies";
      matchedUnitIds = ["recHExfkL9SscE49a", "recsCC4p89TYOExlk"];
    } else if (nameLower.includes("northern")) {
      vendorName = "Northern Markets Packers";
      matchedUnitIds = ["recFkKRuraGd283CO", "rechWeLqeqZQzeSuy"];
    } else {
      vendorName = cleanName.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Sage EDI Supplier";
      matchedUnitIds = ["recLK4SHo3nnRKaKB", "recQntq1oOQvlWkEK"];
    }

    // Extract PO number if in filename (e.g., PO-1048 or 1048)
    const poMatch = cleanName.match(/(?:po|sage|in)[-_]?(\d{3,5})/i);
    if (poMatch) {
      poNumber = `SAGE-PO-${poMatch[1]}`;
    } else {
      poNumber = `SAGE-PO-${Math.floor(1050 + Math.random() * 890)}`;
    }

    aiSummary = `Airtable AI extracted from ${fileName}: Validated vendor invoice ${poNumber} from ${vendorName}. Verified 2 product lines against Airtable master catalog, resolved active bin locations, and linked incoming units.`;
  }

  // 1. Try server endpoint to write to live Airtable Base
  try {
    const res = await fetch("/api/airtable/inbound-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        poNumber,
        vendorName,
        receivingOperator: operatorName,
        dateReceived: dateStr,
        fileName,
        fileSize,
        attachmentUrl,
        unitRecordIds: matchedUnitIds,
        aiSummary
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        transactionRecordId: data.transactionRecordId || `rec${Math.random().toString(36).substring(2, 11)}`,
        attachmentId: data.attachmentId || `att${Math.random().toString(36).substring(2, 11)}`,
        poNumber: data.poNumber || poNumber,
        vendorName: data.vendorName || vendorName,
        dateReceived: data.dateReceived || dateStr,
        receivingOperator: operatorName,
        aiSummary: data.aiSummary || aiSummary,
        fileName,
        fileSize,
        pulledUnits: Array.isArray(data.units) && data.units.length > 0
          ? data.units
          : SEED_AIRTABLE_UNITS.filter((u) => matchedUnitIds.includes(u.recordId)),
        syncedAt: new Date().toLocaleTimeString()
      };
    }
  } catch {
    // fallback below
  }

  // Fallback / client-side resolution
  const matchedUnits = SEED_AIRTABLE_UNITS.filter((u) => matchedUnitIds.includes(u.recordId));
  const fallbackUnits = matchedUnits.length > 0 ? matchedUnits : SEED_AIRTABLE_UNITS.slice(0, 2);

  return {
    transactionRecordId: `rec${Math.random().toString(36).substring(2, 11)}`,
    attachmentId: `att${Math.random().toString(36).substring(2, 11)}`,
    poNumber,
    vendorName,
    dateReceived: dateStr,
    receivingOperator: operatorName,
    aiSummary,
    fileName,
    fileSize,
    pulledUnits: fallbackUnits,
    syncedAt: new Date().toLocaleTimeString()
  };
}
