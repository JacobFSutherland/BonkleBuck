import { MainController } from "./Controllers";

async function start(){
    const mc = new MainController();
    await mc.init();
    await mc.start();
}

start();