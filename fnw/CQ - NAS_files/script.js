window.onload = function() {
    const targetSelector = 'div.box-border.flex.size-full.flex-col.flex-wrap.place-content-start.items-start.py-base-loose';
    const maxRetries = 100;
    let retryCount = 0;
    const retryInterval = 1000;
    // 创建右键菜单元素（科技感配色）
    const contextMenu = document.createElement('div');
    contextMenu.id = 'customContextMenu';
    contextMenu.style.cssText = 'position: absolute; display: none; background: #0a1929; border: 1px solid #1e3a5f; border-radius: 8px; padding: 6px 0; z-index: 9999; box-shadow: 0 6px 16px rgba(0, 149, 255, 0.25); min-width: 120px;';
    contextMenu.innerHTML = '<div class="menu-item outer-link" style="padding: 8px 16px; cursor: pointer; transition: all 0.2s; color: #a3bffa; font-size: 14px; font-weight: 500;">外网连接</div><div class="menu-item inner-link" style="padding: 8px 16px; cursor: pointer; transition: all 0.2s; color: #a3bffa; font-size: 14px; font-weight: 500;">内网连接</div>';
    document.body.appendChild(contextMenu);
    // 点击页面其他地方隐藏右键菜单
    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });
    // 右键菜单选项点击事件
    contextMenu.addEventListener('click', (e) => {
        const target = e.target;
        const outerUrl = contextMenu.dataset.outerUrl;
        const innerUrl = contextMenu.dataset.innerUrl;
        if (target.classList.contains('outer-link') && outerUrl) {
            window.open(outerUrl, '_blank');
        } else if (target.classList.contains('inner-link') && innerUrl) {
            window.open(innerUrl, '_blank');
        }
        contextMenu.style.display = 'none';
    });
    // 菜单选项hover效果（科技感）
    contextMenu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('mouseover', () => {
            item.style.background = 'linear-gradient(90deg, #0e2442 0%, #153b5f 100%)';
            item.style.color = '#00ccff';
            item.style.transform = 'translateX(2px)';
        });
        item.addEventListener('mouseout', () => {
            item.style.background = 'transparent';
            item.style.color = '#a3bffa';
            item.style.transform = 'translateX(0)';
        });
    });
    function findTargetElement() {
        return document.querySelector(targetSelector);
    }
    
    // 使用改进的方法检测URL可达性，避免混合内容问题
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

    function processData() {
        fetch("/conf/fnicon.json")
            .then(response => {
                if (!response.ok) throw new Error("JSON文件加载失败");
                return response.json();
            })
            .then(data => {
                const targetDiv = findTargetElement();
                if (!targetDiv) {
                    console.error("最终未找到目标div元素");
                    return;
                }
                
                // 只使用ping功能判断内外网，不再通过IP地址分析
                
                data.sort((a, b) => a.序号 - b.序号);
                
                // 为每个项目创建链接并测试内网URL可达性
                data.forEach(item => {
                    const aTag = document.createElement("a");
                    aTag.target = "_blank";
                    
                    const innerUrl = item["内网跳转URL"];
                    const outerUrl = item["外网跳转URL"];
                    
                    // 默认使用外网URL
                    let defaultUrl = outerUrl;
                    // console.log(`初始设置为外网链接: ${outerUrl}`);
                    
                    // 存储URL到元素数据集，供右键菜单使用
                    aTag.dataset.outerUrl = outerUrl;
                    aTag.dataset.innerUrl = innerUrl;
                    
                    // 设置初始链接为外网
                    aTag.href = defaultUrl;
                    
                    // 设置a标签的样式类，确保正确的布局和尺寸
                    aTag.className = "flex h-[124px] w-[130px] cursor-pointer flex-col items-center justify-center gap-4 no-underline";
                    
                    // 异步测试内网URL可达性
                    if (innerUrl) {
                        ping(innerUrl)
                            .then(isReachable => {
                                if (isReachable) {
                                    // 内网URL可访问，切换为内网链接
                                    aTag.href = innerUrl;
                                    // console.log(`内网链接可达，已切换为内网链接: ${innerUrl}`);
                                } else {
                                    // console.log(`内网链接不可达，保持使用外网链接: ${outerUrl}`);
                                }
                            })
                            .catch(error => {
                                console.error(`测试内网URL可达性时出错: ${error}`);
                                // 出错时保持使用外网链接
                            });
                    }
                    aTag.addEventListener('contextmenu', (e) => {
                        e.preventDefault(); // 阻止默认右键菜单
                        contextMenu.dataset.outerUrl = outerUrl;
                        contextMenu.dataset.innerUrl = innerUrl;
                        const { clientX: x, clientY: y } = e;
                        contextMenu.style.left = x + 'px';
                        contextMenu.style.top = y + 'px';
                        contextMenu.style.display = 'block';
                    });
                    aTag.innerHTML = '<div class="flex shrink-0 flex-row items-center overflow-hidden">' +
                        '<div class="size-[80px] p-[15%] box-border !h-[50px] !w-[50px] !p-0">' +
                        '<div class="semi-image size-full">' +
                        '<img src="' + (item["本地图片URL"] || 'https://fnnas.com/favicon.ico') + '" alt="' + item["标题"].replace(/"/g, '&quot;') + '" class="semi-image-img w-full h-full !rounded-[10%]" style="user-select: none; pointer-events: none;">'+
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="flex h-base-loose shrink-0 items-center justify-center gap-x-2.5 self-stretch px-2.5">' +
                        '<div class="line-clamp-1 text-white" title="' + item["标题"].replace(/"/g, '&quot;') + '" style="text-shadow: rgba(0, 0, 0, 0.2) 0px 1px 6px, rgba(0, 0, 0, 0.5) 0px 0px 4px;font-size: 14px;font-weight: bold;line-height: 1.25;">' + item["标题"] + '</div>' +
                        '</div>';
                    targetDiv.appendChild(aTag);
                });
                // console.log("数据加载完成，共添加", data.length, "条记录");
            })
            .catch(error => console.error("处理数据时出错:", error));
    }
    function initWithRetry() {
        const targetDiv = findTargetElement();
        if (targetDiv) {
            // console.log("找到目标div元素，开始处理数据");
            processData();
        } else if (retryCount < maxRetries) {
            retryCount++;
            // console.log("未找到目标div，将在" + retryInterval + "ms后重试（" + retryCount + "/" + maxRetries + "）");
            setTimeout(initWithRetry, retryInterval);
        } else {
            console.error("超过最大重试次数（" + maxRetries + "次），仍未找到目标div");
        }
    }
    initWithRetry();
};