# Data Roundup

Collect this data before or during the next build pass. This is the practical checklist for replacing fake demo assumptions with realistic records.

## Product Catalog

Needed fields:

- Product name
- SKU
- Brand
- Bag size
- Bags per box
- Boxes per pallet
- Default pallet bag count
- UPC if available
- Customer owner, if product is customer-specific
- Active/inactive status
- Notes

Current demo assumptions:

- Products are potato plastic bags.
- Bag sizes are 3 lb, 5 lb, 10 lb, and 12 lb.
- Full pallet assumption is 65 boxes until confirmed.
- Mixed-product pallets are not allowed.

## Order Units

Need to confirm:

- Do customers order by box, pallet, bag, SKU, weight, or another unit?
- What is the correct name for a full set of bags that goes into a production machine?
- Conversion from that unit to boxes and bags.
- Whether different customers/products use different order units.

## Lots and Batches

Needed fields:

- Lot number format
- Batch number format
- Production date, if used
- Received date
- FIFO date rule
- Supplier/factory
- Customer owner if applicable

Need sample values for:

- 5-8 realistic lots
- 2-3 batches per product if available
- Older inventory for FIFO demo

## Warehouse Layout

Needed if available:

- Actual row names
- Number of bays per row
- Number of shelf levels
- Wall shelf layout
- Dock location
- Staging location
- Any non-storage zones
- Real bin naming convention if one exists

Current demo layout:

- 3 double-sided rows
- 3 levels
- Wall shelving on all 4 walls
- Loading dock
- Staging shown visually but not tracked
- One pallet per bin
- Bin naming north-to-south ascending, then east-to-west A-Z

## Customers

Need sample records:

- Customer name
- Customer code
- Contact name
- Email
- Phone
- Products linked to customer
- Shipping notes

For demo:

- 3-5 fake customers is enough.
- At least one customer should have customer-owned inventory.

## Suppliers

Need sample records:

- Supplier/factory name
- Sage vendor ID if available
- Contact details if useful
- Receiving notes

For demo:

- 2-3 fake suppliers is enough.

## Incoming Orders

Need sample order examples:

- Sage order ID
- Supplier
- Expected arrival
- Truck/trailer ID
- Product lines
- Pallet count
- Box count
- Bag count
- Lot number
- Batch number
- Any real paper/email/Sage screenshots if available

For demo:

- 2 incoming orders.
- One clean receiving order.
- One order with an exception, such as extra partial pallet or quantity mismatch.

## Outbound Orders

Need sample order examples:

- Customer
- Requested ship date
- Product/SKU
- Quantity
- Unit
- Truck/trailer ID if available
- Current paper/email format if available

For demo:

- 2 outbound orders.
- One full pallet order.
- One partial order that breaks a pallet or box.

## Pallet Tags

Need:

- Current pallet tag layout if they have one.
- Required text on tag.
- Preferred barcode/QR format.
- Printer model.
- Label size confirmation.

Current demo assumption:

- 4x4 tag.
- QR code.
- QR values use prefixes such as `PAL:PAL-000123` and `BIN:A-W-01-L1`.

## Driver and Office Users

Need:

- Demo driver names
- Office user names if shown
- Whether manager approval should show a named approver

For demo:

- 3 fake drivers.
- Driver dropdown is enough.

## Reports

Need examples or requirements for:

- Inventory item list
- Lot report
- Customer inventory report
- Broken pallet/open box report
- Exception report
- Warehouse space count
- Inventory age/FIFO map

For demo:

- Interactive map.
- Item list.
- Lot/customer filters.
- Space count.
- Broken pallet/open box view.
- Exception view.
