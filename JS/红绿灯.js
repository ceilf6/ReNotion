async function lights() {
    function light(c, t) {
        return new Promise((resolve) => {
            // Promise构造函数传入的是一个函数：该函数的第一个参数是resolve，第二个是reject函数
            setTimeout(() => {
                console.log(c);
                resolve();
            }, t)
        });
    }

    const ls = {
        'red': 3000,
        'yellow': 2000,
        'green': 1000,
    }

    while (true) {
        for (const [c, t] of Object.entries(ls)) {
            // 注意需要 Object.entries
            await light(c, t)
        }
    }

    // lights();
};

lights();