/**
 * High-accuracy countdown timer for Foreigner Pictionary rounds.
 */

export class GameTimer {
  constructor(defaultDuration = 60) {
    this.defaultDuration = defaultDuration;
    this.timeLeft = defaultDuration;
    this.isRunning = false;
    this.intervalId = null;
    this.endTime = null;
    this.callbacks = {
      tick: [],
      start: [],
      pause: [],
      reset: [],
      warning: [],
      complete: []
    };
  }

  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  trigger(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data));
    }
  }

  start() {
    if (this.isRunning) return;
    if (this.timeLeft <= 0) {
      this.reset();
    }

    this.isRunning = true;
    this.endTime = Date.now() + (this.timeLeft * 1000);
    this.trigger('start', { timeLeft: this.timeLeft });

    this.intervalId = setInterval(() => {
      const now = Date.now();
      const remainingMs = Math.max(0, this.endTime - now);
      const newTimeLeft = Math.ceil(remainingMs / 1000);

      if (newTimeLeft !== this.timeLeft) {
        this.timeLeft = newTimeLeft;
        this.trigger('tick', { timeLeft: this.timeLeft, fraction: remainingMs / (this.defaultDuration * 1000) });

        if (this.timeLeft <= 10 && this.timeLeft > 0) {
          this.trigger('warning', { timeLeft: this.timeLeft });
        }
      }

      if (remainingMs <= 0) {
        this.stop();
        this.timeLeft = 0;
        this.trigger('tick', { timeLeft: 0, fraction: 0 });
        this.trigger('complete', {});
      }
    }, 100);
  }

  pause() {
    if (!this.isRunning) return;
    this.stop();
    this.trigger('pause', { timeLeft: this.timeLeft });
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(duration = this.defaultDuration) {
    this.stop();
    this.defaultDuration = duration;
    this.timeLeft = duration;
    this.trigger('reset', { timeLeft: this.timeLeft });
    this.trigger('tick', { timeLeft: this.timeLeft, fraction: 1.0 });
  }

  getState() {
    return {
      timeLeft: this.timeLeft,
      defaultDuration: this.defaultDuration,
      isRunning: this.isRunning
    };
  }
}
