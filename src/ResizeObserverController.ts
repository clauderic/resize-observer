import { scheduler } from './utils/scheduler.js';

import { ResizeObserver } from './ResizeObserver.js';
import { ResizeObservation } from './ResizeObservation.js';
import { ResizeObserverDetail } from './ResizeObserverDetail.js';
import { ResizeObserverCallback } from './ResizeObserverCallback.js';
import { ResizeObserverOptions } from './ResizeObserverOptions.js';

import { hasActiveObservations } from './algorithms/hasActiveObservations.js';
import { hasSkippedObservations } from './algorithms/hasSkippedObservations.js';
import { deliverResizeLoopError } from './algorithms/deliverResizeLoopError.js';
import { broadcastActiveObservations } from './algorithms/broadcastActiveObservations.js';
import { gatherActiveObservationsAtDepth } from './algorithms/gatherActiveObservationsAtDepth.js';

const resizeObservers: ResizeObserverDetail[] = [];
const observerMap = new Map();
let watching = 0;

const updateCount = (n: number): void => {
  !watching && n > 0 && scheduler.start();
  watching += n;
  !watching && scheduler.stop();
}

// Helper to find the correct ResizeObservation, based on a target.
const getObservationIndex = (observationTargets: ResizeObservation[], target: Element): number => {
  for (let i = 0; i < observationTargets.length; i+= 1) {
    if (observationTargets[i].target === target) {
      return i;
    }
  }
  return -1;
}

/**
 * Runs through the algorithms and
 * broadcasts and changes that are returned.
 */
const process = (): boolean => {
  let depth = 0;
  gatherActiveObservationsAtDepth(depth);
  while (hasActiveObservations()) {
    depth = broadcastActiveObservations();
    gatherActiveObservationsAtDepth(depth);
  }
  if (hasSkippedObservations()) {
    deliverResizeLoopError();
  }
  return depth > 0;
}

/**
 * Used as an interface for connecting resize observers.
 */
class ResizeObserverController {
  // Connects an observer to the controller.
  public static connect (resizeObserver: ResizeObserver, callback: ResizeObserverCallback): void {
    const detail = new ResizeObserverDetail(resizeObserver, callback);
    resizeObservers.push(detail);
    observerMap.set(resizeObserver, detail);
  }
  // Informs the controller to watch a new target.
  public static observe (resizeObserver: ResizeObserver, target: Element, options?: ResizeObserverOptions): void {
    if (observerMap.has(resizeObserver)) {
      const detail = observerMap.get(resizeObserver) as ResizeObserverDetail;
      if (getObservationIndex(detail.observationTargets, target) < 0) {
        detail.observationTargets.push(new ResizeObservation(target, options && options.box));
        updateCount(1);
        scheduler.schedule(); // Schedule next observation
      }
    }
  }
  // Informs the controller to stop watching a target.
  public static unobserve (resizeObserver: ResizeObserver, target: Element): void {
    if (observerMap.has(resizeObserver)) {
      const detail = observerMap.get(resizeObserver) as ResizeObserverDetail;
      const index = getObservationIndex(detail.observationTargets, target);
      if (index >= 0) {
        detail.observationTargets.splice(index, 1);
        updateCount(-1);
      }
    }
  }
  // Informs the controller to disconnect an observer.
  public static disconnect (resizeObserver: ResizeObserver): void {
    if (observerMap.has(resizeObserver)) {
      const detail = observerMap.get(resizeObserver) as ResizeObserverDetail;
      resizeObservers.splice(resizeObservers.indexOf(detail), 1);
      observerMap.delete(resizeObserver);
      updateCount(-detail.observationTargets.length);
    }
  }
}

export { ResizeObserverController, resizeObservers, process };
