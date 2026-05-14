// Panels.jsx
function LogPanel({ entries, onClose, playerName }) {
  return (
    <div style={{
      background:'linear-gradient(180deg,#f6ead0,#e4d0a0)',
      border:'3px solid #886030', borderBottom:'none',
      width:'100%', maxHeight:'70%', overflowY:'auto',
      borderRadius:'10px 10px 0 0',
      animation:'panelUp .24s ease-out',
      boxShadow:'0 -12px 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        background:'linear-gradient(180deg,#3a2818,#281808)',
        padding:'10px 14px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        borderBottom:'2px solid rgba(140,100,50,0.4)',
        position:'sticky', top:0, zIndex:5,
        borderRadius:'8px 8px 0 0',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontFamily:'Press Start 2P',fontSize:8,color:'#d4a860'}}>RANGER LOG</span>
          {playerName && <span style={{fontFamily:'VT323',fontSize:14,color:'rgba(212,168,96,0.45)'}}>{playerName}</span>}
        </div>
        <button onClick={onClose} style={{background:'none',border:'1px solid rgba(212,168,96,0.3)',color:'rgba(212,168,96,0.8)',fontFamily:'Press Start 2P',fontSize:8,padding:'3px 8px',cursor:'pointer'}}>X</button>
      </div>
      <div style={{padding:13}}>
        {[...entries].reverse().map((e,i)=>(
          <div key={i} style={{borderLeft:'3px solid #a88020',padding:'5px 9px',fontFamily:'VT323',fontSize:15,color:'#382008',marginBottom:5,lineHeight:1.35}}>
            <span style={{fontFamily:'Press Start 2P',fontSize:6,color:'#987018',marginRight:7}}>DAY {e.day}</span>
            {e.text}
          </div>
        ))}
      </div>
    </div>
  );
}
Object.assign(window,{LogPanel});
  return (
    <div style={{
      background:'linear-gradient(180deg,#f6ead0,#e4d0a0)',
      border:'3px solid #886030', borderBottom:'none',
      width:'100%', maxHeight:'70%', overflowY:'auto',
      borderRadius:'10px 10px 0 0',
      animation:'panelUp .24s ease-out',
      boxShadow:'0 -12px 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        background:'linear-gradient(180deg,#3a2818,#281808)',
        padding:'10px 14px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        borderBottom:'2px solid rgba(140,100,50,0.4)',
        position:'sticky', top:0, zIndex:5,
        borderRadius:'8px 8px 0 0',
      }}>
        <span style={{fontFamily:'Press Start 2P',fontSize:8,color:'#d4a860'}}>RANGER LOG</span>
        <button onClick={onClose} style={{
          backgroundImage:"url('/assets/button.png')",
          backgroundSize:'100% 100%',
          imageRendering:'pixelated',
          width:24, height:24,
          border:'none', cursor:'pointer',
          fontFamily:'Press Start 2P', fontSize:8, color:'#5a3010',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>X</button>
      </div>
      <div style={{padding:13}}>
        {[...entries].reverse().map((e,i)=>(
          <div key={i} style={{
            borderLeft:'3px solid #a88020',
            padding:'5px 9px',
            fontFamily:'VT323', fontSize:15,
            color:'#382008', marginBottom:5,
            lineHeight:1.35,
          }}>
            <span style={{fontFamily:'Press Start 2P',fontSize:6,color:'#987018',marginRight:7}}>DAY {e.day}</span>
            {e.text}
          </div>
        ))}
      </div>
    </div>
  );
}
Object.assign(window,{LogPanel});
