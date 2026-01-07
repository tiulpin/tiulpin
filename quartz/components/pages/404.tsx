import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const NotFound: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = url.pathname

  const gameScript = `
(function() {
  const canvas = document.getElementById('dino-game');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const isDark = document.documentElement.getAttribute('saved-theme') === 'dark';
  
  const colors = {
    bg: isDark ? '#1a1a1a' : '#faf8f5',
    dino: isDark ? '#e0e0e0' : '#535353',
    cactus: isDark ? '#a0a0a0' : '#535353',
    ground: isDark ? '#666' : '#535353',
    text: isDark ? '#e0e0e0' : '#535353',
    cloud: isDark ? '#444' : '#e0e0e0'
  };
  
  let gameRunning = false, gameOver = false, score = 0, frameCount = 0;
  let highScore = parseInt(localStorage.getItem('dinoHighScore') || '0');
  
  const dino = { x: 50, y: 100, width: 20, height: 22, velocityY: 0, jumping: false };
  const gravity = 0.6, jumpForce = -12, groundY = 120;
  let obstacles = [], obstacleTimer = 0, obstacleInterval = 100, gameSpeed = 4;
  let clouds = [{ x: 200, y: 30 }, { x: 400, y: 50 }, { x: 550, y: 25 }];
  
  function drawDino() {
    ctx.fillStyle = colors.dino;
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    ctx.fillRect(dino.x + 12, dino.y - 8, 12, 12);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(dino.x + 18, dino.y - 5, 3, 3);
    ctx.fillStyle = colors.dino;
    const legOffset = Math.floor(frameCount / 5) % 2;
    if (!dino.jumping) {
      ctx.fillRect(dino.x + 4, dino.y + dino.height, 4, 8 + legOffset * 2);
      ctx.fillRect(dino.x + 12, dino.y + dino.height, 4, 8 + (1 - legOffset) * 2);
    } else {
      ctx.fillRect(dino.x + 4, dino.y + dino.height, 4, 6);
      ctx.fillRect(dino.x + 12, dino.y + dino.height, 4, 6);
    }
    ctx.fillRect(dino.x - 8, dino.y + 4, 10, 6);
    ctx.fillRect(dino.x - 12, dino.y + 6, 6, 4);
    ctx.fillRect(dino.x + 14, dino.y + 8, 6, 3);
  }
  
  function drawCactus(o) {
    ctx.fillStyle = colors.cactus;
    ctx.fillRect(o.x, o.y, o.width, o.height);
    if (o.width > 8) {
      ctx.fillRect(o.x - 6, o.y + 10, 6, 4);
      ctx.fillRect(o.x - 6, o.y + 6, 4, 8);
      ctx.fillRect(o.x + o.width, o.y + 15, 6, 4);
      ctx.fillRect(o.x + o.width + 2, o.y + 10, 4, 10);
    }
  }
  
  function drawCloud(c) {
    ctx.fillStyle = colors.cloud;
    ctx.fillRect(c.x, c.y, 30, 8);
    ctx.fillRect(c.x + 5, c.y - 4, 20, 8);
    ctx.fillRect(c.x + 10, c.y + 6, 15, 4);
  }
  
  function drawGround() {
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, groundY + 30, canvas.width, 2);
    for (let i = 0; i < canvas.width; i += 20) {
      const offset = (frameCount * gameSpeed + i) % canvas.width;
      ctx.fillRect(canvas.width - offset, groundY + 34, 3, 1);
    }
  }
  
  function drawScore() {
    ctx.fillStyle = colors.text;
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('HI ' + String(highScore).padStart(5, '0') + '  ' + String(score).padStart(5, '0'), canvas.width - 10, 20);
  }
  
  function drawStartScreen() {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGround();
    dino.y = groundY - dino.height + 8;
    drawDino();
    ctx.fillStyle = colors.text;
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS SPACE TO START', canvas.width / 2, 70);
    drawScore();
  }
  
  function drawGameOver() {
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, 60);
    ctx.font = '12px monospace';
    ctx.fillText('Press Space to restart', canvas.width / 2, 80);
  }
  
  function spawnObstacle() {
    const types = [{ width: 10, height: 25 }, { width: 15, height: 30 }, { width: 20, height: 35 }];
    const type = types[Math.floor(Math.random() * types.length)];
    obstacles.push({ x: canvas.width, y: groundY - type.height + 30, width: type.width, height: type.height });
  }
  
  function checkCollision() {
    const d = { x: dino.x + 4, y: dino.y, width: dino.width - 4, height: dino.height + 8 };
    for (const o of obstacles) {
      if (d.x < o.x + o.width - 4 && d.x + d.width > o.x + 4 && d.y < o.y + o.height && d.y + d.height > o.y) return true;
    }
    return false;
  }
  
  function update() {
    if (!gameRunning || gameOver) return;
    frameCount++;
    dino.velocityY += gravity;
    dino.y += dino.velocityY;
    if (dino.y >= groundY - dino.height + 8) { dino.y = groundY - dino.height + 8; dino.velocityY = 0; dino.jumping = false; }
    obstacleTimer++;
    if (obstacleTimer >= obstacleInterval) { spawnObstacle(); obstacleTimer = 0; obstacleInterval = 60 + Math.random() * 60; }
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= gameSpeed;
      if (obstacles[i].x + obstacles[i].width < 0) { obstacles.splice(i, 1); score += 10; }
    }
    for (const c of clouds) { c.x -= gameSpeed * 0.3; if (c.x < -40) { c.x = canvas.width + Math.random() * 100; c.y = 20 + Math.random() * 40; } }
    if (frameCount % 500 === 0) gameSpeed += 0.2;
    if (checkCollision()) { gameOver = true; if (score > highScore) { highScore = score; localStorage.setItem('dinoHighScore', String(highScore)); } }
  }
  
  function draw() {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const c of clouds) drawCloud(c);
    drawGround();
    for (const o of obstacles) drawCactus(o);
    drawDino();
    drawScore();
    if (gameOver) drawGameOver();
  }
  
  function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
  function jump() { if (!dino.jumping) { dino.velocityY = jumpForce; dino.jumping = true; } }
  function startGame() { gameRunning = true; gameOver = false; score = 0; frameCount = 0; gameSpeed = 4; obstacles = []; obstacleTimer = 0; dino.y = groundY - dino.height + 8; dino.velocityY = 0; dino.jumping = false; }
  
  function handleInput(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (!gameRunning || gameOver) { startGame(); jump(); } else { jump(); }
    }
  }
  
  document.addEventListener('keydown', handleInput);
  canvas.addEventListener('click', () => { if (!gameRunning || gameOver) { startGame(); jump(); } else { jump(); } });
  
  const observer = new MutationObserver(() => {
    const isDarkNow = document.documentElement.getAttribute('saved-theme') === 'dark';
    colors.bg = isDarkNow ? '#1a1a1a' : '#faf8f5';
    colors.dino = isDarkNow ? '#e0e0e0' : '#535353';
    colors.cactus = isDarkNow ? '#a0a0a0' : '#535353';
    colors.ground = isDarkNow ? '#666' : '#535353';
    colors.text = isDarkNow ? '#e0e0e0' : '#535353';
    colors.cloud = isDarkNow ? '#444' : '#e0e0e0';
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['saved-theme'] });
  
  drawStartScreen();
  gameLoop();
})();
`

  return (
    <article class="not-found-page">
      <div class="not-found-content">
        <h1>404</h1>
        <p class="not-found-message">
          Looks like this page has moved or doesn't exist anymore.
        </p>
        <p class="not-found-suggestion">
          Head back <a href={baseDir}>home</a> and use the search to find what you're looking for.
        </p>
        <div class="not-found-divider"></div>
        <p class="not-found-game-hint">Or play a quick game while you're here...</p>
        <div class="dino-game-container">
          <canvas id="dino-game" width="600" height="150"></canvas>
          <p class="dino-instructions">Press <kbd>Space</kbd> or <kbd>↑</kbd> to jump, or tap/click</p>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: gameScript }} />
    </article>
  )
}

NotFound.css = `
body[data-slug="404"] .left.sidebar,
body[data-slug="404"] .right.sidebar {
  display: none !important;
}

body[data-slug="404"] .page-header,
body[data-slug="404"] .page-footer,
body[data-slug="404"] footer,
body[data-slug="404"] hr {
  display: none !important;
}

body[data-slug="404"] #quartz-body {
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  grid-template-areas: "grid-center";
}

.not-found-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  padding: 2rem;
  margin: 0 auto;
  width: 100%;
  max-width: 100%;
}

.not-found-content {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.not-found-page h1 {
  font-family: var(--headerFont);
  font-size: 6rem;
  margin: 0;
  color: var(--secondary);
  opacity: 0.3;
}

.not-found-message {
  font-size: 1.25rem;
  margin: 1rem 0;
  color: var(--darkgray);
}

.not-found-suggestion {
  font-size: 1rem;
  color: var(--gray);
  margin-bottom: 2rem;
}

.not-found-suggestion a,
.not-found-suggestion .search-link {
  color: var(--secondary);
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
}

.not-found-suggestion a:hover,
.not-found-suggestion .search-link:hover {
  text-decoration: underline;
}

.not-found-divider {
  width: 100px;
  height: 1px;
  background: var(--lightgray);
  margin: 2rem auto;
}

.not-found-game-hint {
  font-size: 0.85rem;
  color: var(--gray);
  opacity: 0.7;
  margin-bottom: 1rem;
}

.dino-game-container {
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

#dino-game {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.dino-instructions {
  font-size: 0.75rem;
  color: var(--gray);
  margin-top: 0.75rem;
  margin-bottom: 0;
}

.dino-instructions kbd {
  background: var(--lightgray);
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  font-family: var(--codeFont);
  font-size: 0.7rem;
}

@media (max-width: 600px) {
  .not-found-page h1 {
    font-size: 4rem;
  }
  
  .dino-game-container {
    padding: 0.5rem;
  }
}
`

export default (() => NotFound) satisfies QuartzComponentConstructor
