const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadModule(file, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const context = { exports: {}, URL, ...globals };
  vm.runInNewContext(output, context, { filename: file });
  return context.exports;
}

function analytics(env = 'production', id = 'G-TEST123') {
  const values = new Map();
  const calls = [];
  class Element {
    constructor(dataset = {}, parent = null) { this.dataset = dataset; this.parent = parent; }
    closest() { return this.dataset.trackEvent ? this : this.parent?.closest() ?? null; }
  }
  const window = { localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }, location: { pathname: '/' }, gtag: (...args) => calls.push(args) };
  const api = loadModule('src/lib/analytics.ts', { window, Element, process: { env: { NODE_ENV: env, NEXT_PUBLIC_GA_MEASUREMENT_ID: id } } });
  return { api, values, calls, window, Element };
}

const details = { section: 'research', element_id: 'drive', action: 'open', item_id: 'project-a' };

test('analytics stays silent until enabled; revocation immediately suppresses events', () => {
  const { api, calls, window } = analytics();
  assert.equal(api.trackEvent('research_click', details), false);
  api.setAnalyticsAllowed(true);
  assert.equal(api.trackEvent('research_click', details), true);
  api.setAnalyticsAllowed(false);
  assert.equal(api.trackEvent('research_click', details), false);
  assert.equal(calls.length, 1);
  assert.equal(window['ga-disable-G-TEST123'], true);
});

test('development, empty and invalid measurement IDs never collect', () => {
  for (const [env,id] of [['development','G-TEST123'],['production',''],['production','not-a-tag']]) {
    const { api, calls } = analytics(env,id);
    api.setAnalyticsAllowed(true);
    assert.equal(api.trackEvent('homepage_click', details), false);
    assert.equal(calls.length,0);
  }
});

test('owner opt-out wins over consent and is checked again on every event', () => {
  const { api, values, calls } = analytics();
  api.setAnalyticsAllowed(true);
  values.set(api.OWNER_OPTOUT_KEY, 'true');
  assert.equal(api.trackEvent('research_click', details), false);
  api.setAnalyticsAllowed(true);
  assert.equal(api.analyticsAllowed(), false);
  assert.equal(calls.length,0);
});

test('blocked storage or tag cannot break a link handler', () => {
  const { api, window } = analytics();
  window.localStorage.getItem = () => { throw Error('blocked'); };
  window.localStorage.setItem = () => { throw Error('blocked'); };
  assert.equal(api.readPreference('test'),null);
  assert.doesNotThrow(() => api.savePreference('test','value'));
  api.setAnalyticsAllowed(true);
  window.gtag = () => { throw Error('blocked'); };
  assert.equal(api.trackEvent('research_click', details),false);
});

test('nested icon activation emits only the nearest annotation and controlled values', () => {
  const { api, calls, Element } = analytics();
  api.setAnalyticsAllowed(true);
  const parent = new Element({ trackEvent:'homepage_click',trackSection:'projects',trackElement:'preview',trackAction:'open' });
  const link = new Element({ trackEvent:'research_click',trackSection:'research',trackElement:'drive',trackAction:'open',trackItem:'project-a' },parent);
  const icon = new Element({},link);
  api.trackAnnotatedClick(icon);
  assert.equal(calls.length,1);
  assert.equal(calls[0][1],'research_click');
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0][2])),{...details,transport_type:'beacon'});
});

test('blank space, decorative elements, incomplete annotations and non-home routes stay silent', () => {
  const { api, calls, Element, window } = analytics();
  api.setAnalyticsAllowed(true);
  api.trackAnnotatedClick(null);
  api.trackAnnotatedClick(new Element());
  api.trackAnnotatedClick(new Element({trackEvent:'homepage_click'}));
  window.location.pathname='/404/';
  api.trackAnnotatedClick(new Element({trackEvent:'homepage_click',trackSection:'dock',trackElement:'home',trackAction:'navigate'}));
  assert.equal(calls.length,0);
});

test('same destination placements and toggle actions remain distinguishable', () => {
  const { api,calls,Element } = analytics();
  api.setAnalyticsAllowed(true);
  for (const section of ['dock','contact']) api.trackAnnotatedClick(new Element({trackEvent:'contact_click',trackSection:section,trackElement:'linkedin',trackAction:'open'}));
  for (const action of ['expand','collapse']) api.trackAnnotatedClick(new Element({trackEvent:'homepage_click',trackSection:'about',trackElement:'read_more',trackAction:action}));
  assert.equal(calls.length,4);
  assert.notEqual(calls[0][2].section,calls[1][2].section);
  assert.notEqual(calls[2][2].action,calls[3][2].action);
});

test('page location drops private parameters, hash and unsafe campaigns', () => {
  const { api } = analytics();
  assert.equal(api.analyticsPageLocation('https://example.com/?email=person@example.com&utm_source=linkedin&utm_campaign=research-2026#private'), 'https://example.com/?utm_source=linkedin&utm_campaign=research-2026');
  assert.equal(api.analyticsPageLocation('https://example.com/?utm_content=person%40example.com'), 'https://example.com/');
});

function visibility() {
  const heading={},entry={};
  const timers=new Map();
  const listeners=new Map();
  let observer;
  let timerId=0;
  const document={hidden:false,getElementById:id=>id==='research-heading'?heading:entry,addEventListener:(event,callback)=>listeners.set(event,callback),removeEventListener:event=>listeners.delete(event)};
  class IntersectionObserver {
    constructor(callback) {this.callback=callback;this.disconnected=false;observer=this;}
    observe() {}
    disconnect() {this.disconnected=true;}
  }
  const api=loadModule('src/lib/research-visibility.ts',{document,IntersectionObserver,setTimeout:(callback)=>{timers.set(++timerId,callback);return timerId;},clearTimeout:id=>timers.delete(id)});
  let views=0;
  const stop=api.observeResearch(()=>{views++;return true;});
  const visible=(target,ratio)=>observer.callback([{target,isIntersecting:ratio>0,intersectionRatio:ratio}]);
  const fire=()=>{const callbacks=[...timers.values()];timers.clear();callbacks.forEach(cb=>cb());};
  return {heading,entry,document,listeners,timers,visible,fire,stop,get views(){return views;},get observer(){return observer;}};
}

test('research requires both targets continuously visible; scrolling away cancels timer', () => {
  const v=visibility();
  v.visible(v.heading,1);assert.equal(v.timers.size,0);
  v.visible(v.entry,0.6);assert.equal(v.timers.size,1);
  v.visible(v.heading,0);assert.equal(v.timers.size,0);
  v.fire();assert.equal(v.views,0);
  v.visible(v.heading,1);v.fire();assert.equal(v.views,1);
  assert.equal(v.observer.disconnected,true);
  v.visible(v.entry,1);v.fire();assert.equal(v.views,1);
});

test('hidden tabs do not count and cleanup cancels pending visibility work', () => {
  const v=visibility();
  v.visible(v.heading,1);v.visible(v.entry,1);
  v.document.hidden=true;v.listeners.get('visibilitychange')();
  assert.equal(v.timers.size,0);
  v.document.hidden=false;v.listeners.get('visibilitychange')();
  assert.equal(v.timers.size,1);
  v.stop();v.fire();assert.equal(v.views,0);
  assert.equal(v.listeners.size,0);
});

// Exercise the client lifecycle without a browser or a live Google property.
function client(initialConsent = null, owner = false) {
  const base = analytics();
  const { api,window,values } = base;
  window.gtag = undefined;
  window.location.href = 'https://example.com/';
  let reloads=0;
  window.location.reload=()=>reloads++;
  window.addEventListener=()=>{};window.removeEventListener=()=>{};
  if(initialConsent) values.set(api.CONSENT_KEY,initialConsent);
  if(owner) values.set(api.OWNER_OPTOUT_KEY,'true');
  const scripts=[];
  const listeners=new Map();
  const document={title:'Portfolio',referrer:'',createElement:()=>({}),head:{appendChild:script=>scripts.push(script)},addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
  const slots=[];
  let cursor=0,pending=[],pathname='/';
  const react={
    useState(value) {const index=cursor++;if(!slots[index]) slots[index]={value};return [slots[index].value,v=>slots[index].value=v];},
    useRef(value) {const index=cursor++;if(!slots[index]) slots[index]={current:value};return slots[index];},
    useEffect(fn,deps) {const index=cursor++;const previous=slots[index];if(!previous||deps.some((v,i)=>v!==previous.deps[i])) {pending.push(()=>{previous?.cleanup?.();slots[index]={deps,cleanup:fn()};});}}
  };
  const source=fs.readFileSync(path.join(__dirname,'../src/components/analytics.tsx'),'utf8');
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const context={exports:{},window,document,URL,require:name=>{
    if(name==='react')return react;
    if(name==='next/navigation')return {usePathname:()=>pathname};
    if(name==='@/lib/analytics')return api;
    if(name==='@/lib/research-visibility')return {observeResearch:()=>()=>{}};
    return require(name);
  }};
  vm.runInNewContext(output,context);
  const render=()=>{cursor=0;pending=[];const view=context.exports.Analytics();pending.forEach(fn=>fn());return view;};
  const button=(view,label)=>{
    if(!view||typeof view!=='object')return null;
    if(view.type==='button'&&view.props.children===label)return view;
    for(const child of [view.props?.children].flat(Infinity)) {const found=button(child,label);if(found)return found;}
    return null;
  };
  const pageViews=()=>window.dataLayer?.filter(args=>args[0]==='event'&&args[1]==='page_view').length??0;
  render();
  return {render,button,scripts,listeners,pageViews,api,window,navigate:path=>{pathname=path;window.location.pathname=path;window.location.href='https://example.com'+path;},get reloads(){return reloads;}};
}

test('client loads no Google script before consent; granting initializes exactly once',()=>{
  const c=client();
  let view=c.render();
  assert.equal(c.scripts.length,0);assert.equal(c.pageViews(),0);
  c.button(view,'Allow analytics').props.onClick();
  c.render();c.render();
  assert.equal(c.scripts.length,1);assert.equal(c.pageViews(),1);
  assert.equal(c.scripts[0].async,true);
});

test('client counts route changes once and withdrawing consent disables then reloads',()=>{
  const c=client('granted');
  c.render();assert.equal(c.pageViews(),1);
  c.navigate('/404/');c.render();c.render();assert.equal(c.pageViews(),2);
  c.navigate('/');let view=c.render();assert.equal(c.pageViews(),3);
  c.button(view,'Analytics settings').props.onClick();view=c.render();
  c.button(view,'Decline').props.onClick();c.render();
  assert.equal(c.api.analyticsAllowed(),false);assert.equal(c.reloads,1);
  assert.equal(c.listeners.has('click'),false);
});

test('client owner exclusion and previously declined consent load no Google code',()=>{
  for(const c of [client('granted',true),client('denied')]){
    c.render();assert.equal(c.scripts.length,0);assert.equal(c.pageViews(),0);
    assert.equal(c.listeners.has('click'),false);
  }
});


test('research-page Drive and contact clicks work with either trailing-slash form', () => {
  for (const path of ['/research', '/research/']) {
    const { api, calls, Element, window } = analytics();
    api.setAnalyticsAllowed(true);
    window.location.pathname = path;
    api.trackAnnotatedClick(new Element({trackEvent:'research_click',trackSection:'research',trackElement:'drive',trackAction:'open',trackItem:'project-a'}));
    api.trackAnnotatedClick(new Element({trackEvent:'contact_click',trackSection:'dock',trackElement:'linkedin',trackAction:'open'}));
    api.trackAnnotatedClick(new Element({trackEvent:'homepage_click',trackSection:'dock',trackElement:'home',trackAction:'navigate'}));
    assert.deepEqual(calls.map(call => call[1]), ['research_click', 'contact_click', 'navigation_click']);
  }
});
