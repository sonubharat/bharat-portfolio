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
ready.catch(error=>postMessage({type:'error',error:String(error)}));
onmessage=event=>{
  const {id,payload}=event.data;
  queue=queue.then(async()=>{
    try{
      await ready;
      engine.globals.set('arcade_request',JSON.stringify(payload));
      const json=engine.runPython('handle(arcade_request)');
      postMessage({type:'result',id,state:JSON.parse(json)});
    }catch(error){postMessage({type:'error',id,error:String(error)});}
  });
};
