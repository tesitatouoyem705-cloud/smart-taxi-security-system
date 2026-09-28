let lat=3.848,lng=11.502;setInterval(()=>{lat+=(Math.random()-.5)*.001;lng+=(Math.random()-.5)*.001;console.log({latitude:lat,longitude:lng})},2000);
