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
    }
}

function onClickSort() {
    if (!data)
        return

    sort++
    if (sort > 2)
        sort = 0
    let key
    switch (sort) {
        case 0:
            key = "Client"
            break;
        case 1:
            key = "Server tool"
            break;
        case  2:
            key = "User & Development tool"
            break;
    }
    document.getElementById("sort-text").innerText = `Sort by: ${key} contributions`
    updateLeaderboardData()
}

function updateLeaderboardData() {
    const element = document.getElementById("contributor-list")
    element.innerHTML = ""

    const sorted = Object.entries(data).sort(([ignored, a], [ignored2, b]) => getSortKey(b) - getSortKey(a))

    for (const [key, value] of sorted) {
        element.innerHTML += getEntryHtml(key, value.client || 0, value.server || 0, value.tool || 0)
    }
}

function getEntryHtml(name, clients, server, tools) {
    return "            <div class=\"contributor-card\">\n" +
        "                <div class=\"contributor-card-text\">\n" +
        `                    <p class=\"contributor-title\">${name}</p>\n` +
        `                    <o class=\"contributor-description\">Contributed clients: ${clients}, server tools: ${server}, user & development tools: ${tools}</o>\n` +
        "                </div>\n" +
        "\n" +
        "                <p class=\"contributor-level\">5</p>\n" +
        "            </div>"
}