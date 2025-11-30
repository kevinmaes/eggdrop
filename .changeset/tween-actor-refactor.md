---
'eggdrop': patch
---

Refactor tweenActor to encapsulate Konva.Tween instantiation. The actor now accepts a TweenConfig object with animation parameters and creates tweens internally, following the pattern established by eggMotionActor. This eliminates redundant context storage and simplifies the API for all consuming state machines.
