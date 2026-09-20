// Lakeside Outdoors Services — vanilla JS, no dependencies
(function(){
  "use strict";
  // === FORM CONFIG: paste your Formspree form ID here to go live (setup steps in README) ===
  // Get it free: formspree.io → New Form → copy the endpoint ID, e.g. "mabcdwyz"
  var FORMSPREE_ID = ""; // <-- paste ID between the quotes
  var CONTACT_EMAIL = "hello@lakesideoutdoorswatertown.com";
  var header = document.getElementById('siteHeader');
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion: never autoplay the hero video (static poster instead)
  var hv = document.querySelector('.hero-video');
  if (hv && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    hv.pause(); hv.removeAttribute('autoplay'); hv.style.display = 'none';
  }

  // Mobile nav
  if (toggle && nav) {
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); });
    });
  }

  // Active nav highlight on scroll (cached offsets + rAF throttle)
  var links = nav ? Array.prototype.slice.call(nav.querySelectorAll('a')) : [];
  var sections = links.map(function(a){ return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  var tops = [];
  function cacheTops(){ tops = sections.map(function(s){ return s.offsetTop; }); }
  cacheTops();
  window.addEventListener('resize', cacheTops);
  window.addEventListener('load', cacheTops);
  var ticking = false;
  function onScroll(){
    if (ticking) return; ticking = true;
    window.requestAnimationFrame(function(){
      var y = window.scrollY + 120, current = null;
      sections.forEach(function(s, i){ if (tops[i] <= y) current = '#' + s.id; });
      links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === current); });
      // Compact header + subtle hero parallax
      var sy = window.scrollY;
      if (header) header.classList.toggle('scrolled', sy > 24);
      var cue = document.querySelector('.scroll-cue');
      if (cue) cue.classList.toggle('hide', sy > 80);
      if (!REDUCED) {
        var hero = document.querySelector('.hero');
        if (hero && sy < hero.offsetHeight) {
          var sh = document.querySelector('.hero-slideshow');
          if (sh) sh.style.transform = 'translateY(' + (sy * 0.18) + 'px)';
        }
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Before/After slider
  var range = document.getElementById('baRange');
  var after = document.getElementById('baAfter');
  var handle = document.getElementById('baHandle');
  var slider = document.getElementById('baSlider');
  function setBA(v){
    v = Math.max(0, Math.min(100, Number(v)));
    if (after) after.style.width = v + '%';
    if (handle) handle.style.left = v + '%';
    if (slider) slider.setAttribute('aria-valuenow', String(v));
  }
  if (range) { range.addEventListener('input', function(){ setBA(range.value); }); setBA(50);
    slider.addEventListener('keydown', function(e){
      var v = Number(range.value);
      if (e.key === 'ArrowLeft'){ range.value = v - 4; setBA(range.value); e.preventDefault(); }
      if (e.key === 'ArrowRight'){ range.value = v + 4; setBA(range.value); e.preventDefault(); }
    });
  }

  // Service pre-fill: clicking "Get price" sets select in contact form
  document.querySelectorAll('.quote-link').forEach(function(link){
    link.addEventListener('click', function(){
      var svc = link.getAttribute('data-service');
      var sel = document.getElementById('f-service');
      if (svc && sel) {
        Array.prototype.forEach.call(sel.options, function(o){ if (o.text.replace(/\s+/g,' ').trim() === svc) sel.value = o.text; });
        // fallback: try matching select by value text
        if (!sel.value) {
          Array.prototype.forEach.call(sel.options, function(o){ if (o.text.indexOf(svc.split(' ')[0]) > -1 && !sel.value) sel.value = o.value || o.text; });
        }
        // direct set if option exists
        for (var i=0;i<sel.options.length;i++){ if (sel.options[i].text === svc){ sel.selectedIndex = i; break; } }
      }
    });
  });

  // Forms: Formspree AJAX when configured, mailto fallback otherwise
  function phoneValid(p){ return (p.replace(/\D/g,'').length >= 7); }
  function handleForm(formId, msgId){
    var form = document.getElementById(formId);
    if (!form) return;
    var msg = document.getElementById(msgId);
    var btn = form.querySelector('button[type="submit"]');
    var btnLabel = btn ? btn.innerHTML : '';
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var data = new FormData(form);
      // Honeypot: silently drop bot submissions
      if ((data.get('_gotcha') || '').toString().trim() !== '') return;
      var name = (data.get('name')||'').toString().trim();
      var phone = (data.get('phone')||'').toString().trim();
      var service = (data.get('service')||'').toString();
      var bad = null;
      if (!name) bad = form.querySelector('[name="name"]');
      else if (!phoneValid(phone)) bad = form.querySelector('[name="phone"]');
      else if (formId==='heroQuoteForm' && !service) bad = form.querySelector('[name="service"]');
      if (bad) {
        if (msg){ msg.textContent = 'Please add your name, valid phone, and service.'; msg.className='form-msg err'; }
        if (bad.focus) bad.focus();
        return;
      }
      var payload = { name: name, phone: phone, service: service || 'Not specified' };
      if (data.get('email')) payload.email = data.get('email').toString().trim();
      if (data.get('zip')) payload.zip = data.get('zip').toString().trim();
      if (data.get('message')) payload.message = data.get('message').toString().trim();
      if (data.get('contactMethod')) payload.contactMethod = data.get('contactMethod').toString();
      payload._subject = 'Free Quote Request — ' + name + ' (' + payload.service + ')';

      function done(ok, text){
        if (msg){ msg.textContent = text; msg.className = 'form-msg ' + (ok ? 'ok' : 'err'); }
        if (btn){ btn.disabled = false; btn.innerHTML = btnLabel; }
      }
      function mailtoFallback(){
        var body = encodeURIComponent('Name: '+name+'\nPhone: '+phone+'\nService: '+payload.service+'\n'+
          (payload.email ? 'Email: '+payload.email+'\n':'') +
          (payload.zip ? 'ZIP: '+payload.zip+'\n':'') +
          (payload.message ? 'Details: '+payload.message+'\n':'') +
          (payload.contactMethod ? 'Contact via: '+payload.contactMethod+'\n':'') +
          '\nSent from lakesideoutdoorswatertown.com');
        window.location.href = 'mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent(payload._subject)+'&body='+body;
      }

      // Not configured yet → mailto behavior
      if (!FORMSPREE_ID) {
        done(true, 'Thanks '+name.split(' ')[0]+'! Opening your email app — or just call (315) 555-0199 for fastest reply.');
        form.reset();
        setTimeout(mailtoFallback, 600);
        return;
      }
      // Live: send to Formspree
      if (btn){ btn.disabled = true; btn.innerHTML = 'Sending…'; }
      if (msg){ msg.textContent = ''; msg.className = 'form-msg'; }
      fetch('https://formspree.io/f/' + FORMSPREE_ID, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(payload)
      }).then(function(res){
        if (res.ok) {
          form.reset();
          done(true, 'Thanks '+name.split(' ')[0]+'! Request received — we reply within 2 business hours. Urgent? Call (315) 555-0199.');
        } else {
          done(false, 'Could not send just now — please call (315) 555-0199 (8am–6pm).');
        }
      }).catch(function(){
        done(false, 'Network issue — please call (315) 555-0199 or try again.');
      });
    });
  }
  handleForm('heroQuoteForm','heroFormMsg');
  handleForm('quoteForm','mainFormMsg');

  // Scroll reveal: JS only adds classes, so no-JS stays fully visible
  (function(){
    if (REDUCED || !('IntersectionObserver' in window)) return;
    var targets = document.querySelectorAll('.services-grid > *, .steps > *, .plans > *, .reviews-grid > *, .equip-grid > *, .ba-stats > *, .gal-grid > *');
    targets.forEach(function(el){
      el.classList.add('reveal');
      var sibs = el.parentElement ? el.parentElement.children : [];
      var idx = Array.prototype.indexOf.call(sibs, el);
      if (sibs.length > 1) el.style.transitionDelay = ((idx % 4) * 70) + 'ms';
    });
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {threshold: 0.12});
    targets.forEach(function(el){ io.observe(el); });
  })();

  // Animated trust counters (existing claims only, no invented stats)
  (function(){
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    function run(el){
      var target = parseFloat(el.getAttribute('data-count'));
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      if (REDUCED || !('requestAnimationFrame' in window)) { el.textContent = target.toFixed(dec); return; }
      var t0 = null;
      function step(t){
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / 1200);
        el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(dec);
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io2 = new IntersectionObserver(function(es){
      es.forEach(function(en){ if (en.isIntersecting) { run(en.target); io2.unobserve(en.target); } });
    }, {threshold: 0.4});
    nums.forEach(function(el){ io2.observe(el); });
  })();

  // Gallery lightbox
  (function(){
    var dlg = document.getElementById('lightbox');
    if (!dlg || !dlg.showModal) return;
    var img = document.getElementById('lbImg');
    var cap = document.getElementById('lbCap');
    var items = Array.prototype.slice.call(document.querySelectorAll('.gal-open'));
    var idx = 0;
    function show(i){
      idx = (i + items.length) % items.length;
      img.src = items[idx].getAttribute('data-full');
      var thumb = items[idx].querySelector('img');
      img.alt = thumb ? thumb.alt : 'Enlarged gallery photo';
      cap.textContent = items[idx].getAttribute('data-cap') || '';
      if (!dlg.open) dlg.showModal();
    }
    items.forEach(function(b, i){ b.addEventListener('click', function(){ show(i); }); });
    document.getElementById('lbPrev').addEventListener('click', function(e){ e.stopPropagation(); show(idx - 1); });
    document.getElementById('lbNext').addEventListener('click', function(e){ e.stopPropagation(); show(idx + 1); });
    document.getElementById('lbClose').addEventListener('click', function(){ dlg.close(); });
    dlg.addEventListener('click', function(e){ if (e.target === dlg) dlg.close(); });
  })();

  // Muse pointer: ambient glow + trailing ring + sparkles (fine pointers only)
  (function(){
    if (REDUCED || !window.matchMedia('(pointer: fine)').matches) return;
    var glow = document.createElement('div'); glow.className = 'muse-glow'; glow.setAttribute('aria-hidden', 'true');
    var ring = document.createElement('div'); ring.className = 'muse-ring'; ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow); document.body.appendChild(ring);
    var mx = 0, my = 0, rx = 0, ry = 0, shown = false, lastSpark = 0;
    function spark(x, y){
      var s = document.createElement('div'); s.className = 'muse-spark'; s.setAttribute('aria-hidden', 'true');
      s.style.left = x + 'px'; s.style.top = y + 'px';
      document.body.appendChild(s);
      setTimeout(function(){ s.remove(); }, 850);
    }
    document.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; rx = mx; ry = my; glow.style.opacity = '1'; ring.style.opacity = '1'; }
      glow.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      var t = e.target;
      ring.classList.toggle('hot', !!(t && t.closest && t.closest('a,button,.gal-open,input,select,textarea,summary')));
      var now = performance.now();
      if (now - lastSpark > 90) { lastSpark = now; spark(mx, my); }
    }, {passive: true});
    document.addEventListener('mouseleave', function(){ shown = false; glow.style.opacity = '0'; ring.style.opacity = '0'; });
    (function loop(){
      if (shown) {
        rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      }
      requestAnimationFrame(loop);
    })();
  })();

  // Hero tilt: barely-there cursor parallax (±4px max, fine pointers only)
  (function(){
    if (REDUCED || !window.matchMedia('(pointer: fine)').matches) return;
    var heroEl = document.querySelector('.hero');
    var grid = document.querySelector('.hero-grid');
    if (!heroEl || !grid) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function apply(){
      raf = 0;
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      grid.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(apply);
    }
    heroEl.addEventListener('mousemove', function(e){
      var r = heroEl.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 8;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 8;
      if (!raf) raf = requestAnimationFrame(apply);
    }, {passive: true});
    heroEl.addEventListener('mouseleave', function(){ tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); });
  })();
})();
