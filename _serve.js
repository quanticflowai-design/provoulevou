const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve('C:/Users/lucas/projetos/provoulevou');
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]);
  if(p==='/'||p==='') p='/login/index.html';
  if(p.endsWith('/')) p+='index.html';
  const fp=path.normalize(path.join(ROOT,p));
  if(!fp.startsWith(ROOT)){res.writeHead(403);res.end('forbidden');return;}
  fs.readFile(fp,(e,d)=>{
    if(e){res.writeHead(404);res.end('404');return;}
    res.writeHead(200,{'Content-Type':T[path.extname(fp).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(d);
  });
}).listen(8765,'127.0.0.1',()=>console.log('Dashboard local em http://localhost:8765/login/index.html'));
