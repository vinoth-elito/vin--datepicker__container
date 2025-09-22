
const htmlEditor = document.getElementById('html-editor');
const cssEditor = document.getElementById('css-editor');
const jsEditor = document.getElementById('js-editor');
const livePreview = document.getElementById('live-preview');
async function updatePreview() {
    const doc = livePreview.contentDocument || livePreview.contentWindow.document;
    doc.open();
    doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
    doc.close();
    const styleEl = doc.createElement('style');
    styleEl.textContent = cssEditor.value;
    doc.head.appendChild(styleEl);
    doc.body.innerHTML = htmlEditor.value;
    const cacheBuster = Date.now();
    const faLink = doc.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css?v=${cacheBuster}`;
    doc.head.appendChild(faLink);
    try {
        const cssUrl = `https://cdn.jsdelivr.net/gh/vinoth-elito/vin--datepicker__container@main/css/preview.css?v=${cacheBuster}`;
        const res = await fetch(cssUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const cssText = await res.text();
        const previewStyle = doc.createElement('style');
        previewStyle.textContent = cssText;
        doc.head.appendChild(previewStyle);
    } catch (err) {
        console.error("Failed to load preview.css:", err);
    }
    const jq = doc.createElement('script');
    jq.src = `https://code.jquery.com/jquery-3.7.1.min.js?v=${cacheBuster}`;
    doc.body.appendChild(jq);
    jq.onload = () => {
        const scriptEl = doc.createElement('script');
        scriptEl.textContent = jsEditor.value;
        doc.body.appendChild(scriptEl);
        const codeScript = doc.createElement('script');
        const initScript = doc.createElement('script');
        const clickFocusScript = doc.createElement('script');
        initScript.textContent = `
                    if (typeof initVinDatePickers === 'function') {
                        initVinDatePickers();
                    }
                `;
        doc.body.appendChild(initScript);
        const handlers = {
            ".vindatetimepicker input": "showDateTimePicker",
            ".vindatepicker input": "showDatePicker",
            ".vinmonthyearpicker input": "showMonthYearPicker",
            ".vintimepicker input": "showTimePicker",
            ".vindatepicker input": "showDatePicker"
        };

        const clickScript = doc.createElement('script');
        let handlerCode = '';
        for (const selector in handlers) {
            const funcName = handlers[selector];
            handlerCode += `
                        $("body").on("click", "${selector}", function () {
                            let $input = $(this);
                            if (typeof ${funcName} === "function") {
                                ${funcName}($input);
                            }
                        });
                    `;
        }
        handlerCode += `
                    $("body").on("focus", ".vindaterange--from__date, .vindaterange--to__date", function () {
                        let $input = $(this);
                        if (typeof showDateRangePicker === "function") {
                            showDateRangePicker($input);
                        }
                    });
                `;
        clickScript.textContent = handlerCode;
        clickFocusScript.textContent = handlerCode;
        doc.body.appendChild(clickFocusScript);
        doc.body.appendChild(clickScript);
        codeScript.textContent = `
                    window.componentFunctionMap = window.componentFunctionMap || {
                        '.vindatepicker': {
                            func: 'showDatePicker',
                            funccommon: 'initVinDatePickers',
                            event: '$("body").on("click", ".vindatepicker input", function () {' +
                                'let $input = $(this);' +
                                'showDatePicker($input);' +
                                '});'
                        },
                        '.vintimepicker': {
                            func: 'showTimePicker',
                            funccommon: 'initVinDatePickers',
                            event: '$("body").on("click", ".vintimepicker input", function () {' +
                                'let $input = $(this);' +
                                'showTimePicker($input);' +
                                '});'
                        },
                        '.vindatetimepicker': {
                            func: 'showDateTimePicker',
                            funccommon: 'initVinDatePickers',
                            event: '$("body").on("click", ".vindatetimepicker input", function () {' +
                                'let $input = $(this);' +
                                'showDateTimePicker($input);' +
                                '});'
                        },
                        '.vinmonthyearpicker': {
                            func: 'showMonthYearPicker',
                            funccommon: 'initVinDatePickers',
                            event: '$("body").on("click", ".vinmonthyearpicker input", function () {' +
                                'let $input = $(this);' +
                                'showMonthYearPicker($input);' +
                                '});'
                        },
                        '.vindaterangepicker': {
                            func: 'showDateRangePicker',
                            funccommon: 'initVinDatePickers',
                            event: '$(".vindaterange--from__date, .vindaterange--to__date").on("focus", function () {' +
                                'showDateRangePicker($(this));' +
                                '});'
                        },
                    };
                    function getPickerCode(selector) {
                        const picker = window.componentFunctionMap[selector];
                        if (!picker) return '';
                        let code = '';
                        if (picker.func1) code += "func1: '" + picker.func1 + "', ";
                        if (picker.func) code += "func: '" + picker.func + "', ";
                        if (picker.event) code += "event: '" + picker.event + "'";
                        return code;
                    }
                    function highlightCopiedState(openContainer, pre) {
                        const activeTab = openContainer.querySelector('.tab-btn.active');
                        if (!activeTab) return;
                        const originalTabHTML = activeTab.innerHTML;
                        const originalTabBg = activeTab.style.background;
                        const originalTabColor = activeTab.style.color;
                        const originalPreBg = pre.style.background;
                        activeTab.innerHTML = '<i class="fa fa-check" style="color:#fff;"></i> Copied!';
                        activeTab.style.background = '#28a745';
                        activeTab.style.color = '#fff';
                        setTimeout(() => {
                            activeTab.innerHTML = originalTabHTML;
                            activeTab.style.background = originalTabBg;
                            activeTab.style.color = originalTabColor;
                            pre.style.background = originalPreBg;
                        }, 1500);
                    }
                    window.getFunctionText = window.getFunctionText || function(jsCode, funcName) {
                        const funcStart = jsCode.indexOf('function ' + funcName + '(');
                        if (funcStart === -1) return '';
                        let i = funcStart;
                        let braceCount = 0;
                        let inString = false;
                        let stringChar = '';
                        let escapeNext = false;
                        for (; i < jsCode.length; i++) {
                            const char = jsCode[i];
                            if (escapeNext) { escapeNext = false; continue; }
                            if (inString) {
                                if (char === '\\\\') escapeNext = true;
                                else if (char === stringChar) inString = false;
                            } else {
                                if (char === '"' || char === "'" || char === '\\\`') {
                                    inString = true;
                                    stringChar = char;
                                } else if (char === '{') braceCount++;
                                else if (char === '}') {
                                    braceCount--;
                                    if (braceCount === 0) return jsCode.substring(funcStart, i + 1);
                                }
                            }
                        }
                        return '';
                    };
                    document.addEventListener('click', function (e) {
                        const target = e.target.closest('[data-target]');
                        const allContainers = document.querySelectorAll('.view-code-container');
                        const allViewCodeBtns = document.querySelectorAll('.view-code-btn');
                        if (
                            !target &&
                            !e.target.closest('.view-code-container') &&
                            !e.target.closest('.editors') &&
                            !e.target.closest('#html-editor') &&
                            !e.target.closest('#css-editor') &&
                            !e.target.closest('#js-editor')
                        ) {
                            allContainers.forEach(c => {
                                if (c.classList.contains('show')) {
                                    c.classList.remove('show');
                                    c.addEventListener('transitionend', function handler(ev) {
                                        if (ev.propertyName === 'transform') {
                                            c.style.display = 'none';
                                            c.removeEventListener('transitionend', handler);
                                        }
                                    });
                                }
                            });
                            allViewCodeBtns.forEach(btn => btn.setAttribute('data-tooltip', 'Get Code'));
                            return;
                        }
                        if (target) {
                            const selector = target.getAttribute('data-target');
                            const container = target.closest('.input__col');
                            if (!container) return;
                            const codeDivClass = 'view-code-container';
                            let codeContainer = container.querySelector('.' + codeDivClass);
                            allContainers.forEach(c => {
                                if (c !== codeContainer && c.classList.contains('show')) {
                                    c.classList.remove('show');
                                    c.addEventListener('transitionend', function handler(ev) {
                                        if (ev.propertyName === 'transform') {
                                            c.style.display = 'none';
                                            c.removeEventListener('transitionend', handler);
                                        }
                                    });
                                }
                            });
                            if (!codeContainer) {
                                codeContainer = document.createElement('div');
                                codeContainer.className = codeDivClass;
                                codeContainer.style.display = 'block';
                                const tabs = document.createElement('div');
                                tabs.className = 'code-tabs';
                                tabs.style.display = 'flex';
                                tabs.style.borderBottom = '1px solid #ccc';
                                tabs.style.marginBottom = '5px';
                                tabs.style.position = 'relative';
                                const htmlTab = document.createElement('button');
                                htmlTab.textContent = 'HTML';
                                htmlTab.className = 'tab-btn active';
                                const cssTab = document.createElement('button');
                                cssTab.textContent = 'CSS';
                                cssTab.className = 'tab-btn';
                                const jsTab = document.createElement('button');
                                jsTab.textContent = 'JS';
                                jsTab.className = 'tab-btn';
                                tabs.appendChild(htmlTab);
                                tabs.appendChild(cssTab);
                                tabs.appendChild(jsTab);
                                const indicator = document.createElement('div');
                                indicator.className = 'tab-indicator';
                                indicator.style.position = 'absolute';
                                indicator.style.bottom = '0';
                                indicator.style.transition = 'transform 0.3s ease, width 0.3s ease';
                                tabs.appendChild(indicator);
                                codeContainer.appendChild(tabs);
                                function createTabWrapper(tabName, content, pickerSelector = '') {
                                    const wrapper = document.createElement('div');
                                    wrapper.style.display = tabName === 'HTML' ? 'block' : 'none';
                                    wrapper.style.position = 'relative';
                                    const pre = document.createElement('pre');
                                    pre.style.whiteSpace = 'pre-wrap';
                                    pre.style.fontFamily = 'monospace';
                                    pre.style.padding = '10px';
                                    pre.style.border = '1px solid #ccc';
                                    if (tabName === 'JS' && pickerSelector) {
                                        pre.textContent = getPickerCode(pickerSelector);
                                    } else {
                                        pre.textContent = content;
                                    }
                                    const copyBtn = document.createElement('button');
                                    copyBtn.innerHTML = '<i class="fa fa-copy"></i> Copy Code';
                                    Object.assign(copyBtn.style, {
                                        position: 'absolute',
                                        top: '-13px',
                                        right: '30px',
                                        fontSize: '12px',
                                        color: '#fff',
                                        background: '#111',
                                        border: 'none',
                                        padding: '3px 15px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'background 0.3s'
                                    });
                                copyBtn.addEventListener('click', () => { 
                                    let codeToCopy = ''; 
                                    if (tabName === 'HTML') codeToCopy = "\\x3C!-- HTML --\\x3E\\n" + pre.textContent; 
                                    if (tabName === 'CSS') codeToCopy = "/* CSS */\\n" + pre.textContent; 
                                    if (tabName === 'JS') codeToCopy = "// JS\\n" + pre.textContent; 
                                    navigator.clipboard.writeText(codeToCopy).then(() => { 
                                    const openContainer = copyBtn.closest('.view-code-container'); 
                                    highlightCopiedState(openContainer, pre); 
                                    const originalHTML = copyBtn.innerHTML; 
                                    copyBtn.innerHTML = '<i class="fa fa-check" style="color:green;"></i> Copied!'; 
                                    copyBtn.style.cursor = 'not-allowed'; 
                                    copyBtn.style.pointerEvents = 'none'; 
                                    setTimeout(() => { 
                                        copyBtn.innerHTML = originalHTML; 
                                        copyBtn.style.cursor = 'pointer'; 
                                        copyBtn.style.pointerEvents = 'auto';
                                        }, 2000); 
                                    }); 
                                    }); 
                                    wrapper.appendChild(pre); 
                                    wrapper.appendChild(copyBtn); 
                                    return wrapper; 
                                }
                                const htmlContent = container.querySelector(selector)?.outerHTML || '';
                                const cssContent = window.parent.document.getElementById('css-editor')?.value || '';
                                const jsContent = '';
                                const htmlTabContent = createTabWrapper('HTML', htmlContent);
                                const cssTabContent = createTabWrapper('CSS', cssContent);
                                const jsTabContent = createTabWrapper('JS', jsContent, selector);
                                codeContainer.appendChild(htmlTabContent);
                                codeContainer.appendChild(cssTabContent);
                                codeContainer.appendChild(jsTabContent);
                                function moveIndicator(activeBtn) {
                                    const rect = activeBtn.getBoundingClientRect();
                                    const parentRect = tabs.getBoundingClientRect();
                                    const left = rect.left - parentRect.left;
                                    indicator.style.width = rect.width + 'px';
                                    indicator.style.transform = 'translateX(' + left + 'px)';
                                }
                                setTimeout(() => moveIndicator(htmlTab), 50);
                                function activateTab(tab, targetWrapper, content) {
                                    [htmlTab, cssTab, jsTab].forEach(btn => btn.classList.remove('active'));
                                    tab.classList.add('active');
                                    moveIndicator(tab);
                                    [htmlTabContent, cssTabContent, jsTabContent].forEach(w => w.style.display = 'none');
                                    targetWrapper.style.display = 'block';
                                    targetWrapper.querySelector('pre').textContent = content;
                                }
                                htmlTab.addEventListener('click', () => activateTab(htmlTab, htmlTabContent, htmlContent));
                                cssTab.addEventListener('click', () => {
                                    const cssEditorContent = window.parent.document.getElementById('css-editor')?.value || '';
                                    activateTab(cssTab, cssTabContent, cssEditorContent);
                                });
                               jsTab.addEventListener('click', () => {
                                    const comp = window.componentFunctionMap[selector] || {};
                                    const jsEditorContent = window.parent.document.getElementById('js-editor')?.value || '';
                                    let finalCode = '';
                                    if (comp.func) {
                                        const funcText = getFunctionText(jsEditorContent, comp.func);
                                        if (funcText) finalCode += funcText + "\\n";
                                        else finalCode += comp.func + "\\n";
                                    }
                                    
                                     if (comp.funccommon) {
                                        const funccommonText = getFunctionText(jsEditorContent, comp.funccommon);
                                        if (funccommonText) finalCode += funccommonText + "\\n";
                                        else finalCode += comp.funccommon + "\\n";
                                         finalCode += "$(document).ready(function() { " + comp.funccommon + "(); });\\n\\n";
                                    }

                                    if (comp.event) finalCode += comp.event + "\\n";
                                    activateTab(jsTab, jsTabContent, finalCode);
                                });
                                container.appendChild(codeContainer);
                                requestAnimationFrame(() => codeContainer.classList.add('show'));
                                allViewCodeBtns.forEach(btn => btn.setAttribute('data-tooltip', 'Get Code'));
                                target.setAttribute('data-tooltip', 'Hide Code');
                            } else {
                                if (codeContainer.classList.contains('show')) {
                                    codeContainer.classList.remove('show');
                                    allViewCodeBtns.forEach(btn => btn.setAttribute('data-tooltip', 'Get Code'));
                                    codeContainer.addEventListener('transitionend', function handler(ev) {
                                        if (ev.propertyName === 'transform') {
                                            codeContainer.style.display = 'none';
                                            codeContainer.removeEventListener('transitionend', handler);
                                        }
                                    });
                                } else {
                                    document.querySelectorAll('.view-code-container.show').forEach(c => {
                                        c.classList.remove('show');
                                        c.style.display = 'none';
                                    });
                                    codeContainer.style.display = 'block';
                                    requestAnimationFrame(() => codeContainer.classList.add('show'));
                                    allViewCodeBtns.forEach(btn => btn.setAttribute('data-tooltip', 'Get Code'));
                                    target.setAttribute('data-tooltip', 'Hide Code');
                                }
                            }
                        }
                    });
                    document.addEventListener('keydown', function (e) {
                        const openContainer = document.querySelector('.view-code-container.show');
                        if (!openContainer) return;
                        const activeTab = openContainer.querySelector('.tab-btn.active');
                        if (!activeTab) return;
                        const pre = Array.from(openContainer.querySelectorAll('pre')).find(p => p.offsetParent !== null);
                        if (!pre) return;
                        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                            const range = document.createRange();
                            range.selectNodeContents(pre);
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);
                            e.preventDefault();
                        }
                        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
                            const selectedText = window.getSelection().toString();
                            let codeToCopy = selectedText;
                            if (!codeToCopy.trim()) {
                                codeToCopy = pre.textContent;
                            }
                            const tabName = activeTab.textContent.trim();
                            if (tabName === 'HTML') codeToCopy = "\\x3C!-- HTML --\\x3E\\n" + codeToCopy;
                            else if (tabName === 'CSS') codeToCopy = "/* CSS */\\n" + codeToCopy;
                            else if (tabName === 'JS') codeToCopy = "// JS\\n" + codeToCopy;
                            navigator.clipboard.writeText(codeToCopy).then(() => {
                                highlightCopiedState(openContainer, pre);
                            });
                        }
                    });
                `;
        doc.body.appendChild(codeScript);
    };
}
htmlEditor.addEventListener('input', updatePreview);
cssEditor.addEventListener('input', updatePreview);
jsEditor.addEventListener('input', updatePreview);
updatePreview();
function handleEditorResize() {
    const container = document.querySelector(".editor-container");
    if (!container) return;
    const editors = container.querySelector(".editors");
    if (window.innerWidth >= 1025) {
        container.classList.add("desktop-mode");
        container.classList.remove("mobile-mode");
        setupSidebarResize(".editor-left");
        setupCenterResize(".editor-center");
        setupEditorRightResize();
        const viewSwitcherBtn = document.getElementById("view-switcher-button");
        const switchWrapper = document.querySelector(".editors--switch");
        let currentLayout = "editor-left";
        if (viewSwitcherBtn && !viewSwitcherBtn.dataset.listenerAdded) {
            viewSwitcherBtn.dataset.listenerAdded = "true";
            viewSwitcherBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                if (!switchWrapper) return;
                const existingDropdown = switchWrapper.querySelector(".view-switcher-dropdown");
                if (existingDropdown) {
                    existingDropdown.classList.remove("dropdown-show");
                    existingDropdown.classList.add("dropdown-hide");
                    setTimeout(() => existingDropdown.remove(), 300);
                    return;
                }
                const dropdown = document.createElement("div");
                dropdown.className = "view-switcher-dropdown dropdown-show";
                dropdown.style.position = "absolute";
                dropdown.style.top = "100%";
                dropdown.style.right = "0";
                dropdown.style.background = "#fff";
                dropdown.style.border = "1px solid #ccc";
                dropdown.style.borderRadius = "6px";
                dropdown.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
                dropdown.style.padding = "5px 30px";
                dropdown.style.zIndex = 999;
                dropdown.style.minWidth = "160px";
                dropdown.style.transformOrigin = "top center";
                const options = [
                    {
                        id: "editor-left",
                        label: "Editor Left",
                        icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="EditorHeaderViewSwitcherLayoutButtons-module_newPenLeftLayout-PhHzQ" width="20" height="20"><path d="M0 9.002C0 8.45.455 8 .992 8h18.016c.548 0 .992.456.992 1.002v9.996c0 .553-.455 1.002-.992 1.002H.992C.444 20 0 19.544 0 18.998zm0-8C0 .45.451 0 .99 0h4.02A.99.99 0 0 1 6 1.003v4.994C6 6.551 5.549 7 5.01 7H.99A.99.99 0 0 1 0 5.997zm7 0C7 .45 7.451 0 7.99 0h4.02A.99.99 0 0 1 13 1.003v4.994C13 6.551 12.549 7 12.01 7H7.99A.99.99 0 0 1 7 5.997zm7 0C14 .45 14.451 0 14.99 0h4.02A.99.99 0 0 1 20 1.003v4.994C20 6.551 19.549 7 19.01 7h-4.02A.99.99 0 0 1 14 5.997z"></path></svg>'
                    },
                    {
                        id: "editor-center",
                        label: "Editor Center",
                        icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M0 9.002C0 8.45.455 8 .992 8h18.016c.548 0 .992.456.992 1.002v9.996c0 .553-.455 1.002-.992 1.002H.992C.444 20 0 19.544 0 18.998zm0-8C0 .45.451 0 .99 0h4.02A.99.99 0 0 1 6 1.003v4.994C6 6.551 5.549 7 5.01 7H.99A.99.99 0 0 1 0 5.997zm7 0C7 .45 7.451 0 7.99 0h4.02A.99.99 0 0 1 13 1.003v4.994C13 6.551 12.549 7 12.01 7H7.99A.99.99 0 0 1 7 5.997zm7 0C14 .45 14.451 0 14.99 0h4.02A.99.99 0 0 1 20 1.003v4.994C20 6.551 19.549 7 19.01 7h-4.02A.99.99 0 0 1 14 5.997z"></path></svg>'
                    },
                    {
                        id: "editor-right",
                        label: "Editor Right",
                        icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="EditorHeaderViewSwitcherLayoutButtons-module_newPenRightLayout-X2VCi" width="20" height="20"><path d="M0 9.002C0 8.45.455 8 .992 8h18.016c.548 0 .992.456.992 1.002v9.996c0 .553-.455 1.002-.992 1.002H.992C.444 20 0 19.544 0 18.998zm0-8C0 .45.451 0 .99 0h4.02A.99.99 0 0 1 6 1.003v4.994C6 6.551 5.549 7 5.01 7H.99A.99.99 0 0 1 0 5.997zm7 0C7 .45 7.451 0 7.99 0h4.02A.99.99 0 0 1 13 1.003v4.994C13 6.551 12.549 7 12.01 7H7.99A.99.99 0 0 1 7 5.997zm7 0C14 .45 14.451 0 14.99 0h4.02A.99.99 0 0 1 20 1.003v4.994C20 6.551 19.549 7 19.01 7h-4.02A.99.99 0 0 1 14 5.997z"></path></svg>'
                    }
                ];
                options.forEach((opt) => {
                    const btn = document.createElement("button");
                    btn.className = "dropdown-btn";
                    btn.style.width = "100%";
                    btn.style.padding = "8px 12px";
                    btn.style.cursor = "pointer";
                    btn.style.textAlign = "center";
                    btn.innerHTML = `${opt.icon} ${opt.label}`;
                    btn.id = opt.id;
                    if (opt.id === currentLayout) btn.classList.add("active");
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        dropdown.querySelectorAll(".dropdown-btn").forEach(b => b.classList.remove("active"));
                        btn.classList.add("active");
                        currentLayout = opt.id;
                        applyEditorLayout(opt.id);
                        const editors = document.querySelector(".editor-container .editors");
                        if (opt.id === "editor-center") {
                            editors.style.flex = "0 0 400px";
                            editors.style.height = "400px";
                            editors.style.flexDirection = 'row';
                            editors.style.width = "100%";
                            setupEditorCenterResizers(document.querySelector(".editor-container"));
                        } else if (opt.id === "editor-right") {
                            setupEditorRightResize();
                            editors.style.flex = "0 0 600px";
                            editors.style.height = "100%";
                            editors.style.flexDirection = 'column';
                        } else if (opt.id === "editor-left") {
                            editors.style.flex = "0 0 600px";
                            editors.style.height = "100%";
                            editors.style.flexDirection = 'column';
                        }
                        dropdown.classList.remove("dropdown-show");
                        dropdown.classList.add("dropdown-hide");
                        setTimeout(() => dropdown.remove(), 300);
                    });
                    dropdown.appendChild(btn);
                });
                switchWrapper.appendChild(dropdown);
                function handleOutsideClick(event) {
                    if (!dropdown.contains(event.target) && event.target !== viewSwitcherBtn) {
                        dropdown.classList.remove("dropdown-show");
                        dropdown.classList.add("dropdown-hide");
                        setTimeout(() => dropdown.remove(), 300);
                        document.removeEventListener("click", handleOutsideClick);
                    }
                }
                document.addEventListener("click", handleOutsideClick);
            });
        }
    } else {
        container.classList.add("mobile-mode");
        container.classList.remove("desktop-mode");
        if (editors) {
            editors.style.flex = "1";
            editors.style.padding = "10px";
            editors.style.display = "flex";
            editors.style.flexDirection = "column";
            editors.style.width = "100%";
            editors.style.height = "auto";
        }
        container.querySelectorAll(
            ".horizontalResizer, .panel-width-resizer, .resize-handle, #resizerHorizontal"
        ).forEach(el => el.remove());
        container.querySelectorAll(".editor-panel").forEach(panel => {
            panel.style.flex = "";
            panel.style.height = "";
            panel.style.width = "";
        });
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", null);
        document.removeEventListener("mouseup", null);
        document.removeEventListener("pointermove", null);
        document.removeEventListener("pointerup", null);
    }
}
document.addEventListener("DOMContentLoaded", handleEditorResize);
window.addEventListener("resize", handleEditorResize);
function setupSidebarResize(sidebarSelector, defaultWidth = 600, defaultPanelHeights = []) {
    const container = document.querySelector(sidebarSelector);
    if (!container) return;
    const editors = container.querySelector('.editors');
    if (!editors) return;
    const initialWidth = defaultWidth;
    editors.style.flex = `0 0 ${initialWidth}px`;
    editors.style.width = `${initialWidth}px`;
    const resizer = document.getElementById('resizer');
    if (resizer) {
        let activePointerId = null;
        let isMouseDown = false;
        function stopCurrentResize() {
            if (activePointerId === null && !isMouseDown) return;
            try { resizer.releasePointerCapture?.(activePointerId); } catch (e) { }
            activePointerId = null;
            isMouseDown = false;
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointercancel', onPointerUp);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        function onPointerMove(e) {
            if (activePointerId !== null && e.pointerId !== activePointerId) return;
            const containerRect = container.getBoundingClientRect();
            let newWidth = e.clientX - containerRect.left;
            const maxWidth = window.innerWidth - containerRect.left;
            newWidth = Math.max(200, Math.min(maxWidth, newWidth));
            editors.style.flex = `0 0 ${newWidth}px`;
            editors.style.width = `${newWidth}px`;
        }
        function onPointerUp() { stopCurrentResize(); }
        function onPointerDown(e) {
            e.preventDefault();
            activePointerId = e.pointerId;
            try { e.target.setPointerCapture(activePointerId); } catch (e) { }
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
            document.addEventListener('pointercancel', onPointerUp);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }
        function onMouseMove(e) {
            if (!isMouseDown) return;
            const containerRect = container.getBoundingClientRect();
            let newWidth = e.clientX - containerRect.left;
            const maxWidth = window.innerWidth - containerRect.left;
            newWidth = Math.max(200, Math.min(maxWidth, newWidth));
            editors.style.flex = `0 0 ${newWidth}px`;
            editors.style.width = `${newWidth}px`;
        }
        function onMouseUp() { stopCurrentResize(); }
        if (window.PointerEvent) {
            resizer.addEventListener('pointerdown', onPointerDown);
            window.addEventListener('blur', stopCurrentResize);
            window.addEventListener('mouseout', (ev) => { if (!ev.relatedTarget) stopCurrentResize(); });
        } else {
            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                isMouseDown = true;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                document.body.style.cursor = 'ew-resize';
                document.body.style.userSelect = 'none';
            });
            window.addEventListener('blur', stopCurrentResize);
        }
    }
    const panels = Array.from(editors.querySelectorAll('.editor-panel'));
    if (panels.length < 2) return;
    editors.style.display = 'flex';
    editors.style.flexDirection = 'column';
    editors.style.height = '100%';
    const panelCount = panels.length;
    panels.forEach((panel, index) => {
        let heightPercent = defaultPanelHeights[index] ?? (100 / panelCount);
        panel.style.flex = `0 0 ${heightPercent}%`;
        panel.style.position = 'relative';
        if (index === panelCount - 1) return;
        const resizer = document.createElement('div');
        resizer.className = 'panel-resizer';
        Object.assign(resizer.style, {
            position: 'absolute',
            bottom: '-15px',
            left: '0',
            width: '100%',
            height: '6px',
            cursor: 'row-resize',
            background: 'rgba(255,255,255,0.2)',
            zIndex: 10
        });
        panel.appendChild(resizer);
        let startY = 0, prevStartHeight = 0, nextStartHeight = 0;
        const prevPanel = panel;
        const nextPanel = panels[index + 1];
        resizer.addEventListener('pointerdown', e => {
            e.preventDefault();
            startY = e.clientY;
            prevStartHeight = prevPanel.getBoundingClientRect().height;
            nextStartHeight = nextPanel.getBoundingClientRect().height;
            function moveHandler(e) {
                const dy = e.clientY - startY;
                const containerHeight = editors.getBoundingClientRect().height;
                let newPrevHeight = ((prevStartHeight + dy) / containerHeight) * 100;
                let newNextHeight = ((nextStartHeight - dy) / containerHeight) * 100;
                newPrevHeight = Math.max(10, newPrevHeight);
                newNextHeight = Math.max(10, newNextHeight);
                prevPanel.style.flex = `0 0 ${newPrevHeight}%`;
                nextPanel.style.flex = `0 0 ${newNextHeight}%`;
            }
            function stopHandler() {
                document.removeEventListener('pointermove', moveHandler);
                document.removeEventListener('pointerup', stopHandler);
                document.body.style.cursor = '';
            }
            document.addEventListener('pointermove', moveHandler);
            document.addEventListener('pointerup', stopHandler);
            document.body.style.cursor = 'row-resize';
        });
    });
}
function setupCenterResize(centerSelector) {
    const editorCenter = document.querySelector(centerSelector);
    if (!editorCenter) return;
    const editorsContainer = editorCenter.querySelector('.editors');
    editorsContainer.style.height = '400px';
    editorsContainer.style.minHeight = '100px';
    let hResizer = document.getElementById('resizerHorizontal');
    if (!hResizer) {
        hResizer = document.createElement('div');
        hResizer.id = 'resizerHorizontal';
        hResizer.className = 'resizer-horizontal';
        editorCenter.insertBefore(hResizer, editorsContainer);
        Object.assign(hResizer.style, {
            height: '5px', background: '#ccc', cursor: 'row-resize', userSelect: 'none'
        });
    }
    let isResizing = false, startY = 0, startHeight = 0;
    hResizer.addEventListener('mousedown', e => {
        e.preventDefault();
        isResizing = true;
        startY = e.clientY;
        startHeight = editorsContainer.offsetHeight;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', e => {
        if (!isResizing) return;
        const dy = e.clientY - startY;
        let newHeight = startHeight + dy;
        newHeight = Math.max(100, Math.min(800, newHeight));
        editorsContainer.style.height = `${newHeight}px`;
    });
    document.addEventListener('mouseup', () => {
        if (!isResizing) return;
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    });
}
setupSidebarResize('.editor-left');
setupCenterResize('.editor-center');
function setupEditorCenterResizers(container, minWidth = 50, minHeight = 100, maxHeight = 800) {
    if (!container) return;
    const editors = container.querySelector(".editors");
    if (!editors) return;
    container.style.position = "relative";
    editors.style.display = "flex";
    editors.style.flexDirection = "row";
    const existingH = container.querySelector(".horizontalResizer");
    if (existingH) existingH.remove();
    const hResizer = document.createElement("div");
    hResizer.className = "horizontalResizer";
    Object.assign(hResizer.style, {
        height: "5px",
        width: "100%",
        background: "#ccc",
        cursor: "row-resize",
        position: "absolute",
        bottom: "0",
        left: "0",
        zIndex: 100
    });
    editors.appendChild(hResizer);
    let startY = 0, startHeight = 0;
    hResizer.addEventListener("mousedown", e => {
        e.preventDefault();
        startY = e.clientY;
        startHeight = editors.offsetHeight;
        document.body.style.cursor = "row-resize";
        document.body.style.userSelect = "none";
        function onMove(ev) {
            const dy = ev.clientY - startY;
            const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + dy));
            editors.style.height = `${newHeight}px`;
            editors.style.flex = `0 0 ${newHeight}px`;
        }
        function onUp() {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp, { once: true });
    });
    const vPanels = Array.from(editors.querySelectorAll(".editor-panel"));
    if (!vPanels.length) return;
    container.querySelectorAll(".panel-width-resizer").forEach(r => r.remove());
    vPanels.forEach((panel, idx) => {
        if (idx === vPanels.length - 1) return;
        panel.style.position = "relative";
        const widthResizer = document.createElement("div");
        widthResizer.className = "panel-width-resizer";
        Object.assign(widthResizer.style, {
            position: "absolute",
            top: "0",
            right: "0",
            width: "5px",
            height: "100%",
            cursor: "ew-resize",
            background: "#ccc",
            zIndex: 100
        });
        panel.appendChild(widthResizer);
        const nextPanel = vPanels[idx + 1];
        widthResizer.addEventListener("mousedown", e => {
            e.preventDefault();
            const parentWidth = editors.getBoundingClientRect().width;
            const startX = e.clientX;
            const startCurrWidth = panel.getBoundingClientRect().width;
            const startNextWidth = nextPanel.getBoundingClientRect().width;
            document.body.style.cursor = "ew-resize";
            document.body.style.userSelect = "none";
            function onMove(ev) {
                const dx = ev.clientX - startX;
                let newCurrWidth = startCurrWidth + dx;
                let newNextWidth = startNextWidth - dx;
                if (newCurrWidth < minWidth || newNextWidth < minWidth) return;
                panel.style.flex = `0 0 ${(newCurrWidth / parentWidth) * 100}%`;
                nextPanel.style.flex = `0 0 ${(newNextWidth / parentWidth) * 100}%`;
            }
            function onUp() {
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
            }
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp, { once: true });
        });
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const editorCenter = document.querySelector(".editor-center");
    setupEditorCenterResizers(editorCenter);
});
function setupEditorRightResize({ minWidth = 200, defaultWidth = 600 } = {}) {
    const container = document.querySelector('.editor-container.editor-right, .editor-right');
    if (!container) return;
    const editors = container.querySelector('.editors');
    if (!editors) return;
    editors.querySelectorAll('.resize-handle').forEach(h => h.remove());
    editors.style.width = `${defaultWidth}px`;
    editors.style.flex = `0 0 ${defaultWidth}px`;
    editors.style.position = editors.style.position || 'relative';
    function createHandle(side) {
        const h = document.createElement('div');
        h.className = `resize-handle resize-handle-${side}`;
        Object.assign(h.style, {
            position: 'absolute',
            top: '0',
            bottom: '0',
            width: '5px',
            cursor: 'ew-resize',
            zIndex: 9999,
            touchAction: 'none',
            background: '#ccc'
        });
        if (side === 'left') h.style.left = '0';
        else h.style.left = '0';
        editors.appendChild(h);
        h.addEventListener('pointerdown', e => startResize(e, side));
        h.addEventListener('dblclick', () => {
            const curW = editors.getBoundingClientRect().width;
            if (Math.round(curW) < Math.round(window.innerWidth - 1)) {
                editors.style.width = `${window.innerWidth}px`;
                editors.style.flex = `0 0 ${window.innerWidth}px`;
            } else {
                editors.style.width = `${defaultWidth}px`;
                editors.style.flex = `0 0 ${defaultWidth}px`;
            }
        });
    }
    const containerRect = container.getBoundingClientRect();
    const containerCenter = (containerRect.left + containerRect.right) / 2;
    const viewportCenter = window.innerWidth / 2;
    if (container.classList.contains('editor-center')) {
        createHandle('left');
        createHandle('right');
    } else {
        const isVisuallyRight = containerCenter >= viewportCenter;
        createHandle(isVisuallyRight ? 'left' : 'right');
    }

    function startResize(pointerEvent, side) {
        pointerEvent.preventDefault();
        const startPointerX = pointerEvent.clientX;
        const startWidth = editors.getBoundingClientRect().width;
        try { pointerEvent.target.setPointerCapture(pointerEvent.pointerId); } catch (e) { }
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'ew-resize';
        function onMove(e) {
            let delta = e.clientX - startPointerX;
            let newWidth = startWidth - delta;
            newWidth = Math.max(minWidth, Math.min(window.innerWidth, newWidth));
            editors.style.width = `${newWidth}px`;
            editors.style.flex = `0 0 ${newWidth}px`;
        }
        function onUp() {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp, { once: true });
    }
}
document.addEventListener("DOMContentLoaded", handleEditorResize);
window.addEventListener("resize", handleEditorResize);
function applyEditorLayout(mode) {
    const editorContainer = document.querySelector(".editor-container");
    if (!editorContainer) return;
    editorContainer.classList.remove("editor-left", "editor-center", "editor-right");
    void editorContainer.offsetWidth;
    editorContainer.classList.add(mode);
    const overlay = document.createElement("div");
    overlay.className = "editor-overlay";
    const calendarAnimation = document.createElement("div");
    calendarAnimation.className = "calendar-animation";
    for (let i = 0; i < 9; i++) {
        const day = document.createElement("div");
        day.className = "day";
        calendarAnimation.appendChild(day);
    }
    overlay.appendChild(calendarAnimation);
    const typing = document.createElement("div");
    typing.className = "typing";
    overlay.appendChild(typing);
    editorContainer.style.position = "relative";
    editorContainer.appendChild(overlay);
    const text = "Applying layout...";
    let index = 0;
    const typeInterval = setInterval(() => {
        typing.textContent += text[index];
        index++;
        if (index >= text.length) clearInterval(typeInterval);
    }, 50);
    setTimeout(() => overlay.remove(), 800);
}
window.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('page-loader');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        loader.classList.add('hidden');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }, 1500);
});
function reloadWithLoader() {
    const loader = document.getElementById('page-loader');
    loader.classList.remove('hidden');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        location.reload();
    }, 300);
}
function showReloadAlert() {
    if (confirm("Do you want to reload the page?")) {
        reloadWithLoader();
    }
}
document.body.addEventListener("keydown", function (e) {
    const target = e.target;
    if (!target.matches(".editor-panel textarea")) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const panel = target.closest(".editor-panel");
        let panelType = "Unknown";
        if (panel.id === "html-panel") panelType = "HTML";
        else if (panel.id === "css-panel") panelType = "CSS";
        else if (panel.id === "js-panel") panelType = "JS";
        showPanelSavePopup(panel, `${panelType} code has been saved`);
    }
});
function showPanelSavePopup(panel, message) {
    const existingPopup = panel.querySelector(".save-popup");
    if (existingPopup) existingPopup.remove();
    const popup = document.createElement("div");
    popup.className = "save-popup";
    popup.textContent = message;
    Object.assign(popup.style, {
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "#4caf50",
        color: "#fff",
        padding: "5px 10px",
        borderRadius: "4px",
        fontSize: "12px",
        zIndex: 1000,
        opacity: 0,
        transition: "opacity 0.3s"
    });
    if (getComputedStyle(panel).position === "static") {
        panel.style.position = "relative";
    }
    panel.appendChild(popup);
    requestAnimationFrame(() => {
        popup.style.opacity = 1;
    });
    setTimeout(() => {
        popup.style.opacity = 0;
        setTimeout(() => popup.remove(), 300);
    }, 1500);
}
const tabButtons = document.querySelectorAll('.editor-sidebar button');
const editorPanels = document.querySelectorAll('.editor-panel');
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        editorPanels.forEach(panel => panel.classList.remove('active'));
        button.classList.add('active');
        const targetPanel = document.getElementById(button.dataset.editor);
        if (targetPanel) targetPanel.classList.add('active');
    });
});
function activateFirstTabOnMobile() {
    if (window.innerWidth <= 1024) {
        tabButtons[0].click();
    } else {
        editorPanels.forEach(panel => panel.classList.add('active'));
    }
}
window.addEventListener('resize', activateFirstTabOnMobile);
activateFirstTabOnMobile();
window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    e.returnValue = "Changes could not update if page get refresh.";
});
function loadScripts() {
    const editor = document.getElementById('js-editor');
    const functionsToInclude = [
        'showDateTimePicker',
        'showDatePicker',
        'showMonthYearPicker',
        'showTimePicker',
        'showDateRangePicker'
    ];

    let combinedCode = '';

    functionsToInclude.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            combinedCode += window[funcName].toString() + '\n\n';
            if (typeof window.initVinDatePickers === 'function') {
                combinedCode += window.initVinDatePickers.toString() + '\n\n';
            }
        }
    });
    editor.value = combinedCode;
}
window.addEventListener('load', loadScripts);
async function loadCSS() {
    const editor = document.getElementById('css-editor');
    const cssUrl = 'https://raw.githubusercontent.com/vinoth-elito/vin--datepicker__container/main/css/preview.css';

    try {
        const res = await fetch(cssUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        editor.value = await res.text();
    } catch (err) {
        editor.value = `/* Could not load ${cssUrl}: ${err.message} */`;
    }
}
loadCSS();