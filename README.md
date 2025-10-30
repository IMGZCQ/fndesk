# <span style="color:#ff6b6b">fndesk</span> 飞牛桌面管理工具

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; margin: 20px 0;">
  <h2 style="margin-top: 0;">实在太强大！</h2>
  <p style="font-size: 18px; margin-bottom: 0;">让飞牛成为你的导航页，收藏夹，解决Docker应用没有图标，任意链接自动识别内外网</p>
</div>

## <span style="color:#4ecdc4">主要功能</span>

<ul style="list-style-type: none; padding-left: 0;">
  <li style="background-color: #f7fafc; padding: 10px; margin: 8px 0; border-left: 4px solid #4ecdc4; border-radius: 4px;">
    ✨ 实现图标，文件夹自由，彻底告别收藏夹
  </li>
  <li style="background-color: #f7fafc; padding: 10px; margin: 8px 0; border-left: 4px solid #4ecdc4; border-radius: 4px;">
    🌈智能识别内外网环境，更多自定义链接
  </li>
  <li style="background-color: #f7fafc; padding: 10px; margin: 8px 0; border-left: 4px solid #4ecdc4; border-radius: 4px;">
    🌐 飞牛桌面内文件夹自由拖动调整大小
  </li>
  <li style="background-color: #f7fafc; padding: 10px; margin: 8px 0; border-left: 4px solid #4ecdc4; border-radius: 4px;">
    🖼️ 自动获取目标连接图标or自定义
  </li>
  <li style="background-color: #f7fafc; padding: 10px; margin: 8px 0; border-left: 4px solid #4ecdc4; border-radius: 4px;">
    ⚙️ 多层文件夹，右键菜单，拓展更多功能
  </li>
</ul>

## <span style="color:#4ecdc4">注意说明</span>

<ul style="list-style-type: none; padding-left: 0;">
  <li style="background-color: #f7fafc; padding: 10px; margin: 8px 0; border-left: 4px solid #4ecdc4; border-radius: 4px;">
    有兴趣的灵魂请加入Q群组1039270739参与讨论
  </li>
  <li style="background-color: #f7fafc; padding: 10px; margin: 8px 0; border-left: 4px solid #4ecdc4; border-radius: 4px;">
    修改后若不生效请清空浏览器缓存或使用无痕模式浏览效果
  </li>
  <li style="background-color: #f7fafc; padding: 10px; margin: 8px 0; border-left: 4px solid #4ecdc4; border-radius: 4px;">
    所有数据都在compose文件所在目录的【deskdata】文件夹内，可移植或备份
  </li>
  <li style="background-color: #f7fafc; padding: 10px; margin: 8px 0; border-left: 4px solid #4ecdc4; border-radius: 4px;">
    若忘记登录密码请删除deskdata/pw.json文件重置密码
  </li>
</ul>

## <span style="color:#06d6a0">更新日志</span>
<div style="background-color: #f0fff4; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
  <h4 style="color: #16a34a; margin-top: 0;">2025.10.30 v0.55</h4>
  <ul>
    <li>✅ 优化右键菜单，空连接项将不显示</li>
    <li>✅ 其他细节和注释调整</li>
  </ul>
    <h4 style="color: #16a34a; margin-top: 0;">2025.10.29 v0.53</h4>
  <ul>
    <li>✅ 添加旧版数据合并功能</li>
  </ul>
  <h4 style="color: #16a34a;">2025.10.28 v0.52</h4>
  <ul>
    <li>✅ 公开发布版本！</li>
  </ul>
  <h4 style="color: #16a34a;">2025.10.26 v0.30</h4>
  <ul>
    <li>✅ 增加登录验证页</li>
  </ul>
  <h4 style="color: #16a34a;">2025.10.25 之前版本</h4>
  <ul>
    <li>✅ 对图标/文件夹的基本操作</li>
  </ul>
  
## <span style="color:#118ab2">使用方法</span>

<div style="background-color: #e6f7ff; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
  <h4 style="margin-top: 0;">新建Docker compose粘贴以下代码：</h4>
  
  <div style="background-color: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 8px; overflow-x: auto;">
    <pre><code>services:
  fndesk:
    container_name: fndesk
    image: imgzcq/fndesk:latest
    ports:
     - 9990:9990
    volumes:
     - /usr/trim/www:/fnw
     - ./deskdata:/deskdata
    restart: always</code></pre>
    跑码完成访问9990端口即可
  </div>
</div>

## <span style="color:#7209b7">效果展示</span>

**文件夹自由拖放，自由缩放，双击最大化**

<img src="https://github.com/user-attachments/assets/e6b4f731-51f2-412c-b5e7-a2e253ad3032" alt="fn-icon界面展示4" style="width: 480px; height: auto;">

**识别内外网连接，3个自定义连接，支持多层文件夹**

<img src="https://github.com/user-attachments/assets/b4d8395f-1f2e-493c-a214-ccafdbcdbdc1" alt="fn-icon界面展示4" style="width: 480px; height: auto;">

**管理工具界面**

<img width="1270" height="992" alt="ScreenShot_2025-10-30_111530_261" src="https://github.com/user-attachments/assets/f84ebfa8-e060-468c-9749-8feac117302b" />
<img width="979" height="1337" alt="PixPin_2025-10-29_19-47-18" src="https://github.com/user-attachments/assets/58554e7e-3cbb-4165-80d1-9cf3f4c2490e" />
<img width="979" height="1028" alt="PixPin_2025-10-29_19-48-18" src="https://github.com/user-attachments/assets/b0b2ba93-6e28-4ff8-8a80-937b01083759" />
<img width="979" height="842" alt="PixPin_2025-10-29_19-48-01" src="https://github.com/user-attachments/assets/bcf10e62-a8c3-4244-bb1e-34cecd40d11b" />











