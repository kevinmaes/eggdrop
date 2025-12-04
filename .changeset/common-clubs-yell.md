---
"eggdrop": patch
---

Fix egg catching hit detection to account for rotation. Previously, the hit detection guard calculated the egg's leading edge using a simple calculation that assumed the leading edge was always at the center Y position. Since eggs rotate as they fall, the actual lowest point changes based on rotation angle, causing some eggs to be missed. This fix calculates the rotated bounding box using Konva's `getClientRect()` and uses it for accurate hit detection.
