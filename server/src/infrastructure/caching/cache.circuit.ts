// cache.circuit.ts
import { EventEmitter } from "node:events";
import { FAILURE_THRESHOLD, RECOVERY_WINDOW_MS } from "./cache.constants.js";

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitMetrics {
  failures: number[];
  lastFailure: number;
  state: CircuitState;
  openedAt: number;
}

const circuit: CircuitMetrics = {
  failures: [],
  lastFailure: 0,
  state: "CLOSED",
  openedAt: 0,
};

const emitter = new EventEmitter();

export function onCircuitStateChange(handler: (state: CircuitState) => void): void {
  emitter.on("state-change", handler);
}

function setState(newState: CircuitState): void {
  if (circuit.state !== newState) {
    circuit.state = newState;
    emitter.emit("state-change", newState);
    console.info(`[cache] Circuit ${newState}`);
  }
}

function cleanupOldFailures(): void {
  const cutoff = Date.now() - RECOVERY_WINDOW_MS;
  circuit.failures = circuit.failures.filter((t) => t > cutoff);
}

export function recordSuccess(): void {
  if (circuit.state === "HALF_OPEN" || circuit.state === "OPEN") {
    setState("CLOSED");
  }
  circuit.failures = [];
  circuit.lastFailure = 0;
}

export function recordFailure(err: unknown, context: string): void {
  const now = Date.now();
  circuit.lastFailure = now;
  circuit.failures.push(now);

  cleanupOldFailures();

  console.error(`[cache] Redis error in ${context}:`, err);

  if (circuit.failures.length >= FAILURE_THRESHOLD && circuit.state === "CLOSED") {
    setState("OPEN");
    circuit.openedAt = now;
    console.warn(`[cache] Circuit OPEN after ${circuit.failures.length} failures`);
  }
}

export function isCircuitOpen(): boolean {
  if (circuit.state === "CLOSED") return false;

  const now = Date.now();

  if (circuit.state === "OPEN" && now >= circuit.openedAt + RECOVERY_WINDOW_MS) {
    setState("HALF_OPEN");
    console.info("[cache] Circuit HALF-OPEN — probing Redis");
    return false;
  }

  return circuit.state === "OPEN";
}

export function getCircuitState(): CircuitState {
  return circuit.state;
}
