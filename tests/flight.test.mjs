import assert from 'node:assert/strict';
import {createFlight,stepFlight,recoverFlight,WAYPOINTS} from '../dist/flight-model.js';
const mission={i:2,d:1227,xp:70};
let f=createFlight(mission,0,226,{seed:42});for(let i=0;i<200;i++)stepFlight(f,{w:true},1/60);assert(f.airborne&&f.y>4,'Aircraft must lift off after acceleration');
f=createFlight(mission,0,226,{seed:42});stepFlight(f,{},240);assert.equal(f.failed,'运输超时');
f=createFlight(mission,0,226,{seed:42});f.airborne=true;f.y=4;f.speed=100;f.pitch=-.3;stepFlight(f,{s:true},.1);assert(f.failed,'Unsafe contact must fail');
f=createFlight(mission,0,226,{seed:42});f.gate=8;f.airborne=true;f.z=-13600;f.y=4.1;f.speed=55;f.throttle=.35;f.pitch=-.1;stepFlight(f,{s:true},.05);assert(f.touchedDown,'Safe aligned approach must touch down');for(let i=0;i<1000&&!f.landed&&!f.failed;i++)stepFlight(f,{arrowdown:true},1/60);assert(f.landed&&!f.failed,'Safe landing must require rollout and braking');
f=createFlight(mission,0,226,{seed:42});const elapsed=f.elapsed;recoverFlight(f);assert.equal(f.elapsed,elapsed+15);assert.equal(f.y,WAYPOINTS[0].y);
// Fly the complete route using only the same digital control inputs available to a player.
f=createFlight(mission,0,226,{seed:42});for(let i=0;i<240*60&&!f.landed&&!f.failed;i++){const g=WAYPOINTS[f.gate]||{x:0,y:4,z:-13780},dx=g.x-f.x,dz=g.z-f.z,dy=g.y-f.y;const desiredYaw=Math.atan2(-dx,-dz);let delta=Math.atan2(Math.sin(desiredYaw-f.yaw),Math.cos(desiredYaw-f.yaw));const targetPitch=f.touchedDown?0:!f.airborne?.4:Math.max(-.45,Math.min(.45,Math.atan2(dy,Math.hypot(dx,dz))));const targetThrottle=f.touchedDown?0:f.gate>=7?.43:.85;const keys={a:delta>.025,d:delta<-.025,w:f.pitch<targetPitch-.012,s:f.pitch>targetPitch+.012,arrowup:f.throttle<targetThrottle-.015,arrowdown:f.throttle>targetThrottle+.015};stepFlight(f,keys,1/60);}
console.log(JSON.stringify({gate:f.gate,time:f.elapsed,landed:f.landed,failed:f.failed,position:[f.x,f.y,f.z],speed:f.speed}));assert(f.landed&&!f.failed,'Full route must be completable before deadline');console.log('PASS: takeoff, timeout, unsafe impact, safe touchdown, braking, recovery penalty, complete flight');
