var ca=Object.defineProperty;var ha=(e,t,a)=>t in e?ca(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var tt=(e,t,a)=>ha(e,typeof t!="symbol"?t+"":t,a);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const X of r.addedNodes)X.tagName==="LINK"&&X.rel==="modulepreload"&&n(X)}).observe(document,{childList:!0,subtree:!0});function a(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=a(i);fetch(i.href,r)}})();var Ne={exports:{}},ua=Ne.exports,$t;function Ra(){return $t||($t=1,function(e,t){(function(a,n){e.exports=n()})(ua,function(){var a=function(){function n(S){return X.appendChild(S.dom),S}function i(S){for(var Y=0;Y<X.children.length;Y++)X.children[Y].style.display=Y===S?"block":"none";r=S}var r=0,X=document.createElement("div");X.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000",X.addEventListener("click",function(S){S.preventDefault(),i(++r%X.children.length)},!1);var h=(performance||Date).now(),c=h,u=0,y=n(new a.Panel("FPS","#0ff","#002")),$=n(new a.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var _=n(new a.Panel("MB","#f08","#201"));return i(0),{REVISION:16,dom:X,addPanel:n,showPanel:i,begin:function(){h=(performance||Date).now()},end:function(){u++;var S=(performance||Date).now();if($.update(S-h,200),S>c+1e3&&(y.update(1e3*u/(S-c),100),c=S,u=0,_)){var Y=performance.memory;_.update(Y.usedJSHeapSize/1048576,Y.jsHeapSizeLimit/1048576)}return S},update:function(){h=this.end()},domElement:X,setMode:i}};return a.Panel=function(n,i,r){var X=1/0,h=0,c=Math.round,u=c(window.devicePixelRatio||1),y=80*u,$=48*u,_=3*u,S=2*u,Y=3*u,E=15*u,k=74*u,D=30*u,C=document.createElement("canvas");C.width=y,C.height=$,C.style.cssText="width:80px;height:48px";var O=C.getContext("2d");return O.font="bold "+9*u+"px Helvetica,Arial,sans-serif",O.textBaseline="top",O.fillStyle=r,O.fillRect(0,0,y,$),O.fillStyle=i,O.fillText(n,_,S),O.fillRect(Y,E,k,D),O.fillStyle=r,O.globalAlpha=.9,O.fillRect(Y,E,k,D),{dom:C,update:function(J,H){X=Math.min(X,J),h=Math.max(h,J),O.fillStyle=r,O.globalAlpha=1,O.fillRect(0,0,y,E),O.fillStyle=i,O.fillText(c(J)+" "+n+" ("+c(X)+"-"+c(h)+")",_,S),O.drawImage(C,Y+u,E,k-u,D,Y,E,k-u,D),O.fillRect(Y+k-u,E,u,D),O.fillStyle=r,O.globalAlpha=.9,O.fillRect(Y+k-u,E,u,c((1-J/H)*D))}}},a})}(Ne)),Ne.exports}Ra();const ot=(e,t="log")=>{t==="error"?console&&typeof console.error=="function"&&console.error(e):console&&typeof console.info=="function"&&console.info(e)},le=e=>ot(e,"error"),fa=()=>navigator.getGamepads&&typeof navigator.getGamepads=="function"||navigator.getGamepads&&typeof navigator.webkitGetGamepads=="function"||!1,ve=()=>({action:()=>{},after:()=>{},before:()=>{}}),ie={ON:"Gamepad detected.",OFF:"Gamepad disconnected.",INVALID_PROPERTY:"Invalid property.",INVALID_VALUE_NUMBER:"Invalid value. It must be a number between 0.00 and 1.00.",INVALID_BUTTON:"Button does not exist.",UNKNOWN_EVENT:"Unknown event name.",NO_SUPPORT:"Your web browser does not support the Gamepad API."},pa={init:function(e){let t={id:e.index,buttons:e.buttons.length,axes:Math.floor(e.axes.length/2),axeValues:[],axeThreshold:[1],hapticActuator:null,vibrationMode:-1,vibration:!1,mapping:e.mapping,buttonActions:{},axesActions:{},pressed:{},set:function(a,n){if(["axeThreshold"].indexOf(a)>=0){if(a==="axeThreshold"&&(!parseFloat(n)||n<0||n>1)){le(ie.INVALID_VALUE_NUMBER);return}this[a]=n}else le(ie.INVALID_PROPERTY)},vibrate:function(a=.75,n=500){if(this.hapticActuator)switch(this.vibrationMode){case 0:return this.hapticActuator.pulse(a,n);case 1:return this.hapticActuator.playEffect("dual-rumble",{duration:n,strongMagnitude:a,weakMagnitude:a})}},triggerDirectionalAction:function(a,n,i,r,X){i&&r%2===X?(this.pressed[`${a}${n}`]||(this.pressed[`${a}${n}`]=!0,this.axesActions[n][a].before()),this.axesActions[n][a].action()):this.pressed[`${a}${n}`]&&r%2===X&&(delete this.pressed[`${a}${n}`],this.axesActions[n][a].after())},checkStatus:function(){let a={};const n=navigator.getGamepads?navigator.getGamepads():navigator.webkitGetGamepads?navigator.webkitGetGamepads():[];if(n.length){if(a=n[this.id],a.buttons)for(let i=0;i<this.buttons;i++)a.buttons[i].pressed===!0?(this.pressed[`button${i}`]||(this.pressed[`button${i}`]=!0,this.buttonActions[i].before()),this.buttonActions[i].action()):this.pressed[`button${i}`]&&(delete this.pressed[`button${i}`],this.buttonActions[i].after());if(a.axes){const i=a.axes.length%2;for(let r=0;r<this.axes*2;r++){const X=a.axes[r+i].toFixed(4),h=Math.floor(r/2);this.axeValues[h][r%2]=X,this.triggerDirectionalAction("right",h,X>=this.axeThreshold[0],r,0),this.triggerDirectionalAction("left",h,X<=-this.axeThreshold[0],r,0),this.triggerDirectionalAction("down",h,X>=this.axeThreshold[0],r,1),this.triggerDirectionalAction("up",h,X<=-this.axeThreshold[0],r,1)}}}},associateEvent:function(a,n,i){if(a.match(/^button\d+$/)){const r=parseInt(a.match(/^button(\d+)$/)[1]);r>=0&&r<this.buttons?this.buttonActions[r][i]=n:le(ie.INVALID_BUTTON)}else if(a==="start")this.buttonActions[9][i]=n;else if(a==="select")this.buttonActions[8][i]=n;else if(a==="r1")this.buttonActions[5][i]=n;else if(a==="r2")this.buttonActions[7][i]=n;else if(a==="l1")this.buttonActions[4][i]=n;else if(a==="l2")this.buttonActions[6][i]=n;else if(a==="power")this.buttons>=17?this.buttonActions[16][i]=n:le(ie.INVALID_BUTTON);else if(a.match(/^(up|down|left|right)(\d+)$/)){const r=a.match(/^(up|down|left|right)(\d+)$/),X=r[1],h=parseInt(r[2]);h>=0&&h<this.axes?this.axesActions[h][X][i]=n:le(ie.INVALID_BUTTON)}else if(a.match(/^(up|down|left|right)$/)){const r=a.match(/^(up|down|left|right)$/)[1];this.axesActions[0][r][i]=n}return this},on:function(a,n){return this.associateEvent(a,n,"action")},off:function(a){return this.associateEvent(a,function(){},"action")},after:function(a,n){return this.associateEvent(a,n,"after")},before:function(a,n){return this.associateEvent(a,n,"before")}};for(let a=0;a<t.buttons;a++)t.buttonActions[a]=ve();for(let a=0;a<t.axes;a++)t.axesActions[a]={down:ve(),left:ve(),right:ve(),up:ve()},t.axeValues[a]=[0,0];return e.hapticActuators?typeof e.hapticActuators.pulse=="function"?(t.hapticActuator=e.hapticActuators,t.vibrationMode=0,t.vibration=!0):e.hapticActuators[0]&&typeof e.hapticActuators[0].pulse=="function"&&(t.hapticActuator=e.hapticActuators[0],t.vibrationMode=0,t.vibration=!0):e.vibrationActuator&&typeof e.vibrationActuator.playEffect=="function"&&(t.hapticActuator=e.vibrationActuator,t.vibrationMode=1,t.vibration=!0),t}},pe={gamepads:{},axeThreshold:[1],isReady:fa(),onConnect:function(){},onDisconnect:function(){},onBeforeCycle:function(){},onAfterCycle:function(){},getGamepads:function(){return this.gamepads},getGamepad:function(e){return this.gamepads[e]?this.gamepads[e]:null},set:function(e,t){if(["axeThreshold"].indexOf(e)>=0){if(e==="axeThreshold"&&(!parseFloat(t)||t<0||t>1)){le(ie.INVALID_VALUE_NUMBER);return}if(this[e]=t,e==="axeThreshold"){const n=this.getGamepads(),i=Object.keys(n);for(let r=0;r<i.length;r++)n[i[r]].set("axeThreshold",this.axeThreshold)}}else le(ie.INVALID_PROPERTY)},checkStatus:function(){const e=window.requestAnimationFrame||window.webkitRequestAnimationFrame,t=Object.keys(pe.gamepads);pe.onBeforeCycle();for(let a=0;a<t.length;a++)pe.gamepads[t[a]].checkStatus();pe.onAfterCycle(),t.length>0&&e(pe.checkStatus)},init:function(){window.addEventListener("gamepadconnected",e=>{const t=e.gamepad||e.detail.gamepad;if(ot(ie.ON),window.gamepads||(window.gamepads={}),t){if(!window.gamepads[t.index]){window.gamepads[t.index]=t;const a=pa.init(t);a.set("axeThreshold",this.axeThreshold),this.gamepads[a.id]=a,this.onConnect(this.gamepads[a.id])}Object.keys(this.gamepads).length===1&&this.checkStatus()}}),window.addEventListener("gamepaddisconnected",e=>{const t=e.gamepad||e.detail.gamepad;ot(ie.OFF),t&&(delete window.gamepads[t.index],delete this.gamepads[t.index],this.onDisconnect(t.index))})},on:function(e,t){switch(e){case"connect":this.onConnect=t;break;case"disconnect":this.onDisconnect=t;break;case"beforeCycle":case"beforecycle":this.onBeforeCycle=t;break;case"afterCycle":case"aftercycle":this.onAfterCycle=t;break;default:le(ie.UNKNOWN_EVENT);break}return this},off:function(e){switch(e){case"connect":this.onConnect=function(){};break;case"disconnect":this.onDisconnect=function(){};break;case"beforeCycle":case"beforecycle":this.onBeforeCycle=function(){};break;case"afterCycle":case"aftercycle":this.onAfterCycle=function(){};break;default:le(ie.UNKNOWN_EVENT);break}return this}};pe.init();const Pe="The Forgotton Adventures of Kroz",qe=80,Xe=25,De=1,Se=qe-16,Ce=1,Le=Xe-2,T=Se-De,I=Le-Ce,d=" ",ce=1,da=5;var Oe={},Fe={},_t;function ga(){if(_t)return Fe;_t=1,Object.defineProperty(Fe,"__esModule",{value:!0}),Fe.MiniSignal=void 0;const e=Symbol("SIGNAL");function t(n){return typeof n=="object"&&e in n}class a{constructor(){this._symbol=Symbol("MiniSignal"),this._refMap=new WeakMap,this._head=void 0,this._tail=void 0,this._dispatching=!1}hasListeners(){return this._head!=null}dispatch(...i){if(this._dispatching)throw new Error("MiniSignal#dispatch(): Signal already dispatching.");let r=this._head;if(r==null)return!1;for(this._dispatching=!0;r!=null;)r.fn(...i),r=r.next;return this._dispatching=!1,!0}add(i){if(typeof i!="function")throw new Error("MiniSignal#add(): First arg must be a Function.");return this._createRef(this._addNode({fn:i}))}detach(i){if(!t(i))throw new Error("MiniSignal#detach(): First arg must be a MiniSignal listener reference.");if(i[e]!==this._symbol)throw new Error("MiniSignal#detach(): MiniSignal listener does not belong to this MiniSignal.");const r=this._refMap.get(i);return r?(this._refMap.delete(i),this._disconnectNode(r),this._destroyNode(r),this):this}detachAll(){let i=this._head;if(i==null)return this;for(this._head=this._tail=void 0,this._refMap=new WeakMap;i!=null;)this._destroyNode(i),i=i.next;return this}_destroyNode(i){i.fn=void 0,i.prev=void 0}_disconnectNode(i){i===this._head?(this._head=i.next,i.next==null&&(this._tail=void 0)):i===this._tail&&(this._tail=i.prev,this._tail!=null&&(this._tail.next=void 0)),i.prev!=null&&(i.prev.next=i.next),i.next!=null&&(i.next.prev=i.prev)}_addNode(i){return this._head==null?(this._head=i,this._tail=i):(this._tail.next=i,i.prev=this._tail,this._tail=i),i}_createRef(i){const r={[e]:this._symbol};return this._refMap.set(r,i),r}_getRef(i){return this._refMap.get(i)}}return Fe.MiniSignal=a,Fe}var St;function Ma(){return St||(St=1,function(e){var t=Oe.__createBinding||(Object.create?function(n,i,r,X){X===void 0&&(X=r);var h=Object.getOwnPropertyDescriptor(i,r);(!h||("get"in h?!i.__esModule:h.writable||h.configurable))&&(h={enumerable:!0,get:function(){return i[r]}}),Object.defineProperty(n,X,h)}:function(n,i,r,X){X===void 0&&(X=r),n[X]=i[r]}),a=Oe.__exportStar||function(n,i){for(var r in n)r!=="default"&&!Object.prototype.hasOwnProperty.call(i,r)&&t(i,n,r)};Object.defineProperty(e,"__esModule",{value:!0}),a(ga(),e)}(Oe)),Oe}var ma=Ma();function L(e=0){return e<=0?new Promise(t=>{requestAnimationFrame(()=>t())}):new Promise(t=>{setTimeout(()=>t(),e)})}function Wt(e,t,a){return Math.min(Math.max(e,t),a)}const He=new ma.MiniSignal;let we=null;var V=(e=>(e[e.North=1]="North",e[e.South=2]="South",e[e.East=3]="East",e[e.West=4]="West",e[e.Northwest=5]="Northwest",e[e.Northeast=6]="Northeast",e[e.Southwest=7]="Southwest",e[e.Southeast=8]="Southeast",e[e.Whip=9]="Whip",e[e.FreeItems=10]="FreeItems",e[e.NextLevel=11]="NextLevel",e[e.NextLevelCheat=12]="NextLevelCheat",e[e.PrevLevel=13]="PrevLevel",e[e.Teleport=14]="Teleport",e[e.ResetFound=15]="ResetFound",e[e.HideFound=16]="HideFound",e[e.Pause=17]="Pause",e[e.Quit=18]="Quit",e[e.Save=19]="Save",e[e.Restore=20]="Restore",e[e.SlowerClock=21]="SlowerClock",e[e.FasterClock=22]="FasterClock",e))(V||{});const Q={},N={},Dt={ArrowUp:1,ArrowDown:2,ArrowLeft:4,ArrowRight:3,U:5,I:1,O:6,J:4,K:3,N:7,M:2,",":8,1:7,2:2,3:8,4:4,6:3,7:5,8:1,9:6,5:9,w:9,W:9,t:14,T:14,")":10,"+":15,"-":16,"(":12,PageDown:null,PageUp:null,p:17,P:17,Escape:18,s:19,S:19,r:20,R:20,F11:21,F12:22},wa={button0:9,button1:14,button4:null,button5:null,button8:19,button9:17,button16:18,up:1,down:2,left:4,right:3,button12:1,button13:2,button14:4,button15:3};function ya(){we||pe.on("connect",e=>{if(!we){we=e,we.axeThreshold=[.5,.5];for(const[t,a]of Object.entries(wa))a&&(we.before(t,()=>{Q[t]=N[a]=3}),we.after(t,()=>{(Q[t]||0)&3&&He.dispatch(t),Q[t]&=-2,Q[t]|=4,N[a]&=-2,N[a]|=4}))}})}function ba(e){if(e.repeat)return;const t=Dt[e.key];Q[e.key]=3,t&&(e.preventDefault(),N[t]=3)}function Ya(e){(Q[e.key]||0)&3&&He.dispatch(e.key),Q[e.key]&=-2,Q[e.key]|=4;const t=Dt[e.key];t&&(e.preventDefault(),N[t]&=-2,N[t]|=4)}function $a(){ya(),window.addEventListener("keydown",ba),window.addEventListener("keyup",Ya)}function Ve(){for(const e in Q)Q[e]&&(Q[e]=0)}function lt(){for(const e in N)Object.prototype.hasOwnProperty.call(N,e)&&delete N[e];for(const e in Q)Object.prototype.hasOwnProperty.call(Q,e)&&delete Q[e]}function Ct(){for(const e in N){const t=e;if(!N[t])continue;const a=!!(N[t]&2);N[t]&=-15,a&&(N[t]|=8)}}function se(e){return!!(N[e]&3)&&!(N[e]&8)}function ae(e){return!!(N[e]&4)}async function Ye(){return lt(),new Promise(e=>{const t=He.add(a=>{He.detach(t),e(a)})})}async function Xt(e,t=50){const a=Ye();do await(e==null?void 0:e());while(!await Promise.race([a,L(t)]));return a}class ct{getContainer(){return null}setOptions(t){this._options=t}}class ht extends ct{constructor(){super(),this._ctx=document.createElement("canvas").getContext("2d")}schedule(t){requestAnimationFrame(t)}getContainer(){return this._ctx.canvas}setOptions(t){super.setOptions(t);const n=`${t.fontStyle?`${t.fontStyle} `:""} ${t.fontSize}px ${t.fontFamily}`;this._ctx.font=n,this._updateSize(),this._ctx.font=n,this._ctx.textAlign="center",this._ctx.textBaseline="middle"}clear(){const t=this._ctx.globalCompositeOperation;this._ctx.globalCompositeOperation="copy",this._ctx.fillStyle=this._options.bg,this._ctx.fillRect(0,0,this._ctx.canvas.width,this._ctx.canvas.height),this._ctx.globalCompositeOperation=t}eventToPosition(t,a){let n=this._ctx.canvas,i=n.getBoundingClientRect();return t-=i.left,a-=i.top,t*=n.width/i.width,a*=n.height/i.height,t<0||a<0||t>=n.width||a>=n.height?[-1,-1]:this._normalizedEventToPosition(t,a)}}function ut(e,t){return(e%t+t)%t}class Tt extends ht{constructor(){super(),this._spacingX=0,this._spacingY=0,this._hexSize=0}draw(t,a){let[n,i,r,X,h]=t,c=[(n+1)*this._spacingX,i*this._spacingY+this._hexSize];if(this._options.transpose&&c.reverse(),a&&(this._ctx.fillStyle=h,this._fill(c[0],c[1])),!r)return;this._ctx.fillStyle=X;let u=[].concat(r);for(let y=0;y<u.length;y++)this._ctx.fillText(u[y],c[0],Math.ceil(c[1]))}computeSize(t,a){this._options.transpose&&(t+=a,a=t-a,t-=a);let n=Math.floor(t/this._spacingX)-1,i=Math.floor((a-2*this._hexSize)/this._spacingY+1);return[n,i]}computeFontSize(t,a){this._options.transpose&&(t+=a,a=t-a,t-=a);let n=2*t/((this._options.width+1)*Math.sqrt(3))-1,i=a/(2+1.5*(this._options.height-1)),r=Math.min(n,i),X=this._ctx.font;this._ctx.font="100px "+this._options.fontFamily;let h=Math.ceil(this._ctx.measureText("W").width);this._ctx.font=X;let c=h/100;r=Math.floor(r)+1;let u=2*r/(this._options.spacing*(1+c/Math.sqrt(3)));return Math.ceil(u)-1}_normalizedEventToPosition(t,a){let n;this._options.transpose?(t+=a,a=t-a,t-=a,n=this._ctx.canvas.width):n=this._ctx.canvas.height;let i=n/this._options.height;return a=Math.floor(a/i),ut(a,2)?(t-=this._spacingX,t=1+2*Math.floor(t/(2*this._spacingX))):t=2*Math.floor(t/(2*this._spacingX)),[t,a]}_fill(t,a){let n=this._hexSize,i=this._options.border;const r=this._ctx;r.beginPath(),this._options.transpose?(r.moveTo(t-n+i,a),r.lineTo(t-n/2+i,a+this._spacingX-i),r.lineTo(t+n/2-i,a+this._spacingX-i),r.lineTo(t+n-i,a),r.lineTo(t+n/2-i,a-this._spacingX+i),r.lineTo(t-n/2+i,a-this._spacingX+i),r.lineTo(t-n+i,a)):(r.moveTo(t,a-n+i),r.lineTo(t+this._spacingX-i,a-n/2+i),r.lineTo(t+this._spacingX-i,a+n/2-i),r.lineTo(t,a+n-i),r.lineTo(t-this._spacingX+i,a+n/2-i),r.lineTo(t-this._spacingX+i,a-n/2+i),r.lineTo(t,a-n+i)),r.fill()}_updateSize(){const t=this._options,a=Math.ceil(this._ctx.measureText("W").width);this._hexSize=Math.floor(t.spacing*(t.fontSize+a/Math.sqrt(3))/2),this._spacingX=this._hexSize*Math.sqrt(3)/2,this._spacingY=this._hexSize*1.5;let n,i;t.transpose?(n="height",i="width"):(n="width",i="height"),this._ctx.canvas[n]=Math.ceil((t.width+1)*this._spacingX),this._ctx.canvas[i]=Math.ceil((t.height-1)*this._spacingY+2*this._hexSize)}}class Te extends ht{constructor(){super(),this._spacingX=0,this._spacingY=0,this._canvasCache={}}setOptions(t){super.setOptions(t),this._canvasCache={}}draw(t,a){Te.cache?this._drawWithCache(t):this._drawNoCache(t,a)}_drawWithCache(t){let[a,n,i,r,X]=t,h=""+i+r+X,c;if(h in this._canvasCache)c=this._canvasCache[h];else{let u=this._options.border;c=document.createElement("canvas");let y=c.getContext("2d");if(c.width=this._spacingX,c.height=this._spacingY,y.fillStyle=X,y.fillRect(u,u,c.width-u,c.height-u),i){y.fillStyle=r,y.font=this._ctx.font,y.textAlign="center",y.textBaseline="middle";let $=[].concat(i);for(let _=0;_<$.length;_++)y.fillText($[_],this._spacingX/2,Math.ceil(this._spacingY/2))}this._canvasCache[h]=c}this._ctx.drawImage(c,a*this._spacingX,n*this._spacingY)}_drawNoCache(t,a){let[n,i,r,X,h]=t;if(a){let u=this._options.border;this._ctx.fillStyle=h,this._ctx.fillRect(n*this._spacingX+u,i*this._spacingY+u,this._spacingX-u,this._spacingY-u)}if(!r)return;this._ctx.fillStyle=X;let c=[].concat(r);for(let u=0;u<c.length;u++)this._ctx.fillText(c[u],(n+.5)*this._spacingX,Math.ceil((i+.5)*this._spacingY))}computeSize(t,a){let n=Math.floor(t/this._spacingX),i=Math.floor(a/this._spacingY);return[n,i]}computeFontSize(t,a){let n=Math.floor(t/this._options.width),i=Math.floor(a/this._options.height),r=this._ctx.font;this._ctx.font="100px "+this._options.fontFamily;let X=Math.ceil(this._ctx.measureText("W").width);this._ctx.font=r;let c=X/100*i/n;return c>1&&(i=Math.floor(i/c)),Math.floor(i/this._options.spacing)}_normalizedEventToPosition(t,a){return[Math.floor(t/this._spacingX),Math.floor(a/this._spacingY)]}_updateSize(){const t=this._options,a=Math.ceil(this._ctx.measureText("W").width);this._spacingX=Math.ceil(t.spacing*a),this._spacingY=Math.ceil(t.spacing*t.fontSize),t.forceSquareRatio&&(this._spacingX=this._spacingY=Math.max(this._spacingX,this._spacingY)),this._ctx.canvas.width=t.width*this._spacingX,this._ctx.canvas.height=t.height*this._spacingY}}Te.cache=!1;let It=class extends ht{constructor(){super(),this._colorCanvas=document.createElement("canvas")}draw(t,a){let[n,i,r,X,h]=t,c=this._options.tileWidth,u=this._options.tileHeight;if(a&&(this._options.tileColorize?this._ctx.clearRect(n*c,i*u,c,u):(this._ctx.fillStyle=h,this._ctx.fillRect(n*c,i*u,c,u))),!r)return;let y=[].concat(r),$=[].concat(X),_=[].concat(h);for(let S=0;S<y.length;S++){let Y=this._options.tileMap[y[S]];if(!Y)throw new Error(`Char "${y[S]}" not found in tileMap`);if(this._options.tileColorize){let E=this._colorCanvas,k=E.getContext("2d");k.globalCompositeOperation="source-over",k.clearRect(0,0,c,u);let D=$[S],C=_[S];k.drawImage(this._options.tileSet,Y[0],Y[1],c,u,0,0,c,u),D!="transparent"&&(k.fillStyle=D,k.globalCompositeOperation="source-atop",k.fillRect(0,0,c,u)),C!="transparent"&&(k.fillStyle=C,k.globalCompositeOperation="destination-over",k.fillRect(0,0,c,u)),this._ctx.drawImage(E,n*c,i*u,c,u)}else this._ctx.drawImage(this._options.tileSet,Y[0],Y[1],c,u,n*c,i*u,c,u)}}computeSize(t,a){let n=Math.floor(t/this._options.tileWidth),i=Math.floor(a/this._options.tileHeight);return[n,i]}computeFontSize(){throw new Error("Tile backend does not understand font size")}_normalizedEventToPosition(t,a){return[Math.floor(t/this._options.tileWidth),Math.floor(a/this._options.tileHeight)]}_updateSize(){const t=this._options;this._ctx.canvas.width=t.width*t.tileWidth,this._ctx.canvas.height=t.height*t.tileHeight,this._colorCanvas.width=t.tileWidth,this._colorCanvas.height=t.tileHeight}};const Ee=23283064365386963e-26;class Rt{constructor(){this._seed=0,this._s0=0,this._s1=0,this._s2=0,this._c=0}getSeed(){return this._seed}setSeed(t){return t=t<1?1/t:t,this._seed=t,this._s0=(t>>>0)*Ee,t=t*69069+1>>>0,this._s1=t*Ee,t=t*69069+1>>>0,this._s2=t*Ee,this._c=1,this}getUniform(){let t=2091639*this._s0+this._c*Ee;return this._s0=this._s1,this._s1=this._s2,this._c=t|0,this._s2=t-this._c,this._s2}getUniformInt(t,a){let n=Math.max(t,a),i=Math.min(t,a);return Math.floor(this.getUniform()*(n-i+1))+i}getNormal(t=0,a=1){let n,i,r;do n=2*this.getUniform()-1,i=2*this.getUniform()-1,r=n*n+i*i;while(r>1||r==0);let X=n*Math.sqrt(-2*Math.log(r)/r);return t+X*a}getPercentage(){return 1+Math.floor(this.getUniform()*100)}getItem(t){return t.length?t[Math.floor(this.getUniform()*t.length)]:null}shuffle(t){let a=[],n=t.slice();for(;n.length;){let i=n.indexOf(this.getItem(n));a.push(n.splice(i,1)[0])}return a}getWeightedValue(t){let a=0;for(let X in t)a+=t[X];let n=this.getUniform()*a,i,r=0;for(i in t)if(r+=t[i],n<r)return i;return i}getState(){return[this._s0,this._s1,this._s2,this._c]}setState(t){return this._s0=t[0],this._s1=t[1],this._s2=t[2],this._c=t[3],this}clone(){return new Rt().setState(this.getState())}}const m=new Rt().setSeed(Date.now());function Bt(e){let t,a;if(e in at)t=at[e];else{if(e.charAt(0)=="#"){let i=(e.match(/[0-9a-f]/gi)||[]).map(r=>parseInt(r,16));if(i.length==3)t=i.map(r=>r*17);else{for(let r=0;r<3;r++)i[r+1]+=16*i[r],i.splice(r,1);t=i}}else(a=e.match(/rgb\(([0-9, ]+)\)/i))?t=a[1].split(/\s*,\s*/).map(n=>parseInt(n)):t=[0,0,0];at[e]=t}return t.slice()}const at={black:[0,0,0],navy:[0,0,128],darkblue:[0,0,139],mediumblue:[0,0,205],blue:[0,0,255],darkgreen:[0,100,0],green:[0,128,0],teal:[0,128,128],darkcyan:[0,139,139],deepskyblue:[0,191,255],darkturquoise:[0,206,209],mediumspringgreen:[0,250,154],lime:[0,255,0],springgreen:[0,255,127],aqua:[0,255,255],cyan:[0,255,255],midnightblue:[25,25,112],dodgerblue:[30,144,255],forestgreen:[34,139,34],seagreen:[46,139,87],darkslategray:[47,79,79],darkslategrey:[47,79,79],limegreen:[50,205,50],mediumseagreen:[60,179,113],turquoise:[64,224,208],royalblue:[65,105,225],steelblue:[70,130,180],darkslateblue:[72,61,139],mediumturquoise:[72,209,204],indigo:[75,0,130],darkolivegreen:[85,107,47],cadetblue:[95,158,160],cornflowerblue:[100,149,237],mediumaquamarine:[102,205,170],dimgray:[105,105,105],dimgrey:[105,105,105],slateblue:[106,90,205],olivedrab:[107,142,35],slategray:[112,128,144],slategrey:[112,128,144],lightslategray:[119,136,153],lightslategrey:[119,136,153],mediumslateblue:[123,104,238],lawngreen:[124,252,0],chartreuse:[127,255,0],aquamarine:[127,255,212],maroon:[128,0,0],purple:[128,0,128],olive:[128,128,0],gray:[128,128,128],grey:[128,128,128],skyblue:[135,206,235],lightskyblue:[135,206,250],blueviolet:[138,43,226],darkred:[139,0,0],darkmagenta:[139,0,139],saddlebrown:[139,69,19],darkseagreen:[143,188,143],lightgreen:[144,238,144],mediumpurple:[147,112,216],darkviolet:[148,0,211],palegreen:[152,251,152],darkorchid:[153,50,204],yellowgreen:[154,205,50],sienna:[160,82,45],brown:[165,42,42],darkgray:[169,169,169],darkgrey:[169,169,169],lightblue:[173,216,230],greenyellow:[173,255,47],paleturquoise:[175,238,238],lightsteelblue:[176,196,222],powderblue:[176,224,230],firebrick:[178,34,34],darkgoldenrod:[184,134,11],mediumorchid:[186,85,211],rosybrown:[188,143,143],darkkhaki:[189,183,107],silver:[192,192,192],mediumvioletred:[199,21,133],indianred:[205,92,92],peru:[205,133,63],chocolate:[210,105,30],tan:[210,180,140],lightgray:[211,211,211],lightgrey:[211,211,211],palevioletred:[216,112,147],thistle:[216,191,216],orchid:[218,112,214],goldenrod:[218,165,32],crimson:[220,20,60],gainsboro:[220,220,220],plum:[221,160,221],burlywood:[222,184,135],lightcyan:[224,255,255],lavender:[230,230,250],darksalmon:[233,150,122],violet:[238,130,238],palegoldenrod:[238,232,170],lightcoral:[240,128,128],khaki:[240,230,140],aliceblue:[240,248,255],honeydew:[240,255,240],azure:[240,255,255],sandybrown:[244,164,96],wheat:[245,222,179],beige:[245,245,220],whitesmoke:[245,245,245],mintcream:[245,255,250],ghostwhite:[248,248,255],salmon:[250,128,114],antiquewhite:[250,235,215],linen:[250,240,230],lightgoldenrodyellow:[250,250,210],oldlace:[253,245,230],red:[255,0,0],fuchsia:[255,0,255],magenta:[255,0,255],deeppink:[255,20,147],orangered:[255,69,0],tomato:[255,99,71],hotpink:[255,105,180],coral:[255,127,80],darkorange:[255,140,0],lightsalmon:[255,160,122],orange:[255,165,0],lightpink:[255,182,193],pink:[255,192,203],gold:[255,215,0],peachpuff:[255,218,185],navajowhite:[255,222,173],moccasin:[255,228,181],bisque:[255,228,196],mistyrose:[255,228,225],blanchedalmond:[255,235,205],papayawhip:[255,239,213],lavenderblush:[255,240,245],seashell:[255,245,238],cornsilk:[255,248,220],lemonchiffon:[255,250,205],floralwhite:[255,250,240],snow:[255,250,250],yellow:[255,255,0],lightyellow:[255,255,224],ivory:[255,255,240],white:[255,255,255]};class At extends ct{constructor(){super(),this._uniforms={};try{this._gl=this._initWebGL()}catch(t){typeof t=="string"?alert(t):t instanceof Error&&alert(t.message)}}static isSupported(){return!!document.createElement("canvas").getContext("webgl2",{preserveDrawingBuffer:!0})}schedule(t){requestAnimationFrame(t)}getContainer(){return this._gl.canvas}setOptions(t){super.setOptions(t),this._updateSize();let a=this._options.tileSet;a&&"complete"in a&&!a.complete?a.addEventListener("load",()=>this._updateTexture(a)):this._updateTexture(a)}draw(t,a){const n=this._gl,i=this._options;let[r,X,h,c,u]=t,y=n.canvas.height-(X+1)*i.tileHeight;if(n.scissor(r*i.tileWidth,y,i.tileWidth,i.tileHeight),a&&(i.tileColorize?n.clearColor(0,0,0,0):n.clearColor(...Ke(u)),n.clear(n.COLOR_BUFFER_BIT)),!h)return;let $=[].concat(h),_=[].concat(u),S=[].concat(c);n.uniform2fv(this._uniforms.targetPosRel,[r,X]);for(let Y=0;Y<$.length;Y++){let E=this._options.tileMap[$[Y]];if(!E)throw new Error(`Char "${$[Y]}" not found in tileMap`);n.uniform1f(this._uniforms.colorize,i.tileColorize?1:0),n.uniform2fv(this._uniforms.tilesetPosAbs,E),i.tileColorize&&(n.uniform4fv(this._uniforms.tint,Ke(S[Y])),n.uniform4fv(this._uniforms.bg,Ke(_[Y]))),n.drawArrays(n.TRIANGLE_STRIP,0,4)}}clear(){const t=this._gl;t.clearColor(...Ke(this._options.bg)),t.scissor(0,0,t.canvas.width,t.canvas.height),t.clear(t.COLOR_BUFFER_BIT)}computeSize(t,a){let n=Math.floor(t/this._options.tileWidth),i=Math.floor(a/this._options.tileHeight);return[n,i]}computeFontSize(){throw new Error("Tile backend does not understand font size")}eventToPosition(t,a){let n=this._gl.canvas,i=n.getBoundingClientRect();return t-=i.left,a-=i.top,t*=n.width/i.width,a*=n.height/i.height,t<0||a<0||t>=n.width||a>=n.height?[-1,-1]:this._normalizedEventToPosition(t,a)}_initWebGL(){let t=document.createElement("canvas").getContext("webgl2",{preserveDrawingBuffer:!0});window.gl=t;let a=ka(t,Sa,Wa);return t.useProgram(a),va(t),_a.forEach(n=>this._uniforms[n]=t.getUniformLocation(a,n)),this._program=a,t.enable(t.BLEND),t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA),t.enable(t.SCISSOR_TEST),t}_normalizedEventToPosition(t,a){return[Math.floor(t/this._options.tileWidth),Math.floor(a/this._options.tileHeight)]}_updateSize(){const t=this._gl,a=this._options,n=[a.width*a.tileWidth,a.height*a.tileHeight];t.canvas.width=n[0],t.canvas.height=n[1],t.viewport(0,0,n[0],n[1]),t.uniform2fv(this._uniforms.tileSize,[a.tileWidth,a.tileHeight]),t.uniform2fv(this._uniforms.targetSize,n)}_updateTexture(t){Oa(this._gl,t)}}const _a=["targetPosRel","tilesetPosAbs","tileSize","targetSize","colorize","bg","tint"],Sa=`
#version 300 es

in vec2 tilePosRel;
out vec2 tilesetPosPx;

uniform vec2 tilesetPosAbs;
uniform vec2 tileSize;
uniform vec2 targetSize;
uniform vec2 targetPosRel;

void main() {
	vec2 targetPosPx = (targetPosRel + tilePosRel) * tileSize;
	vec2 targetPosNdc = ((targetPosPx / targetSize)-0.5)*2.0;
	targetPosNdc.y *= -1.0;

	gl_Position = vec4(targetPosNdc, 0.0, 1.0);
	tilesetPosPx = tilesetPosAbs + tilePosRel * tileSize;
}`.trim(),Wa=`
#version 300 es
precision highp float;

in vec2 tilesetPosPx;
out vec4 fragColor;
uniform sampler2D image;
uniform bool colorize;
uniform vec4 bg;
uniform vec4 tint;

void main() {
	fragColor = vec4(0, 0, 0, 1);

	vec4 texel = texelFetch(image, ivec2(tilesetPosPx), 0);

	if (colorize) {
		texel.rgb = tint.a * tint.rgb + (1.0-tint.a) * texel.rgb;
		fragColor.rgb = texel.a*texel.rgb + (1.0-texel.a)*bg.rgb;
		fragColor.a = texel.a + (1.0-texel.a)*bg.a;
	} else {
		fragColor = texel;
	}
}`.trim();function ka(e,t,a){const n=e.createShader(e.VERTEX_SHADER);if(e.shaderSource(n,t),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(n)||"");const i=e.createShader(e.FRAGMENT_SHADER);if(e.shaderSource(i,a),e.compileShader(i),!e.getShaderParameter(i,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(i)||"");const r=e.createProgram();if(e.attachShader(r,n),e.attachShader(r,i),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(r)||"");return r}function va(e){const t=new Float32Array([0,0,1,0,0,1,1,1]),a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0)}function Oa(e,t){let a=e.createTexture();return e.bindTexture(e.TEXTURE_2D,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.REPEAT),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t),a}let it={};function Ke(e){if(!(e in it)){let t;if(e=="transparent")t=[0,0,0,0];else if(e.indexOf("rgba")>-1){t=(e.match(/[\d.]+/g)||[]).map(Number);for(let a=0;a<3;a++)t[a]=t[a]/255}else t=Bt(e).map(a=>a/255),t.push(1);it[e]=t}return it[e]}function Fa(e){return`\x1B[0;48;5;${st(e)}m\x1B[2J`}function xa(e,t){return`\x1B[0;38;5;${st(e)};48;5;${st(t)}m`}function Pa(e,t){return`\x1B[${t+1};${e+1}H`}function st(e){const n=.0234375;let i=Bt(e),r=Math.floor(i[0]*n),X=Math.floor(i[1]*n),h=Math.floor(i[2]*n);return r*36+X*6+h*1+16}class Vt extends ct{constructor(){super(),this._offset=[0,0],this._cursor=[-1,-1],this._lastColor=""}schedule(t){setTimeout(t,1e3/60)}setOptions(t){super.setOptions(t);let a=[t.width,t.height],n=this.computeSize();this._offset=n.map((i,r)=>Math.floor((i-a[r])/2))}clear(){process.stdout.write(Fa(this._options.bg))}draw(t,a){let[n,i,r,X,h]=t,c=this._offset[0]+n,u=this._offset[1]+i,y=this.computeSize();if(c<0||c>=y[0]||u<0||u>=y[1]||((c!==this._cursor[0]||u!==this._cursor[1])&&(process.stdout.write(Pa(c,u)),this._cursor[0]=c,this._cursor[1]=u),a&&(r||(r=" ")),!r))return;let $=xa(X,h);if($!==this._lastColor&&(process.stdout.write($),this._lastColor=$),r!="	"){let _=[].concat(r);process.stdout.write(_[0])}this._cursor[0]++,this._cursor[0]>=y[0]&&(this._cursor[0]=0,this._cursor[1]++)}computeFontSize(){throw new Error("Terminal backend has no notion of font size")}eventToPosition(t,a){return[t,a]}computeSize(){return[process.stdout.columns,process.stdout.rows]}}const La=/%([bc]){([^}]*)}/g,We=0,xe=1,Et=2,Kt=3;function Da(e,t){let a=[],n=0;e.replace(La,function(r,X,h,c){let u=e.substring(n,c);return u.length&&a.push({type:We,value:u}),a.push({type:X=="c"?Et:Kt,value:h.trim()}),n=c+r.length,""});let i=e.substring(n);return i.length&&a.push({type:We,value:i}),Ca(a,t)}function Ca(e,t){t||(t=1/0);let a=0,n=0,i=-1;for(;a<e.length;){let X=e[a];if(X.type==xe&&(n=0,i=-1),X.type!=We){a++;continue}for(;n==0&&X.value.charAt(0)==" ";)X.value=X.value.substring(1);let h=X.value.indexOf(`
`);if(h!=-1){X.value=Ue(e,a,h,!0);let c=X.value.split("");for(;c.length&&c[c.length-1]==" ";)c.pop();X.value=c.join("")}if(!X.value.length){e.splice(a,1);continue}if(n+X.value.length>t){let c=-1;for(;;){let u=X.value.indexOf(" ",c+1);if(u==-1||n+u>t)break;c=u}if(c!=-1)X.value=Ue(e,a,c,!0);else if(i!=-1){let u=e[i],y=u.value.lastIndexOf(" ");u.value=Ue(e,i,y,!0),a=i}else X.value=Ue(e,a,t-n,!1)}else n+=X.value.length,X.value.indexOf(" ")!=-1&&(i=a);a++}e.push({type:xe});let r=null;for(let X=0;X<e.length;X++){let h=e[X];switch(h.type){case We:r=h;break;case xe:if(r){let c=r.value.split("");for(;c.length&&c[c.length-1]==" ";)c.pop();r.value=c.join("")}r=null;break}}return e.pop(),e}function Ue(e,t,a,n){let i={type:xe},r={type:We,value:e[t].value.substring(a+(n?1:0))};return e.splice(t+1,0,i,r),e[t].value.substring(0,a)}let Ta=80,Ia=25;const Ba={hex:Tt,rect:Te,tile:It,"tile-gl":At,term:Vt},Aa={width:Ta,height:Ia,transpose:!1,layout:"rect",fontSize:15,spacing:1,border:0,forceSquareRatio:!1,fontFamily:"monospace",fontStyle:"",fg:"#ccc",bg:"#000",tileWidth:32,tileHeight:32,tileMap:{},tileSet:null,tileColorize:!1};class de{constructor(t={}){this._data={},this._dirty=!1,this._options={},t=Object.assign({},Aa,t),this.setOptions(t),this.DEBUG=this.DEBUG.bind(this),this._tick=this._tick.bind(this),this._backend.schedule(this._tick)}DEBUG(t,a,n){let i=[this._options.bg,this._options.fg];this.draw(t,a,null,null,i[n%i.length])}clear(){this._data={},this._dirty=!0}setOptions(t){if(Object.assign(this._options,t),t.width||t.height||t.fontSize||t.fontFamily||t.spacing||t.layout){if(t.layout){let a=Ba[t.layout];this._backend=new a}this._backend.setOptions(this._options),this._dirty=!0}return this}getOptions(){return this._options}getContainer(){return this._backend.getContainer()}computeSize(t,a){return this._backend.computeSize(t,a)}computeFontSize(t,a){return this._backend.computeFontSize(t,a)}computeTileSize(t,a){let n=Math.floor(t/this._options.width),i=Math.floor(a/this._options.height);return[n,i]}eventToPosition(t){let a,n;return"touches"in t?(a=t.touches[0].clientX,n=t.touches[0].clientY):(a=t.clientX,n=t.clientY),this._backend.eventToPosition(a,n)}draw(t,a,n,i,r){i||(i=this._options.fg),r||(r=this._options.bg);let X=`${t},${a}`;this._data[X]=[t,a,n,i,r],this._dirty!==!0&&(this._dirty||(this._dirty={}),this._dirty[X]=!0)}drawOver(t,a,n,i,r){const X=`${t},${a}`,h=this._data[X];h?(h[2]=n||h[2],h[3]=i||h[3],h[4]=r||h[4]):this.draw(t,a,n,i,r)}drawText(t,a,n,i){let r=null,X=null,h=t,c=a,u=1;i||(i=this._options.width-t);let y=Da(n,i);for(;y.length;){let $=y.shift();switch($.type){case We:let _=!1,S=!1,Y=!1,E=!1;for(let k=0;k<$.value.length;k++){let D=$.value.charCodeAt(k),C=$.value.charAt(k);if(this._options.layout==="term"){let O=D>>8;if(O===17||O>=46&&O<=159||O>=172&&O<=215||D>=43360&&D<=43391){this.draw(h+0,c,C,r,X),this.draw(h+1,c,"	",r,X),h+=2;continue}}Y=D>65280&&D<65377||D>65500&&D<65512||D>65518,_=C.charCodeAt(0)==32||C.charCodeAt(0)==12288,E&&!Y&&!_&&h++,Y&&!S&&h++,this.draw(h++,c,C,r,X),S=_,E=Y}break;case Et:r=$.value||null;break;case Kt:X=$.value||null;break;case xe:h=t,c++,u++;break}}return u}_tick(){if(this._backend.schedule(this._tick),!!this._dirty){if(this._dirty===!0){this._backend.clear();for(let t in this._data)this._draw(t,!1)}else for(let t in this._dirty)this._draw(t,!0);this._dirty=!1}}_draw(t,a){let n=this._data[t];n[4]!=this._options.bg&&(a=!0),this._backend.draw(n,a)}}de.Rect=Te;de.Hex=Tt;de.Tile=It;de.TileGL=At;de.Term=Vt;var l=(e=>(e[e.Black=0]="Black",e[e.Blue=1]="Blue",e[e.Green=2]="Green",e[e.Cyan=3]="Cyan",e[e.Red=4]="Red",e[e.Magenta=5]="Magenta",e[e.Brown=6]="Brown",e[e.White=7]="White",e[e.Grey=8]="Grey",e[e.LightBlue=9]="LightBlue",e[e.LightGreen=10]="LightGreen",e[e.LightCyan=11]="LightCyan",e[e.LightRed=12]="LightRed",e[e.LightMagenta=13]="LightMagenta",e[e.Yellow=14]="Yellow",e[e.HighIntensityWhite=15]="HighIntensityWhite",e))(l||{});const re={0:"#000000",1:"#0000AA",2:"#00AA00",3:"#00AAAA",4:"#AA0000",5:"#AA00AA",6:"#AA5500",7:"#AAAAAA",8:"#AAAAAA",9:"#5555FF",10:"#55FF55",11:"#55FFFF",12:"#FF5555",13:"#FF55FF",14:"#FFFF55",15:"#FFFFFF"};let j;function Va(){de.Rect.cache=!0,j=new de({width:qe,height:Xe,fontFamily:"IBM_VGA, monospace",bg:re[l.Black],fg:re[l.White],fontSize:64})}function Z(e,t,a=j.getOptions().fg,n=j.getOptions().bg){const i=Math.floor((qe-t.length)/2);W(i,e,t,a,n)}function ue(e=j.getOptions().bg){typeof e=="number"&&(e=re[e]),j.setOptions({bg:e}),j.clear()}function Ut(e,t=j.getOptions().bg){return typeof e=="number"&&e>15&&(e=Date.now()%500<250?e%16:t),typeof e=="number"&&(e=re[e]),typeof t=="number"&&(t=re[t]),[e,t]}function $e(e,t,a,n=j.getOptions().fg,i=j.getOptions().bg){[n,i]=Ut(n,i),j.draw(e,t,a,n,i)}function W(e,t,a,n=j.getOptions().fg,i=j.getOptions().bg){return typeof n=="number"&&n>15&&(n=Date.now()%500<250?n:i),typeof i=="number"&&(i=re[i%16]),typeof n=="number"&&(n=re[n%16]),j.drawText(e,t,`%c{${n}}%b{${i}}`+a)}function Ea(){return j||Va(),j.getContainer()}class kt{constructor(){this.heap=[],this.timestamp=0}lessThan(t,a){return t.key==a.key?t.timestamp<a.timestamp:t.key<a.key}shift(t){this.heap=this.heap.map(({key:a,value:n,timestamp:i})=>({key:a+t,value:n,timestamp:i}))}len(){return this.heap.length}push(t,a){this.timestamp+=1;const n=this.len();this.heap.push({value:t,timestamp:this.timestamp,key:a}),this.updateUp(n)}pop(){if(this.len()==0)throw new Error("no element to pop");const t=this.heap[0];return this.len()>1?(this.heap[0]=this.heap.pop(),this.updateDown(0)):this.heap.pop(),t}find(t){for(let a=0;a<this.len();a++)if(t==this.heap[a].value)return this.heap[a];return null}remove(t){let a=null;for(let n=0;n<this.len();n++)t==this.heap[n].value&&(a=n);if(a===null)return!1;if(this.len()>1){let n=this.heap.pop();return n.value!=t&&(this.heap[a]=n,this.updateDown(a)),!0}else this.heap.pop();return!0}parentNode(t){return Math.floor((t-1)/2)}leftChildNode(t){return 2*t+1}rightChildNode(t){return 2*t+2}existNode(t){return t>=0&&t<this.heap.length}swap(t,a){const n=this.heap[t];this.heap[t]=this.heap[a],this.heap[a]=n}minNode(t){const a=t.filter(this.existNode.bind(this));let n=a[0];for(const i of a)this.lessThan(this.heap[i],this.heap[n])&&(n=i);return n}updateUp(t){if(t==0)return;const a=this.parentNode(t);this.existNode(a)&&this.lessThan(this.heap[t],this.heap[a])&&(this.swap(t,a),this.updateUp(a))}updateDown(t){const a=this.leftChildNode(t),n=this.rightChildNode(t);if(!this.existNode(a))return;const i=this.minNode([t,a,n]);i!=t&&(this.swap(t,i),this.updateDown(i))}debugPrint(){console.log(this.heap)}}class Ka{constructor(){this._time=0,this._events=new kt}getTime(){return this._time}clear(){return this._events=new kt,this}add(t,a){this._events.push(t,a)}get(){if(!this._events.len())return null;let{key:t,value:a}=this._events.pop();return t>0&&(this._time+=t,this._events.shift(-t)),a}getEventTime(t){const a=this._events.find(t);if(a){const{key:n}=a;return n}}remove(t){return this._events.remove(t)}}let ft=class{constructor(){this._queue=new Ka,this._repeat=[],this._current=null}getTime(){return this._queue.getTime()}add(t,a){return a&&this._repeat.push(t),this}getTimeOf(t){return this._queue.getEventTime(t)}clear(){return this._queue.clear(),this._repeat=[],this._current=null,this}remove(t){let a=this._queue.remove(t),n=this._repeat.indexOf(t);return n!=-1&&this._repeat.splice(n,1),this._current==t&&(this._current=null),a}next(){return this._current=this._queue.get(),this._current}};class Ua extends ft{add(t,a){return this._queue.add(t,0),super.add(t,a)}next(){return this._current!==null&&this._repeat.indexOf(this._current)!=-1&&this._queue.add(this._current,0),super.next()}}class za extends ft{add(t,a,n){return this._queue.add(t,n!==void 0?n:1/t.getSpeed()),super.add(t,a)}next(){return this._current&&this._repeat.indexOf(this._current)!=-1&&this._queue.add(this._current,1/this._current.getSpeed()),super.next()}}class Na extends ft{constructor(){super(),this._defaultDuration=1,this._duration=this._defaultDuration}add(t,a,n){return this._queue.add(t,n||this._defaultDuration),super.add(t,a)}clear(){return this._duration=this._defaultDuration,super.clear()}remove(t){return t==this._current&&(this._duration=this._defaultDuration),super.remove(t)}next(){return this._current!==null&&this._repeat.indexOf(this._current)!=-1&&(this._queue.add(this._current,this._duration||this._defaultDuration),this._duration=this._defaultDuration),super.next()}setDuration(t){return this._current&&(this._duration=t),this}}const Ga={Simple:Ua,Speed:za,Action:Na},Ze={volume:.3,sampleRate:44100,x:new AudioContext,play:function(...e){return this.playSamples(this.buildSamples(...e))},playSamples:function(...e){const t=this.x.createBuffer(e.length,e[0].length,this.sampleRate),a=this.x.createBufferSource();return e.map((n,i)=>t.getChannelData(i).set(n)),a.buffer=t,a.connect(this.x.destination),a.start(),a},buildSamples:function(e=1,t=.05,a=220,n=0,i=0,r=.1,X=0,h=1,c=0,u=0,y=0,$=0,_=0,S=0,Y=0,E=0,k=0,D=1,C=0,O=0,J=0){let H=Math.PI*2,Me=Xa=>Xa<0?-1:1,U=this.sampleRate,Ie=c*=500*H/U/U,ke=a*=(1+t*2*Math.random()-t)*H/U,me=[],R=0,f=0,p=0,F=1,K=0,oe=0,A=0,z,q,Be=2,gt=H*Math.abs(J)*2/U,et=Math.cos(gt),Mt=Math.sin(gt)/2/Be,Ae=1+Mt,oa=-2*et/Ae,sa=(1-Mt)/Ae,mt=(1+Me(J)*et)/2/Ae,ra=-(Me(J)+et)/Ae,la=mt,wt=0,yt=0,bt=0,Yt=0;for(n=n*U+9,C*=U,i*=U,r*=U,k*=U,u*=500*H/U**3,Y*=H/U,y*=H/U,$*=U,_=_*U|0,e*=this.volume,q=n+C+i+r+k|0;p<q;me[p++]=A*e)++oe%(E*100|0)||(A=X?X>1?X>2?X>3?Math.sin(R*R):Math.max(Math.min(Math.tan(R),1),-1):1-(2*R/H%2+2)%2:1-4*Math.abs(Math.round(R/H)-R/H):Math.sin(R),A=(_?1-O+O*Math.sin(H*p/_):1)*Me(A)*Math.abs(A)**h*(p<n?p/n:p<n+C?1-(p-n)/C*(1-D):p<n+C+i?D:p<q-k?(q-p-k)/r*D:0),A=k?A/2+(k>p?0:(p<q-k?1:(q-p)/k)*me[p-k|0]/2/e):A,J&&(A=Yt=la*wt+ra*(wt=yt)+mt*(yt=A)-sa*bt-oa*(bt=Yt))),z=(a+=c+=u)*Math.cos(Y*f++),R+=z+z*S*Math.sin(p**5),F&&++F>$&&(a+=y,ke+=y,F=0),_&&!(++K%_)&&(a=ke,c=Ie,F=F||1);return me},getNote:function(e=0,t=440){return t*2**(e/12)}};Ze.volume=.005;function M(e,t,a=1){return Ze.play(a,0,e,0,t/1e3,0),L(t)}async function ee(){for(let e=1;e<=65;e++)M(m.getUniformInt(1e3,2e3),1);await L(0)}async function nt(){for(let e=150;e>=35;e--)await M(e,1)}async function vt(){await M(400,120,5),await L(10),await M(700,120,5),await L(10)}async function _e(){for(let e=1;e<=23;e++)M(m.getUniformInt(350,900),120);await L(120);for(let e=1;e<=30;e++)M(m.getUniformInt(150,200),50)}async function Ha(){for(let e=10;e<=90;e++)await M(e,15,100)}async function Ot(){for(let e=150;e>35;e--)await M(e,16,50)}const qa=Ze.buildSamples(10,0,40,void 0,.1,0,void 0,0,void 0,void 0,void 0,void 0,void 0,1);async function ye(){Ze.playSamples(qa)}async function Ft(){for(let e=1;e<=25;e++)if(Math.random()>.5){const t=m.getUniformInt(0,59)+10;for(let a=1;a<=t;a++)M(m.getUniformInt(0,4e3)+3e3,16,10)}else await L(m.getUniformInt(0,29))}var o=(e=>(e[e.Border=-1]="Border",e[e.Floor=0]="Floor",e[e.Slow=1]="Slow",e[e.Medium=2]="Medium",e[e.Fast=3]="Fast",e[e.Block=4]="Block",e[e.Whip=5]="Whip",e[e.Stairs=6]="Stairs",e[e.Chest=7]="Chest",e[e.SlowTime=8]="SlowTime",e[e.Gem=9]="Gem",e[e.Invisible=10]="Invisible",e[e.Teleport=11]="Teleport",e[e.Key=12]="Key",e[e.Door=13]="Door",e[e.Wall=14]="Wall",e[e.SpeedTime=15]="SpeedTime",e[e.Trap=16]="Trap",e[e.River=17]="River",e[e.Power=18]="Power",e[e.Forest=19]="Forest",e[e.Tree=20]="Tree",e[e.Bomb=21]="Bomb",e[e.Lava=22]="Lava",e[e.Pit=23]="Pit",e[e.Tome=24]="Tome",e[e.Tunnel=25]="Tunnel",e[e.Freeze=26]="Freeze",e[e.Nugget=27]="Nugget",e[e.Quake=28]="Quake",e[e.IBlock=29]="IBlock",e[e.IWall=30]="IWall",e[e.IDoor=31]="IDoor",e[e.Stop=32]="Stop",e[e.Trap2=33]="Trap2",e[e.Zap=34]="Zap",e[e.Create=35]="Create",e[e.Generator=36]="Generator",e[e.Trap3=37]="Trap3",e[e.MBlock=38]="MBlock",e[e.Trap4=39]="Trap4",e[e.Player=40]="Player",e[e.ShowGems=41]="ShowGems",e[e.Tablet=42]="Tablet",e[e.ZBlock=43]="ZBlock",e[e.BlockSpell=44]="BlockSpell",e[e.Chance=45]="Chance",e[e.Statue=46]="Statue",e[e.WallVanish=47]="WallVanish",e[e.K=48]="K",e[e.R=49]="R",e[e.O=50]="O",e[e.Z=51]="Z",e[e.OWall1=52]="OWall1",e[e.OWall2=53]="OWall2",e[e.OWall3=54]="OWall3",e[e.CWall1=55]="CWall1",e[e.CWall2=56]="CWall2",e[e.CWall3=57]="CWall3",e[e.OSpell1=58]="OSpell1",e[e.OSpell2=59]="OSpell2",e[e.OSpell3=60]="OSpell3",e[e.CSpell1=61]="CSpell1",e[e.CSpell2=62]="CSpell2",e[e.CSpell3=63]="CSpell3",e[e.GBlock=64]="GBlock",e[e.Rock=65]="Rock",e[e.EWall=66]="EWall",e[e.Trap5=67]="Trap5",e[e.TBlock=68]="TBlock",e[e.TRock=69]="TRock",e[e.TGem=70]="TGem",e[e.TBlind=71]="TBlind",e[e.TWhip=72]="TWhip",e[e.TGold=73]="TGold",e[e.TTree=74]="TTree",e[e.Rope=75]="Rope",e[e.DropRope=76]="DropRope",e[e.DropRope2=77]="DropRope2",e[e.DropRope3=78]="DropRope3",e[e.DropRope4=79]="DropRope4",e[e.DropRope5=80]="DropRope5",e[e.Amulet=81]="Amulet",e[e.ShootRight=82]="ShootRight",e[e.ShootLeft=83]="ShootLeft",e[e.Trap6=224]="Trap6",e[e.Trap7=225]="Trap7",e[e.Trap8=226]="Trap8",e[e.Trap9=227]="Trap9",e[e.Trap10=228]="Trap10",e[e.Trap11=229]="Trap11",e[e.Trap12=230]="Trap12",e[e.Trap13=231]="Trap13",e[e.Message=252]="Message",e))(o||{});const P={[-1]:"▒",0:d,1:"Ä",2:"Ö",3:"Ω",4:"▓",5:"⌠",6:"≡",7:"C",8:"Φ",9:"♦",10:"¡",11:"↑",12:"î",13:"∞",14:"█",15:"Θ",16:"∙",17:"≈",18:"○",19:"█",20:"♣",21:"¥",22:"▓",23:"░",24:"■",25:"∩",26:"ƒ",27:"☼",28:d,29:d,30:d,31:d,32:d,33:d,34:"▲",35:"▼",36:"♠",37:d,38:"▓",39:d,40:"☻",41:d,42:"■",43:"▓",44:d,45:"?",46:"☺",47:d,48:"K",49:"R",50:"O",51:"Z",52:"█",53:"█",54:"█",55:d,56:d,57:d,58:"⌂",59:"⌂",60:"⌂",61:d,62:d,63:d,64:"▓",65:"O",66:"X",67:d,68:d,69:d,70:d,71:d,72:d,73:d,74:d,75:"│",76:"↓",77:"↓",78:"↓",79:"↓",80:"↓",81:"♀",82:"→",83:"←",224:d,225:d,226:d,227:d,228:d,229:d,230:d,231:d,252:"♣"},Za={" ":0,1:1,2:2,3:3,X:4,W:5,L:6,C:7,S:8,"+":9,I:10,T:11,K:12,D:13,"#":14,F:15,".":16,R:17,Q:18,"/":19,"\\":20,"♣":20,B:21,V:22,"=":23,A:24,U:25,Z:26,"*":27,E:28,";":29,":":30,"`":31,"-":32,"@":33,"%":34,"]":35,G:36,")":37,M:38,"(":39,P:40,"&":41,"!":42,O:43,H:44,"?":45,">":46,N:47,"<":48,"[":49,"|":50,'"':51,4:52,5:53,6:54,7:55,8:56,9:57,ñ:58,ò:59,ó:60,ô:61,õ:62,ö:63,Y:64,0:65,"~":66,$:67,"‘":68,"’":69,"“":70,"”":71,"•":72,"–":73,"—":74,"³":75,"¹":76,º:77,"»":78,"¼":79,"½":80,ƒ:81,"¯":82,"®":83,à:224,á:225,â:226,ã:227,ä:228,å:229,æ:230,ç:231,ü:252},G={[-1]:[l.LightBlue,l.Black],0:[l.White,l.Black],1:[l.LightRed,null],2:[l.LightBlue,null],3:[l.Green,null],4:[l.Brown,null],5:[l.HighIntensityWhite,null],6:[l.Black|16,l.White],7:[l.Yellow,l.Red],8:[l.LightCyan,null],9:[l.Blue,null],10:[l.Green,null],11:[l.LightMagenta,null],12:[l.LightRed,null],13:[l.Cyan,l.Magenta],14:[l.Brown,l.Brown],15:[l.LightCyan,null],16:[l.White,null],17:[l.LightBlue,l.Blue],18:[l.HighIntensityWhite,null],19:[l.Green,l.Green],20:[l.Brown,l.Green],21:[l.HighIntensityWhite,null],22:[l.LightRed,l.Red],23:[l.White,null],24:[l.HighIntensityWhite|32,l.Magenta],25:[l.HighIntensityWhite,null],26:[l.LightCyan,null],27:[l.Yellow,null],28:[l.HighIntensityWhite,null],29:[null,null],30:[null,null],31:[null,null],32:[null,null],34:[l.LightRed,null],35:[l.HighIntensityWhite,null],36:[l.Yellow|16,null],38:[l.Brown,null],33:[null,null],37:[null,null],39:[null,null],67:[null,null],224:[null,null],225:[null,null],226:[null,null],227:[null,null],228:[null,null],229:[null,null],230:[null,null],231:[null,null],40:[l.Yellow,l.Black],41:[null,null],42:[l.LightBlue,null],43:[l.Brown,null],44:[null,null],45:[l.HighIntensityWhite,null],46:[l.HighIntensityWhite|16,null],48:[l.Yellow,null],49:[l.Yellow,null],50:[l.Yellow,null],51:[l.Yellow,null],52:[l.Brown,l.Brown],53:[l.Brown,l.Brown],54:[l.White,l.White],55:[null,null],56:[null,null],57:[null,null],58:[l.LightCyan,null],59:[l.LightCyan,null],60:[l.LightCyan,null],61:[null,null],62:[null,null],63:[null,null],64:[l.White,l.Black],65:[l.White,null],66:[l.LightRed,l.Red],68:[null,null],69:[null,null],70:[null,null],71:[null,null],72:[null,null],73:[null,null],74:[null,null],47:[l.HighIntensityWhite,null],75:[l.White,null],76:[l.White,null],77:[l.White,null],78:[l.White,null],79:[l.White,null],80:[l.White,null],82:[l.White,null],83:[l.White,null],81:[l.HighIntensityWhite|16,null],252:[l.Brown,l.Green]},ja={[-1]:"An Electrified Wall blocks your way.",4:"A Breakable Wall blocks your way",5:"You have found a Whip",6:"Stairs take you to the next lower level.",7:"`You found gems and whips inside the chest!",8:"You activated a Slow Time spell.",9:"Gems give you both points and strength.",10:"Oh no, a temporary Blindness Potion!",11:"You found a Teleport scroll.",12:"Use Keys to unlock doors.",13:"To pass the Door you need a Key.",14:"A Solid Wall blocks your way.",17:"You cannot travel through Water.",15:"You activated a Speed Creature spell.",16:"You activated a Teleport trap!",18:"A Power Ring--your whip is now a little stronger!",20:"A tree blocks your way.",19:"You cannot travel through forest terrain.",21:"You activated a Magic Bomb!",22:"Oooooooooooooooooooh!  Lava hurts!  (Lose 10 Gems.)",23:"* SPLAT!! *",24:"The Sacred Tome of Kroz is finally yours--50,000 points!",25:"You passed through a secret Tunnel!",26:"You have activated a Freeze Creature spell!",27:"You found a Gold Nugget...500 points!",28:"Oh no, you set off an Earthquake trap!",29:"An Invisible Crumbled Wall blocks your way.",31:"An Invisible Door blocks your way.",34:"A Creature Zap Spell!",35:"A Creature Creation Trap!",36:"You have discovered a Creature Generator!",38:"A Moving Wall blocks your way.",41:"Yah Hoo! You discovered a Reveal Gems Scroll!",42:"You found an Ancient Tablet of Wisdom...2,500 points!",44:"You triggered Exploding Walls!",45:"You found a Pouch containing Gems!",46:"Statues are very dangerous...they drain your Gems!",47:"Yikes!  A trap has made many of the wall sections invisible!",51:"Super Kroz Bonus -- 10,000 points!",52:"A Solid Wall blocks your way.",58:"Magic has been released is this chamber!",59:"Magic has been released is this chamber!",60:"Magic has been released is this chamber!",61:"New Walls have magically appeared!",62:"New Walls have magically appeared!",63:"New Walls have magically appeared!",65:"You pushed a big Boulder!",66:"You hit a Electrified Wall!  You lose one Gem.",75:"You grabbed a Rope.",81:"YOUR QUEST FOR THE AMULET WAS SUCCESSFUL!"},zt=[3,2,1],Nt=[68,69,70,71,72,73,74],pt=[33,37,38,39,67,224,225,226,227,228,229,230,231],Qa=[29,30,31],Ja=[5,9,11],ei=[8,10,15,26],ti=[55,56,57],ai=[61,62,63],ii=[...zt,4,...Qa,43,64,...Nt,13,16,...pt,19,28,32,35,36,45,48,49,50,51],ni=[...zt,...Ja,...ei,7,16,...pt,32],oi=[0,32,...pt,41,44,47,...ti,...ai,...Nt],si=structuredClone(P),ri=structuredClone(G);function li(){Object.assign(P,si),Object.assign(G,ri)}function Xi(e){switch(e){case o.Player:return ce;case o.Slow:return ce/4;case o.Medium:return ce/3;case o.Fast:return ce/2}}class ge{constructor(t,a,n){tt(this,"ch");tt(this,"speed");this.type=t,this.x=a,this.y=n,this.x=a,this.y=n,this.ch=P[this.type],this.speed=Xi(this.type)}move(t,a){this.type===o.Player?_e():this.type===o.Slow?this.ch=Math.random()>.5?"A":"Ä":this.type===o.Medium&&(this.ch=Math.random()>.5?"ö":"Ö"),this.x=t,this.y=a}async kill(){await M(200+200*this.type,25,100),this.x=-1,this.y=-1}getChar(){return this.type===o.Player?s.T[B.Invisible]>0?d:P[this.type]:this.ch}getSpeed(){return this.type===o.Player?s.T[B.SlowTime]>0?10:1:s.T[B.SpeedTime]>0?ce:this.speed}}var B=(e=>(e[e.SlowTime=4]="SlowTime",e[e.Invisible=5]="Invisible",e[e.SpeedTime=6]="SpeedTime",e[e.FreezeTime=7]="FreezeTime",e[e.StatueGemDrain=9]="StatueGemDrain",e))(B||{});const s=qt(),Gt={},Ht={};function qt(){return{player:new ge(o.Player,0,0),entities:[],PF:[],foundSet:new Set,T:[0,0,0,0,4,5,6,7,0,0],levelIndex:1,level:null,score:0,gems:20,whips:0,teleports:0,keys:0,whipPower:2,bonus:0,genNum:0,difficulty:8,paused:!1,done:!1,clockScale:da}}function Zt(){Object.assign(s,qt())}function ci(){Object.assign(Gt,s)}function hi(){Object.assign(Ht,Gt)}function ui(){Object.assign(s,Ht)}function he(e){for(var t=[],a=1;a<arguments.length;a++)t[a-1]=arguments[a];var n=Array.from(typeof e=="string"?[e]:e);n[n.length-1]=n[n.length-1].replace(/\r?\n([\t ]*)$/,"");var i=n.reduce(function(h,c){var u=c.match(/\n([\t ]+|(?!\s).)/g);return u?h.concat(u.map(function(y){var $,_;return(_=($=y.match(/[\t ]/g))===null||$===void 0?void 0:$.length)!==null&&_!==void 0?_:0})):h},[]);if(i.length){var r=new RegExp(`
[	 ]{`+Math.min.apply(Math,i)+"}","g");n=n.map(function(h){return h.replace(r,`
`)})}n[0]=n[0].replace(/^\r?\n/,"");var X=n[0];return t.forEach(function(h,c){var u=X.match(/(?:^|\n)( *)$/),y=u?u[1]:"",$=h;typeof h=="string"&&h.includes(`
`)&&($=String(h).split(`
`).map(function(_,S){return S===0?_:""+y+_}).join(`
`)),X+=$+n[c+1]}),X}function jt(){W(70,0,"Score",l.Yellow,l.Blue),W(70,3,"Level",l.Yellow,l.Blue),W(70,6,"Gems",l.Yellow,l.Blue),W(70,9,"Whips",l.Yellow,l.Blue),W(68,12,"Teleports",l.Yellow,l.Blue),W(70,15,"Keys",l.Yellow,l.Blue);const[t,a]=Ut(l.HighIntensityWhite,l.Blue);W(69,18,"OPTIONS",t,l.Red),W(69,19,`%c{${t}}W%c{}hip`,l.White,a),W(69,20,`%c{${t}}T%c{}eleport`,l.White,a),W(69,21,`%c{${t}}P%c{}ause`,l.White,a),W(69,22,`%c{${t}}Q%c{}uit`,l.White,a),W(69,23,`%c{${t}}S%c{}ave`,l.White,a),W(69,24,`%c{${t}}R%c{}estore`,l.White,a)}function te(){const e=s.whipPower>2?`${s.whips}+${s.whipPower-2}`:s.whips.toString(),t=4,a=7,n=!s.paused&&s.gems<10?l.Red|16:l.Red,i=69;W(i,1,be((s.score*10).toString(),t+1,a),l.Red,l.Grey),W(i,4,be(s.levelIndex.toString(),t,a),l.Red,l.Grey),W(i,7,be(s.gems.toString(),t+1,a),n,l.Grey),W(i,10,be(e,t,a),l.Red,l.Grey),W(i,13,be(s.teleports.toString(),t,a),l.Red,l.Grey),W(i,16,be(s.keys.toString(),t,a),l.Red,l.Grey)}function dt(){const e=P[o.Border],[t,a]=G[o.Border];for(let n=De-1;n<=Se+1;n++)$e(n,0,e,t,a),$e(n,Le+1,e,t,a);for(let n=Ce-1;n<=Le+1;n++)$e(0,n,e,t,a),$e(Se+1,n,e,t,a)}async function b(e){if(!e)return"";const t=(Se-e.length)/2,a=Le+1;s.paused=!0;const n=await Xt(()=>{W(t,a,e,m.getUniformInt(1,15),l.Black)});return dt(),s.paused=!1,n}async function Ri(){return ue(l.Black),Z(20,Pe,l.Yellow),Z(21,"Original Level Design (C) 1990 Scott Miller",l.Yellow),Z(Xe-1,"Press any key to continue.",l.HighIntensityWhite),Xt(async()=>{W(5,5,he`
      ███     ███     ██████████         ███████████        █████████████  (R)
      ███░░  ███░░░   ███░░░░░███░      ███░░░░░░░███░        ░░░░░░████░░░
      ███░░ ███░░░    ███░░   ███░░     ███░░     ███░░            ███░░░░
      ███░░███░░░     ███░░   ███░░    ███░░░      ███░           ███░░░
      ███░███░░░      ██████████░░░    ███░░       ███░░         ███░░░
      ██████░░░       ███░░███░░░░     ███░░       ███░░        ███░░░
      ███░███░        ███░░ ███░        ███░      ███░░░       ███░░░
      ███░░███░       ███░░  ███░       ███░░     ███░░      ████░░░
      ███░░ ███░      ███░░   ███░       ███████████░░░     █████████████
      ███░░  ███░       ░░░     ░░░        ░░░░░░░░░░░        ░░░░░░░░░░░░░
      ███░░   ███░
      ███░░    ███████████████████████████████████████████████████████████
      ░░░      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    `,m.getUniformInt(1,15)),await L(500)})}async function fi(){ue(l.Black),Z(0,Pe,l.Yellow,l.Black),Z(1,"INSTRUCTIONS",l.HighIntensityWhite,l.Black),Z(2,"------------",l.HighIntensityWhite,l.Black),W(0,5,he`
    The dungeons contain dozens of treasures,  spells,  traps and other mysteries.
  Touching an object for the first time will reveal a little of its identity,  but
  it will be left to you to decide how best to use it or avoid it.                
    When a creature touches you it will vanish,  taking with it a few of your gems
  that you have collected. If you have no gems then the creature will instead take
  your life!  Whips can be used to kill nearby creatures, but they are better used
  to smash through crumbled walls and forest terrain.`,l.LightBlue,l.Black),W(3,13,he`
    You can use these        u i o    7 8 9
    cursor keys to            \\|/      \\|/     w or 5: Whip
    move your man,           j- -k    4- -6         T: Teleport
    and the four              /|\\      /|\\
    normal cursor keys       n m ,    1 2 3`,l.LightBlue,l.Black),W(0,19,he`
    It's a good idea to save (S) your game at every new level,  therefore,  if you
    die you can easily restore (R) the game at that level and try again.`,l.LightBlue,l.Black),Z(22,"Have fun and good-luck...",l.HighIntensityWhite,l.Black),Z(Xe-1,"Press any key to continue.",l.HighIntensityWhite,l.Black),await Ye()}async function pi(){ue(l.Black),Z(1,Pe,l.Yellow),W(2,4,he`
    The original Kroz games were created by Scott Miller and published
    by Apogee Software. The original Kroz games were released in the
    late 1980s and early 1990s.`,l.White),Z(Xe-1,"Press any key to continue.",l.HighIntensityWhite,l.Black),await Ye(),Ve(),W(2,9,he`
    This game is a tribute to the original Kroz series of games and completly
    open-source.  If you enjoy this game you are asked by the author to 
    please add a star to the github repo at
    https://github.com/Hypercubed/kroz.`,l.White),Z(Xe-1,"Press any key to continue.",l.HighIntensityWhite,l.Black),await Ye(),Ve(),W(2,14,he`
    Better yet, contribute to the game yourself; or maybe fork it and add your
    own levels.  That might make a nice 7DRL challenge entry.`,l.White),Z(Xe-1,"Press any key to continue.",l.HighIntensityWhite,l.Black),await Ye(),Ve(),W(10,18,"Thank you and enjoy the game.  -- Hypercubed"),Z(Xe-1,"Press any key to continue.",l.HighIntensityWhite,l.Black),await Ye(),Ve()}function be(e,t,a){return e.padStart(t,d).padEnd(a,d)}const di=`
                                                       #1#1#1#1#
 ####### ##whip W W W                  ~~~~~   ewall## # # # # #
  3 3  # #chest C C C                  #####   wall### # # # # #
   3   # ##nugg * * *   ñ4444499999ö   RRRRR   river## # # # # #
  3 3  # ###gem + + +   ò5555588888õ   /////   forest# # # # # #
 ####### ##door D D D   ó6666677777ô   ♣♣♣♣♣   tree### #X#X#X#X#
         ##tele T T T    :::::#####    VVVVV   lava### #2#2#2#2#
         ###key K K K                  =====   pit#### # # # # #
         #power Q Q Q                  XXXXX   block## # # # # #
 #######                                               # # # # #
  2 2  # create ] ] ]         P                        # # # # #
   2   # showge & & &                                  #X#X#X#X#
  2 2  #                  XXXXXXXXXXX                  #3#3#3#3#
 #######                  XXXXXXXXXXX   0 0 0   rock## # # # # #
         ###zap % % %     XXXXXXXXXXX   R L =          # # # # #
         ##slow S S S     XXXXXXXXXXX   < [ | " kroz## # # # # #
         #speed F F F     XXXXXXXXXXX                  # # # # #
 ####### #freez Z Z Z          B        U U U   tunnel #X#X#X#X#
  1 1  # ###inv I I I     ###bomb####                  #########
   1   # tablet ! ! !     #X]1 2 3AX#   . . .   traps#          
  1 1  # #amule ƒ ƒ ƒ     XXXXXXXXXXX   & & &   show##  S       
 ####### ##tome A A A     XDZ/EWLCSVX   E E E   quake#    F     
                          XXXXXXXXXXX   T T T               Z   
`;async function gi(){}const Mi={id:"Debug",map:di,onLevelStart:gi,tabletMessage:"This is a debug level"},mi=`
//♣///////♣///♣////////♣////////♣//#the#lost#adventures#of#kroz#
//♣//////////////♣//♣////////♣////////♣///♣/♣♣/♣♣/♣/♣♣/♣♣♣♣♣♣♣/♣
♣###your#hut###////♣///♣/////////♣/////♣/♣♣//♣♣/♣♣/♣♣♣♣♣♣♣♣♣♣♣♣♣
/##           D---/////////♣//♣///♣//♣/♣/♣/♣/♣/♣/♣/♣♣♣♣♣♣♣###♣♣♣
/##  P ####  ##///-♣//♣//♣/----♣///♣////♣//♣//RRR/♣♣♣♣♣♣♣##L##♣♣
/##      K#**##/♣♣/-//--/♣-♣//♣--♣//♣//♣////RRRRR//♣♣♣♣♣♣♣#0#♣♣♣
♣##############/////--♣/--//♣////-///////♣////RRRRRRR/♣♣♣♣#!#♣♣♣
////♣♣///♣/♣♣///♣//♣//////////♣//♣---♣//♣////RRRRRR/♣♣/♣♣♣♣-♣♣♣♣
/♣//////♣/////♣////////♣///♣/////////--/////♣///RRRRR♣♣♣♣♣♣♣-♣♣♣
///////♣////////♣///////////////♣/////♣---/////RRRRR/♣/♣♣♣♣♣♣-♣♣
////♣/////♣♣♣//♣////♣/////♣//////♣////////-//♣/♣/RRRRRR♣/♣♣♣-♣♣♣
/////////♣♣♣♣♣///♣////♣////////♣///♣///////-//♣///RRRR♣//♣/-♣/♣/
♣//////♣//♣♣////♣////////♣//♣//////////♣///-♣////RRRRRR♣♣/♣-/♣/♣
//♣♣//////♣/###storage###///////♣--//♣♣///-////RRRRRRRRR/♣/♣-/♣/
////////♣///##WWW-WWW-W##/♣////--//-//♣♣/-///♣RRRRRRRRR/♣/♣/-/♣/
/♣////////♣/##W-WWW-WW---------//♣//-----//♣///RRRRRRRR♣♣//♣-♣//
♣/////♣/////#############♣///♣-/♣♣♣/♣/♣♣/♣////RRRRRRRR//♣/♣/-//♣
///♣////♣//////♣♣////♣////♣///-////♣/♣♣/♣///♣RRRRRRR/♣/♣//♣-/♣//
/♣///♣/////♣////♣///♣//♣//♣////------♣///♣////♣////♣//--/♣-♣♣//♣
♣//♣///♣/♣//♣/♣/♣///♣//♣/♣///♣////♣//------♣/♣//♣///♣-♣/--//♣/♣/
/♣///♣////♣//♣///♣////♣///♣//♣/♣////♣///♣/♣-----/♣♣/-/♣//♣/♣//♣/
♣//♣////♣/♣///♣//♣///♣/♣///♣//♣/////♣///♣/////♣/----♣♣//♣///♣//♣
#by#scott#miller#♣///♣/////♣/♣////♣////♣////♣//♣//♣/♣//♣/♣♣///♣ü
`,wi={id:"Lost1",map:mi,tabletMessage:"Once again you uncover the hidden tunnel leading to Kroz!"},yi=`
XXXXXXXXXXXXXXXXXXX#XXXXXXXXXXXXXXXXXXXXXXXX#XXXXXXXXX### P ###X
XXXXX##XXXXXXXXXXXXXXXXXXX##XXXXXXXXXXXXXXXXXXXXXXXXXXXX##  ##XX
XXXXXXXXXXXXXXX&-XXXXXXXXXXXXXXXXXX#XXXXXXXXXXXXXXXX#XXXXX#  #XX
#XXXXXXXXXXXXXXXX-XXXX--XXXXXXXXXXXXXXXX##XXXXXXXXXXXXXXXX  XXXX
XXXXXXXXX#XXXXXXXX-XX-XX-XXXXXXX#XXXXXXXXXXXXXXXXXXXXX##   #XXXX
XXX#XXXXXXXXXXX#XXX--XX#X--XXXXXXXXX#XXXXX#XXXX##XXXX##  ##XXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXX--XXXXXXXXXXXXXXXXXXXXXXX##XX##XXXXXX
XXXXXXXXXXX##XXXXXXXXXXXXX#XX-XXXXXXXXXXXXXXXXXXXXX##  ##XXXX##X
XXXXX#XXXXXXXXXXXX#XXXXXXXXXXX--XXXX##XXXXXX#XXXXX##  ##XXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXX#XXXXXXX-#XXXXXXXXXXXXX      XXXX#XXXXXX
XXXXX##XXXXXX#XXXXXXX#XXXXXXXXXX#X##XXXXX       XXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXX##XXX#   0    XXXXXXXX!XXXXXXXXXXXXX
XXXXXXXXXXXXXX#XXXXXXX===XXXXXXX#  XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXX#XXXXXXXXXXXX=======XXXXX  XXXXXXXX#XXXXX#XXXXXXXXXX##XXX
XXXXXXXXXXXXXXXXX=========       XX=====XXXXXXXXXXXXX#XXXXXXXXXX
XX#XXXXXXX##XXX==========  ===========XXXXXXXXXXXXXXXXX#XXXXXXXX
XXXXXXXXXXXXXX==========  ===========XXXXXXXXX##XXXXXXXXXXXXXXXX
XXXX#XXXXXXX             ===========XX#XXXXXXXXXXXXXXXXXXXXX#XXX
XXXXXXXX    XX#XXXX================XXXXXXXX#XXXXXX#XXXXXXXXXXXXX
XXX     XX#XXXXXXXXXX===========XXXXXXXXXXXXXXXXXXXX##the#secret
XXXXXXXXXXXXXXXXXX#XXXXXX=====XXXXXXXXXX#XXXXXXXXXXX#tunnel#into
X  XX#XXXXXX##XXXXXXXXXXXXXXXXXX#XXXXXXXXXXXXXXXXXXX#the#kingdom
LLXXXXXX#XXXXXXXXXXXXX#XXXXXXXXXXXXXX#4XXXXXX##XXXXX#####of#kroz
`;async function bi(){P[o.Stairs]=d,G[o.Stairs]=G[o.Floor]}const Yi={id:"Lost2",map:yi,onLevelStart:bi,tabletMessage:"Warning to all Adventurers:  No one returns from Kroz!"},$i=`
                                   1                        1  &
 ####shop####         1                                       ‘ 
 ##++++++++##                            1                      
 ##++++++++##                                 ##4444444444444444
 #####OO#####                                 ##   1   1   1  1 
                          ###spells###        ## 1 1  1  1   1  
     1                    ##ñEF‘Tò @##     1  ##    1   1  1  1 
                          ##I@ ‘S  T##        ##11   1 1    1   
                     1    ##ZóT‘  ] ##        ##   1   1 1  1 1 
                          #########X##        ## 1   1  1  1 1  
@@         1                                  ##1 1    1  1    1
1@W                            P              ## 1  1 1 1  1 1 1
1@W                                           ##1  11  1 1   1  
1@W   1                                     1 ##  1   1     1   
1@W                 1                         ##1    1  1  1  1 
1@W                                     #.#OXX## 1 1  1   1    1
1@W          ###lair#of#kroz###         #.#XOX##1    1  1   1 1 
1@W          77------------ôK##         #.#XXO##  1 1  1   1   1
1@W          ####1111111111####         #.#XOX## 1 1  1 1 1   1 
1@W    1      Z##############           #H#X!X##1  1 1  1  1 1  
1@W                                     ######## 1   1 1  1   1 
1@@@@@@@@@@@@@@@                  ########@       1   1   1 1  1
111111111111111@                1 ##LLWWWD@         1   1    1 1
`;async function _i(){}const Si={id:"Lost4",map:$i,onLevelStart:_i,tabletMessage:"Adventurer, try the top right corner if you desire."},Wi=`
66666666666666666666----------------------------66WW---I-------K
-----------D D D-----66666666666666666666666666(6666666666666---
-666666666666666666-((((((((((((((((22222222222(-----------666-6
-666666666666666666-66((((((((((((((22222222222(6-66666666-----6
-66666666666066WYY6-66VVVVVVVVVVVVVVVVVVVVVVVVV66-66666666666666
------------0B6WYY--66T-W-W-*-W-W-C-W-W-*-W-W-T66-66666666663666
-66666666666066WYY6666666666666666666666666666666’66666666636666
-MMMMM6666666666666666666666666666666666666666666-66666666366666
-MMMMM............................3!66222222266----$$$$$$$666666
-MMMMM6666666666666666666666666666666622222266~~~~~~~~~~~~-66666
-MMMMM666666666666666666666666666666662222266------------~~-6666
-MMMMM............................3H66222266-~~~~~~~~~~~~-~~-666
-MMMMM6666666666666666666666666666666622266-~~----------~~-~~-66
-66666666666666666666666666666666666@@@@66-~~-~~~~~~~~~~-~~-~~-6
----666-OWOWOWOWOWOWOWOWOWO 66666666@66@666-~~-~~K’-----~~-~~-66
-66-666-6666666666666666666 66666666@66-6666-~~-~~~~~~~~~-~~-666
-66F666-666T-3)K)3-T66           666@66-66666-~~---------~~-666C
-66F666-666T-3)))3-T66     G     666-66-666666-~~~~~~~~~~~-6666-
-66666---666666-666666           666-66-6633666-----------666333
-66YYYYYYYYY666-66666666666-66666666-66-66--6666666666666-666-66
--     P    666-66+------66-66-------66----Y--D-D-D-LL 66-666-66
666---------666-66666666-66-66Y66666-66666666666666666666-666-66
666222222222666-------------66---Z66--------------------------66`,ki={id:"Lost11",map:Wi,tabletMessage:"The tunnel below contains a magic spell."},vi=`
K----------------------------YYY!YYY---------------------------K
-66666666666666666666666666666666666666666666666666666666666666-
-66ñ                           —+          DTDTDTDTLL 66   -"66-
-66                                        6666666666666   --66-
-6666666666666666666666666666666666                          66-
-66<-     )                   66 ..                          66-
-66--     #############       66 66      ##$$$$$$$$$$$##     66-
-66      ##11111111111##      66 66      ###MMMMMMMMM###     66-
-66     ##1111111111111(      66 66      ####MMMMMMM####     66-
-66     ##1111111111111(      66(66      ##W##MMMMM##W##     66-
-66      ##11111111111(       66 66      ##WW##MMM##WW##     66-
-44)))))))############(       66P66      ##WWW##&##WWW##     55-
-66      )11111111111##       66 66      ##....###....##     66-
-66     )1111111111111##      66 66      ##     #     ##     66-
-66     )1111111111111##      66 66      ##     —     ##     66-
-66     ##11111111111##       66 66      ##           ##     66-
-66      #############        66 66      ##]]]]]]]]]]]##   --66-
-66                           .. 66                        -[66-
-66                           666666666666666666666666666666666-
-66--   6666666666666         +—                             66-
-66|-   66 LLWDWDWDWD                                       ò66-
-66666666666666666666666666666666666666666666666666666666666666-
K----------------------------3333333---------------------------K`;async function Oi(){P[o.Create]=d,P[o.MBlock]=d}const Fi={id:"Lost18",map:vi,onLevelStart:Oi,tabletMessage:'Adventurer, check the "Valley of the M"!'},xi=`
<33333333333333333333333333333333333333333333333333333333333333[
3                                                              3
3                                                              3
3                                                              3
3           YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY           3
3           YC     F        F   Z         W    F òKY           3
3           Y          W           F     F       òòY           3
3           Y    F            òòòòò          F   F Y           3
3           YW         F      ò   ò  F             Y           3
3           Y                 ò P ò             W  Y           3
3           Y    W F      F   òF  ò   F    F       Y           3
3           Y                 òòòòò   W        F   Y           3
3           Y F              F                     Y           3
3           Yòò       F   W       F       F      F Y           3
3           YKò F               Z           W     CY           3
3           YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY           3
3                                                              3
3                                                              3
3                                                              3
"33333333333333333333333333333333333333333333333333333333333333|
5##############################444#############################5
--~~-~--~-~--~~-~~--~--~-D-D-++-L-WW-D-D-~--~--~-~~-~--~~-~~-~--
-~--~-~~-~-~~--~--~~-~~--D-D-++ñLñWW-D-D--~~-~~-~--~-~~--~--~-~-`;async function Pi(){P[o.OWall1]=d,P[o.OWall2]=d,P[o.OWall3]=d}const Li={id:"Lost20",map:xi,onLevelStart:Pi},Di=`
::::::::::::::::::::::::::::::::::::::::::::::::####amulet####::
:###########::::::::::::::::::::::::::::::::::::#55]-----]---#::
:#         #::::::::::::::::::::::::::::::::::::#ƒ5----]--L-ò#::
:#    P   HOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO::::::#55-]------]-#::
:#K        #::::::O::::::::::::-:::::::::O::::::###D##########::
:###########::::::O::::::::::::-:::::::::O:::::::::O::::::::::::
::::::::::::::::::O::::::::::::-:::::::::O:::::::::O::-----:::::
::::::::::::::::::O::::::::::::-:::::::::O:::::::::O::+++:-:::::
::::::::::::::::::O::::::::::::-:::::::::O:::::::::O::+++:-:::::
::::::::::::::::::O::::::::::::-:::::::::O:::::::::O::::::-:::::
:::::::::::OOOOOOOO::::::::::::-::::#####D###::::::O::::::-:::::
:::::::::::O:::::::::::::::::::-::::#K;     #::::::OOOOO::-:::::
:::::::::::O:::::::::::::::::::-::::#;;     #::::::::::O::-:::::
:::::######D#############::::::-::::# W     #::::::::::O::-:::::
:::::#!---...----T---I--#::::::-::::#       #::::::::::O::-:::::
:::::#----K----F---’---ñ#::::::-::::#     * #::::::::::O::-:::::
:::::#-S---I----------Z-#::::::-::::#       #::::::::::O::-:::::
:::::####################::::::-::::#   W   #::::::::::O::-:::::
:::::::::::::::::::::::::::::::-::::#       #::::::::::O::-:::::
:::::::::::::::::::::::::::::::-::::#4444444#::::::::::O::-:::::
::::::::::::::::::::::::+++::::-::::#K;-----DOOOOOOOOOOOOOOOOO::
###rogue###:::::::::::::+++-----::::#########:::::::::::::::::::
#was#hereÃ#:::::::::::::::::::::::::::::::::::::::::::::::::::::
`;async function Ci(){P[o.Create]=d,P[o.Gem]=d}async function Ti(){await b(`No one has ever made it to the ${s.levelIndex} level!`),await b("You have shown exceptional skills to reach this far..."),await b("Therefore I grant you the power to see...");for(let e=0;e<=T;e++)for(let t=0;t<=I;t++)s.PF[e][t]===o.IWall&&(await M(e*t,1,10),s.PF[e][t]=o.OWall3,x(e,t,o.OWall3));await b("Behold...your path awaits...")}const Ii={id:"Lost26",map:Di,onLevelStart:Ci,tabletMessage:Ti},Bi="Lost30",Ai=`
1111144       ##C######locksmith#shoppe######C##         RRRRRRR
1111144       ##]##K#K#K#K#K#-3-3#K#K#K#K#K##]##        RRRRRRRñ
1111144          ##:::::::::######::::::::;##         RRRRRRRCYY
1111144          ##------------------------##     666RRRRRRRR66 
1111144          #############--#############     6666666666666 
1111144                                           HOOOOOOOOH    
1111144                                        6666666666666    
1111144                                        66RRRRRRR6666    
1111144                                        RRRRRRR          
1111144                                      RRRRRR           YY
1111144               P                    RRRRRR             YZ
1111144                                 RRRRRRRRRR            YY
1111144                              RRRRR333RRRRR              
1111144                             RRR3333333RRRRR             
@@@@@##                           RRR3333333333RRRRR            
MMMMM##                           RRR333333333RRRRR             
)))))##                          RRR33333333RRRRR               
MMMMM##                        RRRR333333RRRRRRR        DDDDDDDD
(((((##                       RRRR3LL3RRRRRRRR          DDDDDDDD
MMMMM##                      RRRRRRRRRRRRRR             DDDDDDDD
$$$$$##                     RRRRRRRRRRRR                DDDD7777
MMMMM##                     RRRRRRRR                    DDDD77ôô
]]K]]##“                   RRRRRRK]                     DDDD77ô!
`;async function Vi(){P[o.Create]=d}async function Ei(){await Je(),await b('"If goodness is in my heart, that which flows shall..."');for(let e=0;e<=T;e++)for(let t=0;t<=I;t++)s.PF[e][t]===o.River&&(await M(e*t,50,10),s.PF[e][t]=o.Nugget,x(e,t,o.Nugget));await b('"...Turn to Gold!"')}const Ki={id:Bi,map:Ai,onLevelStart:Vi,tabletMessage:Ei},Ui=`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~W-----------E----~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~------------E----~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~----~~~~~~~~~----~~~~~~~~~~W---E------------------P
~~~~~~~~~~~~~----~~~~~~~~~----~~~~~~~~~~----E-------------------
~~~~~~~~~~~~~----~~~~~~~~~----~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~----~~~~~~~~~----~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~
~~~~W------------~~~~~~~~~----~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~
~~~~-------------~~~~~~~~~----~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~
~~~~----~~~~~~~~~~~~~~~~~~----~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~
~~~~----~~~~~~~~~~~~~~~~~~W---~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~
~~~~----~~~~~~~~~~~~~~~~~~----~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~
~~~~----~~~~~~~~~~~~~~~~~~----~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~
~~~~----~~~~~~~~~~~~~~~~~~----~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~
~~~~----~~~~~~~~~~~~~~~~~~----~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~
~~~~----~~~~~~~~~~~~~~~~~~----~~~~~~~~~~--------------<~~~~~~~~~
~~~~----~~~~~~~~~~~~~~~~~~----~~~~~~~~~~W-------------[~~~~~~~~~
~~~~----~~~~~~~~~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~~---|~~~~~~~~~
~~~~----~~~~~~~~~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~~---"~~~~~~~~~
~~~~---W~~~~~~~~~~~~~~~~~~----~~~~~~~~~~~~~~~~~~~~~----~~~~~~~~~
~~~~----~~~~~~~~~~~~~~~~~~-----------------------------~~~~~~~~~
~~~~----~~~~~~~~~~~~~~~~~~W-------------------------W--~~~~~~~~~
~~~~LLLL~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`,zi={id:"Lost34",map:Ui},Ni=`
###########klose#enkounters#of#the#krazy#kubikal#kindÃ##########
3                               P                              3
##-##############:########:#######:###########:##############:##
XXXXXXXXX##~W~W~W~W~##‘-M----M.--$$$$$$$$$-9/-/♣--♣-|##---’ò’---
---------##*~*~*~*~*##-‘.-”M-”-##$$$$$$$$$##♣--/-♣-/♣##YYYYYYYYY
MMMMMMMMM##~W~W~W~W~##M--‘-.-M-##111111111##-/-♣/--/-##(((((((((
)))))))))##*~*~*~*~*##.”-.-”-.”##222222222##/♣--♣-♣-/##(((((((((
C))))))))--~W~W~W~W~##ó.-”--‘-M##333333333##ü-//-♣-/-9-(((((((((
###################-################################9##55555555-
“-“-“-“-“##YYYYYYYYY##222222222------0---W##RRRRRRRRR##MMMMMMMMM
-----------YYYYYYYYY##@@@@@@@@@##---000---##RXXXXXXXR##MMMMMMMMM
XXXXXXXXX##YYYYYYYYY##@@@@@@@@@##--00G00--##RXXXKXXXR##MMMMMMMMM
---------##YYYYYYYYY##@@XXX@@@@##---000---##RXXXXXXXR##MMMMMMMMM
’’’’’’’’’##YYYYYYYYK##@@XZX@@@@##----0---W##RRRRRRRRR##MMMMMMMMK
-#####################-##########ô##################H##Z########
~-~[~-~-~##WWW......à1:1:1:1:1:##-773C7--7##=--=I==-=##ááááááY0"
-~-~-~-~-##WWW......##1:1:1:1:1##7-777-77-##!==-=--==##ááááááY00
~-~-~-~-~##.........##:1:1:1:1:##-77--77-7##=======-=##ááááááYYY
-~-~-~-~-##.........##1:1:1:1:1##7-7-77-77##-==-=-==I##ááááááááá
K-~-~-~-~-à..<......##:1:1:1:1ñ##77-7777---I=--=-=--=##222222222
############################################################44##
LL---V--V-VV-V--VV---D-----D--’--D--”--D--66333333333333333-WWWW
LL--V-VV-V--V-VV--V--D-----D--”--D--’--D--66YYYYYYYYYYYYYYYYYYYY
`;async function Gi(){await Je(),await b('"Barriers of water, like barriers in life, can always be..."');for(let e=0;e<=T;e++)for(let t=0;t<=I;t++)s.PF[e][t]===o.River&&(await M(e*t,50,10),s.PF[e][t]=o.Block,x(e,t,o.Block));await b('"...Overcome!"')}const Hi={id:"Lost42",map:Ni,tabletMessage:Gi},qi=`
----------àHT66-;K-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX)-- 66111ñ111--
-66666666666666-66))))))))))))))))))))))))))))))))66 6611111116-
----------66----662222222222222222222222222222222266 6611111116‘
66ààààà66-66-66-66((((((((((((((((((((((((((((((((66 66666-6666-
661111166-66”66--(22222222222222222222222222222222--       YY®6<
666666666-66-666666666666666666666666666666666666666 66666-66666
----•--------66666>;S---622222222222222222222222662YWY2666-66666
I6666666666666666666666-6@@@@@@@@@@@@@@@@@@@@@@@662YPY266W6666//
O:OO:::O:OO:66’-–-’66K@@@@                      662YWY26W666///♣
:O::O:O:O::O66-LLL-666666@@@@@@@@@@@@@@@@@@@@   6666 666666//♣"♣
:::::O::::O:66DDDDD6666662222222222222222222@        66666//♣♣♣♣
:OOO::::O::O66DDDDD6666666666666666666666666666666666666///♣♣♣♣♣
O:::O:OO:O:O664444466666666666666666666666666666---6666///♣♣♣U♣♣
:O[66O66::O:6666666-1-1-1-1-1-1-1-1-1-1-1-1-1-1--U-666///♣♣♣♣♣♣♣
RRRR6-6RRRRRRR6666666666666666666666666666666666---66////♣♣♣♣♣♣♣
RRRR6-6RRRRRRRRRRRRRRRRRRRRRRRRRQX.X.X.X.X.X.X.X6666////♣♣♣♣♣♣♣♣
?]]66-66]]RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR66-66♣
-------------------$$$$$$$$•RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR6-6RR
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$•RRRRR6-6RR
WWWWWWWWWW$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$66-66+
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
KMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM|MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
`,Zi={id:"Lost70",map:qi},ji=`
###<@@@@@@@@@@@@@@@@@@@@@@@@@#one#@@@@@@@@@@@@@@@@@@@@@@@@@FK###
Kö###@@@@@@@@@@@@@@@@@@@@@@@@@;!:@@@@@@@@@@@@@@@@@@@@@@@@@@###$[
öö((###@@@@@@@@@@@@@@@@@@@@@@@:::@@@@@@@@@@@@@@@@@@@@@@@@###$$$$
((((((###@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@###$$$$$$
(((((((2###222222222222222222222222222222222222222222###2$$$$$$$
(((((((2((###@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@###$$2$$$$$$$
(((((((2((((###@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@###$$$$2$$$$$$$
(((((((2((((((###@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@###$$$$$$2$$$$$$$
DD##(((2((((((((###@@@@@@@@@@@@@@@@@@@@@@@@@@###$$$$$$$$2$$$####
DD#f(((2(((((((((##############77##############$$$$$$$$$2$$$##CC
DD#o(((2((((((((ö##2------------------------2##ô$$$$$$$$2$$$t#àà
DD#u(((2((((((((ö----------F---P----S--------88ô$$$$$$$$2$$$w#MM
&&#r(((2((((((((ö##2------------------------2##ô$$$$$$$$2$$$o#MM
LL##(((2(((((((((##############99##############$$$$$$$$$2$$$##MM
####(((2((((((((###)))))))))))õõõõ)))))))))))###$$$$$$$$2$$$##àà
(((((((2((((((###))))))))))))))))))))))))))))))###$$$$$$2$$$$$$$
(((((((2((((###))))))))))))))))))))))))))))))))))###$$$$2$$$$$$$
(((((((2((###))))))))))))))))))))))))))))))))))))))###$$2$$$$$$$
(((((((2###))))))))))))))))))))))))))))))))))))))))))###2$$$$$$$
((((((###2222222222222222222222222222222222222222222222###$$$$$$
((((###))))))))))))))))))))))))))))))))))))))))))))))))))###$$ôô
"(###))))))))))))))))))))))))))))))))))))))))))))))))))))))###ôK
###Kõ)))))))))))))))))))))))#three#))))))))))))))))))))))))F|###
`,Qi={id:"Lost46",map:ji,tabletMessage:"Follow the sequence if you wish to be successful."},Ji=`
##################RRRRRRRRRRR#the#swamp#RRRRRRR-♣♣ü♣♣♣♣/♣♣♣♣♣♣♣C
LL–D‘D“D--VVVV--44----------------------------RR-♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣
LL‘D”D‘D--VVVV--44--RRRRRRRRRRRRRRRRRRRRRRRR--RRR-/♣♣♣♣♣♣♣♣♣U♣♣♣
##################RRRR-------------------------RRR-♣♣♣♣/♣♣♣♣♣♣♣♣
RRRRRRRRRRRRRRRRRRRRRR--RRRRRRRRRRRRRRRRRRRRK))RRRR--♣♣♣♣♣♣♣♣♣♣♣
R-----RRR-------R----)))RR)))))))3)3)3)3)3)3)3)3)3RRR--♣♣♣♣♣♣♣♣♣
R-RRR“RR-RRRRRRR-RRR-RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR--/♣♣♣/♣ü
R-RR-RR-RRR♣♣♣RRR-RRR--------------------------•-------RR--♣♣♣♣♣
R-RRRR-RR♣♣♣K♣♣RRR-RR-RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR--♣♣♣
R-RRR-RRRR♣♣♣♣♣♣RRR-RR------------Z-8’-999999999999ö--RRRRRRR--♣
R-RR-RRRR♣♣♣♣♣♣ü♣RR-RRR-RRRRRRRRRRRRR8-111111111111RRR-----RRRR-
R---RRRRRR-♣♣♣RRRR-RRRRRFRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR-RRRR
RRRR-RRRRR-RRRRRR-RRRS(((((+((((((((((((((((((K++(3RRRRRRRRR-RRR
RRRRR-RRRRããRRRR-RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR*R.R*RRR-RR
RRRRRRTRRR1R-RR-RRR@@@@@@@RRRRRRRRRRRRRRRRRR-----------’-óRRRñRR
###RRRRRR11RR--RRRR@@RRRRFRR-66----H----------RRRRRRR*R.R*RRRRRR
77###RRR111RR--RR*F@@@22@WRR-RR-RRORRRRRRRRRRRRRRRRRRRRRRRRRRR  
7777###RR11RR--RR*F@@@22@WRR-RR-RRORR                          P
77777###RR1RR--RR*F@@@22@WRR-RR-RRORR  RRRRRRRRR-RRRRRRRRRRRRR  
77!777###RRRR--RR*F@@@22@WRR-RR-RR>RRFSRRRRRRRRRàRRRRRRRRRRRRRRR
7777777##RRRR--RR*F@@@22@WRR-RR-RRRRRàààààààààà3333333333Càààààà
77777777##RRR--RRRRFFRRRRRRR-RR-RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR--
U7777777##RRR----------------RR---------------------------------
`,en={id:"Lost48",map:Ji},tn=`
‘  ]  ‘]‘   ]‘‘] ”]]–  ‘‘‘]‘‘” ] – ‘    ‘]‘‘         –]‘”‘] ‘---
 ‘– ‘] ‘ ”‘] ‘– ‘ ]‘ ‘‘ ]”‘–] ‘ ‘ ‘ ]‘‘” ]– ‘‘]‘‘–]‘” ‘]‘‘ ‘ -P-
  –‘‘]‘ ”‘] –‘ ‘] ‘ ‘‘]”ñ –‘] ‘‘‘]‘–”]‘‘ ‘ ]‘‘    –] ‘”‘] ‘‘‘---
–‘ ‘]”‘‘]‘ ‘–]‘ ‘” ]‘‘‘]–‘ ‘]‘   ”‘]‘‘–  ] ‘‘ ‘]”‘  ‘]‘–‘] ‘‘”]‘
‘]–  ‘‘]‘‘” ]‘ –‘]‘‘  ‘]‘” ‘]–‘‘] ‘‘‘] ”‘– ]‘‘   ‘]‘‘”]‘–‘]  ‘‘‘
‘‘–]” ‘‘]‘‘‘ ]‘ –”  ]‘  ‘‘] ‘‘‘] –‘”  ]‘‘‘ ]‘‘–]” ‘‘]   ‘‘‘]‘ –‘
”‘‘] ‘‘‘  ]–‘  ”] ‘‘‘]‘‘ –]‘ ‘‘ ]”‘ ‘]‘‘–]‘ ‘”]‘‘ ‘] ‘–‘ ]‘‘”] ‘
‘]‘ –‘  ]‘ ‘”]‘‘ ‘]–  ‘‘] ‘”‘  ]‘‘ ‘–]‘‘”]‘‘  ‘]‘‘  –]  ‘”‘]‘‘‘ 
–‘ ]‘ ”‘]‘‘     ‘]‘ –‘ ]”‘ ‘]‘‘–] ‘‘     ‘]”‘‘ ]‘‘–]‘ ‘”]‘  ‘‘ ]
‘ –] ‘‘‘ ]”‘‘]‘–‘] ‘‘”] ‘‘‘ ]–‘‘ ]‘ ‘”]‘‘ ‘–]‘‘ ‘‘]” ‘‘]‘ –‘ ]‘ 
 ‘” ]‘‘ ‘ – ] ‘ ‘‘] ‘”‘] ‘–‘ó]‘‘ ‘]‘ ”‘]–‘ ‘]‘‘ò‘]” ‘–]‘‘ ‘] ‘ ‘
]  ”–‘ ]‘‘ ‘ ] ‘   ‘–]”‘‘   ]‘‘‘]   ‘–”]‘‘‘    ]‘‘‘]     ‘–”] ‘‘
#####444############follow#the#bread#crumbs#####################
àààà#555#&àààààààààààààààààààààààààààààààààààààààà@MMMMMMMMK##LL
àààà66666ààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##“‘
àààààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##\`\`
àààààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##‘“
ààààààààààààààààààààààààà!àààààààààààààààààààààààà@MMMMMMMMM##\`\`
àààààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##“‘
àààààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##--
àààààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##--
00àààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM##--
K0àààààààààààààààààààààààààààààààààààààààààààààààà@MMMMMMMMM66--
`;async function an(){P[o.Floor]="·",P[o.Create]=d}const nn={id:"Lost52",map:tn,onLevelStart:an,tabletMessage:"Up 4 steps, then left 16 steps."},on=`
##########K]K-WWWWñD          00%00         D’D”D‘&&LL##########
##VVVVVV############          00000    .    ############VVVVVV##
##VVVVVV44                                            44VVVVVV##
##VVVVVV44      .      .                        .     44VVVVVV##
#####44444                               )            44444#####
MMMM(                           P  .                       )MMMM
MMMM(                   (                                  )MMMM
MMMM(         .                                   (        )MMMM
MMMM(                                 .                    )MMMM
MMMM(                      44444444444                 .   )MMMM
MMMM(                      44VVVVVVV44                     )MMMM
CMMM(   .                  44VVVGVVV44       .             )MMMC
MMMM(          )       .   44VVVVVVV44                     )MMMM
MMMM(                      44444444444                     )MMMM
MMMM(                                           )          )MMMM
MMMM(                                   .                  )MMMM
MMMM(     .       .                                .       )MMMM
MMMM(                                                      )MMMM
#####44444                     .            .         44444#####
##VVVVVV44         (                     (            44VVVVVV##
##VVVVVV44                 )                          44VVVVVV##
##VVVVVV############          00000  .      ############VVVVVV##
##########K]-WWWWWWñ          00C00         D-D--K-K]K##########
`;async function sn(){P[o.Create]=d,P[o.MBlock]=d,P[o.OWall1]=d,P[o.OWall2]=d,P[o.OWall3]=d,P[o.Trap]=d}const rn={id:"Lost59",map:on,onLevelStart:sn},ln=`
     U--2--U--2--U--2--U--2--U--55-====-===--=====-===--==--=--=
 #######-#####-#####-#####-#######=-==-=-=-==--==-=-=-==--==-==-
 ######-B-###-B-###-B-###-B-######==--===-=====--===W==========-
 ########chamber#of#horror########======================-------=
 ##22222222222222222222222222##ó##=---=-=-=-==--==--=---========
 ##22222222222222222222222222222##-===-=-=-=--==-=-=-=====-----=
 ##22222222222222222222222########=-============-=-===----=====-
 ##2222222222222222222222266"0LL##-==-=-=-W-====-==---======---=
 ####-############################=--=-=-===-===-========---====
      ##---##ãOOOOOOOOO33333333!##=========-====-====----===-===
########---##H####################==----====-====-”--========--ò
<F  22##111##ãã333333##3333333-[##=-====-==-============--======
FF  22##âââ##ãã333333##3333333--##-===-==-==------=====-==-=--==
    22##YYY##ãã333333##333333333##-==-=-==-=======-===-====-==-=
 P  22##ááá##ã#########444444444##=--==-==W======-===-========-=
    22##111##        ##         ##=====-===------===-==---=-===-
    22##ààà######### ##   ##‘   ##=--==-============-=-===-=---=
    22##             ##   ‘##   ##-==W==-=====---===-==--=======
    22##   ~~~~~  ## ##   ##–   ##=-==-==-===-===--==-===W=----=
    22##   ~~%~~  ## ##   •##   ##==-==-==---==-===--==-==-====-
    22##   ~~0~~  ## ##   ##‘   ##===-=-======-=--====-=-=====-=
    22##ô  ~~0~~  ## ##   ‘##   ##=-=-==-=-==-==-=--==-=-==-===-
      77ô  ~~     ##      ##“   44-=-====-=--==|====--===--=---=
`;function Xn(){P[o.Fast]="☺"}async function cn(){await b("Walls that block your progress shall be removed..."),s.PF[s.player.x][s.player.y]=o.OSpell1,ea(0,0)}const hn={id:"Lost61",map:ln,onLevelStart:Xn,tabletMessage:cn},un=`
3333333333333333333333333333333333333333333333333333##C33à)))Fàó
4444444444444444444444444444444444444444444444444444##333à))F)àà
LL@@@@;@@@@@@@F@@;@@@@@@@@F@@@;@@@@@@@@@F@@@@@@@@@@@##333à))))F)
LL@;@@@@F@@;@@@@@@@@F@@;@@@@F@@@@@F@@@;@@@@@F@@@;@F@##333à)F))))
#########################@@@;@@@F@@;@@F@@@@F@@@F@@@@##333à)))F))
  æ        ááá      YY>##&@@@@F@;@@@F@@@F@@;@F@”””””##333à)F))))
88~  ææ##-##3á      YYY#########################ññññ##333à))))F)
Mõ~  æ3## ##3á              D‘‘F‘‘D77777777777##6666#####àFFFFFF
Mõ~  æ3##S##3ááááááááááá P  #######77777777777##ããããâ33##Tàààààà
Mõ~  æ3##F##33333333333á   +##’K’##77777777777##ããããâââ####YYY##
Mõ~ææææ#######################(((##77777777777--ããããããããããâããããã
Mõ~    ä333333333WWWä  ää999##’’’###############################
Mõ~    ääääääääääääää  ##MMM##(((##33333333333333333333333333333
Mõ~                   ’##MOM##(((##33333333333333333333333333333
Mõ~           —     #####OMO##’’’##33333333333333333333333333333
Mõ~               ää##K##MOM##(((##(((((((((((((((((((((((((((((
Mõ~   —          ää3##ä##OMO##((((((((((((((((((((((((((((((((((
Mõ~             ää33##-##MOM##(YY++YY((YYYYY+((+YYYY+(YYYYYYY(((
XX~            ää333##-##OMO##(YY+YY+((YY++YY((YY++YY(++++YY+(((
XX~ çççççç —  ää3333##’##MOM##(YYYY++((YYYYY+((YY++YY(+++YY++(((
XX~ ç3333ç    ä3333C##-##OUO##(YYYY++((YY+YY+((YY++YY(++YY+++(((
XX~ ##################-#######(YY+YY+((YY++YY((YY++YY(+YY++++(((
X!~     ççççç          äää~H##(YY++YY((YY++YY((+YYYY+(YYYYYYY((U
`;function Rn(){P[o.Fast]="☺"}async function fn(){await Je(),await b('"Tnarg yna rerutnevda ohw sevivrus siht raf..."');for(let e=0;e<=T;e++)for(let t=0;t<=I;t++)s.PF[e][t]===o.CWall1&&(await M(e*t,50,10),s.PF[e][t]=o.Nugget,x(e,t,o.Nugget));await b('"...Dlog!"')}const pn={id:"Lost64",map:un,onLevelStart:Rn,tabletMessage:fn},dn=`
ñö22222229       &#the#sacred#chamber#of#kroz#&2      82222222õò
öö22222999      F       $®$$$$$$$$$$$¯$ 2    .    F   88822222õõ
22222999     2• .   ”   $$$333333333$$$         •    2  88822222
222999   ”   ###        $$3=========3$$   ]    ###        888222
2999   .     #K#       $$3==úúúùúúú==3$$       #ó# .        8882
99   F  ]    #K#  2   $$3==úúùVVVùúú==3$$   2  #2#    ”    2  88
RRRRRRR      #0#      $3==úùïúVAVúïùú==3$      #2#       RRRRRRR
22222RR.     #0# .    $3==úùùúVVVúùùú==3$ .    #2#  2   .RR22222
22222RR  2   #0#      $$3==úúùú6úùúú==3$$      #2#       RR22222
22222RR      #D#   2   $$3==úúù&ùúú==3$$    ‘  #D#     2 RR22222
22222RR                 $$3==úú0úú==3$$                  RR22222
22222RR     2        ]   $3==úúGúú==3$    ”    .   2   . RR22222
22222RR  .     ”     .   $$3==úDú==3$$                ]  RR22222
22222RR    F              $$3=====3$$   2      2    ”    RR22222
RRRRRRR 2         2        $$33333$$       ]      F     2RRRRRRR
444444444444444’            $$$$$$$   .      .  H444444444444444
77777777777777###   ‘ .        P           2   ###YYYYYYYYYYYYYY
77777777777777#U#       2                      #U#YYXXXXXXXXXXXX
77777777777777#-#  2       .   T      2        #0#YYXXYYYYYYYYYY
77777777777777#<#   ]          ” 2       ”    2#0#YYXXYYOOOOOOOO
77777777777777#[#        2  5555555 N     .    #0#YYXXYYOOYYYYYY
77777777777777#|#          55DDDDD55 2      F  #0#YYXXYYOOYYXXXX
K777777777777C#"#E  2     555D]!]D555     2    40#CYXXYYOOYYXX]K
`;async function gn(){P[o.Create]=d}async function Mn(){await Je(),await b('"Ttocs Rellim Setalutargnoc Uoy!"'),await b("Your palms sweat as the words echo through the chamber...");for(let e=0;e<=T;e++)for(let t=0;t<=I;t++)s.PF[e][t]===o.Pit&&(await M(e*t,50,10),s.PF[e][t]=o.Rock,x(e,t,o.Rock));await b("...Your eyes widen with anticipation!")}const mn={id:"Lost75",map:dn,onLevelStart:gn,tabletMessage:Mn},wn=`
W W W W             2 2 2 2 2  C  2 2 2 2 2              W W W W
XXXXXXXXXXXXXXXXXXX###########   ###########XXXXXXXXXXXXXXXXXXXX
 1           1                               1                  
                                    1            XX         1   
       1            1                           XXXX            
#        XX                    +                 XX            #
##      XXXX  1                +          1          1        ##
T##      XX               2    +    2                        ##T
T1##                       W   +   W                        ##1T
T########X                 WX     XW             1    X########T
.        X                2WX  P  XW2                 X        .
T########X         1       WX     XW                  X########T
T1##                       W   +   W         1              ##1T
T##                       2    +    2                        ##T
##   1                         +                      XX      ##
#       XX      1              +                 1   XXXX     1#
       XXXX                 ##   ##                   XX        
1       XX                 ##     ##     1        1           1 
                    1#######       ########                     
    1         ########11111  +++++  111111########              
WW     ########+++++        #######         WWWWW########1    WW
########¯                    2 2 2                     C########
L2  +  X      #kingdom#of#kroz#ii#by#scott#miller#      X  +  2L`,yn={id:"Kingdom1",map:wn,tabletMessage:"Once again you uncover the hidden tunnel leading to Kroz!"},bn=`
’                                                           .   
  2#############################K############################   
   ##‘  2    2   2 2    2   2  ###  2  2   2    2    2    2##   
  2##+#2   2   2    2  2 2   2  2 2  2   2 2   2   2    2  ##   
   ##+#   2  2    2   2   2   2    2    2  2    2    2   2 ##   
  2##+# 2    2  2   2  2 2 2 2  2 2  2 2 2   2    2   2   2##   
   ##+#2   2  2   2                            2   2   2   ## W 
  2##+#  2   2   2   XXXXXXXXXXXXXXXXXXXXXXX  2    2  2   2##@@@
   ##+#2   2  2   2  XXXXXXXXXXXXXXXXXXXXXXX    2   2  2   ##   
  2##+# 2   2  2 2   XXXXXXXXXXXXXXXXXXXXXXX   2  2   2  2 ##   
   ##+#   2 2 2   2  XXXXXX    -+-    XXXXXX  2 2    2  2  ##   
  2##+#2   2   2 2   XXXXXX1   -P-   1XXXXXX  2  2 2   2 2 ##   
   ##+#  2  2  2  2  XXXXXX    -+-    XXXXXX   2  2 2     2##   
  2##+# 2 2  2  2    XXXXXXXXXXXXXXXXXXXXXXX  2   2   2 2  ##   
   ##+#2 2    2   2  XXXXXXXXXXXXXXXXXXXXXXX    2  2   2 2 ##   
  2##+# 2  2  2  2   XXXXXXXXXXXXXXXXXXXXXXX   2    2 2 2  ##   
   ##+#  2  2 2   2                           2  2   2   2 ##   
  2##+#2   2    2   2 2  2  2  2 2  2 2  2  2   2   2  2  2##   
   ##+# 2    2  2  2 2  2   2   2   2  2  2    2    2   2  ##   
  2##3#   2   2   2   2   2   2   2   2 2    2    2   2   2##@@@
   ##T#2   2     2  2  2 2   2 ###   2   2 2  2    2   2   ##222
   #############################S#######################XXX##@@@
                                                          I##LLL`,Yn={id:"Kingdom2",map:bn,tabletMessage:"Warning to all Adventurers:  No one returns from Kroz!"},$n=`
-..............................3#1#2#3##------;------------;----
-##############################-##1#2#3#-######################-
-#.....----......- I#S###### ##K###1#2#3-#///////1///////////1//
-#.-..-....-....-.# # I####1# ######1#2#-#♣1♣♣♣♣♣♣♣♣♣♣♣♣♣1♣♣♣♣♣♣
-#-.-..-..-.....-.# # # ### ## ##1###1#2-#/////1////////////////
-#-.-.-..-..---..-# # ## # ##1## # ###1#-#CCC♣♣♣♣♣♣♣♣♣1♣♣♣♣♣♣1♣♣
-#-.-..-.-.-..-..-# # ### ####  ### K##1-#CCC/////1//////1/////K
-#-..--...-....--.# # ##################-#######################
-#-################                                           à 
---3333333333-CC### #F######################XXXXXXXX###à####-##+
################## ###------------------®###############2###-##+
big#######     ## ####22222222222222222#-##-----------###2##-##K
trouble## RRRRR  #######################-##-####U####-####2####+
######## RRRKRRRR #########$;$$$$$$3$T##-##-----------#####2###3
+++++### RR 2 2 RR ####Z###$############-############‘##Q###2###
++T++## RR 2 P  2RR ### #-U--------------###TT.TT####----####2##
+++++## RR2   2 RR ####1#-####################;###############2#
#O#O#### RR 2  2RR #3## #C####3#3#3#3#3#3#3#3#3#3#3#3#3#3#3#3##D
#X#X##### RRR2CRR ##3## # ###@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@###D
#X#X###### RRRRRR ##3## #3##@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@##K#D
-----; #### RRR  ### ## ###@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#D
-----# #####   # ##W W# ##@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#@##@#D
22222#      #####       @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#L`,_n={id:"Kingdom4",map:$n,tabletMessage:"Adventurer, try the top right corner if you desire."},Sn=`
---###########RRRRR##W        ############W////1/C//♣//♣♣♣♣♣♣♣♣♣
-U---------Z###RRRRR##7######   ##KKô   Z##-//////♣///1/♣♣♣♣♣♣U♣
---###########RRRRR##7####### P ######## ###-////////♣///♣♣1♣♣♣♣
@#############RRRRR#7####                ####-///♣/////////♣♣♣♣♣
@2#------.###RRRRR##7#W3; ############## #####-////1//♣//1///♣♣♣
@##;-;###.##RRRRR##7##W3; #WWWWWWWWWWW## #2####--//////////♣///♣
@2#-;;##..##RRRRR##7##W3; ######-####### ##2#####-/////♣/////1//
@##;-;##..-##RRRRR##7#### #11111111111## ###2##2##-/////1/////♣/
@2#;;-##..#D##RRRRR##7##T #11111111111## #2##2##2##--///////♣///
@##;;;##..#D###RRRRR##7####11111111111## ##2##2##2###---///////1
@2#-;;##..#KK###RRRRR##7###11111111111## ###)##)##)#####--////♣/
@##-;;##..#KK##RRRRRRR#7###11111B11111----)))))))))))#####---///
@2#;;;##22####RRRR#RRR##7##11111111111##############)########--/
@##;;-##22###RRRR###RRR##7#11111111111#?#•#---#*YYYY-63333####D#
@2#;-;##22##RRRR##L##RRR#7#11111111111#O#T#-#-#*YYYY-63333---#D#
@##;;;##22#RRRR##DD##RRR#7#11111111111#O#-4-#-#*YYYY-63333-#-4-#
@2#;-;##-##RRRR#DDD#RRR##7###########-#O#-#-#-#*YYYY-63333-#-#-#
@##;;-##C#RRRR##DDD##RRR##7###+++++##-#O#-#-#-#*YYYY-63333-#-#-#
@2#;;;##H##RRRR#DDDD##RRR##7##+++++##-#O#-#-#-#*YYYY-63333-#-#-#
@##;-;####RRRR##44444##RRR##7###.####-#O#-#-#-#*YYYY-63333-#-#-#
@2#-;;###RRRR##ñññññññ##RRR#7###.#K-#-#O#-#-#-#*YYYY-63333-#-#-#
@###-###RRRR##X--------#RRR##ô##.#--#-#-#---#-######-#####-#---#
-----##RRRR##%X---U----##RRR#K##--------#111#--------------#111#`,Wn={id:"Kingdom6",map:Sn,tabletMessage:"A strange magical gravity force is tugging you downward!"},kn=`
LLL##U##@@@@@@@@@@@|000---0000000000000000-0--00000000VVV000Y-0V
\`\`\`##-##@00000000000000---0000222222220---0000-00000000000--Y-0V
\`\`\`##K##@@022222222K000---0000-0000000000-0000-0)))))YYYW-W0Y-0V
\`\`\`##6##@@@222222222000---000U*******00000000000)))0000000000-00
\`\`\`##6##@@@222222222000---000000000000000000000000222222--000---
\`\`\`##6##@@0222222222000---(((((((((((((((ñ(((((000222222-C00000-
333##6##@00000000000000---00004444444444444444(0000000000000000-
333##6##3CCC....0---------00022222222222222222(K(---------------
$$$##6##000000000000000---00000000000000000000000000000000000000
   0--00000000000000000---000000000000000000000===============--
 P 00-00+02222222220--------------------------0="===-=--===-==-=
$$$00-00+02222222220-00---0000000000000000000-0==I=-=-==-=-=-==-
 ! 00-00+02222222220-00-Z-0000000000000000000-0=H==-===T==-==--=
00000-00[02222B22220-00---00----03333333CC----0==I==-===-==-====
0--00-00+02222222220-00---00-0000000000000000-0===--==-==-==--==
-0000-00+02222222220-00---00-0000000000000000-0==-===-=-=-====-=
00000-00+02222222220W00---00-----0--------000-0=-==--==-=-=--=T=
0--00-00000000000000000---000000000001110-000-0==T-===-===-==-==
00000-00000000000000000---000000000001110-00000=======-=========
--000----------------- ---0WWWWWWWWK01110-000-000000000000000000
00000-00000000000000000---000-00000001110-000K--<000OO000OOOOOó*
--000-000000~~~0000000#---#00-00000000000-000000000000OOOO000000
00C000000********3000##VVV##0-------------00000000bouldervilleÃ0`,vn={id:"Kingdom12",map:kn,tabletMessage:"The lava will block a slow Adventurer's path!"},On=`
LXXX2    2     2        2   2  2  2   2    2 2    2  2    2    +
+XXX  2     2      2        2          2  2    2     2      XXX 
 XXX2   2      2       2  2     2   2       2      2  2  2  XTX 
+XXX          2  2           2         2  2     2   2       XXX 
 XXX   2   2         2   2     2    2      2  2        2     2  
+XXX 2                                                          
 XXX  2  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  2  2 
+XXX2    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX    2  
 XXX  2  XXX2                    W                   2XXX 2     
+XXX   2 XXX  2                FFFFF               2  XXX   2 2 
 XXX2 2  XXX                   F111F                  XXX       
+XXX2    XXX+   3  3        W  F1P1F  W       3  3   +XXX  2    
XXXX   2 XXX                   F111F                  XXX 2    2
WXXX 2   XXX  2                FFFFF               2  XXX   2   
WXXX2    XXX2                    W                   2XXX    2  
WXXX  2  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 2     
WXXX   2 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX    2  
WXXX2                                                      2    
WXXX    2   2      2   2     2    2   2    2    2      2      2 
XXXX 2    2   2 2    2    2     2       2     2     2     2 XXX 
XXXX2  2    2  2  2      2    2     2  2  2  2    2         XTX 
XXXX 2   2 2    2   2  2    2   2       2       2   2   2   XXX 
CXXX   2    2  2 2    2 2     2    2  2  2   2    2  2    2    +`,Fn={id:"Caverns2",map:On},xn=`
WFP I        C3+3+3+3+3+3+3+2+2+2+2+2+2+2+2+1+1+1+1+1+1+1+1 W   
XX############################################################CC
             C3+3+3+3+3+3+3+2+2+2+2+2+2+2+2+1+1+1+1+1+1+1+1 W   
  ##############################################################
  #     1        +              1     +                  X      
 1#I##################################################   #   #  
  #X #XX    X    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#1  #   #+ 
  # X#XX XX X XX XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#   # 1 #  
+ #X #X +XX  +X  XXLX  W + + + + + T + + + + + W   XX#   #   # 1
  # X#X XXXXXXX XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  X# 1 #+  #  
1 #X #X   X     +XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX X#   #   #  
  # X#XXX X ####################################### X#  +#1  #  
  #X #XXXIX     1   +    1   +   1  +               X#   #   #  
  # X#X   ###################################XXX######  1#   #  
  #X #X #####################################XXX######   #   #1 
 1# X#X     1 +1 +1 +1 +1 +1++++                     #+  #  1#  
  #X ########################################XXX#### #   #   # +
  # XXXXXXXXXXXCXXXXXXXXXCXXXXXXXXXCXXXXXXXXXWWWXXX# # 1 #  +#  
  # XXXXXXCXXXXXXXXXCXXXXXXXXXCXXXXXXXXXCXXXXXXXXXX#1#   #1  #  
 +# ################################################ #   #   # 1
  #    1+++1            C           1+++1            #       #  
1 ############################################################  
         1       +            1         +               1       `,Pn={id:"Caverns4",map:xn},je=[Mi,wi,Yi,Si,Fn,Pn,yn,Yn,_n,Wn,ki,vn,Fi,Li,Ii,Ki,zi,Hi,Qi,en,nn,rn,hn,pn,Zi,mn];function Ln(e){s.entities=[],s.T=s.T.map(()=>0),s.genNum=0;const t=e.split(`
`).filter(a=>a.length>0);for(let a=0;a<t.length;a++){const n=t[a];for(let i=0;i<n.length;i++){const r=n.charAt(i)??d,X=Za[r];switch(s.PF[i]=s.PF[i]||[],s.PF[i][a]=X??r,r){case"Ã":s.PF[i][a]="!";break;case"´":s.PF[i][a]=".";break;case"µ":s.PF[i][a]="?";break;case"¶":s.PF[i][a]="'";break;case"·":s.PF[i][a]=",";break;case"¸":s.PF[i][a]=":";break;case"ú":s.PF[i][a]="·";break;case"ù":s.PF[i][a]="∙";break;case"ï":s.PF[i][a]="∩";break}switch(X){case o.Player:s.player.x=i,s.player.y=a;break;case o.Slow:case o.Medium:case o.Fast:s.entities.push(new ge(X,i,a));break;case o.Generator:s.genNum++;break;case o.Statue:s.T[B.StatueGemDrain]=32e3;break}}}G[o.Gem]=[m.getUniformInt(1,15),null],G[o.Border]=[m.getUniformInt(8,15),m.getUniformInt(1,8)]}function Dn(){var e,t,a,n;(t=(e=s.level)==null?void 0:e.onLevelEnd)==null||t.call(e),s.level=je[s.levelIndex],li(),(n=(a=s.level)==null?void 0:a.onLevelStart)==null||n.call(a),Ln(s.level.map)}const Cn=17,ze={[B.SlowTime]:70*ce,[B.Invisible]:75*ce,[B.SpeedTime]:80*ce,[B.FreezeTime]:55*ce};async function Qe(){Dn(),s.T=s.T.fill(0),s.bonus=0,rt=0,ci(),ue(l.Blue),jt(),dt(),ne(),te(),await b("Press any key to begin this level.")}async function Qt(){lt(),s.levelIndex=ut(s.levelIndex+1,je.length),s.levelIndex%10===0&&await pi(),await Qe()}async function Tn(){lt(),s.levelIndex=ut(s.levelIndex-1,je.length),await Qe()}async function In(){s.T=s.T.map(t=>t>0?t-1:0),s.T[B.StatueGemDrain]>0&&m.getUniformInt(0,18)===0&&(s.gems--,await M(3800,40),te());const e=s.entities.reduce((t,a)=>a.type===o.Slow?t+1:t,0);s.genNum>0&&e<995&&m.getUniformInt(0,Cn)===0&&await Jt()}async function Jt(){let e=!1;do{const t=m.getUniformInt(0,T),a=m.getUniformInt(0,I);if(s.PF[t][a]===o.Floor){s.entities.push(new ge(o.Slow,t,a)),s.PF[t][a]=o.Slow;for(let n=5;n<70;n++)M(n*8,1);await L(50),e=!0}ne()}while(!e&&m.getUniformInt(0,50)!==0)}async function Bn(e){var X,h;if(e.x===-1||e.y===-1||s.PF[e.x][e.y]!==e.type){e.kill();return}let t=0,a=0;s.player.x<e.x&&(t=-1),s.player.x>e.x&&(t=1),s.player.y<e.y&&(a=-1),s.player.y>e.y&&(a=1);const n=e.x+t,i=e.y+a;if(n<0||n>=T||i<0||i>=I)return;const r=((h=(X=s.PF)==null?void 0:X[n])==null?void 0:h[i])??o.Floor;switch(r){case o.Floor:case o.TBlock:case o.TRock:case o.TGem:case o.TBlind:case o.TGold:case o.TWhip:case o.TTree:g(e,n,i);break;case o.Block:case o.MBlock:case o.ZBlock:case o.GBlock:s.PF[e.x][e.y]=o.Floor,s.PF[n][i]=o.Floor,e.kill(),v(r),M(800,18),M(400,20);break;case o.Player:s.gems--,s.PF[e.x][e.y]=o.Floor,e.kill(),v(r);break;case o.Whip:case o.Chest:case o.SlowTime:case o.Gem:case o.Invisible:case o.Teleport:case o.Key:case o.SpeedTime:case o.Trap:case o.Power:case o.Freeze:case o.Nugget:case o.K:case o.R:case o.O:case o.Z:case o.ShootRight:case o.ShootLeft:ee(),g(e,n,i);break;default:g(e,e.x,e.y);break}}async function An(e){if(e!==o.Player&&!(s.T[B.FreezeTime]>0))for(let t=0;t<s.entities.length;t++){const a=s.entities[t];e&&a.type!==e||a.x===-1||a.y===-1||await Bn(a)}}async function Vn(){let e="";for(;e.toLowerCase()!=="y"&&e.toLowerCase()!=="n";)e=await b("Are you sure you want to SAVE? (Y/N)");e.toLowerCase()==="y"&&hi()}async function En(){let e="";for(;e.toLowerCase()!=="y"&&e.toLowerCase()!=="n";)e=await b("Are you sure you want to RESTORE? (Y/N)");e.toLowerCase()==="y"&&(ui(),await Qe())}async function Kn(){if(ae(V.NextLevel))return await Qt();if(ae(V.PrevLevel))return await Tn();if(ae(V.NextLevelCheat)){s.PF[s.player.x+1][s.player.y]=o.Stairs,await M(2e3,40,10);return}if(ae(V.FreeItems)){s.gems=150,s.whips=99,s.teleports=99,s.keys=9,te();return}if(ae(V.SlowerClock)){s.clockScale=Math.min(20,s.clockScale+1),console.log("Clock Scale:",s.clockScale);return}if(ae(V.FasterClock)){s.clockScale=Math.max(1,s.clockScale-1),console.log("Clock Scale:",s.clockScale);return}if(ae(V.ResetFound)){s.foundSet=new Set;return}if(ae(V.Pause))return qn();if(ae(V.Quit))return Hn();if(ae(V.Save))return Vn();if(ae(V.Restore))return En();se(V.Whip)&&(s.whips<1?vt():(s.whips--,await Un())),se(V.Teleport)&&(s.teleports<1?await vt():(s.teleports--,await aa()));let e=0,t=0;se(V.North)&&t--,se(V.South)&&t++,se(V.West)&&e--,se(V.East)&&e++,se(V.Southeast)&&(e++,t++),se(V.Southwest)&&(e--,t++),se(V.Northeast)&&(e++,t--),se(V.Northwest)&&(e--,t--),e=Wt(e,-1,1),t=Wt(t,-1,1),(e!==0||t!==0)&&await ea(e,t)}async function ea(e,t){var r,X,h,c,u,y,$,_,S,Y,E,k,D,C,O,J,H,Me,U,Ie,ke,me;const a=s.player.x+e,n=s.player.y+t;if(a<0||a>T||n<0||n>I){await Ft(),v(o.Border),await w(o.Border,!0);return}const i=((X=(r=s.PF)==null?void 0:r[a])==null?void 0:X[n])||o.Floor;switch(i){case o.Floor:case o.Stop:g(s.player,a,n);break;case o.Slow:case o.Medium:case o.Fast:s.gems-=i,Ge(a,n),v(i),g(s.player,a,n);break;case o.Block:case o.ZBlock:case o.GBlock:v(i),await w(o.Block,!0);break;case o.Whip:ee(),s.whips++,v(i),g(s.player,a,n),await w(o.Whip,!0);break;case o.Stairs:if(s.levelIndex===je.length-1){g(s.player,a,n),await Qn();return}g(s.player,a,n),v(i),await w(o.Stairs,!0),_e(),await Qt();break;case o.Chest:{g(s.player,a,n);const R=m.getUniformInt(2,5),f=m.getUniformInt(2,s.difficulty+2);s.whips+=R,s.gems+=f,v(i),await b(`You found ${f} gems and ${R} whips inside the chest!`);break}case o.SlowTime:s.T[B.SpeedTime]=0,s.T[B.FreezeTime]=0,s.T[B.SlowTime]=ze[B.SlowTime],v(i),g(s.player,a,n),await w(i,!0);break;case o.Gem:ee(),s.gems++,v(i),g(s.player,a,n),await w(i,!0);break;case o.Invisible:s.T[B.Invisible]=ze[B.Invisible],v(i),g(s.player,a,n),await w(i,!0);break;case o.Teleport:s.teleports++,v(i),g(s.player,a,n),w(i,!0);break;case o.Key:ee(),s.keys++,g(s.player,a,n),await w(i,!0);break;case o.Door:s.keys<1?(M(Math.random()*129+30,150,100),await L(100),await w(i)):(s.keys--,v(i),await Ha(),g(s.player,a,n),await b("The Door opens!  (One of your Keys is used.)"));break;case o.Wall:ye(),v(i),await w(i,!0);break;case o.River:v(i),await w(i,!0);break;case o.SpeedTime:s.T[B.SlowTime]=0,s.T[B.SpeedTime]=ze[B.SpeedTime],v(i),g(s.player,a,n),await w(i,!0);break;case o.Trap:v(i),g(s.player,a,n),await w(i,!0),await aa();break;case o.Power:s.whipPower++,v(i),g(s.player,a,n),await w(i,!0);break;case o.Tree:case o.Forest:v(i),await nt(),await w(i,!0);break;case o.Bomb:{g(s.player,a,n);const R=4,f=Math.max(s.player.x-R,De),p=Math.min(s.player.x+R,Se),F=Math.max(s.player.y-R,Ce),K=Math.min(s.player.y+R,Le);for(let oe=f;oe<=p;oe++)for(let A=F;A<=K;A++){const z=((c=(h=s.PF)==null?void 0:h[oe])==null?void 0:c[A])??o.Floor;ii.includes(z)&&(z>=1&&z<=4&&(v(z),await Ge(oe,A)),s.PF[oe][A]=o.Floor)}await w(i,!0);break}case o.Lava:s.gems-=10,v(i),g(s.player,a,n),await w(i,!0);break;case o.Pit:g(s.player,a,n),s.gems=-1,await w(i);break;case o.Tome:s.PF[31][6]=o.Stairs,x(31,6,o.Stairs),v(i),await w(i),await b("Congratulations, Adventurer, you finally did it!!!");break;case o.Nugget:ee(),g(s.player,a,n),v(i),await w(i,!0);break;case o.Freeze:s.T[B.FreezeTime]=ze[B.FreezeTime],g(s.player,a,n),await w(i,!0);break;case o.Tunnel:{const R=s.player.x,f=s.player.y;g(s.player,a,n),await L(350),await _e(),await L(500),s.PF[a][n]=o.Tunnel,x(a,n,o.Tunnel);let p=a,F=n;for(let A=0;A<1e4;A++){const z=m.getUniformInt(0,T),q=m.getUniformInt(0,I);if((((y=(u=s.PF)==null?void 0:u[z])==null?void 0:y[q])??o.Floor)===o.Tunnel&&(z!==p||q!==F)){p=z,F=q,g(s.player,p,F);break}}s.PF[a][n]=o.Tunnel,x(a,n,o.Tunnel);let K=R,oe=f;for(let A=0;A<100;A++){const z=m.getUniformInt(-1,1),q=m.getUniformInt(-1,1);if(p+z<0||p+z>T||F+q<0||F+q>I)continue;const Be=((_=($=s.PF)==null?void 0:$[p+z])==null?void 0:_[F+q])??o.Floor;if([0,32,33,37,39,55,56,57,67,224,225,226,227,227,229,230,231].includes(Be)){K=p+z,oe=F+q;break}}g(s.player,K,oe),s.PF[p][F]=o.Tunnel,x(p,F,o.Tunnel),await w(i,!0);break}case o.Quake:g(s.player,a,n);for(let R=0;R<2500;R++)M(m.getUniformInt(0,R),5,100),R%25===0&&await L();await L(50);for(let R=0;R<50;R++){do{const f=m.getUniformInt(0,T),p=m.getUniformInt(0,I),F=((Y=(S=s.PF)==null?void 0:S[f])==null?void 0:Y[p])??o.Floor;if(ni.includes(F)){s.PF[f][p]=o.Rock,x(f,p,o.Rock);break}}while(Math.random()>.01);for(let f=0;f<50;f++)M(m.getUniformInt(0,200),50,100);await L(50)}for(let R=2500;R>50;R--)M(m.getUniformInt(0,R),5,100),R%25===0&&await L();await w(i,!0);break;case o.IWall:ye(),s.PF[a][n]=o.Wall,x(a,n),await w(i,!0);break;case o.IBlock:ye(),s.PF[a][n]=o.Block,x(a,n,o.Block),await w(i,!0);break;case o.IDoor:ye(),s.PF[a][n]=o.Door,x(a,n),await w(i,!0);break;case o.Zap:{g(s.player,a,n);let R=0,f=0;for(;R<500&&f<40;){R++;const p=m.getUniformInt(0,s.entities.length),F=s.entities[p];!F||F.x===-1||F.y===-1||(await Ge(F.x,F.y),await L(20),f++)}s.score+=Math.floor(f/3+2),ne(),te(),await w(i,!0);break}case o.Create:{if(g(s.player,a,n),s.entities.reduce((f,p)=>p.type===o.Slow?f+1:f,0)<945)for(let f=0;f<45;f++)await Jt();v(i),await w(i,!0);break}case o.Generator:v(i),await w(i,!0);break;case o.MBlock:v(i),await w(i,!0);break;case o.ShowGems:{g(s.player,a,n),ee();for(let R=0;R<s.difficulty*2+5;R++){let f=!1;do{const p=m.getUniformInt(0,T),F=m.getUniformInt(0,I);(((k=(E=s.PF)==null?void 0:E[p])==null?void 0:k[F])??o.Floor)===o.Floor&&(M(m.getUniformInt(110,1310),7,100),f=!0,s.PF[p][F]=o.Gem,x(p,F,o.Gem),await L(99))}while(!f&&Math.random()>.01)}ne(),await w(i,!1);break}case o.Tablet:g(s.player,a,n),ee(),v(i),await w(i,!0),await Zn();break;case o.BlockSpell:{g(s.player,a,n);for(let R=0;R<=T;R++)for(let f=0;f<=I;f++)if(s.PF[R][f]===o.ZBlock){M(200,60,100);for(let p=20;p>0;p--)x(R,f,o.Block,m.getUniformInt(0,15)),await L(3);s.PF[R][f]=o.Floor,x(R,f,o.Floor)}else s.PF[R][f]===o.BlockSpell&&(s.PF[R][f]=o.Floor,x(R,f,o.Floor));await w(i,!0);break}case o.Chance:{v(i);const R=m.getUniformInt(14,18);s.gems+=R,g(s.player,a,n),await b(`You found a Pouch containing ${R} Gems!`);break}case o.Statue:nt(),await w(i);break;case o.WallVanish:g(s.player,a,n),await w(i);break;case o.K:g(s.player,a,n),ee(),s.bonus===0&&(s.bonus=1);break;case o.R:g(s.player,a,n),ee(),s.bonus===1&&(s.bonus=2);break;case o.O:g(s.player,a,n),ee(),s.bonus===2&&(s.bonus=3);break;case o.Z:if(g(s.player,a,n),ee(),s.bonus===3){for(let R=10;R<45;R++)for(let f=1;f<13;f++)await M(R*R*f,f+1,100);v(i),w(i)}break;case o.OWall1:case o.OWall2:case o.OWall3:ye(),await w(o.OWall1,!0);break;case o.OSpell1:case o.OSpell2:case o.OSpell3:{g(s.player,a,n);let R=o.OWall1;i===o.OSpell2&&(R=o.OWall2),i===o.OSpell3&&(R=o.OWall3);for(let f=0;f<=T;f++)for(let p=0;p<=I;p++)if((((C=(D=s.PF)==null?void 0:D[f])==null?void 0:C[p])??o.Floor)===R){for(let K=60;K>0;K--)x(f,p,m.getItem(["▄","▌","▐","▀"]),m.getUniformInt(0,14)),M(K*40,5,10),K%5===0&&await L(1);s.PF[f][p]=o.Floor,x(f,p,o.Floor)}await w(i,!0);break}case o.CSpell1:case o.CSpell2:case o.CSpell3:{g(s.player,a,n);const R=i-o.CSpell1+o.CWall1;for(let f=0;f<=T;f++)for(let p=0;p<=I;p++)if((((J=(O=s.PF)==null?void 0:O[f])==null?void 0:J[p])??o.Floor)===R){for(let K=60;K>0;K--)x(f,p,m.getItem(["▄","▌","▐","▀"]),m.getUniformInt(0,14)),M(K*40,5,10),K%5===0&&await L(1);s.PF[f][p]=o.Wall,x(f,p,o.Wall)}await w(i,!0);break}case o.Rock:{let R=!1;const f=s.player.x+e*2,p=s.player.y+t*2;if((f<0||f>T||p<0||p>I)&&(R=!0),!R)switch(((Me=(H=s.PF)==null?void 0:H[f])==null?void 0:Me[p])??o.Floor){case o.Floor:R=!1,await Ot(),s.PF[f][p]=o.Rock,g(s.player,a,n),ne(),await w(o.Rock,!0);break;case o.Stairs:case o.Pit:R=!1,await Ot(),g(s.player,a,n),ne(),x(f,p,o.Rock);for(let K=130;K>5;K--)await M(K*8,16,100);ne(),await w(o.Rock,!0);break;default:R=!1;break}R&&await nt();break}case o.EWall:v(i),s.gems--,Ft(),await w(o.EWall,!0);break;case o.CWall1:case o.CWall2:case o.CWall3:g(s.player,a,n);break;case o.Trap2:case o.Trap4:g(s.player,a,n);break;case o.Trap5:case o.Trap6:case o.Trap7:case o.Trap8:case o.Trap9:case o.Trap10:case o.Trap11:case o.Trap12:case o.Trap13:{g(s.player,a,n);for(let R=0;R<=T;R++)for(let f=0;f<=I;f++){const p=((Ie=(U=s.PF)==null?void 0:U[R])==null?void 0:Ie[f])??o.Floor;i===p&&(s.PF[R][f]=o.Floor,x(R,f,o.Floor))}break}case o.Trap3:{for(let R=0;R<=T;R++)for(let f=0;f<=I;f++)(((me=(ke=s.PF)==null?void 0:ke[R])==null?void 0:me[f])??o.Floor)===o.Trap3&&(s.PF[R][f]=o.Floor,x(R,f,o.Floor));break}case o.TBlind:case o.TBlock:case o.TGem:case o.TGold:case o.TRock:case o.TTree:case o.TWhip:g(s.player,a,n);break;case o.Rope:g(s.player,a,n),await w(o.Rope,!0);break;case o.Message:break;case o.ShootRight:break;case o.ShootLeft:break;case o.DropRope:case o.DropRope2:case o.DropRope3:case o.DropRope4:case o.DropRope5:g(s.player,a,n);break;case o.Amulet:g(s.player,a,n),await Jn();break;default:ye();break}}async function w(e,t=!1){if(t){if(s.foundSet.has(e))return"";s.foundSet.add(e)}const a=ja[e];return a?await b(a):""}async function Ge(e,t){var n,i;const a=((i=(n=s.PF)==null?void 0:n[e])==null?void 0:i[t])??o.Floor;if(s.PF[e][t]=o.Floor,a===o.Slow||a===o.Medium||a===o.Fast)for(let r=0;r<s.entities.length;r++){const X=s.entities[r];X.x===e&&X.y===t&&await X.kill()}ne()}let rt=o.Floor;function g(e,t,a){const n=e.x,i=e.y;if(e.move(t,a),e.type===o.Player){s.PF[n][i]=rt;const r=s.PF[t][a];rt=[o.CWall1,o.CWall2,o.CWall3,o.Rope].includes(r)?r:o.Floor}else s.PF[n][i]=o.Floor;s.PF[t][a]=e.type,ne()}async function Un(){const e=s.player.x,t=s.player.y;M(70,50*8,100),t>0&&e>0&&await Re(e-1,t-1,"\\"),e>0&&await Re(e-1,t,"-"),t<I&&e>0&&await Re(e-1,t+1,"/"),t<I&&await Re(e,t+1,"❘"),t<I&&e<T&&await Re(e+1,t+1,"\\"),e<T&&await Re(e+1,t,"-"),t>0&&e<T&&await Re(e+1,t-1,"/"),t>0&&await Re(e,t-1,"❘")}async function ta(){for(let e=0;e<160;e++)e%5===0&&(x(s.player.x,s.player.y,o.Player,m.getUniformInt(0,15),m.getUniformInt(0,8)),await L()),M(e/2,80,10)}async function aa(){var t,a;await ta(),s.PF[s.player.x][s.player.y]=o.Floor,x(s.player.x,s.player.y);const e=Date.now();for(let n=0;n<700;n++){const i=m.getUniformInt(0,T),r=m.getUniformInt(0,I),X=((a=(t=s.PF)==null?void 0:t[i])==null?void 0:a[r])??o.Floor;if(oi.indexOf(X)>-1&&(x(i,r,"☺",m.getUniformInt(0,15),m.getUniformInt(0,7)),await M(20,10,100),x(i,r,X)),Date.now()-e>1500)break}g(s.player,...zn())}function zn(){var e,t;for(;;){const a=m.getUniformInt(0,T),n=m.getUniformInt(0,I);if((((t=(e=s.PF)==null?void 0:e[a])==null?void 0:t[n])??o.Floor)===o.Floor)return[a,n]}}async function Re(e,t,a){var i,r;const n=((r=(i=s.PF)==null?void 0:i[e])==null?void 0:r[t])??o.Floor;switch(Nn(e,t,a,re[m.getUniformInt(0,15)]),n){case o.Slow:case o.Medium:case o.Fast:Ge(e,t),v(n);break;case o.Block:case o.Forest:case o.Tree:case o.Message:{const X=s.whipPower;6*Math.random()<X?(M(130,50),s.PF[e][t]=o.Floor):(M(130,25),M(90,50));break}case o.Invisible:case o.SpeedTime:case o.Trap:case o.Power:case o.K:case o.R:case o.O:case o.Z:s.PF[e][t]=o.Floor,M(400,50);break;case o.Quake:case o.IBlock:case o.IWall:case o.IDoor:case o.Trap2:case o.Trap3:case o.Trap4:case o.ShowGems:case o.BlockSpell:case o.Trap5:case o.Trap6:case o.Trap7:case o.Trap8:case o.Trap9:case o.Trap10:case o.Trap11:case o.Trap12:case o.Trap13:case o.Stop:break;case o.Rock:30*Math.random()<s.whipPower?(M(130,50),s.PF[e][t]=o.Floor):(M(130,25),M(90,50));break;case o.MBlock:case o.ZBlock:case o.GBlock:{6*Math.random()<s.whipPower?(M(130,50),s.PF[e][t]=o.Floor):(M(130,25),M(90,50));break}case o.Statue:50*Math.random()<s.whipPower?(s.PF[e][t]=o.Floor,v(n),s.T[B.StatueGemDrain]=-1,await b("You've destroyed the Statue!  Your Gems are now safe.")):(M(130,25),M(90,50));break;case o.Generator:v(n),s.PF[e][t]=o.Floor,s.genNum--;break;case o.Wall:break}te(),await L(25)}function ne(){for(let t=0;t<s.PF.length;t++)for(let a=0;a<s.PF[t].length;a++){const n=s.PF[t][a]||o.Floor;n!==o.Player&&(n===o.Slow||n===o.Medium||n===o.Fast||x(t,a,s.PF[t][a]||o.Floor))}const e=G[o.Floor][1];for(let t=0;t<s.entities.length;t++){const a=s.entities[t];a.x===-1||a.y===-1||x(a.x,a.y,a.getChar(),G[a.type][0],e)}x(s.player.x,s.player.y,s.player.getChar(),G[s.player.type][0],e)}function x(e,t,a=o.Floor,n,i){var X,h;let r;switch(typeof a=="number"?(r=P[a]??a??P[o.Floor],n=n??((X=G[a])==null?void 0:X[0])??G[o.Floor][0],i=i??((h=G[a])==null?void 0:h[1])??G[o.Floor][1]):a>="a"&&a<="z"||["!","·","∙","∩"].includes(a)?(r=a.toUpperCase(),n=n??l.HighIntensityWhite,i=i??l.Brown):r=a,a){case o.Stairs:n=typeof n=="number"&&!s.paused?n|16:n;break}$e(e+De,t+Ce,r,n,i)}function Nn(e,t,a,n){var X,h,c;const i=((h=(X=s.PF)==null?void 0:X[e])==null?void 0:h[t])??o.Floor;let r;i>="a"&&i<="z"||i==="!"?r=l.Brown:r=((c=G[i])==null?void 0:c[1])??G[o.Floor][1],$e(e+De,t+Ce,a,n,r)}function v(e){switch(e){case o.Border:s.score>s.levelIndex&&(s.score-=s.levelIndex/2);break;case o.Slow:case o.Medium:case o.Fast:s.score+=e;break;case o.Block:case o.ZBlock:case o.GBlock:case o.Wall:case o.River:case o.Tree:case o.Forest:case o.MBlock:case o.OWall1:case o.OWall2:case o.OWall3:case o.EWall:s.score>2&&(s.score-=2);break;case o.Whip:case o.SlowTime:case o.Bomb:s.score++;break;case o.Stairs:s.score+=s.levelIndex*5;break;case o.Chest:s.score+=10+Math.floor(s.levelIndex/2);break;case o.Gem:s.score+=Math.floor(s.levelIndex/2)+1;break;case o.Invisible:s.score+=25;break;case o.Nugget:s.score+=50;break;case o.Door:s.score+=10;break;case o.Teleport:case o.Freeze:s.score+=2;break;case o.SpeedTime:case o.Power:s.score+=5;break;case o.Trap:s.score>5&&(s.score-=5);break;case o.Lava:s.score>100&&(s.score+=100);break;case o.Tome:s.score+=5e3;break;case o.Tablet:s.score+=s.levelIndex+250;break;case o.Chance:s.score+=100;break;case o.Statue:s.score+=10;break;case o.Amulet:s.score+=2500;break;case o.Z:s.score+=1e3;break}te()}async function Gn(){W(Se/2-7,0,"You have died.",l.Black,l.Red),await b("Press any key to continue."),s.done=!0}async function Hn(){let e="";for(;e.toLowerCase()!=="y"&&e.toLowerCase()!=="n";)e=await b("Are you sure you want to quit? (Y/N)");e.toLowerCase()==="y"&&(s.done=!0)}async function qn(){await b("Press any key to resume")}async function Zn(){const e=s.level;e.tabletMessage&&(typeof e.tabletMessage=="string"?await b(e.tabletMessage):typeof e.tabletMessage=="function"&&await e.tabletMessage())}async function Je(){await b("On the Ancient Tablet is a short Mantra, a prayer..."),await b("You take a deep breath and speak the words aloud...")}async function jn(){ue(l.Blue),W(2,5,he`
    In the mystical Kingdom of Kroz, where ASCII characters come to life and
    danger lurks around every corner, a new chapter unfolds. You, a brave
    archaeologist, have heard whispers of the legendary Magical Amulet of Kroz,
    an artifact of immense power long thought lost to time.

    Will you be the one to uncover the secrets of the forsaken caverns? Can you
    retrieve the Magical Amulet and restore glory to the Kingdom of Kroz? The
    adventure awaits, brave explorer!

  `,l.LightCyan,l.Blue),W(9,16,`Use the cursor keys to move yourself (%c{${re[l.Yellow]}}☻%c{${re[l.LightGreen]}}) through the caverns.`,l.LightGreen,l.Blue),Z(17,"Use your whip (press W) to destroy all nearby creatures.",l.LightGreen,l.Blue),Z(Xe-1,"Press any key to begin your decent into Kroz.",l.HighIntensityWhite,l.Blue);const e=qe/2-Pe.length/2;await Xt(async()=>{W(e,3,Pe,m.getUniformInt(0,16),l.Red),await L(500)})}async function Qn(){await _e(),await L(200),await _e(),await L(200),await _e(),await b("Oh no, something strange is happening!"),await b("You are magically transported from Kroz!");const e=s.gems=isFinite(s.gems)?s.gems:150,t=s.whips=isFinite(s.whips)?s.whips:20,a=s.teleports=isFinite(s.teleports)?s.teleports:10,n=s.keys=isFinite(s.keys)?s.keys:5;await b("Your Gems are worth 100 points each...");for(let i=0;i<e;i++)s.gems--,s.score+=10,te(),await M(i*8+100,20);await b("Your Whips are worth 100 points each...");for(let i=0;i<t;i++)s.whips--,s.score+=10,te(),await M(i*8+100,20);await b("Your Teleport Scrolls are worth 200 points each...");for(let i=0;i<a;i++)s.teleports--,s.score+=20,te(),await M(i*8+100,20);await b("Your Keys are worth 10,000 points each....");for(let i=0;i<n;i++)s.keys--,s.score+=1e3,te(),await M(i*8+100,20);ue(l.Blue),W(25,3,"ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ",l.White,l.Blue),W(10,5,he`
        Carefully, you place the ancient tome on your table and open
        to the first page.  You read the book intently, quickly
        deciphering the archaic writings.

        You learn of Lord Dullwit, the once powerful and benevolent
        ruler of Kroz, who sought wealth and education for his people.
        The magnificent KINGDOM OF KROZ was once a great empire, until
        it was overthrown by an evil Wizard, who wanted the riches of
        Kroz for himself.

        Using magic beyond understanding, the Wizard trapped Lord
        Dullwit and his people in a chamber so deep in Kroz that any
        hope of escape was fruitless.

        The Wizard then built hundreds of deadly chambers that would
        stop anyone from ever rescuing the good people of Kroz.
        Once again your thoughts becomes clear:  To venture into the
        depths once more and set free the people of Kroz.
       `,l.White,l.Blue),await b("Press any key, Adventurer."),s.done=!0}async function Jn(){await ee();for(let e=45;e>=11;e--)for(let t=13;t>=1;t--)await M(e*e*t,t+1,100);v(o.Amulet),await b("You have found the Amulet of Yendor -- 25,000 points!"),await b("It seems that Kroz and Rogue share the same underground!)"),await b("Your quest for the treasure of Kroz must still continue...")}let fe;const eo=new ge(o.Player,0,0),to=new ge(o.Slow,0,0),ao=new ge(o.Medium,0,0),io=new ge(o.Fast,0,0);function no(){return fe=new Ga.Speed,fe.add(eo,!0),fe.add(to,!0),fe.add(ao,!0),fe.add(io,!0),fe}function oo(){return fe.next()}function so(){const e=Ea();document.getElementById("app").appendChild(e),$a()}async function ia(){ue(l.Black),Zt(),await Ri(),await jn(),await fi(),Qe(),Pt(),await ta(),na(),await b("Press any key to begin this level."),Ct(),Pt(),await ro()}async function ro(){no();let e=16*s.clockScale,t=0,a=0;const n=async i=>{if(s.gems<0){await Gn(),xt();return}if(s.done){xt();return}if(t+=i-a,a=i,t>e){t%=e,await In(),await Kn(),Ct();const r=oo();await An(r.type)}na(),e=16*s.clockScale,requestAnimationFrame(n)};requestAnimationFrame(n)}function xt(){ue(l.Black),Zt(),ia()}function Pt(){ue(l.Blue),dt(),jt(),ne(),te()}function na(){ne(),te()}function Lt(){so(),ia()}try{document.fonts.ready.then(Lt)}catch{window.addEventListener("DOMContentLoaded",Lt)}
