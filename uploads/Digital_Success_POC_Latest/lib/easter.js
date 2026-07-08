// Hidden arcade easter egg — Konami code (↑↑↓↓←→←→ B A) opens a small Snake
// game themed as "collect the logins." Self-contained vanilla JS, no
// React/Babel dependency. Esc closes; Space restarts after game over.
(function () {
  'use strict';
  var SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var pos = 0;
  var GREEN = '#3A3831', GREEN_DEEP = '#141414', TEAL = '#141414', YELLOW = '#C75A2E', GREY_BG = '#F0EFEC', GREY = '#85816F', INK = '#141414';

  document.addEventListener('keydown', function (e) {
    if (active) return;
    var k = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === SEQ[pos]) { pos++; if (pos === SEQ.length) { pos = 0; openSnake(); } }
    else { pos = (k === SEQ[0]) ? 1 : 0; }
  });

  var active = false;

  function openSnake() {
    if (active) return; active = true;
    var CELL = 20, N = 18, SIZE = CELL * N;

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;background:rgba(20,20,18,0.55);backdrop-filter:blur(2px);font-family:"Hanken Grotesk",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';

    var panel = document.createElement('div');
    panel.style.cssText = 'background:#fff;border-radius:12px;box-shadow:0 24px 60px rgba(0,0,0,0.35);padding:18px;width:' + (SIZE + 36) + 'px;max-width:94vw';

    var head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px';
    var title = document.createElement('div');
    title.innerHTML = '<div style="font-size:15px;font-weight:700;color:' + INK + '">Logins</div><div style="font-size:11.5px;color:' + GREY + '">Eat the checks — don’t hit the walls or yourself.</div>';
    var closeBtn = document.createElement('button');
    closeBtn.textContent = '\u2715';
    closeBtn.style.cssText = 'border:0;background:transparent;cursor:pointer;font-size:18px;color:' + GREY + ';padding:4px 6px;line-height:1';
    closeBtn.onclick = close;
    head.appendChild(title); head.appendChild(closeBtn);

    var canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    canvas.style.cssText = 'display:block;width:100%;background:' + GREY_BG + ';border:1px solid #E3E0D8;border-radius:8px';
    var ctx = canvas.getContext('2d');

    var bar = document.createElement('div');
    bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:12px;font-size:12.5px;color:' + INK;
    var scoreEl = document.createElement('div');
    var hint = document.createElement('div');
    hint.style.cssText = 'color:' + GREY + ';font-size:11.5px';
    hint.textContent = 'Arrow keys / WASD · Esc to close';
    bar.appendChild(scoreEl); bar.appendChild(hint);

    panel.appendChild(head); panel.appendChild(canvas); panel.appendChild(bar);
    overlay.appendChild(panel);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);

    // ---- game state ----
    var snake, dir, nextDir, food, score, best, dead, timer, speed, beat;
    best = parseInt((function () { try { return localStorage.getItem('cc_snake_best'); } catch (e) { return 0; } })() || '0', 10) || 0;

    function reset() {
      snake = [{ x: 6, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 9 }];
      dir = { x: 1, y: 0 }; nextDir = dir;
      score = 0; dead = false; speed = 130; beat = false;
      placeFood();
      loop();
    }
    function placeFood() {
      do { food = { x: (Math.random() * N) | 0, y: (Math.random() * N) | 0 }; }
      while (snake.some(function (s) { return s.x === food.x && s.y === food.y; }));
    }
    function loop() {
      clearTimeout(timer);
      if (dead) return;
      timer = setTimeout(function () { step(); draw(); loop(); }, speed);
    }
    function step() {
      dir = nextDir;
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
        dead = true;
        if (score > best) { best = score; try { localStorage.setItem('cc_snake_best', String(best)); } catch (e) {} }
        draw(); return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++; if (speed > 70) speed -= 3; placeFood();
        if (!beat && score > best && best > 0) { beat = true; if (typeof window.fireBrandConfetti === 'function') window.fireBrandConfetti(); }
      }
      else { snake.pop(); }
    }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    function draw() {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = GREY_BG; ctx.fillRect(0, 0, SIZE, SIZE);
      // food — a yellow rounded cell with a check mark
      var fx = food.x * CELL, fy = food.y * CELL;
      ctx.fillStyle = YELLOW; rr(fx + 3, fy + 3, CELL - 6, CELL - 6, 4); ctx.fill();
      ctx.strokeStyle = TEAL; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(fx + 6, fy + CELL / 2); ctx.lineTo(fx + CELL / 2 - 1, fy + CELL - 7); ctx.lineTo(fx + CELL - 5, fy + 6); ctx.stroke();
      // snake
      for (var i = snake.length - 1; i >= 0; i--) {
        ctx.fillStyle = i === 0 ? GREEN_DEEP : GREEN;
        rr(snake[i].x * CELL + 1.5, snake[i].y * CELL + 1.5, CELL - 3, CELL - 3, 5); ctx.fill();
      }
      scoreEl.innerHTML = '<span style="font-weight:700">Score ' + score + '</span> <span style="color:' + GREY + '">· Best ' + best + '</span>';
      if (dead) {
        ctx.fillStyle = 'rgba(20,20,18,0.80)'; ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
        ctx.font = '700 24px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif';
        ctx.fillText('Game over', SIZE / 2, SIZE / 2 - 8);
        ctx.fillStyle = YELLOW; ctx.font = '600 14px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif';
        ctx.fillText(score + ' logins · press Space to retry', SIZE / 2, SIZE / 2 + 20);
        ctx.textAlign = 'left';
      }
    }
    function onKey(e) {
      var k = e.key;
      var d = null;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') d = { x: 0, y: -1 };
      else if (k === 'ArrowDown' || k === 's' || k === 'S') d = { x: 0, y: 1 };
      else if (k === 'ArrowLeft' || k === 'a' || k === 'A') d = { x: -1, y: 0 };
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') d = { x: 1, y: 0 };
      else if (k === 'Escape') { close(); return; }
      else if (k === ' ' && dead) { e.preventDefault(); reset(); return; }
      if (d) {
        e.preventDefault();
        // no 180° reversal
        if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
      }
    }
    document.addEventListener('keydown', onKey, true);

    function close() {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
      active = false;
    }

    reset();
  }

  window.openSnakeGame = openSnake;
})();
