// 全局变量
let data = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;
let editingId = null;
let loginStatusChecked = false;

// 页面加载时检查并显示公告（每天首次打开显示一次）
function checkAndShowAnnouncement() {
    const today = new Date().toDateString(); // 获取今天的日期字符串（格式：Wed Oct 11 2023）
    const lastShownDate = localStorage.getItem('lastAnnouncementDate');
    
    // 如果今天还没有显示过公告
    if (lastShownDate !== today) {
        // 显示公告
        setTimeout(() => {
            const announcementModal = document.getElementById('announcementModal');
            if (announcementModal) {
                announcementModal.classList.remove('hidden');
                // 加载公告内容
                if (typeof fetchAnnouncementContent === 'function') {
                    fetchAnnouncementContent();
                }
            }
        }, 500); // 延迟显示，让页面加载完成
        
        // 记录今天的日期
        localStorage.setItem('lastAnnouncementDate', today);
    }
}

// 炫酷科技感通知函数 - 半透明霓虹效果，动态动画
function showNotification(message, type = 'success', persistent = false) {
    // 创建通知容器
    const notification = document.createElement('div');
    notification.className = 'tech-notification';
    
    // 根据类型设置颜色和图标
    const config = {
        success: {
            bgColor: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(2, 132, 199, 0.2))',
            borderColor: '#06b6d4',
            glowColor: '0 0 15px rgba(6, 182, 212, 0.7)',
            icon: '✓'
        },
        error: {
            bgColor: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(202, 38, 38, 0.2))',
            borderColor: '#ef4444',
            glowColor: '0 0 15px rgba(239, 68, 68, 0.7)',
            icon: '✗'
        },
        info: {
            bgColor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
            borderColor: '#3b82f6',
            glowColor: '0 0 15px rgba(59, 130, 246, 0.7)',
            icon: 'ℹ'
        }
    };
    
    const currentConfig = config[type] || config.success;
    
    // 设置样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0.9)',
        padding: '18px 26px',
        borderRadius: '12px',
        background: currentConfig.bgColor,
        color: 'white',
        fontSize: '16px',
        fontWeight: '600',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: `0 10px 30px rgba(0, 0, 0, 0.2), ${currentConfig.glowColor}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `2px solid ${currentConfig.borderColor}`,
        zIndex: '9999',
        opacity: '0',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '280px',
        textAlign: 'center'
    });
    
    // 创建图标容器
    const iconContainer = document.createElement('div');
    Object.assign(iconContainer.style, {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${currentConfig.borderColor}22, transparent 70%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        border: `2px solid ${currentConfig.borderColor}88`,
        flexShrink: '0'
    });
    iconContainer.textContent = currentConfig.icon;
    
    // 创建文本容器
    const textContainer = document.createElement('div');
    textContainer.textContent = message;
    Object.assign(textContainer.style, {
        flexGrow: '1',
        lineHeight: '1.4'
    });
    
    // 组装通知
    notification.appendChild(iconContainer);
    notification.appendChild(textContainer);
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 创建脉动动画效果
    const pulseAnimation = document.createElement('style');
    pulseAnimation.textContent = `
        @keyframes techPulse {
            0% { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), ${currentConfig.glowColor}; }
            50% { box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25), ${currentConfig.glowColor}, 0 0 25px ${currentConfig.borderColor}66; }
            100% { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), ${currentConfig.glowColor}; }
        }
    `;
    document.head.appendChild(pulseAnimation);
    
    // 显示通知
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translate(-50%, -50%) scale(1)';
        notification.style.animation = 'techPulse 2s infinite ease-in-out';
    }, 10);
    
    // 只有非持久通知才会自动消失
    if (!persistent) {
        // 1.8秒后开始淡出（更炫酷的消失动画）
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -50%) scale(0.85) translateY(-10px)';
            notification.style.animation = 'none';
            
            // 动画结束后移除元素
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
                document.head.removeChild(pulseAnimation);
            }, 500);
        }, 2000);
    }
    
    // 返回通知对象，允许外部控制其移除
    return notification;
}

// 修改全局fetch函数，为所有API请求添加认证头
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    // 如果是API请求，添加认证头
    if (url.startsWith('/api/') && url !== '/api/login' && 
        url !== '/api/check-password-file' && url !== '/api/initialize-password') {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            options.headers = options.headers || {};
            if (typeof options.headers === 'string') {
                // 处理headers是字符串的情况
                options.headers += '\n' + 'X-Auth-Token: ' + authToken;
            } else {
                // 处理headers是对象的情况
                options.headers['X-Auth-Token'] = authToken;
            }
        }
    }
    
    // 发送请求
    return originalFetch(url, options).then(response => {
        // 如果响应是401未授权，重定向到登录页面
        if (response.status === 401) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
            return Promise.reject(new Error('未授权'));
        }
        return response;
    });
};

// 检查登录状态 - 添加30分钟过期机制
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    const currentTime = new Date().getTime();
    const thirtyMinutes = 30 * 60 * 1000; // 30分钟，单位毫秒
    
    // 检查是否已登录且未过期
    if (!isLoggedIn || !loginTimestamp || (currentTime - parseInt(loginTimestamp)) > thirtyMinutes) {
        // 登录已过期或未登录，清除登录信息并重定向到登录页
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('authToken');
        localStorage.removeItem('loginTimestamp');
        window.location.href = 'login.html';
        return false;
    }
    
    // 登录有效，更新登录状态
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('authToken', 'authenticated');
    return true;
}

// DOM元素
const dataTableBody = document.getElementById('dataTableBody');
const addBtn = document.getElementById('addBtn');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const closeModal = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const filterType = document.getElementById('filterType');
const filterOwner = document.getElementById('filterOwner');
const filterKeyword = document.getElementById('filterKeyword');
const filterBtn = document.getElementById('filterBtn');
const resetFilterBtn = document.getElementById('resetFilterBtn');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const startItem = document.getElementById('startItem');
const endItem = document.getElementById('endItem');
const totalItems = document.getElementById('totalItems');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');
const notificationIcon = document.getElementById('notificationIcon');
const closeNotification = document.getElementById('closeNotification');
// 新增确认模态框元素
const applyConfigModal = document.getElementById('applyConfigModal');
const cancelApplyBtn = document.getElementById('cancelApplyBtn');
const confirmApplyBtn = document.getElementById('confirmApplyBtn');
const logoutModal = document.getElementById('logoutModal');
const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
const announcementModal = document.getElementById('announcementModal');
const closeAnnouncementBtn = document.getElementById('closeAnnouncementBtn');
const closeAnnouncementFooterBtn = document.getElementById('closeAnnouncementFooterBtn');
const announcementBtn = document.getElementById('announcementBtn');

// 退出登录函数
function logout() {
    logoutModal.classList.remove('hidden');
}

// 确认退出登录
function confirmLogout() {
    try {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('退出登录失败:', error);
        window.location.href = 'login.html';
    }
}



// 初始化
async function init() {
        // 检查登录状态
        if (!checkLoginStatus()) {
            return;
        }
        
        // 从本地缓存加载每页显示条数设置
        const savedPageSize = localStorage.getItem('pageSize');
        if (savedPageSize) {
            // 正确处理"all"的情况
            pageSize = savedPageSize === 'all' ? Infinity : parseInt(savedPageSize);
        }
        
        // 先设置事件监听器，确保按钮功能总是可用
        setupEventListeners();
        
        // 初始化每页显示条数选择器
        initPageSizeSelector();
        
        // 然后加载数据
        await loadData();
        applyFilters();
    }

// 初始化每页显示条数选择器
function initPageSizeSelector() {
    // 检查是否已经存在选择器
    if (document.getElementById('pageSizeSelector')) {
        const selector = document.getElementById('pageSizeSelector');
        // 设置当前选中的值
        selector.value = pageSize === Infinity ? 'all' : pageSize;
        return;
    }
    
    // 创建每页显示条数选择器
    const paginationContainer = prevPage.parentElement;
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'flex items-center ml-auto';
    selectorContainer.innerHTML = `
        <span class="text-sm text-gray-600 mr-2">每页显示：</span>
        <select id="pageSizeSelector" class="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="10">10条</option>
            <option value="20">20条</option>
            <option value="50">50条</option>
            <option value="100">100条</option>
            <option value="all">全部</option>
        </select>
    `;
    
    paginationContainer.appendChild(selectorContainer);
    
    // 设置当前选中的值
    const selector = document.getElementById('pageSizeSelector');
    selector.value = pageSize === Infinity ? 'all' : pageSize;
    
    // 添加事件监听器
    selector.addEventListener('change', handlePageSizeChange);
}

// 处理每页显示条数变化
function handlePageSizeChange() {
    const selector = document.getElementById('pageSizeSelector');
    const selectedSize = selector.value;
    
    // 设置新的每页显示条数
    pageSize = selectedSize === 'all' ? Infinity : parseInt(selectedSize);
    
    // 保存到本地缓存
    localStorage.setItem('pageSize', pageSize === Infinity ? 'all' : pageSize);
    
    // 重置到第一页
    currentPage = 1;
    
    // 重新渲染表格
    renderTable();
    updatePagination();
}

// 加载数据
async function loadData() {
    try {
        // 尝试从API加载数据，添加禁用缓存的设置
        const response = await fetch('/api/data', {
            headers: {
                'x-auth-token': 'authenticated',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            cache: 'no-store'
        });
        if (response.ok) {
            const apiData = await response.json();
            // 即使数据为空也接受，以支持删除最后一条记录的情况
            if (Array.isArray(apiData)) {
                data = apiData;
                // 确保数据按序号排序（如果有数据）
                if (data.length > 0) {
                    data.sort((a, b) => parseInt(a.序号) - parseInt(b.序号));
                }
                
                // 生成下拉选项
                generateDropdownOptions();
                return;
            }
        }
        
        // 如果API失败或没有返回数组，尝试直接从文件加载（用于静态环境）
        const staticResponse = await fetch('deskdata/data.json', {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            cache: 'no-store'
        });
        if (staticResponse.ok) {
            const staticData = await staticResponse.json();
            // 即使数据为空也接受
            if (Array.isArray(staticData)) {
                data = staticData;
                // 确保数据按序号排序（如果有数据）
                if (data.length > 0) {
                    data.sort((a, b) => parseInt(a.序号) - parseInt(b.序号));
                }
                
                // 生成下拉选项
                generateDropdownOptions();
                showNotification('从静态文件加载数据成功', 'info');
                return;
            }
        }
        
        // 如果静态文件也失败，尝试从localStorage加载
        const localData = localStorage.getItem('deskData');
        if (localData) {
            try {
                const parsedLocalData = JSON.parse(localData);
                if (Array.isArray(parsedLocalData)) {
                    data = parsedLocalData;
                    // 确保数据按序号排序（如果有数据）
                    if (data.length > 0) {
                        data.sort((a, b) => parseInt(a.序号) - parseInt(b.序号));
                    }
                    
                    // 生成下拉选项
                    generateDropdownOptions();
                    showNotification('从本地缓存加载数据成功', 'info');
                    return;
                }
            } catch (parseError) {
                console.error('解析本地数据失败:', parseError);
            }
        }
        
        // 如果所有加载方式都失败，初始化空数据
        data = [];
        generateDropdownOptions();
        showNotification('无数据，初始化为空数组', 'info');
    } catch (error) {
        console.error('加载数据失败:', error);
        showNotification('加载数据失败: ' + error.message, 'error');
        
        // 最后的降级方案：尝试从localStorage加载
        try {
            const localData = localStorage.getItem('deskData');
            if (localData) {
                const parsedLocalData = JSON.parse(localData);
                if (Array.isArray(parsedLocalData)) {
                    data = parsedLocalData;
                    // 确保数据按序号排序（如果有数据）
                    if (data.length > 0) {
                        data.sort((a, b) => parseInt(a.序号) - parseInt(b.序号));
                    }
                    
                    // 生成下拉选项
                    generateDropdownOptions();
                    showNotification('从本地缓存加载数据成功', 'info');
                }
            } else {
                // 如果localStorage也没有数据，初始化为空数组
                data = [];
                generateDropdownOptions();
            }
        } catch (localError) {
            console.error('本地缓存加载也失败:', localError);
            // 即使解析失败，也要确保data是数组
            data = [];
            generateDropdownOptions();
        }
    }
}

// 应用筛选条件
function applyFilters() {
    filteredData = data.filter(item => {
        // 类型筛选（数字类型比较）
        if (filterType.value !== '' && item.类型 !== parseInt(filterType.value)) {
            return false;
        }
        // 归属筛选
        if (filterOwner.value && item.归属 !== parseInt(filterOwner.value)) {
            return false;
        }
        // 全字段搜索
        if (filterKeyword.value) {
            const keyword = filterKeyword.value.toLowerCase();
            // 检查所有字符串和数字字段是否包含关键词
            const hasKeyword = Object.values(item).some(value => {
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(keyword);
            });
            if (!hasKeyword) {
                return false;
            }
        }
        return true;
    });
    
    // 按序号排序，支持升序和降序
    filteredData.sort((a, b) => {
        const aOrder = parseInt(a.序号);
        const bOrder = parseInt(b.序号);
        return sortDirection === 'asc' ? aOrder - bOrder : bOrder - aOrder;
    });
    
    currentPage = 1;
    renderTable();
    updatePagination();
}

// 重置筛选条件
function resetFilters() {
    filterType.value = '';
    filterOwner.value = '';
    filterKeyword.value = '';
    applyFilters();
}

// 排序方向（从localStorage读取，如果没有则默认为升序）
let sortDirection = localStorage.getItem('sortDirection') || 'asc';

// 切换排序方向
function toggleSort() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    // 保存排序方向到localStorage
    localStorage.setItem('sortDirection', sortDirection);
    applyFilters();
}

// 渲染表格
function renderTable() {
    // 如果是全部显示，则显示所有数据
    const paginatedData = pageSize === Infinity ? 
        filteredData : 
        filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    
    // 更新排序图标显示
    const sortIcon = document.querySelector('#sortable-order i');
    if (sortIcon) {
        sortIcon.className = sortDirection === 'asc' ? 'fa fa-sort-asc ml-1' : 'fa fa-sort-desc ml-1';
    }
    
    dataTableBody.innerHTML = '';
    
    if (paginatedData.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                <i class="fa fa-search-minus text-2xl mb-2"></i>
                <p>没有找到符合条件的记录</p>
            </td>
        `;
        dataTableBody.appendChild(emptyRow);
        return;
    }
    
    paginatedData.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50 transition-all-300';
        

        
        // 构建URL显示（带悬浮框功能）
        let urlCount = 0;
        
        // 收集所有URL
        const urlKeys = ['外网跳转URL', '内网跳转URL', '备用URL1', '备用URL2', '备用URL3'];
        const urlLabels = ['外网跳转URL', '内网跳转URL', '备用URL1', '备用URL2', '备用URL3'];
        let validUrls = [];
        
        // 收集有效的URL并计算数量
        for (let i = 0; i < urlKeys.length; i++) {
            if (item[urlKeys[i]] && item[urlKeys[i]].trim()) {
                validUrls.push({ label: urlLabels[i], url: item[urlKeys[i]] });
            }
        }
        
        urlCount = validUrls.length;
        
        // 生成悬浮框内容 - 只在悬浮框中显示URL详细信息
        let tooltipContent = '';
        if (validUrls.length > 0) {
            validUrls.forEach(({ label, url }) => {
                tooltipContent += `<div style="margin-bottom: 6px; white-space: nowrap;">
                    <span style="color: #3B82F6; font-weight: 600; margin-right: 8px;">${label}:</span>
                    <a href="${url}" target="_blank" style="color: #FFFFFF; text-decoration: none; white-space: nowrap;" 
                       onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
                        ${url}
                    </a>
                </div>`;
            });
        }
        
        // 构建主URL显示 - 单元格内只显示链接数量
        let urlDisplay = '';
        
        // 根据类型设置不同的显示
        if (item.类型 === 0 || item.类型 === '0') { // 文件类型
            if (urlCount > 0) {
                // 单元格内只显示链接数量，URL详情通过悬浮框显示
                urlDisplay = `
                <div style="position: relative; display: inline-block;">
                    <!-- 触发元素 - 只显示链接数量 -->
                    <span style="color: #3B82F6; cursor: pointer; font-weight: 500;">${urlCount}个链接</span>
                    
                    <!-- 悬浮框 - 调整margin-top为0，确保鼠标可以平滑移动到浮窗 -->
                    <div style="position: absolute; left: 0; top: 100%; margin-top: 0; 
                                z-index: 9999; background: #161630b0; border: 1px solid #303644; 
                                border-radius: 6px; padding: 12px; min-width: 100px; max-width: 720px; 
                                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); opacity: 0.95; 
                                backdrop-filter: blur(8px); white-space: nowrap; 
                                visibility: hidden; opacity: 0; transition: visibility 0s, opacity 0.2s ease-in-out;">
                        ${tooltipContent}
                    </div>
                    
                    <style>
                        /* 确保父容器悬浮时浮窗保持可见，解决鼠标移动问题 */
                        div[style*="position: relative; display: inline-block;"]:hover > div {
                            visibility: visible !important;
                            opacity: 0.95 !important;
                        }
                        /* 增加父容器的最小宽度，确保鼠标移动路径 */
                        div[style*="position: relative; display: inline-block;"] {
                            min-width: 60px;
                        }
                    </style>
                </div>`;
            } else {
                // 没有链接时显示"无链接"
                urlDisplay = '<span class="text-gray-400">无链接</span>';
            }
        } else if (item.类型 === 1 || item.类型 === '1') { // 文件夹类型
            // 文件夹类型留空
            urlDisplay = '';
        }
        
        // 构建图片显示（并排显示，不换行，顺序为网络图片再到本地图片）
        let imageDisplay = '<div class="flex space-x-1 whitespace-nowrap items-center">';
        
        // 网络图片占位（无论是否有图片都显示）
        if (item.网络图片URL) {
            imageDisplay += `<img src="${item.网络图片URL}" alt="网络图片" style="height: 48px; width: 48px; object-fit: cover;" class="rounded" title="网络图片"><span style="margin-right: 6px;"></span>`;
        } else {
            imageDisplay += '<div style="height: 48px; width: 48px;" class="bg-gray-100 rounded flex items-center justify-center text-gray-400"><i class="fa fa-image"></i></div><span style="margin-right: 6px;"></span>';
        }
        
        // 本地图片占位（无论是否有图片都显示）
        if (item.本地图片URL) {
            // 对本地图片URL进行编码，确保中文和特殊字符能正确显示
            const encodedLocalImageUrl = encodeURI(item.本地图片URL);
            imageDisplay += `<img src="${encodedLocalImageUrl}" alt="本地图片" style="height: 48px; width: 48px; object-fit: cover;" class="rounded" title="本地图片">`;
        } else {
            imageDisplay += '<div style="height: 48px; width: 48px;" class="bg-gray-100 rounded flex items-center justify-center text-gray-400"><i class="fa fa-file-image-o"></i></div>';
        }
        
        imageDisplay += '</div>';
        
        // 获取类型文本
        const typeText = typeNumberToText(item.类型);
        
        // 格式化归属显示：0显示为桌面，其他显示对应的标题
        let ownerDisplay = '桌面';
        if (item.归属 !== 0) {
            const ownerItem = data.find(i => i.id === item.归属);
            ownerDisplay = ownerItem ? ownerItem.标题 : item.归属;
        }
        
        row.innerHTML = `
            <td class="px-4 py-3 whitespace-nowrap">${item.序号}</td>
            <td class="px-4 py-3 whitespace-nowrap hidden">${item.id}</td>
            <td class="px-4 py-3 font-medium">${item.标题}</td>
            <td class="px-4 py-3 whitespace-nowrap">${urlDisplay}</td>
            <td class="px-4 py-3 whitespace-nowrap">${imageDisplay}</td>
            <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full ${getTypeColorClass(item.类型)} inline-flex items-center">
                    ${item.类型 === 0 || item.类型 === '0' ? '<i class="fa fa-star-o mr-1"></i>' : '<i class="fa fa-folder mr-1"></i>'}
                    ${typeText}
                </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">${ownerDisplay}</td>
            <td class="px-4 py-3 whitespace-nowrap text-center">
                <button class="edit-btn" data-id="${item.id}">
                    改
                </button>
                <button class="delete-btn" data-id="${item.id}">
                    删
                </button>
            </td>
        `;
        
        dataTableBody.appendChild(row);
    });
    
    // 添加编辑和删除按钮的事件监听
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editRecord(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => confirmDelete(btn.getAttribute('data-id')));
    });
    
    // 移除旧的排序事件监听（如果存在）
}

// 将类型数字转换为文本
function typeNumberToText(type) {
    return type === 0 || type === '0' ? '图标' : '文件夹';
}

// 根据类型获取颜色类
function getTypeColorClass(type) {
    const typeNum = parseInt(type);
    const typeColors = {
        0: 'bg-blue-100 text-blue-800',
        1: 'bg-green-100 text-green-800'
    };
    return typeColors[typeNum] || 'bg-gray-100 text-gray-800';
}

// 动态生成下拉选项
function generateDropdownOptions() {
    // 生成类型下拉选项（固定为0和1）
    const filterType = document.getElementById('filterType');
    
    // 清空类型筛选下拉框（保留第一个全部选项）
    while (filterType.options.length > 1) {
        filterType.remove(1);
    }
    
    // 添加类型选项
    const typeOptions = [
        { value: '0', text: '图标' },
        { value: '1', text: '文件夹' }
    ];
    
    typeOptions.forEach(option => {
        const filterOption = document.createElement('option');
        filterOption.value = option.value;
        filterOption.textContent = option.text;
        filterType.appendChild(filterOption);
    });
    
    // 生成归属下拉选项
    const filterOwner = document.getElementById('filterOwner');
    const editOwner = document.getElementById('edit归属');
    
    // 清空现有选项（保留第一个全部选项）
    while (filterOwner.options.length > 1) {
        filterOwner.remove(1);
    }
    
    // 清空编辑表单的归属选项
    editOwner.innerHTML = '';
    
    // 首先添加默认选项（0表示桌面）
    const defaultOption = document.createElement('option');
    defaultOption.value = '0';
    defaultOption.textContent = '桌面';
    editOwner.appendChild(defaultOption);
    
    // 筛选出类型为1的记录（文件夹）
    const folderRecords = data.filter(item => item.类型 === 1 && item.id !== undefined);
    
    // 添加文件夹选项（格式：id+标题）
    folderRecords.forEach(folder => {
        // 为编辑表单添加选项
        const editOption = document.createElement('option');
        editOption.value = folder.id; // 提交时使用id
        editOption.textContent = `${folder.标题}_id:${folder.id}`; // 显示为标题(id)格式
        editOwner.appendChild(editOption);
    });
    
    // 为筛选下拉框添加选项（包括现有归属和文件夹）
    // 首先添加桌面选项（0表示桌面）
    const desktopOption = document.createElement('option');
    desktopOption.value = '0';
    desktopOption.textContent = '桌面';
    filterOwner.appendChild(desktopOption);
    
    // 获取所有可能的非0归属值
    const allOwners = new Set();
    data.forEach(item => {
        if (item.归属 !== undefined && item.归属 !== '' && item.归属 !== null && item.归属 !== 0) {
            allOwners.add(item.归属);
        }
    });
    
    // 添加筛选选项
    allOwners.forEach(owner => {
        const filterOption = document.createElement('option');
        filterOption.value = owner;
        
        // 尝试找到对应的文件夹记录以显示标题
        const folder = folderRecords.find(f => f.id === owner);
        filterOption.textContent = folder ? folder.标题 : owner;
        
        filterOwner.appendChild(filterOption);
    });
}

// 更新分页信息
function updatePagination() {
    const total = filteredData.length;
    // 如果是全部显示，则只有1页
    const totalPages = pageSize === Infinity ? 1 : Math.ceil(total / pageSize);
    const start = total > 0 ? (currentPage - 1) * (pageSize === Infinity ? total : pageSize) + 1 : 0;
    const end = Math.min(currentPage * (pageSize === Infinity ? total : pageSize), total);
    
    startItem.textContent = start;
    endItem.textContent = end;
    totalItems.textContent = total;
    
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;
    
    // 当选择全部时，禁用分页按钮
    if (pageSize === Infinity) {
        prevPage.disabled = true;
        nextPage.disabled = true;
    }
}



// 控制URL输入框的显示/隐藏
function toggleUrlFields(show) {
    const publicUrlField = document.getElementById('publicUrlField');
    const urlFieldsRow1 = document.getElementById('urlFieldsRow1');
    const urlFieldsRow2 = document.getElementById('urlFieldsRow2');
    const imageUrlsContainer = document.getElementById('imageUrlsContainer');
    
    // 当类型为文件夹时隐藏URL相关字段，确保显示时使用正确的display值
    if (publicUrlField) {
        if (show) {
            publicUrlField.style.display = '';
        } else {
            publicUrlField.style.display = 'none';
        }
    }
    
    if (urlFieldsRow1) urlFieldsRow1.style.display = show ? 'grid' : 'none';
    if (urlFieldsRow2) urlFieldsRow2.style.display = show ? 'grid' : 'none';
    
    // 确保图片URL容器始终可见
    if (imageUrlsContainer) {
        imageUrlsContainer.classList.remove('hidden');
    }
}

// 初始化类型选择事件监听
function initTypeSelectionListener() {
    const typeSelect = document.getElementById('edit类型');
    if (typeSelect && !typeSelect._hasChangeListener) {
        typeSelect._hasChangeListener = true;
        typeSelect.addEventListener('change', function() {
            // 值为0表示图标，显示URL；值为1表示文件夹，隐藏URL
            const showUrls = this.value === '0';
            toggleUrlFields(showUrls);
        });
    }
}

// 打开添加模态框
function openAddModal() {
    document.getElementById('modalTitle').textContent = '添加记录';
    editingId = null;
    document.getElementById('recordId').value = '';
    document.getElementById('editForm').reset();
    // 设置默认序号为当前最大序号+100，但用户可以自由修改
    const maxOrder = data.length > 0 ? Math.max(...data.map(item => parseInt(item.序号))) : 0;
    document.getElementById('edit序号').value = maxOrder + 100;
    // 确保添加时类型字段可用
    document.getElementById('edit类型').disabled = false;
    
    // 初始化类型选择事件监听
    initTypeSelectionListener();
    
    // 根据当前类型设置URL字段的显示状态
    const typeSelect = document.getElementById('edit类型');
    toggleUrlFields(typeSelect.value === '0');
    
    editModal.classList.remove('hidden');
}

// 编辑记录
function editRecord(id) {
    const idNum = parseInt(id);
    const record = data.find(item => item.id === idNum);
    if (record) {
        document.getElementById('modalTitle').textContent = '编辑记录';
        editingId = id;
        document.getElementById('recordId').value = id;
        
        // 填充表单
        Object.keys(record).forEach(key => {
            const element = document.getElementById(`edit${key}`);
            if (element) {
                element.value = record[key];
            }
        });
        
        // 处理归属下拉框
        const editOwner = document.getElementById('edit归属');
        const currentOwner = record.归属;
        
        // 确保生成最新的下拉选项
        generateDropdownOptions();
        
        // 确保选择正确的值
        if (currentOwner !== undefined && currentOwner !== null && currentOwner !== '') {
            editOwner.value = currentOwner;
        } else {
            editOwner.value = '0'; // 默认无归属
        }
        
        // 编辑时将类型字段设为禁用（变灰色）
        document.getElementById('edit类型').disabled = true;
        
        // 初始化类型选择事件监听
        initTypeSelectionListener();
        
        // 根据记录类型设置URL字段的显示状态
        const isIconType = record.类型 === 0;
        toggleUrlFields(isIconType);
        
        editModal.classList.remove('hidden');
    }
}

// 确认删除
function confirmDelete(id) {
    const idNum = parseInt(id);
    const record = data.find(item => item.id === idNum);
    if (record) {
        document.getElementById('deleteId').value = id;
        document.getElementById('deleteTitle').textContent = `"${record.标题}"`;
        deleteModal.classList.remove('hidden');
    }
}

// 自动获取图片并填充URL
async function autoFetchImage() {
    // 检查登录状态
    if (!checkLoginStatus()) {
        return;
    }
    
    try {
        const title = document.getElementById('edit标题').value;
        
        // 验证标题为必填项
        if (!title.trim()) {
            showNotification('请先输入标题', 'info');
            document.getElementById('edit标题').focus();
            return;
        }
        
        // 收集所有可用的URL（用于尝试下载favicon）
        const urls = [];
        const externalUrl = document.getElementById('edit外网跳转URL').value;
        const internalUrl = document.getElementById('edit内网跳转URL').value;
        const backup1 = document.getElementById('edit备用URL1').value;
        const backup2 = document.getElementById('edit备用URL2').value;
        const backup3 = document.getElementById('edit备用URL3').value;
        const networkImageUrl = document.getElementById('edit网络图片URL').value;
        const type = parseInt(document.getElementById('edit类型').value);
        
        if (externalUrl) urls.push(externalUrl);
        if (internalUrl) urls.push(internalUrl);
        if (backup1) urls.push(backup1);
        if (backup2) urls.push(backup2);
        if (backup3) urls.push(backup3);
        
        // 显示下载中通知 - 设置为持久通知，直到有结果才消失
        const loadingNotification = showNotification('正在下载图片，请稍候...', 'info', true);
        
        // 设置30秒超时
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('下载超时')), 30000);
        });
        
        // 确定记录ID - 使用真实的记录ID或预生成最终ID
        let recordId;
        if (editingId) {
            // 编辑模式下使用现有ID
            recordId = parseInt(editingId);
        } else {
            // 新增模式下预生成与saveRecord一致的ID
            const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
            recordId = maxId + 1;
        }
        
        // 调用图片下载API，优先使用已有的网络图片URL
        const fetchPromise = fetch('/api/download-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': 'authenticated'
            },
            body: JSON.stringify({
                id: recordId,
                title: title,
                imageUrl: networkImageUrl,
                urls: urls,
                type: type,
                // 添加特殊标记，指示这是自动获取图片操作
                isAutoFetch: true,
                setPermissions: true,
                // 确保覆盖现有文件
                overwrite: true
            })
        }).then(async response => {
            // 检查是否未授权
            if (response.status === 401) {
                localStorage.removeItem('isLoggedIn');
                window.location.href = 'login.html';
                throw new Error('未授权');
            }
            
            const result = await response.json();
            return result;
        });
        
        // 等待API调用完成或超时
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (result.success && result.filePath) {
            // 移除加载通知
            if (loadingNotification && loadingNotification.parentNode) {
                document.body.removeChild(loadingNotification);
                const styleElements = document.head.querySelectorAll('style');
                styleElements[styleElements.length - 1].remove(); // 移除相关样式
            }
            
            // 成功获取图片，填充本地图片URL
            document.getElementById('edit本地图片URL').value = result.filePath;
            
            // 如果有原始网络地址，填充网络图片URL
            if (result.imageUrl) {
                document.getElementById('edit网络图片URL').value = result.imageUrl;
            }
            
            showNotification('图片获取成功！', 'success');
        } else {
            // 如果下载失败，根据类型设置默认图片
            if (type === 1) { // 文件夹类型
                const defaultFolderImageUrl = 'https://help-static.fnnas.com/images/文件管理.png';
                document.getElementById('edit网络图片URL').value = defaultFolderImageUrl;
                document.getElementById('edit本地图片URL').value = '/deskdata/img/f.png';
                
                // 尝试下载默认文件夹图片
                try {
                    await fetch('/api/download-image', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': 'authenticated'
                        },
                        body: JSON.stringify({
                            id: 'f', // 使用固定ID 'f' 表示文件夹默认图标
                            title: '默认文件夹图标',
                            imageUrl: defaultFolderImageUrl,
                            urls: [],
                            type: type,
                            forceFilename: 'f.png', // 强制使用指定文件名
                            setPermissions: true
                        })
                    });
                    showNotification('使用默认文件夹图标', 'info');
                } catch (err) {
                    console.error('下载默认文件夹图标失败:', err);
                    showNotification('使用默认文件夹图标（但下载失败）', 'warning');
                }
            } else { // 其他类型（图标）
                const defaultIconUrl = 'https://help-static.fnnas.com/images/Margin-1.png';
                document.getElementById('edit网络图片URL').value = defaultIconUrl;
                document.getElementById('edit本地图片URL').value = '/deskdata/img/i.png';
                
                // 尝试下载默认图标
                try {
                    await fetch('/api/download-image', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': 'authenticated'
                        },
                        body: JSON.stringify({
                            id: 'i', // 使用固定ID 'i' 表示默认图标
                            title: '默认图标',
                            imageUrl: defaultIconUrl,
                            urls: [],
                            type: type,
                            forceFilename: 'i.png', // 强制使用指定文件名
                            setPermissions: true
                        })
                    });
                    showNotification('使用默认图标', 'info');
                } catch (err) {
                    console.error('下载默认图标失败:', err);
                    showNotification('使用默认图标（但下载失败）', 'warning');
                }
            }
        }
    } catch (error) {
        // 移除加载通知
        if (loadingNotification && loadingNotification.parentNode) {
            document.body.removeChild(loadingNotification);
            const styleElements = document.head.querySelectorAll('style');
            styleElements[styleElements.length - 1].remove(); // 移除相关样式
        }
        
        // 发生错误时，尝试使用默认图片
        const type = parseInt(document.getElementById('edit类型').value);
        
        if (error.message === '下载超时') {
            showNotification('下载图片超时，使用默认图标', 'warning');
        } else {
            console.error('自动获取图片失败:', error);
            showNotification('获取图片失败，使用默认图标', 'error');
        }
        
        // 设置默认图片
        if (type === 1) { // 文件夹类型
            document.getElementById('edit网络图片URL').value = 'https://help-static.fnnas.com/images/文件管理.png';
            document.getElementById('edit本地图片URL').value = '/deskdata/img/f.png';
        } else { // 其他类型（图标）
            document.getElementById('edit网络图片URL').value = 'https://help-static.fnnas.com/images/Margin-1.png';
            document.getElementById('edit本地图片URL').value = '/deskdata/img/i.png';
        }
    }
    
    // 注意：此函数只执行图片下载，不提交表单！
}

// 下载图片并设置本地图片路径
async function downloadAndSetLocalImage(recordId, title, networkImageUrl, type) {
    try {
        // 检查登录状态
        if (!checkLoginStatus()) {
            return null;
        }
        
        // 收集所有可用的URL（用于尝试下载favicon）
        const urls = [];
        const externalUrl = document.getElementById('edit外网跳转URL').value;
        const internalUrl = document.getElementById('edit内网跳转URL').value;
        const backup1 = document.getElementById('edit备用URL1').value;
        const backup2 = document.getElementById('edit备用URL2').value;
        const backup3 = document.getElementById('edit备用URL3').value;
        
        if (externalUrl) urls.push(externalUrl);
        if (internalUrl) urls.push(internalUrl);
        if (backup1) urls.push(backup1);
        if (backup2) urls.push(backup2);
        if (backup3) urls.push(backup3);
        
        // 调用图片下载API
        const response = await fetch('/api/download-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': 'authenticated'
            },
            body: JSON.stringify({
                id: recordId,
                title: title,
                imageUrl: networkImageUrl,
                urls: urls,
                type: type
            })
        });
        
        const result = await response.json();
        
        // 检查是否未授权
        if (response.status === 401) {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
            return null;
        }
        
        if (result.success && result.filePath) {
            console.log('图片下载成功，本地路径:', result.filePath);
            return result.filePath;
        }
        console.log('图片下载失败:', result.message);
        return null;
    } catch (error) {
        console.error('下载图片失败:', error);
        return null;
    }
}

// 保存记录
async function saveRecord() {
    // 检查登录状态
    if (!checkLoginStatus()) {
        return;
    }
    try {
        // 获取表单数据
        const title = document.getElementById('edit标题').value;
        
        // 验证标题为必填项
        if (!title.trim()) {
            showNotification('标题为必填项，请输入标题', 'info');

            
            // 聚焦到标题输入框
            document.getElementById('edit标题').focus();
            
            return;
        }
        
        const networkImageUrl = document.getElementById('edit网络图片URL').value;
        const type = parseInt(document.getElementById('edit类型').value);
        let recordId;
        
        // 确定记录ID
        if (editingId) {
            recordId = parseInt(editingId);
        } else {
            // 生成新ID
            const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
            recordId = maxId + 1;
        }
        
        // 直接使用表单中的本地图片URL
        let localImagePath = document.getElementById('edit本地图片URL').value;
        
        // 如果网络图片URL和本地图片URL都为空，执行自动获取图片
        if ((!networkImageUrl || networkImageUrl.trim() === '') && (!localImagePath || localImagePath.trim() === '')) {
            showNotification('网络图片URL和本地图片URL都为空，正在尝试自动获取图片...', 'info');
            await autoFetchImage();
            // 获取更新后的本地图片URL
            localImagePath = document.getElementById('edit本地图片URL').value;
        }
        
        // 如果本地图片URL仍然为空，设置默认图片路径
        if (!localImagePath || localImagePath.trim() === '') {
            // 根据类型选择对应的默认图片
            const defaultImagePath = type === 0 ? '/deskdata/img/i.png' : '/deskdata/img/f.png';
            localImagePath = defaultImagePath;
            console.log(`未获取到图片，使用默认图片: ${defaultImagePath}`);
        }
        
        // 构建完整的表单数据
        const formData = {
            序号: parseInt(document.getElementById('edit序号').value),
            类型: type,
            归属: parseInt(document.getElementById('edit归属').value),
            标题: title,
            外网跳转URL: document.getElementById('edit外网跳转URL').value,
            内网跳转URL: document.getElementById('edit内网跳转URL').value,
            备用URL1: document.getElementById('edit备用URL1').value,
            备用URL2: document.getElementById('edit备用URL2').value,
            备用URL3: document.getElementById('edit备用URL3').value,
            网络图片URL: networkImageUrl,
            本地图片URL: localImagePath
        };
        
        // 确保editForm表单有submit事件监听器
        const editForm = document.getElementById('editForm');
        if (!editForm._hasSubmitListener) {
            editForm._hasSubmitListener = true;
            editForm.addEventListener('submit', function(event) {
                event.preventDefault();
                saveRecord();
            });
        }
        
        if (editingId) {
            // 更新记录
            const editIdNum = recordId;
            const index = data.findIndex(item => item.id === editIdNum);
            if (index !== -1) {
                data[index] = { ...data[index], ...formData };
            }
            showNotification('记录更新成功！', 'success');
        } else {
            // 添加新记录
            data.push({ id: recordId, ...formData });
            showNotification('记录添加成功！', 'success');
        }
        
        // 保存到文件
        await saveDataToFile();
        
        // 移除localStorage中的缓存，避免重复添加问题
        localStorage.removeItem('deskData');
        
        // 排序数据并更新UI，而不是重新加载数据
        data.sort((a, b) => parseInt(a.序号) - parseInt(b.序号));
        generateDropdownOptions();
        applyFilters();
        
        // 关闭模态框
        editModal.classList.add('hidden');
        
    } catch (error) {
        showNotification('保存失败: ' + error.message, 'error');
        console.error('保存失败:', error);
    }
}

// 删除记录
async function deleteRecord() {
    // 检查登录状态
    if (!checkLoginStatus()) {
        return;
    }
    try {
        const id = parseInt(document.getElementById('deleteId').value);
        data = data.filter(item => item.id !== id);
        
        // 保存到文件
        const saveResult = await saveDataToFile();
        
        // 移除localStorage中的缓存，避免空数据时的加载问题
        if (data.length === 0) {
            localStorage.removeItem('deskData');
        }
        
        // 关闭模态框
        deleteModal.classList.add('hidden');
        
        // 对于空数据特殊处理，不重新加载而是直接清空UI
        if (data.length === 0) {
            filteredData = [];
            renderTable();
            updatePagination();
            generateDropdownOptions();
        } else {
            // 非空数据时重新排序并更新UI
            data.sort((a, b) => parseInt(a.序号) - parseInt(b.序号));
            generateDropdownOptions();
            applyFilters();
        }
        
        showNotification('记录删除成功！', 'success');
    } catch (error) {
        showNotification('删除失败: ' + error.message, 'error');
        console.error('删除失败:', error);
    }
}

// 保存数据到文件（使用API）
async function saveDataToFile() {
    try {
        const response = await fetch('/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': 'authenticated'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            if (response.status === 401) {
                // 未授权，重定向到登录页面
                localStorage.removeItem('isLoggedIn');
                window.location.href = 'login.html';
                return false;
            }
            throw new Error('保存数据失败');
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || '保存数据失败');
        }

        return true;
    } catch (error) {
        console.error('保存数据失败:', error);
        // 降级到本地保存
        try {
            localStorage.setItem('deskData', JSON.stringify(data));
            return true;
        } catch (localError) {
            console.error('本地保存也失败:', localError);
            return false;
        }
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 调用公告显示检查函数
    checkAndShowAnnouncement();
    // 添加按钮事件
    addBtn.addEventListener('click', openAddModal);
    
    // 更多操作下拉菜单
const moreActionsBtn = document.getElementById('moreActionsBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const menuLogout = document.getElementById('menuLogout');
const menuMergeData = document.getElementById('menuMergeData');
const menuCustomize = document.getElementById('menuCustomize');
const menuResetDesktop = document.getElementById('menuResetDesktop');

// 显示/隐藏下拉菜单
if (moreActionsBtn && dropdownMenu) {
    moreActionsBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
    
    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', () => {
        if (dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
        }
    });
    
    // 点击下拉菜单内部不关闭菜单
    dropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// 退出登录菜单项
if (menuLogout) {
    menuLogout.addEventListener('click', logout);
}

// 合并数据菜单项
if (menuMergeData) {
    menuMergeData.addEventListener('click', () => {
        window.location.href = 'otn.html';
        dropdownMenu.style.display = 'none';
    });
}

// 还原桌面菜单项
if (menuResetDesktop) {
    menuResetDesktop.addEventListener('click', async () => {
        // 显示确认模态框
        document.getElementById('resetDesktopModal').classList.remove('hidden');
        dropdownMenu.style.display = 'none';
    });
    
    // 取消还原桌面
    document.getElementById('cancelResetBtn').addEventListener('click', () => {
        document.getElementById('resetDesktopModal').classList.add('hidden');
    });
    
    // 确认还原桌面
    document.getElementById('confirmResetBtn').addEventListener('click', async () => {
        try {
            // 关闭模态框
            document.getElementById('resetDesktopModal').classList.add('hidden');
            
            // 检测res/www.bak是否存在
            const checkResponse = await fetch('/api/check-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ filePath: 'res/www.bak' })
            });
            
            const checkResult = await checkResponse.json();
            
            if (!checkResult.exists) {
                showNotification('系统源文件不存在！', 'error');
            } else {
                // 执行还原操作
                const resetResponse = await fetch('/api/reset-desktop', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const resetResult = await resetResponse.json();
                
                if (resetResult.success) {
                    showNotification('系统还原成功，请重启系统。', 'success');
                } else {
                    showNotification('还原失败：' + (resetResult.error || '未知错误'), 'error');
                }
            }
        } catch (error) {
            console.error('还原桌面时出错:', error);
            showNotification('还原过程中发生错误，请检查系统权限。', 'error');
        }
    });
}
    
    // 立即生效按钮事件
    const applyBtn = document.getElementById('applyBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            applyConfigModal.classList.remove('hidden');
        });
    }
    
    // 确认应用配置
    if (confirmApplyBtn) {
        confirmApplyBtn.addEventListener('click', async () => {
            try {
                // 关闭模态框
                applyConfigModal.classList.add('hidden');
                
                // 向服务器发送退出请求
                const response = await fetch('/api/exit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // 显示退出提示
                    showNotification('程序将重启使其配置生效...', 'success');
                    // 延迟几秒后刷新页面或跳转到其他页面
                    setTimeout(() => {
                        showNotification('重启完毕,重载页面...', 'success');
                    }, 3000);
                                    setTimeout(() => {
                        window.location.reload();
                    }, 6000);
                } else {
                    // 显示错误提示
                    alert(result.message || '退出程序失败！');
                }
            } catch (error) {
                console.error('退出程序时出错：', error);
                alert('退出程序失败：' + error.message);
            }
        });
    }
    
    // 取消应用配置
    if (cancelApplyBtn) {
        cancelApplyBtn.addEventListener('click', () => {
            applyConfigModal.classList.add('hidden');
        });
    }
    
    // 模态框事件
    closeModal.addEventListener('click', () => editModal.classList.add('hidden'));
    cancelEditBtn.addEventListener('click', () => editModal.classList.add('hidden'));
    // 为保存按钮添加点击事件
    saveBtn.addEventListener('click', saveRecord);

    // 为表单添加提交事件，阻止默认提交行为
    const editForm = document.getElementById('editForm');
    editForm.addEventListener('submit', (e) => {
        e.preventDefault(); // 阻止表单默认提交行为
        saveRecord(); // 调用保存函数
    });


    
    // 删除模态框事件
    cancelDeleteBtn.addEventListener('click', () => deleteModal.classList.add('hidden'));
    confirmDeleteBtn.addEventListener('click', deleteRecord);
    
    // 退出登录模态框事件
    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', () => logoutModal.classList.add('hidden'));
    }
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            logoutModal.classList.add('hidden');
            confirmLogout();
        });
    }
    
    // 公告模态框事件
    if (announcementBtn) {
        announcementBtn.addEventListener('click', () => {
            announcementModal.classList.remove('hidden');
        });
    }
    if (closeAnnouncementBtn) {
        closeAnnouncementBtn.addEventListener('click', () => {
            announcementModal.classList.add('hidden');
        });
    }
    if (closeAnnouncementFooterBtn) {
        closeAnnouncementFooterBtn.addEventListener('click', () => {
            announcementModal.classList.add('hidden');
        });
    }
    
    // 添加ESC键关闭模态框功能
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!editModal.classList.contains('hidden')) {
                editModal.classList.add('hidden');
            } else if (!deleteModal.classList.contains('hidden')) {
                deleteModal.classList.add('hidden');
            } else if (!applyConfigModal.classList.contains('hidden')) {
                applyConfigModal.classList.add('hidden');
            } else if (!logoutModal.classList.contains('hidden')) {
                logoutModal.classList.add('hidden');
            } else if (!announcementModal.classList.contains('hidden')) {
                announcementModal.classList.add('hidden');
            }
        }
    });
    
    // 添加悬浮框位置自适应逻辑
    document.addEventListener('mouseover', (e) => {
        const urlGroup = e.target.closest('.group[data-row-index]');
        if (urlGroup) {
            const tooltip = urlGroup.querySelector('.absolute');
            if (tooltip) {
                const rowIndex = parseInt(urlGroup.getAttribute('data-row-index'));
                const rect = urlGroup.getBoundingClientRect();
                const tooltipHeight = 180; // 估计的悬浮框高度
                
                // 如果是表格前3行，显示在下方；否则显示在上方
                if (rowIndex < 3) {
                    // 显示在下方
                    tooltip.style.bottom = 'auto';
                    tooltip.style.top = 'calc(100% + 4px)';
                } else {
                    // 显示在上方
                    tooltip.style.top = 'auto';
                    tooltip.style.bottom = 'calc(100% + 4px)';
                }
            }
        }
    });
    
    // 筛选事件
    filterBtn.addEventListener('click', applyFilters);
    resetFilterBtn.addEventListener('click', resetFilters);
    
    // 分页事件
    prevPage.addEventListener('click', () => {
        if (currentPage > 1 && pageSize !== Infinity) {
            currentPage--;
            renderTable();
            updatePagination();
        }
    });
    
    nextPage.addEventListener('click', () => {
        const totalPages = pageSize === Infinity ? 1 : Math.ceil(filteredData.length / pageSize);
        if (currentPage < totalPages && pageSize !== Infinity) {
            currentPage++;
            renderTable();
            updatePagination();
        }
    });
    

    
    // 添加序号列排序事件监听
    const sortableOrder = document.getElementById('sortable-order');
    if (sortableOrder) {
        sortableOrder.addEventListener('click', toggleSort);
    }
    
    // 添加ESC键关闭模态框功能
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!editModal.classList.contains('hidden')) {
                editModal.classList.add('hidden');
            } else if (!deleteModal.classList.contains('hidden')) {
                deleteModal.classList.add('hidden');
            }
        }
    });
    
    // 回车键搜索
    filterKeyword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // 自动获取按钮事件监听器
    const autoFetchBtn = document.getElementById('autoFetchBtn');
    if (autoFetchBtn) {
        autoFetchBtn.addEventListener('click', autoFetchImage);
    }
    
    // 本地图片上传功能
    const uploadLocalImgBtn = document.getElementById('uploadLocalImgBtn');
    const localImgFileInput = document.getElementById('localImgFileInput');
    const editLocalImgUrlInput = document.getElementById('edit本地图片URL');
    
    if (uploadLocalImgBtn && localImgFileInput && editLocalImgUrlInput) {
        // 点击上传按钮触发文件选择
        uploadLocalImgBtn.addEventListener('click', () => {
            localImgFileInput.click();
        });
        
        // 文件选择后处理上传
        localImgFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // 获取当前记录ID（用于文件名）
            const recordIdInput = document.getElementById('recordId');
            let recordId = recordIdInput ? recordIdInput.value.trim() : '';
            
            // 如果没有ID，自动计算最大ID+1 - 与autoFetchImage和saveRecord函数使用相同的逻辑
            if (!recordId) {
                try {
                    // 直接使用全局的data变量，与系统其他部分保持一致
                    const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
                    recordId = String(maxId + 1);
                    console.log(`自动生成的新记录ID: ${recordId}`);
                } catch (error) {
                    console.error('计算ID时出错:', error);
                    // 出错时使用默认ID
                    recordId = '1';
                }
            }
            
            // 创建FormData并添加文件
            const formData = new FormData();
            formData.append('file', file);
            formData.append('id', recordId);
            
            try {
                // 显示加载状态
                uploadLocalImgBtn.disabled = true;
                uploadLocalImgBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 上传中...';
                
                // 上传文件
                const response = await fetch('/api/upload/localImg', {
                    method: 'POST',
                    headers: {
                        'x-auth-token': localStorage.getItem('authToken') || ''
                    },
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success && result.filePath) {
                    // 上传成功，更新输入框
                    editLocalImgUrlInput.value = result.filePath;
                    showNotification('图片上传成功', 'success');
                } else {
                    throw new Error(result.message || '上传失败');
                }
            } catch (error) {
                console.error('图片上传失败:', error);
                showNotification(`上传失败: ${error.message}`, 'error');
            } finally {
                // 恢复按钮状态
                uploadLocalImgBtn.disabled = false;
                uploadLocalImgBtn.innerHTML = '上传图片';
                // 清空文件输入，允许重复选择同一文件
                localImgFileInput.value = '';
            }
        });
    }
}

// 在页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}