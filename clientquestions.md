# Client Questions

Use these during client discovery. These are the questions that still need customer confirmation before production design.

## Warehouse Layout

1. What is the actual warehouse layout: rows, bays, shelf levels, wall shelves, dock doors, and staging areas?
2. Can any real bin hold more than one pallet?
3. Are there special areas for quarantine, hold, damaged product, inspection, returns, or rework?
4. Should partial pallets stay in the original bin or move to a dedicated partial-pallet area?
5. Is there a minimum partial quantity where product should be consolidated, discarded, or escalated?

## Product and Inventory Rules

1. What is the correct product list, including SKU, brand, size, bags per box, and boxes per pallet?
2. What is the correct term for the customer order unit that is not pallet, box, or bag, such as a machine-run set or ream?
3. What is the conversion between that unit and bags/boxes?
4. Do any products belong to a specific customer and need customer-level inventory separation?
5. Are lot number and batch number both required on every pallet?
6. Are production date, expiration date, or received date required for FIFO?
7. Are mixed lots ever allowed on a pallet in real operations?

## Receiving

1. What Sage product/version are they using?
2. What exact fields come from Sage for incoming orders?
3. Does Sage provide pallet count, box count, bag count, or only product quantity?
4. Who is responsible for confirming pallet count before tags print?
5. Should bins be assigned before unloading, or should drivers choose/confirm bins during putaway?
6. Can drivers override assigned bins in production?
7. What should happen when a truck arrives with extra, missing, damaged, or partial pallets?
8. Which receiving exceptions require office approval?

## Outbound

1. Who approves outbound customer orders today?
2. Should customers eventually submit orders directly?
3. Should customers see live inventory availability, projected availability, or only order forms?
4. Should the system ever split one outbound order across multiple drivers?
5. Can one truck carry multiple customer orders?
6. Should allocation optimize for FIFO, exact quantities, partial-pallet cleanup, shortest travel path, or upcoming order planning?
7. How far ahead should the system look when deciding whether to preserve a partial pallet for a future order?

## Partial Pallets and Broken Boxes

1. Are broken boxes operationally normal or should they be treated as exceptions?
2. What reasons should drivers choose from when breaking a pallet or box?
3. Should office users approve every broken pallet, or only unusual breaks?
4. Should open boxes receive any physical mark or label?
5. Do partial pallets need special cycle counts?

## Scanning and Hardware

1. Will production use iPad camera scanning, Bluetooth scanners, rugged scanners, or scanner sleds?
2. Should final labels use QR, Code 128, or both?
3. What printer model and label stock will be used?
4. Is 4x4 the right pallet tag size?
5. Do labels need to survive cold, moisture, dust, or rough handling?
6. Is Wi-Fi reliable across the whole warehouse?
7. Is offline mode required for production?

## Users and Permissions

1. Should production login use PIN, badge scan, SSO, or individual Airtable accounts?
2. Which actions require manager override?
3. Should the office be able to edit driver scan mistakes?
4. Who can approve receiving exceptions?
5. Who can approve outbound customer orders?
6. Who can adjust inventory quantities?

## Reporting

1. What reports do they need daily, weekly, and monthly?
2. Do they need reports by customer, lot, product, supplier, age, bin, or driver?
3. Do they need inventory aging alerts?
4. Do they need lot recall reports?
5. Do they need transaction history by driver for accountability?
6. Do they need exception reports for wrong scans, overrides, and quantity changes?

## Sage and Airtable

1. Should shipment status or inventory changes ever sync back to Sage?
2. If yes, exactly what fields must write back?
3. Is Airtable acceptable as the long-term source of truth, or only as a prototype/interface layer?
4. What is the expected daily volume of pallets, scans, receiving orders, and outbound orders?
5. Are there security or compliance requirements for customer inventory visibility?

