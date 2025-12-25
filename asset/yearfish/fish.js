// 不再依赖 jQuery，使用原生 JS 实现鱼儿游动
// 要求页面上存在 id="jsi-flying-fish-container" 的容器（footer.html 已添加）

(function() {
  function onReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(fn, 0);
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  onReady(function() {
    var container = document.getElementById('jsi-flying-fish-container');
    if (!container) {
      return;
    }

    var containerWidth = window.innerWidth || document.documentElement.clientWidth;
    var containerHeight = 200; // 与 footer.html 中高度保持一致

    var fishImages = [
      'asset/yearfish/fish.svg',
      'asset/yearfish/fish1.svg'
    ];

    // 鼠标在容器中的位置（相对于容器左上角），初始为 null 表示鼠标不在容器上
    var mousePos = null;

    container.addEventListener('mousemove', function (e) {
      var rect = container.getBoundingClientRect();
      mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    });

    container.addEventListener('mouseleave', function () {
      mousePos = null;
    });

    var fishCount = 8;
    var FISH_WIDTH = 80;
    var FISH_HEIGHT = 80;

    function createFish(index) {
      var imgSrc = fishImages[index % fishImages.length];

      var img = document.createElement('img');
      img.src = imgSrc;
      img.style.position = 'absolute';
      img.style.width = FISH_WIDTH + 'px';
      img.style.height = FISH_HEIGHT + 'px';
      img.style.opacity = '0.9';
      img.style.pointerEvents = 'none';

      // 初始随机位置
      var x = Math.random() * (containerWidth - FISH_WIDTH);
      var y = Math.random() * (containerHeight - FISH_HEIGHT);

      // 初始随机速度（像素/秒）——整体加快
      var speed = 40 + Math.random() * 60; // 40~100
      var direction = Math.random() * Math.PI * 2; // 弧度

      // 偶尔改变方向的计时器
      var directionChangeInterval = 1500 + Math.random() * 2500; // 1.5~4 秒，更灵活
      var lastDirectionChange = performance.now();

      // 随机加速 / 减速
      var baseSpeed = speed;
      var speedBoostEnd = 0;

      // 仅对 fish1.svg 做基础方向修正（确保图片本身是向右时为正向）
      var baseScaleX = 1;
      if (imgSrc.indexOf('fish1.svg') !== -1) {
        baseScaleX = 1; // 保持为 1，后面统一用 direction 控制朝向
      }

      function updateTransform() {
        // 根据移动方向决定朝向：cos(direction) > 0 朝右，< 0 朝左
        var faceRight = Math.cos(direction) > 0;
        var scaleX = faceRight ? baseScaleX : -baseScaleX;
        img.style.transform = 'scaleX(' + scaleX + ')';
        img.style.transformOrigin = '50% 50%';
      }

      updateTransform();

      function step(now) {
        if (!step.lastTime) {
          step.lastTime = now;
        }

        var delta = (now - step.lastTime) / 1000; // 秒
        step.lastTime = now;

        // 每隔一段时间随机小角度改变方向，让鱼儿“乱游”
        if (now - lastDirectionChange > directionChangeInterval) {
          var maxTurn = Math.PI / 3; // 最大 60 度
          var deltaAngle = (Math.random() * 2 - 1) * maxTurn;
          direction += deltaAngle;
          directionChangeInterval = 2000 + Math.random() * 3000;
          lastDirectionChange = now;
          updateTransform();
        }

        // 如果鼠标在附近，鱼儿会更明显地躲开
        if (mousePos) {
          var dx = x - mousePos.x;
          var dy = y - mousePos.y;
          var distSq = dx * dx + dy * dy;
          var avoidRadius = 240; // 影响范围更大

          if (distSq < avoidRadius * avoidRadius) {
            var dist = Math.sqrt(distSq) || 1;
            // 目标方向：指向远离鼠标的方向
            var targetDir = Math.atan2(dy, dx);

            // 将当前 direction 朝 targetDir 微调，避免瞬间跳变
            var diff = targetDir - direction;
            // 归一化到 [-PI, PI]
            while (diff > Math.PI) diff -= 2 * Math.PI;
            while (diff < -Math.PI) diff += 2 * Math.PI;

            var maxSteer = Math.PI / 10; // 单帧最大转向角度，调大一点，转向更明显
            if (diff > maxSteer) diff = maxSteer;
            if (diff < -maxSteer) diff = -maxSteer;
            direction += diff;

            // 鼠标越近，临时明显加速
            var intensity = 1 - Math.min(dist / avoidRadius, 1); // 0~1
            speed += baseSpeed * 1.6 * intensity * delta; // 加倍提升当前速度

            updateTransform();
          }
        }

        // 随机加速：偶尔短时间内提速或略微减速
        if (now > speedBoostEnd && Math.random() < 0.02) { // 大约每帧 2% 的概率触发
          var factor = 0.7 + Math.random() * 1.3; // 0.7~2.0 倍
          speed = baseSpeed * factor;
          speedBoostEnd = now + 500 + Math.random() * 1000; // 持续 0.5~1.5 秒
        } else if (now < speedBoostEnd) {
          // 加速期间保持当前 speed
        } else {
          // 恢复到基础速度附近（缓慢插值回去）
          speed += (baseSpeed - speed) * 0.05;
        }

        // 位置更新
        x += Math.cos(direction) * speed * delta;
        y += Math.sin(direction) * speed * delta;

        // 避免游出容器，碰到边缘就缓和转向
        var margin = 10;
        var bounced = false;

        if (x < margin) {
          x = margin;
          direction = Math.PI - direction;
          bounced = true;
        } else if (x > containerWidth - FISH_WIDTH - margin) {
          x = containerWidth - FISH_WIDTH - margin;
          direction = Math.PI - direction;
          bounced = true;
        }

        if (y < margin) {
          y = margin;
          direction = -direction;
          bounced = true;
        } else if (y > containerHeight - FISH_HEIGHT - margin) {
          y = containerHeight - FISH_HEIGHT - margin;
          direction = -direction;
          bounced = true;
        }

        if (bounced) {
          updateTransform();
        }

        img.style.left = x + 'px';
        img.style.top = y + 'px';

        requestAnimationFrame(step);
      }

      container.appendChild(img);
      requestAnimationFrame(step);
    }

    for (var i = 0; i < fishCount; i++) {
      createFish(i);
    }

    window.addEventListener('resize', function() {
      containerWidth = window.innerWidth || document.documentElement.clientWidth;
    });
  });
})();