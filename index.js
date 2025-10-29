// 全局变量
let data = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;
let editingId = null;
let loginStatusChecked = false;

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

// 检查登录状态 - 暂时禁用重定向
function checkLoginStatus() {
    // 为了调试，暂时注释掉重定向逻辑
     if (localStorage.getItem('isLoggedIn') !== 'true') {
         window.location.href = 'login.html';
         return false;
     }
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
        
        await loadData();
        applyFilters();
        setupEventListeners();
        
        // 初始化每页显示条数选择器
        initPageSizeSelector();
        

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
        // 尝试从API加载数据
        const response = await fetch('/api/data', {
            headers: {
                'x-auth-token': 'authenticated'
            }
        });
        if (response.ok) {
            const apiData = await response.json();
            if (Array.isArray(apiData) && apiData.length > 0) {
                data = apiData;
                // 确保数据按序号排序
                data.sort((a, b) => parseInt(a.序号) - parseInt(b.序号));
                
                // 生成下拉选项
                generateDropdownOptions();
                return;
            }
        }
        
        // 如果API失败或没有数据，尝试直接从文件加载（用于静态环境）
        const staticResponse = await fetch('deskdata/data.json');
        if (staticResponse.ok) {
            const staticData = await staticResponse.json();
            if (Array.isArray(staticData) && staticData.length > 0) {
                data = staticData;
                // 确保数据按序号排序
                data.sort((a, b) => parseInt(a.序号) - parseInt(b.序号));
                
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
                if (Array.isArray(parsedLocalData) && parsedLocalData.length > 0) {
                    data = parsedLocalData;
                    // 确保数据按序号排序
                    data.sort((a, b) => parseInt(a.序号) - parseInt(b.序号));
                    
                    // 生成下拉选项
                    generateDropdownOptions();
                    showNotification('从本地缓存加载数据成功', 'info');
                    return;
                }
            } catch (parseError) {
                console.error('解析本地数据失败:', parseError);
            }
        }
        
        showNotification('所有数据加载方式都失败了', 'error');
    } catch (error) {
        console.error('加载数据失败:', error);
        showNotification('加载数据失败: ' + error.message, 'error');
        
        // 最后的降级方案：尝试从localStorage加载
        try {
            const localData = localStorage.getItem('deskData');
            if (localData) {
                const parsedLocalData = JSON.parse(localData);
                if (Array.isArray(parsedLocalData) && parsedLocalData.length > 0) {
                    data = parsedLocalData;
                    // 确保数据按序号排序
                    data.sort((a, b) => parseInt(a.序号) - parseInt(b.序号));
                    
                    // 生成下拉选项
                    generateDropdownOptions();
                    showNotification('从本地缓存加载数据成功', 'info');
                }
            }
        } catch (localError) {
            console.error('本地缓存加载也失败:', localError);
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

// 排序方向（默认升序）
let sortDirection = 'asc';

// 切换排序方向
function toggleSort() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
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
        let tooltipContent = '<div class="p-2 whitespace-nowrap">';
        
        // 收集所有URL
        const urls = [
            { label: '外网跳转', url: item.外网跳转URL, type: 'primary' },
            { label: '内网跳转', url: item.内网跳转URL, type: 'success' },
            { label: '备用URL1', url: item.备用URL1, type: 'info' },
            { label: '备用URL2', url: item.备用URL2, type: 'warning' },
            { label: '备用URL3', url: item.备用URL3, type: 'danger' }
        ];
        
        // 生成悬浮框内容 - 确保每个URL在单独一行显示且不换行
        urls.forEach(({ label, url, type }) => {
            tooltipContent += `<div class="mb-1 last:mb-0">
                <span class="text-sm font-medium mr-1">${label}:</span>
                <a href="${url}" target="_blank" class="text-${type} hover:underline text-sm" ${url ? '' : 'style="color: #ccc;"'}>
                    ${url || '无'}
                </a>
            </div>`;
            if (url) urlCount++;
        });
        
        tooltipContent += '</div>';
        
        // 构建主URL显示
        let urlDisplay = '';
        const mainUrl = urls.find(u => u.url);
        if (mainUrl) {
            // 使用第一个有效的URL作为主显示
            urlDisplay = `<div class="relative group" data-row-index="${paginatedData.findIndex(row => row.id === item.id)}">
                <a href="${mainUrl.url}" target="_blank" class="text-${mainUrl.type} hover:underline">
                    ${mainUrl.label === '外网跳转' ? '外网' : mainUrl.label === '内网跳转' ? '内网' : '链接'}
                </a>
                ${urlCount > 1 ? ` <span class="text-xs text-gray-500">(${urlCount}个链接)</span>` : ''}
                <!-- 悬浮框 - 自适应位置，根据行位置决定显示在上还是下 -->
                <div class="absolute hidden group-hover:block bg-white border border-gray-200 rounded shadow-lg p-2 z-10 min-w-[280px] max-w-none whitespace-nowrap left-0">
                    ${tooltipContent}
                </div>
            </div>`;
        }
        
        // 构建图片显示（并排显示，不换行，顺序为网络图片再到本地图片）
        let imageDisplay = '<div class="flex space-x-1 whitespace-nowrap items-center">';
        
        // 网络图片占位（无论是否有图片都显示）
        if (item.网络图片URL) {
            imageDisplay += `<img src="${item.网络图片URL}" alt="网络图片" style="height: 48px; width: 48px; object-fit: cover;" class="rounded" title="网络图片">`;
        } else {
            imageDisplay += '<div style="height: 48px; width: 48px;" class="bg-gray-100 rounded flex items-center justify-center text-gray-400"><i class="fa fa-image"></i></div>';
        }
        
        // 本地图片占位（无论是否有图片都显示）
        if (item.本地图片URL) {
            imageDisplay += `<img src="${item.本地图片URL}" alt="本地图片" style="height: 48px; width: 48px; object-fit: cover;" class="rounded" title="本地图片">`;
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
            <td class="px-4 py-3 whitespace-nowrap">${item.id}</td>
            <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full ${getTypeColorClass(item.类型)} inline-flex items-center">
                    ${item.类型 === 0 || item.类型 === '0' ? '<i class="fa fa-star-o mr-1"></i>' : '<i class="fa fa-folder mr-1"></i>'}
                    ${typeText}
                </span>
            </td>
            <td class="px-4 py-3 font-medium">${item.标题}</td>
            <td class="px-4 py-3 whitespace-nowrap">${urlDisplay}</td>
            <td class="px-4 py-3 whitespace-nowrap">${imageDisplay}</td>
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
    const mainUrlContainer = document.getElementById('mainUrlContainer');
    const backupUrlsContainer = document.getElementById('backupUrlsContainer');
    const imageUrlsContainer = document.getElementById('imageUrlsContainer');
    
    // 只控制内外网跳转URL和备用URL的显示/隐藏，图片URL始终可见
    if (mainUrlContainer && backupUrlsContainer) {
        if (show) {
            mainUrlContainer.classList.remove('hidden');
            backupUrlsContainer.classList.remove('hidden');
        } else {
            mainUrlContainer.classList.add('hidden');
            backupUrlsContainer.classList.add('hidden');
        }
    }
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
    // 设置默认序号为当前最大序号+1，但用户可以自由修改
    const maxOrder = data.length > 0 ? Math.max(...data.map(item => parseInt(item.序号))) : 0;
    document.getElementById('edit序号').value = maxOrder + 1;
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
            alert('标题为必填项，请输入标题');
            
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
        
        // 检查是否需要下载图片
        let localImagePath = null;
        if (!editingId) {
            // 新增记录，总是下载图片
            localImagePath = await downloadAndSetLocalImage(recordId, title, networkImageUrl, type);
        } else {
            // 编辑记录的情况
            const editIdNum = parseInt(editingId);
            const originalRecord = data.find(item => item.id === editIdNum);
            const currentLocalImageUrl = document.getElementById('edit本地图片URL').value;
            
            // 只有在以下情况下才执行下载：
            // 1. 网络图片URL发生变动
            // 2. 本地图片URL发生变动
            // 3. 本地图片URL为空且原始记录中也没有本地图片URL
            // 如果两个URL都没有变化，则跳过下载
            if (originalRecord && 
                (originalRecord.网络图片URL !== networkImageUrl || 
                 originalRecord.本地图片URL !== currentLocalImageUrl || 
                 (!originalRecord.本地图片URL && !currentLocalImageUrl))) {
                // 满足任一条件，执行下载
                console.log('网络图片URL或本地图片URL发生变化，执行图片下载');
                localImagePath = await downloadAndSetLocalImage(recordId, title, networkImageUrl, type);
            } else {
                console.log('网络图片URL和本地图片URL均未变化，跳过图片下载');
                // 使用现有的本地图片URL
                localImagePath = currentLocalImageUrl;
            }
        }
        
        // 如果下载失败，设置默认图片路径
        if (!localImagePath) {
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
            alert('记录更新成功！');
        } else {
            // 添加新记录
            data.push({ id: recordId, ...formData });
            alert('记录添加成功！');
        }
        
        // 保存到文件
        await saveDataToFile();
        
        // 重新加载数据
        await loadData();
        applyFilters();
        
        // 关闭模态框
        editModal.classList.add('hidden');
        
    } catch (error) {
        alert('保存失败: ' + error.message);
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
        await saveDataToFile();
        
        // 重新加载数据
        await loadData();
        applyFilters();
        
        // 关闭模态框
        deleteModal.classList.add('hidden');
        
        alert('记录删除成功！');
    } catch (error) {
        alert('删除失败: ' + error.message);
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
    // 添加按钮事件
    addBtn.addEventListener('click', openAddModal);
    
    // 退出登录按钮事件
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
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
                
                // 调用Node.js API来执行文件操作
                const response = await fetch('/api/apply-config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // 显示成功提示
                    alert('配置应用成功！');
                } else {
                    // 显示错误提示
                    alert(result.message || '应用配置失败！');
                }
            } catch (error) {
                console.error('应用配置时出错：', error);
                alert('应用配置失败：' + error.message);
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
}

// 在页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}