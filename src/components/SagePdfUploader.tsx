import { useState } from "react";
import {
  ArrowDownToLine,
  Bot,
  Check,
  CheckCircle2,
  Database,
  Eye,
  FileCode,
  FileText,
  FileUp,
  Forklift,
  Layers,
  Printer,
  QrCode,
  RefreshCw,
  Sparkles,
  Upload
} from "lucide-react";
import {
  SAMPLE_SAGE_PDFS,
  type AirtableUnit,
  type InboundParseResult,
  type SagePdfDocument,
  processInboundPdf
} from "../airtableService";
import { demoData } from "../seedData";

type Props = {
  onOrderImported: (result: InboundParseResult, driverId: string) => void;
  onViewTags: (units: AirtableUnit[]) => void;
  onGoToDriverBoard: (driverId: string) => void;
};

export function SagePdfUploader({ onOrderImported, onViewTags, onGoToDriverBoard }: Props) {
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [operatorName, setOperatorName] = useState("Luis Mendoza");
  const [selectedDriverId, setSelectedDriverId] = useState(demoData.drivers[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [parseResult, setParseResult] = useState<InboundParseResult | null>(null);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const steps = [
    { title: "Attaching PDF to Airtable", desc: "Uploaded to Inbound Transactions -> Document Attachments" },
    { title: "Airtable AI Data Extraction", desc: "Auto-extracting PO number, vendor, lot numbers, and line items" },
    { title: "Querying Airtable Base", desc: "Connecting to appdSedUhOfcqzMUZ and matching Units table" },
    { title: "Pulling Units from Airtable", desc: "Resolving Unit IDs, Product SKUs, Lots, and Bins from Airtable" },
    { title: "Pallet Tags Ready", desc: "4x4 QR thermal pallet tags formatted and ready to print" }
  ];

  const handleStartImport = async (doc?: SagePdfDocument, file?: File) => {
    setIsProcessing(true);
    setParseResult(null);
    setCurrentStep(1);

    const timer1 = setTimeout(() => setCurrentStep(2), 500);
    const timer2 = setTimeout(() => setCurrentStep(3), 1000);
    const timer3 = setTimeout(() => setCurrentStep(4), 1500);

    try {
      const result = await processInboundPdf({
        pdfDoc: doc,
        customFile: file || (customFile ?? undefined),
        operatorName,
        driverId: selectedDriverId
      });

      setTimeout(() => {
        setCurrentStep(5);
        setParseResult(result);
        setIsProcessing(false);
        onOrderImported(result, selectedDriverId);
      }, 1900);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsProcessing(false);
      setCurrentStep(0);
      alert("Error processing Sage PDF in Airtable: " + String(err));
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith(".pdf") || file.type.includes("pdf")) {
        setCustomFile(file);
        try {
          const blobUrl = URL.createObjectURL(file);
          setPdfBlobUrl(blobUrl);
        } catch {
          // ignore
        }
        handleStartImport(undefined, file);
      } else {
        alert("Please upload a PDF file (.pdf)");
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomFile(file);
      try {
        const blobUrl = URL.createObjectURL(file);
        setPdfBlobUrl(blobUrl);
      } catch {
        // ignore
      }
      handleStartImport(undefined, file);
    }
  };

  return (
    <div className="sage-pdf-container">
      {/* 1. Main Hero PDF Upload Drop Zone Panel */}
      <div className="panel span hero-dropzone-panel">
        <div className="panel-title">
          <div>
            <FileUp size={22} className="text-accent" />
            <div>
              <h2 style={{ margin: 0 }}>Sage PDF Inbound Ingestion & Drop Zone</h2>
              <p className="notice" style={{ margin: "2px 0 0" }}>
                Upload a Sage ERP Purchase Order PDF. Automatically attaches to Airtable's <strong>Inbound Transactions</strong> table (<code>Document Attachments</code>), triggers <strong>Airtable AI</strong> to parse invoice details, and pulls <strong>live Units</strong> back out of the Airtable base to print pallet tags.
              </p>
            </div>
          </div>
          <span className="pill good">
            <Database size={13} /> Airtable Base appdSedUhOfcqzMUZ
          </span>
        </div>

        {/* Large Prominent Drag & Drop Zone */}
        <div
          className={`hero-dropzone ${isDragging ? "dragging" : ""} ${customFile ? "has-file" : ""} ${isProcessing ? "processing" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
        >
          <input
            type="file"
            id="sage-hero-pdf-input"
            accept=".pdf,application/pdf"
            className="hidden-file-input"
            disabled={isProcessing}
            onChange={handleFileInputChange}
          />
          <label htmlFor="sage-hero-pdf-input" className="hero-dropzone-label">
            <div className="hero-dropzone-icon">
              {isProcessing ? (
                <RefreshCw size={44} className="spin text-accent" />
              ) : customFile ? (
                <FileCode size={44} className="text-success" />
              ) : (
                <Upload size={44} className="text-accent" />
              )}
            </div>

            {isProcessing ? (
              <div className="hero-dropzone-text">
                <h3>Processing PDF in Airtable AI...</h3>
                <p>Uploading to Document Attachments and pulling live Units from Airtable base</p>
              </div>
            ) : customFile ? (
              <div className="hero-dropzone-text">
                <h3>{customFile.name}</h3>
                <p>{(customFile.size / 1024).toFixed(1)} KB • Attached to Airtable Inbound Transactions</p>
                <span className="pill good">Drop new PDF or click to replace</span>
              </div>
            ) : (
              <div className="hero-dropzone-text">
                <h3>Drag & Drop Sage PO / Inbound Manifest PDF here</h3>
                <p>or click to browse files from your computer (.pdf)</p>
                <div className="hero-dropzone-cta">
                  <span className="cta-button"><FileText size={16} /> Select PDF Document</span>
                </div>
              </div>
            )}
          </label>

          {/* Quick 1-Click Sample PDF Chips */}
          <div className="sample-chips-bar" onClick={(e) => e.stopPropagation()}>
            <span className="sample-chips-label">
              <Sparkles size={14} /> Quick Demo Samples:
            </span>
            {SAMPLE_SAGE_PDFS.map((doc) => (
              <button
                key={doc.id}
                type="button"
                className="sample-chip-btn"
                disabled={isProcessing}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCustomFile(null);
                  handleStartImport(doc);
                }}
              >
                <FileText size={13} />
                <strong>{doc.poNumber}</strong>
                <span>({doc.vendorName.split(" ")[0]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Operator & Driver Controls */}
        <div className="dropzone-options-bar">
          <div className="options-group">
            <label className="inline-field">
              <span>Receiving Operator:</span>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Operator name"
                disabled={isProcessing}
              />
            </label>
            <label className="inline-field">
              <span>Assign Driver:</span>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                disabled={isProcessing}
              >
                {demoData.drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <small className="text-muted">
            Uploaded PDFs sync instantly with Airtable Base <code>appdSedUhOfcqzMUZ</code> table <code>Inbound Transactions</code>.
          </small>
        </div>
      </div>

      {/* 2. Processing Pipeline Steps Animation */}
      {isProcessing && (
        <div className="panel span pipeline-panel">
          <div className="panel-title">
            <div>
              <Bot size={19} className="text-accent" />
              <h2>Airtable AI Extraction Pipeline Running</h2>
            </div>
            <span className="pill warn">Live Processing</span>
          </div>
          <div className="pipeline-steps">
            {steps.map((step, idx) => {
              const stepNum = idx + 1;
              const isDone = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              return (
                <div
                  key={idx}
                  className={`pipeline-step ${isDone ? "done" : isCurrent ? "current" : "pending"}`}
                >
                  <div className="step-circle">
                    {isDone ? <Check size={14} /> : isCurrent ? <RefreshCw size={14} className="spin" /> : stepNum}
                  </div>
                  <div className="step-info">
                    <strong>{step.title}</strong>
                    <small>{step.desc}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Parsed Output & Units Pulled Back Out of Airtable Base */}
      {parseResult && !isProcessing && (
        <div className="panel span parsed-results-panel">
          <div className="panel-title">
            <div>
              <CheckCircle2 size={22} className="text-success" />
              <div>
                <h2 style={{ margin: 0 }}>
                  Airtable Ingestion Complete: {parseResult.poNumber}
                </h2>
                <small className="text-muted">
                  Attached to Airtable table <strong>Inbound Transactions</strong> (Record: <code>{parseResult.transactionRecordId}</code>) • AI Parsed & Live Units Pulled
                </small>
              </div>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowDocPreview(!showDocPreview)}
              >
                <Eye size={15} /> {showDocPreview ? "Hide Document" : "View PDF Document"}
              </button>
              <button
                type="button"
                className="primary-action-btn"
                onClick={() => setShowTagModal(true)}
              >
                <Printer size={16} /> Print Pallet Tags ({parseResult.pulledUnits.length})
              </button>
            </div>
          </div>

          {/* AI Notes and Record Attachment Info */}
          <div className="ai-summary-card">
            <div className="ai-summary-header">
              <div className="ai-badge">
                <Bot size={16} />
                <strong>Airtable AI Summary (Field: Inbound Notes)</strong>
              </div>
              <span className="attachment-chip">
                <FileText size={13} /> {parseResult.fileName} ({parseResult.fileSize})
                {parseResult.attachmentId && (
                  <span className="pill good">Airtable Attachment: {parseResult.attachmentId}</span>
                )}
              </span>
            </div>
            <p className="ai-summary-text">{parseResult.aiSummary}</p>
            <div className="ai-meta-row">
              <span><strong>Vendor:</strong> {parseResult.vendorName}</span>
              <span><strong>Date Received:</strong> {parseResult.dateReceived}</span>
              <span><strong>Operator:</strong> {parseResult.receivingOperator}</span>
              <span><strong>Airtable Base:</strong> appdSedUhOfcqzMUZ</span>
              <span><strong>Synced At:</strong> {parseResult.syncedAt}</span>
            </div>
          </div>

          {/* Optional PDF Document Viewer */}
          {showDocPreview && (
            <div className="pdf-doc-preview">
              <div className="doc-preview-header">
                <div>
                  <h3>SAGE ERP PURCHASE ORDER & RECEIVING MANIFEST</h3>
                  <p>Electronic Data Interchange (EDI) / Scanned PO Document</p>
                </div>
                <div className="doc-preview-meta">
                  <span><strong>PO #:</strong> {parseResult.poNumber}</span>
                  <span><strong>DATE:</strong> {parseResult.dateReceived}</span>
                  <span><strong>STATUS:</strong> ATTACHED TO AIRTABLE</span>
                </div>
              </div>

              {pdfBlobUrl && (
                <div className="pdf-actual-preview">
                  <div className="pdf-preview-header">
                    <FileText size={15} />
                    <strong>Uploaded File: {parseResult.fileName} ({parseResult.fileSize})</strong>
                  </div>
                  <iframe
                    src={pdfBlobUrl}
                    title="Uploaded Sage PO PDF"
                    className="pdf-iframe-preview"
                  />
                </div>
              )}

              <div className="doc-preview-body">
                <div className="doc-party-grid">
                  <div>
                    <strong>SHIP TO WAREHOUSE:</strong>
                    <p>Main Cold Storage & Bag Distribution Facility<br />Dock Receiving Bay #1-3<br />Grand Island, NE</p>
                  </div>
                  <div>
                    <strong>VENDOR / PACKER:</strong>
                    <p>{parseResult.vendorName}<br />Sage Vendor EDI Partner<br />Authorized Packaging Facility</p>
                  </div>
                </div>
                <table className="doc-line-table">
                  <thead>
                    <tr>
                      <th>Unit ID (Airtable)</th>
                      <th>Product / Description</th>
                      <th>Lot #</th>
                      <th>Assigned Bin</th>
                      <th>Quantity</th>
                      <th>QR Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseResult.pulledUnits.map((u) => (
                      <tr key={u.recordId}>
                        <td><strong>{u.unitId}</strong></td>
                        <td>{u.productName} ({u.productSku})</td>
                        <td>{u.lotNumber}</td>
                        <td><span className="pill good">{u.binId}</span></td>
                        <td>{u.quantity} {u.unitType}</td>
                        <td><code>PAL:{u.unitId}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Live Units Pulled Back Out of Airtable Base */}
          <div className="pulled-units-section">
            <div className="section-header-row">
              <div>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Layers size={18} className="text-accent" />
                  Units Pulled Back Out of Airtable Base ({parseResult.pulledUnits.length} Units)
                </h3>
                <small className="notice">
                  Real records retrieved from Airtable's <code>Units</code> table, joined with <code>Products</code>, <code>Lots</code>, and <code>Bins</code>.
                </small>
              </div>
              <div className="unit-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => onViewTags(parseResult.pulledUnits)}
                >
                  <Printer size={15} /> Open in Tags Tab
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => onGoToDriverBoard(selectedDriverId)}
                >
                  <Forklift size={15} /> Dispatch to Driver Board
                </button>
              </div>
            </div>

            <div className="pulled-units-grid">
              {parseResult.pulledUnits.map((unit) => (
                <div className="airtable-unit-card" key={unit.recordId}>
                  <div className="unit-card-header">
                    <div className="unit-id-badge">
                      <QrCode size={16} />
                      <strong>{unit.unitId}</strong>
                    </div>
                    <span className="pill good">Airtable: {unit.recordId}</span>
                  </div>

                  <div className="unit-card-product">
                    <strong>{unit.productName}</strong>
                    <span className="sku-badge">SKU: {unit.productSku}</span>
                  </div>

                  <div className="unit-card-details">
                    <div className="unit-detail-item">
                      <span>Lot Number:</span>
                      <strong>{unit.lotNumber}</strong>
                    </div>
                    <div className="unit-detail-item">
                      <span>MFG Date:</span>
                      <span>{unit.mfgDate || "2024-01-01"}</span>
                    </div>
                    <div className="unit-detail-item">
                      <span>Assigned Bin:</span>
                      <strong className="text-accent">{unit.binId} ({unit.binZone})</strong>
                    </div>
                    <div className="unit-detail-item">
                      <span>Quantity:</span>
                      <strong>{unit.quantity} {unit.unitType}</strong>
                    </div>
                  </div>

                  <div className="unit-card-footer">
                    <div className="qr-preview-chip">
                      <QrCode size={14} />
                      <span>PAL:{unit.unitId}</span>
                    </div>
                    <button
                      type="button"
                      className="print-single-tag-btn"
                      onClick={() => {
                        onViewTags([unit]);
                        setShowTagModal(true);
                      }}
                      title="Print Tag for this unit"
                    >
                      <Printer size={13} /> Print Tag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Pallet Tag Print Modal */}
      {showTagModal && parseResult && (
        <div className="modal-backdrop" onClick={() => setShowTagModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Printer size={20} />
                  Printable 4x4 QR Pallet Tags ({parseResult.poNumber})
                </h3>
                <small className="notice">
                  Airtable Base: appdSedUhOfcqzMUZ • Units pulled from Sage PO PDF
                </small>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="primary-action-btn"
                  onClick={() => window.print()}
                >
                  <Printer size={16} /> Print All Tags Now
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowTagModal(false)}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="modal-tag-grid print-area">
              {parseResult.pulledUnits.map((pallet) => (
                <div className="tag printable-pallet-tag" key={pallet.recordId}>
                  <div className="tag-header-row">
                    <span className="tag-company">WAREHOUSE INVENTORY CONTROL</span>
                    <span className="tag-po">PO: {parseResult.poNumber}</span>
                  </div>
                  <div className="fake-qr">
                    <QrCode size={80} />
                  </div>
                  <strong className="tag-unit-id">{pallet.unitId}</strong>
                  <span className="tag-product">{pallet.productName}</span>
                  <span className="tag-sku">SKU: {pallet.productSku}</span>
                  <div className="tag-meta-grid">
                    <div>
                      <small>LOT #</small>
                      <strong>{pallet.lotNumber}</strong>
                    </div>
                    <div>
                      <small>MFG DATE</small>
                      <span>{pallet.mfgDate || "2024-01-01"}</span>
                    </div>
                    <div>
                      <small>QTY</small>
                      <strong>{pallet.quantity} {pallet.unitType}</strong>
                    </div>
                    <div>
                      <small>ASSIGNED BIN</small>
                      <strong className="tag-bin">{pallet.binId}</strong>
                    </div>
                  </div>
                  <div className="tag-footer-row">
                    <code>PAL:{pallet.unitId}</code>
                    <code>BIN:{pallet.binId}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
