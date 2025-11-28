// 图标操作API模块
const fs = require('fs');
const path = require('path');

// Define path mappings based on frontend-to-backend configurations
const pathMappings = {
    // Frontend path '/deskdata' maps to backend directory fndata
    deskdata: `/var/apps/${process.env.TRIM_APPNAME || 'trim'}/shares/${process.env.TRIM_APPNAME || 'trim'}/deskdata`,
    // Frontend path '/fnw' maps to backend directory fn_www
    fnw: '/usr/trim/www',
    // Frontend path '/res' maps to backend directory fn_res
    res: '/usr/trim/share/.restore',
    // Frontend path '/trim.media' maps to backend directory fn_media
    trimMedia: '/var/apps/trim.media/target'
};
/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * 检查路径安全性
 * @param {string} targetPath - 目标路径
 * @param {string} basePath - 基础路径
 * @returns {boolean} - 路径是否安全
 */
function isPathSafe(targetPath, basePath) {
    const allowedBase = path.join(pathMappings.res, 'tow', 'static', 'app', 'icons');
    // Don't join with basePath as we're using absolute paths from the mappings
    const fullPath = path.resolve(targetPath);
    return fullPath.startsWith(allowedBase);
}

/**
 * 处理恢复默认图标操作
 * @param {Object} request - HTTP请求对象
 * @param {Object} response - HTTP响应对象
 * @param {string} basePath - 基础路径
 */
function handleRestoreDefaultIcon(request, response, basePath) {
    try {
        // 解析URL获取查询参数
        const url = new URL(request.url, `http://${request.headers.host}`);
        const directory = url.searchParams.get('directory');
        
        if (!directory) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '缺少directory参数' }));
            return;
        }
        
        // 构建目录路径 using the path mapping
        const targetDir = path.join(pathMappings.res, 'tow', 'static', 'app', 'icons', directory);
        
        // 验证路径安全性
        if (!isPathSafe(targetDir, basePath)) {
            response.writeHead(403, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '访问被拒绝' }));
            return;
        }
        
        // Use the absolute path directly from the mapping, don't join with basePath
        const fullDirPath = targetDir;
        const iconBakPath = path.join(fullDirPath, 'icon.bak');
        const iconPngPath = path.join(fullDirPath, 'icon.png');
        
        // 检查icon.bak是否存在
        if (!fs.existsSync(iconBakPath)) {
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '未找到备份文件icon.bak' }));
            return;
        }
        
        // 复制icon.bak到icon.png
        fs.copyFileSync(iconBakPath, iconPngPath);
        // 设置文件权限为644
        fs.chmodSync(iconPngPath, 0o644);
        
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ success: true, message: '默认图标已恢复' }));
    } catch (error) {
        console.error('恢复默认图标失败:', error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ success: false, message: '服务器内部错误', error: error.message }));
    }
}

/**
 * 处理上传图标前的备份操作
 * @param {Object} request - HTTP请求对象
 * @param {Object} response - HTTP响应对象
 * @param {string} basePath - 基础路径
 */
function handleBackupIcon(request, response, basePath) {
    try {
        // 解析URL获取查询参数
        const url = new URL(request.url, `http://${request.headers.host}`);
        const directory = url.searchParams.get('directory');
        
        if (!directory) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '缺少directory参数' }));
            return;
        }
        
        // 构建目录路径 using the path mapping
        const targetDir = path.join(pathMappings.res, 'tow', 'static', 'app', 'icons', directory);
        
        // 验证路径安全性
/*         if (!isPathSafe(targetDir, basePath)) {
            response.writeHead(403, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '访问被拒绝' }));
            return;
        } */
        
        // Use the absolute path directly from the mapping
        const fullDirPath = targetDir;
        const iconPngPath = path.join(fullDirPath, 'icon.png');
        const iconBakPath = path.join(fullDirPath, 'icon.bak');
        
        // 检查icon.png是否存在
        if (!fs.existsSync(iconPngPath)) {
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '未找到原始图标文件icon.png' }));
            return;
        }
        
        // 检查icon.bak是否存在，如果不存在则创建备份
        if (!fs.existsSync(iconBakPath)) {
            fs.copyFileSync(iconPngPath, iconBakPath);
            // 设置文件权限为644
            fs.chmodSync(iconBakPath, 0o644);
        }
        
        // 确保deskdata/sysico/目录存在 using the path mapping
        const deskdataPath = path.join(pathMappings.deskdata, 'sysico');
        ensureDirectoryExists(deskdataPath);
        
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ success: true, message: '图标备份完成，可以上传新图标' }));
    } catch (error) {
        console.error('备份图标失败:', error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ success: false, message: '服务器内部错误', error: error.message }));
    }
}

/**
 * 处理上传图标操作
 * @param {Object} request - HTTP请求对象
 * @param {Object} response - HTTP响应对象
 * @param {string} basePath - 基础路径
 */
function handleUploadIcon(request, response, basePath) {
    try {
        // 解析URL获取查询参数
        const url = new URL(request.url, `http://${request.headers.host}`);
        const directory = url.searchParams.get('directory');
        
        if (!directory) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '缺少directory参数' }));
            return;
        }
        
        // 构建目录路径 using the path mapping
        const targetDir = path.join(pathMappings.res, 'tow', 'static', 'app', 'icons', directory);
        
        // 验证路径安全性
        if (!isPathSafe(targetDir, basePath)) {
            response.writeHead(403, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '访问被拒绝' }));
            return;
        }
        
        // Use the absolute path directly from the mapping
        const fullDirPath = targetDir;
        const iconPngPath = path.join(fullDirPath, 'icon.png');
        const iconBakPath = path.join(fullDirPath, 'icon.bak');
        
        // 确保备份已存在
        if (!fs.existsSync(iconBakPath)) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '请先备份图标' }));
            return;
        }
        
        // 由于与formidable可能存在冲突，我们使用更直接的方式处理文件数据
        // 确保不会与全局的formidable处理冲突
        request.pause(); // 暂停请求流
        
        // 准备处理请求体
        
        // 确保我们自己完全控制请求体的处理
        let body = [];
        let contentLength = parseInt(request.headers['content-length'] || 0);
        let receivedLength = 0;
        
        // 恢复请求流
        request.resume();
        
        request.on('data', (chunk) => {
            receivedLength += chunk.length;
            body.push(chunk);
            
            // 防止内存溢出
            if (receivedLength > 10 * 1024 * 1024) { // 10MB限制
                request.destroy(new Error('文件大小超过限制'));
            }
        });
        
        request.on('end', () => {
            try {
                // 合并Buffer
                const buffer = Buffer.concat(body);
                
                // 确保deskdata/sysico/目录存在 using the path mapping
                const deskdataPath = path.join(pathMappings.deskdata, 'sysico');
                ensureDirectoryExists(deskdataPath);
                
                // 1. 先把图片上传到deskdata/sysico/目录以id命名
                const deskdataIconPath = path.join(deskdataPath, `${directory}`);
                fs.writeFileSync(deskdataIconPath, buffer);
                // 设置文件权限为644
                fs.chmodSync(deskdataIconPath, 0o644);
                
                // 2. 然后复制一份到icon.previewUrl名为icon.png
                fs.copyFileSync(deskdataIconPath, iconPngPath);
                // 设置文件权限为644
                fs.chmodSync(iconPngPath, 0o644);
                
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: true, message: '图标上传成功' }));
            } catch (error) {
                console.error('写入图标文件失败:', error);
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: false, message: '图标写入失败', error: error.message }));
            }
        });
        
        request.on('error', (error) => {
            console.error('接收文件数据出错:', error);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '接收文件数据失败', error: error.message }));
        });
    } catch (error) {
        console.error('上传图标失败:', error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ success: false, message: '服务器内部错误', error: error.message }));
    }
}

/**
 * 同步deskdata/sysico/目录中的所有文件到res/tow/static/app/icons/对应目录
 * @param {Object} request - HTTP请求对象
 * @param {Object} response - HTTP响应对象
 * @param {string} basePath - 基础路径
 */
function syncIcons(request, response, basePath) {
    try {
        // Use the deskdata path from the mappings
        const sysicoDir = path.join(pathMappings.deskdata, 'sysico');
        
        // 检查deskdata/sysico/目录是否存在
        if (!fs.existsSync(sysicoDir)) {
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: 'deskdata/sysico/目录不存在' }));
            return;
        }
        
        // 读取sysico目录中的所有文件
        const files = fs.readdirSync(sysicoDir);
        const successFiles = [];
        const failedFiles = [];
        
        files.forEach(filename => {
            try {
                const sourceFilePath = path.join(sysicoDir, filename);
                
                // 跳过目录，只处理文件
                if (fs.statSync(sourceFilePath).isDirectory()) {
                    return;
                }
                
                // 构建目标目录路径 using the path mapping
                const targetDir = path.join(pathMappings.res, 'tow', 'static', 'app', 'icons', filename);
                
                // 验证路径安全性
                if (!isPathSafe(targetDir, basePath)) {
                    failedFiles.push({ filename, reason: '路径安全验证失败' });
                    return;
                }
                
                // Use the absolute path directly from the mapping
                const fullTargetDir = targetDir;
                const iconPngPath = path.join(fullTargetDir, 'icon.png');
                const iconBakPath = path.join(fullTargetDir, 'icon.bak');
                
                // 确保目标目录存在
                ensureDirectoryExists(fullTargetDir);
                
                // 检查icon.bak是否存在，如果不存在且icon.png存在，则创建备份
                if (!fs.existsSync(iconBakPath) && fs.existsSync(iconPngPath)) {
                    fs.copyFileSync(iconPngPath, iconBakPath);
                    // 设置文件权限为644
                    fs.chmodSync(iconBakPath, 0o644);
                }
                
                // 将源文件复制到目标位置并命名为icon.png
                fs.copyFileSync(sourceFilePath, iconPngPath);
                // 设置文件权限为644
                fs.chmodSync(iconPngPath, 0o644);
                successFiles.push(filename);
                
            } catch (error) {
                console.error(`同步文件${filename}失败:`, error);
                failedFiles.push({ filename, reason: error.message });
            }
        });
        
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            success: true,
            message: `图标同步完成，成功: ${successFiles.length}, 失败: ${failedFiles.length}`,
            successFiles,
            failedFiles
        }));
        
    } catch (error) {
        console.error('同步图标失败:', error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ success: false, message: '服务器内部错误', error: error.message }));
    }
}

/**
 * 处理删除sysico文件操作
 * @param {Object} request - HTTP请求对象
 * @param {Object} response - HTTP响应对象
 * @param {string} basePath - 基础路径
 */
function handleDeleteSysicoFile(request, response, basePath) {
    try {
        // 解析URL获取查询参数
        const url = new URL(request.url, `http://${request.headers.host}`);
        const iconId = url.searchParams.get('iconId');
        
        if (!iconId) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '缺少iconId参数' }));
            return;
        }
        
        // 构建sysico文件路径 using the path mapping
        const sysicoFilePath = path.join(pathMappings.deskdata, 'sysico', iconId);
        
        // 检查文件是否存在
        if (!fs.existsSync(sysicoFilePath)) {
            // 文件不存在，返回成功，因为目标是确保文件被删除
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: true, message: '文件不存在，无需删除' }));
            return;
        }
        
        // 删除文件
        fs.unlinkSync(sysicoFilePath);
        
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ success: true, message: '文件删除成功' }));
        
    } catch (error) {
        console.error('删除sysico文件失败:', error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ success: false, message: error.message }));
    }
}

module.exports = {
    handleRestoreDefaultIcon,
    handleBackupIcon,
    handleUploadIcon,
    syncIcons,
    handleDeleteSysicoFile
};