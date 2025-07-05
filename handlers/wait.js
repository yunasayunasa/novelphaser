// src/handlers/wait.js

export function handleWait(manager, params) {
    const time = Number(params.time) || 0;
    if (time > 0) {
        manager.scene.time.delayedCall(time, () => {
            manager.next();
        });
    } else {
        manager.next();
    }
}