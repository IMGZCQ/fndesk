// 导入所需模块
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 常量定义
const DATA_FILE_PATH = path.join(__dirname, 'deskdata', 'data.json');
const IMG_DIR_PATH = path.join(__dirname, 'deskdata', 'img');
const PW_FILE_PATH = path.join(__dirname, 'deskdata', 'pw.json');

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
            const defaultPassword = simpleEncrypt('admin123');
            fs.writeFileSync(PW_FILE_PATH, JSON.stringify({ password: defaultPassword }), 'utf8');
            console.log('密码文件已创建，默认密码: admin123');
        }
    } catch (error) {
        console.error('创建密码文件失败:', error);
    }
}

// 确保目录存在
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`目录已创建: ${dirPath}`);
    }
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

// 获取favicon URL
function getFaviconUrl(targetUrl) {
    try {
        // 解析URL获取主机名
        const parsedUrl = new URL(targetUrl);
        const hostname = parsedUrl.hostname;
        // 返回Google Favicon API URL
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch (error) {
        console.error('解析URL出错:', error);
        return null;
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
                console.log('HTML文件已修改');
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

// 处理API请求
function handleApiRequest(request, response) {
    // 解析URL
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;

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
                const { id, title, imageUrl, urls = [], type } = JSON.parse(body);
                if (!id) {
                    response.writeHead(400, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: '缺少必要参数id' }));
                    return;
                }

                // 确保目录存在
                ensureDirectoryExists(IMG_DIR_PATH);

                // 定义预设本地图片路径
                const defaultIconPath = path.join(IMG_DIR_PATH, 'i.png');
                const defaultFolderPath = path.join(IMG_DIR_PATH, 'f.png');
                const defaultImagePath = type === 0 ? defaultIconPath : defaultFolderPath;
                const defaultImageUrl = `/deskdata/img/${type === 0 ? 'i.png' : 'f.png'}`;

                // 清理文件名，移除特殊字符
                const sanitizeFilename = (str) => {
                    return str.replace(/[^a-zA-Z0-9_.-]/g, '_');
                };

                // 创建下载任务函数
                const downloadImage = (url, filename) => {
                    return new Promise((resolve, reject) => {
                        try {
                            const httpModule = url.startsWith('https') ? require('https') : require('http');
                            
                            // 确保文件名包含.svg扩展名（如果是SVG文件）
                            let finalFilename = filename;
                            if (url.toLowerCase().includes('.svg') && !filename.toLowerCase().endsWith('.svg')) {
                                finalFilename = filename.replace(/\.[^/.]+$/, '') + '.svg';
                                console.log(`调整SVG文件名: ${filename} -> ${finalFilename}`);
                            }
                            
                            const filePath = path.join(IMG_DIR_PATH, finalFilename);
                            const fileStream = fs.createWriteStream(filePath);

                            console.log(`尝试从${url}下载图片到${finalFilename}`);
                            
                            // 设置请求头，明确接受SVG文件
                            const options = {
                                headers: {
                                    'Accept': 'image/*, application/xml, text/xml'
                                }
                            };
                            
                            httpModule.get(url, options, (res) => {
                                // 处理重定向
                                if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                                    fileStream.close();
                                    console.log(`检测到重定向到: ${res.headers.location}`);
                                    // 跟随重定向
                                    downloadImage(res.headers.location, finalFilename)
                                        .then(resolve)
                                        .catch(reject);
                                    return;
                                }

                                // 检查是否是有效的图片响应
                                // 支持常见图片类型和SVG（可能返回image/svg+xml、text/xml或application/xml）
                                const contentType = res.headers['content-type'] || '';
                                const isImageType = contentType.startsWith('image/') || 
                                                  contentType.includes('svg') || 
                                                  contentType.includes('xml');
                                
                                if (res.statusCode !== 200 || !isImageType) {
                                    fileStream.close();
                                    if (fs.existsSync(filePath)) {
                                        fs.unlinkSync(filePath);
                                    }
                                    reject(new Error(`无效的图片响应: ${res.statusCode}, Content-Type: ${contentType}`));
                                    return;
                                }

                                // 确保正确处理SVG文件内容
                                const contentLength = res.headers['content-length'] || '未知';
                                console.log(`开始下载文件，Content-Type: ${contentType}, 大小: ${contentLength} 字节`);
                                
                                // 保存图片
                                res.pipe(fileStream);

                                fileStream.on('finish', () => {
                                    fileStream.close();
                                    // 验证文件是否成功创建且有内容
                                    const stats = fs.statSync(filePath);
                                    if (stats.size === 0) {
                                        fs.unlinkSync(filePath);
                                        reject(new Error(`下载的文件为空: ${finalFilename}`));
                                        return;
                                    }
                                    console.log(`图片下载成功: ${finalFilename}, 文件大小: ${stats.size} 字节`);
                                    resolve({ success: true, filePath: `/deskdata/img/${finalFilename}` });
                                });
                            }).on('error', (error) => {
                                fileStream.close();
                                if (fs.existsSync(filePath)) {
                                    fs.unlinkSync(filePath);
                                }
                                console.error(`下载图片出错: ${error.message}`);
                                reject(error);
                            });
                        } catch (error) {
                            console.error(`下载过程出错: ${error.message}`);
                            reject(error);
                        }
                    });
                };

                // 尝试获取favicon的URL
                const getFaviconUrl = (baseUrl) => {
                    try {
                        const parsedUrl = new URL(baseUrl);
                        return `${parsedUrl.protocol}//${parsedUrl.host}/favicon.ico`;
                    } catch (e) {
                        return null;
                    }
                };

                // 生成安全的文件名
                const safeTitle = sanitizeFilename(title || 'unnamed');
                const baseFilename = `${id}_${safeTitle}`;

                // 主下载流程
                const mainDownloadProcess = async () => {
                    // 1. 首先尝试从网络图片URL下载
                    if (imageUrl) {
                        try {
                            const fileExtension = path.extname(new URL(imageUrl).pathname) || '.png';
                            const filename = `${baseFilename}${fileExtension}`;
                            return await downloadImage(imageUrl, filename);
                        } catch (error) {
                            console.log(`主图片URL下载失败，尝试备用URL: ${error.message}`);
                        }
                    }

                    // 2. 遍历所有备用URL，尝试获取favicon或其他图片
                    for (const baseUrl of urls) {
                        // 先尝试favicon
                        const faviconUrl = getFaviconUrl(baseUrl);
                        if (faviconUrl) {
                            try {
                                const filename = `${baseFilename}_favicon.ico`;
                                return await downloadImage(faviconUrl, filename);
                            } catch (error) {
                                console.log(`Favicon下载失败: ${error.message}`);
                            }
                        }

                        // 尝试直接下载URL（如果URL看起来像图片）
                        if (/\.(png|jpg|jpeg|gif|ico|svg|webp)$/i.test(baseUrl)) {
                            try {
                                const fileExtension = path.extname(baseUrl) || '.png';
                                const filename = `${baseFilename}_fromurl${fileExtension}`;
                                return await downloadImage(baseUrl, filename);
                            } catch (error) {
                                console.log(`直接URL下载失败: ${error.message}`);
                            }
                        }
                    }

                    // 3. 所有尝试都失败，检查是否有默认图片
                    if (fs.existsSync(defaultImagePath)) {
                        console.log(`使用默认图片: ${defaultImageUrl}`);
                        return { success: true, filePath: defaultImageUrl };
                    }

                    // 4. 如果没有默认图片，返回失败
                    throw new Error('所有下载尝试失败，且没有默认图片可用');
                };

                // 执行下载流程
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

    // 获取favicon API
    if (pathname === '/api/get-favicon') {
        const targetUrl = parsedUrl.query.url;
        if (!targetUrl) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '缺少URL参数' }));
            return;
        }

        // 生成favicon URL
        const faviconUrl = getFaviconUrl(targetUrl);
        if (!faviconUrl) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '无效的URL' }));
            return;
        }

        // 确定使用http还是https
        const httpModule = faviconUrl.startsWith('https') ? require('https') : require('http');

        // 尝试获取favicon
        httpModule.get(faviconUrl, (res) => {
            if (res.statusCode !== 200) {
                // 如果获取失败，尝试备选方案
                const parsedTargetUrl = new URL(targetUrl);
                const alternativeFaviconUrl = `${parsedTargetUrl.origin}/favicon.ico`;
                const altHttpModule = alternativeFaviconUrl.startsWith('https') ? require('https') : require('http');

                altHttpModule.get(alternativeFaviconUrl, (altRes) => {
                    if (altRes.statusCode !== 200) {
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ success: false, message: '无法获取favicon' }));
                        return;
                    }

                    // 保存favicon到临时文件
                    const tempDir = path.join(__dirname, 'temp');
                    ensureDirectoryExists(tempDir);
                    const tempFilePath = path.join(tempDir, `favicon_${Date.now()}.ico`);
                    const fileStream = fs.createWriteStream(tempFilePath);

                    altRes.pipe(fileStream);

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
                }).on('error', () => {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: '无法访问目标网站' }));
                });
                return;
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
        }).on('error', () => {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '无法访问目标网站' }));
        });
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
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    
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
        console.log('前端API服务就绪，数据文件包含', data.length, '条记录');
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
        console.log('Server started, listening on port ' + PORT);
        console.log('Access address: http://localhost:' + PORT);
    });

    server.on('error', function(error) {
        console.error('Server error:', error);
    });
}

// 立即生效API实现函数（全局作用域）
function applyConfig() {
    console.log('开始应用配置...');
    
    // 设置源目录和目标目录
    const sourceDir = path.join(__dirname, 'deskdata');
    const targetDir = path.join(__dirname, 'fnw', 'deskdata');
    
    // 权限设置常量
    const FILE_PERMISSIONS = 0o644; // 文件权限：所有者读写，组和其他只读
    const DIR_PERMISSIONS = 0o755;  // 文件夹权限：所有者读写执行，组和其他读执行
    
    try {
        // 确保目标目录存在
        ensureDirectoryExists(targetDir);
        // 设置目标目录权限
        fs.chmodSync(targetDir, DIR_PERMISSIONS);
        
        // 复制数据文件
        const sourceDataPath = path.join(sourceDir, 'data.json');
        const targetDataPath = path.join(targetDir, 'data.json');
        
        if (fs.existsSync(sourceDataPath)) {
            fs.copyFileSync(sourceDataPath, targetDataPath);
            // 设置数据文件权限
            fs.chmodSync(targetDataPath, FILE_PERMISSIONS);
            console.log('数据文件已复制并设置权限');
        }
        
        // 复制图片文件夹
        const sourceImgDir = path.join(sourceDir, 'img');
        const targetImgDir = path.join(targetDir, 'img');
        
        ensureDirectoryExists(targetImgDir);
        // 设置图片文件夹权限
        fs.chmodSync(targetImgDir, DIR_PERMISSIONS);
        
        if (fs.existsSync(sourceImgDir)) {
            const files = fs.readdirSync(sourceImgDir);
            files.forEach(file => {
                const sourceFilePath = path.join(sourceImgDir, file);
                const targetFilePath = path.join(targetImgDir, file);
                
                // 复制文件
                fs.copyFileSync(sourceFilePath, targetFilePath);
                // 设置文件权限
                fs.chmodSync(targetFilePath, FILE_PERMISSIONS);
            });
            console.log('图片文件已复制并设置权限');
        }
        
        // 复制cqfndesk.js文件
        const sourceCqfndeskPath = path.join(__dirname, 'cqfndesk.js');
        const targetCqfndeskPath = path.join(__dirname, 'fnw', 'cqfndesk.js');
        
        if (fs.existsSync(sourceCqfndeskPath)) {
            fs.copyFileSync(sourceCqfndeskPath, targetCqfndeskPath);
            // 设置cqfndesk.js文件权限
            fs.chmodSync(targetCqfndeskPath, FILE_PERMISSIONS);
            console.log('cqfndesk.js文件已复制并设置权限');
        }
        
        // 修改HTML文件添加favicon
        const htmlFilePath = path.join(__dirname, 'fnw', 'index.html');
        if (fs.existsSync(htmlFilePath)) {
            modifyHtmlFile(htmlFilePath);
            // 设置HTML文件权限
            fs.chmodSync(htmlFilePath, FILE_PERMISSIONS);
        }
        
        console.log('配置应用完成，所有文件和文件夹已设置正确权限');
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
        console.log(`第${checkCount}次检查favicon.ico文件...`);
        
        if (fs.existsSync(faviconPath)) {
            console.log('favicon.ico文件存在，执行立即生效API...');
            // 直接调用applyConfig函数
            try {
                // 调用handleApiRequest中定义的全局applyConfig函数
                applyConfig(); 
                console.log('立即生效API执行完成，启动服务器...');
                // 启动服务器
                startServer();
            } catch (error) {
                console.error('执行立即生效API时出错:', error);
                console.log('继续启动服务器...');
                startServer();
            }
        } else if (checkCount >= maxChecks) {
            console.log(`经过${maxChecks}次检查，favicon.ico文件不存在，退出程序`);
            process.exit(0);
        } else {
            console.log('favicon.ico文件不存在，等待下次检查...');
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
