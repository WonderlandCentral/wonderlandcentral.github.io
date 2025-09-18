let files = {};
let lastExpandedPaths = new Set();
let isSearching = false;

window.addEventListener('load', async () => {
    const loadingText = document.getElementById("loading-text");
    const loadingStates = ["Loading", "Loading.", "Loading..", "Loading..."];
    let loadingIndex = 0;

    const loadingInterval = setInterval(() => {
        loadingText.textContent = loadingStates[loadingIndex];
        loadingIndex = (loadingIndex + 1) % loadingStates.length;
    }, 500);

    const params = new URLSearchParams(window.location.search);
    const url = decodeURIComponent(params.get('url') || '');
    const name = decodeURIComponent(params.get('name') || '');

    if (!isValidZipUrl(url) || !name) {
        alert("Invalid/missing params");
        return;
    }

    try {
        const zip = await fetchAndLoadZip(url);
        files = await extractFiles(zip);

        document.getElementById("loading-wrapper").remove();
        clearInterval(loadingInterval);
        const element = document.getElementById("content-wrapper");

        const filesContainer = document.createElement("div");
        filesContainer.className = "files-container";

        const topBox = document.createElement("div");
        topBox.classList.add("box", "box-small-top");

        const header = document.createElement("p");
        header.classList.add("header");
        header.innerText = name;
        topBox.appendChild(header);

        const searchBox = document.createElement("div");
        searchBox.classList.add("box", "box-small-top", "box-search");

        const navContainer = document.createElement("div");
        navContainer.className = "container-navigation";
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.id = "search-bar";
        input.type = "text";
        input.placeholder = "Search...";
        input.addEventListener("input", () => update());
        label.appendChild(input);
        navContainer.append(label);
        searchBox.appendChild(navContainer);

        const filesBox = document.createElement("div");
        filesBox.classList.add("box", "box-files");
        filesBox.id = "filetree";

        filesContainer.append(topBox, searchBox, filesBox);

        const codeBox = document.createElement("div");
        codeBox.classList.add("box", "box-code");
        codeBox.id = "code";

        element.append(filesContainer, codeBox);

        update();
    } catch (err) {
        console.error("Error loading ZIP:", err);
        alert("Failed to load ZIP archive.");
    }
});

function isValidZipUrl(url) {
    return (url.startsWith("https://wonderland.sigmaclient.cloud/download.php?type=") || url.startsWith("https://wonderland.sigmaclient.cloud/v2/download.php?type=") || url.startsWith("https://files.catbox.moe/")) && url.endsWith(".zip");
}

async function fetchAndLoadZip(url) {
    const response = await fetch(url);
    const zipData = await response.arrayBuffer();
    return await JSZip.loadAsync(zipData);
}

async function extractFiles(zip) {
    const extracted = {};
    for (const [name, file] of Object.entries(zip.files)) {
        if (!file.dir) {
            extracted[name] = await file.async('string');
        }
    }
    return extracted;
}

function update() {
    const searchValue = document.getElementById("search-bar").value.trim().toLowerCase();
    const container = document.getElementById('filetree');

    const sortedPaths = Object.keys(files).sort();
    const fileTree = collapseTree(buildTree(sortedPaths));

    if (!isSearching)
        lastExpandedPaths = getCurrentlyExpandedPaths();

    if (!searchValue && isSearching)
        isSearching = false;

    container.innerHTML = '';

    let expandedPaths;

    if (searchValue) {
        expandedPaths = new Set();
        isSearching = true;
        for (const fullPath of sortedPaths) {
            const split = fullPath.split("/");
            if (split[split.length - 1].toLowerCase().includes(searchValue)) {
                console.log(fullPath);
                const parts = fullPath.split('/');
                let path = '';
                for (let i = 0; i < parts.length - 1; i++) {
                    path += parts[i] + '/';
                    expandedPaths.add(path);
                }
            }
        }
    } else {
        expandedPaths = new Set(lastExpandedPaths);
    }

    container.appendChild(renderTree(fileTree, '', 0, expandedPaths, searchValue));
}

function buildTree(paths) {
    const root = {};
    for (const path of paths) {
        const parts = path.split('/');
        let node = root;
        parts.forEach((part, index) => {
            if (!node[part]) {
                node[part] = index === parts.length - 1 ? null : {};
            }
            node = node[part] || {};
        });
    }
    return root;
}

function collapseTree(node) {
    const result = {};
    for (const key in node) {
        let currentKey = key;
        let child = node[key];

        while (
            child && typeof child === 'object' &&
            Object.keys(child).length === 1 &&
            child[Object.keys(child)[0]] !== null
            ) {
            const [nextKey] = Object.keys(child);
            currentKey += '/' + nextKey;
            child = child[nextKey];
        }

        result[currentKey] = (child && typeof child === 'object') ? collapseTree(child) : child;
    }
    return result;
}

function renderTree(node, currentPath, depth, expandedPaths = new Set(), searchTerm = undefined) {
    const ul = document.createElement('ul');

    const entries = Object.entries(node).sort(([aName, aVal], [bName, bVal]) => {
        const aIsDir = aVal !== null;
        const bIsDir = bVal !== null;

        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return aName.localeCompare(bName);
    });

    for (const [name, child] of entries) {
        const li = document.createElement('li');

        if (child) {
            const dir = document.createElement('span');
            dir.classList.add('directory');

            const indicator = document.createElement('span');
            indicator.classList.add('expand-indicator');
            indicator.textContent = '▶';

            const dirName = document.createElement('span');
            dirName.textContent = name;
            dirName.classList.add('dir-name');

            processColors(dirName, name, true);
            if (depth === 0 && entries.length === 1) dirName.classList.add('color_top');

            dir.append(indicator, dirName);

            const nested = renderTree(child, `${currentPath}${name}/`, depth + 1, expandedPaths, searchTerm);
            nested.classList.add('nested');

            if (expandedPaths.has(`${currentPath}${name}/`)) {
                nested.classList.add('active');
                indicator.classList.add('expanded');
            }

            dir.addEventListener('click', () => {
                nested.classList.toggle('active');
                indicator.classList.toggle('expanded');
            });

            li.append(dir, nested);
        } else {
            if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase()))
                continue;

            const fileEl = document.createElement('span');
            fileEl.textContent = name;
            fileEl.classList.add('file');

            processColors(fileEl, name, false);
            fileEl.addEventListener('click', () => displayFileContent(currentPath + name, name));

            li.appendChild(fileEl);
        }

        ul.appendChild(li);
    }

    return ul;
}

function getCurrentlyExpandedPaths() {
    const paths = new Set();
    const items = document.querySelectorAll('#filetree span.directory');

    items.forEach(dirSpan => {
        const indicator = dirSpan.querySelector('.expand-indicator');
        if (indicator && indicator.classList.contains('expanded')) {
            let path = '';
            let current = dirSpan;
            while (current && current.closest('li')) {
                const dir = current.querySelector('.dir-name');
                if (dir) path = dir.textContent + '/' + path;
                current = current.closest('li').parentElement.closest('li')?.querySelector('.directory');
            }
            paths.add(path);
        }
    });

    return paths;
}

function processColors(el, name, isDir) {
    if (name.startsWith('.')) el.classList.add('color_hidden');

    if (isDir) {
        if (name === 'src' || name.startsWith('src')) el.classList.add('color_src');
        if (name === 'gradle') el.classList.add('color_gradle');
    } else {
        const gradleFiles = new Set([
            "build.gradle",
            "gradle.properties",
            "gradlew",
            "gradlew.bat",
            "settings.gradle",
            "gradle-wrapper.jar",
            "gradle-wrapper.properties"
        ]);

        if (gradleFiles.has(name)) el.classList.add('color_gradle');
        if (name.endsWith('.java')) el.classList.add('color_java');
    }
}

function displayFileContent(fullPath, filename) {
    let content = files[fullPath];

    function isProbablyBinary(str) {
        const sample = str.slice(0, 1000);
        let nonPrintable = 0;
        for (let i = 0; i < sample.length; i++) {
            const charCode = sample.charCodeAt(i);
            if (charCode < 9 || (charCode > 13 && charCode < 32) || charCode === 65533) {
                nonPrintable++;
            }
        }
        const ratio = nonPrintable / sample.length;
        return ratio > 0.1;
    }

    const extension = filename.split('.').pop().toLowerCase();

    const languageMap = {
        js: 'javascript', mjs: 'javascript', cjs: 'javascript',
        ts: 'typescript', jsx: 'jsx', tsx: 'tsx',
        json: 'json', java: 'java', class: 'java',
        py: 'python', rb: 'ruby', php: 'php', pl: 'perl',
        sh: 'bash', bash: 'bash', zsh: 'bash', bat: 'batch',
        ps1: 'powershell', c: 'c', h: 'c', cpp: 'cpp',
        cc: 'cpp', cxx: 'cpp', hpp: 'cpp', cs: 'csharp',
        go: 'go', rs: 'rust', swift: 'swift', kt: 'kotlin',
        kotlin: 'kotlin', scala: 'scala', sql: 'sql',
        html: 'markup', xml: 'markup', svg: 'markup',
        css: 'css', scss: 'scss', sass: 'sass', less: 'less',
        yaml: 'yaml', yml: 'yaml', ini: 'ini', toml: 'toml',
        md: 'markdown', markdown: 'markdown', txt: 'clike',
        dockerfile: 'docker', makefile: 'makefile', cmake: 'cmake',
        asm: 'asm6502', lua: 'lua', r: 'r', vb: 'vbnet',
        tex: 'latex', graphql: 'graphql'
    };

    let lang = languageMap[extension] || 'clike';

    const codeDiv = document.getElementById('code');
    if (!content || isProbablyBinary(content)) {
        lang = "markdown";
        content = `Unable to display ${filename}`;
    }

    codeDiv.innerHTML = `<pre class="code-container"><code class="language-${lang}">${Prism.highlight(content, Prism.languages[lang] || Prism.languages.clike, lang)}</code></pre>`;
}