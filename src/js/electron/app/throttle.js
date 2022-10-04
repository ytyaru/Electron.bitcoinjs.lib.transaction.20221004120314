class Throttle {
    constructor() { this._wait = 1000; this._timeoutId = 0; }
    run(func, wait=-1) {
        if (wait < 0) { wait = this._wait }
        clearTimeout(this._timeoutId);
        this._timeoutId = setTimeout(()=>func(), wait);
    }
}
