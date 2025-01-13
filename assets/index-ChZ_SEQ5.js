var Yi=Object.defineProperty;var $i=(e,t,i)=>t in e?Yi(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i;var ae=(e,t,i)=>$i(e,typeof t!="symbol"?t+"":t,i);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const X of o.addedNodes)X.tagName==="LINK"&&X.rel==="modulepreload"&&a(X)}).observe(document,{childList:!0,subtree:!0});function i(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=i(n);fetch(n.href,o)}})();var Ge={exports:{}},_i=Ge.exports,Ct;function Si(){return Ct||(Ct=1,function(e,t){(function(i,a){e.exports=a()})(_i,function(){var i=function(){function a(Y){return X.appendChild(Y.dom),Y}function n(Y){for(var $=0;$<X.children.length;$++)X.children[$].style.display=$===Y?"block":"none";o=Y}var o=0,X=document.createElement("div");X.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000",X.addEventListener("click",function(Y){Y.preventDefault(),n(++o%X.children.length)},!1);var c=(performance||Date).now(),h=c,u=0,p=a(new i.Panel("FPS","#0ff","#002")),M=a(new i.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var y=a(new i.Panel("MB","#f08","#201"));return n(0),{REVISION:16,dom:X,addPanel:a,showPanel:n,begin:function(){c=(performance||Date).now()},end:function(){u++;var Y=(performance||Date).now();if(M.update(Y-c,200),Y>h+1e3&&(p.update(1e3*u/(Y-h),100),h=Y,u=0,y)){var $=performance.memory;y.update($.usedJSHeapSize/1048576,$.jsHeapSizeLimit/1048576)}return Y},update:function(){c=this.end()},domElement:X,setMode:n}};return i.Panel=function(a,n,o){var X=1/0,c=0,h=Math.round,u=h(window.devicePixelRatio||1),p=80*u,M=48*u,y=3*u,Y=2*u,$=3*u,A=15*u,W=74*u,I=30*u,B=document.createElement("canvas");B.width=p,B.height=M,B.style.cssText="width:80px;height:48px";var O=B.getContext("2d");return O.font="bold "+9*u+"px Helvetica,Arial,sans-serif",O.textBaseline="top",O.fillStyle=o,O.fillRect(0,0,p,M),O.fillStyle=n,O.fillText(a,y,Y),O.fillRect($,A,W,I),O.fillStyle=o,O.globalAlpha=.9,O.fillRect($,A,W,I),{dom:B,update:function(j,N){X=Math.min(X,j),c=Math.max(c,j),O.fillStyle=o,O.globalAlpha=1,O.fillRect(0,0,p,A),O.fillStyle=n,O.fillText(h(j)+" "+a+" ("+h(X)+"-"+h(c)+")",y,Y),O.drawImage(B,$+u,A,W-u,I,$,A,W-u,I),O.fillRect($+W-u,A,u,I),O.fillStyle=o,O.globalAlpha=.9,O.fillRect($+W-u,A,u,h((1-j/N)*I))}}},i})}(Ge)),Ge.exports}Si();const ct=(e,t="log")=>{t==="error"?console&&typeof console.error=="function"&&console.error(e):console&&typeof console.info=="function"&&console.info(e)},ne=e=>ct(e,"error"),ki=()=>navigator.getGamepads&&typeof navigator.getGamepads=="function"||navigator.getGamepads&&typeof navigator.webkitGetGamepads=="function"||!1,We=()=>({action:()=>{},after:()=>{},before:()=>{}}),H={ON:"Gamepad detected.",OFF:"Gamepad disconnected.",INVALID_PROPERTY:"Invalid property.",INVALID_VALUE_NUMBER:"Invalid value. It must be a number between 0.00 and 1.00.",INVALID_BUTTON:"Button does not exist.",UNKNOWN_EVENT:"Unknown event name.",NO_SUPPORT:"Your web browser does not support the Gamepad API."},Wi={init:function(e){let t={id:e.index,buttons:e.buttons.length,axes:Math.floor(e.axes.length/2),axeValues:[],axeThreshold:[1],hapticActuator:null,vibrationMode:-1,vibration:!1,mapping:e.mapping,buttonActions:{},axesActions:{},pressed:{},set:function(i,a){if(["axeThreshold"].indexOf(i)>=0){if(i==="axeThreshold"&&(!parseFloat(a)||a<0||a>1)){ne(H.INVALID_VALUE_NUMBER);return}this[i]=a}else ne(H.INVALID_PROPERTY)},vibrate:function(i=.75,a=500){if(this.hapticActuator)switch(this.vibrationMode){case 0:return this.hapticActuator.pulse(i,a);case 1:return this.hapticActuator.playEffect("dual-rumble",{duration:a,strongMagnitude:i,weakMagnitude:i})}},triggerDirectionalAction:function(i,a,n,o,X){n&&o%2===X?(this.pressed[`${i}${a}`]||(this.pressed[`${i}${a}`]=!0,this.axesActions[a][i].before()),this.axesActions[a][i].action()):this.pressed[`${i}${a}`]&&o%2===X&&(delete this.pressed[`${i}${a}`],this.axesActions[a][i].after())},checkStatus:function(){let i={};const a=navigator.getGamepads?navigator.getGamepads():navigator.webkitGetGamepads?navigator.webkitGetGamepads():[];if(a.length){if(i=a[this.id],i.buttons)for(let n=0;n<this.buttons;n++)i.buttons[n].pressed===!0?(this.pressed[`button${n}`]||(this.pressed[`button${n}`]=!0,this.buttonActions[n].before()),this.buttonActions[n].action()):this.pressed[`button${n}`]&&(delete this.pressed[`button${n}`],this.buttonActions[n].after());if(i.axes){const n=i.axes.length%2;for(let o=0;o<this.axes*2;o++){const X=i.axes[o+n].toFixed(4),c=Math.floor(o/2);this.axeValues[c][o%2]=X,this.triggerDirectionalAction("right",c,X>=this.axeThreshold[0],o,0),this.triggerDirectionalAction("left",c,X<=-this.axeThreshold[0],o,0),this.triggerDirectionalAction("down",c,X>=this.axeThreshold[0],o,1),this.triggerDirectionalAction("up",c,X<=-this.axeThreshold[0],o,1)}}}},associateEvent:function(i,a,n){if(i.match(/^button\d+$/)){const o=parseInt(i.match(/^button(\d+)$/)[1]);o>=0&&o<this.buttons?this.buttonActions[o][n]=a:ne(H.INVALID_BUTTON)}else if(i==="start")this.buttonActions[9][n]=a;else if(i==="select")this.buttonActions[8][n]=a;else if(i==="r1")this.buttonActions[5][n]=a;else if(i==="r2")this.buttonActions[7][n]=a;else if(i==="l1")this.buttonActions[4][n]=a;else if(i==="l2")this.buttonActions[6][n]=a;else if(i==="power")this.buttons>=17?this.buttonActions[16][n]=a:ne(H.INVALID_BUTTON);else if(i.match(/^(up|down|left|right)(\d+)$/)){const o=i.match(/^(up|down|left|right)(\d+)$/),X=o[1],c=parseInt(o[2]);c>=0&&c<this.axes?this.axesActions[c][X][n]=a:ne(H.INVALID_BUTTON)}else if(i.match(/^(up|down|left|right)$/)){const o=i.match(/^(up|down|left|right)$/)[1];this.axesActions[0][o][n]=a}return this},on:function(i,a){return this.associateEvent(i,a,"action")},off:function(i){return this.associateEvent(i,function(){},"action")},after:function(i,a){return this.associateEvent(i,a,"after")},before:function(i,a){return this.associateEvent(i,a,"before")}};for(let i=0;i<t.buttons;i++)t.buttonActions[i]=We();for(let i=0;i<t.axes;i++)t.axesActions[i]={down:We(),left:We(),right:We(),up:We()},t.axeValues[i]=[0,0];return e.hapticActuators?typeof e.hapticActuators.pulse=="function"?(t.hapticActuator=e.hapticActuators,t.vibrationMode=0,t.vibration=!0):e.hapticActuators[0]&&typeof e.hapticActuators[0].pulse=="function"&&(t.hapticActuator=e.hapticActuators[0],t.vibrationMode=0,t.vibration=!0):e.vibrationActuator&&typeof e.vibrationActuator.playEffect=="function"&&(t.hapticActuator=e.vibrationActuator,t.vibrationMode=1,t.vibration=!0),t}},ue={gamepads:{},axeThreshold:[1],isReady:ki(),onConnect:function(){},onDisconnect:function(){},onBeforeCycle:function(){},onAfterCycle:function(){},getGamepads:function(){return this.gamepads},getGamepad:function(e){return this.gamepads[e]?this.gamepads[e]:null},set:function(e,t){if(["axeThreshold"].indexOf(e)>=0){if(e==="axeThreshold"&&(!parseFloat(t)||t<0||t>1)){ne(H.INVALID_VALUE_NUMBER);return}if(this[e]=t,e==="axeThreshold"){const a=this.getGamepads(),n=Object.keys(a);for(let o=0;o<n.length;o++)a[n[o]].set("axeThreshold",this.axeThreshold)}}else ne(H.INVALID_PROPERTY)},checkStatus:function(){const e=window.requestAnimationFrame||window.webkitRequestAnimationFrame,t=Object.keys(ue.gamepads);ue.onBeforeCycle();for(let i=0;i<t.length;i++)ue.gamepads[t[i]].checkStatus();ue.onAfterCycle(),t.length>0&&e(ue.checkStatus)},init:function(){window.addEventListener("gamepadconnected",e=>{const t=e.gamepad||e.detail.gamepad;if(ct(H.ON),window.gamepads||(window.gamepads={}),t){if(!window.gamepads[t.index]){window.gamepads[t.index]=t;const i=Wi.init(t);i.set("axeThreshold",this.axeThreshold),this.gamepads[i.id]=i,this.onConnect(this.gamepads[i.id])}Object.keys(this.gamepads).length===1&&this.checkStatus()}}),window.addEventListener("gamepaddisconnected",e=>{const t=e.gamepad||e.detail.gamepad;ct(H.OFF),t&&(delete window.gamepads[t.index],delete this.gamepads[t.index],this.onDisconnect(t.index))})},on:function(e,t){switch(e){case"connect":this.onConnect=t;break;case"disconnect":this.onDisconnect=t;break;case"beforeCycle":case"beforecycle":this.onBeforeCycle=t;break;case"afterCycle":case"aftercycle":this.onAfterCycle=t;break;default:ne(H.UNKNOWN_EVENT);break}return this},off:function(e){switch(e){case"connect":this.onConnect=function(){};break;case"disconnect":this.onDisconnect=function(){};break;case"beforeCycle":case"beforecycle":this.onBeforeCycle=function(){};break;case"afterCycle":case"aftercycle":this.onAfterCycle=function(){};break;default:ne(H.UNKNOWN_EVENT);break}return this}};ue.init();const Ce="The Forgotton Adventures of Kroz",Ze=80,se=25,ye=1,Ye=Ze-16,$e=1,De=se-2,F=63,x=22,b=" ",te=1,vi=5;var ve={},Oe={},Dt;function Oi(){if(Dt)return Oe;Dt=1,Object.defineProperty(Oe,"__esModule",{value:!0}),Oe.MiniSignal=void 0;const e=Symbol("SIGNAL");function t(a){return typeof a=="object"&&e in a}class i{constructor(){this._symbol=Symbol("MiniSignal"),this._refMap=new WeakMap,this._head=void 0,this._tail=void 0,this._dispatching=!1}hasListeners(){return this._head!=null}dispatch(...n){if(this._dispatching)throw new Error("MiniSignal#dispatch(): Signal already dispatching.");let o=this._head;if(o==null)return!1;for(this._dispatching=!0;o!=null;)o.fn(...n),o=o.next;return this._dispatching=!1,!0}add(n){if(typeof n!="function")throw new Error("MiniSignal#add(): First arg must be a Function.");return this._createRef(this._addNode({fn:n}))}detach(n){if(!t(n))throw new Error("MiniSignal#detach(): First arg must be a MiniSignal listener reference.");if(n[e]!==this._symbol)throw new Error("MiniSignal#detach(): MiniSignal listener does not belong to this MiniSignal.");const o=this._refMap.get(n);return o?(this._refMap.delete(n),this._disconnectNode(o),this._destroyNode(o),this):this}detachAll(){let n=this._head;if(n==null)return this;for(this._head=this._tail=void 0,this._refMap=new WeakMap;n!=null;)this._destroyNode(n),n=n.next;return this}_destroyNode(n){n.fn=void 0,n.prev=void 0}_disconnectNode(n){n===this._head?(this._head=n.next,n.next==null&&(this._tail=void 0)):n===this._tail&&(this._tail=n.prev,this._tail!=null&&(this._tail.next=void 0)),n.prev!=null&&(n.prev.next=n.next),n.next!=null&&(n.next.prev=n.prev)}_addNode(n){return this._head==null?(this._head=n,this._tail=n):(this._tail.next=n,n.prev=this._tail,this._tail=n),n}_createRef(n){const o={[e]:this._symbol};return this._refMap.set(o,n),o}_getRef(n){return this._refMap.get(n)}}return Oe.MiniSignal=i,Oe}var It;function Ti(){return It||(It=1,function(e){var t=ve.__createBinding||(Object.create?function(a,n,o,X){X===void 0&&(X=o);var c=Object.getOwnPropertyDescriptor(n,o);(!c||("get"in c?!n.__esModule:c.writable||c.configurable))&&(c={enumerable:!0,get:function(){return n[o]}}),Object.defineProperty(a,X,c)}:function(a,n,o,X){X===void 0&&(X=o),a[X]=n[o]}),i=ve.__exportStar||function(a,n){for(var o in a)o!=="default"&&!Object.prototype.hasOwnProperty.call(n,o)&&t(n,a,o)};Object.defineProperty(e,"__esModule",{value:!0}),i(Oi(),e)}(ve)),ve}var Fi=Ti();function k(e=0){return new Promise(t=>{setTimeout(()=>t(),e)})}function Bt(e,t,i){return Math.min(Math.max(e,t),i)}const He=new Fi.MiniSignal;let de=null;var C=(e=>(e[e.North=1]="North",e[e.South=2]="South",e[e.East=3]="East",e[e.West=4]="West",e[e.Northwest=5]="Northwest",e[e.Northeast=6]="Northeast",e[e.Southwest=7]="Southwest",e[e.Southeast=8]="Southeast",e[e.Whip=9]="Whip",e[e.FreeItems=10]="FreeItems",e[e.NextLevel=11]="NextLevel",e[e.NextLevelCheat=12]="NextLevelCheat",e[e.PrevLevel=13]="PrevLevel",e[e.Teleport=14]="Teleport",e[e.ResetFound=15]="ResetFound",e[e.HideFound=16]="HideFound",e[e.Pause=17]="Pause",e[e.Quit=18]="Quit",e[e.Save=19]="Save",e[e.Restore=20]="Restore",e[e.SlowerClock=21]="SlowerClock",e[e.FasterClock=22]="FasterClock",e))(C||{});const z={},P={},Gt={ArrowUp:1,ArrowDown:2,ArrowLeft:4,ArrowRight:3,U:5,I:1,O:6,J:4,K:3,N:7,M:2,",":8,1:7,2:2,3:8,4:4,6:3,7:5,8:1,9:6,5:9,w:9,W:9,t:14,T:14,")":10,"+":15,"-":16,"(":12,PageDown:null,PageUp:null,p:17,P:17,Escape:18,s:19,S:19,r:20,R:20,F11:21,F12:22},xi={button0:9,button1:14,button4:null,button5:null,button8:19,button9:17,button16:18,up:1,down:2,left:4,right:3,button12:1,button13:2,button14:4,button15:3};function Li(){de||ue.on("connect",e=>{if(!de){de=e,de.axeThreshold=[.5,.5];for(const[t,i]of Object.entries(xi))i&&(de.before(t,()=>{z[t]=P[i]=3}),de.after(t,()=>{(z[t]||0)&3&&He.dispatch(t),z[t]&=-2,z[t]|=4,P[i]&=-2,P[i]|=4}))}})}function Ci(e){if(e.repeat)return;const t=Gt[e.key];z[e.key]=3,t&&(e.preventDefault(),P[t]=3)}function Di(e){(z[e.key]||0)&3&&He.dispatch(e.key),z[e.key]&=-2,z[e.key]|=4;const t=Gt[e.key];t&&(e.preventDefault(),P[t]&=-2,P[t]|=4)}function Ii(){Li(),window.addEventListener("keydown",Ci),window.addEventListener("keyup",Di)}function Ve(){for(const e in z)z[e]&&(z[e]=0)}function pt(){for(const e in P)Object.prototype.hasOwnProperty.call(P,e)&&delete P[e];for(const e in z)Object.prototype.hasOwnProperty.call(z,e)&&delete z[e]}function Ht(){for(const e in P){const t=e;if(!P[t])continue;const i=!!(P[t]&2);P[t]&=-15,i&&(P[t]|=8)}}function J(e){return!!(P[e]&3)&&!(P[e]&8)}function G(e){return!!(P[e]&4)}async function Me(){return pt(),new Promise(e=>{const t=He.add(i=>{He.detach(t),e(i)})})}async function dt(e,t=50){const i=Me();do await(e==null?void 0:e());while(!await Promise.race([i,k(t)]));return i}class gt{getContainer(){return null}setOptions(t){this._options=t}}class mt extends gt{constructor(){super(),this._ctx=document.createElement("canvas").getContext("2d")}schedule(t){requestAnimationFrame(t)}getContainer(){return this._ctx.canvas}setOptions(t){super.setOptions(t);const a=`${t.fontStyle?`${t.fontStyle} `:""} ${t.fontSize}px ${t.fontFamily}`;this._ctx.font=a,this._updateSize(),this._ctx.font=a,this._ctx.textAlign="center",this._ctx.textBaseline="middle"}clear(){const t=this._ctx.globalCompositeOperation;this._ctx.globalCompositeOperation="copy",this._ctx.fillStyle=this._options.bg,this._ctx.fillRect(0,0,this._ctx.canvas.width,this._ctx.canvas.height),this._ctx.globalCompositeOperation=t}eventToPosition(t,i){let a=this._ctx.canvas,n=a.getBoundingClientRect();return t-=n.left,i-=n.top,t*=a.width/n.width,i*=a.height/n.height,t<0||i<0||t>=a.width||i>=a.height?[-1,-1]:this._normalizedEventToPosition(t,i)}}function Mt(e,t){return(e%t+t)%t}class qt extends mt{constructor(){super(),this._spacingX=0,this._spacingY=0,this._hexSize=0}draw(t,i){let[a,n,o,X,c]=t,h=[(a+1)*this._spacingX,n*this._spacingY+this._hexSize];if(this._options.transpose&&h.reverse(),i&&(this._ctx.fillStyle=c,this._fill(h[0],h[1])),!o)return;this._ctx.fillStyle=X;let u=[].concat(o);for(let p=0;p<u.length;p++)this._ctx.fillText(u[p],h[0],Math.ceil(h[1]))}computeSize(t,i){this._options.transpose&&(t+=i,i=t-i,t-=i);let a=Math.floor(t/this._spacingX)-1,n=Math.floor((i-2*this._hexSize)/this._spacingY+1);return[a,n]}computeFontSize(t,i){this._options.transpose&&(t+=i,i=t-i,t-=i);let a=2*t/((this._options.width+1)*Math.sqrt(3))-1,n=i/(2+1.5*(this._options.height-1)),o=Math.min(a,n),X=this._ctx.font;this._ctx.font="100px "+this._options.fontFamily;let c=Math.ceil(this._ctx.measureText("W").width);this._ctx.font=X;let h=c/100;o=Math.floor(o)+1;let u=2*o/(this._options.spacing*(1+h/Math.sqrt(3)));return Math.ceil(u)-1}_normalizedEventToPosition(t,i){let a;this._options.transpose?(t+=i,i=t-i,t-=i,a=this._ctx.canvas.width):a=this._ctx.canvas.height;let n=a/this._options.height;return i=Math.floor(i/n),Mt(i,2)?(t-=this._spacingX,t=1+2*Math.floor(t/(2*this._spacingX))):t=2*Math.floor(t/(2*this._spacingX)),[t,i]}_fill(t,i){let a=this._hexSize,n=this._options.border;const o=this._ctx;o.beginPath(),this._options.transpose?(o.moveTo(t-a+n,i),o.lineTo(t-a/2+n,i+this._spacingX-n),o.lineTo(t+a/2-n,i+this._spacingX-n),o.lineTo(t+a-n,i),o.lineTo(t+a/2-n,i-this._spacingX+n),o.lineTo(t-a/2+n,i-this._spacingX+n),o.lineTo(t-a+n,i)):(o.moveTo(t,i-a+n),o.lineTo(t+this._spacingX-n,i-a/2+n),o.lineTo(t+this._spacingX-n,i+a/2-n),o.lineTo(t,i+a-n),o.lineTo(t-this._spacingX+n,i+a/2-n),o.lineTo(t-this._spacingX+n,i-a/2+n),o.lineTo(t,i-a+n)),o.fill()}_updateSize(){const t=this._options,i=Math.ceil(this._ctx.measureText("W").width);this._hexSize=Math.floor(t.spacing*(t.fontSize+i/Math.sqrt(3))/2),this._spacingX=this._hexSize*Math.sqrt(3)/2,this._spacingY=this._hexSize*1.5;let a,n;t.transpose?(a="height",n="width"):(a="width",n="height"),this._ctx.canvas[a]=Math.ceil((t.width+1)*this._spacingX),this._ctx.canvas[n]=Math.ceil((t.height-1)*this._spacingY+2*this._hexSize)}}class Ie extends mt{constructor(){super(),this._spacingX=0,this._spacingY=0,this._canvasCache={}}setOptions(t){super.setOptions(t),this._canvasCache={}}draw(t,i){Ie.cache?this._drawWithCache(t):this._drawNoCache(t,i)}_drawWithCache(t){let[i,a,n,o,X]=t,c=""+n+o+X,h;if(c in this._canvasCache)h=this._canvasCache[c];else{let u=this._options.border;h=document.createElement("canvas");let p=h.getContext("2d");if(h.width=this._spacingX,h.height=this._spacingY,p.fillStyle=X,p.fillRect(u,u,h.width-u,h.height-u),n){p.fillStyle=o,p.font=this._ctx.font,p.textAlign="center",p.textBaseline="middle";let M=[].concat(n);for(let y=0;y<M.length;y++)p.fillText(M[y],this._spacingX/2,Math.ceil(this._spacingY/2))}this._canvasCache[c]=h}this._ctx.drawImage(h,i*this._spacingX,a*this._spacingY)}_drawNoCache(t,i){let[a,n,o,X,c]=t;if(i){let u=this._options.border;this._ctx.fillStyle=c,this._ctx.fillRect(a*this._spacingX+u,n*this._spacingY+u,this._spacingX-u,this._spacingY-u)}if(!o)return;this._ctx.fillStyle=X;let h=[].concat(o);for(let u=0;u<h.length;u++)this._ctx.fillText(h[u],(a+.5)*this._spacingX,Math.ceil((n+.5)*this._spacingY))}computeSize(t,i){let a=Math.floor(t/this._spacingX),n=Math.floor(i/this._spacingY);return[a,n]}computeFontSize(t,i){let a=Math.floor(t/this._options.width),n=Math.floor(i/this._options.height),o=this._ctx.font;this._ctx.font="100px "+this._options.fontFamily;let X=Math.ceil(this._ctx.measureText("W").width);this._ctx.font=o;let h=X/100*n/a;return h>1&&(n=Math.floor(n/h)),Math.floor(n/this._options.spacing)}_normalizedEventToPosition(t,i){return[Math.floor(t/this._spacingX),Math.floor(i/this._spacingY)]}_updateSize(){const t=this._options,i=Math.ceil(this._ctx.measureText("W").width);this._spacingX=Math.ceil(t.spacing*i),this._spacingY=Math.ceil(t.spacing*t.fontSize),t.forceSquareRatio&&(this._spacingX=this._spacingY=Math.max(this._spacingX,this._spacingY)),this._ctx.canvas.width=t.width*this._spacingX,this._ctx.canvas.height=t.height*this._spacingY}}Ie.cache=!1;class Zt extends mt{constructor(){super(),this._colorCanvas=document.createElement("canvas")}draw(t,i){let[a,n,o,X,c]=t,h=this._options.tileWidth,u=this._options.tileHeight;if(i&&(this._options.tileColorize?this._ctx.clearRect(a*h,n*u,h,u):(this._ctx.fillStyle=c,this._ctx.fillRect(a*h,n*u,h,u))),!o)return;let p=[].concat(o),M=[].concat(X),y=[].concat(c);for(let Y=0;Y<p.length;Y++){let $=this._options.tileMap[p[Y]];if(!$)throw new Error(`Char "${p[Y]}" not found in tileMap`);if(this._options.tileColorize){let A=this._colorCanvas,W=A.getContext("2d");W.globalCompositeOperation="source-over",W.clearRect(0,0,h,u);let I=M[Y],B=y[Y];W.drawImage(this._options.tileSet,$[0],$[1],h,u,0,0,h,u),I!="transparent"&&(W.fillStyle=I,W.globalCompositeOperation="source-atop",W.fillRect(0,0,h,u)),B!="transparent"&&(W.fillStyle=B,W.globalCompositeOperation="destination-over",W.fillRect(0,0,h,u)),this._ctx.drawImage(A,a*h,n*u,h,u)}else this._ctx.drawImage(this._options.tileSet,$[0],$[1],h,u,a*h,n*u,h,u)}}computeSize(t,i){let a=Math.floor(t/this._options.tileWidth),n=Math.floor(i/this._options.tileHeight);return[a,n]}computeFontSize(){throw new Error("Tile backend does not understand font size")}_normalizedEventToPosition(t,i){return[Math.floor(t/this._options.tileWidth),Math.floor(i/this._options.tileHeight)]}_updateSize(){const t=this._options;this._ctx.canvas.width=t.width*t.tileWidth,this._ctx.canvas.height=t.height*t.tileHeight,this._colorCanvas.width=t.tileWidth,this._colorCanvas.height=t.tileHeight}}const Ue=23283064365386963e-26;class wt{constructor(){this._seed=0,this._s0=0,this._s1=0,this._s2=0,this._c=0}getSeed(){return this._seed}setSeed(t){return t=t<1?1/t:t,this._seed=t,this._s0=(t>>>0)*Ue,t=t*69069+1>>>0,this._s1=t*Ue,t=t*69069+1>>>0,this._s2=t*Ue,this._c=1,this}getUniform(){let t=2091639*this._s0+this._c*Ue;return this._s0=this._s1,this._s1=this._s2,this._c=t|0,this._s2=t-this._c,this._s2}getUniformInt(t,i){let a=Math.max(t,i),n=Math.min(t,i);return Math.floor(this.getUniform()*(a-n+1))+n}getNormal(t=0,i=1){let a,n,o;do a=2*this.getUniform()-1,n=2*this.getUniform()-1,o=a*a+n*n;while(o>1||o==0);let X=a*Math.sqrt(-2*Math.log(o)/o);return t+X*i}getPercentage(){return 1+Math.floor(this.getUniform()*100)}getItem(t){return t.length?t[Math.floor(this.getUniform()*t.length)]:null}shuffle(t){let i=[],a=t.slice();for(;a.length;){let n=a.indexOf(this.getItem(a));i.push(a.splice(n,1)[0])}return i}getWeightedValue(t){let i=0;for(let X in t)i+=t[X];let a=this.getUniform()*i,n,o=0;for(n in t)if(o+=t[n],a<o)return n;return n}getState(){return[this._s0,this._s1,this._s2,this._c]}setState(t){return this._s0=t[0],this._s1=t[1],this._s2=t[2],this._c=t[3],this}clone(){return new wt().setState(this.getState())}}const f=new wt().setSeed(Date.now());function jt(e){let t,i;if(e in rt)t=rt[e];else{if(e.charAt(0)=="#"){let n=(e.match(/[0-9a-f]/gi)||[]).map(o=>parseInt(o,16));if(n.length==3)t=n.map(o=>o*17);else{for(let o=0;o<3;o++)n[o+1]+=16*n[o],n.splice(o,1);t=n}}else(i=e.match(/rgb\(([0-9, ]+)\)/i))?t=i[1].split(/\s*,\s*/).map(a=>parseInt(a)):t=[0,0,0];rt[e]=t}return t.slice()}const rt={black:[0,0,0],navy:[0,0,128],darkblue:[0,0,139],mediumblue:[0,0,205],blue:[0,0,255],darkgreen:[0,100,0],green:[0,128,0],teal:[0,128,128],darkcyan:[0,139,139],deepskyblue:[0,191,255],darkturquoise:[0,206,209],mediumspringgreen:[0,250,154],lime:[0,255,0],springgreen:[0,255,127],aqua:[0,255,255],cyan:[0,255,255],midnightblue:[25,25,112],dodgerblue:[30,144,255],forestgreen:[34,139,34],seagreen:[46,139,87],darkslategray:[47,79,79],darkslategrey:[47,79,79],limegreen:[50,205,50],mediumseagreen:[60,179,113],turquoise:[64,224,208],royalblue:[65,105,225],steelblue:[70,130,180],darkslateblue:[72,61,139],mediumturquoise:[72,209,204],indigo:[75,0,130],darkolivegreen:[85,107,47],cadetblue:[95,158,160],cornflowerblue:[100,149,237],mediumaquamarine:[102,205,170],dimgray:[105,105,105],dimgrey:[105,105,105],slateblue:[106,90,205],olivedrab:[107,142,35],slategray:[112,128,144],slategrey:[112,128,144],lightslategray:[119,136,153],lightslategrey:[119,136,153],mediumslateblue:[123,104,238],lawngreen:[124,252,0],chartreuse:[127,255,0],aquamarine:[127,255,212],maroon:[128,0,0],purple:[128,0,128],olive:[128,128,0],gray:[128,128,128],grey:[128,128,128],skyblue:[135,206,235],lightskyblue:[135,206,250],blueviolet:[138,43,226],darkred:[139,0,0],darkmagenta:[139,0,139],saddlebrown:[139,69,19],darkseagreen:[143,188,143],lightgreen:[144,238,144],mediumpurple:[147,112,216],darkviolet:[148,0,211],palegreen:[152,251,152],darkorchid:[153,50,204],yellowgreen:[154,205,50],sienna:[160,82,45],brown:[165,42,42],darkgray:[169,169,169],darkgrey:[169,169,169],lightblue:[173,216,230],greenyellow:[173,255,47],paleturquoise:[175,238,238],lightsteelblue:[176,196,222],powderblue:[176,224,230],firebrick:[178,34,34],darkgoldenrod:[184,134,11],mediumorchid:[186,85,211],rosybrown:[188,143,143],darkkhaki:[189,183,107],silver:[192,192,192],mediumvioletred:[199,21,133],indianred:[205,92,92],peru:[205,133,63],chocolate:[210,105,30],tan:[210,180,140],lightgray:[211,211,211],lightgrey:[211,211,211],palevioletred:[216,112,147],thistle:[216,191,216],orchid:[218,112,214],goldenrod:[218,165,32],crimson:[220,20,60],gainsboro:[220,220,220],plum:[221,160,221],burlywood:[222,184,135],lightcyan:[224,255,255],lavender:[230,230,250],darksalmon:[233,150,122],violet:[238,130,238],palegoldenrod:[238,232,170],lightcoral:[240,128,128],khaki:[240,230,140],aliceblue:[240,248,255],honeydew:[240,255,240],azure:[240,255,255],sandybrown:[244,164,96],wheat:[245,222,179],beige:[245,245,220],whitesmoke:[245,245,245],mintcream:[245,255,250],ghostwhite:[248,248,255],salmon:[250,128,114],antiquewhite:[250,235,215],linen:[250,240,230],lightgoldenrodyellow:[250,250,210],oldlace:[253,245,230],red:[255,0,0],fuchsia:[255,0,255],magenta:[255,0,255],deeppink:[255,20,147],orangered:[255,69,0],tomato:[255,99,71],hotpink:[255,105,180],coral:[255,127,80],darkorange:[255,140,0],lightsalmon:[255,160,122],orange:[255,165,0],lightpink:[255,182,193],pink:[255,192,203],gold:[255,215,0],peachpuff:[255,218,185],navajowhite:[255,222,173],moccasin:[255,228,181],bisque:[255,228,196],mistyrose:[255,228,225],blanchedalmond:[255,235,205],papayawhip:[255,239,213],lavenderblush:[255,240,245],seashell:[255,245,238],cornsilk:[255,248,220],lemonchiffon:[255,250,205],floralwhite:[255,250,240],snow:[255,250,250],yellow:[255,255,0],lightyellow:[255,255,224],ivory:[255,255,240],white:[255,255,255]};class Qt extends gt{constructor(){super(),this._uniforms={};try{this._gl=this._initWebGL()}catch(t){typeof t=="string"?alert(t):t instanceof Error&&alert(t.message)}}static isSupported(){return!!document.createElement("canvas").getContext("webgl2",{preserveDrawingBuffer:!0})}schedule(t){requestAnimationFrame(t)}getContainer(){return this._gl.canvas}setOptions(t){super.setOptions(t),this._updateSize();let i=this._options.tileSet;i&&"complete"in i&&!i.complete?i.addEventListener("load",()=>this._updateTexture(i)):this._updateTexture(i)}draw(t,i){const a=this._gl,n=this._options;let[o,X,c,h,u]=t,p=a.canvas.height-(X+1)*n.tileHeight;if(a.scissor(o*n.tileWidth,p,n.tileWidth,n.tileHeight),i&&(n.tileColorize?a.clearColor(0,0,0,0):a.clearColor(...Ke(u)),a.clear(a.COLOR_BUFFER_BIT)),!c)return;let M=[].concat(c),y=[].concat(u),Y=[].concat(h);a.uniform2fv(this._uniforms.targetPosRel,[o,X]);for(let $=0;$<M.length;$++){let A=this._options.tileMap[M[$]];if(!A)throw new Error(`Char "${M[$]}" not found in tileMap`);a.uniform1f(this._uniforms.colorize,n.tileColorize?1:0),a.uniform2fv(this._uniforms.tilesetPosAbs,A),n.tileColorize&&(a.uniform4fv(this._uniforms.tint,Ke(Y[$])),a.uniform4fv(this._uniforms.bg,Ke(y[$]))),a.drawArrays(a.TRIANGLE_STRIP,0,4)}}clear(){const t=this._gl;t.clearColor(...Ke(this._options.bg)),t.scissor(0,0,t.canvas.width,t.canvas.height),t.clear(t.COLOR_BUFFER_BIT)}computeSize(t,i){let a=Math.floor(t/this._options.tileWidth),n=Math.floor(i/this._options.tileHeight);return[a,n]}computeFontSize(){throw new Error("Tile backend does not understand font size")}eventToPosition(t,i){let a=this._gl.canvas,n=a.getBoundingClientRect();return t-=n.left,i-=n.top,t*=a.width/n.width,i*=a.height/n.height,t<0||i<0||t>=a.width||i>=a.height?[-1,-1]:this._normalizedEventToPosition(t,i)}_initWebGL(){let t=document.createElement("canvas").getContext("webgl2",{preserveDrawingBuffer:!0});window.gl=t;let i=Pi(t,Ei,Ai);return t.useProgram(i),Vi(t),Bi.forEach(a=>this._uniforms[a]=t.getUniformLocation(i,a)),this._program=i,t.enable(t.BLEND),t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA),t.enable(t.SCISSOR_TEST),t}_normalizedEventToPosition(t,i){return[Math.floor(t/this._options.tileWidth),Math.floor(i/this._options.tileHeight)]}_updateSize(){const t=this._gl,i=this._options,a=[i.width*i.tileWidth,i.height*i.tileHeight];t.canvas.width=a[0],t.canvas.height=a[1],t.viewport(0,0,a[0],a[1]),t.uniform2fv(this._uniforms.tileSize,[i.tileWidth,i.tileHeight]),t.uniform2fv(this._uniforms.targetSize,a)}_updateTexture(t){Ui(this._gl,t)}}const Bi=["targetPosRel","tilesetPosAbs","tileSize","targetSize","colorize","bg","tint"],Ei=`
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
}`.trim(),Ai=`
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
}`.trim();function Pi(e,t,i){const a=e.createShader(e.VERTEX_SHADER);if(e.shaderSource(a,t),e.compileShader(a),!e.getShaderParameter(a,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(a)||"");const n=e.createShader(e.FRAGMENT_SHADER);if(e.shaderSource(n,i),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(n)||"");const o=e.createProgram();if(e.attachShader(o,a),e.attachShader(o,n),e.linkProgram(o),!e.getProgramParameter(o,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(o)||"");return o}function Vi(e){const t=new Float32Array([0,0,1,0,0,1,1,1]),i=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0)}function Ui(e,t){let i=e.createTexture();return e.bindTexture(e.TEXTURE_2D,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.REPEAT),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t),i}let lt={};function Ke(e){if(!(e in lt)){let t;if(e=="transparent")t=[0,0,0,0];else if(e.indexOf("rgba")>-1){t=(e.match(/[\d.]+/g)||[]).map(Number);for(let i=0;i<3;i++)t[i]=t[i]/255}else t=jt(e).map(i=>i/255),t.push(1);lt[e]=t}return lt[e]}function Ki(e){return`\x1B[0;48;5;${ht(e)}m\x1B[2J`}function zi(e,t){return`\x1B[0;38;5;${ht(e)};48;5;${ht(t)}m`}function Ni(e,t){return`\x1B[${t+1};${e+1}H`}function ht(e){const a=.0234375;let n=jt(e),o=Math.floor(n[0]*a),X=Math.floor(n[1]*a),c=Math.floor(n[2]*a);return o*36+X*6+c*1+16}class Jt extends gt{constructor(){super(),this._offset=[0,0],this._cursor=[-1,-1],this._lastColor=""}schedule(t){setTimeout(t,1e3/60)}setOptions(t){super.setOptions(t);let i=[t.width,t.height],a=this.computeSize();this._offset=a.map((n,o)=>Math.floor((n-i[o])/2))}clear(){process.stdout.write(Ki(this._options.bg))}draw(t,i){let[a,n,o,X,c]=t,h=this._offset[0]+a,u=this._offset[1]+n,p=this.computeSize();if(h<0||h>=p[0]||u<0||u>=p[1]||((h!==this._cursor[0]||u!==this._cursor[1])&&(process.stdout.write(Ni(h,u)),this._cursor[0]=h,this._cursor[1]=u),i&&(o||(o=" ")),!o))return;let M=zi(X,c);if(M!==this._lastColor&&(process.stdout.write(M),this._lastColor=M),o!="	"){let y=[].concat(o);process.stdout.write(y[0])}this._cursor[0]++,this._cursor[0]>=p[0]&&(this._cursor[0]=0,this._cursor[1]++)}computeFontSize(){throw new Error("Terminal backend has no notion of font size")}eventToPosition(t,i){return[t,i]}computeSize(){return[process.stdout.columns,process.stdout.rows]}}const Gi=/%([bc]){([^}]*)}/g,_e=0,Fe=1,ei=2,ti=3;function Hi(e,t){let i=[],a=0;e.replace(Gi,function(o,X,c,h){let u=e.substring(a,h);return u.length&&i.push({type:_e,value:u}),i.push({type:X=="c"?ei:ti,value:c.trim()}),a=h+o.length,""});let n=e.substring(a);return n.length&&i.push({type:_e,value:n}),qi(i,t)}function qi(e,t){t||(t=1/0);let i=0,a=0,n=-1;for(;i<e.length;){let X=e[i];if(X.type==Fe&&(a=0,n=-1),X.type!=_e){i++;continue}for(;a==0&&X.value.charAt(0)==" ";)X.value=X.value.substring(1);let c=X.value.indexOf(`
`);if(c!=-1){X.value=ze(e,i,c,!0);let h=X.value.split("");for(;h.length&&h[h.length-1]==" ";)h.pop();X.value=h.join("")}if(!X.value.length){e.splice(i,1);continue}if(a+X.value.length>t){let h=-1;for(;;){let u=X.value.indexOf(" ",h+1);if(u==-1||a+u>t)break;h=u}if(h!=-1)X.value=ze(e,i,h,!0);else if(n!=-1){let u=e[n],p=u.value.lastIndexOf(" ");u.value=ze(e,n,p,!0),i=n}else X.value=ze(e,i,t-a,!1)}else a+=X.value.length,X.value.indexOf(" ")!=-1&&(n=i);i++}e.push({type:Fe});let o=null;for(let X=0;X<e.length;X++){let c=e[X];switch(c.type){case _e:o=c;break;case Fe:if(o){let h=o.value.split("");for(;h.length&&h[h.length-1]==" ";)h.pop();o.value=h.join("")}o=null;break}}return e.pop(),e}function ze(e,t,i,a){let n={type:Fe},o={type:_e,value:e[t].value.substring(i+(a?1:0))};return e.splice(t+1,0,n,o),e[t].value.substring(0,i)}let Zi=80,ji=25;const Qi={hex:qt,rect:Ie,tile:Zt,"tile-gl":Qt,term:Jt},Ji={width:Zi,height:ji,transpose:!1,layout:"rect",fontSize:15,spacing:1,border:0,forceSquareRatio:!1,fontFamily:"monospace",fontStyle:"",fg:"#ccc",bg:"#000",tileWidth:32,tileHeight:32,tileMap:{},tileSet:null,tileColorize:!1};class Re{constructor(t={}){this._data={},this._dirty=!1,this._options={},t=Object.assign({},Ji,t),this.setOptions(t),this.DEBUG=this.DEBUG.bind(this),this._tick=this._tick.bind(this),this._backend.schedule(this._tick)}DEBUG(t,i,a){let n=[this._options.bg,this._options.fg];this.draw(t,i,null,null,n[a%n.length])}clear(){this._data={},this._dirty=!0}setOptions(t){if(Object.assign(this._options,t),t.width||t.height||t.fontSize||t.fontFamily||t.spacing||t.layout){if(t.layout){let i=Qi[t.layout];this._backend=new i}this._backend.setOptions(this._options),this._dirty=!0}return this}getOptions(){return this._options}getContainer(){return this._backend.getContainer()}computeSize(t,i){return this._backend.computeSize(t,i)}computeFontSize(t,i){return this._backend.computeFontSize(t,i)}computeTileSize(t,i){let a=Math.floor(t/this._options.width),n=Math.floor(i/this._options.height);return[a,n]}eventToPosition(t){let i,a;return"touches"in t?(i=t.touches[0].clientX,a=t.touches[0].clientY):(i=t.clientX,a=t.clientY),this._backend.eventToPosition(i,a)}draw(t,i,a,n,o){n||(n=this._options.fg),o||(o=this._options.bg);let X=`${t},${i}`;this._data[X]=[t,i,a,n,o],this._dirty!==!0&&(this._dirty||(this._dirty={}),this._dirty[X]=!0)}drawOver(t,i,a,n,o){const X=`${t},${i}`,c=this._data[X];c?(c[2]=a||c[2],c[3]=n||c[3],c[4]=o||c[4]):this.draw(t,i,a,n,o)}drawText(t,i,a,n){let o=null,X=null,c=t,h=i,u=1;n||(n=this._options.width-t);let p=Hi(a,n);for(;p.length;){let M=p.shift();switch(M.type){case _e:let y=!1,Y=!1,$=!1,A=!1;for(let W=0;W<M.value.length;W++){let I=M.value.charCodeAt(W),B=M.value.charAt(W);if(this._options.layout==="term"){let O=I>>8;if(O===17||O>=46&&O<=159||O>=172&&O<=215||I>=43360&&I<=43391){this.draw(c+0,h,B,o,X),this.draw(c+1,h,"	",o,X),c+=2;continue}}$=I>65280&&I<65377||I>65500&&I<65512||I>65518,y=B.charCodeAt(0)==32||B.charCodeAt(0)==12288,A&&!$&&!y&&c++,$&&!Y&&c++,this.draw(c++,h,B,o,X),Y=y,A=$}break;case ei:o=M.value||null;break;case ti:X=M.value||null;break;case Fe:c=t,h++,u++;break}}return u}_tick(){if(this._backend.schedule(this._tick),!!this._dirty){if(this._dirty===!0){this._backend.clear();for(let t in this._data)this._draw(t,!1)}else for(let t in this._dirty)this._draw(t,!0);this._dirty=!1}}_draw(t,i){let a=this._data[t];a[4]!=this._options.bg&&(i=!0),this._backend.draw(a,i)}}Re.Rect=Ie;Re.Hex=qt;Re.Tile=Zt;Re.TileGL=Qt;Re.Term=Jt;var l=(e=>(e[e.Black=0]="Black",e[e.Blue=1]="Blue",e[e.Green=2]="Green",e[e.Cyan=3]="Cyan",e[e.Red=4]="Red",e[e.Magenta=5]="Magenta",e[e.Brown=6]="Brown",e[e.White=7]="White",e[e.Grey=8]="Grey",e[e.LightBlue=9]="LightBlue",e[e.LightGreen=10]="LightGreen",e[e.LightCyan=11]="LightCyan",e[e.LightRed=12]="LightRed",e[e.LightMagenta=13]="LightMagenta",e[e.Yellow=14]="Yellow",e[e.HighIntensityWhite=15]="HighIntensityWhite",e))(l||{});const Z={0:"#000000",1:"#0000AA",2:"#00AA00",3:"#00AAAA",4:"#AA0000",5:"#AA00AA",6:"#AA5500",7:"#AAAAAA",8:"#AAAAAA",9:"#5555FF",10:"#55FF55",11:"#55FFFF",12:"#FF5555",13:"#FF55FF",14:"#FFFF55",15:"#FFFFFF"};let E;function ea(){Re.Rect.cache=!0,E=new Re({width:Ze,height:se,fontFamily:"IBM_VGA, monospace",bg:Z[l.Black],fg:Z[l.White],fontSize:64});const e=E.drawOver;E.drawOver=function(t,i,a,n,o){e.call(this,t,i,a,n,o),this._dirty!==!0&&(this._dirty||(this._dirty={}),this._dirty[`${t},${i}`]=!0)}}function U(e,t,i=E.getOptions().fg,a=E.getOptions().bg){const n=Math.floor((Ze-t.length)/2);S(n,e,t,i,a)}function fe(e=E.getOptions().bg){typeof e=="number"&&(e=Z[e]),E.setOptions({bg:e}),E.clear()}function bt(e,t=E.getOptions().bg){return typeof e=="number"&&e>15&&(e=Date.now()%500<250?e%16:t),typeof e=="number"&&(e=Z[e]),typeof t=="number"&&(t=Z[t]),[e,t]}function we(e,t,i,a=E.getOptions().fg,n=E.getOptions().bg){[a,n]=bt(a,n),E.draw(e,t,i,a,n)}function ta(e,t,i,a=E.getOptions().fg,n=E.getOptions().bg){[a,n]=bt(a,n),E.drawOver(e,t,i,a,n)}function S(e,t,i,a=E.getOptions().fg,n=E.getOptions().bg){return typeof a=="number"&&a>15&&(a=Date.now()%500<250?a:n),typeof n=="number"&&(n=Z[n%16]),typeof a=="number"&&(a=Z[a%16]),E.drawText(e,t,`%c{${a}}%b{${n}}`+i)}function ia(){return E||ea(),E.getContainer()}const je={volume:.3,sampleRate:44100,x:new AudioContext,play:function(...e){return this.playSamples(this.buildSamples(...e))},playSamples:function(...e){const t=this.x.createBuffer(e.length,e[0].length,this.sampleRate),i=this.x.createBufferSource();return e.map((a,n)=>t.getChannelData(n).set(a)),i.buffer=t,i.connect(this.x.destination),i.start(),i},buildSamples:function(e=1,t=.05,i=220,a=0,n=0,o=.1,X=0,c=1,h=0,u=0,p=0,M=0,y=0,Y=0,$=0,A=0,W=0,I=1,B=0,O=0,j=0){let N=Math.PI*2,at=yi=>yi<0?-1:1,K=this.sampleRate,Ri=h*=500*N/K/K,kt=i*=(1+t*2*Math.random()-t)*N/K,nt=[],Xe=0,fi=0,V=0,ke=1,pi=0,di=0,Q=0,st,pe,gi=2,Wt=N*Math.abs(j)*2/K,ot=Math.cos(Wt),vt=Math.sin(Wt)/2/gi,Pe=1+vt,mi=-2*ot/Pe,Mi=(1-vt)/Pe,Ot=(1+at(j)*ot)/2/Pe,wi=-(at(j)+ot)/Pe,bi=Ot,Tt=0,Ft=0,xt=0,Lt=0;for(a=a*K+9,B*=K,n*=K,o*=K,W*=K,u*=500*N/K**3,$*=N/K,p*=N/K,M*=K,y=y*K|0,e*=this.volume,pe=a+B+n+o+W|0;V<pe;nt[V++]=Q*e)++di%(A*100|0)||(Q=X?X>1?X>2?X>3?Math.sin(Xe*Xe):Math.max(Math.min(Math.tan(Xe),1),-1):1-(2*Xe/N%2+2)%2:1-4*Math.abs(Math.round(Xe/N)-Xe/N):Math.sin(Xe),Q=(y?1-O+O*Math.sin(N*V/y):1)*at(Q)*Math.abs(Q)**c*(V<a?V/a:V<a+B?1-(V-a)/B*(1-I):V<a+B+n?I:V<pe-W?(pe-V-W)/o*I:0),Q=W?Q/2+(W>V?0:(V<pe-W?1:(pe-V)/W)*nt[V-W|0]/2/e):Q,j&&(Q=Lt=bi*Tt+wi*(Tt=Ft)+Ot*(Ft=Q)-Mi*xt-mi*(xt=Lt))),st=(i+=h+=u)*Math.cos($*fi++),Xe+=st+st*Y*Math.sin(V**5),ke&&++ke>M&&(i+=p,kt+=p,ke=0),y&&!(++pi%y)&&(i=kt,h=Ri,ke=ke||1);return nt},getNote:function(e=0,t=440){return t*2**(e/12)}};je.volume=.005;function d(e,t,i=1){return je.play(i,0,e,0,t/1e3,0),k(t)}async function ee(){for(let e=1;e<=65;e++)d(f.getUniformInt(1e3,2e3),1);await k(0)}async function Te(){for(let e=150;e>=35;e--)await d(e,1)}async function Et(){await d(400,120,5),await k(10),await d(700,120,5),await k(10)}async function be(){for(let e=1;e<=23;e++)d(f.getUniformInt(350,900),120);await k(120);for(let e=1;e<=30;e++)d(f.getUniformInt(150,200),50)}async function aa(){for(let e=10;e<=90;e++)await d(e,15,100)}async function At(){for(let e=150;e>35;e--)await d(e,16,50)}const na=je.buildSamples(10,0,40,void 0,.1,0,void 0,0,void 0,void 0,void 0,void 0,void 0,1);async function ge(){je.playSamples(na)}async function Pt(){for(let e=1;e<=25;e++)if(Math.random()>.5){const t=f.getUniformInt(0,59)+10;for(let i=1;i<=t;i++)d(f.getUniformInt(0,4e3)+3e3,16,10)}else await k(f.getUniformInt(0,29))}async function sa(){for(let e=10;e<45;e++)for(let t=1;t<13;t++)await d(e*e*t,t+1,100)}async function oa(e){await d(200+200*e,25,100)}async function ra(){await d(2e3,40,10)}async function la(){await d(Math.random()*129+30,150,100)}async function Xa(){await d(70,50*8,100)}async function ca(){for(let e=330;e>20;e--)d(90,10,.5)}async function ha(){await d(400,50)}async function ua(){await d(130,50)}async function Xt(){d(130,25),await d(90,50)}async function Ra(){await d(20,10,100)}async function fa(){await d(300,10,10)}async function pa(){for(let e=45;e>=11;e--)for(let t=13;t>=1;t--)await d(e*e*t,t+1,100)}async function da(){for(let e=70;e<=600;e++)d(e*2,3,10),e%10===0&&await k(1)}async function ga(){await d(30,10,10),await k(20)}async function ma(){for(let e=0;e<2500;e++)d(f.getUniformInt(0,e),5,100),e%25===0&&await k()}async function Ma(){for(let e=2500;e>50;e--)d(f.getUniformInt(0,e),5,100),e%25===0&&await k()}async function wa(){for(let e=0;e<50;e++)d(f.getUniformInt(0,200),50,100);await k(50)}async function ba(){await d(f.getUniformInt(110,1310),7,100)}async function ya(){await d(200,60,100)}async function Ya(){await d(600,20)}async function $a(){await d(90,10,10)}async function _a(){for(let e=130;e>5;e--)await d(e*8,16,100)}async function Sa(){for(let e=20;e<8e3;e++)d(e,1,100);await k(100)}async function ka(){for(let e=5;e<70;e++)d(e*8,1);await k(50)}var s=(e=>(e[e.Border=-1]="Border",e[e.Floor=0]="Floor",e[e.Slow=1]="Slow",e[e.Medium=2]="Medium",e[e.Fast=3]="Fast",e[e.Block=4]="Block",e[e.Whip=5]="Whip",e[e.Stairs=6]="Stairs",e[e.Chest=7]="Chest",e[e.SlowTime=8]="SlowTime",e[e.Gem=9]="Gem",e[e.Invisible=10]="Invisible",e[e.Teleport=11]="Teleport",e[e.Key=12]="Key",e[e.Door=13]="Door",e[e.Wall=14]="Wall",e[e.SpeedTime=15]="SpeedTime",e[e.Trap=16]="Trap",e[e.River=17]="River",e[e.Power=18]="Power",e[e.Forest=19]="Forest",e[e.Tree=20]="Tree",e[e.Bomb=21]="Bomb",e[e.Lava=22]="Lava",e[e.Pit=23]="Pit",e[e.Tome=24]="Tome",e[e.Tunnel=25]="Tunnel",e[e.Freeze=26]="Freeze",e[e.Nugget=27]="Nugget",e[e.Quake=28]="Quake",e[e.IBlock=29]="IBlock",e[e.IWall=30]="IWall",e[e.IDoor=31]="IDoor",e[e.Stop=32]="Stop",e[e.Trap2=33]="Trap2",e[e.Zap=34]="Zap",e[e.Create=35]="Create",e[e.Generator=36]="Generator",e[e.Trap3=37]="Trap3",e[e.MBlock=38]="MBlock",e[e.Trap4=39]="Trap4",e[e.Player=40]="Player",e[e.ShowGems=41]="ShowGems",e[e.Tablet=42]="Tablet",e[e.ZBlock=43]="ZBlock",e[e.BlockSpell=44]="BlockSpell",e[e.Chance=45]="Chance",e[e.Statue=46]="Statue",e[e.WallVanish=47]="WallVanish",e[e.K=48]="K",e[e.R=49]="R",e[e.O=50]="O",e[e.Z=51]="Z",e[e.OWall1=52]="OWall1",e[e.OWall2=53]="OWall2",e[e.OWall3=54]="OWall3",e[e.CWall1=55]="CWall1",e[e.CWall2=56]="CWall2",e[e.CWall3=57]="CWall3",e[e.OSpell1=58]="OSpell1",e[e.OSpell2=59]="OSpell2",e[e.OSpell3=60]="OSpell3",e[e.CSpell1=61]="CSpell1",e[e.CSpell2=62]="CSpell2",e[e.CSpell3=63]="CSpell3",e[e.GBlock=64]="GBlock",e[e.Rock=65]="Rock",e[e.EWall=66]="EWall",e[e.Trap5=67]="Trap5",e[e.TBlock=68]="TBlock",e[e.TRock=69]="TRock",e[e.TGem=70]="TGem",e[e.TBlind=71]="TBlind",e[e.TWhip=72]="TWhip",e[e.TGold=73]="TGold",e[e.TTree=74]="TTree",e[e.Rope=75]="Rope",e[e.DropRope=76]="DropRope",e[e.DropRope2=77]="DropRope2",e[e.DropRope3=78]="DropRope3",e[e.DropRope4=79]="DropRope4",e[e.DropRope5=80]="DropRope5",e[e.Amulet=81]="Amulet",e[e.ShootRight=82]="ShootRight",e[e.ShootLeft=83]="ShootLeft",e[e.Trap6=224]="Trap6",e[e.Trap7=225]="Trap7",e[e.Trap8=226]="Trap8",e[e.Trap9=227]="Trap9",e[e.Trap10=228]="Trap10",e[e.Trap11=229]="Trap11",e[e.Trap12=230]="Trap12",e[e.Trap13=231]="Trap13",e[e.Message=252]="Message",e))(s||{});const re={[-1]:"▒",0:b,1:"Ä",2:"Ö",3:"Ω",4:"▓",5:"⌠",6:"≡",7:"C",8:"Φ",9:"♦",10:"¡",11:"↑",12:"î",13:"∞",14:"█",15:"Θ",16:"∙",17:"≈",18:"○",19:"█",20:"♣",21:"¥",22:"▓",23:"░",24:"■",25:"∩",26:"ƒ",27:"☼",28:b,29:b,30:b,31:b,32:b,33:b,34:"▲",35:"▼",36:"♠",37:b,38:"▓",39:b,40:"☻",41:b,42:"■",43:"▓",44:b,45:"?",46:"☺",47:b,48:"K",49:"R",50:"O",51:"Z",52:"█",53:"█",54:"█",55:b,56:b,57:b,58:"⌂",59:"⌂",60:"⌂",61:b,62:b,63:b,64:"▓",65:"O",66:"X",67:b,68:b,69:b,70:b,71:b,72:b,73:b,74:b,75:"│",76:"↓",77:"↓",78:"↓",79:"↓",80:"↓",81:"♀",82:"→",83:"←",224:b,225:b,226:b,227:b,228:b,229:b,230:b,231:b,252:"♣"},Wa={" ":0,1:1,2:2,3:3,X:4,W:5,L:6,C:7,S:8,"+":9,I:10,T:11,K:12,D:13,"#":14,F:15,".":16,R:17,Q:18,"/":19,"\\":20,"♣":20,B:21,V:22,"=":23,A:24,U:25,Z:26,"*":27,E:28,";":29,":":30,"`":31,"-":32,"@":33,"%":34,"]":35,G:36,")":37,M:38,"(":39,P:40,"&":41,"!":42,O:43,H:44,"?":45,">":46,N:47,"<":48,"[":49,"|":50,'"':51,4:52,5:53,6:54,7:55,8:56,9:57,ñ:58,ò:59,ó:60,ô:61,õ:62,ö:63,Y:64,0:65,"~":66,$:67,"‘":68,"’":69,"“":70,"”":71,"•":72,"–":73,"—":74,"³":75,"¹":76,º:77,"»":78,"¼":79,"½":80,ƒ:81,"¯":82,"®":83,à:224,á:225,â:226,ã:227,ä:228,å:229,æ:230,ç:231,ü:252},T={[-1]:[l.LightBlue,l.Black],0:[l.Black,l.Black],1:[l.LightRed,null],2:[l.LightBlue,null],3:[l.Green,null],4:[l.Brown,null],5:[l.HighIntensityWhite,null],6:[l.Black|16,l.White],7:[l.Yellow,l.Red],8:[l.LightCyan,null],9:[l.Blue,null],10:[l.Green,null],11:[l.LightMagenta,null],12:[l.LightRed,null],13:[l.Cyan,l.Magenta],14:[l.Brown,l.Brown],15:[l.LightCyan,null],16:[l.White,null],17:[l.LightBlue,l.Blue],18:[l.HighIntensityWhite,null],19:[l.Green,l.Green],20:[l.Brown,l.Green],21:[l.HighIntensityWhite,null],22:[l.LightRed,l.Red],23:[l.White,null],24:[l.HighIntensityWhite|32,l.Magenta],25:[l.HighIntensityWhite,null],26:[l.LightCyan,null],27:[l.Yellow,null],28:[l.HighIntensityWhite,null],29:[null,null],30:[null,null],31:[null,null],32:[null,null],34:[l.LightRed,null],35:[l.HighIntensityWhite,null],36:[l.Yellow|16,null],38:[l.Brown,null],33:[null,null],37:[null,null],39:[null,null],67:[null,null],224:[null,null],225:[null,null],226:[null,null],227:[null,null],228:[null,null],229:[null,null],230:[null,null],231:[null,null],40:[l.Yellow,l.Black],41:[null,null],42:[l.LightBlue,null],43:[l.Brown,null],44:[null,null],45:[l.HighIntensityWhite,null],46:[l.HighIntensityWhite|16,null],48:[l.Yellow,null],49:[l.Yellow,null],50:[l.Yellow,null],51:[l.Yellow,null],52:[l.Brown,l.Brown],53:[l.Brown,l.Brown],54:[l.White,l.White],55:[null,null],56:[null,null],57:[null,null],58:[l.LightCyan,null],59:[l.LightCyan,null],60:[l.LightCyan,null],61:[null,null],62:[null,null],63:[null,null],64:[l.White,l.Black],65:[l.White,null],66:[l.LightRed,l.Red],68:[null,null],69:[null,null],70:[null,null],71:[null,null],72:[null,null],73:[null,null],74:[null,null],47:[l.HighIntensityWhite,null],75:[l.White,null],76:[l.White,null],77:[l.White,null],78:[l.White,null],79:[l.White,null],80:[l.White,null],82:[l.White,null],83:[l.White,null],81:[l.HighIntensityWhite|16,null],252:[l.Brown,l.Green]},va={[-1]:"An Electrified Wall blocks your way.",4:"A Breakable Wall blocks your way",5:"You have found a Whip",6:"Stairs take you to the next lower level.",7:"`You found gems and whips inside the chest!",8:"You activated a Slow Time spell.",9:"Gems give you both points and strength.",10:"Oh no, a temporary Blindness Potion!",11:"You found a Teleport scroll.",12:"Use Keys to unlock doors.",13:"The Door opens!  (One of your Keys is used.)",14:"A Solid Wall blocks your way.",17:"You cannot travel through Water.",15:"You activated a Speed Creature spell.",16:"You activated a Teleport trap!",18:"A Power Ring--your whip is now a little stronger!",20:"A tree blocks your way.",19:"You cannot travel through forest terrain.",21:"You activated a Magic Bomb!",22:"Oooooooooooooooooooh!  Lava hurts!  (Lose 10 Gems.)",23:"* SPLAT!! *",24:"The Sacred Tome of Kroz is finally yours--50,000 points!",25:"You passed through a secret Tunnel!",26:"You have activated a Freeze Creature spell!",27:"You found a Gold Nugget...500 points!",28:"Oh no, you set off an Earthquake trap!",29:"An Invisible Crumbled Wall blocks your way.",31:"An Invisible Door blocks your way.",34:"A Creature Zap Spell!",35:"A Creature Creation Trap!",36:"You have discovered a Creature Generator!",38:"A Moving Wall blocks your way.",41:"Yah Hoo! You discovered a Reveal Gems Scroll!",42:"You found an Ancient Tablet of Wisdom...2,500 points!",44:"You triggered Exploding Walls!",45:"You found a Pouch containing Gems!",46:"Statues are very dangerous...they drain your Gems!",47:"Yikes!  A trap has made many of the wall sections invisible!",51:"Super Kroz Bonus -- 10,000 points!",52:"A Solid Wall blocks your way.",58:"Magic has been released is this chamber!",59:"Magic has been released is this chamber!",60:"Magic has been released is this chamber!",61:"New Walls have magically appeared!",62:"New Walls have magically appeared!",63:"New Walls have magically appeared!",65:"You pushed a big Boulder!",66:"You hit a Electrified Wall!  You lose one Gem.",75:"You grabbed a Rope.",81:"YOUR QUEST FOR THE AMULET WAS SUCCESSFUL!"},yt=[3,2,1],ii=[5,9,11],Oa=[8,10,15,26],Be=[33,37,39,67,224,225,226,227,228,229,230,231],ai=[16,...Be],Ta=[29,30,31],ni=[48,49,50,51],Fa=[52,53,54],Qe=[55,56,57],xa=[58,59,60],Yt=[61,62,63],Ee=[68,69,70,71,72,73,74],La=[76,77,78,79,80],Vt=[...yt,4,...Ta,43,64,38,...Ee,13,...ai,19,28,32,35,36,45,...ni],Ca=[0,...yt,...ii,...Oa,7,...ai,32],Da=[0,32,...Be,41,44,47,...Qe,...Yt,...Ee],Ia=[0,32,...Be,41,47,...Ee],Ba=[0,32,41,44,47,...Qe,...Yt,...Ee,...Be],Ea=[...ii,7,8,10,12,16,18,21,26,27,34,35,42,45,...ni,...xa,...La,82,83],Aa=[6,23],Pa=[0,32,...Be,...Qe],Va=[4,6,13,14,22,25,31,36,38,42,43,46,...Fa,64,65,66,81],Ua=[0,17,23,28,29,30,32,33,37,39,67,41,44,47,...Qe,...Yt,...Ee,75],Ut={7:1/20,8:1/35,12:1/25,15:1/10,18:1/15,21:1/40,28:1/15,47:1/20},Ka=structuredClone(re),za=structuredClone(T);function Na(){Object.assign(re,Ka),Object.assign(T,za)}const Ga=`
          ¯         ñò=óW:C*+TKQ]&ü%SFZIARE/.♣      ®  #1#1#1#1#
 #######                                               # # # # #
  3 3  # #chest C C    ®              ¯    # # wall### # # # # #
   3   # ##nugg * *    ®   ñ444999ö   ¯    R R river## # # # # #
¯ 3 3  # ###gem + +    ®   ò555888õ   ¯    / / forest# # # # # #
 ####### showge & &    ®   ó666777ô   ¯    ♣ ♣ tree### #X#X#X#X#
         ##tele T T    ®   ::::####   ¯    V V lava### #2#2#2#2#
         ###key K K    ®              ¯    = = pit#### # # # # #
         #power Q Q    ®              ¯    X X block## # # # # #
 ####### ##whip W W    ®              ¯    ~ ~ ewall## # # # # #
  2 2  # create ] ]    ®      P       -                # # # # #
   2   #                                               #X#X#X#X#
¯ 2 2  #                  XXXXXXXXXXX     0 0 0        #3#3#3#3#
 ####### messag ü ü    ®  XXXXXXXXXXX ¯  0 0 0  rock## # # # # #
         ###zap % %    ®  XXXXXXXXXXX ¯  R~LB=V        # # # # #
         ##slow S S    ®  XXXXXXXXXXX ¯   <[|"  kroz## # # # # #
         #speed F F    ®  XXXXXXXXXXX ¯    D D  door## # # # # #
 ####### #freez Z Z    ®       B      ¯    U U  tunnel #X#X#X#X#
  1 1  # ###inv I I    ®  ###bomb####                  #########
   1   # tablet ! !    ®  #X]1 2 3AX# ¯    . .  traps#
¯ 1 1  # #amule ƒ ƒ    ®  XXXXXXXXXXX ¯    & &  show##  S
 ####### ##tome A A    ®  XDZ/EWLCSVX ¯    E E  quake#    F
                       ®  XXXXXXXXXXX ¯    T T              Z
`,Ha={id:"Debug",map:Ga,tabletMessage:"This is a debug level"},qa=`
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
`,Za={id:"Lost1",map:qa,tabletMessage:"Once again you uncover the hidden tunnel leading to Kroz!"},ja=`
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
`;async function Qa(){r.map.hideType(s.Gem),r.map.hideType(s.Stairs)}const Ja={id:"Lost2",map:ja,onLevelStart:Qa,tabletMessage:"Warning to all Adventurers:  No one returns from Kroz!"},en=`
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
`;async function tn(){r.map.hideType(s.Gem)}const an={id:"Lost4",map:en,onLevelStart:tn,tabletMessage:"Adventurer, try the top right corner if you desire."},nn=`
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
666222222222666-------------66---Z66--------------------------66`,sn={id:"Lost11",map:nn,tabletMessage:"The tunnel below contains a magic spell."},on=`
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
K----------------------------3333333---------------------------K`;async function rn(){r.map.hideType(s.Create),r.map.hideType(s.MBlock)}const ln={id:"Lost18",map:on,onLevelStart:rn,tabletMessage:'Adventurer, check the "Valley of the M"!'},Xn=`
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
-~--~-~~-~-~~--~--~~-~~--D-D-++ñLñWW-D-D--~~-~~-~--~-~~--~--~-~-`;async function cn(){r.map.hideType(s.OWall1),r.map.hideType(s.OWall2),r.map.hideType(s.OWall3)}const hn={id:"Lost20",map:Xn,onLevelStart:cn},un=`
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
`;async function Rn(){r.map.hideType(s.Create),r.map.hideType(s.Gem)}async function fn(){await g(`No one has ever made it to the ${R.levelIndex} level!`),await g("You have shown exceptional skills to reach this far..."),await g("Therefore I grant you the power to see...");for(let e=0;e<=F;e++)for(let t=0;t<=x;t++)r.map.getType(e,t)===s.IWall&&(await d(e*t,1,10),r.map.setType(e,t,s.OWall3),v(e,t));await g("Behold...your path awaits...")}const pn={id:"Lost26",map:un,onLevelStart:Rn,tabletMessage:fn},dn="Lost30",gn=`
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
`;async function mn(){r.map.hideType(s.Create)}async function Mn(){await it(),await g('"If goodness is in my heart, that which flows shall..."');for(let e=0;e<=F;e++)for(let t=0;t<=x;t++)r.map.getType(e,t)===s.River&&(await d(e*t,50,10),r.map.setType(e,t,s.Nugget),v(e,t));await g('"...Turn to Gold!"')}const wn={id:dn,map:gn,onLevelStart:mn,tabletMessage:Mn};class he{constructor(t,i={}){ae(this,"replacement",s.Floor);ae(this,"ch",b);ae(this,"fg",T[s.Floor][0]);ae(this,"bg",T[s.Floor][1]);ae(this,"x",0);ae(this,"y",0);this.type=t;const{x:a,y:n}=i;let{ch:o,fg:X,bg:c}=i;X===null&&(X=T[s.Floor][0]),c===null&&(c=T[s.Floor][1]),typeof t=="string"?(o??(o=t.toLocaleUpperCase()),X??(X=l.HighIntensityWhite),c??(c=l.Brown)):(o??(o=re[t]),X??(X=T[t][0]??T[s.Floor][0]),c??(c=T[t][1]??T[s.Floor][1])),this.ch=o??b,this.fg=X,this.bg=c,this.x=a??0,this.y=n??0}}const bn=`
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
`;async function yn(){for(let e=0;e<=F;e++)for(let t=0;t<=x;t++){const i=r.map.get(e,t);i&&r.map.set(e,t,new he(i.type,{x:e,y:t,ch:i.ch,fg:null,bg:null}))}}const Yn={id:"Lost34",map:bn,onLevelStart:yn},$n=`
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
`;async function _n(){await it(),await g('"Barriers of water, like barriers in life, can always be..."');for(let e=0;e<=F;e++)for(let t=0;t<=x;t++)r.map.getType(e,t)===s.River&&(await d(e*t,50,10),r.map.setType(e,t,s.Block),v(e,t));await g('"...Overcome!"')}const Sn={id:"Lost42",map:$n,tabletMessage:_n},kn=`
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
`,Wn={id:"Lost70",map:kn},vn=`
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
`,On={id:"Lost46",map:vn,tabletMessage:"Follow the sequence if you wish to be successful."},Tn=`
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
`,Fn={id:"Lost48",map:Tn},xn=`
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
`;async function Ln(){r.map.updateEntities(s.Floor,{ch:".",fg:l.White,bg:l.Black}),r.map.hideType(s.Create),r.map.hideType(s.MBlock)}const Cn={id:"Lost52",map:xn,onLevelStart:Ln,tabletMessage:"Up 4 steps, then left 16 steps."},Dn=`
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
`;async function In(){r.map.hideType(s.Create),r.map.hideType(s.MBlock),r.map.hideType(s.OWall1),r.map.hideType(s.OWall2),r.map.hideType(s.OWall3),r.map.hideType(s.Trap)}const Bn={id:"Lost59",map:Dn,onLevelStart:In},En=`
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
`;function An(){r.map.updateEntities(s.Fast,{ch:"☺"})}async function Pn(){await g("Walls that block your progress shall be removed..."),r.map.setType(r.player.x,r.player.y,s.OSpell1),ci(0,0)}const Vn={id:"Lost61",map:En,onLevelStart:An,tabletMessage:Pn},Un=`
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
`;function Kn(){r.map.updateEntities(s.Fast,{ch:"☺"})}async function zn(){await it(),await g('"Tnarg yna rerutnevda ohw sevivrus siht raf..."');for(let e=0;e<=F;e++)for(let t=0;t<=x;t++)r.map.getType(e,t)===s.CWall1&&(await d(e*t,50,10),r.map.setType(e,t,s.Nugget),v(e,t));await g('"...Dlog!"')}const Nn={id:"Lost64",map:Un,onLevelStart:Kn,tabletMessage:zn},Gn=`
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
`;async function Hn(){r.magicEwalls=!0,r.evapoRate=22,r.map.hideType(s.Create)}async function qn(){await it(),await g('"Ttocs Rellim Setalutargnoc Uoy!"'),await g("Your palms sweat as the words echo through the chamber...");for(let e=0;e<=F;e++)for(let t=0;t<=x;t++)r.map.getType(e,t)===s.Pit&&(await d(e*t,50,10),r.map.setType(e,t,s.Rock),v(e,t));await g("...Your eyes widen with anticipation!")}const Zn={id:"Lost75",map:Gn,onLevelStart:Hn,tabletMessage:qn},jn=`
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
L2  +  X      #kingdom#of#kroz#ii#by#scott#miller#      X  +  2L`,Qn={id:"Kingdom1",map:jn,tabletMessage:"Once again you uncover the hidden tunnel leading to Kroz!"},Jn=`
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
                                                          I##LLL`,es={id:"Kingdom2",map:Jn,tabletMessage:"Warning to all Adventurers:  No one returns from Kroz!"},ts=`
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
22222#      #####       @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#L`,is={id:"Kingdom4",map:ts,tabletMessage:"Adventurer, try the top right corner if you desire."},as=`
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
-----##RRRR##%X---U----##RRR#K##--------#111#--------------#111#`;async function ns(){r.map.hideType(s.OWall1),r.map.hideType(s.OWall2),r.map.hideType(s.OWall3)}const ss={id:"Kingdom6",map:as,tabletMessage:"A strange magical gravity force is tugging you downward!",onLevelStart:ns},os=`
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
00C000000********3000##VVV##0-------------00000000bouldervilleÃ0`,rs={id:"Kingdom12",map:os,tabletMessage:"The lava will block a slow Adventurer's path!"},ls=`
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
CXXX   2    2  2 2    2 2     2    2  2  2   2    2  2    2    +`,Xs={id:"Caverns2",map:ls},cs=`
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
         1       +            1         +               1       `,hs={id:"Caverns4",map:cs},Je=[Ha,Za,Ja,an,Xs,hs,Qn,es,is,ss,sn,rs,ln,hn,pn,wn,Yn,Sn,On,Fn,Cn,Bn,Vn,Nn,Wn,Zn];function us(e){const t=e.split(`
`).filter(i=>i.length>0);for(let i=0;i<t.length;i++){const a=t[i];for(let n=0;n<a.length;n++){const o=a.charAt(n)??b,X=Wa[o];switch(r.map.setType(n,i,X??o),o){case"Ã":r.map.setType(n,i,"!");break;case"´":r.map.setType(n,i,".");break;case"µ":r.map.setType(n,i,"?");break;case"¶":r.map.setType(n,i,"'");break;case"·":r.map.setType(n,i,",");break;case"¸":r.map.setType(n,i,":");break;case"ú":r.map.setType(n,i,"·");break;case"ù":r.map.setType(n,i,"∙");break;case"ï":r.map.setType(n,i,"∩");break}switch(Ut[X]&&Math.random()<Ut[X]&&r.map.set(n,i,new he(X,{x:n,y:i,ch:re[s.Chance],fg:T[s.Chance][0],bg:T[s.Chance][1]})),X){case s.Player:r.player.x=n,r.player.y=i,r.map.set(n,i,r.player);break;case s.Slow:case s.Medium:case s.Fast:case s.MBlock:{const c=new he(X,{x:n,y:i});r.entities.push(c),r.map.set(n,i,c);break}case s.Generator:r.genNum++;break;case s.Statue:r.T[D.StatueGemDrain]=32e3;break}}}T[s.Gem]=[f.getUniformInt(1,15),null],T[s.Border]=[f.getUniformInt(8,15),f.getUniformInt(1,8)]}async function et(){var t;bs();const e=Je[R.levelIndex];r.tabletMessage=e.tabletMessage,Na(),us(e.map),(t=e==null?void 0:e.onLevelStart)==null||t.call(e),ys(),Rt(),await g("Press any key to begin this level.")}async function si(){pt(),R.levelIndex=Mt(R.levelIndex+1,Je.length),R.levelIndex%10===0&&await Ws(),await et()}async function Rs(){pt(),R.levelIndex=Mt(R.levelIndex-1,Je.length),await et()}class fs{constructor(t=F+1,i=x+1){ae(this,"PF",[]);this.width=t,this.height=i}get(t,i){var a,n;return t<0||t>=this.width||i<0||i>=this.height?null:(n=(a=this.PF)==null?void 0:a[t])==null?void 0:n[i]}set(t,i,a){var n;t<0||t>=this.width||i<0||i>=this.height||((n=this.PF)[t]??(n[t]=[]),this.PF[t][i]=a)}getType(t,i){var n;if(t<0||t>=this.width||i<0||i>=this.height)return s.Border;const a=(n=this.get(t,i))==null?void 0:n.type;return typeof a=="string"?a:a??s.Floor}setType(t,i,a){const n=new he(a,{x:t,y:i});this.set(t,i,n)}findRandomEmptySpace(){for(;;){const t=f.getUniformInt(0,F),i=f.getUniformInt(0,x);if(this.getType(t,i)===s.Floor)return[t,i]}}replaceEntities(t,i){for(let a=0;a<this.width;a++)for(let n=0;n<this.height;n++)this.getType(a,n)===t&&((typeof i=="string"||typeof i=="number")&&(i=new he(i,{x:a,y:n})),this.set(a,n,i))}updateEntities(t,i){for(let a=0;a<this.width;a++)for(let n=0;n<this.height;n++){const o=this.get(a,n);(o==null?void 0:o.type)===t&&Object.assign(o,i)}}hideType(t){for(let i=0;i<this.width;i++)for(let a=0;a<this.height;a++){const n=this.get(i,a);(n==null?void 0:n.type)===t&&(n.ch=re[s.Floor],n.fg=T[s.Floor][0],n.bg=T[s.Floor][1])}}}class Kt{constructor(){this.heap=[],this.timestamp=0}lessThan(t,i){return t.key==i.key?t.timestamp<i.timestamp:t.key<i.key}shift(t){this.heap=this.heap.map(({key:i,value:a,timestamp:n})=>({key:i+t,value:a,timestamp:n}))}len(){return this.heap.length}push(t,i){this.timestamp+=1;const a=this.len();this.heap.push({value:t,timestamp:this.timestamp,key:i}),this.updateUp(a)}pop(){if(this.len()==0)throw new Error("no element to pop");const t=this.heap[0];return this.len()>1?(this.heap[0]=this.heap.pop(),this.updateDown(0)):this.heap.pop(),t}find(t){for(let i=0;i<this.len();i++)if(t==this.heap[i].value)return this.heap[i];return null}remove(t){let i=null;for(let a=0;a<this.len();a++)t==this.heap[a].value&&(i=a);if(i===null)return!1;if(this.len()>1){let a=this.heap.pop();return a.value!=t&&(this.heap[i]=a,this.updateDown(i)),!0}else this.heap.pop();return!0}parentNode(t){return Math.floor((t-1)/2)}leftChildNode(t){return 2*t+1}rightChildNode(t){return 2*t+2}existNode(t){return t>=0&&t<this.heap.length}swap(t,i){const a=this.heap[t];this.heap[t]=this.heap[i],this.heap[i]=a}minNode(t){const i=t.filter(this.existNode.bind(this));let a=i[0];for(const n of i)this.lessThan(this.heap[n],this.heap[a])&&(a=n);return a}updateUp(t){if(t==0)return;const i=this.parentNode(t);this.existNode(i)&&this.lessThan(this.heap[t],this.heap[i])&&(this.swap(t,i),this.updateUp(i))}updateDown(t){const i=this.leftChildNode(t),a=this.rightChildNode(t);if(!this.existNode(i))return;const n=this.minNode([t,i,a]);n!=t&&(this.swap(t,n),this.updateDown(n))}debugPrint(){console.log(this.heap)}}class ps{constructor(){this._time=0,this._events=new Kt}getTime(){return this._time}clear(){return this._events=new Kt,this}add(t,i){this._events.push(t,i)}get(){if(!this._events.len())return null;let{key:t,value:i}=this._events.pop();return t>0&&(this._time+=t,this._events.shift(-t)),i}getEventTime(t){const i=this._events.find(t);if(i){const{key:a}=i;return a}}remove(t){return this._events.remove(t)}}let $t=class{constructor(){this._queue=new ps,this._repeat=[],this._current=null}getTime(){return this._queue.getTime()}add(t,i){return i&&this._repeat.push(t),this}getTimeOf(t){return this._queue.getEventTime(t)}clear(){return this._queue.clear(),this._repeat=[],this._current=null,this}remove(t){let i=this._queue.remove(t),a=this._repeat.indexOf(t);return a!=-1&&this._repeat.splice(a,1),this._current==t&&(this._current=null),i}next(){return this._current=this._queue.get(),this._current}};class ds extends $t{add(t,i){return this._queue.add(t,0),super.add(t,i)}next(){return this._current!==null&&this._repeat.indexOf(this._current)!=-1&&this._queue.add(this._current,0),super.next()}}class gs extends $t{add(t,i,a){return this._queue.add(t,a!==void 0?a:1/t.getSpeed()),super.add(t,i)}next(){return this._current&&this._repeat.indexOf(this._current)!=-1&&this._queue.add(this._current,1/this._current.getSpeed()),super.next()}}class ms extends $t{constructor(){super(),this._defaultDuration=1,this._duration=this._defaultDuration}add(t,i,a){return this._queue.add(t,a||this._defaultDuration),super.add(t,i)}clear(){return this._duration=this._defaultDuration,super.clear()}remove(t){return t==this._current&&(this._duration=this._defaultDuration),super.remove(t)}next(){return this._current!==null&&this._repeat.indexOf(this._current)!=-1&&(this._queue.add(this._current,this._duration||this._defaultDuration),this._duration=this._defaultDuration),super.next()}setDuration(t){return this._current&&(this._duration=t),this}}const Ms={Simple:ds,Speed:gs,Action:ms};var D=(e=>(e[e.SlowTime=4]="SlowTime",e[e.Invisible=5]="Invisible",e[e.SpeedTime=6]="SpeedTime",e[e.FreezeTime=7]="FreezeTime",e[e.StatueGemDrain=9]="StatueGemDrain",e))(D||{});function tt(){return{levelIndex:1,score:0,gems:20,whips:0,teleports:0,keys:0,whipPower:2}}function _t(){return{bonus:0,genNum:0,magicEwalls:!1,evapoRate:0,treeRate:0,lavaRate:0,lavaFlow:!1,level:null,player:new he(s.Player),entities:[],map:new fs,replacement:s.Floor,T:[0,0,0,0,0,0,0,0,0,0],tabletMessage:void 0}}function oi(){return{difficulty:8,clockScale:vi,paused:!1,done:!1,foundSet:new Set}}const R=tt(),r=_t(),L=oi(),ri=tt(),ut=tt();function ws(){Object.assign(R,tt()),Object.assign(r,_t()),Object.assign(L,oi())}function bs(){Object.assign(r,_t())}function ys(){Object.assign(ri,R)}async function Ys(){let e="";for(;e.toLowerCase()!=="y"&&e.toLowerCase()!=="n";)e=await g("Are you sure you want to SAVE? (Y/N)");e.toLowerCase()==="y"&&(Object.assign(ut,ri),localStorage.setItem("Kroz--saveState--v1",JSON.stringify(ut)))}async function $s(){let e="";for(;e.toLowerCase()!=="y"&&e.toLowerCase()!=="n";)e=await g("Are you sure you want to RESTORE? (Y/N)");if(e.toLowerCase()==="y"){let t=ut;const i=localStorage.getItem("Kroz--saveState--v1");if(i)try{t=JSON.parse(i)}catch(a){console.error(a)}Object.assign(R,t),await et()}}function _(e){switch(e){case s.Border:R.score>R.levelIndex&&(R.score-=R.levelIndex/2);break;case s.Slow:case s.Medium:case s.Fast:R.score+=e;break;case s.Block:case s.ZBlock:case s.GBlock:case s.Wall:case s.River:case s.Tree:case s.Forest:case s.MBlock:case s.OWall1:case s.OWall2:case s.OWall3:case s.EWall:R.score>2&&(R.score-=2);break;case s.Whip:case s.SlowTime:case s.Bomb:R.score++;break;case s.Stairs:R.score+=R.levelIndex*5;break;case s.Chest:R.score+=10+Math.floor(R.levelIndex/2);break;case s.Gem:R.score+=Math.floor(R.levelIndex/2)+1;break;case s.Invisible:R.score+=25;break;case s.Nugget:R.score+=50;break;case s.Door:R.score+=10;break;case s.Teleport:case s.Freeze:R.score+=2;break;case s.SpeedTime:case s.Power:R.score+=5;break;case s.Trap:R.score>5&&(R.score-=5);break;case s.Lava:R.score>100&&(R.score+=100);break;case s.Tome:R.score+=5e3;break;case s.Tablet:R.score+=R.levelIndex+250;break;case s.Chance:R.score+=100;break;case s.Statue:R.score+=10;break;case s.Amulet:R.score+=2500;break;case s.Z:R.score+=1e3;break}q()}async function Se(e,t){const i=r.map.getType(e,t);if(r.map.setType(e,t,s.Floor),v(e,t),i===s.Slow||i===s.Medium||i===s.Fast)for(let a=0;a<r.entities.length;a++){const n=r.entities[a];n.x===e&&n.y===t&&await xe(n)}}async function xe(e){typeof e.type=="number"&&e.type<4&&await oa(e.type),e.x=-1,e.y=-1}async function li(e=1){for(let t=0;t<e;t++){let i=!1;do{const a=f.getUniformInt(0,F),n=f.getUniformInt(0,x);r.map.getType(a,n)===s.Floor&&(r.entities.push(new he(s.Slow,{x:a,y:n})),r.map.setType(a,n,s.Slow),await ka(),i=!0),ie()}while(!i&&f.getUniformInt(0,50)!==0)}}function oe(e){for(var t=[],i=1;i<arguments.length;i++)t[i-1]=arguments[i];var a=Array.from(typeof e=="string"?[e]:e);a[a.length-1]=a[a.length-1].replace(/\r?\n([\t ]*)$/,"");var n=a.reduce(function(c,h){var u=h.match(/\n([\t ]+|(?!\s).)/g);return u?c.concat(u.map(function(p){var M,y;return(y=(M=p.match(/[\t ]/g))===null||M===void 0?void 0:M.length)!==null&&y!==void 0?y:0})):c},[]);if(n.length){var o=new RegExp(`
[	 ]{`+Math.min.apply(Math,n)+"}","g");a=a.map(function(c){return c.replace(o,`
`)})}a[0]=a[0].replace(/^\r?\n/,"");var X=a[0];return t.forEach(function(c,h){var u=X.match(/(?:^|\n)( *)$/),p=u?u[1]:"",M=c;typeof c=="string"&&c.includes(`
`)&&(M=String(c).split(`
`).map(function(y,Y){return Y===0?y:""+p+y}).join(`
`)),X+=M+a[h+1]}),X}function _s(){S(70,0,"Score",l.Yellow,l.Blue),S(70,3,"Level",l.Yellow,l.Blue),S(70,6,"Gems",l.Yellow,l.Blue),S(70,9,"Whips",l.Yellow,l.Blue),S(68,12,"Teleports",l.Yellow,l.Blue),S(70,15,"Keys",l.Yellow,l.Blue);const[t,i]=bt(l.HighIntensityWhite,l.Blue);S(69,18,"OPTIONS",t,l.Red),S(69,19,`%c{${t}}W%c{}hip`,l.White,i),S(69,20,`%c{${t}}T%c{}eleport`,l.White,i),S(69,21,`%c{${t}}P%c{}ause`,l.White,i),S(69,22,`%c{${t}}Q%c{}uit`,l.White,i),S(69,23,`%c{${t}}S%c{}ave`,l.White,i),S(69,24,`%c{${t}}R%c{}estore`,l.White,i)}function q(){const e=R.whipPower>2?`${R.whips}+${R.whipPower-2}`:R.whips.toString(),t=4,i=7,a=!L.paused&&R.gems<10?l.Red|16:l.Red,n=69;S(n,1,me((R.score*10).toString(),t+1,i),l.Red,l.Grey),S(n,4,me(R.levelIndex.toString(),t,i),l.Red,l.Grey),S(n,7,me(R.gems.toString(),t+1,i),a,l.Grey),S(n,10,me(e,t,i),l.Red,l.Grey),S(n,13,me(R.teleports.toString(),t,i),l.Red,l.Grey),S(n,16,me(R.keys.toString(),t,i),l.Red,l.Grey)}function St(){const e=re[s.Border],[t,i]=T[s.Border];for(let a=ye-1;a<=Ye+1;a++)we(a,0,e,t,i),we(a,De+1,e,t,i);for(let a=$e-1;a<=De+1;a++)we(0,a,e,t,i),we(Ye+1,a,e,t,i)}async function Ss(){return fe(l.Black),U(20,Ce,l.Yellow),U(21,"Original Level Design (C) 1990 Scott Miller",l.Yellow),U(se-1,"Press any key to continue.",l.HighIntensityWhite),dt(async()=>{S(5,5,oe`
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
    `,f.getUniformInt(1,15)),await k(500)})}async function ks(){fe(l.Black),U(0,Ce,l.Yellow,l.Black),U(1,"INSTRUCTIONS",l.HighIntensityWhite,l.Black),U(2,"------------",l.HighIntensityWhite,l.Black),S(0,5,oe`
    The dungeons contain dozens of treasures,  spells,  traps and other mysteries.
  Touching an object for the first time will reveal a little of its identity,  but
  it will be left to you to decide how best to use it or avoid it.                
    When a creature touches you it will vanish,  taking with it a few of your gems
  that you have collected. If you have no gems then the creature will instead take
  your life!  Whips can be used to kill nearby creatures, but they are better used
  to smash through crumbled walls and forest terrain.`,l.LightBlue,l.Black),S(3,13,oe`
    You can use these        u i o    7 8 9
    cursor keys to            \\|/      \\|/     w or 5: Whip
    move your man,           j- -k    4- -6         T: Teleport
    and the four              /|\\      /|\\
    normal cursor keys       n m ,    1 2 3`,l.LightBlue,l.Black),S(0,19,oe`
    It's a good idea to save (S) your game at every new level,  therefore,  if you
    die you can easily restore (R) the game at that level and try again.`,l.LightBlue,l.Black),U(22,"Have fun and good-luck...",l.HighIntensityWhite,l.Black),U(se-1,"Press any key to continue.",l.HighIntensityWhite,l.Black),await Me()}async function Ws(){fe(l.Black),U(1,Ce,l.Yellow),S(2,4,oe`
    Kroz is a series of Roguelike video games created by Scott Miller and 
    published by Apogee Software in the late 1980s and early 1990s.  In March
    2009, the whole Kroz series was released as freeware by Apogee, and the
    source code was released as free software under the GPL license.`,l.White),U(se-1,"Press any key to continue.",l.HighIntensityWhite,l.Black),await Me(),Ve(),S(2,9,oe`
    This is a re-implementation the original Kroz series of games in typescript 
    playable in the browser.  The source code completly open-source.  If you
    enjoy this game you are asked by the author to please add a star to the
    github repo at https://github.com/Hypercubed/kroz.`,l.White),U(se-1,"Press any key to continue.",l.HighIntensityWhite,l.Black),await Me(),Ve(),S(2,15,oe`
    Better yet, contribute to the game yourself; or maybe fork it and add your
    own levels.  That might make a nice 7DRL challenge entry
    (https://7drl.com/).`,l.White),U(se-1,"Press any key to continue.",l.HighIntensityWhite,l.Black),await Me(),Ve(),S(10,20,"Thank you and enjoy the game.  -- Hypercubed"),U(se-1,"Press any key to continue.",l.HighIntensityWhite,l.Black),await Me(),Ve()}function me(e,t,i){return e.padStart(t,b).padEnd(i,b)}function ie(){for(let e=0;e<r.map.width;e++)for(let t=0;t<r.map.height;t++){const i=r.map.get(e,t)||new he(s.Floor,{x:e,y:t});i.type!==s.Player&&(i.type===s.Slow||i.type===s.Medium||i.type===s.Fast||v(e,t,i))}for(let e=0;e<r.entities.length;e++){const t=r.entities[e];t.x===-1||t.y===-1||v(t.x,t.y,t)}v(r.player.x,r.player.y,r.player)}function v(e,t,i){if(i??(i=r.map.get(e,t)),!i)return;let a=i.ch;i.type===s.Player&&r.T[D.Invisible]>0&&(a=b),we(e+ye,t+$e,a,i.fg,i.bg)}function le(e,t,i,a,n){var X,c;i??(i=r.map.getType(e,t));let o;switch(vs(i)?(o=re[i]??i??re[s.Floor],a??(a=((X=T[i])==null?void 0:X[0])??T[s.Floor][0]),n??(n=((c=T[i])==null?void 0:c[1])??T[s.Floor][1])):i>="a"&&i<="z"||["!","·","∙","∩"].includes(i)?(o=i.toUpperCase(),a=a??l.HighIntensityWhite,n=n??l.Brown):o=i,i){case s.Stairs:a=typeof a=="number"&&!L.paused?a|16:a;break}we(e+ye,t+$e,o,a,n)}function qe(e,t,i,a){var X;const n=r.map.getType(e,t);let o;n>="a"&&n<="z"||n==="!"?o=l.Brown:o=((X=T[n])==null?void 0:X[1])??T[s.Floor][1],ta(e+ye,t+$e,i,a,o)}async function w(e,t=!1){if(t){if(L.foundSet===!0||L.foundSet.has(e))return"";L.foundSet.add(e)}const i=va[e];return i?await g(i):""}async function g(e){if(!e)return"";const t=(Ye-e.length)/2,i=De+1;L.paused=!0;const a=await dt(()=>{S(t,i,e,f.getUniformInt(1,15),l.Black)});return St(),L.paused=!1,a}function Rt(){fe(l.Blue),St(),_s(),ie(),q()}function Xi(){ie(),q()}function vs(e){return typeof e=="number"}async function Os(){fe(l.Blue),S(2,5,oe`
    In the mystical Kingdom of Kroz, where ASCII characters come to life and
    danger lurks around every corner, a new chapter unfolds. You, a brave
    archaeologist, have heard whispers of the legendary Magical Amulet of Kroz,
    an artifact of immense power long thought lost to time.

    Will you be the one to uncover the secrets of the forsaken caverns? Can you
    retrieve the Magical Amulet and restore glory to the Kingdom of Kroz? The
    adventure awaits, brave explorer!

  `,l.LightCyan,l.Blue),S(9,16,`Use the cursor keys to move yourself (%c{${Z[l.Yellow]}}☻%c{${Z[l.LightGreen]}}) through the caverns.`,l.LightGreen,l.Blue),U(17,"Use your whip (press W) to destroy all nearby creatures.",l.LightGreen,l.Blue),U(se-1,"Press any key to begin your decent into Kroz.",l.HighIntensityWhite,l.Blue);const e=Ze/2-Ce.length/2;await dt(async()=>{S(e,3,Ce,f.getUniformInt(0,16),l.Red),await k(500)})}const Ne={[D.SlowTime]:70*te,[D.Invisible]:75*te,[D.SpeedTime]:80*te,[D.FreezeTime]:55*te};async function Ts(){if(G(C.NextLevel))return await si();if(G(C.PrevLevel))return await Rs();if(G(C.NextLevelCheat)){r.map.setType(r.player.x+1,r.player.y,s.Stairs),await ra();return}if(G(C.FreeItems)){R.gems=150,R.whips=99,R.teleports=99,R.keys=9,q();return}if(G(C.SlowerClock)){L.clockScale=Math.min(20,L.clockScale+1),console.log("Clock Scale:",L.clockScale);return}if(G(C.FasterClock)){L.clockScale=Math.max(1,L.clockScale-1),console.log("Clock Scale:",L.clockScale);return}if(G(C.ResetFound)){L.foundSet=new Set,await g("Newly found object descriptions are reset.");return}if(G(C.HideFound)){L.foundSet=!0,await g("References to new objects will not be displayed.");return}if(G(C.Pause))return Cs();if(G(C.Quit))return Ls();if(G(C.Save))return Ys();if(G(C.Restore))return $s();J(C.Whip)&&(R.whips<1?Et():(R.whips--,await Fs())),J(C.Teleport)&&(R.teleports<1?await Et():(R.teleports--,await ui()));let e=0,t=0;J(C.North)&&t--,J(C.South)&&t++,J(C.West)&&e--,J(C.East)&&e++,J(C.Southeast)&&(e++,t++),J(C.Southwest)&&(e--,t++),J(C.Northeast)&&(e++,t--),J(C.Northwest)&&(e--,t--),e=Bt(e,-1,1),t=Bt(t,-1,1),(e!==0||t!==0)&&await ci(e,t)}async function ci(e,t){const i=r.player.x+e,a=r.player.y+t;if(i<0||i>F||a<0||a>x){await Pt(),_(s.Border),await w(s.Border,!0);return}const n=r.map.getType(i,a)||s.Floor;switch(n){case s.Floor:case s.Stop:m(i,a);break;case s.Slow:case s.Medium:case s.Fast:R.gems-=n,Se(i,a),_(n),m(i,a);break;case s.Block:case s.ZBlock:case s.GBlock:_(n),await w(s.Block,!0);break;case s.Whip:ee(),R.whips++,_(n),m(i,a),await w(s.Whip,!0);break;case s.Stairs:if(m(i,a),R.levelIndex===Je.length-1){await Is();return}_(n),await w(s.Stairs,!0),be(),await si();break;case s.Chest:{m(i,a);const o=f.getUniformInt(2,5),X=f.getUniformInt(2,L.difficulty+2);R.whips+=o,R.gems+=X,_(n),await g(`You found ${X} gems and ${o} whips inside the chest!`);break}case s.SlowTime:r.T[D.SpeedTime]=0,r.T[D.FreezeTime]=0,r.T[D.SlowTime]=Ne[D.SlowTime],_(n),m(i,a),await w(n,!0);break;case s.Gem:ee(),R.gems++,_(n),m(i,a),await w(n,!0);break;case s.Invisible:r.T[D.Invisible]=Ne[D.Invisible],_(n),m(i,a),await w(n,!0);break;case s.Teleport:R.teleports++,_(n),m(i,a),w(n,!0);break;case s.Key:ee(),R.keys++,m(i,a),await w(n,!0);break;case s.Door:R.keys<1?(la(),await k(100),await g("To pass the Door you need a Key.")):(R.keys--,_(n),await aa(),m(i,a),ie(),await w(s.Door,!0));break;case s.Wall:case s.River:ge(),_(n),await w(n,!0);break;case s.SpeedTime:r.T[D.SlowTime]=0,r.T[D.SpeedTime]=Ne[D.SpeedTime],_(n),m(i,a),await w(n,!0);break;case s.Trap:_(n),m(i,a),await w(n,!0),await ui();break;case s.Power:R.whipPower++,_(n),m(i,a),await w(n,!0);break;case s.Tree:case s.Forest:_(n),await Te(),await w(n,!0);break;case s.Bomb:{m(i,a),await Es(i,a),await w(n,!0),St();break}case s.Lava:R.gems-=10,_(n),m(i,a),await w(n,!0);break;case s.Pit:m(i,a),R.gems=-1,await w(n);break;case s.Tome:r.map.setType(31,6,s.Stairs),le(31,6,s.Stairs),_(n),await w(n),await g("Congratulations, Adventurer, you finally did it!!!");break;case s.Tunnel:{const o=r.player.x,X=r.player.y;m(i,a),await As(i,a,o,X),await w(n,!0);break}case s.Freeze:r.T[D.FreezeTime]=Ne[D.FreezeTime],m(i,a),await w(n,!0);break;case s.Nugget:ee(),m(i,a),_(n),await w(n,!0);break;case s.Quake:m(i,a),await Ps(),await w(n,!0);break;case s.IBlock:ge(),r.map.setType(i,a,s.Block),v(i,a),await w(n,!0);break;case s.IWall:ge(),r.map.setType(i,a,s.Wall),v(i,a),await w(n,!0);break;case s.IDoor:ge(),r.map.setType(i,a,s.Door),v(i,a),await w(n,!0);break;case s.Trap2:m(i,a),r.map.replaceEntities(s.Trap2,s.Floor);break;case s.Zap:{m(i,a),await Vs(),await w(n,!0);break}case s.Create:{m(i,a),await Us(),_(n),await w(n,!0);break}case s.Generator:Te(),_(n),await w(n,!0);break;case s.MBlock:Te(),_(n),await w(n,!0);break;case s.ShowGems:{m(i,a),ee(),await Ks(),await w(n,!1);break}case s.Tablet:m(i,a),ee(),_(n),await w(n,!0),await Ds();break;case s.BlockSpell:{m(i,a),await zs(),await w(n,!0);break}case s.Chance:{_(n);const o=f.getUniformInt(14,18);R.gems+=o,m(i,a),await g(`You found a Pouch containing ${o} Gems!`);break}case s.Statue:Te(),await w(n);break;case s.WallVanish:m(i,a),await Qs(),await w(n);break;case s.K:case s.R:case s.O:case s.Z:m(i,a),ee(),await Ns(n);break;case s.OWall1:case s.OWall2:case s.OWall3:ge(),_(s.Wall),await w(s.OWall1,!0);break;case s.CWall1:case s.CWall2:case s.CWall3:m(i,a);break;case s.OSpell1:case s.OSpell2:case s.OSpell3:{m(i,a),await Gs(n),await w(n,!0);break}case s.CSpell1:case s.CSpell2:case s.CSpell3:{m(i,a),await Hs(n),await w(n,!0);break}case s.Rock:{await qs(i,a,e,t);break}case s.EWall:_(n),R.gems--,Pt(),await w(s.EWall,!0);break;case s.Trap3:case s.Trap4:case s.Trap5:case s.Trap6:case s.Trap7:case s.Trap8:case s.Trap9:case s.Trap10:case s.Trap11:case s.Trap12:case s.Trap13:m(i,a),r.map.replaceEntities(n,s.Floor);break;case s.TBlock:case s.TRock:case s.TGem:case s.TBlind:case s.TWhip:case s.TGold:case s.TTree:m(i,a),await js(i,a,n);break;case s.Rope:m(i,a),await w(s.Rope,!0);break;case s.Message:{await Zs();break}case s.ShootRight:m(i,a),await zt(i,a,1);break;case s.ShootLeft:m(i,a),await zt(i,a,-1);break;case s.DropRope:case s.DropRope2:case s.DropRope3:case s.DropRope4:case s.DropRope5:m(i,a);break;case s.Amulet:m(i,a),await Bs();break;default:ge();break}}async function Fs(){const e=r.player.x,t=r.player.y;Xa(),await i(e-1,t-1,"\\"),await i(e-1,t,"-"),await i(e-1,t+1,"/"),await i(e,t+1,"❘"),await i(e+1,t+1,"\\"),await i(e+1,t,"-"),await i(e+1,t-1,"/"),await i(e,t-1,"❘");async function i(a,n,o){if(a<0||a>F||n<0||n>x)return;const X=r.map.getType(a,n);switch(qe(a,n,o,Z[f.getUniformInt(0,15)]),X){case s.Slow:case s.Medium:case s.Fast:Se(a,n),_(X);break;case s.Block:case s.Forest:case s.Tree:case s.Message:case s.MBlock:case s.ZBlock:case s.GBlock:{const c=R.whipPower;6*Math.random()<c?(X===s.MBlock&&Se(a,n),r.map.setType(a,n,s.Floor),v(a,n),qe(a,n,o,Z[f.getUniformInt(0,15)]),ca()):Xt();break}case s.Invisible:case s.SpeedTime:case s.Trap:case s.Power:case s.K:case s.R:case s.O:case s.Z:r.map.setType(a,n,s.Floor),ha();break;case s.Quake:case s.IBlock:case s.IWall:case s.IDoor:case s.Trap2:case s.Trap3:case s.Trap4:case s.ShowGems:case s.BlockSpell:case s.Trap5:case s.Trap6:case s.Trap7:case s.Trap8:case s.Trap9:case s.Trap10:case s.Trap11:case s.Trap12:case s.Trap13:case s.Stop:break;case s.Rock:30*Math.random()<R.whipPower?(ua(),r.map.setType(a,n,s.Floor)):Xt();break;case s.Statue:50*Math.random()<R.whipPower?(r.map.setType(a,n,s.Floor),_(X),r.T[D.StatueGemDrain]=-1,await g("You've destroyed the Statue!  Your Gems are now safe.")):Xt();break;case s.Generator:_(X),r.map.setType(a,n,s.Floor),r.genNum--;break;case s.Wall:break}q(),await k(25)}}async function hi(){for(let e=0;e<160;e++)e%5===0&&(le(r.player.x,r.player.y,s.Player,f.getUniformInt(0,15),f.getUniformInt(0,8)),await k()),d(e/2,80,10)}async function ui(){await hi(),r.map.setType(r.player.x,r.player.y,s.Floor),v(r.player.x,r.player.y);const e=Date.now();for(let t=0;t<700;t++){const i=f.getUniformInt(0,F),a=f.getUniformInt(0,x),n=r.map.getType(i,a);if(Da.indexOf(n)>-1&&(le(i,a,"☺",f.getUniformInt(0,15),f.getUniformInt(0,7)),await Ra(),le(i,a,n)),Date.now()-e>1500)break}m(...r.map.findRandomEmptySpace())}async function xs(){S(Ye/2-7,0,"You have died.",l.Black,l.Red),await g("Press any key to continue."),L.done=!0}async function Ls(){let e="";for(;e.toLowerCase()!=="y"&&e.toLowerCase()!=="n";)e=await g("Are you sure you want to quit? (Y/N)");e.toLowerCase()==="y"&&(L.done=!0)}async function Cs(){await g("Press any key to resume")}async function Ds(){const e=r.tabletMessage;e&&(typeof e=="string"?await g(e):typeof e=="function"&&await e())}async function it(){await g("On the Ancient Tablet is a short Mantra, a prayer..."),await g("You take a deep breath and speak the words aloud...")}async function Is(){await be(),await k(200),await be(),await k(200),await be(),await g("Oh no, something strange is happening!"),await g("You are magically transported from Kroz!");const e=R.gems=isFinite(R.gems)?R.gems:150,t=R.whips=isFinite(R.whips)?R.whips:20,i=R.teleports=isFinite(R.teleports)?R.teleports:10,a=R.keys=isFinite(R.keys)?R.keys:5;await g("Your Gems are worth 100 points each...");for(let n=0;n<e;n++)R.gems--,R.score+=10,q(),await d(n*8+100,20);await g("Your Whips are worth 100 points each...");for(let n=0;n<t;n++)R.whips--,R.score+=10,q(),await d(n*8+100,20);await g("Your Teleport Scrolls are worth 200 points each...");for(let n=0;n<i;n++)R.teleports--,R.score+=20,q(),await d(n*8+100,20);await g("Your Keys are worth 10,000 points each....");for(let n=0;n<a;n++)R.keys--,R.score+=1e3,q(),await d(n*8+100,20);fe(l.Blue),S(25,3,"ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ",l.White,l.Blue),S(10,5,oe`
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
       `,l.White,l.Blue),await g("Press any key, Adventurer."),L.done=!0}async function zt(e,t,i){for(e+=i;e>=0&&e<=F;){const a=r.map.getType(e,t);if(typeof a!="number"||Va.includes(a))break;d(e+30,10,100);for(let n=1;n<6;n++)qe(e,t,"─",f.getUniformInt(0,16)),await k(1);Ua.includes(a)||(await fa(),(a===s.Slow||a===s.Medium||a===s.Fast)&&await Se(e,t),r.map.setType(e,t,s.Floor)),v(e,t),e+=i}ie()}async function Bs(){await ee(),await pa(),_(s.Amulet),await g("You have found the Amulet of Yendor -- 25,000 points!"),await g("It seems that Kroz and Rogue share the same underground!)"),await g("Your quest for the treasure of Kroz must still continue...")}async function Es(e,t){da();let i=0;for(;i<=4;++i){d(100-i*10/4,4*10,100);const c=Math.max(e-i,ye),h=Math.min(e+i,Ye),u=Math.max(t-i,$e),p=Math.min(t+i,De);for(let M=c;M<=h;M++)for(let y=u;y<=p;y++){qe(M,y,"█",l.LightRed);const Y=r.map.getType(M,y)??s.Floor;Vt.includes(Y)&&Y>=1&&Y<=4&&(_(Y),Se(M,y))}await ga()}await k(100),i=4;const a=Math.max(e-i,ye),n=Math.min(e+i,Ye),o=Math.max(t-i,$e),X=Math.min(t+i,De);for(let c=a;c<=n;c++)for(let h=o;h<=X;h++){const u=r.map.getType(c,h)??s.Floor;Vt.includes(u)&&r.map.setType(c,h,s.Floor)}ie()}async function As(e,t,i,a){await k(350),await be(),await k(500),r.map.setType(e,t,s.Tunnel),v(e,t);let n=e,o=t;for(let h=0;h<1e4;h++){const u=f.getUniformInt(0,F),p=f.getUniformInt(0,x);if((r.map.getType(u,p)??s.Floor)===s.Tunnel&&(u!==n||p!==o)){n=u,o=p,m(n,o);break}}r.map.setType(e,t,s.Tunnel),v(e,t);let X=i,c=a;for(let h=0;h<100;h++){const u=f.getUniformInt(-1,1),p=f.getUniformInt(-1,1);if(n+u<0||n+u>F||o+p<0||o+p>x)continue;const M=r.map.getType(n+u,o+p)??s.Floor;if(Pa.includes(M)){X=n+u,c=o+p;break}}m(X,c),r.map.setType(n,o,s.Tunnel),v(n,o)}async function Ps(){await ma(),await k(50);for(let e=0;e<50;e++){do{const t=f.getUniformInt(0,F),i=f.getUniformInt(0,x),a=r.map.getType(t,i);if(Ca.includes(a)){r.map.setType(t,i,s.Rock),v(t,i);break}}while(Math.random()>.01);await wa()}await Ma()}async function Vs(){let e=0,t=0;for(;e<500&&t<40;){e++;const i=f.getUniformInt(0,r.entities.length),a=r.entities[i];!a||a.x===-1||a.y===-1||a.type!==s.Slow&&a.type!==s.Medium&&a.type!==s.Fast||(await Se(a.x,a.y),await k(20),t++)}R.score+=Math.floor(t/3+2),ie(),q()}async function Us(){r.entities.reduce((t,i)=>i.type===s.Slow?t+1:t,0)<945&&await li(45)}async function Ks(){for(let e=0;e<L.difficulty*2+5;e++){let t=!1;do{const i=f.getUniformInt(0,F),a=f.getUniformInt(0,x);r.map.getType(i,a)===s.Floor&&(t=!0,r.map.setType(i,a,s.Gem),v(i,a),await ba(),await k(90))}while(!t&&Math.random()>.01)}}async function zs(){for(let e=0;e<=F;e++)for(let t=0;t<=x;t++)if(r.map.getType(e,t)===s.ZBlock){ya();for(let i=20;i>0;i--)le(e,t,s.Block,f.getUniformInt(0,15)),await k(1);r.map.setType(e,t,s.Floor),v(e,t)}else r.map.getType(e,t)===s.BlockSpell&&(r.map.setType(e,t,s.Floor),v(e,t))}async function Ns(e){e===s.K&&r.bonus===0&&(r.bonus=1),e===s.R&&r.bonus===1&&(r.bonus=2),e===s.O&&r.bonus===2&&(r.bonus=3),e===s.Z&&r.bonus===3&&(await sa(),_(e),await w(e))}async function Gs(e){let t=s.OWall1;e===s.OSpell2&&(t=s.OWall2),e===s.OSpell3&&(t=s.OWall3);for(let i=0;i<=F;i++)for(let a=0;a<=x;a++)if(r.map.getType(i,a)===t){for(let o=60;o>0;o--)le(i,a,f.getItem(["▄","▌","▐","▀"]),f.getUniformInt(0,14)),d(o*40,5,10),o%5===0&&await k(1);r.map.setType(i,a,s.Floor),v(i,a)}}async function Hs(e){const t=e-s.CSpell1+s.CWall1;for(let i=0;i<=F;i++)for(let a=0;a<=x;a++)if(r.map.getType(i,a)===t){for(let o=60;o>0;o--)le(i,a,f.getItem(["▄","▌","▐","▀"]),f.getUniformInt(0,14)),d(o*40,5,10),o%5===0&&await k(1);r.map.setType(i,a,s.Wall),v(i,a)}}async function qs(e,t,i,a){let n=!1;const o=r.player.x+i*2,X=r.player.y+a*2;if((o<0||o>F||X<0||X>x)&&(n=!0),!n){const c=r.map.getType(o,X);async function h(){n=!1,await At(),r.map.setType(o,X,s.Rock),m(e,t),ie(),await w(s.Rock,!0)}Ba.includes(c)?await h():Ea.includes(c)?(await h(),await ee()):yt.includes(c)?(await h(),_(c),await Ya()):c===s.EWall?(await h(),r.map.setType(o,X,s.Floor),$a(),await g("The Boulder is vaporized!")):Aa.includes(c)&&(n=!1,await At(),m(e,t),le(o,X,s.Rock),await _a(),ie(),await w(s.Rock,!0))}n&&await Te()}async function Zs(){await Sa(),await g("You notice a secret message carved into the old tree..."),await g('"Goodness of Heart Overcomes Adversity."'),await g("Reveal that you found this message to Scott Miller..."),await g('And receive a "MASTER KROZ CERTIFICATE" to hang on your wall!!'),await g("Only the first 100 players to report this..."),await g("Will be awarded the certificate.  Congratulations!")}async function js(e,t,i){let a=s.Floor;switch(i){case s.TBlock:a=s.Block;break;case s.TRock:a=s.Rock;break;case s.TGem:a=s.Gem;break;case s.TBlind:a=s.Invisible;break;case s.TWhip:a=s.Whip;break;case s.TGold:a=s.Nugget;break;case s.TTree:a=s.Tree;break}for(let o=0;o<10;o++)await n(!1,f.getUniformInt(0,7),f.getUniformInt(0,7)),await d((o+25)*o*2,20,10);return n(!0);async function n(o,X,c){for(let h=-1;h<=1;h++)for(let u=-1;u<=1;u++){if(h===0&&u===0)continue;const p=r.map.getType(e+h,t+u);Ia.includes(p)&&(le(e+h,t+u,a,X,c),o&&r.map.setType(e+h,t+u,a)),await k(5)}}}async function Qs(){for(let e=0;e<75;e++){let t=!1;do{const i=f.getUniformInt(0,F),a=f.getUniformInt(0,x),n=r.map.getType(i,a);n===s.Block&&(r.map.setType(i,a,s.IBlock),v(i,a),t=!0),n===s.Wall&&(r.map.setType(i,a,s.IWall),v(i,a),t=!0)}while(!t&&f.getUniformInt(0,200)!==0)}}function m(e,t){be();const i=r.player;r.map.setType(i.x,i.y,i.replacement),v(i.x,i.y);const a=r.map.getType(e,t);i.replacement=[s.CWall1,s.CWall2,s.CWall3,s.Rope].includes(a)?a:s.Floor,r.map.set(e,t,i),i.x=e,i.y=t,v(i.x,i.y)}function Js(e){switch(e){case s.Player:return te;case s.Slow:return te/4;case s.Medium:return te/3;case s.Fast:return te/2;case s.MBlock:return te/2}}class Ae{constructor(t){ae(this,"speed");this.type=t,this.speed=Js(this.type)}getSpeed(){return this.type===s.Player?r.T[D.SlowTime]>0?10:1:r.T[D.SpeedTime]>0?te:this.speed}}let ce;const eo=new Ae(s.Player),to=new Ae(s.Slow),io=new Ae(s.Medium),ao=new Ae(s.Fast),no=new Ae(s.MBlock);function so(){return ce=new Ms.Speed,ce.add(eo,!0),ce.add(to,!0),ce.add(io,!0),ce.add(ao,!0),ce.add(no,!0),ce}async function oo(){const e=ce.next();await Xo(e.type)}async function ro(e){if(e.x===-1||e.y===-1||r.map.getType(e.x,e.y)!==e.type){xe(e);return}let t=0,i=0;r.player.x<e.x&&(t=-1),r.player.x>e.x&&(t=1),r.player.y<e.y&&(i=-1),r.player.y>e.y&&(i=1);const a=e.x+t,n=e.y+i;if(a<0||a>F||n<0||n>x)return;const o=r.map.getType(a,n);switch(o){case s.Floor:case s.TBlock:case s.TRock:case s.TGem:case s.TBlind:case s.TGold:case s.TWhip:case s.TTree:Le(e,a,n);break;case s.Block:case s.MBlock:case s.ZBlock:case s.GBlock:r.map.setType(e.x,e.y,s.Floor),r.map.setType(a,n,s.Floor),xe(e),_(o),d(800,18),d(400,20);break;case s.Player:R.gems--,r.map.setType(e.x,e.y,s.Floor),xe(e),_(o);break;case s.Whip:case s.Chest:case s.SlowTime:case s.Gem:case s.Invisible:case s.Teleport:case s.Key:case s.SpeedTime:case s.Trap:case s.Power:case s.Freeze:case s.Nugget:case s.K:case s.R:case s.O:case s.Z:case s.ShootRight:case s.ShootLeft:ee(),Le(e,a,n);break;default:Le(e,e.x,e.y);break}}async function lo(e){if(e.x===-1||e.y===-1||r.map.getType(e.x,e.y)!==e.type){xe(e);return}let t=0,i=0;r.player.x<e.x&&(t=-1),r.player.x>e.x&&(t=1),r.player.y<e.y&&(i=-1),r.player.y>e.y&&(i=1);const a=e.x+t,n=e.y+i;if(a<0||a>F||n<0||n>x)return;switch(r.map.getType(a,n)){case s.Floor:Le(e,a,n),e.ch=re[s.Block],e.fg=T[s.Block][0]??T[s.Floor][0],e.bg=T[s.Block][1]??T[s.Floor][1];break;default:Le(e,e.x,e.y);break}}async function Xo(e){if(e!==s.Player&&!(r.T[D.FreezeTime]>0))for(let t=0;t<r.entities.length;t++){const i=r.entities[t];e&&i.type!==e||i.x===-1||i.y===-1||(i.type===s.MBlock?await lo(i):await ro(i))}}function Le(e,t,i){e.type===s.Slow?e.ch=Math.random()>.5?"A":"Ä":e.type===s.Medium&&(e.ch=Math.random()>.5?"ö":"Ö"),r.map.setType(e.x,e.y,s.Floor),r.map.set(t,i,e),e.x=t,e.y=i}async function co(){for(let t=0;t<r.T.length;t++)r.T[t]=Math.max(0,r.T[t]-1);r.T[D.StatueGemDrain]>0&&f.getUniformInt(0,18)===0&&(R.gems--,await d(3800,40),q());const e=r.entities.reduce((t,i)=>i.type===s.Slow?t+1:t,0);if(r.genNum>0&&e<995&&f.getUniformInt(0,17)===0&&await li(1),r.magicEwalls&&f.getUniformInt(0,7)===0){for(let t=0;t<100;t++){const i=f.getUniformInt(0,F),a=f.getUniformInt(0,x);if(r.map.getType(i,a)===s.CWall1){r.map.setType(i,a,s.EWall),v(i,a);break}}for(let t=0;t<100;t++){const i=f.getUniformInt(0,F),a=f.getUniformInt(0,x);if(r.map.getType(i,a)===s.EWall){r.map.setType(i,a,s.CWall1),v(i,a);break}}}if(r.evapoRate>0&&f.getUniformInt(0,9)===0){const t=f.getUniformInt(0,F),i=f.getUniformInt(0,x);r.map.getType(t,i)===s.River&&(r.map.setType(t,i,s.Floor),v(t,i))}}function ho(){const e=ia();document.getElementById("app").appendChild(e),Ii()}async function ft(){fe(l.Black),ws(),await Ss(),await Os(),await ks(),et(),Rt(),await hi(),Xi(),await g("Press any key to begin this level."),Ht(),Rt(),await uo()}async function uo(){so();let e=16*L.clockScale,t=0,i=0;const a=async n=>{if(R.gems<0){await xs(),ft();return}if(L.done){ft();return}t+=n-i,i=n,t>e&&(t%=e,await Ts(),await oo(),await co(),ie(),Ht()),Xi(),e=16*L.clockScale,requestAnimationFrame(a)};requestAnimationFrame(a)}function Nt(){ho(),ft()}try{document.fonts.ready.then(Nt)}catch{window.addEventListener("DOMContentLoaded",Nt)}
