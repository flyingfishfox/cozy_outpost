// HUD.jsx
function HUDBar({ day, morale, onLogOpen }) {
  const isMobile = 'ontouchstart' in window;
  const h  = isMobile ? 32 : 38;
  const fs = isMobile ? 13 : 17;

  const toggleFullscreen = () => {
    if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen().catch(()=>{});
  };

  const iconBtn = (label, onClick) => (
    <button onClick={onClick} style={{
      background:'rgba(252,244,210,0.1)',
      border:'1px solid rgba(252,244,210,0.2)',
      color:'rgba(252,244,210,0.8)',
      fontFamily:'VT323', fontSize:isMobile?12:14,
      padding:'1px 7px', cursor:'pointer',
      letterSpacing:'0.5px', whiteSpace:'nowrap',
      transition:'background .08s',
    }}>{label}</button>
  );

  return (
    <div style={{
      position:'absolute', top:0, left:0, right:0, height:h,
      background:'linear-gradient(180deg,rgba(10,6,2,0.95),rgba(10,6,2,0.6))',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 8px', zIndex:50, gap:6,
      borderBottom:'1px solid rgba(252,244,210,0.1)'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <span style={{fontFamily:'VT323',fontSize:fs,color:'rgba(252,244,210,0.7)',letterSpacing:'1px',whiteSpace:'nowrap'}}>
          MORALE <span style={{color:'rgba(252,244,210,0.95)'}}>{morale}</span>
        </span>
        {iconBtn('📓 LOG', onLogOpen)}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <span style={{fontFamily:'VT323',fontSize:fs,color:'rgba(252,244,210,0.7)',letterSpacing:'1px',whiteSpace:'nowrap'}}>
          DAY <span style={{color:'rgba(252,244,210,0.95)'}}>{day}</span>
        </span>
        {iconBtn('⛶ FULL', toggleFullscreen)}
      </div>
    </div>
  );
}
Object.assign(window,{HUDBar});
