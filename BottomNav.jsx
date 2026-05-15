// BottomNav.jsx
function BottomNav({ onLeft, onLeftUp, onRight, onRightUp, scene, scoutMode, setScoutMode, cmdScout, portrait,
  watching, startWatching, stopWatching,
  canSleep, doSleep,
  zombiesLeft, nearZombie, doStab, doShoot }) {

  const isMobile = 'ontouchstart' in window;
  const navH   = isMobile ? 54 : 68;
  const btnFS  = isMobile ? 13 : 18;
  const labelFS= isMobile ? 10 : 13;

  const destinations = {
    home:    { left:'MEADOW', right:'OUTPOST' },
    outpost: { left:'HOME',   right:null },
    forest:  { left:null,     right:'HOME' },
  }[scene] || {};

  const sceneLabel = {home:'HOME', outpost:'OUTPOST', forest:'MEADOW'}[scene]||'';

  const navBtnStyle = {
    background:'rgba(252,244,210,0.08)',
    border:'1px solid rgba(252,244,210,0.2)',
    color:'rgba(252,244,210,0.9)',
    fontFamily:'VT323', fontSize:btnFS,
    minWidth:isMobile?40:56, minHeight:isMobile?36:48,
    padding: isMobile?'3px 10px':'8px 18px',
    cursor:'pointer', letterSpacing:'1px',
    transition:'background .08s',
    userSelect:'none', WebkitUserSelect:'none',
    touchAction:'manipulation',
  };

  const actionBtn = (label, onClick, disabled, icon) => (
    <button
      onPointerDown={e=>!disabled&&(e.currentTarget.style.opacity='0.6')}
      onPointerUp={e=>{e.currentTarget.style.opacity='1';if(!disabled)onClick();}}
      style={{
        background:'rgba(252,244,210,0.1)',
        border:'1px solid rgba(252,244,210,0.25)',
        color: disabled?'rgba(252,244,210,0.3)':'rgba(252,244,210,0.9)',
        fontFamily:'VT323', fontSize:16,
        padding:'6px 14px',
        cursor:disabled?'default':'pointer',
        display:'flex', alignItems:'center', gap:5,
        whiteSpace:'nowrap', touchAction:'manipulation',
        minHeight:38,
      }}>
      {icon && <img src={icon} style={{imageRendering:'pixelated',height:12}}/>}
      {label}
    </button>
  );

  const pressDown = (e,fn) => { e.currentTarget.style.background='rgba(252,244,210,0.2)'; fn&&fn(); };
  const pressUp   = (e,fn) => { e.currentTarget.style.background='rgba(252,244,210,0.08)'; fn&&fn(); };

  const arrowBtn = (dir, dest, onD, onU) => (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
      <button
        onPointerDown={e=>pressDown(e,onD)} onPointerUp={e=>pressUp(e,onU)} onPointerLeave={e=>pressUp(e,onU)}
        style={{...navBtnStyle}}>
        {dir==='left'?'◀':'▶'}
      </button>
      {dest && <span style={{fontFamily:'VT323',fontSize:labelFS,color:'rgba(252,244,210,0.3)',whiteSpace:'nowrap'}}>{dest}</span>}
    </div>
  );

  if(scoutMode && scene==='home'){
    return (
      <div style={{height:navH,background:'rgba(10,6,2,0.97)',borderTop:'1px solid rgba(252,244,210,0.1)',display:'flex',alignItems:'center',padding:'0 8px',flexShrink:0,zIndex:50,gap:5}}>
        {[['TREAT','beg'],['PAT','sit'],['FETCH','run'],['REST','sleep']].map(([label,cmd])=>(
          <button key={cmd}
            onPointerDown={e=>e.currentTarget.style.opacity='0.6'}
            onPointerUp={e=>{e.currentTarget.style.opacity='1';cmdScout(cmd);if(cmd!=='sleep')setScoutMode(false);}}
            style={{...navBtnStyle,flex:1}}>
            {label}
          </button>
        ))}
        <button
          onPointerUp={()=>setScoutMode(false)}
          onPointerDown={e=>e.currentTarget.style.opacity='0.6'}
          style={{...navBtnStyle,minWidth:isMobile?32:40,color:'rgba(252,200,180,0.8)',border:'1px solid rgba(252,200,180,0.2)',flexShrink:0}}>
          X
        </button>
      </div>
    );
  }

  return (
    <div style={{height:navH,background:'rgba(10,6,2,0.97)',borderTop:'1px solid rgba(252,244,210,0.1)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 10px',flexShrink:0,zIndex:50,gap:6}}>
      {arrowBtn('left',  destinations.left,  onLeft,  onLeftUp)}

      {/* Center — scene label + contextual actions */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,flex:1}}>
        {scene==='home' && actionBtn('SCOUT', ()=>setScoutMode(true), false)}
        {scene==='home'    && canSleep   && actionBtn('SLEEP', doSleep, false)}
        {scene==='forest'  && !watching  && actionBtn('WATCH VIEW', startWatching, false)}
        {scene==='forest'  &&  watching  && actionBtn('STOP',  stopWatching,  false)}
        {scene==='outpost' && zombiesLeft>0 && <>
          {actionBtn('STAB',  doStab,  !nearZombie, BASE+'/ui_kits/Sword8.png')}
          {actionBtn('SHOOT', doShoot, !nearZombie, BASE+'/ui_kits/Deagle.png')}
          <span style={{fontFamily:'Press Start 2P',fontSize:6,color:'#c06060'}}>x{zombiesLeft}</span>
        </>}
        {scene==='outpost' && zombiesLeft===0 && (
          <span style={{fontFamily:'VT323',fontSize:btnFS,color:'rgba(252,244,210,0.3)'}}>ALL CLEAR</span>
        )}
      </div>

      {arrowBtn('right', destinations.right, onRight, onRightUp)}
    </div>
  );
}

Object.assign(window,{BottomNav});
