# Airtable Warehouse Inventory Demo Plan

## Demo Goal

Build a hosted prototype for a warehouse inventory system backed by a real Airtable base using fake demo data. The demo is meant to sell the workflow to office staff and finance stakeholders while proving that the system can realistically be built.

The first version should feel like a working warehouse tool:

- Office users receive orders, approve outbound orders, assign drivers, and print pallet tags.
- Drivers use an iPad-style interface to receive and ship product by scanning pallet and bin QR codes.
- The system tracks bin-level inventory, lot/batch, FIFO age, partial pallets, broken boxes, exceptions, and empty warehouse capacity.
- The demo uses fake data now, but the structure must be ready for the customer's real product list and Sage data later.

## Decided Direction

- Demo data source: real Airtable base with fake records.
- Hosting: private URL on your website, likely Vercel/GitHub.
- Audience: office staff and company finance decision makers.
- Admin workflow: office-facing prototype pages where feasible, Airtable forms/views where faster.
- Driver workflow: iPad-friendly screens, driver selected from dropdown for demo.
- Scanning: QR for now; online demo can use scan buttons/text inputs to simulate scanner events.
- Warehouse map: interactive top-down map.
- Bin naming: north-to-south ascending, then east-to-west A-Z.
- Bin capacity: one pallet per bin for the demo.
- Driver bin override: no for the demo.
- Receiving exceptions: driver can flag oddities; office approves.
- Outbound approval: office must approve/sign off before customer order is picked.
- Inventory policy: FIFO matters, and inventory age should be visible.
- Partial pallets: common enough to demonstrate, roughly 20% of activity.
- Broken boxes: allowed and tracked by quantity mismatch.
- Customer visibility: eventually customers should see their own product availability.

## Product Assumptions

The warehouse handles potato plastic bags. For demo data, use product records with:

- Brand
- Product/SKU
- Bag size: 3 lb, 5 lb, 10 lb, 12 lb
- Bags per box
- Boxes per pallet
- Lot number
- Batch number
- Customer ownership where applicable

Mixed-product pallets are out of scope. A pallet has one product, one lot, and one batch for the demo.

Temporary assumptions until real data arrives:

- Use 65 boxes per pallet.
- Use placeholder brands and SKUs.
- Use fake lot and batch values.
- Use box-based customer ordering first, with support for pallets and bags.
- Keep a field for "reams" or machine-run units once the customer confirms the correct term and conversion.

## Warehouse Layout

The demo warehouse is simulated because the exact real layout is unknown.

Use:

- 3 double-sided shelving rows.
- 3 vertical shelf levels.
- Shelving on all 4 walls.
- Loading dock area.
- Staging area exists visually but is not tracked as inventory location in v1.

The map should be top-down and interactive. It should make the product age and inventory status easy to understand at a glance.

Map states:

- Empty
- Occupied
- Assigned for receiving
- Allocated for outbound
- Partial pallet
- Open box
- Exception
- Older/FIFO priority inventory

The demo should include a warehouse space count, for example:

- Total bins
- Empty bins
- Occupied bins
- Assigned bins
- Partial pallets
- Open boxes

## Roles

### Office User

The office user workflow is important because current operations are paper-based.

Office users should be able to:

- Review incoming orders from simulated Sage data.
- Assign receiving orders to a driver.
- Print 4x4 pallet QR tags.
- Approve receiving exceptions.
- Enter outbound customer orders through an Airtable form or app form.
- Review and approve outbound orders before picking.
- Assign outbound orders to a driver.
- View item list, lot reports, exceptions, partial pallets, open boxes, and warehouse map.

### Driver

Drivers use an iPad for readout and a scanner for execution in production. For the online demo, the interface should simulate scanning with buttons or text inputs.

Drivers should be able to:

- Select their name from a dropdown.
- View assigned receiving and outbound work.
- Follow the required scan order.
- Confirm correct pallet/bin placement.
- Flag exceptions.
- Break pallets or boxes when needed.
- Enter boxes or bags removed from a pallet.

### Customer Future View

Future customers may place orders and see availability for products linked to them. For the demo, this can be shown as a future-facing customer order form or lightweight customer view if time allows.

## Receiving Workflow

### 1. Incoming Order Arrives From Sage

In production, Sage integration is still unknown. For the demo, create fake Sage-like incoming orders in Airtable.

Assumption:

- Sage likely provides product quantities, possibly at bag level.
- The order should include or derive pallet count for pallet tag printing.

### 2. Office Assigns Driver

When the truck reaches the dock, the office assigns the incoming order to one driver.

The system assigns bins before unloading for the demo.

### 3. Office Prints Pallet Tags

The office prints one 4x4 QR tag per pallet.

Each pallet tag should show:

- Pallet ID
- Product name/SKU
- Brand
- Bag size
- Lot number
- Batch number
- Box count
- Bag count if useful
- Assigned bin
- QR code value

If a truck has extra, missing, damaged, or partial pallets, the driver flags it and the office can approve and print extra or partial pallet tags.

### 4. Driver Receives Pallets

Receiving scan order:

1. Scan pallet QR.
2. Scan bin QR.

The app validates:

- Pallet belongs to the assigned receiving order.
- Pallet has not already been stored.
- Bin is assigned to that pallet.
- Bin is empty or valid for this putaway.

For the demo, incorrect bin placement is blocked. Driver override is not included.

On success:

- Pallet status becomes `Stored`.
- Bin status becomes `Occupied`.
- Pallet receives current bin, received timestamp, lot, batch, and quantity.
- Inventory transaction is recorded.

On exception:

- Driver records an issue note.
- Pallet/order goes to office approval.
- Office resolves by adjusting quantity, printing extra tags, or marking exception.

## Outbound Workflow

### 1. Customer Order Is Entered

For the demo, the office enters outbound orders in an Airtable form or app form.

Fields:

- Customer
- Product/SKU
- Quantity
- Unit: pallet, box, bag, or future customer-specific unit
- Requested ship date
- Notes

### 2. Office Approves Order

Outbound orders do not go straight to picking. The office reviews and signs off first.

After approval, the system allocates inventory and creates pick tasks.

### 3. Allocation Logic

The allocation logic should show that the system is smarter than a simple FIFO list.

Rules for demo:

1. Respect customer-owned inventory where applicable.
2. Use FIFO as a strong default.
3. Show relative age on management reports and map.
4. Prefer exact full pallets for full-pallet orders.
5. Use partial pallets when it makes operational sense.
6. Avoid consuming a partial pallet today if it is needed for a matching order tomorrow.
7. Use old partials before they get stale.
8. Keep picks practical by location where possible.

### 4. Driver Picks Order

Outbound scan order:

1. Scan bin QR.
2. Scan pallet QR.

The app validates:

- Bin is on the pick task.
- Pallet is the expected pallet.
- Pallet is still in the bin.
- Product, lot/customer ownership, and quantity are valid.

### 5. Full Pallet Shipping

For full pallet picks:

- Pallet status becomes `Loaded` or `Shipped`.
- Bin becomes `Empty`.
- Pick task is complete.
- Inventory transaction is recorded.

### 6. Partial Pallets and Broken Boxes

If the order requires less than a full pallet, the driver uses a `Break Pallet` action or special break QR code.

The driver enters:

- Boxes removed, or
- Bags removed when a box is broken.

A reason is required when breaking a pallet or box.

The system records:

- Remaining boxes.
- Remaining loose/open-box bags.
- Pallet status as `Partial`.
- Open box state when a box quantity mismatch exists.
- Inventory transaction with before/after quantities.

Open boxes do not need separate labels for the demo. The system knows they are open through quantity mismatch.

## Required Demo Screens

### Driver Home

- Driver dropdown.
- Active receiving assignments.
- Active outbound assignments.
- Large iPad-friendly controls.

### Receiving Task

- Incoming order summary.
- Truck/trailer details.
- Pallet list.
- Product, lot, batch, and quantity details.
- Assigned bin.
- Scan pallet button/input.
- Scan bin button/input.
- Success/error confirmation.
- Exception note.
- Top-down map.

### Outbound Task

- Customer order summary.
- Office approval status.
- Pick list.
- Required bin and pallet.
- Product, lot, batch, customer ownership, and age.
- Scan bin button/input.
- Scan pallet button/input.
- Break pallet controls.
- Break reason field.
- Completion state.

### Office Dashboard

- Incoming orders.
- Outbound orders awaiting approval.
- Active driver assignments.
- Pallets/tags to print.
- Exceptions awaiting approval.
- Inventory item list.
- Lot report.
- Warehouse map.
- Space count.
- Broken pallets/open boxes.

### Warehouse Map

- Top-down interactive warehouse layout.
- 3 double-sided rows, 3 levels, wall shelving, dock.
- Filter by customer, product, lot, age, partial/open box, and empty bins.
- Tap/click bin to view contents.

## Build Phases

### Phase 1: Airtable Base and Seed Data

- Create Airtable base in your account.
- Build tables from `schema.md`.
- Seed demo brands, products, customers, lots, bins, drivers, incoming orders, pallets, outbound orders, and pick tasks.
- Add Airtable forms for outbound order entry if tool support allows it.

### Phase 2: Hosted Prototype

- Build a Vite app suitable for Vercel.
- Use server-side API routes or a backend proxy so Airtable token is never exposed in browser JavaScript.
- Connect screens to Airtable.
- Implement simulated scan buttons/inputs.
- Implement warehouse map and reporting views.

### Phase 3: Demo Polish

- Add 4x4 printable pallet tag page.
- Add realistic fake orders.
- Add management map by relative inventory age.
- Add customer-facing future order view if time allows.
- Add exception and approval flows.

## Demo Success Criteria

The demo succeeds if stakeholders can see:

- Paper-based receiving can become guided scan workflow.
- Pallet and bin QR scans prevent common mistakes.
- Office staff stays in control of approvals and exceptions.
- Inventory can be tracked by bin, product, lot, batch, customer, and age.
- FIFO and partial-pallet logic can improve picking.
- The map makes warehouse state easy to understand.
- Airtable can be the working prototype/source of truth.

