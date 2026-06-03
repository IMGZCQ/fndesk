((a,c)=>{let l={isNoExtensionFile:function(e){return!!e&&(!(e=e.toLowerCase()).includes(".")||e.endsWith("."))},detectFileType:function(e){if(!e)return{type:"unknown",confidence:0};var t,i=e.toLowerCase();for(t of[{type:"makefile",patterns:["makefile","makefile.unix","makefile.win"],confidence:90}])for(var r of t.patterns)if(i.includes(r))return{type:t.type,confidence:t.confidence};return{type:"text",confidence:50}},getFileIcon:function(e){var t={makefile:"📋"};return t[e]||t.unknown}},e={init:function(){this.hookIntoFileManager(),this.addStyles(),this.addGlobalModalInterceptor(),this.addContextMenuListener()},hookIntoFileManager:function(){let r=this;c.addEventListener("click",function(e){var t,i=e.target.closest("tr.trim-os__file-manager--item");i&&i.hasAttribute("data-path")&&(t=r.getFileName(i),l.isNoExtensionFile(t))&&!r.isFolder(i)&&(e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),r.handleFileClick(i,e))},!0),c.addEventListener("dblclick",function(e){var t,i=e.target.closest("tr.trim-os__file-manager--item");i&&i.hasAttribute("data-path")&&(t=r.getFileName(i),l.isNoExtensionFile(t))&&!r.isFolder(i)&&(e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),r.handleFileDoubleClick(i,e))},!0)},handleFileClick:function(e,t){var i;this.isFolder(e)||(i=this.getFileName(e),l.isNoExtensionFile(i)&&(this.showFileInfo(e,i),setTimeout(()=>{c.querySelector(".file-preview-modal")},10)))},handleFileDoubleClick:function(e,t){var i;this.isFolder(e)||(i=this.getFileName(e),l.isNoExtensionFile(i)&&this.simulateTxtFileOpen(e,i,t))},isFolder:function(e){var t=this.getFileName(e);e.getAttribute("data-path");if(!t.includes(".")){if(e.classList.contains("trim-os__file-manager--dir"))return!0;var i=e.querySelector("img");if(i)if(i.src.toLowerCase().includes("folder"))return!0;i=e.querySelector("td:nth-child(3) .text-text-0");if(i){i=i.getAttribute("title")||i.textContent.trim();if("文件夹"===i||i.includes("folder")||i.includes("directory"))return!0;if("无后缀名文件"===i)return!1}if(e.classList.contains("folder")||e.classList.contains("directory")||e.classList.contains("trim-folder"))return!0;i=e.getAttribute("data-type");if(i&&(i.includes("folder")||i.includes("directory")))return!0;["manifest","readme","license","changelog","makefile","dockerfile"].includes(t.toLowerCase())}return!1},getFileName:function(e){var t=e.getAttribute("data-path");return t?t.split("/").pop():(t=e.querySelector(".text-text-0[title]"))?t.getAttribute("title")||t.textContent.trim():e.textContent.trim()},openNoExtensionFile:function(e,t){var i=l.detectFileType(t);this.showFilePreviewDialog(e,t,i)},showFilePreviewDialog:function(e,t,i){var r=c.createElement("div");r.className="file-preview-modal",r.innerHTML=`
                <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            `,c.body.appendChild(r),a.FileManagerEnhancer=this},getSuggestedAction:function(e){var t={makefile:"使用文本编辑器查看"};return t[e]||t.unknown},addGlobalModalInterceptor:function(){var e=new MutationObserver(function(e){e.forEach(function(e){e.addedNodes.forEach(function(e){var t;1===e.nodeType&&e.classList&&e.classList.contains("semi-modal-content")&&(t=e.querySelector(".semi-modal-confirm-content"))&&t.textContent.includes("暂不支持打开当前格式的文件")&&e.remove()})})});e.observe(c.body,{childList:!0,subtree:!0}),this.modalObserver=e},addStyles:function(){var e;c.getElementById("file-manager-enhancer-styles")||((e=c.createElement("style")).id="file-manager-enhancer-styles",c.head.appendChild(e))},addContextMenuListener:function(){let i=this;c.addEventListener("contextmenu",function(t){if(t.target.closest('[class*="file-manager"]')||t.target.closest("table")){let e=t.target.closest("tr.trim-os__file-manager--item");setTimeout(()=>{i.addContextMenuItem(e)},10)}},!0)},addContextMenuItem:function(r){var e,t=c.querySelector(".base-Popper-root");t&&!t.querySelector(".all-editor-menu-item")&&((e=c.createElement("div")).className="relative all-editor-menu-item",e.innerHTML='<div class="" title=""><div class="my-super-tight flex items-center justify-between px-4 py-2 relative w-full text-[12px] box-border cursor-pointer whitespace-nowrap hover:bg-[var(--semi-color-fill-0)]"><span class="flex w-full max-w-[170px] overflow-hidden text-ellipsis"><span class="inline-flex w-full flex-1 items-center gap-2"><span class="truncate text-[14px] leading-xs w-full"><div class="flex w-[150px] items-center"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" class="text-[16px] mr-[8px] shrink-0"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 2a8 8 0 105.292 14.000l5.36 5.36a1 1 0 001.414-1.414l-5.36-5.36A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg><span>万能编辑器中打开</span></div></span></span></span></div></div></div>',e.addEventListener("click",e=>{let t=this.getBaseServerUrl()+"/cgi/ThirdParty/all.editor/index.cgi";var i;r&&r.hasAttribute("data-path")&&(i=r.getAttribute("data-path"),this.getFileName(r),t=this.isFolder(r)?`${t}?path=${encodeURIComponent(i)}&type=folder`:`${t}?path=${encodeURIComponent(i)}&type=file`),a.open(t,"_blank")}),0<(t=t.querySelectorAll('[role="menuitem"]')).length)&&t[t.length-1].parentNode.appendChild(e)},openAsText:function(e){var t=c.getElementById("file-preview-area");t&&(t.innerHTML=`
                <h4>📄 文本文件内容预览</h4>
                <p><em>这将使用内置文本查看器打开文件</em></p>
                <p><strong>文件:</strong> ${e}</p>
                <p>实际实现中，这里会显示文件内容或调用原系统的文本查看器。</p>
            `)},simulateTxtFileOpen:function(e,t,i){i&&(i.preventDefault(),i.stopPropagation(),i.stopImmediatePropagation());i=e.getAttribute("data-path"),e=this.getBaseServerUrl()+"/cgi/ThirdParty/all.editor/index.cgi?path=/"+encodeURIComponent(i);this.openOriginalTextPreview(e,t,i)},getBaseServerUrl:function(){var e=a.location.href,e=new URL(e);return e.protocol+"//"+e.host},getCurrentDirectory:function(){var e=c.querySelector("tr.trim-os__file-manager--item[data-path]");return e?(e=e.getAttribute("data-path"),this.getDirname(e)):(e=a.location.hash)&&e.startsWith("#/")?decodeURIComponent(e.substring(1)):new URLSearchParams(a.location.search).get("path")||"/"},getDirname:function(e){var t;return e&&0<(t=(e=e.endsWith("/")?e.slice(0,-1):e).lastIndexOf("/"))?e.substring(0,t+1):"/"},openOriginalTextPreview:function(e,t,i){var r=c.createElement("div");r.className="w-[1100px] h-[640px] absolute flex flex-col overflow-hidden shadow-[var(--semi-shadow-app)] trim-ui__app-layout--window is-resizable",r.style.cssText=`
            width: 1100px;
            height: 665px;
            border-radius: 16px;
            z-index: 10011;
            left: 181px;
            top: 128.5px;
            position: fixed;
            background: white;
        `,r.innerHTML=`
            <div class="trim-ui__app-layout--background absolute inset-0 z-[-1] overflow-hidden bg-[var(--semi-color-app)]"></div>
            
            <div class="trim-ui__app-layout--header box-border flex h-[44px] w-full shrink-0 cursor-move justify-between bg-app-header">
                <div class="trim-ui__app-layout--header-title m-0 box-border flex w-full flex-1 items-center overflow-hidden pl-4 pr-9 text-[14px] font-[400]">
                    <div class="h-loose flex items-center w-full">
                        <img src="/app-center-static/serviceicon/all.editor/ui/images/icon_{0}.png?size=256" alt="万能编辑器" class="size-loose mr-2 block select-none pointer-events-none">
                        <span class="max-w-full truncate leading-5 font-[600] text-[var(--semi-color-text-0)]">万能编辑器</span>
                    </div>
                </div>
                <div class="flex items-center">
                    <div class="flex h-full w-base shrink-0 cursor-pointer items-center px-[15px] text-[var(--semi-color-text-0)] hover:bg-[var(--semi-color-fill-0)] active:bg-[var(--semi-color-fill-0)] app-layout-header-minimize">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 11a1 1 0 110 2H3a1 1 0 110-2h18z"></path>
                        </svg>
                    </div>
                    <div class="flex h-full w-base shrink-0 cursor-pointer items-center px-[15px] text-[var(--semi-color-text-0)] hover:bg-[var(--semi-color-fill-0)] active:bg-[var(--semi-color-fill-0)] app-layout-header-maximize">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.2591 2.66663H12.7406C12.8977 2.66663 13.0485 2.72906 13.1596 2.84019C13.2707 2.95132 13.3332 3.10205 13.3332 3.25922V12.7407C13.3332 12.8979 13.2707 13.0486 13.1596 13.1597C13.0485 13.2709 12.8977 13.3333 12.7406 13.3333H3.2591C3.10193 13.3333 2.9512 13.2709 2.84007 13.1597C2.72894 13.0486 2.6665 12.8979 2.6665 12.7407V3.25922C2.6665 3.10205 2.72894 2.95132 2.84007 2.84019C2.9512 2.72906 3.10193 2.66663 3.2591 2.66663ZM3.85169 3.85181V12.1481H12.148V3.85181H3.85169Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <div class="flex h-full w-base shrink-0 cursor-pointer items-center px-[15px] text-[var(--semi-color-text-0)] hover:bg-[var(--semi-color-danger)] active:bg-[var(--semi-color-danger)] app-layout-header-close hover:!text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.293 5.293a1 1 0 011.414 0L12 10.586l5.293-5.293a1 1 0 111.414 1.414L13.414 12l5.293 5.293a1 1 0 01-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 01-1.414-1.414L10.586 12 5.293 6.707a1 1 0 010-1.414z"></path>
                        </svg>
                    </div>
                </div>
            </div>
            
            <div class="relative h-[calc(100%-44px)]">
                <div class="relative size-full">
                    <iframe src="${e}" style="width: 100%; height: 100%; border: none;" 
                            onerror="this.parentElement.innerHTML='<div style="padding: 20px; text-align: center; color: #666; height: 100%; display: flex; align-items: center; justify-content: center;">文件预览加载失败，请检查文件是否存在或权限设置。</div>'">
                    </iframe>
                </div>
            </div>
            
            <!-- 可调整大小的句柄 -->
            <div class="resizable-handler t"></div>
            <div class="resizable-handler rt"></div>
            <div class="resizable-handler r"></div>
            <div class="resizable-handler rb"></div>
            <div class="resizable-handler b"></div>
            <div class="resizable-handler lb"></div>
            <div class="resizable-handler l"></div>
            <div class="resizable-handler lt"></div>
        `;let l=c.createElement("style");l.textContent=`
            .trim-ui__app-layout--window {
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }

            .app-layout-header-close:hover {
                background: #dc2626 !important;
                color: white !important;
            }

            /* 可调整大小句柄样式 */
            .resizable-handler {
                position: absolute;
                background: transparent;
                z-index: 10;
            }
            
            .resizable-handler.t {
                top: -3px;
                left: 0;
                right: 0;
                height: 6px;
                cursor: n-resize;
            }
            
            .resizable-handler.rt {
                top: -3px;
                right: -3px;
                width: 6px;
                height: 6px;
                cursor: ne-resize;
            }
            
            .resizable-handler.r {
                top: 0;
                right: -3px;
                width: 6px;
                bottom: 0;
                cursor: e-resize;
            }
            
            .resizable-handler.rb {
                bottom: -3px;
                right: -3px;
                width: 6px;
                height: 6px;
                cursor: se-resize;
            }
            
            .resizable-handler.b {
                bottom: -3px;
                left: 0;
                right: 0;
                height: 6px;
                cursor: s-resize;
            }
            
            .resizable-handler.lb {
                bottom: -3px;
                left: -3px;
                width: 6px;
                height: 6px;
                cursor: sw-resize;
            }
            
            .resizable-handler.l {
                top: 0;
                left: -3px;
                width: 6px;
                bottom: 0;
                cursor: w-resize;
            }
            
            .resizable-handler.lt {
                top: -3px;
                left: -3px;
                width: 6px;
                height: 6px;
                cursor: nw-resize;
            }
        `,c.head.appendChild(l),c.body.appendChild(r),this.addWindowControls(r),r.addEventListener("remove",()=>{c.head.contains(l)&&c.head.removeChild(l)})},addWindowControls:function(s){var d=s.querySelector(".app-layout-header-close"),d=(d&&d.addEventListener("click",()=>{s.remove()}),s.querySelector(".app-layout-header-minimize")),d=(d&&d.addEventListener("click",()=>{s.style.transform="scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.style.display="none"},200)}),s.querySelector(".app-layout-header-maximize"));if(d){let e=!1,t={};d.addEventListener("click",()=>{e=e?(s.style.left=t.left,s.style.top=t.top,s.style.width=t.width,s.style.height=t.height,!(s.style.borderRadius="16px")):(t={left:s.style.left,top:s.style.top,width:s.style.width,height:s.style.height},s.style.left="0px",s.style.top="0px",s.style.width="100vw",s.style.height="100vh",s.style.borderRadius="0px",!0)})}let t=e=>{"Escape"===e.key&&(s.remove(),c.removeEventListener("keydown",t))};c.addEventListener("keydown",t);d=s.querySelector(".trim-ui__app-layout--header");if(d){let i=!1,r,l,a,n,t=(d.addEventListener("mousedown",e=>{i=!0,r=e.clientX,l=e.clientY,a=parseInt(s.style.left)||0,n=parseInt(s.style.top)||0,c.addEventListener("mousemove",t),c.addEventListener("mouseup",o)}),e=>{var t;i&&(t=e.clientX-r,e=e.clientY-l,s.style.left=a+t+"px",s.style.top=n+e+"px")}),o=()=>{i=!1,c.removeEventListener("mousemove",t),c.removeEventListener("mouseup",o)}}},simulateOriginalTxtHandling:function(t,e,i){let r=t.getAttribute("data-path");var l=r+".txt";t.setAttribute("data-path",l),setTimeout(()=>{var e=new MouseEvent("dblclick",{bubbles:!0,cancelable:!0,view:a});t.dispatchEvent(e),setTimeout(()=>{t.setAttribute("data-path",r)},100)},10)},openAsTextFile:function(e,t){this.simulateTxtFileOpen(e,t,null)},downloadFile:function(e){alert(`正在下载文件: ${e}

实际实现中，这里会触发文件下载。`)},renameFile:function(e){var t=prompt("请输入新的文件名（包含扩展名）:",e);t&&t!==e&&alert(`正在重命名文件:
从: ${e}
到: ${t}

实际实现中，这里会调用原系统的重命名功能。`)}};"loading"===c.readyState?c.addEventListener("DOMContentLoaded",function(){e.init()}):e.init(),a.FileManagerEnhancer=e,a.FileTypeDetector=l})(window,document);