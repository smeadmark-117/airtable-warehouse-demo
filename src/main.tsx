import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  Archive,
  ArrowDownToLine,
  Boxes,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Forklift,
  MapPinned,
  PackageCheck,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingCart,
  Truck,
  UserCheck,
  UserPlus
} from "lucide-react";
import { demoData, type Assignment, type Bin, type Pallet, type PickTask } from "./seedData";
import "./styles.css";

type Tab = "office" | "driver" | "customer" | "map" | "reports" | "tags" | "sage";
type ScanState = {
  receivingPallet?: string;
  receivingBin?: string;
  outboundBin?: string;
  outboundPallet?: string;
};

type SageSampleOrder = {
  id: string;
  type: "Receiving" | "Outbound";
  partner: string;
  product: string;
  quantity: number;
  unit: "pallets" | "boxes";
  suggestedDriverId: string;
  source: string;
};

const SAMPLE_SAGE_ORDERS: SageSampleOrder[] = [
  { id: "SAGE-PO-1048", type: "Receiving", partner: "Prairie Gold Factory", product: "Harvest Lane 12 lb Potato Bag", quantity: 8, unit: "pallets", suggestedDriverId: "drv-luis", source: "Sage 100 PO Feed" },
  { id: "SAGE-SO-8825", type: "Outbound", partner: "Frontier Produce", product: "Valley Pack 10 lb Potato Bag", quantity: 26, unit: "boxes", suggestedDriverId: "drv-jamie", source: "Sage 300 Sales Order" },
  { id: "SAGE-PO-1049", type: "Receiving", partner: "Northfield Farm Packers", product: "Northfield 5 lb Potato Bag", quantity: 12, unit: "pallets", suggestedDriverId: "drv-erin", source: "Sage EDI 850" },
  { id: "SAGE-SO-8826", type: "Outbound", partner: "Northern Markets", product: "Summit Fresh 10 lb Potato Bag", quantity: 2, unit: "pallets", suggestedDriverId: "drv-luis", source: "Sage ERP Dispatch" }
];

function App() {
  const [tab, setTab] = useState<Tab>("office");
  const [selectedDriver, setSelectedDriver] = useState(demoData.drivers[0].id);
  const [selectedCustomer, setSelectedCustomer] = useState(demoData.customers[0].name);
  const [activeAssignmentId, setActiveAssignmentId] = useState("ASN-R-001");
  const [scan, setScan] = useState<ScanState>({});
  const [breakMode, setBreakMode] = useState(false);
  const [breakBoxes, setBreakBoxes] = useState(8);
  const [breakBags, setBreakBags] = useState(0);
  const [breakReason, setBreakReason] = useState("Customer requested partial box count");

  // Dynamic state for Sage imports & Driver assignments
  const [incomingOrders, setIncomingOrders] = useState(demoData.incomingOrders);
  const [outboundOrders, setOutboundOrders] = useState(demoData.outboundOrders);
  const [assignments, setAssignments] = useState<Assignment[]>(demoData.assignments);
  const [customerOrders, setCustomerOrders] = useState(demoData.customerOrders);
  const [airtableSyncLog, setAirtableSyncLog] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Connected to Airtable Base appdSedUhOfcqzMUZ. Ready for Sage Order Stream.`
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleImportSageOrder = (order: {
    id: string;
    type: "Receiving" | "Outbound";
    partner: string;
    product: string;
    quantity: number;
    unit: "pallets" | "boxes";
    driverId: string;
  }) => {
    const isReceiving = order.type === "Receiving";

    // 1. Add to work queue
    if (isReceiving) {
      setIncomingOrders((prev) => [{ id: order.id, supplier: order.partner, pallets: order.quantity, status: order.driverId ? "Assigned" : "Unassigned" }, ...prev]);
    } else {
      setOutboundOrders((prev) => [{ id: order.id, customer: order.partner, lines: 1, status: order.driverId ? "Approved" : "Office Review" }, ...prev]);
    }

    // 2. Add customer order
    setCustomerOrders((prev) => [
      { id: order.id, customer: order.partner, product: order.product, quantity: order.quantity, unit: order.unit, requestedShipDate: "Today (Sage Import)", status: order.driverId ? "Assigned" : "Pending Driver" },
      ...prev
    ]);

    // 3. Create Driver Assignment
    const newAsnId = `ASN-${isReceiving ? "R" : "S"}-${Math.floor(100 + Math.random() * 900)}`;
    const driverName = demoData.drivers.find((d) => d.id === order.driverId)?.name;
    const newAssignment: Assignment = {
      id: newAsnId,
      driverId: order.driverId || "unassigned",
      type: order.type,
      title: `${isReceiving ? "Receive" : "Ship"} ${order.partner} (${order.id})`,
      status: order.driverId ? "Assigned" : "Unassigned"
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    // 4. Log Airtable sync step
    const time = new Date().toLocaleTimeString();
    const tableTarget = isReceiving ? "Inbound Transactions" : "Outbound Transactions";
    setAirtableSyncLog((prev) => [
      `[${time}] SUCCESS: Imported ${order.id} from Sage -> Added to Airtable base appdSedUhOfcqzMUZ table "${tableTarget}" & shipping manifest. ${driverName ? `Assigned to ${driverName}.` : "Awaiting driver assignment."}`,
      ...prev
    ]);

    triggerToast(`Order ${order.id} imported from Sage! ${driverName ? `Assigned to driver ${driverName}.` : "Unassigned."}`);
  };

  const handleAssignDriver = (orderOrAsnId: string, driverId: string) => {
    const driverName = demoData.drivers.find((d) => d.id === driverId)?.name ?? "Unassigned";

    setAssignments((prev) =>
      prev.map((asn) => (asn.id === orderOrAsnId || asn.title.includes(orderOrAsnId) ? { ...asn, driverId, status: driverId !== "unassigned" ? "Assigned" : "Unassigned" } : asn))
    );
    setIncomingOrders((prev) =>
      prev.map((ord) => (ord.id === orderOrAsnId ? { ...ord, status: driverId !== "unassigned" ? "Assigned" : "Unassigned" } : ord))
    );
    setOutboundOrders((prev) =>
      prev.map((ord) => (ord.id === orderOrAsnId ? { ...ord, status: driverId !== "unassigned" ? "Approved" : "Office Review" } : ord))
    );

    const time = new Date().toLocaleTimeString();
    setAirtableSyncLog((prev) => [
      `[${time}] UPDATED: Order/Manifest ${orderOrAsnId} assigned to driver ${driverName}. Updated Airtable & driver board.`,
      ...prev
    ]);

    triggerToast(`Driver ${driverName} assigned to order ${orderOrAsnId}`);
  };

  const selectedAssignment = assignments.find((assignment) => assignment.id === activeAssignmentId) ?? assignments[0] ?? demoData.assignments[0];
  const activeDriver = demoData.drivers.find((driver) => driver.id === selectedDriver) ?? demoData.drivers[0];
  const driverAssignments = assignments.filter((assignment) => assignment.driverId === selectedDriver);

  const stats = useMemo(() => {
    const total = demoData.bins.length;
    const empty = demoData.bins.filter((bin) => bin.status === "Empty").length;
    const occupied = demoData.bins.filter((bin) => bin.status === "Occupied").length;
    const allocated = demoData.bins.filter((bin) => bin.status === "Allocated").length;
    const partial = demoData.pallets.filter((pallet) => pallet.isPartial).length;
    const openBoxes = demoData.pallets.filter((pallet) => pallet.hasOpenBox).length;
    return { total, empty, occupied, allocated, partial, openBoxes };
  }, []);

  const receivingResult = validateReceiving(scan.receivingPallet, scan.receivingBin);
  const outboundResult = validateOutbound(scan.outboundBin, scan.outboundPallet);

  return (
    <main>
      <header className="app-header">
        <div>
          <p className="eyebrow">Airtable-backed prototype • Sage ERP Integration</p>
          <h1>Warehouse Inventory Control</h1>
        </div>
        <div className="header-metrics">
          <Metric label="Bins" value={`${stats.empty}/${stats.total}`} note="empty" />
          <Metric label="Partial" value={stats.partial.toString()} note="pallets" />
          <Metric label="Open" value={stats.openBoxes.toString()} note="boxes" />
        </div>
      </header>

      {toastMessage && (
        <div className="toast-banner">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <nav className="tabs" aria-label="Demo sections">
        <TabButton active={tab === "office"} onClick={() => setTab("office")} icon={<ClipboardCheck size={18} />} label="Office" />
        <TabButton active={tab === "sage"} onClick={() => setTab("sage")} icon={<Database size={18} />} label="Sage Import" />
        <TabButton active={tab === "driver"} onClick={() => setTab("driver")} icon={<Forklift size={18} />} label="Driver Board" />
        <TabButton active={tab === "customer"} onClick={() => setTab("customer")} icon={<ShoppingCart size={18} />} label="Customer Portal" />
        <TabButton active={tab === "map"} onClick={() => setTab("map")} icon={<MapPinned size={18} />} label="Map" />
        <TabButton active={tab === "reports"} onClick={() => setTab("reports")} icon={<Archive size={18} />} label="Reports" />
        <TabButton active={tab === "tags"} onClick={() => setTab("tags")} icon={<Printer size={18} />} label="Tags" />
      </nav>

      {tab === "office" && <OfficeDashboard stats={stats} setTab={setTab} incomingOrders={incomingOrders} outboundOrders={outboundOrders} />}
      {tab === "sage" && (
        <SageImportView
          assignments={assignments}
          onImportOrder={handleImportSageOrder}
          onAssignDriver={handleAssignDriver}
          syncLog={airtableSyncLog}
          setTab={setTab}
          setSelectedDriver={setSelectedDriver}
        />
      )}
      {tab === "driver" && (
        <DriverWorkflow
          selectedDriver={selectedDriver}
          setSelectedDriver={setSelectedDriver}
          activeDriver={activeDriver}
          assignments={driverAssignments}
          selectedAssignment={selectedAssignment}
          setActiveAssignmentId={setActiveAssignmentId}
          scan={scan}
          setScan={setScan}
          receivingResult={receivingResult}
          outboundResult={outboundResult}
          breakMode={breakMode}
          setBreakMode={setBreakMode}
          breakBoxes={breakBoxes}
          setBreakBoxes={setBreakBoxes}
          breakBags={breakBags}
          setBreakBags={setBreakBags}
          breakReason={breakReason}
          setBreakReason={setBreakReason}
        />
      )}
      {tab === "customer" && <CustomerView selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} customerOrders={customerOrders} />}
      {tab === "map" && <WarehouseMap />}
      {tab === "reports" && <Reports />}
      {tab === "tags" && <PalletTags />}
    </main>
  );
}

function OfficeDashboard({
  stats,
  setTab,
  incomingOrders,
  outboundOrders
}: {
  stats: Record<string, number>;
  setTab: (tab: Tab) => void;
  incomingOrders: Array<{ id: string; supplier: string; pallets: number; status: string }>;
  outboundOrders: Array<{ id: string; customer: string; lines: number; status: string }>;
}) {
  return (
    <section className="grid two">
      <div className="panel">
        <PanelTitle icon={<Truck size={19} />} title="Work Queue & Manifests" action="Today" />
        <div className="queue">
          {incomingOrders.map((order) => (
            <QueueRow key={order.id} label={order.id} title={order.supplier} meta={`${order.pallets} pallets • ${order.status}`} tone={order.status === "Exception" ? "warn" : "good"} />
          ))}
          {outboundOrders.map((order) => (
            <QueueRow key={order.id} label={order.id} title={order.customer} meta={`${order.lines} lines • ${order.status}`} tone={order.status === "Office Review" ? "warn" : "good"} />
          ))}
        </div>
      </div>

      <div className="panel">
        <PanelTitle icon={<UserCheck size={19} />} title="Office Actions" action="Demo controls" />
        <div className="actions">
          <button onClick={() => setTab("sage")} className="primary-action-btn"><Database size={17} /> Import orders from Sage</button>
          <button onClick={() => setTab("tags")}><Printer size={17} /> Print pallet tags</button>
          <button onClick={() => setTab("driver")}><Forklift size={17} /> Open driver board</button>
          <button onClick={() => setTab("map")}><MapPinned size={17} /> Review warehouse map</button>
          <button onClick={() => setTab("reports")}><Search size={17} /> View lot reports</button>
        </div>
      </div>

      <div className="panel span">
        <PanelTitle icon={<Boxes size={19} />} title="Warehouse Space" action={`${stats.empty} empty bins`} />
        <div className="stat-grid">
          <Metric label="Total bins" value={stats.total.toString()} note="demo layout" />
          <Metric label="Occupied" value={stats.occupied.toString()} note="stored" />
          <Metric label="Allocated" value={stats.allocated.toString()} note="shipping" />
          <Metric label="Partial" value={stats.partial.toString()} note="pallets" />
          <Metric label="Open boxes" value={stats.openBoxes.toString()} note="tracked" />
        </div>
      </div>

      <div className="panel span">
        <PanelTitle icon={<AlertTriangle size={19} />} title="Exceptions Awaiting Office" action="2 open" />
        <div className="table">
          <div className="row head"><span>Type</span><span>Record</span><span>Driver note</span><span>Status</span></div>
          {demoData.exceptions.map((exception) => (
            <div className="row" key={exception.id}>
              <span>{exception.type}</span>
              <span>{exception.record}</span>
              <span>{exception.message}</span>
              <span className="pill warn">{exception.status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SageImportView(props: {
  assignments: Assignment[];
  onImportOrder: (order: {
    id: string;
    type: "Receiving" | "Outbound";
    partner: string;
    product: string;
    quantity: number;
    unit: "pallets" | "boxes";
    driverId: string;
  }) => void;
  onAssignDriver: (orderOrAsnId: string, driverId: string) => void;
  syncLog: string[];
  setTab: (tab: Tab) => void;
  setSelectedDriver: (driverId: string) => void;
}) {
  const [orderType, setOrderType] = useState<"Receiving" | "Outbound">("Receiving");
  const [orderRef, setOrderRef] = useState(`SAGE-PO-${Math.floor(1050 + Math.random() * 890)}`);
  const [partner, setPartner] = useState("Cascade Foods");
  const [product, setProduct] = useState("Northfield 5 lb Potato Bag");
  const [quantity, setQuantity] = useState(6);
  const [unit, setUnit] = useState<"pallets" | "boxes">("pallets");
  const [driverId, setDriverId] = useState(demoData.drivers[0].id);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderRef || !partner) return;
    props.onImportOrder({
      id: orderRef,
      type: orderType,
      partner,
      product,
      quantity,
      unit,
      driverId
    });
    setOrderRef(`SAGE-${orderType === "Receiving" ? "PO" : "SO"}-${Math.floor(1050 + Math.random() * 890)}`);
  };

  return (
    <section className="grid two">
      {/* 1. Quick Sage Order Stream Simulator */}
      <div className="panel">
        <PanelTitle icon={<Database size={19} />} title="Sage ERP Live Feed" action="1-Click Import" />
        <p className="notice">
          Simulated incoming orders from Sage 100/300 ERP. Importing maps the payload, syncs to Airtable, and pushes to shipping manifests.
        </p>
        <div className="sage-sample-list">
          {SAMPLE_SAGE_ORDERS.map((sample) => (
            <div className="sage-sample-card" key={sample.id}>
              <div className="sage-sample-header">
                <strong>{sample.id}</strong>
                <span className={`pill ${sample.type === "Receiving" ? "good" : "allocated"}`}>{sample.type}</span>
              </div>
              <p className="sage-sample-body">
                <strong>{sample.partner}</strong> • {sample.quantity} {sample.unit} ({sample.product})
              </p>
              <div className="sage-sample-footer">
                <small>{sample.source}</small>
                <button
                  className="secondary-btn"
                  onClick={() =>
                    props.onImportOrder({
                      id: sample.id,
                      type: sample.type,
                      partner: sample.partner,
                      product: sample.product,
                      quantity: sample.quantity,
                      unit: sample.unit,
                      driverId: sample.suggestedDriverId
                    })
                  }
                >
                  <ArrowDownToLine size={15} /> Import Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Custom Sage Order Intake */}
      <div className="panel">
        <PanelTitle icon={<Plus size={19} />} title="Create Custom Sage Order" action="Direct Intake" />
        <form onSubmit={handleCustomSubmit} className="sage-form">
          <div className="order-fields">
            <label className="field">
              Order Type
              <select value={orderType} onChange={(e) => setOrderType(e.target.value as "Receiving" | "Outbound")}>
                <option value="Receiving">Inbound PO (Receiving)</option>
                <option value="Outbound">Outbound SO (Shipping)</option>
              </select>
            </label>
            <label className="field">
              Sage Ref #
              <input value={orderRef} onChange={(e) => setOrderRef(e.target.value)} required />
            </label>
          </div>

          <div className="order-fields">
            <label className="field">
              Customer / Vendor
              <input value={partner} onChange={(e) => setPartner(e.target.value)} required />
            </label>
            <label className="field">
              Product SKU
              <select value={product} onChange={(e) => setProduct(e.target.value)}>
                <option>Northfield 5 lb Potato Bag</option>
                <option>Green Ridge 3 lb Potato Bag</option>
                <option>Valley Pack 10 lb Potato Bag</option>
                <option>Prairie Gold 12 lb Potato Bag</option>
                <option>Harvest Lane 12 lb Potato Bag</option>
                <option>Riverbend 5 lb Potato Bag</option>
                <option>Summit Fresh 10 lb Potato Bag</option>
                <option>Stone Mill 10 lb Potato Bag</option>
              </select>
            </label>
          </div>

          <div className="order-fields">
            <label className="field">
              Quantity
              <input type="number" value={quantity} min={1} onChange={(e) => setQuantity(Number(e.target.value))} />
            </label>
            <label className="field">
              Unit Type
              <select value={unit} onChange={(e) => setUnit(e.target.value as "pallets" | "boxes")}>
                <option value="pallets">Pallets</option>
                <option value="boxes">Boxes</option>
              </select>
            </label>
          </div>

          <label className="field">
            Assign Driver On Import
            <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              <option value="unassigned">-- Unassigned --</option>
              {demoData.drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="primary-action">
            <CheckCircle2 size={17} /> Import Order & Sync to Airtable
          </button>
        </form>
      </div>

      {/* 3. Driver Assignment & Manifest Spot */}
      <div className="panel span">
        <PanelTitle icon={<UserPlus size={19} />} title="Shipping Manifests & Driver Assignment Spot" action="Assign drivers as orders arrive" />
        <p className="notice">
          Assign drivers as orders arrive. Assigning a driver immediately pushes the task to that driver's iPad board in real time.
        </p>

        <div className="table sage-table">
          <div className="sage-row head">
            <span>Manifest / Order</span>
            <span>Type</span>
            <span>Title / Description</span>
            <span>Airtable Sync</span>
            <span>Assigned Driver</span>
            <span>Action</span>
          </div>
          {props.assignments.map((asn) => {
            const currentDriver = demoData.drivers.find((d) => d.id === asn.driverId);
            return (
              <div className="sage-row" key={asn.id}>
                <span>
                  <strong>{asn.id}</strong>
                </span>
                <span>
                  <span className={`pill ${asn.type === "Receiving" ? "good" : "allocated"}`}>{asn.type}</span>
                </span>
                <span>{asn.title}</span>
                <span>
                  <span className="pill good"><Check size={13} /> Synced</span>
                </span>
                <span>
                  <select
                    className="driver-select"
                    value={asn.driverId}
                    onChange={(e) => props.onAssignDriver(asn.id, e.target.value)}
                  >
                    <option value="unassigned">-- Unassigned --</option>
                    {demoData.drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </span>
                <span>
                  {currentDriver ? (
                    <button
                      className="inline-btn"
                      onClick={() => {
                        props.setSelectedDriver(currentDriver.id);
                        props.setTab("driver");
                      }}
                      title="Jump to Driver Board"
                    >
                      <Forklift size={15} /> Open Board
                    </button>
                  ) : (
                    <span className="text-muted">Unassigned</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Real-Time Airtable Sync Audit Log */}
      <div className="panel span">
        <PanelTitle icon={<RefreshCw size={19} />} title="Airtable Real-Time API Sync Log" action="Base appdSedUhOfcqzMUZ" />
        <div className="sync-log-box">
          {props.syncLog.map((log, idx) => (
            <div key={idx} className="sync-log-line">
              {log}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DriverWorkflow(props: {
  selectedDriver: string;
  setSelectedDriver: (driver: string) => void;
  activeDriver: { id: string; name: string };
  assignments: Assignment[];
  selectedAssignment: Assignment;
  setActiveAssignmentId: (id: string) => void;
  scan: ScanState;
  setScan: (scan: ScanState) => void;
  receivingResult: ValidationResult;
  outboundResult: ValidationResult;
  breakMode: boolean;
  setBreakMode: (value: boolean) => void;
  breakBoxes: number;
  setBreakBoxes: (value: number) => void;
  breakBags: number;
  setBreakBags: (value: number) => void;
  breakReason: string;
  setBreakReason: (value: string) => void;
}) {
  const receiving = props.selectedAssignment ? props.selectedAssignment.type === "Receiving" : true;
  const pickTask = demoData.pickTasks[0];
  const receivePallet = demoData.pallets.find((pallet) => pallet.id === "PAL-000105");

  return (
    <section className="grid two">
      <div className="panel">
        <PanelTitle icon={<Forklift size={19} />} title="Driver Board" action={props.activeDriver.name} />
        <label className="field">
          Driver
          <select value={props.selectedDriver} onChange={(event) => props.setSelectedDriver(event.target.value)}>
            {demoData.drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
          </select>
        </label>
        <div className="assignment-list">
          {props.assignments.length > 0 ? (
            props.assignments.map((assignment) => (
              <button
                className={assignment.id === props.selectedAssignment?.id ? "assignment active" : "assignment"}
                key={assignment.id}
                onClick={() => props.setActiveAssignmentId(assignment.id)}
              >
                <span>{assignment.type}</span>
                <strong>{assignment.title}</strong>
                <small>{assignment.status}</small>
              </button>
            ))
          ) : (
            <p className="notice">No active assignments for this driver. Assign orders in the Sage Import tab!</p>
          )}
        </div>
      </div>

      <div className="panel">
        <PanelTitle icon={receiving ? <PackageCheck size={19} /> : <Truck size={19} />} title={props.selectedAssignment?.title ?? "No Assignment Selected"} action={props.selectedAssignment?.type ?? "Idle"} />
        {receiving ? (
          <ScanWorkflow
            heading="Receiving scan order"
            steps={["Scan pallet tag", "Scan assigned bin"]}
            firstLabel="Pallet QR"
            secondLabel="Bin QR"
            firstValue={props.scan.receivingPallet ?? ""}
            secondValue={props.scan.receivingBin ?? ""}
            firstSamples={["PAL:PAL-000105", "PAL:PAL-000106"]}
            secondSamples={["BIN:B-E-03-L2", "BIN:C-W-01-L1"]}
            onFirst={(value) => props.setScan({ ...props.scan, receivingPallet: value })}
            onSecond={(value) => props.setScan({ ...props.scan, receivingBin: value })}
            result={props.receivingResult}
          />
        ) : (
          <ScanWorkflow
            heading="Outbound scan order"
            steps={["Scan bin location", "Scan pallet tag"]}
            firstLabel="Bin QR"
            secondLabel="Pallet QR"
            firstValue={props.scan.outboundBin ?? ""}
            secondValue={props.scan.outboundPallet ?? ""}
            firstSamples={["BIN:A-W-02-L1", "BIN:C-E-02-L2"]}
            secondSamples={["PAL:PAL-000087", "PAL:PAL-000044"]}
            onFirst={(value) => props.setScan({ ...props.scan, outboundBin: value })}
            onSecond={(value) => props.setScan({ ...props.scan, outboundPallet: value })}
            result={props.outboundResult}
          />
        )}
      </div>

      <div className="panel">
        <PanelTitle icon={<QrCode size={19} />} title={receiving ? "Receiving Detail" : "Pick Detail"} action="Live task" />
        {receiving && receivePallet ? <PalletDetail pallet={receivePallet} /> : <PickDetail task={pickTask} />}
      </div>

      <div className="panel">
        <PanelTitle icon={<RotateCcw size={19} />} title="Break Pallet" action={props.breakMode ? "Enabled" : "Off"} />
        <label className="toggle">
          <input type="checkbox" checked={props.breakMode} onChange={(event) => props.setBreakMode(event.target.checked)} />
          Allow partial pick entry
        </label>
        <div className={props.breakMode ? "break-box active" : "break-box"}>
          <label className="field">Boxes removed<input type="number" value={props.breakBoxes} min={0} onChange={(event) => props.setBreakBoxes(Number(event.target.value))} /></label>
          <label className="field">Bags removed<input type="number" value={props.breakBags} min={0} onChange={(event) => props.setBreakBags(Number(event.target.value))} /></label>
          <label className="field">Reason<textarea value={props.breakReason} onChange={(event) => props.setBreakReason(event.target.value)} /></label>
          <p className="notice">This creates a transaction, marks the pallet partial, and keeps the remaining quantity in the same bin.</p>
        </div>
      </div>
    </section>
  );
}

function CustomerView({
  selectedCustomer,
  setSelectedCustomer,
  customerOrders
}: {
  selectedCustomer: string;
  setSelectedCustomer: (customer: string) => void;
  customerOrders: Array<{ id: string; customer: string; product: string; quantity: number; unit: string; requestedShipDate: string; status: string }>;
}) {
  const customerPallets = demoData.pallets.filter((pallet) => pallet.customer === selectedCustomer);
  const inventory = summarizeCustomerInventory(customerPallets);
  const orders = customerOrders.filter((order) => order.customer === selectedCustomer);
  const totalPallets = customerPallets.length;
  const totalBoxes = customerPallets.reduce((sum, pallet) => sum + pallet.currentBoxes, 0);
  const partialCount = customerPallets.filter((pallet) => pallet.isPartial || pallet.hasOpenBox).length;

  return (
    <section className="grid two">
      <div className="panel">
        <PanelTitle icon={<ShoppingCart size={19} />} title="Customer Portal" action={selectedCustomer} />
        <label className="field">
          Customer
          <select value={selectedCustomer} onChange={(event) => setSelectedCustomer(event.target.value)}>
            {demoData.customers.map((customer) => <option key={customer.id} value={customer.name}>{customer.name}</option>)}
          </select>
        </label>
        <div className="stat-grid">
          <Metric label="Pallets" value={totalPallets.toString()} note="available" />
          <Metric label="Boxes" value={totalBoxes.toString()} note="full boxes" />
          <Metric label="Partial" value={partialCount.toString()} note="pallets/open" />
        </div>
      </div>

      <div className="panel">
        <PanelTitle icon={<PackageCheck size={19} />} title="Quick Order Request" action="Draft" />
        <label className="field">
          Item
          <select>
            {inventory.map((item) => <option key={item.product} value={item.product}>{item.product}</option>)}
          </select>
        </label>
        <div className="order-fields">
          <label className="field">Quantity<input type="number" defaultValue={24} min={1} /></label>
          <label className="field">Unit<select defaultValue="boxes"><option>boxes</option><option>pallets</option><option>bags</option></select></label>
        </div>
        <label className="field">Requested ship date<input type="date" defaultValue="2026-07-17" /></label>
        <button className="primary-action"><ShoppingCart size={17} /> Submit request to office queue</button>
      </div>

      <div className="panel span">
        <PanelTitle icon={<Boxes size={19} />} title="Items In Inventory" action={`${inventory.length} item groups`} />
        <div className="table customer-table">
          <div className="customer-row head"><span>Item</span><span>Pallets</span><span>Boxes</span><span>Loose bags</span><span>Oldest lot</span><span>Oldest age</span></div>
          {inventory.map((item) => (
            <div className="customer-row" key={item.product}>
              <span>{item.product}</span>
              <span>{item.pallets}</span>
              <span>{item.boxes}</span>
              <span>{item.looseBags}</span>
              <span>{item.oldestLot}</span>
              <span className={item.oldestAge > 45 ? "age hot" : "age"}>{item.oldestAge} days</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel span">
        <PanelTitle icon={<ClipboardCheck size={19} />} title="Order Queue" action="Customer visible" />
        <div className="table customer-table">
          <div className="customer-row head"><span>Order</span><span>Item</span><span>Qty</span><span>Ship date</span><span>Status</span><span>Owner</span></div>
          {orders.map((order) => (
            <div className="customer-row" key={order.id}>
              <span>{order.id}</span>
              <span>{order.product}</span>
              <span>{order.quantity} {order.unit}</span>
              <span>{order.requestedShipDate}</span>
              <span className={order.status === "Approved" || order.status === "Assigned" ? "pill good" : "pill warn"}>{order.status}</span>
              <span>{order.customer}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WarehouseMap() {
  const racks = ["A", "B", "C"];
  const [selectedBinId, setSelectedBinId] = useState("A-W-02-L1");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const selectedBin = demoData.bins.find((bin) => bin.id === selectedBinId) ?? demoData.bins[0];
  const selectedPallet = selectedBin.palletId ? demoData.pallets.find((pallet) => pallet.id === selectedBin.palletId) : undefined;

  const isDimmed = (bin: Bin) => {
    const pallet = bin.palletId ? demoData.pallets.find((item) => item.id === bin.palletId) : undefined;
    if (statusFilter !== "All" && bin.status !== statusFilter) return true;
    if (customerFilter !== "All" && pallet?.customer !== customerFilter) return true;
    return false;
  };

  return (
    <section className="map-layout">
      <div className="panel map-panel">
        <PanelTitle icon={<MapPinned size={19} />} title="Interactive Warehouse Map" action="Click any bin" />
        <div className="map-toolbar">
          <div className="legend">
            <span><i className="empty" /> Empty</span>
            <span><i className="occupied" /> Occupied</span>
            <span><i className="allocated" /> Allocated</span>
            <span><i className="partial" /> Partial/Open</span>
            <span><i className="exception" /> Exception</span>
          </div>
          <div className="map-filters">
            <label>
              Customer
              <select value={customerFilter} onChange={(event) => setCustomerFilter(event.target.value)}>
                <option>All</option>
                {demoData.customers.map((customer) => <option key={customer.id}>{customer.name}</option>)}
                <option>Open Stock</option>
              </select>
            </label>
            <label>
              Status
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All</option>
                <option>Empty</option>
                <option>Occupied</option>
                <option>Allocated</option>
                <option>Exception</option>
              </select>
            </label>
          </div>
        </div>
        <div className="warehouse-map">
          <WallShelf side="N" label="North wall shelves" selectedBinId={selectedBinId} onSelect={setSelectedBinId} isDimmed={isDimmed} />
          <div className="map-core">
            <WallShelf side="W" label="West wall" compact selectedBinId={selectedBinId} onSelect={setSelectedBinId} isDimmed={isDimmed} />
            <div className="rack-stack">
              {racks.map((rack) => (
                <DoubleSidedRack key={rack} rack={rack} selectedBinId={selectedBinId} onSelect={setSelectedBinId} isDimmed={isDimmed} />
              ))}
            </div>
            <WallShelf side="E" label="East wall" compact selectedBinId={selectedBinId} onSelect={setSelectedBinId} isDimmed={isDimmed} />
          </div>
          <WallShelf side="S" label="South wall shelves" selectedBinId={selectedBinId} onSelect={setSelectedBinId} isDimmed={isDimmed} />
          <div className="dock">Loading dock / visual staging</div>
        </div>
      </div>

      <BinDetailPanel bin={selectedBin} pallet={selectedPallet} />
    </section>
  );
}

function Reports() {
  return (
    <section className="grid two">
      <div className="panel span">
        <PanelTitle icon={<Archive size={19} />} title="Inventory By Lot" action="FIFO view" />
        <div className="table">
          <div className="row head"><span>Lot</span><span>Product</span><span>Customer</span><span>Age</span><span>Qty</span></div>
          {demoData.lots.map((lot) => (
            <div className="row" key={lot.id}>
              <span>{lot.id}</span>
              <span>{lot.product}</span>
              <span>{lot.customer}</span>
              <span className={lot.ageDays > 45 ? "age hot" : "age"}>{lot.ageDays} days</span>
              <span>{lot.quantity}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <PanelTitle icon={<Boxes size={19} />} title="Broken Pallets" action="Use carefully" />
        {demoData.pallets.filter((pallet) => pallet.isPartial || pallet.hasOpenBox).map((pallet) => <PalletDetail key={pallet.id} pallet={pallet} compact />)}
      </div>
      <div className="panel">
        <PanelTitle icon={<AlertTriangle size={19} />} title="Scan Exceptions" action="Office review" />
        {demoData.exceptions.map((exception) => (
          <div className="exception-card" key={exception.id}>
            <strong>{exception.type}</strong>
            <span>{exception.record}</span>
            <p>{exception.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PalletTags() {
  const printable = demoData.pallets.slice(0, 6);
  return (
    <section className="panel">
      <PanelTitle icon={<Printer size={19} />} title="Printable 4x4 Pallet Tags" action="QR demo" />
      <div className="tag-grid">
        {printable.map((pallet) => (
          <div className="tag" key={pallet.id}>
            <div className="fake-qr"><QrCode size={72} /></div>
            <strong>{pallet.id}</strong>
            <span>{pallet.product}</span>
            <span>{pallet.lot} • {pallet.batch}</span>
            <span>{pallet.currentBoxes} boxes • {pallet.assignedBin}</span>
            <code>PAL:{pallet.id}</code>
          </div>
        ))}
      </div>
    </section>
  );
}

type ValidationResult = { status: "idle" | "ok" | "error"; message: string };

function validateReceiving(palletQr?: string, binQr?: string): ValidationResult {
  if (!palletQr && !binQr) return { status: "idle", message: "Waiting for pallet scan." };
  if (!palletQr || !binQr) return { status: "idle", message: "Scan both pallet and bin to validate putaway." };
  if (palletQr === "PAL:PAL-000105" && binQr === "BIN:B-E-03-L2") return { status: "ok", message: "Correct pallet and assigned bin. Putaway confirmed." };
  return { status: "error", message: "Mismatch. Driver cannot override this bin in the demo; office review required." };
}

function validateOutbound(binQr?: string, palletQr?: string): ValidationResult {
  if (!binQr && !palletQr) return { status: "idle", message: "Waiting for bin scan." };
  if (!binQr || !palletQr) return { status: "idle", message: "Scan both bin and pallet to validate pick." };
  if (binQr === "BIN:A-W-02-L1" && palletQr === "PAL:PAL-000087") return { status: "ok", message: "Pick confirmed. Pallet can be loaded to outbound truck." };
  return { status: "error", message: "Wrong bin or pallet for this pick task. Stop and check assignment." };
}

function summarizeCustomerInventory(pallets: Pallet[]) {
  const grouped = new Map<string, {
    product: string;
    pallets: number;
    boxes: number;
    looseBags: number;
    oldestAge: number;
    oldestLot: string;
  }>();

  for (const pallet of pallets) {
    const current = grouped.get(pallet.product) ?? {
      product: pallet.product,
      pallets: 0,
      boxes: 0,
      looseBags: 0,
      oldestAge: -1,
      oldestLot: pallet.lot
    };

    current.pallets += 1;
    current.boxes += pallet.currentBoxes;
    current.looseBags += pallet.looseBags;
    if (pallet.ageDays > current.oldestAge) {
      current.oldestAge = pallet.ageDays;
      current.oldestLot = pallet.lot;
    }
    grouped.set(pallet.product, current);
  }

  return [...grouped.values()].sort((a, b) => b.oldestAge - a.oldestAge);
}

function ScanWorkflow(props: {
  heading: string;
  steps: string[];
  firstLabel: string;
  secondLabel: string;
  firstValue: string;
  secondValue: string;
  firstSamples: string[];
  secondSamples: string[];
  onFirst: (value: string) => void;
  onSecond: (value: string) => void;
  result: ValidationResult;
}) {
  return (
    <div className="scan-card">
      <h3>{props.heading}</h3>
      <ol>
        {props.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      <label className="field">{props.firstLabel}<input value={props.firstValue} onChange={(event) => props.onFirst(event.target.value)} /></label>
      <div className="sample-buttons">
        {props.firstSamples.map((sample) => <button key={sample} onClick={() => props.onFirst(sample)}><QrCode size={15} /> {sample}</button>)}
      </div>
      <label className="field">{props.secondLabel}<input value={props.secondValue} onChange={(event) => props.onSecond(event.target.value)} /></label>
      <div className="sample-buttons">
        {props.secondSamples.map((sample) => <button key={sample} onClick={() => props.onSecond(sample)}><QrCode size={15} /> {sample}</button>)}
      </div>
      <div className={`validation ${props.result.status}`}>
        {props.result.status === "ok" ? <Check size={18} /> : <AlertTriangle size={18} />}
        {props.result.message}
      </div>
    </div>
  );
}

function BinTile({ bin, selected, dimmed, onSelect }: { bin: Bin; selected: boolean; dimmed: boolean; onSelect: (id: string) => void }) {
  const pallet = bin.palletId ? demoData.pallets.find((item) => item.id === bin.palletId) : undefined;
  const state = pallet?.hasOpenBox ? "partial" : pallet?.isPartial ? "partial" : bin.status.toLowerCase();
  return (
    <button
      className={`bin ${state}${selected ? " selected" : ""}${dimmed ? " dimmed" : ""}`}
      title={`${bin.id} ${pallet?.product ?? "Empty"}`}
      onClick={() => onSelect(bin.id)}
    >
      <span>{bin.id}</span>
      <small>{pallet ? `${pallet.ageDays}d` : "open"}</small>
    </button>
  );
}

function DoubleSidedRack(props: { rack: string; selectedBinId: string; onSelect: (id: string) => void; isDimmed: (bin: Bin) => boolean }) {
  return (
    <div className="double-rack">
      <div className="rack-label">Row {props.rack}</div>
      <RackFace rack={props.rack} side="W" label="West face" selectedBinId={props.selectedBinId} onSelect={props.onSelect} isDimmed={props.isDimmed} />
      <div className="rack-spine">double-sided rack</div>
      <RackFace rack={props.rack} side="E" label="East face" selectedBinId={props.selectedBinId} onSelect={props.onSelect} isDimmed={props.isDimmed} />
    </div>
  );
}

function RackFace(props: { rack: string; side: string; label: string; selectedBinId: string; onSelect: (id: string) => void; isDimmed: (bin: Bin) => boolean }) {
  const { rack, side, label, selectedBinId, onSelect, isDimmed } = props;
  const bins = demoData.bins.filter((bin) => bin.rack === rack && bin.side === side);
  return (
    <div className="rack-face">
      <span>{label}</span>
      <div className="bay-track">
        {[1, 2, 3, 4].map((position) => (
          <div className="bay" key={`${rack}-${side}-${position}`}>
            {[3, 2, 1].map((level) => {
              const bin = bins.find((item) => item.position === position && item.level === level);
              return bin ? <BinTile key={bin.id} bin={bin} selected={bin.id === selectedBinId} dimmed={isDimmed(bin)} onSelect={onSelect} /> : null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function WallShelf(props: { side: string; label: string; compact?: boolean; selectedBinId: string; onSelect: (id: string) => void; isDimmed: (bin: Bin) => boolean }) {
  const { side, label, compact = false, selectedBinId, onSelect, isDimmed } = props;
  const bins = demoData.bins.filter((bin) => bin.rack === "W" && bin.side === side);
  return (
    <div className={compact ? "wall-shelf compact" : "wall-shelf"}>
      <div className="wall-label">{label}</div>
      <div className="bay-track">
        {[1, 2, 3, 4].map((position) => (
          <div className="bay" key={`W-${side}-${position}`}>
            {[3, 2, 1].map((level) => {
              const bin = bins.find((item) => item.position === position && item.level === level);
              return bin ? <BinTile key={bin.id} bin={bin} selected={bin.id === selectedBinId} dimmed={isDimmed(bin)} onSelect={onSelect} /> : null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function BinDetailPanel({ bin, pallet }: { bin: Bin; pallet?: Pallet }) {
  const statusClass = pallet?.hasOpenBox ? "partial" : pallet?.isPartial ? "partial" : bin.status.toLowerCase();
  return (
    <aside className="panel bin-detail">
      <PanelTitle icon={<Boxes size={19} />} title="Bin Detail" action={bin.id} />
      <div className={`detail-status ${statusClass}`}>
        <strong>{bin.status}</strong>
        <span>BIN:{bin.id}</span>
      </div>

      <div className="detail-grid">
        <DetailItem label="Rack" value={bin.rack === "W" ? "Wall shelf" : `Row ${bin.rack}`} />
        <DetailItem label="Face" value={bin.side} />
        <DetailItem label="Position" value={bin.position.toString()} />
        <DetailItem label="Level" value={`L${bin.level}`} />
      </div>

      {pallet ? (
        <>
          <div className="detail-section">
            <h3>Pallet</h3>
            <DetailItem label="Pallet ID" value={pallet.id} />
            <DetailItem label="QR value" value={`PAL:${pallet.id}`} />
            <DetailItem label="Product" value={pallet.product} />
            <DetailItem label="Customer" value={pallet.customer} />
            <DetailItem label="Lot" value={pallet.lot} />
            <DetailItem label="Batch" value={pallet.batch} />
          </div>

          <div className="detail-section">
            <h3>Quantity</h3>
            <DetailItem label="Full boxes" value={pallet.currentBoxes.toString()} />
            <DetailItem label="Loose bags" value={pallet.looseBags.toString()} />
            <DetailItem label="Age" value={`${pallet.ageDays} days`} strong={pallet.ageDays > 45} />
            <DetailItem label="Partial" value={pallet.isPartial ? "Yes" : "No"} />
            <DetailItem label="Open box" value={pallet.hasOpenBox ? "Yes" : "No"} />
          </div>

          <div className="detail-actions">
            <button><QrCode size={16} /> Scan bin</button>
            <button><PackageCheck size={16} /> View pallet tag</button>
          </div>
        </>
      ) : (
        <div className="empty-detail">
          <Archive size={28} />
          <strong>Empty bin</strong>
          <p>This location is available for receiving allocation.</p>
          <code>BIN:{bin.id}</code>
        </div>
      )}
    </aside>
  );
}

function DetailItem({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong className={strong ? "age hot" : ""}>{value}</strong>
    </div>
  );
}

function PalletDetail({ pallet, compact = false }: { pallet: Pallet; compact?: boolean }) {
  return (
    <div className={compact ? "pallet compact" : "pallet"}>
      <strong>{pallet.id}</strong>
      <span>{pallet.product}</span>
      <span>{pallet.lot} • {pallet.batch}</span>
      <span>{pallet.currentBoxes} full boxes • {pallet.looseBags} loose bags</span>
      <span>{pallet.assignedBin} • {pallet.ageDays} days old</span>
    </div>
  );
}

function PickDetail({ task }: { task: PickTask }) {
  return (
    <div className="pallet">
      <strong>{task.id}</strong>
      <span>{task.customer}</span>
      <span>{task.product}</span>
      <span>{task.quantity} {task.unit} • {task.pickType}</span>
      <span>{task.binId} then {task.palletId}</span>
    </div>
  );
}

function QueueRow({ label, title, meta, tone }: { label: string; title: string; meta: string; tone: "good" | "warn" }) {
  return (
    <div className="queue-row">
      <span>{label}</span>
      <strong>{title}</strong>
      <em className={`pill ${tone}`}>{meta}</em>
    </div>
  );
}

function PanelTitle({ icon, title, action }: { icon: React.ReactNode; title: string; action: string }) {
  return (
    <div className="panel-title">
      <div>{icon}<h2>{title}</h2></div>
      <span>{action}</span>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button className={active ? "active" : ""} onClick={onClick}>{icon}{label}</button>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
