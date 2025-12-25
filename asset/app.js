var i18nZHData = {
      'tran-site-categories':'网站分类',
      'tran-site-tags':'网站标签',
      'tran-posted-in':'发布到',
      'tran-tags':'标签：',
      'tran-archives':'归档',
      'tran-categories':'分类：',
      'tran-comments':'评论',
      'tran-readmore':'继续阅读...',
      'tran-prev-page':'&laquo; 上一页',
      'tran-next-page':'下一页 &raquo;',
      'tran-disqus-comments':'评论'
    };

document.addEventListener('DOMContentLoaded',function(){
  const el = document.getElementById('navbarSNSRssSwitchBtn');
  if (el) {
    el.addEventListener('click',function(){
      const $target = document.getElementById('navbarSNSRssButtons');
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');
    });
  }

  var userLang = navigator.language || navigator.userLanguage; 
  if(userLang.indexOf('zh') != -1){
    var result = Object.keys(i18nZHData);
    for (var i = 0; i < result.length; i++) {
        var key = result[i];
        var eles = document.querySelectorAll('.'+key);
        eles.forEach(function(ele){
          ele.innerHTML = i18nZHData[key];
        });
    }
  }

  // 滚动动画效果
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // 观察所有带有 fade-in 类的元素
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(function(el) {
    observer.observe(el);
  });

  // 导航栏滚动效果
  let lastScroll = 0;
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      navbar.style.background = 'rgba(0, 0, 0, 0.8)';
    } else {
      navbar.style.background = 'rgba(0, 0, 0, 0.3)';
    }
    
    lastScroll = currentScroll;
  });

  // 图片懒加载增强
  const images = document.querySelectorAll('img');
  const imageObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';
        
        if (img.complete) {
          img.style.opacity = '1';
        } else {
          img.addEventListener('load', function() {
            img.style.opacity = '1';
          });
        }
        
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(function(img) {
    imageObserver.observe(img);
  });

  // 平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // 鼠标跟随效果（可选，用于特殊元素）
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mousemove', function(e) {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      hero.style.backgroundPosition = x + '% ' + y + '%';
    });
  }

  // 生成文章目录
  function generateTOC() {
    const articleContent = document.getElementById('articleContent');
    const tocNav = document.getElementById('tocNav');
    
    if (!articleContent || !tocNav) {
      return;
    }
    
    // 获取所有标题（h1-h6）
    const headings = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length === 0) {
      // 如果没有标题，隐藏目录和左侧列
      const tocContainer = document.getElementById('articleToc');
      const tocColumn = tocContainer ? tocContainer.closest('.column.is-one-quarter') : null;
      const contentColumn = document.querySelector('.column.is-three-quarters');
      
      if (tocContainer) {
        tocContainer.style.display = 'none';
      }
      if (tocColumn) {
        tocColumn.style.display = 'none';
      }
      if (contentColumn) {
        contentColumn.classList.remove('is-three-quarters');
        contentColumn.classList.add('is-full');
      }
      return;
    }
    
    // 生成目录结构
    let tocHTML = '<ul>';
    let currentLevel = 0;
    const headingIds = [];
    
    headings.forEach(function(heading, index) {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent.trim();
      
      // 生成ID
      let id = heading.id;
      if (!id) {
        // 如果没有ID，根据文本生成
        // 处理中英文混合的ID生成
        let friendlyId = text
          .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 移除特殊字符
          .replace(/\s+/g, '-') // 空格替换为连字符
          .replace(/-+/g, '-') // 多个连字符合并为一个
          .replace(/^-+|-+$/g, ''); // 移除首尾连字符
        
        // 如果生成了有效的ID，使用它；否则使用索引
        if (friendlyId && friendlyId.length > 0) {
          id = friendlyId;
        } else {
          id = 'heading-' + index;
        }
        
        // 确保ID唯一
        let originalId = id;
        let counter = 1;
        while (document.getElementById(id)) {
          id = originalId + '-' + counter;
          counter++;
        }
        
        heading.id = id;
      }
      
      headingIds.push(id);
      
      // 处理层级
      if (level > currentLevel) {
        // 进入更深层级
        for (let i = currentLevel; i < level; i++) {
          if (i > currentLevel) {
            tocHTML += '<ul>';
          }
        }
      } else if (level < currentLevel) {
        // 返回上层级
        for (let i = level; i < currentLevel; i++) {
          tocHTML += '</li></ul>';
        }
      } else if (index > 0) {
        // 同级
        tocHTML += '</li>';
      }
      
      // 添加目录项
      tocHTML += '<li><a href="#' + id + '" data-heading-id="' + id + '">' + text + '</a>';
      
      currentLevel = level;
    });
    
    // 闭合所有未闭合的标签
    for (let i = 0; i < currentLevel; i++) {
      tocHTML += '</li></ul>';
    }
    tocHTML += '</ul>';
    
    tocNav.innerHTML = tocHTML;
    
    // 添加点击事件
    tocNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 100; // 减去导航栏高度
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
          
          // 更新活动状态
          updateActiveTOCItem(targetId);
        }
      });
    });
    
    // 滚动高亮
    let ticking = false;
    
    function updateActiveTOCItem() {
      if (ticking) return;
      
      ticking = true;
      requestAnimationFrame(function() {
        let currentId = '';
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const offset = 150; // 偏移量
        
        // 从下往上查找当前应该高亮的标题
        for (let i = headings.length - 1; i >= 0; i--) {
          const heading = headings[i];
          const headingTop = heading.offsetTop;
          
          if (scrollTop + offset >= headingTop) {
            currentId = heading.id;
            break;
          }
        }
        
        // 更新活动状态
        tocNav.querySelectorAll('a').forEach(function(link) {
          if (link.getAttribute('data-heading-id') === currentId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
        
        ticking = false;
      });
    }
    
    // 监听滚动事件
    window.addEventListener('scroll', updateActiveTOCItem);
    updateActiveTOCItem(); // 初始化
  }
  
  // 执行生成目录
  generateTOC();

  // 文章页面隐藏RSS按钮
  const articleContent = document.getElementById('articleContent');
  if (articleContent) {
    const rssLinks = document.querySelectorAll('.navbar a[href="atom.xml"], .navbar a[href*="atom.xml"]');
    rssLinks.forEach(function(link) {
      link.style.display = 'none';
    });
  }

});