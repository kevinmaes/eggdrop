import type { ActorRef } from 'xstate';

type EventCallback = (data: any) => void;

class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventCallback[]>;
  private testActor: ActorRef<any, any> | null;
  private eventQueue: Array<{ event: string; data: any }>;
  private isTestContext: boolean;

  private constructor() {
    this.listeners = new Map();
    this.testActor = null;
    this.eventQueue = [];
    this.isTestContext =
      typeof window === 'undefined' ||
      window.location.search.includes('testMode=true');
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  setTestActor(actor: ActorRef<any, any>) {
    console.log('setTestActor called', {
      hasActor: !!actor,
      isTestContext: this.isTestContext,
      currentTestActor: !!this.testActor,
    });

    if (!this.isTestContext) {
      console.warn('setTestActor called outside test context');
      return;
    }

    this.testActor = actor;

    // Process any queued events
    if (this.eventQueue.length > 0) {
      console.log('Processing queued events:', this.eventQueue.length);
      this.eventQueue.forEach(({ event, data }) => {
        console.log('Processing queued event:', event);
        this.emit(event, data);
      });
      this.eventQueue = [];
    }
  }

  registerGameActor(actorId: string, actor: ActorRef<any, any>) {
    console.log('registerGameActor', {
      actorId,
      hasActor: !!actor,
      isTestContext: this.isTestContext,
      queueLength: this.eventQueue.length,
    });
    this.emit('Register game actor', { actorId, actor });
  }

  unregisterGameActor(actorId: string) {
    this.emit('gameActorUnregistered', { actorId });
  }

  registerEggActor(actorId: string, actor: ActorRef<any, any>) {
    this.emit('Register egg actor', { actorId, actor });
  }

  unregisterEggActor(actorId: string) {
    this.emit('Egg actor unregistered', { actorId });
  }

  emit(event: string, data: any) {
    console.log('emit called', {
      event,
      hasTestActor: !!this.testActor,
      isTestContext: this.isTestContext,
      queueLength: this.eventQueue.length,
    });

    if (this.isTestContext) {
      if (this.testActor) {
        console.log('Sending to test actor:', event);
        this.testActor.send({ type: event, data });
      } else {
        console.log('Queueing event for test actor:', event);
        this.eventQueue.push({ event, data });
      }
    }

    // Always notify local listeners
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  on(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.push(callback);
    this.listeners.set(event, callbacks);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
      this.listeners.set(event, callbacks);
    }
  }

  cleanup() {
    this.testActor = null;
    this.listeners.clear();
    this.eventQueue = [];
  }
}

export const eventBus = EventBus.getInstance();
