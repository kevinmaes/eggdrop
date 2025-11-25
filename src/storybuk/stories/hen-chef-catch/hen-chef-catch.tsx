import { useState } from 'react';

import { useSelector } from '@xstate/react';
import { Group } from 'react-konva';

import { Chef } from './chef';
import { Egg } from './egg';
import { Hen } from './hen';
import type { henChefCatchMachine } from './hen-chef-catch.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Hen-Chef-Catch Orchestrator Component
 *
 * Renders all child actors spawned by the orchestrator:
 * - Hen (stationary, laying eggs)
 * - Chef (stationary, catching eggs)
 * - Eggs (falling with rotation)
 *
 * Demonstrates coordinated multi-actor rendering.
 */

export function HenChefCatch({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof henChefCatchMachine>;
}) {
  const { henActorRef, chefActorRef, eggActorRefs } = useSelector(
    actorRef,
    (state) => ({
      henActorRef: state?.context.henActorRef ?? null,
      chefActorRef: state?.context.chefActorRef ?? null,
      eggActorRefs: state?.context.eggActorRefs ?? [],
    })
  );

  // Track eggs with stable keys for React rendering
  const [eggKeys] = useState(() => new Map<string, string>());

  return (
    <Group>
      {/* Render hen */}
      {henActorRef && <Hen actorRef={henActorRef} />}

      {/* Render chef */}
      {chefActorRef && <Chef actorRef={chefActorRef} />}

      {/* Render all spawned eggs */}
      {eggActorRefs.map((eggRef) => {
        const eggId = eggRef.getSnapshot().context.id;
        // Ensure stable key for each egg
        if (!eggKeys.has(eggId)) {
          eggKeys.set(eggId, eggId);
        }
        return <Egg key={eggKeys.get(eggId)} actorRef={eggRef} />;
      })}
    </Group>
  );
}
