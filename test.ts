let timeToSolveBlock = 185*60;
let reward = 0;
if(timeToSolveBlock >= 400*60){
    reward = 100;
}else if(timeToSolveBlock >= 180*60){
    console.log('top');
    let previousStep = 80;
    timeToSolveBlock -=180*60;
    reward = previousStep + timeToSolveBlock*0.1/60
}else if(timeToSolveBlock >= 30*60){
    console.log('mid');
    let previousStep = 3;
    timeToSolveBlock -=30*60;
    reward = previousStep + timeToSolveBlock*0.5/60
}else {
    console.log('bot');
    let previousStep = 0;
    reward = previousStep + timeToSolveBlock*0.1/60;
}
console.log(reward);
