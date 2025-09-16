let name = null;
let secondary = null;
let entries = new Map();
let currentType = null;
let buttonMap = new Map();
let sortByTime = false;

function isSource() {
    return currentType === 'cs' || currentType === 'ps' || currentType === 'ut' || currentType === 'dt' || currentType.startsWith('s_');
}

function prepareData(type) {
    currentType = type;
    switch (type) {
        case 'cb':
            name = "Client Binaries";
            break;
        case 'cs':
            name = "Client Sources";
            break;
        case 'pb':
            name = "Server tool Binaries";
            secondary = "https://gist.githubusercontent.com/ayaxperson/fa5d87b3a7cd749b4335c0204ee501c9/raw/857fea7242ba775772057a2ba4b29e30913de7fe/gistfile1.txt";
            break;
        case 'ps':
            name = "Server tool Sources";
            secondary = "https://gist.githubusercontent.com/ayaxperson/0e2e2e54558809fbbae3f2c9f1463c9b/raw/b1ce677e6be94d7e901d7a9c5104128ec1827d7a/gistfile2.txt";
            break;
        case 'ut':
            name = "User Tools";
            break;
        case 'dt':
            name = "Development Tools";
            break;
        case "s_lb":
            name = "LiquidBounce scripts";
            break;
        case "s_rn":
            name = "Raven scripts";
            break;
        case "s_ao":
            name = "Astolfo scripts";
            break;
        default:
            throw "Unknown type " + type;
    }

    fetch('https://wonderland.sigmaclient.cloud/v2/list.php?type=' + type)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }).then(data => {
        for (let client of data) {
            const name = client["name"];

            const link = isSource()
                ? `https://wonderland.sigmaclient.cloud/v2/download.php?type=${currentType}&file=${encodeURIComponent(name)}`
                : `https://wonderland.sigmaclient.cloud/v2/genlink.php?type=${currentType}&folder=${encodeURIComponent(name)}`;

            entries.set(client, link);
        }
        writeDataToUi();
        })
        .catch(error => {
            console.error('Error fetching featured clients:', error);
        });

    if (secondary != null) {
        fetch(secondary)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            }).then(data => {
            for (let client of data) {
                entries.set(client, client["url"]);
            }
            writeDataToUi();
        })
            .catch(error => {
                console.error('Error fetching featured clients:', error);
            });
    }
}

const entryGrid = document.getElementById('entry-grid');

function writeDataToUi() {
    if (isSource()) {
        entryGrid.style.gridAutoRows = "130px"
    }

    document.getElementById('header').innerText = name;
    entryGrid.innerHTML = "";

    for (const [key, value] of sortMap(entries)) {
        const button = getButton(key, value.link);
        entryGrid.appendChild(button);
        buttonMap.set(key.name.trim(), button);
    }
}

function sortMap(map) {
    return new Map([...map.entries()].sort((a, b) => {
        if (sortByTime) {
            return (b[0]["lastModified"] || 0) - (a[0]["lastModified"] || 0); // Descending time
        } else {
            return a[0]["name"].localeCompare(b[0]["name"]); // Alphabetical
        }
    }));
}

function getButton(client, link) {
    if (isSource()) {
        const gridEntry = document.createElement("div");
        gridEntry.className = "grid-entry";

        const span = document.createElement("span");
        span.innerText = client["name"].trim();
        gridEntry.appendChild(span);

        if (isSource()) {
            const subButtonsWrapper = document.createElement("div");
            subButtonsWrapper.className = "grid-entry-sub-button-container";

            const downloadButtonWrapper = document.createElement("a");
            downloadButtonWrapper.href = link;

            const downloadButton = document.createElement("div");
            downloadButton.className = "grid-sub-button";

            const downloadText = document.createElement("span");
            downloadText.innerText = "Download";
            downloadButton.appendChild(downloadText);

            downloadButtonWrapper.appendChild(downloadButton)
            subButtonsWrapper.appendChild(downloadButtonWrapper);

            //

            const browseButtonWrapper = document.createElement("a");
            browseButtonWrapper.href = "codeview.html?url=" + encodeURIComponent(link) + "&name=" + encodeURIComponent(entryName);

            const browseButton = document.createElement("div");
            browseButton.className = "grid-sub-button";

            const browseText = document.createElement("span");
            browseText.innerText = "Browse";
            browseButton.appendChild(browseText);

            browseButtonWrapper.appendChild(browseButton)
            subButtonsWrapper.appendChild(browseButtonWrapper);

            gridEntry.appendChild(subButtonsWrapper)
        }

        return gridEntry;
    } else {
        const wrapper = document.createElement('a');
        wrapper.className = "grid-entry-wrapper";
        wrapper.href = link;

        const gridEntry = document.createElement("div");
        gridEntry.className = "grid-entry";

        const clientText = document.createElement("div");
        clientText.className = "client-text";

        const span = document.createElement("span");
        span.innerText = client["name"].trim();
        span.className = "client-name";
        clientText.appendChild(span);

        const tags = document.createElement("div")
        tags.className = "client-tags";

        if (client["infected"] === "yes")
            tags.appendChild(createTag("Safe: X", "bad"));
        else if (client["infected"] === "no")
            tags.appendChild(createTag("Safe: ✔", "good"));
        else
            tags.appendChild(createTag("Safe: ?", "idk"));

        if (client["runnable"] === "yes")
            tags.appendChild(createTag("Runnable: ✔", "good"));
        else if (client["runnable"] === "no")
            tags.appendChild(createTag("Runnable: X", "bad"));
        else
            tags.appendChild(createTag("Runnable: ?", "idk"));

        if (client["release"] === "free")
            tags.appendChild(createTag("Free", "good"));
        else if (client["release"] === "crack")
            tags.appendChild(createTag("Crack", "good"));
        else if (client["release"] === "leak")
            tags.appendChild(createTag("Leak", "bad"));

        clientText.appendChild(tags);

        gridEntry.appendChild(clientText);

        wrapper.append(gridEntry);

        return wrapper;
    }
}

function createTag(name, type) {
    const tag = document.createElement("h");
    tag.innerText = name;
    tag.classList.add("client-tag");
    tag.classList.add(`tag-${type}`);
    return tag;
}

const searchBar = document.getElementById("search-bar");

searchBar.addEventListener("input", () => {
    const searchTerm = searchBar.value.trim();

    if (searchTerm && searchTerm.length >= 1) {
        for (const [name, button] of buttonMap) {
            if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
                button.style.display = "flex";
            } else {
                button.style.display = "none";
            }
        }
    } else {
        for (const [, button] of buttonMap) {
            button.style.display = "flex";
        }
    }
});

window.addEventListener('load', () => {
    const paramsString = window.location.search;
    const searchParams = new URLSearchParams(paramsString);

    const type = searchParams.get('type');

    prepareData(type);
});

document.getElementById("sort-toggle").addEventListener("click", () => {
    sortByTime = !sortByTime;
    const button = document.getElementById("sort-toggle");
    button.innerText = sortByTime ? "Sort: Newly uploaded" : "Sort: A → Z";
    writeDataToUi();
});