// HUD.jsx
function HUDBar({ day, morale, onLogOpen }) {
  const isMobile = 'ontouchstart' in window;
  const h  = isMobile ? 28 : 34;
  const fs = isMobile ? 12 : 17;

  const toggleFullscreen = () => {
    if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen().catch(()=>{});
  };

  return (
    <div style={{
      position:'absolute', top:0, left:0, right:0, height:h,
      background:'linear-gradient(180deg,rgba(10,6,2,0.95),rgba(10,6,2,0.6))',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 8px', zIndex:50,
      borderBottom:'1px solid rgba(252,244,210,0.1)'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <span style={{fontFamily:'VT323',fontSize:fs,color:'rgba(252,244,210,0.7)',letterSpacing:'1px',whiteSpace:'nowrap'}}>
          MORALE <span style={{color:'rgba(252,244,210,0.95)'}}>{morale}</span>
        </span>
        <button onClick={onLogOpen} style={{background:'none',border:'none',fontSize:fs+1,cursor:'pointer',lineHeight:1,padding:'0 2px'}}>📓</button>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <span style={{fontFamily:'VT323',fontSize:fs,color:'rgba(252,244,210,0.7)',letterSpacing:'1px',whiteSpace:'nowrap'}}>
          DAY <span style={{color:'rgba(252,244,210,0.95)'}}>{day}</span>
        </span>
        <button onClick={toggleFullscreen} style={{background:'none',border:'none',fontSize:fs-2,cursor:'pointer',lineHeight:1,padding:'0 2px',color:'rgba(252,244,210,0.4)'}}>⛶</button>
      </div>
    </div>
  );
}
Object.assign(window,{HUDBar});
