// 导入所需模块
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 常量定义
const DATA_FILE_PATH = path.join(__dirname, 'deskdata', 'data.json');
const IMG_DIR_PATH = path.join(__dirname, 'deskdata', 'img');
const PW_FILE_PATH = path.join(__dirname, 'deskdata', 'pw.json');
const FNSTYLE_FILE_PATH = path.join(__dirname, 'deskdata', 'fnstyle.json');

// 简单的加密函数（XOR加密）
function simpleEncrypt(text) {
    const key = 'deskmanager';
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return Buffer.from(result).toString('base64');
}

// 简单的解密函数
function simpleDecrypt(encryptedText) {
    const key = 'deskmanager';
    const decoded = Buffer.from(encryptedText, 'base64').toString();
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

// 确保密码文件存在
function ensurePasswordFile() {
    try {
        if (!fs.existsSync(PW_FILE_PATH)) {
            // 创建deskdata目录（如果不存在）
            ensureDirectoryExists(path.dirname(PW_FILE_PATH));
            
            // 默认密码为'admin123'
            //  const defaultPassword = simpleEncrypt('admin123');
            //  fs.writeFileSync(PW_FILE_PATH, JSON.stringify({ password: defaultPassword }), 'utf8');
           //   console.log('密码文件已创建，默认密码: admin123');
        }
    } catch (error) {
        console.error('创建密码文件失败:', error);
    }
}

// 确保目录存在
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        //console.log(`目录已创建: ${dirPath}`);
    }
}

// 从URL下载文件的辅助函数
function downloadFileFromUrl(url, filePath) {
    return new Promise((resolve, reject) => {
        // 设置请求选项
        const options = {
            timeout: 10000, // 10秒超时
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };
        
        // 确定使用http还是https
        const https = require('https');
        const protocol = url.startsWith('https') ? https : require('http');
        
        // 创建写入流
        const fileStream = fs.createWriteStream(filePath);
        
        // 发送请求下载文件
        const req = protocol.get(url, options, (res) => {
            // 检查响应状态码
            if (res.statusCode !== 200) {
                res.resume(); // 消耗响应数据以释放连接
                fileStream.close();
                // 如果文件已创建，删除它
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (unlinkErr) {
                        console.error('删除失败的文件时出错:', unlinkErr);
                    }
                }
                reject(new Error(`下载文件失败，状态码: ${res.statusCode}`));
                return;
            }
            
            // 将响应流管道到文件流
            res.pipe(fileStream);
            
            // 监听文件写入完成
            fileStream.on('finish', () => {
                fileStream.close();
                
                // 验证文件是否成功创建且不为空
                if (fs.existsSync(filePath)) {
                    const stats = fs.statSync(filePath);
                    if (stats.size === 0) {
                        // 文件为空，删除它
                        fs.unlinkSync(filePath);
                        reject(new Error('下载的文件为空'));
                        return;
                    }
                    
                    // 设置文件权限
                    fs.chmodSync(filePath, 0o644);
                  //  console.log(`已设置文件权限: ${filePath}`);
                    
                    resolve(filePath);
                } else {
                    reject(new Error('文件保存失败'));
                }
            });
        });
        
        // 监听错误
        req.on('error', (err) => {
            fileStream.close();
            // 如果文件已创建，删除它
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                    console.error('删除失败的文件时出错:', unlinkErr);
                }
            }
            reject(err);
        });
        
        // 监听超时
        req.on('timeout', () => {
            req.destroy();
            fileStream.close();
            // 如果文件已创建，删除它
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                    console.error('删除失败的文件时出错:', unlinkErr);
                }
            }
            reject(new Error('下载文件超时'));
        });
    });
}

// 读取数据
function readData() {
    try {
        if (!fs.existsSync(DATA_FILE_PATH)) {
            // 如果文件不存在，创建一个空数组
            ensureDirectoryExists(path.dirname(DATA_FILE_PATH));
            fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([]), 'utf8');
            return [];
        }
        // 直接使用buffer读取并尝试解析
        try {
            const buffer = fs.readFileSync(DATA_FILE_PATH);
            // 尝试以utf8解析
            try {
                const data = buffer.toString('utf8');
                return JSON.parse(data);
            } catch (utf8Error) {
                // 如果utf8解析失败，尝试其他编码（这里简化处理）
                console.warn('使用utf8编码解析失败，尝试修复编码问题:', utf8Error);
                // 简化处理：直接返回空数组，避免服务器崩溃
                return [];
            }
        } catch (readError) {
            console.error('读取文件失败:', readError);
            return [];
        }
    } catch (error) {
        console.error('读取数据出错:', error);
        return [];
    }
}

// 写入数据
function writeData(data) {
    try {
        ensureDirectoryExists(path.dirname(DATA_FILE_PATH));
        // 使用utf8编码写入，确保数据一致性
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('写入数据出错:', error);
        return false;
    }
}

// 获取favicon URL - 支持原始域名和主域名备选策略
function getFaviconUrl(targetUrl) {
    try {
        // 解析URL获取协议和完整主机名
        const parsedUrl = new URL(targetUrl);
        const protocol = parsedUrl.protocol;
        const host = parsedUrl.host;
        
        // 创建结果对象，包含主要URL和备选URL
        const result = {
            primary: `${protocol}//${host}/favicon.ico`,
            secondary: null
        };
        
        // 尝试提取主域名（例如从t.bilibili.com提取bilibili.com）
        const hostParts = host.split('.');
        if (hostParts.length >= 3) {
            // 如果是多级域名，尝试提取主域名（最后两个部分）
            // 例如：t.bilibili.com -> bilibili.com
            const mainDomain = `${hostParts[hostParts.length - 2]}.${hostParts[hostParts.length - 1]}`;
            result.secondary = `${protocol}//${mainDomain}/favicon.ico`;
        }
        
        return result;
    } catch (error) {
        console.error('解析URL出错:', error);
        return { primary: null, secondary: null };
    }
}

// 修改HTML文件
function modifyHtmlFile(targetPath) {
    try {
        if (fs.existsSync(targetPath)) {
            const content = fs.readFileSync(targetPath, 'utf8');
            // 清空<body>与<div id="root">之间的内容，并插入脚本
            const bodyRootRegex = /<body>([\s\S]*)<div id="root">/;
            if (bodyRootRegex.test(content)) {
                const modifiedContent = content.replace(bodyRootRegex, '<body>\n    <script src="./cqfndesk.js"></script>\n    <div id="root">');
                fs.writeFileSync(targetPath, modifiedContent);
                //console.log('HTML文件已修改');
                return true;
            } else {
                console.log('未找到匹配的<body>和<div id="root">结构');
                return false;
            }
        } else {
            console.log('目标HTML文件不存在');
            return false;
        }
    } catch (error) {
        console.error('修改HTML文件失败:', error);
        return false;
    }
}

// 递归设置目录和文件权限的辅助函数
function setPermissionsRecursively(dirPath) {
    try {
        // 设置目录本身的权限
        fs.chmodSync(dirPath, 0o755);
        
        // 读取目录内容
        const items = fs.readdirSync(dirPath);
        
        // 遍历目录中的每个项目
        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stat = fs.lstatSync(itemPath);
            
            if (stat.isDirectory()) {
                // 递归处理子目录
                setPermissionsRecursively(itemPath);
            } else {
                // 设置文件权限
                fs.chmodSync(itemPath, 0o644);
            }
        });
    } catch (error) {
        console.error('设置权限时出错:', error);
        throw error;
    }
}

// 处理API请求
function handleApiRequest(request, response) {
    // 解析URL
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;
    
    // 处理公告代理API
    if (pathname === '/api/announcement') {
        // 设置响应头允许CORS
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET');
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        
        // 使用http/https模块获取远程公告内容
        const https = require('https');
        const targetUrl = parsedUrl.query.url || 'https://sh.on79.cfd/fndesk.html';
        
        //console.log(`代理请求公告内容: ${targetUrl}`);
        
        https.get(targetUrl, (res) => {
            let data = '';
            
            // 接收数据
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            // 请求完成
            res.on('end', () => {
                // 返回获取到的内容
                response.writeHead(res.statusCode, {
                    'Content-Type': 'text/html; charset=utf-8'
                });
                response.end(data);
            });
        }).on('error', (error) => {
            console.error('获取公告内容失败:', error.message);
            response.writeHead(500, {
                'Content-Type': 'text/html; charset=utf-8'
            });
            response.end(`<div class="error-message">获取公告失败: ${error.message}</div>`);
        });
        return;
    }
    
    // 处理数据合并API
    if (pathname === '/api/merge-data' && request.method === 'POST') {
        // 设置响应头允许CORS
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        
        // 读取请求体
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        
        request.on('end', () => {
            try {
                // 解析请求体
                const requestData = body ? JSON.parse(body) : {};
                
                // 验证是否有确认标志
                if (!requestData.confirm) {
                    console.log('数据合并请求缺少确认标志，拒绝执行');
                    response.writeHead(400);
                    response.end(JSON.stringify({
                        success: false,
                        message: '请求缺少确认标志，请确认操作后重试'
                    }));
                    return;
                }
                
                console.log('收到带确认标志的数据合并请求，开始执行...');
            // 定义文件路径
            const fniconPath = path.join(__dirname, 'deskdata', 'fnicon.json');
            const dataPath = DATA_FILE_PATH;
            
            // 检查fnicon.json是否存在
            if (!fs.existsSync(fniconPath)) {
                throw new Error('fnicon.json文件不存在');
            }
            
            // 读取fnicon.json数据
            const fniconData = JSON.parse(fs.readFileSync(fniconPath, 'utf8'));
            if (!Array.isArray(fniconData)) {
                throw new Error('fnicon.json格式错误，不是有效的数组');
            }
            
            // 读取现有的data.json数据
            let dataJson = readData();
            
            // 找出当前最大的id值
            let maxId = 0;
            if (dataJson.length > 0) {
                maxId = Math.max(...dataJson.map(item => parseInt(item.id) || 0));
            }
            
            // 处理并合并数据
            let processedCount = 0;
            const newRecords = [];
            
            fniconData.forEach((fniconItem, index) => {
                // 生成新的id
                maxId++;
                processedCount++;
                
                // 处理URL替换逻辑
                let localImageUrl = fniconItem.本地图片URL || '';
                // 将"/conf/"替换为"/deskdata/img/"
                if (localImageUrl.includes('/conf/')) {
                    localImageUrl = localImageUrl.replace('/conf/', '/deskdata/img/');
                }
                
                // 创建新记录，应用合并规则
                const newRecord = {
                    id: maxId, // 数字类型
                    序号: maxId, // 数字类型，等于id
                    类型: 0, // 数字类型，默认0
                    归属: 0, // 数字类型，默认0
                    标题: fniconItem.标题 || fniconItem.title || '',
                    外网跳转URL: fniconItem.外网跳转URL || '',
                    内网跳转URL: fniconItem.内网跳转URL || '',
                    网络图片URL: fniconItem.网络图片URL || '',
                    本地图片URL: localImageUrl,
                    备用URL1: '',
                    备用URL2: '',
                    备用URL3: ''
                };
                
                newRecords.push(newRecord);
            });
            
            // 合并到现有数据中
            const updatedData = [...dataJson, ...newRecords];
            
            // 写入更新后的数据
            const writeSuccess = writeData(updatedData);
            if (!writeSuccess) {
                throw new Error('写入数据失败');
            }
            
            console.log(`数据合并完成！处理了 ${processedCount} 条记录`);
            
                // 返回成功响应
                response.writeHead(200);
                response.end(JSON.stringify({
                    success: true,
                    processedCount: processedCount,
                    message: '数据合并成功'
                }));
                
            } catch (error) {
                console.error('数据合并失败:', error.message);
                
                // 返回错误响应
                response.writeHead(500);
                response.end(JSON.stringify({
                    success: false,
                    message: error.message
                }));
            }
        });
        return;
    }

    // 检查文件是否存在的API
    if (pathname === '/api/check-file' && request.method === 'POST') {
        response.setHeader('Content-Type', 'application/json');
        
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        
        request.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const filePath = path.join(__dirname, requestData.filePath);
                
                response.writeHead(200);
                response.end(JSON.stringify({
                    exists: fs.existsSync(filePath)
                }));
            } catch (error) {
                console.error('检查文件时出错:', error);
                response.writeHead(500);
                response.end(JSON.stringify({
                    exists: false,
                    error: error.message
                }));
            }
        });
        return;
    }
    
    // 还原桌面的API
    if (pathname === '/api/reset-desktop' && request.method === 'POST') {
        response.setHeader('Content-Type', 'application/json');
        
        try {
            const wwwBakPath = path.join(__dirname, 'res', 'www.bak');
            const wwwZipPath = path.join(__dirname, 'res', 'www.zip');
            
            // 检查res/www.bak是否存在
            if (!fs.existsSync(wwwBakPath)) {
                response.writeHead(404);
                response.end(JSON.stringify({
                    success: false,
                    error: '系统源文件不存在！'
                }));
                return;
            }
            
            // 删除www.zip（如果存在）
            if (fs.existsSync(wwwZipPath)) {
                fs.unlinkSync(wwwZipPath);
                console.log('已删除旧的www.zip文件');
            }
            
            // 复制res/www.bak到当前目录，命名为www.zip
            fs.copyFileSync(wwwBakPath, wwwZipPath);
            
            // 设置文件权限
            fs.chmodSync(wwwZipPath, 0o644);
            console.log('系统还原文件已准备好: www.zip');
            
            response.writeHead(200);
            response.end(JSON.stringify({
                success: true,
                message: '系统还原成功，请重启系统。'
            }));
        } catch (error) {
            console.error('还原桌面时出错:', error);
            response.writeHead(500);
            response.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        }
        return;
    }
    
    // 处理数据API
    if (pathname.startsWith('/api/data')) {
        // 获取、添加、更新或删除数据
        switch (request.method) {
            case 'GET':
                // 获取数据
                const data = readData();
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(data));
                break;

            case 'POST':
                // 添加或更新数据 - 前端发送的是完整数据数组
                let body = '';
                request.on('data', (chunk) => {
                    body += chunk;
                });

                request.on('end', () => {
                    try {
                        const receivedData = JSON.parse(body);
                        
                        // 检查是否是数组（前端发送整个数据数组）
                        if (Array.isArray(receivedData)) {
                            // 直接写入整个数据数组
                            const success = writeData(receivedData);
                            response.writeHead(200, { 'Content-Type': 'application/json' });
                            response.end(JSON.stringify({ success, message: success ? '数据保存成功' : '数据保存失败' }));
                        } else {
                            // 兼容处理单个数据对象的情况
                            const existingData = readData();
                            const index = existingData.findIndex(item => item.id === receivedData.id);
                            if (index !== -1) {
                                existingData[index] = receivedData;
                            } else {
                                existingData.push(receivedData);
                            }
                            const success = writeData(existingData);
                            response.writeHead(200, { 'Content-Type': 'application/json' });
                            response.end(JSON.stringify({ success, message: success ? '数据保存成功' : '数据保存失败' }));
                        }
                    } catch (error) {
                        console.error('处理POST请求出错:', error);
                        response.writeHead(400, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ success: false, message: '请求数据格式错误' }));
                    }
                });
                break;

            case 'DELETE':
                // 删除数据
                const id = parsedUrl.query.id;
                if (!id) {
                    response.writeHead(400, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: '缺少ID参数' }));
                    break;
                }

                const currentData = readData();
                const filteredData = currentData.filter(item => item.id !== id);
                const deleteSuccess = writeData(filteredData);
                
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: deleteSuccess, message: deleteSuccess ? '数据删除成功' : '数据删除失败' }));
                break;

            default:
                response.writeHead(405, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: false, message: '不支持的请求方法' }));
        }
        return;
    }

    // 处理图片下载API
    if (pathname === '/api/download-image') {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });

        request.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const { id, imageUrl, urls = [], type } = requestData;
                
                // 优先使用networkImageUrl，如果不存在则使用imageUrl（保持兼容性）
                const networkImageUrl = requestData.networkImageUrl || imageUrl;
                
                if (!id) {
                    response.writeHead(400, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: '缺少必要参数id' }));
                    return;
                }

                // 确保目录存在
                ensureDirectoryExists(IMG_DIR_PATH);

                // 定义预设路径
                const defaultImagePath = path.join(IMG_DIR_PATH, type === 0 ? 'i.png' : 'f.png');
                const defaultImageUrl = `/deskdata/img/${type === 0 ? 'i.png' : 'f.png'}`;
                const defaultNetworkUrl = type === 1 ? 
                    'https://help-static.fnnas.com/images/文件管理.png' : 
                    'https://help-static.fnnas.com/images/Margin-1.png';
                
                // 简化的图片下载函数
                const downloadImage = (url, filename) => {
                    return new Promise((resolve, reject) => {
                        try {
                            // 根据URL协议选择http或https模块
                            const httpModule = url.startsWith('https') ? require('https') : require('http');
                            
                            // 从URL获取文件扩展名，如果没有则默认为png
                            let fileExtension = path.extname(filename) || path.extname(new URL(url).pathname) || '.png';
                            const finalFilename = `${id}${fileExtension}`;
                            const filePath = path.join(IMG_DIR_PATH, finalFilename);
                            
                            // 如果文件已存在，先删除
                            if (fs.existsSync(filePath)) {
                                try {
                                    fs.unlinkSync(filePath);
                                } catch (e) {
                                    console.warn(`删除旧文件失败: ${e.message}`);
                                }
                            }
                            
                            // 设置请求选项，包含超时和用户代理
                            const options = {
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                                },
                                timeout: 10000 // 10秒超时
                            };
                            
                            // 发送请求
                            const req = httpModule.get(url, options, (res) => {
                                // 处理重定向（301, 302, 303, 307, 308）
                                if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                                    console.log(`检测到重定向到: ${res.headers.location}`);
                                    // 跟随重定向
                                    downloadImage(res.headers.location, filename)
                                        .then(result => {
                                            result.imageUrl = url; // 保留原始URL
                                            resolve(result);
                                        })
                                        .catch(reject);
                                    return;
                                }
                                
                                // 检查响应状态和内容类型
                                const contentType = res.headers['content-type'] || '';
                                const isImage = contentType.startsWith('image/') || 
                                              contentType.includes('svg') || 
                                              contentType.includes('xml');
                                
                                if (res.statusCode !== 200 || !isImage) {
                                    reject(new Error(`无效的图片响应: ${res.statusCode}`));
                                    return;
                                }
                                
                                // 创建文件写入流并保存图片
                                const file = fs.createWriteStream(filePath);
                                res.pipe(file);
                                
                                file.on('finish', () => {
                                    file.close();
                                    // 验证文件大小
                                    try {
                                        const stats = fs.statSync(filePath);
                                        if (stats.size === 0) {
                                            fs.unlinkSync(filePath);
                                            reject(new Error('下载的文件为空'));
                                            return;
                                        }
                                        
                                        // 设置文件权限
                                        try {
                                            fs.chmodSync(filePath, '644');
                                        } catch (e) {
                                            console.warn(`设置文件权限失败: ${e.message}`);
                                        }
                                        
                                        resolve({
                                            success: true,
                                            filePath: `/deskdata/img/${finalFilename}`,
                                            imageUrl: url
                                        });
                                    } catch (e) {
                                        reject(new Error(`文件保存失败: ${e.message}`));
                                    }
                                });
                            });
                            
                            // 处理超时
                            req.on('timeout', () => {
                                console.error(`下载图片超时: ${url}`);
                                req.destroy();
                                reject(new Error('下载超时'));
                            });
                            
                            // 处理错误
                            req.on('error', (error) => {
                                console.error(`下载图片出错: ${error.message}`);
                                // 清理可能创建的空文件
                                if (fs.existsSync(filePath)) {
                                    try {
                                        fs.unlinkSync(filePath);
                                    } catch (e) {}
                                }
                                reject(error);
                            });
                        } catch (error) {
                            console.error(`下载过程出错: ${error.message}`);
                            reject(error);
                        }
                    });
                };

                // 简化的获取favicon URL函数 - 支持原始域名和主域名备选策略
                const getFaviconUrl = (baseUrl) => {
                    try {
                        const parsedUrl = new URL(baseUrl);
                        const protocol = parsedUrl.protocol;
                        const host = parsedUrl.host;
                        
                        // 创建结果对象，包含主要URL和备选URL
                        const result = {
                            primary: `${protocol}//${host}/favicon.ico`,
                            secondary: null
                        };
                        
                        // 尝试提取主域名
                        const hostParts = host.split('.');
                        if (hostParts.length >= 3) {
                            const mainDomain = `${hostParts[hostParts.length - 2]}.${hostParts[hostParts.length - 1]}`;
                            result.secondary = `${protocol}//${mainDomain}/favicon.ico`;
                        }
                        
                        return result;
                    } catch (e) {
                        console.error(`解析URL错误: ${e.message}`);
                        return { primary: null, secondary: null };
                    }
                };

                // 主下载流程 - 按照简化逻辑实现
                const mainDownloadProcess = async () => {
                    // 1. 首先尝试从networkImageUrl下载
                    if (networkImageUrl) {
                        try {
                            console.log(`尝试从networkImageUrl下载: ${networkImageUrl}`);
                            const fileExtension = path.extname(new URL(networkImageUrl).pathname) || '.png';
                            const filename = `${id}${fileExtension}`;
                            return await downloadImage(networkImageUrl, filename);
                        } catch (error) {
                            console.error(`networkImageUrl下载失败: ${error.message}`);
                        }
                    }

                    // 2. 如果networkImageUrl下载失败，从urls尝试获取favicon
                    for (const baseUrl of urls) {
                        const faviconUrls = getFaviconUrl(baseUrl);
                        
                        // 首先尝试primary URL
                        if (faviconUrls.primary) {
                            try {
                                console.log(`尝试从favicon下载(primary): ${faviconUrls.primary}`);
                                const result = await downloadImage(faviconUrls.primary, `${id}.ico`);
                                result.imageUrl = faviconUrls.primary;
                                return result;
                            } catch (error) {
                                console.error(`Primary favicon下载失败: ${error.message}`);
                                // 如果有secondary URL，则尝试它
                                if (faviconUrls.secondary) {
                                    try {
                                        console.log(`尝试从favicon下载(secondary): ${faviconUrls.secondary}`);
                                        const result = await downloadImage(faviconUrls.secondary, `${id}.ico`);
                                        result.imageUrl = faviconUrls.secondary;
                                        return result;
                                    } catch (secondaryError) {
                                        console.error(`Secondary favicon下载失败: ${secondaryError.message}`);
                                    }
                                }
                                // 继续尝试下一个URL
                                continue;
                            }
                        }
                    }

                    // 3. 所有尝试都失败，使用预设图片（区分图标或文件夹）
                    console.log(`所有下载尝试失败，使用默认图片`);
                    return { 
                        success: true, 
                        filePath: defaultImageUrl,
                        imageUrl: requestData.isAutoFetch ? defaultNetworkUrl : null
                    };
                };

                // 直接执行简化的下载流程
                mainDownloadProcess()
                    .then(result => {
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify(result));
                    })
                    .catch(error => {
                        console.error('下载流程失败:', error);
                        response.writeHead(500, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ 
                            success: false, 
                            message: '图片下载失败，请检查网络连接或URL是否正确',
                            error: error.message 
                        }));
                    });
            } catch (error) {
                console.error('处理下载请求出错:', error);
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: false, message: '请求数据格式错误' }));
            }
        });
        return;
    }

    // 应用配置API
    if (pathname === '/api/apply-config' && request.method === 'POST') {
        // 直接调用applyConfig函数
        try {
            applyConfig();
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: true, message: '配置应用成功' }));
        } catch (error) {
            console.error('应用配置出错:', error);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '应用配置失败' }));
        }
        return;
    }

    // 文件上传API - 用于上传图片
    if (pathname.startsWith('/api/upload') && request.method === 'POST') {
       // console.log('收到上传请求:', pathname);
        
        // 从URL路径中提取可能的文件类型信息
        let fileType = 'image';
        const pathParts = pathname.split('/');
        if (pathParts.length > 3) {
            fileType = pathParts[3]; // 例如 /api/upload/loginBackground
          //  console.log('从URL路径提取的文件类型:', fileType);
        }
        
        // 确定保存目录
        let saveDir;
        let useRecordTitle = false;
        
        if (fileType === 'localImg') {
            // 本地图片保存到deskdata/img目录
            saveDir = path.join(__dirname, 'deskdata', 'img');
            useRecordTitle = true;
        } else {
            // 其他图片保存到deskdata/fnstyle目录
            saveDir = path.join(__dirname, 'deskdata', 'fnstyle');
        }
        
        // 确保保存目录存在
        ensureDirectoryExists(saveDir);
       // console.log('保存目录路径:', saveDir);
        
        // 使用formidable处理文件上传
        const formidable = require('formidable');
        const form = new formidable.IncomingForm();
        form.uploadDir = saveDir;
        form.keepExtensions = false; // 我们将手动添加扩展名
        form.maxFileSize = 50 * 1024 * 1024; // 50MB限制
        
        form.parse(request, (err, fields, files) => {
            if (err) {
                console.error('文件上传解析错误:', err);
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: '文件上传失败: ' + err.message }));
                return;
            }
            
           // console.log('解析到的字段:', fields);
           // console.log('解析到的文件:', files);
            
            // 检查是否有文件上传
            const fileKey = Object.keys(files)[0]; // 获取第一个文件键
            
            if (!fileKey || !files[fileKey]) {
                console.error('未收到有效文件');
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: '未收到文件' }));
                return;
            }
            
            // 处理可能是数组或单个对象的文件
            let file;
            if (Array.isArray(files[fileKey])) {
                file = files[fileKey][0];
            } else {
                file = files[fileKey];
            }
            
            // 获取正确的临时文件路径（formidable版本差异）
            const originalPath = file.filepath || file.path;
            
            // 验证临时文件是否存在
            if (!fs.existsSync(originalPath)) {
                console.error('临时文件不存在:', originalPath);
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: '临时文件不存在' }));
                return;
            }
            
            // 获取原始文件扩展名
            const originalFilename = file.originalFilename || file.name || 'unknown';
            let fileExtension = path.extname(originalFilename).toLowerCase();
            
            // 如果没有扩展名，尝试从MIME类型推断
            if (!fileExtension) {
                const mimeType = file.mimetype || '';
                if (mimeType.includes('png')) fileExtension = '.png';
                else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) fileExtension = '.jpg';
                else if (mimeType.includes('gif')) fileExtension = '.gif';
                else if (mimeType.includes('svg')) fileExtension = '.svg';
                else if (mimeType.includes('ico')) fileExtension = '.ico';
                else {
                    fileExtension = '.png'; // 默认使用.png
                }
            }
            
            // 生成目标文件名
            let fileName;
            if (useRecordTitle && fields.id) {
                // 使用记录ID作为文件名
                fileName = `${fields.id}${fileExtension}`;
            } else {
                // 使用文件类型作为文件名
                fileName = `${fileType}${fileExtension}`;
            }
            
           // console.log('生成的目标文件名:', fileName);
            
            const newPath = path.join(saveDir, fileName);
          //  console.log('目标文件路径:', newPath);
            
            // 检查文件是否已存在，如果存在则先删除
            if (fs.existsSync(newPath)) {
                try {
                    fs.unlinkSync(newPath);
                  //  console.log('已删除旧文件:', fileName);
                } catch (unlinkError) {
                    console.error('删除旧文件失败:', unlinkError);
                    // 继续执行，不中断流程
                }
            }
            
            try {
                // 先验证临时文件是否可读
                const fileStats = fs.statSync(originalPath);
                
                // 重命名文件（使用同步版本以便更好地捕获错误）
                fs.renameSync(originalPath, newPath);
              //  console.log('文件重命名成功:', fileName);
                
                // 验证新文件是否存在
                if (!fs.existsSync(newPath)) {
                    throw new Error('文件重命名后不存在');
                }
                
                // 生成相对路径
                const relativePath = useRecordTitle 
                    ? `deskdata/img/${fileName}` // 注意：这里不需要开头的斜杠，因为用户要求直接是deskdata/img/文件名
                    : `/deskdata/fnstyle/${fileName}`;
             //   console.log('文件上传成功，相对路径:', relativePath);
                
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({
                    success: true,
                    path: relativePath,
                    filePath: useRecordTitle ? `deskdata/img/${fileName}` : relativePath, // 专门为localImg提供filePath字段
                    fileName: fileName
                }));
            } catch (renameErr) {
                console.error('文件重命名失败:', renameErr);
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: '文件处理失败: ' + renameErr.message }));
            }
        });
        return;
    }
    
    // fnstyle.json文件处理API
    if (pathname === '/api/fnstyle.json') {
        // 确保deskdata目录存在
        ensureDirectoryExists(path.dirname(FNSTYLE_FILE_PATH));
        
        // 处理GET请求 - 获取fnstyle.json文件内容
        if (request.method === 'GET') {
            try {
                // 如果文件不存在，创建一个空的fnstyle.json文件
                if (!fs.existsSync(FNSTYLE_FILE_PATH)) {
                    const defaultData = {
                        loginBackground: '',
                        loginLogo: '',
                        deviceLogo: '',
                        appTitle: '',
                        loginOpacity: ''
                    };
                    fs.writeFileSync(FNSTYLE_FILE_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(defaultData));
                } else {
                    // 读取文件内容
                    const fileContent = fs.readFileSync(FNSTYLE_FILE_PATH, 'utf8');
                    const data = JSON.parse(fileContent);
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(data));
                }
            } catch (error) {
                console.error('读取fnstyle.json文件出错:', error);
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: '读取文件失败' }));
            }
            return;
        }
        
        // 处理POST请求 - 更新fnstyle.json文件内容
        if (request.method === 'POST') {
            let body = '';
            request.on('data', chunk => {
                body += chunk.toString();
            });
            request.on('end', () => {
                try {
                    // 解析请求体数据
                    const newData = JSON.parse(body);
                    
                    // 读取现有文件内容
                    let existingData = {};
                    if (fs.existsSync(FNSTYLE_FILE_PATH)) {
                        const fileContent = fs.readFileSync(FNSTYLE_FILE_PATH, 'utf8');
                        existingData = JSON.parse(fileContent);
                    }
                    
                    // 合并新数据到现有数据
                    const updatedData = { ...existingData, ...newData };
                    
                    // 写入更新后的数据到文件
                    fs.writeFileSync(FNSTYLE_FILE_PATH, JSON.stringify(updatedData, null, 2), 'utf8');
                    
                    // 如果更新了loginBackground字段，修改login-form相关的js文件//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (newData.loginBackground) {
                        try {
                            const assetsDir = path.join(__dirname, 'res', 'tow', 'assets');
                            if (fs.existsSync(assetsDir)) {
                                // 读取目录中的所有文件
                                const files = fs.readdirSync(assetsDir);
                                // 过滤出所有以login-form开头且以.js结尾的文件
                                const loginFormJsFiles = files.filter(file => 
                                    file.startsWith('login-form') && file.endsWith('.js')
                                );
                                
                                // 处理每个匹配的文件
                                loginFormJsFiles.forEach(fileName => {
                                    const filePath = path.join(assetsDir, fileName);
                                    try {
                                        // 读取文件内容
                                        let fileContent = fs.readFileSync(filePath, 'utf8');
                                        
                                        // 替换url()中的内容
                                        const urlRegex = /backgroundImage:\s*(`|['"])url\([\s\S]*?\)\1/g;
                                        const updatedBackgroundUrl = newData.loginBackground;
                                        fileContent = fileContent.replace(urlRegex, `backgroundImage: \`url("$\{
       (() => {
         const targetDomains = ['5ddd.com', 'fnos.net'];
         const currentDomain = window.location.hostname;
         return targetDomains.some(domain => currentDomain.includes(domain))
           ? "/static/bg/wallpaper-1.webp"
           : "${updatedBackgroundUrl}"; })()
     }")\``);
                                        
                                        // 写回文件
                                        fs.writeFileSync(filePath, fileContent, 'utf8');
                                      //  console.log(`${fileName}文件中的背景图片URL已更新`);
                                        
                                        // 复制一份到fnw/assets目录
                                        try {
                                            const fnwAssetsDir = path.join(__dirname, 'fnw', 'assets');
                                            // 检查目标目录是否存在，不存在则不复制
                                            if (fs.existsSync(fnwAssetsDir)) {
                                                const fnwTargetPath = path.join(fnwAssetsDir, fileName);
                                                fs.copyFileSync(filePath, fnwTargetPath);
                                              //  console.log(`${fileName}文件已复制到fnw/assets目录`);
                                            } else {
                                             //   console.log('fnw/assets目录不存在，跳过文件复制');
                                            }
                                        } catch (copyError) {
                                            console.error(`复制${fileName}到fnw/assets目录失败:`, copyError);
                                        }
                                    } catch (fileError) {
                                        console.error(`修改${fileName}文件失败:`, fileError);
                                    }
                                });
                            }
                        } catch (error) {
                            console.error('查找或修改login-form相关js文件时出错:', error);
                            // 这里不抛出错误，因为主要的fnstyle.json更新已经成功
                        }
                    }
                    
                    // 如果更新了loginLogo字段，修改login-form相关的js文件
                    if (newData.loginLogo) {
                        try {
                            const assetsDir = path.join(__dirname, 'res', 'tow', 'assets');
                            if (fs.existsSync(assetsDir)) {
                                // 读取目录中的所有文件
                                const files = fs.readdirSync(assetsDir);
                                // 过滤出所有以login-form开头且以.js结尾的文件
                                const loginFormJsFiles = files.filter(file => 
                                    file.startsWith('login-form') && file.endsWith('.js')
                                );
                                 
                                // 处理每个匹配的文件
                                loginFormJsFiles.forEach(fileName => {
                                    const filePath = path.join(assetsDir, fileName);
                                    try {
                                        // 读取文件内容
                                        let fileContent = fs.readFileSync(filePath, 'utf8');
                                         
                                        // 替换o=""中的内容
                                        const logoRegex = /const o=([\s\S]*?)(?=,s=)/g;
                                        const updatedLogoUrl = newData.loginLogo;
                                        fileContent = fileContent.replace(logoRegex, `const o= (() => {
   const targetDomains = ['5ddd.com', 'fnos.net'];
   const currentDomain = window.location.hostname;
   return targetDomains.some(domain => currentDomain.includes(domain))  
     ? "data:image/svg+xml,%3csvg%20width='80'%20height='62'%20viewBox='0%200%2080%2062'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M71.7976%200C71.7976%200%2075.7039%207.62011%2073.9143%2012.0592C72.9983%2014.3316%2070.3423%2017.0402%2067.4317%2017.0402H29.3047C23.8248%2017.0402%2019.3824%2021.4416%2019.3824%2026.871V54.5285C19.3824%2058.6549%2022.7586%2062%2026.9234%2062H37.302C40.0054%2062%2042.197%2059.8286%2042.197%2057.1501V50.7825H49.3583C52.0618%2050.7825%2054.2534%2048.6111%2054.2534%2045.9326V40.3721C60.4044%2040.3721%2066.2097%2037.5272%2069.9786%2032.666L70.3048%2032.2452H50.9459C48.2425%2032.2452%2046.0509%2034.4166%2046.0509%2037.0951V41.5972C46.0509%2042.1818%2045.577%2042.6556%2044.9925%2042.6556H38.8896C36.1861%2042.6556%2033.9945%2044.827%2033.9945%2047.5055V51.9695C33.9945%2053.0209%2033.1422%2053.8731%2032.0909%2053.8731H29.4885C28.4372%2053.8731%2027.5849%2053.0209%2027.5849%2051.9695V26.871C27.5849%2025.9299%2028.3549%2025.167%2029.3047%2025.167H70.0777C75.5577%2025.167%2080.0001%2020.7656%2080.0001%2015.3362C80.0001%2010.4052%2077.9446%205.69738%2074.3281%202.34542L71.7976%200ZM6.08573%2012.0965C4.29615%207.65745%208.2025%200.0373473%208.2025%200.0373473L5.67199%202.38276C2.05551%205.73472%200%2010.4425%200%2015.3735C0%2020.8029%204.4424%2025.2044%209.92237%2025.2044H12.3468C12.3657%2022.0411%2013.5657%2019.1578%2015.528%2016.9731C9.05215%2016.4551%206.89556%2014.1053%206.08573%2012.0965Z'%20fill='white'/%3e%3c/svg%3e" : "${updatedLogoUrl}";
})()`)
                                         
                                        // 写回文件
                                        fs.writeFileSync(filePath, fileContent, 'utf8');
                                         
                                        // 复制一份到fnw/assets目录
                                        try {
                                            const fnwAssetsDir = path.join(__dirname, 'fnw', 'assets');
                                            // 检查目标目录是否存在，不存在则不复制
                                            if (fs.existsSync(fnwAssetsDir)) {
                                                const fnwTargetPath = path.join(fnwAssetsDir, fileName);
                                                fs.copyFileSync(filePath, fnwTargetPath);
                                            }
                                        } catch (copyError) {
                                            console.error(`复制${fileName}到fnw/assets目录失败:`, copyError);
                                        }
                                    } catch (fileError) {
                                        console.error(`修改${fileName}文件失败:`, fileError);
                                    }
                                });
                            }
                        } catch (error) {
                            console.error('查找或修改login-form相关js文件时出错:', error);
                            // 这里不抛出错误，因为主要的fnstyle.json更新已经成功
                        }
                    }
                    
                    // 如果更新了deviceLogo字段，修改体积最大的js文件
                    if (newData.deviceLogo) {
                        try {
                            const assetsDir = path.join(__dirname, 'res', 'tow', 'assets');
                            if (fs.existsSync(assetsDir)) {
                                // 读取目录中的所有文件
                                const files = fs.readdirSync(assetsDir);
                                // 过滤出所有以.js结尾的文件
                                const jsFiles = files.filter(file => file.endsWith('.js'));
                                
                                if (jsFiles.length > 0) {
                                    // 找到体积最大的js文件
                                    let largestFile = null;
                                    let maxSize = -1;
                                    
                                    jsFiles.forEach(fileName => {
                                        const filePath = path.join(assetsDir, fileName);
                                        try {
                                            const stats = fs.statSync(filePath);
                                            if (stats.size > maxSize) {
                                                maxSize = stats.size;
                                                largestFile = fileName;
                                            }
                                        } catch (statError) {
                                            console.error(`获取${fileName}文件大小失败:`, statError);
                                        }
                                    });
                                    
                                    // 如果找到了最大的文件
                                    if (largestFile) {
                                        const filePath = path.join(assetsDir, largestFile);
                                        try {
                                            // 读取文件内容
                                            let fileContent = fs.readFileSync(filePath, 'utf8');
                                             
                                            // 替换t8=""和LR=""中的内容
                                            const deviceLogoRegexT8 = /t8=\s*"(.*?)"/g;
                                            const deviceLogoRegexLR = /LR=\s*"(.*?)"/g;
                                            const updatedDeviceLogoUrl = newData.deviceLogo;
                                            fileContent = fileContent.replace(deviceLogoRegexT8, `t8="${updatedDeviceLogoUrl}"`);
                                            fileContent = fileContent.replace(deviceLogoRegexLR, `LR="${updatedDeviceLogoUrl}"`);
                                             
                                            // 写回文件
                                            fs.writeFileSync(filePath, fileContent, 'utf8');
                                             
                                            // 复制一份到fnw/assets目录
                                            try {
                                                const fnwAssetsDir = path.join(__dirname, 'fnw', 'assets');
                                                // 检查目标目录是否存在，不存在则不复制
                                                if (fs.existsSync(fnwAssetsDir)) {
                                                    const fnwTargetPath = path.join(fnwAssetsDir, largestFile);
                                                    fs.copyFileSync(filePath, fnwTargetPath);
                                                }
                                            } catch (copyError) {
                                                console.error(`复制${largestFile}到fnw/assets目录失败:`, copyError);
                                            }
                                        } catch (fileError) {
                                            console.error(`修改${largestFile}文件失败:`, fileError);
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.error('查找或修改体积最大的js文件时出错:', error);
                            // 这里不抛出错误，因为主要的fnstyle.json更新已经成功
                        }
                    }

                    // 如果更新了loginOpacity字段，修改体积最大的css文件
                    if (newData.loginOpacity) {
                        try {
                            const assetsDir = path.join(__dirname, 'res', 'tow', 'assets');
                            if (fs.existsSync(assetsDir)) {
                                // 读取目录中的所有文件
                                const files = fs.readdirSync(assetsDir);
                                // 过滤出所有以.css结尾的文件
                                const cssFiles = files.filter(file => file.endsWith('.css'));
                                 
                                if (cssFiles.length > 0) {
                                    // 找到体积最大的css文件
                                    let largestFile = null;
                                    let maxSize = -1;
                                     
                                    cssFiles.forEach(fileName => {
                                        const filePath = path.join(assetsDir, fileName);
                                        try {
                                            const stats = fs.statSync(filePath);
                                            if (stats.size > maxSize) {
                                                maxSize = stats.size;
                                                largestFile = fileName;
                                            }
                                        } catch (statError) {
                                            console.error(`获取${fileName}文件大小失败:`, statError);
                                        }
                                    });
                                     
                                    // 如果找到了最大的文件
                                    if (largestFile) {
                                        const filePath = path.join(assetsDir, largestFile);
                                        try {
                                            // 读取文件内容
                                            let fileContent = fs.readFileSync(filePath, 'utf8');
                                              
                                            // 替换--un-backdrop-blur:blur()括号中的内容，添加px单位
                                            const blurRegex = /--un-backdrop-blur:\s*blur\(([^)]*)\)/g;
                                            const updatedBlurValue = newData.loginOpacity + 'px';
                                            fileContent = fileContent.replace(blurRegex, `--un-backdrop-blur:blur(${updatedBlurValue})`);
                                              
                                            // 写回文件
                                            fs.writeFileSync(filePath, fileContent, 'utf8');
                                              
                                            // 复制一份到fnw/assets目录
                                            try {
                                                const fnwAssetsDir = path.join(__dirname, 'fnw', 'assets');
                                                // 检查目标目录是否存在，不存在则不复制
                                                if (fs.existsSync(fnwAssetsDir)) {
                                                    const fnwTargetPath = path.join(fnwAssetsDir, largestFile);
                                                    fs.copyFileSync(filePath, fnwTargetPath);
                                                }
                                            } catch (copyError) {
                                                console.error(`复制${largestFile}到fnw/assets目录失败:`, copyError);
                                            }
                                        } catch (fileError) {
                                            console.error(`修改${largestFile}文件失败:`, fileError);
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.error('查找或修改体积最大的css文件时出错:', error);
                            // 这里不抛出错误，因为主要的fnstyle.json更新已经成功
                        }
                    }

                    // 如果更新了webFavicon字段，修改index.html中的favicon
                    if (newData.webFavicon) {
                        try {
                            const indexHtmlPath = path.join(__dirname, 'res', 'tow', 'index.html');
                            if (fs.existsSync(indexHtmlPath)) {
                                // 读取文件内容
                                let fileContent = fs.readFileSync(indexHtmlPath, 'utf8');
                                
                                // 检查是否已有<link rel="icon">标签
                                const faviconRegex = /<link\s+rel=["']icon["'].*?>/gi;
                                const newFaviconTag = `<link rel="icon" href="${newData.webFavicon}">`;
                                
                                if (faviconRegex.test(fileContent)) {
                                    // 如果已有favicon标签，替换它
                                    fileContent = fileContent.replace(faviconRegex, newFaviconTag);
                                } else {
                                    // 如果没有favicon标签，在<head>标签内添加
                                    const headRegex = /<head>\s*/i;
                                    fileContent = fileContent.replace(headRegex, `<head>\n    ${newFaviconTag}`);
                                }
                                
                                // 写回文件
                                fs.writeFileSync(indexHtmlPath, fileContent, 'utf8');
                                
                                // 复制一份到fnw目录
                                try {
                                    const fnwDir = path.join(__dirname, 'fnw');
                                    // 检查目标目录是否存在，不存在则不复制
                                    if (fs.existsSync(fnwDir)) {
                                        const fnwTargetPath = path.join(fnwDir, 'index.html');
                                        fs.copyFileSync(indexHtmlPath, fnwTargetPath);
                                    }
                                } catch (copyError) {
                                    console.error('复制index.html到fnw目录失败:', copyError);
                                }
                            }
                        } catch (error) {
                            console.error('修改index.html文件时出错:', error);
                            // 这里不抛出错误，因为主要的fnstyle.json更新已经成功
                        }
                    }

                    // 如果更新了appTitle字段，修改相关文件
                    if (newData.appTitle) {
                        try {
                            // 1. 修改体积最大的js文件中的document.title
                            const assetsDir = path.join(__dirname, 'res', 'tow', 'assets');
                            if (fs.existsSync(assetsDir)) {
                                // 读取目录中的所有文件
                                const files = fs.readdirSync(assetsDir);
                                // 过滤出所有以.js结尾的文件
                                const jsFiles = files.filter(file => file.endsWith('.js'));
                                
                                if (jsFiles.length > 0) {
                                    // 找到体积最大的js文件
                                    let largestFile = null;
                                    let maxSize = -1;
                                    
                                    jsFiles.forEach(fileName => {
                                        const filePath = path.join(assetsDir, fileName);
                                        try {
                                            const stats = fs.statSync(filePath);
                                            if (stats.size > maxSize) {
                                                maxSize = stats.size;
                                                largestFile = fileName;
                                            }
                                        } catch (statError) {
                                            console.error(`获取${fileName}文件大小失败:`, statError);
                                        }
                                    });
                                    
                                    // 如果找到了最大的文件
                                    if (largestFile) {
                                        const filePath = path.join(assetsDir, largestFile);
                                        try {
                                            // 读取文件内容
                                            let fileContent = fs.readFileSync(filePath, 'utf8');
                                              
                                            // 替换document.title=`把``中的内容
                                            const titleRegex = /document\.title=\s*`([^`]*)`/g;
                                            const updatedTitle = newData.appTitle;
                                            fileContent = fileContent.replace(titleRegex, `document.title=\`${updatedTitle}\``);
                                              
                                            // 写回文件
                                            fs.writeFileSync(filePath, fileContent, 'utf8');
                                              
                                            // 复制一份到fnw/assets目录
                                            try {
                                                const fnwAssetsDir = path.join(__dirname, 'fnw', 'assets');
                                                // 检查目标目录是否存在，不存在则不复制
                                                if (fs.existsSync(fnwAssetsDir)) {
                                                    const fnwTargetPath = path.join(fnwAssetsDir, largestFile);
                                                    fs.copyFileSync(filePath, fnwTargetPath);
                                                }
                                            } catch (copyError) {
                                                console.error(`复制${largestFile}到fnw/assets目录失败:`, copyError);
                                            }
                                        } catch (fileError) {
                                            console.error(`修改${largestFile}文件失败:`, fileError);
                                        }
                                    }
                                }
                            }
                            
                            // 2. 修改index.html文件，在</body>和</html>之间添加JavaScript代码修改标题
                            const indexHtmlPath = path.join(__dirname, 'res', 'tow', 'index.html');
                            if (fs.existsSync(indexHtmlPath)) {
                                try {
                                    // 读取文件内容
                                    let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
                                       
                                    // 清空</body>和</html>之间的内容，并添加JavaScript代码
                                    const bodyEndRegex = /<\/body>([\s\S]*?)<\/html>/gis;
                                    const appTitleValue = newData.appTitle;
                                    const scriptCode = `<script>
      window.addEventListener('load', () => {
        const excludeDomains = ['5ddd.com', 'fnos.net'];
        const currentDomain = window.location.hostname;
        const shouldModify = !excludeDomains.some(domain => currentDomain.includes(domain));       
        if (shouldModify) {
          setTimeout(() => {
            document.title = "${appTitleValue}";
          }, 500);
        }
      });
    </script>`;
                                    htmlContent = htmlContent.replace(bodyEndRegex, `</body>\n    ${scriptCode}\n</html>`);
                                       
                                    // 写回文件
                                    fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
                                       
                                    // 复制一份到fnw目录
                                    try {
                                        const fnwDir = path.join(__dirname, 'fnw');
                                        // 检查目标目录是否存在，不存在则不复制
                                        if (fs.existsSync(fnwDir)) {
                                            const fnwTargetPath = path.join(fnwDir, 'index.html');
                                            fs.copyFileSync(indexHtmlPath, fnwTargetPath);
                                        }
                                    } catch (copyError) {
                                        console.error('复制index.html到fnw目录失败:', copyError);
                                    }
                                } catch (fileError) {
                                    console.error('修改index.html文件失败:', fileError);
                                }
                            }
                        } catch (error) {
                            console.error('查找或修改文件时出错:', error);
                            // 这里不抛出错误，因为主要的fnstyle.json更新已经成功
                        }
                    }                

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, message: '文件更新成功' }));
                } catch (error) {
                    console.error('更新fnstyle.json文件出错:', error);
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ error: '更新文件失败' }));
                }
            });
            return;
        }
    }

    // 退出程序API
    if (pathname === '/api/exit' && request.method === 'POST') {
        // 验证认证头
        const authToken = request.headers['x-auth-token'];
        if (!authToken || authToken !== 'authenticated') {
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '未授权' }));
            return;
        }
        
        try {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: true, message: '程序将自动重启以生效...' }));
            
            // 延迟几秒后退出程序
            setTimeout(() => {
                process.exit(0);
            }, 3000);
        } catch (error) {
            console.error('退出程序出错:', error);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '退出程序失败' }));
        }
        return;
    }

    // 检查密码文件状态API
    if (pathname === '/api/check-password-file' && request.method === 'GET') {
        try {
            const hasPasswordFile = fs.existsSync(PW_FILE_PATH);
            
            // 检查文件是否存在且包含有效数据
            if (hasPasswordFile) {
                try {
                    const savedData = JSON.parse(fs.readFileSync(PW_FILE_PATH, 'utf8'));
                    // 验证数据结构是否正确
                    const isValid = savedData && typeof savedData.password === 'string' && savedData.password.length > 0;
                    
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ hasPasswordFile: isValid }));
                } catch (parseError) {
                    // 文件存在但解析失败，视为无效
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ hasPasswordFile: false }));
                }
            } else {
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ hasPasswordFile: false }));
            }
        } catch (error) {
            console.error('检查密码文件错误:', error);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ hasPasswordFile: false, error: '服务器内部错误' }));
        }
        return;
    }
    
    // 初始化密码API
    // 下载并覆盖theme.json文件API
    if (pathname === '/api/update-theme-file' && request.method === 'POST') {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });

        request.on('end', async () => {
            try {
                const requestData = JSON.parse(body);
                const { themeUrl } = requestData;
                
                if (!themeUrl) {
                    response.writeHead(400, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: '缺少必要参数themeUrl' }));
                    return;
                }

                // 定义theme.json文件路径和数据目录
                const DATA_DIR_PATH = 'deskdata';
                const THEME_FILE_PATH = path.join(DATA_DIR_PATH, 'theme.json');
                
                // 确保数据目录存在
                ensureDirectoryExists(DATA_DIR_PATH);
                
                // 下载文件函数 - 增强的临时文件策略确保原始文件安全
                const downloadThemeFile = (url, targetFilePath) => {
                    return new Promise((resolve, reject) => {
                        // 使用临时文件路径进行下载
                        const tempFilePath = targetFilePath + '.tmp';
                        
                        // 确保临时文件不存在，避免干扰
                        if (fs.existsSync(tempFilePath)) {
                            try {
                                fs.unlinkSync(tempFilePath);
                            } catch (err) {
                                console.error('清理旧临时文件失败:', err);
                            }
                        }
                        
                        try {
                            // 验证URL格式的有效性
                            let parsedUrl;
                            try {
                                parsedUrl = new URL(url);
                                if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                                    reject(new Error('无效的URL协议，只支持http和https'));
                                    return;
                                }
                            } catch (urlError) {
                                reject(new Error(`无效的URL格式: ${urlError.message}`));
                                return;
                            }
                            
                            const httpModule = parsedUrl.protocol === 'https:' ? require('https') : require('http');
                            const fileStream = fs.createWriteStream(tempFilePath);
                            
                            // 设置超时以避免长时间挂起
                            const request = httpModule.get(url, {
                                headers: {
                                    'Accept': 'application/json, text/plain, */*',
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                                },
                                timeout: 10000 // 10秒超时
                            }, (res) => {
                                // 处理重定向
                                if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                                    fileStream.close();
                                    // 清理临时文件
                                    if (fs.existsSync(tempFilePath)) {
                                        fs.unlinkSync(tempFilePath);
                                    }
                                    // 跟随重定向
                                    downloadThemeFile(res.headers.location, targetFilePath)
                                        .then(resolve)
                                        .catch(reject);
                                    return;
                                }

                                if (res.statusCode !== 200) {
                                    fileStream.close();
                                    // 清理临时文件
                                    if (fs.existsSync(tempFilePath)) {
                                        fs.unlinkSync(tempFilePath);
                                    }
                                    reject(new Error(`下载失败: ${res.statusCode}`));
                                    return;
                                }

                                // 保存到临时文件
                                res.pipe(fileStream);

                                fileStream.on('finish', () => {
                                    fileStream.close();
                                    
                                    // 验证临时文件大小，确保不为空
                                    const stats = fs.statSync(tempFilePath);
                                    if (stats.size === 0) {
                                        fs.unlinkSync(tempFilePath);
                                        reject(new Error('下载的文件为空'));
                                        return;
                                    }
                                    
                                    // 验证文件内容是否为有效的JSON
                                    try {
                                        const fileContent = fs.readFileSync(tempFilePath, 'utf8');
                                        // 尝试解析JSON
                                        const parsedContent = JSON.parse(fileContent);
                                        
                                        // 进一步验证JSON内容格式是否符合预期（是数组）
                                        if (!Array.isArray(parsedContent)) {
                                            fs.unlinkSync(tempFilePath);
                                            reject(new Error('下载的JSON内容格式不符合预期，应为数组'));
                                            return;
                                        }
                                        
                                       // console.log('验证JSON成功，准备覆盖原始文件');
                                        // 验证成功后，将临时文件重命名为目标文件
                                        fs.renameSync(tempFilePath, targetFilePath);
                                        
                                        // 设置文件权限
                                        fs.chmodSync(targetFilePath, 0o644);
                                      //  console.log(`已设置主题配置文件权限: ${targetFilePath}`);
                                        
                                        resolve({ success: true });
                                    } catch (parseError) {
                                        // 删除无效的临时文件
                                        if (fs.existsSync(tempFilePath)) {
                                            fs.unlinkSync(tempFilePath);
                                        }
                                        reject(new Error(`下载的文件不是有效的JSON: ${parseError.message}`));
                                    }
                                });
                            });
                            
                            // 处理请求错误
                            request.on('error', (error) => {
                                fileStream.close();
                                // 确保临时文件被清理
                                if (fs.existsSync(tempFilePath)) {
                                    try {
                                        fs.unlinkSync(tempFilePath);
                                    } catch (err) {
                                        console.error('清理临时文件失败:', err);
                                    }
                                }
                                console.error('下载请求出错:', error);
                                reject(new Error(`下载出错: ${error.message}`));
                            });
                            
                            // 处理超时
                            request.on('timeout', () => {
                                request.destroy();
                                fileStream.close();
                                // 清理临时文件
                                if (fs.existsSync(tempFilePath)) {
                                    try {
                                        fs.unlinkSync(tempFilePath);
                                    } catch (err) {
                                        console.error('清理临时文件失败:', err);
                                    }
                                }
                                reject(new Error('下载请求超时'));
                            });
                            
                        } catch (error) {
                            console.error('处理下载请求异常:', error);
                            // 确保临时文件被清理
                            if (fs.existsSync(tempFilePath)) {
                                try {
                                    fs.unlinkSync(tempFilePath);
                                } catch (err) {
                                    console.error('清理临时文件失败:', err);
                                }
                            }
                            reject(new Error(`处理下载请求出错: ${error.message}`));
                        }
                    });
                };

                // 执行下载 - 只有在完全成功后才会覆盖原始文件
                const result = await downloadThemeFile(themeUrl, THEME_FILE_PATH);
                
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(result));
            } catch (error) {
                console.error('更新主题文件错误:', error);
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ 
                    success: false, 
                    message: error.message || '服务器内部错误' 
                }));
            }
        });
        return;
    }

    if (pathname === '/api/initialize-password' && request.method === 'POST') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            try {
                const data = JSON.parse(body);
                const password = data.password;
                
                // 验证密码
                if (!password || typeof password !== 'string') {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: '密码不能为空' }));
                    return;
                }
                
                if (password.length < 6 || password.length > 20) {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: '密码长度应为6-20位' }));
                    return;
                }
                
                // 确保目录存在
                ensureDirectoryExists(path.dirname(PW_FILE_PATH));
                
                // 加密密码并保存
                const encryptedPassword = simpleEncrypt(password);
                fs.writeFileSync(PW_FILE_PATH, JSON.stringify({ password: encryptedPassword }));
                
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: true, message: '密码初始化成功' }));
            } catch (error) {
                console.error('初始化密码错误:', error);
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: false, message: '服务器内部错误' }));
            }
        });
        return;
    }
    
    // 登录API
    if (pathname === '/api/login' && request.method === 'POST') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            try {
                const data = JSON.parse(body);
                const inputPassword = data.password;
                
                // 检查密码文件是否存在
                if (!fs.existsSync(PW_FILE_PATH)) {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: '密码文件不存在，请初始化密码' }));
                    return;
                }
                
                const pwData = JSON.parse(fs.readFileSync(PW_FILE_PATH, 'utf8'));
                const storedPassword = simpleDecrypt(pwData.password);
                
                if (inputPassword === storedPassword) {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, message: '登录成功' }));
                } else {
                    response.writeHead(401, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: '密码错误' }));
                }
            } catch (error) {
                console.error('登录请求处理错误:', error);
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: false, message: '服务器错误' }));
            }
        });
        return;
    }

    // 获取favicon API - 支持原始域名和主域名备选策略
    if (pathname === '/api/get-favicon') {
        const targetUrl = parsedUrl.query.url;
        if (!targetUrl) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '缺少URL参数' }));
            return;
        }

        // 生成favicon URLs（包含primary和secondary）
        const faviconUrls = getFaviconUrl(targetUrl);
        if (!faviconUrls.primary) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '无效的URL' }));
            return;
        }

        // 下载并返回favicon的函数
        const downloadAndReturnFavicon = (url) => {
            // 确定使用http还是https
            const httpModule = url.startsWith('https') ? require('https') : require('http');
            
            httpModule.get(url, (res) => {
                if (res.statusCode !== 200) {
                    return false; // 下载失败
                }

                // 保存favicon到临时文件
                const tempDir = path.join(__dirname, 'temp');
                ensureDirectoryExists(tempDir);
                const tempFilePath = path.join(tempDir, `favicon_${Date.now()}.ico`);
                const fileStream = fs.createWriteStream(tempFilePath);

                res.pipe(fileStream);

                fileStream.on('finish', () => {
                    fileStream.close();
                    // 读取文件内容
                    const fileContent = fs.readFileSync(tempFilePath);
                    // 删除临时文件
                    fs.unlinkSync(tempFilePath);
                    // 返回文件内容
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, faviconData: fileContent.toString('base64') }));
                });
                
                return true; // 下载成功启动
            }).on('error', () => {
                return false; // 下载失败
            });
        };

        // 首先尝试primary URL
        if (downloadAndReturnFavicon(faviconUrls.primary)) {
            return; // 下载已启动，等待完成
        }
        
        // 如果primary URL失败且有secondary URL，则尝试它
        if (faviconUrls.secondary && downloadAndReturnFavicon(faviconUrls.secondary)) {
            return; // 下载已启动，等待完成
        }
        
        // 如果所有尝试都失败，返回错误
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ success: false, message: '无法获取favicon' }));
        return;
    }

    // 处理从URL下载文件并保存到指定目录的API
    if (pathname === '/api/download-file') {
        if (request.method === 'POST') {
            let body = '';
            request.on('data', chunk => {
                body += chunk.toString();
            });
            request.on('end', () => {
                try {
                    // 解析请求体数据
                    const data = JSON.parse(body);
                    const { fileUrl, fileName } = data;
                    
                    // 验证参数
                    if (!fileUrl || !fileName) {
                        response.writeHead(400, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ error: '缺少必要参数' }));
                        return;
                    }
                    
                    // 确保保存目录存在
                    const saveDir = path.join(__dirname, 'deskdata', 'fnstyle');
                    ensureDirectoryExists(saveDir);
                    
                    // 生成目标文件路径
                    const filePath = path.join(saveDir, fileName);
                    
                    // 下载文件
                    downloadFileFromUrl(fileUrl, filePath)
                        .then(() => {
                            // 生成相对路径
                            const relativePath = `/deskdata/fnstyle/${fileName}`;
                            
                            response.writeHead(200, { 'Content-Type': 'application/json' });
                            response.end(JSON.stringify({
                                success: true,
                                path: relativePath,
                                fileName: fileName
                            }));
                        })
                        .catch(error => {
                            console.error('下载文件时出错:', error);
                            response.writeHead(500, { 'Content-Type': 'application/json' });
                            response.end(JSON.stringify({ error: '下载文件失败: ' + error.message }));
                        });
                    
                } catch (error) {
                    console.error('处理下载请求时出错:', error);
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ error: '服务器内部错误: ' + error.message }));
                }
            });
        } else {
            response.writeHead(405, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: '不支持的请求方法' }));
        }
        return;
    }
    
    // 处理选择主题的API
    if (pathname === '/api/select-theme') {
        if (request.method === 'POST') {
            let body = '';
            request.on('data', chunk => {
                body += chunk.toString();
            });
            request.on('end', () => {
                try {
                    // 解析请求体数据
                    const data = JSON.parse(body);
                    const { loginLogoUrl, loginBackgroundUrl, deviceLogoUrl } = data;
                    
                    // 验证参数
                    if (!loginLogoUrl || !loginBackgroundUrl || !deviceLogoUrl) {
                        response.writeHead(400, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ error: '缺少必要的URL参数' }));
                        return;
                    }
                    
                    // 确保保存目录存在
                    const saveDir = path.join(__dirname, 'deskdata', 'fnstyle');
                    ensureDirectoryExists(saveDir);
                    
                    // 定义文件名
                    const loginLogoFileName = 'loginLogo' + path.extname(loginLogoUrl.split('?')[0]);
                    const loginBackgroundFileName = 'loginBackground' + path.extname(loginBackgroundUrl.split('?')[0]);
                    const deviceLogoFileName = 'deviceLogo' + path.extname(deviceLogoUrl.split('?')[0]);
                    
                    // 并行下载所有文件
                    Promise.all([
                        downloadFileFromUrl(loginLogoUrl, path.join(saveDir, loginLogoFileName)),
                        downloadFileFromUrl(loginBackgroundUrl, path.join(saveDir, loginBackgroundFileName)),
                        downloadFileFromUrl(deviceLogoUrl, path.join(saveDir, deviceLogoFileName))
                    ]).then(() => {
                        // 生成相对路径
                        const updatedData = {
                            loginLogo: `/deskdata/fnstyle/${loginLogoFileName}`,
                            loginBackground: `/deskdata/fnstyle/${loginBackgroundFileName}`,
                            deviceLogo: `/deskdata/fnstyle/${deviceLogoFileName}`
                        };
                        
                        // 读取现有fnstyle.json文件内容
                        let existingData = {};
                        if (fs.existsSync(FNSTYLE_FILE_PATH)) {
                            const fileContent = fs.readFileSync(FNSTYLE_FILE_PATH, 'utf8');
                            existingData = JSON.parse(fileContent);
                        }
                        
                        // 合并并更新fnstyle.json
                        const mergedData = { ...existingData, ...updatedData };
                        fs.writeFileSync(FNSTYLE_FILE_PATH, JSON.stringify(mergedData, null, 2), 'utf8');
                        
                       // console.log('主题文件已下载并更新fnstyle.json:', updatedData);
                        
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({
                            success: true,
                            message: '主题选择成功',
                            data: updatedData
                        }));
                    }).catch(error => {
                        console.error('下载主题文件时出错:', error);
                        response.writeHead(500, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ error: '下载主题文件失败: ' + error.message }));
                    });
                    
                } catch (error) {
                    console.error('处理主题选择请求时出错:', error);
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ error: '服务器内部错误: ' + error.message }));
                }
            });
        } else {
            response.writeHead(405, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: '不支持的请求方法' }));
        }
        return;
    }
    
    // 静态文件服务
    serveStaticFile(request, response, pathname);
}

// 检查是否需要身份验证的页面
function requiresAuthentication(pathname) {
    // 不需要验证的文件
    const publicFiles = [
        '/login.html',
        '/favicon.ico'
    ];
    
    // 静态资源文件也不需要验证
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf'];
    const extname = path.extname(pathname);
    
    // 如果是登录页面或静态资源，则不需要验证
    if (publicFiles.includes(pathname) || staticExtensions.includes(extname)) {
        return false;
    }
    
    // 默认情况下，index.html和其他HTML页面需要验证
    return true;
}

// 提供静态文件
function serveStaticFile(request, response, pathname) {
    // 默认返回index.html
    // 对pathname进行URL解码，以支持包含中文的文件路径
    const decodedPathname = decodeURIComponent(pathname);
    let filePath = path.join(__dirname, decodedPathname === '/' ? 'index.html' : decodedPathname);
    
    // 对于页面请求，不再在服务器端进行重定向验证，完全依赖前端的登录状态检查
    // 只对API请求进行身份验证
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/login') && 
        !pathname.startsWith('/api/check-password-file') && !pathname.startsWith('/api/initialize-password')) {
        // 对于需要保护的API，检查请求头中的认证信息
        const authToken = request.headers['x-auth-token'];
        
        // 如果没有认证token，返回未授权状态
        if (!authToken || authToken !== 'authenticated') {
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '请先登录' }));
            return;
        }
    }
    
    // 对于根路径，让它正常加载index.html，由前端的checkLoginStatus函数处理重定向

    // 检查文件是否存在
    fs.exists(filePath, (exists) => {
        if (!exists) {
            // 文件不存在，返回404
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('404 Not Found');
            return;
        }

        // 读取文件
        fs.readFile(filePath, (error, content) => {
            if (error) {
                // 读取文件出错
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('500 Internal Server Error');
                return;
            }

            // 设置内容类型
            let contentType = 'text/plain';
            const extname = path.extname(filePath);
            switch (extname) {
                case '.html':
                    contentType = 'text/html';
                    break;
                case '.js':
                    contentType = 'application/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                case '.jpeg':
                    contentType = 'image/jpeg';
                    break;
                case '.gif':
                    contentType = 'image/gif';
                    break;
                case '.ico':
                    contentType = 'image/x-icon';
                    break;
                case '.svg':
                    contentType = 'image/svg+xml';
                    break;
                case '.woff':
                    contentType = 'application/font-woff';
                    break;
                case '.woff2':
                    contentType = 'application/font-woff2';
                    break;
                case '.ttf':
                    contentType = 'application/font-ttf';
                    break;
            }

            // 返回文件内容
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf8');
        });
    });
}

// 更新前端API - 简化版，不再修改index.js以避免语法错误
function updateFrontendApi() {
    try {
        // 读取当前的数据，确保数据文件存在且有效
        const data = readData();
        console.log('启动完成！目前处理桌面数据', data.length, '条');
    } catch (error) {
        console.error('更新前端API调用失败:', error);
    }
}

// 启动服务器
function startServer() {
    // 确保必要的目录存在
    ensureDirectoryExists(IMG_DIR_PATH);
    
    // 确保密码文件存在
    ensurePasswordFile();

    // 更新前端API调用
    updateFrontendApi();

    // 创建HTTP服务器
    const server = http.createServer(handleApiRequest);

    const PORT = process.env.PORT || 9990;
    server.listen(PORT, function() {
        console.log('请访问: http://飞牛IP地址:' + PORT + ' 使用本工具');
    });

    server.on('error', function(error) {
        console.error('Server error:', error);
    });
}

// 立即生效API实现函数（全局作用域）
function applyConfig() {
    console.log('开始初始化配置...');    
    // 引入adm-zip模块用于压缩
    const AdmZip = require('adm-zip');
    
    // 定义路径常量
    const fnwDir = path.join(__dirname, 'fnw');
    const fnwDeskdataDir = path.join(fnwDir, 'deskdata');
    const resDir = path.join(__dirname, 'res');
    const towDir = path.join(resDir, 'tow');
    const wwwZipPath = path.join(resDir, 'www.zip');
    const wwwBakPath = path.join(resDir, 'www.bak');
    const fnwIndexHtmlPath = path.join(fnwDir, 'index.html');
    
    try {
        // 步骤1: 检查fnw/deskdata目录是否存在
        if (!fs.existsSync(fnwDeskdataDir)) {
          //  console.log('fnw/deskdata目录不存在，准备复制fnw目录内容...');
            
            // 确保res/tow目录存在
            ensureDirectoryExists(towDir);
                        
            // 将fnw所有文件复制到res/tow目录
            if (fs.existsSync(fnwDir)) {
                const fnwFiles = fs.readdirSync(fnwDir);
                fnwFiles.forEach(file => {
                    const sourcePath = path.join(fnwDir, file);
                    const targetPath = path.join(towDir, file);
                    // 复制文件或目录
                    if (fs.lstatSync(sourcePath).isDirectory()) {
                        // 复制目录
                        fs.cpSync(sourcePath, targetPath, { recursive: true });
                        // 设置目录权限为755
                        fs.chmodSync(targetPath, 0o755);
                    } else {
                        // 复制文件
                        fs.copyFileSync(sourcePath, targetPath);
                        // 设置文件权限为644
                        fs.chmodSync(targetPath, 0o644);
                    }
                });
               // console.log('fnw目录内容已复制到res/tow目录并设置权限');
            }
        } else {
           // console.log('fnw/deskdata目录已存在，继续执行后续步骤...');
        }
        
        // 步骤2: 复制deskdata目录和cqfndesk.js到res/tow目录
        const deskdataDir = path.join(__dirname, 'deskdata');
        const cqfndeskJsPath = path.join(__dirname, 'cqfndesk.js');
        // 确保res/tow目录存在
        ensureDirectoryExists(towDir);
        
        // 复制deskdata目录到res/tow
        const towDeskdataDir = path.join(towDir, 'deskdata');
        if (fs.existsSync(deskdataDir)) {
            // 复制deskdata目录
            fs.cpSync(deskdataDir, towDeskdataDir, { recursive: true });
            // 递归设置目录和文件权限
            setPermissionsRecursively(towDeskdataDir);
          //  console.log('deskdata目录已复制到res/tow目录并设置权限');
        }
        
        // 复制cqfndesk.js到res/tow
        const towCqfndeskJsPath = path.join(towDir, 'cqfndesk.js');
        if (fs.existsSync(cqfndeskJsPath)) {
            fs.copyFileSync(cqfndeskJsPath, towCqfndeskJsPath);
            // 设置文件权限为644
            fs.chmodSync(towCqfndeskJsPath, 0o644);
          //  console.log('cqfndesk.js已复制到res/tow目录并设置权限');
        }

        // 步骤3: 检查res/www.bak是否存在，若不存在则将res/www.zip改名www.bak
        if (!fs.existsSync(wwwBakPath) && fs.existsSync(wwwZipPath)) {
            fs.renameSync(wwwZipPath, wwwBakPath);
          //  console.log('res/www.zip已重命名为res/www.bak');
        } else if (!fs.existsSync(wwwBakPath)) {
          //  console.log('res/www.bak不存在，但res/www.zip也不存在，无需重命名');
        } else {
          //  console.log('res/www.bak已存在，无需重命名');
        }
        
        // 步骤4: 用modifyHtmlFile对res/tow/index.html和fnw/index.html进行修改
        const towIndexHtmlPath = path.join(towDir, 'index.html');
        const fnwIndexHtmlPath = path.join(fnwDir, 'index.html');
        
        // 修改res/tow/index.html
        if (fs.existsSync(towIndexHtmlPath)) {
            if (modifyHtmlFile(towIndexHtmlPath)) {
                // 设置文件权限为644
                fs.chmodSync(towIndexHtmlPath, 0o644);
              //  console.log('res/tow/index.html已修改并设置权限');
            } else {
                console.log('res/tow/index.html修改失败');
            }
        } else {
          //  console.log('res/tow/index.html不存在，跳过修改');
        }
        
        
        // 步骤5: 将res/tow/内所有文件用adm-zip压缩成www.zip，移动到res/www.zip
        if (fs.existsSync(towDir)) {
            // 创建一个新的zip实例
            const zip = new AdmZip();
            
            // 将res/tow目录添加到zip中
            zip.addLocalFolder(towDir, '');
            
            // 写入到res/www.zip
            zip.writeZip(wwwZipPath);
            // 设置文件权限为644
            fs.chmodSync(wwwZipPath, 0o644);
          //  console.log('res/tow目录已压缩为res/www.zip并设置权限');
        } else {
          //  console.log('res/tow目录不存在，无法进行压缩');
        }
        // 步骤6: 复制deskdata目录和cqfndesk.js到fnw目录
        if (fs.existsSync(deskdataDir)) {
            const targetDeskdataDir = path.join(fnwDir, 'deskdata');
            // 复制deskdata目录
            fs.cpSync(deskdataDir, targetDeskdataDir, { recursive: true });
            // 递归设置目录和文件权限
            setPermissionsRecursively(targetDeskdataDir);
          //  console.log('deskdata目录已复制到fnw目录并设置权限');
        }
        
        // 复制cqfndesk.js到fnw目录
        const targetCqfndeskJsPath = path.join(fnwDir, 'cqfndesk.js');
        if (fs.existsSync(cqfndeskJsPath)) {
            fs.copyFileSync(cqfndeskJsPath, targetCqfndeskJsPath);
            // 设置文件权限为644
            fs.chmodSync(targetCqfndeskJsPath, 0o644);
          //  console.log('cqfndesk.js已复制到fnw目录并设置权限');
        }
                // 修改fnw/index.html
        if (fs.existsSync(fnwIndexHtmlPath)) {
            if (modifyHtmlFile(fnwIndexHtmlPath)) {
                // 设置文件权限为644
                fs.chmodSync(fnwIndexHtmlPath, 0o644);
              //  console.log('fnw/index.html已修改并设置权限');
            } else {
             //   console.log('fnw/index.html修改失败');
            }
        } else {
          //  console.log('fnw/index.html不存在，跳过修改');
        }
        console.log('配置应用完成！');
    } catch (error) {
        console.error('应用配置时出错:', error);
        throw error;
    }
}

// 如果直接运行此脚本，则启动服务器
if (require.main === module) {
    // 启动前检查fnw/favicon.ico是否存在
    const faviconPath = path.join(__dirname, 'fnw', 'favicon.ico');
    let checkCount = 0;
    const maxChecks = 5;
    const checkInterval = 1000; // 每次检查间隔1秒
    
    const checkAndStart = () => {
        checkCount++;
        console.log(`第${checkCount}次检查飞牛系统状态...`);
        
        if (fs.existsSync(faviconPath)) {
            console.log('飞牛系统一切就绪，立即启动程序...');
            // 直接调用applyConfig函数
            try {
                // 调用handleApiRequest中定义的全局applyConfig函数
                  applyConfig(); //////////////////////////////////////////////////////////////////////////////////////////////////////##############################################################
                console.log('米恋泥 <飞牛桌面管理工具> 启动...');
                // 启动服务器
                startServer();
            } catch (error) {
                console.error('执行立即生效API时出错:', error);
                console.log('继续启动服务器...');
                startServer();
            }
        } else if (checkCount >= maxChecks) {
            console.log(`经过${maxChecks}次检查，系统状态仍未就绪，等待重启程序！`);
            process.exit(0);
        } else {
            //console.log('favicon.ico文件不存在，等待下次检查...');
            setTimeout(checkAndStart, checkInterval);
        }
    };
    
    // 开始检查
    checkAndStart();
}

// 导出模块供其他地方使用
module.exports = {
    startServer,
    readData,
    writeData
};
