import Scheduler from './scheduler';

class Schedulers {
  private schedulers: Map<Window, Scheduler>;

  constructor() {
    this.schedulers = new Map<Window, Scheduler>();

    this.delete = this.schedulers.delete.bind(this.schedulers);
  }

  public delete: Map<Window,Scheduler>['delete'];

  public get(window: Window): Scheduler {
    let scheduler = this.schedulers.get(window);

    if (!scheduler) {
      scheduler = new Scheduler(window);
      this.schedulers.set(window, scheduler);
    }

    return scheduler;
  }
}

export default new Schedulers();
