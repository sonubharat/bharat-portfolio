/* Locally hosted Pyodide 0.27.7. All gameplay runs in this worker. */
let engine;
let queue=Promise.resolve();
async function boot(){
  importScripts('/python/pyodide.js');
  engine=await loadPyodide({indexURL:'/python/'});
  const response=await fetch('/python/games.py');
  if(!response.ok)throw new Error('Game rules could not be loaded.');
  await engine.runPythonAsync(await response.text());
  postMessage({type:'ready'});
}
const ready=boot();
ready.catch(()=>postMessage({type:'error',error:'The games could not start. Please retry.'}));
let pending=0;
onmessage=event=>{
  const data=event.data;
  if(!data||!Number.isSafeInteger(data.id)||data.id<1||!data.payload||typeof data.payload!=='object'||Array.isArray(data.payload))return;
  const {id,payload}=data;
  if(pending>=8){postMessage({type:'error',id,error:'Please wait for the current move.'});return;}
  pending++;
  queue=queue.then(async()=>{
    try{
      await ready;
      engine.globals.set('arcade_request',JSON.stringify(payload));
      const json=engine.runPython('handle(arcade_request)');
      postMessage({type:'result',id,state:JSON.parse(json)});
    }catch{postMessage({type:'error',id,error:'That move could not be completed. Please retry.'});}finally{pending--;}
  });
};
