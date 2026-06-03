function fndesk_log(e){}let macSonomaStyleActive=!1,win10StyleActive=!1,win11StyleActive=!1,win98StyleActive=!1,winXPStyleActive=!1,win7StyleActive=!1,THEME_STORAGE_KEY="fndesk_active_theme",currentTheme=localStorage.getItem(THEME_STORAGE_KEY)||"default";function svgToDataUri(e){return"data:image/svg+xml;base64,"+btoa(unescape(encodeURIComponent(e)))}function playThemeSound(e){try{var t=new Audio(e);t.volume=.5,t.play().catch(e=>console.log("Audio play error:",e))}catch(e){console.log("Theme sound error:",e)}}function resetAllStyles(){["macos-sonoma-style","win10-full-style","win11-style","win98-full-style","winxp-theme","win7-theme"].forEach(e=>{e=document.getElementById(e);e&&e.remove()});var e=document.querySelector(".start-button"),e=(e&&e.remove(),document.getElementById("fndesk-bg-layer"));e&&e.remove(),setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{"桌面"!==e.alt&&!e.dataset.src?.includes("desktop")||e.dataset.src===CONFIG.desktopIconSrc||(e.src=CONFIG.desktopIconSrc,e.dataset.src=CONFIG.desktopIconSrc)})},100),["win10-full-style-dark","win11-style-dark","win98-full-style-dark","macos-sonoma-style-dark","winxp-theme-dark","win7-theme-dark"].forEach(e=>{e=document.getElementById(e);e&&e.remove()}),macSonomaStyleActive=!1,win10StyleActive=!1,win11StyleActive=!1,win98StyleActive=!1,winXPStyleActive=!1,win7StyleActive=!1,currentTheme="default",removeTaskbarTimeDisplay()}function isDarkMode(){var e=window.matchMedia("(prefers-color-scheme: dark)").matches;return"20"===localStorage.getItem("fnos-theme-mode")||"30"===localStorage.getItem("fnos-theme-mode")&&e}function applyDarkModeStyle(e,t){var n=document.getElementById(e+"-dark");n&&n.remove(),isDarkMode()&&((n=document.createElement("style")).id=e+"-dark",n.textContent=t,document.head.appendChild(n))}function toggleMacSonomaStyle(){if(FndeskapplyStyleOverride(),macSonomaStyleActive){var e=document.getElementById("macos-sonoma-style"),e=(e&&e.remove(),document.getElementById("fndesk-bg-layer"));e&&e.remove(),setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{"桌面"!==e.alt&&!e.dataset.src?.includes("desktop")||e.dataset.src===CONFIG.desktopIconSrc||(e.src=CONFIG.desktopIconSrc,e.dataset.src=CONFIG.desktopIconSrc)})},100),macSonomaStyleActive=!1,currentTheme="default",localStorage.setItem(THEME_STORAGE_KEY,currentTheme),showToast("【Fndesk】macOS Sonoma样式：已关闭","success")}else{resetAllStyles(),moveTaskbarToBottom(),document.getElementById("macos-sonoma-style")?.remove();var n,e=document.createElement("style"),e=(e.id="macos-sonoma-style",e.innerHTML=`

    .trim-ui__app-layout--window{
        border-radius:14px !important;
        overflow:hidden !important;
        background:rgba(255,255,255,.75) !important;
        backdrop-filter: blur(24px) saturate(180%) !important;
        border:1px solid rgba(255,255,255,.25) !important;
        box-shadow: 0 20px 60px rgba(0,0,0,.20), 0 8px 20px rgba(0,0,0,.12) !important;
    }

    .trim-ui__app-layout--header{
        position:relative !important;
        height:44px !important;
        background: rgba(248,248,248,.72) !important;
        backdrop-filter: blur(24px) saturate(180%) !important;
        border-bottom: 1px solid rgba(0,0,0,.08) !important;
    }

    .trim-ui__app-layout--header-title{
        width:100% !important;
        padding:0 !important;
        margin:0 !important;
    }

    .trim-ui__app-layout--header-title > div{
        padding-left:60px !important;
        justify-content:flex-start !important;
    }

    .trim-ui__app-layout--header-title img{
        display:none !important;
    }

    .trim-ui__app-layout--header-title span{
        margin-left:12px;
        font-size:14px !important;
        font-weight:500 !important;
        color:#333 !important;
    }

    .trim-ui__app-layout--header > .flex.items-center{
        position:absolute !important;
        left:12px !important;
        top:50% !important;
        transform:translateY(-50%) !important;
        display:flex !important;
        gap:8px !important;
        z-index:999999 !important;
        flex-direction: row !important;
    }

    [id*="refresh"]{
        display:none !important;
    }

    [id*="newwindow"]{
        display:none !important;
    }

    .app-layout-header-close{
        background:#ff5f57 !important;
        order: 1 !important;
    }

    .app-layout-header-minimize{
        background:#febc2e !important;
        order: 2 !important;
    }

    .app-layout-header-maximize{
        background:#28c840 !important;
        order: 3 !important;
    }

    .app-layout-header-close,
    .app-layout-header-minimize,
    .app-layout-header-maximize{
        width:16px !important;
        height:16px !important;
        min-width:14px !important;
        min-height:14px !important;
        padding:0 !important;
        border-radius:50% !important;
        overflow:hidden !important;
    }

    .app-layout-header-close svg,
    .app-layout-header-minimize svg,
    .app-layout-header-maximize svg{
        display:none !important;
    }

    .app-layout-header-close:hover,
    .app-layout-header-minimize:hover,
    .app-layout-header-maximize:hover{
        filter:brightness(.92);
    }

    iframe{
        border:none !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\]{
        height:74px !important;
        inset:auto 0 10px 0 !important;
        background:transparent !important;
        display:flex !important;
        justify-content:center !important;
        pointer-events:none !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] > div{
        width:fit-content !important;
        margin:auto !important;
        pointer-events:auto !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md{
        border-radius:22px !important;
        background: rgba(255,255,255,.16) !important;
        backdrop-filter: blur(30px) saturate(180%) !important;
        border: 1px solid rgba(255,255,255,.20) !important;
        box-shadow: 0 10px 40px rgba(0,0,0,.18) !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"]{
        border-radius:12px !important;
        transition:none !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"]:hover{
        transform: none;
        background: rgba(255,255,255,.08) !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] img{
        width:28px !important;
        height:28px !important;
        border-radius:8px !important;
    }
    `,document.head.appendChild(e),document.querySelector(".fixed.inset-y-0.left-0.z-\\[1\\]"));e&&((n=document.createElement("div")).id="fndesk-bg-layer",n.style.cssText=`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('https://pic1.zhimg.com/5dd3658e9fc96a60d3a8a7a27b89e9a9_r.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                z-index: 0;
            `,e.parentNode?e.parentNode.insertBefore(n,e):document.body.insertBefore(n,document.body.firstChild)),applyDarkModeStyle("macos-sonoma-style",`
            .trim-ui__app-layout--window {
                background: rgba(30,30,30,0.85) !important;
                border: 1px solid rgba(255,255,255,0.15) !important;
                box-shadow: 0 20px 60px rgba(0,0,0,.40), 0 8px 20px rgba(0,0,0,.25) !important;
            }
            .trim-ui__app-layout--header {
                background: rgba(40,40,40,0.85) !important;
                border-bottom: 1px solid rgba(255,255,255,0.1) !important;
            }
            .trim-ui__app-layout--header-title span {
                color: #fff !important;
            }
            .trim-ui__app-layout--header svg {
                color: #fff !important;
            }
            .app-layout-header-close {
                background: #ff5f57 !important;
            }
            .app-layout-header-minimize {
                background: #febc2e !important;
            }
            .app-layout-header-maximize {
                background: #28c840 !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] img {
                filter: brightness(1.2);
            }
        `),macSonomaStyleActive=!0,currentTheme="mac",localStorage.setItem(THEME_STORAGE_KEY,currentTheme);let t=svgToDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 26 26"><path d="M0 0h26v26H0z" fill="none" /><path fill="#fff" d="M23.934 18.947c-.598 1.324-.884 1.916-1.652 3.086c-1.073 1.634-2.588 3.673-4.461 3.687c-1.666.014-2.096-1.087-4.357-1.069c-2.261.011-2.732 1.089-4.4 1.072c-1.873-.017-3.307-1.854-4.381-3.485c-3.003-4.575-3.32-9.937-1.464-12.79C4.532 7.425 6.61 6.237 8.561 6.237c1.987 0 3.236 1.092 4.879 1.092c1.594 0 2.565-1.095 4.863-1.095c1.738 0 3.576.947 4.889 2.581c-4.296 2.354-3.598 8.49.742 10.132M16.559 4.408c.836-1.073 1.47-2.587 1.24-4.131c-1.364.093-2.959.964-3.891 2.092c-.844 1.027-1.544 2.553-1.271 4.029c1.488.048 3.028-.839 3.922-1.99" /></svg>');setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{"桌面"!==e.alt&&!e.dataset.src?.includes("desktop")||(e.src=t)})},100),playThemeSound("/app/fndesk/static/mac.mp3"),showToast("【Fndesk】macOS Sonoma样式：已开启","success")}}function toggleWin10Style(){if(FndeskapplyStyleOverride(),win10StyleActive){var e=document.getElementById("win10-full-style"),e=(e&&e.remove(),document.getElementById("fndesk-bg-layer"));e&&e.remove(),setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{"桌面"!==e.alt&&!e.dataset.src?.includes("desktop")||e.dataset.src===CONFIG.desktopIconSrc||(e.src=CONFIG.desktopIconSrc,e.dataset.src=CONFIG.desktopIconSrc)})},100),win10StyleActive=!1,currentTheme="default",localStorage.setItem(THEME_STORAGE_KEY,currentTheme),removeTaskbarTimeDisplay(),showToast("【Fndesk】Win10样式：已关闭","success")}else if(resetAllStyles(),moveTaskbarToBottom(),!document.getElementById("win10-full-style")){var n,e=document.createElement("style"),e=(e.id="win10-full-style",e.innerHTML=`

    .trim-ui__app-layout--window,
    .fixed.inset-y-0.left-0.z-\\[1\\] {
        transition: none !important;
        animation: none !important;
        backdrop-filter: none !important;
    }

    .trim-ui__app-layout--window > *,
    .fixed.inset-y-0.left-0.z-\\[1\\] > * {
        transition: none !important;
        animation: none !important;
        backdrop-filter: none !important;
    }

    body {
        font-family: "Segoe UI", Tahoma, sans-serif !important;
    }

    .trim-ui__app-layout--window {
        border-radius: 6px !important;
        background: #f3f3f3 !important;
        border: 1px solid #c8c8c8 !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        overflow: hidden !important;
    }

    .trim-ui__app-layout--header {
        height: 38px !important;
        background: linear-gradient(to bottom, #0078d4, #005a9e) !important;
        border-bottom: 1px solid #ccc !important;
        cursor: move !important;
        user-select: none !important;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 6px;
    }

    .trim-ui__app-layout--header-title {
        padding-left: 6px !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        color: white !important;
    }

    .trim-ui__app-layout--header img {
        width: 16px !important;
        height: 16px !important;
        image-rendering: auto !important;
    }

    .trim-ui__app-layout--header > div:last-child > div {
        width: 28px !important;
        height: 28px !important;
        background: transparent !important;
        border-radius: 4px !important;
        border: none !important;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .trim-ui__app-layout--header > div:last-child > div:hover {
        background: rgba(255,255,255,0.2) !important;
    }

    .trim-ui__app-layout--header > div:last-child > div:active {
        background: rgba(0,0,0,0.2) !important;
    }

    .app-layout-header-close:hover {
        background: #e81123 !important;
    }

    .app-layout-header-close:hover svg {
        color: white !important;
    }

    .trim-ui__app-layout--header svg {
        width: 12px !important;
        height: 12px !important;
        color: white !important;
    }

    .trim-ui__app-layout--body-active {
        background: white !important;
        border: none !important;
    }

    iframe {
        border: none !important;
        background: white !important;
    }

    .resizable-handler {
        background: transparent !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] {
        height: 40px !important;
        inset: auto 0 0 0 !important;
        background: rgba(32,32,32,0.95) !important;
        border-top: 1px solid #555 !important;
        box-shadow: 0 -1px 3px rgba(0,0,0,0.3) inset;
        padding: 0 !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] > div {
        padding: 0 !important;
        height: 100% !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md {
        border-radius: 4px !important;
        background: rgba(32,32,32,0) !important;
        border: none !important;
        height: 100% !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .box-border.flex {
        height: 100% !important;
        padding: 0 6px !important;
        gap: 4px !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"],
    .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer {
        background: rgba(255,255,255,0.0) !important;
        border: none !important;
        border-radius: 4px !important;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"]:hover,
    .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer:hover {
        background: rgba(0, 120, 215, 0.3) !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] img {
        width: 24px !important;
        height: 24px !important;
        border-radius: 4px !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] svg {
        color: white !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] > div > div:last-child,
    .fixed.inset-y-0.left-0.z-\\[1\\] > div > div:last-child > div{
        background: transparent !important;
        height: 100% !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md:not(.flex-flex-col-items-center-border-0){
        background: transparent !important;
    }
    `,document.head.appendChild(e),applyDarkModeStyle("win10-full-style",`
            .trim-ui__app-layout--window {
                background: #2d2d2d !important;
                border: 1px solid #555 !important;
            }
            .trim-ui__app-layout--body-active {
                background: #1e1e1e !important;
            }
            iframe {
                background: #1e1e1e !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] {
                background: rgba(20,20,20,0.95) !important;
                border-top: 1px solid #444 !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"],
            .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer {
                background: rgba(255,255,255,0.0) !important;
                color: #fff !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"]:hover,
            .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer:hover {
                background: rgba(0, 120, 215, 0.4) !important;
            }
        `),document.querySelector(".fixed.inset-y-0.left-0.z-\\[1\\]"));e&&((n=document.createElement("div")).id="fndesk-bg-layer",n.style.cssText=`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('https://gss0.baidu.com/-4o3dSag_xI4khGko9WTAnF6hhy/zhidao/pic/item/3b87e950352ac65cbc27fe7afcf2b21193138a9d.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                z-index: 0;
            `,e.parentNode?e.parentNode.insertBefore(n,e):document.body.insertBefore(n,document.body.firstChild)),win10StyleActive=!0,currentTheme="win10",localStorage.setItem(THEME_STORAGE_KEY,currentTheme);let t=svgToDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 128 128"><path d="M0 0h128v128H0z" fill="none" /><path fill="#00adef" d="m126 1.637l-67 9.834v49.831l67-.534zM1.647 66.709l.003 42.404l50.791 6.983l-.04-49.057zm56.82.68l.094 49.465l67.376 9.509l.016-58.863zM1.61 19.297l.047 42.383l50.791-.289l-.023-49.016z" /></svg>');setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{"桌面"!==e.alt&&!e.dataset.src?.includes("desktop")||(e.src=t)})},100),setTimeout(()=>{addTaskbarTimeAndDate()},200),playThemeSound("/app/fndesk/static/win10.mp3"),showToast("【Fndesk】Win10样式：已开启","success")}}function toggleWin11Style(){if(FndeskapplyStyleOverride(),win11StyleActive){var e=document.getElementById("win11-style"),e=(e&&(e.remove(),e=document.querySelector(".start-button"))&&e.remove(),document.getElementById("fndesk-bg-layer"));e&&e.remove(),setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{"桌面"!==e.alt&&!e.dataset.src?.includes("desktop")||e.dataset.src===CONFIG.desktopIconSrc||(e.src=CONFIG.desktopIconSrc,e.dataset.src=CONFIG.desktopIconSrc)})},100),win11StyleActive=!1,currentTheme="default",localStorage.setItem(THEME_STORAGE_KEY,currentTheme),showToast("【Fndesk】Win11样式：已关闭","success")}else if(resetAllStyles(),moveTaskbarToBottom(),!document.getElementById("win11-style")){var n,e=document.createElement("style"),e=(e.id="win11-style",e.innerHTML=`

    .trim-ui__app-layout--window,
    .fixed.inset-y-0.left-0.z-\\[1\\] {
        transition: none !important;
        animation: none !important;
    }

    .trim-ui__app-layout--window > *,
    .fixed.inset-y-0.left-0.z-\\[1\\] > * {
        transition: none !important;
        animation: none !important;
    }
    body { font-family: "Segoe UI", Tahoma, sans-serif !important; }

    .trim-ui__app-layout--window {
        border-radius: 16px !important;
        background: #fdfdfd !important;
        border: 1px solid #ddd !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
        overflow: hidden !important;
    }

    .trim-ui__app-layout--header {
        height: 38px !important;
        background: rgba(255,255,255,0.9) !important;
        border-bottom: 1px solid #ccc !important;
        cursor: move !important;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 8px;
        backdrop-filter: blur(12px);
    }

    .trim-ui__app-layout--header-title {
        font-size: 14px !important;
        font-weight: 500 !important;
        color: #222 !important;
        padding-left: 8px !important;
    }

    .trim-ui__app-layout--header img { width: 16px !important; height: 16px !important; }

    .trim-ui__app-layout--header > div:last-child > div {
        width: 30px !important; height: 30px !important;
        background: transparent !important; border-radius: 6px !important;
        display: flex; align-items: center; justify-content: center;
    }

    .trim-ui__app-layout--header > div:last-child > div:hover {
        background: rgba(0,0,0,0.08) !important;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15) inset !important;
    }

    .app-layout-header-close:hover { background: #e81123 !important; }
    .app-layout-header-close:hover svg { color: white !important; }
    .trim-ui__app-layout--header svg { width:12px !important; height:12px !important; color:#222 !important; }

    .trim-ui__app-layout--body-active { background: #fff !important; border: none !important; }
    iframe { border: none !important; }

    .fixed.inset-y-0.left-0.z-\\[1\\] {
        height: 48px !important;
        inset: auto 0 0 0 !important;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 4px !important;
        border-radius: 0 !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] > div {
        display:flex !important;
        justify-content:center !important;
        align-items:center !important;
        gap:8px !important;
        height:100% !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md {
        border-radius: 14px !important;
        background: rgba(255,255,255,0.05) !important;
        height:100% !important;
        padding: 5px 6px !important;
        display: flex; align-items: center; justify-content: center;
        gap: 6px;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"],
    .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer {

        border: none !important; border-radius: 10px !important;
        display:flex; align-items:center; justify-content:center;
        position: relative;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"]:hover,
    .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer:hover {
        background: rgba(255,255,255,0.15) !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.25) inset !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] img { width:28px !important; height:28px !important; border-radius:6px !important; }
    .fixed.inset-y-0.left-0.z-\\[1\\] svg { color:white !important; }
    `,document.head.appendChild(e),applyDarkModeStyle("win11-style",`
            .trim-ui__app-layout--window {
                background: #202020 !important;
                border: 1px solid #444 !important;
            }
            .trim-ui__app-layout--header {
                background: rgba(32,32,32,0.95) !important;
                border-bottom: 1px solid #444 !important;
            }
            .trim-ui__app-layout--header-title {
                color: #fff !important;
            }
            .trim-ui__app-layout--header svg {
                color: #fff !important;
            }
            .trim-ui__app-layout--body-active {
                background: #1e1e1e !important;
            }
            iframe {
                background: #1e1e1e !important;
            }
/*             .fixed.inset-y-0.left-0.z-\\[1\\] {
                background: rgba(20,20,20,0.98) !important;
                border-top: 1px solid #333 !important;
            } */
            .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md {
                background: rgba(255,255,255,0.05) !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"],
            .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer {
                background: rgba(255,255,255,0.0) !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"]:hover,
            .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer:hover {
                background: rgba(255,255,255,0.15) !important;
            }

            .fixed.inset-y-0.left-0.z-\\[1\\] > div > div:last-child,
            .fixed.inset-y-0.left-0.z-\\[1\\] > div > div:last-child > div{
                background: transparent !important;
                height: 100% !important;
            }

            .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md:not(.flex-flex-col-items-center-border-0){
                background: transparent !important;
            }
        `),document.querySelector(".fixed.inset-y-0.left-0.z-\\[1\\]"));e&&((n=document.createElement("div")).id="fndesk-bg-layer",n.style.cssText=`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('https://club.fnnas.com/data/attachment/forum/202605/30/132707slvhj4i5qyfms34f.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                z-index: 0;
            `,e.parentNode?e.parentNode.insertBefore(n,e):document.body.insertBefore(n,document.body.firstChild)),win11StyleActive=!0,currentTheme="win11",localStorage.setItem(THEME_STORAGE_KEY,currentTheme);let t=svgToDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path d="M0 0h256v256H0z" fill="none" /><path fill="#0078d4" d="M0 0h121.329v121.329H0zm134.671 0H256v121.329H134.671zM0 134.671h121.329V256H0zm134.671 0H256V256H134.671z" /></svg>');setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{"桌面"!==e.alt&&!e.dataset.src?.includes("desktop")||(e.src=t)})},100),playThemeSound("/app/fndesk/static/win11.mp3"),showToast("【Fndesk】Win11样式：已开启","success")}}if(fndesk_log("[Fndesk] ========== 脚本开始加载 =========="),"undefined"!=typeof EventTarget){let o=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(e,t,n){"boolean"!=typeof n&&!n&&["touchstart","touchmove"].includes(e)&&(n={passive:!0}),o.call(this,e,t,n)}}let globalData=null,cachedContextMenuItems=null,intervalnasNameDisplay,firstLoggedUser=null,systemInfo={trimVersion:"",platform:""},hasOutputLog=!1,userInfoReadyResolve,userInfoReady=new Promise(e=>{userInfoReadyResolve=e});function moveTaskbarToBottom(){var e=document.querySelector(".fixed.inset-y-0.left-0.z-\\[1\\]"),t=document.querySelector(".desktop > div");if(e){var p=e.firstElementChild,c=p&&p.firstElementChild,m=c&&c.firstElementChild;if(p&&c&&m){var u=m.children[0],f=m.children[1],h=m.children[2],y=f&&f.querySelector(".scrollbar-hidden");e.style.top="auto",e.style.right="0",e.style.bottom="0",e.style.left="0",e.style.width="100%",e.style.height="60px",p.style.padding="8px 0px 8px",c.style.height="100%",c.style.borderRadius="14px",m.style.display="flex",m.style.flexDirection="row",m.style.alignItems="center",m.style.justifyContent="space-between",m.style.height="100%",m.style.padding="0px 12px",m.style.gap="12px",u&&(u.style.display="flex",u.style.flexDirection="row",u.style.alignItems="center",u.style.borderBottom="0",u.style.borderRight="1px solid rgba(255,255,255,0.20)",u.style.paddingBottom="0",u.style.paddingRight="12px",u.style.gap="0px",u.style.flexShrink="0"),f&&(f.style.flex="1",f.style.height="100%",f.style.minWidth="0"),y&&(y.style.position="static",y.style.display="flex",y.style.flexDirection="row",y.style.alignItems="center",y.style.justifyContent="flex-start",y.style.gap="0px",y.style.height="100%",y.style.overflowX="auto",y.style.overflowY="hidden",y.style.paddingTop="0"),h&&(h.style.display="flex",h.style.flexDirection="row",h.style.alignItems="center",h.style.justifyContent="flex-end",h.style.gap="0px",h.style.paddingTop="0",h.style.flexShrink="0"),e.querySelectorAll(".h-10.w-\\[47px\\]").forEach(e=>{e.style.width="47px",e.style.height="47px",e.style.flexShrink="0"}),t&&(t.style.paddingLeft="0",t.style.paddingBottom="32px");let n=".semi-tooltip-wrapper.semi-tooltip-wrapper-show.semi-tooltip-with-arrow",o=()=>document.querySelectorAll(n).forEach(e=>e.style.display="none"),i=(o(),new MutationObserver(e=>{let t=!1;e.forEach(e=>{"attributes"===e.type&&e.target.matches&&e.target.matches(n)&&(t=!0),"childList"===e.type&&e.addedNodes.forEach(e=>{1===e.nodeType&&(e.matches&&e.matches(n)&&(t=!0),"function"==typeof e.querySelectorAll)&&e.querySelectorAll(n).forEach(e=>t=!0)})}),t&&o()}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style"]}),"h-[calc(100vh-32px-env(safe-area-inset-bottom))]"),a="h-[calc(100vh-32px)]",r=(i,a,()=>{document.querySelectorAll('[class*="h-[calc(100vh-32px-env(safe-area-inset-bottom))]"], [class*="h-[calc(100vh-32px)]"]').forEach(e=>{var t=e.getAttribute("style")||"";t.includes("height:calc(100vh - 80px)")||t.includes("height: calc(100vh - 80px)")||(e.style.height="calc(100vh - 80px)",e.style.marginBottom="-30px")})}),s=(r(),new MutationObserver(e=>{let t=!1;e.forEach(e=>{"childList"===e.type&&e.addedNodes.forEach(e=>{1===e.nodeType&&(e.className&&"string"==typeof e.className&&(e.className.includes(i)||e.className.includes(a))&&(t=!0),"function"==typeof e.querySelectorAll)&&e.querySelectorAll(`[class*="${i}"], [class*="${a}"]`).forEach(e=>t=!0)})}),t&&r()}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class"]}),"!p-0 semi-popover-wrapper semi-popover-wrapper-show"),l=`[class*="${s}"]`,d=()=>{document.querySelectorAll(l).forEach(e=>{e.style.marginBottom="54px",e.style.marginRight="-20px"})};d(),new MutationObserver(e=>{let t=!1;e.forEach(e=>{"attributes"===e.type&&e.target.className&&"string"==typeof e.target.className&&e.target.className.includes(s)&&(t=!0),"childList"===e.type&&e.addedNodes.forEach(e=>{1===e.nodeType&&(e.className&&"string"==typeof e.className&&e.className.includes(s)&&(t=!0),"function"==typeof e.querySelectorAll)&&e.querySelectorAll(l).forEach(e=>t=!0)})}),t&&d()}).observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class"]})}}}function parseFirstUserName(e){let a=(e,t=0)=>{if(e&&"object"==typeof e&&!(6<t)){var n,o=(e=>{if(e&&"object"==typeof e)return(e=e.userInfo)&&"object"==typeof e&&"string"==typeof(e=e.user)&&e.trim()||null})(e);if(o)return o;for(n of Object.values(e))if(n&&"object"==typeof n){var i=a(n,t+1);if(i)return i}}return null};if("string"==typeof e){if(!e.includes('"userInfo"'))return null;try{e=JSON.parse(e)}catch(e){return null}}return e&&"object"==typeof e?a(e):null}function parseSystemInfo(t){try{let e,o=(e="string"==typeof t?JSON.parse(t):t,(e,t=0)=>{var n;if(e&&"object"==typeof e&&!(6<t)&&(e.trimVersion&&"string"==typeof e.trimVersion&&(systemInfo.trimVersion=e.trimVersion),e.platform&&"string"==typeof e.platform&&(systemInfo.platform=e.platform),!systemInfo.trimVersion||!systemInfo.platform))for(n of Object.values(e))if(n&&"object"==typeof n&&(o(n,t+1),systemInfo.trimVersion)&&systemInfo.platform)return});o(e)}catch(e){}}function logActiveUserNames(e){var t;hasOutputLog||((t=parseFirstUserName(e))&&(firstLoggedUser=t,userInfoReadyResolve)&&(fndesk_log("[Fndesk] logActiveUserNames: 用户信息已获取，通知等待者"),userInfoReadyResolve(),userInfoReadyResolve=null),parseSystemInfo(e),firstLoggedUser&&systemInfo.trimVersion&&systemInfo.platform&&(fndesk_log(`[实现应用] Fndesk | 飞牛用户: ${firstLoggedUser} | 飞牛版本: ${systemInfo.trimVersion} | 当前平台: `+systemInfo.platform),hasOutputLog=!0))}let optimizedUrls=new Map,pingCompleted=!1,currentZIndex=1e4;function resolveSharedWindowHelpers(){return"function"==typeof window.getFndeskSharedWindowHelpers&&window.getFndeskSharedWindowHelpers()||window.fndeskSharedWindowHelpers||{}}function hideWindowByStateManager(){var e=resolveSharedWindowHelpers().hideWindowByStateManager;if("function"==typeof e)return e.apply(null,arguments)}function showWindowByStateManager(){var e=resolveSharedWindowHelpers().showWindowByStateManager;if("function"==typeof e)return e.apply(null,arguments)}function saveWindowRect(){var e=resolveSharedWindowHelpers().saveWindowRect;if("function"==typeof e)return e.apply(null,arguments)}function closeWindowByStateManager(){var e=resolveSharedWindowHelpers().closeWindowByStateManager;if("function"==typeof e)return e.apply(null,arguments)}function toggleWindowByStateManager(){var e=resolveSharedWindowHelpers().toggleWindowByStateManager;if("function"==typeof e)return e.apply(null,arguments)}function toggleExistingWindowByMatcher(){var e=resolveSharedWindowHelpers().toggleExistingWindowByMatcher;return"function"==typeof e&&e.apply(null,arguments)}function processUrlField(e,t){if(!e||"string"!=typeof e)return e;e=e.trim();if(!e)return e;if(e.toLowerCase().startsWith("http"))return e;let n;var o=window.location.protocol;switch(t){case 1:n="http://";break;case 2:n="https://";break;default:n=o+"//"}var t=window.location.hostname,i=window.location.host;return/^\d/.test(e)?2<=(e.match(/\./g)||[]).length?""+n+e:""+n+t+":"+e:e.startsWith("/")?""+n+i+e:""+n+e}function buildContextMenuCache(){globalData&&Array.isArray(globalData)?fndesk_log("[Fndesk] buildContextMenuCache: 缓存构建完成，共",(cachedContextMenuItems=globalData.filter(e=>1==e.fn_contextmenu).map(o=>{let i=o.fndata_Title||"未命名",a=o.fndata_LanPic||"",t=o.fndata_Lan,r=o.fndata_Protocol??0;var e=1===o.fndata_Type;if(!a||a.startsWith("/deskdata")||a.startsWith("deskdata")&&(a="/"+a),e)return{title:i,icon:a,hasSubmenu:!1,submenuItems:[],mainOnClick:()=>{openFolderWindow(o,globalData)},onOpenInNewTab:null,isFolder:!0};let s=[];if(o.fndata_Wan&&o.fndata_Wan.trim()){let t=o.fndata_Wan.trim();s.push({text:"公网连接",icon:a,onClick:()=>{var e=processUrlField(t,r);openUrlInWindow(e,i+" - 公网连接",a,o.id)},onOpenInNewTab:()=>{var e=processUrlField(t,r);window.open(e,"_blank")}})}return[{url:o.fndata_URL1,name:o.URL_1_name,defaultName:"备用连接1"},{url:o.fndata_URL2,name:o.URL_2_name,defaultName:"备用连接2"},{url:o.fndata_URL3,name:o.URL_3_name,defaultName:"备用连接3"}].forEach(e=>{if(e.url&&e.url.trim()){let t=e.url.trim(),n=e.name&&e.name.trim()?e.name.trim():e.defaultName;s.push({text:n,icon:a,onClick:()=>{var e=processUrlField(t,r);openUrlInWindow(e,i+" - "+n,a,o.id)},onOpenInNewTab:()=>{var e=processUrlField(t,r);window.open(e,"_blank")}})}}),{title:i,icon:a,hasSubmenu:0<s.length,submenuItems:s,mainOnClick:()=>{var e;t&&t.trim()&&(e=processUrlField(t.trim(),r),openUrlInWindow(e,i,a,o.id))},onOpenInNewTab:()=>{var e;t&&t.trim()&&(e=processUrlField(t.trim(),r),window.open(e,"_blank"))}}})).length,"个菜单项"):cachedContextMenuItems=[]}function setupSpecificElementsZIndexManagement(){function setupElementEvents(e){e.hasAttribute("data-z-index-managed")||(e.setAttribute("data-z-index-managed","true"),e.addEventListener("mousedown",handleElementInteraction,!0),e.addEventListener("focus",handleElementInteraction))}function handleElementInteraction(e){var t;(parseInt(this.style.zIndex)||0)===currentZIndex&&0<currentZIndex||(this.id||(t="element_"+Date.now()+"_"+Math.floor(1e3*Math.random()),this.id=t),currentZIndex++,this.style.zIndex=currentZIndex,this.classList.contains("trim-ui__app-layout--window")&&setTimeout(()=>{var e=document.querySelectorAll(".trim-ui__app-layout--window");let n=null,o=-1;e.forEach(e=>{var t=parseInt(e.style.zIndex)||0;t>o&&(o=t,n=e)}),n&&(currentZIndex++,n.style.zIndex=currentZIndex)},10))}!function processExistingElements(){document.querySelectorAll('[id^="url-window"], [id^="folder-window"], .trim-ui__app-layout--window, [id^="mp3-window-"]').forEach(e=>{setupElementEvents(e),(e.classList.contains("trim-ui__app-layout--window")||e.id&&e.id.startsWith("mp3-window-"))&&handleElementInteraction.call(e)})}();var e=new MutationObserver(function(e){for(var t of e)if("childList"===t.type&&0<t.addedNodes.length)t.addedNodes.forEach(e=>{var t;1===e.nodeType&&(e.matches('[id^="url-window"], [id^="folder-window"], .trim-ui__app-layout--window, [id^="mp3-window-"]')&&(setupElementEvents(e),e.classList.contains("trim-ui__app-layout--window")||e.id&&(e.id.startsWith("mp3-window-")||e.id.startsWith("folder-window-")||e.id.startsWith("url-window-")))&&setTimeout(()=>{handleElementInteraction.call(e)},50),0<(t=e.querySelectorAll('[id^="url-window"], [id^="folder-window"], .trim-ui__app-layout--window, [id^="mp3-window-"]')).length)&&t.forEach(e=>{setupElementEvents(e),(e.classList.contains("trim-ui__app-layout--window")||e.id&&(e.id.startsWith("mp3-window-")||e.id.startsWith("folder-window-")||e.id.startsWith("url-window-")))&&setTimeout(()=>{handleElementInteraction.call(e)},50)})});else if("attributes"===t.type){let e=t.target;!(e.classList&&e.classList.contains("trim-ui__app-layout--window")||e.id&&(e.id.startsWith("folder-window-")||e.id.startsWith("url-window-")))||["style","display","class"].includes(t.attributeName)&&null!==e.offsetParent&&!e.hasAttribute("data-z-index-managed")&&(setupElementEvents(e),setTimeout(()=>{handleElementInteraction.call(e)},50))}}),t=document.querySelector(".desktop")||document.body;return e.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["style","display","class"],characterData:!1}),e}let iconSort=1,nasNameDisplay=1,openAPPInPage=1,fndeskMP3_ico="deskdata/img/i.png",fndeskMP3_name=" Fndesk MP3播放器",fndeskMP3_url="",fndeskClickSound=0,FndeskIconSort=0,FndeskIconAvoidance=0,Fndesk_taskbar=1,safeLogin="",safeLoginReadyResolve,FnUser="",Left_edge=65,Bottom_edge=0,safeLoginReady=new Promise(e=>{safeLoginReadyResolve=e}),fnStylePromise=(fndesk_log("[Fndesk] 开始加载 fnstyle.json"),fetch("deskdata/fnstyle.json?v="+(new Date).getTime()).then(e=>(fndesk_log("[Fndesk] fnstyle.json 加载成功"),e.json())).then(e=>(fndesk_log("[Fndesk] fnstyle.json 解析完成:",Object.keys(e)),e))),CONFIG=(fnStylePromise.then(e=>{if(iconSort=e.iconSort||1,nasNameDisplay=e.nasNameDisplay||1,fndeskMP3_ico=e.fndeskMP3_ico||"deskdata/img/i.png",fndeskMP3_name=e.fndeskMP3_name||" fndesk MP3播放器",fndeskMP3_url=e.fndeskMP3||"",fndeskClickSound=e.fndeskClickSound,FndeskIconSort=e.FndeskIconSort,FndeskIconAvoidance=e.FndeskIconAvoidance,Fndesk_taskbar=e.Fndesk_taskbar,safeLogin=e.safe_login||"",FnUser=e.FnUser||"",safeLoginReadyResolve&&safeLoginReadyResolve(),2===nasNameDisplay){clearInterval(intervalnasNameDisplay);let t=0;intervalnasNameDisplay=setInterval(()=>{t++;var e=document.querySelectorAll("p.select-none");0<e.length?(e.forEach(e=>{var t=document.createElement("br");e.parentNode.insertBefore(t,e),e.remove()}),clearInterval(intervalnasNameDisplay)):300<=t&&clearInterval(intervalnasNameDisplay)},100)}e.appTitle&&e.appTitle2&&"飞牛 fnOS"!==e.appTitle&&document.addEventListener("visibilitychange",function(){document.hidden?document.title=e.appTitle2:document.title=e.appTitle})}).catch(e=>{console.error("读取fnstyle.json失败:",e),safeLoginReadyResolve&&safeLoginReadyResolve()}),{desktopIconSrc:"/assets/desktop-Cid_qXcw.png",targetClass:"flex.h-9.shrink-0.flex-row.items-center.px-\\[3px\\].py-super-tight",visibilityClass:"place-content-start",storageKey:"elVisStatus",rootElement:document.querySelector("#root")||document.body});function handleElementVisibility(e){e&&e.preventDefault();var n,o=document.querySelectorAll(`[class*="${CONFIG.visibilityClass}"]`);if(o.length){let t="visible";e?(t="hidden"===o[0].style.visibility?"visible":"hidden",localStorage.setItem(CONFIG.storageKey,t)):(n=localStorage.getItem(CONFIG.storageKey),t=["visible","hidden"].includes(n)?n:"visible"),o.forEach(e=>e.style.visibility=t),e&&showToast("【Fndesk】桌面图标："+("hidden"===t?"已隐藏":"已显示"),"success")}}function toggleGlassEffect(){var e="--semi-color-app-container",t="fndesk_all_glass";"unset"===document.body.style.getPropertyValue(e)?(document.body.style.removeProperty(e),localStorage.setItem(t,"off"),showToast("【Fndesk】全窗毛玻璃：已关闭","success")):(document.body.style.setProperty(e,"unset","important"),localStorage.setItem(t,"on"),showToast("【Fndesk】全窗毛玻璃：已开启","success"))}function randomWallpaper(){var o=["https://t.alcy.cc/pc?t=","https://t.alcy.cc/ai?t=","https://t.alcy.cc/fj?t=","https://pivix.mwm.moe/pivix?t=","https://cdn.seovx.com/?mom=302&t=","https://cdn.seovx.com/d/?mom=302&t=","https://cdn.seovx.com/ha/?mom=302&t="],o=o[Math.floor(Math.random()*o.length)]+Date.now(),e=document.querySelector("#fndesk_wallpaper");if(e){var t=e.querySelector("img");t&&(t.src=o,e.style.opacity="1")}else{let n=document.querySelector(".fixed.inset-y-0.left-0.z-\\[1\\]");if(n){let e=document.createElement("div"),t=(e.id="fndesk_wallpaper",e.style.cssText=`
                position: absolute;
                inset: 0;
                z-index: 0;
                overflow: hidden;
                opacity: 0;
                transition: opacity 0.8s ease-out;
            `,document.createElement("img"));t.src=o,t.style.cssText=`
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            `,t.addEventListener("load",()=>{e.appendChild(t),n.before(e),setTimeout(()=>{e.style.opacity="1"},10),showToast("【Fndesk】随机壁纸：已设置","success")},{once:!0})}else showToast("【Fndesk】随机壁纸：未找到容器元素","error")}t=document.querySelector("#fndesk-bg-layer");t&&t.remove()}let wallpaperIntervalId=null,currentWallpaperInterval=0,WALLPAPER_INTERVAL_STORAGE_KEY="fndesk_wallpaper_interval";function setWallpaperAutoChange(t){if(wallpaperIntervalId&&(clearInterval(wallpaperIntervalId),wallpaperIntervalId=null),currentWallpaperInterval=t,localStorage.setItem(WALLPAPER_INTERVAL_STORAGE_KEY,t),0===t)showToast("【Fndesk】自动换壁纸：已关闭","success");else{wallpaperIntervalId=setInterval(()=>{randomWallpaper()},t);let e;showToast(`【Fndesk】自动换壁纸：每${e=t<6e4?t/1e3+"秒":t/6e4+"分钟"}更换`,"success")}}function initWallpaperAutoChange(){var e=parseInt(localStorage.getItem(WALLPAPER_INTERVAL_STORAGE_KEY))||0;0<e&&(currentWallpaperInterval=e,wallpaperIntervalId=setInterval(()=>{randomWallpaper()},e))}function toggleWin98Style(){var e,t;FndeskapplyStyleOverride(),win98StyleActive?((e=document.getElementById("win98-full-style"))&&e.remove(),(e=document.getElementById("fndesk-bg-layer"))&&e.remove(),setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{"桌面"!==e.alt&&!e.dataset.src?.includes("desktop")||e.dataset.src===CONFIG.desktopIconSrc||(e.src=CONFIG.desktopIconSrc,e.dataset.src=CONFIG.desktopIconSrc)})},100),win98StyleActive=!1,currentTheme="default",localStorage.setItem(THEME_STORAGE_KEY,currentTheme),removeTaskbarTimeDisplay(),showToast("【Fndesk】Win98样式：已关闭","success")):(resetAllStyles(),moveTaskbarToBottom(),document.getElementById("win98-full-style")?console.log("Win98 style already injected"):((e=document.createElement("style")).id="win98-full-style",e.innerHTML=`
    .trim-ui__app-layout--window,
    .fixed.inset-y-0.left-0.z-\\[1\\] {
        backdrop-filter: none !important;
        animation: none !important;
        transition: none !important;
    }

    .trim-ui__app-layout--window > *,
    .fixed.inset-y-0.left-0.z-\\[1\\] > * {
        backdrop-filter: none !important;
        animation: none !important;
        transition: none !important;
    }
    body {
        font-family: Tahoma, "MS Sans Serif", sans-serif !important;
    }
    .trim-ui__app-layout--window {
        border-radius: 0 !important;
        background: #c0c0c0 !important;
        border-top: 2px solid #ffffff !important;
        border-left: 2px solid #ffffff !important;
        border-right: 2px solid #000000 !important;
        border-bottom: 2px solid #000000 !important;
        box-shadow: inset -1px -1px #808080, inset 1px 1px #dfdfdf, 2px 2px 0 rgba(0,0,0,0.4) !important;
        overflow: hidden !important;
    }
    .trim-ui__app-layout--header {
        height: 36px !important;
        background: linear-gradient(to right, #000080 0%, #1084d0 100%) !important;
        border-bottom: 1px solid #000 !important;
        cursor: move !important;
        user-select: none !important;
    }
    .trim-ui__app-layout--header-title {
        padding-left: 10px !important;
    }
    .trim-ui__app-layout--header-title span {
        color: white !important;
        font-size: 13px !important;
        font-weight: bold !important;
        letter-spacing: 0 !important;
    }
    .trim-ui__app-layout--header img {
        width: 18px !important;
        height: 18px !important;
        image-rendering: pixelated !important;
    }
    .trim-ui__app-layout--header > div:last-child {
        padding-right: 2px !important;
    }
    .trim-ui__app-layout--header > div:last-child > div {
        width: 10px !important;
        height: 24px !important;
        margin-top: 5px !important;
        margin-left: 2px !important;
        background: #c0c0c0 !important;
        border-top: 1px solid #ffffff !important;
        border-left: 1px solid #ffffff !important;
        border-right: 1px solid #000000 !important;
        border-bottom: 1px solid #000000 !important;
        box-shadow: inset -1px -1px #808080, inset 1px 1px #dfdfdf !important;
        border-radius: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    }
    .trim-ui__app-layout--header > div:last-child > div:hover {
        background: #d4d0c8 !important;
    }
    .trim-ui__app-layout--header > div:last-child > div:active {
        border-top: 1px solid #000000 !important;
        border-left: 1px solid #000000 !important;
        border-right: 1px solid #ffffff !important;
        border-bottom: 1px solid #ffffff !important;
        box-shadow: inset 1px 1px #808080 !important;
    }
    .app-layout-header-close:hover {
        background: #ff0000 !important;
    }
    .app-layout-header-close:hover svg {
        color: white !important;
    }
    .trim-ui__app-layout--header svg {
        width: 12px !important;
        height: 12px !important;
        color: black !important;
    }
    .trim-ui__app-layout--body-active {
        background: #ffffff !important;
        border-top: 2px solid #808080 !important;
        border-left: 2px solid #808080 !important;
        border-right: 2px solid #ffffff !important;
        border-bottom: 2px solid #ffffff !important;
    }
    iframe {
        border: none !important;
        background: white !important;
    }
    .resizable-handler {
        background: transparent !important;
    }
    .fixed.inset-y-0.left-0.z-\\[1\\] {
        height: 40px !important;
        inset: auto 0 0 0 !important;
        background: #c0c0c0 !important;
        border-top: 2px solid #ffffff !important;
        box-shadow: inset 0 1px #dfdfdf !important;
        padding: 0 !important;
    }
    .fixed.inset-y-0.left-0.z-\\[1\\] > div {
        padding: 0 !important;
        height: 100% !important;
    }
    .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md {
        border-radius: 0 !important;
        background: #c0c0c0 !important;
        border: none !important;
        height: 100% !important;
    }
    .fixed.inset-y-0.left-0.z-\\[1\\] .box-border.flex {
        height: 100% !important;
        padding: 0 4px !important;
        gap: 2px !important;
    }
    .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"],
    .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer {
        border-top: 1px solid #808080 !important;
        border-left: 1px solid #808080 !important;
        border-right: 1px solid #ffffff !important;
        border-bottom: 1px solid #ffffff !important;
        background: #c0c0c0 !important;
        border-radius: 0 !important;
    }
    .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"]:hover,
    .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer:hover {
        background: #d4d0c8 !important;
    }
    .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"]:active,
    .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer:active {
        border-top: 1px solid #000000 !important;
        border-left: 1px solid #000000 !important;
        border-right: 1px solid #ffffff !important;
        border-bottom: 1px solid #ffffff !important;
        box-shadow: inset 1px 1px #808080 !important;
    }
    .fixed.inset-y-0.left-0.z-\\[1\\] img {
        width: 22px !important;
        height: 22px !important;
        image-rendering: pixelated !important;
        border-radius: 0 !important;
    }
    .fixed.inset-y-0.left-0.z-\\[1\\] svg {
        color: black !important;
        width: 22px !important;
        height: 22px !important;
    }
    .fixed.inset-y-0.left-0.z-\\[1\\] .h-10.w-\\[47px\\]:first-child {
        width: 72px !important;
        font-weight: bold !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] > div > div:last-child,
    .fixed.inset-y-0.left-0.z-\\[1\\] > div > div:last-child > div{
        background: transparent !important;
        height: 100% !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md:not(.flex-flex-col-items-center-border-0){
        background: transparent !important;
    }
    `,document.head.appendChild(e),applyDarkModeStyle("win98-full-style",`
            .trim-ui__app-layout--window {
                background: #2d2d2d !important;
            }
            .trim-ui__app-layout--header-title span {
                color: #fff !important;
            }
            .trim-ui__app-layout--body-active {
                background: #1e1e1e !important;
                border-top: 2px solid #555 !important;
                border-left: 2px solid #555 !important;
                border-right: 2px solid #111 !important;
                border-bottom: 2px solid #111 !important;
            }
            iframe {
                background: #1e1e1e !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] {
                background: #2d2d2d !important;
                border-top: 2px solid #444 !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md {
                background: #3d3d3d !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"],
            .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer {
                background: #404040 !important;
                color: #fff !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"]:hover,
            .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer:hover {
                background: #505050 !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] svg {
                color: white !important;
            }
        `),(e=document.querySelector(".fixed.inset-y-0.left-0.z-\\[1\\]"))&&((t=document.createElement("div")).id="fndesk-bg-layer",t.style.cssText=`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: #00807F;
                z-index: 0;
            `,e.parentNode?e.parentNode.insertBefore(t,e):document.body.insertBefore(t,document.body.firstChild)),win98StyleActive=!0,currentTheme="win98",localStorage.setItem(THEME_STORAGE_KEY,currentTheme),setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{("桌面"===e.alt||e.dataset.src?.includes("desktop"))&&(e.src="/app/fndesk/static/win98.png",e.dataset.src)&&(e.dataset.src="/app/fndesk/static/win98.png")})},100),setTimeout(()=>{addTaskbarTimeAndDate()},200),playThemeSound("/app/fndesk/static/win98.mp3"),showToast("【Fndesk】Win98样式：已开启","success")))}function toggleWinXPStyle(){var e;FndeskapplyStyleOverride(),winXPStyleActive?((e=document.getElementById("winxp-theme"))&&e.remove(),(e=document.getElementById("fndesk-bg-layer"))&&e.remove(),setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{"桌面"!==e.alt&&!e.dataset.src?.includes("desktop")||e.dataset.src===CONFIG.desktopIconSrc||(e.src=CONFIG.desktopIconSrc,e.dataset.src=CONFIG.desktopIconSrc)})},100),winXPStyleActive=!1,currentTheme="default",localStorage.setItem(THEME_STORAGE_KEY,currentTheme),removeTaskbarTimeDisplay(),showToast("【Fndesk】Windows XP样式：已关闭","success")):(resetAllStyles(),moveTaskbarToBottom(),document.getElementById("winxp-theme")?console.log("WinXP style already injected"):((e=document.createElement("style")).id="winxp-theme",e.innerHTML=`

    .trim-ui__app-layout--window,
    .fixed.inset-y-0.left-0.z-\\[1\\] {
        transition: none !important;
        animation: none !important;
        backdrop-filter: none !important;
    }

    .trim-ui__app-layout--window > *,
    .fixed.inset-y-0.left-0.z-\\[1\\] > * {
        transition: none !important;
        animation: none !important;
        backdrop-filter: none !important;
    }

    body{
        font-family: Tahoma, Verdana, Arial, sans-serif !important;
    }

    .trim-ui__app-layout--window{
        border-radius:7px !important;
        border:1px solid #0A246A !important;
        overflow:hidden !important;
        background:#ECE9D8 !important;
        box-shadow:3px 3px 12px rgba(0,0,0,.35) !important;
    }

    .trim-ui__app-layout--header{
        height:38px !important;
        background:linear-gradient(to bottom,#0A64D8,#3D95FF 45%,#1665D8) !important;
        border-bottom:1px solid #0A246A !important;
    }

    .trim-ui__app-layout--header-title{
        padding-left:8px !important;
    }

    .trim-ui__app-layout--header-title span{
        color:white !important;
        font-size:13px !important;
        font-weight:bold !important;
        text-shadow:1px 1px rgba(0,0,0,.25);
    }

    .trim-ui__app-layout--header-title img{
        width:18px !important;
        height:18px !important;
        margin-right:8px !important;
    }

    [id*="refresh"], [id*="newwindow"]{
        display:none !important;
    }

    .app-layout-header-minimize,
    .app-layout-header-maximize,
    .app-layout-header-close{
        width:26px !important;
        height:26px !important;
        min-width:26px !important;
        margin-left:2px !important;
        padding:0 !important;
        border-radius:3px !important;
        border:1px solid rgba(255,255,255,.35) !important;
        box-shadow:inset 0 1px rgba(255,255,255,.5);
        overflow:hidden !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    }

    .app-layout-header-close{
        margin-right: 5px !important;
    }

    .app-layout-header-minimize,
    .app-layout-header-maximize{
        background:linear-gradient(#73B0FF,#2D74E4) !important;
    }

    .app-layout-header-close{
        background:linear-gradient(#FF9C9C,#D63B3B) !important;
    }

    .app-layout-header-minimize:hover,
    .app-layout-header-maximize:hover,
    .app-layout-header-close:hover{
        filter:brightness(1.1);
    }

    .app-layout-header-minimize svg,
    .app-layout-header-maximize svg,
    .app-layout-header-close svg{
        color: white !important;
    }

    .trim-ui__app-layout--body-active{
        background:#ECE9D8 !important;
    }

    iframe{
        border:none !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\]{
        inset:auto 0 0 0 !important;
        height:40px !important;
        background:linear-gradient(to bottom,#3F8CF3,#245EDB) !important;
        border-top:1px solid #89B8FF !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md{
        border:none !important;
        border-radius:0 !important;
        background:transparent !important;
        backdrop-filter:none !important;
        box-shadow:none !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .box-border.flex{
        display:flex !important;
        flex-direction:row !important;
        align-items:center !important;
        justify-content:space-between !important;
        height:100% !important;
        padding:0 0px !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .flex.flex-col.items-center.border-0{
        height:34px !important;
        background:linear-gradient(#4FD84F,#1E9F22) !important;
        border-radius:0 10px 10px 8px !important;
        border:1px solid rgba(255,255,255,.3) !important;
        box-shadow:inset 1px 1px rgba(255,255,255,.4);
        padding:0 10px !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .relative.flex.flex-1.flex-col{
        flex:1 !important;
        min-width:0 !important;
        margin:0 8px !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\]
    .flex.flex-col.items-center.justify-between.gap-5.pt-2{
        display:flex !important;
        flex-direction:row !important;
        align-items:center !important;
        justify-content:center !important;
        gap:4px !important;
        height:36px !important;
        padding:0 8px !important;
        margin-left:8px !important;
        background:rgba(255,255,255,.12) !important;
        border-left:1px solid rgba(255,255,255,.25) !important;
        flex-shrink:0 !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\]
    .flex.flex-col.items-center.justify-between.gap-5.pt-2 > div{
        width:36px !important;
        height:36px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
        flex-shrink:0 !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\]
    .flex.flex-col.items-center.justify-between.gap-5.pt-2 > div > div,
    .fixed.inset-y-0.left-0.z-\\[1\\]
    .flex.flex-col.items-center.justify-between.gap-5.pt-2 > div > div > div{
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\]
    .flex.flex-col.items-center.justify-between.gap-5.pt-2 svg{
        width:20px !important;
        height:20px !important;
        display:block !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\]
    .flex.flex-col.items-center.justify-between.gap-5.pt-2 > div:hover{
        background:rgba(255,255,255,.15) !important;
        border-radius:3px !important;
    }
    `,document.head.appendChild(e),applyDarkModeStyle("winxp-theme",`
            .trim-ui__app-layout--window {
                background: #2d2d2d !important;
                border: 1px solid #0A246A !important;
            }
            .trim-ui__app-layout--header {
                background: linear-gradient(to bottom, #0a3285, #1a4fb8 45%, #0a3285) !important;
                border-bottom: 1px solid #0A246A !important;
            }
            .trim-ui__app-layout--header-title span {
                color: #fff !important;
            }
            .trim-ui__app-layout--body-active {
                background: #252525 !important;
            }
            iframe {
                background: #252525 !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] {
                background: linear-gradient(to bottom, #1a4fb8, #0a3285) !important;
                border-top: 1px solid #3a6fc4 !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md {
                background: rgba(255,255,255,0) !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"],
            .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer {
                background: rgba(255,255,255,0) !important;
                color: #fff !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"]:hover,
            .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer:hover {
                background: rgba(255,255,255,0.25) !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] svg {
                color: white !important;
            }
            body {
                color: #e0e0e0 !important;
            }
        `),setTimeout(()=>{var e=document.querySelector(".fixed.inset-y-0.left-0.z-\\[1\\]"),t=document.createElement("div");t.id="fndesk-bg-layer",t.style.cssText=`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('https://img.netbian.com/file/2016/0908/b28e1d1b24eabb2a42abc955758824d3.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                z-index: 0;
                pointer-events: none;
            `,e&&e.parentNode?e.parentNode.insertBefore(t,e):document.body.insertBefore(t,document.body.firstChild)},100),winXPStyleActive=!0,currentTheme="winxp",localStorage.setItem(THEME_STORAGE_KEY,currentTheme),setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{("桌面"===e.alt||e.dataset.src?.includes("desktop"))&&(e.src="/app/fndesk/static/winxp.png",e.dataset.src)&&(e.dataset.src="/app/fndesk/static/winxp.png")})},100),setTimeout(()=>{addTaskbarTimeAndDate()},200),playThemeSound("/app/fndesk/static/winxp.mp3"),showToast("【Fndesk】Windows XP样式：已开启","success")))}function toggleWin7Style(){var e;FndeskapplyStyleOverride(),win7StyleActive?((e=document.getElementById("win7-theme"))&&e.remove(),(e=document.getElementById("fndesk-bg-layer"))&&e.remove(),setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{"桌面"!==e.alt&&!e.dataset.src?.includes("desktop")||e.dataset.src===CONFIG.desktopIconSrc||(e.src=CONFIG.desktopIconSrc,e.dataset.src=CONFIG.desktopIconSrc)})},100),win7StyleActive=!1,currentTheme="default",localStorage.setItem(THEME_STORAGE_KEY,currentTheme),playThemeSound("/app/fndesk/static/intel.mp3"),showToast("【Fndesk】Windows 7 Aero样式：已关闭","success")):(resetAllStyles(),moveTaskbarToBottom(),document.getElementById("win7-theme")?console.log("Win7 style already injected"):((e=document.createElement("style")).id="win7-theme",e.innerHTML=`
    .trim-ui__app-layout--window,
    .fixed.inset-y-0.left-0.z-\\[1\\] {
        transition: none !important;
        animation: none !important;
    }

    .trim-ui__app-layout--window > *,
    .fixed.inset-y-0.left-0.z-\\[1\\] > * {
        transition: none !important;
        animation: none !important;
    }

    body{
        font-family: 'Segoe UI', Tahoma, Verdana, sans-serif !important;
    }

    .trim-ui__app-layout--window{
        border-radius: 8px !important;
        border: 1px solid rgba(255,255,255,0.35) !important;
        overflow: hidden !important;
        background: linear-gradient(180deg, 
            rgba(255,255,255,0.85) 0%, 
            rgba(240,245,255,0.9) 50%, 
            rgba(225,235,255,0.85) 100%) !important;
        backdrop-filter: blur(20px) saturate(150%) !important;
        box-shadow: 
            0 8px 32px rgba(0,0,60,0.25),
            inset 0 1px 0 rgba(255,255,255,0.6),
            inset 0 -1px 0 rgba(0,0,80,0.15) !important;
    }

    .trim-ui__app-layout--header{
        height: 39px !important;
        background: linear-gradient(180deg,
            rgba(220,235,255,0.95) 0%,
            rgba(180,210,250,0.9) 40%,
            rgba(140,185,240,0.85) 70%,
            rgba(120,170,230,0.9) 100%) !important;
        border-bottom: 1px solid rgba(80,130,200,0.3) !important;
        backdrop-filter: blur(15px) saturate(140%) !important;
    }

    .trim-ui__app-layout--header-title{
        padding-left: 10px !important;
    }

    .trim-ui__app-layout--header-title span{
        color: #1a3a6e !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        text-shadow: 0 1px 2px rgba(255,255,255,0.9) !important;
    }

    .trim-ui__app-layout--header-title img{
        width: 18px !important;
        height: 18px !important;
        margin-right: 8px !important;
    }

    [id*="refresh"], [id*="newwindow"]{
        display:none !important;
    }

    .app-layout-header-minimize,
    .app-layout-header-maximize,
    .app-layout-header-close{
        width: 28px !important;
        height: 28px !important;
        min-width: 28px !important;
        margin-left: 3px !important;
        margin-top: 2px !important;
        padding: 0 !important;
        border-radius: 50% !important;
        border: 1px solid rgba(255,255,255,0.5) !important;
        overflow: hidden !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow:
            0 2px 6px rgba(0,0,30,0.2),
            inset 0 1px 0 rgba(255,255,255,0.7),
            inset 0 -1px 0 rgba(0,0,50,0.15) !important;
        transition: all 0.15s ease !important;
    }

    .app-layout-header-close{
        margin-right: 5px !important;
    }

    .app-layout-header-minimize,
    .app-layout-header-maximize{
        background: radial-gradient(circle at 30% 30%, 
            rgba(200,225,255,0.95), 
            rgba(160,195,240,0.9)) !important;
    }

    .app-layout-header-close{
        background: radial-gradient(circle at 30% 30%, 
            rgba(255,180,175,0.95), 
            rgba(235,130,125,0.9)) !important;
    }

    .app-layout-header-minimize:hover,
    .app-layout-header-maximize:hover{
        background: radial-gradient(circle at 30% 30%, 
            rgba(230,245,255,0.98), 
            rgba(190,220,255,0.95)) !important;
        box-shadow: 
            0 3px 10px rgba(0,0,30,0.3),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(0,0,50,0.1) !important;
        transform: scale(1.05);
    }

    .app-layout-header-close:hover{
        background: radial-gradient(circle at 30% 30%, 
            rgba(255,120,115,0.98), 
            rgba(220,75,70,0.95)) !important;
        box-shadow: 
            0 3px 12px rgba(180,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(150,0,0,0.15) !important;
        transform: scale(1.05);
    }

    .trim-ui__app-layout--body-active{
        background: rgba(248,250,255,0.92) !important;
        backdrop-filter: blur(10px) !important;
    }

    iframe{
        border: none !important;
        background: transparent !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\]{
        inset:auto 0 0 0 !important;
        height: 44px !important;
        background: linear-gradient(180deg,
            rgba(180,205,245,0.92) 0%,
            rgba(140,180,235,0.88) 45%,
            rgba(110,160,225,0.90) 100%) !important;
        border-top: 1px solid rgba(200,220,255,0.6) !important;
        backdrop-filter: blur(18px) saturate(145%) !important;
        box-shadow: 
            0 -2px 20px rgba(0,0,50,0.15),
            inset 0 1px 0 rgba(255,255,255,0.4) !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md{
        border: none !important;
        border-radius: 4px !important;
        background: rgba(255,255,255,0.15) !important;
        backdrop-filter: blur(8px) !important;
        box-shadow: none !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .box-border.flex{
        display:flex !important;
        flex-direction:row !important;
        align-items:center !important;
        justify-content:space-between !important;
        height:100% !important;
        padding:0 6px !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .flex.flex-col.items-center.border-0{
        height:36px !important;
        background: linear-gradient(180deg,
            rgba(100,178,89,0.95) 0%,
            rgba(72,155,62,0.92) 50%,
            rgba(55,135,48,0.95) 100%) !important;
        border-radius: 12px !important;
        border: 1px solid rgba(255,255,255,0.35) !important;
        box-shadow: 
            inset 0 1px 0 rgba(255,255,255,0.5),
            0 2px 8px rgba(0,80,0,0.2) !important;
        padding:0 14px !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .flex.flex-col.items-center.border-0 span{
        color: white !important;
        font-weight:600 !important;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
        font-size:13px !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .relative.flex.flex-1.flex-col{
        display:flex !important;
        flex-direction:row !important;
        align-items:center !important;
        justify-content:flex-start !important;
        height:100% !important;
        gap:2px !important;
        padding:0 8px !important;
        overflow-x:auto !important;
        overflow-y:hidden !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\]
    .flex.flex-col.items-center.justify-between.gap-5.pt-2 > div > div,
    .fixed.inset-y-0.left-0.z-\\[1\\]
    .flex.flex-col.items-center.justify-between.gap-5.pt-2 > div > div > div{
        display:flex !important;
        align-items:center !important;
        justify-content:center !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\]
    .flex.flex-col.items-center.justify-between.gap-5.pt-2 svg{
        width:20px !important;
        height:20px !important;
        display:block !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\]
    .flex.flex-col.items-center.justify-between.gap-5.pt-2 > div:hover{
        background:rgba(255,255,255,.2) !important;
        border-radius:4px !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.3) !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] > div > div:last-child,
    .fixed.inset-y-0.left-0.z-\\[1\\] > div > div:last-child > div{
        background: transparent !important;
        height: 100% !important;
    }

    .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md:not(.flex-flex-col-items-center-border-0){
        background: transparent !important;
    }
    `,document.head.appendChild(e),applyDarkModeStyle("win7-theme",`
            .trim-ui__app-layout--window {
                background: linear-gradient(180deg, 
                    rgba(45,45,55,0.95) 0%, 
                    rgba(35,35,45,0.98) 50%, 
                    rgba(30,30,40,0.95) 100%) !important;
                border: 1px solid rgba(100,120,180,0.3) !important;
                box-shadow: 
                    0 8px 32px rgba(0,0,0,0.5),
                    inset 0 1px 0 rgba(255,255,255,0.08) !important;
            }
            .trim-ui__app-layout--header {
                background: linear-gradient(180deg,
                    rgba(50,55,70,0.98) 0%,
                    rgba(40,48,65,0.96) 40%,
                    rgba(35,42,60,0.98) 70%,
                    rgba(30,38,58,0.97) 100%) !important;
                border-bottom: 1px solid rgba(80,100,150,0.25) !important;
            }
            .trim-ui__app-layout--header-title span {
                color: #c8d4e8 !important;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
            }
            .trim-ui__app-layout--body-active {
                background: rgba(28,28,35,0.96) !important;
            }
            iframe {
                background: rgba(28,28,35,0.96) !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] {
                background: linear-gradient(180deg,
                    rgba(40,48,65,0.96) 0%,
                    rgba(35,42,60,0.94) 45%,
                    rgba(30,38,56,0.96) 100%) !important;
                border-top: 1px solid rgba(80,100,150,0.2) !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] .rounded-md {
                background: rgba(255,255,255,0.0) !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"],
            .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer {
                background: rgba(255,255,255,0) !important;
                color: #b8c8e0 !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] [tabindex="0"]:hover,
            .fixed.inset-y-0.left-0.z-\\[1\\] .cursor-pointer:hover {
                background: rgba(255,255,255,0.18) !important;
            }
            .fixed.inset-y-0.left-0.z-\\[1\\] svg {
                color: #b8c8e0 !important;
            }
            body {
                color: #d0dae8 !important;
            }
        `),setTimeout(()=>{var e=document.querySelector(".fixed.inset-y-0.left-0.z-\\[1\\]"),t=document.createElement("div");t.id="fndesk-bg-layer",t.style.cssText=`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('https://club.fnnas.com/data/attachment/forum/202606/01/044003niiguij84w4gi3qw.jpg');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                z-index: 0;
                pointer-events: none;
            `,e&&e.parentNode?e.parentNode.insertBefore(t,e):document.body.insertBefore(t,document.body.firstChild)},100),win7StyleActive=!0,currentTheme="win7",localStorage.setItem(THEME_STORAGE_KEY,currentTheme),setTimeout(()=>{document.querySelectorAll(".fixed.inset-y-0.left-0.z-\\[1\\] .semi-image-img").forEach(e=>{("桌面"===e.alt||e.dataset.src?.includes("desktop"))&&(e.src="/app/fndesk/static/win7.png",e.dataset.src)&&(e.dataset.src="/app/fndesk/static/win7.png")})},100),setTimeout(()=>{addTaskbarTimeAndDate()},200),playThemeSound("/app/fndesk/static/win7.mp3"),showToast("【Fndesk】Windows 7 Aero样式：已开启","success")))}function initContainerStyleObserver(){let t=new MutationObserver(function(e){e.forEach(function(e){e.addedNodes.forEach(function(e){1===e.nodeType&&(e.classList&&e.classList.contains("absolute")&&e.classList.contains("inset-0")&&e.classList.contains("z-10")&&e.classList.contains("flex")&&e.classList.contains("flex-col")&&e.classList.toString().includes("bg-[var(--semi-color-app-container)]")&&(e.style.setProperty("border-radius","12px"),e.style.setProperty("background-color","rgba(var(--semi-grey-1), 1)")),e.querySelectorAll)&&e.querySelectorAll('.absolute.inset-0.z-10.flex.flex-col[class*="bg-[var(--semi-color-app-container)]"]').forEach(function(e){e.style.setProperty("border-radius","12px"),e.style.setProperty("background-color","rgba(var(--semi-grey-1), 1)")})})})});!function observeContainer(){var e=document.querySelector(".relative.box-border.h-full.pl-\\[66px\\]");e?t.observe(e,{childList:!0,subtree:!0}):setTimeout(observeContainer,500)}()}function initGlassEffect(){var e="--semi-color-app-container",t=localStorage.getItem("fndesk_all_glass");"on"===t?document.body.style.setProperty(e,"unset","important"):"off"===t&&document.body.style.removeProperty(e)}function handleMinimizeAllWindows(e){if(!e||0===e.button){e=document.querySelectorAll('.desktop [id^="folder-window-"], .desktop [id^="url-window-"], .desktop [id^="mp3-window-"]');let t=[],o=[];if(e.forEach(function(e){e&&e.isConnected&&("none"===(e.style.display||window.getComputedStyle(e).display)?"1"===e.dataset.cqMinimizedByDesktopToggle&&o.push(e):t.push(e))}),t.length)t.forEach(function(e){var t=e.style.display||window.getComputedStyle(e).display,n=e.dataset.cqWindowId||e.id,o=(e.dataset.cqMinimizedByDesktopToggle="1",n&&e._taskbarIcon&&"function"==typeof hideWindowByStateManager);o?hideWindowByStateManager(n,e):(t&&"none"!==t&&(e.dataset.cqOriginalDisplay=t),e.style.transform="scale(0.8)",e.style.opacity="0",setTimeout(function(){e.isConnected&&(e.style.display="none",e.style.opacity="",e.style.transform="")},200))}),"function"==typeof window.updateTaskbarIconBorder&&window.updateTaskbarIconBorder(null);else{let n=null;o.forEach(function(e){var t=e.dataset.cqWindowId||e.id;t&&e._taskbarIcon&&"function"==typeof showWindowByStateManager?showWindowByStateManager(t,e):(e.style.display=e.dataset.cqOriginalDisplay||"flex",e.style.opacity="1",e.style.transform="scale(1)"),e.dataset.cqMinimizedByDesktopToggle="0",n=e}),void("function"==typeof window.updateTaskbarIconBorder&&window.updateTaskbarIconBorder(n))}}}let WINDOW_MS=1e4,COOLDOWN_MS=2592e5;function canShowTip(){var e=Date.now(),t=localStorage.getItem("lastTipShowTime");if(t){t=Number(t);if(!(e-t<WINDOW_MS)){if(e-t<COOLDOWN_MS)return!1;localStorage.setItem("lastTipShowTime",e)}}else localStorage.setItem("lastTipShowTime",e);return!0}function initDesktopIconControl(){fndesk_log("[Fndesk] initDesktopIconControl: 开始执行");let t=new MutationObserver(()=>{var e=document.querySelector(`img[data-src="${CONFIG.desktopIconSrc}"]`);e&&(fndesk_log("[Fndesk] initDesktopIconControl: 找到目标图片元素"),t.disconnect(),(e=e.closest("."+CONFIG.targetClass)||e.parentElement)&&(e.removeEventListener("contextmenu",handleElementVisibility),e.addEventListener("contextmenu",handleElementVisibility,{capture:!0}),e.removeEventListener("click",handleMinimizeAllWindows),e.addEventListener("click",handleMinimizeAllWindows,{capture:!0})),handleElementVisibility())});t.observe(CONFIG.rootElement,{childList:!0,subtree:!0}),window.addEventListener("beforeunload",()=>{t.disconnect();var e=document.querySelector(`img[data-src="${CONFIG.desktopIconSrc}"]`),e=e?.closest("."+CONFIG.targetClass)||e?.parentElement;e?.removeEventListener("contextmenu",handleElementVisibility,{capture:!0}),e?.removeEventListener("click",handleMinimizeAllWindows,{capture:!0})})}function safeInitDesktopIconControl(){fndesk_log("[Fndesk] safeInitDesktopIconControl: 检查DOM加载状态"),"loading"===document.readyState?(fndesk_log("[Fndesk] safeInitDesktopIconControl: DOM还在加载中，等待DOMContentLoaded"),document.addEventListener("DOMContentLoaded",initDesktopIconControl)):(fndesk_log("[Fndesk] safeInitDesktopIconControl: DOM已加载完成，立即执行"),initDesktopIconControl())}function showFolderContextMenu(e,t,n){e.preventDefault(),showCustomContextMenu(e,[{text:"打开文件夹",onClick:()=>{openFolderWindow(t,n)},customContent:e=>{e.innerHTML="";let t=document.createElement("div");t.style.position="absolute",t.style.left="0",t.style.top="0",t.style.bottom="0",t.style.width="3px",t.style.background="#4299e1",t.style.boxShadow="0 0 10px #4299e1",t.style.opacity="0",t.style.transition="opacity 0.2s ease",e.appendChild(t);var n=document.createElement("span");n.style.marginLeft="8px",n.textContent="打开文件夹",e.appendChild(n),e.addEventListener("mouseenter",function(){this.style.background="rgba(66, 153, 225, 0.2)",t.style.opacity="1",this.style.color="#ffffff"}),e.addEventListener("mouseleave",function(){this.style.background="transparent",t.style.opacity="0",this.style.color="#e0e0ff"})}}])}function sha256(e){function rightRotate(e,t){return e>>>t|e<<32-t}for(var t,n,o=Math.pow,i=o(2,32),a="length",r="",s=[],l=8*e[a],d=sha256.h=sha256.h||[],p=sha256.k=sha256.k||[],c=p[a],m={},u=2;c<64;u++)if(!m[u]){for(t=0;t<313;t+=u)m[t]=u;d[c]=o(u,.5)*i|0,p[c++]=o(u,1/3)*i|0}for(e+="";e[a]%64-56;)e+="\0";for(t=0;t<e[a];t++){if((n=e.charCodeAt(t))>>8)return;s[t>>2]|=n<<(3-t)%4*8}for(s[s[a]]=l/i|0,s[s[a]]=l,n=0;n<s[a];){var f=s.slice(n,n+=16),h=d;for(d=d.slice(0,8),t=0;t<64;t++){var y=f[t-15],g=f[t-2],b=d[0],x=d[4],x=d[7]+(rightRotate(x,6)^rightRotate(x,11)^rightRotate(x,25))+(x&d[5]^~x&d[6])+p[t]+(f[t]=t<16?f[t]:f[t-16]+(rightRotate(y,7)^rightRotate(y,18)^y>>>3)+f[t-7]+(rightRotate(g,17)^rightRotate(g,19)^g>>>10)|0);(d=[x+((rightRotate(b,2)^rightRotate(b,13)^rightRotate(b,22))+(b&d[1]^b&d[2]^d[1]&d[2]))|0].concat(d))[4]=d[4]+x|0}for(t=0;t<8;t++)d[t]=d[t]+h[t]|0}for(t=0;t<8;t++)for(n=3;n+1;n--){var w=d[t]>>8*n&255;r+=(w<16?0:"")+w.toString(16)}return r}function ping(a,r=2e3){Date.now();return new Promise(t=>{var e=new Image;let n=!(e.crossOrigin="anonymous"),o=setTimeout(()=>{n||(n=!0,t(!1))},r);e.onload=()=>{n||(n=!0,clearTimeout(o),t(!0))},e.onerror=()=>{n||(n=!0,clearTimeout(o),isInternalIp(a)?t(!0):t(!1))};try{var i=a.includes("?")?"&":"?";e.src=a+i+"ping="+Date.now()}catch(e){n||(n=!0,clearTimeout(o),t(!1))}})}function isInternalIp(e){try{var t=new URL(e).hostname;return"localhost"===t||"127.0.0.1"===t||"[::1]"===t?!0:/^(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|169\.254\.\d{1,3}\.\d{1,3})$/.test(t)}catch(e){return!1}}function showContextMenu(e,l){e.preventDefault();var t=["内网URL ","公网URL ","备用  1","备用  2","备用  3"];l.URL_1_name&&l.URL_1_name.trim()&&(t[2]=l.URL_1_name),l.URL_2_name&&l.URL_2_name.trim()&&(t[3]=l.URL_2_name),l.URL_3_name&&l.URL_3_name.trim()&&(t[4]=l.URL_3_name);let n=["fndata_Lan","fndata_Wan","fndata_URL1","fndata_URL2","fndata_URL3"],o=!1;for(let e=0;e<n.length;e++){var i=l[n[e]];if(i&&i.trim()){o=!0;break}}let a=[];o?t.forEach((r,e)=>{let s=l[n[e]];s&&s.trim()&&a.push({text:r,onClick:()=>{},customContent:e=>{Object.assign(e.style,{cursor:"default",justifyContent:"space-between"}),e.innerHTML="";let t=document.createElement("div");t.style.position="absolute",t.style.left="0",t.style.top="0",t.style.bottom="0",t.style.width="3px",t.style.background="#4299e1",t.style.boxShadow="0 0 10px #4299e1",t.style.opacity="0",t.style.transition="opacity 0.2s ease",e.appendChild(t);var n=document.createElement("span"),n=(n.style.marginLeft="5px",n.style.marginRight="5px",n.textContent=r,e.appendChild(n),document.createElement("div")),o=(n.style.display="flex",n.style.gap="8px",document.createElement("button")),i=(o.style.background="rgba(66, 153, 225, 0.3)",o.style.border="1px solid #4299e1",o.style.borderRadius="4px",o.style.color="#ffffff",o.style.fontSize="13px",o.style.padding="4px 6px",o.style.cursor="pointer",o.style.transition="all 0.2s ease",o.textContent="新窗",o.title="在新窗口打开链接",o.addEventListener("click",function(e){e.stopPropagation();e=processUrlField(s,l.fndata_Protocol??0),window.open(e,"_blank"),e=document.getElementById("tech-context-menu");e&&(e.style.display="none")}),document.createElement("button")),a=(i.style.background="rgba(66, 153, 225, 0.3)",i.style.border="1px solid #4299e1",i.style.borderRadius="4px",i.style.color="#ffffff",i.style.fontSize="13px",i.style.padding="4px 6px",i.style.cursor="pointer",i.style.transition="all 0.2s ease",i.textContent="页内",i.title="在本页面内打开链接",i.addEventListener("click",function(e){e.stopPropagation();let t="";l.fndata_LanPic&&"string"==typeof l.fndata_LanPic&&""!==l.fndata_LanPic.trim()?t=l.fndata_LanPic.trim():l["图片URL"]&&"string"==typeof l["图片URL"]&&""!==l["图片URL"].trim()&&(t=l["图片URL"].trim()),t&&t.startsWith("/deskdata")&&(t="/cgi/ThirdParty/fndesk/index.cgi"+t);e=processUrlField(s,l.fndata_Protocol??0),openUrlInWindow(e,l.fndata_Title+" - "+r,t,l.id),e=document.getElementById("tech-context-menu");e&&(e.style.display="none")}),e=>{e.addEventListener("mouseenter",function(){this.style.background="rgba(66, 153, 225, 0.5)",this.style.transform="scale(1.05)"}),e.addEventListener("mouseleave",function(){this.style.background="rgba(66, 153, 225, 0.3)",this.style.transform="scale(1)"})});a(o),a(i),n.appendChild(o),n.appendChild(i),e.appendChild(n),e.addEventListener("mouseenter",function(){this.style.background="rgba(66, 153, 225, 0.2)",t.style.opacity="1",this.style.color="#ffffff"}),e.addEventListener("mouseleave",function(){this.style.background="transparent",t.style.opacity="0",this.style.color="#e0e0ff"})}})}):a.push({text:"没有设置连接",style:{color:"#999999",cursor:"default",textAlign:"center"}}),showCustomContextMenu(e,a)}function findTargetElement(){var e=document.querySelectorAll(".box-border.flex.size-full.flex-col.flex-wrap.place-content-start.items-start.py-base-loose");return 0<e.length?e[e.length-1]:null}function processData(){fndesk_log("[Fndesk] processData: 开始执行"),fndesk_log("[Fndesk] processData: 步骤1 - 移除备案信息");var e=document.getElementById("LoginBeian");if(e&&e.remove(),fndesk_log("[Fndesk] processData: 步骤2 - 检查数据是否加载"),globalData){fndesk_log("[Fndesk] processData: 步骤3 - 用户权限检查已禁用"),fndesk_log("[Fndesk] processData: 步骤4 - 处理壁纸和系统图标显示"),fnStylePromise.then(o=>{if(o.desktopWallpaper&&"/static/bg/wallpaper-1.webp"!==o.desktopWallpaper){let n=document.querySelector(".fixed.inset-y-0.left-0.z-\\[1\\]");if(n){let e=document.createElement("div");e.id="fndesk_wallpaper",e.style.cssText=`
            position: absolute;
            inset: 0;
            z-index: 0;
            overflow: hidden;
            opacity: 0;
            transition: opacity 1.6s ease-out;
        `;let t;o.desktopWallpaper.endsWith(".mp4")?((t=document.createElement("video")).autoplay=!0,t.loop=!0,t.muted=!0,t.src=o.desktopWallpaper):(t=document.createElement("img")).src=o.desktopWallpaper,t.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;o="VIDEO"===t.tagName?"loadeddata":"load";t.addEventListener(o,()=>{e.appendChild(t),n.before(e),setTimeout(()=>{e.style.opacity="1"},10)},{once:!0})}}}).catch(e=>console.error("[Fndesk] processData: 读取fnstyle.json失败:",e)),fndesk_log("[Fndesk] processData: 步骤5 - 处理排序和筛选数据");var e=globalData.filter(e=>0===e.fndata_For).sort((e,t)=>1===iconSort?e.fndata_Sort-t.fndata_Sort:t.fndata_Sort-e.fndata_Sort),n=(fndesk_log("[Fndesk] processData: 筛选出",e.length,"个归属为桌面的记录"),fndesk_log("[Fndesk] processData: 步骤6 - 查找目标div元素"),findTargetElement());if(n){fndesk_log("[Fndesk] processData: 步骤7 - 创建图标元素");let p=document.createDocumentFragment(),t=void(e.forEach((n,e)=>{var t,o,i,a,r,s,l,d;0!==n.enable&&((t=document.createElement("div")).className="box-border flex h-[120px] w-[144px] cursor-default select-none flex-col items-center gap-[10px] rounded-xl pt-[22px]",t.setAttribute("data-desktop-item-id","entry:"+n.id),t.addEventListener("click",async function(){if(1===n.fndata_Type)openFolderWindow(n,globalData);else{let t=null;var e;if(optimizedUrls.has(n.id))t=optimizedUrls.get(n.id);else if(n.fndata_Wan&&n.fndata_Wan.trim()?t=processUrlField(n.fndata_Wan,n.fndata_Protocol??0):n.fndata_Lan&&n.fndata_Lan.trim()&&(t=processUrlField(n.fndata_Lan,n.fndata_Protocol??0)),!t)for(e of[processUrlField(n.fndata_URL1,n.fndata_Protocol??0),processUrlField(n.fndata_URL2,n.fndata_Protocol??0),processUrlField(n.fndata_URL3,n.fndata_Protocol??0)])if(e&&e.trim()){t=e;break}if(t)if(1===n.OpenInPage){let e="";n.fndata_LanPic&&"string"==typeof n.fndata_LanPic&&""!==n.fndata_LanPic.trim()?e=n.fndata_LanPic.trim():n["图片URL"]&&"string"==typeof n["图片URL"]&&""!==n["图片URL"].trim()&&(e=n["图片URL"].trim()),e&&e.startsWith("/deskdata")&&(e="/cgi/ThirdParty/fndesk/index.cgi"+e),openUrlInWindow(t,n.fndata_Title,e,n.id)}else window.open(t,"_blank")}}),t.addEventListener("contextmenu",function(e){1===n.fndata_Type?showFolderContextMenu(e,n,globalData):showContextMenu(e,n)}),(o=document.createElement("div")).className="inline-flex cursor-pointer flex-col items-center gap-[10px]",o.setAttribute("data-desktop-item-context-hotspot","true"),o.setAttribute("role","button"),o.tabIndex=0,o.setAttribute("aria-disabled","false"),o.setAttribute("aria-roledescription","sortable"),(i=document.createElement("div")).className="relative flex size-[52px] shrink-0 flex-row items-center justify-center transition-all duration-150",(a=document.createElement("div")).className="absolute inset-0 overflow-hidden",(r=document.createElement("div")).className="box-border size-[80px] p-[15%] !h-[52px] !w-[52px] !p-0",(d=document.createElement("div")).className="semi-image size-full",l=document.createElement("img"),(s=n.fndata_LanPic||n["图片URL"])&&s.startsWith("/deskdata"),l.src=s,l.dataSrc=s,l.alt=n.fndata_Title,l.className="semi-image-img w-full h-full !rounded-[10%]",l.style.userSelect="none",l.style.pointerEvents="none",d.appendChild(l),r.appendChild(d),a.appendChild(r),i.appendChild(a),(s=document.createElement("div")).className="flex min-h-base w-fit max-w-[128px] shrink-0 items-start justify-center",(l=document.createElement("div")).className="flex min-h-base w-fit max-w-[128px] items-start justify-center",(d=document.createElement("div")).className="line-clamp-2 max-w-[128px] break-words shrink-0 text-center align-top text-[14px] font-bold leading-[18px] text-white",d.textContent=n.fndata_Title,d.style.textShadow="rgba(0, 0, 0, 0.2) 0px 1px 6px, rgba(0, 0, 0, 0.5) 0px 0px 4px",l.appendChild(d),s.appendChild(l),o.appendChild(i),o.appendChild(s),t.appendChild(o),p.appendChild(t))}),fndesk_log("[Fndesk] processData: 步骤8 - 将图标元素添加到DOM"),n.appendChild(p),fndesk_log("[Fndesk] processData: 步骤9 - 启动延迟隐藏操作"),setTimeout(()=>{fndesk_log("[Fndesk] processData: 步骤9.1 - 处理根据fndata_Wan隐藏的文件夹图标");var e=globalData.filter(e=>1===e.fndata_Type&&0!==e.enable&&"string"==typeof e.fndata_Wan&&""!==e.fndata_Wan.trim()).flatMap(e=>e.fndata_Wan.split(/[,，]/).map(e=>e.trim()).filter(Boolean));if(0<e.length){let t=new Set(e);document.querySelectorAll(".line-clamp-2").forEach(e=>{t.has(e.title)&&(e=e.closest("[data-desktop-item-id]"))&&(e.style.display="none")})}fndesk_log("[Fndesk] processData: 步骤9.2 - 处理根据sysicoDisplay隐藏的图标"),fnStylePromise.then(e=>{e.sysicoDisplay&&e.sysicoDisplay.split(/[,，]/).map(e=>e.trim()).filter(e=>e).forEach(t=>{document.querySelectorAll(".line-clamp-2").forEach(e=>{e.title===t&&(e=e.closest("[data-desktop-item-id]"))&&(e.style.display="none")})})}).catch(e=>console.error("[Fndesk] processData: 读取fnstyle.json失败:",e))},100),fndesk_log("[Fndesk] processData: 步骤10 - 初始化图标功能"),FndeskIconSort,1===FndeskIconAvoidance&&(fndesk_log("[Fndesk] processData: 初始化图标躲避功能"),initIconAvoidance()),0!==Fndesk_taskbar&&(fndesk_log("[Fndesk] processData: 移动任务栏到底部"),moveTaskbarToBottom(),Left_edge=0,Bottom_edge=53),fndesk_log("[Fndesk] processData: 完成，成功添加了",e.length,"个归属为桌面的记录"));document.addEventListener("contextmenu",e=>{t=e.target},!0);new MutationObserver(e=>{for(var t of e)for(var n of t.addedNodes)if(1===n.nodeType&&(n.classList&&n.classList.contains("base-Popper-root")||n.querySelector&&n.querySelector(".base-Popper-root"))){let i=n.classList&&n.classList.contains("base-Popper-root")?n:n.querySelector(".base-Popper-root");i&&!i.dataset.fndeskMenuAdded&&setTimeout(()=>{if(i.style.zIndex="9999",Array.from(i.querySelectorAll("*")).some(e=>e.textContent&&e.textContent.includes("更换主题壁纸"))){i.dataset.fndeskMenuAdded="true";let t=i.querySelector(".ms-container")||i.querySelector(".relative.p-\\[10px\\]")?.firstElementChild;if(t){let m=(e,t,n,o,i=!1,a="",r=!1)=>{var s,l=document.createElement("div"),a=(l.className="my-super-tight flex items-center justify-between px-4 py-2 relative w-full text-[12px] box-border cursor-pointer whitespace-nowrap hover:bg-[var(--semi-color-fill-0)]",a&&(l.title=a),document.createElement("span")),d=(a.className="flex w-full max-w-[170px] overflow-hidden text-ellipsis",document.createElement("span")),p=(d.className="inline-flex w-full flex-1 items-center gap-2",n&&n.startsWith("<svg")?((p=document.createElement("span")).innerHTML=n,p.style.cssText="width:22px;height:22px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;",(s=p.querySelector("svg"))&&(s.style.cssText="width:100%;height:100%;"),d.appendChild(p)):n&&(n.startsWith("/")||n.startsWith("http://")||n.startsWith("https://"))?((s=document.createElement("img")).src=n,s.style.cssText="width:20px;height:20px;flex-shrink:0;",d.appendChild(s)):n?((p=document.createElement("span")).style.cssText="font-size:20px;flex-shrink:0;",p.textContent=n,d.appendChild(p)):((s=document.createElementNS("http://www.w3.org/2000/svg","svg")).setAttribute("xmlns","http://www.w3.org/2000/svg"),s.setAttribute("width","1em"),s.setAttribute("height","1em"),s.setAttribute("viewBox","0 0 24 24"),s.setAttribute("fill","currentColor"),s.setAttribute("class","flex items-center text-[20px]"),(n=document.createElementNS("http://www.w3.org/2000/svg","path")).setAttribute("fill-rule","evenodd"),n.setAttribute("clip-rule","evenodd"),n.setAttribute("d","M12 1c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm1-9h-2v2h2V6zm0 4h-2v6h2v-6z"),s.appendChild(n),d.appendChild(s)),document.createElement("span"));if(p.className="truncate text-[14px] leading-xs max-w-full",p.textContent=e,d.appendChild(p),a.appendChild(d),l.appendChild(a),o&&"function"==typeof o){let e=document.createElement("button");e.className="ml-2 px-1 py-1 rounded transition-all duration-200 flex-shrink-0 border-2 border-transparent flex items-center justify-center",e.style.cssText="background: transparent; color: var(--semi-color-text-0); opacity: 1;",e.title="在新标签页打开",e.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 20 20"><path d="M0 0h20v20H0z" fill="none" /><g fill="currentColor"><path d="M10.707 10.707a1 1 0 0 1-1.414-1.414l6-6a1 1 0 1 1 1.414 1.414z" /><path d="M15 15v-3.5a1 1 0 1 1 2 0V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4.5a1 1 0 0 1 0 2H5v10zm2-7a1 1 0 1 1-2 0V4a1 1 0 1 1 2 0z" /><path d="M12 5a1 1 0 1 1 0-2h4a1 1 0 1 1 0 2z" /></g></svg>',e.addEventListener("mouseenter",()=>{e.style.borderColor="var(--semi-color-border)"}),e.addEventListener("mouseleave",()=>{e.style.borderColor="transparent"}),e.addEventListener("click",e=>{e.stopPropagation(),o(),setTimeout(()=>{document.body.click()},0)}),l.appendChild(e)}else if(i){let e=document.createElement("div");e.className="ml-2 px-1 py-1 rounded transition-all duration-200 flex-shrink-0 border-2 border-transparent flex items-center justify-center",e.style.cssText="background: transparent; color: var(--semi-color-text-0); opacity: 1;",e.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44" /></svg>',e.addEventListener("mouseenter",()=>{e.style.borderColor="var(--semi-color-border)"}),e.addEventListener("mouseleave",()=>{e.style.borderColor="transparent"}),l.appendChild(e)}return l.addEventListener("click",e=>{e.stopPropagation(),t(),setTimeout(()=>{document.body.click()},0)}),r&&((n=document.createElement("span")).className="ml-2 text-[16px] flex-shrink-0",n.textContent="✔️",l.appendChild(n)),l},u=(e,t,n,o,i)=>{let r=document.createElement("div");r.className="my-super-tight flex items-center justify-between px-4 py-2 relative w-full text-[12px] box-border cursor-pointer whitespace-nowrap hover:bg-[var(--semi-color-fill-0)]";var a,s=document.createElement("span"),l=(s.className="flex w-full max-w-[170px] overflow-hidden text-ellipsis",document.createElement("span")),d=(l.className="inline-flex w-full flex-1 items-center gap-2",n&&(n.startsWith("/")||n.startsWith("http://")||n.startsWith("https://"))?((a=document.createElement("img")).src=n,a.style.cssText="width:20px;height:20px;flex-shrink:0;",l.appendChild(a)):n&&n.trim().startsWith("<svg")?((a=document.createElement("span")).style.cssText="width:20px;height:20px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;",a.innerHTML=n,(d=a.querySelector("svg"))&&(d.style.cssText="width:100%;height:100%;"),l.appendChild(a)):n?((d=document.createElement("span")).style.cssText="font-size:20px;flex-shrink:0;",d.textContent=n,l.appendChild(d)):((a=document.createElementNS("http://www.w3.org/2000/svg","svg")).setAttribute("xmlns","http://www.w3.org/2000/svg"),a.setAttribute("width","1em"),a.setAttribute("height","1em"),a.setAttribute("viewBox","0 0 24 24"),a.setAttribute("fill","currentColor"),a.setAttribute("class","flex items-center text-[20px]"),(n=document.createElementNS("http://www.w3.org/2000/svg","path")).setAttribute("fill-rule","evenodd"),n.setAttribute("clip-rule","evenodd"),n.setAttribute("d","M12 1c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm1-9h-2v2h2V6zm0 4h-2v6h2v-6z"),a.appendChild(n),l.appendChild(a)),document.createElement("span"));if(d.className="truncate text-[14px] leading-xs max-w-full",d.textContent=e,l.appendChild(d),s.appendChild(l),r.appendChild(s),i&&"function"==typeof i){let e=document.createElement("button");e.className="ml-2 px-1 py-1 rounded transition-all duration-200 flex-shrink-0 border-2 border-transparent flex items-center justify-center",e.style.cssText="background: transparent; color: var(--semi-color-text-0); opacity: 1;",e.title="在新标签页打开",e.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 20 20"><path d="M0 0h20v20H0z" fill="none" /><g fill="currentColor"><path d="M10.707 10.707a1 1 0 0 1-1.414-1.414l6-6a1 1 0 1 1 1.414 1.414z" /><path d="M15 15v-3.5a1 1 0 1 1 2 0V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4.5a1 1 0 0 1 0 2H5v10zm2-7a1 1 0 1 1-2 0V4a1 1 0 1 1 2 0z" /><path d="M12 5a1 1 0 1 1 0-2h4a1 1 0 1 1 0 2z" /></g></svg>',e.addEventListener("mouseenter",()=>{e.style.borderColor="var(--semi-color-border)"}),e.addEventListener("mouseleave",()=>{e.style.borderColor="transparent"}),e.addEventListener("click",e=>{e.stopPropagation(),i(),setTimeout(()=>{document.body.click()},0)}),r.appendChild(e)}let p=document.createElement("div"),c=void(p.className="absolute bg-[var(--semi-color-bg-1)] border border-[var(--semi-color-border)] rounded shadow-lg min-w-[160px] z-50 hidden",p.style.cssText="box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: rgba(var(--semi-grey-1),.8); backdrop-filter: blur(30px);",o.forEach(e=>{let t;t=e.submenu&&0<e.submenu.length?u(e.text,e.onClick,e.icon,e.submenu,e.onOpenInNewTab):m(e.text,e.onClick,e.icon,e.onOpenInNewTab,!1,e.tooltip||"",e.checkMark||!1),p.appendChild(t)}),r.appendChild(p));return r.addEventListener("mouseenter",()=>{clearTimeout(c),p.classList.remove("hidden"),(()=>{var e=r.getBoundingClientRect(),t=p.getBoundingClientRect(),n=window.innerWidth,o=window.innerHeight;let i=e.width+2,a=0;e.right+t.width>n&&(i=-t.width-2),e.top+t.height>o&&(a=o-e.top-t.height),p.style.left=i+"px",p.style.top=a+"px"})()}),r.addEventListener("mouseleave",()=>{c=setTimeout(()=>{p.classList.add("hidden")},150)}),r.addEventListener("click",e=>{e.stopPropagation(),t(),setTimeout(()=>{document.body.click()},0)}),r};var e="/app-center-static/serviceicon/fndesk/ui/images/icon_{0}.png?size=256",n=[],o=[];void 0!==fndeskMP3_url&&""!==fndeskMP3_url&&o.push({text:"打开 播放器",icon:"https://pp.myapp.com/ma_icon/0/icon_12253049_1776309671/256",onClick:()=>{var e=window.location.href.replace(/\/+$/,"");openUrlInWindow(e+"/MP3go/player.html",fndeskMP3_name,"app-center-static/serviceicon/fndesk/ui/images/icon_%7B0%7D.png?size=256","fndesk")},onOpenInNewTab:()=>{var e=window.location.href.replace(/\/+$/,"");openUrlInWindow(e+"/MP3go/player.html",fndeskMP3_name,"app-center-static/serviceicon/fndesk/ui/images/icon_%7B0%7D.png?size=256","fndesk",!0)}}),o.push({text:"隐/显 桌面图标",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><g fill="none"><path fill="#66e1ff" d="M23 15.348V2.913a.956.956 0 0 0-.957-.956H1.957A.957.957 0 0 0 1 2.913v12.435z" /><path fill="#c2f3ff" d="M20.13 1.957H1.957A.957.957 0 0 0 1 2.913v12.435h5.74z" /><path fill="#fff" d="M1 15.348v1.913a.957.957 0 0 0 .957.956h20.087a.957.957 0 0 0 .956-.956v-1.913z" /><path fill="#b2b2b2" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M14.87 22.043a6.68 6.68 0 0 1-1.435-3.826h-2.87a6.68 6.68 0 0 1-1.435 3.826z" /><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M7.694 22.044h8.609M1 15.348h22m-.956-13.391H1.957A.957.957 0 0 0 1 2.913v14.348c0 .528.428.956.957.956h20.087a.957.957 0 0 0 .956-.956V2.913a.956.956 0 0 0-.956-.956M9.608 6.74v1.912M14.39 6.74v1.912" /><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M15.826 11.044a5.82 5.82 0 0 1-7.652 0" /></g></svg>',onClick:()=>{handleElementVisibility(new Event("click"))},tooltip:"右键点击飞牛任务栏的 桌面 图标也可同样效果"}),o.push({text:"全窗毛玻璃",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><g fill="none"><path fill="#66e1ff" d="M23 10.565v8.609a1.913 1.913 0 0 1-1.913 1.913H5.783a1.913 1.913 0 0 1-1.913-1.913v-8.609z" /><path fill="#c2f3ff" d="M18.696 10.565H3.87v8.609a1.913 1.913 0 0 0 1.913 1.913h2.391z" /><path fill="#fff" d="M23 10.565H3.87V8.652A1.913 1.913 0 0 1 5.783 6.74h15.304A1.913 1.913 0 0 1 23 8.652z" /><path fill="#66e1ff" d="M20.13 6.74v8.608a1.913 1.913 0 0 1-1.913 1.913H2.913A1.914 1.914 0 0 1 1 15.348V6.739z" /><path fill="#c2f3ff" d="M15.826 6.74H1v8.608a1.913 1.913 0 0 0 1.913 1.913h2.391z" /><path fill="#fff" d="M20.13 6.74H1V4.825a1.913 1.913 0 0 1 1.913-1.913h15.304a1.913 1.913 0 0 1 1.913 1.913z" /><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M1 6.743h19.13m-1.913-3.826H2.913A1.913 1.913 0 0 0 1 4.83v10.522a1.913 1.913 0 0 0 1.913 1.913h15.304a1.914 1.914 0 0 0 1.913-1.913V4.83a1.913 1.913 0 0 0-1.913-1.913m1.913 7.652H23" stroke-width="0.5" /><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M20.13 6.74h.957A1.913 1.913 0 0 1 23 8.651v10.522a1.913 1.913 0 0 1-1.913 1.913H5.783a1.913 1.913 0 0 1-1.913-1.913V17.26" stroke-width="0.5" /><path stroke="#191919" d="M5.783 5.069a.24.24 0 1 1 0-.478" stroke-width="0.5" /><path stroke="#191919" d="M5.782 5.069a.24.24 0 1 0 0-.478m1.914.478a.24.24 0 1 1 0-.478" stroke-width="0.5" /><path stroke="#191919" d="M7.695 5.069a.24.24 0 1 0 0-.478m-3.826.474a.24.24 0 0 1 0-.478m.001.478a.24.24 0 0 0 0-.478" stroke-width="0.5" /></g></svg>',onClick:()=>{toggleGlassEffect()},tooltip:"模糊度可在Fndesk后台个性化页面调整"}),o.push({text:"随机壁纸 即刻",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><g fill="none"><path fill="#66e1ff" d="M23 2.913v16.5a4.548 4.548 0 0 0-7.509-2.4A8.368 8.368 0 0 0 1 19.795V2.913A1.92 1.92 0 0 1 2.913 1h18.174A1.92 1.92 0 0 1 23 2.913" /><path fill="#c2f3ff" d="M21.087 1H2.913A1.92 1.92 0 0 0 1 2.913v16.883a8.38 8.38 0 0 1 7.689-5.87L21.55 1.063A2 2 0 0 0 21.087 1" /><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M23 2.913v16.5a4.548 4.548 0 0 0-7.509-2.4A8.368 8.368 0 0 0 1 19.795V2.913A1.92 1.92 0 0 1 2.913 1h18.174A1.92 1.92 0 0 1 23 2.913" /><path fill="#ffef5e" d="M16.304 10.087a2.391 2.391 0 1 0 0-4.783a2.391 2.391 0 0 0 0 4.783" /><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M16.304 3.391v-.478M13.26 4.652l-.339-.339M12 7.696h-.479m1.739 3.044l-.339.338m3.383.922v.478m3.044-1.738l.338.338m.922-3.382h.479m-1.739-3.044l.338-.339" /><path fill="#78eb7b" d="M23 19.413v1.674A1.92 1.92 0 0 1 21.087 23H2.913A1.92 1.92 0 0 1 1 21.087v-1.291a8.367 8.367 0 0 1 14.491-2.784A4.548 4.548 0 0 1 23 19.413" /><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M23 19.413v1.674A1.92 1.92 0 0 1 21.087 23H2.913A1.92 1.92 0 0 1 1 21.087v-1.291a8.367 8.367 0 0 1 14.491-2.784A4.548 4.548 0 0 1 23 19.413" /><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M16.792 19.25a8 8 0 0 0-1.301-2.238m.813-6.925a2.391 2.391 0 1 0 0-4.783a2.391 2.391 0 0 0 0 4.783" /></g></svg>',onClick:()=>{randomWallpaper()},submenu:[{text:"不自动换",icon:"🚫",checkMark:0===currentWallpaperInterval,onClick:()=>setWallpaperAutoChange(0)},{text:"30秒",icon:"⏱️",checkMark:3e4===currentWallpaperInterval,onClick:()=>setWallpaperAutoChange(3e4)},{text:"1分钟",icon:"⏱️",checkMark:6e4===currentWallpaperInterval,onClick:()=>setWallpaperAutoChange(6e4)},{text:"2分钟",icon:"⏱️",checkMark:12e4===currentWallpaperInterval,onClick:()=>setWallpaperAutoChange(12e4)},{text:"3分钟",icon:"⏱️",checkMark:18e4===currentWallpaperInterval,onClick:()=>setWallpaperAutoChange(18e4)},{text:"5分钟",icon:"⏱️",checkMark:3e5===currentWallpaperInterval,onClick:()=>setWallpaperAutoChange(3e5)},{text:"10分钟",icon:"⏱️",checkMark:6e5===currentWallpaperInterval,onClick:()=>setWallpaperAutoChange(6e5)}]}),o.push({text:"主题实验室",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 64 64"><path d="M0 0h64v64H0z" fill="none" /><path fill="#f6c799" d="M49.6 23.6C58.4 8.5 40.3-1.3 17.3 9.2C3.2 15.7-6.6 35.7 13 52.9c13.9 12.2 49 5.3 49-8.7c0-15.5-21.7-4.8-12.4-20.6m4.9 24.6c-2.8 2.4-7.2 2.4-10 0s-2.8-4.5 0-6.9s7.2-2.4 10 0s2.7 4.5 0 6.9"/><path fill="#2caece" d="M33.2 45.1c-3.1-2.4-8-2.4-11.1 0s-3.1 6.2 0 8.6s8 2.4 11.1 0c3-2.4 3-6.3 0-8.6"/><path fill="#fdf516" d="M19.6 33.6c-3.4-1.6-8-.6-10.4 2.3S7.6 42.4 11 44s8 .6 10.4-2.3s1.6-6.5-1.8-8.1"/><path fill="#f55" d="M17 20.6c-2.9-1.6-7.2-.9-9.4 1.6c-2.3 2.5-1.7 5.8 1.2 7.3c2.9 1.6 7.2.9 9.4-1.6s1.7-5.7-1.2-7.3"/><path fill="#83bf4f" d="M28.4 10.8c-2.8-1.6-6.9-1-9.1 1.4s-1.8 5.5 1.1 7.1c2.8 1.6 6.9 1 9.1-1.4s1.7-5.6-1.1-7.1"/><path fill="#9156b7" d="M44.7 9.7c-2.2-1.8-5.9-2.2-8.5-1c-2.5 1.2-2.8 3.7-.6 5.5s5.9 2.2 8.5 1c2.5-1.3 2.7-3.7.6-5.5"/><path fill="#947151" d="M40 42.1c-1.9 2.1-11.5 4-11.5 4s3.8-3.5 5.5-9.2c.8-2.7 4.7-2.7 6.4-1.2c1.7 1.4 1.5 4.3-.4 6.4"/><path fill="#666" d="M58.7 12.3c1-.1 2.9 1.6 3 2.5C62 19.1 44 34.5 44 34.5L41 32s13.3-19.4 17.7-19.7"/><path fill="#ccc" d="m38.4 34.9l3 2.5l2.6-2.9l-3-2.5z"/></svg>',onClick:()=>{},tooltip:"实验功能,仅供娱乐,刷新失效",submenu:[{text:"系统默认",icon:"https://help-static.fnnas.com/images/Margin-1.png",checkMark:"default"===currentTheme,onClick:()=>{resetAllStyles(),currentTheme="default",localStorage.setItem(THEME_STORAGE_KEY,currentTheme),showToast("【Fndesk】已恢复系统默认样式","success"),playThemeSound("/app/fndesk/static/intel.mp3")},tooltip:"还原为飞牛系统原始样式"},{text:"变成Win98",icon:"/app/fndesk/static/win98.png",checkMark:"win98"===currentTheme,onClick:()=>toggleWin98Style(),tooltip:"实验功能,仅供娱乐,刷新失效"},{text:"变成MAC",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 26 26"><path d="M0 0h26v26H0z" fill="none" /><path fill="currentColor" d="M23.934 18.947c-.598 1.324-.884 1.916-1.652 3.086c-1.073 1.634-2.588 3.673-4.461 3.687c-1.666.014-2.096-1.087-4.357-1.069c-2.261.011-2.732 1.089-4.4 1.072c-1.873-.017-3.307-1.854-4.381-3.485c-3.003-4.575-3.32-9.937-1.464-12.79C4.532 7.425 6.61 6.237 8.561 6.237c1.987 0 3.236 1.092 4.879 1.092c1.594 0 2.565-1.095 4.863-1.095c1.738 0 3.576.947 4.889 2.581c-4.296 2.354-3.598 8.49.742 10.132M16.559 4.408c.836-1.073 1.47-2.587 1.24-4.131c-1.364.093-2.959.964-3.891 2.092c-.844 1.027-1.544 2.553-1.271 4.029c1.488.048 3.028-.839 3.922-1.99" /></svg>',checkMark:"mac"===currentTheme,onClick:()=>toggleMacSonomaStyle(),tooltip:"实验功能,仅供娱乐,刷新失效"},{text:"变成Win10",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 128 128"><path d="M0 0h128v128H0z" fill="none" /><path fill="#00adef" d="m126 1.637l-67 9.834v49.831l67-.534zM1.647 66.709l.003 42.404l50.791 6.983l-.04-49.057zm56.82.68l.094 49.465l67.376 9.509l.016-58.863zM1.61 19.297l.047 42.383l50.791-.289l-.023-49.016z" /></svg>',checkMark:"win10"===currentTheme,onClick:()=>toggleWin10Style(),tooltip:"实验功能,仅供娱乐,刷新失效"},{text:"变成Win11",icon:'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path d="M0 0h256v256H0z" fill="none" /><path fill="#0078d4" d="M0 0h121.329v121.329H0zm134.671 0H256v121.329H134.671zM0 134.671h121.329V256H0zm134.671 0H256V256H134.671z" /></svg>',checkMark:"win11"===currentTheme,onClick:()=>toggleWin11Style(),tooltip:"实验功能,仅供娱乐,刷新失效"},{text:"变成WinXP",icon:"/app/fndesk/static/winxp.png",checkMark:"winxp"===currentTheme,onClick:()=>toggleWinXPStyle(),tooltip:"实验功能,仅供娱乐,刷新失效"},{text:"变成Win7",icon:"/app/fndesk/static/win7.png",checkMark:"win7"===currentTheme,onClick:()=>toggleWin7Style(),tooltip:"实验功能,仅供娱乐,刷新失效"}]}),n.push({text:"打开 Fndesk",icon:e,onClick:()=>{var e=window.location.href.replace(/\/+$/,"");openUrlInWindow(e+"/app/fndesk/","飞牛桌面管理工具","app-center-static/serviceicon/fndesk/ui/images/icon_%7B0%7D.png?size=256","fndesk")},onOpenInNewTab:()=>{var e=window.location.href.replace(/\/+$/,"");openUrlInWindow(e+"/app/fndesk/","飞牛桌面管理工具","app-center-static/serviceicon/fndesk/ui/images/icon_%7B0%7D.png?size=256","fndesk",!0)},submenu:0<o.length?o:void 0}),n.forEach(e=>{e.submenu&&0<e.submenu.length?t.appendChild(u(e.text,e.onClick,e.icon,e.submenu,e.onOpenInNewTab)):t.appendChild(m(e.text,e.onClick,e.icon,e.onOpenInNewTab))}),cachedContextMenuItems&&0<cachedContextMenuItems.length?cachedContextMenuItems.forEach(e=>{e.hasSubmenu?t.appendChild(u(e.title,e.mainOnClick,e.icon,e.submenuItems,e.onOpenInNewTab)):t.appendChild(m(e.title,e.mainOnClick,e.icon,e.onOpenInNewTab,e.isFolder||!1))}):(o=m("添加自定义菜单",()=>{var e=window.location.href.replace(/\/+$/,"");openUrlInWindow(e+"/app/fndesk/fndesk.html","添加自定义菜单","app-center-static/serviceicon/fndesk/ui/images/icon_%7B0%7D.png?size=256","fndesk")},e),t.appendChild(o))}}},0)}}).observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("mousedown",function(e){0===e.button?1!=fndeskClickSound&&3!=fndeskClickSound||playSound("click.mp3"):2!==e.button||2!=fndeskClickSound&&3!=fndeskClickSound||playSound("right.mp3")},!0);var o,i,a,r,n=document.querySelector(".flex.flex-col.items-center.justify-between");function playSound(e){new Audio("/app/fndesk/static/"+e).play().catch(e=>console.error("音频播放失败:",e))}n&&fndeskMP3_url&&""!==fndeskMP3_url&&((e=document.createElement("div")).setAttribute("aria-expanded","false"),e.setAttribute("aria-haspopup","dialog"),e.setAttribute("class",""),e.setAttribute("tabindex","0"),e.setAttribute("aria-controls","5p4wiy0"),e.setAttribute("data-popupid","5p4wiy0"),e.style.display="inline-block",e.title="🎵 Fndesk 音乐播放器（右键点击可打开独立播放器）",(o=document.createElement("div")).className="w-full flex items-center justify-center cursor-pointer h-5",(i=document.createElement("div")).className="flex justify-center items-center h-5 w-full",i.setAttribute("tabindex","0"),i.setAttribute("aria-describedby","5p4wiy0"),i.setAttribute("data-popupid","5p4wiy0"),(a=document.createElementNS("http://www.w3.org/2000/svg","svg")).setAttribute("xmlns","http://www.w3.org/2000/svg"),a.setAttribute("width","24px"),a.setAttribute("height","24px"),a.setAttribute("viewBox","0 0 24 24"),a.setAttribute("class","hover:text-white cursor-pointer px-tight text-[20px] h-base-loose block text-white-80"),a.setAttribute("fill","currentColor"),(r=document.createElementNS("http://www.w3.org/2000/svg","path")).setAttribute("fill-rule","evenodd"),r.setAttribute("d","M1 12c0-6.05 4.95-11 11-11s11 4.95 11 11-4.95 11-11 11S1 18.05 1 12Zm17 0l-9-5.5v11l9-5.5Z"),r.setAttribute("clip-rule","evenodd"),a.appendChild(r),e.addEventListener("click",openMP3Player),e.addEventListener("contextmenu",openMP3PlayerInNewWindow),i.appendChild(a),o.appendChild(i),e.appendChild(o),n.insertBefore(e,n.firstChild),e.getBoundingClientRect())}else console.error("[Fndesk] processData: 未找到目标div元素")}else console.error("[Fndesk] processData: 数据未加载，无法处理")}async function optimizeUrls(e){fndesk_log("[Fndesk] optimizeUrls: 开始执行");e=e.filter(e=>0===e.fndata_Type&&0!==e.enable),fndesk_log("[Fndesk] optimizeUrls: 筛选出",e.length,"个网站类型项目"),fndesk_log("[Fndesk] optimizeUrls: 开始并行ping检测"),e=e.map(async t=>{try{let e=null;var n,o;if(t.fndata_Wan&&t.fndata_Wan.trim()&&(e=processUrlField(t.fndata_Wan,t.fndata_Protocol??0)),t.fndata_Lan&&t.fndata_Lan.trim()&&(fndesk_log("[Fndesk] optimizeUrls: 检测内网URL:",n=processUrlField(t.fndata_Lan,t.fndata_Protocol??0)),await ping(n))&&fndesk_log("[Fndesk] optimizeUrls: 内网URL可达，使用:",e=n),!e)for(o of[processUrlField(t.fndata_URL1,t.fndata_Protocol??0),processUrlField(t.fndata_URL2,t.fndata_Protocol??0),processUrlField(t.fndata_URL3,t.fndata_Protocol??0)])if(o&&o.trim()){e=o;break}e&&optimizedUrls.set(t.id,e)}catch(e){console.warn("[Fndesk] optimizeUrls: 优化URL时出错 (ID:",t.id,"):",e)}});await Promise.all(e),pingCompleted=!0,fndesk_log("[Fndesk] optimizeUrls: URL优化完成，共优化",optimizedUrls.size,"个链接")}async function initWithRetry(){fndesk_log("[Fndesk] initWithRetry: 开始执行");var e=findTargetElement();e?(fndesk_log("[Fndesk] initWithRetry: 找到目标div，开始处理"),await processTargetDiv(e)):(fndesk_log("[Fndesk] initWithRetry: 未找到目标div，启动MutationObserver监听"),new MutationObserver(async(e,t)=>{for(var n of e)if("childList"===n.type&&0<n.addedNodes.length){n=findTargetElement();if(n){fndesk_log("[Fndesk] initWithRetry: MutationObserver检测到目标div，开始处理"),t.disconnect(),await processTargetDiv(n);break}}}).observe(document.body,{childList:!0,subtree:!0}))}async function processTargetDiv(e){fndesk_log("[Fndesk] processTargetDiv: 开始执行");try{fndesk_log("[Fndesk] processTargetDiv: 开始加载 data.json");var t=await fetch("deskdata/data.json?v="+(new Date).getTime());if(!t.ok)throw console.error("[Fndesk] processTargetDiv: 加载data.json失败:",t.status),new Error("Failed to fetch data.json");fndesk_log("[Fndesk] processTargetDiv: data.json加载成功"),fndesk_log("[Fndesk] processTargetDiv: 数据解析完成，共",(globalData=await t.json()).length,"条记录"),buildContextMenuCache()}catch(e){return void console.error("[Fndesk] processTargetDiv: 加载数据时发生错误:",e)}fndesk_log("[Fndesk] processTargetDiv: 清除intervalnasNameDisplay定时器"),clearInterval(intervalnasNameDisplay),fndesk_log("[Fndesk] processTargetDiv: 开始执行 processData"),processData(),initGlobalIframeButtonObserver(),safeLoadSync("./FileManagerEnhancer.js"),autoInsertNewFileButton(),initGlassEffect(),initContainerStyleObserver(),initWallpaperAutoChange(),initThemeFromStorage(),globalData&&!pingCompleted&&(fndesk_log("[Fndesk] processTargetDiv: 开始执行 optimizeUrls"),optimizeUrls(globalData).catch(e=>{console.error("[Fndesk] processTargetDiv: URL优化过程中发生错误:",e)})),window.__fndeskTokenCheckStarted}function initIconAvoidance(){let n=()=>{let o=[];return document.querySelectorAll("[data-desktop-item-id]").forEach(e=>o.push(e)),document.querySelectorAll('[class*="h-[124px]"][class*="w-[130px]"]').forEach(e=>o.push(e)),document.querySelectorAll('div[style*="display: flex"][style*="flex-direction: column"][style*="align-items: center"][style*="cursor: pointer"]').forEach(e=>{var t=e.querySelector("img"),n=e.querySelector("div[title]");t&&n&&o.push(e)}),document.querySelectorAll('div[aria-expanded][aria-haspopup][data-popupid][tabindex="0"][aria-controls][style*="display: inline-block"]').forEach(e=>{e.querySelector('div[class*="cursor-pointer"]')&&o.push(e)}),document.querySelectorAll('div[class*="flex h-10 w-[47px] items-center justify-center gap-x-2 border-0 !border-l-[3px] border-solid border-transparent hover:bg-white-10"]').forEach(e=>o.push(e)),document.querySelectorAll('div[class*="flex"][class*="h-10"][class*="w-[47px]"]').forEach(e=>o.push(e)),o},e=t=>{if(t.ctrlKey){let e=n();void e.forEach(e=>{e.style.transform&&"translate(0, 0)"!==e.style.transform&&(clearTimeout(e._avoidanceTimeout),e.style.transition="transform 0.3s ease-out",e.style.transform="translate(0, 0)",e._isBeingAffected=!1,e._isInRecovery=!1)})}else{let e=n(),a=t.clientX,r=t.clientY;e.forEach(e=>{var t=e.getBoundingClientRect(),n=t.left+t.width/2,t=t.top+t.height/2,o=((e,t,n,o)=>{n-=e,e=o-t;return Math.sqrt(n*n+e*e)})(a,r,n,t),i=e.style.transform&&"translate(0, 0)"!==e.style.transform;o<100&&0<o?(o=260*(1-o/100),t=Math.atan2(t-r,n-a),n=Math.cos(t)*o,t=Math.sin(t)*o,e.style.transition="transform 0.1s ease-out",e.style.transform=`translate(${n}px, ${t}px)`,e._isBeingAffected=!0,e._isInRecovery=!1,clearTimeout(e._avoidanceTimeout),e._avoidanceTimeout=setTimeout(()=>{e.style.transition="transform 0.3s ease-out",e.style.transform="translate(0, 0)",e._isBeingAffected=!1,e._isInRecovery=!1},300)):!e._isBeingAffected&&!i||e._isInRecovery||(e._isInRecovery=!0,clearTimeout(e._avoidanceTimeout),e._avoidanceTimeout=setTimeout(()=>{e.style.transition="transform 0.3s ease-out",e.style.transform="translate(0, 0)",e._isBeingAffected=!1,e._isInRecovery=!1},300))})}};return document.addEventListener("mousemove",e),()=>{document.removeEventListener("mousemove",e)}}async function initMainProcess(){fndesk_log("[Fndesk] ========== initMainProcess 开始执行 ==========");try{fndesk_log("[Fndesk] 步骤1: 开始初始化 initWithRetry"),initWithRetry(),fndesk_log("[Fndesk] 步骤2: 开始初始化 setupSpecificElementsZIndexManagement"),setupSpecificElementsZIndexManagement()}catch(e){console.error("[Fndesk] initMainProcess: 加载数据时发生错误:",e)}}function safeInitMainProcess(){fndesk_log("[Fndesk] safeInitMainProcess: 检查DOM加载状态"),"loading"===document.readyState?(fndesk_log("[Fndesk] safeInitMainProcess: DOM还在加载中，等待DOMContentLoaded"),document.addEventListener("DOMContentLoaded",initMainProcess)):(fndesk_log("[Fndesk] safeInitMainProcess: DOM已加载完成，立即执行"),initMainProcess())}function openMP3PlayerInNewWindow(e){e.preventDefault();window.open("/MP3go/player.html","MP3Player","width=460,height=960,toolbar=no,menubar=no,location=no,status=no,resizable=no,scrollbars=no")}function createContextMenu(){let t=document.getElementById("tech-context-menu");var e;return t||((t=document.createElement("div")).id="tech-context-menu",t.style.position="fixed",t.style.background="rgba(20, 20, 30, 0.95)",t.style.border="1px solid #3a3a5a",t.style.borderRadius="8px",t.style.boxShadow="0 0 20px rgba(66, 153, 225, 0.5), 0 0 40px rgba(66, 153, 225, 0.3)",t.style.zIndex="9999",t.style.display="none",t.style.minWidth="150px",t.style.padding="3px 0",t.style.backdropFilter="blur(10px)",(e=document.createElement("div")).style.position="absolute",e.style.top="0",e.style.left="0",e.style.right="0",e.style.height="100%",e.style.background="linear-gradient(45deg, transparent 0%, rgba(66, 153, 225, 0.05) 50%, transparent 100%)",e.style.zIndex="-1",t.appendChild(e),document.body.appendChild(t),document.addEventListener("click",function(e){t.contains(e.target)||(t.style.display="none")}),t.addEventListener("contextmenu",function(e){e.preventDefault()})),t}function showCustomContextMenu(s,e){s.preventDefault();let l=createContextMenu();l.innerHTML="";var t=document.createElement("div");t.style.position="absolute",t.style.top="0",t.style.left="0",t.style.right="0",t.style.height="100%",t.style.background="linear-gradient(45deg, transparent 0%, rgba(66, 153, 225, 0.05) 50%, transparent 100%)",t.style.zIndex="-1",l.appendChild(t),e.forEach(e=>{var t,n=document.createElement("div");n.className="context-menu-item",Object.assign(n.style,{padding:"10px 15px",color:"#e0e0ff",fontSize:"13px",cursor:"pointer",transition:"all 0.2s ease",position:"relative",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:"8px"}),e.style&&Object.assign(n.style,e.style),"function"==typeof e.customContent?(e.customContent(n),n.addEventListener("click",function(){"function"==typeof e.onClick&&e.onClick(),l.style.display="none"})):(e.icon&&((t=document.createElement("img")).src=e.icon,Object.assign(t.style,{width:"16px",height:"16px",objectFit:"contain"}),n.appendChild(t)),t=document.createTextNode(e.text),n.appendChild(t),n.addEventListener("click",function(){"function"==typeof e.onClick&&e.onClick(),l.style.display="none"}),n.addEventListener("mouseenter",function(){this.style.background="rgba(66, 153, 225, 0.3)",this.style.color="#ffffff",this.style.transform="translateX(5px)"}),n.addEventListener("mouseleave",function(){this.style.background="transparent",this.style.color="#e0e0ff",this.style.transform="translateX(0)"})),l.appendChild(n)}),s.clientX;l.style.left="0px",l.style.top="-1000px",l.style.display="block",setTimeout(()=>{var e=l.offsetWidth,t=l.offsetHeight,n=window.innerWidth,o=s.clientX,i=s.clientY;let a=o,r=i;a+e>n&&(a=o-e),r+t>window.innerHeight&&(r=i-t),a=Math.max(5,a),r=Math.max(5,r),l.style.left=a+"px",l.style.top=r+"px"},0)}safeInitDesktopIconControl(),safeLoginReady.then(()=>{let e=new URLSearchParams(location.search).get("fn")||"",t=safeLogin;""!==t&&new MutationObserver(()=>{(""!==e?sha256(e):"")!==t&&document.querySelectorAll(".transform-gpu").forEach(e=>e.remove())}).observe(document.body,{childList:!0,subtree:!0})}),safeInitMainProcess(),window.addEventListener("load",function(){fndesk_log(`页面完全加载时间: ${performance.now().toFixed(2)}ms`)});let activeWindows={},currentActiveWindowId=null,windowIcons=(window.fndeskSharedWindowHelpers||(window.fndeskSharedWindowHelpers={hideWindowByStateManager(e,t){t&&(void 0!==activeWindows&&activeWindows[e]&&(activeWindows[e].inTray=!1),(e=t.style.display||window.getComputedStyle(t).display)&&"none"!==e&&(t.dataset.cqOriginalDisplay=e),t.style.transform="scale(0.8)",t.style.opacity="0",setTimeout(function(){t.isConnected&&(t.style.display="none",t.style.opacity="",t.style.transform="")},200),"function"==typeof window.updateTaskbarIconBorder)&&window.updateTaskbarIconBorder(null)},showWindowByStateManager(e,t){t&&t.isConnected&&(void 0!==activeWindows&&activeWindows[e]&&(activeWindows[e].inTray=!1),t.style.display=t.dataset.cqOriginalDisplay||"flex",t.style.opacity="1",t.style.transform="scale(1)",void 0!==currentZIndex&&(currentZIndex++,t.style.zIndex=currentZIndex),void 0!==currentActiveWindowId&&(currentActiveWindowId=e),setTimeout(function(){var e=t.querySelector("iframe");e&&(e.style.width="100%",e.style.height="100%")},0),"function"==typeof window.updateTaskbarIconBorder)&&window.updateTaskbarIconBorder(t)},saveWindowRect(e,t,n){try{var o=parseInt(e.style.width),i=parseInt(e.style.height),a=parseInt(e.style.left),r=parseInt(e.style.top);isNaN(o)||isNaN(i)||isNaN(a)||isNaN(r)||localStorage.setItem(t,JSON.stringify({width:o,height:i,left:a,top:r}))}catch(e){console.warn(n,e)}},closeWindowByStateManager(e,t){delete activeWindows[e],t&&t.remove&&t.remove(),currentActiveWindowId===e&&(currentActiveWindowId=null),"function"==typeof window.updateTaskbarIconBorder&&window.updateTaskbarIconBorder(null)},toggleWindowByStateManager(e,t){t&&("none"===(t.style.display||window.getComputedStyle(t).display)?this.showWindowByStateManager(e,t):(this.hideWindowByStateManager(e,t),currentActiveWindowId===e&&(currentActiveWindowId=null)))},toggleExistingWindowByMatcher(e){if("function"==typeof e)for(var t in activeWindows){var n;if(e(activeWindows[t],t))return(n=document.getElementById(t))&&this.toggleWindowByStateManager(t,n),!0}return!1}}),window.getFndeskSharedWindowHelpers||(window.getFndeskSharedWindowHelpers=function(){function getSharedHelpers(){return window.fndeskSharedWindowHelpers||{}}return{hideWindowByStateManager(){var e=getSharedHelpers().hideWindowByStateManager;if("function"==typeof e)return e.apply(null,arguments)},showWindowByStateManager(){var e=getSharedHelpers().showWindowByStateManager;if("function"==typeof e)return e.apply(null,arguments)},saveWindowRect(){var e=getSharedHelpers().saveWindowRect;if("function"==typeof e)return e.apply(null,arguments)},closeWindowByStateManager(){var e=getSharedHelpers().closeWindowByStateManager;if("function"==typeof e)return e.apply(null,arguments)},toggleWindowByStateManager(){var e=getSharedHelpers().toggleWindowByStateManager;if("function"==typeof e)return e.apply(null,arguments)},toggleExistingWindowByMatcher(){var e=getSharedHelpers().toggleExistingWindowByMatcher;if("function"==typeof e)return e.apply(null,arguments)}}}),!function initCQWindowManager(){if(!window._cqWindowManagerInited){let e=!(window._cqWindowManagerInited=!0);function getTaskbarContainer(){return document.querySelector(".scrollbar-hidden.absolute.inset-0.flex.flex-col.items-end.justify-start.gap-2")||document.querySelector(".flex.flex-col.items-end.justify-start.gap-2")||document.querySelector('[class*="taskbar"]')}function getManagedWindows(){let n=new Set;return document.querySelectorAll('.desktop .trim-ui__app-layout--window, .desktop [class*="window"]').forEach(function(e){e&&1===e.nodeType&&n.add(e)}),Object.keys(activeWindows).forEach(function(e){var t=activeWindows[e];t&&t.element&&1===t.element.nodeType&&t.element.isConnected&&(t.element.dataset.cqWindowId=e,n.add(t.element))}),Array.from(n)}function bringWindowToFront(e){if(e){var n=getManagedWindows();let t=10010;n.forEach(function(e){e=parseInt(e.style.zIndex,10)||10010;e>t&&(t=e)});n=t+1;e.style.zIndex=n,currentZIndex<n&&(currentZIndex=n),e.dataset&&e.dataset.cqWindowId&&(currentActiveWindowId=e.dataset.cqWindowId)}}function getTopVisibleWindow(){var e=getManagedWindows();let n=null,o=-1/0;return e.forEach(function(e){var t;e&&e.isConnected&&"none"!==(e.style.display||window.getComputedStyle(e).display)&&(t=parseInt(e.style.zIndex,10)||0)>o&&(o=t,n=e)}),n}function removeCustomIconBorder(){document.querySelectorAll(".taskbar-icon").forEach(function(e){e.classList.remove("bg-white-10","!border-focus-border")})}function updateTaskbarIconBorder(e){e&&e._taskbarIcon?(document.querySelectorAll(".flex.h-10").forEach(function(e){e.classList.remove("bg-white-10","!border-focus-border")}),e._taskbarIcon.classList.add("bg-white-10","!border-focus-border")):e?removeCustomIconBorder():document.querySelectorAll(".flex.h-10").forEach(function(e){e.classList.remove("bg-white-10","!border-focus-border")})}function addTaskbarIcon(e,t,i,a){if(e&&e.isConnected){var r=getTaskbarContainer();if(r&&(!e._taskbarIcon||!e._taskbarIcon.isConnected)){var s=r.querySelector('.taskbar-icon[data-window-id="'+t+'"]');s&&s.remove();let n=document.createElement("div");n.className="flex h-10 w-[47px] items-center justify-center gap-x-2 border-0 !border-l-[3px] border-solid border-transparent hover:bg-white-10 taskbar-icon",n.dataset.windowId=t,n.innerHTML='<div class="flex h-9 shrink-0 flex-row items-center px-[3px] py-super-tight" tabindex="0"><div class="box-border size-[80px] p-[15%] !h-[36px] !w-[36px]"><div class="semi-image size-full"><img src="'+a+'" alt="'+i+'" class="semi-image-img w-full h-full !rounded-[10%]" style="user-select: none; pointer-events: none;"></div></div></div>';s="cq-tooltip-"+t;let o=document.createElement("div");function showTooltip(){var e=n.getBoundingClientRect(),t=(o.style.display="block",o.classList.add("semi-tooltip-wrapper-show"),o.getBoundingClientRect());o.style.left=e.right+6+"px",o.style.top=e.top+(e.height-t.height)/2+"px"}function hideTooltip(){o.style.display="none",o.classList.remove("semi-tooltip-wrapper-show")}o.id=s,o.className="semi-tooltip-wrapper semi-tooltip-with-arrow",o.setAttribute("role","tooltip"),o.setAttribute("x-placement","right"),o.style.position="fixed",o.style.left="0px",o.style.top="0px",o.style.transformOrigin="0% 50%",o.style.animationFillMode="forwards",o.style.zIndex="99999",o.style.display="none",o.style.pointerEvents="none",o.innerHTML='<div class="semi-tooltip-content">'+i+'</div><svg aria-hidden="true" class="semi-tooltip-icon-arrow" width="7" height="24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" style="fill: currentcolor;"><path d="M0 0L1 0C1 4, 2 5.5, 4 7.5S7,10 7,12S6 14.5, 4 16.5S1,20 1,24L0 24L0 0z"></path></svg>',document.body.appendChild(o),n._cqTooltip=o,n.addEventListener("mouseenter",showTooltip),n.addEventListener("mouseleave",hideTooltip),n.addEventListener("focusin",showTooltip),n.addEventListener("focusout",hideTooltip),n.addEventListener("click",function(){e.isConnected?"none"===(e.style.display||window.getComputedStyle(e).display)?function restoreWindowLikeExample(t){t&&t.isConnected&&(t.style.display=t.dataset.cqOriginalDisplay||"flex",t.style.opacity="1",t.style.transform="scale(1)",bringWindowToFront(t),updateTaskbarIconBorder(t),setTimeout(function(){var e=t.querySelector("iframe");e&&(e.style.width="0",e.style.height="0",e.style.width="100%",e.style.height="100%")},0))}(e):getTopVisibleWindow()===e?(function hideWindowLikeExample(e){var t;e&&((t=e.style.display||window.getComputedStyle(e).display)&&"none"!==t&&(e.dataset.cqOriginalDisplay=t),e.style.transform="scale(0.8)",e.style.opacity="0",setTimeout(function(){e.isConnected&&(e.style.display="none",e.style.opacity="",e.style.transform="")},200))}(e),updateTaskbarIconBorder(null)):(bringWindowToFront(e),updateTaskbarIconBorder(e)):(hideTooltip(),o&&o.isConnected&&o.remove(),n.remove())}),r.appendChild(n),e._taskbarIcon=n}}}function syncManagedWindows(){Object.keys(activeWindows).forEach(function(e){var t,n=activeWindows[e];n&&n.element&&n.element.isConnected&&((t=n.element).dataset.cqWindowId=e,function bindWindowMouseDown(e){e&&!e._cqMouseDownBound&&(e.addEventListener("mousedown",function(){bringWindowToFront(e),updateTaskbarIconBorder(e)},!0),e._cqMouseDownBound=!0)}(t),addTaskbarIcon(t,e,function readWindowTitle(e,t){return t&&t.title?t.title:(t=e.querySelector('.trim-ui__app-layout--header-title, [class*="header-title"], .line-clamp-2, div'))&&t.textContent&&t.textContent.trim()||"窗口"}(t,n),function readWindowIcon(e,t){return t&&t.icon?t.icon:(t=e.querySelector("img"))&&t.getAttribute("src")?t.getAttribute("src"):"deskdata/img/i.png"}(t,n)))}),document.querySelectorAll(".taskbar-icon").forEach(function(e){var t=e.dataset.windowId,t=activeWindows[t];t&&t.element&&t.element.isConnected||(e._cqTooltip&&e._cqTooltip.isConnected&&e._cqTooltip.remove(),e.remove())})}function ensureTaskbarListener(){var e=getTaskbarContainer();e&&!e._cqTaskbarListenerBound&&(e.addEventListener("mousedown",function(e){e.target.closest(".flex.h-10:not(.taskbar-icon)")&&removeCustomIconBorder()},!0),e._cqTaskbarListenerBound=!0)}function scheduleManagedWindowsSync(){e||(e=!0,requestAnimationFrame(function(){e=!1,syncManagedWindows(),ensureTaskbarListener()}))}!function initGlobalWindowStateManager(){window.updateTaskbarIconBorder=updateTaskbarIconBorder;var e=document.querySelector(".desktop");e&&!e._cqDesktopListenerBound&&(e.addEventListener("mousedown",function(e){e.target.closest('.trim-ui__app-layout--window, .desktop-window, [class*="window"]')&&setTimeout(function(){updateTaskbarIconBorder(getTopVisibleWindow())},10)},!0),e._cqDesktopListenerBound=!0),ensureTaskbarListener()}(),!function startManagedWindowsSyncOnDemand(){scheduleManagedWindowsSync();var t=document.querySelector(".desktop")||document.body;if(t){let e=new MutationObserver(function(t){for(let e=0;e<t.length;e++){var n=t[e];if("childList"===n.type&&(n.addedNodes.length||n.removedNodes.length))return void scheduleManagedWindowsSync()}});e.observe(t,{childList:!0,subtree:!0}),document.addEventListener("visibilitychange",function(){document.hidden||scheduleManagedWindowsSync()}),window.addEventListener("focus",scheduleManagedWindowsSync),window.addEventListener("beforeunload",function(){e.disconnect()})}}()}}(),document.addEventListener("keydown",function(o){if("Escape"===o.key||27===o.keyCode){var o=o.target,o=o&&("INPUT"===o.tagName||"TEXTAREA"===o.tagName||"SELECT"===o.tagName||o.isContentEditable);if(!o){let e=null,t=0,n=null;for(var i in activeWindows){var a=document.getElementById(i),r=a?a.style.display||window.getComputedStyle(a).display:"none";a&&"none"!==r&&(r=parseInt(a.style.zIndex)||0)>t&&(t=r,e=a,n=i)}e&&n&&("function"==typeof hideWindowByStateManager?hideWindowByStateManager(n,e):((o=e.style.display||window.getComputedStyle(e).display)&&"none"!==o&&(e.dataset.cqOriginalDisplay=o),e.style.transform="scale(0.8)",e.style.opacity="0",setTimeout(function(){e.isConnected&&(e.style.display="none",e.style.opacity="",e.style.transform="")},200)),"true"===e.dataset.hasFocus&&(e.dataset.hasFocus="false"),activeWindows[n]&&(activeWindows[n].inTray=!1),currentActiveWindowId===n&&(currentActiveWindowId=null),"function"==typeof window.updateTaskbarIconBorder)&&window.updateTaskbarIconBorder(null)}}}),new Map);function getWindowIcon(e){return windowIcons.get(e)}function setWindowIcon(e,t){windowIcons.set(e,t)}function getIconForUrl(e){if(globalData&&globalData.icons)for(var t of globalData.icons)if(e.includes(t.domain))return t.iconUrl;return null}function showToast(e,t="success"){var n="__custom_toast_container__";let o=document.getElementById(n),i=(o||((o=document.createElement("div")).id=n,o.style.position="fixed",o.style.top="16px",o.style.left="50%",o.style.transform="translateX(-50%)",o.style.zIndex="99999",o.style.display="flex",o.style.flexDirection="column",o.style.gap="8px",document.body.appendChild(o)),document.createElement("div"));i.style.minWidth="200px",i.style.maxWidth="560px",i.style.boxSizing="border-box",i.style.padding="8px 12px",i.style.borderRadius="8px",i.style.boxShadow="0 10px 24px rgba(0,0,0,0.12)",i.style.background="#ffffff",i.style.color="#111827",i.style.fontSize="14px",i.style.lineHeight="1.6",i.style.border="1px solid rgba(0,0,0,0.06)",i.style.display="flex",i.style.alignItems="center",i.style.gap="10px",i.style.opacity="0",i.style.transition="opacity 240ms ease";var n=document.createElement("div"),a=(n.style.width="18px",n.style.height="18px",n.style.borderRadius="50%",n.style.display="flex",n.style.alignItems="center",n.style.justifyContent="center",n.style.background="success"===t?"#22c55e":"#ef4444",document.createElementNS("http://www.w3.org/2000/svg","svg")),t=(a.setAttribute("viewBox","0 0 24 24"),a.setAttribute("width","14"),a.setAttribute("height","14"),a.style.fill="#ffffff",a.innerHTML="success"===t?'<path fill-rule="evenodd" clip-rule="evenodd" d="M9.55 16.2a1 1 0 01-.73-.32l-3-3.2a1 1 0 111.46-1.36l2.28 2.43 6.05-6.72a1 1 0 111.48 1.34l-6.78 7.52a1 1 0 01-.76.31z"/>':'<path fill-rule="evenodd" clip-rule="evenodd" d="M13.41 12l3.3-3.3a1 1 0 10-1.41-1.41L12 10.59 8.7 7.29a1 1 0 10-1.41 1.41L10.59 12l-3.3 3.3a1 1 0 101.41 1.41L12 13.41l3.3 3.3a1 1 0 001.41-1.41L13.41 12z"/>',n.appendChild(a),document.createElement("div"));t.textContent=e,i.appendChild(n),i.appendChild(t),o.appendChild(i),requestAnimationFrame(()=>{i.style.opacity="1"}),setTimeout(()=>{i.style.transition="opacity 5000ms ease",i.style.opacity="0",setTimeout(()=>{i.remove(),0===o.childElementCount&&o.remove()},5e3)},3e3)}function autoInsertNewFileButton(){let r="data-custom-new-file-btn",s=".trim-ui__app-layout--window, .trim-ui-app-layout--window",f='button.semi-button.semi-button-tertiary.semi-button-size-small.semi-button-outline.semi-button-with-icon.semi-button-with-icon-only, [role="button"].semi-button.semi-button-tertiary.semi-button-size-small.semi-button-outline.semi-button-with-icon.semi-button-with-icon-only',h=e=>!!e&&e.isConnected&&null!==e.offsetParent,l=e=>!!e&&!0!==e.disabled&&"true"!==e.getAttribute("aria-disabled");function showNewFileDialog(p,c,m){var e=window.matchMedia("(prefers-color-scheme: dark)").matches;let u="20"===localStorage.getItem("fnos-theme-mode")||"30"===localStorage.getItem("fnos-theme-mode")&&e;return new Promise(t=>{let n=document.createElement("div"),o=(n.style.position="fixed",n.style.inset="0",n.style.background=u?"rgba(0,0,0,0.4)":"rgba(0,0,0,0.2)",n.style.backdropFilter="blur(6px)",n.style.zIndex="99998",document.createElement("div"));o.style.position="fixed";var e=(i=(e=e=>e?e.closest(".trim-ui__app-layout--window")||e.closest(".trim-ui-app-layout--window")||e.closest(".semi-modal-content")||e.closest(".semi-modal")||e.closest('[role="dialog"]')||e.closest(".semi-portal"):null)(i=m))||e((i=Array.from(document.querySelectorAll(f)).filter(e=>h(e))).find(e=>!e.closest('.semi-button-split[role="group"]'))||i[0]),e=(e?(i=e.getBoundingClientRect(),o.style.left=i.left+i.width/2+"px",o.style.top=i.top+i.height/2+"px"):(o.style.left="50%",o.style.top="50%"),o.style.transform="translate(-50%, -50%)",o.style.width="420px",o.style.maxWidth="95vw",o.style.background=u?"rgba(26, 26, 26, 0.5)":"rgba(255, 255, 255, 0.9)",o.style.backdropFilter="blur(12px)",o.style.borderRadius="12px",o.style.boxShadow=u?"0 16px 48px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)":"0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",o.style.border=u?"1px solid rgba(255,255,255,0.1)":"1px solid rgba(255,255,255,0.2)",o.style.overflow="hidden",o.style.zIndex="99999",document.createElement("div")),i=(e.style.padding="20px 24px 16px",e.style.fontSize="16px",e.style.fontWeight="600",e.style.color=u?"#ffffff":"#1c1f23",e.style.borderBottom=u?"1px solid rgba(255,255,255,0.1)":"1px solid rgba(0,0,0,0.06)",e.textContent="📄 新建文件 • 由 Fndesk 提供",document.createElement("div")),a=(i.style.padding="20px 24px",document.createElement("div")),r=(a.style.fontSize="14px",a.style.color=u?"#a0aec0":"#41464f",a.style.marginBottom="16px",a.textContent="当前目录：/"+p,document.createElement("div"));r.className="semi-input-wrapper semi-input-wrapper__with-prefix semi-input-wrapper-clearable",r.style.background=u?"#2d3748":"transparent",r.style.border=u?"1px solid rgba(255,255,255,0.1)":"1px solid rgba(0,0,0,0.1)",r.style.borderRadius="8px";let s=document.createElement("input");s.className="semi-input",s.type="text",s.placeholder="请输入文件名",s.style.fontSize="15px",s.style.padding="10px",s.value=c,s.style.width="100%",s.style.background="transparent",s.style.color=u?"#ffffff":"#1c1f23",s.style.border="none",s.style.outline="none",r.appendChild(s),i.appendChild(a),i.appendChild(r);a=document.createElement("div"),a.style.display="flex",a.style.justifyContent="flex-end",a.style.gap="12px",a.style.padding="12px 24px 24px",a.style.borderTop=u?"1px solid rgba(255,255,255,0.1)":"1px solid rgba(0,0,0,0.06)",r=document.createElement("button");r.className=(u,"semi-button semi-button-danger semi-button-outline"),r.style.background=u?"rgba(239,68,68,0.1)":"transparent",r.style.color=u?"#f87171":"#dc2626",r.style.border=u?"1px solid rgba(239,68,68,0.3)":"1px solid rgba(220,38,38,0.3)",r.textContent="取消";let l=document.createElement("button"),d=(l.className=(u,"semi-button semi-button-primary"),l.style.background=u?"#3b82f6":"#2563eb",l.style.color="#ffffff",l.style.border="none",l.textContent="确定",a.appendChild(r),a.appendChild(l),o.appendChild(e),o.appendChild(i),o.appendChild(a),document.body.appendChild(n),document.body.appendChild(o),e=>{o.remove(),n.remove(),t(e)});n.addEventListener("click",()=>d(null)),r.addEventListener("click",()=>d(null)),l.addEventListener("click",()=>{var e=s.value.trim();e&&d(e)}),s.addEventListener("keydown",e=>{"Enter"===e.key&&l.click(),"Escape"===e.key&&d(null)}),setTimeout(()=>s.focus(),0)})}async function createFileViaAPI(e,t,n){var o=t.replace(/[\/\\]/g,"");if(o!==t||!o)return alert("❌ 文件名不合法！不能包含 / 或 \\ 字符"),!1;try{var i,a=await fetch("/cgi/ThirdParty/fndesk/index.cgi/api/newfile",{method:"POST",headers:{"Content-Type":"application/json; charset=utf-8"},body:JSON.stringify({path:e,filename:t})}),r=await a.json();return a.ok?r.success?(showToast(`【Fndesk】文件创建成功
路径：`+r.filePath,"success"),function triggerFileManagerRefresh(e=null){let t=document;e&&(e=e.closest(s))&&(t=e),(e=(e=Array.from(t.querySelectorAll(f)).filter(e=>h(e)&&l(e))).find(e=>!e.closest('.semi-button-split[role="group"]'))||e[0])&&e.click()}(n),!0):(alert("❌ 文件创建失败："+r.message),!1):(i=r.message||`请求失败（状态码：${a.status}）`,400===a.status?alert("❌ 参数错误："+i):403===a.status?alert("❌ 访问被拒绝："+i):409===a.status?alert("❌ 文件已存在："+i):500===a.status?alert("❌ 服务器错误："+i):alert("❌ 请求失败："+i),!1)}catch(e){return alert(`❌ 网络错误：无法连接到创建文件接口
`+e.message),!1}}function getFolderPathFromDom(e){let t=e=>"string"==typeof e&&(e=e.trim())?e.startsWith("/")?e:"/"+e.replace(/^\/+/,""):null;var e=e?e.closest('.trim-ui__app-layout--window, .trim-ui-app-layout--window, [role="dialog"], .semi-modal'):null,n=[];e&&n.push(e),n.push(document);for(let e of n){var o=(o=(o=e)&&Array.from(o.querySelectorAll('input.semi-input, input[type="text"]')).find(e=>{e="string"==typeof e.value?e.value.trim():"";return e.startsWith("/")&&!e.includes("搜索")}))?t(o.value):null;if(o)return o;o=(o=(o=e)&&o.querySelector('[title^="/"], [data-path^="/"], [data-current-path^="/"]'))?t(o.getAttribute("title")||o.getAttribute("data-path")||o.getAttribute("data-current-path")):null;if(o)return o}return null}function createBtnWithSameStyle(e){let o=document.createElement("button");o.setAttribute(r,"true");var t=e.className.split(" ").filter(e=>!e.includes("disabled")&&!e.includes("disable")&&!e.includes("unable")),t=(o.className=t.join(" "),o.style.cssText=e.style.cssText,o.style.padding="0 12px",o.style.opacity="1",o.style.pointerEvents="auto",o.style.filter="none",o.style.position="relative",o.style.zIndex="2",o.removeAttribute("disabled"),o.setAttribute("aria-disabled","false"),o.disabled=!1,window._SYSTEM_WS_FOLDER_PATH),t=("string"==typeof t&&t&&o.setAttribute("data-current-path",t),e.querySelector(".semi-button-content")||e.firstElementChild);t?((t=t.cloneNode(!0)).innerHTML="",(n=document.createElement("span")).textContent="📄 新建文件",n.style.display="inline-block",n.style.padding="8px 0",t.appendChild(n),o.innerHTML="",o.appendChild(t)):(o.textContent="📄 新建文件",o.style.padding="8px 12px");let i=!1,a=0;var n=async e=>{e&&(e.preventDefault(),e.stopPropagation());var t,n,e=Date.now();if(!(i||e-a<450)){a=e,i=!0;try{let e=o.getAttribute("data-current-path");(e=(e=e||getFolderPathFromDom(o))||window._SYSTEM_WS_FOLDER_PATH||null)?(t=`文件_${function getFormattedDateTime(){var e=new Date;return""+e.getFullYear()+String(e.getMonth()+1).padStart(2,"0")+String(e.getDate()).padStart(2,"0")+"_"+String(e.getHours()).padStart(2,"0")+String(e.getMinutes()).padStart(2,"0")+String(e.getSeconds()).padStart(2,"0")}()}.txt`,(n=await showNewFileDialog(e,t,o))&&await createFileViaAPI(e,n,o)):alert("❌ 未获取到文件夹路径，请先操作文件列表！")}finally{i=!1}}};return o.addEventListener("click",n),o.addEventListener("touchend",n,{passive:!1}),o.onmouseover=()=>{o.style.backgroundColor=e.style.backgroundColor||"",o.style.borderColor=e.style.borderColor||""},o.onmouseout=()=>{o.style.backgroundColor="",o.style.borderColor=""},o}function insertButtonAfterUploadBtn(){var e=function findExactUploadButton(){return Array.from(document.querySelectorAll('button, [role="button"]')).filter(e=>!(!h(e)||!l(e)||e.hasAttribute(r))&&"上传"===e.textContent.trim())}();let o=new Set,i=!1;0<e.length&&e.forEach(t=>{if(t.parentElement){let e=t.previousElementSibling;var n;(e=e&&e.hasAttribute(r)?e:t.parentElement.querySelector(`[${r}]`))?(e._hideTimer&&(clearTimeout(e._hideTimer),e._hideTimer=null),"none"===e.style.display&&(e.style.display="",i=!0),t.previousElementSibling!==e&&(t.insertAdjacentElement("beforebegin",e),i=!0),n=window._SYSTEM_WS_FOLDER_PATH,!e.getAttribute("data-current-path")&&"string"==typeof n&&n&&e.setAttribute("data-current-path",n),o.add(e)):(e=createBtnWithSameStyle(t),t.insertAdjacentElement("beforebegin",e),o.add(e),i=!0)}}),document.querySelectorAll(`[${r}]`).forEach(e=>{o.has(e)||!e.isConnected||e._hideTimer||(e._hideTimer=setTimeout(()=>{e.style.display="none",e._hideTimer=null},200))}),i}insertButtonAfterUploadBtn(),function observeDOM(){let e=!1,t=()=>{e=!1,insertButtonAfterUploadBtn()},o=()=>{e||(e=!0,requestAnimationFrame(t))};var n=new MutationObserver(t=>{for(let e of t)if("childList"===(n=e).type?(0!==n.addedNodes.length||0!==n.removedNodes.length)&&[...n.addedNodes,...n.removedNodes].some(e=>e&&1===e.nodeType):"attributes"===n.type&&!!(n=n.target)&&1===n.nodeType){o();break}var n});n.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["disabled","aria-disabled"]}),o()}(),window.addEventListener("focus",()=>{insertButtonAfterUploadBtn()}),document.addEventListener("visibilitychange",()=>{"visible"===document.visibilityState&&insertButtonAfterUploadBtn()})}function safeLoadSync(e){let t=new XMLHttpRequest;t.open("GET",e,!1),t.onload=function(){var e;200<=t.status&&t.status<300&&((e=document.createElement("script")).textContent=t.responseText,document.head.appendChild(e))},t.onerror=function(){};try{t.send()}catch(e){}}function initDesktopIconSort(){let r=document.querySelector(".flex.box-border.size-full.flex-col.flex-wrap");if(r){let o=".box-border.flex.h-\\[120px\\].w-\\[144px\\]",e=3e3,n=null,i=null,a=!1,t=null;function getIconKey(e){var t=e.querySelector("[title]")?.title||"",n=e.querySelector("img")?.alt||"",o=e.querySelector(".line-clamp-2")?.textContent?.trim()||"";let i=e.querySelector("img")?.dataset.src||e.querySelector("img")?.src||"";try{var a=new URL(i);i=a.pathname+a.search+a.hash}catch(e){}return`${t||n||o}|`+i}function saveOrder(){clearTimeout(t),t=setTimeout(async()=>{try{var e=Array.from(r.querySelectorAll(o)).map(getIconKey).filter(Boolean),t=await(await fetch("/cgi/ThirdParty/fndesk/index.cgi/api/icon-sort",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).json();t.success?"function"==typeof showToast&&showToast("【Fndesk】桌面图标排序保存成功！","success"):(console.error("保存图标排序数据失败:",t.message),"function"==typeof showToast&&showToast("【Fndesk】保存失败: "+t.message,"error"))}catch(e){console.error("保存图标排序数据失败:",e),"function"==typeof showToast&&showToast("【Fndesk】保存失败: "+e.message,"error")}},e)}function resetDrag(){n&&(n.style.opacity="1",n.style.transform="",n.style.zIndex=""),clearTimeout(i),n=null,a=!1}function bindDrag(){var e=r.querySelectorAll(o);e.length&&e.forEach(t=>{t.dataset.dragBound||(t.dataset.dragBound="true",t.draggable=!0,t.ondragstart=e=>{n=t,e.dataTransfer.setData("text/plain",""),t.style.opacity="1",t.style.transform="scale(1.5)",t.style.zIndex="9999"},t.ondragover=e=>e.preventDefault(),t.ondrop=e=>{e.preventDefault(),n&&n!==t&&(n.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_FOLLOWING?r.insertBefore(n,t.nextSibling):r.insertBefore(n,t),saveOrder())},t.ondragend=resetDrag,t.ontouchstart=()=>{a=!1,i=setTimeout(()=>{a=!0,(n=t).style.opacity="0.9",t.style.transform="scale(1.5)",t.style.zIndex="9999"},200)},t.ontouchmove=e=>{a&&n&&(e.preventDefault(),e=e.touches[0],e=document.elementFromPoint(e.clientX,e.clientY).closest(o))&&e!==n&&(n.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING?r.insertBefore(n,e.nextSibling):r.insertBefore(n,e))},t.ontouchend=()=>{n&&a&&saveOrder(),resetDrag()},t.ontouchcancel=resetDrag)})}!async function restoreOrder(){try{var e=await(await fetch("/cgi/ThirdParty/fndesk/index.cgi/api/icon-sort")).json();if(e&&e.length){let n=Array.from(r.querySelectorAll(o));n.forEach(e=>e.remove()),e.forEach(t=>{var e=n.find(e=>getIconKey(e)===t);e&&r.appendChild(e)}),n.forEach(e=>{r.contains(e)||r.appendChild(e)})}}catch(e){console.error("从API读取图标排序数据失败:",e)}}(),bindDrag(),new MutationObserver(e=>{e.forEach(e=>{0<e.addedNodes.length&&bindDrag()})}).observe(r,{childList:!0})}}function addParentWindowButtons(){try{if(window.self!==window.top){var n,o,i,a=window.parent.document,r=a.querySelector(`iframe[src="${window.location.href}"]`)||[...a.querySelectorAll("iframe")].find(e=>{try{return e.contentWindow===window}catch(e){return!1}});if(r){let e=r.parentElement,t=null;for(;e&&!t&&((t=e.querySelector(":scope > .trim-ui__app-layout--header"))||(e=e.parentElement)!==a.body&&e!==a.documentElement););t&&(n=t.querySelector(":scope > div:last-child"))&&n.classList.contains("items-center")&&(a.getElementById("iframe-refresh-btn")?.remove(),a.getElementById("iframe-open-new-window-btn")?.remove(),o=createButton(a,"iframe-refresh-btn","刷新页面",`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>`,()=>{window.location.reload()},e=>{e.style.transform="rotate(90deg)"},e=>{e.style.transform="rotate(0deg)"}),i=createButton(a,"iframe-open-new-window-btn","新标签页打开",`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none" />
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4m-8-2l8-8m0 0v5m0-5h-5" />
            </svg>`,()=>{window.open(window.location.href,"_blank","noopener")},e=>{e.style.transform="scale(1.1)"},e=>{e.style.transform="scale(1)"}),n.insertBefore(o,n.firstChild),n.insertBefore(i,o.nextSibling))}}}catch(e){e.message.includes("cross-origin")||e.message.includes("permission")}}function getElementChain(e){var t=[];let n=e,o=0;for(;n&&o<10;)t.push({tag:n.tagName,className:n.className?.toString()?.substring(0,50)||"",id:n.id}),n=n.parentElement,o++;return t}function createButton(e,t,n,o,i,a,r){e=e.createElement("div");return e.id=t,e.title=n,e.className="flex h-full w-base shrink-0 cursor-pointer items-center justify-center px-[15px] text-[var(--semi-color-text-0)] hover:bg-[var(--semi-color-fill-0)] active:bg-[var(--semi-color-fill-0)]",e.style.transition="all 0.2s ease",e.innerHTML=o,e.onmouseenter=function(){this.style.backgroundColor="var(--semi-color-fill-0)",a(this)},e.onmouseleave=function(){this.style.backgroundColor="",r(this)},e.onclick=function(e){e.stopPropagation(),i()},e}function findHeaderForIframe(e){let t=e.parentElement,n=null;for(var o=e.ownerDocument;t&&!n&&((n=t.querySelector(":scope > .trim-ui__app-layout--header"))||(t=t.parentElement)!==o.body&&t!==o.documentElement););return n}function refreshIframe(e){let t=getCurrentIframeUrl(e);if(!t||"about:blank"===t)return!1;try{if(e.contentWindow&&e.contentWindow.location)try{return e.contentWindow.location.reload(),!0}catch(e){fndesk_log("[Fndesk] 刷新方式1失败(contentWindow reload): 跨域限制，尝试备用方案")}}catch(e){fndesk_log("[Fndesk] 刷新方式1异常:",e.message)}try{t;var n,o=new URL(t);return o.searchParams.set("_t",Date.now()),o.searchParams.set("_refresh",Math.random().toString(36).substr(2,9)),n=o.toString(),e.src=n,setTimeout(()=>{try{e.src===t||e.src.includes("_t=")||(e.src=t)}catch(e){}},5e3),!0}catch(e){fndesk_log("[Fndesk] 刷新方式2异常(URL处理):",e.message)}try{var i=t+(t.includes("?")?"&":"?")+"_cachebuster="+Date.now();return e.src=i,!0}catch(e){return fndesk_log("[Fndesk] 所有刷新方式均失败:",e.message),!1}}function getCurrentIframeUrl(e){try{if(e.contentWindow&&e.contentWindow.location)try{var t=e.contentWindow.location.href;if(t&&"about:blank"!==t)return t}catch(e){}}catch(e){}return e.src&&"about:blank"!==e.src?e.src:null}function addButtonToIframe(t){try{var e,n,o,i,a,r;return t.src&&"about:blank"!==t.src&&t.src.trim()?!(["/app/iconstation","/apps/","/MP3go/"].some(e=>t.src.toLowerCase().includes(e.toLowerCase()))||(e=t.ownerDocument,n="iframe-btns-"+(t.src.split("#")[0].split("?")[0].replace(/[^a-zA-Z0-9]/g,"").slice(-20)||Math.random().toString(36).substr(2,9)),e.getElementById(n+"-refresh"))||e.getElementById(n+"-newwindow")||!(o=findHeaderForIframe(t))||!(i=o.querySelector(":scope > div:last-child"))||!i.classList.contains("items-center")||(a=createButton(e,n+"-refresh","刷新页面",`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>`,()=>{refreshIframe(t)},e=>{e.style.transform="scale(1.3) rotate(90deg)"},e=>{e.style.transform="scale(1) rotate(0deg)"}),r=createButton(e,n+"-newwindow","新标签页打开",`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none" />
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4m-8-2l8-8m0 0v5m0-5h-5" />
            </svg>`,()=>{var e=getCurrentIframeUrl(t);e?window.open(e,"_blank","noopener"):window.open(t.src,"_blank","noopener")},e=>{e.style.transform="scale(1.5)"},e=>{e.style.transform="scale(1)"}),i.insertBefore(a,i.firstChild),i.insertBefore(r,a.nextSibling),0)):!1}catch(e){return!1}}function initGlobalIframeButtonObserver(){if(window.self!==window.top)addParentWindowButtons();else{let t=new WeakSet;function processAllIframes(){document.querySelectorAll("iframe").forEach(e=>{t.has(e)||(t.add(e),addButtonToIframe(e))})}processAllIframes(),new MutationObserver(e=>{let t=!1;e.forEach(e=>{e.addedNodes.forEach(e=>{1===e.nodeType&&("IFRAME"===e.tagName&&(t=!0),e.querySelectorAll)&&0<e.querySelectorAll("iframe").length&&(t=!0)})}),t&&setTimeout(()=>processAllIframes(),100)}).observe(document.body,{childList:!0,subtree:!0}),setInterval(processAllIframes,2e3)}}function FndeskapplyStyleOverride(){var e=document.createElement("style");e.id="style-override",e.textContent=`
        .\\!left-\\[66px\\] {
            left: 0px !important;
        }
        .\\!w-\\[calc\\(100\\%-66px\\)\\] {
            height: calc(100% - 53px) !important;
            width: calc(100% - 0px) !important;
        }
    `,document.head.appendChild(e)}function addTaskbarTimeOnly(){if(!document.getElementById("fndesk-taskbar-time")){var e=document.querySelector(".fixed.inset-y-0.left-0.z-\\[1\\] .flex.flex-col.items-center.justify-between.gap-5.pt-2");if(e){let n=document.createElement("div");n.id="fndesk-taskbar-time";var t={win98:`
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 6px;
            height: 100%;
            font-family: Tahoma, "MS Sans Serif", sans-serif;
            font-size: 11px;
            color: #000;
            border-top: 1px solid #ffffff;
            border-left: 1px solid #ffffff;
            border-right: 1px solid #000000;
            border-bottom: 1px solid #000000;
            box-shadow: inset -1px -1px #808080, inset 1px 1px #dfdfdf;
            cursor: default;
            user-select: none;
            white-space: nowrap;
            line-height: 1.3;
            min-width: fit-content;
        `,winxp:`
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 8px;
            height: 100%;
            font-family: Tahoma, Verdana, sans-serif;
            font-size: 12px;
            color: #fff;
            text-shadow: 0 1px 1px rgba(0,0,60,0.5);
            cursor: default;
            user-select: none;
            white-space: nowrap;
            min-width: fit-content;
        `};function updateTime(){var e=new Date,t=String(e.getHours()).padStart(2,"0"),e=String(e.getMinutes()).padStart(2,"0");n.textContent=t+":"+e}n.style.cssText=t[currentTheme]||t.win98,updateTime(),n.timeInterval=setInterval(updateTime,1e3),e.appendChild(n)}}}function addTaskbarTimeAndDate(){if(!document.getElementById("fndesk-taskbar-datetime")){var t=document.querySelector(".fixed.inset-y-0.left-0.z-\\[1\\] .flex.flex-col.items-center.justify-between.gap-5.pt-2");if(t){let e=document.createElement("div"),o=(e.id="fndesk-taskbar-datetime",document.createElement("span")),i=(o.id="fndesk-time-text",document.createElement("span"));i.id="fndesk-date-text",e.appendChild(o),e.appendChild(i);var n={win98:{container:`
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 0 6px;
                height: 100%;
                font-family: Tahoma, "MS Sans Serif", sans-serif;
                color: #000;
                border-top: 1px solid #808080;
                border-left: 1px solid #808080;
                border-right: 1px solid #ffffff;
                border-bottom: 1px solid #ffffff;
                box-shadow: inset 1px 1px #808080, inset -1px -1px #ffffff;
                cursor: default;
                user-select: none;
                line-height: 1.25;
                min-width: fit-content;
            `,time:"font-size: 13px; font-weight: bold;",date:"font-size: 12px;"},winxp:{container:`
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 0 8px;
                height: 100%;
                font-family: Tahoma, Verdana, sans-serif;
                color: #fff;
                cursor: default;
                user-select: none;
                line-height: 1.2;
                min-width: fit-content;
            `,time:"font-size: 13px; font-weight: bold; text-shadow: 0 1px 1px rgba(0,0,60,0.5);",date:"font-size: 12px; text-shadow: 0 1px 1px rgba(0,0,60,0.4);"},win7:{container:`
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 0 8px;
                height: 100%;
                font-family: "Segoe UI", Tahoma, sans-serif;
                color: #fff;
                cursor: default;
                user-select: none;
                line-height: 1.25;
                min-width: fit-content;
            `,time:"font-size: 13px; font-weight: 600; text-shadow: 0 1px 3px rgba(0,0,50,0.6);",date:"font-size: 12px; opacity: 0.9; text-shadow: 0 1px 2px rgba(0,0,50,0.5);"},win10:{container:`
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 0 10px;
                height: 100%;
                font-family: "Segoe UI", Tahoma, sans-serif;
                color: #fff;
                cursor: default;
                user-select: none;
                line-height: 1.2;
                transition: background 0.15s ease;
                border-radius: 4px;
                min-width: fit-content;
            `,time:"font-size: 13px; font-weight: 400;",date:"font-size: 12px; opacity: 0.85;"}},n=n[currentTheme]||n.win7;function updateDateTime(){var e=new Date,t=String(e.getHours()).padStart(2,"0"),n=String(e.getMinutes()).padStart(2,"0"),t=(o.textContent=t+":"+n,e.getFullYear()),n=String(e.getMonth()+1).padStart(2,"0"),e=String(e.getDate()).padStart(2,"0");i.textContent=t+`/${n}/`+e}e.style.cssText=n.container,o.style.cssText=n.time,i.style.cssText=n.date,"win98"===currentTheme&&isDarkMode()&&(e.style.color="#fff",o.style.color="#fff",i.style.color="#ddd",e.style.borderTopColor="#555",e.style.borderLeftColor="#555",e.style.borderRightColor="#aaa",e.style.borderBottomColor="#aaa",e.style.boxShadow="inset 1px 1px #444, inset -1px -1px #888"),"win10"===currentTheme&&(e.addEventListener("mouseenter",()=>{e.style.background="rgba(255,255,255,0.15)"}),e.addEventListener("mouseleave",()=>{e.style.background="transparent"})),updateDateTime(),e.timeInterval=setInterval(updateDateTime,1e3),t.appendChild(e)}}}function removeTaskbarTimeDisplay(){var e=document.getElementById("fndesk-taskbar-time"),e=(e&&(clearInterval(e.timeInterval),e.remove()),document.getElementById("fndesk-taskbar-datetime"));e&&(clearInterval(e.timeInterval),e.remove())}function initThemeFromStorage(){let e=localStorage.getItem(THEME_STORAGE_KEY);e&&"default"!==e&&setTimeout(()=>{switch(FndeskapplyStyleOverride(),e){case"mac":macSonomaStyleActive||toggleMacSonomaStyle();break;case"win10":win10StyleActive||toggleWin10Style();break;case"win11":win11StyleActive||toggleWin11Style();break;case"win98":win98StyleActive||toggleWin98Style();break;case"winxp":winXPStyleActive||toggleWinXPStyle();break;case"win7":win7StyleActive||toggleWin7Style()}},10)}(()=>{window._SYSTEM_WS_FOLDER_PATH=null;let t=window.WebSocket,n=240,a=".trim-ui__app-layout--window, .trim-ui-app-layout--window",r=null,s=0,o=null,i=0;function isVisible(e){return!!e&&e.isConnected&&null!==e.offsetParent}function normalizePath(e){return String(e||"").replace(/^\/+/,"").replace(/\/+$/,"")}function writePathToTopButton(e){var t=function resolveTopButton(){var e=performance.now();if(r&&isVisible(r)&&e-s<n)return r;var t=Array.from(document.querySelectorAll('[data-custom-new-file-btn="true"]')).filter(isVisible);if(0===t.length)return r=null,s=e,null;let o=-1,i=t[0];return t.forEach(e=>{var t=e.closest(a);let n=0;(n=t&&(t=window.getComputedStyle(t).zIndex,t=Number.parseInt(t,10),Number.isFinite(t))?t:n)>=o&&(o=n,i=e)}),r=i,s=e,i}();t&&function shouldSyncPath(e,t){return!(e=e.closest(a))||!(e=Array.from(e.querySelectorAll("input.semi-input")).find(e=>{e=e.value;return e&&e.startsWith("/")&&!e.includes("搜索")}))||normalizePath(e.value)===normalizePath(t)}(t,e)&&t.setAttribute("data-current-path",e)}function extractFolderPath(e){if("string"==typeof e){var t=function extractFolderPathFromStr(e){return"string"==typeof e&&(e=e.match(/["']path["']\s*:\s*["']([^"']+)["']/))&&e[1]?e[1]:null}(e);if(t)return t;try{var n=JSON.parse(e);if("string"==typeof n?.path)return n.path;if("string"==typeof n?.req?.path)return n.req.path}catch(e){}}else if(e&&"object"==typeof e){if("string"==typeof e.path)return e.path;if("string"==typeof e.req?.path)return e.req.path}return null}function queuePathUpdate(e){"string"==typeof e&&e&&(o=e,i=i||requestAnimationFrame(()=>{var e;i=0,o&&(e=o,o=null,writePathToTopButton(window._SYSTEM_WS_FOLDER_PATH=e))}))}window.WebSocket=function(e,o){o=new t(e,o);let n="string"==typeof e&&(e.includes("websocket?type=file")||e.includes("type=file"));if(n||!firstLoggedUser){let t=!firstLoggedUser;if(o.addEventListener("message",function(e){hasOutputLog||(logActiveUserNames(e.data),firstLoggedUser&&!t)||firstLoggedUser&&(t=!1),n&&(e=extractFolderPath(e.data))&&queuePathUpdate(e)}),n){let n=o.send;o.send=function(e){var t=extractFolderPath(e);return t&&queuePathUpdate(t),n.call(this,e)}}}return o},Object.assign(window.WebSocket,t),window.WebSocket.prototype=t.prototype})();