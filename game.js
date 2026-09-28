'use strict';
const $=q=>document.querySelector(q),SE=["Spring","Summer","Autumn","Winter"],K4=["food","energy","mat","rsch"];
const F=n=>Math.round(n).toLocaleString(),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=n=>Math.floor(Math.random()*n);
const TH={
dome:{n:"Dome City",d:"Post-apocalyptic survival",r:["Rations","Power","Scrap","Data"],cu:"Credits",pp:"Citizens",ld:"Overseer",b:["Hydroponics","Reactor Core","Scrap Foundry","Data Vault","Habitat Ring","Black Market","Warden Post"],trk:"Industrial Hum & Distant Rain",fx:"Sirens wailing in Sector 4"},
corp:{n:"Mega-Corporation",d:"Cyberpunk corporate empire",r:["Synth-Food","Grid Power","Alloys","Patents"],cu:"Eurodollars",pp:"Employees",ld:"CEO",b:["Vat Farm","Fusion Stack","Alloy Works","R&D Tower","Arcology Block","Trade Exchange","Security Hub"],trk:"Neon Synthwave & Rain on Glass",fx:"Drone swarms over the skyline"},
realm:{n:"Feudal Kingdom",d:"Medieval realm and its intrigues",r:["Grain","Firewood","Timber & Iron","Lore"],cu:"Gold",pp:"Subjects",ld:"Sovereign",b:["Farmstead","Woodmill","Ironworks","Scriptorium","Village Quarter","Market Square","Garrison"],trk:"Lute & Crackling Hearth",fx:"Bells tolling from the keep"},
space:{n:"Deep Space Colony",d:"Fragile outpost among the stars",r:["Nutrient Paste","Reactor Power","Ore","Research"],cu:"Credits",pp:"Colonists",ld:"Commander",b:["Bio-Dome","Fusion Reactor","Ore Rig","Xeno Lab","Hab Module","Trade Dock","Security Bay"],trk:"Low Drone & Cosmic Static",fx:"Airlock cycling in Bay 3"}};
const DF={bal:["Balanced","Room to recover"],hard:["Hardcore","Scarce, punishing"]},AD={prag:["Pragmatic","Cold and precise"],cozy:["Optimistic","Warm and hopeful"],mach:["Machiavellian","Whispers of power"]};
const GL=["♣","⚡","⛏","◈","⌂","¤","✚"],BP=[8,7,6,3,0,14,0],BC=[[50,10],[60,10],[40,0],[70,20],[50,20],[80,10],[60,20]];
const TECH=[["Efficient Crops",30,"+25% food"],["Grid Optimization",40,"+25% power"],["Deep Extraction",50,"+25% materials"],["Trade Networks",60,"+25% treasury income"],["Civic Wellness",70,"+6 approval baseline"],["Automation",110,"Building upkeep halved"]];
const COLS=6,ROWS=5;let S=null,sel=0,pick={theme:"dome",diff:"bal",adv:"prag"},AC=null,mute=false,drone=null;
const L=()=>TH[S.th],cu=()=>L().cu,rn=k=>L().r[K4.indexOf(k)],T=i=>S.tech.includes(i);
const mult=()=>1+.15*(S.era-1)+.05*S.legacy,cap=()=>100+S.map.reduce((a,c)=>a+(c&&c.t==4?40*c.l:0),0);
const roman=n=>["","I","II","III","IV","V","VI","VII","VIII","IX","X"][n]||n;
const eraCost=()=>Math.round(120*Math.pow(S.era,1.6)),expCost=()=>[Math.round(180*S.era*(1+S.cells/12)),50+20*S.era];
const bcost=(t,l)=>[Math.round(BC[t][0]*(1+l*.9)*(S.diff=="hard"?1.2:1)),Math.round(BC[t][1]*(1+l*.9))];

/* ---------- audio ---------- */
function ac(){if(!AC)try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}return AC}
function beep(f=440,d=.09,type="square",v=.04){if(mute||!ac())return;const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}
function ambient(){if(!ac())return;if(drone){drone.forEach(n=>n.stop());drone=null;return}const lp=AC.createBiquadFilter(),g=AC.createGain();lp.type="lowpass";lp.frequency.value=260;g.gain.value=.05;lp.connect(g);g.connect(AC.destination);drone=[55,55.6,82.4].map(f=>{const o=AC.createOscillator();o.type="sawtooth";o.frequency.value=f;o.connect(lp);o.start();return o})}

/* ---------- setup ---------- */
function opts(el,obj,key){el.innerHTML="";for(const k in obj){const b=document.createElement("button");b.className="opt"+(pick[key]==k?" on":"");b.innerHTML=`${obj[k].n||obj[k][0]}<small>${obj[k].d||obj[k][1]}</small>`;b.onclick=()=>{pick[key]=k;setup();beep(600)};el.appendChild(b)}}
function setup(){opts($("#themes"),TH,"theme");opts($("#diffs"),DF,"diff");opts($("#advs"),AD,"adv");$("#cont").disabled=!localStorage.getItem("dominion_save")}
function newGame(keepLegacy){const hc=pick.diff=="hard",lg=keepLegacy||0;
 S={th:pick.theme,diff:pick.diff,adv:pick.adv,name:$("#lname").value.trim()||"Vale",turn:0,funds:(hc?300:500)+150*lg,pop:120,appr:65,food:hc?30:60,energy:hc?25:40,mat:hc?40:80,rsch:0,
 map:Array(COLS*ROWS).fill(null),cells:12,tech:[],era:1,legacy:lg,dec:null,mod:0,ev:null,low:0,last:{},alerts:[],over:0,log:[]};
 [0,1,2].forEach((t,i)=>S.map[i*COLS]={t:[0,1,4][i],l:1});
 S.map[1]={t:2,l:1};
 start();say(`Welcome, ${L().ld} ${S.name}. ${L().n} awaits your first decree.`,"a");if(lg)say(`Legacy ${lg} bonuses active: +${lg*5}% output, +${150*lg} starting ${cu()}.`,"g");
 S.alerts=[["c","New colony founded. Build, research and decree, then END TURN."]];render()}
function start(){$("#title").hidden=true;$("#game").hidden=false;$("#over").hidden=true;$("#log").innerHTML="";S.log.slice(-60).forEach(x=>say(x[0],x[1],1))}

/* ---------- log / render ---------- */
function say(m,c="d",q){const d=document.createElement("div");d.className="l-"+c;d.textContent=m;$("#log").appendChild(d);$("#log").scrollTop=1e9;if(!q){S.log.push([m,c]);if(S.log.length>120)S.log.shift()}}
const pct=(v,m)=>Math.round(cl(v/m,0,1)*100),sg=v=>`<span class="${v>=0?"up":"dn"}">${v>=0?"+":""}${F(v)}</span>`;
function render(){if(!S)return;const s=S,ld=s.last||{},c=cap(),fu=s.pop/40;
 $("#hdr").innerHTML=`<b>${L().n.toUpperCase()}</b> <span>· ${L().ld} ${s.name} · Year ${Math.floor(s.turn/4)+1}, ${SE[s.turn%4]} · Era ${roman(s.era)}${s.legacy?" · Legacy "+s.legacy:""}</span>`;
 const st=(l,v,d,b)=>`<div class="st"><small>${l}</small><b>${v}</b> ${d===undefined?"":sg(d)}${b===undefined?"":`<div class="bar"><i style="width:${b}%"></i></div>`}</div>`;
 $("#hud").innerHTML=`<h4>STATUS DASHBOARD</h4><div class="stats">${st("Treasury ("+cu()+")",F(s.funds),ld.funds)}${st(L().pp,F(s.pop)+" / "+F(c),undefined,pct(s.pop,c))}${st("Approval",Math.round(s.appr)+"%",undefined,Math.round(s.appr))}${K4.map(k=>st(rn(k),F(s[k]),ld[k])).join("")}</div>`;
 let g="";s.map.forEach((c,i)=>{if(i>=s.cells)g+=`<button class="cell lock" disabled>░</button>`;else if(!c)g+=`<button class="cell e" data-i="${i}">·<span>empty</span></button>`;else g+=`<button class="cell k${c.t}" data-i="${i}" title="${L().b[c.t]}"><b>${GL[c.t]}</b><span>Lv${c.l}</span></button>`});
 $("#map").innerHTML=`<h4>SECTOR MAP · ${s.cells}/${COLS*ROWS} sectors opened</h4><div class="g">${g}</div><small class="l-d">Selected: ${sel==9?"Demolish (50% refund)":GL[sel]+" "+L().b[sel]}. Click a sector to build or upgrade. Outlook: ${SE[(s.turn+1)%4]=="Winter"?"winter demands +25% food and power":"mild season ahead"}.</small>`;
 $("#map").querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>cellClick(+b.dataset.i));
 $("#atmo").innerHTML=`<h4>ATMOSPHERE</h4>🎵 <i>Track: ${L().trk}</i> &nbsp;|&nbsp; 🔊 <i>FX: ${L().fx}${s.appr<40?" · crowds murmuring":s.energy<=0?" · generators sputtering":""}</i>`;
 let sr=s.alerts.map(a=>`<div class="alert ${a[0]}">${a[1]}</div>`).join("");
 if(s.ev)sr+=`<div class="ev"><b>⚠ ${s.ev.t}</b><br>${s.ev.x}${s.ev.c.map((o,i)=>`<button data-e="${i}">${i+1}. ${o[0]}</button>`).join("")}</div>`;
 $("#sit").innerHTML=`<h4>SITUATION REPORT</h4>${sr}<div class="alert c"><b>Advisor:</b> ${advice()}</div>`;
 $("#sit").querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>choose(+b.dataset.e));
 const [ec,em]=expCost(),ecost=eraCost();
 $("#acts").innerHTML=`<h4>COMMAND DECK</h4><small class="l-d">Build</small><div class="grp">${L().b.map((n,i)=>{const[f,m]=bcost(i,0);return`<button data-b="${i}" class="${sel==i?"on":""}">${GL[i]} ${n} (${f}/${m})</button>`}).join("")}<button data-b="9" class="${sel==9?"on":""}">✖ Demolish</button></div>
 <small class="l-d">Decree (one per turn, applies at end of turn)</small><div class="grp">${[["ration","Rationing"],["festival","Festival"],["austerity","Austerity"],["recruit","Recruitment"]].map(d=>`<button data-d="${d[0]}" class="${s.dec==d[0]?"on":""}">${d[1]}</button>`).join("")}</div>
 <small class="l-d">Research (${F(s.rsch)} ${rn("rsch")})</small><div class="grp">${TECH.map((t,i)=>`<button data-t="${i}" ${T(i)||s.rsch<t[1]?"disabled":""} title="${t[2]}">${T(i)?"✔ ":""}${t[0]} (${t[1]})</button>`).join("")}</div>
 <div class="grp"><button id="bExp" ${s.cells>=COLS*ROWS||s.funds<ec||s.mat<em?"disabled":""}>Expand territory (${F(ec)}/${em})</button><button id="bEra" ${s.rsch<ecost?"disabled":""}>Advance to Era ${roman(s.era+1)} (${F(ecost)} ${rn("rsch")})</button>${s.era>=3?`<button id="bLeg">Found Legacy (reset, keep prestige)</button>`:""}</div>
 <button class="big" id="bEnd" ${s.ev||s.over?"disabled":""}>END TURN ▶</button>`;
 $("#acts").querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{sel=+b.dataset.b;beep(500);render()});
 $("#acts").querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{s.dec=s.dec==b.dataset.d?null:b.dataset.d;beep(520);render()});
 $("#acts").querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{const t=TECH[+b.dataset.t];s.rsch-=t[1];s.tech.push(+b.dataset.t);say(`Research complete: ${t[0]} (${t[2]}).`,"g");beep(880,.2);render()});
 $("#bExp").onclick=()=>{s.funds-=ec;s.mat-=em;s.cells=Math.min(COLS*ROWS,s.cells+4);say("Territory expanded: 4 new sectors surveyed.","g");beep(700);render()};
 $("#bEra").onclick=()=>{s.rsch-=ecost;s.era++;say(`ERA ${roman(s.era)} DAWNS. All output now x${mult().toFixed(2)}.`,"a");beep(660,.3,"sawtooth");render()};
 if($("#bLeg"))$("#bLeg").onclick=()=>{if(confirm("Found a Legacy? The colony resets; you keep +5% output and +150 starting funds per Legacy."))newGame(S.legacy+1)};
 $("#bEnd").onclick=tick}
function cellClick(i){const s=S,c=s.map[i];if(sel==9){if(!c)return;const r=bcost(c.t,c.l-1);s.funds+=Math.round(r[0]/2);s.mat+=Math.round(r[1]/2);s.map[i]=null;say(`Demolished ${L().b[c.t]}.`,"d");beep(200)}
 else{const l=c?(c.t==sel?c.l:-1):0;if(l<0)return say("Sector occupied by a different structure.","r");if(l>=5)return say("Structure at maximum level.","r");const[f,m]=bcost(sel,l);if(s.funds<f||s.mat<m)return say(`Insufficient resources: need ${f} ${cu()} and ${m} ${rn("mat")}.`,"r"),beep(150);s.funds-=f;s.mat-=m;s.map[i]={t:sel,l:l+1};say(`${l?"Upgraded":"Built"} ${L().b[sel]} (Lv${l+1}).`,"g");beep(760)}render()}

/* ---------- advisor ---------- */
function advice(){const s=S,c=cap(),fl=s.food/(s.pop/40),A={
en:["Power reserves critical. Build reactors before output collapses.","Oh dear, the lights are flickering! A bit more power would cheer everyone up.","Darkness makes people desperate. Keep the lights on, and keep them in fear of losing them."],
fo:["Food covers under 3 turns. Add farms or ration.","Tummies are rumbling! More farms, please, and a little rationing wouldn't hurt.","Hunger is leverage. Ration now, then be the hero who ends it."],
fu:["Treasury near zero. Cut upkeep or open markets.","Coffers are a tad light! Markets and a bit of austerity should help.","Debt is a leash. Squeeze the people, or find someone to squeeze for you."],
ap:["Approval below 45%. Growth stalls. Stabilize with festivals or guards.","Spirits are low. A festival might be just the thing!","Unrest brews. Fund the guards, and remember who watches the watchers."],
ho:["Housing near capacity. Expand living space or growth ends.","We're a cozy crowd, but a few more homes would be lovely.","A crowded populace is easier to control, until it isn't."],
ok:["Systems nominal. Invest in research and expansion.","Everything is going wonderfully! Perhaps time to reach further.","Stability is an invitation. Expand before someone else does."]};
 const k=s.energy<15?"en":fl<3?"fo":s.funds<60?"fu":s.appr<45?"ap":s.pop>=c*.9?"ho":"ok";return A[k][{prag:0,cozy:1,mach:2}[s.adv]]}

/* ---------- events ---------- */
const EV=[
()=>({t:"Labor Unrest",x:"Workers stop work and demand better conditions.",c:[[`Meet demands (-80 ${cu()})`,()=>{S.funds-=80;S.mod+=6;return"Calm returns."}],["Crackdown",()=>{S.mod-=10;S.appr-=6;return"Order restored; resentment simmers."}],["Negotiate (gamble)",()=>Math.random()<.5?(S.mod+=4,"Talks succeed."):(S.appr-=8,S.funds-=40,"Talks collapse; losses mount.")]]}),
()=>({t:"Market Crash",x:"Confidence collapses. Reserves are draining fast.",c:[["Ride it out",()=>{const l=Math.round(S.funds*.15);S.funds-=l;return`Lost ${F(l)} ${cu()}.`}],[`Sell 40 ${rn("mat")} for a cushion`,()=>{const m=Math.min(40,S.mat),l=Math.round(S.funds*.08);S.mat-=m;S.funds-=l;S.funds+=m;return`Limited the damage to ${F(l)}.`}]]}),
()=>({t:"Disaster Strikes",x:"A violent storm batters your sectors.",c:[[`Emergency crews (-30 ${rn("mat")})`,()=>{if(S.mat<30)return dmg();S.mat-=30;return"Crews limited the damage."}],["Absorb the damage",dmg]]}),
()=>({t:"Rival Faction Demands",x:"An armed rival demands tribute or else.",c:[[`Pay tribute (-120 ${cu()})`,()=>{S.funds-=120;return"They withdraw, for now."}],["Refuse",()=>{S.appr-=3;if(Math.random()<.4){S.food=Math.max(0,S.food-30);S.mat=Math.max(0,S.mat-30);return"Raiders strike stores: -30 food, -30 materials."}return"They back down."}],["Ally with them",()=>{S.rsch+=25;S.mod-=3;return"Shared knowledge (+25 research), but some resent it."}]]}),
()=>({t:"Refugees at the Gate",x:"A weary group seeks shelter.",c:[["Accept (+40 pop, -15 food)",()=>{S.pop+=40;S.food=Math.max(0,S.food-15);return"They join your ranks."}],["Turn away",()=>{S.appr-=3;return"Some are troubled by your decision."}]]}),
()=>({t:"Ancient Cache",x:"Scouts unearth a sealed cache of old technology.",c:[["Study it (+40 research)",()=>{S.rsch+=40;return"Breakthrough insights."}],["Salvage it (+60 materials)",()=>{S.mat+=60;return"Materials hauled in."}]]}),
()=>({t:"Outbreak",x:"A sickness spreads through crowded quarters.",c:[[`Quarantine (-80 ${cu()})`,()=>{S.funds-=80;S.pop=Math.round(S.pop*.98);return"Contained. Minor losses."}],["Ignore it",()=>{S.pop=Math.round(S.pop*.92);S.appr-=4;return"The sickness takes a heavy toll."}]]}),
()=>({t:"Bumper Harvest",x:"Yields exceed every projection.",c:[[`Stockpile (+40 ${rn("food")})`,()=>{S.food+=40;return"Granaries fill."}],["Sell surplus (+80 funds)",()=>{S.funds+=80;return"A tidy profit."}]]}),
()=>({t:"Sabotage",x:"Saboteurs damage the power network.",c:[[`Hire guards (-70 ${cu()})`,()=>{S.funds-=70;return"Saboteurs caught."}],["Repair quietly",()=>{S.energy=Math.max(0,S.energy-30);return"Lost 30 power."}]]})];
function dmg(){const b=S.map.map((c,i)=>c?i:-1).filter(i=>i>=0);if(!b.length)return"Nothing to damage.";const i=b[rnd(b.length)],c=S.map[i];c.l--;if(c.l<1)S.map[i]=null;return`${L().b[c.t]} suffered damage${c.l<1?" and was destroyed":""}.`}
function choose(i){const e=S.ev;if(!e||!e.c[i])return;const r=e.c[i][1]();S.ev=null;say(`${e.t}: ${r}`,"a");beep(400,.15);render()}

/* ---------- simulation ---------- */
function tick(){const s=S;if(!s||s.over||s.ev)return;const hc=s.diff=="hard",m=mult(),w=SE[s.turn%4]=="Winter",pr={food:0,energy:0,mat:0,rsch:0,funds:0};let cp=100,gd=0,nb=0,up=0;
 s.map.forEach(c=>{if(!c)return;nb+=c.l;up+=c.l*3;const k=c.t;if(k<4)pr[K4[k]]+=BP[k]*c.l;else if(k==4)cp+=40*c.l;else if(k==5)pr.funds+=BP[5]*c.l;else gd+=c.l});
 const tm={food:T(0)?1.25:1,energy:T(1)?1.25:1,mat:T(2)?1.25:1,rsch:1,funds:T(3)?1.25:1};
 for(const k in pr)pr[k]*=m*tm[k]*(s.bo?.6:1);if(w)pr.food*=.7;up*=T(5)?.5:1;
 const fu=s.pop/40*(w?1.25:1)*(hc?1.3:1)*(s.dec=="ration"?.6:1),eu=(nb+s.pop/120)*(w?1.25:1)*(hc?1.25:1);
 let tax=s.pop*.2*(s.appr/70);if(s.dec=="festival")tax-=s.pop*.3;if(s.dec=="austerity")tax+=s.pop*.25;if(s.dec=="recruit")tax-=s.pop*.15;
 const d={food:pr.food-fu,energy:pr.energy-eu,mat:pr.mat,rsch:pr.rsch,funds:pr.funds+tax-up};
 for(const k in d){d[k]=Math.round(d[k]);s[k]+=d[k]}
 s.alerts=[];let fam=false;
 if(s.food<0){fam=true;s.food=0;s.alerts.push(["r","FAMINE: stores are empty and people are dying."])}
 s.bo=s.energy<0;if(s.bo){s.energy=0;s.alerts.push(["r","BLACKOUT: production reduced 40%, unrest rising."])}
 if(fam)s.pop-=Math.ceil(s.pop*.1);else if(s.appr>=40&&s.pop<cp)s.pop=Math.min(cp,s.pop+Math.ceil(s.pop*.04*(s.dec=="recruit"?2:1)));
 if(s.pop>cp)s.alerts.push(["r","OVERCROWDING: build housing or growth stops."]);
 if(s.funds<0)s.alerts.push(["r",`DEFICIT: treasury is ${F(s.funds)} ${cu()}.`]);
 const dt={ration:-6,festival:14,austerity:-10,recruit:0}[s.dec]||0;
 const tg=55+gd*3+(T(4)?6:0)+(fam?-20:s.food>fu*3?6:-4)+(s.bo?-14:4)+(s.funds<0?-15:0)+dt+s.mod-(s.pop>cp?10:0)-(hc?5:0);
 s.appr=cl(s.appr+(tg-s.appr)*.35,0,100);s.mod*=.6;s.dec=null;s.turn++;s.last=d;
 say(`${SE[(s.turn-1)%4]}, Y${Math.floor((s.turn-1)/4)+1}: ${cu()} ${d.funds>=0?"+":""}${d.funds}, ${rn("food")} ${d.food>=0?"+":""}${d.food}, ${rn("energy")} ${d.energy>=0?"+":""}${d.energy}, ${rn("mat")} +${d.mat}, ${rn("rsch")} +${d.rsch}. ${L().pp}: ${F(s.pop)}, approval ${Math.round(s.appr)}%.`,"d");
 if(s.appr<12){s.low++;s.alerts.push(["r","REVOLT IMMINENT: approval critical."])}else s.low=0;
 if(s.low>=2)return end(`The people rise up and overthrow ${L().ld} ${s.name}.`);
 if(s.pop<=0)return end("Your population has perished.");
 if(s.funds<-600)return end("Creditors seize everything. The state is bankrupt.");
 if(s.rsch>=eraCost())s.alerts.push(["c","Research sufficient to advance to the next Era."]);
 if(Math.random()<(hc?.7:.55)){s.ev=EV[rnd(EV.length)]();beep(300,.3,"sawtooth")}else beep(520,.08);
 if(!s.alerts.length&&!s.ev)s.alerts.push(["c","All sectors report normal operations."]);
 render()}
function end(msg){S.over=1;render();$("#over").hidden=false;$("#over").innerHTML=`<div><h2 class="dn">SIMULATION TERMINATED</h2><p>${msg}</p><p>Survived ${Math.floor(S.turn/4)} years · Era ${roman(S.era)} · Peak pop ${F(S.pop)}</p><button class="big" onclick="location.reload()">RETURN TO TITLE</button></div>`}

/* ---------- save / commands ---------- */
function save(){localStorage.setItem("dominion_save",JSON.stringify(S));say("SIMULATION SAVED. State, stats and inventory stored.","g")}
function load(str){try{S=JSON.parse(str||localStorage.getItem("dominion_save"));start();say("Simulation loaded.","g");render()}catch(e){alert("No valid save found.")}}
function cmd(t){t=t.trim().toUpperCase();if(!t)return;say("> "+t,"a");if(!S)return;
 if(t=="SAVE SIMULATION")save();else if(t=="LOAD"||t=="LOAD SIMULATION")load();else if(/^[1-3]$/.test(t))choose(+t-1);else if(t=="END TURN"||t=="END"||t=="NEXT")tick();
 else if(t=="HELP")["Build: choose a structure, click a sector. Click same type again to upgrade (max Lv5).","Decrees apply at end of turn. Only one at a time.","Advance Eras with research for infinite growth. At Era III you may found a Legacy.","Commands: SAVE SIMULATION, LOAD, END TURN, 1/2/3 (event choices)."].forEach(x=>say(x,"d"));
 else say("Unknown command. Type HELP.","r")}

$("#begin").onclick=()=>{newGame(0);beep(700)};$("#cont").onclick=()=>load();
$("#cmdf").onsubmit=e=>{e.preventDefault();cmd($("#cmd").value);$("#cmd").value=""};
$("#snd").onclick=()=>{mute=!mute;$("#snd").textContent=mute?"🔇 Sound":"🔊 Sound";if(!mute)ambient();else if(drone){drone.forEach(n=>n.stop());drone=null}};
$("#sv").onclick=save;
$("#dl").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:"application/json"}));a.download="dominion-save.json";a.click()};
setup();
