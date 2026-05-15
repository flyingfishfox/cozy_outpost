// HUD.jsx
function HUDBar({ day, morale, onLogOpen }) {
  const toggleFullscreen = () => {
    if(!document.fullscreenElement){
      document.documentElement.requestFullscreen().catch(()=>{});
    } else {
      document.exitFullscreen().catch(()=>{});
    }
  };
  return (
    <div style={{
      position:'absolute', top:0, left:0, right:0, height:34,
      background:'linear-gradient(180deg,rgba(10,6,2,0.92),rgba(10,6,2,0.5))',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 10px', zIndex:50,
      borderBottom:'1px solid rgba(252,244,210,0.1)'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontFamily:'VT323',fontSize:17,color:'rgba(252,244,210,0.7)',letterSpacing:'1px'}}>
          MORALE <span style={{color:'rgba(252,244,210,0.95)'}}>{morale}</span>
        </span>
        <button onClick={onLogOpen} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',lineHeight:1,padding:'2px 4px'}}>📓</button>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontFamily:'VT323',fontSize:17,color:'rgba(252,244,210,0.7)',letterSpacing:'1px'}}>
          DAY <span style={{color:'rgba(252,244,210,0.95)'}}>{day}</span>
        </span>
        <button onClick={toggleFullscreen} title="Fullscreen"
          style={{background:'none',border:'none',fontSize:15,cursor:'pointer',lineHeight:1,padding:'2px 4px',color:'rgba(252,244,210,0.45)'}}>⛶</button>
      </div>
    </div>
  );
}
Object.assign(window,{HUDBar});
