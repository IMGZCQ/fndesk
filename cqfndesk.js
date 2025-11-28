// 全局变量存储数据
let globalData = null;
let retryCount = 0;
const maxRetries = 1000; // 减少最大重试次数
const retryInterval = 300; // 减少重试间隔时间
let intervalnasNameDisplay;
// 存储优化后的URL映射
let optimizedUrls = new Map();
// 记录ping是否已完成
let pingCompleted = false;
// 用于管理窗口层级的全局变量
let currentZIndex = 10000;

// 管理特定容器内子容器中的三种元素的层级关系
function setupSpecificElementsZIndexManagement() {
  // 直接在整个文档中查找所有目标元素并设置事件监听
  function processExistingElements() {
    // 直接在整个文档中查找所有目标元素
    const allTargetElements = document.querySelectorAll('[id^="url-window"], [id^="folder-window"], .trim-ui__app-layout--window');
    // 为每个目标元素单独设置事件监听，不依赖于父容器结构
    allTargetElements.forEach(element => {
      setupElementEvents(element);
    });
  }
  
  // 为单个元素设置事件的函数
  function setupElementEvents(element) {
    // 检查元素是否已经有事件监听器
    if (!element.hasAttribute('data-z-index-managed')) {
     // console.log(`为元素添加z-index管理: ${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}${element.className ? ' .' + Array.from(element.classList).join('.') : ''}`);
      
      // 为元素添加标记，表示已经被管理
      element.setAttribute('data-z-index-managed', 'true');
      
      // 为元素添加多个事件监听器，确保各种操作都能触发z-index更新
      // 只在按下鼠标时调整z-index，避免鼠标移动就置顶的问题
      element.addEventListener('mousedown', handleElementInteraction, true); // 捕获阶段触发
      element.addEventListener('focus', handleElementInteraction); // 焦点事件
    }
  }
  
  // 处理元素交互的函数，将z-index调整到最大值+1
  function handleElementInteraction(e) {
    // 不再阻止事件冒泡，以保证拖动等功能正常工作
    
    // 计算所有目标元素的最大z-index值
    let maxZIndex = 0;
    const allTargetElements = document.querySelectorAll('[id^="url-window"], [id^="folder-window"], .trim-ui__app-layout--window');
    
    // 详细输出所有目标元素的z-index信息
    allTargetElements.forEach((elem, index) => {
      const tagName = elem.tagName ? elem.tagName.toLowerCase() : 'div';
      const className = elem.className ? '.' + Array.from(elem.classList).join('.') : '';
      const id = elem.id ? '#' + elem.id : '';
      const zIndex = parseInt(elem.style.zIndex) || 0;
     // console.log(`元素${index + 1}: ${tagName}${className}${id}, z-index = ${zIndex}`);
      
      // 找出最大的z-index值
      if (zIndex > maxZIndex) {
        maxZIndex = zIndex;
      }
    });
    
    // 获取当前元素的ID，如果没有则生成一个唯一ID
    let elementId = this.id;
    if (!elementId) {
      elementId = 'element_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      this.id = elementId;
    }
    
    // 记录当前元素的z-index值
    const oldZIndex = parseInt(this.style.zIndex) || 0;
    
    // 将当前元素置于顶层（最大z-index值+1）
    const newZIndex = maxZIndex + 1;
    this.style.zIndex = newZIndex;
    
    // 更新全局currentZIndex以保持一致性
    if (newZIndex > currentZIndex) {
      // console.log(`更新全局currentZIndex: ${currentZIndex} -> ${newZIndex}`);
      currentZIndex = newZIndex;
    }
  }
  
  // 处理现有元素
  processExistingElements();
  
  // 添加MutationObserver来监控DOM变化，以便处理动态添加的元素
  const observer = new MutationObserver(function(mutationsList) {
    // 遍历所有DOM变化
    for (let mutation of mutationsList) {
      // 检查是否有新元素被添加
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          // 只处理元素节点
          if (node.nodeType === 1) { // 1 表示元素节点
            // 检查节点本身是否为目标元素
            if (node.matches('[id^="url-window"], [id^="folder-window"], .trim-ui__app-layout--window')) {
             // console.log('检测到动态添加的目标元素:', node.tagName.toLowerCase(), node.id || node.className);
              // 直接为元素本身设置事件，而不是为父容器
              setupElementEvents(node);
              // 立即将新添加的trim-ui__app-layout--window类元素设置为最高z-index
              if (node.classList.contains('trim-ui__app-layout--window')) {
                handleElementInteraction.call(node);
              }
            }
            
            // 检查节点的子元素中是否有目标元素
            const newTargetElements = node.querySelectorAll('[id^="url-window"], [id^="folder-window"], .trim-ui__app-layout--window');
            if (newTargetElements.length > 0) {
              // console.log(`检测到${newTargetElements.length}个动态添加的目标元素`);
              // 为每个新发现的目标元素直接设置事件
              newTargetElements.forEach(targetElement => {
                setupElementEvents(targetElement);
                // 立即将新添加的trim-ui__app-layout--window类元素设置为最高z-index
                if (targetElement.classList.contains('trim-ui__app-layout--window')) {
                  handleElementInteraction.call(targetElement);
                }
              });
            }
          }
        });
      }
    }
  });
  
  // 配置MutationObserver以监控整个文档的子节点变化
  const observerConfig = {
    childList: true,      // 监控子节点的添加和删除
    subtree: true,        // 监控所有后代节点
    attributes: false,    // 不监控属性变化
    characterData: false  // 不监控字符数据变化
  };
  
  // 启动观察器
  observer.observe(document.body, observerConfig);
   // 返回观察器引用，以便在需要时可以停止观察
  return observer;
}

// 托盘相关全局变量
let trayContainer = null; // 托盘容器
let minimizedWindows = new Map(); // 存储最小化的窗口信息
let trayHeight = 48; // 托盘高度（原来的80%）
let trayItemWidth = 120; // 托盘项宽度

//////////////获取排序iconSort排序字段
let iconSort = 1; // 默认降序
let nasNameDisplay = 1;
let openAPPInPage = 1; // 默认在窗内口打开
fetch('deskdata/fnstyle.json')
  .then(response => response.json())
  .then(fnstyle => {
    iconSort = fnstyle.iconSort || 1;
    nasNameDisplay = fnstyle.nasNameDisplay || 1;
  //  openAPPInPage = fnstyle.openAPPInPage || 1; // 读取openAPPInPage值
              // 根据nasNameDisplay值控制是否显示nas名称
      if (nasNameDisplay === 2) {
        clearInterval(intervalnasNameDisplay);
         intervalnasNameDisplay = setInterval(() => {
          const pElements = document.querySelectorAll('p.select-none');
          if (pElements.length > 0) {
            pElements.forEach(el => {
              const br = document.createElement('br');
              el.parentNode.insertBefore(br, el);
              el.remove();
            });
            //pElements.forEach(el => el.textContent = '123');
            clearInterval(intervalnasNameDisplay); // 清空内容成功后清除定时器
          }
        }, 100); // 每隔半秒检查一次
      }
  })
  .catch(error => console.error('读取fnstyle.json失败:', error));
// 创建托盘容器
function createTrayContainer() {
  // 检查是否已存在托盘容器
  if (trayContainer) {
    return trayContainer;
  }
  
  // 创建托盘容器
  trayContainer = document.createElement('div');
  trayContainer.id = 'tech-window-tray';
  trayContainer.style.position = 'fixed';
  trayContainer.style.bottom = '0';
  trayContainer.style.left = '50%';
  trayContainer.style.transform = 'translateX(-50%)';
  trayContainer.style.width = 'fit-content';
  trayContainer.style.maxWidth = '90%';
  trayContainer.style.minWidth = '150px';
  trayContainer.style.height = trayHeight + 'px';
  trayContainer.style.background = 'rgba(20, 20, 30, 0.9)';
  trayContainer.style.borderTop = '1px solid #3a3a5a';
  trayContainer.style.borderLeft = '1px solid #3a3a5a';
  trayContainer.style.borderRight = '1px solid #3a3a5a';
  trayContainer.style.borderRadius = '12px 12px 0 0';
  trayContainer.style.boxShadow = '0 -2px 20px rgba(66, 153, 225, 0.3)';
  trayContainer.style.zIndex = '9998';
  trayContainer.style.display = 'flex';
  trayContainer.style.alignItems = 'center';
  trayContainer.style.padding = '0 10px';
  trayContainer.style.gap = '10px';
  trayContainer.style.overflowX = 'auto';
  trayContainer.style.overflowY = 'hidden';
  trayContainer.style.backdropFilter = 'blur(10px)';
  trayContainer.style.justifyContent = 'center';
  
  // 添加到文档
  document.body.appendChild(trayContainer);
  
  return trayContainer;
}

// 添加窗口到托盘
function addToTray(windowId, title, windowElement) {
  // 确保托盘容器已初始化
  ensureTrayExists();
  
  // 首先检查是否已存在该窗口的托盘项，如果存在则先移除
  const existingTrayItem = document.getElementById('tray-item-' + windowId);
  if (existingTrayItem && trayContainer.contains(existingTrayItem)) {
    trayContainer.removeChild(existingTrayItem);
  }
  
  // 创建托盘项
  const trayItem = document.createElement('div');
  trayItem.id = 'tray-item-' + windowId;
  trayItem.style.minWidth = trayItemWidth + 'px';
  trayItem.style.height = (trayHeight - 10) + 'px';
  trayItem.style.background = 'rgba(66, 153, 225, 0.1)';
  trayItem.style.border = '1px solid #3a3a5a';
  trayItem.style.borderRadius = '6px';
  trayItem.style.display = 'flex';
  trayItem.style.alignItems = 'center';
  trayItem.style.justifyContent = 'center';
  trayItem.style.padding = '0 10px';
  trayItem.style.cursor = 'pointer';
  trayItem.style.transition = 'all 0.2s ease';
  trayItem.style.overflow = 'hidden';
  trayItem.style.whiteSpace = 'nowrap';
  trayItem.style.textOverflow = 'ellipsis';
  trayItem.style.color = '#ffffff';
  trayItem.style.fontSize = '14px';
  
  // 移除直接设置textContent的代码，改为添加图标和标题元素
  trayItem.style.justifyContent = 'flex-start'; // 修改为左对齐
  
  // 添加窗口图标
  const trayIcon = document.createElement('img');
  // 尝试获取窗口对应的图标
  trayIcon.src = getWindowIcon(windowId) || 'deskdata/img/i.png'; // 优先使用窗口对应的图标，失败时使用默认图标
  trayIcon.style.width = '20px';
  trayIcon.style.height = '20px';
  trayIcon.style.marginRight = '8px';
  trayIcon.style.objectFit = 'contain';
  
  // 添加标题元素
  const trayTitle = document.createElement('div');
  trayTitle.textContent = title;
  trayTitle.style.overflow = 'hidden';
  trayTitle.style.textOverflow = 'ellipsis';
  trayTitle.style.whiteSpace = 'nowrap';
  trayTitle.style.flex = '1';
  
  // 添加关闭按钮
  const closeButton = document.createElement('div');
  closeButton.textContent = 'X'; // x字符作为关闭按钮
  closeButton.style.width = '20px';
  closeButton.style.height = '20px';
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.borderRadius = '2px'; // 小的圆角，使其看起来像正方形
  closeButton.style.background = 'rgba(255, 0, 0, 0.6)';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '16px';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.cursor = 'pointer';
  closeButton.style.marginLeft = '8px';
  closeButton.style.transition = 'all 0.2s ease';
  closeButton.style.userSelect = 'none';
  closeButton.title = '关闭窗口';
  
  // 关闭按钮悬停效果
  closeButton.addEventListener('mouseenter', function() {
    this.style.background = 'rgba(255, 0, 0, 0.8)';
    this.style.transform = 'scale(1.1)';
  });
  
  closeButton.addEventListener('mouseleave', function() {
    this.style.background = 'rgba(255, 0, 0, 0.6)';
    this.style.transform = 'scale(1)';
  });
  
  // 关闭按钮点击事件，阻止冒泡并关闭窗口
  closeButton.addEventListener('click', function(event) {
    event.stopPropagation(); // 阻止冒泡，避免触发托盘项的点击事件
    
    // 关闭窗口逻辑
    const windowElement = minimizedWindows.get(windowId)?.element;
    if (windowElement) {
      // 从DOM中移除窗口
      windowElement.remove();
      
      // 从托盘移除
      removeFromTray(windowId);
      
      // 从activeWindows中移除
      delete activeWindows[windowId];
    }
  });
  
  // 将图标、标题和关闭按钮添加到托盘项
  trayItem.appendChild(trayIcon);
  trayItem.appendChild(trayTitle);
  trayItem.appendChild(closeButton);
  
  // 鼠标悬停效果
  trayItem.addEventListener('mouseenter', function() {
    this.style.background = 'rgba(66, 153, 225, 0.3)';
    this.style.borderColor = '#4299e1';
  });
  
  trayItem.addEventListener('mouseleave', function() {
    this.style.background = 'rgba(66, 153, 225, 0.1)';
    this.style.borderColor = '#3a3a5a';
  });
  
  // 点击托盘项还原窗口
  trayItem.addEventListener('click', function() {
    restoreFromTray(windowId);
  });
  
  // 存储窗口信息
  minimizedWindows.set(windowId, {
    title: title,
    element: windowElement,
    trayItem: trayItem
  });
  
  // 将托盘项添加到托盘容器
  trayContainer.appendChild(trayItem);
  
  // 显示托盘容器
  trayContainer.style.display = 'flex';
  
  // 动态调整托盘宽度
  adjustTrayWidth();
}

// 动态调整托盘宽度的函数
function adjustTrayWidth() {
  const itemCount = minimizedWindows.size;
  if (itemCount === 1) {
    // 当只有一个托盘项时，宽度正好适应该项（包含内边距）
    const padding = 20; // 左右内边距总和
    const totalWidth = trayItemWidth + padding;
    trayContainer.style.width = totalWidth + 'px';
  } else if (itemCount > 1) {
    // 多个项时使用fit-content
    trayContainer.style.width = 'fit-content';
  }
}

// 从托盘移除窗口
function removeFromTray(windowId) {
  const windowInfo = minimizedWindows.get(windowId);
  if (windowInfo && windowInfo.trayItem) {
    trayContainer.removeChild(windowInfo.trayItem);
    minimizedWindows.delete(windowId);
    
    // 动态调整托盘宽度
    adjustTrayWidth();
    
    // 如果没有最小化窗口，隐藏托盘
    if (minimizedWindows.size === 0) {
      trayContainer.style.display = 'none';
    }
  }
}

// 从托盘还原窗口
function restoreFromTray(windowId) {
  const windowInfo = minimizedWindows.get(windowId);
  if (windowInfo && windowInfo.element) {
    // 显示窗口
    windowInfo.element.style.display = 'flex'; // 使用flex以匹配原始样式
    
    // 将窗口置于顶层
    currentZIndex++;
    windowInfo.element.style.zIndex = currentZIndex;
    
    // 更新activeWindows中的状态
    if (activeWindows[windowId]) {
      activeWindows[windowId].inTray = false;
    }
    
    // 从托盘移除
    removeFromTray(windowId);
    
    // 调整iframe尺寸，确保填满窗口
    setTimeout(() => {
      const contentArea = windowInfo.element.querySelector('div[style*="flex: 1"]');
      if (contentArea) {
        const iframe = contentArea.querySelector('iframe');
        if (iframe) {
          // 强制重新计算尺寸
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.offsetHeight; // 触发重排
          iframe.style.width = '100%';
          iframe.style.height = '100%';
        }
      }
    }, 0);
  }
}

// 确保托盘容器存在
function ensureTrayExists() {
  if (!trayContainer) {
    createTrayContainer();
  }
}

// 初始化托盘系统
function initializeTraySystem() {
  ensureTrayExists();
  // 初始隐藏托盘
  trayContainer.style.display = 'none';
}

// 创建右键菜单元素
function createContextMenu() {
  // 检查是否已存在右键菜单
  let contextMenu = document.getElementById('tech-context-menu');
  if (contextMenu) {
    return contextMenu;
  }
  
  // 创建右键菜单容器
  contextMenu = document.createElement('div');
  contextMenu.id = 'tech-context-menu';
  contextMenu.style.position = 'fixed';
  contextMenu.style.background = 'rgba(20, 20, 30, 0.95)';
  contextMenu.style.border = '1px solid #3a3a5a';
  contextMenu.style.borderRadius = '8px';
  contextMenu.style.boxShadow = '0 0 20px rgba(66, 153, 225, 0.5), 0 0 40px rgba(66, 153, 225, 0.3)';
  contextMenu.style.zIndex = '9999';
  contextMenu.style.display = 'none';
  contextMenu.style.minWidth = '150px'; // 调整宽度使其更紧凑
  contextMenu.style.padding = '3px 0'; // 减少内边距
  contextMenu.style.backdropFilter = 'blur(10px)';
  
  // 添加科技感背景效果
  const backgroundEffect = document.createElement('div');
  backgroundEffect.style.position = 'absolute';
  backgroundEffect.style.top = '0';
  backgroundEffect.style.left = '0';
  backgroundEffect.style.right = '0';
  backgroundEffect.style.height = '100%';
  backgroundEffect.style.background = 'linear-gradient(45deg, transparent 0%, rgba(66, 153, 225, 0.05) 50%, transparent 100%)';
  backgroundEffect.style.zIndex = '-1';
  contextMenu.appendChild(backgroundEffect);
  
  // 添加到文档
  document.body.appendChild(contextMenu);
  
  // 点击其他地方关闭菜单，但点击菜单内部时不关闭
  document.addEventListener('click', function(e) {
    // 检查点击目标是否是菜单本身或其子元素
    if (!contextMenu.contains(e.target)) {
      contextMenu.style.display = 'none';
    }
  });
  
  // 阻止右键菜单冒泡
  contextMenu.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
  
  return contextMenu;
}

// 全局窗口管理对象
let activeWindows = {}; // 存储当前打开的窗口信息
let currentActiveWindowId = null; // 跟踪当前活动窗口ID

// 添加全局键盘事件监听器
document.addEventListener('keydown', function(event) {
  // 检查是否按下了Esc键
  if (event.key === 'Escape' || event.keyCode === 27) {
   // console.log('Esc键被按下，尝试最小化当前顶层窗口');
    
    // 查找当前z-index最高的窗口
    let topWindow = null;
    let maxZIndex = 0;
    let topWindowId = null;
    
    // 遍历所有活动窗口
    for (const windowId in activeWindows) {
      const winInfo = activeWindows[windowId];
      // 跳过已经在托盘的窗口
      if (!winInfo.inTray) {
        const windowElement = document.getElementById(windowId);
        if (windowElement && windowElement.style.display !== 'none') {
          const zIndex = parseInt(windowElement.style.zIndex) || 0;
          if (zIndex > maxZIndex) {
            maxZIndex = zIndex;
            topWindow = windowElement;
            topWindowId = windowId;
          }
        }
      }
    }
    
    // 如果找到顶层窗口，执行最小化操作
    if (topWindow && topWindowId) {
     // console.log('找到顶层窗口:', topWindowId, 'z-index:', maxZIndex);
      
      // 获取窗口标题（用于托盘显示）
      const titleBar = topWindow.querySelector('div:nth-child(1)');
      const titleElement = titleBar ? titleBar.querySelector('div:nth-child(1) div:nth-child(2)') : null;
      const windowTitle = titleElement ? titleElement.textContent : '窗口';
      
      // 确保托盘系统已初始化
      initializeTraySystem();
      ensureTrayExists();
      
      // 将窗口添加到托盘
      addToTray(topWindowId, windowTitle, topWindow);
      
      // 隐藏窗口
      topWindow.style.display = 'none';
      
      // 如果存在焦点标记，清除它
      if (topWindow.dataset.hasFocus === 'true') {
        topWindow.dataset.hasFocus = 'false';
      }
      
      // 更新窗口状态为在托盘
      if (activeWindows[topWindowId]) {
        activeWindows[topWindowId].inTray = true;
      }
      
      // 清除当前活动窗口ID
      if (currentActiveWindowId === topWindowId) {
        currentActiveWindowId = null;
      }
      
      // console.log('成功通过Esc键最小化顶层窗口:', topWindowId);
    } else {
      // console.log('未找到可最小化的顶层窗口');
    }
  }
});

// 存储窗口图标信息
let windowIcons = new Map();

// 获取窗口对应的图标
function getWindowIcon(windowId) {
  return windowIcons.get(windowId);
}

// 设置窗口图标
function setWindowIcon(windowId, iconUrl) {
  windowIcons.set(windowId, iconUrl);
}

// 根据URL获取对应的图标
function getIconForUrl(url) {
  // 简化的图标获取逻辑，只从globalData中查找对应的图标
  if (globalData && globalData.icons) {
    for (const icon of globalData.icons) {
      if (url.includes(icon.domain)) {
        return icon.iconUrl;
      }
    }
  }
  // 默认返回null，让调用方使用默认图标
  return null;
}

// 打开包含iframe的窗口函数，支持传入自定义图标和图标ID
function openUrlInWindow(url, title, icon, iconId = null) {
  // 检查是否已存在相同URL和图标ID的窗口
  for (const windowId in activeWindows) {
    const winInfo = activeWindows[windowId];
    // 检查是否是URL窗口、URL相同，并且如果提供了iconId则也需要匹配
    if (winInfo.type === 'url' && winInfo.url === url && 
        (iconId === null || winInfo.iconId === iconId)) {
      const winElement = document.getElementById(windowId);
      if (winInfo.inTray) {
        // 如果窗口在托盘里，从托盘还原
        restoreFromTray(windowId);
      } else if (winElement) {
        // 优化：直接根据窗口可见性切换最小化状态，不需要两次点击
        // 如果窗口可见，则直接最小化到托盘
        addToTray(windowId, title, winElement);
        winInfo.inTray = true;
        winElement.style.display = 'none';
        
        // 清除当前活动窗口
        if (currentActiveWindowId === windowId) {
          currentActiveWindowId = null;
        }
      }
      return; // 阻止创建新窗口
    }
  }

  // 生成唯一窗口ID，如果提供了iconId则包含在ID中
  let windowId;
  if (iconId) {
    windowId = 'url-window-' + iconId + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  } else {
    windowId = 'url-window-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  
  // 默认窗口大小
  let windowWidth = 800; // 增大默认宽度
  let windowHeight = 600; // 增大默认高度
  let savedLeft = null;
  let savedTop = null;
  
  // 尝试从localStorage读取窗口大小和位置
  try {
    // 为URL创建一个稳定的标识符，用于在localStorage中存储状态
    const urlKey = url.replace(/[^a-z0-9]/gi, '_').substring(0, 100);
    const savedWindowState = localStorage.getItem(`url-window-state-${urlKey}`);
    if (savedWindowState) {
      const { width, height, left, top } = JSON.parse(savedWindowState);
      // 验证大小是否有效
      if (width >= 400 && width <= window.innerWidth && 
          height >= 300 && height <= window.innerHeight) {
        windowWidth = width;
        windowHeight = height;
      }
      // 验证位置是否有效
      if (left !== undefined && top !== undefined) {
        savedLeft = left;
        savedTop = top;
      }
    }
  } catch (error) {
    console.warn('读取窗口状态缓存失败:', error);
  }
  
  // 创建文件夹窗口容器
  const windowContainer = document.createElement('div');
  windowContainer.id = windowId;
  windowContainer.style.position = 'absolute'; // 修改为absolute以适应relative父容器
  windowContainer.style.background = 'rgba(15, 32, 82, 0.5)';
  windowContainer.style.border = '1px solid #3a3a5a';
  windowContainer.style.borderRadius = '8px';
  windowContainer.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)';
  windowContainer.style.width = windowWidth + 'px';
  windowContainer.style.height = windowHeight + 'px';
  windowContainer.style.display = 'flex';
  windowContainer.style.flexDirection = 'column';
  // 使用动态z-index
  currentZIndex++;
  windowContainer.style.zIndex = currentZIndex;
  windowContainer.style.backdropFilter = 'blur(10px)';
  
  // 添加点击事件，使窗口在被点击时置于顶层并更新活动窗口状态
  windowContainer.addEventListener('mousedown', function(e) {
    // 确保点击的不是正在拖动或调整大小的操作
    if (!isDragging && !resizeInProgress) {
      currentZIndex++;
      windowContainer.style.zIndex = currentZIndex;
      // 更新当前活动窗口ID
      currentActiveWindowId = windowId;
      // console.log('更新活动窗口ID:', currentActiveWindowId);
      // 给窗口添加焦点样式标记
      windowContainer.dataset.hasFocus = 'true';
    }
  });
  
  // 保留窗口点击更新活动窗口ID的功能，但移除焦点相关逻辑
  // 点击窗口时自动更新活动窗口ID（兼容现有代码）
  
  // 计算初始位置，确保不超出页面边界
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 20;
  
  // 优先使用从localStorage读取的位置，如果有
  let left = savedLeft !== null ? savedLeft : (viewportWidth - windowWidth) / 2;
  let top = savedTop !== null ? savedTop : (viewportHeight - windowHeight) / 2;
  
  // 确保窗口不会超出页面边缘
  left = Math.max(padding, Math.min(left, viewportWidth - windowWidth - padding));
  top = Math.max(padding, Math.min(top, viewportHeight - windowHeight - padding));
  
  windowContainer.style.left = left + 'px';
  windowContainer.style.top = top + 'px';
  
  // 窗口标题栏
  const titleBar = document.createElement('div');
  titleBar.style.height = '32px';
  titleBar.style.background = 'rgba(14, 9, 39, 0.8)';
  titleBar.style.borderTopLeftRadius = '8px';
  titleBar.style.borderTopRightRadius = '8px';
  titleBar.style.display = 'flex';
  titleBar.style.alignItems = 'center';
  titleBar.style.justifyContent = 'space-between';
  titleBar.style.padding = '0 10px';
  titleBar.style.cursor = 'move';
  
  // 左侧标题区域容器
  const titleArea = document.createElement('div');
  titleArea.style.display = 'flex';
  titleArea.style.alignItems = 'center';
  titleArea.style.gap = '8px';
    
  // 优先使用传入的图标URL，其次尝试根据URL获取对应图标，最后使用默认图标
  let iconUrl = 'deskdata/img/i.png'; // 默认图标
  
  try {
    // 首先检查并使用直接传入的图标URL
    if (icon && typeof icon === 'string' && icon.trim() !== '') {
      iconUrl = icon.trim();
      // console.log('使用直接传入的图标URL:', iconUrl);
    }
    // 然后尝试根据URL获取对应图标
    else if (getIconForUrl(url)) {
      iconUrl = getIconForUrl(url);
      // console.log('使用基于URL的图标:', iconUrl);
    } else {
      // console.log('使用默认图标:', iconUrl);
    }
    
    // 验证图标URL的有效性
    if (iconUrl !== 'deskdata/img/i.png') {
      // console.log('验证图标URL是否为相对路径:', iconUrl.startsWith('http') ? '否' : '是');
      // console.log('验证图标URL是否包含有效扩展名:', /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(iconUrl));
    }
  } catch (error) {
    console.error('图标URL处理出错:', error);
    iconUrl = 'deskdata/img/i.png';
  }
  
  // 创建并设置窗口图标，确保使用自身的图片参数
  // console.log('开始创建iframe窗口图标元素...');
  const windowIcon = document.createElement('img');
  
  // 设置基本属性
  windowIcon.id = `window-icon-${windowId}`;
  windowIcon.alt = `${title || '网页查看'} - 窗口图标`;
  
  // 直接设置src为iconUrl，确保使用自身图片
  // console.log('直接设置图标src为:', iconUrl);
  windowIcon.src = iconUrl;
  
  // 设置强制可见样式
  windowIcon.style.cssText = `
    width: 20px !important;
    height: 20px !important;
    object-fit: contain !important;
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    margin-right: 5px !important;
    border: none !important;
    background: none !important;
    z-index: 9999 !important;
    position: relative !important;
  `;
  
  // 存储窗口图标信息，以便托盘使用
  // console.log('存储窗口图标信息:', windowId, iconUrl);
  setWindowIcon(windowId, iconUrl);
  
  // 添加更可靠的事件监听器
  windowIcon.addEventListener('load', function() {
    // 加载成功后再次确认样式
    this.style.display = 'inline-block';
    this.style.visibility = 'visible';
    this.style.opacity = '1';
  });
  
  windowIcon.addEventListener('error', function(event) {
    console.error('❌ iframe窗口图标加载失败:', iconUrl);
    console.error('错误事件:', event.type, event);
    // 尝试使用默认图标作为后备
    try {
      this.src = 'deskdata/img/i.png';
      // console.log('切换到默认图标');
      // 更新存储的图标信息
      setWindowIcon(windowId, 'deskdata/img/i.png');
    } catch (e) {
      console.error('设置默认图标也失败:', e);
    }
  });
  
  // 强制刷新DOM
  setTimeout(() => {
    const iconElement = document.getElementById(`window-icon-${windowId}`);
    if (iconElement) {
     // console.log('确认图标元素存在于DOM中');
      // 触发重排以确保图标可见
      iconElement.style.display = 'none';
      void iconElement.offsetWidth; // 触发重排
      iconElement.style.display = 'inline-block';
    } else {
      console.warn('图标元素未在DOM中找到');
    }
  }, 100);
  
  // 窗口标题
  const windowTitle = document.createElement('div');
  windowTitle.style.color = 'white';
  windowTitle.style.fontSize = '14px';
  windowTitle.style.fontWeight = 'bold';
  windowTitle.textContent = title || '网页查看';
  
  // 将图标和标题添加到标题区域
  titleArea.appendChild(windowIcon);
  titleArea.appendChild(windowTitle);
  
  // 按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.alignItems = 'center';
  
  // 刷新按钮
  const refreshButton = document.createElement('div');
  refreshButton.style.width = '40px';
  refreshButton.style.height = '20px';
  refreshButton.style.background = '#388eff';
  refreshButton.style.borderRadius = '4px';
  refreshButton.style.display = 'flex';
  refreshButton.style.alignItems = 'center';
  refreshButton.style.justifyContent = 'center';
  refreshButton.style.color = 'white';
  refreshButton.style.fontSize = '12px';
  refreshButton.style.cursor = 'pointer';
  refreshButton.style.marginRight = '5px';
  refreshButton.textContent = '刷新';
  refreshButton.title = '刷新页面';

  // 刷新按钮点击事件
  refreshButton.addEventListener('click', function(e) {
    e.stopPropagation(); // 阻止事件冒泡
    // 显示加载指示器
    loadingIndicator.style.display = 'block';
    // 刷新iframe
    iframe.src = iframe.src;
  });

  // 最小化按钮
  const minimizeButton = document.createElement('div');
  minimizeButton.style.width = '40px';
  minimizeButton.style.height = '20px';
  minimizeButton.style.background = '#ffbd2e';
  minimizeButton.style.borderRadius = '4px';
  minimizeButton.style.display = 'flex';
  minimizeButton.style.alignItems = 'center';
  minimizeButton.style.justifyContent = 'center';
  minimizeButton.style.color = 'white';
  minimizeButton.style.fontSize = '12px';
  minimizeButton.style.cursor = 'pointer';
  minimizeButton.style.marginRight = '5px';
  minimizeButton.textContent = '缩小';
  
  // 最小化按钮点击事件
  minimizeButton.addEventListener('click', function(e) {
    e.stopPropagation(); // 阻止事件冒泡
    
    // 确保托盘系统已初始化
    initializeTraySystem();
    ensureTrayExists();
    
    // 将窗口添加到托盘
    addToTray(windowId, title || '网页查看', windowContainer);
    
    // 隐藏窗口
    windowContainer.style.display = 'none';
    
    // 更新窗口状态为在托盘
    if (activeWindows[windowId]) {
      activeWindows[windowId].inTray = true;
    }
  });
  
  // 关闭按钮
  const closeButton = document.createElement('div');
  closeButton.style.width = '40px';
  closeButton.style.height = '20px';
  closeButton.style.background = '#ff5f56';
  closeButton.style.borderRadius = '4px';
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '12px';
  closeButton.style.cursor = 'pointer';
  closeButton.textContent = '关闭';
  closeButton.style.marginRight = '5px';
  
  // 关闭按钮点击事件，包含定时器清理
  closeButton.addEventListener('click', function() {
    // 保存窗口状态到localStorage
    if (!windowState.isMaximized) {
      try {
        const currentWidth = parseInt(windowContainer.style.width);
        const currentHeight = parseInt(windowContainer.style.height);
        const currentLeft = parseInt(windowContainer.style.left);
        const currentTop = parseInt(windowContainer.style.top);
        
        // 验证数值有效性
        if (!isNaN(currentWidth) && !isNaN(currentHeight) && 
            !isNaN(currentLeft) && !isNaN(currentTop)) {
          // 为URL创建一个稳定的标识符
          const urlKey = url.replace(/[^a-z0-9]/gi, '_').substring(0, 100);
          localStorage.setItem(`url-window-state-${urlKey}`, JSON.stringify({
            width: currentWidth,
            height: currentHeight,
            left: currentLeft,
            top: currentTop
          }));
        }
      } catch (error) {
        console.warn('保存窗口状态失败:', error);
      }
    }
    
    if (checkInterval) {
      clearInterval(checkInterval);
    }
    // 从activeWindows中移除
    delete activeWindows[windowId];
    // 从托盘移除（如果在托盘里）
    removeFromTray(windowId);
    if (windowContainer.parentNode) {
    windowContainer.parentNode.removeChild(windowContainer);
  } else {
   // console.warn('窗口容器没有父节点，无法移除');
  }
  });
  
  // 创建按钮容器
  // 重复 const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.alignItems = 'center';
  
  buttonContainer.appendChild(refreshButton);
  buttonContainer.appendChild(minimizeButton);
  buttonContainer.appendChild(closeButton);
  
  titleBar.appendChild(titleArea);
  titleBar.appendChild(buttonContainer);
  
  // 内容区域 - 使用iframe
  const contentArea = document.createElement('div');
  contentArea.style.flex = '1';
  contentArea.style.position = 'relative';
  
  // 创建iframe
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '0 0 8px 8px';
  iframe.style.backgroundColor = 'white';
  
  // 添加加载状态指示器
  const loadingIndicator = document.createElement('div');
  loadingIndicator.style.position = 'absolute';
  loadingIndicator.style.top = '50%';
  loadingIndicator.style.left = '50%';
  loadingIndicator.style.transform = 'translate(-50%, -50%)';
  loadingIndicator.style.background = 'rgba(0, 0, 0, 0.7)';
  loadingIndicator.style.color = 'white';
  loadingIndicator.style.padding = '10px 20px';
  loadingIndicator.style.borderRadius = '5px';
  loadingIndicator.style.zIndex = '10';
  loadingIndicator.textContent = '加载中...';
  
  contentArea.appendChild(iframe);
  contentArea.appendChild(loadingIndicator);
  
  // 监听iframe加载完成事件
  iframe.addEventListener('load', function() {
    // 隐藏加载指示器
    loadingIndicator.style.display = 'none';
  });
  
  // 更可靠的方法：使用setInterval轮询检测iframe的活动状态
  let lastActiveTime = Date.now();
  let checkInterval;
  
  // 尝试在iframe加载完成后添加内部点击事件监听器
  iframe.addEventListener('load', function() {
    // 隐藏加载指示器
    loadingIndicator.style.display = 'none';
    
    try {
      // 尝试直接访问iframe内容并添加点击事件
      if (iframe.contentWindow && iframe.contentWindow.document) {
        // 添加点击事件到iframe内容文档
        iframe.contentWindow.document.addEventListener('click', function() {
          // 将窗口置于顶层
          currentZIndex++;
          windowContainer.style.zIndex = currentZIndex;
          lastActiveTime = Date.now();
        });
        
        // 添加mousedown事件作为补充
        iframe.contentWindow.document.addEventListener('mousedown', function() {
          // 将窗口置于顶层
          currentZIndex++;
          windowContainer.style.zIndex = currentZIndex;
          lastActiveTime = Date.now();
        });
      }
    } catch (e) {
      console.warn('无法直接访问iframe内容，可能存在跨域限制:', e);
    }
    
    // 启动轮询检测
    if (!checkInterval) {
      checkInterval = setInterval(function() {
        try {
          // 检查iframe是否有焦点或活动
          if (document.activeElement === iframe || 
              (iframe.contentWindow && document.activeElement === iframe.contentWindow.document.activeElement)) {
            lastActiveTime = Date.now();
            // 将窗口置于顶层
            currentZIndex++;
            windowContainer.style.zIndex = currentZIndex;
          }
        } catch (e) {
          // 忽略跨域错误
        }
      }, 200); // 每200毫秒检查一次
    }
  });
  
  // 确保iframe可以获取焦点
  iframe.setAttribute('tabindex', '-1');
  
  // 作为后备，直接在iframe上添加事件
  iframe.addEventListener('mousedown', function() {
    // 将窗口置于顶层
    currentZIndex++;
    windowContainer.style.zIndex = currentZIndex;
    lastActiveTime = Date.now();
  });
  
  // 清理代码已在closeButton初始定义时添加
  
  // 窗口右下角调整大小的手柄
  const resizeHandle = document.createElement('div');
  resizeHandle.style.position = 'absolute';
  resizeHandle.style.bottom = '0';
  resizeHandle.style.right = '0';
  resizeHandle.style.width = '30px';
  resizeHandle.style.height = '30px';
  resizeHandle.style.cursor = 'se-resize';
  resizeHandle.style.background = 'rgba(66, 153, 225, 0.3)';
  resizeHandle.style.borderTop = '1px solid rgba(66, 153, 225, 0.5)';
  resizeHandle.style.borderLeft = '1px solid rgba(66, 153, 225, 0.5)';
  resizeHandle.style.borderRadius = '4px 0 0 0';
  resizeHandle.style.boxShadow = '0 0 8px rgba(66, 153, 225, 0.8)';
  resizeHandle.style.zIndex = '100';
  
  // 添加窗口元素
  windowContainer.appendChild(titleBar);
  windowContainer.appendChild(contentArea);
  windowContainer.appendChild(resizeHandle);
  
  // 尝试将窗口添加到相对定位的容器中，使用更宽松的选择器
  let targetContainer = document.querySelector('div.relative.h-full');
  
  // 如果找不到，尝试其他可能的容器
  if (!targetContainer) {
    targetContainer = document.querySelector('div.flex-1.h-full');
  }
  
  if (!targetContainer) {
    targetContainer = document.querySelector('div.relative');
  }
  
  // 如果找到指定的容器，将窗口添加到其中
  if (targetContainer) {
   // console.log('将网页窗口添加到找到的相对定位容器中');
    targetContainer.appendChild(windowContainer);
  } else {
   // console.log('未找到合适的相对定位容器，将网页窗口添加到body中');
    document.body.appendChild(windowContainer);
  }
  
  // 记录窗口信息
  activeWindows[windowId] = {
    id: windowId,
    type: 'url',
    url: url,
    title: title || '网页查看',
    iconId: iconId, // 存储图标ID以区分不同图标打开的相同URL
    element: windowContainer,
    inTray: false
  };
  
  // 实现窗口拖动功能
  let isDragging = false;
  let offsetX, offsetY;
  let resizeInProgress = false;
  // 存储窗口原始状态
  let windowState = {
    isMaximized: false,
    originalWidth: windowWidth,
    originalHeight: windowHeight,
    originalLeft: left,
    originalTop: top
  };
  
  titleBar.addEventListener('mousedown', function(e) {
    // 确保点击的不是关闭按钮或调整大小手柄
    if (e.target === closeButton || e.target === resizeHandle) return;
    
    // 如果窗口处于最大化状态，先恢复到正常大小
    if (windowState.isMaximized) {
      windowState.isMaximized = false;
      
      const padding = 20;
      const newLeft = Math.max(padding, e.clientX - offsetX);
      const newTop = Math.max(padding, e.clientY - offsetY);
      
      windowContainer.style.left = newLeft + 'px';
      windowContainer.style.top = newTop + 'px';
      windowContainer.style.width = windowState.originalWidth + 'px';
      windowContainer.style.height = windowState.originalHeight + 'px';
    }
    
    isDragging = true;
    const rect = windowContainer.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // 拖动时将窗口置于顶层
    currentZIndex++;
    windowContainer.style.zIndex = currentZIndex;
    document.body.style.cursor = 'move';
    
    // 禁用页面滚动
    document.body.style.overflow = 'hidden';
    
    // 临时禁用iframe的事件捕获，防止鼠标移进iframe时失去控制
    if (iframe) {
      iframe.style.pointerEvents = 'none';
    }
    
    // 添加事件监听器（每次点击标题栏时重新添加）
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
  });
  
  // 双击标题栏实现最大化/还原
  titleBar.addEventListener('dblclick', function(e) {
    // 确保点击的不是关闭按钮
    if (e.target === closeButton) return;
    
    const padding = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (!windowState.isMaximized) {
      // 保存当前状态并最大化
      windowState.isMaximized = true;
      windowState.originalWidth = parseInt(windowContainer.style.width);
      windowState.originalHeight = parseInt(windowContainer.style.height);
      windowState.originalLeft = parseInt(windowContainer.style.left);
      windowState.originalTop = parseInt(windowContainer.style.top);
      
      // 设置为最大化状态
      windowContainer.style.left = '65px';
      windowContainer.style.top = '0px';
      windowContainer.style.width = viewportWidth-65 + 'px';
      windowContainer.style.height = viewportHeight + 'px';
    } else {
      // 还原窗口
      windowState.isMaximized = false;
      
      windowContainer.style.left = windowState.originalLeft + 'px';
      windowContainer.style.top = windowState.originalTop + 'px';
      windowContainer.style.width = windowState.originalWidth + 'px';
      windowContainer.style.height = windowState.originalHeight + 'px';
    }
  });
  
  function handleMouseMove(e) {
    if (!isDragging) return;
    
    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;
    
    // 限制窗口不超出页面边界
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const windowWidth = windowContainer.offsetWidth;
    const windowHeight = windowContainer.offsetHeight;
    const padding = 10;
    
    const maxLeft = viewportWidth - windowWidth - padding;
    const maxTop = viewportHeight - windowHeight - padding;
    
    newLeft = Math.max(padding, Math.min(newLeft, maxLeft));
    newTop = Math.max(padding, Math.min(newTop, maxTop));
    
    windowContainer.style.left = newLeft + 'px';
    windowContainer.style.top = newTop + 'px';
  }
  
  function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = '';
    // 恢复页面滚动
    document.body.style.overflow = '';
    
    // 恢复iframe的事件捕获
    if (iframe) {
      iframe.style.pointerEvents = 'auto';
    }
    
    // 移除事件监听器
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mouseleave', handleMouseUp);
    
    // 只有非最大化状态下才更新原始位置
    if (!windowState.isMaximized) {
      // 获取当前窗口位置和大小
      const currentLeft = parseInt(windowContainer.style.left);
      const currentTop = parseInt(windowContainer.style.top);
      
      // 更新原始位置
      windowState.originalLeft = currentLeft;
      windowState.originalTop = currentTop;
      
      // 保存窗口位置到localStorage
      try {
        const currentWidth = parseInt(windowContainer.style.width);
        const currentHeight = parseInt(windowContainer.style.height);
        
        // 验证数值有效性
        if (!isNaN(currentWidth) && !isNaN(currentHeight) && 
            !isNaN(currentLeft) && !isNaN(currentTop)) {
          // 为URL创建一个稳定的标识符
          const urlKey = url.replace(/[^a-z0-9]/gi, '_').substring(0, 100);
          localStorage.setItem(`url-window-state-${urlKey}`, JSON.stringify({
            width: currentWidth,
            height: currentHeight,
            left: currentLeft,
            top: currentTop
          }));
        }
      } catch (error) {
        console.warn('保存窗口位置失败:', error);
      }
    }
  }
  
  // 事件监听器现在在标题栏的mousedown事件中添加
  
  // 调整窗口大小的功能
  resizeHandle.addEventListener('mousedown', function(e) {
    // 确保这个事件不会触发其他事件
    e.stopPropagation();
    e.preventDefault();
    
    resizeInProgress = true;
    
    // 如果窗口处于最大化状态，先恢复到正常大小
    if (windowState.isMaximized) {
      windowState.isMaximized = false;
      
      windowContainer.style.left = windowState.originalLeft + 'px';
      windowContainer.style.top = windowState.originalTop + 'px';
      windowContainer.style.width = windowState.originalWidth + 'px';
      windowContainer.style.height = windowState.originalHeight + 'px';
    }
    
    // 调整大小时将窗口置于顶层
    currentZIndex++;
    windowContainer.style.zIndex = currentZIndex;
    
    // 保存初始状态
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowContainer.offsetWidth;
    const startHeight = windowContainer.offsetHeight;
    const minWidth = 400; // 增大最小宽度
    const minHeight = 300; // 增大最小高度
    
    // 临时禁用iframe的事件捕获，防止鼠标移进iframe时失去控制
    if (iframe) {
      iframe.style.pointerEvents = 'none';
    }
    
    function resize(e) {
      // 计算新的宽高
      let newWidth = startWidth + (e.clientX - startX);
      let newHeight = startHeight + (e.clientY - startY);
      
      // 限制最小尺寸
      newWidth = Math.max(newWidth, minWidth);
      newHeight = Math.max(newHeight, minHeight);
      
      // 限制最大尺寸（基于视口）
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 10;
      
      const currentLeft = parseInt(windowContainer.style.left) || 0;
      const currentTop = parseInt(windowContainer.style.top) || 0;
      
      const maxWidth = viewportWidth - currentLeft - padding;
      const maxHeight = viewportHeight - currentTop - padding;
      
      newWidth = Math.min(newWidth, maxWidth);
      newHeight = Math.min(newHeight, maxHeight);
      
      newWidth = Math.max(newWidth, minWidth);
      newHeight = Math.max(newHeight, minHeight);
      
      windowContainer.style.width = newWidth + 'px';
      windowContainer.style.height = newHeight + 'px';
    }
    
    function stopResize() {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
      document.removeEventListener('mouseleave', stopResize);
      
      // 只有非最大化状态下才保存窗口大小
    if (!windowState.isMaximized) {
      try {
        const currentWidth = parseInt(windowContainer.style.width);
        const currentHeight = parseInt(windowContainer.style.height);
        const currentLeft = parseInt(windowContainer.style.left);
        const currentTop = parseInt(windowContainer.style.top);
        
        if (!isNaN(currentWidth) && !isNaN(currentHeight)) {
          windowState.originalWidth = currentWidth;
          windowState.originalHeight = currentHeight;
        }
        
        // 保存窗口状态到localStorage
        if (!isNaN(currentWidth) && !isNaN(currentHeight) && 
            !isNaN(currentLeft) && !isNaN(currentTop)) {
          const urlKey = url.replace(/[^a-z0-9]/gi, '_').substring(0, 100);
          localStorage.setItem(`url-window-state-${urlKey}`, JSON.stringify({
            width: currentWidth,
            height: currentHeight,
            left: currentLeft,
            top: currentTop
          }));
        }
      } catch (error) {
        console.warn('保存窗口状态失败:', error);
      }
    }
      
      // 恢复iframe的事件捕获
      if (iframe) {
        iframe.style.pointerEvents = 'auto';
      }
      
      document.body.style.cursor = '';
      document.body.style.overflow = '';
      resizeInProgress = false;
    }
    
    document.body.style.cursor = 'se-resize';
    document.body.style.overflow = 'hidden';
    
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('mouseleave', stopResize);
  });
}

// 显示右键菜单
function showContextMenu(e, item) {
  e.preventDefault();
  
  const contextMenu = createContextMenu();
  
  // 清空现有菜单项
  contextMenu.innerHTML = '';
  
  // 添加背景效果
  const backgroundEffect = document.createElement('div');
  backgroundEffect.style.position = 'absolute';
  backgroundEffect.style.top = '0';
  backgroundEffect.style.left = '0';
  backgroundEffect.style.right = '0';
  backgroundEffect.style.height = '100%';
  backgroundEffect.style.background = 'linear-gradient(45deg, transparent 0%, rgba(66, 153, 225, 0.05) 50%, transparent 100%)';
  backgroundEffect.style.zIndex = '-1';
  contextMenu.appendChild(backgroundEffect);
  
  // 定义菜单项文本
  const menuTexts = ['内网URL ', '公网URL ', '备用  1', '备用  2', '备用  3'];
  
  // 定义对应的URL属性
  const urlProperties = ['内网跳转URL', '外网跳转URL', '备用URL1', '备用URL2', '备用URL3'];
  
  // 先检查是否有任何有效的URL
  let hasValidUrl = false;
  for (let i = 0; i < urlProperties.length; i++) {
    const url = item[urlProperties[i]];
    if (url && url.trim()) {
      hasValidUrl = true;
      break;
    }
  }
  
  // 如果没有任何有效URL，显示提示信息
  if (!hasValidUrl) {
    const noLinkItem = document.createElement('div');
    noLinkItem.className = 'context-menu-item';
    noLinkItem.style.padding = '10px 15px';
    noLinkItem.style.color = '#999999';
    noLinkItem.style.fontSize = '13px';
    noLinkItem.style.cursor = 'default';
    noLinkItem.style.position = 'relative';
    noLinkItem.style.whiteSpace = 'nowrap';
    noLinkItem.style.textAlign = 'center';
    noLinkItem.textContent = '没有设置连接';
    contextMenu.appendChild(noLinkItem);
  } else {
    // 创建菜单项 - 只添加有有效URL的项
    menuTexts.forEach((text, index) => {
      const url = item[urlProperties[index]];
      // 只有当URL存在且不为空时才创建菜单项
      if (url && url.trim()) {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.style.padding = '10px 15px';
        menuItem.style.color = '#e0e0ff';
        menuItem.style.fontSize = '13px';
        menuItem.style.cursor = 'default'; // 修改为default，不作为点击区域
        menuItem.style.transition = 'all 0.2s ease';
        menuItem.style.position = 'relative';
        menuItem.style.whiteSpace = 'nowrap';
        menuItem.style.display = 'flex';
        menuItem.style.justifyContent = 'space-between';
        menuItem.style.alignItems = 'center';
        
        // 添加发光效果的伪元素
        const glowEffect = document.createElement('div');
        glowEffect.style.position = 'absolute';
        glowEffect.style.left = '0';
        glowEffect.style.top = '0';
        glowEffect.style.bottom = '0';
        glowEffect.style.width = '3px';
        glowEffect.style.background = '#4299e1';
        glowEffect.style.boxShadow = '0 0 10px #4299e1';
        glowEffect.style.opacity = '0';
        glowEffect.style.transition = 'opacity 0.2s ease';
        menuItem.appendChild(glowEffect);
        
        // 添加文本内容 - 仅作为标题显示
        const textSpan = document.createElement('span');
        textSpan.style.marginLeft = '5px';
        textSpan.style.marginRight = '5px';
        textSpan.textContent = text;
        menuItem.appendChild(textSpan);
        
        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '8px';
        
        // 创建[新窗]按钮
        const newWindowButton = document.createElement('button');
        newWindowButton.style.background = 'rgba(66, 153, 225, 0.3)';
        newWindowButton.style.border = '1px solid #4299e1';
        newWindowButton.style.borderRadius = '4px';
        newWindowButton.style.color = '#ffffff';
        newWindowButton.style.fontSize = '13px';
        newWindowButton.style.padding = '4px 6px';
        newWindowButton.style.cursor = 'pointer';
        newWindowButton.style.transition = 'all 0.2s ease';
        newWindowButton.textContent = '新窗';
        newWindowButton.title = '在新窗口打开链接';
        
        // 新窗按钮点击事件
        newWindowButton.addEventListener('click', function(e) {
          e.stopPropagation();
          window.open(url, '_blank');
          contextMenu.style.display = 'none';
        });
        
        // 创建[页内]按钮
        const innerPageButton = document.createElement('button');
        innerPageButton.style.background = 'rgba(66, 153, 225, 0.3)';
        innerPageButton.style.border = '1px solid #4299e1';
        innerPageButton.style.borderRadius = '4px';
        innerPageButton.style.color = '#ffffff';
        innerPageButton.style.fontSize = '13px';
        innerPageButton.style.padding = '4px 6px';
        innerPageButton.style.cursor = 'pointer';
        innerPageButton.style.transition = 'all 0.2s ease';
        innerPageButton.textContent = '页内';
        innerPageButton.title = '在本页面内打开链接';
        
        // 页内按钮点击事件
        innerPageButton.addEventListener('click', function(e) {
          e.stopPropagation();
          // 确定图标URL，优先使用本地图片URL，其次使用图片URL
          let iconUrl = '';
          if (item["本地图片URL"] && typeof item["本地图片URL"] === 'string' && item["本地图片URL"].trim() !== '') {
            iconUrl = item["本地图片URL"].trim();
          } else if (item["图片URL"] && typeof item["图片URL"] === 'string' && item["图片URL"].trim() !== '') {
            iconUrl = item["图片URL"].trim();
          }
          openUrlInWindow(url, item["标题"] + ' - ' + text, iconUrl, item.id);
          contextMenu.style.display = 'none';
        });
        
        // 按钮悬停效果
        const setupButtonHover = (button) => {
          button.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(66, 153, 225, 0.5)';
            this.style.transform = 'scale(1.05)';
          });
          
          button.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(66, 153, 225, 0.3)';
            this.style.transform = 'scale(1)';
          });
        };
        
        setupButtonHover(newWindowButton);
        setupButtonHover(innerPageButton);
        
        // 将按钮添加到容器
        buttonContainer.appendChild(newWindowButton);
        buttonContainer.appendChild(innerPageButton);
        
        // 将按钮容器添加到菜单项
        menuItem.appendChild(buttonContainer);
        
        // 添加悬停效果
        menuItem.addEventListener('mouseenter', function() {
          this.style.background = 'rgba(66, 153, 225, 0.2)';
          glowEffect.style.opacity = '1';
          this.style.color = '#ffffff';
        });
        
        menuItem.addEventListener('mouseleave', function() {
          this.style.background = 'transparent';
          glowEffect.style.opacity = '0';
          this.style.color = '#e0e0ff';
        });
        
        // 移除菜单项本身的点击事件，菜单项不再作为按钮
        
        contextMenu.appendChild(menuItem);
      }
    });
  }
  
  // 设置菜单位置
  let x = e.clientX;
  let y = e.clientY;
  
  // 先临时设置位置并显示菜单，这样可以获取准确的尺寸
  contextMenu.style.left = '0px';
  contextMenu.style.top = '-1000px'; // 临时放在屏幕外
  contextMenu.style.display = 'block';
  
  // 使用requestAnimationFrame确保菜单项完全渲染后再计算位置
  requestAnimationFrame(() => {
    // 重新计算位置
    let calculatedX = e.clientX;
    let calculatedY = e.clientY;
    
    // 确保菜单不超出屏幕
    // 处理右侧和底部超出的情况
    if (calculatedX + contextMenu.offsetWidth > window.innerWidth) {
      // 如果右侧空间不足，将菜单显示在鼠标左侧
      calculatedX = e.clientX - contextMenu.offsetWidth;
    }
    
    if (calculatedY + contextMenu.offsetHeight > window.innerHeight) {
      // 如果底部空间不足，将菜单显示在鼠标上方
      calculatedY = e.clientY - contextMenu.offsetHeight;
    }
    
    // 确保菜单不会显示在屏幕左侧和顶部之外
    calculatedX = Math.max(5, calculatedX); // 左侧留出5px边距
    calculatedY = Math.max(5, calculatedY); // 顶边留出5px边距
    
    // 设置最终位置
    contextMenu.style.left = calculatedX + 'px';
    contextMenu.style.top = calculatedY + 'px';
  });
}


// 查找目标元素函数
function findTargetElement() {
  const targetDivs = document.querySelectorAll('.box-border.flex.size-full.flex-col.flex-wrap.place-content-start.items-start.py-base-loose');
  return targetDivs.length > 0 ? targetDivs[targetDivs.length - 1] : null;
}

// 处理数据函数
function processData() {
  if (!globalData) {
    console.error('数据未加载，无法处理');
    return;
  }
  ////////////////////////////登录后隐层备案信息
 const loginBeian = document.getElementById('LoginBeian');
if (loginBeian) {
  loginBeian.remove();
  }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////处理壁纸
  // 读取fnstyle.json获取壁纸设置
  fetch('deskdata/fnstyle.json')
    .then(response => response.json())
    .then(data => {
      if (data.desktopWallpaper && data.desktopWallpaper !== '/static/bg/wallpaper-1.webp') {
        // 定期查找元素直到替换成功
        const interval = setInterval(() => {
          const objectContainElements = document.querySelectorAll('.object-contain');
          let replaced = false;
          
          objectContainElements.forEach(element => {
            const img = element.querySelector('img');
            if (img) {
              img.src = data.desktopWallpaper;
              replaced = true;
            }
          });
          
          // 如果找到了并替换了元素，清除定时器
          if (replaced) {
            clearInterval(interval);
          }
        }, 100); // 每隔100ms检查一次
      }
    })
    .catch(error => console.error('读取fnstyle.json失败:', error));
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////处理隐藏
  // 读取fnstyle.json获取sysicoDisplay字段，隐藏对应的图标
  fetch('deskdata/fnstyle.json')
    .then(response => response.json())
    .then(data => {
      if (data.sysicoDisplay) {
        // 用逗号分割sysicoDisplay字段
        const itemsToHide = data.sysicoDisplay.split(',').map(item => item.trim()).filter(item => item);
        
        // 遍历每一项，查找并隐藏对应的图标
        itemsToHide.forEach(itemName => {
          // 查找class有text-base且title符合该项的div
          const targetDivs = document.querySelectorAll('.text-base');
          targetDivs.forEach(div => {
            if (div.title === itemName) {
              // 定位到div的父级的父级元素并删除
              const grandparent = div.parentElement?.parentElement;
              if (grandparent) {
                grandparent.remove();
              }
            }
          });
        });
      }
    })
    .catch(error => console.error('读取fnstyle.json失败:', error));
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////处理排序
  // 筛选归属为0的记录，并根据配置决定排序方式
  // 根据iconSort值决定排序方式
  const itemsToAdd = globalData.filter(item => item["归属"] === 0).sort((a, b) => iconSort === 1 ? a["序号"] - b["序号"] : b["序号"] - a["序号"]);
  
  // 找到目标div元素
  const targetDiv = findTargetElement();
  if (!targetDiv) {
    console.error('未找到目标div元素');
    return;
  }
  
  // 为每个归属为0的记录创建HTML并添加到目标div
  itemsToAdd.forEach(item => {
    // 创建包裹元素
    // 创建主容器，完全按照提供的HTML样式
    const itemWrapper = document.createElement('div');
    itemWrapper.className = 'flex h-[124px] w-[130px] cursor-pointer flex-col items-center justify-center gap-4';
    
    // 添加点击事件处理
    itemWrapper.addEventListener('click', async function() {
      // 判断是否是文件夹
      if (item["类型"] === 1) {
        // 打开文件夹窗口
        openFolderWindow(item, globalData);
      } else {
        // 网站类型，使用优化后的URL选择策略
        let targetUrl = null;
        
        // 先检查是否已有优化后的URL
        if (optimizedUrls.has(item.id)) {
          targetUrl = optimizedUrls.get(item.id);
        } else {
          // 默认使用外网URL（如果有）
          if (item["外网跳转URL"] && item["外网跳转URL"].trim()) {
            targetUrl = item["外网跳转URL"];
          } 
          // 否则尝试内网URL
          else if (item["内网跳转URL"] && item["内网跳转URL"].trim()) {
            targetUrl = item["内网跳转URL"];
          }
          
          // 如果都没有，尝试备用URLs
          if (!targetUrl) {
            const backupUrls = [item["备用URL1"], item["备用URL2"], item["备用URL3"]];
            for (const url of backupUrls) {
              if (url && url.trim()) {
                targetUrl = url;
                break;
              }
            }
          }
        }
        
        // 如果找到可用URL，根据图标记录的OpenInPage字段决定打开方式
        if (targetUrl) {
          if (item["OpenInPage"] ===1 ) {
            // 确定图标URL，优先使用本地图片URL，其次使用图片URL
            let iconUrl = '';
            if (item["本地图片URL"] && typeof item["本地图片URL"] === 'string' && item["本地图片URL"].trim() !== '') {
              iconUrl = item["本地图片URL"].trim();
            } else if (item["图片URL"] && typeof item["图片URL"] === 'string' && item["图片URL"].trim() !== '') {
              iconUrl = item["图片URL"].trim();
            }
            openUrlInWindow(targetUrl, item["标题"], iconUrl, item.id);
          } else {
            window.open(targetUrl, '_blank');
          }
        }
      }
    });
    
    // 添加右键菜单事件
    itemWrapper.addEventListener('contextmenu', function(e) {
      // 判断是否是文件夹
      if (item["类型"] === 1) {
        // 文件夹类型显示文件夹菜单
        showFolderContextMenu(e, item, globalData);
      } else {
        // 网站类型显示普通右键菜单
        showContextMenu(e, item);
      }
    });
    
    // 创建图片容器部分
    const flexRowContainer = document.createElement('div');
    flexRowContainer.className = 'flex shrink-0 flex-row items-center overflow-hidden';
    
    const sizeContainer = document.createElement('div');
    sizeContainer.className = 'size-[80px] p-[15%] box-border !h-[50px] !w-[50px] !p-0';
    
    const semiImageDiv = document.createElement('div');
    semiImageDiv.className = 'semi-image size-full';
    
    // 创建图片元素，使用json数据中的图片URL
    const image = document.createElement('img');
    image.src = item["本地图片URL"] || item["图片URL"];
    image.dataSrc = item["本地图片URL"] || item["图片URL"];
    image.alt = item["标题"];
    image.className = 'semi-image-img w-full h-full !rounded-[10%]';
    image.style.userSelect = 'none';
    image.style.pointerEvents = 'none';
    
    // 嵌套图片容器
    semiImageDiv.appendChild(image);
    sizeContainer.appendChild(semiImageDiv);
    flexRowContainer.appendChild(sizeContainer);
    
    // 创建标题容器部分
    const titleContainer = document.createElement('div');
    titleContainer.className = 'flex h-base-loose shrink-0 items-center justify-center gap-x-2.5 self-stretch px-2.5';
    
    const title = document.createElement('div');
    title.className = 'line-clamp-1 max-w-[112px] shrink-0 whitespace-normal text-center align-top text-base font-bold leading-5 text-white';
    title.title = item["标题"];
    title.textContent = item["标题"];
    title.style.textShadow = 'rgba(0, 0, 0, 0.2) 0px 1px 6px, rgba(0, 0, 0, 0.5) 0px 0px 4px';
    
    // 将标题添加到容器
    titleContainer.appendChild(title);
    
    // 将所有容器添加到主容器
    itemWrapper.appendChild(flexRowContainer);
    itemWrapper.appendChild(titleContainer);
    
    // 将包裹元素添加到目标div
    targetDiv.appendChild(itemWrapper);
  });
  
  console.log(`成功添加了 ${itemsToAdd.length} 个归属为桌面的记录`);
}

// 异步检测内网连通性并优化URL
async function optimizeUrls(data) {
  // 筛选网站类型的项目
  const websiteItems = data.filter(item => item["类型"] === 0);
  
  // 使用Promise.all并行处理多个ping请求
  const pingPromises = websiteItems.map(async (item) => {
    try {
      // 默认使用外网URL
      let bestUrl = null;
      
      if (item["外网跳转URL"] && item["外网跳转URL"].trim()) {
        bestUrl = item["外网跳转URL"];
      }
      
      // 静默检测内网URL
      if (item["内网跳转URL"] && item["内网跳转URL"].trim()) {
        const isIntranetAccessible = await ping(item["内网跳转URL"]);
        if (isIntranetAccessible) {
          // 内网可达，优先使用内网URL
          bestUrl = item["内网跳转URL"];
        }
      }
      
      // 如果没有找到URL，尝试备用URLs
      if (!bestUrl) {
        const backupUrls = [item["备用URL1"], item["备用URL2"], item["备用URL3"]];
        for (const url of backupUrls) {
          if (url && url.trim()) {
            bestUrl = url;
            break;
          }
        }
      }
      
      // 存储最佳URL
      if (bestUrl) {
        optimizedUrls.set(item.id, bestUrl);
      }
    } catch (error) {
      // 忽略单个ping错误，继续处理其他URL
      console.warn(`优化URL时出错 (ID: ${item.id}):`, error);
    }
  });
  
  // 等待所有ping请求完成
  await Promise.all(pingPromises);
  pingCompleted = true;
  console.log(`URL优化完成，共优化 ${optimizedUrls.size} 个链接`);
}

// 重试初始化函数
function initWithRetry() {
    const targetDiv = findTargetElement();
    if (targetDiv) {
      clearInterval(intervalnasNameDisplay); //清楚设备添加nas名称的定时器
      // 找到目标div，开始处理数据
      processData();
      
      // 开始静默优化URL（不阻塞UI）
      if (globalData && !pingCompleted) {
        optimizeUrls(globalData).catch(err => {
          console.error("URL优化过程中发生错误:", err);
        });
      }
    } else if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(initWithRetry, retryInterval);
    } else {
      console.error("超过最大重试次数（" + maxRetries + "次），仍未找到目标div");
    }
  }
  
  // 等待DOM加载完成并加载数据
  document.addEventListener('DOMContentLoaded', async function() {
    try {
      // 读取data.json文件
      const response = await fetch('deskdata/data.json');
      if (!response.ok) {
        throw new Error('Failed to fetch data.json');
      }
      // 存储数据到全局变量
      globalData = await response.json();
      // 开始重试查找目标元素
      initWithRetry();
      // 初始化特定元素的z-index管理系统
      setupSpecificElementsZIndexManagement();
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    } catch (error) {
      console.error('加载数据时发生错误:', error);
    }
  });
  
  // 添加页面加载性能监控
  window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`页面完全加载时间: ${loadTime.toFixed(2)}ms`);
  });

// URL连通性检测函数
function ping(url, timeout = 2000) {
  // console.log(`开始可达性测试: ${url}, 超时设置: ${timeout}ms`); 
  const startTime = Date.now(); 
  
  return new Promise((resolve) => { 
    // 检查URL是否是HTTP（不安全）且当前页面是HTTPS 
    const isCurrentHttps = window.location.protocol === 'https:';
    const isTargetHttp = url.startsWith('http:'); 
    
    // 如果是混合内容情况，使用XMLHttpRequest作为备用方案
    if (isCurrentHttps && isTargetHttp) {
      // console.log(`检测到混合内容: HTTPS页面尝试访问HTTP资源，将使用XMLHttpRequest`); 
      
      const xhr = new XMLHttpRequest();
      const timeoutId = setTimeout(() => {
        // console.log(`超时: ${url} (${Date.now() - startTime}ms)`);
        xhr.abort();
        resolve(false);
      }, timeout);
      
      xhr.onload = () => {
        clearTimeout(timeoutId);
        // console.log(`可达: ${url}`);
        resolve(true);
      };
      
      xhr.onerror = () => {
        clearTimeout(timeoutId);
        // console.log(`错误: ${url} (${Date.now() - startTime}ms)`);
        // 对于内网资源，即使出错也尝试返回true，因为可能是CORS限制
        if (isInternalIp(url)) {
          // console.log(`内网资源可能可达: ${url}`);
          resolve(true);
        } else {
          resolve(false);
        }
      };
      xhr.ontimeout = () => {
        clearTimeout(timeoutId);
        // console.log(`请求超时: ${url}`);
        resolve(false);
      };
      
      try {
        xhr.open('HEAD', url + '?' + Date.now(), true); // 添加时间戳避免缓存
        xhr.timeout = timeout;
        xhr.send();
      } catch (error) {
        clearTimeout(timeoutId);
        // console.log(`发送请求失败: ${url}, 错误: ${error.message}`);
        resolve(false);
      }
      
      return;
    }
    
    // 正常情况使用fetch 
    const controller = new AbortController(); 
    const timeoutId = setTimeout(() => { 
    //  console.log(`超时: ${url} (${Date.now() - startTime}ms)`); 
      controller.abort(); 
    }, timeout); 
    
    fetch(url, { 
      method: 'HEAD', 
      mode: 'no-cors', 
      signal: controller.signal 
    }) 
    .then(() => { 
      clearTimeout(timeoutId); 
      const duration = Date.now() - startTime; 
      // console.log(`成功: ${url} (${duration}ms)`); 
      resolve(true); // 成功连接 
    }) 
    .catch((error) => { 
      clearTimeout(timeoutId); 
      const duration = Date.now() - startTime; 
      // console.log(`错误: ${url} (${duration}ms), 错误类型: ${error.name || '未知错误'}`); 
      
      // 对于网络错误，尝试使用XMLHttpRequest作为备用
      if (error.name === 'TypeError' || error.name === 'AbortError') {
        // console.log(`尝试使用XMLHttpRequest作为备用: ${url}`);
        fallbackWithXHR(url, timeout - (duration))
          .then(result => resolve(result));
      } else {
        resolve(false); // 连接失败 
      }
    });
  }); 
}

// XMLHttpRequest备用检测函数
function fallbackWithXHR(url, remainingTimeout) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    const fallbackTimeoutId = setTimeout(() => {
      xhr.abort();
      resolve(false);
    }, remainingTimeout > 0 ? remainingTimeout : 1000);
    
    xhr.onload = () => {
      clearTimeout(fallbackTimeoutId);
      resolve(true);
    };
    
    xhr.onerror = () => {
      clearTimeout(fallbackTimeoutId);
      // 对于内网资源，即使出错也尝试返回true，因为可能是CORS限制
      if (isInternalIp(url)) {
        // console.log(`内网资源可能可达: ${url}`);
        resolve(true);
      } else {
        resolve(false);
      }
    };
    
    xhr.ontimeout = () => {
      clearTimeout(fallbackTimeoutId);
      resolve(false);
    };
    
    try {
      xhr.open('HEAD', url + '&fallback=' + Date.now(), true);
      xhr.timeout = remainingTimeout > 0 ? remainingTimeout : 1000;
      xhr.send();
    } catch (e) {
      clearTimeout(fallbackTimeoutId);
      // 对于内网资源，即使捕获到异常也尝试返回true
      if (isInternalIp(url)) {
        resolve(true);
      } else {
        resolve(false);
      }
    }
  });
}

// 打开文件夹窗口函数
function openFolderWindow(folderItem, allData) {
  const windowId = `folder-window-${folderItem.id}`;
  
  // 更新当前活动窗口ID
  currentActiveWindowId = windowId;
  // console.log('文件夹窗口激活，ID:', currentActiveWindowId);
  
  // 后续代码中将为文件夹窗口添加相同的焦点管理逻辑
  
  // 检查activeWindows中是否存在相同文件夹的窗口
  for (const existingWindowId in activeWindows) {
    const winInfo = activeWindows[existingWindowId];
    // 检查是否是文件夹窗口且ID相同
    if (winInfo.type === 'folder' && winInfo.folderId === folderItem.id) {
      // 如果窗口在托盘里，从托盘还原
      if (winInfo.inTray) {
        restoreFromTray(existingWindowId);
      } else {
        // 修改：如果窗口已存在且不在托盘，将其最小化
        const winElement = document.getElementById(existingWindowId);
        if (winElement) {
          // 确保托盘系统已初始化
          initializeTraySystem();
          ensureTrayExists();
          
          // 将窗口添加到托盘
          addToTray(existingWindowId, folderItem["标题"], winElement);
          
          // 隐藏窗口
          winElement.style.display = 'none';
          
          // 更新窗口状态为在托盘
          activeWindows[existingWindowId].inTray = true;
        }
      }
      return; // 阻止创建新窗口
    }
  }
  
  // 尝试从localStorage读取窗口大小和位置
  let windowWidth = 500; // 默认宽度
  let windowHeight = 500; // 默认高度
  let savedLeft = null;
  let savedTop = null;
  
  try {
    const savedWindowState = localStorage.getItem(`folder-window-state-${folderItem.id}`);
    if (savedWindowState) {
      const { width, height, left, top } = JSON.parse(savedWindowState);
      // 验证大小是否有效
      if (width >= 300 && width <= window.innerWidth && 
          height >= 150 && height <= window.innerHeight) {
        windowWidth = width;
        windowHeight = height;
      }
      // 验证位置是否有效
      if (left !== undefined && top !== undefined) {
        savedLeft = left;
        savedTop = top;
      }
    }
  } catch (error) {
    console.warn('读取窗口状态缓存失败:', error);
  }
  
  // 创建文件夹窗口容器
  const windowContainer = document.createElement('div');
  windowContainer.id = windowId;
  windowContainer.style.position = 'fixed';
  windowContainer.style.background = 'rgba(15, 32, 82, 0.5)';
  windowContainer.style.border = '1px solid #3a3a5a';
  windowContainer.style.borderRadius = '8px';
  windowContainer.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)';
  windowContainer.style.width = windowWidth + 'px';
  windowContainer.style.height = windowHeight + 'px';
  windowContainer.style.display = 'flex';
  windowContainer.style.flexDirection = 'column';
  // 使用动态z-index
  currentZIndex++;
  windowContainer.style.zIndex = currentZIndex;
  windowContainer.style.backdropFilter = 'blur(10px)';
  
  // 添加点击事件，使窗口在被点击时置于顶层
  windowContainer.addEventListener('mousedown', function(e) {
    // 确保点击的不是正在拖动或调整大小的操作
    if (!isDragging && !resizeInProgress) {
      currentZIndex++;
      windowContainer.style.zIndex = currentZIndex;
    }
  });
  
  // 计算初始位置，确保不超出页面边界
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 20;
  
  // 使用保存的位置或默认居中位置
  let left = savedLeft !== null ? savedLeft : (viewportWidth - windowWidth) / 2;
  let top = savedTop !== null ? savedTop : (viewportHeight - windowHeight) / 2;
  
  // 确保窗口不会超出页面边缘
  left = Math.max(padding, Math.min(left, viewportWidth - windowWidth - padding));
  top = Math.max(padding, Math.min(top, viewportHeight - windowHeight - padding));
  
  windowContainer.style.left = left + 'px';
  windowContainer.style.top = top + 'px';
  
  // 窗口标题栏
  const titleBar = document.createElement('div');
  titleBar.style.height = '32px';
  titleBar.style.background = 'rgba(14, 9, 39, 0.8)';
  titleBar.style.borderTopLeftRadius = '8px';
  titleBar.style.borderTopRightRadius = '8px';
  titleBar.style.display = 'flex';
  titleBar.style.alignItems = 'center';
  titleBar.style.justifyContent = 'space-between';
  titleBar.style.padding = '0 10px';
  titleBar.style.cursor = 'move';
  
  // 修改标题栏为flex布局，使标题和关闭按钮分别在左侧和右侧
  titleBar.style.display = 'flex';
  titleBar.style.justifyContent = 'space-between';
  titleBar.style.alignItems = 'center';
  
  // 窗口标题
  const windowTitle = document.createElement('div');
  windowTitle.style.color = 'white';
  windowTitle.style.fontSize = '14px';
  windowTitle.style.fontWeight = 'bold';
  windowTitle.textContent = folderItem["标题"];
  
  // 创建标题区域容器
  const titleArea = document.createElement('div');
  titleArea.style.display = 'flex';
  titleArea.style.alignItems = 'center';
    
  // 优先使用本地图片URL，其次使用图片URL，最后使用默认图标
  let iconUrl = 'deskdata/img/i.png'; // 默认图标
  
  try {
    // 首先检查并使用本地图片URL
    if (folderItem["本地图片URL"] && typeof folderItem["本地图片URL"] === 'string' && folderItem["本地图片URL"].trim() !== '') {
      iconUrl = folderItem["本地图片URL"].trim();
      // console.log('使用本地图片URL作为窗口图标:', iconUrl);
    }
    // 如果没有本地图片URL，则使用图片URL
    else if (folderItem["图片URL"] && typeof folderItem["图片URL"] === 'string' && folderItem["图片URL"].trim() !== '') {
      iconUrl = folderItem["图片URL"].trim();
      // console.log('使用图片URL作为窗口图标:', iconUrl);
    } else {
      // console.log('使用默认图标:', iconUrl);
    }
    
    // 验证图标URL的有效性
    if (iconUrl !== 'deskdata/img/i.png') {
      // console.log('验证图标URL是否为相对路径:', iconUrl.startsWith('http') ? '否' : '是');
      // console.log('验证图标URL是否包含有效扩展名:', /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(iconUrl));
    }
  } catch (error) {
    console.error('图标URL处理出错:', error);
    iconUrl = 'deskdata/img/i.png';
  }
  
  // 直接创建并设置窗口图标，确保使用自身的图片参数
  // console.log('开始创建窗口图标元素...');
  const windowIcon = document.createElement('img');
  
  // 设置基本属性
  windowIcon.id = `window-icon-${windowId}`;
  windowIcon.alt = `${folderItem["标题"]} - 窗口图标`;
  
  // 直接设置src为iconUrl，确保使用自身图片
  // console.log('直接设置图标src为:', iconUrl);
  windowIcon.src = iconUrl;
  
  // 设置强制可见样式
  windowIcon.style.cssText = `
    width: 20px !important;
    height: 20px !important;
    margin-right: 8px !important;
    object-fit: contain !important;
    border: none !important;
    background: none !important;
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    z-index: 9999 !important;
    position: relative !important;
    pointer-events: auto !important;
  `;
  
  // 存储窗口图标信息
  // console.log('存储窗口图标信息:', windowId, iconUrl);
  setWindowIcon(windowId, iconUrl);
  
  // 添加更可靠的事件监听器
  windowIcon.addEventListener('load', function() {
    // console.log('✅ 图标加载成功:', iconUrl);
    // console.log('图标尺寸:', this.width, '关闭', this.height);
    // 加载成功后再次确认样式
    this.style.display = 'inline-block';
    this.style.visibility = 'visible';
    this.style.opacity = '1';
  });
  
  windowIcon.addEventListener('error', function(event) {
    console.error('❌ 图标加载失败:', iconUrl);
    console.error('错误事件:', event.type, event);
    // 尝试使用默认图标作为后备
    try {
      this.src = 'deskdata/img/i.png';
      // console.log('切换到默认图标');
      // 更新存储的图标信息
      setWindowIcon(windowId, 'deskdata/img/i.png');
    } catch (e) {
      console.error('设置默认图标也失败:', e);
    }
  });
  
  // 确保图标元素被正确添加到DOM中
  // console.log('添加图标到标题区域...');
  
  // 清空标题区域，确保没有冲突元素
  while (titleArea.firstChild) {
    titleArea.removeChild(titleArea.firstChild);
  }
  
  // 先添加图标，再添加标题
  titleArea.appendChild(windowIcon);
  titleArea.appendChild(windowTitle);
  
  // 强制刷新DOM
  setTimeout(() => {
    const iconElement = document.getElementById(`window-icon-${windowId}`);
    if (iconElement) {
      // console.log('图标元素在DOM中找到，重新确认样式');
      iconElement.style.display = 'inline-block';
      iconElement.style.visibility = 'visible';
      iconElement.style.opacity = '1';
      // 强制重绘
      iconElement.offsetHeight; // 触发重排
    } else {
      console.error('图标元素未在DOM中找到');
    }
  }, 100);
    
  // 最小化按钮
  const minimizeButton = document.createElement('div');
  minimizeButton.style.width = '40px';
  minimizeButton.style.height = '20px';
  minimizeButton.style.background = '#ffbd2e';
  minimizeButton.style.borderRadius = '4px';
  minimizeButton.style.display = 'flex';
  minimizeButton.style.alignItems = 'center';
  minimizeButton.style.justifyContent = 'center';
  minimizeButton.style.color = 'white';
  minimizeButton.style.fontSize = '12px';
  minimizeButton.style.cursor = 'pointer';
  minimizeButton.style.marginRight = '5px';
  minimizeButton.textContent = '缩小';
  
  // 最小化按钮点击事件
  minimizeButton.addEventListener('click', function(e) {
    e.stopPropagation(); // 阻止事件冒泡
    
    // 确保托盘系统已初始化
    initializeTraySystem();
    ensureTrayExists();
    
    // 将窗口添加到托盘
    addToTray(windowId, folderItem["标题"], windowContainer);
    
    // 隐藏窗口
    windowContainer.style.display = 'none';
    
    // 更新窗口状态为在托盘
    if (activeWindows[windowId]) {
      activeWindows[windowId].inTray = true;
    }
  });
  
  // 关闭按钮
  const closeButton = document.createElement('div');
  closeButton.style.width = '40px';
  closeButton.style.height = '20px';
  closeButton.style.background = '#ff5f56';
  closeButton.style.borderRadius = '4px'; // 稍微圆角更美观
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '12px';
  closeButton.style.cursor = 'pointer';
  closeButton.textContent = '关闭'; // 使用乘号替代字母X
  closeButton.style.marginRight = '5px'; // 右边距
  
  closeButton.addEventListener('click', function() {
    // 从托盘移除窗口（如果存在）
    removeFromTray(windowId);
    // 从activeWindows中移除
    delete activeWindows[windowId];
    if (windowContainer.parentNode) {
      windowContainer.parentNode.removeChild(windowContainer);
    } else {
     // console.warn('窗口容器没有父节点，无法移除');
    }
  });
  
  // 创建按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.alignItems = 'center';
  
  buttonContainer.appendChild(minimizeButton);
  buttonContainer.appendChild(closeButton);
  
  titleBar.appendChild(titleArea);
  titleBar.appendChild(buttonContainer);
  
  // 内容区域
  const contentArea = document.createElement('div');
  contentArea.style.flex = '1';
  contentArea.style.padding = '15px';
  contentArea.style.overflow = 'auto';
  contentArea.style.display = 'grid';
  contentArea.style.gridTemplateColumns = 'repeat(auto-fill, 80px)';
  contentArea.style.gridAutoRows = '100px';
  contentArea.style.gap = '15px';
  contentArea.style.justifyContent = 'start';
  contentArea.style.alignContent = 'start';
  
  // 添加点击事件监听器，当点击内容区域时将窗口置于顶层
  contentArea.addEventListener('click', function() {
    // 将窗口置于顶层
    currentZIndex++;
    windowContainer.style.zIndex = currentZIndex;
  });
  
  // 添加mousedown事件监听器作为补充，确保点击子元素时也能置顶
  contentArea.addEventListener('mousedown', function() {
    // 将窗口置于顶层
    currentZIndex++;
    windowContainer.style.zIndex = currentZIndex;
  });
  
  // 窗口右下角调整大小的手柄
  const resizeHandle = document.createElement('div');
  resizeHandle.style.position = 'absolute';
  resizeHandle.style.bottom = '0';
  resizeHandle.style.right = '0';
  resizeHandle.style.width = '30px';
  resizeHandle.style.height = '30px';
  resizeHandle.style.cursor = 'se-resize';
  resizeHandle.style.background = 'rgba(66, 153, 225, 0.3)';
  resizeHandle.style.borderTop = '1px solid rgba(66, 153, 225, 0.5)';
  resizeHandle.style.borderLeft = '1px solid rgba(66, 153, 225, 0.5)';
  resizeHandle.style.borderRadius = '4px 0 0 0';
  resizeHandle.style.boxShadow = '0 0 8px rgba(66, 153, 225, 0.8)';
  resizeHandle.style.zIndex = '100';
  resizeHandle.style.pointerEvents = 'all'; // 确保可以接收所有鼠标事件
  
  // 添加窗口元素
  windowContainer.appendChild(titleBar);
  windowContainer.appendChild(contentArea);
  windowContainer.appendChild(resizeHandle);
  
  // 尝试将窗口添加到相对定位的容器中，使用更宽松的选择器
  let targetContainer = document.querySelector('div.relative.h-full');
  
  // 如果找不到，尝试其他可能的容器
  if (!targetContainer) {
    targetContainer = document.querySelector('div.flex-1.h-full');
  }
  
  if (!targetContainer) {
    targetContainer = document.querySelector('div.relative');
  }
  
  // 如果找到指定的容器，将窗口添加到其中
  if (targetContainer) {
  //  console.log('将文件夹窗口添加到找到的相对定位容器中');
    targetContainer.appendChild(windowContainer);
  } else {
   // console.log('未找到合适的相对定位容器，将文件夹窗口添加到body中');
    document.body.appendChild(windowContainer);
  }
  
  // 记录窗口信息到activeWindows
  activeWindows[windowId] = {
    id: windowId,
    type: 'folder',
    folderId: folderItem.id,
    title: folderItem["标题"],
    element: windowContainer,
    inTray: false
  };
  
  // 获取归属该文件夹的记录并按序号降序排序
  const folderItems = allData.filter(item => item["归属"] === folderItem.id).sort((a, b) => iconSort === 1 ? a["序号"] - b["序号"] : b["序号"] - a["序号"]);
  // 添加文件夹内容
  folderItems.forEach(item => {
    const itemElement = createFolderItemElement(item, allData);
    contentArea.appendChild(itemElement);
  });
  
  // 实现窗口拖动功能
  let isDragging = false;
  let offsetX, offsetY;
  let resizeInProgress = false;
  // 存储窗口原始状态，用于最大化/还原
  let windowState = {
    isMaximized: false,
    originalWidth: windowWidth,
    originalHeight: windowHeight,
    originalLeft: left,
    originalTop: top
  };
  
  titleBar.addEventListener('mousedown', function(e) {
    // 确保点击的不是关闭按钮或调整大小手柄
    if (e.target === closeButton || e.target === resizeHandle) return;
    
    // 如果窗口处于最大化状态，先恢复到正常大小
    if (windowState.isMaximized) {
      windowState.isMaximized = false;
      
      const padding = 20;
      // 计算基于点击位置的还原位置
      const newLeft = Math.max(padding, e.clientX - offsetX);
      const newTop = Math.max(padding, e.clientY - offsetY);
      
      windowContainer.style.left = newLeft + 'px';
      windowContainer.style.top = newTop + 'px';
      windowContainer.style.width = windowState.originalWidth + 'px';
      windowContainer.style.height = windowState.originalHeight + 'px';
      
      // 更新内容区域大小
      contentArea.style.width = (windowState.originalWidth - 30) + 'px';
      contentArea.style.height = (windowState.originalHeight - 60) + 'px';
    }
    
    isDragging = true;
    const rect = windowContainer.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // 拖动时将窗口置于顶层
    currentZIndex++;
    windowContainer.style.zIndex = currentZIndex;
    document.body.style.cursor = 'move';
    
    // 禁用页面滚动
    document.body.style.overflow = 'hidden';
    
    // 临时禁用内容区域的事件捕获，防止鼠标移进内容区域时失去控制
    if (contentArea) {
      contentArea.style.pointerEvents = 'none';
    }
    
    // 添加事件监听器（每次点击标题栏时重新添加）
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
  });
  
  // 双击标题栏实现最大化/还原
  titleBar.addEventListener('dblclick', function(e) {
    // 确保点击的不是关闭按钮
    if (e.target === closeButton) return;
    
    const padding = 20; // 窗口边距
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (!windowState.isMaximized) {
      // 保存当前状态并最大化
      windowState.isMaximized = true;
      windowState.originalWidth = parseInt(windowContainer.style.width);
      windowState.originalHeight = parseInt(windowContainer.style.height);
      windowState.originalLeft = parseInt(windowContainer.style.left);
      windowState.originalTop = parseInt(windowContainer.style.top);
      
      // 设置为最大化状态
      windowContainer.style.left = '65px';
      windowContainer.style.top =  '0px';
      windowContainer.style.width = viewportWidth-65 + 'px';
      windowContainer.style.height = viewportHeight + 'px';
      
      // 更新内容区域大小
      contentArea.style.width = (viewportWidth - 30) + 'px';
      contentArea.style.height = (viewportHeight - 60) + 'px';
    } else {
      // 还原窗口
      windowState.isMaximized = false;
      
      windowContainer.style.left = windowState.originalLeft + 'px';
      windowContainer.style.top = windowState.originalTop + 'px';
      windowContainer.style.width = windowState.originalWidth + 'px';
      windowContainer.style.height = windowState.originalHeight + 'px';
      
      // 更新内容区域大小
      contentArea.style.width = (windowState.originalWidth - 30) + 'px';
      contentArea.style.height = (windowState.originalHeight - 60) + 'px';
    }
  });
  
  function handleMouseMove(e) {
    if (!isDragging) return;
    
    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;
    
    // 限制窗口不超出页面边界
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const windowWidth = windowContainer.offsetWidth;
    const windowHeight = windowContainer.offsetHeight;
    const padding = 10;
    
    // 计算最大可移动位置
    const maxLeft = viewportWidth - windowWidth - padding;
    const maxTop = viewportHeight - windowHeight - padding;
    
    // 确保窗口不会超出任何边界
    newLeft = Math.max(padding, Math.min(newLeft, maxLeft));
    newTop = Math.max(padding, Math.min(newTop, maxTop));
    
    windowContainer.style.left = newLeft + 'px';
    windowContainer.style.top = newTop + 'px';
  }
  
  function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = '';
    // 恢复页面滚动
    document.body.style.overflow = '';
    
    // 恢复内容区域的事件捕获
    if (contentArea) {
      contentArea.style.pointerEvents = 'auto';
    }
    
    // 移除事件监听器
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mouseleave', handleMouseUp);
    
    // 只有非最大化状态下才更新原始位置并保存到localStorage
    if (!windowState.isMaximized) {
      const currentLeft = parseInt(windowContainer.style.left);
      const currentTop = parseInt(windowContainer.style.top);
      windowState.originalLeft = currentLeft;
      windowState.originalTop = currentTop;
      
      // 保存窗口位置到localStorage
      try {
        const currentWidth = parseInt(windowContainer.style.width);
        const currentHeight = parseInt(windowContainer.style.height);
        if (!isNaN(currentWidth) && !isNaN(currentHeight) && !isNaN(currentLeft) && !isNaN(currentTop)) {
          localStorage.setItem(`folder-window-state-${folderItem.id}`, JSON.stringify({
            width: currentWidth,
            height: currentHeight,
            left: currentLeft,
            top: currentTop
          }));
        }
      } catch (error) {
        console.warn('保存窗口位置失败:', error);
      }
    }
  }
  
  // 事件监听器现在在标题栏的mousedown事件中添加
  
  // 调整窗口大小的功能
  resizeHandle.addEventListener('mousedown', function(e) {
    // 确保这个事件不会触发其他事件
    e.stopPropagation();
    e.preventDefault();
    
    // 标记正在调整大小
    resizeInProgress = true;
    
    // 如果窗口处于最大化状态，先恢复到正常大小
    if (windowState.isMaximized) {
      windowState.isMaximized = false;
      
      windowContainer.style.left = windowState.originalLeft + 'px';
      windowContainer.style.top = windowState.originalTop + 'px';
      windowContainer.style.width = windowState.originalWidth + 'px';
      windowContainer.style.height = windowState.originalHeight + 'px';
      
      // 更新内容区域大小
      contentArea.style.width = (windowState.originalWidth - 30) + 'px';
      contentArea.style.height = (windowState.originalHeight - 60) + 'px';
    }
    
    // 临时禁用内容区域的事件捕获，防止鼠标移进内容区域时失去控制
    if (contentArea) {
      contentArea.style.pointerEvents = 'none';
    }
    
    // 调整大小时将窗口置于顶层
    currentZIndex++;
    windowContainer.style.zIndex = currentZIndex;
    
    // 保存初始状态
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowContainer.offsetWidth;
    const startHeight = windowContainer.offsetHeight;
    const minWidth = 320;
    const minHeight = 150;
    
    // 使用更简单的边界处理逻辑
    function resize(e) {
      // 计算新的宽高，直接基于鼠标移动距离
      let newWidth = startWidth + (e.clientX - startX);
      let newHeight = startHeight + (e.clientY - startY);
      
      // 限制最小尺寸
      newWidth = Math.max(newWidth, minWidth);
      newHeight = Math.max(newHeight, minHeight);
      
      // 限制最大尺寸（基于视口）
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 10;
      
      // 获取当前窗口位置
      const currentLeft = parseInt(windowContainer.style.left) || 0;
      const currentTop = parseInt(windowContainer.style.top) || 0;
      
      // 确保不超出右边界
      const maxWidth = viewportWidth - currentLeft - padding;
      newWidth = Math.min(newWidth, maxWidth);
      
      // 确保不超出下边界
      const maxHeight = viewportHeight - currentTop - padding;
      newHeight = Math.min(newHeight, maxHeight);
      
      // 再次确保最小尺寸
      newWidth = Math.max(newWidth, minWidth);
      newHeight = Math.max(newHeight, minHeight);
      
      // 直接应用新的宽高
      windowContainer.style.width = newWidth + 'px';
      windowContainer.style.height = newHeight + 'px';
      
      // 同步更新内容区域
      contentArea.style.width = (newWidth - 30) + 'px';
      contentArea.style.height = (newHeight - 60) + 'px';
    }
    
    function stopResize() {
      // 移除事件监听器
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
      document.removeEventListener('mouseleave', stopResize); // 添加mouseleave以防鼠标移出窗口
      
      // 只有非最大化状态下才保存窗口大小
      if (!windowState.isMaximized) {
        try {
          const currentWidth = parseInt(windowContainer.style.width);
          const currentHeight = parseInt(windowContainer.style.height);
          if (!isNaN(currentWidth) && !isNaN(currentHeight)) {
            localStorage.setItem(`folder-window-state-${folderItem.id}`, JSON.stringify({
              width: currentWidth,
              height: currentHeight,
              left: parseInt(windowContainer.style.left),
              top: parseInt(windowContainer.style.top)
            }));
            
            // 更新原始状态中的宽高
            windowState.originalWidth = currentWidth;
            windowState.originalHeight = currentHeight;
          }
        } catch (error) {
          console.warn('保存窗口大小失败:', error);
        }
      }
      
      // 恢复内容区域的事件捕获
      if (contentArea) {
        contentArea.style.pointerEvents = 'auto';
      }
      
      // 恢复状态
      document.body.style.cursor = '';
      document.body.style.overflow = '';
      
      // 重置调整大小状态
      resizeInProgress = false;
    }
    
    // 设置鼠标样式
    document.body.style.cursor = 'se-resize';
    
    // 禁用页面滚动
    document.body.style.overflow = 'hidden';
    
    // 添加事件监听器
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('mouseleave', stopResize); // 添加mouseleave事件支持
  });

}

// 创建文件夹内的项目元素
function createFolderItemElement(item, allData) {
  const itemElement = document.createElement('div');
  itemElement.style.display = 'flex';
  itemElement.style.flexDirection = 'column';
  itemElement.style.alignItems = 'center';
  itemElement.style.justifyContent = 'center';
  itemElement.style.cursor = 'pointer';
  itemElement.style.padding = '5px';
  itemElement.style.borderRadius = '4px';
  itemElement.style.transition = 'background-color 0.2s';
  
  // 添加悬停效果
  itemElement.addEventListener('mouseenter', function() {
    itemElement.style.background = 'rgba(255, 255, 255, 0.1)';
  });
  
  itemElement.addEventListener('mouseleave', function() {
    itemElement.style.background = 'transparent';
  });
  
  // 创建图片元素
  const imageContainer = document.createElement('div');
  imageContainer.style.width = '60px';
  imageContainer.style.height = '60px';
  imageContainer.style.display = 'flex';
  imageContainer.style.alignItems = 'center';
  imageContainer.style.justifyContent = 'center';
  imageContainer.style.marginBottom = '5px';
  
  const img = document.createElement('img');
  img.src = item["本地图片URL"];
  img.alt = item["标题"];
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  img.style.borderRadius = '8px';
  
  imageContainer.appendChild(img);
  
  // 创建标题元素
  const titleElement = document.createElement('div');
  titleElement.style.color = 'white';
  titleElement.style.fontSize = '12px';
  titleElement.style.textAlign = 'center';
  titleElement.style.lineHeight = '1.2';
  titleElement.style.maxWidth = '70px';
  titleElement.style.wordBreak = 'break-word';
  titleElement.title = item["标题"];
  titleElement.textContent = item["标题"];
  
  // 组合元素
  itemElement.appendChild(imageContainer);
  itemElement.appendChild(titleElement);
  
  // 添加点击事件
  itemElement.addEventListener('click', function() {
    if (item["类型"] === 1) {
      // 子文件夹，递归打开
      openFolderWindow(item, allData);
    } else {
      // 网站类型，使用优化后的URL选择策略
      let targetUrl = null;
      const publicUrl = item["外网跳转URL"] && item["外网跳转URL"].trim();
      const privateUrl = item["内网跳转URL"] && item["内网跳转URL"].trim();
      
      // 先检查是否已有优化后的URL
      if (optimizedUrls.has(item.id)) {
        targetUrl = optimizedUrls.get(item.id);
        // 根据图标记录的OpenInPage字段决定打开方式
        if (item["OpenInPage"] ===1 ) {
          // 确定图标URL，优先使用本地图片URL，其次使用图片URL
          let iconUrl = '';
          if (item["本地图片URL"] && typeof item["本地图片URL"] === 'string' && item["本地图片URL"].trim() !== '') {
            iconUrl = item["本地图片URL"].trim();
          } else if (item["图片URL"] && typeof item["图片URL"] === 'string' && item["图片URL"].trim() !== '') {
            iconUrl = item["图片URL"].trim();
          }
          openUrlInWindow(targetUrl, item["标题"], iconUrl, item.id);
        } else {
          window.open(targetUrl, '_blank');
        }
      } else if (publicUrl && privateUrl) {
        // 异步ping检测内网URL
        ping(privateUrl).then(reachable => {
          if (reachable) {
            // 如果内网可达，更新缓存并提示用户
            optimizedUrls.set(item.id, privateUrl);
            targetUrl = privateUrl;
            console.log(`内网连接已检测到可达，下次访问将使用: ${privateUrl}`);
          } else {
            // 如果内网不可达，确保缓存使用公网URL
            optimizedUrls.set(item.id, publicUrl);
            targetUrl = publicUrl;
          }
          
          // 根据图标记录的OpenInPage字段决定打开方式
          if (targetUrl) {
            if (item["OpenInPage"] ===1 ) {
              // 确定图标URL，优先使用本地图片URL，其次使用图片URL
              let iconUrl = '';
              if (item["本地图片URL"] && typeof item["本地图片URL"] === 'string' && item["本地图片URL"].trim() !== '') {
                iconUrl = item["本地图片URL"].trim();
              } else if (item["图片URL"] && typeof item["图片URL"] === 'string' && item["图片URL"].trim() !== '') {
                iconUrl = item["图片URL"].trim();
              }
              openUrlInWindow(targetUrl, item["标题"], iconUrl, item.id);
            } else {
              window.open(targetUrl, '_blank');
            }
          }
        });
        
        // 确定图标URL，优先使用本地图片URL，其次使用图片URL
        let iconUrl = '';
        if (item["本地图片URL"] && typeof item["本地图片URL"] === 'string' && item["本地图片URL"].trim() !== '') {
          iconUrl = item["本地图片URL"].trim();
        } else if (item["图片URL"] && typeof item["图片URL"] === 'string' && item["图片URL"].trim() !== '') {
          iconUrl = item["图片URL"].trim();
        }
        
        // 同步处理，根据图标记录的OpenInPage字段决定打开方式
        if (item["OpenInPage"] ===1 ) {
          // 优先使用内网URL（如果有）
          targetUrl = privateUrl || publicUrl;
          openUrlInWindow(targetUrl, item["标题"], iconUrl, item.id);
        } else {
          // 确保根据图标记录的OpenInPage字段设置，使用新窗口打开
          window.open(privateUrl || publicUrl, '_blank');
        }
      } else {
        // 默认使用外网URL（如果有）
        if (publicUrl) {
          targetUrl = publicUrl;
        } 
        // 否则尝试内网URL
        else if (privateUrl) {
          targetUrl = privateUrl;
        }
        
        // 如果都没有，尝试备用URLs
        if (!targetUrl) {
          const backupUrls = [item["备用URL1"], item["备用URL2"], item["备用URL3"]];
          for (const url of backupUrls) {
            if (url && url.trim()) {
              targetUrl = url;
              break;
            }
          }
        }
        
        // 缓存并打开最终选择的URL
        if (targetUrl) {
          optimizedUrls.set(item.id, targetUrl);
          // 根据图标记录的OpenInPage字段决定打开方式
          if (item["OpenInPage"] ===1 ) {
            // 确定图标URL，优先使用本地图片URL，其次使用图片URL
            let iconUrl = '';
            if (item["本地图片URL"] && typeof item["本地图片URL"] === 'string' && item["本地图片URL"].trim() !== '') {
              iconUrl = item["本地图片URL"].trim();
            } else if (item["图片URL"] && typeof item["图片URL"] === 'string' && item["图片URL"].trim() !== '') {
              iconUrl = item["图片URL"].trim();
            }
            openUrlInWindow(targetUrl, item["标题"], iconUrl);
          } else {
            window.open(targetUrl, '_blank');
          }
        }
      }
    }
  });
  
  // 添加右键菜单
  itemElement.addEventListener('contextmenu', function(e) {
    if (item["类型"] === 0) {
      // 网站类型显示链接菜单
      showContextMenu(e, item);
    } else if (item["类型"] === 1) {
      // 文件夹类型显示文件夹菜单
      showFolderContextMenu(e, item, allData);
    }
  });
  
  return itemElement;
}

// 显示文件夹右键菜单
function showFolderContextMenu(e, folderItem, allData) {
  e.preventDefault();
  
  const contextMenu = createContextMenu();
  
  // 清空现有菜单项
  contextMenu.innerHTML = '';
  
  // 添加背景效果
  const backgroundEffect = document.createElement('div');
  backgroundEffect.style.position = 'absolute';
  backgroundEffect.style.top = '0';
  backgroundEffect.style.left = '0';
  backgroundEffect.style.right = '0';
  backgroundEffect.style.height = '100%';
  backgroundEffect.style.background = 'linear-gradient(45deg, transparent 0%, rgba(66, 153, 225, 0.05) 50%, transparent 100%)';
  backgroundEffect.style.zIndex = '-1';
  contextMenu.appendChild(backgroundEffect);
  
  // 创建"打开文件夹"菜单项
  const openMenuItem = document.createElement('div');
  openMenuItem.className = 'context-menu-item';
  openMenuItem.style.padding = '10px 15px';
  openMenuItem.style.color = '#e0e0ff';
  openMenuItem.style.fontSize = '13px';
  openMenuItem.style.cursor = 'pointer';
  openMenuItem.style.transition = 'all 0.2s ease';
  openMenuItem.style.position = 'relative';
  openMenuItem.style.whiteSpace = 'nowrap';
  
  // 添加发光效果的伪元素
  const glowEffect = document.createElement('div');
  glowEffect.style.position = 'absolute';
  glowEffect.style.left = '0';
  glowEffect.style.top = '0';
  glowEffect.style.bottom = '0';
  glowEffect.style.width = '3px';
  glowEffect.style.background = '#4299e1';
  glowEffect.style.boxShadow = '0 0 10px #4299e1';
  glowEffect.style.opacity = '0';
  glowEffect.style.transition = 'opacity 0.2s ease';
  openMenuItem.appendChild(glowEffect);
  
  // 添加文本内容
  const textSpan = document.createElement('span');
  textSpan.style.marginLeft = '8px';
  textSpan.textContent = '打开文件夹';
  openMenuItem.appendChild(textSpan);
  
  // 添加悬停效果
  openMenuItem.addEventListener('mouseenter', function() {
    this.style.background = 'rgba(66, 153, 225, 0.2)';
    glowEffect.style.opacity = '1';
    this.style.color = '#ffffff';
  });
  
  openMenuItem.addEventListener('mouseleave', function() {
    this.style.background = 'transparent';
    glowEffect.style.opacity = '0';
    this.style.color = '#e0e0ff';
  });
  
  // 添加点击事件
  openMenuItem.addEventListener('click', function() {
    // 打开文件夹窗口
    openFolderWindow(folderItem, allData);
    contextMenu.style.display = 'none';
  });
  
  contextMenu.appendChild(openMenuItem);
  
  // 设置菜单位置
  let x = e.clientX;
  let y = e.clientY;
  
  // 确保菜单不超出屏幕
  if (x + contextMenu.offsetWidth > window.innerWidth) {
    x = window.innerWidth - contextMenu.offsetWidth - 10;
  }
  if (y + contextMenu.offsetHeight > window.innerHeight) {
    y = window.innerHeight - contextMenu.offsetHeight - 10;
  }
  
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
  contextMenu.style.display = 'block';
}