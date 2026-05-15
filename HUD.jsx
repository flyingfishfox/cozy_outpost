// HUD.jsx
function HUDBar({ day, morale, onLogOpen, portrait, scene,
  watching, startWatching, stopWatching,
  canSleep, doSleep,
  zombiesLeft, nearZombie, doStab, doShoot }) {

  const isMobile = 'ontouchstart' in window;
  const h  = isMobile ? 32 : 38;
  const fs = isMobile ? 13 : 17;
  const btnFS = isMobile ? 13 : 16;

  const toggleFullscreen = () => {
    if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen().catch(()=>{});
  };

  const actionBtn = (label, onClick, disabled, icon) => (
    <button
      onPointerDown={e=>!disabled&&(e.currentTarget.style.opacity='0.6')}
      onPointerUp={e=>{e.currentTarget.style.opacity='1'; if(!disabled)onClick();}}
      style={{
        background:'rgba(252,244,210,0.1)',
        border:'1px solid rgba(252,244,210,0.25)',
        color: disabled ? 'rgba(252,244,210,0.3)' : 'rgba(252,244,210,0.9)',
        fontFamily:'VT323', fontSize:btnFS,
        padding:'1px 10px', cursor: disabled?'default':'pointer',
        letterSpacing:'0.5px', display:'flex', alignItems:'center', gap:5,
        transition:'opacity .08s', whiteSpace:'nowrap',
      }}>
      {icon && <img src={icon} style={{imageRendering:'pixelated',height:10}}/>}
      {label}
    </button>
  );

  return (
    <div style={{
      position:'absolute', top:0, left:0, right:0, height:h,
      background:'linear-gradient(180deg,rgba(10,6,2,0.95),rgba(10,6,2,0.6))',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 8px', zIndex:50, gap:6,
      borderBottom:'1px solid rgba(252,244,210,0.1)'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
        <span style={{fontFamily:'VT323',fontSize:fs,color:'rgba(252,244,210,0.7)',letterSpacing:'1px',whiteSpace:'nowrap'}}>
          MORALE <span style={{color:'rgba(252,244,210,0.95)'}}>{morale}</span>
        </span>
        <button onClick={onLogOpen} style={{background:'none',border:'none',fontSize:fs+2,cursor:'pointer',lineHeight:1,padding:'0 2px'}}>📓</button>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:6,flex:1,justifyContent:'center'}}>
        {scene==='forest' && !watching && actionBtn('WATCH', startWatching, false)}
        {scene==='forest' &&  watching && actionBtn('STOP',  stopWatching,  false)}
        {scene==='home'   && canSleep  && actionBtn('SLEEP', doSleep,       false)}
        {scene==='outpost' && zombiesLeft>0 && <React.Fragment>
          {actionBtn('STAB',  doStab,  !nearZombie, BASE+'/ui_kits/Sword8.png')}
          {actionBtn('SHOOT', doShoot, !nearZombie, BASE+'/ui_kits/Deagle.png')}
          <span style={{fontFamily:'Press Start 2P',fontSize:7,color:'#c06060',marginLeft:4}}>x{zombiesLeft}</span>
        </React.Fragment>}
      </div>

      <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
        <span style={{fontFamily:'VT323',fontSize:fs,color:'rgba(252,244,210,0.7)',letterSpacing:'1px',whiteSpace:'nowrap'}}>
          DAY <span style={{color:'rgba(252,244,210,0.95)'}}>{day}</span>
        </span>
        <button onClick={toggleFullscreen} style={{background:'none',border:'none',fontSize:fs-2,cursor:'pointer',lineHeight:1,padding:'0 2px',color:'rgba(252,244,210,0.4)'}}>⛶</button>
      </div>
    </div>
  );
}
Object.assign(window,{HUDBar});
