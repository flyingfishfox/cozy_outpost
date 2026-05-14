// SpriteCanvas.jsx
const { useEffect, useRef } = React;

const SCENE_ASP   = 576/324;
const FRAME_W     = 32;
const FRAME_H     = 29;
const FRAME_Y_OFF = 3;
const WALK_COLS   = 4;
const IDLE_COLS   = 2;
const WALK_SPEED  = 10;   // ticks per walk frame — slower animation
const MOVE_SPEED  = 0.0018; // player movement — cozy pace
const ROW_FRONT   = 0;
const ROW_BACK    = 1;
const ROW_RIGHT   = 2;
const ROW_LEFT    = 3;

// Dogs-Remastered-03 (512x432) — all face LEFT, flip for right
const D03_ROW_Y  = [18,  68, 124, 160, 208, 254, 322];
const D03_ROW_H  = [30,  28,  21,  32,  32,  34,  14];
const D03_COL_X  = [8,   72, 136, 200, 264, 328, 392, 456];
const D03_COL_W  = [50,  53,  53,  53,  45,  50,  50,  45];
const D03_FRAMES = [
  [0,1,2,3,4,5],       // 0 wag/idle
  [0,1,2,3,4,5],       // 1 sit
  [0,1,2,3,4,5],       // 2 lay
  [0,1,2,3,4,5,6,7],   // 3 run
  [0,1,2,3,4,5,6,7],   // 4 walk
  [0,1,2,3,4,5],       // 5 beg
  [0,1,2,3],           // 6 sleep
];
const SCOUT_WAG   = 0;
const SCOUT_SIT   = 1;
const SCOUT_LAY   = 2;
const SCOUT_RUN   = 3;
const SCOUT_WALK  = 4;
const SCOUT_BEG   = 5;
const SCOUT_SLEEP = 6;

// Dogs-Remastered-02 row 6 = bark
const BARK_Y     = 304;
const BARK_H     = 44;
const BARK_COL_X = [8,  72, 136, 200, 264, 328, 392, 454];
const BARK_COL_W = [50, 55,  53,  53,  51,  50,  50,  53];

// Zombie sheets
// zombie1: 288x128 → 9 frames of 32px, 4 rows — skip last frame (f8)
// zombie2: 256x128 → 8 frames of 32px, 4 rows — skip last frame (f7)
// rows: 0=front 1=back 2=right 3=left
const Z_FW=32, Z_FH=32;
const Z1_FRAMES=8; // use frames 0-7, skip f8
const Z2_FRAMES=7; // use frames 0-6, skip f7
const Z_ROW_RIGHT=2, Z_ROW_LEFT=3;

const HOME_EXIT_RIGHT   = 0.895;
const HOME_EXIT_LEFT    = 0.04;
const OUTPOST_EXIT_LEFT = 0.04;
const FOREST_EXIT_RIGHT = 0.92;
const ZOMBIE_PROXIMITY  = 0.18;

function getSceneRect(W,H){
  let sw,sh;
  if(W/H>SCENE_ASP){sh=H;sw=sh*SCENE_ASP;}else{sw=W;sh=sw/SCENE_ASP;}
  return{ox:Math.floor((W-sw)/2),oy:Math.floor((H-sh)/2),sw,sh};
}

function SceneLayer({assets,scene,onSceneChange,playerAction,scoutCmd,scoutFetch,setNearZombie,zombiesLeft,watching,keysDown,killZombie,onZombieKilled,day,weather,keysDownRef:externalKeysDownRef}){
  const cvRef        = useRef(null);
  const sceneRef     = useRef(scene);
  const stateRef     = useRef({
    playerX:0.42, playerRow:ROW_FRONT,
    playerMoving:false, walkTick:0, walkFrame:0,
    actionTick:0, actionFrame:0,
    // Scout home
    scoutX:0.30, scoutDir:1,
    scoutMoving:false, scoutInitialized:false,
    scoutRow:SCOUT_WAG, scoutFrameIdx:0, scoutTick:0,
    scoutPrevCmd:'idle',
    // Fetch state
    fetchPhase:0, // 0=idle 1=runaway 2=runback
    fetchTargetX:0,
    // Bark (outpost)
    barkFrameIdx:0, barkTick:0,
    // Pig
    pigFrame:0, pigTick:0,
    // Cat
    catFrame:0, catTick:0, catJumping:false, catJumpTimer:0,
    // Zombies
    zombies:[], zombieInitKey:-1, zombieDay:-1, zombieDayTarget:0,
    // Birds
    birdX:110,birdFrame:0,birdY:0.15,
    bird2X:148,bird2Frame:0,bird2Y:0.10,
    // Clouds
    cloud1X:0.05,cloud2X:0.45,cloud3X:0.75,
    fcloud1X:0.10,fcloud2X:0.50,fcloud3X:0.78,
    tick:0, images:{},
  });
  const keysRef        = useRef({});
  const keysDownRef    = useRef(keysDown);
  const animRef        = useRef(null);
  const actionRef      = useRef('idle');
  const scoutCmdRef    = useRef('idle');
  const scoutFetchRef  = useRef(false);
  const zombiesLeftRef = useRef(zombiesLeft);
  const watchingRef    = useRef(watching);
  const killZombieRef  = useRef(false); // set to true by parent to trigger nearest kill

  useEffect(()=>{ sceneRef.current=scene;
    const s=stateRef.current;
    s.scoutX=s.playerX-0.14;
    s.scoutMoving=false;
    s.fetchPhase=0;
    killZombieRef.current=false; // clear any pending kill on scene change
  },[scene]);
  useEffect(()=>{ actionRef.current=playerAction; },[playerAction]);
  useEffect(()=>{ scoutCmdRef.current=scoutCmd; },[scoutCmd]);
  useEffect(()=>{ scoutFetchRef.current=scoutFetch; },[scoutFetch]);
  useEffect(()=>{ zombiesLeftRef.current=zombiesLeft; },[zombiesLeft]);
  useEffect(()=>{ watchingRef.current=watching; },[watching]);
  const weatherRef     = useRef(weather);
  useEffect(()=>{ weatherRef.current=weather; },[weather]);
  useEffect(()=>{ if(killZombie>0){ killZombieRef.current=true; } },[killZombie]);
  useEffect(()=>{ stateRef.current.zombieDayTarget=day; },[day]);

  useEffect(()=>{
    const s=stateRef.current;
    Object.entries(assets).forEach(([key,src])=>{
      const img=new Image(); img.src=src; s.images[key]=img;
    });
  },[]);

  useEffect(()=>{
    const dn=e=>{keysRef.current[e.key]=true;};
    const up=e=>{keysRef.current[e.key]=false;};
    window.addEventListener('keydown',dn);
    window.addEventListener('keyup',up);
    return()=>{window.removeEventListener('keydown',dn);window.removeEventListener('keyup',up);};
  },[]);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const dpr=window.devicePixelRatio||1;
    function resize(){cv.width=cv.offsetWidth*dpr;cv.height=cv.offsetHeight*dpr;}
    resize();
    window.addEventListener('resize',resize);

    function loop(){
      const cv2=cvRef.current; if(!cv2)return;
      const s=stateRef.current;
      const keys=keysRef.current;
      s.tick++;

      const cur=sceneRef.current;
      const isWatching=watchingRef.current;
      const pImgWalk =s.images['walk'];
      const pImgIdle =s.images['idle'];
      const pImgStab =s.images['stab'];
      const pImgShoot=s.images['shoot'];
      const bim      =s.images['bird'];
      const scout03  =s.images['scout'];
      const scout02  =s.images['scout02'];

      let bg;
      if(cur==='home')    bg=s.images['scene'];
      if(cur==='outpost') bg=s.images['outpost'];
      if(cur==='forest')  bg=s.images['forest'];

      const ctx=cv2.getContext('2d');
      const W=cv2.width/dpr, H=cv2.height/dpr;
      const{ox,oy,sw,sh}=getSceneRect(W,H);
      const groundY=oy+sh*0.872;

      const isMobile = 'ontouchstart' in window;
      const isPortrait = isMobile && window.innerHeight > window.innerWidth;
      const ZOOM = isPortrait ? 1.4 : 1.0;

      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);

      if(ZOOM > 1){
        if(s.camX===undefined) s.camX = s.playerX;
        // Very slow lerp — barely moves, no dizziness
        s.camX += (s.playerX - s.camX) * 0.03;
        const playerScreenX = ox + s.camX * sw;
        const tx = W/2 - playerScreenX * ZOOM;
        const ty = (H/2 - groundY * ZOOM) * 0.5;
        ctx.save();
        ctx.setTransform(dpr*ZOOM, 0, 0, dpr*ZOOM, tx*dpr, ty*dpr);
      }

      ctx.fillStyle='#29ABD9'; ctx.fillRect(0,0,W,H);
      // Background with smoothing for clean scaling
      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality='high';
      if(bg&&bg.complete&&bg.naturalWidth) ctx.drawImage(bg,ox,oy,sw,sh);
      // All sprites pixelated from here
      ctx.imageSmoothingEnabled=false;

      // ── Clouds ────────────────────────────────────────────────────────
      const isOvercast = weatherRef.current==='overcast';
      if(cur==='forest'){
        const fc1=s.images['cloud4'],fc2=s.images['cloud5'],fc3=s.images['cloud6'];
        s.fcloud1X+=0.00010;s.fcloud2X+=0.00014;s.fcloud3X+=0.00007;
        if(s.fcloud1X>1.15)s.fcloud1X=-0.35;
        if(s.fcloud2X>1.15)s.fcloud2X=-0.35;
        if(s.fcloud3X>1.15)s.fcloud3X=-0.35;
        const fAlpha=isOvercast?1.0:1.0;
        const fScale=isOvercast?1.4:1.0;
        [[fc1,s.fcloud1X,0.26*fScale,0.05,0.90],[fc2,s.fcloud2X,0.18*fScale,0.03,0.75],[fc3,s.fcloud3X,0.22*fScale,0.08,0.60]].forEach(([c,cx,sc,yoff,alpha])=>{
          if(c&&c.complete&&c.naturalWidth){const cw=sw*sc,ch=cw*(c.naturalHeight/c.naturalWidth);ctx.globalAlpha=alpha;ctx.drawImage(c,ox+cx*sw,oy+sh*yoff,cw,ch);ctx.globalAlpha=1;}
        });
        if(isOvercast){
          [[fc1,s.fcloud1X-0.55,0.30,0.12,0.70],[fc2,s.fcloud2X+0.35,0.24,0.01,0.65],[fc3,s.fcloud3X-0.30,0.20,0.15,0.55]].forEach(([c,cx,sc,yoff,alpha])=>{
            if(c&&c.complete&&c.naturalWidth){const cw=sw*sc,ch=cw*(c.naturalHeight/c.naturalWidth);ctx.globalAlpha=alpha;ctx.drawImage(c,ox+cx*sw,oy+sh*yoff,cw,ch);ctx.globalAlpha=1;}
          });
        }
      } else {
        const c1=s.images['cloud1'],c2=s.images['cloud2'],c3=s.images['cloud3'];
        s.cloud1X+=0.00012;s.cloud2X+=0.00008;s.cloud3X+=0.00015;
        if(s.cloud1X>1.15)s.cloud1X=-0.35;
        if(s.cloud2X>1.15)s.cloud2X=-0.35;
        if(s.cloud3X>1.15)s.cloud3X=-0.35;
        const sc=isOvercast?1.5:1.0;
        [[c1,s.cloud1X,0.28*sc,0.04,0.88],[c2,s.cloud2X,0.20*sc,0.09,0.72],[c3,s.cloud3X,0.16*sc,0.02,0.58]].forEach(([c,cx,scl,yoff,alpha])=>{
          if(c&&c.complete&&c.naturalWidth){const cw=sw*scl,ch=cw*(c.naturalHeight/c.naturalWidth);ctx.globalAlpha=isOvercast?Math.min(alpha+0.15,1):alpha;ctx.drawImage(c,ox+cx*sw,oy+sh*yoff,cw,ch);ctx.globalAlpha=1;}
        });
        if(isOvercast){
          [[c1,s.cloud1X-0.55,0.32,0.13,0.65],[c2,s.cloud2X+0.40,0.26,0.01,0.70],[c3,s.cloud3X-0.28,0.22,0.16,0.60]].forEach(([c,cx,scl,yoff,alpha])=>{
            if(c&&c.complete&&c.naturalWidth){const cw=sw*scl,ch=cw*(c.naturalHeight/c.naturalWidth);ctx.globalAlpha=alpha;ctx.drawImage(c,ox+cx*sw,oy+sh*yoff,cw,ch);ctx.globalAlpha=1;}
          });
        }
      }

      // ── Player input ──────────────────────────────────────────────────
      const scoutBusy = scoutCmdRef.current==='sit'||scoutCmdRef.current==='beg'||stateRef.current.fetchPhase>0;
      const goLeft  = !scoutBusy && (keys['ArrowLeft'] ||keys['a']||(externalKeysDownRef?.current?.left)||keysDownRef.current.left);
      const goRight = !scoutBusy && (keys['ArrowRight']||keys['d']||(externalKeysDownRef?.current?.right)||keysDownRef.current.right);

      if(isWatching){
        s.playerMoving=false; s.playerRow=ROW_BACK;
        s.walkFrame=0; s.walkTick=0;
      } else {
        if(goLeft){s.playerX-=MOVE_SPEED;s.playerRow=ROW_LEFT;s.playerMoving=true;}
        else if(goRight){s.playerX+=MOVE_SPEED;s.playerRow=ROW_RIGHT;s.playerMoving=true;}
        else{s.playerMoving=false;s.walkFrame=0;s.walkTick=0;}
      }
      if(s.playerMoving){s.walkTick++;if(s.walkTick>=WALK_SPEED){s.walkTick=0;s.walkFrame=(s.walkFrame+1)%WALK_COLS;}}

      // ── Scene transitions ─────────────────────────────────────────────
      if(cur==='home'){
        if(s.playerX>HOME_EXIT_RIGHT){onSceneChange('outpost');s.playerX=0.06;s.playerRow=ROW_RIGHT;}
        else if(s.playerX<HOME_EXIT_LEFT){onSceneChange('forest');s.playerX=FOREST_EXIT_RIGHT-0.04;s.playerRow=ROW_LEFT;}
        else{s.playerX=Math.max(0.04,Math.min(0.92,s.playerX));}
      } else if(cur==='outpost'){
        if(s.playerX<OUTPOST_EXIT_LEFT){onSceneChange('home');s.playerX=0.85;s.playerRow=ROW_LEFT;}
        else{s.playerX=Math.min(0.92,s.playerX);}
      } else if(cur==='forest'){
        if(s.playerX>FOREST_EXIT_RIGHT){onSceneChange('home');s.playerX=0.06;s.playerRow=ROW_RIGHT;}
        else{s.playerX=Math.max(0.04,s.playerX);}
      }

      // ── drawPlayer ────────────────────────────────────────────────────
      function drawPlayer(){
        const action=actionRef.current;
        let pImg=pImgIdle, pCols=IDLE_COLS;
        if(action==='stab'&&pImgStab){pImg=pImgStab;pCols=WALK_COLS;}
        else if(action==='shoot'&&pImgShoot){pImg=pImgShoot;pCols=WALK_COLS;}
        else if(s.playerMoving&&pImgWalk){pImg=pImgWalk;pCols=WALK_COLS;}
        if(!pImg||!pImg.complete||!pImg.naturalWidth)return;
        s.actionTick++;
        if(action!=='idle'&&s.actionTick>=8){s.actionTick=0;s.actionFrame=(s.actionFrame+1)%pCols;}
        if(action==='idle'){s.actionFrame=0;s.actionTick=0;}
        const col=action!=='idle'?s.actionFrame:(s.playerMoving?s.walkFrame:0);
        const srcX=col*FRAME_W;
        const srcY=s.playerRow*32+FRAME_Y_OFF;
        if(srcX+FRAME_W>pCols*FRAME_W)return;
        const px=Math.max(ox+sw*0.04,Math.min(ox+sw*0.92,ox+s.playerX*sw));
        const ph=sh*0.19,pw=ph;
        ctx.drawImage(pImg,srcX,srcY,FRAME_W,FRAME_H,Math.round(px-pw/2),Math.round(groundY-ph*0.94),Math.round(pw),Math.round(ph));
      }

      // ── drawScout03 — fixed render width so all poses stay same size ──
      // Sprite faces LEFT — flip when facingRight=true
      function drawScout03(xFrac, row, facingRight){
        if(!scout03||!scout03.complete||!scout03.naturalWidth)return;
        row=Math.max(0,Math.min(6,row));
        if(s.scoutRow!==row){s.scoutRow=row;s.scoutFrameIdx=0;s.scoutTick=0;}
        const validCols=D03_FRAMES[row];
        s.scoutTick++;
        if(s.scoutTick>=12){s.scoutTick=0;s.scoutFrameIdx=(s.scoutFrameIdx+1)%validCols.length;}
        const ci=validCols[s.scoutFrameIdx];
        const sx=D03_COL_X[ci],sy=D03_ROW_Y[row];
        const fw=D03_COL_W[ci],fh=D03_ROW_H[row];
        // Use constant reference width (col 0 = 50px) so size never wobbles between frames
        const REF_W=50;
        const dw=sw*0.09;
        const dh=dw*(fh/REF_W); // height scaled from reference, not per-frame width
        const px=Math.max(ox+sw*0.04,Math.min(ox+sw*0.90,ox+xFrac*sw));
        const py=Math.round(groundY-dh*0.95);
        if(facingRight){
          ctx.save();
          ctx.translate(Math.round(px+dw/2),py);
          ctx.scale(-1,1);
          ctx.drawImage(scout03,sx,sy,fw,fh,-Math.round(dw/2),0,Math.round(dw),Math.round(dh));
          ctx.restore();
        } else {
          ctx.drawImage(scout03,sx,sy,fw,fh,Math.round(px-dw/2),py,Math.round(dw),Math.round(dh));
        }
      }

      // ── drawScoutBark — dog02 row6, facing right ─────────────────────
      function drawScoutBark(){
        if(!scout02||!scout02.complete||!scout02.naturalWidth)return;
        s.barkTick++;
        if(s.barkTick>=10){s.barkTick=0;s.barkFrameIdx=(s.barkFrameIdx+1)%8;}
        const sx=BARK_COL_X[s.barkFrameIdx],sy=BARK_Y;
        const fw=BARK_COL_W[s.barkFrameIdx],fh=BARK_H;
        const REF_W=50;
        const dw=sw*0.09, dh=dw*(fh/REF_W);
        const px=ox+sw*0.07;
        const py=Math.round(groundY-dh*0.95);
        ctx.save();
        ctx.translate(Math.round(px+dw/2),py);
        ctx.scale(-1,1);
        ctx.drawImage(scout02,sx,sy,fw,fh,-Math.round(dw/2),0,Math.round(dw),Math.round(dh));
        ctx.restore();
      }

      // ── drawZombie ────────────────────────────────────────────────────
      function drawZombie(z){
        if(z.dead) return; // already removed

        if(z.dying){
          // Play zombie2 death animation once then mark gone
          const dimg=s.images['zombie2'];
          if(!dimg||!dimg.complete||!dimg.naturalWidth) return;
          z.tick++;
          if(z.tick>=8){ z.tick=0; z.frame++; }
          if(z.frame>=Z2_FRAMES){ z.dead=true; return; }
          const row=z.dir>0?Z_ROW_RIGHT:Z_ROW_LEFT;
          const dh=sh*0.18, dw=dh*(Z_FW/Z_FH);
          ctx.drawImage(dimg,z.frame*Z_FW,row*Z_FH,Z_FW,Z_FH,
            Math.round(ox+sw*z.x-dw/2),Math.round(groundY-dh*0.95),
            Math.round(dw),Math.round(dh));
          return;
        }

        // Normal walk — zombie1 only, slow shamble
        const wimg=s.images['zombie1'];
        if(!wimg||!wimg.complete||!wimg.naturalWidth)return;
        z.tick++;if(z.tick>=40){z.tick=0;z.frame=(z.frame+1)%Z1_FRAMES;}
        z.x+=z.dir*0.00008;
        if(z.x>0.85)z.dir=-1;
        if(z.x<0.10)z.dir=1;
        const row=z.dir>0?Z_ROW_RIGHT:Z_ROW_LEFT;
        const dh=sh*0.18, dw=dh*(Z_FW/Z_FH);
        ctx.drawImage(wimg,z.frame*Z_FW,row*Z_FH,Z_FW,Z_FH,
          Math.round(ox+sw*z.x-dw/2),Math.round(groundY-dh*0.95),
          Math.round(dw),Math.round(dh));
      }

      function drawAnimal(key,xFrac,hFrac,tickSpeed,fKey,tKey){
        const img=s.images[key];
        if(!img||!img.complete||!img.naturalWidth)return;
        const totalF=Math.max(1,Math.floor(img.naturalWidth/img.naturalHeight));
        s[tKey]++;if(s[tKey]>=tickSpeed){s[tKey]=0;s[fKey]=(s[fKey]+1)%totalF;}
        const dh=sh*hFrac,dfw=img.naturalWidth/totalF,dw=dh*(dfw/img.naturalHeight);
        ctx.drawImage(img,s[fKey]*dfw,0,dfw,img.naturalHeight,Math.round(ox+sw*xFrac-dw/2),Math.round(groundY-dh*0.95),Math.round(dw),Math.round(dh));
      }

      // ── HOME scene ────────────────────────────────────────────────────
      if(cur==='home'){
        const cmd=scoutCmdRef.current;
        const isFetching=s.fetchPhase>0;
        const isScoutCmd = cmd==='sit'||cmd==='beg'||isFetching;

        // Freeze player during sit, beg, fetch only
        if(isScoutCmd){
          s.playerMoving=false;
          s.walkFrame=0; s.walkTick=0;
        }

        // ── Fetch — triggered once, runs one pass right and back ──────
        if(scoutFetchRef.current && s.fetchPhase===0){
          s.fetchPhase=1;
          s.scoutDir=1;
          scoutFetchRef.current=false; // clear trigger immediately — prevents loop
        }
        if(s.fetchPhase===1){
          // Trot right to far edge
          s.scoutX+=0.005;
          s.scoutDir=1;
          s.scoutMoving=true;
          if(s.scoutX>=0.88) s.fetchPhase=2;
        } else if(s.fetchPhase===2){
          // Return left back to player
          const targetX=s.playerX-0.14;
          const diff=targetX-s.scoutX;
          s.scoutX+=diff*0.025;
          s.scoutDir=-1;
          s.scoutMoving=true;
          if(Math.abs(diff)<0.015){
            s.scoutX=targetX;
            s.fetchPhase=0;
            s.scoutMoving=false;
          }
        } else if(cmd==='sleep'){
          s.scoutMoving=false;
        } else {
          // Normal follow
          const targetX=s.playerX-0.14;
          const diff=targetX-s.scoutX;
          if(Math.abs(diff)>0.008){
            s.scoutX+=diff*0.018;
            s.scoutMoving=Math.abs(diff)>0.025;
            s.scoutDir=diff>0?1:-1;
          } else {
            s.scoutMoving=false;
          }
        }
        s.scoutX=Math.max(0.04,Math.min(0.92,s.scoutX));

        let row=SCOUT_WAG;
        if(isFetching)         row=SCOUT_RUN;
        else if(cmd==='sleep') row=SCOUT_SLEEP;
        else if(cmd==='sit')   row=SCOUT_SIT;
        else if(cmd==='beg')   row=SCOUT_BEG;
        else if(s.scoutMoving) row=SCOUT_WALK;
        else                   row=SCOUT_WAG;

        const facingRight=s.scoutDir>0;
        drawScout03(s.scoutX, row, facingRight);
        drawPlayer();

      // ── OUTPOST scene ─────────────────────────────────────────────────
      } else if(cur==='outpost'){
        const zCount=zombiesLeftRef.current;

        // Only reinit zombies when day changes (zombieInitKey tracks day via zCount at day start)
        // Use s.zombieDay to track which day we initialized for
        if(s.zombieDay!==s.zombieDayTarget){
          s.zombieDay=s.zombieDayTarget;
          if(zCount>0){
            s.zombies=Array.from({length:zCount},(_,i)=>({
              x:0.22+i*(0.55/Math.max(zCount,1))+Math.random()*0.04,
              dir:Math.random()<0.5?1:-1,
              frame:Math.floor(Math.random()*4),
              tick:Math.floor(Math.random()*40),
              dying:false, dead:false,
            }));
          } else {
            s.zombies=[];
          }
        }

        // Proximity — stab needs very close, shoot needs same horizontal line (loose Y doesn't matter, just X)
        const STAB_RANGE=0.10;
        const SHOOT_RANGE=0.35;
        const action=actionRef.current;
        const effectiveRange=action==='stab'?STAB_RANGE:SHOOT_RANGE;
        const aliveZombies=s.zombies.filter(z=>!z.dead&&!z.dying);
        const near=aliveZombies.some(z=>Math.abs(s.playerX-z.x)<effectiveRange);
        setNearZombie(aliveZombies.some(z=>Math.abs(s.playerX-z.x)<SHOOT_RANGE));

        // Kill trigger
        if(killZombieRef.current){
          killZombieRef.current=false;
          const currentAction=actionRef.current;
          const range=currentAction==='stab'?STAB_RANGE:SHOOT_RANGE;
          // Find closest alive zombie within range AND in the direction player is facing
          let target=null, bestDist=Infinity;
          for(const z of s.zombies){
            if(z.dead||z.dying) continue;
            const dist=Math.abs(s.playerX-z.x);
            if(dist>=range||dist>=bestDist) continue;
            // For shoot: zombie must be in direction player is facing
            if(currentAction==='shoot'){
              const facingRight=s.playerRow===ROW_RIGHT||s.playerRow===ROW_FRONT;
              const facingLeft=s.playerRow===ROW_LEFT;
              const zombieToRight=z.x>s.playerX;
              const zombieToLeft=z.x<s.playerX;
              if(facingRight&&!zombieToRight) continue;
              if(facingLeft&&!zombieToLeft) continue;
            }
            bestDist=dist; target=z;
          }
          if(target){
            target.dying=true;
            target.frame=0;
            target.tick=0;
            onZombieKilled();
          }
        }

        // Remove fully dead zombies
        s.zombies=s.zombies.filter(z=>!z.dead);

        // Scout — just wag in place at outpost, no barking
        if(scoutCmdRef.current!=='sleep'){
          drawScout03(0.07, SCOUT_WAG, true);
        }

        s.zombies.forEach(z=>drawZombie(z));
        drawPlayer();

      // ── FOREST scene ──────────────────────────────────────────────────
      } else if(cur==='forest'){
        const isSleeping = scoutCmdRef.current==='sleep';

        // Scout follows in forest only if not sleeping
        if(!isSleeping){
          const forestTargetX = s.playerX - 0.14;
          const forestDiff = forestTargetX - s.scoutX;
          if(!isWatching){
            if(Math.abs(forestDiff)>0.008){
              s.scoutX+=forestDiff*0.018;
              s.scoutMoving=Math.abs(forestDiff)>0.025;
              s.scoutDir=forestDiff>0?1:-1;
            } else {
              s.scoutMoving=false;
            }
          } else {
            s.scoutMoving=false;
          }
          s.scoutX=Math.max(0.04,Math.min(0.88,s.scoutX));
          const forestScoutRow = isWatching ? SCOUT_LAY : (s.scoutMoving ? SCOUT_WALK : SCOUT_WAG);
          drawScout03(s.scoutX, forestScoutRow, s.scoutDir>0);
        }

        drawPlayer();
        drawAnimal('pig',0.12,0.17,22,'pigFrame','pigTick');
        // Cat — static frame 0 normally, plays full animation on jump then returns
        s.catJumpTimer++;
        if(!s.catJumping && s.catJumpTimer>=380){
          s.catJumping=true; s.catJumpTimer=0; s.catFrame=0; s.catTick=0;
        }
        const catImg=s.images['cat'];
        if(catImg&&catImg.complete&&catImg.naturalWidth){
          const totalF=Math.max(1,Math.floor(catImg.naturalWidth/catImg.naturalHeight));
          if(s.catJumping){
            s.catTick++;
            if(s.catTick>=10){
              s.catTick=0;
              s.catFrame++;
              if(s.catFrame>=totalF){
                // Finished all frames — return to static
                s.catJumping=false;
                s.catFrame=0;
              }
            }
          }
          const dh=sh*0.11,dfw=catImg.naturalWidth/totalF,dw=dh*(dfw/catImg.naturalHeight);
          ctx.drawImage(catImg,s.catFrame*dfw,0,dfw,catImg.naturalHeight,
            Math.round(ox+sw*0.82-dw/2),Math.round(groundY-dh*0.95),Math.round(dw),Math.round(dh));
        }
      }

      // ── Birds ─────────────────────────────────────────────────────────
      if(bim&&bim.complete&&bim.naturalWidth){
        const bf=Math.max(1,Math.floor(bim.naturalWidth/bim.naturalHeight));
        const bfw=bim.naturalWidth/bf;
        s.birdX-=0.18;s.birdFrame+=0.09;
        if(s.birdX<-20){s.birdX=115;s.birdY=0.08+Math.random()*0.14;}
        const bs1=sh*0.042;
        ctx.save();ctx.translate(ox+(s.birdX/100)*sw,oy+s.birdY*sh);ctx.scale(-1,1);
        ctx.drawImage(bim,(Math.floor(s.birdFrame)%bf)*bfw,0,bfw,bim.naturalHeight,-bs1,-bs1/2,bs1,bs1);
        ctx.restore();
        s.bird2X-=0.11;s.bird2Frame+=0.07;
        if(s.bird2X<-15){s.bird2X=120;s.bird2Y=0.05+Math.random()*0.17;}
        const bs2=sh*0.028;
        ctx.save();ctx.translate(ox+(s.bird2X/100)*sw,oy+s.bird2Y*sh);ctx.scale(-1,1);
        ctx.drawImage(bim,(Math.floor(s.bird2Frame)%bf)*bfw,0,bfw,bim.naturalHeight,-bs2,-bs2/2,bs2,bs2);
        ctx.restore();
      }

      // Restore transform after scene (so HUD rendered by React stays normal)
      if(ZOOM > 1) ctx.restore();
      ctx.setTransform(dpr,0,0,dpr,0,0);

      animRef.current=requestAnimationFrame(loop);
    }
    animRef.current=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(animRef.current);window.removeEventListener('resize',resize);};
  },[]);

  return <canvas ref={cvRef} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>;
}

Object.assign(window,{SceneLayer});
