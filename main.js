/* ============================================================
   LP Proposta VetUnity — interações
   - Reveals on-scroll e contador final (anime.js, fallback CSS)
   - Abas-pasta acessíveis (setas/Home/End)
   - Slider de preço-âncora (total, chip, caption, comparação)
   - Spotlight glow dos dossiês (port vanilla do GlowCard)
   - Glitter WebGL de página inteira (port vanilla do
     animated-hero-with-web-gl-glitter / 21st.dev)
   ============================================================ */
(function () {
  'use strict';

  var hasAnime = typeof window.anime === 'function';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasAnime || reducedMotion) document.documentElement.classList.add('no-anime');

  var fmt = new Intl.NumberFormat('pt-BR');
  var PAGES = 7;

  /* ---------- Reveals on-scroll ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      if (hasAnime && !reducedMotion) {
        window.anime({
          targets: entry.target,
          opacity: [0, 1],
          translateY: [18, 0],
          duration: 700,
          easing: 'easeOutCubic'
        });
        // Guarda: se rAF for suprimido, nunca deixar conteúdo oculto
        setTimeout(function () {
          if (getComputedStyle(entry.target).opacity === '0') {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
          }
        }, 1500);
      } else {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- Auxiliar para atualização de contadores com múltiplas camadas ---------- */
  function updateTextLayers(name, value) {
    document.querySelectorAll('[data-counter-layer="' + name + '"]').forEach(function (element) {
      element.textContent = value;
    });
  }

  /* ---------- Contador do preço final (Seção 4) ---------- */
  function animateCounter(el) {
    var target = parseInt(el.dataset.countTo, 10);
    var layerName = el.dataset.counterLayer;
    
    if (!hasAnime || reducedMotion) { 
      if (layerName) updateTextLayers(layerName, fmt.format(target));
      else el.textContent = fmt.format(target);
      return; 
    }
    
    var state = { v: 0 };
    window.anime({
      targets: state,
      v: target,
      duration: 1600,
      easing: 'easeOutExpo',
      update: function () { 
        var val = fmt.format(Math.round(state.v));
        if (layerName) updateTextLayers(layerName, val);
        else el.textContent = val;
      }
    });
    setTimeout(function () { 
      var val = fmt.format(target);
      if (layerName) updateTextLayers(layerName, val);
      else el.textContent = val;
    }, 2000);
  }

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      counterObserver.unobserve(entry.target);
      animateCounter(entry.target);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-count-to]').forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ---------- Slider de preço-âncora (Estimativa) ---------- */
  var slider = document.getElementById('price-slider');
  var chip = document.getElementById('slider-chip');
  var captionEl = document.getElementById('anchor-caption');
  var addons = document.querySelectorAll('.addon-checkbox');

  // Elementos da seção de investimento final
  var investAnchor = document.getElementById('investimento-anchor');
  var investStamp = document.getElementById('investimento-stamp');
  var investDetail = document.getElementById('investimento-detail');
  var compareEl = document.getElementById('anchor-compare');

  function syncSlider() {
    if (!slider) return;
    
    var min = parseInt(slider.min, 10);
    var max = parseInt(slider.max, 10);
    var pages = parseInt(slider.value, 10);
    var pct = ((pages - min) / (max - min)) * 100;

    slider.style.setProperty('--fill', pct + '%');
    slider.setAttribute('aria-valuetext', pages + ' páginas');

    chip.innerHTML = pages + '<span> págs.</span>';
    // Chip acompanha o thumb (compensa a largura do thumb nas pontas)
    chip.style.left = 'calc(' + pct + '% + ' + ((50 - pct) * 0.22) + 'px)';

    // Cálculo do custo da estimativa (mercado)
    var baseMarket = 500;
    var addonSum = 0;
    var paidAddonSum = 0; // Addons que não são brindes
    var giftNames = []; // Nomes dos brindes selecionados

    var selectedAddons = [];
    addons.forEach(function (cb) {
      if (cb.checked) {
        var val = parseInt(cb.value, 10);
        addonSum += val;
        var addonName = cb.nextElementSibling.textContent;
        selectedAddons.push(addonName);
        
        // Verifica se é brinde na oferta final
        if (cb.getAttribute('data-gift') === 'true') {
          giftNames.push(addonName);
        } else {
          paidAddonSum += val;
        }
      }
    });
    
    var pricePerMarketPage = baseMarket + addonSum;
    var totalMarket = pages * pricePerMarketPage;

    // Atualiza simulador
    updateTextLayers('anchor-total', fmt.format(totalMarket));
    if (captionEl) {
      captionEl.textContent = 'Base: R$ ' + pricePerMarketPage + ' / página';
    }

    // Cálculo do custo final (investimento)
    var baseFinal = 275;
    var finalAddonSum = paidAddonSum * 0.55; 
    var pricePerFinalPage = baseFinal + finalAddonSum;
    var totalFinal = pages * pricePerFinalPage;
    totalFinal = Math.round(totalFinal);

    var discountPct = 45;
    var ratio = (totalMarket / totalFinal).toFixed(1).replace('.', ',');

    // Atualiza a seção final
    updateTextLayers('final-counter', fmt.format(totalFinal));
    
    if (investAnchor) {
      investAnchor.innerHTML = 'R$&nbsp;' + fmt.format(totalMarket) +
        '<svg class="pricing__strike" viewBox="0 0 200 22" preserveAspectRatio="none" aria-hidden="true">' +
          '<line x1="0" y1="11" x2="200" y2="11" stroke="currentColor" stroke-width="2" />' +
        '</svg>';
    }
    
    if (investStamp) {
      investStamp.textContent = '-' + discountPct + '%';
      investStamp.setAttribute('aria-label', discountPct + ' por cento de desconto');
    }
    
    if (investDetail) {
      investDetail.textContent = pages + ' páginas x R$ ' + Math.round(pricePerFinalPage) + ' = R$ ' + fmt.format(totalFinal);
    }
    
    var investGifts = document.getElementById('investimento-gifts');
    if (investGifts) {
      if (giftNames.length > 0) {
        var giftsHTML = '';
        giftNames.forEach(function(g) {
          giftsHTML += '<p>+ Brinde: ' + g + '</p>';
        });
        investGifts.innerHTML = giftsHTML;
      } else {
        investGifts.innerHTML = '';
      }
    }
    
    if (compareEl) {
      compareEl.innerHTML =
        'O mercado cobraria (R$&nbsp;' + fmt.format(totalMarket) + ') ou mais. ' +
        'Comigo você paga apenas R$&nbsp;' + fmt.format(totalFinal) + ', o que é ' + ratio + '× menos.';
    }

    // Atualiza link do WhatsApp dinamicamente
    var ctaFinal = document.getElementById('cta-final');
    if (ctaFinal) {
      var msg = 'Lucas, topo dar esse passo! Meu escopo simulado foi esse:\n\n';
      msg += '- ' + pages + ' páginas\n';
      if (selectedAddons.length > 0) {
        msg += '- Adicionais: ' + selectedAddons.join(', ') + '\n';
      }
      msg += '- Valor final com desconto: R$ ' + fmt.format(totalFinal);
      
      var waUrl = 'https://wa.me/5531991415564?text=' + encodeURIComponent(msg);
      ctaFinal.setAttribute('href', waUrl);
    }
    
    // Atualiza interface do mini-simulador
    var miniVal = document.getElementById('mini-stepper-val');
    var miniAddonBtns = document.querySelectorAll('.mini-addon__btn');
    if (miniVal) miniVal.textContent = pages;
    if (miniAddonBtns) {
      miniAddonBtns.forEach(function(btn, i) {
        var giftWrap = btn.nextElementSibling;
        if (addons[i] && addons[i].checked) {
          btn.classList.add('is-active');
          if (giftWrap && addons[i].getAttribute('data-gift') === 'true') {
            giftWrap.classList.add('is-visible');
          }
        } else {
          btn.classList.remove('is-active');
          if (giftWrap) {
            giftWrap.classList.remove('is-visible');
          }
        }
      });
    }
  }

  if (slider) {
    slider.addEventListener('input', syncSlider);
    addons.forEach(function(cb) {
      cb.addEventListener('change', syncSlider);
    });
    
    // Eventos do mini-simulador
    var miniBtnDown = document.getElementById('mini-stepper-down');
    var miniBtnUp = document.getElementById('mini-stepper-up');
    var miniAddonBtns = document.querySelectorAll('.mini-addon__btn');

    if (miniBtnDown && miniBtnUp) {
      miniBtnDown.addEventListener('click', function() {
        var current = parseInt(slider.value, 10);
        if (current > parseInt(slider.min, 10)) {
          slider.value = current - 1;
          syncSlider();
        }
      });
      miniBtnUp.addEventListener('click', function() {
        var current = parseInt(slider.value, 10);
        if (current < parseInt(slider.max, 10)) {
          slider.value = current + 1;
          syncSlider();
        }
      });
    }

    if (miniAddonBtns) {
      miniAddonBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = parseInt(this.getAttribute('data-addon-index'), 10);
          if (addons[idx]) {
            addons[idx].checked = !addons[idx].checked;
            syncSlider();
          }
        });
      });
    }

    syncSlider();
  }

  /* ---------- Abas-pasta (Seções 2 e 3) ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (windowEl) {
    var tabs = Array.prototype.slice.call(windowEl.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(windowEl.querySelectorAll('[role="tabpanel"]'));

    function activate(index, focus) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(function (panel, i) {
        var selected = i === index;
        panel.classList.toggle('is-active', selected);
        if (selected) {
          panel.hidden = false;
          if (hasAnime && !reducedMotion) {
            window.anime({
              targets: panel.children,
              opacity: [0, 1],
              translateY: [12, 0],
              duration: 340,
              delay: window.anime.stagger(55),
              easing: 'easeOutCubic'
            });
            setTimeout(function () {
              Array.prototype.forEach.call(panel.children, function (child) {
                if (getComputedStyle(child).opacity === '0') {
                  child.style.opacity = '1';
                  child.style.transform = 'none';
                }
              });
            }, 1200);
          }
        } else {
          panel.hidden = true;
        }
      });
      
      var tabsContainer = windowEl.querySelector('.tabs');
      if (tabsContainer && tabs[index]) {
        var tab = tabs[index];
        tabsContainer.scrollTo({
          left: tab.offsetLeft - (tabsContainer.offsetWidth / 2) + (tab.offsetWidth / 2),
          behavior: 'smooth'
        });
      }
      
      if (focus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(i, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); activate(next, true); }
      });
    });

    var touchStartX = 0;
    var touchEndX = 0;
    
    windowEl.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    windowEl.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      var currentIdx = tabs.findIndex(function(t) { return t.classList.contains('is-active'); });
      if (touchEndX < touchStartX - 50) { // swipe left
        if (currentIdx < tabs.length - 1) activate(currentIdx + 1, false);
      }
      if (touchEndX > touchStartX + 50) { // swipe right
        if (currentIdx > 0) activate(currentIdx - 1, false);
      }
    }, {passive: true});
  });

  /* ---------- Spotlight glow dos dossiês (port GlowCard/21st.dev) ---------- */
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover && !reducedMotion) {
    var glowTicking = false;
    document.addEventListener('pointermove', function (e) {
      if (glowTicking) return;
      glowTicking = true;
      requestAnimationFrame(function () {
        var root = document.documentElement;
        root.style.setProperty('--x', e.clientX.toFixed(2));
        root.style.setProperty('--y', e.clientY.toFixed(2));
        root.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(3));
        root.style.setProperty('--yp', (e.clientY / window.innerHeight).toFixed(3));
        glowTicking = false;
      });
    }, { passive: true });
  }

  /* ---------- Microinteração do CTA final ---------- */
  var cta = document.getElementById('cta-final');
  if (cta && hasAnime && !reducedMotion) {
    cta.addEventListener('mouseenter', function () {
      window.anime.remove(cta);
      window.anime({ targets: cta, scale: 1.03, duration: 200, easing: 'easeOutQuad' });
    });
    cta.addEventListener('mouseleave', function () {
      window.anime.remove(cta);
      window.anime({ targets: cta, scale: 1, duration: 200, easing: 'easeOutQuad' });
    });
  }

  /* ============================================================
     Glitter WebGL de página inteira
     Port vanilla fiel do animated-hero-with-web-gl-glitter:
     noise 512 RGBA repeat/linear, 2 samples em escalas e
     velocidades opostas, pow(x,12), amplificação 5x.
     speed 0.75; DPR cap 1.5; pausa com aba oculta.
     ============================================================ */
  (function initGlitter() {
    if (reducedMotion) return;
    var canvas = document.getElementById('glitter');
    if (!canvas) return;
    var gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'high-performance' });
    if (!gl) { canvas.remove(); return; }

    var SPEED = 0.75;
    var DPR = Math.min(window.devicePixelRatio || 1, 1.5);

    var vsSource = [
      'attribute vec2 position;',
      'varying vec2 vUv;',
      'void main() {',
      '  vUv = position * 0.5 + 0.5;',
      '  gl_Position = vec4(position, 0.0, 1.0);',
      '}'
    ].join('\n');

    var fsSource = [
      'precision mediump float;',
      'uniform float iTime;',
      'uniform sampler2D iChannel0;',
      'varying vec2 vUv;',
      'void main() {',
      '  vec2 uv = vUv;',
      '  float result = 0.0;',
      '  result += texture2D(iChannel0, uv * 1.1 + vec2(iTime * -0.005)).r;',
      '  result *= texture2D(iChannel0, uv * 0.9 + vec2(iTime * 0.005)).g;',
      '  result = pow(result, 12.0);',
      '  gl_FragColor = vec4(vec3(5.0) * result, 1.0);',
      '}'
    ].join('\n');

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    }

    var vs = compile(gl.VERTEX_SHADER, vsSource);
    var fs = compile(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) { canvas.remove(); return; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);

    // Triângulo que cobre a tela
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Textura de ruído 512x512 RGBA (mesma geração do original)
    var SIZE = 512;
    var data = new Uint8Array(SIZE * SIZE * 4);
    for (var i = 0; i < SIZE * SIZE; i++) {
      var stride = i * 4;
      data[stride] = Math.random() * 255;
      data[stride + 1] = Math.random() * 255;
      data[stride + 2] = Math.random() * 255;
      data[stride + 3] = 255;
    }
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIZE, SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    var timeLoc = gl.getUniformLocation(prog, 'iTime');
    gl.uniform1i(gl.getUniformLocation(prog, 'iChannel0'), 0);

    function resize() {
      canvas.width = Math.round(window.innerWidth * DPR);
      canvas.height = Math.round(window.innerHeight * DPR);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    var start = performance.now();
    var running = true;

    function frame() {
      if (!running) return;
      gl.uniform1f(timeLoc, ((performance.now() - start) / 1000) * SPEED);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    document.addEventListener('visibilitychange', function () {
      var wasRunning = running;
      running = !document.hidden;
      if (running && !wasRunning) requestAnimationFrame(frame);
    });
  })();
})();
