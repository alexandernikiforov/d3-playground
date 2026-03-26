# Order Flow Specification

## What one sees on the main screen

* To the left
  * Volume profile for RTH session
  * Volume profile for the overnight session
* Center
  * The main screen with the flow chart (1m, 5m, 15m, 30m)
  * Delta (interval change, cumulative)
* To the right
  * Ticks

Everything is a grid.

## Underlying Data Model

* Range of ticks (1,0996 - 1,1028) - how many of them to display, what are their labels
* The current tick (last price, last trade)
* The range of bars
  * how many
  * labels
* RTH Volume Profile
  * Unclassified
  * At Bid
  * At Ask
* OTH Volume Profile
  * Unclassified
  * At Bid
  * At Ask
