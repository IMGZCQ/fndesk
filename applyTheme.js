// 应用主题函数
function applyTheme(themeData) {
    // 检查必要的URL是否存在
    if (!themeData.t1 || !themeData.t2 || !themeData.t3) {
        showNotification('主题数据不完整，请联系管理员', 'error');
        return;
    }
    
    showNotification('正在下载并应用主题...', 'info');
    
    // 准备请求数据
    const requestData = {
        loginLogoUrl: themeData.t1.replace(/[`']/g, ''),      // t1对应loginLogo
        loginBackgroundUrl: themeData.t2.replace(/[`']/g, ''), // t2对应loginBackground
        deviceLogoUrl: themeData.t3.replace(/[`']/g, '')       // t3对应deviceLogo
    };
    
    // 调用选择主题API
    fetch('/api/select-theme', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('主题应用成功:', data.data);
            showNotification('主题选择成功，已更新配置');
            // 重新加载当前设置以显示新的主题
            loadCurrentSettings();
            
            // 调用保存按钮操作
            setTimeout(() => {
                if (typeof saveLoginBackground === 'function') saveLoginBackground();
                if (typeof saveLoginLogo === 'function') saveLoginLogo();
                if (typeof saveDeviceLogo === 'function') saveDeviceLogo();
            }, 500);
        } else {
            throw new Error(data.error || '主题应用失败');
        }
    })
    .catch(error => {
        console.error('应用主题失败:', error);
        showNotification('主题应用失败: ' + error.message, 'error');
    });
}

// 为主题选择按钮添加点击事件
function initThemeButtons() {
    // 使用事件委托处理动态生成的按钮
    document.getElementById('themeGrid').addEventListener('click', function(e) {
        if (e.target.closest('.theme-select-btn')) {
            const selectBtn = e.target.closest('.theme-select-btn');
            const themeCard = selectBtn.closest('.theme-card');
            const themeId = themeCard.dataset.themeId;
            
            // 获取对应主题的数据
            fetch('deskdata/theme.json')
                .then(response => response.json())
                .then(themes => {
                    const themeData = themes.find(t => t.ID.toString() === themeId);
                    if (themeData) {
                        applyTheme(themeData);
                    }
                })
                .catch(error => {
                    console.error('获取主题数据失败:', error);
                    showNotification('获取主题数据失败', 'error');
                });
        }
    });
}