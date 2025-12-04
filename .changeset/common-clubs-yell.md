---
'eggdrop': patch
---

Fix egg catching hit detection to account for rotation and improve collision detection accuracy. 

Previously, the hit detection guard calculated the egg's leading edge using a simple calculation that assumed the leading edge was always at the center Y position. Since eggs rotate as they fall, the actual lowest point changes based on rotation angle, causing some eggs to be missed.

Changes:
- Calculate the rotated bounding box in the egg actor using Konva's `getClientRect()` which accounts for rotation
- Pass the `eggBoundingBox` in the event payload for accurate hit detection
- Improve collision detection to check full bounding box overlap instead of just center point
- Extract bounding box overlap logic into a reusable pure function (`doBoundingBoxesOverlap`) with comprehensive unit tests
- Add performance optimizations with early returns for X and Y axis checks before full overlap detection
