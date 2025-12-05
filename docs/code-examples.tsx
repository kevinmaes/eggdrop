// Examples of an XState event

// Event
const event = {
  type: 'Set hen ref',
  henRef: React.RefObject<Konva.Image>
}
        
// Ref stored in context
const context: {
  henRef: React.RefObject<Konva.Image> 
}

// Register the event on a state of the machine
on: { 
'Set hen ref': assign({
  henRef: ({ event }) => event.henRef,
  })
}

// Define action implementations in setup()
// with parameterized actions

// Action implementation to assign ref to context
actions: {
  setHenRef: assign({
    henRef: ({ event }) => event.henRef,
  })
}

// Register the event on a state of the machine
on: { 
'Set hen ref': {
  actions: {
    type: 'setHenRef',
  	params: ({ event }) => event.henRef
  }
}

// Action implementation assigning the typed ref to context
actions: {
  henRef: (_context, params: React.RefObject<Konva.Image>) => params,    
}


// Provider

// app-machine.ts
// Create your app machine
const appMachine = createMachine({
  id: 'App',
  initial: 'Loading',
  states: {
  	Loading: {},
    Intro: {},
    Playing: {},
    Leaderboard: {},
    End: {}
  }
});

// Create a global context for the entire actor system
export const AppActorContext = createActorContext(appMachine);



// main.tsx
// In JSX, wrap your <App /> with AppActorContext
<AppActorContext.Provider
  options={{ input: { gameConfig } }}
>
  <App />
</AppActorContext.Provider>


// App useSelector
const { gameConfig, currentGameLevel, gameScoreData } =
    AppActorContext.useSelector((state) => ({
      gameConfig: state.context.gameConfig,
      currentGameLevel: state.context.currentGameLevel,
      gameScoreData: state.context.gameScoreData,
    }));



  // Actor ref type exported from chef-machine.ts`
export type ChefActorRef = ActorRefFrom<typeof chefMachine>;

// Component selects chefActorRef from the app actor
const chefActorRef = AppActorContext.useSelector((state) => {
  return {
    chefActorRef: state.context.chefActorRef as ChefActorRef
  }
});


// Actor ref type exported from chef-machine.ts
export type ChefActorRef = ActorRefFrom<typeof chefMachine>;


// Chef.tsx
// Component selects chefActorRef from appActorRef by system id
const appActorRef = AppActorContext.useActorRef();
const chefActorRef = appActorRef.system.get('Chef') as ChefActorRef;


// Select or derive values from chefActorRef in Chef.tsx
const { lastMovingDirection, ...currentMovement  } = useSelector(
  chefActorRef,
  (state) => ({
    lastMovingDirection: state?.context.lastDirection ?? 'none',
    isMovingRight: state?.matches('Moving Right'),
    isMovingLeft: state?.matches('Moving Left'),
    isMoving: state?.hasTag('moving'),
  })
);


<Stage
  width={gameConfig.stage.width}
  height={gameConfig.stage.height}
  style={{
    borderRadius: `${getBorderRadius()}px`,
    overflow: 'hidden',
  }}
>
  {/* Static background layer */}
  <Layer listening={false}></Layer>
  {/* Game Play layer */}
  <Layer></Layer>
  {/* Interactive UI layer */}
  <Layer></Layer>
</Stage>


const [image] = useImage('images/chef.sprite.png');

return (
  <Stage>
    <Layer>
      <Group>
        <Rect width={100} height={100} fill="red" />
        <Image image={image}/>
      </Group>
    </Layer>
  </Stage>
);