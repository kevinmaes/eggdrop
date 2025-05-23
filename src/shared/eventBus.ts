import type { ActorRef } from 'xstate';

type EventCallback = (data: any) => void;

class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventCallback[]>;
  private testActor: ActorRef<any, any> | null;
  private eventQueue: Array<{ event: string; data: any }>;

  private constructor() {
    this.listeners = new Map();
    this.testActor = null;
    this.eventQueue = [];
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  setTestActor(actor: ActorRef<any, any>) {
    this.testActor = actor;
    // Process any queued events
    this.eventQueue.forEach(({ event, data }) => {
      this.emit(event, data);
    });
    this.eventQueue = [];
  }

  registerGameActor(actorId: string, actor: ActorRef<any, any>) {
    this.emit('gameActorRegistered', { actorId, actor });
  }

  unregisterGameActor(actorId: string) {
    this.emit('gameActorUnregistered', { actorId });
  }

  emit(event: string, data: any) {
    // If we have a test actor, send the event to it
    if (this.testActor) {
      this.testActor.send({ type: event, data });
    } else {
      // Queue the event if test actor isn't ready
      this.eventQueue.push({ event, data });
    }

    // Also notify any local listeners
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
