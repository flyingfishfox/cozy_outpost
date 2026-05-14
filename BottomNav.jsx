// BottomNav.jsx
function BottomNav({ onLeft, onLeftUp, onRight, onRightUp, scene, scoutMode, setScoutMode, cmdScout }) {

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
    fontFamily:'VT323', fontSize:20,
    // Larger tap targets for mobile fingers
    minWidth:56, minHeight:52,
    padding:'8px 18px',
    cursor:'pointer', letterSpacing:'1px',
    transition:'background .08s',
    userSelect:'none', WebkitUserSelect:'none',
    touchAction:'manipulation',
  };

  const pressDown = (e, fn) => {
    e.currentTarget.style.background='rgba(252,244,210,0.2)';
    fn && fn();
  };
  const pressUp = (e, fn) => {
    e.currentTarget.style.background='rgba(252,244,210,0.08)';
    fn && fn();
  };

  const arrowBtn = (dir, dest, onD, onU) => (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
      <button
        onPointerDown={e=>pressDown(e,onD)}
        onPointerUp={e=>pressUp(e,onU)}
        onPointerLeave={e=>pressUp(e,onU)}
        style={{...navBtnStyle, fontSize:18, minWidth:64, minHeight:56}}>
        {dir==='left'?'◀':'▶'}
      </button>
      {dest && <span style={{fontFamily:'VT323',fontSize:12,color:'rgba(252,244,210,0.3)',letterSpacing:'1px'}}>{dest}</span>}
    </div>
  );

  if(scoutMode && scene==='home'){
    return (
      <div style={{
        height:80, background:'rgba(10,6,2,0.97)',
        borderTop:'1px solid rgba(252,244,210,0.1)',
        display:'flex', alignItems:'center',
        padding:'0 10px', flexShrink:0, zIndex:50, gap:5,
      }}>
        {[['TREAT','beg'],['PAT','sit'],['FETCH','run'],['REST','sleep']].map(([label,cmd])=>(
          <button key={cmd}
            onPointerDown={e=>e.currentTarget.style.background='rgba(252,244,210,0.2)'}
            onPointerUp={e=>{e.currentTarget.style.background='rgba(252,244,210,0.08)';cmdScout(cmd);if(cmd!=='sleep')setScoutMode(false);}}
            style={{...navBtnStyle, flex:1, height:48, fontSize:14}}>
            {label}
          </button>
        ))}
        <button
          onPointerUp={()=>setScoutMode(false)}
          onPointerDown={e=>e.currentTarget.style.background='rgba(252,200,180,0.15)'}
          style={{...navBtnStyle, minWidth:44, padding:'8px 12px', color:'rgba(252,200,180,0.8)', border:'1px solid rgba(252,200,180,0.2)', flexShrink:0}}>
          X
        </button>
      </div>
    );
  }

  return (
    <div style={{
      height:80, background:'rgba(10,6,2,0.97)',
      borderTop:'1px solid rgba(252,244,210,0.1)',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 14px', flexShrink:0, zIndex:50,
    }}>
      {arrowBtn('left',  destinations.left,  onLeft,  onLeftUp)}

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
        <span style={{fontFamily:'VT323',fontSize:12,color:'rgba(252,244,210,0.25)',letterSpacing:'2px'}}>
          {sceneLabel}
        </span>
        {scene==='home' && (
          <button
            onPointerUp={()=>setScoutMode(true)}
            onPointerDown={e=>e.currentTarget.style.background='rgba(252,244,210,0.2)'}
            style={{...navBtnStyle, fontSize:16}}>
            SCOUT
          </button>
        )}
      </div>

      {arrowBtn('right', destinations.right, onRight, onRightUp)}
    </div>
  );
}

Object.assign(window,{BottomNav});
