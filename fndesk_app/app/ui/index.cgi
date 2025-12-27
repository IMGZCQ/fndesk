#!/bin/sh

# 生成 HTML 响应
cat <<EOF
Content-Type: text/html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fndesk 网络连接检测</title>
    <style>
        /* 页面基础样式 */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
        }
        
        /* 容器样式 */
        .container {
            max-width: 800px;
            margin: 50px auto;
            padding: 30px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        /* 标题样式 */
        h1 {
            color: #2c3e50;
            font-size: 28px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        h2 {
            color: #34495e;
            font-size: 22px;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        
        /* 状态文本样式 */
        #status {
            background-color: #e8f4f8;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 16px;
            min-height: 50px;
            display: flex;
            align-items: center;
        }
        
        /* 提示文本样式 */
        .info {
            color: #7f8c8d;
            font-size: 14px;
            text-align: center;
            margin-top: 20px;
        }
        
        /* 链接列表样式 */
        ul {
            list-style-type: none;
            padding: 0;
            margin: 20px 0;
        }
        
        ul li {
            margin: 10px 0;
        }
        
        /* 链接样式 */
        a {
            color: #3498db;
            text-decoration: none;
            font-size: 16px;
            transition: all 0.3s ease;
            display: inline-block;
            padding: 8px 12px;
            border: 1px solid #3498db;
            border-radius: 4px;
            background-color: white;
        }
        
        a:hover {
            color: white;
            background-color: #3498db;
            text-decoration: none;
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(52, 152, 219, 0.3);
        }
        
        /* 加载动画 */
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .loading {
            animation: pulse 1.5s infinite;
        }
    </style>
    <script>
        // 解析 URL 参数（简化版，确保能正确解析 uH1, uB1 等参数）
        function getQueryParams() {
            var params = {};
            
            // 使用更可靠的方法获取查询字符串
            var queryString = window.location.search;
            
            // 调试：输出原始查询字符串（包含?）
            console.log('原始查询字符串:', queryString);
            
            if (!queryString || queryString === '?') {
                return params;
            }
            
            // 移除开头的?
            queryString = queryString.substring(1);
            
            // 调试：输出处理后的查询字符串
            console.log('处理后的查询字符串:', queryString);
            
            // 使用正则表达式分割参数对，处理包含&和=的特殊情况
            var paramPairs = queryString.split(/&/g);
            
            for (var i = 0; i < paramPairs.length; i++) {
                var paramPair = paramPairs[i];
                if (paramPair) {
                    // 找到第一个=的位置
                    var equalsIndex = paramPair.indexOf('=');
                    if (equalsIndex > 0) {
                        // 解码参数名和值
                        var key = decodeURIComponent(paramPair.substring(0, equalsIndex));
                        var value = decodeURIComponent(paramPair.substring(equalsIndex + 1));
                        params[key] = value;
                        // 调试：输出解析到的键值对
                        console.log('解析到参数:', key, '=', value);
                    }
                }
            }
            
            return params;
        }

        // 构建 URL 列表（简化版，确保能正确构建 URL）
        function buildUrls() {
            var params = getQueryParams();
            var urls = [];
            var i = 1;
            var maxIndex = 10; // 设置最大检查数量，防止无限循环
            
            // 遍历检查 uH1, uB1, uH2, uB2 等参数，直到maxIndex
            for (var i = 1; i <= maxIndex; i++) {
                var uHKey = 'uH' + i;
                var uBKey = 'uB' + i;
                
                if (params[uHKey] && params[uBKey]) {
                    var uHValue = params[uHKey];
                    var uBValue = params[uBKey];
                    var url;
                    
                    // 检查是否为端口模式：uHx为/且uBx为数字
                    if (uHValue === '/' && /^\d+$/.test(uBValue)) {
                        // 使用当前访问的地址加上端口参数
                        var currentProtocol = window.location.protocol;
                        var currentHostname = window.location.hostname;
                        var port = uBValue;
                        url = currentProtocol + '//' + currentHostname + ':' + port;
                        console.log('构建端口模式 URL ' + i + ':', url);
                    } else if (uBValue.startsWith('/')) {
                        // 如果uBx是以/开头的，使用当前域名和端口
                        var currentProtocol = window.location.protocol;
                        var currentHost = window.location.host; // 包含域名和端口
                        url = currentProtocol + '//' + currentHost + uBValue;
                        console.log('构建当前域名路径模式 URL ' + i + ':', url);
                    } else {
                        // 原有逻辑：构建完整URL
                        var protocol = uHValue;
                        var domain = uBValue;
                        url = protocol + '://' + domain;
                        console.log('构建 URL ' + i + ':', url);
                    }
                    
                    urls.push(url);
                }
            }
            
            return urls;
        }

        // 检测 URL 是否可访问（完全按照 cqfndesk_CQ.js 中的 ping 函数实现，兼容旧浏览器）
        function checkUrlAccessibility(url, timeout) {
            timeout = timeout || 1000; // 默认2秒超时
            var startTime = new Date().getTime();
            
            console.log('开始可达性测试:', url, '超时设置:', timeout, 'ms');
            
            // 检查是否是内网IP
            function isInternalIp(url) {
                var ipPattern = /\b(?:10|127|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/;
                return ipPattern.test(url);
            }
            
            // 检查当前网络环境是否为内网
            function isInInternalNetwork() {
                // 尝试检测当前网络环境
                // 这里简化处理，直接返回false，让检测逻辑基于实际连接结果判断
                return false;
            }
            
            // 检查浏览器是否支持Promise
            if (typeof Promise !== 'function') {
                // 不支持Promise的浏览器，使用传统回调方式
                return new Promise(function(resolve) {
                    // 直接使用XMLHttpRequest检测
                    var xhr = new XMLHttpRequest();
                    var timeoutId = setTimeout(function() {
                        xhr.abort();
                        resolve(false);
                    }, timeout);
                    
                    xhr.onload = function() {
                        clearTimeout(timeoutId);
                        // 检查HTTP响应状态码，只将2xx和3xx视为成功
                        if (xhr.status >= 200 && xhr.status < 400) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    };
                    
                    xhr.onerror = function() {
                        clearTimeout(timeoutId);
                        // 只有在内网环境下，内网资源才会被特殊处理
                        if (isInternalIp(url) && isInInternalNetwork()) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    };
                    
                    xhr.ontimeout = function() {
                        clearTimeout(timeoutId);
                        resolve(false);
                    };
                    
                    try {
                        xhr.open('HEAD', url + '?' + new Date().getTime(), true);
                        xhr.timeout = timeout;
                        xhr.send();
                    } catch (error) {
                        clearTimeout(timeoutId);
                        resolve(false);
                    }
                });
            }
            
            // XMLHttpRequest 备用检测函数
            function fallbackWithXHR(url, remainingTimeout) {
                return new Promise(function(resolve) {
                    var xhr = new XMLHttpRequest();
                    var fallbackTimeoutId = setTimeout(function() {
                        xhr.abort();
                        resolve(false);
                    }, remainingTimeout > 0 ? remainingTimeout : 1000);
                    
                    xhr.onload = function() {
                        clearTimeout(fallbackTimeoutId);
                        // 检查HTTP响应状态码，只将2xx和3xx视为成功
                        if (xhr.status >= 200 && xhr.status < 400) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    };
                    
                    xhr.onerror = function() {
                        clearTimeout(fallbackTimeoutId);
                        // 只有在内网环境下，内网资源才会被特殊处理
                        if (isInternalIp(url) && isInInternalNetwork()) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    };
                    
                    xhr.ontimeout = function() {
                        clearTimeout(fallbackTimeoutId);
                        resolve(false);
                    };
                    
                    try {
                        xhr.open('HEAD', url + '?' + new Date().getTime(), true);
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
            
            return new Promise(function(resolve) {
                // 检查URL是否是HTTP（不安全）且当前页面是HTTPS
                var isCurrentHttps = window.location.protocol === 'https:';
                var isTargetHttp = url.indexOf('http:') === 0;
                
                // 如果是混合内容情况，使用XMLHttpRequest作为备用方案
                if (isCurrentHttps && isTargetHttp) {
                    console.log('检测到混合内容:', 'HTTPS页面尝试访问HTTP资源，将使用XMLHttpRequest');
                    
                    var xhr = new XMLHttpRequest();
                    var timeoutId = setTimeout(function() {
                        console.log('超时:', url, '(' + (new Date().getTime() - startTime) + 'ms)');
                        xhr.abort();
                        resolve(false);
                    }, timeout);
                    
                    xhr.onload = function() {
                        clearTimeout(timeoutId);
                        // 检查HTTP响应状态码，只将2xx和3xx视为成功
                        if (xhr.status >= 200 && xhr.status < 400) {
                            console.log('可达:', url, '状态码:', xhr.status);
                            resolve(true);
                        } else {
                            console.log('不可达:', url, '状态码:', xhr.status);
                            resolve(false);
                        }
                    };
                    
                    xhr.onerror = function() {
                        clearTimeout(timeoutId);
                        console.log('错误:', url, '(' + (new Date().getTime() - startTime) + 'ms)');
                        // 只有在内网环境下，内网资源才会被特殊处理
                        if (isInternalIp(url) && isInInternalNetwork()) {
                            console.log('内网资源可能可达:', url);
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    };
                    
                    xhr.ontimeout = function() {
                        clearTimeout(timeoutId);
                        console.log('请求超时:', url);
                        resolve(false);
                    };
                    
                    try {
                        xhr.open('HEAD', url + '?' + new Date().getTime(), true); // 添加时间戳避免缓存
                        xhr.timeout = timeout;
                        xhr.send();
                    } catch (error) {
                        clearTimeout(timeoutId);
                        console.log('发送请求失败:', url, '错误:', error.message);
                        resolve(false);
                    }
                    
                    return;
                }
                
                // 正常情况使用fetch（如果浏览器支持）
                if (typeof fetch === 'function') {
                    // 检查是否支持AbortController
                    var controller = null;
                    var useAbortController = typeof AbortController === 'function';
                    
                    if (useAbortController) {
                        controller = new AbortController();
                    }
                    
                    var timeoutId = setTimeout(function() {
                        console.log('超时:', url, '(' + (new Date().getTime() - startTime) + 'ms)');
                        if (useAbortController) {
                            controller.abort();
                        }
                    }, timeout);
                    
                    var fetchOptions = {
                        method: 'HEAD',
                        mode: 'no-cors'
                    };
                    
                    if (useAbortController) {
                        fetchOptions.signal = controller.signal;
                    }
                    
                    fetch(url + '?' + new Date().getTime(), fetchOptions)
                    .then(function() {
                        clearTimeout(timeoutId);
                        var duration = new Date().getTime() - startTime;
                        console.log('成功:', url, '(' + duration + 'ms)');
                        resolve(true); // 成功连接
                    })
                    .catch(function(error) {
                        clearTimeout(timeoutId);
                        var duration = new Date().getTime() - startTime;
                        console.log('错误:', url, '(' + duration + 'ms)', '错误类型:', error.name || '未知错误');
                        
                        // 对于网络错误，尝试使用XMLHttpRequest作为备用
                        if (error.name === 'TypeError' || error.name === 'AbortError') {
                            console.log('尝试使用XMLHttpRequest作为备用:', url);
                            fallbackWithXHR(url, timeout - duration)
                                .then(function(result) {
                                    resolve(result);
                                });
                        } else {
                            resolve(false); // 连接失败
                        }
                    });
                } else {
            // 不支持fetch的浏览器，直接使用XMLHttpRequest
            var xhr = new XMLHttpRequest();
            var timeoutId = setTimeout(function() {
                xhr.abort();
                resolve(false);
            }, timeout);
            
            xhr.onload = function() {
                clearTimeout(timeoutId);
                // 检查HTTP响应状态码，只将2xx和3xx视为成功
                if (xhr.status >= 200 && xhr.status < 400) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            };
            
            xhr.onerror = function() {
                clearTimeout(timeoutId);
                // 只有在内网环境下，内网资源才会被特殊处理
                if (isInternalIp(url) && isInInternalNetwork()) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            };
            
            xhr.ontimeout = function() {
                clearTimeout(timeoutId);
                resolve(false);
            };
            
            try {
                xhr.open('HEAD', url + '?' + new Date().getTime(), true);
                xhr.timeout = timeout;
                xhr.send();
            } catch (error) {
                clearTimeout(timeoutId);
                resolve(false);
            }
        }
            });
        }

        // 按顺序检测 URL 并跳转
        function checkAndRedirect() {
            // 添加调试信息
            console.log('开始检测 URL...');
            
            var urls = buildUrls();
            var statusElement = document.getElementById('status');
            
            // 调试：输出解析到的 URL 列表
            console.log('解析到的 URL 列表:', urls);
            
            if (urls.length === 0) {
                statusElement.innerHTML = '没有检测到有效的 URL 参数';
                return;
            }
            
            // 单个 URL 直接跳转
            if (urls.length === 1) {
                statusElement.innerHTML = '检测到单个 URL，正在直接跳转：' + urls[0];
                console.log('单个 URL，直接跳转:', urls[0]);
                window.location.href = urls[0];
                return;
            }
            
            // 两个 URL 逻辑：检测第一个，不可达则直接跳转第二个
            var firstUrl = urls[0];
            var secondUrl = urls[1];
            
            statusElement.innerHTML = '正在检测第一个 URL：' + firstUrl;
            console.log('开始检测第一个 URL:', firstUrl);
            
            checkUrlAccessibility(firstUrl, 1000) // 2秒超时
                .then(function(accessible) {
                    console.log('第一个 URL 检测结果:', firstUrl, accessible);
                    
                    if (accessible) {
                        statusElement.innerHTML = '第一个 URL 可达，正在跳转：' + firstUrl;
                        window.location.href = firstUrl;
                    } else {
                        statusElement.innerHTML = '第一个 URL 不可达，正在直接跳转第二个 URL：' + secondUrl;
                        console.log('第一个 URL 不可达，直接跳转第二个 URL:', secondUrl);
                        window.location.href = secondUrl;
                    }
                })
                .catch(function(error) {
                    console.log('第一个 URL 检测异常:', firstUrl, error);
                    // 检测异常时，直接跳转第二个 URL
                    statusElement.innerHTML = '第一个 URL 检测异常，正在直接跳转第二个 URL：' + secondUrl;
                    window.location.href = secondUrl;
                });
        }

        // 页面加载完成后执行检测
        window.onload = checkAndRedirect;
    </script>
</head>
<body>
    <div class="container">
        <h1>正在检测可访问的 URL...</h1>
        <p id="status" class="loading">准备开始检测...</p>
        <p class="info">如果检测到可访问的 URL，将自动跳转...</p>
    </div>
</body>
</html>
EOF