# Airtable Schema for Warehouse Inventory Demo

## Schema Intent

This base powers a hosted demo, not a final production deployment. It should be clear enough for office staff and finance stakeholders to understand while still being structured enough to become the starting point for a real build.

The base must support:

- Real Airtable records with fake demo data.
- Incoming orders from simulated Sage data.
- Office approval and driver assignment.
- Pallet QR tag printing.
- Bin-level inventory.
- Lot and batch tracking.
- FIFO and inventory age reporting.
- Customer-owned product.
- Outbound customer orders.
- Partial pallets and broken boxes.
- Exceptions and office signoff.
- Interactive warehouse map data.

## Naming Conventions

### Bin IDs

Use north-to-south ascending, then east-to-west A-Z. Main rows are double-sided, so the bin ID includes the rack face.

Example pattern:

- `A-W-01-L1`
- `A-W-01-L2`
- `A-W-01-L3`
- `A-E-01-L1`
- `B-W-01-L1`
- `W-N-01-L1`
- `W-E-01-L1`

Where:

- Letter = shelf/row from east to west.
- `W` or `E` after the row letter = west or east face of the double-sided row.
- Number = position from north to south.
- Level = vertical shelf level.
- `W-*` = wall shelving.

### QR Values

Use explicit prefixes so the app can tell code types apart:

- `BIN:A-W-01-L1`
- `PAL:PAL-000123`
- `BREAK:PALLET`

## Tables

### Brands

Demo and real product brands.

Fields:

- `Brand Name` - Primary text
- `Active` - Checkbox
- `Notes` - Long text

Seed examples:

- Northfield
- Valley Pack
- Green Ridge
- Prairie Gold
- Riverbend
- Harvest Lane
- Summit Fresh
- Red Barn
- Blue Acre
- Stone Mill

### Customers

Customers that place outbound orders and may own specific inventory.

Fields:

- `Customer Name` - Primary text
- `Customer Code` - Text
- `Active` - Checkbox
- `Contact Name` - Text
- `Email` - Email
- `Phone` - Phone
- `Allowed Products` - Link to `Products`
- `Shipping Notes` - Long text

Views:

- `Active Customers`
- `Customer Product Access`

### Suppliers

Factories or vendors sending product into the warehouse.

Fields:

- `Supplier Name` - Primary text
- `Sage Vendor ID` - Text
- `Active` - Checkbox
- `Contact Name` - Text
- `Email` - Email
- `Phone` - Phone
- `Receiving Notes` - Long text

### Products

Product catalog. The real list will replace demo seed products later.

Fields:

- `Product Name` - Primary formula or text
- `SKU` - Text
- `Brand` - Link to `Brands`
- `Customer Owner` - Link to `Customers`, optional
- `Bag Size Lb` - Number
- `Bags Per Box` - Number
- `Boxes Per Pallet` - Number, demo default 65
- `Default Pallet Bag Count` - Formula
- `Order Unit Name` - Text, for boxes, pallets, bags, or future machine-run unit
- `Order Unit Conversion` - Number, optional
- `UPC` - Text
- `Active` - Checkbox
- `Notes` - Long text

Views:

- `Active Products`
- `Customer-Owned Products`
- `Demo Products`

### Lots

Lot and batch tracking for FIFO, reporting, and recalls.

Fields:

- `Lot ID` - Primary text
- `Product` - Link to `Products`
- `Batch Number` - Text
- `Supplier` - Link to `Suppliers`
- `Customer Owner` - Link to `Customers`, optional
- `Production Date` - Date, optional
- `Received Date` - Date
- `FIFO Date` - Date
- `Age Days` - Formula
- `Status` - Single select: `Active`, `Depleted`, `Hold`, `Exception`
- `Pallets` - Link to `Pallets`
- `Notes` - Long text

Views:

- `Active Lots`
- `Oldest Lots`
- `Lots By Customer`

### Warehouse Bins

One record per physical storage bin. One pallet per bin in the demo.

Fields:

- `Bin ID` - Primary text
- `QR Value` - Text, example `BIN:A-W-01-L1`
- `Area` - Single select: `Main Rows`, `Wall Shelves`, `Dock Visual`, `Staging Visual`
- `Rack Row` - Single select: `A`, `B`, `C`, `Wall`
- `Rack Face` - Single select: `W`, `E`, `N`, `S`
- `Position North South` - Number
- `Position East West` - Number
- `Level` - Single select: `L1`, `L2`, `L3`
- `Status` - Single select: `Empty`, `Assigned`, `Occupied`, `Allocated`, `Exception`
- `Current Pallet` - Link to `Pallets`
- `Current Product` - Lookup from pallet
- `Current Lot` - Lookup from pallet
- `Current Customer` - Lookup from pallet/product
- `Current Age Days` - Lookup from lot
- `Is Partial` - Lookup from pallet
- `Has Open Box` - Lookup from pallet
- `Map X` - Number
- `Map Y` - Number
- `Map Level` - Number
- `Pick Priority` - Number
- `Notes` - Long text

Views:

- `Warehouse Map`
- `Empty Bins`
- `Occupied Bins`
- `Partial/Open Box Bins`
- `Oldest Inventory Map`

### Drivers

Forklift drivers.

Fields:

- `Driver Name` - Primary text
- `Status` - Single select: `Active`, `Inactive`
- `PIN` - Text, future production use
- `Current Assignments` - Link to `Driver Assignments`
- `Notes` - Long text

Views:

- `Active Drivers`

### Incoming Orders

Factory orders arriving into the warehouse. These simulate Sage input for the demo.

Fields:

- `Incoming Order ID` - Primary text
- `Sage Order ID` - Text
- `Supplier` - Link to `Suppliers`
- `Expected Arrival` - Date/time
- `Actual Arrival` - Date/time
- `Truck / Trailer ID` - Text
- `Dock Door` - Text
- `Status` - Single select: `Expected`, `At Dock`, `Assigned`, `Receiving`, `Exception`, `Completed`, `Cancelled`
- `Assigned Driver` - Link to `Drivers`
- `Office Approved Exceptions` - Checkbox
- `Order Lines` - Link to `Incoming Order Lines`
- `Pallets` - Link to `Pallets`
- `Total Expected Pallets` - Rollup/count
- `Received Pallets` - Rollup/count
- `Notes` - Long text

Views:

- `Expected Arrivals`
- `At Dock`
- `Assigned Receiving`
- `Receiving Exceptions`
- `Completed Receiving`

### Incoming Order Lines

Product quantities on incoming orders.

Fields:

- `Line ID` - Primary text/formula
- `Incoming Order` - Link to `Incoming Orders`
- `Product` - Link to `Products`
- `Lot` - Link to `Lots`
- `Expected Pallets` - Number
- `Expected Boxes` - Number
- `Expected Bags` - Number
- `Boxes Per Pallet` - Number
- `Bags Per Box` - Number
- `Generated Pallets` - Link to `Pallets`
- `Line Status` - Single select: `Pending`, `Partially Received`, `Received`, `Exception`
- `Notes` - Long text

### Pallets

One record per physical pallet tag.

Fields:

- `Pallet ID` - Primary text, example `PAL-000123`
- `QR Value` - Text, example `PAL:PAL-000123`
- `Product` - Link to `Products`
- `Lot` - Link to `Lots`
- `Batch Number` - Lookup or text
- `Customer Owner` - Lookup from product/lot
- `Incoming Order` - Link to `Incoming Orders`
- `Incoming Line` - Link to `Incoming Order Lines`
- `Current Bin` - Link to `Warehouse Bins`
- `Assigned Bin` - Link to `Warehouse Bins`
- `Allocated Outbound Order` - Link to `Outbound Orders`
- `Status` - Single select: `Tag Printed`, `On Truck`, `Receiving`, `Stored`, `Allocated`, `Picking`, `Partial`, `Loaded`, `Shipped`, `Hold`, `Exception`
- `Original Boxes` - Number
- `Current Full Boxes` - Number
- `Bags Per Box` - Number
- `Loose Bags In Open Box` - Number
- `Current Total Bags` - Formula
- `Is Partial` - Formula or checkbox
- `Has Open Box` - Formula or checkbox
- `Received At` - Date/time
- `FIFO Date` - Lookup from lot or received date
- `Age Days` - Formula
- `Loaded At` - Date/time
- `Last Scanned At` - Date/time
- `Exception Notes` - Long text
- `Transactions` - Link to `Inventory Transactions`

Quantity convention:

- `Current Full Boxes` counts only unopened full boxes.
- `Loose Bags In Open Box` counts bags remaining in the single open box, if one exists.
- `Current Total Bags = (Current Full Boxes * Bags Per Box) + Loose Bags In Open Box`.
- If a box is opened, subtract that box from `Current Full Boxes` and put remaining bags in `Loose Bags In Open Box`.

Views:

- `Tags To Print`
- `Stored Inventory`
- `Allocated Pallets`
- `Broken Pallets`
- `Open Boxes`
- `Oldest Pallets`
- `Exceptions`

### Outbound Orders

Customer orders that need office approval and then picking.

Fields:

- `Outbound Order ID` - Primary text
- `Customer` - Link to `Customers`
- `Requested Ship Date` - Date/time
- `Actual Ship Date` - Date/time
- `Truck / Trailer ID` - Text
- `Dock Door` - Text
- `Status` - Single select: `Requested`, `Office Review`, `Approved`, `Allocated`, `Assigned`, `Picking`, `Loaded`, `Shipped`, `Exception`, `Cancelled`
- `Office Approved` - Checkbox
- `Approved By` - Text
- `Assigned Driver` - Link to `Drivers`
- `Order Lines` - Link to `Outbound Order Lines`
- `Pick Tasks` - Link to `Pick Tasks`
- `Notes` - Long text

Views:

- `Requested Orders`
- `Needs Office Approval`
- `Approved For Picking`
- `Assigned Shipping`
- `Loaded Orders`

### Outbound Order Lines

Products and quantities requested by customer.

Fields:

- `Line ID` - Primary text/formula
- `Outbound Order` - Link to `Outbound Orders`
- `Customer` - Lookup from outbound order
- `Product` - Link to `Products`
- `Requested Quantity` - Number
- `Requested Unit` - Single select: `Pallets`, `Boxes`, `Bags`, `Customer Unit`
- `Requested Bags Equivalent` - Formula or number
- `Allocated Pallets` - Link to `Pallets`
- `Pick Tasks` - Link to `Pick Tasks`
- `Status` - Single select: `Requested`, `Approved`, `Allocated`, `Partially Picked`, `Picked`, `Exception`
- `Notes` - Long text

### Driver Assignments

The work queue shown after the driver selects their name.

Fields:

- `Assignment ID` - Primary text
- `Driver` - Link to `Drivers`
- `Assignment Type` - Single select: `Receiving`, `Outbound`
- `Incoming Order` - Link to `Incoming Orders`
- `Outbound Order` - Link to `Outbound Orders`
- `Status` - Single select: `Assigned`, `In Progress`, `Completed`, `Paused`, `Exception`
- `Assigned At` - Date/time
- `Started At` - Date/time
- `Completed At` - Date/time
- `Priority` - Number
- `Notes` - Long text

Views:

- `Active Assignments`
- `Receiving Assignments`
- `Outbound Assignments`

### Pick Tasks

One actionable outbound instruction for a driver.

Fields:

- `Pick Task ID` - Primary text
- `Outbound Order` - Link to `Outbound Orders`
- `Outbound Line` - Link to `Outbound Order Lines`
- `Driver` - Link to `Drivers`
- `Product` - Link to `Products`
- `Lot` - Link to `Lots`
- `Bin` - Link to `Warehouse Bins`
- `Pallet` - Link to `Pallets`
- `Pick Type` - Single select: `Full Pallet`, `Partial Pallet`, `Box Pick`, `Bag Pick`
- `Quantity To Pick` - Number
- `Quantity Unit` - Single select: `Pallets`, `Boxes`, `Bags`
- `Break Required` - Checkbox
- `Break Reason` - Long text
- `Status` - Single select: `Pending`, `In Progress`, `Picked`, `Loaded`, `Exception`, `Cancelled`
- `Scanned Bin At` - Date/time
- `Scanned Pallet At` - Date/time
- `Picked At` - Date/time
- `Exception Reason` - Long text
- `Notes` - Long text

Views:

- `Pending Pick Tasks`
- `Driver Pick Tasks`
- `Partial Picks`
- `Pick Exceptions`

### Exceptions

Office review queue for scan errors, receiving oddities, quantity mismatches, and manager overrides.

Fields:

- `Exception ID` - Primary text
- `Type` - Single select: `Receiving`, `Outbound`, `Scan Error`, `Quantity Mismatch`, `Damaged`, `Extra Pallet`, `Missing Pallet`, `Override Request`
- `Status` - Single select: `Open`, `Approved`, `Rejected`, `Resolved`
- `Driver` - Link to `Drivers`
- `Incoming Order` - Link to `Incoming Orders`
- `Outbound Order` - Link to `Outbound Orders`
- `Pallet` - Link to `Pallets`
- `Bin` - Link to `Warehouse Bins`
- `Message` - Long text
- `Office Resolution` - Long text
- `Created At` - Date/time
- `Resolved At` - Date/time

Views:

- `Open Exceptions`
- `Approved Exceptions`
- `Rejected Scan Events`

### Inventory Transactions

Append-only audit log.

Fields:

- `Transaction ID` - Primary text
- `Timestamp` - Date/time
- `Type` - Single select: `Receive`, `Move`, `Allocate`, `Pick`, `Ship`, `Break Pallet`, `Break Box`, `Adjust`, `Exception`, `Override`
- `Pallet` - Link to `Pallets`
- `Product` - Link to `Products`
- `Lot` - Link to `Lots`
- `Customer` - Link to `Customers`
- `From Bin` - Link to `Warehouse Bins`
- `To Bin` - Link to `Warehouse Bins`
- `Incoming Order` - Link to `Incoming Orders`
- `Outbound Order` - Link to `Outbound Orders`
- `Driver` - Link to `Drivers`
- `Quantity Delta Boxes` - Number
- `Quantity Delta Bags` - Number
- `Before Full Boxes` - Number
- `After Full Boxes` - Number
- `Before Loose Bags` - Number
- `After Loose Bags` - Number
- `Scan Sequence` - Single select: `Pallet Then Bin`, `Bin Then Pallet`, `Manual`
- `Scanned Pallet Value` - Text
- `Scanned Bin Value` - Text
- `Result` - Single select: `Accepted`, `Rejected`, `Office Approved`, `Override`
- `Message` - Long text

Views:

- `Recent Transactions`
- `Receiving History`
- `Shipping History`
- `Break History`
- `Exceptions and Rejections`

## Seed Data Needed

Minimum useful fake data:

- 10 brands.
- 4 bag sizes.
- 12-20 products.
- 3-5 customers.
- 2-3 suppliers.
- 5-8 lots/batches.
- 3 drivers.
- Full simulated warehouse bins.
- 2 incoming orders.
- 2 outbound orders.
- A mix of full pallets, partial pallets, open boxes, and older FIFO inventory.

## Required Forms or Form-Like Screens

If Airtable form creation is available through tooling, create:

- Outbound customer order form.
- Receiving exception form.
- Office approval form/view.

If Airtable cannot create forms through the available tools, build these as app screens or create the Airtable forms manually.
