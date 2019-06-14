import schedulers from './schedulers';
import ResizeObserver from '../ResizeObserver';

export default class ObserverWindowMap {
  private observedWindows = new Map<Window, ResizeObserver[]>();

  add(window: Window, resizeObserver: ResizeObserver) {
    let observersForWindow = this.observedWindows.get(window) || [];

    this.observedWindows.set(window, [...observersForWindow, resizeObserver]);
  }

  remove(resizeObserver: ResizeObserver) {
    this.observedWindows.forEach((observers, key) => {
      if (observers.indexOf(resizeObserver) !== -1) {
        const newObservers = observers.filter((value) => value !== resizeObserver);

        if (newObservers.length) {
          this.observedWindows.set(key, newObservers);
        } else {
          const scheduler = schedulers.get(key);

          this.observedWindows.delete(key);
          scheduler.stop();
          schedulers.delete(key);
        }
      }
    })
  }
}
