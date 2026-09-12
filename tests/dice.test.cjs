const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function game() {
  const elements = new Map();
  function element() { return { hidden:false, textContent:'', disabled:false, dataset:{}, style:{}, children:[], attrs:{}, classList:{add(){},remove(){},toggle(){},contains(){return false}}, setAttribute(k,v){this.attrs[k]=v}, appendChild(e){this.children.push(e)}, append(...e){this.children.push(...e)}, replaceChildren(){this.children=[]}, addEventListener(){}, querySelector(){return element()}, querySelectorAll(){return []} }; }
  const document = { readyState:'loading', addEventListener(){}, body:element(), getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)}, createElement:element, querySelectorAll(){return []} };
  const storage=new Map(); const timers=[]; let random=0;
  const context=vm.createContext({document,window:{},console,Uint32Array,crypto:{getRandomValues(a){a[0]=random++%6;return a}},localStorage:{setItem(k,v){storage.set(k,v)},getItem(k){return storage.get(k)||null}},matchMedia:()=>({matches:false}),setTimeout(fn){timers.push(fn)},confirm:()=>true});
  const html=fs.readFileSync(path.resolve(__dirname,'..',process.env.GENERALA_FILE || 'generala.html'),'utf8');
  const source=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\}\)\(\);\s*$/,`globalThis.api = { diceScore, canScore, submitScore, advanceTurn, scoreStorageKey, setMode, currentDice, rollDice, renderDice, initDice, freshDice, get rolling(){return rolling}, get state(){return state}, configure(){state.players=[{id:'one'},{id:'two'}]; state.activePlayerIndex=0;state.rules.sound=false; sound.enabled=false;} };})();`);
  vm.runInContext(source,context);
  context.api.configure();
  return {api:context.api,elements,storage,finish(){timers.splice(0).forEach(fn=>fn())}};
}

test('five values in range, held dice survive, double clicks and fourth throws are blocked',()=>{
 const {api,finish,elements}=game(); api.setMode('play'); api.rollDice();
 assert.equal(api.currentDice().rolls,1); api.rollDice();assert.equal(api.currentDice().rolls,1); finish();
 const fixed=api.currentDice().values[0]; api.currentDice().held[0]=true;
 api.rollDice();finish();assert.equal(api.currentDice().values[0],fixed);assert.equal(api.currentDice().rolls,2);
 api.rollDice();finish();api.rollDice();assert.equal(api.currentDice().rolls,3);
 assert.equal(elements.get('roll-dice').disabled,true);
 assert.ok(api.currentDice().values.every(v=>v>=1&&v<=6));
});
test('all held blocks rolling; releasing a die permits another throw',()=>{
 const {api,finish}=game();api.setMode('play');api.rollDice();finish();api.currentDice().held.fill(true);
 api.rollDice();assert.equal(api.currentDice().rolls,1);
 api.currentDice().held[2]=false;api.rollDice();finish();assert.equal(api.currentDice().rolls,2);
});
test('combined mode keeps separate player turns and hides dice in score mode',()=>{
 const {api,finish,elements}=game();api.setMode('both');api.rollDice();finish();
 api.state.activePlayerIndex=1;assert.equal(api.currentDice().rolls,0);
 api.state.activePlayerIndex=0;assert.equal(api.currentDice().rolls,1);
 api.state.isGameOver=true;api.rollDice();assert.equal(api.currentDice().rolls,1);
 api.setMode('score');assert.equal(elements.get('dice-panel').hidden,true);
});
test('solo dice are persisted before animation and do not overwrite score storage',()=>{
 const {api,storage}=game();api.setMode('play');api.rollDice();
 assert.equal(JSON.parse(storage.get('generala_solo_dice_v1')).rolls,1);
 assert.equal(storage.has('tanteador_generala_state_v1'),false);
});

 test('pending score blocks further dice rolls until confirmed',()=>{
 const {api,finish,elements}=game();api.setMode('both');api.rollDice();finish();
 api.state.pendingTurn={playerId:'one',catId:'1'};api.renderDice();api.rollDice();
 assert.equal(api.currentDice().rolls,1);assert.equal(elements.get('roll-dice').disabled,true);
 api.state.pendingTurn=null;api.rollDice();assert.equal(api.currentDice().rolls,2);
});

test('personal scorecard has storage independent from group scoring',()=>{
 const {api}=game();
 assert.equal(api.scoreStorageKey('both'),'generala_personal_state_v1');
 assert.equal(api.scoreStorageKey('score'),'tanteador_generala_state_v1');
});

test('personal scores are derived from dice and throw number',()=>{
 const {api}=game();api.setMode('both');const d=api.currentDice();
 assert.equal(api.diceScore('one','1'),null);
 d.rolls=1;d.values=[2,2,2,5,5];
 assert.equal(api.diceScore('one','2').score,6);
 assert.equal(api.diceScore('one','F').score,35);
 assert.equal(api.diceScore('one','P').score,0);
 d.rolls=2;assert.equal(api.diceScore('one','F').score,30);
 for(const values of [[1,2,3,4,5],[2,3,4,5,6],[6,1,2,3,4],[1,3,4,5,6]]){d.values=values;assert.equal(api.diceScore('one','E').score,20);}
 d.values=[6,6,6,6,6];d.rolls=1;api.state.rules.generalaServida='win';
 assert.equal(api.diceScore('one','G').win,true);
 assert.equal(api.diceScore('one','DG').score,0);
 api.state.rules.dobleGenerala=true;api.state.scores={one:{G:{score:50}}};
 assert.equal(api.diceScore('one','DG').score,120);
 d.rolls=3;assert.equal(api.diceScore('one','DG').score,100);
});

test('three sixes score exactly 18 in the personal scorecard',()=>{
 const {api}=game();api.setMode('both');const d=api.currentDice();
 d.rolls=2;d.values=[6,6,6,2,3];
 const result=api.diceScore('one','6');
 assert.equal(result.score,18);
 assert.equal(result.isServida,false);
 assert.equal(result.win,false);
 assert.equal(api.canScore('one','6'),true);
});

test('personal scorecard categories remain available before the first roll',()=>{
 const {api}=game();api.setMode('both');
 assert.equal(api.canScore('one','6'),true);
 assert.equal(api.diceScore('one','6'),null);
});
test('invalid personal score submissions cannot mutate scorecard',()=>{
 const {api}=game();api.setMode('both');const d=api.currentDice();d.rolls=1;d.values=[2,2,2,5,5];
 api.state.scores={one:{}};api.state.history=[];
 api.submitScore('one','2',10,false,false);
 api.submitScore('one','F',30,false,false);
 assert.equal(Object.keys(api.state.scores.one).length,0);
 assert.equal(api.state.history.length,0);
});

test('personal mode allows cancelling an unmatched category but never scoring it',()=>{
 const {api}=game();api.setMode('both');const d=api.currentDice();d.rolls=2;d.values=[2,2,4,5,6];
 assert.equal(api.canScore('one','2'),true);
 assert.equal(api.canScore('one','F'),true);
 assert.equal(api.canScore('one','P'),true);
 assert.equal(api.canScore('one','G'),true);
 api.state.scores={one:{}};api.state.history=[];
 api.submitScore('one','F',30,false,false);
 assert.equal(Object.keys(api.state.scores.one).length,0);
 api.submitScore('one','F',0,true,false);
 assert.equal(api.state.scores.one.F.score,0);
 assert.equal(api.state.scores.one.F.isScratched,true);
});

test('personal score records the round and closes through the same action as the cup',()=>{
 const {api}=game();api.setMode('both');const d=api.currentDice();d.rolls=2;d.values=[6,6,6,2,3];
 api.state.scores={one:{}};api.state.history=[];api.state.currentRound=4;
 api.submitScore('one','6',18,false,false);
 assert.equal(api.state.pendingTurn.round,4);
 api.advanceTurn();
 assert.equal(api.state.pendingTurn,null);
 assert.equal(api.state.activePlayerIndex,1);
});
