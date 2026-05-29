/* HAMBURGER */
(function(){
  var btn = document.getElementById('nav-burger');
  var menu = document.getElementById('nav-mobile');
  if(!btn||!menu) return;
  btn.addEventListener('click',function(){
    var open = menu.classList.toggle('open');
    btn.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',open);
    menu.setAttribute('aria-hidden',!open);
  });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      menu.setAttribute('aria-hidden','true');
    });
  });
})();

/* CURSOR */
(function(){
  if(!window.matchMedia('(pointer:fine)').matches) return;
  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  var ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  var mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',function(e){
    mx=e.clientX; my=e.clientY;
    dot.style.left=mx+'px'; dot.style.top=my+'px';
  });
  function lerp(a,b,t){return a+(b-a)*t}
  function animate(){
    rx=lerp(rx,mx,0.12); ry=lerp(ry,my,0.12);
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    requestAnimationFrame(animate);
  }
  animate();
  document.addEventListener('mouseleave',function(){dot.style.opacity='0';ring.style.opacity='0';});
  document.addEventListener('mouseenter',function(){dot.style.opacity='1';ring.style.opacity='1';});
  document.querySelectorAll('a,button,.sim-type,.sim-opt,.sim-radio,.tarif-card,.blog-card').forEach(function(el){
    el.addEventListener('mouseenter',function(){ring.style.width='48px';ring.style.height='48px';ring.style.borderColor='rgba(168,85,247,.8)';dot.style.transform='translate(-50%,-50%) scale(0)';});
    el.addEventListener('mouseleave',function(){ring.style.width='32px';ring.style.height='32px';ring.style.borderColor='rgba(168,85,247,.5)';dot.style.transform='translate(-50%,-50%) scale(1)';});
  });
})();

/* TYPING EFFECT */
(function(){
  var el = document.getElementById('typed-word');
  if(!el) return;
  var words = ['artisans bretons.','commerçants locaux.','TPE du Finistère.','entrepreneurs bretons.'];
  var wi=0, ci=0, deleting=false, pause=0;
  function tick(){
    if(pause>0){pause--;setTimeout(tick,50);return;}
    var word = words[wi];
    if(!deleting){
      ci++;
      el.textContent = word.slice(0,ci);
      if(ci===word.length){deleting=true;pause=40;}
      setTimeout(tick, 60+Math.random()*40);
    } else {
      ci--;
      el.textContent = word.slice(0,ci);
      if(ci===0){deleting=false;wi=(wi+1)%words.length;pause=8;}
      setTimeout(tick, 35);
    }
  }
  setTimeout(tick, 1800);
})();

/* COUNTER ANIMATION */
(function(){
  var els = document.querySelectorAll('[data-count]');
  if(!els.length) return;
  var observed = false;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting && !observed){
        observed = true;
        els.forEach(function(el){
          var target = parseInt(el.dataset.count);
          var prefix = el.dataset.prefix||'';
          var suffix = el.dataset.suffix||'';
          var start = 0;
          var duration = 1200;
          var startTime = null;
          function step(ts){
            if(!startTime) startTime=ts;
            var progress = Math.min((ts-startTime)/duration,1);
            var ease = 1-Math.pow(1-progress,3);
            var val = Math.round(start+(target-start)*ease);
            el.textContent = prefix+val+suffix;
            if(progress<1) requestAnimationFrame(step);
            else el.textContent = prefix+target+suffix;
          }
          requestAnimationFrame(step);
        });
      }
    });
  },{threshold:0.5});
  els.forEach(function(el){io.observe(el);});
})();

/* ACTIVE NAV LINK */
(function(){
  var sections = document.querySelectorAll('section[id], div[id="simulateur"]');
  var links = document.querySelectorAll('.nav-links a[href^="#"]');
  if(!links.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var id = e.target.getAttribute('id');
        links.forEach(function(a){
          a.classList.toggle('nav-active', a.getAttribute('href')==='#'+id);
        });
      }
    });
  },{threshold:0.3,rootMargin:'-64px 0px -40% 0px'});
  sections.forEach(function(s){io.observe(s);});
})();

/* PRESELECTEUR SIMULATEUR DEPUIS TARIFS */
(function(){
  var MAP = {'vitrine':'vitrine','app':'app','ecommerce':'ecommerce'};
  document.querySelectorAll('.tarif-cta').forEach(function(a){
    a.addEventListener('click',function(e){
      var card = a.closest('.tarif-card');
      if(!card) return;
      var name = card.querySelector('.tarif-name');
      if(!name) return;
      var txt = name.textContent.trim().toLowerCase();
      var type = txt.indexOf('vitrine')>-1?'vitrine':txt.indexOf('app')>-1?'app':txt.indexOf('commerce')>-1?'ecommerce':null;
      if(!type) return;
      var target = document.querySelector('.sim-type[data-type="'+type+'"]');
      if(!target) return;
      setTimeout(function(){
        document.querySelectorAll('.sim-type').forEach(function(t){t.classList.remove('active');});
        target.classList.add('active');
        target.click();
      }, 100);
    });
  });
})();

/* VALIDATION */
(function(){
  var emailEl = document.getElementById('email');
  if(!emailEl) return;
  var msg = document.createElement('div');
  msg.style.cssText = 'font-size:.71rem;color:#EF4444;margin-top:4px;display:none';
  emailEl.parentNode.appendChild(msg);
  emailEl.addEventListener('blur',function(){
    var v = emailEl.value;
    if(v && (v.indexOf('@') < 1 || v.indexOf('.') < 3)){
      msg.textContent = 'Adresse email invalide';
      msg.style.display = 'block';
      emailEl.style.borderColor = '#EF4444';
    } else {
      msg.style.display = 'none';
      emailEl.style.borderColor = '';
    }
  });
  emailEl.addEventListener('input',function(){
    msg.style.display='none';
    emailEl.style.borderColor='';
  });
})();

/* SCROLL REVEAL */
(function(){
  const els = document.querySelectorAll('.reveal');
  if(!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  els.forEach(el=>io.observe(el));
})();