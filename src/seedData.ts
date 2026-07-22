export type Driver = { id: string; name: string };
export type Assignment = {
  id: string;
  driverId: string;
  type: "Receiving" | "Outbound";
  title: string;
  status: string;
};
export type Pallet = {
  id: string;
  product: string;
  lot: string;
  batch: string;
  customer: string;
  assignedBin: string;
  currentBoxes: number;
  looseBags: number;
  ageDays: number;
  isPartial: boolean;
  hasOpenBox: boolean;
};
export type Bin = {
  id: string;
  rack: string;
  side: string;
  position: number;
  level: number;
  status: "Empty" | "Occupied" | "Allocated" | "Exception";
  palletId?: string;
};
export type PickTask = {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  unit: string;
  pickType: string;
  binId: string;
  palletId: string;
};
export type CustomerOrder = {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  unit: string;
  requestedShipDate: string;
  status: string;
};

const basePallets: Pallet[] = [
  { id: "PAL-000087", product: "Northfield 5 lb Potato Bag", lot: "LOT-24-091", batch: "B-4401", customer: "Cascade Foods", assignedBin: "A-W-02-L1", currentBoxes: 65, looseBags: 0, ageDays: 52, isPartial: false, hasOpenBox: false },
  { id: "PAL-000044", product: "Valley Pack 10 lb Potato Bag", lot: "LOT-24-070", batch: "B-4312", customer: "Frontier Produce", assignedBin: "C-E-02-L2", currentBoxes: 17, looseBags: 12, ageDays: 67, isPartial: true, hasOpenBox: true },
  { id: "PAL-000105", product: "Harvest Lane 12 lb Potato Bag", lot: "LOT-24-108", batch: "B-4510", customer: "Open Stock", assignedBin: "B-E-03-L2", currentBoxes: 65, looseBags: 0, ageDays: 0, isPartial: false, hasOpenBox: false },
  { id: "PAL-000106", product: "Harvest Lane 12 lb Potato Bag", lot: "LOT-24-108", batch: "B-4510", customer: "Open Stock", assignedBin: "B-E-03-L3", currentBoxes: 65, looseBags: 0, ageDays: 0, isPartial: false, hasOpenBox: false },
  { id: "PAL-000062", product: "Green Ridge 3 lb Potato Bag", lot: "LOT-24-088", batch: "B-4391", customer: "Cascade Foods", assignedBin: "W-E-02-L1", currentBoxes: 31, looseBags: 0, ageDays: 44, isPartial: true, hasOpenBox: false },
  { id: "PAL-000071", product: "Riverbend 5 lb Potato Bag", lot: "LOT-24-095", batch: "B-4420", customer: "Open Stock", assignedBin: "W-S-03-L2", currentBoxes: 65, looseBags: 0, ageDays: 33, isPartial: false, hasOpenBox: false }
];

const mainBins = ["A", "B", "C"].flatMap((rack) =>
  ["W", "E"].flatMap((side) =>
    [1, 2, 3, 4].flatMap((position) =>
      [1, 2, 3].map((level) => `${rack}-${side}-${String(position).padStart(2, "0")}-L${level}`)
    )
  )
);

const wallBins = ["N", "E", "S", "W"].flatMap((side) =>
  [1, 2, 3, 4].flatMap((position) =>
    [1, 2, 3].map((level) => `W-${side}-${String(position).padStart(2, "0")}-L${level}`)
  )
);

const binIds = [...mainBins, ...wallBins];

const productPool = [
  { product: "Northfield 5 lb Potato Bag", customer: "Cascade Foods" },
  { product: "Green Ridge 3 lb Potato Bag", customer: "Cascade Foods" },
  { product: "Valley Pack 10 lb Potato Bag", customer: "Frontier Produce" },
  { product: "Prairie Gold 12 lb Potato Bag", customer: "Frontier Produce" },
  { product: "Harvest Lane 12 lb Potato Bag", customer: "Open Stock" },
  { product: "Riverbend 5 lb Potato Bag", customer: "Open Stock" },
  { product: "Summit Fresh 10 lb Potato Bag", customer: "Northern Markets" },
  { product: "Red Barn 3 lb Potato Bag", customer: "Northern Markets" },
  { product: "Blue Acre 5 lb Potato Bag", customer: "Valley Co-op" },
  { product: "Stone Mill 10 lb Potato Bag", customer: "Valley Co-op" }
];

const targetOccupiedBins = Math.round(binIds.length * 0.6);
const occupiedBins = new Set(basePallets.map((pallet) => pallet.assignedBin));
const generatedPallets: Pallet[] = [];

for (const binId of binIds) {
  if (occupiedBins.size >= targetOccupiedBins) break;
  if (occupiedBins.has(binId)) continue;

  const index = generatedPallets.length;
  const item = productPool[index % productPool.length];
  const partial = index % 11 === 0;
  const openBox = index % 17 === 0;
  const boxes = partial ? 22 + (index % 28) : 65;
  const looseBags = openBox ? 6 + (index % 15) : 0;

  generatedPallets.push({
    id: `PAL-${String(200 + index).padStart(6, "0")}`,
    product: item.product,
    lot: `LOT-24-${String(120 + (index % 18)).padStart(3, "0")}`,
    batch: `B-${4600 + (index % 35)}`,
    customer: item.customer,
    assignedBin: binId,
    currentBoxes: boxes,
    looseBags,
    ageDays: 6 + ((index * 7) % 74),
    isPartial: partial || openBox,
    hasOpenBox: openBox
  });

  occupiedBins.add(binId);
}

const pallets: Pallet[] = [...basePallets, ...generatedPallets];

const parseBin = (id: string) => {
  const [rack, side, position, level] = id.split("-");
  return {
    rack,
    side,
    position: Number(position),
    level: Number(level.replace("L", ""))
  };
};

const bins: Bin[] = binIds.map((id) => {
  const pallet = pallets.find((item) => item.assignedBin === id);
  const allocated = pallet?.id === "PAL-000087";
  const parsed = parseBin(id);
  return {
    id,
    ...parsed,
    status: pallet ? allocated ? "Allocated" : "Occupied" : "Empty",
    palletId: pallet?.id
  };
});

export const demoData = {
  customers: [
    { id: "cust-cascade", name: "Cascade Foods" },
    { id: "cust-frontier", name: "Frontier Produce" },
    { id: "cust-northern", name: "Northern Markets" },
    { id: "cust-valley", name: "Valley Co-op" }
  ],
  drivers: [
    { id: "drv-luis", name: "Luis Mendoza" },
    { id: "drv-jamie", name: "Jamie Carter" },
    { id: "drv-erin", name: "Erin Brooks" }
  ] satisfies Driver[],
  assignments: [
    { id: "ASN-R-001", driverId: "drv-luis", type: "Receiving", title: "Receive Sage IN-1044", status: "Assigned" },
    { id: "ASN-S-001", driverId: "drv-luis", type: "Outbound", title: "Ship Cascade SO-8821", status: "Approved" },
    { id: "ASN-S-002", driverId: "drv-jamie", type: "Outbound", title: "Ship Frontier SO-8822", status: "Office Review" }
  ] satisfies Assignment[],
  incomingOrders: [
    { id: "IN-1044", supplier: "Prairie Gold Factory", pallets: 8, status: "Assigned" },
    { id: "IN-1045", supplier: "Riverbend Converting", pallets: 5, status: "Exception" }
  ],
  outboundOrders: [
    { id: "SO-8821", customer: "Cascade Foods", lines: 2, status: "Approved" },
    { id: "SO-8822", customer: "Frontier Produce", lines: 1, status: "Office Review" }
  ],
  customerOrders: [
    { id: "SO-8821", customer: "Cascade Foods", product: "Northfield 5 lb Potato Bag", quantity: 1, unit: "pallet", requestedShipDate: "Today", status: "Approved" },
    { id: "SO-8830", customer: "Cascade Foods", product: "Green Ridge 3 lb Potato Bag", quantity: 18, unit: "boxes", requestedShipDate: "Tomorrow", status: "Office Review" },
    { id: "SO-8822", customer: "Frontier Produce", product: "Valley Pack 10 lb Potato Bag", quantity: 26, unit: "boxes", requestedShipDate: "Tomorrow", status: "Office Review" },
    { id: "SO-8831", customer: "Northern Markets", product: "Summit Fresh 10 lb Potato Bag", quantity: 2, unit: "pallets", requestedShipDate: "Jul 17", status: "Requested" },
    { id: "SO-8832", customer: "Valley Co-op", product: "Blue Acre 5 lb Potato Bag", quantity: 44, unit: "boxes", requestedShipDate: "Jul 18", status: "Requested" }
  ] satisfies CustomerOrder[],
  pallets,
  bins,
  lots: [
    { id: "LOT-24-070", product: "Valley Pack 10 lb", customer: "Frontier Produce", ageDays: 67, quantity: "17 boxes + 12 bags" },
    { id: "LOT-24-091", product: "Northfield 5 lb", customer: "Cascade Foods", ageDays: 52, quantity: "3 pallets" },
    { id: "LOT-24-088", product: "Green Ridge 3 lb", customer: "Cascade Foods", ageDays: 44, quantity: "31 boxes" },
    { id: "LOT-24-108", product: "Harvest Lane 12 lb", customer: "Open Stock", ageDays: 0, quantity: "8 pallets inbound" }
  ],
  pickTasks: [
    { id: "PICK-2210", customer: "Cascade Foods", product: "Northfield 5 lb Potato Bag", quantity: 1, unit: "pallet", pickType: "Full Pallet", binId: "BIN:A-W-02-L1", palletId: "PAL:PAL-000087" }
  ] satisfies PickTask[],
  exceptions: [
    { id: "EX-001", type: "Receiving", record: "IN-1045", message: "Driver found one extra partial pallet on truck.", status: "Open" },
    { id: "EX-002", type: "Scan Error", record: "PICK-2212", message: "Bin scanned before assignment was approved.", status: "Open" }
  ]
};
