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