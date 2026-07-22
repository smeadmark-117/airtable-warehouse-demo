# Answered Project Questions

This file records the current working answers. Open customer-facing questions have been moved into `clientquestions.md`. Data the project still needs has been moved into `dataroundup.md`.

## Demo Scope

- The demo will live on a private URL on your website.
- It will use a real Airtable base with fake data.
- The audience is office staff and company finance stakeholders who need to accept the bid.
- The goal is to sell the workflow and prove that it is buildable.

## Products and Units

- Product category is potato plastic bags.
- Real product list is still needed.
- Demo bag sizes are 3 lb, 5 lb, 10 lb, and 12 lb.
- Demo full pallet assumption is 65 boxes.
- Mixed-product pallets are out of scope.
- Multiple lots or production dates on one pallet are out of scope.
- Lot number and batch tracking are required.
- FIFO matters for bringing inventory in and shipping inventory out.
- Customers usually order by product and box, but other operational units may exist.

## Warehouse Layout

- Real layout is unknown, so the demo simulates the warehouse.
- Demo layout is 3 double-sided rows, 3 shelf levels, wall shelving on all 4 walls, and a loading dock.
- Wall shelves work like main shelf bins.
- One bin holds one pallet in the demo.
- Staging exists but is not tracked as an inventory location in v1.
- No quarantine, hold, damaged, or inspection areas in the demo.
- Map should be top-down, interactive, and visually strong.
- The system will create bin and pallet QR labels.

## Receiving

- Sage details are unknown until after bid acceptance.
- Sage likely has product quantities, possibly at bag level.
- Pallet count on the Sage order should drive pallet tag printing.
- Bin assignment happens before unloading for the demo.
- Driver cannot override assigned bin in the demo.
- If the truck has extra, missing, damaged, or partial pallets, the driver flags it and the office resolves it.
- Driver cannot directly edit received quantities; office approves quantity changes.
- Office approval is required for receiving exceptions.

## Outbound Orders

- Current outbound process is paper/email handed to driver.
- Airtable form is acceptable for demo order intake.
- Customer self-service order placement would be nice later and may be shown lightly in the demo.
- Office must approve customer orders before outbound picking.
- Allocation should consider upcoming orders, not blindly consume partial pallets.
- FIFO is important.
- A management map showing relative inventory age would be valuable.
- One outbound order is assigned to one driver for the demo.
- One truck carries one customer order for the demo.

## Partial Pallets and Broken Boxes

- Partial pallets happen around 20% of the time.
- Broken boxes are allowed.
- Driver enters boxes, or bags if a box is broken.
- A break reason is required.
- Broken pallets stay in the same bin for the demo unless customer says otherwise.
- Open boxes do not need a separate label; they are tracked by quantity mismatch.

## Scanning and Hardware

- Production idea: iPad for readout, scanners for execution.
- Runtime may be iPad or Raspberry Pi later.
- Demo is online only with simulated scan buttons/inputs.
- QR codes are preferred for now.
- Tag size is 4x4.
- Tags do not need environmental durability for demo.
- Wi-Fi is assumed reliable.
- Offline mode is not required now but could be a future feature.

## Users and Permissions

- Driver dropdown is enough for demo.
- Production may need PIN, badge scan, or SSO.
- Office users need a different interface from drivers.
- Customers may eventually see availability for their own linked products.

## Airtable and Integration

- Demo uses your Airtable base first; customer can create their own later.
- Sage product/version is unknown.
- No Sage write-back is required for demo.
- Airtable is acceptable as prototype/source of truth.
- Volume concerns are not important for the demo.

## Reporting

- Demo needs item list and strong interactive map.
- Lot reports are important.
- Reporting should support lot and customer.
- Empty bins should be visible on the map with a warehouse space count.
- Broken pallet/open box report is probably needed.
- Transaction history by driver is not required for demo.
- Exception reporting for wrong scans/overrides is required.

## Hosting and Delivery

- Demo hosted on your website until bid acceptance.
- Build target is Vercel/GitHub.
- Demo data should not reset between presentations.
- Look and feel should be a polished prototype.
- Demo likely happens on desktop, but driver screens should still feel iPad-friendly.
- Internet access is assumed.

## Decisions

- Airtable-connected first.
- Vercel/GitHub hosting.
- QR for pallet and bin tags.
- Bin naming is north-to-south ascending, then east-to-west A-Z.
- Partial-pallet convention is documented in `schema.md`.
- Driver bin override is no for demo, customer question for production.
- Admin can be app pages where feasible, with Airtable forms/views where faster.

