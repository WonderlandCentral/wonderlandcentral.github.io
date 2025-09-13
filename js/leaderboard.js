let data

window.addEventListener('load', async () => {
    fetch('https://wonderland.sigmaclient.cloud/contributors.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
        }).then(parsed => {
            data = parsed
            updateLeaderboardData()
    })
        .catch(error => {
            console.error('Error fetching credits:', error)
        })
})

/**
 * 0 - client
 * 1 - server
 * 2 - tools
 */
let sort = 0

function getSortKey(value) {
    switch (sort) {
        case 0:
            return value.client || 0
        case 1:
            return value.server || 0
        case 2:
            return value.tool || 0
        case 3:
            return Math.max(getLevelValue(value.client || 0, 2), getLevelValue(value.server || 0, 5), getLevelValue(value.tools || 0, 5));
    }
}

function onClickSort() {
    if (!data)
        return

    sort++
    if (sort > 3)
        sort = 0
    let key
    switch (sort) {
        case 0:
            key = "Client contributions"
            break;
        case 1:
            key = "Server tool contributions"
            break;
        case 2:
            key = "User & Development tool contributions"
            break;
        case 3:
            key = "Level"
            break;
    }
    document.getElementById("sort-text").innerText = `Sort by: ${key}`
    updateLeaderboardData()
}

function updateLeaderboardData() {
    const element = document.getElementById("contributor-list")
    element.innerHTML = ""

    const sorted = Object.entries(data).sort(([ignored, a], [ignored2, b]) => getSortKey(b) - getSortKey(a))

    for (const [key, value] of sorted) {
        const icon = value["icon"] == null ? undefined : `https://cdn.discordapp.com/avatars/${value["id"]}/${value["icon"]}.webp?size=100`
        console.log(value)
        console.log(icon)
        element.innerHTML += getEntryHtml(key, value.client || 0, value.server || 0, value.tool || 0, icon)
    }
}

function getEntryHtml(name, clients, server, tools, src) {
    const iconHtml = src
        ? `<div class='contributor-icon-container'>
                <img class='contributor-icon' alt='contributor-icon' src='${src}'>
           </div>`
        : `<div class="contributor-card-margin"></div>`;

    return `<div class="contributor-card">
                ${iconHtml}
                <div class="contributor-card-text">
                    <p class="contributor-title">${name}</p>
                    <o class="contributor-description">
                        Contributed clients: ${clients}, server tools: ${server}, user & development tools: ${tools}
                    </o>
                </div>
                <p class="contributor-level">
                    ${Math.max(
        getLevelValue(clients, 2),
        getLevelValue(server, 5),
        getLevelValue(tools, 5)
    )}
                </p>
            </div>`;
}


function getLevelValue(a, b) {
    if (a === 0) return 0;

    let level = 1;
    let lower = 1;
    let upper = b;

    while (true) {
        if (a >= lower && a <= upper) {
            return level;
        }
        level++;
        lower = upper + 1;
        upper = b * Math.pow(2, level - 1);
    }
}