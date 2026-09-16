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
})();
