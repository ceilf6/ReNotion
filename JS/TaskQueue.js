class Manager {
    constructor() {
        this.queue = [];
        this.running = false;
        // 防止重复启动 & 保证自动启动
    }

    _tryRun() {
        if (!this.running) {
            this.running = true;
            this._next(); // 开始执行
        }
    }

    _addTask(task) {
        this.queue.push(task);
        this._tryRun();
        return this; // 还是返回该类的实例自己，从而支持链式调用
    }

    doTask() {
        // return 返回 _addTask回的this
        return this._addTask(() => {
            // DoTask
            this._next(); // DoTask后交接控制权
        });
    }

    wait(t) {
        return this._addTask(() => {
            setTimeout(() => {
                this._next(); // 休眠后在交接控制权
            }, t);
        });
    }

    _next() {
        const task = this.queue.shift(); // 出队
        if (task) {
            task();
        } else {
            this.running = false
        }
    }
}

class conManager {
    constructor(maxCnt = 1) {
        this.queue = [];
        this.running = 0;
        // 当前执行任务数量
        this.maxCnt = maxCnt;
        // 最大并发任务数
    }

    _tryRun() {
        while (this.running < this.maxCnt && this.queue.length > 0) {
            const task = this.queue.shift();
            this.running++;

            task(() => {
                this.running--;
                this._tryRun();
            })
        }
    }

    _addTask(task) {
        this.queue.push(task);
        this._tryRun();
        return this; // 还是返回该类的实例自己，从而支持链式调用
    }

    doTask() {
        // return 返回 _addTask回的this
        return this._addTask((done) => {
            // DoTask
            done(); // 并发任务队列需要显式告诉调度器何时释放槽位
        });
    }

    wait(t) {
        return this._addTask((done) => {
            setTimeout(() => {
                done();
            }, t);
        });
    }
}


// 异步JS管理版本
class asyncManager {
    constructor(maxCnt = 1) {
        this.queue = [];
        this.running = 0;
        this.maxCnt = maxCnt;
    }

    add(taskFn) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                taskFn,
                resolve,
                reject,
            })
            this._tryRun();
        });
    }

    _tryRun() {
        // 有空间、有任务
        while (this.running < this.maxCnt && this.queue.length > 0) {
            const { taskFn, resolve, reject } = this.queue.shift();
            this.running++;

            Promise.resolve().then(taskFn)
                .then(resolve)
                .catch(reject)
                .finally(() => {
                    this.running--;
                    queueMicrotask(this._tryRun()); // 通过微任务队列防止爆栈
                });
        }
    }
}