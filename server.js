// 导入所需模块
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');


// const fndata = '/var/apps/fndesk-APP/home/deskdata';
// const fndata = path.join(__dirname, 'deskdata');
//const fndata = `/var/apps/${process.env.TRIM_APPNAME}/shares/${process.env.TRIM_APPNAME}/deskdata`;
const fndata = `${process.env.TRIM_APPDEST_VOL}/@appshare/${process.env.TRIM_APPNAME}/deskdata`;
const fn_www = '/usr/trim/www';
const fn_res = '/usr/trim/share/.restore';  //sysico.js
const fn_media = '/var/apps/trim.media/target' ;

const pathMappings = [
  { mapPath: '/deskdata', localDir: fndata },
  { mapPath: '/fnw', localDir: fn_www },  // 第一组映射
  { mapPath: '/res', localDir: fn_res},  // 第二组映射
  { mapPath: '/trim.media', localDir: fn_media}     // 第三组映射（可继续添加）
];



// 确保api目录存在
const apiDir = path.join(__dirname, 'api');
if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
}

// 引入图标操作API模块
const sysicoApi = require('./api/sysico.js');

// 常量定义
const DATA_FILE_PATH = path.join(fndata, 'data.json');
const IMG_DIR_PATH = path.join(fndata, 'img');
const PW_FILE_PATH = path.join(fndata, 'pw.json');
const FNSTYLE_FILE_PATH = path.join(fndata, 'fnstyle.json');

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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//外链分享设置
function fndesk_share_page() {
    try {
        // 定义要检查的目录路径
        const shareLinkDir = path.join(fn_res, 'tow', 'modules', 'trim_sharelink', 's', 'static', '0.1.2');
        
        // 检查目录和文件是否存在
        if (fs.existsSync(shareLinkDir) && fs.existsSync(FNSTYLE_FILE_PATH)) {
          //  console.log('目录和文件都存在，开始处理...');
            
            // 读取fnstyle.json文件内容
            const fnstyleContent = fs.readFileSync(FNSTYLE_FILE_PATH, 'utf8');
            const fnstyle = JSON.parse(fnstyleContent);
            
            // 获取目录中所有的js文件
            const files = fs.readdirSync(shareLinkDir).filter(file => file.endsWith('.js'));
            
            if (files.length > 0) {
                // 找到最大的js文件（按文件大小）
                let maxFile = null;
                let maxSize = 0;
                
                files.forEach(file => {
                    const filePath = path.join(shareLinkDir, file);
                    const stats = fs.statSync(filePath);
                    if (stats.size > maxSize) {
                        maxSize = stats.size;
                        maxFile = filePath;
                    }
                });
                
                if (maxFile) {
                  //  console.log(`找到最大的js文件: ${maxFile}`);
                    
                    // 读取最大js文件的内容
                    let jsContent = fs.readFileSync(maxFile, 'utf8');
                    
                    // 查找"fndesk_share_main();"并删除从开头到这一行的内容
                    const mainFunctionCall = 'fndesk_share_main();';
                    const mainFunctionCallIndex = jsContent.indexOf(mainFunctionCall);
                    
                    if (mainFunctionCallIndex !== -1) {
                        // 删除从开头到"fndesk_share_main();"的内容（包括这一行）
                        jsContent = jsContent.substring(mainFunctionCallIndex + mainFunctionCall.length);
                    }
                    
                    // 先独立定义5个纯默认值常量
                    const DEFAULT_PC_LOGO = 'data:image/png;base64,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';
                    const DEFAULT_MB_URL = 'https://www.fnnas.com/';
                    const DEFAULT_MB_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABHCAYAAAC6cjEhAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAUDSURBVHgB7ZxPaBxVHMe/M8RaJcQ1iEgTcKb14D+wQgte1BX8cxG6WA/ipdmjF02TKh4EEXoQaYP1oiebXkTBYAKemoOrXiwKBtT2YpwpJMVDSZe0tGGb7vR9p7vbmclMMm92d+bt7nxg2cnMbObt9/3+vfdmB8gJRYt74uOTllHTURKfeNEB9otdBnoBDUtwUNUcLNR3Yd7+1LTjfWwHHjtmFW85+FhsFtEfVHQHZ5ZnzNntTooUxvjQMrSbOI3+ESRIxbkH5SgL0sN27pu+eESI8if6VxRS5Hc0pq1S2MEtwuydvvheHfVZsVlA/1MQLvPD3ilrMnjA50pUjydiANGhTyyffPRM8++WMI2YQvcZBEsJoypizrPNmNNypUagHVRRSKGhgYsrjDFlTaC/A21cioYoT7jhCqPpOIIcF+1OzQatEVss5LS49xZMXa+hhBwftSGUdEfHIeT4cOooMsYMciYKR8Mzuhh57kdOEENHTiiJhRl/cAjP7dsNVWH7+EpKImF4wc/eegi/LW9AVVaubOKriYfx5J5dSIK0MBTlm3cewaq4sOqc+2/DFSeJ5UgL8+5rBYyPDmHxr+tQnfOXam5bad2ySAnDmPLmgWF3e6UXLObfO67OdsvGQylh3jg43Npev1FHL3H4wLDU+VLCvPrU/eglRu67+/VeeVqu7bGFYXT3XujwQbkeyAKvGGy7TIaKLYxXFFJ+fiRxKkwDZiK2MbgvLrGFGRv1/1MK9ePUHjfiqyYQAy1LimBnyhBbwgurtdD9zFJ8MRif/ec6ji+shQZmNvZlYdoP7O7uKIQdGJWB1jfiJ4zYwrAm4BeO6gXun/1lfYsoNF+3Ah3L1qpW1jalKnWp7vvibDXyGC9K8bxQFLpb1qKQ7doehpQwX/+6ju//uBZ6bPHvrZVwu37eKbZrdxTSg4gPvr2MVWGWLJjGPQH5QsBa6Ofjo8lHt52Abn1KWMppIYwsiVrOi/HFL9/MVvRhL0+EZCqec2pRzqSTws47LxKGTMD10laXusFsOfxYmAvNCXOe+13OpLMin8GLIBcmgmyjYwxGREHIIC6T3Zo1VzsoLQwr6o8OjUqJwgD/+swltIuyrsTiMIkob3/5f+JM5EVZi5F1HxZwx+fXOiIKUVaYsZjFIUsGlvudXrFQPvh6YUBlYHWLN/HOartbSzg9JQzHY+9/dxlpkLkwnOTiTFvQdbKe/MpUmObinQoj8CCZtqj8woiSopBMWyUryrkU18p7ZqyUZLKpHZTLSpxUCs4GsqJNe0k4VWGCmSdsMouTSyrcXpKqMBwUNpc2OGpWNfCSrgkTNexv5y6nNOlal80lDJRXFbmLomvCNGfoZT8TXJvKiq7aNYWhBUyIkn+npRSKwuVdVW5I0sxpy0EKBG8j8UJRmJI7NZfSCVKLhKq4SFzYhTZy/GhY0jVgCTl+HFT5W4KfkeND07Cg1+uYR46P+ibmdftz0xY+VUFOkwo1cfOnyNefIMeFz33ge+t31+Yx6yehUBGDjPAc64T5EjdbFZezibJ4S+fmFTWpNjRwaQlDv3IcHMWAIsJJ2Y23DXw1uj1jzg6iOI6Go/ZJ05edQ58f03j4xSA80qBKQ7BDHrIT/WCdScvQhoQ4/RqQRaBlTPG6j//wDvC5D+4jDvpFIAoiyhP7hFnZ/rSY0IJ0HaXGD9gLPfSzZNsdD4qhD6v8KAsJchtpusc7b1JbeQAAAABJRU5ErkJggg==';
                    const DEFAULT_MB_TITLE = '飞牛 fnOS';
                    const DEFAULT_MB_DESC = '正版免费 兼容x86硬件 智能影视刮削 本地AI相册';
                    
                    // 然后读取fnstyle数据，如果没有才使用默认值
                    const actualPcLogo = fnstyle.sharePcLogo || DEFAULT_PC_LOGO;
                    const actualMbUrl = fnstyle.shareMbUrl || DEFAULT_MB_URL;
                    const actualMbLogo = fnstyle.shareMbLogo || DEFAULT_MB_LOGO;
                    const actualMbTitle = fnstyle.shareMbTitle || DEFAULT_MB_TITLE;
                    const actualMbDesc = fnstyle.shareMbDesc || DEFAULT_MB_DESC;
                    
                    // 使用JSON.stringify进行安全的字符串转义，确保特殊符号正确处理
                    function safeString(str) {
                      // JSON.stringify会正确转义所有特殊字符，然后去掉前后的引号
                      return JSON.stringify(String(str)).slice(1, -1);
                    }
                    
                    const sharePcLogo = safeString(actualPcLogo);
                    const shareMbUrl = safeString(actualMbUrl);
                    const shareMbLogo = safeString(actualMbLogo);
                    const shareMbTitle = safeString(actualMbTitle);
                    const shareMbDesc = safeString(actualMbDesc);
                    
                    // 构建完整的JS代码，逐行拼接以确保格式正确
                    const insertContent = 
                      'let fndesk_share_main_pclogo="' + DEFAULT_PC_LOGO + '";\n' +
                      'let fndesk_share_main_mbURL="' + DEFAULT_MB_URL + '";\n' +
                      'let fndesk_share_main_mblogo="' + DEFAULT_MB_LOGO + '";\n' +
                      'let fndesk_share_main_mbtitle="' + DEFAULT_MB_TITLE + '";\n' +
                      'let fndesk_share_main_mbdesc="' + DEFAULT_MB_DESC + '";\n\n' +
                      'function fndesk_share_main() {\n' +
                      '  const currentUrl = window.location.href;\n' +
                      '  const isMatch = currentUrl.includes(\'5ddd.com\') || currentUrl.includes(\'fnos.net\');\n' +
                      '  if (isMatch) {\n' +
                      '  } else {\n' +
                      'fndesk_share_main_mbURL="' + shareMbUrl + '";\n' +
                      'fndesk_share_main_mblogo="' + shareMbLogo + '";\n' +
                      'fndesk_share_main_pclogo="' + sharePcLogo + '";\n' +
                      'fndesk_share_main_mbtitle="' + shareMbTitle + '";\n' +
                      'fndesk_share_main_mbdesc="' + shareMbDesc + '";\n' +
                      '  }\n' +
                      '}\n' +
                      'fndesk_share_main();';
                    
                    // 进行5项内容替换
                    jsContent = jsContent
                      // 1. 替换链接
                      .replace(/no-underline w-full box-border\",href:\"https:\/\/www\.fnnas\.com\/\"/g, 'no-underline w-full box-border\",href:fndesk_share_main_mbURL')
                      // 2. 替换移动端logo
                      .replace(/const appLogo\$1=\"[^\"]*\"/g, 'const appLogo$1=fndesk_share_main_mblogo')
                      // 3. 替换PC端logo
                      .replace(/,logo=\"[^\"]*\"/g, ',logo=fndesk_share_main_pclogo')
                      // 4. 替换标题
                      .replace(/text-base font-500\",children:\"飞牛 fnOS\"/g, 'text-base font-500\",children:fndesk_share_main_mbtitle')
                      // 5. 替换描述
                      .replace(/text-xs text-\[var\(--semi-color-primary\)\]\",children:\"正版免费 兼容x86硬件 智能影视刮削 本地AI相册\"/g, 'text-xs text-[var(--semi-color-primary)]\",children:fndesk_share_main_mbdesc');
                    
                    // 在文件开头插入新内容
                    const newContent = insertContent + jsContent;
                    
                    // 写回文件
                    fs.writeFileSync(maxFile, newContent, 'utf8');
                  //  console.log(`已成功修改文件: ${maxFile}`);
                }
            } else {
                console.log('未找到js文件');
            }
        } else {
            console.log('目录或文件不存在');
        }
    } catch (error) {
        console.error('处理外链分享设置时出错:', error);
    }
}

//登录页备案信息
function addLoginBeian(targetPath) {
    try {
        // 读取fnstyle.json文件
        if (fs.existsSync(FNSTYLE_FILE_PATH)) {
            const fnstyleContent = fs.readFileSync(FNSTYLE_FILE_PATH, 'utf8');
            const fnstyle = JSON.parse(fnstyleContent);
            
            // 读取目标HTML文件
            if (fs.existsSync(targetPath)) {
                let htmlContent = fs.readFileSync(targetPath, 'utf8');
                
                // 移除现有的LoginBeian元素
                htmlContent = htmlContent.replace(/<div\s+id="LoginBeian"[^>]*>.*?<\/div>/s, '');
                // 删除多余的空行（连续两个或更多换行符替换为单个换行符）
                htmlContent = htmlContent.replace(/\n\s*\n/g, '\n');
                
                // 如果beian字段等于1，添加新的备案信息
                if (fnstyle.beian === 1) {
                    // 获取备案信息字段，提供默认值
                    const beianName = fnstyle.beian_Name || '';
                    const beianUrl = fnstyle.beian_URL || '#';
                    const beianNum = fnstyle.beian_NUM || '';
                    
                    // 构建备案信息HTML
                    const beianHtml = `<div id="LoginBeian" style="position: fixed; left: 50%; bottom: 3%; transform: translateX(-50%); font-weight: bold; font-size: 13px; text-shadow: 1px 1px 3px rgba(0,0,0,0.3); z-index: 9999; text-align: center; color: white; line-height: 1.2;">
  <span class="footer-item">
    <a href="${beianUrl}" target="_blank" style="text-decoration: none; color: inherit;">${beianName}</a>
  </span>
  <span class="footer-sep" style="margin: 0 5px;">-</span>
  <span class="footer-item">
    <a href="https://beian.miit.gov.cn" target="_blank" style="text-decoration: none; color: inherit;">${beianNum}</a>
  </span>
  <style>
    .footer-item { display: inline-block; }
    @media (max-width: 420px) {
      .footer-item { display: block; }
      .footer-sep { display: none; }
    }
  </style>
  <script>
      const excludeDomains = ['5ddd.com', 'fnos.net'];
      const currentDomain = window.location.hostname;
      const shouldHide = excludeDomains.some(domain => currentDomain.includes(domain));
      const loginBeian = document.getElementById('LoginBeian');
      if (loginBeian && shouldHide) {
        loginBeian.style.display = 'none';
      }
  </script>
</div>`;
                    
                    // 在body标签闭合前插入备案信息
                    htmlContent = htmlContent.replace(/<\/body>/i, `${beianHtml}\n</body>`);
                }
                
                // 写回修改后的HTML内容
                fs.writeFileSync(targetPath, htmlContent, 'utf8');
               // console.log(`备案信息处理完成: ${targetPath}`);
            }
        }
    } catch (error) {
        console.error('处理备案信息时出错:', error);
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 修改HTML文件
function modifyHtmlFile(targetPath) {
    try {
        if (fs.existsSync(targetPath)) {
            let content = fs.readFileSync(targetPath, 'utf8');
            // 清空<body>与<div id="root">之间的内容，并插入脚本
            const bodyRootRegex = /<body>([\s\S]*)<div id="root">/;
            if (bodyRootRegex.test(content)) {
                content = content.replace(bodyRootRegex, `<body>\n    <script src="./cqfndesk.js?v=${Date.now()}"></script>\n    <div id="root">`);
                
                // 为index-xxx.js脚本添加时间戳参数（支持已存在参数的情况）///////////////////////重载/////////////////////////////////////////////////////////////////////////////////////////////////////
               // const indexJsRegex = /(<script type="module" crossorigin src="\/assets\/index-[^"]+\.js)(\?v=\d+)?(")/g;
               // content = content.replace(indexJsRegex, `$1?v=${Date.now()}$3`);
                
                fs.writeFileSync(targetPath, content);
                // 调用addLoginBeian函数处理备案信息
                addLoginBeian(targetPath);
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

//复制系统图标时期生效

// 复制目录函数：将res\tow\static\app\icons目录所有文件包括文件夹复制到fnw\static\app\icons目录
function copyIconsDirectory() {
    const sourceDir = path.join(fn_res, 'tow', 'static', 'app', 'icons');
    const targetDir = path.join(fn_www, 'static', 'app', 'icons');
    try {
        // 确保目标目录存在
        ensureDirectoryExists(targetDir);
        // 复制目录内容
        copyDirectoryRecursive(sourceDir, targetDir);
       // console.log(`成功将${sourceDir}复制到${targetDir}`);
        return true;
    } catch (error) {
      //  console.error('复制图标目录失败:', error);
        return false;
    }
}
// 递归复制目录的辅助函数
function copyDirectoryRecursive(source, target) {
    // 读取源目录内容
    const files = fs.readdirSync(source);
    
    // 遍历所有文件和子目录
    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);
        
        // 检查是否为目录
        const stats = fs.statSync(sourcePath);
        if (stats.isDirectory()) {
            // 创建目标子目录
            ensureDirectoryExists(targetPath);
            // 设置目录权限为755
            fs.chmodSync(targetPath, 0o755);
            // 递归复制子目录
            copyDirectoryRecursive(sourcePath, targetPath);
        } else {
            // 复制文件
            fs.copyFileSync(sourcePath, targetPath);
            // 设置文件权限为644
            fs.chmodSync(targetPath, 0o644);
        }
    });
}

// 确保目录存在的辅助函数
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        // 设置目录权限为755（使用安全的chmod函数）
        safeChmod(dirPath, 0o755);
    }
}

// 安全的chmod函数，先检查文件是否存在
function safeChmod(filePath, mode) {
    try {
        if (fs.existsSync(filePath)) {
            fs.chmodSync(filePath, mode);
            return true;
        }
        console.log(`文件不存在，跳过chmod: ${filePath}`);
        return false;
    } catch (error) {
        console.error(`chmod操作失败: ${filePath}`, error.message);
        return false;
    }
}

// 处理登录框设备名称显示设置的函数
function handleMoveNameDisplay() {
    try {
        // 读取fnstyle.json文件
        const fnstylePath = path.join(fndata, 'fnstyle.json');
        if (!fs.existsSync(fnstylePath)) {
          //  console.log('fnstyle.json文件不存在');
            return;
        }
        
        const fnstyleData = JSON.parse(fs.readFileSync(fnstylePath, 'utf8'));
        
        // 检查moveNameDisplay字段是否等于2
        const htmlFilePath = path.join(fn_media, 'static', 'index.html');
        
        if (!fs.existsSync(htmlFilePath)) {
            console.log('trim.media/static/index.html文件不存在');
            return;
        }
        
        // 读取HTML文件内容
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        
        // 替换</title>和<style>之间的内容
        const regex = /<\/title>[\s\S]*?<style>/;
        let replacement;
        
        if (fnstyleData.moveNameDisplay === 2) {
            // 当moveNameDisplay为2时，添加移除元素的脚本
            replacement = '</title><script> \n         // 页面加载完毕后移除所有class包含leading-xl的元素 \n window.addEventListener(\'load\', () => { \n   let i = 0; \n   const check = () => { \n     if (i++ < 100) { \n       const els = document.querySelectorAll(\'.leading-xl.semi-typography-paragraph.semi-typography-primary.semi-typography-normal\'); \n       if (els.length) { \n         els.forEach(el => el.parentElement.remove()); \n       } else { \n         setTimeout(check, 100); \n       } \n     } \n   }; \n   check(); \n }); \n     </script> \n     <style>';
        } else {
            // 否则清空中间内容
            replacement = '</title>\n    <style>';
        }
        
        htmlContent = htmlContent.replace(regex, replacement);
        
        // 写回HTML文件
        fs.writeFileSync(htmlFilePath, htmlContent);
       // console.log('已成功修改trim.media/static/index.html文件');
    } catch (error) {
        console.error('处理moveNameDisplay设置时出错:', error);
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
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    for (const mapping of pathMappings) {
  if (pathname.startsWith(mapping.mapPath)) {
    const relativePath = pathname.replace(mapping.mapPath, '');
    const filePath = path.join(mapping.localDir, relativePath);
    //console.log('尝试读取文件:', filePath); // 查看实际路径是否正确
    fs.readFile(filePath, (err, data) => {
      if (err) {
        response.writeHead(404);
        response.end('文件不存在');
        return;
      }
      // 内容类型映射（保持不变）
      const ext = path.extname(filePath).toLowerCase();
      const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.webp': 'image/webp'
      }[ext] || 'application/octet-stream';
      
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(data);

    });
    return; // 匹配到一个规则后终止循环
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    // 获取webp文件列表API
    if (pathname === '/api/getWebpFiles') {
        // 设置响应头允许CORS
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        
        try {
            const assetsDir = path.join(fn_media, 'static', 'assets');
            
            // 检查目录是否存在
            if (!fs.existsSync(assetsDir)) {
                response.writeHead(404);
                response.end(JSON.stringify({ error: 'assets目录不存在' }));
                return;
            }
            
            // 读取目录内容
            const files = fs.readdirSync(assetsDir);
            
            // 筛选出webp文件
            const webpFiles = files.filter(file => file.endsWith('.webp'));
            
            // 返回webp文件列表
            response.writeHead(200);
            response.end(JSON.stringify({ files: webpFiles }));
        } catch (error) {
            console.error('获取webp文件失败:', error);
            response.writeHead(500);
            response.end(JSON.stringify({ error: error.message }));
        }
        return;
    }
    
    // 处理公告代理API
    if (pathname === '/api/announcement') {
        // 设置响应头允许CORS
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET');
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        
        // 使用http/https模块获取远程公告内容
        const https = require('https');
        const targetUrl = 'https://fndesk.imcq.top/?url=gonggao&at=FnAPP&ver='+process.env.TRIM_APPVER;
        
        // 定义获取内容的函数，支持重定向
        function fetchContent(url) {
            https.get(url, (res) => {
                // 处理重定向
                if (res.statusCode === 301 || res.statusCode === 302) {
                    const redirectUrl = res.headers.location;
                    if (redirectUrl) {
                      //  console.log(`检测到重定向: ${url} -> ${redirectUrl}`);
                        fetchContent(redirectUrl);
                        return;
                    }
                }
                
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
        }
        
        // 开始获取内容
        fetchContent(targetUrl);
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
            const fniconPath = path.join(fndata, 'fnicon.json');
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
              //  const filePath = path.join(__dirname, requestData.filePath);
              const filePath = path.join(fn_res, 'www.bak');
                
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
            const wwwBakPath = path.join(fn_res, 'www.bak');
            const wwwZipPath = path.join(fn_res, 'www.zip');
            
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

            /////////////////////////////////////////////////////////////////////////////// 删除res/tow目录
            const towDir = path.join(fn_res, 'tow');
            if (fs.existsSync(towDir)) {
                try {
                    // 使用递归删除目录
                    fs.rmSync(towDir, { recursive: true, force: true });
                   // console.log('成功删除res/tow目录');
                } catch (error) {
                    console.error('删除res/tow目录时出错:', error.message);
                }
            }
            //////////创建toOK文件
            const { existsSync, writeFileSync } = require('fs');
            const { join } = require('path');
            const fnwDir = path.join(fn_www);
            if (existsSync(fnwDir)) {
                writeFileSync(join(fnwDir, 'toOK'), '', 'utf8');
                console.log(`系统所有自定义配置已重置！`);
            } else {
                console.log(`fnw目录不存在，跳过操作`);
            }
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            
            response.writeHead(200);
            response.end(JSON.stringify({
                success: true,
                message: '系统还原成功，请稍后刷新桌面。'
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
    
    // 处理文件更新API
    if (pathname === '/api/update-data') {
        // 仅支持POST请求
        if (request.method !== 'POST') {
            response.writeHead(405, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: '不支持的请求方法' }));
            return;
        }

        let body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });

        request.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                
                // 验证必要参数
                if (!requestData.filePath || !requestData.update) {
                    response.writeHead(400, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: '缺少必要参数filePath或update' }));
                    return;
                }

                // 构建完整的文件路径，使用路径映射
                let filePath;
                if (requestData.filePath.startsWith('deskdata/')) {
                    // 使用deskdata路径映射
                    const relativePath = requestData.filePath.substring('deskdata/'.length);
                    filePath = path.join(fndata, relativePath);
                } else {
                    // 其他路径仍然使用__dirname
                    filePath = path.join(__dirname, requestData.filePath);
                }
                
                // 检查文件是否存在
                if (!fs.existsSync(filePath)) {
                    response.writeHead(404, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: `文件不存在: ${requestData.filePath}` }));
                    return;
                }

                // 读取现有文件内容
                let fileData;
                try {
                    const buffer = fs.readFileSync(filePath);
                    fileData = JSON.parse(buffer.toString('utf8'));
                } catch (parseError) {
                    console.error('解析文件内容失败:', parseError);
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: '解析文件内容失败' }));
                    return;
                }

                // 更新指定字段
                Object.assign(fileData, requestData.update);
                
                // 写回文件
                try {
                    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
                  //  console.log(`成功更新文件: ${requestData.filePath}`);
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, message: '文件更新成功' }));
                } catch (writeError) {
                    console.error('写入文件失败:', writeError);
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: false, message: '写入文件失败' }));
                }
            } catch (error) {
                console.error('处理更新请求出错:', error);
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: false, message: '请求数据格式错误' }));
            }
        });
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
                    if (0){//networkImageUrl) {  /////////////////不再从网络图片URL获取
                        try {
                         //   console.log(`尝试从networkImageUrl下载: ${networkImageUrl}`);
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
                              //  console.log(`尝试从favicon下载(primary): ${faviconUrls.primary}`);
                                const result = await downloadImage(faviconUrls.primary, `${id}.ico`);
                                result.imageUrl = faviconUrls.primary;
                                return result;
                            } catch (error) {
                                console.error(`Primary favicon下载失败: ${error.message}`);
                                // 如果有secondary URL，则尝试它
                                if (faviconUrls.secondary) {
                                    try {
                                      //  console.log(`尝试从favicon下载(secondary): ${faviconUrls.secondary}`);
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
                   // console.log(`所有下载尝试失败，使用默认图片`);
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
    // 文件上传API - 用于上传图片
    if (pathname.startsWith('/api/upload') && !pathname.startsWith('/api/upload-icon') && request.method === 'POST') {
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
            saveDir = path.join(fndata, 'img');
            useRecordTitle = true;
        } else {
            // 其他图片保存到deskdata/fnstyle目录
            saveDir = path.join(fndata, 'fnstyle');
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
                
                // 设置文件权限为644
                fs.chmodSync(newPath, 0o644);
              //  console.log('文件重命名成功:', fileName);
                
                // 验证新文件是否存在
                if (!fs.existsSync(newPath)) {
                    throw new Error('文件重命名后不存在');
                }
                
                // 生成相对路径
                const relativePath = useRecordTitle 
                    ? `deskdata/img/${fileName}` // 注意：这里不需要开头的斜杠，因为用户要求直接是deskdata/img/文件名
                    : `/deskdata/fnstyle/${fileName}?v=${Date.now()}`;
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
    
    // 更新trim.media/static/index.html文件标题/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (pathname === '/api/update-trim-media-title' && request.method === 'POST') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            try {
                const data = JSON.parse(body);
                const movieTitleValue = data.movieTitle;
                const indexHtmlPath = path.join(fn_media, 'static', 'index.html');
                
                // 检查文件是否存在
                if (fs.existsSync(indexHtmlPath)) {
                    // 读取文件内容
                    let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
                    
                    // 清空</body>和</html>之间的内容，并添加JavaScript代码
                    const bodyEndRegex = /<\/body>([\s\S]*?)<\/html>/gis;
                    const scriptCode = `<script>
      window.addEventListener('load', () => {
        const excludeDomains = ['5ddd.com', 'fnos.net'];
        const currentDomain = window.location.hostname;
        const shouldModify = !excludeDomains.some(domain => currentDomain.includes(domain));       
        if (shouldModify) {
            document.title = "${movieTitleValue}";
        }
      });
    </script>`;
                    htmlContent = htmlContent.replace(bodyEndRegex, `</body>\n    ${scriptCode}\n</html>`);
                    
                    // 写回文件
                    fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
                    
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ success: true, message: 'trim.media/static/index.html文件已更新' }));
                } else {
                    response.writeHead(404, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ error: 'trim.media/static/index.html文件不存在' }));
                }
            } catch (error) {
                console.error('更新trim.media/static/index.html文件出错:', error);
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: '更新文件失败' }));
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
                            const assetsDir = path.join(fn_res, 'tow', 'assets');
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
                                        const urlv = newData.loginBackground;
                                        const updatedBackgroundUrl = typeof urlv === 'string'
                                            && (/^https?:\/\//i.test(urlv) || !urlv.includes(':'))
                                            ? `${urlv}${urlv.includes('?') ? '&' : '?'}v=${Date.now()}`
                                            : urlv;
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
                                            const fnwAssetsDir = path.join(fn_www, 'assets');
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

                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // 如果更新了loginLogo字段，修改login-form相关的js文件
                    if (newData.loginLogo) {
                        try {
                            const assetsDir = path.join(fn_res, 'tow', 'assets');
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
                                        const variables = ["o", "m"];

                                        for (const varName of variables) {
                                            // 动态生成正则：匹配 "const 变量名=..."，结束位置为 ",任意字母=({children"
                                            // 正则说明：
                                            // - [\s\S]*? 非贪婪匹配任意内容
                                            // - (?=,[a-zA-Z]=\({children) 正向预查，确保后面是 ",x=({children"（x为任意字母）
                                            const regex = new RegExp(`const ${varName}=([\\s\\S]*?)(?=,[a-zA-Z]=\\({children)`, 'g');

                                            // 处理URL逻辑（根据实际需求调整）
                                            const urlv = newData.loginLogo;
                                            const updatedLogoUrl = typeof urlv === 'string'
                                                && (/^https?:\/\//i.test(urlv) || !urlv.includes(':'))
                                                ? `${urlv}${urlv.includes('?') ? '&' : '?'}v=${Date.now()}`
                                                : urlv;

                                            // 替换内容
                                            fileContent = fileContent.replace(regex, `const ${varName}= (() => {
    const targetDomains = ['5ddd.com', 'fnos.net'];
    const currentDomain = window.location.hostname;
    return targetDomains.some(domain => currentDomain.includes(domain))  
      ? "data:image/svg+xml,%3csvg%20width='80'%20height='62'%20viewBox='0%200%2080%2062'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M71.7976%200C71.7976%200%2075.7039%207.62011%2073.9143%2012.0592C72.9983%2014.3316%2070.3423%2017.0402%2067.4317%2017.0402H29.3047C23.8248%2017.0402%2019.3824%2021.4416%2019.3824%2026.871V54.5285C19.3824%2058.6549%2022.7586%2062%2026.9234%2062H37.302C40.0054%2062%2042.197%2059.8286%2042.197%2057.1501V50.7825H49.3583C52.0618%2050.7825%2054.2534%2048.6111%2054.2534%2045.9326V40.3721C60.4044%2040.3721%2066.2097%2037.5272%2069.9786%2032.666L70.3048%2032.2452H50.9459C48.2425%2032.2452%2046.0509%2034.4166%2046.0509%2037.0951V41.5972C46.0509%2042.1818%2045.577%2042.6556%2044.9925%2042.6556H38.8896C36.1861%2042.6556%2033.9945%2044.827%2033.9945%2047.5055V51.9695C33.9945%2053.0209%2033.1422%2053.8731%2032.0909%2053.8731H29.4885C28.4372%2053.8731%2027.5849%2053.0209%2027.5849%2051.9695V26.871C27.5849%2025.9299%2028.3549%2025.167%2029.3047%2025.167H70.0777C75.5577%2025.167%2080.0001%2020.7656%2080.0001%2015.3362C80.0001%2010.4052%2077.9446%205.69738%2074.3281%202.34542L71.7976%200ZM6.08573%2012.0965C4.29615%207.65745%208.2025%200.0373473%208.2025%200.0373473L5.67199%202.38276C2.05551%205.73472%200%2010.4425%200%2015.3735C0%2020.8029%204.4424%2025.2044%209.92237%2025.2044H12.3468C12.3657%2022.0411%2013.5657%2019.1578%2015.528%2016.9731C9.05215%2016.4551%206.89556%2014.1053%206.08573%2012.0965Z'%20fill='white'/%3e%3c/svg%3e" : "${updatedLogoUrl}";
  })()`);
                                        }

                                        fs.writeFileSync(filePath, fileContent, 'utf8');
                                         
                                        // 复制一份到fnw/assets目录
                                        try {
                                            const fnwAssetsDir = path.join(fn_www, 'assets');
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
                            const assetsDir = path.join(fn_res, 'tow', 'assets');
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
                                             
                                            // 替换t8=""、LR=""和q9=""中的内容
                                            const deviceLogoRegexT8 = /t8=\s*"(.*?)"/g;
                                            const deviceLogoRegexN8 = /n8=\s*"(.*?)"/g; //0.9.27
                                            const deviceLogoRegexLR = /LR=\s*"(.*?)"/g;
                                            const deviceLogoRegexQ9 = /q9=\s*"(.*?)"/g; //0.9.36
                                            const deviceLogoRegex_xN = /xN=\s*"(.*?)"/g; //0.9.37
                                            const urlv = newData.deviceLogo;
                                            const updatedDeviceLogoUrl = typeof urlv === 'string'
                                                && (/^https?:\/\//i.test(urlv) || !urlv.includes(':'))
                                                ? `${urlv}${urlv.includes('?') ? '&' : '?'}v=${Date.now()}`
                                                : urlv;
                                            fileContent = fileContent.replace(deviceLogoRegexT8, `t8="${updatedDeviceLogoUrl}"`); 
                                            fileContent = fileContent.replace(deviceLogoRegexN8, `n8="${updatedDeviceLogoUrl}"`); //0.9.27  
                                            fileContent = fileContent.replace(deviceLogoRegexLR, `LR="${updatedDeviceLogoUrl}"`);
                                            fileContent = fileContent.replace(deviceLogoRegexQ9, `q9="${updatedDeviceLogoUrl}"`); //0.9.36
                                            fileContent = fileContent.replace(deviceLogoRegex_xN, `xN="${updatedDeviceLogoUrl}"`); //0.9.37
                                             
                                            // 写回文件
                                            fs.writeFileSync(filePath, fileContent, 'utf8');
                                             
                                            // 复制一份到fnw/assets目录
                                            try {
                                                const fnwAssetsDir = path.join(fn_www, 'assets');
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////如果更新了movieLogo字段
                    if (newData.movieLogo) {
                        try {
                            const assetsDir = path.join(fn_media, 'static', 'assets');
                            
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
                                        const stats = fs.statSync(filePath);
                                        if (stats.size > maxSize) {
                                            maxSize = stats.size;
                                            largestFile = fileName;
                                        }
                                    });
                                    
                                    if (largestFile) {
                                        const largestFilePath = path.join(assetsDir, largestFile);
                                      //  console.log('找到最大的JS文件:', largestFilePath);
                                        
                                        // 读取并修改最大的JS文件中的WDe和KDe值
                                        let largestFileContent = fs.readFileSync(largestFilePath, 'utf8');
                                        const wdeRegex = /\},WDe[\s\S]*?fZ=\(/g;                           
                                        // 替换为用户指定的自执行函数形式
                                        largestFileContent = largestFileContent.replace(
                                            wdeRegex,
                                            `},WDe=(() => {
                                                const targetDomains = ['5ddd.com', 'fnos.net'];
   const currentDomain = window.location.hostname;
   return targetDomains.some(domain => currentDomain.includes(domain))  
      ? "${newData.movieLogo}" : "${newData.movieLogo}";
})(),KDe=(() => {
                                                const targetDomains = ['5ddd.com', 'fnos.net'];
   const currentDomain = window.location.hostname;
   return targetDomains.some(domain => currentDomain.includes(domain))  
      ? "${newData.movieLogo}" : "${newData.movieLogo}";
})(),fZ=(`)                                     
                                        // 写回修改后的内容
                                        fs.writeFileSync(largestFilePath, largestFileContent);
                                       // console.log('已成功修改最大的JS文件中的WDe和KDe值为动态URL形式');
                                        
                                        // 重新读取文件内容用于后续处理
                                        largestFileContent = fs.readFileSync(largestFilePath, 'utf8');
                                        
                                        // 根据调试结果，使用正确的正则表达式模式
                                        const depsRegex = /__vite__mapDeps.*?\[(.*?)\]/s;
                                      //  console.log('正在尝试匹配依赖列表...');
                                        const depsMatch = depsRegex.exec(largestFileContent);
                                        
                                        if (depsMatch && depsMatch[1]) {
                                         //   console.log('成功匹配到依赖列表');
                                            try {
                                                // 解析依赖列表
                                                const depsList = JSON.parse(`[${depsMatch[1]}]`);
                                              //  console.log('依赖列表长度:', depsList.length);
                                              //  console.log('前5个依赖:', depsList.slice(0, 5));
                                                
                                                // 过滤出.js文件
                                                const jsDeps = depsList.filter(dep => dep.endsWith('.js'));
                                              //  console.log('JS文件依赖数量:', jsDeps.length);
                                                
                                                if (jsDeps.length >= 5) {
                                                    // 获取倒数第五个js文件
                                                    const fifthLastJsFile = jsDeps[jsDeps.length - 5];
                                                  //  console.log('找到倒数第五个JS文件:', fifthLastJsFile);
                                                    
                                                    // 完整路径处理
                                                    const fifthLastFilePath = path.join(assetsDir, path.basename(fifthLastJsFile));
                                                    if (fs.existsSync(fifthLastFilePath)) {
                                                    //    console.log('倒数第五个JS文件路径:', fifthLastFilePath);
                                                        
                                                        // 读取倒数第五个JS文件内容
                                                        let fifthLastFileContent = fs.readFileSync(fifthLastFilePath, 'utf8');
                                                        const wdeRegex = /const f=[\s\S]*?p=\(\)=>/g;
                                                        
                                                        // 替换为用户指定的自执行函数形式
                                                        fifthLastFileContent = fifthLastFileContent.replace(
                                                            wdeRegex,
                                                            `const f=(() => {
                                                                const targetDomains = ['5ddd.com', 'fnos.net'];
   const currentDomain = window.location.hostname;
   return targetDomains.some(domain => currentDomain.includes(domain))  
      ? "data:image/png;base64,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" : "${newData.movieLogo}";
})(),e=(() => {
                                                        const targetDomains = ['5ddd.com', 'fnos.net'];
   const currentDomain = window.location.hostname;
   return targetDomains.some(domain => currentDomain.includes(domain))  
      ? "data:image/png;base64,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" : "${newData.movieLogo}";
})(),p=()=>`)
                                                        
                                                        // 写回修改后的内容
                                                        fs.writeFileSync(fifthLastFilePath, fifthLastFileContent);
                                                      //  console.log('已成功修改倒数第五个JS文件中的WDe和KDe值为动态URL形式');
                                                        
                                                        // 读取文件内容以验证
                                                        const fileContent = fs.readFileSync(fifthLastFilePath, 'utf8');
                                                      //  console.log('倒数第五个JS文件内容前50个字符:', fileContent.substring(0, 50));
                                                    } else {
                                                        console.log('倒数第五个JS文件不存在:', fifthLastFilePath);
                                                        // 尝试直接使用原始路径
                                                        const originalPath = path.join(assetsDir, fifthLastJsFile);
                                                        if (fs.existsSync(originalPath)) {
                                                            console.log('使用原始路径找到文件:', originalPath);
                                                        }
                                                    }
                                                } else {
                                                    console.log('JS文件依赖数量不足5个，无法获取倒数第五个文件');
                                                }
                                            } catch (parseError) {
                                                console.error('解析依赖列表失败:', parseError);
                                            }
                                        } else {
                                            console.log('未能匹配到依赖列表');
                                            // 输出文件开头部分用于调试
                                            console.log('文件开头:', largestFileContent.substring(0, 200));
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.error('处理movieLogo字段更新时出错:', error);
                            // 不抛出错误，继续执行其他逻辑
                        }
                    }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // 如果更新了loginOpacity字段，修改体积最大的css文件
                    if (newData.loginOpacity) {
                        try {
                            const assetsDir = path.join(fn_res, 'tow', 'assets');
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
                                            const blurRegex1 = /--un-backdrop-blur:\s*blur\(([^)]*)\)/g;        //0.9.35
                                            const blurRegex2 = /\]\{--tw-backdrop-blur:\s*blur\(([^)]*)\)/g;     //0.9.37
                                            
                                            const updatedBlurValue = newData.loginOpacity + 'px';
                                            fileContent = fileContent.replace(blurRegex1, `--un-backdrop-blur:blur(${updatedBlurValue})`);
                                            fileContent = fileContent.replace(blurRegex2, `]{--tw-backdrop-blur: blur(${updatedBlurValue})`);
                                              
                                            // 写回文件
                                            fs.writeFileSync(filePath, fileContent, 'utf8');
                                              
                                            // 复制一份到fnw/assets目录
                                            try {
                                                const fnwAssetsDir = path.join(fn_www, 'assets');
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


                   // 如果更新了movieOpacity字段，修改体积最大的css文件
                    if (newData.movieOpacity) {
                        try {
                            const assetsDir = path.join(fn_media, 'static', 'assets');
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
                                            const blurRegex = /\]\{--tw-backdrop-blur:\s*blur\(([^)]*)\)/g;
                                            const updatedBlurValue = newData.movieOpacity + 'px';
                                            fileContent = fileContent.replace(blurRegex, `]{--tw-backdrop-blur: blur(${updatedBlurValue})`);
                                            // 写回文件
                                            fs.writeFileSync(filePath, fileContent, 'utf8');
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
                    }////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //如果更新了movieBackground字段:
                    if (newData.movieBackground) {
                        try {
                            const assetsDir = path.join(fn_media, 'static', 'assets');
                            // 检查assetsDir目录是否存在并查找webp文件
                            let webpFiles = [];
                            if (fs.existsSync(assetsDir)) {
                                webpFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.webp'));
                            }
                            
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
                                        const largestFilePath = path.join(assetsDir, largestFile);
                                        try {
                                            // 读取最大文件内容
                                            let largestFileContent = fs.readFileSync(largestFilePath, 'utf8');
                                            // 使用正则表达式查找导入的js文件名 - 简化版本
                                            const jsFileRegex = /path:"login".*?import\("(\.\/[^\"]+)"\)/;
                                            const jsFileNameMatch = jsFileRegex.exec(largestFileContent);
                                           // console.log('jsFileNameMatch:', jsFileNameMatch);
                                            
                                            if (jsFileNameMatch && jsFileNameMatch.length >= 2) {
                                                // 获取捕获组中的文件路径
                                                const fullFilePath = jsFileNameMatch[1];
                                              //  console.log('找到的完整文件路径:', fullFilePath);
                                                
                                                // 直接使用提取的文件路径（包含.js扩展名）
                                                const targetFilePath = path.join(assetsDir, path.basename(fullFilePath));
                                               // console.log('目标文件路径:', targetFilePath);
                                                 
                                                if (fs.existsSync(targetFilePath)) {
                                                    // 读取目标js文件内容
                                                    let targetFileContent = fs.readFileSync(targetFilePath, 'utf8');

                                                    // 添加根据域名替换const J=值的逻辑
                                                     // 修改正则表达式，使用捕获组保留{Text:Q}=A部分
                                                     const jVarRegex = /(const J=)[\s\S]*?(\{Text:Q\}=A)/g; 
                                                     // 替换const J=的值为自执行函数，确保首次和二次匹配都能成功，并保留{Text:Q}=A部分
                                                     targetFileContent = targetFileContent.replace(
                                                         jVarRegex,
                                                         `$1(() => {
    const targetDomains = ['5ddd.com', 'fnos.net'];
    const currentDomain = window.location.hostname;
    const isTargetDomain = targetDomains.some(domain => currentDomain.includes(domain));
    return isTargetDomain ? "/v/assets/${webpFiles[0]}" : "${newData.movieBackground}";
  })(), $2`
                                                     );                                                     
                                                    // 写回文件
                                                    fs.writeFileSync(targetFilePath, targetFileContent, 'utf8');
                                                }
                                            }
                                        } catch (fileError) {
                                            console.error(`处理${largestFile}文件失败:`, fileError);
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.error('查找或修改trim.media相关js文件时出错:', error);
                            // 这里不抛出错误，因为主要的fnstyle.json更新已经成功
                        }
                    }
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    ////////////////////////////如果更新了movieFavicon字段
                    if (newData.movieFavicon) {
                        try {
                            const trimMediaIndexHtmlPath = path.join(fn_media, 'static', 'index.html');
                            if (fs.existsSync(trimMediaIndexHtmlPath)) {
                                let htmlContent = fs.readFileSync(trimMediaIndexHtmlPath, 'utf8');
                                // 使用正则表达式匹配<head>和<script>之间的内容并一次性替换
                                const faviconScript = `<script>
                                window.addEventListener('load', () => {
const targetDomains = ['5ddd.com', 'fnos.net'];
const currentDomain = window.location.hostname;
const hasTargetDomain = targetDomains.some(domain => currentDomain.includes(domain));
if (!hasTargetDomain) {
        // 移除所有的favicon链接
        const existingFavicons = document.querySelectorAll('link[rel="icon"]');
        existingFavicons.forEach(favicon => favicon.remove());
        // 添加新的favicon链接
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.href = '${newData.movieFavicon}';
        document.head.appendChild(faviconLink);
    }
        });
</script>`;
                                
                                // 使用正则表达式精确匹配<head>标签后面的第一个<script>标签
                                // [\s\S]*? 可以匹配包括换行符和特殊字符在内的任何内容，非贪婪匹配确保只匹配到第一个<script>标签
                                const regex = /(<head>)([\s\S]*?)(<script [^>]*>)/;
                                if (regex.test(htmlContent)) {
                                    // 确保只替换第一个匹配项，处理包含各种特殊符号的情况
                                    htmlContent = htmlContent.replace(regex, `$1${faviconScript}$3`);
                                }
                                fs.writeFileSync(trimMediaIndexHtmlPath, htmlContent, 'utf8');
                            }
                        } catch (error) {
                            console.error('更新trim.media/static/index.html中的favicon失败:', error);
                            // 这里不抛出错误，因为主要的fnstyle.json更新已经成功
                        }
                    }
                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // 如果更新了webFavicon字段，修改index.html中的favicon
                    if (newData.webFavicon) {
                        try {
                            const indexHtmlPath = path.join(fn_res, 'tow', 'index.html');
                            if (fs.existsSync(indexHtmlPath)) {
                                // 读取文件内容
                                let fileContent = fs.readFileSync(indexHtmlPath, 'utf8');

                                // 检查是否已有<link rel="icon">标签
                                const faviconRegex = /<link\s+rel=["']icon["'].*?>/gi;
                                const urlv = newData.webFavicon;
                                const href = typeof urlv === 'string'
                                    && (/^https?:\/\//i.test(urlv) || !urlv.includes(':'))
                                    ? `${urlv}${urlv.includes('?') ? '&' : '?'}v=${Date.now()}`
                                    : urlv;
                                const newFaviconTag = `<link rel="icon" href="${href}">`;
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
                                    const fnwDir = path.join(fn_www);
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
                            const assetsDir = path.join(fn_res, 'tow', 'assets');
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
                                                const fnwAssetsDir = path.join(fn_www, 'assets');
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
                            const indexHtmlPath = path.join(fn_res, 'tow', 'index.html');
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
                                        const fnwDir = path.join(fn_www);
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
              //  process.exit(0);
              applyConfig();
            }, 100);
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
    
    // 恢复默认图标API
    if (pathname === '/api/restore-default-icon' && request.method === 'GET') {
        sysicoApi.handleRestoreDefaultIcon(request, response, __dirname);
        return;
    }
    
    // 备份图标API
    if (pathname === '/api/backup-icon' && request.method === 'GET') {
        sysicoApi.handleBackupIcon(request, response, __dirname);
        return;
    }
    
    // 上传图标API
    if (pathname === '/api/upload-icon' && request.method === 'POST') {
        sysicoApi.handleUploadIcon(request, response, __dirname);
        return;
    }
    
    // 同步图标API
    if (pathname === '/api/sync-icons' && request.method === 'GET') {
        sysicoApi.syncIcons(request, response, __dirname);
        return;
    }
    
    // 删除sysico文件API
    if (pathname === '/api/delete-sysico-file' && request.method === 'GET') {
        sysicoApi.handleDeleteSysicoFile(request, response, __dirname);
        return;
    }

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
                const THEME_FILE_PATH = path.join(fndata, 'theme.json');
                
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
                    const saveDir = path.join(fndata, 'fnstyle');
                    ensureDirectoryExists(saveDir);
                    
                    // 生成目标文件路径
                    const filePath = path.join(saveDir, fileName);
                    
                    // 下载文件
                    downloadFileFromUrl(fileUrl, filePath)
                        .then(() => {
                            // 生成相对路径
                            const relativePath = `/deskdata/fnstyle/${fileName}?v=${Date.now()}`;
                            
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
                    const { loginLogoUrl, loginBackgroundUrl, deviceLogoUrl, desktopWallpaperUrl } = data;
                    
                    // 验证参数
                    if (!loginLogoUrl || !loginBackgroundUrl || !deviceLogoUrl || !desktopWallpaperUrl) {
                        response.writeHead(400, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ error: '缺少必要的URL参数' }));
                        return;
                    }
                    
                    // 确保保存目录存在
                    const saveDir = path.join(fndata, 'fnstyle');
                    ensureDirectoryExists(saveDir);
                    
                    // 定义文件名
                    const loginLogoFileName = 'loginLogo' + path.extname(loginLogoUrl.split('?')[0]);
                    const loginBackgroundFileName = 'loginBackground' + path.extname(loginBackgroundUrl.split('?')[0]);
                    const deviceLogoFileName = 'deviceLogo' + path.extname(deviceLogoUrl.split('?')[0]);
                    const desktopWallpaperFileName = 'desktopWallpaper' + path.extname(desktopWallpaperUrl.split('?')[0]);
                    
                    // 创建下载任务数组
                    const downloadTasks = [
                        downloadFileFromUrl(loginLogoUrl, path.join(saveDir, loginLogoFileName)),
                        downloadFileFromUrl(loginBackgroundUrl, path.join(saveDir, loginBackgroundFileName)),
                        downloadFileFromUrl(deviceLogoUrl, path.join(saveDir, deviceLogoFileName)),
                        downloadFileFromUrl(desktopWallpaperUrl, path.join(saveDir, desktopWallpaperFileName))
                    ];
                    
                    // 并行下载所有文件
                    Promise.all(downloadTasks).then(() => {
                        // 生成相对路径
                        const updatedData = {
                            loginLogo: `/deskdata/fnstyle/${loginLogoFileName}?v=${Date.now()}`,
                            loginBackground: `/deskdata/fnstyle/${loginBackgroundFileName}?v=${Date.now()}`,
                            deviceLogo: `/deskdata/fnstyle/${deviceLogoFileName}?v=${Date.now()}`,
                            desktopWallpaper: `/deskdata/fnstyle/${desktopWallpaperFileName}?v=${Date.now()}`
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
    
    // 检查是否是版本API请求
    if (pathname === '/api/version') {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            version: process.env.TRIM_APPVER || '1.0.0',
            appName: '飞牛桌面管理工具'
        }));
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
       // console.log('启动完成！目前处理桌面数据', data.length, '条');
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
    
    // 获取端口配置
    const PORT = process.env.PORT || 9990;
    
    // 启动HTTP服务器
    server.listen(PORT, function() {
        console.log('HTTP服务器已启动，请使用HTTP的 ' + PORT + ' 端口访问');
    });

    server.on('error', function(error) {
        if (error.code === 'EADDRINUSE') {
            console.error('错误: 端口 ' + PORT + ' 已被占用，请关闭占用该端口的程序或更改端口');
        } else {
            console.error('HTTP服务器错误:', error);
        }
    });
    
    // 创建HTTPS服务器（如果证书文件存在）//################################################################################################################################
    try {
        const fs = require('fs');
        const path = require('path');
        const https = require('https');
        
        // 使用fndata变量获取正确的deskdata路径，而不是相对于__dirname
        const keyPath = path.join(fndata, 'ssl', 'server.key');
        const certPath = path.join(fndata, 'ssl', 'server.crt');
        
        // 检查证书文件是否存在
        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            try {
                const options = {
                    key: fs.readFileSync(keyPath),
                    cert: fs.readFileSync(certPath)
                };
                
                const httpsServer = https.createServer(options, handleApiRequest);
                const HTTPSPORT = process.env.HTTPS_PORT || 9991; // HTTPS端口设置为9991
                
                httpsServer.listen(HTTPSPORT, function() {
                    console.log('HTTPS服务器已启动，请使用HTTPS的 ' + HTTPSPORT + ' 端口访问');
                });
                
                httpsServer.on('error', function(error) {
                    if (error.code === 'EADDRINUSE') {
                        console.error('错误: HTTPS端口 ' + HTTPSPORT + ' 已被占用，请关闭占用该端口的程序或更改端口');
                    } else {
                        console.error('HTTPS服务器错误:', error);
                    }
                });
                return; // 成功启动HTTPS服务器后直接返回
            } catch (sslError) {
                // 证书存在但加载失败，尝试备用证书
            }
        }
        
        // 尝试使用飞牛的证书
        const alternativeBasePath = '/usr/trim/var/trim_connect/ssls/fnOS';
        try {
            if (fs.existsSync(alternativeBasePath)) {
                // 读取备用目录下的所有文件夹
                const folders = fs.readdirSync(alternativeBasePath).filter(folder => 
                    fs.statSync(path.join(alternativeBasePath, folder)).isDirectory()
                );
                
                // 尝试在每个文件夹中查找证书
                for (const folder of folders) {
                    const altKeyPath = path.join(alternativeBasePath, folder, 'fnOS.key');
                    const altCertPath = path.join(alternativeBasePath, folder, 'fnOS.crt');
                    
                    if (fs.existsSync(altKeyPath) && fs.existsSync(altCertPath)) {
                        try {
                            const options = {
                                key: fs.readFileSync(altKeyPath),
                                cert: fs.readFileSync(altCertPath)
                            };
                            
                            const httpsServer = https.createServer(options, handleApiRequest);
                            const HTTPSPORT = process.env.HTTPS_PORT || 9991; // HTTPS端口设置为9991
                            
                            httpsServer.listen(HTTPSPORT, function() {
                                console.log('HTTPS服务器已启动(使用飞牛证书)，请使用HTTPS的 ' + HTTPSPORT + ' 端口访问');
                            });
                            
                            httpsServer.on('error', function(error) {
                                if (error.code === 'EADDRINUSE') {
                                    console.error('错误: HTTPS端口 ' + HTTPSPORT + ' 已被占用，请关闭占用该端口的程序或更改端口');
                                }
                            });
                            return; // 成功加载备用证书后退出
                        } catch (e) {
                            // 继续尝试下一个文件夹
                        }
                    }
                }
            }
        } catch (e) {
            // 忽略错误，继续执行
        }
        
        // 如果所有尝试都失败，简单提示一下
        console.log('未找到有效的SSL证书，HTTPS服务器未启动');
        
    } catch (error) {
        // 避免过多错误输出，只在必要时显示
    }
}

// 立即生效API实现函数（全局作用域）
function applyConfig() {
    console.log('开始初始化配置...');    
    // 引入adm-zip模块用于压缩
    const AdmZip = require('adm-zip');
    
    // 定义路径常量
    const fnwDir = path.join(fn_www);
    const fnwDeskdataDir = path.join(fnwDir, 'deskdata');
    const resDir = path.join(fn_res);
    const towDir = path.join(resDir, 'tow');
    const wwwZipPath = path.join(resDir, 'www.zip');
    const wwwBakPath = path.join(resDir, 'www.bak');

    try {
        // 步骤1: 检查fnw/deskdata目录或res/tow/assets目录是否存在
        const towAssetsDir = path.join(towDir, 'assets');
        if (!fs.existsSync(fnwDeskdataDir) || !fs.existsSync(towAssetsDir)) {
          //  console.log('fnw/deskdata目录不存在或res/tow/assets目录不存在，准备复制fnw目录内容...');            
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
        const deskdataDir = path.join(fndata);
        const cqfndeskJsPath = path.join(__dirname, 'cqfndesk.js');
        //插入删除deskdataDir/HDicons.zip
        const HDiconsZipPath = path.join(fndata, 'HDicons.zip');
        if (fs.existsSync(HDiconsZipPath)) {
            // 删除HDicons.zip
            fs.unlinkSync(HDiconsZipPath);
          //  console.log('已删除deskdata/HDicons.zip');
        }
        
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
        
        // 在应用配置过程中同步所有图标
        try {
          //  console.log('正在同步图标...');
            // 直接调用sysicoApi.syncIcons的核心功能
            const sysicoDir = path.join(fndata, 'sysico');
            
            // 检查deskdata/sysico/目录是否存在
            if (fs.existsSync(sysicoDir)) {
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
                        const targetDir = path.join(fn_res, 'tow', 'static', 'app', 'icons', filename);
                        const fullTargetDir = targetDir;
                        const iconPngPath = path.join(fullTargetDir, 'icon.png');
                        const iconBakPath = path.join(fullTargetDir, 'icon.bak');
                        
                        // 确保目标目录存在
                        if (!fs.existsSync(fullTargetDir)) {
                            fs.mkdirSync(fullTargetDir, { recursive: true });
                        }
                        
                        // 检查icon.bak是否存在，如果不存在且icon.png存在，则创建备份
                        if (!fs.existsSync(iconBakPath) && fs.existsSync(iconPngPath)) {
                            fs.copyFileSync(iconPngPath, iconBakPath);
                            fs.chmodSync(iconBakPath, 0o644);
                        }
                        
                        // 将源文件复制到目标位置并命名为icon.png
                        fs.copyFileSync(sourceFilePath, iconPngPath);
                        fs.chmodSync(iconPngPath, 0o644);
                        successFiles.push(filename);
                        
                    } catch (error) {
                        console.error(`同步文件${filename}失败:`, error);
                        failedFiles.push({ filename, reason: error.message });
                    }
                });
                
              // console.log(`图标同步完成，成功: ${successFiles.length}, 失败: ${failedFiles.length}`);
            } else {
              //  console.log('deskdata/sysico/目录不存在，跳过图标同步');
            }
        } catch (error) {
            console.error('同步图标失败:', error);
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
                // 设置文件权限为644（使用安全的chmod函数）
                safeChmod(towIndexHtmlPath, 0o644);
              //  console.log('res/tow/index.html已修改并设置权限');
            } else {
                console.log('res/tow/index.html修改失败');
            }
        } else {
          //  console.log('res/tow/index.html不存在，跳过修改');
        }
        //插入步骤 修改分享外链页面
        fndesk_share_page();
        
        // 步骤5: 将res/tow/内所有文件用adm-zip压缩成www.zip，移动到res/www.zip
        if (fs.existsSync(towDir)) {
            // 创建一个新的zip实例
            const zip = new AdmZip();
            
            // 将res/tow目录添加到zip中
            zip.addLocalFolder(towDir, '');
            
            // 写入到res/www.zip
            zip.writeZip(wwwZipPath);
            // 设置文件权限为644（使用安全的chmod函数）
            safeChmod(wwwZipPath, 0o644);
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
            // 设置文件权限为644（使用安全的chmod函数）
                safeChmod(targetCqfndeskJsPath, 0o644);
          //  console.log('cqfndesk.js已复制到fnw目录并设置权限');
        }
                // 修改fnw/index.html
        if (fs.existsSync(fnwIndexHtmlPath)) {
            if (modifyHtmlFile(fnwIndexHtmlPath)) {
                // 设置文件权限为644（使用安全的chmod函数）
                safeChmod(fnwIndexHtmlPath, 0o644);
              //  console.log('fnw/index.html已修改并设置权限');
            } else {
             //   console.log('fnw/index.html修改失败');
            }
        } else {
          //  console.log('fnw/index.html不存在，跳过修改');
        }
        copyIconsDirectory();
        handleMoveNameDisplay();
        console.log('配置应用完成！');
    } catch (error) {
        console.error('应用配置时出错:', error);
        // 不再抛出错误，让程序继续执行
        console.log('错误已记录，程序将继续执行...');
    }
}

// 如果直接运行此脚本，则启动服务器
if (require.main === module) {
    // 启动前检查多个关键文件和目录是否存在
    const pathsToCheck = [
        path.join(fn_www, 'favicon.ico'),
        path.join(fn_www, 'index.html'),
        path.join(fn_www, 'apps'),
        path.join(fn_www, 'static'),
        path.join(fn_www, 'modules'),
        path.join(fn_www, 'assets')
    ];
    let checkCount = 0;
    const maxChecks = 5;
    const checkInterval = 1000; // 每次检查间隔1秒
    
    const checkAndStart = () => {
        checkCount++;
        console.log(`第${checkCount}次检查飞牛系统状态...`);
        
        // 检查所有路径是否都存在
        const allPathsExist = pathsToCheck.every(path => fs.existsSync(path));
        if (allPathsExist) {
            console.log('飞牛系统一切就绪，等待3秒后启动程序...');
            
            // 简单的3秒延迟
            setTimeout(() => {
                // 直接调用applyConfig函数
                try {// 调用handleApiRequest中定义的全局applyConfig函数
                    // 检查deskdata/pw.json的enabled字段
                    let shouldApplyConfig = true;
                    try {
                        const fnstylePath = path.join(fndata, 'pw.json');
                        if (fs.existsSync(fnstylePath)) {
                            const fnstyleContent = fs.readFileSync(fnstylePath, 'utf8');
                            const fnstyleData = JSON.parse(fnstyleContent);
                            // 只有当enabled字段明确为0时才不执行
                            if (fnstyleData.enabled === 0) {
                                shouldApplyConfig = false;
                               // console.log('检测到pw.json的enabled为0，跳过applyConfig执行');
                            }
                        }
                    } catch (e) {
                        // 文件读取或解析失败时仍执行applyConfig
                        console.log('读取pw.json失败，继续执行applyConfig');
                    }                         
                    if (shouldApplyConfig) {
                         applyConfig(); //#######################################################################################################################################
                    }
                    console.log('米恋泥 <飞牛桌面管理工具> 启动...');
                    // 启动服务器
                    startServer();
                } catch (error) {
                    console.error('执行立即生效API时出错:', error);
                    console.log('继续启动服务器...');
                    startServer();
                }
            }, 3000);
        } else if (checkCount >= maxChecks) {
            // 显示哪些文件或目录不存在
            const missingPaths = pathsToCheck.filter(path => !fs.existsSync(path));
            console.log(`经过${maxChecks}次检查，系统状态仍未就绪，以下关键文件/目录缺失：`);
            missingPaths.forEach(path => console.log(`  - ${path}`));
            console.log('等待重启程序！');
            process.exit(0);
        } else {
            // 显示当前缺失的文件或目录
            const missingPaths = pathsToCheck.filter(path => !fs.existsSync(path));
            if (missingPaths.length > 0) {
                console.log('以下关键文件/目录尚未就绪，等待下次检查...');
                missingPaths.forEach(path => console.log(`  - ${path}`));
            }
            setTimeout(checkAndStart, checkInterval);
        }
    };
    
    // 开始检查
    checkAndStart();
}

// 检查并下载默认图片
function ensureDefaultImages() {
    const fs = require('fs'), path = require('path'), https = require('https');
    
    // 确保目录存在
    const imgDir = path.join(fndata, 'img');
    if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
    
    // 下载图片函数
    const downloadImg = (url, filePath, name) => {
        if (!fs.existsSync(filePath)) {
            console.log(`下载默认${name}...`);
            const file = fs.createWriteStream(filePath);
            https.get(url, res => {
                res.pipe(file).on('finish', () => { file.close(); console.log(`默认${name}下载完成`); });
            }).on('error', err => { fs.unlink(filePath, () => {}); console.error(`下载${name}失败:`, err.message); });
        }
    }; 
    // 检查并下载默认图片
    downloadImg('https://help-static.fnnas.com/images/文件管理.png', path.join(imgDir, 'f.png'), '文件夹图标');
    downloadImg('https://help-static.fnnas.com/images/Margin-1.png', path.join(imgDir, 'i.png'), '图标图片');
}

// 导出模块供其他地方使用
module.exports = {
    startServer,
    readData,
    writeData,
    ensureDefaultImages
};

// 立即执行检查
ensureDefaultImages();
