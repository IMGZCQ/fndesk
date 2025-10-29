// 全局变量存储数据
let globalData = null;
let retryCount = 0;
const maxRetries = 200; // 减少最大重试次数
const retryInterval = 1000; // 减少重试间隔时间
// 存储优化后的URL映射
let optimizedUrls = new Map();
// 记录ping是否已完成
let pingCompleted = false;
// 用于管理窗口层级的全局变量
let currentZIndex = 1000;

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
  contextMenu.style.minWidth = '180px';
  contextMenu.style.padding = '5px 0';
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
  
  // 点击其他地方关闭菜单
  document.addEventListener('click', function() {
    contextMenu.style.display = 'none';
  });
  
  // 阻止右键菜单冒泡
  contextMenu.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
  
  return contextMenu;
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
  const menuTexts = ['内网访问', '外网访问', '备用链接1', '备用链接2', '备用链接3'];
  
  // 定义对应的URL属性
  const urlProperties = ['内网跳转URL', '外网跳转URL', '备用URL1', '备用URL2', '备用URL3'];
  
  // 创建菜单项
  menuTexts.forEach((text, index) => {
    const menuItem = document.createElement('div');
    menuItem.className = 'context-menu-item';
    menuItem.style.padding = '10px 15px';
    menuItem.style.color = '#e0e0ff';
    menuItem.style.fontSize = '13px';
    menuItem.style.cursor = 'pointer';
    menuItem.style.transition = 'all 0.2s ease';
    menuItem.style.position = 'relative';
    menuItem.style.whiteSpace = 'nowrap';
    
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
    
    // 添加文本内容
    const textSpan = document.createElement('span');
    textSpan.style.marginLeft = '8px';
    textSpan.textContent = text;
    menuItem.appendChild(textSpan);
    
    // 设置禁用状态
    const url = item[urlProperties[index]];
    if (!url || !url.trim()) {
      menuItem.style.opacity = '0.5';
      menuItem.style.cursor = 'not-allowed';
    }
    
    // 添加悬停效果
    menuItem.addEventListener('mouseenter', function() {
      if (url && url.trim()) {
        this.style.background = 'rgba(66, 153, 225, 0.2)';
        glowEffect.style.opacity = '1';
        this.style.color = '#ffffff';
      }
    });
    
    menuItem.addEventListener('mouseleave', function() {
      this.style.background = 'transparent';
      glowEffect.style.opacity = '0';
      this.style.color = '#e0e0ff';
    });
    
    // 添加点击事件
    menuItem.addEventListener('click', function() {
      if (url && url.trim()) {
        window.open(url, '_blank');
        contextMenu.style.display = 'none';
      }
    });
    
    contextMenu.appendChild(menuItem);
  });
  
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
  
  // 筛选归属为0的记录
  const itemsToAdd = globalData.filter(item => item["归属"] === 0);
  
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
        
        // 如果找到可用URL，打开新窗口
        if (targetUrl) {
          window.open(targetUrl, '_blank');
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
  
  console.log(`成功添加了 ${itemsToAdd.length} 个归属为0的记录`);
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
    
    // 如果是混合内容情况，我们不能直接fetch，但可以尝试其他方法 
    if (isCurrentHttps && isTargetHttp) { 
      // console.log(`检测到混合内容: HTTPS页面尝试访问HTTP资源，将采用备选方案`); 
      
      // 方案1: 尝试通过创建图片对象来检测可达性（某些情况下可以绕过混合内容限制） 
      const img = new Image(); 
      const timeoutId = setTimeout(() => { 
        // console.log(`超时: ${url} (${Date.now() - startTime}ms)`); 
        resolve(false); 
      }, timeout); 
      
      img.onload = () => { 
        clearTimeout(timeoutId); 
        // console.log(`可达: ${url}`); 
        resolve(true); 
      }; 
      
      img.onerror = () => { 
        clearTimeout(timeoutId); 
        // 图片加载失败不代表完全不可达，可能是因为资源类型不匹配或CORS策略 
        // 这里我们返回true，假设内网资源可能是可达的，让用户可以选择尝试访问 
        // console.log(`图片加载失败，但假设内网可能可达: ${url}`); 
        resolve(true); 
      }; 
      
      // 尝试加载图片（如果URL不是图片，也会触发onerror，但我们将其解释为可能可达） 
      img.src = url + '?' + Date.now(); // 添加时间戳避免缓存 
      
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
      resolve(false); // 连接失败 
    }); 
  }); 
}

// 打开文件夹窗口函数
function openFolderWindow(folderItem, allData) {
  // 检查是否已存在同名窗口
  const existingWindow = document.getElementById(`folder-window-${folderItem.id}`);
  if (existingWindow) {
    // 如果存在，将其置于顶层
    currentZIndex++;
    existingWindow.style.zIndex = currentZIndex;
    return;
  }
  
  // 尝试从localStorage读取窗口大小
  let windowWidth = 500; // 默认宽度
  let windowHeight = 500; // 默认高度
  
  try {
    const savedSize = localStorage.getItem(`folder-window-size-${folderItem.id}`);
    if (savedSize) {
      const { width, height } = JSON.parse(savedSize);
      // 验证大小是否有效
      if (width >= 200 && width <= window.innerWidth && 
          height >= 150 && height <= window.innerHeight) {
        windowWidth = width;
        windowHeight = height;
      }
    }
  } catch (error) {
    console.warn('读取窗口大小缓存失败:', error);
  }
  
  // 创建文件夹窗口容器
  const windowContainer = document.createElement('div');
  windowContainer.id = `folder-window-${folderItem.id}`;
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
  
  // 中心位置，但确保不超出边界
  let left = (viewportWidth - windowWidth) / 2;
  let top = (viewportHeight - windowHeight) / 2;
  
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
  
  // 关闭按钮
  const closeButton = document.createElement('div');
  closeButton.style.width = '20px';
  closeButton.style.height = '20px';
  closeButton.style.background = '#ff5f56';
  closeButton.style.borderRadius = '4px'; // 稍微圆角更美观
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '12px';
  closeButton.style.cursor = 'pointer';
  closeButton.textContent = '×'; // 使用乘号替代字母X
  closeButton.style.marginRight = '5px'; // 右边距
  
  closeButton.addEventListener('click', function() {
    document.body.removeChild(windowContainer);
  });
  
  titleBar.appendChild(windowTitle);
  titleBar.appendChild(closeButton);
  
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
  
  // 添加到页面
  document.body.appendChild(windowContainer);
  
  // 获取归属该文件夹的记录
  const folderItems = allData.filter(item => item["归属"] === folderItem.id);
  
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
  });
  
  // 双击标题栏实现最大化/还原
  titleBar.addEventListener('dblclick', function(e) {
    // 确保点击的不是关闭按钮
    if (e.target === closeButton) return;
    
    const padding = 20; // 窗口边距
    const viewportWidth = window.innerWidth - padding * 2;
    const viewportHeight = window.innerHeight - padding * 2;
    
    if (!windowState.isMaximized) {
      // 保存当前状态并最大化
      windowState.isMaximized = true;
      windowState.originalWidth = parseInt(windowContainer.style.width);
      windowState.originalHeight = parseInt(windowContainer.style.height);
      windowState.originalLeft = parseInt(windowContainer.style.left);
      windowState.originalTop = parseInt(windowContainer.style.top);
      
      // 设置为最大化状态
      windowContainer.style.left = padding + 'px';
      windowContainer.style.top = padding + 'px';
      windowContainer.style.width = viewportWidth + 'px';
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
  
  document.addEventListener('mousemove', function(e) {
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
  });
  
  document.addEventListener('mouseup', function() {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = '';
    // 恢复页面滚动
    document.body.style.overflow = '';
    
    // 只有非最大化状态下才更新原始位置
    if (!windowState.isMaximized) {
      windowState.originalLeft = parseInt(windowContainer.style.left);
      windowState.originalTop = parseInt(windowContainer.style.top);
    }
  });
  
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
    
    // 调整大小时将窗口置于顶层
    currentZIndex++;
    windowContainer.style.zIndex = currentZIndex;
    
    // 保存初始状态
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowContainer.offsetWidth;
    const startHeight = windowContainer.offsetHeight;
    const minWidth = 200;
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
            localStorage.setItem(`folder-window-size-${folderItem.id}`, JSON.stringify({
              width: currentWidth,
              height: currentHeight
            }));
            
            // 更新原始状态中的宽高
            windowState.originalWidth = currentWidth;
            windowState.originalHeight = currentHeight;
          }
        } catch (error) {
          console.warn('保存窗口大小失败:', error);
        }
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
      
      if (targetUrl) {
        window.open(targetUrl, '_blank');
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